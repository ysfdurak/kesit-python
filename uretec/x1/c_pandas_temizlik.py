import sys; sys.path.insert(0, '/tmp/claude-0/-home-claude/6c066959-3fcb-54bb-bdf1-c8ae148dfc4c/scratchpad/x1')
from lib import *

html = '<h2>Derinleş: gerçek kirli veriyle temizlik</h2>' \
'<p>Derste temizlik tekniklerini küçük, elle kurulmuş tablolarla gördün. Şimdi aynı teknikleri gerçek dağınıklıkta deneyelim. İki kaynak kullanacağız: <code>kirli_veri</code> seti (Kesit Power BI\'daki Power Query derslerinin kaynak dosyaları: elle doldurulmuş Excel sayfaları ve CRM dökümü) ve <code>anadolu_market</code> setindeki <code>raw_signups</code> tablosu (web formundan gelen 52 ham kayıt). Power Query\'de tıklayarak yaptığın her adımın pandas karşılığını burada kodla kuracaksın.</p>' \
'<div class="tbl-wrap"><table><tr><th>Tablo</th><th>Sorunlar</th><th>pandas çaresi</th></tr>' \
'<tr><td><code>kirli_veri/bayi</code></td><td>Üstte rapor başlığı, boş satır, yinelenen satır, " istanbul " gibi boşluklu şehir, "1.250,50" ve "-" tutarları, "bilinmiyor" tarihi</td><td><code>skiprows</code>, <code>dropna(how="all")</code>, <code>drop_duplicates</code>, <code>.str.strip</code>, <code>to_numeric(errors="coerce")</code></td></tr>' \
'<tr><td><code>kirli_veri/hedef</code></td><td>Aylar ayrı sütunlarda (geniş tablo)</td><td><code>melt</code></td></tr>' \
'<tr><td><code>kirli_veri/urun</code></td><td>Kategori yalnızca grubun ilk satırında; kod ve ad tek hücrede</td><td><code>ffill</code>, <code>str.split(n=1, expand=True)</code></td></tr>' \
'<tr><td><code>kirli_veri/musteri</code></td><td>İkinci satır asıl başlık, e-posta harf karmaşası, yinelenen numara, 30 Şubat</td><td><code>skiprows=1</code>, <code>str.lower</code>, <code>errors="coerce"</code></td></tr>' \
'<tr><td><code>anadolu_market/raw_signups</code></td><td>Aynı kişi iki kez, karışık harfli e-posta, "ISTANBUL" / "istanbul" / "İstanbul", iki tarih biçimi</td><td>Normalleştirilmiş anahtarla tekilleştirme, iki geçişli tarih çevirme</td></tr>' \
'</table></div>' \
'<h3>Önce bak, sonra temizle</h3><p>Temizliğe başlamadan ham tabloya bak. <code>bayi</code> dosyası Excel\'den geldiği için ilk satır <code>Column1..Column5</code> gibi anlamsız adlar, ikinci satır rapor başlığı, asıl başlık üçüncü satırda. <code>skiprows=2</code> ilk iki satırı atlar ve üçüncüyü başlık yapar.</p>' + py('''
import veri

ham = veri.oku("kirli_veri", "bayi")
print(ham.head(3))
df = veri.oku("kirli_veri", "bayi", skiprows=2)
print(df.columns.tolist())
print("tamamen boş satır:", int(df.isna().all(axis=1).sum()))
print("yinelenen satır:", int(df.duplicated().sum()))
''') + \
'<h3>Türkçe sayı ve Türkçe büyük harf</h3><p>"1.250,50" metninde nokta binlik, virgül ondalıktır. Önce noktaları sil, sonra virgülü noktaya çevir; "-" gibi sayı olmayan değerleri <code>to_numeric(errors="coerce")</code> eksik yapar. Şehirlerde ise iki tuzak var: baş/son boşluk ve Türkçe I/İ. "ISTANBUL".lower() "istanbul" verir ama "İstanbul".lower() noktalı bir birleşik karakter üretir; ikisi eşleşmez. Pratik çözüm, karşılaştırma için ASCII\'ye katlanmış bir <b>eşleme anahtarı</b> (matching key) üretmek ve görüntülenecek adı bir sözlükten almaktır.</p>' + py('''
import veri
import pandas as pd

OZEL = {"istanbul": "İstanbul", "izmir": "İzmir"}

def sehir_std(s):
    anahtar = (s.str.strip().str.replace("İ", "i").str.replace("I", "i").str.lower())
    return anahtar.map(lambda x: OZEL.get(x, x.capitalize()) if isinstance(x, str) else x)

df = veri.oku("kirli_veri", "bayi", skiprows=2).dropna(how="all").drop_duplicates()
df["Şehir"] = sehir_std(df["Şehir"])
metin = df["Tutar"].str.replace(".", "", regex=False).str.replace(",", ".", regex=False)
df["Tutar"] = pd.to_numeric(metin, errors="coerce")
print(df[["Bayi", "Şehir", "Tutar"]])
print("Toplam:", df["Tutar"].sum())
''') + \
'<h3>İki tarih biçimi bir arada</h3><p><code>raw_signups</code> tablosunda tarihlerin bir kısmı "29.07.2024", bir kısmı "2024-02-10" biçiminde. Tek bir <code>format</code> ile çevirirsen diğer biçim NaT olur. Güvenli yol iki geçiştir: önce birinci biçimi dene, kalan boşlukları ikinci biçimle doldur. Her geçişte <code>format</code> açıkça verildiği için gün ile ay asla yer değiştirmez.</p>' + py('''
import veri
import pandas as pd

rs = veri.oku("anadolu_market", "raw_signups")
t = rs["signup_date"].str.strip()
tarih = pd.to_datetime(t, format="%d.%m.%Y", errors="coerce")
tarih = tarih.fillna(pd.to_datetime(t, format="%Y-%m-%d", errors="coerce"))
print("çevrilemeyen:", int(tarih.isna().sum()))

rs["email"] = rs["email"].str.strip().str.lower()
print("satır:", len(rs), "| farklı id:", rs["id"].nunique(), "| farklı e-posta:", rs["email"].nunique())
''') + \
'<div class="warn"><b>Hangi anahtarla tekilleştiriyorsun?</b>Formdaki <code>id</code> 40 farklı değer gösteriyor ama normalleştirilmiş e-posta 39. Çünkü "can.kaya@gmail.com" iki farklı id ile iki kez kayıt olmuş. Tekilleştirme anahtarını iş kuralı belirler: "aynı e-posta aynı kişidir" kuralını iş birimiyle teyit et ve raporuna yaz.</div>' \
'<h3>Geniş tabloyu uzatmak ve gruplu listeyi doldurmak</h3><p>Finans ekibinin hedef dosyası her ayı ayrı sütunda tutar. Grafikte ay eksenine koymak ya da satışlarla birleştirmek için <b>uzun biçim</b> gerekir: <code>melt</code>. Satın alma listesinde kategori yalnızca grubun ilk satırında yazılıdır; <code>ffill</code> bir üstteki değeri aşağı taşır.</p>' + py('''
import veri

hedef = veri.oku("kirli_veri", "hedef")
uzun = hedef.melt(id_vars="Kategori", var_name="Ay", value_name="Hedef")
print(uzun.head(5))
urun = veri.oku("kirli_veri", "urun")
urun["Kategori"] = urun["Kategori"].ffill()
print(urun.head(4))
''') + \
'<div class="note"><b>Gerçek işte</b>Temizlik adımlarını tek seferlik hücrelere dağıtma; her kaynak için bir fonksiyon yaz (<code>bayi_temizle</code>, <code>signup_temizle</code>) ve sonunda bir <b>kalite raporu</b> üret: satır sayısı, tam tekrar, anahtar tekrarı, sütun başına eksik. Bu rapor her çalıştırmada aynı biçimde çıktığında, kaynak dosya bozulduğunda bunu ilk sen fark edersin.</div>'

ex = [
 dict(t='predict', stage='Kodu oku', q='Elle doldurulmuş bayi raporu okunuyor. Bu kod ne yazdırır?', needs=['pandas'],
      code='import veri\nham = veri.oku("kirli_veri", "bayi")\ndf = veri.oku("kirli_veri", "bayi", skiprows=2)\nprint(ham.columns[0], df.columns[0])\nprint(len(df), len(df.dropna(how="all").drop_duplicates()))\n',
      o=['Column1 Bayi\n10 8', 'Column1 Bayi\n10 9', 'Bayi Bayi\n12 8', 'Column1 Bayi\n12 10'], a=0,
      why='Ham dosyada ilk satır Column1.. adları; skiprows=2 ile başlık "Bayi, Şehir, ..." olur ve 10 veri satırı kalır. Bunlardan biri tamamen boş, biri yineleme; geriye 8 satır kalır.'),
 dict(t='predict', stage='Kodu oku', q='Ham form kayıtlarında yineleme sayılıyor. Bu kod ne yazdırır?', needs=['pandas'],
      code='import veri\ndf = veri.oku("anadolu_market", "raw_signups")\nprint(len(df), df.duplicated().sum(), df["id"].duplicated().sum())\n',
      o=['52 5 12', '52 12 5', '52 0 12', '40 5 12'], a=0,
      why='duplicated() yalnızca TÜM sütunları aynı olan satırları sayar (5). Aynı id\'nin e-postası farklı harfle yazılmışsa satır tam tekrar sayılmaz; id\'ye göre 12 tekrar vardır.'),
 dict(t='order', stage='Kodu oku', q='<p>Gruplu ürün listesinde kategoriyi aşağı doldurup kodu addan ayıran ve kategori başına toplam fiyatı yazdıran programın satırlarını sırala.</p>', needs=['pandas'],
      lines=['import veri', 'urun = veri.oku("kirli_veri", "urun")', 'urun["Kategori"] = urun["Kategori"].ffill()',
             'parca = urun["Ürün Kodu ve Adı"].str.split(" ", n=1, expand=True)', 'urun["Kod"], urun["Ad"] = parca[0], parca[1]',
             'print(urun["Kod"].tolist()[:2], urun.groupby("Kategori")["Fiyat"].sum().to_dict())'],
      expect="['E01', 'E02'] {'Elektronik': 5447, 'Kitap': 585, 'Spor': 4157}\n",
      hint='Ayırma işlemi parca değişkenini üretir; Kod ve Ad sütunları ona bağlıdır.',
      why='ffill olmadan Kategori\'si boş satırlar gruplamada düşer. split(n=1) yalnızca ilk boşluktan böler; "Suç ve Ceza" adı bütün kalır.'),
 dict(t='code', id='pandas-temizlik-v1', stage='Rehberli', diff=2, needs=['pandas'],
      q='<p><code>bayi_temizle()</code> fonksiyonunu yaz: <code>kirli_veri/bayi</code> tablosunu <code>skiprows=2</code> ile oku; tamamen boş satırları ve yinelenen satırları at, index\'i sıfırla. Şehri <code>sehir_std</code> ile standartlaştır (verildi). <code>Tutar</code>\'ı Türkçe biçimden <code>float</code>\'a çevir ("-" eksik olsun). <code>Tarih</code>\'i <code>"%d.%m.%Y"</code> biçimiyle datetime yap (bozuklar NaT). Temiz DataFrame\'i döndür.</p>',
      guide=['veri.oku("kirli_veri", "bayi", skiprows=2) ile oku.', 'dropna(how="all"), drop_duplicates() ve reset_index(drop=True) zincirle.', 'Şehir sütununa sehir_std uygula.', 'Tutar: noktayı sil, virgülü noktaya çevir (regex=False), pd.to_numeric(errors="coerce").', 'Tarih: pd.to_datetime(..., format="%d.%m.%Y", errors="coerce").'],
      example='import pandas as pd\ns = pd.Series(["2.040,00", "980", "-"])\nm = s.str.replace(".", "", regex=False).str.replace(",", ".", regex=False)\nprint(pd.to_numeric(m, errors="coerce").tolist())\n',
      start='import veri\nimport pandas as pd\n\nOZEL = {"istanbul": "İstanbul", "izmir": "İzmir"}\n\ndef sehir_std(s):\n    k = s.str.strip().str.replace("İ", "i").str.replace("I", "i").str.lower()\n    return k.map(lambda x: OZEL.get(x, x.capitalize()) if isinstance(x, str) else x)\n\ndef bayi_temizle():\n    df = veri.oku("kirli_veri", "bayi", skiprows=2)\n    # TODO: boş ve yinelenen satırları at, index\'i sıfırla\n    # TODO: Şehir, Tutar, Tarih sütunlarını düzelt\n    return df\n',
      sol='import veri\nimport pandas as pd\n\nOZEL = {"istanbul": "İstanbul", "izmir": "İzmir"}\n\ndef sehir_std(s):\n    k = s.str.strip().str.replace("İ", "i").str.replace("I", "i").str.lower()\n    return k.map(lambda x: OZEL.get(x, x.capitalize()) if isinstance(x, str) else x)\n\ndef bayi_temizle():\n    df = veri.oku("kirli_veri", "bayi", skiprows=2)\n    df = df.dropna(how="all").drop_duplicates().reset_index(drop=True)\n    df["Şehir"] = sehir_std(df["Şehir"])\n    metin = df["Tutar"].str.replace(".", "", regex=False).str.replace(",", ".", regex=False)\n    df["Tutar"] = pd.to_numeric(metin, errors="coerce")\n    df["Tarih"] = pd.to_datetime(df["Tarih"], format="%d.%m.%Y", errors="coerce")\n    return df\n',
      tests='d = bayi_temizle()\nassert len(d) == 8, f"8 satır kalmalı (boş ve yinelenen atılınca), {len(d)} geldi"\nassert list(d.index) == list(range(8)), "Index 0..7 olmalı (reset_index)"\nassert abs(d["Tutar"].sum() - 8466.5) < 1e-6, f"Tutar toplamı 8466.5 olmalı, {d[\'Tutar\'].sum()} geldi"\nassert int(d["Tutar"].isna().sum()) == 1, "Yalnızca \'-\' olan tutar eksik olmalı"\nassert int(d["Tarih"].isna().sum()) == 1, "\'bilinmiyor\' tarihi NaT olmalı"\nassert sorted(d["Şehir"].unique()) == ["Ankara", "Antalya", "Bursa", "Konya", "Trabzon", "İstanbul", "İzmir"], "Şehirler standart olmalı"\nassert d.loc[0, "Tarih"] == pd.Timestamp("2024-01-05"), "05.01.2024 = 5 Ocak olmalı (gün önce)"\n',
      hints=['Sıra önemli: önce satır atma, sonra sütun dönüşümleri.', 'Noktayı silerken regex=False ver; yoksa nokta "her karakter" demektir.', 'pd.to_numeric(metin, errors="coerce") "-" değerini NaN yapar.'],
      why='Temizlik sonrası 8 bayi satırı kalır; Alsancak\'ın tutarı ve Selçuklu\'nun tarihi gerçekten bilinmediği için eksik bırakılır, uydurulmaz.'),
 dict(t='code', id='pandas-temizlik-v2', stage='Rehberli', diff=2, needs=['pandas'],
      q='<p><code>signup_temizle()</code>: <code>anadolu_market/raw_signups</code> tablosunu oku. <code>email</code>\'i kırp ve küçült; <code>city</code>\'yi <code>sehir_std</code> ile standartlaştır, boşları <code>"Bilinmiyor"</code> yap; <code>signup_date</code>\'i iki biçimi de (<code>"%d.%m.%Y"</code> ve <code>"%Y-%m-%d"</code>) tanıyarak datetime\'a çevir. Sonra <b>e-postaya göre</b> ilk kaydı tutarak tekilleştir, index\'i sıfırla ve döndür.</p>',
      guide=['email: .str.strip().str.lower()', 'city: sehir_std(...) sonra fillna("Bilinmiyor")', 'Tarih: önce "%d.%m.%Y" ile errors="coerce", sonra kalan NaT\'ları "%Y-%m-%d" ile fillna', 'drop_duplicates(subset="email", keep="first").reset_index(drop=True)'],
      example='import pandas as pd\nt = pd.Series(["03.04.2024", "2024-05-06"])\nx = pd.to_datetime(t, format="%d.%m.%Y", errors="coerce")\nx = x.fillna(pd.to_datetime(t, format="%Y-%m-%d", errors="coerce"))\nprint(x.dt.strftime("%Y-%m-%d").tolist())\n',
      start='import veri\nimport pandas as pd\n\nOZEL = {"istanbul": "İstanbul", "izmir": "İzmir"}\n\ndef sehir_std(s):\n    k = s.str.strip().str.replace("İ", "i").str.replace("I", "i").str.lower()\n    return k.map(lambda x: OZEL.get(x, x.capitalize()) if isinstance(x, str) else x)\n\ndef signup_temizle():\n    df = veri.oku("anadolu_market", "raw_signups")\n    # TODO: email, city, signup_date\n    # TODO: e-postaya göre tekilleştir\n    return df\n',
      sol='import veri\nimport pandas as pd\n\nOZEL = {"istanbul": "İstanbul", "izmir": "İzmir"}\n\ndef sehir_std(s):\n    k = s.str.strip().str.replace("İ", "i").str.replace("I", "i").str.lower()\n    return k.map(lambda x: OZEL.get(x, x.capitalize()) if isinstance(x, str) else x)\n\ndef signup_temizle():\n    df = veri.oku("anadolu_market", "raw_signups")\n    df["email"] = df["email"].str.strip().str.lower()\n    df["city"] = sehir_std(df["city"]).fillna("Bilinmiyor")\n    t = df["signup_date"].str.strip()\n    tarih = pd.to_datetime(t, format="%d.%m.%Y", errors="coerce")\n    df["signup_date"] = tarih.fillna(pd.to_datetime(t, format="%Y-%m-%d", errors="coerce"))\n    return df.drop_duplicates(subset="email", keep="first").reset_index(drop=True)\n',
      tests='d = signup_temizle()\nassert len(d) == 39, f"39 tekil e-posta kalmalı, {len(d)} geldi"\nassert d["email"].is_unique, "E-postalar tekil olmalı"\nassert int(d["signup_date"].isna().sum()) == 0, "Tüm tarihler çevrilmeli (iki biçim)"\nassert d["city"].value_counts().to_dict() == {"İstanbul": 17, "İzmir": 9, "Ankara": 7, "Bilinmiyor": 6}, f"Şehir dağılımı farklı: {d[\'city\'].value_counts().to_dict()}"\nassert d.loc[0, "signup_date"] == pd.Timestamp("2024-07-29"), "29.07.2024 doğru çevrilmeli"\nassert (d["email"] == d["email"].str.lower()).all(), "E-postalar küçük harf olmalı"\n',
      hints=['Tekilleştirmeden ÖNCE e-postayı normalleştir; yoksa "CEREN..." ile "ceren..." farklı sayılır.', 'İkinci biçimi yalnızca birincinin başaramadığı yerlere uygula: fillna.', 'drop_duplicates(subset="email", keep="first")'],
      why='Normalleştirmeden tekilleştirme yapılırsa harf farkları kopyaları gizler. 52 ham kayıt 39 kişiye iner; İstanbul\'un üç farklı yazımı tek değerde birleşir.'),
 dict(t='code', id='pandas-temizlik-v3', stage='Kendin yaz', diff=2, needs=['pandas'],
      q='<p><code>hedef_uzun()</code>: <code>kirli_veri/hedef</code> geniş tablosunu <code>Kategori</code>, <code>Ay</code>, <code>Hedef</code> sütunlu uzun biçime çevir. Hedefi boş olan satırları at, <code>Hedef</code>\'i <code>int</code> yap ve index\'i sıfırla. Ay sırası dosyadaki sütun sırası (Oca, Şub, Mar) olsun.</p>',
      start='import veri\n\ndef hedef_uzun():\n    pass\n',
      sol='import veri\n\ndef hedef_uzun():\n    h = veri.oku("kirli_veri", "hedef")\n    u = h.melt(id_vars="Kategori", var_name="Ay", value_name="Hedef")\n    u = u.dropna(subset=["Hedef"]).reset_index(drop=True)\n    u["Hedef"] = u["Hedef"].astype(int)\n    return u\n',
      tests='u = hedef_uzun()\nassert list(u.columns) == ["Kategori", "Ay", "Hedef"], f"Sütunlar farklı: {list(u.columns)}"\nassert len(u) == 11, f"4 kategori x 3 ay = 12, Giyim/Mar boş: 11 satır olmalı, {len(u)} geldi"\nassert int(u["Hedef"].sum()) == 272400, "Hedef toplamı 272400 olmalı"\nassert u["Ay"].unique().tolist() == ["Oca", "Şub", "Mar"], "Ay sırası Oca, Şub, Mar olmalı"\nassert str(u["Hedef"].dtype).startswith("int"), "Hedef tamsayı olmalı"\n',
      hints=['melt(id_vars="Kategori", var_name="Ay", value_name="Hedef")', 'Boş Mar hücresi NaN olarak gelir; dropna(subset=["Hedef"]) ile at, sonra astype(int).'],
      why='Uzun biçim, hedefi tarih ve kategoriyle birleştirmeyi ve grafiği kolaylaştırır. Power Query\'deki "Unpivot Columns" adımının karşılığı melt\'tir.'),
 dict(t='code', id='pandas-temizlik-v4', stage='Kendin yaz', diff=1, needs=['pandas'],
      q='<p><code>urun_ayir()</code>: <code>kirli_veri/urun</code> tablosunda boş kategorileri yukarıdan doldur; <code>"Ürün Kodu ve Adı"</code> sütununu ilk boşluktan <code>Kod</code> ve <code>Ad</code> sütunlarına ayır ve eski sütunu sil. Sonuç sütunları: <code>Kategori, Fiyat, Kod, Ad</code>.</p>',
      start='import veri\n\ndef urun_ayir():\n    pass\n',
      sol='import veri\n\ndef urun_ayir():\n    u = veri.oku("kirli_veri", "urun")\n    u["Kategori"] = u["Kategori"].ffill()\n    parca = u["Ürün Kodu ve Adı"].str.split(" ", n=1, expand=True)\n    u["Kod"] = parca[0]\n    u["Ad"] = parca[1]\n    return u.drop(columns="Ürün Kodu ve Adı")\n',
      tests='u = urun_ayir()\nassert list(u.columns) == ["Kategori", "Fiyat", "Kod", "Ad"], f"Sütunlar farklı: {list(u.columns)}"\nassert int(u["Kategori"].isna().sum()) == 0, "Boş kategori kalmamalı (ffill)"\nassert u.loc[3, "Ad"] == "Suç ve Ceza", "Ad yalnızca ilk boşluktan ayrılmalı"\nassert u["Kod"].tolist()[-1] == "S03", "Son ürünün kodu S03"\nassert u.groupby("Kategori")["Fiyat"].sum().to_dict() == {"Elektronik": 5447, "Kitap": 585, "Spor": 4157}, "Kategori toplamları tutmalı"\n',
      hints=['ffill() bir üstteki dolu değeri aşağı taşır.', 'str.split(" ", n=1, expand=True) iki sütunlu DataFrame döndürür.'],
      why='Gruplu Excel listelerinde kategori bir kez yazılır; ffill bunu tabloya yayar. n=1 vermezsen çok kelimeli adlar parçalanır.'),
 dict(t='code', id='pandas-temizlik-v5', stage='Hata avı', kind='bug', diff=2, needs=['pandas'],
      q='<p>Hatayı bul ve düzelt. <code>musteri_temizle()</code> CRM dökümünü (<code>kirli_veri/musteri</code>) temizlemeli: asıl başlık ikinci satırda; e-postalar küçük harfli olmalı; geçersiz tarih (30 Şubat) NaT olmalı; aynı <code>MusteriNo</code> bir kez kalmalı (ilki). Şu an fonksiyon çöküyor, düzeltilince de 102 iki kez kalıyor.</p>',
      start='import veri\nimport pandas as pd\n\ndef musteri_temizle():\n    df = veri.oku("kirli_veri", "musteri", skiprows=1)\n    df["KayitTarihi"] = pd.to_datetime(df["KayitTarihi"])\n    df = df.drop_duplicates()\n    df["E-posta"] = df["E-posta"].str.lower()\n    return df.reset_index(drop=True)\n',
      sol='import veri\nimport pandas as pd\n\ndef musteri_temizle():\n    df = veri.oku("kirli_veri", "musteri", skiprows=1)\n    df["KayitTarihi"] = pd.to_datetime(df["KayitTarihi"], format="%Y-%m-%d", errors="coerce")\n    df["E-posta"] = df["E-posta"].str.strip().str.lower()\n    df = df.drop_duplicates(subset="MusteriNo", keep="first")\n    return df.reset_index(drop=True)\n',
      tests='d = musteri_temizle()\nassert len(d) == 5, f"5 tekil müşteri kalmalı, {len(d)} geldi"\nassert d["MusteriNo"].is_unique, "MusteriNo tekil olmalı"\nassert int(d["KayitTarihi"].isna().sum()) == 1, "2024-02-30 NaT olmalı"\nassert d.loc[0, "E-posta"] == "ayse.yilmaz@gmail.com", "E-posta küçük harfe çevrilmeli"\nassert pd.isna(d.loc[3, "E-posta"]), "Boş e-posta boş kalmalı (uydurma değer yok)"\n',
      hints=['30 Şubat yok: to_datetime\'a errors="coerce" ver.', 'drop_duplicates() tüm sütunları karşılaştırır; e-posta harfi farklıysa kopya yakalanmaz.', 'Önce normalleştir, sonra subset="MusteriNo" ile tekilleştir.'],
      why='İki hata vardı: geçersiz tarih tüm hattı durduruyordu ve tekilleştirme hem yanlış sırada (normalleştirmeden önce) hem yanlış anahtarla (tüm satır) yapılıyordu.'),
 dict(t='code', id='pandas-temizlik-v6', stage='Meydan okuma', diff=3, needs=['pandas'],
      q='<p>Yeniden kullanılabilir bir kalite raporu yaz. <code>kalite_raporu(df, anahtar, eposta)</code> şu anahtarlarla sözlük döndürsün (sayılar <code>int</code>):</p><ul><li><code>satir</code>: satır sayısı</li><li><code>tam_tekrar</code>: tüm sütunları aynı olan tekrar satır sayısı</li><li><code>anahtar_tekrar</code>: <code>anahtar</code> sütununda tekrar eden satır sayısı</li><li><code>farkli_eposta</code>: <code>eposta</code> sütunu kırpılıp küçültüldükten sonra farklı (boş olmayan) değer sayısı</li><li><code>eksik</code>: yalnızca eksiği olan sütunlar için <code>{sütun: sayı}</code></li></ul><p>Testler <code>raw_signups</code> ve <code>kirli_veri/musteri</code> (skiprows=1) ile çağırır; fonksiyon girdiyi değiştirmemeli.</p>',
      start='import veri\n\ndef kalite_raporu(df, anahtar, eposta):\n    pass\n',
      sol='import veri\n\ndef kalite_raporu(df, anahtar, eposta):\n    e = df[eposta].str.strip().str.lower()\n    eksik = df.isna().sum()\n    return {\n        "satir": int(len(df)),\n        "tam_tekrar": int(df.duplicated().sum()),\n        "anahtar_tekrar": int(df[anahtar].duplicated().sum()),\n        "farkli_eposta": int(e.nunique()),\n        "eksik": {k: int(v) for k, v in eksik.items() if v > 0},\n    }\n',
      tests='rs = veri.oku("anadolu_market", "raw_signups")\nkopya = rs.copy()\nr = kalite_raporu(rs, "id", "email")\nassert r == {"satir": 52, "tam_tekrar": 5, "anahtar_tekrar": 12, "farkli_eposta": 39, "eksik": {"city": 10}}, f"raw_signups raporu farklı: {r}"\nassert rs.equals(kopya), "Girdi DataFrame değiştirilmemeli"\nm = veri.oku("kirli_veri", "musteri", skiprows=1)\nr2 = kalite_raporu(m, "MusteriNo", "E-posta")\nassert r2 == {"satir": 6, "tam_tekrar": 0, "anahtar_tekrar": 1, "farkli_eposta": 4, "eksik": {"E-posta": 1}}, f"musteri raporu farklı: {r2}"\n',
      hints=['nunique() eksik değerleri saymaz.', 'Girdiyi değiştirmemek için normalleştirilmiş e-postayı ayrı bir değişkende tut, df\'e yazma.', 'eksik: {k: int(v) for k, v in df.isna().sum().items() if v > 0}'],
      why='Aynı rapor iki farklı kaynakta çalışıyor: raw_signups\'ta 5 tam tekrar ama 12 id tekrarı var; fark, harf karmaşasının kopyaları gizlemesinden geliyor. Bu tür rapor veri hattının "sağlık kontrolü"dür.'),
]

faq = [
 dict(q='Power Query\'de yaptığım temizliği neden pandas\'ta tekrar yazayım?', a='İkisi aynı mantığı farklı ortamlarda uygular. Power Query rapor dosyasının içinde kalır; pandas betiği ise zamanlanabilir, test edilebilir ve aynı temiz tabloyu Power BI, Excel ya da bir veritabanı için üretebilir. Ekipler çoğu zaman ağır temizliği Python\'da yapıp Power BI\'a temiz CSV/Parquet verir.'),
 dict(q='Eksik tutarı (Alsancak Bayi, "-") 0 ile doldursam olmaz mı?', a='"-" çoğu zaman "bilgi yok" demektir, "satış sıfır" değil. 0 yazarsan ortalama ve toplam yanlış düşer. Eksik bırak, raporda kaç değerin eksik olduğunu belirt; doldurman gerekiyorsa kuralı iş birimiyle konuş.'),
]

mistakes = [
 dict(bad='df = df.drop_duplicates()\ndf["email"] = df["email"].str.lower()', good='df["email"] = df["email"].str.strip().str.lower()\ndf = df.drop_duplicates(subset="email")', why='Normalleştirmeden önce tekilleştirirsen harf ya da boşluk farkı olan kopyalar kalır.'),
]

emit('pandas-temizlik', dict(id='pandas-temizlik', min=25, needs=['pandas'], html=html, ex=ex, faq=faq, mistakes=mistakes), 'Gerçek kirli veriyle temizlik')
