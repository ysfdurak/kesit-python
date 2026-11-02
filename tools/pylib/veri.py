"""PythonPatika veri setleri (SQLPatika ve PBIPatika ile ortak, tamamen kurgusal).

Kullanım:
    import veri
    veri.liste()                                  # veri setlerini listeler
    veri.tablolar("anadolu_market")               # bir setin tablolarını ve satır sayılarını yazar
    df = veri.oku("anadolu_market", "orders")     # pandas DataFrame
    kayitlar = veri.kayitlar("anadolu_bank", "bank_accounts")   # pandas'sız: sözlük listesi
    con = veri.baglan("anadolu_market")           # tüm tabloları içeren bellek içi SQLite bağlantısı
    yol = veri.yol("pedal_izmir", "bk_trips")     # CSV dosyasının yolu (pd.read_csv(yol) ile de okunur)
"""
import csv, json, os

KOK = os.environ.get("PP_VERI", "/data")
_MAN = None


def _manifest():
    global _MAN
    if _MAN is None:
        with open(os.path.join(KOK, "manifest.json"), encoding="utf-8") as f:
            _MAN = json.load(f)["datasets"]
    return _MAN


def _kontrol(set_adi, tablo=None):
    m = _manifest()
    if set_adi not in m:
        raise KeyError(f"Veri seti yok: {set_adi!r}. Seçenekler: {', '.join(m)}")
    if tablo is not None and tablo not in m[set_adi]["tables"]:
        raise KeyError(f"{set_adi} içinde {tablo!r} tablosu yok. Tablolar: {', '.join(m[set_adi]['tables'])}")


def liste():
    """Veri setlerini adı, kaynağı ve tablo sayısıyla yazdırır."""
    for k, d in _manifest().items():
        n = sum(t["rows"] for t in d["tables"].values())
        print(f"{k:<18} {d['name']:<32} {len(d['tables']):>3} tablo  {n:>8,} satır  ({d['source']})")


def tablolar(set_adi):
    """Bir veri setinin tablolarını satır sayısı ve sütunlarıyla yazdırır."""
    _kontrol(set_adi)
    for t, info in _manifest()[set_adi]["tables"].items():
        print(f"{t:<20} {info['rows']:>8,} satır  " + ", ".join(c[0] for c in info["cols"]))


def sutunlar(set_adi, tablo):
    """Sütun adlarını liste olarak döndürür."""
    _kontrol(set_adi, tablo)
    return [c[0] for c in _manifest()[set_adi]["tables"][tablo]["cols"]]


def yol(set_adi, tablo):
    """CSV dosyasının tam yolunu döndürür."""
    _kontrol(set_adi, tablo)
    return os.path.join(KOK, set_adi, tablo + ".csv")


def _cevir(v):
    if v == "":
        return None
    try:
        return int(v)
    except ValueError:
        pass
    try:
        return float(v)
    except ValueError:
        return v


def kayitlar(set_adi, tablo, cevir=True):
    """Tabloyu sözlük listesi olarak okur (pandas gerekmez). cevir=True ise sayılar int/float, boşlar None olur."""
    with open(yol(set_adi, tablo), encoding="utf-8", newline="") as f:
        r = csv.DictReader(f)
        if not cevir:
            return list(r)
        return [{k: _cevir(v) for k, v in row.items()} for row in r]


def oku(set_adi, tablo, **kw):
    """Tabloyu pandas DataFrame olarak okur. Ek argümanlar pd.read_csv'ye geçer (ör. parse_dates=["order_date"])."""
    import pandas as pd
    return pd.read_csv(yol(set_adi, tablo), **kw)


def hepsi(set_adi):
    """Veri setindeki tüm tabloları {ad: DataFrame} sözlüğü olarak döndürür."""
    _kontrol(set_adi)
    return {t: oku(set_adi, t) for t in _manifest()[set_adi]["tables"]}


def baglan(set_adi, tablolar=None):
    """Veri setini bellek içi SQLite veritabanına yükler ve bağlantıyı döndürür.
    tablolar=["orders", "customers"] verirsen yalnız onları yükler (büyük setlerde hızlıdır)."""
    import sqlite3
    _kontrol(set_adi)
    con = sqlite3.connect(":memory:")
    for t, info in _manifest()[set_adi]["tables"].items():
        if tablolar and t not in tablolar:
            continue
        cols = [c[0] for c in info["cols"]]
        con.execute(f'CREATE TABLE "{t}" (' + ", ".join(f'"{c}"' for c in cols) + ")")
        with open(yol(set_adi, t), encoding="utf-8", newline="") as f:
            r = csv.reader(f)
            next(r)
            con.executemany(f'INSERT INTO "{t}" VALUES (' + ", ".join("?" * len(cols)) + ")",
                            ([_cevir(v) for v in row] for row in r))
    con.commit()
    return con
