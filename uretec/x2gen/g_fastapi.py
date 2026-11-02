import sys; sys.path.insert(0, '/tmp/claude-0/-home-claude/6c066959-3fcb-54bb-bdf1-c8ae148dfc4c/scratchpad/x2gen')
from x2lib import *
import os; os.environ['PP_VERI'] = '/home/claude/py/data'; sys.path.insert(0, '/home/claude/py/tools/pylib')

H = []
H.append('<h2>Derinleş: gerçek zamanlı uç noktalar, sayfalama, hız sınırı ve async veritabanı</h2>')
H.append('<p>CRUD uç noktaları bir API\'nin iskeletidir; canlıda ise şu sorular gelir: "Sipariş durumu değişince ekran kendiliğinden güncellensin", "910 siparişi sayfa sayfa getir ama yeni sipariş gelince kayma olmasın", "bir istemci saniyede 500 istek atıp sistemi düşürmesin", "veritabanı beklerken sunucu kilitlenmesin". Bu bölüm dört konuyu FastAPI kodu (kendi bilgisayarında) ve tarayıcıda çalışan çekirdek mantıkla anlatıyor; sayfalama örnekleri Anadolu Market\'in gerçek <code>orders</code> tablosunu kullanıyor.</p>')
H.append('<h3>WebSocket ve SSE</h3>')
H.append('<p><b>WebSocket</b> iki yönlü, sürekli açık bir bağlantıdır: sohbet, canlı pano, ortak düzenleme. Sunucu birden çok istemciye aynı mesajı gönderecekse (yayın, broadcast) bağlantıları bir yöneticide tutar; kopan bağlantıyı listeden çıkarmayı unutmamalıdır. <b>SSE</b> ise tek yönlüdür (sunucu → istemci), düz HTTP üzerinden çalışır ve LLM cevabı ya da bildirim akışı için yeterlidir (LLM API dersindeki ek bölüm).</p>')
H.append(pc('''
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import StreamingResponse

app = FastAPI()

class Yonetici:
    def __init__(self):
        self.baglantilar: set[WebSocket] = set()
    async def baglan(self, ws: WebSocket):
        await ws.accept()
        self.baglantilar.add(ws)
    def ayril(self, ws: WebSocket):
        self.baglantilar.discard(ws)
    async def yayinla(self, mesaj: dict):
        for ws in list(self.baglantilar):
            try:
                await ws.send_json(mesaj)
            except Exception:
                self.ayril(ws)          # kopmuş istemciyi temizle

yonetici = Yonetici()

@app.websocket("/ws/siparisler")
async def siparis_akisi(ws: WebSocket):
    await yonetici.baglan(ws)
    try:
        while True:
            await ws.receive_text()     # istemciden gelen (ör. ping) mesajları dinle
    except WebSocketDisconnect:
        yonetici.ayril(ws)

@app.get("/olaylar")
async def olaylar():
    async def uret():
        for i in range(3):
            yield f"data: {{\\"sira\\": {i}}}\\n\\n"
    return StreamingResponse(uret(), media_type="text/event-stream")
'''))
H.append('<p>Birden çok sunucu süreci (worker) çalışıyorsa her sürecin kendi bağlantı listesi olur; yayını tüm süreçlere ulaştırmak için Redis Pub/Sub gibi ortak bir kanal gerekir.</p>')
H.append('<h3>Sayfalama: offset mi, cursor mu?</h3>')
H.append('<div class="tbl-wrap"><table><tr><th></th><th>Offset (<code>?sayfa=3&amp;boyut=20</code>)</th><th>Cursor / keyset (<code>?imlec=...</code>)</th></tr>'
         '<tr><td>Sorgu</td><td><code>LIMIT 20 OFFSET 40</code></td><td><code>WHERE (tarih, id) &lt; (?, ?) LIMIT 20</code></td></tr>'
         '<tr><td>Derin sayfa</td><td>Veritabanı atlanan satırları da okur; yavaşlar</td><td>İndeksle doğrudan konuma gider; hep hızlı</td></tr>'
         '<tr><td>Araya kayıt girerse</td><td>Satırlar kayar: tekrar ya da atlama</td><td>Kayma yok</td></tr>'
         '<tr><td>"7. sayfaya git"</td><td>Kolay</td><td>Yok; yalnız sonraki/önceki</td></tr></table></div>')
H.append('<p>Cursor sayfalamanın kuralı: sıralama anahtarı <b>benzersiz</b> olmalıdır. Sipariş tarihi tek başına benzersiz değildir (aynı gün 6 sipariş olabiliyor); bu yüzden <code>(order_date, order_id)</code> ikilisi kullanılır. İmleç, son satırın anahtarını taşıyan opak bir metindir (base64 ile kodlanmış JSON).</p>')
H.append(py('''
import base64, json
import veri

con = veri.baglan("anadolu_market", tablolar=["orders"])

def imlec_yap(tarih, sid):
    return base64.urlsafe_b64encode(json.dumps([tarih, sid]).encode()).decode()

def sayfa(imlec=None, limit=5):
    sql, p = "SELECT order_id, order_date FROM orders", []
    if imlec:
        tarih, sid = json.loads(base64.urlsafe_b64decode(imlec))
        sql += " WHERE (order_date, order_id) < (?, ?)"
        p = [tarih, sid]
    satirlar = con.execute(sql + " ORDER BY order_date DESC, order_id DESC LIMIT ?", p + [limit]).fetchall()
    sonraki = imlec_yap(*satirlar[-1][::-1]) if len(satirlar) == limit else None
    return satirlar, sonraki

s1, im = sayfa()
print(s1)
print("imleç:", im)
s2, _ = sayfa(im)
print(s2)
'''))
H.append('<p>Filtreleme de aynı uç noktada yapılır (<code>?status=delivered&amp;channel=mobile</code>). Güvenli kalıp: izin verilen filtreleri bir <b>beyaz listede</b> tut, değerleri her zaman <code>?</code> parametresiyle geçir, bilinmeyen parametreye 422 dön. Sütun adını kullanıcıdan alıp SQL\'e yapıştırmak SQL enjeksiyonudur.</p>')
H.append('<h3>Hız sınırı middleware\'i</h3>')
H.append('<p>En yaygın algoritma <b>jeton kovası</b>dır (token bucket): her istemcinin kovasında en fazla <code>kapasite</code> jeton vardır, kova saniyede <code>hiz</code> jeton dolar, her istek bir jeton harcar. Jeton yoksa <b>429 Too Many Requests</b> ve <code>Retry-After</code> başlığı dönülür. Kısa ani yüklere (burst) izin verir ama ortalama hızı sınırlar.</p>')
H.append(py('''
class Kova:
    def __init__(self, kapasite, hiz):
        self.kapasite, self.hiz = kapasite, hiz
        self.jeton, self.son = float(kapasite), 0.0
    def izin(self, simdi):
        self.jeton = min(self.kapasite, self.jeton + (simdi - self.son) * self.hiz)
        self.son = simdi
        if self.jeton >= 1:
            self.jeton -= 1
            return True
        return False

k = Kova(kapasite=3, hiz=1)          # 3'lük patlama, saniyede 1 istek
print([k.izin(t) for t in (0, 0.1, 0.2, 0.3, 1.3, 1.4)])
'''))
H.append(pc('''
import time
from fastapi import Request
from fastapi.responses import JSONResponse

kovalar: dict[str, Kova] = {}

@app.middleware("http")
async def hiz_siniri(request: Request, call_next):
    anahtar = request.headers.get("X-API-Key") or request.client.host
    kova = kovalar.setdefault(anahtar, Kova(kapasite=20, hiz=5))
    if not kova.izin(time.monotonic()):
        return JSONResponse({"detail": "Çok fazla istek"}, status_code=429, headers={"Retry-After": "1"})
    return await call_next(request)
'''))
H.append('<p>Bu sözlük tek süreçte çalışır; çok süreçli üretimde sayaçlar Redis\'te tutulur (ya da <code>slowapi</code> gibi bir kütüphane ve API ağ geçidi kullanılır). Zaman için <code>time.monotonic()</code> kullan: sistem saati geri alınsa bile ileri akar.</p>')
H.append('<h3>Async veritabanı oturumu</h3>')
H.append('<p><code>async def</code> uç noktada senkron veritabanı sürücüsü olay döngüsünü bloklar. SQLAlchemy 2\'nin async motoru ve async sürücü (PostgreSQL için <code>asyncpg</code>, SQLite için <code>aiosqlite</code>) bekleme sırasında döngüyü serbest bırakır. Oturum, istek başına açılıp kapanan bir bağımlılıktır:</p>')
H.append(pc('''
# pip install "sqlalchemy[asyncio]" asyncpg
from typing import Annotated
from fastapi import Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

motor = create_async_engine("postgresql+asyncpg://kullanici:sifre@db/market", pool_size=10)
OturumYap = async_sessionmaker(motor, expire_on_commit=False)

async def oturum_al():
    async with OturumYap() as oturum:
        yield oturum                    # istek bitince otomatik kapanır

Oturum = Annotated[AsyncSession, Depends(oturum_al)]

@app.get("/siparisler/{sid}")
async def siparis(sid: int, oturum: Oturum):
    sonuc = await oturum.execute(select(Siparis).where(Siparis.id == sid))
    return sonuc.scalar_one_or_none()
'''))
H.append('<div class="note"><b>Gerçek işte</b>Mobil uygulamadaki sonsuz kaydırmalı listeler cursor sayfalamayla, kurye konumu ve sipariş durumu ekranları WebSocket ya da SSE ile çalışır. Kamuya açık API\'lerde hız sınırı hem güvenlik hem maliyet konusudur; sınırı ve kalan kotayı <code>X-RateLimit-Remaining</code> gibi başlıklarla belgelemek iyi bir API tasarımıdır.</div>')
html = ''.join(H)

import veri
_con = veri.baglan('anadolu_market', tablolar=['orders'])
TUM = [r[0] for r in _con.execute('SELECT order_id FROM orders ORDER BY order_date DESC, order_id DESC')]
ILK = TUM[:20]

IMLEC = d('''
    import base64
    import json

    def imlec_kodla(tarih, sid):
        return base64.urlsafe_b64encode(json.dumps([tarih, sid]).encode()).decode()

    def imlec_coz(metin):
        tarih, sid = json.loads(base64.urlsafe_b64decode(metin.encode()))
        return tarih, sid
''')
SAYFA_SETUP = 'import veri\ncon = veri.baglan("anadolu_market", tablolar=["orders"])\n' + IMLEC

ex = []
ex.append(dict(t='mc', stage='Isınma', q='Mobil uygulamada siparişler offset sayfalamayla (<code>LIMIT 20 OFFSET 20</code>) en yeniden eskiye listeleniyor. Kullanıcı 1. sayfayı okurken 3 yeni sipariş geldi. 2. sayfada ne olur?',
    o=['Hiçbir şey; veritabanı ilk sorgunun anlık görüntüsünü saklar ve 2. sayfa ona göre gelir',
       '1. sayfanın son 3 siparişi 2. sayfanın başında tekrar görünür',
       '2. sayfa boş döner çünkü OFFSET değeri artık geçersiz olur',
       'Yeni 3 sipariş 2. sayfanın sonuna eklenir'],
    a=1, why='Yeni kayıtlar listenin başına girince her şey 3 sıra kayar; OFFSET 20 artık eski 18. sıradan başlar. Cursor sayfalama "şu anahtardan sonrası" dediği için bu kaymadan etkilenmez.'))
ex.append(dict(t='mc', stage='Isınma', q='Kurye uygulaması konumunu saniyede bir sunucuya gönderiyor, müşteri ekranı da kurye konumunu canlı izliyor. Kurye tarafı için en uygun teknoloji hangisi?',
    o=['SSE, çünkü düz HTTP üzerinden çalışır ve vekil sunucularla uyumludur', 'Her saniye konum için yeni bir POST isteği açıp kapatmak', 'WebSocket, çünkü istemci de sürekli veri gönderiyor', 'Her 10 saniyede bir GET isteğiyle sunucuyu yoklamak (polling)'],
    a=2, why='SSE tek yönlüdür (sunucudan istemciye). Kurye sürekli veri gönderdiği için iki yönlü ve açık kalan WebSocket bağlantısı uygundur. Müşteri ekranı ise yalnız dinlediği için SSE ile de beslenebilir.'))
ex.append(dict(t='predict', stage='Kodu oku', q='Jeton kovası (token bucket) simülasyonu. Bu kod ne yazdırır?',
    code=d('''
        kapasite, hiz = 2, 0.5
        jeton, son = 2.0, 0.0
        sonuc = []
        for t in (0, 0, 0, 2, 3, 4):
            jeton = min(kapasite, jeton + (t - son) * hiz)
            son = t
            if jeton >= 1:
                jeton -= 1
                sonuc.append("+")
            else:
                sonuc.append("-")
        print("".join(sonuc))
    '''),
    o=['++-+-+', '++-++-', '+++-+-', '++----'], a=0,
    why='İlk iki istek kovadaki 2 jetonu harcar, üçüncü reddedilir. t=2\'de 2 sn × 0.5 = 1 jeton dolmuş: kabul. t=3\'te yalnız 0.5 jeton: red. t=4\'te 0.5 + 0.5 = 1: kabul.'))
ex.append(dict(t='code', id='fastapi-w1', stage='Rehberli', diff=1,
    q='<p>Cursor sayfalama için imleç kodlayıcı yaz. <code>imlec_kodla(tarih, sid)</code>: <code>[tarih, sid]</code> listesini JSON\'a, sonra <code>base64.urlsafe_b64encode</code> ile metne çevirsin (dönüş <code>str</code>). <code>imlec_coz(metin)</code>: tersini yapıp <code>(tarih, sid)</code> demeti döndürsün; bozuk imleçte (<code>binascii.Error</code>, <code>json.JSONDecodeError</code>, <code>UnicodeDecodeError</code>, yanlış yapı) <code>ValueError("geçersiz imleç")</code> fırlatsın. Yapı denetimi: 2 elemanlı liste, ilki <code>str</code>, ikincisi <code>int</code>.</p>',
    guide=['Kodlarken: json.dumps → .encode() → urlsafe_b64encode → .decode().', 'Çözerken tersini yap; json.loads bytes da kabul eder.', 'Çözme adımlarını try içine al; yakaladığın hataları ValueError\'a çevir.', 'Yapıyı isinstance ile denetle.'],
    example='import base64\nb = base64.urlsafe_b64encode("merhaba".encode()).decode()\nprint(b, base64.urlsafe_b64decode(b).decode())\n',
    start='import base64\nimport binascii\nimport json\n\ndef imlec_kodla(tarih, sid):\n    # TODO\n    pass\n\ndef imlec_coz(metin):\n    # TODO\n    pass\n',
    sol=d('''
        import base64
        import binascii
        import json

        def imlec_kodla(tarih, sid):
            return base64.urlsafe_b64encode(json.dumps([tarih, sid]).encode()).decode()

        def imlec_coz(metin):
            try:
                veri = json.loads(base64.urlsafe_b64decode(metin.encode()))
            except (binascii.Error, json.JSONDecodeError, UnicodeDecodeError) as h:
                raise ValueError("geçersiz imleç") from h
            if not (isinstance(veri, list) and len(veri) == 2 and isinstance(veri[0], str) and isinstance(veri[1], int)):
                raise ValueError("geçersiz imleç")
            return veri[0], veri[1]
    '''),
    tests=d('''
        i = imlec_kodla("2024-12-31", 905)
        assert isinstance(i, str), "Dönüş metin (str) olmalı"
        assert imlec_coz(i) == ("2024-12-31", 905), "Kodlanan imleç geri çözülebilmeli"
        for bozuk in ("@@@", "bm90IGpzb24=", base64.urlsafe_b64encode(b'{"a": 1}').decode()):
            try:
                imlec_coz(bozuk)
                assert False, f"{bozuk!r} için ValueError beklenirdi"
            except ValueError as h:
                assert str(h) == "geçersiz imleç"
    '''),
    hints=['base64 metin değil bytes ile çalışır: encode/decode adımlarını unutma.', 'except (binascii.Error, json.JSONDecodeError, UnicodeDecodeError) ile yakala; json.JSONDecodeError zaten ValueError alt sınıfıdır.'],
    why='İmleç istemciye opak bir metin olarak verilir; içini kurcalayan ya da bozan istemci 500 değil, 400/422 almalıdır. Bu yüzden çözme hataları tek bir anlamlı hataya çevrilir.'))
ex.append(dict(t='code', id='fastapi-w2', stage='Rehberli', diff=2, needs=['sqlite3'],
    q='<p>Anadolu Market\'in gerçek <code>orders</code> tablosu için cursor sayfalama yaz: <code>siparis_sayfasi(con, imlec=None, limit=20)</code>. Sıralama <code>order_date DESC, order_id DESC</code>. İmleç varsa çöz ve <code>WHERE (order_date, order_id) &lt; (?, ?)</code> uygula. Dönüş: <code>{"ogeler": [order_id, ...], "sonraki": imlec_ya_da_None}</code>. Sonraki imleç, sayfa tam doluysa son satırın <code>(order_date, order_id)</code> değerinden üretilsin. İmleç yardımcıları hazır.</p>',
    guide=['Temel SQL\'i ve boş parametre listesini hazırla.', 'İmleç varsa imlec_coz ile çöz, WHERE koşulunu ve iki parametreyi ekle.', 'ORDER BY ... LIMIT ? ile çalıştır.', 'Satır sayısı limit\'e eşitse son satırdan imleç üret, değilse None.'],
    example='import sqlite3\nc = sqlite3.connect(":memory:")\nprint(c.execute("SELECT (1, 5) < (1, 7), (2, 1) < (1, 9)").fetchone())\n',
    start=SAYFA_SETUP + '\ndef siparis_sayfasi(con, imlec=None, limit=20):\n    sql = "SELECT order_date, order_id FROM orders"\n    parametreler = []\n    # TODO: imleç koşulu, sıralama, limit, sonraki imleç\n    return {"ogeler": [], "sonraki": None}\n',
    sol=SAYFA_SETUP + d('''

        def siparis_sayfasi(con, imlec=None, limit=20):
            sql = "SELECT order_date, order_id FROM orders"
            parametreler = []
            if imlec:
                tarih, sid = imlec_coz(imlec)
                sql += " WHERE (order_date, order_id) < (?, ?)"
                parametreler += [tarih, sid]
            sql += " ORDER BY order_date DESC, order_id DESC LIMIT ?"
            satirlar = con.execute(sql, parametreler + [limit]).fetchall()
            sonraki = imlec_kodla(*satirlar[-1]) if len(satirlar) == limit else None
            return {"ogeler": [s[1] for s in satirlar], "sonraki": sonraki}
    '''),
    tests=f'''s = siparis_sayfasi(con)
assert s["ogeler"] == {ILK!r}, "İlk sayfa en yeni 20 sipariş olmalı"
assert s["sonraki"] is not None, "Tam dolu sayfada sonraki imleç olmalı"
hepsi, im, adim = [], None, 0
while True:
    s = siparis_sayfasi(con, im, limit=50)
    hepsi += s["ogeler"]
    im = s["sonraki"]
    adim += 1
    if im is None or adim > 30:
        break
assert len(hepsi) == 910 and len(set(hepsi)) == 910, f"Tüm sayfalar 910 benzersiz sipariş vermeli, gelen {{len(hepsi)}} / {{len(set(hepsi))}}"
assert hepsi == {TUM!r}, "Sayfalar birleşince tam sıralı liste çıkmalı"
''',
    hints=['SQLite satır değeri karşılaştırması (a, b) < (?, ?) iki sütunlu sözlük sırası karşılaştırmasıdır.', 'Sonraki imleç: imlec_kodla(*satirlar[-1]) — satır zaten (order_date, order_id) sırasında.'],
    why='Tarih tek başına benzersiz olmadığı için order_id eşitlik bozucu (tie-breaker) olarak eklenir. Böylece aynı gündeki 6 sipariş sayfa sınırına denk gelse de hiçbiri atlanmaz ya da tekrarlanmaz.'))
ex.append(dict(t='code', id='fastapi-w3', stage='Kendin yaz', diff=2, needs=['sqlite3'],
    q='<p>Filtre kalıbı: <code>filtre_sorgusu(parametreler)</code> sorgu parametresi sözlüğünü <code>(sql, degerler)</code> demetine çevirsin. Temel: <code>SELECT COUNT(*) FROM orders</code>. İzinli filtreler ve SQL karşılıkları (bu sırayla eklenir): <code>status</code> → <code>status = ?</code>, <code>channel</code> → <code>channel = ?</code>, <code>baslangic</code> → <code>order_date &gt;= ?</code>, <code>bitis</code> → <code>order_date &lt;= ?</code>. Koşullar <code>" WHERE "</code> ve <code>" AND "</code> ile birleşir. İzinsiz anahtar varsa <code>ValueError</code> (mesajda anahtar adı geçsin). Testler sorguyu gerçek <code>orders</code> tablosunda çalıştırır.</p>',
    start='import veri\ncon = veri.baglan("anadolu_market", tablolar=["orders"])\n\ndef filtre_sorgusu(parametreler):\n    pass\n',
    sol=d('''
        import veri
        con = veri.baglan("anadolu_market", tablolar=["orders"])

        IZINLI = {"status": "status = ?", "channel": "channel = ?",
                  "baslangic": "order_date >= ?", "bitis": "order_date <= ?"}

        def filtre_sorgusu(parametreler):
            bilinmeyen = set(parametreler) - set(IZINLI)
            if bilinmeyen:
                raise ValueError(f"bilinmeyen filtre: {', '.join(sorted(bilinmeyen))}")
            kosullar, degerler = [], []
            for anahtar, kosul in IZINLI.items():
                if anahtar in parametreler:
                    kosullar.append(kosul)
                    degerler.append(parametreler[anahtar])
            sql = "SELECT COUNT(*) FROM orders"
            if kosullar:
                sql += " WHERE " + " AND ".join(kosullar)
            return sql, degerler
    '''),
    tests=d('''
        sql, d = filtre_sorgusu({"channel": "mobile", "status": "delivered"})
        assert sql == "SELECT COUNT(*) FROM orders WHERE status = ? AND channel = ?", f"Sıra izinli listedeki gibi: {sql}"
        assert d == ["delivered", "mobile"]
        assert con.execute(sql, d).fetchone()[0] == 330, "Mobilde teslim edilen 330 sipariş var"
        sql2, d2 = filtre_sorgusu({"baslangic": "2024-01-01", "bitis": "2024-12-31", "status": "returned"})
        assert con.execute(sql2, d2).fetchone()[0] == con.execute("SELECT COUNT(*) FROM orders WHERE status='returned' AND order_date LIKE '2024%'").fetchone()[0]
        assert filtre_sorgusu({}) == ("SELECT COUNT(*) FROM orders", [])
        try:
            filtre_sorgusu({"status": "x", "1=1; DROP TABLE orders": "1"})
            assert False, "İzinsiz anahtar reddedilmeli"
        except ValueError as h:
            assert "DROP" in str(h), "Hata mesajında anahtar adı geçmeli"
    '''),
    hints=['İzinli filtreleri sıralı bir sözlükte tut; sözlükler ekleme sırasını korur.', 'Değerleri asla SQL metnine yapıştırma; ? yer tutucusu ve parametre listesi kullan.'],
    why='Beyaz liste hem SQL enjeksiyonunu hem yazım hatası olan parametrelerin sessizce yok sayılmasını önler. FastAPI\'de bu fonksiyon bir bağımlılık (Depends) olarak sorgu parametrelerini toplar.'))
ex.append(dict(t='code', id='fastapi-w4', stage='Kendin yaz', diff=2,
    q='<p>Anahtar başına jeton kovası: <code>Sinirlayici(kapasite, hiz, saat)</code>. <code>saat</code> çağrıldığında saniye döndüren bir fonksiyon (testte sahte saat verilir). <code>izin_ver(anahtar)</code> <code>(izin, bekle)</code> döndürsün: jeton varsa <code>(True, 0.0)</code>; yoksa <code>(False, s)</code>, s bir jetonun dolması için gereken saniye (2 basamak). Her anahtarın kovası ilk istekte dolu başlar; kovalar birbirinden bağımsızdır.</p>',
    start='class Sinirlayici:\n    pass\n',
    sol=d('''
        class Sinirlayici:
            def __init__(self, kapasite, hiz, saat):
                self.kapasite, self.hiz, self.saat = kapasite, hiz, saat
                self.kovalar = {}

            def izin_ver(self, anahtar):
                simdi = self.saat()
                jeton, son = self.kovalar.get(anahtar, (float(self.kapasite), simdi))
                jeton = min(self.kapasite, jeton + (simdi - son) * self.hiz)
                if jeton >= 1:
                    self.kovalar[anahtar] = (jeton - 1, simdi)
                    return True, 0.0
                self.kovalar[anahtar] = (jeton, simdi)
                return False, round((1 - jeton) / self.hiz, 2)
    '''),
    tests=d('''
        t = [0.0]
        s = Sinirlayici(kapasite=2, hiz=0.5, saat=lambda: t[0])
        assert s.izin_ver("a") == (True, 0.0) and s.izin_ver("a") == (True, 0.0), "İlk iki istek kapasiteden"
        assert s.izin_ver("a") == (False, 2.0), "Jeton bitti: 1 jeton için 1/0.5 = 2 sn beklemeli"
        assert s.izin_ver("b") == (True, 0.0), "Başka anahtarın kovası ayrı"
        t[0] = 1.0
        assert s.izin_ver("a") == (False, 1.0), "1 sn sonra 0.5 jeton var; 1 sn daha gerek"
        t[0] = 2.0
        assert s.izin_ver("a") == (True, 0.0), "2. saniyede 1 jeton dolmuş olmalı"
        t[0] = 100.0
        assert [s.izin_ver("a")[0] for _ in range(3)] == [True, True, False], "Kova kapasiteden fazla dolmamalı"
    '''),
    hints=['Her anahtar için (jeton, son_zaman) sakla.', 'Dolum: min(kapasite, jeton + geçen_süre * hiz).', 'Bekleme: (1 - jeton) / hiz.'],
    why='Retry-After için gereken süreyi hesaplamak istemciye "ne zaman tekrar dene" bilgisini verir; körlemesine yeniden deneme fırtınasını önler. Saat fonksiyonunu dışarıdan almak testi deterministik yapar.'))
ex.append(dict(t='code', id='fastapi-w5', stage='Kendin yaz', diff=2,
    q='<p>WebSocket yayın yöneticisinin mantığını yaz: <code>YayinYoneticisi</code>. <code>baglan(ws)</code> ve <code>ayril(ws)</code> bağlantıyı kümeye ekler/çıkarır (olmayanı çıkarmak hata vermesin). <code>async yayinla(mesaj)</code> her bağlantının <code>await ws.send_json(mesaj)</code> metodunu çağırsın; gönderimde istisna fırlatan bağlantıyı kümeden çıkarsın ve diğerlerine göndermeye devam etsin. Başarılı gönderim sayısını döndürsün. <code>len(yonetici)</code> bağlı istemci sayısını versin.</p>',
    start='class YayinYoneticisi:\n    pass\n',
    sol=d('''
        class YayinYoneticisi:
            def __init__(self):
                self.baglantilar = set()

            def baglan(self, ws):
                self.baglantilar.add(ws)

            def ayril(self, ws):
                self.baglantilar.discard(ws)

            def __len__(self):
                return len(self.baglantilar)

            async def yayinla(self, mesaj):
                basarili = 0
                for ws in list(self.baglantilar):
                    try:
                        await ws.send_json(mesaj)
                        basarili += 1
                    except Exception:
                        self.ayril(ws)
                return basarili
    '''),
    tests=d('''
        import asyncio
        class WS:
            def __init__(self, kopuk=False):
                self.kopuk, self.gelen = kopuk, []
            async def send_json(self, m):
                if self.kopuk:
                    raise ConnectionError("koptu")
                self.gelen.append(m)
        y = YayinYoneticisi()
        a, b, c = WS(), WS(kopuk=True), WS()
        for w in (a, b, c):
            y.baglan(w)
        assert len(y) == 3
        n = asyncio.run(y.yayinla({"siparis": 905, "durum": "kargoda"}))
        assert n == 2, f"İki başarılı gönderim olmalı, gelen {n}"
        assert len(y) == 2 and b not in y.baglantilar, "Kopuk bağlantı çıkarılmalı"
        assert a.gelen == c.gelen == [{"siparis": 905, "durum": "kargoda"}]
        y.ayril(WS())
        y.ayril(a)
        assert len(y) == 1
    '''),
    hints=['Küme üzerinde gezerken ondan eleman çıkarmak RuntimeError verir: list(self.baglantilar) kopyası üzerinde gez.', 'discard, olmayan elemanda hata vermez.'],
    why='Kopan istemciyi temizlemezsen her yayında aynı hata tekrar eder ve bellek sızar. Kopya üzerinde gezmek, döngü sırasında kümeyi güvenle değiştirmeni sağlar.'))
ex.append(dict(t='code', id='fastapi-w6', stage='Hata avı', kind='bug', diff=2, needs=['sqlite3'],
    q='<p>Hatayı bul ve düzelt. Mobil ekip "sonsuz kaydırmada bazı siparişler hiç görünmüyor" diyor. <code>sayfa_getir(con, son_tarih=None, limit=50)</code> imleç olarak yalnız son satırın tarihini kullanıyor. Aynı gün birden çok sipariş olduğunda sayfa sınırındaki siparişler atlanıyor. Fonksiyonu <code>(order_date, order_id)</code> ikilisiyle çalışacak şekilde düzelt: parametre adı <code>son</code> olsun (ya <code>None</code> ya da <code>(tarih, id)</code> demeti), dönüş <code>(id_listesi, yeni_son)</code>; sayfa eksik dolarsa <code>yeni_son</code> <code>None</code>.</p>',
    start=d('''
        import veri
        con = veri.baglan("anadolu_market", tablolar=["orders"])

        def sayfa_getir(con, son=None, limit=50):
            sql, p = "SELECT order_date, order_id FROM orders", []
            if son:
                sql += " WHERE order_date < ?"
                p.append(son[0])
            sql += " ORDER BY order_date DESC LIMIT ?"
            satirlar = con.execute(sql, p + [limit]).fetchall()
            yeni = (satirlar[-1][0], satirlar[-1][1]) if len(satirlar) == limit else None
            return [s[1] for s in satirlar], yeni
    '''),
    sol=d('''
        import veri
        con = veri.baglan("anadolu_market", tablolar=["orders"])

        def sayfa_getir(con, son=None, limit=50):
            sql, p = "SELECT order_date, order_id FROM orders", []
            if son:
                sql += " WHERE (order_date, order_id) < (?, ?)"
                p += [son[0], son[1]]
            sql += " ORDER BY order_date DESC, order_id DESC LIMIT ?"
            satirlar = con.execute(sql, p + [limit]).fetchall()
            yeni = (satirlar[-1][0], satirlar[-1][1]) if len(satirlar) == limit else None
            return [s[1] for s in satirlar], yeni
    '''),
    tests=d('''
        hepsi, son = [], None
        for _ in range(40):
            ids, son = sayfa_getir(con, son, limit=50)
            hepsi += ids
            if son is None:
                break
        assert len(set(hepsi)) == 910, f"910 siparişin hepsi görünmeli; görünen {len(set(hepsi))}"
        assert len(hepsi) == 910, "Hiçbir sipariş iki kez gelmemeli"
        ids, _ = sayfa_getir(con, ("2024-11-27", 10**9), limit=6)
        assert len(ids) == 6 and len(set(ids)) == 6
    '''),
    hints=['Sıralama anahtarı benzersiz olmalı: tarih + id.', 'Hem WHERE koşulunda hem ORDER BY\'da ikinci anahtarı kullan.'],
    why='Yalnız tarihe göre "< son_tarih" demek, son tarihle aynı gündeki ama sayfaya sığmamış siparişleri atlar; sıralamada id olmadığı için aynı gündeki siparişlerin sırası da belirsizdir.'))
ex.append(dict(t='code', id='fastapi-w7', stage='Meydan okuma', diff=3,
    q='<p>Hız sınırı ara katmanını (middleware) yaz. <code>hiz_siniri(uygulama, sinirlayici)</code> bir async fonksiyon döndürsün: <code>async def sarili(istek)</code>. <code>istek</code> sözlüğünde <code>"basliklar"</code> (sözlük) ve <code>"istemci"</code> (IP) var. Anahtar: <code>X-API-Key</code> başlığı varsa o, yoksa IP. <code>sinirlayici.izin_ver(anahtar)</code> <code>(izin, bekle)</code> döndürür (önceki görevdeki gibi). İzin yoksa uygulamayı <b>çağırmadan</b> <code>{"durum": 429, "govde": {"detail": "Çok fazla istek"}, "basliklar": {"Retry-After": str(math.ceil(bekle))}}</code> döndür. İzin varsa <code>await uygulama(istek)</code> sonucunu döndür ama yanıt başlıklarına <code>"X-RateLimit-Key"</code> olarak kullanılan anahtar türünü (<code>"api-key"</code> ya da <code>"ip"</code>) ekle (yanıtta <code>basliklar</code> yoksa oluştur; orijinal sözlüğü değiştirme).</p>',
    start='import math\n\ndef hiz_siniri(uygulama, sinirlayici):\n    pass\n',
    sol=d('''
        import math

        def hiz_siniri(uygulama, sinirlayici):
            async def sarili(istek):
                api_anahtari = istek.get("basliklar", {}).get("X-API-Key")
                anahtar = api_anahtari or istek["istemci"]
                izin, bekle = sinirlayici.izin_ver(anahtar)
                if not izin:
                    return {"durum": 429, "govde": {"detail": "Çok fazla istek"},
                            "basliklar": {"Retry-After": str(math.ceil(bekle))}}
                yanit = await uygulama(istek)
                basliklar = dict(yanit.get("basliklar", {}))
                basliklar["X-RateLimit-Key"] = "api-key" if api_anahtari else "ip"
                return {**yanit, "basliklar": basliklar}
            return sarili
    '''),
    tests=d('''
        import asyncio
        class S:
            def __init__(self, izinler):
                self.izinler, self.gorulen = list(izinler), []
            def izin_ver(self, anahtar):
                self.gorulen.append(anahtar)
                return self.izinler.pop(0)
        cagri = []
        SABIT = {"durum": 200, "govde": {"ok": True}}
        async def uygulama(istek):
            cagri.append(istek["istemci"])
            return SABIT
        s = S([(True, 0.0), (False, 1.2), (True, 0.0)])
        m = hiz_siniri(uygulama, s)
        r1 = asyncio.run(m({"basliklar": {}, "istemci": "10.0.0.1"}))
        assert r1 == {"durum": 200, "govde": {"ok": True}, "basliklar": {"X-RateLimit-Key": "ip"}}, f"Gelen {r1}"
        assert "basliklar" not in SABIT, "Uygulamanın döndürdüğü sözlük değiştirilmemeli"
        r2 = asyncio.run(m({"basliklar": {}, "istemci": "10.0.0.1"}))
        assert r2["durum"] == 429 and r2["basliklar"] == {"Retry-After": "2"}, "1.2 sn yukarı yuvarlanır: 2"
        assert cagri == ["10.0.0.1"], "Reddedilen istekte uygulama çağrılmamalı"
        r3 = asyncio.run(m({"basliklar": {"X-API-Key": "k-42"}, "istemci": "10.0.0.1"}))
        assert s.gorulen[-1] == "k-42" and r3["basliklar"]["X-RateLimit-Key"] == "api-key"
    '''),
    hints=['Kapanış (closure): dış fonksiyon uygulama ve sinirlayici\'yi yakalar, içteki async fonksiyonu döndürür.', 'Yanıtı kopyalamak için {**yanit, "basliklar": yeni_basliklar} kullan.', 'math.ceil(1.2) == 2'],
    why='Gerçek FastAPI middleware\'i de aynı biçimdedir: isteği alır, ya kısa devre yapar (429) ya da call_next ile zinciri sürdürür ve yanıtı süsler. Orijinal yanıtı değiştirmemek paylaşılan nesnelerde sürpriz hataları önler.'))

faq = [
    dict(q='Toplam kayıt sayısını (toplam: 910) cursor sayfalamada da döndürmeli miyim?', a='Zorunlu değil ve büyük tablolarda <code>COUNT(*)</code> pahalıdır. Sonsuz kaydırmada yalnız <code>sonraki</code> imleci yeter. Sayı gerekiyorsa ayrı bir uç noktada, önbellekli ya da yaklaşık olarak ver.'),
    dict(q='Hız sınırını uygulamada mı, ağ geçidinde mi yapmalıyım?', a='İkisi birlikte: Nginx, bulut API ağ geçidi ya da CDN kaba sınırları (IP başına) uygular; uygulama ise iş kurallarına bağlı sınırları (plan, kullanıcı, uç nokta) uygular. Çok süreçli uygulamada sayaçları Redis gibi ortak bir depoda tut.'),
]
mistakes = [dict(bad='sql += " WHERE order_date < ?"  # imleç = son tarih', good='sql += " WHERE (order_date, order_id) < (?, ?)"', why='Benzersiz olmayan sıralama anahtarı sayfa sınırındaki kayıtları atlatır; eşitlik bozucu olarak id ekle.')]
emit(dict(id='fastapi', min=28, html=html, ex=ex, faq=faq, mistakes=mistakes), 'WebSocket/SSE, cursor sayfalama ve filtre, hız sınırı middleware, async DB oturumu (AUDIT Ekle-11)')
