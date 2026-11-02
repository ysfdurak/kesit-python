/* PythonPatika — v2/i1: İleri görselleştirme: seaborn, plotly ve doğru grafik */
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push(
  {
    id: 'seaborn-plotly',
    lv: 'ileri',
    mod: 'Veri Bilimi Araçları',
    min: 50,
    needs: ['matplotlib', 'pandas'],
    title: 'İleri görselleştirme: seaborn, plotly ve doğru grafik',
    sum: 'seaborn ile istatistiksel grafikler (histplot, boxplot, violinplot, heatmap, pairplot, FacetGrid), plotly express ile etkileşim, altair, grafik seçimi rehberi, renk ve erişilebilirlik, yanıltıcı grafikler; alıştırmalar matplotlib ile.',
    goals: ['Bir iş sorusuna uygun grafik türünü seçip gerekçelendirebilirim', 'seaborn ve plotly express kodunu okuyup aynı grafiği matplotlib ile kurabilirim', 'Grafik için veriyi uzun biçime, sıralı kategoriye ve özet tabloya hazırlayabilirim', 'Renk körü dostu palet, kontrast ve doğrudan etiketle erişilebilir grafik üretebilirim', 'Kesik eksen, çift eksen gibi yanıltıcı grafik tuzaklarını tanıyıp düzeltebilirim'],
    body: `<h2>Doğru soruya doğru grafik</h2>
<p><b>matplotlib ile görselleştirme</b> dersinde Figure/Axes yapısını, çizgi, çubuk ve histogramı kurdun. Gerçek işte bunun bir üst katı gelir: "Sepet tutarı şehirlere göre nasıl dağılıyor?" sorusu için kutu grafiği, "Hangi değişkenler birlikte hareket ediyor?" için korelasyon ısı haritası, "Her şehirde trend aynı mı?" için küçük çoklu grafikler (small multiples), yöneticinin fareyle üzerine gelip değer okuyacağı etkileşimli bir grafik. Bu işler için Python dünyasında iki yıldız vardır: <b>seaborn</b> (istatistiksel grafik, matplotlib üstüne kurulu) ve <b>plotly</b> (etkileşimli, tarayıcıda çalışan grafik).</p>
<p>Ama araçtan önemlisi karardır: hangi soru, hangi grafik, hangi renk ve hangi eksen. Kötü seçilmiş bir grafik, doğru veriyle yanlış karar aldırır. Bu ders hem araçları hem de bu karar rehberini verir.</p>
<div class="note"><b>Bu ortamda</b>seaborn ve plotly tarayıcıdaki Python'da (Pyodide) çalışmaz. Bu yüzden kodlarını çalıştır düğmesi olmayan kutularda gösteriyoruz; kendi bilgisayarında denemen için kurulum komutunu altına yazdık. Çalıştırılabilir örnekler ve alıştırmalar aynı grafikleri <b>matplotlib</b> ile kurar ve grafiğin yapısını (başlık, çubuk sayısı, eksen etiketi) test eder. seaborn zaten matplotlib üstünde çalıştığı için burada öğrendiğin her yapı birebir geçerlidir.</div>

<h2>seaborn: tidy veri ile tek satırlık grafikler</h2>
<p>seaborn'un sihri şudur: veriyi <b>uzun (tidy)</b> biçimde verirsin, sütun adlarını eksenlere ve renk (<code>hue</code>), panel (<code>col</code>, <code>row</code>) gibi görsel kanallara bağlarsın; gruplama, renk paleti ve gösterge (legend) kendiliğinden gelir.</p>
<pre class="code">import seaborn as sns
import matplotlib.pyplot as plt

sns.set_theme(style="whitegrid")              # tutarlı tema
# df: siparis_id, sehir, kategori, adet, tutar, segment

sns.histplot(data=df, x="tutar", bins=20, kde=True)               # dağılım
sns.boxplot(data=df, x="sehir", y="tutar")                        # gruplara göre dağılım
sns.violinplot(data=df, x="sehir", y="tutar", inner="quartile")   # dağılımın şekli
sns.scatterplot(data=df, x="adet", y="tutar", hue="segment")      # ilişki + renkle grup
sns.pairplot(df[["adet", "tutar", "indirim"]])                    # tüm ikili ilişkiler

kor = df[["adet", "tutar", "indirim"]].corr()
sns.heatmap(kor, annot=True, fmt=".2f", cmap="vlag", vmin=-1, vmax=1)

g = sns.FacetGrid(aylik, col="sehir", col_wrap=3, sharey=True)    # küçük çoklu grafikler
g.map_dataframe(sns.lineplot, x="ay", y="ciro")
plt.show()</pre>
<div class="tip"><b>Kendi bilgisayarında dene</b><code>pip install seaborn</code> komutuyla kurulur (matplotlib ve pandas'ı da getirir). Jupyter'de grafik hücrenin altında görünür; betikte <code>plt.show()</code> pencere açar, <code>plt.savefig("grafik.png", dpi=150)</code> dosyaya yazar.</div>
<p>seaborn fonksiyonları iki türdür. <b>Eksen düzeyi</b> (axes-level: <code>histplot</code>, <code>boxplot</code>, <code>scatterplot</code>, <code>heatmap</code>) tek bir Axes'e çizer ve <code>ax=</code> parametresi alır; matplotlib'in alt grafiklerine yerleştirebilirsin. <b>Figür düzeyi</b> (figure-level: <code>relplot</code>, <code>displot</code>, <code>catplot</code>, <code>pairplot</code>, <code>FacetGrid</code>) kendi figürünü kurar ve <code>col=</code>/<code>row=</code> ile panellere böler.</p>

<h2>Aynı grafikleri matplotlib ile kurmak</h2>
<p>seaborn'un yaptığı işin altında matplotlib nesneleri vardır. Gruplara göre kutu ve keman grafiği (violin plot) için veriyi önce gruplara bölmek yeterlidir.</p>
<pre class="py">import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import pandas as pd

df = pd.DataFrame({
    "sehir": ["Ankara"] * 6 + ["İzmir"] * 6 + ["Bursa"] * 6,
    "tutar": [120, 340, 95, 410, 260, 1500, 80, 150, 210, 175, 140, 190, 300, 320, 280, 350, 310, 900],
})
sehirler = sorted(df["sehir"].unique())
gruplar = [df.loc[df["sehir"] == s, "tutar"].to_numpy() for s in sehirler]

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 4), sharey=True)
ax1.boxplot(gruplar)
ax1.set_xticks(range(1, len(sehirler) + 1), sehirler)
ax1.set_title("Kutu grafiği")
ax1.set_ylabel("Sepet tutarı (TL)")
ax2.violinplot(gruplar, showmedians=True)
ax2.set_xticks(range(1, len(sehirler) + 1), sehirler)
ax2.set_title("Keman grafiği")
fig.savefig("dagilim.png", dpi=100, bbox_inches="tight")
plt.close(fig)

print("eksen etiketleri:", [t.get_text() for t in ax1.get_xticklabels()])
print(df.groupby("sehir")["tutar"].describe()[["min", "25%", "50%", "75%", "max"]])</pre>
<p>Kutu grafiği beş sayıyı (min, Q1, medyan, Q3, maks) ve aykırı değerleri gösterir: Ankara'daki 1500 TL'lik sipariş ayrı bir nokta olarak görünür. Keman grafiği ise dağılımın şeklini (iki tepeli mi, çarpık mı) da gösterir.</p>
<p>Korelasyon ısı haritası (heatmap) da bir <code>imshow</code> ve her hücreye bir <code>text</code>'tir. Dikkat: <code>imshow</code>'da x ekseni <b>sütun</b>, y ekseni <b>satır</b> indeksidir; hücre yazısı <code>ax.text(j, i, ...)</code> ile yazılır.</p>
<pre class="py">import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import pandas as pd

df = pd.DataFrame({
    "adet": [1, 3, 2, 5, 4, 6, 2, 8],
    "tutar": [120, 310, 260, 480, 450, 640, 190, 820],
    "indirim": [0, 5, 0, 10, 10, 15, 0, 20],
    "teslim_gun": [3, 2, 4, 1, 2, 1, 5, 1],
})
kor = df.corr().round(2)
fig, ax = plt.subplots(figsize=(5, 4))
im = ax.imshow(kor.to_numpy(), cmap="RdBu_r", vmin=-1, vmax=1)
ax.set_xticks(range(len(kor.columns)), kor.columns, rotation=45)
ax.set_yticks(range(len(kor.index)), kor.index)
for i in range(len(kor.index)):
    for j in range(len(kor.columns)):
        ax.text(j, i, f"{kor.iloc[i, j]:.2f}", ha="center", va="center")
fig.colorbar(im, ax=ax)
ax.set_title("Korelasyon matrisi")
plt.close(fig)
print(kor)
print("hücre yazısı:", len(ax.texts), "| renk skalası:", im.get_clim())</pre>
<div class="warn"><b>Diverging skala ve sabit sınır</b>Korelasyon -1 ile 1 arasındadır ve 0 anlamlı bir orta noktadır. Bu yüzden iki uçlu (diverging) bir palet (RdBu, vlag) ve <code>vmin=-1, vmax=1</code> kullan. Sınırı vermezsen renkler verideki en küçük ve en büyük değere göre gerilir; 0.3'lük zayıf bir korelasyon koyu kırmızı görünebilir.</div>

<h2>Grafik için veri hazırlamak</h2>
<p>Görselleştirme işinin yarısı pandas'tır. seaborn ve plotly uzun biçim ister; ayların takvim sırasında çizilmesi için sıralı kategori gerekir; şehirleri ciroya göre sıralamak okunurluğu artırır. (melt'i <b>ileri pandas</b> dersinde gördün.)</p>
<pre class="py">import pandas as pd

genis = pd.DataFrame({
    "sehir": ["Ankara", "İzmir", "Bursa"],
    "Oca": [1200, 800, 600], "Şub": [1500, 950, 720], "Mar": [1400, 1010, 690],
})
aylar = ["Oca", "Şub", "Mar"]
uzun = genis.melt(id_vars="sehir", var_name="ay", value_name="ciro")
uzun["ay"] = pd.Categorical(uzun["ay"], categories=aylar, ordered=True)
print(uzun.sort_values(["sehir", "ay"]).head(4))

# Çubuk grafik için: büyükten küçüğe sırala, payı hesapla
toplam = uzun.groupby("sehir")["ciro"].sum().sort_values(ascending=False)
pay = (toplam / toplam.sum() * 100).round(1)
print(pd.DataFrame({"ciro": toplam, "pay_%": pay}))</pre>

<h2>plotly express: etkileşimli grafik</h2>
<p>plotly grafiği bir HTML/JavaScript nesnesidir: fareyle üzerine gelince değer görünür (hover), yakınlaştırılır, seriler göstergeden açılıp kapanır. Panolar (dashboard), Jupyter keşfi ve e-postayla gönderilecek tek dosyalık raporlar için idealdir. <code>plotly.express</code> (px) seaborn'a çok benzer bir arayüz sunar.</p>
<pre class="code">import plotly.express as px

fig = px.line(aylik, x="ay", y="ciro", color="sehir", markers=True,
              title="Anadolu Market aylık ciro")
fig.show()                                      # tarayıcıda / Jupyter'de etkileşimli

fig = px.scatter(df, x="adet", y="tutar", color="segment",
                 hover_data=["siparis_id", "sehir"], facet_col="kategori")
fig.write_html("siparisler.html")               # tek dosya, her tarayıcıda açılır

fig = px.bar(toplam_df, x="sehir", y="ciro", text_auto=".2s")
fig.update_layout(yaxis_title="Ciro (TL)")</pre>
<div class="tip"><b>Kendi bilgisayarında dene</b><code>pip install plotly</code>. Jupyter'de <code>fig.show()</code> hücrede etkileşimli grafik açar; PNG olarak kaydetmek için ayrıca <code>pip install kaleido</code> gerekir. Web panosu kurmak istersen plotly'nin Dash kütüphanesine ya da Streamlit'e bak.</div>
<p><b>altair</b> ise "grafiğin dilbilgisi" (grammar of graphics) yaklaşımını Python'a getirir: veriyi, işareti (mark) ve kodlamayı (encode) bildirirsin.</p>
<pre class="code">import altair as alt   # pip install altair

alt.Chart(df).mark_point().encode(
    x="adet", y="tutar", color="segment", tooltip=["siparis_id", "sehir"]
).interactive()</pre>

<h2>Grafik seçimi rehberi</h2>
<p>Grafiği seçerken "hangi veriye sahibim?" diye değil "hangi soruya cevap arıyorum?" diye başla.</p>
<div class="tbl-wrap"><table>
<tr><th>Soru</th><th>Grafik</th><th>seaborn / plotly</th></tr>
<tr><td>Zamanla nasıl değişti?</td><td>Çizgi</td><td><code>lineplot</code> / <code>px.line</code></td></tr>
<tr><td>Hangi grup daha büyük?</td><td>Sıralı çubuk (yatay, uzun etiketlerde)</td><td><code>barplot</code> / <code>px.bar</code></td></tr>
<tr><td>Değerler nasıl dağılıyor?</td><td>Histogram, yoğunluk</td><td><code>histplot</code>, <code>kdeplot</code> / <code>px.histogram</code></td></tr>
<tr><td>Gruplar arasında dağılım farkı?</td><td>Kutu, keman</td><td><code>boxplot</code>, <code>violinplot</code> / <code>px.box</code></td></tr>
<tr><td>İki sayısal değişken ilişkili mi?</td><td>Saçılım (dağılım) grafiği</td><td><code>scatterplot</code> / <code>px.scatter</code></td></tr>
<tr><td>Birçok değişkenin ilişkisi?</td><td>Korelasyon ısı haritası, pairplot</td><td><code>heatmap</code>, <code>pairplot</code> / <code>px.imshow</code></td></tr>
<tr><td>Parçanın bütüne oranı?</td><td>Yığılmış çubuk; en fazla 3-4 dilimse pasta</td><td><code>histplot(multiple="stack")</code> / <code>px.bar</code></td></tr>
<tr><td>Her grupta desen aynı mı?</td><td>Küçük çoklu grafikler</td><td><code>FacetGrid</code>, <code>relplot(col=)</code> / <code>facet_col</code></td></tr>
</table></div>

<h2>Renk ve erişilebilirlik</h2>
<p>Rengin üç işi vardır ve her biri farklı palet ister: <b>kategorik</b> (şehirler: birbirinden ayrışan renkler), <b>sıralı</b> (sequential: az → çok, tek renk tonu, örn. viridis), <b>iki uçlu</b> (diverging: negatif ↔ pozitif, ortası nötr). Erkeklerin yaklaşık %8'inde bir tür renk görme farklılığı vardır; en yaygını kırmızı-yeşil ayrımıdır. "Kırmızı kötü, yeşil iyi" grafiği bu izleyiciler için tek renktir.</p>
<ul>
<li>Renk körü dostu paletler kullan: viridis, cividis, seaborn'da <code>palette="colorblind"</code>.</li>
<li>Rengi tek bilgi taşıyıcısı yapma: işaret şekli, çizgi stili ya da doğrudan etiket ekle.</li>
<li>Metin ile arka plan arasında yeterli kontrast bırak (WCAG: normal metin için en az 4.5:1).</li>
<li>Kategori sayısı 6-7'yi geçiyorsa renk ayrımı zorlaşır; grupları birleştir ya da küçük çoklu grafiğe geç.</li>
</ul>
<pre class="py">import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

aylar = ["Oca", "Şub", "Mar", "Nis"]
seriler = {"Ankara": [12, 15, 14, 18], "İzmir": [8, 9, 10, 11], "Bursa": [6, 7, 7, 9]}
renkler = ["#0072B2", "#E69F00", "#009E73"]          # Okabe-Ito: renk körü dostu
isaretler = ["o", "s", "^"]
cizgiler = ["-", "--", ":"]

fig, ax = plt.subplots(figsize=(7, 4))
for (sehir, y), r, m, c in zip(seriler.items(), renkler, isaretler, cizgiler):
    ax.plot(aylar, y, color=r, marker=m, linestyle=c, label=sehir)
    ax.annotate(sehir, (len(aylar) - 1, y[-1]), xytext=(5, 0), textcoords="offset points")
ax.set_title("Aylık ciro (bin TL)")
ax.legend()
plt.close(fig)
print([(l.get_label(), l.get_marker(), l.get_linestyle()) for l in ax.lines])</pre>

<h2>Yanıltıcı grafikler</h2>
<p>Çoğu yanıltıcı grafik kötü niyetle değil, varsayılan ayarla üretilir. En sık beş tuzak:</p>
<div class="tbl-wrap"><table>
<tr><th>Tuzak</th><th>Etkisi</th><th>Doğrusu</th></tr>
<tr><td>Çubuk grafikte y ekseni 0'dan başlamıyor</td><td>%2'lik fark 5 kat görünür</td><td>Çubukta eksen 0'dan başlar; küçük farkı göstermek için çizgi ya da fark grafiği</td></tr>
<tr><td>Çift y ekseni</td><td>Ölçek seçimiyle her iki seri "birlikte" gösterilebilir</td><td>İki ayrı panel ya da endekslenmiş (başlangıç=100) seri</td></tr>
<tr><td>Seçilmiş zaman aralığı</td><td>Düşüşün ortasından başlayan grafik "toparlanma" anlatır</td><td>Tam dönem ya da yıllık kıyas</td></tr>
<tr><td>3B ve çok dilimli pasta</td><td>Açı ve hacim yanlış algılanır</td><td>Sıralı yatay çubuk</td></tr>
<tr><td>Farklı genişlikte histogram kutuları</td><td>Dağılımın şekli değişir</td><td>Eşit kutu, birkaç kutu sayısını dene</td></tr>
</table></div>
<pre class="py">import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

sube = ["Kadıköy", "Çankaya"]
ciro = [1000, 1020]                     # yalnızca %2 fark
fig, (a, b) = plt.subplots(1, 2, figsize=(8, 3))
a.bar(sube, ciro); a.set_ylim(990, 1025); a.set_title("Yanıltıcı")
b.bar(sube, ciro); b.set_ylim(0, 1100); b.set_title("Dürüst")
plt.close(fig)

def gorunen_oran(ax):
    alt = ax.get_ylim()[0]
    return round((ciro[1] - alt) / (ciro[0] - alt), 2)

print("gerçek oran:", round(ciro[1] / ciro[0], 2))
print("yanıltıcı grafikte görünen:", gorunen_oran(a))
print("dürüst grafikte görünen:", gorunen_oran(b))</pre>

<div class="note"><b>Gerçek işte</b>Analist raporlarının büyük kısmı yönetici sunumuna ya da bir panoya gider. İyi ekiplerin ortak alışkanlıkları: her grafiğin başlığı bir bulgu cümlesidir ("İzmir'de sepet tutarı Mart'ta %12 arttı"), eksenlerde birim yazar, renkler kurum paletinden ve renk körü dostudur, aynı rapordaki grafikler aynı temayı (<code>sns.set_theme</code> ya da matplotlib <code>rcParams</code>) kullanır. Keşif aşamasında seaborn ve pairplot, sunumda sade matplotlib/seaborn PNG'leri, paylaşılan panoda plotly tercih edilir.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Grafiğin dilbilgisi</h3>
<p>seaborn, plotly express ve altair aynı fikre dayanır: veri + görsel kanal eşlemesi (x, y, renk, boyut, şekil, panel) + işaret (nokta, çizgi, çubuk). Bu dili öğrenince araç değiştirmek kolaylaşır; R'daki ggplot2, Power BI ve Tableau da aynı mantıkla çalışır. Kanalların algı gücü sıralıdır: ortak eksende konum en doğru okunur, sonra uzunluk, açı, alan ve en son renk tonu. Önemli karşılaştırmayı konuma, ikincil bilgiyi renge ver.</p>
<h3>Spagetti yerine küçük çoklu grafikler</h3>
<p>On şehrin trendini tek grafikte on çizgiyle göstermek okunmaz. Ortak y ekseniyle (<code>sharey=True</code>) on küçük panel, hem her şehrin desenini hem de şehirler arası düzeyi gösterir. Gerekirse her panelde diğer şehirleri soluk gri arka plan olarak çiz.</p>
<h3>Çıktı kalitesi</h3>
<p>Sunum için <code>dpi=200</code> PNG ya da ölçeklenebilir SVG/PDF kaydet; <code>bbox_inches="tight"</code> etiketlerin kesilmesini önler. Rapor üretimini fonksiyonlaştır: veri hazırlama, çizim ve kaydetme ayrı fonksiyonlarda olsun ki aynı grafiği her ay tek komutla yeniden üretebilesin ve testleyebilesin.</p>
</section>`,
    ex: [
      { t: 'mc',
        id: 'seaborn-plotly-1',
        stage: 'Isınma',
        q: 'Dört şehirde sepet tutarlarının <b>dağılımını</b> (medyan, yayılım, aykırı değerler) karşılaştırmak istiyorsun. Hangisi en uygun?',
        o: ['Şehir başına ortalama tutarı gösteren çubuk grafik', 'Şehirlere göre kutu ya da keman grafiği', 'Şehirlerin ciro payını gösteren pasta grafik', 'Tutarın zamana göre çizgi grafiği'],
        a: 1,
        why: 'Kutu/keman grafiği her grubun medyanını, çeyreklerini ve aykırı değerlerini yan yana gösterir. Ortalama çubuğu dağılımı ve aykırı değerleri gizler; pasta pay gösterir, çizgi zaman ister.' },
      { t: 'mc',
        id: 'seaborn-plotly-2',
        stage: 'Isınma',
        q: 'İki şubenin cirosu 1000 ve 1020 TL. Çubuk grafikte y ekseni 990\'dan başlatılmış. Sonuç ne olur?',
        o: ['Hiçbir şey değişmez; eksen yalnızca görünümü etkiler', 'Fark gerçekte %2 iken görsel olarak 3 kat görünür', 'Grafik daha doğru olur çünkü fark netleşir', 'matplotlib çubuk grafikte bu ayara izin vermez'],
        a: 1,
        why: 'Çubuğun boyu değeri temsil eder; eksen 990\'dan başlarsa çubuklar 10 ve 30 birim boyunda görünür ve 1.02 oranı 3 kat gibi algılanır. Çubuk grafikte eksen 0\'dan başlamalı.' },
      { t: 'mc',
        id: 'seaborn-plotly-3',
        stage: 'Isınma',
        q: 'Kâr/zarar yüzdesini (-%20 ile +%20 arası) haritada renklendireceksin. Hangi palet türü doğru?',
        o: ['Kategorik palet: her değer aralığına ayrı ve bağımsız bir renk', 'Sıralı tek tonlu palet (açıktan koyuya)', 'Ortası nötr, iki ucu farklı renkli diverging', 'Kırmızıdan yeşile uzanan gökkuşağı paleti'],
        a: 2,
        why: 'Sıfır anlamlı bir orta noktaysa diverging palet (RdBu, vlag) iki yönü ayırır. Sıralı palet negatif/pozitif ayrımını kaybeder; kırmızı-yeşil renk körlerinde ayrışmaz.' },
      { t: 'predict',
        id: 'seaborn-plotly-4',
        stage: 'Kodu oku',
        q: 'Bu kod ne yazdırır?',
        code: 'import matplotlib\nmatplotlib.use("Agg")\nimport matplotlib.pyplot as plt\nfig, ax = plt.subplots()\nax.bar(["Ankara", "İzmir", "Bursa"], [3, 5, 2])\nax.set_title("Ciro")\nprint(len(ax.patches), ax.get_title())\n',
        o: ['1 Ciro', '3 Ciro', '3 None', '10 Ciro'],
        a: 1,
        why: 'Her çubuk bir Rectangle yaması (patch) olarak Axes\'e eklenir; 3 çubuk = 3 yama. get_title başlık metnini döndürür.' },
      { t: 'predict',
        id: 'seaborn-plotly-5',
        stage: 'Kodu oku',
        q: 'Bu kod ne yazdırır?',
        code: 'import matplotlib\nmatplotlib.use("Agg")\nimport matplotlib.pyplot as plt\nfig, ax = plt.subplots()\nsayilar, kenarlar, _ = ax.hist([1, 2, 2, 3, 3, 3, 10], bins=3)\nprint(len(ax.patches), sayilar.tolist())\n',
        o: ['3 [6.0, 0.0, 1.0]', '7 [1.0, 2.0, 3.0]', '3 [1.0, 2.0, 4.0]', '4 [6.0, 0.0, 1.0]'],
        a: 0,
        why: 'bins=3 aralığı (1, 10) üç eşit kutuya böler: [1, 4), [4, 7), [7, 10]. İlk kutuya 6 değer, ikinciye 0, üçüncüye 1 düşer. Aykırı 10 değeri yüzünden verinin çoğu tek kutuya sıkışır: kutu sayısını denemek bu yüzden önemlidir.' },
      { t: 'predict',
        id: 'seaborn-plotly-6',
        stage: 'Kodu oku',
        q: 'seaborn için veri hazırlanıyor. Bu kod ne yazdırır?',
        code: 'import pandas as pd\ngenis = pd.DataFrame({"sehir": ["Ankara", "İzmir"], "Oca": [12, 8], "Şub": [15, 9], "Mar": [14, 10]})\nuzun = genis.melt(id_vars="sehir", var_name="ay", value_name="ciro")\nprint(uzun.shape, uzun.columns.tolist())\n',
        o: ['(2, 4) [\'sehir\', \'Oca\', \'Şub\', \'Mar\']', '(6, 3) [\'sehir\', \'ay\', \'ciro\']', '(3, 6) [\'sehir\', \'ay\', \'ciro\']', '(6, 2) [\'ay\', \'ciro\']'],
        a: 1,
        why: 'melt her (şehir, ay) çiftini bir satır yapar: 2 şehir x 3 ay = 6 satır; sütunlar id_vars + var_name + value_name. seaborn\'da hue="sehir", x="ay", y="ciro" bu biçimle çalışır.' },
      { t: 'order',
        id: 'seaborn-plotly-7',
        stage: 'Kodu oku',
        q: '<p>seaborn\'daki <code>scatterplot(hue="sehir")</code> grafiğini matplotlib ile kuran programın satırlarını sırala: her şehir ayrı renkte bir nokta kümesi ve başlıklı bir gösterge.</p>',
        lines: ['import matplotlib.pyplot as plt', 'veri = {"Ankara": ([1, 2, 3], [120, 260, 310]), "İzmir": ([2, 4], [150, 330])}', 'fig, ax = plt.subplots(figsize=(len(veri) * 3, 4))', 'for sehir, (adet, tutar) in veri.items():', '    ax.scatter(adet, tutar, label=sehir)', 'ax.legend(title="Şehir")', 'print(len(ax.collections), len(ax.get_legend().get_texts()))'],
        expect: '2 2\n',
        hint: 'Figür boyutu veri sözlüğüne bağlı; gösterge ancak tüm çizimlerden sonra kurulabilir.',
        why: 'Her scatter çağrısı Axes\'e bir PathCollection ekler; legend label verilmiş serilerden kurulur. hue\'nun matplotlib karşılığı grup başına ayrı çağrı + label\'dır.' },
      { t: 'code',
        id: 'seaborn-plotly-8',
        stage: 'Rehberli',
        diff: 1,
        q: '<p>seaborn\'daki <code>sns.boxplot(data=df, x="sehir", y="tutar")</code> grafiğini matplotlib ile kur. <code>sehir_kutu(df)</code> fonksiyonu:</p><ul><li>şehirleri alfabetik sıralasın, her şehrin <code>tutar</code> değerlerinden bir liste kurup <code>ax.boxplot</code> ile çizsin,</li><li>x ekseni etiketlerini şehir adları yapsın (<code>ax.set_xticks(konumlar, etiketler)</code>, konumlar 1\'den başlar),</li><li>başlığı <code>"Şehre göre sepet tutarı"</code>, y etiketini <code>"Tutar (TL)"</code> yapsın,</li><li><code>(fig, ax)</code> döndürsün.</li></ul>',
        guide: ['plt.subplots() ile fig, ax al.', 'sehirler = sorted(df["sehir"].unique()) ve her şehir için df.loc[df["sehir"] == s, "tutar"] listesini kur.', 'ax.boxplot(gruplar) çağır; ax.set_xticks(range(1, len(sehirler) + 1), sehirler) ile etiketle.', 'Başlık ve y etiketini ekle, fig, ax döndür.'],
        example: 'import matplotlib\nmatplotlib.use("Agg")\nimport matplotlib.pyplot as plt\nbekleme = {"Gişe": [3, 5, 4, 12], "Online": [1, 2, 1, 3]}\nfig, ax = plt.subplots()\nax.boxplot(list(bekleme.values()))\nax.set_xticks([1, 2], list(bekleme.keys()))\nax.set_ylabel("Dakika")\nprint([t.get_text() for t in ax.get_xticklabels()])\n',
        start: 'import matplotlib\nmatplotlib.use("Agg")\nimport matplotlib.pyplot as plt\n\ndef sehir_kutu(df):\n    fig, ax = plt.subplots()\n    # TODO 1: sehirler = sorted(...)\n    # TODO 2: gruplar = [her şehrin tutar listesi]\n    # TODO 3: ax.boxplot(gruplar) ve ax.set_xticks(range(1, n + 1), sehirler)\n    # TODO 4: başlık ve y etiketi\n    return fig, ax\n',
        sol: 'import matplotlib\nmatplotlib.use("Agg")\nimport matplotlib.pyplot as plt\n\ndef sehir_kutu(df):\n    fig, ax = plt.subplots()\n    sehirler = sorted(df["sehir"].unique())\n    gruplar = [df.loc[df["sehir"] == s, "tutar"].tolist() for s in sehirler]\n    ax.boxplot(gruplar)\n    ax.set_xticks(range(1, len(sehirler) + 1), sehirler)\n    ax.set_title("Şehre göre sepet tutarı")\n    ax.set_ylabel("Tutar (TL)")\n    return fig, ax\n',
        tests: 'import pandas as pd\nimport matplotlib.pyplot as plt\nd = pd.DataFrame({"sehir": ["İzmir", "Ankara", "Bursa", "Ankara", "İzmir", "Bursa"], "tutar": [80, 120, 300, 340, 150, 900]})\nfig, ax = sehir_kutu(d)\nassert [t.get_text() for t in ax.get_xticklabels()] == ["Ankara", "Bursa", "İzmir"], "x etiketleri alfabetik şehir adları olmalı"\nassert ax.get_title() == "Şehre göre sepet tutarı", "Başlık yanlış"\nassert ax.get_ylabel() == "Tutar (TL)", "y etiketi \'Tutar (TL)\' olmalı"\nassert len(ax.lines) > 0, "ax.boxplot ile kutu çizilmeli"\nplt.close(fig)\n',
        hints: ['seaborn\'un x="sehir" eşlemesi = şehir başına bir veri listesi.', 'gruplar = [df.loc[df["sehir"] == s, "tutar"].tolist() for s in sehirler]', 'ax.set_xticks(range(1, len(sehirler) + 1), sehirler): boxplot kutuları 1, 2, 3 konumlarına çizer.'],
        why: 'seaborn uzun tabloyu kategoriye göre kendisi böler; matplotlib\'te bu bölmeyi sen yaparsın. Kutular 1\'den başlayan konumlara çizildiği için etiket konumları da 1\'den başlar.' },
      { t: 'code',
        id: 'seaborn-plotly-9',
        stage: 'Rehberli',
        diff: 2,
        q: '<p><code>sns.heatmap(df.corr(), annot=True, vmin=-1, vmax=1)</code> grafiğini matplotlib ile kur. <code>korelasyon_isi(df)</code> fonksiyonu:</p><ul><li><code>kor = df.corr(numeric_only=True).round(2)</code> hesaplasın,</li><li><code>ax.imshow</code> ile <code>cmap="RdBu_r", vmin=-1, vmax=1</code> kullanarak çizsin ve <code>fig.colorbar</code> eklesin,</li><li>x ve y işaretlerini sütun adlarıyla etiketlesin,</li><li>her hücreye değeri <code>f"{değer:.2f}"</code> metniyle yazsın (<code>ax.text(j, i, ...)</code>),</li><li>başlık <code>"Korelasyon matrisi"</code> olsun; <code>(fig, ax, kor)</code> döndürsün.</li></ul>',
        guide: ['kor = df.corr(numeric_only=True).round(2)', 'im = ax.imshow(kor.to_numpy(), cmap="RdBu_r", vmin=-1, vmax=1); fig.colorbar(im, ax=ax)', 'ax.set_xticks(range(n), kor.columns) ve ax.set_yticks(range(n), kor.index)', 'İç içe döngüyle her (i, j) hücresine ax.text(j, i, f"{kor.iloc[i, j]:.2f}", ha="center", va="center")', 'Başlığı ekle ve fig, ax, kor döndür.'],
        example: 'import matplotlib\nmatplotlib.use("Agg")\nimport matplotlib.pyplot as plt\nimport numpy as np\nm = np.array([[1, 2], [3, 4]])\nfig, ax = plt.subplots()\nax.imshow(m, cmap="viridis")\nfor i in range(2):\n    for j in range(2):\n        ax.text(j, i, str(m[i, j]), ha="center")\nprint(len(ax.texts))\n',
        start: 'import matplotlib\nmatplotlib.use("Agg")\nimport matplotlib.pyplot as plt\n\ndef korelasyon_isi(df):\n    kor = df.corr(numeric_only=True).round(2)\n    fig, ax = plt.subplots()\n    # TODO 1: imshow (cmap="RdBu_r", vmin=-1, vmax=1) + colorbar\n    # TODO 2: x ve y işaret etiketleri\n    # TODO 3: her hücreye ax.text(j, i, ...)\n    # TODO 4: başlık\n    return fig, ax, kor\n',
        sol: 'import matplotlib\nmatplotlib.use("Agg")\nimport matplotlib.pyplot as plt\n\ndef korelasyon_isi(df):\n    kor = df.corr(numeric_only=True).round(2)\n    fig, ax = plt.subplots()\n    im = ax.imshow(kor.to_numpy(), cmap="RdBu_r", vmin=-1, vmax=1)\n    fig.colorbar(im, ax=ax)\n    n = len(kor.columns)\n    ax.set_xticks(range(n), kor.columns)\n    ax.set_yticks(range(n), kor.index)\n    for i in range(n):\n        for j in range(n):\n            ax.text(j, i, f"{kor.iloc[i, j]:.2f}", ha="center", va="center")\n    ax.set_title("Korelasyon matrisi")\n    return fig, ax, kor\n',
        tests: 'import pandas as pd\nimport matplotlib.pyplot as plt\nd = pd.DataFrame({"adet": [1, 3, 2, 5, 4], "tutar": [120, 310, 260, 480, 450], "teslim_gun": [3, 2, 4, 1, 2], "sehir": ["A", "B", "A", "B", "A"]})\nfig, ax, kor = korelasyon_isi(d)\nassert kor.shape == (3, 3), "Yalnız sayısal sütunlar: 3x3 (numeric_only=True)"\nassert len(ax.images) == 1, "imshow ile tek görüntü çizilmeli"\nassert ax.images[0].get_clim() == (-1, 1), "Renk sınırları vmin=-1, vmax=1 olmalı"\nassert len(fig.axes) == 2, "colorbar eklenmeli (ikinci Axes)"\nassert len(ax.texts) == 9, "9 hücrenin her birine değer yazılmalı"\nassert [t.get_text() for t in ax.get_xticklabels()] == ["adet", "tutar", "teslim_gun"], "x etiketleri sütun adları"\nyazilar = {(round(t.get_position()[0]), round(t.get_position()[1])): t.get_text() for t in ax.texts}\nassert yazilar[(1, 0)] == f"{kor.iloc[0, 1]:.2f}", "Hücre (satır 0, sütun 1) yazısı ax.text(j=1, i=0) konumunda olmalı"\nassert ax.get_title() == "Korelasyon matrisi", "Başlık yanlış"\nplt.close(fig)\n',
        hints: ['imshow\'un döndürdüğü nesneyi colorbar\'a ver: fig.colorbar(im, ax=ax).', 'Etiketler: ax.set_xticks(range(n), kor.columns), ax.set_yticks(range(n), kor.index).', 'Hücre yazısı: x = sütun (j), y = satır (i): ax.text(j, i, f"{kor.iloc[i, j]:.2f}", ha="center", va="center")'],
        why: 'Isı haritası bir görüntü (imshow) + renk skalası + hücre yazılarıdır. Korelasyon için sabit -1/1 sınırı ve diverging palet, renklerin her grafikte aynı anlamı taşımasını sağlar.' },
      { t: 'code',
        id: 'seaborn-plotly-10',
        stage: 'Rehberli',
        diff: 2,
        q: '<p>seaborn\'daki <code>sns.relplot(data=df, x="ay", y="ciro", col="sehir", kind="line")</code> küçük çoklu grafiğini kur. <code>facet_cizgi(df)</code> fonksiyonu (<code>sehir</code>, <code>ay</code>, <code>ciro</code> sütunlu uzun tablo):</p><ul><li>alfabetik sıralı her şehir için yan yana bir panel açsın: <code>plt.subplots(1, n, sharey=True)</code>,</li><li>her panele o şehrin <code>ay</code>–<code>ciro</code> çizgisini çizsin ve panel başlığını şehir adı yapsın,</li><li><code>(fig, axes)</code> döndürsün. Tek şehir olsa bile <code>axes</code> bir liste/dizi gibi dolaşılabilmeli (<code>squeeze=False</code> ya da <code>np.atleast_1d</code>).</li></ul>',
        guide: ['sehirler = sorted(df["sehir"].unique()); n = len(sehirler).', 'fig, axes = plt.subplots(1, n, sharey=True, squeeze=False) ve axes = axes[0] ile tek boyuta indir.', 'zip(axes, sehirler) ile dolaş; her şehrin satırlarını filtreleyip ax.plot(g["ay"], g["ciro"]) çiz.', 'ax.set_title(sehir) ve sonunda fig, axes döndür.'],
        example: 'import matplotlib\nmatplotlib.use("Agg")\nimport matplotlib.pyplot as plt\nfig, axes = plt.subplots(1, 2, sharey=True, squeeze=False)\naxes = axes[0]\nfor ax, (ad, y) in zip(axes, {"Kasa": [3, 5, 4], "Online": [8, 9, 12]}.items()):\n    ax.plot([1, 2, 3], y)\n    ax.set_title(ad)\nprint([a.get_title() for a in axes], axes[0].get_ylim() == axes[1].get_ylim())\n',
        start: 'import matplotlib\nmatplotlib.use("Agg")\nimport matplotlib.pyplot as plt\n\ndef facet_cizgi(df):\n    sehirler = sorted(df["sehir"].unique())\n    # TODO 1: fig, axes = plt.subplots(1, len(sehirler), sharey=True, squeeze=False); axes = axes[0]\n    # TODO 2: her şehir için filtrele, ax.plot(...), ax.set_title(sehir)\n    fig, axes = None, []\n    return fig, axes\n',
        sol: 'import matplotlib\nmatplotlib.use("Agg")\nimport matplotlib.pyplot as plt\n\ndef facet_cizgi(df):\n    sehirler = sorted(df["sehir"].unique())\n    fig, axes = plt.subplots(1, len(sehirler), sharey=True, squeeze=False, figsize=(4 * len(sehirler), 3))\n    axes = axes[0]\n    for ax, sehir in zip(axes, sehirler):\n        g = df[df["sehir"] == sehir]\n        ax.plot(g["ay"], g["ciro"], marker="o")\n        ax.set_title(sehir)\n    return fig, axes\n',
        tests: 'import pandas as pd\nimport matplotlib.pyplot as plt\nd = pd.DataFrame({"sehir": ["İzmir"] * 3 + ["Ankara"] * 3 + ["Bursa"] * 3, "ay": [1, 2, 3] * 3, "ciro": [8, 9, 10, 12, 15, 14, 6, 7, 30]})\nfig, axes = facet_cizgi(d)\nassert fig is not None and len(fig.axes) == 3, "3 şehir için 3 panel olmalı"\nassert [a.get_title() for a in axes] == ["Ankara", "Bursa", "İzmir"], "Panel başlıkları alfabetik şehir adları"\nassert all(len(a.lines) == 1 for a in axes), "Her panelde tek çizgi olmalı"\nassert list(axes[0].lines[0].get_ydata()) == [12, 15, 14], "Ankara paneli Ankara verisini çizmeli"\nassert axes[0].get_ylim() == axes[2].get_ylim(), "sharey=True: tüm paneller aynı y ölçeğini paylaşmalı"\nplt.close(fig)\nfig1, axes1 = facet_cizgi(d[d["sehir"] == "Bursa"])\nassert len(list(axes1)) == 1 and axes1[0].get_title() == "Bursa", "Tek şehirde de axes dolaşılabilir olmalı"\nplt.close(fig1)\n',
        hints: ['plt.subplots(1, n, sharey=True, squeeze=False) her zaman 2 boyutlu dizi döndürür; axes[0] ilk satırdır.', 'for ax, sehir in zip(axes, sehirler): g = df[df["sehir"] == sehir]; ax.plot(g["ay"], g["ciro"])'],
        why: 'Küçük çoklu grafiklerde ortak y ekseni (sharey) şehirler arası düzey farkını dürüstçe gösterir. squeeze=False tek panelde bile aynı veri yapısını verir; fonksiyonun kenar durumda kırılmasını önler.' },
      { t: 'code',
        id: 'seaborn-plotly-11',
        stage: 'Kendin yaz',
        diff: 1,
        q: '<p><code>uzun_bicim(genis, aylar)</code> fonksiyonu <code>sehir</code> ve ay sütunlarından oluşan geniş tabloyu <code>sehir</code>, <code>ay</code>, <code>ciro</code> sütunlu uzun biçime çevirsin. <code>ay</code> sütunu, kategorileri <code>aylar</code> listesindeki sırada olan <b>sıralı kategorik</b> türde olsun. Tabloyu <code>sehir</code> ve <code>ay</code>\'a göre sıralayıp index\'i sıfırlanmış olarak döndür.</p>',
        start: 'import pandas as pd\n\ndef uzun_bicim(genis, aylar):\n    pass\n',
        sol: 'import pandas as pd\n\ndef uzun_bicim(genis, aylar):\n    uzun = genis.melt(id_vars="sehir", var_name="ay", value_name="ciro")\n    uzun["ay"] = pd.Categorical(uzun["ay"], categories=aylar, ordered=True)\n    return uzun.sort_values(["sehir", "ay"]).reset_index(drop=True)\n',
        tests: 'import pandas as pd\ng = pd.DataFrame({"sehir": ["İzmir", "Ankara"], "Mar": [10, 14], "Oca": [8, 12], "Şub": [9, 15]})\nr = uzun_bicim(g, ["Oca", "Şub", "Mar"])\nassert list(r.columns) == ["sehir", "ay", "ciro"], "Sütunlar sehir, ay, ciro"\nassert isinstance(r["ay"].dtype, pd.CategoricalDtype) and r["ay"].cat.ordered, "ay sıralı kategorik olmalı"\nassert r["ay"].cat.categories.tolist() == ["Oca", "Şub", "Mar"], "Kategori sırası aylar listesiyle aynı olmalı"\nassert r["ay"].tolist()[:3] == ["Oca", "Şub", "Mar"], "Ankara\'nın ayları takvim sırasında (alfabetik değil)"\nassert r["ciro"].tolist() == [12, 15, 14, 8, 9, 10], "ciro değerleri yanlış"\n',
        hints: ['melt ile uzun biçim, pd.Categorical(..., categories=aylar, ordered=True) ile ay sırası.', 'Sıralı kategoriye göre sort_values takvim sırasını kullanır.'],
        why: 'seaborn ve plotly kategorik eksenleri veri sırasıyla ya da kategori sırasıyla çizer; sıralı kategorik tür "Mar, Oca, Şub" gibi alfabetik bir eksenin önüne geçer.' },
      { t: 'code',
        id: 'seaborn-plotly-12',
        stage: 'Kendin yaz',
        diff: 1,
        q: '<p><code>histogram(tutarlar, kutu=10)</code> fonksiyonu (<code>sns.histplot</code> karşılığı) tutar listesinin histogramını <code>kutu</code> adet kutuyla çizsin; başlık <code>"Sepet tutarı dağılımı"</code>, x etiketi <code>"Tutar (TL)"</code>, y etiketi <code>"Sipariş sayısı"</code> olsun; <code>(fig, ax)</code> döndürsün.</p>',
        start: 'import matplotlib\nmatplotlib.use("Agg")\nimport matplotlib.pyplot as plt\n\ndef histogram(tutarlar, kutu=10):\n    pass\n',
        sol: 'import matplotlib\nmatplotlib.use("Agg")\nimport matplotlib.pyplot as plt\n\ndef histogram(tutarlar, kutu=10):\n    fig, ax = plt.subplots()\n    ax.hist(tutarlar, bins=kutu, edgecolor="white")\n    ax.set_title("Sepet tutarı dağılımı")\n    ax.set_xlabel("Tutar (TL)")\n    ax.set_ylabel("Sipariş sayısı")\n    return fig, ax\n',
        tests: 'import matplotlib.pyplot as plt\nveri = [120, 95, 410, 260, 1500, 80, 150, 210, 175, 140, 190, 300]\nfig, ax = histogram(veri, kutu=6)\nassert len(ax.patches) == 6, "kutu=6 iken 6 çubuk olmalı"\nassert sum(p.get_height() for p in ax.patches) == len(veri), "Çubuk yükseklikleri toplamı veri sayısına eşit olmalı"\nassert ax.get_title() == "Sepet tutarı dağılımı" and ax.get_xlabel() == "Tutar (TL)" and ax.get_ylabel() == "Sipariş sayısı", "Başlık/etiketler yanlış"\nplt.close(fig)\nfig, ax = histogram(veri)\nassert len(ax.patches) == 10, "Varsayılan kutu sayısı 10"\nplt.close(fig)\n',
        hints: ['ax.hist(tutarlar, bins=kutu)', 'Etiketler: set_title, set_xlabel, set_ylabel.'],
        why: 'Her histogram kutusu bir yama (patch) olur ve yükseklikleri toplamı gözlem sayısıdır; bu da grafiğin veriyi eksiksiz temsil ettiğini test etmenin kolay yoludur.' },
      { t: 'code',
        id: 'seaborn-plotly-13',
        stage: 'Kendin yaz',
        diff: 1,
        q: '<p>Ekipteki analistler için grafik seçim yardımcısı yaz. <code>grafik_sec(soru)</code> fonksiyonu soru türüne göre önerilen grafiği döndürsün (büyük/küçük harf ve baş/son boşluk önemsiz):</p><ul><li><code>"zaman"</code> → <code>"çizgi"</code></li><li><code>"karşılaştırma"</code> → <code>"sıralı çubuk"</code></li><li><code>"dağılım"</code> → <code>"histogram"</code></li><li><code>"grup dağılımı"</code> → <code>"kutu"</code></li><li><code>"ilişki"</code> → <code>"saçılım"</code></li><li><code>"korelasyon"</code> → <code>"ısı haritası"</code></li><li><code>"parça-bütün"</code> → <code>"yığılmış çubuk"</code></li></ul><p>Bilinmeyen soru türünde <code>ValueError</code> fırlatsın; mesajda geçerli türler listelensin.</p>',
        start: 'def grafik_sec(soru):\n    pass\n',
        sol: 'REHBER = {\n    "zaman": "çizgi",\n    "karşılaştırma": "sıralı çubuk",\n    "dağılım": "histogram",\n    "grup dağılımı": "kutu",\n    "ilişki": "saçılım",\n    "korelasyon": "ısı haritası",\n    "parça-bütün": "yığılmış çubuk",\n}\n\ndef grafik_sec(soru):\n    anahtar = soru.strip().lower()\n    if anahtar not in REHBER:\n        raise ValueError(f"Bilinmeyen soru türü: {soru!r}. Geçerli: {\', \'.join(REHBER)}")\n    return REHBER[anahtar]\n',
        tests: 'assert grafik_sec("zaman") == "çizgi", "zaman → çizgi"\nassert grafik_sec("  ilişki ") == "saçılım", "Boşluklar kırpılmalı"\nassert grafik_sec("KORELASYON") == "ısı haritası", "Büyük harf önemsiz olmalı"\nassert grafik_sec("grup dağılımı") == "kutu", "grup dağılımı → kutu"\nassert grafik_sec("parça-bütün") == "yığılmış çubuk", "parça-bütün → yığılmış çubuk"\ntry:\n    grafik_sec("pasta")\n    assert False, "Bilinmeyen türde ValueError bekleniyordu"\nexcept ValueError as e:\n    assert "zaman" in str(e), "Hata mesajında geçerli türler listelenmeli"\n',
        hints: ['Bir sözlük (soru → grafik) en temiz çözümdür.', 'soru.strip().lower() ile normalize et; sözlükte yoksa raise ValueError(...).'],
        why: 'Grafik seçimi bir eşleme tablosudur; kodda sözlük olarak tutmak, ekip standardını tek yerde toplar ve bilinmeyen türde sessizce yanlış grafik üretmek yerine açık hata verir.' },
      { t: 'code',
        id: 'seaborn-plotly-14',
        stage: 'Kendin yaz',
        diff: 2,
        q: '<p><code>sns.scatterplot(data=df, x="adet", y="tutar", hue="segment")</code> karşılığını yaz. <code>hue_scatter(df)</code> fonksiyonu her segment (alfabetik sırayla) için ayrı bir <code>ax.scatter</code> çağrısı yapsın ve <code>label</code> olarak segment adını versin; göstergenin başlığı <code>"Segment"</code>, x etiketi <code>"Adet"</code>, y etiketi <code>"Tutar (TL)"</code> olsun. <code>(fig, ax)</code> döndür.</p>',
        start: 'import matplotlib\nmatplotlib.use("Agg")\nimport matplotlib.pyplot as plt\n\ndef hue_scatter(df):\n    pass\n',
        sol: 'import matplotlib\nmatplotlib.use("Agg")\nimport matplotlib.pyplot as plt\n\ndef hue_scatter(df):\n    fig, ax = plt.subplots()\n    for seg in sorted(df["segment"].unique()):\n        g = df[df["segment"] == seg]\n        ax.scatter(g["adet"], g["tutar"], label=seg)\n    ax.legend(title="Segment")\n    ax.set_xlabel("Adet")\n    ax.set_ylabel("Tutar (TL)")\n    return fig, ax\n',
        tests: 'import pandas as pd\nimport matplotlib.pyplot as plt\nd = pd.DataFrame({"adet": [1, 3, 2, 5, 4, 6], "tutar": [120, 310, 260, 480, 450, 640], "segment": ["Gümüş", "Altın", "Bronz", "Altın", "Gümüş", "Altın"]})\nfig, ax = hue_scatter(d)\nassert len(ax.collections) == 3, "3 segment için 3 ayrı scatter çağrısı olmalı"\nleg = ax.get_legend()\nassert leg is not None and leg.get_title().get_text() == "Segment", "Gösterge başlığı \'Segment\' olmalı"\nassert [t.get_text() for t in leg.get_texts()] == ["Altın", "Bronz", "Gümüş"], "Gösterge alfabetik segment sırasında olmalı"\nassert len(ax.collections[0].get_offsets()) == 3, "İlk küme (Altın) 3 nokta içermeli"\nassert ax.get_xlabel() == "Adet" and ax.get_ylabel() == "Tutar (TL)", "Eksen etiketleri yanlış"\nplt.close(fig)\n',
        hints: ['for seg in sorted(df["segment"].unique()): filtrele ve ax.scatter(..., label=seg)', 'ax.legend(title="Segment") tüm çizimlerden sonra çağrılmalı.'],
        why: 'seaborn\'un hue parametresi tam olarak bunu yapar: grup başına ayrı çizim, ayrı renk ve bir gösterge. Grupların sırasını sabitlemek, aynı segmentin her grafikte aynı renkte görünmesini sağlar.' },
      { t: 'code',
        id: 'seaborn-plotly-15',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 1,
        q: '<p><b>Hatayı bul ve düzelt.</b> <code>ciro_cubuk(ciro)</code> şube → ciro sözlüğünden çubuk grafik çiziyor. Grafik "farkı net göstersin" diye ayarlanmış; ama yönetim, %2\'lik farkın dev bir uçurum gibi göründüğünü fark etti. Grafiği dürüst hâle getir (başlık ve etiketler kalsın).</p>',
        start: 'import matplotlib\nmatplotlib.use("Agg")\nimport matplotlib.pyplot as plt\n\ndef ciro_cubuk(ciro):\n    fig, ax = plt.subplots()\n    ax.bar(list(ciro.keys()), list(ciro.values()))\n    alt = min(ciro.values()) * 0.99\n    ax.set_ylim(alt, max(ciro.values()) * 1.005)\n    ax.set_title("Şube cirosu")\n    ax.set_ylabel("Ciro (TL)")\n    return fig, ax\n',
        sol: 'import matplotlib\nmatplotlib.use("Agg")\nimport matplotlib.pyplot as plt\n\ndef ciro_cubuk(ciro):\n    fig, ax = plt.subplots()\n    ax.bar(list(ciro.keys()), list(ciro.values()))\n    ax.set_ylim(0, max(ciro.values()) * 1.1)\n    ax.set_title("Şube cirosu")\n    ax.set_ylabel("Ciro (TL)")\n    return fig, ax\n',
        tests: 'import matplotlib.pyplot as plt\nfig, ax = ciro_cubuk({"Kadıköy": 1000, "Çankaya": 1020})\nassert ax.get_ylim()[0] == 0, "Çubuk grafikte y ekseni 0\'dan başlamalı; aksi hâlde fark büyütülür"\nassert ax.get_ylim()[1] >= 1020, "En uzun çubuk görünür olmalı"\nassert len(ax.patches) == 2, "İki çubuk olmalı"\nassert ax.get_title() == "Şube cirosu" and ax.get_ylabel() == "Ciro (TL)", "Başlık ve etiket korunmalı"\nplt.close(fig)\n',
        hints: ['Çubuğun boyu değerin kendisini temsil eder.', 'set_ylim\'in alt sınırını 0 yap (ya da set_ylim satırını tamamen kaldır; matplotlib çubukta 0\'dan başlar).'],
        why: 'Çubuk grafikte göz, çubukların uzunluk oranını okur. Eksen 0\'dan başlamazsa 1000 ile 1020 arasındaki %2 fark birkaç kat görünür. Küçük farkı vurgulamak gerekiyorsa farkı ayrıca yaz ya da çizgi/nokta grafiği kullan.' },
      { t: 'code',
        id: 'seaborn-plotly-16',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 2,
        q: '<p><b>Hatayı bul ve düzelt.</b> <code>tablo_isi(pv)</code> şehir × ay pivot tablosunu ısı haritası olarak çizip her hücreye değerini yazıyor. Kare tablolarda sorun fark edilmemiş, ama 2 şehir × 3 ay tablosunda yazılar yanlış hücrelerde ve bazıları grafiğin dışında.</p>',
        start: 'import matplotlib\nmatplotlib.use("Agg")\nimport matplotlib.pyplot as plt\n\ndef tablo_isi(pv):\n    fig, ax = plt.subplots()\n    ax.imshow(pv.to_numpy(), cmap="viridis")\n    ax.set_xticks(range(pv.shape[1]), pv.columns)\n    ax.set_yticks(range(pv.shape[0]), pv.index)\n    for i in range(pv.shape[0]):\n        for j in range(pv.shape[1]):\n            ax.text(i, j, str(pv.iloc[i, j]), ha="center", va="center")\n    return fig, ax\n',
        sol: 'import matplotlib\nmatplotlib.use("Agg")\nimport matplotlib.pyplot as plt\n\ndef tablo_isi(pv):\n    fig, ax = plt.subplots()\n    ax.imshow(pv.to_numpy(), cmap="viridis")\n    ax.set_xticks(range(pv.shape[1]), pv.columns)\n    ax.set_yticks(range(pv.shape[0]), pv.index)\n    for i in range(pv.shape[0]):\n        for j in range(pv.shape[1]):\n            ax.text(j, i, str(pv.iloc[i, j]), ha="center", va="center")\n    return fig, ax\n',
        tests: 'import pandas as pd\nimport matplotlib.pyplot as plt\npv = pd.DataFrame([[12, 15, 14], [8, 9, 10]], index=["Ankara", "İzmir"], columns=["Oca", "Şub", "Mar"])\nfig, ax = tablo_isi(pv)\nassert len(ax.texts) == 6, "6 hücre yazısı olmalı"\nfor t in ax.texts:\n    x, y = t.get_position()\n    assert 0 <= x <= 2 and 0 <= y <= 1, "Yazı grafiğin dışında: x sütun (0-2), y satır (0-1) olmalı"\n    assert t.get_text() == str(pv.iloc[int(round(y)), int(round(x))]), "Yazı yanlış hücrede: ax.text(x=sütun, y=satır, ...)"\nplt.close(fig)\n',
        hints: ['imshow\'da yatay eksen (x) sütun indeksi, dikey eksen (y) satır indeksidir.', 'ax.text(i, j, ...) satırı x\'e koyuyor; argümanların yeri değişmeli.'],
        why: 'Matris gösteriminde (satır, sütun) sırası ile grafik koordinatı (x, y) sırası terstir. Kare ve simetrik tablolarda (korelasyon gibi) bu hata görünmez; dikdörtgen tabloda hemen ortaya çıkar.' },
      { t: 'code',
        id: 'seaborn-plotly-17',
        stage: 'Meydan okuma',
        diff: 3,
        q: '<p>Erişilebilirlik denetimi: <code>renk_kontrast(renk1, renk2)</code> fonksiyonu iki onaltılık (hex) rengin WCAG kontrast oranını 2 basamakla döndürsün. Renkler <code>"#1A2B3C"</code> ya da kısa biçimde <code>"#FFF"</code> olabilir (büyük/küçük harf önemsiz). Hesap:</p><ol><li>Her kanalı 0–1 aralığına çevir: <code>c = değer / 255</code>.</li><li>Doğrusallaştır: <code>c &lt;= 0.03928</code> ise <code>c / 12.92</code>, değilse <code>((c + 0.055) / 1.055) ** 2.4</code>.</li><li>Göreli parlaklık: <code>L = 0.2126 R + 0.7152 G + 0.0722 B</code>.</li><li>Oran: <code>(L_açık + 0.05) / (L_koyu + 0.05)</code> — sıra önemsiz, büyük L pay olur.</li></ol><p>Geçersiz biçimde (<code>#</code> yok, uzunluk 3/6 değil, onaltılık olmayan karakter) <code>ValueError</code> fırlat.</p>',
        start: 'def renk_kontrast(renk1, renk2):\n    pass\n',
        sol: 'def _parlaklik(renk):\n    if not isinstance(renk, str) or not renk.startswith("#"):\n        raise ValueError(f"Geçersiz renk: {renk!r}")\n    h = renk[1:]\n    if len(h) == 3:\n        h = "".join(ch * 2 for ch in h)\n    if len(h) != 6:\n        raise ValueError(f"Geçersiz renk uzunluğu: {renk!r}")\n    try:\n        kanallar = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]\n    except ValueError:\n        raise ValueError(f"Onaltılık olmayan karakter: {renk!r}") from None\n    dog = [c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4 for c in kanallar]\n    return 0.2126 * dog[0] + 0.7152 * dog[1] + 0.0722 * dog[2]\n\ndef renk_kontrast(renk1, renk2):\n    a, b = sorted([_parlaklik(renk1), _parlaklik(renk2)], reverse=True)\n    return round((a + 0.05) / (b + 0.05), 2)\n',
        tests: 'assert renk_kontrast("#000000", "#FFFFFF") == 21.0, "Siyah-beyaz en yüksek kontrast: 21.0"\nassert renk_kontrast("#FFFFFF", "#000000") == 21.0, "Sıra önemsiz olmalı"\nassert renk_kontrast("#777777", "#ffffff") == 4.48, "#777777 beyaz üstünde 4.48 (4.5 sınırının hemen altı)"\nassert renk_kontrast("#0072B2", "#FFF") == 5.19, "Kısa biçim #FFF desteklenmeli; Okabe-Ito mavisi 5.19"\nassert renk_kontrast("#E69F00", "#000") == 9.32, "Turuncu siyah üstünde 9.32"\nassert renk_kontrast("#123456", "#123456") == 1.0, "Aynı renk 1.0"\nfor kotu in ["FFFFFF", "#FFFF", "#GGGGGG", "#12345"]:\n    try:\n        renk_kontrast(kotu, "#000000")\n        assert False, f"{kotu} için ValueError bekleniyordu"\n    except ValueError:\n        pass\n',
        hints: ['Önce tek bir rengi göreli parlaklığa çeviren yardımcı fonksiyon yaz.', 'Kısa biçimi genişlet: "FFF" → "FFFFFF" ("".join(ch * 2 for ch in h)). int(parça, 16) onaltılık olmayan karakterde ValueError verir.', 'İki parlaklığı sorted(..., reverse=True) ile sırala; oranı round(..., 2) ile döndür.'],
        why: 'WCAG kontrast oranı insan gözünün parlaklık algısını (yeşile duyarlı, maviye az duyarlı) hesaba katar. Grafik metinleri ve etiketler için en az 4.5:1 hedeflenir; #777777 gri beyaz üstünde bu sınırı kıl payı kaçırır.' },
      { t: 'code',
        id: 'seaborn-plotly-18',
        stage: 'Mini proje',
        diff: 3,
        q: '<p>Anadolu Market satış paneli. <code>rapor_paneli(df)</code> fonksiyonu <code>tarih</code> (datetime), <code>sehir</code>, <code>adet</code>, <code>tutar</code> sütunlu tablodan 2×2\'lik bir figür kursun ve <code>fig</code> döndürsün:</p><ul><li>Sol üst: aylık (<code>resample("MS")</code>) tutar toplamının çizgisi, başlık <code>"Aylık ciro"</code>.</li><li>Sağ üst: şehir toplam cirosunun <b>büyükten küçüğe</b> sıralı çubuk grafiği, başlık <code>"Şehre göre ciro"</code>, y ekseni 0\'dan.</li><li>Sol alt: tutar histogramı (<code>bins=5</code>), başlık <code>"Tutar dağılımı"</code>.</li><li>Sağ alt: adet–tutar saçılım grafiği, başlık <code>"Adet ve tutar"</code>.</li><li>Figür üst başlığı (<code>fig.suptitle</code>): <code>"Anadolu Market satış paneli"</code>.</li></ul>',
        start: 'import matplotlib\nmatplotlib.use("Agg")\nimport matplotlib.pyplot as plt\n\ndef rapor_paneli(df):\n    pass\n',
        sol: 'import matplotlib\nmatplotlib.use("Agg")\nimport matplotlib.pyplot as plt\n\ndef aylik_ciro(df):\n    return df.set_index("tarih")["tutar"].resample("MS").sum()\n\ndef sehir_ciro(df):\n    return df.groupby("sehir")["tutar"].sum().sort_values(ascending=False)\n\ndef rapor_paneli(df):\n    fig, axes = plt.subplots(2, 2, figsize=(11, 7))\n    ay = aylik_ciro(df)\n    axes[0, 0].plot(ay.index, ay.to_numpy(), marker="o")\n    axes[0, 0].set_title("Aylık ciro")\n    sc = sehir_ciro(df)\n    axes[0, 1].bar(sc.index.tolist(), sc.to_numpy())\n    axes[0, 1].set_ylim(bottom=0)\n    axes[0, 1].set_title("Şehre göre ciro")\n    axes[1, 0].hist(df["tutar"], bins=5)\n    axes[1, 0].set_title("Tutar dağılımı")\n    axes[1, 1].scatter(df["adet"], df["tutar"])\n    axes[1, 1].set_title("Adet ve tutar")\n    fig.suptitle("Anadolu Market satış paneli")\n    fig.tight_layout()\n    return fig\n',
        tests: 'import pandas as pd\nimport matplotlib.pyplot as plt\nd = pd.DataFrame({\n    "tarih": pd.to_datetime(["2024-01-05", "2024-01-20", "2024-02-11", "2024-03-02", "2024-03-15", "2024-03-28"]),\n    "sehir": ["İzmir", "Ankara", "Bursa", "Ankara", "İzmir", "Ankara"],\n    "adet": [1, 3, 2, 5, 4, 6],\n    "tutar": [120.0, 310.0, 260.0, 480.0, 450.0, 640.0],\n})\nfig = rapor_paneli(d)\nassert fig._suptitle is not None and fig._suptitle.get_text() == "Anadolu Market satış paneli", "fig.suptitle eksik ya da yanlış"\naxs = fig.axes\nassert len(axs) == 4, "2x2 = 4 panel olmalı"\nassert [a.get_title() for a in axs] == ["Aylık ciro", "Şehre göre ciro", "Tutar dağılımı", "Adet ve tutar"], "Panel başlıkları/sırası yanlış"\nassert list(axs[0].lines[0].get_ydata()) == [430.0, 260.0, 1570.0], "Aylık ciro: Ocak 430, Şubat 260, Mart 1570"\nassert [round(p.get_height()) for p in axs[1].patches] == [1430, 570, 260], "Şehir çubukları büyükten küçüğe: Ankara, İzmir, Bursa"\nassert axs[1].get_ylim()[0] == 0, "Çubuk grafikte y ekseni 0\'dan başlamalı"\nassert len(axs[2].patches) == 5, "Histogram 5 kutu"\nassert len(axs[3].collections) == 1 and len(axs[3].collections[0].get_offsets()) == 6, "Saçılım grafiğinde 6 nokta"\nplt.close(fig)\n',
        hints: ['plt.subplots(2, 2) ile axes[satır, sütun] düzeninde 4 panel al.', 'Veri hazırlığını ayrı fonksiyonlara böl: aylık seri için set_index("tarih")["tutar"].resample("MS").sum(), şehir için groupby + sort_values(ascending=False).', 'fig.suptitle(...) üst başlık içindir; ax.set_title panel başlığıdır.'],
        why: 'Panel üretimini veri hazırlama ve çizim fonksiyonlarına ayırmak, aynı raporu her ay tek çağrıyla yeniden üretmeyi ve figürün yapısını otomatik test etmeyi mümkün kılar.' }
    ],
    faq: [
      { q: 'seaborn mu, matplotlib mi öğrenmeliyim?',
        a: 'İkisi rakip değil: seaborn matplotlib\'in üstünde çalışır ve döndürdüğü nesneler matplotlib Axes/Figure\'dır. Keşif için seaborn hızlıdır; ince ayar (eksen, etiket, açıklama) için matplotlib bilgisi şarttır. Bu yüzden önce matplotlib\'in nesne modelini oturtmak doğru sıradır.' },
      { q: 'plotly grafiğini PowerPoint\'e nasıl koyarım?',
        a: 'fig.write_image("grafik.png", scale=2) ile statik görüntü kaydet (kaleido paketi gerekir). Etkileşimi korumak istiyorsan fig.write_html ile tek dosya üret ve sunumda bağlantı ver; etkileşim statik slaytta zaten kaybolur.' },
      { q: 'Pasta grafiği hiç mi kullanılmaz?',
        a: 'Az sayıda (2-4) dilim ve "bütünün yarısından fazlası" gibi kaba bir mesaj için kabul edilebilir. Dilim çok, değerler yakın ya da zaman içinde karşılaştırma gerekiyorsa sıralı çubuk ya da yığılmış çubuk açıkça daha iyi okunur.' },
      { q: 'Grafikte Türkçe karakterler kutu olarak çıkıyor.',
        a: 'Seçili yazı tipinde Türkçe glif yoktur. matplotlib\'de plt.rcParams["font.family"] = "DejaVu Sans" (varsayılan, Türkçe destekler) ya da sistemde yüklü bir yazı tipini ver; seaborn\'da sns.set_theme(font="DejaVu Sans").' }
    ],
    mistakes: [
      { bad: 'ax.bar(subeler, ciro)\nax.set_ylim(990, 1030)',
        good: 'ax.bar(subeler, ciro)\nax.set_ylim(0, max(ciro) * 1.1)',
        why: 'Çubuk grafikte eksen 0\'dan başlamazsa küçük farklar katlanarak büyük görünür.' },
      { bad: 'ax.imshow(kor)  # vmin/vmax yok, sıralı palet',
        good: 'ax.imshow(kor, cmap="RdBu_r", vmin=-1, vmax=1)',
        why: 'Korelasyonda 0 nötr orta noktadır; sabit sınır ve diverging palet olmadan renkler veriye göre gerilir ve yanlış okunur.' },
      { bad: 'ax.text(i, j, deger)  # i satır, j sütun',
        good: 'ax.text(j, i, deger)',
        why: 'Grafikte x yatay (sütun), y dikey (satır) eksendir; dikdörtgen tablolarda yazılar yanlış hücreye düşer.' },
      { bad: 'renkler = {"Kâr": "green", "Zarar": "red"}',
        good: 'renkler = {"Kâr": "#0072B2", "Zarar": "#D55E00"}  # + etiket/işaret',
        why: 'Kırmızı-yeşil ayrımı renk körlüğünde kaybolur; renk körü dostu palet ve ek görsel ipucu kullan.' },
      { bad: 'for s in sehirler:\n    fig, ax = plt.subplots()\n    ...\n    fig.savefig(f"{s}.png")',
        good: 'for s in sehirler:\n    fig, ax = plt.subplots()\n    ...\n    fig.savefig(f"{s}.png")\n    plt.close(fig)',
        why: 'Kapatılmayan figürler bellekte birikir; toplu rapor üretiminde bellek tükenir.' }
    ]
  }
);
})(window);
