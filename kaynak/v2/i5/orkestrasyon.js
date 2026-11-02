/* PythonPatika v2 — orkestrasyon */
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push(
{ id: 'orkestrasyon',
  lv: 'ileri',
  mod: 'Üretime Hazırlık',
  min: 75,
  title: 'İş akışı orkestrasyonu: cron, DAG ve Airflow',
  sum: 'Zamanlanmış işleri cron sözdizimiyle tanımlar, görevleri DAG olarak modeller, graphlib ile sıralar ve döngü yakalarsın; Airflow\'un DAG, operator, >>, retries ve XCom kavramlarını tanır, idempotent ve yeniden çalıştırılabilir işler, yeniden deneme, bildirim ve gözlemlenebilirlikle üretim kalitesinde akışlar kurarsın.',
  goals: [
    'Cron ifadesini okuyup yazabilir, bir sonraki çalışma zamanını hesaplayabilirim.',
    'Görev bağımlılıklarını DAG olarak modeller, graphlib.TopologicalSorter ile sıra ve paralel katmanlar çıkarır, döngüyü yakalarım.',
    'Airflow\'da DAG, operator, >> bağımlılığı, schedule, retries ve XCom kavramlarını kullanarak bir akış tasarlayabilirim.',
    'İşleri idempotent yazar; yeniden deneme, geriye dönük çalıştırma (backfill) ve hata bildirimi kurgularım.',
    'Akışı log ve metriklerle gözlemlenebilir hale getiririm.'
  ],
  body: `
<h2>Neden önemli?</h2>
<p>Veri boru hattı dersinde tek bir ETL betiği yazdın. Gerçek kurumda ise onlarca iş birbirine bağlıdır: Anadolu Market'te her gece 02:00'de siparişler çekilir, temizlenir, stok tablosu güncellenir, şehir raporu üretilir, yöneticilere e-posta gider. Anadolu Bank'ta gün sonu mutabakatı, tüm şubelerin işlem dosyaları gelmeden başlayamaz. Bu işleri "doğru sırada, doğru zamanda, hata olursa yeniden deneyerek ve kimse bakmasa da haber vererek" çalıştırma işine <b>orkestrasyon</b> (orchestration) denir. Bu derste önce temelleri (cron, DAG, idempotentlik) saf Python ile kuracak, sonra Airflow ve benzeri araçların bunları nasıl paketlediğini göreceksin.</p>

<h2>Cron: ne zaman çalışsın?</h2>
<p>Cron, Unix sistemlerinin zamanlayıcısıdır; sözdizimi Airflow, Kubernetes CronJob, GitHub Actions ve bulut zamanlayıcılarında da kullanılır. Bir ifade beş alandan oluşur:</p>
<div class="tbl-wrap"><table>
<tr><th>Alan</th><th>Aralık</th><th>Örnek</th><th>Anlamı</th></tr>
<tr><td>Dakika</td><td>0-59</td><td><code>*/15</code></td><td>Her 15 dakikada (0, 15, 30, 45)</td></tr>
<tr><td>Saat</td><td>0-23</td><td><code>2</code></td><td>Saat 02</td></tr>
<tr><td>Ayın günü</td><td>1-31</td><td><code>1,15</code></td><td>Ayın 1'i ve 15'i</td></tr>
<tr><td>Ay</td><td>1-12</td><td><code>*</code></td><td>Her ay</td></tr>
<tr><td>Haftanın günü</td><td>0-6 (0 = Pazar)</td><td><code>1-5</code></td><td>Pazartesi-Cuma</td></tr>
</table></div>
<div class="tbl-wrap"><table>
<tr><th>İfade</th><th>Anlamı</th></tr>
<tr><td><code>0 2 * * *</code></td><td>Her gün 02:00</td></tr>
<tr><td><code>30 8 * * 1-5</code></td><td>Hafta içi her gün 08:30</td></tr>
<tr><td><code>*/10 9-18 * * *</code></td><td>09:00-18:50 arası her 10 dakikada</td></tr>
<tr><td><code>0 0 1 * *</code></td><td>Her ayın 1'i gece yarısı</td></tr>
<tr><td><code>0 6 * * 0</code></td><td>Her Pazar 06:00</td></tr>
</table></div>
<pre class="code"># Linux / macOS: crontab -e
0 2 * * *  cd /opt/anadolu &amp;&amp; .venv/bin/python -m etl.gunluk &gt;&gt; /var/log/etl.log 2&gt;&amp;1
# Windows'ta Görev Zamanlayıcı (Task Scheduler) ya da schtasks:
schtasks /create /tn "AnadoluETL" /tr "C:\\anadolu\\.venv\\Scripts\\python.exe -m etl.gunluk" /sc daily /st 02:00</pre>
<p>Bir alan nasıl açılır? <code>*/15</code> "0'dan başlayıp 15'er adım", <code>1-5</code> "aralık", <code>1,3,5</code> "liste" demektir; <code>10-30/10</code> ise aralık içinde adım. Aşağıdaki kutu bir alanı değer kümesine çeviriyor; alıştırmalarda bunun üzerine "bir sonraki çalışma zamanı" hesaplayıcısı kuracaksın.</p>
<pre class="py">def alan_ac(alan, alt, ust):
    degerler = set()
    for parca in alan.split(","):
        aralik, _, adim = parca.partition("/")
        if aralik == "*":
            bas, son = alt, ust
        elif "-" in aralik:
            bas, son = map(int, aralik.split("-"))
        else:
            bas = son = int(aralik)
        degerler.update(range(bas, son + 1, int(adim) if adim else 1))
    return sorted(degerler)

print(alan_ac("*/15", 0, 59))
print(alan_ac("1-5", 0, 6))
print(alan_ac("8,12,18", 0, 23))
print(alan_ac("10-30/10", 0, 59))</pre>
<p>Python içinden zamanlama gerekiyorsa iki popüler paket vardır (tarayıcıda çalışmaz, kendi bilgisayarında dene):</p>
<pre class="code"># pip install schedule apscheduler
import schedule, time
schedule.every().day.at("02:00").do(gunluk_etl)
schedule.every(15).minutes.do(stok_kontrol)
while True:
    schedule.run_pending()
    time.sleep(30)

from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.triggers.cron import CronTrigger
zamanlayici = BlockingScheduler(timezone="Europe/Istanbul")
zamanlayici.add_job(gunluk_etl, CronTrigger.from_crontab("0 2 * * *"), max_instances=1)
zamanlayici.start()</pre>
<div class="warn"><b>Saat dilimi</b>Sunucular çoğunlukla UTC çalışır. "02:00" yazdığında hangi saat dilimini kastettiğini her zaman açıkça belirt (Airflow'da <code>pendulum.timezone("Europe/Istanbul")</code>, APScheduler'da <code>timezone=</code>). Aksi halde işin Türkiye saatiyle 05:00'te çalıştığını sonradan fark edersin.</div>

<h2>DAG: hangi sırayla çalışsın?</h2>
<p>Cron "ne zaman" sorusunu çözer, ama "temizlik bitmeden rapor başlamasın" diyemez. Görevler ve aralarındaki bağımlılıklar bir <b>yönlü döngüsüz çizge</b> (Directed Acyclic Graph, DAG) oluşturur: oklar "önce bu, sonra şu" der, döngü olamaz (A, B'yi; B de A'yı bekliyorsa hiçbiri başlayamaz). Bir DAG'ı geçerli bir sıraya dizmeye <b>topolojik sıralama</b> denir ve Python'da standart kütüphanede hazırdır: <code>graphlib.TopologicalSorter</code>.</p>
<pre class="py">from graphlib import TopologicalSorter, CycleError

# görev: {önce bitmesi gerekenler}
akis = {
    "siparis_cek": set(),
    "musteri_cek": set(),
    "temizle": {"siparis_cek", "musteri_cek"},
    "stok_guncelle": {"temizle"},
    "sehir_raporu": {"temizle"},
    "eposta_gonder": {"sehir_raporu", "stok_guncelle"},
}
print(list(TopologicalSorter(akis).static_order()))

# paralel katmanlar: aynı anda çalışabilecek görevler
ts = TopologicalSorter(akis)
ts.prepare()
katman = 1
while ts.is_active():
    hazir = sorted(ts.get_ready())
    print(f"Katman {katman}:", hazir)
    ts.done(*hazir)
    katman += 1

try:
    list(TopologicalSorter({"a": {"b"}, "b": {"c"}, "c": {"a"}}).static_order())
except CycleError as e:
    print("Döngü:", e.args[1])</pre>
<p><code>get_ready()</code> bağımlılıkları bitmiş görevleri verir; <code>done()</code> ile bitenleri bildirdikçe yenileri açılır. Orkestratörlerin çalıştırıcıları (executor) özünde bu döngüyü işçi havuzuyla çalıştırır.</p>

<h2>Airflow: endüstri standardı</h2>
<p>Apache Airflow, DAG'ları Python koduyla tanımladığın, zamanlayan, çalıştıran, yeniden deneyen ve web arayüzünde izleyen açık kaynak bir platformdur. Temel kavramlar:</p>
<div class="tbl-wrap"><table>
<tr><th>Kavram</th><th>Ne?</th></tr>
<tr><td>DAG</td><td>Görevler ve bağımlılıklarının bütünü; <code>schedule</code>, <code>start_date</code>, <code>catchup</code> ayarlarını taşır</td></tr>
<tr><td>Operator</td><td>Görev türü: <code>PythonOperator</code>, <code>BashOperator</code>, <code>SQLExecuteQueryOperator</code>, sensörler</td></tr>
<tr><td>Task</td><td>Operator'ün DAG içindeki örneği; her çalışmada bir "task instance" olur</td></tr>
<tr><td><code>a &gt;&gt; b</code></td><td>b, a'dan sonra çalışır (<code>a.set_downstream(b)</code>)</td></tr>
<tr><td>retries / retry_delay</td><td>Başarısız görevin kaç kez, ne aralıkla yeniden deneneceği</td></tr>
<tr><td>XCom</td><td>Görevler arasında <b>küçük</b> veri (dosya yolu, satır sayısı) aktarımı; büyük veri değil</td></tr>
<tr><td>Data interval / logical date</td><td>Çalışmanın işlediği zaman dilimi; backfill bununla yapılır</td></tr>
</table></div>
<pre class="code"># pip install apache-airflow  (yerelde: airflow standalone)
from datetime import datetime, timedelta
from airflow.decorators import dag, task
from airflow.operators.bash import BashOperator

varsayilan = {"retries": 3, "retry_delay": timedelta(minutes=5),
              "retry_exponential_backoff": True, "email_on_failure": True}

@dag(schedule="0 2 * * *", start_date=datetime(2025, 1, 1), catchup=False,
     default_args=varsayilan, tags=["anadolu-market"])
def gunluk_satis():
    @task
    def siparis_cek(ds=None) -&gt; str:          # ds: işlenen gün (YYYY-MM-DD)
        yol = f"/data/ham/siparis_{ds}.csv"
        # ... API'den çek, dosyaya yaz ...
        return yol                            # XCom ile sonraki göreve gider

    @task
    def temizle(yol: str) -&gt; int:
        # ... oku, doğrula, temiz tabloya yaz ...
        return 1250                           # satır sayısı

    @task
    def rapor(satir: int):
        print(f"{satir} satır işlendi")

    yedek = BashOperator(task_id="yedekle", bash_command="pg_dump anadolu &gt; /yedek/{{ ds }}.sql")
    satir = temizle(siparis_cek())
    satir &gt;&gt; [rapor(satir), yedek]

gunluk_satis()</pre>
<p>TaskFlow API'de (<code>@task</code>) bir görevin dönüş değerini diğerine argüman olarak vermek hem bağımlılığı hem XCom aktarımını kendiliğinden kurar. <code>{{ ds }}</code> Jinja şablonudur; Airflow onu çalışmanın tarihiyle doldurur. <code>catchup=True</code> olsaydı start_date'ten bugüne kadar kaçırılan tüm günler tek tek çalıştırılırdı (backfill).</p>
<div class="tbl-wrap"><table>
<tr><th>Araç</th><th>Yaklaşım</th><th>Ne zaman?</th></tr>
<tr><td>cron + betik</td><td>Zaman tabanlı, bağımlılık yok</td><td>Birkaç bağımsız iş</td></tr>
<tr><td>Airflow</td><td>Görev odaklı DAG, zengin operator ekosistemi</td><td>Kurumsal, çok ekipli veri platformu</td></tr>
<tr><td>Prefect</td><td>Sıradan Python fonksiyonlarına <code>@flow</code>/<code>@task</code>; dinamik akış kolay</td><td>Python ağırlıklı ekip, hızlı başlangıç</td></tr>
<tr><td>Dagster</td><td>Varlık (asset) odaklı: "hangi tablo hangi tablodan üretilir"</td><td>Veri soy ağacı ve kalite önemliyse</td></tr>
<tr><td>Celery / RQ</td><td>Görev kuyruğu (zamanlayıcı değil)</td><td>Web uygulamasından arka plan işi</td></tr>
</table></div>

<h2>İdempotentlik ve yeniden çalıştırma</h2>
<p>Orkestrasyonun altın kuralı: <b>bir görevi aynı girdiyle iki kez çalıştırmak, bir kez çalıştırmakla aynı sonucu vermelidir</b> (idempotent). Çünkü görevler yeniden denenir, elle yeniden başlatılır, backfill edilir. "Satırları tabloya ekle" idempotent değildir: ikinci çalışmada her satır iki kez olur. "Bu günün bölümünü (partition) sil, sonra yaz" ya da "anahtar varsa güncelle" (upsert) idempotenttir.</p>
<pre class="py">import sqlite3
db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE gunluk_satis (tarih TEXT, sehir TEXT, ciro REAL)")

def yukle(tarih, satirlar):
    with db:   # işlem (transaction): ya hepsi ya hiçbiri
        db.execute("DELETE FROM gunluk_satis WHERE tarih = ?", (tarih,))
        db.executemany("INSERT INTO gunluk_satis VALUES (?, ?, ?)",
                       [(tarih, s, c) for s, c in satirlar])

veri = [("İzmir", 1500.0), ("Ankara", 900.0)]
yukle("2025-03-01", veri)
yukle("2025-03-01", veri)          # yeniden deneme: kopya oluşmaz
yukle("2025-03-02", [("İzmir", 700.0)])
print(db.execute("SELECT tarih, COUNT(*), SUM(ciro) FROM gunluk_satis GROUP BY tarih").fetchall())</pre>
<p>Diğer ilkeler: görev <b>işlediği zaman dilimini parametre olarak alsın</b> (<code>datetime.now()</code> değil; yoksa dünün işini bugün yeniden çalıştıramazsın), çıktı dosyaları tarihli olsun, yan etkiler (e-posta, ödeme) tekrar gönderimi önleyen bir anahtarla korunsun.</p>

<h2>Yeniden deneme, hata bildirimi ve gözlemlenebilirlik</h2>
<p>Ağ kopması, kilitli tablo, geçici 503 gibi <b>geçici</b> hatalar yeniden denenir; bekleme süresi her denemede katlanır (üstel geri çekilme, exponential backoff) ki zaten zorlanan sisteme yük bindirilmesin. Kalıcı hatalar (bozuk veri, yanlış parola) yeniden denenmez; hemen başarısız olup haber verilir.</p>
<pre class="py">import functools

def yeniden_dene(deneme=3, ilk_bekleme=1.0, gecici=(ConnectionError, TimeoutError), uyu=None):
    def dekorator(f):
        @functools.wraps(f)
        def sarmal(*args, **kwargs):
            bekleme = ilk_bekleme
            for i in range(1, deneme + 1):
                try:
                    return f(*args, **kwargs)
                except gecici as e:
                    if i == deneme:
                        raise
                    print(f"  {f.__name__} deneme {i} başarısız ({e}); {bekleme} sn sonra tekrar")
                    (uyu or (lambda s: None))(bekleme)
                    bekleme *= 2
        return sarmal
    return dekorator

sayac = {"n": 0}

@yeniden_dene(deneme=4)
def siparis_cek():
    sayac["n"] += 1
    if sayac["n"] &lt; 3:
        raise ConnectionError("API yanıt vermedi")
    return 120

print("Çekilen satır:", siparis_cek())</pre>
<p>Haber verme katmanları: görev başarısız olduğunda (Airflow'da <code>on_failure_callback</code>) Slack/Teams/e-posta mesajı; iş hiç başlamazsa sessiz kalmamak için "ölü adam anahtarı" (dead man's switch: iş her başarıyla bittiğinde bir izleme servisine sinyal gönderir, sinyal gelmezse alarm çalar); SLA ("rapor 07:00'ye kadar hazır olmalı") ihlalinde uyarı.</p>
<p>Gözlemlenebilirlik (observability) için her görev en azından şunları yapılandırılmış log (JSON satırı) olarak yazmalı: görev adı, çalışma kimliği, işlenen tarih, başlangıç-bitiş, süre, okunan/yazılan satır sayısı, sonuç. Bu sayılar metrik sistemine (Prometheus, Datadog, CloudWatch) gider; "dün 1250 satır geldi, bugün 3" gibi sessiz veri sorunları ancak böyle yakalanır.</p>
<pre class="py">import json, time

def calistir_ve_logla(ad, f, tarih):
    bas = time.perf_counter()
    kayit = {"gorev": ad, "tarih": tarih}
    try:
        kayit["satir"] = f(tarih)
        kayit["durum"] = "basarili"
    except Exception as e:
        kayit.update(durum="basarisiz", hata=f"{type(e).__name__}: {e}")
    kayit["sure_ms"] = round((time.perf_counter() - bas) * 1000)
    print(json.dumps({k: v for k, v in kayit.items() if k != "sure_ms"}, ensure_ascii=False))
    return kayit

calistir_ve_logla("temizle", lambda t: 1250, "2025-03-01")
calistir_ve_logla("rapor", lambda t: 1 / 0, "2025-03-01")</pre>
<div class="tip"><b>Küçük başla</b>İki üç işin varsa cron + iyi loglanan, idempotent betikler yeter. Bağımlılıklar, yeniden denemeler ve izleme ihtiyacı arttıkça bir orkestratöre geç. Araç değişse de bu dersteki ilkeler (DAG, idempotentlik, geçici/kalıcı hata ayrımı, gözlemlenebilirlik) aynı kalır.</div>
<div class="note"><b>Gerçek işte</b>Veri mühendisliği ekiplerinde en çok zaman alan iş yeni akış yazmak değil, gece 03:00'te düşen akışı anlamaktır. Bu yüzden kod incelemesinde şu sorular sorulur: Bu görev iki kez çalışırsa ne olur? Dünün verisini yeniden işleyebilir miyim? Hata olunca kime, hangi bilgiyle haber gidiyor? Görev ne kadar sürüyor, kaç satır işliyor ve bunu nereden görüyorum? Bu sorulara cevabı olan bir akış, "çalışıyor" olandan çok daha değerlidir.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Sensörler ve olay tabanlı tetikleme</h3>
<p>Her şey saatle başlamaz. "Şube dosyaları S3'e düşünce başla" gibi durumlar için sensörler (FileSensor, S3KeySensor) ya da Airflow'un veri kümesi (dataset/asset) tabanlı zamanlaması kullanılır: üretici DAG bir tabloyu güncellediğinde tüketici DAG kendiliğinden tetiklenir. Sensörleri "reschedule" modunda çalıştır ki beklerken işçi yuvası (worker slot) işgal etmesin.</p>
<h3>Eşzamanlılık ve kaynak yönetimi</h3>
<p><code>max_active_runs</code> aynı DAG'ın üst üste binmesini, havuzlar (pools) aynı veritabanına aynı anda bağlanan görev sayısını sınırlar. Uzun işlerin üst üste binmesi (bir önceki çalışma bitmeden yenisinin başlaması) idempotent olmayan işlerde veri bozulmasının en sık nedenidir; APScheduler'da <code>max_instances=1</code> bunun karşılığıdır.</p>
<h3>Veri sözleşmeleri ve kalite kapıları</h3>
<p>Akışın ortasına kalite kapısı koy: satır sayısı beklenen aralıkta mı, zorunlu sütunlarda boş değer var mı, toplam ciro dünkünden %90 düşük mü? Kapı başarısızsa akış durur ve kötü veri raporlara ulaşmaz. Great Expectations, Soda ya da dbt testleri bu iş için kullanılır.</p>
</section>
`,
  ex: [
    { t: 'mc',
      stage: 'Isınma',
      q: '<code>30 2 * * 1-5</code> cron ifadesi ne zaman çalışır?',
      o: ['Her gün 02:30\'da', 'Hafta içi her gün 02:30\'da', 'Ayın 1-5. günleri 02:30\'da', 'Hafta içi her gün 30 dakikada bir'],
      a: 1,
      why: 'Alanlar dakika (30), saat (2), ayın günü (*), ay (*), haftanın günü (1-5 = Pazartesi-Cuma) sırasındadır. 1-5 beşinci alanda olduğu için ayın günleri değil hafta içi günlerdir; 30 sabit dakikadır, "her 30 dakika" için */30 yazılırdı.' },
    { t: 'mc',
      stage: 'Isınma',
      q: 'Hangi yükleme yöntemi <b>idempotent</b>tir?',
      o: ['Her çalışmada günün satırlarını tabloya INSERT etmek', 'Önce o günün satırlarını silip aynı işlemde yeniden yazmak', 'Satırları dosyanın sonuna append kipinde eklemek', 'Her çalışmada tabloya yeni bir otomatik artan kimlikle eklemek'],
      a: 1,
      why: 'Sil-ve-yaz (ya da upsert) aynı girdiyle kaç kez çalışırsa çalışsın aynı son durumu üretir. Düz INSERT, append ve otomatik kimlikle ekleme her yeniden denemede kopya üretir.' },
    { t: 'mc',
      stage: 'Isınma',
      q: 'Airflow\'da XCom ne için kullanılmalıdır?',
      o: ['Görevler arasında 2 GB\'lık DataFrame\'leri doğrudan bellekte taşımak için', 'Görevler arasında dosya yolu, satır sayısı gibi küçük değerleri aktarmak için', 'DAG\'ın zamanlamasını ve başlangıç tarihini çalışma anında değiştirmek için', 'Başarısız görevleri belirli aralıklarla otomatik yeniden denemek için'],
      a: 1,
      why: 'XCom meta veritabanında saklanır; küçük, özet değerler içindir. Büyük veri dosya/nesne deposuna yazılır ve XCom ile yalnız yolu aktarılır. Zamanlama schedule, yeniden deneme retries ile ayarlanır.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Bu kod ne yazdırır?',
      code: 'from graphlib import TopologicalSorter\nts = TopologicalSorter({"rapor": {"temizle"}, "temizle": {"cek"}, "cek": set()})\nprint(list(ts.static_order()))\n',
      o: ['[\'rapor\', \'temizle\', \'cek\']', '[\'cek\', \'temizle\', \'rapor\']', '[\'temizle\', \'cek\', \'rapor\']', 'CycleError'],
      a: 1,
      why: 'Sözlükte her görevin değeri, ondan ÖNCE bitmesi gerekenlerdir. cek kimseyi beklemez, temizle cek\'i, rapor temizle\'yi bekler; topolojik sıra cek → temizle → rapor olur. Döngü olmadığı için hata yoktur.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Yeniden deneme döngüsü: bu kod ne yazdırır?',
      code: 'denemeler = []\nbekleme = 1\nfor i in range(1, 5):\n    denemeler.append(i)\n    if i >= 3:\n        break\n    bekleme *= 2\nprint(denemeler, bekleme)\n',
      o: ['[1, 2, 3] 4', '[1, 2, 3] 8', '[1, 2, 3, 4] 8', '[1, 2] 4'],
      a: 0,
      why: 'Üçüncü denemede başarı olur (break). İlk iki başarısız denemeden sonra bekleme 1 → 2 → 4 olmuştur; üçüncüde break, çarpmadan önce geldiği için bekleme 4 kalır. Üstel geri çekilme böyle katlanır.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Paralel katmanlar: bu kod ne yazdırır?',
      code: 'from graphlib import TopologicalSorter\nts = TopologicalSorter({"temizle": {"siparis", "musteri"}, "rapor": {"temizle"}, "stok": {"siparis"}})\nts.prepare()\nwhile ts.is_active():\n    hazir = sorted(ts.get_ready())\n    print(hazir)\n    ts.done(*hazir)\n',
      o: ['[\'musteri\', \'siparis\']\n[\'stok\', \'temizle\']\n[\'rapor\']', '[\'siparis\']\n[\'musteri\']\n[\'stok\', \'temizle\']\n[\'rapor\']', '[\'musteri\', \'siparis\', \'stok\']\n[\'temizle\']\n[\'rapor\']', '[\'musteri\', \'siparis\']\n[\'temizle\']\n[\'stok\', \'rapor\']'],
      a: 0,
      why: 'İlk katman kimseyi beklemeyenlerdir: musteri ve siparis. İkisi bitince hem temizle (ikisini bekliyordu) hem stok (yalnız siparişi bekliyordu) hazır olur. rapor ancak temizle bitince açılır. Aynı katmandakiler paralel çalışabilir.' },
    { t: 'order',
      stage: 'Kodu oku',
      q: '<p>Görev bağımlılıklarından çalışma sırasını üreten ve döngüyü yakalayan programın satırlarını sırala.</p>',
      lines: ['from graphlib import TopologicalSorter, CycleError', 'akis = {"rapor": {"temizle"}, "temizle": {"cek"}}', 'ts = TopologicalSorter(akis)', 'try:', '    print(" -> ".join(ts.static_order()))', 'except CycleError as e:', '    print("Döngü:", e.args[1])'],
      expect: 'cek -> temizle -> rapor\n',
      hint: 'İçe aktarma, veri, sıralayıcı; sonra try/except bloğu.',
      why: 'static_order döngü varsa CycleError fırlatır; e.args[1] döngüdeki düğümleri verir. Döngü yoksa sıra cek → temizle → rapor olur.' },
    { id: 'orkestrasyon-1',
      t: 'code',
      stage: 'Rehberli',
      diff: 1,
      q: '<p><code>gorev_sirasi(bagimliliklar)</code> fonksiyonunu yaz: <code>{gorev: [önce bitmesi gerekenler]}</code> sözlüğünden geçerli bir çalışma sırası (liste) döndürsün. Döngü varsa <code>ValueError</code> fırlatsın ve mesajında <code>"döngü"</code> kelimesi ve döngüdeki görev adları geçsin.</p>',
      guide: ['graphlib\'den TopologicalSorter ve CycleError\'ı içe aktar.', 'Sözlüğü doğrudan TopologicalSorter\'a ver (listeler de kabul edilir).', 'list(ts.static_order()) ile sırayı al.', 'CycleError yakalanırsa e.args[1] ile döngüyü al ve ValueError fırlat.'],
      example: 'from graphlib import TopologicalSorter\nyemek = {"pişir": ["doğra"], "servis": ["pişir"]}\nprint(list(TopologicalSorter(yemek).static_order()))\n',
      start: 'from graphlib import TopologicalSorter, CycleError\n\ndef gorev_sirasi(bagimliliklar):\n    # TODO: sıralayıcı kur, static_order ile listeyi döndür, döngüde ValueError\n    pass\n',
      sol: 'from graphlib import TopologicalSorter, CycleError\n\ndef gorev_sirasi(bagimliliklar):\n    try:\n        return list(TopologicalSorter(bagimliliklar).static_order())\n    except CycleError as e:\n        raise ValueError(f"döngü bulundu: {\' -> \'.join(e.args[1])}") from None\n',
      tests: 'akis = {"temizle": ["siparis_cek", "musteri_cek"], "rapor": ["temizle"], "eposta": ["rapor"], "stok": ["siparis_cek"]}\nsira = gorev_sirasi(akis)\nassert isinstance(sira, list) and set(sira) == {"siparis_cek", "musteri_cek", "temizle", "rapor", "eposta", "stok"}, f"tüm görevler (bağımlılık olarak geçenler dahil) sırada olmalı; gelen {sira}"\nfor gorev, oncekiler in akis.items():\n    for o in oncekiler:\n        assert sira.index(o) < sira.index(gorev), f"{o}, {gorev} görevinden önce gelmeli"\nassert gorev_sirasi({}) == [], "boş akış boş liste"\ntry:\n    gorev_sirasi({"a": ["b"], "b": ["c"], "c": ["a"]})\n    assert False, "döngüde ValueError bekleniyordu"\nexcept ValueError as e:\n    assert "döngü" in str(e) and all(x in str(e) for x in "abc"), f"mesajda \\\'döngü\\\' ve görev adları geçmeli: {e}"\n',
      hints: ['TopologicalSorter(sozluk) her anahtarın değerini "önceki düğümler" olarak yorumlar.', 'CycleError\'ın ikinci argümanı (e.args[1]) döngüdeki düğümlerin listesidir.', 'raise ValueError(f"döngü bulundu: {e.args[1]}") from None'],
      why: 'Orkestratörler DAG\'ı yüklerken önce bu kontrolü yapar: döngülü bir akış hiç çalıştırılamaz, bu yüzden erken ve anlaşılır bir hatayla reddedilmelidir.' },
    { id: 'orkestrasyon-2',
      t: 'code',
      stage: 'Rehberli',
      diff: 2,
      q: '<p><code>cron_alan_ac(alan, alt, ust)</code> fonksiyonunu yaz: bir cron alanını değerlerin sıralı listesine çevirsin. Desteklenecek biçimler ve birleşimleri: <code>*</code>, <code>5</code>, <code>1-5</code>, <code>*/15</code>, <code>10-30/10</code>, virgülle liste (<code>1,15,30</code> ya da <code>1-3,10</code>). Aralık dışı değer, ters aralık (<code>5-1</code>) ya da 0/negatif adımda <code>ValueError</code> fırlatsın.</p>',
      guide: ['Alanı virgülle parçalara ayır; her parçayı ayrı işle.', 'Parçayı partition("/") ile aralık ve adım olarak böl; adım yoksa 1.', 'Aralık "*" ise alt-ust; "-" içeriyorsa iki sayı; değilse tek sayı.', 'Sınırları ve adımı denetle, range ile değerleri bir kümeye ekle.', 'sorted(küme) döndür.'],
      example: 'parca = "10-30/10"\naralik, _, adim = parca.partition("/")\nbas, son = map(int, aralik.split("-"))\nprint(list(range(bas, son + 1, int(adim))))\n',
      start: 'def cron_alan_ac(alan, alt, ust):\n    degerler = set()\n    for parca in alan.split(","):\n        aralik, _, adim = parca.partition("/")\n        # TODO: bas, son ve adımı belirle; doğrula; değerleri ekle\n    return sorted(degerler)\n',
      sol: 'def cron_alan_ac(alan, alt, ust):\n    degerler = set()\n    for parca in alan.split(","):\n        aralik, _, adim = parca.partition("/")\n        if aralik == "*":\n            bas, son = alt, ust\n        elif "-" in aralik:\n            bas, son = map(int, aralik.split("-"))\n        else:\n            bas = son = int(aralik)\n        adim = int(adim) if adim else 1\n        if adim <= 0 or bas > son or bas < alt or son > ust:\n            raise ValueError(f"geçersiz cron parçası: {parca}")\n        degerler.update(range(bas, son + 1, adim))\n    return sorted(degerler)\n',
      tests: 'assert cron_alan_ac("*", 0, 6) == [0, 1, 2, 3, 4, 5, 6], "* tüm aralık"\nassert cron_alan_ac("*/15", 0, 59) == [0, 15, 30, 45], "*/15 dakika"\nassert cron_alan_ac("1-5", 0, 6) == [1, 2, 3, 4, 5], "aralık"\nassert cron_alan_ac("10-30/10", 0, 59) == [10, 20, 30], "adımlı aralık"\nassert cron_alan_ac("1-3,10,2", 1, 31) == [1, 2, 3, 10], "liste: tekrarlar bir kez, sıralı"\nassert cron_alan_ac("7", 0, 23) == [7], "tek değer"\nfor kotu, a, u in [("60", 0, 59), ("5-1", 0, 59), ("*/0", 0, 59), ("0", 1, 31), ("1-13", 1, 12)]:\n    try:\n        cron_alan_ac(kotu, a, u)\n        assert False, f"{kotu!r} ({a}-{u}) için ValueError bekleniyordu"\n    except ValueError:\n        pass\n',
      hints: ['Her parçada üç durum var: "*", "a-b", tek sayı. Adım hepsine uygulanabilir.', 'int("x") zaten ValueError verir; sen ek olarak sınırları ve adımı kontrol et.', 'degerler.update(range(bas, son + 1, adim))'],
      why: 'Cron alanları küçük bir dil oluşturur: liste, aralık ve adım birleştirilebilir. Önce her alanı bir değer kümesine açmak, "bir sonraki çalışma zamanı" hesabını basit küme üyeliği sorgularına indirger.' },
    { id: 'orkestrasyon-3',
      t: 'code',
      stage: 'Rehberli',
      diff: 2,
      q: '<p>Parametreli bir yeniden deneme dekoratörü yaz: <code>yeniden_dene(deneme=3, ilk_bekleme=1, carpan=2, gecici=(ConnectionError, TimeoutError), uyu=time.sleep)</code>.</p><ul><li>Fonksiyon <code>gecici</code> türünden bir hata fırlatırsa <code>uyu(bekleme)</code> çağrılıp yeniden denenir; bekleme her seferinde <code>carpan</code> ile çarpılır.</li><li>Deneme hakkı biterse <b>son hata</b> yeniden fırlatılır.</li><li><code>gecici</code> dışındaki hatalar hiç beklemeden hemen fırlatılır.</li><li><code>functools.wraps</code> kullan.</li></ul><p>Testte <code>uyu</code> yerine bekleme sürelerini kaydeden sahte bir fonksiyon verilecek.</p>',
      guide: ['Üç katman: yeniden_dene(...) → dekorator(f) → sarmal(*args, **kwargs).', 'bekleme = ilk_bekleme ile başla; for döngüsüyle 1..deneme arasında dene.', 'except gecici: son denemeyse raise; değilse uyu(bekleme) ve bekleme *= carpan.', 'Başarılı çağrıda sonucu hemen return et.'],
      example: 'import functools\ndef say(f):\n    @functools.wraps(f)\n    def sarmal(*a, **k):\n        sarmal.cagri += 1\n        return f(*a, **k)\n    sarmal.cagri = 0\n    return sarmal\n@say\ndef kare(x):\n    return x * x\nprint(kare(3), kare(4), kare.cagri, kare.__name__)\n',
      start: 'import functools, time\n\ndef yeniden_dene(deneme=3, ilk_bekleme=1, carpan=2, gecici=(ConnectionError, TimeoutError), uyu=time.sleep):\n    def dekorator(f):\n        @functools.wraps(f)\n        def sarmal(*args, **kwargs):\n            # TODO: deneme döngüsü, geçici hatada uyu ve beklemeyi katla\n            return f(*args, **kwargs)\n        return sarmal\n    return dekorator\n',
      sol: 'import functools, time\n\ndef yeniden_dene(deneme=3, ilk_bekleme=1, carpan=2, gecici=(ConnectionError, TimeoutError), uyu=time.sleep):\n    def dekorator(f):\n        @functools.wraps(f)\n        def sarmal(*args, **kwargs):\n            bekleme = ilk_bekleme\n            for i in range(1, deneme + 1):\n                try:\n                    return f(*args, **kwargs)\n                except gecici:\n                    if i == deneme:\n                        raise\n                    uyu(bekleme)\n                    bekleme *= carpan\n        return sarmal\n    return dekorator\n',
      tests: 'beklemeler = []\nsayac = {"n": 0}\n@yeniden_dene(deneme=4, ilk_bekleme=1, uyu=beklemeler.append)\ndef cek():\n    """API\'den sipariş çeker."""\n    sayac["n"] += 1\n    if sayac["n"] < 3:\n        raise ConnectionError("bağlantı koptu")\n    return "tamam"\nassert cek() == "tamam" and sayac["n"] == 3, "üçüncü denemede başarılı olmalı"\nassert beklemeler == [1, 2], f"iki başarısız denemeden sonra 1 ve 2 sn beklenmeli; gelen {beklemeler}"\nassert cek.__name__ == "cek" and cek.__doc__ == "API\\\'den sipariş çeker.", "functools.wraps ile ad ve belge korunmalı"\nb2 = []\n@yeniden_dene(deneme=3, ilk_bekleme=5, carpan=3, uyu=b2.append)\ndef hep_timeout():\n    raise TimeoutError("zaman aşımı")\ntry:\n    hep_timeout()\n    assert False, "deneme hakkı bitince son hata fırlatılmalı"\nexcept TimeoutError:\n    pass\nassert b2 == [5, 15], f"3 denemede 2 bekleme olmalı: 5 ve 15; gelen {b2}"\nb3 = []\nn3 = {"n": 0}\n@yeniden_dene(uyu=b3.append)\ndef bozuk_veri():\n    n3["n"] += 1\n    raise ValueError("tutar negatif")\ntry:\n    bozuk_veri()\n    assert False, "ValueError fırlatılmalı"\nexcept ValueError:\n    pass\nassert n3["n"] == 1 and b3 == [], "kalıcı hata (ValueError) yeniden denenmemeli"\n',
      hints: ['except gecici: yalnız listelenen türleri yakalar; diğerleri kendiliğinden yukarı çıkar.', 'Son denemede bekleme yapma, doğrudan raise (çıplak raise son hatayı aynen fırlatır).', 'bekleme *= carpan'],
      why: 'Uyku fonksiyonunu parametre yapmak (bağımlılık enjeksiyonu) dekoratörü saniyeler beklemeden test edilebilir kılar. Geçici ve kalıcı hata ayrımı, yeniden denemenin sorunları gizlemesini önler.' },
    { id: 'orkestrasyon-4',
      t: 'code',
      stage: 'Rehberli',
      diff: 2,
      q: '<p><code>paralel_katmanlar(bagimliliklar)</code> fonksiyonunu yaz: aynı anda çalışabilecek görev gruplarını sırasıyla döndürsün. Her katman alfabetik sıralı bir liste olsun. Örnek: <code>{"temizle": ["cek_a", "cek_b"], "rapor": ["temizle"]}</code> → <code>[["cek_a", "cek_b"], ["temizle"], ["rapor"]]</code>. Ayrıca <code>max_paralel</code> parametresi (varsayılan <code>None</code>) verilirse hiçbir katman bu sayıdan büyük olmasın: hazır görevler alfabetik sırayla en fazla <code>max_paralel</code>\'lik gruplara bölünsün ve her grup bitince yeni hazır olanlar sıraya eklensin.</p>',
      guide: ['TopologicalSorter kur ve prepare() çağır.', 'Bekleyen hazır görevleri tutan bir liste aç.', 'is_active() oldukça: get_ready() ile yeni hazırları ekle, listeyi sırala.', 'İlk max_paralel kadarını (ya da hepsini) katman olarak al, done(*katman) ile bitir.', 'Katmanları döndür.'],
      example: 'from graphlib import TopologicalSorter\nts = TopologicalSorter({"b": ["a"], "c": ["a"]})\nts.prepare()\nprint(ts.get_ready())\nts.done("a")\nprint(sorted(ts.get_ready()))\n',
      start: 'from graphlib import TopologicalSorter\n\ndef paralel_katmanlar(bagimliliklar, max_paralel=None):\n    ts = TopologicalSorter(bagimliliklar)\n    ts.prepare()\n    katmanlar = []\n    # TODO\n    return katmanlar\n',
      sol: 'from graphlib import TopologicalSorter\n\ndef paralel_katmanlar(bagimliliklar, max_paralel=None):\n    ts = TopologicalSorter(bagimliliklar)\n    ts.prepare()\n    katmanlar = []\n    bekleyen = []\n    while ts.is_active():\n        bekleyen.extend(ts.get_ready())\n        bekleyen.sort()\n        n = len(bekleyen) if max_paralel is None else max_paralel\n        katman, bekleyen = bekleyen[:n], bekleyen[n:]\n        ts.done(*katman)\n        katmanlar.append(katman)\n    return katmanlar\n',
      tests: 'akis = {"temizle": ["cek_a", "cek_b"], "rapor": ["temizle"]}\nassert paralel_katmanlar(akis) == [["cek_a", "cek_b"], ["temizle"], ["rapor"]], f"örnek akış hatalı: {paralel_katmanlar(akis)}"\nbuyuk = {"birlestir": ["siparis", "musteri", "urun"], "stok": ["urun"], "rapor": ["birlestir", "stok"]}\nassert paralel_katmanlar(buyuk) == [["musteri", "siparis", "urun"], ["birlestir", "stok"], ["rapor"]], f"paralel katmanlar hatalı: {paralel_katmanlar(buyuk)}"\nassert paralel_katmanlar(buyuk, max_paralel=2) == [["musteri", "siparis"], ["urun"], ["birlestir", "stok"], ["rapor"]], f"max_paralel=2 ile hatalı: {paralel_katmanlar(buyuk, max_paralel=2)}"\nassert paralel_katmanlar({}) == [], "boş akış"\nassert all(len(k) <= 1 for k in paralel_katmanlar(buyuk, max_paralel=1)), "max_paralel=1 tamamen sıralı çalışmalı"\n',
      hints: ['get_ready() aynı görevi iki kez vermez; vermediklerini sen bekleyen listede tutmalısın.', 'Dilimle böl: katman, bekleyen = bekleyen[:n], bekleyen[n:]', 'Yalnız gerçekten çalıştırdığın (katmandaki) görevler için done çağır.'],
      why: 'Orkestratörlerin havuz (pool) ve eşzamanlılık sınırları tam olarak böyle çalışır: hazır görevler bir kuyrukta bekler, işçi sayısı kadarı çalıştırılır, bitenler yeni görevlerin önünü açar.' },
    { id: 'orkestrasyon-5',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p>Anadolu Market günlük satış tablosuna <b>idempotent</b> yükleme yapan <code>gunluk_yukle(db, tarih, satirlar)</code> fonksiyonunu yaz. Tablo: <code>gunluk_satis(tarih TEXT, sehir TEXT, ciro REAL)</code>. Kurallar:</p><ul><li>Aynı tarih için kaç kez çalışırsa çalışsın sonuç bir kez çalışmış gibi olmalı (o günün eski satırları silinip yenileri yazılır).</li><li>Diğer günlerin satırlarına dokunulmamalı.</li><li>Silme ve yazma tek bir işlem (transaction) olmalı: satırlardan biri hatalıysa (ciro negatif → <code>ValueError</code>) o günün <b>eski</b> verisi korunmalı.</li><li>Fonksiyon yazılan satır sayısını döndürsün.</li></ul>',
      start: 'import sqlite3\n\ndef gunluk_yukle(db, tarih, satirlar):\n    pass\n',
      sol: 'import sqlite3\n\ndef gunluk_yukle(db, tarih, satirlar):\n    with db:\n        db.execute("DELETE FROM gunluk_satis WHERE tarih = ?", (tarih,))\n        for sehir, ciro in satirlar:\n            if ciro < 0:\n                raise ValueError(f"negatif ciro: {sehir}")\n            db.execute("INSERT INTO gunluk_satis VALUES (?, ?, ?)", (tarih, sehir, ciro))\n    return len(satirlar)\n',
      tests: 'db = sqlite3.connect(":memory:")\ndb.execute("CREATE TABLE gunluk_satis (tarih TEXT, sehir TEXT, ciro REAL)")\ndef ozet():\n    return db.execute("SELECT tarih, COUNT(*), SUM(ciro) FROM gunluk_satis GROUP BY tarih ORDER BY tarih").fetchall()\nassert gunluk_yukle(db, "2025-03-01", [("İzmir", 1500.0), ("Ankara", 900.0)]) == 2, "yazılan satır sayısı dönmeli"\ngunluk_yukle(db, "2025-03-01", [("İzmir", 1500.0), ("Ankara", 900.0)])\ngunluk_yukle(db, "2025-03-02", [("Bursa", 400.0)])\nassert ozet() == [("2025-03-01", 2, 2400.0), ("2025-03-02", 1, 400.0)], f"yeniden çalıştırma kopya üretmemeli: {ozet()}"\ngunluk_yukle(db, "2025-03-01", [("İzmir", 1600.0)])\nassert ozet() == [("2025-03-01", 1, 1600.0), ("2025-03-02", 1, 400.0)], "düzeltilmiş veriyle yeniden çalıştırma eski günü tamamen değiştirmeli, diğer güne dokunmamalı"\ntry:\n    gunluk_yukle(db, "2025-03-01", [("İzmir", 1700.0), ("Van", -5.0)])\n    assert False, "negatif ciroda ValueError bekleniyordu"\nexcept ValueError:\n    pass\nassert ozet() == [("2025-03-01", 1, 1600.0), ("2025-03-02", 1, 400.0)], f"hata durumunda eski veri korunmalı (işlem geri alınmalı): {ozet()}"\n',
      hints: ['sqlite3 bağlantısını with bloğunda kullanmak, blok hatasız biterse commit, hata olursa rollback yapar.', 'Silme ve eklemeleri aynı with bloğunun içine koy; doğrulamayı da bloğun içinde yap ki hata silmeyi geri alsın.'],
      why: 'Sil-ve-yaz bölüm (partition) değişimi, toplu yüklemelerde en yaygın idempotentlik kalıbıdır. İşlem bütünlüğü olmadan yarıda kalan bir yükleme günün verisini boş bırakır: idempotentlik ve atomiklik birlikte gerekir.' },
    { id: 'orkestrasyon-6',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p>Backfill planlayıcısı yaz: <code>backfill_tarihleri(baslangic, bitis, tamamlananlar)</code>. <code>baslangic</code> ve <code>bitis</code> <code>"YYYY-MM-DD"</code> metinleridir (ikisi de dahil); <code>tamamlananlar</code> başarıyla işlenmiş tarih metinlerinin kümesidir. Henüz işlenmemiş günlerin listesini kronolojik sırayla döndürsün. <code>baslangic &gt; bitis</code> ise <code>ValueError</code>. Hafta sonu atlama seçeneği: <code>sadece_is_gunu=True</code> verilirse Cumartesi ve Pazar listelenmesin.</p>',
      start: 'from datetime import date, timedelta\n\ndef backfill_tarihleri(baslangic, bitis, tamamlananlar, sadece_is_gunu=False):\n    pass\n',
      sol: 'from datetime import date, timedelta\n\ndef backfill_tarihleri(baslangic, bitis, tamamlananlar, sadece_is_gunu=False):\n    bas, son = date.fromisoformat(baslangic), date.fromisoformat(bitis)\n    if bas > son:\n        raise ValueError("başlangıç bitişten sonra olamaz")\n    eksik = []\n    gun = bas\n    while gun <= son:\n        metin = gun.isoformat()\n        if metin not in tamamlananlar and not (sadece_is_gunu and gun.weekday() >= 5):\n            eksik.append(metin)\n        gun += timedelta(days=1)\n    return eksik\n',
      tests: 'tamam = {"2025-02-27", "2025-03-01", "2025-03-03"}\nassert backfill_tarihleri("2025-02-27", "2025-03-04", tamam) == ["2025-02-28", "2025-03-02", "2025-03-04"], f"ay geçişi dahil eksik günler: {backfill_tarihleri(\'2025-02-27\', \'2025-03-04\', tamam)}"\nassert backfill_tarihleri("2025-02-27", "2025-03-04", tamam, sadece_is_gunu=True) == ["2025-02-28", "2025-03-04"], "2 Mart 2025 Pazar; iş günü kipinde atlanmalı"\nassert backfill_tarihleri("2025-03-05", "2025-03-05", set()) == ["2025-03-05"], "tek günlük aralık"\nassert backfill_tarihleri("2024-02-28", "2024-03-01", set()) == ["2024-02-28", "2024-02-29", "2024-03-01"], "artık yıl"\ntry:\n    backfill_tarihleri("2025-03-05", "2025-03-01", set())\n    assert False, "ters aralıkta ValueError bekleniyordu"\nexcept ValueError:\n    pass\n',
      hints: ['date.fromisoformat("2025-03-01") metni tarihe çevirir; isoformat() geri çevirir.', 'Günleri timedelta(days=1) ile ilerlet; weekday() Pazartesi 0, Cumartesi 5, Pazar 6.'],
      why: 'Görevler işledikleri tarihi parametre olarak aldığında, eksik günleri hesaplayıp yeniden çalıştırmak (backfill) basit bir döngüye indirgenir. Airflow\'un catchup ve "airflow dags backfill" özelliği bu fikre dayanır.' },
    { id: 'orkestrasyon-7',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p>Çalışma günlüğünden gözlemlenebilirlik metrikleri çıkar. <code>gorev_metrikleri(kayitlar)</code> fonksiyonunu yaz; her kayıt <code>{"gorev", "durum", "sure_ms", "satir"}</code> içerir (<code>durum</code> <code>"basarili"</code> ya da <code>"basarisiz"</code>). Her görev için şu sözlüğü üret ve görev adına göre sıralı bir sözlük döndür:</p><ul><li><code>calisma</code>: toplam çalışma sayısı</li><li><code>basari_orani</code>: başarılı / toplam, 2 ondalık</li><li><code>ort_sure_ms</code>: <b>yalnız başarılı</b> çalışmaların ortalama süresi (tamsayıya yuvarlanmış); başarılı yoksa <code>None</code></li><li><code>son_satir</code>: son başarılı çalışmanın satır sayısı; yoksa <code>None</code></li><li><code>alarm</code>: son başarılı satır sayısı, önceki başarılı çalışmaların ortalamasının yarısından azsa <code>True</code> (önceki başarılı yoksa <code>False</code>)</li></ul>',
      start: 'def gorev_metrikleri(kayitlar):\n    pass\n',
      sol: 'def gorev_metrikleri(kayitlar):\n    gruplar = {}\n    for k in kayitlar:\n        gruplar.setdefault(k["gorev"], []).append(k)\n    sonuc = {}\n    for ad in sorted(gruplar):\n        tum = gruplar[ad]\n        basarili = [k for k in tum if k["durum"] == "basarili"]\n        satirlar = [k["satir"] for k in basarili]\n        alarm = False\n        if len(satirlar) >= 2:\n            onceki_ort = sum(satirlar[:-1]) / len(satirlar[:-1])\n            alarm = satirlar[-1] < onceki_ort / 2\n        sonuc[ad] = {\n            "calisma": len(tum),\n            "basari_orani": round(len(basarili) / len(tum), 2),\n            "ort_sure_ms": round(sum(k["sure_ms"] for k in basarili) / len(basarili)) if basarili else None,\n            "son_satir": satirlar[-1] if satirlar else None,\n            "alarm": alarm,\n        }\n    return sonuc\n',
      tests: 'log = [\n    {"gorev": "temizle", "durum": "basarili", "sure_ms": 1200, "satir": 1000},\n    {"gorev": "cek", "durum": "basarisiz", "sure_ms": 30000, "satir": 0},\n    {"gorev": "temizle", "durum": "basarili", "sure_ms": 1300, "satir": 1100},\n    {"gorev": "cek", "durum": "basarili", "sure_ms": 800, "satir": 1050},\n    {"gorev": "temizle", "durum": "basarisiz", "sure_ms": 50, "satir": 0},\n    {"gorev": "temizle", "durum": "basarili", "sure_ms": 1250, "satir": 40},\n    {"gorev": "rapor", "durum": "basarisiz", "sure_ms": 10, "satir": 0},\n]\nm = gorev_metrikleri(log)\nassert list(m) == ["cek", "rapor", "temizle"], "görev adına göre sıralı olmalı"\nassert m["temizle"] == {"calisma": 4, "basari_orani": 0.75, "ort_sure_ms": 1250, "son_satir": 40, "alarm": True}, f"temizle metrikleri hatalı: {m[\'temizle\']}"\nassert m["cek"] == {"calisma": 2, "basari_orani": 0.5, "ort_sure_ms": 800, "son_satir": 1050, "alarm": False}, f"cek: tek başarılı çalışmada alarm False: {m[\'cek\']}"\nassert m["rapor"] == {"calisma": 1, "basari_orani": 0.0, "ort_sure_ms": None, "son_satir": None, "alarm": False}, f"hiç başarılı yoksa None değerler: {m[\'rapor\']}"\nassert gorev_metrikleri([]) == {}, "boş günlük"\n',
      hints: ['Önce görev adına göre grupla (setdefault), sonra her grubu ayrı hesapla.', 'Başarısız çalışmaların süresi (ör. 30 sn zaman aşımı) ortalamayı bozar; yalnız başarılıları kullan.', 'Alarm: satirlar[-1] < ortalama(satirlar[:-1]) / 2'],
      why: 'Başarılı ama neredeyse boş çalışan bir görev (1000 yerine 40 satır), başarısız bir görevden daha tehlikelidir çünkü kimse fark etmez. Satır sayısı gibi hacim metrikleri ve basit eşikler sessiz veri sorunlarını yakalar.' },
    { id: 'orkestrasyon-8',
      t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      diff: 2,
      q: '<p>Hatayı bul ve düzelt. Anadolu Bank\'ın gün sonu işi <code>mutabakat_yukle(db, tarih, islemler)</code>, o günün işlemlerini <code>gun_sonu</code> tablosuna yazıyor. Airflow görevi zaman aşımından sonra yeniden denendiğinde toplamlar iki katına çıktı. Fonksiyonu <b>idempotent</b> yap: aynı tarih için tekrar çalıştırıldığında önceki yazdıklarının yerine geçsin. <code>islem_no</code> benzersizdir; tabloyu ya da imzayı değiştirmeden çöz.</p>',
      start: 'import sqlite3\n\ndef yeni_db():\n    db = sqlite3.connect(":memory:")\n    db.execute("CREATE TABLE gun_sonu (islem_no TEXT, tarih TEXT, tutar REAL)")\n    return db\n\ndef mutabakat_yukle(db, tarih, islemler):\n    with db:\n        for no, tutar in islemler:\n            db.execute("INSERT INTO gun_sonu VALUES (?, ?, ?)", (no, tarih, tutar))\n    return db.execute("SELECT SUM(tutar) FROM gun_sonu WHERE tarih = ?", (tarih,)).fetchone()[0]\n',
      sol: 'import sqlite3\n\ndef yeni_db():\n    db = sqlite3.connect(":memory:")\n    db.execute("CREATE TABLE gun_sonu (islem_no TEXT, tarih TEXT, tutar REAL)")\n    return db\n\ndef mutabakat_yukle(db, tarih, islemler):\n    with db:\n        db.execute("DELETE FROM gun_sonu WHERE tarih = ?", (tarih,))\n        for no, tutar in islemler:\n            db.execute("INSERT INTO gun_sonu VALUES (?, ?, ?)", (no, tarih, tutar))\n    return db.execute("SELECT SUM(tutar) FROM gun_sonu WHERE tarih = ?", (tarih,)).fetchone()[0]\n',
      tests: 'db = yeni_db()\nislemler = [("T1", 100.0), ("T2", 250.5)]\nassert mutabakat_yukle(db, "2025-03-01", islemler) == 350.5, "ilk çalışma toplamı"\nassert mutabakat_yukle(db, "2025-03-01", islemler) == 350.5, "yeniden deneme toplamı ikiye katlamamalı"\nmutabakat_yukle(db, "2025-03-02", [("T3", 75.0)])\nassert db.execute("SELECT COUNT(*) FROM gun_sonu").fetchone()[0] == 3, "toplam 3 satır olmalı (kopya yok, diğer gün korunur)"\nassert mutabakat_yukle(db, "2025-03-01", [("T1", 100.0)]) == 100.0, "düzeltilmiş veriyle yeniden çalıştırma eski satırları kaldırmalı"\n',
      hints: ['Düz INSERT her denemede yeni satır ekler.', 'Aynı işlem içinde önce o tarihin satırlarını sil: DELETE FROM gun_sonu WHERE tarih = ?'],
      why: 'Orkestratör görevleri en az bir kez (at-least-once) çalıştırır; zaman aşımında iş aslında bitmiş olabilir. Bu yüzden her yükleme, yeniden çalıştırmaya dayanıklı yazılmalıdır.' },
    { id: 'orkestrasyon-9',
      t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      diff: 2,
      q: '<p>Hatayı bul ve düzelt. Ekipteki <code>tekrar_dene(f, deneme=3)</code> yardımcısında iki sorun var: (1) deneme hakkı bittiğinde hatayı yutup <code>None</code> döndürüyor, bu yüzden akış "başarılı" görünüyor ve rapor boş gidiyor; (2) <code>ValueError</code> gibi kalıcı hataları da boşuna yeniden deniyor. Yalnız <code>ConnectionError</code> ve <code>TimeoutError</code> yeniden denensin; hak bitince ya da kalıcı hatada hata yukarı fırlatılsın.</p>',
      start: 'def tekrar_dene(f, deneme=3):\n    for i in range(deneme):\n        try:\n            return f()\n        except Exception as e:\n            print(f"deneme {i + 1} başarısız: {e}")\n    return None\n',
      sol: 'GECICI = (ConnectionError, TimeoutError)\n\ndef tekrar_dene(f, deneme=3):\n    for i in range(deneme):\n        try:\n            return f()\n        except GECICI as e:\n            print(f"deneme {i + 1} başarısız: {e}")\n            if i == deneme - 1:\n                raise\n',
      tests: 'n = {"a": 0}\ndef bazen():\n    n["a"] += 1\n    if n["a"] < 2:\n        raise ConnectionError("koptu")\n    return 42\nassert tekrar_dene(bazen) == 42 and n["a"] == 2, "geçici hatadan sonra başarı"\ndef hep_kopuk():\n    raise TimeoutError("zaman aşımı")\ntry:\n    tekrar_dene(hep_kopuk)\n    assert False, "hak bitince TimeoutError yukarı fırlatılmalı, None dönmemeli"\nexcept TimeoutError:\n    pass\nk = {"a": 0}\ndef bozuk():\n    k["a"] += 1\n    raise ValueError("geçersiz tarih")\ntry:\n    tekrar_dene(bozuk)\n    assert False, "ValueError yukarı fırlatılmalı"\nexcept ValueError:\n    pass\nassert k["a"] == 1, f"kalıcı hata yeniden denenmemeli; {k[\'a\']} kez çağrıldı"\n',
      hints: ['except Exception her şeyi yakalar; yalnız geçici türleri yakala.', 'Son denemede çıplak raise ile hatayı olduğu gibi yukarı gönder; fonksiyonun sonunda return None kalmasın.'],
      why: 'Hatayı yutan yeniden deneme, başarısızlığı "başarılı ama boş" bir sonuca çevirir: orkestratör görevi yeşil gösterir, alarm çalmaz, sorun günler sonra rapordaki eksik rakamlarla fark edilir. Görev başarısızsa başarısız görünmelidir.' },
    { id: 'orkestrasyon-10',
      t: 'code',
      stage: 'Meydan okuma',
      diff: 3,
      q: '<p>Cron ifadesinden bir sonraki çalışma zamanını hesaplayan <code>sonraki_calisma(ifade, baslangic)</code> fonksiyonunu yaz. <code>baslangic</code> bir <code>datetime</code>\'dır; sonuç ondan <b>kesinlikle sonraki</b> ilk eşleşen dakika olsun (saniye 0). Hazır <code>cron_alan_ac</code> fonksiyonunu kullan. Kurallar:</p><ul><li>Alanlar: dakika (0-59), saat (0-23), ayın günü (1-31), ay (1-12), haftanın günü (0-6, 0 = Pazar; <code>7</code> de Pazar kabul edilsin).</li><li>Standart cron kuralı: ayın günü ve haftanın günü alanlarının <b>ikisi de</b> <code>*</code> değilse, günlerden <b>biri</b> tutması yeterlidir (VEYA). Biri <code>*</code> ise diğeri belirleyicidir.</li><li>Beş alan yoksa <code>ValueError</code>. 4 yıl içinde eşleşme yoksa (ör. <code>0 0 31 2 *</code>) <code>ValueError</code>.</li><li>Verimli ol: dakika dakika 4 yıl taramak yerine günleri tara, gün uygunsa saat ve dakika kümelerinden ilk uygun zamanı seç.</li></ul>',
      start: 'from datetime import datetime, timedelta\n\ndef cron_alan_ac(alan, alt, ust):\n    degerler = set()\n    for parca in alan.split(","):\n        aralik, _, adim = parca.partition("/")\n        if aralik == "*":\n            bas, son = alt, ust\n        elif "-" in aralik:\n            bas, son = map(int, aralik.split("-"))\n        else:\n            bas = son = int(aralik)\n        degerler.update(range(bas, son + 1, int(adim) if adim else 1))\n    return sorted(degerler)\n\ndef sonraki_calisma(ifade, baslangic):\n    pass\n',
      sol: 'from datetime import datetime, timedelta\n\ndef cron_alan_ac(alan, alt, ust):\n    degerler = set()\n    for parca in alan.split(","):\n        aralik, _, adim = parca.partition("/")\n        if aralik == "*":\n            bas, son = alt, ust\n        elif "-" in aralik:\n            bas, son = map(int, aralik.split("-"))\n        else:\n            bas = son = int(aralik)\n        degerler.update(range(bas, son + 1, int(adim) if adim else 1))\n    return sorted(degerler)\n\ndef sonraki_calisma(ifade, baslangic):\n    alanlar = ifade.split()\n    if len(alanlar) != 5:\n        raise ValueError("cron ifadesi 5 alan içermeli")\n    dk, sa, gun_a, ay_a, hg_a = alanlar\n    dakikalar = cron_alan_ac(dk, 0, 59)\n    saatler = cron_alan_ac(sa, 0, 23)\n    gunler = set(cron_alan_ac(gun_a, 1, 31))\n    aylar = set(cron_alan_ac(ay_a, 1, 12))\n    hgunler = {d % 7 for d in cron_alan_ac(hg_a, 0, 7)}\n    gun_kisitli, hg_kisitli = gun_a != "*", hg_a != "*"\n\n    def gun_uygun(t):\n        if t.month not in aylar:\n            return False\n        g_ok = t.day in gunler\n        h_ok = (t.weekday() + 1) % 7 in hgunler\n        if gun_kisitli and hg_kisitli:\n            return g_ok or h_ok\n        return g_ok and h_ok\n\n    t = baslangic.replace(second=0, microsecond=0) + timedelta(minutes=1)\n    gun = t.replace(hour=0, minute=0)\n    for _ in range(366 * 4 + 1):\n        if gun_uygun(gun):\n            for s in saatler:\n                for d in dakikalar:\n                    aday = gun.replace(hour=s, minute=d)\n                    if aday >= t:\n                        return aday\n        gun += timedelta(days=1)\n    raise ValueError("4 yıl içinde eşleşen zaman yok")\n',
      tests: 'from datetime import datetime\nB = datetime(2025, 3, 14, 10, 7, 30)   # 14 Mart 2025 Cuma 10:07:30\nassert sonraki_calisma("*/15 * * * *", B) == datetime(2025, 3, 14, 10, 15), "her 15 dakikada: 10:15"\nassert sonraki_calisma("0 2 * * *", B) == datetime(2025, 3, 15, 2, 0), "her gün 02:00 -> ertesi gün"\nassert sonraki_calisma("30 8 * * 1-5", B) == datetime(2025, 3, 17, 8, 30), "hafta içi 08:30: Cuma geçti, Pazartesi"\nassert sonraki_calisma("0 6 * * 0", B) == datetime(2025, 3, 16, 6, 0), "Pazar 06:00"\nassert sonraki_calisma("0 6 * * 7", B) == datetime(2025, 3, 16, 6, 0), "7 de Pazar"\nassert sonraki_calisma("0 0 1 * *", B) == datetime(2025, 4, 1, 0, 0), "ayın 1\\\'i"\nassert sonraki_calisma("7 10 * * *", B) == datetime(2025, 3, 15, 10, 7), "başlangıç dakikası (10:07) hariç tutulmalı: kesinlikle sonrası"\nassert sonraki_calisma("8 10 * * *", B) == datetime(2025, 3, 14, 10, 8), "aynı gün sonraki dakika"\nassert sonraki_calisma("0 9 13 * 1", B) == datetime(2025, 3, 17, 9, 0), "gün ve haftanın günü ikisi de kısıtlı: VEYA (Pazartesi 17 Mart, 13 Nisan\\\'dan önce)"\nassert sonraki_calisma("0 0 29 2 *", B) == datetime(2028, 2, 29, 0, 0), "29 Şubat: sonraki artık yıl"\nassert sonraki_calisma("59 23 31 12 *", datetime(2025, 12, 31, 23, 59)) == datetime(2026, 12, 31, 23, 59), "yıl geçişi"\nfor kotu in ["0 0 31 2 *", "* * * *"]:\n    try:\n        sonraki_calisma(kotu, B)\n        assert False, f"{kotu!r} için ValueError bekleniyordu"\n    except ValueError:\n        pass\n',
      hints: ['Python weekday(): Pazartesi 0 ... Pazar 6; cron: Pazar 0. Dönüşüm: (weekday() + 1) % 7. 7\'yi de 0\'a indirmek için d % 7.', 'Başlangıcı saniyesiz bir dakika ileri al; sonra gün gün ilerle, uygun günde sıralı saat ve dakikaları dene, başlangıçtan küçük olmayan ilk adayı döndür.', 'Gün kuralı: iki gün alanı da kısıtlıysa g_ok or h_ok, değilse g_ok and h_ok (* olan alan her zaman True verir).'],
      why: 'Gerçek zamanlayıcılar (cron, croniter, APScheduler) bu hesabı yapar. Gün/haftanın günü VEYA kuralı cron\'un en çok yanlış bilinen inceliğidir; artık yıl, yıl geçişi ve "kesinlikle sonraki" sınırı ise tipik kenar durumlardır.' },
    { id: 'orkestrasyon-11',
      t: 'code',
      stage: 'Meydan okuma',
      diff: 3,
      q: '<p>Gece akışının ne kadar süreceğini bulmak için <b>kritik yolu</b> hesapla. <code>kritik_yol(sureler, bagimliliklar)</code> fonksiyonunu yaz: <code>sureler</code> görev → dakika, <code>bagimliliklar</code> görev → önceki görevler listesidir. Sınırsız paralellik varsayımıyla akışın toplam süresini ve bu süreyi belirleyen görev zincirini döndürsün: <code>(toplam_dakika, [görevler başlangıçtan sona])</code>. Eşit süreli birden çok yol varsa önceki görevi seçerken alfabetik olarak küçük olanı tercih et. Döngüde <code>ValueError</code>.</p>',
      start: 'from graphlib import TopologicalSorter, CycleError\n\ndef kritik_yol(sureler, bagimliliklar):\n    pass\n',
      sol: 'from graphlib import TopologicalSorter, CycleError\n\ndef kritik_yol(sureler, bagimliliklar):\n    tum = {g: list(bagimliliklar.get(g, [])) for g in sureler}\n    try:\n        sira = list(TopologicalSorter(tum).static_order())\n    except CycleError as e:\n        raise ValueError(f"döngü: {e.args[1]}") from None\n    bitis, onceki = {}, {}\n    for g in sira:\n        oncekiler = sorted(tum.get(g, []))\n        en_iyi = None\n        for o in oncekiler:\n            if en_iyi is None or bitis[o] > bitis[en_iyi]:\n                en_iyi = o\n        bitis[g] = (bitis[en_iyi] if en_iyi else 0) + sureler[g]\n        onceki[g] = en_iyi\n    if not bitis:\n        return 0, []\n    son = min(bitis, key=lambda g: (-bitis[g], g))\n    yol = []\n    while son is not None:\n        yol.append(son)\n        son = onceki[son]\n    return bitis[yol[0]], yol[::-1]\n',
      tests: 'sureler = {"siparis_cek": 20, "musteri_cek": 5, "urun_cek": 8, "temizle": 15, "stok": 20, "rapor": 10, "eposta": 2}\nbag = {"temizle": ["siparis_cek", "musteri_cek"], "stok": ["urun_cek"], "rapor": ["temizle", "stok"], "eposta": ["rapor"]}\nassert kritik_yol(sureler, bag) == (47, ["siparis_cek", "temizle", "rapor", "eposta"]), f"kritik yol hatalı: {kritik_yol(sureler, bag)}"\nsureler["stok"] = 40\nassert kritik_yol(sureler, bag) == (60, ["urun_cek", "stok", "rapor", "eposta"]), "stok uzayınca kritik yol değişmeli"\nassert kritik_yol({"a": 5, "b": 5, "c": 1}, {"c": ["b", "a"]}) == (6, ["a", "c"]), "eşitlikte alfabetik küçük önceki seçilmeli"\nassert kritik_yol({"tek": 7}, {}) == (7, ["tek"]), "tek görev"\nassert kritik_yol({}, {}) == (0, []), "boş akış"\ntry:\n    kritik_yol({"a": 1, "b": 1}, {"a": ["b"], "b": ["a"]})\n    assert False, "döngüde ValueError bekleniyordu"\nexcept ValueError:\n    pass\n',
      hints: ['Topolojik sırayla gez: bir görevin en erken bitişi = en geç biten öncülünün bitişi + kendi süresi.', 'Her görev için hangi öncülden geldiğini (onceki sözlüğü) sakla; en büyük bitişe sahip görevden geriye yürüyerek yolu kur.', 'Eşitlikte alfabetik seçim için öncülleri sıralı gez ve yalnız kesinlikle büyükse güncelle.'],
      why: 'Kritik yol, akışın süresini kısaltmak için hangi göreve odaklanman gerektiğini söyler: kritik yolda olmayan bir görevi hızlandırmak toplam süreyi değiştirmez. SLA planlamasında ve paralelleştirme kararlarında temel araçtır.' },
    { id: 'orkestrasyon-12',
      t: 'code',
      stage: 'Mini proje',
      diff: 3,
      q: '<p>Airflow\'un özünü taklit eden bir <code>MiniDAG</code> sınıfı yaz.</p><ul><li><code>gorev(ad, fonk, bagimli=(), deneme=1)</code>: görev ekler. <code>fonk</code>, öncül görevlerin çıktılarını içeren bir sözlükle çağrılır (<code>fonk({"cek": 120})</code>; XCom karşılığı). Aynı ad iki kez eklenirse <code>ValueError</code>.</li><li><code>calistir()</code>: görevleri topolojik sırayla (aynı anda hazır olanlar alfabetik) çalıştırır ve <code>(durumlar, ciktilar)</code> döndürür. Durumlar: <code>"basarili"</code>, <code>"basarisiz"</code> (tüm denemeler hata verdi), <code>"atlandi"</code> (öncüllerinden biri başarısız ya da atlandı; bu görev hiç çağrılmaz). Bir görev en fazla <code>deneme</code> kez çağrılır. <code>ciktilar</code> yalnız başarılı görevlerin dönüş değerlerini içerir.</li><li><code>gunluk</code> listesine her çağrı için <code>(ad, deneme_no, "ok"|"hata")</code> eklensin.</li><li>Bilinmeyen öncül ya da döngüde <code>calistir</code> <code>ValueError</code> fırlatsın.</li></ul>',
      start: 'from graphlib import TopologicalSorter, CycleError\n\nclass MiniDAG:\n    def __init__(self):\n        self.gorevler = {}\n        self.gunluk = []\n\n    # TODO: gorev, calistir\n',
      sol: 'from graphlib import TopologicalSorter, CycleError\n\nclass MiniDAG:\n    def __init__(self):\n        self.gorevler = {}\n        self.gunluk = []\n\n    def gorev(self, ad, fonk, bagimli=(), deneme=1):\n        if ad in self.gorevler:\n            raise ValueError(f"görev zaten var: {ad}")\n        self.gorevler[ad] = {"fonk": fonk, "bagimli": list(bagimli), "deneme": deneme}\n\n    def calistir(self):\n        for ad, g in self.gorevler.items():\n            for b in g["bagimli"]:\n                if b not in self.gorevler:\n                    raise ValueError(f"{ad} bilinmeyen göreve bağlı: {b}")\n        ts = TopologicalSorter({ad: g["bagimli"] for ad, g in self.gorevler.items()})\n        try:\n            ts.prepare()\n        except CycleError as e:\n            raise ValueError(f"döngü: {e.args[1]}") from None\n        durumlar, ciktilar = {}, {}\n        while ts.is_active():\n            for ad in sorted(ts.get_ready()):\n                g = self.gorevler[ad]\n                if any(durumlar[b] != "basarili" for b in g["bagimli"]):\n                    durumlar[ad] = "atlandi"\n                else:\n                    girdi = {b: ciktilar[b] for b in g["bagimli"]}\n                    durumlar[ad] = "basarisiz"\n                    for i in range(1, g["deneme"] + 1):\n                        try:\n                            ciktilar[ad] = g["fonk"](girdi)\n                        except Exception:\n                            self.gunluk.append((ad, i, "hata"))\n                            continue\n                        self.gunluk.append((ad, i, "ok"))\n                        durumlar[ad] = "basarili"\n                        break\n                ts.done(ad)\n        return durumlar, ciktilar\n',
      tests: 'sayac = {"api": 0}\ndef cek(_):\n    sayac["api"] += 1\n    if sayac["api"] < 2:\n        raise ConnectionError("API düştü")\n    return [120, 80, 300]\ndag = MiniDAG()\ndag.gorev("siparis_cek", cek, deneme=3)\ndag.gorev("musteri_cek", lambda g: {"M1": "İzmir"})\ndag.gorev("temizle", lambda g: [t for t in g["siparis_cek"] if t > 100], bagimli=["siparis_cek"])\ndag.gorev("rapor", lambda g: f"{len(g[\'temizle\'])} sipariş, {len(g[\'musteri_cek\'])} müşteri", bagimli=["temizle", "musteri_cek"])\ndag.gorev("stok", lambda g: 1 / 0, bagimli=["siparis_cek"], deneme=2)\ndag.gorev("eposta", lambda g: "gönderildi", bagimli=["rapor", "stok"])\ndag.gorev("arsivle", lambda g: "ok", bagimli=["eposta"])\ndurum, cikti = dag.calistir()\nassert durum == {"musteri_cek": "basarili", "siparis_cek": "basarili", "stok": "basarisiz", "temizle": "basarili", "rapor": "basarili", "eposta": "atlandi", "arsivle": "atlandi"}, f"durumlar hatalı: {durum}"\nassert cikti["temizle"] == [120, 300] and cikti["rapor"] == "2 sipariş, 1 müşteri", f"çıktılar öncüllere aktarılmalı (XCom): {cikti}"\nassert "stok" not in cikti and "eposta" not in cikti, "yalnız başarılı görevlerin çıktısı tutulmalı"\nassert dag.gunluk == [("musteri_cek", 1, "ok"), ("siparis_cek", 1, "hata"), ("siparis_cek", 2, "ok"), ("stok", 1, "hata"), ("stok", 2, "hata"), ("temizle", 1, "ok"), ("rapor", 1, "ok")], f"çalıştırma günlüğü hatalı: {dag.gunluk}"\ntry:\n    dag.gorev("rapor", lambda g: 0)\n    assert False, "aynı ad iki kez eklenmemeli"\nexcept ValueError:\n    pass\nd2 = MiniDAG()\nd2.gorev("a", lambda g: 1, bagimli=["yok"])\ntry:\n    d2.calistir()\n    assert False, "bilinmeyen öncül ValueError vermeli"\nexcept ValueError:\n    pass\nd3 = MiniDAG()\nd3.gorev("a", lambda g: 1, bagimli=["b"])\nd3.gorev("b", lambda g: 1, bagimli=["a"])\ntry:\n    d3.calistir()\n    assert False, "döngü ValueError vermeli"\nexcept ValueError:\n    pass\n',
      hints: ['TopologicalSorter + prepare() + get_ready()/done() döngüsü; her turda hazırları sorted ile alfabetik gez.', 'Bir görevin öncüllerinden biri "basarili" değilse görevi hiç çağırmadan "atlandi" yap; yine de done() çağır ki alt görevler de değerlendirilsin.', 'Deneme döngüsünde her çağrıyı gunluk\'e yaz; başarıda break, hepsi başarısızsa durum "basarisiz" kalır.'],
      why: 'Bu küçük sınıf, Airflow zamanlayıcısının ve çalıştırıcısının çekirdeğidir: topolojik sıra, görev başına yeniden deneme, öncül başarısızsa alt görevleri atlama (upstream_failed), XCom ile küçük çıktı aktarımı ve her denemenin kaydı. Gerçek araçlar buna kalıcı durum, paralel işçiler, zamanlama ve arayüz ekler.' }
  ],
  faq: [
    { q: 'Cron mu, Airflow mu kullanmalıyım?',
      a: 'Birkaç bağımsız iş varsa cron (ya da bulut zamanlayıcısı) yeterlidir. Görevler birbirine bağlıysa, yeniden deneme, geçmişe dönük çalıştırma, izleme ve ekipler arası görünürlük gerekiyorsa Airflow, Prefect ya da Dagster gibi bir orkestratör kullan. Orkestratörün kurulum ve bakım maliyeti olduğunu unutma.' },
    { q: 'Airflow\'da büyük veriyi görevler arasında nasıl taşırım?',
      a: 'Taşımazsın. Görev veriyi dosya/nesne deposuna (S3, GCS, yerel disk) ya da veritabanına yazar, XCom ile yalnız yolunu veya tablo adını iletir. Ağır işlem Airflow işçisinde değil, veritabanında, Spark\'ta ya da ayrı bir konteynerde yapılır; Airflow onu tetikler ve izler.' },
    { q: 'Görevimin idempotent olduğunu nasıl test ederim?',
      a: 'Aynı girdiyle iki kez çalıştırıp sonuç durumunu (satır sayısı, toplamlar, dosya içeriği) karşılaştıran bir test yaz. Ayrıca yarıda kesilip yeniden başlatılma senaryosunu (ilk çalışma hata versin, ikincisi başarılı olsun) test et.' },
    { q: 'Yeniden deneme sayısını ne kadar yüksek tutmalıyım?',
      a: 'Geçici hatalar için 2-5 deneme ve üstel bekleme genelde yeterlidir. Çok yüksek deneme sayısı kalıcı sorunları saatlerce geciktirir ve alarmın geç çalmasına yol açar. Kalıcı hataları (doğrulama, yetki) hiç yeniden deneme.' }
  ],
  mistakes: [
    { why: 'Görev "şimdi"ye göre çalışırsa dünün işini yeniden çalıştıramaz ve backfill yapılamaz; işlenecek tarih parametre olmalı.',
      bad: 'def gunluk_rapor():\n    tarih = date.today() - timedelta(days=1)\n    ...',
      good: 'def gunluk_rapor(tarih: date):\n    ...\n# Airflow: gunluk_rapor(ds) / logical_date' },
    { why: 'Düz INSERT her yeniden denemede kopya üretir; aynı işlem içinde sil-yaz ya da upsert kullan.',
      bad: 'for s in satirlar:\n    db.execute("INSERT INTO satis VALUES (?, ?)", s)',
      good: 'with db:\n    db.execute("DELETE FROM satis WHERE tarih = ?", (tarih,))\n    db.executemany("INSERT INTO satis VALUES (?, ?, ?)", satirlar)' },
    { why: 'XCom meta veritabanında saklanır; büyük veri koymak veritabanını şişirir ve akışı yavaşlatır.',
      bad: '@task\ndef cek():\n    return df.to_dict()   # milyonlarca satır',
      good: '@task\ndef cek(ds=None):\n    yol = f"/data/siparis_{ds}.parquet"\n    df.to_parquet(yol)\n    return yol' },
    { why: 'Tüm hataları yeniden denemek kalıcı sorunları geciktirir; hatayı yutmak ise görevi sahte başarılı gösterir.',
      bad: 'for _ in range(5):\n    try:\n        return f()\n    except Exception:\n        pass',
      good: 'for i in range(5):\n    try:\n        return f()\n    except (ConnectionError, TimeoutError):\n        if i == 4:\n            raise\n        time.sleep(2 ** i)' }
  ] }
);
})(window);
