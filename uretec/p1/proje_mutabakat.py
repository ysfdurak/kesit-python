#!/usr/bin/env python3
"""proje-mutabakat dersini üretir. Senaryo Kesit SQL'deki BT İş Analisti yoluyla aynı: Lezzet Kurye geç teslim kuponu."""
import os, sys, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from emit import KOK, kodu, calistir, tahmin, mc, yaz

KAYNAK = r'''import csv, io, json
import pandas as pd
import veri

def siparisleri_oku():
    return veri.oku("lezzet_kurye", "lk_orders", parse_dates=["placed_at", "delivered_at"])
'''
BEKLENEN = r'''def beklenen_kuponlar(s):
    t = s[(s["status"] == "teslim") & (s["placed_at"] >= "2024-10-01") & (s["placed_at"] < "2025-01-01")].copy()
    t["sure_sn"] = (t["delivered_at"] - t["placed_at"]).dt.total_seconds()
    t = t[t["sure_sn"] > 2700].copy()
    t["tutar"] = 30
    t.loc[t["sure_sn"] > 3600, "tutar"] = 60
    return t[["order_id", "sure_sn", "tutar"]].sort_values("order_id").reset_index(drop=True)
'''
DOSYA = r'''def kupon_dosyasi(beklenen, s):
    """Kupon servisinin dökümünü taklit eder. Hatalar numaraya bağlı, kuralı açık: gerçek veride bu dosya yok."""
    satirlar, kupon_id = [], 5000
    def yaz(order_id, tutar):
        nonlocal kupon_id
        kupon_id += 1
        satirlar.append({"kupon_id": kupon_id, "order_id": order_id, "tutar": tutar})
    for i, r in enumerate(beklenen.itertuples(), 1):
        if i % 97 == 0:          # kupon hiç oluşmamış
            continue
        tutar = r.tutar
        if i % 89 == 0:          # yanlış tutar: 30 ile 60 karışmış
            tutar = 90 - tutar
        yaz(r.order_id, tutar)
        if i % 83 == 0:          # aynı siparişe ikinci kupon
            yaz(r.order_id, tutar)
    gec = set(beklenen["order_id"])
    for o in s[(s["status"] == "teslim") & (s["placed_at"] >= "2024-10-01") & (s["placed_at"] < "2025-01-01")]["order_id"]:
        if o % 211 == 0 and o not in gec:   # zamanında teslime kupon
            yaz(int(o), 30)
    f = io.StringIO()
    y = csv.DictWriter(f, ["kupon_id", "order_id", "tutar"], lineterminator="\n")
    y.writeheader()
    y.writerows(satirlar)
    return f.getvalue()
'''
OKU_DOSYA = r'''ZORUNLU = ["kupon_id", "order_id", "tutar"]

def dosya_oku(metin):
    d = pd.read_csv(io.StringIO(metin))
    eksik = [s for s in ZORUNLU if s not in d.columns]
    if eksik:
        raise ValueError("eksik sütun: " + ", ".join(eksik))
    return d
'''
MUTABAKAT = r'''def mutabakat(beklenen, dosya):
    say = dosya.groupby("order_id").agg(kupon=("kupon_id", "size"), odenen=("tutar", "sum"), tek=("tutar", "first")).reset_index()
    m = beklenen[["order_id", "tutar"]].merge(say, on="order_id", how="outer", indicator=True)
    def durum(r):
        if r["_merge"] == "left_only":
            return "eksik"
        if r["_merge"] == "right_only":
            return "fazla"
        if r["kupon"] > 1:
            return "cift"
        if r["tutar"] != r["tek"]:
            return "tutar_farki"
        return "tamam"
    m["durum"] = m.apply(durum, axis=1)
    m["beklenen_tl"] = m["tutar"].fillna(0).astype(int)
    m["odenen_tl"] = m["odenen"].fillna(0).astype(int)
    m["fark_tl"] = m["odenen_tl"] - m["beklenen_tl"]
    return m[["order_id", "durum", "beklenen_tl", "odenen_tl", "fark_tl"]].sort_values("order_id").reset_index(drop=True)

def ozet_cikar(sonuc):
    g = sonuc.groupby("durum").agg(adet=("order_id", "size"), fark_tl=("fark_tl", "sum"))
    return {
        "adet": {k: int(v) for k, v in g["adet"].items()},
        "beklenen_tl": int(sonuc["beklenen_tl"].sum()),
        "odenen_tl": int(sonuc["odenen_tl"].sum()),
        "net_fark_tl": int(sonuc["fark_tl"].sum()),
    }
'''
SOZLESME = r'''DURUMLAR = {"olustu", "zaten_var"}

def cevap_denetle(cevap):
    hatalar = []
    for alan in ("kupon_id", "order_id"):
        if alan not in cevap:
            hatalar.append(alan + " eksik")
        elif type(cevap[alan]) is not int:
            hatalar.append(alan + " tam sayı olmalı")
    if "tutar" not in cevap:
        hatalar.append("tutar eksik")
    elif cevap["tutar"] not in (30, 60) or type(cevap["tutar"]) is not int:
        hatalar.append("tutar 30 ya da 60 olmalı")
    if cevap.get("durum") not in DURUMLAR:
        hatalar.append("durum geçersiz")
    return hatalar

def cevaplari_tara(metin):
    rapor = []
    for no, satir in enumerate(metin.strip().splitlines(), 1):
        try:
            cevap = json.loads(satir)
        except json.JSONDecodeError:
            rapor.append((no, ["JSON bozuk"]))
            continue
        h = cevap_denetle(cevap)
        if h:
            rapor.append((no, h))
    return rapor
'''
SAYFA = r'''BASLIKLAR = ["order_id", "durum", "beklenen_tl", "odenen_tl", "fark_tl"]

def rapor_sayfalari(sonuc, ozet):
    oz = [["Ölçü", "Değer"], ["Beklenen TL", ozet["beklenen_tl"]], ["Ödenen TL", ozet["odenen_tl"]], ["Net fark TL", ozet["net_fark_tl"]]]
    for durum in sorted(ozet["adet"]):
        oz.append([durum, ozet["adet"][durum]])
    farklar = [BASLIKLAR]
    for r in sonuc[sonuc["durum"] != "tamam"][BASLIKLAR].itertuples(index=False):
        farklar.append([int(r[0]), r[1], int(r[2]), int(r[3]), int(r[4])])
    return {"Özet": oz, "Farklar": farklar}
'''
EXCEL = r'''from openpyxl import Workbook
from openpyxl.styles import Font

def excel_yaz(sayfalar, yol):
    wb = Workbook()
    wb.remove(wb.active)
    for ad, satirlar in sayfalar.items():
        ws = wb.create_sheet(ad)
        for satir in satirlar:
            ws.append(satir)
        for hucre in ws[1]:
            hucre.font = Font(bold=True)
        ws.freeze_panes = "A2"
    wb.save(yol)
'''
KARAR = r'''def karar_notu(ozet):
    a = ozet["adet"]
    fark = sum(v for k, v in a.items() if k != "tamam")
    if fark == 0:
        return "KABUL: Beklenen ve oluşan kuponlar tutuyor."
    return "\n".join([
        f"RET: {fark} siparişte fark var, net {ozet['net_fark_tl']} TL.",
        f"Eksik {a.get('eksik', 0)}: müşteriye söz verilen kupon oluşmamış.",
        f"Çift {a.get('cift', 0)}: aynı siparişe iki kupon, tekrar koruması çalışmıyor.",
        f"Tutar farkı {a.get('tutar_farki', 0)}: 45 ve 60 dakika sınırı yanlış uygulanmış olabilir.",
        f"Fazla {a.get('fazla', 0)}: zamanında teslime kupon verilmiş.",
    ])
'''
BUG_SURE = r'''def beklenen_kuponlar(s):
    # Hatalı: kupon sayısı SQL sonucundan farklı çıkıyor
    t = s[(s["status"] == "teslim") & (s["placed_at"] >= "2024-10-01") & (s["placed_at"] < "2025-01-01")].copy()
    t["sure_dk"] = ((t["delivered_at"] - t["placed_at"]).dt.total_seconds() / 60).round()
    t = t[t["sure_dk"] > 45].copy()
    t["tutar"] = 30
    t.loc[t["sure_dk"] > 60, "tutar"] = 60
    return t[["order_id", "tutar"]].sort_values("order_id").reset_index(drop=True)
'''
BUG_SURE_SOL = r'''def beklenen_kuponlar(s):
    t = s[(s["status"] == "teslim") & (s["placed_at"] >= "2024-10-01") & (s["placed_at"] < "2025-01-01")].copy()
    t["sure_sn"] = (t["delivered_at"] - t["placed_at"]).dt.total_seconds()
    t = t[t["sure_sn"] > 2700].copy()
    t["tutar"] = 30
    t.loc[t["sure_sn"] > 3600, "tutar"] = 60
    return t[["order_id", "tutar"]].sort_values("order_id").reset_index(drop=True)
'''
BUG_INNER = r'''def fark_bul(beklenen, dosya):
    # Hatalı: raporda eksik ve fazla kuponlar hiç görünmüyor
    m = beklenen[["order_id", "tutar"]].merge(dosya, on="order_id", suffixes=("_b", "_d"))
    return m[m["tutar_b"] != m["tutar_d"]]["order_id"].tolist()
'''
BUG_INNER_SOL = r'''def fark_bul(beklenen, dosya):
    m = beklenen[["order_id", "tutar"]].merge(dosya, on="order_id", how="outer", suffixes=("_b", "_d"))
    return sorted(int(x) for x in m[~(m["tutar_b"] == m["tutar_d"])]["order_id"].unique())
'''
H1 = KAYNAK + '\n' + BEKLENEN
H2 = H1 + '\n' + DOSYA
H3 = H2 + '\n' + OKU_DOSYA
H4 = H3 + '\n' + MUTABAKAT
TUM = H4 + '\n' + SOZLESME + '\n' + SAYFA + '\n' + KARAR
ns, _ = calistir(TUM)
s = ns['siparisleri_oku'](); B = ns['beklenen_kuponlar'](s)
ADET = len(B); G60 = int((B['tutar'] == 60).sum()); TL = int(B['tutar'].sum())
assert (ADET, G60, TL) == (1508, 222, 51900), (ADET, G60, TL)   # Kesit SQL BT İş Analisti yolundaki sayılar
M = ns['kupon_dosyasi'](B, s); D = ns['dosya_oku'](M); R = ns['mutabakat'](B, D); OZ = ns['ozet_cikar'](R); NOT = ns['karar_notu'](OZ)
print(ADET, G60, TL, len(D)); print(OZ); print(NOT); print(R[R.durum != 'tamam'].head(8))
ns2, _ = calistir(KAYNAK + BUG_SURE); BH = ns2['beklenen_kuponlar'](ns2['siparisleri_oku']()); H_ADET = len(BH); H_TL = int(BH['tutar'].sum())
print('hatalı', H_ADET, H_TL)
ns3, _ = calistir(H3 + BUG_INNER); HATALI_FARK = len(ns3['fark_bul'](B, D))
ns3, _ = calistir(H3 + BUG_INNER_SOL); DOGRU_FARK = ns3['fark_bul'](B, D)
print(HATALI_FARK, len(DOGRU_FARK), sum(v for k, v in OZ['adet'].items() if k not in ('tamam', 'cift')))
tr = lambda n: f'{n:,}'.replace(',', '.')
a = OZ['adet']
SATIR_ORNEK = {r['durum']: r for r in R.to_dict('records')}
ORNEKLER = {k: {x: (int(v[x]) if x != 'durum' else v[x]) for x in v} for k, v in SATIR_ORNEK.items()}

ex = [
 mc('Kupon servisinden gelen dosyada 1.511 satır, senin hesabında 1.508 kupon var. Fark 3 satır. Ne dersin?', 'Satır satır karşılaştırırım; hatalar birbirini götürebilir', ['Fark küçük olduğu için kabul eder, işi hemen kapatırım', 'Dosyayı silip servis ekibinden hemen yenisini isterim', 'Kendi hesabımı dosyadaki sayıya göre düzeltip geçerim'], 'Toplam tutması eşleşme demek değildir: 30 eksik ve 33 fazla kupon da 3 fark verir. Mutabakat anahtar bazında yapılır.', a=1),
 mc('Geç teslimi neden saniyeyle hesaplıyoruz?', 'Yuvarlama sınırdaki siparişi yanlış tarafa geçirir', ['Python dakika cinsinden süre hesaplayamaz', 'Saniye her zaman daha küçük sayı verir, rapor kısalır', 'Veritabanı yalnız saniye cinsinden sütun kabul eder'], 'Kural "45 dakikayı aşan" der. 45 dakika 20 saniye yuvarlanınca 45 olur, geç sayılmaz. Karar tablosundaki sınırı koda birebir taşımak için en ince birimle hesapla.', a=2),
 mc('API sözleşmesinde <code>tutar</code> sayı olarak tanımlı. Bir cevapta <code>"tutar": "30"</code> geldi. Doğru tepki hangisi?', 'Sözleşme ihlali olarak raporlar, ekiple netleştiririm', ['Metni sayıya çevirip geçerim, sonuç yine aynı olur', 'Görmezden gelirim, çünkü tutarın kendisi doğrudur', 'Testi başarılı sayarım, çünkü değer yine de 30'], 'Tür de sözleşmenin parçasıdır. Bugün çevirip geçmek, başka bir istemcinin çökmesini gizler. İş analisti olarak farkı yazıp sahibine götürürsün.', a=0),
 tahmin('Birleştirme türü. Bu kod ne yazdırır?', '''import pandas as pd
b = pd.DataFrame({"no": [1, 2, 3], "t": [30, 30, 60]})
d = pd.DataFrame({"no": [2, 3, 4], "t": [30, 30, 30]})
print(len(b.merge(d, on="no")), len(b.merge(d, on="no", how="outer")))
''', ['3 3', '2 3', '4 2'], 'İç birleştirme yalnız iki tarafta da olan no 2 ve 3\'ü bırakır. Dış birleştirme 1, 2, 3, 4\'ü verir; mutabakatta eksik ve fazlayı görmek için gereken budur.', needs=['pandas'], a=1),
 tahmin('Sınır değer. Bu kod ne yazdırır?', '''def tutar(sn):
    if sn > 3600:
        return 60
    if sn > 2700:
        return 30
    return 0
print(tutar(2700), tutar(2701), tutar(3600), tutar(3601))
''', ['30 30 60 60', '0 30 60 60', '0 0 30 60'], 'Kural "aşan" der: tam 2.700 saniye geç değildir, tam 3.600 saniye 30 TL\'dir. Sınır değerleri test etmek karar tablosu okumanın parçasıdır.', a=1),
 dict(t='code', id='proje-mutabakat-1', stage='Rehberli', diff=2, needs=['pandas'],
   q=f'<p><b>Adım 1: kuralı koda çevir.</b> Kesit SQL\'deki BT İş Analisti yolunun kuralı: dönem 1 Ekim - 31 Aralık 2024 (<code>placed_at</code>), yalnız <code>status == "teslim"</code>. Sipariş ile teslim arası 2.700 saniyeyi aşarsa 30 TL, 3.600 saniyeyi aşarsa 60 TL kupon. <code>beklenen_kuponlar(s)</code> yaz: <code>order_id</code>, <code>sure_sn</code>, <code>tutar</code> sütunlu, <code>order_id</code> sıralı, indeksi sıfırlanmış DataFrame döndürsün. SQL sonucuyla aynı olmalı: {tr(ADET)} kupon, {tr(TL)} TL.</p>',
   guide=['Üç koşulu & ile birleştir, her birini paranteze al.', 'Süre: (t["delivered_at"] - t["placed_at"]).dt.total_seconds()', 'Önce hepsine 30 yaz, sonra t.loc[t["sure_sn"] > 3600, "tutar"] = 60.', 'İstenen sütunları seç, sort_values ve reset_index(drop=True).'],
   start=KAYNAK + '\ndef beklenen_kuponlar(s):\n    pass\n', sol=H1,
   tests=f'''_b = beklenen_kuponlar(siparisleri_oku())
assert list(_b.columns) == ["order_id", "sure_sn", "tutar"], "Sütunlar: " + repr(list(_b.columns))
assert len(_b) == {ADET} and int(_b["tutar"].sum()) == {TL}, f"{ADET} kupon, {TL} TL beklenir: {{len(_b)}}, {{int(_b['tutar'].sum())}}"
assert int((_b["tutar"] == 60).sum()) == {G60}, "60 TL kupon sayısı {G60} olmalı"
assert _b["order_id"].is_monotonic_increasing and list(_b.index) == list(range(len(_b))), "Sıralı ve sıfırlanmış olmalı"
_x = pd.DataFrame({{"order_id": [1, 2, 3, 4, 5], "status": ["teslim", "teslim", "teslim", "iade", "teslim"],
    "placed_at": pd.to_datetime(["2024-10-01 10:00:00"] * 4 + ["2025-01-01 10:00:00"]),
    "delivered_at": pd.to_datetime(["2024-10-01 10:45:00", "2024-10-01 10:45:01", "2024-10-01 11:00:00", "2024-10-01 12:00:00", "2025-01-01 12:00:00"])}})
_y = beklenen_kuponlar(_x)
assert _y["order_id"].tolist() == [2, 3] and _y["tutar"].tolist() == [30, 30], "Sınırlar: tam 2.700 sn yok, tam 3.600 sn 30 TL; iade ve dönem dışı yok"
''',
   hints=['Tarih karşılaştırması metinle de çalışır: s["placed_at"] >= "2024-10-01".'],
   why='Kod ile SQL aynı sayıyı veriyor. İki bağımsız hesabın tutması, kuralı doğru anladığının en iyi kanıtıdır.'),
 dict(t='code', id='proje-mutabakat-2', stage='Rehberli', diff=1, needs=['pandas'],
   q='<p><b>Adım 2: dosyayı denetleyerek oku.</b> <code>kupon_dosyasi</code> hazır; kupon servisinin CSV dökümünü taklit eder. <code>dosya_oku(metin)</code> yaz: metni <code>pd.read_csv(io.StringIO(metin))</code> ile oku. <code>ZORUNLU</code> sütunlardan eksik varsa <code>ValueError("eksik sütun: a, b")</code> fırlat; yoksa DataFrame döndür.</p>',
   start=H2 + '\nZORUNLU = ["kupon_id", "order_id", "tutar"]\n\ndef dosya_oku(metin):\n    pass\n', sol=H3,
   tests=f'''_s = siparisleri_oku(); _b = beklenen_kuponlar(_s)
_d = dosya_oku(kupon_dosyasi(_b, _s))
assert len(_d) == {len(D)}, "Dosyada {len(D)} satır var: " + str(len(_d))
assert list(_d.columns) == ["kupon_id", "order_id", "tutar"]
for _m, _e in [("kupon_id,tutar\\n1,30\\n", "eksik sütun: order_id"), ("no\\n1\\n", "eksik sütun: kupon_id, order_id, tutar")]:
    try:
        dosya_oku(_m)
        assert False, "Eksik sütunda ValueError beklenir"
    except ValueError as e:
        assert str(e) == _e, "Mesaj: " + str(e)
''',
   hints=['eksik = [c for c in ZORUNLU if c not in d.columns]', '", ".join(eksik)'],
   why='Dosyanın biçimi değiştiğinde anlaşılır bir mesajla durmak, saçma bir rapor üretmekten iyidir. Hangi sütunun eksik olduğunu yazmak sorunu doğru kişiye taşır.'),
 dict(t='code', id='proje-mutabakat-3', stage='Kendin yaz', diff=3, needs=['pandas'],
   q='<p><b>Adım 3: mutabakat.</b> <code>mutabakat(beklenen, dosya)</code> yaz. Dosyayı önce <code>order_id</code> başına topla (kupon sayısı, toplam tutar, ilk tutar), sonra beklenenle <b>dış birleştirme</b> yap. Her sipariş için durum:</p><ul><li><code>eksik</code>: yalnız beklenende</li><li><code>fazla</code>: yalnız dosyada</li><li><code>cift</code>: dosyada birden çok kupon</li><li><code>tutar_farki</code>: tek kupon ama tutar farklı</li><li><code>tamam</code>: diğerleri</li></ul><p><code>order_id, durum, beklenen_tl, odenen_tl, fark_tl</code> sütunlu, <code>order_id</code> sıralı DataFrame döndür (<code>fark_tl = odenen_tl - beklenen_tl</code>, boşlar 0, tam sayı).</p><p><code>ozet_cikar(sonuc)</code>: <code>{"adet": {durum: sayı}, "beklenen_tl", "odenen_tl", "net_fark_tl"}</code> (hepsi <code>int</code>).</p>',
   start=H3 + '\ndef mutabakat(beklenen, dosya):\n    pass\n\ndef ozet_cikar(sonuc):\n    pass\n', sol=H4,
   tests=f'''_s = siparisleri_oku(); _b = beklenen_kuponlar(_s); _d = dosya_oku(kupon_dosyasi(_b, _s))
_r = mutabakat(_b, _d)
assert list(_r.columns) == ["order_id", "durum", "beklenen_tl", "odenen_tl", "fark_tl"], "Sütunlar: " + repr(list(_r.columns))
_o = ozet_cikar(_r)
assert _o == {OZ!r}, "Özet farklı: " + repr(_o)
assert all(type(v) is int for v in _o["adet"].values()), "Sayılar int olmalı"
_x = pd.DataFrame({{"order_id": [1, 2, 3, 4], "sure_sn": [3000] * 4, "tutar": [30, 30, 60, 30]}})
_y = pd.DataFrame({{"kupon_id": [1, 2, 3, 4, 5], "order_id": [1, 3, 4, 4, 9], "tutar": [30, 30, 30, 30, 30]}})
_z = mutabakat(_x, _y)
assert _z.set_index("order_id")["durum"].to_dict() == {{1: "tamam", 2: "eksik", 3: "tutar_farki", 4: "cift", 9: "fazla"}}, repr(_z)
assert _z.set_index("order_id")["fark_tl"].to_dict() == {{1: 0, 2: -30, 3: -30, 4: 30, 9: 30}}, "Fark hesabı: " + repr(_z)
''',
   hints=['merge(..., how="outer", indicator=True) satırın hangi tarafta olduğunu _merge sütununa yazar.', 'Sıra önemli: önce eksik ve fazla, sonra çift, sonra tutar.', 'NaN için fillna(0).astype(int).'],
   why=f'{tr(len(D))} satırlık dosyada {a["eksik"]} eksik, {a["fazla"]} fazla, {a["cift"]} çift ve {a["tutar_farki"]} tutar farkı var; net fark yalnız {OZ["net_fark_tl"]} TL. Net rakama bakan biri bunların çoğunu göremezdi, çünkü hatalar birbirini götürür.'),
 dict(t='code', id='proje-mutabakat-4', stage='Kendin yaz', diff=2,
   q='<p><b>Adım 4: API sözleşmesi.</b> Kupon servisi her istekte bir JSON cevap döndürür. Sözleşme: <code>kupon_id</code> ve <code>order_id</code> tam sayı, <code>tutar</code> tam sayı ve 30 ya da 60, <code>durum</code> <code>"olustu"</code> ya da <code>"zaten_var"</code>.</p><p><code>cevap_denetle(cevap)</code>: hata metinleri listesi döndürür: <code>"kupon_id eksik"</code>, <code>"kupon_id tam sayı olmalı"</code>, aynısı <code>order_id</code> için, <code>"tutar eksik"</code>, <code>"tutar 30 ya da 60 olmalı"</code>, <code>"durum geçersiz"</code>. Bu sırayla denetle.</p><p><code>cevaplari_tara(metin)</code>: her satırı bir JSON olan metni gezer; hatalı satırlar için <code>(satır_no, hatalar)</code> listesi döndürür. JSON okunamayan satır: <code>(no, ["JSON bozuk"])</code>.</p>',
   start='import json\n\nDURUMLAR = {"olustu", "zaten_var"}\n\ndef cevap_denetle(cevap):\n    pass\n\ndef cevaplari_tara(metin):\n    pass\n', sol='import json\n\n' + SOZLESME,
   tests='''_i = {"kupon_id": 1, "order_id": 2, "tutar": 30, "durum": "olustu"}
assert cevap_denetle(_i) == [], "Doğru cevapta hata olmamalı"
assert cevap_denetle({"order_id": 2, "tutar": 30, "durum": "olustu"}) == ["kupon_id eksik"]
assert cevap_denetle(dict(_i, order_id="2")) == ["order_id tam sayı olmalı"], "Metin sayı sayılmaz"
assert cevap_denetle(dict(_i, tutar="30")) == ["tutar 30 ya da 60 olmalı"], "Metin tutar kabul edilmez"
assert cevap_denetle(dict(_i, tutar=45)) == ["tutar 30 ya da 60 olmalı"]
assert cevap_denetle(dict(_i, tutar=True)) == ["tutar 30 ya da 60 olmalı"]
assert cevap_denetle(dict(_i, durum="iptal")) == ["durum geçersiz"]
assert cevap_denetle({}) == ["kupon_id eksik", "order_id eksik", "tutar eksik", "durum geçersiz"], "Sıra ve tüm hatalar"
_m = '{"kupon_id": 1, "order_id": 2, "tutar": 30, "durum": "olustu"}\\n{bozuk\\n{"kupon_id": 2, "order_id": 3, "tutar": 45, "durum": "olustu"}\\n'
assert cevaplari_tara(_m) == [(2, ["JSON bozuk"]), (3, ["tutar 30 ya da 60 olmalı"])], repr(cevaplari_tara(_m))
assert cevaplari_tara(_m.splitlines()[0]) == []
''',
   hints=['type(x) is int, True değerini de reddeder; isinstance(True, int) doğrudur.', 'json.JSONDecodeError yakala, satırı atla, sonrakine geç.'],
   why='Gerçek servise ihtiyacın yok: cevap örnekleri dosyadan okunur. Bu araçla sözleşmeyi test ortamında kendin denetler, farkı belgeyle gösterirsin.'),
 dict(t='code', id='proje-mutabakat-5', stage='Hata avı', kind='bug', diff=2, needs=['pandas'],
   q=f'<p><b>Hatayı bul ve düzelt.</b> <code>beklenen_kuponlar(s)</code> {tr(ADET)} yerine {tr(H_ADET)} kupon buluyor; tutar da {tr(TL)} yerine {tr(H_TL)} TL. Kural değişmedi. Hesap dakikaya yuvarlandığı için sınırdaki siparişler yanlış tarafa düşüyor. Süreyi saniyeyle hesapla (<code>order_id</code>, <code>tutar</code> sütunları kalsın).</p>',
   start=KAYNAK + '\n' + BUG_SURE, sol=KAYNAK + '\n' + BUG_SURE_SOL,
   tests=f'''_b = beklenen_kuponlar(siparisleri_oku())
assert len(_b) == {ADET} and int(_b["tutar"].sum()) == {TL}, "{ADET} kupon, {TL} TL beklenir: " + str((len(_b), int(_b["tutar"].sum())))
''',
   hints=['round() olmasa bile dakika ondalıklı olurdu; en temizi saniyeyle karşılaştırmak: 2700 ve 3600.'],
   why='Yuvarlama küçük görünür ama her sınır bir kuraldır. Karar tablosunda "aşan" yazıyorsa kodda > ve doğru birim olmalıdır.'),
 dict(t='code', id='proje-mutabakat-6', stage='Hata avı', kind='bug', diff=2, needs=['pandas'],
   q=f'<p><b>Hatayı bul ve düzelt.</b> <code>fark_bul(beklenen, dosya)</code> farklı olan tüm siparişlerin numaralarını sıralı liste olarak vermeli (eksik ve fazla dahil). Şu an yalnız {HATALI_FARK} sipariş buluyor, çünkü yalnız bir tarafta olan satırlar birleştirmede kayboluyor. Tekrarlı satırı bir kez yaz; numaralar <code>int</code> olsun. Tutarı aynı olan çift kuponu bu fonksiyon aramaz, onu <code>mutabakat</code> yakalar.</p>',
   start=H3 + '\n' + BUG_INNER, sol=H3 + '\n' + BUG_INNER_SOL,
   tests=f'''_s = siparisleri_oku(); _b = beklenen_kuponlar(_s); _d = dosya_oku(kupon_dosyasi(_b, _s))
_f = fark_bul(_b, _d)
assert len(_f) == {len(DOGRU_FARK)}, "{len(DOGRU_FARK)} farklı sipariş beklenir: " + str(len(_f))
_x = pd.DataFrame({{"order_id": [1, 2, 3], "tutar": [30, 30, 60]}})
_y = pd.DataFrame({{"kupon_id": [7, 8, 9], "order_id": [1, 3, 9], "tutar": [30, 30, 30]}})
assert fark_bul(_x, _y) == [2, 3, 9], repr(fark_bul(_x, _y))
assert all(type(v) is int for v in fark_bul(_x, _y)), "int döndür"
''',
   hints=['how="outer" ekle.', 'NaN kendine eşit değildir: tutar_b != tutar_d karşılaştırmasında eksik satırlar da doğru çıkar, ama güvenlisi ~(a == b).'],
   why='İç birleştirme, varsayılan olduğu için en sık yapılan mutabakat hatasıdır: yalnız bir tarafta olan satırı, yani asıl aradığın farkı, sessizce siler.'),
dict(t='code', id='proje-mutabakat-7', stage='Mini proje', diff=3, needs=['pandas'],
   q='<p><b>Son adım: rapor ve karar.</b> İki fonksiyon yaz.</p><p><code>rapor_sayfalari(sonuc, ozet)</code>: Excel\'e yazılacak sayfaları sözlük olarak döndürsün. <code>"Özet"</code>: başlık <code>["Ölçü", "Değer"]</code>; satırlar <code>Beklenen TL</code>, <code>Ödenen TL</code>, <code>Net fark TL</code>, sonra alfabetik durum adı ve adedi. <code>"Farklar"</code>: başlık <code>BASLIKLAR</code>, sonra yalnız <code>tamam</code> olmayan satırlar (Python <code>int</code> ve metin). Sayfaları dosyaya sonraki adımda yazacaksın.</p><p><code>karar_notu(ozet)</code>: <code>tamam</code> dışında durum yoksa <code>"KABUL: Beklenen ve oluşan kuponlar tutuyor."</code>; varsa şu beş satırı döndürsün:</p><pre class="out">RET: {fark} siparişte fark var, net {net} TL.\nEksik {n}: müşteriye söz verilen kupon oluşmamış.\nÇift {n}: aynı siparişe iki kupon, tekrar koruması çalışmıyor.\nTutar farkı {n}: 45 ve 60 dakika sınırı yanlış uygulanmış olabilir.\nFazla {n}: zamanında teslime kupon verilmiş.</pre>',
   start=H4 + '\nBASLIKLAR = ["order_id", "durum", "beklenen_tl", "odenen_tl", "fark_tl"]\n\ndef rapor_sayfalari(sonuc, ozet):\n    pass\n\ndef karar_notu(ozet):\n    pass\n', sol=H4 + '\n' + SAYFA + '\n' + KARAR,
   tests=f"""_s = siparisleri_oku(); _b = beklenen_kuponlar(_s); _r = mutabakat(_b, dosya_oku(kupon_dosyasi(_b, _s))); _o = ozet_cikar(_r)
_p = rapor_sayfalari(_r, _o)
assert list(_p) == ["Özet", "Farklar"], "Sayfalar: " + repr(list(_p))
_a = _p["Özet"]
assert _a[:4] == [["Ölçü", "Değer"], ["Beklenen TL", {OZ['beklenen_tl']}], ["Ödenen TL", {OZ['odenen_tl']}], ["Net fark TL", {OZ['net_fark_tl']}]], repr(_a[:4])
assert [tuple(x) for x in _a[4:]] == {sorted(OZ['adet'].items())!r}, repr(_a[4:])
_f = _p["Farklar"]
assert _f[0] == ["order_id", "durum", "beklenen_tl", "odenen_tl", "fark_tl"], repr(_f[0])
assert len(_f) - 1 == {sum(v for k, v in OZ['adet'].items() if k != 'tamam')}, "Fark satırı sayısı farklı: " + str(len(_f) - 1)
assert all(x[1] != "tamam" for x in _f[1:]), "tamam satırları olmamalı"
assert type(_f[1][0]) is int and type(_f[1][4]) is int, "Excel'e yazılacak değerler Python int olmalı"
assert karar_notu(_o) == {NOT!r}, "Not farklı:\\n" + str(karar_notu(_o))
assert karar_notu({{"adet": {{"tamam": 5}}, "beklenen_tl": 150, "odenen_tl": 150, "net_fark_tl": 0}}) == "KABUL: Beklenen ve oluşan kuponlar tutuyor."
""",
   hints=['sonuc[sonuc["durum"] != "tamam"] ile süz, itertuples ile gez.', 'int(r[0]) numpy tam sayısını Python int yapar; openpyxl ikisini de yazar ama karşılaştırma için net olsun.', 'a.get("eksik", 0): o durum hiç yoksa sayı 0.'],
   why='Çıktın artık paydaşın açıp bakabileceği sayfalar ve kabul ya da ret diyen bir not. Python\'ı burada yazılımcı olmak için değil, SQL\'den gelen hesabı tekrarlanabilir bir denetime çevirmek için kullandın.'),
]
ex.append(dict(t='code', id='proje-mutabakat-8', stage='Mini proje', diff=2, needs=['pandas'],
   q='<p><b>Gerçek Excel raporu.</b> <code>excel_yaz(sayfalar, yol)</code>: <code>rapor_sayfalari</code> çıktısını gerçek <code>.xlsx</code> dosyasına yaz. Her anahtar bir sayfa, her liste bir satır. İki sayfada da ilk satır kalın ve dondurulmuş olsun. Boş varsayılan sayfa kalmasın. Koduna <code>excel_yaz(rapor_sayfalari(r, o), "rapor.xlsx")</code> gibi bir çağrı ekleyip Çalıştır düğmesine basarsan <b>İndir</b> düğmesi çıkar, dosyayı Excel ile açarsın.</p>',
   start=H4 + '\n' + SAYFA + '\nfrom openpyxl import Workbook\nfrom openpyxl.styles import Font\n\ndef excel_yaz(sayfalar, yol):\n    pass\n', sol=H4 + '\n' + SAYFA + '\n' + EXCEL,
   tests=f"""import tempfile, os
from openpyxl import load_workbook
_y = os.path.join(tempfile.mkdtemp(), "kupon_mutabakat.xlsx")
_s = siparisleri_oku(); _b = beklenen_kuponlar(_s); _r = mutabakat(_b, dosya_oku(kupon_dosyasi(_b, _s))); _o = ozet_cikar(_r)
excel_yaz(rapor_sayfalari(_r, _o), _y)
_w = load_workbook(_y)
assert _w.sheetnames == ["Özet", "Farklar"], "Sayfalar: " + repr(_w.sheetnames)
assert _w["Özet"]["B4"].value == {OZ['net_fark_tl']}, "Net fark {OZ['net_fark_tl']} olmalı"
assert _w["Farklar"].max_row == 1 + {sum(v for k, v in OZ['adet'].items() if k != 'tamam')}, "Fark satırı sayısı farklı"
assert _w["Özet"]["A1"].font.bold and _w["Farklar"]["A1"].font.bold, "Başlıklar kalın olmalı"
assert _w["Özet"].freeze_panes == "A2" and _w["Farklar"].freeze_panes == "A2", "İlk satır dondurulmalı"
""",
   hints=['wb.remove(wb.active) boş sayfayı atar.', 'ws.append(satir); ws[1] ilk satır.'],
   why='Paydaşın açacağı dosya budur. Test dosyayı yeniden açıp okuyor, yani görünmeyen bir sözlük değil gerçek bir .xlsx denetleniyor.'))
YEREL = (H4.replace('veri.oku("lezzet_kurye", "lk_orders", parse_dates=["placed_at", "delivered_at"])', 'pd.read_csv("lk_orders.csv", parse_dates=["placed_at", "delivered_at"])').replace('import veri\n', '') + '\n' + SAYFA + '\n' + EXCEL + '\n' + KARAR + """
if __name__ == "__main__":
    s = siparisleri_oku()
    b = beklenen_kuponlar(s)
    d = dosya_oku(kupon_dosyasi(b, s))
    r = mutabakat(b, d)
    o = ozet_cikar(r)
    excel_yaz(rapor_sayfalari(r, o), "kupon_mutabakat.xlsx")
    print(karar_notu(o))
    print("Yazıldı: kupon_mutabakat.xlsx")
""")
import subprocess, tempfile, shutil
with tempfile.TemporaryDirectory() as td:
    open(td + '/mutabakat.py', 'w', encoding='utf-8').write(YEREL)
    shutil.copy(KOK + '/data/lezzet_kurye/lk_orders.csv', td)
    YEREL_CIKTI = subprocess.run([sys.executable, 'mutabakat.py'], cwd=td, capture_output=True, text=True, check=True).stdout.strip()
    from openpyxl import load_workbook
    _w = load_workbook(td + '/kupon_mutabakat.xlsx')
    assert _w.sheetnames == ['Özet', 'Farklar'] and _w['Farklar'].max_row == 1 + sum(v for k, v in OZ['adet'].items() if k != 'tamam') and _w['Özet']['A1'].font.bold
print(YEREL_CIKTI)
ex.append(dict(t='local', id='proje-mutabakat-yerel', stage='Kendi bilgisayarında',
   q='<p>Aynı raporu bilgisayarında dosya yollarıyla üret. Betik aynı hesabı yapar, sonra openpyxl ile iki sayfalı dosya yazar.</p>',
   steps=['Veri setleri sayfasından Lezzet Kurye\'nin <code>lk_orders.csv</code> dosyasını indir.', '<code>python -m pip install pandas openpyxl</code> yaz.', 'Aşağıdaki kodu aynı klasöre <code>mutabakat.py</code> olarak kaydet.', 'Komutu çalıştır, <code>kupon_mutabakat.xlsx</code> dosyasını aç: <code>Özet</code> ve <code>Farklar</code> sayfalarını incele.'],
   file=YEREL, fname='mutabakat.py', cmd='python mutabakat.py', expect=YEREL_CIKTI))
GOVDE = f'''
<h2>Proje: kupon mutabakatı</h2>
<p>Kesit SQL\'deki BT İş Analisti yolunda Lezzet Kurye için geç teslim kuponu talebini analiz ettin: 45 dakikayı aşan teslime 30 TL, 60 dakikayı aşana 60 TL. Geliştirme bitti, kabul testi sana geldi. Elinde sipariş verisi ve kupon servisinin dökümü var. Soru basit: <b>kural doğru uygulanmış mı?</b> Bu dersteki küçük betik bu soruyu her seferinde aynı biçimde, elle Excel karşılaştırması yapmadan cevaplar.</p>
<p>Bu proje yazılımcı olmayı hedeflemez; yolda gördüğün dosya, CSV, JSON, pandas ve Excel işlerini gerçek bir kabul testinde birleştirir.</p>
<div class="tbl-wrap"><table><tr><th>Adım</th><th>Soru</th><th>Çıktı</th></tr><tr><td>1. Kural</td><td>Kaç kupon oluşmalıydı?</td><td><code>beklenen_kuponlar</code></td></tr><tr><td>2. Dosya</td><td>Döküm okunabilir mi?</td><td><code>dosya_oku</code></td></tr><tr><td>3. Mutabakat</td><td>Nerede fark var?</td><td><code>mutabakat</code>, <code>ozet_cikar</code></td></tr><tr><td>4. API</td><td>Cevaplar sözleşmeye uyuyor mu?</td><td><code>cevap_denetle</code></td></tr><tr><td>5. Rapor</td><td>Kabul mü, ret mi?</td><td><code>rapor_sayfalari</code>, <code>karar_notu</code></td></tr></table></div>
<h2>Önce beklenen sonuç</h2>
<p>Kabul testinin ilk kuralı: dosyaya bakmadan önce beklenen sonucu kendin hesapla. Dosyadan başlarsan farkında olmadan ona uyum sağlarsın. Hesabın SQL yolundaki sonuçla aynı olmalı: <b>{tr(ADET)} kupon, {tr(TL)} TL</b> ({G60} tanesi 60 TL).</p>
{kodu(KAYNAK + """
s = siparisleri_oku()
print(s["status"].value_counts().to_dict())
d = s[s["status"] == "teslim"]
sure = (d["delivered_at"] - d["placed_at"]).dt.total_seconds()
print("en kısa", sure.min(), "en uzun", sure.max(), "saniye")
""")}
<h2>İkinci dosya nereden geliyor?</h2>
<p>Veri setlerinde gerçek bir kupon servisi dökümü yok, bu yüzden <code>kupon_dosyasi</code> onu hazır kuraldan üretir ve numaraya bağlı, açık hatalar ekler: bazı kuponlar oluşmamış, bazıları çift, bazılarında 30 ile 60 karışmış, bazıları zamanında teslime verilmiş. Hatalar derse aittir ve koda bakınca görünür; sonuçlar her çalıştırmada aynıdır.</p>
<h2>Toplam tutarsa neden yetmez?</h2>
<p>Dosyanın toplamını beklenenle karşılaştırmak en hızlı yoldur ve en yanıltıcısıdır. Bu örnekte beklenen {tr(OZ['beklenen_tl'])} TL, dosyada {tr(OZ['odenen_tl'])} TL; net fark yalnız {OZ['net_fark_tl']} TL. Oysa {sum(v for k, v in a.items() if k != 'tamam')} siparişte sorun var. Eksik kupon ile çift kupon birbirini götürür. Karşılaştırma bu yüzden sipariş numarası üzerinden, dış birleştirmeyle yapılır.</p>
{kodu("""import pandas as pd
b = pd.DataFrame({"no": [1, 2, 3], "tutar": [30, 30, 60]})
d = pd.DataFrame({"no": [2, 3, 4], "tutar": [30, 30, 30]})
m = b.merge(d, on="no", how="outer", suffixes=("_b", "_d"), indicator=True)
print(m)""")}
<p><code>indicator=True</code> her satırın nereden geldiğini söyler: <code>left_only</code> eksik, <code>right_only</code> fazla, <code>both</code> ise tutar karşılaştırılacak satır.</p>
<h2>API cevabı da bir sözleşmedir</h2>
<p>İş analisti API yazmaz ama cevabın sözleşmeye uyup uymadığını denetleyebilir. <b>http-api</b> dersindeki JSON okuma burada işe yarar; gerçek servise bağlanman gerekmez, örnek cevaplar dosyadan okunur.</p>
<h2>Bitince göreceğin sonuç</h2>
<p>Rapor sayfalarını önce Python listesi olarak kurarsın, sonra gerçek Excel dosyasına yazarsın. Dosya bu sayfada oluşur, indirip Excel'de açabilirsin (openpyxl ilk kullanımda iner, yaklaşık 270 KB).</p>
<div class="tbl-wrap"><table><tr><th>Durum</th><th>Sipariş</th></tr><tr><td>Tamam</td><td>{tr(a['tamam'])}</td></tr><tr><td>Eksik</td><td>{a['eksik']}</td></tr><tr><td>Çift</td><td>{a['cift']}</td></tr><tr><td>Tutar farkı</td><td>{a['tutar_farki']}</td></tr><tr><td>Fazla</td><td>{a['fazla']}</td></tr></table></div>
<section class="deep"><span class="eyebrow">Uzmanlaş</span><h3>Bunu işe taşı</h3><p>Aynı kalıp her kabul testinde çalışır: kuralı ayrı hesapla, anahtarla karşılaştır, farkı sınıflandır, dosya olarak paylaş. Kural Kesit SQL\'deki karar tablosundan geliyor; tablo değişirse betikte tek yer değişir. Bir sonraki adım olarak bu betiği bir sonraki sürümde yeniden çalıştırıp farkın kapandığını göster: buna regresyon denetimi denir.</p></section>
'''
ders = dict(id='proje-mutabakat', mod='Orta bitirme', min=60, needs=['pandas'],
  title='Bitirme projesi: Lezzet Kurye kupon mutabakatı',
  sum='BT iş analisti için kabul testi: geç teslim kuralını koda çevirir, servisin dökümüyle satır satır karşılaştırır, API cevabını sözleşmeye göre denetler, fark raporunu Excel olarak yazar ve kabul ya da ret notu üretirsin.',
  goals=['Karar tablosundaki bir kuralı doğru birim ve sınırla koda çevirebilirim.', 'İki kaynağı anahtarla karşılaştırıp eksik, fazla, çift ve tutar farkını ayırabilirim.', 'JSON cevabını alan, tür ve değer sözleşmesine göre denetleyebilirim.', 'Paydaşın açacağı bir Excel raporu üretebilirim.', 'Sonucu kabul ya da ret diyen kısa bir nota çevirebilirim.'],
  body=GOVDE, ex=ex,
  faq=[dict(q='Bu projeyi yapmadan iş analisti olunur mu?', a='Evet. Python iş analistliği için şart değildir; bu yol isteğe bağlıdır. Proje, SQL\'in ötesinde tekrarlanabilir bir denetim kurmak isteyenler içindir.'),
       dict(q='Neden SQL yerine Python?', a='Hesabın kendisi SQL\'de de yapılır, orada yaptın. Python burada iki kaynağı (biri dosya) birleştirmek, JSON denetlemek ve Excel raporu üretmek için kolaylık sağlar.'),
       dict(q='Kupon dökümü gerçek mi?', a='Hayır. Veri setlerinde böyle bir dosya yok; ders onu hazır kuraldan üretip açık hatalar ekliyor. Sipariş verisi ise gerçek <code>lezzet_kurye</code> tablosudur.')],
  mistakes=[dict(bad='print(dosya["tutar"].sum() == beklenen["tutar"].sum())', good='m = beklenen.merge(say, on="order_id", how="outer", indicator=True)', why='Toplam tutarken satırlar tutmayabilir; eksik ve fazla birbirini götürür.'),
            dict(bad='m = beklenen.merge(dosya, on="order_id")', good='m = beklenen.merge(dosya, on="order_id", how="outer")', why='Varsayılan iç birleştirme, aradığın farkları siler.'),
            dict(bad='gec = sure_dk.round() > 45', good='gec = sure_sn > 2700', why='Yuvarlama sınırdaki siparişleri yanlış tarafa taşır.')])
yaz(KOK + '/kaynak/v2/p1/proje-mutabakat.js', 'Bitirme: proje-mutabakat (BT İş Analisti)', ders, 'orta')
