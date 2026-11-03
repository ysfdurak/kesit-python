/* Kesit Python — ileri: ml-regresyon-siniflandirma */
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push({
  id: 'ml-regresyon-siniflandirma',
  lv: 'ileri',
  mod: 'Makine Öğrenmesi',
  min: 60,
  needs: ['scikit-learn', 'numpy'],
  title: 'Regresyon ve sınıflandırma modelleri',
  sum: 'Çoklu regresyon ve katsayı yorumu, Ridge/Lasso, lojistik regresyon ve predict_proba, karar ağacı, rastgele orman, gradient boosting; karışıklık matrisi, precision/recall/F1, ROC-AUC, dengesiz sınıflar ve maliyete dayalı eşik seçimi.',
  goals: [
    'Çoklu doğrusal regresyon kurup katsayıları iş diliyle yorumlayabilir, Ridge ve Lasso ile düzenlileştirebilirim.',
    'Lojistik regresyonla olasılık üretip predict_proba sütunlarını ve eşiği doğru kullanabilirim.',
    'Karar ağacı, rastgele orman ve HistGradientBoosting modellerini eğitip özellik önemini okuyabilirim.',
    'Karışıklık matrisi, precision, recall, F1 ve ROC-AUC ile sınıflandırıcıyı değerlendirebilirim.',
    'Dengesiz sınıflarda class_weight kullanıp eşiği iş maliyetine göre seçebilirim.'
  ],
  body: `
<h2>İki iş sorusu, iki problem türü</h2>
<p><i>ml-giris</i> dersinde ML'in iskeletini kurdun: bölme, fit, predict, metrik. Şimdi iki gerçekçi soruyu derinlemesine çözeceğiz. <b>Anadolu Market</b> "bir müşterinin sepet tutarı ne olacak?" diye soruyor; bu bir <b>regresyon</b> (sayısal hedef). <b>Ilgaz Bank</b> ise "bu kredi başvurusu temerrüde düşer mi?" diye soruyor; bu bir <b>sınıflandırma</b> (kategorik hedef). İkisinde de model kurmak işin yarısıdır; diğer yarısı modelin <b>ne söylediğini yorumlamak</b> ve iş kararına (kampanya bütçesi, kredi onayı) çevirmektir.</p>
<p>Örnek veriler kurgusaldır ve <code>numpy.random.default_rng(seed)</code> ile üretilir; aynı tohumla her çalıştırmada aynı tablo gelir. Gerçek projede bunlar veri ambarından gelir, ama yöntem aynıdır.</p>
<pre class="py">import numpy as np


def sepet_verisi(n=500, seed=42):
    """Anadolu Market kurgusal sepet verisi: ürün adedi, üye mi, kampanya, mesafe (km)."""
    rng = np.random.default_rng(seed)
    urun = rng.integers(1, 15, n)
    uye = rng.integers(0, 2, n)
    kampanya = rng.integers(0, 2, n)
    mesafe = rng.uniform(1, 30, n)
    sepet = 40 + 35 * urun + 60 * uye - 25 * kampanya + rng.normal(0, 30, n)
    return np.column_stack([urun, uye, kampanya, mesafe]), sepet

X, y = sepet_verisi()
print(X.shape, round(y.mean(), 1))
print(X[:3].round(1))
</pre>

<h2>Doğrusal ve çoklu regresyon: katsayıyı okumak</h2>
<p>Çoklu doğrusal regresyon tahmini <code>ŷ = b0 + b1·urun + b2·uye + b3·kampanya + b4·mesafe</code> biçiminde kurar. Her katsayı (coefficient) şunu söyler: <b>diğer özellikler sabitken</b> bu özellik bir birim artarsa tahmin ne kadar değişir? Bu yorum, modeli iş birimine anlatmanın en güçlü aracıdır.</p>
<pre class="py">import numpy as np


def sepet_verisi(n=500, seed=42):
    """Anadolu Market kurgusal sepet verisi: ürün adedi, üye mi, kampanya, mesafe (km)."""
    rng = np.random.default_rng(seed)
    urun = rng.integers(1, 15, n)
    uye = rng.integers(0, 2, n)
    kampanya = rng.integers(0, 2, n)
    mesafe = rng.uniform(1, 30, n)
    sepet = 40 + 35 * urun + 60 * uye - 25 * kampanya + rng.normal(0, 30, n)
    return np.column_stack([urun, uye, kampanya, mesafe]), sepet

from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split

X, y = sepet_verisi()
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, random_state=0)
model = LinearRegression().fit(X_tr, y_tr)
for ad, k in zip(["urun", "uye", "kampanya", "mesafe"], model.coef_):
    print(f"{ad:&gt;9}: {k:+.2f} TL")
print(f"    sabit: {model.intercept_:.2f} TL")
print("Test R²:", round(model.score(X_te, y_te), 3))
</pre>
<p>Okuma: her ek ürün sepete yaklaşık 35 TL ekliyor, üye müşteriler ortalama 60 TL daha fazla harcıyor, kampanyalı sepetler ~25 TL daha düşük (indirim etkisi), mesafenin katsayısı sıfıra yakın: etkisi yok. Veriyi biz ürettiğimiz için gerçek değerleri biliyoruz ve modelin onları bulduğunu görüyoruz.</p>
<div class="warn"><b>Katsayı nedensellik değildir</b>"Üyelik 60 TL artırıyor" demek, "herkesi üye yaparsak sepet 60 TL büyür" demek değildir; zaten çok alışveriş yapanlar üye oluyor olabilir. Katsayılar <b>ilişkiyi</b> ölçer. Ayrıca özellikler farklı ölçeklerdeyse (TL ile adet) katsayıların büyüklüğü karşılaştırılamaz; önce ölçeklemek gerekir (<i>ml-pipeline-degerlendirme</i>).</div>

<h2>Düzenlileştirme: Ridge ve Lasso</h2>
<p>Özellik sayısı arttıkça ya da özellikler birbiriyle güçlü ilişkiliyse (çoklu doğrusallık, multicollinearity) doğrusal regresyon katsayıları şişer ve aşırı öğrenir. <b>Düzenlileştirme</b> (regularization), büyük katsayılara ceza ekler:</p>
<div class="tbl-wrap"><table>
<tr><th>Model</th><th>Ceza</th><th>Etkisi</th><th>Ne zaman</th></tr>
<tr><td><code>LinearRegression</code></td><td>Yok</td><td>Saf en küçük kareler</td><td>Az ve anlamlı özellik</td></tr>
<tr><td><code>Ridge(alpha)</code></td><td>Katsayıların karesi (L2)</td><td>Hepsini küçültür, sıfırlamaz</td><td>İlişkili çok özellik</td></tr>
<tr><td><code>Lasso(alpha)</code></td><td>Katsayıların mutlak değeri (L1)</td><td>Gereksizleri <b>tam sıfıra</b> indirir</td><td>Özellik seçimi istendiğinde</td></tr>
<tr><td><code>ElasticNet</code></td><td>L1 + L2 karışımı</td><td>İkisinin dengesi</td><td>Çok sayıda ilişkili özellik</td></tr>
</table></div>
<pre class="py">import numpy as np


def sepet_verisi(n=500, seed=42):
    """Anadolu Market kurgusal sepet verisi: ürün adedi, üye mi, kampanya, mesafe (km)."""
    rng = np.random.default_rng(seed)
    urun = rng.integers(1, 15, n)
    uye = rng.integers(0, 2, n)
    kampanya = rng.integers(0, 2, n)
    mesafe = rng.uniform(1, 30, n)
    sepet = 40 + 35 * urun + 60 * uye - 25 * kampanya + rng.normal(0, 30, n)
    return np.column_stack([urun, uye, kampanya, mesafe]), sepet

from sklearn.linear_model import Ridge, Lasso

X, y = sepet_verisi()
for alpha in [0.1, 10]:
    r = Ridge(alpha=alpha).fit(X, y)
    l = Lasso(alpha=alpha).fit(X, y)
    print(f"alpha={alpha:&lt;4} Ridge: {r.coef_.round(1)}  Lasso: {l.coef_.round(1)}")
</pre>
<p><code>alpha</code> cezanın gücüdür: büyüdükçe katsayılar küçülür. Lasso yüksek alpha'da etkisiz <code>mesafe</code>'yi ve hatta zayıf <code>kampanya</code>'yı sıfırlar. Doğru alpha'yı çapraz doğrulamayla seçersin (<code>RidgeCV</code>, <code>LassoCV</code> ya da <code>GridSearchCV</code>).</p>

<h2>Lojistik regresyon ve olasılık</h2>
<p>Adı regresyon olsa da <b>lojistik regresyon</b> (logistic regression) bir sınıflandırıcıdır. Doğrusal skoru sigmoid fonksiyonundan geçirip 0-1 arası bir <b>olasılığa</b> çevirir. <code>predict_proba</code> her sınıfın olasılığını verir; sütun sırası <code>model.classes_</code> ile aynıdır, ikili problemde pozitif sınıf (1 = temerrüt) <b>ikinci sütundur</b>: <code>[:, 1]</code>. <code>predict</code> ise varsayılan olarak 0.5 eşiğini uygular.</p>
<pre class="py">import numpy as np


def kredi_verisi(n=2000, seed=0):
    """Ilgaz Bank kurgusal kredi verisi: gelir (bin TL), borç oranı, gecikme sayısı, yaş."""
    rng = np.random.default_rng(seed)
    gelir = rng.normal(35, 12, n).clip(8, None)
    borc_orani = rng.uniform(0, 0.9, n)
    gecikme = rng.poisson(0.6, n)
    yas = rng.integers(21, 66, n)
    logit = -4.3 + 3.0 * borc_orani + 0.9 * gecikme - 0.05 * (gelir - 35)
    y = (rng.random(n) &lt; 1 / (1 + np.exp(-logit))).astype(int)
    return np.column_stack([gelir, borc_orani, gecikme, yas]), y

from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split

X, y = kredi_verisi()
print("temerrüt oranı:", round(y.mean(), 3))
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, random_state=0, stratify=y)
model = LogisticRegression(max_iter=1000).fit(X_tr, y_tr)
olasilik = model.predict_proba(X_te[:5])
print(model.classes_)
print(olasilik.round(3))
print("P(temerrüt):", olasilik[:, 1].round(3))
print("predict    :", model.predict(X_te[:5]))
</pre>

<h2>Ağaçlar ve topluluklar</h2>
<p><b>Karar ağacı</b> doğrusal olmayan ilişkileri ve etkileşimleri (yüksek borç oranı <i>ve</i> gecikme) kendiliğinden yakalar ama tek başına kolayca aşırı öğrenir. <b>Topluluk</b> (ensemble) yöntemleri birçok ağacı birleştirir:</p>
<ul>
<li><b>Rastgele orman</b> (<code>RandomForestClassifier</code>): yüzlerce ağacı verinin ve özelliklerin rastgele alt kümelerinde eğitip oylatır; varyansı düşürür, ayarlaması kolaydır.</li>
<li><b>Gradient boosting</b> (<code>HistGradientBoostingClassifier</code>): ağaçları sırayla eğitir, her yeni ağaç öncekilerin hatasını düzeltir. Tablo verisinde genellikle en güçlü aile; eksik değerleri kendisi işler ve büyük veride hızlıdır (XGBoost, LightGBM aynı fikrin kütüphaneleridir).</li>
</ul>
<pre class="py">import numpy as np


def kredi_verisi(n=2000, seed=0):
    """Ilgaz Bank kurgusal kredi verisi: gelir (bin TL), borç oranı, gecikme sayısı, yaş."""
    rng = np.random.default_rng(seed)
    gelir = rng.normal(35, 12, n).clip(8, None)
    borc_orani = rng.uniform(0, 0.9, n)
    gecikme = rng.poisson(0.6, n)
    yas = rng.integers(21, 66, n)
    logit = -4.3 + 3.0 * borc_orani + 0.9 * gecikme - 0.05 * (gelir - 35)
    y = (rng.random(n) &lt; 1 / (1 + np.exp(-logit))).astype(int)
    return np.column_stack([gelir, borc_orani, gecikme, yas]), y

from sklearn.ensemble import RandomForestClassifier, HistGradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score
from sklearn.model_selection import train_test_split

X, y = kredi_verisi()
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, random_state=0, stratify=y)
modeller = {
    "lojistik": LogisticRegression(max_iter=1000),
    "orman": RandomForestClassifier(n_estimators=200, min_samples_leaf=5, random_state=0),
    "boosting": HistGradientBoostingClassifier(max_depth=3, random_state=0),
}
for ad, m in modeller.items():
    m.fit(X_tr, y_tr)
    print(f"{ad:&gt;9} ROC-AUC: {roc_auc_score(y_te, m.predict_proba(X_te)[:, 1]):.3f}")
orman = modeller["orman"]
for ad, o in zip(["gelir", "borc_orani", "gecikme", "yas"], orman.feature_importances_):
    print(f"{ad:&gt;11}: {o:.3f}")
</pre>
<p>Bu veri gerçekte doğrusal bir kuralla üretildiği için lojistik regresyon çok iyi iş çıkarır; karmaşık model her zaman kazanmaz. <b>Özellik önemi</b> (feature importance) ise ağaç modellerinde her özelliğin bölmelere katkısını gösterir. Dikkat: <code>yas</code> hedefle ilgisiz olduğu hâlde sıfır olmayan önem alabilir; çok değerli sayısal özellikler ağaçlarda önemi şişirebilir. Daha güvenilir ölçü için <code>sklearn.inspection.permutation_importance</code> kullan.</p>

<h2>Sınıflandırma metrikleri</h2>
<p>Temerrüt oranı %10 civarındaysa "herkes öder" diyen model %90 doğruluk alır. Bu yüzden <b>karışıklık matrisine</b> (confusion matrix) bakarız:</p>
<div class="tbl-wrap"><table>
<tr><th></th><th>Tahmin: 0 (öder)</th><th>Tahmin: 1 (temerrüt)</th></tr>
<tr><td><b>Gerçek: 0</b></td><td>TN (doğru negatif)</td><td>FP (yanlış alarm: iyi müşteriyi reddettin)</td></tr>
<tr><td><b>Gerçek: 1</b></td><td>FN (kaçırılan: kötü krediyi onayladın)</td><td>TP (doğru yakalanan)</td></tr>
</table></div>
<ul>
<li><b>Precision</b> (kesinlik) = TP / (TP + FP): "Riskli dediklerimin ne kadarı gerçekten riskli?"</li>
<li><b>Recall</b> (duyarlılık) = TP / (TP + FN): "Gerçek temerrütlerin ne kadarını yakaladım?"</li>
<li><b>F1</b> = precision ve recall'ın harmonik ortalaması; ikisini tek sayıda dengeler.</li>
<li><b>ROC-AUC</b>: eşikten bağımsız sıralama kalitesi. Rastgele bir temerrütçüye, rastgele bir iyi müşteriden daha yüksek risk verme olasılığı; 0.5 yazı-tura, 1.0 kusursuz.</li>
</ul>
<pre class="py">from sklearn.metrics import confusion_matrix, precision_score, recall_score, f1_score, classification_report

gercek = [0, 0, 0, 0, 0, 0, 1, 1, 1, 1]
tahmin = [0, 0, 0, 0, 1, 1, 1, 1, 1, 0]
print(confusion_matrix(gercek, tahmin).tolist())     # [[TN, FP], [FN, TP]]
print("precision:", round(precision_score(gercek, tahmin), 3))
print("recall   :", round(recall_score(gercek, tahmin), 3))
print("f1       :", round(f1_score(gercek, tahmin), 3))
print(classification_report(gercek, tahmin, target_names=["öder", "temerrüt"]))
</pre>

<h2>Dengesiz sınıflar ve eşik seçimi</h2>
<p>Dengesiz veride model azınlık sınıfını görmezden gelmeye meyillidir. İki temel kol var: <b>class_weight="balanced"</b> ile azınlık sınıfının hatalarını daha pahalı yapmak, ve <b>eşiği</b> (threshold) iş maliyetine göre seçmek. Eşiği düşürmek daha çok başvuruyu riskli sayar: recall artar, precision düşer. Doğru eşik bir matematik sorusu değil, <b>iş sorusudur</b>: kaçırılan bir temerrüt bankaya ortalama ne kadara mal oluyor, yanlış reddedilen iyi müşteri ne kadar kâr kaybettiriyor?</p>
<pre class="py">import numpy as np


def kredi_verisi(n=2000, seed=0):
    """Ilgaz Bank kurgusal kredi verisi: gelir (bin TL), borç oranı, gecikme sayısı, yaş."""
    rng = np.random.default_rng(seed)
    gelir = rng.normal(35, 12, n).clip(8, None)
    borc_orani = rng.uniform(0, 0.9, n)
    gecikme = rng.poisson(0.6, n)
    yas = rng.integers(21, 66, n)
    logit = -4.3 + 3.0 * borc_orani + 0.9 * gecikme - 0.05 * (gelir - 35)
    y = (rng.random(n) &lt; 1 / (1 + np.exp(-logit))).astype(int)
    return np.column_stack([gelir, borc_orani, gecikme, yas]), y

import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import precision_score, recall_score
from sklearn.model_selection import train_test_split

X, y = kredi_verisi()
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, random_state=0, stratify=y)
for cw in [None, "balanced"]:
    m = LogisticRegression(max_iter=1000, class_weight=cw).fit(X_tr, y_tr)
    p = m.predict(X_te)
    print(f"class_weight={str(cw):&lt;8} recall={recall_score(y_te, p):.2f} precision={precision_score(y_te, p, zero_division=0):.2f}")

m = LogisticRegression(max_iter=1000).fit(X_tr, y_tr)
risk = m.predict_proba(X_te)[:, 1]
for esik in [0.5, 0.3, 0.15]:
    p = (risk &gt;= esik).astype(int)
    print(f"eşik={esik:&lt;4} recall={recall_score(y_te, p):.2f} precision={precision_score(y_te, p, zero_division=0):.2f} riskli sayılan={p.mean():.0%}")
</pre>
<div class="tip"><b>Model seçimi ile eşik seçimi ayrı işlerdir</b>Modelleri eşikten bağımsız bir metrikle (ROC-AUC, dengesiz veride PR-AUC / <code>average_precision_score</code>) karşılaştır. Kazanan modelin eşiğini sonra iş maliyetiyle belirle. Eşiği de test setinde değil doğrulama verisinde seç.</div>

<h2>Model seçimi: bir yol haritası</h2>
<p>Yeni bir regresyon ya da sınıflandırma problemine başladığında hangi modeli deneyeceğini rastgele seçme; aşağıdaki sıra hem zaman kazandırır hem de sonuçlarını savunmanı kolaylaştırır.</p>
<div class="tbl-wrap"><table>
<tr><th>Adım</th><th>Regresyon</th><th>Sınıflandırma</th><th>Neden</th></tr>
<tr><td>1. Taban çizgi</td><td><code>DummyRegressor</code> (ortalama)</td><td><code>DummyClassifier</code> (en sık sınıf)</td><td>Her modelin geçmesi gereken alt sınır</td></tr>
<tr><td>2. Basit ve yorumlanabilir</td><td><code>LinearRegression</code> / <code>Ridge</code></td><td><code>LogisticRegression</code></td><td>Katsayılar iş birimine anlatılabilir</td></tr>
<tr><td>3. Doğrusal olmayan</td><td><code>RandomForestRegressor</code></td><td><code>RandomForestClassifier</code></td><td>Etkileşimleri kendiliğinden yakalar, az ayar ister</td></tr>
<tr><td>4. En güçlü aday</td><td><code>HistGradientBoostingRegressor</code></td><td><code>HistGradientBoostingClassifier</code></td><td>Tablo verisinde genellikle en iyi skor</td></tr>
<tr><td>5. Karar</td><td colspan="2">Skor farkı, yorumlanabilirlik ihtiyacı, eğitim/tahmin süresi ve bakım maliyeti birlikte tartılır</td><td>"En yüksek skor" tek ölçüt değildir</td></tr>
</table></div>
<p>Regresyonda hata metriklerini de iş diline çevirmeyi unutma. "RMSE 31.4" yerine "sepet tutarı tahminlerimiz tipik olarak ±30 TL sapıyor; bu, kampanya bütçesi planlamasında yüzde birkaçlık bir hata payı demek" cümlesi karar vericinin işine yarar. Hataların dağılımına da bak: model küçük sepetlerde iyi, büyük kurumsal siparişlerde kötüyse ortalama metrik bunu gizler. Tahmin ile gerçeği karşılaştıran bir saçılım grafiği ya da hataların segment bazında (üye/üye değil, şehir) ortalaması, tek bir sayının saklayacağı sorunları ortaya çıkarır. Sınıflandırmada da aynı ilke geçerli: genel AUC iyiyken belirli bir müşteri grubunda recall çok düşükse, bu hem iş hem de adalet (fairness) sorunudur ve model kartında açıkça yazılmalıdır.</p>
<p>Son olarak, aynı veride çok sayıda model ve ayar deneyip en iyisini seçmek de bir tür aşırı öğrenmedir. Karşılaştırmaları sabit bir çapraz doğrulama düzeninde yap, test setini yalnızca en sonda seçilen tek model için kullan. Bunun sistematik yolu (Pipeline, cross_val_score, GridSearchCV) bir sonraki dersin konusu.</p>

<div class="note"><b>Gerçek işte</b>Kredi skorlama ekipleri tek bir "onay/red" eşiği yerine çoğu zaman bantlar kullanır: düşük risk otomatik onay, orta risk analist incelemesi, yüksek risk red. Her bandın sınırı geçmiş kayıp verisiyle belirlenir ve düzenleyici kurumlar modelin açıklanabilir olmasını ister. Bu yüzden bankalarda lojistik regresyon, daha güçlü boosting modellerine rağmen hâlâ yaygındır: katsayısı tek tek gerekçelendirilebilir.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Olasılık kalibrasyonu</h3>
<p>Bir modelin 0.20 dediği başvuruların gerçekten yaklaşık %20'si temerrüde düşüyorsa model <b>kalibre</b>dir. Lojistik regresyon genellikle iyi kalibredir; rastgele orman ve <code>class_weight="balanced"</code> kullanılan modeller olasılıkları çarpıtır (balanced, olasılıkları yukarı iter). Beklenen kayıp gibi olasılığın kendisinin kullanıldığı hesaplarda <code>CalibratedClassifierCV</code> ile kalibre et, <code>sklearn.calibration.calibration_curve</code> ile kontrol et.</p>
<h3>Çok sınıflı metrikler</h3>
<p>Üç ve daha fazla sınıfta precision/recall her sınıf için ayrı hesaplanır ve birleştirilir: <code>average="macro"</code> (her sınıfa eşit ağırlık; azınlık sınıflarını önemser), <code>average="weighted"</code> (sınıf büyüklüğüyle ağırlıklı), <code>average="micro"</code> (tüm kararları havuzlar; doğruluğa eşittir). <code>classification_report</code> üçünü birden gösterir.</p>
<h3>Beklenen kayıp</h3>
<p>Bankacılıkta beklenen kayıp = PD (temerrüt olasılığı) × LGD (temerrüt hâlinde kayıp oranı) × EAD (temerrüt anındaki risk tutarı). Senin sınıflandırıcın PD'yi üretir; bu yüzden olasılıkların kalibre olması doğrudan para demektir.</p>
<pre class="py">import numpy as np

pd_ = np.array([0.02, 0.10, 0.35])          # model çıktısı
lgd = 0.45                                   # teminata göre kayıp oranı
ead = np.array([50_000, 120_000, 30_000])    # kredi tutarları (TL)
beklenen = pd_ * lgd * ead
print(beklenen.round(0), "toplam:", round(beklenen.sum()))
</pre>
</section>
`,
  ex: [
    { t: 'mc',
      stage: 'Isınma',
      q: '40 özellikli bir sepet modelinde ekip "hangi özellikler gerçekten gerekli?" sorusuna otomatik yanıt istiyor. Hangi model doğrudan özellik seçimi yapar?',
      o: [
        'Ridge, çünkü tüm katsayıları ceza ile küçültür',
        'Lasso, çünkü zayıf katsayıları tam sıfıra indirir',
        'LinearRegression, çünkü cezasız olduğu için tarafsızdır',
        'LogisticRegression, çünkü her özelliğe olasılık verir'
      ],
      a: 1,
      why: 'Lasso\'nun L1 cezası zayıf özelliklerin katsayısını tam 0 yapar; sıfır olmayanlar seçilmiş özelliklerdir. Ridge katsayıları küçültür ama sıfırlamaz. LogisticRegression bir sınıflandırıcıdır, burada hedef sayısal.' },
    { t: 'mc',
      stage: 'Isınma',
      q: 'Temerrüt oranı %4 olan portföyde bir model %96 doğruluk alıyor ama recall değeri 0.0. Bu ne anlama gelir?',
      o: ['Model mükemmel; doğruluk yüksek', 'Model her başvuruya "temerrüt" diyor; %96 doğruluk bu yüzden yüksek çıkıyor', 'Model hiçbir temerrüdü yakalamıyor; herkese "öder" diyor', 'Precision da mutlaka 1.0 demektir'],
      a: 2,
      why: 'Recall = TP / (TP + FN); 0 ise hiçbir gerçek temerrüt yakalanmamış. Herkese "öder" demek %96 doğruluk getirir ama işe yaramaz. Herkese "temerrüt" deseydi recall 1.0 olurdu.' },
    { t: 'mc',
      stage: 'Isınma',
      q: 'Kredi modelinde karar eşiğini 0.5\'ten 0.2\'ye indirirsen genellikle ne olur?',
      o: ['Recall artar, precision düşer', 'Recall düşer, precision artar', 'İkisi de artar', 'ROC-AUC değişir, diğerleri aynı kalır'],
      a: 0,
      why: 'Düşük eşik daha çok başvuruyu riskli sayar: daha fazla gerçek temerrüt yakalanır (recall ↑) ama yanlış alarmlar da çoğalır (precision ↓). ROC-AUC eşikten bağımsızdır, değişmez.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Karışıklık matrisi ne yazdırır?',
      code: 'from sklearn.metrics import confusion_matrix\n\ngercek = [1, 0, 1, 1, 0, 0, 1]\ntahmin = [1, 0, 0, 1, 1, 0, 1]\nprint(confusion_matrix(gercek, tahmin).tolist())\n',
      o: ['[[2, 1], [1, 3]]', '[[3, 1], [1, 2]]', '[[2, 1], [3, 1]]', '[[1, 2], [3, 1]]'],
      a: 0,
      why: 'Satırlar gerçek, sütunlar tahmin; sıra [0, 1]. Gerçek 0 olan 3 örnekten 2\'si 0 (TN), 1\'i 1 (FP) tahmin edilmiş: [2, 1]. Gerçek 1 olan 4 örnekten 1\'i kaçmış (FN), 3\'ü yakalanmış (TP): [1, 3].' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Bu kod ne yazdırır?',
      code: 'from sklearn.metrics import precision_score, recall_score\n\ngercek = [0, 0, 0, 0, 1, 1, 1, 1]\ntahmin = [0, 0, 1, 1, 1, 1, 1, 0]\nprint(round(precision_score(gercek, tahmin), 2), round(recall_score(gercek, tahmin), 2))\n',
      o: ['0.75 0.6', '0.6 0.6', '0.6 0.75', '0.75 0.75'],
      a: 2,
      why: 'Tahmin 1 olan 5 örnekten 3\'ü gerçekten 1: precision 3/5 = 0.6. Gerçek 1 olan 4 örnekten 3\'ü yakalanmış: recall 3/4 = 0.75. İkisini karıştırmamak için paydaya bak: precision tahminlere, recall gerçeklere bölünür.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Eşik uygulandığında ne yazdırılır?',
      code: 'import numpy as np\n\nolasilik = np.array([[0.9, 0.1], [0.4, 0.6], [0.75, 0.25], [0.2, 0.8]])\nrisk = olasilik[:, 1]\nprint((risk >= 0.5).astype(int).tolist(), (risk >= 0.25).astype(int).tolist())\n',
      o: ['[1, 0, 1, 0] [1, 0, 1, 0]', '[0, 1, 0, 1] [0, 1, 0, 1]', '[0, 1, 0, 1] [0, 1, 1, 1]', '[0, 1, 1, 1] [0, 1, 0, 1]'],
      a: 2,
      why: 'Pozitif sınıf olasılığı ikinci sütundur: [0.1, 0.6, 0.25, 0.8]. 0.5 eşiğinde ikinci ve dördüncü 1 olur. 0.25 eşiğinde 0.25 de (>=) dahil olur ve üçüncü örnek de riskli sayılır.' },
    { t: 'order',
      stage: 'Kodu oku',
      q: '<p>Dengesiz kredi verisinde <code>class_weight="balanced"</code> lojistik regresyon eğitip test <b>recall</b> değerini hesaplayan programın satırlarını sırala.</p>',
      lines: [
        'from sklearn.datasets import make_classification',
        'from sklearn.linear_model import LogisticRegression',
        'from sklearn.metrics import recall_score',
        'X, y = make_classification(n_samples=1000, weights=[0.9, 0.1], random_state=0)',
        'model = LogisticRegression(max_iter=1000, class_weight="balanced")',
        'model.fit(X[:800], y[:800])',
        'tahmin = model.predict(X[800:])',
        'duyarlilik = recall_score(y[800:], tahmin)'
      ],
      tests: 'assert duyarlilik >= 0.6, "balanced ağırlıkla azınlık sınıfının çoğu yakalanmalı"\nassert len(tahmin) == 200, "test kısmı son 200 örnek"\n',
      hint: 'Model nesnesi fit\'ten önce oluşturulur; tahmin fit\'ten, metrik tahminden sonra gelir.',
      why: 'Akış: veri → model (hiperparametre class_weight burada) → fit → predict → metrik. recall_score(gercek, tahmin) argüman sırası önemlidir: önce gerçek değerler.' },
    { t: 'code',
      stage: 'Rehberli',
      id: 'ml-regresyon-siniflandirma-1',
      diff: 1,
      q: '<p><code>katsayi_tablosu(X, y, adlar)</code> fonksiyonunu yaz: <code>LinearRegression</code> eğitsin ve her özellik adını 2 basamaklı katsayısına eşleyen bir sözlük döndürsün; sözlüğe ayrıca <code>"sabit"</code> anahtarıyla kesişimi (intercept) ekle. Sepet verisiyle dene.</p>',
      guide: ['LinearRegression().fit(X, y) ile modeli eğit.', 'zip(adlar, model.coef_) ile ad-katsayı çiftlerini gez.', 'Her değeri round(float(k), 2) yap.', '"sabit" anahtarına model.intercept_ ekle ve döndür.'],
      example: 'from sklearn.linear_model import LinearRegression\n\nX = [[1, 0], [2, 1], [3, 0], [4, 1]]\ny = [12, 27, 32, 47]\nm = LinearRegression().fit(X, y)\nprint({ad: round(float(k), 1) for ad, k in zip(["saat", "vardiya"], m.coef_)}, round(float(m.intercept_), 1))\n',
      start: 'import numpy as np\n\n\ndef sepet_verisi(n=500, seed=42):\n    """Anadolu Market kurgusal sepet verisi: ürün adedi, üye mi, kampanya, mesafe (km)."""\n    rng = np.random.default_rng(seed)\n    urun = rng.integers(1, 15, n)\n    uye = rng.integers(0, 2, n)\n    kampanya = rng.integers(0, 2, n)\n    mesafe = rng.uniform(1, 30, n)\n    sepet = 40 + 35 * urun + 60 * uye - 25 * kampanya + rng.normal(0, 30, n)\n    return np.column_stack([urun, uye, kampanya, mesafe]), sepet\n\nfrom sklearn.linear_model import LinearRegression\n\n\ndef katsayi_tablosu(X, y, adlar):\n    tablo = {}\n    # TODO: modeli eğit\n    # TODO: her ad için 2 basamaklı katsayı\n    # TODO: "sabit" anahtarı\n    return tablo\n\n\nX, y = sepet_verisi()\nprint(katsayi_tablosu(X, y, ["urun", "uye", "kampanya", "mesafe"]))\n',
      sol: 'import numpy as np\n\n\ndef sepet_verisi(n=500, seed=42):\n    """Anadolu Market kurgusal sepet verisi: ürün adedi, üye mi, kampanya, mesafe (km)."""\n    rng = np.random.default_rng(seed)\n    urun = rng.integers(1, 15, n)\n    uye = rng.integers(0, 2, n)\n    kampanya = rng.integers(0, 2, n)\n    mesafe = rng.uniform(1, 30, n)\n    sepet = 40 + 35 * urun + 60 * uye - 25 * kampanya + rng.normal(0, 30, n)\n    return np.column_stack([urun, uye, kampanya, mesafe]), sepet\n\nfrom sklearn.linear_model import LinearRegression\n\n\ndef katsayi_tablosu(X, y, adlar):\n    model = LinearRegression().fit(X, y)\n    tablo = {ad: round(float(k), 2) for ad, k in zip(adlar, model.coef_)}\n    tablo["sabit"] = round(float(model.intercept_), 2)\n    return tablo\n\n\nX, y = sepet_verisi()\nprint(katsayi_tablosu(X, y, ["urun", "uye", "kampanya", "mesafe"]))\n',
      tests: '_t = katsayi_tablosu(X, y, ["urun", "uye", "kampanya", "mesafe"])\nassert set(_t) == {"urun", "uye", "kampanya", "mesafe", "sabit"}, "dört özellik ve sabit anahtarları olmalı"\nassert abs(_t["urun"] - 35) < 1.5, f"ürün başına ~35 TL bekleniyordu; gelen {_t[\'urun\']}"\nassert abs(_t["uye"] - 60) < 6, "üyelik etkisi ~60 TL"\nassert _t["kampanya"] < -15, "kampanya katsayısı negatif (~-25)"\nassert abs(_t["mesafe"]) < 1, "mesafenin etkisi sıfıra yakın olmalı"\nassert all(type(v) is float for v in _t.values()), "değerler float olmalı"\n_u = katsayi_tablosu([[1], [2], [3]], [5, 7, 9], ["x"])\nassert _u == {"x": 2.0, "sabit": 3.0}, "y = 2x + 3 için {x: 2.0, sabit: 3.0}"\n',
      hints: [
        'model.coef_ özellik sırasıyla katsayıları, model.intercept_ sabiti verir.',
        '{ad: round(float(k), 2) for ad, k in zip(adlar, model.coef_)}'
      ],
      why: 'Katsayı tablosu modelin iş birimine anlatılabilen yüzüdür. float() ile numpy türünden Python türüne çevirmek, sözlüğü JSON\'a yazarken ya da raporlarken sorun çıkmasını önler.' },
    { t: 'code',
      stage: 'Rehberli',
      id: 'ml-regresyon-siniflandirma-2',
      diff: 2,
      q: '<p><code>esikte_metrikler(y_gercek, risk, esik)</code> fonksiyonunu yaz: <code>risk</code> pozitif sınıf olasılıklarıdır. <code>risk &gt;= esik</code> olanları 1 say ve <code>{"precision", "recall", "f1", "pozitif_orani"}</code> sözlüğünü 3 basamakla döndür. <code>pozitif_orani</code>, 1 tahmin edilenlerin oranıdır. Hiç pozitif tahmin yoksa precision 0 olsun (<code>zero_division=0</code>).</p>',
      guide: [
        'risk\'i np.asarray ile diziye çevir.',
        'Tahmin: (risk >= esik).astype(int).',
        'precision_score, recall_score, f1_score\'u zero_division=0 ile çağır.',
        'pozitif_orani = tahmin.mean(); hepsini round(float(...), 3) yap.'
      ],
      example: 'import numpy as np\nfrom sklearn.metrics import recall_score\n\nskor = np.array([0.1, 0.7, 0.4])\ngercek = [0, 1, 1]\ntahmin = (skor >= 0.35).astype(int)\nprint(tahmin.tolist(), recall_score(gercek, tahmin))\n',
      start: 'import numpy as np\nfrom sklearn.metrics import precision_score, recall_score, f1_score\n\n\ndef esikte_metrikler(y_gercek, risk, esik):\n    # TODO: eşik uygula\n    # TODO: metrikleri hesapla (zero_division=0)\n    return {}\n',
      sol: 'import numpy as np\nfrom sklearn.metrics import precision_score, recall_score, f1_score\n\n\ndef esikte_metrikler(y_gercek, risk, esik):\n    tahmin = (np.asarray(risk) >= esik).astype(int)\n    return {\n        "precision": round(float(precision_score(y_gercek, tahmin, zero_division=0)), 3),\n        "recall": round(float(recall_score(y_gercek, tahmin, zero_division=0)), 3),\n        "f1": round(float(f1_score(y_gercek, tahmin, zero_division=0)), 3),\n        "pozitif_orani": round(float(tahmin.mean()), 3),\n    }\n',
      tests: '_g = [0, 0, 0, 0, 1, 1, 1, 1]\n_r = [0.1, 0.3, 0.6, 0.2, 0.9, 0.55, 0.4, 0.8]\n_m = esikte_metrikler(_g, _r, 0.5)\nassert _m == {"precision": 0.75, "recall": 0.75, "f1": 0.75, "pozitif_orani": 0.5}, f"0.5 eşiğinde 4 pozitif tahmin, 3\'ü doğru; gelen {_m}"\n_m2 = esikte_metrikler(_g, _r, 0.4)\nassert _m2["recall"] == 1.0 and _m2["precision"] == 0.8, "0.4 eşiği (>=) 0.4\'ü de pozitif sayar: recall 1.0, precision 4/5"\n_m3 = esikte_metrikler(_g, _r, 0.95)\nassert _m3["precision"] == 0.0 and _m3["pozitif_orani"] == 0.0, "hiç pozitif yoksa precision 0 (zero_division=0)"\n',
      hints: [
        'tahmin = (np.asarray(risk) >= esik).astype(int)',
        'precision_score(y_gercek, tahmin, zero_division=0) — sıra: önce gerçek.'
      ],
      why: 'Eşik bir iş parametresidir; aynı model farklı eşiklerde çok farklı precision/recall üretir. zero_division=0, hiç pozitif tahmin olmayan uç durumda uyarı yerine anlamlı bir değer döndürür.' },
    { t: 'code',
      stage: 'Rehberli',
      id: 'ml-regresyon-siniflandirma-3',
      diff: 2,
      q: '<p><code>orman_onemi(X, y, adlar)</code> fonksiyonunu yaz: <code>RandomForestClassifier(n_estimators=100, random_state=0, class_weight="balanced")</code> eğitsin ve <code>(ad, onem)</code> demetlerini önem değerine göre <b>büyükten küçüğe</b> sıralı liste olarak döndürsün (önem 3 basamak). Kredi verisiyle dene.</p>',
      guide: [
        'Modeli verilen hiperparametrelerle oluştur ve fit et.',
        'model.feature_importances_ her özelliğin önemini verir (toplamı 1).',
        'zip ile adlarla eşle, round(float(o), 3) uygula.',
        'sorted(..., key=lambda t: t[1], reverse=True) ile sırala.'
      ],
      example: 'from sklearn.tree import DecisionTreeClassifier\n\nX = [[0, 5], [1, 3], [0, 8], [1, 1]]\ny = [0, 1, 0, 1]\nm = DecisionTreeClassifier(random_state=0).fit(X, y)\nprint(sorted(zip(["a", "b"], m.feature_importances_.round(2).tolist()), key=lambda t: t[1], reverse=True))\n',
      start: 'import numpy as np\n\n\ndef kredi_verisi(n=2000, seed=0):\n    """Ilgaz Bank kurgusal kredi verisi: gelir (bin TL), borç oranı, gecikme sayısı, yaş."""\n    rng = np.random.default_rng(seed)\n    gelir = rng.normal(35, 12, n).clip(8, None)\n    borc_orani = rng.uniform(0, 0.9, n)\n    gecikme = rng.poisson(0.6, n)\n    yas = rng.integers(21, 66, n)\n    logit = -4.3 + 3.0 * borc_orani + 0.9 * gecikme - 0.05 * (gelir - 35)\n    y = (rng.random(n) < 1 / (1 + np.exp(-logit))).astype(int)\n    return np.column_stack([gelir, borc_orani, gecikme, yas]), y\n\nfrom sklearn.ensemble import RandomForestClassifier\n\n\ndef orman_onemi(X, y, adlar):\n    # TODO: modeli eğit\n    # TODO: önemleri adlarla eşle ve sırala\n    return []\n\n\nX, y = kredi_verisi()\nprint(orman_onemi(X, y, ["gelir", "borc_orani", "gecikme", "yas"]))\n',
      sol: 'import numpy as np\n\n\ndef kredi_verisi(n=2000, seed=0):\n    """Ilgaz Bank kurgusal kredi verisi: gelir (bin TL), borç oranı, gecikme sayısı, yaş."""\n    rng = np.random.default_rng(seed)\n    gelir = rng.normal(35, 12, n).clip(8, None)\n    borc_orani = rng.uniform(0, 0.9, n)\n    gecikme = rng.poisson(0.6, n)\n    yas = rng.integers(21, 66, n)\n    logit = -4.3 + 3.0 * borc_orani + 0.9 * gecikme - 0.05 * (gelir - 35)\n    y = (rng.random(n) < 1 / (1 + np.exp(-logit))).astype(int)\n    return np.column_stack([gelir, borc_orani, gecikme, yas]), y\n\nfrom sklearn.ensemble import RandomForestClassifier\n\n\ndef orman_onemi(X, y, adlar):\n    model = RandomForestClassifier(n_estimators=100, random_state=0, class_weight="balanced").fit(X, y)\n    ciftler = [(ad, round(float(o), 3)) for ad, o in zip(adlar, model.feature_importances_)]\n    return sorted(ciftler, key=lambda t: t[1], reverse=True)\n\n\nX, y = kredi_verisi()\nprint(orman_onemi(X, y, ["gelir", "borc_orani", "gecikme", "yas"]))\n',
      tests: 'from sklearn.ensemble import RandomForestClassifier\n_ad = ["gelir", "borc_orani", "gecikme", "yas"]\n_o = orman_onemi(X, y, _ad)\nassert len(_o) == 4 and {a for a, _ in _o} == set(_ad), "dört (ad, önem) demeti olmalı"\nassert [v for _, v in _o] == sorted([v for _, v in _o], reverse=True), "büyükten küçüğe sıralı olmalı"\n_ref = RandomForestClassifier(n_estimators=100, random_state=0, class_weight="balanced").fit(X, y)\nassert dict(_o) == {a: round(float(v), 3) for a, v in zip(_ad, _ref.feature_importances_)}, "önemler belirtilen hiperparametrelerle eğitilmiş ormandan gelmeli"\nassert abs(sum(v for _, v in _o) - 1) < 0.01, "önemlerin toplamı ~1"\n',
      hints: ['model.feature_importances_ özellik sırasıyla gelir.', 'sorted(ciftler, key=lambda t: t[1], reverse=True)'],
      why: 'Ağaç tabanlı önem, her özelliğin bölmelerde sağladığı saflık artışının ortalamasıdır. Hızlı bir ilk bakış sunar; ancak ilgisiz ama çok değerli sürekli özellikler (yaş gibi) bile pay alabilir, bu yüzden kararları permutation importance ile teyit et.' },
    { t: 'code',
      stage: 'Kendin yaz',
      id: 'ml-regresyon-siniflandirma-4',
      diff: 2,
      q: '<p><code>lasso_secim(X, y, adlar, alpha)</code> fonksiyonu yaz: <code>Lasso(alpha=alpha)</code> eğitsin ve katsayısı <b>tam sıfır olmayan</b> özellik adlarını orijinal sırasıyla liste olarak döndürsün.</p>',
      start: 'import numpy as np\n\n\ndef sepet_verisi(n=500, seed=42):\n    """Anadolu Market kurgusal sepet verisi: ürün adedi, üye mi, kampanya, mesafe (km)."""\n    rng = np.random.default_rng(seed)\n    urun = rng.integers(1, 15, n)\n    uye = rng.integers(0, 2, n)\n    kampanya = rng.integers(0, 2, n)\n    mesafe = rng.uniform(1, 30, n)\n    sepet = 40 + 35 * urun + 60 * uye - 25 * kampanya + rng.normal(0, 30, n)\n    return np.column_stack([urun, uye, kampanya, mesafe]), sepet\n\nfrom sklearn.linear_model import Lasso\n\n\ndef lasso_secim(X, y, adlar, alpha):\n    pass\n',
      sol: 'import numpy as np\n\n\ndef sepet_verisi(n=500, seed=42):\n    """Anadolu Market kurgusal sepet verisi: ürün adedi, üye mi, kampanya, mesafe (km)."""\n    rng = np.random.default_rng(seed)\n    urun = rng.integers(1, 15, n)\n    uye = rng.integers(0, 2, n)\n    kampanya = rng.integers(0, 2, n)\n    mesafe = rng.uniform(1, 30, n)\n    sepet = 40 + 35 * urun + 60 * uye - 25 * kampanya + rng.normal(0, 30, n)\n    return np.column_stack([urun, uye, kampanya, mesafe]), sepet\n\nfrom sklearn.linear_model import Lasso\n\n\ndef lasso_secim(X, y, adlar, alpha):\n    model = Lasso(alpha=alpha).fit(X, y)\n    return [ad for ad, k in zip(adlar, model.coef_) if k != 0]\n',
      tests: 'from sklearn.linear_model import Lasso\n_X, _y = sepet_verisi()\n_ad = ["urun", "uye", "kampanya", "mesafe"]\nfor _al in [0.01, 1, 10, 50]:\n    _ref = [a for a, k in zip(_ad, Lasso(alpha=_al).fit(_X, _y).coef_) if k != 0]\n    assert lasso_secim(_X, _y, _ad, _al) == _ref, f"alpha={_al} için seçilen özellikler {_ref} olmalı"\nassert lasso_secim(_X, _y, _ad, 0.01) == _ad, "çok küçük alpha\'da hepsi kalır"\nassert "mesafe" not in lasso_secim(_X, _y, _ad, 10), "alpha=10\'da etkisiz mesafe sıfırlanmalı"\n',
      hints: [
        'model.coef_ içinde k != 0 olanları seç.',
        'Sırayı korumak için zip(adlar, model.coef_) üzerinde liste kavrayışı.'
      ],
      why: 'L1 cezası optimizasyonu köşe noktalara iter; zayıf özelliklerin katsayısı tam sıfır olur. alpha büyüdükçe seçilen özellik sayısı azalır; böylece model hem sadeleşir hem de yorumlanması kolaylaşır.' },
    { t: 'code',
      stage: 'Kendin yaz',
      id: 'ml-regresyon-siniflandirma-5',
      diff: 2,
      q: '<p><code>auc_karsilastir(X_tr, y_tr, X_te, y_te)</code> fonksiyonu yaz: üç modeli eğitip test ROC-AUC değerlerini 3 basamakla sözlük olarak döndürsün: <code>"lojistik"</code>: <code>LogisticRegression(max_iter=1000)</code>, <code>"agac"</code>: <code>DecisionTreeClassifier(max_depth=4, random_state=0)</code>, <code>"boosting"</code>: <code>HistGradientBoostingClassifier(max_depth=3, random_state=0)</code>. AUC için <b>olasılık</b> kullan.</p>',
      start: 'import numpy as np\n\n\ndef kredi_verisi(n=2000, seed=0):\n    """Ilgaz Bank kurgusal kredi verisi: gelir (bin TL), borç oranı, gecikme sayısı, yaş."""\n    rng = np.random.default_rng(seed)\n    gelir = rng.normal(35, 12, n).clip(8, None)\n    borc_orani = rng.uniform(0, 0.9, n)\n    gecikme = rng.poisson(0.6, n)\n    yas = rng.integers(21, 66, n)\n    logit = -4.3 + 3.0 * borc_orani + 0.9 * gecikme - 0.05 * (gelir - 35)\n    y = (rng.random(n) < 1 / (1 + np.exp(-logit))).astype(int)\n    return np.column_stack([gelir, borc_orani, gecikme, yas]), y\n\nfrom sklearn.ensemble import HistGradientBoostingClassifier\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.metrics import roc_auc_score\nfrom sklearn.tree import DecisionTreeClassifier\n\n\ndef auc_karsilastir(X_tr, y_tr, X_te, y_te):\n    pass\n',
      sol: 'import numpy as np\n\n\ndef kredi_verisi(n=2000, seed=0):\n    """Ilgaz Bank kurgusal kredi verisi: gelir (bin TL), borç oranı, gecikme sayısı, yaş."""\n    rng = np.random.default_rng(seed)\n    gelir = rng.normal(35, 12, n).clip(8, None)\n    borc_orani = rng.uniform(0, 0.9, n)\n    gecikme = rng.poisson(0.6, n)\n    yas = rng.integers(21, 66, n)\n    logit = -4.3 + 3.0 * borc_orani + 0.9 * gecikme - 0.05 * (gelir - 35)\n    y = (rng.random(n) < 1 / (1 + np.exp(-logit))).astype(int)\n    return np.column_stack([gelir, borc_orani, gecikme, yas]), y\n\nfrom sklearn.ensemble import HistGradientBoostingClassifier\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.metrics import roc_auc_score\nfrom sklearn.tree import DecisionTreeClassifier\n\n\ndef auc_karsilastir(X_tr, y_tr, X_te, y_te):\n    modeller = {\n        "lojistik": LogisticRegression(max_iter=1000),\n        "agac": DecisionTreeClassifier(max_depth=4, random_state=0),\n        "boosting": HistGradientBoostingClassifier(max_depth=3, random_state=0),\n    }\n    sonuc = {}\n    for ad, m in modeller.items():\n        m.fit(X_tr, y_tr)\n        sonuc[ad] = round(float(roc_auc_score(y_te, m.predict_proba(X_te)[:, 1])), 3)\n    return sonuc\n',
      tests: '\nfrom sklearn.model_selection import train_test_split as _tts\n_X, _y = kredi_verisi()\n_a, _b, _c, _d = _tts(_X, _y, test_size=0.25, random_state=0, stratify=_y)\nfrom sklearn.linear_model import LogisticRegression as _LR\nfrom sklearn.tree import DecisionTreeClassifier as _DT\nfrom sklearn.metrics import roc_auc_score as _auc\n_s = auc_karsilastir(_a, _c, _b, _d)\nassert set(_s) == {"lojistik", "agac", "boosting"}, "üç anahtar olmalı"\nassert _s["lojistik"] == round(float(_auc(_d, _LR(max_iter=1000).fit(_a, _c).predict_proba(_b)[:, 1])), 3), "lojistik AUC predict_proba[:, 1] ile hesaplanmalı"\nassert _s["agac"] == round(float(_auc(_d, _DT(max_depth=4, random_state=0).fit(_a, _c).predict_proba(_b)[:, 1])), 3), "ağaç AUC yanlış: max_depth=4, random_state=0"\nassert all(0.5 < v <= 1 for v in _s.values()), "tüm modeller rastgeleden (0.5) iyi olmalı"\nassert _s["lojistik"] >= _s["agac"], "bu veride doğrusal model ağaçtan iyi sıralar"\n',
      hints: ['Modelleri bir sözlükte tut, döngüde fit et.', 'roc_auc_score(y_te, m.predict_proba(X_te)[:, 1])'],
      why: 'AUC olasılıkların sıralamasını ölçer; predict() ile 0/1 etiket verirsen eşik bilgisini kaybedersin ve AUC düşük çıkar. Aynı bölme üzerinde aynı metrikle karşılaştırmak adil model seçiminin ön koşuludur.' },
    { t: 'code',
      stage: 'Kendin yaz',
      id: 'ml-regresyon-siniflandirma-6',
      diff: 2,
      q: '<p><code>en_iyi_esik(y_gercek, risk, esikler)</code> fonksiyonu yaz: verilen eşiklerin her biri için F1 hesaplasın (<code>risk &gt;= esik</code> pozitif, <code>zero_division=0</code>) ve <code>(en_iyi_esik, en_iyi_f1)</code> döndürsün (F1 3 basamak). Eşitlikte <b>küçük eşik</b> seçilsin.</p>',
      start: 'import numpy as np\nfrom sklearn.metrics import f1_score\n\n\ndef en_iyi_esik(y_gercek, risk, esikler):\n    pass\n',
      sol: 'import numpy as np\nfrom sklearn.metrics import f1_score\n\n\ndef en_iyi_esik(y_gercek, risk, esikler):\n    risk = np.asarray(risk)\n    en_iyi = None\n    for e in sorted(esikler):\n        f1 = f1_score(y_gercek, (risk >= e).astype(int), zero_division=0)\n        if en_iyi is None or f1 > en_iyi[1]:\n            en_iyi = (e, f1)\n    return en_iyi[0], round(float(en_iyi[1]), 3)\n',
      tests: '_g = [0, 0, 0, 0, 1, 1, 1, 1]\n_r = [0.1, 0.3, 0.6, 0.2, 0.9, 0.55, 0.4, 0.8]\nassert en_iyi_esik(_g, _r, [0.5, 0.35, 0.7]) == (0.35, 0.889), "0.35 eşiği: 5 pozitif, 4\'ü doğru; F1 = 0.889"\nassert en_iyi_esik(_g, _r, [0.7, 0.95]) == (0.7, 0.667), "0.7: precision 1, recall 0.5 → F1 0.667"\nassert en_iyi_esik([0, 1], [0.2, 0.8], [0.5, 0.3]) == (0.3, 1.0), "eşitlikte küçük eşik seçilmeli"\n',
      hints: [
        'Eşikleri sırala, her birinde F1 hesapla.',
        'Yalnızca kesin büyük (>) F1\'de güncelle; sıralı gezdiğin için eşitlikte küçük eşik kalır.'
      ],
      why: 'F1\'i maksimize eden eşik, precision ve recall\'ın ikisine eşit önem verdiğinde iyi bir başlangıçtır. Gerçek kararlarda ise maliyetler eşit olmadığı için maliyet tabanlı eşik (meydan okuma görevi) daha doğrudur.' },
    { t: 'code',
      stage: 'Kendin yaz',
      id: 'ml-regresyon-siniflandirma-7',
      diff: 2,
      q: '<p><code>agirlik_etkisi(X_tr, y_tr, X_te, y_te)</code> fonksiyonu yaz: <code>LogisticRegression(max_iter=1000)</code> modelini bir kez <code>class_weight</code> olmadan, bir kez <code>class_weight="balanced"</code> ile eğitsin; her biri için test recall ve precision değerlerini 3 basamakla <code>{"normal": (recall, precision), "dengeli": (recall, precision)}</code> biçiminde döndürsün.</p>',
      start: 'import numpy as np\n\n\ndef kredi_verisi(n=2000, seed=0):\n    """Ilgaz Bank kurgusal kredi verisi: gelir (bin TL), borç oranı, gecikme sayısı, yaş."""\n    rng = np.random.default_rng(seed)\n    gelir = rng.normal(35, 12, n).clip(8, None)\n    borc_orani = rng.uniform(0, 0.9, n)\n    gecikme = rng.poisson(0.6, n)\n    yas = rng.integers(21, 66, n)\n    logit = -4.3 + 3.0 * borc_orani + 0.9 * gecikme - 0.05 * (gelir - 35)\n    y = (rng.random(n) < 1 / (1 + np.exp(-logit))).astype(int)\n    return np.column_stack([gelir, borc_orani, gecikme, yas]), y\n\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.metrics import precision_score, recall_score\n\n\ndef agirlik_etkisi(X_tr, y_tr, X_te, y_te):\n    pass\n',
      sol: 'import numpy as np\n\n\ndef kredi_verisi(n=2000, seed=0):\n    """Ilgaz Bank kurgusal kredi verisi: gelir (bin TL), borç oranı, gecikme sayısı, yaş."""\n    rng = np.random.default_rng(seed)\n    gelir = rng.normal(35, 12, n).clip(8, None)\n    borc_orani = rng.uniform(0, 0.9, n)\n    gecikme = rng.poisson(0.6, n)\n    yas = rng.integers(21, 66, n)\n    logit = -4.3 + 3.0 * borc_orani + 0.9 * gecikme - 0.05 * (gelir - 35)\n    y = (rng.random(n) < 1 / (1 + np.exp(-logit))).astype(int)\n    return np.column_stack([gelir, borc_orani, gecikme, yas]), y\n\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.metrics import precision_score, recall_score\n\n\ndef agirlik_etkisi(X_tr, y_tr, X_te, y_te):\n    sonuc = {}\n    for ad, cw in [("normal", None), ("dengeli", "balanced")]:\n        tahmin = LogisticRegression(max_iter=1000, class_weight=cw).fit(X_tr, y_tr).predict(X_te)\n        sonuc[ad] = (\n            round(float(recall_score(y_te, tahmin)), 3),\n            round(float(precision_score(y_te, tahmin, zero_division=0)), 3),\n        )\n    return sonuc\n',
      tests: '\nfrom sklearn.model_selection import train_test_split as _tts\n_X, _y = kredi_verisi()\n_a, _b, _c, _d = _tts(_X, _y, test_size=0.25, random_state=0, stratify=_y)\nfrom sklearn.linear_model import LogisticRegression as _LR\nfrom sklearn.metrics import recall_score as _rec\n_s = agirlik_etkisi(_a, _c, _b, _d)\nassert set(_s) == {"normal", "dengeli"}, "iki anahtar: normal, dengeli"\n_p = _LR(max_iter=1000, class_weight="balanced").fit(_a, _c).predict(_b)\nassert _s["dengeli"][0] == round(float(_rec(_d, _p)), 3), "dengeli modelin recall değeri yanlış"\nassert _s["dengeli"][0] > _s["normal"][0], "balanced ağırlık recall\'ı artırmalı"\nassert _s["dengeli"][1] < _s["normal"][1], "bedeli: precision düşer"\n',
      hints: [
        'İki ayarı bir liste üzerinden dön: [("normal", None), ("dengeli", "balanced")].',
        'recall_score ve precision_score\'a önce y_te, sonra tahmin ver.'
      ],
      why: 'class_weight="balanced" azınlık sınıfındaki hataları sınıf frekansının tersiyle ağırlıklandırır; model temerrüdü kaçırmaktan daha çok "korkar". Sonuç recall artışı ve precision düşüşüdür; bu ödünleşimi sayılarla göstermek karar vericinin işini kolaylaştırır.' },
    { t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      id: 'ml-regresyon-siniflandirma-8',
      diff: 2,
      q: '<p>Model raporundaki ROC-AUC değeri, aynı modelin dashboard\'daki değerinden belirgin biçimde düşük çıkıyor. <code>model_auc(model, X_te, y_te)</code> fonksiyonundaki <b>hatayı bul ve düzelt.</b></p>',
      start: 'import numpy as np\n\n\ndef kredi_verisi(n=2000, seed=0):\n    """Ilgaz Bank kurgusal kredi verisi: gelir (bin TL), borç oranı, gecikme sayısı, yaş."""\n    rng = np.random.default_rng(seed)\n    gelir = rng.normal(35, 12, n).clip(8, None)\n    borc_orani = rng.uniform(0, 0.9, n)\n    gecikme = rng.poisson(0.6, n)\n    yas = rng.integers(21, 66, n)\n    logit = -4.3 + 3.0 * borc_orani + 0.9 * gecikme - 0.05 * (gelir - 35)\n    y = (rng.random(n) < 1 / (1 + np.exp(-logit))).astype(int)\n    return np.column_stack([gelir, borc_orani, gecikme, yas]), y\n\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.metrics import roc_auc_score\n\n\ndef model_auc(model, X_te, y_te):\n    tahmin = model.predict(X_te)\n    return round(float(roc_auc_score(y_te, tahmin)), 3)\n',
      sol: 'import numpy as np\n\n\ndef kredi_verisi(n=2000, seed=0):\n    """Ilgaz Bank kurgusal kredi verisi: gelir (bin TL), borç oranı, gecikme sayısı, yaş."""\n    rng = np.random.default_rng(seed)\n    gelir = rng.normal(35, 12, n).clip(8, None)\n    borc_orani = rng.uniform(0, 0.9, n)\n    gecikme = rng.poisson(0.6, n)\n    yas = rng.integers(21, 66, n)\n    logit = -4.3 + 3.0 * borc_orani + 0.9 * gecikme - 0.05 * (gelir - 35)\n    y = (rng.random(n) < 1 / (1 + np.exp(-logit))).astype(int)\n    return np.column_stack([gelir, borc_orani, gecikme, yas]), y\n\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.metrics import roc_auc_score\n\n\ndef model_auc(model, X_te, y_te):\n    risk = model.predict_proba(X_te)[:, 1]\n    return round(float(roc_auc_score(y_te, risk)), 3)\n',
      tests: '\nfrom sklearn.model_selection import train_test_split as _tts\n_X, _y = kredi_verisi()\n_a, _b, _c, _d = _tts(_X, _y, test_size=0.25, random_state=0, stratify=_y)\n_m = LogisticRegression(max_iter=1000).fit(_a, _c)\n_ref = round(float(roc_auc_score(_d, _m.predict_proba(_b)[:, 1])), 3)\n_r = model_auc(_m, _b, _d)\nassert _r == _ref, f"AUC olasılıklarla hesaplanmalı: {_ref} bekleniyordu, gelen {_r}"\n',
      hints: [
        'AUC tüm eşiklerdeki sıralamayı ölçer; 0/1 etiketlerde yalnızca tek bir eşik kalır.',
        'model.predict_proba(X_te)[:, 1] kullan.'
      ],
      why: 'predict() 0.5 eşiğini uygulayıp sürekli skoru iki değere ezer; AUC bu durumda tek noktalı bir ROC eğrisinden hesaplanır ve gerçek sıralama gücünü küçümser. AUC, average_precision gibi sıralama metrikleri her zaman olasılık ya da skorla çağrılır.' },
    { t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      id: 'ml-regresyon-siniflandirma-9',
      diff: 2,
      q: '<p>Risk ekibi <code>riskli_basvurular(model, X, esik)</code> fonksiyonunun "neredeyse herkesi riskli" işaretlediğinden şikâyetçi. Fonksiyon temerrüt olasılığı (sınıf 1) eşik ve üzeri olan satırların indekslerini liste olarak döndürmeli. <b>Hatayı bul ve düzelt.</b></p>',
      start: 'import numpy as np\n\n\ndef kredi_verisi(n=2000, seed=0):\n    """Ilgaz Bank kurgusal kredi verisi: gelir (bin TL), borç oranı, gecikme sayısı, yaş."""\n    rng = np.random.default_rng(seed)\n    gelir = rng.normal(35, 12, n).clip(8, None)\n    borc_orani = rng.uniform(0, 0.9, n)\n    gecikme = rng.poisson(0.6, n)\n    yas = rng.integers(21, 66, n)\n    logit = -4.3 + 3.0 * borc_orani + 0.9 * gecikme - 0.05 * (gelir - 35)\n    y = (rng.random(n) < 1 / (1 + np.exp(-logit))).astype(int)\n    return np.column_stack([gelir, borc_orani, gecikme, yas]), y\n\nimport numpy as np\nfrom sklearn.linear_model import LogisticRegression\n\n\ndef riskli_basvurular(model, X, esik):\n    olasilik = model.predict_proba(X)\n    risk = olasilik[:, 0]\n    return np.where(risk >= esik)[0].tolist()\n',
      sol: 'import numpy as np\n\n\ndef kredi_verisi(n=2000, seed=0):\n    """Ilgaz Bank kurgusal kredi verisi: gelir (bin TL), borç oranı, gecikme sayısı, yaş."""\n    rng = np.random.default_rng(seed)\n    gelir = rng.normal(35, 12, n).clip(8, None)\n    borc_orani = rng.uniform(0, 0.9, n)\n    gecikme = rng.poisson(0.6, n)\n    yas = rng.integers(21, 66, n)\n    logit = -4.3 + 3.0 * borc_orani + 0.9 * gecikme - 0.05 * (gelir - 35)\n    y = (rng.random(n) < 1 / (1 + np.exp(-logit))).astype(int)\n    return np.column_stack([gelir, borc_orani, gecikme, yas]), y\n\nimport numpy as np\nfrom sklearn.linear_model import LogisticRegression\n\n\ndef riskli_basvurular(model, X, esik):\n    olasilik = model.predict_proba(X)\n    sutun = list(model.classes_).index(1)\n    risk = olasilik[:, sutun]\n    return np.where(risk >= esik)[0].tolist()\n',
      tests: '\nfrom sklearn.model_selection import train_test_split as _tts\n_X, _y = kredi_verisi()\n_a, _b, _c, _d = _tts(_X, _y, test_size=0.25, random_state=0, stratify=_y)\n_m = LogisticRegression(max_iter=1000).fit(_a, _c)\n_p = _m.predict_proba(_b)[:, 1]\n_ref = np.where(_p >= 0.3)[0].tolist()\n_r = riskli_basvurular(_m, _b, 0.3)\nassert _r == _ref, f"P(temerrüt) >= 0.3 olan {len(_ref)} başvuru bekleniyordu; gelen {len(_r)}"\nassert len(_r) < len(_b) / 2, "riskli sayılanlar azınlık olmalı"\n',
      hints: [
        'predict_proba sütunları model.classes_ sırasındadır: [0, 1].',
        'Temerrüt (1) olasılığı ikinci sütun: [:, 1]. En sağlamı list(model.classes_).index(1).'
      ],
      why: '[:, 0] "ödeme" olasılığıdır; çoğu müşteri ödediği için bu değer yüksektir ve neredeyse herkes eşiği geçer. Sütunu classes_ üzerinden bulmak, etiketler farklı sıralandığında bile doğru sütunu seçmeyi garanti eder.' },
    { t: 'code',
      stage: 'Meydan okuma',
      id: 'ml-regresyon-siniflandirma-10',
      diff: 3,
      q: '<p>Ilgaz Bank\'ta kaçırılan bir temerrüt (FN) ortalama <code>fn_maliyet</code> TL, yanlış reddedilen iyi müşteri (FP) <code>fp_maliyet</code> TL kayba yol açıyor. <code>maliyet_esigi(y_gercek, risk, fn_maliyet, fp_maliyet)</code> fonksiyonu yaz: aday eşikler 0.05, 0.10, ..., 0.95 olsun (<code>np.round(np.arange(0.05, 0.96, 0.05), 2)</code>); her eşikte toplam maliyeti (<code>FN × fn_maliyet + FP × fp_maliyet</code>) hesapla; en düşük maliyetli eşiği ve maliyeti <code>(esik, maliyet)</code> olarak döndür. Eşitlikte <b>büyük eşik</b> seçilsin (daha az müşteri reddedilir). Eşik <code>float</code>, maliyet <code>int</code> olsun.</p>',
      start: 'import numpy as np\n\n\ndef maliyet_esigi(y_gercek, risk, fn_maliyet, fp_maliyet):\n    pass\n',
      sol: 'import numpy as np\n\n\ndef maliyet_esigi(y_gercek, risk, fn_maliyet, fp_maliyet):\n    y = np.asarray(y_gercek)\n    r = np.asarray(risk)\n    en_iyi = None\n    for e in np.round(np.arange(0.05, 0.96, 0.05), 2):\n        tahmin = r >= e\n        fn = int(np.sum((y == 1) & ~tahmin))\n        fp = int(np.sum((y == 0) & tahmin))\n        maliyet = fn * fn_maliyet + fp * fp_maliyet\n        if en_iyi is None or maliyet <= en_iyi[1]:\n            en_iyi = (float(e), int(maliyet))\n    return en_iyi\n',
      tests: '_g = [0, 0, 0, 0, 1, 1, 1, 1]\n_r = [0.1, 0.3, 0.6, 0.2, 0.9, 0.55, 0.4, 0.8]\n_s = maliyet_esigi(_g, _r, 10000, 1000)\nassert _s == (0.4, 1000), f"FN pahalıyken 0.4 eşiği tüm temerrütleri yakalar, yalnız 1 FP: (0.4, 1000); gelen {_s}"\n_s2 = maliyet_esigi(_g, _r, 1000, 10000)\nassert _s2 == (0.8, 2000), f"FP pahalıyken eşik yükselir: 0.65-0.80 arası eşikler 2000 maliyetlidir, eşitlikte en büyüğü (0.8) seçilir; gelen {_s2}"\nassert isinstance(_s[0], float) and type(_s[1]) is int, "eşik float, maliyet int olmalı"\n_s3 = maliyet_esigi([0, 0, 0], [0.2, 0.5, 0.9], 5000, 100)\nassert _s3 == (0.95, 0), "hiç temerrüt yoksa en büyük eşik (0.95) sıfır maliyetle seçilir"\n',
      hints: [
        'Boolean maske: tahmin = r >= e; FN = (y == 1) & ~tahmin, FP = (y == 0) & tahmin.',
        'Eşitlikte büyük eşik: eşikleri artan gezip maliyet &lt;= en iyi olduğunda güncelle.',
        'np.round ile oluşturduğun eşikleri float(e) ile Python sayısına çevir.'
      ],
      why: 'Eşiği iş maliyetine bağlamak, modeli karar sistemine dönüştürmenin en somut adımıdır. FN pahalıysa eşik düşer (daha çok red), FP pahalıysa yükselir. Aynı model, farklı ürünlerde (kredi kartı, konut kredisi) farklı eşiklerle kullanılabilir.' },
    { t: 'code',
      stage: 'Mini proje',
      id: 'ml-regresyon-siniflandirma-11',
      diff: 3,
      q: '<p>Kredi komitesi için <code>kredi_raporu(X_tr, y_tr, X_te, y_te, esik)</code> fonksiyonu yaz. <code>LogisticRegression(max_iter=1000, class_weight="balanced")</code> eğit; temerrüt olasılığına <code>esik</code> uygula ve şu sözlüğü döndür:</p><ul><li><code>"auc"</code>: test ROC-AUC (3 basamak)</li><li><code>"karisiklik"</code>: karışıklık matrisi, iç içe Python listesi</li><li><code>"recall"</code>, <code>"precision"</code>: 3 basamak</li><li><code>"onay_orani"</code>: riskli sayılmayan (onaylanan) başvuruların oranı, 3 basamak</li><li><code>"en_riskli"</code>: en yüksek temerrüt olasılığına sahip 3 test satırının indeksi, olasılığa göre azalan</li></ul>',
      start: 'import numpy as np\n\n\ndef kredi_verisi(n=2000, seed=0):\n    """Ilgaz Bank kurgusal kredi verisi: gelir (bin TL), borç oranı, gecikme sayısı, yaş."""\n    rng = np.random.default_rng(seed)\n    gelir = rng.normal(35, 12, n).clip(8, None)\n    borc_orani = rng.uniform(0, 0.9, n)\n    gecikme = rng.poisson(0.6, n)\n    yas = rng.integers(21, 66, n)\n    logit = -4.3 + 3.0 * borc_orani + 0.9 * gecikme - 0.05 * (gelir - 35)\n    y = (rng.random(n) < 1 / (1 + np.exp(-logit))).astype(int)\n    return np.column_stack([gelir, borc_orani, gecikme, yas]), y\n\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.metrics import confusion_matrix, precision_score, recall_score, roc_auc_score\n\n\ndef kredi_raporu(X_tr, y_tr, X_te, y_te, esik):\n    pass\n',
      sol: 'import numpy as np\n\n\ndef kredi_verisi(n=2000, seed=0):\n    """Ilgaz Bank kurgusal kredi verisi: gelir (bin TL), borç oranı, gecikme sayısı, yaş."""\n    rng = np.random.default_rng(seed)\n    gelir = rng.normal(35, 12, n).clip(8, None)\n    borc_orani = rng.uniform(0, 0.9, n)\n    gecikme = rng.poisson(0.6, n)\n    yas = rng.integers(21, 66, n)\n    logit = -4.3 + 3.0 * borc_orani + 0.9 * gecikme - 0.05 * (gelir - 35)\n    y = (rng.random(n) < 1 / (1 + np.exp(-logit))).astype(int)\n    return np.column_stack([gelir, borc_orani, gecikme, yas]), y\n\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.metrics import confusion_matrix, precision_score, recall_score, roc_auc_score\n\n\ndef kredi_raporu(X_tr, y_tr, X_te, y_te, esik):\n    model = LogisticRegression(max_iter=1000, class_weight="balanced").fit(X_tr, y_tr)\n    risk = model.predict_proba(X_te)[:, 1]\n    tahmin = (risk >= esik).astype(int)\n    return {\n        "auc": round(float(roc_auc_score(y_te, risk)), 3),\n        "karisiklik": confusion_matrix(y_te, tahmin, labels=[0, 1]).tolist(),\n        "recall": round(float(recall_score(y_te, tahmin, zero_division=0)), 3),\n        "precision": round(float(precision_score(y_te, tahmin, zero_division=0)), 3),\n        "onay_orani": round(float(1 - tahmin.mean()), 3),\n        "en_riskli": np.argsort(-risk)[:3].tolist(),\n    }\n',
      tests: '\nfrom sklearn.model_selection import train_test_split as _tts\n_X, _y = kredi_verisi()\n_a, _b, _c, _d = _tts(_X, _y, test_size=0.25, random_state=0, stratify=_y)\nfrom sklearn.linear_model import LogisticRegression as _LR\n_m = _LR(max_iter=1000, class_weight="balanced").fit(_a, _c)\n_risk = _m.predict_proba(_b)[:, 1]\n_r = kredi_raporu(_a, _c, _b, _d, 0.5)\nassert set(_r) == {"auc", "karisiklik", "recall", "precision", "onay_orani", "en_riskli"}, "altı anahtar olmalı"\nassert _r["auc"] == round(float(roc_auc_score(_d, _risk)), 3), "AUC olasılıkla hesaplanmalı"\n_t = (_risk >= 0.5).astype(int)\nassert _r["karisiklik"] == confusion_matrix(_d, _t).tolist(), "karışıklık matrisi .tolist() ile iç içe liste olmalı"\nassert sum(map(sum, _r["karisiklik"])) == len(_d), "matris tüm test örneklerini kapsamalı"\nassert _r["onay_orani"] == round(float(1 - _t.mean()), 3), "onay oranı = riskli sayılmayanların oranı"\nassert _r["en_riskli"] == np.argsort(-_risk)[:3].tolist(), "en riskli 3 indeks olasılığa göre azalan sırada"\n_r2 = kredi_raporu(_a, _c, _b, _d, 0.8)\nassert _r2["onay_orani"] > _r["onay_orani"], "eşik yükselince onay oranı artmalı"\n',
      hints: [
        'risk = model.predict_proba(X_te)[:, 1]; tahmin = (risk >= esik).astype(int)',
        'confusion_matrix(...).tolist(); onay_orani = 1 - tahmin.mean()',
        'En yüksek üç: np.argsort(-risk)[:3].tolist()'
      ],
      why: 'Komite raporu tek bir doğruluk sayısı değil, karar sonuçlarıdır: kaç kötü krediyi yakaladık (recall), reddettiklerimizin ne kadarı haklıydı (precision), iş hacminin ne kadarını onayladık. Eşiği parametre yapmak, komitenin farklı senaryoları anında karşılaştırmasını sağlar.' }
  ],
  faq: [
    { q: 'Hangi modelle başlamalıyım?',
      a: 'Regresyonda LinearRegression/Ridge, sınıflandırmada LogisticRegression ile taban çizgi kur. Sonra HistGradientBoosting dene. Fark küçükse yorumlanabilir modeli tercih et; büyükse karmaşık modeli açıklama araçlarıyla (permutation importance, SHAP) destekle.' },
    { q: 'LogisticRegression ConvergenceWarning veriyor, ne yapmalıyım?',
      a: 'Özellikler farklı ölçeklerdeyse optimizasyon yavaş yakınsar. En doğru çözüm StandardScaler ile ölçeklemek (bir sonraki derste Pipeline içinde); geçici çözüm max_iter değerini artırmak.' },
    { q: 'ROC-AUC mı, PR-AUC mı?',
      a: 'Pozitif sınıf çok nadirse (%1 dolandırıcılık gibi) ROC-AUC iyimser görünebilir; çünkü çok sayıdaki negatifler yanlış alarm oranını küçük tutar. Bu durumda average_precision_score (PR-AUC) azınlık sınıfındaki başarıyı daha dürüst gösterir.' },
    { q: 'Oversampling (SMOTE) kullanmalı mıyım?',
      a: 'Çoğu zaman önce class_weight ve eşik ayarı yeterlidir. SMOTE gibi örnekleme yöntemleri imbalanced-learn kütüphanesindedir; kullanırsan yalnızca eğitim verisine ve çapraz doğrulama katlarının içinde uygula, yoksa sızıntı olur.' },
    { q: 'Özellik önemi yüksek olan özellik hedefi mi etkiliyor?',
      a: 'Hayır, yalnızca modelin onu tahmin için kullandığını gösterir. Nedensellik için deney (A/B testi) ya da nedensel çıkarım yöntemleri gerekir.' }
  ],
  mistakes: [
    { bad: 'roc_auc_score(y_test, model.predict(X_test))',
      good: 'roc_auc_score(y_test, model.predict_proba(X_test)[:, 1])',
      why: 'AUC sıralama metriğidir; 0/1 etiketler sıralama bilgisini yok eder.' },
    { bad: 'risk = model.predict_proba(X)[:, 0]',
      good: 'risk = model.predict_proba(X)[:, 1]',
      why: 'İkili problemde pozitif sınıf (1) ikinci sütundur; ilk sütun negatif sınıfın olasılığıdır.' },
    { bad: 'print("Doğruluk %95, model harika")  # temerrüt oranı %5',
      good: 'print(classification_report(y_test, tahmin))',
      why: 'Dengesiz veride doğruluk yanıltır; sınıf bazında precision ve recall\'a bak.' },
    { bad: 'precision_score(tahmin, y_test)',
      good: 'precision_score(y_test, tahmin)',
      why: 'sklearn metriklerinde argüman sırası (y_true, y_pred) dir; ters verince precision ile recall yer değiştirir.' },
    { bad: '# eşiği test setinde F1\'i maksimize ederek seç ve aynı testte raporla',
      good: '# eşiği doğrulama setinde seç, test setinde bir kez raporla',
      why: 'Eşik de bir hiperparametredir; test setinde seçmek skoru iyimser yapar.' }
  ]
});
})(window);
