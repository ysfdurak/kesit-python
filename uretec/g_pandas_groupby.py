from genlib import *

CSV = '''import io
import pandas as pd

CSV = """siparis_id,musteri,sehir,kategori,adet,fiyat
1,Ayşe,İstanbul,Gıda,3,45.5
2,Mehmet,Ankara,Elektronik,1,899.0
3,Ayşe,İstanbul,Gıda,10,12.75
4,Zeynep,,Kozmetik,2,129.9
5,Ali,Ankara,Gıda,6,45.5
6,Zeynep,İzmir,Elektronik,1,1250.0
7,Ayşe,İstanbul,Kozmetik,1,
"""
df = pd.read_csv(io.StringIO(CSV))
df["tutar"] = df["adet"] * df["fiyat"]
'''

html = (
'<h2>Derinleş: groupby\'ın ince ayarları ve güvenli birleştirme</h2>'
'<p>groupby, pivot ve merge ile raporun iskeletini kurabiliyorsun. Bu bölüm, raporda rakamları <b>sessizce</b> yanlış çıkaran ayrıntılara odaklanıyor: eksik anahtarlı satırların kaybolması, <code>count</code> ile <code>size</code> farkı, çoklu özetten gelen iki katlı sütun adları, ağırlıklı ortalama ve farklı adlı anahtarlarla birleştirme. Pencere fonksiyonları, MultiIndex ve geniş-uzun dönüşüm "İleri pandas" dersinde, zaman kovaları "Zaman serisi" dersinde ayrıntılı ele alınıyor.</p>'
'<h3>Grubun içine bakmak: size, count, nunique, first</h3>'
'<p>groupby nesnesi bir döngüde gezilebilir: her adımda grup anahtarı ve o gruba ait alt tablo gelir. Hata ayıklarken ya da her grup için ayrı dosya üretirken işe yarar. Özetlerde ise dört sayım birbirine karıştırılır:</p>'
'<div class="tbl-wrap"><table><tr><th>Yöntem</th><th>Ne sayar</th><th>Eksik değer</th></tr>'
'<tr><td><code>size()</code></td><td>Gruptaki satır sayısı</td><td>Satır sayılır</td></tr>'
'<tr><td><code>count()</code></td><td>Sütunda dolu hücre sayısı</td><td>NaN sayılmaz</td></tr>'
'<tr><td><code>nunique()</code></td><td>Farklı değer sayısı (tekil müşteri)</td><td>NaN sayılmaz</td></tr>'
'<tr><td><code>first()</code> / <code>last()</code></td><td>Gruptaki ilk / son dolu değer</td><td>NaN atlanır</td></tr>'
'</table></div>'
+ py(CSV + '''
for sehir, grup in df.groupby("sehir"):
    print(sehir, len(grup), grup["siparis_id"].tolist())

g = df.groupby("sehir")
print(g.size().to_dict())                 # satır sayısı
print(g["fiyat"].count().to_dict())       # dolu fiyat sayısı
print(g["musteri"].nunique().to_dict())   # tekil müşteri
print(g.get_group("Ankara")["tutar"].sum())''') +
'<p>Çıktıya dikkat: 4 numaralı siparişin şehri boş ve hiçbir grupta görünmüyor. İstanbul\'da 3 satır var ama 2 dolu fiyat var.</p>'
'<h3>Eksik anahtar: dropna=False</h3>'
'<p>groupby varsayılan olarak anahtarı eksik (NaN) olan satırları <b>atar</b>. Şehri girilmemiş siparişlerin cirosu raporda yok olur ve toplamlar tutmaz. Ya anahtarı önce doldur (<code>fillna("Bilinmiyor")</code>) ya da <code>dropna=False</code> ver. Raporun en altına "gruplar toplamı = genel toplam" kontrolü koymak bu hatayı hemen yakalar.</p>'
+ py(CSV + '''
print(df.groupby("sehir")["tutar"].sum().sum(), "≠", df["tutar"].sum())
print(df.groupby("sehir", dropna=False)["tutar"].sum())
rapor = df.assign(sehir=df["sehir"].fillna("Bilinmiyor")).groupby("sehir")["tutar"].sum()
assert abs(rapor.sum() - df["tutar"].sum()) < 1e-9, "toplam tutmuyor"
print(rapor.round(2).to_dict())''') +
'<h3>filter: koşulu sağlayan grupları tut</h3>'
'<p><code>filter(fonksiyon)</code> her grubu fonksiyona verir; True dönen grupların <b>satırlarını</b> (özet değil) olduğu gibi döndürür. "En az 2 sipariş vermiş müşterilerin siparişleri" ya da "cirosu 500 TL üstü şehirlerin satırları" böyle yazılır. Aynı sonucu transform ile maske kurarak da alabilirsin; büyük veride transform genellikle daha hızlıdır.</p>'
+ py(CSV + '''
sadik = df.groupby("musteri").filter(lambda g: len(g) >= 2)
print(sadik["musteri"].unique().tolist())

maske = df.groupby("musteri")["siparis_id"].transform("size") >= 2
print(df[maske]["siparis_id"].tolist())''') +
'<h3>Çoklu özet, düz sütun adları ve ağırlıklı ortalama</h3>'
'<p><code>agg(["sum", "mean"])</code> iki katlı (MultiIndex) sütun adı üretir: <code>("tutar", "sum")</code>. Excel\'e yazmadan önce bunları <code>"tutar_sum"</code> gibi düzleştirmek gerekir. Adlandırılmış agg (<code>ciro=("tutar", "sum")</code>) baştan düz ad verdiği için çoğu zaman daha iyidir. Hazır fonksiyon yetmediğinde agg\'a kendi fonksiyonunu verebilirsin; ama <b>ağırlıklı ortalama</b> gibi iki sütun gerektiren özetleri ayrı toplamlarla hesaplamak hem hızlı hem doğrudur: ortalama birim fiyat = toplam tutar / toplam adet.</p>'
+ py(CSV + '''
coklu = df.groupby("kategori")["tutar"].agg(["sum", "mean", "max"])
print(coklu.columns.tolist())
iki = df.groupby("kategori").agg({"tutar": ["sum", "max"], "adet": ["sum"]})
iki.columns = ["_".join(c) for c in iki.columns]
print(iki.reset_index())

# Ağırlıklı ortalama fiyat: düz ortalama yanıltır
toplam = df.dropna(subset=["fiyat"]).groupby("kategori")[["tutar", "adet"]].sum()
print((toplam["tutar"] / toplam["adet"]).round(2).to_dict())
print(df.groupby("kategori")["fiyat"].mean().round(2).to_dict())   # düz ortalama
print(df.groupby("kategori")["fiyat"].agg(lambda s: s.max() - s.min()).to_dict())   # özel fonksiyon''') +
'<h3>Oranlar: satır yüzdeleri</h3>'
'<p>"Her şehirde cironun yüzde kaçı hangi kategoriden?" sorusu bir pivotun her satırını kendi toplamına bölmektir: <code>pv.div(pv.sum(axis=1), axis=0)</code>. Sayımlar için <code>pd.crosstab(..., normalize="index")</code> aynı işi tek adımda yapar.</p>'
'<h3>merge ayrıntıları</h3>'
'<div class="tbl-wrap"><table><tr><th>Durum</th><th>Çözüm</th></tr>'
'<tr><td>Anahtar sütunların adı farklı (<code>musteri_id</code> ve <code>id</code>)</td><td><code>left_on="musteri_id", right_on="id"</code>, sonra <code>drop(columns="id")</code></td></tr>'
'<tr><td>İki tabloda aynı adlı başka sütun var</td><td>Otomatik <code>_x</code>/<code>_y</code> eki; anlamlı ad için <code>suffixes=("_siparis", "_hedef")</code></td></tr>'
'<tr><td>Anahtar iki sütundan oluşuyor</td><td><code>on=["sehir", "ay"]</code></td></tr>'
'<tr><td>Sağ tablonun anahtarı index\'te</td><td><code>df.join(diger, on="musteri_id")</code> ya da <code>right_index=True</code></td></tr>'
'<tr><td>Aylık dosyaları birleştirip kaynağı korumak</td><td><code>pd.concat([mart, nisan], keys=["Mart", "Nisan"])</code></td></tr>'
'</table></div>'
+ py('''import pandas as pd

hedef = pd.DataFrame({"sehir": ["Ankara", "İzmir"], "ay": [3, 3], "tutar": [1000.0, 1500.0]})
gercek = pd.DataFrame({"sehir": ["Ankara", "İzmir", "Ankara"], "ay": [3, 3, 4], "tutar": [1172.0, 1250.0, 900.0]})
k = gercek.merge(hedef, on=["sehir", "ay"], how="left", suffixes=("_gercek", "_hedef"))
k["gerceklesme"] = (k["tutar_gercek"] / k["tutar_hedef"] * 100).round(1)
print(k)

pv = pd.DataFrame({"Gıda": [300.0, 50.0], "Elektronik": [700.0, 150.0]}, index=["Ankara", "İzmir"])
print(pv.div(pv.sum(axis=1), axis=0).mul(100).round(1))''') +
'<div class="tip"><b>Rapor sonu kontrolleri</b>Her özet tablonun altına iki satırlık kontrol koy: grupların toplamı genel toplama eşit mi, merge öncesi ve sonrası satır sayısı beklendiği gibi mi? <code>assert len(sonra) == len(once)</code> left merge\'de satır patlamasını, toplam kontrolü kaybolan NaN anahtarlarını yakalar.</div>'
'<div class="note"><b>Gerçek işte</b>Yönetime giden rakamların en sık yanlış çıkma sebebi hatalı formül değil, sessiz veri kaybıdır: eksik şehirli siparişlerin groupby\'da düşmesi, müşteri tablosundaki tekrarlı kayıt yüzünden cironun iki kat sayılması, fiyatın düz ortalamasının ağırlıklı ortalama sanılması. Deneyimli analistler her raporun sonunda "mutabakat" (reconciliation) satırı tutar: kaynak toplam, rapor toplamı, fark.</div>'
)

SIP = 'import pandas as pd\ndf = pd.DataFrame({"musteri": ["Ayşe", "Ali", "Ayşe", "Can", "Ali", "Ayşe"], "tutar": [100.0, 50.0, 70.0, 20.0, 30.0, 10.0]})\n'

ex = [
 {'t': 'mc', 'stage': 'Isınma',
  'q': 'Bir grupta 5 satır var ve <code>fiyat</code> sütununda 2 hücre boş. <code>g["fiyat"].count()</code> ve <code>g.size()</code> bu grup için ne verir?',
  'o': ['5 ve 5', '3 ve 5', '5 ve 3', '3 ve 3'], 'a': 1,
  'why': 'count yalnızca dolu hücreleri sayar (3); size satır sayısını verir, eksik değer umursamaz (5). "Kaç sipariş var?" sorusunun cevabı size, "kaç siparişin fiyatı var?" sorusunun cevabı count\'tur.'},
 {'t': 'predict', 'stage': 'Kodu oku', 'q': 'Şehri boş olan bir sipariş var. Ne yazdırır?',
  'code': 'import pandas as pd\ndf = pd.DataFrame({"sehir": ["Bursa", None, "Bursa"], "tutar": [10, 20, 30]})\nprint(df.groupby("sehir")["tutar"].sum().tolist(), df["tutar"].sum())\n',
  'o': ['[40, 20] 60', '[40] 60', '[60] 60', '[40] 40'], 'a': 1,
  'why': 'groupby anahtarı eksik olan satırı varsayılan olarak atar; grupların toplamı 40, tablo toplamı 60 olur. dropna=False ya da önceden fillna("Bilinmiyor") ile bu satır korunur.'},
 {'t': 'predict', 'stage': 'Kodu oku', 'q': 'Bu kod ne yazdırır?',
  'code': SIP + 'sadik = df.groupby("musteri").filter(lambda g: len(g) >= 2)\nprint(len(sadik), sorted(sadik["musteri"].unique()))\n',
  'o': ["2 ['Ali', 'Ayşe']", "5 ['Ali', 'Ayşe']", "6 ['Ali', 'Ayşe', 'Can']", "3 ['Ayşe']"], 'a': 1,
  'why': 'filter özet değil, koşulu sağlayan grupların tüm satırlarını döndürür: Ayşe\'nin 3, Ali\'nin 2 satırı; toplam 5. Can\'ın tek siparişi elenir.'},
 {'t': 'predict', 'stage': 'Kodu oku', 'q': 'İki tabloda da <code>tutar</code> sütunu var. Ne yazdırır?',
  'code': 'import pandas as pd\na = pd.DataFrame({"id": [1, 2], "tutar": [10, 20]})\nb = pd.DataFrame({"id": [1, 2], "tutar": [15, 25]})\nprint(a.merge(b, on="id").columns.tolist())\n',
  'o': ["['id', 'tutar']", "['id', 'tutar_x', 'tutar_y']", "['id', 'tutar', 'tutar']", "['id_x', 'tutar_x', 'id_y', 'tutar_y']"], 'a': 1,
  'why': 'Anahtar olmayan aynı adlı sütunlar _x (sol) ve _y (sağ) ekiyle ayrılır. Anlamlı adlar için suffixes=("_gercek", "_hedef") ver.'},
 {'t': 'order', 'stage': 'Kodu oku',
  'q': '<p>Kategori bazında tutarın toplamını ve en büyüğünü hesaplayıp iki katlı sütun adlarını <code>tutar_sum</code> biçiminde düzleştiren programın satırlarını sırala.</p>',
  'lines': ['import pandas as pd', 'df = pd.DataFrame({"kategori": ["A", "A", "B"], "tutar": [10, 30, 5]})', 'oz = df.groupby("kategori").agg({"tutar": ["sum", "max"]})', 'oz.columns = ["_".join(c) for c in oz.columns]', 'oz = oz.reset_index()', 'print(oz.columns.tolist(), oz["tutar_sum"].tolist())'],
  'expect': "['kategori', 'tutar_sum', 'tutar_max'] [40, 5]\n",
  'hint': 'Sütunlar düzleştirilmeden "tutar_sum" adıyla erişilemez; reset_index kategoriyi sütuna taşır.',
  'why': 'agg sözlük + liste MultiIndex sütun üretir; "_".join her (sütun, fonksiyon) çiftini tek ada çevirir. reset_index grup anahtarını yeniden sütun yapar.'},
 {'t': 'code', 'id': 'pandas-groupby-x1', 'stage': 'Rehberli', 'diff': 2,
  'q': '<p><code>sadik_musteriler(df, en_az)</code> fonksiyonu <code>musteri</code> ve <code>tutar</code> sütunlu sipariş tablosunda <b>en az</b> <code>en_az</code> sipariş vermiş müşterilerin adlarını alfabetik sıralı liste olarak döndürsün. <code>groupby(...).filter</code> kullan.</p>',
  'guide': ['df.groupby("musteri") ile grupla.', 'filter\'a len(g) >= en_az koşulunu veren bir lambda ver.', 'Dönen satırlardan musteri sütununun tekil değerlerini al.', 'sorted ile listeye çevir.'],
  'example': 'import pandas as pd\nd = pd.DataFrame({"sube": ["A", "A", "B"], "ciro": [5, 7, 100]})\nprint(d.groupby("sube").filter(lambda g: g["ciro"].sum() > 50))\n',
  'start': 'import pandas as pd\n\ndef sadik_musteriler(df, en_az):\n    # TODO: filter ile en az en_az siparişi olan grupları tut\n    secili = df\n    # TODO: tekil ve sıralı ad listesi\n    return list(secili["musteri"])\n',
  'sol': 'import pandas as pd\n\ndef sadik_musteriler(df, en_az):\n    secili = df.groupby("musteri").filter(lambda g: len(g) >= en_az)\n    return sorted(secili["musteri"].unique().tolist())\n',
  'tests': SIP + 'assert sadik_musteriler(df, 2) == ["Ali", "Ayşe"], "En az 2 siparişi olanlar Ali ve Ayşe"\nassert sadik_musteriler(df, 3) == ["Ayşe"], "En az 3: yalnız Ayşe"\nassert sadik_musteriler(df, 10) == [], "Kimse yoksa boş liste"\nassert "filter" in __source__, "groupby(...).filter kullan"\n',
  'hints': ['filter fonksiyonu her grubun alt tablosunu alır; len(g) satır sayısıdır.', 'secili["musteri"].unique() tekil adları verir.'],
  'why': 'filter "grup düzeyinde koşul, satır düzeyinde sonuç" ister; sonuç üzerinde unique ile müşteri listesine ulaşırsın.'},
 {'t': 'code', 'id': 'pandas-groupby-x2', 'stage': 'Rehberli', 'diff': 2,
  'q': '<p><code>ortalama_birim_fiyat(df)</code> fonksiyonu <code>kategori</code>, <code>adet</code>, <code>fiyat</code> sütunlu tabloda her kategorinin <b>adetle ağırlıklandırılmış</b> ortalama fiyatını (toplam tutar / toplam adet) 2 basamağa yuvarlanmış <code>{kategori: değer}</code> sözlüğü olarak döndürsün.</p>',
  'guide': ['Satır tutarını adet * fiyat olarak hesapla (yeni tablo üzerinde).', 'Kategori bazında tutar ve adet toplamlarını al.', 'Toplam tutarı toplam adede böl.', 'round(2) ve to_dict().'],
  'example': 'import pandas as pd\nd = pd.DataFrame({"ders": ["M", "M"], "kredi": [4, 1], "not_": [90, 40]})\nd = d.assign(puan=d["kredi"] * d["not_"])\nt = d.groupby("ders")[["puan", "kredi"]].sum()\nprint((t["puan"] / t["kredi"]).to_dict())   # 80.0, düz ortalama 65 olurdu\n',
  'start': 'import pandas as pd\n\ndef ortalama_birim_fiyat(df):\n    d = df.assign(tutar=df["adet"] * df["fiyat"])\n    # TODO: kategori bazında tutar ve adet toplamı\n    # TODO: oranı hesapla, yuvarla, sözlüğe çevir\n    return d.groupby("kategori")["fiyat"].mean().round(2).to_dict()\n',
  'sol': 'import pandas as pd\n\ndef ortalama_birim_fiyat(df):\n    d = df.assign(tutar=df["adet"] * df["fiyat"])\n    t = d.groupby("kategori")[["tutar", "adet"]].sum()\n    return (t["tutar"] / t["adet"]).round(2).to_dict()\n',
  'tests': 'import pandas as pd\ndf = pd.DataFrame({"kategori": ["Gıda", "Gıda", "Elektronik"], "adet": [10, 1, 2], "fiyat": [10.0, 100.0, 500.0]})\nr = ortalama_birim_fiyat(df)\nassert r == {"Elektronik": 500.0, "Gıda": 18.18}, f"Gıda: (100 + 100) / 11 = 18.18 olmalı (düz ortalama 55 yanıltır); gelen {r}"\n',
  'hints': ['Düz mean her satıra eşit ağırlık verir; 10 adetlik satır ile 1 adetlik satır aynı sayılır.', 'groupby("kategori")[["tutar", "adet"]].sum() iki toplamı birlikte verir.', '(t["tutar"] / t["adet"]).round(2).to_dict()'],
  'why': 'Ağırlıklı ortalama iki toplamın oranıdır; satır ortalamalarının ortalaması değildir. Birim fiyat, ortalama faiz oranı, ortalama teslim süresi gibi metriklerde bu ayrım raporu doğrudan değiştirir.'},
 {'t': 'code', 'id': 'pandas-groupby-x3', 'stage': 'Rehberli', 'diff': 2,
  'q': '<p><code>kategori_yuzdesi(df)</code> fonksiyonu <code>sehir</code>, <code>kategori</code>, <code>tutar</code> tablosundan satırlarda şehir, sütunlarda kategori olan bir pivot kursun (boşlar 0) ve her hücreyi <b>kendi satır toplamına</b> göre yüzdeye çevirsin (1 basamak). DataFrame döndür; her satırın toplamı 100 olmalı.</p>',
  'guide': ['pd.pivot_table(..., aggfunc="sum", fill_value=0) ile çapraz tabloyu kur.', 'Satır toplamlarını pv.sum(axis=1) ile al.', 'pv.div(toplamlar, axis=0) satır satır böler.', '100 ile çarp ve round(1).'],
  'example': 'import pandas as pd\nt = pd.DataFrame({"A": [1, 3], "B": [1, 1]}, index=["x", "y"])\nprint(t.div(t.sum(axis=1), axis=0))\n',
  'start': 'import pandas as pd\n\ndef kategori_yuzdesi(df):\n    pv = pd.pivot_table(df, index="sehir", columns="kategori", values="tutar",\n                        aggfunc="sum", fill_value=0)\n    # TODO: satır toplamına böl (axis=0), 100 ile çarp, yuvarla\n    return pv\n',
  'sol': 'import pandas as pd\n\ndef kategori_yuzdesi(df):\n    pv = pd.pivot_table(df, index="sehir", columns="kategori", values="tutar",\n                        aggfunc="sum", fill_value=0)\n    return pv.div(pv.sum(axis=1), axis=0).mul(100).round(1)\n',
  'tests': 'import pandas as pd\ndf = pd.DataFrame({"sehir": ["Ankara", "Ankara", "İzmir", "Ankara"], "kategori": ["Gıda", "Elektronik", "Gıda", "Gıda"], "tutar": [100.0, 600.0, 50.0, 300.0]})\nr = kategori_yuzdesi(df)\nassert r.loc["Ankara", "Gıda"] == 40.0 and r.loc["Ankara", "Elektronik"] == 60.0, f"Ankara: Gıda 40, Elektronik 60; gelen {r.loc[\'Ankara\'].to_dict()}"\nassert r.loc["İzmir", "Gıda"] == 100.0 and r.loc["İzmir", "Elektronik"] == 0.0, "İzmir yalnız Gıda: 100 / 0"\nassert (r.sum(axis=1).round(6) == 100).all(), "Her satırın toplamı 100 olmalı"\n',
  'hints': ['pv / pv.sum(axis=1) sütun etiketlerine göre hizalanır ve yanlış sonuç verir; div(..., axis=0) kullan.', 'pv.div(pv.sum(axis=1), axis=0).mul(100).round(1)'],
  'why': 'Satır yüzdesi her satırı kendi toplamına bölmektir. div(axis=0), Series\'i satır index\'ine göre hizalar; / operatörü ise sütun adlarına göre hizalayıp NaN üretir.'},
 {'t': 'code', 'id': 'pandas-groupby-x4', 'stage': 'Kendin yaz', 'diff': 2,
  'q': '<p><code>duz_ozet(df)</code> fonksiyonu <code>sehir</code> bazında <code>tutar</code> için sum, mean ve max hesaplasın; sonuç <b>düz</b> sütunlu bir DataFrame olsun: <code>["sehir", "tutar_sum", "tutar_mean", "tutar_max"]</code>, şehre göre alfabetik, mean 2 basamak.</p>',
  'start': 'import pandas as pd\n\ndef duz_ozet(df):\n    pass\n',
  'sol': 'import pandas as pd\n\ndef duz_ozet(df):\n    oz = df.groupby("sehir").agg({"tutar": ["sum", "mean", "max"]})\n    oz.columns = ["_".join(c) for c in oz.columns]\n    oz["tutar_mean"] = oz["tutar_mean"].round(2)\n    return oz.reset_index().sort_values("sehir").reset_index(drop=True)\n',
  'tests': 'import pandas as pd\ndf = pd.DataFrame({"sehir": ["İzmir", "Ankara", "Ankara", "Ankara"], "tutar": [50.0, 10.0, 20.0, 10.0]})\nr = duz_ozet(df)\nassert r.columns.tolist() == ["sehir", "tutar_sum", "tutar_mean", "tutar_max"], f"Sütunlar düz olmalı; gelen {r.columns.tolist()}"\nassert r["sehir"].tolist() == ["Ankara", "İzmir"], "Alfabetik sıra"\nassert r["tutar_mean"].tolist() == [13.33, 50.0], "Ortalama 2 basamak"\nassert r["tutar_sum"].tolist() == [40.0, 50.0]\n',
  'hints': ['agg({"tutar": ["sum", "mean", "max"]}) iki katlı sütun verir.', 'oz.columns = ["_".join(c) for c in oz.columns] ve reset_index(). Alternatif: adlandırılmış agg (tutar_sum=("tutar", "sum")).'],
  'why': 'Excel ve veritabanına yazılacak tablolar düz sütun adı ister. Düzleştirme ya da adlandırılmış agg ile sütun sözleşmesini sabitlersin.'},
 {'t': 'code', 'id': 'pandas-groupby-x5', 'stage': 'Hata avı', 'kind': 'bug', 'diff': 2,
  'q': '<p><b>Hatayı bul ve düzelt.</b> <code>sehir_ciro(df)</code> şehir bazında ciroyu <code>{sehir: ciro}</code> olarak döndürmeli; şehri boş olan siparişler <code>"Bilinmiyor"</code> anahtarıyla gelmeli. Finans ekibi "rapor toplamı kasa toplamını tutmuyor" diyor.</p>',
  'start': 'import pandas as pd\n\ndef sehir_ciro(df):\n    return df.groupby("sehir")["tutar"].sum().to_dict()\n',
  'sol': 'import pandas as pd\n\ndef sehir_ciro(df):\n    d = df.assign(sehir=df["sehir"].fillna("Bilinmiyor"))\n    return d.groupby("sehir")["tutar"].sum().to_dict()\n',
  'tests': 'import pandas as pd\ndf = pd.DataFrame({"sehir": ["Bursa", None, "Bursa", None], "tutar": [10.0, 20.0, 30.0, 5.0]})\nr = sehir_ciro(df)\nassert abs(sum(r.values()) - 65.0) < 1e-9, f"Grupların toplamı 65 olmalı; gelen {sum(r.values())}: NaN anahtarlı satırlar düşüyor"\nassert r == {"Bursa": 40.0, "Bilinmiyor": 25.0}, f"Beklenen Bursa 40, Bilinmiyor 25; gelen {r}"\nassert df["sehir"].isna().sum() == 2, "Girdi değişmemeli"\n',
  'hints': ['groupby eksik anahtarlı satırları varsayılan olarak atar.', 'Gruplamadan önce sehir sütununu fillna("Bilinmiyor") ile doldur (assign ile yeni tabloda).'],
  'why': 'Eksik anahtarlar groupby\'da sessizce düşer. Anahtarı doldurmak hem toplamı korur hem de veri kalitesi sorununu raporda görünür kılar.'},
 {'t': 'code', 'id': 'pandas-groupby-x6', 'stage': 'Hata avı', 'kind': 'bug', 'diff': 2,
  'q': '<p><b>Hatayı bul ve düzelt.</b> <code>segment_ciro(siparis, musteri)</code> siparişleri müşteri tablosuyla birleştirip segment bazında ciroyu <code>{segment: ciro}</code> döndürmeli. Sipariş tablosunda anahtar <code>musteri_id</code>, müşteri tablosunda <code>id</code>. Şu an <code>KeyError</code> veriyor. Müşterisi bulunamayan siparişler <code>"Yok"</code> segmentine yazılsın.</p>',
  'start': 'import pandas as pd\n\ndef segment_ciro(siparis, musteri):\n    m = siparis.merge(musteri, on="musteri_id", how="left")\n    return m.groupby("segment")["tutar"].sum().to_dict()\n',
  'sol': 'import pandas as pd\n\ndef segment_ciro(siparis, musteri):\n    m = siparis.merge(musteri, left_on="musteri_id", right_on="id", how="left")\n    m["segment"] = m["segment"].fillna("Yok")\n    return m.groupby("segment")["tutar"].sum().to_dict()\n',
  'tests': 'import pandas as pd\nsiparis = pd.DataFrame({"musteri_id": [10, 20, 10, 99], "tutar": [100.0, 50.0, 25.0, 5.0]})\nmusteri = pd.DataFrame({"id": [10, 20], "segment": ["Altın", "Gümüş"]})\nr = segment_ciro(siparis, musteri)\nassert r == {"Altın": 125.0, "Gümüş": 50.0, "Yok": 5.0}, f"Beklenen Altın 125, Gümüş 50, Yok 5; gelen {r}"\n',
  'hints': ['on yalnızca iki tabloda AYNI adlı sütun varsa çalışır.', 'left_on="musteri_id", right_on="id"; ardından segment eksiklerini "Yok" ile doldur.'],
  'why': 'Farklı adlı anahtarlar left_on/right_on ile eşlenir. Left merge\'de eşleşmeyen satırların segmenti NaN olur; doldurulmazsa groupby onları da düşürür.'},
 {'t': 'code', 'id': 'pandas-groupby-x7', 'stage': 'Meydan okuma', 'diff': 3,
  'q': '<p>Anadolu Market CRM ekibi için <code>musteri_karnesi(df, bugun)</code> yaz. <code>df</code>: <code>musteri</code>, <code>tarih</code> (datetime), <code>tutar</code>. <code>bugun</code>: <code>pd.Timestamp</code>. Müşteri başına bir satırlık DataFrame döndür, sütunlar: <code>musteri, siparis, toplam, son_gun</code> (son siparişten bu yana gün, int) ve <code>segment</code>: <code>siparis &gt;= 3</code> ve <code>son_gun &lt;= 30</code> ise <code>"Sadık"</code>, <code>son_gun &gt; 90</code> ise <code>"Kayıp riski"</code>, diğerleri <code>"Normal"</code>. <code>toplam</code>\'a göre azalan sırala, index 0\'dan başlasın.</p>',
  'start': 'import pandas as pd\nimport numpy as np\n\ndef musteri_karnesi(df, bugun):\n    pass\n',
  'sol': 'import pandas as pd\nimport numpy as np\n\ndef musteri_karnesi(df, bugun):\n    k = df.groupby("musteri", as_index=False).agg(\n        siparis=("tutar", "size"), toplam=("tutar", "sum"), son=("tarih", "max"))\n    k["son_gun"] = (bugun - k["son"]).dt.days.astype(int)\n    k["segment"] = np.select(\n        [(k["siparis"] >= 3) & (k["son_gun"] <= 30), k["son_gun"] > 90],\n        ["Sadık", "Kayıp riski"], default="Normal")\n    k = k.drop(columns="son").sort_values("toplam", ascending=False)\n    return k.reset_index(drop=True)[["musteri", "siparis", "toplam", "son_gun", "segment"]]\n',
  'tests': 'import pandas as pd\ndf = pd.DataFrame({\n    "musteri": ["Ayşe", "Ayşe", "Ayşe", "Ali", "Can", "Can"],\n    "tarih": pd.to_datetime(["2024-05-01", "2024-05-20", "2024-06-10", "2024-01-15", "2024-04-01", "2024-05-25"]),\n    "tutar": [100.0, 50.0, 70.0, 900.0, 20.0, 30.0],\n})\nr = musteri_karnesi(df, pd.Timestamp("2024-06-20"))\nassert r.columns.tolist() == ["musteri", "siparis", "toplam", "son_gun", "segment"], f"Sütunlar: {r.columns.tolist()}"\nassert r["musteri"].tolist() == ["Ali", "Ayşe", "Can"], "toplam\'a göre azalan"\nassert r["son_gun"].tolist() == [157, 10, 26], f"son_gun: {r[\'son_gun\'].tolist()}"\nassert r["segment"].tolist() == ["Kayıp riski", "Sadık", "Normal"], f"segment: {r[\'segment\'].tolist()}"\nassert r["siparis"].tolist() == [1, 3, 2] and r.index.tolist() == [0, 1, 2]\n',
  'hints': ['Adlandırılmış agg: siparis=("tutar", "size"), toplam=("tutar", "sum"), son=("tarih", "max").', 'Gün farkı: (bugun - k["son"]).dt.days.', 'Segment için np.select; koşul sırası önemli ("Sadık" önce).'],
  'why': 'Bu, RFM (Recency, Frequency, Monetary) analizinin küçük bir sürümüdür: tek groupby ile sıklık, tutar ve son tarih alınır; tarih farkı ve np.select ile iş kuralı vektörleştirilmiş olarak uygulanır.'},
]

faq = [
 {'q': 'groupby sonucu grupları neden alfabetik sıralıyor?', 'a': 'groupby varsayılan olarak anahtarları sıralar (sort=True). Verideki ilk görülme sırasını korumak istersen groupby(..., sort=False) ver; büyük veride biraz da hızlanır.'},
 {'q': 'agg içinde lambda mı, ayrı fonksiyon mu yazmalıyım?', 'a': 'Hazır adlar ("sum", "mean", "nunique") hızlı C yolunu kullanır; mümkünse onları seç. Özel mantık gerekiyorsa adlandırılmış agg ile aralik=("fiyat", lambda s: s.max() - s.min()) yazabilirsin; birkaç sütun gerektiren hesapları (ağırlıklı ortalama) önce toplam alıp sonra bölerek yap.'},
]
mistakes = [
 {'bad': 'df.groupby("sehir")["tutar"].sum()  # boş şehirler kayboldu', 'good': 'df.assign(sehir=df["sehir"].fillna("Bilinmiyor")).groupby("sehir")["tutar"].sum()', 'why': 'groupby eksik anahtarlı satırları varsayılan olarak atar; toplamlar kaynakla tutmaz.'},
 {'bad': 'df.groupby("kategori")["fiyat"].mean()  # ortalama birim fiyat', 'good': 't = df.assign(tutar=df.adet * df.fiyat).groupby("kategori")[["tutar", "adet"]].sum()\nt["tutar"] / t["adet"]', 'why': 'Satır fiyatlarının düz ortalaması adetleri yok sayar; birim fiyat toplam tutarın toplam adede oranıdır.'},
]

emit({'id': 'pandas-groupby', 'min': 30, 'html': html, 'ex': ex, 'faq': faq, 'mistakes': mistakes}, ['pandas'])
