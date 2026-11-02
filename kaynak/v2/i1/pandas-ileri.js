/* Kesit Python — v2/i1: İleri pandas: şekil, pencere ve zincir */
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push(
  {
    id: 'pandas-ileri',
    lv: 'ileri',
    mod: 'Veri Bilimi Araçları',
    min: 55,
    needs: ['pandas', 'numpy'],
    title: 'İleri pandas: şekil, pencere ve zincir',
    sum: 'MultiIndex, melt/pivot ile yeniden şekillendirme, rolling/expanding/ewm pencereleri, rank ve cumcount, kategorik tür, assign/pipe/query zinciri, np.select ile vektörleştirme ve validate/indicator ile güvenli merge.',
    goals: [
      'MultiIndex\'i set_index, xs, swaplevel ve unstack ile yönetebilirim',
      'Tabloyu melt, pivot ve pivot_table ile geniş ve uzun biçim arasında çevirebilirim',
      'Grup içinde rolling, expanding, rank, cumcount ve cumsum hesaplayabilirim',
      'apply yerine np.where/np.select ve assign/pipe/query zinciriyle hızlı ve okunur kod yazabilirim',
      'merge\'ü validate ve indicator ile denetleyip yinelenen anahtar hatasını yakalayabilirim'
    ],
    body: `<h2>Neden "ileri" pandas?</h2>
<p>Seçme, filtreleme ve temizliği <b>pandas giriş</b> ile <b>veri temizleme</b> derslerinde, <code>groupby</code>, <code>pivot_table</code> ve <code>merge</code>'ü <b>groupby, pivot, merge</b> dersinde gördün. Gerçek işte bunlar yetmeye başladığı an şöyle sorular gelir: "Her şehirde ciroya göre ilk 3 ürün hangisi?", "Excel'den gelen ay sütunlarını nasıl tek sütuna çeviririm?", "Son 7 günün hareketli ortalaması düşüyor mu?", "Birleştirmeden sonra neden satır sayım arttı?". Bu ders, analistin günlük işindeki bu ikinci katmanı kapsar: çok seviyeli index (MultiIndex), yeniden şekillendirme (reshaping), pencere fonksiyonları (window functions), sıralama, kategorik tür, zincirleme yazım (method chaining), vektörleştirme ve güvenli birleştirme.</p>
<p>Tüm örnekler Anadolu Market'in küçük bir satış tablosu üzerinde. Kodları çalıştır, çıktıyı oku, sonra bir değeri değiştirip tekrar çalıştır; ileri pandas en hızlı böyle oturur.</p>

<h2>MultiIndex: iki anahtarlı index</h2>
<p>Birden çok sütunla gruplayınca ya da <code>set_index(["sehir", "ay"])</code> yazınca index iki seviyeli olur. Her satırın adresi artık bir demettir (tuple): <code>("Ankara", 2)</code>. Bu yapı "şehir içinde ay" gibi hiyerarşik veriyi doğal biçimde taşır.</p>
<pre class="py">import pandas as pd

df = pd.DataFrame({
    "sehir": ["Ankara", "Ankara", "İzmir", "İzmir", "Bursa", "Bursa"],
    "ay": [1, 2, 1, 2, 1, 2],
    "ciro": [1200, 1500, 800, 950, 600, 720],
}).set_index(["sehir", "ay"]).sort_index()

print(df)
print(df.loc[("Ankara", 2), "ciro"])          # tek hücre: demetle adresle
print(df.loc["İzmir"])                          # dış seviyeyle seç
print(df.xs(1, level="ay"))                     # iç seviyeden kesit: tüm şehirlerin 1. ayı
print(df.swaplevel().sort_index().head(3))      # seviyelerin yerini değiştir
print(df["ciro"].unstack("ay"))                 # iç seviyeyi sütunlara aç</pre>
<p><code>xs</code> (cross-section) iç seviyeden seçim yapmanın en okunur yoludur. <code>swaplevel</code> seviyelerin sırasını değiştirir; ardından mutlaka <code>sort_index()</code> çağır, çünkü sırasız MultiIndex üzerinde dilimleme hem yavaştır hem de <code>UnsortedIndexError</code> verebilir. <code>unstack</code> bir seviyeyi sütunlara açar, <code>stack</code> tersini yapar.</p>
<div class="tip"><b>Ne zaman MultiIndex, ne zaman düz tablo?</b>Ara hesaplarda MultiIndex güçlüdür (<code>unstack</code>, <code>xs</code>). Rapor, CSV, Excel ya da başka bir sisteme gidecek tabloda <code>reset_index()</code> ile düz sütunlara dön; çoğu araç MultiIndex'i anlamaz.</div>

<h2>Yeniden şekillendirme: geniş ↔ uzun</h2>
<p>Aynı veri iki biçimde durabilir. <b>Geniş (wide)</b> biçimde her ay bir sütundur; insan okumak için rahattır, Excel raporları böyle gelir. <b>Uzun (long, tidy)</b> biçimde her satır tek bir gözlemdir: şehir, ay, ciro. Gruplama, grafik (özellikle seaborn) ve veritabanı uzun biçimi sever.</p>
<div class="tbl-wrap"><table>
<tr><th>İşlem</th><th>Yön</th><th>Ne zaman</th></tr>
<tr><td><code>melt(id_vars, var_name, value_name)</code></td><td>geniş → uzun</td><td>Excel'den gelen ay/ürün sütunlarını tek sütuna indirmek</td></tr>
<tr><td><code>pivot(index, columns, values)</code></td><td>uzun → geniş</td><td>Anahtar çiftleri tekilse; yinelenen varsa hata verir</td></tr>
<tr><td><code>pivot_table(..., aggfunc)</code></td><td>uzun → geniş</td><td>Yinelenen çiftler toplanacaksa (sum, mean)</td></tr>
<tr><td><code>stack()</code> / <code>unstack()</code></td><td>sütun ↔ index seviyesi</td><td>MultiIndex ile çalışırken</td></tr>
</table></div>
<pre class="py">import pandas as pd

genis = pd.DataFrame({
    "sehir": ["Ankara", "İzmir"],
    "Oca": [1200, 800], "Şub": [1500, 950], "Mar": [1400, 1010],
})
uzun = genis.melt(id_vars="sehir", var_name="ay", value_name="ciro")
print(uzun)

geri = uzun.pivot(index="sehir", columns="ay", values="ciro")
print(geri[["Oca", "Şub", "Mar"]])          # sütun sırasını açıkça ver

# Aynı şehir-ay çifti iki kez varsa pivot hata verir, pivot_table toplar
uzun2 = pd.concat([uzun, pd.DataFrame({"sehir": ["Ankara"], "ay": ["Oca"], "ciro": [100]})])
print(uzun2.pivot_table(index="sehir", columns="ay", values="ciro", aggfunc="sum"))</pre>
<div class="warn"><b>pivot ile pivot_table farkı</b><code>pivot</code> yalnızca yeniden düzenler; aynı (index, columns) çifti iki kez geçerse <code>ValueError: Index contains duplicate entries</code> verir. Bu hata çoğu zaman veride beklemediğin bir yineleme olduğunu söyler: önce nedenini bul, sonra bilinçli olarak <code>pivot_table(aggfunc="sum")</code> seç.</div>

<h2>Pencere fonksiyonları: rolling, expanding, ewm</h2>
<p>Günlük ciro gürültülüdür; eğilimi görmek için <b>hareketli ortalama</b> (rolling mean) kullanılır. <code>rolling(3)</code> son 3 satırlık bir pencere kaydırır; pencere dolana kadar sonuç <code>NaN</code> olur, <code>min_periods=1</code> ile ilk satırlarda da değer alırsın. <code>expanding()</code> başlangıçtan bugüne biriken pencere (kümülatif ortalama), <code>ewm(span=3)</code> ise yakın geçmişe daha çok ağırlık veren üstel ağırlıklı ortalamadır (exponentially weighted).</p>
<pre class="py">import pandas as pd

satis = pd.DataFrame({
    "sube": ["Kadıköy"] * 5 + ["Çankaya"] * 5,
    "gun": list(range(1, 6)) * 2,
    "adet": [10, 14, 9, 20, 18, 5, 7, 6, 9, 12],
})
satis["ort3"] = (satis.groupby("sube")["adet"]
                 .transform(lambda s: s.rolling(3, min_periods=1).mean())
                 .round(2))
satis["kum_ort"] = satis.groupby("sube")["adet"].transform(lambda s: s.expanding().mean()).round(2)
satis["ewm"] = satis.groupby("sube")["adet"].transform(lambda s: s.ewm(span=3).mean()).round(2)
print(satis)</pre>
<p>Grup içinde pencere istiyorsan (her şube kendi geçmişine baksın) <code>groupby(...).transform(lambda s: s.rolling(...))</code> kalıbını kullan. Gruplamadan <code>rolling</code> çağırırsan Kadıköy'ün son günleri Çankaya'nın ilk gününe karışır; bu, en sık yapılan pencere hatasıdır.</p>

<h2>Sıralama, grup içi sıra ve kümülatif işlemler</h2>
<p><code>rank</code> değerlere sıra numarası verir. Eşitlikleri nasıl ele aldığı <code>method</code> ile seçilir. SQL'deki <code>ROW_NUMBER</code>, <code>RANK</code>, <code>DENSE_RANK</code> karşılıkları buradadır.</p>
<div class="tbl-wrap"><table>
<tr><th>method</th><th>[300, 200, 200, 100] azalan</th><th>SQL karşılığı</th></tr>
<tr><td><code>"first"</code></td><td>1, 2, 3, 4</td><td>ROW_NUMBER</td></tr>
<tr><td><code>"min"</code></td><td>1, 2, 2, 4</td><td>RANK</td></tr>
<tr><td><code>"dense"</code></td><td>1, 2, 2, 3</td><td>DENSE_RANK</td></tr>
<tr><td><code>"average"</code> (varsayılan)</td><td>1, 2.5, 2.5, 4</td><td>—</td></tr>
</table></div>
<pre class="py">import pandas as pd

urun = pd.DataFrame({
    "sehir": ["Ankara", "Ankara", "Ankara", "İzmir", "İzmir", "İzmir"],
    "urun": ["Çay", "Kahve", "Süt", "Çay", "Kahve", "Süt"],
    "ciro": [500, 900, 500, 300, 250, 700],
})
urun["sira"] = urun.groupby("sehir")["ciro"].rank(method="dense", ascending=False).astype(int)
print(urun.sort_values(["sehir", "sira"]))
print(urun[urun["sira"] == 1])            # her şehrin bir numarası (eşitse ikisi de)

siparis = pd.DataFrame({"musteri": ["A", "B", "A", "A", "B"], "tutar": [100, 50, 70, 30, 20]})
siparis["kacinci"] = siparis.groupby("musteri").cumcount() + 1
siparis["kumulatif"] = siparis.groupby("musteri")["tutar"].cumsum()
print(siparis)</pre>
<p><code>cumcount</code> grup içinde 0'dan başlayan sıra numarasıdır; "müşterinin kaçıncı siparişi?" sorusunun cevabıdır ve "ilk siparişi olanları" bulmak için idealdir. <code>cumsum</code>, <code>cummax</code>, <code>cumprod</code> ise kümülatif değerleri verir. Bunlar satır sırasına bağlıdır: önce tarihe göre sırala.</p>

<h2>Kategorik tür ve bellek</h2>
<p>Bir milyon satırda "İstanbul" metni bir milyon kez saklanır. <code>category</code> türü her farklı değeri bir kez saklar, satırlarda yalnızca küçük tam sayı kodları tutar. Az sayıda farklı değeri olan sütunlarda (şehir, kategori, durum) bellek ciddi düşer ve <code>groupby</code> hızlanır. Sıralı kategori (<code>ordered=True</code>) ise "Bronz &lt; Gümüş &lt; Altın" gibi anlamlı sıralama ve karşılaştırma sağlar.</p>
<pre class="py">import pandas as pd

n = 30_000
df = pd.DataFrame({
    "sehir": ["İstanbul", "Ankara", "İzmir"] * (n // 3),
    "segment": ["Bronz", "Altın", "Gümüş"] * (n // 3),
})
once = df.memory_usage(deep=True).sum()
df["sehir"] = df["sehir"].astype("category")
seg_tur = pd.CategoricalDtype(["Bronz", "Gümüş", "Altın"], ordered=True)
df["segment"] = df["segment"].astype(seg_tur)
sonra = df.memory_usage(deep=True).sum()
print(f"bellek: {once:,} → {sonra:,} bayt")
print((df["segment"] &gt;= "Gümüş").sum(), "satır Gümüş ve üstü")
print(df["segment"].cat.categories.tolist())</pre>
<p>Kategorik sütunla <code>groupby</code> yaparken <code>observed=True</code> ver; aksi hâlde veride olmayan kategoriler de sıfır satırı olarak gelir.</p>

<h2>Zincirleme yazım: assign, pipe, query</h2>
<p>Ara değişkenlerle dolu bir defter yerine tek bir okunur boru hattı yazabilirsin. <code>assign</code> yeni sütun ekler ve <b>yeni</b> DataFrame döndürür; içinde <code>lambda d:</code> kullanınca bir önceki adımın sonucuna erişirsin. <code>query</code> filtreyi metin olarak yazar (<code>@</code> ile Python değişkenine erişir). <code>pipe</code> kendi fonksiyonunu zincirin ortasına takar.</p>
<pre class="py">import pandas as pd

df = pd.DataFrame({
    "sehir": ["Ankara", "İzmir", "Ankara", "Bursa", "İzmir"],
    "adet": [3, 1, 5, 2, 4],
    "fiyat": [120.0, 899.0, 45.5, 250.0, 129.9],
})
esik = 200

def kdv_ekle(d, oran=0.20):
    return d.assign(kdvli=lambda x: (x["tutar"] * (1 + oran)).round(2))

rapor = (
    df
    .assign(tutar=lambda d: d["adet"] * d["fiyat"])
    .query("tutar &gt; @esik")
    .pipe(kdv_ekle, oran=0.20)
    .sort_values("tutar", ascending=False)
    .reset_index(drop=True)
)
print(rapor)</pre>
<p>Zincir, her adımın girdisini değiştirmediği için yan etkisizdir; hata ayıklarken herhangi bir satırı yoruma alıp sonucu görebilirsin. Çok uzayan zinciri anlamlı adlı <code>pipe</code> fonksiyonlarına böl.</p>

<h2>apply mı, vektörleştirme mi, np.where/np.select mi?</h2>
<p><code>apply(axis=1)</code> her satır için Python fonksiyonu çağırır; okunur ama yavaştır. Aynı işi sütun aritmetiği, <code>np.where</code> (iki seçenek) ya da <code>np.select</code> (çok koşul) ile yazmak genellikle onlarca kat hızlıdır.</p>
<pre class="py">import numpy as np
import pandas as pd
import time

rng = np.random.default_rng(0)
df = pd.DataFrame({"tutar": rng.integers(10, 2000, 100_000)})

t0 = time.perf_counter()
yavas = df.apply(lambda r: "Altın" if r["tutar"] &gt;= 1000 else ("Gümüş" if r["tutar"] &gt;= 500 else "Bronz"), axis=1)
t1 = time.perf_counter()
kosullar = [df["tutar"] &gt;= 1000, df["tutar"] &gt;= 500]
hizli = np.select(kosullar, ["Altın", "Gümüş"], default="Bronz")
t2 = time.perf_counter()
print("aynı mı:", (yavas.to_numpy() == hizli).all())
print(f"apply: {t1 - t0:.3f} sn, np.select: {t2 - t1:.4f} sn")
print("iki seçenek:", np.where(df["tutar"].head(3) &gt;= 1000, "büyük", "küçük"))</pre>
<div class="tbl-wrap"><table>
<tr><th>Araç</th><th>Hız</th><th>Kullan</th></tr>
<tr><td>Sütun aritmetiği, <code>.str</code>, <code>.dt</code></td><td>En hızlı</td><td>Her zaman ilk tercih</td></tr>
<tr><td><code>np.where</code> / <code>np.select</code></td><td>Çok hızlı</td><td>Koşula göre değer atama</td></tr>
<tr><td><code>Series.map(sözlük)</code></td><td>Hızlı</td><td>Kod → ad eşleme</td></tr>
<tr><td><code>apply(axis=1)</code></td><td>Yavaş</td><td>Gerçekten satır satır mantık (dış API, karmaşık metin)</td></tr>
<tr><td><code>iterrows</code></td><td>En yavaş</td><td>Neredeyse hiç; gerekirse <code>itertuples</code></td></tr>
</table></div>

<h2>Güvenli birleştirme: validate, indicator, yinelenen anahtar</h2>
<p><code>merge</code>'ün en tehlikeli sessiz hatası, sağ tabloda anahtarın yinelenmesidir: siparişler çoğalır, ciro şişer ve kimse fark etmez. <code>validate</code> beklentini yazar ve bozulursa <code>MergeError</code> verir. <code>indicator=True</code> her satıra <code>_merge</code> sütunu ekler: <code>both</code>, <code>left_only</code>, <code>right_only</code>.</p>
<pre class="py">import pandas as pd

siparis = pd.DataFrame({"siparis_id": [1, 2, 3, 4], "musteri_id": [10, 20, 10, 99], "tutar": [150, 80, 60, 40]})
musteri = pd.DataFrame({"musteri_id": [10, 20, 20], "ad": ["Ayşe", "Mehmet", "Mehmet (eski kayıt)"]})

print("yinelenen anahtar:", musteri["musteri_id"].duplicated().sum())
try:
    pd.merge(siparis, musteri, on="musteri_id", how="left", validate="many_to_one")
except pd.errors.MergeError as e:
    print("Yakalandı:", e)

musteri = musteri.drop_duplicates("musteri_id", keep="first")
b = pd.merge(siparis, musteri, on="musteri_id", how="left", validate="many_to_one", indicator=True)
print(b)
print("eşleşmeyen sipariş:", b.loc[b["_merge"] == "left_only", "siparis_id"].tolist())
print("satır sayısı korundu mu:", len(b) == len(siparis))</pre>
<p><code>validate</code> değerleri: <code>"one_to_one"</code>, <code>"one_to_many"</code>, <code>"many_to_one"</code>, <code>"many_to_many"</code>. Sipariş (çok) → müşteri (tek) için <code>"many_to_one"</code> yazılır. Birleştirmeden sonra <code>len</code> karşılaştırması da ucuz ve hayat kurtaran bir kontroldür.</p>
<div class="warn"><b>Zincirleme atama çalışmaz</b><code>df[df["sehir"] == "Ankara"]["indirim"] = 0.1</code> önce bir kopya üretir, atama o kopyaya gider ve asıl tablo değişmez. pandas 2'de uyarı, pandas 3'te (Copy-on-Write) yine uyarı ve hiçbir etki. Doğrusu tek adımda: <code>df.loc[maske, "indirim"] = 0.1</code>.</div>

<div class="note"><b>Gerçek işte</b>Bir perakende analiz ekibinde aylık "şehir × kategori" raporu genellikle şu boru hattıdır: ham sipariş tablosu → müşteri ve ürün tablolarıyla <code>validate</code>'li <code>merge</code> → <code>assign</code> ile tutar → <code>pivot_table</code> → şehir sıralaması için <code>rank</code> → <code>reset_index</code> ile Excel'e. Her birleştirmeden sonra satır sayısını loglamak ve <code>indicator</code> ile eşleşmeyenleri ayrı bir "veri kalitesi" sekmesine yazmak, raporun güvenilirliğini yöneticinin gözünde belirleyen alışkanlıktır.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Performans ipuçları</h3>
<ul>
<li><b>Okurken küçült:</b> <code>read_csv(usecols=[...], dtype={"sehir": "category", "adet": "int32"})</code> gereksiz sütunu hiç yüklemez ve doğru türle başlar.</li>
<li><b>Tür daralt:</b> <code>pd.to_numeric(s, downcast="integer")</code> int64'ü sığıyorsa int8/int16/int32'ye indirir.</li>
<li><b>groupby'da sort=False:</b> sonuç sırası önemli değilse sıralama maliyetinden kurtulursun.</li>
<li><b>Döngü gerekiyorsa itertuples:</b> <code>iterrows</code>'tan birkaç kat hızlıdır, çünkü her satır için Series üretmez.</li>
<li><b>Önce ölç:</b> <code>%timeit</code> ya da <code>time.perf_counter</code> ile ölçmeden optimize etme; çoğu zaman darboğaz tek bir <code>apply</code>'dır.</li>
<li><b>Sınırı bil:</b> Veri belleğe sığmıyorsa parça parça oku (<code>chunksize</code>) ya da sütunlu motorlara (polars, DuckDB) geç; pandas'ta pyarrow destekli türler de bellek kazandırır.</li>
</ul>
<h3>Grup içi ilk N</h3>
<p>"Her şehirde en çok satan 3 ürün" için iki yol vardır: <code>sort_values("ciro", ascending=False).groupby("sehir").head(3)</code> (hızlı, eşitlikte keyfi) ya da <code>rank(method="dense")</code> ile <code>sira &lt;= 3</code> filtresi (eşitlikleri birlikte tutar). İş kuralı hangisini istiyorsa onu seç ve raporda belirt.</p>
</section>`,
    ex: [
      { t: 'mc',
        id: 'pandas-ileri-1',
        stage: 'Isınma',
        q: 'Excel\'den gelen tabloda her ay ayrı bir sütun (<code>Oca</code>, <code>Şub</code>, <code>Mar</code>). Bunu <code>sehir, ay, ciro</code> sütunlu uzun biçime hangi işlem çevirir?',
        o: ['pivot', 'melt', 'unstack', 'pivot_table'],
        a: 1,
        why: 'melt geniş tabloyu uzun biçime indirir: id_vars sabit kalır, diğer sütunlar var_name/value_name çiftine dönüşür. pivot ve pivot_table ters yönde (uzun → geniş) çalışır; unstack index seviyesini sütuna açar.' },
      { t: 'mc',
        id: 'pandas-ileri-2',
        stage: 'Isınma',
        q: '<code>pd.Series([300, 200, 200, 100]).rank(method=?, ascending=False)</code> sonucunun <code>[1, 2, 2, 3]</code> olması için hangi method gerekir?',
        o: ['"min"', '"first"', '"dense"', '"average"'],
        a: 2,
        why: '"dense" eşitlere aynı sırayı verir ve boşluk bırakmaz (SQL DENSE_RANK). "min" 1, 2, 2, 4 verir; "first" eşitliği görünme sırasıyla bozar (1, 2, 3, 4); "average" eşitlere 2.5 verir.' },
      { t: 'mc',
        id: 'pandas-ileri-3',
        stage: 'Isınma',
        q: '<code>pd.merge(siparis, musteri, on="musteri_id", validate="many_to_one")</code> ne zaman <code>MergeError</code> verir?',
        o: ['Siparişte aynı musteri_id birden çok kez geçerse', 'Müşteri tablosunda aynı musteri_id birden çok kez geçerse', 'Bazı siparişlerin müşterisi bulunamazsa', 'İki tablonun satır sayısı farklıysa'],
        a: 1,
        why: 'many_to_one "sol çok, sağ tek" demektir: sağ tablodaki anahtar tekil olmalıdır. Solda tekrar normaldir (bir müşterinin çok siparişi). Eşleşmeyen anahtar validate hatası değildir; onu indicator ile görürsün.' },
      { t: 'predict',
        id: 'pandas-ileri-4',
        stage: 'Kodu oku',
        q: 'Bu kod ne yazdırır?',
        code: 'import pandas as pd\ndf = pd.DataFrame({\n    "sehir": ["Ankara", "Ankara", "İzmir", "İzmir"],\n    "ay": [1, 2, 1, 2],\n    "ciro": [100, 150, 80, 120],\n}).set_index(["sehir", "ay"])\nprint(df.xs(2, level="ay")["ciro"].tolist())\n',
        o: ['[100, 150]', '[150, 120]', '[80, 120]', 'KeyError hatası verir'],
        a: 1,
        why: 'xs(2, level="ay") iç seviyede ay == 2 olan satırları seçer ve o seviyeyi düşürür: Ankara 150, İzmir 120. [100, 150] dış seviyeden "Ankara" seçseydin gelirdi.' },
      { t: 'predict',
        id: 'pandas-ileri-5',
        stage: 'Kodu oku',
        q: 'Bu kod ne yazdırır?',
        code: 'import pandas as pd\ns = pd.Series([10, 20, 30, 40])\nprint(s.rolling(3).mean().tolist())\n',
        o: ['[10.0, 15.0, 20.0, 30.0]', '[nan, nan, 20.0, 30.0]', '[20.0, 30.0]', '[nan, 15.0, 20.0, 30.0]'],
        a: 1,
        why: 'rolling(3) pencere 3 satır dolana kadar NaN üretir; uzunluk korunur. İlk iki satırda da değer istersen min_periods=1 ver; o zaman [10.0, 15.0, 20.0, 30.0] olur.' },
      { t: 'predict',
        id: 'pandas-ileri-6',
        stage: 'Kodu oku',
        q: 'Bu kod ne yazdırır?',
        code: 'import pandas as pd\ndf = pd.DataFrame({"musteri": ["A", "B", "A", "A", "B"], "tutar": [100, 50, 70, 30, 20]})\nprint(df.groupby("musteri").cumcount().tolist(), df.groupby("musteri")["tutar"].cumsum().tolist())\n',
        o: ['[0, 0, 1, 2, 1] [100, 50, 170, 200, 70]', '[1, 1, 2, 3, 2] [100, 50, 170, 200, 70]', '[0, 1, 2, 3, 4] [100, 150, 220, 250, 270]', '[0, 0, 1, 2, 1] [100, 150, 220, 250, 270]'],
        a: 0,
        why: 'cumcount grup içinde 0\'dan sayar; cumsum her müşterinin kendi toplamını biriktirir. Gruplamadan cumsum alsaydın tüm tabloyu biriktirirdin (son şık).' },
      { t: 'order',
        id: 'pandas-ileri-7',
        stage: 'Kodu oku',
        q: '<p>Geniş ay tablosunu uzun biçime çevirip ay bazında toplam ciroyu yazdıran programın satırlarını sırala.</p>',
        lines: ['import pandas as pd', 'genis = pd.DataFrame({"sehir": ["Ankara", "İzmir"], "Oca": [100, 80], "Şub": [150, 120]})', 'uzun = genis.melt(id_vars="sehir", var_name="ay", value_name="ciro")', 'toplam = uzun.groupby("ay", sort=False)["ciro"].sum()', 'print(toplam.to_dict())'],
        expect: '{\'Oca\': 180, \'Şub\': 270}\n',
        hint: 'Önce içe aktar, sonra geniş tabloyu kur; groupby uzun tablo üzerinde çalışır.',
        why: 'melt ay sütunlarını "ay" sütununa indirir; ardından groupby("ay") her ayın şehirler toplamını verir. sort=False ayları ilk görülme sırasında tutar.' },
      { t: 'code',
        id: 'pandas-ileri-8',
        stage: 'Rehberli',
        diff: 1,
        q: '<p><code>uzun_yap(genis)</code> fonksiyonunu yaz. <code>genis</code> tablosunda <code>sehir</code> sütunu ve her ay için bir sütun var (<code>"Oca"</code>, <code>"Şub"</code>, ...). Fonksiyon <code>sehir</code>, <code>ay</code>, <code>ciro</code> sütunlu uzun bir DataFrame döndürsün; satırlar önce <code>sehir</code>\'e göre alfabetik, aynı şehirde ayların <b>orijinal sütun sırasıyla</b> gelsin ve index 0\'dan başlasın.</p>',
        guide: ['melt ile ay sütunlarını tek sütuna indir: id_vars="sehir", var_name="ay", value_name="ciro".', 'Ay sırasını korumak için ay sütununu, orijinal sütun sırasını kategori sırası yapan sıralı kategorik türe çevir (ya da sıralamada kararlı sort kullan).', 'sehir ve ay\'a göre sırala.', 'reset_index(drop=True) ile index\'i sıfırla ve döndür.'],
        example: 'import pandas as pd\nnot_tablosu = pd.DataFrame({"ogrenci": ["Can", "Ece"], "Vize": [70, 85], "Final": [60, 90]})\nuzun = not_tablosu.melt(id_vars="ogrenci", var_name="sinav", value_name="puan")\nuzun = uzun.sort_values("ogrenci", kind="stable").reset_index(drop=True)\nprint(uzun)\n',
        start: 'import pandas as pd\n\ndef uzun_yap(genis):\n    # TODO 1: melt ile uzun biçime çevir (id_vars="sehir", var_name="ay", value_name="ciro")\n    uzun = genis\n    # TODO 2: sehir\'e göre kararlı sırala (ayların sırası bozulmasın): sort_values("sehir", kind="stable")\n    # TODO 3: index\'i sıfırla\n    return uzun\n',
        sol: 'import pandas as pd\n\ndef uzun_yap(genis):\n    uzun = genis.melt(id_vars="sehir", var_name="ay", value_name="ciro")\n    uzun = uzun.sort_values("sehir", kind="stable")\n    return uzun.reset_index(drop=True)\n',
        tests: 'import pandas as pd\ng = pd.DataFrame({"sehir": ["İzmir", "Ankara"], "Oca": [80, 100], "Şub": [120, 150], "Mar": [90, 160]})\nr = uzun_yap(g)\nassert list(r.columns) == ["sehir", "ay", "ciro"], "Sütunlar sehir, ay, ciro olmalı"\nassert len(r) == 6, "2 şehir x 3 ay = 6 satır olmalı"\nassert r["sehir"].tolist() == ["Ankara"] * 3 + ["İzmir"] * 3, "Önce Ankara, sonra İzmir gelmeli"\nassert r["ay"].tolist()[:3] == ["Oca", "Şub", "Mar"], "Aylar orijinal sütun sırasında kalmalı (alfabetik değil)"\nassert r["ciro"].tolist() == [100, 150, 160, 80, 120, 90], "ciro değerleri yanlış eşleşmiş"\nassert r.index.tolist() == list(range(6)), "index 0\'dan başlamalı"\n',
        hints: ['Geniş → uzun dönüşümü melt ile yapılır.', 'genis.melt(id_vars="sehir", var_name="ay", value_name="ciro") sonra sort_values("sehir", kind="stable").', 'Kararlı (stable) sıralama eşit anahtarlarda melt\'in verdiği ay sırasını korur; sonra reset_index(drop=True).'],
        why: 'melt sütun sırasını ay sırası olarak korur; kararlı sıralama aynı şehirdeki satırların bu sırasını bozmaz. Ayı alfabetik sıralamak "Mar, Oca, Şub" gibi anlamsız bir sıra verirdi.' },
      { t: 'code',
        id: 'pandas-ileri-9',
        stage: 'Rehberli',
        diff: 2,
        q: '<p><code>hareketli_ort(df, pencere=3)</code> fonksiyonunu yaz. <code>df</code> tablosunda <code>sube</code>, <code>gun</code>, <code>adet</code> sütunları var ve her şubenin satırları güne göre sıralı. Fonksiyon <b>her şube için ayrı ayrı</b> son <code>pencere</code> günün hareketli ortalamasını <code>ort</code> sütunu olarak eklesin (ilk günlerde de değer olsun: <code>min_periods=1</code>), 2 basamağa yuvarlasın ve <b>kopya</b> döndürsün.</p>',
        guide: ['Orijinali bozmamak için df.copy() al.', 'groupby("sube")["adet"] ile şubelere böl.', 'transform içinde her grup Series\'ine rolling(pencere, min_periods=1).mean() uygula.', 'Sonucu round(2) ile yuvarlayıp "ort" sütununa yaz.'],
        example: 'import pandas as pd\nd = pd.DataFrame({"kasa": ["A", "A", "B", "B"], "bekleme": [4, 6, 10, 2]})\nd["kum_max"] = d.groupby("kasa")["bekleme"].transform(lambda s: s.expanding().max())\nprint(d)\n',
        start: 'import pandas as pd\n\ndef hareketli_ort(df, pencere=3):\n    y = df.copy()\n    # TODO: şube bazında rolling ortalama (transform + lambda)\n    y["ort"] = y["adet"].rolling(pencere, min_periods=1).mean()  # şubeleri karıştırıyor!\n    return y\n',
        sol: 'import pandas as pd\n\ndef hareketli_ort(df, pencere=3):\n    y = df.copy()\n    y["ort"] = (y.groupby("sube")["adet"]\n                .transform(lambda s: s.rolling(pencere, min_periods=1).mean())\n                .round(2))\n    return y\n',
        tests: 'import pandas as pd\nd = pd.DataFrame({"sube": ["K"] * 4 + ["Ç"] * 3, "gun": [1, 2, 3, 4, 1, 2, 3], "adet": [10, 14, 9, 20, 5, 7, 6]})\nr = hareketli_ort(d)\nassert "ort" not in d.columns, "Orijinal df değişmemeli; copy kullan"\nassert r["ort"].tolist()[:4] == [10.0, 12.0, 11.0, 14.33], "Kadıköy (K): [10.0, 12.0, 11.0, 14.33] olmalı"\nassert r["ort"].tolist()[4:] == [5.0, 6.0, 6.0], "Ç şubesi kendi geçmişiyle başlamalı: [5.0, 6.0, 6.0]; şubeleri karıştırma"\nr2 = hareketli_ort(d, pencere=2)\nassert r2["ort"].tolist()[3] == 14.5, "pencere=2 iken K\'nin 4. günü (9+20)/2 = 14.5"\n',
        hints: ['Grup içinde pencere için groupby + transform kalıbı kullanılır.', 'y.groupby("sube")["adet"].transform(lambda s: s.rolling(pencere, min_periods=1).mean())', 'Sonuna .round(2) ekleyip y["ort"]\'a ata.'],
        why: 'transform her grubun sonucunu orijinal satırlara geri hizalar; böylece Çankaya\'nın ilk günü Kadıköy\'ün son günleriyle karışmaz.' },
      { t: 'code',
        id: 'pandas-ileri-10',
        stage: 'Rehberli',
        diff: 2,
        q: '<p><code>segment_ata(df)</code> fonksiyonunu yaz: <code>tutar</code> sütununa göre <code>segment</code> sütunu eklenmiş <b>yeni</b> bir DataFrame döndürsün. Kural: tutar ≥ 1000 → <code>"Altın"</code>, 500 ≤ tutar &lt; 1000 → <code>"Gümüş"</code>, diğerleri → <code>"Bronz"</code>. <code>apply</code> kullanma; <code>np.select</code> ve <code>assign</code> kullan.</p>',
        guide: ['Koşul listesini yaz: önce en dar (≥ 1000), sonra ≥ 500. np.select ilk doğru koşulu seçer.', 'Seçenek listesi koşullarla aynı sırada olsun: ["Altın", "Gümüş"].', 'default="Bronz" ile kalan satırları doldur.', 'df.assign(segment=...) yeni DataFrame döndürür; onu return et.'],
        example: 'import numpy as np\nimport pandas as pd\nd = pd.DataFrame({"sicaklik": [-3, 12, 28]})\nkosul = [d["sicaklik"] < 0, d["sicaklik"] < 20]\nd = d.assign(durum=np.select(kosul, ["Don", "Serin"], default="Sıcak"))\nprint(d)\n',
        start: 'import numpy as np\nimport pandas as pd\n\ndef segment_ata(df):\n    # TODO 1: kosullar = [... >= 1000, ... >= 500]\n    # TODO 2: secenekler = ["Altın", "Gümüş"]\n    # TODO 3: return df.assign(segment=np.select(kosullar, secenekler, default="Bronz"))\n    return df\n',
        sol: 'import numpy as np\nimport pandas as pd\n\ndef segment_ata(df):\n    kosullar = [df["tutar"] >= 1000, df["tutar"] >= 500]\n    secenekler = ["Altın", "Gümüş"]\n    return df.assign(segment=np.select(kosullar, secenekler, default="Bronz"))\n',
        tests: 'import pandas as pd\nd = pd.DataFrame({"tutar": [1500, 999.99, 500, 120, 1000]})\nr = segment_ata(d)\nassert "segment" in r.columns, "segment sütunu eklenmeli"\nassert r["segment"].tolist() == ["Altın", "Gümüş", "Gümüş", "Bronz", "Altın"], "Sınırlar: 1000 Altın, 500 Gümüş, 999.99 Gümüş olmalı"\nassert "segment" not in d.columns, "Orijinal df değişmemeli (assign yeni tablo döndürür)"\nassert "apply" not in __kod__, "apply kullanmadan np.select ile çöz"\n',
        hints: ['Çok koşullu atama np.select ile yapılır.', 'Koşul sırası önemli: >= 1000 önce gelmeli, yoksa 1500 de "Gümüş" olur.', 'return df.assign(segment=np.select([df["tutar"] >= 1000, df["tutar"] >= 500], ["Altın", "Gümüş"], default="Bronz"))'],
        why: 'np.select koşulları sırayla dener ve ilk doğru olanın değerini alır; vektörel çalıştığı için apply\'dan çok hızlıdır. assign orijinal tabloyu değiştirmeden yeni sütunlu kopya döndürür.' },
      { t: 'code',
        id: 'pandas-ileri-11',
        stage: 'Kendin yaz',
        diff: 2,
        q: '<p><code>sehir_ici_sira(df)</code> fonksiyonu <code>sehir</code>, <code>urun</code>, <code>ciro</code> sütunlu tabloya <code>sira</code> sütunu eklesin: her şehir içinde ciroya göre <b>azalan</b> dense rank, tam sayı (<code>int</code>) olarak. Ardından yalnızca <code>sira &lt;= 2</code> olan satırları, <code>sehir</code> ve <code>sira</code>\'ya göre sıralı ve index\'i sıfırlanmış olarak döndürsün.</p>',
        sol: 'import pandas as pd\n\ndef sehir_ici_sira(df):\n    y = df.copy()\n    y["sira"] = y.groupby("sehir")["ciro"].rank(method="dense", ascending=False).astype(int)\n    y = y[y["sira"] <= 2]\n    return y.sort_values(["sehir", "sira"], kind="stable").reset_index(drop=True)\n',
        start: 'import pandas as pd\n\ndef sehir_ici_sira(df):\n    pass\n',
        tests: 'import pandas as pd\nd = pd.DataFrame({"sehir": ["Ankara"] * 4 + ["İzmir"] * 3, "urun": ["Çay", "Kahve", "Süt", "Un", "Çay", "Kahve", "Süt"], "ciro": [500, 900, 500, 100, 300, 250, 700]})\nr = sehir_ici_sira(d)\nassert str(r["sira"].dtype).startswith("int"), "sira tam sayı olmalı (astype(int))"\nank = r[r["sehir"] == "Ankara"]\nassert ank["urun"].tolist() == ["Kahve", "Çay", "Süt"], "Ankara: Kahve (1), Çay ve Süt eşit (2) — dense rank eşitleri birlikte tutar"\nassert ank["sira"].tolist() == [1, 2, 2], "Ankara sıraları [1, 2, 2]"\nassert r[r["sehir"] == "İzmir"]["urun"].tolist() == ["Süt", "Çay"], "İzmir: Süt, Çay"\nassert r.index.tolist() == list(range(len(r))), "index sıfırlanmalı"\n',
        hints: ['groupby("sehir")["ciro"].rank(method="dense", ascending=False)', 'rank float döndürür; .astype(int) ile çevir, sonra filtrele ve sort_values(["sehir", "sira"]).'],
        why: 'Grup içi dense rank SQL\'deki DENSE_RANK() OVER (PARTITION BY sehir ORDER BY ciro DESC) ile aynıdır; eşit cirolu ürünler aynı sırayı paylaşır ve ikisi de rapora girer.' },
      { t: 'code',
        id: 'pandas-ileri-12',
        stage: 'Kendin yaz',
        diff: 2,
        q: '<p><code>musteri_gecmisi(df)</code> fonksiyonu <code>musteri</code>, <code>tarih</code> (datetime), <code>tutar</code> sütunlu sipariş tablosunu önce <code>tarih</code>\'e göre (kararlı) sıralasın, sonra iki sütun eklesin: <code>kacinci</code> (müşterinin kaçıncı siparişi, 1\'den başlar) ve <code>kumulatif</code> (müşterinin o ana kadarki toplam harcaması). Sıralanmış tabloyu index\'i sıfırlanmış olarak döndürsün.</p>',
        sol: 'import pandas as pd\n\ndef musteri_gecmisi(df):\n    y = df.sort_values("tarih", kind="stable").reset_index(drop=True)\n    g = y.groupby("musteri")\n    y["kacinci"] = g.cumcount() + 1\n    y["kumulatif"] = g["tutar"].cumsum()\n    return y\n',
        start: 'import pandas as pd\n\ndef musteri_gecmisi(df):\n    pass\n',
        tests: 'import pandas as pd\nd = pd.DataFrame({"musteri": ["A", "B", "A", "A", "B"], "tarih": pd.to_datetime(["2024-03-05", "2024-03-01", "2024-03-01", "2024-03-09", "2024-03-07"]), "tutar": [70, 50, 100, 30, 20]})\nr = musteri_gecmisi(d)\nassert r["tarih"].is_monotonic_increasing, "Tablo tarihe göre sıralanmalı"\nassert r["musteri"].tolist() == ["B", "A", "A", "B", "A"], "Sıralı müşteri dizisi B, A, A, B, A olmalı"\nassert r["kacinci"].tolist() == [1, 1, 2, 2, 3], "kacinci 1\'den başlamalı: [1, 1, 2, 2, 3]"\nassert r["kumulatif"].tolist() == [50, 100, 170, 70, 200], "kumulatif müşteri bazında birikmeli: [50, 100, 170, 70, 200]"\n',
        hints: ['Önce sort_values("tarih"), sonra groupby("musteri").', 'cumcount() 0\'dan başlar; +1 ekle. Kümülatif için ["tutar"].cumsum().'],
        why: 'Kümülatif işlemler satır sırasına bağlıdır; önce tarihe göre sıralamazsan "kaçıncı sipariş" yanlış olur. cumcount ve cumsum grup içinde çalışır.' },
      { t: 'code',
        id: 'pandas-ileri-13',
        stage: 'Kendin yaz',
        diff: 2,
        q: '<p><code>guvenli_birlestir(siparis, musteri)</code> fonksiyonu iki tabloyu <code>musteri_id</code> üzerinden <b>left</b> merge ile birleştirsin; <code>validate="many_to_one"</code> ve <code>indicator=True</code> kullansın. Bir demet döndürsün: <code>(birlesik, eslesmeyen)</code>. <code>birlesik</code>\'te <code>_merge</code> sütunu <b>olmasın</b>; <code>eslesmeyen</code>, müşterisi bulunamayan siparişlerin <code>siparis_id</code> listesi olsun. Müşteri tablosunda yinelenen anahtar varsa fonksiyon <code>pd.errors.MergeError</code> fırlatsın (yakalama).</p>',
        sol: 'import pandas as pd\n\ndef guvenli_birlestir(siparis, musteri):\n    b = pd.merge(siparis, musteri, on="musteri_id", how="left", validate="many_to_one", indicator=True)\n    eslesmeyen = b.loc[b["_merge"] == "left_only", "siparis_id"].tolist()\n    return b.drop(columns="_merge"), eslesmeyen\n',
        start: 'import pandas as pd\n\ndef guvenli_birlestir(siparis, musteri):\n    pass\n',
        tests: 'import pandas as pd\ns = pd.DataFrame({"siparis_id": [1, 2, 3, 4], "musteri_id": [10, 20, 10, 99], "tutar": [150, 80, 60, 40]})\nm = pd.DataFrame({"musteri_id": [10, 20], "ad": ["Ayşe", "Mehmet"]})\nb, e = guvenli_birlestir(s, m)\nassert len(b) == 4, "left merge sipariş sayısını korumalı"\nassert "_merge" not in b.columns, "_merge sütununu düşür"\nassert e == [4], "99 numaralı müşteri yok; eşleşmeyen sipariş [4]"\nassert b.loc[b["siparis_id"] == 3, "ad"].iloc[0] == "Ayşe", "3 numaralı sipariş Ayşe\'ye ait"\nm2 = pd.DataFrame({"musteri_id": [10, 10, 20], "ad": ["Ayşe", "Ayşe2", "Mehmet"]})\ntry:\n    guvenli_birlestir(s, m2)\n    assert False, "Yinelenen müşteri anahtarında MergeError bekleniyordu (validate=\\"many_to_one\\")"\nexcept pd.errors.MergeError:\n    pass\n',
        hints: ['pd.merge(..., how="left", validate="many_to_one", indicator=True)', 'Eşleşmeyenler: b["_merge"] == "left_only". Sonra b.drop(columns="_merge").'],
        why: 'validate sessiz satır çoğalmasını hataya çevirir; indicator ise eşleşmeyen kayıtları görünür kılar. İkisi birlikte birleştirmenin veri kalitesi denetimidir.' },
      { t: 'code',
        id: 'pandas-ileri-14',
        stage: 'Kendin yaz',
        diff: 2,
        q: '<p><code>kategorik_yap(df, esik=0.5)</code> fonksiyonu, metin sütunlarından farklı değer oranı (<code>nunique() / len(df)</code>) <code>esik</code>\'ten <b>küçük</b> olanları <code>category</code> türüne çevirsin ve yeni DataFrame döndürsün. Sayısal sütunlara ve oranı yüksek (neredeyse tekil) metin sütunlarına dokunma. Metin sütununu <code>pd.api.types.is_string_dtype(df[s])</code> ile tanı.</p>',
        sol: 'import pandas as pd\n\ndef kategorik_yap(df, esik=0.5):\n    y = df.copy()\n    for s in y.columns:\n        if pd.api.types.is_string_dtype(y[s]) and y[s].nunique() / len(y) < esik:\n            y[s] = y[s].astype("category")\n    return y\n',
        start: 'import pandas as pd\n\ndef kategorik_yap(df, esik=0.5):\n    pass\n',
        tests: 'import pandas as pd\nd = pd.DataFrame({"siparis_no": [f"AM-{i}" for i in range(8)], "sehir": ["Ankara", "İzmir"] * 4, "adet": [1, 2, 3, 1, 2, 3, 1, 2]})\nr = kategorik_yap(d)\nassert isinstance(r["sehir"].dtype, pd.CategoricalDtype), "sehir (2 farklı / 8 satır) category olmalı"\nassert not isinstance(r["siparis_no"].dtype, pd.CategoricalDtype), "siparis_no tekil; category yapma"\nassert str(r["adet"].dtype).startswith("int"), "Sayısal sütuna dokunma"\nassert not isinstance(d["sehir"].dtype, pd.CategoricalDtype), "Orijinal df değişmemeli"\nassert r.memory_usage(deep=True).sum() < d.memory_usage(deep=True).sum(), "Bellek azalmalı"\nr2 = kategorik_yap(d, esik=0.1)\nassert not isinstance(r2["sehir"].dtype, pd.CategoricalDtype), "esik=0.1 iken oran 0.25 olduğundan çevrilmemeli"\n',
        hints: ['Sütunlarda dolaş; is_string_dtype ve nunique()/len(df) < esik koşulunu birlikte kontrol et.', 'Çevirmek için y[s] = y[s].astype("category"); önce df.copy() al.'],
        why: 'Farklı değeri az olan metin sütunları category türünde her değeri bir kez saklar; tekil sütunlarda (sipariş no) ise kodlar + kategori listesi metinden daha fazla yer tutar, bu yüzden oran eşiği kullanılır.' },
      { t: 'code',
        id: 'pandas-ileri-15',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 2,
        q: '<p><b>Hatayı bul ve düzelt.</b> <code>indirim_uygula(df)</code> Ankara siparişlerine 0.10, diğerlerine 0.0 indirim oranı yazan <code>indirim</code> sütunu eklenmiş kopya döndürmeli. Kod çalışıyor ama tüm indirimler 0 çıkıyor. Neden?</p>',
        start: 'import pandas as pd\n\ndef indirim_uygula(df):\n    y = df.copy()\n    y["indirim"] = 0.0\n    y[y["sehir"] == "Ankara"]["indirim"] = 0.10\n    return y\n',
        sol: 'import pandas as pd\n\ndef indirim_uygula(df):\n    y = df.copy()\n    y["indirim"] = 0.0\n    y.loc[y["sehir"] == "Ankara", "indirim"] = 0.10\n    return y\n',
        tests: 'import pandas as pd\nd = pd.DataFrame({"sehir": ["Ankara", "İzmir", "Ankara"], "tutar": [100, 200, 300]})\nr = indirim_uygula(d)\nassert r["indirim"].tolist() == [0.10, 0.0, 0.10], "Ankara satırları 0.10 olmalı; zincirleme atama kopyaya yazar, .loc[maske, sütun] kullan"\nassert "indirim" not in d.columns, "Orijinal df değişmemeli"\n',
        hints: ['y[maske]["indirim"] = ... iki ayrı indeksleme adımıdır (zincirleme atama).', 'İlk adım kopya üretir; atama o kopyaya gider. Tek adımda yaz: y.loc[maske, "indirim"] = 0.10'],
        why: 'Zincirleme atamada ilk köşeli parantez bir kopya döndürür, ikinci atama o geçici kopyayı değiştirir. .loc[satır_maskesi, sütun] tek işlemde asıl tabloya yazar; pandas 3\'ün Copy-on-Write modelinde tek doğru yol budur.' },
      { t: 'code',
        id: 'pandas-ileri-16',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 2,
        q: '<p><b>Hatayı bul ve düzelt.</b> <code>aylik_tablo(df)</code> uzun biçimli (<code>sehir</code>, <code>ay</code>, <code>ciro</code>) tablodan satırlarda şehir, sütunlarda ay olan bir tablo üretmeli; aynı şehir-ay çifti birden çok kez geçebilir ve bu durumda cirolar <b>toplanmalı</b>, boş hücreler 0 olmalı. Kod <code>ValueError</code> veriyor.</p>',
        start: 'import pandas as pd\n\ndef aylik_tablo(df):\n    return df.pivot(index="sehir", columns="ay", values="ciro").fillna(0)\n',
        sol: 'import pandas as pd\n\ndef aylik_tablo(df):\n    return df.pivot_table(index="sehir", columns="ay", values="ciro", aggfunc="sum", fill_value=0)\n',
        tests: 'import pandas as pd\nd = pd.DataFrame({"sehir": ["Ankara", "Ankara", "İzmir", "Ankara"], "ay": [1, 1, 2, 2], "ciro": [100, 50, 80, 30]})\nr = aylik_tablo(d)\nassert r.loc["Ankara", 1] == 150, "Ankara-1 yinelenen iki satır toplanmalı: 150"\nassert r.loc["İzmir", 1] == 0, "Olmayan çift 0 olmalı"\nassert r.loc["Ankara", 2] == 30 and r.loc["İzmir", 2] == 80, "Diğer hücreler yanlış"\nassert r.shape == (2, 2), "2 şehir x 2 ay"\n',
        hints: ['pivot yinelenen (index, columns) çiftini kabul etmez.', 'pivot_table(..., aggfunc="sum", fill_value=0) yinelenenleri toplar ve boşları doldurur.'],
        why: 'pivot yalnızca yeniden düzenler ve her hücre için tek değer bekler. Yinelenen çiftlerin nasıl birleşeceğini pivot_table\'ın aggfunc parametresi tanımlar.' },
      { t: 'code',
        id: 'pandas-ileri-17',
        stage: 'Meydan okuma',
        diff: 3,
        q: '<p><code>en_uzun_artis(df)</code> fonksiyonu <code>magaza</code>, <code>gun</code>, <code>satis</code> sütunlu tabloyu alsın (her mağaza içinde günler sıralı olmayabilir). Her mağaza için satışın bir önceki güne göre <b>kesintisiz arttığı</b> en uzun gün serisinin uzunluğunu (artış sayısı) hesaplasın ve <code>{magaza: uzunluk}</code> sözlüğü döndürsün. Hiç artış yoksa ya da tek gün varsa 0. Döngüyle satır satır değil, <code>diff</code>, <code>cumsum</code> ve <code>groupby</code> ile vektörel çöz.</p><p>Örnek: satışlar 5, 7, 9, 4, 6 → artışlar (7&gt;5, 9&gt;7) art arda 2, sonra (6&gt;4) 1 → sonuç 2.</p>',
        sol: 'import pandas as pd\n\ndef en_uzun_artis(df):\n    y = df.sort_values(["magaza", "gun"]).copy()\n    y["artti"] = y.groupby("magaza")["satis"].diff() > 0\n    # artış olmayan her satırda yeni bir blok başlar\n    y["blok"] = (~y["artti"]).cumsum()\n    seri = y[y["artti"]].groupby(["magaza", "blok"]).size()\n    sonuc = {m: 0 for m in y["magaza"].unique()}\n    if len(seri):\n        for m, v in seri.groupby(level="magaza").max().items():\n            sonuc[m] = int(v)\n    return sonuc\n',
        start: 'import pandas as pd\n\ndef en_uzun_artis(df):\n    pass\n',
        tests: 'import pandas as pd\nd = pd.DataFrame({"magaza": ["A"] * 5 + ["B"] * 4 + ["C"], "gun": [1, 2, 3, 4, 5, 4, 3, 2, 1, 1], "satis": [5, 7, 9, 4, 6, 1, 2, 3, 4, 10]})\nr = en_uzun_artis(d)\nassert r["A"] == 2, "A: 5,7,9 → 2 art arda artış"\nassert r["B"] == 0, "B: günlere göre sıralayınca 4,3,2,1 → hiç artış yok (önce gün sırasına koy)"\nassert r["C"] == 0, "C: tek gün → 0"\nd2 = pd.DataFrame({"magaza": ["X"] * 6, "gun": range(6), "satis": [1, 2, 3, 4, 5, 6]})\nassert en_uzun_artis(d2) == {"X": 5}, "Sürekli artan 6 gün → 5 artış"\nd3 = pd.DataFrame({"magaza": ["Y"] * 4, "gun": range(4), "satis": [3, 3, 3, 3]})\nassert en_uzun_artis(d3) == {"Y": 0}, "Eşitlik artış sayılmaz"\nfor k, v in r.items():\n    assert type(v) is int, "Değerler Python int olmalı"\n',
        hints: ['Önce magaza ve gun\'e göre sırala; grup içi diff() > 0 artışı işaretler.', 'Artış olmayan satırlar (False) yeni blok başlatır: (~artti).cumsum() blok numarası verir.', 'Yalnızca artış satırlarını alıp (magaza, blok) bazında say; mağaza bazında maksimumu al, hiç artışı olmayanlara 0 yaz.'],
        why: '"Ardışık seri" problemleri pandas\'ta klasik bir hileyle çözülür: kesinti noktalarında artan bir sayaç (cumsum) her seriye benzersiz bir blok numarası verir; sonra blokları saymak yeterlidir. Döngüsüz olduğu için milyonlarca satırda da hızlıdır.' },
      { t: 'code',
        id: 'pandas-ileri-18',
        stage: 'Mini proje',
        diff: 3,
        q: '<p>Anadolu Market aylık raporu. <code>aylik_rapor(siparis, urun)</code> fonksiyonunu yaz:</p><ol><li><code>siparis</code> (<code>sehir</code>, <code>urun_id</code>, <code>adet</code>) ile <code>urun</code> (<code>urun_id</code>, <code>kategori</code>, <code>fiyat</code>) tablosunu <code>urun_id</code> üzerinden <code>validate="many_to_one"</code> ile birleştir.</li><li><code>tutar = adet * fiyat</code> ekle.</li><li>Satırda <code>sehir</code>, sütunda <code>kategori</code> (alfabetik), hücrede tutar toplamı olan pivot tablo kur (boşlar 0).</li><li><code>Toplam</code> sütunu (satır toplamı) ve <code>Sira</code> sütunu (Toplam\'a göre azalan, <code>method="min"</code>, int) ekle.</li><li>Tabloyu <code>Sira</code>\'ya göre sırala ve döndür (index: sehir).</li></ol>',
        sol: 'import pandas as pd\n\ndef aylik_rapor(siparis, urun):\n    tablo = (\n        siparis\n        .merge(urun, on="urun_id", how="left", validate="many_to_one")\n        .assign(tutar=lambda d: d["adet"] * d["fiyat"])\n        .pivot_table(index="sehir", columns="kategori", values="tutar", aggfunc="sum", fill_value=0)\n    )\n    tablo = tablo[sorted(tablo.columns)]\n    tablo.columns.name = None\n    tablo["Toplam"] = tablo.sum(axis=1)\n    tablo["Sira"] = tablo["Toplam"].rank(method="min", ascending=False).astype(int)\n    return tablo.sort_values("Sira", kind="stable")\n',
        start: 'import pandas as pd\n\ndef aylik_rapor(siparis, urun):\n    pass\n',
        tests: 'import pandas as pd\ns = pd.DataFrame({"sehir": ["Ankara", "İzmir", "Ankara", "Bursa", "İzmir", "Bursa"], "urun_id": [1, 2, 3, 1, 1, 2], "adet": [2, 1, 4, 1, 3, 2]})\nu = pd.DataFrame({"urun_id": [1, 2, 3], "kategori": ["Gıda", "Elektronik", "Gıda"], "fiyat": [50.0, 900.0, 25.0]})\nr = aylik_rapor(s, u)\nassert list(r.columns) == ["Elektronik", "Gıda", "Toplam", "Sira"], "Sütunlar: kategoriler (alfabetik), Toplam, Sira"\nassert r.index.tolist() == ["Bursa", "İzmir", "Ankara"], "Sıra: Bursa (1850), İzmir (1050), Ankara (200)"\nassert r.loc["Ankara", "Gıda"] == 200 and r.loc["Ankara", "Elektronik"] == 0, "Ankara: Gıda 200, Elektronik 0"\nassert r["Toplam"].tolist() == [1850, 1050, 200], "Toplamlar yanlış"\nassert r["Sira"].tolist() == [1, 2, 3], "Sira 1, 2, 3"\nu2 = pd.concat([u, pd.DataFrame({"urun_id": [1], "kategori": ["Gıda"], "fiyat": [55.0]})])\ntry:\n    aylik_rapor(s, u2)\n    assert False, "Ürün tablosunda yinelenen urun_id varsa MergeError bekleniyordu"\nexcept pd.errors.MergeError:\n    pass\n',
        hints: ['Zincir: merge(validate=...) → assign(tutar=...) → pivot_table(...).', 'Toplam için tablo.sum(axis=1); Sira için rank(method="min", ascending=False).astype(int).', 'Sütun adı başlığını (columns.name) temizlemek zorunlu değil; kategori sütunlarını sorted(...) ile sırala, Toplam ve Sira\'yı en son ekle.'],
        why: 'Gerçek raporlar tek tek tekniklerin zinciridir: güvenli birleştirme, türetilmiş sütun, çapraz tablo ve sıralama. validate sayesinde ürün tablosundaki tek bir yinelenen kayıt raporu sessizce şişirmez, hata verir.' }
    ],
    faq: [
      { q: 'MultiIndex\'ten tamamen kurtulmak istiyorum, en kısa yol?',
        a: 'reset_index() tüm seviyeleri sütuna çevirir. Sütunlarda MultiIndex varsa (pivot_table ya da agg sonrası) sütun adlarını düzleştir: df.columns = ["_".join(map(str, c)) for c in df.columns].' },
      { q: 'rolling ile resample farkı ne?',
        a: 'rolling her satırda geriye doğru kayan bir pencere hesaplar ve satır sayısını korur. resample zamanı kovalara böler (gün, hafta, ay) ve her kova için tek satır üretir. Zaman serisi dersinde resample\'ı ayrıntılı göreceksin.' },
      { q: 'query mi, boolean maske mi?',
        a: 'İkisi aynı sonucu verir. query uzun filtrelerde daha okunurdur ve zincire kolay girer; sütun adında boşluk varsa ters tırnakla yazılır. Maske ise IDE desteği ve tip denetimi açısından daha açıktır. Ekipte tek stil seç.' },
      { q: 'apply\'ı hiç mi kullanmayacağım?',
        a: 'Kullanırsın, ama son çare olarak. Satır başına dış servis çağrısı, karmaşık metin ayrıştırma ya da vektörel karşılığı olmayan bir kütüphane fonksiyonu için apply uygundur. Önce sütun aritmetiği, .str/.dt, map ve np.select dene.' }
    ],
    mistakes: [
      { bad: 'df["ort"] = df["adet"].rolling(3).mean()  # birden çok şube var',
        good: 'df["ort"] = df.groupby("sube")["adet"].transform(lambda s: s.rolling(3).mean())',
        why: 'Gruplamadan pencere almak bir şubenin verisini diğerinin penceresine karıştırır.' },
      { bad: 'df.pivot(index="sehir", columns="ay", values="ciro")  # yinelenen çiftler var',
        good: 'df.pivot_table(index="sehir", columns="ay", values="ciro", aggfunc="sum")',
        why: 'pivot yinelenen anahtarda ValueError verir; birleştirme kuralı pivot_table\'ın aggfunc\'ı ile yazılır.' },
      { bad: 'df[df["sehir"] == "Ankara"]["indirim"] = 0.1',
        good: 'df.loc[df["sehir"] == "Ankara", "indirim"] = 0.1',
        why: 'Zincirleme atama geçici bir kopyaya yazar; asıl tablo değişmez.' },
      { bad: 'pd.merge(siparis, musteri, on="musteri_id")',
        good: 'pd.merge(siparis, musteri, on="musteri_id", how="left", validate="many_to_one")',
        why: 'Sağ tabloda yinelenen anahtar satırları sessizce çoğaltır; validate bunu hataya çevirir.' },
      { bad: 'df.swaplevel().loc["Ocak":"Mart"]',
        good: 'df.swaplevel().sort_index().loc["Ocak":"Mart"]',
        why: 'Sırasız MultiIndex üzerinde dilimleme UnsortedIndexError verebilir ya da yavaş çalışır; seviye değiştirdikten sonra sort_index çağır.' }
    ]
  }
);
})(window);
