/* PythonPatika — ileri: ml-giris */
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push({
  id: 'ml-giris',
  lv: 'ileri',
  mod: 'Makine Öğrenmesi',
  min: 55,
  needs: ['scikit-learn', 'numpy'],
  title: 'Makine öğrenmesine giriş',
  sum: 'Denetimli/denetimsiz öğrenme, özellik ve hedef, eğitim/test ayrımı, scikit-learn estimator API\'si (fit/predict/score), ilk modeller, aşırı/eksik öğrenme, veri sızıntısı, temel metrikler ve CRISP-DM akışı.',
  goals: [
    'Bir iş problemini denetimli (regresyon/sınıflandırma) ya da denetimsiz olarak sınıflandırıp X ve y\'yi doğru kurabilirim.',
    'train_test_split ile random_state ve stratify kullanarak tekrarlanabilir eğitim/test ayrımı yapabilirim.',
    'scikit-learn\'ün fit/predict/score/transform arayüzüyle LinearRegression, KNN ve karar ağacı eğitebilirim.',
    'MAE, RMSE, R² ve doğruluğu hesaplayıp bir taban çizgiyle karşılaştırabilirim.',
    'Aşırı/eksik öğrenmeyi eğitim-test skorlarından teşhis edip veri sızıntısı risklerini tanıyabilirim.'
  ],
  body: `
<h2>Kural yazmak yerine kuralı öğrenmek</h2>
<p>Anadolu Bank'ın kredi biriminde yıllardır şöyle kurallar yazılır: "Geliri 30 bin TL'nin altındaysa ve son bir yılda iki gecikmesi varsa reddet." Kurallar çoğaldıkça birbirine çarpar, yeni bir müşteri profili geldiğinde kimse hangi kuralı güncelleyeceğini bilemez. <b>Makine öğrenmesi</b> (machine learning, ML) bu işi tersine çevirir: kuralı sen yazmazsın, geçmiş örneklerden (geçmiş başvurular ve sonuçları) bir algoritma kuralı kendisi <b>öğrenir</b>. Sen veriyi hazırlar, doğru soruyu sorar ve öğrenilen modelin gerçekten işe yarayıp yaramadığını <b>ölçersin</b>.</p>
<p>Bu derste ML'in temel sözlüğünü, scikit-learn kütüphanesinin ortak arayüzünü, ilk üç modelini ve en önemlisi bir modeli <b>dürüstçe değerlendirmeyi</b> öğreneceksin. numpy dizilerini (<i>numpy</i> dersi) ve pandas DataFrame'lerini (<i>pandas-giris</i>) bildiğini varsayıyoruz; ortalama, varyans gibi kavramlar <i>istatistik</i> dersinden tanıdık gelecek.</p>

<h2>Öğrenme türleri</h2>
<div class="tbl-wrap"><table>
<tr><th>Tür</th><th>Veride ne var?</th><th>Soru</th><th>Örnek</th></tr>
<tr><td><b>Denetimli</b> (supervised) — regresyon</td><td>Özellikler + sayısal hedef</td><td>"Ne kadar?"</td><td>Sepet tutarı, teslim süresi, ev fiyatı</td></tr>
<tr><td><b>Denetimli</b> — sınıflandırma</td><td>Özellikler + kategorik hedef</td><td>"Hangisi?"</td><td>Kredi temerrüde düşer mi, e-posta spam mı</td></tr>
<tr><td><b>Denetimsiz</b> (unsupervised)</td><td>Yalnızca özellikler, hedef yok</td><td>"Nasıl gruplanıyor?"</td><td>Müşteri segmentleri, anormal işlemler</td></tr>
<tr><td><b>Pekiştirmeli</b> (reinforcement)</td><td>Ortam + ödül sinyali</td><td>"Hangi hamle?"</td><td>Depo robotu rotası, oyun oynayan ajan</td></tr>
</table></div>
<p>Bu dersten itibaren üç ders boyunca denetimli öğrenmeye odaklanacağız; kümeleme gibi denetimsiz yöntemleri <i>ml-kumeleme</i> dersinde göreceksin.</p>

<h2>Özellik, hedef ve X/y</h2>
<p>Bir tablo düşün: her <b>satır</b> bir örnek (sample; bir müşteri, bir sipariş), her <b>sütun</b> bir özellik (feature; yaş, gelir, sepet adedi). Tahmin etmek istediğin sütun ise <b>hedef</b> (target, label). scikit-learn geleneği: özellik matrisine büyük <code>X</code>, hedef vektörüne küçük <code>y</code> denir. <code>X</code> her zaman <b>iki boyutludur</b>: şekli <code>(örnek_sayısı, özellik_sayısı)</code>. Tek özelliğin olsa bile <code>(n, 1)</code> olmalı.</p>
<pre class="py">import numpy as np
from sklearn.datasets import load_iris, make_classification

iris = load_iris()                    # internet gerektirmez, kütüphaneyle gelir
X, y = iris.data, iris.target
print(X.shape, y.shape)               # 150 çiçek, 4 özellik
print(iris.feature_names)
print(list(iris.target_names), np.bincount(y))

# Sentetik veri: kontrollü deneyler için
Xs, ys = make_classification(n_samples=200, n_features=5, n_informative=3, random_state=42)
print(Xs.shape, np.bincount(ys))

metrekare = np.array([65, 90, 120, 150])
print(metrekare.shape, metrekare.reshape(-1, 1).shape)   # tek özellik: (n, 1)
</pre>
<div class="note"><b>Neden yerleşik veri setleri?</b><code>load_iris</code>, <code>load_diabetes</code>, <code>load_wine</code>, <code>load_breast_cancer</code> scikit-learn ile birlikte diske gelir; ağ istemez. <code>make_classification</code> ve <code>make_regression</code> ise istediğin boyutta sentetik veri üretir. <code>random_state</code> verdiğinde her çalıştırmada aynı veri çıkar; deneylerin tekrarlanabilir olur.</div>

<h2>Eğitim ve test: modelin sınav kâğıdı</h2>
<p>Bir öğrenciyi, çalıştığı soruların aynısıyla sınava sokarsan ezberlediği için tam not alır ama konuyu anlayıp anlamadığını öğrenemezsin. Modeller de böyledir. Bu yüzden veriyi en baştan ikiye ayırırız: <b>eğitim seti</b> (training set) ile model öğrenir, <b>test seti</b> (test set) ile hiç görmediği veride nasıl davrandığını ölçeriz. Test setine değerlendirme anına kadar <b>dokunulmaz</b>.</p>
<pre class="py">import numpy as np
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split

X, y = load_iris(return_X_y=True)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)
print(X_train.shape, X_test.shape)
print("eğitim sınıf dağılımı:", np.bincount(y_train))
print("test sınıf dağılımı:  ", np.bincount(y_test))
</pre>
<ul>
<li><code>test_size=0.2</code>: verinin %20'si teste ayrılır (yaygın aralık %20-30).</li>
<li><code>random_state=42</code>: karıştırma her seferinde aynı olur. Vermezsen her çalıştırmada farklı bölme ve farklı skor görürsün; hata ayıklamak imkânsızlaşır.</li>
<li><code>stratify=y</code>: sınıf oranları eğitim ve testte korunur. Sınıflandırmada, özellikle dengesiz sınıflarda (temerrüt oranı %5 gibi) neredeyse her zaman ver.</li>
</ul>
<div class="warn"><b>Zaman verisi karıştırılmaz</b>Satış tahmini gibi zamana bağlı problemlerde rastgele bölme, modele "gelecekten" bilgi sızdırır. Orada eğitim eski tarihler, test yeni tarihler olur (ör. Ocak-Eylül ile eğit, Ekim-Aralık ile test et). <i>pandas-zaman-serisi</i> dersindeki tarih süzmesi tam bunun için.</div>

<h2>scikit-learn'ün ortak dili: estimator API</h2>
<p>scikit-learn'ün en güzel yanı tutarlılığıdır: yüzlerce farklı algoritma <b>aynı metotlarla</b> kullanılır. Bir modeli öğrendiğinde hepsini öğrenmiş olursun.</p>
<div class="tbl-wrap"><table>
<tr><th>Metot</th><th>Ne yapar</th><th>Kimde var</th></tr>
<tr><td><code>fit(X, y)</code></td><td>Veriden öğrenir, nesnenin kendisini döndürür</td><td>Hepsi (denetimsizde yalnız <code>fit(X)</code>)</td></tr>
<tr><td><code>predict(X)</code></td><td>Yeni örnekler için tahmin üretir</td><td>Modeller (regresör, sınıflandırıcı)</td></tr>
<tr><td><code>score(X, y)</code></td><td>Varsayılan metrik: regresyonda R², sınıflandırmada doğruluk</td><td>Modeller</td></tr>
<tr><td><code>predict_proba(X)</code></td><td>Sınıf olasılıkları</td><td>Çoğu sınıflandırıcı</td></tr>
<tr><td><code>transform(X)</code> / <code>fit_transform</code></td><td>Veriyi dönüştürür (ölçekleme, kodlama)</td><td>Dönüştürücüler (transformer)</td></tr>
</table></div>
<p>Öğrenilen her şey alt çizgiyle biten özniteliklerde saklanır: <code>coef_</code>, <code>intercept_</code>, <code>classes_</code>, <code>feature_importances_</code>. Alt çizgi "bu değer fit sırasında hesaplandı" demektir; fit etmeden erişirsen <code>AttributeError</code> ya da <code>NotFittedError</code> alırsın. Hiperparametreler (kullanıcının seçtiği ayarlar: <code>n_neighbors</code>, <code>max_depth</code>) ise kurucuda verilir.</p>

<h2>İlk üç model</h2>
<h3>Doğrusal regresyon (LinearRegression)</h3>
<p>Hedefi özelliklerin ağırlıklı toplamı olarak modeller: <code>ŷ = b + w1·x1 + w2·x2 + ...</code>. Hızlı, yorumlanabilir, her regresyon projesinde ilk denenecek temel çizgidir (baseline).</p>
<pre class="py">import numpy as np
from sklearn.datasets import load_diabetes
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

X, y = load_diabetes(return_X_y=True)   # 442 hasta, 10 özellik, hedef: 1 yıl sonraki hastalık ilerlemesi
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = LinearRegression()
model.fit(X_train, y_train)
tahmin = model.predict(X_test)

print("MAE :", round(mean_absolute_error(y_test, tahmin), 1))
print("RMSE:", round(float(np.sqrt(mean_squared_error(y_test, tahmin))), 1))
print("R²  :", round(r2_score(y_test, tahmin), 3))
print("score() ile aynı mı:", round(model.score(X_test, y_test), 3))

taban = np.full_like(y_test, y_train.mean(), dtype=float)   # hep ortalamayı söyleyen model
print("Taban çizgi MAE:", round(mean_absolute_error(y_test, taban), 1))
</pre>
<h3>k-en yakın komşu (KNeighborsClassifier) ve karar ağacı (DecisionTreeClassifier)</h3>
<p>KNN yeni örneğe en yakın <code>k</code> eğitim örneğine bakar ve çoğunluğun sınıfını söyler; "öğrenme" aslında veriyi ezberlemektir. Karar ağacı ise veriyi "petal uzunluğu 2.45'ten küçük mü?" gibi evet/hayır sorularıyla dallara böler; kuralları insanın okuyabileceği biçimdedir.</p>
<pre class="py">from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.tree import DecisionTreeClassifier, export_text

X, y = load_iris(return_X_y=True)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42, stratify=y)

knn = KNeighborsClassifier(n_neighbors=5).fit(X_train, y_train)
agac = DecisionTreeClassifier(max_depth=2, random_state=0).fit(X_train, y_train)
print("KNN doğruluk  :", round(knn.score(X_test, y_test), 3))
print("Ağaç doğruluk :", round(agac.score(X_test, y_test), 3))
print("İlk 5 tahmin  :", agac.predict(X_test[:5]), "gerçek:", y_test[:5])
print(export_text(agac, feature_names=["sepal_l", "sepal_w", "petal_l", "petal_w"]))
</pre>

<h2>Metrikler: neyi ölçüyoruz?</h2>
<div class="tbl-wrap"><table>
<tr><th>Metrik</th><th>Problem</th><th>Yorum</th><th>Ne zaman</th></tr>
<tr><td><b>MAE</b> (ortalama mutlak hata)</td><td>Regresyon</td><td>Ortalama kaç birim yanılıyorum; hedefle aynı birim (TL, gün)</td><td>İş birimine anlatmak kolay</td></tr>
<tr><td><b>RMSE</b> (kök ortalama kare hata)</td><td>Regresyon</td><td>Büyük hataları daha çok cezalandırır</td><td>Büyük sapmalar pahalıysa</td></tr>
<tr><td><b>R²</b> (belirleme katsayısı)</td><td>Regresyon</td><td>1 mükemmel, 0 "hep ortalamayı söylemek" kadar, negatif daha kötü</td><td>Modeller arası karşılaştırma</td></tr>
<tr><td><b>Accuracy</b> (doğruluk)</td><td>Sınıflandırma</td><td>Doğru tahmin oranı</td><td>Sınıflar dengeliyse</td></tr>
</table></div>
<p>Bir metrik tek başına anlamsızdır; her zaman bir <b>taban çizgiyle</b> (baseline) karşılaştır. Regresyonda "hep eğitim ortalamasını söyle", sınıflandırmada "hep en sık sınıfı söyle" modelleri (<code>DummyRegressor</code>, <code>DummyClassifier</code>) en ucuz rakiptir. Temerrüt oranı %5 olan bir portföyde "kimse temerrüde düşmez" diyen model %95 doğruluk alır ve tamamen işe yaramaz. Dengesiz sınıflar için precision, recall ve ROC-AUC'yi bir sonraki derste göreceksin.</p>

<h2>Aşırı ve eksik öğrenme</h2>
<p><b>Eksik öğrenme</b> (underfitting): model veriyi yakalayamayacak kadar basittir; eğitimde de testte de kötüdür. <b>Aşırı öğrenme</b> (overfitting): model eğitim verisindeki gürültüyü bile ezberler; eğitimde parlak, testte sönüktür. Teşhis aracın, eğitim ve test skorlarını <b>yan yana</b> görmektir.</p>
<pre class="py">from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier

# flip_y=0.15: etiketlerin %15'i rastgele bozuk (gerçek hayattaki gürültü)
X, y = make_classification(n_samples=600, n_features=8, n_informative=4, flip_y=0.15, random_state=1)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, random_state=0, stratify=y)

print("derinlik  eğitim  test")
for derinlik in [1, 3, 5, 10, None]:
    m = DecisionTreeClassifier(max_depth=derinlik, random_state=0).fit(X_tr, y_tr)
    print(f"{str(derinlik):&gt;8}  {m.score(X_tr, y_tr):.3f}  {m.score(X_te, y_te):.3f}")
</pre>
<p>Derinlik 1'de iki skor da düşük: eksik öğrenme. Derinlik sınırsızken eğitim 1.000'e çıkar ama test düşer: model gürültüyü ezberledi. Tatlı nokta ikisinin arasındadır. Bu ayarı test setine bakarak seçersen test seti artık "görülmemiş" değildir; doğru yöntem (doğrulama seti ve çapraz doğrulama) <i>ml-pipeline-degerlendirme</i> dersinde.</p>

<h2>Veri sızıntısı: en pahalı hata</h2>
<p><b>Veri sızıntısı</b> (data leakage), modelin eğitim sırasında tahmin anında elinde olmayacak bir bilgiyi görmesidir. Sonuç: testte muhteşem, canlıda felaket. Tipik biçimleri:</p>
<ul>
<li><b>Hedeften türetilmiş özellik</b>: kredi temerrüdü tahmininde "tahsilat departmanına devredildi mi" sütunu. Bu bilgi ancak temerrütten <i>sonra</i> oluşur.</li>
<li><b>Test verisinin ön işlemeye karışması</b>: ölçekleyiciyi ya da ortalamayla eksik doldurmayı bölmeden önce tüm veriye fit etmek.</li>
<li><b>Zaman sızıntısı</b>: gelecekteki satırlarla eğitip geçmişi test etmek.</li>
<li><b>Tekrarlanan kayıtlar</b>: aynı müşterinin satırları hem eğitimde hem testte.</li>
</ul>
<div class="tip"><b>Sızıntı testi</b>Bir model "fazla iyi" görünüyorsa (sınıflandırmada %99, R² 0.99) önce sevinme, şüphelen. En önemli özelliklere bak ve her biri için "tahmin anında bu bilgi elimde olur mu?" diye sor.</div>

<h2>ML proje akışı: CRISP-DM</h2>
<p>Endüstride en yaygın süreç modeli CRISP-DM'dir (Cross-Industry Standard Process for Data Mining). Doğrusal değil, döngüseldir; değerlendirmede çıkan sonuç seni sık sık başa döndürür.</p>
<div class="steps-list"><ol>
<li><b>İş anlayışı</b>: Hangi karar iyileşecek? Başarı nasıl ölçülecek (ör. "temerrüt kayıplarını %10 azalt")?</li>
<li><b>Veri anlayışı</b>: Hangi veri var, kalitesi ne, hedef nasıl tanımlanıyor (90 gün gecikme = temerrüt)?</li>
<li><b>Veri hazırlama</b>: Temizleme, birleştirme, özellik üretme; zamanın çoğu buraya gider.</li>
<li><b>Modelleme</b>: Taban çizgi, sonra birkaç aday model.</li>
<li><b>Değerlendirme</b>: Test metrikleri ve iş metriği; sızıntı kontrolü, adalet ve açıklanabilirlik.</li>
<li><b>Yayına alma</b> (deployment): Modeli servis et, izle, performans düşerse yeniden eğit.</li>
</ol></div>

<div class="note"><b>Gerçek işte</b>Bir bankanın kredi modelinde ilk sorulan soru "doğruluğun kaç?" değil, "neyle karşılaştırdın ve hangi tarih aralığında test ettin?" olur. Model risk ekipleri tekrarlanabilirlik ister: aynı kod, aynı <code>random_state</code>, aynı veri sürümüyle aynı sayılar çıkmalıdır. Bu yüzden ilk günden bölme tohumlarını sabitlemek, taban çizgiyi raporlamak ve test setini en sona saklamak profesyonel alışkanlıktır.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Yanlılık-varyans dengesi</h3>
<p>Bir modelin hatası kabaca üç parçaya ayrılır: <b>yanlılık</b> (bias; modelin varsayımları gerçeği yakalayamıyor, eksik öğrenme), <b>varyans</b> (variance; model eğitim verisindeki küçük değişikliklere aşırı duyarlı, aşırı öğrenme) ve <b>indirgenemez gürültü</b>. Model karmaşıklığını artırmak yanlılığı düşürür ama varyansı artırır. KNN'de küçük <code>k</code>, ağaçta büyük <code>max_depth</code> varyansı artırır. Daha fazla veri toplamak varyansı azaltmanın en güvenilir yoludur.</p>
<h3>fit sonrası nesne ve zincirleme</h3>
<p><code>fit</code> nesnenin kendisini döndürdüğü için <code>KNeighborsClassifier(3).fit(X, y).predict(X_yeni)</code> yazılabilir. Aynı nesneyi farklı veriyle yeniden <code>fit</code> etmek önceki öğrenmeyi tamamen siler; iki ayrı model istiyorsan iki nesne oluştur ya da <code>sklearn.base.clone</code> kullan.</p>
<pre class="py">import numpy as np
from sklearn.base import clone
from sklearn.neighbors import KNeighborsClassifier

X = np.array([[1], [2], [3], [10], [11], [12]])
y = np.array([0, 0, 0, 1, 1, 1])
sablon = KNeighborsClassifier(n_neighbors=3)
m1 = clone(sablon).fit(X, y)
m2 = clone(sablon).fit(X[:4], y[:4])
print(m1.predict([[9]]), m2.predict([[9]]))
print(sablon.get_params()["n_neighbors"], hasattr(sablon, "classes_"))
</pre>
<h3>Tekrarlanabilirlik kontrol listesi</h3>
<p>Bölmede, sentetik veride ve rastgelelik içeren her modelde (<code>DecisionTreeClassifier</code>, <code>RandomForestClassifier</code>) <code>random_state</code> ver; kütüphane sürümlerini <code>requirements.txt</code> ile sabitle; veri kesim tarihini kaydet. Aynı sayıyı yarın yeniden üretemiyorsan modeli savunamazsın.</p>
</section>
`,
  ex: [
    { t: 'mc',
      stage: 'Isınma',
      q: 'Anadolu Market, satın alma geçmişine göre müşterilerini benzer davranış gruplarına ayırmak istiyor; elinde hazır bir "segment" etiketi yok. Bu hangi öğrenme türüdür?',
      o: ['Denetimli öğrenme: regresyon', 'Denetimsiz öğrenme: kümeleme', 'Denetimli öğrenme: sınıflandırma', 'Pekiştirmeli öğrenme'],
      a: 1,
      why: 'Hedef sütun (etiket) olmadığı için denetimsizdir; amaç benzer örnekleri gruplamak, yani kümelemedir. Sınıflandırma için önceden etiketlenmiş segmentler gerekirdi.' },
    { t: 'mc',
      stage: 'Isınma',
      q: 'Bir model eğitim setinde %99, test setinde %71 doğruluk alıyor. En olası açıklama nedir?',
      o: ['Eksik öğrenme: model veriyi yakalayamayacak kadar basit', 'Test seti eğitim setinden büyük seçildiği için', 'Aşırı öğrenme: eğitimdeki gürültüyü ezberledi', 'random_state verilmediği için skorlar oynuyor'],
      a: 2,
      why: 'Eğitim ile test arasındaki büyük fark aşırı öğrenmenin işaretidir. Eksik öğrenmede iki skor da düşük olur. random_state yalnızca tekrarlanabilirliği etkiler, bu boyutta bir farkı açıklamaz.' },
    { t: 'mc',
      stage: 'Isınma',
      q: 'Kredi temerrüt modelinde aşağıdaki özelliklerden hangisi <b>veri sızıntısına</b> yol açar?',
      o: ['Başvuru anında beyan edilen aylık net gelir', 'Son 12 ayda kredi kartı ödeme gecikme sayısı', 'Müşterinin bankadaki en eski hesabının yaşı', 'Kredinin tahsilata devredilip devredilmediği'],
      a: 3,
      why: 'Tahsilata devir ancak temerrütten sonra gerçekleşir; başvuru anında bu bilgi yoktur. Model bu sütunla testte çok iyi görünür ama canlıda kullanılamaz. Diğer üçü başvuru anında bilinir.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Bu kod ne yazdırır?',
      code: 'import numpy as np\nfrom sklearn.model_selection import train_test_split\n\nX = np.arange(40).reshape(20, 2)\ny = np.array([0, 1] * 10)\nX_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, random_state=0)\nprint(X_tr.shape, X_te.shape, len(y_te))\n',
      o: ['(15, 2) (5, 2) 5', '(20, 2) (5, 2) 5', '(16, 2) (4, 2) 4', '(30, 1) (10, 1) 10'],
      a: 0,
      why: '20 örneğin %25\'i (5) teste, kalan 15\'i eğitime gider. Sütun sayısı (2) değişmez; bölme yalnızca satırları ayırır. y_te de X_te ile aynı uzunluktadır.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'k=1 olan KNN ne tahmin eder?',
      code: 'from sklearn.neighbors import KNeighborsClassifier\n\nX = [[1, 1], [2, 1], [8, 9], [9, 8]]\ny = ["standart", "standart", "premium", "premium"]\nmodel = KNeighborsClassifier(n_neighbors=1).fit(X, y)\nprint(model.predict([[3, 2], [7, 7], [4, 3]]).tolist())\n',
      o: ['[\'standart\', \'premium\', \'standart\']', '[\'standart\', \'premium\', \'premium\']', '[\'premium\', \'standart\', \'standart\']', '[\'standart\', \'standart\', \'standart\']'],
      a: 0,
      why: 'k=1 olduğunda her nokta için en yakın tek eğitim örneğinin etiketi gelir. [3,2] ve [4,3] sol alttaki standart kümeye ([2,1]), [7,7] sağ üstteki premium kümeye ([8,9] ve [9,8]) yakındır. KNN önceden kural öğrenmez; her tahminde uzaklıkları yeniden hesaplar.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Doğrusal regresyon ne yazdırır?',
      code: 'import numpy as np\nfrom sklearn.linear_model import LinearRegression\n\nurun_adedi = np.array([[1], [2], [3], [4]])\nsepet_tl = np.array([70, 120, 170, 220])\nmodel = LinearRegression().fit(urun_adedi, sepet_tl)\nprint(round(model.coef_[0], 1), round(model.intercept_, 1))\nprint(round(model.predict([[10]])[0]))\n',
      o: ['50.0 20.0\n520', '20.0 50.0\n520', '50.0 20.0\n500', '50.0 0.0\n500'],
      a: 0,
      why: 'Veri tam bir doğru: her ek ürün 50 TL ekliyor (eğim, coef_) ve 0 ürün için 20 TL (kesişim, intercept_). 10 ürün için 20 + 50·10 = 520. Eğim ve kesişimi karıştırmak en sık yapılan okuma hatasıdır.' },
    { t: 'order',
      stage: 'Kodu oku',
      q: '<p>Iris verisiyle bir karar ağacı eğitip <b>test</b> doğruluğunu hesaplayan programın satırlarını sırala.</p>',
      lines: [
        'from sklearn.datasets import load_iris',
        'from sklearn.model_selection import train_test_split',
        'from sklearn.tree import DecisionTreeClassifier',
        'X, y = load_iris(return_X_y=True)',
        'X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, random_state=42, stratify=y)',
        'model = DecisionTreeClassifier(max_depth=3, random_state=0)',
        'model.fit(X_tr, y_tr)',
        'dogruluk = model.score(X_te, y_te)'
      ],
      tests: 'assert 0.85 <= dogruluk <= 1.0, "derinliği 3 olan ağaç iris testinde 0.85 üstü doğruluk almalı"\nassert len(y_te) == 45, "test seti 150 örneğin %30\'u: 45"\n',
      hint: 'Önce içe aktarmalar, sonra veri, bölme, model oluşturma, fit ve en son skor.',
      why: 'ML akışının iskeleti hep aynıdır: veri → bölme → model nesnesi → fit (yalnız eğitimle) → değerlendirme (yalnız testle). fit\'ten önce score çağırmak NotFittedError verir.' },
    { t: 'code',
      stage: 'Rehberli',
      id: 'ml-giris-1',
      diff: 1,
      q: '<p><code>veri_bol(X, y)</code> fonksiyonunu yaz: veriyi <b>%25 test</b> olacak, <code>random_state=7</code> ile tekrarlanabilir ve sınıf oranları korunacak (<code>stratify</code>) biçimde bölsün; <code>X_train, X_test, y_train, y_test</code> dörtlüsünü döndürsün.</p>',
      guide: ['train_test_split\'i sklearn.model_selection\'dan içe aktar.', 'test_size ve random_state parametrelerini ver.', 'Sınıf oranlarının korunması için stratify=y ekle.', 'Dört diziyi aynı sırayla döndür.'],
      example: 'import numpy as np\nfrom sklearn.model_selection import train_test_split\n\nmusteriler = np.arange(12).reshape(6, 2)\nsegment = np.array([0, 0, 0, 1, 1, 1])\na, b, c, d = train_test_split(musteriler, segment, test_size=0.5, random_state=1, stratify=segment)\nprint(np.bincount(c), np.bincount(d))\n',
      start: 'from sklearn.model_selection import train_test_split\n\n\ndef veri_bol(X, y):\n    # TODO: %25 test, random_state=7, stratify=y\n    return None\n',
      sol: 'from sklearn.model_selection import train_test_split\n\n\ndef veri_bol(X, y):\n    return train_test_split(X, y, test_size=0.25, random_state=7, stratify=y)\n',
      tests: 'import numpy as np\nfrom sklearn.datasets import make_classification\n_X, _y = make_classification(n_samples=200, weights=[0.8, 0.2], random_state=3)\n_r = veri_bol(_X, _y)\nassert _r is not None and len(_r) == 4, "dört parça (X_train, X_test, y_train, y_test) döndürmeli"\n_Xtr, _Xte, _ytr, _yte = _r\nassert _Xte.shape[0] == 50 and _Xtr.shape[0] == 150, "200 örneğin %25\'i (50) testte olmalı"\nassert abs(_yte.mean() - _y.mean()) < 0.011, "stratify=y ile testteki sınıf oranı genel orana eşit olmalı"\n_ref = train_test_split(_X, _y, test_size=0.25, random_state=7, stratify=_y)\nassert np.array_equal(_Xte, _ref[1]), "random_state=7 ile aynı bölme üretilmeli"\nassert np.array_equal(veri_bol(_X, _y)[1], _Xte), "iki çağrı aynı sonucu vermeli (tekrarlanabilirlik)"\n',
      hints: [
        'train_test_split(X, y, test_size=..., random_state=..., stratify=...)',
        'return train_test_split(X, y, test_size=0.25, random_state=7, stratify=y)'
      ],
      why: 'test_size oranı, random_state tekrarlanabilirliği, stratify sınıf dengesini garantiler. Dengesiz veride stratify vermezsen azınlık sınıfı testte tesadüfen çok az ya da çok fazla temsil edilebilir.' },
    { t: 'code',
      stage: 'Rehberli',
      id: 'ml-giris-2',
      diff: 1,
      q: '<p><code>regresyon_metrikleri(y_gercek, y_tahmin)</code> fonksiyonunu yaz: <code>{"mae": ..., "rmse": ..., "r2": ...}</code> sözlüğü döndürsün; her değer 3 basamağa yuvarlanmış <code>float</code> olsun. <code>sklearn.metrics</code> fonksiyonlarını kullan; RMSE için MSE\'nin karekökünü al.</p>',
      guide: [
        'mean_absolute_error, mean_squared_error, r2_score fonksiyonlarını içe aktar.',
        'RMSE = karekök(MSE): np.sqrt(mean_squared_error(...)).',
        'Her değeri float() ile çevirip round(..., 3) uygula.',
        'Sözlüğü döndür.'
      ],
      example: 'from sklearn.metrics import mean_absolute_error\n\ngercek_gun = [3, 5, 2]\ntahmin_gun = [4, 5, 1]\nprint(round(float(mean_absolute_error(gercek_gun, tahmin_gun)), 3))\n',
      start: 'import numpy as np\nfrom sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score\n\n\ndef regresyon_metrikleri(y_gercek, y_tahmin):\n    # TODO: mae, rmse, r2 hesapla (3 basamak)\n    return {}\n',
      sol: 'import numpy as np\nfrom sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score\n\n\ndef regresyon_metrikleri(y_gercek, y_tahmin):\n    mae = mean_absolute_error(y_gercek, y_tahmin)\n    rmse = np.sqrt(mean_squared_error(y_gercek, y_tahmin))\n    r2 = r2_score(y_gercek, y_tahmin)\n    return {"mae": round(float(mae), 3), "rmse": round(float(rmse), 3), "r2": round(float(r2), 3)}\n',
      tests: '_m = regresyon_metrikleri([100, 200, 300, 400], [110, 190, 330, 400])\nassert set(_m) == {"mae", "rmse", "r2"}, "anahtarlar mae, rmse, r2 olmalı"\nassert _m["mae"] == 12.5, f"MAE: (10+10+30+0)/4 = 12.5; gelen {_m[\'mae\']}"\nassert _m["rmse"] == 16.583, f"RMSE: kök((100+100+900+0)/4) = 16.583; gelen {_m[\'rmse\']}"\nassert _m["r2"] == 0.978, f"R²: 1 - 1100/50000 = 0.978; gelen {_m[\'r2\']}"\nassert all(type(v) is float for v in _m.values()), "değerler float olmalı"\n_p = regresyon_metrikleri([5, 5, 5], [5, 5, 5])\nassert _p["mae"] == 0.0 and _p["rmse"] == 0.0, "mükemmel tahminde hata 0"\n',
      hints: [
        'RMSE için hazır karekök: np.sqrt(mean_squared_error(y_gercek, y_tahmin)).',
        'round(float(deger), 3) ile hem tür hem basamak sorununu çöz.'
      ],
      why: 'MAE hatanın tipik boyutunu, RMSE büyük hatalara duyarlılığı, R² taban çizgiye göre açıklanan varyansı söyler. RMSE\'yi np.sqrt ile hesaplamak sklearn sürümlerinden bağımsızdır (squared=False parametresi yeni sürümlerde kaldırıldı).' },
    { t: 'code',
      stage: 'Rehberli',
      id: 'ml-giris-3',
      diff: 2,
      q: '<p><code>ilk_siniflandirici(X, y, k)</code> fonksiyonunu yaz: veriyi <code>test_size=0.3, random_state=42, stratify=y</code> ile böl, <code>KNeighborsClassifier(n_neighbors=k)</code> eğit; <code>(model, egitim_dogruluk, test_dogruluk)</code> döndür (doğruluklar 3 basamak).</p>',
      guide: [
        'Önce böl: train_test_split(... stratify=y).',
        'Modeli oluştur ve yalnızca eğitim verisiyle fit et.',
        'model.score ile eğitim ve test doğruluklarını ayrı ayrı hesapla.',
        'Üçlüyü döndür.'
      ],
      example: 'from sklearn.datasets import load_wine\nfrom sklearn.tree import DecisionTreeClassifier\n\nX, y = load_wine(return_X_y=True)\nm = DecisionTreeClassifier(max_depth=2, random_state=0).fit(X[:120], y[:120])\nprint(round(m.score(X[:120], y[:120]), 3), round(m.score(X[120:], y[120:]), 3))\n',
      start: 'from sklearn.model_selection import train_test_split\nfrom sklearn.neighbors import KNeighborsClassifier\n\n\ndef ilk_siniflandirici(X, y, k):\n    # TODO: böl\n    # TODO: modeli oluştur ve eğit\n    # TODO: eğitim ve test doğruluğu\n    return None, 0.0, 0.0\n',
      sol: 'from sklearn.model_selection import train_test_split\nfrom sklearn.neighbors import KNeighborsClassifier\n\n\ndef ilk_siniflandirici(X, y, k):\n    X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, random_state=42, stratify=y)\n    model = KNeighborsClassifier(n_neighbors=k).fit(X_tr, y_tr)\n    return model, round(model.score(X_tr, y_tr), 3), round(model.score(X_te, y_te), 3)\n',
      tests: 'from sklearn.datasets import load_iris\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.neighbors import KNeighborsClassifier\n_X, _y = load_iris(return_X_y=True)\n_m, _tr, _te = ilk_siniflandirici(_X, _y, 5)\nassert isinstance(_m, KNeighborsClassifier) and _m.n_neighbors == 5, "KNeighborsClassifier(n_neighbors=k) döndürülmeli"\nassert hasattr(_m, "classes_"), "model fit edilmiş olmalı"\n_a, _b, _c, _d = train_test_split(_X, _y, test_size=0.3, random_state=42, stratify=_y)\n_ref = KNeighborsClassifier(n_neighbors=5).fit(_a, _c)\nassert _tr == round(_ref.score(_a, _c), 3), "eğitim doğruluğu eğitim verisiyle hesaplanmalı"\nassert _te == round(_ref.score(_b, _d), 3), "test doğruluğu test verisiyle hesaplanmalı"\nassert ilk_siniflandirici(_X, _y, 1)[1] == 1.0, "k=1 eğitim verisini ezberler: eğitim doğruluğu 1.0"\n',
      hints: [
        'X_tr, X_te, y_tr, y_te = train_test_split(...)',
        'model.score(X_tr, y_tr) ve model.score(X_te, y_te); round(..., 3).'
      ],
      why: 'Eğitim ve test skorunu birlikte döndürmek teşhis için şarttır. k=1 her eğitim noktasının en yakın komşusu kendisi olduğu için eğitimde %100 verir; bu aşırı öğrenmenin en saf örneğidir.' },
    { t: 'code',
      stage: 'Kendin yaz',
      id: 'ml-giris-4',
      diff: 1,
      q: '<p><code>cogunluk_taban(y_train, y_test)</code> fonksiyonu yaz: eğitim setinde <b>en sık görülen sınıfı</b> bulsun ve her test örneği için o sınıfı tahmin eden "aptal" modelin test doğruluğunu 3 basamakla döndürsün. Eşit frekansta küçük etiket seçilsin. (İstersen <code>DummyClassifier(strategy="most_frequent")</code> da kullanabilirsin.)</p>',
      start: 'def cogunluk_taban(y_train, y_test):\n    pass\n',
      sol: 'from collections import Counter\n\n\ndef cogunluk_taban(y_train, y_test):\n    sayim = Counter(y_train)\n    en_sik = min(sayim, key=lambda s: (-sayim[s], s))\n    dogru = sum(1 for g in y_test if g == en_sik)\n    return round(dogru / len(y_test), 3)\n',
      tests: 'assert cogunluk_taban([0, 0, 0, 1], [0, 1, 0, 0]) == 0.75, "en sık sınıf 0; testte 4\'ün 3\'ü 0: 0.75"\nassert cogunluk_taban([0] * 95 + [1] * 5, [0] * 19 + [1]) == 0.95, "dengesiz veride aptal model bile 0.95 alır"\nassert cogunluk_taban([1, 1, 0, 0], [1, 1, 1]) == 0.0, "eşitlikte küçük etiket (0) seçilir; testte hiç 0 yok"\nassert cogunluk_taban(["red", "onay", "onay"], ["onay", "red"]) == 0.5, "metin etiketlerde de çalışmalı"\n',
      hints: [
        'collections.Counter ile sınıf sayıları; en sık olanı seç.',
        'Eşitlikte küçük etiket: min(sayim, key=lambda s: (-sayim[s], s)).'
      ],
      why: 'Taban çizgi, modelinin gerçekten bir şey öğrenip öğrenmediğinin ölçüsüdür. %95 doğruluk, %95\'lik çoğunluk sınıfı olan veride hiçbir şey ifade etmez.' },
    { t: 'code',
      stage: 'Kendin yaz',
      id: 'ml-giris-5',
      diff: 1,
      q: '<p><code>ogrenme_teshisi(egitim, test)</code> fonksiyonu yaz (skorlar 0-1 arası doğruluk). Kurallar sırayla: eğitim − test farkı <b>0.10\'dan büyükse</b> <code>"aşırı öğrenme"</code>; değilse ve <b>iki skor da 0.70\'in altındaysa</b> <code>"eksik öğrenme"</code>; aksi hâlde <code>"dengeli"</code>. Sınır değerlerde kayan nokta hatasına dikkat et: <code>0.80 - 0.70</code> tam 0.1 değildir.</p>',
      start: 'def ogrenme_teshisi(egitim, test):\n    pass\n',
      sol: 'def ogrenme_teshisi(egitim, test):\n    if round(egitim - test, 6) > 0.10:\n        return "aşırı öğrenme"\n    if egitim < 0.70 and test < 0.70:\n        return "eksik öğrenme"\n    return "dengeli"\n',
      tests: 'assert ogrenme_teshisi(0.99, 0.71) == "aşırı öğrenme", "0.28 fark aşırı öğrenme"\nassert ogrenme_teshisi(0.62, 0.60) == "eksik öğrenme", "ikisi de düşük: eksik öğrenme"\nassert ogrenme_teshisi(0.88, 0.85) == "dengeli", "yakın ve yüksek: dengeli"\nassert ogrenme_teshisi(0.60, 0.45) == "aşırı öğrenme", "fark kuralı önce kontrol edilir"\nassert ogrenme_teshisi(0.80, 0.70) == "dengeli", "tam 0.10 fark aşırı sayılmaz (büyükse kuralı)"\n',
      hints: [
        'Kuralları verilen sırayla if ile yaz; ilk eşleşen döner.',
        'Kayan nokta: 0.80 - 0.70 değeri 0.10000000000000009 olabilir; gerekirse round(egitim - test, 6) > 0.10 kullan.'
      ],
      why: 'Teşhis kuralları sezgiyi koda döker. Sıra önemlidir: büyük fark varsa skorlar düşük olsa bile asıl sorun varyanstır. Kayan nokta karşılaştırmalarında sınır değerler için yuvarlama güvenlidir.' },
    { t: 'code',
      stage: 'Kendin yaz',
      id: 'ml-giris-6',
      diff: 2,
      q: '<p><code>derinlik_tara(X_tr, y_tr, X_te, y_te, derinlikler)</code> fonksiyonu yaz: her derinlik için <code>DecisionTreeClassifier(max_depth=d, random_state=0)</code> eğitsin ve <code>{d: (egitim_dogruluk, test_dogruluk)}</code> sözlüğü döndürsün (3 basamak). Ayrıca en yüksek <b>test</b> doğruluğunu veren derinliği de döndür: <code>return sonuc, en_iyi</code>. Eşitlikte listede önce gelen (daha basit) derinlik seçilsin.</p>',
      start: 'from sklearn.tree import DecisionTreeClassifier\n\n\ndef derinlik_tara(X_tr, y_tr, X_te, y_te, derinlikler):\n    pass\n',
      sol: 'from sklearn.tree import DecisionTreeClassifier\n\n\ndef derinlik_tara(X_tr, y_tr, X_te, y_te, derinlikler):\n    sonuc = {}\n    en_iyi = None\n    for d in derinlikler:\n        m = DecisionTreeClassifier(max_depth=d, random_state=0).fit(X_tr, y_tr)\n        sonuc[d] = (round(m.score(X_tr, y_tr), 3), round(m.score(X_te, y_te), 3))\n        if en_iyi is None or sonuc[d][1] > sonuc[en_iyi][1]:\n            en_iyi = d\n    return sonuc, en_iyi\n',
      tests: 'from sklearn.datasets import make_classification\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.tree import DecisionTreeClassifier\n_X, _y = make_classification(n_samples=400, n_features=8, n_informative=4, flip_y=0.15, random_state=1)\n_a, _b, _c, _d = train_test_split(_X, _y, test_size=0.3, random_state=0, stratify=_y)\n_s, _e = derinlik_tara(_a, _c, _b, _d, [1, 3, None])\nassert set(_s) == {1, 3, None}, "her derinlik anahtar olmalı (None dahil)"\nfor _k in [1, 3, None]:\n    _m = DecisionTreeClassifier(max_depth=_k, random_state=0).fit(_a, _c)\n    assert _s[_k] == (round(_m.score(_a, _c), 3), round(_m.score(_b, _d), 3)), f"derinlik {_k} için skorlar yanlış"\nassert _s[None][0] == 1.0, "sınırsız ağaç eğitim verisini ezberler"\n_best = max([1, 3, None], key=lambda k: (_s[k][1], -[1, 3, None].index(k)))\nassert _e == _best, f"en iyi test skoru veren derinlik {_best} olmalı; gelen {_e}"\n_s2, _e2 = derinlik_tara(_a, _c, _b, _d, [3, 3])\nassert _e2 == 3, "tekrarlı listede de çalışmalı"\n',
      hints: [
        'Döngüde her derinlik için yeni ağaç oluştur, fit et, iki skoru sözlüğe yaz.',
        'En iyiyi takip ederken yalnızca daha büyük (>) skorla güncelle; böylece eşitlikte ilk gelen kalır.'
      ],
      why: 'Hiperparametre taraması ML\'in günlük işidir. Bu örnekte en iyiyi test setine bakarak seçtik; gerçek projede bunun için ayrı bir doğrulama seti ya da çapraz doğrulama kullanılır, yoksa test skoru iyimser olur.' },
    { t: 'code',
      stage: 'Kendin yaz',
      id: 'ml-giris-7',
      diff: 2,
      q: '<p>Anadolu Market lojistik ekibi teslim süresini mesafeden tahmin etmek istiyor. <code>teslim_modeli(mesafe_km, sure_saat)</code> fonksiyonu yaz: iki Python listesi alsın, <code>LinearRegression</code> eğitsin ve <code>(egim, kesisim)</code> demetini 2 basamakla döndürsün. Ayrıca aynı modülde <code>tahmin_et(model_bilgisi, km)</code> yaz: <code>egim * km + kesisim</code> değerini 1 basamakla döndürsün.</p>',
      start: 'import numpy as np\nfrom sklearn.linear_model import LinearRegression\n\n\ndef teslim_modeli(mesafe_km, sure_saat):\n    pass\n\n\ndef tahmin_et(model_bilgisi, km):\n    pass\n',
      sol: 'import numpy as np\nfrom sklearn.linear_model import LinearRegression\n\n\ndef teslim_modeli(mesafe_km, sure_saat):\n    X = np.array(mesafe_km, dtype=float).reshape(-1, 1)\n    model = LinearRegression().fit(X, sure_saat)\n    return round(float(model.coef_[0]), 2), round(float(model.intercept_), 2)\n\n\ndef tahmin_et(model_bilgisi, km):\n    egim, kesisim = model_bilgisi\n    return round(egim * km + kesisim, 1)\n',
      tests: '_b = teslim_modeli([10, 50, 100, 200, 400], [2.0, 4.0, 6.5, 12.0, 22.0])\nassert isinstance(_b, tuple) and len(_b) == 2, "(egim, kesisim) demeti döndürmeli"\nassert abs(_b[0] - 0.05) < 0.005, f"eğim yaklaşık 0.05 saat/km olmalı; gelen {_b[0]}"\nassert abs(_b[1] - 1.47) < 0.02, f"kesişim yaklaşık 1.47 saat olmalı; gelen {_b[1]}"\nassert tahmin_et((0.05, 1.5), 300) == 16.5, "0.05*300 + 1.5 = 16.5"\nassert teslim_modeli([1, 2, 3], [5, 7, 9]) == (2.0, 3.0), "tam doğruda eğim 2, kesişim 3"\n',
      hints: [
        'Tek özellik iki boyutlu olmalı: np.array(mesafe_km).reshape(-1, 1).',
        'model.coef_[0] eğim, model.intercept_ kesişim; float() ve round(..., 2).'
      ],
      why: 'scikit-learn X\'i her zaman (n, özellik) matrisi olarak bekler; tek sütunu reshape(-1, 1) ile matrise çevirirsin. Eğim "her ek km kaç saat ekler" sorusunun, kesişim sabit hazırlık süresinin cevabıdır.' },
    { t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      id: 'ml-giris-8',
      diff: 2,
      q: '<p>Stajyer, ağaç modelinin "test başarısını" raporlayan fonksiyonu yazdı ve her seferinde 1.0 çıktığı için çok sevindi. <b>Hatayı bul ve düzelt.</b> Fonksiyon gerçekten görülmemiş verideki doğruluğu döndürmeli.</p>',
      start: 'from sklearn.model_selection import train_test_split\nfrom sklearn.tree import DecisionTreeClassifier\n\n\ndef test_basarisi(X, y):\n    X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, random_state=0, stratify=y)\n    model = DecisionTreeClassifier(random_state=0).fit(X_tr, y_tr)\n    return round(model.score(X_tr, y_tr), 3)\n',
      sol: 'from sklearn.model_selection import train_test_split\nfrom sklearn.tree import DecisionTreeClassifier\n\n\ndef test_basarisi(X, y):\n    X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, random_state=0, stratify=y)\n    model = DecisionTreeClassifier(random_state=0).fit(X_tr, y_tr)\n    return round(model.score(X_te, y_te), 3)\n',
      tests: 'from sklearn.datasets import make_classification\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.tree import DecisionTreeClassifier\n_X, _y = make_classification(n_samples=300, flip_y=0.2, random_state=5)\n_a, _b, _c, _d = train_test_split(_X, _y, test_size=0.3, random_state=0, stratify=_y)\n_ref = round(DecisionTreeClassifier(random_state=0).fit(_a, _c).score(_b, _d), 3)\n_r = test_basarisi(_X, _y)\nassert _r != 1.0, "1.0 eğitim skorudur: sınırsız ağaç eğitim verisini ezberler"\nassert _r == _ref, f"test verisindeki doğruluk {_ref} olmalı; gelen {_r}"\n',
      hints: ['score hangi veriyle çağrılıyor?', 'model.score(X_te, y_te) olmalı.'],
      why: 'Modeli eğittiği veriyle değerlendirmek ezberi ölçer, genellemeyi değil. Sınırsız derinlikteki ağaç eğitimde neredeyse her zaman 1.0 alır; bu sayı hiçbir şey söylemez.' },
    { t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      id: 'ml-giris-9',
      diff: 1,
      q: '<p><code>fiyat_tahmin(metrekare, fiyat, yeni_metrekareler)</code> konut fiyatı tahmini yapmalı ama <i>ValueError: Expected 2D array, got 1D array instead</i> hatası veriyor. <b>Hatayı bul ve düzelt.</b> Fonksiyon tahminleri 0 basamağa yuvarlanmış Python listesi olarak döndürmeli.</p>',
      start: 'import numpy as np\nfrom sklearn.linear_model import LinearRegression\n\n\ndef fiyat_tahmin(metrekare, fiyat, yeni_metrekareler):\n    X = np.array(metrekare)\n    model = LinearRegression().fit(X, fiyat)\n    tahmin = model.predict(np.array(yeni_metrekareler))\n    return [round(float(t)) for t in tahmin]\n\n\nprint(fiyat_tahmin([50, 80, 100, 120], [1.5e6, 2.4e6, 3.0e6, 3.6e6], [90, 150]))\n',
      sol: 'import numpy as np\nfrom sklearn.linear_model import LinearRegression\n\n\ndef fiyat_tahmin(metrekare, fiyat, yeni_metrekareler):\n    X = np.array(metrekare).reshape(-1, 1)\n    model = LinearRegression().fit(X, fiyat)\n    tahmin = model.predict(np.array(yeni_metrekareler).reshape(-1, 1))\n    return [round(float(t)) for t in tahmin]\n\n\nprint(fiyat_tahmin([50, 80, 100, 120], [1.5e6, 2.4e6, 3.0e6, 3.6e6], [90, 150]))\n',
      tests: '_r = fiyat_tahmin([50, 80, 100, 120], [1.5e6, 2.4e6, 3.0e6, 3.6e6], [90, 150])\nassert _r == [2700000, 4500000], f"m² başına 30 bin TL: [2700000, 4500000] bekleniyordu; gelen {_r}"\nassert fiyat_tahmin([1, 2], [10, 20], [3]) == [30], "tek tahminde de liste dönmeli"\n',
      hints: ['Hem fit hem predict iki boyutlu X ister.', 'Her iki diziye de .reshape(-1, 1) ekle.'],
      why: 'scikit-learn tek boyutlu diziyi "tek örnek mi, tek özellik mi?" diye yorumlayamaz. reshape(-1, 1) "n örnek, 1 özellik" demektir. Tahmin girdisi de eğitimle aynı şekilde olmalı.' },
    { t: 'code',
      stage: 'Meydan okuma',
      id: 'ml-giris-10',
      diff: 3,
      q: '<p>Test setine bakarak hiperparametre seçmek onu "kirletir". <code>k_sec(X, y, k_listesi)</code> fonksiyonunu dürüst biçimde yaz:</p><ol><li>Veriyi önce <code>test_size=0.2, random_state=0, stratify=y</code> ile <b>geçici</b> ve <b>test</b> olarak böl.</li><li>Geçici kısmı yeniden <code>test_size=0.25, random_state=0, stratify=...</code> ile <b>eğitim</b> ve <b>doğrulama</b> (validation) olarak böl.</li><li>Her <code>k</code> için KNN\'i eğitimde eğit, doğrulamada ölç; en iyi <code>k</code>\'yı seç (eşitlikte küçük k).</li><li>Seçilen k ile modeli <b>geçici setin tamamında</b> yeniden eğit ve test doğruluğunu ölç.</li></ol><p><code>(en_iyi_k, dogrulama_skoru, test_skoru)</code> döndür (skorlar 3 basamak). Boş <code>k_listesi</code> için <code>ValueError</code>.</p>',
      start: 'from sklearn.model_selection import train_test_split\nfrom sklearn.neighbors import KNeighborsClassifier\n\n\ndef k_sec(X, y, k_listesi):\n    pass\n',
      sol: 'from sklearn.model_selection import train_test_split\nfrom sklearn.neighbors import KNeighborsClassifier\n\n\ndef k_sec(X, y, k_listesi):\n    if not k_listesi:\n        raise ValueError("k_listesi boş olamaz")\n    X_gec, X_te, y_gec, y_te = train_test_split(X, y, test_size=0.2, random_state=0, stratify=y)\n    X_tr, X_va, y_tr, y_va = train_test_split(X_gec, y_gec, test_size=0.25, random_state=0, stratify=y_gec)\n    en_iyi_k, en_iyi_skor = None, -1.0\n    for k in sorted(k_listesi):\n        skor = KNeighborsClassifier(n_neighbors=k).fit(X_tr, y_tr).score(X_va, y_va)\n        if skor > en_iyi_skor:\n            en_iyi_k, en_iyi_skor = k, skor\n    son = KNeighborsClassifier(n_neighbors=en_iyi_k).fit(X_gec, y_gec)\n    return en_iyi_k, round(en_iyi_skor, 3), round(son.score(X_te, y_te), 3)\n',
      tests: 'from sklearn.datasets import make_classification\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.neighbors import KNeighborsClassifier\n_X, _y = make_classification(n_samples=400, n_features=6, n_informative=4, flip_y=0.1, random_state=7)\n_g, _t, _gy, _ty = train_test_split(_X, _y, test_size=0.2, random_state=0, stratify=_y)\n_a, _v, _ay, _vy = train_test_split(_g, _gy, test_size=0.25, random_state=0, stratify=_gy)\n_ks = [15, 1, 7, 3]\n_sk = {k: KNeighborsClassifier(n_neighbors=k).fit(_a, _ay).score(_v, _vy) for k in _ks}\n_bk = min(_ks, key=lambda k: (-_sk[k], k))\n_r = k_sec(_X, _y, _ks)\nassert _r[0] == _bk, f"doğrulama setinde en iyi k {_bk} olmalı (eşitlikte küçük); gelen {_r[0]}"\nassert _r[1] == round(_sk[_bk], 3), "ikinci değer seçilen k\'nın doğrulama skoru olmalı"\n_son = KNeighborsClassifier(n_neighbors=_bk).fit(_g, _gy).score(_t, _ty)\nassert _r[2] == round(_son, 3), "son model geçici setin TAMAMINDA (eğitim+doğrulama) eğitilip testte ölçülmeli"\ntry:\n    k_sec(_X, _y, [])\n    assert False, "boş liste ValueError vermeli"\nexcept ValueError:\n    pass\n',
      hints: [
        'İki aşamalı bölme: önce test ayrılır, sonra kalan eğitim/doğrulamaya bölünür (ikinci bölmede stratify=y_gec).',
        'Eşitlikte küçük k için listeyi sıralayıp yalnızca kesin büyük (>) skorda güncelle.',
        'Son model: KNeighborsClassifier(n_neighbors=en_iyi_k).fit(X_gec, y_gec).score(X_te, y_te)'
      ],
      why: 'Üç parçalı bölme (eğitim/doğrulama/test) model seçimini test setinden ayırır; böylece raporlanan test skoru gerçekten görülmemiş veriyi temsil eder. Seçimden sonra eğitim+doğrulama ile yeniden eğitmek eldeki tüm etiketli veriden yararlanır.' },
    { t: 'code',
      stage: 'Mini proje',
      id: 'ml-giris-11',
      diff: 3,
      q: '<p>Sağlık ekibi için <code>diyabet_raporu()</code> fonksiyonu yaz (parametresiz). <code>load_diabetes</code> verisini <code>test_size=0.2, random_state=42</code> ile böl ve şu sözlüğü döndür (değerler 2 basamak):</p><ul><li><code>"taban_mae"</code>: her test örneği için <b>eğitim</b> hedef ortalamasını tahmin eden modelin MAE\'si</li><li><code>"model_mae"</code>: <code>LinearRegression</code> modelinin test MAE\'si</li><li><code>"model_r2"</code>: aynı modelin test R²\'si</li><li><code>"iyilesme_yuzde"</code>: (taban_mae − model_mae) / taban_mae × 100</li><li><code>"en_etkili"</code>: mutlak katsayısı en büyük özelliğin adı (<code>load_diabetes().feature_names</code>)</li></ul>',
      start: 'import numpy as np\nfrom sklearn.datasets import load_diabetes\nfrom sklearn.linear_model import LinearRegression\nfrom sklearn.metrics import mean_absolute_error, r2_score\nfrom sklearn.model_selection import train_test_split\n\n\ndef diyabet_raporu():\n    pass\n',
      sol: 'import numpy as np\nfrom sklearn.datasets import load_diabetes\nfrom sklearn.linear_model import LinearRegression\nfrom sklearn.metrics import mean_absolute_error, r2_score\nfrom sklearn.model_selection import train_test_split\n\n\ndef diyabet_raporu():\n    veri = load_diabetes()\n    X_tr, X_te, y_tr, y_te = train_test_split(veri.data, veri.target, test_size=0.2, random_state=42)\n    taban = np.full(len(y_te), y_tr.mean())\n    taban_mae = mean_absolute_error(y_te, taban)\n    model = LinearRegression().fit(X_tr, y_tr)\n    tahmin = model.predict(X_te)\n    model_mae = mean_absolute_error(y_te, tahmin)\n    en_etkili = veri.feature_names[int(np.argmax(np.abs(model.coef_)))]\n    return {\n        "taban_mae": round(float(taban_mae), 2),\n        "model_mae": round(float(model_mae), 2),\n        "model_r2": round(float(r2_score(y_te, tahmin)), 2),\n        "iyilesme_yuzde": round(float((taban_mae - model_mae) / taban_mae * 100), 2),\n        "en_etkili": en_etkili,\n    }\n',
      tests: '_r = diyabet_raporu()\nassert set(_r) == {"taban_mae", "model_mae", "model_r2", "iyilesme_yuzde", "en_etkili"}, "beş anahtar olmalı"\nassert abs(_r["taban_mae"] - 64.01) < 0.02, f"taban MAE eğitim ortalamasıyla ~64.01 olmalı; gelen {_r[\'taban_mae\']}"\nassert abs(_r["model_mae"] - 42.79) < 0.02, f"model MAE ~42.79 olmalı; gelen {_r[\'model_mae\']}"\nassert abs(_r["model_r2"] - 0.45) < 0.011, "R² ~0.45"\nassert abs(_r["iyilesme_yuzde"] - 33.14) < 0.1, f"iyileşme ~%33.1 olmalı; gelen {_r[\'iyilesme_yuzde\']}"\nassert _r["en_etkili"] == "s1", f"mutlak katsayısı en büyük özellik s1 olmalı; gelen {_r[\'en_etkili\']}"\n',
      hints: [
        'Taban: np.full(len(y_te), y_tr.mean()); ortalamayı TEST verisinden değil eğitimden al.',
        'En etkili özellik: np.argmax(np.abs(model.coef_)) indeksini feature_names\'te kullan.',
        'İyileşme yüzdesini yuvarlamadan önceki MAE değerleriyle hesapla.'
      ],
      why: 'Bir model raporu taban çizgi olmadan eksiktir: "MAE 42.8" tek başına bir şey söylemez, "ortalamayı söylemeye göre %33 daha az hata" söyler. Taban ortalamanın eğitimden alınması da küçük ama gerçek bir sızıntı önlemidir. Katsayı büyüklüğü yalnızca özellikler aynı ölçekteyse karşılaştırılabilir (diabetes verisi önceden ölçeklenmiştir).' }
  ],
  faq: [
    { q: 'Ne kadar veri gerekir?',
      a: 'Tek bir sayı yok; problemin zorluğuna, özellik sayısına ve gürültüye bağlı. Pratik yol: öğrenme eğrisi çizmek (veri arttıkça test skoru hâlâ yükseliyorsa daha fazla veri işe yarar). Bunu ml-pipeline-degerlendirme dersinde göreceksin.' },
    { q: 'random_state için neden hep 42 yazılıyor?',
      a: 'Bir gelenek (Otostopçunun Galaksi Rehberi esprisi). Hangi sayı olduğu önemli değil; önemli olan sabit olması. Raporladığın sonuçların tohuma aşırı duyarlı olmadığını görmek için birkaç farklı tohumla denemek de iyi bir alışkanlıktır.' },
    { q: 'Doğruluk %80 iyi mi kötü mü?',
      a: 'Taban çizgiye ve işe bağlı. Sınıfların %80\'i tek sınıfsa %80 hiçbir şey öğrenmemek demektir; dengeli üç sınıflı bir problemde ise güçlü bir sonuç olabilir. Her zaman DummyClassifier/DummyRegressor ile karşılaştır.' },
    { q: 'Test setini kaç kez kullanabilirim?',
      a: 'İdealde bir kez, en sonda. Her bakıp modeli değiştirdiğinde test setinden bilgi sızar ve skor iyimserleşir. Model seçimi için doğrulama seti ya da çapraz doğrulama kullan.' },
    { q: 'Derin öğrenme bunun neresinde?',
      a: 'Derin öğrenme (sinir ağları) denetimli öğrenmenin güçlü bir model ailesidir; görüntü, ses ve metin gibi yapısız verilerde öne çıkar. Tablo verisinde ise ağaç tabanlı modeller (gradient boosting) çoğu zaman eşit ya da daha iyi sonuç verir. Değerlendirme ilkeleri (bölme, sızıntı, taban çizgi) birebir aynıdır.' }
  ],
  mistakes: [
    { bad: 'model.fit(X_train, y_train)\nprint(model.score(X_train, y_train))  # "test başarısı"',
      good: 'model.fit(X_train, y_train)\nprint(model.score(X_test, y_test))',
      why: 'Eğitim verisindeki skor ezberi ölçer; genelleme için görülmemiş test verisi gerekir.' },
    { bad: 'X = df["metrekare"]\nmodel.fit(X, y)',
      good: 'X = df[["metrekare"]]\nmodel.fit(X, y)',
      why: 'scikit-learn iki boyutlu X bekler; tek köşeli parantez Series (1B), çift köşeli DataFrame (2B) verir.' },
    { bad: 'train_test_split(X, y, test_size=0.2)',
      good: 'train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)',
      why: 'random_state olmadan her çalıştırmada farklı sonuç çıkar; sınıflandırmada stratify sınıf oranlarını korur.' },
    { bad: 'taban = np.full(len(y_test), y_test.mean())',
      good: 'taban = np.full(len(y_test), y_train.mean())',
      why: 'Taban çizgi bile test bilgisini kullanmamalı; tahmin anında test hedeflerinin ortalamasını bilemezsin.' },
    { bad: 'for k in [1, 3, 5, 7]:\n    skor = KNeighborsClassifier(k).fit(X_tr, y_tr).score(X_te, y_te)\n# en iyi test skorunu raporla',
      good: '# k\'yı doğrulama setinde seç, test setinde yalnızca bir kez ölç',
      why: 'Test setiyle hiperparametre seçmek test skorunu iyimser yapar; seçim doğrulama setinde ya da çapraz doğrulamada yapılır.' }
  ]
});
})(window);
