BODY = r'''
<h2>Metrik, analistin ürünüdür</h2>
<p>Yönetim "ciro neden düştü?", pazarlama "kampanya işe yaradı mı?", finans "bir müşteri bize ne kadar kazandırıyor?" diye sorar. Bu soruların hepsi bir <b>metrik</b> (metric) ve onun doğru hesaplanmış, doğru karşılaştırılmış bir değeri ister. pandas ile gruplamayı, istatistik dersinde A/B testini gördün. Bu ders analitik ekiplerin her gün kullandığı kalıpları toplar: KPI ağacı, huni, kohort ve tutundurma, LTV, dönem karşılaştırmaları, köprü analizi, Pareto ve en sık metrik tuzakları.</p>
<p>Veri: Anadolu Market <code>orders</code>, <code>order_items</code>, <code>products</code> ve <code>web_events</code> (Ekim–Kasım 2024 site olayları); ayrıca PBIPatika'daki <code>kesit_bi</code> yıldız şemasının <code>Satislar</code> tablosu. Ciro tanımı bu derste de aynı: net = <code>quantity × unit_price × (1 − discount)</code>, yalnız <code>delivered</code> ve <code>shipped</code> siparişler.</p>

<h2>1. KPI ağacı ve metrik sözleşmesi</h2>
<p>Ciro tek başına "neden" söylemez. Onu çarpanlarına ayırınca hangi kolun hareket ettiği görünür:</p>
<pre class="code">ciro = aktif müşteri × müşteri başına sipariş (frekans) × ortalama sepet (AOV)
AOV  = sipariş başına ürün adedi × ortalama birim fiyat
web cirosu = ziyaretçi × dönüşüm oranı × AOV</pre>
<pre class="py">import veri
import pandas as pd

o = veri.oku("anadolu_market", "orders", parse_dates=["order_date"])
i = veri.oku("anadolu_market", "order_items")
i["net"] = i["quantity"] * i["unit_price"] * (1 - i["discount"])
x = o[o["status"].isin(["delivered", "shipped"])].merge(i, on="order_id", validate="one_to_many")

yil = x.groupby(x["order_date"].dt.year).agg(
    ciro=("net", "sum"), siparis=("order_id", "nunique"), musteri=("customer_id", "nunique"))
yil["frekans"] = yil["siparis"] / yil["musteri"]
yil["aov"] = yil["ciro"] / yil["siparis"]
print(yil.round(2))

# 2023 → 2024 büyümesinin kaynakları (çarpanların oranları)
b = yil.loc[2024] / yil.loc[2023]
print("ciro x", round(b["ciro"], 3), "= müşteri x", round(b["musteri"], 3),
      "· frekans x", round(b["frekans"], 3), "· AOV x", round(b["aov"], 3))</pre>
<p>2024'te ciro 1,88 katına çıkmış; bunun büyük kısmı aktif müşteri sayısındaki artıştan (×1,62), daha azı frekans (×1,08) ve AOV'den (×1,07) geliyor. Yönetime "büyüme yeni müşteriden geldi" demek artık bir sayıya dayanıyor.</p>
<p>Her metrik için yazılı bir <b>sözleşme</b> (metric definition) tut: ad, formül, pay ve payda, dahil/hariç durumlar (iptal, iade, test kullanıcıları), zaman damgası (sipariş mi teslim tarihi mi?), sahibi. "Dönüşüm oranı" iki ekipte iki farklı şey demeye başladığı an, toplantılar sayı tartışmasına döner.</p>

<h2>2. Huni analizi</h2>
<p>Huni (funnel), kullanıcıların adım adım nerede döküldüğünü gösterir. Her adımda o adımı yapan <b>tekil kullanıcı</b> sayılır; olay sayısı değil.</p>
<pre class="py">import veri
import pandas as pd

w = veri.oku("anadolu_market", "web_events")
adimlar = ["visit", "product_view", "add_to_cart", "checkout", "purchase"]

huni = w.groupby("event_type")["user_id"].nunique().reindex(adimlar).to_frame("kullanici")
huni["adim_donusum"] = (huni["kullanici"] / huni["kullanici"].shift(1)).round(3)
huni["toplam_donusum"] = (huni["kullanici"] / huni["kullanici"].iloc[0]).round(3)
print(huni)

cihaz = w.pivot_table(index="event_type", columns="device", values="user_id", aggfunc="nunique").reindex(adimlar)
print((cihaz.loc["purchase"] / cihaz.loc["visit"]).round(3))</pre>
<p>En büyük kayıp ürün görüntülemeden sepete geçişte (%40); mobilde ziyaretten satın almaya dönüşüm masaüstünden düşük. Huniyi bir kırılımla (cihaz, kaynak, yeni/eski kullanıcı) okumak "nerede" sorusunu "kimde" sorusuna çevirir.</p>
<div class="tip"><b>Katı huni mi, gevşek huni mi?</b>Gevşek huni her adımı bağımsız sayar. Katı (strict) huni ise bir adımı yalnız önceki adımları da yapmış kullanıcılar için sayar; sırayı ve zaman penceresini (ör. 7 gün içinde) de şart koşabilir. Bu veride ikisi aynı sonucu veriyor; gerçek veride sepete doğrudan bağlantıyla gelenler yüzünden genellikle farklıdır. Hangisini kullandığını sözleşmeye yaz.</div>

<h2>3. Kohort, tutundurma ve churn</h2>
<p>Kohort (cohort), aynı dönemde başlayan müşteri grubudur. Tutundurma (retention) tablosu her kohortun sonraki dönemlerde ne kadarının geri geldiğini gösterir. SQL sürümünü <b>Python'dan SQL ile analiz</b> dersinde yazdın; burada pandas ile çeyreklik kohort kuruyoruz.</p>
<pre class="py">import veri
import pandas as pd

o = veri.oku("anadolu_market", "orders", parse_dates=["order_date"])
o["donem"] = o["order_date"].dt.to_period("Q")
o["kohort"] = o.groupby("customer_id")["donem"].transform("min")
o["fark"] = (o["donem"] - o["kohort"]).apply(lambda d: d.n)

sayim = o.groupby(["kohort", "fark"])["customer_id"].nunique().unstack()   # gelecekteki hücreler NaN kalır
oran = sayim.div(sayim[0], axis=0).round(2)
print(oran.iloc[-6:, :5])</pre>
<div class="warn"><b>Gelecek hücreleri 0 ile doldurma</b><code>unstack(fill_value=0)</code> yazarsan 2024Q4 kohortunun 1. çeyreği "%0 tutundurma" görünür; oysa o çeyrek henüz yaşanmadı. Ortalama tutundurma eğrisini hesaplarken bu sıfırlar eğriyi aşağı çeker. Gözlemlenmemiş dönemi NaN bırak; ortalamayı yalnız gözlemlenen hücrelerden al.</div>
<p><b>Churn</b> (müşteri kaybı) sözleşme gerektiren bir metriktir. Abonelik işinde iptal tarihi bellidir; e-ticarette "kaybedildi" demek için bir hareketsizlik penceresi seçersin: "son siparişin üzerinden 180 gün geçti". Pencere kısalırsa churn yükselir; pencereyi satın alma döngüsüne göre seç (bu veride iki sipariş arası ortalama süre 86 gün).</p>

<h2>4. LTV ve CAC</h2>
<p>Müşteri yaşam boyu değeri (customer lifetime value, LTV), bir müşterinin ilişki boyunca bıraktığı <b>katkı payıdır</b> (ciro değil, marj). İki yaygın hesap:</p>
<div class="tbl-wrap"><table>
<tr><th>Yöntem</th><th>Formül</th><th>Ne zaman</th></tr>
<tr><td>Basit</td><td>AOV × yıllık frekans × marj oranı × beklenen ömür (yıl)</td><td>Hızlı tahmin, yönetim sunumu</td></tr>
<tr><td>Kohort bazlı</td><td>Kohort başına kümülatif marj / kohort büyüklüğü, dönem dönem</td><td>Gerçekleşen değeri görmek, kanalları karşılaştırmak</td></tr>
<tr><td>Olasılıksal</td><td>BG/NBD + Gamma-Gamma (lifetimes kütüphanesi)</td><td>Bireysel müşteri tahmini</td></tr>
</table></div>
<p>Müşteri edinme maliyeti (customer acquisition cost, CAC) = pazarlama harcaması / yeni müşteri. <b>LTV/CAC</b> oranı yaygın bir sağlık göstergesidir; 3 civarı sağlıklı kabul edilir, 1'in altı her müşteride para kaybetmek demektir. Oranı yorumlarken geri ödeme süresine (CAC'nin kaç ayda geri kazanıldığı) de bak.</p>

<h2>5. Dönem karşılaştırmaları: MoM, YoY, YTD</h2>
<p>MoM (month over month) kısa vadeli ivmeyi, YoY (year over year) mevsimsellikten arındırılmış büyümeyi, YTD (year to date) yılbaşından bugüne birikimi gösterir. Kural: <b>karşılaştırdığın iki dönem aynı uzunlukta ve aynı takvim yapısında olmalı</b>.</p>
<pre class="py">import veri
import pandas as pd

o = veri.oku("anadolu_market", "orders", parse_dates=["order_date"])
i = veri.oku("anadolu_market", "order_items")
i["net"] = i["quantity"] * i["unit_price"] * (1 - i["discount"])
x = o[o["status"].isin(["delivered", "shipped"])].merge(i, on="order_id")

def donem(bas, son):
    m = (x["order_date"] >= bas) & (x["order_date"] <= son)
    return round(x.loc[m, "net"].sum(), 2)

bu = donem("2024-01-01", "2024-06-15")
gecen = donem("2023-01-01", "2023-06-15")          # aynı gün: 15 Haziran
print("YTD 2024:", bu, "| aynı dönem 2023:", gecen, "| YoY:", round(bu / gecen - 1, 3))
print("YANLIŞ kıyas (tüm 2023):", donem("2023-01-01", "2023-12-31"))</pre>
<p>Takvim etkisi: Bir ayda 5 cumartesi, diğerinde 4 olabilir; bayramlar her yıl başka aya düşer. Günlük ciroda haftanın günü etkisi güçlüyse "aynı gün" karşılaştırması (bu yılın 2. pazartesisi ile geçen yılın 2. pazartesisi) ya da gün başına ortalama kullanılır.</p>

<h2>6. Köprü analizi: fiyat, hacim ve karma etkisi</h2>
<p>"Ciro 329 bin TL arttı; ne kadarı daha çok satmaktan, ne kadarı fiyattan, ne kadarı ürün karmasından?" Köprü (bridge, price-volume-mix) analizi değişimi parçalara ayırır. Kategori düzeyinde, <code>A</code> adet ve <code>P</code> ortalama birim fiyat olmak üzere:</p>
<div class="tbl-wrap"><table>
<tr><th>Etki</th><th>Formül</th><th>Anlamı</th></tr>
<tr><td>Hacim</td><td>(ΣA₁ − ΣA₀) × P̄₀</td><td>Karma ve fiyat sabitken toplam adedin artışı</td></tr>
<tr><td>Karma</td><td>Σ (payᵢ₁ − payᵢ₀) × ΣA₁ × Pᵢ₀</td><td>Satışın pahalı/ucuz kategorilere kayması</td></tr>
<tr><td>Fiyat</td><td>Σ (Pᵢ₁ − Pᵢ₀) × Aᵢ₁</td><td>Aynı kategoride birim fiyat değişimi</td></tr>
</table></div>
<p>Üçünün toplamı ciro farkına birebir eşittir; köprü grafiği (waterfall) bu üç çubuğu başlangıç ve bitiş cirosu arasına dizer. Uygulamasını alıştırmalarda yapacaksın.</p>

<h2>7. Pareto (ABC) analizi</h2>
<p>Ürünleri ciroya göre sırala, kümülatif payı hesapla: ilk %80'i oluşturanlar A, sonraki %15 B, kalan C. Stok, kampanya ve raf kararları bu sınıflara göre verilir. "80/20" bir yasa değil, kontrol edilmesi gereken bir hipotezdir: Anadolu Market'te ürünlerin ilk %20'si cironun yalnız yaklaşık %37'sini yapıyor; ciro geniş bir ürün yelpazesine yayılmış. Müşteri tarafında aynı fikrin çok boyutlu hâli RFM segmentasyonudur (bitirme projesi dersinde).</p>

<h2>8. Metrik tuzakları</h2>
<h3>Oranların ortalaması ≠ ortalama oran</h3>
<pre class="py">import veri
import pandas as pd

w = veri.oku("anadolu_market", "web_events", parse_dates=["event_time"])
w["gun"] = w["event_time"].dt.date
gunluk = w.pivot_table(index="gun", columns="event_type", values="user_id", aggfunc="nunique", fill_value=0)
gunluk = gunluk[gunluk["visit"] > 0]

print("günlük oranların ortalaması:", round((gunluk["purchase"] / gunluk["visit"]).mean(), 4))
print("toplam / toplam (doğru):   ", round(gunluk["purchase"].sum() / gunluk["visit"].sum(), 4))</pre>
<p>Günlük oranların ortalaması her güne eşit ağırlık verir: 3 ziyaretçili bir gün ile 30 ziyaretçili bir gün aynı etkiyi yapar. Oran metriklerini daima <b>pay toplamı / payda toplamı</b> olarak hesapla.</p>
<h3>Simpson paradoksu ve payda kayması</h3>
<p>Bir karşılaştırma her alt grupta bir yönü gösterirken toplamda ters yönü gösterebilir. Aşağıdaki küçük örnekte A kampanyası hem mobilde hem masaüstünde B'den iyidir, ama trafiğinin çoğu düşük dönüşümlü mobilden geldiği için toplamda kötü görünür:</p>
<pre class="py">import pandas as pd

df = pd.DataFrame({
    "kampanya": ["A", "A", "B", "B"],
    "cihaz": ["mobil", "masaüstü", "mobil", "masaüstü"],
    "ziyaret": [1000, 100, 100, 1000],
    "satis": [100, 30, 8, 250],
})
df["oran"] = df["satis"] / df["ziyaret"]
print(df.pivot(index="cihaz", columns="kampanya", values="oran"))
t = df.groupby("kampanya")[["satis", "ziyaret"]].sum()
print((t["satis"] / t["ziyaret"]).round(3))</pre>
<p>Gerçek veride paradoks nadirdir ama <b>karma (mix) etkisi</b> her yerdedir: toplam AOV düştüğünde önce "her kanalda mı düştü, yoksa ucuz kanalın payı mı arttı?" diye sor. Payda kayması da benzer bir tuzaktır: dönüşüm oranı yükseldi, çünkü paydadaki "ziyaret" tanımı bot trafiği filtrelenerek değişti. Metrik sözleşmesi tam da bu yüzden vardır.</p>
<pre class="py">import veri

s = veri.oku("kesit_bi", "Satislar")
s = s[s["Durum"] != "İptal"]
s["marj"] = s["Tutar"] - s["Maliyet"]
k = s.groupby("Kanal")[["marj", "Tutar"]].sum()
print("ağırlıklı marj oranı (doğru):", (k["marj"] / k["Tutar"]).round(4).to_dict())
print("satır oranlarının ortalaması:", (s["marj"] / s["Tutar"]).groupby(s["Kanal"]).mean().round(4).to_dict())</pre>

<div class="note"><b>Gerçek işte</b>Haftalık iş incelemesinde (weekly business review) en sık duyulan cümle "bu sayı geçen haftaki rapordakiyle tutmuyor"dur. Olgun ekipler bunu bir semantik katmanla (dbt metrics, Power BI ölçüleri, LookML) çözer: metrik bir kez tanımlanır, her rapor oradan okur. Analistin işi de sayıyı üretmekle bitmez; "ciro %10 düştü" dediğinde hemen ardından KPI ağacının hangi kolunun, hangi segmentte, karma mı oran mı yüzünden düştüğünü söyleyebilmektir.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Kuzey yıldızı metriği ve koruyucu metrikler</h3>
<p>Ürün ekipleri tek bir kuzey yıldızı metriğine (north star metric) odaklanır: ör. "haftalık en az bir sipariş veren aktif müşteri". Onu yükseltirken bozulmaması gerekenler koruyucu metriklerdir (guardrail): iade oranı, ortalama teslim süresi, müşteri şikâyeti. A/B testlerinde de karar yalnız hedef metrikle değil, koruyucularla birlikte verilir.</p>
<h3>Göreli ve mutlak değişim</h3>
<p>%2'den %3'e çıkan dönüşüm "yüzde 50 arttı" (göreli) ya da "1 puan arttı" (mutlak, yüzde puan) diye anlatılabilir. Sunumda ikisini birlikte ver; küçük tabanlı göreli değişimler abartılı görünür.</p>
<h3>Olasılıksal LTV</h3>
<pre class="code">pip install lifetimes
from lifetimes import BetaGeoFitter, GammaGammaFitter
from lifetimes.utils import summary_data_from_transaction_data
ozet = summary_data_from_transaction_data(df, "customer_id", "order_date", "net", observation_period_end="2024-12-31")
bgf = BetaGeoFitter(penalizer_coef=0.01).fit(ozet["frequency"], ozet["recency"], ozet["T"])</pre>
<p>Kendi bilgisayarında dene: bu model her müşterinin gelecekteki sipariş sayısını ve harcamasını tahmin eder; tarayıcıda çalışmaz.</p>
</section>
'''

SETUP = ('import veri\nimport pandas as pd\n\n'
         'o = veri.oku("anadolu_market", "orders", parse_dates=["order_date"])\n'
         'i = veri.oku("anadolu_market", "order_items")\n'
         'i["net"] = i["quantity"] * i["unit_price"] * (1 - i["discount"])\n'
         'x = o[o["status"].isin(["delivered", "shipped"])].merge(i, on="order_id")\n')
WEB = 'import veri\nimport pandas as pd\n\nw = veri.oku("anadolu_market", "web_events", parse_dates=["event_time"])\nADIMLAR = ["visit", "product_view", "add_to_cart", "checkout", "purchase"]\n'

EX = []
EX += [
    {'t': 'mc', 'stage': 'Isınma',
     'q': 'Web cirosu düştü. KPI ağacına göre <code>ciro = ziyaretçi × dönüşüm oranı × AOV</code>. İlk analiz adımın hangisi olmalı?',
     'o': ['Hemen yeni bir tasarımla A/B testi başlatıp sonucu beklemek', 'Üç çarpanın değişimini ayrı ayrı hesaplayıp düşeni bulmak', 'Ciroyu ürün bazında listeleyip en çok düşen ürünü bulmak', 'Geçen yılın aynı ayıyla karşılaştırıp bir ay daha beklemek'], 'a': 1,
     'why': 'KPI ağacı "ne değişti?" sorusunu çarpanlara böler. Ziyaretçi düştüyse pazarlama/SEO, dönüşüm düştüyse site ya da fiyat, AOV düştüyse karma ya da indirim tarafına bakılır. Sonra en çok değişen kolu segmentlere (cihaz, kanal) kırarsın.'},
    {'t': 'mc', 'stage': 'Isınma',
     'q': '60 günün her biri için dönüşüm oranı (satın alan / ziyaret eden) hesapladın. Dönemin dönüşüm oranını raporlamak için hangisi doğru?',
     'o': ['Günlük oranların aritmetik ortalaması', 'Günlük oranların medyanı', 'Toplam satın alan / toplam ziyaret eden', 'En yüksek ve en düşük günün ortalaması'], 'a': 2,
     'why': 'Oranların ortalaması her güne eşit ağırlık verir; trafiği az olan günler sonucu orantısız etkiler. Dönem oranı pay toplamının payda toplamına bölümüdür. Bu veride fark 0.104 ile 0.112 arasında: küçük görünür ama hedef takibinde önemlidir.'},
    {'t': 'mc', 'stage': 'Isınma',
     'q': 'Haziran ortasındasın. Yönetim "bu yıl şu ana kadar geçen yıla göre nasılız?" diye soruyor. Hangi karşılaştırma doğrudur?',
     'o': ['Bu yılın YTD cirosu / geçen yılın tüm yıl (12 ay) cirosu', 'Bu yıl 1 Ocak–15 Haziran / geçen yıl 1 Ocak–15 Haziran', 'Bu ayın cirosu / geçen ayın cirosu (MoM, en güncel ivme)', 'Bu yılın YTD cirosu / geçen yılın son çeyrek cirosu'], 'a': 1,
     'why': 'YoY karşılaştırmada iki dönem aynı uzunlukta ve aynı takvim aralığında olmalı. 5,5 aylık birikimi 12 aylık bir toplamla kıyaslamak, büyümeyi düşüş gibi gösterir.'},
]

EX += [
    {'t': 'predict', 'stage': 'Kodu oku', 'q': 'Bu kod ne yazdırır?',
     'code': 'gunler = [(1, 10), (18, 90)]   # (satin_alan, ziyaret)\noranlarin_ortalamasi = sum(s / z for s, z in gunler) / len(gunler)\ntoplam_oran = sum(s for s, _ in gunler) / sum(z for _, z in gunler)\nprint(round(oranlarin_ortalamasi, 2), round(toplam_oran, 2))\n',
     'o': ['0.19 0.15', '0.15 0.19', '0.15 0.15', '0.19 0.19'], 'a': 1,
     'why': 'Günlük oranlar 0.1 ve 0.2; basit ortalamaları 0.15. Toplam oran ise 19 / 100 = 0.19: 90 ziyaretçili gün, 10 ziyaretçili günden dokuz kat ağır basar. Dönemin gerçek dönüşüm oranı 0.19\'dur; oranların ortalaması küçük günü büyük günle eşit sayar.'},
    {'t': 'predict', 'stage': 'Kodu oku', 'q': 'Simpson paradoksu örneği. Bu kod ne yazdırır?',
     'code': 'import pandas as pd\ndf = pd.DataFrame({"k": ["A", "A", "B", "B"], "cihaz": ["mobil", "masa", "mobil", "masa"],\n                   "ziyaret": [1000, 100, 100, 1000], "satis": [100, 30, 8, 250]})\nt = df.groupby("k")[["satis", "ziyaret"]].sum()\nprint((t["satis"] / t["ziyaret"]).round(3).to_dict())\n',
     'o': ["{'A': 0.2, 'B': 0.165}", "{'A': 0.118, 'B': 0.235}", "{'A': 0.13, 'B': 0.258}", "{'A': 0.235, 'B': 0.118}"], 'a': 1,
     'why': 'A: 130 / 1100 = 0.118, B: 258 / 1100 = 0.235. Oysa A hem mobilde (0.10 &gt; 0.08) hem masaüstünde (0.30 &gt; 0.25) daha iyi. A\'nın trafiği düşük dönüşümlü mobilde yoğunlaştığı için toplamda kötü görünür. Birinci şık, alt grup oranlarının basit ortalaması (yaygın hata).'},
    {'t': 'predict', 'stage': 'Kodu oku', 'q': 'Huni: ziyaret 600, ürün görüntüleme 453, sepete ekleme 183. Bu kod ne yazdırır?',
     'code': 'import pandas as pd\nu = pd.Series([600, 453, 183], index=["visit", "product_view", "add_to_cart"])\nprint((u / u.shift(1)).round(3).tolist(), round(u.iloc[-1] / u.iloc[0], 3))\n',
     'o': ['[0.755, 0.404] 0.305', '[nan, 0.755, 0.404] 0.305', '[nan, 0.755, 0.404] 0.405', '[1.0, 0.755, 0.304] 0.305'], 'a': 1,
     'why': '<code>shift(1)</code> ilk elemana önceki değer bulamaz, NaN üretir; adım dönüşümleri 453/600 = 0.755 ve 183/453 = 0.404. Toplam dönüşüm ilk adıma göredir: 183/600 = 0.305.'},
    {'t': 'order', 'stage': 'Kodu oku',
     'q': '<p>Web olaylarından huni tablosu (tekil kullanıcı, adım dönüşümü) çıkaran programın satırlarını sırala.</p>',
     'lines': ['import veri',
               'w = veri.oku("anadolu_market", "web_events")',
               'adimlar = ["visit", "product_view", "add_to_cart", "checkout", "purchase"]',
               'kullanici = w.groupby("event_type")["user_id"].nunique().reindex(adimlar)',
               'adim = (kullanici / kullanici.shift(1)).round(3)',
               'print(kullanici.tolist(), adim.tolist()[1:])'],
     'expect': '[600, 453, 183, 109, 67] [0.755, 0.404, 0.596, 0.615]\n',
     'hint': 'Adım listesi reindex\'ten önce tanımlı olmalı; dönüşüm, kullanıcı sayıları hesaplandıktan sonra.',
     'why': '<code>reindex(adimlar)</code> groupby\'ın alfabetik sırasını huni sırasına çevirir; bu olmadan shift yanlış adımları böler. En zayıf halka ürün görüntülemeden sepete geçiş (%40).'},
]

EX += [
    {'t': 'code', 'stage': 'Rehberli', 'id': 'is-metrikleri-1', 'diff': 1, 'needs': ['pandas'],
     'q': '<p><code>huni(w, adimlar)</code> fonksiyonu index\'i <code>adimlar</code> sırasında olan ve şu sütunları içeren bir DataFrame döndürsün:</p><ul><li><code>kullanici</code>: o adımı yapan tekil kullanıcı sayısı</li><li><code>adim_donusum</code>: bir önceki adıma oran (ilk adımda NaN), 3 basamak</li><li><code>toplam_donusum</code>: ilk adıma oran, 3 basamak</li><li><code>kayip</code>: bir önceki adımdan kaybedilen kullanıcı sayısı (ilk adımda 0, int)</li></ul>',
     'guide': ['groupby("event_type")["user_id"].nunique() ile tekil kullanıcıyı say.', 'reindex(adimlar) ile huni sırasına diz.', 'adim_donusum: seri / seri.shift(1); toplam_donusum: seri / seri.iloc[0].', 'kayip: seri.shift(1) - seri, NaN → 0, int.'],
     'example': 'import pandas as pd\nolay = pd.DataFrame({"kim": [1, 1, 2, 3, 3, 3], "adim": ["a", "b", "a", "a", "b", "c"]})\nn = olay.groupby("adim")["kim"].nunique().reindex(["a", "b", "c"])\nprint(pd.DataFrame({"n": n, "oran": (n / n.shift(1)).round(2)}))\n',
     'start': WEB + '\n\ndef huni(w, adimlar):\n    kullanici = w.groupby("event_type")["user_id"].nunique()\n    # TODO: adım sırasına diz\n    tablo = pd.DataFrame({"kullanici": kullanici})\n    # TODO: adim_donusum, toplam_donusum, kayip\n    return tablo\n\n\nprint(huni(w, ADIMLAR))\n',
     'sol': WEB + '\n\ndef huni(w, adimlar):\n    kullanici = w.groupby("event_type")["user_id"].nunique().reindex(adimlar)\n    tablo = pd.DataFrame({"kullanici": kullanici})\n    tablo["adim_donusum"] = (kullanici / kullanici.shift(1)).round(3)\n    tablo["toplam_donusum"] = (kullanici / kullanici.iloc[0]).round(3)\n    tablo["kayip"] = (kullanici.shift(1) - kullanici).fillna(0).astype(int)\n    return tablo\n\n\nprint(huni(w, ADIMLAR))\n',
     'tests': 'h = huni(w, ADIMLAR)\nassert list(h.index) == ADIMLAR, "Index huni sırasında olmalı (reindex)"\nassert h["kullanici"].tolist() == [600, 453, 183, 109, 67], "Tekil kullanıcılar: 600, 453, 183, 109, 67"\nassert pd.isna(h["adim_donusum"].iloc[0]) and h["adim_donusum"].tolist()[1:] == [0.755, 0.404, 0.596, 0.615], "Adım dönüşümleri 0.755, 0.404, 0.596, 0.615"\nassert h.loc["purchase", "toplam_donusum"] == 0.112, "Ziyaretten satın almaya toplam dönüşüm 0.112"\nassert h["kayip"].tolist() == [0, 147, 270, 74, 42], "Kayıplar 0, 147, 270, 74, 42 olmalı"\n',
     'hints': ['<code>reindex</code> olmadan groupby sonucu alfabetik sıralıdır.', '<code>kullanici.shift(1)</code> bir önceki adımın değerini aynı satıra getirir.', '<code>tablo["kayip"] = (kullanici.shift(1) - kullanici).fillna(0).astype(int)</code>'],
     'why': 'Olay değil kullanıcı sayılır; aynı kişi bir ürünü beş kez görüntüleyebilir. Kayıp sütunu "en çok kişiyi nerede kaybediyoruz?" sorusunu doğrudan cevaplar: ürün sayfasından sepete geçişte 270 kişi.'},
    {'t': 'code', 'stage': 'Rehberli', 'id': 'is-metrikleri-2', 'diff': 2, 'needs': ['pandas'],
     'q': '<p>Çeyreklik kohort tutundurma tablosu. <code>tutundurma(o)</code> şunu yapsın: her müşterinin kohortu = ilk siparişinin çeyreği (<code>to_period("Q")</code>, tüm durumlar); her sipariş için çeyrek farkı; her (kohort, fark) için tekil müşteri sayısı; sonra her satırı 0. sütuna bölerek oran. <b>Gözlemlenmemiş (gelecek) hücreler NaN kalmalı</b>, değerler 3 basamak.</p>',
     'guide': ['o = o.copy(); donem = order_date.dt.to_period("Q").', 'kohort = groupby("customer_id")["donem"].transform("min").', 'fark = (donem - kohort).apply(lambda d: d.n).', 'groupby(["kohort", "fark"])["customer_id"].nunique().unstack() — fill_value VERME.', 'div(tablo[0], axis=0).round(3).'],
     'example': 'import pandas as pd\nd = pd.DataFrame({"m": [1, 1, 2], "t": pd.to_datetime(["2024-01-10", "2024-04-02", "2024-04-20"])})\nd["q"] = d["t"].dt.to_period("Q")\nd["k"] = d.groupby("m")["q"].transform("min")\nd["fark"] = (d["q"] - d["k"]).apply(lambda x: x.n)\nprint(d)\n',
     'start': 'import veri\nimport pandas as pd\n\no = veri.oku("anadolu_market", "orders", parse_dates=["order_date"])\n\n\ndef tutundurma(o):\n    o = o.copy()\n    o["donem"] = o["order_date"].dt.to_period("Q")\n    # TODO: kohort ve fark\n    # TODO: sayım tablosu (unstack, fill_value YOK)\n    # TODO: oranlar\n    return None\n\n\nprint(tutundurma(o).iloc[-4:, :4])\n',
     'sol': 'import veri\nimport pandas as pd\n\no = veri.oku("anadolu_market", "orders", parse_dates=["order_date"])\n\n\ndef tutundurma(o):\n    o = o.copy()\n    o["donem"] = o["order_date"].dt.to_period("Q")\n    o["kohort"] = o.groupby("customer_id")["donem"].transform("min")\n    o["fark"] = (o["donem"] - o["kohort"]).apply(lambda d: d.n)\n    sayim = o.groupby(["kohort", "fark"])["customer_id"].nunique().unstack()\n    return sayim.div(sayim[0], axis=0).round(3)\n\n\nprint(tutundurma(o).iloc[-4:, :4])\n',
     'tests': 't = tutundurma(o)\nk = pd.Period("2024Q1", freq="Q")\nassert t.loc[k, 0] == 1.0, "0. çeyrek her kohortta 1.0 olmalı"\nassert t.loc[k, [1, 2, 3]].tolist() == [0.792, 0.875, 0.75], "2024Q1 kohortu: 0.792, 0.875, 0.75"\nassert pd.isna(t.loc[k, 4]), "2024Q1\'in 4. çeyreği henüz yaşanmadı: NaN olmalı, 0 değil"\nassert pd.isna(t.loc[pd.Period("2024Q4", freq="Q"), 1]), "2024Q4 kohortunun 1. çeyreği NaN olmalı"\nassert t.loc[pd.Period("2022Q4", freq="Q"), 2] == 0.85, "2022Q4 kohortunun 2. çeyreği 0.85"\nassert t.shape == (11, 11), "11 kohort × 11 çeyrek farkı"\n',
     'hints': ['Period farkı bir DateOffset döndürür; tam sayı için <code>.n</code>.', 'Gelecek hücreler unstack\'te zaten NaN olur; <code>fill_value=0</code> yazma.', '<code>sayim.div(sayim[0], axis=0)</code> her satırı kendi kohort büyüklüğüne böler.'],
     'why': 'Anadolu Market\'in çeyreklik tutundurması yüksek (%60–90): müşteriler düzenli geri geliyor. NaN ile 0 ayrımı, ortalama tutundurma eğrisini <code>t.mean()</code> ile hesaplarken kritiktir: pandas NaN\'ları atlar, 0\'ları ise ortalamaya katar ve eğriyi yapay olarak düşürür.'},
    {'t': 'code', 'stage': 'Rehberli', 'id': 'is-metrikleri-3', 'diff': 2, 'needs': ['pandas'],
     'q': '<p>Aylık YoY tablosu. <code>yoy_tablosu(x, yil)</code> net ciroyu ay (1–12) × yıl olarak pivotlasın ve index\'i ay numarası olan, <code>onceki</code>, <code>bu</code>, <code>yoy</code> sütunlu bir DataFrame döndürsün: <code>onceki</code> = yil-1, <code>bu</code> = yil cirosu (2 basamak), <code>yoy</code> = bu / onceki − 1 (3 basamak).</p>',
     'guide': ['Ay ve yıl sütunlarını order_date.dt.month ve .dt.year ile türet.', 'pivot_table(index="ay", columns="yil", values="net", aggfunc="sum").', 'İki yılın sütunlarını seç, yeni adlarla bir DataFrame kur.', 'yoy = bu / onceki - 1, round(3).'],
     'example': 'import pandas as pd\nd = pd.DataFrame({"yil": [2023, 2023, 2024, 2024], "ay": [1, 2, 1, 2], "ciro": [100, 80, 150, 60]})\np = d.pivot_table(index="ay", columns="yil", values="ciro", aggfunc="sum")\nprint((p[2024] / p[2023] - 1).round(3))\n',
     'start': SETUP + '\n\ndef yoy_tablosu(x, yil):\n    t = x.assign(yil=x["order_date"].dt.year, ay=x["order_date"].dt.month)\n    p = None  # TODO: pivot_table\n    sonuc = pd.DataFrame({\n        # TODO: onceki, bu\n    })\n    # TODO: yoy\n    return sonuc\n\n\nprint(yoy_tablosu(x, 2024))\n',
     'sol': SETUP + '\n\ndef yoy_tablosu(x, yil):\n    t = x.assign(yil=x["order_date"].dt.year, ay=x["order_date"].dt.month)\n    p = t.pivot_table(index="ay", columns="yil", values="net", aggfunc="sum")\n    sonuc = pd.DataFrame({\n        "onceki": p[yil - 1].round(2),\n        "bu": p[yil].round(2),\n    })\n    sonuc["yoy"] = (sonuc["bu"] / sonuc["onceki"] - 1).round(3)\n    return sonuc\n\n\nprint(yoy_tablosu(x, 2024))\n',
     'tests': 't = yoy_tablosu(x, 2024)\nassert list(t.columns) == ["onceki", "bu", "yoy"], "Sütunlar: onceki, bu, yoy"\nassert list(t.index) == list(range(1, 13)), "Index 1–12 ay numaraları"\nassert t.loc[1, "bu"] == 46389.85 and t.loc[1, "yoy"] == 2.427, "Ocak 2024: 46389.85 TL, YoY +242.7%"\nassert t.loc[4, "yoy"] == 0.335 and t.loc[10, "yoy"] == 0.956, "Nisan +33.5%, Ekim +95.6%"\nassert abs(t["bu"].sum() - 703887.25) < 0.05, "2024 toplamı 703887.25"\n',
     'hints': ['Ay ve yılı ayrı sütun yap; pivot iki boyutlu tabloyu verir.', 'Pivot sütunları yıl sayısıdır: <code>p[2024]</code>.', '<code>sonuc["yoy"] = (sonuc["bu"] / sonuc["onceki"] - 1).round(3)</code>'],
     'why': 'Aylık YoY mevsimselliği nötrler: Kasım\'ı Ekim\'le değil, geçen Kasım\'la kıyaslarsın. Ocak\'taki %243 büyümenin bir kısmı düşük tabandan (2023 Ocak zayıf) gelir; büyük yüzdeleri mutlak farkla birlikte sun.'},
    {'t': 'code', 'stage': 'Rehberli', 'id': 'is-metrikleri-4', 'diff': 2, 'needs': ['pandas'],
     'q': '<p>Basit LTV ve LTV/CAC. <code>ltv_hesapla(x, urunler, yil, omur_yil=3, cac=None)</code> seçilen yıl için şunları içeren bir sözlük döndürsün:</p><ul><li><code>aov</code> = net ciro / tekil sipariş (2 basamak)</li><li><code>frekans</code> = tekil sipariş / tekil müşteri (3 basamak)</li><li><code>marj_orani</code> = (net − quantity × cost) toplamı / net toplamı (4 basamak); <code>cost</code> ürün tablosunda</li><li><code>ltv</code> = aov × frekans × marj_orani × omur_yil (yuvarlanmamış değerlerle hesapla, sonucu 2 basamak)</li><li><code>ltv_cac</code> = ltv / cac (2 basamak); cac None ise None</li></ul>',
     'guide': ['Yılı süz, ürün maliyetini product_id ile bağla (validate kullan).', 'aov, frekans, marj oranını yuvarlamadan hesapla.', 'ltv\'yi yuvarlanmamış değerlerle çarp.', 'Sözlüğe yuvarlayarak yaz; cac yoksa ltv_cac None.'],
     'example': 'siparisler = [("m1", 100.0), ("m1", 300.0), ("m2", 200.0)]\naov = sum(t for _, t in siparisler) / len(siparisler)\nfrekans = len(siparisler) / len({m for m, _ in siparisler})\nprint(round(aov, 2), round(frekans, 3), round(aov * frekans * 0.3 * 2, 2))\n',
     'start': SETUP + 'urunler = veri.oku("anadolu_market", "products")\n\n\ndef ltv_hesapla(x, urunler, yil, omur_yil=3, cac=None):\n    y = x[x["order_date"].dt.year == yil]\n    # TODO: maliyeti bağla ve marj sütununu üret\n    aov = 0      # TODO\n    frekans = 0  # TODO\n    marj = 0     # TODO\n    ltv = aov * frekans * marj * omur_yil\n    return {"aov": aov, "frekans": frekans, "marj_orani": marj, "ltv": ltv, "ltv_cac": None}\n\n\nprint(ltv_hesapla(x, urunler, 2024, cac=1500))\n',
     'sol': SETUP + 'urunler = veri.oku("anadolu_market", "products")\n\n\ndef ltv_hesapla(x, urunler, yil, omur_yil=3, cac=None):\n    y = x[x["order_date"].dt.year == yil].merge(urunler[["product_id", "cost"]], on="product_id",\n                                                 how="left", validate="many_to_one")\n    marj_tl = y["net"] - y["quantity"] * y["cost"]\n    aov = y["net"].sum() / y["order_id"].nunique()\n    frekans = y["order_id"].nunique() / y["customer_id"].nunique()\n    marj = marj_tl.sum() / y["net"].sum()\n    ltv = aov * frekans * marj * omur_yil\n    return {\n        "aov": round(aov, 2),\n        "frekans": round(frekans, 3),\n        "marj_orani": round(marj, 4),\n        "ltv": round(ltv, 2),\n        "ltv_cac": round(ltv / cac, 2) if cac else None,\n    }\n\n\nprint(ltv_hesapla(x, urunler, 2024, cac=1500))\n',
     'tests': 'r = ltv_hesapla(x, urunler, 2024, cac=1500)\nassert r["aov"] == 1520.27 and r["frekans"] == 3.764, "2024: AOV 1520.27, frekans 3.764"\nassert r["marj_orani"] == 0.3862, "2024 marj oranı 0.3862 (net - adet × maliyet)"\nassert r["ltv"] == 6630.35, "LTV = AOV × frekans × marj × 3 yıl = 6630.35 (yuvarlanmamış değerlerle)"\nassert r["ltv_cac"] == 4.42, "LTV/CAC = 6630.35 / 1500 = 4.42"\nr23 = ltv_hesapla(x, urunler, 2023)\nassert r23["ltv"] == 4696.97 and r23["ltv_cac"] is None, "2023 LTV 4696.97; cac verilmezse ltv_cac None"\n',
     'hints': ['Maliyet ürün tablosunda; <code>merge(urunler[["product_id", "cost"]], on="product_id", validate="many_to_one")</code>.', 'Ara değerleri yuvarlama; yalnız sözlüğe yazarken yuvarla (yoksa LTV birkaç kuruş kayar).', '<code>"ltv_cac": round(ltv / cac, 2) if cac else None</code>'],
     'why': 'LTV ciro değil marj üzerinden hesaplanır: 1.000 TL ciroyla %10 marj bırakan müşteri ile %40 marj bırakan aynı değerde değildir. 2024\'te marj oranı da frekans da arttığı için LTV %41 yükseldi. 3 yıllık ömür bir varsayımdır; churn oranından (ömür ≈ 1 / yıllık churn) türetilip sözleşmeye yazılmalı.'},
]

EX += [
    {'t': 'code', 'stage': 'Kendin yaz', 'id': 'is-metrikleri-5', 'diff': 2, 'needs': ['pandas'],
     'q': '<p>Cihaz kırılımlı huni. <code>cihaz_hunisi(w, adimlar)</code> index\'i adımlar (huni sırası), sütunları cihazlar (<code>desktop</code>, <code>mobile</code>) olan tekil kullanıcı tablosunu ve ziyaretten satın almaya dönüşümü döndürsün: <code>(tablo, donusum)</code>; <code>donusum</code> cihaz → oran (3 basamak) sözlüğü.</p>',
     'start': WEB + '\n\ndef cihaz_hunisi(w, adimlar):\n    pass\n\n\ntablo, donusum = cihaz_hunisi(w, ADIMLAR)\nprint(tablo)\nprint(donusum)\n',
     'sol': WEB + '\n\ndef cihaz_hunisi(w, adimlar):\n    tablo = w.pivot_table(index="event_type", columns="device", values="user_id",\n                          aggfunc="nunique").reindex(adimlar)\n    tablo.columns.name = None\n    donusum = (tablo.loc[adimlar[-1]] / tablo.loc[adimlar[0]]).round(3).to_dict()\n    return tablo, donusum\n\n\ntablo, donusum = cihaz_hunisi(w, ADIMLAR)\nprint(tablo)\nprint(donusum)\n',
     'tests': 'tablo, d = cihaz_hunisi(w, ADIMLAR)\nassert list(tablo.index) == ADIMLAR, "Index huni sırasında"\nassert tablo["mobile"].tolist() == [373, 270, 111, 67, 37], "Mobil huni: 373, 270, 111, 67, 37"\nassert tablo["desktop"].tolist() == [227, 183, 72, 42, 30], "Masaüstü huni: 227, 183, 72, 42, 30"\nassert d == {"desktop": 0.132, "mobile": 0.099}, "Dönüşüm: masaüstü 0.132, mobil 0.099"\n',
     'hints': ['<code>pivot_table(index="event_type", columns="device", values="user_id", aggfunc="nunique")</code>', 'Son adım satırını ilk adım satırına böl; <code>.to_dict()</code>.'],
     'why': 'Mobil, ziyaretçilerin %62\'sini getiriyor ama dönüşümü masaüstünün dörtte üçü. Mobil dönüşümü masaüstü düzeyine çekmek, yeni trafik satın almadan cironun büyümesi demek: KPI ağacındaki "dönüşüm" kolunun en ucuz kaldıracı.'},
    {'t': 'code', 'stage': 'Kendin yaz', 'id': 'is-metrikleri-6', 'diff': 2, 'needs': ['pandas', 'numpy'],
     'q': '<p>Pareto (ABC) analizi. <code>abc_sinifi(x, urunler, yil)</code> seçilen yılda ürünleri (<code>name</code>) net ciroya göre azalan sıralasın, kümülatif payı hesaplasın ve sınıf atasın: <b>bir ürünün öncesindeki</b> kümülatif pay &lt; 0.80 ise A, &lt; 0.95 ise B, aksi hâlde C (böylece %80\'i geçiren ürün de A olur). Dönüş: index ürün adı, sütunlar <code>ciro</code>, <code>kum_pay</code> (4 basamak), <code>sinif</code> olan DataFrame.</p>',
     'start': SETUP + 'import numpy as np\nurunler = veri.oku("anadolu_market", "products")\n\n\ndef abc_sinifi(x, urunler, yil):\n    pass\n\n\nt = abc_sinifi(x, urunler, 2024)\nprint(t.head())\nprint(t["sinif"].value_counts())\n',
     'sol': SETUP + 'import numpy as np\nurunler = veri.oku("anadolu_market", "products")\n\n\ndef abc_sinifi(x, urunler, yil):\n    y = x[x["order_date"].dt.year == yil].merge(urunler[["product_id", "name"]], on="product_id",\n                                                 validate="many_to_one")\n    ciro = y.groupby("name")["net"].sum().sort_values(ascending=False)\n    kum = ciro.cumsum() / ciro.sum()\n    onceki = kum.shift(1, fill_value=0)\n    sinif = np.where(onceki < 0.80, "A", np.where(onceki < 0.95, "B", "C"))\n    return pd.DataFrame({"ciro": ciro, "kum_pay": kum.round(4), "sinif": sinif})\n\n\nt = abc_sinifi(x, urunler, 2024)\nprint(t.head())\nprint(t["sinif"].value_counts())\n',
     'tests': 't = abc_sinifi(x, urunler, 2024)\nassert len(t) == 38, "2024\'te satılan 38 ürün olmalı"\nassert t.index[0] == \'27" Monitör\' and t["kum_pay"].iloc[0] == 0.0852, "Lider ürün 27\\" Monitör, payı 0.0852"\nassert t["sinif"].value_counts().to_dict() == {"A": 25, "B": 9, "C": 4}, "Sınıf dağılımı: A 25, B 9, C 4"\nassert t["kum_pay"].iloc[-1] == 1.0, "Son ürünün kümülatif payı 1.0"\nassert t["ciro"].is_monotonic_decreasing, "Ciroya göre azalan sıralı olmalı"\n',
     'hints': ['Kümülatif pay: <code>ciro.cumsum() / ciro.sum()</code>.', 'Öncesindeki pay: <code>kum.shift(1, fill_value=0)</code>; iç içe <code>np.where</code> ile A/B/C.'],
     'why': '38 ürünün 25\'i A sınıfında: ciro geniş bir yelpazeye yayılmış, klasik 80/20 burada geçerli değil. Bu bulgu "uzun kuyruğu kes" önerisinin bu işletmede riskli olduğunu söyler. Eşik kuralını (öncesindeki pay) sözleşmeye yaz; "kendisi dahil ≤ %80" kuralı sınırdaki ürünü B yapar ve iki rapor birbirini tutmaz.'},
    {'t': 'code', 'stage': 'Kendin yaz', 'id': 'is-metrikleri-7', 'diff': 2, 'needs': ['pandas'],
     'q': '<p>KPI ağacı ayrıştırması. <code>kpi_agaci(x, yil0, yil1)</code> iki yılın <code>ciro</code>, <code>musteri</code> (tekil), <code>frekans</code> (sipariş / müşteri) ve <code>aov</code> (ciro / sipariş) değerlerini hesaplasın ve her biri için <b>büyüme katsayısını</b> (yil1 / yil0, 3 basamak) sözlük olarak döndürsün. Ayrıca <code>kontrol</code> anahtarı, musteri × frekans × aov katsayılarının çarpımını (3 basamak) versin; bu ciro katsayısına eşit olmalı.</p>',
     'start': SETUP + '\n\ndef kpi_agaci(x, yil0, yil1):\n    pass\n\n\nprint(kpi_agaci(x, 2023, 2024))\n',
     'sol': SETUP + '\n\ndef kpi_agaci(x, yil0, yil1):\n    def olc(yil):\n        y = x[x["order_date"].dt.year == yil]\n        ciro = y["net"].sum()\n        siparis = y["order_id"].nunique()\n        musteri = y["customer_id"].nunique()\n        return {"ciro": ciro, "musteri": musteri, "frekans": siparis / musteri, "aov": ciro / siparis}\n\n    a, b = olc(yil0), olc(yil1)\n    kat = {k: b[k] / a[k] for k in a}\n    sonuc = {k: round(float(v), 3) for k, v in kat.items()}\n    sonuc["kontrol"] = round(float(kat["musteri"] * kat["frekans"] * kat["aov"]), 3)\n    return sonuc\n\n\nprint(kpi_agaci(x, 2023, 2024))\n',
     'tests': 'r = kpi_agaci(x, 2023, 2024)\nassert r["ciro"] == 1.878, "Ciro 1.878 katına çıktı"\nassert r["musteri"] == 1.618 and r["frekans"] == 1.08 and r["aov"] == 1.075, "Müşteri ×1.618, frekans ×1.08, AOV ×1.075"\nassert r["kontrol"] == r["ciro"], "Çarpanların çarpımı ciro katsayısına eşit olmalı (ağaç tutarlı)"\nr2 = kpi_agaci(x, 2022, 2023)\nassert r2["aov"] < 1 and r2["ciro"] > 4, "2022→2023: AOV düştü ama ciro 4 kattan fazla arttı"\n',
     'hints': ['Bir yılın dört değerini hesaplayan iç fonksiyon yaz, iki kez çağır.', 'Katsayılar yuvarlanmadan çarpılmalı; kontrolü yuvarlamadan önceki değerlerle yap.'],
     'why': 'Çarpımsal ağaçta katsayılar çarpılarak toplam büyümeyi verir: 1.618 × 1.08 × 1.075 ≈ 1.878. Büyümenin baskın kaynağı müşteri sayısı. Toplamsal pay istersen logaritma al: log(1.878) içinde müşterinin payı log(1.618)/log(1.878) ≈ %77.'},
    {'t': 'code', 'stage': 'Kendin yaz', 'id': 'is-metrikleri-8', 'diff': 2, 'needs': ['pandas'],
     'q': '<p>Churn tanımı pencereye bağlıdır. <code>churn_orani(o, referans, pencere_gun)</code> her müşterinin <b>son sipariş tarihine</b> (tüm durumlar) bakıp, referans tarihine uzaklığı <code>pencere_gun</code>\'den <b>büyük</b> olanları kayıp sayan bir sözlük döndürsün: <code>{"musteri": toplam, "kayip": sayi, "oran": 4 basamak}</code>. <code>referans</code> metin olarak gelir (<code>"2024-12-31"</code>).</p>',
     'start': 'import veri\nimport pandas as pd\n\no = veri.oku("anadolu_market", "orders", parse_dates=["order_date"])\n\n\ndef churn_orani(o, referans, pencere_gun):\n    pass\n\n\nfor p in (90, 180, 365):\n    print(p, churn_orani(o, "2024-12-31", p))\n',
     'sol': 'import veri\nimport pandas as pd\n\no = veri.oku("anadolu_market", "orders", parse_dates=["order_date"])\n\n\ndef churn_orani(o, referans, pencere_gun):\n    son = o.groupby("customer_id")["order_date"].max()\n    gun = (pd.Timestamp(referans) - son).dt.days\n    kayip = int((gun > pencere_gun).sum())\n    return {"musteri": int(len(son)), "kayip": kayip, "oran": round(kayip / len(son), 4)}\n\n\nfor p in (90, 180, 365):\n    print(p, churn_orani(o, "2024-12-31", p))\n',
     'tests': 'assert churn_orani(o, "2024-12-31", 180) == {"musteri": 136, "kayip": 25, "oran": 0.1838}, "180 günlük pencerede 136 müşteriden 25\'i kayıp (0.1838)"\nassert churn_orani(o, "2024-12-31", 90)["kayip"] == 42, "90 günlük pencerede 42 kayıp"\nr = [churn_orani(o, "2024-12-31", p)["oran"] for p in (60, 90, 180, 365)]\nassert r == sorted(r, reverse=True), "Pencere uzadıkça churn oranı azalmalı (ya da sabit kalmalı)"\n',
     'hints': ['Müşteri başına son tarih: <code>groupby("customer_id")["order_date"].max()</code>.', '<code>(pd.Timestamp(referans) - son).dt.days</code> gün farkını verir.'],
     'why': 'Aynı veride churn %31 (90 gün) ya da %18 (180 gün) çıkabilir; tanım değişince "churn arttı" haberi yanlış alarm olur. Pencereyi satın alma döngüsüne (iki sipariş arası ~86 gün) göre seç ve sözleşmeye yaz. Kohortla birleştirince "hangi dönemin müşterileri daha çabuk kayboluyor?" sorusu cevaplanır.'},
]

EX += [
    {'t': 'code', 'stage': 'Hata avı', 'kind': 'bug', 'id': 'is-metrikleri-9', 'diff': 2, 'needs': ['pandas'],
     'q': '<p><b>Hatayı bul ve düzelt.</b> <code>donem_donusumu(w)</code> Ekim–Kasım 2024 dönemi için ziyaretten satın almaya dönüşüm oranını (4 basamak) döndürmeli. Kod günlük oranları hesaplayıp ortalamasını alıyor ve 0.1042 buluyor; pazarlamanın panosu 0.1117 gösteriyor. Hangisi doğru? Kodu düzelt.</p>',
     'start': 'import veri\nimport pandas as pd\n\nw = veri.oku("anadolu_market", "web_events", parse_dates=["event_time"])\n\n\ndef donem_donusumu(w):\n    w = w.assign(gun=w["event_time"].dt.date)\n    g = w.pivot_table(index="gun", columns="event_type", values="user_id", aggfunc="nunique", fill_value=0)\n    g = g[g["visit"] > 0]\n    return round(float((g["purchase"] / g["visit"]).mean()), 4)\n\n\nprint(donem_donusumu(w))\n',
     'sol': 'import veri\nimport pandas as pd\n\nw = veri.oku("anadolu_market", "web_events", parse_dates=["event_time"])\n\n\ndef donem_donusumu(w):\n    w = w.assign(gun=w["event_time"].dt.date)\n    g = w.pivot_table(index="gun", columns="event_type", values="user_id", aggfunc="nunique", fill_value=0)\n    g = g[g["visit"] > 0]\n    return round(float(g["purchase"].sum() / g["visit"].sum()), 4)\n\n\nprint(donem_donusumu(w))\n',
     'tests': 'assert donem_donusumu(w) == 0.1117, "Dönem oranı = toplam satın alan / toplam ziyaret = 0.1117; günlük oranların ortalaması küçük günlere fazla ağırlık verir"\n',
     'hints': ['60 günün ziyaretçi sayıları çok farklı; her güne eşit ağırlık vermek doğru mu?', 'Oranı pay toplamı / payda toplamı olarak hesapla.'],
     'why': 'Oranların basit ortalaması, trafiği az olan günlere trafiği çok olan günlerle aynı ağırlığı verir. Doğru dönem oranı ağırlıklı ortalamadır, yani toplam / toplam. (Not: günlük tekil kullanıcıların toplamı dönemin tekil kullanıcısı değildir; bu veride her kullanıcı tek gün göründüğü için ikisi örtüşüyor.)'},
    {'t': 'code', 'stage': 'Hata avı', 'kind': 'bug', 'id': 'is-metrikleri-10', 'diff': 2, 'needs': ['pandas'],
     'q': '<p><b>Hatayı bul ve düzelt.</b> <code>ytd_yoy(x, tarih)</code> verilen tarihe kadar yılbaşından bugüne (YTD) ciroyu geçen yılın <b>aynı dönemiyle</b> karşılaştırıp <code>(bu_yil, gecen_yil, yoy)</code> döndürmeli (ciro 2, yoy 3 basamak). 15 Haziran 2024 için fonksiyon −%37.3 düşüş raporluyor; oysa şirket büyüyor.</p>',
     'start': SETUP + '\n\ndef ytd_yoy(x, tarih):\n    t = pd.Timestamp(tarih)\n    bu = x[(x["order_date"] >= f"{t.year}-01-01") & (x["order_date"] <= t)]["net"].sum()\n    gecen = x[x["order_date"].dt.year == t.year - 1]["net"].sum()\n    return round(bu, 2), round(gecen, 2), round(bu / gecen - 1, 3)\n\n\nprint(ytd_yoy(x, "2024-06-15"))\n',
     'sol': SETUP + '\n\ndef ytd_yoy(x, tarih):\n    t = pd.Timestamp(tarih)\n    gt = t - pd.DateOffset(years=1)\n    bu = x[(x["order_date"] >= f"{t.year}-01-01") & (x["order_date"] <= t)]["net"].sum()\n    gecen = x[(x["order_date"] >= f"{gt.year}-01-01") & (x["order_date"] <= gt)]["net"].sum()\n    return round(bu, 2), round(gecen, 2), round(bu / gecen - 1, 3)\n\n\nprint(ytd_yoy(x, "2024-06-15"))\n',
     'tests': 'r = ytd_yoy(x, "2024-06-15")\nassert r == (235085.25, 131237.8, 0.791), "15 Haziran 2024 YTD 235085.25, 2023 aynı dönem 131237.8: +%79.1"\nassert ytd_yoy(x, "2024-11-15") == (572695.35, 311297.85, 0.84), "15 Kasım 2024 için +%84"\nassert ytd_yoy(x, "2024-02-29")[1] > 0, "Artık gün (29 Şubat) de çalışmalı: DateOffset 28 Şubat\'a iner"\n',
     'hints': ['Pay 5,5 aylık, payda 12 aylık: aynı uzunlukta değil.', 'Geçen yılın aynı gününü <code>t - pd.DateOffset(years=1)</code> ile bul ve aynı aralığı süz.'],
     'why': 'YTD karşılaştırmada iki tarafın da aynı takvim aralığını kapsaması gerekir. <code>pd.DateOffset(years=1)</code> artık yılı da doğru ele alır (29 Şubat → 28 Şubat); <code>t.replace(year=t.year - 1)</code> ise 29 Şubat\'ta ValueError verir.'},
]

EX += [
    {'t': 'code', 'stage': 'Meydan okuma', 'id': 'is-metrikleri-11', 'diff': 3, 'needs': ['pandas'],
     'q': '<p><b>Fiyat–hacim–karma köprüsü.</b> <code>kopru(x, urunler, yil0, yil1)</code> kategori düzeyinde (ürün tablosundaki <code>category</code>) şu etkileri hesaplayıp 2 basamakla sözlük döndürsün:</p><ul><li>A<sub>i</sub> = kategori adedi (quantity toplamı), P<sub>i</sub> = kategori cirosu / A<sub>i</sub>; P̄₀ = toplam ciro₀ / toplam adet₀</li><li><code>hacim</code> = (ΣA₁ − ΣA₀) × P̄₀</li><li><code>karma</code> = Σ (A<sub>i1</sub>/ΣA₁ − A<sub>i0</sub>/ΣA₀) × ΣA₁ × P<sub>i0</sub></li><li><code>fiyat</code> = Σ (P<sub>i1</sub> − P<sub>i0</sub>) × A<sub>i1</sub></li><li><code>toplam</code> = ciro₁ − ciro₀</li></ul><p>Üç etkinin toplamı <code>toplam</code>\'a eşit olmalı. Her iki yılda da satışı olan kategorileri kullan.</p>',
     'start': SETUP + 'urunler = veri.oku("anadolu_market", "products")\n\n\ndef kopru(x, urunler, yil0, yil1):\n    pass\n\n\nprint(kopru(x, urunler, 2023, 2024))\n',
     'sol': SETUP + 'urunler = veri.oku("anadolu_market", "products")\n\n\ndef kopru(x, urunler, yil0, yil1):\n    y = x.merge(urunler[["product_id", "category"]], on="product_id", validate="many_to_one")\n    y = y[y["order_date"].dt.year.isin([yil0, yil1])].assign(yil=y["order_date"].dt.year)\n    t = y.pivot_table(index="category", columns="yil", values=["net", "quantity"], aggfunc="sum").dropna()\n    c0, c1 = t[("net", yil0)], t[("net", yil1)]\n    a0, a1 = t[("quantity", yil0)], t[("quantity", yil1)]\n    p0, p1 = c0 / a0, c1 / a1\n    A0, A1 = a0.sum(), a1.sum()\n    hacim = (A1 - A0) * (c0.sum() / A0)\n    karma = ((a1 / A1 - a0 / A0) * A1 * p0).sum()\n    fiyat = ((p1 - p0) * a1).sum()\n    return {"hacim": round(hacim, 2), "karma": round(karma, 2), "fiyat": round(fiyat, 2),\n            "toplam": round(c1.sum() - c0.sum(), 2)}\n\n\nprint(kopru(x, urunler, 2023, 2024))\n',
     'tests': 'k = kopru(x, urunler, 2023, 2024)\nassert k["toplam"] == 329053.45, "2023 → 2024 ciro farkı 329053.45"\nassert k["hacim"] == 281871.04, "Hacim etkisi 281871.04 (adet 754 → 1321)"\nassert k["karma"] == -12651.3, "Karma etkisi -12651.30: satış ucuz kategorilere kaydı"\nassert k["fiyat"] == 59833.71, "Fiyat etkisi 59833.71"\nassert abs(k["hacim"] + k["karma"] + k["fiyat"] - k["toplam"]) < 0.02, "Üç etkinin toplamı ciro farkına eşit olmalı"\n',
     'hints': ['Kategori × yıl için hem ciro hem adet lazım: <code>pivot_table(values=["net", "quantity"], columns="yil", aggfunc="sum")</code>.', 'Karma etkisinde ağırlık payların farkı, fiyat yıl₀ fiyatıdır; fiyat etkisinde fiyat farkı yıl₁ adediyle çarpılır.', 'Kontrol: hacim + karma + fiyat = c1.sum() − c0.sum().'],
     'why': 'Büyümenin %86\'sı hacimden, %18\'i fiyattan geliyor; karma ise −%4: müşteriler görece ucuz kategorilere (Kitap, Kozmetik) kaydı. Bu ayrıştırma "fiyat artırdık, ciro arttı" yorumunun ne kadarının doğru olduğunu gösterir. Finans ekiplerinin aylık köprü (waterfall) grafikleri tam olarak bu tabloyu çizer.'},
    {'t': 'code', 'stage': 'Meydan okuma', 'id': 'is-metrikleri-12', 'diff': 3, 'needs': ['pandas'],
     'q': '<p><b>Simpson denetçisi.</b> <code>simpson_kontrol(df, grup, katman, pay, payda)</code> şunu yapsın: <code>grup</code> sütununda tam iki değer olmalı (sıralı: a, b; değilse <code>ValueError</code>). Oran = pay toplamı / payda toplamı. Dönüş sözlüğü:</p><ul><li><code>toplam_fark</code>: a\'nın toplam oranı − b\'nin toplam oranı (4 basamak)</li><li><code>katman_farklari</code>: {katman değeri: a − b oran farkı (4 basamak)}</li><li><code>paradoks</code>: tüm katman farkları toplam farkla <b>ters işaretliyse</b> True</li></ul><p>Önce küçük örnekte (paradoks var), sonra gerçek veride dene: <code>kesit_bi</code> <code>Satislar</code> tablosunda Web ve Mobil kanallarının iade oranı, ürün kategorisi katmanında.</p>',
     'start': 'import veri\nimport pandas as pd\n\nornek = pd.DataFrame({"kampanya": ["A", "A", "B", "B"], "cihaz": ["mobil", "masa", "mobil", "masa"],\n                      "ziyaret": [1000, 100, 100, 1000], "satis": [100, 30, 8, 250]})\n\n\ndef simpson_kontrol(df, grup, katman, pay, payda):\n    pass\n\n\nprint(simpson_kontrol(ornek, "kampanya", "cihaz", "satis", "ziyaret"))\n',
     'sol': 'import veri\nimport pandas as pd\n\nornek = pd.DataFrame({"kampanya": ["A", "A", "B", "B"], "cihaz": ["mobil", "masa", "mobil", "masa"],\n                      "ziyaret": [1000, 100, 100, 1000], "satis": [100, 30, 8, 250]})\n\n\ndef simpson_kontrol(df, grup, katman, pay, payda):\n    degerler = sorted(df[grup].dropna().unique())\n    if len(degerler) != 2:\n        raise ValueError(f"{grup} sütununda tam iki değer olmalı, {len(degerler)} var")\n    a, b = degerler\n    t = df.groupby(grup)[[pay, payda]].sum()\n    oran = t[pay] / t[payda]\n    toplam_fark = oran[a] - oran[b]\n    k = df.groupby([katman, grup])[[pay, payda]].sum()\n    ko = (k[pay] / k[payda]).unstack()\n    farklar = (ko[a] - ko[b]).dropna()\n    paradoks = bool(len(farklar) > 0 and ((farklar * toplam_fark) < 0).all())\n    return {"toplam_fark": round(float(toplam_fark), 4),\n            "katman_farklari": {kk: round(float(v), 4) for kk, v in farklar.items()},\n            "paradoks": paradoks}\n\n\nprint(simpson_kontrol(ornek, "kampanya", "cihaz", "satis", "ziyaret"))\n\ns = veri.oku("kesit_bi", "Satislar").merge(veri.oku("kesit_bi", "Urunler")[["UrunNo", "Kategori"]], on="UrunNo")\ns = s[s["Kanal"].isin(["Web", "Mobil"])].assign(iade=lambda d: (d["Durum"] == "İade").astype(int), bir=1)\nprint(simpson_kontrol(s, "Kanal", "Kategori", "iade", "bir"))\n',
     'tests': 'r = simpson_kontrol(ornek, "kampanya", "cihaz", "satis", "ziyaret")\nassert r["toplam_fark"] == -0.1164, "Toplamda A, B\'den 11.64 puan geride"\nassert r["katman_farklari"] == {"masa": 0.05, "mobil": 0.02}, "Her cihazda A önde: masa +0.05, mobil +0.02"\nassert r["paradoks"] is True, "Bu örnekte Simpson paradoksu var"\ns = veri.oku("kesit_bi", "Satislar").merge(veri.oku("kesit_bi", "Urunler")[["UrunNo", "Kategori"]], on="UrunNo")\ns = s[s["Kanal"].isin(["Web", "Mobil"])].assign(iade=lambda d: (d["Durum"] == "İade").astype(int), bir=1)\ng = simpson_kontrol(s, "Kanal", "Kategori", "iade", "bir")\nassert g["toplam_fark"] == -0.009, "Gerçek veri: Mobil iade oranı Web\'den yaklaşık 0.9 puan düşük"\nassert g["paradoks"] is False and len(g["katman_farklari"]) == 7, "7 kategoride farklar karışık yönlü: paradoks yok"\nhata = False\ntry:\n    simpson_kontrol(veri.oku("kesit_bi", "Satislar").assign(bir=1), "Kanal", "Durum", "bir", "bir")\nexcept ValueError:\n    hata = True\nassert hata, "Üç kanallı veride ValueError fırlatılmalı"\n',
     'hints': ['Toplam oran ve katman oranlarını ayrı groupby\'larla, pay ve payda TOPLAMLARINDAN hesapla.', 'İşaret karşılaştırması: <code>(farklar * toplam_fark) &lt; 0</code> tüm katmanlarda doğruysa paradoks.', 'Grup değerlerini <code>sorted(df[grup].dropna().unique())</code> ile al; iki değilse <code>raise ValueError</code>.'],
     'why': 'Gerçek veride paradoks yok: kategorilerin bazısında Mobil, bazısında Web önde. Bu da bir bulgudur: toplam farkı yorumlarken karma etkisinin yönü tek değil. Denetçiyi her "A, B\'den iyi" iddiasından önce olası karıştırıcı (confounder) katmanlarla çalıştırmak, yanlış kararın en ucuz sigortasıdır.'},
]

EX += [
    {'t': 'code', 'stage': 'Mini proje', 'id': 'is-metrikleri-13', 'diff': 3, 'needs': ['pandas'],
     'q': '<p><b>Aylık KPI kartı.</b> Yönetim her ayın başında tek bir kart istiyor. <code>kpi_karti(o, x, ay)</code> (<code>ay</code>: <code>"YYYY-MM"</code>) şu anahtarlarla bir sözlük döndürsün:</p><ul><li><code>ciro</code> (2 basamak), <code>siparis</code> (tekil, delivered/shipped), <code>aov</code> (2 basamak), <code>aktif_musteri</code> (o ay geçerli siparişi olan tekil müşteri)</li><li><code>yeni_musteri</code>: <b>ilk siparişi</b> (tüm durumlar, <code>o</code> tablosundan) o ayda olan müşteri sayısı</li><li><code>mom</code>: önceki aya göre ciro değişimi, <code>yoy</code>: geçen yılın aynı ayına göre değişim (3 basamak; karşılaştırma ayında ciro yoksa None)</li><li><code>ozet</code>: <code>"2024-11: ciro 88.535,60 TL (MoM +21.2%, YoY +61.9%), 57 sipariş, AOV 1.553,26 TL"</code> biçiminde tek satır metin (Türkçe sayı biçimi: binlik nokta, ondalık virgül)</li></ul>',
     'start': SETUP + '\n\ndef kpi_karti(o, x, ay):\n    pass\n\n\nk = kpi_karti(o, x, "2024-11")\nfor a, v in k.items():\n    print(a, ":", v)\n',
     'sol': SETUP + '\n\ndef tl(sayi):\n    return f"{sayi:,.2f}".replace(",", "_").replace(".", ",").replace("_", ".")\n\n\ndef kpi_karti(o, x, ay):\n    x = x.assign(ay=x["order_date"].dt.strftime("%Y-%m"))\n    aylik = x.groupby("ay")["net"].sum()\n    donem = pd.Period(ay, freq="M")\n    onceki, gecen_yil = str(donem - 1), str(donem - 12)\n\n    def degisim(ref):\n        if ref not in aylik.index or aylik[ref] == 0:\n            return None\n        return round(float(aylik[ay] / aylik[ref] - 1), 3)\n\n    bu = x[x["ay"] == ay]\n    ilk = o.groupby("customer_id")["order_date"].min().dt.strftime("%Y-%m")\n    kart = {\n        "ciro": round(float(bu["net"].sum()), 2),\n        "siparis": int(bu["order_id"].nunique()),\n        "aov": round(float(bu["net"].sum() / bu["order_id"].nunique()), 2),\n        "aktif_musteri": int(bu["customer_id"].nunique()),\n        "yeni_musteri": int((ilk == ay).sum()),\n        "mom": degisim(onceki),\n        "yoy": degisim(gecen_yil),\n    }\n    def yuzde(v):\n        return "yok" if v is None else f"{v:+.1%}"\n    kart["ozet"] = (f"{ay}: ciro {tl(kart[\'ciro\'])} TL (MoM {yuzde(kart[\'mom\'])}, YoY {yuzde(kart[\'yoy\'])}), "\n                    f"{kart[\'siparis\']} sipariş, AOV {tl(kart[\'aov\'])} TL")\n    return kart\n\n\nk = kpi_karti(o, x, "2024-11")\nfor a, v in k.items():\n    print(a, ":", v)\n',
     'tests': 'k = kpi_karti(o, x, "2024-11")\nassert k["ciro"] == 88535.6 and k["siparis"] == 57 and k["aov"] == 1553.26, "Kasım 2024: ciro 88535.6, 57 sipariş, AOV 1553.26"\nassert k["aktif_musteri"] == 50 and k["yeni_musteri"] == 0, "50 aktif müşteri, 0 yeni müşteri (ilk sipariş tüm durumlardan)"\nassert k["mom"] == 0.212 and k["yoy"] == 0.619, "MoM +0.212, YoY +0.619"\nassert k["ozet"] == "2024-11: ciro 88.535,60 TL (MoM +21.2%, YoY +61.9%), 57 sipariş, AOV 1.553,26 TL", "Özet satırı biçimi farklı: " + k["ozet"]\nk2 = kpi_karti(o, x, "2024-01")\nassert k2["yeni_musteri"] == 11 and k2["mom"] == 0.113, "Ocak 2024: 11 yeni müşteri, MoM +0.113 (Aralık 2023\'e göre)"\nk3 = kpi_karti(o, x, "2023-03")\nassert k3["yoy"] is None, "2022-03\'te satış yok: yoy None olmalı"\n',
     'hints': ['Önceki ve geçen yılın aynı ayını <code>pd.Period(ay, freq="M") - 1</code> ve <code>- 12</code> ile bul.', 'Yeni müşteri: <code>o.groupby("customer_id")["order_date"].min()</code> ayı seçilen aya eşit olanlar.', 'Türkçe biçim: <code>f"{s:,.2f}"</code> sonra virgül ve noktayı geçici bir karakterle yer değiştir.'],
     'why': 'Kart, dersin kalıplarını tek yerde birleştirir: tanımlı ciro, tekil sipariş, AOV, MoM ve YoY (mevsimsellik için), yeni ve aktif müşteri (KPI ağacının müşteri kolu). Kasım\'da hiç yeni müşteri yokken ciro %62 büyümüş: büyüme tamamen mevcut müşterilerden. Bu cümle, panodaki beş sayıdan daha değerlidir.'},
]

FAQ = [
    {'q': 'Kaç KPI izlemeliyim?', 'a': 'Yönetim kartında 5–7 ana metrik yeterli: bir kuzey yıldızı, onun KPI ağacındaki 3–4 çarpanı ve 1–2 koruyucu metrik. Geri kalanı kırılım ve teşhis içindir; panoda değil, analiz notebook\'unda yaşar.'},
    {'q': 'MoM mu YoY mu raporlamalıyım?', 'a': 'İkisini birlikte, farklı amaçlarla. MoM kısa vadeli ivmeyi gösterir ama mevsimsellikten çok etkilenir (Kasım indirimleri). YoY mevsimselliği nötrler ama yavaş tepki verir. Büyüyen genç işletmede YoY büyük çıkar; onu mutlak farkla birlikte ver.'},
    {'q': 'LTV hesaplarken ciro mu marj mı kullanmalıyım?', 'a': 'Marj (katkı payı). CAC ile karşılaştıracaksan ikisi de para cinsinden ve kâr tarafında olmalı. Ciro bazlı LTV, düşük marjlı ürün satan müşterileri olduğundan değerli gösterir.'},
    {'q': 'Kohort tablosunu ay mı çeyrek mi kurmalıyım?', 'a': 'Satın alma döngüne göre. Haftada bir alışveriş yapılan bir işte hafta ya da ay; iki üç ayda bir alınan ürünlerde çeyrek. Aylık kohortlar küçük kalırsa (5–10 müşteri) oranlar gürültülü olur; o zaman çeyreğe çık.'},
]

MISTAKES = [
    {'bad': 'oran = (gunluk["satis"] / gunluk["ziyaret"]).mean()', 'good': 'oran = gunluk["satis"].sum() / gunluk["ziyaret"].sum()', 'why': 'Oranların ortalaması küçük gruplara fazla ağırlık verir; dönem oranı toplam / toplamdır.'},
    {'bad': 'ytd = x[x["order_date"] <= "2024-06-15"]["net"].sum()\ngecen = x[x["order_date"].dt.year == 2023]["net"].sum()', 'good': 'gecen = x[(x["order_date"] >= "2023-01-01") & (x["order_date"] <= "2023-06-15")]["net"].sum()', 'why': 'YoY\'de iki dönem aynı uzunlukta ve aynı takvim aralığında olmalı.'},
    {'bad': 'sayim = o.groupby(["kohort", "fark"])["customer_id"].nunique().unstack(fill_value=0)', 'good': 'sayim = o.groupby(["kohort", "fark"])["customer_id"].nunique().unstack()', 'why': 'Gözlemlenmemiş gelecek dönemleri 0 yapmak tutundurma eğrisini yapay olarak düşürür.'},
    {'bad': 'huni = w["event_type"].value_counts()', 'good': 'huni = w.groupby("event_type")["user_id"].nunique().reindex(adimlar)', 'why': 'Huni olay değil tekil kullanıcı sayar ve adım sırasına dizilmelidir.'},
    {'bad': 'ltv = aov * frekans * omur', 'good': 'ltv = aov * frekans * marj_orani * omur', 'why': 'LTV ciro değil katkı payıdır; CAC ile ancak marj üzerinden karşılaştırılabilir.'},
]

LESSON = {
    'id': 'is-metrikleri', 'lv': 'ileri', 'mod': 'Veri Bilimi Araçları', 'min': 65,
    'needs': ['pandas', 'numpy'],
    'title': 'İş metrikleri ve analitik kalıplar: KPI, huni, kohort, LTV',
    'sum': 'KPI ağacı ve metrik sözleşmesi, web_events ile huni, çeyreklik kohort tutundurma ve churn penceresi, basit ve kohort bazlı LTV ile LTV/CAC, MoM/YoY/YTD ve aynı dönem kıyası, fiyat-hacim-karma köprüsü, Pareto (ABC) ve metrik tuzakları: oranların ortalaması, Simpson paradoksu, payda kayması.',
    'goals': [
        'Ciroyu KPI ağacının çarpanlarına ayırıp büyümenin kaynağını sayıyla gösterebilirim',
        'web_events verisinden tekil kullanıcılı huni ve cihaz kırılımı çıkarabilirim',
        'Kohort tutundurma tablosu, churn ve LTV hesaplayıp tanımlarını sözleşmeye yazabilirim',
        'MoM, YoY ve YTD karşılaştırmalarını aynı takvim aralığıyla doğru kurabilirim',
        'Fiyat-hacim-karma köprüsü ve Simpson kontrolüyle karma etkisini ayırt edebilirim',
    ],
    'body': BODY, 'ex': EX, 'faq': FAQ, 'mistakes': MISTAKES,
}
