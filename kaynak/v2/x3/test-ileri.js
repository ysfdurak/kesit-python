/* PythonPatika — 'test-ileri' uzantısı (AUDIT 12, Derinleş + ek alıştırmalar) */
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
  {
    id: 'test-ileri',
    min: 30,
    html: `<p>Mock ve fake'ler hızlıdır ama bir noktada gerçek parçalarla da sınaman gerekir: SQL sorgun PostgreSQL'de gerçekten çalışıyor mu, API'n yayımladığı sözleşmeye uyuyor mu, sistem yük altında ne kadar dayanıyor? Bu bölüm test piramidinin üst katlarını uygulamalı olarak açıyor: gerçek veritabanıyla entegrasyon testi, sözleşme testi ve yük testi.</p>
<h2>Gerçek veritabanı, temiz durum: transaction rollback fixture</h2>
<p>Entegrasyon testlerinin en büyük sorunu durumdur: bir testin eklediği satır diğerini bozar. Her testte veritabanını sıfırdan kurmak yavaştır. Yaygın çözüm, her testi <b>geri alınacak bir transaction</b> içinde çalıştırmaktır: test başında <code>BEGIN</code>, sonunda <code>ROLLBACK</code>. Test istediği kadar yazar, iz bırakmaz. Test edilen kod kendi içinde <code>commit()</code> çağırıyorsa, dış transaction'ı korumak için iç işlemleri bir <b>savepoint</b>'e (iç içe transaction) bağlarsın.</p>
<pre class="code"># conftest.py (SQLAlchemy 2.0 + pytest)
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

@pytest.fixture(scope="session")
def engine():
    from testcontainers.postgres import PostgresContainer    # pip install testcontainers
    with PostgresContainer("postgres:16") as pg:             # gerçek PostgreSQL, geçici konteyner
        eng = create_engine(pg.get_connection_url())
        Base.metadata.create_all(eng)                        # ya da: alembic upgrade head
        yield eng

@pytest.fixture
def db(engine):
    with engine.connect() as conn:
        dis = conn.begin()                                   # dış transaction
        oturum = Session(bind=conn, join_transaction_mode="create_savepoint")
        yield oturum                                         # kodun commit'i yalnız savepoint'i kapatır
        oturum.close()
        dis.rollback()                                       # her şey geri alınır</pre>
<p><b>testcontainers</b>, test oturumu başında Docker'da gerçek bir PostgreSQL (ya da Redis, Kafka) başlatır ve sonunda siler. SQLite ile test edip PostgreSQL'de çalıştırmak, <code>ILIKE</code>, JSONB, eşzamanlı kilitler ve tarih fonksiyonlarındaki farkları kaçırır. CI'da Docker varsa bu yaklaşım pratik ve güvenilirdir. Aynı fikrin sqlite3 ile çalışan küçük hâli:</p>
<pre class="py">import sqlite3
from contextlib import contextmanager

conn = sqlite3.connect(":memory:", isolation_level=None)    # transaction'ları elle yönet
conn.execute("CREATE TABLE siparis (id INTEGER PRIMARY KEY, tutar REAL)")
conn.execute("INSERT INTO siparis (tutar) VALUES (100)")

@contextmanager
def test_islemi(c):
    c.execute("BEGIN")
    try:
        yield c
    finally:
        c.execute("ROLLBACK")

def siparis_ekle(c, tutar):            # test edilen kod: kendi savepoint'ini açar ve kapatır
    c.execute("SAVEPOINT ekle")
    c.execute("INSERT INTO siparis (tutar) VALUES (?)", (tutar,))
    c.execute("RELEASE ekle")

with test_islemi(conn) as c:
    siparis_ekle(c, 250)
    print("test içinde:", c.execute("SELECT COUNT(*) FROM siparis").fetchone()[0])
print("test sonrası:", conn.execute("SELECT COUNT(*) FROM siparis").fetchone()[0])</pre>
<h2>Sözleşme testi: API'n söz verdiği gibi mi?</h2>
<p>Bir API'nin sözleşmesi OpenAPI belgesidir: hangi uç nokta, hangi alanlar, hangi türler, hangileri zorunlu. FastAPI bu belgeyi koddan üretir; ama istemciler (mobil uygulama, başka ekip) belgeye güvenir. İki tür sözleşme testi vardır:</p>
<div class="tbl-wrap"><table><tr><th>Yaklaşım</th><th>Nasıl?</th><th>Araç</th></tr>
<tr><td>Şemaya karşı test</td><td>Gerçek yanıtları OpenAPI şemasıyla doğrula; şemadan rastgele istekler üretip sunucuyu zorla</td><td>schemathesis, openapi-core</td></tr>
<tr><td>Tüketici güdümlü (consumer-driven)</td><td>Her istemci beklediği alanları bir sözleşme dosyasına yazar; sağlayıcı CI'da bu dosyalara karşı test edilir</td><td>Pact</td></tr>
<tr><td>Kırıcı değişiklik denetimi</td><td>Yeni şemayı eskisiyle karşılaştır; alan silme, tür değiştirme, yeni zorunlu alan = kırıcı</td><td>oasdiff, openapi-diff</td></tr></table></div>
<pre class="code">schemathesis run http://localhost:8000/openapi.json --checks all   # şemadan yüzlerce istek üretir</pre>
<h2>Yük testi: ne kadar dayanır?</h2>
<p>Yük testi (load test), gerçekçi eşzamanlı kullanıcı trafiği altında yanıt sürelerini ve hata oranını ölçer. Python dünyasında en yaygın araç <b>locust</b>'tır: kullanıcı davranışını Python sınıfı olarak yazarsın.</p>
<pre class="code"># locustfile.py   →   locust -f locustfile.py --host http://localhost:8000 -u 200 -r 20 -t 5m --headless
from locust import HttpUser, task, between

class Musteri(HttpUser):
    wait_time = between(1, 3)            # kullanıcılar arası düşünme süresi

    @task(5)                             # ağırlık: listeleme 5 kat sık
    def urunler(self):
        self.client.get("/urunler?sayfa=1")

    @task(1)
    def siparis(self):
        self.client.post("/siparisler", json={"urun_id": 7, "adet": 1})</pre>
<p>Ortalamaya değil <b>yüzdeliklere</b> bak: p95 = 480 ms, isteklerin %95'inin 480 ms'den kısa sürdüğünü söyler. Ortalama, birkaç çok yavaş isteği gizler; o yavaş istekler genellikle en çok sipariş veren müşterilerinkidir. Hedefleri SLO (hizmet düzeyi hedefi) olarak yaz: "p95 &lt; 500 ms, hata oranı &lt; %1, 200 eşzamanlı kullanıcıda". Yük testini prod'a değil, prod benzeri staging ortamına uygula.</p>
<div class="note"><b>Gerçek işte</b>Backend ekiplerinde tipik test dağılımı: çok sayıda hızlı birim testi, her depo ve sorgu için rollback fixture'lı entegrasyon testleri, CI'da sözleşme ve kırıcı değişiklik denetimi, büyük sürümlerden önce staging'de yük testi. Mülakatta "Entegrasyon testlerinde veritabanını nasıl izole ediyorsun?" sorusuna transaction rollback cevabı beklenir.</div>`,
    ex: [
      {
        t: 'mc',
        id: 'test-ileri-y1',
        stage: 'Isınma',
        q: 'Her entegrasyon testini bir transaction içinde çalıştırıp sonunda <code>ROLLBACK</code> yapmanın temel kazancı nedir?',
        o: [
          'Testler gerçek veritabanı yerine bellekte çalışır',
          'Her test temiz durumla başlar ve şemayı yeniden kurma maliyeti olmaz',
          'Test edilen kodun commit çağrıları hata verir ve böylece yakalanır',
          'Testler paralel çalışırken birbirinin verisini görebilir'
        ],
        a: 1,
        why: 'Rollback, testin yazdığı her şeyi milisaniyeler içinde geri alır; şemayı her testte kurmak ya da tabloları boşaltmak çok daha yavaştır. Kod commit çağırıyorsa savepoint ile dış transaction korunur. Testler hâlâ gerçek veritabanıyla çalışır.'
      },
      {
        t: 'mc',
        id: 'test-ileri-y2',
        stage: 'Isınma',
        q: 'Yük testinde ortalama yanıt süresi 120 ms, p99 ise 2.400 ms. Bu ne anlama gelir?',
        o: [
          'Sistem sağlıklı; ortalama hedefin altında',
          'İsteklerin %1\'i 2,4 saniyeden uzun sürüyor; kuyruk gecikmesi incelenmeli',
          'Ölçüm hatalı; p99 ortalamanın en fazla iki katı olabilir',
          'İsteklerin %99\'u 2,4 saniyeden uzun sürüyor ve sistem çökmek üzere'
        ],
        a: 1,
        why: 'p99, isteklerin %99\'unun bu sürenin altında kaldığını söyler; demek ki %1\'i 2,4 sn\'yi aşıyor. Ortalama bu kuyruğu gizler. Yavaş kuyruk genellikle kilit beklemesi, havuz tükenmesi ya da çöp toplama gibi sorunlara işaret eder.'
      },
      {
        t: 'predict',
        id: 'test-ileri-y3',
        stage: 'Kodu oku',
        q: 'Savepoint ve dış transaction: bu kod ne yazdırır?',
        o: ['2 0', '3 0', '2 2', '1 0'],
        a: 0,
        code: 'import sqlite3\nc = sqlite3.connect(":memory:", isolation_level=None)\nc.execute("CREATE TABLE t (x INTEGER)")\nc.execute("BEGIN")\nc.execute("INSERT INTO t VALUES (1)")\nc.execute("SAVEPOINT s")\nc.execute("INSERT INTO t VALUES (2)")\nc.execute("ROLLBACK TO s")\nc.execute("INSERT INTO t VALUES (3)")\nara = c.execute("SELECT COUNT(*) FROM t").fetchone()[0]\nc.execute("ROLLBACK")\nprint(ara, c.execute("SELECT COUNT(*) FROM t").fetchone()[0])\n',
        why: 'ROLLBACK TO s yalnız savepoint\'ten sonraki 2\'yi geri alır; ara noktada tabloda 1 ve 3 vardır. Dış ROLLBACK ise transaction içindeki her şeyi siler. Test fixture\'ı bu ikinci adımla her testi temiz bırakır.'
      },
      {
        t: 'order',
        id: 'test-ileri-y4',
        stage: 'Kodu oku',
        q: '<p>Testi transaction içinde çalıştırıp sonunda geri alan bağlam yöneticisini (fixture benzeri) ve kullanımını sırala. Beklenen çıktı:</p><pre class="out">içeride 1\ndışarıda 0</pre>',
        lines: [
          'import sqlite3',
          'from contextlib import contextmanager',
          'conn = sqlite3.connect(":memory:", isolation_level=None)',
          'conn.execute("CREATE TABLE musteri (ad TEXT)")',
          '@contextmanager',
          'def islem(c):',
          '    c.execute("BEGIN")',
          '    yield c',
          '    c.execute("ROLLBACK")'
        ],
        tests: 'with islem(conn) as c:\n    c.execute("INSERT INTO musteri VALUES (\'Ece\')")\n    print("içeride", c.execute("SELECT COUNT(*) FROM musteri").fetchone()[0])\nprint("dışarıda", conn.execute("SELECT COUNT(*) FROM musteri").fetchone()[0])\nassert conn.execute("SELECT COUNT(*) FROM musteri").fetchone()[0] == 0, "Rollback sonrası tablo boş olmalı"\n',
        hint: 'Dekoratör fonksiyonun hemen üstünde olmalı; BEGIN yield\'den önce, ROLLBACK sonra.',
        why: 'contextmanager, yield\'den önceki kısmı with bloğuna girerken, sonrasını çıkarken çalıştırır. Gerçek fixture\'da ROLLBACK\'i try/finally içine koyarsın ki test başarısız olsa bile geri alınsın.'
      },
      {
        t: 'code',
        id: 'test-ileri-y5',
        stage: 'Rehberli',
        diff: 2,
        needs: ['sqlite3'],
        q: '<p>Gerçek Anadolu Market verisiyle izole entegrasyon testi. <code>test_islemi(conn)</code> bağlam yöneticisini yaz: girişte <code>BEGIN</code> çalıştırıp bağlantıyı versin, çıkışta (hata olsa bile) <code>ROLLBACK</code> yapsın. Testler <code>veri.baglan("anadolu_market", tablolar=["products"])</code> ile açılan bağlantıda ürün fiyatlarını değiştirip geri alınmasını denetler.</p>',
        guide: ['@contextmanager ile bir üreteç fonksiyon yaz.', 'Bağlantıyı isolation_level=None yap ki BEGIN/ROLLBACK\'i sen yönet.', 'c.execute("BEGIN") sonra try: yield c, finally: c.execute("ROLLBACK").'],
        example: 'from contextlib import contextmanager\n\n@contextmanager\ndef zamanla(ad):\n    print(ad, "başladı")\n    try:\n        yield\n    finally:\n        print(ad, "bitti")\n\nwith zamanla("rapor"):\n    print("çalışıyor")\n',
        start: 'import veri\nfrom contextlib import contextmanager\n\n@contextmanager\ndef test_islemi(conn):\n    conn.isolation_level = None\n    # TODO: BEGIN\n    yield conn\n    # TODO: hata olsa bile ROLLBACK\n',
        sol: 'import veri\nfrom contextlib import contextmanager\n\n@contextmanager\ndef test_islemi(conn):\n    conn.isolation_level = None\n    conn.execute("BEGIN")\n    try:\n        yield conn\n    finally:\n        conn.execute("ROLLBACK")\n',
        tests: 'conn = veri.baglan("anadolu_market", tablolar=["products"])\nonce = conn.execute("SELECT ROUND(SUM(price), 2), COUNT(*) FROM products").fetchone()\nwith test_islemi(conn) as c:\n    c.execute("UPDATE products SET price = price * 2")\n    c.execute("DELETE FROM products WHERE category = \'Kitap\'")\n    ara = c.execute("SELECT COUNT(*) FROM products").fetchone()[0]\nassert ara < once[1], "Test içinde silme görünmeli"\nassert conn.execute("SELECT ROUND(SUM(price), 2), COUNT(*) FROM products").fetchone() == once, "Blok bitince fiyatlar ve silinen ürünler geri gelmeli"\ntry:\n    with test_islemi(conn) as c:\n        c.execute("DELETE FROM products")\n        raise AssertionError("test başarısız")\nexcept AssertionError:\n    pass\nassert conn.execute("SELECT COUNT(*) FROM products").fetchone()[0] == 40, "Başarısız testten sonra da 40 ürün geri gelmeli (finally)"\n',
        hints: ['Rollback hata durumunda da çalışmalı: try/finally.', 'yield\'den önce BEGIN, finally içinde ROLLBACK.', 'conn.execute("BEGIN"); try: yield conn; finally: conn.execute("ROLLBACK")'],
        why: 'Başarısız testler en çok kirli durum bırakanlardır; finally olmadan bir testin hatası, sonraki tüm testleri yanlış veriyle çalıştırır. pytest fixture\'ında yield sonrası kod zaten hata olsa da çalışır, ama bağlam yöneticisinde bunu sen garanti etmelisin.'
      },
      {
        t: 'code',
        id: 'test-ileri-y6',
        stage: 'Kendin yaz',
        diff: 2,
        q: '<p>Şemaya karşı sözleşme testi için küçük bir doğrulayıcı yaz: <code>sema_hatalari(deger, sema, yol="$")</code>, OpenAPI/JSON Schema\'nın şu alt kümesini desteklesin: <code>type</code> (<code>object</code>, <code>array</code>, <code>string</code>, <code>integer</code>, <code>number</code>, <code>boolean</code>), <code>nullable</code>, <code>required</code>, <code>properties</code>, <code>items</code>, <code>enum</code>. Hataları <code>"&lt;yol&gt;: &lt;neden&gt;"</code> listesi olarak döndür. Yollar <code>$.musteri.ad</code>, <code>$.kalemler[0].adet</code> biçiminde. Nedenler: <code>"tür"</code>, <code>"zorunlu"</code>, <code>"enum"</code>. Bir değerin türü yanlışsa onun alt alanlarına bakma. <code>integer</code> için bool kabul edilmez; <code>number</code> int\'i de kabul eder.</p>',
        start: 'def sema_hatalari(deger, sema, yol="$"):\n    return []\n',
        sol: 'TURLER = {"object": dict, "array": list, "string": str, "boolean": bool}\n\ndef _tur_uyar(v, t):\n    if t == "integer":\n        return isinstance(v, int) and not isinstance(v, bool)\n    if t == "number":\n        return isinstance(v, (int, float)) and not isinstance(v, bool)\n    return isinstance(v, TURLER[t])\n\ndef sema_hatalari(deger, sema, yol="$"):\n    if deger is None:\n        return [] if sema.get("nullable") else [f"{yol}: tür"]\n    if "type" in sema and not _tur_uyar(deger, sema["type"]):\n        return [f"{yol}: tür"]\n    hatalar = []\n    if "enum" in sema and deger not in sema["enum"]:\n        hatalar.append(f"{yol}: enum")\n    if isinstance(deger, dict):\n        for alan in sema.get("required", []):\n            if alan not in deger:\n                hatalar.append(f"{yol}.{alan}: zorunlu")\n        for alan, alt in sema.get("properties", {}).items():\n            if alan in deger:\n                hatalar += sema_hatalari(deger[alan], alt, f"{yol}.{alan}")\n    if isinstance(deger, list) and "items" in sema:\n        for i, eleman in enumerate(deger):\n            hatalar += sema_hatalari(eleman, sema["items"], f"{yol}[{i}]")\n    return hatalar\n',
        tests: 'SIPARIS = {"type": "object", "required": ["id", "durum", "kalemler"], "properties": {\n    "id": {"type": "integer"},\n    "durum": {"type": "string", "enum": ["hazirlaniyor", "kargoda", "teslim"]},\n    "not": {"type": "string", "nullable": True},\n    "musteri": {"type": "object", "required": ["ad"], "properties": {"ad": {"type": "string"}}},\n    "kalemler": {"type": "array", "items": {"type": "object", "required": ["urun_id", "adet"],\n                 "properties": {"urun_id": {"type": "integer"}, "adet": {"type": "integer"}, "fiyat": {"type": "number"}}}}}}\niyi = {"id": 910, "durum": "kargoda", "not": None, "musteri": {"ad": "Ece"}, "kalemler": [{"urun_id": 7, "adet": 2, "fiyat": 120}]}\nassert sema_hatalari(iyi, SIPARIS) == [], "Geçerli yanıt hata vermemeli (fiyat int de number sayılır, not null olabilir)"\nkotu = {"id": "910", "durum": "iptal", "musteri": {}, "kalemler": [{"urun_id": 7, "adet": True}, {"adet": 1}]}\nassert sema_hatalari(kotu, SIPARIS) == ["$.id: tür", "$.durum: enum", "$.musteri.ad: zorunlu", "$.kalemler[0].adet: tür", "$.kalemler[1].urun_id: zorunlu"], f"Gelen: {sema_hatalari(kotu, SIPARIS)}"\nassert sema_hatalari({"kalemler": "x"}, SIPARIS) == ["$.id: zorunlu", "$.durum: zorunlu", "$.kalemler: tür"], "Yanlış türün alt alanlarına bakılmaz"\nassert sema_hatalari(None, {"type": "string"}) == ["$: tür"], "nullable değilse None tür hatasıdır"\n',
        hints: [
          'Özyineleme: nesnede her özellik, dizide her eleman için aynı fonksiyonu yeni yol ile çağır.',
          'Önce None ve tür kontrolü; tür yanlışsa hemen dön.',
          'Sıra: enum, required (sırayla), properties (şemadaki sırayla), items.'
        ],
        why: 'schemathesis ve openapi-core gibi araçlar her yanıtı bu şekilde şemaya karşı denetler. API kodunda alanın adını ya da türünü değiştirdiğinde testler kırmızıya döner; istemciler bunu canlıda öğrenmez.'
      },
      {
        t: 'code',
        id: 'test-ileri-y7',
        stage: 'Kendin yaz',
        diff: 2,
        q: '<p>locust çıktısını özetle: <code>yuk_ozeti(kayitlar, sure_sn)</code> yaz. <code>kayitlar</code> <code>(uc_nokta, sure_ms, durum_kodu)</code> demetlerinden oluşur; <code>sure_sn</code> testin toplam süresidir. Her uç nokta için sözlük döndür: <code>istek</code> (sayı), <code>rps</code> (istek / saniye, 1 ondalık), <code>p50</code> ve <code>p95</code> (en yakın sıra yöntemi: sıralı listede <code>ceil(p/100 * n)</code>. eleman), <code>hata_orani</code> (500 ve üstü durum kodlarının oranı, 3 ondalık). Uç noktaları alfabetik sırala.</p>',
        start: 'import math\n\ndef yuk_ozeti(kayitlar, sure_sn):\n    return {}\n',
        sol: 'import math\n\ndef _yuzdelik(sirali, p):\n    return sirali[max(1, math.ceil(p / 100 * len(sirali))) - 1]\n\ndef yuk_ozeti(kayitlar, sure_sn):\n    gruplar = {}\n    for uc, ms, kod in kayitlar:\n        gruplar.setdefault(uc, []).append((ms, kod))\n    sonuc = {}\n    for uc in sorted(gruplar):\n        sureler = sorted(ms for ms, _ in gruplar[uc])\n        n = len(sureler)\n        hatali = sum(1 for _, kod in gruplar[uc] if kod >= 500)\n        sonuc[uc] = {"istek": n, "rps": round(n / sure_sn, 1), "p50": _yuzdelik(sureler, 50),\n                     "p95": _yuzdelik(sureler, 95), "hata_orani": round(hatali / n, 3)}\n    return sonuc\n',
        tests: 'import random\nrng = random.Random(42)\nK = [("/urunler", rng.randint(20, 200), 200) for _ in range(95)] + [("/urunler", 900 + i, 200) for i in range(5)]\nK += [("/siparis", 300, 201), ("/siparis", 350, 201), ("/siparis", 1200, 503), ("/siparis", 410, 201)]\no = yuk_ozeti(K, 10)\nassert list(o) == ["/siparis", "/urunler"], "Alfabetik sıra"\nu = o["/urunler"]\nassert u["istek"] == 100 and u["rps"] == 10.0, "100 istek / 10 sn = 10.0 rps"\nassert u["p95"] == sorted(x[1] for x in K if x[0] == "/urunler")[94], "p95: sıralı listenin 95. elemanı (indeks 94)"\nassert u["p95"] < 900, "En yavaş 5 istek p95\'in üstünde kalmalı"\nassert o["/siparis"] == {"istek": 4, "rps": 0.4, "p50": 350, "p95": 1200, "hata_orani": 0.25}, f"/siparis özeti: {o[\'/siparis\']}"\n',
        hints: ['Önce uç noktaya göre grupla, sonra her grubu ayrı işle.', 'En yakın sıra: indeks = ceil(p/100 * n) - 1 (en az 0).', '503 hata, 201 başarı sayılır: kod >= 500.'],
        why: 'Yük testi raporlarının dili budur: uç nokta başına RPS, yüzdelikler ve hata oranı. Ortalama yerine p95 kullanmak, yavaş kuyruğu (burada 900+ ms\'lik 5 istek) görünür kılar; SLO\'lar da bu sayılarla yazılır.'
      },
      {
        t: 'code',
        id: 'test-ileri-y8',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 2,
        q: '<p>Hatayı bul ve düzelt. <code>yuzdelik(sureler, p)</code> en yakın sıra yöntemiyle p. yüzdeliği döndürmeli: sıralı listede <code>ceil(p/100 * n)</code>. eleman (1 tabanlı). Kod p=100\'de <code>IndexError</code> veriyor ve diğer değerlerde bir sonraki elemanı döndürüyor; ayrıca listeyi sıralamayı unutuyor.</p>',
        start: 'import math\n\ndef yuzdelik(sureler, p):\n    sira = int(p / 100 * len(sureler))\n    return sureler[sira]\n',
        sol: 'import math\n\ndef yuzdelik(sureler, p):\n    sirali = sorted(sureler)\n    sira = max(1, math.ceil(p / 100 * len(sirali)))\n    return sirali[sira - 1]\n',
        tests: 'S = [120, 80, 95, 300, 110, 90, 105, 2000, 100, 85]\nassert yuzdelik(S, 50) == 100, "10 elemanda p50 = 5. eleman (sıralı: 80,85,90,95,100,...)"\nassert yuzdelik(S, 90) == 300, "p90 = 9. eleman"\nassert yuzdelik(S, 100) == 2000, "p100 en büyük değerdir, IndexError değil"\nassert yuzdelik(S, 1) == 80, "p1 en küçük değer"\nassert yuzdelik([42], 95) == 42, "Tek elemanlı liste"\n',
        hints: ['Üç sorun: sıralama yok, sıra 1 tabanlı değil, int aşağı yuvarlar.', 'math.ceil ile yukarı yuvarla, 1 çıkararak indekse çevir.', 'p çok küçükse sıra 0 çıkabilir; max(1, ...) ile koru.'],
        why: 'Yüzdelik hesabındaki bir kaydırma hatası raporu sistematik olarak kötümser ya da iyimser yapar ve SLO kararlarını bozar. Sınır değerleri (p=100, tek eleman, p küçük) testlerin olmazsa olmazıdır.'
      },
      {
        t: 'code',
        id: 'test-ileri-y9',
        stage: 'Meydan okuma',
        diff: 3,
        q: '<p>Kırıcı değişiklik denetleyicisi (oasdiff benzeri): <code>kirici(eski, yeni, yon)</code> iki şemayı (önceki görevdeki alt küme) karşılaştırıp istemciyi kıracak değişiklikleri döndürsün. <code>yon</code> <code>"yanit"</code> ya da <code>"istek"</code>:</p><ul><li>Her iki yönde: aynı yolda <code>type</code> değişmişse <code>"&lt;yol&gt;: tür eski→yeni"</code> (alt alanlara inme).</li><li>Yanıtta: eskide olan bir özellik yenide yoksa <code>"&lt;yol&gt;: kaldırıldı"</code>; enum\'a yeni değer eklenmişse <code>"&lt;yol&gt;: enum genişledi"</code> (istemci tanımadığı değeri alır).</li><li>İstekte: yenide <code>required</code>\'a eklenmiş ama eskide zorunlu olmayan alan için <code>"&lt;yol&gt;: yeni zorunlu"</code>.</li></ul><p>Özellikler ve dizi elemanları (<code>items</code>, yol eki <code>[]</code>) için özyinele. Sonucu alfabetik sıralı liste döndür.</p>',
        start: 'def kirici(eski, yeni, yon, yol="$"):\n    return []\n',
        sol: 'def kirici(eski, yeni, yon, yol="$"):\n    sonuc = []\n    if eski.get("type") != yeni.get("type"):\n        return [f"{yol}: tür {eski.get(\'type\')}→{yeni.get(\'type\')}"]\n    if yon == "yanit" and "enum" in eski and set(yeni.get("enum", [])) - set(eski["enum"]):\n        sonuc.append(f"{yol}: enum genişledi")\n    if yon == "istek":\n        for alan in yeni.get("required", []):\n            if alan not in eski.get("required", []):\n                sonuc.append(f"{yol}.{alan}: yeni zorunlu")\n    e_ozl, y_ozl = eski.get("properties", {}), yeni.get("properties", {})\n    for alan, alt in e_ozl.items():\n        if alan not in y_ozl:\n            if yon == "yanit":\n                sonuc.append(f"{yol}.{alan}: kaldırıldı")\n        else:\n            sonuc += kirici(alt, y_ozl[alan], yon, f"{yol}.{alan}")\n    if "items" in eski and "items" in yeni:\n        sonuc += kirici(eski["items"], yeni["items"], yon, f"{yol}[]")\n    return sorted(sonuc)\n',
        tests: 'E = {"type": "object", "required": ["id"], "properties": {\n    "id": {"type": "integer"}, "tutar": {"type": "number"}, "durum": {"type": "string", "enum": ["a", "b"]},\n    "kupon": {"type": "string"},\n    "kalemler": {"type": "array", "items": {"type": "object", "properties": {"adet": {"type": "integer"}, "not": {"type": "string"}}}}}}\nY = {"type": "object", "required": ["id", "kupon"], "properties": {\n    "id": {"type": "string"}, "tutar": {"type": "number"}, "durum": {"type": "string", "enum": ["a", "b", "c"]},\n    "kupon": {"type": "string"}, "yeni_alan": {"type": "string"},\n    "kalemler": {"type": "array", "items": {"type": "object", "properties": {"adet": {"type": "integer"}}}}}}\nassert kirici(E, Y, "yanit") == ["$.durum: enum genişledi", "$.id: tür integer→string", "$.kalemler[].not: kaldırıldı"], f"Yanıt: {kirici(E, Y, \'yanit\')}"\nassert kirici(E, Y, "istek") == ["$.id: tür integer→string", "$.kupon: yeni zorunlu"], f"İstek: {kirici(E, Y, \'istek\')}"\nassert kirici(E, E, "yanit") == [] and kirici(E, E, "istek") == [], "Aynı şema kırıcı değildir"\n',
        hints: [
          'Tür farkı varsa hemen o yolu döndür; alt alanlara inmek anlamsız.',
          'Yanıtta silme ve enum genişlemesi, istekte yeni zorunlu alan kırıcıdır; yeni isteğe bağlı alan iki yönde de kırıcı değildir.',
          'Özellikler için kirici(alt_eski, alt_yeni, yon, yol + "." + alan), diziler için yol + "[]".'
        ],
        why: 'Kırıcı değişiklik kuralları yöne bağlıdır: yanıta alan eklemek güvenli, silmek kırıcıdır; isteğe isteğe bağlı alan eklemek güvenli, zorunlu alan eklemek kırıcıdır. Bu denetimi CI\'da çalıştırmak, sürüm numarası (major) gerektiren değişiklikleri otomatik işaretler.'
      }
    ],
    faq: [
      {
        q: 'Entegrasyon testinde SQLite mi, gerçek PostgreSQL mi?',
        a: 'Mümkünse prod ile aynı motor. SQLite hızlıdır ama tarih fonksiyonları, JSON, büyük/küçük harf duyarlılığı, kilitleme ve kısıt davranışlarında farklıdır; bu farklar tam da entegrasyon testinin yakalaması gereken hatalardır. testcontainers ya da CI\'daki services: postgres bunu kolaylaştırır.'
      },
      {
        q: 'Yük testini ne sıklıkla çalıştırmalıyım?',
        a: 'Her commit\'te değil. Büyük sürümlerden, altyapı değişikliklerinden ve beklenen trafik artışlarından (kampanya, Black Friday) önce staging\'de çalıştır; ayrıca kısa bir "duman yükü" testini gecelik CI\'a koyup p95\'in sürümler arasında kötüleşmesini izleyebilirsin.'
      }
    ]
  }
);
})(window);
