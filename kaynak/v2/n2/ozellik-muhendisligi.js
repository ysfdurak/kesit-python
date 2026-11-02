/* Kesit Python — ileri: ozellik-muhendisligi */
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push({
  id: 'ozellik-muhendisligi',
  lv: 'ileri',
  mod: 'Makine Öğrenmesi',
  min: 60,
  needs: ['pandas', 'numpy', 'scikit-learn'],
  title: 'Özellik mühendisliği: ham veriden modele hazır özelliğe',
  sum: 'Tarih ve döngüsel saat, oran ve log dönüşümleri, sızıntısız grup istatistikleri, lag/rolling, frekans ve katlar dışı hedef kodlama, binning, eksiklik bayrağı, özellik seçimi ve özel dönüştürücüyle Pipeline; Ilgaz Bank verisiyle mini proje.',
  goals: [
    'Tarih, oran, log ve etkileşim özelliklerini üretip ne zaman işe yaradığını açıklayabilirim',
    'Grup istatistiklerini ve lag/rolling özelliklerini yalnız geçmişi kullanarak (sızıntısız) hesaplayabilirim',
    'Yüksek kardinaliteli kategorileri frekans ve katlar dışı hedef kodlamayla sayıya çevirebilirim',
    'Varyans, korelasyon ve permutation importance ile özellik seçebilirim',
    'Durum tutan özel bir dönüştürücü yazıp Pipeline içine gömebilirim'
  ],
  body: `<h2>Model, ona verdiğin özellik kadar iyidir</h2>
<p>Ilgaz Bank pazarlama ekibi şunu soruyor: "Hangi müşteriler yılın ikinci yarısında kartıyla çok harcayacak? Onlara özel taksit kampanyası sunalım." Elinde müşteri tablosu (yaş, segment, risk puanı) ve 42 bin satırlık işlem tablosu var. Yalnız demografik sütunlarla kurulan model neredeyse yazı tura atmak kadar başarılı (ROC-AUC 0.53). Aynı işlem tablosundan üretilen birkaç akıllı sütunla skor 0.81'e çıkıyor. Modeli değiştirmedik; <b>özellik mühendisliği</b> (feature engineering) yaptık: ham veriyi, modelin öğrenebileceği biçime dönüştürdük.</p>
<p>Bu derste <code>ml-pipeline-degerlendirme</code> dersinde gördüğün ölçekleme ve one-hot kodlamanın ötesine geçeceksin: tarih, oran, grup istatistiği, gecikme (lag), hedef kodlama, binning, eksiklik göstergesi ve özellik seçimi. Hepsinin ortak kuralı tek: <b>tahmin anında bilinmeyen hiçbir bilgi özelliğe sızmamalı.</b></p>
<div class="tbl-wrap"><table>
<tr><th>Özellik ailesi</th><th>Örnek (Ilgaz Bank)</th><th>Ne zaman işe yarar?</th><th>Tuzak</th></tr>
<tr><td>Tarih ve saat</td><td>işlem saati, hafta sonu, ay</td><td>Davranış zamana bağlıysa</td><td>Saat 23 ile 0'ı uzak sanmak</td></tr>
<tr><td>Oran, fark, etkileşim</td><td>kart harcaması / maaş</td><td>İlişki göreliyse</td><td>Sıfıra bölme</td></tr>
<tr><td>Dönüşüm (log, Box-Cox)</td><td>log(1 + kart toplamı)</td><td>Çarpık, uzun kuyruklu dağılım</td><td>Negatif değerin logu</td></tr>
<tr><td>Grup istatistiği</td><td>hesabın geçmiş ortalama tutarı</td><td>Kişiye göre "normal" değişiyorsa</td><td>Geleceği içeren ortalama</td></tr>
<tr><td>Lag ve rolling</td><td>geçen ayın harcaması</td><td>Zaman sıralı veri</td><td>shift unutmak</td></tr>
<tr><td>Kategori kodlama</td><td>şehir frekansı, hedef ortalaması</td><td>Çok değerli kategoriler</td><td>Hedef kodlamada sızıntı</td></tr>
<tr><td>Binning, eksiklik bayrağı</td><td>kıdem grubu, limit_eksik</td><td>Eşik etkisi, anlamlı boşluk</td><td>Kova sınırını testten seçmek</td></tr>
</table></div>

<h2>Tarih ve saat özellikleri</h2>
<p>Ham zaman damgası (<code>2024-01-01 07:05:28</code>) modele doğrudan girmez. Onu parçalarına ayırırsın: saat, haftanın günü, ay, hafta sonu bayrağı, resmî tatil bayrağı. Saat gibi <b>döngüsel</b> değerlerde bir sorun var: sayı olarak 23 ile 0 arasındaki fark 23, gerçekte bir saat. Çözüm saati bir çemberin üzerine yerleştirmek: <code>sin(2π·saat/24)</code> ve <code>cos(2π·saat/24)</code>. Böylece gece yarısının iki yanı birbirine yakın düşer.</p>
<pre class="py">import numpy as np
import veri

islem = veri.oku("ilgaz_bank", "bank_txns",
                 usecols=["account_id", "txn_time", "amount", "txn_type"],
                 parse_dates=["txn_time"])
df = islem.copy()
df["saat"] = df["txn_time"].dt.hour
df["gun"] = df["txn_time"].dt.dayofweek            # 0 = Pazartesi
df["haftasonu"] = (df["gun"] &gt;= 5).astype(int)
df["saat_sin"] = np.sin(2 * np.pi * df["saat"] / 24)
df["saat_cos"] = np.cos(2 * np.pi * df["saat"] / 24)
print(df[["txn_time", "saat", "haftasonu", "saat_sin", "saat_cos"]].head(3).round(3))
print("Hafta sonu payı:", round(df["haftasonu"].mean(), 3))
</pre>
<div class="tip"><b>Tatil takvimi</b>Resmî tatil, ramazan ve kurban bayramı gibi günler Türkiye'de harcama davranışını ciddi biçimde değiştirir. Tatilleri bir küme olarak tutup <code>df["tarih"].dt.date.isin(tatiller)</code> ile bayrak üret. Ağaç modelleri sin/cos'a ihtiyaç duymaz (saat 22'den büyük mü diye bölebilir); doğrusal modeller ve sinir ağları için döngüsel kodlama fark yaratır.</div>

<h2>Oran, fark, etkileşim ve dönüşümler</h2>
<p>Bir müşterinin 30 bin TL kart harcaması, maaşı 20 bin ise başka, 200 bin ise başka anlam taşır. <b>Oran</b> özelliği (harcama / maaş) bu göreliliği modele hazır verir. <b>Fark</b> (bu ay − geçen ay) değişimi, <b>etkileşim</b> (risk puanı × limit) iki etkinin birlikteliğini yakalar. Doğrusal model bunları kendi başına öğrenemez; ağaç modeller öğrenebilir ama çok daha fazla veri ister.</p>
<p>Para tutarları genellikle sağa çarpıktır: çoğu müşteri az, birkaçı çok harcar. <code>np.log1p(x)</code> (yani log(1 + x)) bu kuyruğu toplar, sıfırı da güvenle işler. Hem negatif hem pozitif olabilen tutarlar için <b>işaretli log</b> kullan: <code>np.sign(x) * np.log1p(np.abs(x))</code>. İstatistiksel olarak en uygun üssü veriden seçen dönüşümler de var: Box-Cox (yalnız pozitif değer) ve Yeo-Johnson (negatife de uygun); ikisi de <code>PowerTransformer</code> içinde.</p>
<pre class="py">import pandas as pd
import numpy as np
import veri

hesap = veri.oku("ilgaz_bank", "bank_accounts")
islem = veri.oku("ilgaz_bank", "bank_txns",
                 usecols=["account_id", "txn_time", "amount", "txn_type"],
                 parse_dates=["txn_time"])
d = islem.merge(hesap[["account_id", "customer_id"]], on="account_id")
ozet = pd.DataFrame({
    "kart": d[d["txn_type"] == "kart_harcama"].groupby("customer_id")["amount"].sum().abs(),
    "maas": d[d["txn_type"] == "maas"].groupby("customer_id")["amount"].sum(),
}).fillna(0)
ozet["kart_maas_orani"] = ozet["kart"] / (ozet["maas"] + 1)      # +1: sıfıra bölme yok
ozet["log_kart"] = np.log1p(ozet["kart"])
print(ozet.round(2).head(3))
print("Çarpıklık  ham:", round(ozet["kart"].skew(), 2), " log:", round(ozet["log_kart"].skew(), 2))
</pre>

<h2>Grup istatistikleri ve sızıntısız hesap</h2>
<p>"Bu işlem, bu hesabın normal tutarından ne kadar sapıyor?" sorusu dolandırıcılık ve churn modellerinin bel kemiğidir. Hesabın ortalama tutarını <code>groupby("account_id")["amount"].transform("mean")</code> ile hesaplamak kolay ama <b>yanlış</b>: o ortalama, işlemden <i>sonraki</i> işlemleri de içerir. Tahmin anında geleceği bilemezsin. Doğrusu yalnız geçmişi kullanmak: önce <code>shift(1)</code> ile bir satır geri kay, sonra <code>expanding().mean()</code> ile o ana kadarki ortalamayı al.</p>
<pre class="py">import pandas as pd

ornek = pd.DataFrame({"hesap": ["A", "A", "A", "B", "B"],
                      "tutar": [100, 300, 200, 50, 150]})
ornek["sizdiran_ort"] = ornek.groupby("hesap")["tutar"].transform("mean")
ornek["gecmis_ort"] = ornek.groupby("hesap")["tutar"].transform(
    lambda s: s.shift(1).expanding().mean())
ornek["son2_ort"] = ornek.groupby("hesap")["tutar"].transform(
    lambda s: s.shift(1).rolling(2, min_periods=1).mean())
print(ornek)
</pre>
<p>A hesabının ilk satırında <code>gecmis_ort</code> boş (NaN): o an henüz geçmiş yok. Bu boşluk gerçektir; "ilk işlem" bilgisini taşır. Modelde ya ayrı bir bayrakla ya da genel ortalamayla doldurarak kullanırsın.</p>

<h2>Lag ve rolling: zaman sıralı veride özellik</h2>
<p>Aylık tahminde en güçlü özellik çoğu zaman <b>geçen ayın değeri</b>dir (lag 1). Hesap × ay tablosunu geniş biçime getirmek (satır hesap, sütun ay) iki işi birden çözer: eksik ayları 0 ile doldurursun (o ay harcama yoksa gerçekten 0'dır) ve "Haziran'ı tahmin ederken yalnız Mayıs ve öncesine bak" kuralını sütun seçerek uygularsın.</p>
<pre class="py">kart = islem[islem["txn_type"] == "kart_harcama"]
genis = (kart.assign(ay=kart["txn_time"].dt.month)
             .groupby(["account_id", "ay"])["amount"].sum().abs()
             .unstack(fill_value=0).round(2))
hedef_ay = 6
tablo = pd.DataFrame({
    "lag1": genis[hedef_ay - 1],
    "lag2": genis[hedef_ay - 2],
    "ort3": genis[[hedef_ay - 3, hedef_ay - 2, hedef_ay - 1]].mean(axis=1).round(2),
    "hedef": genis[hedef_ay],
})
print(genis.shape)
print(tablo.head(3))
print("lag1 ile hedef korelasyonu:", round(tablo["lag1"].corr(tablo["hedef"]), 3))
</pre>
<div class="warn"><b>Satır mı, zaman mı?</b><code>groupby().shift(1)</code> uzun biçimde "bir önceki satırı" verir; arada boş ay varsa bu iki ay öncesi olabilir. Önce takvimi tamamla (geniş tablo ya da <code>reindex</code>), sonra kaydır. Bunun pandas ayrıntısını <code>pandas-zaman-serisi</code> dersinde gördün; tahmin modelleri <code>zaman-serisi-tahmin</code> dersinde.</div>

<h2>Yüksek kardinaliteli kategoriler: frekans ve hedef kodlama</h2>
<p>Şehir (8 değer) için one-hot sorunsuz. Ama işyeri kimliği, ürün kodu, posta kodu gibi binlerce değerli sütunda one-hot binlerce seyrek sütun üretir, nadir değerler gürültüye dönüşür ve canlıda yeni değerler sürekli gelir. İki pratik alternatif:</p>
<ul>
<li><b>Frekans kodlama:</b> her değeri eğitimdeki görülme oranıyla değiştir. Hedefi kullanmadığı için sızıntı riski yok. Eğitimde görülmeyen değer 0 alır.</li>
<li><b>Hedef kodlama</b> (target encoding): her değeri o değerdeki hedef ortalamasıyla değiştir. Çok güçlüdür ama tehlikelidir: satırın kendi hedefi kendi özelliğine girer. Çözüm iki parçalı: (1) <b>katlar dışı</b> (out-of-fold) hesap: her satırın kodu, o satırı görmeyen katlardan gelir; (2) <b>yumuşatma</b> (smoothing): az gözlemli değerleri genel ortalamaya çek: <code>(toplam + m·genel_ort) / (adet + m)</code>.</li>
</ul>
<pre class="py">from sklearn.model_selection import KFold
import numpy as np

musteri = veri.oku("ilgaz_bank", "bank_customers")
y = (musteri["risk_score"] &gt;= 8).astype(int)          # örnek hedef: yüksek risk
sehir = musteri["city"]

def oof_hedef_kodla(kat, y, m=10):
    sonuc = np.zeros(len(kat))
    for egt, dog in KFold(5, shuffle=True, random_state=0).split(kat):
        genel = y.iloc[egt].mean()
        istat = y.iloc[egt].groupby(kat.iloc[egt]).agg(["sum", "count"])
        kod = (istat["sum"] + m * genel) / (istat["count"] + m)
        sonuc[dog] = kat.iloc[dog].map(kod).fillna(genel).to_numpy()
    return sonuc

kod = oof_hedef_kodla(sehir, y)
print(pd.DataFrame({"sehir": sehir, "kod": kod.round(3)}).drop_duplicates("sehir").head(4))
</pre>
<div class="note"><b>Hazır araç</b>scikit-learn 1.3 ile gelen <code>sklearn.preprocessing.TargetEncoder</code> aynı fikri uygular: <code>fit_transform</code> eğitimde katlar dışı kodlar, <code>transform</code> testte tüm eğitim istatistiğini kullanır. Pipeline içine koyarsan çapraz doğrulamada da doğru çalışır. Elle yazmayı bilmek, mülakatta "neden sızdırır?" sorusunu cevaplamanı sağlar.</div>

<h2>Binning ve eksiklik göstergesi</h2>
<p>Bazen ilişki eşiklidir: "hesabı 1 yıldan yeni olanlar farklı davranır." <code>pd.cut</code> sabit sınırlarla, <code>pd.qcut</code> eşit dolu kovalarla gruplar. Kova sınırlarını <b>eğitim verisinden</b> ya da iş kuralından seç; testten değil. Boşluk da bilgi taşır: Ilgaz Bank'ta <code>credit_limit</code> yalnız kredi kartında doludur; vadesiz hesapta boş olması "kart değil" demektir. Boşluğu doldurmadan önce <code>limit_eksik</code> bayrağını üret; <code>SimpleImputer(add_indicator=True)</code> bunu Pipeline içinde otomatik yapar.</p>
<pre class="py">hesap = veri.oku("ilgaz_bank", "bank_accounts", parse_dates=["opened_date"])
h = hesap.copy()
h["limit_eksik"] = h["credit_limit"].isna().astype(int)
h["limit"] = h["credit_limit"].fillna(0)
yil = (pd.Timestamp("2025-01-01") - h["opened_date"]).dt.days / 365
h["kidem"] = pd.cut(yil, bins=[0, 1, 3, 5, 100], labels=["0-1", "1-3", "3-5", "5+"], right=False)
print(h["kidem"].value_counts().sort_index().to_dict())
print(h.groupby("account_type")["limit_eksik"].mean().round(2).to_dict())
</pre>

<h2>Özellik seçimi</h2>
<p>Her yeni sütun bir maliyettir: canlıda hesaplanması, izlenmesi, bozulduğunda hata ayıklanması gerekir. Seçim için dört katman:</p>
<ol>
<li><b>Varyans:</b> hep aynı değeri alan sütun bilgi taşımaz (<code>VarianceThreshold</code>).</li>
<li><b>Korelasyon:</b> |r| &gt; 0.95 olan iki sütundan birini at; doğrusal modelde katsayıları kararsızlaştırır.</li>
<li><b>Model tabanlı:</b> L1 (Lasso) katsayısı sıfır olanlar, ağaç önemleri (<code>SelectFromModel</code>).</li>
<li><b>Permutation importance:</b> doğrulama setinde bir sütunu karıştırınca skor ne kadar düşüyor? Model bağımsızdır ve en güvenilir ölçüdür; ama birbirine çok bağlı iki sütun birbirinin önemini "saklar".</li>
</ol>

<h2>Pipeline'a gömmek: FunctionTransformer ve özel dönüştürücü</h2>
<p>Özellik kodun not defterinde kalırsa canlıda başka türlü yazılır ve <b>eğitim-servis çarpıklığı</b> (training-serving skew) doğar. Çözüm, dönüşümü Pipeline'ın parçası yapmak. Durumsuz (veriden bir şey öğrenmeyen) dönüşümler için <code>FunctionTransformer</code> yeter. Eğitimden bir şey öğrenen dönüşüm (ör. kırpma sınırları) için <code>BaseEstimator</code> ve <code>TransformerMixin</code>'den türeyen bir sınıf yazarsın: <code>fit</code> öğrenir ve <code>self</code> döndürür, <code>transform</code> uygular.</p>
<pre class="py">from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import FunctionTransformer, StandardScaler
from sklearn.linear_model import LogisticRegression

class Kirpici(BaseEstimator, TransformerMixin):
    def __init__(self, ust=0.99):
        self.ust = ust
    def fit(self, X, y=None):
        self.sinir_ = np.quantile(np.asarray(X, dtype=float), self.ust, axis=0)
        return self
    def transform(self, X):
        return np.minimum(np.asarray(X, dtype=float), self.sinir_)

model = make_pipeline(Kirpici(0.99), FunctionTransformer(np.log1p), StandardScaler(),
                      LogisticRegression(max_iter=1000))
X = ozet[["kart", "maas"]]
y = (ozet["kart"] &gt; ozet["kart"].median()).astype(int)
model.fit(X, y)
print("öğrenilen sınırlar:", model[0].sinir_.round(0))
</pre>
<div class="note"><b>Gerçek işte</b>Bankalarda model ekipleri genellikle "özellik sözlüğü" tutar: her özelliğin adı, tanımı, hangi tablodan, hangi zaman penceresiyle ve hangi kesim tarihine göre hesaplandığı. Denetim (model risk yönetimi) bir skoru sorguladığında bu sözlüğe bakılır. Büyük ekiplerde aynı tanımlar bir <b>özellik deposunda</b> (feature store: Feast, Tecton, Databricks) saklanır ki eğitim ve canlı aynı kodu kullansın.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Kesim tarihi (cutoff) disiplini</h3>
<p>Müşteri düzeyindeki her özellik bir <b>kesim tarihine</b> göre hesaplanır: "1 Temmuz'a kadar olan işlemler." Hedef ise kesimden sonraki pencereden gelir: "Temmuz–Aralık kart harcaması." Bu derste mini projede tam olarak bunu yapacaksın. Birden fazla kesim tarihi (her ay başı) üretip satırları üst üste koymak veri setini büyütür ve modeli zamana karşı sağlamlaştırır; bu durumda doğrulama da zamana göre yapılmalı.</p>
<h3>Otomatik özellik üretimi ne zaman?</h3>
<p>featuretools gibi kütüphaneler ilişkili tablolardan yüzlerce toplam özelliği otomatik üretir. Hızlı bir taban çizgi için iyidir ama çoğu özellik gürültüdür ve canlı bakımı pahalıdır. Kıdemli bir veri bilimci önce iş hipotezinden (ör. "maaşı yatmayan müşteri ayrılmaya yakındır") özellik türetir, sonra seçimle sadeleştirir.</p>
<h3>Mülakat cümlesi</h3>
<p>"Özellik mühendisliğinde ilk sorum şudur: bu bilgi tahmin anında elimde olacak mı? Hedef kodlamayı katlar dışında, grup ortalamalarını yalnız geçmişle, ölçek ve kodlamaları Pipeline içinde fit ederim."</p>
</section>`,
  ex: [
    {
      t: 'mc',
      stage: 'Isınma',
      q: 'Bir müşteriye ait 20 işlemin tutar ortalamasını <code>groupby("account_id")["amount"].transform("mean")</code> ile hesaplayıp her işlemin "hesap ortalaması" özelliği yaptın. Dolandırıcılık modeli testte çok iyi, canlıda kötü. En olası neden?',
      o: [
        'groupby yerine agg ile tek satıra indirip sonra merge etmek gerekirdi',
        'Ortalama, işlemden sonraki işlemleri de içeriyor: geleceği sızdırıyor',
        'Tutar sütunu ölçeklenmeden ortalaması alınamaz',
        'Uç değerlerden etkilenmemesi için ortalama yerine medyan kullanılmalıydı'
      ],
      a: 1,
      why: 'transform("mean") tüm satırları kullanır; işlem anında gelecekteki işlemleri bilemezsin. Doğrusu shift(1).expanding().mean() ile yalnız geçmişi kullanmaktır. Medyan ya da ölçek sızıntıyı çözmez.'
    },
    {
      t: 'mc',
      stage: 'Isınma',
      q: 'İşlem saatini (0–23) doğrusal bir modele tek sayı olarak verdin. Hangi sorun çıkar ve sin/cos kodlaması neyi çözer?',
      o: [
        '23 ile 0 sayıca uzak görünür; sin/cos ikisini çemberde yan yana koyar',
        'Saat tam sayı olduğu için model hata verir; sin/cos ondalığa çevirir',
        'Saat sütunu kategoriktir, sin/cos one-hot kodlamanın kısa yoludur',
        'Hiçbir sorun çıkmaz; sin/cos kodlaması yalnız ağaç tabanlı modellerde gerekir'
      ],
      a: 0,
      why: 'Döngüsel değişkenlerde uç değerler komşudur. sin(2π·saat/24) ve cos(2π·saat/24) çifti her saati çember üzerinde bir noktaya koyar; 23 ile 0 arasındaki uzaklık 1 ile 2 arasındaki kadar olur. Ağaç modelleri eşikle bölebildiği için buna daha az ihtiyaç duyar.'
    },
    {
      t: 'mc',
      stage: 'Isınma',
      q: '5 bin farklı işyeri kimliği olan bir sütunu hedef kodlama (target encoding) ile sayıya çevireceksin. Doğru yaklaşım hangisi?',
      o: [
        'Tüm veride işyeri başına hedef ortalamasını hesapla, sonra train/test böl',
        'One-hot kodla; 5 bin sütun modern bilgisayar için sorun değil',
        'Katlar dışı (out-of-fold) hesapla ve az gözlemli değerleri genel ortalamaya yumuşat',
        'Yalnız test setinde hesapla ki eğitim kirlenmesin'
      ],
      a: 2,
      why: 'Tüm veride hesaplamak satırın kendi hedefini özelliğe koyar (sızıntı) ve tek işlemli işyerlerinde kod = hedef olur. Katlar dışı hesap her satırı görmediği verilerle kodlar; yumuşatma nadir değerlerin aşırı uç kodlar almasını engeller.'
    },
    {
      t: 'predict',
      stage: 'Kodu oku',
      q: 'Döngüsel saat kodlaması ne yazdırır?',
      code: 'import numpy as np\n\nfor saat in [0, 6, 23]:\n    s = round(float(np.sin(2 * np.pi * saat / 24)), 2)\n    c = round(float(np.cos(2 * np.pi * saat / 24)), 2)\n    print(saat, s, c)\n',
      o: ['0 0.0 1.0\n6 1.0 0.0\n23 -0.26 0.97', '0 0.0 1.0\n6 0.5 0.87\n23 -0.26 0.97', '0 1.0 0.0\n6 0.0 1.0\n23 0.97 -0.26', '0 0.0 1.0\n6 1.0 0.0\n23 0.26 -0.97'],
      a: 0,
      why: 'Saat 6 çemberin çeyreğidir (π/2): sin 1, cos 0. Saat 23, 0\'a çok yakın olduğu için cos yine 1\'e yakın (0.97), sin ise küçük ve negatif (-0.26). Böylece 23 ile 0 çember üzerinde komşu olur.'
    },
    {
      t: 'predict',
      stage: 'Kodu oku',
      q: 'Sızıntısız geçmiş ortalaması ne yazdırır?',
      code: 'import pandas as pd\n\ndf = pd.DataFrame({"hesap": ["A", "A", "A", "B", "B"],\n                   "tutar": [100, 300, 200, 50, 150]})\ndf["gecmis"] = df.groupby("hesap")["tutar"].transform(lambda s: s.shift(1).expanding().mean())\nprint(df["gecmis"].tolist())\n',
      o: ['[100.0, 200.0, 200.0, 50.0, 100.0]', '[nan, 100.0, 200.0, nan, 50.0]', '[nan, 100.0, 200.0, 200.0, 50.0]', '[200.0, 200.0, 200.0, 100.0, 100.0]'],
      a: 1,
      why: 'shift(1) her grubun ilk satırını boşaltır ve geri kalanları bir aşağı kaydırır; expanding().mean() o ana kadarki ortalamayı alır. A için: ilk işlemde geçmiş yok (nan), ikincide 100, üçüncüde (100+300)/2=200. Kaydırma grup içinde yapıldığı için B\'nin ilk satırı A\'dan değer almaz. Dördüncü şık tüm grup ortalamasıdır: sızıntılı sürüm.'
    },
    {
      t: 'predict',
      stage: 'Kodu oku',
      q: 'Frekans kodlaması ne yazdırır?',
      code: 'import pandas as pd\n\negitim = pd.Series(["İzmir", "Ankara", "İzmir", "Bursa", "İzmir", "Ankara"])\ntest = pd.Series(["Ankara", "Van", "İzmir"])\nfrek = egitim.value_counts(normalize=True)\nprint(test.map(frek).fillna(0).round(2).tolist())\n',
      o: ['[0.33, 0.0, 0.5]', '[2, 0, 3]', '[0.33, nan, 0.5]', '[0.67, 0.0, 0.5]'],
      a: 0,
      why: 'normalize=True oranları verir: İzmir 3/6=0.5, Ankara 2/6≈0.33. Eğitimde olmayan Van map ile NaN olur, fillna(0) onu 0.0 yapar. normalize olmasaydı sayılar (2, 3) gelirdi.'
    },
    {
      t: 'order',
      stage: 'Kodu oku',
      q: '<p>Tutarı önce <code>log1p</code> ile sıkıştıran, sonra ölçekleyip doğrusal regresyon eğiten pipeline\'ı kurup skorunu yazdıran programın satırlarını sırala.</p>',
      lines: [
        'import numpy as np',
        'from sklearn import linear_model, pipeline, preprocessing',
        'X = np.array([[9.0], [99.0], [999.0], [9999.0]])',
        'y = np.log10(X + 1).ravel()',
        'model = pipeline.make_pipeline(preprocessing.FunctionTransformer(np.log1p), preprocessing.StandardScaler(), linear_model.LinearRegression()).fit(X, y)',
        'tahmin = model.predict(X)',
        'print(np.round(tahmin, 2).tolist())'
      ],
      expect: '[1.0, 2.0, 3.0, 4.0]',
      hint: 'İçe aktarmalar en üstte (numpy, sonra sklearn). Ardından her satır bir öncekinin ürettiği adı kullanır: X → y → model → tahmin → çıktı.',
      why: 'log1p(9)=ln(10), log1p(99)=ln(100)... dönüşümden sonra özellik hedefle (log10) tam doğrusal olur; tahminler hedefin kendisi çıkar. FunctionTransformer durumsuzdur; fit sırasında bir şey öğrenmez ama Pipeline\'ın parçası olduğu için canlıda da aynen uygulanır.'
    },
    {
      t: 'code',
      stage: 'Rehberli',
      id: 'ozellik-muhendisligi-1',
      diff: 1,
      needs: ['pandas'],
      q: '<p><b>Ilgaz Bank dolandırıcılık ekibi</b> işlemlerin zaman desenini modele vermek istiyor. <code>tarih_ozellikleri(df)</code> fonksiyonunu yaz: <code>txn_time</code> (datetime) sütunlu tablonun <b>kopyasına</b> şu sütunları eklesin ve kopyayı döndürsün:</p><ul><li><code>saat</code>: 0–23</li><li><code>gun</code>: haftanın günü (0 = Pazartesi)</li><li><code>haftasonu</code>: Cumartesi/Pazar ise 1, değilse 0 (int)</li><li><code>saat_sin</code>, <code>saat_cos</code>: <code>sin/cos(2π·saat/24)</code>, 4 basamağa yuvarlanmış</li></ul><p>Veri: <code>veri.oku("ilgaz_bank", "bank_txns", ...)</code> (start kodunda hazır).</p>',
      guide: [
        'df.copy() ile kopya al; orijinali değiştirme.',
        '.dt.hour ve .dt.dayofweek ile saat ve günü çıkar.',
        'haftasonu: (gun &gt;= 5).astype(int).',
        'np.sin / np.cos ile döngüsel kodla, .round(4) uygula.',
        'Kopyayı döndür.'
      ],
      example: 'import numpy as np\nimport pandas as pd\n\n# Benzer teknik: ay (1-12) da döngüseldir\ns = pd.Series(pd.to_datetime(["2024-01-15", "2024-07-01", "2024-12-31"]))\nay = s.dt.month\nprint(np.sin(2 * np.pi * ay / 12).round(3).tolist())\n',
      start: 'import numpy as np\nimport veri\n\nislem = veri.oku("ilgaz_bank", "bank_txns", usecols=["txn_id", "txn_time", "amount"], parse_dates=["txn_time"])\n\n\ndef tarih_ozellikleri(df):\n    df = df.copy()\n    # TODO 1: saat ve gun sütunları\n    # TODO 2: haftasonu (int)\n    # TODO 3: saat_sin, saat_cos (4 basamak)\n    return df\n',
      sol: 'import numpy as np\nimport veri\n\nislem = veri.oku("ilgaz_bank", "bank_txns", usecols=["txn_id", "txn_time", "amount"], parse_dates=["txn_time"])\n\n\ndef tarih_ozellikleri(df):\n    df = df.copy()\n    df["saat"] = df["txn_time"].dt.hour\n    df["gun"] = df["txn_time"].dt.dayofweek\n    df["haftasonu"] = (df["gun"] >= 5).astype(int)\n    df["saat_sin"] = np.sin(2 * np.pi * df["saat"] / 24).round(4)\n    df["saat_cos"] = np.cos(2 * np.pi * df["saat"] / 24).round(4)\n    return df\n\n\nprint(tarih_ozellikleri(islem).head(3))\n',
      tests: 'r = tarih_ozellikleri(islem)\nassert "saat" not in islem.columns, "Orijinal tablo değişmemeli: önce df.copy() al"\nfor c in ["saat", "gun", "haftasonu", "saat_sin", "saat_cos"]:\n    assert c in r.columns, f"{c} sütunu eksik"\nilk = r.iloc[0]\nassert ilk["saat"] == 7 and ilk["gun"] == 0 and ilk["haftasonu"] == 0, "İlk işlem 2024-01-01 07:05 (Pazartesi): saat 7, gun 0, haftasonu 0"\nassert ilk["saat_sin"] == 0.9659 and ilk["saat_cos"] == -0.2588, f"Saat 7 için sin 0.9659, cos -0.2588 olmalı; gelen {ilk[\'saat_sin\']}, {ilk[\'saat_cos\']}"\nassert round(r["haftasonu"].mean(), 4) == 0.2846, f"İşlemlerin %28.46\'sı hafta sonunda; gelen {r[\'haftasonu\'].mean():.4f}"\nassert str(r["haftasonu"].dtype).startswith("int"), "haftasonu 0/1 tam sayı olmalı (astype(int))"\n',
      hints: [
        'Datetime sütunun .dt erişimcisi saat ve gün parçalarını verir.',
        'Hafta sonu Cumartesi (5) ve Pazar (6): (df["gun"] &gt;= 5).astype(int)',
        'df["saat_sin"] = np.sin(2 * np.pi * df["saat"] / 24).round(4)'
      ],
      why: 'Zaman damgası tek başına modele anlam taşımaz; parçalara ayırınca model "gece 3\'te yapılan yüksek tutarlı işlem" gibi desenleri yakalar. Kopya üzerinde çalışmak, aynı DataFrame\'i başka hücrelerde kullanırken sürpriz yan etkileri önler.'
    },
    {
      t: 'code',
      stage: 'Rehberli',
      id: 'ozellik-muhendisligi-2',
      diff: 2,
      needs: ['pandas'],
      q: '<p><b>Kampanya modeli için müşteri özellikleri.</b> <code>musteri_ozet(islem, hesap, kesim)</code> fonksiyonunu yaz. Yalnız <code>txn_time &lt; kesim</code> olan işlemleri kullan (sızıntı yok!), hesapları <code>customer_id</code>\'ye bağla ve müşteri başına (index: <code>customer_id</code>) şu sütunlu DataFrame döndür:</p><ul><li><code>islem_sayisi</code>: işlem adedi</li><li><code>kart_toplam</code>: <code>kart_harcama</code> türündeki tutarların toplamının mutlak değeri (hiç kart harcaması yoksa 0)</li><li><code>ort_tutar</code>: tutarların <b>mutlak değerlerinin</b> ortalaması</li><li><code>son_islem_gun</code>: kesim ile son işlem arasındaki gün sayısı (recency)</li></ul><p>Tüm değerleri 2 basamağa yuvarla.</p>',
      guide: [
        'Önce kesimden önceki işlemleri süz.',
        'merge ile hesap tablosundan customer_id ekle.',
        'groupby("customer_id") ile size, max zaman; kart işlemleri için ayrı groupby.',
        'pd.DataFrame({...}) ile birleştir; kart_toplam boşlarını 0 yap.',
        '.round(2) ile döndür.'
      ],
      example: 'import pandas as pd\n\n# Benzer teknik: sipariş tablosundan müşteri özeti (recency + toplam)\nsip = pd.DataFrame({"musteri": [1, 1, 2], "tarih": pd.to_datetime(["2024-03-01", "2024-03-20", "2024-02-10"]), "tutar": [100, 50, 80]})\nkesim = pd.Timestamp("2024-04-01")\ng = sip[sip["tarih"] < kesim].groupby("musteri")\nprint(pd.DataFrame({"adet": g.size(), "toplam": g["tutar"].sum(), "recency": (kesim - g["tarih"].max()).dt.days}))\n',
      start: 'import pandas as pd\nimport veri\n\nislem = veri.oku("ilgaz_bank", "bank_txns", usecols=["account_id", "txn_time", "amount", "txn_type"], parse_dates=["txn_time"])\nhesap = veri.oku("ilgaz_bank", "bank_accounts")\nKESIM = pd.Timestamp("2024-07-01")\n\n\ndef musteri_ozet(islem, hesap, kesim):\n    # TODO 1: kesimden önceki işlemler + customer_id\n    d = islem\n    # TODO 2: groupby ile dört özellik\n    oz = pd.DataFrame()\n    return oz\n',
      sol: 'import pandas as pd\nimport veri\n\nislem = veri.oku("ilgaz_bank", "bank_txns", usecols=["account_id", "txn_time", "amount", "txn_type"], parse_dates=["txn_time"])\nhesap = veri.oku("ilgaz_bank", "bank_accounts")\nKESIM = pd.Timestamp("2024-07-01")\n\n\ndef musteri_ozet(islem, hesap, kesim):\n    d = islem[islem["txn_time"] < kesim].merge(hesap[["account_id", "customer_id"]], on="account_id")\n    g = d.groupby("customer_id")\n    kart = d[d["txn_type"] == "kart_harcama"]\n    oz = pd.DataFrame({\n        "islem_sayisi": g.size(),\n        "kart_toplam": kart.groupby("customer_id")["amount"].sum().abs(),\n        "ort_tutar": d["amount"].abs().groupby(d["customer_id"]).mean(),\n        "son_islem_gun": (kesim - g["txn_time"].max()).dt.days,\n    })\n    oz["kart_toplam"] = oz["kart_toplam"].fillna(0)\n    return oz.round(2)\n\n\nprint(musteri_ozet(islem, hesap, KESIM).head())\n',
      tests: 'oz = musteri_ozet(islem, hesap, KESIM)\nassert set(["islem_sayisi", "kart_toplam", "ort_tutar", "son_islem_gun"]) <= set(oz.columns), "Dört sütun da olmalı"\nassert len(oz) == 471, f"Kesimden önce işlemi olan 471 müşteri var; gelen {len(oz)}"\nassert oz.loc[1, "islem_sayisi"] == 31 and oz.loc[2, "islem_sayisi"] == 65, "Müşteri 1: 31, müşteri 2: 65 işlem (yalnız Temmuz öncesi)"\nassert abs(oz.loc[2, "kart_toplam"] - 166374.12) < 0.01, f"Müşteri 2 kart toplamı 166374.12 olmalı (mutlak değer); gelen {oz.loc[2, \'kart_toplam\']}"\nassert abs(oz.loc[3, "ort_tutar"] - 11369.35) < 0.01, f"Müşteri 3 ort_tutar 11369.35 (mutlak değerlerin ortalaması); gelen {oz.loc[3, \'ort_tutar\']}"\nassert oz["son_islem_gun"].max() == 164, "En uzun recency 164 gün olmalı"\nassert oz["kart_toplam"].isna().sum() == 0, "Kart harcaması olmayan müşteride 0 olmalı, NaN değil"\nassert abs(oz["kart_toplam"].mean() - 68944.67) < 0.05, "Kart toplamı ortalaması tutmuyor: kesim sonrası işlemleri dışladın mı?"\n',
      hints: [
        'Sızıntıyı önlemek için ilk satır: islem[islem["txn_time"] &lt; kesim]',
        'Mutlak değerlerin ortalaması: d["amount"].abs().groupby(d["customer_id"]).mean()',
        'Recency: (kesim - g["txn_time"].max()).dt.days'
      ],
      why: 'Bu, RFM (recency, frequency, monetary) özelliklerinin bankacılık sürümüdür. Kesim tarihi her özelliğin "o gün ne biliyordum?" sorusuna göre hesaplanmasını garanti eder; hedef kesimden sonraki pencereden gelir. Kart harcaması olmayan müşteri için NaN değil 0 yazmak gerçeği yansıtır: harcama yoktur.'
    },
    {
      t: 'code',
      stage: 'Rehberli',
      id: 'ozellik-muhendisligi-3',
      diff: 2,
      needs: ['pandas'],
      q: '<p><code>gecmis_ozellikler(df)</code> fonksiyonunu yaz. <code>df</code>\'te <code>account_id</code>, <code>txn_time</code>, <code>amount</code> var (sırasız olabilir). Fonksiyon önce <code>account_id</code> ve <code>txn_time</code>\'a göre sıralasın (index sıfırlansın), sonra hesap içinde <b>yalnız geçmiş</b> işlemlerle iki sütun eklesin:</p><ul><li><code>gecmis_ort</code>: önceki tüm işlemlerin tutar ortalaması (ilk işlemde NaN)</li><li><code>sapma</code>: <code>amount - gecmis_ort</code></li></ul><p>Son olarak gerçek veride kaç satırda <code>gecmis_ort</code> boş kalıyor, bul.</p>',
      guide: [
        'sort_values(["account_id", "txn_time"]).reset_index(drop=True)',
        'groupby("account_id")["amount"].transform(lambda s: ...)',
        'Lambda içinde önce shift(1), sonra expanding().mean()',
        'sapma = amount - gecmis_ort'
      ],
      example: 'import pandas as pd\n\n# Benzer teknik: mağaza bazında önceki günlerin ortalaması\ns = pd.DataFrame({"magaza": ["X", "X", "Y", "X"], "satis": [10, 20, 5, 30]})\ns["onceki_ort"] = s.groupby("magaza")["satis"].transform(lambda x: x.shift(1).expanding().mean())\nprint(s)\n',
      start: 'import pandas as pd\nimport veri\n\nislem = veri.oku("ilgaz_bank", "bank_txns", usecols=["account_id", "txn_time", "amount"], parse_dates=["txn_time"])\n\n\ndef gecmis_ozellikler(df):\n    df = df.sort_values(["account_id", "txn_time"]).reset_index(drop=True)\n    # TODO 1: gecmis_ort (shift + expanding)\n    # TODO 2: sapma\n    return df\n',
      sol: 'import pandas as pd\nimport veri\n\nislem = veri.oku("ilgaz_bank", "bank_txns", usecols=["account_id", "txn_time", "amount"], parse_dates=["txn_time"])\n\n\ndef gecmis_ozellikler(df):\n    df = df.sort_values(["account_id", "txn_time"]).reset_index(drop=True)\n    df["gecmis_ort"] = df.groupby("account_id")["amount"].transform(lambda s: s.shift(1).expanding().mean())\n    df["sapma"] = df["amount"] - df["gecmis_ort"]\n    return df\n\n\nr = gecmis_ozellikler(islem)\nprint(r["gecmis_ort"].isna().sum())\n',
      tests: 'k = pd.DataFrame({"account_id": [2, 1, 1, 1, 2], "txn_time": pd.to_datetime(["2024-01-02", "2024-01-03", "2024-01-01", "2024-01-02", "2024-01-01"]), "amount": [40.0, 30.0, 10.0, 20.0, 60.0]})\nr = gecmis_ozellikler(k)\nassert r["account_id"].tolist() == [1, 1, 1, 2, 2], "Önce hesap, sonra zamana göre sırala"\ng = r["gecmis_ort"].tolist()\nassert pd.isna(g[0]) and g[1:3] == [10.0, 15.0] and pd.isna(g[3]) and g[4] == 60.0, f"Geçmiş ortalama yanlış: {g}. İlk işlem NaN, sonra yalnız ÖNCEKİLER"\nassert r["sapma"].tolist()[2] == 15.0, "Hesap 1 üçüncü işlem: 30 - 15 = 15"\ngr = gecmis_ozellikler(islem)\nassert gr["gecmis_ort"].isna().sum() == 778, f"Gerçek veride her hesabın ilk işlemi (778 hesap) NaN olmalı; gelen {gr[\'gecmis_ort\'].isna().sum()}"\n',
      hints: [
        'Grup içi kaydırma: transform(lambda s: s.shift(1)...)',
        's.shift(1).expanding().mean() ilk satırı NaN bırakır, sonrakiler önceki değerlerin ortalamasıdır.',
        'df["sapma"] = df["amount"] - df["gecmis_ort"]'
      ],
      why: 'Hesabın "normal"inden sapma dolandırıcılık tespitinde en güçlü sinyallerden biridir. shift(1) olmadan ortalama işlemin kendisini içerir (sızıntı), transform("mean") ise geleceği de içerir. Sıralamayı fonksiyonun içinde yapmak, çağıranın sırasız veri vermesine karşı güvencedir.'
    },
    {
      t: 'code',
      stage: 'Rehberli',
      id: 'ozellik-muhendisligi-4',
      diff: 2,
      needs: ['pandas'],
      q: '<p><code>frekans_kodla(egitim, test)</code> fonksiyonunu yaz: iki pandas Series (kategori) alsın, frekansları <b>yalnız eğitimden</b> öğrensin (oran, <code>normalize=True</code>) ve <code>(egitim_kod, test_kod)</code> ikilisini döndürsün. Eğitimde görülmeyen kategori 0.0 almalı. Değerleri 4 basamağa yuvarla.</p><p>Gerçek veri: Ilgaz Bank müşterilerinden <code>customer_id &lt;= 350</code> eğitim, gerisi test; sütun <code>city</code>.</p>',
      guide: [
        'egitim.value_counts(normalize=True) ile oranları sözlük gibi kullan.',
        'Her iki seriyi de .map(frek) ile çevir.',
        'Testteki bilinmeyenler NaN olur: fillna(0.0).',
        '.round(4) ve ikiliyi döndür.'
      ],
      example: 'import pandas as pd\n\n# Benzer teknik: ürün kategorisi frekansı\nkat = pd.Series(["giyim", "market", "giyim", "elektronik"])\nf = kat.value_counts(normalize=True)\nprint(pd.Series(["market", "oyuncak"]).map(f).fillna(0.0).tolist())\n',
      start: 'import pandas as pd\nimport veri\n\nmusteri = veri.oku("ilgaz_bank", "bank_customers")\negt = musteri[musteri["customer_id"] <= 350]["city"]\ntst = musteri[musteri["customer_id"] > 350]["city"]\n\n\ndef frekans_kodla(egitim, test):\n    # TODO 1: frekansları eğitimden öğren\n    # TODO 2: iki seriyi map\'le, bilinmeyeni 0 yap, 4 basamak\n    return egitim, test\n',
      sol: 'import pandas as pd\nimport veri\n\nmusteri = veri.oku("ilgaz_bank", "bank_customers")\negt = musteri[musteri["customer_id"] <= 350]["city"]\ntst = musteri[musteri["customer_id"] > 350]["city"]\n\n\ndef frekans_kodla(egitim, test):\n    frek = egitim.value_counts(normalize=True)\n    return egitim.map(frek).round(4), test.map(frek).fillna(0.0).round(4)\n\n\na, b = frekans_kodla(egt, tst)\nprint(a.head(3).tolist(), b.head(3).tolist())\n',
      tests: 'a, b = frekans_kodla(egt, tst)\nassert len(a) == 350 and len(b) == 150, "Uzunluklar giriş serileriyle aynı kalmalı"\nassert a[egt == "İstanbul"].iloc[0] == 0.42, "Eğitimde İstanbul oranı 147/350 = 0.42"\nassert b[tst == "İstanbul"].iloc[0] == 0.42, "Testteki İstanbul da EĞİTİM oranıyla (0.42) kodlanmalı; testin kendi oranıyla değil"\nassert b[tst == "Ankara"].iloc[0] == 0.1514, "Ankara eğitim oranı 0.1514"\nassert b.isna().sum() == 0, "Testte NaN kalmamalı"\nx, y = frekans_kodla(pd.Series(["a", "a", "b", "c"]), pd.Series(["c", "z"]))\nassert y.tolist() == [0.25, 0.0], f"Görülmeyen kategori 0.0 almalı; gelen {y.tolist()}"\n',
      hints: [
        'Oranlar: frek = egitim.value_counts(normalize=True)',
        'Series.map(frek) sözlük gibi çalışır; bilinmeyen anahtar NaN verir.',
        'return egitim.map(frek).round(4), test.map(frek).fillna(0.0).round(4)'
      ],
      why: 'Frekans kodlama hedefi kullanmadığı için sızıntı riski taşımaz ve tek sütunda kalır. Ama dönüşüm de bir "fit"tir: oranlar eğitimden öğrenilir, test aynı tabloyla çevrilir. Canlıda yeni bir şehir (Van) gelirse 0 alır; hata vermez.'
    },
    {
      t: 'code',
      stage: 'Kendin yaz',
      id: 'ozellik-muhendisligi-5',
      diff: 2,
      needs: ['pandas'],
      q: '<p><b>Aylık kart harcaması tahmini için lag özellikleri.</b> İki fonksiyon yaz:</p><ol><li><code>aylik_genis(islem)</code>: yalnız <code>kart_harcama</code> işlemlerinden hesap × ay (1–12) tablosu kursun: index <code>account_id</code>, sütunlar ay numaraları, değerler tutar toplamının mutlak değeri (2 basamak), harcama olmayan ay <b>0</b>.</li><li><code>lag_tablosu(genis, ay)</code>: verilen hedef ay için <code>lag1</code> (bir önceki ay), <code>lag2</code>, <code>ort3</code> (önceki 3 ayın ortalaması, 2 basamak) ve <code>hedef</code> (o ayın kendisi) sütunlu DataFrame döndürsün.</li></ol>',
      start: 'import pandas as pd\nimport veri\n\nislem = veri.oku("ilgaz_bank", "bank_txns", usecols=["account_id", "txn_time", "amount", "txn_type"], parse_dates=["txn_time"])\n\n\ndef aylik_genis(islem):\n    pass\n\n\ndef lag_tablosu(genis, ay):\n    pass\n',
      sol: 'import pandas as pd\nimport veri\n\nislem = veri.oku("ilgaz_bank", "bank_txns", usecols=["account_id", "txn_time", "amount", "txn_type"], parse_dates=["txn_time"])\n\n\ndef aylik_genis(islem):\n    kart = islem[islem["txn_type"] == "kart_harcama"]\n    return (kart.assign(ay=kart["txn_time"].dt.month)\n                .groupby(["account_id", "ay"])["amount"].sum().abs()\n                .unstack(fill_value=0).round(2))\n\n\ndef lag_tablosu(genis, ay):\n    return pd.DataFrame({\n        "lag1": genis[ay - 1],\n        "lag2": genis[ay - 2],\n        "ort3": genis[[ay - 3, ay - 2, ay - 1]].mean(axis=1).round(2),\n        "hedef": genis[ay],\n    })\n\n\ng = aylik_genis(islem)\nprint(g.shape)\nprint(lag_tablosu(g, 6).head(3))\n',
      tests: 'g = aylik_genis(islem)\nassert g.shape == (658, 12), f"658 hesap × 12 ay olmalı; gelen {g.shape}"\nassert list(g.columns) == list(range(1, 13)), "Sütunlar 1..12 ay numaraları olmalı"\nassert abs(g.loc[100001, 1] - 11464.17) < 0.01, "Hesap 100001, Ocak: 11464.17"\nassert (g == 0).sum().sum() == 555, "Harcamasız hesap-ay sayısı 555 olmalı: unstack(fill_value=0) ile 0 yaz"\nt = lag_tablosu(g, 6)\nassert list(t.columns) == ["lag1", "lag2", "ort3", "hedef"], "Sütun sırası: lag1, lag2, ort3, hedef"\nr0 = t.loc[100001]\nassert r0["lag1"] == g.loc[100001, 5] and r0["lag2"] == g.loc[100001, 4] and r0["hedef"] == g.loc[100001, 6], "lag1 = önceki ay, lag2 = iki önceki ay, hedef = o ay"\nassert abs(r0["ort3"] - round(g.loc[100001, [3, 4, 5]].mean(), 2)) < 0.01, "ort3 yalnız ÖNCEKİ 3 ayı (3, 4, 5) kapsamalı; hedef ayı içermemeli"\n',
      hints: [
        'assign(ay=...dt.month) → groupby(["account_id", "ay"]) → sum → abs → unstack(fill_value=0)',
        'Geniş tabloda lag bir sütun seçimidir: genis[ay - 1]',
        'ort3: genis[[ay - 3, ay - 2, ay - 1]].mean(axis=1)'
      ],
      why: 'Geniş biçim takvimi otomatik tamamlar: harcamanın olmadığı ay satırı kaybolmaz, 0 olur. Uzun biçimde groupby().shift(1) kullansaydın, boş ayı olan hesapta "bir önceki satır" iki ay öncesi olurdu. Hedef ayı ort3\'e katmak en sinsi sızıntılardan biridir.'
    },
    {
      t: 'code',
      stage: 'Kendin yaz',
      id: 'ozellik-muhendisligi-6',
      diff: 3,
      needs: ['pandas'],
      q: '<p><code>hedef_kodla_oof(kat, y, m=10)</code> fonksiyonunu yaz: <b>katlar dışı</b> ve <b>yumuşatılmış</b> hedef kodlama yapsın ve numpy dizisi döndürsün.</p><ul><li><code>KFold(n_splits=5, shuffle=True, random_state=0)</code> ile böl.</li><li>Her katta yalnız eğitim kısmından: genel ortalama <code>g</code>, kategori başına toplam ve adet; kod = <code>(toplam + m·g) / (adet + m)</code>.</li><li>Doğrulama kısmını bu kodlarla çevir; eğitim kısmında görülmeyen kategori <code>g</code> alsın.</li><li>Sonucu 4 basamağa yuvarla.</li></ul><p><code>kat</code> ve <code>y</code> aynı index\'li pandas Series.</p>',
      start: 'import numpy as np\nimport pandas as pd\nfrom sklearn.model_selection import KFold\n\n\ndef hedef_kodla_oof(kat, y, m=10):\n    pass\n',
      sol: 'import numpy as np\nimport pandas as pd\nfrom sklearn.model_selection import KFold\n\n\ndef hedef_kodla_oof(kat, y, m=10):\n    sonuc = np.zeros(len(kat))\n    for egt, dog in KFold(n_splits=5, shuffle=True, random_state=0).split(kat):\n        g = y.iloc[egt].mean()\n        istat = y.iloc[egt].groupby(kat.iloc[egt]).agg(["sum", "count"])\n        kod = (istat["sum"] + m * g) / (istat["count"] + m)\n        sonuc[dog] = kat.iloc[dog].map(kod).fillna(g).to_numpy()\n    return sonuc.round(4)\n\n\nk = pd.Series(list("aaaabbbbcc") * 2)\ny = pd.Series([1, 1, 1, 0, 0, 0, 0, 1, 1, 0] * 2)\nprint(hedef_kodla_oof(k, y, m=2))\n',
      tests: 'import veri\nk = pd.Series(list("aaaabbbbcc") * 2)\ny = pd.Series([1, 1, 1, 0, 0, 0, 0, 1, 1, 0] * 2)\nr = hedef_kodla_oof(k, y, m=2)\nassert isinstance(r, np.ndarray) and len(r) == 20, "Uzunluğu 20 olan numpy dizisi dönmeli"\negt, dog = next(iter(KFold(n_splits=5, shuffle=True, random_state=0).split(k)))\ng = y.iloc[egt].mean(); a = y.iloc[egt][k.iloc[egt] == "a"]\nbek = round((a.sum() + 2 * g) / (len(a) + 2), 4)\ni = [j for j in dog if k.iloc[j] == "a"][0]\nassert abs(r[i] - bek) < 1e-4, f"İlk kattaki bir \'a\' satırı {bek} olmalı (yalnız eğitim kısmının istatistiği + yumuşatma); gelen {r[i]}"\ntam = y.groupby(k).mean()\nassert not np.allclose(r, k.map(tam).to_numpy()), "Sonuç tüm veriyle hesaplanan ortalamaya eşit çıktı: katlar dışı hesaplamadın"\nmusteri = veri.oku("ilgaz_bank", "bank_customers")\nyy = (musteri["risk_score"] >= 8).astype(int)\nrr = hedef_kodla_oof(musteri["city"], yy)\nassert abs(rr.mean() - 0.2823) < 0.002, f"Gerçek veride ortalama kod ~0.2823 olmalı; gelen {rr.mean():.4f}"\nassert rr.min() > 0.15 and rr.max() < 0.5, "Yumuşatma (m=10) kodları genel ortalamaya yakın tutmalı"\n',
      hints: [
        'Döngü: for egt, dog in KFold(...).split(kat): ... sonuc[dog] = ...',
        'İstatistik: y.iloc[egt].groupby(kat.iloc[egt]).agg(["sum", "count"])',
        'Çeviri: kat.iloc[dog].map(kod).fillna(g).to_numpy()'
      ],
      why: 'Her satır, kendisini görmeyen dört katın istatistiğiyle kodlanır; böylece kod kendi hedefini içermez. m yumuşatması, 2 gözlemli bir kategoriye 1.0 gibi uç bir kod vermek yerine onu genel ortalamaya çeker. Testte ise tüm eğitim verisinin istatistiği kullanılır (sklearn TargetEncoder da böyle çalışır).'
    },
    {
      t: 'code',
      stage: 'Kendin yaz',
      id: 'ozellik-muhendisligi-7',
      diff: 2,
      needs: ['pandas'],
      q: '<p><code>hesap_ozellikleri(hesap, referans)</code> fonksiyonunu yaz (<code>hesap</code> = <code>bank_accounts</code>, <code>opened_date</code> datetime). Kopyaya şu sütunları ekleyip döndür:</p><ul><li><code>limit_eksik</code>: <code>credit_limit</code> boşsa 1, değilse 0 (int)</li><li><code>limit</code>: boşlar 0 ile doldurulmuş limit</li><li><code>kidem_yil</code>: <code>(referans - opened_date)</code> gün / 365, 2 basamak</li><li><code>kidem_grubu</code>: <code>pd.cut</code> ile <code>[0, 1, 3, 5, 100)</code> sınırları, etiketler <code>"0-1", "1-3", "3-5", "5+"</code>, sol kapalı (<code>right=False</code>). Kovalama yuvarlanmamış yıl üzerinden yapılsın.</li></ul>',
      start: 'import pandas as pd\nimport veri\n\nhesap = veri.oku("ilgaz_bank", "bank_accounts", parse_dates=["opened_date"])\nREF = pd.Timestamp("2025-01-01")\n\n\ndef hesap_ozellikleri(hesap, referans):\n    pass\n',
      sol: 'import pandas as pd\nimport veri\n\nhesap = veri.oku("ilgaz_bank", "bank_accounts", parse_dates=["opened_date"])\nREF = pd.Timestamp("2025-01-01")\n\n\ndef hesap_ozellikleri(hesap, referans):\n    h = hesap.copy()\n    h["limit_eksik"] = h["credit_limit"].isna().astype(int)\n    h["limit"] = h["credit_limit"].fillna(0)\n    yil = (referans - h["opened_date"]).dt.days / 365\n    h["kidem_yil"] = yil.round(2)\n    h["kidem_grubu"] = pd.cut(yil, bins=[0, 1, 3, 5, 100], labels=["0-1", "1-3", "3-5", "5+"], right=False)\n    return h\n\n\nprint(hesap_ozellikleri(hesap, REF)["kidem_grubu"].value_counts())\n',
      tests: 'h = hesap_ozellikleri(hesap, REF)\nassert "limit_eksik" not in hesap.columns, "Orijinal tabloyu değiştirme; kopya üzerinde çalış"\nassert h["limit_eksik"].sum() == 637, f"637 hesapta limit boş (kredi kartı olmayanlar); gelen {h[\'limit_eksik\'].sum()}"\nassert h["limit"].isna().sum() == 0, "limit sütununda boş kalmamalı"\nassert h.loc[h["account_type"] == "kredi_karti", "limit_eksik"].sum() == 0, "Kredi kartlarının hepsinde limit dolu olmalı"\nvc = h["kidem_grubu"].value_counts().to_dict()\nassert vc == {"5+": 474, "3-5": 148, "1-3": 137, "0-1": 90}, f"Kıdem grupları tutmuyor: {vc}"\nassert h["kidem_yil"].max() == 12.99, "En eski hesap 12.99 yıllık"\n',
      hints: [
        'Eksiklik bayrağını doldurmadan ÖNCE üret: isna().astype(int)',
        'Gün farkı: (referans - h["opened_date"]).dt.days / 365',
        'pd.cut(yil, bins=[0, 1, 3, 5, 100], labels=[...], right=False)'
      ],
      why: 'Önce bayrak, sonra doldurma: sıra ters olursa bilgi kaybolur. Bu veride limitin boş olması tesadüf değil, hesap türünün bir sonucudur; model "kart değil" bilgisini bayraktan alır. Kova sınırları iş kuralından (1, 3, 5 yıl) geldiği için test verisine bakılmadan sabitlenmiştir.'
    },
    {
      t: 'code',
      stage: 'Kendin yaz',
      id: 'ozellik-muhendisligi-8',
      diff: 2,
      needs: ['pandas'],
      q: '<p><code>ozellik_sec(X, varyans_esik=0.0, kor_esik=0.95)</code> fonksiyonunu yaz: sayısal DataFrame <code>X</code>\'ten tutulacak sütunların listesini döndürsün.</p><ol><li>Varyansı (<code>X.var()</code>) <code>varyans_esik</code>\'ten büyük olmayan sütunları at.</li><li>Kalanlarda, sütun sırasıyla gez: bir sütunun daha önce <b>tutulmuş</b> bir sütunla mutlak korelasyonu <code>kor_esik</code>\'ten büyükse onu at.</li></ol><p>Sıra korunmalı.</p>',
      start: 'import pandas as pd\nimport numpy as np\n\n\ndef ozellik_sec(X, varyans_esik=0.0, kor_esik=0.95):\n    pass\n',
      sol: 'import pandas as pd\nimport numpy as np\n\n\ndef ozellik_sec(X, varyans_esik=0.0, kor_esik=0.95):\n    adaylar = [c for c in X.columns if X[c].var() > varyans_esik]\n    kor = X[adaylar].corr().abs()\n    tut = []\n    for c in adaylar:\n        if all(kor.loc[c, t] <= kor_esik for t in tut):\n            tut.append(c)\n    return tut\n\n\nrng = np.random.default_rng(0)\na = rng.normal(size=100)\nX = pd.DataFrame({"a": a, "sabit": 1.0, "a_kopya": a * 2 + 0.01, "b": rng.normal(size=100)})\nprint(ozellik_sec(X))\n',
      tests: 'rng = np.random.default_rng(1)\na = rng.normal(size=200); b = rng.normal(size=200)\nX = pd.DataFrame({"sabit": 5.0, "a": a, "b": b, "a2": -3 * a + 1, "ab": a + b, "c": rng.normal(size=200)})\nassert ozellik_sec(X) == ["a", "b", "ab", "c"], f"Beklenen [\'a\', \'b\', \'ab\', \'c\']; gelen {ozellik_sec(X)}. sabit varyans 0, a2 a ile -1 korelasyonlu (mutlak değer!)"\nassert ozellik_sec(X, kor_esik=0.6) == ["a", "b", "c"], "Eşik 0.6 iken ab (a ile ~0.7) da atılmalı"\nY = pd.DataFrame({"x": [1, 1, 1, 2], "y": [0.0, 0.1, 0.0, 0.1]})\nassert ozellik_sec(Y, varyans_esik=0.1) == ["x"], "Varyans eşiği: y\'nin varyansı 0.0033, atılmalı"\n',
      hints: [
        'Önce varyans süzgeci: [c for c in X.columns if X[c].var() &gt; varyans_esik]',
        'Korelasyonun mutlak değerini al: X[adaylar].corr().abs()',
        'Yalnız tutulmuşlarla karşılaştır: all(kor.loc[c, t] &lt;= kor_esik for t in tut)'
      ],
      why: 'Mutlak değer şart: -1 korelasyon da aynı bilgiyi taşır. "Önceden tutulanlarla" karşılaştırmak, birbirine benzeyen üç sütundan yalnız ilkinin kalmasını sağlar; her çifti bağımsız değerlendirirsen ikisini birden atabilirsin. Bu basit süzgeçler model eğitmeden çalışır; ardından permutation importance gelir.'
    },
    {
      t: 'code',
      stage: 'Hata avı',
      id: 'ozellik-muhendisligi-9',
      diff: 2,
      kind: 'bug',
      needs: ['pandas'],
      q: '<p><b>Hatayı bul ve düzelt.</b> <code>son3_ort(df)</code> her işlem için aynı hesabın <b>önceki</b> en fazla 3 işleminin tutar ortalamasını vermeli (ilk işlemde NaN). Model doğrulamada şaşırtıcı derecede iyi çıktı; risk ekibi sızıntıdan şüpheleniyor. <code>df</code> zaten hesap ve zamana göre sıralı.</p>',
      start: 'import pandas as pd\n\n\ndef son3_ort(df):\n    return df.groupby("hesap")["tutar"].transform(lambda s: s.rolling(3, min_periods=1).mean())\n',
      sol: 'import pandas as pd\n\n\ndef son3_ort(df):\n    return df.groupby("hesap")["tutar"].transform(lambda s: s.shift(1).rolling(3, min_periods=1).mean())\n',
      tests: 'df = pd.DataFrame({"hesap": ["A"] * 5 + ["B"] * 2, "tutar": [10.0, 20.0, 30.0, 40.0, 1000.0, 5.0, 7.0]})\nr = son3_ort(df).tolist()\nassert pd.isna(r[0]) and pd.isna(r[5]), "Her hesabın ilk işleminde geçmiş yok: NaN olmalı"\nassert r[1] == 10.0 and r[2] == 15.0 and r[3] == 20.0, f"Önceki işlemlerin ortalaması bekleniyor; gelen {r[:4]}"\nassert r[4] == 30.0, f"1000 TL\'lik işlemin özelliği önceki 3 işlemin (20, 30, 40) ortalaması: 30. Gelen {r[4]}: işlemin kendisi pencereye giriyor"\nassert r[6] == 5.0, "B hesabının ikinci işlemi yalnız 5\'i görmeli"\n',
      hints: ['Pencere, şu anki satırı da içeriyor mu?', 'Pencereden önce bir satır kaydır: s.shift(1).rolling(...)'],
      why: 'rolling(3) o satırı da içerir; 1000 TL\'lik şüpheli işlemin "geçmiş ortalaması" kendini içerince sapma küçülür ve model gerçek dünyada göremeyeceği bilgiyle eğitilir. shift(1) pencereyi bir adım geriye iter. Bu, zaman sıralı özelliklerde en sık görülen sızıntıdır.'
    },
    {
      t: 'code',
      stage: 'Hata avı',
      id: 'ozellik-muhendisligi-10',
      diff: 2,
      kind: 'bug',
      needs: ['pandas'],
      q: '<p><b>Hatayı bul ve düzelt.</b> <code>log_tutar(df)</code> uzun kuyruklu <code>amount</code> sütununu sıkıştırıp <code>log_amount</code> sütunu eklemeli. Ama Ilgaz Bank işlemlerinde çıkışlar negatif ve sıfır tutarlar da var; kod boş değerler ve <code>-inf</code> üretiyor. Hem negatif hem pozitif tutarlarda çalışan, işareti koruyan <b>işaretli log</b> kullan: <code>sign(x) · log(1 + |x|)</code>. Sonucu 4 basamağa yuvarla; orijinal tabloyu değiştirme.</p>',
      start: 'import numpy as np\nimport pandas as pd\nimport veri\n\nislem = veri.oku("ilgaz_bank", "bank_txns", usecols=["txn_id", "amount"])\n\n\ndef log_tutar(df):\n    df["log_amount"] = np.log(df["amount"]).round(4)\n    return df\n',
      sol: 'import numpy as np\nimport pandas as pd\nimport veri\n\nislem = veri.oku("ilgaz_bank", "bank_txns", usecols=["txn_id", "amount"])\n\n\ndef log_tutar(df):\n    df = df.copy()\n    df["log_amount"] = (np.sign(df["amount"]) * np.log1p(df["amount"].abs())).round(4)\n    return df\n',
      tests: 'k = pd.DataFrame({"amount": [0.0, 9.0, -9.0, 99.0]})\nr = log_tutar(k)\nassert "log_amount" not in k.columns, "Orijinali değiştirme: df.copy()"\nassert r["log_amount"].tolist() == [0.0, 2.3026, -2.3026, 4.6052], f"İşaretli log yanlış: {r[\'log_amount\'].tolist()}"\ng = log_tutar(islem)\nassert g["log_amount"].isna().sum() == 0 and np.isfinite(g["log_amount"]).all(), "Gerçek veride NaN ya da sonsuz kalmamalı"\nassert (np.sign(g["log_amount"]) == np.sign(g["amount"])).all(), "İşaret korunmalı: çıkışlar negatif kalmalı"\n',
      hints: [
        'np.log negatifte NaN, sıfırda -inf verir.',
        'np.sign(x) * np.log1p(np.abs(x)) sıfırı 0, negatifi negatif bırakır.'
      ],
      why: 'Para hareketlerinde giriş ve çıkış aynı sütunda işaretle tutulur. log1p sıfırı güvenle işler, işaret çarpanı yönü korur. Ayrıca orijinal DataFrame\'i fonksiyon içinde değiştirmek (yan etki) ikinci kez çağrıldığında sürprizlere yol açar; kopya al.'
    },
    {
      t: 'code',
      stage: 'Meydan okuma',
      id: 'ozellik-muhendisligi-11',
      diff: 3,
      needs: ['pandas'],
      q: '<p><code>KirpLog</code> adında, Pipeline\'a girebilen bir dönüştürücü sınıfı yaz (<code>BaseEstimator</code>, <code>TransformerMixin</code>).</p><ul><li><code>__init__(self, ust=0.99)</code>: parametreyi aynı adla sakla (başka iş yapma).</li><li><code>fit(X, y=None)</code>: her sütunun <code>ust</code> yüzdelik değerini (<code>np.quantile(..., axis=0)</code>) <code>self.sinir_</code>\'e kaydet; sütun sayısını <code>self.n_features_in_</code>\'e yaz; <code>self</code> döndür.</li><li><code>transform(X)</code>: değerleri <code>[0, sinir_]</code> aralığına kırp ve <code>np.log1p</code> uygula; numpy dizisi döndür.</li><li><code>get_feature_names_out(input_features=None)</code>: <code>"log_" + ad</code> listesi (ad verilmezse <code>x0, x1...</code>) döndür.</li></ul>',
      start: 'import numpy as np\nfrom sklearn.base import BaseEstimator, TransformerMixin\n\n\nclass KirpLog(BaseEstimator, TransformerMixin):\n    pass\n',
      sol: 'import numpy as np\nfrom sklearn.base import BaseEstimator, TransformerMixin\n\n\nclass KirpLog(BaseEstimator, TransformerMixin):\n    def __init__(self, ust=0.99):\n        self.ust = ust\n\n    def fit(self, X, y=None):\n        X = np.asarray(X, dtype=float)\n        self.sinir_ = np.quantile(X, self.ust, axis=0)\n        self.n_features_in_ = X.shape[1]\n        return self\n\n    def transform(self, X):\n        X = np.asarray(X, dtype=float)\n        return np.log1p(np.clip(X, 0, self.sinir_))\n\n    def get_feature_names_out(self, input_features=None):\n        if input_features is None:\n            input_features = [f"x{i}" for i in range(self.n_features_in_)]\n        return np.array(["log_" + str(a) for a in input_features], dtype=object)\n',
      tests: 'from sklearn.base import clone\nfrom sklearn.pipeline import make_pipeline\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.model_selection import cross_val_score\negt = np.array([[1.0, 10.0], [2.0, 20.0], [3.0, 30.0], [100.0, 40.0]])\nk = KirpLog(ust=0.75).fit(egt)\nassert np.allclose(k.sinir_, [27.25, 32.5]), f"sinir_ eğitim sütunlarının %75 yüzdeliği olmalı; gelen {k.sinir_}"\nr = k.transform(np.array([[500.0, -5.0]]))\nassert np.allclose(r, [[np.log1p(27.25), 0.0]]), "Test değeri EĞİTİM sınırına kırpılmalı, negatif 0\'a çekilmeli"\nassert clone(KirpLog(ust=0.9)).get_params() == {"ust": 0.9}, "get_params çalışmalı: __init__ yalnız parametreyi saklamalı"\nassert list(k.get_feature_names_out(["kart", "maas"])) == ["log_kart", "log_maas"], "Özellik adları log_ önekli olmalı"\nassert list(k.get_feature_names_out()) == ["log_x0", "log_x1"], "Ad verilmezse x0, x1"\nrng = np.random.default_rng(0)\nX = rng.lognormal(3, 1, size=(120, 2)); y = (X[:, 0] > np.median(X[:, 0])).astype(int)\ns = cross_val_score(make_pipeline(KirpLog(), LogisticRegression()), X, y, cv=3).mean()\nassert s > 0.9, "Pipeline içinde çapraz doğrulamada çalışmalı"\n',
      hints: [
        'scikit-learn kuralı: __init__ yalnız self.ust = ust yazar; öğrenilen değerler fit içinde sonu _ ile biten adlara yazılır.',
        'Kırpma: np.clip(X, 0, self.sinir_) sütun bazında yayılır (broadcasting).',
        'fit mutlaka return self ile bitmeli; yoksa pipeline zinciri kırılır.'
      ],
      why: 'Kırpma sınırı veriden öğrenilen bir istatistiktir; FunctionTransformer bunu yapamaz çünkü durum tutmaz. Sınıf fit\'te sınırı yalnız eğitimden öğrenir, çapraz doğrulamada her kat kendi sınırını hesaplar: sızıntı olmaz. get_feature_names_out ise açıklanabilirlik araçlarının özellik adlarını görmesini sağlar.'
    },
    {
      t: 'code',
      stage: 'Meydan okuma',
      id: 'ozellik-muhendisligi-12',
      diff: 3,
      needs: ['pandas'],
      q: '<p><code>permutasyon_secimi(model, X_val, y_val, adlar)</code> fonksiyonunu yaz: eğitilmiş modelin doğrulama setindeki permutation importance değerlerini <code>sklearn.inspection.permutation_importance</code> ile hesaplasın (<code>n_repeats=10, random_state=0, scoring="roc_auc"</code>), ortalama önemi <b>0.005\'ten büyük</b> olan özellikleri önem sırasıyla (büyükten küçüğe) <code>[(ad, önem), ...]</code> listesi olarak döndürsün; önem 4 basamak.</p>',
      start: 'import numpy as np\nfrom sklearn.inspection import permutation_importance\n\n\ndef permutasyon_secimi(model, X_val, y_val, adlar):\n    pass\n',
      sol: 'import numpy as np\nfrom sklearn.inspection import permutation_importance\n\n\ndef permutasyon_secimi(model, X_val, y_val, adlar):\n    r = permutation_importance(model, X_val, y_val, n_repeats=10, random_state=0, scoring="roc_auc")\n    cift = [(a, round(float(m), 4)) for a, m in zip(adlar, r.importances_mean) if m > 0.005]\n    return sorted(cift, key=lambda t: t[1], reverse=True)\n',
      tests: 'from sklearn.datasets import make_classification\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.linear_model import LogisticRegression\nX, y = make_classification(n_samples=600, n_features=6, n_informative=3, n_redundant=0, shuffle=False, random_state=3)\nadlar = ["gelir", "kart_adet", "kidem", "gurultu1", "gurultu2", "gurultu3"]\nXtr, Xva, ytr, yva = train_test_split(X, y, test_size=0.3, random_state=0)\nm = LogisticRegression().fit(Xtr, ytr)\nr = permutasyon_secimi(m, Xva, yva, adlar)\nassert all(isinstance(t, tuple) and len(t) == 2 for t in r), "(ad, önem) ikilileri döndür"\nad = [t[0] for t in r]\nassert set(ad) <= {"gelir", "kart_adet", "kidem"} and len(ad) >= 2, f"Yalnız bilgi taşıyan özellikler kalmalı; gelen {ad}"\nassert [t[1] for t in r] == sorted([t[1] for t in r], reverse=True), "Önem sırasına göre azalan sırala"\nref = permutation_importance(m, Xva, yva, n_repeats=10, random_state=0, scoring="roc_auc").importances_mean\nassert abs(r[0][1] - round(float(ref.max()), 4)) < 1e-9, "Doğrulama setinde, verilen parametrelerle hesapla"\n',
      hints: [
        'permutation_importance(model, X_val, y_val, n_repeats=10, random_state=0, scoring="roc_auc")',
        'Sonuçtaki importances_mean dizisini adlarla zip\'le, eşikle süz.',
        'sorted(..., key=lambda t: t[1], reverse=True)'
      ],
      why: 'Permutation importance bir sütunu karıştırıp skordaki düşüşü ölçer; model türünden bağımsızdır ve doğrulama setinde hesaplandığı için ezberi değil genellemeyi yansıtır. Gürültü sütunlarının önemi 0 civarında (bazen negatif) çıkar. Birbirine çok bağlı iki sütun varsa biri karıştırılınca diğeri bilgiyi taşıdığı için ikisi de önemsiz görünebilir: önce korelasyon süzgeci uygula.'
    },
    {
      t: 'code',
      stage: 'Mini proje',
      id: 'ozellik-muhendisligi-13',
      diff: 3,
      needs: ['pandas'],
      q: '<p><b>Ilgaz Bank: ikinci yarıda kim çok harcayacak?</b> Start kodu veriyi okur, <b>1 Temmuz 2024</b> kesimine göre hedefi (<code>y</code>: Temmuz–Aralık kart harcaması medyanın üstünde mi) ve demografik taban tabloyu (<code>taban</code>: risk_score, segment, yas, kidem_gun) hazırlar; <code>auc_olc(tablo, sutunlar)</code> 5 katlı çapraz doğrulamayla ROC-AUC verir.</p><p><code>ozellik_ekle(taban, once, hesap)</code> fonksiyonunu yaz. <code>once</code>, kesimden önceki işlemlerdir (customer_id ekli). Tabanın <b>kopyasına</b> şu sütunları ekle (hepsi müşteri düzeyinde, boşlar 0):</p><ul><li><code>kart_adet</code>: kart harcaması işlem sayısı</li><li><code>log_kart</code>: <code>log1p</code>(kart harcaması toplamının mutlak değeri)</li><li><code>son90_kart</code>: kesimden önceki son 90 günde (<code>txn_time &gt;= kesim - 90 gün</code>) kart harcaması toplamının mutlak değeri</li><li><code>kart_hesap</code>: müşterinin <code>kredi_karti</code> türündeki hesap sayısı (<code>hesap</code> tablosundan)</li></ul><p>Sonra <code>rapor()</code> yaz: <code>{"demografik": auc, "muhendislik": auc}</code> sözlüğü döndürsün (3 basamak); demografik = taban sütunları, mühendislik = taban + dört yeni sütun.</p>',
      start: 'import numpy as np\nimport pandas as pd\nimport veri\nfrom sklearn.compose import make_column_transformer\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.model_selection import StratifiedKFold, cross_val_score\nfrom sklearn.pipeline import make_pipeline\nfrom sklearn.preprocessing import OneHotEncoder, StandardScaler\n\nislem = veri.oku("ilgaz_bank", "bank_txns", usecols=["account_id", "txn_time", "amount", "txn_type"], parse_dates=["txn_time"])\nhesap = veri.oku("ilgaz_bank", "bank_accounts")\nmusteri = veri.oku("ilgaz_bank", "bank_customers", parse_dates=["birth_date", "joined_date"]).set_index("customer_id")\nKESIM = pd.Timestamp("2024-07-01")\nd = islem.merge(hesap[["account_id", "customer_id"]], on="account_id")\nonce, sonra = d[d["txn_time"] < KESIM], d[d["txn_time"] >= KESIM]\n\ntaban = pd.DataFrame(index=sorted(once["customer_id"].unique()))\ntaban["risk_score"] = musteri["risk_score"]\ntaban["segment"] = musteri["segment"]\ntaban["yas"] = (KESIM - musteri["birth_date"]).dt.days // 365\ntaban["kidem_gun"] = (KESIM - musteri["joined_date"]).dt.days\nhedef_tl = sonra[sonra["txn_type"] == "kart_harcama"].groupby("customer_id")["amount"].sum().abs().reindex(taban.index).fillna(0)\ny = (hedef_tl >= hedef_tl.median()).astype(int)\n\n\ndef auc_olc(tablo, sutunlar):\n    sayisal = [c for c in sutunlar if c != "segment"]\n    on = make_column_transformer((StandardScaler(), sayisal), (OneHotEncoder(handle_unknown="ignore"), ["segment"]))\n    model = make_pipeline(on, LogisticRegression(max_iter=1000))\n    cv = StratifiedKFold(5, shuffle=True, random_state=0)\n    return cross_val_score(model, tablo[sutunlar], y, cv=cv, scoring="roc_auc").mean()\n\n\ndef ozellik_ekle(taban, once, hesap):\n    t = taban.copy()\n    # TODO: kart_adet, log_kart, son90_kart, kart_hesap\n    return t\n\n\ndef rapor():\n    # TODO: iki AUC\n    return {}\n',
      sol: 'import numpy as np\nimport pandas as pd\nimport veri\nfrom sklearn.compose import make_column_transformer\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.model_selection import StratifiedKFold, cross_val_score\nfrom sklearn.pipeline import make_pipeline\nfrom sklearn.preprocessing import OneHotEncoder, StandardScaler\n\nislem = veri.oku("ilgaz_bank", "bank_txns", usecols=["account_id", "txn_time", "amount", "txn_type"], parse_dates=["txn_time"])\nhesap = veri.oku("ilgaz_bank", "bank_accounts")\nmusteri = veri.oku("ilgaz_bank", "bank_customers", parse_dates=["birth_date", "joined_date"]).set_index("customer_id")\nKESIM = pd.Timestamp("2024-07-01")\nd = islem.merge(hesap[["account_id", "customer_id"]], on="account_id")\nonce, sonra = d[d["txn_time"] < KESIM], d[d["txn_time"] >= KESIM]\n\ntaban = pd.DataFrame(index=sorted(once["customer_id"].unique()))\ntaban["risk_score"] = musteri["risk_score"]\ntaban["segment"] = musteri["segment"]\ntaban["yas"] = (KESIM - musteri["birth_date"]).dt.days // 365\ntaban["kidem_gun"] = (KESIM - musteri["joined_date"]).dt.days\nhedef_tl = sonra[sonra["txn_type"] == "kart_harcama"].groupby("customer_id")["amount"].sum().abs().reindex(taban.index).fillna(0)\ny = (hedef_tl >= hedef_tl.median()).astype(int)\n\n\ndef auc_olc(tablo, sutunlar):\n    sayisal = [c for c in sutunlar if c != "segment"]\n    on = make_column_transformer((StandardScaler(), sayisal), (OneHotEncoder(handle_unknown="ignore"), ["segment"]))\n    model = make_pipeline(on, LogisticRegression(max_iter=1000))\n    cv = StratifiedKFold(5, shuffle=True, random_state=0)\n    return cross_val_score(model, tablo[sutunlar], y, cv=cv, scoring="roc_auc").mean()\n\n\ndef ozellik_ekle(taban, once, hesap):\n    t = taban.copy()\n    kart = once[once["txn_type"] == "kart_harcama"]\n    t["kart_adet"] = kart.groupby("customer_id").size().reindex(t.index).fillna(0)\n    t["log_kart"] = np.log1p(kart.groupby("customer_id")["amount"].sum().abs().reindex(t.index).fillna(0))\n    son = kart[kart["txn_time"] >= KESIM - pd.Timedelta(days=90)]\n    t["son90_kart"] = son.groupby("customer_id")["amount"].sum().abs().reindex(t.index).fillna(0)\n    kh = hesap[hesap["account_type"] == "kredi_karti"].groupby("customer_id").size()\n    t["kart_hesap"] = kh.reindex(t.index).fillna(0)\n    return t\n\n\ndef rapor():\n    t = ozellik_ekle(taban, once, hesap)\n    demo = ["risk_score", "segment", "yas", "kidem_gun"]\n    yeni = demo + ["kart_adet", "log_kart", "son90_kart", "kart_hesap"]\n    return {"demografik": round(float(auc_olc(t, demo)), 3), "muhendislik": round(float(auc_olc(t, yeni)), 3)}\n\n\nprint(rapor())\n',
      tests: 't = ozellik_ekle(taban, once, hesap)\nassert "kart_adet" not in taban.columns, "Taban tabloyu değiştirme: kopya al"\nfor c in ["kart_adet", "log_kart", "son90_kart", "kart_hesap"]:\n    assert c in t.columns, f"{c} eksik"\n    assert t[c].isna().sum() == 0, f"{c} sütununda boş kalmamalı (0 ile doldur)"\nassert len(t) == 471, "471 müşteri"\nassert t.loc[2, "kart_adet"] == 40, f"Müşteri 2\'nin Temmuz öncesi 40 kart harcaması var; gelen {t.loc[2, \'kart_adet\']}"\nassert abs(t.loc[2, "log_kart"] - np.log1p(166374.12)) < 1e-6, "log_kart = log1p(|kart toplamı|)"\nassert t["kart_hesap"].sum() == 204, f"Bu 471 müşterinin toplam 204 kredi kartı hesabı var; gelen {t[\'kart_hesap\'].sum()}"\nassert abs(t["son90_kart"].sum() - 15285166.11) < 1.0, "son90_kart: 2024-04-02 ve sonrası, kesimden önce"\nr = rapor()\nassert r["demografik"] == 0.526, f"Demografik AUC 0.526 olmalı; gelen {r.get(\'demografik\')}"\nassert r["muhendislik"] >= 0.80, f"Mühendislik özellikleriyle AUC 0.80\'i geçmeli; gelen {r.get(\'muhendislik\')}"\n',
      hints: [
        'Her özellik için: groupby("customer_id") → reindex(t.index) → fillna(0)',
        'Son 90 gün: kart[kart["txn_time"] &gt;= KESIM - pd.Timedelta(days=90)]',
        'kart_hesap: hesap[hesap["account_type"] == "kredi_karti"].groupby("customer_id").size()'
      ],
      why: 'Aynı model (lojistik regresyon), aynı müşteriler: yalnız özellikler değişti ve AUC 0.53\'ten 0.81\'e çıktı. Kesim tarihi sayesinde her özellik "1 Temmuz\'da bildiğim" bilgidir; hedef kesimden sonrasıdır. log1p uzun kuyruğu sıkıştırır, son 90 gün güncel eğilimi, kart hesabı sayısı kapasiteyi yakalar. reindex + fillna(0), hiç kart harcaması olmayan müşteriyi kaybetmeden 0 olarak tutar.'
    }
  ],
  faq: [
    {
      q: 'Kaç özellik fazla sayılır?',
      a: 'Sayı değil, örnek başına bilgi önemli. 500 satırlık veride 200 özellik aşırı öğrenmeye davetiyedir; 1 milyon satırda sorun değildir. Pratik kural: her yeni özellik doğrulama skorunu (çapraz doğrulamada) iyileştirmiyorsa ve canlıda bakımı varsa çıkar.'
    },
    {
      q: 'Ağaç modellerinde de özellik mühendisliği gerekir mi?',
      a: 'Ölçekleme ve log gerekmez (ağaç sıralamaya bakar). Ama oranlar, lag, grup istatistikleri ve tarih parçaları ağaç modellerinde de büyük fark yaratır; ağaç "harcama / maaş" oranını yüzlerce bölmeyle ancak kabaca taklit edebilir.'
    },
    {
      q: 'Hedef kodlama mı one-hot mu?',
      a: 'Az değerli (yaklaşık 15\'ten az) kategoride one-hot basit ve güvenlidir. Yüzlerce/binlerce değerde hedef kodlama (katlar dışı + yumuşatma) ya da frekans kodlama tercih edilir. Ağaç tabanlı HistGradientBoosting ve LightGBM\'in yerleşik kategorik desteği de bir seçenektir.'
    },
    {
      q: 'Box-Cox ile log arasında ne fark var?',
      a: 'Log sabit bir dönüşümdür. Box-Cox, veriye en uygun üssü (lambda) en çok olabilirlikle seçer; lambda=0 log\'a karşılık gelir. Yalnız pozitif değerlerde çalışır; sıfır ve negatif için Yeo-Johnson kullan (PowerTransformer varsayılanı).'
    },
    {
      q: 'Özellikleri SQL\'de mi pandas\'ta mı üretmeliyim?',
      a: 'Büyük tablolarda toplama (müşteri başına toplam, son 90 gün) veritabanında daha hızlıdır ve canlı sistemle aynı kaynaktan gelir. Modelden öğrenilen dönüşümler (ölçek, hedef kodlama, kırpma) ise Pipeline\'da kalmalı ki eğitim ve tahmin aynı kodu kullansın.'
    }
  ],
  mistakes: [
    {
      bad: 'df["hesap_ort"] = df.groupby("hesap")["tutar"].transform("mean")',
      good: 'df["hesap_ort"] = df.groupby("hesap")["tutar"].transform(lambda s: s.shift(1).expanding().mean())',
      why: 'Tüm grubun ortalaması gelecekteki işlemleri de içerir; tahmin anında yalnız geçmiş bilinir.'
    },
    {
      bad: 'kod = df.groupby("sehir")["churn"].mean()\ndf["sehir_kod"] = df["sehir"].map(kod)\nX_tr, X_te = train_test_split(df)',
      good: '# önce böl, sonra hedef kodlamayı katlar dışı ve yalnız eğitimde öğren\nfrom sklearn.preprocessing import TargetEncoder',
      why: 'Bölmeden önce hedef kodlamak test hedeflerini özelliğe sızdırır; skor iyimser çıkar.'
    },
    {
      bad: 'df["log_tutar"] = np.log(df["tutar"])',
      good: 'df["log_tutar"] = np.sign(df["tutar"]) * np.log1p(df["tutar"].abs())',
      why: 'np.log sıfırda -inf, negatifte NaN üretir; işaretli log1p ikisini de güvenle işler.'
    },
    {
      bad: 'df["limit"] = df["limit"].fillna(0)\ndf["limit_eksik"] = df["limit"].isna()',
      good: 'df["limit_eksik"] = df["limit"].isna().astype(int)\ndf["limit"] = df["limit"].fillna(0)',
      why: 'Önce doldurursan eksiklik bilgisi kaybolur; bayrak her zaman doldurmadan önce üretilir.'
    },
    {
      bad: 'df["onceki"] = df.groupby("hesap")["harcama"].shift(1)  # aylar eksik olabilir',
      good: 'genis = uzun.pivot_table(index="hesap", columns="ay", values="harcama", fill_value=0)\nonceki = genis[ay - 1]',
      why: 'Satır tabanlı kaydırma boş ay varsa iki ay öncesini getirir; önce takvimi tamamla.'
    }
  ]
});
})(window);
