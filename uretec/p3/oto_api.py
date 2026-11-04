#!/usr/bin/env python3
"""proje-oto-api: sayfalı API'den artımlı çekme, SQLite, günlük rapor. Tarayıcıda sunucu içeride sahtedir, yerel sürüm gerçek HTTP kullanır."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ortak import C, M, T, Y, pre, yaz

SUNUCU = r'''
class SahteSunucu:
    """Gerçek ağ yok: lk_orders tablosundan cevap veren bellek içi API. Kural: ?since ile artımlı, sayfa 50 kayıt."""
    def __init__(self, satirlar, hatalar=()):
        self.satirlar = sorted(satirlar, key=lambda s: (s["placed_at"], s["order_id"]))
        self.hatalar, self.istekler = list(hatalar), []

    def __call__(self, yontem, yol, parametre, baslik):
        self.istekler.append((yol, dict(parametre), dict(baslik)))
        if baslik.get("Authorization") != "Bearer dogru-anahtar":
            return 401, {}, {"hata": "yetkisiz"}
        if self.hatalar:
            h = self.hatalar.pop(0)
            if h:
                return h[0], h[1], {"hata": "geçici"}
        L = [s for s in self.satirlar if s["placed_at"] > parametre.get("since", "")]
        bas = int(parametre.get("cursor", 0))
        par = L[bas:bas + 50]
        y = {"items": par}
        if bas + 50 < len(L):
            y["next_cursor"] = str(bas + 50)
        return 200, {}, y
'''
A1 = '''import json, os, sqlite3
import veri
''' + SUNUCU + '''
class ApiHata(Exception):
    def __init__(self, kod):
        super().__init__("HTTP " + str(kod))
        self.kod = kod

def istek(tasima, yol, parametre, anahtar, deneme=4, bekle=lambda s: None):
    for i in range(deneme):
        kod, baslik, govde = tasima("GET", yol, parametre, {"Authorization": "Bearer " + anahtar, "Accept": "application/json"})
        if kod == 200:
            return govde
        if kod not in (429, 500, 502, 503, 504) or i == deneme - 1:
            raise ApiHata(kod)
        bekle(float(baslik.get("Retry-After", 2 ** i)))

def tum_sayfalar(tasima, yol, parametre, anahtar, bekle=lambda s: None, en_cok=1000):
    p, sayfa = dict(parametre), 0
    while True:
        g = istek(tasima, yol, p, anahtar, bekle=bekle)
        yield from g["items"]
        sayfa += 1
        if not g.get("next_cursor"):
            return
        if sayfa >= en_cok:
            raise RuntimeError("sayfa sınırı aşıldı")
        p = {**p, "cursor": g["next_cursor"]}
'''
A1BAS = '''import json, os, sqlite3
import veri
''' + SUNUCU + '''
class ApiHata(Exception):
    def __init__(self, kod):
        super().__init__("HTTP " + str(kod))
        self.kod = kod

def istek(tasima, yol, parametre, anahtar, deneme=4, bekle=lambda s: None):
    pass

def tum_sayfalar(tasima, yol, parametre, anahtar, bekle=lambda s: None, en_cok=1000):
    pass
'''
HAZ = '''_rows = veri.kayitlar("lezzet_kurye", "lk_orders")
_rows = [{k: r[k] for k in ("order_id", "placed_at", "status", "delivery_fee", "discount", "tip")} for r in _rows if r["placed_at"] < "2024-10-05"]
_KEY = "dogru-anahtar"
'''
A1T = HAZ + '''_s = SahteSunucu(_rows)
_t = list(tum_sayfalar(_s, "/orders", {}, _KEY))
assert len(_t) == len(_rows) > 100, "Bütün sayfalar: " + str(len(_t))
assert len({x["order_id"] for x in _t}) == len(_rows), "Tekrar ya da eksik yok"
assert len(_s.istekler) == len(_rows) // 50 + (1 if len(_rows) % 50 else 0), "Sayfa sayısı kadar istek"
assert _s.istekler[1][1]["cursor"] == "50" and _s.istekler[0][2]["Authorization"] == "Bearer dogru-anahtar", "İmleç ve başlık"
_b = []
_s = SahteSunucu(_rows[:3], hatalar=[(429, {"Retry-After": "7"}), (503, {}), None])
assert len(list(tum_sayfalar(_s, "/orders", {}, _KEY, bekle=_b.append))) == 3, "Geçici hatalar aşılır"
assert _b == [7.0, 2.0], "429 için Retry-After, diğerine üstel: " + repr(_b)
_s = SahteSunucu(_rows[:3])
try:
    list(tum_sayfalar(_s, "/orders", {}, "yanlis"))
    raise AssertionError("401 hata vermeli")
except ApiHata as _h:
    assert _h.kod == 401 and len(_s.istekler) == 1, "401 tekrarlanmaz"
_s = SahteSunucu(_rows[:3], hatalar=[(500, {})] * 9)
try:
    list(tum_sayfalar(_s, "/orders", {}, _KEY))
    raise AssertionError("Denemeler bitince hata")
except ApiHata as _h:
    assert _h.kod == 500 and len(_s.istekler) == 4, "Dört deneme: " + str(len(_s.istekler))
def _dongu(y, yl, p, b):
    return 200, {}, {"items": [], "next_cursor": "hep"}
try:
    list(tum_sayfalar(_dongu, "/o", {}, _KEY, en_cok=5))
    raise AssertionError("Bozuk imleç sonsuza gitmemeli")
except RuntimeError:
    pass
'''
A1Y = [(A1.replace('if kod not in (429, 500, 502, 503, 504) or i == deneme - 1:', 'if i == deneme - 1:'), '401 de tekrarlanıyor'),
       (A1.replace('''        p = {**p, "cursor": g["next_cursor"]}
''', '''        return
'''), 'yalnız ilk sayfa'),
       (A1.replace('bekle(float(baslik.get("Retry-After", 2 ** i)))', 'bekle(2 ** i)'), 'Retry-After yok sayılıyor'),
       (A1.replace('''        if sayfa >= en_cok:
            raise RuntimeError("sayfa sınırı aşıldı")
''', ''), 'sonsuz sayfa')]
A2 = '''
def dogrula(k):
    if not isinstance(k.get("order_id"), int):
        raise ValueError("order_id")
    if k.get("status") not in ("teslim", "iptal", "iade"):
        raise ValueError("status: " + str(k.get("status")))
    if not isinstance(k.get("placed_at"), str) or len(k["placed_at"]) != 19:
        raise ValueError("placed_at")
    for a in ("delivery_fee", "discount", "tip"):
        if not isinstance(k.get(a), (int, float)) or k[a] < 0:
            raise ValueError(a)

def veritabani(yol):
    c = sqlite3.connect(yol)
    c.execute("""CREATE TABLE IF NOT EXISTS siparis(order_id INTEGER PRIMARY KEY, placed_at TEXT NOT NULL, status TEXT NOT NULL,
                 delivery_fee REAL, discount REAL, tip REAL)""")
    c.execute("CREATE TABLE IF NOT EXISTS durum(anahtar TEXT PRIMARY KEY, deger TEXT)")
    c.execute("CREATE TABLE IF NOT EXISTS karantina(kayit TEXT, neden TEXT)")
    c.commit()
    return c

def artimli_yukle(c, tasima, anahtar, bekle=lambda s: None):
    s = c.execute("SELECT deger FROM durum WHERE anahtar = 'since'").fetchone()
    since = s[0] if s else ""
    p = {"since": since} if since else {}
    say = {"yazilan": 0, "reddedilen": 0}
    enbuyuk = since
    with c:
        for k in tum_sayfalar(tasima, "/orders", p, anahtar, bekle=bekle):
            try:
                dogrula(k)
            except ValueError as e:
                c.execute("INSERT INTO karantina VALUES (?, ?)", (json.dumps(k, ensure_ascii=False), str(e)))
                say["reddedilen"] += 1
                continue
            c.execute("""INSERT INTO siparis VALUES (:order_id, :placed_at, :status, :delivery_fee, :discount, :tip)
                         ON CONFLICT(order_id) DO UPDATE SET status = excluded.status, tip = excluded.tip""", k)
            say["yazilan"] += 1
            enbuyuk = max(enbuyuk, k["placed_at"])
        c.execute("INSERT OR REPLACE INTO durum VALUES ('since', ?)", (enbuyuk,))
    return say
'''
A2BAS = '''
def dogrula(k):
    pass  # sorun varsa ValueError

def veritabani(yol):
    pass  # siparis, durum, karantina tabloları

def artimli_yukle(c, tasima, anahtar, bekle=lambda s: None):
    pass  # {"yazilan", "reddedilen"}
'''
A2T = HAZ + '''import tempfile
_y = tempfile.mkdtemp() + "/s.db"
_c = veritabani(_y)
_a = sorted(_rows, key=lambda r: r["placed_at"])
_ilk, _son = _a[:120], _a[120:]
_s = SahteSunucu(_ilk)
assert artimli_yukle(_c, _s, _KEY) == {"yazilan": 120, "reddedilen": 0}, "İlk yükleme"
assert _c.execute("select count(*) from siparis").fetchone()[0] == 120, "Satır sayısı"
_w = _c.execute("select deger from durum where anahtar='since'").fetchone()[0]
assert _w == max(r["placed_at"] for r in _ilk), "Filigran en büyük zamana gelir"
_s2 = SahteSunucu(_a)
_r = artimli_yukle(_c, _s2, _KEY)
assert _r["yazilan"] == len(_son), "İkinci çalışma yalnız yeniyi çeker: " + repr(_r)
assert _s2.istekler[0][1]["since"] == _w, "since gönderilmeli"
assert _c.execute("select count(*) from siparis").fetchone()[0] == len(_a), "Toplam"
assert artimli_yukle(_c, SahteSunucu(_a), _KEY)["yazilan"] == 0, "Üçüncü çalışma boş"
_k = dict(_a[0]); _k["status"] = "iade"; _k["placed_at"] = "2099-01-01 00:00:00"
assert artimli_yukle(_c, SahteSunucu([_k]), _KEY)["yazilan"] == 1 and _c.execute("select status from siparis where order_id=?", (_k["order_id"],)).fetchone()[0] == "iade", "Aynı numara güncellenir, çiftlenmez"
_y2 = tempfile.mkdtemp() + "/k.db"; _c2 = veritabani(_y2)
_bad = [dict(_a[0], status="bilinmez"), dict(_a[1], tip=-5), dict(_a[2], placed_at="dun"), dict(_a[3])]
_r = artimli_yukle(_c2, SahteSunucu(_bad), _KEY)
assert _r == {"yazilan": 1, "reddedilen": 3}, "Kötü kayıt karantinaya: " + repr(_r)
assert _c2.execute("select count(*) from karantina").fetchone()[0] == 3 and "status" in _c2.execute("select neden from karantina").fetchone()[0], "Karantina nedeni"
_y3 = tempfile.mkdtemp() + "/x.db"; _c3 = veritabani(_y3)
class _Yarim:
    def __init__(self):
        self.n = 0
    def __call__(self, y, yl, p, b):
        self.n += 1
        if self.n == 2:
            return 404, {}, {}
        return 200, {}, {"items": _a[:50], "next_cursor": "50"}
try:
    artimli_yukle(_c3, _Yarim(), _KEY)
    raise AssertionError("Yarıda kalan çekim hata verir")
except ApiHata:
    pass
assert _c3.execute("select count(*) from durum").fetchone()[0] == 0 and _c3.execute("select count(*) from siparis").fetchone()[0] == 0, "Yarım kalan çekim ne veri yazar ne filigran ilerletir"
'''
_b1 = A1
A2Y = [(_b1 + A2.replace('''ON CONFLICT(order_id) DO UPDATE SET status = excluded.status, tip = excluded.tip""", k)''', '''ON CONFLICT(order_id) DO NOTHING""", k)'''), 'değişen kaydı güncellemiyor'),
       (_b1 + A2.replace('    with c:\n', '    if True:\n').replace('''        c.execute("INSERT OR REPLACE INTO durum VALUES ('since', ?)", (enbuyuk,))
''', '''        c.execute("INSERT OR REPLACE INTO durum VALUES ('since', ?)", (enbuyuk,))
        c.commit()
''').replace('''            say["yazilan"] += 1
''', '''            say["yazilan"] += 1
            c.execute("INSERT OR REPLACE INTO durum VALUES ('since', ?)", (k["placed_at"],))
            c.commit()
'''), 'her satırda filigran ilerletiyor: yarım çekim sayfa kaybettirir'),
       (_b1 + A2.replace('''    s = c.execute("SELECT deger FROM durum WHERE anahtar = 'since'").fetchone()
    since = s[0] if s else ""
    p = {"since": since} if since else {}
''', '''    since = ""
    p = {}
'''), 'artımlı değil, hep tam çekiyor'),
       (_b1 + A2.replace('''            try:
                dogrula(k)
            except ValueError as e:
                c.execute("INSERT INTO karantina VALUES (?, ?)", (json.dumps(k, ensure_ascii=False), str(e)))
                say["reddedilen"] += 1
                continue
''', ''), 'doğrulama yok')]
A3 = '''
def gun_raporu(c, gun):
    r = c.execute("""SELECT status, COUNT(*), ROUND(SUM(delivery_fee - discount + tip), 2)
        FROM siparis WHERE substr(placed_at, 1, 10) = ? GROUP BY status ORDER BY status""", (gun,)).fetchall()
    return {"gun": gun, "toplam": sum(x[1] for x in r), "durumlar": {x[0]: {"adet": x[1], "gelir": x[2]} for x in r}}

def rapor_csv(c, gun, klasor):
    os.makedirs(klasor, exist_ok=True)
    r = gun_raporu(c, gun)
    y = os.path.join(klasor, f"gunluk_{gun}.csv")
    with open(y + ".tmp", "w", encoding="utf-8", newline="") as f:
        f.write("durum,adet,gelir\\n")
        for d, v in r["durumlar"].items():
            f.write(f"{d},{v['adet']},{v['gelir']}\\n")
    os.replace(y + ".tmp", y)
    return y, r

def gunluk_is(c, tasima, anahtar, gun, klasor, bekle=lambda s: None):
    y = artimli_yukle(c, tasima, anahtar, bekle=bekle)
    yol, r = rapor_csv(c, gun, klasor)
    sonuc = {"cikis": 0, "yol": yol, **y, "rapor_toplam": r["toplam"]}
    if y["reddedilen"]:
        sonuc["cikis"] = 1
    if r["toplam"] == 0:
        sonuc["cikis"] = 3
    return sonuc
'''
A3BAS = '''
def gun_raporu(c, gun):
    pass  # {"gun", "toplam", "durumlar": {durum: {"adet", "gelir"}}}

def rapor_csv(c, gun, klasor):
    pass  # (yol, rapor)

def gunluk_is(c, tasima, anahtar, gun, klasor, bekle=lambda s: None):
    pass  # {"cikis", "yol", "yazilan", "reddedilen", "rapor_toplam"}
'''
A3T = HAZ + '''import tempfile, csv as _cs
_d = tempfile.mkdtemp(); _c = veritabani(_d + "/s.db")
_r = gunluk_is(_c, SahteSunucu(_rows), _KEY, "2024-10-02", _d + "/rap")
_g = [x for x in _rows if x["placed_at"][:10] == "2024-10-02"]
assert _r["cikis"] == 0 and _r["rapor_toplam"] == len(_g) and _r["yazilan"] == len(_rows), repr(_r)
_sat = list(_cs.DictReader(open(_r["yol"], encoding="utf-8")))
_du = {}
for _x in _g:
    _v = _du.setdefault(_x["status"], [0, 0.0])
    _v[0] += 1; _v[1] += _x["delivery_fee"] - _x["discount"] + _x["tip"]
assert {s["durum"]: int(s["adet"]) for s in _sat} == {k: v[0] for k, v in _du.items()}, "Adetler"
for _s in _sat:
    assert abs(float(_s["gelir"]) - _du[_s["durum"]][1]) < 0.01, "Gelir: " + _s["durum"]
assert os.path.basename(_r["yol"]) == "gunluk_2024-10-02.csv" and not [f for f in os.listdir(_d + "/rap") if f.endswith(".tmp")], "Dosya adı, geçici yok"
_r2 = gunluk_is(_c, SahteSunucu(_rows), _KEY, "2024-10-02", _d + "/rap")
assert _r2["yazilan"] == 0 and _r2["rapor_toplam"] == len(_g), "İkinci çalışma: yazım yok, rapor aynı"
assert list(_cs.DictReader(open(_r2["yol"], encoding="utf-8"))) == _sat, "Rapor değişmez"
assert gunluk_is(_c, SahteSunucu([]), _KEY, "2030-01-01", _d + "/rap")["cikis"] == 3, "Hiç veri yoksa alarm: boş rapor başarı değildir"
_kot = dict(_rows[0], status="x", placed_at="2098-01-01 00:00:00")
_ok = dict(_rows[1], order_id=999998, placed_at="2098-01-01 00:00:01")
assert gunluk_is(_c, SahteSunucu([_kot, _ok]), _KEY, "2098-01-01", _d + "/rap")["cikis"] == 1, "Karantina varsa kısmi başarı"
'''
_b2 = _b1 + A2
A3Y = [(_b2 + A3.replace('''    if r["toplam"] == 0:
        sonuc["cikis"] = 3
''', ''), 'boş raporu başarı sayıyor'),
       (_b2 + A3.replace('delivery_fee - discount + tip', 'delivery_fee'), 'gelir hesabı eksik'),
       (_b2 + A3.replace('''    if y["reddedilen"]:
        sonuc["cikis"] = 1
''', ''), 'karantinayı görmezden geliyor')]
YEREL = r'''"""api_rapor.py: gerçek HTTP ile sayfalı API, SQLite, günlük rapor. Yalnız standart kütüphane.
python api_rapor.py sunucu       127.0.0.1:8123 üstünde deneme API'si açar
python api_rapor.py cek 2024-10-02   veriyi çeker, gunluk_2024-10-02.csv yazar
Anahtar: KESIT_API_ANAHTARI ortam değişkeni. Deneme sunucusunda değeri: dogru-anahtar"""
import json, os, sqlite3, sys, time, urllib.error, urllib.parse, urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

ADRES = os.environ.get("KESIT_API_ADRES", "http://127.0.0.1:8123")
VERI = [{"order_id": i, "placed_at": f"2024-10-0{1 + i % 3} 12:{i % 60:02d}:00", "status": "teslim" if i % 5 else "iptal", "delivery_fee": 20.0, "discount": 0.0, "tip": 5.0} for i in range(1, 121)]
HATA = {"kalan": 1}

class Sunucu(BaseHTTPRequestHandler):
    def log_message(self, *a):
        pass

    def yanit(self, kod, govde, baslik=()):
        d = json.dumps(govde).encode()
        self.send_response(kod)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(d)))
        for a, b in baslik:
            self.send_header(a, b)
        self.end_headers()
        self.wfile.write(d)

    def do_GET(self):
        if self.headers.get("Authorization") != "Bearer dogru-anahtar":
            return self.yanit(401, {"hata": "yetkisiz"})
        if HATA["kalan"]:
            HATA["kalan"] -= 1
            return self.yanit(429, {"hata": "hız sınırı"}, [("Retry-After", "1")])
        q = dict(urllib.parse.parse_qsl(urllib.parse.urlsplit(self.path).query))
        L = sorted((s for s in VERI if s["placed_at"] > q.get("since", "")), key=lambda s: (s["placed_at"], s["order_id"]))
        b = int(q.get("cursor", 0))
        g = {"items": L[b:b + 50]}
        if b + 50 < len(L):
            g["next_cursor"] = str(b + 50)
        self.yanit(200, g)

def tasima(p, anahtar):
    u = ADRES + "/orders?" + urllib.parse.urlencode(p)
    r = urllib.request.Request(u, headers={"Authorization": "Bearer " + anahtar, "Accept": "application/json", "User-Agent": "kesit-api-rapor/1"})
    try:
        with urllib.request.urlopen(r, timeout=20) as y:
            return 200, {}, json.load(y)
    except urllib.error.HTTPError as e:
        return e.code, dict(e.headers), {}

def cek(p, anahtar, deneme=4):
    for i in range(deneme):
        try:
            kod, b, g = tasima(p, anahtar)
        except OSError as e:
            if i == deneme - 1:
                raise
            time.sleep(2 ** i)
            continue
        if kod == 200:
            return g
        if kod not in (429, 500, 502, 503, 504) or i == deneme - 1:
            raise RuntimeError(f"HTTP {kod}")
        s = float(b.get("Retry-After", 2 ** i))
        print(f"HTTP {kod}, {s} sn bekleniyor", file=sys.stderr)
        time.sleep(s)

def ana(gun):
    anahtar = os.environ.get("KESIT_API_ANAHTARI")
    if not anahtar:
        sys.exit("KESIT_API_ANAHTARI ortam değişkenini ayarla")
    c = sqlite3.connect("siparis.db")
    c.execute("CREATE TABLE IF NOT EXISTS siparis(order_id INTEGER PRIMARY KEY, placed_at TEXT, status TEXT, delivery_fee REAL, discount REAL, tip REAL)")
    c.execute("CREATE TABLE IF NOT EXISTS durum(anahtar TEXT PRIMARY KEY, deger TEXT)")
    s = c.execute("SELECT deger FROM durum WHERE anahtar = 'since'").fetchone()
    since = s[0] if s else ""
    p, n, enb = ({"since": since} if since else {}), 0, since
    with c:
        while True:
            g = cek(p, anahtar)
            for k in g["items"]:
                c.execute("INSERT INTO siparis VALUES (:order_id,:placed_at,:status,:delivery_fee,:discount,:tip) ON CONFLICT(order_id) DO UPDATE SET status=excluded.status", k)
                n += 1
                enb = max(enb, k["placed_at"])
            if not g.get("next_cursor"):
                break
            p = {**p, "cursor": g["next_cursor"]}
        c.execute("INSERT OR REPLACE INTO durum VALUES ('since', ?)", (enb,))
    r = c.execute("SELECT status, COUNT(*) FROM siparis WHERE substr(placed_at,1,10)=? GROUP BY 1 ORDER BY 1", (gun,)).fetchall()
    with open(f"gunluk_{gun}.csv.tmp", "w", encoding="utf-8") as f:
        f.write("durum,adet\n" + "".join(f"{a},{b}\n" for a, b in r))
    os.replace(f"gunluk_{gun}.csv.tmp", f"gunluk_{gun}.csv")
    print(f"yazılan {n}, rapor {r}")
    return 0 if r else 3

if __name__ == "__main__":
    if sys.argv[1] == "sunucu":
        ThreadingHTTPServer(("127.0.0.1", 8123), Sunucu).serve_forever()
    sys.exit(ana(sys.argv[2]))
'''
if os.environ.get('P3_Y'): open(os.environ['P3_Y'] + '/api_rapor.py', 'w').write(YEREL)
_tum = _b2 + A3
ORNEK = '''# Filigran (watermark): "buraya kadar aldım" notu. Ne zaman ilerletildiği her şeyi değiştirir.
sayfalar = [[("a", 1), ("d", 4)], [("b", 2), ("c", 3)]]
filigran = 0
try:
    for i, sayfa in enumerate(sayfalar):
        if i == 1:
            raise ConnectionError("ikinci sayfada ağ koptu")
        filigran = max(z for _, z in sayfa)     # yanlış yer: iş bitmeden ilerledi
except ConnectionError as e:
    print(e, "| filigran:", filigran, "| zamanı 2 ve 3 olan b ile c bir daha hiç alınmaz")
'''
ders = dict(id='proje-oto-api', lv='ileri', mod='İleri bitirme', min=85, needs=['pandas', 'sqlite3'],
 title='Otomasyon projesi: API verisinden günlük rapor',
 sum='Sayfalı ve hız sınırlı bir API\'den artımlı veri çeker, geçici hatayı aşar, sözleşmeye uymayan kaydı karantinaya alır, SQLite\'a çiftlemeden yazar, günlük rapor üretir ve boş sonucu başarı saymaz. Yerel sürüm gerçek HTTP kullanır.',
 goals=['Sayfalamayı, 429 ve Retry-After\'ı doğru yönetebilirim.', 'Kaydı sözleşmeye göre doğrulayıp kötüsünü ayırabilirim.', 'Filigranı işlem içinde ilerleterek veri kaybını önleyebilirim.', 'Boş sonucu hata olarak fark eden bir iş yazabilirim.'],
 body=f'''<div class="note"><b>Ağ burada sahte</b>Tarayıcıdaki Python genel ağa serbestçe çıkamaz. Görevlerde <code>SahteSunucu</code> gerçek <code>lk_orders</code> satırlarıyla cevap veren bellek içi bir API'dir: sayfalama, 429, 503 ve 401 davranışı kodda yazılı. <code>tasima</code> işlevi dışarıdan geldiği için aynı kod gerçek HTTP ile de çalışır; yerel sürümde <code>urllib</code> ile gerçekten sınandı.</div>
<h2>İş</h2>
<p>Lezzet Kurye sipariş verisi başka bir ekibin API'sinden geliyor. Her sabah önceki günün özeti isteniyor.</p>
{pre(ORNEK)}
<h2>Sık kaçırılan dört şey</h2>
<ul><li><b>Filigran ne zaman ilerler?</b> Veri ile aynı işlemde. Yarım kalan çekimde ikisi de geri alınır.</li><li><b>Aynı anda düşen kayıtlar.</b> <code>placed_at &gt; since</code> aynı saniyedeki kaydı atlayabilir. Bu projede kurgusal API böyle çalışıyor; gerçekte bir pay bırakıp (biraz geriden başlayıp) çiftlenmeyi anahtarla önlersin.</li><li><b>Kayıt sonradan değişir.</b> Sipariş iade olabilir. <code>ON CONFLICT DO UPDATE</code> bunu karşılar, ama <code>placed_at</code> filigranı değişen eski kaydı görmez; gerçek API'de <code>updated_at</code> varsa onu izle.</li><li><b>Boş sonuç başarı değildir.</b> Hiç kayıt gelmemesi çoğu zaman API'nin ya da filtrenin bozulduğunu gösterir. Çıkış kodu ayrı olsun.</li></ul>
<h2>Bu proje ile etl bitirmesinin farkı</h2>
<p><b>proje-etl</b> dosyadan katmanlı depoya yükleme üstüne kuruludur. Burası API'nin işletme tarafına odaklanır: hız sınırı, kimlik, sayfalama, sözleşme.</p>''',
 ex=[
 M('proje-oto-api-m1', 'Beşinci sayfada ağ koptu. Filigran ne olmalı?', ['Dördüncü sayfanın sonu', 'Çekim öncesi değer', 'Bugünün tarihi', 'Beşinci sayfanın sonu'], 1, 'Bu projede tek işlem var: veri de filigran da geri alınır. Sayfa sayfa işlem de bir tasarımdır, ama sıra garantisi ister.'),
 M('proje-oto-api-m2', 'API 0 kayıt döndü, rapor boş. İş ne döndürmeli?', ['Ayrı bir uyarı kodu', '0: yani sorun yok demek', 'Boş rapor e-postası atmak', 'Eski raporu tekrar göndermek'], 0, 'Boş sonuç sessiz arızanın en yaygın biçimidir.'),
 T('proje-oto-api-t1', 'Kaç istek gider?', '''L = list(range(120))
n, b = 0, 0
while True:
    n += 1
    if b + 50 >= len(L):
        break
    b += 50
print(n)''', ['2', '3', '4', '120'], 1, '0, 50 ve 100 başlangıçları: üç sayfa.'),
 C('proje-oto-api-1', 'Rehberli', '<b>İstek ve sayfalar.</b> <code>tasima("GET", yol, parametre, baslik)</code> <code>(kod, başlıklar, gövde)</code> döndürür. <code>istek(tasima, yol, parametre, anahtar, deneme=4, bekle)</code>: <code>Authorization: Bearer</code> gönderir; 200\'de gövde; 429 ve 5xx tekrarlanır (<code>Retry-After</code> yoksa <code>2**i</code>); başka kod ya da son deneme <code>ApiHata</code>. <code>tum_sayfalar(...)</code>: <code>next_cursor</code> oldukça <code>cursor</code> ile devam eden üreteç, <code>items</code> verir; <code>en_cok</code> sayfayı aşarsa <code>RuntimeError</code>.', A1BAS, A1, A1T, ['yield from g["items"]', 'Yeni sözlük: {**p, "cursor": ...}'], 'Bozuk imleç sonsuz döngü yapar. Üst sınır küçük bir sigortadır.', yanlis=A1Y),
 C('proje-oto-api-2', 'Kendin yaz', '<b>Artımlı yükleme.</b> <code>dogrula(k)</code>: <code>order_id</code> tam sayı, <code>status</code> <code>teslim, iptal, iade</code>, <code>placed_at</code> 19 karakter metin, ücretler sayı ve eksi değil; yoksa alan adını söyleyen <code>ValueError</code>. <code>veritabani(yol)</code>: <code>siparis</code> (anahtar <code>order_id</code>), <code>durum</code>, <code>karantina(kayit, neden)</code>. <code>artimli_yukle(c, tasima, anahtar, bekle)</code>: filigranı <code>durum</code>da <code>since</code> anahtarıyla tutar, <code>since</code> parametresiyle çeker, bozuğu karantinaya yazar, aynı numarayı günceller. Tümü tek işlemde: yarıda kalırsa ne veri ne filigran.', _b1 + A2BAS, _b2, A2T, ['with c: işlem açar, hata olursa geri alır.', 'INSERT ... ON CONFLICT(order_id) DO UPDATE'], 'Filigranı veriyle aynı işlemde ilerletmek, kayıp ve çift riskini tek yerde çözer.', yanlis=A2Y, diff=3),
 C('proje-oto-api-3', 'Mini proje', '<b>Günlük iş.</b> <code>gun_raporu(c, gun)</code>: <code>{"gun", "toplam", "durumlar": {durum: {"adet", "gelir"}}}</code>, gelir <code>delivery_fee - discount + tip</code>. <code>rapor_csv(c, gun, klasor)</code>: <code>gunluk_GÜN.csv</code> (<code>durum,adet,gelir</code>) atomik; <code>(yol, rapor)</code>. <code>gunluk_is(...)</code>: önce yükler, sonra rapor yazar; <code>{"cikis", "yol", "yazilan", "reddedilen", "rapor_toplam"}</code>. Çıkış 0 temiz, 1 karantina var, 3 rapor boş (3 öncelikli).', _b2 + A3BAS, _tum, A3T, ['substr(placed_at, 1, 10) = ?', 'Çıkış kodlarını sırayla ata.'], 'Zamanlayıcı yalnız çıkış koduna bakar. Boş rapor için 0 dönmek arızayı gizler.', yanlis=A3Y, diff=2),
 Y('proje-oto-api-y1', 'Gerçek HTTP. Betik yalnız standart kütüphaneyi kullanır ve burada çalıştırıldı: istemci 429 aldı, bir saniye bekledi, üç sayfayı çekti, ikinci çalıştırmada yazılan 0 oldu. Gerçek API\'ye yönlendirmek için <code>KESIT_API_ADRES</code> ve anahtarı değiştirirsin; biçimi ona uyarlaman gerekir.', ['Kodu <code>api_rapor.py</code> olarak kaydet.', 'Birinci terminal: <code>python api_rapor.py sunucu</code>.', 'İkinci terminal: <code>export KESIT_API_ANAHTARI=dogru-anahtar</code> (PowerShell: <code>$env:KESIT_API_ANAHTARI="dogru-anahtar"</code>), <code>python api_rapor.py cek 2024-10-02</code>.', 'Tekrar çalıştır: yazılan 0, rapor aynı.', 'Yanlış anahtar dene: <code>HTTP 401</code> ve tekrar yok.'], file=YEREL, fname='api_rapor.py', cmd='python api_rapor.py cek 2024-10-02', expect="HTTP 429, 1.0 sn bekleniyor\nyazılan 120, rapor [('iptal', 8), ('teslim', 32)]"),
 ],
 faq=[dict(q='requests ya da httpx kullanamaz mıyım?', a='Kullanırsın, gerçek projede tercih edilir. Yerel betik kurulum istemesin diye urllib kullandı. tasima işlevini değiştirmek yeter.'), dict(q='SQLite üretimde olur mu?', a='Tek makinede, tek yazıcıyla çalışan iş için evet. Paylaşımlı sistemde PostgreSQL gibi bir sunucu gerekir; mantık aynı kalır.')],
 mistakes=[dict(bad='for k in sayfa:\n    yaz(k)\n    filigran = k["placed_at"]; commit()', good='with c:\n    ...\n    filigran_yaz()', why='Ağ koparsa eksik sayfa filigranın gerisinde kalır, bir daha çekilmez.'), dict(bad='INSERT OR IGNORE', good='ON CONFLICT DO UPDATE', why='Değişen kayıt eski haliyle kalır.'), dict(bad='return 0  # kayıt yok, sorun yok', good='return 3', why='Boş sonuç çoğu zaman arızadır.')])
yaz('proje-oto-api', 'Otomasyon projesi: API raporu', ders)
