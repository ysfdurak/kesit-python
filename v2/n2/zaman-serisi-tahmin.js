/* PythonPatika — ileri: zaman-serisi-tahmin */
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push({
  id: 'zaman-serisi-tahmin',
  lv: 'ileri',
  mod: 'Makine Öğrenmesi',
  min: 60,
  needs: ['pandas', 'numpy', 'scikit-learn', 'statsmodels'],
  title: 'Zaman serisi tahmini: temel çizgiden ETS, ARIMA ve ML\'ye',
  sum: 'Ufuk, sıklık ve toplama seviyesi; naive ve mevsimsel naive temel çizgileri; STL ayrıştırma ve ADF; Holt-Winters (ETS) ve dışsal değişkenli SARIMAX; lag özellikli ML, özyinelemeli ve doğrudan çok adımlı tahmin; genişleyen pencere backtest; MAE, RMSE, sMAPE, MASE ve tahmin aralığı. Pedal İzmir saatlik talep + hava verisiyle.',
  goals: [
    'Bir tahmin problemini ufuk, sıklık, toplama seviyesi ve bilgi anıyla tanımlayabilirim',
    'Naive ve mevsimsel naive temel çizgilerini kurup MAE, RMSE, sMAPE ve MASE ile değerlendirebilirim',
    'STL ile mevsimselliği ölçüp ETS ve dışsal değişkenli SARIMAX modelleri kurabilirim',
    'Sızıntısız lag özellikleriyle ML tahmini yapıp özyinelemeli ve doğrudan stratejileri ayırt edebilirim',
    'Genişleyen pencere backtest\'i ve backtest hatalarından tahmin aralığı kurabilirim'
  ],
  body: `<h2>Yarın kaç bisiklet gerekecek?</h2>
<p>Pedal İzmir operasyon ekibi her gece kamyonlarla bisikletleri istasyonlar arasında taşıyor. Sabah 8'de Alsancak'ta bisiklet kalmazsa müşteri kaybediliyor, Bostanlı'da yığılırsa boş yuva kalmıyor. Bunun için <b>yarının saatlik talebini</b> bilmeleri gerekiyor. Bu bir <b>zaman serisi tahmini</b> (time series forecasting) problemidir: geçmiş gözlemlerin sırasından ve düzeninden geleceği çıkarmak.</p>
<p>Zaman serisinin pandas tarafını (resample, shift, rolling) <code>pandas-zaman-serisi</code> dersinde gördün. Bu derste tahmin yapacaksın: önce yenmesi gereken <b>temel çizgiler</b>, sonra bileşen ayrıştırma, üstel düzeltme (ETS), ARIMA/SARIMAX, lag özellikli makine öğrenmesi ve hepsini dürüstçe karşılaştıran <b>geriye dönük test</b> (backtest). Veri: Pedal İzmir'in Haziran–Ağustos 2024 yolculukları (116 517 yolculuk) ve saatlik hava gözlemleri.</p>

<h2>Tahmin problemini tanımla: ufuk, sıklık, toplama seviyesi</h2>
<div class="tbl-wrap"><table>
<tr><th>Karar</th><th>Soru</th><th>Pedal İzmir örneği</th></tr>
<tr><td>Ufuk (horizon)</td><td>Ne kadar ileriyi tahmin ediyorsun?</td><td>Yarının 24 saati (ufuk 1–24 saat ya da gün öncesi)</td></tr>
<tr><td>Sıklık</td><td>Hangi zaman adımında?</td><td>Saatlik (operasyon), günlük (bütçe)</td></tr>
<tr><td>Toplama seviyesi</td><td>Hangi birimde?</td><td>Şehir toplamı mı, istasyon başına mı?</td></tr>
<tr><td>Bilgi anı</td><td>Tahmin anında ne biliniyor?</td><td>Dünün talebi ve yarının hava tahmini; bugünün öğleden sonrası değil</td></tr>
</table></div>
<p>Toplama seviyesi yükseldikçe seri düzgünleşir ve tahmin kolaylaşır: tek bir istasyonun saatlik talebi gürültülüdür, şehrin toplamı değildir. "Bilgi anı" ise sızıntının kaynağıdır: yarını tahmin ederken lag 1 (bir saat önce) kullanamazsın; en kısa lag 24 saattir.</p>
<pre class="py">import numpy as np
import pandas as pd
import veri

yol = veri.oku("pedal_izmir", "bk_trips", usecols=["started_at"], parse_dates=["started_at"])
saatlik = yol.set_index("started_at").resample("h").size()
saatlik = saatlik.reindex(pd.date_range("2024-06-01", "2024-08-31 23:00", freq="h"),
                          fill_value=0).rename("talep")       # yolculuksuz saat = 0
gunluk = saatlik.resample("D").sum()
print(len(saatlik), "saat,", len(gunluk), "gün; toplam", saatlik.sum())
print("Saat profili:", saatlik.groupby(saatlik.index.hour).mean().round(0).astype(int).tolist())
print("Gün profili:", gunluk.groupby(gunluk.index.dayofweek).mean().round(0).astype(int).tolist())
</pre>
<p>İki mevsimsellik var: <b>günlük</b> (sabah 8 ve akşam 18 tepeleri, gece neredeyse sıfır) ve <b>haftalık</b> (hafta sonu daha düşük). Saatlik seride haftalık döngü 168 adımdır.</p>

<h2>Temel çizgiler: önce bunları yen</h2>
<p>Karmaşık bir model kurmadan önce basit tahmincilerin skorunu bil. Şaşırtıcı sıklıkla en iyileri bunlardır.</p>
<ul>
<li><b>Naive:</b> geleceğin her adımı son gözlenen değere eşit.</li>
<li><b>Mevsimsel naive</b> (seasonal naive): her adım, bir mevsim önceki değere eşit: saatlik seride geçen haftanın aynı saati (lag 168) ya da dünün aynı saati (lag 24).</li>
<li><b>Hareketli ortalama:</b> son k gözlemin ortalaması (düz bir çizgi).</li>
</ul>
<pre class="py">egitim, test = saatlik[:-168], saatlik[-168:]          # son hafta test
tahminler = {
    "naive": np.repeat(egitim.iloc[-1], 168),
    "mevsimsel_24": np.tile(egitim[-24:].to_numpy(), 7),
    "mevsimsel_168": egitim[-168:].to_numpy(),
    "ort_168": np.repeat(egitim[-168:].mean(), 168),
}
for ad, t in tahminler.items():
    print(f"{ad:14s} MAE = {np.mean(np.abs(test.to_numpy() - t)):.2f}")
</pre>
<p>Geçen haftanın aynı saati (MAE ≈ 7.7) dünün aynı saatinden (≈ 26) çok daha iyi; çünkü hafta sonu ile hafta içini ayırıyor. Bu, yenmen gereken çıtadır.</p>

<h2>Metrikler ve tuzakları</h2>
<div class="tbl-wrap"><table>
<tr><th>Metrik</th><th>Formül (özet)</th><th>Tuzak</th></tr>
<tr><td>MAE</td><td>ortalama |y − ŷ|</td><td>Ölçeğe bağlı; seriler arası kıyas yapılamaz</td></tr>
<tr><td>RMSE</td><td>√ortalama (y − ŷ)²</td><td>Büyük hataları ağır cezalandırır (yağmurlu saatler)</td></tr>
<tr><td>MAPE</td><td>ortalama |y − ŷ| / |y|</td><td><b>y = 0 olduğunda tanımsız</b>; gece saatleri sonsuz hata üretir; düşük tahmini kayırır</td></tr>
<tr><td>sMAPE</td><td>ortalama 2|y − ŷ| / (|y| + |ŷ|)</td><td>0–200 arası; ikisi de 0 ise 0 say</td></tr>
<tr><td>MASE</td><td>MAE / eğitimdeki mevsimsel naive MAE'si</td><td>1'in altı = mevsimsel naive'den iyi; ölçekten bağımsız</td></tr>
</table></div>
<div class="warn"><b>MAPE ve sıfırlar</b>Pedal İzmir serisinde 173 saat sıfır talep var. MAPE bu saatlerde sıfıra böler. Operasyon ekibine "yüzde hata" vermen gerekiyorsa toplam üzerinden WAPE (Σ|y − ŷ| / Σ|y|) kullan.</div>

<h2>Bileşen ayrıştırma ve durağanlık</h2>
<p><b>STL</b> (Seasonal-Trend decomposition using Loess) seriyi üç parçaya ayırır: trend, mevsimsel bileşen ve kalıntı. Kalıntının varyansı mevsimsel+kalıntıya göre küçükse mevsimsellik güçlüdür: <code>F = max(0, 1 − Var(kalıntı) / Var(mevsim + kalıntı))</code>. ARIMA ailesi ise <b>durağan</b> (stationary: ortalaması ve varyansı zamanla değişmeyen) seri ister. <b>ADF testi</b> (Augmented Dickey-Fuller) "seride birim kök var, durağan değil" boş hipotezini sınar; p &lt; 0.05 ise durağan kabul edilir. Durağan değilse fark alınır (ARIMA'daki d).</p>
<pre class="py">from statsmodels.tsa.seasonal import STL
from statsmodels.tsa.stattools import adfuller

stl = STL(saatlik, period=24).fit()
guc = max(0.0, 1 - np.var(stl.resid) / np.var(stl.seasonal + stl.resid))
print("Günlük mevsimsellik gücü:", round(guc, 3))
print("ADF p (günlük toplam):", f"{adfuller(gunluk)[1]:.2e}")
</pre>

<h2>Üstel düzeltme (ETS, Holt-Winters)</h2>
<p>Üstel düzeltme yakın geçmişe daha çok ağırlık verir. <b>Holt-Winters</b> bunu üç bileşene uygular: seviye, trend ve mevsim. statsmodels'ta <code>ExponentialSmoothing</code> sınıfıyla kurulur; <code>seasonal="add"</code> mevsimsel etkinin sabit büyüklükte, <code>"mul"</code> seviyeyle orantılı olduğunu varsayar.</p>
<pre class="py">import warnings
from statsmodels.tsa.holtwinters import ExponentialSmoothing
warnings.filterwarnings("ignore")

g_egt, g_test = gunluk[:-14], gunluk[-14:]
ets = ExponentialSmoothing(g_egt, seasonal="add", seasonal_periods=7).fit()
ets_t = ets.forecast(14)
mevs = np.tile(g_egt[-7:].to_numpy(), 2)
print("ETS MAE:", round(np.mean(np.abs(g_test - ets_t)), 1),
      " mevsimsel naive MAE:", round(np.mean(np.abs(g_test.to_numpy() - mevs)), 1))
</pre>

<h2>ARIMA ve SARIMAX: dışsal değişkenle tahmin</h2>
<p><b>ARIMA(p, d, q)</b> seriyi kendi geçmiş değerleri (AR, p), fark alma (I, d) ve geçmiş hataları (MA, q) ile modeller. <b>SARIMA</b> buna mevsimsel bir parça ekler: <code>seasonal_order=(P, D, Q, s)</code>. <b>SARIMAX</b>'teki X, dışsal (exogenous) değişkendir: yağış gibi talebi etkileyen ama talepten etkilenmeyen bir seri. Günlük talep ile günlük yağış arasındaki korelasyon −0.90; yağmurlu bir günü yalnız geçmişe bakan bir model göremez.</p>
<pre class="py">from statsmodels.tsa.statespace.sarimax import SARIMAX

hava = veri.oku("pedal_izmir", "bk_weather", parse_dates=["obs_hour"]).set_index("obs_hour")
yagis = hava["rain_mm"].resample("D").sum().rename("yagis").to_frame()
sx = SARIMAX(g_egt, exog=yagis[:-14], order=(1, 0, 0), seasonal_order=(1, 0, 0, 7),
             trend="c").fit(disp=False, maxiter=200)
ongoru = sx.get_forecast(14, exog=yagis[-14:])         # gelecek yağış = hava tahmini
print("yağış katsayısı:", round(sx.params["yagis"], 1))
print("SARIMAX MAE:", round(np.mean(np.abs(g_test - ongoru.predicted_mean)), 1))
print(ongoru.conf_int(alpha=0.2).round(0).head(3))    # %80 tahmin aralığı
</pre>
<div class="note"><b>Dışsal değişkenin bedeli</b>Test döneminde gerçek yağışı kullandık; canlıda elinde yalnız hava <b>tahmini</b> olacak ve o da hatalıdır. Dürüst bir backtest, o gün bilinen hava tahminiyle yapılır. Bilinmeyen dışsal değişken (ör. yarının gerçek sıcaklığı) sızıntıdır.</div>

<h2>Lag özellikli makine öğrenmesi</h2>
<p>Zaman serisini tablo problemine çevirebilirsin: her satır bir saat; özellikler saat, hafta sonu, lag 24, lag 168, hava; hedef o saatin talebi. Sonra Ridge, gradient boosting ya da herhangi bir regresyon modeli. Çok adımlı tahminde iki strateji var:</p>
<ul>
<li><b>Özyinelemeli</b> (recursive): tek adımlık modeli kullan, tahmini bir sonraki adımın lag'i olarak geri besle. Basit ama hata birikir.</li>
<li><b>Doğrudan</b> (direct): her ufuk h için ayrı bir model eğit (y(t+h) ~ t anındaki bilgi). Hata birikmez ama H model gerekir.</li>
</ul>
<p>Lag'leri ufuktan küçük seçmezsen (gün öncesi tahminde lag ≥ 24) iki strateji de gerekmez: tüm özellikler tahmin anında bilinir.</p>
<pre class="py">from sklearn.linear_model import Ridge
from sklearn.model_selection import TimeSeriesSplit

d = saatlik.to_frame().join(hava[["rain_mm", "temp_c"]])
d["lag24"], d["lag168"] = d["talep"].shift(24), d["talep"].shift(168)
d["hs"] = (d.index.dayofweek &gt;= 5).astype(int)
d = d.dropna()
X = pd.get_dummies(d.index.hour, prefix="s").astype(float).set_index(d.index)
X = X.join(d[["hs", "lag24", "lag168", "rain_mm", "temp_c"]])
for i, (egt, tst) in enumerate(TimeSeriesSplit(n_splits=3, test_size=168).split(X)):
    m = Ridge().fit(X.iloc[egt], d["talep"].iloc[egt])
    mae = np.mean(np.abs(m.predict(X.iloc[tst]) - d["talep"].iloc[tst]))
    print(f"kat {i}: eğitim {len(egt)} saat, test {X.index[tst[0]].date()} → MAE {mae:.2f}")
</pre>

<h2>Geriye dönük test: genişleyen pencere</h2>
<p>Zaman serisinde rastgele bölme, modelin geleceği görerek geçmişi tahmin etmesi demektir. Doğrusu <b>genişleyen pencere</b> (expanding window): 1 Ağustos'a kadar eğit, bir hafta tahmin et; 8 Ağustos'a kadar eğit, bir sonraki haftayı tahmin et... <code>TimeSeriesSplit</code> bunu otomatik yapar; <code>test_size</code> ufku, <code>gap</code> eğitim ile test arasındaki boşluğu (bilgi gecikmesi) ayarlar. Tek bir test haftası şanslı ya da şanssız olabilir; birkaç katın ortalaması ve dağılımı karar için gerekir.</p>
<div class="tip"><b>Tahmin aralığı</b>Operasyon ekibi tek sayı değil aralık ister: "yarın 8–9 arası Alsancak'ta 18 ile 30 arası kiralama". Model tabanlı aralıklar (SARIMAX <code>conf_int</code>) varsayımlara dayanır. Daha sağlam yol: backtest hatalarının yüzdelikleri. Geçmiş hataların %10 ve %90 yüzdeliklerini tahmine ekle, sonra yeni dönemde gerçeklerin yüzde kaçının aralığa düştüğünü (kapsama) ölç.</div>
<div class="note"><b>Gerçek işte</b>Bisiklet paylaşımı, yemek teslimatı ve perakende şirketlerinde talep tahmini genellikle iki katmanlıdır: şehir/gün düzeyinde istatistiksel model (ETS, SARIMAX) bütçe ve vardiya planı için; istasyon/saat düzeyinde lag ve hava özellikli gradient boosting operasyon için. Her sabah backtest panosu güncellenir ve model mevsimsel naive'i yenmediği hafta alarm üretir.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Hiyerarşik tahmin</h3>
<p>İstasyon tahminlerinin toplamı şehir tahminine eşit olmalı (tutarlılık, coherence). Alttan yukarı topla, üstten aşağı oranla dağıt ya da MinT uzlaştırma kullan (Nixtla <code>hierarchicalforecast</code>).</p>
<h3>Kütüphane manzarası</h3>
<p><b>statsmodels</b> klasik modeller; <b>sktime</b> ve <b>Darts</b> tek arayüzde istatistiksel + ML modelleri ve backtest; <b>Nixtla statsforecast</b> binlerce seriyi hızlı ETS/ARIMA ile; <b>Prophet</b> tatil ve çoklu mevsimsellikte pratik; <b>LightGBM + lag</b> M5 yarışmasının kazananı. Derin öğrenme (N-BEATS, TFT) çok sayıda ilişkili seride öne çıkar.</p>
<h3>Mülakat cümlesi</h3>
<p>"Önce mevsimsel naive temel çizgisini ve MASE'i raporlarım. Bölmeyi zamana göre, genişleyen pencereyle yaparım; özellikleri tahmin anında bilinenlerle sınırlarım. MAPE'yi sıfırlı serilerde kullanmam; aralıkları backtest hatalarından kurar ve kapsamasını ölçerim."</p>
</section>`,
  ex: [
    {
      t: 'mc',
      stage: 'Isınma',
      q: 'Saatlik talep modelini <code>KFold(5, shuffle=True)</code> ile çapraz doğruladın; skor harika, canlıda kötü. Neden?',
      o: [
        'Saatlik veri için 5 kat azdır; 20 kat gerekir',
        'Rastgele bölmede model komşu saatleri (gelecek dahil) eğitimde görür: sızıntı',
        'Ridge gibi doğrusal modeller zaman serisinde hiçbir koşulda kullanılamaz',
        'shuffle=True verildiğinde ölçekleme adımı sütun sırasını bozar ve skor şişer'
      ],
      a: 1,
      why: 'Karıştırılmış katlarda test saatinin bir saat öncesi ve sonrası eğitimdedir; model enterpolasyon yapar, gerçek tahmin değil. Zaman serisinde eğitim her zaman testten önce gelmeli: TimeSeriesSplit ya da genişleyen pencere.'
    },
    {
      t: 'mc',
      stage: 'Isınma',
      q: 'Pedal İzmir saatlik talebinde gece bazı saatlerde hiç yolculuk yok (y = 0). Hata metriği olarak MAPE seçmenin sorunu nedir?',
      o: [
        'MAPE büyük hataları karesini aldığı için RMSE\'den de fazla cezalandırır',
        'MAPE yalnız günlük ve daha seyrek (haftalık, aylık) veride hesaplanabilir',
        'y = 0 olan saatlerde sıfıra bölme olur; metrik sonsuz ya da tanımsız çıkar',
        'MAPE negatif değer alabilir ve bu yüzden modeller arasında karşılaştırılamaz'
      ],
      a: 2,
      why: 'MAPE her hatayı gerçek değere böler. Sıfır gerçek değerde bölme tanımsızdır, küçük değerlerde ise küçük mutlak hatalar dev yüzdelere dönüşür. Sıfırlı serilerde MAE, WAPE ya da MASE kullanılır.'
    },
    {
      t: 'mc',
      stage: 'Isınma',
      q: 'Bir modelin test MASE değeri (mevsimsel naive ölçekli) 0.8 çıktı. Bu ne anlama gelir?',
      o: [
        'Model test tahminlerinin %80\'inde gerçek değeri tam olarak tutturuyor',
        'Modelin MAE\'si, eğitimdeki mevsimsel naive hatasının %80\'i kadar; temel çizgiden iyi',
        'Model mevsimsel naive\'den %80 daha kötü',
        'Modelin açıkladığı varyans oranı (R²) 0.8 demektir; MASE ile R² aynı ölçüdür'
      ],
      a: 1,
      why: 'MASE = MAE / (eğitim döneminde mevsimsel naive\'in MAE\'si). 1\'in altı, modelin basit mevsimsel tekrar stratejisinden daha az hata yaptığını gösterir. Ölçekten bağımsız olduğu için farklı istasyonları karşılaştırmaya da yarar.'
    },
    {
      t: 'predict',
      stage: 'Kodu oku',
      q: 'Naive ve mevsimsel naive tahminleri ne yazdırır?',
      code: 'import numpy as np\n\nseri = np.array([10, 50, 20, 12, 55, 24])   # 3 adımlık mevsim, 2 tur\nufuk = 4\nnaive = np.repeat(seri[-1], ufuk)\nmevsimsel = np.resize(seri[-3:], ufuk)\nprint(naive.tolist())\nprint(mevsimsel.tolist())\n',
      o: ['[24, 24, 24, 24]\n[12, 55, 24, 12]', '[24, 24, 24, 24]\n[10, 50, 20, 10]', '[12, 55, 24, 12]\n[24, 24, 24, 24]', '[24, 24, 24, 24]\n[24, 55, 12, 24]'],
      a: 0,
      why: 'Naive son değeri (24) tekrarlar. Mevsimsel naive son tam mevsimi (12, 55, 24) baştan tekrar eder; np.resize diziyi döngüsel olarak istenen uzunluğa getirir, dördüncü adım yeniden 12 olur. İkinci şık ilk mevsimi alır: en güncel mevsim kullanılmalı.'
    },
    {
      t: 'predict',
      stage: 'Kodu oku',
      q: 'TimeSeriesSplit katları ne yazdırır?',
      code: 'import numpy as np\nfrom sklearn.model_selection import TimeSeriesSplit\n\nX = np.arange(12).reshape(-1, 1)\nfor egt, tst in TimeSeriesSplit(n_splits=3, test_size=2).split(X):\n    print(len(egt), tst.tolist())\n',
      o: ['4 [4, 5]\n6 [6, 7]\n8 [8, 9]', '6 [6, 7]\n8 [8, 9]\n10 [10, 11]', '10 [10, 11]\n10 [8, 9]\n10 [6, 7]', '2 [0, 1]\n4 [2, 3]\n6 [4, 5]'],
      a: 1,
      why: 'test_size=2 ile son üç kat 2\'şer gözlemdir ve serinin sonuna yaslanır: 6-7, 8-9, 10-11. Eğitim her seferinde testten önceki tüm gözlemlerdir ve genişler (6, 8, 10). Test her zaman eğitimden sonra gelir.'
    },
    {
      t: 'predict',
      stage: 'Kodu oku',
      q: 'sMAPE hesabı ne yazdırır?',
      code: 'import numpy as np\n\ny = np.array([0.0, 10.0, 20.0])\nt = np.array([0.0, 15.0, 10.0])\npay = 2 * np.abs(y - t)\npayda = np.abs(y) + np.abs(t)\nsmape = np.mean(np.where(payda == 0, 0.0, pay / np.where(payda == 0, 1, payda))) * 100\nprint(round(float(smape), 1))\n',
      o: ['35.6', '26.7', 'nan', '53.3'],
      a: 0,
      why: 'İlk adımda gerçek ve tahmin 0: payda 0 olduğu için hata 0 sayılır (np.where; yoksa nan çıkardı). İkinci adım: 2·5/25 = 0.4; üçüncü: 2·10/30 = 0.667. Ortalama (0 + 0.4 + 0.667) / 3 = 0.356 → 35.6. 0/0 adımını ortalamadan atsaydın 53.3 çıkardı.'
    },
    {
      t: 'order',
      stage: 'Kodu oku',
      q: '<p>Günlük seriye Holt-Winters (toplamsal, haftalık mevsim) uydurup 7 günlük tahmin üreten ve ilk tahmini yazdıran programın satırlarını sırala.</p>',
      lines: [
        'import numpy as np',
        'from statsmodels.tsa.holtwinters import ExponentialSmoothing',
        'hafta = np.array([100.0, 110.0, 120.0, 130.0, 140.0, 80.0, 70.0])',
        'seri = np.tile(hafta, 6)',
        'model = ExponentialSmoothing(seri, seasonal="add", seasonal_periods=7)',
        'uyum = model.fit()',
        'tahmin = uyum.forecast(7)',
        'print(round(float(tahmin[0])), round(float(tahmin[5])))'
      ],
      expect: '100 80',
      hint: 'Veri önce (hafta → seri), sonra model nesnesi, fit, forecast, çıktı.',
      why: 'Tam tekrarlayan bir haftalık desende Holt-Winters mevsim bileşenini öğrenir ve gelecek haftayı aynen tekrarlar: Pazartesi 100, Cumartesi 80. ExponentialSmoothing önce kurulur, fit ayrı bir adımdır ve uydurulmuş sonuç nesnesi forecast metodunu taşır.'
    },
    {
      t: 'code',
      stage: 'Rehberli',
      id: 'zaman-serisi-tahmin-1',
      diff: 1,
      needs: ['pandas'],
      q: '<p><code>saatlik_talep(yol)</code> fonksiyonunu yaz: <code>started_at</code> (datetime) sütunlu yolculuk tablosundan saatlik yolculuk sayısı serisi üretsin. Seri <b>2024-06-01 00:00 ile 2024-08-31 23:00</b> arasındaki her saati içermeli (yolculuk olmayan saat 0), adı <code>"talep"</code> olmalı. Sonra <code>gunluk_talep(saatlik)</code> yaz: günlük toplam serisi döndürsün.</p>',
      guide: [
        'set_index("started_at") ve resample("h").size() ile say.',
        'pd.date_range(..., freq="h") ile tam takvim kur.',
        'reindex(takvim, fill_value=0) ile eksik saatleri 0 yap; rename("talep").',
        'Günlük: saatlik.resample("D").sum()'
      ],
      example: 'import pandas as pd\n\n# Benzer teknik: eksik günleri 0 ile doldurmak\nsatis = pd.Series([5, 3], index=pd.to_datetime(["2024-01-01", "2024-01-03"]))\ntam = satis.reindex(pd.date_range("2024-01-01", "2024-01-04", freq="D"), fill_value=0)\nprint(tam.tolist())\n',
      start: 'import pandas as pd\nimport veri\n\nyol = veri.oku("pedal_izmir", "bk_trips", usecols=["started_at"], parse_dates=["started_at"])\n\n\ndef saatlik_talep(yol):\n    # TODO 1: saat başına say\n    # TODO 2: tam takvime reindex, fill_value=0, ad "talep"\n    pass\n\n\ndef gunluk_talep(saatlik):\n    # TODO\n    pass\n',
      sol: 'import pandas as pd\nimport veri\n\nyol = veri.oku("pedal_izmir", "bk_trips", usecols=["started_at"], parse_dates=["started_at"])\n\n\ndef saatlik_talep(yol):\n    s = yol.set_index("started_at").resample("h").size()\n    takvim = pd.date_range("2024-06-01 00:00", "2024-08-31 23:00", freq="h")\n    return s.reindex(takvim, fill_value=0).rename("talep")\n\n\ndef gunluk_talep(saatlik):\n    return saatlik.resample("D").sum()\n\n\ns = saatlik_talep(yol)\nprint(len(s), s.sum(), gunluk_talep(s).head(3).tolist())\n',
      tests: 's = saatlik_talep(yol)\nassert len(s) == 2208, f"92 gün × 24 saat = 2208 satır olmalı; gelen {len(s)}"\nassert s.name == "talep", "Serinin adı talep olmalı"\nassert s.sum() == 116517, "Toplam yolculuk sayısı 116517"\nassert (s == 0).sum() == 173, f"173 saatte hiç yolculuk yok; gelen {(s == 0).sum()} (eksik saatleri 0 ile doldurdun mu?)"\nassert s.max() == 185 and s.index[0] == pd.Timestamp("2024-06-01 00:00"), "En yoğun saat 185 yolculuk; seri 1 Haziran 00:00\'da başlar"\ng = gunluk_talep(s)\nassert len(g) == 92 and g.min() == 557 and g.max() == 1436, "Günlük seri: 92 gün, en düşük 557 (yağmurlu gün), en yüksek 1436"\n',
      hints: [
        'Sayım: yol.set_index("started_at").resample("h").size()',
        'Tam takvim: pd.date_range("2024-06-01 00:00", "2024-08-31 23:00", freq="h")',
        's.reindex(takvim, fill_value=0).rename("talep")'
      ],
      why: 'Tahmin modelleri düzenli aralıklı seri bekler. resample yalnız veride görülen aralığı kapsar; dönemin başında ya da sonunda boş saatler olursa sessizce kaybolur. Açık bir takvime reindex etmek "hiç yolculuk yok" bilgisini 0 olarak korur ve mevsimsel lag\'lerin (24, 168) doğru saate denk gelmesini sağlar.'
    },
    {
      t: 'code',
      stage: 'Rehberli',
      id: 'zaman-serisi-tahmin-2',
      diff: 2,
      needs: ['pandas'],
      q: '<p><code>temel_cizgiler(seri, ufuk=168)</code> fonksiyonunu yaz: son <code>ufuk</code> saati test, öncesini eğitim yap ve dört temel çizginin test MAE\'lerini (2 basamak) sözlük olarak döndür:</p><ul><li><code>"naive"</code>: eğitimin son değeri</li><li><code>"mevsimsel_24"</code>: eğitimin son 24 saati, ufuk boyunca döngüsel tekrar (<code>np.resize</code>)</li><li><code>"mevsimsel_168"</code>: eğitimin son 168 saati, döngüsel tekrar</li><li><code>"ortalama"</code>: eğitimin son 168 saatinin ortalaması</li></ul>',
      guide: [
        'egitim, test = seri[:-ufuk], seri[-ufuk:]',
        'Her tahmini ufuk uzunluğunda numpy dizisi olarak kur (np.repeat, np.resize).',
        'MAE = np.mean(np.abs(test - tahmin))',
        'round(float(...), 2) ile sözlüğe yaz.'
      ],
      example: 'import numpy as np\n\n# Benzer teknik: 3 günlük mevsimle tekrar\ngecmis = np.array([5, 9, 7, 6, 10, 8])\nprint(np.resize(gecmis[-3:], 5))\n',
      start: 'import numpy as np\nimport pandas as pd\nimport veri\n\nyol = veri.oku("pedal_izmir", "bk_trips", usecols=["started_at"], parse_dates=["started_at"])\nsaatlik = yol.set_index("started_at").resample("h").size()\nsaatlik = saatlik.reindex(pd.date_range("2024-06-01", "2024-08-31 23:00", freq="h"), fill_value=0).rename("talep")\n\n\ndef temel_cizgiler(seri, ufuk=168):\n    egitim, test = seri[:-ufuk].to_numpy(), seri[-ufuk:].to_numpy()\n    tahminler = {\n        # TODO: naive, mevsimsel_24, mevsimsel_168, ortalama\n    }\n    return {ad: round(float(np.mean(np.abs(test - t))), 2) for ad, t in tahminler.items()}\n',
      sol: 'import numpy as np\nimport pandas as pd\nimport veri\n\nyol = veri.oku("pedal_izmir", "bk_trips", usecols=["started_at"], parse_dates=["started_at"])\nsaatlik = yol.set_index("started_at").resample("h").size()\nsaatlik = saatlik.reindex(pd.date_range("2024-06-01", "2024-08-31 23:00", freq="h"), fill_value=0).rename("talep")\n\n\ndef temel_cizgiler(seri, ufuk=168):\n    egitim, test = seri[:-ufuk].to_numpy(), seri[-ufuk:].to_numpy()\n    tahminler = {\n        "naive": np.repeat(egitim[-1], ufuk),\n        "mevsimsel_24": np.resize(egitim[-24:], ufuk),\n        "mevsimsel_168": np.resize(egitim[-168:], ufuk),\n        "ortalama": np.repeat(egitim[-168:].mean(), ufuk),\n    }\n    return {ad: round(float(np.mean(np.abs(test - t))), 2) for ad, t in tahminler.items()}\n\n\nprint(temel_cizgiler(saatlik))\n',
      tests: 'r = temel_cizgiler(saatlik)\nassert set(r) == {"naive", "mevsimsel_24", "mevsimsel_168", "ortalama"}, "Dört temel çizgi olmalı"\nassert r == {"naive": 43.1, "mevsimsel_24": 26.01, "mevsimsel_168": 7.66, "ortalama": 40.05}, f"MAE değerleri tutmuyor: {r}"\nr2 = temel_cizgiler(saatlik, ufuk=24)\nassert r2["mevsimsel_168"] < r2["mevsimsel_24"] < r2["naive"], "Son günde de haftalık mevsimsel naive en iyisi olmalı"\n',
      hints: [
        'naive: np.repeat(egitim[-1], ufuk)',
        'mevsimsel: np.resize(egitim[-24:], ufuk) ve np.resize(egitim[-168:], ufuk)',
        'ortalama: np.repeat(egitim[-168:].mean(), ufuk)'
      ],
      why: 'Geçen haftanın aynı saati (MAE 7.66), dünün aynı saatinden (26.01) çok daha iyi; çünkü test haftası hafta sonunu da içeriyor ve 24 saatlik tekrar cumartesiyi cuma gibi tahmin ediyor. Her yeni model önce bu 7.66\'yı yenmek zorunda; yenemiyorsa karmaşıklığına değmez.'
    },
    {
      t: 'code',
      stage: 'Rehberli',
      id: 'zaman-serisi-tahmin-3',
      diff: 2,
      q: '<p><code>metrikler(y, tahmin, y_egitim, m)</code> fonksiyonunu yaz ve dört metriği (3 basamak) sözlük olarak döndür:</p><ul><li><code>"mae"</code>: ortalama |y − ŷ|</li><li><code>"rmse"</code>: √ortalama (y − ŷ)²</li><li><code>"smape"</code>: 100 · ortalama 2|y − ŷ| / (|y| + |ŷ|); payda 0 olan adımda hata 0</li><li><code>"mase"</code>: MAE / eğitim serisinde mevsimsel naive\'in MAE\'si = ortalama |y_egitim[t] − y_egitim[t − m]|</li></ul><p>Girdiler liste ya da numpy dizisi olabilir.</p>',
      guide: [
        'Hepsini np.asarray(..., dtype=float) ile diziye çevir.',
        'smape için np.where ile payda 0 olan yerleri 0 yap.',
        'mase paydası: np.mean(np.abs(y_egitim[m:] - y_egitim[:-m]))',
        'round(float(...), 3)'
      ],
      example: 'import numpy as np\n\n# Benzer teknik: sıfıra bölmeyi np.where ile atlatmak\npay = np.array([2.0, 0.0, 3.0]); payda = np.array([4.0, 0.0, 6.0])\nprint(np.where(payda == 0, 0.0, pay / np.where(payda == 0, 1, payda)))\n',
      start: 'import numpy as np\n\n\ndef metrikler(y, tahmin, y_egitim, m):\n    y, tahmin, y_egitim = (np.asarray(v, dtype=float) for v in (y, tahmin, y_egitim))\n    hata = y - tahmin\n    # TODO: mae, rmse, smape, mase\n    return {}\n',
      sol: 'import numpy as np\n\n\ndef metrikler(y, tahmin, y_egitim, m):\n    y, tahmin, y_egitim = (np.asarray(v, dtype=float) for v in (y, tahmin, y_egitim))\n    hata = y - tahmin\n    mae = np.mean(np.abs(hata))\n    rmse = np.sqrt(np.mean(hata ** 2))\n    payda = np.abs(y) + np.abs(tahmin)\n    smape = 100 * np.mean(np.where(payda == 0, 0.0, 2 * np.abs(hata) / np.where(payda == 0, 1, payda)))\n    olcek = np.mean(np.abs(y_egitim[m:] - y_egitim[:-m]))\n    return {k: round(float(v), 3) for k, v in {"mae": mae, "rmse": rmse, "smape": smape, "mase": mae / olcek}.items()}\n',
      tests: 'r = metrikler([10, 0, 20], [12, 0, 14], [5, 8, 6, 9, 7, 10], 2)\nassert r["mae"] == 2.667 and r["rmse"] == 3.651, f"MAE (2+0+6)/3, RMSE kök((4+0+36)/3); gelen {r}"\nassert r["smape"] == 17.825, f"sMAPE: (2·2/22 + 0 + 2·6/34)/3·100 = 17.825; 0/0 adımı 0 sayılır; gelen {r[\'smape\']}"\nassert r["mase"] == 2.667, "MASE: ölçek ortalama |6-5|, |9-8|, |7-6|, |10-9| = 1"\nimport veri, pandas as pd\nyol = veri.oku("pedal_izmir", "bk_trips", usecols=["started_at"], parse_dates=["started_at"])\ns = yol.set_index("started_at").resample("h").size().reindex(pd.date_range("2024-06-01", "2024-08-31 23:00", freq="h"), fill_value=0)\negt, tst = s[:-168].to_numpy(), s[-168:].to_numpy()\ng = metrikler(tst, egt[-168:], egt, 24)\nassert g == {"mae": 7.661, "rmse": 17.181, "smape": 22.274, "mase": 0.63}, f"Pedal İzmir mevsimsel naive metrikleri tutmuyor: {g}"\n',
      hints: [
        'rmse = np.sqrt(np.mean(hata ** 2))',
        'smape: payda = |y| + |ŷ|; np.where(payda == 0, 0.0, 2*|hata| / np.where(payda == 0, 1, payda))',
        'mase: mae / np.mean(np.abs(y_egitim[m:] - y_egitim[:-m]))'
      ],
      why: 'Pedal İzmir\'de haftalık naive\'in MAE\'si 7.7 ama RMSE\'si 17.2: hatalar birkaç büyük sapmada (yağmurlu saatler) toplanıyor. MASE 0.63, bu tahminin eğitimdeki "dünün aynı saati" stratejisinden %37 daha iyi olduğunu söyler. sMAPE\'de 0/0 adımını 0 saymak gece saatlerinde metriğin patlamasını önler.'
    },
    {
      t: 'code',
      stage: 'Rehberli',
      id: 'zaman-serisi-tahmin-4',
      diff: 2,
      needs: ['pandas'],
      q: '<p><b>Gün öncesi tahmin için özellik tablosu.</b> <code>lag_tablosu(seri)</code> fonksiyonunu yaz: saatlik seriden şu sütunlu DataFrame döndürsün ve boş satırları (ilk hafta) atsın:</p><ul><li><code>talep</code>: hedef</li><li><code>lag24</code>, <code>lag168</code>: 24 ve 168 saat önceki talep</li><li><code>ort24</code>: <b>24 saat önceye kadarki</b> son 24 saatin ortalaması (<code>shift(24).rolling(24).mean()</code>)</li><li><code>saat</code>, <code>haftasonu</code> (Cumartesi/Pazar 1)</li></ul><p>Gün öncesi tahminde son 24 saat bilinmez; bu yüzden hiçbir özellik 24 saatten yeni bilgi kullanmamalı.</p>',
      guide: ['df = seri.to_frame("talep")', 'shift(24), shift(168) ile lag\'ler.', 'Önce shift(24), sonra rolling(24).mean()', 'saat ve haftasonu index\'ten; sonunda dropna().'],
      example: 'import pandas as pd\n\n# Benzer teknik: 2 adım geriden 3\'lük pencere ortalaması\ns = pd.Series([1, 2, 3, 4, 5, 6, 7.0])\nprint(s.shift(2).rolling(3).mean().tolist())\n',
      start: 'import numpy as np\nimport pandas as pd\nimport veri\n\nyol = veri.oku("pedal_izmir", "bk_trips", usecols=["started_at"], parse_dates=["started_at"])\nsaatlik = yol.set_index("started_at").resample("h").size()\nsaatlik = saatlik.reindex(pd.date_range("2024-06-01", "2024-08-31 23:00", freq="h"), fill_value=0).rename("talep")\n\n\ndef lag_tablosu(seri):\n    df = seri.to_frame("talep")\n    # TODO: lag24, lag168, ort24, saat, haftasonu\n    return df.dropna()\n',
      sol: 'import numpy as np\nimport pandas as pd\nimport veri\n\nyol = veri.oku("pedal_izmir", "bk_trips", usecols=["started_at"], parse_dates=["started_at"])\nsaatlik = yol.set_index("started_at").resample("h").size()\nsaatlik = saatlik.reindex(pd.date_range("2024-06-01", "2024-08-31 23:00", freq="h"), fill_value=0).rename("talep")\n\n\ndef lag_tablosu(seri):\n    df = seri.to_frame("talep")\n    df["lag24"] = df["talep"].shift(24)\n    df["lag168"] = df["talep"].shift(168)\n    df["ort24"] = df["talep"].shift(24).rolling(24).mean()\n    df["saat"] = df.index.hour\n    df["haftasonu"] = (df.index.dayofweek >= 5).astype(int)\n    return df.dropna()\n\n\nt = lag_tablosu(saatlik)\nprint(t.shape)\nprint(t.head(3))\n',
      tests: 't = lag_tablosu(saatlik)\nassert list(t.columns) == ["talep", "lag24", "lag168", "ort24", "saat", "haftasonu"], f"Sütunlar/sıra: {list(t.columns)}"\nassert len(t) == 2208 - 168 and t.index[0] == pd.Timestamp("2024-06-08 00:00"), "İlk 168 saat lag168 yüzünden düşer: 2040 satır, 8 Haziran 00:00\'dan başlar"\nz = pd.Timestamp("2024-07-10 08:00")\nassert t.loc[z, "lag24"] == saatlik[z - pd.Timedelta(hours=24)] and t.loc[z, "lag168"] == saatlik[z - pd.Timedelta(hours=168)], "lag24 dün aynı saat, lag168 geçen hafta aynı saat"\nbek = saatlik[z - pd.Timedelta(hours=47): z - pd.Timedelta(hours=24)].mean()\nassert abs(t.loc[z, "ort24"] - bek) < 1e-9, "ort24, 24 ile 47 saat öncesi arasındaki 24 saatin ortalaması olmalı (shift(24) sonra rolling)"\nassert t.loc[pd.Timestamp("2024-07-13 10:00"), "haftasonu"] == 1 and t.loc[z, "saat"] == 8, "13 Temmuz Cumartesi"\n',
      hints: [
        'Lag: df["talep"].shift(24)',
        'Sızıntısız pencere: df["talep"].shift(24).rolling(24).mean()',
        'df.index.hour ve (df.index.dayofweek &gt;= 5).astype(int)'
      ],
      why: 'Gün öncesi tahminde bilgi anı "dün gece yarısı"dır; yarının 17:00\'sini tahmin ederken bugünün 16:00\'sı bilinmez. shift(24) her özelliği en az 24 saat geriye iter. rolling\'i shift\'ten önce uygularsan pencere tahmin saatine kadar uzanır: sızıntı.'
    },
    {
      t: 'code',
      stage: 'Kendin yaz',
      id: 'zaman-serisi-tahmin-5',
      diff: 2,
      needs: ['pandas'],
      q: '<p><code>ayristir(saatlik, gunluk)</code> fonksiyonunu yaz ve sözlük döndür:</p><ul><li><code>"mevsim_gucu"</code>: <code>STL(saatlik, period=24)</code> ile ayrıştır; <code>max(0, 1 − Var(kalıntı) / Var(mevsim + kalıntı))</code>, 3 basamak</li><li><code>"zirve_saat"</code>: mevsimsel bileşenin saat başına ortalaması en yüksek olan saat (int)</li><li><code>"adf_p"</code>: <code>adfuller(gunluk)</code> p-değeri</li><li><code>"duragan"</code>: <code>adf_p &lt; 0.05</code> (Python bool)</li></ul>',
      start: 'import numpy as np\nimport pandas as pd\nimport veri\n\nyol = veri.oku("pedal_izmir", "bk_trips", usecols=["started_at"], parse_dates=["started_at"])\nsaatlik = yol.set_index("started_at").resample("h").size()\nsaatlik = saatlik.reindex(pd.date_range("2024-06-01", "2024-08-31 23:00", freq="h"), fill_value=0).rename("talep")\nfrom statsmodels.tsa.seasonal import STL\nfrom statsmodels.tsa.stattools import adfuller\n\ngunluk = saatlik.resample("D").sum()\n\n\ndef ayristir(saatlik, gunluk):\n    pass\n',
      sol: 'import numpy as np\nimport pandas as pd\nimport veri\n\nyol = veri.oku("pedal_izmir", "bk_trips", usecols=["started_at"], parse_dates=["started_at"])\nsaatlik = yol.set_index("started_at").resample("h").size()\nsaatlik = saatlik.reindex(pd.date_range("2024-06-01", "2024-08-31 23:00", freq="h"), fill_value=0).rename("talep")\nfrom statsmodels.tsa.seasonal import STL\nfrom statsmodels.tsa.stattools import adfuller\n\ngunluk = saatlik.resample("D").sum()\n\n\ndef ayristir(saatlik, gunluk):\n    stl = STL(saatlik, period=24).fit()\n    guc = max(0.0, 1 - np.var(stl.resid) / np.var(stl.seasonal + stl.resid))\n    zirve = int(stl.seasonal.groupby(stl.seasonal.index.hour).mean().idxmax())\n    p = float(adfuller(gunluk)[1])\n    return {"mevsim_gucu": round(float(guc), 3), "zirve_saat": zirve, "adf_p": p, "duragan": bool(p < 0.05)}\n\n\nprint(ayristir(saatlik, gunluk))\n',
      tests: 'r = ayristir(saatlik, gunluk)\nassert r["mevsim_gucu"] == 0.906, f"Günlük mevsimsellik gücü 0.906 olmalı; gelen {r[\'mevsim_gucu\']}"\nassert r["zirve_saat"] == 18, f"Mevsimsel bileşen en yüksek akşam 18\'de; gelen {r[\'zirve_saat\']}"\nassert r["adf_p"] < 1e-6 and r["duragan"] is True, "Günlük toplam seri durağan (ADF p çok küçük)"\n',
      hints: [
        'stl = STL(saatlik, period=24).fit(); stl.seasonal, stl.resid',
        'Zirve: stl.seasonal.groupby(stl.seasonal.index.hour).mean().idxmax()',
        'adfuller(gunluk)[1] p-değeridir.'
      ],
      why: '0.91\'lik mevsimsellik gücü, saatlik talebin büyük kısmının "günün saati" tarafından açıklandığını söyler; bu yüzden mevsimsel modeller ve saat özellikleri vazgeçilmezdir. Günlük toplam durağandır (belirgin trend yok); ARIMA\'da fark almaya (d=0) gerek kalmaz.'
    },
    {
      t: 'code',
      stage: 'Kendin yaz',
      id: 'zaman-serisi-tahmin-6',
      diff: 2,
      needs: ['pandas'],
      q: '<p><code>ets_karsilastir(gunluk, ufuk=14)</code> fonksiyonunu yaz: son <code>ufuk</code> günü test yap; eğitime <code>ExponentialSmoothing(seasonal="add", seasonal_periods=7)</code> uydur, <code>ufuk</code> gün tahmin et. Haftalık mevsimsel naive (eğitimin son 7 günü döngüsel) ile karşılaştır. <code>{"ets": mae, "mevsimsel_naive": mae}</code> döndür (1 basamak).</p>',
      start: 'import numpy as np\nimport pandas as pd\nimport veri\n\nyol = veri.oku("pedal_izmir", "bk_trips", usecols=["started_at"], parse_dates=["started_at"])\nsaatlik = yol.set_index("started_at").resample("h").size()\nsaatlik = saatlik.reindex(pd.date_range("2024-06-01", "2024-08-31 23:00", freq="h"), fill_value=0).rename("talep")\nimport warnings\nfrom statsmodels.tsa.holtwinters import ExponentialSmoothing\nwarnings.filterwarnings("ignore")\n\ngunluk = saatlik.resample("D").sum()\n\n\ndef ets_karsilastir(gunluk, ufuk=14):\n    pass\n',
      sol: 'import numpy as np\nimport pandas as pd\nimport veri\n\nyol = veri.oku("pedal_izmir", "bk_trips", usecols=["started_at"], parse_dates=["started_at"])\nsaatlik = yol.set_index("started_at").resample("h").size()\nsaatlik = saatlik.reindex(pd.date_range("2024-06-01", "2024-08-31 23:00", freq="h"), fill_value=0).rename("talep")\nimport warnings\nfrom statsmodels.tsa.holtwinters import ExponentialSmoothing\nwarnings.filterwarnings("ignore")\n\ngunluk = saatlik.resample("D").sum()\n\n\ndef ets_karsilastir(gunluk, ufuk=14):\n    egt, test = gunluk[:-ufuk], gunluk[-ufuk:].to_numpy()\n    ets = ExponentialSmoothing(egt, seasonal="add", seasonal_periods=7).fit().forecast(ufuk)\n    mev = np.resize(egt[-7:].to_numpy(), ufuk)\n    return {"ets": round(float(np.mean(np.abs(test - np.asarray(ets)))), 1),\n            "mevsimsel_naive": round(float(np.mean(np.abs(test - mev))), 1)}\n\n\nprint(ets_karsilastir(gunluk))\n',
      tests: 'r = ets_karsilastir(gunluk)\nassert r["mevsimsel_naive"] == 126.2, f"Mevsimsel naive MAE 126.2; gelen {r[\'mevsimsel_naive\']}"\n# ETS parametreleri sayısal optimizasyonla bulunur; statsmodels sürümüne göre MAE 107 ile 129 arasında çıkabiliyor\nassert 100 <= r["ets"] <= 135, f"ETS MAE 100–135 aralığında olmalı; gelen {r[\'ets\']}"\n',
      hints: [
        'egt, test = gunluk[:-ufuk], gunluk[-ufuk:]',
        'ExponentialSmoothing(egt, seasonal="add", seasonal_periods=7).fit().forecast(ufuk)',
        'mevsimsel naive: np.resize(egt[-7:].to_numpy(), ufuk)'
      ],
      why: 'ETS seviyeyi ve haftalık deseni üstel ağırlıklarla günceller; tek bir haftanın gürültüsünü kopyalayan mevsimsel naive\'den genelde daha kararlıdır. Bu kısa pencerede fark küçük: parametreler sayısal optimizasyonla bulunduğu için statsmodels sürümüne göre ETS biraz önde ya da biraz geride çıkabilir (bilgisayarda ~107, tarayıcıda ~128). Ama ikisi de 14 günlük testteki yağmurlu günü (877 yolculuk) göremez: geçmişe bakan modellerin sınırı. Bir sonraki alıştırmada dışsal değişken bu boşluğu dolduracak.'
    },
    {
      t: 'code',
      stage: 'Kendin yaz',
      id: 'zaman-serisi-tahmin-7',
      diff: 3,
      needs: ['pandas'],
      q: '<p><code>sarimax_yagis(gunluk, yagis, ufuk=14)</code> fonksiyonunu yaz: son <code>ufuk</code> gün test. Eğitime <code>SARIMAX(order=(1, 0, 0), seasonal_order=(1, 0, 0, 7), trend="c")</code> modelini, <code>yagis</code> (günlük toplam yağış, DataFrame) dışsal değişkeniyle uydur (<code>fit(disp=False, maxiter=200)</code>). Testteki yağışla tahmin et. Döndür: <code>{"mae": ..., "yagis_katsayi": ..., "kapsama80": ...}</code> (1, 1 ve 2 basamak). <code>kapsama80</code>: test günlerinin yüzde kaçı <code>get_forecast(...).conf_int(alpha=0.2)</code> aralığına düşüyor.</p>',
      start: 'import numpy as np\nimport pandas as pd\nimport veri\n\nyol = veri.oku("pedal_izmir", "bk_trips", usecols=["started_at"], parse_dates=["started_at"])\nsaatlik = yol.set_index("started_at").resample("h").size()\nsaatlik = saatlik.reindex(pd.date_range("2024-06-01", "2024-08-31 23:00", freq="h"), fill_value=0).rename("talep")\ngunluk = saatlik.resample("D").sum()\nhava = veri.oku("pedal_izmir", "bk_weather", parse_dates=["obs_hour"]).set_index("obs_hour")\nyagis = hava["rain_mm"].resample("D").sum().rename("yagis")\nfrom statsmodels.tsa.statespace.sarimax import SARIMAX\n\nyagis = yagis.to_frame()\n\n\ndef sarimax_yagis(gunluk, yagis, ufuk=14):\n    pass\n',
      sol: 'import numpy as np\nimport pandas as pd\nimport veri\n\nyol = veri.oku("pedal_izmir", "bk_trips", usecols=["started_at"], parse_dates=["started_at"])\nsaatlik = yol.set_index("started_at").resample("h").size()\nsaatlik = saatlik.reindex(pd.date_range("2024-06-01", "2024-08-31 23:00", freq="h"), fill_value=0).rename("talep")\ngunluk = saatlik.resample("D").sum()\nhava = veri.oku("pedal_izmir", "bk_weather", parse_dates=["obs_hour"]).set_index("obs_hour")\nyagis = hava["rain_mm"].resample("D").sum().rename("yagis")\nfrom statsmodels.tsa.statespace.sarimax import SARIMAX\n\nyagis = yagis.to_frame()\n\n\ndef sarimax_yagis(gunluk, yagis, ufuk=14):\n    egt, test = gunluk[:-ufuk], gunluk[-ufuk:]\n    sx = SARIMAX(egt, exog=yagis[:-ufuk], order=(1, 0, 0), seasonal_order=(1, 0, 0, 7), trend="c").fit(disp=False, maxiter=200)\n    f = sx.get_forecast(ufuk, exog=yagis[-ufuk:])\n    ara = f.conf_int(alpha=0.2)\n    icinde = ((test >= ara.iloc[:, 0]) & (test <= ara.iloc[:, 1])).mean()\n    return {"mae": round(float(np.mean(np.abs(test - f.predicted_mean))), 1),\n            "yagis_katsayi": round(float(sx.params["yagis"]), 1),\n            "kapsama80": round(float(icinde), 2)}\n\n\nprint(sarimax_yagis(gunluk, yagis))\n',
      tests: 'r = sarimax_yagis(gunluk, yagis)\nassert set(r) == {"mae", "yagis_katsayi", "kapsama80"}, "Üç anahtar olmalı"\nassert -20 < r["yagis_katsayi"] < -12, f"Her mm yağış günlük talebi ~16 yolculuk düşürmeli; gelen {r[\'yagis_katsayi\']}"\nassert r["mae"] < 80, f"Yağışı bilen SARIMAX, ETS (~107) ve mevsimsel naive\'den (126) belirgin iyi olmalı; gelen {r[\'mae\']}"\nassert 0 <= r["kapsama80"] <= 1, "Kapsama 0-1 arası bir oran"\n',
      hints: [
        'SARIMAX(egt, exog=yagis[:-ufuk], order=..., seasonal_order=..., trend="c").fit(disp=False, maxiter=200)',
        'f = sx.get_forecast(ufuk, exog=yagis[-ufuk:]); f.predicted_mean, f.conf_int(alpha=0.2)',
        'Kapsama: ((test &gt;= alt) &amp; (test &lt;= ust)).mean()'
      ],
      why: 'Dışsal değişken, geçmişe bakan modellerin göremediği olayı açıklar: yağmurlu bir gün. Katsayı yorumlanabilir: her mm yağış günlük talebi yaklaşık 16 yolculuk düşürüyor. Kapsama, %80 aralığın gerçekten %80 tutup tutmadığını gösterir; 14 günde bu oran gürültülüdür, backtest\'te birçok katla ölçülmelidir.'
    },
    {
      t: 'code',
      stage: 'Kendin yaz',
      id: 'zaman-serisi-tahmin-8',
      diff: 2,
      needs: ['pandas'],
      q: '<p>Genel amaçlı bir <b>genişleyen pencere backtest</b> fonksiyonu yaz: <code>backtest(seri, tahminci, ilk, ufuk, adim)</code>.</p><ul><li>Kesim noktaları: <code>ilk, ilk + adim, ilk + 2·adim, ...</code> (kesim + ufuk ≤ len(seri) olduğu sürece).</li><li>Her kesimde: <code>egitim = seri[:kesim]</code>, <code>test = seri[kesim:kesim + ufuk]</code>, <code>tahmin = tahminci(egitim, ufuk)</code> (numpy dizisi).</li><li>Döndür: <code>[(kesim, mae), ...]</code>, mae 2 basamak.</li></ul><p>Sonra günlük Pedal İzmir serisinde haftalık mevsimsel naive ile dene: <code>sonuc = backtest(gunluk, mevsimsel7, 56, 7, 7)</code>.</p>',
      start: 'import numpy as np\nimport pandas as pd\nimport veri\n\nyol = veri.oku("pedal_izmir", "bk_trips", usecols=["started_at"], parse_dates=["started_at"])\nsaatlik = yol.set_index("started_at").resample("h").size()\nsaatlik = saatlik.reindex(pd.date_range("2024-06-01", "2024-08-31 23:00", freq="h"), fill_value=0).rename("talep")\ngunluk = saatlik.resample("D").sum()\n\n\ndef mevsimsel7(egitim, ufuk):\n    return np.resize(np.asarray(egitim)[-7:], ufuk)\n\n\ndef backtest(seri, tahminci, ilk, ufuk, adim):\n    pass\n\n\nsonuc = None\n',
      sol: 'import numpy as np\nimport pandas as pd\nimport veri\n\nyol = veri.oku("pedal_izmir", "bk_trips", usecols=["started_at"], parse_dates=["started_at"])\nsaatlik = yol.set_index("started_at").resample("h").size()\nsaatlik = saatlik.reindex(pd.date_range("2024-06-01", "2024-08-31 23:00", freq="h"), fill_value=0).rename("talep")\ngunluk = saatlik.resample("D").sum()\n\n\ndef mevsimsel7(egitim, ufuk):\n    return np.resize(np.asarray(egitim)[-7:], ufuk)\n\n\ndef backtest(seri, tahminci, ilk, ufuk, adim):\n    sonuc = []\n    kesim = ilk\n    while kesim + ufuk <= len(seri):\n        egitim, test = seri[:kesim], np.asarray(seri[kesim:kesim + ufuk], dtype=float)\n        tahmin = np.asarray(tahminci(egitim, ufuk), dtype=float)\n        sonuc.append((kesim, round(float(np.mean(np.abs(test - tahmin))), 2)))\n        kesim += adim\n    return sonuc\n\n\nsonuc = backtest(gunluk, mevsimsel7, 56, 7, 7)\nprint(sonuc)\n',
      tests: 'k = backtest(np.arange(10.0), lambda e, u: np.repeat(e[-1], u), 4, 2, 2)\nassert k == [(4, 1.5), (6, 1.5), (8, 1.5)], f"Kesimler 4, 6, 8 ve naive MAE 1.5 olmalı; gelen {k}"\nassert backtest(np.arange(10.0), lambda e, u: np.repeat(e[-1], u), 4, 3, 3) == [(4, 2.0), (7, 2.0)], "Kesim + ufuk ≤ uzunluk olduğu sürece kat alınır (7+3 = 10 dahil, 10+3 hariç)"\nassert [s[0] for s in sonuc] == [56, 63, 70, 77, 84], "Günlük seride 5 kat: 56, 63, 70, 77, 84"\nassert sonuc == [(56, 47.14), (63, 6.29), (70, 158.57), (77, 191.86), (84, 87.43)], f"Kat MAE değerleri tutmuyor: {sonuc}"\nassert max(m for _, m in sonuc) / min(m for _, m in sonuc) > 20, "Haftalar arası fark çok büyük: tek bir test penceresi yanıltıcı olur"\nassert len(sonuc) == 5 and all(m > 0 for _, m in sonuc)\n',
      hints: [
        'while kesim + ufuk &lt;= len(seri): ... kesim += adim',
        'tahminci yalnız egitim\'i görür: tahminci(seri[:kesim], ufuk)',
        'MAE\'yi numpy dizileriyle hesapla; pandas index hizalaması karışmasın.'
      ],
      why: 'Tek bir test penceresi şansa açıktır; genişleyen pencere modeli farklı haftalarda sınar ve hatanın dağılımını gösterir. Fonksiyonun tahminciyi parametre olarak alması (strateji kalıbı) ETS, SARIMAX ya da ML modelini aynı çerçevede adil biçimde karşılaştırmanı sağlar. Tahminci yalnız eğitim dilimini gördüğü için sızıntı yapısal olarak engellenir.'
    },
    {
      t: 'code',
      stage: 'Hata avı',
      id: 'zaman-serisi-tahmin-9',
      diff: 2,
      kind: 'bug',
      needs: ['pandas'],
      q: '<p><b>Hatayı bul ve düzelt.</b> <code>ml_degerlendir(tablo)</code> lag tablosundaki (<code>lag24, lag168, saat, haftasonu</code> → <code>talep</code>) Ridge modelini son %20 ile test etmeli. Stajyerin kodu testte MAE\'yi olduğundan iyi gösteriyor: <code>train_test_split</code> varsayılan olarak <b>karıştırır</b>. Bölmeyi kronolojik yap (karıştırmadan, test eğitimden sonra). MAE\'yi 2 basamakla döndür.</p>',
      start: 'import numpy as np\nimport pandas as pd\nimport veri\n\nyol = veri.oku("pedal_izmir", "bk_trips", usecols=["started_at"], parse_dates=["started_at"])\nsaatlik = yol.set_index("started_at").resample("h").size()\nsaatlik = saatlik.reindex(pd.date_range("2024-06-01", "2024-08-31 23:00", freq="h"), fill_value=0).rename("talep")\nfrom sklearn.linear_model import Ridge\nfrom sklearn.model_selection import train_test_split\n\nd = saatlik.to_frame("talep")\nd["lag24"], d["lag168"] = d["talep"].shift(24), d["talep"].shift(168)\nd["saat"], d["haftasonu"] = d.index.hour, (d.index.dayofweek >= 5).astype(int)\ntablo = d.dropna()\n\n\ndef ml_degerlendir(tablo):\n    X, y = tablo[["lag24", "lag168", "saat", "haftasonu"]], tablo["talep"]\n    X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, random_state=0)\n    m = Ridge().fit(X_tr, y_tr)\n    return round(float(np.mean(np.abs(m.predict(X_te) - y_te))), 2)\n',
      sol: 'import numpy as np\nimport pandas as pd\nimport veri\n\nyol = veri.oku("pedal_izmir", "bk_trips", usecols=["started_at"], parse_dates=["started_at"])\nsaatlik = yol.set_index("started_at").resample("h").size()\nsaatlik = saatlik.reindex(pd.date_range("2024-06-01", "2024-08-31 23:00", freq="h"), fill_value=0).rename("talep")\nfrom sklearn.linear_model import Ridge\nfrom sklearn.model_selection import train_test_split\n\nd = saatlik.to_frame("talep")\nd["lag24"], d["lag168"] = d["talep"].shift(24), d["talep"].shift(168)\nd["saat"], d["haftasonu"] = d.index.hour, (d.index.dayofweek >= 5).astype(int)\ntablo = d.dropna()\n\n\ndef ml_degerlendir(tablo):\n    X, y = tablo[["lag24", "lag168", "saat", "haftasonu"]], tablo["talep"]\n    X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, shuffle=False)\n    m = Ridge().fit(X_tr, y_tr)\n    return round(float(np.mean(np.abs(m.predict(X_te) - y_te))), 2)\n',
      tests: 'import inspect\nr = ml_degerlendir(tablo)\nn = len(tablo); kes = n - int(np.ceil(n * 0.2))\nX, y = tablo[["lag24", "lag168", "saat", "haftasonu"]], tablo["talep"]\nm = Ridge().fit(X.iloc[:kes], y.iloc[:kes])\nbek = round(float(np.mean(np.abs(m.predict(X.iloc[kes:]) - y.iloc[kes:]))), 2)\nassert r == bek, f"Kronolojik bölmede MAE {bek} olmalı; gelen {r}. Test seti serinin son %20\'si olmalı"\n',
      hints: [
        'train_test_split\'in shuffle parametresi varsayılan olarak True.',
        'shuffle=False verince ilk %80 eğitim, son %20 test olur (random_state gereksiz).'
      ],
      why: 'Karıştırılmış bölmede test saatlerinin komşuları eğitimdedir ve yaz boyunca tekrarlayan desen ezberlenir; skor iyimser çıkar. shuffle=False (ya da açık tarih kesimi) gerçek kullanımı taklit eder: geçmişle eğit, geleceği tahmin et. Daha iyisi TimeSeriesSplit ile birkaç kat.'
    },
    {
      t: 'code',
      stage: 'Hata avı',
      id: 'zaman-serisi-tahmin-10',
      diff: 3,
      kind: 'bug',
      q: '<p><b>Hatayı bul ve düzelt.</b> <code>ozyinelemeli_tahmin(model, gecmis, ufuk, p)</code> tek adımlık bir AR modeliyle (son <code>p</code> değerden bir sonrakini tahmin eden) <code>ufuk</code> adım <b>özyinelemeli</b> tahmin yapmalı: her adımın tahmini, bir sonraki adımın girdisine eklenmeli. Mevcut kod bir sonraki adımın girdisine <b>gerçek test değerlerini</b> (<code>gelecek</code>) ekliyor; canlıda bu değerler yok. <code>gelecek</code> parametresini kullanmadan düzelt (imza aynı kalsın).</p>',
      start: 'import numpy as np\nfrom sklearn.linear_model import LinearRegression\n\n\ndef ozyinelemeli_tahmin(model, gecmis, ufuk, p, gelecek=None):\n    pencere = list(gecmis[-p:])\n    tahminler = []\n    for h in range(ufuk):\n        t = float(model.predict(np.array([pencere[-p:]]))[0])\n        tahminler.append(t)\n        pencere.append(gelecek[h])\n    return np.array(tahminler)\n',
      sol: 'import numpy as np\nfrom sklearn.linear_model import LinearRegression\n\n\ndef ozyinelemeli_tahmin(model, gecmis, ufuk, p, gelecek=None):\n    pencere = list(gecmis[-p:])\n    tahminler = []\n    for h in range(ufuk):\n        t = float(model.predict(np.array([pencere[-p:]]))[0])\n        tahminler.append(t)\n        pencere.append(t)\n    return np.array(tahminler)\n',
      tests: 'X = np.array([[1.0, 2.0], [2.0, 3.0], [3.0, 4.0], [4.0, 5.0]])\ny = np.array([3.0, 4.0, 5.0, 6.0])\nm = LinearRegression().fit(X, y)\nr = ozyinelemeli_tahmin(m, [5.0, 6.0], 3, 2, gelecek=[100.0, 100.0, 100.0])\nassert np.allclose(r, [7.0, 8.0, 9.0]), f"Model \'bir sonraki = son + 1\' öğrendi; kendi tahminleriyle 7, 8, 9 üretmeli; gelen {r}"\nr2 = ozyinelemeli_tahmin(m, [5.0, 6.0], 3, 2)\nassert np.allclose(r2, [7.0, 8.0, 9.0]), "gelecek verilmeden de çalışmalı (canlıda gelecek bilinmez)"\n',
      hints: ['Döngüde pencereye eklenen değer nereden geliyor?', 'Tahmini (t) pencereye ekle: pencere.append(t)'],
      why: 'Gerçek değerleri geri beslemek "tek adımlık" doğruluğu ölçer ve çok adımlı performansı olduğundan iyi gösterir; canlıda ise kod hiç çalışmaz (gelecek yok). Özyinelemeli stratejide hata birikir: 3. adımın girdisi iki tahmin içerir. Bu birikmeyi önlemek istersen doğrudan stratejiyi (her ufuk için ayrı model) kullan.'
    },
    {
      t: 'code',
      stage: 'Meydan okuma',
      id: 'zaman-serisi-tahmin-11',
      diff: 3,
      q: '<p><b>Doğrudan çok adımlı tahmin.</b> İki fonksiyon yaz:</p><ol><li><code>dogrudan_egit(seri, p, H)</code>: her <code>h = 1..H</code> için ayrı bir <code>LinearRegression</code> eğitsin. Eğitim örnekleri: her <code>t</code> için girdi <code>seri[t-p:t]</code>, hedef <code>seri[t+h-1]</code> (<code>t = p .. len(seri)-h</code>). Model listesi döndürsün.</li><li><code>dogrudan_tahmin(modeller, gecmis, p)</code>: son <code>p</code> değerle her modelden bir tahmin alıp numpy dizisi döndürsün (uzunluk H).</li></ol>',
      start: 'import numpy as np\nfrom sklearn.linear_model import LinearRegression\n\n\ndef dogrudan_egit(seri, p, H):\n    pass\n\n\ndef dogrudan_tahmin(modeller, gecmis, p):\n    pass\n',
      sol: 'import numpy as np\nfrom sklearn.linear_model import LinearRegression\n\n\ndef dogrudan_egit(seri, p, H):\n    seri = np.asarray(seri, dtype=float)\n    modeller = []\n    for h in range(1, H + 1):\n        X = np.array([seri[t - p:t] for t in range(p, len(seri) - h + 1)])\n        y = np.array([seri[t + h - 1] for t in range(p, len(seri) - h + 1)])\n        modeller.append(LinearRegression().fit(X, y))\n    return modeller\n\n\ndef dogrudan_tahmin(modeller, gecmis, p):\n    girdi = np.asarray(gecmis, dtype=float)[-p:].reshape(1, -1)\n    return np.array([float(m.predict(girdi)[0]) for m in modeller])\n',
      tests: 's = np.arange(1.0, 21.0)\nms = dogrudan_egit(s, 3, 4)\nassert len(ms) == 4, "H=4 model"\nassert ms[0].n_features_in_ == 3, "Her model p=3 girdi almalı"\nassert np.allclose(dogrudan_tahmin(ms, s, 3), [21, 22, 23, 24]), "Doğrusal artan seride sonraki 4 değer 21..24"\nrng = np.random.default_rng(0)\ngurultu = rng.normal(0, 1, 400)\nx = np.zeros(400)\nfor i in range(1, 400):\n    x[i] = 0.8 * x[i - 1] + gurultu[i]\nms2 = dogrudan_egit(x[:390], 1, 3)\negim = [round(float(m.coef_[0]), 1) for m in ms2]\nassert egim == [0.8, 0.6, 0.5], f"AR(1) sürecinde h adımlık katsayı yaklaşık 0.8^h olmalı; gelen {egim}"\n',
      hints: [
        'Her h için X ve y\'yi ayrı kur: t aralığı range(p, len(seri) - h + 1)',
        'Hedef: seri[t + h - 1] (h=1 → bir sonraki değer)',
        'Tahmin girdisi: np.asarray(gecmis)[-p:].reshape(1, -1)'
      ],
      why: 'Doğrudan stratejide h=3 modeli "üç adım sonrasını" doğrudan öğrenir; kendi tahminlerini girdi olarak kullanmadığı için hata birikmez. AR(1) örneğinde katsayıların 0.8, 0.64, 0.51 diye sönmesi bunu gösterir: uzak ufukta geçmişin etkisi azalır. Bedeli H ayrı model ve ufuklar arası tutarsızlık olasılığıdır.'
    },
    {
      t: 'code',
      stage: 'Meydan okuma',
      id: 'zaman-serisi-tahmin-12',
      diff: 3,
      needs: ['pandas'],
      q: '<p><b>Backtest hatalarından tahmin aralığı.</b> <code>aralik_kapsami(seri)</code> fonksiyonunu yaz. Tahminci: haftalık mevsimsel naive (<code>ŷ_t = y_{t-168}</code>).</p><ol><li>Temmuz saatlerinde hata <code>e = y − ŷ</code>; <b>saat başına</b> (0–23) hatanın %10 ve %90 yüzdeliklerini hesapla.</li><li>Ağustos\'un her saatine kendi saatinin aralığını uygula: <code>[ŷ + q10, ŷ + q90]</code>.</li><li>Döndür: <code>{"kapsama": Ağustos gerçeklerinin aralık içinde kalma oranı, "ort_genislik": ortalama (q90 − q10)}</code>, 3 ve 2 basamak.</li></ol>',
      start: 'import numpy as np\nimport pandas as pd\nimport veri\n\nyol = veri.oku("pedal_izmir", "bk_trips", usecols=["started_at"], parse_dates=["started_at"])\nsaatlik = yol.set_index("started_at").resample("h").size()\nsaatlik = saatlik.reindex(pd.date_range("2024-06-01", "2024-08-31 23:00", freq="h"), fill_value=0).rename("talep")\n\n\ndef aralik_kapsami(seri):\n    pass\n',
      sol: 'import numpy as np\nimport pandas as pd\nimport veri\n\nyol = veri.oku("pedal_izmir", "bk_trips", usecols=["started_at"], parse_dates=["started_at"])\nsaatlik = yol.set_index("started_at").resample("h").size()\nsaatlik = saatlik.reindex(pd.date_range("2024-06-01", "2024-08-31 23:00", freq="h"), fill_value=0).rename("talep")\n\n\ndef aralik_kapsami(seri):\n    d = pd.DataFrame({"y": seri, "t": seri.shift(168)}).dropna()\n    d["e"] = d["y"] - d["t"]\n    d["saat"] = d.index.hour\n    tem, agu = d[d.index.month == 7], d[d.index.month == 8]\n    q = tem.groupby("saat")["e"].quantile([0.1, 0.9]).unstack()\n    alt = agu["t"] + agu["saat"].map(q[0.1])\n    ust = agu["t"] + agu["saat"].map(q[0.9])\n    kapsama = ((agu["y"] >= alt) & (agu["y"] <= ust)).mean()\n    genislik = (ust - alt).mean()\n    return {"kapsama": round(float(kapsama), 3), "ort_genislik": round(float(genislik), 2)}\n\n\nprint(aralik_kapsami(saatlik))\n',
      tests: 'r = aralik_kapsami(saatlik)\nassert set(r) == {"kapsama", "ort_genislik"}\nassert r == {"kapsama": 0.738, "ort_genislik": 9.79}, f"Sonuç tutmuyor: {r}"\nassert 0.7 <= r["kapsama"] <= 0.9, "%80\'lik aralık Ağustos\'ta %70-90 arası kapsamalı"\n',
      hints: [
        'Tahmin: seri.shift(168); hata: y - t',
        'Saat başına yüzdelik: tem.groupby("saat")["e"].quantile([0.1, 0.9]).unstack()',
        'Ağustos satırlarına map ile kendi saatinin q10/q90 değerini getir.'
      ],
      why: 'Hatanın dağılımı saate göre değişir: gece 3\'te hata ±1, akşam 18\'de ±20 olabilir. Saat başına yüzdelik, aralığı gece dar akşam geniş yapar (koşullu aralık). Aralığı bir dönemde (Temmuz) kurup başka bir dönemde (Ağustos) sınamak dürüst bir değerlendirmedir; burada %73.8 çıkıyor: hedefin (%80) biraz altında, yani Temmuz hataları Ağustos\'u hafifçe küçümsüyor; pratikte %85\'lik yüzdeliklerle aralığı biraz genişletirsin.'
    },
    {
      t: 'code',
      stage: 'Mini proje',
      id: 'zaman-serisi-tahmin-13',
      diff: 3,
      needs: ['pandas'],
      q: '<p><b>Pedal İzmir: gün öncesi saatlik talep tahmini.</b> Start kodu saatlik talebi hava ile birleştirir (<code>d</code>: <code>talep, temp_c, rain_mm</code>). Görevin:</p><ol><li><code>ozellikler(d)</code>: saat için one-hot (<code>pd.get_dummies(d.index.hour, prefix="s")</code>, float), <code>hs</code> (hafta sonu), <code>lag24</code>, <code>lag168</code>, <code>rain_mm</code>, <code>temp_c</code> sütunlu <code>X</code> ve hedef <code>y</code> döndürsün; lag yüzünden boş satırları ikisinden de at.</li><li><code>haftalik_backtest(X, y)</code>: kesimler 4, 11, 18, 25 Ağustos; her kesimde kesimden önceki tüm saatlerle <code>Ridge(alpha=1.0)</code> eğit, sonraki 7 günü (168 saat) tahmin et. Aynı saatler için haftalık mevsimsel naive (<code>lag168</code>) ile kıyasla.</li><li>Döndür: <code>{"ridge": ort_mae, "mevsimsel": ort_mae, "ridge_yagisli": mae, "mevsimsel_yagisli": mae}</code>. Ortalamalar 4 katın MAE ortalaması; "yağışlı" değerler tüm katlarda <code>rain_mm &gt; 0</code> olan saatlerin MAE\'si. 2 basamak.</li></ol>',
      start: 'import numpy as np\nimport pandas as pd\nimport veri\n\nyol = veri.oku("pedal_izmir", "bk_trips", usecols=["started_at"], parse_dates=["started_at"])\nsaatlik = yol.set_index("started_at").resample("h").size()\nsaatlik = saatlik.reindex(pd.date_range("2024-06-01", "2024-08-31 23:00", freq="h"), fill_value=0).rename("talep")\nfrom sklearn.linear_model import Ridge\n\nhava = veri.oku("pedal_izmir", "bk_weather", parse_dates=["obs_hour"]).set_index("obs_hour")\nd = saatlik.to_frame().join(hava[["temp_c", "rain_mm"]])\nKESIMLER = pd.to_datetime(["2024-08-04", "2024-08-11", "2024-08-18", "2024-08-25"])\n\n\ndef ozellikler(d):\n    # TODO\n    pass\n\n\ndef haftalik_backtest(X, y):\n    # TODO\n    return {}\n',
      sol: 'import numpy as np\nimport pandas as pd\nimport veri\n\nyol = veri.oku("pedal_izmir", "bk_trips", usecols=["started_at"], parse_dates=["started_at"])\nsaatlik = yol.set_index("started_at").resample("h").size()\nsaatlik = saatlik.reindex(pd.date_range("2024-06-01", "2024-08-31 23:00", freq="h"), fill_value=0).rename("talep")\nfrom sklearn.linear_model import Ridge\n\nhava = veri.oku("pedal_izmir", "bk_weather", parse_dates=["obs_hour"]).set_index("obs_hour")\nd = saatlik.to_frame().join(hava[["temp_c", "rain_mm"]])\nKESIMLER = pd.to_datetime(["2024-08-04", "2024-08-11", "2024-08-18", "2024-08-25"])\n\n\ndef ozellikler(d):\n    X = pd.get_dummies(d.index.hour, prefix="s").astype(float).set_index(d.index)\n    X["hs"] = (d.index.dayofweek >= 5).astype(int)\n    X["lag24"] = d["talep"].shift(24)\n    X["lag168"] = d["talep"].shift(168)\n    X["rain_mm"], X["temp_c"] = d["rain_mm"], d["temp_c"]\n    dolu = X.notna().all(axis=1)\n    return X[dolu], d["talep"][dolu]\n\n\ndef haftalik_backtest(X, y):\n    r_mae, m_mae, r_hata, m_hata, yagisli = [], [], [], [], []\n    for kes in KESIMLER:\n        egt = X.index < kes\n        tst = (X.index >= kes) & (X.index < kes + pd.Timedelta(days=7))\n        model = Ridge(alpha=1.0).fit(X[egt], y[egt])\n        e_r = np.abs(model.predict(X[tst]) - y[tst])\n        e_m = np.abs(X.loc[tst, "lag168"] - y[tst])\n        r_mae.append(e_r.mean())\n        m_mae.append(e_m.mean())\n        r_hata.extend(e_r)\n        m_hata.extend(e_m)\n        yagisli.extend(X.loc[tst, "rain_mm"] > 0)\n    yagisli = np.array(yagisli)\n    return {"ridge": round(float(np.mean(r_mae)), 2), "mevsimsel": round(float(np.mean(m_mae)), 2),\n            "ridge_yagisli": round(float(np.array(r_hata)[yagisli].mean()), 2),\n            "mevsimsel_yagisli": round(float(np.array(m_hata)[yagisli].mean()), 2)}\n\n\nX, y = ozellikler(d)\nprint(haftalik_backtest(X, y))\n',
      tests: 'X, y = ozellikler(d)\nassert len(X) == len(y) == 2040, f"İlk 168 saat düşmeli: 2040 satır; gelen {len(X)}"\nassert {"hs", "lag24", "lag168", "rain_mm", "temp_c", "s_0", "s_23"} <= set(X.columns), "Saat one-hot (s_0..s_23) ve diğer özellikler olmalı"\nassert X.isna().sum().sum() == 0, "X\'te boş kalmamalı"\nr = haftalik_backtest(X, y)\nassert r == {"ridge": 7.39, "mevsimsel": 7.88, "ridge_yagisli": 28.53, "mevsimsel_yagisli": 66.7}, f"Sonuç tutmuyor: {r}"\nassert r["ridge"] < r["mevsimsel"], "Hava bilgili Ridge ortalamada mevsimsel naive\'i yenmeli"\nassert r["ridge_yagisli"] < r["mevsimsel_yagisli"] / 2, "Yağışlı saatlerde fark çok büyük olmalı"\n',
      hints: [
        'Boş satırlar: dolu = X.notna().all(axis=1); return X[dolu], d["talep"][dolu]',
        'Kat maskeleri: egt = X.index &lt; kes; tst = (X.index &gt;= kes) &amp; (X.index &lt; kes + pd.Timedelta(days=7))',
        'Yağışlı saat maskesini her katta biriktir, sonda hata listelerine uygula.'
      ],
      why: 'Ortalama MAE\'de Ridge mevsimsel naive\'i ancak biraz yeniyor; çünkü bu veride haftalık desen çok güçlü. Asıl fark yağışlı saatlerde: geçen hafta güneşliyse naive yağmurlu saati tamamen kaçırıyor, Ridge yağış katsayısıyla düzeltiyor. Operasyon için en pahalı hatalar tam da bu saatlerdedir: ortalama metrik tek başına yanıltabilir, hata dilimlerine bak.'
    }
  ],
  faq: [
    {
      q: 'ETS mi, ARIMA mı, ML mi?',
      a: 'Tek seri ve az veri (birkaç yüz gözlem) varsa ETS ve SARIMAX güçlü ve yorumlanabilir başlangıçlardır. Çok sayıda ilişkili seri (istasyonlar, mağazalar) ve zengin dışsal değişken varsa lag özellikli gradient boosting genellikle kazanır. Karar her zaman aynı backtest üzerinde verilir; mevsimsel naive her karşılaştırmada yer alır.'
    },
    {
      q: 'Prophet kullanmalı mıyım?',
      a: 'Prophet tatil etkileri ve çoklu mevsimsellik için pratik bir arayüz sunar ve iş birimlerinin anlayacağı bileşen grafikleri üretir. Ama doğruluğu çoğu karşılaştırmada iyi ayarlanmış ETS ya da lag özellikli ML\'nin gerisindedir. Tarayıcıda çalışmaz; kendi bilgisayarında pip install prophet ile deneyebilirsin.'
    },
    {
      q: 'Tahmin ufkum çok uzunsa (3 ay) ne yapmalıyım?',
      a: 'Toplama seviyesini yükselt (saatlik yerine haftalık), mevsimsel ve trend bileşenlerine güven, aralıkları geniş raporla. Uzun ufukta lag özellikleri anlamını yitirir; takvim, tatil ve planlanmış olaylar (kampanya, okul açılışı) asıl bilgi kaynağıdır.'
    },
    {
      q: 'ARIMA parametrelerini (p, d, q) nasıl seçerim?',
      a: 'ADF ile durağanlığa bak (d), ACF/PACF grafiklerinden fikir al, sonra küçük bir ızgarada AIC\'yi karşılaştır. pmdarima.auto_arima bunu otomatik yapar. Son söz yine backtest\'indir: AIC eğitim uyumunu ölçer, tahmin başarısını değil.'
    },
    {
      q: 'Saat dilimi ve yaz saati sorun olur mu?',
      a: 'Türkiye 2016\'dan beri yaz saati uygulamıyor, ama Avrupa verisinde yılda iki gün 23 ve 25 saatlik olur. Seriyi UTC\'de tut, özellikleri (saat, gün) yerel saate çevirerek üret. Bu ayrıntılar pandas-zaman-serisi dersinde.'
    }
  ],
  mistakes: [
    {
      bad: 'X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2)',
      good: 'X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, shuffle=False)',
      why: 'Varsayılan karıştırma geleceği eğitime sokar; zaman serisinde bölme kronolojik olmalı.'
    },
    {
      bad: 'df["ort24"] = df["talep"].rolling(24).mean()  # gün öncesi tahmin',
      good: 'df["ort24"] = df["talep"].shift(24).rolling(24).mean()',
      why: 'Gün öncesi tahminde son 24 saat bilinmez; pencere en az ufuk kadar geriye kaydırılmalı.'
    },
    {
      bad: 'mape = np.mean(np.abs(y - t) / y)',
      good: 'wape = np.sum(np.abs(y - t)) / np.sum(np.abs(y))',
      why: 'Sıfır içeren seride MAPE sonsuz olur; WAPE ya da MASE kullan.'
    },
    {
      bad: 's = df.set_index("zaman").resample("h").size()  # boş saatler?',
      good: 's = s.reindex(pd.date_range(bas, son, freq="h"), fill_value=0)',
      why: 'Dönem başı ve sonundaki boş saatler kaybolur; açık takvime reindex et ki lag\'ler doğru saate denk gelsin.'
    },
    {
      bad: 'pencere.append(gercek[h])  # özyinelemeli tahminde',
      good: 'pencere.append(tahmin)',
      why: 'Gerçek değerleri geri beslemek çok adımlı hatayı gizler; canlıda gelecek değer yoktur.'
    }
  ]
});
})(window);
