/* Kesit Python — ileri: ml-pipeline-degerlendirme */
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push({
  id: 'ml-pipeline-degerlendirme',
  lv: 'ileri',
  mod: 'Makine Öğrenmesi',
  min: 65,
  needs: ['scikit-learn', 'pandas', 'numpy'],
  title: 'Ön işleme, pipeline ve model değerlendirme',
  sum: 'StandardScaler, OneHotEncoder, SimpleImputer ve ColumnTransformer ile ön işleme; Pipeline ile sızıntısız akış; çapraz doğrulama, GridSearchCV/RandomizedSearchCV, öğrenme eğrisi, joblib ile kaydetme ve model kartı.',
  goals: [
    'Sayısal ve kategorik sütunlara ColumnTransformer ile doldurma, ölçekleme ve one-hot kodlama uygulayabilirim.',
    'Ön işleme ve modeli tek bir Pipeline\'da birleştirip veri sızıntısını yapısal olarak önleyebilirim.',
    'KFold/StratifiedKFold ve cross_val_score ile performansı ortalama ± std olarak raporlayabilirim.',
    'GridSearchCV ve RandomizedSearchCV ile adım__parametre sözdizimini kullanarak hiperparametre arayabilirim.',
    'Modeli joblib ile kaydedip yükleyebilir, öğrenme eğrisini yorumlayıp bir model kartı hazırlayabilirim.'
  ],
  body: `
<h2>Model kodunun %80'i model değildir</h2>
<p>Önceki iki derste veriler hep tertemiz sayılardı. Gerçekte Ilgaz Bank'ın müşteri tablosunda yaş bazen boş, şehir metin, segment kategorik, bakiye 100 TL ile 2 milyon TL arasında değişiyor. Modeller metni anlamaz, boş hücrede durur, ölçek farkından etkilenir. Bu yüzden her projede bir <b>ön işleme</b> (preprocessing) katmanı vardır: eksik doldurma, ölçekleme, kategorik kodlama. Bu derste bu adımları scikit-learn'ün <b>Pipeline</b> ve <b>ColumnTransformer</b> yapılarıyla tek bir nesneye bağlamayı, modeli <b>çapraz doğrulamayla</b> dürüstçe ölçmeyi, hiperparametreleri <b>sistematik</b> aramayı, modeli <b>kaydetmeyi</b> ve sonuçları bir <b>model kartıyla</b> raporlamayı öğreneceksin.</p>
<p>Senaryo: Ilgaz Bank, önümüzdeki üç ayda hesabını kapatacak (churn) müşterileri önceden bulup elde tutma kampanyası yapmak istiyor. Veri kurgusaldır ve tohumla üretilir.</p>
<pre class="py">import numpy as np
import pandas as pd


def churn_verisi(n=600, seed=1):
    """Ilgaz Bank kurgusal müşteri kaybı (churn) verisi; eksik değerler içerir."""
    rng = np.random.default_rng(seed)
    yas = rng.integers(18, 75, n).astype(float)
    bakiye = rng.gamma(2, 15000, n)
    urun = rng.integers(1, 5, n)
    sikayet = rng.poisson(0.5, n)
    sehir = rng.choice(["İstanbul", "Ankara", "İzmir", "Bursa"], n)
    segment = rng.choice(["Bireysel", "Premium", "KOBİ"], n, p=[0.6, 0.25, 0.15])
    logit = -1.2 + 0.9 * sikayet - 0.6 * (urun - 2) + 0.03 * (yas - 45) - 0.8 * (segment == "Premium")
    y = (rng.random(n) &lt; 1 / (1 + np.exp(-logit))).astype(int)
    yas[rng.random(n) &lt; 0.08] = np.nan
    bakiye[rng.random(n) &lt; 0.05] = np.nan
    X = pd.DataFrame({"yas": yas, "bakiye": bakiye.round(2), "urun": urun, "sikayet": sikayet,
                      "sehir": sehir, "segment": segment})
    return X, y

X, y = churn_verisi()
print(X.shape, "kayıp oranı:", round(y.mean(), 3))
print(X.head(3))
print(X.isna().sum().to_dict())
</pre>

<h2>Dönüştürücüler: ölçek, kodlama, doldurma</h2>
<p>Dönüştürücüler (transformer) <code>fit</code> ile veriden bir şey <b>öğrenir</b> (ortalama, medyan, kategori listesi) ve <code>transform</code> ile bunu uygular. <code>fit_transform</code> ikisini birden yapar. Kritik kural: <b>fit yalnızca eğitim verisinde</b> yapılır; test verisine yalnızca <code>transform</code> uygulanır.</p>
<div class="tbl-wrap"><table>
<tr><th>Dönüştürücü</th><th>Ne öğrenir</th><th>Ne yapar</th><th>Ne zaman</th></tr>
<tr><td><code>StandardScaler</code></td><td>Ortalama ve standart sapma</td><td>(x − ort) / std; ortalama 0, std 1</td><td>Doğrusal modeller, KNN, SVM</td></tr>
<tr><td><code>MinMaxScaler</code></td><td>Min ve max</td><td>0-1 aralığına sıkıştırır</td><td>Sınırlı aralık gereken durumlar, sinir ağları</td></tr>
<tr><td><code>OneHotEncoder</code></td><td>Kategori listesi</td><td>Her kategoriye 0/1 sütun</td><td>Sırasız kategoriler (şehir, segment)</td></tr>
<tr><td><code>OrdinalEncoder</code></td><td>Kategori listesi</td><td>Kategoriyi tam sayıya çevirir</td><td>Sıralı kategoriler, ağaç modelleri</td></tr>
<tr><td><code>SimpleImputer</code></td><td>Ortalama/medyan/en sık değer</td><td>Eksikleri doldurur</td><td>Eksik değer içeren her sütun</td></tr>
</table></div>
<pre class="py">import numpy as np
import pandas as pd
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import MinMaxScaler, OneHotEncoder, StandardScaler

bakiye = np.array([[1000.0], [5000.0], [9000.0]])
sc = StandardScaler().fit(bakiye)
print(sc.mean_, sc.scale_.round(1))
print(sc.transform([[5000.0], [13000.0]]).ravel().round(3))
print(MinMaxScaler().fit_transform(bakiye).ravel())

sehir = pd.DataFrame({"sehir": ["İzmir", "Ankara", "İzmir"]})
enc = OneHotEncoder(handle_unknown="ignore", sparse_output=False).fit(sehir)
print(enc.get_feature_names_out().tolist())
print(enc.transform(pd.DataFrame({"sehir": ["Ankara", "Van"]})).tolist())   # Van hiç görülmedi

yas = np.array([[30.0], [np.nan], [50.0], [41.0]])
print(SimpleImputer(strategy="median").fit_transform(yas).ravel())
</pre>
<div class="warn"><b>handle_unknown="ignore" neden şart?</b>Canlıda yarın "Van" şubesinden ilk müşteri geldiğinde, varsayılan OneHotEncoder eğitimde görmediği kategori için <code>ValueError</code> verir ve tahmin servisi çöker. <code>handle_unknown="ignore"</code> bilinmeyen kategoriyi tüm sütunları 0 olan bir satırla temsil eder. <code>sparse_output=False</code> ise sonucu seyrek matris yerine normal numpy dizisi yapar (sklearn 1.2 öncesinde adı <code>sparse</code> idi).</div>

<h2>ColumnTransformer ve Pipeline</h2>
<p><b>ColumnTransformer</b> farklı sütun gruplarına farklı işlem uygular: sayısallara doldur + ölçekle, kategoriklere doldur + kodla. <b>Pipeline</b> ise adımları sıraya dizer ve son adım olarak modeli ekler. Ortaya çıkan nesne bir model gibi davranır: <code>fit</code>, <code>predict</code>, <code>score</code>. Her adıma bir ad verirsin; bu adlar hiperparametre ararken <code>adim__parametre</code> biçiminde kullanılır.</p>
<pre class="py">import numpy as np
import pandas as pd


def churn_verisi(n=600, seed=1):
    """Ilgaz Bank kurgusal müşteri kaybı (churn) verisi; eksik değerler içerir."""
    rng = np.random.default_rng(seed)
    yas = rng.integers(18, 75, n).astype(float)
    bakiye = rng.gamma(2, 15000, n)
    urun = rng.integers(1, 5, n)
    sikayet = rng.poisson(0.5, n)
    sehir = rng.choice(["İstanbul", "Ankara", "İzmir", "Bursa"], n)
    segment = rng.choice(["Bireysel", "Premium", "KOBİ"], n, p=[0.6, 0.25, 0.15])
    logit = -1.2 + 0.9 * sikayet - 0.6 * (urun - 2) + 0.03 * (yas - 45) - 0.8 * (segment == "Premium")
    y = (rng.random(n) &lt; 1 / (1 + np.exp(-logit))).astype(int)
    yas[rng.random(n) &lt; 0.08] = np.nan
    bakiye[rng.random(n) &lt; 0.05] = np.nan
    X = pd.DataFrame({"yas": yas, "bakiye": bakiye.round(2), "urun": urun, "sikayet": sikayet,
                      "sehir": sehir, "segment": segment})
    return X, y

from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler


def on_isleyici(sayisal, kategorik):
    sayi_hatti = Pipeline([
        ("doldur", SimpleImputer(strategy="median")),
        ("olcek", StandardScaler()),
    ])
    kat_hatti = Pipeline([
        ("doldur", SimpleImputer(strategy="most_frequent")),
        ("kodla", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
    ])
    return ColumnTransformer([
        ("sayisal", sayi_hatti, sayisal),
        ("kategorik", kat_hatti, kategorik),
    ])

from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score

X, y = churn_verisi()
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, random_state=0, stratify=y)

model = Pipeline([
    ("on_isleme", on_isleyici(["yas", "bakiye", "urun", "sikayet"], ["sehir", "segment"])),
    ("model", LogisticRegression(max_iter=1000)),
])
model.fit(X_tr, y_tr)                       # tüm fit'ler yalnızca eğitim verisinde
risk = model.predict_proba(X_te)[:, 1]      # test yalnızca transform edilir
print("Test ROC-AUC:", round(roc_auc_score(y_te, risk), 3))
print(model.named_steps["on_isleme"].get_feature_names_out()[:6].tolist())
print(model.get_params()["model__C"])
</pre>
<p>Pipeline'ın üç büyük kazancı var: (1) <b>sızıntıyı önler</b>, çünkü çapraz doğrulamada her katta dönüştürücüler yalnızca o katın eğitim kısmında fit edilir; (2) <b>canlıya tek nesne</b> gider, ön işlemeyi ayrıca kopyalamazsın; (3) ön işleme ayarları da hiperparametre gibi aranabilir (<code>on_isleme__sayisal__doldur__strategy</code>).</p>

<h2>Çapraz doğrulama</h2>
<p>Tek bir eğitim/test bölmesi şansa bağlıdır: başka bir <code>random_state</code> ile skor ±0.03 oynayabilir. <b>k-katlı çapraz doğrulama</b> (k-fold cross-validation) veriyi k parçaya böler; her seferinde bir parçayı doğrulama, kalanını eğitim yapar ve k skor üretir. Ortalaması daha güvenilir bir tahmin, standart sapması ise <b>belirsizlik</b> ölçüsüdür.</p>
<div class="tbl-wrap"><table>
<tr><th>Bölücü</th><th>Ne yapar</th><th>Ne zaman</th></tr>
<tr><td><code>KFold(n_splits, shuffle, random_state)</code></td><td>Düz k parça</td><td>Regresyon</td></tr>
<tr><td><code>StratifiedKFold</code></td><td>Her katta sınıf oranını korur</td><td>Sınıflandırma (varsayılan seçim)</td></tr>
<tr><td><code>GroupKFold</code></td><td>Aynı gruptaki (müşteri) satırları aynı katta tutar</td><td>Bir müşterinin birden fazla satırı varsa</td></tr>
<tr><td><code>TimeSeriesSplit</code></td><td>Hep geçmişle eğitir, gelecekle doğrular</td><td>Zaman serisi</td></tr>
</table></div>
<pre class="py">import numpy as np
import pandas as pd


def churn_verisi(n=600, seed=1):
    """Ilgaz Bank kurgusal müşteri kaybı (churn) verisi; eksik değerler içerir."""
    rng = np.random.default_rng(seed)
    yas = rng.integers(18, 75, n).astype(float)
    bakiye = rng.gamma(2, 15000, n)
    urun = rng.integers(1, 5, n)
    sikayet = rng.poisson(0.5, n)
    sehir = rng.choice(["İstanbul", "Ankara", "İzmir", "Bursa"], n)
    segment = rng.choice(["Bireysel", "Premium", "KOBİ"], n, p=[0.6, 0.25, 0.15])
    logit = -1.2 + 0.9 * sikayet - 0.6 * (urun - 2) + 0.03 * (yas - 45) - 0.8 * (segment == "Premium")
    y = (rng.random(n) &lt; 1 / (1 + np.exp(-logit))).astype(int)
    yas[rng.random(n) &lt; 0.08] = np.nan
    bakiye[rng.random(n) &lt; 0.05] = np.nan
    X = pd.DataFrame({"yas": yas, "bakiye": bakiye.round(2), "urun": urun, "sikayet": sikayet,
                      "sehir": sehir, "segment": segment})
    return X, y

from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler


def on_isleyici(sayisal, kategorik):
    sayi_hatti = Pipeline([
        ("doldur", SimpleImputer(strategy="median")),
        ("olcek", StandardScaler()),
    ])
    kat_hatti = Pipeline([
        ("doldur", SimpleImputer(strategy="most_frequent")),
        ("kodla", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
    ])
    return ColumnTransformer([
        ("sayisal", sayi_hatti, sayisal),
        ("kategorik", kat_hatti, kategorik),
    ])

from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import StratifiedKFold, cross_val_score, cross_validate

X, y = churn_verisi()
pipe = Pipeline([
    ("on_isleme", on_isleyici(["yas", "bakiye", "urun", "sikayet"], ["sehir", "segment"])),
    ("model", LogisticRegression(max_iter=1000)),
])
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
skorlar = cross_val_score(pipe, X, y, cv=cv, scoring="roc_auc")
print(skorlar.round(3), "ort:", round(skorlar.mean(), 3), "std:", round(skorlar.std(), 3))

detay = cross_validate(pipe, X, y, cv=cv, scoring=["roc_auc", "recall"], return_train_score=True)
print("eğitim AUC:", detay["train_roc_auc"].mean().round(3), "doğrulama AUC:", detay["test_roc_auc"].mean().round(3))
</pre>
<div class="tip"><b>Sızıntıyı pipeline ile önlemek</b>Yanlış: <code>X_olcekli = StandardScaler().fit_transform(X)</code> deyip sonra <code>cross_val_score(model, X_olcekli, y)</code> çağırmak. Ölçekleyici tüm veriyi, yani doğrulama katlarını da görmüş olur. Doğru: ölçekleyiciyi pipeline'a koy ve pipeline'ı çapraz doğrula. Kural: <b>veriden bir şey öğrenen her adım</b> pipeline'ın içinde olmalı.</div>

<h2>Hiperparametre arama</h2>
<p><code>GridSearchCV</code> verdiğin tüm kombinasyonları dener, her biri için çapraz doğrulama yapar ve en iyisini seçer; sonunda en iyi ayarla tüm eğitim verisinde yeniden fit eder (<code>refit=True</code>). Kombinasyon sayısı hızla patlar (4 × 4 × 3 = 48 ayar × 5 kat = 240 eğitim). <code>RandomizedSearchCV</code> ise dağılımlardan <code>n_iter</code> kadar rastgele ayar dener; geniş arama uzaylarında aynı bütçeyle genellikle daha iyi sonuç bulur.</p>
<pre class="py">import numpy as np
import pandas as pd


def churn_verisi(n=600, seed=1):
    """Ilgaz Bank kurgusal müşteri kaybı (churn) verisi; eksik değerler içerir."""
    rng = np.random.default_rng(seed)
    yas = rng.integers(18, 75, n).astype(float)
    bakiye = rng.gamma(2, 15000, n)
    urun = rng.integers(1, 5, n)
    sikayet = rng.poisson(0.5, n)
    sehir = rng.choice(["İstanbul", "Ankara", "İzmir", "Bursa"], n)
    segment = rng.choice(["Bireysel", "Premium", "KOBİ"], n, p=[0.6, 0.25, 0.15])
    logit = -1.2 + 0.9 * sikayet - 0.6 * (urun - 2) + 0.03 * (yas - 45) - 0.8 * (segment == "Premium")
    y = (rng.random(n) &lt; 1 / (1 + np.exp(-logit))).astype(int)
    yas[rng.random(n) &lt; 0.08] = np.nan
    bakiye[rng.random(n) &lt; 0.05] = np.nan
    X = pd.DataFrame({"yas": yas, "bakiye": bakiye.round(2), "urun": urun, "sikayet": sikayet,
                      "sehir": sehir, "segment": segment})
    return X, y

from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler


def on_isleyici(sayisal, kategorik):
    sayi_hatti = Pipeline([
        ("doldur", SimpleImputer(strategy="median")),
        ("olcek", StandardScaler()),
    ])
    kat_hatti = Pipeline([
        ("doldur", SimpleImputer(strategy="most_frequent")),
        ("kodla", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
    ])
    return ColumnTransformer([
        ("sayisal", sayi_hatti, sayisal),
        ("kategorik", kat_hatti, kategorik),
    ])

from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import GridSearchCV, StratifiedKFold, train_test_split

X, y = churn_verisi()
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, random_state=0, stratify=y)
pipe = Pipeline([
    ("on_isleme", on_isleyici(["yas", "bakiye", "urun", "sikayet"], ["sehir", "segment"])),
    ("model", LogisticRegression(max_iter=1000)),
])
izgara = {
    "model__C": [0.01, 0.1, 1, 10],
    "model__class_weight": [None, "balanced"],
}
arama = GridSearchCV(pipe, izgara, cv=StratifiedKFold(5, shuffle=True, random_state=0), scoring="roc_auc")
arama.fit(X_tr, y_tr)
print("en iyi:", arama.best_params_)
print("CV AUC:", round(arama.best_score_, 3))
print("Test AUC:", round(arama.score(X_te, y_te), 3))   # scoring="roc_auc" ile ölçülür
</pre>
<p><code>best_score_</code> çapraz doğrulama ortalamasıdır, test skoru değildir. Seçim süreci bu skorları kullandığı için hafif iyimserdir; asıl raporlayacağın sayı, aramaya hiç girmemiş test setindeki skordur.</p>

<h2>Öğrenme eğrisi mantığı</h2>
<p>"Daha fazla veri toplamaya değer mi?" sorusunun cevabı <b>öğrenme eğrisidir</b> (learning curve): eğitim verisi miktarını artırarak eğitim ve doğrulama skorlarını çizersin. İki eğri birbirine yaklaşıp düz bir platoya oturduysa daha çok veri pek yardım etmez; daha zengin özellik ya da daha güçlü model gerekir. Doğrulama skoru hâlâ yükseliyor ve eğitim skoruyla arasında büyük boşluk varsa (yüksek varyans), daha fazla veri işe yarar. <code>sklearn.model_selection.learning_curve</code> bunu çapraz doğrulamayla hesaplar.</p>
<pre class="py">import numpy as np
import pandas as pd


def churn_verisi(n=600, seed=1):
    """Ilgaz Bank kurgusal müşteri kaybı (churn) verisi; eksik değerler içerir."""
    rng = np.random.default_rng(seed)
    yas = rng.integers(18, 75, n).astype(float)
    bakiye = rng.gamma(2, 15000, n)
    urun = rng.integers(1, 5, n)
    sikayet = rng.poisson(0.5, n)
    sehir = rng.choice(["İstanbul", "Ankara", "İzmir", "Bursa"], n)
    segment = rng.choice(["Bireysel", "Premium", "KOBİ"], n, p=[0.6, 0.25, 0.15])
    logit = -1.2 + 0.9 * sikayet - 0.6 * (urun - 2) + 0.03 * (yas - 45) - 0.8 * (segment == "Premium")
    y = (rng.random(n) &lt; 1 / (1 + np.exp(-logit))).astype(int)
    yas[rng.random(n) &lt; 0.08] = np.nan
    bakiye[rng.random(n) &lt; 0.05] = np.nan
    X = pd.DataFrame({"yas": yas, "bakiye": bakiye.round(2), "urun": urun, "sikayet": sikayet,
                      "sehir": sehir, "segment": segment})
    return X, y

from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler


def on_isleyici(sayisal, kategorik):
    sayi_hatti = Pipeline([
        ("doldur", SimpleImputer(strategy="median")),
        ("olcek", StandardScaler()),
    ])
    kat_hatti = Pipeline([
        ("doldur", SimpleImputer(strategy="most_frequent")),
        ("kodla", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
    ])
    return ColumnTransformer([
        ("sayisal", sayi_hatti, sayisal),
        ("kategorik", kat_hatti, kategorik),
    ])

from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import StratifiedKFold, learning_curve

X, y = churn_verisi()
pipe = Pipeline([("on_isleme", on_isleyici(["yas", "bakiye", "urun", "sikayet"], ["sehir", "segment"])),
                 ("model", LogisticRegression(max_iter=1000))])
boyutlar, egitim, dogrulama = learning_curve(
    pipe, X, y, train_sizes=[0.1, 0.3, 0.6, 1.0],
    cv=StratifiedKFold(5, shuffle=True, random_state=0), scoring="roc_auc",
)
for n, e, d in zip(boyutlar, egitim.mean(axis=1), dogrulama.mean(axis=1)):
    print(f"{n:&gt;4} örnek  eğitim={e:.3f}  doğrulama={d:.3f}")
</pre>

<h2>Modeli kaydetmek</h2>
<p>Eğitilmiş pipeline'ı diske yazıp tahmin servisinde yüklersin. scikit-learn için önerilen araç <code>joblib</code>'dir (büyük numpy dizilerinde <code>pickle</code>'dan verimli). Aşağıda dosya yerine bellek içi <code>io.BytesIO</code> kullanıyoruz; gerçek projede <code>joblib.dump(model, "churn_v3.joblib")</code> yazarsın.</p>
<pre class="py">import io
import joblib
import pickle
from sklearn.datasets import load_iris
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

X, y = load_iris(return_X_y=True)
pipe = make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000)).fit(X, y)

tampon = io.BytesIO()
joblib.dump(pipe, tampon)
print("boyut &gt; 0:", tampon.tell() &gt; 0)
tampon.seek(0)                      # okumadan önce başa sar
yuklenen = joblib.load(tampon)
print((yuklenen.predict(X[:5]) == pipe.predict(X[:5])).all())

veri = pickle.dumps(pipe)           # pickle da çalışır
print(type(pickle.loads(veri)).__name__)
</pre>
<div class="warn"><b>Pickle güvenliği ve sürüm</b>Pickle/joblib dosyası yüklenirken kod çalıştırabilir: <b>güvenmediğin kaynaktan model dosyası yükleme</b>. Ayrıca kaydedilen model, kaydedildiği scikit-learn sürümüyle yüklenmelidir; farklı sürüm uyarı verir ya da hatalı çalışabilir. Model dosyasının yanına sklearn sürümünü, eğitim tarihini ve özellik listesini mutlaka yaz.</div>

<h2>Model kartı ve raporlama</h2>
<p><b>Model kartı</b> (model card), bir modelin kimlik belgesidir: ne için yapıldı, hangi veriyle eğitildi, nasıl ölçüldü, nerede kullanılmamalı. Denetçinin, ürün yöneticisinin ve altı ay sonraki senin ilk okuyacağın belgedir.</p>
<div class="tbl-wrap"><table>
<tr><th>Bölüm</th><th>İçerik örneği</th></tr>
<tr><td>Amaç ve kapsam</td><td>3 ay içinde hesap kapatma riskini tahmin; yalnız bireysel ve KOBİ müşterileri</td></tr>
<tr><td>Veri</td><td>Kaynak tablolar, tarih aralığı, satır sayısı, hedef tanımı, eksik oranları</td></tr>
<tr><td>Model</td><td>Pipeline adımları, hiperparametreler, sklearn sürümü, eğitim tarihi</td></tr>
<tr><td>Değerlendirme</td><td>CV ortalama ± std, test metrikleri, taban çizgi, seçilen eşik ve gerekçesi</td></tr>
<tr><td>Sınırlar ve riskler</td><td>Yeni şubelerde güven düşük; segment bazında performans farkları; izleme planı</td></tr>
</table></div>

<div class="note"><b>Gerçek işte</b>Üretimdeki ML hatalarının büyük kısmı modelden değil ön işleme farklarından çıkar: veri bilimci not defterinde eksikleri ortalamayla doldurmuş, yazılım ekibi servisi yazarken sıfırla doldurmuştur ("training-serving skew"). Ön işleme ve modeli tek bir Pipeline nesnesinde kaydetmek bu sınıf hataları baştan ortadan kaldırır. Birçok ekip model dosyasını, model kartını ve CV sonuçlarını aynı sürüm etiketiyle bir model kayıt sistemine (MLflow gibi) yükler.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>İç içe çapraz doğrulama</h3>
<p>Hem model seçip hem de seçimin performansını yansız tahmin etmek istiyorsan <b>iç içe CV</b> (nested cross-validation) kullan: dış döngü performansı ölçer, her dış katın içinde ayrı bir GridSearchCV hiperparametre seçer. Kod olarak tek satırdır: <code>cross_val_score(GridSearchCV(pipe, izgara, cv=ic_cv), X, y, cv=dis_cv)</code>. Küçük veri setlerinde raporlanan skorun güvenilirliğini ciddi artırır.</p>
<h3>pandas çıktısı ve özellik adları</h3>
<p><code>pipe.set_output(transform="pandas")</code> ile dönüştürücüler numpy yerine sütun adlı DataFrame döndürür (OneHotEncoder'da <code>sparse_output=False</code> gerekir). Hata ayıklarken ve katsayıları özellik adlarıyla eşlerken çok işe yarar: <code>pipe.named_steps["on_isleme"].get_feature_names_out()</code> ile <code>pipe.named_steps["model"].coef_</code> yan yana konunca hangi şehrin ya da segmentin kayıp riskini artırdığı tek tabloda görünür.</p>

<h3>Kendi dönüştürücün</h3>
<p>İşe özgü bir özellik (ör. bakiye / ürün sayısı) gerekiyorsa <code>FunctionTransformer</code> ile bir fonksiyonu pipeline adımına çevirebilir ya da <code>BaseEstimator</code> ve <code>TransformerMixin</code>'den türeyen bir sınıf yazabilirsin. Kural aynı: veriden öğrenilen her şey <code>fit</code>'te, uygulanan her şey <code>transform</code>'da.</p>
</section>
`,
  ex: [
    { t: 'mc',
      stage: 'Isınma',
      q: 'Model canlıya alındıktan bir hafta sonra yeni açılan Van şubesinden gelen müşterilerde tahmin servisi <code>ValueError: Found unknown categories</code> hatası veriyor. En doğru düzeltme hangisi?',
      o: [
        'Van şubesinden gelen müşterileri tahminden önce silmek',
        'handle_unknown="ignore" ile kodlayıp yeniden eğitmek',
        'Şehir sütununu StandardScaler ile ölçekleyip yeniden eğitmek',
        'Her yeni şube açıldığında modeli sıfırdan eğitmek'
      ],
      a: 1,
      why: 'handle_unknown="ignore" eğitimde görülmemiş kategoriyi tüm kodlama sütunları 0 olan bir satırla temsil eder; servis çökmez. Müşteriyi silmek iş kaybıdır, kategorik metin ölçeklenemez, her şubede yeniden eğitmek sürdürülebilir değildir.' },
    { t: 'mc',
      stage: 'Isınma',
      q: 'Analist önce <code>X_s = StandardScaler().fit_transform(X)</code> yapıp sonra <code>cross_val_score(LogisticRegression(), X_s, y, cv=5)</code> çalıştırıyor. Sorun nedir?',
      o: [
        'StandardScaler lojistik regresyonla birlikte kullanılamaz',
        'cross_val_score ölçeklenmiş veriyi kabul etmez',
        'Ölçekleyici doğrulama katlarını da gördü; skor iyimser (sızıntı)',
        'cv=5 dengesiz veride hata verir'
      ],
      a: 2,
      why: 'Ölçekleyici ortalama ve std\'yi tüm veriden öğrendiği için her katın doğrulama kısmı ön işlemeye sızmıştır. Çözüm: Pipeline([("olcek", StandardScaler()), ("model", LogisticRegression())]) nesnesini çapraz doğrulamak.' },
    { t: 'mc',
      stage: 'Isınma',
      q: '<code>GridSearchCV</code> eğitildikten sonra <code>best_score_</code> neyi gösterir?',
      o: ['En iyi ayarın ayrı tutulan test setindeki skorunu', 'En iyi ayarın tüm eğitim verisindeki skorunu', 'Denenen tüm ayarların ortalama CV skorunu', 'En iyi ayarın CV doğrulama katlarındaki ortalaması'],
      a: 3,
      why: 'best_score_, seçilen ayarın çapraz doğrulama katlarındaki ortalama doğrulama skorudur. Seçim bu skorlarla yapıldığı için hafif iyimserdir; asıl rapor, aramaya girmemiş test setindeki skordur.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Ölçekleyici ne yazdırır?',
      code: 'from sklearn.preprocessing import StandardScaler\n\negitim = [[10.0], [20.0], [30.0]]\ntest = [[20.0], [40.0]]\nsc = StandardScaler().fit(egitim)\nprint(sc.transform(test).ravel().round(3).tolist())\n',
      o: ['[-1.0, 1.0]', '[0.0, 2.449]', '[0.0, 1.225]', '[-0.707, 0.707]'],
      a: 1,
      why: 'Ölçekleyici eğitimden ortalama 20 ve std 8.165 (popülasyon std\'si) öğrenir. Test verisine aynı dönüşüm uygulanır: (20-20)/8.165 = 0 ve (40-20)/8.165 = 2.449. Test kendi ortalamasıyla ölçeklenmez; [-1, 1] o hatanın sonucu olurdu.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'OneHotEncoder ne yazdırır?',
      code: 'import pandas as pd\nfrom sklearn.preprocessing import OneHotEncoder\n\negitim = pd.DataFrame({"segment": ["Premium", "Bireysel", "Premium"]})\nenc = OneHotEncoder(handle_unknown="ignore", sparse_output=False).fit(egitim)\nprint(enc.get_feature_names_out().tolist())\nprint(enc.transform(pd.DataFrame({"segment": ["KOBİ", "Premium"]})).tolist())\n',
      o: [
        '[\'segment_Premium\', \'segment_Bireysel\']\n[[0.0, 0.0], [1.0, 0.0]]',
        '[\'segment_Bireysel\', \'segment_Premium\']\n[[0.0, 0.0], [0.0, 1.0]]',
        '[\'segment_Bireysel\', \'segment_KOBİ\', \'segment_Premium\']\n[[0.0, 1.0, 0.0], [0.0, 0.0, 1.0]]',
        '[\'segment_Bireysel\', \'segment_Premium\']\nValueError'
      ],
      a: 1,
      why: 'Kategoriler alfabetik sıralanır: Bireysel, Premium. Eğitimde görülmeyen KOBİ, handle_unknown="ignore" sayesinde hata vermez ve tüm sütunları 0 olur. Premium ikinci sütunda 1 alır. Kodlayıcı yeni sütun eklemez; sütunlar fit anında sabitlenir.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'KFold katlarının doğrulama boyutları ne olur?',
      code: 'from sklearn.model_selection import KFold\n\nkf = KFold(n_splits=3)\nprint([len(dogrulama) for _, dogrulama in kf.split(list(range(10)))])\nprint([int(dogrulama[0]) for _, dogrulama in kf.split(list(range(10)))])\n',
      o: ['[3, 3, 4]\n[0, 3, 6]', '[4, 3, 3]\n[0, 4, 7]', '[3, 3, 3]\n[0, 3, 6]', '[4, 3, 3]\n[0, 3, 6]'],
      a: 1,
      why: '10 örnek 3 kata bölünürken artan örnek ilk katlara dağıtılır: 4, 3, 3. shuffle verilmediği için katlar sıralı ardışık bloklardır: 0-3, 4-6, 7-9; ilk elemanlar 0, 4, 7.' },
    { t: 'order',
      stage: 'Kodu oku',
      q: '<p>Sayısal sütunları ölçekleyip kategorik sütunu kodlayan ve lojistik regresyonla biten pipeline\'ı kuran programın satırlarını sırala.</p>',
      lines: [
        'import pandas as pd',
        'from sklearn.compose import ColumnTransformer',
        'from sklearn.linear_model import LogisticRegression',
        'from sklearn.pipeline import Pipeline',
        'from sklearn.preprocessing import OneHotEncoder, StandardScaler',
        'X = pd.DataFrame({"bakiye": [100.0, 5000.0, 250.0, 9000.0], "sehir": ["İzmir", "Ankara", "İzmir", "Bursa"]})',
        'on_isleme = ColumnTransformer([("sayi", StandardScaler(), ["bakiye"]), ("kat", OneHotEncoder(handle_unknown="ignore"), ["sehir"])])',
        'pipe = Pipeline([("on_isleme", on_isleme), ("model", LogisticRegression())])',
        'pipe.fit(X, [0, 1, 0, 1])'
      ],
      tests: 'assert list(pipe.named_steps) == ["on_isleme", "model"], "pipeline adımları on_isleme ve model olmalı"\nassert pipe.predict(X).shape == (4,), "pipeline fit edilmiş olmalı"\n',
      hint: 'ColumnTransformer, Pipeline\'ın içine konduğu için ondan önce tanımlanır. fit en sonda.',
      why: 'Önce sütun bazlı ön işleme tanımlanır, sonra Pipeline onu modelle birleştirir, en son tek bir fit çağrısı tüm adımları sırayla eğitir. Ham DataFrame doğrudan pipeline\'a verilir; ayrı bir dönüştürme adımı yazmazsın.' },
    { t: 'code',
      stage: 'Rehberli',
      id: 'ml-pipeline-degerlendirme-1',
      diff: 2,
      q: '<p><code>on_isleyici(sayisal, kategorik)</code> fonksiyonunu yaz ve bir <code>ColumnTransformer</code> döndür:</p><ul><li><code>"sayisal"</code> adımı: <code>SimpleImputer(strategy="median")</code> → <code>StandardScaler()</code> (bir Pipeline)</li><li><code>"kategorik"</code> adımı: <code>SimpleImputer(strategy="most_frequent")</code> → <code>OneHotEncoder(handle_unknown="ignore", sparse_output=False)</code></li></ul>',
      guide: [
        'Sayısal sütunlar için iki adımlı bir Pipeline kur: doldur, sonra ölçekle.',
        'Kategorik sütunlar için iki adımlı Pipeline: en sık değerle doldur, sonra one-hot kodla.',
        'ColumnTransformer([("sayisal", ..., sayisal), ("kategorik", ..., kategorik)]) ile birleştir.',
        'Nesneyi döndür (fit etme; fit\'i kullanan yapacak).'
      ],
      example: 'from sklearn.compose import ColumnTransformer\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import MinMaxScaler, OrdinalEncoder\nimport pandas as pd\n\ndf = pd.DataFrame({"maas": [30000, 60000], "unvan": ["Uzman", "Müdür"]})\nct = ColumnTransformer([\n    ("sayi", Pipeline([("olcek", MinMaxScaler())]), ["maas"]),\n    ("kat", OrdinalEncoder(), ["unvan"]),\n])\nprint(ct.fit_transform(df).tolist())\n',
      start: 'import numpy as np\nimport pandas as pd\n\n\ndef churn_verisi(n=600, seed=1):\n    """Ilgaz Bank kurgusal müşteri kaybı (churn) verisi; eksik değerler içerir."""\n    rng = np.random.default_rng(seed)\n    yas = rng.integers(18, 75, n).astype(float)\n    bakiye = rng.gamma(2, 15000, n)\n    urun = rng.integers(1, 5, n)\n    sikayet = rng.poisson(0.5, n)\n    sehir = rng.choice(["İstanbul", "Ankara", "İzmir", "Bursa"], n)\n    segment = rng.choice(["Bireysel", "Premium", "KOBİ"], n, p=[0.6, 0.25, 0.15])\n    logit = -1.2 + 0.9 * sikayet - 0.6 * (urun - 2) + 0.03 * (yas - 45) - 0.8 * (segment == "Premium")\n    y = (rng.random(n) < 1 / (1 + np.exp(-logit))).astype(int)\n    yas[rng.random(n) < 0.08] = np.nan\n    bakiye[rng.random(n) < 0.05] = np.nan\n    X = pd.DataFrame({"yas": yas, "bakiye": bakiye.round(2), "urun": urun, "sikayet": sikayet,\n                      "sehir": sehir, "segment": segment})\n    return X, y\n\nfrom sklearn.compose import ColumnTransformer\nfrom sklearn.impute import SimpleImputer\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import OneHotEncoder, StandardScaler\n\n\ndef on_isleyici(sayisal, kategorik):\n    sayi_hatti = None   # TODO: medyanla doldur + ölçekle\n    kat_hatti = None    # TODO: en sık değerle doldur + one-hot\n    # TODO: ColumnTransformer döndür\n    return None\n',
      sol: 'import numpy as np\nimport pandas as pd\n\n\ndef churn_verisi(n=600, seed=1):\n    """Ilgaz Bank kurgusal müşteri kaybı (churn) verisi; eksik değerler içerir."""\n    rng = np.random.default_rng(seed)\n    yas = rng.integers(18, 75, n).astype(float)\n    bakiye = rng.gamma(2, 15000, n)\n    urun = rng.integers(1, 5, n)\n    sikayet = rng.poisson(0.5, n)\n    sehir = rng.choice(["İstanbul", "Ankara", "İzmir", "Bursa"], n)\n    segment = rng.choice(["Bireysel", "Premium", "KOBİ"], n, p=[0.6, 0.25, 0.15])\n    logit = -1.2 + 0.9 * sikayet - 0.6 * (urun - 2) + 0.03 * (yas - 45) - 0.8 * (segment == "Premium")\n    y = (rng.random(n) < 1 / (1 + np.exp(-logit))).astype(int)\n    yas[rng.random(n) < 0.08] = np.nan\n    bakiye[rng.random(n) < 0.05] = np.nan\n    X = pd.DataFrame({"yas": yas, "bakiye": bakiye.round(2), "urun": urun, "sikayet": sikayet,\n                      "sehir": sehir, "segment": segment})\n    return X, y\n\nfrom sklearn.compose import ColumnTransformer\nfrom sklearn.impute import SimpleImputer\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import OneHotEncoder, StandardScaler\n\n\ndef on_isleyici(sayisal, kategorik):\n    sayi_hatti = Pipeline([\n        ("doldur", SimpleImputer(strategy="median")),\n        ("olcek", StandardScaler()),\n    ])\n    kat_hatti = Pipeline([\n        ("doldur", SimpleImputer(strategy="most_frequent")),\n        ("kodla", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),\n    ])\n    return ColumnTransformer([\n        ("sayisal", sayi_hatti, sayisal),\n        ("kategorik", kat_hatti, kategorik),\n    ])\n',
      tests: 'import numpy as np\nfrom sklearn.compose import ColumnTransformer\n_X, _y = churn_verisi()\n_ct = on_isleyici(["yas", "bakiye", "urun", "sikayet"], ["sehir", "segment"])\nassert isinstance(_ct, ColumnTransformer), "ColumnTransformer döndürülmeli"\n_Z = _ct.fit_transform(_X)\nassert isinstance(_Z, np.ndarray), "sparse_output=False ile yoğun numpy dizisi çıkmalı"\nassert _Z.shape == (600, 11), f"4 sayısal + 4 şehir + 3 segment = 11 sütun bekleniyordu; gelen {_Z.shape}"\nassert not np.isnan(_Z).any(), "eksik değerler doldurulmalı (SimpleImputer)"\nassert np.allclose(_Z[:, :4].mean(axis=0), 0, atol=1e-9), "sayısal sütunlar ölçeklenmeli: ortalama 0"\n_yeni = _X.head(2).copy(); _yeni["sehir"] = ["Van", "Ankara"]\nassert _ct.transform(_yeni)[0, 4:8].sum() == 0, "görülmemiş şehir (Van) hata vermemeli, tüm şehir sütunları 0 olmalı"\n',
      hints: [
        'Pipeline([("doldur", SimpleImputer(strategy="median")), ("olcek", StandardScaler())])',
        'Kategorik: OneHotEncoder(handle_unknown="ignore", sparse_output=False)',
        'return ColumnTransformer([("sayisal", sayi_hatti, sayisal), ("kategorik", kat_hatti, kategorik)])'
      ],
      why: 'Her sütun grubu kendi alt pipeline\'ında işlenir; ColumnTransformer sonuçları yan yana birleştirir. Doldurma ölçeklemeden önce gelir, çünkü StandardScaler NaN ile çalışmaz. handle_unknown="ignore" canlıdaki yeni kategorilere karşı sigortadır.' },
    { t: 'code',
      stage: 'Rehberli',
      id: 'ml-pipeline-degerlendirme-2',
      diff: 2,
      q: '<p><code>cv_ozet(model, X, y)</code> fonksiyonunu yaz: <code>StratifiedKFold(n_splits=5, shuffle=True, random_state=42)</code> ile <code>cross_val_score</code> çalıştırsın (<code>scoring="roc_auc"</code>) ve <code>(ortalama, std)</code> demetini 3 basamakla döndürsün.</p>',
      guide: [
        'StratifiedKFold nesnesini verilen ayarlarla oluştur.',
        'cross_val_score(model, X, y, cv=..., scoring="roc_auc") skor dizisi döndürür.',
        'Ortalama ve standart sapmayı al, float ve round(…, 3) uygula.',
        'İkiliyi döndür.'
      ],
      example: 'from sklearn.datasets import load_iris\nfrom sklearn.model_selection import KFold, cross_val_score\nfrom sklearn.tree import DecisionTreeClassifier\n\nX, y = load_iris(return_X_y=True)\ns = cross_val_score(DecisionTreeClassifier(random_state=0), X, y, cv=KFold(3, shuffle=True, random_state=1))\nprint(s.round(3), round(float(s.mean()), 3))\n',
      start: 'import numpy as np\nimport pandas as pd\n\n\ndef churn_verisi(n=600, seed=1):\n    """Ilgaz Bank kurgusal müşteri kaybı (churn) verisi; eksik değerler içerir."""\n    rng = np.random.default_rng(seed)\n    yas = rng.integers(18, 75, n).astype(float)\n    bakiye = rng.gamma(2, 15000, n)\n    urun = rng.integers(1, 5, n)\n    sikayet = rng.poisson(0.5, n)\n    sehir = rng.choice(["İstanbul", "Ankara", "İzmir", "Bursa"], n)\n    segment = rng.choice(["Bireysel", "Premium", "KOBİ"], n, p=[0.6, 0.25, 0.15])\n    logit = -1.2 + 0.9 * sikayet - 0.6 * (urun - 2) + 0.03 * (yas - 45) - 0.8 * (segment == "Premium")\n    y = (rng.random(n) < 1 / (1 + np.exp(-logit))).astype(int)\n    yas[rng.random(n) < 0.08] = np.nan\n    bakiye[rng.random(n) < 0.05] = np.nan\n    X = pd.DataFrame({"yas": yas, "bakiye": bakiye.round(2), "urun": urun, "sikayet": sikayet,\n                      "sehir": sehir, "segment": segment})\n    return X, y\n\nfrom sklearn.compose import ColumnTransformer\nfrom sklearn.impute import SimpleImputer\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import OneHotEncoder, StandardScaler\n\n\ndef on_isleyici(sayisal, kategorik):\n    sayi_hatti = Pipeline([\n        ("doldur", SimpleImputer(strategy="median")),\n        ("olcek", StandardScaler()),\n    ])\n    kat_hatti = Pipeline([\n        ("doldur", SimpleImputer(strategy="most_frequent")),\n        ("kodla", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),\n    ])\n    return ColumnTransformer([\n        ("sayisal", sayi_hatti, sayisal),\n        ("kategorik", kat_hatti, kategorik),\n    ])\n\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.model_selection import StratifiedKFold, cross_val_score\n\n\ndef cv_ozet(model, X, y):\n    # TODO: StratifiedKFold oluştur\n    # TODO: cross_val_score ile roc_auc skorları\n    # TODO: (ortalama, std) döndür\n    return 0.0, 0.0\n',
      sol: 'import numpy as np\nimport pandas as pd\n\n\ndef churn_verisi(n=600, seed=1):\n    """Ilgaz Bank kurgusal müşteri kaybı (churn) verisi; eksik değerler içerir."""\n    rng = np.random.default_rng(seed)\n    yas = rng.integers(18, 75, n).astype(float)\n    bakiye = rng.gamma(2, 15000, n)\n    urun = rng.integers(1, 5, n)\n    sikayet = rng.poisson(0.5, n)\n    sehir = rng.choice(["İstanbul", "Ankara", "İzmir", "Bursa"], n)\n    segment = rng.choice(["Bireysel", "Premium", "KOBİ"], n, p=[0.6, 0.25, 0.15])\n    logit = -1.2 + 0.9 * sikayet - 0.6 * (urun - 2) + 0.03 * (yas - 45) - 0.8 * (segment == "Premium")\n    y = (rng.random(n) < 1 / (1 + np.exp(-logit))).astype(int)\n    yas[rng.random(n) < 0.08] = np.nan\n    bakiye[rng.random(n) < 0.05] = np.nan\n    X = pd.DataFrame({"yas": yas, "bakiye": bakiye.round(2), "urun": urun, "sikayet": sikayet,\n                      "sehir": sehir, "segment": segment})\n    return X, y\n\nfrom sklearn.compose import ColumnTransformer\nfrom sklearn.impute import SimpleImputer\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import OneHotEncoder, StandardScaler\n\n\ndef on_isleyici(sayisal, kategorik):\n    sayi_hatti = Pipeline([\n        ("doldur", SimpleImputer(strategy="median")),\n        ("olcek", StandardScaler()),\n    ])\n    kat_hatti = Pipeline([\n        ("doldur", SimpleImputer(strategy="most_frequent")),\n        ("kodla", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),\n    ])\n    return ColumnTransformer([\n        ("sayisal", sayi_hatti, sayisal),\n        ("kategorik", kat_hatti, kategorik),\n    ])\n\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.model_selection import StratifiedKFold, cross_val_score\n\n\ndef cv_ozet(model, X, y):\n    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)\n    skorlar = cross_val_score(model, X, y, cv=cv, scoring="roc_auc")\n    return round(float(skorlar.mean()), 3), round(float(skorlar.std()), 3)\n',
      tests: '_X, _y = churn_verisi()\n_p = Pipeline([("on_isleme", on_isleyici(["yas", "bakiye", "urun", "sikayet"], ["sehir", "segment"])), ("model", LogisticRegression(max_iter=1000))])\n_o, _s = cv_ozet(_p, _X, _y)\n_ref = cross_val_score(_p, _X, _y, cv=StratifiedKFold(5, shuffle=True, random_state=42), scoring="roc_auc")\nassert (_o, _s) == (round(float(_ref.mean()), 3), round(float(_ref.std()), 3)), f"beklenen {(round(float(_ref.mean()), 3), round(float(_ref.std()), 3))}, gelen {(_o, _s)}"\nassert 0.6 < _o < 0.95 and 0 < _s < 0.1, "makul bir AUC ve küçük bir std bekleniyor"\n',
      hints: [
        'cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)',
        'skorlar = cross_val_score(model, X, y, cv=cv, scoring="roc_auc")'
      ],
      why: 'Ortalama beklenen performansı, std ise katlar arasındaki dalgalanmayı (belirsizliği) gösterir. "AUC 0.78 ± 0.03" demek, tek bir bölmeden çıkan "0.80"dan çok daha dürüst bir rapordur. Pipeline\'ı çapraz doğruladığın için ön işleme her katta yeniden fit edilir.' },
    { t: 'code',
      stage: 'Rehberli',
      id: 'ml-pipeline-degerlendirme-3',
      diff: 1,
      q: '<p><code>bellege_kaydet_yukle(model)</code> fonksiyonunu yaz: modeli <code>joblib.dump</code> ile bir <code>io.BytesIO</code> tamponuna yazsın, tamponu başa sarsın, <code>joblib.load</code> ile geri yüklesin ve <code>(yuklenen_model, bayt_sayisi)</code> döndürsün.</p>',
      guide: [
        'tampon = io.BytesIO() oluştur.',
        'joblib.dump(model, tampon) ile yaz; tampon.tell() yazılan bayt sayısını verir.',
        'Okumadan önce tampon.seek(0) ile başa sar.',
        'joblib.load(tampon) ile yükle ve ikiliyi döndür.'
      ],
      example: 'import io\nimport pickle\n\nayarlar = {"esik": 0.3, "surum": "v2"}\nt = io.BytesIO()\npickle.dump(ayarlar, t)\nt.seek(0)\nprint(pickle.load(t))\n',
      start: 'import io\nimport joblib\n\n\ndef bellege_kaydet_yukle(model):\n    tampon = io.BytesIO()\n    # TODO: dump, boyut, seek(0), load\n    return None, 0\n',
      sol: 'import io\nimport joblib\n\n\ndef bellege_kaydet_yukle(model):\n    tampon = io.BytesIO()\n    joblib.dump(model, tampon)\n    boyut = tampon.tell()\n    tampon.seek(0)\n    return joblib.load(tampon), boyut\n',
      tests: 'import numpy as np\nfrom sklearn.datasets import load_iris\nfrom sklearn.tree import DecisionTreeClassifier\n_X, _y = load_iris(return_X_y=True)\n_m = DecisionTreeClassifier(max_depth=3, random_state=0).fit(_X, _y)\n_y2, _b = bellege_kaydet_yukle(_m)\nassert _y2 is not None and _y2 is not _m, "yeni (yüklenmiş) bir nesne dönmeli"\nassert _b > 100, "bayt sayısı pozitif olmalı (tampon.tell())"\nassert np.array_equal(_y2.predict(_X), _m.predict(_X)), "yüklenen model aynı tahminleri üretmeli"\n',
      hints: [
        'joblib.dump(model, tampon) dosya yolu yerine dosya benzeri nesne de kabul eder.',
        'seek(0) unutulursa load boş veri okur ve hata verir.'
      ],
      why: 'BytesIO dosya gibi davranan bellek içi bir tampondur; testlerde ve ağ üzerinden model taşırken kullanışlıdır. Yazdıktan sonra imleç sondadır; okumadan önce başa sarmak gerekir.' },
    { t: 'code',
      stage: 'Kendin yaz',
      id: 'ml-pipeline-degerlendirme-4',
      diff: 2,
      q: '<p><code>churn_pipeline(sayisal, kategorik, C=1.0)</code> fonksiyonu yaz: <code>"on_isleme"</code> adımı hazır <code>on_isleyici(sayisal, kategorik)</code>, <code>"model"</code> adımı <code>LogisticRegression(C=C, max_iter=1000)</code> olan bir <code>Pipeline</code> döndürsün. Sonra <code>egit_ve_olc(pipe, X, y)</code> yaz: veriyi <code>test_size=0.25, random_state=0, stratify=y</code> ile bölüp pipeline\'ı eğitsin ve test ROC-AUC\'yi 3 basamakla döndürsün.</p>',
      start: 'import numpy as np\nimport pandas as pd\n\n\ndef churn_verisi(n=600, seed=1):\n    """Ilgaz Bank kurgusal müşteri kaybı (churn) verisi; eksik değerler içerir."""\n    rng = np.random.default_rng(seed)\n    yas = rng.integers(18, 75, n).astype(float)\n    bakiye = rng.gamma(2, 15000, n)\n    urun = rng.integers(1, 5, n)\n    sikayet = rng.poisson(0.5, n)\n    sehir = rng.choice(["İstanbul", "Ankara", "İzmir", "Bursa"], n)\n    segment = rng.choice(["Bireysel", "Premium", "KOBİ"], n, p=[0.6, 0.25, 0.15])\n    logit = -1.2 + 0.9 * sikayet - 0.6 * (urun - 2) + 0.03 * (yas - 45) - 0.8 * (segment == "Premium")\n    y = (rng.random(n) < 1 / (1 + np.exp(-logit))).astype(int)\n    yas[rng.random(n) < 0.08] = np.nan\n    bakiye[rng.random(n) < 0.05] = np.nan\n    X = pd.DataFrame({"yas": yas, "bakiye": bakiye.round(2), "urun": urun, "sikayet": sikayet,\n                      "sehir": sehir, "segment": segment})\n    return X, y\n\nfrom sklearn.compose import ColumnTransformer\nfrom sklearn.impute import SimpleImputer\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import OneHotEncoder, StandardScaler\n\n\ndef on_isleyici(sayisal, kategorik):\n    sayi_hatti = Pipeline([\n        ("doldur", SimpleImputer(strategy="median")),\n        ("olcek", StandardScaler()),\n    ])\n    kat_hatti = Pipeline([\n        ("doldur", SimpleImputer(strategy="most_frequent")),\n        ("kodla", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),\n    ])\n    return ColumnTransformer([\n        ("sayisal", sayi_hatti, sayisal),\n        ("kategorik", kat_hatti, kategorik),\n    ])\n\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.metrics import roc_auc_score\nfrom sklearn.model_selection import train_test_split\n\n\ndef churn_pipeline(sayisal, kategorik, C=1.0):\n    pass\n\n\ndef egit_ve_olc(pipe, X, y):\n    pass\n',
      sol: 'import numpy as np\nimport pandas as pd\n\n\ndef churn_verisi(n=600, seed=1):\n    """Ilgaz Bank kurgusal müşteri kaybı (churn) verisi; eksik değerler içerir."""\n    rng = np.random.default_rng(seed)\n    yas = rng.integers(18, 75, n).astype(float)\n    bakiye = rng.gamma(2, 15000, n)\n    urun = rng.integers(1, 5, n)\n    sikayet = rng.poisson(0.5, n)\n    sehir = rng.choice(["İstanbul", "Ankara", "İzmir", "Bursa"], n)\n    segment = rng.choice(["Bireysel", "Premium", "KOBİ"], n, p=[0.6, 0.25, 0.15])\n    logit = -1.2 + 0.9 * sikayet - 0.6 * (urun - 2) + 0.03 * (yas - 45) - 0.8 * (segment == "Premium")\n    y = (rng.random(n) < 1 / (1 + np.exp(-logit))).astype(int)\n    yas[rng.random(n) < 0.08] = np.nan\n    bakiye[rng.random(n) < 0.05] = np.nan\n    X = pd.DataFrame({"yas": yas, "bakiye": bakiye.round(2), "urun": urun, "sikayet": sikayet,\n                      "sehir": sehir, "segment": segment})\n    return X, y\n\nfrom sklearn.compose import ColumnTransformer\nfrom sklearn.impute import SimpleImputer\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import OneHotEncoder, StandardScaler\n\n\ndef on_isleyici(sayisal, kategorik):\n    sayi_hatti = Pipeline([\n        ("doldur", SimpleImputer(strategy="median")),\n        ("olcek", StandardScaler()),\n    ])\n    kat_hatti = Pipeline([\n        ("doldur", SimpleImputer(strategy="most_frequent")),\n        ("kodla", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),\n    ])\n    return ColumnTransformer([\n        ("sayisal", sayi_hatti, sayisal),\n        ("kategorik", kat_hatti, kategorik),\n    ])\n\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.metrics import roc_auc_score\nfrom sklearn.model_selection import train_test_split\n\n\ndef churn_pipeline(sayisal, kategorik, C=1.0):\n    return Pipeline([\n        ("on_isleme", on_isleyici(sayisal, kategorik)),\n        ("model", LogisticRegression(C=C, max_iter=1000)),\n    ])\n\n\ndef egit_ve_olc(pipe, X, y):\n    X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, random_state=0, stratify=y)\n    pipe.fit(X_tr, y_tr)\n    return round(float(roc_auc_score(y_te, pipe.predict_proba(X_te)[:, 1])), 3)\n',
      tests: '_X, _y = churn_verisi()\n_p = churn_pipeline(["yas", "bakiye", "urun", "sikayet"], ["sehir", "segment"], C=0.5)\nassert isinstance(_p, Pipeline) and list(_p.named_steps) == ["on_isleme", "model"], "adımlar on_isleme ve model olmalı"\nassert _p.get_params()["model__C"] == 0.5, "C parametresi modele geçmeli"\n_a = egit_ve_olc(_p, _X, _y)\n_a2, _b2, _c2, _d2 = train_test_split(_X, _y, test_size=0.25, random_state=0, stratify=_y)\n_r = churn_pipeline(["yas", "bakiye", "urun", "sikayet"], ["sehir", "segment"], C=0.5).fit(_a2, _c2)\nassert _a == round(float(roc_auc_score(_d2, _r.predict_proba(_b2)[:, 1])), 3), "test AUC yanlış: bölme ayarlarını ve predict_proba[:, 1]\'i kontrol et"\nassert hasattr(_p.named_steps["model"], "coef_"), "pipeline egit_ve_olc içinde fit edilmeli"\n',
      hints: [
        'Pipeline([("on_isleme", on_isleyici(...)), ("model", LogisticRegression(C=C, max_iter=1000))])',
        'Ham DataFrame\'i doğrudan pipe.fit(X_tr, y_tr)\'ye ver.'
      ],
      why: 'Pipeline ham veriyi alır; doldurma, ölçekleme, kodlama ve model eğitimi tek fit çağrısında, yalnızca eğitim verisiyle yapılır. Test verisi yalnızca transform edilir; sızıntı yapısal olarak imkânsızlaşır.' },
    { t: 'code',
      stage: 'Kendin yaz',
      id: 'ml-pipeline-degerlendirme-5',
      diff: 2,
      q: '<p><code>grid_ara(pipe, X, y)</code> fonksiyonu yaz: <code>GridSearchCV</code> ile <code>model__C</code> için <code>[0.01, 0.1, 1, 10]</code> ve <code>model__class_weight</code> için <code>[None, "balanced"]</code> değerlerini <code>StratifiedKFold(3, shuffle=True, random_state=0)</code> ve <code>scoring="roc_auc"</code> ile denesin. <code>(best_params_, best_score_ 3 basamak, fit_edilmis_arama)</code> döndür.</p>',
      start: 'import numpy as np\nimport pandas as pd\n\n\ndef churn_verisi(n=600, seed=1):\n    """Ilgaz Bank kurgusal müşteri kaybı (churn) verisi; eksik değerler içerir."""\n    rng = np.random.default_rng(seed)\n    yas = rng.integers(18, 75, n).astype(float)\n    bakiye = rng.gamma(2, 15000, n)\n    urun = rng.integers(1, 5, n)\n    sikayet = rng.poisson(0.5, n)\n    sehir = rng.choice(["İstanbul", "Ankara", "İzmir", "Bursa"], n)\n    segment = rng.choice(["Bireysel", "Premium", "KOBİ"], n, p=[0.6, 0.25, 0.15])\n    logit = -1.2 + 0.9 * sikayet - 0.6 * (urun - 2) + 0.03 * (yas - 45) - 0.8 * (segment == "Premium")\n    y = (rng.random(n) < 1 / (1 + np.exp(-logit))).astype(int)\n    yas[rng.random(n) < 0.08] = np.nan\n    bakiye[rng.random(n) < 0.05] = np.nan\n    X = pd.DataFrame({"yas": yas, "bakiye": bakiye.round(2), "urun": urun, "sikayet": sikayet,\n                      "sehir": sehir, "segment": segment})\n    return X, y\n\nfrom sklearn.compose import ColumnTransformer\nfrom sklearn.impute import SimpleImputer\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import OneHotEncoder, StandardScaler\n\n\ndef on_isleyici(sayisal, kategorik):\n    sayi_hatti = Pipeline([\n        ("doldur", SimpleImputer(strategy="median")),\n        ("olcek", StandardScaler()),\n    ])\n    kat_hatti = Pipeline([\n        ("doldur", SimpleImputer(strategy="most_frequent")),\n        ("kodla", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),\n    ])\n    return ColumnTransformer([\n        ("sayisal", sayi_hatti, sayisal),\n        ("kategorik", kat_hatti, kategorik),\n    ])\n\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.model_selection import GridSearchCV, StratifiedKFold\n\n\ndef grid_ara(pipe, X, y):\n    pass\n',
      sol: 'import numpy as np\nimport pandas as pd\n\n\ndef churn_verisi(n=600, seed=1):\n    """Ilgaz Bank kurgusal müşteri kaybı (churn) verisi; eksik değerler içerir."""\n    rng = np.random.default_rng(seed)\n    yas = rng.integers(18, 75, n).astype(float)\n    bakiye = rng.gamma(2, 15000, n)\n    urun = rng.integers(1, 5, n)\n    sikayet = rng.poisson(0.5, n)\n    sehir = rng.choice(["İstanbul", "Ankara", "İzmir", "Bursa"], n)\n    segment = rng.choice(["Bireysel", "Premium", "KOBİ"], n, p=[0.6, 0.25, 0.15])\n    logit = -1.2 + 0.9 * sikayet - 0.6 * (urun - 2) + 0.03 * (yas - 45) - 0.8 * (segment == "Premium")\n    y = (rng.random(n) < 1 / (1 + np.exp(-logit))).astype(int)\n    yas[rng.random(n) < 0.08] = np.nan\n    bakiye[rng.random(n) < 0.05] = np.nan\n    X = pd.DataFrame({"yas": yas, "bakiye": bakiye.round(2), "urun": urun, "sikayet": sikayet,\n                      "sehir": sehir, "segment": segment})\n    return X, y\n\nfrom sklearn.compose import ColumnTransformer\nfrom sklearn.impute import SimpleImputer\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import OneHotEncoder, StandardScaler\n\n\ndef on_isleyici(sayisal, kategorik):\n    sayi_hatti = Pipeline([\n        ("doldur", SimpleImputer(strategy="median")),\n        ("olcek", StandardScaler()),\n    ])\n    kat_hatti = Pipeline([\n        ("doldur", SimpleImputer(strategy="most_frequent")),\n        ("kodla", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),\n    ])\n    return ColumnTransformer([\n        ("sayisal", sayi_hatti, sayisal),\n        ("kategorik", kat_hatti, kategorik),\n    ])\n\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.model_selection import GridSearchCV, StratifiedKFold\n\n\ndef grid_ara(pipe, X, y):\n    izgara = {"model__C": [0.01, 0.1, 1, 10], "model__class_weight": [None, "balanced"]}\n    arama = GridSearchCV(pipe, izgara, cv=StratifiedKFold(3, shuffle=True, random_state=0), scoring="roc_auc")\n    arama.fit(X, y)\n    return arama.best_params_, round(float(arama.best_score_), 3), arama\n',
      tests: '_X, _y = churn_verisi()\n_p = Pipeline([("on_isleme", on_isleyici(["yas", "bakiye", "urun", "sikayet"], ["sehir", "segment"])), ("model", LogisticRegression(max_iter=1000))])\n_bp, _bs, _ar = grid_ara(_p, _X, _y)\nassert set(_bp) == {"model__C", "model__class_weight"}, "iki parametre aranmalı (adım__parametre biçimi)"\nassert len(_ar.cv_results_["params"]) == 8, "4 x 2 = 8 kombinasyon denenmeli"\nassert _ar.n_splits_ == 3, "3 katlı StratifiedKFold kullanılmalı"\n_i = int(np.argmax(_ar.cv_results_["mean_test_score"]))\nassert _bs == round(float(_ar.cv_results_["mean_test_score"][_i]), 3) and _bp == _ar.cv_results_["params"][_i], "best_params_ ve best_score_ döndürülmeli"\nassert hasattr(_ar, "best_estimator_"), "arama fit edilmiş olmalı (refit)"\n',
      hints: [
        'Pipeline adımlarının parametreleri: "model__C", "model__class_weight".',
        'GridSearchCV(pipe, izgara, cv=StratifiedKFold(3, shuffle=True, random_state=0), scoring="roc_auc").fit(X, y)'
      ],
      why: 'Adım adı + çift alt çizgi + parametre adı, pipeline içindeki herhangi bir ayara erişmenin yoludur. GridSearchCV her kombinasyonu aynı katlarla değerlendirir, en iyisini seçer ve refit=True ile tüm veride yeniden eğitir; best_estimator_ doğrudan kullanılabilir.' },
    { t: 'code',
      stage: 'Kendin yaz',
      id: 'ml-pipeline-degerlendirme-6',
      diff: 2,
      q: '<p>Öğrenme eğrisini elle hesapla. <code>ogrenme_egrisi(model, X_tr, y_tr, X_va, y_va, boyutlar)</code> fonksiyonu yaz: her <code>n</code> için modelin bir <b>kopyasını</b> (<code>sklearn.base.clone</code>) eğitim verisinin <b>ilk n satırıyla</b> eğitsin, o n satırdaki ve doğrulama setindeki doğruluğu hesaplasın. <code>[(n, egitim_dogruluk, dogrulama_dogruluk), ...]</code> listesi döndür (3 basamak). <code>X_tr</code> numpy dizisi ya da DataFrame olabilir.</p>',
      start: 'from sklearn.base import clone\n\n\ndef ogrenme_egrisi(model, X_tr, y_tr, X_va, y_va, boyutlar):\n    pass\n',
      sol: 'from sklearn.base import clone\n\n\ndef ogrenme_egrisi(model, X_tr, y_tr, X_va, y_va, boyutlar):\n    sonuc = []\n    for n in boyutlar:\n        Xn = X_tr.iloc[:n] if hasattr(X_tr, "iloc") else X_tr[:n]\n        yn = y_tr[:n]\n        m = clone(model).fit(Xn, yn)\n        sonuc.append((n, round(float(m.score(Xn, yn)), 3), round(float(m.score(X_va, y_va)), 3)))\n    return sonuc\n',
      tests: 'import pandas as pd\nfrom sklearn.datasets import make_classification\nfrom sklearn.tree import DecisionTreeClassifier\n_X, _y = make_classification(n_samples=500, n_features=6, flip_y=0.1, random_state=2)\n_m = DecisionTreeClassifier(max_depth=4, random_state=0)\n_e = ogrenme_egrisi(_m, _X[:400], _y[:400], _X[400:], _y[400:], [20, 100, 400])\nassert [t[0] for t in _e] == [20, 100, 400], "her boyut için bir satır"\nfor _n, _tr, _va in _e:\n    _r = DecisionTreeClassifier(max_depth=4, random_state=0).fit(_X[:_n], _y[:_n])\n    assert (_tr, _va) == (round(float(_r.score(_X[:_n], _y[:_n])), 3), round(float(_r.score(_X[400:], _y[400:])), 3)), f"n={_n} için skorlar yanlış"\nassert not hasattr(_m, "classes_"), "orijinal model fit edilmemeli; clone kullan"\nassert _e[-1][2] > _e[0][2], "veri arttıkça doğrulama skoru artmalı"\n_D = pd.DataFrame(_X)\nassert ogrenme_egrisi(_m, _D.iloc[:400], _y[:400], _D.iloc[400:], _y[400:], [50])[0][0] == 50, "DataFrame girdide de çalışmalı (iloc)"\n',
      hints: [
        'clone(model) aynı hiperparametrelerle fit edilmemiş yeni bir nesne verir.',
        'DataFrame için X_tr.iloc[:n], numpy için X_tr[:n]; hasattr(X_tr, "iloc") ile ayırt et.'
      ],
      why: 'Öğrenme eğrisi, "daha fazla veri işe yarar mı?" sorusuna sayıyla cevap verir. clone, kullanıcının verdiği şablon modeli bozmadan her boyutta temiz bir model eğitmeyi sağlar; sklearn\'ün kendi learning_curve fonksiyonu da içeride aynısını yapar.' },
    { t: 'code',
      stage: 'Kendin yaz',
      id: 'ml-pipeline-degerlendirme-7',
      diff: 1,
      q: '<p><code>model_karti(ad, surum, veri, metrikler, sinirlar)</code> fonksiyonu yaz ve aşağıdaki biçimde çok satırlı bir metin döndür. <code>veri</code>: <code>{"satir": int, "donem": str}</code>; <code>metrikler</code>: metrik adı → (ortalama, std) sözlüğü (eklenme sırasıyla, 3 basamak); <code>sinirlar</code>: metin listesi. Örnek çağrının çıktısı birebir şöyle olmalı:</p><pre class="out"># Model kartı: churn-lojistik (v1.2)\nVeri: 600 satır, dönem 2024-01..2024-12\nMetrikler:\n- roc_auc: 0.781 ± 0.025\n- recall: 0.640 ± 0.051\nSınırlar:\n- Yeni şubelerde güven düşük\n- KOBİ segmentinde az örnek</pre>',
      start: 'def model_karti(ad, surum, veri, metrikler, sinirlar):\n    pass\n\n\nprint(model_karti(\n    "churn-lojistik", "v1.2",\n    {"satir": 600, "donem": "2024-01..2024-12"},\n    {"roc_auc": (0.78123, 0.0249), "recall": (0.64, 0.0512)},\n    ["Yeni şubelerde güven düşük", "KOBİ segmentinde az örnek"],\n))\n',
      sol: 'def model_karti(ad, surum, veri, metrikler, sinirlar):\n    satirlar = [\n        f"# Model kartı: {ad} ({surum})",\n        f"Veri: {veri[\'satir\']} satır, dönem {veri[\'donem\']}",\n        "Metrikler:",\n    ]\n    for metrik, (ort, std) in metrikler.items():\n        satirlar.append(f"- {metrik}: {ort:.3f} ± {std:.3f}")\n    satirlar.append("Sınırlar:")\n    satirlar.extend(f"- {s}" for s in sinirlar)\n    return "\\n".join(satirlar)\n\n\nprint(model_karti(\n    "churn-lojistik", "v1.2",\n    {"satir": 600, "donem": "2024-01..2024-12"},\n    {"roc_auc": (0.78123, 0.0249), "recall": (0.64, 0.0512)},\n    ["Yeni şubelerde güven düşük", "KOBİ segmentinde az örnek"],\n))\n',
      expect: '# Model kartı: churn-lojistik (v1.2)\nVeri: 600 satır, dönem 2024-01..2024-12\nMetrikler:\n- roc_auc: 0.781 ± 0.025\n- recall: 0.640 ± 0.051\nSınırlar:\n- Yeni şubelerde güven düşük\n- KOBİ segmentinde az örnek\n',
      tests: '_k = model_karti("x", "v0", {"satir": 1, "donem": "d"}, {}, [])\nassert _k == "# Model kartı: x (v0)\\nVeri: 1 satır, dönem d\\nMetrikler:\\nSınırlar:", "boş metrik ve sınır listesinde başlıklar yine yazılmalı; sonda boş satır olmamalı"\n',
      hints: [
        'Satırları bir listede topla, en sonda "\\n".join ile birleştir.',
        'Sabit 3 basamak için f"{ort:.3f} ± {std:.3f}" (0.64 → 0.640).'
      ],
      why: 'Model kartını koddan üretmek, rapordaki sayıların gerçekten o eğitim çalışmasından gelmesini garanti eder; elle kopyalanan sayılar zamanla modelden kopar. :.3f biçimi sondaki sıfırları da yazar; round() bunu yapmaz.' },
    { t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      id: 'ml-pipeline-degerlendirme-8',
      diff: 2,
      q: '<p><code>olcekle(X_train, X_test)</code> fonksiyonu eğitim ve test matrislerini ölçekleyip döndürüyor; kod çalışıyor ama model doğrulamasında küçük bir <b>sızıntı</b> var. <b>Hatayı bul ve düzelt</b>: ölçekleyici yalnızca eğitim verisinden öğrenmeli.</p>',
      start: 'import numpy as np\nfrom sklearn.preprocessing import StandardScaler\n\n\ndef olcekle(X_train, X_test):\n    sc = StandardScaler()\n    sc.fit(np.vstack([X_train, X_test]))\n    return sc.transform(X_train), sc.transform(X_test)\n',
      sol: 'import numpy as np\nfrom sklearn.preprocessing import StandardScaler\n\n\ndef olcekle(X_train, X_test):\n    sc = StandardScaler()\n    sc.fit(X_train)\n    return sc.transform(X_train), sc.transform(X_test)\n',
      tests: '_tr = np.array([[1.0, 100.0], [2.0, 200.0], [3.0, 300.0]])\n_te = np.array([[10.0, 1000.0]])\n_a, _b = olcekle(_tr, _te)\nassert np.allclose(_a.mean(axis=0), 0) and np.allclose(_a.std(axis=0), 1), "ölçeklenmiş eğitim verisinin ortalaması 0, std\'si 1 olmalı: fit yalnızca eğitimde"\nassert np.allclose(_b, [[9.797959, 9.797959]], atol=1e-5), f"test, eğitim istatistikleriyle dönüştürülmeli: (10-2)/0.8165 = 9.798; gelen {_b}"\n',
      hints: [
        'np.vstack eğitim ve testi birleştiriyor; ölçekleyici test istatistiklerini de öğreniyor.',
        'sc.fit(X_train) yeterli; transform her ikisine de uygulanır.'
      ],
      why: 'Test verisinin ortalaması ve std\'si ölçekleyiciye karışınca model, değerlendirildiği veriden dolaylı bilgi almış olur. Etkisi bazen küçüktür ama eksik doldurma, hedef kodlama (target encoding) gibi adımlarda büyük olabilir. En sağlam önlem bu adımları Pipeline içine koymaktır.' },
    { t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      id: 'ml-pipeline-degerlendirme-9',
      diff: 2,
      q: '<p>Churn servisinin <code>servis_pipeline()</code> fonksiyonu test ortamında çalışıyordu; canlıda eğitimde olmayan bir şehirden (Van) gelen müşteri ve yaşı boş gelen başvurular servisi çökertti. <b>Hataları bul ve düzelt</b> (iki sorun var).</p>',
      start: 'import numpy as np\nimport pandas as pd\n\n\ndef churn_verisi(n=600, seed=1):\n    """Ilgaz Bank kurgusal müşteri kaybı (churn) verisi; eksik değerler içerir."""\n    rng = np.random.default_rng(seed)\n    yas = rng.integers(18, 75, n).astype(float)\n    bakiye = rng.gamma(2, 15000, n)\n    urun = rng.integers(1, 5, n)\n    sikayet = rng.poisson(0.5, n)\n    sehir = rng.choice(["İstanbul", "Ankara", "İzmir", "Bursa"], n)\n    segment = rng.choice(["Bireysel", "Premium", "KOBİ"], n, p=[0.6, 0.25, 0.15])\n    logit = -1.2 + 0.9 * sikayet - 0.6 * (urun - 2) + 0.03 * (yas - 45) - 0.8 * (segment == "Premium")\n    y = (rng.random(n) < 1 / (1 + np.exp(-logit))).astype(int)\n    yas[rng.random(n) < 0.08] = np.nan\n    bakiye[rng.random(n) < 0.05] = np.nan\n    X = pd.DataFrame({"yas": yas, "bakiye": bakiye.round(2), "urun": urun, "sikayet": sikayet,\n                      "sehir": sehir, "segment": segment})\n    return X, y\n\nfrom sklearn.compose import ColumnTransformer\nfrom sklearn.impute import SimpleImputer\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import OneHotEncoder, StandardScaler\n\n\ndef servis_pipeline():\n    on_isleme = ColumnTransformer([\n        ("sayisal", StandardScaler(), ["yas", "bakiye", "urun", "sikayet"]),\n        ("kategorik", OneHotEncoder(sparse_output=False), ["sehir", "segment"]),\n    ])\n    return Pipeline([("on_isleme", on_isleme), ("model", LogisticRegression(max_iter=1000))])\n\n\nX, y = churn_verisi()\nX = X.dropna()\ny_temiz = y[X.index]\npipe = servis_pipeline().fit(X, y_temiz)\n',
      sol: 'import numpy as np\nimport pandas as pd\n\n\ndef churn_verisi(n=600, seed=1):\n    """Ilgaz Bank kurgusal müşteri kaybı (churn) verisi; eksik değerler içerir."""\n    rng = np.random.default_rng(seed)\n    yas = rng.integers(18, 75, n).astype(float)\n    bakiye = rng.gamma(2, 15000, n)\n    urun = rng.integers(1, 5, n)\n    sikayet = rng.poisson(0.5, n)\n    sehir = rng.choice(["İstanbul", "Ankara", "İzmir", "Bursa"], n)\n    segment = rng.choice(["Bireysel", "Premium", "KOBİ"], n, p=[0.6, 0.25, 0.15])\n    logit = -1.2 + 0.9 * sikayet - 0.6 * (urun - 2) + 0.03 * (yas - 45) - 0.8 * (segment == "Premium")\n    y = (rng.random(n) < 1 / (1 + np.exp(-logit))).astype(int)\n    yas[rng.random(n) < 0.08] = np.nan\n    bakiye[rng.random(n) < 0.05] = np.nan\n    X = pd.DataFrame({"yas": yas, "bakiye": bakiye.round(2), "urun": urun, "sikayet": sikayet,\n                      "sehir": sehir, "segment": segment})\n    return X, y\n\nfrom sklearn.compose import ColumnTransformer\nfrom sklearn.impute import SimpleImputer\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import OneHotEncoder, StandardScaler\n\n\ndef servis_pipeline():\n    on_isleme = ColumnTransformer([\n        ("sayisal", Pipeline([("doldur", SimpleImputer(strategy="median")), ("olcek", StandardScaler())]),\n         ["yas", "bakiye", "urun", "sikayet"]),\n        ("kategorik", OneHotEncoder(handle_unknown="ignore", sparse_output=False), ["sehir", "segment"]),\n    ])\n    return Pipeline([("on_isleme", on_isleme), ("model", LogisticRegression(max_iter=1000))])\n\n\nX, y = churn_verisi()\nX = X.dropna()\ny_temiz = y[X.index]\npipe = servis_pipeline().fit(X, y_temiz)\n',
      tests: 'import numpy as np\n_X, _y = churn_verisi()\n_p = servis_pipeline().fit(_X.dropna(), _y[_X.dropna().index])\n_yeni = pd.DataFrame({"yas": [np.nan, 41.0], "bakiye": [12000.0, np.nan], "urun": [1, 3], "sikayet": [2, 0], "sehir": ["Van", "İzmir"], "segment": ["Bireysel", "KOBİ"]})\n_r = _p.predict_proba(_yeni)\nassert _r.shape == (2, 2), "iki başvuru için olasılık dönmeli"\nassert not np.isnan(_r).any(), "eksik değerler doldurulmalı (SimpleImputer)"\n_q = servis_pipeline().fit(_X, _y)\nassert _q.predict(_X).shape == (600,), "eksik değerli eğitim verisiyle de fit edilebilmeli"\n',
      hints: [
        'Görülmemiş kategori: OneHotEncoder\'a handle_unknown="ignore" ekle.',
        'Eksik değer: StandardScaler NaN\'ı geçirir ama LogisticRegression çöker; sayısal kola SimpleImputer içeren bir Pipeline koy.'
      ],
      why: 'Eğitimde dropna ile eksikler gizlenmişti; canlı veri ise kirlidir. Pipeline\'a doldurma adımı koymak eksik değeri hem eğitimde hem canlıda aynı kuralla işler. handle_unknown="ignore" yeni kategorilere karşı servisi korur. Canlı verinin eğitimden farklı olabileceğini hep varsay.' },
    { t: 'code',
      stage: 'Meydan okuma',
      id: 'ml-pipeline-degerlendirme-10',
      diff: 3,
      q: '<p><b>İç içe çapraz doğrulama</b> (nested CV) ile model seçiminin yansız performansını ölç. <code>ic_ice_cv(pipe, izgara, X, y)</code> fonksiyonu yaz:</p><ul><li>İç döngü: <code>GridSearchCV(pipe, izgara, cv=StratifiedKFold(3, shuffle=True, random_state=1), scoring="roc_auc")</code></li><li>Dış döngü: <code>StratifiedKFold(4, shuffle=True, random_state=2)</code>; her dış katta aramayı dış eğitim kısmında fit et, dış doğrulama kısmında ROC-AUC ölç ve seçilen parametreleri kaydet.</li><li><code>{"dis_skorlar": [...3 basamak...], "ortalama": ..., "secimler": [best_params_, ...]}</code> döndür (ortalama 3 basamak, yuvarlanmamış skorlardan).</li></ul><p><code>X</code> pandas DataFrame\'dir (<code>iloc</code> kullan).</p>',
      start: 'import numpy as np\nimport pandas as pd\n\n\ndef churn_verisi(n=600, seed=1):\n    """Ilgaz Bank kurgusal müşteri kaybı (churn) verisi; eksik değerler içerir."""\n    rng = np.random.default_rng(seed)\n    yas = rng.integers(18, 75, n).astype(float)\n    bakiye = rng.gamma(2, 15000, n)\n    urun = rng.integers(1, 5, n)\n    sikayet = rng.poisson(0.5, n)\n    sehir = rng.choice(["İstanbul", "Ankara", "İzmir", "Bursa"], n)\n    segment = rng.choice(["Bireysel", "Premium", "KOBİ"], n, p=[0.6, 0.25, 0.15])\n    logit = -1.2 + 0.9 * sikayet - 0.6 * (urun - 2) + 0.03 * (yas - 45) - 0.8 * (segment == "Premium")\n    y = (rng.random(n) < 1 / (1 + np.exp(-logit))).astype(int)\n    yas[rng.random(n) < 0.08] = np.nan\n    bakiye[rng.random(n) < 0.05] = np.nan\n    X = pd.DataFrame({"yas": yas, "bakiye": bakiye.round(2), "urun": urun, "sikayet": sikayet,\n                      "sehir": sehir, "segment": segment})\n    return X, y\n\nfrom sklearn.compose import ColumnTransformer\nfrom sklearn.impute import SimpleImputer\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import OneHotEncoder, StandardScaler\n\n\ndef on_isleyici(sayisal, kategorik):\n    sayi_hatti = Pipeline([\n        ("doldur", SimpleImputer(strategy="median")),\n        ("olcek", StandardScaler()),\n    ])\n    kat_hatti = Pipeline([\n        ("doldur", SimpleImputer(strategy="most_frequent")),\n        ("kodla", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),\n    ])\n    return ColumnTransformer([\n        ("sayisal", sayi_hatti, sayisal),\n        ("kategorik", kat_hatti, kategorik),\n    ])\n\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.metrics import roc_auc_score\nfrom sklearn.model_selection import GridSearchCV, StratifiedKFold\n\n\ndef ic_ice_cv(pipe, izgara, X, y):\n    pass\n',
      sol: 'import numpy as np\nimport pandas as pd\n\n\ndef churn_verisi(n=600, seed=1):\n    """Ilgaz Bank kurgusal müşteri kaybı (churn) verisi; eksik değerler içerir."""\n    rng = np.random.default_rng(seed)\n    yas = rng.integers(18, 75, n).astype(float)\n    bakiye = rng.gamma(2, 15000, n)\n    urun = rng.integers(1, 5, n)\n    sikayet = rng.poisson(0.5, n)\n    sehir = rng.choice(["İstanbul", "Ankara", "İzmir", "Bursa"], n)\n    segment = rng.choice(["Bireysel", "Premium", "KOBİ"], n, p=[0.6, 0.25, 0.15])\n    logit = -1.2 + 0.9 * sikayet - 0.6 * (urun - 2) + 0.03 * (yas - 45) - 0.8 * (segment == "Premium")\n    y = (rng.random(n) < 1 / (1 + np.exp(-logit))).astype(int)\n    yas[rng.random(n) < 0.08] = np.nan\n    bakiye[rng.random(n) < 0.05] = np.nan\n    X = pd.DataFrame({"yas": yas, "bakiye": bakiye.round(2), "urun": urun, "sikayet": sikayet,\n                      "sehir": sehir, "segment": segment})\n    return X, y\n\nfrom sklearn.compose import ColumnTransformer\nfrom sklearn.impute import SimpleImputer\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import OneHotEncoder, StandardScaler\n\n\ndef on_isleyici(sayisal, kategorik):\n    sayi_hatti = Pipeline([\n        ("doldur", SimpleImputer(strategy="median")),\n        ("olcek", StandardScaler()),\n    ])\n    kat_hatti = Pipeline([\n        ("doldur", SimpleImputer(strategy="most_frequent")),\n        ("kodla", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),\n    ])\n    return ColumnTransformer([\n        ("sayisal", sayi_hatti, sayisal),\n        ("kategorik", kat_hatti, kategorik),\n    ])\n\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.metrics import roc_auc_score\nfrom sklearn.model_selection import GridSearchCV, StratifiedKFold\n\n\ndef ic_ice_cv(pipe, izgara, X, y):\n    dis = StratifiedKFold(4, shuffle=True, random_state=2)\n    skorlar, secimler = [], []\n    for egit_idx, dogr_idx in dis.split(X, y):\n        arama = GridSearchCV(pipe, izgara, cv=StratifiedKFold(3, shuffle=True, random_state=1), scoring="roc_auc")\n        arama.fit(X.iloc[egit_idx], y[egit_idx])\n        risk = arama.predict_proba(X.iloc[dogr_idx])[:, 1]\n        skorlar.append(roc_auc_score(y[dogr_idx], risk))\n        secimler.append(arama.best_params_)\n    return {\n        "dis_skorlar": [round(float(s), 3) for s in skorlar],\n        "ortalama": round(float(np.mean(skorlar)), 3),\n        "secimler": secimler,\n    }\n',
      tests: 'from sklearn.model_selection import cross_val_score\n_X, _y = churn_verisi()\n_p = Pipeline([("on_isleme", on_isleyici(["yas", "bakiye", "urun", "sikayet"], ["sehir", "segment"])), ("model", LogisticRegression(max_iter=1000))])\n_iz = {"model__C": [0.01, 1]}\n_r = ic_ice_cv(_p, _iz, _X, _y)\nassert set(_r) == {"dis_skorlar", "ortalama", "secimler"}, "üç anahtar olmalı"\nassert len(_r["dis_skorlar"]) == 4 and len(_r["secimler"]) == 4, "4 dış kat için 4 skor ve 4 seçim"\n_ref = cross_val_score(GridSearchCV(_p, _iz, cv=StratifiedKFold(3, shuffle=True, random_state=1), scoring="roc_auc"), _X, _y, cv=StratifiedKFold(4, shuffle=True, random_state=2), scoring="roc_auc")\nassert _r["dis_skorlar"] == [round(float(s), 3) for s in _ref], f"dış skorlar cross_val_score(GridSearchCV(...)) ile aynı olmalı: {[round(float(s), 3) for s in _ref]}"\nassert _r["ortalama"] == round(float(_ref.mean()), 3), "ortalama yuvarlanmamış skorlardan hesaplanmalı"\nassert all(s["model__C"] in (0.01, 1) for s in _r["secimler"]), "seçimler best_params_ sözlükleri olmalı"\n',
      hints: [
        'for egit_idx, dogr_idx in dis.split(X, y): X.iloc[egit_idx], y[egit_idx]',
        'Her dış katta yeni bir GridSearchCV oluştur ve fit et; arama.predict_proba en iyi modelle tahmin eder.',
        'Ortalamayı yuvarlamadan önce np.mean(skorlar) ile al.'
      ],
      why: 'İç döngü hiperparametreyi seçer, dış döngü bu seçim sürecinin bütününü hiç görmediği veride ölçer. Dış katlarda farklı parametreler seçilmesi normaldir ve seçimin ne kadar kararlı olduğunu da gösterir. Elle yazdığın döngü, cross_val_score(GridSearchCV(...)) ile birebir aynı sonucu verir.' },
    { t: 'code',
      stage: 'Mini proje',
      id: 'ml-pipeline-degerlendirme-11',
      diff: 3,
      q: '<p>Uçtan uca churn projesi. <code>churn_projesi(X, y)</code> fonksiyonu yaz:</p><ol><li>Veriyi <code>test_size=0.25, random_state=0, stratify=y</code> ile böl.</li><li>Hazır <code>on_isleyici</code> + <code>LogisticRegression(max_iter=1000, class_weight="balanced")</code> pipeline\'ı kur.</li><li><b>Yalnızca eğitim verisinde</b> <code>StratifiedKFold(5, shuffle=True, random_state=0)</code> ile ROC-AUC çapraz doğrulaması yap.</li><li>Pipeline\'ı eğitim verisinde fit et, test ROC-AUC hesapla.</li><li>Modeli <code>joblib</code> ile <code>BytesIO</code>\'ya kaydet, geri yükle, test tahminlerinin aynı olduğunu kontrol et.</li></ol><p>Döndür: <code>{"cv_ort", "cv_std", "test_auc"}</code> (3 basamak), <code>"boyut_bayt"</code> (int), <code>"ayni_tahmin"</code> (bool), <code>"model"</code> (yüklenmiş pipeline).</p>',
      start: 'import numpy as np\nimport pandas as pd\n\n\ndef churn_verisi(n=600, seed=1):\n    """Ilgaz Bank kurgusal müşteri kaybı (churn) verisi; eksik değerler içerir."""\n    rng = np.random.default_rng(seed)\n    yas = rng.integers(18, 75, n).astype(float)\n    bakiye = rng.gamma(2, 15000, n)\n    urun = rng.integers(1, 5, n)\n    sikayet = rng.poisson(0.5, n)\n    sehir = rng.choice(["İstanbul", "Ankara", "İzmir", "Bursa"], n)\n    segment = rng.choice(["Bireysel", "Premium", "KOBİ"], n, p=[0.6, 0.25, 0.15])\n    logit = -1.2 + 0.9 * sikayet - 0.6 * (urun - 2) + 0.03 * (yas - 45) - 0.8 * (segment == "Premium")\n    y = (rng.random(n) < 1 / (1 + np.exp(-logit))).astype(int)\n    yas[rng.random(n) < 0.08] = np.nan\n    bakiye[rng.random(n) < 0.05] = np.nan\n    X = pd.DataFrame({"yas": yas, "bakiye": bakiye.round(2), "urun": urun, "sikayet": sikayet,\n                      "sehir": sehir, "segment": segment})\n    return X, y\n\nfrom sklearn.compose import ColumnTransformer\nfrom sklearn.impute import SimpleImputer\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import OneHotEncoder, StandardScaler\n\n\ndef on_isleyici(sayisal, kategorik):\n    sayi_hatti = Pipeline([\n        ("doldur", SimpleImputer(strategy="median")),\n        ("olcek", StandardScaler()),\n    ])\n    kat_hatti = Pipeline([\n        ("doldur", SimpleImputer(strategy="most_frequent")),\n        ("kodla", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),\n    ])\n    return ColumnTransformer([\n        ("sayisal", sayi_hatti, sayisal),\n        ("kategorik", kat_hatti, kategorik),\n    ])\n\nimport io\nimport joblib\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.metrics import roc_auc_score\nfrom sklearn.model_selection import StratifiedKFold, cross_val_score, train_test_split\n\n\ndef churn_projesi(X, y):\n    pass\n',
      sol: 'import numpy as np\nimport pandas as pd\n\n\ndef churn_verisi(n=600, seed=1):\n    """Ilgaz Bank kurgusal müşteri kaybı (churn) verisi; eksik değerler içerir."""\n    rng = np.random.default_rng(seed)\n    yas = rng.integers(18, 75, n).astype(float)\n    bakiye = rng.gamma(2, 15000, n)\n    urun = rng.integers(1, 5, n)\n    sikayet = rng.poisson(0.5, n)\n    sehir = rng.choice(["İstanbul", "Ankara", "İzmir", "Bursa"], n)\n    segment = rng.choice(["Bireysel", "Premium", "KOBİ"], n, p=[0.6, 0.25, 0.15])\n    logit = -1.2 + 0.9 * sikayet - 0.6 * (urun - 2) + 0.03 * (yas - 45) - 0.8 * (segment == "Premium")\n    y = (rng.random(n) < 1 / (1 + np.exp(-logit))).astype(int)\n    yas[rng.random(n) < 0.08] = np.nan\n    bakiye[rng.random(n) < 0.05] = np.nan\n    X = pd.DataFrame({"yas": yas, "bakiye": bakiye.round(2), "urun": urun, "sikayet": sikayet,\n                      "sehir": sehir, "segment": segment})\n    return X, y\n\nfrom sklearn.compose import ColumnTransformer\nfrom sklearn.impute import SimpleImputer\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import OneHotEncoder, StandardScaler\n\n\ndef on_isleyici(sayisal, kategorik):\n    sayi_hatti = Pipeline([\n        ("doldur", SimpleImputer(strategy="median")),\n        ("olcek", StandardScaler()),\n    ])\n    kat_hatti = Pipeline([\n        ("doldur", SimpleImputer(strategy="most_frequent")),\n        ("kodla", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),\n    ])\n    return ColumnTransformer([\n        ("sayisal", sayi_hatti, sayisal),\n        ("kategorik", kat_hatti, kategorik),\n    ])\n\nimport io\nimport joblib\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.metrics import roc_auc_score\nfrom sklearn.model_selection import StratifiedKFold, cross_val_score, train_test_split\n\n\ndef churn_projesi(X, y):\n    X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, random_state=0, stratify=y)\n    pipe = Pipeline([\n        ("on_isleme", on_isleyici(["yas", "bakiye", "urun", "sikayet"], ["sehir", "segment"])),\n        ("model", LogisticRegression(max_iter=1000, class_weight="balanced")),\n    ])\n    cv = cross_val_score(pipe, X_tr, y_tr, cv=StratifiedKFold(5, shuffle=True, random_state=0), scoring="roc_auc")\n    pipe.fit(X_tr, y_tr)\n    test_auc = roc_auc_score(y_te, pipe.predict_proba(X_te)[:, 1])\n    tampon = io.BytesIO()\n    joblib.dump(pipe, tampon)\n    boyut = tampon.tell()\n    tampon.seek(0)\n    yuklenen = joblib.load(tampon)\n    ayni = bool((yuklenen.predict(X_te) == pipe.predict(X_te)).all())\n    return {\n        "cv_ort": round(float(cv.mean()), 3),\n        "cv_std": round(float(cv.std()), 3),\n        "test_auc": round(float(test_auc), 3),\n        "boyut_bayt": int(boyut),\n        "ayni_tahmin": ayni,\n        "model": yuklenen,\n    }\n',
      tests: '_X, _y = churn_verisi()\n_r = churn_projesi(_X, _y)\nassert set(_r) == {"cv_ort", "cv_std", "test_auc", "boyut_bayt", "ayni_tahmin", "model"}, "altı anahtar olmalı"\n_a, _b, _c, _d = train_test_split(_X, _y, test_size=0.25, random_state=0, stratify=_y)\n_p = Pipeline([("on_isleme", on_isleyici(["yas", "bakiye", "urun", "sikayet"], ["sehir", "segment"])), ("model", LogisticRegression(max_iter=1000, class_weight="balanced"))])\n_cv = cross_val_score(_p, _a, _c, cv=StratifiedKFold(5, shuffle=True, random_state=0), scoring="roc_auc")\nassert _r["cv_ort"] == round(float(_cv.mean()), 3), "CV yalnızca eğitim verisinde yapılmalı (test sızmamalı)"\nassert _r["cv_std"] == round(float(_cv.std()), 3), "cv_std yanlış"\n_p.fit(_a, _c)\nassert _r["test_auc"] == round(float(roc_auc_score(_d, _p.predict_proba(_b)[:, 1])), 3), "test AUC yanlış"\nassert type(_r["boyut_bayt"]) is int and _r["boyut_bayt"] > 1000, "boyut_bayt pozitif int"\nassert _r["ayni_tahmin"] is True, "yüklenen model aynı tahminleri vermeli"\nassert isinstance(_r["model"], Pipeline) and hasattr(_r["model"].named_steps["model"], "coef_"), "yüklenmiş, fit edilmiş pipeline dönmeli"\n',
      hints: [
        'Önce böl; cross_val_score\'a yalnızca X_tr, y_tr ver.',
        'Kaydetme: joblib.dump(pipe, tampon); boyut = tampon.tell(); tampon.seek(0); joblib.load(tampon)',
        'ayni_tahmin için bool((a == b).all()) — numpy.bool_ yerine Python bool.'
      ],
      why: 'Bu akış gerçek bir projenin iskeletidir: test setini en başta ayır, model seçimini ve belirsizlik tahminini yalnızca eğitimde CV ile yap, test setine bir kez bak, ön işleme + modeli tek nesne olarak kaydet ve kaydın doğru yüklendiğini doğrula. CV ortalaması ile test skorunun yakın olması, değerlendirmenin tutarlı olduğuna işarettir.' }
  ],
  faq: [
    { q: 'Ağaç modelleri için de ölçekleme gerekir mi?',
      a: 'Hayır. Karar ağacı, rastgele orman ve gradient boosting eşik karşılaştırmasıyla çalıştığı için ölçekten etkilenmez. Doğrusal modeller, KNN, SVM ve sinir ağları ise etkilenir. Yine de pipeline\'da ölçekleme bulundurmak zararsızdır ve model değiştirmeyi kolaylaştırır.' },
    { q: 'Kaç katlı çapraz doğrulama kullanmalıyım?',
      a: '5 ya da 10 kat yaygın varsayılandır. Küçük veride 10 kat ya da tekrarlı CV (RepeatedStratifiedKFold) daha kararlı sonuç verir; büyük veride 3-5 kat ve hatta tek bir doğrulama seti yeterli olabilir.' },
    { q: 'GridSearchCV mi RandomizedSearchCV mi?',
      a: 'Az sayıda parametre ve değer varsa Grid; geniş arama uzayı ve sürekli parametreler (C için loguniform dağılımı gibi) varsa Randomized. Aynı bütçeyle Randomized genellikle önemli parametrelerde daha çok farklı değer dener.' },
    { q: 'OneHotEncoder\'da sparse_output hatası alıyorum.',
      a: 'scikit-learn 1.2 öncesinde parametrenin adı sparse idi. Sürümünü kontrol et (sklearn.__version__); 1.2 ve sonrasında sparse_output kullanılır. Eski kodu taşırken bu ad değişikliği en sık karşılaşılan uyumsuzluktur.' },
    { q: 'Kaydedilen modeli başka bir bilgisayarda açabilir miyim?',
      a: 'Aynı Python ve scikit-learn sürümleri kuruluysa evet. Bu yüzden requirements.txt ya da lock dosyasını model dosyasıyla birlikte sakla. Dillerden bağımsız taşıma için ONNX gibi biçimler de vardır.' }
  ],
  mistakes: [
    { bad: 'X_s = StandardScaler().fit_transform(X)\ncross_val_score(LogisticRegression(), X_s, y, cv=5)',
      good: 'pipe = Pipeline([("olcek", StandardScaler()), ("model", LogisticRegression())])\ncross_val_score(pipe, X, y, cv=5)',
      why: 'Ölçekleyici tüm veriyi görürse doğrulama katları sızar; pipeline her katta yeniden fit eder.' },
    { bad: 'sc.fit_transform(X_test)',
      good: 'sc.transform(X_test)',
      why: 'Test verisi eğitimden öğrenilen istatistiklerle dönüştürülür; test üzerinde yeniden fit etmek hem sızıntı hem tutarsızlıktır.' },
    { bad: 'OneHotEncoder()',
      good: 'OneHotEncoder(handle_unknown="ignore", sparse_output=False)',
      why: 'Varsayılan ayar canlıda görülmemiş kategoride hata verir; ignore bunu güvenle işler.' },
    { bad: 'GridSearchCV(pipe, {"C": [0.1, 1, 10]})',
      good: 'GridSearchCV(pipe, {"model__C": [0.1, 1, 10]})',
      why: 'Pipeline içindeki parametreye adım adı ve çift alt çizgiyle erişilir; aksi hâlde "Invalid parameter" hatası alırsın.' },
    { bad: 'joblib.dump(model, tampon)\nm = joblib.load(tampon)',
      good: 'joblib.dump(model, tampon)\ntampon.seek(0)\nm = joblib.load(tampon)',
      why: 'Yazdıktan sonra imleç tamponun sonundadır; okumadan önce başa sarılmalıdır.' }
  ]
});
})(window);
