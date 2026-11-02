/* PythonPatika — İleri: nlp-metin (metin işleme ve NLP) */
// needs: scikit-learn
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push(
  { id: 'nlp-metin',
    lv: 'ileri',
    mod: 'Makine Öğrenmesi',
    min: 50,
    needs: ['scikit-learn'],
    title: 'Metin işleme ve NLP: Türkçe metinden modele',
    sum: 'Türkçe metni doğru temizler, tokenler ve n-gram\'lara ayırır; CountVectorizer ve TF-IDF ile vektöre çevirip benzer şikayet bulur, yorumlarda duygu analizi yapar ve embedding/transformer dünyasına kavramsal olarak bakarsın.',
    goals: [
      'Türkçe küçük harf tuzağını, noktalamayı ve durak kelimeleri doğru ele alan bir temizlik hattı yazabilirim.',
      're ile tokenizasyon, n-gram üretimi ve Counter ile kelime sıklığı analizi yapabilirim.',
      'CountVectorizer ve TfidfVectorizer\'ı ayarlayıp kosinüs benzerliğiyle benzer kayıt bulabilirim.',
      'MultinomialNB ve LogisticRegression ile metin sınıflandırma Pipeline\'ı kurup düşük güvenli tahminleri ayırabilirim.',
      'Embedding ve transformer yaklaşımının TF-IDF\'ten farkını ve Türkçe için araç seçeneklerini açıklayabilirim.'
    ],
    body: `
<h2>Metin de veridir</h2>
<p>Anadolu Market'e her gün yüzlerce ürün yorumu, Anadolu Bank'ın çağrı merkezine yüzlerce şikayet kaydı geliyor. Bunlar sayı değil metin; ama "hangi konuda en çok şikayet var", "bu yorum olumlu mu", "bu şikayete benzeyen eski kayıtlar hangileri" soruları tamamen sayısal işlemlerle cevaplanır. Doğal dil işleme (Natural Language Processing, NLP) metni modelin anlayacağı sayılara çevirme ve sonra o sayılarla çalışma sanatıdır.</p>
<p>Bu dersin akışı tipik bir NLP projesinin akışıdır: <b>temizle → parçala → say → vektöre çevir → benzerlik/sınıflandırma</b>. Sonunda modern yaklaşıma (embeddings ve transformer'lar) kavramsal bir bakış atacağız.</p>

<h2>Türkçe metni temizlemek: küçük harf tuzağı</h2>
<p><code>unicode-metin</code> dersinde gördüğün tuzak burada can yakar. Python'un <code>lower()</code> metodu dilden bağımsızdır: "I" harfini "i" yapar (Türkçede "ı" olmalı), "İ" harfini ise "i" + birleşen nokta (U+0307) olarak iki karaktere çevirir. Sonuç: "İADE" küçültüldüğünde "iade" ile eşleşmez ve sayımların sessizce yanlış çıkar.</p>
<pre class="py">metin = "İADE talebim var, IŞIK modeli ARIZALI"
print(metin.lower())
print("İADE".lower() == "iade", len("İADE".lower()))

def tr_kucuk(s):
    return s.replace("I", "ı").replace("İ", "i").lower()

print(tr_kucuk(metin))
print(tr_kucuk("İADE") == "iade")</pre>
<div class="warn"><b>casefold da çözmez</b><code>casefold()</code> büyük-küçük harf duyarsız karşılaştırma için daha agresiftir ama yine Türkçe kurallarını bilmez. Türkçe metinde kendi <code>tr_kucuk</code> fonksiyonunu ilk adım yap ve tüm hattında (eğitimde ve tahminde) aynı fonksiyonu kullan.</div>
<p>Sonraki adım noktalama ve rakamlar. <code>string.punctuation</code> yalnızca ASCII işaretleri içerir; Türkçe metinlerdeki tırnaklar (“ ” ‘ ’) ve üç nokta (…) kaçar. Regex ile "harf olmayan her şeyi boşluğa çevir" demek daha güvenlidir. Python 3'te <code>\\w</code> Unicode harflerini (ç, ğ, ı, ö, ş, ü) zaten tanır.</p>

<h2>Tokenizasyon, durak kelimeler ve n-gram</h2>
<p><b>Tokenizasyon</b> (tokenization) metni anlamlı parçalara (token) bölmektir. Basit ama sağlam yol <code>re.findall</code> ile harf dizilerini yakalamaktır. <b>Durak kelimeler</b> (stop words) "ve, bir, bu, da, için" gibi her metinde geçen ve tek başına bilgi taşımayan kelimelerdir; sayımlarda listenin tepesini kaplamasınlar diye çıkarılır. Türkçe için hazır listeler vardır ama küçük ve elle yazılmış bir liste neyi attığını bilmeni sağlar.</p>
<pre class="py">import re
from collections import Counter

DURAKLAR = {"ve", "bir", "bu", "da", "de", "çok", "ile", "için", "ama", "mi", "gibi", "daha", "en"}

def tr_kucuk(s):
    return s.replace("I", "ı").replace("İ", "i").lower()

def tokenle(metin, duraklar=DURAKLAR):
    kelimeler = re.findall(r"[a-zçğıöşü]+", tr_kucuk(metin))
    return [k for k in kelimeler if k not in duraklar and len(k) &gt; 1]

yorumlar = [
    "Kargo ÇOK geç geldi, ürün de kırık!",
    "Ürün güzel ama kargo geç geldi.",
    "İade süreci çok hızlıydı, teşekkürler.",
    "Kargo hızlı, ürün güzel.",
]
tum = [t for y in yorumlar for t in tokenle(y)]
print(tokenle(yorumlar[0]))
print(Counter(tum).most_common(4))

# n-gram: ardışık n kelime
t = tokenle(yorumlar[1])
ikili = [" ".join(p) for p in zip(t, t[1:])]
print(ikili)</pre>
<p><b>n-gram</b>, ardışık n token'dır: "kargo geç" bir ikili (bigram). Tek kelimeler "geç" ile "geldi"yi ayrı sayar; ikili ise "kargo geç" ifadesini bir kavram olarak yakalar. <code>zip(t, t[1:])</code> ikilileri, <code>zip(t, t[1:], t[2:])</code> üçlüleri üretir.</p>
<div class="warn"><b>"değil" bir durak kelime değildir</b>Hazır İngilizce listelerde "not" bazen durak kelime sayılır. Türkçede "değil", "yok", "hiç" kelimelerini atarsan "memnun değilim" ile "memnunum" aynı görünür ve duygu analizi çöker. Durak listeni göreve göre seç.</div>

<h2>Metni vektöre çevirmek: CountVectorizer ve TF-IDF</h2>
<p>Modeller sayı ister. <b>Kelime çantası</b> (bag of words) modelinde her belge, sözlükteki her kelimenin kaç kez geçtiğini tutan bir satırdır. scikit-learn'de bunu <code>CountVectorizer</code> yapar. <b>TF-IDF</b> (term frequency - inverse document frequency) ise sayımı, kelimenin kaç belgede geçtiğine göre ağırlıklandırır: her yorumda geçen "ürün" düşük, yalnızca birkaç yorumda geçen "kırık" yüksek ağırlık alır.</p>
<pre class="py">from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer

def tr_kucuk(s):
    return s.replace("I", "ı").replace("İ", "i").lower()

belgeler = ["kargo geç geldi", "ürün kırık geldi", "kargo hızlı ürün güzel"]

cv = CountVectorizer(preprocessor=tr_kucuk)
X = cv.fit_transform(belgeler)
print(cv.get_feature_names_out().tolist())
print(X.toarray())

tf = TfidfVectorizer(preprocessor=tr_kucuk)
T = tf.fit_transform(belgeler)
agirlik = dict(zip(tf.get_feature_names_out(), T.toarray()[1].round(2).tolist()))
print({k: v for k, v in agirlik.items() if v &gt; 0})</pre>
<p>İkinci belgede "kırık" (yalnız bu belgede var) "geldi"den (iki belgede var) daha yüksek ağırlık aldı. Sonuç seyrek matristir (sparse matrix): çoğu hücre 0 olduğu için yalnızca dolu hücreler saklanır; <code>toarray()</code> yalnızca küçük örneklerde göstermek içindir.</p>
<div class="tbl-wrap"><table>
<tr><th>Parametre</th><th>Ne işe yarar</th><th>Örnek</th></tr>
<tr><td><code>preprocessor</code></td><td>Tokenizasyondan önce metne uygulanır</td><td><code>preprocessor=tr_kucuk</code></td></tr>
<tr><td><code>stop_words</code></td><td>Atılacak kelimeler (Türkçe hazır yok, liste ver)</td><td><code>stop_words=list(DURAKLAR)</code></td></tr>
<tr><td><code>ngram_range</code></td><td>Tekli, ikili... birlikte</td><td><code>(1, 2)</code></td></tr>
<tr><td><code>min_df</code> / <code>max_df</code></td><td>Çok nadir / çok yaygın kelimeleri at</td><td><code>min_df=2</code>, <code>max_df=0.9</code></td></tr>
<tr><td><code>analyzer="char_wb"</code></td><td>Kelime yerine karakter n-gram</td><td>Türkçe ekler için güçlü</td></tr>
<tr><td><code>token_pattern</code></td><td>Token regex'i (varsayılan 2+ harf)</td><td><code>r"(?u)\\b\\w+\\b"</code></td></tr>
</table></div>

<h2>Kosinüs benzerliği: benzer şikayeti bulmak</h2>
<p>Anadolu Bank'ta yeni bir şikayet geldiğinde temsilci "bunun benzeri daha önce nasıl çözülmüştü" diye bakmak ister. İki TF-IDF vektörü arasındaki <b>kosinüs benzerliği</b> (cosine similarity) aralarındaki açının kosinüsüdür: 1 aynı yön (çok benzer), 0 hiç ortak kelime yok.</p>
<pre class="py">from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def tr_kucuk(s):
    return s.replace("I", "ı").replace("İ", "i").lower()

sikayetler = [
    "Kartım ATM'de yutuldu, yeni kart istiyorum",
    "Mobil uygulamaya giriş yapamıyorum, şifre hatası veriyor",
    "Hesabımdan bilgim dışında para çekilmiş",
    "Kredi kartı ekstremde tanımadığım bir harcama var",
    "Uygulama açılmıyor, sürekli şifre hatası alıyorum",
]
vec = TfidfVectorizer(preprocessor=tr_kucuk)
X = vec.fit_transform(sikayetler)

yeni = "Uygulamaya giremiyorum, şifre hatası veriyor"
skor = cosine_similarity(vec.transform([yeni]), X).ravel()
for i in skor.argsort()[::-1][:2]:
    print(round(skor[i], 2), sikayetler[i])</pre>
<p>Dikkat: yeni metin <code>transform</code> ile vektöre çevrilir, <code>fit_transform</code> ile değil. Sözlük eğitim verisinden öğrenilir ve sabit kalır; yeni metindeki bilinmeyen kelimeler ("giremiyorum") yok sayılır. Bu da kelime temelli yöntemlerin zayıflığını gösterir: "giremiyorum" ile "giriş" aynı kökten ama farklı token.</p>

<h2>Metin sınıflandırma: yorum duygu analizi</h2>
<p><code>ml-pipeline-degerlendirme</code> dersinde kurduğun Pipeline mantığı metinde de aynıdır: vektörleştirici + sınıflandırıcı. Metin için iki klasik model: <b>MultinomialNB</b> (Naive Bayes; kelime sayımlarıyla çok hızlı, küçük veride şaşırtıcı iyi) ve <b>LogisticRegression</b> (genelde biraz daha isabetli, katsayıları yorumlanabilir).</p>
<pre class="py">yorumlar = [
    ("Kargo çok hızlı geldi, ürün harika", "olumlu"),
    ("Ürün tam anlatıldığı gibi, çok memnunum", "olumlu"),
    ("Paketleme özenliydi, teşekkürler", "olumlu"),
    ("Fiyatına göre kalitesi süper", "olumlu"),
    ("Hızlı teslimat, güzel ürün, tavsiye ederim", "olumlu"),
    ("Müşteri hizmetleri çok ilgiliydi, memnunum", "olumlu"),
    ("Ürün kırık geldi, çok kötü", "olumsuz"),
    ("Kargo geç geldi, bir daha almam", "olumsuz"),
    ("Anlatıldığı gibi değil, iade etmek istiyorum", "olumsuz"),
    ("Kalitesi berbat, param boşa gitti", "olumsuz"),
    ("Müşteri hizmetlerine ulaşamadım, kötü deneyim", "olumsuz"),
    ("Paket ezik ve ürün eksik geldi", "olumsuz"),
]
from sklearn.pipeline import make_pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.linear_model import LogisticRegression

def tr_kucuk(s):
    return s.replace("I", "ı").replace("İ", "i").lower()

metinler = [m for m, _ in yorumlar]
etiketler = [e for _, e in yorumlar]

nb = make_pipeline(TfidfVectorizer(preprocessor=tr_kucuk), MultinomialNB()).fit(metinler, etiketler)
lr = make_pipeline(TfidfVectorizer(preprocessor=tr_kucuk), LogisticRegression(C=10)).fit(metinler, etiketler)

yeni = ["Ürün harika, kargo hızlı", "Ürün kırık geldi, iade istiyorum", "Kargo geç geldi ama ürün güzel"]
for m, a, b in zip(yeni, nb.predict(yeni), lr.predict(yeni)):
    print(f"{a:8} {b:8} {m}")
print(lr.classes_.tolist(), lr.predict_proba(yeni[2:]).round(2).tolist())</pre>
<p>Üçüncü yorum karışık: hem olumsuz ("geç") hem olumlu ("güzel") sinyal var. 12 örnekle eğitilmiş model "olumsuz" dese de olasılıklar 0.44 / 0.56 ile neredeyse yazı turadır; gerçek projelerde binlerce etiketli yorum, "nötr" sınıfı ve <code>cross_val_score</code> ile değerlendirme gerekir. <code>predict_proba</code> olasılıkları, düşük güvenli tahminleri insana yönlendirmek için kullanılır.</p>
<div class="tip"><b>Sızıntıya dikkat</b>Vektörleştiriciyi tüm veriye fit edip sonra train/test ayırmak IDF değerlerine test bilgisini sızdırır. Pipeline kullanırsan <code>cross_val_score</code> her katmanda vektörleştiriciyi yalnızca eğitim kısmına fit eder.</div>

<h2>Embeddings ve transformer'lar: kavramsal bakış</h2>
<p>TF-IDF kelimeleri bağımsız sayar: "kredi kartı" ile "kart borcu" ortak token taşımıyorsa benzerlikleri 0'dır. <b>Gömme</b> (embedding) yaklaşımında her metin, anlamını yakalayan yoğun bir vektöre (ör. 384 ya da 768 sayı) çevrilir; anlamca yakın cümleler, farklı kelimeler kullansa bile yakın vektörler alır. Bu vektörleri <b>transformer</b> mimarisindeki dil modelleri üretir. Hugging Face, bu modellerin ve hazır araçların paylaşıldığı merkezdir.</p>
<pre class="code"># pip install sentence-transformers
from sentence_transformers import SentenceTransformer, util

# Çok dilli bir model seç (Hugging Face'te "multilingual" modelleri ara)
model = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")
cumleler = ["Kartım ATM'de kaldı", "Banka makinesi kartımı yuttu", "Kredi faizi ne kadar?"]
emb = model.encode(cumleler)
print(util.cos_sim(emb[0], emb[1:]))   # ilk ikisi yüksek, üçüncü düşük çıkar</pre>
<pre class="code"># pip install transformers torch
from transformers import pipeline

# Türkçe duygu analizi için Hugging Face'te "turkish sentiment" araması yap,
# model kartında lisansı ve eğitim verisini oku.
siniflandirici = pipeline("sentiment-analysis", model="&lt;seçtiğin-türkçe-model&gt;")
print(siniflandirici("Kargo çok geç geldi, hiç memnun değilim"))</pre>
<div class="note"><b>Kendi bilgisayarında dene</b>Bu iki örnek tarayıcıda çalışmaz: modeller yüzlerce MB indirir ve torch gerektirir. Bilgisayarında sanal ortam açıp <code>pip install sentence-transformers</code> ile deneyebilirsin. İlk çalıştırma modeli indirir; sonraki çalıştırmalar önbellekten gelir.</div>
<p><b>Türkçe için araçlar:</b> Türkçe eklemeli (agglutinative) bir dildir; "giremiyorum", "girişimizde", "girdi" aynı kökten çıkar. <b>Zemberek</b> Türkçe için kök bulma (stemming), biçimbirim çözümleme ve yazım denetimi yapan köklü bir açık kaynak kütüphanedir (Java tabanlı; Python'dan sarmalayıcılarla kullanılır). <b>spaCy</b>'nin Türkçe için temel tokenizasyon desteği ve topluluk tarafından eğitilmiş modelleri vardır. Hugging Face'te ise BERTurk gibi Türkçe ön-eğitimli transformer modelleri bulunur.</p>
<div class="tbl-wrap"><table>
<tr><th>Yaklaşım</th><th>Artı</th><th>Eksi</th><th>Ne zaman?</th></tr>
<tr><td>TF-IDF + LogisticRegression</td><td>Hızlı, ucuz, açıklanabilir, CPU yeter</td><td>Eş anlam ve ekleri yakalamaz</td><td>İlk model, temel çizgi (baseline)</td></tr>
<tr><td>Karakter n-gram TF-IDF</td><td>Ek ve yazım hatasına dayanıklı</td><td>Sözlük büyür</td><td>Türkçe, kısa ve hatalı metin</td></tr>
<tr><td>Cümle embedding + basit sınıflandırıcı</td><td>Anlam benzerliği, az etiketle iyi</td><td>Model indirme, GPU iyi olur</td><td>Semantik arama, kümeleme</td></tr>
<tr><td>Transformer ince ayar (fine-tuning)</td><td>En yüksek isabet</td><td>Veri, GPU, MLOps maliyeti</td><td>Kritik ve yüksek hacimli görev</td></tr>
</table></div>

<div class="note"><b>Gerçek işte</b>Bir bankanın şikayet yönetiminde tipik akış: metin önce kişisel verilerden arındırılır (TC kimlik no, IBAN, telefon maskelenir; KVKK), sonra bir sınıflandırıcı şikayeti departmana (kart, kredi, dijital kanal) yönlendirir, güveni düşük olanlar insana gider. İlk sürüm neredeyse her zaman TF-IDF + LogisticRegression'dır; dakikalar içinde eğitilir, neden o kararı verdiğini katsayılarla açıklarsın. Transformer modeline ancak temel çizginin yetmediği kanıtlanınca geçilir.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Türkçe ve sözlük patlaması</h3>
<p>Eklemeli dillerde tek bir kökten onlarca biçim türer; kelime temelli sözlük hızla büyür ve her biçim az görülür. Üç çare: kök bulma (Zemberek), karakter n-gram (<code>TfidfVectorizer(analyzer="char_wb", ngram_range=(2, 4))</code>) ve alt-kelime (subword) tokenizasyonu kullanan transformer modelleri. Karakter n-gram'ı denemek tek parametre değiştirmektir ve Türkçede çoğu zaman belirgin kazanç getirir.</p>
<h3>Değerlendirme ve dengesizlik</h3>
<p>Şikayetlerin %80'i tek kategorideyse doğruluk (accuracy) yanıltır; sınıf bazında precision/recall ve <code>classification_report</code> kullan, gerekirse <code>class_weight="balanced"</code>. Etiketleme tutarlılığı da önemlidir: iki kişi aynı yorumu farklı etiketliyorsa modelin tavanı o anlaşma oranıdır.</p>
<h3>Model ne öğrendi?</h3>
<p>LogisticRegression'da <code>coef_</code> ile <code>get_feature_names_out()</code> eşleştirilerek her sınıf için en etkili kelimeler listelenir. Bu liste hem hata ayıklamaya (model "kargo" kelimesini olumsuzlukla mı eşleştirmiş?) hem iş ekibine güven vermeye yarar.</p>
</section>
`,
    ex: [
      { t: 'mc',
        stage: 'Isınma',
        q: 'Türkçe yorumları sayarken <code>metin.lower()</code> kullanmanın sorunu nedir?',
        o: [
          'lower() Türkçe karakterleri (ç, ş, ğ) siler',
          '"I" harfini "ı" yerine "i" yapar, "İ" harfini de iki karaktere çevirir',
          'lower() yalnızca ilk harfi küçültür',
          'Hiçbir sorunu yoktur, Python Türkçe ayarını otomatik algılar'
        ],
        a: 1,
        why: 'lower() dilden bağımsız Unicode kurallarını uygular: I→i, İ→i+birleşen nokta. Bu yüzden "İADE".lower() "iade" ile eşleşmez. Çözüm önce I→ı, İ→i değişimi yapmaktır.' },
      { t: 'mc',
        stage: 'Isınma',
        q: 'TF-IDF\'te bir kelimenin ağırlığı ne zaman <b>düşük</b> olur?',
        o: ['Kelime çok uzunsa', 'Kelime yalnızca bir belgede geçiyorsa', 'Kelime neredeyse tüm belgelerde geçiyorsa', 'Kelime Türkçe karakter içeriyorsa'],
        a: 2,
        why: 'IDF, kelimenin geçtiği belge sayısı arttıkça küçülür; her yerde geçen kelime belgeleri ayırt etmez. Yalnızca bir belgede geçen kelime en yüksek IDF\'i alır.' },
      { t: 'mc',
        stage: 'Isınma',
        q: 'Eğitilmiş bir vektörleştiriciyle yeni bir yorumu sınıflandırırken hangisi doğrudur?',
        o: [
          'vec.fit_transform([yeni]) çağrılır ki yeni kelimeler de sözlüğe girsin',
          'vec.transform([yeni]) çağrılır; sözlük eğitimde öğrenildiği gibi sabit kalır',
          'Yeni yorum vektörleştirilmeden doğrudan model.predict\'e verilir',
          'Her tahminde vektörleştirici ve model tümüyle yeniden eğitilir'
        ],
        a: 1,
        why: 'fit_transform yeni bir sözlük kurar; sütun sayısı ve sırası modelinkiyle uyuşmaz. transform eğitimdeki sözlüğü kullanır, bilinmeyen kelimeleri yok sayar. Pipeline kullanınca bunu predict senin yerine yapar.' },
      { t: 'predict',
        stage: 'Kodu oku',
        q: 'Bu kod ne yazdırır?',
        code: 's = "İADE"\nprint(s.lower() == "iade", len(s.lower()))\n',
        o: ['True 4', 'False 5', 'False 4', 'True 5'],
        a: 1,
        why: '"İ".lower() iki karakter üretir: "i" ve birleşen nokta (U+0307). Metin 5 karakter olur ve "iade" ile eşit değildir.' },
      { t: 'predict',
        stage: 'Kodu oku',
        q: 'Bu kod ne yazdırır?',
        code: 'import re\nmetin = "Kargo geç geldi, ürün güzel! 5 yıldız"\nprint(len(re.findall(r"[a-zçğıöşü]+", metin)))\n',
        o: ['7', '6', '5', '4'],
        a: 1,
        why: 'Desen yalnızca küçük harfleri yakalar. "Kargo" içinden "argo" eşleşir (büyük K dışarıda kalır), sonra geç, geldi, ürün, güzel, yıldız: 6. Rakam 5 eşleşmez. Bu yüzden önce küçük harfe çevirmek gerekir.' },
      { t: 'predict',
        stage: 'Kodu oku',
        q: 'Bu kod ne yazdırır?',
        code: 't = ["kargo", "çok", "geç", "geldi"]\nprint([" ".join(p) for p in zip(t, t[1:], t[2:])])\n',
        o: ['[\'kargo çok\', \'çok geç\', \'geç geldi\']', '[\'kargo çok geç\', \'çok geç geldi\']', '[\'kargo çok geç geldi\']', '[\'kargo çok geç\', \'çok geç geldi\', \'geç geldi\']'],
        a: 1,
        why: 'zip en kısa girdide durur: t[2:] iki eleman olduğundan iki üçlü (trigram) oluşur. Dört token\'dan n=3 için 4 - 3 + 1 = 2 n-gram çıkar.' },
      { t: 'order',
        stage: 'Kodu oku',
        q: '<p>Üç belgeden kelime sözlüğü çıkarıp sözlük boyutunu ve ilk belgenin vektörünü yazdıran programı sırala.</p>',
        lines: [
          'from sklearn.feature_extraction.text import CountVectorizer',
          'belgeler = ["kargo geç geldi", "kargo hızlı", "ürün kırık geldi"]',
          'vec = CountVectorizer()',
          'X = vec.fit_transform(belgeler)',
          'print(len(vec.get_feature_names_out()))',
          'print(X.toarray()[0].tolist())'
        ],
        expect: '6\n[1, 1, 0, 1, 0, 0]\n',
        hint: 'Sözlük fit_transform sırasında oluşur; ondan önce adlar sorulamaz.',
        why: 'Sözlük alfabetik: geldi, geç, hızlı, kargo, kırık, ürün. İlk belge geldi, geç ve kargo içerir: [1, 1, 0, 1, 0, 0].' },
      { t: 'code',
        id: 'nlp-metin-1',
        stage: 'Rehberli',
        diff: 1,
        q: '<p><code>tr_kucuk(metin)</code> fonksiyonunu yaz: Türkçe kurallarına uygun küçük harfe çevirsin. "I" → "ı", "İ" → "i", geri kalanı <code>lower()</code>.</p>',
        guide: ['Önce "I" harfini "ı" ile değiştir.', 'Sonra "İ" harfini "i" ile değiştir.', 'En son lower() uygula ve döndür.'],
        example: 'kod = "AM-ı01"\nprint(kod.replace("-", "_").upper())\n',
        start: 'def tr_kucuk(metin):\n    # TODO: önce I ve İ harflerini değiştir, sonra lower()\n    return metin.lower()\n',
        sol: 'def tr_kucuk(metin):\n    return metin.replace("I", "ı").replace("İ", "i").lower()\n',
        tests: 'assert tr_kucuk("İADE") == "iade", "İADE -> iade olmalı (birleşen nokta olmadan)"\nassert tr_kucuk("IŞIK") == "ışık", "IŞIK -> ışık olmalı; I harfi ı olur"\nassert tr_kucuk("Kargo Gecikti") == "kargo gecikti", "Diğer harfler normal küçülmeli"\nassert tr_kucuk("") == "", "Boş metin boş kalmalı"\n',
        hints: ['lower() çağrılmadan ÖNCE değişim yapılmalı; sonra I harfi kalmaz.', 'metin.replace("I", "ı").replace("İ", "i").lower()'],
        why: 'Sıra önemlidir: önce lower() çağırırsan I zaten i olmuştur ve geri dönüşü yoktur.' },
      { t: 'code',
        id: 'nlp-metin-2',
        stage: 'Rehberli',
        diff: 2,
        q: '<p><code>temizle(metin, duraklar)</code>: metni Türkçe küçük harfe çevir (fonksiyonu yaz), <code>re.findall(r"[a-zçğıöşü]+", ...)</code> ile kelimeleri al, <code>duraklar</code> kümesindekileri ve tek harfli kelimeleri at, kalan listeyi döndür.</p>',
        guide: ['tr_kucuk yardımcı fonksiyonunu tanımla.', 'Küçültülmüş metinde re.findall ile harf dizilerini bul.', 'Liste kavrayışıyla durak kelimeleri ve len(k) <= 1 olanları ele.', 'Listeyi döndür.'],
        example: 'import re\nprint(re.findall(r"[a-z]+", "abc 12 de-f"))\n',
        start: 'import re\n\ndef tr_kucuk(s):\n    return s.replace("I", "ı").replace("İ", "i").lower()\n\ndef temizle(metin, duraklar):\n    kelimeler = []  # TODO: re.findall ile kelimeleri al\n    # TODO: durak kelimeleri ve tek harflileri ele\n    return kelimeler\n',
        sol: 'import re\n\ndef tr_kucuk(s):\n    return s.replace("I", "ı").replace("İ", "i").lower()\n\ndef temizle(metin, duraklar):\n    kelimeler = re.findall(r"[a-zçğıöşü]+", tr_kucuk(metin))\n    return [k for k in kelimeler if k not in duraklar and len(k) > 1]\n',
        tests: 'D = {"ve", "çok", "bir", "de"}\nassert temizle("Kargo ÇOK geç geldi, ürün de KIRIK!", D) == ["kargo", "geç", "geldi", "ürün", "kırık"], "Büyük harf, noktalama ve durak kelimeler temizlenmeli"\nassert temizle("İADE istiyorum: 3 gün oldu", D) == ["iade", "istiyorum", "gün", "oldu"], "Rakamlar atılmalı, İADE -> iade"\nassert temizle("a b ve", D) == [], "Tek harfliler ve duraklar atılmalı"\n',
        hints: ['Desen küçük harf aradığı için önce tr_kucuk uygulanmalı.', '[k for k in kelimeler if k not in duraklar and len(k) > 1]'],
        why: 'Temizlik hattı her yerde aynı olmalı: eğitimde ve tahminde aynı fonksiyonu çağırırsın.' },
      { t: 'code',
        id: 'nlp-metin-3',
        stage: 'Rehberli',
        diff: 1,
        q: '<p><code>ngramlar(tokenler, n)</code>: token listesinden ardışık n\'li grupları boşlukla birleştirilmiş metinler olarak döndürsün. n token sayısından büyükse boş liste.</p>',
        guide: ['i indeksini 0\'dan len(tokenler) - n\'e kadar gez.', 'Her i için tokenler[i:i + n] dilimini al.', '" ".join ile birleştirip listeye ekle.'],
        example: 'harfler = ["a", "b", "c", "d"]\nprint([harfler[i:i + 2] for i in range(len(harfler) - 1)])\n',
        start: 'def ngramlar(tokenler, n):\n    sonuc = []\n    # TODO: kaydırmalı pencere ile n\'li grupları üret\n    return sonuc\n',
        sol: 'def ngramlar(tokenler, n):\n    return [" ".join(tokenler[i:i + n]) for i in range(len(tokenler) - n + 1)]\n',
        tests: 't = ["kargo", "çok", "geç", "geldi"]\nassert ngramlar(t, 2) == ["kargo çok", "çok geç", "geç geldi"], "4 token -> 3 ikili"\nassert ngramlar(t, 3) == ["kargo çok geç", "çok geç geldi"], "4 token -> 2 üçlü"\nassert ngramlar(t, 1) == t, "n=1 tokenlerin kendisi"\nassert ngramlar(t, 5) == [], "n > token sayısı -> boş liste"\n',
        hints: ['n-gram sayısı len(tokenler) - n + 1\'dir; negatifse range boş döner.', '[" ".join(tokenler[i:i + n]) for i in range(len(tokenler) - n + 1)]'],
        why: 'Kaydırmalı pencere (sliding window) n-gram\'ın tanımıdır; range negatif sınırda boş döndüğü için kenar durum kendiliğinden çözülür.' },
      { t: 'code',
        id: 'nlp-metin-4',
        stage: 'Rehberli',
        diff: 2,
        q: '<p><code>benzer_sikayetler(sikayetler, sorgu, k=2)</code>: şikayetlere <code>TfidfVectorizer(preprocessor=tr_kucuk)</code> fit et, sorguyu <code>transform</code> et, kosinüs benzerliğine göre en benzer k şikayetin <b>indekslerini</b> büyükten küçüğe liste olarak döndür.</p>',
        guide: [
          'Vektörleştiriciyi yalnızca şikayetlere fit_transform et.',
          'Sorguyu vec.transform([sorgu]) ile vektöre çevir.',
          'cosine_similarity(sorgu_vek, X).ravel() ile skor dizisi al.',
          'argsort()[::-1][:k] ile en yüksek k indeksi al, tolist() yap.'
        ],
        example: 'import numpy as np\nskor = np.array([0.1, 0.9, 0.4])\nprint(skor.argsort()[::-1][:2].tolist())\n',
        start: 'from sklearn.feature_extraction.text import TfidfVectorizer\nfrom sklearn.metrics.pairwise import cosine_similarity\n\ndef tr_kucuk(s):\n    return s.replace("I", "ı").replace("İ", "i").lower()\n\ndef benzer_sikayetler(sikayetler, sorgu, k=2):\n    vec = TfidfVectorizer(preprocessor=tr_kucuk)\n    # TODO: fit, transform, benzerlik, sıralama\n    return []\n',
        sol: 'from sklearn.feature_extraction.text import TfidfVectorizer\nfrom sklearn.metrics.pairwise import cosine_similarity\n\ndef tr_kucuk(s):\n    return s.replace("I", "ı").replace("İ", "i").lower()\n\ndef benzer_sikayetler(sikayetler, sorgu, k=2):\n    vec = TfidfVectorizer(preprocessor=tr_kucuk)\n    X = vec.fit_transform(sikayetler)\n    skor = cosine_similarity(vec.transform([sorgu]), X).ravel()\n    return skor.argsort()[::-1][:k].tolist()\n',
        tests: 'S = ["Kartım ATM\'de yutuldu", "Mobil uygulama şifre hatası veriyor", "Hesabımdan izinsiz para çekilmiş", "Uygulama açılmıyor, şifre hatası", "Kredi kartı ekstresinde tanımadığım harcama"]\nr = benzer_sikayetler(S, "UYGULAMA şifre hatası alıyorum")\nassert sorted(r) == [1, 3], f"Şifre/uygulama şikayetleri (1 ve 3) dönmeli; gelen {r}"\nassert benzer_sikayetler(S, "ATM kartımı yuttu", k=1) == [0], "ATM şikayeti en benzer olmalı"\nassert len(benzer_sikayetler(S, "izinsiz para", k=3)) == 3, "k kadar indeks dönmeli"\n',
        hints: ['Sorguyu fit_transform etme; sözlük şikayetlerden öğrenilmeli.', 'skor = cosine_similarity(vec.transform([sorgu]), X).ravel()'],
        why: 'Benzer kayıt arama, TF-IDF + kosinüs benzerliğinin en yaygın iş uygulamasıdır; RAG sistemlerinin "getirme" adımı da aynı mantıkla çalışır.' },
      { t: 'code',
        id: 'nlp-metin-5',
        stage: 'Kendin yaz',
        diff: 1,
        q: '<p><code>en_sik_kelimeler(yorumlar, duraklar, n=3)</code>: tüm yorumlardaki kelimeleri Türkçe küçük harf + <code>re.findall(r"[a-zçğıöşü]+", ...)</code> ile çıkar, durak ve tek harflileri at, en sık n kelimeyi <code>(kelime, sayi)</code> listesi olarak döndür. Eşit sayılarda kelimeler alfabetik sıralansın.</p>',
        start: 'import re\nfrom collections import Counter\n\ndef en_sik_kelimeler(yorumlar, duraklar, n=3):\n    pass\n',
        sol: 'import re\nfrom collections import Counter\n\ndef tr_kucuk(s):\n    return s.replace("I", "ı").replace("İ", "i").lower()\n\ndef en_sik_kelimeler(yorumlar, duraklar, n=3):\n    sayac = Counter()\n    for y in yorumlar:\n        sayac.update(k for k in re.findall(r"[a-zçğıöşü]+", tr_kucuk(y)) if k not in duraklar and len(k) > 1)\n    return sorted(sayac.items(), key=lambda x: (-x[1], x[0]))[:n]\n',
        tests: 'Y = ["Kargo geç geldi", "KARGO hızlı, ürün güzel", "Ürün kırık, kargo geç", "İade ve iade"]\nD = {"ve"}\nassert en_sik_kelimeler(Y, D) == [("kargo", 3), ("geç", 2), ("iade", 2)], f"Gelen: {en_sik_kelimeler(Y, D)}; eşitlikte alfabetik sıra"\nassert en_sik_kelimeler(Y, D, 1) == [("kargo", 3)], "n=1 tek eleman"\nassert en_sik_kelimeler([], D) == [], "Boş girdi boş liste"\n',
        hints: ['Counter.most_common eşitlikte ilk görülen sırayı korur; alfabetik için sorted ile (-sayi, kelime) anahtarı kullan.', 'Türkçe küçük harfi unutma: "Ürün" ve "ürün" aynı kelime olmalı.'],
        why: 'Deterministik sıralama raporların her çalıştırmada aynı çıkmasını sağlar; (-sayı, kelime) anahtarı hem azalan sayıyı hem alfabetik eşitliği çözer.' },
      { t: 'code',
        id: 'nlp-metin-6',
        stage: 'Kendin yaz',
        diff: 2,
        q: '<p>KVKK için şikayet metinlerini maskele. <code>kisisel_maskele(metin)</code>: 11 haneli sayıları (TC kimlik no) <code>"[TCKN]"</code>, <code>05</code> ile başlayan 11 haneli telefonları ise <code>"[TEL]"</code> yapsın. Telefon önce kontrol edilmeli (05... da 11 hane). Sayılar başka rakamlarla bitişikse (ör. 16 haneli kart no) dokunulmasın.</p>',
        start: 'import re\n\ndef kisisel_maskele(metin):\n    pass\n',
        sol: 'import re\n\ndef kisisel_maskele(metin):\n    metin = re.sub(r"(?<!\\d)05\\d{9}(?!\\d)", "[TEL]", metin)\n    return re.sub(r"(?<!\\d)\\d{11}(?!\\d)", "[TCKN]", metin)\n',
        tests: 'm = kisisel_maskele("TC: 12345678901, tel 05321234567 arayın")\nassert m == "TC: [TCKN], tel [TEL] arayın", f"Gelen: {m}"\nassert kisisel_maskele("Kart 1234567890123456 bloke") == "Kart 1234567890123456 bloke", "16 haneli sayının içinden 11 hane maskelenmemeli"\nassert kisisel_maskele("no:12345678901.") == "no:[TCKN].", "Noktalama bitişikse de maskelenmeli"\n',
        hints: ['Rakama bitişik olmamayı (?<!\\d) ve (?!\\d) ile ifade et; \\b harflerle de sınır sayar.', 'Önce telefon deseni: (?<!\\d)05\\d{9}(?!\\d)'],
        why: 'Metni modele ya da dış API\'ye göndermeden önce kişisel veriyi maskelemek KVKK açısından temel adımdır; lookaround\'lar uzun sayıların bir parçasını yanlışlıkla maskelemeyi önler.' },
      { t: 'code',
        id: 'nlp-metin-7',
        stage: 'Kendin yaz',
        diff: 2,
        q: '<p><code>duygu_modeli(metinler, etiketler)</code>: <code>TfidfVectorizer(preprocessor=tr_kucuk)</code> + <code>MultinomialNB()</code> içeren bir Pipeline kurup eğitsin ve döndürsün. Test, modeli yeni yorumlarla sınayacak.</p>',
        start: 'from sklearn.pipeline import make_pipeline\nfrom sklearn.feature_extraction.text import TfidfVectorizer\nfrom sklearn.naive_bayes import MultinomialNB\n\ndef duygu_modeli(metinler, etiketler):\n    pass\n',
        sol: 'from sklearn.pipeline import make_pipeline\nfrom sklearn.feature_extraction.text import TfidfVectorizer\nfrom sklearn.naive_bayes import MultinomialNB\n\ndef tr_kucuk(s):\n    return s.replace("I", "ı").replace("İ", "i").lower()\n\ndef duygu_modeli(metinler, etiketler):\n    model = make_pipeline(TfidfVectorizer(preprocessor=tr_kucuk), MultinomialNB())\n    return model.fit(metinler, etiketler)\n',
        tests: 'yorumlar = [\n    ("Kargo çok hızlı geldi, ürün harika", "olumlu"),\n    ("Ürün tam anlatıldığı gibi, çok memnunum", "olumlu"),\n    ("Paketleme özenliydi, teşekkürler", "olumlu"),\n    ("Fiyatına göre kalitesi süper", "olumlu"),\n    ("Hızlı teslimat, güzel ürün, tavsiye ederim", "olumlu"),\n    ("Müşteri hizmetleri çok ilgiliydi, memnunum", "olumlu"),\n    ("Ürün kırık geldi, çok kötü", "olumsuz"),\n    ("Kargo geç geldi, bir daha almam", "olumsuz"),\n    ("Anlatıldığı gibi değil, iade etmek istiyorum", "olumsuz"),\n    ("Kalitesi berbat, param boşa gitti", "olumsuz"),\n    ("Müşteri hizmetlerine ulaşamadım, kötü deneyim", "olumsuz"),\n    ("Paket ezik ve ürün eksik geldi", "olumsuz"),\n]\nm = duygu_modeli([a for a, _ in yorumlar], [b for _, b in yorumlar])\nassert hasattr(m, "predict"), "Eğitilmiş bir model (Pipeline) döndürülmeli"\nt = m.predict(["ÜRÜN HARİKA, çok memnunum", "Kırık geldi, kötü", "İade etmek istiyorum, berbat"]).tolist()\nassert t == ["olumlu", "olumsuz", "olumsuz"], f"Tahminler: {t}; büyük harfli metinler de doğru küçültülmeli"\nassert list(m.classes_) == ["olumlu", "olumsuz"], "İki sınıf olmalı"\n',
        hints: ['make_pipeline(vektörleştirici, model) ve .fit(metinler, etiketler).', 'fit Pipeline\'ın kendisini döndürür; doğrudan return edebilirsin.'],
        why: 'Pipeline vektörleştiriciyi ve modeli tek nesnede tutar; predict\'e ham metin verirsin, temizlik ve vektörleştirme otomatik yapılır.' },
      { t: 'code',
        id: 'nlp-metin-8',
        stage: 'Kendin yaz',
        diff: 2,
        q: '<p>Kelime çantasını elle kur. <code>kelime_cantasi(belgeler)</code>: belgeler zaten token listesi (ör. <code>[["kargo", "geç"], ...]</code>). Dönüş <code>(sozluk, matris)</code>: <code>sozluk</code> tüm benzersiz kelimelerin alfabetik listesi, <code>matris</code> her belge için sözlük sırasıyla sayım listesi (liste listesi).</p>',
        start: 'def kelime_cantasi(belgeler):\n    pass\n',
        sol: 'from collections import Counter\n\ndef kelime_cantasi(belgeler):\n    sozluk = sorted({k for b in belgeler for k in b})\n    matris = []\n    for b in belgeler:\n        c = Counter(b)\n        matris.append([c[k] for k in sozluk])\n    return sozluk, matris\n',
        tests: 's, m = kelime_cantasi([["kargo", "geç", "geç"], ["ürün", "kırık"], []])\nassert s == ["geç", "kargo", "kırık", "ürün"], f"Sözlük alfabetik olmalı: {s}"\nassert m == [[2, 1, 0, 0], [0, 0, 1, 1], [0, 0, 0, 0]], f"Matris yanlış: {m}"\nassert kelime_cantasi([]) == ([], []), "Boş girdi"\n',
        hints: ['Küme kavrayışı ile tüm kelimeleri topla, sorted ile sırala.', 'Her belge için Counter kur; c[k] olmayan kelimede 0 döndürür.'],
        why: 'CountVectorizer\'ın yaptığı tam olarak budur; tek farkı sonucu seyrek matris olarak saklamasıdır.' },
      { t: 'code',
        id: 'nlp-metin-9',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 2,
        q: '<p>Hatayı bul ve düzelt. <code>siniflandir(egitim_metin, egitim_etiket, yeni_metinler)</code> eğitim verisiyle model kurup yeni metinlerin etiketlerini liste olarak döndürmeli. Ama hata veriyor (ya da şans eseri çalışsa bile yanlış sütunlarla tahmin yapıyor).</p>',
        start: 'from sklearn.feature_extraction.text import TfidfVectorizer\nfrom sklearn.linear_model import LogisticRegression\n\ndef siniflandir(egitim_metin, egitim_etiket, yeni_metinler):\n    vec = TfidfVectorizer()\n    X = vec.fit_transform(egitim_metin)\n    model = LogisticRegression(C=10).fit(X, egitim_etiket)\n    X_yeni = vec.fit_transform(yeni_metinler)\n    return model.predict(X_yeni).tolist()\n',
        sol: 'from sklearn.feature_extraction.text import TfidfVectorizer\nfrom sklearn.linear_model import LogisticRegression\n\ndef siniflandir(egitim_metin, egitim_etiket, yeni_metinler):\n    vec = TfidfVectorizer()\n    X = vec.fit_transform(egitim_metin)\n    model = LogisticRegression(C=10).fit(X, egitim_etiket)\n    X_yeni = vec.transform(yeni_metinler)\n    return model.predict(X_yeni).tolist()\n',
        tests: 'M = ["kart yutuldu", "kart bloke oldu", "kredi faizi yüksek", "kredi başvurusu reddedildi", "uygulama açılmıyor", "uygulama şifre hatası"]\nE = ["kart", "kart", "kredi", "kredi", "dijital", "dijital"]\nr = siniflandir(M, E, ["kart yine yutuldu", "kredi faizi", "uygulama donuyor"])\nassert r == ["kart", "kredi", "dijital"], f"Tahminler: {r}"\nassert "fit_transform(yeni_metinler)" not in __source__, "Yeni metinler için sözlük yeniden kurulmamalı (transform kullan)"\n',
        hints: ['Yeni metinlerde fit_transform çağırmak sözlüğü ve sütun sayısını değiştirir.', 'Eğitilmiş sözlüğü kullanmak için transform.'],
        why: 'Model eğitimdeki sütun düzenini bekler. fit_transform yeni bir sözlük kurar; sütun sayısı farklıysa hata verir, aynıysa daha kötüsü sessizce yanlış sütunlarla tahmin yapar.' },
      { t: 'code',
        id: 'nlp-metin-10',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 1,
        q: '<p>Hatayı bul ve düzelt. <code>iade_sayisi(yorumlar)</code> içinde "iade" kelimesi geçen yorumları saymalı (büyük-küçük harf fark etmeksizin). "İADE", "İade" yazılmış yorumlar sayılmıyor.</p>',
        start: 'import re\n\ndef iade_sayisi(yorumlar):\n    sayi = 0\n    for y in yorumlar:\n        if "iade" in re.findall(r"\\w+", y.lower()):\n            sayi += 1\n    return sayi\n',
        sol: 'import re\n\ndef tr_kucuk(s):\n    return s.replace("I", "ı").replace("İ", "i").lower()\n\ndef iade_sayisi(yorumlar):\n    sayi = 0\n    for y in yorumlar:\n        if "iade" in re.findall(r"\\w+", tr_kucuk(y)):\n            sayi += 1\n    return sayi\n',
        tests: 'Y = ["İADE istiyorum", "iade süreci uzun", "İade edildi mi?", "Kargo geç", "IADE yazdım"]\nassert iade_sayisi(Y) == 3, f"3 yorum iade içeriyor (İADE, iade, İade); gelen {iade_sayisi(Y)}. IADE ise ıade olur, sayılmaz."\nassert iade_sayisi([]) == 0, "Boş liste 0"\n',
        hints: ['"İ".lower() iki karakter üretir; \\w+ birleşen noktayı ayrı token sayabilir.', 'Türkçe küçük harf fonksiyonunu (I→ı, İ→i) kullan.'],
        why: '"İADE".lower() "i̇ade" (i + U+0307) üretir; bu "iade" ile eşleşmez. Türkçe dönüşüm İ→i yaparak sorunu çözer. "IADE" Türkçede "ıade" okunur; yazım hatasını yakalamak ayrı bir iştir.' },
      { t: 'code',
        id: 'nlp-metin-11',
        stage: 'Meydan okuma',
        diff: 3,
        q: '<p>TF-IDF\'i elle hesapla. <code>tfidf_elle(belgeler)</code>: belgeler token listeleri. scikit-learn varsayılanlarını uygula: <code>tf</code> = ham sayım, <code>idf = ln((1 + N) / (1 + df)) + 1</code> (N belge sayısı, df kelimenin geçtiği belge sayısı), her belge vektörü L2 normuna bölünür. Her belge için <code>{kelime: ağırlık}</code> sözlüğü (yalnız belgede geçen kelimeler, 4 basamağa yuvarlı) listesini döndür. Sonuç <code>TfidfVectorizer(analyzer=lambda d: d)</code> ile aynı olmalı.</p>',
        start: 'import math\nfrom collections import Counter\n\ndef tfidf_elle(belgeler):\n    pass\n',
        sol: 'import math\nfrom collections import Counter\n\ndef tfidf_elle(belgeler):\n    N = len(belgeler)\n    df = Counter(k for b in belgeler for k in set(b))\n    idf = {k: math.log((1 + N) / (1 + d)) + 1 for k, d in df.items()}\n    sonuc = []\n    for b in belgeler:\n        ham = {k: s * idf[k] for k, s in Counter(b).items()}\n        norm = math.sqrt(sum(v * v for v in ham.values())) or 1.0\n        sonuc.append({k: round(v / norm, 4) for k, v in ham.items()})\n    return sonuc\n',
        tests: 'from sklearn.feature_extraction.text import TfidfVectorizer\nB = [["kargo", "geç", "geldi"], ["ürün", "kırık", "geldi"], ["kargo", "hızlı", "ürün", "ürün", "güzel"]]\nv = TfidfVectorizer(analyzer=lambda d: d)\nX = v.fit_transform(B).toarray()\nadlar = v.get_feature_names_out()\nbeklenen = [{adlar[j]: round(float(X[i, j]), 4) for j in range(len(adlar)) if X[i, j] > 0} for i in range(len(B))]\nr = tfidf_elle(B)\nassert r == beklenen, f"sklearn ile farklı:\\nbeklenen {beklenen}\\ngelen {r}"\nassert tfidf_elle([]) == [], "Boş girdi"\n',
        hints: [
          'df için her belgede kelimeyi bir kez saymak gerekir: set(b).',
          'math.log doğal logaritmadır; smooth_idf formülünde N ve df\'ye 1 eklenir, sonuca da 1.',
          'Normu sözlüğün değerlerinin kareleri toplamının kökü olarak hesapla.'
        ],
        why: 'Formülü elle yazınca TF-IDF\'in neden yaygın kelimeleri bastırdığını ve L2 normalizasyonun kosinüs benzerliğini neden basit bir nokta çarpımına indirdiğini görürsün.' },
      { t: 'code',
        id: 'nlp-metin-12',
        stage: 'Meydan okuma',
        diff: 3,
        q: '<p>Türkçe ekler kelime eşleşmesini bozar: "iadesini" ile "iade" farklı token. <code>en_benzer_cift(metinler)</code>: <code>TfidfVectorizer(analyzer="char_wb", ngram_range=(2, 4), preprocessor=tr_kucuk)</code> ile vektörleştir, kosinüs benzerliği en yüksek iki <b>farklı</b> metnin indeks çiftini <code>(i, j)</code>, i &lt; j olacak şekilde döndür. 2\'den az metin varsa <code>None</code>.</p>',
        start: 'import numpy as np\nfrom sklearn.feature_extraction.text import TfidfVectorizer\nfrom sklearn.metrics.pairwise import cosine_similarity\n\ndef en_benzer_cift(metinler):\n    pass\n',
        sol: 'import numpy as np\nfrom sklearn.feature_extraction.text import TfidfVectorizer\nfrom sklearn.metrics.pairwise import cosine_similarity\n\ndef tr_kucuk(s):\n    return s.replace("I", "ı").replace("İ", "i").lower()\n\ndef en_benzer_cift(metinler):\n    if len(metinler) < 2:\n        return None\n    vec = TfidfVectorizer(analyzer="char_wb", ngram_range=(2, 4), preprocessor=tr_kucuk)\n    S = cosine_similarity(vec.fit_transform(metinler))\n    np.fill_diagonal(S, -1)\n    i, j = np.unravel_index(S.argmax(), S.shape)\n    return (int(min(i, j)), int(max(i, j)))\n',
        tests: 'M = ["Kargo geç geldi", "İADESİNİ yapmak istiyorum", "Fatura adresi yanlış", "iade yapılsın istiyorum"]\nassert en_benzer_cift(M) == (1, 3), f"İade cümleleri (1, 3) en benzer olmalı; gelen {en_benzer_cift(M)}"\nassert en_benzer_cift(["tek"]) is None, "Tek metin -> None"\nr = en_benzer_cift(["kredi kartı borcu", "hava güzel", "kredi kartımın borcu"])\nassert r == (0, 2) and all(type(x) is int for x in r), "Düz int çifti dönmeli"\n',
        hints: ['Benzerlik matrisinin köşegeni (metnin kendisiyle benzerliği) 1\'dir; onu -1 yaparak dışla.', 'np.unravel_index(S.argmax(), S.shape) matristeki en büyük değerin (satır, sütun) konumunu verir.'],
        why: 'Karakter n-gram\'lar "iade", "iades", "ade" gibi parçaları paylaştığı için ekli biçimleri birbirine yaklaştırır; Türkçede kök bulma kütüphanesi olmadan alınabilecek en ucuz kazançtır.' },
      { t: 'code',
        id: 'nlp-metin-13',
        stage: 'Mini proje',
        diff: 3,
        q: '<p>Anadolu Bank şikayet yönlendirici. <code>sikayet_yonlendir(egitim, yeni_metinler, esik=0.5)</code>:</p><ol><li><code>egitim</code>: <code>(metin, departman)</code> çiftleri. Metinleri önce <code>kisisel_maskele</code> (11 haneli sayıları <code>[TCKN]</code> yap) ve Türkçe küçük harf ile hazırla.</li><li><code>TfidfVectorizer</code> + <code>LogisticRegression(C=10)</code> Pipeline\'ı eğit.</li><li>Her yeni metin için sözlük üret: <code>{"metin": maskelenmiş_metin, "departman": tahmin, "guven": en_yüksek_olasılık (2 basamak)}</code>. Güven <code>esik</code>\'ten küçükse departman <code>"İnsan incelemesi"</code> olsun.</li></ol>',
        start: 'import re\nfrom sklearn.pipeline import make_pipeline\nfrom sklearn.feature_extraction.text import TfidfVectorizer\nfrom sklearn.linear_model import LogisticRegression\n\ndef sikayet_yonlendir(egitim, yeni_metinler, esik=0.5):\n    pass\n',
        sol: 'import re\nfrom sklearn.pipeline import make_pipeline\nfrom sklearn.feature_extraction.text import TfidfVectorizer\nfrom sklearn.linear_model import LogisticRegression\n\ndef tr_kucuk(s):\n    return s.replace("I", "ı").replace("İ", "i").lower()\n\ndef kisisel_maskele(metin):\n    return re.sub(r"(?<!\\d)\\d{11}(?!\\d)", "[TCKN]", metin)\n\ndef sikayet_yonlendir(egitim, yeni_metinler, esik=0.5):\n    X = [kisisel_maskele(m) for m, _ in egitim]\n    y = [d for _, d in egitim]\n    model = make_pipeline(TfidfVectorizer(preprocessor=tr_kucuk), LogisticRegression(C=10)).fit(X, y)\n    temiz = [kisisel_maskele(m) for m in yeni_metinler]\n    sonuc = []\n    for metin, olas in zip(temiz, model.predict_proba(temiz)):\n        guven = round(float(olas.max()), 2)\n        dep = model.classes_[olas.argmax()] if guven >= esik else "İnsan incelemesi"\n        sonuc.append({"metin": metin, "departman": str(dep), "guven": guven})\n    return sonuc\n',
        tests: 'E = [("Kartım ATM\'de yutuldu", "Kart"), ("Kart limitim düşürülmüş", "Kart"), ("Kartım bloke oldu", "Kart"),\n     ("Kredi faizim çok yüksek", "Kredi"), ("Kredi başvurum reddedildi", "Kredi"), ("Konut kredisi taksiti yanlış", "Kredi"),\n     ("Mobil uygulama açılmıyor", "Dijital"), ("İnternet şubesi şifre hatası", "Dijital"), ("Uygulama sürekli donuyor", "Dijital")]\nr = sikayet_yonlendir(E, ["KARTIM yine bloke oldu, TC 12345678901", "Kredi faizi yüksek", "Merhaba"], esik=0.45)\nassert [x["departman"] for x in r[:2]] == ["Kart", "Kredi"], f"İlk iki şikayet doğru departmana gitmeli: {r}"\nassert "[TCKN]" in r[0]["metin"] and "12345678901" not in r[0]["metin"], "TC kimlik no maskelenmeli"\nassert r[2]["departman"] == "İnsan incelemesi", f"Hiç bilinen kelime içermeyen metin düşük güvenle insana gitmeli: {r[2]}"\nassert all(0 <= x["guven"] <= 1 and isinstance(x["guven"], float) for x in r), "Güven 0-1 arası float"\n',
        hints: [
          'Maskeleyi hem eğitime hem yeni metinlere uygula; aynı hazırlık hattı.',
          'predict_proba her satır için sınıf olasılıklarını verir; sınıf adları model.classes_ sırasındadır.',
          'Bilinmeyen kelimelerden oluşan metin sıfır vektör olur ve olasılıklar sınıf önceliklerine (yaklaşık 1/3) yakın çıkar.'
        ],
        why: 'Gerçek yönlendirme sistemleri tam olarak böyle çalışır: kişisel veri maskeleme, hızlı bir temel model ve düşük güvenli kayıtlar için insan döngüsü (human-in-the-loop).' }
    ],
    faq: [
      { q: 'Türkçe için hazır durak kelime listesi var mı?',
        a: 'Var (ör. NLTK\'nin Türkçe listesi, çeşitli GitHub listeleri). Ama listeyi gözden geçir: "değil", "yok", "hiç" gibi kelimeler duygu analizinde kritik olabilir. Küçük bir elle yazılmış liste ile başlamak çoğu zaman daha güvenlidir.' },
      { q: 'MultinomialNB mi LogisticRegression mı?',
        a: 'İkisini de dene, cross_val_score ile karşılaştır. NB çok küçük veride ve hız gerektiğinde iyidir; LogisticRegression genelde biraz daha isabetli ve olasılıkları daha iyi kalibre edilmiştir.' },
      { q: 'TF-IDF yerine neden hemen bir transformer modeli kullanmıyoruz?',
        a: 'Transformer modelleri daha isabetli olabilir ama indirme, bellek, GPU ve gecikme maliyeti getirir; kararlarını açıklamak da zordur. TF-IDF ile bir temel çizgi kurup farkı ölçmeden karmaşık modele geçmek, kazancın maliyete değip değmediğini bilmemek demektir.' },
      { q: 'Emoji ve yazım hatalarıyla ne yapmalıyım?',
        a: 'Emojiler duygu için güçlü sinyaldir; atmak yerine metne çevirmeyi (😡 → "kızgın") düşün. Yazım hatalarına karşı karakter n-gram TF-IDF iyi bir dayanıklılık sağlar; Zemberek gibi araçlar düzeltme önerebilir.' }
    ],
    mistakes: [
      { bad: 'temiz = yorum.lower()',
        good: 'temiz = yorum.replace("I", "ı").replace("İ", "i").lower()',
        why: 'lower() Türkçe I/İ kurallarını bilmez; "İADE" "iade" ile eşleşmez, "IŞIK" "işik" olur.' },
      { bad: 'X_yeni = vec.fit_transform(yeni_yorumlar)\nmodel.predict(X_yeni)',
        good: 'X_yeni = vec.transform(yeni_yorumlar)\nmodel.predict(X_yeni)',
        why: 'fit_transform yeni bir sözlük kurar; sütunlar modelin eğitildiği sütunlarla uyuşmaz.' },
      { bad: 'DURAKLAR = {"ve", "bir", "değil", "yok", "hiç"}',
        good: 'DURAKLAR = {"ve", "bir", "bu", "da", "de", "ile"}',
        why: 'Olumsuzluk kelimelerini atmak "memnun değilim" ile "memnunum"u aynı yapar; duygu analizi çöker.' },
      { bad: 'X = vec.fit_transform(tum_metinler)\nX_tr, X_te = train_test_split(X)',
        good: 'pipe = make_pipeline(TfidfVectorizer(), LogisticRegression())\ncross_val_score(pipe, metinler, etiketler, cv=5)',
        why: 'Vektörleştiriciyi bölmeden önce tüm veriye fit etmek IDF\'e test bilgisini sızdırır; Pipeline bunu önler.' }
    ] }
);
})(window);
