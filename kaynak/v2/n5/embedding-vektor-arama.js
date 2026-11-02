/* Kesit Python — İleri: embedding-vektor-arama (Embedding ve vektör arama) */
// needs: numpy
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push(
  {
    id: 'embedding-vektor-arama',
    lv: 'ileri',
    mod: 'Yapay Zekâ',
    min: 60,
    needs: ['numpy'],
    title: 'Embedding ve vektör arama: anlamsal arama ve RAG\'in getirme katmanı',
    sum: 'Embedding, normalizasyon ve benzerlik ölçülerinden numpy ile kNN\'ye, ANN indekslerine (HNSW, IVF, FAISS, pgvector), parçalama stratejilerine, BM25 + vektör hibrit aramaya, RRF ve MMR\'ye, recall@k/MRR ile değerlendirmeye ve yetki filtresine kadar getirme katmanını Lezzet Kurye yorumları üzerinde uygularsın.',
    goals: [
      'Kosinüs, nokta çarpımı ve L2 arasındaki ilişkiyi açıklayıp vektörleri normalize ederek numpy ile kNN araması yapabilirim.',
      'Sabit, cümle ve başlık bazlı parçalama stratejilerini uygulayıp aralarında seçim yapabilirim.',
      'BM25\'i saf Python ile yazıp vektör aramasıyla RRF kullanarak birleştirebilirim.',
      'Altın soru setiyle recall@k ve MRR ölçerek getirme kalitesini sayıyla karşılaştırabilirim.',
      'Metadata ve yetki filtresini sıralamadan önce uygulayarak güvenli kurumsal arama kurabilirim.'
    ],
    body: `
<h2>Kelimeyle değil anlamla aramak</h2>
<p>Lezzet Kurye destek ekibi "yemek buz gibiydi" diye yazan müşterinin şikâyetine benzer eski kayıtları bulmak istiyor. Klasik anahtar kelime araması "soğuk geldi" yazan kayıtları kaçırır, çünkü ortak kelime yoktur. <b>Embedding</b> (gömme vektörü), bir metni anlamını temsil eden sayı dizisine çevirir: anlamca yakın metinlerin vektörleri de birbirine yakın düşer. Anlamsal arama, öneri sistemleri, kümeleme, yinelenen kayıt bulma ve RAG'in (Retrieval-Augmented Generation) "getirme" katmanı bu fikre dayanır.</p>
<p><code>llm-api</code> dersinde TF-IDF ile basit bir RAG kurdun. Bu derste getirme katmanını mühendis gözüyle derinleştireceksin: vektör benzerliği, numpy ile kNN, ANN indeksleri, parçalama stratejileri, BM25 ile hibrit arama, RRF, yeniden sıralama, değerlendirme metrikleri ve yetki filtresi.</p>
<div class="note"><b>Tarayıcıda sahte embedding</b>Gerçek embedding modelleri (sentence-transformers, OpenAI, Cohere, Voyage...) yüzlerce MB'lık ağlar ya da ağ üzerinden API'lerdir. Alıştırmalarda karakter üçlülerini (trigram) hash'leyen 256 boyutlu bir <b>sahte embedding</b> kullanacağız. Anlamı değil yazım benzerliğini yakalar; ama vektör aramanın tüm mühendisliği (normalizasyon, kNN, indeks, değerlendirme) birebir aynıdır. Sahte modelin hatalarını görmek, gerçek modelin neden gerektiğini de gösterecek.</div>

<h2>1. Embedding, boyut ve benzerlik ölçüleri</h2>
<p>Bir embedding, sabit uzunlukta bir ondalık sayı vektörüdür; uzunluğa <b>boyut</b> (dimension) denir (yaygın değerler 384, 768, 1024, 1536, 3072). Benzerliği üç ölçüyle hesaplarsın:</p>
<div class="tbl-wrap"><table>
<tr><th>Ölçü</th><th>Formül</th><th>Yorum</th></tr>
<tr><td>Kosinüs benzerliği (cosine similarity)</td><td>a·b / (‖a‖·‖b‖)</td><td>-1..1; vektörlerin <b>yönüne</b> bakar, uzunluğu yok sayar</td></tr>
<tr><td>Nokta çarpımı (dot product)</td><td>a·b</td><td>Vektörler birim uzunluktaysa kosinüsle aynıdır ve en hızlısıdır</td></tr>
<tr><td>Öklid uzaklığı (L2)</td><td>‖a − b‖</td><td>Küçük = yakın; birim vektörlerde ‖a−b‖² = 2 − 2·cos</td></tr>
</table></div>
<p>Pratikte vektörler bir kez <b>normalize</b> edilir (L2 normu 1 yapılır); sonra her karşılaştırma tek bir nokta çarpımıdır.</p>
<pre class="py">import numpy as np

a = np.array([3.0, 4.0])
b = np.array([6.0, 8.0])     # a ile aynı yön, iki kat uzun
c = np.array([4.0, -3.0])    # a'ya dik

def kosinus(x, y):
    return float(x @ y / (np.linalg.norm(x) * np.linalg.norm(y)))

print("cos(a, b) =", round(kosinus(a, b), 3), " cos(a, c) =", round(kosinus(a, c), 3))
an, bn = a / np.linalg.norm(a), b / np.linalg.norm(b)
print("normalize sonrası nokta çarpımı:", round(float(an @ bn), 3))
print("L2(a, b) =", round(float(np.linalg.norm(a - b)), 3), " normalize L2:", round(float(np.linalg.norm(an - bn)), 3))</pre>

<h2>2. Sahte embedding modeli ve gerçek veri</h2>
<p>Modelimiz her kelimenin başına ve sonuna boşluk koyup üç karakterlik parçalarını çıkarır, her parçayı <code>zlib.crc32</code> ile 256 kutudan birine düşürür ve sayar (hashing trick). Sonra vektörü normalize eder. Lezzet Kurye'nin gerçek <code>lk_ratings</code> tablosundaki yorumlar üzerinde deneyelim:</p>
<pre class="py">import re
import zlib
import numpy as np

def tr_kucuk(s):
    return s.replace("I", "ı").replace("İ", "i").lower()

def sahte_embedding(metin, boyut=256):
    v = np.zeros(boyut)
    for kelime in re.findall(r"\\w+", tr_kucuk(metin)):
        k = f" {kelime} "
        for i in range(len(k) - 2):
            v[zlib.crc32(k[i:i + 3].encode()) % boyut] += 1
    n = np.linalg.norm(v)
    return v / n if n else v


import veri
from collections import Counter

kayitlar = veri.kayitlar("lezzet_kurye", "lk_ratings")
sayim = Counter(k["comment"] for k in kayitlar if k["comment"])
yorumlar = sorted(sayim)
M = np.array([sahte_embedding(y) for y in yorumlar])   # 13 × 256 matris
print(len(kayitlar), "puan,", len(yorumlar), "farklı yorum, matris", M.shape)
print("normlar:", np.round(np.linalg.norm(M, axis=1)[:3], 3))</pre>

<h2>3. numpy ile kNN: kaba kuvvet arama</h2>
<p>En yakın k komşu (k-nearest neighbors, kNN) aramasında sorgu vektörünü tüm belge vektörleriyle çarparsın: <code>M @ q</code> tek bir matris-vektör çarpımıdır ve 100 bin belgede bile milisaniyeler sürer. En büyük k skoru bulmak için tüm diziyi sıralamak yerine <code>np.argpartition</code> O(n) çalışır; sonra yalnız k elemanı sıralarsın.</p>
<pre class="py">def en_yakin(sorgu, k=3):
    s = M @ sahte_embedding(sorgu)
    aday = np.argpartition(-s, k)[:k]          # sırasız ilk k
    aday = aday[np.argsort(-s[aday], kind="stable")]
    return [(yorumlar[i], round(float(s[i]), 3)) for i in aday]

for soru in ["kurye geç geldi", "porsiyon az", "yemek soğuktu"]:
    print(soru, "→", en_yakin(soru))</pre>
<p>Son satıra dikkat: "yemek soğuktu" için ilk sonuç "Yemek dökülmüştü". Sahte model "yemek" kelimesindeki ortak harfleri anlamdan önemli sayıyor. Gerçek bir anlamsal model "soğuktu" ile "Soğuk geldi" arasındaki anlam yakınlığını yakalardı. Bu, model seçiminin getirme kalitesini doğrudan belirlediğini gösterir.</p>
<pre class="code"># Gerçek embedding modeli (pip install sentence-transformers)
from sentence_transformers import SentenceTransformer
model = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")   # Türkçe destekli çok dilli model
M = model.encode(yorumlar, normalize_embeddings=True)                    # (13, 384)
q = model.encode(["yemek buz gibiydi"], normalize_embeddings=True)[0]
print(yorumlar[int((M @ q).argmax())])</pre>
<div class="note"><b>Kendi bilgisayarında dene</b><code>pip install sentence-transformers</code> modeli ilk çalıştırmada indirir (~100-500 MB). API tabanlı modellerde (OpenAI <code>text-embedding-3-small</code>, Voyage, Cohere) aynı vektörleri HTTP üzerinden alırsın; model adlarını sağlayıcı belgesinden kontrol et.</div>

<h2>4. ANN indeksleri ve vektör veritabanları</h2>
<p>Kaba kuvvet arama birkaç milyon vektöre kadar iş görür. Daha büyük ölçekte <b>yaklaşık en yakın komşu</b> (Approximate Nearest Neighbor, ANN) indeksleri kullanılır: biraz isabetten (recall) feragat edip yüzlerce kat hız kazanırsın.</p>
<div class="tbl-wrap"><table>
<tr><th>Yöntem / Araç</th><th>Fikir</th><th>Not</th></tr>
<tr><td>HNSW</td><td>Katmanlı "küçük dünya" grafı; üst katmanda uzun atlamalar, altta ince arama</td><td>Çok hızlı, bellek yoğun; pgvector, Qdrant, Weaviate destekler</td></tr>
<tr><td>IVF</td><td>Vektörleri k-means kümelerine böl, yalnız en yakın birkaç kümede ara</td><td><code>nprobe</code> arttıkça doğruluk artar, hız düşer</td></tr>
<tr><td>PQ (product quantization)</td><td>Vektörü sıkıştırarak sakla</td><td>Milyarlarca vektörde bellek tasarrufu</td></tr>
<tr><td>FAISS</td><td>Meta'nın C++/Python kütüphanesi</td><td>Kendi sunucunda, kütüphane olarak</td></tr>
<tr><td>Chroma</td><td>Gömülü, geliştirici dostu vektör deposu</td><td>Prototip ve küçük projeler</td></tr>
<tr><td>pgvector</td><td>PostgreSQL eklentisi</td><td>Veri zaten Postgres'teyse; SQL ile filtre + vektör</td></tr>
</table></div>
<pre class="code"># FAISS (pip install faiss-cpu)
import faiss
indeks = faiss.IndexFlatIP(M.shape[1])     # iç çarpım = normalize vektörde kosinüs
indeks.add(M.astype("float32"))
skorlar, idler = indeks.search(q.reshape(1, -1).astype("float32"), 3)

# pgvector (PostgreSQL)
# CREATE EXTENSION vector;
# CREATE TABLE yorum (id serial, metin text, sahip text, emb vector(384));
# CREATE INDEX ON yorum USING hnsw (emb vector_cosine_ops);
# SELECT metin FROM yorum WHERE sahip = %s ORDER BY emb &lt;=&gt; %s LIMIT 5;   -- &lt;=&gt; kosinüs uzaklığı</pre>

<h2>5. Parçalama (chunking) stratejileri</h2>
<p>Uzun belge tek bir vektöre sığdırılırsa anlamı "ortalanır" ve ayrıntı kaybolur; bu yüzden belgeler parçalara bölünür. <code>llm-api</code> dersinde sabit kelime sayısıyla örtüşmeli parçalamayı yazdın. Diğer stratejiler:</p>
<ul>
<li><b>Cümle bazlı</b>: cümle sınırlarından bölüp karakter sınırına kadar cümle eklemek; cümleler yarıda kesilmez.</li>
<li><b>Başlık bazlı</b>: Markdown/HTML başlıklarına göre bölmek; her parça "İade &gt; Süre" gibi bir başlık yolu (metadata) taşır. Yönetmelik ve yardım merkezi metinleri için en iyi başlangıçtır.</li>
<li><b>Örtüşme</b> (overlap): ardışık parçaların bir-iki cümle paylaşması, sınırdaki bilginin kaybolmasını azaltır.</li>
</ul>
<pre class="py">import re

def cumlelere_bol(metin):
    return [c for c in re.split(r"(?&lt;=[.!?])\\s+", metin.strip()) if c]

politika = "İade süresi 14 gündür. Hasarlı ürünlerde kargo bizden. Kampanyalı ürünler iade edilebilir! Hediye kartı iade edilemez."
print(cumlelere_bol(politika))</pre>
<div class="tip"><b>Parça boyutu nasıl seçilir?</b>Tek bir doğru değer yok: küçük parçalar isabetli ama bağlamsız, büyük parçalar bağlamlı ama gürültülü olur. 200–800 token aralığından başla, altın soru setiyle recall@k ölçerek ayarla. Her parçaya belge kimliği, başlık ve tarih gibi metadata ekle.</div>

<h2>6. Hibrit arama: BM25 + vektör ve RRF</h2>
<p>Vektör araması "AM-4471" gibi ürün kodlarını, kişi adlarını ve nadir terimleri kaçırabilir; anahtar kelime araması ise eş anlamlıları kaçırır. <b>Hibrit arama</b> ikisini birleştirir. Anahtar kelime tarafında standart <b>BM25</b>'tir: TF-IDF'e benzer ama terim sıklığının etkisini doyurur (k1) ve uzun belgeleri cezalandırır (b).</p>
<p>BM25 skoru ile kosinüs skoru farklı ölçeklerdedir; doğrudan toplanamaz. <b>RRF</b> (Reciprocal Rank Fusion) skorları değil <b>sıraları</b> birleştirir: her listede r. sıradaki belge 1/(k + r) puan alır (genelde k = 60). İki listede de üst sıralarda olan belge öne çıkar.</p>
<pre class="py">import math
import re
from collections import Counter

def kelimeler(metin):
    return re.findall(r"\\w+", metin.replace("I", "ı").replace("İ", "i").lower())

class BM25:
    def __init__(self, belgeler, k1=1.5, b=0.75):
        self.k1, self.b = k1, b
        self.tf = [Counter(kelimeler(d)) for d in belgeler]
        self.uzunluk = [sum(t.values()) for t in self.tf]
        self.ort = sum(self.uzunluk) / len(belgeler) if belgeler else 0
        self.df = Counter(w for t in self.tf for w in t)
        self.N = len(belgeler)

    def idf(self, w):
        n = self.df.get(w, 0)
        return math.log((self.N - n + 0.5) / (n + 0.5) + 1)

    def skorla(self, sorgu):
        q = kelimeler(sorgu)
        sonuc = []
        for tf, dl in zip(self.tf, self.uzunluk):
            s = 0.0
            for w in q:
                f = tf.get(w, 0)
                if f:
                    s += self.idf(w) * f * (self.k1 + 1) / (f + self.k1 * (1 - self.b + self.b * dl / self.ort))
            sonuc.append(s)
        return sonuc


def rrf(siralamalar, k=60):
    skor = {}
    for sira in siralamalar:
        for r, d in enumerate(sira, 1):
            skor[d] = skor.get(d, 0.0) + 1 / (k + r)
    return sorted(skor, key=lambda d: (-skor[d], d))

belgeler = ["iade süresi 14 gündür", "AM-4471 kablosuz kulaklık stokta", "kulaklık iadesinde kutu şart"]
bm = BM25(belgeler).skorla("AM-4471 kulaklık")
vek = [float(sahte_embedding(d) @ sahte_embedding("AM-4471 kulaklık")) for d in belgeler]
s_bm = sorted(range(3), key=lambda i: -bm[i])
s_vek = sorted(range(3), key=lambda i: -vek[i])
print("BM25:", [round(x, 2) for x in bm], s_bm)
print("Vektör:", [round(x, 2) for x in vek], s_vek)
print("RRF:", rrf([s_bm, s_vek]))</pre>
<h3>Yeniden sıralama (reranking)</h3>
<p>Hibrit arama hızlıca 20–100 aday getirir; ardından daha pahalı bir <b>çapraz kodlayıcı</b> (cross-encoder) model her (soru, parça) çiftini birlikte okuyup alaka puanı verir ve en iyi 3–5'i seçer. Bi-encoder (embedding) soru ve belgeyi ayrı kodladığı için hızlıdır; cross-encoder birlikte kodladığı için daha isabetlidir ama her aday için ayrı çalışır. Çeşitlilik için MMR (Maximal Marginal Relevance) gibi yöntemler, birbirinin kopyası olan sonuçları cezalandırır.</p>

<h2>7. Getirmeyi ölçmek: recall@k ve MRR</h2>
<p>"Arama iyi mi?" sorusu hisle değil <b>altın soru setiyle</b> (golden set) cevaplanır: her soru için doğru belge(ler) önceden etiketlenir. <b>recall@k</b>: doğru belgenin ilk k sonuçta olma oranı. <b>MRR</b> (Mean Reciprocal Rank): doğru belgenin sırasının tersinin ortalaması (1. sıra 1, 2. sıra 0,5, yoksa 0).</p>
<pre class="py">altin = {"iade süresi": "iade-1", "kargo ücreti": "kargo-1", "garanti": "urun-4471"}
sonuclar = {"iade süresi": ["iade-1", "iade-2", "kargo-1"],
            "kargo ücreti": ["iade-2", "kargo-1", "kargo-2"],
            "garanti": ["kargo-2", "iade-1", "iade-2"]}

def metrikler(sonuclar, altin, k):
    isabet = [altin[s] in sonuclar[s][:k] for s in altin]
    rr = [1 / (sonuclar[s].index(altin[s]) + 1) if altin[s] in sonuclar[s][:k] else 0 for s in altin]
    return round(sum(isabet) / len(altin), 3), round(sum(rr) / len(altin), 3)

for k in (1, 3):
    print(f"recall@{k}, MRR@{k} =", metrikler(sonuclar, altin, k))</pre>

<h2>8. Metadata filtreleme ve yetki</h2>
<p>Kurumsal aramada her kullanıcı yalnız görme yetkisi olan belgeleri görmelidir: Ali'nin iade notu Ayşe'nin sonuçlarında çıkmamalı. Filtre <b>sıralamadan önce</b> uygulanmalıdır (pre-filtering). Önce ilk k'yı alıp sonra yetkisizleri atmak (post-filtering) iki sorun yaratır: k'dan az sonuç döner ve hata yapılırsa yetkisiz belge LLM istemine sızar. Vektör veritabanları bu yüzden <code>where</code> koşulunu indeks aramasıyla birlikte uygular. Ayrıca embedding'ler de kişisel veri sayılabilir; silinen bir belgenin vektörü de silinmelidir (KVKK).</p>

<h2>9. Kullanım alanları</h2>
<ul>
<li><b>Benzer şikâyet bulma</b>: yeni yorumun en yakın geçmiş kayıtları ve onların ortalama puanı.</li>
<li><b>Kümeleme</b>: <code>ml-kumeleme</code> dersindeki k-means'i embedding'lere uygulayıp şikâyet konularını keşfetmek.</li>
<li><b>Anomali / yeni konu</b>: hiçbir bilinen kayda yeterince benzemeyen (en yüksek kosinüs &lt; eşik) yorum, yeni bir sorun türünün habercisidir.</li>
<li><b>Yinelenen kayıt</b>: kosinüs &gt; 0,95 olan ürün açıklamaları ya da destek talepleri.</li>
</ul>
<pre class="py">bilinen = M
for yeni in ["Biraz geç geldi", "Ambalaj yırtıktı", "Kurye kapıyı çarptı"]:
    en_yuksek = float((bilinen @ sahte_embedding(yeni)).max())
    print(f"{yeni:22} en yüksek benzerlik {en_yuksek:.2f}", "→ YENİ KONU" if en_yuksek &lt; 0.4 else "")</pre>
<div class="note"><b>Gerçek işte</b>Üretimdeki RAG sistemlerinde sorunların çoğu modelden değil getirmeden çıkar: yanlış parçalama, eksik metadata, yetki filtresi unutulmuş indeks, güncellenmeyen vektörler. Ekipler 50–200 soruluk bir altın setle recall@5 ve MRR'yi her değişiklikte (yeni model, yeni parça boyutu) ölçer; ancak getirme yeterince iyiyse üretim istemiyle uğraşır. Embedding modelini değiştirmek tüm belgeleri yeniden vektörleştirmek demektir; bu yüzden model adı ve sürümü vektörlerle birlikte saklanır.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Model seçimi ve maliyet</h3>
<p>Türkçe içerik için çok dilli modelleri kendi altın setinde karşılaştır; genel liderlik tabloları senin alanını temsil etmeyebilir. Boyut arttıkça depolama ve arama maliyeti artar; bazı modeller vektörü kısaltmaya (Matryoshka) izin verir. float32 yerine int8 ya da ikili niceleme (quantization) belleği 4–32 kat azaltır.</p>
<h3>Sorgu tarafı iyileştirmeleri</h3>
<p>Soru ile belge farklı dilde konuşur ("kargom nerede" ↔ "takip numarası SMS ile gönderilir"). Sorgu genişletme, LLM ile varsayımsal cevap üretip onu aramak (HyDE) ve çok sorgulu arama bu boşluğu kapatır; her biri ek gecikme ve maliyettir, altın setle ölçmeden ekleme.</p>
<h3>İndeks bakımı</h3>
<p>Belge güncellenince eski parçaları sil, yenileri ekle (upsert); belge kimliği + parça sırası anahtardır. Silinen belgelerin vektörlerinin kalması hem yanlış cevap hem gizlilik ihlalidir.</p>
</section>
`,
    ex: [
      {
        t: 'mc',
        stage: 'Isınma',
        q: 'Kosinüs benzerliği iki vektörün neyini karşılaştırır?',
        o: [
          'Uzunluklarını; uzun metinler her zaman daha benzer çıkar',
          'Yönlerini; uzunluktan bağımsız olarak aradaki açıyı ölçer',
          'Ortak kelime sayısını; vektörleri kelime listesine çevirir',
          'Bellekteki adreslerini; aynı nesne mi diye bakar'
        ],
        a: 1,
        why: 'cos = a·b / (‖a‖‖b‖): normlara bölündüğü için uzunluk etkisi kalkar, yalnız açı kalır. Vektörler önceden normalize edilmişse nokta çarpımı kosinüsle aynıdır.' },
      {
        t: 'mc',
        stage: 'Isınma',
        q: 'Müşteri "AM-4471 garantisi kaç yıl?" diye soruyor; saf vektör araması ürün sayfasını ilk 5\'te getiremiyor. En uygun iyileştirme hangisi?',
        o: [
          'Embedding boyutunu iki katına çıkarmak ve tüm vektörleri yeniden hesaplamak',
          'BM25 gibi anahtar kelime aramasını ekleyip sonuçları RRF ile birleştirmek',
          'Sıcaklık (temperature) değerini düşürüp modeli daha tutarlı yapmak',
          'Parça boyutunu tek kelimeye indirerek her kelimeyi ayrı vektörlemek'
        ],
        a: 1,
        why: 'Ürün kodları, kişi adları ve nadir terimler anahtar kelime aramasında güçlüdür; embedding\'ler anlama odaklanır. Hibrit arama ikisinin güçlü yanlarını birleştirir. Sıcaklık getirmeyi etkilemez.' },
      {
        t: 'mc',
        stage: 'Isınma',
        q: 'Çok kullanıcılı bir belge aramasında yetki filtresi ne zaman uygulanmalı?',
        o: [
          'Önce ilk k sonucu al, sonra yetkisiz olanları listeden at',
          'Sıralamadan önce: yalnız kullanıcının görebildiği belgeler arasında ara',
          'Filtreye gerek yok; LLM istemde yetkisiz belgeyi kullanmamasını söyler',
          'Yalnız LLM\'in ürettiği cevap metninde kişisel veri maskelenmeli'
        ],
        a: 1,
        why: 'Sonradan filtreleme k\'dan az sonuç döndürür ve bir hata anında yetkisiz içeriği isteme sızdırır. İstemdeki talimat bir güvenlik sınırı değildir; yetki veri katmanında uygulanır.' },
      {
        t: 'predict',
        stage: 'Kodu oku',
        q: 'Bu kod ne yazdırır?',
        code: 'import numpy as np\n\ndef cos(a, b):\n    return float(a @ b / (np.linalg.norm(a) * np.linalg.norm(b)))\n\nprint(round(cos(np.array([3, 4]), np.array([6, 8])), 2), round(cos(np.array([1, 0]), np.array([0, 5])), 2))\n',
        o: ['1.0 0.0', '2.0 0.0', '0.5 1.0', '1.0 5.0'],
        a: 0,
        why: '[6, 8] = 2·[3, 4]: aynı yön, kosinüs 1. [1, 0] ile [0, 5] dik: nokta çarpımı 0, kosinüs 0. Uzunluk (2 kat, 5 kat) sonucu etkilemez.' },
      {
        t: 'predict',
        stage: 'Kodu oku',
        q: 'kNN için skorlardan en iyi iki indeksi seçen kod ne yazdırır?',
        code: 'import numpy as np\nskor = np.array([0.2, 0.9, 0.5, 0.9, 0.1])\nprint(np.argsort(-skor, kind="stable")[:2].tolist(), np.argsort(skor, kind="stable")[:2].tolist())\n',
        o: ['[1, 3] [4, 0]', '[3, 1] [4, 0]', '[1, 3] [0, 4]', '[0.9, 0.9] [0.1, 0.2]'],
        a: 0,
        why: 'argsort değerleri değil indeksleri döndürür ve küçükten büyüğe sıralar. -skor ile büyükten küçüğe olur; stable sıralama eşit skorlarda (0.9) önce gelen indeksi (1) korur. Eksi işaretini unutmak en az benzerleri getirir.' },
      {
        t: 'predict',
        stage: 'Kodu oku',
        q: 'İki sıralamayı RRF ile birleştiren kod ne yazdırır?',
        code: 'def rrf(siralamalar, k=60):\n    skor = {}\n    for sira in siralamalar:\n        for r, d in enumerate(sira, 1):\n            skor[d] = skor.get(d, 0) + 1 / (k + r)\n    return sorted(skor, key=lambda d: -skor[d])\n\nprint(rrf([["a", "b", "c"], ["c", "a", "d"]]))\n',
        o: ['[\'a\', \'c\', \'b\', \'d\']', '[\'c\', \'a\', \'b\', \'d\']', '[\'a\', \'b\', \'c\', \'d\']', '[\'a\', \'c\']'],
        a: 0,
        why: 'a: 1/61 + 1/62, c: 1/63 + 1/61. İkisi de iki listede var ama a\'nın sıraları (1 ve 2) c\'ninkinden (3 ve 1) toplamda daha iyidir; tek listede olan b (2. sıra) d\'nin (3. sıra) önündedir.' },
      {
        t: 'order',
        stage: 'Kodu oku',
        q: '<p>Belge vektörlerini normalize edip sorguya en yakın belgeyi bulan programın satırlarını sırala.</p>',
        lines: [
          'import numpy as np',
          'M = np.array([[1.0, 1.0], [3.0, 0.0], [0.0, 2.0]])',
          'M = M / np.linalg.norm(M, axis=1, keepdims=True)',
          'q = np.array([4.0, 1.0])',
          'q = q / np.linalg.norm(q)',
          'skor = M @ q',
          'print(int(skor.argmax()), round(float(skor.max()), 3))'
        ],
        expect: '1 0.97\n',
        hint: 'Önce matris tanımlanıp normalize edilir; skor ancak hem M hem q normalize edildikten sonra hesaplanır.',
        why: 'keepdims=True satır normlarını (3, 1) biçiminde tutar ve bölme her satıra uygulanır. Normalize vektörlerde nokta çarpımı kosinüstür; [4, 1] en çok [1, 0] yönündeki ikinci belgeye benzer.' },
      {
        t: 'code',
        id: 'embedding-vektor-arama-1',
        stage: 'Rehberli',
        diff: 1,
        q: '<p><code>kosinus(a, b)</code>: iki listeyi ya da numpy dizisini alıp kosinüs benzerliğini <code>float</code> olarak döndürsün. Vektörlerden biri sıfır vektörse (normu 0) bölme hatası yerine <code>0.0</code> döndürsün. Boyutlar farklıysa <code>ValueError</code>.</p>',
        guide: ['Girdileri np.asarray(..., dtype=float) ile diziye çevir.', 'Şekiller farklıysa ValueError fırlat.', 'İki normu hesapla; biri 0 ise 0.0 döndür.', 'a @ b / (na * nb) sonucunu float\'a çevir.'],
        example: 'import numpy as np\nv = np.asarray([3, 4], dtype=float)\nprint(np.linalg.norm(v), v @ v)\n',
        start: 'import numpy as np\n\ndef kosinus(a, b):\n    a = np.asarray(a, dtype=float)\n    b = np.asarray(b, dtype=float)\n    # TODO: boyut kontrolü, sıfır vektör, formül\n    return a @ b\n',
        sol: 'import numpy as np\n\ndef kosinus(a, b):\n    a = np.asarray(a, dtype=float)\n    b = np.asarray(b, dtype=float)\n    if a.shape != b.shape:\n        raise ValueError("boyutlar farklı")\n    na, nb = np.linalg.norm(a), np.linalg.norm(b)\n    if na == 0 or nb == 0:\n        return 0.0\n    return float(a @ b / (na * nb))\n',
        tests: 'assert abs(kosinus([3, 4], [6, 8]) - 1.0) < 1e-9, "Aynı yöndeki vektörler 1.0 olmalı"\nassert abs(kosinus([1, 0], [0, 1])) < 1e-9, "Dik vektörler 0.0 olmalı"\nassert abs(kosinus([1, 2], [-1, -2]) + 1.0) < 1e-9, "Zıt yön -1.0 olmalı"\nassert kosinus([0, 0], [1, 2]) == 0.0, "Sıfır vektörde 0.0 dönmeli (boş metnin embedding\'i sıfır olabilir)"\nassert isinstance(kosinus([1, 1], [1, 0]), float), "Sonuç float olmalı"\ntry:\n    kosinus([1, 2, 3], [1, 2])\n    assert False, "Farklı boyutlarda ValueError bekleniyordu"\nexcept ValueError:\n    pass\n',
        hints: ['np.linalg.norm vektörün uzunluğunu verir.', 'if na == 0 or nb == 0: return 0.0'],
        why: 'Boş ya da yalnız noktalama içeren metinler sıfır vektöre dönüşebilir; NaN üretmek sıralamayı sessizce bozar. Boyut kontrolü ise farklı modellerle üretilmiş vektörlerin karıştırılmasını yakalar.' },
      {
        t: 'code',
        id: 'embedding-vektor-arama-2',
        stage: 'Rehberli',
        diff: 2,
        q: '<p><code>en_yakin_k(M, q, k)</code>: <code>M</code> (n × d) belge matrisi, <code>q</code> (d) sorgu vektörü. Satırları ve sorguyu normalize et (sıfır satırlar sıfır kalsın), kosinüs skorlarını hesapla ve en yüksek <code>k</code> sonucu <code>[(indeks, skor), ...]</code> listesi olarak döndür: skor 3 ondalığa yuvarlı, büyükten küçüğe; eşit skorda küçük indeks önce. <code>k &gt; n</code> ise n sonuç döndür.</p>',
        guide: [
          'Satır normlarını np.linalg.norm(M, axis=1, keepdims=True) ile al.',
          'Sıfır normları 1 ile değiştir (np.where) ki bölme hatası olmasın.',
          'skor = Mn @ qn',
          'np.argsort(-skor, kind="stable")[:k] ile sırayı bul ve listeyi kur.'
        ],
        example: 'import numpy as np\nA = np.array([[3.0, 4.0], [0.0, 0.0]])\nn = np.linalg.norm(A, axis=1, keepdims=True)\nprint(A / np.where(n == 0, 1, n))\n',
        start: 'import numpy as np\n\ndef en_yakin_k(M, q, k):\n    M = np.asarray(M, dtype=float)\n    q = np.asarray(q, dtype=float)\n    skor = M @ q   # TODO: önce normalize et\n    # TODO: sırala, ilk k\'yı (indeks, skor) olarak döndür\n    return []\n',
        sol: 'import numpy as np\n\ndef en_yakin_k(M, q, k):\n    M = np.asarray(M, dtype=float)\n    q = np.asarray(q, dtype=float)\n    n = np.linalg.norm(M, axis=1, keepdims=True)\n    Mn = M / np.where(n == 0, 1, n)\n    qn = q / (np.linalg.norm(q) or 1)\n    skor = Mn @ qn\n    sira = np.argsort(-skor, kind="stable")[:k]\n    return [(int(i), round(float(skor[i]), 3)) for i in sira]\n',
        tests: 'M = [[1, 0], [10, 10], [0, 3], [0, 0], [2, 0]]\nr = en_yakin_k(M, [1, 0], 3)\nassert r == [(0, 1.0), (4, 1.0), (1, 0.707)], f"Uzunluk etkisiz olmalı ve eşitlikte küçük indeks önce gelmeli: {r}"\nassert en_yakin_k(M, [0, 1], 10)[:2] == [(2, 1.0), (1, 0.707)], "k > n olunca n sonuç dönmeli"\nassert len(en_yakin_k(M, [0, 1], 10)) == 5\nassert (3, 0.0) in en_yakin_k(M, [1, 1], 5), "Sıfır satır NaN değil 0.0 skor almalı"\nassert all(isinstance(i, int) for i, _ in r), "İndeksler Python int olmalı"\n',
        hints: ['Normalize etmeden çarparsan [10, 10] uzun olduğu için öne geçer.', 'kind="stable" eşit skorlarda orijinal sırayı korur.', 'sira = np.argsort(-skor, kind="stable")[:k]'],
        why: 'Bu, FAISS\'in IndexFlatIP\'sinin yaptığı işin aynısıdır. Normalizasyonu bir kez, ekleme sırasında yapmak sorgu anında yalnızca bir matris çarpımı bırakır.' },
      {
        t: 'code',
        id: 'embedding-vektor-arama-3',
        stage: 'Rehberli',
        diff: 2,
        q: '<p>Getirme değerlendirmesi. <code>degerlendir(sonuclar, altin, k)</code>: <code>altin</code> {soru: doğru_belge_id}, <code>sonuclar</code> {soru: [sıralı belge id listesi]}. <code>{"recall": ..., "mrr": ...}</code> döndür, ikisi de 3 ondalığa yuvarlı:</p><ul><li>recall@k: doğru belgenin ilk k sonuçta olduğu soruların oranı.</li><li>MRR@k: doğru belge ilk k\'daysa 1/sıra (sıra 1\'den başlar), değilse 0; soruların ortalaması.</li></ul><p>Bir soru <code>sonuclar</code>\'da hiç yoksa boş liste say. <code>altin</code> boşsa iki metrik de 0.0.</p>',
        guide: ['Altın setteki her soru için sonuç listesini al (yoksa []), ilk k\'yı kes.', 'Doğru belge listede mi? İsabet sayacını artır.', 'Varsa 1 / (liste.index(dogru) + 1) ekle.', 'Toplamları soru sayısına böl, yuvarla.'],
        example: 'liste = ["b7", "b2", "b9"]\nhedef = "b2"\nprint(1 / (liste.index(hedef) + 1) if hedef in liste else 0)\n',
        start: 'def degerlendir(sonuclar, altin, k):\n    isabet = 0\n    rr = 0.0\n    for soru, dogru in altin.items():\n        ilk_k = sonuclar[soru]   # TODO: eksik soru ve k sınırı\n        # TODO: isabet ve karşılıklı sıra\n    return {"recall": 0.0, "mrr": 0.0}\n',
        sol: 'def degerlendir(sonuclar, altin, k):\n    if not altin:\n        return {"recall": 0.0, "mrr": 0.0}\n    isabet = 0\n    rr = 0.0\n    for soru, dogru in altin.items():\n        ilk_k = sonuclar.get(soru, [])[:k]\n        if dogru in ilk_k:\n            isabet += 1\n            rr += 1 / (ilk_k.index(dogru) + 1)\n    n = len(altin)\n    return {"recall": round(isabet / n, 3), "mrr": round(rr / n, 3)}\n',
        tests: 'altin = {"iade süresi": "iade-1", "kargo ücreti": "kargo-1", "garanti": "urun-4471", "fatura": "fatura-1"}\nsonuc = {"iade süresi": ["iade-1", "iade-2"], "kargo ücreti": ["iade-2", "kargo-1"], "garanti": ["kargo-2", "iade-1", "urun-4471"]}\nassert degerlendir(sonuc, altin, 3) == {"recall": 0.75, "mrr": 0.458}, f"k=3: 3/4 isabet; MRR (1 + 0.5 + 1/3 + 0)/4 = 0.458. Gelen {degerlendir(sonuc, altin, 3)}"\nassert degerlendir(sonuc, altin, 1) == {"recall": 0.25, "mrr": 0.25}, "k=1: yalnız ilk sonuç sayılır"\nassert degerlendir(sonuc, {}, 5) == {"recall": 0.0, "mrr": 0.0}, "Boş altın set 0.0 vermeli (ZeroDivisionError değil)"\n',
        hints: ['sonuclar.get(soru, [])[:k] eksik soruyu ve k sınırını birlikte çözer.', 'MRR için sıra = index + 1.'],
        why: 'recall@k "doğru parça LLM\'e ulaşıyor mu?", MRR "ne kadar üstte?" sorusunu cevaplar. Parça boyutu, model ya da hibrit ağırlığı değişince bu iki sayı karşılaştırılır.' },
      {
        t: 'code',
        id: 'embedding-vektor-arama-4',
        stage: 'Rehberli',
        diff: 2,
        q: '<p>Başlık bazlı parçalama. <code>baslik_parcala(metin)</code>: Markdown metnini satır satır oku. <code># </code> ile başlayan satır ana başlık, <code>## </code> ile başlayan alt başlıktır (yeni ana başlık alt başlığı sıfırlar). Başlık olmayan boş olmayan satırlar o anki bölümün içeriğidir. Her bölüm için <code>{"baslik": yol, "metin": içerik}</code> döndür: yol <code>"İade &gt; Süre"</code> (alt başlık yoksa yalnız <code>"İade"</code>), içerik satırları tek boşlukla birleşmiş. İçeriği olmayan bölümleri atla. Başlıktan önceki içerik <code>"Genel"</code> başlığına yazılsın.</p>',
        guide: [
          'ana = "Genel", alt = None, tampon = [] ile başla.',
          'Her başlık satırında önce tamponu (doluysa) parça olarak kaydet, sonra başlıkları güncelle.',
          '## kontrolünü # kontrolünden önce yap (## de # ile başlar).',
          'Döngü bitince son tamponu kaydetmeyi unutma.'
        ],
        example: 'satirlar = ["# A", "x", "## B", "y"]\nfor s in satirlar:\n    if s.startswith("## "):\n        print("alt:", s[3:])\n    elif s.startswith("# "):\n        print("ana:", s[2:])\n',
        start: 'def baslik_parcala(metin):\n    parcalar = []\n    ana, alt, tampon = "Genel", None, []\n\n    def kaydet():\n        # TODO: tampon doluysa {"baslik": ..., "metin": ...} ekle ve tamponu boşalt\n        pass\n\n    for satir in metin.splitlines():\n        satir = satir.strip()\n        # TODO: ## alt başlık, # ana başlık, içerik satırı\n    kaydet()\n    return parcalar\n',
        sol: 'def baslik_parcala(metin):\n    parcalar = []\n    ana, alt, tampon = "Genel", None, []\n\n    def kaydet():\n        if tampon:\n            yol = f"{ana} > {alt}" if alt else ana\n            parcalar.append({"baslik": yol, "metin": " ".join(tampon)})\n            tampon.clear()\n\n    for satir in metin.splitlines():\n        satir = satir.strip()\n        if satir.startswith("## "):\n            kaydet()\n            alt = satir[3:].strip()\n        elif satir.startswith("# "):\n            kaydet()\n            ana, alt = satir[2:].strip(), None\n        elif satir:\n            tampon.append(satir)\n    kaydet()\n    return parcalar\n',
        tests: 'md = """Anadolu Market yardım merkezi.\n# İade\n## Süre\nİade süresi 14 gündür.\nSüre teslimattan başlar.\n## Kargo\nHasarlı üründe kargo bizden.\n# Kargo\n\n500 TL üzeri ücretsiz.\n# Boş Bölüm\n## Yine Boş\n"""\nr = baslik_parcala(md)\nassert r[0] == {"baslik": "Genel", "metin": "Anadolu Market yardım merkezi."}, f"Başlıktan önceki içerik Genel olmalı: {r[:1]}"\nassert r[1] == {"baslik": "İade > Süre", "metin": "İade süresi 14 gündür. Süre teslimattan başlar."}, f"Alt başlık yolu ve birleştirme: {r[1:2]}"\nassert r[2]["baslik"] == "İade > Kargo"\nassert r[3] == {"baslik": "Kargo", "metin": "500 TL üzeri ücretsiz."}, "Yeni ana başlık alt başlığı sıfırlamalı; boş satır atlanmalı"\nassert len(r) == 4, f"İçeriksiz bölümler atlanmalı, gelen {len(r)} parça"\nassert baslik_parcala("") == []\n',
        hints: ['Kapanış (closure) içinden tampon.clear() kullan; tampon = [] yazarsan yerel yeni değişken olur.', '"## Süre".startswith("# ") False\'tur ama yine de önce ## kontrolü okunurluğu artırır.'],
        why: 'Başlık yolu parçaya bağlam katar: "Süre" tek başına anlamsızken "İade > Süre" hem embedding\'i hem de LLM\'e gösterilen kaynağı zenginleştirir. Yönetmelik ve SSS metinlerinde başlık bazlı parçalama genelde sabit boyuttan daha iyi recall verir.' },
      {
        t: 'code',
        id: 'embedding-vektor-arama-5',
        stage: 'Kendin yaz',
        diff: 2,
        q: '<p>Sahte embedding modelini yaz: <code>sahte_embedding(metin, boyut=256)</code>.</p><ol><li>Türkçe küçük harfe çevir (önce <code>I→ı</code>, <code>İ→i</code>, sonra <code>lower()</code>).</li><li><code>re.findall(r"\\w+", ...)</code> ile kelimeleri al; her kelimeyi <code>f" {kelime} "</code> biçiminde boşlukla sar.</li><li>Sarılmış kelimenin her 3 karakterlik dilimi için <code>zlib.crc32(dilim.encode()) % boyut</code> konumundaki sayacı 1 artır.</li><li>Vektörü L2 normuyla böl (sıfır vektörse olduğu gibi döndür). Dönüş: numpy dizisi.</li></ol>',
        start: 'import re\nimport zlib\nimport numpy as np\n\ndef sahte_embedding(metin, boyut=256):\n    pass\n',
        sol: 'import re\nimport zlib\nimport numpy as np\n\ndef tr_kucuk(s):\n    return s.replace("I", "ı").replace("İ", "i").lower()\n\ndef sahte_embedding(metin, boyut=256):\n    v = np.zeros(boyut)\n    for kelime in re.findall(r"\\w+", tr_kucuk(metin)):\n        k = f" {kelime} "\n        for i in range(len(k) - 2):\n            v[zlib.crc32(k[i:i + 3].encode()) % boyut] += 1\n    n = np.linalg.norm(v)\n    return v / n if n else v\n',
        tests: 'import numpy as np\nv = sahte_embedding("Soğuk geldi")\nassert isinstance(v, np.ndarray) and v.shape == (256,), "256 boyutlu numpy dizisi dönmeli"\nassert abs(np.linalg.norm(v) - 1) < 1e-9, "Vektör normalize olmalı"\nassert np.allclose(v, sahte_embedding("SOĞUK GELDİ!")), "Büyük/küçük harf ve noktalama sonucu değiştirmemeli"\nassert np.allclose(sahte_embedding("IRMAK"), sahte_embedding("ırmak")), "I → ı dönüşümü yapılmalı"\nassert not sahte_embedding("...").any(), "Kelimesiz metin sıfır vektör olmalı"\nyakin = float(sahte_embedding("çok geç geldi") @ sahte_embedding("Çok geç geldi"))\nuzak = float(sahte_embedding("kurye geç geldi") @ sahte_embedding("Porsiyon küçüktü"))\nassert abs(yakin - 1) < 1e-9 and uzak < 0.2, f"Yakın {yakin}, uzak {uzak}"\nassert round(float(sahte_embedding("kurye geç geldi") @ sahte_embedding("Çok geç geldi")), 3) == 0.77, "Dilimleme ve crc32 tam olarak tarif edildiği gibi olmalı"\nassert sahte_embedding("ab", boyut=8).shape == (8,)\n',
        hints: ['Sayaç için np.zeros(boyut); dilimler range(len(k) - 2) ile.', 'n = np.linalg.norm(v); return v / n if n else v'],
        why: 'Bu "hashing trick" sözlük tutmadan sabit boyutlu vektör üretir (scikit-learn\'deki HashingVectorizer\'ın karakter n-gram sürümü). Yazım hatalarına dayanıklıdır ama anlam bilmez; gerçek embedding modeli yerine geçmez, test ve prototip içindir.' },
      {
        t: 'code',
        id: 'embedding-vektor-arama-6',
        stage: 'Kendin yaz',
        diff: 3,
        q: '<p>BM25\'i saf Python ile yaz. <code>kelimeler(metin)</code>: Türkçe küçük harf + <code>re.findall(r"\\w+", ...)</code>. <code>BM25(belgeler, k1=1.5, b=0.75)</code> sınıfı ve <code>skorla(sorgu)</code> metodu: her belge için skor listesi döndürür.</p><p>idf(w) = ln((N − n + 0.5) / (n + 0.5) + 1), n: w\'yu içeren belge sayısı. Skor = Σ<sub>w ∈ sorgu</sub> idf(w) · f · (k1 + 1) / (f + k1 · (1 − b + b · dl / ortalama_dl)); f: w\'nun belgedeki sayısı, dl: belgenin kelime sayısı. Belgede olmayan terim 0 katkı verir.</p>',
        start: 'import math\nimport re\nfrom collections import Counter\n\ndef kelimeler(metin):\n    pass\n\nclass BM25:\n    def __init__(self, belgeler, k1=1.5, b=0.75):\n        pass\n\n    def skorla(self, sorgu):\n        return []\n',
        sol: 'import math\nimport re\nfrom collections import Counter\n\ndef kelimeler(metin):\n    return re.findall(r"\\w+", metin.replace("I", "ı").replace("İ", "i").lower())\n\nclass BM25:\n    def __init__(self, belgeler, k1=1.5, b=0.75):\n        self.k1, self.b = k1, b\n        self.tf = [Counter(kelimeler(d)) for d in belgeler]\n        self.uzunluk = [sum(t.values()) for t in self.tf]\n        self.ort = sum(self.uzunluk) / len(belgeler) if belgeler else 0\n        self.df = Counter(w for t in self.tf for w in t)\n        self.N = len(belgeler)\n\n    def idf(self, w):\n        n = self.df.get(w, 0)\n        return math.log((self.N - n + 0.5) / (n + 0.5) + 1)\n\n    def skorla(self, sorgu):\n        q = kelimeler(sorgu)\n        sonuc = []\n        for tf, dl in zip(self.tf, self.uzunluk):\n            s = 0.0\n            for w in q:\n                f = tf.get(w, 0)\n                if f:\n                    s += self.idf(w) * f * (self.k1 + 1) / (f + self.k1 * (1 - self.b + self.b * dl / self.ort))\n            sonuc.append(s)\n        return sonuc\n',
        tests: 'D = ["iade süresi 14 gündür", "kargo ücreti 500 TL üzeri siparişte ücretsizdir", "İADE kargo ücreti müşteriye aittir iade kodu ile gönderilir", "AM-4471 kablosuz kulaklık stokta"]\nb = BM25(D)\ns = [round(x, 4) for x in b.skorla("iade kargo ücreti")]\nassert s == [0.8271, 1.3153, 2.0247, 0.0], f"Beklenen [0.8271, 1.3153, 2.0247, 0.0], gelen {s}"\nassert [round(x, 4) for x in b.skorla("AM-4471")] == [0.0, 0.0, 0.0, 2.6461], "Ürün kodu yalnız kendi belgesini bulmalı"\nassert b.skorla("olmayan kelime") == [0.0, 0.0, 0.0, 0.0], "Eşleşme yoksa tüm skorlar 0"\nassert kelimeler("İADE Kodu: AM-4471") == ["iade", "kodu", "am", "4471"]\nb2 = BM25(D, k1=1.2, b=0.0)\nassert round(b2.skorla("iade")[2], 4) == 0.9531, "b=0 iken belge uzunluğu etkisiz olmalı"\n',
        hints: [
          '__init__\'te her belgenin Counter\'ını, uzunluğunu, ortalama uzunluğu ve belge sıklığını (df) hesapla.',
          'df: Counter(w for tf in self.tf for w in tf) — her belgede bir kez sayılır.',
          'Sorgudaki her kelime için f = tf.get(w, 0); f varsa formülü uygula.'
        ],
        why: 'k1 terim sıklığının etkisini doyurur (aynı kelimenin 10 kez geçmesi 10 kat puan getirmez), b uzun belgeleri normalleştirir. Elasticsearch ve OpenSearch\'ün varsayılan sıralaması BM25\'tir; hibrit aramanın anahtar kelime ayağı genelde budur.' },
      {
        t: 'code',
        id: 'embedding-vektor-arama-7',
        stage: 'Kendin yaz',
        diff: 2,
        q: '<p><code>rrf(siralamalar, k=60, n=None)</code>: her biri belge id\'lerinden oluşan sıralı listelerin listesini alır. r. sıradaki (1\'den başlar) belge o listeden 1/(k + r) puan alır; puanlar toplanır. Puana göre azalan, eşitlikte id\'ye göre artan sırada id listesi döndür; <code>n</code> verilmişse ilk n tanesini. Aynı liste içinde tekrar eden id yalnızca ilk geçtiği sırayla sayılsın.</p>',
        start: 'def rrf(siralamalar, k=60, n=None):\n    return []\n',
        sol: 'def rrf(siralamalar, k=60, n=None):\n    skor = {}\n    for sira in siralamalar:\n        gorulen = set()\n        r = 0\n        for d in sira:\n            if d in gorulen:\n                continue\n            gorulen.add(d)\n            r += 1\n            skor[d] = skor.get(d, 0.0) + 1 / (k + r)\n    sonuc = sorted(skor, key=lambda d: (-skor[d], d))\n    return sonuc if n is None else sonuc[:n]\n',
        tests: 'assert rrf([["a", "b", "c"], ["c", "a", "d"]]) == ["a", "c", "b", "d"]\nassert rrf([["x", "y"], ["y", "x"]]) == ["x", "y"], "Eşit puanda id sırası (x < y)"\nassert rrf([["a", "b", "c"], ["c", "a", "d"]], n=2) == ["a", "c"], "n ilk n sonucu sınırlamalı"\nassert rrf([["a", "a", "b"], ["b"]]) == ["b", "a"], "Liste içi tekrar sayılmamalı: b 2. ve 1. sırada, a yalnız 1. sırada"\nassert rrf([]) == [] and rrf([[], []]) == []\nassert rrf([["p", "q"]], k=0) == ["p", "q"]\n',
        hints: ['Her liste için ayrı bir "görülen" kümesi ve sıra sayacı tut.', 'sorted(skor, key=lambda d: (-skor[d], d))'],
        why: 'RRF ölçek bağımsızdır: BM25 skoru 12, kosinüs 0,8 olsa da sıraları birleştirir; ayar gerektiren tek parametre k\'dır. Elasticsearch, OpenSearch ve birçok vektör veritabanı hibrit aramada RRF sunar.' },
      {
        t: 'code',
        id: 'embedding-vektor-arama-8',
        stage: 'Kendin yaz',
        diff: 3,
        q: '<p>Cümle bazlı örtüşmeli parçalama. <code>cumle_parcala(metin, max_karakter, ortusme=1)</code>:</p><ul><li>Metni <code>re.split(r"(?&lt;=[.!?])\\s+", metin.strip())</code> ile cümlelere böl (boşları at).</li><li>Cümleleri sırayla bir parçaya ekle; eklenince parçanın uzunluğu (cümleler tek boşlukla birleşmiş hâli) <code>max_karakter</code>\'i aşacaksa parçayı kapat ve yeni parçayı önceki parçanın son <code>ortusme</code> cümlesiyle başlat.</li><li>Tek başına sınırı aşan cümle kendi parçası olur (bölünmez).</li><li>Yeni parça yalnızca örtüşme cümlelerinden oluşacaksa üretme; dönüş: parça metinlerinin listesi.</li></ul>',
        start: 'import re\n\ndef cumle_parcala(metin, max_karakter, ortusme=1):\n    return [metin]\n',
        sol: 'import re\n\ndef cumle_parcala(metin, max_karakter, ortusme=1):\n    cumleler = [c for c in re.split(r"(?<=[.!?])\\s+", metin.strip()) if c]\n    parcalar = []\n    simdiki = []\n    yeni_sayisi = 0\n    for c in cumleler:\n        aday = " ".join(simdiki + [c])\n        if simdiki and yeni_sayisi and len(aday) > max_karakter:\n            parcalar.append(" ".join(simdiki))\n            simdiki = simdiki[-ortusme:] if ortusme else []\n            yeni_sayisi = 0\n            if simdiki and len(" ".join(simdiki + [c])) > max_karakter:\n                simdiki = []\n        simdiki.append(c)\n        yeni_sayisi += 1\n    if simdiki and yeni_sayisi:\n        parcalar.append(" ".join(simdiki))\n    return parcalar\n',
        tests: 'm = "İade 14 gündür. Kargo bizden. Kod SMS ile gelir. Hediye kartı iade edilemez."\nr = cumle_parcala(m, 35, 1)\nr0 = cumle_parcala(m, 35, 0)\nassert r0 == ["İade 14 gündür. Kargo bizden.", "Kod SMS ile gelir.", "Hediye kartı iade edilemez."], f"Örtüşmesiz: {r0}"\nr1 = cumle_parcala(m, 50, 1)\nassert r1 == ["İade 14 gündür. Kargo bizden. Kod SMS ile gelir.", "Kod SMS ile gelir. Hediye kartı iade edilemez."], f"Örtüşmeli: {r1}"\nassert all(len(p) <= 50 for p in r1)\nuzun = "Bu cümle sınırdan çok daha uzun bir cümledir. Kısa."\nassert cumle_parcala(uzun, 20, 1) == ["Bu cümle sınırdan çok daha uzun bir cümledir.", "Kısa."], f"Uzun cümle bölünmemeli: {cumle_parcala(uzun, 20, 1)}"\nassert cumle_parcala("", 100) == []\nassert cumle_parcala("Tek cümle.", 100) == ["Tek cümle."]\n',
        hints: [
          'Parçadaki cümleleri bir listede tut; aday = " ".join(liste + [c]) ile uzunluğu dene.',
          'Kapatırken yeni listeyi önceki listenin son ortusme cümlesiyle başlat; örtüşme + yeni cümle sınırı aşıyorsa örtüşmeyi bırak.',
          'Yalnız örtüşmeden oluşan parçayı engellemek için parçaya eklenen yeni cümle sayısını say.'
        ],
        why: 'Cümle sınırına saygı, embedding\'in yarım cümleleri temsil etmesini önler; örtüşme ise iki parçanın sınırına düşen bilgiyi (ör. "Kod SMS ile gelir") her iki parçada da tutar. Gerçek sistemlerde karakter yerine token sayılır ve Türkçe kısaltmalar (Dr., vb.) için daha akıllı cümle bölücüler kullanılır.' },
      {
        t: 'code',
        id: 'embedding-vektor-arama-9',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 2,
        q: '<p><b>Hatayı bul ve düzelt.</b> <code>benzerleri_bul(M, q, k)</code> en benzer k belgenin indekslerini (en benzer önce) döndürmeli. Destek ekibi iki sorun bildirdi: 1) sonuçlarda hep en alakasız kayıtlar çıkıyor, 2) uzun yorumlar kısa ama birebir aynı anlamdaki yorumların önüne geçiyor. Kosinüs benzerliği kullanılmalı; eşitlikte küçük indeks önce gelmeli.</p>',
        start: 'import numpy as np\n\ndef benzerleri_bul(M, q, k):\n    M = np.asarray(M, dtype=float)\n    q = np.asarray(q, dtype=float)\n    skor = M @ q\n    return np.argsort(skor)[:k].tolist()\n',
        sol: 'import numpy as np\n\ndef benzerleri_bul(M, q, k):\n    M = np.asarray(M, dtype=float)\n    q = np.asarray(q, dtype=float)\n    n = np.linalg.norm(M, axis=1)\n    n[n == 0] = 1\n    skor = (M / n[:, None]) @ (q / (np.linalg.norm(q) or 1))\n    return np.argsort(-skor, kind="stable")[:k].tolist()\n',
        tests: 'M = [[1, 0], [0, 1], [8, 6], [2, 0]]\nassert benzerleri_bul(M, [1, 0], 2) == [0, 3], f"[1,0] ve [2,0] aynı yönde; uzun [8,6] öne geçmemeli. Gelen {benzerleri_bul(M, [1, 0], 2)}"\nassert benzerleri_bul(M, [0, 1], 1) == [1], "En benzer ilk sırada olmalı (argsort küçükten büyüğe sıralar)"\nassert benzerleri_bul(M, [1, 1], 4)[0] == 2, "[8,6] kosinüste [1,1]\'e en yakın olandır"\nassert benzerleri_bul([[0, 0], [1, 0]], [1, 0], 2) == [1, 0], "Sıfır satır hata vermemeli"\n',
        hints: ['İki hata var: sıralama yönü ve normalizasyon.', 'np.argsort(-skor, kind="stable") ve satırları normlarına bölmek.'],
        why: 'argsort küçükten büyüğe sıralar; eksi işareti unutulursa en az benzerler gelir. Normalize edilmemiş nokta çarpımı uzun (çok kelimeli) metinlere haksız avantaj verir. Bu iki hata gerçek projelerde en sık görülen vektör arama hatalarıdır.' },
      {
        t: 'code',
        id: 'embedding-vektor-arama-10',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 2,
        q: '<p><b>Hatayı bul ve düzelt.</b> Anadolu Market\'in iç arama aracında <code>yetkili_ara(belgeler, skorlar, kullanici, k)</code> her kullanıcıya yalnız <code>sahip</code> alanı kendi adı ya da <code>"herkes"</code> olan belgeleri, skora göre azalan sırada en fazla k tane döndürmeli (id listesi). Kullanıcılar "bazen hiç sonuç gelmiyor" diye şikâyet ediyor. Ayrıca bir yönetici <code>sahip</code> değeri <code>None</code> olan eski belgelerin herkese görünmesinin güvenlik açığı olduğunu fark etti: sahibi bilinmeyen belge kimseye gösterilmemeli.</p>',
        start: 'def yetkili_ara(belgeler, skorlar, kullanici, k):\n    sira = sorted(range(len(belgeler)), key=lambda i: -skorlar[i])[:k]\n    return [belgeler[i]["id"] for i in sira if belgeler[i]["sahip"] in (kullanici, "herkes", None)]\n',
        sol: 'def yetkili_ara(belgeler, skorlar, kullanici, k):\n    izinli = [i for i, b in enumerate(belgeler) if b.get("sahip") in (kullanici, "herkes")]\n    sira = sorted(izinli, key=lambda i: -skorlar[i])[:k]\n    return [belgeler[i]["id"] for i in sira]\n',
        tests: 'B = [{"id": "not-ali", "sahip": "ali"}, {"id": "not-ayse", "sahip": "ayse"}, {"id": "eski", "sahip": None}, {"id": "iade-1", "sahip": "herkes"}, {"id": "kargo-1", "sahip": "herkes"}]\nS = [0.95, 0.94, 0.93, 0.50, 0.40]\nassert yetkili_ara(B, S, "ayse", 2) == ["not-ayse", "iade-1"], f"Önce filtrele sonra ilk k\'yı al: {yetkili_ara(B, S, \'ayse\', 2)}"\nassert yetkili_ara(B, S, "veli", 2) == ["iade-1", "kargo-1"], "Yetkisiz yüksek skorlu belgeler k hakkını tüketmemeli"\nassert "eski" not in yetkili_ara(B, S, "ali", 5), "Sahibi None olan belge gösterilmemeli (varsayılan: reddet)"\nassert yetkili_ara(B, S, "ali", 5) == ["not-ali", "iade-1", "kargo-1"]\n',
        hints: ['Sorun sıralama: önce k ile kesip sonra filtrelemek (post-filtering).', 'Önce izinli indeksleri bul, sonra sırala ve kes; izin listesinden None\'ı çıkar.'],
        why: 'Post-filtering\'de yetkisiz ama yüksek skorlu belgeler ilk k\'yı doldurur ve kullanıcı boş sonuç görür. Güvenlikte varsayılan "reddet" olmalıdır: sahibi bilinmeyen belge herkese açık sayılmaz.' },
      {
        t: 'code',
        id: 'embedding-vektor-arama-11',
        stage: 'Meydan okuma',
        diff: 3,
        needs: ['numpy'],
        q: '<p>Lezzet Kurye <b>benzer yorum</b> aracı (gerçek <code>lk_ratings</code> verisi). <code>sahte_embedding</code> hazır. <code>YorumArama(kayitlar)</code> sınıfını yaz:</p><ul><li>Kurucu: <code>comment</code> alanı boş olmayan kayıtları yoruma göre grupla; yorumları alfabetik sırala (<code>sorted</code>); her yorum için kayıt sayısını ve ortalama <code>food_score</code>\'u (2 ondalık) tut; yorumların embedding matrisini bir kez hesapla.</li><li><code>ara(sorgu, k=3)</code>: skor &gt; 0 olan en benzer k yorumu <code>(yorum, adet, ort_puan)</code> demetleri olarak döndür (skor azalan, eşitlikte alfabetik sıra korunur).</li><li><code>puan_tahmini(sorgu, k=3)</code>: en benzer k yorumun ortalama puanlarının benzerlik ağırlıklı ortalaması (2 ondalık); hiç benzer yorum yoksa (ağırlık toplamı 0) <code>None</code>.</li></ul>',
        start: 'import re\nimport zlib\nimport numpy as np\n\ndef tr_kucuk(s):\n    return s.replace("I", "ı").replace("İ", "i").lower()\n\ndef sahte_embedding(metin, boyut=256):\n    v = np.zeros(boyut)\n    for kelime in re.findall(r"\\w+", tr_kucuk(metin)):\n        k = f" {kelime} "\n        for i in range(len(k) - 2):\n            v[zlib.crc32(k[i:i + 3].encode()) % boyut] += 1\n    n = np.linalg.norm(v)\n    return v / n if n else v\n\nimport veri\nfrom collections import defaultdict\n\nclass YorumArama:\n    def __init__(self, kayitlar):\n        pass\n\n    def ara(self, sorgu, k=3):\n        return []\n\n    def puan_tahmini(self, sorgu, k=3):\n        return None\n\nkayitlar = veri.kayitlar("lezzet_kurye", "lk_ratings")\n',
        sol: 'import re\nimport zlib\nimport numpy as np\n\ndef tr_kucuk(s):\n    return s.replace("I", "ı").replace("İ", "i").lower()\n\ndef sahte_embedding(metin, boyut=256):\n    v = np.zeros(boyut)\n    for kelime in re.findall(r"\\w+", tr_kucuk(metin)):\n        k = f" {kelime} "\n        for i in range(len(k) - 2):\n            v[zlib.crc32(k[i:i + 3].encode()) % boyut] += 1\n    n = np.linalg.norm(v)\n    return v / n if n else v\n\nimport veri\nfrom collections import defaultdict\n\nclass YorumArama:\n    def __init__(self, kayitlar):\n        puanlar = defaultdict(list)\n        for k in kayitlar:\n            if k["comment"]:\n                puanlar[k["comment"]].append(k["food_score"])\n        self.yorumlar = sorted(puanlar)\n        self.adet = [len(puanlar[y]) for y in self.yorumlar]\n        self.ort = [round(sum(puanlar[y]) / len(puanlar[y]), 2) for y in self.yorumlar]\n        self.M = np.array([sahte_embedding(y) for y in self.yorumlar])\n\n    def _sira(self, sorgu, k):\n        s = self.M @ sahte_embedding(sorgu)\n        sira = [int(i) for i in np.argsort(-s, kind="stable")[:k] if s[i] > 0]\n        return s, sira\n\n    def ara(self, sorgu, k=3):\n        _, sira = self._sira(sorgu, k)\n        return [(self.yorumlar[i], self.adet[i], self.ort[i]) for i in sira]\n\n    def puan_tahmini(self, sorgu, k=3):\n        s, sira = self._sira(sorgu, k)\n        w = sum(float(s[i]) for i in sira)\n        if w <= 0:\n            return None\n        return round(sum(float(s[i]) * self.ort[i] for i in sira) / w, 2)\n\nkayitlar = veri.kayitlar("lezzet_kurye", "lk_ratings")\n',
        tests: 'y = YorumArama(kayitlar)\nassert len(y.yorumlar) == 13, f"13 farklı yorum olmalı (boşlar hariç), gelen {len(y.yorumlar)}"\nr = y.ara("kurye geç geldi")\nassert r == [("Çok geç geldi", 64, 2.69), ("Biraz geç geldi ama lezzetli", 589, 4.36), ("Soğuk geldi", 54, 2.69)], f"Gelen {r}"\nassert y.ara("porsiyon az", 1) == [("Porsiyon küçüktü", 249, 3.33)]\nassert y.ara("xyz qqq") == [], "Hiç ortak dilim yoksa boş liste"\nassert y.puan_tahmini("kurye geç geldi") == 3.21, f"Ağırlıklı ortalama 3.21 olmalı, gelen {y.puan_tahmini(\'kurye geç geldi\')}"\nassert y.puan_tahmini("çok lezzetli") == 4.79\nassert y.puan_tahmini("xyz qqq") is None\n',
        hints: ['defaultdict(list) ile yorum → puan listesi; None yorumları atla.', 'Skorları bir kez hesaplayan yardımcı bir metot hem ara hem puan_tahmini işini görür.', 'Ağırlıklı ortalama: Σ(s_i · ort_i) / Σ s_i'],
        why: 'Yeni gelen bir yorumun puanını, benzer geçmiş yorumların puanından tahmin etmek "embedding + kNN regresyonu"dur. Aynı yapı destek talebi yönlendirme ve öncelik tahmininde de kullanılır. Sahte modelde "geldi" ortak dilimi "Soğuk geldi"yi üçüncü sıraya taşıdı; gerçek modelle karşılaştırmak için altın set kur.' },
      {
        t: 'code',
        id: 'embedding-vektor-arama-12',
        stage: 'Meydan okuma',
        diff: 3,
        q: '<p>Çeşitlilik için yeniden sıralama: <b>MMR</b> (Maximal Marginal Relevance). <code>mmr(sorgu_v, M, k, lam=0.7)</code>: <code>M</code> satırları normalize embedding\'ler, <code>sorgu_v</code> normalize sorgu. Seçilenler listesi boş başlar; her adımda henüz seçilmemiş adaylar içinden <code>lam · alaka(i) − (1 − lam) · max_j∈seçilen cos(i, j)</code> puanı en yüksek olanı seç (seçilen yoksa ikinci terim 0; eşitlikte küçük indeks). k seçilene ya da aday bitene kadar devam et; seçilen indeks listesini döndür.</p>',
        start: 'import numpy as np\n\ndef mmr(sorgu_v, M, k, lam=0.7):\n    alaka = M @ sorgu_v\n    return np.argsort(-alaka)[:k].tolist()\n',
        sol: 'import numpy as np\n\ndef mmr(sorgu_v, M, k, lam=0.7):\n    alaka = M @ sorgu_v\n    secilen = []\n    adaylar = list(range(len(M)))\n    while adaylar and len(secilen) < k:\n        def puan(i):\n            cesit = max((float(M[i] @ M[j]) for j in secilen), default=0.0)\n            return lam * float(alaka[i]) - (1 - lam) * cesit\n        en_iyi = max(adaylar, key=lambda i: (puan(i), -i))\n        secilen.append(en_iyi)\n        adaylar.remove(en_iyi)\n    return secilen\n',
        tests: 'import numpy as np\nM = np.array([[1.0, 0.0], [0.99, 0.141], [0.0, 1.0], [0.6, 0.8]])\nM = M / np.linalg.norm(M, axis=1, keepdims=True)\nq = np.array([1.0, 0.2]); q = q / np.linalg.norm(q)\nassert mmr(q, M, 1) == [1], "İlk seçim yalnız alakaya bakar"\nassert mmr(q, M, 3, lam=1.0) == [1, 0, 3], "lam=1 saf alaka sıralamasıdır"\nr = mmr(q, M, 3, lam=0.5)\nassert r == [1, 2, 0], f"lam=0.5\'te ikinci sırada neredeyse kopya olan 0 yerine farklı yöndeki 2 seçilmeli: {r}"\nassert mmr(q, M, 10) and len(mmr(q, M, 10)) == 4, "Aday bitince durmalı"\nassert mmr(q, M, 0) == []\n',
        hints: ['Seçilen ve aday listelerini tut; her turda adaylar üzerinde max(..., key=...) kullan.', 'Çeşitlilik cezası: max((M[i] @ M[j] for j in secilen), default=0.0)', 'Eşitlik için key=lambda i: (puan(i), -i)'],
        why: 'Arama sonuçlarının ilk üçü aynı şikâyetin üç kopyasıysa LLM\'e giden bağlam boşa harcanır. MMR alaka ile yeniliği dengeler; lam=1 saf alaka, lam küçüldükçe çeşitlilik artar. LangChain gibi kütüphanelerdeki "mmr" arama türü bu formülü kullanır.' },
      {
        t: 'code',
        id: 'embedding-vektor-arama-13',
        stage: 'Mini proje',
        diff: 3,
        q: '<p><b>Anadolu Market yardım merkezi için hibrit arama + değerlendirme.</b> <code>sahte_embedding</code>, <code>BM25</code> ve <code>BELGELER</code> / <code>ALTIN</code> hazır. Şunları yaz:</p><ul><li><code>rrf(siralamalar, k=60)</code>: puana göre azalan, eşitlikte id artan id listesi.</li><li><code>HibritArama(belgeler)</code>: her belge <code>{"id", "sahip", "metin"}</code>; embedding matrisini kurucuda bir kez hesapla.</li><li><code>ara(sorgu, kullanici, k=3)</code>: <b>önce</b> yetki filtresi (sahip <code>"herkes"</code> ya da kullanici). İzinli belgeler üzerinde (a) BM25 skoruna göre (b) kosinüs skoruna göre iki sıralama kur; her ikisinde de skoru 0 ya da altı olanları at, eşitlikte id artan. RRF ile birleştir, ilk k id\'yi döndür. İzinli belge yoksa <code>[]</code>.</li><li><code>degerlendir(altin, k=3)</code>: <code>altin</code> (soru, kullanıcı, doğru_id) demetleri; <code>{"recall@k": ..., "mrr": ...}</code> (3 ondalık).</li></ul>',
        start: 'import re\nimport zlib\nimport numpy as np\n\ndef tr_kucuk(s):\n    return s.replace("I", "ı").replace("İ", "i").lower()\n\ndef sahte_embedding(metin, boyut=256):\n    v = np.zeros(boyut)\n    for kelime in re.findall(r"\\w+", tr_kucuk(metin)):\n        k = f" {kelime} "\n        for i in range(len(k) - 2):\n            v[zlib.crc32(k[i:i + 3].encode()) % boyut] += 1\n    n = np.linalg.norm(v)\n    return v / n if n else v\n\nimport math\nfrom collections import Counter\n\ndef kelimeler(metin):\n    return re.findall(r"\\w+", metin.replace("I", "ı").replace("İ", "i").lower())\n\nclass BM25:\n    def __init__(self, belgeler, k1=1.5, b=0.75):\n        self.k1, self.b = k1, b\n        self.tf = [Counter(kelimeler(d)) for d in belgeler]\n        self.uzunluk = [sum(t.values()) for t in self.tf]\n        self.ort = sum(self.uzunluk) / len(belgeler) if belgeler else 0\n        self.df = Counter(w for t in self.tf for w in t)\n        self.N = len(belgeler)\n\n    def idf(self, w):\n        n = self.df.get(w, 0)\n        return math.log((self.N - n + 0.5) / (n + 0.5) + 1)\n\n    def skorla(self, sorgu):\n        q = kelimeler(sorgu)\n        sonuc = []\n        for tf, dl in zip(self.tf, self.uzunluk):\n            s = 0.0\n            for w in q:\n                f = tf.get(w, 0)\n                if f:\n                    s += self.idf(w) * f * (self.k1 + 1) / (f + self.k1 * (1 - self.b + self.b * dl / self.ort))\n            sonuc.append(s)\n        return sonuc\n\nBELGELER = [\n    {"id": "iade-1", "sahip": "herkes", "metin": "İade süresi teslimattan itibaren 14 gündür. İade kodu ile kargoya ver."},\n    {"id": "iade-2", "sahip": "herkes", "metin": "Hasarlı ürün iadesinde kargo ücretini Anadolu Market öder."},\n    {"id": "kargo-1", "sahip": "herkes", "metin": "500 TL üzeri siparişlerde kargo ücretsizdir. Altında kargo ücreti 49,90 TL."},\n    {"id": "kargo-2", "sahip": "herkes", "metin": "Siparişler 1-3 iş günü içinde kargoya verilir; takip numarası SMS ile gelir."},\n    {"id": "urun-4471", "sahip": "herkes", "metin": "AM-4471 kablosuz kulaklık: 30 saat pil, Bluetooth 5.3, 2 yıl garanti."},\n    {"id": "not-ali", "sahip": "ali", "metin": "Ali\'nin iade talebi onaylandı; iade kodu ALI-9921."},\n    {"id": "not-ayse", "sahip": "ayse", "metin": "Ayşe\'nin kargo adresi güncellendi; teslimat Kadıköy şubesine."},\n]\nALTIN = [\n    ("iade kaç gün içinde yapılır", "herkes", "iade-1"),\n    ("kargo ücretsiz mi", "herkes", "kargo-1"),\n    ("AM-4471 garanti", "herkes", "urun-4471"),\n    ("iade kodum ne", "ali", "not-ali"),\n    ("kargom ne zaman gelir", "ayse", "kargo-2"),\n    ("hasarlı ürün geldi kargo parası", "herkes", "iade-2"),\n]\n\n\ndef rrf(siralamalar, k=60):\n    return []\n\nclass HibritArama:\n    def __init__(self, belgeler):\n        self.belgeler = belgeler\n\n    def ara(self, sorgu, kullanici, k=3):\n        return []\n\n    def degerlendir(self, altin, k=3):\n        return {"recall@k": 0.0, "mrr": 0.0}\n',
        sol: 'import re\nimport zlib\nimport numpy as np\n\ndef tr_kucuk(s):\n    return s.replace("I", "ı").replace("İ", "i").lower()\n\ndef sahte_embedding(metin, boyut=256):\n    v = np.zeros(boyut)\n    for kelime in re.findall(r"\\w+", tr_kucuk(metin)):\n        k = f" {kelime} "\n        for i in range(len(k) - 2):\n            v[zlib.crc32(k[i:i + 3].encode()) % boyut] += 1\n    n = np.linalg.norm(v)\n    return v / n if n else v\n\nimport math\nfrom collections import Counter\n\ndef kelimeler(metin):\n    return re.findall(r"\\w+", metin.replace("I", "ı").replace("İ", "i").lower())\n\nclass BM25:\n    def __init__(self, belgeler, k1=1.5, b=0.75):\n        self.k1, self.b = k1, b\n        self.tf = [Counter(kelimeler(d)) for d in belgeler]\n        self.uzunluk = [sum(t.values()) for t in self.tf]\n        self.ort = sum(self.uzunluk) / len(belgeler) if belgeler else 0\n        self.df = Counter(w for t in self.tf for w in t)\n        self.N = len(belgeler)\n\n    def idf(self, w):\n        n = self.df.get(w, 0)\n        return math.log((self.N - n + 0.5) / (n + 0.5) + 1)\n\n    def skorla(self, sorgu):\n        q = kelimeler(sorgu)\n        sonuc = []\n        for tf, dl in zip(self.tf, self.uzunluk):\n            s = 0.0\n            for w in q:\n                f = tf.get(w, 0)\n                if f:\n                    s += self.idf(w) * f * (self.k1 + 1) / (f + self.k1 * (1 - self.b + self.b * dl / self.ort))\n            sonuc.append(s)\n        return sonuc\n\nBELGELER = [\n    {"id": "iade-1", "sahip": "herkes", "metin": "İade süresi teslimattan itibaren 14 gündür. İade kodu ile kargoya ver."},\n    {"id": "iade-2", "sahip": "herkes", "metin": "Hasarlı ürün iadesinde kargo ücretini Anadolu Market öder."},\n    {"id": "kargo-1", "sahip": "herkes", "metin": "500 TL üzeri siparişlerde kargo ücretsizdir. Altında kargo ücreti 49,90 TL."},\n    {"id": "kargo-2", "sahip": "herkes", "metin": "Siparişler 1-3 iş günü içinde kargoya verilir; takip numarası SMS ile gelir."},\n    {"id": "urun-4471", "sahip": "herkes", "metin": "AM-4471 kablosuz kulaklık: 30 saat pil, Bluetooth 5.3, 2 yıl garanti."},\n    {"id": "not-ali", "sahip": "ali", "metin": "Ali\'nin iade talebi onaylandı; iade kodu ALI-9921."},\n    {"id": "not-ayse", "sahip": "ayse", "metin": "Ayşe\'nin kargo adresi güncellendi; teslimat Kadıköy şubesine."},\n]\nALTIN = [\n    ("iade kaç gün içinde yapılır", "herkes", "iade-1"),\n    ("kargo ücretsiz mi", "herkes", "kargo-1"),\n    ("AM-4471 garanti", "herkes", "urun-4471"),\n    ("iade kodum ne", "ali", "not-ali"),\n    ("kargom ne zaman gelir", "ayse", "kargo-2"),\n    ("hasarlı ürün geldi kargo parası", "herkes", "iade-2"),\n]\n\n\ndef rrf(siralamalar, k=60):\n    skor = {}\n    for sira in siralamalar:\n        for r, d in enumerate(sira, 1):\n            skor[d] = skor.get(d, 0.0) + 1 / (k + r)\n    return sorted(skor, key=lambda d: (-skor[d], d))\n\nclass HibritArama:\n    def __init__(self, belgeler):\n        self.belgeler = belgeler\n        self.M = np.array([sahte_embedding(b["metin"]) for b in belgeler])\n\n    def ara(self, sorgu, kullanici, k=3):\n        izinli = [i for i, b in enumerate(self.belgeler) if b["sahip"] in ("herkes", kullanici)]\n        if not izinli:\n            return []\n        alt = [self.belgeler[i]["metin"] for i in izinli]\n        bm = BM25(alt).skorla(sorgu)\n        vs = self.M[izinli] @ sahte_embedding(sorgu)\n        ids = [self.belgeler[i]["id"] for i in izinli]\n        s1 = [ids[j] for j in sorted(range(len(ids)), key=lambda j: (-bm[j], ids[j])) if bm[j] > 0]\n        s2 = [ids[j] for j in sorted(range(len(ids)), key=lambda j: (-vs[j], ids[j])) if vs[j] > 0]\n        return rrf([s1, s2])[:k]\n\n    def degerlendir(self, altin, k=3):\n        recall, rr = [], []\n        for soru, kullanici, dogru in altin:\n            sonuc = self.ara(soru, kullanici, k)\n            recall.append(1.0 if dogru in sonuc else 0.0)\n            rr.append(1 / (sonuc.index(dogru) + 1) if dogru in sonuc else 0.0)\n        n = len(altin)\n        return {"recall@k": round(sum(recall) / n, 3), "mrr": round(sum(rr) / n, 3)}\n',
        tests: 'h = HibritArama(BELGELER)\nassert h.ara("iade kaç gün içinde yapılır", "herkes") == ["iade-1", "kargo-2", "iade-2"], f"Gelen {h.ara(\'iade kaç gün içinde yapılır\', \'herkes\')}"\nassert h.ara("AM-4471 garanti", "herkes")[0] == "urun-4471", "Ürün kodu BM25 sayesinde ilk sırada olmalı"\nr_ayse = h.ara("iade kodu", "ayse", 5)\nassert "not-ali" not in r_ayse and r_ayse == ["iade-1", "iade-2", "not-ayse", "urun-4471", "kargo-2"], f"Ayşe Ali\'nin notunu görmemeli: {r_ayse}"\nassert h.ara("iade kodu", "ali", 5)[0] == "not-ali", "Ali kendi notunu ilk sırada görmeli"\nassert HibritArama([{"id": "x", "sahip": "ali", "metin": "gizli"}]).ara("gizli", "veli") == [], "İzinli belge yoksa boş liste"\nm3 = h.degerlendir(ALTIN, 3)\nassert m3 == {"recall@k": 1.0, "mrr": 0.917}, f"k=3 metrikleri: {m3}"\nassert h.degerlendir(ALTIN, 1) == {"recall@k": 0.833, "mrr": 0.833}, f"k=1 metrikleri: {h.degerlendir(ALTIN, 1)}"\n',
        hints: [
          'ara içinde önce izinli indeks listesini çıkar; BM25\'i yalnız izinli metinlerle kur (idf yetkisiz belgelerden etkilenmesin).',
          'İki sıralama: sorted(range(n), key=lambda j: (-skor[j], ids[j])) ve skor > 0 filtresi.',
          'MRR: doğru id sonuçtaysa 1 / (index + 1), değilse 0.'
        ],
        why: 'Üretimdeki RAG getirme katmanının özü budur: yetki filtresi → anahtar kelime + vektör → RRF → (isteğe bağlı rerank) → değerlendirme. "iade kodum ne" sorusunda Ali\'nin notu ikinci sırada kaldı; MRR bunu sayıyla gösterir. Bir sonraki adım bu metriği, gerçek embedding modeli ve parça boyutu değişiklikleriyle karşılaştırmaktır.' }
    ],
    faq: [
      {
        q: 'Embedding ile TF-IDF arasındaki fark nedir?',
        a: 'TF-IDF kelime sayımına dayanır; ortak kelime yoksa benzerlik sıfırdır. Embedding modelleri büyük metin koleksiyonlarında eğitildiği için "buz gibiydi" ile "soğuk geldi" arasındaki anlam yakınlığını yakalar. Buna karşılık nadir terimler ve kodlarda TF-IDF/BM25 daha güvenilirdir; bu yüzden hibrit arama yaygındır.' },
      {
        q: 'Vektör veritabanına ne zaman ihtiyacım olur?',
        a: 'Birkaç yüz bin vektöre kadar numpy ile kaba kuvvet arama ya da mevcut PostgreSQL üzerinde pgvector genelde yeterlidir. Milyonlarca vektör, düşük gecikme, sık güncelleme ve metadata filtreli arama birlikte gerektiğinde özel bir vektör veritabanı (Qdrant, Weaviate, Milvus vb.) düşünülür.' },
      {
        q: 'Hangi parça boyutunu seçmeliyim?',
        a: 'Belge türüne bağlı. Yardım merkezi ve yönetmeliklerde başlık bazlı parçalama, uzun raporlarda cümle bazlı + örtüşme iyi başlangıçlardır. Kararı altın soru setinde recall@k ve MRR ölçerek ver.' },
      {
        q: 'Embedding\'ler kişisel veri sayılır mı?',
        a: 'Kişisel veri içeren metinden üretilen vektörler, metnin kendisi kadar hassas kabul edilmelidir; bazı durumlarda vektörden metne dair bilgi geri çıkarılabilir. Erişim kontrolü, silme talebinde vektörün de silinmesi ve sağlayıcıya gönderim kuralları metinle aynı titizlikte uygulanmalıdır.' }
    ],
    mistakes: [
      {
        bad: 'sira = np.argsort(M @ q)[:5]',
        good: 'sira = np.argsort(-(M @ q), kind="stable")[:5]',
        why: 'argsort küçükten büyüğe sıralar; eksi işareti olmadan en az benzer 5 belge gelir.' },
      {
        bad: 'skor = M @ q   # M normalize edilmemiş',
        good: 'M = M / np.linalg.norm(M, axis=1, keepdims=True)\nskor = M @ (q / np.linalg.norm(q))',
        why: 'Normalize edilmemiş nokta çarpımı uzun vektörlere (uzun metinlere) haksız avantaj verir.' },
      {
        bad: 'ilk = ara(sorgu, k=5)\nsonuc = [d for d in ilk if d["sahip"] == kullanici]',
        good: 'izinli = [d for d in belgeler if d["sahip"] in (kullanici, "herkes")]\nsonuc = ara(sorgu, izinli, k=5)',
        why: 'Sonradan filtreleme k\'dan az sonuç verir ve yetki hatasında içerik sızar; filtre aramadan önce uygulanır.' },
      {
        bad: 'toplam = 0.5 * bm25_skor + 0.5 * kosinus',
        good: 'birlesik = rrf([bm25_sirasi, vektor_sirasi])',
        why: 'BM25 skorları sınırsız, kosinüs -1..1 aralığındadır; ham skorları toplamak bir tarafı ezer. RRF ya da normalize edilmiş skorlar kullan.' }
    ]
  }
);
})(window);
