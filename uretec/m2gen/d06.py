from d01 import I

ITEMS = [
I(['muhendis', 'analist'], 'temel', 'kavram', 'ETL ve ELT',
  'ETL ile ELT arasındaki fark nedir? Modern veri yığınlarında neden ELT yaygınlaştı?',
  '<p><b>ETL (Extract-Transform-Load):</b> Veri kaynaktan çekilir, ayrı bir işlem sunucusunda (ya da ETL aracında) dönüştürülür, temizlenmiş hâliyle hedefe yüklenir. Hedef sisteme yalnız son biçim girer.</p>'
  '<p><b>ELT (Extract-Load-Transform):</b> Veri kaynaktan çekilip <b>ham hâliyle</b> ambar ya da göle yüklenir; dönüşümler hedefin kendi işlem gücüyle (çoğunlukla SQL, ör. dbt modelleri) yapılır.</p>'
  '<p><b>ELT neden yaygınlaştı?</b></p><ul>'
  '<li>Bulut ambarları (BigQuery, Snowflake, Redshift) depolama ve işlem gücünü ucuz ve ölçeklenebilir hâle getirdi; dönüşümü ayrı sunucuda yapmanın avantajı azaldı.</li>'
  '<li>Ham veri saklandığı için iş kuralı değiştiğinde geçmişi yeniden işlemek kolaydır; ETL\'de dönüştürülmüş veri kaybolmuş olabilir.</li>'
  '<li>Dönüşümler SQL ile yazıldığından analistler de katkı verebilir, sürüm kontrolü ve testle yönetilebilir.</li></ul>'
  '<p><b>ETL hâlâ ne zaman mantıklı?</b> Kişisel verilerin (TCKN, kart numarası) hedefe hiç girmemesi gerektiğinde maskeleme yüklemeden önce yapılır. Hedef sistem pahalı ya da zayıfsa, ya da veri karmaşık Python işlemleri (görüntü, metin ayrıştırma) gerektiriyorsa. Pratikte çoğu kurum karma kullanır: hafif temizlik ve maskeleme yükleme öncesi, iş mantığı ambarda.</p>',
  ['dbt ELT\'de hangi rolü oynar?', 'Ham veri katmanını ne kadar süre saklarsın?'],
  ['ELT\'yi yalnız harf sırası farkı olarak açıklamak', 'Kişisel veri maskeleme gibi ETL gerektiren durumları görmemek'],
  'Tanımın ardından "neden değişti?" sorusunu (bulut ambarlarının ekonomisi) cevaplamak bağlamı bildiğini gösterir.'),

I(['muhendis', 'otomasyon'], 'temel', 'kavram', 'İdempotentlik',
  'Bir veri boru hattının idempotent olması ne demektir? Neden önemlidir ve nasıl sağlanır?',
  '<p><b>Tanım:</b> Bir işi aynı girdiyle bir kez de çalıştırsan, beş kez de çalıştırsan hedefteki sonuç <b>aynı</b> kalır. "15 Mart\'ın satışlarını yükle" işi ikinci kez çalışınca satırları ikiye katlamaz.</p>'
  '<p><b>Neden önemli:</b> Boru hatları sık sık yarıda kalır ve yeniden denenir: ağ kopması, zaman aşımı, Airflow\'un otomatik tekrarı, geçmişi yeniden işleme (backfill). İdempotent olmayan bir işte her tekrar yinelenen kayıt, şişmiş ciro ve gece yarısı elle temizlik demektir.</p>'
  '<p><b>Nasıl sağlanır:</b></p><ul>'
  '<li><b>Bölüm üzerine yazma:</b> İş belirli bir tarihi işler ve o tarihin bölümünü (partition) tamamen silip yeniden yazar: <code>DELETE WHERE tarih = :gun</code> + <code>INSERT</code>, aynı işlem (transaction) içinde; ya da <code>INSERT OVERWRITE PARTITION</code>.</li>'
  '<li><b>Upsert / MERGE:</b> Doğal anahtara göre varsa güncelle, yoksa ekle.</li>'
  '<li><b>Deterministik girdi:</b> İş "şimdiki zamanı" değil, kendisine verilen mantıksal tarihi (Airflow\'da veri aralığı) kullanır. <code>datetime.now()</code> ile çalışan iş, yeniden denendiğinde farklı veri işler.</li>'
  '<li><b>Atomik yazma:</b> Önce geçici tabloya/dosyaya yaz, sonra tek adımda yer değiştir; yarım kalan iş hedefi bozmaz.</li></ul>'
  '<p>Yan etkiler (e-posta, ödeme) de idempotent tasarlanmalı: gönderilen bildirimleri bir anahtarla kaydedip tekrarı engellemek gibi.</p>',
  ['Yalnız ekleme yapılan (append-only) bir olay tablosunu nasıl idempotent yüklersin?', 'Airflow\'da logical date neden önemlidir?'],
  ['İdempotentliği "hata vermeden tekrar çalışabilmek" diye tanımlamak', 'İş içinde şimdiki zamanı kullanmayı sorun görmemek'],
  'Somut bir felaket senaryosu ("yeniden deneme ciroyu ikiye katladı") anlatmak, kavramın neden kritik olduğunu hemen gösterir.'),

I(['muhendis'], 'temel', 'kod-okuma', 'İdempotent yükleme',
  'Aynı günlük ciro paketi iki tabloya ikişer kez yükleniyor. İki satırın çıktısı ne olur?',
  '<p><b>gunluk_ciro:</b> <code>tarih</code> birincil anahtardır ve yükleme <code>INSERT OR REPLACE</code> ile yapılır. İkinci çalıştırmada aynı tarihler zaten var; SQLite eski satırı silip yenisini yazar. Sonuç <b>(2, 2150.0)</b>: 2 satır, 1200 + 950. Yüklemeyi kaç kez tekrarlarsan tekrarla sonuç aynıdır, yani işlem <b>idempotenttir</b>.</p>'
  '<p><b>log_ciro:</b> Anahtar yok, düz <code>INSERT</code>. Her çalıştırma satır ekler: <b>(4, 4300.0)</b>. Bir yeniden deneme ciroyu iki katına çıkarmıştır ve hiçbir hata mesajı yoktur.</p>'
  '<p><b>Dikkat edilecek noktalar:</b></p><ul>'
  '<li><code>INSERT OR REPLACE</code> satırı silip yeniden eklediği için satırdaki diğer sütunlar (ör. oluşturma zamanı) kaybolabilir. Yalnız belirli sütunları güncellemek için <code>INSERT ... ON CONFLICT(tarih) DO UPDATE SET ciro = excluded.ciro</code> daha kontrollüdür.</li>'
  '<li>Ambar sistemlerinde karşılığı <code>MERGE</code> ya da bölüm üzerine yazmadır.</li>'
  '<li>Doğal bir anahtar yoksa (olay logları) olaya benzersiz bir kimlik verip tekilleştirmek gerekir.</li></ul>',
  ['ON CONFLICT DO UPDATE ile INSERT OR REPLACE farkını göster.', 'Toplu yüklemede performans için executemany yeterli mi?'],
  ['İkinci tablonun da 2 satır vereceğini sanmak', 'Hata vermediği için yüklemenin doğru olduğunu varsaymak'],
  'Kod okumada "hata yok ama sonuç yanlış" durumlarını özellikle belirt; veri mühendisliğinin en pahalı hataları bunlardır.',
  code='''
import sqlite3
con = sqlite3.connect(':memory:')
con.execute('CREATE TABLE gunluk_ciro (tarih TEXT PRIMARY KEY, ciro REAL)')
con.execute('CREATE TABLE log_ciro (tarih TEXT, ciro REAL)')
paket = [('2024-05-01', 1200.0), ('2024-05-02', 950.0)]
for _ in range(2):   # aynı yükleme iki kez çalıştı
    con.executemany('INSERT OR REPLACE INTO gunluk_ciro VALUES (?, ?)', paket)
    con.executemany('INSERT INTO log_ciro VALUES (?, ?)', paket)
print(con.execute('SELECT COUNT(*), SUM(ciro) FROM gunluk_ciro').fetchone())
print(con.execute('SELECT COUNT(*), SUM(ciro) FROM log_ciro').fetchone())
'''),

I(['muhendis', 'analist'], 'temel', 'kavram', 'Parquet ve kolon tabanlı depolama',
  'Parquet gibi kolon tabanlı formatlar CSV\'ye göre neden analitik iş yükleri için daha uygundur?',
  '<p><b>Satır tabanlı (CSV, OLTP veritabanları):</b> Bir satırın tüm sütunları yan yana saklanır. Tek bir kaydı okumak ya da yazmak verimlidir.</p>'
  '<p><b>Kolon tabanlı (Parquet, ORC):</b> Her sütunun değerleri yan yana saklanır. Analitik sorgular genelde çok satır ama az sütun okur: "50 sütunlu sipariş tablosunda ilçeye göre toplam tutar" yalnız 2 sütuna ihtiyaç duyar.</p>'
  '<p><b>Avantajlar:</b></p><ul>'
  '<li><b>Sütun seçimi (projection):</b> Yalnız gerekli sütunlar diskten okunur. <code>pd.read_parquet(yol, columns=[\'ilce\', \'tutar\'])</code>.</li>'
  '<li><b>Sıkıştırma:</b> Aynı tipteki ve birbirine benzeyen değerler (çok tekrar eden şehir adları) çok iyi sıkışır; sözlük ve run-length kodlama. Dosyalar CSV\'nin çoğu zaman 5–10\'da biri kadardır.</li>'
  '<li><b>Şema ve tipler:</b> Sütun tipleri dosyada saklanır; CSV\'deki "tarih metin olarak mı geldi, baştaki sıfır düştü mü" sorunları yaşanmaz.</li>'
  '<li><b>Önerme itme (predicate pushdown):</b> Dosya içindeki satır gruplarının min/max istatistikleri sayesinde filtreyle eşleşmeyen bloklar hiç okunmaz.</li></ul>'
  '<p><b>Dezavantajlar:</b> İnsan tarafından okunamaz; tek satır güncellemek pahalıdır (dosya değişmezdir, yeniden yazılır). Bu yüzden işlemsel sistemlerde değil, ambar ve göllerde kullanılır.</p>',
  ['Parquet dosyasında satır grubu (row group) nedir?', 'Çok sayıda küçük parquet dosyası neden sorun yaratır?'],
  ['Avantajı yalnız "daha küçük dosya" olarak özetlemek', 'Kolon tabanlı formatın tek satır güncellemede de iyi olduğunu söylemek'],
  'Cevabı "analitik sorgu az sütun, çok satır okur" gözlemine dayandır; diğer her şey bundan türer.'),

I(['muhendis'], 'ileri', 'kavram', 'Bölümleme',
  'Veri gölünde tabloları bölümlemek (partitioning) ne sağlar? Bölüm anahtarını nasıl seçersin ve hangi hatalardan kaçınırsın?',
  '<p><b>Ne sağlar:</b> Veri, bir sütunun değerlerine göre ayrı klasörlere yazılır: <code>siparisler/tarih=2024-05-01/part-0.parquet</code> (Hive tarzı). Sorgu <code>WHERE tarih = \'2024-05-01\'</code> içerdiğinde motor yalnız ilgili klasörü okur (bölüm budama, partition pruning). Ayrıca idempotent yükleme için bir günün bölümünü tamamen değiştirmek kolaylaşır.</p>'
  '<p><b>Anahtar seçimi:</b></p><ul>'
  '<li>Sorgularda <b>en sık filtrelenen</b> sütun; çoğu zaman tarih.</li>'
  '<li><b>Düşük-orta kardinalite:</b> Her bölüm yeterince büyük olmalı (yüzlerce MB–birkaç GB).</li>'
  '<li>Yükleme deseniyle uyumlu: günlük gelen veri için günlük bölüm.</li></ul>'
  '<p><b>Kaçınılacak hatalar:</b></p><ul>'
  '<li><b>Yüksek kardinalite:</b> <code>musteri_id</code> ile bölümlemek milyonlarca küçük klasör üretir. Küçük dosya sorunu: dosya listeleme ve açma maliyeti, okuma süresini katlar.</li>'
  '<li><b>Aşırı ince zaman bölümü:</b> Günde 10 MB veri için saatlik bölüm gereksizdir; aylık bile yeterli olabilir.</li>'
  '<li><b>Çarpık bölümler:</b> Bir şehir verinin %70\'iyse şehir bölümü dengesizdir.</li>'
  '<li><b>Filtreyi bölüm sütununa uygulamamak:</b> <code>WHERE DATE(zaman) = ...</code> yazıp bölüm sütunu <code>tarih</code>\'i kullanmamak budamayı devre dışı bırakır.</li></ul>'
  '<p>Bölüm içindeki ikincil filtreler için kümeleme/sıralama (Z-order, clustering) kullanılır; böylece bölüm sayısını artırmadan veri atlama sağlanır.</p>',
  ['Küçük dosya sorununu nasıl çözersin (compaction)?', 'Bölümleme ile kümeleme (clustering) arasındaki fark nedir?'],
  ['Müşteri kimliği gibi yüksek kardinaliteli sütunla bölümlemeyi önermek', 'Bölümlemeyi her tabloya varsayılan olarak uygulamak'],
  'Hedef bölüm boyutu için bir rakam (yüzlerce MB) vermek, pratikte bu işi yaptığını gösterir.'),

I(['muhendis', 'ml'], 'orta', 'kavram', 'Spark temel kavramları',
  'Apache Spark\'ta tembel değerlendirme (lazy evaluation), dönüşüm (transformation) ve eylem (action) nedir? Dar ve geniş dönüşüm farkı neden önemlidir?',
  '<p><b>Tembel değerlendirme:</b> <code>filter</code>, <code>select</code>, <code>groupBy</code> gibi <b>dönüşümler</b> hemen çalışmaz; Spark yalnız bir yürütme planı (DAG) oluşturur. <code>count</code>, <code>collect</code>, <code>write</code>, <code>show</code> gibi bir <b>eylem</b> çağrılınca plan optimize edilir (Catalyst) ve çalıştırılır. Bu sayede filtreler okuma aşamasına itilir, gereksiz sütunlar hiç okunmaz.</p>'
  '<p><b>Pratik sonucu:</b> Kodda bir hata, ancak eylem çağrılınca ortaya çıkar. Aynı DataFrame üzerinde iki eylem çağırırsan tüm hesap iki kez yapılır; tekrar kullanılacak ara sonuç <code>cache()</code> ile saklanabilir.</p>'
  '<p><b>Dar dönüşüm (narrow):</b> Her çıktı bölümü yalnız bir girdi bölümüne bağlıdır: <code>filter</code>, <code>select</code>, <code>withColumn</code>. Veri makineler arasında taşınmaz; hızlıdır.</p>'
  '<p><b>Geniş dönüşüm (wide):</b> Çıktı bölümü birçok girdi bölümünden veri ister: <code>groupBy</code>, <code>join</code>, <code>distinct</code>, <code>orderBy</code>. Veri anahtara göre ağ üzerinden yeniden dağıtılır; buna <b>shuffle</b> denir. Shuffle diske yazma, ağ trafiği ve serileştirme içerir; çoğu Spark işinde en pahalı adımdır ve aşama (stage) sınırlarını belirler.</p>'
  '<p><b>Optimizasyon ilkesi:</b> Shuffle sayısını ve taşınan veri miktarını azalt: önce filtrele ve sütunları seç, küçük tabloları broadcast join ile birleştir.</p>',
  ['Spark UI\'da bir işin yavaş aşamasını nasıl bulursun?', 'repartition ile coalesce farkı nedir?', 'pandas ile PySpark arasında ne zaman geçiş yaparsın?'],
  ['Her satırın kod yazıldığı anda çalıştığını düşünmek', 'Shuffle\'ın maliyetini bilmemek'],
  'Spark sorularında "shuffle" kelimesini doğru bağlamda kullanmak, gerçekten Spark ile çalıştığını gösterir.'),

I(['muhendis'], 'ileri', 'kavram', 'Spark: veri çarpıklığı',
  'Spark\'ta bir join işi 200 görevin 199\'unu 1 dakikada bitiriyor, sonuncusu 45 dakika sürüyor. Sorun nedir ve nasıl çözersin?',
  '<p><b>Teşhis: veri çarpıklığı (data skew).</b> Shuffle sırasında satırlar join anahtarının hash\'ine göre bölümlere dağıtılır. Bir anahtar değeri çok sık geçiyorsa (ör. Anadolu Market\'te misafir siparişlerinin <code>musteri_id = 0</code> olması ya da NULL anahtarlar) o anahtarın tüm satırları tek bir göreve düşer. Spark UI\'da görev süreleri ve okunan shuffle boyutlarının dağılımı bunu gösterir.</p>'
  '<p><b>Çözümler:</b></p><ul>'
  '<li><b>Sorunlu anahtarı ayır:</b> NULL ya da varsayılan anahtarlar join\'e hiç girmemeli; ayrı işlenip sonra birleştirilebilir.</li>'
  '<li><b>Broadcast join:</b> Bir taraf küçükse (ör. birkaç yüz MB\'lık ürün tablosu) her yürütücüye kopyalanır; shuffle hiç olmaz, çarpıklık önemsizleşir. <code>F.broadcast(kucuk_df)</code>.</li>'
  '<li><b>Tuzlama (salting):</b> Büyük taraftaki sıcak anahtara rastgele bir sonek eklenir (<code>0_3</code>, <code>0_7</code>...), küçük taraf her sonek için çoğaltılır. Sıcak anahtarın yükü N göreve bölünür.</li>'
  '<li><b>Uyarlamalı sorgu yürütme (AQE):</b> Spark 3\'te <code>spark.sql.adaptive.skewJoin.enabled</code> çarpık bölümleri çalışma anında otomatik böler. Önce bunun açık olduğunu kontrol et.</li>'
  '<li><b>İki aşamalı toplama:</b> groupBy\'da çarpıklık varsa önce tuzlu anahtarla kısmi toplama, sonra asıl anahtarla son toplama.</li></ul>'
  '<p>Yürütücü belleğini artırmak semptomu geciktirir ama sorunu çözmez.</p>',
  ['Tuzlamanın maliyeti nedir?', 'Çarpıklığı veri profillemede önceden nasıl tespit edersin?'],
  ['İlk çözüm olarak daha fazla bellek ya da düğüm eklemek', 'NULL anahtarların çarpıklık kaynağı olabileceğini düşünmemek'],
  'Belirtiyi (tek görev çok yavaş) doğru teşhise bağlamak puanın yarısıdır; çözümleri basitten karmaşığa sırala.'),

I(['muhendis', 'otomasyon'], 'orta', 'kavram', 'Airflow DAG',
  'Apache Airflow\'da DAG, görev (task) ve operatör nedir? Zamanlama, veri aralığı (data interval) ve catchup kavramlarını açıkla.',
  '<p><b>DAG:</b> Yönlü, döngüsüz graf; görevlerin ve aralarındaki bağımlılıkların tanımı. Python koduyla yazılır ama Airflow onu bir iş akışı tanımı olarak okur; ağır işlem DAG dosyasının en üst seviyesinde yapılmamalıdır.</p>'
  '<p><b>Görev ve operatör:</b> Operatör bir görev şablonudur (<code>PythonOperator</code>, <code>BashOperator</code>, SQL operatörleri, sensörler); görev, DAG içindeki somut örneğidir. Bağımlılıklar <code>cek &gt;&gt; temizle &gt;&gt; yukle</code> ile tanımlanır. TaskFlow API ile <code>@task</code> dekoratörü daha sade yazım sunar.</p>'
  '<p><b>Zamanlama ve veri aralığı:</b> <code>schedule=\'@daily\'</code> olan bir DAG\'ın 1 Mayıs çalıştırması, 1 Mayıs 00:00–2 Mayıs 00:00 aralığının verisini işler ve bu aralık <b>bittikten sonra</b>, yani 2 Mayıs\'ta başlar. Görevler şimdiki zamanı değil <code>data_interval_start</code>/<code>data_interval_end</code> (ya da <code>ds</code>) değerini kullanmalıdır; idempotentlik ve geçmişi yeniden işleme buna dayanır.</p>'
  '<p><b>catchup:</b> <code>start_date</code> geçmişteyse ve <code>catchup=True</code> ise Airflow aradaki tüm kaçırılmış aralıklar için çalıştırma oluşturur. Bilinçli bir backfill değilse genellikle <code>False</code> yapılır; yoksa yeni bir DAG yüzlerce çalıştırmayı birden başlatabilir.</p>'
  '<p><b>Diğer önemli ayarlar:</b> <code>retries</code> ve <code>retry_delay</code>, <code>max_active_runs</code>, görev zaman aşımı, SLA ve hata bildirimleri.</p>',
  ['XCom nedir ve neden büyük veri taşımak için kullanılmamalı?', 'Sensör (sensor) operatörlerinin riskleri nelerdir?', 'Dinamik görev eşleme (dynamic task mapping) ne işe yarar?'],
  ['Günlük çalıştırmanın o günün başında başladığını sanmak', 'Görev içinde datetime.now() kullanmayı doğal görmek'],
  'Veri aralığı mantığını doğru anlatabilmek Airflow deneyiminin en net göstergesidir; bir tarih örneğiyle açıkla.'),

I(['muhendis', 'otomasyon'], 'temel', 'kod-okuma', 'Bağımlılık sırası',
  'Bir veri boru hattının görev bağımlılıkları Python\'un <code>graphlib</code> modülüyle çözülüyor. Hangi adımda hangi görevler birlikte çalışabilir?',
  '<p><b>Sözlük yapısı:</b> Her anahtar bir görev, değer ise <b>önce bitmesi gereken</b> görevler kümesi. <code>temizle</code>, iki çekme görevine; <code>birlestir</code>, <code>temizle</code>\'ye; <code>rapor</code> ve <code>kalite_kontrol</code> ise <code>birlestir</code>\'e bağlı.</p>'
  '<p><b>Akış:</b> <code>get_ready()</code> bağımlılıkları tamamlanmış görevleri döndürür; <code>done()</code> ile bitti diye işaretlenince sonrakiler serbest kalır.</p><ul>'
  '<li>1. adım: <code>cek_siparis</code> ve <code>cek_urun</code>. Hiçbir bağımlılıkları yok; <b>paralel</b> çalışabilirler.</li>'
  '<li>2. adım: <code>temizle</code>.</li><li>3. adım: <code>birlestir</code>.</li>'
  '<li>4. adım: <code>kalite_kontrol</code> ve <code>rapor</code> yine paralel.</li></ul>'
  '<p><code>sorted</code> yalnız çıktıyı deterministik yapmak için; kümelerin sırası garanti değildir.</p>'
  '<p><b>Bağlantı:</b> Airflow\'un zamanlayıcısı da aynı mantığı uygular: topolojik sıralama ve hazır görevlerin paralel yürütülmesi. Döngü olsaydı (<code>temizle</code> → <code>birlestir</code> → <code>temizle</code>) <code>prepare()</code> <code>CycleError</code> fırlatırdı; DAG\'ın "döngüsüz" olması bu yüzden şarttır.</p>'
  '<p><b>Tasarım notu:</b> Gerçek bir hatta <code>rapor</code>\'un <code>kalite_kontrol</code>\'e bağlı olması daha doğru olurdu; kalite kontrolden geçmemiş veriyle rapor üretilmemeli.</p>',
  ['Döngüsel bağımlılığı nasıl tespit edersin?', 'Paralel çalışan görev sayısını sınırlamak neden gerekebilir?'],
  ['Görevlerin sözlükteki yazılış sırasıyla çalıştığını sanmak', 'Paralel çalışabilecek görevleri ayırt edememek'],
  'Kod okuma cevabını tasarım eleştirisiyle bitirmek (rapor kalite kontrole bağlı olmalı) seni bir adım öne taşır.',
  code='''
from graphlib import TopologicalSorter
dag = {
    'temizle': {'cek_siparis', 'cek_urun'},
    'birlestir': {'temizle'},
    'rapor': {'birlestir'},
    'kalite_kontrol': {'birlestir'},
}
ts = TopologicalSorter(dag)
ts.prepare()
adim = 1
while ts.is_active():
    hazir = sorted(ts.get_ready())
    print(adim, hazir)
    ts.done(*hazir)
    adim += 1
'''),

I(['muhendis', 'analist'], 'temel', 'kavram', 'Veri kalitesi',
  'Veri kalitesinin boyutları nelerdir? Bir boru hattına hangi otomatik kalite kontrollerini eklersin?',
  '<p><b>Boyutlar:</b></p><ul>'
  '<li><b>Doğruluk:</b> Değer gerçeği yansıtıyor mu? (Sipariş tutarı ödeme sistemindekiyle aynı mı?)</li>'
  '<li><b>Bütünlük (completeness):</b> Zorunlu alanlar dolu mu, beklenen tüm kayıtlar geldi mi?</li>'
  '<li><b>Tutarlılık:</b> Sistemler ve tablolar arasında çelişki yok mu? (Siparişteki <code>musteri_id</code> müşteri tablosunda var mı?)</li>'
  '<li><b>Geçerlilik:</b> Değer izin verilen biçim ve aralıkta mı? (Tutar &gt; 0, e-posta biçimi, il kodu 1–81.)</li>'
  '<li><b>Benzersizlik:</b> Birincil anahtar tekrar ediyor mu?</li>'
  '<li><b>Güncellik (timeliness/freshness):</b> Veri zamanında geldi mi?</li></ul>'
  '<p><b>Otomatik kontroller:</b></p><ul>'
  '<li><b>Şema:</b> Beklenen sütunlar ve tipler.</li>'
  '<li><b>Hacim:</b> Satır sayısı son 4 haftanın aynı gününe göre ±%30 içinde mi?</li>'
  '<li><b>Benzersizlik ve null:</b> <code>unique</code>, <code>not_null</code> testleri (dbt\'de tek satırla).</li>'
  '<li><b>İlişki:</b> Yabancı anahtarlar referans tabloda var mı?</li>'
  '<li><b>Dağılım:</b> Ortalama tutar ya da kategori payları ani değişti mi?</li>'
  '<li><b>Mutabakat:</b> Günlük ciro toplamı kaynak sistemle eşleşiyor mu?</li></ul>'
  '<p><b>Önem derecesi:</b> Kritik kontrol başarısız olursa hat durur (bozuk veri yayılmaz); uyarı düzeyindekiler bildirim gönderir. Araçlar: dbt testleri, Great Expectations, Soda ya da sade pandas/SQL kontrolleri.</p>',
  ['Hangi kontrolün hattı durdurması, hangisinin yalnız uyarması gerektiğine nasıl karar verirsin?', 'Veri kalitesi sorunlarının sahipliği kimde olmalı?'],
  ['Yalnız null kontrolünü veri kalitesi saymak', 'Tüm kontrolleri eşit önemde görmek ve uyarı yorgunluğu yaratmak'],
  'Boyutları sayarken her birine Anadolu Market\'ten bir örnek eklemek, ezber izlenimini kırar.'),

I(['muhendis', 'analist'], 'temel', 'kod-okuma', 'Veri kalitesi kontrolleri',
  'Sipariş tablosuna dört kalite kontrolü uygulanıyor. Hangi kontroller başarısız olur, listeyi tahmin et.',
  '<p>Kontrolleri tek tek değerlendirelim:</p><ul>'
  '<li><b>id_benzersiz:</b> <code>siparis_id</code> değerlerinde 2 iki kez geçiyor → <code>is_unique</code> False → <b>başarısız</b>.</li>'
  '<li><b>tutar_dolu:</b> Tüm tutarlar dolu → <b>geçer</b>.</li>'
  '<li><b>tutar_pozitif:</b> −20 var → <b>başarısız</b>.</li>'
  '<li><b>sehir_gecerli:</b> \'izmir\' küçük harfle yazılmış ve izin verilen listede yok → <b>başarısız</b>.</li></ul>'
  '<p>Liste kurgusu kontrollerin sözlükteki sırasını korur: <code>[\'id_benzersiz\', \'tutar_pozitif\', \'sehir_gecerli\']</code>.</p>'
  '<p><b>Değerlendirme:</b> Basit ama etkili bir kalıp: kontroller ad → sonuç sözlüğünde tutulur, başarısızlar raporlanır. Gerçek bir hatta şu iyileştirmeler gerekir:</p><ul>'
  '<li>Kaç satırın ve hangi örneklerin başarısız olduğunu da raporla (yalnız ad yetmez).</li>'
  '<li>Kontrollere önem derecesi ver: yinelenen kimlik kritik (hat durur), şehir yazım hatası uyarı.</li>'
  '<li>Şehir için önce normalleştirme (Türkçe kurallarına uygun büyük harf dönüşümü) yapılabilir; "izmir" bir veri hatası değil, temizlenebilir bir biçim farkıdır.</li>'
  '<li><code>bool</code> değerler NumPy tipinde gelebilir; sonuçları loglarken <code>bool(...)</code> ile dönüştür.</li></ul>',
  ['Bu kontrolleri dbt testleri olarak nasıl yazarsın?', 'Başarısız satırları karantina tablosuna ayırmanın avantajı nedir?'],
  ['Küçük harfli şehir adının kontrolü geçeceğini sanmak', 'Kontrol sonucunda yalnız ad raporlamayı yeterli görmek'],
  'Her kontrolü sesli değerlendirip sonra listeyi kur; acele edip birini atlamak en sık hatadır.',
  code='''
import pandas as pd
df = pd.DataFrame({
    'siparis_id': [1, 2, 2, 4],
    'tutar': [150.0, -20.0, 80.0, 95.0],
    'sehir': ['İzmir', 'Ankara', 'Ankara', 'izmir'],
})
kontroller = {
    'id_benzersiz': df['siparis_id'].is_unique,
    'tutar_dolu': df['tutar'].notna().all(),
    'tutar_pozitif': (df['tutar'] > 0).all(),
    'sehir_gecerli': df['sehir'].isin(['İzmir', 'Ankara', 'Bursa']).all(),
}
print([ad for ad, ok in kontroller.items() if not ok])
'''),

I(['muhendis', 'analist'], 'orta', 'kavram', 'Yavaş değişen boyutlar',
  'Yavaş değişen boyut (SCD) Tip 1, Tip 2 ve Tip 3 nedir? Hangisini ne zaman kullanırsın?',
  '<p>Boyut tablolarındaki nitelikler (müşterinin şehri, ürünün kategorisi) zamanla değişir. Soru: geçmiş olgular (satışlar) <b>hangi değerle</b> raporlanacak?</p>'
  '<ul><li><b>Tip 1, üzerine yaz:</b> Eski değer silinir, yenisi yazılır. Geçmiş kaybolur; geçmiş satışlar da yeni değerle görünür. Yazım hatası düzeltmesi ya da tarihçesinin önemi olmayan nitelikler için uygundur.</li>'
  '<li><b>Tip 2, yeni satır ekle:</b> Eski satır kapatılır (<code>bitis</code> tarihi doldurulur, <code>guncel = False</code>), yeni değerle yeni bir satır açılır. Her sürümün kendi vekil anahtarı (surrogate key) olur; olgu tablosu satışın gerçekleştiği andaki sürüme bağlanır. Böylece "müşteri İzmir\'de yaşarken yaptığı alışverişler" doğru raporlanır. Tam tarihçe gerektiren analizlerde (bölge satış performansı, prim hesapları) standarttır.</li>'
  '<li><b>Tip 3, önceki değer sütunu:</b> <code>sehir</code> ve <code>onceki_sehir</code> gibi sütunlar. Yalnız bir önceki değeri tutar; "yeniden yapılandırma öncesi ve sonrası bölge" karşılaştırması gibi sınırlı durumlar için.</li></ul>'
  '<p><b>Seçim, iş sorusuna bağlıdır:</b> "Satışlar o zamanki bölgeye mi, bugünkü bölgeye mi yazılsın?" İkisi de gerekebilir; Tip 2 tablosundan güncel değeri de almak mümkündür. Tip 2 tablo büyümesine ve sorgu karmaşıklığına yol açar; her nitelik için değil, tarihçesi gerçekten önemli olanlar için kullanılır.</p>',
  ['Tip 2 tabloya zamanda doğru join nasıl yapılır?', 'Tip 6 (karma) nedir?'],
  ['Tüm boyutlarda varsayılan olarak Tip 2 kullanmak', 'Tip 2\'de vekil anahtarın neden gerektiğini açıklayamamak'],
  'Her tipi tek bir iş sorusuyla ilişkilendir; "hangi şehirde yaşarken aldı?" sorusu Tip 2\'yi kendiliğinden açıklar.'),

I(['muhendis'], 'ileri', 'kod-okuma', 'SCD Tip 2 uygulaması',
  'pandas ile basit bir SCD Tip 2 güncellemesi yapılıyor. Son tabloyu yorumla; bu uygulamanın eksikleri neler?',
  '<p><b>Adımlar:</b></p><ol>'
  '<li>Güncel satırlar gelen veriyle birleştirilir; şehri değişen müşteriler bulunur. Müşteri 1 İzmir → Bursa; müşteri 2 aynı kalmış.</li>'
  '<li>Müşteri 1\'in güncel satırı kapatılır: <code>bitis = 2024-06-01</code>, <code>guncel = False</code>.</li>'
  '<li>Müşteri 1 için Bursa satırı, <code>baslangic = 2024-06-01</code> ve açık uçlu <code>9999-12-31</code> bitişle eklenir.</li></ol>'
  '<p><b>Sonuç:</b> 3 satır. Müşteri 1\'in iki sürümü var; müşteri 2 dokunulmadan kalıyor. 2024-03 tarihli bir satış İzmir sürümüne, 2024-07 tarihli satış Bursa sürümüne bağlanır.</p>'
  '<p><b>Eksikler (üretimde mutlaka eklenmeli):</b></p><ul>'
  '<li><b>Vekil anahtar yok:</b> Olgu tablosu sürümü <code>musteri_id</code> ile ayırt edemez; her sürüme benzersiz bir <code>musteri_sk</code> gerekir.</li>'
  '<li><b>Yeni müşteriler</b> (gelen veride olup boyutta olmayanlar) eklenmiyor; merge yalnız mevcutları ele alıyor.</li>'
  '<li><b>İdempotentlik:</b> Aynı gün iki kez çalışırsa ikinci seferde değişiklik görmez, sorun yok; ama farklı tarihlerle geriye dönük çalışma tarih çakışması üretebilir.</li>'
  '<li><b>Çok sütunlu değişim:</b> Birden fazla izlenen nitelik varsa satır hash\'i karşılaştırmak daha pratiktir.</li></ul>'
  '<p>Ambarlarda aynı iş tek bir <code>MERGE</code> ifadesi ya da dbt\'nin <code>snapshot</code> özelliğiyle yapılır.</p>',
  ['dbt snapshot SCD2\'yi nasıl uygular?', 'bitis tarihi için NULL mu 9999-12-31 mi kullanırsın?'],
  ['Müşteri 2 için de yeni satır açıldığını sanmak', 'Vekil anahtar eksikliğini fark etmemek'],
  'Kodun ne yaptığını anlattıktan sonra eksiklerini sıralamak, üretim tecrübesini gösterir.',
  code='''
import pandas as pd
boyut = pd.DataFrame({
    'musteri_id': [1, 2], 'sehir': ['İzmir', 'Ankara'],
    'baslangic': ['2024-01-01', '2024-01-01'],
    'bitis': ['9999-12-31', '9999-12-31'], 'guncel': [True, True],
})
gelen = pd.DataFrame({'musteri_id': [1, 2], 'sehir': ['Bursa', 'Ankara']})
tarih = '2024-06-01'
m = boyut[boyut['guncel']].merge(gelen, on='musteri_id', suffixes=('', '_yeni'))
degisen = m.loc[m['sehir'] != m['sehir_yeni'], 'musteri_id']
kapat = boyut['musteri_id'].isin(degisen) & boyut['guncel']
boyut.loc[kapat, 'bitis'] = tarih
boyut.loc[kapat, 'guncel'] = False
yeni = gelen[gelen['musteri_id'].isin(degisen)].assign(baslangic=tarih, bitis='9999-12-31', guncel=True)
boyut = pd.concat([boyut, yeni], ignore_index=True)
print(boyut.to_string(index=False))
'''),

I(['muhendis'], 'ileri', 'vaka', 'Vaka: yarıda kalan ETL',
  'Gece çalışan Anadolu Market satış ETL\'i 03:10\'da yükleme adımının ortasında çöktü. Sabah 08:00\'de yönetim panosu açılacak. Ne yaparsın?',
  '<p><b>1) Etkiyi sınırla (ilk 10 dakika):</b> Hangi tablolar kısmen yazıldı? Pano yarım veriyle açılırsa "dünkü ciro %40 düştü" alarmı ve yanlış kararlar oluşur. Gerekirse panoya "veri güncelleniyor, son tam veri: önceki gün" uyarısı koy ya da bağımlı işleri durdur. Paydaşlara kısa bir bilgi notu gönder.</p>'
  '<p><b>2) Nedeni bul:</b> Loglar: bellek yetersizliği, kaynak veritabanı bağlantı zaman aşımı, şema değişikliği, disk doluluğu? Geçici bir hata mı, yoksa yeniden denemede de tekrarlayacak bir hata mı?</p>'
  '<p><b>3) Güvenli yeniden çalıştırma:</b> İş idempotent tasarlandıysa (gün bölümü silinip yeniden yazılıyor ya da geçici tabloya yazılıp atomik olarak değiştiriliyor) dünün aralığı için yeniden çalıştırmak yeterlidir. Değilse önce yarım yazılan satırları <code>yukleme_id</code> ya da tarih bölümüyle temizle, sonra çalıştır.</p>'
  '<p><b>4) Doğrula:</b> Satır sayısı ve ciro toplamını kaynak sistemle ve geçen haftanın aynı günüyle karşılaştır; ardından bağımlı işleri ve panoyu yenile.</p>'
  '<p><b>5) Kalıcı düzeltme (olay sonrası):</b> Suçlamasız bir değerlendirme: kök neden, neden geç fark edildi? Önlemler: atomik yazma, otomatik yeniden deneme, hata anında nöbetçiye bildirim, veri tazeliği kontrolü olmadan panonun yenilenmemesi.</p>',
  ['Olay sonrası değerlendirme (postmortem) belgesinde neler olur?', 'Yarım yüklemeyi önleyen yazma desenleri nelerdir?'],
  ['Kontrol etmeden işi hemen yeniden başlatıp yinelenen kayıt üretmek', 'Paydaşlara bilgi vermeyi atlamak'],
  'Olay vakalarında sıra önemlidir: önce etkiyi sınırla ve iletişim kur, sonra düzelt, en son kalıcı önlem.'),

I(['muhendis', 'analist'], 'orta', 'tasarim', 'Yıldız şema tasarımı',
  'Anadolu Market\'in satış analitiği için bir veri ambarı modeli tasarla. Olgu ve boyut tablolarını, tanecikliği (grain) ve anahtarları belirt.',
  '<p><b>1) İş süreci ve taneciklik:</b> Süreç: sipariş satışları. Taneciklik (her olgu satırı neyi temsil eder?): <b>bir siparişteki bir ürün satırı</b>. En ince taneciklik seçilir ki her türlü toplama yapılabilsin.</p>'
  '<p><b>2) Olgu tablosu <code>f_satis</code>:</b> Boyut anahtarları (<code>tarih_sk</code>, <code>musteri_sk</code>, <code>urun_sk</code>, <code>magaza_sk</code>, <code>kampanya_sk</code>), bozulmuş boyut olarak <code>siparis_no</code> ve ölçüler: <code>adet</code>, <code>birim_fiyat</code>, <code>indirim_tutari</code>, <code>net_tutar</code>, <code>maliyet</code>. Ölçüler toplanabilir olmalıdır; oranlar (kâr marjı) olguda değil, hesaplamada üretilir.</p>'
  '<p><b>3) Boyut tabloları:</b></p><ul>'
  '<li><code>d_tarih</code>: gün, hafta (pazartesi başlangıçlı), ay, çeyrek, resmî tatil, bayram, iş günü bayrakları.</li>'
  '<li><code>d_musteri</code>: şehir, segment, kayıt kanalı; şehir için SCD Tip 2.</li>'
  '<li><code>d_urun</code>: kategori hiyerarşisi (ana kategori → alt kategori → marka) düzleştirilmiş hâlde.</li>'
  '<li><code>d_magaza</code> / kanal ve <code>d_kampanya</code>.</li></ul>'
  '<p><b>4) Anahtarlar:</b> Boyutlarda vekil anahtar (tamsayı) + kaynak sistemin doğal anahtarı. Bilinmeyen değerler için "−1 Bilinmiyor" satırı; olguda NULL anahtar bırakılmaz.</p>'
  '<p><b>5) Ek olgular:</b> İadeler ayrı bir olgu tablosu; günlük stok için periyodik anlık görüntü (snapshot) olgu tablosu. Ortak boyutlar (d_tarih, d_urun) tüm olgularda paylaşılır.</p>'
  '<p><b>6) Fiziksel:</b> <code>f_satis</code> tarihe göre bölümlenir, ürün ve mağazaya göre kümelenir.</p>',
  ['Sipariş düzeyi kargo ücretini satır taneciklikli olguya nasıl dağıtırsın?', 'Stok gibi toplanamayan (yarı toplanabilir) ölçüler nasıl ele alınır?'],
  ['Taneciklik tanımlamadan tablo çizmeye başlamak', 'Oran gibi toplanamaz ölçüleri olgu tablosunda saklamak'],
  'Boyutsal modelleme sorusunda ilk cümlen taneciklik olmalı; Kimball yaklaşımını bildiğini en hızlı bu gösterir.'),
]
