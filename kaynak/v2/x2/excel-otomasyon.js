/* Kesit Python — 'excel-otomasyon' dersi uzantısı: Power BI ve Excel köprüsü: Python betik kaynağı/görseli, =PY, kesit_bi ile yıldız şemalı CSV hazırlama (AUDIT Ekle-4) */
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
  { id: 'excel-otomasyon',
    min: 28,
    html: `<h2>Derinleş: Power BI ve Excel köprüsü</h2><p>Çoğu kurumda Python tek başına rapor aracı değildir; sonuçlar Excel'e ya da Power BI panolarına gider. Python'un bu dünyaya üç kapısı var: Power BI içinde <b>Python betik kaynağı</b> ve <b>Python görseli</b>, Excel içinde <b>=PY</b> formülü ve en sağlamı, Python'un temizleyip Power BI'a hazır <b>yıldız şemalı dosyalar</b> (CSV/Parquet) üretmesi. Bu bölümde Kesit Power BI'ın kullandığı <code>kesit_bi</code> modelini ve Kesit SQL'in <code>anadolu_market</code> tablolarını kullanacaksın; ikisi aynı kurgusal şirketin iki görünümü.</p><h3>Power BI'da Python: betik kaynağı ve görsel</h3><p><b>Veri al → Diğer → Python betiği</b> ile yazdığın betik çalışır ve betik bittiğinde ad alanındaki <b>her pandas DataFrame</b> ayrı bir tablo olarak seçime sunulur. Power BI Desktop, bilgisayarındaki Python yorumlayıcısını kullanır (Seçenekler → Python betiği oluşturma); pandas ve matplotlib orada kurulu olmalıdır. <b>Python görseli</b> ise rapor sayfasında çalışır: seçtiğin alanlar <code>dataset</code> adlı DataFrame olarak gelir, sen matplotlib ile çizersin.</p><pre class="code"># Power BI → Veri al → Python betiği
import pandas as pd
satis = pd.read_csv(r"C:\\veri\\kesit_bi\\Satislar.csv")
satis = satis[satis["Durum"] != "İptal"]          # yalnız DataFrame'ler tablo olur
ozet = satis.groupby("Kanal", as_index=False)["Tutar"].sum()

# Python görseli (rapor sayfasında): Power BI "dataset" DataFrame'ini verir
import matplotlib.pyplot as plt
dataset.groupby("Kategori")["Tutar"].sum().sort_values().plot.barh()
plt.show()</pre><div class="warn"><b>İki tuzak</b>1) Python görseline gelen <code>dataset</code> içinde <b>tekrarlanan satırlar silinir</b>; aynı ürün ve tutarlı iki satış tek satıra iner ve toplam yanlış çıkar. Alanlara benzersiz bir sütun (SatirNo) ekle. 2) Python kaynakları Power BI Hizmeti'nde (bulut) yenilenirken kişisel ağ geçidi ister; kurumsal yenilemelerde Python adımını Power BI dışına (zamanlanmış betik) taşımak daha sağlamdır.</div><h3>Excel'de Python: =PY</h3><p>Microsoft 365 Excel'de bir hücreye <code>=PY(</code> yazınca Python düzenleyicisi açılır. Kod Microsoft bulutunda (Anaconda dağıtımıyla) çalışır; yerel dosyalara ve internete erişemez. Hücre aralığı <code>xl("A1:D100", headers=True)</code> ile DataFrame olarak gelir; sonuç hücreye değer ya da Excel tablosu olarak dökülür.</p><pre class="code">=PY(
df = xl("Satislar[#All]", headers=True)
df.groupby("Kanal")["Tutar"].sum()
)</pre><h3>Yıldız şeması: Power BI'ın sevdiği biçim</h3><p>Power BI modeli en iyi <b>yıldız şemasıyla</b> çalışır: ortada olayları (satış satırları) tutan uzun ve dar bir <b>olgu tablosu</b> (fact), çevresinde tanımlayıcı bilgileri tutan <b>boyut tabloları</b> (dimension: Ürünler, Müşteriler, Tarih). Olgu tablosunda yalnız anahtarlar ve ölçülebilir sayılar (Adet, Tutar) bulunur; boyutlarda her anahtar <b>bir kez</b> geçer. Tek dev düz tablo yerine yıldız şeması: dosya küçülür, DAX ölçüleri doğru filtrelenir ve aynı boyut birden çok olguya bağlanabilir.</p><pre class="py">import veri

satis = veri.oku("kesit_bi", "Satislar")
urun = veri.oku("kesit_bi", "Urunler")
musteri = veri.oku("kesit_bi", "Musteriler")
print("olgu:", satis.shape, "| ürün:", urun.shape, "| müşteri:", musteri.shape)

# boyut anahtarları tekil mi? olgudaki her anahtarın boyutta karşılığı var mı?
print(urun["UrunNo"].is_unique, musteri["MusteriNo"].is_unique)
print(satis["UrunNo"].isin(urun["UrunNo"]).all(), satis["MusteriNo"].isin(musteri["MusteriNo"]).all())

tablo = satis.merge(urun[["UrunNo", "Kategori"]], on="UrunNo", validate="many_to_one")
print(tablo.groupby("Kategori")["Tutar"].sum().round(0).sort_values(ascending=False).head(3))</pre><p><code>validate="many_to_one"</code> birleştirmede boyut anahtarının tekil olduğunu denetler; tekil değilse hata verir. Bu tek parametre, raporda tutarların sessizce ikiye katlanmasını önler.</p><h3>Düz tablodan yıldız şemasına</h3><p>Kaynak sistemden çoğu zaman tek bir düz (denormalize) dışa aktarım gelir. Python'un işi: boyutları ayırmak (<code>drop_duplicates</code>), anahtarları denetlemek, bir <b>tarih boyutu</b> üretmek ve dosyaları Power BI'ın sorunsuz okuyacağı biçimde yazmaktır. Anadolu Market'in SQL tablolarını birleştirip yeniden ayıralım:</p><pre class="py">kalem = veri.oku("anadolu_market", "order_items")
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
print(olgu[["TarihKey", "tutar"]].head(3))</pre><div class="tbl-wrap"><table><tr><th>Biçim</th><th>Artısı</th><th>Dikkat</th></tr><tr><td>CSV (UTF-8)</td><td>Her yerde açılır, okunabilir</td><td>Tür bilgisi yok; tarih ISO (YYYY-AA-GG), ondalık nokta, <code>index=False</code>. Excel'de açılacaksa <code>encoding="utf-8-sig"</code>.</td></tr><tr><td>Parquet</td><td>Tür bilgisi, sıkıştırma, hızlı; Power BI doğrudan okur</td><td><code>df.to_parquet("olgu.parquet")</code> için pyarrow gerekir</td></tr><tr><td>Excel (.xlsx)</td><td>İş kullanıcısı için tanıdık</td><td>1.048.576 satır sınırı; büyük olgu tablosu için uygun değil</td></tr></table></div><div class="note"><b>Gerçek işte</b>Analist ekiplerinin yaygın düzeni: Python (zamanlanmış betik ya da boru hattı) kaynakları çeker ve temizler, yıldız şemalı Parquet/CSV dosyalarını paylaşılan klasöre ya da veri ambarına yazar; Power BI bu dosyalara bağlanır ve yalnız modelleme ile DAX işini yapar. Böylece ağır dönüşümler sürüm kontrolündeki Python kodunda kalır. Modelleme, ilişkiler ve DAX ölçülerinin devamı Kesit Power BI'da; bu tablolar orada da aynı adlarla seni bekliyor.</div>`,
    ex: [
      { t: 'mc',
        stage: 'Isınma',
        q: 'Power BI\'da "Python betiği" veri kaynağına şu betiği yazdın: <code>import pandas as pd</code>, <code>yol = "satis.csv"</code>, <code>df = pd.read_csv(yol)</code>, <code>toplam = df["Tutar"].sum()</code>, <code>ozet = df.groupby("Kanal").sum()</code>. Gezgin penceresinde hangi tablolar listelenir?',
        o: ['df, ozet, toplam ve yol değişkenlerinin hepsi ayrı tablolar olarak listelenir', 'Yalnız df ve ozet; yalnız DataFrame\'ler tablo olur', 'Yalnız betikteki son satırın sonucu olan ozet tablosu listelenir', 'Hiçbiri; tabloyu return ile açıkça döndürmen gerekir'],
        a: 1,
        why: 'Power BI betik bittikten sonra ad alanındaki DataFrame\'leri arar. Sayı (toplam) ve metin (yol) tablo olmaz; return gerekmez, son satır da özel değildir.' },
      { t: 'mc',
        stage: 'Isınma',
        q: 'Neden Power BI\'a tek bir dev düz tablo yerine yıldız şeması (olgu + boyutlar) vermek tercih edilir?',
        o: ['Power BI düz tabloları hiçbir şekilde içe aktaramadığı için yıldız şeması zorunludur', 'Boyut bilgisi her satırda tekrarlanmaz; model küçülür, filtreler öngörülebilir çalışır', 'Yıldız şeması verinin ilk kez ve tamamen Excel\'de açılmasını sağlar', 'Olgu tablosunda yalnız metin sütunlar bulunduğu için sıkıştırma çok artar'],
        a: 1,
        why: 'Düz tablo da yüklenebilir ama ürün adı, kategori, şehir gibi metinler her satırda tekrarlanır. Yıldız şemasında boyut bir kez tutulur, ilişkiler üzerinden filtrelenir; aynı Tarih boyutu Satışlar ve Hedefler gibi birden çok olguyu birlikte filtreleyebilir.' },
      { t: 'predict',
        stage: 'Kodu oku',
        q: 'Power BI Python görselindeki <code>dataset</code> tekrarlanan satırları siler. Bu taklit kod ne yazdırır?',
        code: 'import pandas as pd\nsatis = pd.DataFrame({"SatirNo": [1, 2, 3], "Urun": ["Şampuan", "Şampuan", "Cezve"], "Tutar": [129, 129, 320]})\ndataset = satis[["Urun", "Tutar"]].drop_duplicates()\ndogru = satis[["SatirNo", "Urun", "Tutar"]].drop_duplicates()\nprint(dataset["Tutar"].sum(), dogru["Tutar"].sum())\n',
        o: ['449 578', '578 578', '449 449', '578 449'],
        a: 0,
        why: 'Urun ve Tutar alanları seçilince iki aynı Şampuan satırı teke iner: 129 + 320 = 449. SatirNo gibi benzersiz bir alan eklenince satırlar ayrışır ve gerçek toplam 578 korunur.' },
      { t: 'order',
        stage: 'Kodu oku',
        q: '<p>Düz tablodan ürün boyutunu ayırıp anahtarın tekil olduğunu doğrulayan programın satırlarını sırala.</p>',
        lines: ['import pandas as pd', 'duz = pd.DataFrame({"urun_no": [9, 9, 19], "urun": ["Suç ve Ceza", "Suç ve Ceza", "Bakır Cezve"], "adet": [1, 2, 1]})', 'dim_urun = duz[["urun_no", "urun"]].drop_duplicates()', 'dim_urun = dim_urun.sort_values("urun_no").reset_index(drop=True)', 'assert dim_urun["urun_no"].is_unique', 'print(len(duz), len(dim_urun))'],
        expect: '3 2\n',
        needs: ['pandas'],
        hint: 'Boyut, tekrarlar atılarak çıkarılır; sıralama ve indeks sıfırlama ondan sonra gelir.',
        why: 'Boyut tablosu düz tablonun tanımlayıcı sütunlarından tekrarlar atılarak çıkar; tekillik denetimi ilişkinin bire-çok kurulabileceğini garanti eder.' },
      { t: 'code',
        id: 'excel-otomasyon-w1',
        stage: 'Rehberli',
        diff: 2,
        needs: ['pandas'],
        q: '<p>Power BI için tarih boyutu üret: <code>tarih_boyutu(bas, bit)</code> iki <code>"YYYY-AA-GG"</code> metni alıp her gün için bir satır içeren DataFrame döndürsün. Sütunlar: <code>TarihKey</code> (int, 20240131 biçimi), <code>Tarih</code> (metin, ISO), <code>Yil</code>, <code>AyNo</code>, <code>Ay</code> (Türkçe kısa ad, liste hazır), <code>Ceyrek</code> (<code>"Ç1"</code>…<code>"Ç4"</code>), <code>HaftaSonu</code> (<code>"Evet"</code>/<code>"Hayır"</code>). Test, Kesit Power BI\'daki gerçek <code>kesit_bi.Tarih</code> tablosuyla karşılaştırır.</p>',
        guide: ['pd.date_range(bas, bit, freq="D") ile günleri üret.', 'Tarih metni ve TarihKey için strftime kullan (TarihKey\'i int\'e çevir).', 'Yıl, ay ve çeyrek için .year, .month, .quarter; Türkçe ay adını listeden al.', 'Hafta sonu: .dayofweek >= 5.'],
        example: 'import pandas as pd\ng = pd.date_range("2024-03-30", "2024-04-01", freq="D")\nprint(list(g.strftime("%Y%m%d").astype(int)), list(g.quarter), list(g.dayofweek))\n',
        start: 'import veri\nimport pandas as pd\n\nAYLAR = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"]\n\ndef tarih_boyutu(bas, bit):\n    gunler = pd.date_range(bas, bit, freq="D")\n    # TODO: sütunları üret\n    return pd.DataFrame()\n',
        sol: 'import veri\nimport pandas as pd\n\nAYLAR = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"]\n\ndef tarih_boyutu(bas, bit):\n    g = pd.date_range(bas, bit, freq="D")\n    return pd.DataFrame({\n        "TarihKey": g.strftime("%Y%m%d").astype(int),\n        "Tarih": g.strftime("%Y-%m-%d"),\n        "Yil": g.year,\n        "AyNo": g.month,\n        "Ay": [AYLAR[m - 1] for m in g.month],\n        "Ceyrek": ["Ç" + str(q) for q in g.quarter],\n        "HaftaSonu": ["Evet" if w >= 5 else "Hayır" for w in g.dayofweek],\n    })\n',
        tests: 't = tarih_boyutu("2022-01-01", "2024-12-31")\nref = veri.oku("kesit_bi", "Tarih")\nassert len(t) == len(ref) == 1096, f"2022-2024 arası 1096 gün; gelen {len(t)}"\nassert list(t.columns) == ["TarihKey", "Tarih", "Yil", "AyNo", "Ay", "Ceyrek", "HaftaSonu"]\nassert t["TarihKey"].iloc[0] == 20220101 and t["TarihKey"].dtype.kind == "i", "TarihKey int olmalı"\nassert t["Tarih"].tolist() == ref["Tarih"].tolist(), "Tarihler kesit_bi ile aynı olmalı"\nassert t["Ay"].tolist() == ref["Ay"].tolist(), "Türkçe ay adları kesit_bi ile aynı olmalı"\nassert t["Ceyrek"].tolist() == ref["Ceyrek"].tolist() and t["HaftaSonu"].tolist() == ref["HaftaSonu"].tolist()\n',
        hints: ['DatetimeIndex\'in year, month, quarter, dayofweek alanları dizi döndürür.', 'g.strftime("%Y%m%d").astype(int) anahtar sütununu verir.', 'Ay adı: AYLAR[m - 1]; çeyrek: "Ç" + str(q).'],
        why: 'Power BI\'da zaman zekâsı (time intelligence) fonksiyonları kesintisiz bir tarih tablosu ister; kaynakta satış olmayan günler de bulunmalıdır. Tamsayı anahtar ilişkiyi hızlandırır, Türkçe ad ve çeyrek sütunları rapor eksenleri içindir.' },
      { t: 'code',
        id: 'excel-otomasyon-w2',
        stage: 'Rehberli',
        diff: 2,
        needs: ['pandas'],
        q: '<p>Anadolu Market\'in gerçek tablolarını birleştiren düz tablo (<code>duz</code>) hazır. <code>yildiz_semasi(duz)</code> yaz ve <code>{"olgu": .., "dim_urun": .., "dim_musteri": ..}</code> sözlüğü döndür:</p><ul><li><code>dim_urun</code>: <code>product_id, name, category</code>, tekrarsız, product_id\'ye göre sıralı, indeks sıfırlanmış.</li><li><code>dim_musteri</code>: <code>customer_id, city, segment</code>, aynı kurallarla.</li><li><code>olgu</code>: <code>item_id, order_id, TarihKey, product_id, customer_id, quantity, tutar</code>; TarihKey = order_date\'ten int (20240131), tutar = quantity × unit_price × (1 − discount), 2 basamak.</li></ul>',
        guide: ['Bir boyut üreten küçük yardımcı yaz: sütunları seç → drop_duplicates → sort_values → reset_index(drop=True).', 'Olgu için kopya al; TarihKey\'i str.replace("-", "") ve astype(int) ile üret.', 'Tutarı hesapla, round(2) uygula, sütunları istenen sırayla seç.'],
        example: 'import pandas as pd\nd = pd.DataFrame({"t": ["2024-01-31"], "a": [2], "f": [10.0], "i": [0.1]})\nprint(d["t"].str.replace("-", "").astype(int).tolist(), (d["a"] * d["f"] * (1 - d["i"])).round(2).tolist())\n',
        start: 'import veri\nimport pandas as pd\n\nkalem = veri.oku("anadolu_market", "order_items")\nsiparis = veri.oku("anadolu_market", "orders")\nurunler = veri.oku("anadolu_market", "products")\nmusteriler = veri.oku("anadolu_market", "customers")\nduz = (kalem.merge(siparis, on="order_id")\n            .merge(urunler[["product_id", "name", "category"]], on="product_id")\n            .merge(musteriler[["customer_id", "city", "segment"]], on="customer_id"))\n\ndef yildiz_semasi(duz):\n    # TODO: dim_urun, dim_musteri\n    # TODO: olgu (TarihKey, tutar)\n    return {}\n',
        sol: 'import veri\nimport pandas as pd\n\nkalem = veri.oku("anadolu_market", "order_items")\nsiparis = veri.oku("anadolu_market", "orders")\nurunler = veri.oku("anadolu_market", "products")\nmusteriler = veri.oku("anadolu_market", "customers")\nduz = (kalem.merge(siparis, on="order_id")\n            .merge(urunler[["product_id", "name", "category"]], on="product_id")\n            .merge(musteriler[["customer_id", "city", "segment"]], on="customer_id"))\ndef _boyut(df, sutunlar):\n    return df[sutunlar].drop_duplicates().sort_values(sutunlar[0]).reset_index(drop=True)\n\ndef yildiz_semasi(duz):\n    olgu = duz.copy()\n    olgu["TarihKey"] = olgu["order_date"].str.replace("-", "").astype(int)\n    olgu["tutar"] = (olgu["quantity"] * olgu["unit_price"] * (1 - olgu["discount"])).round(2)\n    olgu = olgu[["item_id", "order_id", "TarihKey", "product_id", "customer_id", "quantity", "tutar"]]\n    return {"olgu": olgu,\n            "dim_urun": _boyut(duz, ["product_id", "name", "category"]),\n            "dim_musteri": _boyut(duz, ["customer_id", "city", "segment"])}\n',
        tests: 'y = yildiz_semasi(duz)\nassert y["olgu"].shape == (1620, 7), f"Olgu 1620 satır × 7 sütun olmalı; gelen {y[\'olgu\'].shape}"\nassert y["dim_urun"].shape == (38, 3) and y["dim_urun"]["product_id"].is_unique, "Satılmış 38 ürün, tekil anahtar"\nassert len(y["dim_musteri"]) == 136 and y["dim_musteri"]["customer_id"].is_unique, "Sipariş veren 136 müşteri"\nassert round(float(y["olgu"]["tutar"].sum()), 2) == 1346189.85, "Toplam ciro 1346189.85 TL olmalı"\nassert y["olgu"]["TarihKey"].dtype.kind == "i" and y["olgu"]["TarihKey"].min() == 20220622\nassert y["dim_urun"].index.tolist() == list(range(38)), "İndeks sıfırlanmalı"\nassert "name" not in y["olgu"].columns, "Olgu tablosunda tanımlayıcı metin olmamalı"\n',
        hints: ['drop_duplicates boyut sütunlarında tekrarları atar.', 'Olguda yalnız anahtarlar ve ölçülebilir sayılar kalmalı.'],
        why: 'Bu, Power BI\'a veri hazırlamanın özüdür: tanımlayıcı metinler boyutlara, sayılar ve anahtarlar olguya. Model küçülür ve ilişkiler bire-çok kurulur.' },
      { t: 'code',
        id: 'excel-otomasyon-w3',
        stage: 'Kendin yaz',
        diff: 2,
        needs: ['pandas'],
        q: '<p>Model yüklenmeden önce bütünlük denetimi: <code>butunluk_raporu(olgu, boyutlar)</code>. <code>boyutlar</code> <code>{anahtar_sutun: boyut_df}</code> sözlüğü. Her anahtar için <code>{"tekil": bool, "yetim": int}</code> döndür: <code>tekil</code> boyuttaki anahtarın tekrarsız olup olmadığı, <code>yetim</code> olguda boyutta karşılığı olmayan <b>satır</b> sayısı (<code>int</code>). Test önce gerçek <code>kesit_bi</code> tablolarında, sonra bozulmuş bir kopyada çalışır.</p>',
        start: 'import veri\nimport pandas as pd\nsatis = veri.oku("kesit_bi", "Satislar")\nurun = veri.oku("kesit_bi", "Urunler")\nmusteri = veri.oku("kesit_bi", "Musteriler")\n\ndef butunluk_raporu(olgu, boyutlar):\n    pass\n',
        sol: 'import veri\nimport pandas as pd\nsatis = veri.oku("kesit_bi", "Satislar")\nurun = veri.oku("kesit_bi", "Urunler")\nmusteri = veri.oku("kesit_bi", "Musteriler")\n\ndef butunluk_raporu(olgu, boyutlar):\n    rapor = {}\n    for anahtar, boyut in boyutlar.items():\n        rapor[anahtar] = {"tekil": bool(boyut[anahtar].is_unique),\n                          "yetim": int((~olgu[anahtar].isin(boyut[anahtar])).sum())}\n    return rapor\n',
        tests: 'r = butunluk_raporu(satis, {"UrunNo": urun, "MusteriNo": musteri})\nassert r == {"UrunNo": {"tekil": True, "yetim": 0}, "MusteriNo": {"tekil": True, "yetim": 0}}, f"Gerçek model temiz olmalı; gelen {r}"\nbozuk_urun = pd.concat([urun, urun.head(2)])\nbozuk_satis = satis.copy()\nbozuk_satis.loc[:2, "MusteriNo"] = 9999\nr2 = butunluk_raporu(bozuk_satis, {"UrunNo": bozuk_urun, "MusteriNo": musteri})\nassert r2["UrunNo"]["tekil"] is False, "Tekrarlanan ürün anahtarı yakalanmalı"\nassert r2["MusteriNo"]["yetim"] == 3, "Boyutta olmayan 3 satış satırı yetim"\nassert type(r2["MusteriNo"]["yetim"]) is int\n',
        hints: ['Seri.is_unique tekillik verir.', '~olgu[anahtar].isin(boyut[anahtar]) yetim satırları işaretler; sum ile say.'],
        why: 'Tekil olmayan boyut anahtarı Power BI\'da ilişkiyi çoka-çok yapar ve toplamları bozar; yetim satırlar raporda "(Boş)" kategorisi olarak görünür. İkisini Python\'da yakalamak, sorunu pano kullanıcısından önce görmeni sağlar.' },
      { t: 'code',
        id: 'excel-otomasyon-w4',
        stage: 'Kendin yaz',
        diff: 2,
        needs: ['pandas'],
        q: '<p>Power BI ve Excel\'in sorunsuz okuyacağı CSV yaz: <code>pbi_csv(df)</code> metin döndürsün. Kurallar: indeks yazılmaz; ayraç virgül, ondalık nokta; <code>float</code> sütunlar 2 basamağa yuvarlanır; <code>datetime</code> sütunlar <code>YYYY-AA-GG</code> metnine çevrilir; eksik değerler boş hücre; satır sonu <code>\\n</code>. Orijinal DataFrame değişmemeli. Sonra <code>kanal_ozeti()</code> yaz: gerçek <code>kesit_bi.Satislar</code>\'dan iptal edilmemiş satışların kanal bazında <code>Tutar</code> toplamını <code>Kanal, Tutar</code> sütunlu DataFrame olarak (kanal adına göre sıralı) döndürsün.</p>',
        start: 'import veri\nimport pandas as pd\n\ndef pbi_csv(df):\n    pass\n\ndef kanal_ozeti():\n    pass\n',
        sol: 'import veri\nimport pandas as pd\n\ndef pbi_csv(df):\n    d = df.copy()\n    for c in d.columns:\n        if pd.api.types.is_datetime64_any_dtype(d[c]):\n            d[c] = d[c].dt.strftime("%Y-%m-%d")\n        elif pd.api.types.is_float_dtype(d[c]):\n            d[c] = d[c].round(2)\n    return d.to_csv(index=False, lineterminator="\\n")\n\ndef kanal_ozeti():\n    s = veri.oku("kesit_bi", "Satislar")\n    s = s[s["Durum"] != "İptal"]\n    return s.groupby("Kanal", as_index=False)["Tutar"].sum().sort_values("Kanal").reset_index(drop=True)\n',
        tests: 'df = pd.DataFrame({"Tarih": pd.to_datetime(["2024-01-31", None]), "Tutar": [1234.5678, None], "Adet": [1, 2]})\nassert pbi_csv(df) == "Tarih,Tutar,Adet\\n2024-01-31,1234.57,1\\n,,2\\n", f"Gelen {pbi_csv(df)!r}"\nassert df["Tutar"].iloc[0] == 1234.5678, "Orijinal tablo değişmemeli"\nk = kanal_ozeti()\nassert k["Kanal"].tolist() == sorted(k["Kanal"].tolist()) and len(k) == 3\nsatis = veri.oku("kesit_bi", "Satislar")\nassert abs(k["Tutar"].sum() - satis.loc[satis["Durum"] != "İptal", "Tutar"].sum()) < 1e-6\nmetin = pbi_csv(k)\nassert metin.startswith("Kanal,Tutar\\n") and metin.count("\\n") == 4\n',
        hints: ['pd.api.types.is_datetime64_any_dtype ve is_float_dtype sütun türünü sınar.', 'to_csv(index=False, lineterminator="\\n") metin döndürür (yol vermezsen).'],
        why: 'Power BI ve Excel bölge ayarına göre CSV\'yi farklı yorumlayabilir; ISO tarih ve ondalık nokta her ayarda aynı okunur. Excel\'de Türkçe karakter sorunu yaşarsan dosyaya yazarken encoding="utf-8-sig" kullan.' },
      { t: 'code',
        id: 'excel-otomasyon-w5',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 2,
        needs: ['pandas'],
        q: '<p>Hatayı bul ve düzelt. <code>bolge_cirosu(satis, musteri)</code> bölge bazında ciroyu döndürmeli. Analist müşteri boyutunu iki dışa aktarımın birleşiminden kurmuş ve bazı müşteriler iki kez gelmiş; panodaki toplam, satış tablosundaki toplamdan büyük çıkıyor. Ayrıca bölgesi boş olan 7 müşterinin satışları <code>groupby</code> tarafından sessizce atılıyor. Fonksiyonu boyutu tekilleştirecek, birleştirmede <code>validate="many_to_one"</code> kullanacak ve boş bölgeyi <code>"Bilinmiyor"</code> yapacak şekilde düzelt. Dönüş: <code>{bolge: tutar}</code> (2 basamak).</p>',
        start: 'import veri\nimport pandas as pd\n\nsatis = veri.oku("kesit_bi", "Satislar")\nmusteri = veri.oku("kesit_bi", "Musteriler")\nmusteri_iki_kaynak = pd.concat([musteri, musteri.sample(20, random_state=1)])\n\ndef bolge_cirosu(satis, musteri):\n    t = satis.merge(musteri[["MusteriNo", "Bolge"]], on="MusteriNo")\n    return t.groupby("Bolge")["Tutar"].sum().round(2).to_dict()\n',
        sol: 'import veri\nimport pandas as pd\n\nsatis = veri.oku("kesit_bi", "Satislar")\nmusteri = veri.oku("kesit_bi", "Musteriler")\nmusteri_iki_kaynak = pd.concat([musteri, musteri.sample(20, random_state=1)])\n\ndef bolge_cirosu(satis, musteri):\n    boyut = musteri[["MusteriNo", "Bolge"]].drop_duplicates("MusteriNo")\n    boyut = boyut.fillna({"Bolge": "Bilinmiyor"})\n    t = satis.merge(boyut, on="MusteriNo", validate="many_to_one")\n    return t.groupby("Bolge")["Tutar"].sum().round(2).to_dict()\n',
        tests: 'r = bolge_cirosu(satis, musteri_iki_kaynak)\nassert abs(sum(r.values()) - satis["Tutar"].sum()) < 0.05, f"Bölge toplamı satış toplamına ({satis[\'Tutar\'].sum():.2f}) eşit olmalı; gelen {sum(r.values()):.2f}"\nassert r["Marmara"] == 358854.55 and r["İç Anadolu"] == 377322.4, f"Gelen {r}"\nassert "Bilinmiyor" in r and r["Bilinmiyor"] > 0, "Bölgesi boş müşterilerin satışı Bilinmiyor altında görünmeli"\nassert r == bolge_cirosu(satis, musteri), "Tekrarlı ve temiz boyut aynı sonucu vermeli"\n',
        hints: ['Toplamın büyümesi satırların çoğaldığını, küçülmesi ise grupların atıldığını gösterir; groupby varsayılan olarak NaN anahtarı atar.', 'Boyutu drop_duplicates("MusteriNo") ile tekilleştir; merge\'e validate="many_to_one" ekle.'],
        why: 'Boyutta tekrarlanan anahtar, birleştirmede her eşleşen satış satırını çoğaltır (fan-out). validate parametresi bu hatayı sessiz bir rakam farkı yerine açık bir MergeError\'a çevirir; Power BI\'da aynı sorun çoka-çok ilişki uyarısı olarak görünür.' },
      { t: 'code',
        id: 'excel-otomasyon-w6',
        stage: 'Meydan okuma',
        diff: 3,
        needs: ['pandas'],
        q: '<p>Hedef gerçekleşme tablosu (Kesit Power BI\'daki "Hedef vs Gerçek" sayfasının verisi). <code>gerceklesme(yil)</code>: gerçek <code>kesit_bi</code> tablolarını kullan. <code>Hedefler</code> ay başı tarihli ve kategori bazında (<code>Tarih, Kategori, Hedef</code>). <code>Satislar</code>\'dan <b>iptal edilmemiş</b> satırları al, <code>Urunler</code> ile kategoriyi ekle, <code>YilAy</code> (<code>"2024-01"</code>) ve kategori bazında <code>Tutar</code> topla. Hedeflerle <b>sol birleştirme</b> yap (satış olmayan ay 0 sayılır). Verilen yıl için kategori bazında <code>toplam gerçek / toplam hedef</code> oranını 3 basamakla <code>{kategori: oran}</code> döndür.</p>',
        start: 'import veri\nimport pandas as pd\n\ndef gerceklesme(yil):\n    pass\n',
        sol: 'import veri\nimport pandas as pd\n\ndef gerceklesme(yil):\n    s = veri.oku("kesit_bi", "Satislar")\n    u = veri.oku("kesit_bi", "Urunler")\n    h = veri.oku("kesit_bi", "Hedefler")\n    s = s[s["Durum"] != "İptal"].merge(u[["UrunNo", "Kategori"]], on="UrunNo", validate="many_to_one")\n    s["YilAy"] = s["Tarih"].str[:7]\n    gercek = s.groupby(["YilAy", "Kategori"], as_index=False)["Tutar"].sum()\n    h = h.assign(YilAy=h["Tarih"].str[:7])\n    m = h.merge(gercek, on=["YilAy", "Kategori"], how="left").fillna({"Tutar": 0})\n    m = m[m["YilAy"].str.startswith(str(yil))]\n    ozet = m.groupby("Kategori")[["Tutar", "Hedef"]].sum()\n    return {k: round(float(r["Tutar"] / r["Hedef"]), 3) for k, r in ozet.iterrows()}\n',
        tests: 'r = gerceklesme(2024)\nassert r == {\'Elektronik\': 0.968, \'Ev & Yaşam\': 0.966, \'Giyim\': 0.995, \'Hediye\': 0.836, \'Kitap\': 1.002, \'Kozmetik\': 0.987, \'Spor\': 0.991}, f"2024 gerçekleşme oranları beklenenden farklı: {r}"\nassert r["Kitap"] > 1 > r["Hediye"], "Kitap hedefi aştı, Hediye geride kaldı"\nassert len(gerceklesme(2022)) == 7, "2022 için de 7 kategori"\n',
        hints: ['Ay anahtarı için Tarih metninin ilk 7 karakteri yeter.', 'Hedeflerden başlayan sol birleştirme, satış olmayan ayları da tutar; fillna ile 0 yap.', 'Oranı aylık oranların ortalaması olarak değil, toplamların oranı olarak hesapla.'],
        why: 'Oranların ortalaması küçük hedefli ayların etkisini büyütür; toplamların oranı doğru gerçekleşmedir (DAX\'taki DIVIDE(SUM, SUM) ile aynı). Hedeften başlayan sol birleştirme satış olmayan ayları sıfır olarak gösterir; iç birleştirme onları sessizce düşürürdü.' }
    ],
    faq: [
      { q: 'Power BI\'da Python betiği mi kullanmalıyım, yoksa veriyi Python\'da önceden mi hazırlamalıyım?',
        a: 'Küçük, kişisel raporlarda betik kaynağı pratiktir. Paylaşılan, zamanlanmış yenilenen raporlarda ise dönüşümü Python\'da (sürüm kontrollü bir betikte) yapıp çıktıyı CSV/Parquet ya da veri ambarı tablosu olarak Power BI\'a vermek daha sağlamdır: ağ geçidi ve Python ortamı bağımlılığı ortadan kalkar, hatalar test edilebilir.' },
      { q: 'Excel\'deki =PY ile openpyxl arasındaki fark nedir?',
        a: '=PY, Excel\'in içinde, Microsoft bulutunda çalışan Python\'dur; çalışma kitabındaki aralıkları okuyup sonucu hücreye yazar, yerel dosya ve ağ erişimi yoktur. openpyxl ise kendi bilgisayarında çalışan Python\'un Excel dosyasını dışarıdan okuyup yazmasıdır; otomasyon ve toplu rapor üretimi için kullanılır.' }
    ],
    mistakes: [
      { bad: 't = satis.merge(musteri, on="MusteriNo")',
        good: 't = satis.merge(musteri.drop_duplicates("MusteriNo"), on="MusteriNo", validate="many_to_one")',
        why: 'Tekrarlı boyut anahtarı birleştirmede satırları çoğaltır ve toplamları şişirir.' }
    ] }
);
})(window);
