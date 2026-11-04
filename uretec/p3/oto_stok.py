#!/usr/bin/env python3
"""proje-oto-stok: anadolu_market verisiyle stok uyarısı, .eml dosyaları, bekleme süresi. Yerel sürüm gerçek SMTP'ye gönderir."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ortak import C, M, T, Y, pre, yaz

A1 = '''import json, os
from datetime import date, timedelta
from email.message import EmailMessage
from email import policy
from email.parser import BytesParser
from openpyxl import Workbook, load_workbook
import veri

def stok_durumu(con, bugun, pencere=90, tedarik_gun=14, emniyet_gun=7):
    bas = (date.fromisoformat(bugun) - timedelta(days=pencere)).isoformat()
    s = con.execute("""
        SELECT p.product_id, p.name, p.stock, COALESCE(SUM(CASE WHEN o.status != 'cancelled' AND o.order_date > ? AND o.order_date <= ? THEN i.quantity END), 0)
        FROM products p
        LEFT JOIN order_items i ON i.product_id = p.product_id
        LEFT JOIN orders o ON o.order_id = i.order_id
        GROUP BY p.product_id ORDER BY p.product_id""", (bas, bugun)).fetchall()
    cikti = []
    for pid, ad, stok, satilan in s:
        hiz = satilan / pencere
        kalan = stok / hiz if hiz else None
        esik = hiz * (tedarik_gun + emniyet_gun)
        cikti.append({"id": pid, "ad": ad, "stok": stok, "hiz": round(hiz, 3), "kalan_gun": round(kalan, 1) if kalan is not None else None,
                      "siparis": max(0, round(esik * 2 - stok)) if stok <= esik and hiz else 0, "kritik": bool(hiz) and stok <= esik})
    return cikti
'''
A1BAS = '''import json, os
from datetime import date, timedelta
from email.message import EmailMessage
from email import policy
from email.parser import BytesParser
from openpyxl import Workbook, load_workbook
import veri

def stok_durumu(con, bugun, pencere=90, tedarik_gun=14, emniyet_gun=7):
    pass  # ürün başına {"id", "ad", "stok", "hiz", "kalan_gun", "siparis", "kritik"}
'''
A1T = '''_c = veri.baglan("anadolu_market", ["orders", "order_items", "products"])
_r = stok_durumu(_c, "2024-12-31")
_o = veri.oku("anadolu_market", "orders"); _i = veri.oku("anadolu_market", "order_items"); _p = veri.oku("anadolu_market", "products")
_o["order_date"] = _o["order_date"].astype(str)
_f = _o[(_o["status"] != "cancelled") & (_o["order_date"] > "2024-10-02") & (_o["order_date"] <= "2024-12-31")]
_sat = _i.merge(_f, on="order_id").groupby("product_id")["quantity"].sum()
assert len(_r) == len(_p), "Hiç satılmayan ürün de listede olmalı: " + str(len(_r))
for _x in _r:
    _s = int(_sat.get(_x["id"], 0))
    _h = _s / 90
    _st = int(_p[_p["product_id"] == _x["id"]]["stock"].iloc[0])
    assert _x["stok"] == _st and abs(_x["hiz"] - round(_h, 3)) < 1e-9, f"Ürün {_x['id']} hız: {_h}, senin {_x['hiz']}"
    assert _x["kritik"] == (_h > 0 and _st <= _h * 21), f"Ürün {_x['id']} kritik"
    if _h == 0:
        assert _x["kalan_gun"] is None and _x["siparis"] == 0, "Satılmayan ürün: gün hesaplanamaz, sipariş önerilmez"
    else:
        assert _x["kalan_gun"] == round(_st / _h, 1), f"Ürün {_x['id']} kalan gün"
    if _x["kritik"]:
        assert _x["siparis"] == max(0, round(_h * 42 - _st)), f"Ürün {_x['id']} sipariş miktarı"
    else:
        assert _x["siparis"] == 0, "Kritik değilse sipariş yok"
assert any(x["kritik"] for x in _r), "Gerçek veride kritik ürün çıkmalı"
_e = stok_durumu(_c, "2023-02-01")
assert sum(x["hiz"] for x in _e) < sum(x["hiz"] for x in _r), "Pencere bugüne bağlı olmalı, gelecek satışı sayma"
'''
A1Y = [(A1.replace("o.status != 'cancelled' AND ", ""), 'iptali de satış sayıyor'),
       (A1.replace('FROM products p\n        LEFT JOIN order_items i ON i.product_id = p.product_id\n        LEFT JOIN orders o ON o.order_id = i.order_id', 'FROM products p\n        JOIN order_items i ON i.product_id = p.product_id\n        JOIN orders o ON o.order_id = i.order_id'), 'satılmayan ürün listeden düşüyor'),
       (A1.replace(' AND o.order_date > ? AND o.order_date <= ?', ' AND o.order_date > ?').replace('(bas, bugun)', '(bas,)'), 'bugünden sonraki satışı sayıyor'),
       (A1.replace('kalan = stok / hiz if hiz else None', 'kalan = stok / hiz if hiz else 0'), 'satılmayana 0 gün diyor')]
A2 = '''
def excel_ek(kritikler):
    import io
    wb = Workbook()
    ws = wb.active
    ws.title = "Kritik"
    ws.append(["Ürün", "Stok", "Kalan gün", "Sipariş"])
    for k in kritikler:
        ws.append([k["ad"], k["stok"], k["kalan_gun"], k["siparis"]])
    b = io.BytesIO()
    wb.save(b)
    return b.getvalue()

def uyari_eml(kritikler, bugun, kime, kimden="stok@ornek.test"):
    m = EmailMessage()
    m["Subject"] = f"Stok uyarısı {bugun}: {len(kritikler)} ürün"
    m["From"] = kimden
    m["To"] = ", ".join(kime)
    m.set_content("Kritik ürünler:\\n" + "\\n".join(f"- {k['ad']}: {k['stok']} adet, {k['kalan_gun']} gün" for k in kritikler))
    m.add_attachment(excel_ek(kritikler), maintype="application", subtype="vnd.openxmlformats-officedocument.spreadsheetml.sheet", filename=f"stok_{bugun}.xlsx")
    return m
'''
A2BAS = '''
def excel_ek(kritikler):
    pass  # xlsx baytları

def uyari_eml(kritikler, bugun, kime, kimden="stok@ornek.test"):
    pass  # EmailMessage
'''
A2T = '''import io, tempfile
_K = [{"id": 1, "ad": "Yoga Matı", "stok": 3, "hiz": 0.5, "kalan_gun": 6.0, "siparis": 18, "kritik": True}, {"id": 2, "ad": "Çay Bardağı", "stok": 0, "hiz": 1.0, "kalan_gun": 0.0, "siparis": 42, "kritik": True}]
_m = uyari_eml(_K, "2024-12-31", ["a@ornek.test", "b@ornek.test"])
_y = tempfile.mkdtemp() + "/u.eml"
open(_y, "wb").write(bytes(_m))
_o = BytesParser(policy=policy.default).parse(open(_y, "rb"))
assert _o["Subject"] == "Stok uyarısı 2024-12-31: 2 ürün", "Konu ve Türkçe karakter: " + repr(_o["Subject"])
assert _o["To"] == "a@ornek.test, b@ornek.test" and _o["From"] == "stok@ornek.test", "Adresler"
_g = _o.get_body(preferencelist=("plain",)).get_content()
assert "Yoga Matı" in _g and "Çay Bardağı" in _g and "6.0" in _g, "Gövde: " + repr(_g)
_e = list(_o.iter_attachments())
assert len(_e) == 1 and _e[0].get_filename() == "stok_2024-12-31.xlsx", "Ek adı"
_w = load_workbook(io.BytesIO(_e[0].get_content()))
assert [c.value for c in _w["Kritik"][1]] == ["Ürün", "Stok", "Kalan gün", "Sipariş"] and _w["Kritik"]["A3"].value == "Çay Bardağı" and _w["Kritik"]["D3"].value == 42, "Ek gerçek bir Excel olmalı"
'''
_b1 = A1
A2Y = [(_b1 + A2.replace('''    m.add_attachment(excel_ek(kritikler), maintype="application", subtype="vnd.openxmlformats-officedocument.spreadsheetml.sheet", filename=f"stok_{bugun}.xlsx")
''', ''), 'ek yok'),
       (_b1 + A2.replace('''    b = io.BytesIO()
    wb.save(b)
    return b.getvalue()
''', '''    return str(kritikler).encode()
'''), 'ek gerçek Excel değil'),
       (_b1 + A2.replace('m["To"] = ", ".join(kime)', 'm["To"] = kime[0]'), 'tek alıcı')]
A3 = '''
def bildirilecekler(kritikler, durum, bugun, bekleme=7):
    b = date.fromisoformat(bugun)
    secilen, yeni = [], {}
    gorulen = {str(k["id"]) for k in kritikler}
    for k in kritikler:
        a = str(k["id"])
        e = durum.get(a)
        if e is None or (b - date.fromisoformat(e["tarih"])).days >= bekleme or k["stok"] < e["stok"] * 0.5:
            secilen.append(k)
            yeni[a] = {"tarih": bugun, "stok": k["stok"]}
        else:
            yeni[a] = e
    return secilen, yeni
'''
A3BAS = '''
def bildirilecekler(kritikler, durum, bugun, bekleme=7):
    pass  # (bildirilecek ürünler, yeni durum)
'''
A3T = '''_K = lambda i, s: {"id": i, "ad": "u" + str(i), "stok": s}
_s, _d = bildirilecekler([_K(1, 10), _K(2, 20)], {}, "2024-12-01")
assert [x["id"] for x in _s] == [1, 2], "İlk kez görülen bildirilir"
assert _d == {"1": {"tarih": "2024-12-01", "stok": 10}, "2": {"tarih": "2024-12-01", "stok": 20}}, "Durum: " + repr(_d)
_s, _d2 = bildirilecekler([_K(1, 10), _K(2, 20)], _d, "2024-12-05")
assert _s == [] and _d2 == _d, "Bekleme süresinde tekrar yok, tarih de ilerlemez"
_s, _d3 = bildirilecekler([_K(1, 10), _K(2, 20)], _d, "2024-12-08")
assert [x["id"] for x in _s] == [1, 2], "Yedi gün dolunca tekrar"
_s, _d4 = bildirilecekler([_K(1, 5), _K(2, 11)], _d, "2024-12-03")
assert [x["id"] for x in _s] == [], "Tam yarısı henüz kötüleşme sayılmaz: " + repr(_s)
_s, _d4 = bildirilecekler([_K(1, 4), _K(2, 11)], _d, "2024-12-03")
assert [x["id"] for x in _s] == [1], "Stok yarının altına düşerse beklemez"
assert _d4["1"] == {"tarih": "2024-12-03", "stok": 4} and _d4["2"] == _d["2"], "Yalnız bildirilenin kaydı değişir"
_s, _d5 = bildirilecekler([_K(2, 20)], _d, "2024-12-03")
assert "1" not in _d5, "Düzelen ürün durumdan çıkar: bir daha düşerse yeniden uyarılır"
'''
_b2 = _b1 + A2
A3Y = [(_b2 + A3.replace(' or k["stok"] < e["stok"] * 0.5', ''), 'kötüleşmeyi kaçırıyor'),
       (_b2 + A3.replace('''        else:
            yeni[a] = e
''', ''), 'bekleyen ürünün tarihi siliniyor: her gün uyarır'),
       (_b2 + A3.replace('secilen, yeni = [], {}', 'secilen, yeni = [], dict(durum)'), 'düzelen ürün durumda kalıyor'),
       (_b2 + A3.replace('>= bekleme', '> bekleme'), 'süre bir gün geç')]
A4 = '''
def gun_isi(con, bugun, klasor, kime):
    os.makedirs(klasor, exist_ok=True)
    dy = os.path.join(klasor, "durum.json")
    durum = json.load(open(dy, encoding="utf-8")) if os.path.exists(dy) else {}
    eml = os.path.join(klasor, f"uyari_{bugun}.eml")
    if os.path.exists(eml):
        return {"durum": "atlandi", "yol": eml}
    kritikler = [k for k in stok_durumu(con, bugun) if k["kritik"]]
    sec, yeni = bildirilecekler(kritikler, durum, bugun)
    yol = None
    if sec:
        yol = eml
        with open(eml + ".tmp", "wb") as f:
            f.write(bytes(uyari_eml(sec, bugun, kime)))
        os.replace(eml + ".tmp", eml)
    with open(dy + ".tmp", "w", encoding="utf-8") as f:
        json.dump(yeni, f, ensure_ascii=False)
    os.replace(dy + ".tmp", dy)
    return {"durum": "gonderildi" if sec else "sessiz", "yol": yol, "kritik": len(kritikler), "bildirilen": len(sec)}
'''
A4BAS = '''
def gun_isi(con, bugun, klasor, kime):
    pass  # {"durum": "gonderildi" | "sessiz" | "atlandi", "yol", "kritik", "bildirilen"}
'''
A4T = '''import tempfile, glob
_c = veri.baglan("anadolu_market", ["orders", "order_items", "products"])
_k = tempfile.mkdtemp()
_bek = [x for x in stok_durumu(_c, "2024-12-31") if x["kritik"]]
_r = gun_isi(_c, "2024-12-31", _k, ["a@ornek.test"])
assert _r["durum"] == "gonderildi" and _r["kritik"] == len(_bek) and _r["bildirilen"] == len(_bek), repr(_r)
_o = BytesParser(policy=policy.default).parse(open(_r["yol"], "rb"))
assert f"{len(_bek)} ürün" in _o["Subject"] and len(list(_o.iter_attachments())) == 1, "Dosyadan okunan e-posta"
assert gun_isi(_c, "2024-12-31", _k, ["a@ornek.test"])["durum"] == "atlandi", "Aynı gün ikinci çalışma göndermez"
_r = gun_isi(_c, "2025-01-01", _k, ["a@ornek.test"])
assert _r["durum"] in ("sessiz", "gonderildi") and _r["bildirilen"] < len(_bek), "Ertesi gün aynı ürünler tekrar edilmez: " + repr(_r)
_r = gun_isi(_c, "2025-01-09", _k, ["a@ornek.test"])
assert len(glob.glob(_k + "/*.eml")) >= 1 and not glob.glob(_k + "/*.tmp"), "Geçici dosya kalmaz"
assert json.load(open(_k + "/durum.json", encoding="utf-8")) is not None, "Durum dosyası geçerli JSON"
'''
_b3 = _b2 + A3
A4Y = [(_b3 + A4.replace('''    if os.path.exists(eml):
        return {"durum": "atlandi", "yol": eml}
''', ''), 'aynı gün yeniden gönderiyor'),
       (_b3 + A4.replace('sec, yeni = bildirilecekler(kritikler, durum, bugun)', 'sec, yeni = kritikler, durum'), 'bekleme süresi yok, her gün uyarıyor')]
YEREL = r'''"""stok_uyari.py: stok uyarısını gerçek SMTP ile gönderir. Şifre koda yazılmaz.
Önce başka terminalde sahte sunucu: python -m aiosmtpd -n -l 127.0.0.1:8025
python stok_uyari.py --kur            örnek stok.csv yazar
python stok_uyari.py 2024-12-31       kritik ürünleri bildirir (SMTP_SUNUCU, SMTP_PORT, SMTP_KULLANICI, SMTP_PAROLA)
--kuru ile yalnız .eml yazar, göndermez."""
import argparse, csv, json, os, smtplib, sys
from datetime import date
from email.message import EmailMessage

def kritikler(yol="stok.csv", tedarik=21):
    with open(yol, encoding="utf-8", newline="") as f:
        for s in csv.DictReader(f):
            hiz = float(s["gunluk_hiz"])
            if hiz and int(s["stok"]) <= hiz * tedarik:
                yield {"ad": s["ad"], "stok": int(s["stok"]), "kalan": round(int(s["stok"]) / hiz, 1)}

def bildir(k, durum, bugun, bekleme=7):
    d = date.fromisoformat(bugun)
    sec, yeni = [], {}
    for x in k:
        e = durum.get(x["ad"])
        if e is None or (d - date.fromisoformat(e["tarih"])).days >= bekleme or x["stok"] < e["stok"] * 0.5:
            sec.append(x)
            yeni[x["ad"]] = {"tarih": bugun, "stok": x["stok"]}
        else:
            yeni[x["ad"]] = e
    return sec, yeni

def ileti(sec, bugun, kime):
    m = EmailMessage()
    m["Subject"] = f"Stok uyarısı {bugun}: {len(sec)} ürün"
    m["From"] = "stok@ornek.test"
    m["To"] = kime
    m.set_content("\n".join(f"- {x['ad']}: {x['stok']} adet, {x['kalan']} gün" for x in sec))
    return m

def gonder(m):
    with smtplib.SMTP(os.environ.get("SMTP_SUNUCU", "127.0.0.1"), int(os.environ.get("SMTP_PORT", "8025")), timeout=20) as s:
        if os.environ.get("SMTP_KULLANICI"):
            s.starttls()
            s.login(os.environ["SMTP_KULLANICI"], os.environ["SMTP_PAROLA"])
        s.send_message(m)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("gun", nargs="?")
    ap.add_argument("--kime", default="depo@ornek.test")
    ap.add_argument("--kuru", action="store_true")
    ap.add_argument("--kur", action="store_true")
    a = ap.parse_args()
    if a.kur:
        with open("stok.csv", "w", encoding="utf-8") as f:
            f.write("ad,stok,gunluk_hiz\nYoga Matı,5,0.5\nUSB-C Hub,200,0.4\nDudak Balmı,2,1.0\n")
        return print("stok.csv hazır")
    durum = json.load(open("durum.json", encoding="utf-8")) if os.path.exists("durum.json") else {}
    sec, yeni = bildir(list(kritikler()), durum, a.gun)
    if sec:
        m = ileti(sec, a.gun, a.kime)
        if a.kuru:
            open(f"uyari_{a.gun}.eml", "wb").write(bytes(m))
            print("kuru: eml yazıldı,", len(sec), "ürün")
        else:
            try:
                gonder(m)
            except OSError as e:
                print("gönderilemedi:", e, file=sys.stderr)
                return 2       # durum yazılmaz: yarın yeniden denenir
            print("gönderildi:", len(sec), "ürün")
    else:
        print("sessiz")
    with open("durum.json.tmp", "w", encoding="utf-8") as f:
        json.dump(yeni, f, ensure_ascii=False)
    os.replace("durum.json.tmp", "durum.json")

if __name__ == "__main__":
    sys.exit(main())
'''
if os.environ.get('P3_Y'): open(os.environ['P3_Y'] + '/stok_uyari.py', 'w').write(YEREL)
_tum = _b3 + A4
ORNEK = '''# Yeniden sipariş noktası: tedarik beklerken satılacak miktar ve emniyet payı.
hiz, tedarik, emniyet = 2.0, 14, 7
for stok in [100, 42, 41, 10]:
    esik = hiz * (tedarik + emniyet)
    print(stok, "kritik" if stok <= esik else "yeterli", "kalan gün:", round(stok / hiz, 1))
'''
ders = dict(id='proje-oto-stok', lv='ileri', mod='İleri bitirme', min=80, needs=['pandas', 'sqlite3'],
 title='Otomasyon projesi: stok uyarısı',
 sum='Anadolu Market satış hızından kritik ürünleri hesaplar, Excel ekli gerçek bir e-posta dosyası üretir, aynı uyarıyı her gün tekrarlamaz, stok hızla düşerse beklemez; yerel sürüm gerçek SMTP ile gönderir.',
 goals=['Satış hızı, kalan gün ve yeniden sipariş noktası hesaplayabilirim.', 'Excel ekli e-postayı oluşturup dosyadan geri okuyabilirim.', 'Uyarı yorgunluğunu bekleme süresi ve kötüleşme kuralıyla önleyebilirim.', 'Gönderim başarısızsa durumu ilerletmeyen bir iş yazabilirim.'],
 body=f'''<h2>İş</h2>
<p>Satın alma, stok bittikten sonra haberdar oluyor. İstenen: her sabah kritik ürün listesi. <code>anadolu_market</code> ürün ve sipariş verisi gerçek veri setidir. Tedarik süresi ve emniyet günü bu proje için seçilmiş varsayımdır, gerçek işte ürün ya da tedarikçi bazında gelir.</p>
{pre(ORNEK)}
<div class="tbl-wrap"><table><tr><th>Ölçü</th><th>Hesap</th></tr><tr><td>Hız</td><td>Son 90 günde iptal dışı satılan adet / 90</td></tr><tr><td>Kalan gün</td><td>Stok / hız; hız 0 ise bilinmez</td></tr><tr><td>Kritik</td><td>Stok, hız × (tedarik + emniyet) ve altında</td></tr><tr><td>Sipariş</td><td>Eşiğin iki katına tamamlayan miktar</td></tr></table></div>
<p>Bu sade bir kuraldır, tahmin modeli değil: mevsimselliği ve kampanyayı görmez. Stok sıfırken satış duracağı için hız da olduğundan düşük çıkar. Bunları bilerek kullanırsın.</p>
<h2>Uyarı yorgunluğu</h2>
<p>Her gün aynı 40 ürünü söyleyen e-posta bir hafta sonra okunmaz. Kural: aynı ürün yedi gün içinde tekrar edilmez, ama stok son bildirilenin yarısının altına düşerse beklenmez. Düzelen ürün durumdan silinir, tekrar düşerse yeniden uyarılır.</p>
<h2>Tarayıcıda e-posta</h2>
<p>Tarayıcıdan SMTP bağlantısı açılamaz. Görevlerde gerçek bir <code>.eml</code> dosyası üretir, <code>email.parser</code> ile geri okur ve eki Excel olarak açarız. Dosyayı indirip e-posta programıyla açabilirsin. Gönderim yerel görevde.</p>''',
 ex=[
 M('proje-oto-stok-m1', 'Ürün son 90 günde hiç satılmadı, stok 5. Kalan gün nedir?', ['0 gün: bitti demektir', 'Bilinmiyor', '5 gün: stok kadar', '90 gün: pencere kadar'], 1, 'Sıfıra bölme var. "0 gün" bitti demektir, bu ise tam tersi.'),
 M('proje-oto-stok-m2', 'SMTP gönderimi hata verdi. Durum dosyası ne olmalı?', ['Yazılmamalı', 'Yine de ilerletilmeli', 'Tamamen silinmeli', 'Gönderildi diye işaretlenmeli'], 0, 'Durum ilerlerse uyarı bir hafta boyunca bir daha gitmez.'),
 T('proje-oto-stok-t1', 'Hangi ürünler bildirilir?', '''from datetime import date
durum = {"a": ("2024-12-01", 10), "b": ("2024-12-01", 10), "c": ("2024-12-01", 10)}
simdi = {"a": 10, "b": 4, "c": 10, "d": 1}
gun = {"a": 3, "b": 3, "c": 7, "d": 0}
print([u for u, s in simdi.items() if u not in durum or gun[u] >= 7 or s < durum[u][1] * 0.5])''', ["['d']", "['b', 'd']", "['b', 'c', 'd']", "['a', 'b', 'c', 'd']"], 2, 'b hızla düştü, c yedi gün doldurdu, d yeni. a bekliyor.'),
 C('proje-oto-stok-1', 'Rehberli', '<b>Stok hesabı.</b> <code>stok_durumu(con, bugun, pencere=90, tedarik_gun=14, emniyet_gun=7)</code>: her ürün için (satılmayanlar dahil). Hız: tarih <code>bugun - pencere</code>den sonra ve <code>bugun</code> dahil iptal dışı adet / pencere, 3 basamak. <code>kalan_gun</code>: stok / hız, 1 basamak, hız 0 ise <code>None</code>. <code>kritik</code>: hız var ve stok, <code>hız * (tedarik + emniyet)</code> ve altında. <code>siparis</code>: kritikse <code>round(eşik * 2 - stok)</code> (eksi olamaz), değilse 0.', A1BAS, A1, A1T, ['LEFT JOIN: satılmayan ürün de kalsın.', 'Tarih koşulunu CASE WHEN içinde yaz, WHERE satılmayanı düşürür.', 'COALESCE(..., 0)'], 'WHERE ile süzmek LEFT JOIN\'i içe çevirir: satılmayan ürün sessizce kaybolur.', yanlis=A1Y),
 C('proje-oto-stok-2', 'Kendin yaz', '<b>E-posta dosyası.</b> <code>excel_ek(kritikler)</code>: <code>Kritik</code> sayfalı xlsx baytları (<code>Ürün, Stok, Kalan gün, Sipariş</code>). <code>uyari_eml(kritikler, bugun, kime, kimden)</code>: konu <code>Stok uyarısı GÜN: N ürün</code>, alıcılar virgülle, gövdede ürün adı, stok ve kalan gün, ek <code>stok_GÜN.xlsx</code>.', _b1 + A2BAS, _b2, A2T, ['wb.save(io.BytesIO())', 'm.add_attachment(baytlar, maintype="application", subtype=..., filename=...)'], 'Test dosyayı yazar, başka bir ayrıştırıcıyla okur, eki Excel olarak açar: görünüşe değil içeriğe bakar.', yanlis=A2Y, diff=2),
 C('proje-oto-stok-3', 'Hata avı', '<b>Bekleme kuralı.</b> <code>bildirilecekler(kritikler, durum, bugun, bekleme=7)</code>: <code>(seçilen, yeni durum)</code>. Durum anahtarı <code>str(id)</code>, değer <code>{"tarih", "stok"}</code>. Bildirilir: ilk kez görülen, <code>bekleme</code> gün dolan, stoğu kayıtlının yarısının altına düşen. Bildirilmeyenin kaydı aynen kalır. Kritik listede olmayan ürün yeni durumda yer almaz.', _b2 + A3BAS, _b3, A3T, ['Yeni durumu boş sözlükten kur.', 'date.fromisoformat ile gün farkı.'], 'Tarihi her gün ilerletmek "bir daha asla uyarma" demektir; hiç kaydetmemek "her gün uyar".', yanlis=A3Y, diff=2),
 C('proje-oto-stok-4', 'Mini proje', '<b>Günlük iş.</b> <code>gun_isi(con, bugun, klasor, kime)</code>: <code>uyari_GÜN.eml</code> varsa <code>{"durum": "atlandi", "yol"}</code>. Yoksa hesaplar, bekleme kuralını <code>durum.json</code> ile uygular. Seçilen varsa eml\'i atomik yazar, durum <code>gonderildi</code>; yoksa <code>sessiz</code>. Durumu en son atomik yazar. Dönüş: <code>{"durum", "yol", "kritik", "bildirilen"}</code>.', _b3 + A4BAS, _tum, A4T, ['Önce e-posta, sonra durum: sıra önemli.'], 'Önce durumu yazıp sonra gönderimde patlarsan uyarı kaybolur. Tersi en kötü ihtimalle bir tekrar verir.', yanlis=A4Y, diff=2),
 Y('proje-oto-stok-y1', 'Gerçek SMTP, gerçek gönderim, dışarı çıkmadan. Bu betik burada <code>aiosmtpd</code> ile çalıştırıldı, ileti sunucuya ulaştı. Gerçek sunucuda şifre ortam değişkeninden gelir; kurumsal hesapta uygulama parolası ya da OAuth gerekebilir.', ['<code>python -m pip install aiosmtpd</code>.', 'Birinci terminal: <code>python -m aiosmtpd -n -l 127.0.0.1:8025</code>.', 'Kodu <code>stok_uyari.py</code> olarak kaydet. İkinci terminal: <code>python stok_uyari.py --kur</code>, sonra <code>python stok_uyari.py 2024-12-31</code>.', 'Birinci terminalde iletiyi gör. Aynı komutu yeniden çalıştır: <code>sessiz</code> yazar.', 'Sunucuyu kapat, <code>durum.json</code> dosyasını sil, tekrar dene: çıkış kodu 2 olur, durum yazılmaz.', 'Her sabah için cron: <code>0 7 * * 1-5 cd /yol && python stok_uyari.py $(date +\\%F)</code>. Burada denenmedi.'], file=YEREL, fname='stok_uyari.py', cmd='python stok_uyari.py --kur && python stok_uyari.py 2024-12-31', expect='stok.csv hazır\ngönderildi: 2 ürün'),
 ],
 faq=[dict(q='Neden doğrudan tahmin modeli kurmuyoruz?', a='Basit kural çoğu zaman yeterlidir ve açıklanır. Tahmin modeli için proje-ml ve zaman serisi derslerine bak; önce bu kuralı temel çizgi olarak kullan.'), dict(q='Teams ya da Slack\'e de gönderebilir miyim?', a='Evet, entegrasyon-saas dersinde web kancası var. Bekleme kuralı değişmez, yalnız son adım değişir.')],
 mistakes=[dict(bad='WHERE o.order_date > ? ... LEFT JOIN', good='SUM(CASE WHEN o.order_date > ? THEN i.quantity END)', why='WHERE sağ tablodaki boşları eler, satılmayan ürün kaybolur.'), dict(bad='durumu_yaz(); gonder(m)', good='gonder(m); durumu_yaz()', why='Gönderim patlarsa uyarı bir hafta kaybolur.'), dict(bad='kalan = stok / hiz if hiz else 0', good='kalan = stok / hiz if hiz else None', why='0 gün "bitti" demektir; satılmayan ürün için doğru cevap "bilinmiyor".')])
yaz('proje-oto-stok', 'Otomasyon projesi: stok', ders)
