/* PythonPatika — 'fastapi' dersi uzantısı: WebSocket/SSE, cursor sayfalama ve filtre, hız sınırı middleware, async DB oturumu (AUDIT Ekle-11) */
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
  { id: 'fastapi',
    min: 28,
    html: `<h2>Derinleş: gerçek zamanlı uç noktalar, sayfalama, hız sınırı ve async veritabanı</h2><p>CRUD uç noktaları bir API'nin iskeletidir; canlıda ise şu sorular gelir: "Sipariş durumu değişince ekran kendiliğinden güncellensin", "910 siparişi sayfa sayfa getir ama yeni sipariş gelince kayma olmasın", "bir istemci saniyede 500 istek atıp sistemi düşürmesin", "veritabanı beklerken sunucu kilitlenmesin". Bu bölüm dört konuyu FastAPI kodu (kendi bilgisayarında) ve tarayıcıda çalışan çekirdek mantıkla anlatıyor; sayfalama örnekleri Anadolu Market'in gerçek <code>orders</code> tablosunu kullanıyor.</p><h3>WebSocket ve SSE</h3><p><b>WebSocket</b> iki yönlü, sürekli açık bir bağlantıdır: sohbet, canlı pano, ortak düzenleme. Sunucu birden çok istemciye aynı mesajı gönderecekse (yayın, broadcast) bağlantıları bir yöneticide tutar; kopan bağlantıyı listeden çıkarmayı unutmamalıdır. <b>SSE</b> ise tek yönlüdür (sunucu → istemci), düz HTTP üzerinden çalışır ve LLM cevabı ya da bildirim akışı için yeterlidir (LLM API dersindeki ek bölüm).</p><pre class="code">from fastapi import FastAPI, WebSocket, WebSocketDisconnect
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
    return StreamingResponse(uret(), media_type="text/event-stream")</pre><p>Birden çok sunucu süreci (worker) çalışıyorsa her sürecin kendi bağlantı listesi olur; yayını tüm süreçlere ulaştırmak için Redis Pub/Sub gibi ortak bir kanal gerekir.</p><h3>Sayfalama: offset mi, cursor mu?</h3><div class="tbl-wrap"><table><tr><th></th><th>Offset (<code>?sayfa=3&amp;boyut=20</code>)</th><th>Cursor / keyset (<code>?imlec=...</code>)</th></tr><tr><td>Sorgu</td><td><code>LIMIT 20 OFFSET 40</code></td><td><code>WHERE (tarih, id) &lt; (?, ?) LIMIT 20</code></td></tr><tr><td>Derin sayfa</td><td>Veritabanı atlanan satırları da okur; yavaşlar</td><td>İndeksle doğrudan konuma gider; hep hızlı</td></tr><tr><td>Araya kayıt girerse</td><td>Satırlar kayar: tekrar ya da atlama</td><td>Kayma yok</td></tr><tr><td>"7. sayfaya git"</td><td>Kolay</td><td>Yok; yalnız sonraki/önceki</td></tr></table></div><p>Cursor sayfalamanın kuralı: sıralama anahtarı <b>benzersiz</b> olmalıdır. Sipariş tarihi tek başına benzersiz değildir (aynı gün 6 sipariş olabiliyor); bu yüzden <code>(order_date, order_id)</code> ikilisi kullanılır. İmleç, son satırın anahtarını taşıyan opak bir metindir (base64 ile kodlanmış JSON).</p><pre class="py">import base64, json
import veri

con = veri.baglan("anadolu_market", tablolar=["orders"])

def imlec_yap(tarih, sid):
    return base64.urlsafe_b64encode(json.dumps([tarih, sid]).encode()).decode()

def sayfa(imlec=None, limit=5):
    sql, p = "SELECT order_id, order_date FROM orders", []
    if imlec:
        tarih, sid = json.loads(base64.urlsafe_b64decode(imlec))
        sql += " WHERE (order_date, order_id) &lt; (?, ?)"
        p = [tarih, sid]
    satirlar = con.execute(sql + " ORDER BY order_date DESC, order_id DESC LIMIT ?", p + [limit]).fetchall()
    sonraki = imlec_yap(*satirlar[-1][::-1]) if len(satirlar) == limit else None
    return satirlar, sonraki

s1, im = sayfa()
print(s1)
print("imleç:", im)
s2, _ = sayfa(im)
print(s2)</pre><p>Filtreleme de aynı uç noktada yapılır (<code>?status=delivered&amp;channel=mobile</code>). Güvenli kalıp: izin verilen filtreleri bir <b>beyaz listede</b> tut, değerleri her zaman <code>?</code> parametresiyle geçir, bilinmeyen parametreye 422 dön. Sütun adını kullanıcıdan alıp SQL'e yapıştırmak SQL enjeksiyonudur.</p><h3>Hız sınırı middleware'i</h3><p>En yaygın algoritma <b>jeton kovası</b>dır (token bucket): her istemcinin kovasında en fazla <code>kapasite</code> jeton vardır, kova saniyede <code>hiz</code> jeton dolar, her istek bir jeton harcar. Jeton yoksa <b>429 Too Many Requests</b> ve <code>Retry-After</code> başlığı dönülür. Kısa ani yüklere (burst) izin verir ama ortalama hızı sınırlar.</p><pre class="py">class Kova:
    def __init__(self, kapasite, hiz):
        self.kapasite, self.hiz = kapasite, hiz
        self.jeton, self.son = float(kapasite), 0.0
    def izin(self, simdi):
        self.jeton = min(self.kapasite, self.jeton + (simdi - self.son) * self.hiz)
        self.son = simdi
        if self.jeton &gt;= 1:
            self.jeton -= 1
            return True
        return False

k = Kova(kapasite=3, hiz=1)          # 3'lük patlama, saniyede 1 istek
print([k.izin(t) for t in (0, 0.1, 0.2, 0.3, 1.3, 1.4)])</pre><pre class="code">import time
from fastapi import Request
from fastapi.responses import JSONResponse

kovalar: dict[str, Kova] = {}

@app.middleware("http")
async def hiz_siniri(request: Request, call_next):
    anahtar = request.headers.get("X-API-Key") or request.client.host
    kova = kovalar.setdefault(anahtar, Kova(kapasite=20, hiz=5))
    if not kova.izin(time.monotonic()):
        return JSONResponse({"detail": "Çok fazla istek"}, status_code=429, headers={"Retry-After": "1"})
    return await call_next(request)</pre><p>Bu sözlük tek süreçte çalışır; çok süreçli üretimde sayaçlar Redis'te tutulur (ya da <code>slowapi</code> gibi bir kütüphane ve API ağ geçidi kullanılır). Zaman için <code>time.monotonic()</code> kullan: sistem saati geri alınsa bile ileri akar.</p><h3>Async veritabanı oturumu</h3><p><code>async def</code> uç noktada senkron veritabanı sürücüsü olay döngüsünü bloklar. SQLAlchemy 2'nin async motoru ve async sürücü (PostgreSQL için <code>asyncpg</code>, SQLite için <code>aiosqlite</code>) bekleme sırasında döngüyü serbest bırakır. Oturum, istek başına açılıp kapanan bir bağımlılıktır:</p><pre class="code"># pip install "sqlalchemy[asyncio]" asyncpg
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
    return sonuc.scalar_one_or_none()</pre><div class="note"><b>Gerçek işte</b>Mobil uygulamadaki sonsuz kaydırmalı listeler cursor sayfalamayla, kurye konumu ve sipariş durumu ekranları WebSocket ya da SSE ile çalışır. Kamuya açık API'lerde hız sınırı hem güvenlik hem maliyet konusudur; sınırı ve kalan kotayı <code>X-RateLimit-Remaining</code> gibi başlıklarla belgelemek iyi bir API tasarımıdır.</div>`,
    ex: [
      { t: 'mc',
        stage: 'Isınma',
        q: 'Mobil uygulamada siparişler offset sayfalamayla (<code>LIMIT 20 OFFSET 20</code>) en yeniden eskiye listeleniyor. Kullanıcı 1. sayfayı okurken 3 yeni sipariş geldi. 2. sayfada ne olur?',
        o: ['Hiçbir şey; veritabanı ilk sorgunun anlık görüntüsünü saklar ve 2. sayfa ona göre gelir', '1. sayfanın son 3 siparişi 2. sayfanın başında tekrar görünür', '2. sayfa boş döner çünkü OFFSET değeri artık geçersiz olur', 'Yeni 3 sipariş 2. sayfanın sonuna eklenir'],
        a: 1,
        why: 'Yeni kayıtlar listenin başına girince her şey 3 sıra kayar; OFFSET 20 artık eski 18. sıradan başlar. Cursor sayfalama "şu anahtardan sonrası" dediği için bu kaymadan etkilenmez.' },
      { t: 'mc',
        stage: 'Isınma',
        q: 'Kurye uygulaması konumunu saniyede bir sunucuya gönderiyor, müşteri ekranı da kurye konumunu canlı izliyor. Kurye tarafı için en uygun teknoloji hangisi?',
        o: ['SSE, çünkü düz HTTP üzerinden çalışır ve vekil sunucularla uyumludur', 'Her saniye konum için yeni bir POST isteği açıp kapatmak', 'WebSocket, çünkü istemci de sürekli veri gönderiyor', 'Her 10 saniyede bir GET isteğiyle sunucuyu yoklamak (polling)'],
        a: 2,
        why: 'SSE tek yönlüdür (sunucudan istemciye). Kurye sürekli veri gönderdiği için iki yönlü ve açık kalan WebSocket bağlantısı uygundur. Müşteri ekranı ise yalnız dinlediği için SSE ile de beslenebilir.' },
      { t: 'predict',
        stage: 'Kodu oku',
        q: 'Jeton kovası (token bucket) simülasyonu. Bu kod ne yazdırır?',
        code: 'kapasite, hiz = 2, 0.5\njeton, son = 2.0, 0.0\nsonuc = []\nfor t in (0, 0, 0, 2, 3, 4):\n    jeton = min(kapasite, jeton + (t - son) * hiz)\n    son = t\n    if jeton >= 1:\n        jeton -= 1\n        sonuc.append("+")\n    else:\n        sonuc.append("-")\nprint("".join(sonuc))\n',
        o: ['++-+-+', '++-++-', '+++-+-', '++----'],
        a: 0,
        why: 'İlk iki istek kovadaki 2 jetonu harcar, üçüncü reddedilir. t=2\'de 2 sn × 0.5 = 1 jeton dolmuş: kabul. t=3\'te yalnız 0.5 jeton: red. t=4\'te 0.5 + 0.5 = 1: kabul.' },
      { t: 'code',
        id: 'fastapi-w1',
        stage: 'Rehberli',
        diff: 1,
        q: '<p>Cursor sayfalama için imleç kodlayıcı yaz. <code>imlec_kodla(tarih, sid)</code>: <code>[tarih, sid]</code> listesini JSON\'a, sonra <code>base64.urlsafe_b64encode</code> ile metne çevirsin (dönüş <code>str</code>). <code>imlec_coz(metin)</code>: tersini yapıp <code>(tarih, sid)</code> demeti döndürsün; bozuk imleçte (<code>binascii.Error</code>, <code>json.JSONDecodeError</code>, <code>UnicodeDecodeError</code>, yanlış yapı) <code>ValueError("geçersiz imleç")</code> fırlatsın. Yapı denetimi: 2 elemanlı liste, ilki <code>str</code>, ikincisi <code>int</code>.</p>',
        guide: ['Kodlarken: json.dumps → .encode() → urlsafe_b64encode → .decode().', 'Çözerken tersini yap; json.loads bytes da kabul eder.', 'Çözme adımlarını try içine al; yakaladığın hataları ValueError\'a çevir.', 'Yapıyı isinstance ile denetle.'],
        example: 'import base64\nb = base64.urlsafe_b64encode("merhaba".encode()).decode()\nprint(b, base64.urlsafe_b64decode(b).decode())\n',
        start: 'import base64\nimport binascii\nimport json\n\ndef imlec_kodla(tarih, sid):\n    # TODO\n    pass\n\ndef imlec_coz(metin):\n    # TODO\n    pass\n',
        sol: 'import base64\nimport binascii\nimport json\n\ndef imlec_kodla(tarih, sid):\n    return base64.urlsafe_b64encode(json.dumps([tarih, sid]).encode()).decode()\n\ndef imlec_coz(metin):\n    try:\n        veri = json.loads(base64.urlsafe_b64decode(metin.encode()))\n    except (binascii.Error, json.JSONDecodeError, UnicodeDecodeError) as h:\n        raise ValueError("geçersiz imleç") from h\n    if not (isinstance(veri, list) and len(veri) == 2 and isinstance(veri[0], str) and isinstance(veri[1], int)):\n        raise ValueError("geçersiz imleç")\n    return veri[0], veri[1]\n',
        tests: 'i = imlec_kodla("2024-12-31", 905)\nassert isinstance(i, str), "Dönüş metin (str) olmalı"\nassert imlec_coz(i) == ("2024-12-31", 905), "Kodlanan imleç geri çözülebilmeli"\nfor bozuk in ("@@@", "bm90IGpzb24=", base64.urlsafe_b64encode(b\'{"a": 1}\').decode()):\n    try:\n        imlec_coz(bozuk)\n        assert False, f"{bozuk!r} için ValueError beklenirdi"\n    except ValueError as h:\n        assert str(h) == "geçersiz imleç"\n',
        hints: ['base64 metin değil bytes ile çalışır: encode/decode adımlarını unutma.', 'except (binascii.Error, json.JSONDecodeError, UnicodeDecodeError) ile yakala; json.JSONDecodeError zaten ValueError alt sınıfıdır.'],
        why: 'İmleç istemciye opak bir metin olarak verilir; içini kurcalayan ya da bozan istemci 500 değil, 400/422 almalıdır. Bu yüzden çözme hataları tek bir anlamlı hataya çevrilir.' },
      { t: 'code',
        id: 'fastapi-w2',
        stage: 'Rehberli',
        diff: 2,
        needs: ['sqlite3'],
        q: '<p>Anadolu Market\'in gerçek <code>orders</code> tablosu için cursor sayfalama yaz: <code>siparis_sayfasi(con, imlec=None, limit=20)</code>. Sıralama <code>order_date DESC, order_id DESC</code>. İmleç varsa çöz ve <code>WHERE (order_date, order_id) &lt; (?, ?)</code> uygula. Dönüş: <code>{"ogeler": [order_id, ...], "sonraki": imlec_ya_da_None}</code>. Sonraki imleç, sayfa tam doluysa son satırın <code>(order_date, order_id)</code> değerinden üretilsin. İmleç yardımcıları hazır.</p>',
        guide: ['Temel SQL\'i ve boş parametre listesini hazırla.', 'İmleç varsa imlec_coz ile çöz, WHERE koşulunu ve iki parametreyi ekle.', 'ORDER BY ... LIMIT ? ile çalıştır.', 'Satır sayısı limit\'e eşitse son satırdan imleç üret, değilse None.'],
        example: 'import sqlite3\nc = sqlite3.connect(":memory:")\nprint(c.execute("SELECT (1, 5) < (1, 7), (2, 1) < (1, 9)").fetchone())\n',
        start: 'import veri\ncon = veri.baglan("anadolu_market", tablolar=["orders"])\nimport base64\nimport json\n\ndef imlec_kodla(tarih, sid):\n    return base64.urlsafe_b64encode(json.dumps([tarih, sid]).encode()).decode()\n\ndef imlec_coz(metin):\n    tarih, sid = json.loads(base64.urlsafe_b64decode(metin.encode()))\n    return tarih, sid\n\ndef siparis_sayfasi(con, imlec=None, limit=20):\n    sql = "SELECT order_date, order_id FROM orders"\n    parametreler = []\n    # TODO: imleç koşulu, sıralama, limit, sonraki imleç\n    return {"ogeler": [], "sonraki": None}\n',
        sol: 'import veri\ncon = veri.baglan("anadolu_market", tablolar=["orders"])\nimport base64\nimport json\n\ndef imlec_kodla(tarih, sid):\n    return base64.urlsafe_b64encode(json.dumps([tarih, sid]).encode()).decode()\n\ndef imlec_coz(metin):\n    tarih, sid = json.loads(base64.urlsafe_b64decode(metin.encode()))\n    return tarih, sid\ndef siparis_sayfasi(con, imlec=None, limit=20):\n    sql = "SELECT order_date, order_id FROM orders"\n    parametreler = []\n    if imlec:\n        tarih, sid = imlec_coz(imlec)\n        sql += " WHERE (order_date, order_id) < (?, ?)"\n        parametreler += [tarih, sid]\n    sql += " ORDER BY order_date DESC, order_id DESC LIMIT ?"\n    satirlar = con.execute(sql, parametreler + [limit]).fetchall()\n    sonraki = imlec_kodla(*satirlar[-1]) if len(satirlar) == limit else None\n    return {"ogeler": [s[1] for s in satirlar], "sonraki": sonraki}\n',
        tests: 's = siparis_sayfasi(con)\nassert s["ogeler"] == [655, 882, 461, 255, 210, 117, 466, 454, 506, 456, 629, 239, 123, 539, 721, 608, 213, 806, 823, 47], "İlk sayfa en yeni 20 sipariş olmalı"\nassert s["sonraki"] is not None, "Tam dolu sayfada sonraki imleç olmalı"\nhepsi, im, adim = [], None, 0\nwhile True:\n    s = siparis_sayfasi(con, im, limit=50)\n    hepsi += s["ogeler"]\n    im = s["sonraki"]\n    adim += 1\n    if im is None or adim > 30:\n        break\nassert len(hepsi) == 910 and len(set(hepsi)) == 910, f"Tüm sayfalar 910 benzersiz sipariş vermeli, gelen {len(hepsi)} / {len(set(hepsi))}"\nassert hepsi == [655, 882, 461, 255, 210, 117, 466, 454, 506, 456, 629, 239, 123, 539, 721, 608, 213, 806, 823, 47, 397, 427, 770, 674, 437, 206, 597, 836, 566, 475, 797, 718, 344, 131, 63, 625, 517, 908, 535, 390, 842, 81, 18, 368, 335, 201, 127, 327, 302, 110, 654, 183, 803, 272, 102, 627, 582, 139, 881, 779, 740, 431, 487, 51, 209, 72, 910, 353, 284, 116, 46, 17, 680, 596, 205, 835, 604, 371, 238, 68, 750, 426, 150, 849, 516, 460, 217, 822, 653, 903, 534, 122, 24, 430, 568, 436, 769, 756, 581, 165, 130, 673, 453, 301, 887, 505, 237, 796, 343, 109, 727, 143, 101, 739, 515, 465, 204, 533, 425, 389, 595, 707, 652, 208, 182, 838, 768, 326, 271, 200, 749, 688, 525, 129, 565, 349, 57, 717, 514, 429, 138, 16, 342, 656, 607, 435, 45, 821, 841, 504, 198, 777, 532, 767, 886, 866, 325, 820, 121, 23, 564, 334, 471, 909, 679, 795, 455, 452, 434, 341, 802, 651, 603, 524, 424, 270, 128, 100, 590, 713, 181, 834, 687, 254, 170, 62, 538, 164, 441, 44, 50, 367, 513, 388, 115, 531, 626, 314, 80, 837, 748, 236, 300, 74, 708, 203, 672, 778, 594, 885, 99, 766, 580, 650, 142, 686, 523, 880, 720, 459, 329, 738, 324, 207, 726, 805, 678, 340, 197, 137, 548, 108, 43, 212, 15, 451, 819, 133, 22, 366, 348, 246, 613, 387, 186, 765, 503, 352, 149, 649, 685, 467, 848, 865, 716, 269, 433, 428, 281, 833, 794, 775, 617, 747, 671, 512, 71, 42, 884, 737, 180, 98, 14, 120, 907, 840, 339, 299, 628, 450, 163, 126, 530, 470, 593, 67, 235, 818, 432, 522, 423, 440, 563, 97, 41, 883, 537, 648, 323, 864, 764, 511, 479, 253, 202, 624, 268, 136, 21, 199, 793, 498, 234, 49, 13, 298, 844, 684, 589, 529, 502, 486, 386, 283, 879, 216, 179, 56, 832, 602, 746, 396, 817, 365, 313, 592, 474, 370, 567, 338, 185, 61, 579, 670, 736, 497, 677, 141, 804, 755, 763, 528, 510, 79, 12, 701, 521, 322, 267, 776, 233, 712, 536, 878, 816, 715, 73, 148, 119, 449, 337, 902, 612, 351, 297, 40, 616, 96, 162, 831, 439, 792, 647, 385, 606, 591, 801, 578, 266, 196, 168, 527, 464, 815, 328, 520, 496, 735, 509, 877, 683, 411, 501, 706, 588, 562, 66, 422, 20, 95, 70, 762, 333, 135, 321, 774, 11, 265, 167, 118, 39, 232, 347, 734, 682, 140, 364, 847, 245, 791, 336, 178, 473, 761, 485, 495, 296, 161, 60, 719, 601, 547, 700, 577, 669, 830, 107, 561, 876, 646, 526, 448, 384, 19, 410, 278, 38, 611, 395, 125, 814, 519, 508, 458, 10, 714, 463, 790, 745, 211, 906, 320, 264, 94, 725, 252, 231, 65, 760, 37, 645, 711, 147, 48, 623, 587, 134, 280, 132, 560, 494, 478, 295, 699, 177, 184, 363, 829, 681, 319, 843, 421, 383, 93, 875, 500, 409, 350, 195, 839, 69, 800, 230, 518, 36, 9, 615, 346, 215, 160, 705, 846, 644, 332, 507, 733, 676, 166, 600, 469, 318, 484, 813, 773, 263, 438, 176, 244, 106, 759, 472, 576, 668, 901, 559, 294, 92, 362, 282, 55, 610, 698, 8, 382, 447, 493, 369, 420, 317, 277, 499, 828, 789, 605, 78, 35, 812, 408, 546, 732, 643, 229, 124, 312, 262, 667, 159, 874, 279, 758, 91, 492, 419, 293, 407, 7, 34, 381, 64, 175, 724, 666, 642, 558, 457, 575, 331, 251, 811, 757, 406, 316, 276, 228, 731, 609, 6, 905, 462, 345, 827, 158, 788, 772, 380, 33, 599, 261, 898, 697, 446, 873, 641, 491, 90, 315, 292, 174, 5, 622, 418, 194, 640, 379, 214, 897, 227, 723, 54, 826, 260, 157, 275, 696, 405, 59, 675, 574, 730, 89, 545, 361, 190, 787, 259, 810, 173, 477, 404, 4, 394, 665, 291, 32, 896, 378, 863, 146, 88, 557, 704, 639, 490, 825, 744, 710, 695, 156, 483, 403, 226, 573, 311, 445, 786, 729, 586, 468, 3, 872, 225, 189, 845, 553, 544, 290, 330, 31, 824, 417, 904, 53, 862, 809, 799, 360, 377, 274, 258, 243, 87, 728, 621, 614, 895, 638, 572, 289, 188, 900, 771, 77, 155, 402, 694, 172, 105, 86, 393, 785, 556, 871, 664, 722, 257, 242, 861, 637, 571, 30, 58, 308, 224, 894, 754, 552, 114, 543, 376, 2, 416, 273, 193, 808, 187, 256, 85, 743, 693, 444, 288, 798, 154, 476, 401, 598, 359, 375, 29, 169, 307, 1, 250, 171, 807, 784, 551, 52, 663, 570, 860, 482, 542, 636, 104, 893, 585, 223, 703, 692, 84, 145, 870, 709, 555, 287, 28, 742, 550, 635, 443, 192, 306, 892, 222, 400, 489, 76, 859, 374, 415, 634, 691, 153, 620, 392, 869, 27, 305, 783, 286, 753, 358, 899, 541, 891, 633, 549, 662, 83, 221, 310, 103, 399, 554, 304, 26, 569, 373, 690, 249, 584, 858, 632, 398, 113, 144, 82, 303, 372, 285, 191, 782, 890, 241, 442, 481, 357, 220, 857, 152, 868, 25, 75, 631, 661, 540, 752, 414, 219, 741, 488, 689, 856, 660, 889, 112, 630, 855, 151, 309, 781, 218, 659, 413, 356, 867, 583, 854, 751, 355, 480, 702, 888, 853, 619, 240, 658, 111, 852, 391, 248, 412, 780, 851, 354, 657, 618, 850, 247], "Sayfalar birleşince tam sıralı liste çıkmalı"\n',
        hints: ['SQLite satır değeri karşılaştırması (a, b) < (?, ?) iki sütunlu sözlük sırası karşılaştırmasıdır.', 'Sonraki imleç: imlec_kodla(*satirlar[-1]) — satır zaten (order_date, order_id) sırasında.'],
        why: 'Tarih tek başına benzersiz olmadığı için order_id eşitlik bozucu (tie-breaker) olarak eklenir. Böylece aynı gündeki 6 sipariş sayfa sınırına denk gelse de hiçbiri atlanmaz ya da tekrarlanmaz.' },
      { t: 'code',
        id: 'fastapi-w3',
        stage: 'Kendin yaz',
        diff: 2,
        needs: ['sqlite3'],
        q: '<p>Filtre kalıbı: <code>filtre_sorgusu(parametreler)</code> sorgu parametresi sözlüğünü <code>(sql, degerler)</code> demetine çevirsin. Temel: <code>SELECT COUNT(*) FROM orders</code>. İzinli filtreler ve SQL karşılıkları (bu sırayla eklenir): <code>status</code> → <code>status = ?</code>, <code>channel</code> → <code>channel = ?</code>, <code>baslangic</code> → <code>order_date &gt;= ?</code>, <code>bitis</code> → <code>order_date &lt;= ?</code>. Koşullar <code>" WHERE "</code> ve <code>" AND "</code> ile birleşir. İzinsiz anahtar varsa <code>ValueError</code> (mesajda anahtar adı geçsin). Testler sorguyu gerçek <code>orders</code> tablosunda çalıştırır.</p>',
        start: 'import veri\ncon = veri.baglan("anadolu_market", tablolar=["orders"])\n\ndef filtre_sorgusu(parametreler):\n    pass\n',
        sol: 'import veri\ncon = veri.baglan("anadolu_market", tablolar=["orders"])\n\nIZINLI = {"status": "status = ?", "channel": "channel = ?",\n          "baslangic": "order_date >= ?", "bitis": "order_date <= ?"}\n\ndef filtre_sorgusu(parametreler):\n    bilinmeyen = set(parametreler) - set(IZINLI)\n    if bilinmeyen:\n        raise ValueError(f"bilinmeyen filtre: {\', \'.join(sorted(bilinmeyen))}")\n    kosullar, degerler = [], []\n    for anahtar, kosul in IZINLI.items():\n        if anahtar in parametreler:\n            kosullar.append(kosul)\n            degerler.append(parametreler[anahtar])\n    sql = "SELECT COUNT(*) FROM orders"\n    if kosullar:\n        sql += " WHERE " + " AND ".join(kosullar)\n    return sql, degerler\n',
        tests: 'sql, d = filtre_sorgusu({"channel": "mobile", "status": "delivered"})\nassert sql == "SELECT COUNT(*) FROM orders WHERE status = ? AND channel = ?", f"Sıra izinli listedeki gibi: {sql}"\nassert d == ["delivered", "mobile"]\nassert con.execute(sql, d).fetchone()[0] == 330, "Mobilde teslim edilen 330 sipariş var"\nsql2, d2 = filtre_sorgusu({"baslangic": "2024-01-01", "bitis": "2024-12-31", "status": "returned"})\nassert con.execute(sql2, d2).fetchone()[0] == con.execute("SELECT COUNT(*) FROM orders WHERE status=\'returned\' AND order_date LIKE \'2024%\'").fetchone()[0]\nassert filtre_sorgusu({}) == ("SELECT COUNT(*) FROM orders", [])\ntry:\n    filtre_sorgusu({"status": "x", "1=1; DROP TABLE orders": "1"})\n    assert False, "İzinsiz anahtar reddedilmeli"\nexcept ValueError as h:\n    assert "DROP" in str(h), "Hata mesajında anahtar adı geçmeli"\n',
        hints: ['İzinli filtreleri sıralı bir sözlükte tut; sözlükler ekleme sırasını korur.', 'Değerleri asla SQL metnine yapıştırma; ? yer tutucusu ve parametre listesi kullan.'],
        why: 'Beyaz liste hem SQL enjeksiyonunu hem yazım hatası olan parametrelerin sessizce yok sayılmasını önler. FastAPI\'de bu fonksiyon bir bağımlılık (Depends) olarak sorgu parametrelerini toplar.' },
      { t: 'code',
        id: 'fastapi-w4',
        stage: 'Kendin yaz',
        diff: 2,
        q: '<p>Anahtar başına jeton kovası: <code>Sinirlayici(kapasite, hiz, saat)</code>. <code>saat</code> çağrıldığında saniye döndüren bir fonksiyon (testte sahte saat verilir). <code>izin_ver(anahtar)</code> <code>(izin, bekle)</code> döndürsün: jeton varsa <code>(True, 0.0)</code>; yoksa <code>(False, s)</code>, s bir jetonun dolması için gereken saniye (2 basamak). Her anahtarın kovası ilk istekte dolu başlar; kovalar birbirinden bağımsızdır.</p>',
        start: 'class Sinirlayici:\n    pass\n',
        sol: 'class Sinirlayici:\n    def __init__(self, kapasite, hiz, saat):\n        self.kapasite, self.hiz, self.saat = kapasite, hiz, saat\n        self.kovalar = {}\n\n    def izin_ver(self, anahtar):\n        simdi = self.saat()\n        jeton, son = self.kovalar.get(anahtar, (float(self.kapasite), simdi))\n        jeton = min(self.kapasite, jeton + (simdi - son) * self.hiz)\n        if jeton >= 1:\n            self.kovalar[anahtar] = (jeton - 1, simdi)\n            return True, 0.0\n        self.kovalar[anahtar] = (jeton, simdi)\n        return False, round((1 - jeton) / self.hiz, 2)\n',
        tests: 't = [0.0]\ns = Sinirlayici(kapasite=2, hiz=0.5, saat=lambda: t[0])\nassert s.izin_ver("a") == (True, 0.0) and s.izin_ver("a") == (True, 0.0), "İlk iki istek kapasiteden"\nassert s.izin_ver("a") == (False, 2.0), "Jeton bitti: 1 jeton için 1/0.5 = 2 sn beklemeli"\nassert s.izin_ver("b") == (True, 0.0), "Başka anahtarın kovası ayrı"\nt[0] = 1.0\nassert s.izin_ver("a") == (False, 1.0), "1 sn sonra 0.5 jeton var; 1 sn daha gerek"\nt[0] = 2.0\nassert s.izin_ver("a") == (True, 0.0), "2. saniyede 1 jeton dolmuş olmalı"\nt[0] = 100.0\nassert [s.izin_ver("a")[0] for _ in range(3)] == [True, True, False], "Kova kapasiteden fazla dolmamalı"\n',
        hints: ['Her anahtar için (jeton, son_zaman) sakla.', 'Dolum: min(kapasite, jeton + geçen_süre * hiz).', 'Bekleme: (1 - jeton) / hiz.'],
        why: 'Retry-After için gereken süreyi hesaplamak istemciye "ne zaman tekrar dene" bilgisini verir; körlemesine yeniden deneme fırtınasını önler. Saat fonksiyonunu dışarıdan almak testi deterministik yapar.' },
      { t: 'code',
        id: 'fastapi-w5',
        stage: 'Kendin yaz',
        diff: 2,
        q: '<p>WebSocket yayın yöneticisinin mantığını yaz: <code>YayinYoneticisi</code>. <code>baglan(ws)</code> ve <code>ayril(ws)</code> bağlantıyı kümeye ekler/çıkarır (olmayanı çıkarmak hata vermesin). <code>async yayinla(mesaj)</code> her bağlantının <code>await ws.send_json(mesaj)</code> metodunu çağırsın; gönderimde istisna fırlatan bağlantıyı kümeden çıkarsın ve diğerlerine göndermeye devam etsin. Başarılı gönderim sayısını döndürsün. <code>len(yonetici)</code> bağlı istemci sayısını versin.</p>',
        start: 'class YayinYoneticisi:\n    pass\n',
        sol: 'class YayinYoneticisi:\n    def __init__(self):\n        self.baglantilar = set()\n\n    def baglan(self, ws):\n        self.baglantilar.add(ws)\n\n    def ayril(self, ws):\n        self.baglantilar.discard(ws)\n\n    def __len__(self):\n        return len(self.baglantilar)\n\n    async def yayinla(self, mesaj):\n        basarili = 0\n        for ws in list(self.baglantilar):\n            try:\n                await ws.send_json(mesaj)\n                basarili += 1\n            except Exception:\n                self.ayril(ws)\n        return basarili\n',
        tests: 'import asyncio\nclass WS:\n    def __init__(self, kopuk=False):\n        self.kopuk, self.gelen = kopuk, []\n    async def send_json(self, m):\n        if self.kopuk:\n            raise ConnectionError("koptu")\n        self.gelen.append(m)\ny = YayinYoneticisi()\na, b, c = WS(), WS(kopuk=True), WS()\nfor w in (a, b, c):\n    y.baglan(w)\nassert len(y) == 3\nn = asyncio.run(y.yayinla({"siparis": 905, "durum": "kargoda"}))\nassert n == 2, f"İki başarılı gönderim olmalı, gelen {n}"\nassert len(y) == 2 and b not in y.baglantilar, "Kopuk bağlantı çıkarılmalı"\nassert a.gelen == c.gelen == [{"siparis": 905, "durum": "kargoda"}]\ny.ayril(WS())\ny.ayril(a)\nassert len(y) == 1\n',
        hints: ['Küme üzerinde gezerken ondan eleman çıkarmak RuntimeError verir: list(self.baglantilar) kopyası üzerinde gez.', 'discard, olmayan elemanda hata vermez.'],
        why: 'Kopan istemciyi temizlemezsen her yayında aynı hata tekrar eder ve bellek sızar. Kopya üzerinde gezmek, döngü sırasında kümeyi güvenle değiştirmeni sağlar.' },
      { t: 'code',
        id: 'fastapi-w6',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 2,
        needs: ['sqlite3'],
        q: '<p>Hatayı bul ve düzelt. Mobil ekip "sonsuz kaydırmada bazı siparişler hiç görünmüyor" diyor. <code>sayfa_getir(con, son_tarih=None, limit=50)</code> imleç olarak yalnız son satırın tarihini kullanıyor. Aynı gün birden çok sipariş olduğunda sayfa sınırındaki siparişler atlanıyor. Fonksiyonu <code>(order_date, order_id)</code> ikilisiyle çalışacak şekilde düzelt: parametre adı <code>son</code> olsun (ya <code>None</code> ya da <code>(tarih, id)</code> demeti), dönüş <code>(id_listesi, yeni_son)</code>; sayfa eksik dolarsa <code>yeni_son</code> <code>None</code>.</p>',
        start: 'import veri\ncon = veri.baglan("anadolu_market", tablolar=["orders"])\n\ndef sayfa_getir(con, son=None, limit=50):\n    sql, p = "SELECT order_date, order_id FROM orders", []\n    if son:\n        sql += " WHERE order_date < ?"\n        p.append(son[0])\n    sql += " ORDER BY order_date DESC LIMIT ?"\n    satirlar = con.execute(sql, p + [limit]).fetchall()\n    yeni = (satirlar[-1][0], satirlar[-1][1]) if len(satirlar) == limit else None\n    return [s[1] for s in satirlar], yeni\n',
        sol: 'import veri\ncon = veri.baglan("anadolu_market", tablolar=["orders"])\n\ndef sayfa_getir(con, son=None, limit=50):\n    sql, p = "SELECT order_date, order_id FROM orders", []\n    if son:\n        sql += " WHERE (order_date, order_id) < (?, ?)"\n        p += [son[0], son[1]]\n    sql += " ORDER BY order_date DESC, order_id DESC LIMIT ?"\n    satirlar = con.execute(sql, p + [limit]).fetchall()\n    yeni = (satirlar[-1][0], satirlar[-1][1]) if len(satirlar) == limit else None\n    return [s[1] for s in satirlar], yeni\n',
        tests: 'hepsi, son = [], None\nfor _ in range(40):\n    ids, son = sayfa_getir(con, son, limit=50)\n    hepsi += ids\n    if son is None:\n        break\nassert len(set(hepsi)) == 910, f"910 siparişin hepsi görünmeli; görünen {len(set(hepsi))}"\nassert len(hepsi) == 910, "Hiçbir sipariş iki kez gelmemeli"\nids, _ = sayfa_getir(con, ("2024-11-27", 10**9), limit=6)\nassert len(ids) == 6 and len(set(ids)) == 6\n',
        hints: ['Sıralama anahtarı benzersiz olmalı: tarih + id.', 'Hem WHERE koşulunda hem ORDER BY\'da ikinci anahtarı kullan.'],
        why: 'Yalnız tarihe göre "< son_tarih" demek, son tarihle aynı gündeki ama sayfaya sığmamış siparişleri atlar; sıralamada id olmadığı için aynı gündeki siparişlerin sırası da belirsizdir.' },
      { t: 'code',
        id: 'fastapi-w7',
        stage: 'Meydan okuma',
        diff: 3,
        q: '<p>Hız sınırı ara katmanını (middleware) yaz. <code>hiz_siniri(uygulama, sinirlayici)</code> bir async fonksiyon döndürsün: <code>async def sarili(istek)</code>. <code>istek</code> sözlüğünde <code>"basliklar"</code> (sözlük) ve <code>"istemci"</code> (IP) var. Anahtar: <code>X-API-Key</code> başlığı varsa o, yoksa IP. <code>sinirlayici.izin_ver(anahtar)</code> <code>(izin, bekle)</code> döndürür (önceki görevdeki gibi). İzin yoksa uygulamayı <b>çağırmadan</b> <code>{"durum": 429, "govde": {"detail": "Çok fazla istek"}, "basliklar": {"Retry-After": str(math.ceil(bekle))}}</code> döndür. İzin varsa <code>await uygulama(istek)</code> sonucunu döndür ama yanıt başlıklarına <code>"X-RateLimit-Key"</code> olarak kullanılan anahtar türünü (<code>"api-key"</code> ya da <code>"ip"</code>) ekle (yanıtta <code>basliklar</code> yoksa oluştur; orijinal sözlüğü değiştirme).</p>',
        start: 'import math\n\ndef hiz_siniri(uygulama, sinirlayici):\n    pass\n',
        sol: 'import math\n\ndef hiz_siniri(uygulama, sinirlayici):\n    async def sarili(istek):\n        api_anahtari = istek.get("basliklar", {}).get("X-API-Key")\n        anahtar = api_anahtari or istek["istemci"]\n        izin, bekle = sinirlayici.izin_ver(anahtar)\n        if not izin:\n            return {"durum": 429, "govde": {"detail": "Çok fazla istek"},\n                    "basliklar": {"Retry-After": str(math.ceil(bekle))}}\n        yanit = await uygulama(istek)\n        basliklar = dict(yanit.get("basliklar", {}))\n        basliklar["X-RateLimit-Key"] = "api-key" if api_anahtari else "ip"\n        return {**yanit, "basliklar": basliklar}\n    return sarili\n',
        tests: 'import asyncio\nclass S:\n    def __init__(self, izinler):\n        self.izinler, self.gorulen = list(izinler), []\n    def izin_ver(self, anahtar):\n        self.gorulen.append(anahtar)\n        return self.izinler.pop(0)\ncagri = []\nSABIT = {"durum": 200, "govde": {"ok": True}}\nasync def uygulama(istek):\n    cagri.append(istek["istemci"])\n    return SABIT\ns = S([(True, 0.0), (False, 1.2), (True, 0.0)])\nm = hiz_siniri(uygulama, s)\nr1 = asyncio.run(m({"basliklar": {}, "istemci": "10.0.0.1"}))\nassert r1 == {"durum": 200, "govde": {"ok": True}, "basliklar": {"X-RateLimit-Key": "ip"}}, f"Gelen {r1}"\nassert "basliklar" not in SABIT, "Uygulamanın döndürdüğü sözlük değiştirilmemeli"\nr2 = asyncio.run(m({"basliklar": {}, "istemci": "10.0.0.1"}))\nassert r2["durum"] == 429 and r2["basliklar"] == {"Retry-After": "2"}, "1.2 sn yukarı yuvarlanır: 2"\nassert cagri == ["10.0.0.1"], "Reddedilen istekte uygulama çağrılmamalı"\nr3 = asyncio.run(m({"basliklar": {"X-API-Key": "k-42"}, "istemci": "10.0.0.1"}))\nassert s.gorulen[-1] == "k-42" and r3["basliklar"]["X-RateLimit-Key"] == "api-key"\n',
        hints: ['Kapanış (closure): dış fonksiyon uygulama ve sinirlayici\'yi yakalar, içteki async fonksiyonu döndürür.', 'Yanıtı kopyalamak için {**yanit, "basliklar": yeni_basliklar} kullan.', 'math.ceil(1.2) == 2'],
        why: 'Gerçek FastAPI middleware\'i de aynı biçimdedir: isteği alır, ya kısa devre yapar (429) ya da call_next ile zinciri sürdürür ve yanıtı süsler. Orijinal yanıtı değiştirmemek paylaşılan nesnelerde sürpriz hataları önler.' }
    ],
    faq: [
      { q: 'Toplam kayıt sayısını (toplam: 910) cursor sayfalamada da döndürmeli miyim?',
        a: 'Zorunlu değil ve büyük tablolarda <code>COUNT(*)</code> pahalıdır. Sonsuz kaydırmada yalnız <code>sonraki</code> imleci yeter. Sayı gerekiyorsa ayrı bir uç noktada, önbellekli ya da yaklaşık olarak ver.' },
      { q: 'Hız sınırını uygulamada mı, ağ geçidinde mi yapmalıyım?',
        a: 'İkisi birlikte: Nginx, bulut API ağ geçidi ya da CDN kaba sınırları (IP başına) uygular; uygulama ise iş kurallarına bağlı sınırları (plan, kullanıcı, uç nokta) uygular. Çok süreçli uygulamada sayaçları Redis gibi ortak bir depoda tut.' }
    ],
    mistakes: [
      { bad: 'sql += " WHERE order_date < ?"  # imleç = son tarih',
        good: 'sql += " WHERE (order_date, order_id) < (?, ?)"',
        why: 'Benzersiz olmayan sıralama anahtarı sayfa sınırındaki kayıtları atlatır; eşitlik bozucu olarak id ekle.' }
    ] }
);
})(window);
