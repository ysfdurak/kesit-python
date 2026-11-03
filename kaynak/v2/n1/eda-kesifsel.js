/* Kesit Python — v2/n1: Keşifsel veri analizi (EDA): sorudan bulguya */
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push(
  {
    id: 'eda-kesifsel',
    lv: 'ileri',
    mod: 'Veri Bilimi Araçları',
    min: 60,
    needs: ['pandas', 'numpy', 'matplotlib'],
    title: 'Keşifsel veri analizi (EDA): sorudan bulguya',
    sum: 'Hipotez defteriyle başlayan yöntemli EDA: profil fonksiyonu, eksikliğin nedeni, çarpık dağılım ve aykırı değer, iki değişkenli analiz (Spearman, crosstab, grup özeti), zaman boyutu, veri hatası ile sinyali ayırma (raw_signups, kirli_veri) ve Kanat Havayolları rötar mini projesiyle bulgu yazımı.',
    goals: [
      'Analize soru listesi ve hipotez defteriyle başlayıp EDA\'yı zaman kutusu içinde bitirebilirim',
      'Tekrar kullanılabilir bir profil fonksiyonuyla eksiklik, benzersizlik ve aralık sorunlarını ilk dakikada görebilirim',
      'Çarpık dağılımı medyan ve yüzdeliklerle özetler, aykırı değeri silmeden önce açıklayabilirim',
      'Değişken türüne göre doğru iki değişkenli özeti (Spearman, crosstab, grup medyanı) seçebilirim',
      'Veri hatasını gerçek sinyalden ayırıp bulguyu "gözlem → kanıt → sonraki adım" biçiminde yazabilirim'
    ],
    body: `<h2>EDA neden ayrı bir beceri?</h2>
<p>Keşifsel veri analizi (exploratory data analysis, EDA), modele, panoya ya da rapora geçmeden önce veriyi <b>tanıma</b> işidir: veri ne kadar, neyi temsil ediyor, nerede eksik, nerede yanlış, hangi örüntüler var? pandas'ı, gruplamayı ve grafikleri önceki derslerde gördün. EDA bunları bir <b>yöntem</b> içinde birleştirir. Yöntemsiz EDA, yüzlerce grafiğin içinde kaybolmaktır; yöntemli EDA ise üç beş net bulguyla biter.</p>
<p>Bu derste Kanat Havayolları'nın Eylül–Aralık 2024 uçuşlarını (<code>hv_flights</code>, 3.173 uçuş) ve rötar nedenlerini (<code>hv_delays</code>) inceleyeceğiz. Veri hatası ile gerçek sinyali ayırmayı ise Anadolu Market'in form kayıtları (<code>raw_signups</code>) ve dağınık bayi raporu (<code>kirli_veri</code>) üzerinde göreceğiz.</p>

<h2>1. Önce sorular, sonra kod: hipotez defteri</h2>
<p>EDA'ya bir soru listesiyle başla. Operasyon müdürü "rötarlar kötüleşiyor mu, neden?" diye soruyorsa defterin şöyle görünebilir:</p>
<div class="tbl-wrap"><table>
<tr><th>#</th><th>Soru / hipotez</th><th>Nasıl bakarım?</th><th>Durum</th></tr>
<tr><td>S1</td><td>Tipik bir uçuş ne kadar rötar yapıyor?</td><td>Kalkış rötarının dağılımı, medyan, %90'lık dilim</td><td>açık</td></tr>
<tr><td>S2</td><td>Akşam uçuşları daha mı geç kalkıyor?</td><td>Saat dilimine göre medyan ve 15 dk üstü oranı</td><td>açık</td></tr>
<tr><td>S3</td><td>Aralık'ta kötüleşme hava koşulundan mı?</td><td>Ay × neden çapraz tablosu (dakika payı)</td><td>açık</td></tr>
<tr><td>S4</td><td>Rötar uçaktan uçağa yayılıyor mu?</td><td>Aynı uçağın önceki varış rötarı ile sonraki kalkış rötarı</td><td>açık</td></tr>
<tr><td>S5</td><td>Dolu uçaklar daha mı geç kalkıyor?</td><td>Doluluk (pax/seats) ile rötar arasında Spearman korelasyonu</td><td>açık</td></tr>
</table></div>
<p>Her sorunun yanına sonradan kanıtı ve sonucu yazarsın. Böylece hem neyi neden incelediğini hatırlarsın hem de "her şeye baktım, bir şey bulamadım" tuzağına düşmezsin.</p>

<h2>2. Veri profili: ilk 10 dakika</h2>
<p>Her yeni tabloda aynı kontrolleri yap: şekil, türler, eksiklik, benzersizlik, aralıklar. Bunu bir fonksiyona dökersen her projede tekrar kullanırsın.</p>
<pre class="py">import veri
import pandas as pd

f = veri.oku("kanat_havayollari", "hv_flights",
             parse_dates=["sched_dep", "sched_arr", "actual_dep", "actual_arr"])

def profil(df):
    return pd.DataFrame({
        "eksik": df.isna().sum(),
        "eksik_yuzde": (df.isna().mean() * 100).round(2),
        "benzersiz": df.nunique(),
        "ornek": df.iloc[0],
    }).sort_values("eksik", ascending=False)

print(f.shape)
print(profil(f))
print(f["status"].value_counts())
print(f["sched_dep"].min(), "→", f["sched_dep"].max())</pre>
<p>Profilden çıkan ilk sorular: <code>actual_dep</code> 62, <code>actual_arr</code> 71 satırda boş. 62 iptal uçuşu var; peki fazladan 9 boş varış nereden geliyor? 9 uçuş başka meydana yönlendirilmiş (<code>diverted</code>): kalkış var, planlanan varış yok. Eksikliğin bir <b>nedeni</b> var; rastgele değil. Bu ayrım, eksik değeri nasıl ele alacağını belirler.</p>
<div class="tip"><b>Aralık ve anahtar kontrolleri</b>Profile şu üç soruyu da ekle: (1) Birincil anahtar gerçekten tekil mi (<code>df["flight_id"].is_unique</code>)? (2) Sayılar mantıklı aralıkta mı (yolcu sayısı koltuk sayısını aşıyor mu)? (3) Tarihler beklenen dönemde mi? Bu kontroller veri hatalarının çoğunu ilk dakikada yakalar.</div>

<h2>3. Tek değişkenli analiz: dağılımı tanı</h2>
<p>Kalkış rötarını dakika olarak türetelim ve dağılımına bakalım. Rötar gibi "çoğu küçük, birkaçı çok büyük" değişkenler sağa çarpıktır (right-skewed): ortalama, uzun kuyruk tarafından yukarı çekilir.</p>
<pre class="py">import veri
import pandas as pd

f = veri.oku("kanat_havayollari", "hv_flights", parse_dates=["sched_dep", "actual_dep"])
f["rotar"] = (f["actual_dep"] - f["sched_dep"]).dt.total_seconds() / 60
ucan = f[f["status"] != "cancelled"]

r = ucan["rotar"]
print("ortalama:", round(r.mean(), 1), "| medyan:", r.median(), "| çarpıklık:", round(r.skew(), 2))
print(r.quantile([0.5, 0.75, 0.9, 0.99]))
print("15 dk üstü oranı:", round((r &gt; 15).mean(), 3))

# IQR kuralıyla aykırı değer sınırları
q1, q3 = r.quantile([0.25, 0.75])
ust = q3 + 1.5 * (q3 - q1)
print("IQR üst sınırı:", ust, "| aykırı sayısı:", int((r &gt; ust).sum()))</pre>
<p>Ortalama yaklaşık 25 dakika, medyan 7 dakika. "Tipik uçuş 25 dakika gecikiyor" demek yanıltıcıdır; tipik uçuş 7 dakika gecikir, uçuşların yaklaşık %10'u ise 77 dakikayı aşar. Raporlarda çarpık değişkenler için <b>medyan + yüzdelik dilimler</b> ver.</p>
<div class="warn"><b>Aykırı değer silinecek bir şey değildir</b>IQR kuralı 374 uçuşu "aykırı" işaretler; bunlar gerçek, uzun rötarlardır ve operasyonun asıl sorunu tam da onlardır. Aykırı değeri yalnız <b>imkânsızsa</b> (negatif yaş, koltuktan fazla yolcu) ya da ölçüm hatası olduğu kanıtlanırsa ayıkla. Model için kırpma (winsorize) ya da log dönüşümü ayrı bir karardır.</div>
<p>Kategorik değişkenlerde frekans tablosu ve uzun kuyruk sorusu gelir: "Rötar nedenlerinin kaçı toplam dakikanın %80'ini oluşturuyor?"</p>
<pre class="py">import veri

d = veri.oku("kanat_havayollari", "hv_delays")
dakika = d.groupby("reason")["minutes"].sum().sort_values(ascending=False)
pay = (dakika / dakika.sum()).round(3)
print(pay)
print("kümülatif:", pay.cumsum().round(3).tolist())</pre>

<h2>4. İki değişkenli analiz</h2>
<div class="tbl-wrap"><table>
<tr><th>Değişken çifti</th><th>Sayısal özet</th><th>Grafik</th></tr>
<tr><td>Sayısal – sayısal</td><td>Pearson (doğrusal), Spearman (sıralı, aykırıya dayanıklı)</td><td>Saçılım (scatter), hexbin</td></tr>
<tr><td>Kategorik – sayısal</td><td><code>groupby</code> ile medyan, yüzdelik, oran</td><td>Kutu grafiği (box), violin</td></tr>
<tr><td>Kategorik – kategorik</td><td><code>pd.crosstab(..., normalize="index")</code></td><td>Yığılmış çubuk, ısı haritası</td></tr>
<tr><td>Zaman – sayısal</td><td><code>resample</code> / ay bazında medyan</td><td>Çizgi grafik</td></tr>
</table></div>
<pre class="py">import veri
import numpy as np
import pandas as pd

f = veri.oku("kanat_havayollari", "hv_flights", parse_dates=["sched_dep", "actual_dep"])
f = f[f["status"] != "cancelled"].copy()
f["rotar"] = (f["actual_dep"] - f["sched_dep"]).dt.total_seconds() / 60
saat = f["sched_dep"].dt.hour
f["dilim"] = np.select([saat &lt; 12, saat &lt; 18], ["sabah", "öğle"], "akşam")

# kategorik – sayısal
print(f.groupby("dilim")["rotar"].agg(medyan="median", gec_orani=lambda x: (x &gt; 15).mean()).round(3))

# zaman boyutu
print(f.groupby(f["sched_dep"].dt.strftime("%Y-%m"))["rotar"].median())

# sayısal – sayısal: doluluk ile rötar
u = veri.oku("kanat_havayollari", "hv_aircraft")
f = f.merge(u[["tail_no", "seats"]], on="tail_no", how="left", validate="many_to_one")
f["doluluk"] = f["pax"] / f["seats"]
# Spearman = sıralar (rank) üzerinde Pearson; Series.corr(method="spearman") scipy ister
print("Spearman:", round(f["doluluk"].rank().corr(f["rotar"].rank()), 3))</pre>
<p>Üç bulgu çıktı: akşam dilimi (18:00 sonrası) belirgin biçimde kötü; Aralık'ta medyan rötar iki katına çıkıyor; doluluk ile rötar arasında ilişki yok (Spearman ≈ 0). "İlişki yok" da bir bulgudur: S5 kapanır, ekip boşuna kapasite kısıtı aramaz.</p>
<pre class="py">import veri
import pandas as pd
import matplotlib.pyplot as plt

f = veri.oku("kanat_havayollari", "hv_flights", parse_dates=["sched_dep", "actual_dep"])
f["rotar"] = (f["actual_dep"] - f["sched_dep"]).dt.total_seconds() / 60
f = f.dropna(subset=["rotar"])
f["saat"] = f["sched_dep"].dt.hour

fig, ax = plt.subplots(1, 2, figsize=(10, 3.5))
ax[0].hist(f["rotar"].clip(upper=180), bins=36)
ax[0].set_title("Kalkış rötarı (dk, 180'de kırpıldı)")
f.boxplot(column="rotar", by="saat", ax=ax[1], showfliers=False)
ax[1].set_title("Saate göre rötar")
plt.suptitle("")
plt.tight_layout()
plt.show()
print("grafik çizildi:", len(f), "uçuş")</pre>
<div class="note"><b>Korelasyon nedensellik değildir</b>Akşam uçuşları daha geç kalkıyor; ama neden saat değil, gün boyunca biriken gecikme ya da akşam trafiği olabilir. EDA bulgusu bir <b>hipotez</b> üretir; nedeni kanıtlamak için deney, ek veri ya da daha dikkatli analiz gerekir (istatistik dersi).</div>

<h2>5. Veri hatası mı, gerçek sinyal mi?</h2>
<p>EDA'nın en değerli anı, "tuhaf" bir şey gördüğün andır. Önce sor: bu bir veri hatası mı, yoksa işin kendisi mi?</p>
<div class="tbl-wrap"><table>
<tr><th>Gözlem</th><th>Hata mı?</th><th>Nasıl anladık?</th></tr>
<tr><td>62 uçuşta <code>pax = 0</code></td><td>Hayır: hepsi iptal</td><td><code>pd.crosstab(f["pax"] == 0, f["status"])</code></td></tr>
<tr><td><code>raw_signups</code>'ta 52 satır, 40 kimlik</td><td>Evet: form iki kez gönderilmiş</td><td>E-posta küçük harfe çevrilince satırlar aynı</td></tr>
<tr><td>Aynı e-posta, iki farklı kimlik ve tarih</td><td>Belirsiz: aynı kişi yeniden kayıt olmuş olabilir</td><td>İş birimine sorulur, kural yazılır</td></tr>
<tr><td>Bayi raporunda Tutar <code>"1.430"</code></td><td>Biçim sorunu: Türkçe binlik ayırıcı</td><td>Diğer satırlarda <code>"1.250,50"</code> var</td></tr>
<tr><td>Müşteri kaydında <code>2024-02-30</code></td><td>Evet: imkânsız tarih</td><td><code>pd.to_datetime(..., errors="coerce")</code> NaT verir</td></tr>
</table></div>
<pre class="py">import veri
import pandas as pd

r = veri.oku("anadolu_market", "raw_signups")
print(len(r), "satır,", r["id"].nunique(), "kimlik,", int(r.duplicated().sum()), "birebir kopya")

r["email"] = r["email"].str.strip().str.lower()
print("e-posta normalleşince kopya:", int(r.duplicated().sum()))

def sehir_anahtar(s):
    return s.strip().replace("İ", "i").lower() if isinstance(s, str) else s

print(r["city"].value_counts(dropna=False).head(8))       # 'ISTANBUL', 'istanbul', 'İstanbul'...
print(r["city"].map(sehir_anahtar).value_counts(dropna=False))

# iki tarih biçimi: önce ISO, olmazsa gün.ay.yıl
t = pd.to_datetime(r["signup_date"], format="%Y-%m-%d", errors="coerce")
t = t.fillna(pd.to_datetime(r["signup_date"], format="%d.%m.%Y", errors="coerce"))
print("çözülemeyen tarih:", int(t.isna().sum()))

ayni = r.drop_duplicates().groupby("email")["id"].nunique()
print("aynı e-posta, farklı kimlik:", ayni[ayni &gt; 1].to_dict())</pre>
<div class="warn"><b>Temizlik kararlarını kaydet</b>"Kopyaları sildim" yetmez: hangi kurala göre (birebir mi, e-posta mı?), kaç satır gitti, belirsiz durumda ne yaptın? Bu notlar bulguların güvenilirliğini belirler ve aynı temizliğin yarın tekrar çalışabilmesini sağlar.</div>

<h2>6. Bulgu yazımı: gözlem → kanıt → olası açıklama → sonraki adım</h2>
<p>EDA'nın çıktısı grafik yığını değil, karar verdiren kısa bir metindir. Her bulguyu dört parçayla yaz:</p>
<div class="steps-list"><ol>
<li><b>Gözlem:</b> Aralık'ta rötar belirgin biçimde arttı.</li>
<li><b>Kanıt:</b> Medyan kalkış rötarı Eylül'de 5, Aralık'ta 16 dakika; hava kaynaklı dakikaların payı %25'ten %38'e çıktı.</li>
<li><b>Olası açıklama:</b> Kış koşulları; ancak geç gelen uçak payı da yüksek, zincirleme etki olabilir.</li>
<li><b>Sonraki adım:</b> Havalimanı bazında hava kaynaklı rötarı ayır; kış tarifesinde akşam bankosuna tampon süre ekleme senaryosunu hesapla.</li>
</ol></div>

<div class="note"><b>Gerçek işte</b>Analist işe alım vakalarında (take-home) değerlendiriciler grafiğin güzelliğine değil, bulguların yapısına bakar: soru net mi, veri kalitesi sorunları fark edilmiş ve belgelenmiş mi, sonuç sayıyla desteklenmiş mi, "bilmiyorum, şu veriyle anlarız" diyebilmiş mi? İş hayatında da EDA raporu çoğunlukla bir sayfadır: 3–5 bulgu, her biri bir grafik ve bir sonraki adım. Notebook'un geri kalanı ekte durur.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Otomatik profil araçları</h3>
<p>ydata-profiling ve sweetviz tek satırda yüzlerce istatistik ve grafik içeren HTML rapor üretir. İlk bakış için hızlıdır; ama soruyu ve yorumu senin yerine yapmaz. Tarayıcıda çalışmazlar.</p>
<pre class="code">pip install ydata-profiling
from ydata_profiling import ProfileReport
import pandas as pd
df = pd.read_csv("hv_flights.csv")
ProfileReport(df, title="Uçuşlar", minimal=True).to_file("profil.html")</pre>
<p>Kendi bilgisayarında dene: yukarıdaki komutla kur, raporu tarayıcıda aç ve kendi <code>profil()</code> fonksiyonunun çıktısıyla karşılaştır.</p>
<h3>Çatallanan yollar ve sızıntı</h3>
<p>Yeterince çok kırılıma bakarsan bazıları şans eseri "anlamlı" görünür (çoklu karşılaştırma). EDA'da bulduğun bir örüntüyü kesin sonuç gibi sunma; ya yeni veride doğrula ya da hipotez olarak etiketle. Model kuracaksan EDA'yı yalnız <b>eğitim</b> verisinde yap; test verisine bakıp karar vermek veri sızıntısıdır (data leakage).</p>
<h3>Simpson ve kompozisyon etkisi</h3>
<p>Toplam ortalama değişirken her alt grup aynı kalabilir: örneğin Aralık'ta akşam uçuşlarının payı artarsa toplam rötar, hiçbir dilim kötüleşmese de yükselir. Zaman karşılaştırmalarında daima "karma (mix) değişti mi?" sorusunu sor. Bu konu <b>iş metrikleri</b> dersinde köprü analiziyle derinleşiyor.</p>
</section>`,
    ex: [
      {
        t: 'mc',
        stage: 'Isınma',
        q: 'Kalkış rötarında ortalama 25 dk, medyan 7 dk, çarpıklık 3,2. Yöneticiye "tipik bir uçuş ne kadar gecikiyor?" sorusuna hangi özetle cevap verirsin?',
        o: [
          'Ortalama: tüm uçuşları hesaba kattığı için en adil özettir',
          'Medyan ve %90\'lık dilim birlikte: tipik değer ve kuyruk',
          'En büyük değer, çünkü yöneticiler en kötü durumu sorar',
          'Standart sapma'
        ],
        a: 1,
        why: 'Sağa çarpık dağılımda ortalama uzun kuyruk tarafından yukarı çekilir; "tipik" uçuşu medyan anlatır. Kuyruğu (ciddi rötarları) görünür kılmak için %90 ya da %95\'lik dilimi yanına ekle.'
      },
      {
        t: 'mc',
        stage: 'Isınma',
        q: 'İki sayısal değişken arasındaki ilişki doğrusal değil ama tekdüze (biri artınca diğeri de genelde artıyor) ve veride birkaç uç değer var. Hangi ölçü daha uygun?',
        o: ['Pearson korelasyonu', 'Spearman sıra korelasyonu', 'Kovaryans', 'İki değişkenin ortalamalarının oranı'],
        a: 1,
        why: 'Spearman değerlerin sıralarıyla çalışır: tekdüze (monotonic) ilişkileri yakalar ve uç değerlerden az etkilenir. Pearson yalnız doğrusal ilişkiyi ölçer ve tek bir uç değerle büyük ölçüde değişebilir.'
      },
      {
        t: 'mc',
        stage: 'Isınma',
        q: 'Profil çıkarırken 62 uçuşta yolcu sayısının (<code>pax</code>) 0 olduğunu gördün. İlk adımın ne olmalı?',
        o: [
          'Bu satırları hemen sil; sıfır yolculu uçuş olamaz, ortalamayı bozarlar',
          'Önce pax = 0 satırlarını status ile çaprazlayıp nedenini anlamak',
          'Sıfırları uçak tipine göre ortalama yolcu sayısıyla doldurmak',
          'pax sütununu analizden tamamen çıkar'
        ],
        a: 1,
        why: 'Tuhaf bir değer önce açıklanır, sonra karar verilir. <code>pd.crosstab(f["pax"] == 0, f["status"])</code> 62 satırın tamamının iptal uçuş olduğunu gösterir: bu bir hata değil, işin kendisi. Doluluk hesabında iptalleri dışlamak doğru karar olur; silmek ya da doldurmak iptal oranı bilgisini yok eder.'
      },
      {
        t: 'predict',
        stage: 'Kodu oku',
        q: 'Bu kod ne yazdırır?',
        code: 'import pandas as pd\ns = pd.Series([2, 3, 3, 4, 100])\nprint(s.mean(), s.median())\n',
        o: ['22.4 3.0', '3.0 22.4', '22.4 3.5', '4.0 3.0'],
        a: 0,
        why: 'Ortalama (2+3+3+4+100)/5 = 22.4; tek bir uç değer onu beş kat büyütür. Medyan sıralı dizinin ortasıdır: 3.0. Çarpık veride ikisinin farkı uç değer etkisinin ölçüsüdür.'
      },
      {
        t: 'predict',
        stage: 'Kodu oku',
        q: 'Kanat Havayolları verisinde 62 iptal ve 9 yönlendirilmiş (diverted) uçuş var. Bu kod ne yazdırır?',
        code: 'import veri\nf = veri.oku("kanat_havayollari", "hv_flights")\nprint(f[["actual_dep", "actual_arr"]].isna().sum().tolist())\n',
        o: ['[62, 62]', '[62, 71]', '[71, 71]', '[0, 0]'],
        a: 1,
        why: 'İptal uçuşun ne kalkışı ne varışı vardır (62 + 62). Yönlendirilen uçuş kalkmıştır ama planlanan meydana varmamıştır: varış eksiği 62 + 9 = 71 olur. Eksikliğin nedenini bilmek, onu nasıl ele alacağını belirler.'
      },
      {
        t: 'predict',
        stage: 'Kodu oku',
        q: 'Bu kod ne yazdırır?',
        code: 'import pandas as pd\ndf = pd.DataFrame({"dilim": ["sabah", "sabah", "akşam", "akşam", "akşam", "akşam"],\n                   "gec": [0, 1, 1, 1, 0, 1]})\ntablo = pd.crosstab(df["dilim"], df["gec"], normalize="index")\nprint(tablo.loc["akşam"].tolist())\n',
        o: ['[1, 3]', '[0.5, 0.75]', '[0.25, 0.75]', '[0.1667, 0.5]'],
        a: 2,
        why: '<code>normalize="index"</code> her satırı kendi toplamına böler: akşamdaki 4 uçuşun 1\'i zamanında (0.25), 3\'ü geç (0.75). Satır yüzdeleri, grupları farklı büyüklükte olsa da karşılaştırmayı adil yapar.'
      },
      {
        t: 'order',
        stage: 'Kodu oku',
        q: '<p>Uçuş tablosunda eksik değer içeren sütunları yüzdeleriyle, büyükten küçüğe listeleyen programın satırlarını sırala.</p>',
        lines: [
          'import veri',
          'f = veri.oku("kanat_havayollari", "hv_flights")',
          'eksik = f.isna().sum()',
          'oran = (eksik / len(f) * 100).round(2)',
          'rapor = oran[oran > 0].sort_values(ascending=False)',
          'print(rapor.to_dict())'
        ],
        expect: '{\'actual_arr\': 2.24, \'actual_dep\': 1.95}\n',
        hint: 'Önce say, sonra orana çevir, en son süz ve sırala.',
        why: 'Her adım bir öncekinin sonucunu kullanır: sayım → yüzde → yalnız eksik olanlar, sıralı. Varış eksiği (%2.24) kalkış eksiğinden (%1.95) fazla, çünkü yönlendirilen uçuşların varışı yok.'
      },
      {
        t: 'code',
        stage: 'Rehberli',
        id: 'eda-kesifsel-1',
        diff: 1,
        needs: ['pandas'],
        q: '<p>Her projede kullanacağın bir profil fonksiyonu yaz. <code>profil(df)</code> şu sütunları içeren, index\'i <b>df\'in sütun adları</b> olan bir DataFrame döndürsün ve <code>eksik</code>\'e göre azalan sıralı olsun:</p><ul><li><code>eksik</code>: boş değer sayısı</li><li><code>eksik_yuzde</code>: boş oranı × 100, 2 basamak</li><li><code>benzersiz</code>: farklı (boş olmayan) değer sayısı</li></ul>',
        guide: [
          'df.isna().sum() ile sütun başına eksik sayısını al.',
          'df.isna().mean() * 100 ile yüzdeyi bul, round(2) uygula.',
          'df.nunique() ile benzersiz değer sayısını al.',
          'Üçünü pd.DataFrame({...}) ile birleştir ve sort_values("eksik", ascending=False) uygula.'
        ],
        example: 'import pandas as pd\nd = pd.DataFrame({"a": [1, None, 3], "b": ["x", "x", None]})\nozet = pd.DataFrame({"bos": d.isna().sum(), "farkli": d.nunique()})\nprint(ozet.sort_values("bos", ascending=False))\n',
        start: 'import veri\nimport pandas as pd\n\nf = veri.oku("kanat_havayollari", "hv_flights",\n             parse_dates=["sched_dep", "sched_arr", "actual_dep", "actual_arr"])\n\n\ndef profil(df):\n    eksik = df.isna().sum()\n    # TODO: eksik_yuzde (2 basamak) ve benzersiz\n    tablo = pd.DataFrame({"eksik": eksik})\n    # TODO: eksik\'e göre azalan sırala\n    return tablo\n\n\nprint(profil(f))\n',
        sol: 'import veri\nimport pandas as pd\n\nf = veri.oku("kanat_havayollari", "hv_flights",\n             parse_dates=["sched_dep", "sched_arr", "actual_dep", "actual_arr"])\n\n\ndef profil(df):\n    tablo = pd.DataFrame({\n        "eksik": df.isna().sum(),\n        "eksik_yuzde": (df.isna().mean() * 100).round(2),\n        "benzersiz": df.nunique(),\n    })\n    return tablo.sort_values("eksik", ascending=False)\n\n\nprint(profil(f))\n',
        tests: 'p = profil(f)\nassert list(p.columns) == ["eksik", "eksik_yuzde", "benzersiz"], "Sütunlar: eksik, eksik_yuzde, benzersiz"\nassert set(p.index) == set(f.columns), "Index df\'in sütun adları olmalı"\nassert p.index[0] == "actual_arr" and p.loc["actual_arr", "eksik"] == 71, "En çok eksik actual_arr (71) olmalı ve en üstte durmalı"\nassert p.loc["actual_dep", "eksik_yuzde"] == 1.95, "actual_dep eksik yüzdesi 1.95 olmalı (62 / 3173 × 100)"\nassert p.loc["tail_no", "benzersiz"] == 15 and p.loc["status", "benzersiz"] == 3, "15 uçak, 3 durum olmalı"\nk = profil(pd.DataFrame({"x": [1, None, None, 4], "y": [1, 1, 1, 1]}))\nassert k.loc["x", "eksik_yuzde"] == 50.0 and k.loc["y", "benzersiz"] == 1, "Küçük örnekte x %50 eksik, y tek değerli olmalı"\n',
        hints: [
          'Üç Series aynı index\'e (sütun adları) sahip; DataFrame sözlüğüyle yan yana koyabilirsin.',
          '<code>"eksik_yuzde": (df.isna().mean() * 100).round(2)</code>',
          '<code>return tablo.sort_values("eksik", ascending=False)</code>'
        ],
        why: '<code>isna().mean()</code> boolean ortalaması olduğu için doğrudan oran verir. Benzersiz sayısı 1 olan sütun bilgi taşımaz; satır sayısına eşit olan ise büyük olasılıkla bir anahtardır. Bu fonksiyon EDA\'nın ilk hücresi olmalı.'
      },
      {
        t: 'code',
        stage: 'Rehberli',
        id: 'eda-kesifsel-2',
        diff: 2,
        needs: ['pandas'],
        q: '<p>S1: "Tipik bir uçuş ne kadar rötar yapıyor?" <code>rotar_ozeti(f)</code> fonksiyonunu yaz. İptal edilmemiş uçuşlarda kalkış rötarını dakika olarak hesapla (<code>actual_dep - sched_dep</code>) ve şu sözlüğü döndür:</p><ul><li><code>ortalama</code> (1 basamak), <code>medyan</code>, <code>p90</code> (%90\'lık dilim)</li><li><code>gec_orani</code>: rötarı 15 dakikadan fazla olan uçuşların oranı (3 basamak)</li></ul>',
        guide: [
          'İptal uçuşları çıkar: f[f["status"] != "cancelled"].',
          'Farkı .dt.total_seconds() / 60 ile dakikaya çevir.',
          'mean, median, quantile(0.9) ve (rotar &gt; 15).mean() hesapla.',
          'Değerleri float\'a çevirip yuvarla ve sözlükte döndür.'
        ],
        example: 'import pandas as pd\nt = pd.DataFrame({"plan": pd.to_datetime(["2024-01-01 10:00", "2024-01-01 12:00"]),\n                  "gercek": pd.to_datetime(["2024-01-01 10:20", "2024-01-01 12:05"])})\ndk = (t["gercek"] - t["plan"]).dt.total_seconds() / 60\nprint(dk.tolist(), dk.median(), (dk > 15).mean())\n',
        start: 'import veri\nimport pandas as pd\n\nf = veri.oku("kanat_havayollari", "hv_flights",\n             parse_dates=["sched_dep", "sched_arr", "actual_dep", "actual_arr"])\n\n\ndef rotar_ozeti(f):\n    ucan = f  # TODO: iptalleri çıkar\n    rotar = (ucan["actual_dep"] - ucan["sched_dep"])  # TODO: dakikaya çevir\n    return {\n        "ortalama": None,   # TODO\n        "medyan": None,\n        "p90": None,\n        "gec_orani": None,\n    }\n\n\nprint(rotar_ozeti(f))\n',
        sol: 'import veri\nimport pandas as pd\n\nf = veri.oku("kanat_havayollari", "hv_flights",\n             parse_dates=["sched_dep", "sched_arr", "actual_dep", "actual_arr"])\n\n\ndef rotar_ozeti(f):\n    ucan = f[f["status"] != "cancelled"]\n    rotar = (ucan["actual_dep"] - ucan["sched_dep"]).dt.total_seconds() / 60\n    return {\n        "ortalama": round(float(rotar.mean()), 1),\n        "medyan": float(rotar.median()),\n        "p90": float(rotar.quantile(0.9)),\n        "gec_orani": round(float((rotar > 15).mean()), 3),\n    }\n\n\nprint(rotar_ozeti(f))\n',
        tests: 'o = rotar_ozeti(f)\nassert o["medyan"] == 7.0, "Medyan kalkış rötarı 7 dakika olmalı"\nassert o["ortalama"] == 25.0, "Ortalama 25.0 olmalı (24.97 → 1 basamak)"\nassert o["p90"] == 77.0, "%90\'lık dilim 77 dakika olmalı: quantile(0.9)"\nassert o["gec_orani"] == 0.379, "15 dk üstü oranı 0.379 olmalı; payda yalnız uçan uçuşlar (3111)"\n',
        hints: [
          'Timedelta\'yı dakikaya çevirmek için <code>.dt.total_seconds() / 60</code>.',
          'Oran için boolean ortalaması: <code>(rotar &gt; 15).mean()</code>.',
          'İptal uçuşların rötarı NaN\'dır; onları paydadan çıkarmak için önce filtrele.'
        ],
        why: 'Ortalama (25) ile medyan (7) arasındaki büyük fark sağa çarpıklığın işaretidir. 15 dakika eşiği havacılıkta "zamanında kalkış" (OTP) tanımıdır; bu veride uçuşların yaklaşık %62\'si zamanında.'
      },
      {
        t: 'code',
        stage: 'Rehberli',
        id: 'eda-kesifsel-3',
        diff: 2,
        needs: ['pandas'],
        q: '<p>Form kayıtlarını (<code>raw_signups</code>) analize hazırla. <code>kayitlari_temizle(r)</code> şu adımlarla <b>yeni</b> bir DataFrame döndürsün:</p><ol><li><code>email</code>: boşlukları kırp, küçük harfe çevir.</li><li><code>city</code>: <code>sehir_anahtar</code> ile anahtara çevir, <code>SEHIR</code> sözlüğüyle düzgün ada eşle (boşlar boş kalsın).</li><li><code>signup_date</code>: iki biçim var (<code>2024-02-10</code> ve <code>20.10.2024</code>); ikisini de datetime\'a çevir.</li><li>E-postaya göre kopyaları at (ilk kaydı tut), index\'i sıfırla.</li></ol>',
        guide: [
          'r = r.copy() ile başla; girdiyi değiştirme.',
          'email için .str.strip().str.lower().',
          'city için .map(sehir_anahtar).map(SEHIR).',
          'Tarih: önce format="%Y-%m-%d", errors="coerce"; kalan NaT\'leri format="%d.%m.%Y" sonucu ile fillna.',
          'drop_duplicates("email").reset_index(drop=True).'
        ],
        example: 'import pandas as pd\ns = pd.Series(["2024-03-01", "15.03.2024", "yok"])\nt = pd.to_datetime(s, format="%Y-%m-%d", errors="coerce")\nt = t.fillna(pd.to_datetime(s, format="%d.%m.%Y", errors="coerce"))\nprint(t.dt.strftime("%Y-%m-%d").tolist())\n',
        start: 'import veri\nimport pandas as pd\n\nr = veri.oku("anadolu_market", "raw_signups")\nSEHIR = {"istanbul": "İstanbul", "ankara": "Ankara", "izmir": "İzmir"}\n\n\ndef sehir_anahtar(s):\n    return s.strip().replace("İ", "i").lower() if isinstance(s, str) else s\n\n\ndef kayitlari_temizle(r):\n    r = r.copy()\n    r["email"] = r["email"]  # TODO: kırp + küçük harf\n    # TODO: city\n    # TODO: signup_date (iki biçim)\n    return r  # TODO: e-postaya göre tekilleştir, index sıfırla\n\n\nt = kayitlari_temizle(r)\nprint(len(t))\nprint(t["city"].value_counts(dropna=False))\n',
        sol: 'import veri\nimport pandas as pd\n\nr = veri.oku("anadolu_market", "raw_signups")\nSEHIR = {"istanbul": "İstanbul", "ankara": "Ankara", "izmir": "İzmir"}\n\n\ndef sehir_anahtar(s):\n    return s.strip().replace("İ", "i").lower() if isinstance(s, str) else s\n\n\ndef kayitlari_temizle(r):\n    r = r.copy()\n    r["email"] = r["email"].str.strip().str.lower()\n    r["city"] = r["city"].map(sehir_anahtar).map(SEHIR)\n    t = pd.to_datetime(r["signup_date"], format="%Y-%m-%d", errors="coerce")\n    r["signup_date"] = t.fillna(pd.to_datetime(r["signup_date"], format="%d.%m.%Y", errors="coerce"))\n    return r.drop_duplicates("email").reset_index(drop=True)\n\n\nt = kayitlari_temizle(r)\nprint(len(t))\nprint(t["city"].value_counts(dropna=False))\n',
        tests: 'ham = veri.oku("anadolu_market", "raw_signups")\nt = kayitlari_temizle(ham)\nassert len(ham) == 52, "Girdi DataFrame\'i değişmemeli"\nassert len(t) == 39, "E-postaya göre tekilleşince 39 kayıt kalmalı"\nassert t["email"].str.islower().all(), "Tüm e-postalar küçük harf olmalı"\nassert t["city"].value_counts().to_dict() == {"İstanbul": 17, "İzmir": 9, "Ankara": 7}, "Şehirler üç düzgün ada eşlenmeli: İstanbul 17, İzmir 9, Ankara 7"\nassert int(t["city"].isna().sum()) == 6, "Şehri boş 6 kayıt boş kalmalı"\nassert pd.api.types.is_datetime64_any_dtype(t["signup_date"]) and int(t["signup_date"].isna().sum()) == 0, "Tüm tarihler datetime\'a çevrilmeli (iki biçim de)"\nassert t.loc[0, "signup_date"] == pd.Timestamp("2024-07-29"), "İlk kaydın tarihi 29.07.2024 → 2024-07-29 olmalı"\nassert list(t.index[:2]) == [0, 1], "Index sıfırlanmalı"\n',
        hints: [
          'Her sütunu ayrı bir satırda dönüştür; <code>.str</code> erişicisi metin işlemlerini vektörleştirir.',
          'İki biçimli tarih: iki ayrı <code>to_datetime(..., errors="coerce")</code> ve <code>fillna</code>.',
          '<code>r.drop_duplicates("email").reset_index(drop=True)</code>'
        ],
        why: 'Kopyalar e-posta harf farkından gizleniyordu: normalleştirmeden 5, sonra 13 kopya çıkar. Türkçe "İ" küçültülünce birleşik nokta (i̇) ürettiği için anahtar fonksiyonunda önce "İ" → "i" çevrilir. Biçimi açıkça vermek (<code>format=</code>) gün/ay karışıklığını önler.'
      },
      {
        t: 'code',
        stage: 'Rehberli',
        id: 'eda-kesifsel-4',
        diff: 2,
        needs: ['pandas'],
        q: '<p>Bayi raporu (<code>kirli_veri/bayi</code>) Excel\'den kopyalanmış: ilk satır başlık metni, tutarlar Türkçe biçimli (<code>"1.250,50"</code>, <code>"1.430"</code>), boş satır ve tekrar eden satır var. Önce <code>tr_sayi(s)</code> fonksiyonunu yaz: Türkçe sayı metnini float\'a çevirsin; <code>"-"</code>, boş ya da None için <code>None</code> döndürsün. Sonra <code>bayi_temizle()</code> tabloyu okusun (<code>skiprows=2</code>, <code>dtype=str</code>), tamamen boş satırları ve birebir kopyaları atsın, <code>Tutar</code>\'ı <code>tr_sayi</code> ile çevirsin, index\'i sıfırlasın.</p>',
        guide: [
          'tr_sayi: None/boş/"-" kontrolü → None.',
          'Binlik noktaları sil: s.replace(".", ""), sonra ondalık virgülü noktaya çevir: .replace(",", ".").',
          'bayi_temizle: veri.oku("kirli_veri", "bayi", skiprows=2, dtype=str).',
          'dropna(how="all") → drop_duplicates() → Tutar.map(tr_sayi) → reset_index(drop=True).'
        ],
        example: 'metin = "12.345,6"\nprint(float(metin.replace(".", "").replace(",", ".")))\n',
        start: 'import veri\nimport pandas as pd\n\n\ndef tr_sayi(s):\n    # TODO: None, boş ve "-" için None\n    # TODO: binlik noktaları sil, virgülü noktaya çevir\n    return float(s)\n\n\ndef bayi_temizle():\n    b = veri.oku("kirli_veri", "bayi", skiprows=2, dtype=str)\n    # TODO: boş satırlar, kopyalar, Tutar dönüşümü, index\n    return b\n\n\nb = bayi_temizle()\nprint(b)\n',
        sol: 'import veri\nimport pandas as pd\n\n\ndef tr_sayi(s):\n    if s is None or (isinstance(s, float) and pd.isna(s)):\n        return None\n    s = str(s).strip()\n    if s in ("", "-"):\n        return None\n    return float(s.replace(".", "").replace(",", "."))\n\n\ndef bayi_temizle():\n    b = veri.oku("kirli_veri", "bayi", skiprows=2, dtype=str)\n    b = b.dropna(how="all").drop_duplicates()\n    b["Tutar"] = b["Tutar"].map(tr_sayi)\n    return b.reset_index(drop=True)\n\n\nb = bayi_temizle()\nprint(b)\n',
        tests: 'assert tr_sayi("1.250,50") == 1250.5 and tr_sayi("1.430") == 1430.0, "1.250,50 → 1250.5 ve 1.430 → 1430.0 (nokta binlik ayırıcı)"\nassert tr_sayi("760,25") == 760.25 and tr_sayi("980") == 980.0, "760,25 → 760.25, 980 → 980.0"\nassert tr_sayi("-") is None and tr_sayi(None) is None and tr_sayi("") is None, "\'-\', boş ve None için None"\nb = bayi_temizle()\nassert list(b.columns[:4]) == ["Bayi", "Şehir", "Tarih", "Tutar"], "skiprows=2 ile gerçek başlık satırı okunmalı"\nassert len(b) == 8, "Boş satır ve tekrar eden Merkez Bayi satırı atılınca 8 satır kalmalı"\nassert abs(b["Tutar"].sum() - 8466.5) < 1e-6, "Tutar toplamı 8466.5 olmalı (Alsancak \'-\' → boş)"\nassert int(b["Tutar"].isna().sum()) == 1, "Yalnız Alsancak\'ın tutarı boş olmalı"\nassert list(b.index) == list(range(8)), "Index sıfırlanmalı"\n',
        hints: [
          'Türkçe biçimde nokta binlik, virgül ondalıktır; önce noktayı sil, sonra virgülü noktaya çevir. Sıra önemli.',
          '<code>dropna(how="all")</code> yalnız tüm hücreleri boş satırları atar.',
          'Kopyayı tutarı çevirmeden ÖNCE ya da sonra atabilirsin; birebir aynı metinler zaten eşleşir.'
        ],
        why: '"1.430" metnini doğrudan float yapmak 1.43 verir: bin kat hata, raporu sessizce bozar. EDA\'da bu tip hatayı yakalamanın yolu aralık kontrolüdür: diğer bayiler 700–2.000 arasındayken 1.43 TL\'lik bir bayi anında göze batar.'
      },
      {
        t: 'code',
        stage: 'Kendin yaz',
        id: 'eda-kesifsel-5',
        diff: 2,
        needs: ['pandas'],
        q: '<p><code>iqr_sinirlari(s)</code> fonksiyonu sayısal bir Series alsın (boşları yok saysın) ve <code>(alt, ust, aykiri_sayisi)</code> döndürsün: <code>alt = Q1 - 1.5·IQR</code>, <code>ust = Q3 + 1.5·IQR</code>, aykırı = bu aralığın dışındaki değer sayısı (int). Ardından uçan uçuşların kalkış rötarı için çalıştır.</p>',
        start: 'import veri\nimport pandas as pd\n\nf = veri.oku("kanat_havayollari", "hv_flights",\n             parse_dates=["sched_dep", "sched_arr", "actual_dep", "actual_arr"])\nucan = f[f["status"] != "cancelled"]\nrotar = (ucan["actual_dep"] - ucan["sched_dep"]).dt.total_seconds() / 60\n\n\ndef iqr_sinirlari(s):\n    pass\n\n\nprint(iqr_sinirlari(rotar))\n',
        sol: 'import veri\nimport pandas as pd\n\nf = veri.oku("kanat_havayollari", "hv_flights",\n             parse_dates=["sched_dep", "sched_arr", "actual_dep", "actual_arr"])\nucan = f[f["status"] != "cancelled"]\nrotar = (ucan["actual_dep"] - ucan["sched_dep"]).dt.total_seconds() / 60\n\n\ndef iqr_sinirlari(s):\n    s = s.dropna()\n    q1, q3 = s.quantile(0.25), s.quantile(0.75)\n    iqr = q3 - q1\n    alt, ust = q1 - 1.5 * iqr, q3 + 1.5 * iqr\n    return float(alt), float(ust), int(((s < alt) | (s > ust)).sum())\n\n\nprint(iqr_sinirlari(rotar))\n',
        tests: 'assert iqr_sinirlari(rotar) == (-35.0, 61.0, 374), "Rötar için Q1=1, Q3=25, IQR=24: sınırlar (-35, 61), 374 aykırı"\nassert iqr_sinirlari(pd.Series([1, 2, 3, 4, 100, None])) == (-1.0, 7.0, 1), "Küçük örnek: (-1.0, 7.0, 1); None yok sayılmalı"\n',
        hints: ['<code>s.quantile(0.25)</code> ve <code>s.quantile(0.75)</code>.', 'Aykırı maskesi: <code>(s &lt; alt) | (s &gt; ust)</code>; toplamı int\'e çevir.'],
        why: 'IQR kuralı dağılım varsayımı yapmaz ve medyan çevresindeki yayılımı kullanır. Bu veride 374 uçuş (yaklaşık %12) aykırı çıkar; bu kadar çok "aykırı", dağılımın doğal olarak uzun kuyruklu olduğunu gösterir. Bunları silmek, tam da incelenmesi gereken uzun rötarları yok etmek olurdu.'
      },
      {
        t: 'code',
        stage: 'Kendin yaz',
        id: 'eda-kesifsel-6',
        diff: 2,
        needs: ['pandas'],
        q: '<p>S3: "Aralık\'taki kötüleşme hava koşulundan mı?" <code>aylik_neden_payi(f, d)</code> fonksiyonu, <code>hv_delays</code> (d) tablosunu uçuşların planlanan kalkış ayına (<code>"YYYY-MM"</code>) bağlasın ve her ay için nedenlerin <b>toplam rötar dakikası içindeki payını</b> veren bir çapraz tablo döndürsün: index ay, sütunlar neden, her satırın toplamı 1, değerler 3 basamak.</p>',
        start: 'import veri\nimport pandas as pd\n\nf = veri.oku("kanat_havayollari", "hv_flights",\n             parse_dates=["sched_dep", "sched_arr", "actual_dep", "actual_arr"])\nd = veri.oku("kanat_havayollari", "hv_delays")\n\n\ndef aylik_neden_payi(f, d):\n    pass\n\n\nprint(aylik_neden_payi(f, d))\n',
        sol: 'import veri\nimport pandas as pd\n\nf = veri.oku("kanat_havayollari", "hv_flights",\n             parse_dates=["sched_dep", "sched_arr", "actual_dep", "actual_arr"])\nd = veri.oku("kanat_havayollari", "hv_delays")\n\n\ndef aylik_neden_payi(f, d):\n    x = d.merge(f[["flight_id", "sched_dep"]], on="flight_id", how="left", validate="many_to_one")\n    x["ay"] = x["sched_dep"].dt.strftime("%Y-%m")\n    tablo = pd.crosstab(x["ay"], x["reason"], values=x["minutes"], aggfunc="sum", normalize="index")\n    return tablo.round(3)\n\n\nprint(aylik_neden_payi(f, d))\n',
        tests: 't = aylik_neden_payi(f, d)\nassert list(t.index) == ["2024-09", "2024-10", "2024-11", "2024-12"], "Index Eylül–Aralık 2024 ay metinleri olmalı"\nassert t.loc["2024-12", "hava"] == 0.382, "Aralık\'ta hava kaynaklı dakikaların payı 0.382 olmalı"\nassert t.loc["2024-09", "hava"] == 0.254, "Eylül\'de hava payı 0.254 olmalı"\nassert t.loc["2024-09", "gec_gelen_ucak"] == 0.239, "Eylül\'de geç gelen uçak payı 0.239"\nassert abs(t.loc["2024-12"].sum() - 1) < 0.005, "Her satırın toplamı 1 olmalı (normalize=\'index\')"\n',
        hints: ['Neden tablosunda tarih yok; flight_id ile uçuş tablosuna bağlan.', '<code>pd.crosstab(ay, reason, values=minutes, aggfunc="sum", normalize="index")</code>'],
        why: 'Sayı yerine dakika payına bakmak, "kaç kez" ile "ne kadar etki" ayrımını yapar. Hava kaynaklı dakikaların payı Eylül\'de %25\'ten Aralık\'ta %38\'e çıkıyor: S3 destekleniyor. Geç gelen uçak ikinci kalem (%25 dolayında); zincirleme etki ayrıca incelenmeli (S4).'
      },
      {
        t: 'code',
        stage: 'Kendin yaz',
        id: 'eda-kesifsel-7',
        diff: 2,
        needs: ['pandas', 'numpy'],
        q: '<p>S2: "Akşam uçuşları daha mı geç kalkıyor?" <code>dilim_profili(f)</code> fonksiyonu iptal edilmemiş uçuşları planlanan kalkış saatine göre üç dilime ayırsın: <code>sabah</code> (saat &lt; 12), <code>ogle</code> (12–17), <code>aksam</code> (18 ve sonrası). Her dilim için <code>ucus</code> (sayı), <code>medyan</code> (rötar dk) ve <code>gec_orani</code> (15 dk üstü, 3 basamak) sütunlarını içeren, index\'i dilim adı olan bir DataFrame döndürsün.</p>',
        start: 'import veri\nimport pandas as pd\n\nf = veri.oku("kanat_havayollari", "hv_flights",\n             parse_dates=["sched_dep", "sched_arr", "actual_dep", "actual_arr"])\nimport numpy as np\n\n\ndef dilim_profili(f):\n    pass\n\n\nprint(dilim_profili(f))\n',
        sol: 'import veri\nimport pandas as pd\n\nf = veri.oku("kanat_havayollari", "hv_flights",\n             parse_dates=["sched_dep", "sched_arr", "actual_dep", "actual_arr"])\nimport numpy as np\n\n\ndef dilim_profili(f):\n    u = f[f["status"] != "cancelled"].copy()\n    u["rotar"] = (u["actual_dep"] - u["sched_dep"]).dt.total_seconds() / 60\n    saat = u["sched_dep"].dt.hour\n    u["dilim"] = np.select([saat < 12, saat < 18], ["sabah", "ogle"], "aksam")\n    return u.groupby("dilim").agg(\n        ucus=("rotar", "size"),\n        medyan=("rotar", "median"),\n        gec_orani=("rotar", lambda x: round(float((x > 15).mean()), 3)),\n    )\n\n\nprint(dilim_profili(f))\n',
        tests: 'p = dilim_profili(f)\nassert set(p.index) == {"sabah", "ogle", "aksam"}, "Üç dilim olmalı: sabah, ogle, aksam"\nassert p.loc["aksam", "ucus"] == 1096 and p.loc["sabah", "ucus"] == 1260, "Akşam 1096, sabah 1260 uçuş"\nassert p.loc["aksam", "medyan"] == 14.0 and p.loc["ogle", "medyan"] == 5.0, "Medyan: akşam 14, öğle 5 dakika"\nassert p.loc["aksam", "gec_orani"] == 0.474 and p.loc["ogle", "gec_orani"] == 0.322, "Geç oranı: akşam 0.474, öğle 0.322"\nassert int(p["ucus"].sum()) == 3111, "Toplam 3111 uçan uçuş"\n',
        hints: [
          '<code>np.select([kosul1, kosul2], [deger1, deger2], varsayilan)</code> koşulları sırayla dener.',
          'Adlandırılmış agg: <code>groupby("dilim").agg(ucus=("rotar", "size"), ...)</code>.'
        ],
        why: 'Akşam diliminde medyan rötar neredeyse üç kat, geç kalkış oranı %47. Bu bir gözlemdir; nedeni (gün içinde biriken gecikme mi, akşam trafiği mi?) S4 ile test edilir. Dilimleri np.select ile tanımlamak, eşik değerlerini tek yerde ve okunur tutar.'
      },
      {
        t: 'code',
        stage: 'Kendin yaz',
        id: 'eda-kesifsel-8',
        diff: 2,
        needs: ['pandas'],
        q: '<p>S5: "Dolu uçaklar daha mı geç kalkıyor?" <code>iliski_tablosu(f, ucak)</code> fonksiyonu iptal edilmemiş uçuşlar için doluluk (<code>pax / seats</code>, koltuk sayısı <code>hv_aircraft</code>\'tan) ve kalkış rötarını hesaplasın; şu Spearman korelasyonlarını 3 basamakla sözlük olarak döndürsün: <code>doluluk_rotar</code>, <code>saat_rotar</code> (planlanan kalkış saati ile rötar). Birleştirmede <code>validate</code> kullan.</p>',
        start: 'import veri\nimport pandas as pd\n\nf = veri.oku("kanat_havayollari", "hv_flights",\n             parse_dates=["sched_dep", "sched_arr", "actual_dep", "actual_arr"])\nucak = veri.oku("kanat_havayollari", "hv_aircraft")\n\n\ndef iliski_tablosu(f, ucak):\n    pass\n\n\nprint(iliski_tablosu(f, ucak))\n',
        sol: 'import veri\nimport pandas as pd\n\nf = veri.oku("kanat_havayollari", "hv_flights",\n             parse_dates=["sched_dep", "sched_arr", "actual_dep", "actual_arr"])\nucak = veri.oku("kanat_havayollari", "hv_aircraft")\n\n\ndef iliski_tablosu(f, ucak):\n    u = f[f["status"] != "cancelled"].merge(ucak[["tail_no", "seats"]], on="tail_no",\n                                            how="left", validate="many_to_one")\n    u["rotar"] = (u["actual_dep"] - u["sched_dep"]).dt.total_seconds() / 60\n    u["doluluk"] = u["pax"] / u["seats"]\n    u["saat"] = u["sched_dep"].dt.hour\n    return {\n        "doluluk_rotar": round(float(u["doluluk"].rank().corr(u["rotar"].rank())), 3),\n        "saat_rotar": round(float(u["saat"].rank().corr(u["rotar"].rank())), 3),\n    }\n\n\nprint(iliski_tablosu(f, ucak))\n',
        tests: 'r = iliski_tablosu(f, ucak)\nassert r == {"doluluk_rotar": -0.002, "saat_rotar": 0.127}, "Beklenen: doluluk ile ilişki yok (-0.002), saat ile zayıf pozitif (0.127)"\nassert "validate" in __source__, "merge\'te validate=\'many_to_one\' ile anahtarı denetle"\n',
        hints: [
          'Koltuk sayısı uçak tablosunda; tail_no ile bağla.',
          'Spearman, sıralar üzerinde Pearson\'dır: <code>s1.rank().corr(s2.rank())</code> (scipy gerektirmez; <code>method="spearman"</code> da aynı sonucu verir ama scipy ister).'
        ],
        why: 'Doluluk ile rötar arasında ilişki yok; saat ile zayıf pozitif bir ilişki var (geç saatlerde rötar artıyor). Korelasyonun 0.13 olması "etkisiz" demek değildir: dilim bazında medyan 5\'ten 14\'e çıkıyor ama ilişki doğrusal/tekdüze değil, eşik etkisi gibi. Tek sayıya değil, grup özetine de bak.'
      },
      {
        t: 'code',
        stage: 'Hata avı',
        id: 'eda-kesifsel-9',
        diff: 2,
        kind: 'bug',
        needs: ['pandas'],
        q: '<p><b>Hatayı bul ve düzelt.</b> <code>ozet(f)</code> uçan (iptal edilmemiş) uçuşlar için <code>(ortalama_rotar, zamaninda_orani)</code> döndürmeli; zamanında = rötar ≤ 15 dk, ikisi de 3 basamak. Mevcut kod hata vermiyor ama ortalamayı 24.48, zamanında oranını 0.628 buluyor; operasyon ekibinin hesabıyla tutmuyor.</p>',
        start: 'import veri\nimport pandas as pd\n\nf = veri.oku("kanat_havayollari", "hv_flights",\n             parse_dates=["sched_dep", "sched_arr", "actual_dep", "actual_arr"])\n\n\ndef ozet(f):\n    rotar = (f["actual_dep"] - f["sched_dep"]).dt.total_seconds() / 60\n    rotar = rotar.fillna(0)\n    return round(float(rotar.mean()), 3), round(float((rotar <= 15).mean()), 3)\n\n\nprint(ozet(f))\n',
        sol: 'import veri\nimport pandas as pd\n\nf = veri.oku("kanat_havayollari", "hv_flights",\n             parse_dates=["sched_dep", "sched_arr", "actual_dep", "actual_arr"])\n\n\ndef ozet(f):\n    ucan = f[f["status"] != "cancelled"]\n    rotar = (ucan["actual_dep"] - ucan["sched_dep"]).dt.total_seconds() / 60\n    return round(float(rotar.mean()), 3), round(float((rotar <= 15).mean()), 3)\n\n\nprint(ozet(f))\n',
        tests: 'o = ozet(f)\nassert o == (24.972, 0.621), "Uçan 3111 uçuşta ortalama 24.972 dk, zamanında oranı 0.621 olmalı. İptal uçuşlar 0 dakika rötar sayılmamalı"\n',
        hints: [
          'fillna(0), iptal uçuşları "0 dakika rötar, zamanında kalkmış" gibi sayıyor.',
          'Boşları doldurmak yerine iptal uçuşları filtrele: <code>f[f["status"] != "cancelled"]</code>.'
        ],
        why: 'Eksik değerin anlamı "sıfır" değil, "uçuş yok"tur. 62 iptali 0 dakikayla doldurmak hem ortalamayı düşürür hem de iptalleri zamanında kalkmış gösterir; kötü bir günü iyi gösteren klasik metrik hatası. İptal oranı ayrı bir metrik olarak raporlanmalı (%1.95).'
      },
      {
        t: 'code',
        stage: 'Hata avı',
        id: 'eda-kesifsel-10',
        diff: 2,
        kind: 'bug',
        needs: ['pandas'],
        q: '<p><b>Hatayı bul ve düzelt.</b> Bayi tutarlarını sayıya çeviren <code>tutar_cevir(s)</code> fonksiyonu <code>"1.430"</code> için 1.43, <code>"1.250,50"</code> için hata veriyor. Türkçe biçimde nokta binlik, virgül ondalık ayırıcıdır. Fonksiyon <code>"-"</code> için <code>None</code> döndürmeli. Ardından <code>bayi_toplam()</code> doğru toplamı versin.</p>',
        start: 'import veri\nimport pandas as pd\n\n\ndef tutar_cevir(s):\n    if s == "-":\n        return None\n    return float(s.replace(",", "."))\n\n\ndef bayi_toplam():\n    b = veri.oku("kirli_veri", "bayi", skiprows=2, dtype=str).dropna(how="all").drop_duplicates()\n    return round(sum(x for x in b["Tutar"].map(tutar_cevir) if pd.notna(x)), 2)\n\n\nprint(tutar_cevir("1.430"), bayi_toplam())\n',
        sol: 'import veri\nimport pandas as pd\n\n\ndef tutar_cevir(s):\n    if s == "-":\n        return None\n    return float(s.replace(".", "").replace(",", "."))\n\n\ndef bayi_toplam():\n    b = veri.oku("kirli_veri", "bayi", skiprows=2, dtype=str).dropna(how="all").drop_duplicates()\n    return round(sum(x for x in b["Tutar"].map(tutar_cevir) if pd.notna(x)), 2)\n\n\nprint(tutar_cevir("1.430"), bayi_toplam())\n',
        tests: 'assert tutar_cevir("1.430") == 1430.0, "1.430 bin dört yüz otuz demek: 1430.0"\nassert tutar_cevir("1.250,50") == 1250.5, "1.250,50 → 1250.5"\nassert tutar_cevir("2.040,00") == 2040.0 and tutar_cevir("890") == 890.0, "2.040,00 → 2040.0, 890 → 890.0"\nassert tutar_cevir("-") is None, "\'-\' için None"\nassert bayi_toplam() == 8466.5, "Temiz toplam 8466.5 olmalı"\n',
        hints: [
          'Önce binlik ayırıcı noktaları kaldır, sonra ondalık virgülü noktaya çevir.',
          '<code>s.replace(".", "").replace(",", ".")</code>; sıra ters olursa ondalık noktayı da silersin.'
        ],
        why: '"1.430" İngilizce biçimde 1,43 okunur; sessiz bir bin kat hata. "1.250,50" ise iki nokta içerdiği için float\'a hiç çevrilemez. Yerel biçimli sayılarda kuralı açıkça uygula ya da okurken <code>pd.read_csv(..., thousands=".", decimal=",")</code> ver.'
      },
      {
        t: 'code',
        stage: 'Meydan okuma',
        id: 'eda-kesifsel-11',
        diff: 3,
        needs: ['pandas'],
        q: '<p>S4: "Rötar uçaktan uçağa yayılıyor mu?" <code>yayilim(f)</code> fonksiyonu şunu hesaplasın:</p><ul><li>Uçuşları <code>tail_no</code> ve <code>sched_dep</code>\'e göre sırala; her uçuş için <b>aynı uçağın bir önceki uçuşunun</b> varış rötarını (<code>actual_arr - sched_arr</code>, dk) bul.</li><li>Yalnız iptal edilmemiş ve önceki varış rötarı bilinen uçuşları al.</li><li>Önceki varış rötarı &gt; 15 olanlar (<code>onceki_gec</code>) ile olmayanlar (<code>onceki_zamaninda</code>) arasında, uçuşun kendi kalkış rötarının 15 dk\'yı aşma oranını karşılaştır.</li></ul><p>Dönüş: <code>{"onceki_gec": oran, "onceki_zamaninda": oran, "n": uçuş_sayısı}</code>, oranlar 3 basamak.</p>',
        start: 'import veri\nimport pandas as pd\n\nf = veri.oku("kanat_havayollari", "hv_flights",\n             parse_dates=["sched_dep", "sched_arr", "actual_dep", "actual_arr"])\n\n\ndef yayilim(f):\n    pass\n\n\nprint(yayilim(f))\n',
        sol: 'import veri\nimport pandas as pd\n\nf = veri.oku("kanat_havayollari", "hv_flights",\n             parse_dates=["sched_dep", "sched_arr", "actual_dep", "actual_arr"])\n\n\ndef yayilim(f):\n    g = f.sort_values(["tail_no", "sched_dep", "flight_id"]).copy()\n    g["rotar"] = (g["actual_dep"] - g["sched_dep"]).dt.total_seconds() / 60\n    g["varis_rotar"] = (g["actual_arr"] - g["sched_arr"]).dt.total_seconds() / 60\n    g["onceki_varis"] = g.groupby("tail_no")["varis_rotar"].shift(1)\n    g = g[(g["status"] != "cancelled") & g["onceki_varis"].notna()]\n    gec = g["onceki_varis"] > 15\n    return {\n        "onceki_gec": round(float((g.loc[gec, "rotar"] > 15).mean()), 3),\n        "onceki_zamaninda": round(float((g.loc[~gec, "rotar"] > 15).mean()), 3),\n        "n": int(len(g)),\n    }\n\n\nprint(yayilim(f))\n',
        tests: 'r = yayilim(f)\nassert r["n"] == 3026, "Önceki varışı bilinen uçan uçuş sayısı 3026 olmalı (shift grup içinde yapılmalı)"\nassert r == {"onceki_gec": 0.466, "onceki_zamaninda": 0.319, "n": 3026}, "Beklenen oranlar: önceki geç 0.466, önceki zamanında 0.319"\n',
        hints: [
          'Önceki uçuş = aynı uçağın sıralı bir önceki satırı: <code>groupby("tail_no")["varis_rotar"].shift(1)</code>.',
          'shift\'ten ÖNCE sırala; filtreyi shift\'ten SONRA uygula (yoksa iptal uçuşlar "önceki" zincirden düşer ve komşuluk bozulur).'
        ],
        why: 'Fark belirgin: önceki uçuş geç vardığında kalkış rötarı riski %32\'den %47\'ye çıkıyor. Yine de bu nedensellik değildir: bu filoda iki uçuş arası medyan 472 dakika, yani uçak çoğu zaman saatlerce yerde bekliyor. Bu yüzden "geç gelen uçak" etiketinin (insanların seçtiği neden kodu) gerçekte ne ölçtüğünü sorgulamak değerli bir EDA bulgusudur. Ayrıca bir tutarsızlık bulduğunda önce yöntemi kontrol et: sıralama ve grup içi kaydırma doğru mu?'
      },
      {
        t: 'code',
        stage: 'Meydan okuma',
        id: 'eda-kesifsel-12',
        diff: 3,
        needs: ['pandas'],
        q: '<p>"En kötü rotalar" listesi küçük örneklere kanmamalı. <code>en_kotu_rotalar(f, rotalar, min_ucus=50, n=3)</code> iptal edilmemiş uçuşlarda rota bazında zamanında kalkış oranını (OTP: rötar ≤ 15 dk) hesaplasın, en az <code>min_ucus</code> uçuşu olan rotaları tutsun ve OTP\'si en düşük <code>n</code> rotayı <code>[("FRA-IST", 0.482, 85), ...]</code> biçiminde (rota adı <code>origin-dest</code>, OTP 3 basamak, uçuş sayısı) döndürsün. Eşitlikte rota adına göre sırala.</p>',
        start: 'import veri\nimport pandas as pd\n\nf = veri.oku("kanat_havayollari", "hv_flights",\n             parse_dates=["sched_dep", "sched_arr", "actual_dep", "actual_arr"])\nrotalar = veri.oku("kanat_havayollari", "hv_routes")\n\n\ndef en_kotu_rotalar(f, rotalar, min_ucus=50, n=3):\n    pass\n\n\nprint(en_kotu_rotalar(f, rotalar))\n',
        sol: 'import veri\nimport pandas as pd\n\nf = veri.oku("kanat_havayollari", "hv_flights",\n             parse_dates=["sched_dep", "sched_arr", "actual_dep", "actual_arr"])\nrotalar = veri.oku("kanat_havayollari", "hv_routes")\n\n\ndef en_kotu_rotalar(f, rotalar, min_ucus=50, n=3):\n    u = f[f["status"] != "cancelled"].merge(rotalar, on="route_id", how="left", validate="many_to_one")\n    u["rota"] = u["origin"] + "-" + u["dest"]\n    u["zamaninda"] = (u["actual_dep"] - u["sched_dep"]).dt.total_seconds() / 60 <= 15\n    g = u.groupby("rota")["zamaninda"].agg(otp="mean", ucus="size").reset_index()\n    g = g[g["ucus"] >= min_ucus]\n    g["otp"] = g["otp"].round(3)\n    g = g.sort_values(["otp", "rota"]).head(n)\n    return [(r, float(o), int(c)) for r, o, c in zip(g["rota"], g["otp"], g["ucus"])]\n\n\nprint(en_kotu_rotalar(f, rotalar))\n',
        tests: 'r = en_kotu_rotalar(f, rotalar)\nassert r == [("FRA-IST", 0.482, 85), ("ESB-ADB", 0.486, 70), ("IST-ADA", 0.493, 69)], "En kötü üç rota FRA-IST, ESB-ADB, IST-ADA olmalı"\nr2 = en_kotu_rotalar(f, rotalar, min_ucus=40, n=1)\nassert r2 == [("IST-VAN", 0.449, 49)], "Eşik 40 olunca 49 uçuşlu IST-VAN en kötü çıkar; 50 eşiği onu dışarıda bırakır"\nassert len(en_kotu_rotalar(f, rotalar, min_ucus=10**6)) == 0, "Eşiği geçen rota yoksa boş liste"\n',
        hints: [
          'Rota bilgisi hv_routes\'ta; route_id ile bağla ve origin + "-" + dest ile ad üret.',
          'Boolean sütunun ortalaması orandır; <code>agg(otp="mean", ucus="size")</code> ile ikisini birlikte al, sonra eşiği uygula.'
        ],
        why: 'Küçük örneklemli gruplar sıralamanın en altına ve en üstüne şans eseri yerleşir. Minimum hacim eşiği (ya da güven aralığı) koymak, "en kötü rota" listesinin rastlantıya değil gerçeğe dayanmasını sağlar. IST-VAN yalnız 1 uçuş eksikle elendi; raporda bu sınırı not etmek dürüstlüktür.'
      },
      {
        t: 'code',
        stage: 'Mini proje',
        id: 'eda-kesifsel-13',
        diff: 3,
        needs: ['pandas'],
        q: '<p><b>Kanat Havayolları rötar EDA\'sı: yönetici özeti.</b> <code>rotar_raporu(f, d)</code> fonksiyonu aşağıdaki anahtarlarla bir sözlük döndürsün:</p><ul><li><code>ucus</code>: toplam uçuş; <code>iptal_orani</code>: iptal oranı (4 basamak)</li><li><code>medyan</code>: uçan uçuşlarda medyan kalkış rötarı; <code>otp</code>: rötar ≤ 15 oranı (3 basamak)</li><li><code>en_kotu_ay</code>: medyan rötarı en yüksek ay (<code>"YYYY-MM"</code>)</li><li><code>en_buyuk_neden</code>: toplam dakikası en yüksek neden</li><li><code>hava_payi_degisim</code>: hava kaynaklı dakika payının ilk aydan son aya değişimi (yüzde puan, 1 basamak; ör. 25.4 → 38.2 ise 12.8)</li><li><code>bulgular</code>: en az 3 elemanlı metin listesi; her eleman <code>"gözlem → kanıt → sonraki adım"</code> biçiminde iki <code>→</code> içersin.</li></ul>',
        start: 'import veri\nimport pandas as pd\n\nf = veri.oku("kanat_havayollari", "hv_flights",\n             parse_dates=["sched_dep", "sched_arr", "actual_dep", "actual_arr"])\nd = veri.oku("kanat_havayollari", "hv_delays")\n\n\ndef rotar_raporu(f, d):\n    pass\n\n\nfor k, v in rotar_raporu(f, d).items():\n    print(k, ":", v)\n',
        sol: 'import veri\nimport pandas as pd\n\nf = veri.oku("kanat_havayollari", "hv_flights",\n             parse_dates=["sched_dep", "sched_arr", "actual_dep", "actual_arr"])\nd = veri.oku("kanat_havayollari", "hv_delays")\n\n\ndef rotar_raporu(f, d):\n    f = f.copy()\n    f["ay"] = f["sched_dep"].dt.strftime("%Y-%m")\n    f["rotar"] = (f["actual_dep"] - f["sched_dep"]).dt.total_seconds() / 60\n    ucan = f[f["status"] != "cancelled"]\n    aylik_medyan = ucan.groupby("ay")["rotar"].median()\n\n    x = d.merge(f[["flight_id", "ay"]], on="flight_id", how="left", validate="many_to_one")\n    dakika = x.groupby("reason")["minutes"].sum()\n    pay = pd.crosstab(x["ay"], x["reason"], values=x["minutes"], aggfunc="sum", normalize="index")\n    hava = pay["hava"] * 100\n    hava_degisim = round(float(hava.iloc[-1] - hava.iloc[0]), 1)\n\n    rapor = {\n        "ucus": int(len(f)),\n        "iptal_orani": round(float((f["status"] == "cancelled").mean()), 4),\n        "medyan": float(ucan["rotar"].median()),\n        "otp": round(float((ucan["rotar"] <= 15).mean()), 3),\n        "en_kotu_ay": aylik_medyan.idxmax(),\n        "en_buyuk_neden": dakika.idxmax(),\n        "hava_payi_degisim": hava_degisim,\n    }\n    rapor["bulgular"] = [\n        f"Aralık en kötü ay → medyan rötar {aylik_medyan.min():.0f} dk\'dan {aylik_medyan.max():.0f} dk\'ya çıktı → kış tarifesine tampon süre senaryosu",\n        f"Hava kaynaklı rötar payı arttı → payı {hava.iloc[0]:.1f}%\'ten {hava.iloc[-1]:.1f}%\'e çıktı → havalimanı bazında ayrıştır",\n        f"Zamanında kalkış oranı düşük → OTP {rapor[\'otp\']:.1%} → akşam dilimi ve en kötü rotalar için kök neden analizi",\n    ]\n    return rapor\n\n\nfor k, v in rotar_raporu(f, d).items():\n    print(k, ":", v)\n',
        tests: 'r = rotar_raporu(f, d)\nassert r["ucus"] == 3173 and r["iptal_orani"] == 0.0195, "3173 uçuş, iptal oranı 0.0195"\nassert r["medyan"] == 7.0 and r["otp"] == 0.621, "Medyan 7 dk, OTP 0.621 (yalnız uçan uçuşlar)"\nassert r["en_kotu_ay"] == "2024-12", "En kötü ay Aralık 2024"\nassert r["en_buyuk_neden"] == "hava", "Toplam dakikada en büyük neden hava"\nassert r["hava_payi_degisim"] == 12.8, "Hava payı 25.4\'ten 38.2\'ye: +12.8 puan"\nassert isinstance(r["bulgular"], list) and len(r["bulgular"]) >= 3, "En az 3 bulgu yaz"\nassert all(b.count("→") >= 2 for b in r["bulgular"]), "Her bulgu gözlem → kanıt → sonraki adım biçiminde olmalı"\nassert f["sched_dep"].dtype.kind == "M" and "ay" not in f.columns, "Girdi DataFrame\'ine sütun ekleme; kopya üzerinde çalış"\n',
        hints: [
          'Önce ortak türetilmiş sütunları (ay, rotar) bir kopyada üret; sonra her metriği ayrı satırda hesapla.',
          '<code>idxmax()</code> en büyük değerin index\'ini (ay ya da neden) verir.',
          'Hava payı için crosstab(normalize="index") ve ilk/son satır farkı × 100.'
        ],
        why: 'Bu proje EDA\'nın çıktısının "bir sözlük + üç cümle" kadar yoğun olabileceğini gösterir: sayılar test edilebilir, bulgular karar verdirir. Gerçek işte bu sözlük bir HTML/Markdown rapor şablonunu doldurur (bkz. Jinja2 ve rapor otomasyonu) ve her ay aynı kodla yeniden üretilir.'
      }
    ],
    faq: [
      {
        q: 'EDA ne zaman biter?',
        a: 'Hipotez defterindeki sorular cevaplandığında ya da cevaplanamayacağı (veri yetersiz) netleştiğinde. Zaman kutusu koy (ör. 1 gün); süre dolunca bulguları yaz, açık soruları "sonraki adım" olarak listele. EDA sonsuz olabilir; karar verdirmesi gereken bir iştir.'
      },
      {
        q: 'Kaç grafik çizmeliyim?',
        a: 'Keşif sırasında istediğin kadar; raporda ise her bulgu için bir tane. Okuyucunun 10 saniyede ne göreceğini bildiğin grafik iyi grafiktir. Başlığa sonucu yaz: "Aralık\'ta medyan rötar 3 kat arttı" gibi.'
      },
      {
        q: 'Eksik değerleri ne zaman doldurmalıyım?',
        a: 'EDA\'da doldurma; önce eksikliğin nedenini anla (iptal, yönlendirme, form alanı isteğe bağlı, sistem hatası). Neden rastgele değilse doldurmak yanlılık üretir. Modelleme aşamasında doldurma kararı eğitim verisine göre ve bir pipeline içinde verilir (bkz. ML pipeline dersi).'
      },
      {
        q: 'Notebook mu, script mi?',
        a: 'Keşif notebook\'ta, tekrar kullanılacak parçalar (profil, temizlik, metrik fonksiyonları) .py modülünde. Notebook\'u yukarıdan aşağı yeniden çalıştırınca aynı sonucu vermeli (Restart &amp; Run All); bu, bulgularının tekrarlanabilir olduğunun en basit kanıtıdır.'
      }
    ],
    mistakes: [
      {
        why: 'Eksik "sıfır" demek değildir; iptal uçuşu 0 dakika rötar saymak metriği iyileştirir ve iptalleri gizler.',
        bad: 'rotar = rotar.fillna(0)\nprint(rotar.mean())',
        good: 'ucan = f[f["status"] != "cancelled"]\nprint(ucan["rotar"].mean())'
      },
      {
        why: 'Uzun kuyruklu iş verisinde "aykırı" çoğunlukla asıl hikâyedir; silmeden önce imkânsız mı yoksa sadece büyük mü olduğunu anla.',
        bad: 'q3 = s.quantile(0.75); ust = q3 + 1.5 * (q3 - s.quantile(0.25))\ns = s[s <= ust]   # aykırıları sil',
        good: 'aykiri = s > ust\nprint(aykiri.sum(), s[aykiri].describe())   # önce incele'
      },
      {
        why: 'Yerel sayı biçimi sessiz bin kat hatalar üretir; describe() ile aralığa bakmak bunu ilk dakikada yakalar.',
        bad: 'print(df["tutar"].mean())   # "1.430" metni 1.43 okunmuş',
        good: 'df = pd.read_csv(yol, thousands=".", decimal=",")\nprint(df["tutar"].describe())'
      },
      {
        why: 'Az gözlemli gruplar şans eseri en uçlara düşer; hacim eşiği koymadan sıralama yapma.',
        bad: 'df.groupby("rota")["zamaninda"].mean().nsmallest(3)',
        good: 'g = df.groupby("rota")["zamaninda"].agg(["mean", "size"])\ng[g["size"] >= 50].nsmallest(3, "mean")'
      },
      {
        why: 'Harf ve boşluk farkları kopyaları gizler; benzersizliği normalleştirdikten sonra say.',
        bad: 'r["email"].nunique()   # 40 sanıyorsun',
        good: 'r["email"].str.strip().str.lower().nunique()'
      }
    ]
  }
);
})(window);
