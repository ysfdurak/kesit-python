"""proje-etl dersinin kod parçaları: başlangıç kodları ve çözümler buradan birleştirilir."""
KAYNAK = r'''import csv, io
from datetime import date, datetime, timedelta
import veri

SUTUNLAR = ["event_id", "user_id", "event_type", "event_time", "device"]

def ham_partiler():
    """Gerçek web_events satırlarını günlük CSV partilerine böler ve belgelenmiş bozulmaları ekler."""
    gunler = {}
    for r in veri.kayitlar("anadolu_market", "web_events"):
        s = {k: str(r[k]) for k in SUTUNLAR}
        n = r["event_id"]
        z = s["event_time"]
        parti = z[:10]
        if n % 101 == 0:   # düzeltilebilir: harf ve boşluk
            s["event_type"] = " " + s["event_type"].upper() + " "
        if n % 103 == 0:   # düzeltilebilir: başka tarih biçimi
            s["event_time"] = z[8:10] + "." + z[5:7] + "." + z[:4] + z[10:]
        if n % 211 == 0:   # reddedilir: kullanıcı yok
            s["user_id"] = ""
        if n % 223 == 0:   # reddedilir: tanınmayan olay
            s["event_type"] = "sayfa_gorunum"
        if n % 227 == 0:   # reddedilir: imkânsız tarih
            s["event_time"] = z[:5] + "13" + z[7:]
        if n % 229 == 0:   # reddedilir: tanınmayan cihaz
            s["device"] = "buzdolabi"
        if n % 59 == 0:    # geç gelen satır: iki gün sonraki partide
            parti = (date.fromisoformat(parti) + timedelta(days=2)).isoformat()
        gunler.setdefault(parti, []).append(s)
    partiler = {}
    for parti in sorted(gunler):
        f = io.StringIO()
        y = csv.DictWriter(f, SUTUNLAR, lineterminator="\n")
        y.writeheader()
        y.writerows(gunler[parti])
        partiler[parti] = f.getvalue()
    return partiler
'''

DOGRULA = r'''ADIMLAR = {"visit": 1, "product_view": 2, "add_to_cart": 3, "checkout": 4, "purchase": 5}
CIHAZLAR = {"mobile", "desktop"}

def satir_dogrula(ham):
    kul = (ham.get("user_id") or "").strip()
    if not kul.isdigit() or int(kul) <= 0:
        return None, "kullanici_gecersiz"
    tur = (ham.get("event_type") or "").strip().lower()
    if tur not in ADIMLAR:
        return None, "tur_gecersiz"
    metin = (ham.get("event_time") or "").strip()
    zaman = None
    for bicim in ("%Y-%m-%d %H:%M:%S", "%d.%m.%Y %H:%M:%S"):
        try:
            zaman = datetime.strptime(metin, bicim)
            break
        except ValueError:
            pass
    if zaman is None:
        return None, "zaman_gecersiz"
    cihaz = (ham.get("device") or "").strip().lower()
    if cihaz not in CIHAZLAR:
        return None, "cihaz_gecersiz"
    return {"kaynak_id": int(ham["event_id"]), "kullanici": int(kul), "tur": tur,
            "zaman": zaman.strftime("%Y-%m-%d %H:%M:%S"), "cihaz": cihaz}, None
'''

ISLE = r'''def parti_isle(parti, metin):
    temiz, red = [], []
    for no, ham in enumerate(csv.DictReader(io.StringIO(metin)), 1):
        satir, neden = satir_dogrula(ham)
        if satir is not None and satir["zaman"][:10] > parti:
            satir, neden = None, "gelecek_tarih"
        if satir is None:
            red.append({"parti": parti, "satir": no, "neden": neden, "ham": ",".join(ham[k] or "" for k in SUTUNLAR)})
        else:
            satir.update(gun=satir["zaman"][:10], adim=ADIMLAR[satir["tur"]], parti=parti)
            temiz.append(satir)
    return temiz, red
'''

YUKLE = r'''import sqlite3

def sema_kur(con):
    con.executescript("""
    CREATE TABLE IF NOT EXISTS olay (
        kaynak_id INTEGER NOT NULL, kullanici INTEGER NOT NULL, tur TEXT NOT NULL,
        zaman TEXT NOT NULL, cihaz TEXT NOT NULL, gun TEXT NOT NULL, adim INTEGER NOT NULL, parti TEXT NOT NULL,
        UNIQUE (kullanici, tur, zaman, cihaz));
    CREATE TABLE IF NOT EXISTS reddedilen (
        parti TEXT NOT NULL, satir INTEGER NOT NULL, neden TEXT NOT NULL, ham TEXT NOT NULL,
        PRIMARY KEY (parti, satir));
    """)

def yukle(con, temiz, red):
    once = con.total_changes
    con.executemany("""INSERT INTO olay (kaynak_id, kullanici, tur, zaman, cihaz, gun, adim, parti)
        VALUES (:kaynak_id, :kullanici, :tur, :zaman, :cihaz, :gun, :adim, :parti)
        ON CONFLICT (kullanici, tur, zaman, cihaz) DO NOTHING""", temiz)
    eklenen = con.total_changes - once
    con.executemany("""INSERT INTO reddedilen (parti, satir, neden, ham) VALUES (:parti, :satir, :neden, :ham)
        ON CONFLICT (parti, satir) DO NOTHING""", red)
    return {"eklenen": eklenen, "tekrar": len(temiz) - eklenen, "red": len(red)}
'''

FILIGRAN = r'''def filigran_kur(con):
    con.execute("CREATE TABLE IF NOT EXISTS filigran (tablo TEXT PRIMARY KEY, son_parti TEXT NOT NULL)")

def filigran_oku(con):
    r = con.execute("SELECT son_parti FROM filigran WHERE tablo = 'olay'").fetchone()
    return r[0] if r else None

def filigran_yaz(con, parti):
    con.execute("""INSERT INTO filigran (tablo, son_parti) VALUES ('olay', ?)
        ON CONFLICT (tablo) DO UPDATE SET son_parti = MAX(son_parti, excluded.son_parti)""", (parti,))

def bekleyen_partiler(con, tumu, geri_bakis=2):
    son = filigran_oku(con)
    if son is None:
        return sorted(tumu)
    alt = (date.fromisoformat(son) - timedelta(days=geri_bakis)).isoformat()
    return sorted(p for p in tumu if p > alt)
'''

CALISTIR = r'''import logging

def gunluk_kur(con):
    con.execute("""CREATE TABLE IF NOT EXISTS calisma_gunlugu (
        calisma INTEGER NOT NULL, parti TEXT NOT NULL, gelen INTEGER NOT NULL,
        eklenen INTEGER NOT NULL, tekrar INTEGER NOT NULL, red INTEGER NOT NULL)""")

def calistir(con, partiler, log, geri_bakis=2):
    sema_kur(con); filigran_kur(con); gunluk_kur(con)
    calisma = con.execute("SELECT COALESCE(MAX(calisma), 0) + 1 FROM calisma_gunlugu").fetchone()[0]
    rapor = {"calisma": calisma, "islenen": 0, "eklenen": 0, "tekrar": 0, "red": 0, "durum": "tamam", "hatali_parti": None}
    for parti in bekleyen_partiler(con, partiler, geri_bakis):
        try:
            with con:
                temiz, red = parti_isle(parti, partiler[parti])
                s = yukle(con, temiz, red)
                con.execute("INSERT INTO calisma_gunlugu VALUES (?, ?, ?, ?, ?, ?)",
                            (calisma, parti, len(temiz) + len(red), s["eklenen"], s["tekrar"], s["red"]))
                filigran_yaz(con, parti)
        except Exception as e:
            log.error("parti %s: %s", parti, e)
            rapor.update(durum="hata", hatali_parti=parti)
            return rapor
        log.info("parti %s: eklenen=%d tekrar=%d red=%d", parti, s["eklenen"], s["tekrar"], s["red"])
        if s["red"]:
            log.warning("parti %s: %d satır reddedildi", parti, s["red"])
        rapor["islenen"] += 1
        for k in ("eklenen", "tekrar", "red"):
            rapor[k] += s[k]
    return rapor
'''

KALITE = r'''def kalite_testleri(con):
    tek = lambda q: con.execute(q).fetchone()[0]
    def ekle(ad, tur, deger):
        return {"ad": ad, "tur": tur, "deger": deger, "gecti": deger == 0}
    gunler = [r[0] for r in con.execute("SELECT DISTINCT gun FROM olay ORDER BY gun")]
    eksik = 0
    if gunler:
        toplam = (date.fromisoformat(gunler[-1]) - date.fromisoformat(gunler[0])).days + 1
        eksik = toplam - len(gunler)
    sonuc = [
        ekle("satir_mutabakati", "hata", tek("SELECT COUNT(*) FROM calisma_gunlugu WHERE gelen != eklenen + tekrar + red")),
        ekle("tablo_mutabakati", "hata", abs(tek("SELECT COUNT(*) FROM olay") - tek("SELECT COALESCE(SUM(eklenen), 0) FROM calisma_gunlugu"))),
        ekle("anahtar_tekil", "hata", tek("SELECT COUNT(*) FROM (SELECT 1 FROM olay GROUP BY kullanici, tur, zaman, cihaz HAVING COUNT(*) > 1)")),
        ekle("tur_gecerli", "hata", tek("SELECT COUNT(*) FROM olay WHERE tur NOT IN ('visit', 'product_view', 'add_to_cart', 'checkout', 'purchase')")),
        ekle("gun_tutarli", "hata", tek("SELECT COUNT(*) FROM olay WHERE gun != substr(zaman, 1, 10) OR gun > parti")),
        ekle("kesintisiz_gun", "hata", eksik),
    ]
    huni = tek("""SELECT COUNT(*) FROM (
        SELECT kullanici, MIN(CASE WHEN tur = 'visit' THEN zaman END) AS z,
               MIN(CASE WHEN tur = 'product_view' THEN zaman END) AS g
        FROM olay GROUP BY kullanici) WHERE g < z""")
    sonuc.append({"ad": "huni_sirasi", "tur": "uyari", "deger": huni, "gecti": huni == 0})
    return sonuc

def kalite_gecti(sonuc):
    return all(s["gecti"] for s in sonuc if s["tur"] == "hata")
'''

KANIT = r'''import hashlib

def parmak_izi(con):
    h = hashlib.sha256()
    for r in con.execute("SELECT kullanici, tur, zaman, cihaz FROM olay ORDER BY 1, 2, 3, 4"):
        h.update(repr(r).encode())
    return h.hexdigest()

def kanit():
    partiler = ham_partiler()
    log = logging.getLogger("etl.kanit")
    log.handlers[:] = [logging.NullHandler()]
    log.propagate = False
    # 1) tek seferde iki kez
    a = sqlite3.connect(":memory:")
    ilk = calistir(a, partiler, log)
    satir_ilk = a.execute("SELECT COUNT(*) FROM olay").fetchone()[0]
    ikinci = calistir(a, partiler, log)
    satir_ikinci = a.execute("SELECT COUNT(*) FROM olay").fetchone()[0]
    # 2) her gün bir parti gelir
    b = sqlite3.connect(":memory:")
    biriken = {}
    for p in sorted(partiler):
        biriken[p] = partiler[p]
        calistir(b, biriken, log)
    return {"satir_ilk": satir_ilk, "satir_ikinci": satir_ikinci,
            "ikinci_eklenen": ikinci["eklenen"], "ikinci_islenen": ikinci["islenen"],
            "ayni_sonuc": parmak_izi(a) == parmak_izi(b),
            "kalite": kalite_gecti(kalite_testleri(a)) and kalite_gecti(kalite_testleri(b)),
            "red": a.execute("SELECT COUNT(*) FROM reddedilen").fetchone()[0]}
'''
