#!/usr/bin/env python3
"""proje-analist dersini üretir. Sayılar gerçek Kanat Havayolları verisinden hesaplanır."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from emit import KOK, kodu, calistir, tahmin, mc, yaz

OKU = r'''import pandas as pd
import veri

TARIHLER = ["sched_dep", "sched_arr", "actual_dep", "actual_arr"]

def oku():
    ucus = veri.oku("kanat_havayollari", "hv_flights", parse_dates=TARIHLER)
    rotar = veri.oku("kanat_havayollari", "hv_delays")
    rota = veri.oku("kanat_havayollari", "hv_routes")
    return ucus, rotar, rota
'''
DENETLE = r'''def denetle(ucus):
    return {
        "satir": len(ucus),
        "tekil_sefer": int(ucus["flight_id"].nunique()),
        "iptal": int((ucus["status"] == "cancelled").sum()),
        "yon_degisen": int((ucus["status"] == "diverted").sum()),
        "bos_kalkis": int(ucus["actual_dep"].isna().sum()),
        "bos_varis": int(ucus["actual_arr"].isna().sum()),
    }
'''
TEMIZLE = r'''def dilim_bul(saat):
    if saat < 12:
        return "sabah"
    if saat < 18:
        return "öğle"
    return "akşam"

def temizle(ucus, rota):
    t = ucus[ucus["status"] != "cancelled"].copy()
    t = t.merge(rota[["route_id", "origin", "dest"]], on="route_id", how="left")
    t["rota"] = t["origin"] + "-" + t["dest"]
    t["gec_dk"] = (t["actual_dep"] - t["sched_dep"]).dt.total_seconds() / 60
    t["gec"] = t["gec_dk"] > 15
    t["ay"] = t["sched_dep"].dt.strftime("%Y-%m")
    t["dilim"] = t["sched_dep"].dt.hour.map(dilim_bul)
    return t
'''
OZET = r'''def grup_ozeti(t, sutun, en_az=1):
    o = t.groupby(sutun).agg(ucus=("gec", "size"), gec_orani=("gec", "mean"), medyan_gec=("gec_dk", "median"))
    o = o[o["ucus"] >= en_az].copy()
    o["gec_orani"] = (o["gec_orani"] * 100).round(1)
    o = o.reset_index().sort_values(["gec_orani", sutun], ascending=[False, True]).reset_index(drop=True)
    return o

def neden_ozeti(rotar):
    o = rotar.groupby("reason").agg(sefer=("flight_id", "nunique"), dakika=("minutes", "sum")).reset_index()
    o["pay"] = (o["dakika"] / o["dakika"].sum() * 100).round(1)
    return o.sort_values("dakika", ascending=False).reset_index(drop=True)
'''
GRAFIK = r'''import matplotlib.pyplot as plt

def grafik(ozet):
    fig, ax = plt.subplots(figsize=(6, 3.5))
    ax.bar(ozet["dilim"], ozet["gec_orani"], color="#3b6ea8")
    ax.set_title("Zaman dilimine göre geç kalkış oranı")
    ax.set_ylabel("Geç kalkış oranı (%)")
    ax.set_xlabel("Planlanan kalkış dilimi")
    ax.set_ylim(0, None)
    return fig
'''
TAMPON = r'''def tampon_etkisi(t, dilim, dakika):
    secili = t["dilim"] == dilim
    yeni = t["gec_dk"].where(~secili, t["gec_dk"] - dakika)
    once = int(t["gec"].sum())
    sonra = int((yeni > 15).sum())
    return {"once_oran": round(once / len(t) * 100, 1), "sonra_oran": round(sonra / len(t) * 100, 1), "kurtulan_ucus": once - sonra}
'''
KARAR = r'''def karar(ozet, etki, en_az_fark=5):
    ilk, son = ozet.iloc[0], ozet.iloc[-1]
    fark = round(float(ilk["gec_orani"] - son["gec_orani"]), 1)
    if fark < en_az_fark:
        return {"oneri": "tampon_yok", "dilim": None, "fark": fark}
    return {"oneri": "tampon_ekle", "dilim": ilk["dilim"], "fark": fark}
'''
RAPOR = r'''def rapor():
    ucus, rotar, rota = oku()
    d = denetle(ucus)
    t = temizle(ucus, rota)
    oz = grup_ozeti(t, "dilim")
    ned = neden_ozeti(rotar).iloc[0]
    k = karar(oz, None)
    e = tampon_etkisi(t, k["dilim"], 15)
    satirlar = [
        "# Kış tarifesi: tampon önerisi",
        f"Veri: {d['satir']} sefer, {d['iptal']} iptal çıkarıldı, {len(t)} sefer incelendi.",
        f"En geç dilim: {k['dilim']} (%{oz.iloc[0]['gec_orani']}), en iyi dilim: {oz.iloc[-1]['dilim']} (%{oz.iloc[-1]['gec_orani']}).",
        f"En çok dakika kaybettiren neden: {ned['reason']} (%{ned['pay']}).",
        f"Öneri: {k['dilim']} dilimine 15 dakika tampon. Etki: %{e['once_oran']} -> %{e['sonra_oran']}, {e['kurtulan_ucus']} sefer geç sayılmaktan çıkar.",
        "Sınır: etki, rötarın değişmediği varsayımıyla hesaplandı; deneme yapılmadan kesin sonuç değildir.",
    ]
    return "\n".join(satirlar)
'''
BUG_YOLCU = r'''def rotarli_yolcu(t, rotar):
    # Hatalı: rötarlı seferlerdeki yolcu sayısı olduğundan büyük çıkıyor
    m = t.merge(rotar, on="flight_id")
    return int(m["pax"].sum())
'''
BUG_YOLCU_SOL = r'''def rotarli_yolcu(t, rotar):
    return int(t[t["flight_id"].isin(rotar["flight_id"])]["pax"].sum())
'''
TUM = OKU + '\n' + DENETLE + '\n' + TEMIZLE + '\n' + OZET + '\n' + GRAFIK + '\n' + TAMPON + '\n' + KARAR + '\n' + RAPOR
ns, _ = calistir(TUM + '\nimport matplotlib\nmatplotlib.use("Agg")\n')
ucus, rotar, rota = ns['oku']()
D = ns['denetle'](ucus); t = ns['temizle'](ucus, rota); OZ = ns['grup_ozeti'](t, 'dilim'); NED = ns['neden_ozeti'](rotar)
ROTA = ns['grup_ozeti'](t, 'rota', en_az=50); AY = ns['grup_ozeti'](t, 'ay')
K = ns['karar'](OZ, None); E = ns['tampon_etkisi'](t, K['dilim'], 15); RAP = ns['rapor']()
m = t.merge(rotar, on='flight_id'); PAX_HATALI = int(m['pax'].sum())
PAX_DOGRU = int(t[t['flight_id'].isin(rotar['flight_id'])]['pax'].sum()); BOS = len(t)
GEC_TOP = float(round(t['gec'].mean() * 100, 1))
print(D, BOS, GEC_TOP); print(OZ); print(NED); print(ROTA.head(3)); print(ROTA.tail(2)); print(AY); print(K, E); print(RAP); print(PAX_HATALI, PAX_DOGRU)
oz_d = OZ.to_dict('list'); ned_d = NED.to_dict('list')
ay_d = AY.set_index('ay')['gec_orani'].to_dict()
tr = lambda n: f'{n:,}'.replace(',', '.')
vir = lambda x: str(x).replace('.', ',')
ETIKET = {'sabah': 'sabah', 'öğle': 'öğle', 'akşam': 'akşam'}
oz_sat = ''.join(f"<tr><td>{ETIKET[r.dilim]}</td><td>{tr(int(r.ucus))}</td><td>%{vir(r.gec_orani)}</td><td>{vir(r.medyan_gec)} dk</td></tr>" for r in OZ.itertuples())

HAZIR2 = OKU + '\n' + DENETLE
ex = [
 mc('hv_flights tablosunda iptal seferlerin gerçek kalkış zamanı boş. Ortalama gecikmeyi hesaplarken ne yaparsın?', 'İptalleri ayrı sayar, hesaptan çıkarır, sayısını yazarım', ['Boşlara 0 yazarım, sefer zamanında kalkmış sayılır', 'Tablonun ortalamasını olduğu gibi alırım, pandas boşları halleder', 'İptalleri sessizce silerim, raporda hiç anmam, tablo temiz görünür'], 'İptal bir gecikme değil, ayrı bir sonuçtur. 0 yazmak ortalamayı iyi gösterir, sessizce silmek de okura yalan söyler. Çıkardığın satır sayısını yazmak raporu denetlenebilir kılar.', a=1),
 mc('Sefer tablosunu rötar tablosuyla birleştirdin, satır sayısı arttı. İlk şüphen ne olmalı?', 'Bir seferin birden çok rötar nedeni var', ['pandas hatası, kernel yeniden başlatılmalı', 'Tarih sütunları yanlış okundu', 'Rötar tablosu daha yeni bir sürümden geliyor'], 'Bire çok birleştirme satırları çoğaltır. Yolcu gibi sefer düzeyindeki bir değeri bu tablodan toplarsan aynı yolcuyu birkaç kez sayarsın.', a=2),
 mc('Yöneticiye "akşam tamponu geç kalkışı düşürür" diyeceksin. En dürüst cümle hangisi?', 'Varsayımla bu kadar düşerdi; küçük bir deneme öneririm', ['Tampon koyarsak geç kalkış kesinlikle bu kadar düşer', 'Veri bunu kanıtladı, ayrıca denemeye hiç gerek yok', 'Sonuç belirsiz olduğu için hiçbir öneri yapamam'], 'Hesap bir senaryodur, ölçüm değildir. Varsayımı söyleyip küçük denemeyle ölçmeyi önermek hem karar verdirir hem güveni korur.', a=0),
 tahmin('Bire çok birleştirme. Bu kod ne yazdırır?', '''import pandas as pd
sefer = pd.DataFrame({"id": [1, 2], "pax": [100, 50]})
neden = pd.DataFrame({"id": [1, 1, 2], "neden": ["hava", "teknik", "hava"]})
m = sefer.merge(neden, on="id")
print(len(m), m["pax"].sum(), sefer["pax"].sum())
''', ['2 150 150', '3 150 150', '3 200 200'], 'Birinci seferin iki nedeni olduğu için satırı iki kez görünür; 100 yolcu iki kez toplanır: 250. Gerçek toplam 150.', a=1),
 tahmin('Aykırı değer ve özet ölçü. Bu kod ne yazdırır?', '''import pandas as pd
g = pd.Series([1, 2, 3, 4, 200])
print(g.mean(), g.median())
''', ['3.0 42.0', '42.0 42.0', '3.0 3.0'], 'Tek bir uzun rötar ortalamayı 42 dakikaya çeker, medyan 3 kalır. Bu yüzden özet tabloda ikisini ve oranı birlikte verdik.', a=2),
 tahmin('Küçük örneklem. Bu kod ne yazdırır?', '''import pandas as pd
t = pd.DataFrame({"rota": ["A"] * 2 + ["B"] * 100, "gec": [True, False] + [True] * 40 + [False] * 60})
o = t.groupby("rota")["gec"].agg(["size", "mean"])
print(o[o["size"] >= 50].index.tolist(), o["mean"].idxmax())
''', ["['A'] B", "['B'] B", "['A', 'B'] A"], 'A rotasının oranı %50 ile en yüksek görünür ama yalnız 2 sefere dayanır. En az sefer eşiği bu sahte birinciliği eler.', a=2),
 dict(t='code', id='proje-analist-1', stage='Rehberli', diff=1, needs=['pandas'],
   q='<p><b>Adım 1: oku ve denetle.</b> <code>oku()</code> hazır. <code>denetle(ucus)</code> yaz ve şu tam sayıları içeren sözlük döndür: <code>satir</code>, <code>tekil_sefer</code> (farklı <code>flight_id</code>), <code>iptal</code> (<code>status == "cancelled"</code>), <code>yon_degisen</code> (<code>"diverted"</code>), <code>bos_kalkis</code> (<code>actual_dep</code> boş), <code>bos_varis</code> (<code>actual_arr</code> boş).</p>',
   guide=['len(ucus) satır sayısını verir.', 'ucus["flight_id"].nunique() farklı değerleri sayar.', '(ucus["status"] == "cancelled").sum() koşulu sayar.', 'isna().sum() boşları sayar; int() ile sar.'],
   start=OKU + '\ndef denetle(ucus):\n    # sözlük döndür\n    pass\n', sol=HAZIR2,
   tests=f'_d = denetle(oku()[0])\nassert _d == {D!r}, "Sayılar farklı: " + repr(_d)\nassert all(type(v) is int for v in _d.values()), "Değerler int olmalı"\n_x = pd.DataFrame({{"flight_id": [1, 1, 2], "status": ["cancelled", "landed", "diverted"], "actual_dep": [None, "a", "b"], "actual_arr": [None, None, "c"]}})\nassert denetle(_x) == {{"satir": 3, "tekil_sefer": 2, "iptal": 1, "yon_degisen": 1, "bos_kalkis": 1, "bos_varis": 2}}, "Sabit değer değil, hesap olmalı"\n',
   hints=['Önce kod editöründe ucus.head() ve ucus.isna().sum() ile tabloya bak.'],
   why=f'{D["bos_kalkis"]} boş kalkış tam olarak {D["iptal"]} iptale, {D["bos_varis"]} boş varış da iptal ile yön değiştiren seferlerin toplamına eşit. Boşlar veri hatası değil, sürecin sonucudur; bunu bilmeden "boşları doldurmak" yanlış olurdu.'),
 dict(t='code', id='proje-analist-2', stage='Rehberli', diff=2, needs=['pandas'],
   q='<p><b>Adım 2: temizle.</b> <code>temizle(ucus, rota)</code> yaz; girdiyi değiştirme. İptalleri çıkar, <code>rota</code> tablosunu <code>route_id</code> ile bağla ve şu sütunları ekle:</p><ul><li><code>rota</code>: <code>"IST-ESB"</code> biçiminde</li><li><code>gec_dk</code>: gerçek kalkış eksi planlanan kalkış, dakika (ondalıklı olabilir)</li><li><code>gec</code>: <code>gec_dk</code> 15\'ten büyükse <code>True</code></li><li><code>ay</code>: <code>"2024-09"</code> biçiminde planlanan ay</li><li><code>dilim</code>: planlanan saat 12\'den küçükse <code>"sabah"</code>, 18\'den küçükse <code>"öğle"</code>, değilse <code>"akşam"</code></li></ul>',
   guide=['İptal filtresinden sonra .copy() al.', 't["actual_dep"] - t["sched_dep"] süre verir; .dt.total_seconds() / 60 dakikaya çevirir.', 't["sched_dep"].dt.hour.map(dilim_bul) ile dilimi bul.'],
   start=HAZIR2 + '\ndef dilim_bul(saat):\n    pass\n\ndef temizle(ucus, rota):\n    pass\n', sol=HAZIR2 + '\n' + TEMIZLE,
   tests=f'''_u, _r, _ro = oku()
_b = len(_u)
_t = temizle(_u, _ro)
assert len(_u) == _b and "gec_dk" not in _u.columns, "Girdiyi değiştirme"
assert len(_t) == {BOS}, "İptaller çıkınca {BOS} sefer kalmalı: " + str(len(_t))
assert (_t["status"] != "cancelled").all()
assert _t["gec_dk"].isna().sum() == 0, "Temiz tabloda boş gecikme kalmamalı"
assert round(_t["gec"].mean() * 100, 1) == {GEC_TOP}, "Geç kalkış oranı %{GEC_TOP} olmalı: " + str(round(_t["gec"].mean() * 100, 1))
assert _t.loc[_t["flight_id"] == 1, "rota"].iloc[0] == "IST-ESB", "rota biçimi IST-ESB"
assert _t.loc[_t["flight_id"] == 1, "gec_dk"].iloc[0] == 3, "Birinci seferin gecikmesi 3 dakika"
assert _t.loc[_t["flight_id"] == 1, "ay"].iloc[0] == "2024-09"
assert set(_t["dilim"]) == {{"sabah", "öğle", "akşam"}}, "Üç dilim olmalı"
assert dilim_bul(11) == "sabah" and dilim_bul(12) == "öğle" and dilim_bul(17) == "öğle" and dilim_bul(18) == "akşam", "Sınır saatleri yanlış"
assert _t["dilim"].value_counts().to_dict() == {t['dilim'].value_counts().to_dict()!r}, "Dilim sayıları farklı"
''',
   hints=['Yön değiştiren seferlerin kalkış zamanı vardır; onları çıkarma.', '15 dakikada tam kalkan sefer geç sayılmaz: &gt; 15.'],
   why='Tanımları koda yazdın: "geç" 15 dakikayı aşan kalkıştır. Havacılıkta yaygın bir eşiktir; farklı bir eşik seçersen sonuçlar değişir, bu yüzden tanımı rapora da yazacaksın.'),
 dict(t='code', id='proje-analist-3', stage='Kendin yaz', diff=2, needs=['pandas'],
   q='<p><b>Adım 3: analiz et.</b> İki fonksiyon yaz.</p><p><code>grup_ozeti(t, sutun, en_az=1)</code>: <code>sutun</code>a göre grupla; <code>ucus</code> (satır sayısı), <code>gec_orani</code> (<code>gec</code> ortalaması × 100, 1 ondalık), <code>medyan_gec</code> (<code>gec_dk</code> medyanı). <code>ucus &lt; en_az</code> olan grupları at. Oran azalan, eşitlikte <code>sutun</code> artan sıralı, indeksi sıfırlanmış DataFrame döndür.</p><p><code>neden_ozeti(rotar)</code>: <code>reason</code> başına <code>sefer</code> (farklı sefer), <code>dakika</code> (toplam), <code>pay</code> (dakika payı, %, 1 ondalık). Dakika azalan sıralı döndür.</p>',
   start=HAZIR2 + '\n' + TEMIZLE + '\ndef grup_ozeti(t, sutun, en_az=1):\n    pass\n\ndef neden_ozeti(rotar):\n    pass\n', sol=HAZIR2 + '\n' + TEMIZLE + '\n' + OZET,
   tests=f'''_u, _r, _ro = oku()
_t = temizle(_u, _ro)
_o = grup_ozeti(_t, "dilim")
assert list(_o.columns) == ["dilim", "ucus", "gec_orani", "medyan_gec"], "Sütunlar: " + repr(list(_o.columns))
assert _o.to_dict("list") == {oz_d!r}, "Dilim özeti farklı: " + repr(_o.to_dict("list"))
_n = neden_ozeti(_r)
assert _n.to_dict("list") == {ned_d!r}, "Neden özeti farklı: " + repr(_n.to_dict("list"))
_ro2 = grup_ozeti(_t, "rota", en_az=50)
assert (_ro2["ucus"] >= 50).all() and len(_ro2) == {len(ROTA)}, "En az 50 seferli rota sayısı {len(ROTA)}"
assert _ro2.iloc[0]["rota"] == {ROTA.iloc[0]['rota']!r} and _ro2.iloc[0]["gec_orani"] == {float(ROTA.iloc[0]['gec_orani'])}, "En geç rota farklı"
assert list(_ro2.index) == list(range(len(_ro2))), "İndeks sıfırlanmalı"
assert grup_ozeti(_t, "ay").set_index("ay")["gec_orani"].to_dict() == {ay_d!r}, "Aylık oranlar farklı"
''',
   hints=['groupby(sutun).agg(ucus=("gec", "size"), gec_orani=("gec", "mean"), medyan_gec=("gec_dk", "median"))', 'sort_values([..., ...], ascending=[False, True]).reset_index(drop=True)'],
   why=f'hv_delays bir seferde birden çok neden taşır, bu yüzden <code>nunique</code> kullandın. Oran tek başına yanıltabilir; sefer sayısını yanında tutmak küçük grupları görünür kılar.'),
 dict(t='code', id='proje-analist-4', stage='Kendin yaz', diff=2, needs=['pandas', 'matplotlib'],
   q='<p><b>Adım 4: grafik.</b> <code>grafik(ozet)</code> yaz. Dilim özetini sütun grafiğiyle çiz ve <code>fig</code> döndür: x ekseni <code>dilim</code>, yükseklik <code>gec_orani</code>; başlık <code>Zaman dilimine göre geç kalkış oranı</code>; y ekseni <code>Geç kalkış oranı (%)</code>; x ekseni <code>Planlanan kalkış dilimi</code>; y ekseni 0\'dan başlasın.</p>',
   start=HAZIR2 + '\n' + TEMIZLE + '\n' + OZET + '\nimport matplotlib.pyplot as plt\n\ndef grafik(ozet):\n    pass\n\nfig = grafik(grup_ozeti(temizle(oku()[0], oku()[2]), "dilim"))\n', sol=HAZIR2 + '\n' + TEMIZLE + '\n' + OZET + '\n' + GRAFIK + '\nfig = grafik(grup_ozeti(temizle(oku()[0], oku()[2]), "dilim"))\n',
   tests=f'''_ax = grafik(pd.DataFrame({oz_d!r})).axes[0]
assert [round(p.get_height(), 1) for p in _ax.patches] == {oz_d['gec_orani']!r}, "Sütun yükseklikleri oranlar olmalı"
assert _ax.get_title() == "Zaman dilimine göre geç kalkış oranı", "Başlık: " + _ax.get_title()
assert _ax.get_ylabel() == "Geç kalkış oranı (%)" and _ax.get_xlabel() == "Planlanan kalkış dilimi", "Eksen adları eksik"
assert _ax.get_ylim()[0] == 0, "Sütun grafiğinin ekseni 0'dan başlamalı; yoksa fark büyük görünür"
assert [_t.get_text() for _t in _ax.get_xticklabels()] == {oz_d['dilim']!r}, "x ekseninde dilim adları olmalı"
''',
   hints=['fig, ax = plt.subplots(); ax.bar(x, y)', 'ax.set_ylim(0, None) alt sınırı sabitler.'],
   why='Sütun grafiğinde eksen sıfırdan başlamazsa 10 puanlık fark birkaç kat büyük görünür. Grafik karar verdirdiği için okurunu yanıltmamalı.'),
 dict(t='code', id='proje-analist-5', stage='Kendin yaz', diff=2, needs=['pandas'],
   q='<p><b>Adım 5: senaryo.</b> <code>tampon_etkisi(t, dilim, dakika)</code> yaz. Seçilen dilimdeki seferlerin planı <code>dakika</code> kadar genişletilirse her birinin gecikmesi o kadar azalır. Tüm seferler üzerinden <code>{"once_oran", "sonra_oran", "kurtulan_ucus"}</code> döndür: oranlar %, 1 ondalık; <code>kurtulan_ucus</code> artık geç sayılmayan sefer sayısı. Girdiyi değiştirme.</p>',
   start=HAZIR2 + '\n' + TEMIZLE + '\ndef tampon_etkisi(t, dilim, dakika):\n    pass\n', sol=HAZIR2 + '\n' + TEMIZLE + '\n' + TAMPON,
   tests=f'''_t = temizle(oku()[0], oku()[2])
_kop = _t["gec_dk"].copy()
_e = tampon_etkisi(_t, "{K['dilim']}", 15)
assert _e == {E!r}, "Etki farklı: " + repr(_e)
assert _t["gec_dk"].equals(_kop), "Girdiyi değiştirme"
_x = pd.DataFrame({{"dilim": ["a", "a", "b"], "gec_dk": [20.0, 40.0, 20.0], "gec": [True, True, True]}})
assert tampon_etkisi(_x, "a", 10) == {{"once_oran": 100.0, "sonra_oran": 66.7, "kurtulan_ucus": 1}}, "Yalnız seçili dilim etkilenmeli"
assert tampon_etkisi(_x, "z", 10)["kurtulan_ucus"] == 0
''',
   hints=['t["gec_dk"].where(~secili, t["gec_dk"] - dakika) yalnız seçili satırları değiştirir.', 'Yeni geç sayısı: (yeni > 15).sum().'],
   why='Bu bir ölçüm değil, varsayımlı hesaptır: gerçekte plan uzayınca uçak zinciri ve yer hizmetleri de değişir. Yine de seçenekleri kıyaslamak için ucuz ve hızlı bir araçtır.'),
 dict(t='code', id='proje-analist-6', stage='Hata avı', kind='bug', diff=2, needs=['pandas'],
   q=f'<p><b>Hatayı bul ve düzelt.</b> <code>rotarli_yolcu(t, rotar)</code> en az bir rötar kaydı olan seferlerdeki toplam yolcuyu vermeli. Sonuç {tr(PAX_HATALI)} çıkıyor, ama bu sayı olduğundan büyük. Sefer başına yolcu bir kez sayılmalı.</p>',
   start=HAZIR2 + '\n' + TEMIZLE + '\n' + BUG_YOLCU, sol=HAZIR2 + '\n' + TEMIZLE + '\n' + BUG_YOLCU_SOL,
   tests=f'''_t = temizle(oku()[0], oku()[2])
_n = rotarli_yolcu(_t, oku()[1])
assert _n == {PAX_DOGRU}, "Doğru toplam {PAX_DOGRU}: " + str(_n)
_a = pd.DataFrame({{"flight_id": [1, 2, 3], "pax": [100, 50, 70]}})
_b = pd.DataFrame({{"flight_id": [1, 1, 2], "reason": ["hava", "teknik", "hava"], "minutes": [5, 6, 7]}})
assert rotarli_yolcu(_a, _b) == 150, "Rötarsız sefer sayılmaz, çok nedenli sefer bir kez sayılır"
''',
   hints=['Birleştirme yerine isin ile süzmek satır çoğaltmaz.'],
   why=f'{tr(PAX_HATALI - PAX_DOGRU)} yolcu fazla sayılıyordu. Hata vermeyen ama raporu şişiren en yaygın analist hatası budur: birleştirmeden önce ve sonra satır sayısına bak.'),
 dict(t='code', id='proje-analist-7', stage='Mini proje', diff=3, needs=['pandas'],
   q='<p><b>Son adım: karar.</b> İki fonksiyon yaz.</p><p><code>karar(ozet, etki, en_az_fark=5)</code>: <code>ozet</code> oran azalan sıralıdır. En yüksek ile en düşük oran farkı (1 ondalık) <code>en_az_fark</code> altındaysa <code>{"oneri": "tampon_yok", "dilim": None, "fark": fark}</code>, değilse <code>{"oneri": "tampon_ekle", "dilim": ilk_dilim, "fark": fark}</code>.</p><p><code>rapor()</code>: tüm adımları çalıştırıp şu altı satırı <code>"\\n"</code> ile birleştirip döndür:</p><pre class="out"># Kış tarifesi: tampon önerisi\nVeri: {satir} sefer, {iptal} iptal çıkarıldı, {incelenen} sefer incelendi.\nEn geç dilim: {dilim} (%{oran}), en iyi dilim: {dilim} (%{oran}).\nEn çok dakika kaybettiren neden: {neden} (%{pay}).\nÖneri: {dilim} dilimine 15 dakika tampon. Etki: %{once} -&gt; %{sonra}, {n} sefer geç sayılmaktan çıkar.\nSınır: etki, rötarın değişmediği varsayımıyla hesaplandı; deneme yapılmadan kesin sonuç değildir.</pre>',
   start=HAZIR2 + '\n' + TEMIZLE + '\n' + OZET + '\n' + TAMPON + '\ndef karar(ozet, etki, en_az_fark=5):\n    pass\n\ndef rapor():\n    pass\n\nprint(rapor())\n', sol=HAZIR2 + '\n' + TEMIZLE + '\n' + OZET + '\n' + TAMPON + '\n' + KARAR + '\n' + RAPOR + '\nprint(rapor())\n',
   tests=f'''_o = rapor()
assert _o == {RAP!r}, "Rapor farklı:\\n" + str(_o)
_z = pd.DataFrame({{"dilim": ["x", "y"], "gec_orani": [33.0, 30.0]}})
assert karar(_z, None) == {{"oneri": "tampon_yok", "dilim": None, "fark": 3.0}}, "Fark küçükse karar değişmeli"
assert karar(_z, None, en_az_fark=2)["oneri"] == "tampon_ekle", "Eşik parametresi kullanılmalı"
''',
   hints=['Sayıları elle yazma; her satır önceki adımların sonucundan gelmeli.', 'oz.iloc[0] en geç, oz.iloc[-1] en iyi dilim.'],
   why='Analizin çıktısı tablo değil karardır: öneri, gerekçe, etki ve sınır tek yerde. Yönetici bunu okuyup karar verebilir, sen de her sayının nereden geldiğini gösterebilirsin.'),
]
GOVDE = f'''
<h2>Proje: kış tarifesinde tampon nereye?</h2>
<p>Kanat Havayolları operasyon müdürü soruyor: "Eylülden beri geç kalkışlar artıyor. Kış tarifesinde bazı seferlerin planına 15 dakika tampon koyabilirim ama hepsine koyamam, uçağı boşa bekletmek pahalı. Nereye koyalım?" Bu proje bir analistin gerçek işini baştan sona yaptırır: veriyi oku, sorunlarını anla, temizle, analiz et, grafiği çiz, kararı yaz.</p>
<div class="tbl-wrap"><table><tr><th>Adım</th><th>Soru</th><th>Çıktı</th></tr><tr><td>1. Oku ve denetle</td><td>Elimde ne var?</td><td><code>denetle</code></td></tr><tr><td>2. Temizle</td><td>Hangi satırlar ve tanımlar?</td><td><code>temizle</code></td></tr><tr><td>3. Analiz</td><td>Sorun nerede yoğun?</td><td><code>grup_ozeti</code>, <code>neden_ozeti</code></td></tr><tr><td>4. Grafik</td><td>Nasıl gösteririm?</td><td><code>grafik</code></td></tr><tr><td>5. Senaryo</td><td>Tampon ne kazandırır?</td><td><code>tampon_etkisi</code></td></tr><tr><td>6. Karar</td><td>Ne öneririm?</td><td><code>karar</code>, <code>rapor</code></td></tr></table></div>
<h2>Önce veriyi tanı</h2>
<p>Her analiz aynı soruyla başlar: bu tablo ne anlatıyor, nerede eksik? Burada boş değerlerin bir anlamı var: iptal seferde gerçek zaman olmaz, yön değiştiren seferde varış zamanı boştur.</p>
{kodu(OKU + '''
ucus, rotar, rota = oku()
print(len(ucus), "sefer", ucus["status"].value_counts().to_dict())
print(ucus[["actual_dep", "actual_arr"]].isna().sum().to_dict())
print(len(rotar), "rötar satırı,", rotar["flight_id"].nunique(), "sefer")
''')}
<p>Son satır bir tuzağı gösteriyor: {tr(len(rotar))} rötar satırı {tr(rotar['flight_id'].nunique())} seferi anlatıyor, çünkü bir seferin birden çok nedeni olabilir.</p>
<h2>Tanımları yaz</h2>
<p>Analizde en çok tartışma tanımlardan çıkar. Bu projenin tanımları: geç kalkış, planlanandan 15 dakikayı aşan kalkıştır; iptaller gecikme hesabına girmez, ayrı sayılır; dilimler sabah (12\'den önce), öğle (12-18), akşam (18 ve sonrası). Tanımı değiştirirsen sonuç değişir, bu yüzden raporda da yazılır.</p>
<h2>Sonuç nereye işaret ediyor?</h2>
<p>İptaller çıkınca {tr(BOS)} sefer kalıyor ve %{vir(GEC_TOP)} geç kalkış var. Dilimlere ayırınca fark görünür:</p>
<div class="tbl-wrap"><table><tr><th>Dilim</th><th>Sefer</th><th>Geç oranı</th><th>Medyan gecikme</th></tr>{oz_sat}</table></div>
<p>Aylara bakınca oran Eylül\'de %{vir(ay_d['2024-09'])} iken Aralık\'ta %{vir(ay_d['2024-12'])}. Neden tarafında en çok dakikayı <b>{NED.iloc[0]['reason']}</b> kaybettiriyor (%{vir(NED.iloc[0]['pay'])}). Bu önemli bir uyarıdır: tampon hava koşulunu çözmez, yalnız yolcunun gördüğü gecikmeyi azaltır. Rapora bunu yazmak senin işin.</p>
<div class="note"><b>Veri notu</b>Bu veri kurgusaldır ve bilinen sınırları Veri setleri sayfasında yazar; örneğin geç gelen uçak nedeninin nedensellik gücü zayıftır. Yöntemi öğren, sonucu gerçek bir havayoluna genelleme.</div>
<h2>Grafik karar için çizilir</h2>
{kodu('''import matplotlib.pyplot as plt
import pandas as pd
ozet = pd.DataFrame(''' + repr({'dilim': oz_d['dilim'], 'gec_orani': oz_d['gec_orani']}) + ''')
fig, ax = plt.subplots(figsize=(6, 3.5))
ax.bar(ozet["dilim"], ozet["gec_orani"], color="#3b6ea8")
ax.set_title("Zaman dilimine göre geç kalkış oranı")
ax.set_ylabel("Geç kalkış oranı (%)")
ax.set_ylim(0, None)
plt.show()
''')}
<p>Başlık ne gösterdiğini söyler, eksen birimini yazar, sütun ekseni sıfırdan başlar. Tek bir renk yeter; karar sütunların yüksekliğindedir.</p>
<h2>Kararı yaz</h2>
<p>Hesabın sonunda elinde bir öneri olmalı. Akşam dilimine 15 dakika tampon, tüm seferlerde geç kalkış oranını %{vir(E['once_oran'])} seviyesinden %{vir(E['sonra_oran'])} seviyesine indirirdi; {tr(E['kurtulan_ucus'])} sefer geç sayılmaktan çıkardı. Bu varsayımlı bir hesaptır, ölçüm değildir: rötarın kendisi değişmez varsayıldı. İyi bir karar notu bunu saklamaz, küçük bir deneme önerir.</p>
<section class="deep"><span class="eyebrow">Uzmanlaş</span><h3>Projeyi portföye taşı</h3><p>Aynı akışı kendi bilgisayarında bir defterde yap ve sonucu tek sayfalık nota dök. Rotaları ekle (en az 50 sefer eşiğiyle), <code>hv_bookings</code> ile geciken yolcu sayısını bağla, tamponun maliyetine bir varsayım koy. Görüşmede en çok şunu sorarlar: "Bu sonuca neden güveniyorsun, ne yanlış olabilir?" Cevabın burada: tanımlar, çıkarılan satırlar, bire çok tuzağı, senaryo varsayımı.</p></section>
'''
ders = dict(id='proje-analist', mod='Orta bitirme', min=75, needs=['pandas', 'matplotlib'],
  title='Bitirme projesi: Kanat Havayolları gecikme analizi',
  sum='Gerçek uçuş verisini okur, sorunlarını denetler, temizler, zaman dilimi ve neden bazında analiz eder, grafiğini çizer, tampon senaryosunu hesaplar ve operasyon müdürüne gerekçeli bir iş kararı yazarsın.',
  goals=['Bir tabloyu okuyup eksiklerinin anlamını açıklayabilirim.', 'Analiz tanımlarını koda ve rapora açıkça yazabilirim.', 'Grupla, oranla, küçük grupları ele ve bire çok birleştirme tuzağından kaçınabilirim.', 'Karar verdiren, yanıltmayan bir grafik çizebilirim.', 'Sonucu varsayımı ve sınırıyla birlikte bir iş önerisine çevirebilirim.'],
  body=GOVDE, ex=ex,
  faq=[dict(q='Neden 15 dakika?', a='Sektörde zamanında kalkış için yaygın kullanılan bir eşiktir. Asıl önemlisi tanımı açıkça yazmaktır; işin başka bir eşiği varsa <code>gec</code> sütununu değiştirir, sonucu yeniden üretirsin.'),
       dict(q='Yön değiştiren seferleri neden çıkarmadık?', a='Kalkış gecikmesi hesabına engel değiller: kalkış zamanları var. Varış süresini inceleseydin ayrı karar vermen gerekirdi. Her temizlik kararı soruya bağlıdır.'),
       dict(q='Bu proje istatistik testi içermiyor, eksik mi?', a='Bu soru için yönlü bir karar yeterli: dilim farkı büyük ve her dilimde yüzlerce sefer var. Farklar küçük olsaydı oran testi yapardın; <b>istatistik</b> dersindeki araçlar bunun için.')],
  mistakes=[dict(bad='t = ucus.merge(rotar, on="flight_id")\nprint(t["pax"].sum())', good='ucus[ucus["flight_id"].isin(rotar["flight_id"])]["pax"].sum()', why='Bire çok birleştirmede sefer satırları çoğalır, sefer düzeyindeki değer şişer.'),
            dict(bad='ucus["actual_dep"] = ucus["actual_dep"].fillna(ucus["sched_dep"])', good='t = ucus[ucus["status"] != "cancelled"].copy()', why='İptal seferi zamanında kalkmış göstermek geç kalkış oranını düşürür. İptali ayrı say.'),
            dict(bad='ax.set_ylim(30, 50)', good='ax.set_ylim(0, None)', why='Sütun grafiğinde kesik eksen farkı olduğundan büyük gösterir.')])
yaz(KOK + '/kaynak/v2/p1/proje-analist.js', 'Bitirme: proje-analist (Veri Analisti)', ders, 'orta')
