/* Kesit Python — 'veri-boru-hatti' uzantısı (AUDIT 12, Derinleş + ek alıştırmalar) */
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
  {
    id: 'veri-boru-hatti',
    min: 30,
    needs: ['sqlite3'],
    html: `<p>Derste kalite kapılarını bir kontrol listesi olarak gördün. Bu bölüm onları uygulamaya döküyor: kalitenin boyutlarını ölçmek, kuralları koddan ayırıp bir <b>şemaya</b> yazmak, kötü satırları <b>karantinaya</b> almak, üretici ile tüketici arasındaki beklentiyi bir <b>veri sözleşmesine</b> bağlamak ve her çalıştırmanın sonunda okunabilir bir rapor üretmek. Örnekler gerçek kirli tablolarla: Anadolu Market'in <code>raw_signups</code> kayıt dökümü ve Power Query'den tanıdığın <code>kirli_veri</code> bayi raporu.</p>
<h2>Kalitenin boyutları</h2>
<div class="tbl-wrap"><table><tr><th>Boyut</th><th>Soru</th><th>raw_signups'ta örnek</th></tr>
<tr><td>Tamlık (completeness)</td><td>Zorunlu alanlar dolu mu?</td><td>10 satırda şehir boş</td></tr>
<tr><td>Tekillik (uniqueness)</td><td>Anahtar tekrar ediyor mu?</td><td>52 satır, 40 benzersiz <code>id</code></td></tr>
<tr><td>Geçerlilik (validity)</td><td>Değer biçime ve kurala uyuyor mu?</td><td>Tarih kimi satırda <code>29.07.2024</code>, kiminde <code>2024-02-10</code></td></tr>
<tr><td>Tutarlılık (consistency)</td><td>Aynı şey hep aynı mı yazılmış?</td><td><code>ISTANBUL</code>, <code>istanbul</code>, <code>İstanbul</code></td></tr>
<tr><td>Doğruluk (accuracy)</td><td>Değer gerçeği yansıtıyor mu?</td><td>Kaynakla mutabakat gerekir; tek başına ölçülemez</td></tr>
<tr><td>Tazelik (timeliness)</td><td>Veri yeterince güncel mi?</td><td>En yeni kayıt beklenen günden eski mi?</td></tr></table></div>
<p>Her boyutu bir orana çevirmek (ör. tamlık = zorunlu alanları dolu satır / tüm satırlar) kaliteyi zaman içinde izlenebilir kılar: "bu hafta tamlık %98'den %81'e düştü" demek, "veride sorun var" demekten çok daha işe yarar.</p>
<pre class="py">import veri, re
from collections import Counter
r = veri.kayitlar("anadolu_market", "raw_signups")
n = len(r)
tamlik = sum(x["city"] is not None for x in r) / n
tekillik = len({x["id"] for x in r}) / n
gecerlilik = sum(bool(re.fullmatch(r"\\d{4}-\\d{2}-\\d{2}", x["signup_date"])) for x in r) / n
yazimlar = Counter(x["city"] for x in r if x["city"])
print(f"satır={n} tamlık={tamlik:.1%} tekillik={tekillik:.1%} ISO tarih={gecerlilik:.1%}")
print("şehir yazımları:", len(yazimlar), sorted(yazimlar)[:4])</pre>
<h2>Kurallar koddan ayrı: şema</h2>
<p>Kuralları <code>if</code> yığınları olarak yazmak yerine bir şemada (schema) toplarsan hem okunur hem yeniden kullanılır. Python dünyasında bunun en yaygın aracı <b>pandera</b>'dır (pandas/polars DataFrame şeması); satır bazlı API girdisinde ise pydantic. Mantık aynı: sütun → tür + kurallar.</p>
<pre class="code">import pandera.pandas as pa   # pip install pandera
sema = pa.DataFrameSchema({
    "id":          pa.Column(int, unique=True),
    "email":       pa.Column(str, pa.Check.str_matches(r"^[^@\\s]+@[^@\\s]+\\.[a-z]+$")),
    "city":        pa.Column(str, pa.Check.isin(["İstanbul", "Ankara", "İzmir"]), nullable=False),
    "signup_date": pa.Column("datetime64[ns]"),
}, strict=True)                # şemada olmayan sütun gelirse hata
try:
    sema.validate(df, lazy=True)          # lazy: ilk hatada durma, hepsini topla
except pa.errors.SchemaErrors as e:
    print(e.failure_cases)                # hangi sütun, hangi kural, hangi değer</pre>
<div class="note"><b>Kendi bilgisayarında dene</b>pandera tarayıcıda yüklü değil. Aşağıdaki alıştırmalarda aynı fikri saf Python ile, sözlükten oluşan bir şemayla kuracaksın; böylece kütüphanenin içinde ne olduğunu da görmüş olacaksın.</div>
<h2>Karantina tablosu: ne at, ne durdur</h2>
<p>Kötü satırla ne yapmalı? Sessizce atmak veri kaybettirir ve kimse fark etmez; tüm partiyi durdurmak tek bir bozuk satır için bütün raporu bekletir. Orta yol <b>karantinadır</b> (quarantine): geçen satırlar hedefe, kalanlar ham hâliyle ve <b>neden</b> bilgisiyle ayrı bir tabloya yazılır. Veri sahibi karantinayı inceler, kaynağı düzeltir, satırlar yeniden işlenir. Karantina oranı eşiği aşarsa (ör. %5) parti yine durdurulur; bu, derste gördüğün hata kuyruğunun veritabanındaki karşılığıdır.</p>
<pre class="py">import sqlite3, json
c = sqlite3.connect(":memory:")
c.execute("CREATE TABLE karantina (parti TEXT, kayit TEXT, nedenler TEXT)")
bayi = veri.kayitlar("kirli_veri", "bayi")[2:]          # ilk iki satır başlık
for satir in bayi:
    nedenler = []
    if not satir["Column1"]:
        nedenler.append("bayi boş")
    if satir["Column4"] in (None, "-"):
        nedenler.append("tutar yok")
    if satir["Column3"] and not re.fullmatch(r"\\d{2}\\.\\d{2}\\.\\d{4}", satir["Column3"]):
        nedenler.append("tarih geçersiz")
    if nedenler:
        c.execute("INSERT INTO karantina VALUES (?, ?, ?)",
                  ("2024-01", json.dumps(satir, ensure_ascii=False), ", ".join(nedenler)))
for parti, nedenler in c.execute("SELECT parti, nedenler FROM karantina"):
    print(parti, "|", nedenler)</pre>
<h2>Veri sözleşmesi (data contract)</h2>
<p>Kaynak ekip bir gün sütun adını değiştirir ve senin boru hattın kırılır. Veri sözleşmesi, üretici ile tüketici arasında bu beklentileri yazıya döker: şema, kalite kuralları, tazelik taahhüdü (SLA), sahip ve iletişim. Çoğunlukla YAML'dır, git'te durur, değişiklikleri kod incelemesinden geçer ve CI'da otomatik denetlenir.</p>
<pre class="code"># contracts/raw_signups.yaml
dataset: anadolu_market.raw_signups
owner: crm-ekibi@anadolu.example
sla: {tazelik_saat: 24}
columns:
  - {name: id, type: int, required: true, unique: true}
  - {name: email, type: str, required: true, pattern: "^[^@ ]+@[^@ ]+$"}
  - {name: city, type: str, required: true, allowed: [İstanbul, Ankara, İzmir]}
  - {name: signup_date, type: str, required: true, pattern: "^\\\\d{4}-\\\\d{2}-\\\\d{2}$"}
quality:
  max_karantina_orani: 0.05</pre>
<p>Sözleşmeyi koda çevirmek, şema doğrulayıcını YAML'dan beslemek demektir: <code>yaml.safe_load</code> ile oku, her sütun tanımını bir kurala dönüştür, sonuçları bir rapora topla. Raporun sonunda tek bir karar olmalı: GEÇTİ ya da KALDI. Bu raporu JSON olarak saklamak, kalitenin zaman içindeki eğilimini panoda göstermeyi sağlar.</p>
<div class="warn"><b>Normalleştir, sonra doğrula</b><code>" Ankara"</code> ve <code>"izmir "</code> gibi değerler gerçekte geçerlidir; yalnız yazım bozuk. Doğrulamadan önce kırpma, büyük/küçük harf ve tarih biçimi gibi güvenli dönüşümleri yap; ama "anlamı tahmin eden" düzeltmeleri (boş şehri "İstanbul" saymak) asla otomatik yapma.</div>
<div class="note"><b>Gerçek işte</b>Veri ekiplerinde Great Expectations, Soda, dbt testleri ve pandera bu işi yapar; veri sözleşmeleri için açık standartlar (Open Data Contract Standard) da var. Hangisini kullanırsan kullan, mülakatta ve işte sorulan şey aynıdır: "Kötü veriyi nasıl yakalıyorsun, nereye koyuyorsun, kime haber veriyorsun?"</div>`,
    ex: [
      {
        t: 'mc',
        id: 'veri-boru-hatti-y1',
        stage: 'Isınma',
        q: '<code>kirli_veri.musteri</code> tablosunda 105 numaralı müşterinin kayıt tarihi <code>2024-02-30</code>. Bu hangi kalite boyutunun ihlalidir?',
        o: ['Tamlık: zorunlu alan boş bırakılmış', 'Tekillik: aynı müşteri anahtarı iki kez geçiyor', 'Geçerlilik: biçim uygun ama gerçek bir tarih değil', 'Tazelik: kayıt beklenen günden eski kalmış'],
        a: 2,
        why: 'Alan dolu (tamlık tamam) ve biçim YYYY-AA-GG\'ye uyuyor, ama 30 Şubat diye bir gün yok. Geçerlilik yalnız desen değil, değerin anlamlı olmasıdır; bu yüzden tarihleri regex yerine datetime ile ayrıştırarak doğrula.'
      },
      {
        t: 'mc',
        id: 'veri-boru-hatti-y2',
        stage: 'Isınma',
        q: '10.000 satırlık günlük partide 12 satır şemaya uymuyor. Karantina yaklaşımında ne yapılır?',
        o: [
          '12 satır sessizce atılır, kalan 9.988 satır hedef tabloya yüklenir',
          'Tüm parti reddedilir ve ertesi gün kaynaktan yeniden denenir',
          '9.988 satır yüklenir; 12 satır ham hâli ve nedeniyle ayrı tabloya',
          '12 satırdaki hatalı alanlar varsayılan değerlerle doldurulup yüklenir'
        ],
        a: 2,
        why: 'Karantina veri kaybını önler (satırlar ve nedenleri saklanır) ve tek bozuk satırın tüm raporu bekletmesini engeller. Oran bir eşiği aşarsa (ör. %5) parti yine durdurulur. Uydurma varsayılan değerlerle doldurmak sessiz yanlış veri üretir.'
      },
      {
        t: 'predict',
        id: 'veri-boru-hatti-y3',
        stage: 'Kodu oku',
        q: 'Gerçek <code>raw_signups</code> tablosunun profili: bu kod ne yazdırır?',
        o: ['52 40 10', '52 52 10', '40 40 0', '52 40 0'],
        a: 0,
        code: 'import veri\nr = veri.kayitlar("anadolu_market", "raw_signups")\nids = [x["id"] for x in r]\nbos_sehir = sum(1 for x in r if x["city"] is None)\nprint(len(r), len(set(ids)), bos_sehir)\n',
        why: '52 satırın 12\'si tekrar eden id taşıyor (kimi birebir aynı satır, kimi yalnız e-posta harfleri farklı), bu yüzden 40 benzersiz id var. veri.kayitlar boş hücreyi None\'a çevirir; 10 satırda şehir boş.'
      },
      {
        t: 'order',
        id: 'veri-boru-hatti-y4',
        stage: 'Kodu oku',
        q: '<p>YAML veri sözleşmesini okuyup zorunlu ve benzersiz sütunları listeleyen programın satırlarını sırala. Beklenen çıktı:</p><pre class="out">zorunlu: [\'id\', \'email\']\nbenzersiz: [\'id\']</pre>',
        lines: [
          'import yaml',
          'metin = "columns:\\n  - {name: id, required: true, unique: true}\\n  - {name: email, required: true}\\n  - {name: city}\\n"',
          'sozlesme = yaml.safe_load(metin)',
          'sutunlar = sozlesme["columns"]',
          'print("zorunlu:", [s["name"] for s in sutunlar if s.get("required")])',
          'print("benzersiz:", [s["name"] for s in sutunlar if s.get("unique")])'
        ],
        expect: 'zorunlu: [\'id\', \'email\']\nbenzersiz: [\'id\']\n',
        hint: 'Önce metin, sonra yükleme, sonra sütun listesi; yazdırmalar en sonda.',
        why: 'Sözleşme sıradan bir YAML\'dır; safe_load sözlük ve listelere çevirir. Tanımsız anahtarlar için s.get kullanmak (ör. city\'de required yok) KeyError\'u önler ve "yoksa False" anlamına gelir.'
      },
      {
        t: 'code',
        id: 'veri-boru-hatti-y5',
        stage: 'Rehberli',
        diff: 2,
        q: '<p><code>kalite_boyutlari(kayitlar, anahtar, zorunlu)</code> yaz ve <code>raw_signups</code> üzerinde çalıştır. Dönen sözlük:</p><ul><li><code>"tamlik"</code>: <code>zorunlu</code> listesindeki alanların <b>hepsi</b> dolu (None ya da yalnız boşluk değil) olan satırların oranı</li><li><code>"tekillik"</code>: benzersiz <code>anahtar</code> değeri sayısı / satır sayısı</li><li><code>"tutarlilik"</code>: <code>city</code> alanı dolu satırlarda, değerin <code>strip()</code> sonrası tam olarak "İstanbul", "Ankara" ya da "İzmir" yazımına uyma oranı</li></ul><p>Oranları 3 ondalığa yuvarla. Boş listede tüm oranlar 1.0 olsun.</p>',
        guide: [
          'Satır sayısını n olarak al; n == 0 ise üç oran için 1.0 döndür.',
          'Tamlık: all(...) ile her satırda zorunlu alanların dolu olduğunu denetle; doluluk için "x is not None and str(x).strip() != \'\'".',
          'Tekillik: {k[anahtar] for k in kayitlar} kümesinin uzunluğu / n.',
          'Tutarlılık: şehri dolu satırları süz, kanonik yazımlardan birine uyanları say.'
        ],
        example: 'satirlar = [{"a": 1, "b": None}, {"a": 2, "b": "x"}, {"a": 2, "b": " "}]\ndolu = lambda v: v is not None and str(v).strip() != ""\nprint(sum(all(dolu(s[k]) for k in ["a", "b"]) for s in satirlar) / len(satirlar))\n',
        start: 'import veri\n\nKANONIK = {"İstanbul", "Ankara", "İzmir"}\n\ndef kalite_boyutlari(kayitlar, anahtar, zorunlu):\n    n = len(kayitlar)\n    # TODO: boş liste\n    dolu = lambda v: v is not None and str(v).strip() != ""\n    tamlik = 0\n    tekillik = 0\n    tutarlilik = 0\n    # TODO: üç oranı hesapla\n    return {"tamlik": round(tamlik, 3), "tekillik": round(tekillik, 3), "tutarlilik": round(tutarlilik, 3)}\n\nprint(kalite_boyutlari(veri.kayitlar("anadolu_market", "raw_signups"), "id", ["email", "city"]))\n',
        sol: 'import veri\n\nKANONIK = {"İstanbul", "Ankara", "İzmir"}\n\ndef kalite_boyutlari(kayitlar, anahtar, zorunlu):\n    n = len(kayitlar)\n    if n == 0:\n        return {"tamlik": 1.0, "tekillik": 1.0, "tutarlilik": 1.0}\n    dolu = lambda v: v is not None and str(v).strip() != ""\n    tamlik = sum(all(dolu(k.get(a)) for a in zorunlu) for k in kayitlar) / n\n    tekillik = len({k[anahtar] for k in kayitlar}) / n\n    sehirli = [k["city"] for k in kayitlar if dolu(k.get("city"))]\n    tutarlilik = (sum(s.strip() in KANONIK for s in sehirli) / len(sehirli)) if sehirli else 1.0\n    return {"tamlik": round(tamlik, 3), "tekillik": round(tekillik, 3), "tutarlilik": round(tutarlilik, 3)}\n\nprint(kalite_boyutlari(veri.kayitlar("anadolu_market", "raw_signups"), "id", ["email", "city"]))\n',
        tests: 'r = veri.kayitlar("anadolu_market", "raw_signups")\nk = kalite_boyutlari(r, "id", ["email", "city"])\nassert k["tamlik"] == 0.808, f"42/52 satırda e-posta ve şehir dolu: 0.808 beklenir, gelen {k[\'tamlik\']}"\nassert k["tekillik"] == 0.769, f"40 benzersiz id / 52 satır = 0.769, gelen {k[\'tekillik\']}"\nassert k["tutarlilik"] == 0.476, f"Şehri dolu 42 satırın 20\'si kanonik yazımda: 0.476 beklenir, gelen {k[\'tutarlilik\']}"\nassert kalite_boyutlari([], "id", ["email"]) == {"tamlik": 1.0, "tekillik": 1.0, "tutarlilik": 1.0}, "Boş liste 1.0 vermeli"\n',
        hints: [
          'Oranların hepsi "uyan satır / ilgili satır" kalıbındadır.',
          'True değerleri sum ile toplanınca 1 sayılır: sum(kosul for k in kayitlar).',
          'Tutarlılıkta payda yalnız şehri dolu satırlardır, tüm satırlar değil.'
        ],
        why: 'Boyutları ayrı oranlar olarak ölçmek sorunun türünü gösterir: düşük tamlık kaynak formda zorunlu alan eksikliğine, düşük tekillik çift gönderime, düşük tutarlılık serbest metin girişine işaret eder. Her birinin düzeltmesi farklı ekiptedir.'
      },
      {
        t: 'code',
        id: 'veri-boru-hatti-y6',
        stage: 'Kendin yaz',
        diff: 2,
        q: '<p>Pandera benzeri küçük bir şema doğrulayıcı yaz: <code>sema_dogrula(kayit, sema)</code> hata mesajlarının listesini döndürsün. <code>sema</code> sözlüğü alan → kurallar eşlemesidir. Her alanda kuralları şu sırayla dene ve <b>ilk</b> ihlalde o alanı bırak:</p><ol><li><code>zorunlu: True</code> ve değer None ya da yalnız boşluksa → <code>"&lt;alan&gt;: boş"</code> (zorunlu değilse ve boşsa diğer kuralları atla)</li><li><code>tur</code> (<code>"str"</code>, <code>"int"</code>, <code>"sayi"</code>: int ya da float; bool sayılmaz) uymazsa → <code>"&lt;alan&gt;: tür"</code></li><li><code>desen</code>: <code>re.fullmatch</code> uymazsa → <code>"&lt;alan&gt;: desen"</code></li><li><code>kume</code>: değer kümede değilse → <code>"&lt;alan&gt;: küme"</code></li></ol><p>Gerçek veri: <code>kirli_veri.bayi</code> tablosunun ilk iki satırı başlıktır; testler kalan 10 satırı doğrular.</p>',
        start: 'import re\n\ndef sema_dogrula(kayit, sema):\n    pass\n',
        sol: 'import re\n\ndef _tur_uyar(v, tur):\n    if tur == "str":\n        return isinstance(v, str)\n    if tur == "int":\n        return isinstance(v, int) and not isinstance(v, bool)\n    if tur == "sayi":\n        return isinstance(v, (int, float)) and not isinstance(v, bool)\n    return True\n\ndef sema_dogrula(kayit, sema):\n    hatalar = []\n    for alan, k in sema.items():\n        v = kayit.get(alan)\n        if v is None or (isinstance(v, str) and v.strip() == ""):\n            if k.get("zorunlu"):\n                hatalar.append(f"{alan}: boş")\n            continue\n        if "tur" in k and not _tur_uyar(v, k["tur"]):\n            hatalar.append(f"{alan}: tür")\n        elif "desen" in k and not re.fullmatch(k["desen"], str(v)):\n            hatalar.append(f"{alan}: desen")\n        elif "kume" in k and v not in k["kume"]:\n            hatalar.append(f"{alan}: küme")\n    return hatalar\n',
        tests: 'import veri\nSEMA = {"Column1": {"zorunlu": True, "tur": "str"},\n        "Column3": {"zorunlu": True, "desen": r"\\d{2}\\.\\d{2}\\.\\d{4}"},\n        "Column4": {"zorunlu": True, "tur": "sayi"},\n        "Column5": {"kume": {"yeni", "kasa kapalı"}}}\nbayi = veri.kayitlar("kirli_veri", "bayi")[2:]\nsonuc = [sema_dogrula(s, SEMA) for s in bayi]\nassert sonuc[0] == ["Column4: tür"], f"Merkez Bayi tutarı \'1.250,50\' metin; sayı değil: {sonuc[0]}"\nassert sonuc[1] == [], "Kızılay Bayi (980) geçerli"\nassert sonuc[2] == ["Column4: tür"], "Alsancak Bayi tutarı \'-\'"\nassert sonuc[3] == ["Column1: boş", "Column3: boş", "Column4: boş"], f"Boş satır üç zorunlu alanı ihlal eder: {sonuc[3]}"\nassert sonuc[8] == ["Column3: desen", "Column4: tür"], f"Selçuklu Bayi: tarih \'bilinmiyor\', tutar metin: {sonuc[8]}"\nassert sum(1 for h in sonuc if not h) == 2, "10 satırdan yalnız 2\'ü şemaya uyar"\nassert sema_dogrula({"a": True}, {"a": {"tur": "int"}}) == ["a: tür"], "bool int sayılmamalı"\nassert sema_dogrula({"a": "x"}, {"a": {"kume": {"y"}}}) == ["a: küme"], "küme kuralı"\n',
        hints: [
          'Alan başına bir if/elif zinciri kur; ilk ihlal sonrası elif\'ler çalışmaz.',
          'Boşluk kontrolünü en başta yap; zorunlu değilse continue ile diğer kurallara geçme.',
          'isinstance(True, int) True döner; bool\'u ayrıca dışla.'
        ],
        why: 'Şemayı veri olarak tutmak kuralları koddan ayırır: yeni bir sütun kuralı eklemek tek satırlık sözlük değişikliğidir. Dikkat: ikinci Kızılay satırının ham değeri "1.430" (bin dört yüz otuz) ama otomatik tür dönüşümü onu 1.43 yaptı ve şema "sayı" diye geçirdi. Tür doğru, değer yanlış: bu bir doğruluk (accuracy) sorunudur ve yalnız aralık kuralı ya da kaynakla mutabakat yakalar. Gerçek veride ilk ihlalde durmak mesajları sadeleştirir; pandera\'da lazy=True ise tüm ihlalleri toplar.'
      },
      {
        t: 'code',
        id: 'veri-boru-hatti-y7',
        stage: 'Kendin yaz',
        diff: 2,
        q: '<p>Karantina deseni. <code>yukle(conn, kayitlar, dogrula, parti)</code> yaz: <code>temiz(kayit TEXT)</code> ve <code>karantina(parti TEXT, kayit TEXT, nedenler TEXT)</code> tablolarını yoksa oluştursun. Her kayıt için <code>dogrula(kayit)</code> bir hata listesi döndürür; boşsa kayıt JSON olarak <code>temiz</code>\'e, değilse <code>karantina</code>\'ya (nedenler <code>"; "</code> ile birleştirilmiş) yazılsın. JSON\'da Türkçe karakterler korunmalı (<code>ensure_ascii=False</code>). Tüm yazım tek transaction olsun. Fonksiyon <code>(temiz_sayisi, karantina_sayisi)</code> döndürsün.</p>',
        start: 'import json, sqlite3\n\ndef yukle(conn, kayitlar, dogrula, parti):\n    pass\n',
        sol: 'import json, sqlite3\n\ndef yukle(conn, kayitlar, dogrula, parti):\n    t = k = 0\n    with conn:\n        conn.execute("CREATE TABLE IF NOT EXISTS temiz (kayit TEXT)")\n        conn.execute("CREATE TABLE IF NOT EXISTS karantina (parti TEXT, kayit TEXT, nedenler TEXT)")\n        for kayit in kayitlar:\n            metin = json.dumps(kayit, ensure_ascii=False)\n            hatalar = dogrula(kayit)\n            if hatalar:\n                conn.execute("INSERT INTO karantina VALUES (?, ?, ?)", (parti, metin, "; ".join(hatalar)))\n                k += 1\n            else:\n                conn.execute("INSERT INTO temiz VALUES (?)", (metin,))\n                t += 1\n    return t, k\n',
        tests: 'import veri, re\nr = veri.kayitlar("anadolu_market", "raw_signups")\ndef dogrula(x):\n    h = []\n    if x["city"] is None:\n        h.append("şehir boş")\n    if not re.fullmatch(r"\\d{4}-\\d{2}-\\d{2}", x["signup_date"]):\n        h.append("tarih ISO değil")\n    return h\nc = sqlite3.connect(":memory:")\nassert yukle(c, r, dogrula, "2024-11-01") == (27, 25), "raw_signups: 27 temiz, 25 karantina beklenir"\nornek = c.execute("SELECT nedenler FROM karantina WHERE kayit LIKE \'%ceren%\' LIMIT 1").fetchone()[0]\nassert ornek == "şehir boş; tarih ISO değil", f"İki neden \'; \' ile birleşmeli: {ornek}"\nassert "İ" in "".join(x for (x,) in c.execute("SELECT kayit FROM temiz")), "ensure_ascii=False ile İ korunmalı"\nassert c.execute("SELECT COUNT(DISTINCT parti) FROM karantina").fetchone()[0] == 1, "Parti etiketi yazılmalı"\nassert yukle(c, [], dogrula, "bos") == (0, 0), "Boş partide (0, 0)"\n',
        hints: ['with conn: bloğu commit ya da rollback\'i tek seferde yapar.', 'CREATE TABLE IF NOT EXISTS ikinci çağrıda hata vermez.', 'json.dumps(kayit, ensure_ascii=False) ve "; ".join(hatalar).'],
        why: 'Karantina tablosu kaybı sıfırlar ve hatayı görünür kılar: veri sahibi SELECT nedenler, COUNT(*) ... GROUP BY ile hangi kuralın en çok bozulduğunu görür. Ham kaydı JSON saklamak, şema değişse bile satırı yeniden işlemeyi mümkün kılar.'
      },
      {
        t: 'code',
        id: 'veri-boru-hatti-y8',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 2,
        q: '<p>Hatayı bul ve düzelt. <code>ortak_epostalar(kayitlar)</code>, <b>birden fazla farklı müşteri id\'sinin</b> paylaştığı e-postaları (küçük harfe çevrilmiş ve kırpılmış) sıralı liste olarak döndürmeli. Aynı id\'nin tekrar eden satırları sorun sayılmaz. Gerçek <code>raw_signups</code>\'ta yalnız bir e-posta iki ayrı müşteriye ait; kod ise bambaşka bir liste döndürüyor.</p>',
        start: 'import veri\nfrom collections import Counter\n\ndef ortak_epostalar(kayitlar):\n    sayac = Counter(k["email"] for k in kayitlar)\n    return sorted(e for e, n in sayac.items() if n > 1)\n\nprint(ortak_epostalar(veri.kayitlar("anadolu_market", "raw_signups")))\n',
        sol: 'import veri\nfrom collections import defaultdict\n\ndef ortak_epostalar(kayitlar):\n    idler = defaultdict(set)\n    for k in kayitlar:\n        idler[k["email"].strip().lower()].add(k["id"])\n    return sorted(e for e, s in idler.items() if len(s) > 1)\n\nprint(ortak_epostalar(veri.kayitlar("anadolu_market", "raw_signups")))\n',
        tests: 'r = veri.kayitlar("anadolu_market", "raw_signups")\nassert ortak_epostalar(r) == ["can.kaya@gmail.com"], f"Yalnız can.kaya@gmail.com (id 8 ve 33) beklenir, gelen {ortak_epostalar(r)}"\nassert ortak_epostalar([{"id": 1, "email": "A@x.com "}, {"id": 2, "email": "a@x.com"}]) == ["a@x.com"], "Büyük harf ve boşluk normalleştirilmeli"\nassert ortak_epostalar([{"id": 1, "email": "a@x.com"}, {"id": 1, "email": "a@x.com"}]) == [], "Aynı id\'nin tekrarı ortak e-posta değildir"\n',
        hints: ['İki hata var: normalleştirme yok ve satırlar sayılıyor, id\'ler değil.', 'E-posta → id kümesi eşlemesi kur (defaultdict(set)).', 'Küme boyutu 1\'den büyükse o e-posta birden çok müşteriye aittir.'],
        why: 'Satır saymak, aynı id\'nin çift gönderimini (tekillik sorunu) farklı müşterilerin aynı e-postayı paylaşmasıyla (kimlik eşleştirme sorunu) karıştırır. Normalleştirmeden sayınca da CEREN.YILMAZ@... ile ceren.yilmaz@... ayrı görünür. Doğru soru için doğru anahtarı seçmek kalite işinin yarısıdır.'
      },
      {
        t: 'code',
        id: 'veri-boru-hatti-y9',
        stage: 'Meydan okuma',
        diff: 3,
        q: '<p>YAML veri sözleşmesini uygulayan raporlayıcı: <code>sozlesme_raporu(yaml_metin, kayitlar)</code>. Sözleşmede <code>columns</code> listesi (<code>name</code>, isteğe bağlı <code>required</code>, <code>unique</code>, <code>pattern</code>, <code>allowed</code>) ve <code>quality.max_karantina_orani</code> var. Kurallar:</p><ul><li>Bir satır, herhangi bir sütunda ihlal varsa karantinaya girer. Boş (None) değer yalnız <code>required</code> ise ihlaldir; boş değere diğer kurallar uygulanmaz.</li><li><code>pattern</code>: <code>re.fullmatch</code> değerin <code>str</code> hâline; <code>allowed</code>: değer listede olmalı.</li><li><code>unique</code>: sütun değeri <b>daha önceki bir satırda görüldüyse</b> bu satır ihlaldir (ilk görülen geçer).</li></ul><p>Dönüş: <code>{"satir": n, "gecerli": g, "karantina": k, "ihlaller": {"&lt;sütun&gt;.&lt;kural&gt;": sayı}, "durum": "GEÇTİ" ya da "KALDI"}</code>. Kural adları: <code>required</code>, <code>unique</code>, <code>pattern</code>, <code>allowed</code>. <code>ihlaller</code> yalnız sıfırdan büyük sayıları içersin. Karantina oranı (k/n) eşiği aşarsa KALDI.</p>',
        start: 'import re, yaml\n\ndef sozlesme_raporu(yaml_metin, kayitlar):\n    pass\n',
        sol: 'import re, yaml\n\ndef sozlesme_raporu(yaml_metin, kayitlar):\n    s = yaml.safe_load(yaml_metin)\n    sutunlar = s["columns"]\n    esik = s.get("quality", {}).get("max_karantina_orani", 0)\n    gorulen = {c["name"]: set() for c in sutunlar if c.get("unique")}\n    ihlaller = {}\n    karantina = 0\n    for k in kayitlar:\n        bozuk = False\n        for c in sutunlar:\n            ad = c["name"]\n            v = k.get(ad)\n            kural = None\n            if v is None:\n                if c.get("required"):\n                    kural = "required"\n            elif c.get("unique") and v in gorulen[ad]:\n                kural = "unique"\n            elif "pattern" in c and not re.fullmatch(c["pattern"], str(v)):\n                kural = "pattern"\n            elif "allowed" in c and v not in c["allowed"]:\n                kural = "allowed"\n            if c.get("unique") and v is not None:\n                gorulen[ad].add(v)\n            if kural:\n                anahtar = f"{ad}.{kural}"\n                ihlaller[anahtar] = ihlaller.get(anahtar, 0) + 1\n                bozuk = True\n        karantina += bozuk\n    n = len(kayitlar)\n    oran = karantina / n if n else 0\n    return {"satir": n, "gecerli": n - karantina, "karantina": karantina,\n            "ihlaller": ihlaller, "durum": "GEÇTİ" if oran <= esik else "KALDI"}\n',
        tests: 'import veri\nr = veri.kayitlar("anadolu_market", "raw_signups")\nS = """\ncolumns:\n  - {name: id, required: true, unique: true}\n  - {name: email, required: true, pattern: "[a-z0-9.]+@[a-z0-9.]+"}\n  - {name: city, required: true, allowed: [İstanbul, Ankara, İzmir]}\n  - {name: signup_date, required: true, pattern: "\\\\\\\\d{4}-\\\\\\\\d{2}-\\\\\\\\d{2}"}\nquality: {max_karantina_orani: 0.05}\n"""\nrap = sozlesme_raporu(S, r)\nassert rap["satir"] == 52, "52 satır"\nassert rap["ihlaller"] == {"email.pattern": 18, "city.required": 10, "signup_date.pattern": 20, "id.unique": 12, "city.allowed": 25}, f"İhlal sayıları yanlış: {rap[\'ihlaller\']}"\nassert rap["karantina"] == 45 and rap["gecerli"] == 7, f"Karantina 45, geçerli 7 olmalı: {rap}"\nassert rap["durum"] == "KALDI", "Oran %5 eşiğini çok aşıyor"\ntemiz = [{"id": 1, "email": "a@b.co", "city": "Ankara", "signup_date": "2024-01-01"}]\nassert sozlesme_raporu(S, temiz) == {"satir": 1, "gecerli": 1, "karantina": 0, "ihlaller": {}, "durum": "GEÇTİ"}, "Temiz veri GEÇTİ vermeli"\n',
        hints: [
          'Sütun başına tek ihlal say: required → unique → pattern → allowed sırasıyla if/elif.',
          'unique için sütun başına bir "görülen" kümesi tut; kontrolden SONRA değeri kümeye ekle.',
          'Satır, sütunlardan herhangi birinde ihlal varsa bir kez karantinaya sayılır (bozuk bayrağı).'
        ],
        why: 'Bu fonksiyon, Great Expectations ya da Soda\'nın yaptığının çekirdeğidir: kurallar YAML\'da, uygulayıcı genel, çıktı makinece okunabilir bir rapor. Raporu her çalıştırmada saklarsan, sözleşme ihlallerinin hangi kaynaktan ve ne zamandan beri geldiğini izleyebilirsin.'
      }
    ],
    faq: [
      {
        q: 'Kalite kontrolleri ETL\'in neresine konur?',
        a: 'Üç yerde: kaynaktan okur okumaz (şema ve biçim: sözleşme ihlali erken yakalanır), dönüşümden sonra (iş kuralları, tekillik) ve yayına almadan önce (hacim, toplam mutabakatı, tazelik). Erken kontrol ucuzdur; geç kontrol ise iş sonucunu korur. İkisi de gerekir.'
      },
      {
        q: 'pandera mı, Great Expectations mı, dbt testleri mi?',
        a: 'pandera Python kodunun içinde DataFrame doğrular ve hafiftir; Great Expectations ve Soda raporlama ve veri dokümantasyonu sunan daha büyük çerçevelerdir; dbt testleri veri ambarındaki SQL modellerini denetler. Ekipte hangi katmanda çalıştığına göre seçilir, çoğu ekip ikisini birlikte kullanır.'
      }
    ]
  }
);
})(window);
