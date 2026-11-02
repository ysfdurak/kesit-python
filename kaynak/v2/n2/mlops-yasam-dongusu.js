/* Kesit Python — ileri: mlops-yasam-dongusu */
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push({
  id: 'mlops-yasam-dongusu',
  lv: 'ileri',
  mod: 'Üretime Hazırlık',
  min: 60,
  needs: ['pandas', 'numpy', 'scikit-learn', 'scipy', 'pydantic'],
  title: 'MLOps: deney takibi, model kaydı, servisleme ve izleme',
  sum: 'ML yaşam döngüsü ve olgunluk seviyeleri, mini DeneyKaydi ile deney takibi (MLflow gösterimi), model kayıt defteri ve aşamalar, hash ile veri sürümleme (DVC), toplu ve çevrim içi servisleme (FastAPI + pydantic), PSI/KS ile kayma izleme, yeniden eğitim tetikleyicileri, shadow ve canary, davranış testleri ve kalite kapısı.',
  goals: [
    'ML yaşam döngüsünü ve olgunluk seviyelerini anlatıp bir ekibin nerede durduğunu değerlendirebilirim',
    'Deneyleri parametre, metrik ve artefaktla kaydedip en iyi koşuyu seçebilir, modeli kayıt defterinde aşamalarla yönetebilirim',
    'Veriyi içerik özetiyle sürümleyebilir ve servis girdisini pydantic şemasıyla doğrulayabilirim',
    'PSI ve KS testiyle veri kaymasını ölçüp tahmin dağılımı ve performansla birlikte yorumlayabilirim',
    'Davranış testleri, kalite kapısı ve canary yönlendirmeyle güvenli yayın kurgulayabilirim'
  ],
  body: `<h2>Model eğitmek işin yarısı bile değil</h2>
<p>Pedal İzmir veri ekibi Haziran verisiyle saatlik bisiklet talebini tahmin eden bir model eğitti; doğrulama MAE'si iyi, herkes memnun. Temmuz'da İzmir'i sıcak hava dalgası vuruyor. Model hiç görmediği sıcaklıklarla karşılaşıyor ve tahminleri sistematik olarak yukarı kayıyor; istasyonlara gereğinden çok bisiklet taşınıyor. Kimse fark etmiyor çünkü kimse izlemiyor. Üstelik "hangi model canlıda, hangi veriyle, hangi parametrelerle eğitildi?" sorusunun cevabı bir not defterinin 47. hücresinde.</p>
<p><b>MLOps</b>, makine öğrenmesi modellerini tekrarlanabilir biçimde eğitmek, sürümlemek, yayına almak ve canlıda izlemek için kullanılan uygulamalar bütünüdür. Bu derste yaşam döngüsünün her adımını tarayıcıda çalışan küçük araçlarla (JSON tabanlı deney kaydı, model kayıt defteri, PSI/KS kayma testleri, pydantic şema doğrulama) kuracak, gerçek araçların (MLflow, DVC, FastAPI) kodunu da göreceksin. <code>ml-pipeline-degerlendirme</code> dersinde modeli joblib ile kaydetmeyi, <code>docker-deploy</code> dersinde kapsayıcıyı gördün; burada bunları birbirine bağlıyoruz.</p>

<h2>Yaşam döngüsü ve olgunluk seviyeleri</h2>
<p>Bir ML sistemi şu döngüden geçer: problem tanımı → veri toplama ve sürümleme → özellik üretimi → deney ve eğitim → değerlendirme ve kalite kapısı → kayıt ve yayın → servisleme → izleme → (tetiklenirse) yeniden eğitim. Ekiplerin bu döngüyü ne kadar otomatik yürüttüğü <b>olgunluk seviyesi</b> olarak anılır:</p>
<div class="tbl-wrap"><table>
<tr><th>Seviye</th><th>Nasıl görünür?</th><th>Tipik sorun</th></tr>
<tr><td>0: El ile</td><td>Not defterinde eğitim, model dosyası e-postayla gider, yayın elle</td><td>Kimse modeli yeniden üretemez</td></tr>
<tr><td>1: Otomatik eğitim hattı</td><td>Eğitim bir hat (pipeline) olarak koşar, deneyler kaydedilir, model kayıt defterinde</td><td>Hattın kendisi elle test edilir</td></tr>
<tr><td>2: CI/CD + sürekli eğitim</td><td>Kod ve veri değişince test, eğitim, kalite kapısı ve kademeli yayın otomatik</td><td>Kurulum maliyeti, disiplin ister</td></tr>
</table></div>
<p>Çoğu ekip için hedef seviye 1'dir: her eğitim tekrarlanabilir, her canlı modelin kökeni bellidir.</p>

<h2>Deney takibi: parametre, metrik, artefakt</h2>
<p>Her eğitim koşusu (run) üç şey üretir: <b>parametreler</b> (alpha=1.0, özellik listesi, veri sürümü), <b>metrikler</b> (doğrulama MAE'si) ve <b>artefaktlar</b> (model dosyası, grafik, özellik önemi tablosu). Bunları elle bir tabloya yazmak yerine bir izleme aracı kullanırsın. Endüstri standardı MLflow'dur:</p>
<pre class="code">import mlflow
from sklearn.linear_model import Ridge

mlflow.set_experiment("pedal-talep")
with mlflow.start_run(run_name="ridge-a1"):
    mlflow.log_params({"alpha": 1.0, "veri_surumu": "a3f9c2"})
    model = Ridge(alpha=1.0).fit(X_tr, y_tr)
    mlflow.log_metric("mae_dogrulama", 15.27)
    mlflow.sklearn.log_model(model, "model", input_example=X_tr.head(2))
</pre>
<div class="note"><b>Kendi bilgisayarında dene</b><code>pip install mlflow</code> kur, kodu çalıştır, sonra terminalde <code>mlflow ui</code> yaz ve tarayıcıda <code>http://127.0.0.1:5000</code> adresini aç. Koşuları yan yana karşılaştırabilir, metrik grafiği çizebilirsin. MLflow tarayıcıda (Pyodide) çalışmaz; aşağıdaki mini sürüm aynı fikri gösterir.</div>
<pre class="py">import json, time

class DeneyKaydi:
    def __init__(self, ad):
        self.ad, self.kosular = ad, []

    def baslat(self, params):
        kosu = {"id": f"kosu-{len(self.kosular) + 1}", "params": dict(params), "metrikler": {}}
        self.kosular.append(kosu)
        return kosu["id"]

    def metrik(self, kosu_id, ad, deger):
        next(k for k in self.kosular if k["id"] == kosu_id)["metrikler"][ad] = deger

    def en_iyi(self, metrik, buyuk_iyi=False):
        adaylar = [k for k in self.kosular if metrik in k["metrikler"]]
        return (max if buyuk_iyi else min)(adaylar, key=lambda k: k["metrikler"][metrik])

kayit = DeneyKaydi("pedal-talep")
for alpha, mae in [(0.1, 15.9), (1.0, 15.3), (10.0, 16.4)]:
    kid = kayit.baslat({"alpha": alpha})
    kayit.metrik(kid, "mae", mae)
print(kayit.en_iyi("mae"))
print(json.dumps(kayit.kosular[0], ensure_ascii=False))
</pre>

<h2>Model kayıt defteri, aşamalar ve imza</h2>
<p>Deney takibi "ne denedik?" sorusunu, <b>model kayıt defteri</b> (model registry) "canlıda ne var?" sorusunu cevaplar. Her kayıtlı model bir ad ve artan sürüm numarası taşır; her sürümün bir aşaması (stage) vardır: <code>None → Staging → Production → Archived</code>. Yeni bir sürüm Production'a alındığında eskisi otomatik Archived olur; geri dönmek (rollback) bir aşama değişikliğinden ibarettir. MLflow'un yeni sürümleri aşamalar yerine <b>takma ad</b> (alias, ör. <code>champion</code>, <code>challenger</code>) önerir; fikir aynıdır.</p>
<p><b>Model imzası</b> (signature) modelin beklediği girdi sütunlarını, türlerini ve çıktısını kaydeder. Servis tarafı gelen isteği bu imzayla karşılaştırır; sütun sırası ya da türü kayarsa model sessizce yanlış tahmin üretmek yerine açık bir hata verir. Bu, <b>eğitim-servis çarpıklığına</b> (training-serving skew) karşı ilk savunma hattıdır.</p>

<h2>Veri ve model sürümleme</h2>
<p>"Bu model hangi veriyle eğitildi?" sorusunun tek güvenilir cevabı verinin <b>içerik özetidir</b> (hash). DVC (Data Version Control) büyük veri dosyalarını Git dışında (S3, disk) tutar ve Git'e yalnız dosyanın MD5 özetini içeren küçük bir <code>.dvc</code> dosyası koyar. Kod commit'i ile veri özeti birlikte bir modeli tam olarak yeniden üretmeye yeter.</p>
<pre class="py">import hashlib
import veri

def parmak_izi(yol, n=12):
    h = hashlib.sha256()
    with open(yol, "rb") as f:
        for parca in iter(lambda: f.read(65536), b""):
            h.update(parca)
    return h.hexdigest()[:n]

for tablo in ["bk_weather", "bk_stations"]:
    print(tablo, parmak_izi(veri.yol("pedal_izmir", tablo)))
</pre>
<pre class="code">dvc init
dvc add data/bk_trips.csv          # data/bk_trips.csv.dvc oluşur (md5 + boyut)
git add data/bk_trips.csv.dvc .gitignore
git commit -m "veri: Haziran-Ağustos yolculukları"
dvc push                           # dosyayı uzak depoya (S3, GCS, disk) gönderir
</pre>

<h2>Servisleme: toplu mu, çevrim içi mi?</h2>
<div class="tbl-wrap"><table>
<tr><th></th><th>Toplu (batch)</th><th>Çevrim içi (online)</th></tr>
<tr><td>Ne zaman?</td><td>Tahmin önceden hesaplanabiliyorsa: gece tüm müşterileri skorla</td><td>Tahmin istek anında gerekiyorsa: kurye varış süresi</td></tr>
<tr><td>Gecikme</td><td>Dakikalar-saatler, sorun değil</td><td>Milisaniyeler (p95 &lt; 100 ms gibi)</td></tr>
<tr><td>Altyapı</td><td>Zamanlanmış iş (cron, Airflow), sonuç tabloya yazılır</td><td>API (FastAPI), kapsayıcı, ölçekleme</td></tr>
<tr><td>Risk</td><td>Bayat tahmin</td><td>Kesinti, gecikme, şema hatası</td></tr>
</table></div>
<pre class="code">from fastapi import FastAPI
from pydantic import BaseModel, Field
import joblib, pandas as pd

app = FastAPI()
model = joblib.load("model_v3.joblib")            # süreç başında bir kez yükle
OZELLIKLER = ["saat", "haftasonu", "temp_c", "rain_mm", "wind_kmh"]

class TalepIstegi(BaseModel):
    saat: int = Field(ge=0, le=23)
    haftasonu: bool
    temp_c: float = Field(ge=-15, le=50)
    rain_mm: float = Field(ge=0)
    wind_kmh: float = Field(ge=0)

@app.post("/predict")
def predict(istek: TalepIstegi):
    satir = pd.DataFrame([istek.model_dump()])[OZELLIKLER]   # sıra imzadan
    return {"talep": float(model.predict(satir)[0]), "model_surumu": "v3"}
</pre>
<div class="note"><b>Kendi bilgisayarında dene</b><code>pip install fastapi uvicorn joblib scikit-learn</code>, dosyayı <code>servis.py</code> olarak kaydet, <code>uvicorn servis:app --reload</code> ile başlat ve <code>http://127.0.0.1:8000/docs</code> adresinden isteği dene. Şema doğrulama pydantic ile yapılır ve pydantic tarayıcıda da çalışır:</div>
<pre class="py">from pydantic import BaseModel, Field, ValidationError

class TalepIstegi(BaseModel):
    saat: int = Field(ge=0, le=23)
    temp_c: float = Field(ge=-15, le=50)

print(TalepIstegi(saat=8, temp_c=31.5))
try:
    TalepIstegi(saat=26, temp_c="sıcak")
except ValidationError as e:
    print(e.error_count(), "hata:", [h["loc"][0] for h in e.errors()])
</pre>

<h2>İzleme: veri kayması, tahmin dağılımı, gecikmeli etiket</h2>
<p>Canlı model üç katmanda izlenir:</p>
<ol>
<li><b>Girdi (veri) kayması</b> (data drift): özelliklerin dağılımı değişti mi? Ölçüler: <b>PSI</b> (Population Stability Index) ve <b>KS testi</b> (Kolmogorov-Smirnov).</li>
<li><b>Tahmin dağılımı:</b> modelin çıktısı kaydı mı? Etiket gelmeden bile görülebilir; en erken alarmdır.</li>
<li><b>Performans:</b> gerçek etiketler geldiğinde (bisiklette bir saat sonra, kredide aylar sonra: <b>gecikmeli etiket</b>) MAE, AUC gibi metrikleri yeniden hesapla.</li>
</ol>
<p>Bir de <b>kavram kayması</b> (concept drift) var: girdiler aynı kalsa bile girdi ile hedef arasındaki ilişki değişir (ör. yeni bir metro hattı açılınca aynı saatte talep düşer). Bunu yalnız performans izlemesi yakalar.</p>
<p>PSI, referans dağılımı kovalara (genellikle referansın 10 yüzdelik dilimi) böler ve her kovada referans oranı <i>r</i> ile güncel oran <i>g</i> için <code>Σ (g − r) · ln(g / r)</code> toplar. Yaygın yorum: <b>&lt; 0.1</b> kararlı, <b>0.1–0.25</b> orta kayma (incele), <b>&gt; 0.25</b> büyük kayma (aksiyon). Boş kovada ln(0) patlamasın diye oranlar küçük bir değerle (1e-4) alttan kırpılır.</p>
<pre class="py">import numpy as np
import pandas as pd
from scipy.stats import ks_2samp

hava = veri.oku("pedal_izmir", "bk_weather", parse_dates=["obs_hour"])
haziran = hava[hava["obs_hour"].dt.month == 6]["temp_c"]
temmuz = hava[hava["obs_hour"].dt.month == 7]["temp_c"]
agustos = hava[hava["obs_hour"].dt.month == 8]["temp_c"]

def psi(ref, guncel, kova=10):
    sinir = np.unique(np.quantile(ref, np.linspace(0, 1, kova + 1)))
    sinir[0], sinir[-1] = -np.inf, np.inf
    r = np.histogram(ref, sinir)[0] / len(ref)
    g = np.histogram(guncel, sinir)[0] / len(guncel)
    r, g = np.clip(r, 1e-4, None), np.clip(g, 1e-4, None)
    return float(np.sum((g - r) * np.log(g / r)))

for ad, ay in [("Temmuz", temmuz), ("Ağustos", agustos)]:
    ks = ks_2samp(haziran, ay)
    print(f"{ad}: PSI={psi(haziran, ay):.3f}  KS={ks.statistic:.3f}  p={ks.pvalue:.4f}")
</pre>
<p>Temmuz'da sıcaklık PSI'ı 1.35: büyük bir kayma. Ağustos'ta hava normale döndüğü için PSI 0.02. KS istatistiği (0.24) daha ılımlı görünüyor; çünkü PSI, Haziran'ın serin gecelerine ait kovaların Temmuz'da <b>boş</b> kalmasını ağır cezalandırır (kırpılan 1e-4 oranının logu çok büyüktür). İki ölçüyü birlikte okumak bu yüzden faydalıdır. KS testi de aynı şeyi söyler; ama dikkat: binlerce satırda KS p-değeri en küçük farkta bile 0'a iner. Bu yüzden üretimde p-değerinden çok <b>etki büyüklüğüne</b> (KS istatistiği, PSI) ve iş eşiğine bakılır.</p>
<div class="warn"><b>Kayma alarmı ≠ model bozuldu</b>Girdi kayması bir uyarıdır, kendi başına yeniden eğitim gerekçesi değildir. Mini projede göreceksin: Temmuz'daki sıcaklık kayması doğrusal modelin tahminlerini yukarı itiyor (yanlılık), ama MAE neredeyse aynı kalıyor. Karar verirken kayma + tahmin dağılımı + performans birlikte okunur.</div>

<h2>Yeniden eğitim ve güvenli yayın</h2>
<p><b>Yeniden eğitim tetikleyicileri:</b> takvim (her pazartesi), veri hacmi (son eğitimden beri 50 bin yeni etiket), kayma (PSI &gt; 0.25 üç gün üst üste) ya da performans (MAE referansın %20 üstünde iki gün). Tek günlük sıçramaya tepki vermemek için "ardışık gün" kuralı kullanılır.</p>
<p><b>Güvenli yayın kalıpları:</b> <b>shadow</b> (gölge) modda yeni model gerçek trafiği alır, tahminini kaydeder ama kullanıcıya eski modelin cevabı döner; risksiz karşılaştırma yapılır. <b>Canary</b> (kanarya) modda kullanıcıların küçük bir yüzdesi (%5) yeni modele yönlendirilir; metrikler iyiyse oran artırılır. Kullanıcı kimliğinin hash'iyle yönlendirmek, aynı kullanıcının hep aynı modeli görmesini sağlar. <b>A/B testi</b> ise iş metriğindeki farkı istatistiksel olarak ölçer (<code>istatistik</code> dersi).</p>

<h2>ML için CI: davranış testleri ve kalite kapıları</h2>
<p>Klasik birim testleri kodu sınar; model için ek olarak <b>davranış testleri</b> yazılır:</p>
<ul>
<li><b>Yön testi</b> (directional): yağış artınca talep tahmini düşmeli.</li>
<li><b>Değişmezlik testi</b> (invariance): kullanıcının adı ya da cinsiyeti değişince kredi skoru değişmemeli.</li>
<li><b>Minimum işlev testi:</b> bilinen basit örneklerde beklenen sonuç (sabah 8'de hafta içi talep gece 3'ten yüksek).</li>
</ul>
<p><b>Kalite kapısı</b> (quality gate) CI hattında yeni modeli canlıdakiyle karşılaştırır ve kurallar sağlanmazsa yayını durdurur: "aday MAE'si mevcut MAE'den en fazla %2 kötü olabilir", "p95 gecikme 50 ms altında", "model dosyası 100 MB altında".</p>
<pre class="py">from sklearn.linear_model import Ridge

hava["talep_ornek"] = 20 + 0.9 * hava["temp_c"] - 13 * hava["rain_mm"]
model = Ridge().fit(hava[["temp_c", "rain_mm"]], hava["talep_ornek"])
X = hava[["temp_c", "rain_mm"]].head(200)
yagisli = X.assign(rain_mm=X["rain_mm"] + 2)
oran = (model.predict(yagisli) &lt; model.predict(X)).mean()
print("Yağış artınca talep düşen satır oranı:", oran)
assert oran == 1.0, "yön testi başarısız"
</pre>
<div class="note"><b>Gerçek işte</b>Bankalarda bir kredi modeli canlıya çıkmadan önce model risk yönetimi birimi "model kartı", doğrulama raporu, imza ve veri özeti ister; canlıda aylık PSI raporu düzenleyici denetimin parçasıdır. E-ticaret ve teslimat şirketlerinde ise öneri ve ETA modelleri genellikle önce shadow, sonra %5 canary ile yayınlanır; geri dönüş bir kayıt defteri aşama değişikliğiyle dakikalar içinde yapılır.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Özellik deposu ve çarpıklık</h3>
<p>Eğitimde özellik SQL ile toplu, canlıda Python ile anlık hesaplanırsa iki kod zamanla ayrışır. Özellik deposu (Feast, Tecton) tek tanımdan hem çevrim dışı (eğitim) hem çevrim içi (servis) değer üretir ve "o tarihte bilinen değer" (point-in-time) birleştirmesini garanti eder.</p>
<h3>İzleme araçları</h3>
<p>Evidently ve NannyML kayma ve performans raporlarını hazır üretir; NannyML etiket gelmeden performansı tahmin etmeye çalışır (CBPE). Prometheus + Grafana gecikme ve hata oranını, model metrikleriyle aynı panoda gösterir (<code>gozlemlenebilirlik</code> dersi).</p>
<h3>Mülakat cümlesi</h3>
<p>"Modeli canlıya almadan önce kökenini (kod commit'i, veri özeti, parametreler) kayıt defterine yazarım, şemayı pydantic ile doğrularım, shadow ile karşılaştırır, canary ile açarım. Canlıda girdi PSI'ı, tahmin dağılımı ve gecikmeli etiketle performansı izlerim; yeniden eğitimi ardışık gün kuralıyla tetiklerim."</p>
</section>`,
  ex: [
    {
      t: 'mc',
      stage: 'Isınma',
      q: 'Pedal İzmir talep modelinde Temmuz\'da sıcaklık dağılımı belirgin biçimde ısındı, ama aynı sıcaklıkta insanların bisiklet kullanma alışkanlığı değişmedi. Bu hangi kaymadır?',
      o: [
        'Kavram kayması: hedef ile girdi arasındaki ilişki değişti',
        'Etiket kayması: hedefin tanımı değişti',
        'Veri (girdi) kayması: özelliklerin dağılımı değişti',
        'Kayma yoktur; mevsimsellik kayma sayılmaz'
      ],
      a: 2,
      why: 'Girdi dağılımı (P(X)) değişti, ilişki (P(y|X)) aynı: bu veri ya da kovaryat kaymasıdır. Kavram kaymasında aynı girdi farklı hedefe götürür. Mevsimsellik de kaymadır; model o mevsimi eğitimde görmediyse risklidir.'
    },
    {
      t: 'mc',
      stage: 'Isınma',
      q: 'Haftalık izleme raporunda bir özelliğin PSI değeri 0.31 çıktı. En uygun yorum hangisi?',
      o: [
        'Kararlı; 1\'in altındaki her PSI normaldir',
        'Büyük kayma; nedenini incele, gerekirse yeniden eğitimi değerlendir',
        'Model kesin bozulmuştur; önceki sürüme hemen geri dönülmeli ve trafik kesilmeli',
        'PSI yalnız hedef değişken için anlamlıdır'
      ],
      a: 1,
      why: 'Yaygın eşikler: 0.1 altı kararlı, 0.1–0.25 orta, 0.25 üstü büyük kayma. Büyük kayma inceleme ve aksiyon gerektirir ama performans düşüşünün kanıtı değildir; geri alma kararı performans metrikleriyle verilir.'
    },
    {
      t: 'mc',
      stage: 'Isınma',
      q: 'Yeni ETA modeli tüm gerçek istekleri alıyor ve tahminini kaydediyor, ama kullanıcıya hâlâ eski modelin cevabı dönüyor. Bu yayın kalıbının adı nedir?',
      o: ['Canary yayını', 'A/B testi', 'Mavi-yeşil yayın', 'Shadow (gölge) yayın'],
      a: 3,
      why: 'Shadow modda yeni model kullanıcıyı etkilemeden gerçek trafikle sınanır. Canary\'de kullanıcıların küçük bir kısmı yeni modelin cevabını gerçekten görür; A/B testi iş metriği farkını ölçer; mavi-yeşil iki ortam arasında tüm trafiği bir anda çevirir.'
    },
    {
      t: 'predict',
      stage: 'Kodu oku',
      q: 'Deney kaydından en iyi koşuyu seçen kod ne yazdırır?',
      code: 'kosular = [\n    {"id": "a1", "params": {"alpha": 0.1}, "mae": 15.9},\n    {"id": "a2", "params": {"alpha": 1.0}, "mae": 15.3},\n    {"id": "a3", "params": {"alpha": 10.0}, "mae": 16.4},\n]\nen_iyi = min(kosular, key=lambda k: k["mae"])\nprint(en_iyi["id"], en_iyi["params"]["alpha"])\nprint([k["id"] for k in kosular if k["mae"] < 16])\n',
      o: ['a3 10.0\n[\'a1\', \'a2\']', 'a2 1.0\n[\'a1\', \'a2\']', 'a2 1.0\n[\'a2\']', 'a1 0.1\n[\'a1\', \'a2\']'],
      a: 1,
      why: 'MAE bir hatadır: küçük olan iyidir, bu yüzden min kullanılır ve a2 (15.3) seçilir. 16\'nın altındaki iki koşu a1 (15.9) ve a2\'dir. max kullansaydın en kötü koşu (a3) seçilirdi: deney karşılaştırmasında sık yapılan hata.'
    },
    {
      t: 'predict',
      stage: 'Kodu oku',
      q: 'İki kovalı PSI hesabı ne yazdırır?',
      code: 'import numpy as np\n\nref = np.array([0.5, 0.5])\nguncel = np.array([0.25, 0.75])\npsi = np.sum((guncel - ref) * np.log(guncel / ref))\nprint(round(float(psi), 3))\n',
      o: ['0.275', '0.5', '-0.275', '0.0'],
      a: 0,
      why: 'Birinci kova: (0.25−0.5)·ln(0.5) = 0.173; ikinci: (0.75−0.5)·ln(1.5) = 0.101. Toplam 0.275. PSI her zaman sıfır ya da pozitiftir: fark ile log oranı aynı işaretlidir. 0.25 eşiğinin hemen üstü: büyük kayma.'
    },
    {
      t: 'predict',
      stage: 'Kodu oku',
      q: 'Model kayıt defterinde terfi sonrası ne yazdırılır?',
      code: 'kayit = {1: "Archived", 2: "Production", 3: "Staging"}\n\ndef terfi(kayit, surum):\n    for s, asama in kayit.items():\n        if asama == "Production":\n            kayit[s] = "Archived"\n    kayit[surum] = "Production"\n\nterfi(kayit, 3)\nprint(kayit)\nprint([s for s, a in kayit.items() if a == "Production"])\n',
      o: [
        '{1: \'Archived\', 2: \'Production\', 3: \'Production\'}\n[2, 3]',
        '{1: \'Archived\', 2: \'Staging\', 3: \'Production\'}\n[3]',
        '{1: \'Archived\', 2: \'Archived\', 3: \'Production\'}\n[3]',
        '{1: \'Archived\', 2: \'Archived\', 3: \'Staging\'}\n[]'
      ],
      a: 2,
      why: 'Terfi önce mevcut Production sürümünü (2) arşivler, sonra 3\'ü Production yapar. Aynı anda tek bir Production sürümü olur. Sözlük döngüde değiştiriliyor ama yalnız değerler değiştiği (anahtar eklenip silinmediği) için güvenlidir.'
    },
    {
      t: 'order',
      stage: 'Kodu oku',
      q: '<p>pydantic ile servis isteğini doğrulayan ve hatalı istekte hata sayısı ile ilk hatalı alanın adını yazdıran programın satırlarını sırala. (Alanların tanım sırası çıktıyı belirler.)</p>',
      lines: [
        'from pydantic import BaseModel, Field, ValidationError',
        'class Istek(BaseModel):',
        '    saat: int = Field(ge=0, le=23)',
        '    sicaklik: float',
        'try:',
        '    Istek(saat=25, sicaklik="sıcak")',
        'except ValidationError as e:',
        '    print(e.error_count(), e.errors()[0]["loc"][0])'
      ],
      expect: '2 saat',
      hint: 'Önce içe aktarma ve sınıf; alan sırası: saat, sonra sicaklik (çıktıdaki ilk hata saat). Ardından try/except.',
      why: 'pydantic tüm alanları doğrular ve hataların hepsini toplar; ilk hatayı bulunca durmaz. Hatalar alanların tanım sırasıyla gelir. FastAPI aynı hatayı 422 yanıtı olarak döndürür.'
    },
    {
      t: 'code',
      stage: 'Rehberli',
      id: 'mlops-yasam-dongusu-1',
      diff: 2,
      q: '<p>Tarayıcıda çalışan mini bir MLflow yaz: <code>DeneyKaydi</code> sınıfı.</p><ul><li><code>__init__(self, ad)</code>: <code>self.ad</code>, boş <code>self.kosular</code> listesi.</li><li><code>baslat(params)</code>: <code>{"id": "kosu-N", "params": ..., "metrikler": {}}</code> sözlüğünü listeye ekleyip id\'yi döndürsün (N 1\'den başlar).</li><li><code>metrik(kosu_id, ad, deger)</code>: ilgili koşuya metriği yazsın.</li><li><code>en_iyi(metrik, buyuk_iyi=False)</code>: metriği olan koşular içinden en iyisini döndürsün.</li><li><code>kaydet(yol)</code>: <code>{"ad": ..., "kosular": [...]}</code> JSON\'unu dosyaya yazsın; <code>yukle(yol)</code> <b>sınıf metodu</b> dosyadan yeni bir <code>DeneyKaydi</code> kursun.</li></ul>',
      guide: [
        '__init__ ve baslat: id\'yi f"kosu-{len(self.kosular) + 1}" ile üret.',
        'metrik: next(k for k in self.kosular if k["id"] == kosu_id) ile koşuyu bul.',
        'en_iyi: önce metriği olanları süz, sonra (max if buyuk_iyi else min).',
        'kaydet: json.dump; yukle: @classmethod, cls(ad) kur ve kosular\'ı ata.'
      ],
      example: 'import json\n\n# Benzer teknik: sınıf metoduyla dosyadan nesne kurmak\nclass Ayar:\n    def __init__(self, ad, degerler=None):\n        self.ad, self.degerler = ad, degerler or {}\n    @classmethod\n    def yukle(cls, yol):\n        with open(yol, encoding="utf-8") as f:\n            d = json.load(f)\n        return cls(d["ad"], d["degerler"])\n\nwith open("ayar.json", "w", encoding="utf-8") as f:\n    json.dump({"ad": "test", "degerler": {"esik": 0.5}}, f)\nprint(Ayar.yukle("ayar.json").degerler)\n',
      start: 'import json\n\n\nclass DeneyKaydi:\n    def __init__(self, ad):\n        self.ad = ad\n        self.kosular = []\n\n    def baslat(self, params):\n        # TODO: koşu sözlüğünü ekle, id döndür\n        pass\n\n    def metrik(self, kosu_id, ad, deger):\n        # TODO\n        pass\n\n    def en_iyi(self, metrik, buyuk_iyi=False):\n        # TODO\n        pass\n\n    def kaydet(self, yol):\n        # TODO\n        pass\n\n    @classmethod\n    def yukle(cls, yol):\n        # TODO\n        pass\n',
      sol: 'import json\n\n\nclass DeneyKaydi:\n    def __init__(self, ad):\n        self.ad = ad\n        self.kosular = []\n\n    def baslat(self, params):\n        kosu = {"id": f"kosu-{len(self.kosular) + 1}", "params": dict(params), "metrikler": {}}\n        self.kosular.append(kosu)\n        return kosu["id"]\n\n    def metrik(self, kosu_id, ad, deger):\n        kosu = next(k for k in self.kosular if k["id"] == kosu_id)\n        kosu["metrikler"][ad] = deger\n\n    def en_iyi(self, metrik, buyuk_iyi=False):\n        adaylar = [k for k in self.kosular if metrik in k["metrikler"]]\n        sec = max if buyuk_iyi else min\n        return sec(adaylar, key=lambda k: k["metrikler"][metrik])\n\n    def kaydet(self, yol):\n        with open(yol, "w", encoding="utf-8") as f:\n            json.dump({"ad": self.ad, "kosular": self.kosular}, f, ensure_ascii=False)\n\n    @classmethod\n    def yukle(cls, yol):\n        with open(yol, encoding="utf-8") as f:\n            d = json.load(f)\n        k = cls(d["ad"])\n        k.kosular = d["kosular"]\n        return k\n',
      tests: 'from sklearn.datasets import make_regression\nfrom sklearn.linear_model import Ridge\nfrom sklearn.metrics import mean_absolute_error\nX, y = make_regression(n_samples=200, n_features=5, noise=20, random_state=0)\ndk = DeneyKaydi("ridge-deney")\nfor a in [0.1, 10.0, 1000.0]:\n    kid = dk.baslat({"alpha": a})\n    m = Ridge(alpha=a).fit(X[:150], y[:150])\n    dk.metrik(kid, "mae", round(float(mean_absolute_error(y[150:], m.predict(X[150:]))), 3))\n    dk.metrik(kid, "r2", round(float(m.score(X[150:], y[150:])), 3))\nassert [k["id"] for k in dk.kosular] == ["kosu-1", "kosu-2", "kosu-3"], "id\'ler kosu-1, kosu-2, kosu-3 olmalı"\nassert dk.en_iyi("mae")["params"]["alpha"] in (0.1, 10.0), "En düşük MAE küçük alpha\'lı koşulardan biri olmalı"\nassert dk.en_iyi("r2", buyuk_iyi=True)["id"] == dk.en_iyi("mae")["id"], "r2 için buyuk_iyi=True ile aynı koşu seçilmeli"\nassert dk.en_iyi("mae")["params"]["alpha"] != 1000.0, "MAE hatadır: min ile seç"\ndk.baslat({"alpha": 5.0})\nassert dk.en_iyi("mae") is not None, "Metriği olmayan koşu en_iyi\'yi bozmamalı (süz)"\ndk.kaydet("deneyler.json")\ny2 = DeneyKaydi.yukle("deneyler.json")\nassert isinstance(y2, DeneyKaydi) and y2.ad == "ridge-deney", "yukle bir DeneyKaydi döndürmeli"\nassert y2.kosular == dk.kosular, "Yüklenen koşular kaydedilenle aynı olmalı"\n',
      hints: [
        'baslat: kosu = {"id": f"kosu-{len(self.kosular) + 1}", "params": dict(params), "metrikler": {}}',
        'en_iyi: adaylar = [k for k in self.kosular if metrik in k["metrikler"]]',
        'yukle: @classmethod; d = json.load(f); k = cls(d["ad"]); k.kosular = d["kosular"]; return k'
      ],
      why: 'MLflow\'un özü budur: her koşuya kimlik, parametre, metrik; sonra sorgulanabilir kalıcı kayıt. Metriği olmayan (yarıda kalmış) koşuları süzmek gerçek hayatta önemlidir; çöken bir eğitim en_iyi sorgusunu bozmamalı. Sınıf metodu (classmethod) dosyadan nesne kurmanın standart yoludur.'
    },
    {
      t: 'code',
      stage: 'Rehberli',
      id: 'mlops-yasam-dongusu-2',
      diff: 1,
      q: '<p><b>Veri sürümü:</b> <code>parmak_izi(yol, n=12)</code> fonksiyonunu yaz: dosyayı ikili modda 64 KB\'lık parçalarla okuyup SHA-256 özetini hesaplasın ve onaltılık özetin ilk <code>n</code> karakterini döndürsün. Ardından <code>surum_kaydi(yollar)</code> yaz: <code>{dosya_adı: parmak_izi}</code> sözlüğü döndürsün (dosya adı: yolun son parçası, <code>os.path.basename</code>).</p>',
      guide: [
        'hashlib.sha256() nesnesi oluştur.',
        'open(yol, "rb") ile aç; iter(lambda: f.read(65536), b"") ile parça parça oku.',
        'Her parçayı h.update(parca) ile ekle; h.hexdigest()[:n] döndür.',
        'surum_kaydi: sözlük üreteci + os.path.basename.'
      ],
      example: 'import hashlib\n\n# Benzer teknik: metnin özeti (aynı içerik → aynı özet)\nprint(hashlib.sha256("Pedal İzmir".encode("utf-8")).hexdigest()[:12])\nprint(hashlib.sha256("Pedal izmir".encode("utf-8")).hexdigest()[:12])\n',
      start: 'import hashlib\nimport os\nimport veri\n\n\ndef parmak_izi(yol, n=12):\n    h = hashlib.sha256()\n    # TODO: dosyayı parça parça oku ve h\'yi güncelle\n    return h.hexdigest()[:n]\n\n\ndef surum_kaydi(yollar):\n    # TODO\n    return {}\n',
      sol: 'import hashlib\nimport os\nimport veri\n\n\ndef parmak_izi(yol, n=12):\n    h = hashlib.sha256()\n    with open(yol, "rb") as f:\n        for parca in iter(lambda: f.read(65536), b""):\n            h.update(parca)\n    return h.hexdigest()[:n]\n\n\ndef surum_kaydi(yollar):\n    return {os.path.basename(y): parmak_izi(y) for y in yollar}\n\n\nprint(surum_kaydi([veri.yol("pedal_izmir", "bk_stations"), veri.yol("pedal_izmir", "bk_weather")]))\n',
      tests: 'with open("a.csv", "w") as f:\n    f.write("x,y\\n1,2\\n")\nwith open("b.csv", "w") as f:\n    f.write("x,y\\n1,2\\n")\nassert parmak_izi("a.csv") == parmak_izi("b.csv"), "Aynı içerik aynı özeti vermeli (dosya adı önemsiz)"\nassert parmak_izi("a.csv") == hashlib.sha256(b"x,y\\n1,2\\n").hexdigest()[:12], "SHA-256 özetinin ilk 12 karakteri olmalı"\nwith open("b.csv", "w") as f:\n    f.write("x,y\\n1,3\\n")\nassert parmak_izi("a.csv") != parmak_izi("b.csv"), "Tek karakter değişince özet değişmeli"\nassert len(parmak_izi("a.csv", n=8)) == 8, "n parametresi uzunluğu belirlemeli"\nwith open(veri.yol("pedal_izmir", "bk_stations"), "rb") as f:\n    bek = hashlib.sha256(f.read()).hexdigest()[:12]\nr = surum_kaydi([veri.yol("pedal_izmir", "bk_stations"), "a.csv"])\nassert r == {"bk_stations.csv": bek, "a.csv": parmak_izi("a.csv")}, f"Anahtar dosya adı, değer özet olmalı; gelen {r}"\n',
      hints: [
        'Döngü: for parca in iter(lambda: f.read(65536), b""): h.update(parca)',
        'Dosyayı "rb" ile aç: özet baytlar üzerinden hesaplanır.',
        '{os.path.basename(y): parmak_izi(y) for y in yollar}'
      ],
      why: 'Parça parça okumak gigabaytlık dosyalarda belleği korur. İçerik özeti dosya adından ve tarihinden bağımsızdır: iki ekip aynı özeti görüyorsa aynı veriyi kullanıyordur. DVC aynı fikri MD5 ile uygular; özet Git\'e girer, veri uzak depoda durur.'
    },
    {
      t: 'code',
      stage: 'Rehberli',
      id: 'mlops-yasam-dongusu-3',
      diff: 2,
      needs: ['pandas'],
      q: '<p><code>psi(ref, guncel, kova=10)</code> fonksiyonunu yaz ve Pedal İzmir hava verisinde Haziran\'a göre Temmuz sıcaklık kaymasını ölç.</p><ul><li>Kova sınırları <b>referanstan</b>: <code>np.quantile(ref, np.linspace(0, 1, kova + 1))</code>, tekrarları <code>np.unique</code> ile at; ilk sınırı <code>-np.inf</code>, sonuncuyu <code>np.inf</code> yap.</li><li>Her iki dizide kova oranlarını <code>np.histogram</code> ile bul, oranları <code>1e-4</code> ile alttan kırp.</li><li><code>Σ (g − r) · ln(g / r)</code> değerini 4 basamakla <code>float</code> döndür.</li></ul>',
      guide: [
        'Sınırlar: np.unique(np.quantile(...)); uçları sonsuz yap ki aralık dışı değerler kaybolmasın.',
        'Oranlar: np.histogram(x, sinir)[0] / len(x).',
        'np.clip(oran, 1e-4, None) ile sıfırı engelle.',
        'round(float(np.sum(...)), 4) döndür.'
      ],
      example: 'import numpy as np\n\n# Benzer teknik: sabit sınırlarla kova oranları\nx = np.array([1, 2, 2, 3, 9])\nsinir = np.array([-np.inf, 2, 5, np.inf])\nprint(np.histogram(x, sinir)[0] / len(x))\n',
      start: 'import numpy as np\nimport veri\n\nhava = veri.oku("pedal_izmir", "bk_weather", parse_dates=["obs_hour"])\nhaziran = hava[hava["obs_hour"].dt.month == 6]["temp_c"].to_numpy()\ntemmuz = hava[hava["obs_hour"].dt.month == 7]["temp_c"].to_numpy()\n\n\ndef psi(ref, guncel, kova=10):\n    # TODO 1: referanstan sınırlar, uçlar sonsuz\n    # TODO 2: oranlar + kırpma\n    # TODO 3: PSI toplamı\n    return 0.0\n',
      sol: 'import numpy as np\nimport veri\n\nhava = veri.oku("pedal_izmir", "bk_weather", parse_dates=["obs_hour"])\nhaziran = hava[hava["obs_hour"].dt.month == 6]["temp_c"].to_numpy()\ntemmuz = hava[hava["obs_hour"].dt.month == 7]["temp_c"].to_numpy()\n\n\ndef psi(ref, guncel, kova=10):\n    sinir = np.unique(np.quantile(ref, np.linspace(0, 1, kova + 1)))\n    sinir[0], sinir[-1] = -np.inf, np.inf\n    r = np.histogram(ref, sinir)[0] / len(ref)\n    g = np.histogram(guncel, sinir)[0] / len(guncel)\n    r, g = np.clip(r, 1e-4, None), np.clip(g, 1e-4, None)\n    return round(float(np.sum((g - r) * np.log(g / r))), 4)\n\n\nprint(psi(haziran, temmuz))\n',
      tests: 'assert psi(haziran, haziran) == 0.0, "Aynı dağılımın PSI\'ı 0 olmalı"\np = psi(haziran, temmuz)\nassert abs(p - 1.354) < 0.001, f"Haziran→Temmuz sıcaklık PSI\'ı ~1.354 olmalı; gelen {p}"\nagu = hava[hava["obs_hour"].dt.month == 8]["temp_c"].to_numpy()\nassert abs(psi(haziran, agu) - 0.0198) < 0.001, "Ağustos\'ta hava normale döner: PSI ~0.0198"\nrng = np.random.default_rng(0)\na = rng.normal(0, 1, 5000)\nassert psi(a, a + 10) > 5, "Tüm değerler referans aralığının dışına çıkınca PSI çok büyük olmalı (uçları sonsuz yaptın mı?)"\nassert isinstance(p, float), "float döndür"\n',
      hints: [
        'sinir = np.unique(np.quantile(ref, np.linspace(0, 1, kova + 1))); sinir[0], sinir[-1] = -np.inf, np.inf',
        'r = np.histogram(ref, sinir)[0] / len(ref) (güncel için de aynısı)',
        'return round(float(np.sum((g - r) * np.log(g / r))), 4)'
      ],
      why: 'Sınırlar referanstan alınır çünkü soru "güncel veri referansa göre ne kadar farklı?". Uçları sonsuz yapmak, referansta görülmeyen rekor sıcaklıkların kovalardan dışarı taşıp kaybolmasını önler. Kırpma, boş kovadaki ln(0) patlamasını engeller. Temmuz\'un 1.35\'lik PSI\'ı gerçek bir sıcak hava dalgasıdır.'
    },
    {
      t: 'code',
      stage: 'Rehberli',
      id: 'mlops-yasam-dongusu-4',
      diff: 2,
      q: '<p>Mini bir <b>model kayıt defteri</b> yaz: <code>ModelKaydi</code>.</p><ul><li><code>kaydet(ad, model, metrikler)</code>: o ad için sürümü 1\'den başlayarak artır; <code>{"surum", "model", "metrikler", "asama": "None"}</code> kaydını sakla; sürüm numarasını döndür.</li><li><code>asama_degistir(ad, surum, asama)</code>: aşamayı değiştir. Yeni aşama <code>"Production"</code> ise o addaki önceki Production sürümü <code>"Archived"</code> olsun. Geçersiz aşamada (<code>None, Staging, Production, Archived</code> dışında) <code>ValueError</code> fırlat.</li><li><code>getir(ad, asama="Production")</code>: o aşamadaki kaydı döndür; yoksa <code>LookupError</code>.</li></ul>',
      guide: [
        'self.kayitlar = {} : ad → kayıt listesi.',
        'kaydet: surum = len(liste) + 1.',
        'asama_degistir: önce doğrula, Production ise diğerlerini arşivle, sonra hedef sürümü güncelle.',
        'getir: uygun kaydı ara; bulamazsan LookupError.'
      ],
      example: '# Benzer teknik: ad başına sürüm listesi\nkayit = {}\nfor ad in ["churn", "eta", "churn"]:\n    liste = kayit.setdefault(ad, [])\n    liste.append({"surum": len(liste) + 1})\nprint(kayit)\n',
      start: 'ASAMALAR = {"None", "Staging", "Production", "Archived"}\n\n\nclass ModelKaydi:\n    def __init__(self):\n        self.kayitlar = {}\n\n    def kaydet(self, ad, model, metrikler):\n        # TODO\n        pass\n\n    def asama_degistir(self, ad, surum, asama):\n        # TODO\n        pass\n\n    def getir(self, ad, asama="Production"):\n        # TODO\n        pass\n',
      sol: 'ASAMALAR = {"None", "Staging", "Production", "Archived"}\n\n\nclass ModelKaydi:\n    def __init__(self):\n        self.kayitlar = {}\n\n    def kaydet(self, ad, model, metrikler):\n        liste = self.kayitlar.setdefault(ad, [])\n        liste.append({"surum": len(liste) + 1, "model": model, "metrikler": dict(metrikler), "asama": "None"})\n        return len(liste)\n\n    def asama_degistir(self, ad, surum, asama):\n        if asama not in ASAMALAR:\n            raise ValueError(f"Geçersiz aşama: {asama}")\n        for k in self.kayitlar[ad]:\n            if asama == "Production" and k["asama"] == "Production":\n                k["asama"] = "Archived"\n        self.kayitlar[ad][surum - 1]["asama"] = asama\n\n    def getir(self, ad, asama="Production"):\n        for k in self.kayitlar.get(ad, []):\n            if k["asama"] == asama:\n                return k\n        raise LookupError(f"{ad} için {asama} aşamasında model yok")\n',
      tests: 'from sklearn.linear_model import Ridge\nimport numpy as np\nX = np.arange(20.0).reshape(10, 2); y = X.sum(axis=1)\nmk = ModelKaydi()\nassert mk.kaydet("talep", Ridge(alpha=1).fit(X, y), {"mae": 15.3}) == 1, "İlk sürüm 1"\nassert mk.kaydet("talep", Ridge(alpha=10).fit(X, y), {"mae": 14.9}) == 2, "İkinci sürüm 2"\nassert mk.kaydet("churn", Ridge().fit(X, y), {"auc": 0.8}) == 1, "Sürümler model adı başına ayrı sayılmalı"\ntry:\n    mk.getir("talep")\n    assert False, "Production yokken LookupError bekleniyordu"\nexcept LookupError:\n    pass\nmk.asama_degistir("talep", 1, "Production")\nassert mk.getir("talep")["surum"] == 1\nmk.asama_degistir("talep", 2, "Production")\nassert mk.getir("talep")["surum"] == 2, "Yeni Production sürüm 2"\nassert mk.kayitlar["talep"][0]["asama"] == "Archived", "Eski Production otomatik arşivlenmeli"\nassert mk.getir("talep")["model"].alpha == 10, "Kayıtta model nesnesi saklanmalı"\nassert mk.getir("churn", "None")["surum"] == 1, "Yeni kayıt None aşamasında başlar"\ntry:\n    mk.asama_degistir("talep", 1, "Canli")\n    assert False, "Geçersiz aşamada ValueError bekleniyordu"\nexcept ValueError:\n    pass\nmk.asama_degistir("talep", 1, "Production")\nassert [k["asama"] for k in mk.kayitlar["talep"]] == ["Production", "Archived"], "Geri alma (rollback): 1 yeniden Production, 2 Archived"\n',
      hints: [
        'liste = self.kayitlar.setdefault(ad, []) sonra append; sürüm = len(liste)',
        'asama_degistir içinde önce if asama not in ASAMALAR: raise ValueError(...)',
        'getir: for k in self.kayitlar.get(ad, []): if k["asama"] == asama: return k; döngü bitince raise LookupError'
      ],
      why: 'Kayıt defterinin değeri tek bir kuraldadır: aynı anda bir Production. Geri alma (rollback) yeni bir eğitim değil, bir aşama değişikliğidir; dakikalar sürer. MLflow\'da bu işlem MlflowClient().transition_model_version_stage ya da yeni sürümlerde set_registered_model_alias ile yapılır.'
    },
    {
      t: 'code',
      stage: 'Kendin yaz',
      id: 'mlops-yasam-dongusu-5',
      diff: 2,
      needs: ['pandas'],
      q: '<p><code>ks_raporu(ref, guncel, sutunlar, alfa=0.05)</code> fonksiyonunu yaz: her sütun için <code>scipy.stats.ks_2samp</code> uygulasın ve <code>{sutun: {"ks": istatistik (3 basamak), "p": p-değeri (4 basamak), "kayma": p &lt; alfa}}</code> sözlüğü döndürsün. <code>kayma</code> Python <code>bool</code> olsun.</p><p>Veri: Pedal İzmir hava gözlemleri; referans Haziran, güncel Temmuz; sütunlar <code>temp_c</code>, <code>rain_mm</code>, <code>wind_kmh</code>.</p>',
      start: 'import veri\nfrom scipy.stats import ks_2samp\n\nhava = veri.oku("pedal_izmir", "bk_weather", parse_dates=["obs_hour"])\nref = hava[hava["obs_hour"].dt.month == 6]\nguncel = hava[hava["obs_hour"].dt.month == 7]\n\n\ndef ks_raporu(ref, guncel, sutunlar, alfa=0.05):\n    pass\n',
      sol: 'import veri\nfrom scipy.stats import ks_2samp\n\nhava = veri.oku("pedal_izmir", "bk_weather", parse_dates=["obs_hour"])\nref = hava[hava["obs_hour"].dt.month == 6]\nguncel = hava[hava["obs_hour"].dt.month == 7]\n\n\ndef ks_raporu(ref, guncel, sutunlar, alfa=0.05):\n    rapor = {}\n    for c in sutunlar:\n        r = ks_2samp(ref[c], guncel[c])\n        rapor[c] = {"ks": round(float(r.statistic), 3), "p": round(float(r.pvalue), 4), "kayma": bool(r.pvalue < alfa)}\n    return rapor\n\n\nprint(ks_raporu(ref, guncel, ["temp_c", "rain_mm", "wind_kmh"]))\n',
      tests: 'r = ks_raporu(ref, guncel, ["temp_c", "rain_mm", "wind_kmh"])\nassert set(r) == {"temp_c", "rain_mm", "wind_kmh"}, "Her sütun için bir kayıt"\nassert r["temp_c"]["kayma"] is True and r["temp_c"]["p"] == 0.0, "Temmuz sıcaklığı belirgin biçimde kaymış olmalı"\nassert r["temp_c"]["ks"] == 0.244, f"Sıcaklık KS istatistiği 0.244; gelen {r[\'temp_c\'][\'ks\']}"\nassert r["rain_mm"]["kayma"] is False and r["wind_kmh"]["kayma"] is False, "Yağış ve rüzgârda anlamlı kayma yok"\nassert type(r["wind_kmh"]["kayma"]) is bool, "kayma numpy.bool_ değil Python bool olmalı (JSON\'a yazılabilsin)"\nr2 = ks_raporu(ref, guncel, ["wind_kmh"], alfa=0.5)\nassert r2["wind_kmh"]["kayma"] is True, "alfa parametresi kullanılmalı (rüzgâr p ~0.446 < 0.5)"\n',
      hints: [
        'r = ks_2samp(ref[c], guncel[c]); r.statistic ve r.pvalue',
        'bool(r.pvalue &lt; alfa): numpy bool\'u JSON\'a yazılamaz, Python bool\'a çevir.'
      ],
      why: 'KS testi iki örneklemin birikimli dağılımları arasındaki en büyük farkı (istatistik) ve bunun tesadüf olma olasılığını (p) verir. Büyük örneklemde küçük farklar bile anlamlı çıkar; bu yüzden raporda istatistiği (etki büyüklüğü) de tutarız. Python bool\'a çevirmek, raporu JSON olarak izleme sistemine göndermeyi mümkün kılar.'
    },
    {
      t: 'code',
      stage: 'Kendin yaz',
      id: 'mlops-yasam-dongusu-6',
      diff: 2,
      q: '<p>Talep servisine gelen istekleri pydantic ile doğrula. <code>TalepIstegi</code> modelini yaz: <code>saat</code> int (0–23), <code>haftasonu</code> bool, <code>temp_c</code> float (-15 ile 50 arası), <code>rain_mm</code> float (&gt;= 0), <code>wind_kmh</code> float (&gt;= 0).</p><p>Sonra <code>dogrula(kayitlar)</code> yaz: sözlük listesi alsın, <code>(gecerliler, hatalar)</code> döndürsün. <code>gecerliler</code>: geçerli kayıtlardan kurulan <code>TalepIstegi</code> nesneleri; <code>hatalar</code>: <code>(indeks, [hatalı alan adları])</code> ikilileri (alan adları pydantic\'in verdiği sırayla).</p>',
      start: 'from pydantic import BaseModel, Field, ValidationError\n\n\nclass TalepIstegi(BaseModel):\n    pass\n\n\ndef dogrula(kayitlar):\n    pass\n',
      sol: 'from pydantic import BaseModel, Field, ValidationError\n\n\nclass TalepIstegi(BaseModel):\n    saat: int = Field(ge=0, le=23)\n    haftasonu: bool\n    temp_c: float = Field(ge=-15, le=50)\n    rain_mm: float = Field(ge=0)\n    wind_kmh: float = Field(ge=0)\n\n\ndef dogrula(kayitlar):\n    gecerliler, hatalar = [], []\n    for i, k in enumerate(kayitlar):\n        try:\n            gecerliler.append(TalepIstegi(**k))\n        except ValidationError as e:\n            hatalar.append((i, [h["loc"][0] for h in e.errors()]))\n    return gecerliler, hatalar\n',
      tests: 'istekler = [\n    {"saat": 8, "haftasonu": False, "temp_c": 31.5, "rain_mm": 0, "wind_kmh": 12},\n    {"saat": 24, "haftasonu": False, "temp_c": 31.5, "rain_mm": 0, "wind_kmh": 12},\n    {"saat": 18, "haftasonu": True, "temp_c": 72, "rain_mm": -1, "wind_kmh": 5},\n    {"saat": "9", "haftasonu": "true", "temp_c": "29.4", "rain_mm": 0.2, "wind_kmh": 20},\n    {"saat": 7, "temp_c": 25, "rain_mm": 0, "wind_kmh": 3},\n]\ng, h = dogrula(istekler)\nassert len(g) == 2 and all(isinstance(x, TalepIstegi) for x in g), "İki geçerli istek (0 ve 3)"\nassert g[1].saat == 9 and g[1].haftasonu is True and g[1].temp_c == 29.4, "pydantic uygun metinleri türe çevirir (\\"9\\" → 9)"\nassert h == [(1, ["saat"]), (2, ["temp_c", "rain_mm"]), (4, ["haftasonu"])], f"Hatalar tutmuyor: {h}"\n',
      hints: [
        'Alan tanımı: saat: int = Field(ge=0, le=23); bool alan için yalnız tür yeter.',
        'Her kaydı try içinde TalepIstegi(**k) ile kur.',
        'Hatalı alanlar: [h["loc"][0] for h in e.errors()]'
      ],
      why: 'Şema doğrulama servisin kapısıdır: 72 derece ya da eksik alan modele hiç ulaşmaz. pydantic varsayılan "lax" modda "9" gibi metinleri sayıya çevirir; bu çoğu API için istenen davranıştır. FastAPI aynı modeli istek gövdesi olarak kullanır ve hataları otomatik 422 yanıtına çevirir.'
    },
    {
      t: 'code',
      stage: 'Kendin yaz',
      id: 'mlops-yasam-dongusu-7',
      diff: 2,
      needs: ['pandas'],
      q: '<p><b>Davranış testleri.</b> <code>yon_testi(model, X, sutun, artis, beklenen)</code> fonksiyonunu yaz: <code>X</code>\'in kopyasında <code>sutun</code>\'a <code>artis</code> ekleyip tahminleri karşılaştırsın; <code>beklenen</code> <code>"artar"</code> ise tahmini <b>kesin</b> artan satırların oranını, <code>"azalir"</code> ise kesin azalanların oranını döndürsün (3 basamak).</p><p>Ardından gerçek veride dene: start kodu Pedal İzmir hava verisinden saatlik talebi tahmin eden bir doğrusal model eğitir. <code>sonuc</code> sözlüğünü doldur: <code>"yagis"</code>: yağış 2 mm artınca talep <b>azalır</b> oranı; <code>"sicaklik"</code>: sıcaklık 3 derece artınca talep <b>artar</b> oranı.</p>',
      start: 'import pandas as pd\nimport veri\nfrom sklearn.linear_model import LinearRegression\n\nyol = veri.oku("pedal_izmir", "bk_trips", usecols=["started_at"], parse_dates=["started_at"])\ntalep = yol.set_index("started_at").resample("h").size().rename("talep")\nhava = veri.oku("pedal_izmir", "bk_weather", parse_dates=["obs_hour"]).set_index("obs_hour").join(talep).fillna({"talep": 0})\nX = hava[["temp_c", "rain_mm", "wind_kmh"]]\nmodel = LinearRegression().fit(X, hava["talep"])\n\n\ndef yon_testi(model, X, sutun, artis, beklenen):\n    pass\n\n\nsonuc = {}\n',
      sol: 'import pandas as pd\nimport veri\nfrom sklearn.linear_model import LinearRegression\n\nyol = veri.oku("pedal_izmir", "bk_trips", usecols=["started_at"], parse_dates=["started_at"])\ntalep = yol.set_index("started_at").resample("h").size().rename("talep")\nhava = veri.oku("pedal_izmir", "bk_weather", parse_dates=["obs_hour"]).set_index("obs_hour").join(talep).fillna({"talep": 0})\nX = hava[["temp_c", "rain_mm", "wind_kmh"]]\nmodel = LinearRegression().fit(X, hava["talep"])\n\n\ndef yon_testi(model, X, sutun, artis, beklenen):\n    X2 = X.copy()\n    X2[sutun] = X2[sutun] + artis\n    once, sonra = model.predict(X), model.predict(X2)\n    if beklenen == "artar":\n        return round(float((sonra > once).mean()), 3)\n    return round(float((sonra < once).mean()), 3)\n\n\nsonuc = {"yagis": yon_testi(model, X, "rain_mm", 2, "azalir"), "sicaklik": yon_testi(model, X, "temp_c", 3, "artar")}\nprint(sonuc)\n',
      tests: 'assert sonuc == {"yagis": 1.0, "sicaklik": 1.0}, f"Doğrusal modelde iki yön testi de tüm satırlarda geçmeli; gelen {sonuc}"\nassert "rain_mm" in X.columns and X["rain_mm"].max() < 10, "X\'in kendisini değiştirme: kopya üzerinde çalış"\nfrom sklearn.tree import DecisionTreeRegressor\nimport numpy as np\nXs = pd.DataFrame({"a": np.arange(10.0)}); ys = np.r_[np.zeros(5), np.ones(5)]\nagac = DecisionTreeRegressor(max_depth=1).fit(Xs, ys)\nassert yon_testi(agac, Xs, "a", 1.0, "artar") == 0.1, "Ağaçta yalnız eşiği geçen satır (a=4) artar: oran 0.1 (eşitlik artış sayılmaz)"\nassert yon_testi(agac, Xs, "a", -1.0, "azalir") == 0.1, "azalir yönü de desteklenmeli"\n',
      hints: [
        'X2 = X.copy(); X2[sutun] = X2[sutun] + artis',
        'Karşılaştırma: (sonra &gt; once).mean() ya da (sonra &lt; once).mean()',
        'Eşitlik ne artış ne azalış sayılır: kesin karşılaştırma kullan.'
      ],
      why: 'Yön testleri iş bilgisini teste çevirir: "yağmur yağınca bisiklet talebi artıyorsa model bir şey yanlış öğrenmiş". Ağaç modellerinde değişim yalnız eşik geçildiğinde olur; bu yüzden eşik olarak "%95 satırda doğru yön" gibi oranlar kullanılır. Bu testler CI hattında her yeni model için koşar.'
    },
    {
      t: 'code',
      stage: 'Kendin yaz',
      id: 'mlops-yasam-dongusu-8',
      diff: 2,
      q: '<p><b>Kalite kapısı.</b> <code>kalite_kapisi(aday, mevcut, kurallar)</code> fonksiyonunu yaz. <code>aday</code> ve <code>mevcut</code> sözlüklerinde <code>mae</code>, <code>p95_ms</code>, <code>boyut_mb</code> var. <code>kurallar</code>: <code>{"mae_tolerans": 0.02, "p95_limit": 50, "boyut_limit": 100}</code>. Kurallar:</p><ol><li>Aday MAE\'si mevcut MAE\'nin <code>(1 + mae_tolerans)</code> katını <b>geçmemeli</b> → aksi halde neden: <code>"mae"</code></li><li>Aday p95 gecikmesi <code>p95_limit</code>\'i geçmemeli → <code>"gecikme"</code></li><li>Aday boyutu <code>boyut_limit</code>\'i geçmemeli → <code>"boyut"</code></li></ol><p><code>(gecti: bool, nedenler: list)</code> döndür; nedenler bu sırayla.</p>',
      start: 'def kalite_kapisi(aday, mevcut, kurallar):\n    pass\n',
      sol: 'def kalite_kapisi(aday, mevcut, kurallar):\n    nedenler = []\n    if aday["mae"] > mevcut["mae"] * (1 + kurallar["mae_tolerans"]):\n        nedenler.append("mae")\n    if aday["p95_ms"] > kurallar["p95_limit"]:\n        nedenler.append("gecikme")\n    if aday["boyut_mb"] > kurallar["boyut_limit"]:\n        nedenler.append("boyut")\n    return (not nedenler, nedenler)\n',
      tests: 'K = {"mae_tolerans": 0.02, "p95_limit": 50, "boyut_limit": 100}\nm = {"mae": 15.0, "p95_ms": 30, "boyut_mb": 20}\nassert kalite_kapisi({"mae": 14.2, "p95_ms": 35, "boyut_mb": 25}, m, K) == (True, []), "Daha iyi aday geçmeli"\nassert kalite_kapisi({"mae": 15.3, "p95_ms": 50, "boyut_mb": 100}, m, K) == (True, []), "Sınırda (15.3 = 15·1.02, 50 ms, 100 MB) geçmeli"\nassert kalite_kapisi({"mae": 15.31, "p95_ms": 40, "boyut_mb": 30}, m, K) == (False, ["mae"]), "MAE toleransı aşıldı"\nassert kalite_kapisi({"mae": 16, "p95_ms": 80, "boyut_mb": 300}, m, K) == (False, ["mae", "gecikme", "boyut"]), "Tüm nedenler sırayla listelenmeli"\nr = kalite_kapisi({"mae": 10, "p95_ms": 51, "boyut_mb": 1}, m, K)\nassert r[0] is False and r[1] == ["gecikme"], "Daha doğru ama yavaş model de reddedilmeli"\n',
      hints: [
        'Her kural için ayrı if; ihlalde nedenler listesine ekle.',
        'Toleranslı karşılaştırma: aday["mae"] &gt; mevcut["mae"] * (1 + tolerans)',
        'Dönüş: (len(nedenler) == 0, nedenler)'
      ],
      why: 'Kalite kapısı, "model daha iyi mi?" sorusunu otomatik ve tekrarlanabilir hale getirir. Küçük bir tolerans, gürültü kadar kötüleşmenin yayını engellemesini önler. Gecikme ve boyut da kalite ölçüsüdür: %1 daha doğru ama iki kat yavaş model canlıda kötü bir takastır. Tüm nedenleri birden raporlamak, geliştiricinin tek seferde düzeltmesini sağlar.'
    },
    {
      t: 'code',
      stage: 'Hata avı',
      id: 'mlops-yasam-dongusu-9',
      diff: 2,
      kind: 'bug',
      q: '<p><b>Hatayı bul ve düzelt.</b> İzleme ekibi Temmuz\'daki rekor sıcaklıklara rağmen <code>psi_hatali</code> fonksiyonunun küçük değerler ürettiğini fark etti. Fonksiyon kovaları referansın en küçük ve en büyük değeri arasında eşit genişlikte kuruyor; referans aralığının dışındaki güncel değerler hiçbir kovaya girmiyor ve oranlar 1\'e toplanmıyor. Kovaların uçlarını açık (sonsuz) yap; geri kalan mantığı koru.</p>',
      start: 'import numpy as np\n\n\ndef psi_hatali(ref, guncel, kova=10):\n    sinir = np.linspace(np.min(ref), np.max(ref), kova + 1)\n    r = np.histogram(ref, sinir)[0] / len(ref)\n    g = np.histogram(guncel, sinir)[0] / len(guncel)\n    r, g = np.clip(r, 1e-4, None), np.clip(g, 1e-4, None)\n    return round(float(np.sum((g - r) * np.log(g / r))), 4)\n',
      sol: 'import numpy as np\n\n\ndef psi_hatali(ref, guncel, kova=10):\n    sinir = np.linspace(np.min(ref), np.max(ref), kova + 1)\n    sinir[0], sinir[-1] = -np.inf, np.inf\n    r = np.histogram(ref, sinir)[0] / len(ref)\n    g = np.histogram(guncel, sinir)[0] / len(guncel)\n    r, g = np.clip(r, 1e-4, None), np.clip(g, 1e-4, None)\n    return round(float(np.sum((g - r) * np.log(g / r))), 4)\n',
      tests: 'ref = np.linspace(20, 30, 1000)\nassert psi_hatali(ref, ref) == 0.0, "Aynı dağılımda PSI 0"\nsicak = np.linspace(31, 40, 500)\np = psi_hatali(ref, sicak)\nassert p > 5, f"Tüm güncel değerler referansın üstünde: PSI çok büyük olmalı; gelen {p}"\nyarim = np.r_[np.linspace(20, 30, 500), np.linspace(31, 40, 500)]\nassert psi_hatali(ref, yarim) > 1, "Değerlerin yarısı aralık dışındayken de büyük kayma görünmeli"\n',
      hints: ['np.histogram sınırların dışındaki değerleri sessizce atar.', 'sinir[0], sinir[-1] = -np.inf, np.inf'],
      why: 'np.histogram aralık dışındaki değerleri saymaz; güncel oranlar 1\'e toplanmaz ve en tehlikeli kayma (hiç görülmemiş değerler) görünmez olur. Uçları sonsuz yapınca rekor değerler en uç kovaya düşer. Kova sınırlarını eşit genişlik yerine yüzdeliklerle kurmak da (önceki alıştırma) çarpık dağılımlarda daha dengeli kovalar verir.'
    },
    {
      t: 'code',
      stage: 'Hata avı',
      id: 'mlops-yasam-dongusu-10',
      diff: 2,
      kind: 'bug',
      needs: ['pandas'],
      q: '<p><b>Hatayı bul ve düzelt.</b> Model numpy dizisiyle <code>OZELLIKLER</code> sırasında eğitildi. Servis tarafındaki <code>tahmin_et(model, istek)</code>, gelen JSON sözlüğünü tabloya çeviriyor; ama istemciler alanları farklı sırada gönderince tahminler sessizce saçmalıyor (eğitim-servis çarpıklığı). Sütunları her zaman <code>OZELLIKLER</code> sırasına diz; eksik alan varsa <code>KeyError</code> fırlasın.</p>',
      start: 'import numpy as np\nimport pandas as pd\nfrom sklearn.linear_model import LinearRegression\n\nOZELLIKLER = ["saat", "temp_c", "rain_mm"]\nrng = np.random.default_rng(0)\nX = np.c_[rng.integers(0, 24, 300), rng.normal(30, 3, 300), rng.exponential(0.2, 300)]\ny = 2 * X[:, 0] + 1.5 * X[:, 1] - 12 * X[:, 2]\nmodel = LinearRegression().fit(X, y)\n\n\ndef tahmin_et(model, istek):\n    satir = pd.DataFrame([istek])\n    return round(float(model.predict(satir.to_numpy())[0]), 2)\n',
      sol: 'import numpy as np\nimport pandas as pd\nfrom sklearn.linear_model import LinearRegression\n\nOZELLIKLER = ["saat", "temp_c", "rain_mm"]\nrng = np.random.default_rng(0)\nX = np.c_[rng.integers(0, 24, 300), rng.normal(30, 3, 300), rng.exponential(0.2, 300)]\ny = 2 * X[:, 0] + 1.5 * X[:, 1] - 12 * X[:, 2]\nmodel = LinearRegression().fit(X, y)\n\n\ndef tahmin_et(model, istek):\n    satir = pd.DataFrame([istek])[OZELLIKLER]\n    return round(float(model.predict(satir.to_numpy())[0]), 2)\n',
      tests: 'a = tahmin_et(model, {"saat": 8, "temp_c": 30.0, "rain_mm": 0.0})\nb = tahmin_et(model, {"rain_mm": 0.0, "temp_c": 30.0, "saat": 8})\nassert a == 61.0, f"8. saat, 30 derece, yağışsız: 2·8 + 1.5·30 = 61.0; gelen {a}"\nassert b == a, f"Alan sırası tahmini değiştirmemeli; gelen {b}"\nassert tahmin_et(model, {"temp_c": 30.0, "rain_mm": 1.0, "saat": 8, "fazla": 5}) == 49.0, "Fazla alan yok sayılmalı, sıra OZELLIKLER\'den"\ntry:\n    tahmin_et(model, {"saat": 8, "temp_c": 30.0})\n    assert False, "Eksik alanda KeyError bekleniyordu"\nexcept KeyError:\n    pass\n',
      hints: [
        'pd.DataFrame([istek]) sütunları sözlük sırasıyla kurar.',
        'Sütun seçimi hem sıralar hem eksikte KeyError verir: pd.DataFrame([istek])[OZELLIKLER]'
      ],
      why: 'Numpy dizisiyle eğitilen model sütun adlarını bilmez; yalnız sırayı bilir. Sıra kayınca sıcaklık saat yerine geçer ve hiçbir hata oluşmadan yanlış tahmin döner: en tehlikeli hata türü. Model imzası (signature) ve sabit özellik listesi bu çarpıklığı önler; DataFrame ile eğitilen sklearn modelleri de feature_names_in_ ile adları kontrol eder.'
    },
    {
      t: 'code',
      stage: 'Meydan okuma',
      id: 'mlops-yasam-dongusu-11',
      diff: 3,
      q: '<p><b>Canary yönlendirici.</b> <code>yonlendir(kullanici_id, yuzde, tuz="v2")</code> fonksiyonunu yaz: <code>f"{tuz}:{kullanici_id}"</code> metninin SHA-256 özetini tam sayıya çevir (<code>int(hexdigest, 16)</code>), 100\'e göre kalanı <code>yuzde</code>\'den küçükse <code>"aday"</code>, değilse <code>"mevcut"</code> döndür.</p><p>Gereksinimler: aynı kullanıcı hep aynı modele gider (yapışkan); 10 000 kullanıcıda aday oranı hedefe yakın olur; yüzde artırıldığında daha önce adaya gidenler adayda kalır; farklı tuz farklı bir kullanıcı kümesi seçer.</p>',
      start: 'import hashlib\n\n\ndef yonlendir(kullanici_id, yuzde, tuz="v2"):\n    pass\n',
      sol: 'import hashlib\n\n\ndef yonlendir(kullanici_id, yuzde, tuz="v2"):\n    ozet = hashlib.sha256(f"{tuz}:{kullanici_id}".encode("utf-8")).hexdigest()\n    kova = int(ozet, 16) % 100\n    return "aday" if kova < yuzde else "mevcut"\n',
      tests: 'ids = range(10000)\nassert all(yonlendir(i, 5) == yonlendir(i, 5) for i in range(200)), "Aynı kullanıcı her çağrıda aynı modele gitmeli"\noran5 = sum(yonlendir(i, 5) == "aday" for i in ids) / 10000\nassert 0.04 <= oran5 <= 0.06, f"%5 canary\'de aday oranı 0.04-0.06 arası olmalı; gelen {oran5}"\na5 = {i for i in ids if yonlendir(i, 5) == "aday"}\na20 = {i for i in ids if yonlendir(i, 20) == "aday"}\nassert a5 <= a20, "Yüzde artınca önceki aday kullanıcılar adayda kalmalı"\nassert 0.18 <= len(a20) / 10000 <= 0.22, "%20\'de oran 0.18-0.22"\nb5 = {i for i in ids if yonlendir(i, 5, tuz="v3") == "aday"}\nassert len(a5 & b5) < len(a5) * 0.3, "Farklı tuz farklı bir kullanıcı kümesi seçmeli"\nassert yonlendir(42, 0) == "mevcut" and yonlendir(42, 100) == "aday", "0 ve 100 uçları"\nassert yonlendir(42, 5) == "mevcut" and yonlendir(42, 24) == "aday", "Tanımlanan hash kuralına uyulmalı (kullanıcı 42\'nin kovası 23)"\n',
      hints: [
        'hashlib.sha256(f"{tuz}:{kullanici_id}".encode("utf-8")).hexdigest()',
        'kova = int(ozet, 16) % 100 → 0..99 arası sabit bir kova',
        'kova &lt; yuzde ise aday: bu yüzden %5\'teki kullanıcılar %20\'de de adaydır.'
      ],
      why: 'Rastgele sayı (random) kullanılsaydı aynı kullanıcı her istekte farklı model görürdü; deneyim tutarsızlaşır ve metrikler karışır. Hash, kullanıcıyı sabit bir 0–99 kovasına koyar. Eşik artınca kova kümesi büyür, yani kanarya genişletilirken kimse geri dönmez. Tuz her deneyi bağımsız kılar: hep aynı %5 kullanıcının deney faresi olması engellenir.'
    },
    {
      t: 'code',
      stage: 'Meydan okuma',
      id: 'mlops-yasam-dongusu-12',
      diff: 3,
      q: '<p><b>Yeniden eğitim tetikleyicisi.</b> <code>tetikleyici(gunler, ref_mae, psi_esik=0.25, psi_gun=3, mae_kat=1.2, mae_gun=2)</code> fonksiyonunu yaz. <code>gunler</code>, tarih sırasıyla <code>{"gun": "2024-07-01", "psi": 0.31, "mae": 16.2}</code> sözlükleri; <code>mae</code> bazen <code>None</code> (etiket henüz gelmedi).</p><ul><li><b>Kayma kuralı:</b> PSI <code>psi_esik</code>\'i <code>psi_gun</code> gün üst üste aşarsa tetikle.</li><li><b>Performans kuralı:</b> MAE <code>ref_mae · mae_kat</code>\'ı <code>mae_gun</code> gün üst üste aşarsa tetikle. <code>None</code> olan gün sayacı sıfırlamaz ama artırmaz da (atlanır).</li></ul><p>İlk tetiklenen kuralda <code>(gun, "kayma")</code> ya da <code>(gun, "performans")</code> döndür (aynı gün ikisi birden tutarsa <code>"performans"</code>); hiç tetiklenmezse <code>None</code>.</p>',
      start: 'def tetikleyici(gunler, ref_mae, psi_esik=0.25, psi_gun=3, mae_kat=1.2, mae_gun=2):\n    pass\n',
      sol: 'def tetikleyici(gunler, ref_mae, psi_esik=0.25, psi_gun=3, mae_kat=1.2, mae_gun=2):\n    psi_seri = mae_seri = 0\n    for g in gunler:\n        psi_seri = psi_seri + 1 if g["psi"] > psi_esik else 0\n        if g["mae"] is not None:\n            mae_seri = mae_seri + 1 if g["mae"] > ref_mae * mae_kat else 0\n        if mae_seri >= mae_gun:\n            return (g["gun"], "performans")\n        if psi_seri >= psi_gun:\n            return (g["gun"], "kayma")\n    return None\n',
      tests: 'def G(i, p, m):\n    return {"gun": f"2024-07-{i:02d}", "psi": p, "mae": m}\nassert tetikleyici([G(1, 0.3, 15), G(2, 0.1, 15), G(3, 0.3, 15), G(4, 0.3, 15), G(5, 0.3, 15)], 15) == ("2024-07-05", "kayma"), "Ardışık 3 gün kuralı: 2. gün seri kırıldı"\nassert tetikleyici([G(1, 0.0, 19), G(2, 0.0, None), G(3, 0.0, 19)], 15) == ("2024-07-03", "performans"), "None gün seriyi bozmaz: 1 ve 3. gün ardışık sayılır"\nassert tetikleyici([G(1, 0.0, 19), G(2, 0.0, 15), G(3, 0.0, 19)], 15) is None, "Normal bir gün seriyi sıfırlar"\nassert tetikleyici([G(1, 0.3, 19), G(2, 0.3, 19), G(3, 0.3, 19)], 15) == ("2024-07-02", "performans"), "Performans kuralı 2 günde, kaymadan önce tetiklenir"\nassert tetikleyici([G(1, 0.3, 18), G(2, 0.3, 18.1), G(3, 0.3, 15)], 15) == ("2024-07-03", "kayma"), "18 = 15·1.2 eşik aşımı değil (kesin büyük)"\nassert tetikleyici([G(i, 0.26, 17.9) for i in range(1, 3)], 15) is None, "İki gün kayma yetmez"\n',
      hints: ['İki sayaç tut: psi_seri, mae_seri; koşul tutmazsa 0\'a dön.', 'mae None ise mae_seri\'ye dokunma.', 'Aynı günde önce performans, sonra kayma kontrol et.'],
      why: 'Tek günlük sıçrama (bayram, maç günü) yeniden eğitimi tetiklememeli; ardışık gün kuralı gürültüyü süzer. Gecikmeli etiketlerde (None) sayacı sıfırlamak, etiketi geç gelen her günde alarmı kaybettirir. Performans kuralına öncelik vermek mantıklıdır: kayma yalnız bir belirtidir, performans düşüşü ise kanıttır.'
    },
    {
      t: 'code',
      stage: 'Mini proje',
      id: 'mlops-yasam-dongusu-13',
      diff: 3,
      needs: ['pandas'],
      q: '<p><b>Pedal İzmir talep modeli: izleme raporu.</b> Start kodu saatlik talep tablosunu (<code>d</code>: Haziran–Ağustos, hava + saat + haftasonu) kurar, modeli 1–23 Haziran ile eğitir (<code>model</code>), 24–30 Haziran\'ı doğrulama (<code>dog</code>) olarak ayırır. <code>psi</code> fonksiyonu hazır.</p><p><code>izleme_raporu(model, d, dog)</code> fonksiyonunu yaz ve şu sözlüğü döndür:</p><ul><li><code>"ref_mae"</code>: doğrulama MAE\'si (2 basamak)</li><li><code>7</code> ve <code>8</code> anahtarları (Temmuz, Ağustos) için birer sözlük: <code>"psi_temp"</code> (Haziran\'ın tamamına göre <code>temp_c</code> PSI\'ı), <code>"mae"</code>, <code>"yanlilik"</code> (ortalama tahmin − ortalama gerçek), <code>"alarm"</code> (psi_temp &gt; 0.25 <b>ya da</b> mae &gt; 1.2·ref_mae). Sayılar 2 basamak (PSI 4 basamak).</li></ul>',
      start: 'import numpy as np\nimport pandas as pd\nimport veri\nfrom sklearn.compose import make_column_transformer\nfrom sklearn.linear_model import Ridge\nfrom sklearn.metrics import mean_absolute_error\nfrom sklearn.pipeline import make_pipeline\nfrom sklearn.preprocessing import OneHotEncoder\n\nyol = veri.oku("pedal_izmir", "bk_trips", usecols=["started_at"], parse_dates=["started_at"])\ntalep = yol.set_index("started_at").resample("h").size().rename("talep")\nd = veri.oku("pedal_izmir", "bk_weather", parse_dates=["obs_hour"]).set_index("obs_hour").join(talep).fillna({"talep": 0})\nd["saat"] = d.index.hour\nd["haftasonu"] = (d.index.dayofweek >= 5).astype(int)\nOZ = ["saat", "haftasonu", "temp_c", "rain_mm", "wind_kmh"]\negt = d[d.index < "2024-06-24"]\ndog = d[(d.index >= "2024-06-24") & (d.index < "2024-07-01")]\nmodel = make_pipeline(make_column_transformer((OneHotEncoder(handle_unknown="ignore"), ["saat"]), remainder="passthrough"), Ridge(alpha=1.0))\nmodel.fit(egt[OZ], egt["talep"])\n\n\ndef psi(ref, guncel, kova=10):\n    sinir = np.unique(np.quantile(ref, np.linspace(0, 1, kova + 1)))\n    sinir[0], sinir[-1] = -np.inf, np.inf\n    r = np.clip(np.histogram(ref, sinir)[0] / len(ref), 1e-4, None)\n    g = np.clip(np.histogram(guncel, sinir)[0] / len(guncel), 1e-4, None)\n    return float(np.sum((g - r) * np.log(g / r)))\n\n\ndef izleme_raporu(model, d, dog):\n    # TODO\n    return {}\n',
      sol: 'import numpy as np\nimport pandas as pd\nimport veri\nfrom sklearn.compose import make_column_transformer\nfrom sklearn.linear_model import Ridge\nfrom sklearn.metrics import mean_absolute_error\nfrom sklearn.pipeline import make_pipeline\nfrom sklearn.preprocessing import OneHotEncoder\n\nyol = veri.oku("pedal_izmir", "bk_trips", usecols=["started_at"], parse_dates=["started_at"])\ntalep = yol.set_index("started_at").resample("h").size().rename("talep")\nd = veri.oku("pedal_izmir", "bk_weather", parse_dates=["obs_hour"]).set_index("obs_hour").join(talep).fillna({"talep": 0})\nd["saat"] = d.index.hour\nd["haftasonu"] = (d.index.dayofweek >= 5).astype(int)\nOZ = ["saat", "haftasonu", "temp_c", "rain_mm", "wind_kmh"]\negt = d[d.index < "2024-06-24"]\ndog = d[(d.index >= "2024-06-24") & (d.index < "2024-07-01")]\nmodel = make_pipeline(make_column_transformer((OneHotEncoder(handle_unknown="ignore"), ["saat"]), remainder="passthrough"), Ridge(alpha=1.0))\nmodel.fit(egt[OZ], egt["talep"])\n\n\ndef psi(ref, guncel, kova=10):\n    sinir = np.unique(np.quantile(ref, np.linspace(0, 1, kova + 1)))\n    sinir[0], sinir[-1] = -np.inf, np.inf\n    r = np.clip(np.histogram(ref, sinir)[0] / len(ref), 1e-4, None)\n    g = np.clip(np.histogram(guncel, sinir)[0] / len(guncel), 1e-4, None)\n    return float(np.sum((g - r) * np.log(g / r)))\n\n\ndef izleme_raporu(model, d, dog):\n    ref_mae = mean_absolute_error(dog["talep"], model.predict(dog[OZ]))\n    haziran = d[d.index.month == 6]\n    rapor = {"ref_mae": round(float(ref_mae), 2)}\n    for ay in (7, 8):\n        k = d[d.index.month == ay]\n        tahmin = model.predict(k[OZ])\n        p = psi(haziran["temp_c"], k["temp_c"])\n        mae = mean_absolute_error(k["talep"], tahmin)\n        rapor[ay] = {\n            "psi_temp": round(p, 4),\n            "mae": round(float(mae), 2),\n            "yanlilik": round(float(tahmin.mean() - k["talep"].mean()), 2),\n            "alarm": bool(p > 0.25 or mae > 1.2 * ref_mae),\n        }\n    return rapor\n\n\nprint(izleme_raporu(model, d, dog))\n',
      tests: 'r = izleme_raporu(model, d, dog)\nassert set(r) == {"ref_mae", 7, 8}, "Anahtarlar: ref_mae, 7, 8"\nassert r["ref_mae"] == 15.28, f"Doğrulama MAE\'si 15.28; gelen {r[\'ref_mae\']}"\nassert abs(r[7]["psi_temp"] - 1.354) < 0.001 and abs(r[8]["psi_temp"] - 0.0198) < 0.001, "Sıcaklık PSI\'ları: Temmuz ~1.354, Ağustos ~0.0198 (referans Haziran\'ın tamamı)"\nassert r[7]["mae"] == 14.88 and r[8]["mae"] == 14.92, f"Aylık MAE\'ler tutmuyor: {r[7][\'mae\']}, {r[8][\'mae\']}"\nassert r[7]["yanlilik"] == 4.15, f"Temmuz\'da model talebi ~4.15 bisiklet/saat fazla tahmin ediyor; gelen {r[7][\'yanlilik\']}"\nassert r[7]["alarm"] is True and r[8]["alarm"] is False, "Temmuz kayma alarmı vermeli, Ağustos vermemeli"\n',
      hints: [
        'ref_mae: mean_absolute_error(dog["talep"], model.predict(dog[OZ]))',
        'Her ay için k = d[d.index.month == ay]; PSI referansı d[d.index.month == 6]["temp_c"]',
        'yanlilik = tahmin.mean() - k["talep"].mean(); alarm\'ı bool(...) ile Python bool yap.'
      ],
      why: 'Rapor kayma, tahmin dağılımı ve performansı birlikte okutur. Temmuz\'da sıcaklık PSI\'ı 1.35 (büyük kayma) ve doğrusal model sıcaklığı "daha çok talep" diye okuduğu için tahminler saatte ~4 bisiklet yukarı kaymış (yanlılık); ama MAE neredeyse aynı. Doğru aksiyon panik geri alma değil: incele, yanlılığı izle, sıcak günleri içeren veriyle yeniden eğitimi planla. Ağustos\'ta hava normale dönünce alarm kendiliğinden kapanıyor.'
    }
  ],
  faq: [
    {
      q: 'MLflow mu, Weights & Biases mı, başka bir araç mı?',
      a: 'MLflow açık kaynak ve kendi sunucunda çalışır; deney takibi, kayıt defteri ve servislemeyi tek pakette verir, Databricks ile hazır gelir. Weights & Biases derin öğrenme ve görselleştirmede güçlüdür ama barındırılan bir hizmettir. Bulutta çalışıyorsan SageMaker, Vertex AI ve Azure ML\'in kendi kayıt defterleri var. Kavramlar (koşu, parametre, metrik, artefakt, sürüm, aşama) hepsinde aynıdır.'
    },
    {
      q: 'PSI için hangi kova sayısını seçmeliyim?',
      a: 'Gelenek 10 kovadır (desiller). Az veride (birkaç yüz satır) 5 kova daha kararlıdır; kategorik özelliklerde her kategori bir kovadır. Eşikler (0.1, 0.25) kural değil başlangıç noktasıdır; kendi verindeki normal dalgalanmayı birkaç hafta izleyip ayarla.'
    },
    {
      q: 'Etiketler aylar sonra geliyorsa performansı nasıl izlerim?',
      a: 'Kredi temerrüdü gibi durumlarda vekil (proxy) metrikler kullanılır: ilk ödeme gecikmesi, tahmin dağılımı, girdi kayması. Etiketler geldikçe geriye dönük performans raporu (vintage analizi) güncellenir. NannyML gibi araçlar etiketsiz performans tahmini yapmaya çalışır.'
    },
    {
      q: 'Her kaymada yeniden eğitmeli miyim?',
      a: 'Hayır. Önce kaymanın nedenini anla: veri hatası mı (sensör bozuldu, birim değişti), mevsimsel mi, kalıcı mı? Veri hatasında yeniden eğitim hatayı modele öğretir. Kalıcı değişimde yeniden eğit, eski ve yeni modeli shadow ile karşılaştır, kalite kapısından geçir.'
    },
    {
      q: 'Model dosyasını Git\'e koyabilir miyim?',
      a: 'Küçük modeller için olur ama iyi bir alışkanlık değildir: depo şişer ve modelin hangi veriyle üretildiği kaybolur. Modeli artefakt deposunda (MLflow, S3) tut, Git\'te kod ve veri özetini (DVC) tut; kayıt defteri ikisini birbirine bağlar.'
    }
  ],
  mistakes: [
    {
      bad: 'model = joblib.load("model.joblib")  # her istekte, fonksiyon içinde',
      good: 'MODEL = joblib.load("model.joblib")  # süreç başında bir kez\n\ndef predict(istek):\n    return MODEL.predict(...)',
      why: 'Her istekte diskten yüklemek gecikmeyi katlar; model süreç başında bir kez yüklenir.'
    },
    {
      bad: 'satir = pd.DataFrame([istek])\nmodel.predict(satir.to_numpy())',
      good: 'satir = pd.DataFrame([istek])[OZELLIKLER]\nmodel.predict(satir.to_numpy())',
      why: 'İstemcinin alan sırasına güvenmek eğitim-servis çarpıklığına yol açar; sırayı sabit özellik listesi belirler.'
    },
    {
      bad: 'sinir = np.linspace(ref.min(), ref.max(), 11)',
      good: 'sinir = np.unique(np.quantile(ref, np.linspace(0, 1, 11)))\nsinir[0], sinir[-1] = -np.inf, np.inf',
      why: 'Kapalı uçlu kovalar referans aralığı dışındaki değerleri kaybeder; en büyük kayma görünmez olur.'
    },
    {
      bad: 'if random.random() < 0.05:\n    model = aday',
      good: 'kova = int(hashlib.sha256(f"v2:{kullanici_id}".encode()).hexdigest(), 16) % 100\nmodel = aday if kova < 5 else mevcut',
      why: 'Rastgele yönlendirmede aynı kullanıcı her istekte farklı model görür; hash ile yönlendirme yapışkandır.'
    },
    {
      bad: 'if psi > 0.25:\n    yeniden_egit()',
      good: 'if ardisik_gun(psi > 0.25) >= 3 and veri_hatasi_yok:\n    yeniden_egitim_onerisi()',
      why: 'Tek günlük kayma gürültü ya da veri hatası olabilir; ardışık gün kuralı ve kök neden analizi gerekir.'
    }
  ]
});
})(window);
