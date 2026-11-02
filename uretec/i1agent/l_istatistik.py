BODY = r'''<h2>Veriden karara: neden istatistik?</h2>
<p>Anadolu Market yeni bir kampanya sayfası denedi: ziyaretçilerin yarısı eski sayfayı (A), yarısı yeni sayfayı (B) gördü. A'da dönüşüm %12, B'de %15. Yönetim soruyor: "B'yi herkese açalım mı?" Üç puanlık fark gerçek bir iyileşme mi, yoksa şans eseri mi? Bin ziyaretçiyle mi ölçtük, yüz ziyaretçiyle mi? Bu sorunun cevabı tahmin değil, <b>istatistiksel çıkarım</b>dır (statistical inference).</p>
<p>Bu derste betimsel istatistikten başlayıp dağılımlara, örneklemeye, güven aralığına, hipotez testlerine (t, ki-kare, korelasyon), A/B testine, etki büyüklüğüne ve doğrusal regresyona ilerleyeceğiz. Araçlar: <code>numpy</code> (bunu <b>numpy</b> dersinde gördün), <code>pandas</code>, <code>scipy.stats</code> ve <code>statsmodels</code>.</p>

<h2>Betimsel istatistik: veriyi özetlemek</h2>
<p>Her analiz veriye bakarak başlar. Merkez (ortalama, medyan), yayılım (standart sapma, çeyrekler arası açıklık) ve şekil (çarpıklık) üç temel sorudur.</p>
<pre class="py">import numpy as np
import pandas as pd
from scipy import stats

sepet = pd.Series([120, 95, 410, 260, 180, 80, 150, 210, 175, 140, 190, 2400])
print("ortalama:", round(sepet.mean(), 1), "| medyan:", sepet.median())
print("std (örneklem, ddof=1):", round(sepet.std(), 1), "| numpy varsayılanı ddof=0:", round(np.std(sepet), 1))
q1, q3 = sepet.quantile([0.25, 0.75])
print("Q1:", q1, "Q3:", q3, "IQR:", q3 - q1)
print("çarpıklık:", round(stats.skew(sepet), 2))
print(sepet.describe().round(1))</pre>
<p>Tek bir 2400 TL'lik sipariş ortalamayı 367 TL'ye çekti, medyan 177,5 TL'de kaldı. Gelir, sepet tutarı, bekleme süresi gibi sağa çarpık verilerde "tipik değer" için medyan, yayılım için IQR daha dürüsttür.</p>
<div class="tbl-wrap"><table>
<tr><th>Ölçü</th><th>pandas / numpy</th><th>Not</th></tr>
<tr><td>Ortalama, medyan</td><td><code>mean()</code>, <code>median()</code></td><td>Aykırı değer ortalamayı çeker</td></tr>
<tr><td>Standart sapma</td><td><code>s.std()</code> (ddof=1), <code>np.std(x)</code> (ddof=0)</td><td>Örneklemde ddof=1 kullan</td></tr>
<tr><td>Çeyrekler, IQR</td><td><code>quantile([.25, .75])</code></td><td>Aykırı değere dayanıklı</td></tr>
<tr><td>Çarpıklık</td><td><code>stats.skew</code></td><td>&gt; 0: sağ kuyruk uzun</td></tr>
<tr><td>Mod</td><td><code>s.mode()</code></td><td>Kategorik veride anlamlı</td></tr>
</table></div>
<div class="warn"><b>ddof tuzağı</b><code>np.std</code> varsayılan olarak nüfus (population) formülünü (n'e böler), <code>pandas.Series.std</code> örneklem formülünü (n-1'e böler) kullanır. Küçük veride fark büyüktür. Örneklemden çıkarım yapıyorsan <code>ddof=1</code>.</div>

<h2>Olasılık dağılımları: scipy.stats</h2>
<p>Gerçek süreçler bilinen dağılımlarla iyi modellenir. <b>Normal</b> dağılım ölçüm hatası ve ortalamalar için, <b>binom</b> "n denemede kaç başarı" (100 siparişten kaçı iade?), <b>Poisson</b> "birim zamanda kaç olay" (çağrı merkezine saatte kaç arama?) için kullanılır. scipy'de her dağılımın aynı yöntemleri vardır.</p>
<div class="tbl-wrap"><table>
<tr><th>Yöntem</th><th>Soru</th><th>Örnek</th></tr>
<tr><td><code>pmf(k)</code> / <code>pdf(x)</code></td><td>Tam olarak k olasılığı (yoğunluk)</td><td><code>binom.pmf(2, 10, 0.1)</code></td></tr>
<tr><td><code>cdf(x)</code></td><td>x veya daha az</td><td><code>norm.cdf(1.96)</code> ≈ 0.975</td></tr>
<tr><td><code>sf(x)</code></td><td>x'ten büyük (1 - cdf)</td><td><code>poisson.sf(4, 2.5)</code>: 4'ten fazla</td></tr>
<tr><td><code>ppf(q)</code></td><td>q yüzdelik dilimin değeri</td><td><code>norm.ppf(0.975)</code> ≈ 1.96</td></tr>
<tr><td><code>rvs(size, random_state)</code></td><td>Rastgele örnek üret</td><td>Simülasyon</td></tr>
</table></div>
<pre class="py">from scipy import stats

# Teslimat süresi: ortalama 48 saat, std 8 saat (normal)
teslim = stats.norm(loc=48, scale=8)
print("72 saati aşma olasılığı:", round(teslim.sf(72), 4))
print("siparişlerin %95'i kaç saatte teslim:", round(teslim.ppf(0.95), 1))

# İade oranı %10, günde 10 sipariş (binom): tam 2 iade, en az 1 iade
print("tam 2 iade:", round(stats.binom.pmf(2, 10, 0.10), 4))
print("en az 1 iade:", round(1 - stats.binom.pmf(0, 10, 0.10), 4))

# Ilgaz Bank çağrı merkezi: saatte ortalama 2.5 şikâyet (Poisson)
print("bir saatte 4'ten fazla şikâyet:", round(stats.poisson.sf(4, 2.5), 4))</pre>
<div class="tip"><b>cdf mi sf mi?</b>Kesikli dağılımlarda (binom, Poisson) "en az k" için <code>sf(k - 1)</code>, "k'dan fazla" için <code>sf(k)</code> yaz. Bir eksik/fazla yazılan k, en sık yapılan olasılık hatasıdır.</div>

<h2>Örnekleme ve merkezi limit teoremi</h2>
<p>Tüm müşterileri ölçemezsin; bir örneklem (sample) alırsın. <b>Merkezi limit teoremi</b> (central limit theorem) der ki: popülasyon dağılımı ne olursa olsun (çarpık bile), yeterince büyük örneklemlerin <b>ortalamaları</b> yaklaşık normal dağılır ve bu ortalamaların standart sapması (standart hata) <code>σ / √n</code> olur. Güven aralıklarının ve t-testlerinin çalışmasının sebebi budur.</p>
<pre class="py">import numpy as np

rng = np.random.default_rng(42)
nufus = rng.exponential(scale=200, size=100_000)       # çok çarpık: sepet tutarı
print("nüfus ortalaması:", round(nufus.mean(), 1), "| std:", round(nufus.std(), 1))

for n in (5, 30, 200):
    ortalamalar = rng.choice(nufus, size=(2000, n)).mean(axis=1)
    print(f"n={n:>3}: ortalamaların ortalaması={ortalamalar.mean():6.1f}  "
          f"std hata={ortalamalar.std():5.1f}  teorik={nufus.std() / np.sqrt(n):5.1f}")</pre>
<p>Örneklem büyüdükçe ortalamalar gerçek değerin etrafında daralır; 4 kat büyük örneklem hatayı yarıya indirir. "Neden 30 değil 3000 kişiyle test ettik?" sorusunun cevabı bu √n'dir.</p>

<h2>Güven aralığı</h2>
<p>Örneklem ortalaması tek bir sayıdır; <b>güven aralığı</b> (confidence interval) bu tahminin ne kadar kesin olduğunu söyler. Küçük örneklemde ve σ bilinmediğinde t dağılımı kullanılır: <code>ortalama ± t* · s / √n</code>.</p>
<pre class="py">import numpy as np
from scipy import stats

bekleme = np.array([4.2, 6.1, 3.8, 7.5, 5.0, 4.9, 6.3, 5.5, 4.1, 5.8])   # dakika, şube kuyruğu
n = len(bekleme)
ort = bekleme.mean()
se = bekleme.std(ddof=1) / np.sqrt(n)
t_kritik = stats.t.ppf(0.975, df=n - 1)
print(f"elle: {ort - t_kritik * se:.2f} – {ort + t_kritik * se:.2f}")
alt, ust = stats.t.interval(0.95, df=n - 1, loc=ort, scale=se)
print(f"scipy: {alt:.2f} – {ust:.2f}   (t*={t_kritik:.3f}, z ile 1.96 olurdu)")</pre>
<div class="warn"><b>Güven aralığını doğru oku</b>"%95 güven aralığı 4.6–6.0" demek, "gerçek ortalama %95 olasılıkla bu aralıkta" demek değildir. Doğru yorum: bu yöntemi tekrar tekrar uygulasaydık, üretilen aralıkların %95'i gerçek ortalamayı kapsardı. Pratikte: aralık genişse elinde kesin bir bilgi yoktur, daha çok veri topla.</div>

<h2>Hipotez testi çerçevesi</h2>
<p>Her test aynı iskeleti izler: (1) <b>sıfır hipotezi</b> H0 "fark yok", alternatif H1 "fark var"; (2) anlamlılık düzeyi α'yı <b>önceden</b> seç (genellikle 0.05); (3) test istatistiğini ve <b>p-değerini</b> hesapla; (4) p &lt; α ise H0'ı reddet. p-değeri: H0 doğru olsaydı, gözlediğin kadar ya da daha uç bir sonuç görme olasılığı.</p>
<div class="tbl-wrap"><table>
<tr><th>Soru</th><th>Veri</th><th>Test</th></tr>
<tr><td>İki bağımsız grubun ortalaması farklı mı?</td><td>Sayısal, iki grup</td><td><code>ttest_ind(a, b, equal_var=False)</code> (Welch)</td></tr>
<tr><td>Aynı birimlerde önce/sonra farkı var mı?</td><td>Sayısal, eşli</td><td><code>ttest_rel(once, sonra)</code></td></tr>
<tr><td>İki kategorik değişken ilişkili mi?</td><td>Sayım tablosu</td><td><code>chi2_contingency(tablo)</code></td></tr>
<tr><td>İki oran farklı mı? (A/B)</td><td>Başarı / deneme</td><td><code>proportions_ztest</code> ya da ki-kare</td></tr>
<tr><td>İki sayısal değişken birlikte mi hareket ediyor?</td><td>Sayısal çiftler</td><td><code>pearsonr</code> (doğrusal), <code>spearmanr</code> (sıralı)</td></tr>
</table></div>
<pre class="py">import numpy as np
from scipy import stats

rng = np.random.default_rng(7)
istanbul = rng.normal(310, 60, 40)      # sepet tutarı
ankara = rng.normal(285, 75, 35)
t, p = stats.ttest_ind(istanbul, ankara, equal_var=False)
print(f"Welch t={t:.2f}, p={p:.4f}")

# Eşli: aynı 8 kasiyerin eğitim öncesi/sonrası işlem süresi (sn)
once = np.array([62, 58, 71, 66, 59, 73, 68, 64])
sonra = np.array([57, 55, 66, 63, 58, 67, 62, 61])
print("eşli t-testi p =", round(stats.ttest_rel(once, sonra).pvalue, 5))
print("yanlış (bağımsız) t-testi p =", round(stats.ttest_ind(once, sonra).pvalue, 4))</pre>
<p>Eşli veride bağımsız test kullanmak, kasiyerler arasındaki doğal farkı gürültü olarak sayar ve gerçek etkiyi gizler: aynı veriyle p birkaç binde birden 0,05'in üstüne çıkar.</p>
<pre class="py">import pandas as pd
from scipy import stats

# Şehir ile ödeme yöntemi ilişkili mi? (sipariş sayıları)
tablo = pd.DataFrame({"Kart": [320, 210, 150], "Kapıda": [80, 90, 110]},
                     index=["İstanbul", "Ankara", "İzmir"])
chi2, p, dof, beklenen = stats.chi2_contingency(tablo)
print(f"ki-kare={chi2:.1f}, sd={dof}, p={p:.6f}")
print(pd.DataFrame(beklenen, index=tablo.index, columns=tablo.columns).round(1))

x = [1, 2, 3, 4, 5, 6]
y = [2, 4, 9, 15, 30, 70]                       # artan ama doğrusal değil
print("pearson:", round(stats.pearsonr(x, y)[0], 3), "| spearman:", round(stats.spearmanr(x, y)[0], 3))</pre>
<p>Ki-kare testi gözlenen sayımları "ilişki olmasaydı" beklenecek sayımlarla kıyaslar. Spearman sıralar üzerinden çalıştığı için tekdüze (monoton) ama doğrusal olmayan ilişkide 1 verir; Pearson yalnızca doğrusallığı ölçer. Korelasyon nedensellik değildir: dondurma satışı ile klima satışı birlikte artar, ikisinin de sebebi sıcaklıktır.</p>

<h2>A/B testi: Anadolu Market kampanyası</h2>
<pre class="py">import numpy as np
from statsmodels.stats.proportion import proportions_ztest, confint_proportions_2indep

donusum = np.array([120, 150])        # A, B
ziyaret = np.array([1000, 1000])
oran = donusum / ziyaret
z, p = proportions_ztest(donusum, ziyaret)
lift = (oran[1] / oran[0] - 1) * 100
alt, ust = confint_proportions_2indep(donusum[1], ziyaret[1], donusum[0], ziyaret[0])
print(f"A={oran[0]:.1%}  B={oran[1]:.1%}  göreli artış={lift:.1f}%")
print(f"z={z:.3f}  p={p:.4f}")
print(f"B - A farkı için %95 GA: {alt:.3%} … {ust:.3%}")</pre>
<p>p ≈ 0.0496: sınırda. Güven aralığı farkın neredeyse 0'dan %6'ya kadar olabileceğini söylüyor. Doğru karar cümlesi: "B muhtemelen daha iyi, ama etkinin büyüklüğü belirsiz; daha büyük örneklemle doğrula." Testi her gün kontrol edip p 0.05'in altına ilk düştüğünde durdurmak (peeking) yanlış pozitif oranını katlar: örneklem büyüklüğünü önceden hesapla ve sonuna kadar bekle.</p>

<h2>p-değeri hakkında sık yanlışlar ve etki büyüklüğü</h2>
<div class="tbl-wrap"><table>
<tr><th>Yanlış</th><th>Doğrusu</th></tr>
<tr><td>"p = 0.03: H0'ın doğru olma olasılığı %3"</td><td>p, H0 doğruysa bu kadar uç veri görme olasılığıdır; H0'ın olasılığı değildir</td></tr>
<tr><td>"p &gt; 0.05: fark yok, kanıtlandı"</td><td>Kanıt yetersiz demektir; örneklem küçükse gerçek fark kaçabilir (II. tip hata)</td></tr>
<tr><td>"p çok küçük: etki çok büyük"</td><td>Milyon satırda önemsiz farklar bile anlamlı çıkar; etki büyüklüğüne bak</td></tr>
<tr><td>"20 metrik test ettim, biri anlamlı"</td><td>α=0.05 ile 20 testte 1 yanlış pozitif beklenir; çoklu karşılaştırma düzeltmesi yap</td></tr>
</table></div>
<p><b>Etki büyüklüğü</b> (effect size) farkın pratikte ne kadar önemli olduğunu ölçer. Oranlarda göreli artış (lift), ortalamalarda <b>Cohen's d</b>: iki ortalama farkının ortak standart sapmaya bölümü. Kabaca 0.2 küçük, 0.5 orta, 0.8 büyük sayılır. İstatistiksel anlamlılık "fark gerçek mi?", etki büyüklüğü "fark önemli mi?" sorusunu cevaplar; karar için ikisi birlikte gerekir.</p>

<h2>statsmodels ile doğrusal regresyon</h2>
<p>Regresyon, bir sonucu (ciro) birden çok açıklayıcı değişkenle (reklam bütçesi, indirim oranı) ilişkilendirir ve her birinin etkisini diğerleri sabitken tahmin eder. statsmodels'in formül arayüzü R'a benzer: <code>"ciro ~ reklam + indirim"</code>.</p>
<pre class="py">import numpy as np
import pandas as pd
import statsmodels.formula.api as smf

rng = np.random.default_rng(3)
n = 60
df = pd.DataFrame({"reklam": rng.uniform(5, 50, n), "indirim": rng.uniform(0, 20, n)})
df["ciro"] = 120 + 2.5 * df["reklam"] + 1.2 * df["indirim"] + rng.normal(0, 15, n)

model = smf.ols("ciro ~ reklam + indirim", data=df).fit()
print(model.summary().tables[1])
print("R²:", round(model.rsquared, 3), "| düzeltilmiş R²:", round(model.rsquared_adj, 3))
print("reklam katsayısı GA:", model.conf_int().loc["reklam"].round(2).tolist())
print("tahmin:", model.predict(pd.DataFrame({"reklam": [30], "indirim": [10]})).round(1).tolist())</pre>
<div class="tbl-wrap"><table>
<tr><th>Özet tablosu sütunu</th><th>Anlamı</th></tr>
<tr><td><code>coef</code></td><td>Diğerleri sabitken değişkendeki 1 birim artışın sonuca etkisi (reklama +1 bin TL → ciro +2.5 bin TL)</td></tr>
<tr><td><code>std err</code></td><td>Katsayı tahmininin belirsizliği</td></tr>
<tr><td><code>t</code>, <code>P&gt;|t|</code></td><td>"Katsayı 0" hipotezinin testi; küçük p, etkinin sıfırdan farklı olduğunu gösterir</td></tr>
<tr><td><code>[0.025 0.975]</code></td><td>Katsayının %95 güven aralığı</td></tr>
<tr><td><code>R-squared</code></td><td>Sonuçtaki değişkenliğin modelce açıklanan oranı; değişken eklendikçe hep artar, bu yüzden düzeltilmiş R²'ye de bak</td></tr>
</table></div>

<div class="note"><b>Gerçek işte</b>E-ticaret ve bankacılıkta deney ekipleri her A/B testi için önceden bir plan yazar: birincil metrik (dönüşüm), en küçük anlamlı etki (ör. %1 puan), gereken örneklem büyüklüğü (güç analiziyle), test süresi (en az bir tam hafta, haftanın günü etkisi için) ve durdurma kuralı. Sonuç raporunda p-değeri tek başına durmaz: oranlar, fark, güven aralığı ve iş etkisi (yıllık ek ciro tahmini) birlikte sunulur. Regresyon ise "fiyat esnekliği", "kredi notunu etkileyen faktörler" gibi açıklama sorularının temel aracıdır.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Güç analizi: kaç kişi lazım?</h3>
<p>Testin <b>gücü</b> (power), gerçek bir etki varken onu yakalama olasılığıdır (genellikle 0.8 hedeflenir). <code>statsmodels.stats.power.NormalIndPower().solve_power(effect_size=..., alpha=0.05, power=0.8)</code> grup başına gereken örneklemi verir; oranlar için etki büyüklüğü <code>proportion_effectsize(0.15, 0.12)</code> ile hesaplanır. %12'den %15'e çıkışı güvenle yakalamak için grup başına yaklaşık 2000 ziyaretçi gerekir; bin kişilik testin sınırda kalması bu yüzdendir.</p>
<h3>Çoklu karşılaştırma ve Simpson paradoksu</h3>
<p>Birçok segmentte ya da metrikte test yapıyorsan Bonferroni (α / test sayısı) ya da Benjamini-Hochberg (<code>statsmodels.stats.multitest.multipletests</code>) düzeltmesi uygula. Toplamda B kazanırken her şehirde A'nın kazanması mümkündür (Simpson paradoksu): grupların karışımı farklıysa kırılımlara mutlaka bak.</p>
<h3>Varsayım yoksa: bootstrap ve permütasyon</h3>
<p>Medyan gibi formülü zor istatistikler için <b>bootstrap</b>: veriden yerine koyarak binlerce örneklem çek, istatistiği her birinde hesapla, yüzdelik dilimlerden güven aralığı al (<code>scipy.stats.bootstrap</code>). Dağılım varsayımı olmayan iki grup karşılaştırması için permütasyon testi (<code>scipy.stats.permutation_test</code>) ya da Mann-Whitney U (<code>mannwhitneyu</code>) kullan.</p>
</section>'''

LESSON = dict(
    id='istatistik', lv='ileri', mod='Veri Bilimi Araçları', min=60, needs=['numpy', 'pandas', 'scipy', 'statsmodels'],
    title='İstatistik ve hipotez testi',
    sum='Betimsel istatistik, normal/binom/Poisson dağılımları, merkezi limit teoremi, güven aralığı, t-testi, ki-kare, korelasyon, Anadolu Market A/B testi, p-değeri yanlışları, etki büyüklüğü ve statsmodels ile doğrusal regresyon.',
    goals=[
        'Veriyi ortalama, medyan, ddof\'lu standart sapma ve IQR ile doğru özetleyebilirim',
        'scipy.stats ile normal, binom ve Poisson olasılıklarını hesaplayabilirim',
        'Güven aralığı kurup t-testi, ki-kare ve korelasyon testinden doğru olanı seçebilirim',
        'A/B testini oran, lift, p-değeri, güven aralığı ve etki büyüklüğüyle raporlayabilirim',
        'statsmodels ile doğrusal regresyon kurup özet tablosunu yorumlayabilirim',
    ],
    body=BODY,
    ex=[
        dict(t='mc', id='istatistik-1', stage='Isınma',
             q='A/B testinde p = 0.03 çıktı (α = 0.05). Hangisi doğru yorumdur?',
             o=['B\'nin A\'dan daha iyi olma olasılığı %97\'dir', 'Fark yoksa bu kadar uç sonuç görme olasılığı %3\'tür', 'Sıfır hipotezinin (fark yok) doğru olma olasılığı %3\'tür', 'Aynı testi tekrarlarsak %97 olasılıkla aynı sonuç çıkar'], a=1,
             why='p-değeri, H0 doğru varsayımı altında gözlenen ya da daha uç verinin olasılığıdır. Hipotezlerin olasılığı ya da tekrar edilebilirlik oranı değildir; bu üç yanlış yorum sektörde çok yaygındır.'),
        dict(t='mc', id='istatistik-2', stage='Isınma',
             q='İK, şirketteki "tipik maaşı" raporlayacak. Birkaç yöneticinin maaşı diğerlerinin 10 katı. Hangi ölçü en uygun?',
             o=['Aritmetik ortalama', 'Medyan', 'Standart sapma', 'En büyük değer'], a=1,
             why='Sağa çarpık ve aykırı değerli veride ortalama yukarı çekilir; medyan ortadaki kişiyi gösterir ve aykırı değerden etkilenmez. Standart sapma merkez değil yayılım ölçüsüdür.'),
        dict(t='mc', id='istatistik-3', stage='Isınma',
             q='Aynı 25 kasiyerin eğitimden önce ve sonra ortalama işlem süresi ölçüldü. Hangi test uygundur?',
             o=['scipy.stats.ttest_ind (bağımsız iki örneklem)', 'scipy.stats.ttest_rel (eşli örneklem)', 'scipy.stats.chi2_contingency', 'scipy.stats.pearsonr'], a=1,
             why='Ölçümler aynı kişilerden iki kez alındığı için eşlidir; ttest_rel kişi başı farkları test eder ve kişiler arası doğal farkı ayıklar. ttest_ind bağımsız gruplar içindir; ki-kare sayım tabloları, pearsonr ilişki içindir.'),
        dict(t='predict', id='istatistik-4', stage='Kodu oku', q='Bu kod ne yazdırır?',
             code='import numpy as np\nimport pandas as pd\nx = [2, 4, 4, 4, 5, 5, 7, 9]\nprint(np.std(x), round(pd.Series(x).std(), 3))\n',
             o=['2.0 2.0', '2.138 2.138', '2.0 2.138', '2.138 2.0'], a=2,
             why='np.std varsayılan olarak ddof=0 (n\'e böler): varyans 32/8 = 4, std 2.0. pandas std ddof=1 kullanır: 32/7 ≈ 4.571, std ≈ 2.138. Aynı veri, iki kütüphane, iki farklı sonuç.'),
        dict(t='predict', id='istatistik-5', stage='Kodu oku', q='Bu kod ne yazdırır?',
             code='from scipy import stats\nprint(round(stats.norm.cdf(1.96), 3), round(stats.norm.ppf(0.975), 2))\n',
             o=['0.95 1.96', '0.975 1.96', '0.025 -1.96', '0.975 0.83'], a=1,
             why='cdf(1.96), standart normalde 1.96\'nın altında kalan alandır: 0.975. ppf bunun tersidir: 0.975 yüzdelik dilim 1.96. İki yanlı %95 güven aralığındaki 1.96 buradan gelir (her kuyrukta %2.5).'),
        dict(t='predict', id='istatistik-6', stage='Kodu oku', q='Bu kod ne yazdırır?',
             code='from scipy import stats\nx = [1, 2, 3, 4, 5]\ny = [1, 4, 9, 16, 100]\nr_s, _ = stats.spearmanr(x, y)\nr_p, _ = stats.pearsonr(x, y)\nprint(round(r_s, 2), round(r_p, 2))\n',
             o=['1.0 1.0', '0.8 1.0', '1.0 0.8', '0.8 0.8'], a=2,
             why='y, x arttıkça hep artıyor (monoton): sıralar birebir aynı, Spearman 1.0. Ama ilişki doğrusal değil ve 100 aykırı bir sıçrama; Pearson doğrusallığı ölçtüğü için 0.8\'e düşer.'),
        dict(t='order', id='istatistik-7', stage='Kodu oku',
             q='<p>A/B testinin dönüşüm tablosunu ki-kare testiyle değerlendirip karar yazdıran programın satırlarını sırala (A: 120/1000, B: 150/1000).</p>',
             lines=['from scipy import stats', 'tablo = [[120, 880], [150, 850]]', 'chi2, p, sd, beklenen = stats.chi2_contingency(tablo)', 'karar = "Fark anlamlı" if p < 0.05 else "Fark anlamlı değil"', 'print(sd, karar)'],
             expect='1 Fark anlamlı değil\n',
             hint='Tablo test edilmeden önce kurulmalı, karar p\'ye bağlı.',
             why='2x2 tabloda serbestlik derecesi 1\'dir. chi2_contingency 2x2\'de Yates düzeltmesi uygular ve p ≈ 0.058 verir; düzeltmesiz z-testinde p ≈ 0.0496. Sınırdaki sonuçlar yöntem seçimine duyarlıdır: daha çok veri topla.'),
        dict(t='code', id='istatistik-8', stage='Rehberli', diff=1,
             q='<p><code>betimsel(degerler)</code> fonksiyonu bir sayı listesi alsın ve şu anahtarlarla sözlük döndürsün (hepsi 2 basamak, Python float): <code>ortalama</code>, <code>medyan</code>, <code>std</code> (örneklem, <code>ddof=1</code>), <code>q1</code>, <code>q3</code> (<code>np.percentile</code> varsayılan yöntemiyle), <code>iqr</code> (q3 - q1).</p>',
             guide=['Listeyi np.array\'e çevir.', 'Merkez: np.mean ve np.median.', 'Yayılım: np.std(x, ddof=1); çeyrekler: np.percentile(x, [25, 75]).', 'Her değeri round(float(...), 2) ile sözlüğe koy.'],
             example='import numpy as np\nsure = np.array([3, 7, 5, 9, 4])\nprint(round(float(np.var(sure, ddof=1)), 2), np.percentile(sure, 90))\n',
             start='import numpy as np\n\ndef betimsel(degerler):\n    x = np.array(degerler, dtype=float)\n    # TODO 1: ortalama ve medyan\n    # TODO 2: std (ddof=1)\n    # TODO 3: q1, q3 = np.percentile(x, [25, 75]); iqr\n    # TODO 4: 2 basamaklı float değerlerle sözlük döndür\n    return {}\n',
             sol='import numpy as np\n\ndef betimsel(degerler):\n    x = np.array(degerler, dtype=float)\n    q1, q3 = np.percentile(x, [25, 75])\n    sonuc = {\n        "ortalama": np.mean(x),\n        "medyan": np.median(x),\n        "std": np.std(x, ddof=1),\n        "q1": q1,\n        "q3": q3,\n        "iqr": q3 - q1,\n    }\n    return {k: round(float(v), 2) for k, v in sonuc.items()}\n',
             tests='r = betimsel([120, 95, 410, 260, 180, 80, 150, 210, 175, 140, 190, 2400])\nassert set(r) == {"ortalama", "medyan", "std", "q1", "q3", "iqr"}, "Altı anahtar olmalı"\nassert r["ortalama"] == 367.5 and r["medyan"] == 177.5, "ortalama 367.5, medyan 177.5"\nassert r["std"] == 645.98, "std örneklem (ddof=1) olmalı: 645.98 (ddof=0 ile 618.48 çıkar)"\nassert r["q1"] == 135.0 and r["q3"] == 222.5 and r["iqr"] == 87.5, "Çeyrekler: q1 135.0, q3 222.5, iqr 87.5"\nassert all(type(v) is float for v in r.values()), "Değerler Python float olmalı"\n',
             hints=['numpy: mean, median, std(ddof=1), percentile.', 'q1, q3 = np.percentile(x, [25, 75])', 'Sözlüğü {k: round(float(v), 2) for k, v in ...} ile yuvarla.'],
             why='Aykırı 2400 TL ortalamayı ve std\'yi şişirirken medyan ve IQR neredeyse etkilenmedi. Raporda iki grubu birlikte vermek, verinin şeklini okuyucuya dürüstçe anlatır.'),
        dict(t='code', id='istatistik-9', stage='Rehberli', diff=2,
             q='<p><code>guven_araligi(veri, guven=0.95)</code> fonksiyonu ortalama için t dağılımına dayalı güven aralığını <code>(alt, ust)</code> demeti olarak, 2 basamakla döndürsün. Formül: <code>ortalama ± t* · s / √n</code>; <code>s</code> örneklem std (ddof=1), <code>t* = stats.t.ppf((1 + guven) / 2, df=n - 1)</code>. En az 2 gözlem yoksa <code>ValueError</code>.</p>',
             guide=['n < 2 ise ValueError fırlat (std hesaplanamaz).', 'ortalama ve standart hata se = s / √n hesapla.', 't* = stats.t.ppf((1 + guven) / 2, df=n - 1)', 'alt = ortalama - t* · se, ust = ortalama + t* · se; ikisini round(float(...), 2) ile döndür.'],
             example='import numpy as np\nfrom scipy import stats\nx = np.array([10.0, 12.0, 11.0, 13.0])\nz_kritik = stats.norm.ppf(0.95)          # %90 için z\nprint(round(float(z_kritik), 3), round(float(stats.t.ppf(0.95, df=3)), 3))\n',
             start='import numpy as np\nfrom scipy import stats\n\ndef guven_araligi(veri, guven=0.95):\n    x = np.array(veri, dtype=float)\n    n = len(x)\n    # TODO 1: n < 2 ise ValueError\n    # TODO 2: ortalama ve se = std(ddof=1) / sqrt(n)\n    # TODO 3: t_kritik = stats.t.ppf((1 + guven) / 2, df=n - 1)\n    # TODO 4: (alt, ust) döndür\n    return (0.0, 0.0)\n',
             sol='import numpy as np\nfrom scipy import stats\n\ndef guven_araligi(veri, guven=0.95):\n    x = np.array(veri, dtype=float)\n    n = len(x)\n    if n < 2:\n        raise ValueError("En az iki gözlem gerekir")\n    ort = x.mean()\n    se = x.std(ddof=1) / np.sqrt(n)\n    t_kritik = stats.t.ppf((1 + guven) / 2, df=n - 1)\n    return (round(float(ort - t_kritik * se), 2), round(float(ort + t_kritik * se), 2))\n',
             tests='from scipy import stats\nimport numpy as np\nb = [4.2, 6.1, 3.8, 7.5, 5.0, 4.9, 6.3, 5.5, 4.1, 5.8]\nalt, ust = guven_araligi(b)\nbek = stats.t.interval(0.95, df=9, loc=np.mean(b), scale=np.std(b, ddof=1) / np.sqrt(10))\nassert (alt, ust) == (round(bek[0], 2), round(bek[1], 2)), f"%95 GA {round(bek[0], 2)} – {round(bek[1], 2)} olmalı (t dağılımı, ddof=1)"\na90, u90 = guven_araligi(b, 0.90)\nassert a90 > alt and u90 < ust, "%90 aralığı %95\'ten dar olmalı"\ntry:\n    guven_araligi([5.0])\n    assert False, "Tek gözlemde ValueError bekleniyordu"\nexcept ValueError:\n    pass\n',
             hints=['Standart hata = örneklem std (ddof=1) / √n.', 'İki yanlı aralık için kritik değer (1 + guven) / 2 yüzdelik dilimidir: %95 → 0.975.', 'z yerine t kullan: stats.t.ppf(0.975, df=n - 1) 10 gözlemde 2.262\'dir, 1.96 değil.'],
             why='Küçük örneklemde σ bilinmediği için t dağılımı kullanılır; kuyrukları normalden kalındır ve aralığı genişletir. Güven düzeyi düştükçe aralık daralır: kesinlik ile güven arasında takas vardır.'),
        dict(t='code', id='istatistik-10', stage='Rehberli', diff=2,
             q='<p><code>ab_testi(donusum_a, n_a, donusum_b, n_b, alfa=0.05)</code> iki oran için birleşik (pooled) z-testini elle yapsın ve sözlük döndürsün:</p><ul><li><code>oran_a</code>, <code>oran_b</code> (4 basamak),</li><li><code>z</code> = (oran_b - oran_a) / se, se = √(p̂(1-p̂)(1/n_a + 1/n_b)), p̂ = toplam dönüşüm / toplam ziyaret (3 basamak),</li><li><code>p</code> iki yanlı p-değeri = 2 · <code>stats.norm.sf(|z|)</code> (4 basamak),</li><li><code>anlamli</code>: p &lt; alfa (bool).</li></ul>',
             guide=['Oranları hesapla: oran_a = donusum_a / n_a, oran_b = donusum_b / n_b.', 'Birleşik oran p̂ = (donusum_a + donusum_b) / (n_a + n_b).', 'se = sqrt(p̂ * (1 - p̂) * (1 / n_a + 1 / n_b)); z = (oran_b - oran_a) / se.', 'p = 2 * stats.norm.sf(abs(z)); sözlüğü yuvarlanmış değerlerle kur, anlamli = bool(p < alfa).'],
             example='import math\nfrom scipy import stats\n# Tek oran testi: 1000 siparişte 130 iade, beklenen %10 mu?\np0, n, x = 0.10, 1000, 130\nz = (x / n - p0) / math.sqrt(p0 * (1 - p0) / n)\nprint(round(z, 3), round(2 * stats.norm.sf(abs(z)), 4))\n',
             start='import math\nfrom scipy import stats\n\ndef ab_testi(donusum_a, n_a, donusum_b, n_b, alfa=0.05):\n    oran_a = donusum_a / n_a\n    oran_b = donusum_b / n_b\n    # TODO 1: birleşik oran p_hat\n    # TODO 2: se ve z\n    # TODO 3: iki yanlı p\n    # TODO 4: sözlüğü döndür\n    return {"oran_a": round(oran_a, 4), "oran_b": round(oran_b, 4)}\n',
             sol='import math\nfrom scipy import stats\n\ndef ab_testi(donusum_a, n_a, donusum_b, n_b, alfa=0.05):\n    oran_a = donusum_a / n_a\n    oran_b = donusum_b / n_b\n    p_hat = (donusum_a + donusum_b) / (n_a + n_b)\n    se = math.sqrt(p_hat * (1 - p_hat) * (1 / n_a + 1 / n_b))\n    z = (oran_b - oran_a) / se\n    p = 2 * stats.norm.sf(abs(z))\n    return {"oran_a": round(oran_a, 4), "oran_b": round(oran_b, 4),\n            "z": round(z, 3), "p": round(float(p), 4), "anlamli": bool(p < alfa)}\n',
             tests='from statsmodels.stats.proportion import proportions_ztest\nr = ab_testi(120, 1000, 150, 1000)\nz_sm, p_sm = proportions_ztest([150, 120], [1000, 1000])\nassert r["oran_a"] == 0.12 and r["oran_b"] == 0.15, "Oranlar 0.12 ve 0.15"\nassert r["z"] == round(z_sm, 3), f"z {round(z_sm, 3)} olmalı (birleşik oranla se)"\nassert r["p"] == round(p_sm, 4), f"p {round(p_sm, 4)} olmalı (iki yanlı)"\nassert r["anlamli"] is True, "p < 0.05 → anlamlı (sınırda!)"\nr2 = ab_testi(120, 1000, 150, 1000, alfa=0.01)\nassert r2["anlamli"] is False, "alfa=0.01 ile anlamlı değil"\nr3 = ab_testi(60, 500, 50, 500)\nassert r3["z"] < 0, "B kötüyse z negatif olmalı"\n',
             hints=['Birleşik oran: H0 altında iki grup aynı orana sahip kabul edilir.', 'se = math.sqrt(p_hat * (1 - p_hat) * (1 / n_a + 1 / n_b))', 'p = 2 * stats.norm.sf(abs(z)); anlamli için bool(p < alfa) yaz ki numpy bool dönmesin.'],
             why='İki oran z-testinde H0 "oranlar eşit" olduğu için standart hata birleşik oranla hesaplanır. Elle yazdığın sonuç statsmodels\'in proportions_ztest\'iyle birebir aynıdır; kütüphanenin içinde ne olduğunu bilmek, sonucu savunabilmektir.'),
        dict(t='code', id='istatistik-11', stage='Kendin yaz', diff=2,
             q='<p>Merkezi limit teoremini simüle et. <code>merkezi_limit(orneklem_sayisi, boyut, seed)</code> fonksiyonu <code>np.random.default_rng(seed)</code> ile ortalaması 100 olan üstel dağılımdan (<code>exponential(scale=100)</code>) <code>orneklem_sayisi</code> adet, her biri <code>boyut</code> gözlemli örneklem çeksin ve örneklem ortalamalarını bir numpy dizisi olarak döndürsün. Aynı seed aynı sonucu vermeli.</p>',
             start='import numpy as np\n\ndef merkezi_limit(orneklem_sayisi, boyut, seed):\n    pass\n',
             sol='import numpy as np\n\ndef merkezi_limit(orneklem_sayisi, boyut, seed):\n    rng = np.random.default_rng(seed)\n    veri = rng.exponential(scale=100, size=(orneklem_sayisi, boyut))\n    return veri.mean(axis=1)\n',
             tests='import numpy as np\nm = merkezi_limit(3000, 50, seed=1)\nassert isinstance(m, np.ndarray) and len(m) == 3000, "3000 elemanlı numpy dizisi dönmeli"\nassert abs(m.mean() - 100) < 2, "Ortalamaların ortalaması 100\'e yakın olmalı"\nassert abs(m.std() - 100 / np.sqrt(50)) < 1.5, "Standart hata ≈ σ/√n = 100/√50 ≈ 14.1 olmalı"\nassert np.array_equal(m, merkezi_limit(3000, 50, seed=1)), "Aynı seed aynı sonucu vermeli"\nm2 = merkezi_limit(3000, 200, seed=2)\nassert m2.std() < m.std() / 1.7, "4 kat büyük örneklem standart hatayı yaklaşık yarıya indirmeli"\n',
             hints=['rng = np.random.default_rng(seed); rng.exponential(scale=100, size=(orneklem_sayisi, boyut))', 'Her satır bir örneklem: mean(axis=1).'],
             why='Üstel dağılım çok çarpıktır; yine de 50 gözlemli örneklemlerin ortalamaları 100 etrafında, σ/√n genişliğinde neredeyse normal dağılır. Tek bir 2 boyutlu çekiş ve axis=1 ortalaması, döngüden çok hızlıdır.'),
        dict(t='code', id='istatistik-12', stage='Kendin yaz', diff=2,
             q='<p><code>iki_grup_testi(a, b, alfa=0.05)</code> iki bağımsız grubun ortalamasını <b>Welch t-testi</b> (<code>equal_var=False</code>) ile karşılaştırsın ve <code>(t, p, karar)</code> döndürsün: <code>t</code> 3 basamak, <code>p</code> 4 basamak (Python float), <code>karar</code> p &lt; alfa ise <code>"anlamlı"</code>, değilse <code>"anlamsız"</code>.</p>',
             start='from scipy import stats\n\ndef iki_grup_testi(a, b, alfa=0.05):\n    pass\n',
             sol='from scipy import stats\n\ndef iki_grup_testi(a, b, alfa=0.05):\n    sonuc = stats.ttest_ind(a, b, equal_var=False)\n    t, p = float(sonuc.statistic), float(sonuc.pvalue)\n    return round(t, 3), round(p, 4), "anlamlı" if p < alfa else "anlamsız"\n',
             tests='import numpy as np\nfrom scipy import stats\nrng = np.random.default_rng(7)\na = rng.normal(310, 60, 40)\nb = rng.normal(250, 90, 25)\nt, p, k = iki_grup_testi(a, b)\nbek = stats.ttest_ind(a, b, equal_var=False)\nassert t == round(float(bek.statistic), 3) and p == round(float(bek.pvalue), 4), "Welch testi (equal_var=False) kullanılmalı"\nassert type(p) is float, "p Python float olmalı"\nassert k == ("anlamlı" if bek.pvalue < 0.05 else "anlamsız"), "karar p < alfa kuralına uymalı"\nt2, p2, k2 = iki_grup_testi([5.0, 5.1, 4.9, 5.0], [5.0, 4.9, 5.1, 5.05])\nassert k2 == "anlamsız", "Neredeyse aynı gruplar anlamsız olmalı"\n',
             hints=['stats.ttest_ind(a, b, equal_var=False) Welch testidir.', 'Sonuç nesnesinin .statistic ve .pvalue alanlarını float() ile çevir.'],
             why='Welch testi grupların varyansının eşit olduğunu varsaymaz; varyanslar ve grup boyutları farklıyken klasik t-testinden daha güvenilirdir. Varyanslar eşitse de neredeyse aynı sonucu verdiği için varsayılan tercih olmalıdır.'),
        dict(t='code', id='istatistik-13', stage='Kendin yaz', diff=2,
             q='<p><code>cohen_d(a, b)</code> fonksiyonu iki grup için Cohen\'s d etki büyüklüğünü 2 basamakla döndürsün: <code>(ort_a - ort_b) / s_ortak</code>, <code>s_ortak = √(((n_a - 1)·s_a² + (n_b - 1)·s_b²) / (n_a + n_b - 2))</code>, s örneklem std (ddof=1). Ayrıca <code>etki_yorumu(d)</code> yaz: |d| &lt; 0.2 → <code>"önemsiz"</code>, &lt; 0.5 → <code>"küçük"</code>, &lt; 0.8 → <code>"orta"</code>, diğer → <code>"büyük"</code>.</p>',
             start='import numpy as np\n\ndef cohen_d(a, b):\n    pass\n\ndef etki_yorumu(d):\n    pass\n',
             sol='import numpy as np\n\ndef cohen_d(a, b):\n    a, b = np.asarray(a, dtype=float), np.asarray(b, dtype=float)\n    na, nb = len(a), len(b)\n    s_ortak = np.sqrt(((na - 1) * a.var(ddof=1) + (nb - 1) * b.var(ddof=1)) / (na + nb - 2))\n    return round(float((a.mean() - b.mean()) / s_ortak), 2)\n\ndef etki_yorumu(d):\n    m = abs(d)\n    if m < 0.2:\n        return "önemsiz"\n    if m < 0.5:\n        return "küçük"\n    if m < 0.8:\n        return "orta"\n    return "büyük"\n',
             tests='a = [62, 58, 71, 66, 59, 73, 68, 64]\nb = [57, 55, 66, 63, 58, 67, 62, 61]\nd = cohen_d(a, b)\nassert d == 0.82, "d = (65.125 - 61.125) / s_ortak ≈ 0.82 (ddof=1 ile)"\nassert type(d) is float, "Python float dönmeli"\nassert cohen_d(b, a) == -0.82, "Sıra değişince işaret değişmeli"\nassert etki_yorumu(0.82) == "büyük" and etki_yorumu(-0.5) == "orta", "|d| ile yorumla"\nassert etki_yorumu(0.19) == "önemsiz" and etki_yorumu(0.3) == "küçük", "Sınırlar: 0.2, 0.5, 0.8"\n',
             hints=['Varyans: np.var(x, ddof=1); ortak std, serbestlik dereceleriyle ağırlıklandırılmış varyansların karekökü.', 'Yorumda abs(d) kullan: yön değil büyüklük önemli.'],
             why='p-değeri örneklem büyüdükçe küçülür; Cohen\'s d ise örneklem boyutundan bağımsız olarak farkın standart sapma cinsinden büyüklüğünü verir. Karar için ikisini birlikte raporla.'),
        dict(t='code', id='istatistik-14', stage='Kendin yaz', diff=2,
             q='<p>İki operasyon sorusu için iki fonksiyon yaz (sonuçlar 4 basamak, Python float):</p><ul><li><code>cagri_asimi(ortalama, kapasite)</code>: Ilgaz Bank çağrı merkezine saatte ortalama <code>ortalama</code> çağrı geliyor (Poisson). Bir saatte gelen çağrının <code>kapasite</code>\'yi <b>aşma</b> (kapasiteden fazla olma) olasılığı.</li><li><code>en_az_iade(n, oran, k)</code>: <code>n</code> siparişte iade olasılığı <code>oran</code> (binom). <b>En az</b> <code>k</code> iade gelme olasılığı.</li></ul>',
             start='from scipy import stats\n\ndef cagri_asimi(ortalama, kapasite):\n    pass\n\ndef en_az_iade(n, oran, k):\n    pass\n',
             sol='from scipy import stats\n\ndef cagri_asimi(ortalama, kapasite):\n    return round(float(stats.poisson.sf(kapasite, ortalama)), 4)\n\ndef en_az_iade(n, oran, k):\n    return round(float(stats.binom.sf(k - 1, n, oran)), 4)\n',
             tests='assert cagri_asimi(2.5, 4) == 0.1088, "Poisson(2.5): 4\'ten fazla = sf(4) = 0.1088"\nassert cagri_asimi(10, 10) == 0.417, "Poisson(10): 10\'dan fazla = 0.417"\nassert en_az_iade(10, 0.1, 1) == 0.6513, "En az 1 iade = 1 - P(0) = 0.6513"\nassert en_az_iade(20, 0.1, 3) == 0.3231, "En az 3 iade = sf(2) = 0.3231; sf(3) yazarsan \'3\'ten fazla\'yı hesaplarsın"\nassert type(cagri_asimi(2.5, 4)) is float, "Python float dönmeli"\n',
             hints=['"k\'dan fazla" = sf(k); "en az k" = sf(k - 1).', 'stats.poisson.sf(kapasite, ortalama), stats.binom.sf(k - 1, n, oran)'],
             why='Kesikli dağılımlarda sf(k) = P(X > k)\'dir. "En az k" k\'yı da içerdiği için sf(k - 1) gerekir. Kapasite planlamasında bu bir birimlik fark, personel sayısını değiştirebilir.'),
        dict(t='code', id='istatistik-15', stage='Hata avı', kind='bug', diff=2,
             q='<p><b>Hatayı bul ve düzelt.</b> <code>once_sonra(once, sonra)</code> aynı kasiyerlerin eğitim öncesi ve sonrası işlem sürelerini karşılaştırıp p-değerini (4 basamak, float) döndürmeli. Kod çalışıyor ama eğitimin açık etkisini "anlamsız" buluyor.</p>',
             start='from scipy import stats\n\ndef once_sonra(once, sonra):\n    sonuc = stats.ttest_ind(once, sonra)\n    return round(float(sonuc.pvalue), 4)\n',
             sol='from scipy import stats\n\ndef once_sonra(once, sonra):\n    sonuc = stats.ttest_rel(once, sonra)\n    return round(float(sonuc.pvalue), 4)\n',
             tests='from scipy import stats\nonce = [62, 58, 71, 66, 59, 73, 68, 64]\nsonra = [57, 55, 66, 63, 58, 67, 62, 61]\np = once_sonra(once, sonra)\nassert p == round(float(stats.ttest_rel(once, sonra).pvalue), 4), "Aynı kişilerin önce/sonra ölçümü eşlidir: ttest_rel kullan"\nassert p < 0.01, "Eşli testte etki açıkça anlamlı olmalı"\n',
             hints=['Veriler aynı 8 kasiyerden iki kez alınmış: gruplar bağımsız değil.', 'Eşli örneklem testi: stats.ttest_rel(once, sonra).'],
             why='Bağımsız test, kasiyerler arasındaki büyük doğal farkı gürültü sayar ve p ≈ 0.12 verir. Eşli test kişi başına farka bakar (hepsi 1-6 sn hızlanmış) ve p binde birin altına iner. Yanlış test seçimi gerçek bir etkiyi görünmez kılar.'),
        dict(t='code', id='istatistik-16', stage='Hata avı', kind='bug', diff=2,
             q='<p><b>Hatayı bul ve düzelt.</b> <code>donusum_testi(ziyaret_a, alim_a, ziyaret_b, alim_b)</code> iki sayfanın dönüşümünü ki-kare testiyle karşılaştırıp p-değerini (4 basamak, float) döndürmeli. Analist sonucu şüpheli buldu: dönüşüm oranları aynı olan iki grupta bile "anlamlı fark" çıkıyor.</p>',
             start='from scipy import stats\n\ndef donusum_testi(ziyaret_a, alim_a, ziyaret_b, alim_b):\n    tablo = [[alim_a, ziyaret_a], [alim_b, ziyaret_b]]\n    chi2, p, sd, beklenen = stats.chi2_contingency(tablo)\n    return round(float(p), 4)\n',
             sol='from scipy import stats\n\ndef donusum_testi(ziyaret_a, alim_a, ziyaret_b, alim_b):\n    tablo = [[alim_a, ziyaret_a - alim_a], [alim_b, ziyaret_b - alim_b]]\n    chi2, p, sd, beklenen = stats.chi2_contingency(tablo)\n    return round(float(p), 4)\n',
             tests='from scipy import stats\nassert donusum_testi(1000, 120, 1000, 150) == round(float(stats.chi2_contingency([[120, 880], [150, 850]])[1]), 4), "Tablo hücreleri birbirini dışlamalı: [alım, alım yapmayan]"\nassert donusum_testi(1000, 100, 2000, 200) == 1.0, "Oranlar aynı (%10) iken p = 1.0 olmalı"\n',
             hints=['Ki-kare tablosunun her satırındaki hücreler birbirini dışlayan kategoriler olmalı.', 'Ziyaret toplamdır; alım ziyaretin içindedir. İkinci hücre "alım yapmayan" = ziyaret - alım.'],
             why='Olasılık tablosunun her hücresi ayrık bir kategori sayımıdır. Toplamı (ziyaret) hücre olarak koymak alımı iki kez sayar ve grupların boyutu farklıysa oranlar aynıyken bile sahte bir ilişki üretir.'),
        dict(t='code', id='istatistik-17', stage='Meydan okuma', diff=3,
             q='<p><code>regresyon(df, hedef, aciklayicilar, alfa=0.05)</code> fonksiyonu statsmodels formül arayüzüyle (<code>smf.ols</code>) doğrusal regresyon kursun ve sözlük döndürsün:</p><ul><li><code>katsayilar</code>: açıklayıcı değişken → katsayı (3 basamak; sabit terim <b>hariç</b>),</li><li><code>r2</code>: düzeltilmiş R² (3 basamak),</li><li><code>anlamli</code>: p-değeri alfa\'dan küçük açıklayıcıların listesi (<code>aciklayicilar</code> sırasıyla),</li><li><code>tahmin</code>: her açıklayıcının ortalama değerindeki tahmin (2 basamak).</li></ul><p>Açıklayıcı listesi boşsa ya da df\'te olmayan bir sütun varsa <code>ValueError</code>.</p>',
             start='import pandas as pd\nimport statsmodels.formula.api as smf\n\ndef regresyon(df, hedef, aciklayicilar, alfa=0.05):\n    pass\n',
             sol='import pandas as pd\nimport statsmodels.formula.api as smf\n\ndef regresyon(df, hedef, aciklayicilar, alfa=0.05):\n    if not aciklayicilar:\n        raise ValueError("En az bir açıklayıcı gerekir")\n    eksik = [s for s in [hedef, *aciklayicilar] if s not in df.columns]\n    if eksik:\n        raise ValueError(f"Sütun yok: {eksik}")\n    formul = f"{hedef} ~ " + " + ".join(aciklayicilar)\n    model = smf.ols(formul, data=df).fit()\n    ortalamalar = df[aciklayicilar].mean().to_frame().T\n    return {\n        "katsayilar": {a: round(float(model.params[a]), 3) for a in aciklayicilar},\n        "r2": round(float(model.rsquared_adj), 3),\n        "anlamli": [a for a in aciklayicilar if model.pvalues[a] < alfa],\n        "tahmin": round(float(model.predict(ortalamalar).iloc[0]), 2),\n    }\n',
             tests='import numpy as np\nimport pandas as pd\nimport statsmodels.formula.api as smf\nrng = np.random.default_rng(13)\nn = 80\nd = pd.DataFrame({"reklam": rng.uniform(5, 50, n), "indirim": rng.uniform(0, 20, n), "hava": rng.normal(20, 5, n)})\nd["ciro"] = 120 + 2.5 * d["reklam"] + 1.5 * d["indirim"] + rng.normal(0, 10, n)\nr = regresyon(d, "ciro", ["reklam", "indirim", "hava"])\nm = smf.ols("ciro ~ reklam + indirim + hava", data=d).fit()\nassert set(r["katsayilar"]) == {"reklam", "indirim", "hava"}, "Katsayılarda yalnız açıklayıcılar olmalı (Intercept hariç)"\nassert r["katsayilar"]["reklam"] == round(m.params["reklam"], 3), "reklam katsayısı yanlış"\nassert r["r2"] == round(m.rsquared_adj, 3), "r2 düzeltilmiş R² olmalı (rsquared_adj)"\nassert r["anlamli"] == [a for a in ["reklam", "indirim", "hava"] if m.pvalues[a] < 0.05], "anlamli listesi p < alfa olanlar"\nassert "hava" not in r["anlamli"], "Hava ciroyu etkilemiyor; anlamlı çıkmamalı"\nassert abs(r["tahmin"] - d["ciro"].mean()) < 0.01, "Ortalamalardaki tahmin, OLS\'de hedefin ortalamasına eşittir"\nfor kotu in ([], ["reklam", "yok"]):\n    try:\n        regresyon(d, "ciro", kotu)\n        assert False, f"{kotu} için ValueError bekleniyordu"\n    except ValueError:\n        pass\n',
             hints=['Formülü metin olarak kur: "ciro ~ reklam + indirim + hava".', 'model.params, model.pvalues ve model.rsquared_adj birer Series/sayıdır; "Intercept" anahtarını atla.', 'Tahmin için açıklayıcı ortalamalarından tek satırlık DataFrame kur: df[aciklayicilar].mean().to_frame().T ve model.predict(...).'],
             why='Formül arayüzü sütun adlarıyla okunur modeller kurar. Gürültü değişkeni (hava) modele girse de anlamlı çıkmaz; düzeltilmiş R² gereksiz değişkeni cezalandırır. OLS doğrusu açıklayıcıların ortalama noktasından geçtiği için oradaki tahmin hedefin ortalamasıdır: güzel bir sağlama.'),
        dict(t='code', id='istatistik-18', stage='Mini proje', diff=3,
             q='<p>Anadolu Market kampanya raporu. <code>kampanya_raporu(df, alfa=0.05)</code> fonksiyonu <code>grup</code> (<code>"A"</code>/<code>"B"</code>), <code>donustu</code> (0/1) ve <code>sepet</code> (dönüşmeyenlerde 0) sütunlu ziyaret tablosundan sözlük döndürsün:</p><ul><li><code>oran_A</code>, <code>oran_B</code>: dönüşüm oranları (4 basamak),</li><li><code>lift</code>: B\'nin A\'ya göre göreli artışı, yüzde (1 basamak),</li><li><code>p_donusum</code>: grup × donustu çapraz tablosunun <code>chi2_contingency</code> p-değeri (4 basamak),</li><li><code>p_sepet</code>: yalnız dönüşenlerin sepetleri için Welch t-testi p-değeri (4 basamak),</li><li><code>karar</code>: p_donusum &lt; alfa ve lift &gt; 0 → <code>"B\'yi yay"</code>; p_donusum &lt; alfa ve lift &lt; 0 → <code>"A\'da kal"</code>; aksi hâlde <code>"Yeterli kanıt yok"</code>.</li></ul>',
             start='import pandas as pd\nfrom scipy import stats\n\ndef kampanya_raporu(df, alfa=0.05):\n    pass\n',
             sol='import pandas as pd\nfrom scipy import stats\n\ndef donusum_oranlari(df):\n    return df.groupby("grup")["donustu"].mean()\n\ndef kampanya_raporu(df, alfa=0.05):\n    oran = donusum_oranlari(df)\n    lift = (oran["B"] / oran["A"] - 1) * 100\n    tablo = pd.crosstab(df["grup"], df["donustu"])\n    p_don = float(stats.chi2_contingency(tablo)[1])\n    alan = df[df["donustu"] == 1]\n    p_sep = float(stats.ttest_ind(alan.loc[alan["grup"] == "A", "sepet"],\n                                  alan.loc[alan["grup"] == "B", "sepet"], equal_var=False).pvalue)\n    if p_don < alfa and lift > 0:\n        karar = "B\'yi yay"\n    elif p_don < alfa and lift < 0:\n        karar = "A\'da kal"\n    else:\n        karar = "Yeterli kanıt yok"\n    return {"oran_A": round(float(oran["A"]), 4), "oran_B": round(float(oran["B"]), 4),\n            "lift": round(float(lift), 1), "p_donusum": round(p_don, 4),\n            "p_sepet": round(p_sep, 4), "karar": karar}\n',
             tests='import numpy as np\nimport pandas as pd\nfrom scipy import stats\ndef kur(n_a, d_a, n_b, d_b, seed):\n    rng = np.random.default_rng(seed)\n    grup = ["A"] * n_a + ["B"] * n_b\n    don = [1] * d_a + [0] * (n_a - d_a) + [1] * d_b + [0] * (n_b - d_b)\n    sepet = np.where(np.array(don) == 1, rng.normal(300, 50, n_a + n_b).round(2), 0.0)\n    return pd.DataFrame({"grup": grup, "donustu": don, "sepet": sepet})\nd = kur(2000, 240, 2000, 310, seed=5)\nr = kur_r = kampanya_raporu(d)\nassert r["oran_A"] == 0.12 and r["oran_B"] == 0.155, "Oranlar 0.12 ve 0.155"\nassert r["lift"] == 29.2, "lift = (0.155 / 0.12 - 1) * 100 = 29.2"\nbek = round(float(stats.chi2_contingency(pd.crosstab(d["grup"], d["donustu"]))[1]), 4)\nassert r["p_donusum"] == bek, f"p_donusum {bek} olmalı (crosstab + chi2_contingency)"\nalan = d[d["donustu"] == 1]\nbek_s = round(float(stats.ttest_ind(alan[alan["grup"] == "A"]["sepet"], alan[alan["grup"] == "B"]["sepet"], equal_var=False).pvalue), 4)\nassert r["p_sepet"] == bek_s, "p_sepet: yalnız dönüşenlerin sepetinde Welch testi"\nassert r["karar"] == "B\'yi yay", "Anlamlı ve pozitif lift → B\'yi yay"\nassert kampanya_raporu(kur(300, 36, 300, 40, seed=6))["karar"] == "Yeterli kanıt yok", "Küçük örneklemde fark anlamlı değil"\nassert kampanya_raporu(kur(2000, 310, 2000, 240, seed=7))["karar"] == "A\'da kal", "Anlamlı negatif lift → A\'da kal"\n',
             hints=['Oranlar: groupby("grup")["donustu"].mean(). Çapraz tablo: pd.crosstab(df["grup"], df["donustu"]).', 'Sepet testi yalnızca donustu == 1 satırlarında; dönüşmeyenlerin 0 sepeti ortalamayı bozar.', 'Kararı önce anlamlılığa, sonra lift\'in işaretine göre ver.'],
             why='Gerçek bir deney raporu tek bir p-değeri değildir: oranlar, göreli etki, iki ayrı metriğin testi ve önceden tanımlanmış bir karar kuralı birlikte sunulur. Sepet testinde dönüşmeyenleri dışlamak, iki metriği birbirine karıştırmamak içindir.'),
    ],
    faq=[
        dict(q='α neden 0.05? Başka değer seçebilir miyim?', a='0.05 bir gelenektir, doğa yasası değil. Yanlış pozitifin maliyeti yüksekse (ör. kredi politikası değişikliği) 0.01, keşif amaçlı analizde 0.10 seçilebilir. Önemli olan α\'yı veriyi görmeden önce belirlemektir.'),
        dict(q='Verim normal dağılmıyor, t-testi kullanabilir miyim?', a='Merkezi limit teoremi sayesinde orta büyüklükte örneklemlerde (grup başı birkaç düzine ve üzeri) t-testi ortalamalar için sağlamdır. Çok küçük ve çok çarpık veride Mann-Whitney U (stats.mannwhitneyu), permütasyon testi ya da bootstrap tercih et.'),
        dict(q='scipy mi statsmodels mi?', a='scipy.stats tek tek testler ve dağılımlar için hızlı ve hafiftir. statsmodels ise modelleme odaklıdır: regresyon, özet tabloları, oran testleri, güç analizi, zaman serisi modelleri. Analistlerin çoğu ikisini birlikte kullanır.'),
        dict(q='Regresyonda katsayı anlamlıysa neden-sonuç ilişkisi var mı demektir?', a='Hayır. Gözlemsel veride regresyon ilişkiyi ölçer; dışarıda kalan ortak bir sebep (karıştırıcı değişken) katsayıyı yanıltabilir. Nedensellik için rastgele deney (A/B testi) ya da nedensel çıkarım yöntemleri gerekir.'),
    ],
    mistakes=[
        dict(bad='std = np.std(orneklem)  # örneklemden çıkarım', good='std = np.std(orneklem, ddof=1)', why='numpy varsayılanı nüfus formülüdür (n\'e böler); örneklemde std\'yi küçük tahmin eder.'),
        dict(bad='stats.ttest_ind(once, sonra)  # aynı kişiler', good='stats.ttest_rel(once, sonra)', why='Eşli ölçümlerde bağımsız test kişiler arası farkı gürültü sayar ve gerçek etkiyi gizler.'),
        dict(bad='tablo = [[alim_a, ziyaret_a], [alim_b, ziyaret_b]]', good='tablo = [[alim_a, ziyaret_a - alim_a], [alim_b, ziyaret_b - alim_b]]', why='Ki-kare tablosundaki hücreler birbirini dışlayan sayımlar olmalı; toplam bir hücre değildir.'),
        dict(bad='olasilik = stats.binom.sf(k, n, p)  # "en az k"', good='olasilik = stats.binom.sf(k - 1, n, p)', why='sf(k) "k\'dan fazla" demektir; "en az k" için k - 1 verilir.'),
        dict(bad='if p_degeri < 0.05:\n    print("Etki büyük, hemen yay")', good='if p_degeri < 0.05:\n    print(f"Anlamlı; lift={lift:.1f}%, GA={alt:.1%}…{ust:.1%}")', why='Anlamlılık etkinin büyüklüğünü söylemez; kararı etki büyüklüğü ve güven aralığıyla birlikte ver.'),
    ],
)
