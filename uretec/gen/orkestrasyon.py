LESSON = {
'id': 'orkestrasyon', 'lv': 'ileri', 'mod': 'Üretime Hazırlık', 'min': 75,
'title': 'İş akışı orkestrasyonu: cron, DAG ve Airflow',
'sum': 'Zamanlanmış işleri cron sözdizimiyle tanımlar, görevleri DAG olarak modeller, graphlib ile sıralar ve döngü yakalarsın; Airflow\'un DAG, operator, >>, retries ve XCom kavramlarını tanır, idempotent ve yeniden çalıştırılabilir işler, yeniden deneme, bildirim ve gözlemlenebilirlikle üretim kalitesinde akışlar kurarsın.',
'goals': [
 'Cron ifadesini okuyup yazabilir, bir sonraki çalışma zamanını hesaplayabilirim.',
 'Görev bağımlılıklarını DAG olarak modeller, graphlib.TopologicalSorter ile sıra ve paralel katmanlar çıkarır, döngüyü yakalarım.',
 'Airflow\'da DAG, operator, >> bağımlılığı, schedule, retries ve XCom kavramlarını kullanarak bir akış tasarlayabilirim.',
 'İşleri idempotent yazar; yeniden deneme, geriye dönük çalıştırma (backfill) ve hata bildirimi kurgularım.',
 'Akışı log ve metriklerle gözlemlenebilir hale getiririm.'],
'body': r'''
<h2>Neden önemli?</h2>
<p>Veri boru hattı dersinde tek bir ETL betiği yazdın. Gerçek kurumda ise onlarca iş birbirine bağlıdır: Anadolu Market'te her gece 02:00'de siparişler çekilir, temizlenir, stok tablosu güncellenir, şehir raporu üretilir, yöneticilere e-posta gider. Ilgaz Bank'ta gün sonu mutabakatı, tüm şubelerin işlem dosyaları gelmeden başlayamaz. Bu işleri "doğru sırada, doğru zamanda, hata olursa yeniden deneyerek ve kimse bakmasa da haber vererek" çalıştırma işine <b>orkestrasyon</b> (orchestration) denir. Bu derste önce temelleri (cron, DAG, idempotentlik) saf Python ile kuracak, sonra Airflow ve benzeri araçların bunları nasıl paketlediğini göreceksin.</p>

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
<pre class="code">
# Linux / macOS: crontab -e
0 2 * * *  cd /opt/anadolu &amp;&amp; .venv/bin/python -m etl.gunluk &gt;&gt; /var/log/etl.log 2&gt;&amp;1
# Windows'ta Görev Zamanlayıcı (Task Scheduler) ya da schtasks:
schtasks /create /tn "AnadoluETL" /tr "C:\anadolu\.venv\Scripts\python.exe -m etl.gunluk" /sc daily /st 02:00
</pre>
<p>Bir alan nasıl açılır? <code>*/15</code> "0'dan başlayıp 15'er adım", <code>1-5</code> "aralık", <code>1,3,5</code> "liste" demektir; <code>10-30/10</code> ise aralık içinde adım. Aşağıdaki kutu bir alanı değer kümesine çeviriyor; alıştırmalarda bunun üzerine "bir sonraki çalışma zamanı" hesaplayıcısı kuracaksın.</p>
<pre class="py">
def alan_ac(alan, alt, ust):
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
print(alan_ac("10-30/10", 0, 59))
</pre>
<p>Python içinden zamanlama gerekiyorsa iki popüler paket vardır (tarayıcıda çalışmaz, kendi bilgisayarında dene):</p>
<pre class="code">
# pip install schedule apscheduler
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
zamanlayici.start()
</pre>
<div class="warn"><b>Saat dilimi</b>Sunucular çoğunlukla UTC çalışır. "02:00" yazdığında hangi saat dilimini kastettiğini her zaman açıkça belirt (Airflow'da <code>pendulum.timezone("Europe/Istanbul")</code>, APScheduler'da <code>timezone=</code>). Aksi halde işin Türkiye saatiyle 05:00'te çalıştığını sonradan fark edersin.</div>

<h2>DAG: hangi sırayla çalışsın?</h2>
<p>Cron "ne zaman" sorusunu çözer, ama "temizlik bitmeden rapor başlamasın" diyemez. Görevler ve aralarındaki bağımlılıklar bir <b>yönlü döngüsüz çizge</b> (Directed Acyclic Graph, DAG) oluşturur: oklar "önce bu, sonra şu" der, döngü olamaz (A, B'yi; B de A'yı bekliyorsa hiçbiri başlayamaz). Bir DAG'ı geçerli bir sıraya dizmeye <b>topolojik sıralama</b> denir ve Python'da standart kütüphanede hazırdır: <code>graphlib.TopologicalSorter</code>.</p>
<pre class="py">
from graphlib import TopologicalSorter, CycleError

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
    print("Döngü:", e.args[1])
</pre>
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
<pre class="code">
# pip install apache-airflow  (yerelde: airflow standalone)
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

gunluk_satis()
</pre>
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
<pre class="py">
import sqlite3
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
print(db.execute("SELECT tarih, COUNT(*), SUM(ciro) FROM gunluk_satis GROUP BY tarih").fetchall())
</pre>
<p>Diğer ilkeler: görev <b>işlediği zaman dilimini parametre olarak alsın</b> (<code>datetime.now()</code> değil; yoksa dünün işini bugün yeniden çalıştıramazsın), çıktı dosyaları tarihli olsun, yan etkiler (e-posta, ödeme) tekrar gönderimi önleyen bir anahtarla korunsun.</p>

<h2>Yeniden deneme, hata bildirimi ve gözlemlenebilirlik</h2>
<p>Ağ kopması, kilitli tablo, geçici 503 gibi <b>geçici</b> hatalar yeniden denenir; bekleme süresi her denemede katlanır (üstel geri çekilme, exponential backoff) ki zaten zorlanan sisteme yük bindirilmesin. Kalıcı hatalar (bozuk veri, yanlış parola) yeniden denenmez; hemen başarısız olup haber verilir.</p>
<pre class="py">
import functools

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
    if sayac["n"] < 3:
        raise ConnectionError("API yanıt vermedi")
    return 120

print("Çekilen satır:", siparis_cek())
</pre>
<p>Haber verme katmanları: görev başarısız olduğunda (Airflow'da <code>on_failure_callback</code>) Slack/Teams/e-posta mesajı; iş hiç başlamazsa sessiz kalmamak için "ölü adam anahtarı" (dead man's switch: iş her başarıyla bittiğinde bir izleme servisine sinyal gönderir, sinyal gelmezse alarm çalar); SLA ("rapor 07:00'ye kadar hazır olmalı") ihlalinde uyarı.</p>
<p>Gözlemlenebilirlik (observability) için her görev en azından şunları yapılandırılmış log (JSON satırı) olarak yazmalı: görev adı, çalışma kimliği, işlenen tarih, başlangıç-bitiş, süre, okunan/yazılan satır sayısı, sonuç. Bu sayılar metrik sistemine (Prometheus, Datadog, CloudWatch) gider; "dün 1250 satır geldi, bugün 3" gibi sessiz veri sorunları ancak böyle yakalanır.</p>
<pre class="py">
import json, time

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
calistir_ve_logla("rapor", lambda t: 1 / 0, "2025-03-01")
</pre>
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
''',
'ex': [
 {'t': 'mc', 'stage': 'Isınma',
  'q': '<code>30 2 * * 1-5</code> cron ifadesi ne zaman çalışır?',
  'o': ['Her gün 02:30\'da', 'Hafta içi her gün 02:30\'da', 'Ayın 1-5. günleri 02:30\'da', 'Hafta içi her gün 30 dakikada bir'], 'a': 1,
  'why': 'Alanlar dakika (30), saat (2), ayın günü (*), ay (*), haftanın günü (1-5 = Pazartesi-Cuma) sırasındadır. 1-5 beşinci alanda olduğu için ayın günleri değil hafta içi günlerdir; 30 sabit dakikadır, "her 30 dakika" için */30 yazılırdı.'},
 {'t': 'mc', 'stage': 'Isınma',
  'q': 'Hangi yükleme yöntemi <b>idempotent</b>tir?',
  'o': ['Her çalışmada günün satırlarını tabloya INSERT etmek', 'Önce o günün satırlarını silip aynı işlemde yeniden yazmak', 'Satırları dosyanın sonuna append kipinde eklemek', 'Her çalışmada tabloya yeni bir otomatik artan kimlikle eklemek'], 'a': 1,
  'why': 'Sil-ve-yaz (ya da upsert) aynı girdiyle kaç kez çalışırsa çalışsın aynı son durumu üretir. Düz INSERT, append ve otomatik kimlikle ekleme her yeniden denemede kopya üretir.'},
 {'t': 'mc', 'stage': 'Isınma',
  'q': 'Airflow\'da XCom ne için kullanılmalıdır?',
  'o': ['Görevler arasında 2 GB\'lık DataFrame\'leri doğrudan bellekte taşımak için', 'Görevler arasında dosya yolu, satır sayısı gibi küçük değerleri aktarmak için', 'DAG\'ın zamanlamasını ve başlangıç tarihini çalışma anında değiştirmek için', 'Başarısız görevleri belirli aralıklarla otomatik yeniden denemek için'], 'a': 1,
  'why': 'XCom meta veritabanında saklanır; küçük, özet değerler içindir. Büyük veri dosya/nesne deposuna yazılır ve XCom ile yalnız yolu aktarılır. Zamanlama schedule, yeniden deneme retries ile ayarlanır.'},
 {'t': 'predict', 'stage': 'Kodu oku',
  'q': 'Bu kod ne yazdırır?',
  'code': r'''from graphlib import TopologicalSorter
ts = TopologicalSorter({"rapor": {"temizle"}, "temizle": {"cek"}, "cek": set()})
print(list(ts.static_order()))
''',
  'o': ["['rapor', 'temizle', 'cek']", "['cek', 'temizle', 'rapor']", "['temizle', 'cek', 'rapor']", 'CycleError'], 'a': 1,
  'why': 'Sözlükte her görevin değeri, ondan ÖNCE bitmesi gerekenlerdir. cek kimseyi beklemez, temizle cek\'i, rapor temizle\'yi bekler; topolojik sıra cek → temizle → rapor olur. Döngü olmadığı için hata yoktur.'},
 {'t': 'predict', 'stage': 'Kodu oku',
  'q': 'Yeniden deneme döngüsü: bu kod ne yazdırır?',
  'code': r'''denemeler = []
bekleme = 1
for i in range(1, 5):
    denemeler.append(i)
    if i >= 3:
        break
    bekleme *= 2
print(denemeler, bekleme)
''',
  'o': ['[1, 2, 3] 4', '[1, 2, 3] 8', '[1, 2, 3, 4] 8', '[1, 2] 4'], 'a': 0,
  'why': 'Üçüncü denemede başarı olur (break). İlk iki başarısız denemeden sonra bekleme 1 → 2 → 4 olmuştur; üçüncüde break, çarpmadan önce geldiği için bekleme 4 kalır. Üstel geri çekilme böyle katlanır.'},
 {'t': 'predict', 'stage': 'Kodu oku',
  'q': 'Paralel katmanlar: bu kod ne yazdırır?',
  'code': r'''from graphlib import TopologicalSorter
ts = TopologicalSorter({"temizle": {"siparis", "musteri"}, "rapor": {"temizle"}, "stok": {"siparis"}})
ts.prepare()
while ts.is_active():
    hazir = sorted(ts.get_ready())
    print(hazir)
    ts.done(*hazir)
''',
  'o': ["['musteri', 'siparis']\n['stok', 'temizle']\n['rapor']", "['siparis']\n['musteri']\n['stok', 'temizle']\n['rapor']", "['musteri', 'siparis', 'stok']\n['temizle']\n['rapor']", "['musteri', 'siparis']\n['temizle']\n['stok', 'rapor']"], 'a': 0,
  'why': 'İlk katman kimseyi beklemeyenlerdir: musteri ve siparis. İkisi bitince hem temizle (ikisini bekliyordu) hem stok (yalnız siparişi bekliyordu) hazır olur. rapor ancak temizle bitince açılır. Aynı katmandakiler paralel çalışabilir.'},
 {'t': 'order', 'stage': 'Kodu oku',
  'q': '<p>Görev bağımlılıklarından çalışma sırasını üreten ve döngüyü yakalayan programın satırlarını sırala.</p>',
  'lines': ['from graphlib import TopologicalSorter, CycleError', 'akis = {"rapor": {"temizle"}, "temizle": {"cek"}}', 'ts = TopologicalSorter(akis)', 'try:', '    print(" -> ".join(ts.static_order()))', 'except CycleError as e:', '    print("Döngü:", e.args[1])'],
  'expect': 'cek -> temizle -> rapor\n',
  'hint': 'İçe aktarma, veri, sıralayıcı; sonra try/except bloğu.',
  'why': 'static_order döngü varsa CycleError fırlatır; e.args[1] döngüdeki düğümleri verir. Döngü yoksa sıra cek → temizle → rapor olur.'},
 {'id': 'orkestrasyon-1', 't': 'code', 'stage': 'Rehberli', 'diff': 1,
  'q': '<p><code>gorev_sirasi(bagimliliklar)</code> fonksiyonunu yaz: <code>{gorev: [önce bitmesi gerekenler]}</code> sözlüğünden geçerli bir çalışma sırası (liste) döndürsün. Döngü varsa <code>ValueError</code> fırlatsın ve mesajında <code>"döngü"</code> kelimesi ve döngüdeki görev adları geçsin.</p>',
  'guide': ['graphlib\'den TopologicalSorter ve CycleError\'ı içe aktar.', 'Sözlüğü doğrudan TopologicalSorter\'a ver (listeler de kabul edilir).', 'list(ts.static_order()) ile sırayı al.', 'CycleError yakalanırsa e.args[1] ile döngüyü al ve ValueError fırlat.'],
  'example': 'from graphlib import TopologicalSorter\nyemek = {"pişir": ["doğra"], "servis": ["pişir"]}\nprint(list(TopologicalSorter(yemek).static_order()))\n',
  'start': r'''from graphlib import TopologicalSorter, CycleError

def gorev_sirasi(bagimliliklar):
    # TODO: sıralayıcı kur, static_order ile listeyi döndür, döngüde ValueError
    pass
''',
  'sol': r'''from graphlib import TopologicalSorter, CycleError

def gorev_sirasi(bagimliliklar):
    try:
        return list(TopologicalSorter(bagimliliklar).static_order())
    except CycleError as e:
        raise ValueError(f"döngü bulundu: {' -> '.join(e.args[1])}") from None
''',
  'tests': r'''akis = {"temizle": ["siparis_cek", "musteri_cek"], "rapor": ["temizle"], "eposta": ["rapor"], "stok": ["siparis_cek"]}
sira = gorev_sirasi(akis)
assert isinstance(sira, list) and set(sira) == {"siparis_cek", "musteri_cek", "temizle", "rapor", "eposta", "stok"}, f"tüm görevler (bağımlılık olarak geçenler dahil) sırada olmalı; gelen {sira}"
for gorev, oncekiler in akis.items():
    for o in oncekiler:
        assert sira.index(o) < sira.index(gorev), f"{o}, {gorev} görevinden önce gelmeli"
assert gorev_sirasi({}) == [], "boş akış boş liste"
try:
    gorev_sirasi({"a": ["b"], "b": ["c"], "c": ["a"]})
    assert False, "döngüde ValueError bekleniyordu"
except ValueError as e:
    assert "döngü" in str(e) and all(x in str(e) for x in "abc"), f"mesajda \'döngü\' ve görev adları geçmeli: {e}"
''',
  'hints': ['TopologicalSorter(sozluk) her anahtarın değerini "önceki düğümler" olarak yorumlar.', 'CycleError\'ın ikinci argümanı (e.args[1]) döngüdeki düğümlerin listesidir.', 'raise ValueError(f"döngü bulundu: {e.args[1]}") from None'],
  'why': 'Orkestratörler DAG\'ı yüklerken önce bu kontrolü yapar: döngülü bir akış hiç çalıştırılamaz, bu yüzden erken ve anlaşılır bir hatayla reddedilmelidir.'},
 {'id': 'orkestrasyon-2', 't': 'code', 'stage': 'Rehberli', 'diff': 2,
  'q': '<p><code>cron_alan_ac(alan, alt, ust)</code> fonksiyonunu yaz: bir cron alanını değerlerin sıralı listesine çevirsin. Desteklenecek biçimler ve birleşimleri: <code>*</code>, <code>5</code>, <code>1-5</code>, <code>*/15</code>, <code>10-30/10</code>, virgülle liste (<code>1,15,30</code> ya da <code>1-3,10</code>). Aralık dışı değer, ters aralık (<code>5-1</code>) ya da 0/negatif adımda <code>ValueError</code> fırlatsın.</p>',
  'guide': ['Alanı virgülle parçalara ayır; her parçayı ayrı işle.', 'Parçayı partition("/") ile aralık ve adım olarak böl; adım yoksa 1.', 'Aralık "*" ise alt-ust; "-" içeriyorsa iki sayı; değilse tek sayı.', 'Sınırları ve adımı denetle, range ile değerleri bir kümeye ekle.', 'sorted(küme) döndür.'],
  'example': 'parca = "10-30/10"\naralik, _, adim = parca.partition("/")\nbas, son = map(int, aralik.split("-"))\nprint(list(range(bas, son + 1, int(adim))))\n',
  'start': r'''def cron_alan_ac(alan, alt, ust):
    degerler = set()
    for parca in alan.split(","):
        aralik, _, adim = parca.partition("/")
        # TODO: bas, son ve adımı belirle; doğrula; değerleri ekle
    return sorted(degerler)
''',
  'sol': r'''def cron_alan_ac(alan, alt, ust):
    degerler = set()
    for parca in alan.split(","):
        aralik, _, adim = parca.partition("/")
        if aralik == "*":
            bas, son = alt, ust
        elif "-" in aralik:
            bas, son = map(int, aralik.split("-"))
        else:
            bas = son = int(aralik)
        adim = int(adim) if adim else 1
        if adim <= 0 or bas > son or bas < alt or son > ust:
            raise ValueError(f"geçersiz cron parçası: {parca}")
        degerler.update(range(bas, son + 1, adim))
    return sorted(degerler)
''',
  'tests': r'''assert cron_alan_ac("*", 0, 6) == [0, 1, 2, 3, 4, 5, 6], "* tüm aralık"
assert cron_alan_ac("*/15", 0, 59) == [0, 15, 30, 45], "*/15 dakika"
assert cron_alan_ac("1-5", 0, 6) == [1, 2, 3, 4, 5], "aralık"
assert cron_alan_ac("10-30/10", 0, 59) == [10, 20, 30], "adımlı aralık"
assert cron_alan_ac("1-3,10,2", 1, 31) == [1, 2, 3, 10], "liste: tekrarlar bir kez, sıralı"
assert cron_alan_ac("7", 0, 23) == [7], "tek değer"
for kotu, a, u in [("60", 0, 59), ("5-1", 0, 59), ("*/0", 0, 59), ("0", 1, 31), ("1-13", 1, 12)]:
    try:
        cron_alan_ac(kotu, a, u)
        assert False, f"{kotu!r} ({a}-{u}) için ValueError bekleniyordu"
    except ValueError:
        pass
''',
  'hints': ['Her parçada üç durum var: "*", "a-b", tek sayı. Adım hepsine uygulanabilir.', 'int("x") zaten ValueError verir; sen ek olarak sınırları ve adımı kontrol et.', 'degerler.update(range(bas, son + 1, adim))'],
  'why': 'Cron alanları küçük bir dil oluşturur: liste, aralık ve adım birleştirilebilir. Önce her alanı bir değer kümesine açmak, "bir sonraki çalışma zamanı" hesabını basit küme üyeliği sorgularına indirger.'},
 {'id': 'orkestrasyon-3', 't': 'code', 'stage': 'Rehberli', 'diff': 2,
  'q': '<p>Parametreli bir yeniden deneme dekoratörü yaz: <code>yeniden_dene(deneme=3, ilk_bekleme=1, carpan=2, gecici=(ConnectionError, TimeoutError), uyu=time.sleep)</code>.</p><ul><li>Fonksiyon <code>gecici</code> türünden bir hata fırlatırsa <code>uyu(bekleme)</code> çağrılıp yeniden denenir; bekleme her seferinde <code>carpan</code> ile çarpılır.</li><li>Deneme hakkı biterse <b>son hata</b> yeniden fırlatılır.</li><li><code>gecici</code> dışındaki hatalar hiç beklemeden hemen fırlatılır.</li><li><code>functools.wraps</code> kullan.</li></ul><p>Testte <code>uyu</code> yerine bekleme sürelerini kaydeden sahte bir fonksiyon verilecek.</p>',
  'guide': ['Üç katman: yeniden_dene(...) → dekorator(f) → sarmal(*args, **kwargs).', 'bekleme = ilk_bekleme ile başla; for döngüsüyle 1..deneme arasında dene.', 'except gecici: son denemeyse raise; değilse uyu(bekleme) ve bekleme *= carpan.', 'Başarılı çağrıda sonucu hemen return et.'],
  'example': 'import functools\ndef say(f):\n    @functools.wraps(f)\n    def sarmal(*a, **k):\n        sarmal.cagri += 1\n        return f(*a, **k)\n    sarmal.cagri = 0\n    return sarmal\n@say\ndef kare(x):\n    return x * x\nprint(kare(3), kare(4), kare.cagri, kare.__name__)\n',
  'start': r'''import functools, time

def yeniden_dene(deneme=3, ilk_bekleme=1, carpan=2, gecici=(ConnectionError, TimeoutError), uyu=time.sleep):
    def dekorator(f):
        @functools.wraps(f)
        def sarmal(*args, **kwargs):
            # TODO: deneme döngüsü, geçici hatada uyu ve beklemeyi katla
            return f(*args, **kwargs)
        return sarmal
    return dekorator
''',
  'sol': r'''import functools, time

def yeniden_dene(deneme=3, ilk_bekleme=1, carpan=2, gecici=(ConnectionError, TimeoutError), uyu=time.sleep):
    def dekorator(f):
        @functools.wraps(f)
        def sarmal(*args, **kwargs):
            bekleme = ilk_bekleme
            for i in range(1, deneme + 1):
                try:
                    return f(*args, **kwargs)
                except gecici:
                    if i == deneme:
                        raise
                    uyu(bekleme)
                    bekleme *= carpan
        return sarmal
    return dekorator
''',
  'tests': r'''beklemeler = []
sayac = {"n": 0}
@yeniden_dene(deneme=4, ilk_bekleme=1, uyu=beklemeler.append)
def cek():
    """API'den sipariş çeker."""
    sayac["n"] += 1
    if sayac["n"] < 3:
        raise ConnectionError("bağlantı koptu")
    return "tamam"
assert cek() == "tamam" and sayac["n"] == 3, "üçüncü denemede başarılı olmalı"
assert beklemeler == [1, 2], f"iki başarısız denemeden sonra 1 ve 2 sn beklenmeli; gelen {beklemeler}"
assert cek.__name__ == "cek" and cek.__doc__ == "API\'den sipariş çeker.", "functools.wraps ile ad ve belge korunmalı"
b2 = []
@yeniden_dene(deneme=3, ilk_bekleme=5, carpan=3, uyu=b2.append)
def hep_timeout():
    raise TimeoutError("zaman aşımı")
try:
    hep_timeout()
    assert False, "deneme hakkı bitince son hata fırlatılmalı"
except TimeoutError:
    pass
assert b2 == [5, 15], f"3 denemede 2 bekleme olmalı: 5 ve 15; gelen {b2}"
b3 = []
n3 = {"n": 0}
@yeniden_dene(uyu=b3.append)
def bozuk_veri():
    n3["n"] += 1
    raise ValueError("tutar negatif")
try:
    bozuk_veri()
    assert False, "ValueError fırlatılmalı"
except ValueError:
    pass
assert n3["n"] == 1 and b3 == [], "kalıcı hata (ValueError) yeniden denenmemeli"
''',
  'hints': ['except gecici: yalnız listelenen türleri yakalar; diğerleri kendiliğinden yukarı çıkar.', 'Son denemede bekleme yapma, doğrudan raise (çıplak raise son hatayı aynen fırlatır).', 'bekleme *= carpan'],
  'why': 'Uyku fonksiyonunu parametre yapmak (bağımlılık enjeksiyonu) dekoratörü saniyeler beklemeden test edilebilir kılar. Geçici ve kalıcı hata ayrımı, yeniden denemenin sorunları gizlemesini önler.'},
 {'id': 'orkestrasyon-4', 't': 'code', 'stage': 'Rehberli', 'diff': 2,
  'q': '<p><code>paralel_katmanlar(bagimliliklar)</code> fonksiyonunu yaz: aynı anda çalışabilecek görev gruplarını sırasıyla döndürsün. Her katman alfabetik sıralı bir liste olsun. Örnek: <code>{"temizle": ["cek_a", "cek_b"], "rapor": ["temizle"]}</code> → <code>[["cek_a", "cek_b"], ["temizle"], ["rapor"]]</code>. Ayrıca <code>max_paralel</code> parametresi (varsayılan <code>None</code>) verilirse hiçbir katman bu sayıdan büyük olmasın: hazır görevler alfabetik sırayla en fazla <code>max_paralel</code>\'lik gruplara bölünsün ve her grup bitince yeni hazır olanlar sıraya eklensin.</p>',
  'guide': ['TopologicalSorter kur ve prepare() çağır.', 'Bekleyen hazır görevleri tutan bir liste aç.', 'is_active() oldukça: get_ready() ile yeni hazırları ekle, listeyi sırala.', 'İlk max_paralel kadarını (ya da hepsini) katman olarak al, done(*katman) ile bitir.', 'Katmanları döndür.'],
  'example': 'from graphlib import TopologicalSorter\nts = TopologicalSorter({"b": ["a"], "c": ["a"]})\nts.prepare()\nprint(ts.get_ready())\nts.done("a")\nprint(sorted(ts.get_ready()))\n',
  'start': r'''from graphlib import TopologicalSorter

def paralel_katmanlar(bagimliliklar, max_paralel=None):
    ts = TopologicalSorter(bagimliliklar)
    ts.prepare()
    katmanlar = []
    # TODO
    return katmanlar
''',
  'sol': r'''from graphlib import TopologicalSorter

def paralel_katmanlar(bagimliliklar, max_paralel=None):
    ts = TopologicalSorter(bagimliliklar)
    ts.prepare()
    katmanlar = []
    bekleyen = []
    while ts.is_active():
        bekleyen.extend(ts.get_ready())
        bekleyen.sort()
        n = len(bekleyen) if max_paralel is None else max_paralel
        katman, bekleyen = bekleyen[:n], bekleyen[n:]
        ts.done(*katman)
        katmanlar.append(katman)
    return katmanlar
''',
  'tests': r'''akis = {"temizle": ["cek_a", "cek_b"], "rapor": ["temizle"]}
assert paralel_katmanlar(akis) == [["cek_a", "cek_b"], ["temizle"], ["rapor"]], f"örnek akış hatalı: {paralel_katmanlar(akis)}"
buyuk = {"birlestir": ["siparis", "musteri", "urun"], "stok": ["urun"], "rapor": ["birlestir", "stok"]}
assert paralel_katmanlar(buyuk) == [["musteri", "siparis", "urun"], ["birlestir", "stok"], ["rapor"]], f"paralel katmanlar hatalı: {paralel_katmanlar(buyuk)}"
assert paralel_katmanlar(buyuk, max_paralel=2) == [["musteri", "siparis"], ["urun"], ["birlestir", "stok"], ["rapor"]], f"max_paralel=2 ile hatalı: {paralel_katmanlar(buyuk, max_paralel=2)}"
assert paralel_katmanlar({}) == [], "boş akış"
assert all(len(k) <= 1 for k in paralel_katmanlar(buyuk, max_paralel=1)), "max_paralel=1 tamamen sıralı çalışmalı"
''',
  'hints': ['get_ready() aynı görevi iki kez vermez; vermediklerini sen bekleyen listede tutmalısın.', 'Dilimle böl: katman, bekleyen = bekleyen[:n], bekleyen[n:]', 'Yalnız gerçekten çalıştırdığın (katmandaki) görevler için done çağır.'],
  'why': 'Orkestratörlerin havuz (pool) ve eşzamanlılık sınırları tam olarak böyle çalışır: hazır görevler bir kuyrukta bekler, işçi sayısı kadarı çalıştırılır, bitenler yeni görevlerin önünü açar.'},
 {'id': 'orkestrasyon-5', 't': 'code', 'stage': 'Kendin yaz', 'diff': 2,
  'q': '<p>Anadolu Market günlük satış tablosuna <b>idempotent</b> yükleme yapan <code>gunluk_yukle(db, tarih, satirlar)</code> fonksiyonunu yaz. Tablo: <code>gunluk_satis(tarih TEXT, sehir TEXT, ciro REAL)</code>. Kurallar:</p><ul><li>Aynı tarih için kaç kez çalışırsa çalışsın sonuç bir kez çalışmış gibi olmalı (o günün eski satırları silinip yenileri yazılır).</li><li>Diğer günlerin satırlarına dokunulmamalı.</li><li>Silme ve yazma tek bir işlem (transaction) olmalı: satırlardan biri hatalıysa (ciro negatif → <code>ValueError</code>) o günün <b>eski</b> verisi korunmalı.</li><li>Fonksiyon yazılan satır sayısını döndürsün.</li></ul>',
  'start': 'import sqlite3\n\ndef gunluk_yukle(db, tarih, satirlar):\n    pass\n',
  'sol': r'''import sqlite3

def gunluk_yukle(db, tarih, satirlar):
    with db:
        db.execute("DELETE FROM gunluk_satis WHERE tarih = ?", (tarih,))
        for sehir, ciro in satirlar:
            if ciro < 0:
                raise ValueError(f"negatif ciro: {sehir}")
            db.execute("INSERT INTO gunluk_satis VALUES (?, ?, ?)", (tarih, sehir, ciro))
    return len(satirlar)
''',
  'tests': r'''db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE gunluk_satis (tarih TEXT, sehir TEXT, ciro REAL)")
def ozet():
    return db.execute("SELECT tarih, COUNT(*), SUM(ciro) FROM gunluk_satis GROUP BY tarih ORDER BY tarih").fetchall()
assert gunluk_yukle(db, "2025-03-01", [("İzmir", 1500.0), ("Ankara", 900.0)]) == 2, "yazılan satır sayısı dönmeli"
gunluk_yukle(db, "2025-03-01", [("İzmir", 1500.0), ("Ankara", 900.0)])
gunluk_yukle(db, "2025-03-02", [("Bursa", 400.0)])
assert ozet() == [("2025-03-01", 2, 2400.0), ("2025-03-02", 1, 400.0)], f"yeniden çalıştırma kopya üretmemeli: {ozet()}"
gunluk_yukle(db, "2025-03-01", [("İzmir", 1600.0)])
assert ozet() == [("2025-03-01", 1, 1600.0), ("2025-03-02", 1, 400.0)], "düzeltilmiş veriyle yeniden çalıştırma eski günü tamamen değiştirmeli, diğer güne dokunmamalı"
try:
    gunluk_yukle(db, "2025-03-01", [("İzmir", 1700.0), ("Van", -5.0)])
    assert False, "negatif ciroda ValueError bekleniyordu"
except ValueError:
    pass
assert ozet() == [("2025-03-01", 1, 1600.0), ("2025-03-02", 1, 400.0)], f"hata durumunda eski veri korunmalı (işlem geri alınmalı): {ozet()}"
''',
  'hints': ['sqlite3 bağlantısını with bloğunda kullanmak, blok hatasız biterse commit, hata olursa rollback yapar.', 'Silme ve eklemeleri aynı with bloğunun içine koy; doğrulamayı da bloğun içinde yap ki hata silmeyi geri alsın.'],
  'why': 'Sil-ve-yaz bölüm (partition) değişimi, toplu yüklemelerde en yaygın idempotentlik kalıbıdır. İşlem bütünlüğü olmadan yarıda kalan bir yükleme günün verisini boş bırakır: idempotentlik ve atomiklik birlikte gerekir.'},
 {'id': 'orkestrasyon-6', 't': 'code', 'stage': 'Kendin yaz', 'diff': 2,
  'q': '<p>Backfill planlayıcısı yaz: <code>backfill_tarihleri(baslangic, bitis, tamamlananlar)</code>. <code>baslangic</code> ve <code>bitis</code> <code>"YYYY-MM-DD"</code> metinleridir (ikisi de dahil); <code>tamamlananlar</code> başarıyla işlenmiş tarih metinlerinin kümesidir. Henüz işlenmemiş günlerin listesini kronolojik sırayla döndürsün. <code>baslangic &gt; bitis</code> ise <code>ValueError</code>. Hafta sonu atlama seçeneği: <code>sadece_is_gunu=True</code> verilirse Cumartesi ve Pazar listelenmesin.</p>',
  'start': 'from datetime import date, timedelta\n\ndef backfill_tarihleri(baslangic, bitis, tamamlananlar, sadece_is_gunu=False):\n    pass\n',
  'sol': r'''from datetime import date, timedelta

def backfill_tarihleri(baslangic, bitis, tamamlananlar, sadece_is_gunu=False):
    bas, son = date.fromisoformat(baslangic), date.fromisoformat(bitis)
    if bas > son:
        raise ValueError("başlangıç bitişten sonra olamaz")
    eksik = []
    gun = bas
    while gun <= son:
        metin = gun.isoformat()
        if metin not in tamamlananlar and not (sadece_is_gunu and gun.weekday() >= 5):
            eksik.append(metin)
        gun += timedelta(days=1)
    return eksik
''',
  'tests': r'''tamam = {"2025-02-27", "2025-03-01", "2025-03-03"}
assert backfill_tarihleri("2025-02-27", "2025-03-04", tamam) == ["2025-02-28", "2025-03-02", "2025-03-04"], f"ay geçişi dahil eksik günler: {backfill_tarihleri('2025-02-27', '2025-03-04', tamam)}"
assert backfill_tarihleri("2025-02-27", "2025-03-04", tamam, sadece_is_gunu=True) == ["2025-02-28", "2025-03-04"], "2 Mart 2025 Pazar; iş günü kipinde atlanmalı"
assert backfill_tarihleri("2025-03-05", "2025-03-05", set()) == ["2025-03-05"], "tek günlük aralık"
assert backfill_tarihleri("2024-02-28", "2024-03-01", set()) == ["2024-02-28", "2024-02-29", "2024-03-01"], "artık yıl"
try:
    backfill_tarihleri("2025-03-05", "2025-03-01", set())
    assert False, "ters aralıkta ValueError bekleniyordu"
except ValueError:
    pass
''',
  'hints': ['date.fromisoformat("2025-03-01") metni tarihe çevirir; isoformat() geri çevirir.', 'Günleri timedelta(days=1) ile ilerlet; weekday() Pazartesi 0, Cumartesi 5, Pazar 6.'],
  'why': 'Görevler işledikleri tarihi parametre olarak aldığında, eksik günleri hesaplayıp yeniden çalıştırmak (backfill) basit bir döngüye indirgenir. Airflow\'un catchup ve "airflow dags backfill" özelliği bu fikre dayanır.'},
 {'id': 'orkestrasyon-7', 't': 'code', 'stage': 'Kendin yaz', 'diff': 2,
  'q': '<p>Çalışma günlüğünden gözlemlenebilirlik metrikleri çıkar. <code>gorev_metrikleri(kayitlar)</code> fonksiyonunu yaz; her kayıt <code>{"gorev", "durum", "sure_ms", "satir"}</code> içerir (<code>durum</code> <code>"basarili"</code> ya da <code>"basarisiz"</code>). Her görev için şu sözlüğü üret ve görev adına göre sıralı bir sözlük döndür:</p><ul><li><code>calisma</code>: toplam çalışma sayısı</li><li><code>basari_orani</code>: başarılı / toplam, 2 ondalık</li><li><code>ort_sure_ms</code>: <b>yalnız başarılı</b> çalışmaların ortalama süresi (tamsayıya yuvarlanmış); başarılı yoksa <code>None</code></li><li><code>son_satir</code>: son başarılı çalışmanın satır sayısı; yoksa <code>None</code></li><li><code>alarm</code>: son başarılı satır sayısı, önceki başarılı çalışmaların ortalamasının yarısından azsa <code>True</code> (önceki başarılı yoksa <code>False</code>)</li></ul>',
  'start': 'def gorev_metrikleri(kayitlar):\n    pass\n',
  'sol': r'''def gorev_metrikleri(kayitlar):
    gruplar = {}
    for k in kayitlar:
        gruplar.setdefault(k["gorev"], []).append(k)
    sonuc = {}
    for ad in sorted(gruplar):
        tum = gruplar[ad]
        basarili = [k for k in tum if k["durum"] == "basarili"]
        satirlar = [k["satir"] for k in basarili]
        alarm = False
        if len(satirlar) >= 2:
            onceki_ort = sum(satirlar[:-1]) / len(satirlar[:-1])
            alarm = satirlar[-1] < onceki_ort / 2
        sonuc[ad] = {
            "calisma": len(tum),
            "basari_orani": round(len(basarili) / len(tum), 2),
            "ort_sure_ms": round(sum(k["sure_ms"] for k in basarili) / len(basarili)) if basarili else None,
            "son_satir": satirlar[-1] if satirlar else None,
            "alarm": alarm,
        }
    return sonuc
''',
  'tests': r'''log = [
    {"gorev": "temizle", "durum": "basarili", "sure_ms": 1200, "satir": 1000},
    {"gorev": "cek", "durum": "basarisiz", "sure_ms": 30000, "satir": 0},
    {"gorev": "temizle", "durum": "basarili", "sure_ms": 1300, "satir": 1100},
    {"gorev": "cek", "durum": "basarili", "sure_ms": 800, "satir": 1050},
    {"gorev": "temizle", "durum": "basarisiz", "sure_ms": 50, "satir": 0},
    {"gorev": "temizle", "durum": "basarili", "sure_ms": 1250, "satir": 40},
    {"gorev": "rapor", "durum": "basarisiz", "sure_ms": 10, "satir": 0},
]
m = gorev_metrikleri(log)
assert list(m) == ["cek", "rapor", "temizle"], "görev adına göre sıralı olmalı"
assert m["temizle"] == {"calisma": 4, "basari_orani": 0.75, "ort_sure_ms": 1250, "son_satir": 40, "alarm": True}, f"temizle metrikleri hatalı: {m['temizle']}"
assert m["cek"] == {"calisma": 2, "basari_orani": 0.5, "ort_sure_ms": 800, "son_satir": 1050, "alarm": False}, f"cek: tek başarılı çalışmada alarm False: {m['cek']}"
assert m["rapor"] == {"calisma": 1, "basari_orani": 0.0, "ort_sure_ms": None, "son_satir": None, "alarm": False}, f"hiç başarılı yoksa None değerler: {m['rapor']}"
assert gorev_metrikleri([]) == {}, "boş günlük"
''',
  'hints': ['Önce görev adına göre grupla (setdefault), sonra her grubu ayrı hesapla.', 'Başarısız çalışmaların süresi (ör. 30 sn zaman aşımı) ortalamayı bozar; yalnız başarılıları kullan.', 'Alarm: satirlar[-1] < ortalama(satirlar[:-1]) / 2'],
  'why': 'Başarılı ama neredeyse boş çalışan bir görev (1000 yerine 40 satır), başarısız bir görevden daha tehlikelidir çünkü kimse fark etmez. Satır sayısı gibi hacim metrikleri ve basit eşikler sessiz veri sorunlarını yakalar.'},
 {'id': 'orkestrasyon-8', 't': 'code', 'stage': 'Hata avı', 'kind': 'bug', 'diff': 2,
  'q': '<p>Hatayı bul ve düzelt. Ilgaz Bank\'ın gün sonu işi <code>mutabakat_yukle(db, tarih, islemler)</code>, o günün işlemlerini <code>gun_sonu</code> tablosuna yazıyor. Airflow görevi zaman aşımından sonra yeniden denendiğinde toplamlar iki katına çıktı. Fonksiyonu <b>idempotent</b> yap: aynı tarih için tekrar çalıştırıldığında önceki yazdıklarının yerine geçsin. <code>islem_no</code> benzersizdir; tabloyu ya da imzayı değiştirmeden çöz.</p>',
  'start': r'''import sqlite3

def yeni_db():
    db = sqlite3.connect(":memory:")
    db.execute("CREATE TABLE gun_sonu (islem_no TEXT, tarih TEXT, tutar REAL)")
    return db

def mutabakat_yukle(db, tarih, islemler):
    with db:
        for no, tutar in islemler:
            db.execute("INSERT INTO gun_sonu VALUES (?, ?, ?)", (no, tarih, tutar))
    return db.execute("SELECT SUM(tutar) FROM gun_sonu WHERE tarih = ?", (tarih,)).fetchone()[0]
''',
  'sol': r'''import sqlite3

def yeni_db():
    db = sqlite3.connect(":memory:")
    db.execute("CREATE TABLE gun_sonu (islem_no TEXT, tarih TEXT, tutar REAL)")
    return db

def mutabakat_yukle(db, tarih, islemler):
    with db:
        db.execute("DELETE FROM gun_sonu WHERE tarih = ?", (tarih,))
        for no, tutar in islemler:
            db.execute("INSERT INTO gun_sonu VALUES (?, ?, ?)", (no, tarih, tutar))
    return db.execute("SELECT SUM(tutar) FROM gun_sonu WHERE tarih = ?", (tarih,)).fetchone()[0]
''',
  'tests': r'''db = yeni_db()
islemler = [("T1", 100.0), ("T2", 250.5)]
assert mutabakat_yukle(db, "2025-03-01", islemler) == 350.5, "ilk çalışma toplamı"
assert mutabakat_yukle(db, "2025-03-01", islemler) == 350.5, "yeniden deneme toplamı ikiye katlamamalı"
mutabakat_yukle(db, "2025-03-02", [("T3", 75.0)])
assert db.execute("SELECT COUNT(*) FROM gun_sonu").fetchone()[0] == 3, "toplam 3 satır olmalı (kopya yok, diğer gün korunur)"
assert mutabakat_yukle(db, "2025-03-01", [("T1", 100.0)]) == 100.0, "düzeltilmiş veriyle yeniden çalıştırma eski satırları kaldırmalı"
''',
  'hints': ['Düz INSERT her denemede yeni satır ekler.', 'Aynı işlem içinde önce o tarihin satırlarını sil: DELETE FROM gun_sonu WHERE tarih = ?'],
  'why': 'Orkestratör görevleri en az bir kez (at-least-once) çalıştırır; zaman aşımında iş aslında bitmiş olabilir. Bu yüzden her yükleme, yeniden çalıştırmaya dayanıklı yazılmalıdır.'},
 {'id': 'orkestrasyon-9', 't': 'code', 'stage': 'Hata avı', 'kind': 'bug', 'diff': 2,
  'q': '<p>Hatayı bul ve düzelt. Ekipteki <code>tekrar_dene(f, deneme=3)</code> yardımcısında iki sorun var: (1) deneme hakkı bittiğinde hatayı yutup <code>None</code> döndürüyor, bu yüzden akış "başarılı" görünüyor ve rapor boş gidiyor; (2) <code>ValueError</code> gibi kalıcı hataları da boşuna yeniden deniyor. Yalnız <code>ConnectionError</code> ve <code>TimeoutError</code> yeniden denensin; hak bitince ya da kalıcı hatada hata yukarı fırlatılsın.</p>',
  'start': r'''def tekrar_dene(f, deneme=3):
    for i in range(deneme):
        try:
            return f()
        except Exception as e:
            print(f"deneme {i + 1} başarısız: {e}")
    return None
''',
  'sol': r'''GECICI = (ConnectionError, TimeoutError)

def tekrar_dene(f, deneme=3):
    for i in range(deneme):
        try:
            return f()
        except GECICI as e:
            print(f"deneme {i + 1} başarısız: {e}")
            if i == deneme - 1:
                raise
''',
  'tests': r'''n = {"a": 0}
def bazen():
    n["a"] += 1
    if n["a"] < 2:
        raise ConnectionError("koptu")
    return 42
assert tekrar_dene(bazen) == 42 and n["a"] == 2, "geçici hatadan sonra başarı"
def hep_kopuk():
    raise TimeoutError("zaman aşımı")
try:
    tekrar_dene(hep_kopuk)
    assert False, "hak bitince TimeoutError yukarı fırlatılmalı, None dönmemeli"
except TimeoutError:
    pass
k = {"a": 0}
def bozuk():
    k["a"] += 1
    raise ValueError("geçersiz tarih")
try:
    tekrar_dene(bozuk)
    assert False, "ValueError yukarı fırlatılmalı"
except ValueError:
    pass
assert k["a"] == 1, f"kalıcı hata yeniden denenmemeli; {k['a']} kez çağrıldı"
''',
  'hints': ['except Exception her şeyi yakalar; yalnız geçici türleri yakala.', 'Son denemede çıplak raise ile hatayı olduğu gibi yukarı gönder; fonksiyonun sonunda return None kalmasın.'],
  'why': 'Hatayı yutan yeniden deneme, başarısızlığı "başarılı ama boş" bir sonuca çevirir: orkestratör görevi yeşil gösterir, alarm çalmaz, sorun günler sonra rapordaki eksik rakamlarla fark edilir. Görev başarısızsa başarısız görünmelidir.'},
 {'id': 'orkestrasyon-10', 't': 'code', 'stage': 'Meydan okuma', 'diff': 3,
  'q': '<p>Cron ifadesinden bir sonraki çalışma zamanını hesaplayan <code>sonraki_calisma(ifade, baslangic)</code> fonksiyonunu yaz. <code>baslangic</code> bir <code>datetime</code>\'dır; sonuç ondan <b>kesinlikle sonraki</b> ilk eşleşen dakika olsun (saniye 0). Hazır <code>cron_alan_ac</code> fonksiyonunu kullan. Kurallar:</p><ul><li>Alanlar: dakika (0-59), saat (0-23), ayın günü (1-31), ay (1-12), haftanın günü (0-6, 0 = Pazar; <code>7</code> de Pazar kabul edilsin).</li><li>Standart cron kuralı: ayın günü ve haftanın günü alanlarının <b>ikisi de</b> <code>*</code> değilse, günlerden <b>biri</b> tutması yeterlidir (VEYA). Biri <code>*</code> ise diğeri belirleyicidir.</li><li>Beş alan yoksa <code>ValueError</code>. 4 yıl içinde eşleşme yoksa (ör. <code>0 0 31 2 *</code>) <code>ValueError</code>.</li><li>Verimli ol: dakika dakika 4 yıl taramak yerine günleri tara, gün uygunsa saat ve dakika kümelerinden ilk uygun zamanı seç.</li></ul>',
  'start': r'''from datetime import datetime, timedelta

def cron_alan_ac(alan, alt, ust):
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

def sonraki_calisma(ifade, baslangic):
    pass
''',
  'sol': r'''from datetime import datetime, timedelta

def cron_alan_ac(alan, alt, ust):
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

def sonraki_calisma(ifade, baslangic):
    alanlar = ifade.split()
    if len(alanlar) != 5:
        raise ValueError("cron ifadesi 5 alan içermeli")
    dk, sa, gun_a, ay_a, hg_a = alanlar
    dakikalar = cron_alan_ac(dk, 0, 59)
    saatler = cron_alan_ac(sa, 0, 23)
    gunler = set(cron_alan_ac(gun_a, 1, 31))
    aylar = set(cron_alan_ac(ay_a, 1, 12))
    hgunler = {d % 7 for d in cron_alan_ac(hg_a, 0, 7)}
    gun_kisitli, hg_kisitli = gun_a != "*", hg_a != "*"

    def gun_uygun(t):
        if t.month not in aylar:
            return False
        g_ok = t.day in gunler
        h_ok = (t.weekday() + 1) % 7 in hgunler
        if gun_kisitli and hg_kisitli:
            return g_ok or h_ok
        return g_ok and h_ok

    t = baslangic.replace(second=0, microsecond=0) + timedelta(minutes=1)
    gun = t.replace(hour=0, minute=0)
    for _ in range(366 * 4 + 1):
        if gun_uygun(gun):
            for s in saatler:
                for d in dakikalar:
                    aday = gun.replace(hour=s, minute=d)
                    if aday >= t:
                        return aday
        gun += timedelta(days=1)
    raise ValueError("4 yıl içinde eşleşen zaman yok")
''',
  'tests': r'''from datetime import datetime
B = datetime(2025, 3, 14, 10, 7, 30)   # 14 Mart 2025 Cuma 10:07:30
assert sonraki_calisma("*/15 * * * *", B) == datetime(2025, 3, 14, 10, 15), "her 15 dakikada: 10:15"
assert sonraki_calisma("0 2 * * *", B) == datetime(2025, 3, 15, 2, 0), "her gün 02:00 -> ertesi gün"
assert sonraki_calisma("30 8 * * 1-5", B) == datetime(2025, 3, 17, 8, 30), "hafta içi 08:30: Cuma geçti, Pazartesi"
assert sonraki_calisma("0 6 * * 0", B) == datetime(2025, 3, 16, 6, 0), "Pazar 06:00"
assert sonraki_calisma("0 6 * * 7", B) == datetime(2025, 3, 16, 6, 0), "7 de Pazar"
assert sonraki_calisma("0 0 1 * *", B) == datetime(2025, 4, 1, 0, 0), "ayın 1\'i"
assert sonraki_calisma("7 10 * * *", B) == datetime(2025, 3, 15, 10, 7), "başlangıç dakikası (10:07) hariç tutulmalı: kesinlikle sonrası"
assert sonraki_calisma("8 10 * * *", B) == datetime(2025, 3, 14, 10, 8), "aynı gün sonraki dakika"
assert sonraki_calisma("0 9 13 * 1", B) == datetime(2025, 3, 17, 9, 0), "gün ve haftanın günü ikisi de kısıtlı: VEYA (Pazartesi 17 Mart, 13 Nisan\'dan önce)"
assert sonraki_calisma("0 0 29 2 *", B) == datetime(2028, 2, 29, 0, 0), "29 Şubat: sonraki artık yıl"
assert sonraki_calisma("59 23 31 12 *", datetime(2025, 12, 31, 23, 59)) == datetime(2026, 12, 31, 23, 59), "yıl geçişi"
for kotu in ["0 0 31 2 *", "* * * *"]:
    try:
        sonraki_calisma(kotu, B)
        assert False, f"{kotu!r} için ValueError bekleniyordu"
    except ValueError:
        pass
''',
  'hints': ['Python weekday(): Pazartesi 0 ... Pazar 6; cron: Pazar 0. Dönüşüm: (weekday() + 1) % 7. 7\'yi de 0\'a indirmek için d % 7.', 'Başlangıcı saniyesiz bir dakika ileri al; sonra gün gün ilerle, uygun günde sıralı saat ve dakikaları dene, başlangıçtan küçük olmayan ilk adayı döndür.', 'Gün kuralı: iki gün alanı da kısıtlıysa g_ok or h_ok, değilse g_ok and h_ok (* olan alan her zaman True verir).'],
  'why': 'Gerçek zamanlayıcılar (cron, croniter, APScheduler) bu hesabı yapar. Gün/haftanın günü VEYA kuralı cron\'un en çok yanlış bilinen inceliğidir; artık yıl, yıl geçişi ve "kesinlikle sonraki" sınırı ise tipik kenar durumlardır.'},
 {'id': 'orkestrasyon-11', 't': 'code', 'stage': 'Meydan okuma', 'diff': 3,
  'q': '<p>Gece akışının ne kadar süreceğini bulmak için <b>kritik yolu</b> hesapla. <code>kritik_yol(sureler, bagimliliklar)</code> fonksiyonunu yaz: <code>sureler</code> görev → dakika, <code>bagimliliklar</code> görev → önceki görevler listesidir. Sınırsız paralellik varsayımıyla akışın toplam süresini ve bu süreyi belirleyen görev zincirini döndürsün: <code>(toplam_dakika, [görevler başlangıçtan sona])</code>. Eşit süreli birden çok yol varsa önceki görevi seçerken alfabetik olarak küçük olanı tercih et. Döngüde <code>ValueError</code>.</p>',
  'start': 'from graphlib import TopologicalSorter, CycleError\n\ndef kritik_yol(sureler, bagimliliklar):\n    pass\n',
  'sol': r'''from graphlib import TopologicalSorter, CycleError

def kritik_yol(sureler, bagimliliklar):
    tum = {g: list(bagimliliklar.get(g, [])) for g in sureler}
    try:
        sira = list(TopologicalSorter(tum).static_order())
    except CycleError as e:
        raise ValueError(f"döngü: {e.args[1]}") from None
    bitis, onceki = {}, {}
    for g in sira:
        oncekiler = sorted(tum.get(g, []))
        en_iyi = None
        for o in oncekiler:
            if en_iyi is None or bitis[o] > bitis[en_iyi]:
                en_iyi = o
        bitis[g] = (bitis[en_iyi] if en_iyi else 0) + sureler[g]
        onceki[g] = en_iyi
    if not bitis:
        return 0, []
    son = min(bitis, key=lambda g: (-bitis[g], g))
    yol = []
    while son is not None:
        yol.append(son)
        son = onceki[son]
    return bitis[yol[0]], yol[::-1]
''',
  'tests': r'''sureler = {"siparis_cek": 20, "musteri_cek": 5, "urun_cek": 8, "temizle": 15, "stok": 20, "rapor": 10, "eposta": 2}
bag = {"temizle": ["siparis_cek", "musteri_cek"], "stok": ["urun_cek"], "rapor": ["temizle", "stok"], "eposta": ["rapor"]}
assert kritik_yol(sureler, bag) == (47, ["siparis_cek", "temizle", "rapor", "eposta"]), f"kritik yol hatalı: {kritik_yol(sureler, bag)}"
sureler["stok"] = 40
assert kritik_yol(sureler, bag) == (60, ["urun_cek", "stok", "rapor", "eposta"]), "stok uzayınca kritik yol değişmeli"
assert kritik_yol({"a": 5, "b": 5, "c": 1}, {"c": ["b", "a"]}) == (6, ["a", "c"]), "eşitlikte alfabetik küçük önceki seçilmeli"
assert kritik_yol({"tek": 7}, {}) == (7, ["tek"]), "tek görev"
assert kritik_yol({}, {}) == (0, []), "boş akış"
try:
    kritik_yol({"a": 1, "b": 1}, {"a": ["b"], "b": ["a"]})
    assert False, "döngüde ValueError bekleniyordu"
except ValueError:
    pass
''',
  'hints': ['Topolojik sırayla gez: bir görevin en erken bitişi = en geç biten öncülünün bitişi + kendi süresi.', 'Her görev için hangi öncülden geldiğini (onceki sözlüğü) sakla; en büyük bitişe sahip görevden geriye yürüyerek yolu kur.', 'Eşitlikte alfabetik seçim için öncülleri sıralı gez ve yalnız kesinlikle büyükse güncelle.'],
  'why': 'Kritik yol, akışın süresini kısaltmak için hangi göreve odaklanman gerektiğini söyler: kritik yolda olmayan bir görevi hızlandırmak toplam süreyi değiştirmez. SLA planlamasında ve paralelleştirme kararlarında temel araçtır.'},
 {'id': 'orkestrasyon-12', 't': 'code', 'stage': 'Mini proje', 'diff': 3,
  'q': '<p>Airflow\'un özünü taklit eden bir <code>MiniDAG</code> sınıfı yaz.</p><ul><li><code>gorev(ad, fonk, bagimli=(), deneme=1)</code>: görev ekler. <code>fonk</code>, öncül görevlerin çıktılarını içeren bir sözlükle çağrılır (<code>fonk({"cek": 120})</code>; XCom karşılığı). Aynı ad iki kez eklenirse <code>ValueError</code>.</li><li><code>calistir()</code>: görevleri topolojik sırayla (aynı anda hazır olanlar alfabetik) çalıştırır ve <code>(durumlar, ciktilar)</code> döndürür. Durumlar: <code>"basarili"</code>, <code>"basarisiz"</code> (tüm denemeler hata verdi), <code>"atlandi"</code> (öncüllerinden biri başarısız ya da atlandı; bu görev hiç çağrılmaz). Bir görev en fazla <code>deneme</code> kez çağrılır. <code>ciktilar</code> yalnız başarılı görevlerin dönüş değerlerini içerir.</li><li><code>gunluk</code> listesine her çağrı için <code>(ad, deneme_no, "ok"|"hata")</code> eklensin.</li><li>Bilinmeyen öncül ya da döngüde <code>calistir</code> <code>ValueError</code> fırlatsın.</li></ul>',
  'start': r'''from graphlib import TopologicalSorter, CycleError

class MiniDAG:
    def __init__(self):
        self.gorevler = {}
        self.gunluk = []

    # TODO: gorev, calistir
''',
  'sol': r'''from graphlib import TopologicalSorter, CycleError

class MiniDAG:
    def __init__(self):
        self.gorevler = {}
        self.gunluk = []

    def gorev(self, ad, fonk, bagimli=(), deneme=1):
        if ad in self.gorevler:
            raise ValueError(f"görev zaten var: {ad}")
        self.gorevler[ad] = {"fonk": fonk, "bagimli": list(bagimli), "deneme": deneme}

    def calistir(self):
        for ad, g in self.gorevler.items():
            for b in g["bagimli"]:
                if b not in self.gorevler:
                    raise ValueError(f"{ad} bilinmeyen göreve bağlı: {b}")
        ts = TopologicalSorter({ad: g["bagimli"] for ad, g in self.gorevler.items()})
        try:
            ts.prepare()
        except CycleError as e:
            raise ValueError(f"döngü: {e.args[1]}") from None
        durumlar, ciktilar = {}, {}
        while ts.is_active():
            for ad in sorted(ts.get_ready()):
                g = self.gorevler[ad]
                if any(durumlar[b] != "basarili" for b in g["bagimli"]):
                    durumlar[ad] = "atlandi"
                else:
                    girdi = {b: ciktilar[b] for b in g["bagimli"]}
                    durumlar[ad] = "basarisiz"
                    for i in range(1, g["deneme"] + 1):
                        try:
                            ciktilar[ad] = g["fonk"](girdi)
                        except Exception:
                            self.gunluk.append((ad, i, "hata"))
                            continue
                        self.gunluk.append((ad, i, "ok"))
                        durumlar[ad] = "basarili"
                        break
                ts.done(ad)
        return durumlar, ciktilar
''',
  'tests': r'''sayac = {"api": 0}
def cek(_):
    sayac["api"] += 1
    if sayac["api"] < 2:
        raise ConnectionError("API düştü")
    return [120, 80, 300]
dag = MiniDAG()
dag.gorev("siparis_cek", cek, deneme=3)
dag.gorev("musteri_cek", lambda g: {"M1": "İzmir"})
dag.gorev("temizle", lambda g: [t for t in g["siparis_cek"] if t > 100], bagimli=["siparis_cek"])
dag.gorev("rapor", lambda g: f"{len(g['temizle'])} sipariş, {len(g['musteri_cek'])} müşteri", bagimli=["temizle", "musteri_cek"])
dag.gorev("stok", lambda g: 1 / 0, bagimli=["siparis_cek"], deneme=2)
dag.gorev("eposta", lambda g: "gönderildi", bagimli=["rapor", "stok"])
dag.gorev("arsivle", lambda g: "ok", bagimli=["eposta"])
durum, cikti = dag.calistir()
assert durum == {"musteri_cek": "basarili", "siparis_cek": "basarili", "stok": "basarisiz", "temizle": "basarili", "rapor": "basarili", "eposta": "atlandi", "arsivle": "atlandi"}, f"durumlar hatalı: {durum}"
assert cikti["temizle"] == [120, 300] and cikti["rapor"] == "2 sipariş, 1 müşteri", f"çıktılar öncüllere aktarılmalı (XCom): {cikti}"
assert "stok" not in cikti and "eposta" not in cikti, "yalnız başarılı görevlerin çıktısı tutulmalı"
assert dag.gunluk == [("musteri_cek", 1, "ok"), ("siparis_cek", 1, "hata"), ("siparis_cek", 2, "ok"), ("stok", 1, "hata"), ("stok", 2, "hata"), ("temizle", 1, "ok"), ("rapor", 1, "ok")], f"çalıştırma günlüğü hatalı: {dag.gunluk}"
try:
    dag.gorev("rapor", lambda g: 0)
    assert False, "aynı ad iki kez eklenmemeli"
except ValueError:
    pass
d2 = MiniDAG()
d2.gorev("a", lambda g: 1, bagimli=["yok"])
try:
    d2.calistir()
    assert False, "bilinmeyen öncül ValueError vermeli"
except ValueError:
    pass
d3 = MiniDAG()
d3.gorev("a", lambda g: 1, bagimli=["b"])
d3.gorev("b", lambda g: 1, bagimli=["a"])
try:
    d3.calistir()
    assert False, "döngü ValueError vermeli"
except ValueError:
    pass
''',
  'hints': ['TopologicalSorter + prepare() + get_ready()/done() döngüsü; her turda hazırları sorted ile alfabetik gez.', 'Bir görevin öncüllerinden biri "basarili" değilse görevi hiç çağırmadan "atlandi" yap; yine de done() çağır ki alt görevler de değerlendirilsin.', 'Deneme döngüsünde her çağrıyı gunluk\'e yaz; başarıda break, hepsi başarısızsa durum "basarisiz" kalır.'],
  'why': 'Bu küçük sınıf, Airflow zamanlayıcısının ve çalıştırıcısının çekirdeğidir: topolojik sıra, görev başına yeniden deneme, öncül başarısızsa alt görevleri atlama (upstream_failed), XCom ile küçük çıktı aktarımı ve her denemenin kaydı. Gerçek araçlar buna kalıcı durum, paralel işçiler, zamanlama ve arayüz ekler.'},
],
'faq': [
 {'q': 'Cron mu, Airflow mu kullanmalıyım?',
  'a': 'Birkaç bağımsız iş varsa cron (ya da bulut zamanlayıcısı) yeterlidir. Görevler birbirine bağlıysa, yeniden deneme, geçmişe dönük çalıştırma, izleme ve ekipler arası görünürlük gerekiyorsa Airflow, Prefect ya da Dagster gibi bir orkestratör kullan. Orkestratörün kurulum ve bakım maliyeti olduğunu unutma.'},
 {'q': 'Airflow\'da büyük veriyi görevler arasında nasıl taşırım?',
  'a': 'Taşımazsın. Görev veriyi dosya/nesne deposuna (S3, GCS, yerel disk) ya da veritabanına yazar, XCom ile yalnız yolunu veya tablo adını iletir. Ağır işlem Airflow işçisinde değil, veritabanında, Spark\'ta ya da ayrı bir konteynerde yapılır; Airflow onu tetikler ve izler.'},
 {'q': 'Görevimin idempotent olduğunu nasıl test ederim?',
  'a': 'Aynı girdiyle iki kez çalıştırıp sonuç durumunu (satır sayısı, toplamlar, dosya içeriği) karşılaştıran bir test yaz. Ayrıca yarıda kesilip yeniden başlatılma senaryosunu (ilk çalışma hata versin, ikincisi başarılı olsun) test et.'},
 {'q': 'Yeniden deneme sayısını ne kadar yüksek tutmalıyım?',
  'a': 'Geçici hatalar için 2-5 deneme ve üstel bekleme genelde yeterlidir. Çok yüksek deneme sayısı kalıcı sorunları saatlerce geciktirir ve alarmın geç çalmasına yol açar. Kalıcı hataları (doğrulama, yetki) hiç yeniden deneme.'},
],
'mistakes': [
 {'why': 'Görev "şimdi"ye göre çalışırsa dünün işini yeniden çalıştıramaz ve backfill yapılamaz; işlenecek tarih parametre olmalı.',
  'bad': 'def gunluk_rapor():\n    tarih = date.today() - timedelta(days=1)\n    ...',
  'good': 'def gunluk_rapor(tarih: date):\n    ...\n# Airflow: gunluk_rapor(ds) / logical_date'},
 {'why': 'Düz INSERT her yeniden denemede kopya üretir; aynı işlem içinde sil-yaz ya da upsert kullan.',
  'bad': 'for s in satirlar:\n    db.execute("INSERT INTO satis VALUES (?, ?)", s)',
  'good': 'with db:\n    db.execute("DELETE FROM satis WHERE tarih = ?", (tarih,))\n    db.executemany("INSERT INTO satis VALUES (?, ?, ?)", satirlar)'},
 {'why': 'XCom meta veritabanında saklanır; büyük veri koymak veritabanını şişirir ve akışı yavaşlatır.',
  'bad': '@task\ndef cek():\n    return df.to_dict()   # milyonlarca satır',
  'good': '@task\ndef cek(ds=None):\n    yol = f"/data/siparis_{ds}.parquet"\n    df.to_parquet(yol)\n    return yol'},
 {'why': 'Tüm hataları yeniden denemek kalıcı sorunları geciktirir; hatayı yutmak ise görevi sahte başarılı gösterir.',
  'bad': 'for _ in range(5):\n    try:\n        return f()\n    except Exception:\n        pass',
  'good': 'for i in range(5):\n    try:\n        return f()\n    except (ConnectionError, TimeoutError):\n        if i == 4:\n            raise\n        time.sleep(2 ** i)'},
],
}
