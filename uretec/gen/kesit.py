from common import write

DS = 'kesit_bi'
TOPIC = 'Veri seti: Kesit BI'
T = []


def add(**k):
    k.setdefault('topic', TOPIC)
    k.setdefault('ds', DS)
    T.append(k)


GECERSIZ_NOT = '<code>Durum</code> değeri <code>"İptal"</code> ya da <code>"İade"</code> olan satırlar satış sayılmaz (Power BI modelindeki [Net Satış] ölçüsüyle aynı kural).'

# ---------------------------------------------------------------- TEMEL
add(id='b-449', lv='temel', diff=1, kind='rehberli', title='[Net Satış] ölçüsünü yıllara göre hesapla',
    q='<p><b>Finans kontrolörü soruyor:</b> "Power BI raporundaki yıllık Net Satış kartlarının doğru olduğunu Python\'la teyit edebilir misin?"</p>'
      '<p>Kesit BI modelindeki ölçü: <code>Net Satış = CALCULATE(SUM(Satislar[Tutar]), NOT Satislar[Durum] IN {"İptal", "İade"})</code>. '
      '<code>net_satis_yillik(satislar)</code> fonksiyonunu yaz: <code>veri.kayitlar("kesit_bi", "Satislar")</code> listesinden <code>{yil: toplam}</code> sözlüğü döndürsün '
      '(yıl tam sayı, <code>Tarih</code> metninin ilk 4 karakteri; toplam 2 ondalık).</p>',
    guide=['Boş bir sözlük oluştur.', 'Her satırda önce durumu kontrol et; iptal ya da iadeyse atla (CALCULATE\'in filtre bağlamı bu).',
           'Yılı <code>int(s["Tarih"][:4])</code> ile çıkar ve <code>Tutar</code>\'ı o yıla ekle.', 'Sonunda her değeri 2 ondalığa yuvarlayıp döndür.'],
    example='''
# Benzer teknik: filtreli toplam (DAX'taki CALCULATE + SUM fikri)
faturalar = [{"ay": "2024-01", "tutar": 100, "iptal": False}, {"ay": "2024-01", "tutar": 50, "iptal": True},
             {"ay": "2024-02", "tutar": 70, "iptal": False}]
toplam = {}
for f in faturalar:
    if f["iptal"]:
        continue
    toplam[f["ay"]] = toplam.get(f["ay"], 0) + f["tutar"]
print(toplam)
''',
    start='''
import veri

satislar = veri.kayitlar("kesit_bi", "Satislar")


def net_satis_yillik(satislar):
    toplam = {}
    for s in satislar:
        # TODO 1: İptal ve İade satırlarını atla
        # TODO 2: yılı çıkar, Tutar'ı o yıla ekle
        pass
    # TODO 3: değerleri 2 ondalığa yuvarla
    return toplam
''',
    sol='''
import veri

satislar = veri.kayitlar("kesit_bi", "Satislar")


def net_satis_yillik(satislar):
    toplam = {}
    for s in satislar:
        if s["Durum"] in ("İptal", "İade"):
            continue
        yil = int(s["Tarih"][:4])
        toplam[yil] = toplam.get(yil, 0) + s["Tutar"]
    return {y: round(v, 2) for y, v in toplam.items()}


print(net_satis_yillik(satislar))
''',
    calc={'R': 'net_satis_yillik(satislar)'},
    tests='''
r = net_satis_yillik(satislar)
assert set(r) == {2022, 2023, 2024}, "Yıllar tam sayı anahtar olmalı: 2022, 2023, 2024"
assert r == @R@, "Yıllık net satışlar tutmuyor: İptal ve İade satırlarını çıkardın mı?"
ornek = [{"Tarih": "2024-05-01", "Durum": "Teslim Edildi", "Tutar": 100.0}, {"Tarih": "2024-06-01", "Durum": "İade", "Tutar": 40.0},
         {"Tarih": "2024-07-01", "Durum": "Kargoda", "Tutar": 10.5}]
assert net_satis_yillik(ornek) == {2024: 110.5}, "Kargodaki satış sayılır, iade sayılmaz"
''',
    hints=['DAX\'taki filtre = Python\'da <code>if ...: continue</code>.', '<code>s["Durum"] in ("İptal", "İade")</code>',
           'Yuvarlama: <code>{y: round(v, 2) for y, v in toplam.items()}</code>'],
    why='Power BI ölçüsünü Python\'la yeniden hesaplamak (reconciliation), raporun doğruluğunu kanıtlamanın en güvenilir yoludur. CALCULATE\'in filtre argümanı, '
        'satırları toplamadan önce eleyen bir koşuldur; Python\'da bu bir <code>continue</code> ya da süzme ifadesidir. '
        'Not: Durum değerleri Türkçe karakter içerir ("İade"); karşılaştırmada harfi harfine aynı yazmalısın, <code>"Iade"</code> eşleşmez.',
    tags=['DAX', 'CALCULATE', 'filtreli toplam'], min=6)

add(id='b-450', lv='temel', diff=1, kind='yaz', title='Brüt kâr ve marj kartı',
    q='<p><b>CFO soruyor:</b> "Panodaki <i>Brüt Kâr</i> ve <i>Brüt Kâr Marjı %</i> kartlarını doğrula."</p>'
      '<p><code>brut_kar(satislar)</code> fonksiyonunu yaz (<code>veri.kayitlar("kesit_bi", "Satislar")</code>). ' + GECERSIZ_NOT +
      ' Brüt kâr = Σ(<code>Tutar</code> − <code>Maliyet</code>), marj = brüt kâr / ΣTutar × 100. Dönüş: <code>(brut_kar, marj)</code>; kâr 2, marj 1 ondalık. Satış yoksa <code>(0.0, 0.0)</code>.</p>',
    start='''
import veri

satislar = veri.kayitlar("kesit_bi", "Satislar")


def brut_kar(satislar):
    pass
''',
    sol='''
import veri

satislar = veri.kayitlar("kesit_bi", "Satislar")


def brut_kar(satislar):
    tutar = maliyet = 0.0
    for s in satislar:
        if s["Durum"] in ("İptal", "İade"):
            continue
        tutar += s["Tutar"]
        maliyet += s["Maliyet"]
    if tutar == 0:
        return 0.0, 0.0
    kar = tutar - maliyet
    return round(kar, 2), round(kar / tutar * 100, 1)


print(brut_kar(satislar))
''',
    calc={'R': 'brut_kar(satislar)'},
    tests='''
r = brut_kar(satislar)
assert r == @R@, "Brüt kâr ya da marj tutmuyor"
assert brut_kar([]) == (0.0, 0.0), "Satış yoksa (0.0, 0.0): sıfıra bölme olmamalı (DAX\\'taki DIVIDE gibi)"
assert brut_kar([{"Durum": "Teslim Edildi", "Tutar": 200.0, "Maliyet": 150.0}]) == (50.0, 25.0), "200 TL satış, 150 TL maliyet → 50 TL, %25"
''',
    hints=['İki toplam biriktir: Tutar ve Maliyet.', 'Marjı toplamlardan hesapla; satır marjlarının ortalamasını alma.',
           'Payda 0 ise erken dön: <code>if tutar == 0: return 0.0, 0.0</code>'],
    why='Marj, oranların ortalaması değil toplamların oranıdır (DAX: <code>DIVIDE([Brüt Kâr], [Net Satış])</code>). '
        'DIVIDE fonksiyonunun Python karşılığı, paydayı önceden denetleyen bir if\'tir. Bu modelde <code>Maliyet</code> sütunu satır toplamıdır (Adet × BirimMaliyet), '
        'tekrar adetle çarpmak sık yapılan bir hatadır; sütun tanımını kontrol etmeden formül yazma.',
    tags=['marj', 'DIVIDE', 'toplam'], min=5)

add(id='b-451', lv='temel', diff=1, kind='tamamla', title='Sipariş sayısı ve ortalama sepet',
    q='<p><b>E-ticaret müdürü soruyor:</b> "Kaç sipariş aldık ve ortalama sepet tutarımız ne?"</p>'
      '<p>Satislar tablosunda her satır bir <b>sipariş kalemidir</b>; bir siparişin birden çok satırı olabilir. DAX\'ta <code>DISTINCTCOUNT(Satislar[SiparisNo])</code> ve '
      '<code>DIVIDE([Net Satış], [Sipariş Sayısı])</code>. <code>sepet_ozeti(satislar)</code> fonksiyonundaki <code>___</code> boşluklarını doldur. ' + GECERSIZ_NOT + '</p>',
    start='''
import veri

satislar = veri.kayitlar("kesit_bi", "Satislar")


def sepet_ozeti(satislar):
    siparisler = ___
    toplam = 0.0
    for s in satislar:
        if s["Durum"] in ("İptal", "İade"):
            continue
        siparisler.___(s["SiparisNo"])
        toplam += s["Tutar"]
    adet = ___(siparisler)
    return adet, round(toplam / adet, 2)
''',
    sol='''
import veri

satislar = veri.kayitlar("kesit_bi", "Satislar")


def sepet_ozeti(satislar):
    siparisler = set()
    toplam = 0.0
    for s in satislar:
        if s["Durum"] in ("İptal", "İade"):
            continue
        siparisler.add(s["SiparisNo"])
        toplam += s["Tutar"]
    adet = len(siparisler)
    return adet, round(toplam / adet, 2)


print(sepet_ozeti(satislar))
''',
    calc={'R': 'sepet_ozeti(satislar)'},
    tests='''
r = sepet_ozeti(satislar)
assert r == @R@, "Sipariş sayısı ya da ortalama sepet tutmuyor"
assert r[0] < 1389, "Sipariş sayısı satır sayısından az olmalı: aynı siparişin satırları tek sayılır"
ornek = [{"SiparisNo": 1, "Durum": "Kargoda", "Tutar": 30.0}, {"SiparisNo": 1, "Durum": "Kargoda", "Tutar": 20.0},
         {"SiparisNo": 2, "Durum": "Teslim Edildi", "Tutar": 50.0}]
assert sepet_ozeti(ornek) == (2, 50.0), "2 sipariş, toplam 100 → ortalama sepet 50"
''',
    hints=['Tekrarsız değer biriktiren Python yapısı hangisi?', 'Kümeye eleman ekleme yöntemi <code>add</code>.', '<code>set()</code>, <code>.add</code>, <code>len</code>'],
    why='Satır sayısı ile sipariş sayısı farklı şeylerdir; kalem tablosunda satır saymak sipariş sayısını şişirir, ortalama sepeti küçültür. '
        'Küme (set) tekrarları kendiliğinden atar: DISTINCTCOUNT\'ın birebir karşılığı. pandas\'ta <code>df["SiparisNo"].nunique()</code>.',
    tags=['set', 'DISTINCTCOUNT', 'ortalama sepet'], min=4)

add(id='b-452', lv='temel', diff=1, kind='bug', title='Kargo süresi olduğundan uzun görünüyor',
    q='<p><b>Lojistik müdürü itiraz ediyor:</b> "Panoda ortalama teslim süresi Python raporundakinden kısa. Hangisi doğru?"</p>'
      '<p><code>ortalama_kargo(satislar)</code>, teslim edilmiş satırların <code>KargoGun</code> ortalamasını (2 ondalık) vermeli. Teslim edilmeyenlerde alan boştur (<code>None</code>); '
      'aynı gün teslimatlarda <b>0</b>\'dır. Python kodunda bir hata var: <b>bul ve düzelt.</b></p>',
    start='''
import veri

satislar = veri.kayitlar("kesit_bi", "Satislar")


def ortalama_kargo(satislar):
    gunler = []
    for s in satislar:
        if s["KargoGun"]:
            gunler.append(s["KargoGun"])
    return round(sum(gunler) / len(gunler), 2)
''',
    sol='''
import veri

satislar = veri.kayitlar("kesit_bi", "Satislar")


def ortalama_kargo(satislar):
    gunler = []
    for s in satislar:
        if s["KargoGun"] is not None:
            gunler.append(s["KargoGun"])
    return round(sum(gunler) / len(gunler), 2)


print(ortalama_kargo(satislar))
''',
    calc={'R': 'ortalama_kargo(satislar)'},
    tests='''
r = ortalama_kargo(satislar)
assert r == @R@, "Ortalama tutmuyor: aynı gün teslimatlar (0 gün) ortalamaya dahil olmalı"
ornek = [{"KargoGun": 0}, {"KargoGun": 4}, {"KargoGun": None}]
assert ortalama_kargo(ornek) == 2.0, "0 ve 4 gün → ortalama 2.0; None atlanır, 0 atlanmaz"
''',
    hints=['<code>if s["KargoGun"]:</code> koşulu 0 için ne döndürür?', '0, Python\'da "yanlış" (falsy) sayılır; tıpkı None gibi.',
           '<code>if s["KargoGun"] is not None:</code>'],
    why='Doğruluk testi (truthiness) 0\'ı da None gibi eler; 217 aynı gün teslimat ortalamadan düşünce süre olduğundan uzun görünür. '
        'Eksik değeri ayırt etmek için her zaman <code>is not None</code> kullan. Power BI\'daki AVERAGE da yalnız boşları atlar, sıfırları sayar; '
        'bu yüzden pano doğruydu. pandas\'ta <code>mean()</code> NaN\'ları atlar, 0\'ları atlamaz.',
    tags=['None', 'truthiness', 'ortalama'], min=4)

# ---------------------------------------------------------------- ORTA
add(id='b-453', lv='orta', diff=2, kind='rehberli', needs=['pandas'], title='Yılbaşından bugüne satış (TOTALYTD)',
    q='<p><b>Satış direktörü soruyor:</b> "Bu yılın her ayı sonunda yılbaşından itibaren toplam ne kadar satmıştık? (Satış YTD çizgisi)"</p>'
      '<p>DAX\'ta <code>Satış YTD = TOTALYTD([Net Satış], Tarih[Tarih])</code>. <code>satis_ytd(satislar, yil)</code> fonksiyonunu pandas ile yaz: ' + GECERSIZ_NOT +
      ' Dönüş: index ay numarası (1–12), değer o ay sonundaki birikimli net satış (2 ondalık) olan <b>Series</b>.</p>',
    guide=['Geçerli satırları süz, <code>Tarih</code>\'i <code>pd.to_datetime</code> ile çevir.', 'İstenen yılı süz.',
           'Ay numarasına göre <code>Tutar</code> topla (<code>groupby(dt.month)</code>).', '<code>cumsum()</code> ile birikimli topla, yuvarla.'],
    example='''
import pandas as pd
# Benzer teknik: aylık toplam + birikimli toplam
df = pd.DataFrame({"tarih": pd.to_datetime(["2024-01-05", "2024-01-20", "2024-02-03"]), "adet": [3, 2, 4]})
aylik = df.groupby(df["tarih"].dt.month)["adet"].sum()
print(aylik.cumsum())
''',
    start='''
import veri
import pandas as pd

satislar = veri.oku("kesit_bi", "Satislar")


def satis_ytd(satislar, yil):
    df = satislar[~satislar["Durum"].isin(["İptal", "İade"])].copy()
    df["Tarih"] = pd.to_datetime(df["Tarih"])
    # TODO 1: yalnız istenen yıl
    # TODO 2: ay numarasına göre Tutar toplamı
    # TODO 3: birikimli toplam, 2 ondalık
    return None
''',
    sol='''
import veri
import pandas as pd

satislar = veri.oku("kesit_bi", "Satislar")


def satis_ytd(satislar, yil):
    df = satislar[~satislar["Durum"].isin(["İptal", "İade"])].copy()
    df["Tarih"] = pd.to_datetime(df["Tarih"])
    df = df[df["Tarih"].dt.year == yil]
    aylik = df.groupby(df["Tarih"].dt.month)["Tutar"].sum()
    return aylik.cumsum().round(2)


print(satis_ytd(satislar, 2024))
''',
    calc={'R': 'satis_ytd(satislar, 2024).to_dict()', 'S23': 'float(satis_ytd(satislar, 2023).iloc[-1])'},
    tests='''
r = satis_ytd(satislar, 2024)
assert r is not None and len(r) == 12, "12 aylık Series dönmeli"
assert list(r.index) == list(range(1, 13)), "index ay numarası 1–12 olmalı"
for ay, v in @R@.items():
    assert abs(r[ay] - v) < 0.01, f"{ay}. ay YTD değeri {v} olmalı"
assert r.is_monotonic_increasing, "YTD hiçbir zaman azalmaz (birikimli)"
assert abs(satis_ytd(satislar, 2023).iloc[-1] - @S23@) < 0.01, "2023 Aralık YTD = 2023 yıllık net satış"
''',
    hints=['YTD = yıl içinde birikimli toplam.', 'Önce yıl süz, sonra ay bazında topla; <code>df.groupby(df["Tarih"].dt.month)["Tutar"].sum()</code>.',
           '<code>aylik.cumsum().round(2)</code>'],
    why='TOTALYTD, filtrelenen yılın başından bağlamdaki tarihe kadar toplar; pandas\'ta bu yıl süzme + aylık toplam + <code>cumsum</code> zinciridir. '
        'Yuvarlamayı birikimden sonra yap; aylık değerleri yuvarlayıp biriktirmek kuruş kaymalarını toplar. '
        'Birden çok yılı aynı anda istersen: <code>groupby([yil, ay]).sum().groupby(level=0).cumsum()</code> her yılın birikimini ayrı başlatır.',
    tags=['TOTALYTD', 'cumsum', 'zaman zekâsı'], min=7)

add(id='b-454', lv='orta', diff=2, kind='yaz', needs=['pandas'], title='Kategorilerde geçen yıla göre büyüme',
    q='<p><b>Kategori yöneticileri soruyor:</b> "Hangi kategori geçen yıla göre büyüdü, hangisi küçüldü?"</p>'
      '<p>DAX\'ta <code>Büyüme % = DIVIDE([Net Satış] - [Net Satış GY], [Net Satış GY])</code>, GY = <code>SAMEPERIODLASTYEAR</code>. '
      '<code>kategori_buyume(satislar, urunler, yil)</code> fonksiyonunu yaz. ' + GECERSIZ_NOT + ' Kategori, <code>Urunler</code> tablosundan (<code>UrunNo</code>) gelir. '
      'Dönüş: index <code>Kategori</code>, sütunlar <code>gecen_yil</code>, <code>bu_yil</code> (2 ondalık) ve <code>buyume</code> (%, 1 ondalık) olan, <code>buyume</code>\'ye göre azalan DataFrame.</p>',
    start='''
import veri
import pandas as pd

satislar = veri.oku("kesit_bi", "Satislar")
urunler = veri.oku("kesit_bi", "Urunler")


def kategori_buyume(satislar, urunler, yil):
    pass
''',
    sol='''
import veri
import pandas as pd

satislar = veri.oku("kesit_bi", "Satislar")
urunler = veri.oku("kesit_bi", "Urunler")


def kategori_buyume(satislar, urunler, yil):
    df = satislar[~satislar["Durum"].isin(["İptal", "İade"])].merge(urunler[["UrunNo", "Kategori"]], on="UrunNo")
    df["Yil"] = df["Tarih"].str[:4].astype(int)
    p = df[df["Yil"].isin([yil - 1, yil])].pivot_table(index="Kategori", columns="Yil", values="Tutar", aggfunc="sum", fill_value=0)
    sonuc = pd.DataFrame({"gecen_yil": p[yil - 1], "bu_yil": p[yil]})
    sonuc["buyume"] = ((sonuc["bu_yil"] - sonuc["gecen_yil"]) / sonuc["gecen_yil"] * 100).round(1)
    sonuc[["gecen_yil", "bu_yil"]] = sonuc[["gecen_yil", "bu_yil"]].round(2)
    return sonuc.sort_values("buyume", ascending=False)


print(kategori_buyume(satislar, urunler, 2024))
''',
    calc={'B': 'kategori_buyume(satislar, urunler, 2024)["buyume"].to_dict()', 'ILK': 'kategori_buyume(satislar, urunler, 2024).index[0]',
          'E': 'kategori_buyume(satislar, urunler, 2024).loc["Elektronik"].to_dict()'},
    tests='''
r = kategori_buyume(satislar, urunler, 2024)
assert list(r.columns) == ["gecen_yil", "bu_yil", "buyume"], "Sütunlar: gecen_yil, bu_yil, buyume"
assert r.index[0] == @ILK@, "En çok büyüyen kategori en üstte olmalı"
e = r.loc["Elektronik"].to_dict()
for k, v in @E@.items():
    assert abs(e[k] - v) < 0.06, f"Elektronik {k} = {v} olmalı"
for k, v in @B@.items():
    assert abs(r.loc[k, "buyume"] - v) < 0.06, f"{k} büyümesi %{v} olmalı"
''',
    hints=['İki yılı yan yana koymak için <code>pivot_table(index="Kategori", columns="Yil", values="Tutar", aggfunc="sum")</code>.',
           'Büyüme = (bu yıl − geçen yıl) / geçen yıl × 100.', 'Önce kategoriyi <code>merge</code> ile getir; yılı <code>Tarih.str[:4]</code> ile çıkar.'],
    why='SAMEPERIODLASTYEAR, filtre bağlamını bir yıl geri kaydırır; pandas\'ta en okunur karşılığı iki yılı sütun olarak yan yana koymaktır (pivot). '
        'Geçen yıl satışı 0 olan kategoride büyüme sonsuz olur; DAX\'taki DIVIDE boş döndürür, pandas inf verir. Gerçek raporda bunu <code>replace([np.inf], np.nan)</code> ile ele al. '
        'Sıralamadan önce yuvarlamak eşitlik yaratabilir; burada büyüme yuvarlanıp sıralanıyor, eşitlik yok.',
    tags=['SAMEPERIODLASTYEAR', 'pivot_table', 'büyüme'], min=8)

add(id='b-455', lv='orta', diff=2, kind='rehberli', needs=['pandas'], title='Hedef gerçekleşme oranı',
    q='<p><b>Satış direktörü soruyor:</b> "Bu yıl her kategori hedefinin yüzde kaçını gerçekleştirdi?"</p>'
      '<p><code>Hedefler</code> tablosunda her ay (<code>Tarih</code> ayın 1\'i) ve kategori için hedef var. <code>hedef_gerceklesme(satislar, urunler, hedefler, yil)</code> fonksiyonunu yaz. '
      + GECERSIZ_NOT + ' Dönüş: index <code>Kategori</code>; sütunlar <code>gercek</code>, <code>hedef</code> (2 ondalık) ve <code>oran</code> (gercek / hedef × 100, 1 ondalık); <code>oran</code>\'a göre azalan.</p>',
    guide=['Satışlara kategoriyi ekle (merge), geçerli satırları ve yılı süz; kategori başına <code>Tutar</code> topla.',
           'Hedeflerde yılı süz (<code>Tarih.str[:4]</code>) ve kategori başına topla.',
           'İki Series\'i tek DataFrame\'de birleştir (<code>pd.concat(..., axis=1)</code> ya da <code>pd.DataFrame({...})</code>).',
           'Oranı hesapla, yuvarla, sırala.'],
    example='''
import pandas as pd
# Benzer teknik: iki ayrı toplamı aynı anahtar üzerinde yan yana koymak
gercek = pd.Series({"Kuzey": 90, "Güney": 120})
hedef = pd.Series({"Kuzey": 100, "Güney": 100})
df = pd.DataFrame({"gercek": gercek, "hedef": hedef})
df["oran"] = (df["gercek"] / df["hedef"] * 100).round(1)
print(df.sort_values("oran", ascending=False))
''',
    start='''
import veri
import pandas as pd

satislar = veri.oku("kesit_bi", "Satislar")
urunler = veri.oku("kesit_bi", "Urunler")
hedefler = veri.oku("kesit_bi", "Hedefler")


def hedef_gerceklesme(satislar, urunler, hedefler, yil):
    df = satislar[~satislar["Durum"].isin(["İptal", "İade"])].merge(urunler[["UrunNo", "Kategori"]], on="UrunNo")
    # TODO 1: yılı süz, kategori başına gerçekleşen
    # TODO 2: hedefleri yıla göre süz, kategori başına topla
    # TODO 3: tek tabloda birleştir, oranı hesapla, sırala
    return None
''',
    sol='''
import veri
import pandas as pd

satislar = veri.oku("kesit_bi", "Satislar")
urunler = veri.oku("kesit_bi", "Urunler")
hedefler = veri.oku("kesit_bi", "Hedefler")


def hedef_gerceklesme(satislar, urunler, hedefler, yil):
    df = satislar[~satislar["Durum"].isin(["İptal", "İade"])].merge(urunler[["UrunNo", "Kategori"]], on="UrunNo")
    gercek = df[df["Tarih"].str[:4] == str(yil)].groupby("Kategori")["Tutar"].sum()
    hedef = hedefler[hedefler["Tarih"].str[:4] == str(yil)].groupby("Kategori")["Hedef"].sum()
    sonuc = pd.DataFrame({"gercek": gercek, "hedef": hedef}).fillna(0)
    sonuc["oran"] = (sonuc["gercek"] / sonuc["hedef"] * 100).round(1)
    sonuc[["gercek", "hedef"]] = sonuc[["gercek", "hedef"]].round(2)
    return sonuc.sort_values("oran", ascending=False)


print(hedef_gerceklesme(satislar, urunler, hedefler, 2024))
''',
    calc={'O': 'hedef_gerceklesme(satislar, urunler, hedefler, 2024)["oran"].to_dict()',
          'ILK': 'hedef_gerceklesme(satislar, urunler, hedefler, 2024).index[0]',
          'H': 'float(hedef_gerceklesme(satislar, urunler, hedefler, 2024).loc["Elektronik", "hedef"])'},
    tests='''
r = hedef_gerceklesme(satislar, urunler, hedefler, 2024)
assert r is not None and list(r.columns) == ["gercek", "hedef", "oran"], "Sütunlar: gercek, hedef, oran"
assert len(r) == 7, "7 kategori olmalı"
assert r.index[0] == @ILK@, "Gerçekleşme oranı en yüksek kategori en üstte"
assert r.loc["Elektronik", "hedef"] == @H@, "Elektronik 2024 hedefi (12 ayın toplamı) tutmuyor"
for k, v in @O@.items():
    assert abs(r.loc[k, "oran"] - v) < 0.06, f"{k} gerçekleşme oranı %{v} olmalı"
''',
    hints=['Gerçekleşen ve hedef ayrı tablolardan gelir; ikisini de kategori düzeyine indir.',
           '<code>pd.DataFrame({"gercek": gercek, "hedef": hedef})</code> iki Series\'i index üzerinden hizalar.',
           'oran = gercek / hedef * 100'],
    why='Hedef ve gerçekleşen farklı ayrıntı düzeyindedir (hedef ay×kategori, satış satır düzeyinde). İkisini ortak düzeye (yıl×kategori) indirip öyle birleştirmek gerekir; '
        'Power BI\'da bunu ortak boyut tabloları (Tarih, Kategoriler) ilişkisiyle yaparsın. Series\'ler DataFrame\'e konurken index\'e göre hizalanır; '
        'birinde olmayan kategori NaN olur, <code>fillna(0)</code> bunu yakalar.',
    tags=['hedef', 'hizalama', 'groupby'], min=8)

add(id='b-456', lv='orta', diff=2, kind='yaz', needs=['sqlite3'], title='Bölgelerin satış payı (SQL)',
    q='<p><b>Bölge müdürleri toplantısı için:</b> "Net satışın bölgelere dağılımı ne? Toplam içindeki payımızı görelim."</p>'
      '<p><code>con = veri.baglan("kesit_bi", tablolar=["Satislar", "Musteriler"])</code>. <code>bolge_payi(con)</code> fonksiyonunu yaz: '
      '<code>(Bolge, net_satis, pay_yuzde)</code> demetleri; net satış 2, pay 1 ondalık; net satışa göre azalan. ' + GECERSIZ_NOT +
      ' Bölgesi boş müşterilerin satışları <code>"Bilinmiyor"</code> adıyla ayrı satırda görünsün (<code>COALESCE</code>). Payı tek sorguda, <code>SUM(...) OVER ()</code> pencere fonksiyonuyla hesapla (DAX\'taki <code>ALL()</code> fikri).</p>',
    start='''
import veri

con = veri.baglan("kesit_bi", tablolar=["Satislar", "Musteriler"])


def bolge_payi(con):
    pass
''',
    sol='''
import veri

con = veri.baglan("kesit_bi", tablolar=["Satislar", "Musteriler"])


def bolge_payi(con):
    sql = """
        WITH b AS (
            SELECT COALESCE(m.Bolge, 'Bilinmiyor') AS Bolge, SUM(s.Tutar) AS net
            FROM Satislar AS s
            JOIN Musteriler AS m ON m.MusteriNo = s.MusteriNo
            WHERE s.Durum NOT IN ('İptal', 'İade')
            GROUP BY 1
        )
        SELECT Bolge, ROUND(net, 2), ROUND(100.0 * net / SUM(net) OVER (), 1)
        FROM b
        ORDER BY net DESC
    """
    return con.execute(sql).fetchall()


for satir in bolge_payi(con):
    print(satir)
''',
    calc={'R': 'bolge_payi(con)'},
    tests='''
r = bolge_payi(con)
assert len(r) == 7, "6 bölge + Bilinmiyor = 7 satır"
assert "Bilinmiyor" in [x[0] for x in r] and None not in [x[0] for x in r], "Boş bölge None değil Bilinmiyor adıyla görünmeli (COALESCE)"
assert r == @R@, "Bölge satışları ya da payları tutmuyor"
assert abs(sum(x[2] for x in r) - 100) < 0.5, "Paylar toplamı ~100"
assert "OVER" in __source__.upper(), "Payı SUM(...) OVER () pencere fonksiyonuyla hesapla"
''',
    hints=['Önce bölge toplamlarını bir CTE\'de hesapla; boş bölge için <code>COALESCE(m.Bolge, \'Bilinmiyor\')</code>.', '<code>SUM(net) OVER ()</code> tüm satırların toplamını her satıra yazar.',
           '<code>100.0 * net / SUM(net) OVER ()</code>; 100.0 yazmak tam sayı bölmesini önler.'],
    why='Boş <code>OVER ()</code> penceresi tüm sonucu tek grup sayar; böylece genel toplamı ayrı bir sorgu ya da alt sorgu olmadan her satıra getirirsin. '
        'Bu, DAX\'taki <code>DIVIDE([Net Satış], CALCULATE([Net Satış], ALL(Musteriler[Bolge])))</code> kalıbının SQL karşılığıdır. '
        'SQLite\'ta iki tam sayının bölümü tam sayıdır; <code>100.0</code> ile çarpmak ondalıklı sonucu garanti eder. Boş bölgeyi atmak payları şişirir; '
        '"Bilinmiyor" satırı veri kalitesi sorununu da görünür kılar.',
    tags=['OVER ()', 'pay', 'CTE'], min=7)

add(id='b-457', lv='orta', diff=2, kind='bug', needs=['pandas'], title='SLA uyumu sıfır çıkıyor',
    q='<p><b>Müşteri hizmetleri müdürü soruyor:</b> "Önceliğe göre ilk yanıt SLA\'sına uyum oranımız ne?" SLA: <b>Yüksek</b> 30 dk, <b>Orta</b> 120 dk, <b>Düşük</b> 240 dk içinde ilk yanıt.</p>'
      '<p><code>sla_uyumu(talepler)</code> (<code>veri.oku("kesit_bi", "Talepler")</code>), öncelik başına <code>IlkYanitDk &lt;= SLA</code> olan taleplerin yüzdesini (1 ondalık) bir Series olarak döndürmeli. '
      'Kod iki önceliği hep 0 gösteriyor. <b>Hatayı bul ve düzelt.</b></p>',
    start='''
import veri
import pandas as pd

talepler = veri.oku("kesit_bi", "Talepler")
SLA = {"Yuksek": 30, "Orta": 120, "Dusuk": 240}


def sla_uyumu(talepler):
    sinir = talepler["Oncelik"].map(SLA)
    uydu = talepler["IlkYanitDk"] <= sinir
    return (uydu.groupby(talepler["Oncelik"]).mean() * 100).round(1)
''',
    sol='''
import veri
import pandas as pd

talepler = veri.oku("kesit_bi", "Talepler")
SLA = {"Yüksek": 30, "Orta": 120, "Düşük": 240}


def sla_uyumu(talepler):
    sinir = talepler["Oncelik"].map(SLA)
    uydu = talepler["IlkYanitDk"] <= sinir
    return (uydu.groupby(talepler["Oncelik"]).mean() * 100).round(1)


print(sla_uyumu(talepler))
''',
    calc={'R': 'sla_uyumu(talepler).to_dict()'},
    tests='''
r = sla_uyumu(talepler)
for k, v in @R@.items():
    assert abs(r[k] - v) < 0.06, f"{k} önceliğinde SLA uyumu %{v} olmalı"
assert r["Yüksek"] > 0 and r["Düşük"] > 0, "Yüksek ve Düşük öncelikte uyum 0 olmamalı: sözlük anahtarları veriyle birebir aynı mı?"
''',
    hints=['<code>talepler["Oncelik"].unique()</code> ile verideki değerleri yazdır ve sözlük anahtarlarıyla karşılaştır.',
           '<code>map</code> eşleşmeyen anahtar için NaN döndürür; <code>x &lt;= NaN</code> her zaman False\'tur.', 'Anahtarları Türkçe karakterle yaz: <code>"Yüksek"</code>, <code>"Düşük"</code>.'],
    why='<code>Series.map(sozluk)</code> bulamadığı değeri sessizce NaN yapar, hata vermez; NaN ile her karşılaştırma False olduğu için oran 0 çıkar. '
        'Türkçe karakterlerin ASCII karşılıklarıyla (ü→u, ş→s) yazılması bu tür sessiz hataların en sık nedenidir. Savunma: map\'ten sonra '
        '<code>assert sinir.notna().all()</code> ya da <code>set(df.Oncelik) - set(SLA)</code> ile eşleşmeyenleri raporlamak.',
    tags=['map', 'NaN', 'Türkçe karakter', 'SLA'], min=5)

add(id='b-458', lv='orta', diff=2, kind='tamamla', needs=['pandas'], title='En çok satan N ürün (TOPN)',
    q='<p><b>Vitrin ekibi soruyor:</b> "Panodaki <i>İlk N ürün</i> görseli için listeyi doğrula: net satışa göre ilk 5 ürün hangileri?"</p>'
      '<p><code>ilk_n_urun(satislar, urunler, n=5)</code> fonksiyonundaki <code>___</code> boşluklarını doldur. ' + GECERSIZ_NOT + ' Dönüş: ürün adlarının listesi.</p>',
    start='''
import veri
import pandas as pd

satislar = veri.oku("kesit_bi", "Satislar")
urunler = veri.oku("kesit_bi", "Urunler")


def ilk_n_urun(satislar, urunler, n=5):
    gecerli = satislar[~satislar["Durum"].___(["İptal", "İade"])]
    df = gecerli.___(urunler[["UrunNo", "Urun"]], on="UrunNo")
    return df.groupby("Urun")["Tutar"].sum().___(n).index.tolist()
''',
    sol='''
import veri
import pandas as pd

satislar = veri.oku("kesit_bi", "Satislar")
urunler = veri.oku("kesit_bi", "Urunler")


def ilk_n_urun(satislar, urunler, n=5):
    gecerli = satislar[~satislar["Durum"].isin(["İptal", "İade"])]
    df = gecerli.merge(urunler[["UrunNo", "Urun"]], on="UrunNo")
    return df.groupby("Urun")["Tutar"].sum().nlargest(n).index.tolist()


print(ilk_n_urun(satislar, urunler))
''',
    calc={'R': 'ilk_n_urun(satislar, urunler)', 'R3': 'ilk_n_urun(satislar, urunler, 3)'},
    tests='''
assert ilk_n_urun(satislar, urunler) == @R@, "İlk 5 ürün tutmuyor"
assert ilk_n_urun(satislar, urunler, 3) == @R3@, "n parametresi kullanılmalı"
''',
    hints=['Bir değerin listede olup olmadığını sütun bazında soran yöntem.', 'İki DataFrame\'i ortak sütunla birleştiren yöntem.', '<code>isin</code>, <code>merge</code>, <code>nlargest</code>'],
    why='<code>~df.col.isin([...])</code>, SQL\'deki NOT IN\'in karşılığıdır. <code>nlargest(n)</code>, DAX\'taki TOPN gibi en büyük n değeri getirir. '
        'Not: TOPN eşitlikte n\'den fazla satır döndürebilir; <code>nlargest</code> varsayılan olarak ilk görüleni tutar (<code>keep="all"</code> ile eşitleri de alırsın).',
    tags=['TOPN', 'nlargest', 'isin'], min=4)

# ---------------------------------------------------------------- İLERİ
add(id='b-459', lv='ileri', diff=3, kind='rehberli', needs=['pandas'], title='Kohort bazında müşteri başı birikimli gelir',
    q='<p><b>Büyüme ekibi soruyor:</b> "Hangi ayın müşterileri daha değerli? Her kohortun müşteri başına ilk 6 aydaki birikimli gelirini (LTV eğrisi) görmek istiyoruz."</p>'
      '<p>Modelde hazır sütunlar var: <code>Musteriler.KohortAy</code> (ilk sipariş ayı, <code>"2023-04"</code> gibi) ve <code>Satislar.KohortAyFarki</code> (satışın kohort ayından kaç ay sonra olduğu). '
      '<code>kohort_ltv(satislar, musteriler, ay=6)</code> fonksiyonunu yaz. ' + GECERSIZ_NOT + '</p>'
      '<ul><li>Satırlara müşterinin <code>KohortAy</code> değerini ekle; <code>KohortAyFarki &lt; ay</code> olanları tut.</li>'
      '<li>(KohortAy, KohortAyFarki) başına <code>Tutar</code> toplamı → pivot (eksik hücre 0).</li>'
      '<li>Satır boyunca birikimli topla, kohorttaki müşteri sayısına (<code>Musteriler</code>\'de o <code>KohortAy</code>\'a sahip müşteri sayısı) böl, tam sayıya yuvarla.</li></ul>'
      '<p>Dönüş: index <code>KohortAy</code>, sütunlar 0 … ay−1.</p>',
    guide=['<code>satislar</code>\'ı <code>musteriler[["MusteriNo", "KohortAy"]]</code> ile birleştir; geçerli satırları ve <code>KohortAyFarki &lt; ay</code> koşulunu süz.',
           '<code>pivot_table(index="KohortAy", columns="KohortAyFarki", values="Tutar", aggfunc="sum", fill_value=0)</code>',
           'Satır boyunca birikim: <code>cumsum(axis=1)</code>.', 'Kohort büyüklüğü: <code>musteriler["KohortAy"].value_counts()</code>; <code>div(..., axis=0)</code> ile böl, <code>round(0)</code>.'],
    example='''
import pandas as pd
# Benzer teknik: satır boyunca birikim ve satır bazında bölme
t = pd.DataFrame({0: [100, 50], 1: [20, 0], 2: [30, 10]}, index=["Ocak", "Şubat"])
boyut = pd.Series({"Ocak": 2, "Şubat": 1})
print(t.cumsum(axis=1).div(boyut, axis=0))
''',
    start='''
import veri
import pandas as pd

satislar = veri.oku("kesit_bi", "Satislar")
musteriler = veri.oku("kesit_bi", "Musteriler")


def kohort_ltv(satislar, musteriler, ay=6):
    df = satislar[~satislar["Durum"].isin(["İptal", "İade"])].merge(musteriler[["MusteriNo", "KohortAy"]], on="MusteriNo")
    df = df[df["KohortAyFarki"] < ay]
    # TODO 1: KohortAy × KohortAyFarki pivot (Tutar toplamı, boşlar 0)
    # TODO 2: satır boyunca birikimli toplam
    # TODO 3: kohort müşteri sayısına böl, tam sayıya yuvarla
    return None
''',
    sol='''
import veri
import pandas as pd

satislar = veri.oku("kesit_bi", "Satislar")
musteriler = veri.oku("kesit_bi", "Musteriler")


def kohort_ltv(satislar, musteriler, ay=6):
    df = satislar[~satislar["Durum"].isin(["İptal", "İade"])].merge(musteriler[["MusteriNo", "KohortAy"]], on="MusteriNo")
    df = df[df["KohortAyFarki"] < ay]
    p = df.pivot_table(index="KohortAy", columns="KohortAyFarki", values="Tutar", aggfunc="sum", fill_value=0)
    boyut = musteriler["KohortAy"].value_counts()
    return p.cumsum(axis=1).div(boyut, axis=0).dropna(how="all").round(0)


print(kohort_ltv(satislar, musteriler).head(8))
''',
    calc={'SHAPE': 'kohort_ltv(satislar, musteriler).shape',
          'A': 'float(kohort_ltv(satislar, musteriler).loc["2023-04", 5])',
          'B': 'float(kohort_ltv(satislar, musteriler).loc["2024-01", 0])',
          'ORT': 'round(float(kohort_ltv(satislar, musteriler)[5].mean()), 0)',
          'S3': 'kohort_ltv(satislar, musteriler, 3).shape'},
    tests='''
t = kohort_ltv(satislar, musteriler)
assert t is not None, "DataFrame döndürmeli"
assert t.shape == @SHAPE@, "Boyut tutmuyor: kohort sayısı × 6 ay"
assert t.loc["2023-04", 5] == @A@, "2023-04 kohortunun 6. ay sonu LTV\\'si tutmuyor"
assert t.loc["2024-01", 0] == @B@, "2024-01 kohortunun ilk ay gelir/müşteri değeri tutmuyor"
assert (t.diff(axis=1).iloc[:, 1:] >= 0).all().all(), "Birikimli değer aylar ilerledikçe azalamaz"
assert abs(t[5].mean() - @ORT@) < 1, "Kohortların ortalama 6 ay LTV\\'si tutmuyor"
assert kohort_ltv(satislar, musteriler, 3).shape == @S3@, "ay parametresi sütun sayısını belirlemeli"
''',
    hints=['Pivot: satırda kohort, sütunda ay farkı.', 'Birikim satır boyunca: <code>cumsum(axis=1)</code>.',
           '<code>p.cumsum(axis=1).div(musteriler["KohortAy"].value_counts(), axis=0)</code> ve fazladan gelen boş satırlar için <code>dropna(how="all")</code>.'],
    why='LTV eğrisi kohortları "müşteri başına ne kadar kazandırdı" diye karşılaştırır; tutma oranından farklı olarak harcama büyüklüğünü de yansıtır. '
        'Payda kohortun <b>tüm</b> müşterileridir (o ay alışveriş yapanlar değil); bu yüzden müşteri tablosundan sayılır. <code>div(..., axis=0)</code> index üzerinden hizalar; '
        'paydada olup pivotta olmayan kohortlar NaN satır üretir, <code>dropna(how="all")</code> onları temizler. Genç kohortlarda son sütunlar henüz yaşanmamış aylardır; '
        'yorumlarken bunu ayırt et.',
    tags=['kohort', 'LTV', 'cumsum axis=1', 'pivot_table'], min=12)

add(id='b-460', lv='ileri', diff=3, kind='yaz', needs=['pandas'], title='RFM skorları ve Şampiyonlar',
    q='<p><b>CRM ekibi soruyor:</b> "Panodaki RFM segmentlerini Python\'la üretelim; önce <i>Şampiyon</i> müşterilerimiz kim?"</p>'
      '<p><code>rfm(satislar, ref="2025-01-01")</code> fonksiyonunu yaz. ' + GECERSIZ_NOT + ' Müşteri (<code>MusteriNo</code>) başına:</p>'
      '<ul><li><code>R</code>: ref − son satış tarihi (gün)</li><li><code>F</code>: farklı sipariş sayısı (<code>SiparisNo</code>)</li><li><code>M</code>: <code>Tutar</code> toplamı (2 ondalık)</li>'
      '<li>Skorlar 1–5: <code>pd.qcut(x.rank(method="first"), 5, labels=[1, 2, 3, 4, 5]).astype(int)</code>; <b>R için ters</b> (en yakın tarih 5 alır, yani <code>labels=[5, 4, 3, 2, 1]</code>)</li>'
      '<li><code>segment</code>: R_skor ≥ 4, F_skor ≥ 4 ve M_skor ≥ 4 ise <code>"Şampiyon"</code>, değilse <code>"Diğer"</code></li></ul>'
      '<p>Dönüş: <code>MusteriNo</code> indeksli, sütunları <code>R, F, M, R_skor, F_skor, M_skor, segment</code> olan DataFrame.</p>',
    start='''
import veri
import pandas as pd

satislar = veri.oku("kesit_bi", "Satislar")


def rfm(satislar, ref="2025-01-01"):
    pass
''',
    sol='''
import veri
import pandas as pd

satislar = veri.oku("kesit_bi", "Satislar")


def rfm(satislar, ref="2025-01-01"):
    df = satislar[~satislar["Durum"].isin(["İptal", "İade"])].copy()
    df["Tarih"] = pd.to_datetime(df["Tarih"])
    g = df.groupby("MusteriNo").agg(son=("Tarih", "max"), F=("SiparisNo", "nunique"), M=("Tutar", "sum"))
    g["R"] = (pd.Timestamp(ref) - g["son"]).dt.days
    g["M"] = g["M"].round(2)
    g["R_skor"] = pd.qcut(g["R"].rank(method="first"), 5, labels=[5, 4, 3, 2, 1]).astype(int)
    g["F_skor"] = pd.qcut(g["F"].rank(method="first"), 5, labels=[1, 2, 3, 4, 5]).astype(int)
    g["M_skor"] = pd.qcut(g["M"].rank(method="first"), 5, labels=[1, 2, 3, 4, 5]).astype(int)
    sampiyon = (g["R_skor"] >= 4) & (g["F_skor"] >= 4) & (g["M_skor"] >= 4)
    g["segment"] = sampiyon.map({True: "Şampiyon", False: "Diğer"})
    return g[["R", "F", "M", "R_skor", "F_skor", "M_skor", "segment"]]


r = rfm(satislar)
print(r["segment"].value_counts())
print(r[r["segment"] == "Şampiyon"].sort_values("M", ascending=False).head())
''',
    calc={'N': 'len(rfm(satislar))', 'NS': 'int((rfm(satislar)["segment"] == "Şampiyon").sum())',
          'C1': 'rfm(satislar).loc[1, ["R", "F", "M"]].tolist()',
          'TOP': 'rfm(satislar).query("segment == \'Şampiyon\'").sort_values("M", ascending=False).index[:3].tolist()'},
    tests='''
r = rfm(satislar)
assert list(r.columns) == ["R", "F", "M", "R_skor", "F_skor", "M_skor", "segment"], "Sütun adları ve sırası şartnameye uymalı"
assert len(r) == @N@, "Geçerli satışı olan her müşteri bir satır olmalı"
assert r.loc[1, ["R", "F", "M"]].tolist() == @C1@, "1 numaralı müşterinin R, F, M değerleri tutmuyor"
assert set(r["R_skor"]) == {1, 2, 3, 4, 5}, "Skorlar 1–5 arası tam sayı"
assert r.loc[r["R"].idxmin(), "R_skor"] == 5, "En yakın tarihte alışveriş yapan R_skor = 5 almalı (ters ölçek)"
assert (r["segment"] == "Şampiyon").sum() == @NS@, "Şampiyon sayısı tutmuyor"
assert r.query("segment == \\"Şampiyon\\"").sort_values("M", ascending=False).index[:3].tolist() == @TOP@, "En değerli 3 şampiyon tutmuyor"
''',
    hints=['Tek <code>groupby(...).agg(son=("Tarih", "max"), F=("SiparisNo", "nunique"), M=("Tutar", "sum"))</code> ile üç ölçüyü birden çıkar.',
           '<code>rank(method="first")</code> eşit değerlere farklı sıra verir; böylece qcut "eşit kenar" hatası vermez.',
           'R küçükse iyi: <code>labels=[5, 4, 3, 2, 1]</code>; F ve M büyükse iyi: <code>labels=[1, 2, 3, 4, 5]</code>.'],
    why='RFM, müşteriyi üç davranış boyutunda beşe böler. <code>qcut</code> eşit sayıda müşteri içeren dilimler üretir; çok sayıda eşit F değeri (ör. tek siparişliler) olduğunda '
        'dilim kenarları çakışır ve hata verir, <code>rank(method="first")</code> bu yüzden kullanılır. Recency ölçeği terstir: az gün iyi demektir. '
        'Gerçek projelerde segment kuralları RFMSegmentleri tablosundaki gibi daha ayrıntılıdır (Sadık, Risk altında, Kayıp...).',
    tags=['RFM', 'qcut', 'rank', 'agg'], min=14)

add(id='b-461', lv='ileri', diff=3, kind='rehberli', needs=['pandas'], title='Sepet analizi: destek, güven ve lift',
    q='<p><b>Çapraz satış ekibi soruyor:</b> "Hangi ürün çiftleri tesadüften daha sık birlikte alınıyor? <i>Lift</i> değerine göre sıralayalım."</p>'
      '<p><code>sepet_kurallari(satislar, urunler, min_birlikte=4)</code> fonksiyonunu yaz. Sepet = bir <code>SiparisNo</code>\'daki farklı ürün adları (tüm durumlar dahil, sepet davranışı ölçülüyor). '
      'Her (A, B) ürün çifti için (A &lt; B alfabetik):</p>'
      '<ul><li><code>birlikte</code>: ikisini birlikte içeren sepet sayısı</li><li><code>destek</code> = birlikte / toplam sepet</li>'
      '<li><code>guven</code> = birlikte / A\'yı içeren sepet sayısı</li><li><code>lift</code> = destek / (P(A) × P(B)); P(X) = X\'i içeren sepet / toplam sepet</li></ul>'
      '<p><code>birlikte &gt;= min_birlikte</code> olan çiftleri döndür. Sütunlar: <code>A, B, birlikte, destek, guven, lift</code> (oranlar 4 ondalık); <code>lift</code> azalan, eşitlikte A, B artan; index 0\'dan.</p>',
    guide=['Kalemlere ürün adını ekle; <code>groupby("SiparisNo")["Urun"]</code> ile sepet başına ad kümesi çıkar (<code>lambda s: sorted(set(s))</code>).',
           'Toplam sepet sayısını ve her ürünün geçtiği sepet sayısını say.',
           '<code>itertools.combinations(sepet, 2)</code> ile çiftleri <code>Counter</code>\'da say.',
           'Eşiği geçen çiftler için destek, güven, lift hesapla; DataFrame kur, sırala.'],
    example='''
from itertools import combinations
from collections import Counter
# Benzer teknik: çift sayımı ve lift (küçük örnek)
sepetler = [{"çay", "şeker"}, {"çay", "simit"}, {"çay", "şeker", "simit"}, {"su"}]
n = len(sepetler)
tek = Counter(u for s in sepetler for u in s)
cift = Counter(c for s in sepetler for c in combinations(sorted(s), 2))
for (a, b), k in cift.items():
    print(a, b, round((k / n) / ((tek[a] / n) * (tek[b] / n)), 2))
''',
    start='''
import veri
import pandas as pd
from collections import Counter
from itertools import combinations

satislar = veri.oku("kesit_bi", "Satislar")
urunler = veri.oku("kesit_bi", "Urunler")


def sepet_kurallari(satislar, urunler, min_birlikte=4):
    df = satislar.merge(urunler[["UrunNo", "Urun"]], on="UrunNo")
    sepetler = df.groupby("SiparisNo")["Urun"].apply(lambda s: sorted(set(s))).tolist()
    n = len(sepetler)
    # TODO 1: tekil ürün sayımı (her ürün kaç sepette)
    # TODO 2: çift sayımı (combinations)
    # TODO 3: eşiği geçen çiftler için destek, guven, lift satırları
    # TODO 4: DataFrame, sıralama, reset_index
    return None
''',
    sol='''
import veri
import pandas as pd
from collections import Counter
from itertools import combinations

satislar = veri.oku("kesit_bi", "Satislar")
urunler = veri.oku("kesit_bi", "Urunler")


def sepet_kurallari(satislar, urunler, min_birlikte=4):
    df = satislar.merge(urunler[["UrunNo", "Urun"]], on="UrunNo")
    sepetler = df.groupby("SiparisNo")["Urun"].apply(lambda s: sorted(set(s))).tolist()
    n = len(sepetler)
    tek = Counter(u for s in sepetler for u in s)
    cift = Counter(c for s in sepetler for c in combinations(s, 2))
    satirlar = []
    for (a, b), k in cift.items():
        if k < min_birlikte:
            continue
        destek = k / n
        satirlar.append({"A": a, "B": b, "birlikte": k, "destek": round(destek, 4),
                         "guven": round(k / tek[a], 4),
                         "lift": round(destek / ((tek[a] / n) * (tek[b] / n)), 4)})
    sonuc = pd.DataFrame(satirlar, columns=["A", "B", "birlikte", "destek", "guven", "lift"])
    return sonuc.sort_values(["lift", "A", "B"], ascending=[False, True, True]).reset_index(drop=True)


print(sepet_kurallari(satislar, urunler).head())
''',
    calc={'N': 'len(sepet_kurallari(satislar, urunler))', 'ILK': '[x.item() if hasattr(x, "item") else x for x in sepet_kurallari(satislar, urunler).iloc[0].tolist()]',
          'N6': 'len(sepet_kurallari(satislar, urunler, 6))'},
    tests='''
r = sepet_kurallari(satislar, urunler)
assert r is not None and list(r.columns) == ["A", "B", "birlikte", "destek", "guven", "lift"], "Sütunlar: A, B, birlikte, destek, guven, lift"
assert len(r) == @N@, "Eşiği (4) geçen çift sayısı tutmuyor"
assert r.iloc[0].tolist() == @ILK@, "Lift\\'i en yüksek kural tutmuyor"
assert (r["A"] < r["B"]).all(), "Çiftlerde A, B\\'den alfabetik olarak önce gelmeli"
assert r["lift"].is_monotonic_decreasing, "lift azalan sırada olmalı"
assert len(sepet_kurallari(satislar, urunler, 6)) == @N6@, "min_birlikte parametresi kullanılmalı"
''',
    hints=['Sepetleri sıralı liste yaparsan <code>combinations</code> çiftleri hep aynı (alfabetik) sırada üretir.',
           '<code>tek = Counter(u for s in sepetler for u in s)</code>, <code>cift = Counter(c for s in sepetler for c in combinations(s, 2))</code>',
           'lift = (k / n) / ((tek[a] / n) * (tek[b] / n))'],
    why='Destek ne kadar yaygın, güven "A alan B\'yi de alır mı", lift ise birlikteliğin tesadüfe göre kaç kat olduğunu söyler (lift = 1 bağımsızlık). '
        'Çok popüler ürünlerin güveni yüksek çıkar ama lift onları düzeltir. Az gözlemli çiftlerde lift çok oynak olduğu için <code>min_birlikte</code> eşiği şarttır. '
        'Büyük veride bu iş Apriori/FP-Growth algoritmalarıyla (ör. mlxtend kütüphanesi) yapılır; mantık aynıdır.',
    tags=['sepet analizi', 'lift', 'combinations', 'Counter'], min=14)

add(id='b-462', lv='ileri', diff=3, kind='yaz', needs=['pandas'], title='3 aylık hareketli ortalama (eksik aylar dahil)',
    q='<p><b>Planlama ekibi soruyor:</b> "Mevsim dalgalanmasını yumuşatmak için net satışın 3 aylık hareketli ortalamasını görelim."</p>'
      '<p>DAX\'ta <code>AVERAGEX(DATESINPERIOD(Tarih[Tarih], MAX(Tarih[Tarih]), -3, MONTH), [Net Satış])</code> benzeri bir ölçü. '
      '<code>hareketli_ortalama(satislar, pencere=3)</code> fonksiyonunu yaz. ' + GECERSIZ_NOT +
      ' Aylık net satışı hesapla; <b>ilk satış ayından son satış ayına kadar her ay</b> bulunsun (satışı olmayan ay 0). '
      'Sonra <code>rolling(pencere)</code> ortalaması al (ilk <code>pencere−1</code> ay NaN). Dönüş: index <code>Period</code> (aylık), 2 ondalıklı Series.</p>',
    start='''
import veri
import pandas as pd

satislar = veri.oku("kesit_bi", "Satislar")


def hareketli_ortalama(satislar, pencere=3):
    pass
''',
    sol='''
import veri
import pandas as pd

satislar = veri.oku("kesit_bi", "Satislar")


def hareketli_ortalama(satislar, pencere=3):
    df = satislar[~satislar["Durum"].isin(["İptal", "İade"])].copy()
    df["ay"] = pd.to_datetime(df["Tarih"]).dt.to_period("M")
    aylik = df.groupby("ay")["Tutar"].sum()
    tum = pd.period_range(aylik.index.min(), aylik.index.max(), freq="M")
    aylik = aylik.reindex(tum, fill_value=0)
    return aylik.rolling(pencere).mean().round(2)


print(hareketli_ortalama(satislar).tail())
''',
    calc={'N': 'len(hareketli_ortalama(satislar))', 'S': 'float(hareketli_ortalama(satislar).iloc[-1])',
          'M': 'float(hareketli_ortalama(satislar).loc[pd.Period("2023-06", "M")])',
          'P6': 'float(hareketli_ortalama(satislar, 6).iloc[-1])'},
    tests='''
r = hareketli_ortalama(satislar)
assert len(r) == @N@, "İlk ve son ay arasındaki TÜM aylar olmalı"
assert r.iloc[:2].isna().all() and not pd.isna(r.iloc[2]), "pencere=3 için ilk 2 değer NaN, üçüncüsü dolu"
assert r.iloc[-1] == @S@, "Son ayın 3 aylık ortalaması tutmuyor"
assert r.loc[pd.Period("2023-06", "M")] == @M@, "2023-06 değeri tutmuyor"
assert hareketli_ortalama(satislar, 6).iloc[-1] == @P6@, "pencere parametresi kullanılmalı"
k = pd.DataFrame({"Tarih": ["2024-01-10", "2024-03-05", "2024-04-01"], "Durum": ["Kargoda"] * 3, "Tutar": [30.0, 60.0, 90.0]})
rk = hareketli_ortalama(k)
assert len(rk) == 4 and rk.iloc[2] == 30.0 and rk.iloc[3] == 50.0, "Satışsız Şubat 0 sayılmalı: (30+0+60)/3 = 30, (0+60+90)/3 = 50"
''',
    hints=['Satışsız aylar groupby sonucunda hiç görünmez; <code>rolling</code> satır sayar, ay saymaz.',
           '<code>pd.period_range(ilk, son, freq="M")</code> ile tam ay listesi kur, <code>reindex(..., fill_value=0)</code>.',
           '<code>aylik.rolling(pencere).mean().round(2)</code>'],
    why='<code>rolling(3)</code> son 3 <b>satırın</b> ortalamasını alır; aralarda eksik ay varsa pencere aslında 4–5 aya yayılır ve sonuç sessizce yanlış olur. '
        'Power BI\'da Tarih tablosu bu boşlukları kendiliğinden doldurur; pandas\'ta bunu <code>reindex</code> ile senin yapman gerekir. '
        'Alternatif: DatetimeIndex ile <code>resample("MS").sum()</code> boş ayları 0 ile üretir. Satışsız ayı 0 mı NaN mı sayacağın bir iş kararıdır; burada 0.',
    tags=['rolling', 'reindex', 'period_range', 'zaman serisi'], min=10)

add(id='b-463', lv='ileri', diff=3, kind='yaz', needs=['sqlite3'], title='Geçen yılın aynı ayı (SQL LAG)',
    q='<p><b>Yönetim kurulu raporu için:</b> "2024\'ün her ayını geçen yılın aynı ayıyla karşılaştır."</p>'
      '<p><code>con = veri.baglan("kesit_bi", tablolar=["Satislar"])</code>. <code>yoy_aylik(con, yil)</code> fonksiyonunu yaz. ' + GECERSIZ_NOT +
      ' SQL\'de önce (yıl, ay) bazında net satışı bul, sonra <code>LAG(...) OVER (PARTITION BY ay ORDER BY yil)</code> ile geçen yılın aynı ayını getir. '
      'Python\'da istenen yılı süz. Dönüş: <code>(ay, bu_yil, gecen_yil, degisim_yuzde)</code> demetleri; ay tam sayı (1–12), tutarlar 2, değişim 1 ondalık; geçen yıl yoksa <code>gecen_yil</code> ve değişim <code>None</code>.</p>',
    start='''
import veri

con = veri.baglan("kesit_bi", tablolar=["Satislar"])


def yoy_aylik(con, yil):
    pass
''',
    sol='''
import veri

con = veri.baglan("kesit_bi", tablolar=["Satislar"])


def yoy_aylik(con, yil):
    sql = """
        WITH a AS (
            SELECT CAST(substr(Tarih, 1, 4) AS INTEGER) AS yil,
                   CAST(substr(Tarih, 6, 2) AS INTEGER) AS ay,
                   SUM(Tutar) AS net
            FROM Satislar
            WHERE Durum NOT IN ('İptal', 'İade')
            GROUP BY yil, ay
        )
        SELECT yil, ay, net, LAG(net) OVER (PARTITION BY ay ORDER BY yil) AS gy
        FROM a
        ORDER BY yil, ay
    """
    sonuc = []
    for y, ay, net, gy in con.execute(sql):
        if y != yil:
            continue
        degisim = round((net - gy) / gy * 100, 1) if gy else None
        sonuc.append((ay, round(net, 2), round(gy, 2) if gy is not None else None, degisim))
    return sonuc


for satir in yoy_aylik(con, 2024):
    print(satir)
''',
    calc={'R': 'yoy_aylik(con, 2024)', 'R23': 'yoy_aylik(con, 2023)[:2]', 'N22': 'len(yoy_aylik(con, 2022))'},
    tests='''
r = yoy_aylik(con, 2024)
assert len(r) == 12, "2024\\'ün 12 ayı"
assert r == @R@, "Aylık YoY tablosu tutmuyor: LAG ay bazında (PARTITION BY ay) ve yıla göre sıralı olmalı"
assert yoy_aylik(con, 2023)[:2] == @R23@, "2023 Ocak-Şubat: 2022\\'de bu aylarda satış yok → gecen_yil None"
assert len(yoy_aylik(con, 2022)) == @N22@, "2022 yalnız satış olan ayları içermeli"
assert "LAG" in __source__.upper(), "LAG pencere fonksiyonunu kullan"
''',
    hints=['Önce yıl-ay toplamını CTE\'de hesapla; ay ve yılı <code>substr</code> + <code>CAST</code> ile tam sayı yap.',
           '<code>LAG(net) OVER (PARTITION BY ay ORDER BY yil)</code>: aynı ayın bir önceki yılı.',
           'Pencere süzmeden ÖNCE hesaplanmalı; yılı WHERE\'de süzersen LAG geçen yılı göremez. Süzmeyi dış sorguda ya da Python\'da yap.'],
    why='Ay bazında bölümleyip (PARTITION BY ay) yıla göre sıralamak, LAG\'ı "geçen yılın aynı ayı"na çevirir; SAMEPERIODLASTYEAR\'ın SQL karşılığıdır. '
        'Kritik nokta: yılı aynı sorgunun WHERE\'inde süzersen pencere yalnız o yılı görür ve LAG hep NULL döner, çünkü WHERE pencere fonksiyonlarından önce çalışır. '
        'Geçen yıl verisi olmayan aylarda değişim tanımsızdır (None); 0 ya da sonsuz yazmak raporu yanıltır.',
    tags=['LAG', 'PARTITION BY', 'YoY', 'SAMEPERIODLASTYEAR'], min=12)

add(id='b-464', lv='ileri', diff=3, kind='rehberli', needs=['pandas'], title='Gider bütçe sapması',
    q='<p><b>Bütçe kontrol ekibi soruyor:</b> "Bu yıl hangi gider türü bütçeyi en çok aştı?"</p>'
      '<p><code>Giderler</code> tablosunda aynı ay ve gider türü için birden çok satır (departman bazında) olabilir; <code>GiderButce</code> ise ay × gider türü düzeyindedir. '
      '<code>butce_sapmasi(giderler, butce, yil)</code> fonksiyonunu yaz. Dönüş: index <code>GiderTuru</code>; sütunlar <code>gercek</code>, <code>butce</code>, <code>sapma</code> (gercek − butce), '
      '<code>sapma_yuzde</code> (sapma / butce × 100, 1 ondalık); tutarlar 2 ondalık; <code>sapma_yuzde</code>\'ye göre azalan.</p>',
    guide=['İki tabloyu da yıla göre süz (<code>Tarih.str[:4]</code>).', 'Gerçekleşeni önce gider türüne göre topla (departman satırlarını birleştir).',
           'Bütçeyi de gider türüne göre topla; iki Series\'i <code>pd.concat([...], axis=1, keys=[...])</code> ile birleştir.',
           'Sapma ve yüzdeyi hesapla, yuvarla, sırala.'],
    example='''
import pandas as pd
# Benzer teknik: farklı ayrıntı düzeyindeki iki tabloyu ortak düzeyde karşılaştırmak
fiili = pd.DataFrame({"tur": ["Kira", "Kira", "Enerji"], "tutar": [60, 50, 30]})
plan = pd.DataFrame({"tur": ["Kira", "Enerji"], "butce": [100, 40]})
t = pd.concat([fiili.groupby("tur")["tutar"].sum(), plan.groupby("tur")["butce"].sum()], axis=1, keys=["gercek", "butce"])
t["sapma"] = t["gercek"] - t["butce"]
print(t)
''',
    start='''
import veri
import pandas as pd

giderler = veri.oku("kesit_bi", "Giderler")
butce = veri.oku("kesit_bi", "GiderButce")


def butce_sapmasi(giderler, butce, yil):
    g = giderler[giderler["Tarih"].str[:4] == str(yil)]
    b = butce[butce["Tarih"].str[:4] == str(yil)]
    # TODO 1: gider türüne göre gerçekleşen ve bütçe toplamları
    # TODO 2: tek tabloda birleştir
    # TODO 3: sapma ve sapma_yuzde, yuvarla, sırala
    return None
''',
    sol='''
import veri
import pandas as pd

giderler = veri.oku("kesit_bi", "Giderler")
butce = veri.oku("kesit_bi", "GiderButce")


def butce_sapmasi(giderler, butce, yil):
    g = giderler[giderler["Tarih"].str[:4] == str(yil)]
    b = butce[butce["Tarih"].str[:4] == str(yil)]
    t = pd.concat([g.groupby("GiderTuru")["Tutar"].sum(), b.groupby("GiderTuru")["Butce"].sum()],
                  axis=1, keys=["gercek", "butce"])
    t["sapma"] = t["gercek"] - t["butce"]
    t["sapma_yuzde"] = (t["sapma"] / t["butce"] * 100).round(1)
    t[["gercek", "butce", "sapma"]] = t[["gercek", "butce", "sapma"]].round(2)
    return t.sort_values("sapma_yuzde", ascending=False)


print(butce_sapmasi(giderler, butce, 2024))
''',
    calc={'Y': 'butce_sapmasi(giderler, butce, 2024)["sapma_yuzde"].to_dict()', 'ILK': 'butce_sapmasi(giderler, butce, 2024).index[0]',
          'P': 'butce_sapmasi(giderler, butce, 2024).loc["Personel", ["gercek", "butce"]].tolist()',
          'Y23': 'float(butce_sapmasi(giderler, butce, 2023)["sapma"].sum().round(2))'},
    tests='''
r = butce_sapmasi(giderler, butce, 2024)
assert r is not None and list(r.columns) == ["gercek", "butce", "sapma", "sapma_yuzde"], "Sütunlar: gercek, butce, sapma, sapma_yuzde"
assert len(r) == 6, "6 gider türü"
assert r.index[0] == @ILK@, "Bütçeyi oransal olarak en çok aşan tür en üstte"
p = r.loc["Personel", ["gercek", "butce"]].tolist()
assert all(abs(x - y) < 0.01 for x, y in zip(p, @P@)), "Personel gerçekleşen/bütçe tutmuyor: departman satırlarını topladın mı?"
for k, v in @Y@.items():
    assert abs(r.loc[k, "sapma_yuzde"] - v) < 0.06, f"{k} sapma yüzdesi {v} olmalı"
assert abs(butce_sapmasi(giderler, butce, 2023)["sapma"].sum() - @Y23@) < 0.05, "yil parametresi kullanılmalı (2023)"
''',
    hints=['Önce iki tabloyu da aynı ayrıntı düzeyine (gider türü) indir.', '<code>pd.concat([s1, s2], axis=1, keys=["gercek", "butce"])</code>',
           'sapma_yuzde = sapma / butce * 100'],
    why='Gerçekleşen departman bazında, bütçe tür bazındadır; satır düzeyinde birleştirmek (merge) bütçeyi departman sayısı kadar çoğaltır ve sapmayı şişirir. '
        'Önce toplayıp sonra birleştirmek bu "çoğalma" hatasını önler. Power BI\'da bu, iki olgu tablosunu ortak boyutlar (Tarih, GiderTurleri) üzerinden ilişkilendirmekle olur. '
        'Mutlak sapma büyük kalemleri, yüzde sapma kontrol dışı kalemleri öne çıkarır; ikisini birlikte raporla.',
    tags=['bütçe', 'concat', 'ayrıntı düzeyi'], min=10)

add(id='b-465', lv='ileri', diff=3, kind='yaz', needs=['sqlite3'], title='Tedarikçi karnesi ve sıralama (RANK)',
    q='<p><b>Satın alma direktörü soruyor:</b> "Tedarikçilerimizi zamanında teslim oranına göre sırala; kusur oranını da yanına koy."</p>'
      '<p><code>con = veri.baglan("kesit_bi", tablolar=["SatinAlmalar", "Tedarikciler"])</code>. <code>tedarikci_karnesi(con)</code> fonksiyonunu yaz. Tedarikçi başına:</p>'
      '<ul><li><code>siparis</code>: satın alma sayısı</li><li><code>zamaninda</code>: <code>Zamaninda = \'Evet\'</code> oranı (%, 1 ondalık)</li>'
      '<li><code>kusur</code>: Σ<code>Kusurlu</code> / Σ<code>Adet</code> × 100 (%, 2 ondalık; <code>Kusurlu</code> kusurlu adet sayısıdır)</li>'
      '<li><code>sira</code>: <code>RANK() OVER (ORDER BY zamaninda DESC)</code></li></ul>'
      '<p>Dönüş: <code>(Tedarikci, siparis, zamaninda, kusur, sira)</code> demetleri; sıraya, eşitlikte tedarikçi adına göre.</p>',
    start='''
import veri

con = veri.baglan("kesit_bi", tablolar=["SatinAlmalar", "Tedarikciler"])


def tedarikci_karnesi(con):
    pass
''',
    sol='''
import veri

con = veri.baglan("kesit_bi", tablolar=["SatinAlmalar", "Tedarikciler"])


def tedarikci_karnesi(con):
    sql = """
        WITH k AS (
            SELECT t.Tedarikci,
                   COUNT(*) AS siparis,
                   ROUND(100.0 * SUM(CASE WHEN s.Zamaninda = 'Evet' THEN 1 ELSE 0 END) / COUNT(*), 1) AS zamaninda,
                   ROUND(100.0 * SUM(s.Kusurlu) / SUM(s.Adet), 2) AS kusur
            FROM SatinAlmalar AS s
            JOIN Tedarikciler AS t ON t.TedarikciNo = s.TedarikciNo
            GROUP BY t.Tedarikci
        )
        SELECT Tedarikci, siparis, zamaninda, kusur, RANK() OVER (ORDER BY zamaninda DESC) AS sira
        FROM k
        ORDER BY sira, Tedarikci
    """
    return con.execute(sql).fetchall()


for satir in tedarikci_karnesi(con):
    print(satir)
''',
    calc={'R': 'tedarikci_karnesi(con)'},
    tests='''
r = tedarikci_karnesi(con)
assert len(r) == 8, "8 tedarikçi"
assert r == @R@, "Karne tutmuyor: oranlar 100.0 ile çarpılarak mı hesaplandı, kusur adet bazında mı?"
assert r[0][4] == 1, "İlk satırın sırası 1"
assert "RANK" in __source__.upper(), "RANK pencere fonksiyonunu kullan"
''',
    hints=['Koşullu sayım: <code>SUM(CASE WHEN Zamaninda = \'Evet\' THEN 1 ELSE 0 END)</code>.',
           'Kusur oranı sipariş değil adet bazında: <code>SUM(Kusurlu) / SUM(Adet)</code>; tam sayı bölmesine dikkat (100.0).',
           'Özet CTE\'de, sıralama dış sorguda: <code>RANK() OVER (ORDER BY zamaninda DESC)</code>.'],
    why='RANK eşit değerlere aynı sırayı verir ve sonraki sırayı atlar (1, 2, 2, 4); DENSE_RANK atlamaz (1, 2, 2, 3); ROW_NUMBER hep farklı numara verir. '
        'Karnede eşit performansı eşit göstermek için RANK uygundur. Kusur oranını sipariş satırlarının oranlarının ortalaması olarak değil, toplam kusurlu / toplam adet olarak hesaplamak '
        'büyük siparişlere doğru ağırlığı verir. SQLite\'ta tam sayı bölmesi tam sayı döndürür; <code>100.0 *</code> bunu önler.',
    tags=['RANK', 'CASE WHEN', 'karne'], min=10)

if __name__ == '__main__':
    write('/home/claude/py/v3/d1/ds_kesit.js', 'PythonPatika — veri seti görevleri: Kesit BI / Power BI ölçüleri (b-449 … b-465)', T)
