BODY = r'''<h2>Zaman, verinin en önemli sütunu</h2>
<p>Anadolu Market'in yönetimi "bu ay geçen aydan iyi mi?", "kampanya haftasında satış gerçekten arttı mı, yoksa her ayın ilk haftası zaten böyle mi?" diye sorar. Anadolu Bank'ın operasyon ekibi ATM işlemlerinin saatlik yoğunluğuna, risk ekibi gece yarısı yapılan olağandışı işlemlere bakar. Bu soruların hepsinde satırların bir <b>zaman damgası</b> vardır ve cevap, zamanı doğru işlemekten geçer.</p>
<p><b>groupby</b> dersinde <code>resample</code>'a kısaca, <b>ileri pandas</b> dersinde <code>rolling</code>'e değindin. Bu ders zaman serisi (time series) analizinin tamamını kurar: metni tarihe çevirmek, tarih index'iyle dilimlemek, kovalara toplamak, önceki dönemle kıyaslamak, eksik günleri doldurmak, saat dilimi, iş günü ve mevsimsellik.</p>

<h2>Metni tarihe çevirmek: to_datetime</h2>
<p>CSV'den gelen tarih her zaman metindir. <code>pd.to_datetime</code> onu <code>datetime64</code> türüne çevirir. Biçimi (<code>format</code>) açıkça ver: hem hızlıdır hem de "03.05.2024 üç mayıs mı, beş mart mı?" belirsizliğini ortadan kaldırır. Bozuk değerler için <code>errors="coerce"</code> hata yerine <code>NaT</code> (Not a Time, tarihin NaN'ı) üretir.</p>
<pre class="py">import pandas as pd

ham = pd.DataFrame({
    "tarih": ["05.03.2024", "17.03.2024", "31.02.2024", "02.04.2024", "bilinmiyor"],
    "tutar": [120.0, 340.5, 99.0, 410.0, 55.0],
})
ham["tarih"] = pd.to_datetime(ham["tarih"], format="%d.%m.%Y", errors="coerce")
print(ham)
print("bozuk tarih sayısı:", ham["tarih"].isna().sum())
temiz = ham.dropna(subset=["tarih"])

# Unix zaman damgası (saniye) de sık gelir: bankacılık API'leri böyle verir
print(pd.to_datetime([1709251200, 1709337600], unit="s"))</pre>
<p>31 Şubat diye bir gün yok; <code>coerce</code> onu sessizce <code>NaT</code> yaptı. Bozuk satır sayısını mutlaka raporla: on satırsa yazım hatasıdır, binlerce satırsa biçimi yanlış seçmişsindir.</p>

<h2>DatetimeIndex: tarihle dilimleme</h2>
<p>Tarih sütununu index yapınca (<code>set_index("tarih")</code>) pandas zamanı anlayan bir index kurar: <b>DatetimeIndex</b>. Artık "Mart ayı" ya da "5-10 Mart arası" gibi kısmi metinlerle dilimleyebilirsin. Önce <code>sort_index()</code> çağır; sırasız tarih index'inde dilimleme güvenilmezdir.</p>
<pre class="py">import pandas as pd

gunler = pd.date_range("2024-02-26", "2024-03-12", freq="D")
ciro = pd.Series(range(100, 100 + 10 * len(gunler), 10), index=gunler, name="ciro")

print(ciro.loc["2024-03"].head(3))               # Mart'ın ilk üç günü
print(ciro.loc["2024-03-05":"2024-03-07"])       # iki uç dahil
print(ciro.index.min().date(), "→", ciro.index.max().date(), len(ciro), "gün")</pre>

<h2>dt erişimcisi: tarihin parçaları</h2>
<p>Tarih <b>sütun</b> olarak duruyorsa parçalarına <code>.dt</code> ile, index olarak duruyorsa doğrudan <code>index.month</code> gibi erişirsin.</p>
<div class="tbl-wrap"><table>
<tr><th>İfade</th><th>Sonuç (2024-03-04 Pazartesi)</th><th>Kullanım</th></tr>
<tr><td><code>.dt.year</code>, <code>.dt.month</code>, <code>.dt.day</code></td><td>2024, 3, 4</td><td>Yıl/ay kırılımı</td></tr>
<tr><td><code>.dt.dayofweek</code></td><td>0 (Pazartesi=0, Pazar=6)</td><td>Hafta içi/sonu analizi</td></tr>
<tr><td><code>.dt.quarter</code></td><td>1</td><td>Çeyrek raporu</td></tr>
<tr><td><code>.dt.hour</code></td><td>0</td><td>Saatlik yoğunluk</td></tr>
<tr><td><code>.dt.to_period("M")</code></td><td>2024-03</td><td>Ay anahtarı (raporda gruplama)</td></tr>
<tr><td><code>.dt.normalize()</code></td><td>2024-03-04 00:00</td><td>Saati at, günü tut</td></tr>
<tr><td><code>.dt.is_month_end</code></td><td>False</td><td>Ay sonu kapanışları</td></tr>
</table></div>
<pre class="py">import pandas as pd

islem = pd.DataFrame({
    "zaman": pd.to_datetime(["2024-03-04 09:15", "2024-03-09 23:40", "2024-03-10 14:05", "2024-03-29 18:30"]),
    "tutar": [1500, 250, 980, 4300],
})
islem["gun"] = islem["zaman"].dt.dayofweek
islem["hafta_sonu"] = islem["gun"] >= 5
islem["saat"] = islem["zaman"].dt.hour
islem["ay"] = islem["zaman"].dt.to_period("M").astype(str)
print(islem)
print(islem.groupby("hafta_sonu")["tutar"].sum())</pre>
<div class="tip"><b>Gün adı için sözlük kullan</b><code>dt.day_name()</code> İngilizce ad döndürür ve Türkçe yerel ayarı her ortamda bulunmaz. Raporda Türkçe ad istiyorsan <code>dayofweek</code> ile bir listeden eşle: <code>["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"]</code>.</div>

<h2>resample: zamanı kovalara bölmek</h2>
<p><code>resample</code> bir DatetimeIndex'i düzenli aralıklara böler, her aralığa bir özet uygular: günlük işlemlerden haftalık ciro, aylık ortalama, çeyreklik toplam. groupby'ın zamana özel hâlidir; fark, veride hiç kaydı olmayan aralıkları da üretmesidir (boş ay 0 ya da NaN olarak görünür).</p>
<div class="tbl-wrap"><table>
<tr><th>Takma ad</th><th>Anlamı</th><th>Etiket</th><th>Not</th></tr>
<tr><td><code>"D"</code></td><td>Gün</td><td>O gün</td><td>Her sürümde aynı</td></tr>
<tr><td><code>"W"</code></td><td>Hafta (Pazartesi–Pazar)</td><td>Pazar günü</td><td><code>"W-MON"</code> gibi çapa seçilebilir</td></tr>
<tr><td><code>"MS"</code></td><td>Ay</td><td>Ayın ilk günü</td><td>Rapor için en okunur</td></tr>
<tr><td><code>"ME"</code></td><td>Ay</td><td>Ayın son günü</td><td>pandas 2.2+; eski <code>"M"</code> kaldırılıyor</td></tr>
<tr><td><code>"QS"</code> / <code>"QE"</code></td><td>Çeyrek</td><td>Başı / sonu</td><td>Eski <code>"Q"</code> yerine</td></tr>
<tr><td><code>"h"</code></td><td>Saat</td><td>Saat başı</td><td>Büyük <code>"H"</code> kaldırılıyor</td></tr>
</table></div>
<pre class="py">import pandas as pd

siparis = pd.DataFrame({
    "tarih": pd.to_datetime(["2024-01-05", "2024-01-20", "2024-03-02", "2024-03-15", "2024-03-28"]),
    "tutar": [100.0, 200.0, 50.0, 80.0, 120.0],
}).set_index("tarih")

aylik = siparis["tutar"].resample("MS").sum()
print(aylik)                                  # Şubat 0 olarak geldi
print(siparis["tutar"].resample("MS").agg(["sum", "count", "mean"]))
print(siparis.resample("QS")["tutar"].sum())

# DatetimeIndex yapmadan: on= parametresi
print(siparis.reset_index().resample("MS", on="tarih")["tutar"].sum().tolist())</pre>
<div class="warn"><b>"M" yazma</b>pandas 2.2 <code>"M"</code>, <code>"Q"</code>, <code>"H"</code> için uyarı verir, pandas 3 bunları reddeder. Uygulamada tarayıcı pandas 2.2, senin bilgisayarın 3.x olabilir; iki sürümde de çalışan <code>"MS"</code>, <code>"ME"</code>, <code>"QS"</code>, <code>"QE"</code>, <code>"h"</code> kullan ya da <code>dt.to_period("M")</code> ile grupla.</div>

<h2>shift, diff, pct_change: önceki dönemle kıyas</h2>
<p><code>shift(1)</code> seriyi bir adım aşağı kaydırır: her satır "bir önceki dönemin değerini" görür (SQL'deki LAG). <code>diff()</code> farkı, <code>pct_change()</code> oransal değişimi verir. Aylık seride <code>shift(12)</code> "geçen yılın aynı ayı"dır: yıldan yıla (year over year, YoY) büyüme böyle hesaplanır ve mevsimselliği kendiliğinden ayıklar; Aralık'ı Kasım'la değil, geçen Aralık'la kıyaslarsın.</p>
<pre class="py">import pandas as pd

aylar = pd.date_range("2023-01-01", periods=15, freq="MS")
ciro = pd.Series([100, 95, 110, 120, 118, 130, 125, 128, 135, 140, 160, 210,
                  112, 104, 121], index=aylar, name="ciro")
tablo = pd.DataFrame({
    "ciro": ciro,
    "onceki_ay": ciro.shift(1),
    "fark": ciro.diff(),
    "aylik_%": (ciro.pct_change() * 100).round(1),
    "yoy_%": ((ciro / ciro.shift(12) - 1) * 100).round(1),
})
print(tablo.tail(4))</pre>
<p>Ocak 2024'te aylık değişim -46,7% görünüyor; panik yok, Aralık her yıl zirvedir. YoY sütunu gerçeği söylüyor: geçen Ocak'a göre +12%. Yönetime giden raporda iki ölçüyü birlikte vermek yanlış alarmı önler.</p>

<h2>Hareketli ortalama: satır mı, zaman mı?</h2>
<p><code>rolling(7)</code> son 7 <b>satırı</b>, <code>rolling("7D")</code> son 7 <b>günü</b> alır. Her gün kaydın varsa ikisi aynıdır. Ama mağaza pazar günleri kapalıysa ya da veri bazı günlerde eksikse <code>rolling(7)</code> fark etmeden 9-10 güne yayılır. Zaman tabanlı pencere DatetimeIndex ister ve pencere dolmasa da değer üretir.</p>
<pre class="py">import pandas as pd

s = pd.Series([10, 12, 30, 11, 13],
              index=pd.to_datetime(["2024-05-01", "2024-05-02", "2024-05-06", "2024-05-07", "2024-05-08"]))
print(pd.DataFrame({
    "satis": s,
    "son3_satir": s.rolling(3, min_periods=1).mean().round(2),
    "son3_gun": s.rolling("3D").mean().round(2),
}))</pre>

<h2>Eksik tarihleri doldurmak</h2>
<p>Satış olmayan gün tabloda hiç yoktur; ama "satış 0" ile "veri yok" farklı şeylerdir ve grafikte, ortalamada, <code>shift</code>'te fark yaratır. Tam takvimi <code>pd.date_range</code> ile kurup <code>reindex</code> et ya da <code>asfreq("D")</code> kullan.</p>
<pre class="py">import pandas as pd

satis = pd.Series([5, 7, 3], index=pd.to_datetime(["2024-05-01", "2024-05-03", "2024-05-06"]))
takvim = pd.date_range(satis.index.min(), satis.index.max(), freq="D")
print(satis.reindex(takvim, fill_value=0).tolist())     # satış: yoksa 0

stok = pd.Series([40, 32, 28], index=satis.index)
print(stok.asfreq("D").ffill().tolist())               # stok seviyesi: son bilinen değer</pre>
<div class="tbl-wrap"><table>
<tr><th>Ölçü türü</th><th>Eksik gün nasıl doldurulur?</th><th>Örnek</th></tr>
<tr><td>Akış (flow)</td><td>0</td><td>Satış adedi, işlem sayısı, ciro</td></tr>
<tr><td>Durum (stock)</td><td>Son bilinen değer (<code>ffill</code>)</td><td>Stok, hesap bakiyesi, döviz kuru</td></tr>
<tr><td>Ölçüm</td><td>Ara değer (<code>interpolate</code>) ya da boş bırak</td><td>Sıcaklık, sensör verisi</td></tr>
</table></div>

<h2>Saat dilimi: tz_localize ve tz_convert</h2>
<p>Sunucular genellikle UTC saklar; rapor ise İstanbul saatiyle istenir. Saat dilimi bilgisi olmayan (naive) bir zamana önce <code>tz_localize("UTC")</code> ile "bu UTC'dir" dersin, sonra <code>tz_convert("Europe/Istanbul")</code> ile çevirirsin. Türkiye 2016'dan beri yıl boyu UTC+3'tür; yaz saati uygulayan bölgelerde (Europe/Berlin gibi) dönüşümü elle +3 eklemek yerine mutlaka bu fonksiyonlarla yap.</p>
<pre class="py">import pandas as pd

kayit = pd.DataFrame({"zaman_utc": pd.to_datetime(["2024-03-01 21:30", "2024-03-02 06:10", "2024-07-15 12:00"])})
kayit["istanbul"] = kayit["zaman_utc"].dt.tz_localize("UTC").dt.tz_convert("Europe/Istanbul")
kayit["berlin"] = kayit["istanbul"].dt.tz_convert("Europe/Berlin")
kayit["ist_saat"] = kayit["istanbul"].dt.hour
print(kayit.to_string())
print("İstanbul'da gün değişti mi:", (kayit["istanbul"].dt.date != kayit["zaman_utc"].dt.date).tolist())</pre>
<div class="warn"><b>Naive ile aware karışmaz</b>Saat dilimli bir zamanı dilimsiz bir zamanla karşılaştırmak <code>TypeError</code> verir. Bir tabloda tek bir kural seç: ya hepsi UTC-aware ya hepsi yerel-naive. Gece yarısına yakın işlemlerde yanlış dilim, işlemi bir önceki güne yazar ve günlük mutabakatı bozar.</div>

<h2>İş günü</h2>
<p>"Kredi başvurusu 5 iş günü içinde sonuçlanır" kuralı hafta sonlarını ve resmî tatilleri saymaz. <code>pd.bdate_range</code> Pazartesi–Cuma günlerini üretir; <code>pd.offsets.BDay(n)</code> tarihe n iş günü ekler; <code>np.busday_count</code> iki tarih arasındaki iş gününü (bitiş hariç) tatil listesiyle sayar. Resmî tatil takvimini sen verirsin; kütüphane Türkiye tatillerini bilmez.</p>
<pre class="py">import numpy as np
import pandas as pd

basvuru = pd.Timestamp("2024-04-19")          # Cuma
print("5 iş günü sonra:", (basvuru + pd.offsets.BDay(5)).date())
nisan = pd.bdate_range("2024-04-01", "2024-04-30")
print("Nisan iş günü:", len(nisan))
tatiller = ["2024-04-10", "2024-04-11", "2024-04-12", "2024-04-23"]   # bayram ve 23 Nisan
print("tatiller hariç:", np.busday_count("2024-04-01", "2024-05-01", holidays=tatiller))</pre>

<h2>Mevsimsellik: haftanın günü etkisi</h2>
<p>Perakende satışı haftanın gününe göre düzenli dalgalanır: hafta sonu yüksek, salı düşük. Bu <b>mevsimsellik</b> (seasonality) bilinmeden "salı satışı düştü" alarmı anlamsızdır. En basit ölçü gün endeksidir: her günün ortalaması / genel ortalama. Daha sistematik yol, seriyi <b>trend</b> + <b>mevsimsel</b> + <b>artık</b> (residual) bileşenlerine ayıran <code>seasonal_decompose</code>'dur (statsmodels).</p>
<pre class="py">import numpy as np
import pandas as pd
from statsmodels.tsa.seasonal import seasonal_decompose

rng = np.random.default_rng(42)
gun = pd.date_range("2024-01-01", periods=56, freq="D")          # 8 tam hafta
hafta_deseni = np.array([90, 80, 85, 95, 110, 140, 130])          # Pzt..Paz
trend = np.linspace(0, 20, len(gun))
satis = pd.Series(np.tile(hafta_deseni, 8) + trend + rng.normal(0, 3, len(gun)), index=gun)

endeks = (satis.groupby(satis.index.dayofweek).mean() / satis.mean()).round(2)
print("gün endeksi:", endeks.tolist())

ayrisim = seasonal_decompose(satis, model="additive", period=7)
print("mevsimsel (ilk hafta):", ayrisim.seasonal.iloc[:7].round(1).tolist())
print("trend başı-sonu:", round(ayrisim.trend.dropna().iloc[0], 1), "→", round(ayrisim.trend.dropna().iloc[-1], 1))</pre>
<p>Cumartesi endeksi 1.3 civarında: normal bir cumartesi ortalamanın %30 üstündedir. Kampanya etkisini ölçerken ham satışı değil, bu endekse göre düzeltilmiş satışı karşılaştır.</p>

<div class="note"><b>Gerçek işte</b>Bir e-ticaret şirketinin haftalık performans toplantısındaki standart tablo: bu haftanın cirosu, geçen haftaya göre değişim, geçen yılın aynı haftasına göre değişim ve 4 haftalık hareketli ortalama. Bankacılıkta gün sonu mutabakatı UTC kayıtların İstanbul saatine doğru çevrilmesine, SLA (hizmet süresi) raporları iş günü hesabına dayanır. Bu tabloların hepsi bu dersteki on kadar fonksiyonla kurulur; hata çoğunlukla eksik günlerin 0 yerine yok sayılmasından ve saat diliminden gelir.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>resample'ın ince ayarları</h3>
<p><code>resample("W")</code> varsayılan olarak Pazar'a çapalanır ve etiketi aralığın sağ ucudur. Haftayı Pazartesi etiketiyle görmek istersen <code>resample("W-MON", label="left", closed="left")</code> kullan. Saatlik veride vardiya raporu için <code>offset="8h"</code> ile kovaları 08:00'dan başlatabilirsin.</p>
<h3>Timestamp mi Period mu?</h3>
<p>Timestamp bir an, Period bir aralıktır ("2024-03" ayının tamamı). Aylık raporlarda <code>to_period("M")</code> anahtarları hem okunur hem de ayın hangi günü etiketleneceği tartışmasını bitirir.</p>
<h3>Tahmine giriş ve sızıntı</h3>
<p>Tahmin (forecasting) için önce basit kıyas modellerini kur: "yarın = bugün" (naive) ve "gelecek salı = geçen salı" (seasonal naive). statsmodels'teki üstel düzeltme (ExponentialSmoothing) ve ARIMA bunların üstüne kurulur. Zaman serisinde rastgele train/test bölmesi yapma: modeli geçmişle eğit, gelecekle test et; aksi hâlde gelecekten bilgi sızar (leakage) ve model kâğıt üstünde parlak, gerçekte işe yaramaz çıkar.</p>
</section>'''

LESSON = dict(
    id='pandas-zaman-serisi', lv='ileri', mod='Veri Bilimi Araçları', min=55, needs=['pandas', 'numpy', 'statsmodels'],
    title='Zaman serisi analizi',
    sum='to_datetime, DatetimeIndex ve dt erişimcisi, resample ile kovalama, shift/diff/pct_change ile dönem kıyası, rolling("7D"), eksik günleri doldurma, saat dilimi, iş günü ve mevsimsellik; Anadolu Market ve Anadolu Bank verisiyle.',
    goals=[
        'Metin tarihleri format ve errors="coerce" ile güvenle datetime\'a çevirebilirim',
        'DatetimeIndex ile dilimleyip resample ile günlük/haftalık/aylık özet çıkarabilirim',
        'shift, diff, pct_change ve shift(12) ile önceki dönem ve yıldan yıla büyüme hesaplayabilirim',
        'Eksik günleri doğru kuralla doldurup zaman tabanlı hareketli ortalama alabilirim',
        'UTC zamanları İstanbul saatine çevirip iş günü ve haftanın günü etkisini hesaplayabilirim',
    ],
    body=BODY,
    ex=[
        dict(t='mc', id='pandas-zaman-serisi-1', stage='Isınma',
             q='Aylık ciroyu <code>resample("MS").sum()</code> ve <code>resample("ME").sum()</code> ile ayrı ayrı topladın. İki sonuç arasındaki fark nedir?',
             o=['Toplamlar farklıdır; MS ayın ilk yarısını, ME ikinci yarısını toplar', 'Toplamlar aynıdır; yalnızca etiket ayın ilk ya da son günüdür', 'ME pandas 3\'te kaldırıldı; iki sürümde de yalnızca MS çalışır', 'MS haftalık kovalar üretir, ME ise aylık kovalar üretir'], a=1,
             why='İkisi de aynı ay kovalarını kullanır; MS (month start) etiketi ayın 1\'i, ME (month end) ayın son günüdür. pandas 3\'te kaldırılan eski "M" takma adıdır, "ME" değil.'),
        dict(t='mc', id='pandas-zaman-serisi-2', stage='Isınma',
             q='<code>pd.to_datetime(s, format="%d.%m.%Y", errors="coerce")</code> çağrısında <code>"31.02.2024"</code> değeri ne olur?',
             o=['2024-03-02 olur (taşar)', 'ValueError fırlatılır ve dönüşüm durur', 'NaT olur', '2024-02-29 olur (ayın son gününe yuvarlanır)'], a=2,
             why='errors="coerce" çevrilemeyen değeri NaT (eksik tarih) yapar ve kalan satırlar dönüşür. Varsayılan errors="raise" olsaydı ValueError alırdın. pandas tarihleri asla sessizce taşırmaz ya da yuvarlamaz.'),
        dict(t='mc', id='pandas-zaman-serisi-3', stage='Isınma',
             q='Haftalık ciro serisi <code>s</code> için "geçen haftaya göre yüzde değişim" hangisidir?',
             o=['s.shift(1)', 's.diff() * 100', 's.pct_change() * 100', 's.rolling(2).mean()'], a=2,
             why='pct_change() (s / s.shift(1) - 1) değerini verir; 100 ile çarpınca yüzde olur. shift(1) yalnızca önceki değeri getirir, diff() mutlak farktır (TL), rolling ortalama ise değişim değil düzleştirmedir.'),
        dict(t='predict', id='pandas-zaman-serisi-4', stage='Kodu oku', q='Bu kod ne yazdırır?',
             code='import pandas as pd\ns = pd.Series([100, 120, 90], index=pd.date_range("2024-01-01", periods=3, freq="D"))\nprint(s.diff().tolist())\n',
             o=['[20.0, -30.0]', '[nan, 20.0, -30.0]', '[nan, -20.0, 30.0]', '[0.0, 20.0, -30.0]'], a=1,
             why='diff her değerden bir öncekini çıkarır; ilk satırın öncesi olmadığı için NaN olur ve uzunluk korunur. 120 - 100 = 20, 90 - 120 = -30.'),
        dict(t='predict', id='pandas-zaman-serisi-5', stage='Kodu oku', q='Bu kod ne yazdırır?',
             code='import pandas as pd\ns = pd.Series([100, 200, 50], index=pd.to_datetime(["2024-01-05", "2024-01-20", "2024-03-02"]))\nprint(s.resample("MS").sum().tolist())\n',
             o=['[300, 50]', '[300, 0, 50]', '[100, 200, 50]', '[300, nan, 50]'], a=1,
             why='resample, veride kaydı olmayan Şubat\'ı da kova olarak üretir; boş kovanın toplamı 0\'dır (sum için). groupby ile ay sütununa göre gruplasaydın Şubat hiç görünmezdi ve [300, 50] alırdın.'),
        dict(t='predict', id='pandas-zaman-serisi-6', stage='Kodu oku', q='2024-03-04 bir Pazartesi. Bu kod ne yazdırır?',
             code='import pandas as pd\na = pd.Timestamp("2024-03-04")\nb = pd.Timestamp("2024-03-10")\nprint(a.dayofweek, b.dayofweek, (b - a).days)\n',
             o=['1 7 6', '0 6 6', '0 6 7', '1 0 6'], a=1,
             why='dayofweek Pazartesi için 0, Pazar için 6\'dır. İki tarih arasındaki fark 6 gündür (10 - 4). 1\'den başlayan numaralama isoweekday() ile gelir.'),
        dict(t='order', id='pandas-zaman-serisi-7', stage='Kodu oku',
             q='<p>Eksik günleri 0 ile doldurup tam takvimli günlük satış listesini yazdıran programın satırlarını sırala.</p>',
             lines=['import pandas as pd', 's = pd.Series([5, 7], index=pd.to_datetime(["2024-05-01", "2024-05-03"]))', 'gunler = pd.date_range(s.index.min(), "2024-05-04", freq="D")', 'dolu = s.reindex(gunler, fill_value=0)', 'print(dolu.tolist())'],
             expect='[5, 0, 7, 0]\n',
             hint='Takvim, serinin ilk tarihinden başladığı için seriden sonra kurulur.',
             why='date_range tam takvimi üretir; reindex seriyi bu takvime hizalar ve kaydı olmayan günlere fill_value yazar.'),
        dict(t='code', id='pandas-zaman-serisi-8', stage='Rehberli', diff=1,
             q='<p><code>tarihleri_hazirla(df)</code> fonksiyonunu yaz. <code>df</code>\'te <code>"05.03.2024"</code> biçiminde metin <code>tarih</code> ve sayısal <code>tutar</code> sütunları var; bazı tarihler bozuk. Fonksiyon:</p><ul><li><code>tarih</code>\'i <code>format="%d.%m.%Y"</code> ve <code>errors="coerce"</code> ile çevirsin, tarihi bozuk satırları atsın,</li><li><code>yil</code>, <code>ay</code>, <code>gun</code> (haftanın günü, Pazartesi=0) sütunlarını eklesin,</li><li>tarihe göre sıralayıp index\'i sıfırlanmış yeni DataFrame döndürsün.</li></ul>',
             guide=['df.copy() ile başla; pd.to_datetime(..., format="%d.%m.%Y", errors="coerce") ile tarih sütununu çevir.', 'dropna(subset=["tarih"]) ile NaT satırlarını at.', '.dt.year, .dt.month, .dt.dayofweek ile üç sütunu ekle.', 'sort_values("tarih").reset_index(drop=True) ile döndür.'],
             example='import pandas as pd\nd = pd.DataFrame({"gun": ["2024/01/15", "hatalı", "2024/02/01"]})\nd["gun"] = pd.to_datetime(d["gun"], format="%Y/%m/%d", errors="coerce")\nd = d.dropna(subset=["gun"])\nd["ceyrek"] = d["gun"].dt.quarter\nprint(d)\n',
             start='import pandas as pd\n\ndef tarihleri_hazirla(df):\n    y = df.copy()\n    # TODO 1: y["tarih"] = pd.to_datetime(..., format="%d.%m.%Y", errors="coerce")\n    # TODO 2: tarihi NaT olan satırları at\n    # TODO 3: yil, ay, gun sütunlarını .dt ile ekle\n    # TODO 4: tarihe göre sırala, index\'i sıfırla\n    return y\n',
             sol='import pandas as pd\n\ndef tarihleri_hazirla(df):\n    y = df.copy()\n    y["tarih"] = pd.to_datetime(y["tarih"], format="%d.%m.%Y", errors="coerce")\n    y = y.dropna(subset=["tarih"])\n    y["yil"] = y["tarih"].dt.year\n    y["ay"] = y["tarih"].dt.month\n    y["gun"] = y["tarih"].dt.dayofweek\n    return y.sort_values("tarih").reset_index(drop=True)\n',
             tests='import pandas as pd\nd = pd.DataFrame({"tarih": ["17.03.2024", "05.03.2024", "31.02.2024", "2024-03-09", "01.01.2025"], "tutar": [10, 20, 30, 40, 50]})\nr = tarihleri_hazirla(d)\nassert len(r) == 3, "31.02.2024 (olmayan gün) ve 2024-03-09 (yanlış biçim) atılmalı; 3 satır kalmalı"\nassert pd.api.types.is_datetime64_any_dtype(r["tarih"]), "tarih datetime türünde olmalı"\nassert r["tutar"].tolist() == [20, 10, 50], "Tarihe göre sıralı olmalı: 5 Mart, 17 Mart, 1 Ocak 2025"\nassert r["yil"].tolist() == [2024, 2024, 2025] and r["ay"].tolist() == [3, 3, 1], "yil/ay yanlış"\nassert r["gun"].tolist() == [1, 6, 2], "gun = dayofweek: 5 Mart 2024 Salı (1), 17 Mart Pazar (6), 1 Ocak 2025 Çarşamba (2)"\nassert r.index.tolist() == [0, 1, 2], "index sıfırlanmalı"\n',
             hints=['Dönüşüm için pd.to_datetime, bozuklar için errors="coerce".', 'Parçalar: y["tarih"].dt.year / .dt.month / .dt.dayofweek', 'Son satır: return y.sort_values("tarih").reset_index(drop=True)'],
             why='Biçimi açıkça vermek gün/ay karışıklığını önler; coerce bozuk değerleri NaT yapar, sen de onları bilinçli olarak atarsın. dt erişimcisi tarih parçalarını vektörel çıkarır.'),
        dict(t='code', id='pandas-zaman-serisi-9', stage='Rehberli', diff=1,
             q='<p><code>haftalik_ciro(df)</code> fonksiyonu <code>tarih</code> (datetime) ve <code>tutar</code> sütunlu sipariş tablosundan <b>haftalık</b> (Pazartesi–Pazar, etiket Pazar) toplam ciroyu bir <code>pd.Series</code> olarak döndürsün. Orijinal tabloyu değiştirme.</p>',
             guide=['resample bir DatetimeIndex ister: set_index("tarih") kullan (ya da resample(..., on="tarih")).', '"tutar" sütununu seç.', 'resample("W").sum() ile haftalık topla ve döndür.'],
             example='import pandas as pd\nd = pd.DataFrame({"zaman": pd.to_datetime(["2024-01-01 08:00", "2024-01-01 09:30", "2024-01-02 10:00"]), "adet": [1, 2, 5]})\ngunluk = d.set_index("zaman")["adet"].resample("D").sum()\nprint(gunluk)\n',
             start='import pandas as pd\n\ndef haftalik_ciro(df):\n    # TODO 1: tarih\'i index yap\n    # TODO 2: tutar sütununu haftalık ("W") topla\n    return df["tutar"]\n',
             sol='import pandas as pd\n\ndef haftalik_ciro(df):\n    return df.set_index("tarih")["tutar"].resample("W").sum()\n',
             tests='import pandas as pd\nd = pd.DataFrame({"tarih": pd.to_datetime(["2024-03-04", "2024-03-06", "2024-03-10", "2024-03-11", "2024-03-24"]), "tutar": [100.0, 50.0, 25.0, 300.0, 10.0]})\nr = haftalik_ciro(d)\nassert isinstance(r, pd.Series), "Series dönmeli"\nassert [str(x.date()) for x in r.index] == ["2024-03-10", "2024-03-17", "2024-03-24"], "Etiketler hafta sonu Pazar günleri olmalı (boş hafta da dahil)"\nassert r.tolist() == [175.0, 300.0, 10.0], "Haftalık toplamlar [175.0, 300.0, 10.0]: 10 Mart Pazar ilk haftaya dahil"\nassert "tarih" in d.columns, "Orijinal df değişmemeli"\n',
             hints=['resample DatetimeIndex ister.', 'df.set_index("tarih")["tutar"].resample("W").sum()'],
             why='"W" haftayı Pazar\'a çapalar ve etiketi Pazar yapar; Pazar günkü sipariş o haftaya girer. Boş haftalar da 0 ile görünür, böylece grafikte eksik hafta gizlenmez.'),
        dict(t='code', id='pandas-zaman-serisi-10', stage='Rehberli', diff=2,
             q='<p><code>eksik_gunleri_doldur(s)</code> fonksiyonu tarih index\'li bir günlük satış adedi serisi alsın (index sırasız olabilir, bazı günler eksik). İlk ve son tarih arasındaki <b>her günü</b> içeren, eksik günleri 0 olan, tarihe göre sıralı bir seri döndürsün.</p>',
             guide=['Önce sort_index() ile sırala.', 'pd.date_range(ilk, son, freq="D") ile tam takvimi kur.', 'reindex(takvim, fill_value=0) ile hizala ve döndür.'],
             example='import pandas as pd\nkur = pd.Series([32.1, 32.4], index=pd.to_datetime(["2024-05-01", "2024-05-03"]))\ntakvim = pd.date_range("2024-05-01", "2024-05-04", freq="D")\nprint(kur.reindex(takvim).ffill())   # kur bir durum ölçüsü: son değerle doldur\n',
             start='import pandas as pd\n\ndef eksik_gunleri_doldur(s):\n    s = s.sort_index()\n    # TODO 1: takvim = pd.date_range(..., ..., freq="D")\n    # TODO 2: return s.reindex(takvim, fill_value=0)\n    return s\n',
             sol='import pandas as pd\n\ndef eksik_gunleri_doldur(s):\n    s = s.sort_index()\n    takvim = pd.date_range(s.index.min(), s.index.max(), freq="D")\n    return s.reindex(takvim, fill_value=0)\n',
             tests='import pandas as pd\ns = pd.Series([7, 5, 3], index=pd.to_datetime(["2024-05-03", "2024-05-01", "2024-05-06"]))\nr = eksik_gunleri_doldur(s)\nassert len(r) == 6, "1-6 Mayıs arası 6 gün olmalı"\nassert r.tolist() == [5, 0, 7, 0, 0, 3], "Eksik günler 0: [5, 0, 7, 0, 0, 3]"\nassert r.index.is_monotonic_increasing, "Tarihe göre sıralı olmalı"\n',
             hints=['Tam takvim: pd.date_range(s.index.min(), s.index.max(), freq="D")', 'Satış bir akış ölçüsüdür; eksik gün 0 olur: reindex(takvim, fill_value=0)'],
             why='reindex seriyi verilen takvime hizalar; takvimde olup seride olmayan günler fill_value alır. Satış gibi akış ölçülerinde 0 doğrudur; stok gibi durum ölçülerinde ffill kullanılır.'),
        dict(t='code', id='pandas-zaman-serisi-11', stage='Kendin yaz', diff=2,
             q='<p><code>buyume(aylik)</code> fonksiyonu aylık ciro serisini (index: ay başları) alsın ve şu sütunlu bir DataFrame döndürsün: <code>ciro</code> (serinin kendisi), <code>onceki</code> (bir önceki ay), <code>degisim</code> (fark), <code>yuzde</code> (yüzde değişim, 1 basamak). İlk satırda önceki ay yoktur (NaN kalsın).</p>',
             start='import pandas as pd\n\ndef buyume(aylik):\n    pass\n',
             sol='import pandas as pd\n\ndef buyume(aylik):\n    return pd.DataFrame({\n        "ciro": aylik,\n        "onceki": aylik.shift(1),\n        "degisim": aylik.diff(),\n        "yuzde": (aylik.pct_change() * 100).round(1),\n    })\n',
             tests='import pandas as pd\ns = pd.Series([200.0, 250.0, 225.0, 300.0], index=pd.date_range("2024-01-01", periods=4, freq="MS"))\nr = buyume(s)\nassert list(r.columns) == ["ciro", "onceki", "degisim", "yuzde"], "Sütun sırası: ciro, onceki, degisim, yuzde"\nassert r["onceki"].iloc[1:].tolist() == [200.0, 250.0, 225.0], "onceki = shift(1)"\nassert r["degisim"].iloc[1:].tolist() == [50.0, -25.0, 75.0], "degisim = diff()"\nassert r["yuzde"].iloc[1:].tolist() == [25.0, -10.0, 33.3], "yuzde = pct_change()*100, 1 basamak"\nassert r["yuzde"].isna().iloc[0], "İlk ayın yüzdesi NaN olmalı"\n',
             hints=['shift(1), diff(), pct_change() üçü de aynı uzunlukta seri döndürür.', 'pd.DataFrame({"ciro": aylik, "onceki": aylik.shift(1), ...}) index\'leri hizalar.'],
             why='Üç fonksiyon da önceki satırla kıyas yapar; aynı index\'i paylaştıkları için tek DataFrame\'de yan yana durabilirler. İlk dönemin karşılaştırması olmadığı için NaN doğru cevaptır, 0 değil.'),
        dict(t='code', id='pandas-zaman-serisi-12', stage='Kendin yaz', diff=2,
             q='<p><code>yoy(aylik)</code> fonksiyonu aylık ciro serisinden (index: ay başları, en az 13 ay) <b>yıldan yıla</b> yüzde büyümeyi hesaplasın: her ay, 12 ay önceki aynı aya göre <code>(bu / geçen yıl - 1) * 100</code>, 1 basamak. Karşılaştırması olmayan ilk 12 ayı at ve seriyi döndür.</p>',
             start='import pandas as pd\n\ndef yoy(aylik):\n    pass\n',
             sol='import pandas as pd\n\ndef yoy(aylik):\n    return ((aylik / aylik.shift(12) - 1) * 100).round(1).dropna()\n',
             tests='import pandas as pd\nilk = [100, 95, 110, 120, 118, 130, 125, 128, 135, 140, 160, 210]\nikinci = [110, 114, 99]\ns = pd.Series(ilk + ikinci, index=pd.date_range("2023-01-01", periods=15, freq="MS"), dtype=float)\nr = yoy(s)\nassert len(r) == 3, "İlk 12 ayın karşılaştırması yok; 3 değer kalmalı"\nassert str(r.index[0].date()) == "2024-01-01", "İlk YoY değeri Ocak 2024 olmalı"\nassert r.tolist() == [10.0, 20.0, -10.0], "YoY: Ocak +10, Şubat +20, Mart -10 olmalı (12 ay öncesiyle kıyas)"\n',
             hints=['Geçen yılın aynı ayı = shift(12).', '((aylik / aylik.shift(12) - 1) * 100).round(1).dropna()'],
             why='Aylık seride shift(12) bir yıl önceki aynı ayı getirir; mevsimselliği ortadan kaldırdığı için perakende ve bankacılıkta temel büyüme ölçüsüdür. pct_change(12) * 100 de aynı sonucu verir.'),
        dict(t='code', id='pandas-zaman-serisi-13', stage='Kendin yaz', diff=2,
             q='<p><code>yerel_saat(df)</code> fonksiyonu <code>zaman_utc</code> sütununda saat dilimi olmayan UTC zamanları (datetime) bulunan Anadolu Bank işlem tablosuna iki sütun eklesin: <code>yerel</code> (Europe/Istanbul saat dilimli zaman) ve <code>saat</code> (İstanbul saatiyle saat, tam sayı). Yeni DataFrame döndür.</p>',
             start='import pandas as pd\n\ndef yerel_saat(df):\n    pass\n',
             sol='import pandas as pd\n\ndef yerel_saat(df):\n    y = df.copy()\n    y["yerel"] = y["zaman_utc"].dt.tz_localize("UTC").dt.tz_convert("Europe/Istanbul")\n    y["saat"] = y["yerel"].dt.hour\n    return y\n',
             tests='import pandas as pd\nd = pd.DataFrame({"zaman_utc": pd.to_datetime(["2024-03-01 21:30", "2024-03-02 06:10", "2024-07-15 22:59"]), "tutar": [100, 200, 300]})\nr = yerel_saat(d)\nassert str(r["yerel"].dt.tz) == "Europe/Istanbul", "yerel sütunu Europe/Istanbul dilimli olmalı"\nassert r["saat"].tolist() == [0, 9, 1], "UTC+3: 21:30 → 00:30, 06:10 → 09:10, 22:59 → 01:59"\nassert str(r["yerel"].iloc[0].date()) == "2024-03-02", "21:30 UTC İstanbul\'da ertesi gündür"\nassert "yerel" not in d.columns, "Orijinal df değişmemeli"\n',
             hints=['Önce dilim bilgisini ekle (tz_localize("UTC")), sonra çevir (tz_convert("Europe/Istanbul")).', 'Sütunda .dt.tz_localize ve .dt.tz_convert; saat için .dt.hour.'],
             why='tz_localize zamanı değiştirmez, yalnızca "bu UTC\'dir" etiketini ekler; tz_convert aynı anı başka bir dilimde gösterir. Gece yarısına yakın işlemler İstanbul\'da ertesi güne geçer; gün sonu raporları bu yüzden çeviriden sonra gruplanmalıdır.'),
        dict(t='code', id='pandas-zaman-serisi-14', stage='Kendin yaz', diff=2,
             q='<p><code>is_gunu_say(baslangic, bitis, tatiller=())</code> fonksiyonu iki tarih (metin, <code>"YYYY-MM-DD"</code>) arasındaki iş günü sayısını <b>iki uç dahil</b> döndürsün. İş günü: Pazartesi–Cuma ve <code>tatiller</code> listesinde olmayan gün. Sonuç Python <code>int</code> olsun.</p>',
             start='import pandas as pd\n\ndef is_gunu_say(baslangic, bitis, tatiller=()):\n    pass\n',
             sol='import pandas as pd\n\ndef is_gunu_say(baslangic, bitis, tatiller=()):\n    gunler = pd.bdate_range(baslangic, bitis)\n    tatil = pd.to_datetime(list(tatiller))\n    return int((~gunler.isin(tatil)).sum())\n',
             tests='r = is_gunu_say("2024-04-01", "2024-04-30")\nassert r == 22 and type(r) is int, "Nisan 2024\'te 22 iş günü var (int dönmeli)"\nassert is_gunu_say("2024-04-01", "2024-04-30", ["2024-04-23"]) == 21, "23 Nisan Salı; düşülmeli → 21"\nassert is_gunu_say("2024-04-01", "2024-04-30", ["2024-04-27"]) == 22, "27 Nisan Cumartesi; zaten iş günü değil, sayı değişmemeli"\nassert is_gunu_say("2024-04-19", "2024-04-22") == 2, "Cuma ve Pazartesi (iki uç dahil) → 2"\nassert is_gunu_say("2024-04-20", "2024-04-21") == 0, "Hafta sonu → 0"\n',
             hints=['pd.bdate_range(baslangic, bitis) iki ucu dahil Pazartesi–Cuma günlerini verir.', 'Tatilleri pd.to_datetime ile çevirip isin ile dışla; sonucu int() ile çevir.'],
             why='bdate_range hafta sonlarını kendiliğinden atar; tatili yalnızca iş gününe denk geliyorsa düşmek gerekir, isin bunu doğal olarak yapar. np.busday_count da kullanılabilir ama bitişi hariç tuttuğu için bir gün eklemen gerekir.'),
        dict(t='code', id='pandas-zaman-serisi-15', stage='Hata avı', kind='bug', diff=2,
             q='<p><b>Hatayı bul ve düzelt.</b> <code>aylik_toplam(df)</code> CSV\'den okunmuş, <code>tarih</code> sütunu <code>"2024-01-05"</code> biçiminde <b>metin</b> olan tablodan aylık (etiket: ay başı) tutar toplamını döndürmeli. Kod <code>TypeError</code> veriyor.</p>',
             start='import pandas as pd\n\ndef aylik_toplam(df):\n    y = df.set_index("tarih")\n    return y["tutar"].resample("MS").sum()\n',
             sol='import pandas as pd\n\ndef aylik_toplam(df):\n    y = df.assign(tarih=pd.to_datetime(df["tarih"], format="%Y-%m-%d")).set_index("tarih")\n    return y["tutar"].resample("MS").sum()\n',
             tests='import pandas as pd\nd = pd.DataFrame({"tarih": ["2024-01-05", "2024-01-20", "2024-03-02"], "tutar": [100.0, 200.0, 50.0]})\nr = aylik_toplam(d)\nassert r.tolist() == [300.0, 0.0, 50.0], "Ocak 300, Şubat 0, Mart 50"\nassert str(r.index[0].date()) == "2024-01-01", "Etiket ay başı olmalı"\nassert d["tarih"].dtype != "datetime64[ns]", "Orijinal df\'i değiştirme"\n',
             hints=['Hata mesajı DatetimeIndex istiyor; index hâlâ metin.', 'set_index\'ten önce tarih sütununu pd.to_datetime ile çevir (assign ile kopyada).'],
             why='resample yalnızca zaman tabanlı index\'te çalışır. Metin index\'i tarih gibi görünse de pandas için sıradan metindir; önce to_datetime ile çevirmek gerekir.'),
        dict(t='code', id='pandas-zaman-serisi-16', stage='Hata avı', kind='bug', diff=2,
             q='<p><b>Hatayı bul ve düzelt.</b> <code>son7gun_ort(s)</code> günlük satış serisinde her gün için <b>son 7 takvim gününün</b> (o gün dahil) ortalamasını 2 basamakla döndürmeli. Mağaza bazı günler kapalı olduğu için seride eksik günler var. Kod çalışıyor ama değerler yanlış.</p>',
             start='import pandas as pd\n\ndef son7gun_ort(s):\n    return s.sort_index().rolling(7, min_periods=1).mean().round(2)\n',
             sol='import pandas as pd\n\ndef son7gun_ort(s):\n    return s.sort_index().rolling("7D").mean().round(2)\n',
             tests='import pandas as pd\ng = pd.to_datetime(["2024-05-01", "2024-05-02", "2024-05-03", "2024-05-06", "2024-05-07", "2024-05-08", "2024-05-09", "2024-05-10", "2024-05-13"])\ns = pd.Series([10, 20, 30, 40, 50, 60, 70, 80, 90], index=g, dtype=float)\nr = son7gun_ort(s)\nassert r.loc["2024-05-07"] == 30.0, "7 Mayıs: 1-7 Mayıs arasındaki 5 kayıt (10..50) → 30.0"\nassert r.loc["2024-05-09"] == 50.0, "9 Mayıs: 3-9 Mayıs → 30, 40, 50, 60, 70 → 50.0"\nassert r.loc["2024-05-13"] == 70.0, "13 Mayıs: 7-13 Mayıs → 50, 60, 70, 80, 90 → 70.0"\n',
             hints=['rolling(7) son 7 SATIRI alır; eksik günler varsa pencere 7 günden uzun olur.', 'Zaman tabanlı pencere: rolling("7D").'],
             why='rolling(7) satır sayar; kapalı günler yüzünden pencere 10 güne yayılabilir. rolling("7D") DatetimeIndex üzerinde gerçek takvim penceresi kullanır.'),
        dict(t='code', id='pandas-zaman-serisi-17', stage='Meydan okuma', diff=3,
             q='<p><code>gun_endeksi(s)</code> fonksiyonu Anadolu Market\'in <b>işlem bazlı</b> satış serisini alsın: index zaman damgası (aynı gün birden çok kayıt olabilir, sırasız olabilir), değer tutar. Fonksiyon:</p><ol><li>Seriyi günlük toplama indirsin; kaydı olmayan günler 0 sayılsın (ilk ve son gün arası tam takvim).</li><li>Günlük seride en az 14 gün yoksa <code>ValueError</code> fırlatsın.</li><li>Haftanın her günü (0=Pazartesi … 6=Pazar) için <code>o günlerin ortalaması / tüm günlerin ortalaması</code> oranını 2 basamakla hesaplayıp <code>{0: ..., ..., 6: ...}</code> sözlüğü döndürsün (anahtarlar Python int).</li></ol>',
             start='import pandas as pd\n\ndef gun_endeksi(s):\n    pass\n',
             sol='import pandas as pd\n\ndef gun_endeksi(s):\n    gunluk = s.sort_index().resample("D").sum()\n    if len(gunluk) < 14:\n        raise ValueError("En az iki haftalık veri gerekir")\n    oran = gunluk.groupby(gunluk.index.dayofweek).mean() / gunluk.mean()\n    return {int(k): round(float(v), 2) for k, v in oran.items()}\n',
             tests='import pandas as pd\ndesen = [90, 80, 85, 95, 110, 140, 130]\ngun = pd.date_range("2024-01-01", periods=14, freq="D")\nzaman = []\ntutar = []\nfor i, g in enumerate(gun):\n    if i == 9:\n        continue  # 10 Ocak Çarşamba: kayıt yok → 0 sayılmalı\n    zaman += [g + pd.Timedelta(hours=10), g + pd.Timedelta(hours=18)]\n    tutar += [desen[i % 7] / 2, desen[i % 7] / 2]\ns = pd.Series(tutar, index=pd.DatetimeIndex(zaman))[::-1]\nr = gun_endeksi(s)\nassert set(r) == set(range(7)), "Anahtarlar 0..6 olmalı"\nassert all(type(k) is int for k in r), "Anahtarlar Python int olmalı"\nort = (sum(desen) * 2 - 85) / 14\nassert r[5] == round(140 / ort, 2), "Cumartesi endeksi yanlış: önce günlük topla, sonra gün ortalaması / genel ortalama"\nassert r[2] == round(85 / 2 / ort, 2), "Çarşamba: bir hafta 85, bir hafta 0 (kayıt yok) → ortalama 42.5; eksik günü 0 saymalısın"\ntry:\n    gun_endeksi(s[s.index < "2024-01-08"])\n    assert False, "14 günden az veride ValueError bekleniyordu"\nexcept ValueError:\n    pass\n',
             hints=['İşlemleri günlüğe indirmek için sort_index().resample("D").sum(); kaydı olmayan gün 0 olur.', 'Haftanın günü: gunluk.index.dayofweek ile groupby, sonra mean() / gunluk.mean().', 'Sözlüğü {int(k): round(float(v), 2) ...} ile kur; uzunluk kontrolünü hesaplamadan önce yap.'],
             why='Günlük indirgeme yapılmazsa aynı gündeki iki işlem ayrı gözlem sayılır; eksik gün 0 sayılmazsa o günün ortalaması şişer. resample("D") iki sorunu birden çözer.'),
        dict(t='code', id='pandas-zaman-serisi-18', stage='Mini proje', diff=3,
             q='<p>Anadolu Bank günlük işlem raporu. <code>gunluk_rapor(islem)</code> fonksiyonu <code>zaman</code> (datetime, İstanbul saati, dilimsiz) ve <code>tutar</code> sütunlu işlem tablosundan, index\'i ilk günden son güne <b>her günü</b> içeren bir DataFrame döndürsün. Sütunlar:</p><ul><li><code>adet</code>: o günkü işlem sayısı (işlem yoksa 0),</li><li><code>toplam</code>: o günkü tutar toplamı (yoksa 0),</li><li><code>ort7</code>: <code>toplam</code>\'ın son 7 takvim günü ortalaması, 2 basamak,</li><li><code>hafta_sonu</code>: Cumartesi/Pazar ise True.</li></ul>',
             start='import pandas as pd\n\ndef gunluk_rapor(islem):\n    pass\n',
             sol='import pandas as pd\n\ndef gunluk_rapor(islem):\n    g = islem.set_index("zaman").sort_index()["tutar"].resample("D")\n    r = pd.DataFrame({"adet": g.count(), "toplam": g.sum()})\n    r["ort7"] = r["toplam"].rolling("7D").mean().round(2)\n    r["hafta_sonu"] = r.index.dayofweek >= 5\n    return r\n',
             tests='import pandas as pd\nd = pd.DataFrame({\n    "zaman": pd.to_datetime(["2024-03-01 09:00", "2024-03-01 15:30", "2024-03-03 11:00", "2024-03-04 10:00", "2024-03-08 17:45", "2024-03-02 12:00"]),\n    "tutar": [100.0, 300.0, 50.0, 700.0, 140.0, 0.0],\n})\nr = gunluk_rapor(d)\nassert list(r.columns) == ["adet", "toplam", "ort7", "hafta_sonu"], "Sütunlar: adet, toplam, ort7, hafta_sonu"\nassert len(r) == 8, "1-8 Mart: 8 gün"\nassert r["adet"].tolist() == [2, 1, 1, 1, 0, 0, 0, 1], "adet: işlem yoksa 0; 2 Mart\'taki 0 TL\'lik işlem de sayılır"\nassert r["toplam"].tolist() == [400.0, 0.0, 50.0, 700.0, 0.0, 0.0, 0.0, 140.0], "günlük toplamlar yanlış"\nassert r["ort7"].tolist()[:2] == [400.0, 200.0], "ort7 ilk günler: 400, (400+0)/2"\nassert r["ort7"].iloc[-1] == 127.14, "8 Mart: 2-8 Mart (0+50+700+0+0+0+140)/7 = 127.14"\nassert r["hafta_sonu"].tolist() == [False, True, True, False, False, False, False, False], "2 ve 3 Mart 2024 hafta sonu"\n',
             hints=['set_index("zaman")["tutar"].resample("D") nesnesinden hem count() hem sum() alabilirsin.', 'resample boş günleri kendiliğinden üretir: count 0, sum 0 verir.', 'ort7 için rolling("7D").mean().round(2); hafta sonu için index.dayofweek >= 5.'],
             why='Tek bir resample nesnesi birden çok özet üretir ve takvimi otomatik tamamlar. Zaman tabanlı pencere, boş günleri 0 olarak hesaba katan doğru 7 günlük ortalamayı verir.'),
    ],
    faq=[
        dict(q='resample ile groupby(dt.to_period("M")) arasında hangisini seçmeliyim?', a='İkisi de aylık toplar. resample boş ayları da üretir ve zaman index\'i döndürür; grafik ve shift/rolling için idealdir. to_period ile groupby yalnızca veride olan ayları verir ve "2024-03" gibi okunur anahtarlar üretir; rapor tablosu için pratiktir.'),
        dict(q='Tarih sütununu her seferinde index mi yapmalıyım?', a='Hayır. Zaman dilimleme, resample ve rolling("7D") için DatetimeIndex rahattır; ama resample(..., on="tarih") ve rolling(..., on="tarih") ile sütunda da çalışabilirsin. Birleştirme (merge) yapacaksan tarihi sütun olarak tutmak daha kolaydır.'),
        dict(q='Saat dilimini veritabanına nasıl kaydetmeliyim?', a='Genel kural: UTC olarak sakla, gösterirken yerel saate çevir. Böylece yaz saati uygulayan ülkelerde bile tek bir zaman çizgisi olur. Rapor tarafında tz_convert ile istediğin dilime geçersin.'),
        dict(q='Aylık seride shift(12) yerine DateOffset kullanabilir miyim?', a='Evet: s.shift(freq=pd.DateOffset(years=1)) index\'i bir yıl kaydırır; ardından s / kaydirilmis ile index üzerinden hizalanır. Ay eksik olsa bile doğru ay eşleşir; shift(12) ise satır saydığı için eksik ayda kayar.'),
    ],
    mistakes=[
        dict(bad='df["tarih"] = pd.to_datetime(df["tarih"])  # "03.05.2024" gibi değerler', good='df["tarih"] = pd.to_datetime(df["tarih"], format="%d.%m.%Y", errors="coerce")', why='Biçim verilmezse gün ve ay yer değiştirebilir; format belirsizliği kaldırır, coerce bozuk değeri NaT yapar.'),
        dict(bad='aylik = df.set_index("tarih")["tutar"].resample("M").sum()', good='aylik = df.set_index("tarih")["tutar"].resample("MS").sum()', why='"M" pandas 2.2\'de uyarı verir, pandas 3\'te hata; "MS" ya da "ME" iki sürümde de çalışır.'),
        dict(bad='s.rolling(7).mean()  # bazı günler eksik', good='s.rolling("7D").mean()', why='Satır tabanlı pencere eksik günlerde 7 günden uzun süreye yayılır; zaman tabanlı pencere takvime bakar.'),
        dict(bad='df["yerel"] = df["zaman_utc"] + pd.Timedelta(hours=3)', good='df["yerel"] = df["zaman_utc"].dt.tz_localize("UTC").dt.tz_convert("Europe/Istanbul")', why='Elle saat eklemek yaz saati uygulayan dilimlerde ve geçmiş tarihlerde yanlış sonuç verir; zaman da dilimsiz kalır.'),
        dict(bad='gunluk = df.groupby(df["tarih"].dt.date)["tutar"].sum()  # boş günler kayboldu', good='gunluk = df.set_index("tarih")["tutar"].resample("D").sum()', why='groupby yalnızca veride olan günleri verir; ortalama ve hareketli ortalama satış olmayan günleri atladığı için şişer.'),
    ],
)
