from d01 import I

ITEMS = [
I(['muhendis', 'analist'], 'temel', 'kavram', 'Yıldız ve kar tanesi şema',
  'Yıldız şema ile kar tanesi şema arasındaki fark nedir? Olgu ve boyut tablosu kavramlarını da açıkla.',
  '<p><b>Olgu (fact) tablosu:</b> Ölçülebilir iş olaylarını tutar: satış satırları, ödemeler, uçuş kalkışları. Sayısal ölçüler (tutar, adet, süre) ve boyutlara giden anahtarlar içerir. Genellikle çok uzundur (milyonlarca satır), dardır.</p>'
  '<p><b>Boyut (dimension) tablosu:</b> Olayların bağlamını tanımlar: kim, ne, nerede, ne zaman. Müşteri, ürün, mağaza, tarih. Kısa ama geniştir (çok sayıda açıklayıcı sütun).</p>'
  '<p><b>Yıldız şema:</b> Olgu tablosu merkezde, her boyut ona <b>tek bir join</b> ile bağlı. Boyutlar <b>normalize edilmemiştir</b>: ürün tablosu kategori ve marka adlarını doğrudan içerir. Sorgular basit, join sayısı az, BI araçları ve analistler için anlaşılır.</p>'
  '<p><b>Kar tanesi şema:</b> Boyutlar normalize edilir: <code>urun → alt_kategori → kategori</code> ayrı tablolardır. Tekrar eden veri azalır, güncelleme tek yerden yapılır; ama sorgular daha fazla join gerektirir ve okunması zorlaşır.</p>'
  '<p><b>Hangisi?</b> Analitik ambarlarda genellikle <b>yıldız şema</b> tercih edilir. Kolon tabanlı ve sıkıştırmalı depolamada tekrar eden kategori adlarının maliyeti çok düşüktür; buna karşılık sorgu sadeliği ve performans önemlidir. Kar tanesi, çok büyük ve sık değişen hiyerarşilerde ya da kaynak sistemin yapısını korumak gerektiğinde mantıklı olabilir. PBIPatika\'daki <code>kesit_bi</code> veri seti bu yapının küçük bir örneğidir: <code>Satislar</code> olgusu ve <code>Urunler</code>, <code>Musteriler</code>, <code>Tarih</code> boyutları.</p>',
  ['Power BI gibi araçlar neden yıldız şemayı sever?', 'Bir olgu tablosunu doğrudan başka bir olguya bağlamak neden sorunludur?'],
  ['Olgu ve boyut tablolarını ters tanımlamak', 'Kar tanesi şemanın her zaman daha "doğru" olduğunu söylemek'],
  'Somut bir örnek tablo seti (Satislar + Urunler + Tarih) üzerinden anlatmak, soyut tanımdan çok daha etkilidir.'),

I(['muhendis'], 'ileri', 'kavram', 'Değişiklik verisi yakalama (CDC)',
  'Change Data Capture (CDC) nedir? Sorgu tabanlı ve log tabanlı CDC arasındaki farklar nelerdir?',
  '<p><b>CDC:</b> Kaynak veritabanındaki ekleme, güncelleme ve silme işlemlerini yakalayıp hedef sisteme (ambar, göl, akış platformu) aktarma tekniği. Her gece tüm tabloyu kopyalamak yerine yalnız değişenler taşınır.</p>'
  '<p><b>Sorgu tabanlı CDC:</b> Belirli aralıklarla <code>SELECT * FROM siparis WHERE guncellenme_zamani &gt; :son_okuma</code> çalıştırılır.</p><ul>'
  '<li>Artısı: Basit, ek altyapı gerektirmez.</li>'
  '<li>Eksileri: <b>Silmeleri yakalayamaz</b> (silinen satır sorguda yoktur); <code>guncellenme_zamani</code> sütunu her güncellemede doğru doldurulmalıdır; iki okuma arasındaki ara durumlar kaybolur; büyük tablolarda kaynak veritabanına yük bindirir.</li></ul>'
  '<p><b>Log tabanlı CDC:</b> Veritabanının işlem günlüğü (PostgreSQL WAL, MySQL binlog) okunur; her değişiklik olay olarak yayınlanır. Debezium + Kafka tipik bir örnektir.</p><ul>'
  '<li>Artıları: Silmeler dahil tüm değişiklikler, sıralı ve neredeyse gerçek zamanlı; kaynak tablolara sorgu yükü yok; her değişikliğin önceki ve sonraki hâli.</li>'
  '<li>Eksileri: Kurulum ve işletim karmaşıklığı, veritabanı yetkileri, günlük saklama süresi ayarı; şema değişikliklerinin yönetimi.</li></ul>'
  '<p><b>Hedefte uygulama:</b> Olaylar sıralı (log sıra numarası, LSN) ve idempotent biçimde uygulanır; yinelenen ya da sırası karışmış olaylara dayanıklı olunmalıdır. İlk kurulumda tablonun tam anlık görüntüsü alınır, ardından değişiklik akışına geçilir.</p>',
  ['Silmeleri sorgu tabanlı yaklaşımda nasıl yakalarsın (soft delete)?', 'CDC akışında şema değişikliği gelirse ne olur?'],
  ['Sorgu tabanlı CDC\'nin silmeleri yakaladığını sanmak', 'Olay sırası ve yinelenen olay sorunlarını hiç anmamak'],
  'İki yaklaşımı "silmeler" ve "kaynak yükü" ekseninde karşılaştır; görüşmecinin aradığı fark bunlardır.'),

I(['muhendis', 'ml'], 'ileri', 'kavram', 'Akış ve toplu işleme',
  'Akış (streaming) ve toplu (batch) işleme arasındaki farklar nelerdir? Olay zamanı, işlem zamanı ve watermark kavramlarını açıkla.',
  '<p><b>Toplu işleme:</b> Sınırlı bir veri kümesi (dünün siparişleri) belirli aralıklarla işlenir. Basit, ucuz, hata durumunda yeniden çalıştırması kolay; gecikme dakikalar–saatler.</p>'
  '<p><b>Akış işleme:</b> Sınırsız bir olay akışı geldikçe işlenir (Kafka + Flink / Spark Structured Streaming). Gecikme saniyeler; ama durum yönetimi, hata toleransı ve işletim çok daha karmaşık.</p>'
  '<p><b>Olay zamanı ve işlem zamanı:</b> Olay zamanı, olayın gerçekte olduğu an (kurye "teslim ettim" butonuna bastı: 19:58). İşlem zamanı, sistemin olayı gördüğü an (telefon tünelden çıkıp veriyi gönderdi: 20:03). Doğru analiz için pencereler <b>olay zamanına</b> göre kurulur; yoksa 19:00–20:00 penceresinin teslimatları eksik sayılır.</p>'
  '<p><b>Watermark:</b> Sistemin "olay zamanı X\'ten önceki olayların büyük olasılıkla geldiğini" varsaydığı sınır. Örneğin 10 dakikalık gecikme toleransı: 20:10 olay zamanlı bir olay görülünce 20:00 penceresi kapatılır ve sonucu yayınlanır. Bundan sonra gelen geç olaylar ya atılır ya da ayrı bir düzeltme akışına gider. Watermark, <b>gecikme ile doğruluk</b> arasındaki dengedir.</p>'
  '<p><b>Seçim:</b> Kararın saniyeler içinde verilmesi gerekiyorsa (dolandırıcılık, canlı operasyon panosu) akış; aksi hâlde toplu ya da mikro-toplu (her 5 dakikada bir) genellikle yeterli ve çok daha ucuzdur.</p>',
  ['Kayan (sliding), sabit (tumbling) ve oturum (session) pencereleri arasındaki fark nedir?', 'Lambda ve Kappa mimarileri nedir?'],
  ['Pencereleri işlem zamanına göre kurmanın sorun yaratmayacağını düşünmek', 'Her ihtiyaca akış işleme önermek'],
  'Kurye teslimatı gibi somut bir geç gelen olay örneği, watermark kavramını tek cümlede anlaşılır kılar.'),

I(['muhendis'], 'ileri', 'kod-okuma', 'CDC olaylarını uygulama',
  'Sırası karışmış ve yinelenen CDC olayları bir hedef sözlüğe uygulanıyor. Doğru yöntem ne sonuç verir, olaylar geliş sırasıyla körü körüne uygulansaydı ne olurdu?',
  '<p><b>Kodun mantığı:</b> Olaylar önce log sıra numarasına (<code>lsn</code>) göre sıralanır. Her kayıt için en son uygulanan LSN tutulur; aynı ya da daha eski LSN\'li olay tekrar ya da bayat kabul edilip atlanır. <code>c</code>/<code>u</code> değeri yazar, <code>d</code> kaydı siler.</p>'
  '<p><b>Sıralı uygulama:</b> LSN 1: 7 → 500; LSN 2: 8 → 300; ikinci LSN 2 olayı yinelenen, atlanır; LSN 3: 7 → 900; LSN 4: 8 silinir. Sonuç <b><code>{7: 900}</code></b>.</p>'
  '<p><b>Körü körüne uygulama</b> (ikinci satır): Olaylar geldiği sırayla işlenir: önce 7 → 900, sonra eski oluşturma olayı 7 → 500 ile üzerine yazar; 8 için silme olayı kayıt henüz yokken gelir ve etkisiz kalır, ardından oluşturma olayı 8\'i geri getirir. Sonuç <b><code>{7: 500, 8: 300}</code></b>: hem yanlış bakiye hem de silinmiş olması gereken bir hesap. Hata mesajı yok.</p>'
  '<p><b>Gerçek sistemlerde:</b> Kafka bir bölüm içinde sırayı korur; bu yüzden olaylar <b>birincil anahtara göre</b> bölümlenir. Yine de yeniden denemeler yinelenen olay üretir; hedefte LSN ya da sürüm sütunuyla koşullu güncelleme (<code>WHERE hedef.lsn &lt; olay.lsn</code>) yapılır. Silmeler için hemen silmek yerine "mezar taşı" (tombstone) kaydı tutmak, geç gelen eski olayların kaydı diriltmesini engeller.</p>',
  ['Mezar taşı (tombstone) kayıtları ne zaman temizlenir?', 'Olayları neden birincil anahtara göre bölümlersin?'],
  ['Olayları geliş sırasıyla uygulamanın güvenli olduğunu sanmak', 'Silinen kaydın eski bir olayla geri dirilebileceğini görmemek'],
  'İki sonucu yan yana karşılaştırmak, sıralama ve tekilleştirmenin neden şart olduğunu kendiliğinden kanıtlar.',
  code='''
olaylar = [
    {'lsn': 3, 'op': 'u', 'id': 7, 'bakiye': 900},
    {'lsn': 1, 'op': 'c', 'id': 7, 'bakiye': 500},
    {'lsn': 4, 'op': 'd', 'id': 8},
    {'lsn': 2, 'op': 'c', 'id': 8, 'bakiye': 300},
    {'lsn': 2, 'op': 'c', 'id': 8, 'bakiye': 300},
]
hedef, son_lsn = {}, {}
for o in sorted(olaylar, key=lambda o: o['lsn']):
    if son_lsn.get(o['id'], 0) >= o['lsn']:
        continue   # yinelenen ya da bayat olay
    son_lsn[o['id']] = o['lsn']
    if o['op'] == 'd':
        hedef.pop(o['id'], None)
    else:
        hedef[o['id']] = o['bakiye']
print(hedef)
saf = {}
for o in olaylar:
    if o['op'] == 'd':
        saf.pop(o['id'], None)
    else:
        saf[o['id']] = o['bakiye']
print(saf)
'''),

I(['muhendis', 'ml'], 'ileri', 'kavram', 'Teslim garantileri',
  'Mesajlaşma ve akış sistemlerinde "en fazla bir kez", "en az bir kez" ve "tam bir kez" teslim ne anlama gelir? Pratikte tam bir kez nasıl sağlanır?',
  '<p><b>En fazla bir kez (at-most-once):</b> Mesaj ya bir kez işlenir ya hiç işlenmez. Tüketici mesajı okur okumaz "aldım" der; işlerken çökerse mesaj kaybolur. Kaybın kabul edilebilir olduğu metrik örneklemesi gibi durumlar için.</p>'
  '<p><b>En az bir kez (at-least-once):</b> Mesaj kaybolmaz ama birden çok kez işlenebilir. Tüketici işi bitirdikten sonra onay verir; onaydan önce çökerse mesaj yeniden gelir. Çoğu sistemin varsayılanıdır.</p>'
  '<p><b>Tam bir kez (exactly-once):</b> Her mesajın etkisi tam olarak bir kez yansır. Ağ ve makine arızaları olan dağıtık bir sistemde "mesajın fiziksel olarak tek kez teslimi" garanti edilemez; pratikte kastedilen <b>etkinin tek kez</b> olmasıdır.</p>'
  '<p><b>Nasıl sağlanır:</b></p><ul>'
  '<li><b>En az bir kez + idempotent hedef:</b> En yaygın ve sağlam yöntem. Her olayın benzersiz bir kimliği vardır; hedef upsert yapar ya da işlenmiş kimlikleri tutar ve tekrarı atlar.</li>'
  '<li><b>İşlemsel yazma:</b> Çıktı ve okuma konumu (offset) aynı işlem içinde yazılır. Kafka işlemleri, Flink\'in iki aşamalı onay (two-phase commit) yapan çıktıları bu yaklaşımı kullanır.</li></ul>'
  '<p><b>Dikkat:</b> Tam bir kez garantisi uçtan uca geçerli olmalıdır. Akış motoru içinde tam bir kez olsa bile, bir adım dış bir sisteme (ödeme API\'si, e-posta) yan etki üretiyorsa orada da idempotentlik anahtarı gerekir.</p>',
  ['Kafka\'da tüketici offset\'i ne zaman onaylanmalı?', 'İşlenmiş kimlikleri sonsuza kadar saklamak gerekir mi?'],
  ['Tam bir kez teslimin ağ seviyesinde garanti edilebildiğini söylemek', 'Dış sistemlere yapılan yan etkileri unutmak'],
  '"Pratikte tam bir kez = en az bir kez + idempotentlik" formülünü söylemek, olgun bir cevabın özüdür.'),

I(['muhendis'], 'ileri', 'vaka', 'Vaka: gecikmeli akış panosu',
  'Pedal İzmir\'in gerçek zamanlı istasyon doluluk panosu, sahadaki ekiplere göre 10–15 dakika geriden geliyor ve bazı istasyonlarda negatif bisiklet sayısı gösteriyor. Nasıl araştırırsın?',
  '<p><b>1) Gecikmeyi ölç ve konumlandır:</b> Her aşamada zaman damgası karşılaştır: istasyon cihazının olay zamanı → mesaj kuyruğuna yazılma → akış işleyicisinin tüketmesi → panonun veritabanına yazılma → panonun okuması. Gecikme hangi aşamada birikiyor?</p>'
  '<p><b>2) Olası nedenler:</b></p><ul>'
  '<li><b>Tüketici gecikmesi (consumer lag):</b> İşleyici gelen olay hızına yetişemiyor; kuyrukta biriken mesaj sayısı artıyor. Çözüm: bölüm sayısı ve tüketici paralelliği, işleyicideki yavaş dış çağrıları kaldırmak.</li>'
  '<li><b>Cihaz tarafı:</b> İstasyonlar zayıf bağlantıda olayları toplu gönderiyor; olay zamanı ile işlem zamanı arasında doğal gecikme var.</li>'
  '<li><b>Pano yenileme aralığı</b> ya da önbellek süresi gereğinden uzun.</li></ul>'
  '<p><b>3) Negatif sayılar:</b> Doluluk muhtemelen "çıkış −1, giriş +1" olaylarının toplamıyla hesaplanıyor. Olaylar sırası karışık geldiğinde, yinelendiğinde ya da bazıları kaybolduğunda sayaç kayar. Çözüm: istasyonun gönderdiği <b>mutlak doluluk</b> değerini periyodik olarak kaynak gerçek kabul edip sayacı onunla düzeltmek; olay kimliğiyle tekilleştirmek; olay zamanına göre sıralı işlem.</p>'
  '<p><b>4) Doğrula ve izle:</b> Uçtan uca gecikme ve tüketici gecikmesi için metrik ve alarm; "son güncelleme" zamanı panoda görünür olsun. Negatif değerler için veri kalitesi kontrolü.</p>',
  ['Delta olayları ile anlık görüntü (snapshot) olayları arasındaki tasarım farkı nedir?', 'Tüketici gecikmesini hangi metrikle izlersin?'],
  ['Gecikmenin nerede oluştuğunu ölçmeden altyapıyı büyütmek', 'Negatif sayıyı arayüzde sıfıra yuvarlayıp geçmek'],
  'Akış vakalarında her aşamaya zaman damgası koyup gecikmeyi "nerede?" sorusuyla parçala.'),

I(['muhendis', 'analist'], 'temel', 'kavram', 'OLTP ve OLAP',
  'OLTP ve OLAP sistemleri arasındaki fark nedir? Analitik sorguları neden doğrudan üretim veritabanında çalıştırmamalıyız?',
  '<p><b>OLTP (çevrim içi işlem işleme):</b> Uygulamanın günlük işlemlerini yürütür: sipariş oluşturma, bakiye güncelleme, rezervasyon. Çok sayıda küçük, kısa okuma/yazma işlemi; tek satıra hızlı erişim; normalize şema; tutarlılık ve eşzamanlılık kritik. Örnek: PostgreSQL, MySQL üzerinde çalışan Anadolu Bank çekirdek bankacılık sistemi.</p>'
  '<p><b>OLAP (çevrim içi analitik işleme):</b> Büyük veri hacimleri üzerinde toplama ve analiz: "son 3 yılda şube ve ürün bazında aylık mevduat büyümesi". Az sayıda ama ağır, çoğunlukla okuma sorgusu; milyonlarca satır taranır; kolon tabanlı depolama, yıldız şema. Örnek: BigQuery, Snowflake, ClickHouse.</p>'
  '<p><b>Neden üretim veritabanında analitik çalıştırılmamalı:</b></p><ul>'
  '<li>Ağır bir tarama sorgusu CPU, bellek ve disk kaynaklarını tüketir; müşterinin para transferi yavaşlar ya da zaman aşımına uğrar.</li>'
  '<li>Uzun süren okumalar kilitlenme ve çoğaltma (replication) gecikmesi yaratabilir.</li>'
  '<li>Satır tabanlı depolama analitik sorgular için verimsizdir.</li>'
  '<li>Üretim şeması analiz için tasarlanmamıştır; tarihçe tutmaz (güncellenen değerin eskisi kaybolur).</li></ul>'
  '<p><b>Çözüm:</b> Veriyi ETL/ELT ya da CDC ile ambara taşımak. Kısa vadede salt okunur bir kopya (read replica) üzerinde sorgu çalıştırmak bir ara çözüm olabilir.</p>',
  ['Read replica kullanmanın sınırları nelerdir?', 'HTAP sistemleri bu ayrımı nasıl bulanıklaştırır?'],
  ['OLAP\'ı yalnız "daha büyük veritabanı" diye tanımlamak', 'Üretim sistemine etki riskini anmamak'],
  'Farkı iş yükünün doğasıyla (çok küçük işlem vs. az büyük tarama) açıkla; teknik ayrıntılar bundan türer.'),

I(['muhendis', 'analist'], 'temel', 'kod-okuma', 'Parça parça okuma',
  'Büyük bir CSV belleğe sığmadığı için <code>chunksize</code> ile parça parça okunup şube toplamları hesaplanıyor. Çıktı ne olur?',
  '<p><b>Veri:</b> 10 satır; i = 1..10 için şube <code>S{i % 3}</code>, tutar i × 10.</p><ul>'
  '<li>S0: i = 3, 6, 9 → 30 + 60 + 90 = <b>180</b></li>'
  '<li>S1: i = 1, 4, 7, 10 → 10 + 40 + 70 + 100 = <b>220</b></li>'
  '<li>S2: i = 2, 5, 8 → 20 + 50 + 80 = <b>150</b></li></ul>'
  '<p><code>chunksize=4</code> ile 10 satır 4 + 4 + 2 olarak <b>3 parça</b> hâlinde gelir. Her parçada <code>groupby</code> ile kısmi toplam alınır ve sözlükte birikir. Son çıktı: <code>3 {\'S0\': 180, \'S1\': 220, \'S2\': 150}</code>.</p>'
  '<p><b>Neden doğru çalışıyor:</b> Toplam, parçalar üzerinden birleştirilebilir (associative) bir işlemdir: parça toplamlarının toplamı genel toplamdır. Aynı şey sayım, min ve max için de geçerlidir.</p>'
  '<p><b>Tuzak:</b> Ortalama bu şekilde birleştirilemez: parça ortalamalarının ortalaması, parçalar farklı büyüklükteyse yanlıştır. Ortalama için toplam ve sayıyı ayrı biriktirip sonda bölmek gerekir. Medyan ve benzersiz sayısı (nunique) ise parçalarla kesin hesaplanamaz.</p>'
  '<p><b>Alternatifler:</b> Yalnız gereken sütunları okumak (<code>usecols</code>), doğru tipler (<code>dtype</code>), dosyayı bir kez parquet\'e çevirmek; ya da DuckDB/Polars gibi bellek dışı çalışabilen araçlar.</p>',
  ['Parça parça okurken ortalamayı nasıl doğru hesaplarsın?', 'DuckDB bu işi nasıl tek satırla yapar?'],
  ['Parça ortalamalarının ortalamasını genel ortalama saymak', 'Parça sayısını yanlış hesaplamak (son parçanın küçük olabileceğini unutmak)'],
  'Toplanabilir ve toplanamaz istatistikler ayrımını söylemek, dağıtık hesaplama sezgini de gösterir.',
  code='''
import io
import pandas as pd
csv = 'sube,tutar\\n' + '\\n'.join(f'S{i % 3},{i * 10}' for i in range(1, 11))
toplam, parca_sayisi = {}, 0
for parca in pd.read_csv(io.StringIO(csv), chunksize=4):
    parca_sayisi += 1
    for sube, t in parca.groupby('sube')['tutar'].sum().items():
        toplam[sube] = toplam.get(sube, 0) + int(t)
print(parca_sayisi, dict(sorted(toplam.items())))
'''),

I(['muhendis'], 'orta', 'vaka', 'Vaka: şema değişikliği',
  'Kaynak sistem ekibi, haber vermeden <code>musteri_sehir</code> sütununun adını <code>sehir_kodu</code> yapıp içeriğini il adından plaka koduna çevirdi. Gece hattı hata vermedi ama sabah raporlarda şehirler boş. Ne yaparsın?',
  '<p><b>1) Acil müdahale:</b> Etkilenen tabloları ve raporları belirle; paydaşlara "şehir kırılımları geçici olarak hatalı" bilgisini ver. Hattın neden hata vermediğini anla: büyük olasılıkla eksik sütun sessizce NULL olarak dolduruldu.</p>'
  '<p><b>2) Düzelt:</b> Hatta yeni sütunu oku, plaka kodunu il adına çeviren bir eşleme tablosu ekle (01 → Adana...). Değişiklik tarihinden itibaren etkilenen günleri yeniden işle (backfill); hat idempotent olduğu için bu güvenle yapılabilir.</p>'
  '<p><b>3) Kök neden:</b> Teknik değil, süreç sorunu: üretici ekip verisinin kimler tarafından kullanıldığını bilmiyor ve değişiklikler bildirilmiyor.</p>'
  '<p><b>4) Kalıcı önlemler:</b></p><ul>'
  '<li><b>Şema doğrulaması:</b> Beklenen sütunlar ve tipler eksikse hat <b>yüksek sesle</b> durmalı; sessiz NULL en kötü seçenektir.</li>'
  '<li><b>Veri sözleşmesi (data contract):</b> Kaynak ekip ile tüketiciler arasında şema, anlam, güncellik ve değişiklik süreci üzerinde yazılı anlaşma; kırıcı değişiklikler önceden duyurulur ve bir geçiş dönemi boyunca iki sütun birlikte yayınlanır.</li>'
  '<li><b>Değer kontrolü:</b> Şehir alanında NULL oranı ani artışı için uyarı.</li>'
  '<li><b>Sınıflandırılmış katman:</b> Ham katman kaynağı olduğu gibi alır; dönüşüm katmanı kaynaklar arası farkları soğurur.</li></ul>',
  ['Veri sözleşmesinde neler yer almalı?', 'Şema evrimini (schema evolution) destekleyen formatlar hangileri?'],
  ['Yalnız kodu düzeltip etkilenen geçmiş günleri yeniden işlememek', 'Sorunu tamamen kaynak ekibe yükleyip kendi hattının sessiz başarısızlığını görmemek'],
  'Hem teknik düzeltmeyi hem süreç önlemini (veri sözleşmesi) anlatırsan kıdemli mühendis profili çizersin.'),

I(['muhendis', 'ml'], 'orta', 'kavram', 'Veri gölü, ambar ve lakehouse',
  'Veri ambarı, veri gölü ve lakehouse arasındaki farklar nelerdir? Delta Lake / Apache Iceberg gibi tablo formatları neyi çözer?',
  '<p><b>Veri ambarı (warehouse):</b> Yapılandırılmış, temizlenmiş, şemalı veri; SQL ile yüksek performanslı analitik; güçlü yönetişim. Ham, yarı yapılandırılmış ya da yapılandırılmamış veri (görüntü, log) için uygun değildir; depolama görece pahalıdır.</p>'
  '<p><b>Veri gölü (lake):</b> Nesne depolamada (S3, GCS) her türlü verinin ucuzca, ham hâliyle saklanması; şema okuma anında uygulanır. Esnek ve ucuz; ama işlem (transaction) desteği, güncelleme/silme ve tutarlılık zayıftır. Yönetilmezse "veri bataklığına" dönüşür: kimsenin neyin doğru olduğunu bilmediği dosya yığını.</p>'
  '<p><b>Lakehouse:</b> Gölün ucuz, açık formatlı depolaması üzerine ambarın özelliklerini ekler. Bunu sağlayan, <b>açık tablo formatlarıdır</b> (Delta Lake, Apache Iceberg, Apache Hudi). Parquet dosyalarının üstünde bir meta veri katmanı tutarak şunları sağlarlar:</p><ul>'
  '<li><b>ACID işlemleri:</b> Yarım kalan yazma okuyucuları bozmaz; eşzamanlı yazıcılar çakışmaz.</li>'
  '<li><b>Güncelleme, silme, MERGE:</b> CDC ve KVKK silme talepleri uygulanabilir.</li>'
  '<li><b>Zamanda yolculuk:</b> Tablonun geçmiş bir sürümünü sorgulamak; ML eğitim verisi için tekrar üretilebilirlik.</li>'
  '<li><b>Şema evrimi</b> ve bölümleme bilgisinin meta veride tutulması.</li></ul>'
  '<p><b>Seçim:</b> Ağırlıklı olarak SQL analitiği yapan bir ekip için yönetilen ambar en az işletim yükünü getirir; ML, büyük hacimli ham veri ve birden çok motorun (Spark, Trino, DuckDB) aynı veriyi okuması gerekiyorsa lakehouse avantajlıdır.</p>',
  ['Zamanda yolculuk özelliği ML için neden değerlidir?', 'Küçük dosya sorununu tablo formatları nasıl ele alır?'],
  ['Lakehouse\'u yalnız bir pazarlama terimi olarak geçiştirmek', 'Veri gölünde ACID işlemlerin doğal olarak var olduğunu sanmak'],
  'Tablo formatlarının çözdüğü somut sorunları (yarım yazma, silme talebi) sayarsan kavramı gerçekten anladığın görülür.'),

I(['muhendis', 'analist'], 'temel', 'vaka', 'Vaka: veri tazeliği',
  'Sabah bir analist "Panoda dünün verisi yok" diye yazıyor. Veri mühendisi olarak adım adım nasıl ilerlersin?',
  '<p><b>1) Durumu doğrula:</b> Hangi pano, hangi tablo? Hedef tablodaki en son tarihi kontrol et: <code>SELECT MAX(tarih) FROM f_satis</code>. Sorun veri mi, yoksa panonun önbelleği mi?</p>'
  '<p><b>2) Hattı geriye doğru izle:</b> Orkestratörde (Airflow) dünkü çalıştırmanın durumu: başarısız mı, hâlâ çalışıyor mu, hiç başlamadı mı? Başarısızsa hangi görev ve hangi hata?</p>'
  '<p><b>3) Tipik nedenler:</b></p><ul>'
  '<li>Kaynak sistem verisi geç geldi; sensör görevi zaman aşımına uğradı.</li>'
  '<li>Kimlik bilgisi (şifre, token) süresi doldu.</li>'
  '<li>Upstream bir tablo değişti ya da boş geldi; kalite kontrolü hattı bilinçli durdurdu.</li>'
  '<li>Zamanlayıcı ya da işçi düğümleri çalışmıyor.</li>'
  '<li>Hat başarılı ama yanlış tarihi işledi (saat dilimi hatası).</li></ul>'
  '<p><b>4) Düzelt ve yeniden çalıştır:</b> Nedeni gider, ilgili tarih için hattı yeniden çalıştır; bağımlı görevlerin de tamamlandığını ve sayıların makul olduğunu kontrol et.</p>'
  '<p><b>5) İletişim:</b> Analiste ve kanal üzerinden etkilenen herkese tahmini düzelme saatini bildir; çözülünce haber ver.</p>'
  '<p><b>6) Önleme:</b> Tazelik kontrolü ve alarm (ör. 07:00\'ye kadar dünün verisi yoksa nöbetçiye bildirim); böylece sorunu analistten önce sen fark edersin.</p>',
  ['Tazelik SLA\'sı nasıl tanımlanır?', 'Başarısız görevler için otomatik yeniden deneme her zaman iyi midir?'],
  ['Kontrol etmeden doğrudan hattı yeniden başlatmak', 'Kullanıcıya bilgi vermeden sessizce düzeltmek'],
  'Hedef: sorunu kullanıcıdan önce fark etmek. Cevabını bu cümleyle bitirmek iyi bir izlenim bırakır.'),

I(['muhendis', 'ml'], 'ileri', 'tasarim', 'Gerçek zamanlı veri hattı tasarımı',
  'Kanat Havayolları için uçuş durumlarını (kalkış, rötar, kapı değişikliği) operasyon veritabanından yakalayıp hem canlı panoya hem de analitik ambara taşıyan bir boru hattı tasarla.',
  '<p><b>1) Gereksinimler:</b> Panoda uçtan uca gecikme &lt; 30 sn; ambarda tam tarihçe (her durum değişikliği), günlük raporlar için tutarlılık; günde yaklaşık 1.500 uçuş, uçuş başına onlarca olay. Hacim küçük, gecikme ve doğruluk önemli.</p>'
  '<p><b>2) Yakalama:</b> Operasyon veritabanından (PostgreSQL) log tabanlı CDC (Debezium). Her değişiklik bir olay olarak Kafka\'daki <code>ucus_durum</code> konusuna, <b>uçuş kimliğine göre bölümlenerek</b> yazılır; böylece aynı uçuşun olayları sıralı kalır.</p>'
  '<p><b>3) Akış işleme:</b> Hafif bir akış işleyicisi (Flink ya da Kafka Streams) olayları zenginleştirir (havalimanı, uçak tipi), uçuş başına son durumu hesaplar ve düşük gecikmeli bir depoya (Redis ya da operasyonel bir tablo) yazar. Pano buradan okur.</p>'
  '<p><b>4) Analitik yol:</b> Aynı konu, bir bağlayıcıyla lakehouse/ambar\'daki ham olay tablosuna dakikalık mikro-toplu olarak eklenir. Üstünde: SCD Tip 2 benzeri uçuş durum tarihçesi ve günlük rötar olgu tablosu (dbt).</p>'
  '<p><b>5) Doğruluk:</b> Olaylar LSN ile sıralı ve idempotent uygulanır; yinelenenler atılır. Gece mutabakat işi, ambar ile kaynak veritabanının gün sonu durumunu karşılaştırır.</p>'
  '<p><b>6) İşletim:</b> Tüketici gecikmesi, uçtan uca gecikme, CDC bağlayıcı sağlığı için alarmlar; şema kayıt defteri (schema registry) ile şema değişikliklerinin kontrolü; Kafka\'da saklama süresi yeniden işlemeye yetecek kadar (ör. 7 gün).</p>',
  ['Bu hacim için Kafka gerçekten gerekli mi? Daha basit alternatif ne olurdu?', 'Pano depolama katmanı çökerse nasıl yeniden inşa edersin?'],
  ['Gereksinimleri ve hacmi sormadan araç listesi sıralamak', 'Olay sırası ve yinelenen olay sorununu tasarıma katmamak'],
  'Tasarım sorularında küçük hacmi fark edip "daha basit bir alternatif de mümkün" demek, aşırı mühendislikten kaçındığını gösterir.'),

I(['muhendis', 'analist'], 'ileri', 'vaka', 'Vaka: geçmişi yeniden işleme',
  'Finans ekibi "net ciro" tanımını değiştirdi: artık kargo ücreti hariç. Son 18 ayın tüm raporlarının yeni tanımla yeniden hesaplanması isteniyor. Bu backfill\'i nasıl planlarsın?',
  '<p><b>1) Kapsam:</b> Tanım hangi modellerde kullanılıyor? Soy ağacı (lineage) aracıyla ya da dbt bağımlılık grafiğiyle etkilenen tüm tabloları ve panoları çıkar. Ham veride kargo ücreti ayrı bir alan olarak 18 ay geriye mevcut mu? Değilse ne yapılacağını finansla kararlaştır.</p>'
  '<p><b>2) Kod değişikliği:</b> Yeni tanım bir kez, tek bir modelde uygulanır; diğer modeller ona referans verir. Test: birkaç bilinen gün için elle hesaplanan değerlerle karşılaştırma.</p>'
  '<p><b>3) Güvenli yürütme:</b></p><ul>'
  '<li>Yeniden işleme önce <b>paralel tablolara</b> (<code>f_satis_v2</code>) yazılır; mevcut raporlar bozulmaz.</li>'
  '<li>Aylık bölümler hâlinde, idempotent görevlerle; yarıda kalırsa kaldığı yerden devam edebilir. Airflow\'da tarih aralığıyla backfill, eşzamanlı çalıştırma sayısı sınırlı (kaynak ve maliyet kontrolü).</li>'
  '<li>İş saatleri dışında, ambar maliyeti için bütçe tahmini yapılmış olarak.</li></ul>'
  '<p><b>4) Doğrulama:</b> Eski ve yeni ciro farkı, kargo ücreti toplamına eşit mi? Ay bazında fark tablosu finansla paylaşılır ve onaylanır.</p>'
  '<p><b>5) Geçiş:</b> Onaydan sonra görünümler yeni tablolara çevrilir (atomik değişim). Panolarda "1 Kasım itibarıyla net ciro tanımı değişti" notu ve tanım sözlüğü güncellenir; eski tablolar bir süre arşivde tutulur.</p>',
  ['Backfill sırasında günlük artımsal işler çalışmaya devam ederse ne olur?', 'Ham veri yoksa geçmişi nasıl ele alırsın?'],
  ['Üretim tablolarının üzerine doğrudan yazarak yeniden işlemek', 'Doğrulama ve paydaş onayı adımlarını atlamak'],
  'Backfill sorularında "paralel tablo + doğrulama + atomik geçiş" üçlüsünü kur; güvenli değişimin özü budur.'),

I(['muhendis', 'analist'], 'ileri', 'vaka', 'Vaka: ambar maliyeti',
  'Lezzet Kurye\'nin bulut veri ambarı faturası son 3 ayda üç katına çıktı. Maliyeti nasıl analiz eder ve düşürürsün?',
  '<p><b>1) Ölç:</b> Ambarın sorgu geçmişi ve fatura kırılımından: maliyetin ne kadarı depolama, ne kadarı işlem? En pahalı 20 sorgu/iş hangileri, kim çalıştırıyor, ne sıklıkla? Genellikle maliyetin büyük kısmı az sayıda işten gelir.</p>'
  '<p><b>2) Tipik suçlular ve çözümleri:</b></p><ul>'
  '<li><b>Tam tablo taramaları:</b> Bölüm filtresi olmayan sorgular, <code>SELECT *</code>. Çözüm: tarih bölümü ve zorunlu bölüm filtresi, kümeleme, yalnız gerekli sütunlar.</li>'
  '<li><b>Gereksiz sık yenileme:</b> Günde bir bakılan bir pano her 5 dakikada tüm tabloyu yeniden hesaplıyor. Çözüm: yenileme sıklığını kullanıma göre ayarla.</li>'
  '<li><b>Tam yeniden inşa:</b> Büyük olgu tabloları her gece baştan oluşturuluyor. Çözüm: artımsal (incremental) modeller, yalnız yeni bölümleri işlemek.</li>'
  '<li><b>Önceden hesaplanmamış özetler:</b> Her pano açılışında milyarlarca satır toplanıyor. Çözüm: özet tablolar ya da materyalize görünümler.</li>'
  '<li><b>Boşta çalışan işlem kaynakları:</b> Otomatik askıya alma ayarları, doğru boyutlu kümeler.</li>'
  '<li><b>Depolama:</b> Kullanılmayan tablolar, uzun zamanda yolculuk süresi; soğuk veri için daha ucuz katman.</li></ul>'
  '<p><b>3) Yönetişim:</b> Ekip ve proje bazında maliyet etiketleri, bütçe uyarıları, sorgu başına tarama sınırı. Maliyet panosu herkese açık olunca davranış da değişir.</p>'
  '<p><b>4) Önceliklendirme:</b> Etkisi büyük ve kolay olanlardan başla; her değişikliğin tasarrufunu ölç ve raporla.</p>',
  ['Artımsal modelde geç gelen veriyi nasıl ele alırsın?', 'Maliyet ile veri tazeliği arasında nasıl denge kurarsın?'],
  ['Ölçmeden "daha ucuz bir ambara geçelim" önermek', 'Yalnız teknik önlemler sayıp kullanım alışkanlıklarını ve yönetişimi atlamak'],
  'Maliyet vakalarında "önce ölç, en büyük 20 işe odaklan" yaklaşımı Pareto ilkesini bildiğini gösterir.'),

I(['muhendis', 'analist'], 'orta', 'tasarim', 'Veri kalitesi izleme sistemi',
  'Şirketin 200 tablosu için bir veri kalitesi izleme ve uyarı sistemi tasarla. Uyarı yorgunluğundan nasıl kaçınırsın?',
  '<p><b>1) Tabloları önceliklendir:</b> 200 tablonun hepsi eşit değildir. Yönetim panolarını, finans raporlarını ve ML modellerini besleyen "kritik" tabloları (belki 20–30) belirle; her birine bir sahip ata.</p>'
  '<p><b>2) Kontrol katmanları:</b></p><ul>'
  '<li><b>Tüm tablolar için otomatik temel kontroller:</b> tazelik (son güncelleme), hacim (satır sayısı geçmiş aralığın içinde mi), şema değişikliği.</li>'
  '<li><b>Kritik tablolar için kurallı kontroller:</b> benzersizlik, null, geçerli değer aralığı, yabancı anahtar bütünlüğü, kaynak sistemle mutabakat (dbt testleri ya da Great Expectations).</li>'
  '<li><b>Dağılım/anomali kontrolleri:</b> Önemli metriklerde mevsimselliği hesaba katan basit istatistiksel eşikler (geçen haftaların aynı günü).</li></ul>'
  '<p><b>3) Yürütme:</b> Kontroller hattın içinde, yükleme sonrası çalışır. Kritik kontrol başarısızsa bağımlı işler durdurulur (devre kesici); sonuçlar bir kalite tablosuna yazılır ve bir panoda görünür.</p>'
  '<p><b>4) Uyarı yorgunluğuna karşı:</b> Önem dereceleri (kritik → nöbetçiye anlık bildirim; uyarı → günlük özet e-postası); her uyarı doğrudan sahibine gider; uyarıda ne olduğu, etkilenen tablolar ve çalıştırma kitabı (runbook) bağlantısı yer alır; sık yanlış alarm üreten kontroller gözden geçirilip ayarlanır ya da kaldırılır; aynı kök nedenden gelen uyarılar gruplanır.</p>'
  '<p><b>5) Ölç:</b> Sorunların kullanıcıdan önce yakalanma oranı ve çözüm süresi.</p>',
  ['Veri soy ağacı (lineage) bu sistemde nasıl kullanılır?', 'Anomali eşiklerini nasıl belirlersin?'],
  ['200 tabloya aynı yoğunlukta kontrol koymayı önermek', 'Uyarıların kime gideceğini ve ne yapılacağını tanımlamamak'],
  'Önceliklendirme ve sahiplik vurgusu, tasarımın kâğıt üzerinde değil gerçekte de çalışacağını gösterir.'),
]
