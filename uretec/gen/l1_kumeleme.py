import sys
sys.path.insert(0, '/tmp/claude-0/-home-claude/6c066959-3fcb-54bb-bdf1-c8ae148dfc4c/scratchpad/gen')
from emit import py, code, write

body = f'''
<h2>Etiket yokken veriden anlam çıkarmak</h2>
<p>Anadolu Market\'in pazarlama ekibi 40 bin müşteriye aynı e-postayı gönderiyor ve dönüş oranı düşük. Elinde "bu müşteri sadık, bu müşteri kaçmak üzere" diye bir etiket yok; yalnızca her müşterinin ne zaman, ne sıklıkla ve ne kadar alışveriş yaptığı var. <code>ml-giris</code> ve <code>ml-regresyon-siniflandirma</code> derslerinde gördüğün denetimli öğrenmede (supervised learning) modele doğru cevabı (y) verirdin. Bu derste doğru cevap yok: algoritma benzer satırları kendisi gruplayacak. Buna <b>denetimsiz öğrenme</b> (unsupervised learning) denir.</p>
<p>Denetimsiz öğrenmenin üç ana işi bu derste:</p>
<ul>
<li><b>Kümeleme</b> (clustering): benzer müşterileri, ürünleri, şubeleri gruplara ayırmak.</li>
<li><b>Boyut indirgeme</b> (dimensionality reduction): 20 sütunu bilginin çoğunu koruyarak 2-3 sütuna sıkıştırmak (PCA).</li>
<li><b>Anomali tespiti</b> (anomaly detection): Ilgaz Bank\'ta "bu işlem diğerlerine hiç benzemiyor" diyebilmek.</li>
</ul>

<h2>k-means nasıl çalışır?</h2>
<p>k-means en çok kullanılan kümeleme algoritmasıdır. Sen küme sayısını (k) verirsin; algoritma her kümenin bir merkezini (centroid) bulur ve her noktayı en yakın merkeze bağlar.</p>
<div class="steps-list"><ol>
<li>k tane başlangıç merkezi seç (scikit-learn akıllı bir yöntem kullanır: k-means++).</li>
<li>Her noktayı Öklid uzaklığına göre en yakın merkeze ata.</li>
<li>Her kümenin merkezini, o kümedeki noktaların ortalamasına taşı.</li>
<li>Atamalar değişmeyene kadar 2. ve 3. adımı tekrarla.</li>
</ol></div>
<p>Alıştırma için gerçek müşteri verisi yerine <code>make_blobs</code> ile sentetik veri üreteceğiz. <code>random_state</code> verdiğin sürece her çalıştırmada aynı veri gelir.</p>
{py(r"""
import numpy as np
from sklearn.datasets import make_blobs
from sklearn.cluster import KMeans

X, _ = make_blobs(n_samples=300, centers=3, cluster_std=0.8, random_state=42)
print("veri:", X.shape)

km = KMeans(n_clusters=3, n_init=10, random_state=0)
etiketler = km.fit_predict(X)

print("küme boyutları:", sorted(np.bincount(etiketler).tolist()))
print("merkezler:")
print(np.round(km.cluster_centers_, 2))
print("inertia:", round(km.inertia_, 1))
""")}
<p><code>make_blobs</code> ikinci değer olarak "gerçek" küme numaralarını da döndürür; gerçek hayatta bu bilgi olmadığı için <code>_</code> ile yok sayıyoruz. <code>n_init=10</code>, algoritmayı 10 farklı başlangıçla çalıştırıp en iyisini seçer; kütüphane sürümleri arasında varsayılan değişebildiği için açıkça yazmak iyi alışkanlıktır.</p>
<p><b>Inertia</b>, her noktanın kendi merkezine uzaklığının karelerinin toplamıdır (within-cluster sum of squares). Küçük olması kümelerin sıkı olduğunu gösterir.</p>
<div class="warn"><b>Küme numarası bir isim değildir</b>k-means\'in "0" dediği küme bir sonraki çalıştırmada "2" olabilir. Raporlarda küme numarasına değil, kümenin profiline (ortalama harcama, sıklık) bakarak isim ver.</div>

<h2>Ölçekleme neden şart?</h2>
<p>k-means uzaklık ile çalışır. Bir sütun yaş (20-70), diğeri aylık gelir (20.000-30.000 TL) ise gelirdeki 1.000 TL\'lik fark, yaştaki 40 yıllık farkı ezer. Algoritma aslında anlamsız olan gelir gürültüsüne göre küme kurar. Çözüm, <code>ml-pipeline-degerlendirme</code> dersinde gördüğün <code>StandardScaler</code>: her sütunu ortalaması 0, standart sapması 1 olacak şekilde dönüştürür.</p>
{py(r"""
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

# yaş iki net grup (25 ve 60 civarı), gelir ise yapısız gürültü
yas = np.array([25, 25, 26, 25, 24, 26, 27, 26, 24, 23, 59, 60, 57, 60, 58, 59, 59, 60, 61, 62])
gelir = np.array([20283, 21243, 26706, 26472, 26154, 23837, 29972, 29808, 26855, 26505,
                  26884, 23889, 21351, 27215, 25254, 23102, 24858, 28895, 29340, 23578])
X = np.column_stack([yas, gelir])

ham = KMeans(n_clusters=2, n_init=10, random_state=0).fit_predict(X)
olcekli = KMeans(n_clusters=2, n_init=10, random_state=0).fit_predict(StandardScaler().fit_transform(X))

def gencler_ayni_kumede_mi(etiket):
    return len(set(etiket[:10])) == 1 and etiket[0] != etiket[10]

print("ölçeksiz yaşa göre ayırdı mı?", gencler_ayni_kumede_mi(ham))
print("ölçekli yaşa göre ayırdı mı?", gencler_ayni_kumede_mi(olcekli))
""")}
<div class="tip"><b>Pipeline ile unutma</b><code>make_pipeline(StandardScaler(), KMeans(...))</code> yazarsan ölçekleme her zaman kümelemeden önce ve aynı ayarlarla yapılır. Yeni müşteriyi kümeye atarken (<code>predict</code>) de aynı ölçekleyici kullanılır.</div>

<h2>Kaç küme? Dirsek yöntemi ve silhouette</h2>
<p>k-means k\'yi senden ister; ama doğru k\'yi bilmiyorsun. İki yaygın araç var:</p>
<ul>
<li><b>Dirsek yöntemi</b> (elbow method): k\'yi 1\'den 8\'e kadar dene, inertia\'yı çiz. Inertia k arttıkça hep azalır (k = nokta sayısı olursa 0 olur), bu yüzden en küçüğü seçilmez. Eğrinin keskin düşüşten yataya döndüğü "dirsek" noktası aranır.</li>
<li><b>Silhouette skoru</b>: her nokta için "kendi kümeme ne kadar yakınım, en yakın komşu kümeye ne kadar uzağım" ölçüsü. -1 ile 1 arasıdır; 1\'e yakın iyi ayrılmış kümeler demektir. En yüksek ortalama skoru veren k iyi bir adaydır.</li>
</ul>
{py(r"""
from sklearn.datasets import make_blobs
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score

X, _ = make_blobs(n_samples=400, centers=4, cluster_std=0.9, random_state=7)

print(" k   inertia  silhouette")
for k in range(2, 8):
    km = KMeans(n_clusters=k, n_init=10, random_state=0).fit(X)
    s = silhouette_score(X, km.labels_)
    print(f"{k:>2} {km.inertia_:>9.1f}  {s:.3f}")
""")}
<p>Çıktıda inertia\'nın k=4\'e kadar hızla düşüp sonra yavaşladığını, silhouette\'in de k=4\'te zirve yaptığını görürsün. Gerçek veride bu kadar net olmaz; o zaman iş tarafının kullanabileceği küme sayısı da (pazarlama 3-6 segmenti yönetebilir, 15\'i yönetemez) karara girer.</p>

<h2>Başka kümeleme algoritmaları</h2>
<div class="tbl-wrap"><table>
<tr><th>Algoritma</th><th>k ister mi?</th><th>Küme şekli</th><th>Gürültü/aykırı</th><th>Ne zaman?</th></tr>
<tr><td>KMeans</td><td>Evet</td><td>Yuvarlak, benzer boyutlu</td><td>Her noktayı bir kümeye atar</td><td>Büyük veri, hızlı segmentasyon</td></tr>
<tr><td>AgglomerativeClustering (hiyerarşik)</td><td>Evet ya da mesafe eşiği</td><td>Bağlantı türüne göre esnek</td><td>Atar</td><td>Küçük-orta veri, ağaç (dendrogram) yorumu</td></tr>
<tr><td>DBSCAN</td><td>Hayır (eps, min_samples)</td><td>Her şekil, yoğunluk temelli</td><td>Gürültüyü <code>-1</code> etiketiyle ayırır</td><td>Coğrafi noktalar, düzensiz şekiller</td></tr>
<tr><td>GaussianMixture</td><td>Evet</td><td>Elips, olasılıklı üyelik</td><td>Atar (olasılıkla)</td><td>"Bu müşteri %70 A, %30 B" demek gerektiğinde</td></tr>
</table></div>
<p><b>Hiyerarşik kümeleme</b> (hierarchical clustering) her noktayı ayrı küme sayarak başlar ve en yakın iki kümeyi adım adım birleştirir; ortaya bir soy ağacı çıkar. <b>DBSCAN</b> ise "etrafında <code>eps</code> yarıçapında en az <code>min_samples</code> komşusu olan nokta yoğun bölgededir" der; yoğun bölgeleri büyütür, hiçbir yoğun bölgeye girmeyen noktaları gürültü sayar.</p>
{py(r"""
import numpy as np
from sklearn.cluster import AgglomerativeClustering, DBSCAN

# Anadolu Lojistik: teslimat noktalarının (x, y) km koordinatları
noktalar = np.array([[1, 1], [1.2, 0.8], [0.9, 1.1], [5, 5], [5.1, 4.8], [4.9, 5.2], [12, 1]])

hiy = AgglomerativeClustering(n_clusters=2).fit_predict(noktalar)
print("hiyerarşik:", hiy.tolist())

db = DBSCAN(eps=0.6, min_samples=2).fit_predict(noktalar)
print("DBSCAN   :", db.tolist())
print("gürültü sayısı:", int((db == -1).sum()))
""")}
<p>Hiyerarşik yöntem 7. noktayı da bir kümeye zorla koydu; DBSCAN ise onu <code>-1</code> (gürültü) olarak işaretledi. Uzak bir teslimat adresi ayrı planlanmalıdır; bu bilgi DBSCAN\'de bedavaya gelir.</p>

<h2>PCA: boyut indirgeme</h2>
<p>Bir müşteri için 10-20 özellik olabilir ve bunların çoğu birbiriyle ilişkilidir (sipariş sayısı ile toplam harcama birlikte artar). <b>Temel bileşen analizi</b> (Principal Component Analysis, PCA) veriyi, en çok değişkenliği (varyansı) taşıyan yeni eksenlere döndürür. İlk bileşen en fazla varyansı, ikincisi kalanın en fazlasını taşır.</p>
{py(r"""
import numpy as np
from sklearn.datasets import make_blobs
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler

X, _ = make_blobs(n_samples=200, n_features=6, centers=3, random_state=1)
X = StandardScaler().fit_transform(X)

pca = PCA().fit(X)
oran = pca.explained_variance_ratio_
print("bileşen başına açıklanan varyans:", np.round(oran, 3))
print("kümülatif:", np.round(np.cumsum(oran), 3))

X2 = PCA(n_components=2).fit_transform(X)
print("6 sütun -> 2 sütun:", X.shape, "->", X2.shape)
""")}
<p><code>explained_variance_ratio_</code> her bileşenin toplam varyansın ne kadarını taşıdığını söyler. Kümülatif toplam %90\'ı geçtiği yerde durmak yaygın bir kuraldır. Kümeleri görmek için ise 2 bileşen alıp <code>gorsellestirme</code> dersindeki gibi <code>plt.scatter(X2[:, 0], X2[:, 1], c=etiketler)</code> ile çizersin. PCA\'dan önce ölçekleme yine şarttır; yoksa büyük birimli sütun ilk bileşeni tek başına ele geçirir.</p>
<div class="note"><b>PCA bileşeni bir iş kavramı değildir</b>"1. bileşen" gelir ya da yaş değil, tüm sütunların ağırlıklı bir karışımıdır. <code>pca.components_</code> içindeki ağırlıklara bakarak "bu bileşen çoğunlukla sıklık ve harcamadan oluşuyor" gibi yorum yapabilirsin, ama raporda asıl sütun adlarıyla konuş.</div>

<h2>Müşteri segmentasyonu: RFM + k-means</h2>
<p><code>proje-ileri</code> projesinde RFM\'yi çeyreklik skorlarla kurmuştun. Burada aynı üç ölçütü k-means\'e veriyoruz: <b>Recency</b> (son alışverişten bu yana gün), <b>Frequency</b> (sipariş sayısı), <b>Monetary</b> (toplam harcama). Harcama çok çarpık dağılır (birkaç müşteri çok harcar); <code>np.log1p</code> ile sıkıştırıp sonra ölçeklemek kümeleri dengeler.</p>
{py(r"""
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

# her satır bir müşteri: recency (gün), frequency (sipariş), monetary (TL)
rfm = np.array([
    [5, 24, 18500], [8, 30, 22000], [3, 18, 15400],      # sık ve çok harcayan
    [40, 6, 2100], [35, 5, 1800], [50, 7, 2600],          # orta
    [180, 1, 250], [210, 2, 400], [160, 1, 180],          # uzun süredir yok
])
X = rfm.astype(float)
X[:, 2] = np.log1p(X[:, 2])
X = StandardScaler().fit_transform(X)

km = KMeans(n_clusters=3, n_init=10, random_state=0).fit(X)
for k in range(3):
    grup = rfm[km.labels_ == k]
    r, f, m = grup.mean(axis=0)
    print(f"{len(grup)} müşteri | recency {r:.0f} gün | {f:.1f} sipariş | {m:,.0f} TL")
""")}

<h2>Kümeleri iş diline çevirmek</h2>
<p>Model "küme 0, küme 1, küme 2" der; yönetici "kime ne kampanyası yapalım" diye sorar. Köprüyü sen kurarsın:</p>
<div class="steps-list"><ol>
<li><b>Profil çıkar:</b> her küme için özelliklerin ortalamasını (ya da medyanını) ve küme büyüklüğünü hesapla; genel ortalamayla karşılaştır.</li>
<li><b>İsim ver:</b> "Şampiyonlar" (düşük recency, yüksek sıklık ve harcama), "Kaybedilmek üzere" (yüksek recency), "Gelişmekte olanlar" gibi.</li>
<li><b>Aksiyon bağla:</b> şampiyonlara sadakat programı, kaybedilmek üzere olanlara geri kazanma indirimi.</li>
<li><b>Ölç:</b> kampanya sonrası segment bazında dönüş oranını takip et; segmentler zamanla değişir, model düzenli yeniden kurulur.</li>
</ol></div>
<div class="tbl-wrap"><table>
<tr><th>Küme profili</th><th>İş adı</th><th>Önerilen aksiyon</th></tr>
<tr><td>Recency düşük, frequency ve monetary yüksek</td><td>Şampiyonlar</td><td>Erken erişim, sadakat puanı; indirimle marjı yakma</td></tr>
<tr><td>Recency orta, frequency orta</td><td>Potansiyel sadıklar</td><td>Çapraz satış önerileri</td></tr>
<tr><td>Recency yüksek, geçmişte iyi harcamış</td><td>Kaybedilmek üzere</td><td>Kişisel geri kazanma kuponu</td></tr>
<tr><td>Recency yüksek, frequency 1</td><td>Tek seferlikler</td><td>Düşük maliyetli hatırlatma</td></tr>
</table></div>

<h2>Anomali tespiti: z-skoru ve IsolationForest</h2>
<p>Ilgaz Bank\'ta bir müşterinin işlemleri genelde 200-800 TL arasındayken birden 45.000 TL\'lik bir işlem görünürse incelenmelidir. En basit yöntem <b>z-skoru</b>: değerin ortalamadan kaç standart sapma uzakta olduğu, <code>z = (x - ortalama) / std</code>. |z| > 3 genelde aykırı sayılır. Tek değişkende hızlıdır ama aykırı değer ortalamayı ve std\'yi kendisi de büyüttüğü için küçük örneklerde eşiği düşürmen gerekebilir.</p>
<p>Birden çok özellik birlikte önemliyse (tutar, saat, işlem sıklığı) <b>IsolationForest</b> kullanılır: rastgele bölmelerle her noktayı yalnız bırakmaya çalışır; aykırı noktalar çok az bölmeyle yalnız kalır. <code>predict</code> normal için <code>1</code>, anomali için <code>-1</code> döndürür.</p>
{py(r"""
import numpy as np
from sklearn.ensemble import IsolationForest

tutarlar = np.array([320, 450, 280, 610, 390, 505, 45000, 350, 470, 300, 520, 12500])

z = (tutarlar - tutarlar.mean()) / tutarlar.std()
print("z-skoru > 2 olanlar:", tutarlar[np.abs(z) > 2].tolist())

# saat bilgisini de ekleyelim: gece 3'teki işlem de şüpheli
saat = np.array([10, 14, 12, 18, 11, 16, 3, 13, 15, 9, 17, 2])
X = np.column_stack([np.log1p(tutarlar), saat])
iso = IsolationForest(contamination=0.15, random_state=0).fit(X)
tahmin = iso.predict(X)
print("IsolationForest anomaliler:", tutarlar[tahmin == -1].tolist())
""")}
<div class="warn"><b>Anomali = suç değil</b>Anomali modeli "bu farklı" der, "bu dolandırıcılık" demez. Maaş ikramiyesi de farklıdır. Çıktı her zaman bir inceleme kuyruğuna gider; otomatik hesap kapatma gibi kararlar insan onayı ve itiraz yolu olmadan verilmez.</div>

<div class="note"><b>Gerçek işte</b>Bir e-ticaret şirketinde segmentasyon projesi genelde şöyle akar: veri ekibi RFM ve birkaç davranış özelliği (kategori çeşitliliği, iade oranı) çıkarır, k-means ile 4-6 küme dener, silhouette ve iş ekibinin yorumuyla k\'yi seçer, kümelere isim verip CRM sistemine her gece "segment" sütunu yazar. Asıl başarı ölçütü silhouette değil, kampanyanın segment bazında getirdiği ek satıştır (A/B testi ile ölçülür). Bankalarda anomali skorları ise kural motorlarıyla (ör. "yeni cihaz + yurt dışı + yüksek tutar") birlikte kullanılır.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>k-means\'in varsayımları</h3>
<p>k-means kümeleri yuvarlak ve benzer büyüklükte varsayar; hilal ya da halka şeklindeki kümeleri bölemez, çok farklı yoğunluklarda da büyük kümeyi ikiye bölüp küçükleri birleştirebilir. Bu durumda DBSCAN, HDBSCAN (scikit-learn 1.3+) ya da GaussianMixture dene. Kategorik sütunlar (şehir, kanal) için Öklid uzaklığı anlamsızdır; one-hot kodlama ile eklenebilir ama k-prototypes gibi karma uzaklık kullanan yöntemler daha uygundur.</p>
<h3>Büyük veri ve kararlılık</h3>
<p>Milyonlarca satırda <code>MiniBatchKMeans</code> veriyi parça parça işler. Kümelerin güvenilir olup olmadığını görmek için farklı <code>random_state</code> ya da veri alt örnekleriyle kümelemeyi tekrarla; segmentler her seferinde başka çıkıyorsa veride gerçek bir yapı zayıftır. Yüksek boyutta (50+ sütun) uzaklıklar birbirine benzer hâle gelir ("boyut laneti"); kümelemeden önce PCA ile 10-20 bileşene inmek hem hızlandırır hem gürültüyü azaltır.</p>
<h3>Değerlendirme</h3>
<p>Silhouette dışında <code>davies_bouldin_score</code> (küçük iyi) ve <code>calinski_harabasz_score</code> (büyük iyi) de var. Ama hiçbir iç ölçüt "bu segmentler işe yarar mı" sorusunu cevaplamaz; onu kampanya deneyi cevaplar.</p>
</section>
'''

ex = []
# ---------- Isınma
ex.append(dict(t='mc', stage='Isınma', q='Müşteri verisinde <code>yas</code> (20-70) ve <code>bakiye</code> (0-500.000 TL) sütunları var. k-means\'ten önce neden ölçekleme yaparsın?',
    o=['k-means yalnızca 0 ile 1 arasındaki sayılarla çalışabildiği için', 'Uzaklık hesabında büyük birimli bakiye sütunu yaşı ezmesin diye', 'Küme sayısını otomatik bulması için', 'Ölçekleme inertia\'yı her zaman sıfıra indirdiği için'],
    a=1, why='k-means Öklid uzaklığı kullanır; bakiyedeki küçük farklar bile yaşın tüm aralığından büyüktür. StandardScaler her sütunu aynı ölçeğe getirir. k-means her sayıyla çalışır ve k\'yi kendisi bulmaz.'))
ex.append(dict(t='mc', stage='Isınma', q='Bir arkadaşın "k=2\'den k=10\'a kadar denedim, inertia en küçük k=10\'da çıktı, o hâlde k=10 en iyisi" diyor. Sorun ne?',
    o=['Inertia küme sayısı arttıkça hep azalır; en küçüğü seçmek her zaman en büyük k\'yi seçmek olur', 'Inertia büyüdükçe kümeler sıkılaşır; bu yüzden tablodaki en büyük inertia değeri seçilmeliydi', 'Inertia yalnızca DBSCAN için anlamlıdır', 'Sorun yok; en küçük inertia her zaman en iyi küme sayısını gösteren doğru ölçüttür'],
    a=0, why='Her yeni merkez noktaları merkeze yaklaştırır; k = nokta sayısı olduğunda inertia 0 olur. Bu yüzden dirsek noktasına ya da silhouette skoruna bakılır.'))
ex.append(dict(t='mc', stage='Isınma', q='Hangi ifade DBSCAN için doğrudur?',
    o=['Küme sayısını k-means gibi parametre olarak ister ve her noktayı bir kümeye atar', 'Yalnızca yuvarlak kümeleri bulur', 'Hiçbir yoğun bölgeye girmeyen noktalara -1 (gürültü) etiketi verir', 'Yoğunluğa baktığı için sütunların ölçeğine ve birimine hiç duyarlı değildir'],
    a=2, why='DBSCAN eps ve min_samples ile yoğunluk tanımlar, k istemez, her şekli bulabilir ve gürültüyü -1 ile ayırır. Uzaklık kullandığı için ölçeklemeye duyarlıdır.'))

# ---------- Kodu oku
ex.append(dict(t='predict', stage='Kodu oku', q='Bu kod ne yazdırır? (Merkezler küçükten büyüğe sıralanıyor.)',
    code='import numpy as np\nfrom sklearn.cluster import KMeans\n\nX = np.array([[1], [2], [3], [10], [11], [12]])\nkm = KMeans(n_clusters=2, n_init=10, random_state=0).fit(X)\nprint(sorted(km.cluster_centers_.ravel().tolist()))\n',
    o=['[1.0, 12.0]', '[2.0, 11.0]', '[6.5, 6.5]', '[3.0, 10.0]'], a=1,
    why='İki doğal grup var: {1,2,3} ve {10,11,12}. Merkez, kümedeki noktaların ortalamasıdır: 2.0 ve 11.0. Merkez uçtaki nokta ya da sınırdaki nokta değildir.'))
ex.append(dict(t='predict', stage='Kodu oku', q='Bu kod ne yazdırır?',
    code='import numpy as np\n\ntutar = np.array([100, 100, 100, 100, 100, 100, 100, 100, 100, 1000])\nz = (tutar - tutar.mean()) / tutar.std()\nprint(int((np.abs(z) > 2).sum()), round(float(z[-1]), 1))\n',
    o=['1 3.0', '0 3.0', '1 9.0', '10 3.0'], a=0,
    why='Ortalama 190, std 270; 1000 için z = 810 / 270 = 3.0. Yalnızca o değer |z| > 2 koşulunu sağlar. Aykırı değer std\'yi de büyüttüğü için z beklenenden küçük çıkar.'))
ex.append(dict(t='predict', stage='Kodu oku', q='İkinci sütun birincinin tam iki katı. Bu kod ne yazdırır?',
    code='import numpy as np\nfrom sklearn.decomposition import PCA\n\nx = np.array([1.0, 2.0, 3.0, 4.0, 5.0])\nX = np.column_stack([x, 2 * x])\npca = PCA(n_components=2).fit(X)\nprint(round(float(pca.explained_variance_ratio_[0]), 2))\n',
    o=['0.5', '0.67', '1.0', '2.0'], a=2,
    why='Noktaların hepsi tek bir doğru üzerinde; tüm varyans o doğrunun yönündedir. İlk bileşen varyansın %100\'ünü açıklar, ikinci bileşene hiçbir şey kalmaz. Oran 1\'i geçemez.'))
ex.append(dict(t='order', stage='Kodu oku', q='<p>Veriyi ölçekleyip k-means ile 3 kümeye ayıran ve küme boyutlarını sıralı yazdıran programın satırlarını sırala.</p>',
    lines=['import numpy as np', 'from sklearn.datasets import make_blobs', 'from sklearn.cluster import KMeans', 'from sklearn.preprocessing import StandardScaler',
           'X, _ = make_blobs(n_samples=90, centers=3, random_state=3)', 'X_olcekli = StandardScaler().fit_transform(X)',
           'etiket = KMeans(n_clusters=3, n_init=10, random_state=0).fit_predict(X_olcekli)', 'print(sorted(np.bincount(etiket).tolist()))'],
    expect='[30, 30, 30]\n', hint='Önce veri üretilir, sonra ölçeklenir; kümeleme ölçekli veri üzerinde yapılır.',
    why='İçe aktarmalar, veri üretimi, ölçekleme, kümeleme ve rapor. make_blobs örnekleri merkezlere eşit dağıttığı için iyi ayrılmış veride her küme 30 nokta alır.'))

# ---------- Rehberli
ex.append(dict(t='code', id='ml-kumeleme-1', stage='Rehberli', diff=1,
    q='<p>k-means\'in 3. adımını elle yaz. <code>merkezleri_hesapla(X, etiketler, k)</code> fonksiyonu, numpy dizisi <code>X</code> (n×d) ve küme etiketleri (0..k-1) alıp k×d boyutlu merkez dizisini döndürsün: her satır o kümedeki noktaların ortalaması.</p>',
    guide=['k satır, X.shape[1] sütunluk sıfır dizisi oluştur.', 'Her küme numarası j için X[etiketler == j] ile o kümenin noktalarını seç.', 'Bu noktaların sütun ortalamasını (axis=0) j. satıra yaz.', 'Diziyi döndür.'],
    example='import numpy as np\n\n# şehre göre ortalama sepet: maskeleme ile grup ortalaması\nsepet = np.array([120.0, 80.0, 300.0, 260.0])\nsehir = np.array([0, 0, 1, 1])\nfor j in range(2):\n    print(j, sepet[sehir == j].mean())\n',
    start='import numpy as np\n\ndef merkezleri_hesapla(X, etiketler, k):\n    merkezler = np.zeros((k, X.shape[1]))\n    # TODO: her küme için noktaların ortalamasını hesapla\n    return merkezler\n',
    sol='import numpy as np\n\ndef merkezleri_hesapla(X, etiketler, k):\n    merkezler = np.zeros((k, X.shape[1]))\n    for j in range(k):\n        merkezler[j] = X[etiketler == j].mean(axis=0)\n    return merkezler\n',
    tests='import numpy as np\nX = np.array([[1.0, 2.0], [3.0, 4.0], [10.0, 10.0], [12.0, 14.0]])\nm = merkezleri_hesapla(X, np.array([0, 0, 1, 1]), 2)\nassert m.shape == (2, 2), "2 küme, 2 özellik: sonuç (2, 2) boyutlu olmalı"\nassert np.allclose(m[0], [2.0, 3.0]), "Küme 0 merkezi [2, 3] olmalı: (1+3)/2 ve (2+4)/2"\nassert np.allclose(m[1], [11.0, 12.0]), "Küme 1 merkezi [11, 12] olmalı"\nm3 = merkezleri_hesapla(X, np.array([2, 0, 1, 1]), 3)\nassert np.allclose(m3[2], [1.0, 2.0]), "Tek noktalı kümenin merkezi noktanın kendisidir"\n',
    hints=['Boolean maske: X[etiketler == j] yalnızca j. kümenin satırlarını verir.', 'Sütun bazında ortalama için .mean(axis=0) kullan.', 'Döngü içinde: merkezler[j] = X[etiketler == j].mean(axis=0)'],
    why='k-means\'in "merkezi güncelle" adımı tam olarak budur: maskeyle kümeyi seç, sütun ortalamasını al.'))
ex.append(dict(t='code', id='ml-kumeleme-2', stage='Rehberli', diff=2,
    q='<p>Dirsek yöntemi için tablo üret. <code>dirsek_tablosu(X, k_listesi)</code> fonksiyonu, verilen her k için <code>KMeans(n_clusters=k, n_init=10, random_state=0)</code> eğitip inertia değerini 1 basamağa yuvarlasın ve <code>{k: inertia}</code> sözlüğü döndürsün. Ölçekleme gerekmez (veri zaten aynı birimde).</p>',
    guide=['Boş bir sözlük oluştur.', 'k_listesi üzerinde döngü kur.', 'Her k için KMeans modelini X ile eğit (fit).', 'model.inertia_ değerini round(..., 1) ile sözlüğe yaz.', 'Sözlüğü döndür.'],
    example='from sklearn.datasets import make_blobs\nfrom sklearn.cluster import KMeans\n\nX, _ = make_blobs(n_samples=50, centers=2, random_state=0)\nmodel = KMeans(n_clusters=2, n_init=10, random_state=0).fit(X)\nprint(round(model.inertia_, 1))\n',
    start='from sklearn.cluster import KMeans\n\ndef dirsek_tablosu(X, k_listesi):\n    tablo = {}\n    # TODO: her k için modeli eğit ve inertia\'yı kaydet\n    return tablo\n',
    sol='from sklearn.cluster import KMeans\n\ndef dirsek_tablosu(X, k_listesi):\n    tablo = {}\n    for k in k_listesi:\n        model = KMeans(n_clusters=k, n_init=10, random_state=0).fit(X)\n        tablo[k] = round(model.inertia_, 1)\n    return tablo\n',
    tests='from sklearn.datasets import make_blobs\nX, _ = make_blobs(n_samples=150, centers=3, cluster_std=0.7, random_state=3)\nt = dirsek_tablosu(X, [1, 2, 3, 4, 5])\nassert list(t.keys()) == [1, 2, 3, 4, 5], "Sözlüğün anahtarları verilen k değerleri olmalı"\ndegerler = list(t.values())\nassert all(a >= b for a, b in zip(degerler, degerler[1:])), "Inertia k arttıkça azalmalı"\nassert t[2] - t[3] > 5 * (t[3] - t[4]), "3 gerçek kümede dirsek k=3\'te olmalı: 2->3 düşüşü 3->4 düşüşünden çok büyük"\n',
    hints=['Her k için ayrı bir KMeans nesnesi kur.', 'Eğitilmiş modelin inertia_ özelliği kareler toplamını verir.', 'tablo[k] = round(KMeans(n_clusters=k, n_init=10, random_state=0).fit(X).inertia_, 1)'],
    why='Dirsek grafiğinin verisi bu sözlüktür; düşüşün aniden yavaşladığı k dirsek noktasıdır.'))
ex.append(dict(t='code', id='ml-kumeleme-3', stage='Rehberli', diff=2,
    q='<p><code>en_iyi_k(X, k_listesi)</code> fonksiyonu her k için <code>KMeans(n_clusters=k, n_init=10, random_state=0)</code> ile etiket üretsin, <code>silhouette_score</code> hesaplasın ve en yüksek skoru veren k\'yi döndürsün. k_listesi\'nde 1 olmayacak (silhouette en az 2 küme ister).</p>',
    guide=['silhouette_score\'u sklearn.metrics\'ten içe aktar.', 'En iyi k ve en iyi skoru tutacak iki değişken başlat (skor için -1 iyi bir başlangıç).', 'Her k için fit_predict ile etiketleri al, skoru hesapla.', 'Skor daha büyükse en iyi değerleri güncelle; sonunda en iyi k\'yi döndür.'],
    example='from sklearn.datasets import make_blobs\nfrom sklearn.cluster import KMeans\nfrom sklearn.metrics import silhouette_score\n\nX, _ = make_blobs(n_samples=60, centers=2, random_state=1)\netiket = KMeans(n_clusters=2, n_init=10, random_state=0).fit_predict(X)\nprint(round(silhouette_score(X, etiket), 3))\n',
    start='from sklearn.cluster import KMeans\nfrom sklearn.metrics import silhouette_score\n\ndef en_iyi_k(X, k_listesi):\n    en_iyi, en_iyi_skor = None, -1\n    # TODO: her k için silhouette skorunu hesapla, en yükseğini tut\n    return en_iyi\n',
    sol='from sklearn.cluster import KMeans\nfrom sklearn.metrics import silhouette_score\n\ndef en_iyi_k(X, k_listesi):\n    en_iyi, en_iyi_skor = None, -1\n    for k in k_listesi:\n        etiket = KMeans(n_clusters=k, n_init=10, random_state=0).fit_predict(X)\n        skor = silhouette_score(X, etiket)\n        if skor > en_iyi_skor:\n            en_iyi, en_iyi_skor = k, skor\n    return en_iyi\n',
    tests='from sklearn.datasets import make_blobs\nX4, _ = make_blobs(n_samples=160, centers=4, cluster_std=0.6, random_state=11)\nassert en_iyi_k(X4, [2, 3, 4, 5]) == 4, "Dört ayrık küme üretilen veride en iyi k 4 olmalı"\nX2, _ = make_blobs(n_samples=80, centers=2, cluster_std=0.5, random_state=2)\nassert en_iyi_k(X2, [2, 3, 4]) == 2, "İki ayrık kümede en iyi k 2 olmalı"\n',
    hints=['silhouette_score(X, etiketler) tek bir ortalama skor döndürür.', 'fit_predict hem eğitir hem etiketi döndürür.', 'if skor > en_iyi_skor: en_iyi, en_iyi_skor = k, skor'],
    why='Silhouette, inertia\'dan farklı olarak k arttıkça kendiliğinden iyileşmez; bu yüzden doğrudan en büyüğü seçilebilir.'))
ex.append(dict(t='code', id='ml-kumeleme-4', stage='Rehberli', diff=2,
    q='<p>Ham işlem listesinden RFM özellikleri çıkar. <code>rfm_ozellikleri(islemler, bugun)</code>: <code>islemler</code> sözlük listesi (<code>musteri</code>, <code>tarih</code> "YYYY-AA-GG" metni, <code>tutar</code>), <code>bugun</code> aynı biçimde metin. Dönüş: <code>{{musteri: (recency_gun, siparis_sayisi, toplam_tutar)}}</code>. Recency, bugünden müşterinin <b>en son</b> işlem tarihine kadar geçen gün; toplam 2 basamağa yuvarlanır.</p>'.replace('{{', '{').replace('}}', '}'),
    guide=['Tarih metinlerini date.fromisoformat ile tarihe çevir.', 'Her müşteri için son tarih, adet ve toplamı biriktiren bir sözlük tut.', 'Her işlemde: son tarihi max ile güncelle, adedi 1 artır, tutarı ekle.', 'Sonunda (bugun - son_tarih).days, adet, round(toplam, 2) üçlüsünü döndür.'],
    example='from datetime import date\n\nson = {}\nfor kim, t in [("Ali", "2024-03-01"), ("Ali", "2024-05-10"), ("Ali", "2024-04-02")]:\n    d = date.fromisoformat(t)\n    son[kim] = max(son.get(kim, d), d)\nprint(son, (date(2024, 6, 1) - son["Ali"]).days)\n',
    start='from datetime import date\n\ndef rfm_ozellikleri(islemler, bugun):\n    bugun = date.fromisoformat(bugun)\n    ozet = {}   # musteri -> [son_tarih, adet, toplam]\n    for i in islemler:\n        # TODO: son tarihi, adedi ve toplamı güncelle\n        pass\n    # TODO: (recency, adet, toplam) sözlüğünü döndür\n    return {}\n',
    sol='from datetime import date\n\ndef rfm_ozellikleri(islemler, bugun):\n    bugun = date.fromisoformat(bugun)\n    ozet = {}   # musteri -> [son_tarih, adet, toplam]\n    for i in islemler:\n        d = date.fromisoformat(i["tarih"])\n        if i["musteri"] not in ozet:\n            ozet[i["musteri"]] = [d, 0, 0.0]\n        kayit = ozet[i["musteri"]]\n        kayit[0] = max(kayit[0], d)\n        kayit[1] += 1\n        kayit[2] += i["tutar"]\n    return {m: ((bugun - s).days, a, round(t, 2)) for m, (s, a, t) in ozet.items()}\n',
    tests='islemler = [\n    {"musteri": "Ayşe", "tarih": "2024-05-20", "tutar": 450.5},\n    {"musteri": "Mehmet", "tarih": "2024-01-10", "tutar": 120.0},\n    {"musteri": "Ayşe", "tarih": "2024-03-02", "tutar": 99.5},\n    {"musteri": "Ayşe", "tarih": "2024-05-28", "tutar": 1200.0},\n]\nr = rfm_ozellikleri(islemler, "2024-06-01")\nassert set(r) == {"Ayşe", "Mehmet"}, "Her müşteri bir kez anahtar olmalı"\nassert r["Ayşe"] == (4, 3, 1750.0), f"Ayşe: son işlem 28 Mayıs -> 4 gün, 3 sipariş, 1750.0 TL olmalı; gelen {r[\'Ayşe\']}"\nassert r["Mehmet"] == (143, 1, 120.0), "Mehmet: 10 Ocak\'tan 1 Haziran\'a 143 gün (2024 artık yıl)"\nassert rfm_ozellikleri([], "2024-06-01") == {}, "Boş liste boş sözlük vermeli"\n',
    hints=['Recency için son (en büyük) tarih gerekir; işlemler sıralı gelmeyebilir.', 'Müşteri ilk kez görüldüğünde [tarih, 0, 0.0] ile başlat, sonra güncelle.', 'Sonuç: {m: ((bugun - s).days, a, round(t, 2)) for m, (s, a, t) in ozet.items()}'],
    why='Kümeleme modelinin girdisi müşteri başına bir satırdır; ham işlem tablosunu bu şekle getirmek segmentasyonun ilk ve en önemli adımıdır.'))

# ---------- Kendin yaz
ex.append(dict(t='code', id='ml-kumeleme-5', stage='Kendin yaz', diff=1,
    q='<p><code>zskor_aykirilar(tutarlar, esik=3.0)</code> fonksiyonunu yaz: liste olarak gelen tutarların z-skorunu (numpy\'nin varsayılan <code>std</code>\'si, yani ddof=0) hesaplasın ve |z| &gt; esik olan elemanların <b>indekslerini</b> liste olarak döndürsün. Tüm değerler aynıysa (std = 0) boş liste döndürsün.</p>',
    start='import numpy as np\n\ndef zskor_aykirilar(tutarlar, esik=3.0):\n    pass\n',
    sol='import numpy as np\n\ndef zskor_aykirilar(tutarlar, esik=3.0):\n    a = np.asarray(tutarlar, dtype=float)\n    std = a.std()\n    if std == 0:\n        return []\n    z = (a - a.mean()) / std\n    return np.flatnonzero(np.abs(z) > esik).tolist()\n',
    tests='t = [100] * 9 + [1000]\nassert zskor_aykirilar(t, 2.5) == [9], "1000 TL\'lik işlem (z=3.0) eşik 2.5\'te aykırı çıkmalı"\nassert zskor_aykirilar(t) == [], "z tam 3.0; esik=3.0 için > koşulu sağlanmaz"\nassert zskor_aykirilar([50, 50, 50]) == [], "std=0 iken sıfıra bölme olmamalı, boş liste dönmeli"\nr = zskor_aykirilar([10, 12, 11, -40, 9, 10, 11, 12, 10, 95], 1.5)\nassert r == [3, 9], f"Hem çok küçük hem çok büyük uçlar yakalanmalı; gelen {r}"\nassert all(isinstance(i, int) for i in r), "İndeksler düz Python int olmalı (tolist kullan)"\n',
    hints=['Önce np.asarray ile diziye çevir; std sıfırsa erken dön.', 'np.flatnonzero(maske) True olan konumları verir; .tolist() ile int listesine çevir.'],
    why='Mutlak değer iki yöndeki uçları da yakalar; std=0 kontrolü sabit seride sıfıra bölmeyi önler.'))
ex.append(dict(t='code', id='ml-kumeleme-6', stage='Kendin yaz', diff=2,
    q='<p>Küme profilini çıkar. <code>kume_profili(X, etiketler, ozellik_adlari)</code>: <code>X</code> numpy dizisi (ham, ölçeklenmemiş değerler), <code>etiketler</code> küme numaraları, <code>ozellik_adlari</code> sütun adları listesi. Dönüş: <code>{{kume_no: {{"adet": n, ozellik_adi: ortalama, ...}}}}</code>; ortalamalar 1 basamağa yuvarlanır, küme numaraları ve adet düz <code>int</code>, anahtarlar küçükten büyüğe.</p>'.replace('{{', '{').replace('}}', '}'),
    start='import numpy as np\n\ndef kume_profili(X, etiketler, ozellik_adlari):\n    pass\n',
    sol='import numpy as np\n\ndef kume_profili(X, etiketler, ozellik_adlari):\n    profil = {}\n    for k in sorted(set(np.asarray(etiketler).tolist())):\n        grup = X[etiketler == k]\n        satir = {"adet": int(len(grup))}\n        for ad, ort in zip(ozellik_adlari, grup.mean(axis=0)):\n            satir[ad] = round(float(ort), 1)\n        profil[int(k)] = satir\n    return profil\n',
    tests='import numpy as np\nX = np.array([[5, 20, 15000], [7, 25, 18000], [200, 1, 300], [180, 2, 500], [190, 1, 250]], dtype=float)\net = np.array([1, 1, 0, 0, 0])\np = kume_profili(X, et, ["recency", "frequency", "monetary"])\nassert list(p.keys()) == [0, 1], "Anahtarlar küme numaraları olmalı, sıralı"\nassert p[1] == {"adet": 2, "recency": 6.0, "frequency": 22.5, "monetary": 16500.0}, f"Küme 1 profili yanlış: {p[1]}"\nassert p[0]["adet"] == 3 and p[0]["monetary"] == 350.0, "Küme 0: 3 müşteri, ortalama 350.0 TL"\nassert type(p[0]["adet"]) is int and type(p[0]["recency"]) is float, "adet int, ortalamalar float olmalı"\n',
    hints=['Benzersiz küme numaralarını sorted(set(...)) ile al.', 'zip(ozellik_adlari, grup.mean(axis=0)) ile ad-ortalama eşle; float() ve round(..., 1) uygula.'],
    why='Profil tablosu, modelin çıktısını iş ekibinin okuyabileceği dile çeviren ilk adımdır; ölçeklenmemiş ham değerlerle hesaplanır ki "ortalama 16.500 TL" gibi okunabilsin.'))
ex.append(dict(t='code', id='ml-kumeleme-7', stage='Kendin yaz', diff=2,
    q='<p><code>pca_indir(X, n=2)</code>: önce <code>StandardScaler</code> ile ölçekle, sonra <code>PCA(n_components=n)</code> uygula. Dönüş: <code>(indirgenmis_dizi, toplam_oran)</code>; toplam_oran, seçilen bileşenlerin açıkladığı varyans oranlarının toplamı, 3 basamağa yuvarlanmış düz float.</p>',
    start='from sklearn.decomposition import PCA\nfrom sklearn.preprocessing import StandardScaler\n\ndef pca_indir(X, n=2):\n    pass\n',
    sol='from sklearn.decomposition import PCA\nfrom sklearn.preprocessing import StandardScaler\n\ndef pca_indir(X, n=2):\n    Xs = StandardScaler().fit_transform(X)\n    pca = PCA(n_components=n)\n    X2 = pca.fit_transform(Xs)\n    return X2, round(float(pca.explained_variance_ratio_.sum()), 3)\n',
    tests='import numpy as np\nfrom sklearn.datasets import make_blobs\nX, _ = make_blobs(n_samples=150, n_features=5, centers=3, random_state=4)\nX2, oran = pca_indir(X)\nassert X2.shape == (150, 2), "5 sütun 2 bileşene inmeli: (150, 2)"\nassert isinstance(oran, float) and 0 < oran <= 1, "Oran 0-1 arasında float olmalı"\nX5, oran5 = pca_indir(X, 5)\nassert abs(oran5 - 1.0) < 1e-3, "Tüm bileşenler alınınca varyansın tamamı (1.0) açıklanmalı"\nX[:, 0] *= 1000\n_, oran_b = pca_indir(X)\nassert abs(oran_b - oran) < 1e-3, "Ölçekleme yapıldığı için bir sütunu 1000 ile çarpmak sonucu değiştirmemeli"\n',
    hints=['Ölçekleyiciyi fit_transform ile uygula, sonucu PCA\'ya ver.', 'pca.explained_variance_ratio_.sum() toplam oranı verir; float() ve round(..., 3) ekle.'],
    why='Ölçekleme sayesinde birim değişikliği sonucu etkilemez; açıklanan varyans oranı kaç bileşenin yeterli olduğunu söyler.'))
ex.append(dict(t='code', id='ml-kumeleme-8', stage='Kendin yaz', diff=2,
    q='<p>Kümeleri iş diline çevir. <code>kumeleri_adlandir(profil)</code>: <code>profil</code> sözlüğü <code>{{kume: {{"recency": .., "frequency": .., "monetary": ..}}}}</code> biçiminde. Kurallar sırayla: ortalama <b>monetary</b>\'si en yüksek küme <code>"Şampiyonlar"</code>; kalanlar içinde <b>recency</b>\'si en yüksek küme <code>"Kaybedilmek üzere"</code>; geri kalan her küme <code>"Gelişmekte olanlar"</code>. Dönüş: <code>{{kume: ad}}</code>. Tek küme varsa o küme "Şampiyonlar" olur.</p>'.replace('{{', '{').replace('}}', '}'),
    start='def kumeleri_adlandir(profil):\n    pass\n',
    sol='def kumeleri_adlandir(profil):\n    adlar = {k: "Gelişmekte olanlar" for k in profil}\n    sampiyon = max(profil, key=lambda k: profil[k]["monetary"])\n    adlar[sampiyon] = "Şampiyonlar"\n    kalan = [k for k in profil if k != sampiyon]\n    if kalan:\n        kayip = max(kalan, key=lambda k: profil[k]["recency"])\n        adlar[kayip] = "Kaybedilmek üzere"\n    return adlar\n',
    tests='p = {0: {"recency": 190, "frequency": 1.3, "monetary": 350}, 1: {"recency": 6, "frequency": 22, "monetary": 16500}, 2: {"recency": 40, "frequency": 6, "monetary": 2100}}\nassert kumeleri_adlandir(p) == {0: "Kaybedilmek üzere", 1: "Şampiyonlar", 2: "Gelişmekte olanlar"}, "Üç küme doğru adlandırılmalı"\np2 = {5: {"recency": 300, "frequency": 9, "monetary": 9000}, 7: {"recency": 10, "frequency": 2, "monetary": 400}}\nassert kumeleri_adlandir(p2) == {5: "Şampiyonlar", 7: "Kaybedilmek üzere"}, "Şampiyon önce seçilir; recency kuralı yalnız kalanlara uygulanır"\nassert kumeleri_adlandir({3: {"recency": 1, "frequency": 1, "monetary": 1}}) == {3: "Şampiyonlar"}, "Tek küme Şampiyonlar olmalı"\n',
    hints=['max(profil, key=lambda k: profil[k]["monetary"]) en yüksek harcamalı küme numarasını verir.', 'Şampiyonu çıkardıktan sonra kalan liste boş değilse recency kuralını uygula.'],
    why='Kuralların sırası önemlidir: aynı küme hem en çok harcayan hem en uzun süredir gelmeyen olabilir; önce hangi etiketin öncelikli olduğuna iş ekibiyle karar verilir.'))

# ---------- Hata avı
ex.append(dict(t='code', id='ml-kumeleme-9', stage='Hata avı', kind='bug', diff=2,
    q='<p>Hatayı bul ve düzelt. <code>yas_segmenti(X)</code> müşterileri (yaş, aylık gelir) sütunlarıyla 2 kümeye ayırmalı. Veride gerçek ayrım yaşta (genç/olgun), gelir ise yapısız. Ama fonksiyon gençleri iki kümeye dağıtıyor. Fonksiyon adı ve dönüş türü (etiket dizisi) aynı kalsın.</p>',
    start='import numpy as np\nfrom sklearn.cluster import KMeans\n\ndef yas_segmenti(X):\n    model = KMeans(n_clusters=2, n_init=10, random_state=0)\n    return model.fit_predict(X)\n',
    sol='import numpy as np\nfrom sklearn.cluster import KMeans\nfrom sklearn.preprocessing import StandardScaler\n\ndef yas_segmenti(X):\n    Xs = StandardScaler().fit_transform(X)\n    model = KMeans(n_clusters=2, n_init=10, random_state=0)\n    return model.fit_predict(Xs)\n',
    tests='import numpy as np\nyas = [25, 25, 26, 25, 24, 26, 27, 26, 24, 23, 59, 60, 57, 60, 58, 59, 59, 60, 61, 62]\ngelir = [20283, 21243, 26706, 26472, 26154, 23837, 29972, 29808, 26855, 26505, 26884, 23889, 21351, 27215, 25254, 23102, 24858, 28895, 29340, 23578]\net = np.asarray(yas_segmenti(np.column_stack([yas, gelir]).astype(float)))\nassert len(set(et[:10].tolist())) == 1, "İlk 10 müşteri (yaş 23-27) aynı kümede olmalı; gelir sütunu uzaklığı ezmiyor mu?"\nassert len(set(et[10:].tolist())) == 1 and et[0] != et[10], "Olgun müşteriler ayrı bir kümede toplanmalı"\n',
    hints=['Gelir binlerle, yaş onlarla ölçülüyor; uzaklık hangisine bakıyor?', 'StandardScaler().fit_transform(X) ile ölçekledikten sonra kümele.'],
    why='Ölçeklemeden önce uzaklığı neredeyse yalnızca gelir belirliyordu; gelirdeki rastgele farklar kümeleri bölüyordu. Ölçekleme iki sütuna eşit söz hakkı verir ve yaştaki gerçek ayrım ortaya çıkar.'))
ex.append(dict(t='code', id='ml-kumeleme-10', stage='Hata avı', kind='bug', diff=2,
    q='<p>Hatayı bul ve düzelt. <code>anomalileri_bul(tutarlar)</code> Ilgaz Bank işlem tutarlarında IsolationForest ile anormal işlemlerin <b>indekslerini</b> döndürmeli. Ama rapora neredeyse tüm normal işlemler düşüyor.</p>',
    start='import numpy as np\nfrom sklearn.ensemble import IsolationForest\n\ndef anomalileri_bul(tutarlar):\n    X = np.log1p(np.asarray(tutarlar, dtype=float)).reshape(-1, 1)\n    tahmin = IsolationForest(contamination=0.1, random_state=0).fit_predict(X)\n    return [i for i, t in enumerate(tahmin) if t == 1]\n',
    sol='import numpy as np\nfrom sklearn.ensemble import IsolationForest\n\ndef anomalileri_bul(tutarlar):\n    X = np.log1p(np.asarray(tutarlar, dtype=float)).reshape(-1, 1)\n    tahmin = IsolationForest(contamination=0.1, random_state=0).fit_predict(X)\n    return [i for i, t in enumerate(tahmin) if t == -1]\n',
    tests='t = [320, 450, 280, 610, 390, 505, 85000, 350, 470, 300, 520, 410, 330, 480, 360, 440, 290, 530, 400, 6]\nr = anomalileri_bul(t)\nassert 6 in r, "85.000 TL\'lik işlem (indeks 6) anomali olmalı"\nassert len(r) <= 3, f"Yalnızca birkaç işlem anomali olmalı; {len(r)} tane geldi. predict hangi değeri anomali için döndürür?"\n',
    hints=['IsolationForest.predict ve fit_predict normal için 1, anomali için -1 döndürür.', 'Koşulu t == -1 yap.'],
    why='scikit-learn anomali dedektörleri (IsolationForest, LocalOutlierFactor, OneClassSVM) -1 = anomali, 1 = normal kuralını kullanır. 1\'i seçmek tam tersini raporlar.'))

# ---------- Meydan okuma
ex.append(dict(t='code', id='ml-kumeleme-11', stage='Meydan okuma', diff=3,
    q='<p>k-means\'i sıfırdan yaz. <code>kmeans_basit(X, k, iterasyon=100)</code>: başlangıç merkezleri X\'in <b>ilk k satırı</b> olsun. Her turda noktaları en yakın merkeze ata (Öklid), sonra merkezleri ortalamaya taşı; bir küme boş kalırsa o kümenin merkezi <b>eski yerinde kalsın</b>. Merkezler değişmezse (np.allclose) erken dur. Dönüş: <code>(etiketler, merkezler)</code> numpy dizileri. sklearn kullanma.</p>',
    start='import numpy as np\n\ndef kmeans_basit(X, k, iterasyon=100):\n    pass\n',
    sol='import numpy as np\n\ndef kmeans_basit(X, k, iterasyon=100):\n    X = np.asarray(X, dtype=float)\n    merkezler = X[:k].copy()\n    etiketler = np.zeros(len(X), dtype=int)\n    for _ in range(iterasyon):\n        uzaklik = np.linalg.norm(X[:, None, :] - merkezler[None, :, :], axis=2)\n        etiketler = uzaklik.argmin(axis=1)\n        yeni = merkezler.copy()\n        for j in range(k):\n            if np.any(etiketler == j):\n                yeni[j] = X[etiketler == j].mean(axis=0)\n        if np.allclose(yeni, merkezler):\n            break\n        merkezler = yeni\n    return etiketler, merkezler\n',
    tests='import numpy as np\nX = np.array([[1, 1], [9, 9], [1.5, 2], [8, 8], [1, 0.5], [9.5, 8.5]])\net, m = kmeans_basit(X, 2)\nassert et.tolist() == [0, 1, 0, 1, 0, 1], f"Başlangıç ilk iki satır: sol-alt grup 0, sağ-üst grup 1 olmalı; gelen {et.tolist()}"\nassert np.allclose(m, [[7/6, 7/6], [53/6, 8.5]]), "Merkezler küme ortalamaları olmalı"\nZ = np.array([[0.0], [0.0], [5.0], [6.0]])\net3, m3 = kmeans_basit(Z, 2)\nassert m3.shape == (2, 1) and not np.isnan(m3).any(), "İlk iki satır aynı: 2. küme boş kalır; mean NaN üretmemeli, eski merkez korunmalı"\nassert m3[1, 0] == 0.0, "Boş kalan kümenin merkezi eski yerinde (0.0) kalmalı"\n',
    hints=['Tüm nokta-merkez uzaklıklarını yayın (broadcasting) ile tek seferde hesapla: X[:, None, :] - merkezler[None, :, :].', 'argmin(axis=1) en yakın merkezi verir; boş küme kontrolü için np.any(etiketler == j).', 'Yeni merkezleri ayrı bir kopyada hesapla, allclose ile eskisiyle karşılaştır.'],
    why='Boş küme k-means\'in klasik kenar durumudur: ortalaması alınacak nokta yoksa mean NaN üretir ve algoritma çöker. scikit-learn bu durumda merkezi en uzak noktaya taşır; biz basitçe yerinde bıraktık.'))
ex.append(dict(t='code', id='ml-kumeleme-12', stage='Meydan okuma', diff=3,
    q='<p>Silhouette skorunu elle hesapla. <code>siluet(X, etiketler)</code>: her nokta i için <code>a</code> = aynı kümedeki <b>diğer</b> noktalara ortalama uzaklık, <code>b</code> = başka her kümeye olan ortalama uzaklıkların en küçüğü, <code>s = (b - a) / max(a, b)</code>. Tek elemanlı kümedeki noktanın s değeri 0\'dır. Tüm s değerlerinin ortalamasını döndür. Sonuç <code>sklearn.metrics.silhouette_score</code> ile aynı çıkmalı.</p>',
    start='import numpy as np\n\ndef siluet(X, etiketler):\n    pass\n',
    sol='import numpy as np\n\ndef siluet(X, etiketler):\n    X = np.asarray(X, dtype=float)\n    etiketler = np.asarray(etiketler)\n    D = np.linalg.norm(X[:, None, :] - X[None, :, :], axis=2)\n    kumeler = np.unique(etiketler)\n    skorlar = []\n    for i in range(len(X)):\n        ayni = etiketler == etiketler[i]\n        n = ayni.sum()\n        if n == 1:\n            skorlar.append(0.0)\n            continue\n        a = D[i, ayni].sum() / (n - 1)\n        b = min(D[i, etiketler == k].mean() for k in kumeler if k != etiketler[i])\n        skorlar.append((b - a) / max(a, b))\n    return float(np.mean(skorlar))\n',
    tests='import numpy as np\nfrom sklearn.datasets import make_blobs\nfrom sklearn.metrics import silhouette_score\nX, y = make_blobs(n_samples=60, centers=3, random_state=8)\nassert abs(siluet(X, y) - silhouette_score(X, y)) < 1e-9, "Sonuç sklearn silhouette_score ile aynı olmalı"\nrng = np.random.default_rng(0)\net = rng.integers(0, 3, 60)\nassert abs(siluet(X, et) - silhouette_score(X, et)) < 1e-9, "Rastgele etiketlerde de (negatif skor) aynı olmalı"\nY = np.array([[0, 0], [0, 1], [5, 5]])\nassert abs(siluet(Y, [0, 0, 1]) - silhouette_score(Y, [0, 0, 1])) < 1e-9, "Tek elemanlı kümedeki nokta 0 sayılmalı"\n',
    hints=['Önce tüm ikili uzaklık matrisini D bir kez hesapla.', 'a için kendisini hariç tutmak: kendine uzaklık 0 olduğundan toplamı (n - 1)\'e bölmek yeterli.', 'b: diğer her küme k için D[i, etiketler == k].mean(), sonra min.'],
    why='Silhouette\'i elle yazmak hem formülü pekiştirir hem de O(n²) bellek ve süre gerektirdiğini gösterir; büyük veride silhouette_score(sample_size=...) ile örneklem kullanılır.'))

# ---------- Mini proje
ex.append(dict(t='code', id='ml-kumeleme-13', stage='Mini proje', diff=3,
    q='<p>Anadolu Market için uçtan uca segment raporu. <code>segment_raporu(islemler, bugun, k=3)</code>:</p><ol><li>İşlemlerden müşteri başına (recency, frequency, monetary) çıkar (Rehberli 4\'teki mantık; fonksiyonu yeniden yaz).</li><li>Müşterileri <b>ada göre sıralı</b> diz; monetary\'ye <code>np.log1p</code> uygula, <code>StandardScaler</code> ile ölçekle.</li><li><code>KMeans(n_clusters=k, n_init=10, random_state=0)</code> ile kümele.</li><li>Her küme için bir sözlük üret: <code>{{"musteriler": [adlar, sıralı], "ort_recency": ..., "ort_harcama": ...}}</code> (ortalamalar ham değerlerden, 1 basamak).</li><li>Listeyi <code>ort_harcama</code>\'ya göre <b>büyükten küçüğe</b> sıralayıp döndür.</li></ol>'.replace('{{', '{').replace('}}', '}'),
    start='from datetime import date\nimport numpy as np\nfrom sklearn.cluster import KMeans\nfrom sklearn.preprocessing import StandardScaler\n\ndef segment_raporu(islemler, bugun, k=3):\n    pass\n',
    sol='from datetime import date\nimport numpy as np\nfrom sklearn.cluster import KMeans\nfrom sklearn.preprocessing import StandardScaler\n\ndef rfm_ozellikleri(islemler, bugun):\n    bugun = date.fromisoformat(bugun)\n    ozet = {}\n    for i in islemler:\n        d = date.fromisoformat(i["tarih"])\n        s, a, t = ozet.get(i["musteri"], (d, 0, 0.0))\n        ozet[i["musteri"]] = (max(s, d), a + 1, t + i["tutar"])\n    return {m: ((bugun - s).days, a, t) for m, (s, a, t) in ozet.items()}\n\ndef segment_raporu(islemler, bugun, k=3):\n    rfm = rfm_ozellikleri(islemler, bugun)\n    adlar = sorted(rfm)\n    ham = np.array([rfm[m] for m in adlar], dtype=float)\n    X = ham.copy()\n    X[:, 2] = np.log1p(X[:, 2])\n    X = StandardScaler().fit_transform(X)\n    etiket = KMeans(n_clusters=k, n_init=10, random_state=0).fit_predict(X)\n    rapor = []\n    for j in range(k):\n        maske = etiket == j\n        rapor.append({\n            "musteriler": [m for m, e in zip(adlar, etiket) if e == j],\n            "ort_recency": round(float(ham[maske, 0].mean()), 1),\n            "ort_harcama": round(float(ham[maske, 2].mean()), 1),\n        })\n    return sorted(rapor, key=lambda r: r["ort_harcama"], reverse=True)\n',
    tests='import random\nrandom.seed(0)\nislemler = []\nprofiller = {"Ayşe": (3, 20, 900), "Burak": (5, 18, 1100), "Cem": (2, 25, 800),\n             "Deniz": (40, 6, 300), "Ece": (55, 5, 250), "Fatih": (35, 7, 350),\n             "Gül": (200, 1, 90), "Hakan": (240, 2, 60), "İpek": (180, 1, 120)}\nfor ad, (son_gun, adet, ort) in profiller.items():\n    for n in range(adet):\n        gun = 1 + son_gun + n * 3\n        islemler.append({"musteri": ad, "tarih": f"2024-{12 - min(gun // 31, 10):02d}-{1 + gun % 28:02d}", "tutar": round(ort * random.uniform(0.8, 1.2), 2)})\nr = segment_raporu(islemler, "2024-12-31")\nassert len(r) == 3, "k=3 için 3 segment dönmeli"\nassert set(sum((s["musteriler"] for s in r), [])) == set(profiller), "Her müşteri tam bir segmentte olmalı"\nassert r[0]["ort_harcama"] >= r[1]["ort_harcama"] >= r[2]["ort_harcama"], "Segmentler ort_harcama\'ya göre azalan sırada olmalı"\nassert set(r[0]["musteriler"]) == {"Ayşe", "Burak", "Cem"}, f"En değerli segment sık ve çok harcayan üçlü olmalı; gelen {r[0][\'musteriler\']}"\nassert r[0]["musteriler"] == sorted(r[0]["musteriler"]), "Segmentteki adlar sıralı olmalı"\nassert set(r[2]["musteriler"]) == {"Gül", "Hakan", "İpek"}, "En düşük segment uzun süredir gelmeyenler olmalı"\nassert r[2]["ort_recency"] > r[0]["ort_recency"], "Kayıp segmentin recency ortalaması daha yüksek olmalı"\n',
    hints=['Önce rfm_ozellikleri yardımcı fonksiyonunu yaz; segment_raporu onu çağırsın.', 'Ham değerleri ayrı bir dizide sakla; ölçekleme kopya üzerinde yapılsın ki rapor ortalamaları TL cinsinden olsun.', 'Sonda sorted(rapor, key=lambda r: r["ort_harcama"], reverse=True).'],
    why='Gerçek segmentasyon akışı: ham işlem → müşteri tablosu → dönüşüm (log, ölçek) → model → ham değerlerle profil → iş sıralaması. Ölçeklenmiş değerlerle rapor yazmak en sık yapılan sunum hatasıdır.'))

lesson = dict(
    id='ml-kumeleme', lv='ileri', mod='Makine Öğrenmesi', min=50, needs=['scikit-learn', 'numpy'],
    title='Denetimsiz öğrenme: kümeleme, PCA ve anomali tespiti',
    sum='Etiketsiz veride k-means ile müşteri segmentleri kurar, k\'yi dirsek ve silhouette ile seçer, PCA ile boyut indirger, IsolationForest ve z-skoru ile şüpheli işlemleri bulursun.',
    goals=['k-means\'i ölçeklenmiş veriyle çalıştırıp inertia, dirsek yöntemi ve silhouette ile küme sayısını seçebilirim.',
           'Hiyerarşik kümeleme ve DBSCAN\'in k-means\'ten farkını açıklayıp gürültülü veride DBSCAN kullanabilirim.',
           'PCA ile açıklanan varyansı okuyup veriyi görselleştirme için 2 bileşene indirebilirim.',
           'RFM özellikleriyle müşteri segmentasyonu yapıp kümeleri iş diline çevirebilirim.',
           'z-skoru ve IsolationForest ile anormal işlemleri işaretleyebilirim.'],
    body=body, ex=ex,
    faq=[dict(q='k-means her çalıştırmada farklı küme numaraları veriyor, model bozuk mu?', a='Hayır. Küme numaraları keyfi etiketlerdir; aynı gruplar farklı numara alabilir. random_state sabitlersen sonuç tekrarlanır. Raporlarda numara yerine profile dayalı isimler kullan.'),
         dict(q='Kategorik sütunları (şehir, kanal) k-means\'e verebilir miyim?', a='One-hot kodlayarak verebilirsin ama 0/1 sütunların uzaklığa etkisi sayısal sütunlarla dengesiz olabilir. Az sayıda kategoride bu iş görür; çok kategoride k-prototypes gibi karma yöntemler ya da kümelemeyi sayısal davranış özellikleriyle yapıp kategorileri profilde göstermek daha iyidir.'),
         dict(q='PCA\'yı kümelemeden önce mi sonra mı yapmalıyım?', a='Çok sütun varsa önce PCA ile gürültüyü azaltıp sonra kümelemek yaygındır. Az sütunda (RFM gibi 3-5) gerek yoktur; PCA\'yı yalnızca kümeleri 2 boyutta çizmek için kullanırsın.'),
         dict(q='IsolationForest\'taki contamination neyi belirler?', a='Verinin yaklaşık ne kadarının anomali olduğuna dair tahminini; modelin eşiğini bu orana göre ayarlar. Bilmiyorsan "auto" bırak ve decision_function skorlarına bakarak eşiği iş ekibinin inceleyebileceği kuyruk büyüklüğüne göre seç.'),
         dict(q='Kümelemenin doğru olduğunu nasıl anlarım?', a='Tek bir doğru yoktur. Silhouette gibi iç ölçütler ayrışmayı ölçer; asıl test segmentlerin iş için anlamlı ve kararlı olmasıdır: farklı alt örneklerde benzer çıkıyor mu, segment bazlı kampanyalar fark yaratıyor mu?')],
    mistakes=[dict(bad='km = KMeans(n_clusters=3).fit(df[["yas", "bakiye"]])', good='from sklearn.pipeline import make_pipeline\nmodel = make_pipeline(StandardScaler(), KMeans(n_clusters=3, n_init=10, random_state=0))\nmodel.fit(df[["yas", "bakiye"]])', why='Ölçeklemeden kümeleme, büyük birimli sütunun (bakiye) uzaklığı tek başına belirlemesine yol açar.'),
              dict(bad='en_iyi_k = min(inertia_tablosu, key=inertia_tablosu.get)', good='en_iyi_k = max(siluet_tablosu, key=siluet_tablosu.get)', why='Inertia k arttıkça hep düşer; en küçüğü seçmek en büyük k\'yi seçmektir. Dirsek noktasına ya da silhouette\'e bak.'),
              dict(bad='anomaliler = X[iso.predict(X) == 1]', good='anomaliler = X[iso.predict(X) == -1]', why='scikit-learn anomali dedektörlerinde -1 anomali, 1 normal demektir.'),
              dict(bad='print(kmeans.cluster_centers_)   # ölçekli değerler rapora', good='for k in range(3):\n    print(k, df[etiket == k][["recency", "monetary"]].mean().round(1))', why='Merkezler ölçeklenmiş uzaydadır (ortalama 0, std 1); iş ekibine ham değerlerle profil sun ya da scaler.inverse_transform kullan.')]
)

write(lesson, '/home/claude/py/v2/i3/ml-kumeleme.js', 'İleri: ml-kumeleme (denetimsiz öğrenme)')
