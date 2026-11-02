/* Kesit Python — ileri: derin-ogrenme-giris */
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push({
  id: 'derin-ogrenme-giris',
  lv: 'ileri',
  mod: 'Makine Öğrenmesi',
  min: 60,
  needs: ['numpy', 'scikit-learn', 'pandas'],
  title: 'Sinir ağlarına giriş: numpy\'dan PyTorch\'a',
  sum: 'Nöron, katman ve aktivasyon; ileri yayılım ve kayıp; numpy ile 2 katmanlı ağda geri yayılım ve gradyan inişi; mini-batch, öğrenme oranı, eğitim eğrisi; dropout, erken durdurma ve L2; scikit-learn MLPClassifier ile tablo verisi ve gradient boosting karşılaştırması; PyTorch gösterimi; CNN, RNN, transformer ve transfer öğrenmeye bakış.',
  goals: [
    'Nöron, katman ve aktivasyon kavramlarını açıklayıp numpy ile ileri yayılım yazabilirim',
    'Kayıp fonksiyonu, gradyan inişi ve geri yayılımla iki katmanlı bir ağı sıfırdan eğitebilirim',
    'Eğitim eğrisini okuyup öğrenme oranı, dropout, L2 ve erken durdurma kararları verebilirim',
    'scikit-learn MLPClassifier\'ı ölçekleme pipeline\'ıyla kullanıp gradient boosting ile karşılaştırabilirim',
    'Bir PyTorch eğitim döngüsünü okuyup derin öğrenmenin ne zaman gerektiğine karar verebilirim'
  ],
  body: `<h2>Sinir ağı: katman katman öğrenen bir fonksiyon</h2>
<p>Bir el yazısı rakam görüntüsü 64 pikselden oluşur. Hangi pikselin hangi rakamı işaret ettiğini kural olarak yazamazsın; bir lojistik regresyon da pikselleri tek tek ağırlıklandırmakla sınırlı kalır. <b>Sinir ağı</b> (neural network) ise ara katmanlarda kendi özelliklerini öğrenir: ilk katman kenarları, sonraki katman kenarlardan oluşan şekilleri. Bu, görüntü, ses ve metinde derin öğrenmeyi (deep learning) vazgeçilmez yapan özelliktir.</p>
<p>Bu derste sinir ağını önce <b>numpy ile sıfırdan</b> kuracaksın (ileri yayılım, kayıp, geri yayılım, gradyan inişi), sonra scikit-learn'ün <code>MLPClassifier</code>'ı ile Ilgaz Bank verisinde ağaç modelleriyle karşılaştıracak, en sonda PyTorch kodunu okuyacaksın. <code>ml-giris</code> ve <code>ml-pipeline-degerlendirme</code> derslerindeki bölme, ölçekleme ve sızıntı kuralları burada da aynen geçerli.</p>

<h2>Nöron, katman, aktivasyon</h2>
<p>Bir <b>nöron</b> girdilerin ağırlıklı toplamını alır, bir sapma (bias) ekler ve sonucu bir <b>aktivasyon fonksiyonundan</b> geçirir: <code>a = f(w·x + b)</code>. Bir <b>katman</b> aynı girdiye bakan nöronlar kümesidir ve matris çarpımıyla tek satırda hesaplanır: <code>A = f(X @ W + b)</code>. X'in şekli (örnek, girdi), W'nin (girdi, nöron), çıktınınki (örnek, nöron).</p>
<div class="tbl-wrap"><table>
<tr><th>Aktivasyon</th><th>Formül</th><th>Nerede?</th></tr>
<tr><td>ReLU</td><td>max(0, z)</td><td>Gizli katmanların varsayılanı; hızlı, gradyanı sönmez</td></tr>
<tr><td>Sigmoid</td><td>1 / (1 + e<sup>−z</sup>)</td><td>İkili sınıflandırma çıktısı (olasılık)</td></tr>
<tr><td>Tanh</td><td>(e<sup>z</sup> − e<sup>−z</sup>) / (e<sup>z</sup> + e<sup>−z</sup>)</td><td>−1..1 arası; RNN'lerde</td></tr>
<tr><td>Softmax</td><td>e<sup>z<sub>i</sub></sup> / Σ e<sup>z<sub>j</sub></sup></td><td>Çok sınıflı çıktı; olasılıklar 1'e toplanır</td></tr>
</table></div>
<p>Aktivasyon neden şart? Doğrusal katmanları üst üste koymak yine doğrusal bir fonksiyondur: <code>(X @ W1) @ W2 = X @ (W1 @ W2)</code>. Doğrusal olmayan aktivasyon olmadan 10 katmanlı ağ tek bir lojistik regresyondan güçlü değildir.</p>
<pre class="py">import numpy as np

def relu(z):
    return np.maximum(0, z)

def sigmoid(z):
    return 1 / (1 + np.exp(-z))

def softmax(z):
    z = z - z.max(axis=1, keepdims=True)        # taşmayı önler, sonucu değiştirmez
    e = np.exp(z)
    return e / e.sum(axis=1, keepdims=True)

z = np.array([[-2.0, 0.0, 3.0]])
print("relu   :", relu(z))
print("sigmoid:", sigmoid(z).round(3))
print("softmax:", softmax(z).round(3), "toplam", softmax(z).sum())
</pre>

<h2>İleri yayılım ve kayıp</h2>
<p>İki katmanlı bir ağ (bir gizli katman) için <b>ileri yayılım</b> (forward pass): <code>Z1 = X @ W1 + b1</code>, <code>A1 = relu(Z1)</code>, <code>Z2 = A1 @ W2 + b2</code>, <code>p = sigmoid(Z2)</code>. Tahminin ne kadar kötü olduğunu <b>kayıp fonksiyonu</b> (loss) söyler: regresyonda ortalama kare hata (MSE), ikili sınıflandırmada <b>ikili çapraz entropi</b> (binary cross-entropy): <code>−ortalama[y·log p + (1 − y)·log(1 − p)]</code>. Doğru sınıfa düşük olasılık veren tahmin çok ağır cezalandırılır.</p>
<pre class="py">rng = np.random.default_rng(0)
X = rng.normal(size=(5, 3))                    # 5 örnek, 3 özellik
W1, b1 = rng.normal(0, 0.5, (3, 4)), np.zeros(4)   # 4 gizli nöron
W2, b2 = rng.normal(0, 0.5, (4, 1)), np.zeros(1)

A1 = relu(X @ W1 + b1)
p = sigmoid(A1 @ W2 + b2)
print("şekiller:", X.shape, A1.shape, p.shape)
y = np.array([[1], [0], [1], [0], [1]])
kayip = -np.mean(y * np.log(p) + (1 - y) * np.log(1 - p))
print("ikili çapraz entropi:", round(float(kayip), 4))
</pre>

<h2>Gradyan inişi ve geri yayılım</h2>
<p>Öğrenme, kaybı azaltacak yönde ağırlıkları küçük adımlarla değiştirmektir: <code>W ← W − η · ∂L/∂W</code>. η <b>öğrenme oranıdır</b> (learning rate). Gradyanları her ağırlık için ayrı ayrı türevleyerek bulmak yerine <b>geri yayılım</b> (backpropagation) zincir kuralını çıktıdan girdiye doğru uygular. Sigmoid + çapraz entropi ikilisinin güzel bir özelliği var: çıktıdaki hata yalnızca <code>p − y</code>'dir.</p>
<div class="steps-list"><ol>
<li><code>dZ2 = (p − y) / n</code></li>
<li><code>dW2 = A1ᵀ @ dZ2</code>, <code>db2 = dZ2.sum(axis=0)</code></li>
<li><code>dA1 = dZ2 @ W2ᵀ</code>, ReLU'nun türevi: <code>dZ1 = dA1 · (Z1 &gt; 0)</code></li>
<li><code>dW1 = Xᵀ @ dZ1</code>, <code>db1 = dZ1.sum(axis=0)</code></li>
<li>Her parametreyi <code>param −= η · grad</code> ile güncelle.</li>
</ol></div>
<pre class="py">from sklearn.datasets import make_moons

X, y = make_moons(n_samples=400, noise=0.2, random_state=0)
y = y.reshape(-1, 1)
rng = np.random.default_rng(1)
W1, b1 = rng.normal(0, 1, (2, 16)), np.zeros(16)
W2, b2 = rng.normal(0, 1, (16, 1)), np.zeros(1)
eta, n = 0.5, len(X)
for epoch in range(2001):
    Z1 = X @ W1 + b1; A1 = relu(Z1); p = sigmoid(A1 @ W2 + b2)       # ileri
    dZ2 = (p - y) / n                                                # geri
    dW2, db2 = A1.T @ dZ2, dZ2.sum(axis=0)
    dZ1 = (dZ2 @ W2.T) * (Z1 &gt; 0)
    dW1, db1 = X.T @ dZ1, dZ1.sum(axis=0)
    W1 -= eta * dW1; b1 -= eta * db1; W2 -= eta * dW2; b2 -= eta * db2
    if epoch % 500 == 0:
        kayip = -np.mean(y * np.log(p + 1e-12) + (1 - y) * np.log(1 - p + 1e-12))
        print(f"epoch {epoch:4d}  kayıp {kayip:.3f}  doğruluk {((p &gt; 0.5) == y).mean():.3f}")
</pre>
<p>İki ay şeklindeki veri doğrusal ayrılamaz; lojistik regresyon %85 civarında takılır, gizli katmanlı ağ %95'i geçer. Gizli katman ayırıcı eğriyi kendi öğrendi.</p>

<h2>Mini-batch, öğrenme oranı, epoch</h2>
<p>Yukarıda her adımda tüm veriyi kullandık (tam yığın). Büyük veride her adımda küçük bir parça (<b>mini-batch</b>, ör. 32 ya da 256 örnek) kullanılır: adımlar ucuzlar ve gürültü yerel tuzaklardan kaçmaya yardım eder. Verinin tamamının bir kez görülmesine <b>epoch</b> denir; her epoch başında veri karıştırılır.</p>
<div class="tbl-wrap"><table>
<tr><th>Eğitim eğrisinde gördüğün</th><th>Olası neden</th><th>Ne yap?</th></tr>
<tr><td>Kayıp patlıyor, nan oluyor</td><td>Öğrenme oranı çok büyük</td><td>η'yı 10'a böl; girdileri ölçekle</td></tr>
<tr><td>Kayıp çok yavaş iniyor</td><td>η çok küçük ya da ölçeksiz girdi</td><td>η'yı artır, Adam optimizasyonu kullan</td></tr>
<tr><td>Eğitim kaybı iniyor, doğrulama yükseliyor</td><td>Aşırı öğrenme</td><td>Erken durdurma, dropout, L2, daha çok veri</td></tr>
<tr><td>İkisi de yüksek ve düz</td><td>Model çok küçük</td><td>Nöron/katman ekle, daha uzun eğit</td></tr>
</table></div>

<h2>Aşırı öğrenmeye karşı: düzenlileştirme, dropout, erken durdurma</h2>
<ul>
<li><b>L2 düzenlileştirme</b> (weight decay): kayba <code>λ·Σw²</code> ekler, büyük ağırlıkları cezalandırır. sklearn'de <code>alpha</code>.</li>
<li><b>Dropout:</b> eğitimde her adımda nöronların rastgele bir kısmını (p oranında) sıfırlar; ağ tek bir nörona yaslanamaz. "Ters dropout" (inverted dropout) kalanları <code>1/(1 − p)</code> ile ölçekler ki tahmin anında hiçbir şey yapmak gerekmesin. Tahminde dropout <b>kapalıdır</b>.</li>
<li><b>Erken durdurma</b> (early stopping): doğrulama kaybı <code>sabir</code> (patience) epoch boyunca iyileşmezse dur ve en iyi epoch'un ağırlıklarına dön.</li>
</ul>
<pre class="py">def dropout(A, p, rng, egitim=True):
    if not egitim or p == 0:
        return A
    maske = rng.random(A.shape) &gt;= p
    return A * maske / (1 - p)

A = np.ones((2, 8))
r = np.random.default_rng(0)
print(dropout(A, 0.5, r))
print("ortalama korunur mu?", dropout(np.ones((1000, 100)), 0.5, r).mean().round(2))
</pre>

<h2>scikit-learn MLPClassifier ile tablo verisi</h2>
<p>Küçük ve orta boy tablo verisinde PyTorch'a gerek yok: <code>MLPClassifier</code> ve <code>MLPRegressor</code> Adam optimizasyonu, L2 (<code>alpha</code>), mini-batch ve erken durdurmayı hazır sunar. İki kural: girdileri <b>mutlaka ölçekle</b> (Pipeline içinde) ve <code>random_state</code> ver (başlangıç ağırlıkları rastgeledir).</p>
<pre class="py">from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split
from sklearn.neural_network import MLPClassifier
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

Xd, yd = load_digits(return_X_y=True)          # 8x8 piksel, 10 rakam
Xa, Xb, ya, yb = train_test_split(Xd, yd, test_size=0.25, random_state=0, stratify=yd)
mlp = make_pipeline(StandardScaler(), MLPClassifier(hidden_layer_sizes=(64,), max_iter=300, random_state=0))
mlp.fit(Xa, ya)
print("rakam doğruluğu:", round(mlp.score(Xb, yb), 3), " epoch:", mlp[-1].n_iter_)
</pre>
<p>Ilgaz Bank'ın "ikinci yarıda kim çok harcayacak?" tablosunda (<code>ozellik-muhendisligi</code> dersindeki özellikler) ise tek gizli katmanlı MLP ile <code>HistGradientBoostingClassifier</code> neredeyse aynı AUC'yi (≈0.82) veriyor; boosting ölçekleme istemez, daha hızlı eğitilir ve ayarı daha az hassastır. Mini projede bunu kendin ölçeceksin.</p>

<h2>PyTorch: tensör, nn.Module, eğitim döngüsü, DataLoader</h2>
<p>Gerçek derin öğrenme projelerinde PyTorch kullanılır: GPU üzerinde hesap yapar ve gradyanları <b>otomatik türev</b> (autograd) ile kendisi bulur. Elle yazdığın geri yayılımı <code>loss.backward()</code> tek satırda yapar. PyTorch tarayıcıda çalışmaz; kodu oku ve kendi bilgisayarında dene.</p>
<pre class="code">import torch
from torch import nn
from torch.utils.data import DataLoader, TensorDataset

X_t = torch.tensor(X_egitim, dtype=torch.float32)
y_t = torch.tensor(y_egitim, dtype=torch.float32).unsqueeze(1)
yukleyici = DataLoader(TensorDataset(X_t, y_t), batch_size=32, shuffle=True)

class HarcamaAgi(nn.Module):
    def __init__(self, girdi):
        super().__init__()
        self.katmanlar = nn.Sequential(
            nn.Linear(girdi, 16), nn.ReLU(), nn.Dropout(0.2),
            nn.Linear(16, 1))                     # sigmoid kayıp içinde
    def forward(self, x):
        return self.katmanlar(x)

model = HarcamaAgi(X_t.shape[1])
kayip_fn = nn.BCEWithLogitsLoss()
opt = torch.optim.Adam(model.parameters(), lr=1e-3, weight_decay=1e-4)
for epoch in range(50):
    model.train()                                 # dropout açık
    for xb, yb in yukleyici:
        opt.zero_grad()                           # eski gradyanları sil
        kayip = kayip_fn(model(xb), yb)
        kayip.backward()                          # geri yayılım
        opt.step()                                # ağırlık güncelle
model.eval()                                      # dropout kapalı
with torch.no_grad():
    olasilik = torch.sigmoid(model(torch.tensor(X_test, dtype=torch.float32)))
</pre>
<div class="note"><b>Kendi bilgisayarında dene</b><code>pip install torch</code> (ekran kartın varsa pytorch.org'daki CUDA komutunu kullan). Döngüdeki üç satırlık ritüel (<code>zero_grad</code>, <code>backward</code>, <code>step</code>) her PyTorch projesinde aynıdır; <code>model.train()</code> ve <code>model.eval()</code> geçişini unutmak dropout'un tahminde açık kalmasına yol açar.</div>

<h2>CNN, RNN, transformer ve transfer öğrenme</h2>
<div class="tbl-wrap"><table>
<tr><th>Mimari</th><th>Fikir</th><th>Tipik kullanım</th></tr>
<tr><td>CNN (evrişimli ağ)</td><td>Küçük filtreler görüntü üzerinde kayar; komşu piksellerden yerel desen öğrenir</td><td>Görüntü sınıflandırma, belge tarama, kalite kontrol</td></tr>
<tr><td>RNN / LSTM</td><td>Diziyi adım adım okur, gizli durum taşır</td><td>Eski nesil dil ve zaman serisi modelleri</td></tr>
<tr><td>Transformer</td><td>Dikkat (attention) ile her öğe diğer tüm öğelere bakar; paralel eğitilir</td><td>Dil modelleri (GPT, BERT), çeviri, artık görüntü de</td></tr>
</table></div>
<p><b>Transfer öğrenme:</b> milyonlarca görüntü ya da metinle önceden eğitilmiş bir modeli alıp son katmanlarını kendi küçük verinle ince ayarlarsın (fine-tuning). 500 etiketli fatura görüntüsüyle sıfırdan CNN eğitilmez, ama hazır bir ResNet'in son katmanı eğitilebilir. Metin tarafını <code>nlp-metin</code> ve <code>embedding-vektor-arama</code> derslerinde göreceksin.</p>

<h2>Ne zaman derin öğrenme, ne zaman gradient boosting?</h2>
<div class="tbl-wrap"><table>
<tr><th>Durum</th><th>Tercih</th></tr>
<tr><td>Tablo verisi (müşteri, işlem, sipariş), binlerce–milyonlarca satır</td><td>Gradient boosting (LightGBM, XGBoost, HistGradientBoosting)</td></tr>
<tr><td>Görüntü, ses, serbest metin</td><td>Derin öğrenme (çoğu zaman önceden eğitilmiş model)</td></tr>
<tr><td>Çok sayıda kategorik değer + metin + görüntü birlikte</td><td>Derin öğrenme (embedding katmanları)</td></tr>
<tr><td>Az veri, açıklanabilirlik şart (kredi kararı)</td><td>Lojistik regresyon ya da sığ ağaç modelleri</td></tr>
</table></div>
<div class="note"><b>Gerçek işte</b>Bankalarda kredi ve churn skorlaması hâlâ büyük oranda gradient boosting ve lojistik regresyonla yapılır; açıklanabilirlik ve düzenleyici gereksinimler belirleyicidir. Derin öğrenme aynı kurumlarda belge okuma (OCR), çağrı merkezi ses analizi, dolandırıcılıkta işlem dizisi modelleri ve müşteri hizmetleri sohbet botlarında kullanılır.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Başlatma ve normalizasyon</h3>
<p>Ağırlıklar hepsi sıfırla başlatılırsa tüm nöronlar aynı şeyi öğrenir (simetri). ReLU ağlarında He başlatma (std = √(2/girdi)) yaygındır. Batch normalization ve layer normalization katman çıktılarını ölçekleyerek derin ağların kararlı eğitilmesini sağlar.</p>
<h3>Gradyan kontrolü</h3>
<p>Elle yazılan geri yayılımı test etmenin yolu sayısal türevdir: <code>(L(w + ε) − L(w − ε)) / 2ε</code>. Analitik ve sayısal gradyanın göreli farkı 1e-6 civarındaysa kod doğrudur. Meydan okuma alıştırmasında bunu yazacaksın.</p>
<h3>Mülakat cümlesi</h3>
<p>"Tablo verisinde önce gradient boosting ile güçlü bir temel çizgi kurarım; sinir ağını ancak veri yapısız ya da çok büyükse, ya da embedding gerekiyorsa denerim. Eğitim eğrisini izler, erken durdurma ve düzenlileştirme kullanır, girdileri Pipeline içinde ölçeklerim."</p>
</section>`,
  ex: [
    {
      t: 'mc',
      stage: 'Isınma',
      q: 'Bir ekip 5 katmanlı bir ağ kuruyor ama hiçbir katmanda aktivasyon fonksiyonu kullanmıyor. Bu ağın gücü hakkında ne söylenebilir?',
      o: [
        'Katman sayısı arttıkça her katman yeni bir soyutlama ekler ve daha karmaşık karar sınırları öğrenir',
        'Tek bir doğrusal katmana eşdeğerdir; doğrusal olmayan desenleri öğrenemez',
        'Yalnızca eğitimi yavaşlatır; yeterince uzun eğitilirse sonuç aktivasyonlu ağla aynı olur',
        'Aşırı öğrenme riski ortadan kalkar ve daha iyi genelleşir'
      ],
      a: 1,
      why: 'Doğrusal dönüşümlerin bileşimi yine doğrusaldır: X·W1·W2·...·W5 = X·W. Ağa doğrusal olmayan ifade gücünü veren aktivasyonlardır (ReLU, tanh). Katman eklemek tek başına hiçbir şey kazandırmaz.'
    },
    {
      t: 'mc',
      stage: 'Isınma',
      q: 'Eğitim sırasında kayıp birkaç adımda hızla büyüyüp <code>nan</code> oluyor. En olası neden ve ilk yapılacak şey?',
      o: [
        'Öğrenme oranı çok büyük; oranı düşür ve girdileri ölçekle',
        'Epoch sayısı çok az; eğitimi birkaç kat daha uzun sürdürmek kaybı sabitler',
        'Ağ problem için çok küçük; her gizli katmana nöron eklemek gerekir',
        'Dropout oranı düşük; 0.9 yap'
      ],
      a: 0,
      why: 'Büyük adımlar minimumun üzerinden atlayıp sapar; ağırlıklar büyür, exp taşar ve nan oluşur. Önce öğrenme oranını düşür, girdileri ölçekle. Daha uzun eğitmek ya da büyütmek sorunu büyütür.'
    },
    {
      t: 'mc',
      stage: 'Isınma',
      q: 'Ilgaz Bank 50 bin müşterilik bir tabloyla (yaş, segment, işlem özetleri) churn tahmini yapacak. Hangi başlangıç en makuldür?',
      o: [
        'Sıfırdan eğitilen derin bir transformer modeli; en yeni mimari en iyi sonucu verir',
        'Önceden eğitilmiş bir görüntü modeliyle transfer öğrenme',
        'Gradient boosting ile güçlü bir temel çizgi, gerekirse MLP ile karşılaştırma',
        'Tek gizli katmanlı bir ağ; tablo verisinde başka model türleri işe yaramaz'
      ],
      a: 2,
      why: 'Tablo verisinde gradient boosting çoğu zaman en iyi ya da eşit sonucu, daha az ayar ve daha hızlı eğitimle verir. Derin öğrenme yapısız veride (görüntü, metin, ses) öne çıkar. Karşılaştırma aynı doğrulama düzeninde yapılmalıdır.'
    },
    {
      t: 'predict',
      stage: 'Kodu oku',
      q: 'Aktivasyonlar ne yazdırır?',
      code: 'import numpy as np\n\nz = np.array([-1.0, 0.0, 2.0])\nprint(np.maximum(0, z).tolist())\nprint((1 / (1 + np.exp(-z))).round(2).tolist())\n',
      o: ['[0.0, 0.0, 2.0]\n[0.27, 0.5, 0.88]', '[-1.0, 0.0, 2.0]\n[0.27, 0.5, 0.88]', '[0.0, 0.0, 2.0]\n[0.0, 0.5, 1.0]', '[1.0, 0.0, 2.0]\n[0.27, 0.5, 0.88]'],
      a: 0,
      why: 'ReLU negatifleri 0 yapar, pozitifleri olduğu gibi bırakır. Sigmoid 0\'da tam 0.5\'tir; −1 için 0.27, 2 için 0.88 verir ve hiçbir zaman tam 0 ya da 1 olmaz.'
    },
    {
      t: 'predict',
      stage: 'Kodu oku',
      q: 'İleri yayılımda şekiller ne olur?',
      code: 'import numpy as np\n\nX = np.zeros((32, 10))\nW1, b1 = np.zeros((10, 64)), np.zeros(64)\nW2, b2 = np.zeros((64, 3)), np.zeros(3)\nA1 = np.maximum(0, X @ W1 + b1)\nZ2 = A1 @ W2 + b2\nprint(A1.shape, Z2.shape, W1.size + b1.size + W2.size + b2.size)\n',
      o: ['(32, 64) (32, 3) 899', '(64, 32) (3, 32) 899', '(32, 64) (32, 3) 832', '(32, 10) (32, 3) 899'],
      a: 0,
      why: 'Matris çarpımı (32, 10) @ (10, 64) → (32, 64); (32, 64) @ (64, 3) → (32, 3). Parametre sayısı: 10·64 + 64 + 64·3 + 3 = 899. Sapmaları (bias) saymayı unutmak 832 verir.'
    },
    {
      t: 'predict',
      stage: 'Kodu oku',
      q: 'Tek bir gradyan inişi adımı ne yazdırır?',
      code: 'import numpy as np\n\nx = np.array([1.0, 2.0, 3.0])\ny = np.array([2.0, 4.0, 6.0])\nw, eta = 0.0, 0.1\nfor adim in range(2):\n    tahmin = w * x\n    grad = np.mean(2 * (tahmin - y) * x)\n    w = w - eta * grad\n    print(adim, round(float(w), 3))\n',
      o: ['0 1.867\n1 1.991', '0 -1.867\n1 -1.991', '0 1.867\n1 1.867', '0 0.933\n1 1.556'],
      a: 0,
      why: 'İlk adımda tahmin 0: grad = ortalama(2·(0 − y)·x) = −(4 + 16 + 36) / 3 = −18.67, w = 0 − 0.1·(−18.67) = 1.867. İkinci adımda tahmin hâlâ düşük olduğu için grad yine negatif ama küçük; w 1.991\'e çıkar ve gerçek değer 2\'ye yaklaşır. İşaret karışıklığı (w + eta·grad) w\'yu negatife götürürdü.'
    },
    {
      t: 'order',
      stage: 'Kodu oku',
      q: '<p>Rakam verisinde ölçekleme + MLP pipeline\'ı kurup erken durdurmayla eğiten ve test doğruluğunun 0.9\'u geçip geçmediğini yazdıran programın satırlarını sırala.</p>',
      lines: [
        'from sklearn.datasets import load_digits',
        'from sklearn.model_selection import train_test_split',
        'from sklearn.neural_network import MLPClassifier',
        'from sklearn.pipeline import make_pipeline',
        'from sklearn.preprocessing import StandardScaler',
        'X, y = load_digits(return_X_y=True)',
        'X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, random_state=0)',
        'model = make_pipeline(StandardScaler(), MLPClassifier(hidden_layer_sizes=(32,), early_stopping=True, max_iter=500, random_state=0))',
        'print(model.fit(X_tr, y_tr).score(X_te, y_te) > 0.9)'
      ],
      expect: 'True',
      hint: 'Önce beş içe aktarma (alfabetik sırayla verildi), sonra veri, bölme, pipeline, eğit-ölç.',
      why: 'Ölçekleme pipeline içinde olduğu için yalnız eğitim verisiyle fit edilir. early_stopping=True eğitimin %10\'unu doğrulama için ayırır ve doğrulama skoru iyileşmeyince durur.'
    },
    {
      t: 'code',
      stage: 'Rehberli',
      id: 'derin-ogrenme-giris-1',
      diff: 1,
      q: '<p>Üç aktivasyon fonksiyonunu numpy ile yaz:</p><ul><li><code>relu(z)</code>: <code>max(0, z)</code></li><li><code>sigmoid(z)</code>: <code>1 / (1 + e<sup>−z</sup>)</code></li><li><code>softmax(z)</code>: 2 boyutlu dizide <b>satır başına</b> olasılık; sayısal taşmayı önlemek için önce her satırın en büyük değerini çıkar.</li></ul>',
      guide: ['relu: np.maximum(0, z)', 'sigmoid: 1 / (1 + np.exp(-z))', 'softmax: z - z.max(axis=1, keepdims=True), sonra np.exp', 'Satır toplamına böl: e / e.sum(axis=1, keepdims=True)'],
      example: 'import numpy as np\n\n# Benzer teknik: satır bazında normalize etmek (keepdims ile)\nm = np.array([[1.0, 3.0], [2.0, 2.0]])\nprint(m / m.sum(axis=1, keepdims=True))\n',
      start: 'import numpy as np\n\n\ndef relu(z):\n    # TODO\n    pass\n\n\ndef sigmoid(z):\n    # TODO\n    pass\n\n\ndef softmax(z):\n    # TODO: önce satır maksimumunu çıkar\n    pass\n',
      sol: 'import numpy as np\n\n\ndef relu(z):\n    return np.maximum(0, z)\n\n\ndef sigmoid(z):\n    return 1 / (1 + np.exp(-z))\n\n\ndef softmax(z):\n    z = z - z.max(axis=1, keepdims=True)\n    e = np.exp(z)\n    return e / e.sum(axis=1, keepdims=True)\n',
      tests: 'assert relu(np.array([-3.0, 0.0, 2.5])).tolist() == [0.0, 0.0, 2.5], "ReLU negatifleri 0 yapmalı"\nassert np.allclose(sigmoid(np.array([0.0, 2.0])), [0.5, 0.880797]), "sigmoid(0)=0.5, sigmoid(2)≈0.8808"\ns = softmax(np.array([[1.0, 2.0, 3.0], [0.0, 0.0, 0.0]]))\nassert s.shape == (2, 3) and np.allclose(s.sum(axis=1), 1), "Her satırın olasılıkları 1\'e toplanmalı"\nassert np.allclose(s[0], [0.09003, 0.244728, 0.665241], atol=1e-5) and np.allclose(s[1], 1 / 3), "softmax değerleri yanlış"\nimport warnings\nwith warnings.catch_warnings():\n    warnings.simplefilter("error")\n    b = softmax(np.array([[1000.0, 1001.0]]))\nassert np.allclose(b, [[0.268941, 0.731059]]), "Büyük değerlerde taşma olmamalı: satır maksimumunu çıkar"\n',
      hints: [
        'np.maximum eleman bazında karşılaştırır.',
        'softmax(z) = softmax(z − c) her c için; c olarak satır maksimumunu seç.',
        'keepdims=True ile (n, 1) şekli korunur ve bölme yayılır.'
      ],
      why: 'exp(1000) float64\'te taşar (inf) ve inf/inf = nan olur. Satır maksimumunu çıkarmak en büyük üssü 0 yapar; sonuç matematiksel olarak aynıdır. PyTorch ve sklearn içeride aynı hileyi kullanır.'
    },
    {
      t: 'code',
      stage: 'Rehberli',
      id: 'derin-ogrenme-giris-2',
      diff: 2,
      q: '<p><code>ileri(X, W1, b1, W2, b2)</code> fonksiyonunu yaz: iki katmanlı ağın ileri yayılımını yapsın ve <code>(Z1, A1, p)</code> döndürsün. Gizli katman ReLU, çıktı sigmoid. Ardından <code>bce(y, p)</code> yaz: ikili çapraz entropi; <code>log(0)</code>\'dan kaçınmak için <code>p</code>\'yi <code>[1e-12, 1 − 1e-12]</code> aralığına kırp.</p>',
      guide: [
        'Z1 = X @ W1 + b1',
        'A1 = np.maximum(0, Z1)',
        'p = 1 / (1 + np.exp(-(A1 @ W2 + b2)))',
        'bce: np.clip ile kırp, sonra -np.mean(y·log p + (1-y)·log(1-p))'
      ],
      example: 'import numpy as np\n\n# Benzer teknik: tek katmanlı lineer model + sigmoid\nX = np.array([[1.0, 2.0], [0.0, -1.0]])\nw, b = np.array([[0.5], [-0.25]]), 0.1\nprint((1 / (1 + np.exp(-(X @ w + b)))).round(3))\n',
      start: 'import numpy as np\n\n\ndef ileri(X, W1, b1, W2, b2):\n    # TODO: Z1, A1, p\n    return None\n\n\ndef bce(y, p):\n    # TODO\n    return None\n',
      sol: 'import numpy as np\n\n\ndef ileri(X, W1, b1, W2, b2):\n    Z1 = X @ W1 + b1\n    A1 = np.maximum(0, Z1)\n    p = 1 / (1 + np.exp(-(A1 @ W2 + b2)))\n    return Z1, A1, p\n\n\ndef bce(y, p):\n    p = np.clip(p, 1e-12, 1 - 1e-12)\n    return float(-np.mean(y * np.log(p) + (1 - y) * np.log(1 - p)))\n',
      tests: 'X = np.array([[1.0, -1.0], [2.0, 0.5]])\nW1 = np.array([[1.0, -1.0, 0.5], [0.5, 1.0, -1.0]]); b1 = np.array([0.0, 0.5, 0.0])\nW2 = np.array([[1.0], [-1.0], [0.5]]); b2 = np.array([-0.5])\nZ1, A1, p = ileri(X, W1, b1, W2, b2)\nassert Z1.shape == (2, 3) and p.shape == (2, 1), "Şekiller: Z1 (2,3), p (2,1)"\nassert np.allclose(A1, [[0.5, 0.0, 1.5], [2.25, 0.0, 0.5]]), f"A1 = relu(Z1) yanlış: {A1}"\nassert np.allclose(p.ravel(), [0.679179, 0.880797]), f"Çıktı olasılıkları yanlış: {p.ravel()}"\ny = np.array([[1], [0]])\nassert abs(bce(y, p) - 1.256900) < 1e-5, f"BCE ~1.2569 olmalı; gelen {bce(y, p)}"\nassert bce(np.array([1.0, 0.0]), np.array([1.0, 0.0])) < 1e-9, "Mükemmel tahminde kayıp ~0 olmalı ve nan vermemeli (kırpma)"\n',
      hints: [
        'Matris çarpımı için @ kullan; b1 her satıra yayılır.',
        'p = sigmoid(A1 @ W2 + b2)',
        'p = np.clip(p, 1e-12, 1 - 1e-12) olmadan log(0) = -inf olur.'
      ],
      why: 'İleri yayılım üç satırdır: doğrusal → aktivasyon → doğrusal → çıktı aktivasyonu. Z1\'i de döndürmek geri yayılım için gerekir (ReLU türevi Z1 &gt; 0). Kırpma, model "eminim" dediği bir örnekte yanılınca kaybın sonsuza gitmesini önler.'
    },
    {
      t: 'code',
      stage: 'Rehberli',
      id: 'derin-ogrenme-giris-3',
      diff: 2,
      q: '<p>Gradyan inişini tek katmanlı doğrusal regresyonda uygula: <code>gd_regresyon(X, y, eta=0.1, epoch=500)</code>. <code>w</code> (sıfır vektörü) ve <code>b = 0</code> ile başla; her epoch\'ta MSE gradyanlarını hesapla (<code>dw = 2/n · Xᵀ(ŷ − y)</code>, <code>db = 2/n · Σ(ŷ − y)</code>) ve güncelle. <code>(w, b, kayiplar)</code> döndür; <code>kayiplar</code> her epoch\'taki MSE listesi (güncellemeden önce).</p>',
      guide: ['n = len(X); w = np.zeros(X.shape[1]); b = 0.0', 'Döngüde: tahmin = X @ w + b; hata = tahmin - y', 'MSE\'yi listeye ekle.', 'dw, db hesapla; w -= eta*dw; b -= eta*db'],
      example: 'import numpy as np\n\n# Benzer teknik: f(w) = (w - 3)^2 fonksiyonunu gradyanla küçültmek\nw = 0.0\nfor _ in range(50):\n    w -= 0.1 * 2 * (w - 3)\nprint(round(w, 4))\n',
      start: 'import numpy as np\n\n\ndef gd_regresyon(X, y, eta=0.1, epoch=500):\n    n = len(X)\n    w, b = np.zeros(X.shape[1]), 0.0\n    kayiplar = []\n    for _ in range(epoch):\n        # TODO: tahmin, hata, kayıp, gradyan, güncelleme\n        pass\n    return w, b, kayiplar\n',
      sol: 'import numpy as np\n\n\ndef gd_regresyon(X, y, eta=0.1, epoch=500):\n    n = len(X)\n    w, b = np.zeros(X.shape[1]), 0.0\n    kayiplar = []\n    for _ in range(epoch):\n        hata = X @ w + b - y\n        kayiplar.append(float(np.mean(hata ** 2)))\n        w = w - eta * 2 / n * (X.T @ hata)\n        b = b - eta * 2 / n * hata.sum()\n    return w, b, kayiplar\n',
      tests: 'from sklearn.linear_model import LinearRegression\nrng = np.random.default_rng(0)\nX = rng.normal(size=(200, 2)); y = 3 * X[:, 0] - 2 * X[:, 1] + 5 + rng.normal(0, 0.1, 200)\nw, b, k = gd_regresyon(X, y)\nref = LinearRegression().fit(X, y)\nassert np.allclose(w, ref.coef_, atol=1e-3) and abs(b - ref.intercept_) < 1e-3, f"Gradyan inişi kapalı form çözüme yakınsamalı; w={w}, b={b}"\nassert len(k) == 500 and k[0] > k[10] > k[-1], "Kayıp epoch boyunca azalmalı"\nassert abs(k[0] - float(np.mean(y ** 2))) < 1e-9, "İlk kayıp, sıfır ağırlıklarla (güncellemeden önce) hesaplanmalı"\n_, _, k2 = gd_regresyon(X, y, eta=1.5, epoch=30)\nassert k2[-1] > k2[0], "Çok büyük öğrenme oranında kayıp patlamalı (bu testi çözümün geçmeli)"\n',
      hints: [
        'hata = X @ w + b - y',
        'Önce kaybı kaydet, sonra güncelle.',
        'w = w - eta * 2 / n * (X.T @ hata); b = b - eta * 2 / n * hata.sum()'
      ],
      why: 'Sinir ağı eğitimi bu döngünün aynısıdır, yalnız gradyanlar geri yayılımla bulunur. eta=1.5\'te adım minimumu aşar ve kayıp her epoch büyür: "nan oldu" sorununun küçük ölçekli hali. Kayıp eğrisini kaydetmek eğitimi izlemenin temelidir.'
    },
    {
      t: 'code',
      stage: 'Rehberli',
      id: 'derin-ogrenme-giris-4',
      diff: 2,
      q: '<p><code>mini_batchler(X, y, boyut, rng)</code> adında bir <b>üreteç</b> (generator) yaz: her çağrıldığında (bir epoch) indeksleri <code>rng.permutation(len(X))</code> ile karıştırsın ve <code>(X_parca, y_parca)</code> çiftlerini <code>boyut</code>\'luk parçalar halinde <code>yield</code> etsin. Son parça daha küçük olabilir.</p>',
      guide: ['sira = rng.permutation(len(X))', 'for i in range(0, len(X), boyut):', 'idx = sira[i:i + boyut]', 'yield X[idx], y[idx]'],
      example: '# Benzer teknik: listeyi parçalara bölen üreteç\ndef parcala(liste, n):\n    for i in range(0, len(liste), n):\n        yield liste[i:i + n]\n\nprint(list(parcala(list(range(7)), 3)))\n',
      start: 'import numpy as np\n\n\ndef mini_batchler(X, y, boyut, rng):\n    # TODO: karıştır ve parça parça yield et\n    return []\n',
      sol: 'import numpy as np\n\n\ndef mini_batchler(X, y, boyut, rng):\n    sira = rng.permutation(len(X))\n    for i in range(0, len(X), boyut):\n        idx = sira[i:i + boyut]\n        yield X[idx], y[idx]\n',
      tests: 'import types\nX = np.arange(20).reshape(10, 2); y = np.arange(10)\ng = mini_batchler(X, y, 4, np.random.default_rng(0))\nassert isinstance(g, types.GeneratorType), "yield kullanan bir üreteç olmalı"\nparcalar = list(g)\nassert [len(p[1]) for p in parcalar] == [4, 4, 2], "10 örnek 4\'lük parçalarla: 4, 4, 2"\nys = np.concatenate([p[1] for p in parcalar])\nassert sorted(ys.tolist()) == list(range(10)) and ys.tolist() != list(range(10)), "Her örnek bir kez gelmeli ve sıra karışmalı"\nassert all((xp[:, 0] // 2 == yp).all() for xp, yp in parcalar), "X ve y aynı indekslerle seçilmeli (eşleşme bozulmamalı)"\nassert np.array_equal(ys, np.random.default_rng(0).permutation(10)), "Karıştırma rng.permutation(len(X)) ile yapılmalı"\n',
      hints: ['Üreteç fonksiyonu return yerine yield kullanır.', 'X ve y\'yi aynı idx ile seç ki eşleşme bozulmasın.'],
      why: 'Her epoch başında karıştırmak, modelin hep aynı sırayla aynı parçaları görüp sıraya bağlı desen öğrenmesini engeller. Üreteç bütün parçaları bellekte tutmaz; PyTorch\'un DataLoader(shuffle=True) sınıfı aynı işi yapar.'
    },
    {
      t: 'code',
      stage: 'Kendin yaz',
      id: 'derin-ogrenme-giris-5',
      diff: 3,
      q: '<p><code>geri(X, y, Z1, A1, p, W2)</code> fonksiyonunu yaz: ReLU gizli katman + sigmoid çıktı + ikili çapraz entropi (ortalama) için gradyanları hesaplasın ve <code>(dW1, db1, dW2, db2)</code> döndürsün. <code>y</code> şekli <code>(n, 1)</code>.</p><p>Formüller: <code>dZ2 = (p − y)/n</code>; <code>dW2 = A1ᵀ dZ2</code>; <code>db2 = Σ dZ2</code> (satırlar); <code>dZ1 = (dZ2 W2ᵀ) · [Z1 &gt; 0]</code>; <code>dW1 = Xᵀ dZ1</code>; <code>db1 = Σ dZ1</code>.</p>',
      start: 'import numpy as np\n\n\ndef geri(X, y, Z1, A1, p, W2):\n    pass\n',
      sol: 'import numpy as np\n\n\ndef geri(X, y, Z1, A1, p, W2):\n    n = len(X)\n    dZ2 = (p - y) / n\n    dW2 = A1.T @ dZ2\n    db2 = dZ2.sum(axis=0)\n    dZ1 = (dZ2 @ W2.T) * (Z1 > 0)\n    dW1 = X.T @ dZ1\n    db1 = dZ1.sum(axis=0)\n    return dW1, db1, dW2, db2\n',
      tests: 'rng = np.random.default_rng(3)\nX = rng.normal(size=(6, 3)); y = rng.integers(0, 2, (6, 1)).astype(float)\nW1, b1 = rng.normal(size=(3, 4)), rng.normal(size=4)\nW2, b2 = rng.normal(size=(4, 1)), rng.normal(size=1)\ndef kayip(W1, b1, W2, b2):\n    A = np.maximum(0, X @ W1 + b1); p = 1 / (1 + np.exp(-(A @ W2 + b2)))\n    return -np.mean(y * np.log(p) + (1 - y) * np.log(1 - p))\nZ1 = X @ W1 + b1; A1 = np.maximum(0, Z1); p = 1 / (1 + np.exp(-(A1 @ W2 + b2)))\ng = geri(X, y, Z1, A1, p, W2)\nassert g is not None and len(g) == 4, "Dört gradyan döndür"\nassert [a.shape for a in g] == [(3, 4), (4,), (4, 1), (1,)], "Gradyan şekilleri parametrelerle aynı olmalı"\neps = 1e-6\nfor ad, P, G in [("W1", W1, g[0]), ("b1", b1, g[1]), ("W2", W2, g[2]), ("b2", b2, g[3])]:\n    sayisal = np.zeros_like(P)\n    for i in np.ndindex(P.shape):\n        P[i] += eps; a = kayip(W1, b1, W2, b2); P[i] -= 2 * eps; b = kayip(W1, b1, W2, b2); P[i] += eps\n        sayisal[i] = (a - b) / (2 * eps)\n    assert np.allclose(G, sayisal, atol=1e-6), f"{ad} gradyanı sayısal türevle uyuşmuyor"\n',
      hints: [
        'Çıktı katmanı: dZ2 = (p - y) / n (sigmoid + BCE sadeleşmesi).',
        'Gizli katmana geri: dZ2 @ W2.T, sonra ReLU maskesi (Z1 &gt; 0).',
        'Sapma gradyanları satırlar üzerinden toplam: .sum(axis=0)'
      ],
      why: 'Test, her parametre için sayısal türevi (L(w+ε) − L(w−ε))/2ε hesaplayıp senin analitik gradyanınla karşılaştırıyor: gradyan kontrolü. ReLU maskesi, sıfırlanan nöronların gradyan almamasını sağlar. PyTorch\'un loss.backward() satırı tam olarak bu hesabı her katman için otomatik yapar.'
    },
    {
      t: 'code',
      stage: 'Kendin yaz',
      id: 'derin-ogrenme-giris-6',
      diff: 2,
      q: '<p><code>erken_durdur(dogrulama_kayiplari, sabir)</code> fonksiyonunu yaz: epoch sırasıyla doğrulama kayıpları verilir. En iyi (en düşük) kayıptan sonra <code>sabir</code> epoch boyunca <b>kesin</b> iyileşme olmazsa eğitim durur. <code>(en_iyi_epoch, durdugu_epoch)</code> döndür (0 tabanlı); hiç durmazsa <code>durdugu_epoch</code> son epoch\'tur.</p>',
      start: 'def erken_durdur(dogrulama_kayiplari, sabir):\n    pass\n',
      sol: 'def erken_durdur(dogrulama_kayiplari, sabir):\n    en_iyi, en_iyi_ep, bekleme = float("inf"), 0, 0\n    for ep, k in enumerate(dogrulama_kayiplari):\n        if k < en_iyi:\n            en_iyi, en_iyi_ep, bekleme = k, ep, 0\n        else:\n            bekleme += 1\n            if bekleme >= sabir:\n                return en_iyi_ep, ep\n    return en_iyi_ep, len(dogrulama_kayiplari) - 1\n',
      tests: 'k = [0.9, 0.7, 0.6, 0.62, 0.61, 0.65, 0.66, 0.5]\nassert erken_durdur(k, 3) == (2, 5), "En iyi epoch 2 (0.6); 3, 4, 5 iyileşmedi → 5\'te dur (7\'deki 0.5 hiç görülmez)"\nassert erken_durdur(k, 5) == (7, 7), "Sabır 5 iken 7. epoch\'taki iyileşmeye ulaşılır, son epoch\'ta biter"\nassert erken_durdur([1.0, 1.0, 1.0], 2) == (0, 2), "Eşit kayıp iyileşme sayılmaz"\nassert erken_durdur([0.5], 1) == (0, 0)\n',
      hints: [
        'Üç değişken: en iyi kayıp, en iyi epoch, bekleme sayacı.',
        'İyileşmede sayacı sıfırla; değilse artır ve sabir\'e ulaşınca dur.'
      ],
      why: 'Erken durdurma, doğrulama kaybı yükselmeye başladığında (aşırı öğrenme) eğitimi keser ve en iyi epoch\'un ağırlıklarına döner. Sabır, kayıp eğrisindeki küçük dalgalanmalara tolerans tanır; ama örnekteki gibi daha sonra gelecek bir iyileşmeyi kaçırabilir. Keras EarlyStopping ve sklearn n_iter_no_change aynı mantıkla çalışır.'
    },
    {
      t: 'code',
      stage: 'Kendin yaz',
      id: 'derin-ogrenme-giris-7',
      diff: 2,
      q: '<p><code>gizli_tara(X, y, boyutlar)</code> fonksiyonunu yaz: rakam verisini (<code>load_digits</code>) <code>test_size=0.25, random_state=0, stratify=y</code> ile böl; her gizli katman boyutu <code>h</code> için <code>make_pipeline(StandardScaler(), MLPClassifier(hidden_layer_sizes=(h,), max_iter=300, random_state=0))</code> eğit ve <code>{h: (egitim_dogruluk, test_dogruluk)}</code> döndür (3 basamak).</p>',
      start: 'import warnings\nfrom sklearn.datasets import load_digits\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.neural_network import MLPClassifier\nfrom sklearn.pipeline import make_pipeline\nfrom sklearn.preprocessing import StandardScaler\nwarnings.filterwarnings("ignore")\n\nX, y = load_digits(return_X_y=True)\n\n\ndef gizli_tara(X, y, boyutlar):\n    pass\n',
      sol: 'import warnings\nfrom sklearn.datasets import load_digits\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.neural_network import MLPClassifier\nfrom sklearn.pipeline import make_pipeline\nfrom sklearn.preprocessing import StandardScaler\nwarnings.filterwarnings("ignore")\n\nX, y = load_digits(return_X_y=True)\n\n\ndef gizli_tara(X, y, boyutlar):\n    Xa, Xb, ya, yb = train_test_split(X, y, test_size=0.25, random_state=0, stratify=y)\n    sonuc = {}\n    for h in boyutlar:\n        m = make_pipeline(StandardScaler(), MLPClassifier(hidden_layer_sizes=(h,), max_iter=300, random_state=0)).fit(Xa, ya)\n        sonuc[h] = (round(m.score(Xa, ya), 3), round(m.score(Xb, yb), 3))\n    return sonuc\n\n\nprint(gizli_tara(X, y, [2, 8, 64]))\n',
      tests: 'r = gizli_tara(X, y, [2, 8, 64])\nassert set(r) == {2, 8, 64}, "Her boyut için bir kayıt"\nassert r[2][1] < 0.8, f"2 nöronlu gizli katman 10 rakamı ayıramaz (eksik öğrenme); gelen {r[2]}"\nassert r[64][1] > 0.95, f"64 nöronla test doğruluğu 0.95\'i geçmeli; gelen {r[64]}"\nassert r[64][0] == 1.0, "64 nöron eğitim setini ezberler (eğitim doğruluğu 1.0)"\nassert r[2][1] < r[8][1] < r[64][1], "Kapasite arttıkça test doğruluğu artmalı"\n',
      hints: [
        'Bölmeyi döngüden ÖNCE bir kez yap; her model aynı test setiyle ölçülsün.',
        'm.score(Xa, ya) eğitim, m.score(Xb, yb) test doğruluğu.'
      ],
      why: '2 nöronlu darboğaz 10 sınıfı taşıyacak kadar bilgi geçiremez: hem eğitim hem test düşük (eksik öğrenme). 64 nöron eğitimi ezberler ama ölçeklenmiş piksellerle test de çok iyidir. Eğitim ve test doğruluğunu yan yana raporlamak aşırı/eksik öğrenmeyi tek bakışta gösterir.'
    },
    {
      t: 'code',
      stage: 'Kendin yaz',
      id: 'derin-ogrenme-giris-8',
      diff: 2,
      needs: ['pandas'],
      q: '<p><b>Ölçekleme şart mı?</b> Start kodu Ilgaz Bank\'ın "ikinci yarıda çok harcayacak mı?" tablosunu (<code>X</code>, <code>y</code>; özellikler: risk puanı, işlem sayısı, kart adedi, log kart toplamı, kart hesabı sayısı) hazırlar. <code>olcek_etkisi(X, y)</code> yaz: veriyi <code>test_size=0.3, random_state=0, stratify=y</code> ile böl; <code>MLPClassifier(hidden_layer_sizes=(16,), max_iter=2000, random_state=0)</code> modelini bir kez ölçeksiz, bir kez <code>StandardScaler</code> pipeline\'ı ile eğit. <code>{"olceksiz": auc, "olcekli": auc}</code> döndür (test ROC-AUC, 3 basamak).</p>',
      start: 'import numpy as np\nimport pandas as pd\nimport veri\n\nislem = veri.oku("ilgaz_bank", "bank_txns", usecols=["account_id", "txn_time", "amount", "txn_type"], parse_dates=["txn_time"])\nhesap = veri.oku("ilgaz_bank", "bank_accounts")\nmusteri = veri.oku("ilgaz_bank", "bank_customers").set_index("customer_id")\nKESIM = pd.Timestamp("2024-07-01")\nd = islem.merge(hesap[["account_id", "customer_id"]], on="account_id")\nonce, sonra = d[d["txn_time"] < KESIM], d[d["txn_time"] >= KESIM]\nkart = once[once["txn_type"] == "kart_harcama"]\ntablo = pd.DataFrame(index=sorted(once["customer_id"].unique()))\ntablo["risk_score"] = musteri["risk_score"]\ntablo["islem_sayisi"] = once.groupby("customer_id").size()\ntablo["kart_adet"] = kart.groupby("customer_id").size().reindex(tablo.index).fillna(0)\ntablo["log_kart"] = np.log1p(kart.groupby("customer_id")["amount"].sum().abs().reindex(tablo.index).fillna(0))\ntablo["kart_hesap"] = hesap[hesap["account_type"] == "kredi_karti"].groupby("customer_id").size().reindex(tablo.index).fillna(0)\nhedef_tl = sonra[sonra["txn_type"] == "kart_harcama"].groupby("customer_id")["amount"].sum().abs().reindex(tablo.index).fillna(0)\ny = (hedef_tl >= hedef_tl.median()).astype(int).to_numpy()\nX = tablo.to_numpy(dtype=float)\nimport warnings\nfrom sklearn.metrics import roc_auc_score\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.neural_network import MLPClassifier\nfrom sklearn.pipeline import make_pipeline\nfrom sklearn.preprocessing import StandardScaler\nwarnings.filterwarnings("ignore")\n\n\ndef olcek_etkisi(X, y):\n    pass\n',
      sol: 'import numpy as np\nimport pandas as pd\nimport veri\n\nislem = veri.oku("ilgaz_bank", "bank_txns", usecols=["account_id", "txn_time", "amount", "txn_type"], parse_dates=["txn_time"])\nhesap = veri.oku("ilgaz_bank", "bank_accounts")\nmusteri = veri.oku("ilgaz_bank", "bank_customers").set_index("customer_id")\nKESIM = pd.Timestamp("2024-07-01")\nd = islem.merge(hesap[["account_id", "customer_id"]], on="account_id")\nonce, sonra = d[d["txn_time"] < KESIM], d[d["txn_time"] >= KESIM]\nkart = once[once["txn_type"] == "kart_harcama"]\ntablo = pd.DataFrame(index=sorted(once["customer_id"].unique()))\ntablo["risk_score"] = musteri["risk_score"]\ntablo["islem_sayisi"] = once.groupby("customer_id").size()\ntablo["kart_adet"] = kart.groupby("customer_id").size().reindex(tablo.index).fillna(0)\ntablo["log_kart"] = np.log1p(kart.groupby("customer_id")["amount"].sum().abs().reindex(tablo.index).fillna(0))\ntablo["kart_hesap"] = hesap[hesap["account_type"] == "kredi_karti"].groupby("customer_id").size().reindex(tablo.index).fillna(0)\nhedef_tl = sonra[sonra["txn_type"] == "kart_harcama"].groupby("customer_id")["amount"].sum().abs().reindex(tablo.index).fillna(0)\ny = (hedef_tl >= hedef_tl.median()).astype(int).to_numpy()\nX = tablo.to_numpy(dtype=float)\nimport warnings\nfrom sklearn.metrics import roc_auc_score\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.neural_network import MLPClassifier\nfrom sklearn.pipeline import make_pipeline\nfrom sklearn.preprocessing import StandardScaler\nwarnings.filterwarnings("ignore")\n\n\ndef olcek_etkisi(X, y):\n    Xa, Xb, ya, yb = train_test_split(X, y, test_size=0.3, random_state=0, stratify=y)\n    ham = MLPClassifier(hidden_layer_sizes=(16,), max_iter=2000, random_state=0).fit(Xa, ya)\n    olc = make_pipeline(StandardScaler(), MLPClassifier(hidden_layer_sizes=(16,), max_iter=2000, random_state=0)).fit(Xa, ya)\n    return {"olceksiz": round(float(roc_auc_score(yb, ham.predict_proba(Xb)[:, 1])), 3),\n            "olcekli": round(float(roc_auc_score(yb, olc.predict_proba(Xb)[:, 1])), 3)}\n\n\nprint(olcek_etkisi(X, y))\n',
      tests: 'assert X.shape == (471, 5), "Tablo 471 müşteri × 5 özellik"\nr = olcek_etkisi(X, y)\nassert r == {"olceksiz": 0.807, "olcekli": 0.824}, f"Sonuç tutmuyor: {r}"\n',
      hints: [
        'Ölçeksiz model: MLPClassifier(...).fit(Xa, ya)',
        'Ölçekli: make_pipeline(StandardScaler(), MLPClassifier(...))',
        'Pozitif sınıf olasılığı: predict_proba(Xb)[:, 1]'
      ],
      why: 'İşlem sayısı yüzlerle, risk puanı 1–10 ile ölçülüyor; ölçeksiz girdide büyük sütunlar ilk adımlarda gradyanı domine eder ve optimizasyon kötü bir noktaya takılır. Ölçekleme pipeline içinde olduğu için yalnız eğitim istatistikleriyle yapılır. Ağaç modellerinde bu sorun yoktur.'
    },
    {
      t: 'code',
      stage: 'Hata avı',
      id: 'derin-ogrenme-giris-9',
      diff: 2,
      kind: 'bug',
      q: '<p><b>Hatayı bul ve düzelt.</b> <code>dropout(A, p, rng, egitim=True)</code> ters dropout (inverted dropout) uygulamalı: eğitimde nöronların <code>p</code> oranını sıfırla ve kalanları ölçekle ki aktivasyonların <b>beklenen değeri</b> değişmesin; tahminde (<code>egitim=False</code>) girdiyi aynen döndür. Ekip, modelin eğitimde ve tahminde farklı ölçekte çıktılar ürettiğini fark etti.</p>',
      start: 'import numpy as np\n\n\ndef dropout(A, p, rng, egitim=True):\n    maske = rng.random(A.shape) >= p\n    return A * maske\n',
      sol: 'import numpy as np\n\n\ndef dropout(A, p, rng, egitim=True):\n    if not egitim or p == 0:\n        return A\n    maske = rng.random(A.shape) >= p\n    return A * maske / (1 - p)\n',
      tests: 'A = np.ones((2000, 50))\nr = dropout(A, 0.3, np.random.default_rng(0))\nassert abs(r.mean() - 1.0) < 0.02, f"Eğitimde ortalama korunmalı (kalanları 1/(1-p) ile ölçekle); gelen {r.mean():.3f}"\nassert abs((r == 0).mean() - 0.3) < 0.01, "Nöronların yaklaşık %30\'u sıfırlanmalı"\nt = dropout(A, 0.3, np.random.default_rng(0), egitim=False)\nassert np.array_equal(t, A), "Tahminde dropout kapalı olmalı: girdi aynen dönmeli"\nassert np.array_equal(dropout(A[:3], 0.0, np.random.default_rng(0)), A[:3]), "p=0 iken değişiklik olmamalı"\n',
      hints: ['İki eksik var: tahmin modu ve ölçekleme.', 'if not egitim: return A; eğitimde A * maske / (1 - p)'],
      why: 'Ölçeklemesiz dropout eğitimde aktivasyonları ortalama %30 küçültür; tahminde ise tüm nöronlar açık olduğu için sonraki katman alışkın olmadığı büyüklükte girdi alır. Ters dropout ölçeklemeyi eğitime taşır, tahmin kodunu sade bırakır. PyTorch\'ta bu ayrımı model.train() / model.eval() yapar.'
    },
    {
      t: 'code',
      stage: 'Hata avı',
      id: 'derin-ogrenme-giris-10',
      diff: 2,
      kind: 'bug',
      q: '<p><b>Hatayı bul ve düzelt.</b> <code>agi_baslat(girdi, gizli, cikti, seed)</code> iki katmanlı ağın parametrelerini başlatıyor. Ağ ne kadar eğitilirse eğitilsin gizli nöronların hepsi <b>aynı</b> değeri öğreniyor ve doğruluk lojistik regresyonun altında kalıyor. Ağırlıkları He başlatma ile (<code>rng.normal(0, sqrt(2 / girdi_boyutu), şekil)</code>) rastgele başlat; sapmalar sıfır kalabilir. Sözlük anahtarları ve şekiller aynı kalsın.</p>',
      start: 'import numpy as np\n\n\ndef agi_baslat(girdi, gizli, cikti, seed=0):\n    rng = np.random.default_rng(seed)\n    return {\n        "W1": np.zeros((girdi, gizli)), "b1": np.zeros(gizli),\n        "W2": np.zeros((gizli, cikti)), "b2": np.zeros(cikti),\n    }\n',
      sol: 'import numpy as np\n\n\ndef agi_baslat(girdi, gizli, cikti, seed=0):\n    rng = np.random.default_rng(seed)\n    return {\n        "W1": rng.normal(0, np.sqrt(2 / girdi), (girdi, gizli)), "b1": np.zeros(gizli),\n        "W2": rng.normal(0, np.sqrt(2 / gizli), (gizli, cikti)), "b2": np.zeros(cikti),\n    }\n',
      tests: 'P = agi_baslat(2, 16, 1, seed=1)\nassert P["W1"].shape == (2, 16) and P["W2"].shape == (16, 1) and P["b1"].shape == (16,), "Şekiller değişmemeli"\nassert np.unique(P["W1"].round(8), axis=1).shape[1] == 16, "Gizli nöronların ağırlıkları birbirinden farklı olmalı (simetri kırılmalı)"\nB = agi_baslat(400, 300, 1, seed=0)\nassert abs(B["W1"].std() - np.sqrt(2 / 400)) < 0.005, "W1 standart sapması sqrt(2/girdi) olmalı"\nassert abs(B["W2"].std() - np.sqrt(2 / 300)) < 0.02, "W2 standart sapması sqrt(2/gizli) olmalı"\nfrom sklearn.datasets import make_moons\nX, y = make_moons(400, noise=0.2, random_state=0); y = y.reshape(-1, 1)\nP = agi_baslat(2, 16, 1, seed=1)\nfor _ in range(2000):\n    Z1 = X @ P["W1"] + P["b1"]; A1 = np.maximum(0, Z1); p = 1 / (1 + np.exp(-(A1 @ P["W2"] + P["b2"])))\n    dZ2 = (p - y) / len(X); dZ1 = (dZ2 @ P["W2"].T) * (Z1 > 0)\n    P["W2"] -= 0.5 * A1.T @ dZ2; P["b2"] -= 0.5 * dZ2.sum(0); P["W1"] -= 0.5 * X.T @ dZ1; P["b1"] -= 0.5 * dZ1.sum(0)\nassert ((p > 0.5) == y).mean() > 0.95, "Doğru başlatmayla ağ iki ay verisinde %95\'i geçmeli"\n',
      hints: [
        'Sıfır başlatmada her gizli nöron aynı gradyanı alır: simetri hiç bozulmaz.',
        'W1: rng.normal(0, np.sqrt(2 / girdi), (girdi, gizli)); W2 için girdi boyutu gizli\'dir.'
      ],
      why: 'Tüm ağırlıklar eşitse her gizli nöron aynı çıktıyı üretir, aynı gradyanı alır ve aynı biçimde güncellenir; 16 nöron fiilen tek nöron olur. Hatta sıfır ağırlık ve ReLU ile gradyan tamamen ölür. Rastgele başlatma simetriyi kırar; He ölçeği (√(2/girdi)) ReLU katmanlarında sinyalin katmanlar boyunca sönmesini ya da patlamasını önler.'
    },
    {
      t: 'code',
      stage: 'Meydan okuma',
      id: 'derin-ogrenme-giris-11',
      diff: 3,
      q: '<p><b>Sıfırdan sinir ağı.</b> <code>Ag</code> sınıfını yaz: tek gizli katmanlı (ReLU), sigmoid çıktılı ikili sınıflandırıcı.</p><ul><li><code>__init__(self, gizli=16, eta=0.5, epoch=2000, seed=0)</code></li><li><code>fit(X, y)</code>: He başlatma (<code>np.random.default_rng(seed)</code>), tam yığın gradyan inişi; her epoch\'un BCE kaybını <code>self.kayiplar_</code> listesine ekle; <code>self</code> döndür.</li><li><code>predict_proba(X)</code>: <code>(n,)</code> şekilli olasılık; <code>predict(X)</code>: 0/1.</li></ul><p>İki ay verisinde (<code>make_moons(400, noise=0.2, random_state=0)</code>) test doğruluğu 0.93\'ü geçmeli ve lojistik regresyonu yenmeli.</p>',
      start: 'import numpy as np\n\n\nclass Ag:\n    def __init__(self, gizli=16, eta=0.5, epoch=2000, seed=0):\n        pass\n\n    def fit(self, X, y):\n        pass\n\n    def predict_proba(self, X):\n        pass\n\n    def predict(self, X):\n        pass\n',
      sol: 'import numpy as np\n\n\nclass Ag:\n    def __init__(self, gizli=16, eta=0.5, epoch=2000, seed=0):\n        self.gizli, self.eta, self.epoch, self.seed = gizli, eta, epoch, seed\n\n    def _ileri(self, X):\n        Z1 = X @ self.W1 + self.b1\n        A1 = np.maximum(0, Z1)\n        p = 1 / (1 + np.exp(-(A1 @ self.W2 + self.b2)))\n        return Z1, A1, p\n\n    def fit(self, X, y):\n        X = np.asarray(X, dtype=float)\n        y = np.asarray(y, dtype=float).reshape(-1, 1)\n        rng = np.random.default_rng(self.seed)\n        d, n = X.shape[1], len(X)\n        self.W1 = rng.normal(0, np.sqrt(2 / d), (d, self.gizli))\n        self.b1 = np.zeros(self.gizli)\n        self.W2 = rng.normal(0, np.sqrt(2 / self.gizli), (self.gizli, 1))\n        self.b2 = np.zeros(1)\n        self.kayiplar_ = []\n        for _ in range(self.epoch):\n            Z1, A1, p = self._ileri(X)\n            pc = np.clip(p, 1e-12, 1 - 1e-12)\n            self.kayiplar_.append(float(-np.mean(y * np.log(pc) + (1 - y) * np.log(1 - pc))))\n            dZ2 = (p - y) / n\n            dZ1 = (dZ2 @ self.W2.T) * (Z1 > 0)\n            self.W2 -= self.eta * A1.T @ dZ2\n            self.b2 -= self.eta * dZ2.sum(axis=0)\n            self.W1 -= self.eta * X.T @ dZ1\n            self.b1 -= self.eta * dZ1.sum(axis=0)\n        return self\n\n    def predict_proba(self, X):\n        return self._ileri(np.asarray(X, dtype=float))[2].ravel()\n\n    def predict(self, X):\n        return (self.predict_proba(X) >= 0.5).astype(int)\n',
      tests: 'from sklearn.datasets import make_moons\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.model_selection import train_test_split\nX, y = make_moons(400, noise=0.2, random_state=0)\nXa, Xb, ya, yb = train_test_split(X, y, test_size=0.25, random_state=0)\nag = Ag(gizli=16, eta=0.5, epoch=2000, seed=0)\nassert ag.fit(Xa, ya) is ag, "fit self döndürmeli"\nassert ag.predict_proba(Xb).shape == (100,), "predict_proba (n,) şekilli olmalı"\nacc = (ag.predict(Xb) == yb).mean()\nlr = LogisticRegression().fit(Xa, ya).score(Xb, yb)\nassert acc > 0.93, f"Test doğruluğu 0.93\'ü geçmeli; gelen {acc}"\nassert acc > lr + 0.05, f"Ağ lojistik regresyonu ({lr}) belirgin biçimde yenmeli; gelen {acc}"\nk = ag.kayiplar_\nassert len(k) == 2000 and k[-1] < k[0] * 0.5, "Kayıp listesi 2000 epoch ve belirgin düşüş göstermeli"\nassert np.array_equal(Ag(seed=0, epoch=50).fit(Xa, ya).predict(Xb), Ag(seed=0, epoch=50).fit(Xa, ya).predict(Xb)), "Aynı seed aynı sonucu vermeli"\n',
      hints: [
        'İleri yayılımı ayrı bir yardımcı metoda (_ileri) koy; fit ve predict_proba ikisi de kullansın.',
        'y\'yi (n, 1) şekline getir: reshape(-1, 1); predict_proba çıktısını ravel() ile düzleştir.',
        'Gradyanlar önceki alıştırmadaki geri() ile aynı.'
      ],
      why: 'Bu sınıf scikit-learn arayüzünü (fit/predict/predict_proba, sonu _ ile biten öğrenilmiş öznitelikler) taklit ediyor; böylece cross_val_score gibi araçlarla uyumlu hale getirilebilir. İki ay verisinde doğrusal model ~%85\'te kalırken gizli katman eğri bir sınır öğrenir. Bu, derin öğrenme kütüphanelerinin içinde olan her şeyin küçük bir modelidir.'
    },
    {
      t: 'code',
      stage: 'Meydan okuma',
      id: 'derin-ogrenme-giris-12',
      diff: 3,
      q: '<p><b>Gradyan kontrolü.</b> <code>gradyan_kontrol(f, w, analitik, eps=1e-5)</code> fonksiyonunu yaz: <code>f</code> bir numpy dizisi alıp skaler kayıp döndüren fonksiyon, <code>w</code> parametre dizisi (herhangi bir şekil), <code>analitik</code> aynı şekilli gradyan. Her eleman için merkezi fark <code>(f(w+ε) − f(w−ε)) / 2ε</code> ile sayısal gradyanı hesapla (<code>w</code>\'yu sonunda değiştirilmemiş bırak). Göreli farkı döndür: <code>‖a − s‖ / (‖a‖ + ‖s‖)</code> (her ikisi 0 ise 0.0).</p>',
      start: 'import numpy as np\n\n\ndef gradyan_kontrol(f, w, analitik, eps=1e-5):\n    pass\n',
      sol: 'import numpy as np\n\n\ndef gradyan_kontrol(f, w, analitik, eps=1e-5):\n    sayisal = np.zeros_like(w, dtype=float)\n    for i in np.ndindex(w.shape):\n        eski = w[i]\n        w[i] = eski + eps\n        a = f(w)\n        w[i] = eski - eps\n        b = f(w)\n        w[i] = eski\n        sayisal[i] = (a - b) / (2 * eps)\n    pay = np.linalg.norm(analitik - sayisal)\n    payda = np.linalg.norm(analitik) + np.linalg.norm(sayisal)\n    return 0.0 if payda == 0 else float(pay / payda)\n',
      tests: 'w = np.array([[1.0, -2.0], [0.5, 3.0]])\nkopya = w.copy()\nf = lambda v: float(np.sum(v ** 2))\ndogru = gradyan_kontrol(f, w, 2 * w)\nassert dogru < 1e-8, f"Doğru gradyanda göreli fark çok küçük olmalı; gelen {dogru}"\nassert np.array_equal(w, kopya), "w fonksiyon bitince değişmemiş olmalı"\nyanlis = gradyan_kontrol(f, w, w)\nassert abs(yanlis - 1 / 3) < 1e-6, f"Gradyan yarıya inmişse göreli fark 1/3 olmalı; gelen {yanlis}"\nrng = np.random.default_rng(0)\nX = rng.normal(size=(20, 3)); y = rng.normal(size=20)\nmse = lambda v: float(np.mean((X @ v - y) ** 2))\nv = rng.normal(size=3)\nassert gradyan_kontrol(mse, v, 2 / 20 * X.T @ (X @ v - y)) < 1e-7, "MSE gradyanı kontrolü geçmeli"\nassert gradyan_kontrol(lambda v: 5.0, np.zeros(2), np.zeros(2)) == 0.0, "Her ikisi sıfırsa 0.0"\n',
      hints: [
        'np.ndindex(w.shape) her şekil için indeks demetleri üretir.',
        'Değeri değiştir, f\'yi çağır, sonra mutlaka eski değere geri al.',
        'Göreli fark: np.linalg.norm(a - s) / (np.linalg.norm(a) + np.linalg.norm(s))'
      ],
      why: 'Gradyan kontrolü, elle yazılmış geri yayılımın tek güvenilir testidir; göreli fark 1e-7 civarındaysa kod doğrudur, 1e-2 ise bir yerde hata vardır. w\'yu yerinde değiştirip geri almak bellek kopyasından kaçınır ama geri almayı unutmak sonraki ölçümleri bozar. PyTorch\'ta torch.autograd.gradcheck aynı işi yapar.'
    },
    {
      t: 'code',
      stage: 'Mini proje',
      id: 'derin-ogrenme-giris-13',
      diff: 3,
      needs: ['pandas'],
      q: '<p><b>Ilgaz Bank: MLP mi, gradient boosting mi?</b> Start kodu müşteri tablosunu (<code>X</code>, <code>y</code>) hazırlar. <code>karsilastir(X, y)</code> fonksiyonunu yaz: veriyi <code>test_size=0.3, random_state=0, stratify=y</code> ile böl ve dört modeli eğitip test ROC-AUC\'lerini (3 basamak) sözlük olarak döndür:</p><ul><li><code>"lojistik"</code>: <code>StandardScaler</code> + <code>LogisticRegression(max_iter=1000)</code></li><li><code>"mlp"</code>: <code>StandardScaler</code> + <code>MLPClassifier(hidden_layer_sizes=(16,), alpha=1e-2, max_iter=2000, random_state=0)</code></li><li><code>"mlp_derin"</code>: aynısı, <code>hidden_layer_sizes=(32, 16)</code>, <code>alpha=1.0</code></li><li><code>"hgb"</code>: <code>HistGradientBoostingClassifier(random_state=0)</code> (ölçeksiz)</li></ul><p>Ayrıca <code>"en_iyi"</code> anahtarına AUC\'si en yüksek modelin adını yaz (eşitlikte sözlükte önce gelen).</p>',
      start: 'import numpy as np\nimport pandas as pd\nimport veri\n\nislem = veri.oku("ilgaz_bank", "bank_txns", usecols=["account_id", "txn_time", "amount", "txn_type"], parse_dates=["txn_time"])\nhesap = veri.oku("ilgaz_bank", "bank_accounts")\nmusteri = veri.oku("ilgaz_bank", "bank_customers").set_index("customer_id")\nKESIM = pd.Timestamp("2024-07-01")\nd = islem.merge(hesap[["account_id", "customer_id"]], on="account_id")\nonce, sonra = d[d["txn_time"] < KESIM], d[d["txn_time"] >= KESIM]\nkart = once[once["txn_type"] == "kart_harcama"]\ntablo = pd.DataFrame(index=sorted(once["customer_id"].unique()))\ntablo["risk_score"] = musteri["risk_score"]\ntablo["islem_sayisi"] = once.groupby("customer_id").size()\ntablo["kart_adet"] = kart.groupby("customer_id").size().reindex(tablo.index).fillna(0)\ntablo["log_kart"] = np.log1p(kart.groupby("customer_id")["amount"].sum().abs().reindex(tablo.index).fillna(0))\ntablo["kart_hesap"] = hesap[hesap["account_type"] == "kredi_karti"].groupby("customer_id").size().reindex(tablo.index).fillna(0)\nhedef_tl = sonra[sonra["txn_type"] == "kart_harcama"].groupby("customer_id")["amount"].sum().abs().reindex(tablo.index).fillna(0)\ny = (hedef_tl >= hedef_tl.median()).astype(int).to_numpy()\nX = tablo.to_numpy(dtype=float)\nimport warnings\nfrom sklearn.ensemble import HistGradientBoostingClassifier\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.metrics import roc_auc_score\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.neural_network import MLPClassifier\nfrom sklearn.pipeline import make_pipeline\nfrom sklearn.preprocessing import StandardScaler\nwarnings.filterwarnings("ignore")\n\n\ndef karsilastir(X, y):\n    # TODO\n    return {}\n',
      sol: 'import numpy as np\nimport pandas as pd\nimport veri\n\nislem = veri.oku("ilgaz_bank", "bank_txns", usecols=["account_id", "txn_time", "amount", "txn_type"], parse_dates=["txn_time"])\nhesap = veri.oku("ilgaz_bank", "bank_accounts")\nmusteri = veri.oku("ilgaz_bank", "bank_customers").set_index("customer_id")\nKESIM = pd.Timestamp("2024-07-01")\nd = islem.merge(hesap[["account_id", "customer_id"]], on="account_id")\nonce, sonra = d[d["txn_time"] < KESIM], d[d["txn_time"] >= KESIM]\nkart = once[once["txn_type"] == "kart_harcama"]\ntablo = pd.DataFrame(index=sorted(once["customer_id"].unique()))\ntablo["risk_score"] = musteri["risk_score"]\ntablo["islem_sayisi"] = once.groupby("customer_id").size()\ntablo["kart_adet"] = kart.groupby("customer_id").size().reindex(tablo.index).fillna(0)\ntablo["log_kart"] = np.log1p(kart.groupby("customer_id")["amount"].sum().abs().reindex(tablo.index).fillna(0))\ntablo["kart_hesap"] = hesap[hesap["account_type"] == "kredi_karti"].groupby("customer_id").size().reindex(tablo.index).fillna(0)\nhedef_tl = sonra[sonra["txn_type"] == "kart_harcama"].groupby("customer_id")["amount"].sum().abs().reindex(tablo.index).fillna(0)\ny = (hedef_tl >= hedef_tl.median()).astype(int).to_numpy()\nX = tablo.to_numpy(dtype=float)\nimport warnings\nfrom sklearn.ensemble import HistGradientBoostingClassifier\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.metrics import roc_auc_score\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.neural_network import MLPClassifier\nfrom sklearn.pipeline import make_pipeline\nfrom sklearn.preprocessing import StandardScaler\nwarnings.filterwarnings("ignore")\n\n\ndef karsilastir(X, y):\n    Xa, Xb, ya, yb = train_test_split(X, y, test_size=0.3, random_state=0, stratify=y)\n    modeller = {\n        "lojistik": make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000)),\n        "mlp": make_pipeline(StandardScaler(), MLPClassifier(hidden_layer_sizes=(16,), alpha=1e-2, max_iter=2000, random_state=0)),\n        "mlp_derin": make_pipeline(StandardScaler(), MLPClassifier(hidden_layer_sizes=(32, 16), alpha=1.0, max_iter=2000, random_state=0)),\n        "hgb": HistGradientBoostingClassifier(random_state=0),\n    }\n    sonuc = {}\n    for ad, m in modeller.items():\n        m.fit(Xa, ya)\n        sonuc[ad] = round(float(roc_auc_score(yb, m.predict_proba(Xb)[:, 1])), 3)\n    sonuc["en_iyi"] = max(modeller, key=lambda a: sonuc[a])\n    return sonuc\n\n\nprint(karsilastir(X, y))\n',
      tests: 'r = karsilastir(X, y)\nassert set(r) == {"lojistik", "mlp", "mlp_derin", "hgb", "en_iyi"}, "Dört model + en_iyi"\n_ref = {"lojistik": 0.8, "mlp": 0.824, "mlp_derin": 0.822, "hgb": 0.825}\n# scikit-learn sürümleri arasında binde birkaçlık fark olabilir\nassert all(abs(r[k] - v) <= 0.012 for k, v in _ref.items()), f"Sonuç tutmuyor: {r}"\nassert r["en_iyi"] == max(_ref, key=lambda a: r[a]), "en_iyi, AUC\'si en yüksek modelin adı olmalı"\n',
      hints: [
        'Modelleri bir sözlükte tut, döngüde eğit ve ölç.',
        'roc_auc_score(yb, m.predict_proba(Xb)[:, 1])',
        'en_iyi: max(modeller, key=lambda a: sonuc[a]) eşitlikte ilk görüleni seçer.'
      ],
      why: '471 satırlık, 5 özellikli bir tabloda dört model birbirine çok yakın; fark birkaç binde birlik, yani gürültü düzeyinde. Böyle bir durumda karar doğruluk dışındaki ölçütlerle verilir: HistGradientBoosting ölçekleme istemez, eğitimi hızlıdır ve ayarı daha az hassastır; lojistik regresyon açıklanabilir. Derin ağ bu veride ek bir şey kazandırmıyor: tablo verisinde derin öğrenmenin klasik sonucu.'
    }
  ],
  faq: [
    {
      q: 'GPU olmadan derin öğrenme öğrenebilir miyim?',
      a: 'Evet. Bu dersteki her şey ve küçük PyTorch modelleri CPU\'da çalışır. Büyük görüntü/metin modelleri için Google Colab ve Kaggle ücretsiz GPU sunar. Önemli olan kavramlar ve eğitim döngüsüdür; donanım sonra gelir.'
    },
    {
      q: 'PyTorch mu, TensorFlow/Keras mı?',
      a: 'Araştırmada ve yeni projelerin çoğunda PyTorch baskın; Hugging Face ekosistemi de PyTorch odaklı. Keras 3 artık PyTorch üzerinde de çalışabiliyor ve yeni başlayanlar için kısa bir arayüz sunuyor. Kavramlar (tensör, katman, kayıp, optimizer, eğitim döngüsü) birebir aynı; birini bilen diğerine birkaç günde geçer.'
    },
    {
      q: 'Kaç gizli katman ve nöron seçmeliyim?',
      a: 'Tablo verisinde 1–2 gizli katman ve 16–256 nöron genellikle yeter. Küçük başla, eğitim ve doğrulama eğrisine bak: ikisi de kötüyse büyüt, eğitim iyi doğrulama kötüyse düzenlileştir. Kesin cevabı doğrulama seti verir; hiperparametre aramasıyla (GridSearchCV) sistematik dene.'
    },
    {
      q: 'Adam ile SGD arasındaki fark nedir?',
      a: 'SGD tüm parametrelere aynı öğrenme oranıyla adım atar. Adam her parametre için geçmiş gradyanların ortalaması ve varyansına göre adımı uyarlar; ayar gerektirmeden çoğu durumda hızlı yakınsar. MLPClassifier\'ın varsayılanı Adam\'dır; büyük görüntü modellerinde iyi ayarlanmış SGD + momentum bazen daha iyi genelleşir.'
    },
    {
      q: 'Derin öğrenme modelini nasıl açıklarım?',
      a: 'Model bağımsız yöntemler (permutation importance, SHAP) MLP\'de de çalışır. Görüntüde Grad-CAM gibi ısı haritaları, metinde dikkat ağırlıkları kullanılır. Ama açıklanabilirlik düzenleyici bir zorunlulukse (kredi kararı) daha basit bir model çoğu zaman daha savunulabilir.'
    }
  ],
  mistakes: [
    {
      bad: 'MLPClassifier().fit(X_ham, y)',
      good: 'make_pipeline(StandardScaler(), MLPClassifier(random_state=0)).fit(X, y)',
      why: 'Sinir ağları ölçeğe çok duyarlıdır; ölçeksiz girdide optimizasyon yavaşlar ya da kötü bir noktaya takılır.'
    },
    {
      bad: 'W1 = np.zeros((girdi, gizli))',
      good: 'W1 = rng.normal(0, np.sqrt(2 / girdi), (girdi, gizli))',
      why: 'Sıfır başlatma simetriyi kırmaz; tüm gizli nöronlar aynı şeyi öğrenir.'
    },
    {
      bad: 'e = np.exp(z)\nreturn e / e.sum(axis=1, keepdims=True)',
      good: 'e = np.exp(z - z.max(axis=1, keepdims=True))\nreturn e / e.sum(axis=1, keepdims=True)',
      why: 'Büyük logitlerde exp taşar ve nan üretir; maksimumu çıkarmak sonucu değiştirmez.'
    },
    {
      bad: 'for xb, yb in yukleyici:\n    kayip = kayip_fn(model(xb), yb)\n    kayip.backward()\n    opt.step()',
      good: 'for xb, yb in yukleyici:\n    opt.zero_grad()\n    kayip = kayip_fn(model(xb), yb)\n    kayip.backward()\n    opt.step()',
      why: 'PyTorch gradyanları biriktirir; zero_grad olmadan her adım önceki tüm gradyanları da uygular.'
    },
    {
      bad: 'olasilik = model(X_test)  # model.train() modunda',
      good: 'model.eval()\nwith torch.no_grad():\n    olasilik = torch.sigmoid(model(X_test))',
      why: 'Eğitim modunda dropout tahminde de açık kalır; sonuçlar her çağrıda değişir.'
    }
  ]
});
})(window);
