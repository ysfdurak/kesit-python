import sys; sys.path.insert(0, '/tmp/claude-0/-home-claude/6c066959-3fcb-54bb-bdf1-c8ae148dfc4c/scratchpad/x2gen')
from x2lib import *
import os; os.environ['PP_VERI'] = '/home/claude/py/data'; sys.path.insert(0, '/home/claude/py/tools/pylib')
import veri, pandas as pd

H = []
H.append('<h2>Derinleş: Power BI ve Excel köprüsü</h2>')
H.append('<p>Çoğu kurumda Python tek başına rapor aracı değildir; sonuçlar Excel\'e ya da Power BI panolarına gider. Python\'un bu dünyaya üç kapısı var: Power BI içinde <b>Python betik kaynağı</b> ve <b>Python görseli</b>, Excel içinde <b>=PY</b> formülü ve en sağlamı, Python\'un temizleyip Power BI\'a hazır <b>yıldız şemalı dosyalar</b> (CSV/Parquet) üretmesi. Bu bölümde Kesit Power BI\'ın kullandığı <code>kesit_bi</code> modelini ve Kesit SQL\'nın <code>anadolu_market</code> tablolarını kullanacaksın; ikisi aynı kurgusal şirketin iki görünümü.</p>')
H.append('<h3>Power BI\'da Python: betik kaynağı ve görsel</h3>')
H.append('<p><b>Veri al → Diğer → Python betiği</b> ile yazdığın betik çalışır ve betik bittiğinde ad alanındaki <b>her pandas DataFrame</b> ayrı bir tablo olarak seçime sunulur. Power BI Desktop, bilgisayarındaki Python yorumlayıcısını kullanır (Seçenekler → Python betiği oluşturma); pandas ve matplotlib orada kurulu olmalıdır. <b>Python görseli</b> ise rapor sayfasında çalışır: seçtiğin alanlar <code>dataset</code> adlı DataFrame olarak gelir, sen matplotlib ile çizersin.</p>')
H.append(pc('''
# Power BI → Veri al → Python betiği
import pandas as pd
satis = pd.read_csv(r"C:\\veri\\kesit_bi\\Satislar.csv")
satis = satis[satis["Durum"] != "İptal"]          # yalnız DataFrame'ler tablo olur
ozet = satis.groupby("Kanal", as_index=False)["Tutar"].sum()

# Python görseli (rapor sayfasında): Power BI "dataset" DataFrame'ini verir
import matplotlib.pyplot as plt
dataset.groupby("Kategori")["Tutar"].sum().sort_values().plot.barh()
plt.show()
'''))
H.append('<div class="warn"><b>İki tuzak</b>1) Python görseline gelen <code>dataset</code> içinde <b>tekrarlanan satırlar silinir</b>; aynı ürün ve tutarlı iki satış tek satıra iner ve toplam yanlış çıkar. Alanlara benzersiz bir sütun (SatirNo) ekle. 2) Python kaynakları Power BI Hizmeti\'nde (bulut) yenilenirken kişisel ağ geçidi ister; kurumsal yenilemelerde Python adımını Power BI dışına (zamanlanmış betik) taşımak daha sağlamdır.</div>')
H.append('<h3>Excel\'de Python: =PY</h3>')
H.append('<p>Microsoft 365 Excel\'de bir hücreye <code>=PY(</code> yazınca Python düzenleyicisi açılır. Kod Microsoft bulutunda (Anaconda dağıtımıyla) çalışır; yerel dosyalara ve internete erişemez. Hücre aralığı <code>xl("A1:D100", headers=True)</code> ile DataFrame olarak gelir; sonuç hücreye değer ya da Excel tablosu olarak dökülür.</p>')
H.append(pc('''
=PY(
df = xl("Satislar[#All]", headers=True)
df.groupby("Kanal")["Tutar"].sum()
)
'''))
H.append('<h3>Yıldız şeması: Power BI\'ın sevdiği biçim</h3>')
H.append('<p>Power BI modeli en iyi <b>yıldız şemasıyla</b> çalışır: ortada olayları (satış satırları) tutan uzun ve dar bir <b>olgu tablosu</b> (fact), çevresinde tanımlayıcı bilgileri tutan <b>boyut tabloları</b> (dimension: Ürünler, Müşteriler, Tarih). Olgu tablosunda yalnız anahtarlar ve ölçülebilir sayılar (Adet, Tutar) bulunur; boyutlarda her anahtar <b>bir kez</b> geçer. Tek dev düz tablo yerine yıldız şeması: dosya küçülür, DAX ölçüleri doğru filtrelenir ve aynı boyut birden çok olguya bağlanabilir.</p>')
H.append(py('''
import veri

satis = veri.oku("kesit_bi", "Satislar")
urun = veri.oku("kesit_bi", "Urunler")
musteri = veri.oku("kesit_bi", "Musteriler")
print("olgu:", satis.shape, "| ürün:", urun.shape, "| müşteri:", musteri.shape)

# boyut anahtarları tekil mi? olgudaki her anahtarın boyutta karşılığı var mı?
print(urun["UrunNo"].is_unique, musteri["MusteriNo"].is_unique)
print(satis["UrunNo"].isin(urun["UrunNo"]).all(), satis["MusteriNo"].isin(musteri["MusteriNo"]).all())

tablo = satis.merge(urun[["UrunNo", "Kategori"]], on="UrunNo", validate="many_to_one")
print(tablo.groupby("Kategori")["Tutar"].sum().round(0).sort_values(ascending=False).head(3))
'''))
H.append('<p><code>validate="many_to_one"</code> birleştirmede boyut anahtarının tekil olduğunu denetler; tekil değilse hata verir. Bu tek parametre, raporda tutarların sessizce ikiye katlanmasını önler.</p>')
H.append('<h3>Düz tablodan yıldız şemasına</h3>')
H.append('<p>Kaynak sistemden çoğu zaman tek bir düz (denormalize) dışa aktarım gelir. Python\'un işi: boyutları ayırmak (<code>drop_duplicates</code>), anahtarları denetlemek, bir <b>tarih boyutu</b> üretmek ve dosyaları Power BI\'ın sorunsuz okuyacağı biçimde yazmaktır. Anadolu Market\'in SQL tablolarını birleştirip yeniden ayıralım:</p>')
H.append(py('''
kalem = veri.oku("anadolu_market", "order_items")
siparis = veri.oku("anadolu_market", "orders")
urunler = veri.oku("anadolu_market", "products")
duz = (kalem.merge(siparis, on="order_id")
            .merge(urunler[["product_id", "name", "category"]], on="product_id"))
print(duz.shape)

dim_urun = duz[["product_id", "name", "category"]].drop_duplicates().sort_values("product_id")
olgu = duz[["item_id", "order_id", "order_date", "product_id", "quantity", "unit_price", "discount"]].copy()
olgu["TarihKey"] = olgu["order_date"].str.replace("-", "").astype(int)   # 20240131 biçimi
olgu["tutar"] = (olgu["quantity"] * olgu["unit_price"] * (1 - olgu["discount"])).round(2)
print(dim_urun.shape, olgu.shape)
print(olgu[["TarihKey", "tutar"]].head(3))
'''))
H.append('<div class="tbl-wrap"><table><tr><th>Biçim</th><th>Artısı</th><th>Dikkat</th></tr>'
         '<tr><td>CSV (UTF-8)</td><td>Her yerde açılır, okunabilir</td><td>Tür bilgisi yok; tarih ISO (YYYY-AA-GG), ondalık nokta, <code>index=False</code>. Excel\'de açılacaksa <code>encoding="utf-8-sig"</code>.</td></tr>'
         '<tr><td>Parquet</td><td>Tür bilgisi, sıkıştırma, hızlı; Power BI doğrudan okur</td><td><code>df.to_parquet("olgu.parquet")</code> için pyarrow gerekir</td></tr>'
         '<tr><td>Excel (.xlsx)</td><td>İş kullanıcısı için tanıdık</td><td>1.048.576 satır sınırı; büyük olgu tablosu için uygun değil</td></tr></table></div>')
H.append('<div class="note"><b>Gerçek işte</b>Analist ekiplerinin yaygın düzeni: Python (zamanlanmış betik ya da boru hattı) kaynakları çeker ve temizler, yıldız şemalı Parquet/CSV dosyalarını paylaşılan klasöre ya da veri ambarına yazar; Power BI bu dosyalara bağlanır ve yalnız modelleme ile DAX işini yapar. Böylece ağır dönüşümler sürüm kontrolündeki Python kodunda kalır. Modelleme, ilişkiler ve DAX ölçülerinin devamı Kesit Power BI\'da; bu tablolar orada da aynı adlarla seni bekliyor.</div>')
html = ''.join(H)

# beklenen değerler
_k = veri.oku("anadolu_market", "order_items"); _s = veri.oku("anadolu_market", "orders"); _u = veri.oku("anadolu_market", "products"); _c = veri.oku("anadolu_market", "customers")
_duz = _k.merge(_s, on="order_id").merge(_u[["product_id", "name", "category"]], on="product_id").merge(_c[["customer_id", "city", "segment"]], on="customer_id")
TUTAR = round(float((_duz.quantity * _duz.unit_price * (1 - _duz.discount)).sum()), 2)
NMUS = _duz.customer_id.nunique()
_ks = veri.oku('kesit_bi', 'Satislar'); _ku = veri.oku('kesit_bi', 'Urunler'); _kh = veri.oku('kesit_bi', 'Hedefler')
_x = _ks[_ks.Durum != 'İptal'].merge(_ku[['UrunNo', 'Kategori']], on='UrunNo'); _x['YilAy'] = _x.Tarih.str[:7]
_a = _x.groupby(['YilAy', 'Kategori']).Tutar.sum().reset_index(); _kh = _kh.assign(YilAy=_kh.Tarih.str[:7])
_m = _kh.merge(_a, on=['YilAy', 'Kategori'], how='left').fillna({'Tutar': 0})
_m24 = _m[_m.YilAy.str.startswith('2024')]
GERCEK = {k: round(float(g.Tutar.sum() / g.Hedef.sum()), 3) for k, g in _m24.groupby('Kategori')}
print(TUTAR, NMUS, GERCEK)

DUZ = d('''
    import veri
    import pandas as pd

    kalem = veri.oku("anadolu_market", "order_items")
    siparis = veri.oku("anadolu_market", "orders")
    urunler = veri.oku("anadolu_market", "products")
    musteriler = veri.oku("anadolu_market", "customers")
    duz = (kalem.merge(siparis, on="order_id")
                .merge(urunler[["product_id", "name", "category"]], on="product_id")
                .merge(musteriler[["customer_id", "city", "segment"]], on="customer_id"))
''')

AYLAR = '["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"]'

ex = []
ex.append(dict(t='mc', stage='Isınma', q='Power BI\'da "Python betiği" veri kaynağına şu betiği yazdın: <code>import pandas as pd</code>, <code>yol = "satis.csv"</code>, <code>df = pd.read_csv(yol)</code>, <code>toplam = df["Tutar"].sum()</code>, <code>ozet = df.groupby("Kanal").sum()</code>. Gezgin penceresinde hangi tablolar listelenir?',
    o=['df, ozet, toplam ve yol değişkenlerinin hepsi ayrı tablolar olarak listelenir', 'Yalnız df ve ozet; yalnız DataFrame\'ler tablo olur', 'Yalnız betikteki son satırın sonucu olan ozet tablosu listelenir', 'Hiçbiri; tabloyu return ile açıkça döndürmen gerekir'],
    a=1, why='Power BI betik bittikten sonra ad alanındaki DataFrame\'leri arar. Sayı (toplam) ve metin (yol) tablo olmaz; return gerekmez, son satır da özel değildir.'))
ex.append(dict(t='mc', stage='Isınma', q='Neden Power BI\'a tek bir dev düz tablo yerine yıldız şeması (olgu + boyutlar) vermek tercih edilir?',
    o=['Power BI düz tabloları hiçbir şekilde içe aktaramadığı için yıldız şeması zorunludur', 'Boyut bilgisi her satırda tekrarlanmaz; model küçülür, filtreler öngörülebilir çalışır', 'Yıldız şeması verinin ilk kez ve tamamen Excel\'de açılmasını sağlar', 'Olgu tablosunda yalnız metin sütunlar bulunduğu için sıkıştırma çok artar'],
    a=1, why='Düz tablo da yüklenebilir ama ürün adı, kategori, şehir gibi metinler her satırda tekrarlanır. Yıldız şemasında boyut bir kez tutulur, ilişkiler üzerinden filtrelenir; aynı Tarih boyutu Satışlar ve Hedefler gibi birden çok olguyu birlikte filtreleyebilir.'))
ex.append(dict(t='predict', stage='Kodu oku', q='Power BI Python görselindeki <code>dataset</code> tekrarlanan satırları siler. Bu taklit kod ne yazdırır?',
    code=d('''
        import pandas as pd
        satis = pd.DataFrame({"SatirNo": [1, 2, 3], "Urun": ["Şampuan", "Şampuan", "Cezve"], "Tutar": [129, 129, 320]})
        dataset = satis[["Urun", "Tutar"]].drop_duplicates()
        dogru = satis[["SatirNo", "Urun", "Tutar"]].drop_duplicates()
        print(dataset["Tutar"].sum(), dogru["Tutar"].sum())
    '''),
    o=['449 578', '578 578', '449 449', '578 449'], a=0,
    why='Urun ve Tutar alanları seçilince iki aynı Şampuan satırı teke iner: 129 + 320 = 449. SatirNo gibi benzersiz bir alan eklenince satırlar ayrışır ve gerçek toplam 578 korunur.'))
ex.append(dict(t='order', stage='Kodu oku', q='<p>Düz tablodan ürün boyutunu ayırıp anahtarın tekil olduğunu doğrulayan programın satırlarını sırala.</p>',
    lines=['import pandas as pd',
           'duz = pd.DataFrame({"urun_no": [9, 9, 19], "urun": ["Suç ve Ceza", "Suç ve Ceza", "Bakır Cezve"], "adet": [1, 2, 1]})',
           'dim_urun = duz[["urun_no", "urun"]].drop_duplicates()',
           'dim_urun = dim_urun.sort_values("urun_no").reset_index(drop=True)',
           'assert dim_urun["urun_no"].is_unique',
           'print(len(duz), len(dim_urun))'],
    expect='3 2\n', needs=['pandas'],
    hint='Boyut, tekrarlar atılarak çıkarılır; sıralama ve indeks sıfırlama ondan sonra gelir.', why='Boyut tablosu düz tablonun tanımlayıcı sütunlarından tekrarlar atılarak çıkar; tekillik denetimi ilişkinin bire-çok kurulabileceğini garanti eder.'))
ex.append(dict(t='code', id='excel-otomasyon-w1', stage='Rehberli', diff=2, needs=['pandas'],
    q='<p>Power BI için tarih boyutu üret: <code>tarih_boyutu(bas, bit)</code> iki <code>"YYYY-AA-GG"</code> metni alıp her gün için bir satır içeren DataFrame döndürsün. Sütunlar: <code>TarihKey</code> (int, 20240131 biçimi), <code>Tarih</code> (metin, ISO), <code>Yil</code>, <code>AyNo</code>, <code>Ay</code> (Türkçe kısa ad, liste hazır), <code>Ceyrek</code> (<code>"Ç1"</code>…<code>"Ç4"</code>), <code>HaftaSonu</code> (<code>"Evet"</code>/<code>"Hayır"</code>). Test, Kesit Power BI\'daki gerçek <code>kesit_bi.Tarih</code> tablosuyla karşılaştırır.</p>',
    guide=['pd.date_range(bas, bit, freq="D") ile günleri üret.', 'Tarih metni ve TarihKey için strftime kullan (TarihKey\'i int\'e çevir).', 'Yıl, ay ve çeyrek için .year, .month, .quarter; Türkçe ay adını listeden al.', 'Hafta sonu: .dayofweek >= 5.'],
    example='import pandas as pd\ng = pd.date_range("2024-03-30", "2024-04-01", freq="D")\nprint(list(g.strftime("%Y%m%d").astype(int)), list(g.quarter), list(g.dayofweek))\n',
    start='import veri\nimport pandas as pd\n\nAYLAR = ' + AYLAR + '\n\ndef tarih_boyutu(bas, bit):\n    gunler = pd.date_range(bas, bit, freq="D")\n    # TODO: sütunları üret\n    return pd.DataFrame()\n',
    sol=d('''
        import veri
        import pandas as pd

        AYLAR = ''' + AYLAR + '''

        def tarih_boyutu(bas, bit):
            g = pd.date_range(bas, bit, freq="D")
            return pd.DataFrame({
                "TarihKey": g.strftime("%Y%m%d").astype(int),
                "Tarih": g.strftime("%Y-%m-%d"),
                "Yil": g.year,
                "AyNo": g.month,
                "Ay": [AYLAR[m - 1] for m in g.month],
                "Ceyrek": ["Ç" + str(q) for q in g.quarter],
                "HaftaSonu": ["Evet" if w >= 5 else "Hayır" for w in g.dayofweek],
            })
    '''),
    tests=d('''
        t = tarih_boyutu("2022-01-01", "2024-12-31")
        ref = veri.oku("kesit_bi", "Tarih")
        assert len(t) == len(ref) == 1096, f"2022-2024 arası 1096 gün; gelen {len(t)}"
        assert list(t.columns) == ["TarihKey", "Tarih", "Yil", "AyNo", "Ay", "Ceyrek", "HaftaSonu"]
        assert t["TarihKey"].iloc[0] == 20220101 and t["TarihKey"].dtype.kind == "i", "TarihKey int olmalı"
        assert t["Tarih"].tolist() == ref["Tarih"].tolist(), "Tarihler kesit_bi ile aynı olmalı"
        assert t["Ay"].tolist() == ref["Ay"].tolist(), "Türkçe ay adları kesit_bi ile aynı olmalı"
        assert t["Ceyrek"].tolist() == ref["Ceyrek"].tolist() and t["HaftaSonu"].tolist() == ref["HaftaSonu"].tolist()
    '''),
    hints=['DatetimeIndex\'in year, month, quarter, dayofweek alanları dizi döndürür.', 'g.strftime("%Y%m%d").astype(int) anahtar sütununu verir.', 'Ay adı: AYLAR[m - 1]; çeyrek: "Ç" + str(q).'],
    why='Power BI\'da zaman zekâsı (time intelligence) fonksiyonları kesintisiz bir tarih tablosu ister; kaynakta satış olmayan günler de bulunmalıdır. Tamsayı anahtar ilişkiyi hızlandırır, Türkçe ad ve çeyrek sütunları rapor eksenleri içindir.'))
ex.append(dict(t='code', id='excel-otomasyon-w2', stage='Rehberli', diff=2, needs=['pandas'],
    q='<p>Anadolu Market\'in gerçek tablolarını birleştiren düz tablo (<code>duz</code>) hazır. <code>yildiz_semasi(duz)</code> yaz ve <code>{"olgu": .., "dim_urun": .., "dim_musteri": ..}</code> sözlüğü döndür:</p><ul><li><code>dim_urun</code>: <code>product_id, name, category</code>, tekrarsız, product_id\'ye göre sıralı, indeks sıfırlanmış.</li><li><code>dim_musteri</code>: <code>customer_id, city, segment</code>, aynı kurallarla.</li><li><code>olgu</code>: <code>item_id, order_id, TarihKey, product_id, customer_id, quantity, tutar</code>; TarihKey = order_date\'ten int (20240131), tutar = quantity × unit_price × (1 − discount), 2 basamak.</li></ul>',
    guide=['Bir boyut üreten küçük yardımcı yaz: sütunları seç → drop_duplicates → sort_values → reset_index(drop=True).', 'Olgu için kopya al; TarihKey\'i str.replace("-", "") ve astype(int) ile üret.', 'Tutarı hesapla, round(2) uygula, sütunları istenen sırayla seç.'],
    example='import pandas as pd\nd = pd.DataFrame({"t": ["2024-01-31"], "a": [2], "f": [10.0], "i": [0.1]})\nprint(d["t"].str.replace("-", "").astype(int).tolist(), (d["a"] * d["f"] * (1 - d["i"])).round(2).tolist())\n',
    start=DUZ + '\ndef yildiz_semasi(duz):\n    # TODO: dim_urun, dim_musteri\n    # TODO: olgu (TarihKey, tutar)\n    return {}\n',
    sol=DUZ + d('''

        def _boyut(df, sutunlar):
            return df[sutunlar].drop_duplicates().sort_values(sutunlar[0]).reset_index(drop=True)

        def yildiz_semasi(duz):
            olgu = duz.copy()
            olgu["TarihKey"] = olgu["order_date"].str.replace("-", "").astype(int)
            olgu["tutar"] = (olgu["quantity"] * olgu["unit_price"] * (1 - olgu["discount"])).round(2)
            olgu = olgu[["item_id", "order_id", "TarihKey", "product_id", "customer_id", "quantity", "tutar"]]
            return {"olgu": olgu,
                    "dim_urun": _boyut(duz, ["product_id", "name", "category"]),
                    "dim_musteri": _boyut(duz, ["customer_id", "city", "segment"])}
    '''),
    tests=f'''y = yildiz_semasi(duz)
assert y["olgu"].shape == (1620, 7), f"Olgu 1620 satır × 7 sütun olmalı; gelen {{y['olgu'].shape}}"
assert y["dim_urun"].shape == (38, 3) and y["dim_urun"]["product_id"].is_unique, "Satılmış 38 ürün, tekil anahtar"
assert len(y["dim_musteri"]) == {NMUS} and y["dim_musteri"]["customer_id"].is_unique, "Sipariş veren {NMUS} müşteri"
assert round(float(y["olgu"]["tutar"].sum()), 2) == {TUTAR}, "Toplam ciro {TUTAR} TL olmalı"
assert y["olgu"]["TarihKey"].dtype.kind == "i" and y["olgu"]["TarihKey"].min() == 20220622
assert y["dim_urun"].index.tolist() == list(range(38)), "İndeks sıfırlanmalı"
assert "name" not in y["olgu"].columns, "Olgu tablosunda tanımlayıcı metin olmamalı"
''',
    hints=['drop_duplicates boyut sütunlarında tekrarları atar.', 'Olguda yalnız anahtarlar ve ölçülebilir sayılar kalmalı.'],
    why='Bu, Power BI\'a veri hazırlamanın özüdür: tanımlayıcı metinler boyutlara, sayılar ve anahtarlar olguya. Model küçülür ve ilişkiler bire-çok kurulur.'))
ex.append(dict(t='code', id='excel-otomasyon-w3', stage='Kendin yaz', diff=2, needs=['pandas'],
    q='<p>Model yüklenmeden önce bütünlük denetimi: <code>butunluk_raporu(olgu, boyutlar)</code>. <code>boyutlar</code> <code>{anahtar_sutun: boyut_df}</code> sözlüğü. Her anahtar için <code>{"tekil": bool, "yetim": int}</code> döndür: <code>tekil</code> boyuttaki anahtarın tekrarsız olup olmadığı, <code>yetim</code> olguda boyutta karşılığı olmayan <b>satır</b> sayısı (<code>int</code>). Test önce gerçek <code>kesit_bi</code> tablolarında, sonra bozulmuş bir kopyada çalışır.</p>',
    start='import veri\nimport pandas as pd\nsatis = veri.oku("kesit_bi", "Satislar")\nurun = veri.oku("kesit_bi", "Urunler")\nmusteri = veri.oku("kesit_bi", "Musteriler")\n\ndef butunluk_raporu(olgu, boyutlar):\n    pass\n',
    sol='import veri\nimport pandas as pd\nsatis = veri.oku("kesit_bi", "Satislar")\nurun = veri.oku("kesit_bi", "Urunler")\nmusteri = veri.oku("kesit_bi", "Musteriler")\n\ndef butunluk_raporu(olgu, boyutlar):\n    rapor = {}\n    for anahtar, boyut in boyutlar.items():\n        rapor[anahtar] = {"tekil": bool(boyut[anahtar].is_unique),\n                          "yetim": int((~olgu[anahtar].isin(boyut[anahtar])).sum())}\n    return rapor\n',
    tests=d('''
        r = butunluk_raporu(satis, {"UrunNo": urun, "MusteriNo": musteri})
        assert r == {"UrunNo": {"tekil": True, "yetim": 0}, "MusteriNo": {"tekil": True, "yetim": 0}}, f"Gerçek model temiz olmalı; gelen {r}"
        bozuk_urun = pd.concat([urun, urun.head(2)])
        bozuk_satis = satis.copy()
        bozuk_satis.loc[:2, "MusteriNo"] = 9999
        r2 = butunluk_raporu(bozuk_satis, {"UrunNo": bozuk_urun, "MusteriNo": musteri})
        assert r2["UrunNo"]["tekil"] is False, "Tekrarlanan ürün anahtarı yakalanmalı"
        assert r2["MusteriNo"]["yetim"] == 3, "Boyutta olmayan 3 satış satırı yetim"
        assert type(r2["MusteriNo"]["yetim"]) is int
    '''),
    hints=['Seri.is_unique tekillik verir.', '~olgu[anahtar].isin(boyut[anahtar]) yetim satırları işaretler; sum ile say.'],
    why='Tekil olmayan boyut anahtarı Power BI\'da ilişkiyi çoka-çok yapar ve toplamları bozar; yetim satırlar raporda "(Boş)" kategorisi olarak görünür. İkisini Python\'da yakalamak, sorunu pano kullanıcısından önce görmeni sağlar.'))
ex.append(dict(t='code', id='excel-otomasyon-w4', stage='Kendin yaz', diff=2, needs=['pandas'],
    q='<p>Power BI ve Excel\'in sorunsuz okuyacağı CSV yaz: <code>pbi_csv(df)</code> metin döndürsün. Kurallar: indeks yazılmaz; ayraç virgül, ondalık nokta; <code>float</code> sütunlar 2 basamağa yuvarlanır; <code>datetime</code> sütunlar <code>YYYY-AA-GG</code> metnine çevrilir; eksik değerler boş hücre; satır sonu <code>\\n</code>. Orijinal DataFrame değişmemeli. Sonra <code>kanal_ozeti()</code> yaz: gerçek <code>kesit_bi.Satislar</code>\'dan iptal edilmemiş satışların kanal bazında <code>Tutar</code> toplamını <code>Kanal, Tutar</code> sütunlu DataFrame olarak (kanal adına göre sıralı) döndürsün.</p>',
    start='import veri\nimport pandas as pd\n\ndef pbi_csv(df):\n    pass\n\ndef kanal_ozeti():\n    pass\n',
    sol=d('''
        import veri
        import pandas as pd

        def pbi_csv(df):
            d = df.copy()
            for c in d.columns:
                if pd.api.types.is_datetime64_any_dtype(d[c]):
                    d[c] = d[c].dt.strftime("%Y-%m-%d")
                elif pd.api.types.is_float_dtype(d[c]):
                    d[c] = d[c].round(2)
            return d.to_csv(index=False, lineterminator="\\n")

        def kanal_ozeti():
            s = veri.oku("kesit_bi", "Satislar")
            s = s[s["Durum"] != "İptal"]
            return s.groupby("Kanal", as_index=False)["Tutar"].sum().sort_values("Kanal").reset_index(drop=True)
    '''),
    tests=d('''
        df = pd.DataFrame({"Tarih": pd.to_datetime(["2024-01-31", None]), "Tutar": [1234.5678, None], "Adet": [1, 2]})
        assert pbi_csv(df) == "Tarih,Tutar,Adet\\n2024-01-31,1234.57,1\\n,,2\\n", f"Gelen {pbi_csv(df)!r}"
        assert df["Tutar"].iloc[0] == 1234.5678, "Orijinal tablo değişmemeli"
        k = kanal_ozeti()
        assert k["Kanal"].tolist() == sorted(k["Kanal"].tolist()) and len(k) == 3
        satis = veri.oku("kesit_bi", "Satislar")
        assert abs(k["Tutar"].sum() - satis.loc[satis["Durum"] != "İptal", "Tutar"].sum()) < 1e-6
        metin = pbi_csv(k)
        assert metin.startswith("Kanal,Tutar\\n") and metin.count("\\n") == 4
    '''),
    hints=['pd.api.types.is_datetime64_any_dtype ve is_float_dtype sütun türünü sınar.', 'to_csv(index=False, lineterminator="\\n") metin döndürür (yol vermezsen).'],
    why='Power BI ve Excel bölge ayarına göre CSV\'yi farklı yorumlayabilir; ISO tarih ve ondalık nokta her ayarda aynı okunur. Excel\'de Türkçe karakter sorunu yaşarsan dosyaya yazarken encoding="utf-8-sig" kullan.'))
ex.append(dict(t='code', id='excel-otomasyon-w5', stage='Hata avı', kind='bug', diff=2, needs=['pandas'],
    q='<p>Hatayı bul ve düzelt. <code>bolge_cirosu(satis, musteri)</code> bölge bazında ciroyu döndürmeli. Analist müşteri boyutunu iki dışa aktarımın birleşiminden kurmuş ve bazı müşteriler iki kez gelmiş; panodaki toplam, satış tablosundaki toplamdan büyük çıkıyor. Ayrıca bölgesi boş olan 7 müşterinin satışları <code>groupby</code> tarafından sessizce atılıyor. Fonksiyonu boyutu tekilleştirecek, birleştirmede <code>validate="many_to_one"</code> kullanacak ve boş bölgeyi <code>"Bilinmiyor"</code> yapacak şekilde düzelt. Dönüş: <code>{bolge: tutar}</code> (2 basamak).</p>',
    start=d('''
        import veri
        import pandas as pd

        satis = veri.oku("kesit_bi", "Satislar")
        musteri = veri.oku("kesit_bi", "Musteriler")
        musteri_iki_kaynak = pd.concat([musteri, musteri.sample(20, random_state=1)])

        def bolge_cirosu(satis, musteri):
            t = satis.merge(musteri[["MusteriNo", "Bolge"]], on="MusteriNo")
            return t.groupby("Bolge")["Tutar"].sum().round(2).to_dict()
    '''),
    sol=d('''
        import veri
        import pandas as pd

        satis = veri.oku("kesit_bi", "Satislar")
        musteri = veri.oku("kesit_bi", "Musteriler")
        musteri_iki_kaynak = pd.concat([musteri, musteri.sample(20, random_state=1)])

        def bolge_cirosu(satis, musteri):
            boyut = musteri[["MusteriNo", "Bolge"]].drop_duplicates("MusteriNo")
            boyut = boyut.fillna({"Bolge": "Bilinmiyor"})
            t = satis.merge(boyut, on="MusteriNo", validate="many_to_one")
            return t.groupby("Bolge")["Tutar"].sum().round(2).to_dict()
    '''),
    tests=d('''
        r = bolge_cirosu(satis, musteri_iki_kaynak)
        assert abs(sum(r.values()) - satis["Tutar"].sum()) < 0.05, f"Bölge toplamı satış toplamına ({satis['Tutar'].sum():.2f}) eşit olmalı; gelen {sum(r.values()):.2f}"
        assert r["Marmara"] == 358854.55 and r["İç Anadolu"] == 377322.4, f"Gelen {r}"
        assert "Bilinmiyor" in r and r["Bilinmiyor"] > 0, "Bölgesi boş müşterilerin satışı Bilinmiyor altında görünmeli"
        assert r == bolge_cirosu(satis, musteri), "Tekrarlı ve temiz boyut aynı sonucu vermeli"
    '''),
    hints=['Toplamın büyümesi satırların çoğaldığını, küçülmesi ise grupların atıldığını gösterir; groupby varsayılan olarak NaN anahtarı atar.', 'Boyutu drop_duplicates("MusteriNo") ile tekilleştir; merge\'e validate="many_to_one" ekle.'],
    why='Boyutta tekrarlanan anahtar, birleştirmede her eşleşen satış satırını çoğaltır (fan-out). validate parametresi bu hatayı sessiz bir rakam farkı yerine açık bir MergeError\'a çevirir; Power BI\'da aynı sorun çoka-çok ilişki uyarısı olarak görünür.'))
ex.append(dict(t='code', id='excel-otomasyon-w6', stage='Meydan okuma', diff=3, needs=['pandas'],
    q='<p>Hedef gerçekleşme tablosu (Kesit Power BI\'daki "Hedef vs Gerçek" sayfasının verisi). <code>gerceklesme(yil)</code>: gerçek <code>kesit_bi</code> tablolarını kullan. <code>Hedefler</code> ay başı tarihli ve kategori bazında (<code>Tarih, Kategori, Hedef</code>). <code>Satislar</code>\'dan <b>iptal edilmemiş</b> satırları al, <code>Urunler</code> ile kategoriyi ekle, <code>YilAy</code> (<code>"2024-01"</code>) ve kategori bazında <code>Tutar</code> topla. Hedeflerle <b>sol birleştirme</b> yap (satış olmayan ay 0 sayılır). Verilen yıl için kategori bazında <code>toplam gerçek / toplam hedef</code> oranını 3 basamakla <code>{kategori: oran}</code> döndür.</p>',
    start='import veri\nimport pandas as pd\n\ndef gerceklesme(yil):\n    pass\n',
    sol=d('''
        import veri
        import pandas as pd

        def gerceklesme(yil):
            s = veri.oku("kesit_bi", "Satislar")
            u = veri.oku("kesit_bi", "Urunler")
            h = veri.oku("kesit_bi", "Hedefler")
            s = s[s["Durum"] != "İptal"].merge(u[["UrunNo", "Kategori"]], on="UrunNo", validate="many_to_one")
            s["YilAy"] = s["Tarih"].str[:7]
            gercek = s.groupby(["YilAy", "Kategori"], as_index=False)["Tutar"].sum()
            h = h.assign(YilAy=h["Tarih"].str[:7])
            m = h.merge(gercek, on=["YilAy", "Kategori"], how="left").fillna({"Tutar": 0})
            m = m[m["YilAy"].str.startswith(str(yil))]
            ozet = m.groupby("Kategori")[["Tutar", "Hedef"]].sum()
            return {k: round(float(r["Tutar"] / r["Hedef"]), 3) for k, r in ozet.iterrows()}
    '''),
    tests=f'''r = gerceklesme(2024)
assert r == {GERCEK!r}, f"2024 gerçekleşme oranları beklenenden farklı: {{r}}"
assert r["Kitap"] > 1 > r["Hediye"], "Kitap hedefi aştı, Hediye geride kaldı"
assert len(gerceklesme(2022)) == 7, "2022 için de 7 kategori"
''',
    hints=['Ay anahtarı için Tarih metninin ilk 7 karakteri yeter.', 'Hedeflerden başlayan sol birleştirme, satış olmayan ayları da tutar; fillna ile 0 yap.', 'Oranı aylık oranların ortalaması olarak değil, toplamların oranı olarak hesapla.'],
    why='Oranların ortalaması küçük hedefli ayların etkisini büyütür; toplamların oranı doğru gerçekleşmedir (DAX\'taki DIVIDE(SUM, SUM) ile aynı). Hedeften başlayan sol birleştirme satış olmayan ayları sıfır olarak gösterir; iç birleştirme onları sessizce düşürürdü.'))

faq = [
    dict(q='Power BI\'da Python betiği mi kullanmalıyım, yoksa veriyi Python\'da önceden mi hazırlamalıyım?', a='Küçük, kişisel raporlarda betik kaynağı pratiktir. Paylaşılan, zamanlanmış yenilenen raporlarda ise dönüşümü Python\'da (sürüm kontrollü bir betikte) yapıp çıktıyı CSV/Parquet ya da veri ambarı tablosu olarak Power BI\'a vermek daha sağlamdır: ağ geçidi ve Python ortamı bağımlılığı ortadan kalkar, hatalar test edilebilir.'),
    dict(q='Excel\'deki =PY ile openpyxl arasındaki fark nedir?', a='=PY, Excel\'in içinde, Microsoft bulutunda çalışan Python\'dur; çalışma kitabındaki aralıkları okuyup sonucu hücreye yazar, yerel dosya ve ağ erişimi yoktur. openpyxl ise kendi bilgisayarında çalışan Python\'un Excel dosyasını dışarıdan okuyup yazmasıdır; otomasyon ve toplu rapor üretimi için kullanılır.'),
]
mistakes = [dict(bad='t = satis.merge(musteri, on="MusteriNo")', good='t = satis.merge(musteri.drop_duplicates("MusteriNo"), on="MusteriNo", validate="many_to_one")', why='Tekrarlı boyut anahtarı birleştirmede satırları çoğaltır ve toplamları şişirir.')]
emit(dict(id='excel-otomasyon', min=28, html=html, ex=ex, faq=faq, mistakes=mistakes), 'Power BI ve Excel köprüsü: Python betik kaynağı/görseli, =PY, kesit_bi ile yıldız şemalı CSV hazırlama (AUDIT Ekle-4)')
