import sys
sys.path.insert(0, '/tmp/claude-0/-home-claude/6c066959-3fcb-54bb-bdf1-c8ae148dfc4c/scratchpad/b')
from jsb import C, emit

body = r'''
<h2>Neden önemli?</h2>
<p>Gece 03.00'te Anadolu Market'in ödeme servisi bazı siparişleri reddetmeye başlıyor. Nöbetçi geliştiricinin elinde yalnız loglar var. Kod <code>print("hata oldu")</code> yazıyorsa elinde ne zaman, hangi modülde, hangi siparişte, hangi önem derecesinde olduğu bilinmeyen bir satır vardır. <code>logging</code> ile yazılmışsa her satırda zaman, seviye, modül adı ve sipariş numarası durur; hata satırının altında tam traceback vardır; hassas veriler maskelenmiştir ve loglar hem ekrana hem dönen (rotating) dosyalara akar.</p>
<p>Hata tasarımı dersinde <code>basicConfig</code>, <code>getLogger(__name__)</code> ve <code>exception()</code> ile tanıştın. Bu derste logging'in mimarisini öğreneceksin: <b>logger → filter → handler → formatter</b> boru hattı, hiyerarşi ve yayılım (propagation), <code>dictConfig</code>, JSON log, kütüphane kodunun kuralları ve KVKK uyumlu maskeleme.</p>

<h2>print yerine logging: ne kazanırsın?</h2>
<div class="tbl-wrap"><table>
<tr><th>İhtiyaç</th><th>print</th><th>logging</th></tr>
<tr><td>Önem derecesi</td><td>Yok</td><td>DEBUG, INFO, WARNING, ERROR, CRITICAL</td></tr>
<tr><td>Kapatıp açmak</td><td>Kodu değiştirmek gerekir</td><td>Seviyeyi yapılandırmadan değiştir</td></tr>
<tr><td>Hedef</td><td>Yalnız stdout</td><td>Konsol, dosya, syslog, e-posta, HTTP... aynı anda</td></tr>
<tr><td>Bağlam</td><td>Elle yazarsın</td><td>Zaman, modül, satır, süreç, iş parçacığı otomatik</td></tr>
<tr><td>Traceback</td><td>Elle</td><td><code>logger.exception()</code></td></tr>
<tr><td>Kütüphane kodu</td><td>Kullanıcının ekranını kirletir</td><td>Uygulama isterse görünür</td></tr>
</table></div>

<h2>Seviyeler</h2>
<p>Her seviye bir sayıdır. Logger ve handler bir eşik taşır; eşiğin altındaki kayıtlar atılır.</p>
<div class="tbl-wrap"><table>
<tr><th>Seviye</th><th>Sayı</th><th>Ne zaman?</th><th>Anadolu Market örneği</th></tr>
<tr><td>DEBUG</td><td>10</td><td>Geliştirici ayrıntısı</td><td>Sepet hesabının ara değerleri</td></tr>
<tr><td>INFO</td><td>20</td><td>Olağan, önemli olay</td><td>Sipariş AM-101 oluşturuldu</td></tr>
<tr><td>WARNING</td><td>30</td><td>Beklenmedik ama sürüyor</td><td>Stok 5'in altına düştü</td></tr>
<tr><td>ERROR</td><td>40</td><td>İşlem başarısız</td><td>Ödeme sağlayıcısı yanıt vermedi</td></tr>
<tr><td>CRITICAL</td><td>50</td><td>Sistem çalışamıyor</td><td>Veritabanı bağlantısı yok</td></tr>
</table></div>
<p>Kök logger'ın (root) varsayılan seviyesi <b>WARNING</b>'dir. Bu yüzden hiç yapılandırmadan yazılan <code>logging.info(...)</code> görünmez; yeni başlayanların en sık şaşırdığı durum budur.</p>

<h2>Boru hattı: logger, handler, formatter, filter</h2>
<ol>
<li><b>Logger</b>: koddan çağırdığın nesne (<code>log.info(...)</code>). Seviyesine bakar, bir <code>LogRecord</code> oluşturur, kendi filtrelerini uygular.</li>
<li><b>Handler</b>: kaydı bir hedefe gönderir (StreamHandler: akış, FileHandler: dosya, RotatingFileHandler: boyutla dönen dosya). Kendi seviyesi ve filtreleri vardır.</li>
<li><b>Formatter</b>: kaydı metne çevirir: <code>"%(asctime)s %(levelname)s %(name)s: %(message)s"</code>.</li>
<li><b>Filter</b>: kaydı geçirir ya da düşürür; kaydı <b>değiştirebilir</b> de (maskeleme).</li>
</ol>
<p>Bu derste ekran çıktısının her çalıştırmada aynı olması için handler'ları <code>sys.stdout</code>'a bağlayacak ve formata zaman koymayacağız. Tarayıcıdaki Python oturumu çalıştırmalar arasında yaşadığı için, her örnekte logger'ın handler'larını temizleyip <code>propagate = False</code> yapacağız; yoksa aynı mesaj iki, üç kez basılır.</p>
<pre class="py">import logging, sys

log = logging.getLogger("anadolu.siparis")
log.handlers.clear()                 # önceki çalıştırmadan kalanları sil
log.propagate = False                # kök logger'a iletme
log.setLevel(logging.DEBUG)          # logger eşiği

ekran = logging.StreamHandler(sys.stdout)
ekran.setLevel(logging.INFO)         # handler eşiği: DEBUG bu kapıdan geçmez
ekran.setFormatter(logging.Formatter("%(levelname)-8s %(name)s | %(message)s"))
log.addHandler(ekran)

log.debug("Sepet ara toplamı: %s", 1249.9)     # görünmez
log.info("Sipariş %s oluşturuldu", "AM-101")
log.warning("Stok azaldı: %s (kalan %d)", "Termos", 3)
log.error("Ödeme reddedildi: %s", "AM-102")
print(log.getEffectiveLevel(), ekran.level)</pre>
<div class="tip"><b>%s ile tembel biçimlendirme</b>Mesajı <code>log.info("Sipariş %s", no)</code> biçiminde ver. Metin yalnız kayıt gerçekten yazılacaksa oluşturulur ve (aşağıda göreceğin gibi) filtreler argümanlara ayrı ayrı erişebilir. f-string de çalışır ama hata tasarımı dersinde gördüğün nedenlerle ikinci tercihtir.</div>

<h2>Logger hiyerarşisi ve yayılım</h2>
<p>Logger adları noktayla ayrılmış bir ağaç kurar: <code>anadolu</code> → <code>anadolu.odeme</code> → <code>anadolu.odeme.kart</code>. Her modülün başında <code>log = logging.getLogger(__name__)</code> yazarsan ağaç, paket yapını kendiliğinden yansıtır. İki kural:</p>
<ul>
<li><b>Etkin seviye</b>: seviyesi ayarlanmamış (NOTSET) logger, ilk ayarlı atasının seviyesini kullanır.</li>
<li><b>Yayılım</b>: <code>propagate</code> True ise (varsayılan) kayıt, atalarının <b>handler'larına</b> da gönderilir. Atanın logger seviyesine bakılmaz, yalnız handler seviyelerine bakılır.</li>
</ul>
<pre class="py">import logging, sys

def ekran(etiket):
    h = logging.StreamHandler(sys.stdout)
    h.setFormatter(logging.Formatter(etiket + " %(name)s: %(message)s"))
    return h

ana = logging.getLogger("anadolu")
ana.handlers.clear(); ana.propagate = False
ana.setLevel(logging.INFO)
ana.addHandler(ekran("[ANA]"))

odeme = logging.getLogger("anadolu.odeme")
odeme.handlers.clear(); odeme.propagate = True; odeme.setLevel(logging.NOTSET)
odeme.info("Kart doğrulandı")                 # kendi handler'ı yok: ata yazar
odeme.addHandler(ekran("[ODEME]"))
odeme.info("Tahsilat tamam")                  # İKİ kez: kendi + ata
odeme.propagate = False
odeme.info("Yalnız bir kez")
print(odeme.parent.name, logging.getLevelName(odeme.getEffectiveLevel()))</pre>
<p>Tekrarlanan log satırlarının bir numaralı nedeni budur: hem alt logger'a hem köke handler eklemek. Yaygın düzen: handler'ları <b>yalnız</b> en üstte (kök ya da uygulama logger'ı) tanımla, alt logger'lara hiç handler ekleme, yalnız <code>getLogger(__name__)</code> ile kullan.</p>

<h2>Filter: kaydı süz ya da değiştir</h2>
<p><code>logging.Filter</code>'dan türeyen bir sınıfın <code>filter(self, kayit)</code> metodu True dönerse kayıt geçer. Kaydın alanlarını değiştirmek de serbesttir. Bu, KVKK ve PCI-DSS gereği TC kimlik ve kart numaralarını logdan silmenin en sağlam yoludur: geliştirici unutsa bile filtre yakalar.</p>
<pre class="py">import logging, sys, re

KART = re.compile(r"\b(?:\d[ -]?){12}(\d{4})\b")
TC = re.compile(r"\b[1-9]\d{8}(\d{2})\b")

def maskele(metin):
    metin = KART.sub(lambda m: "**** **** **** " + m.group(1), metin)
    return TC.sub(lambda m: "*" * 9 + m.group(1), metin)

class MaskeFiltresi(logging.Filter):
    def filter(self, kayit):
        kayit.msg = maskele(kayit.getMessage())
        kayit.args = ()
        return True

log = logging.getLogger("anadolu.kvkk")
log.handlers.clear(); log.propagate = False; log.setLevel(logging.INFO)
h = logging.StreamHandler(sys.stdout)
h.setFormatter(logging.Formatter("%(levelname)s %(message)s"))
h.addFilter(MaskeFiltresi())
log.addHandler(h)

log.info("Ödeme alındı kart=%s tutar=%.2f", "4543 1234 5678 9012", 1499.9)
log.warning("Müşteri %s için adres eksik", "12345678946")</pre>
<p>Filtreyi handler'a eklemek, o handler'a giden her kaydı (alt logger'lardan yayılanlar dahil) kapsar. Logger'a eklenen filtre ise yalnız o logger'da doğrudan oluşturulan kayıtlara uygulanır.</p>

<h2>exception(): traceback'i kaybetme</h2>
<p><code>log.exception("mesaj")</code> yalnız <code>except</code> bloğunda çağrılır, ERROR seviyesinde yazar ve formatter traceback'i mesajın altına ekler. Başka bir seviyede traceback istersen <code>exc_info=True</code> ver.</p>
<pre class="py">import logging, sys

log = logging.getLogger("anadolu.kur")
log.handlers.clear(); log.propagate = False; log.setLevel(logging.INFO)
h = logging.StreamHandler(sys.stdout)
h.setFormatter(logging.Formatter("%(levelname)s %(message)s"))
log.addHandler(h)

def birim_fiyat(toplam, adet):
    try:
        return round(toplam / adet, 2)
    except ZeroDivisionError:
        log.exception("Birim fiyat hesaplanamadı: toplam=%s adet=%s", toplam, adet)
        return None

print(birim_fiyat(100, 0))
try:
    int("on iki")
except ValueError:
    log.warning("Adet sayıya çevrilemedi", exc_info=True)</pre>

<h2>Yapılandırılmış (JSON) log</h2>
<p>Üretimde loglar Elasticsearch, Loki, Datadog gibi sistemlerde aranır. Her satırın bir JSON nesnesi olması, "tutarı 10.000 TL üstü ve seviyesi ERROR olan kayıtlar" gibi sorguları mümkün kılar. Kendi Formatter'ını yazmak kolaydır; ek alanlar <code>extra=</code> ile kayda eklenir.</p>
<pre class="py">import logging, sys, json

class JsonFormatter(logging.Formatter):
    def format(self, kayit):
        veri = {"seviye": kayit.levelname, "logger": kayit.name, "mesaj": kayit.getMessage()}
        for alan in ("siparis_id", "tutar"):
            if hasattr(kayit, alan):
                veri[alan] = getattr(kayit, alan)
        if kayit.exc_info:
            veri["hata"] = self.formatException(kayit.exc_info).splitlines()[-1]
        return json.dumps(veri, ensure_ascii=False)

log = logging.getLogger("anadolu.json")
log.handlers.clear(); log.propagate = False; log.setLevel(logging.INFO)
h = logging.StreamHandler(sys.stdout)
h.setFormatter(JsonFormatter())
log.addHandler(h)

log.info("Sipariş onaylandı", extra={"siparis_id": "AM-101", "tutar": 1499.9})
try:
    {}["kargo"]
except KeyError:
    log.exception("Kargo bilgisi yok", extra={"siparis_id": "AM-102"})</pre>

<h2>Dosyaya log ve RotatingFileHandler</h2>
<p><code>FileHandler</code> tek dosyaya yazar ve dosya sonsuza dek büyür. <code>RotatingFileHandler</code> dosya <code>maxBytes</code>'a ulaşınca onu <code>.1</code> olarak yeniden adlandırır, eskileri kaydırır ve en fazla <code>backupCount</code> yedek tutar. Zamana göre döndürmek için <code>TimedRotatingFileHandler</code> (ör. her gece) vardır.</p>
<pre class="py">import logging, os
from logging.handlers import RotatingFileHandler

for f in os.listdir("."):
    if f.startswith("stok.log"):
        os.remove(f)

log = logging.getLogger("anadolu.stok")
log.handlers.clear(); log.propagate = False; log.setLevel(logging.INFO)
dosya = RotatingFileHandler("stok.log", maxBytes=120, backupCount=2, encoding="utf-8")
dosya.setFormatter(logging.Formatter("%(levelname)s %(message)s"))
log.addHandler(dosya)

for i in range(1, 13):
    log.info("Ürün U%02d sayıldı", i)
dosya.close()
log.removeHandler(dosya)

print(sorted(f for f in os.listdir(".") if f.startswith("stok.log")))
with open("stok.log", encoding="utf-8") as f:
    print(f.read().strip())</pre>
<div class="warn"><b>Handler'ı kapat</b>Dosya handler'ları açık dosya tutar. Uzun yaşayan uygulamada sorun olmaz ama testlerde ve betik sonunda <code>close()</code> ya da <code>logging.shutdown()</code> çağırmazsan son satırlar diske yazılmayabilir ve Windows'ta dosya silinemez.</div>

<h2>dictConfig: yapılandırmayı koddan ayır</h2>
<p>Gerçek uygulamada yapılandırma tek yerde, çoğu zaman bir YAML/JSON dosyasında durur ve <code>logging.config.dictConfig</code> ile yüklenir. Ortama (geliştirme/üretim) göre seviyeyi değiştirmek kod değişikliği gerektirmez.</p>
<pre class="py">import logging, logging.config

AYAR = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {"sade": {"format": "%(levelname)s:%(name)s:%(message)s"}},
    "handlers": {
        "ekran": {"class": "logging.StreamHandler", "stream": "ext://sys.stdout",
                  "formatter": "sade", "level": "INFO"},
    },
    "loggers": {
        "anadolu": {"handlers": ["ekran"], "level": "DEBUG", "propagate": False},
    },
}
logging.config.dictConfig(AYAR)
logging.getLogger("anadolu.iade").info("İade talebi alındı")
logging.getLogger("anadolu.iade").debug("ekran handler'ı INFO, bu görünmez")</pre>
<p><code>"ext://sys.stdout"</code> yapılandırma anında <code>sys.stdout</code> nesnesine çözülür. <code>disable_existing_loggers: False</code> unutulursa, dictConfig'ten önce oluşturulmuş tüm logger'lar sessizce kapanır: klasik bir üretim sürprizi.</p>

<h2>Kütüphane kodunda NullHandler</h2>
<p>Bir paket (ör. <code>anadolu_odeme</code>) yazıyorsan logging'i <b>yapılandırma</b>: <code>basicConfig</code> çağırma, handler ekleme, seviye ayarlama. Bu kararlar uygulamanındır. Paketin <code>__init__.py</code>'sine yalnız şunu yaz:</p>
<pre class="code">import logging
logging.getLogger(__name__).addHandler(logging.NullHandler())</pre>
<p><code>NullHandler</code> hiçbir şey yapmaz; yalnız "handler bulunamadı" durumunda Python'un son çare (last resort) olarak stderr'e WARNING basmasını önler. Uygulama kendi handler'larını köke eklediğinde paketin logları yayılım sayesinde oraya akar.</p>

<div class="note"><b>Gerçek işte</b>Bankacılık ve e-ticarette loglar çoğunlukla merkezi bir sisteme gider ve denetimde incelenir. KVKK ve kart verisi güvenliği standartları (PCI-DSS) tam kart numarasının ve kimlik numarasının loglarda açık metin olarak durmasına izin vermez; denetimlerde ilk bakılan yerlerden biri log dosyalarıdır. Bu yüzden ekipler maskeleme filtresini handler düzeyinde zorunlu kılar, JSON log kullanır ve her isteğe bir <code>istek_id</code> ekleyerek tek bir müşterinin yolculuğunu servisler arasında izler.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>LoggerAdapter ve bağlam</h3>
<p>Her satıra aynı <code>extra</code>'yı yazmak yerine <code>logging.LoggerAdapter(log, {"istek_id": "R-42"})</code> kullanabilirsin. Daha modern yaklaşım <code>contextvars</code> ile istek kimliğini bir değişkende tutup bir Filter içinde kayda eklemektir; async kodda da doğru çalışır.</p>
<h3>Performans</h3>
<p>Pahalı bir hesaplamayı yalnız log yazılacaksa yap: <code>if log.isEnabledFor(logging.DEBUG): log.debug("Ayrıntı: %s", pahali())</code>. Yüksek trafikli servislerde <code>QueueHandler</code> ve <code>QueueListener</code> ile yazma işini ayrı bir iş parçacığına alırsın; istek yolu diske beklemez.</p>
<h3>structlog ve loguru</h3>
<p><code>structlog</code> anahtar-değer tabanlı yapılandırılmış logu birinci sınıf vatandaş yapar; <code>loguru</code> tek satırda renkli, dönen dosyalı log verir. İkisi de standart <code>logging</code> ile birlikte çalışabilir. Önce standart modülü iyi öğren: kütüphanelerin neredeyse hepsi onu kullanır ve onların loglarını yönetmek senin işin olacak.</p>
<h3>Testte log doğrulamak</h3>
<p><code>unittest</code>'te <code>self.assertLogs("anadolu.odeme", level="WARNING")</code>, pytest'te <code>caplog</code> fikstürü logları yakalar. Bu derste alıştırmalarda kendi handler'ını yazarak aynı şeyi yapacaksın.</p>
</section>
'''

CAPTURE = C('''
import io, sys, logging
def yakala(fn):
    eski = sys.stdout
    sys.stdout = tampon = io.StringIO()
    try:
        fn()
    finally:
        sys.stdout = eski
    return tampon.getvalue()
''')

ex = []
ex += [
{'t': 'mc', 'stage': 'Isınma',
 'q': 'Hiçbir yapılandırma yapmadan <code>logging.getLogger("app").info("Başladı")</code> çalıştırıyorsun ve ekranda hiçbir şey görünmüyor. Neden?',
 'o': ['info() yalnız dosyaya yazar', 'Kök logger\'ın varsayılan seviyesi WARNING\'dir', 'getLogger adı "root" olmadığı için devre dışıdır', 'Mesajlar program bitince toplu basılır'], 'a': 1,
 'why': 'NOTSET olan "app" etkin seviyesini kökten alır; kökün varsayılanı WARNING (30). INFO (20) eşiğin altında kaldığı için kayıt hiç oluşturulmaz.'},
{'t': 'mc', 'stage': 'Isınma',
 'q': 'Ödeme kütüphanesi (başkalarının kuracağı bir paket) yazıyorsun. Logging için doğru yaklaşım hangisi?',
 'o': ['Paket içe aktarılınca basicConfig(level=DEBUG) çağırmak', 'Her modülde getLogger(__name__) kullanıp pakete NullHandler eklemek', 'Kendi StreamHandler\'ını kök logger\'a eklemek', 'Logging yerine print kullanmak; uygulama yönlendirir'], 'a': 1,
 'why': 'Yapılandırma uygulamanın kararıdır. Kütüphane yalnız adlandırılmış logger\'larla kayıt üretir ve NullHandler ile "handler yok" uyarısını engeller; uygulama köke handler eklediğinde kayıtlar yayılımla oraya akar.'},
{'t': 'mc', 'stage': 'Isınma',
 'q': 'Logger seviyesi DEBUG, ona bağlı tek handler\'ın seviyesi WARNING. <code>log.info("x")</code> için ne olur?',
 'o': ['Logger kaydı oluşturur, handler eşiğe takılınca yazmaz', 'Handler seviyesi logger\'ınkini ezer, kayıt hiç oluşmaz', 'Kayıt yazılır çünkü logger seviyesi önceliklidir', 'ValueError: seviyeler çelişiyor'], 'a': 0,
 'why': 'İki kapı vardır: önce logger eşiği (DEBUG, geçer), sonra her handler\'ın kendi eşiği (WARNING, geçmez). Aynı logger\'a INFO seviyeli ikinci bir handler (ör. dosya) eklersen kayıt ona yazılır.'},
]
ex += [
{'t': 'predict', 'stage': 'Kodu oku', 'q': 'Bu kod ne yazdırır?',
 'code': C('''
import logging, sys
log = logging.getLogger("tahmin.stok")
log.handlers.clear()
log.propagate = False
log.setLevel(logging.DEBUG)
h = logging.StreamHandler(sys.stdout)
h.setLevel(logging.WARNING)
h.setFormatter(logging.Formatter("%(levelname)s %(message)s"))
log.addHandler(h)
log.debug("a")
log.info("b")
log.warning("c")
log.error("d")
'''),
 'o': ['DEBUG a\nINFO b\nWARNING c\nERROR d', 'WARNING c\nERROR d', 'ERROR d', 'DEBUG a\nINFO b'], 'a': 1,
 'why': 'Logger DEBUG\'den itibaren her şeyi geçirir; handler ise WARNING altını atar. Sonuçta yalnız c ve d yazılır.'},
{'t': 'predict', 'stage': 'Kodu oku', 'q': 'Bu kod ne yazdırır?',
 'code': C('''
import logging, sys
def ekran(etiket):
    h = logging.StreamHandler(sys.stdout)
    h.setFormatter(logging.Formatter(etiket + " %(message)s"))
    return h
ana = logging.getLogger("tahmin2")
ana.handlers.clear(); ana.propagate = False
ana.setLevel(logging.INFO)
ana.addHandler(ekran("ANA"))
cocuk = logging.getLogger("tahmin2.odeme")
cocuk.handlers.clear(); cocuk.propagate = True
cocuk.addHandler(ekran("ODEME"))
cocuk.info("tahsil edildi")
'''),
 'o': ['ODEME tahsil edildi', 'ANA tahsil edildi', 'ODEME tahsil edildi\nANA tahsil edildi', 'ANA tahsil edildi\nODEME tahsil edildi'], 'a': 2,
 'why': 'Kayıt önce çocuğun kendi handler\'ına, sonra propagate True olduğu için atanın handler\'ına gider. Tekrarlanan log satırlarının en sık nedeni budur.'},
{'t': 'predict', 'stage': 'Kodu oku', 'q': 'Bu kod ne yazdırır?',
 'code': C('''
import logging
a = logging.getLogger("tahmin3")
a.setLevel(logging.ERROR)
b = logging.getLogger("tahmin3.stok.depo")
print(b.parent.name, logging.getLevelName(b.getEffectiveLevel()))
'''),
 'o': ['tahmin3.stok ERROR', 'tahmin3 ERROR', 'tahmin3.stok NOTSET', 'root WARNING'], 'a': 1,
 'why': '"tahmin3.stok" adında bir logger hiç oluşturulmadı; ağaçta yalnız bir yer tutucu vardır, bu yüzden ebeveyn ilk gerçek ata olan "tahmin3"tür. b\'nin seviyesi NOTSET olduğundan etkin seviye atadan gelir: ERROR.'},
{'t': 'order', 'stage': 'Kodu oku',
 'q': '<p>Kayıtları bir listede toplayan özel handler\'ı yazıp tek bir kayıtla deneyen programın satırlarını sırala. Çıktı <code>[\'Stok azaldı: U1\']</code> olmalı.</p>',
 'lines': ['import logging', 'class ListeHandler(logging.Handler):', '    def emit(self, kayit):', '        self.kayitlar.append(kayit.getMessage())', 'h = ListeHandler()', 'h.kayitlar = []', 'h.handle(logging.makeLogRecord({"msg": "Stok azaldı: %s", "args": ("U1",)}))', 'print(h.kayitlar)'],
 'expect': "['Stok azaldı: U1']\n",
 'hint': 'emit, kayitlar listesine yazar; liste handle çağrısından önce var olmalı.',
 'why': 'Handler.handle filtreleri uygular ve emit\'i çağırır; emit kaydı istediğin hedefe (burada liste) yazar. getMessage, msg ile args\'ı birleştirir. Testlerde log doğrulamanın temeli budur.'},
]
ex += [
{'t': 'code', 'stage': 'Rehberli', 'id': 'logging-1', 'diff': 1,
 'q': '<p><code>kur_logger(ad, seviye=logging.INFO)</code> fonksiyonunu yaz. Adı verilen logger\'ı alsın; önceki handler\'larını temizlesin, <code>propagate = False</code> yapsın, seviyesini ayarlasın ve <code>sys.stdout</code>\'a yazan, biçimi <code>"%(levelname)s|%(name)s|%(message)s"</code> olan bir <code>StreamHandler</code> ekleyip logger\'ı döndürsün. Aynı adla iki kez çağrılınca mesajlar tekrar etmemeli.</p>',
 'guide': ['log = logging.getLogger(ad)', 'log.handlers.clear() ve log.propagate = False', 'log.setLevel(seviye)', 'StreamHandler(sys.stdout) oluştur, setFormatter ile biçimi ver, addHandler ile ekle.', 'log\'u döndür.'],
 'example': C('''
import logging, sys
lg = logging.getLogger("ornek.kargo")
lg.handlers.clear()
lg.propagate = False
lg.setLevel(logging.WARNING)
h = logging.StreamHandler(sys.stdout)
h.setFormatter(logging.Formatter("[%(levelname)s] %(message)s"))
lg.addHandler(h)
lg.warning("Kargo gecikti")
'''),
 'start': C('''
import logging, sys

def kur_logger(ad, seviye=logging.INFO):
    log = logging.getLogger(ad)
    # TODO: temizle, yayılımı kapat, seviyeyi ayarla
    # TODO: stdout'a yazan biçimli handler ekle
    return log
'''),
 'sol': C('''
import logging, sys

def kur_logger(ad, seviye=logging.INFO):
    log = logging.getLogger(ad)
    log.handlers.clear()
    log.propagate = False
    log.setLevel(seviye)
    h = logging.StreamHandler(sys.stdout)
    h.setFormatter(logging.Formatter("%(levelname)s|%(name)s|%(message)s"))
    log.addHandler(h)
    return log
'''),
 'tests': CAPTURE + C('''
def senaryo():
    kur_logger("anadolu.t1")
    lg = kur_logger("anadolu.t1")
    lg.debug("gizli")
    lg.info("Sipariş %s alındı", "AM-1")
    kur_logger("anadolu.t2", logging.ERROR).warning("görünmez")
cikti = yakala(senaryo)
assert cikti == "INFO|anadolu.t1|Sipariş AM-1 alındı\\n", f"beklenen tek satır, gelen: {cikti!r}"
assert logging.getLogger("anadolu.t1").propagate is False, "propagate False olmalı"
assert len(logging.getLogger("anadolu.t1").handlers) == 1, "iki çağrıdan sonra tek handler kalmalı"
'''),
 'hints': ['Kavram: logger + handler + formatter üçlüsü.', 'h = logging.StreamHandler(sys.stdout); h.setFormatter(logging.Formatter("%(levelname)s|%(name)s|%(message)s"))', 'Tekrarı önlemek için önce log.handlers.clear().'],
 'why': 'Handler\'ları temizlemek fonksiyonu tekrar çağrılabilir (idempotent) yapar; propagate False kökteki olası handler\'larla çift yazmayı önler. sys.stdout\'u çağrı anında vermek, testin çıktıyı yakalamasını sağlar.'},
{'t': 'code', 'stage': 'Rehberli', 'id': 'logging-2', 'diff': 2,
 'q': '<p>KVKK maskelemesi için <code>maskele(metin)</code> fonksiyonunu yaz:</p><ul><li>16 haneli kart numaraları (dört haneli gruplar arasında boşluk ya da tire olabilir ya da hiç ayraç olmayabilir) <code>"**** **** **** 1234"</code> biçimine dönsün (son 4 hane açık).</li><li>11 haneli, 0 ile başlamayan TC kimlik numaraları <code>"*********46"</code> biçimine dönsün (son 2 hane açık).</li><li>Başka sayılar (sipariş no, tutar, telefon) değişmesin.</li></ul>',
 'guide': ['re modülünü içe aktar.', 'Kart deseni: dört grup 4 rakam, aralarında isteğe bağlı [ -]; son grubu yakala. \\b sınırları kullan.', 'TC deseni: [1-9] ile başlayan 11 rakam; son ikisini yakala.', 'Önce kartı, sonra TC\'yi re.sub ile değiştir (fonksiyonlu değiştirme ya da \\1 ile).'],
 'example': C('''
import re
telefon = re.compile(r"\\b(5\\d{2})\\d{4}(\\d{3})\\b")
print(telefon.sub(r"\\1****\\2", "Müşteri 5321234567 aradı"))
'''),
 'start': C('''
import re

KART = re.compile(r"")   # TODO
TC = re.compile(r"")     # TODO

def maskele(metin):
    # TODO: önce kart, sonra TC
    return metin
'''),
 'sol': C('''
import re

KART = re.compile(r"\\b\\d{4}[ -]?\\d{4}[ -]?\\d{4}[ -]?(\\d{4})\\b")
TC = re.compile(r"\\b[1-9]\\d{8}(\\d{2})\\b")

def maskele(metin):
    metin = KART.sub(r"**** **** **** \\1", metin)
    return TC.sub(r"*********\\1", metin)
'''),
 'tests': C('''
assert maskele("kart=4543123456789012") == "kart=**** **** **** 9012", maskele("kart=4543123456789012")
assert maskele("kart 4543 1234 5678 9012 ok") == "kart **** **** **** 9012 ok", "boşluklu kart maskelenmeli"
assert maskele("4543-1234-5678-9012") == "**** **** **** 9012", "tireli kart maskelenmeli"
assert maskele("TC 12345678946 adres yok") == "TC *********46 adres yok", "TC son iki hane açık kalmalı"
assert maskele("Sipariş AM-1001 tutar 1499.90 tel 5321234567") == "Sipariş AM-1001 tutar 1499.90 tel 5321234567", "başka sayılar değişmemeli"
assert maskele("01234567890") == "01234567890", "0 ile başlayan 11 hane TC değildir"
assert maskele("kart 4543123456789012 TC 98765432110") == "kart **** **** **** 9012 TC *********10", "ikisi birlikte"
'''),
 'hints': ['Kavram: re.sub ile yakalama grubunu (\\1) koruyarak değiştirme.', 'Kart: r"\\b\\d{4}[ -]?\\d{4}[ -]?\\d{4}[ -]?(\\d{4})\\b"; TC: r"\\b[1-9]\\d{8}(\\d{2})\\b"', 'Sıra önemli: kartı önce maskele, yoksa 16 hanenin içinden 11 hane eşleşmez ama kartın kendisi \\b sınırları sayesinde TC sanılmaz; yine de kartı önce almak güvenlidir.'],
 'why': '\\b sınırları desenin daha uzun bir sayının ortasında eşleşmesini önler; bu sayede 16 haneli kartın içindeki 11 hane TC sanılmaz ve 10 haneli telefon iki desene de uymaz. Yakalama grubu son haneleri korur.'},
{'t': 'code', 'stage': 'Rehberli', 'id': 'logging-3', 'diff': 2,
 'q': '<p><code>JsonFormatter(logging.Formatter)</code> sınıfını yaz. <code>format(self, kayit)</code> şu anahtarlarla tek satırlık JSON döndürsün: <code>"seviye"</code>, <code>"logger"</code>, <code>"mesaj"</code> (argümanlarla birleşmiş hâli). Kayıtta <code>siparis_id</code> niteliği varsa (<code>extra</code> ile gelir) onu da eklesin. <code>ensure_ascii=False</code> kullan.</p>',
 'guide': ['json modülünü içe aktar, logging.Formatter\'dan türet.', 'format metodunda sözlüğü kayit.levelname, kayit.name ve kayit.getMessage() ile kur.', 'hasattr(kayit, "siparis_id") ise sözlüğe ekle.', 'json.dumps(veri, ensure_ascii=False) döndür.'],
 'example': C('''
import logging, sys

class KisaFormatter(logging.Formatter):
    def format(self, kayit):
        return kayit.levelname[0] + ": " + kayit.getMessage()

lg = logging.getLogger("ornek.kisa")
lg.handlers.clear(); lg.propagate = False; lg.setLevel(logging.INFO)
h = logging.StreamHandler(sys.stdout); h.setFormatter(KisaFormatter()); lg.addHandler(h)
lg.warning("Depo %s dolu", "D3")
'''),
 'start': C('''
import logging, json

class JsonFormatter(logging.Formatter):
    def format(self, kayit):
        # TODO
        return ""
'''),
 'sol': C('''
import logging, json

class JsonFormatter(logging.Formatter):
    def format(self, kayit):
        veri = {"seviye": kayit.levelname, "logger": kayit.name, "mesaj": kayit.getMessage()}
        if hasattr(kayit, "siparis_id"):
            veri["siparis_id"] = kayit.siparis_id
        return json.dumps(veri, ensure_ascii=False)
'''),
 'tests': CAPTURE + C('''
import json
def senaryo():
    lg = logging.getLogger("anadolu.json.t")
    lg.handlers.clear(); lg.propagate = False; lg.setLevel(logging.INFO)
    h = logging.StreamHandler(sys.stdout); h.setFormatter(JsonFormatter()); lg.addHandler(h)
    lg.info("Sipariş %s onaylandı", "AM-7", extra={"siparis_id": "AM-7"})
    lg.warning("Stok düşük")
satirlar = yakala(senaryo).strip().split("\\n")
assert len(satirlar) == 2, f"iki JSON satırı bekleniyordu: {satirlar}"
assert json.loads(satirlar[0]) == {"seviye": "INFO", "logger": "anadolu.json.t", "mesaj": "Sipariş AM-7 onaylandı", "siparis_id": "AM-7"}, satirlar[0]
assert json.loads(satirlar[1]) == {"seviye": "WARNING", "logger": "anadolu.json.t", "mesaj": "Stok düşük"}, "extra yoksa siparis_id olmamalı"
assert "Sipariş" in satirlar[0], "ensure_ascii=False ile Türkçe karakterler korunmalı"
'''),
 'hints': ['Kavram: Formatter.format metodunu ezmek.', 'veri = {"seviye": kayit.levelname, "logger": kayit.name, "mesaj": kayit.getMessage()}', 'if hasattr(kayit, "siparis_id"): veri["siparis_id"] = kayit.siparis_id'],
 'why': 'extra sözlüğündeki anahtarlar LogRecord\'a nitelik olarak eklenir; formatter bunları hasattr ile bulur. getMessage(), "%s" yer tutucularını argümanlarla birleştirir; kayit.msg tek başına birleşmemiş şablondur.'},
]
ex += [
{'t': 'code', 'stage': 'Kendin yaz', 'id': 'logging-4', 'diff': 2,
 'q': '<p><code>MaskeFiltresi(logging.Filter)</code> yaz: <code>filter</code> metodu kaydın birleşmiş mesajını verilen <code>maskele</code> fonksiyonundan geçirip <code>kayit.msg</code>\'ye yazsın, <code>kayit.args</code>\'ı boş demet yapsın ve True döndürsün. Sonra <code>guvenli_logger(ad)</code> yaz: stdout\'a <code>"%(levelname)s %(message)s"</code> biçimiyle yazan, handler\'ına bu filtre eklenmiş, seviyesi INFO, propagate False, önceki handler\'ları temizlenmiş logger döndürsün.</p>',
 'start': C('''
import logging, sys, re

KART = re.compile(r"\\b\\d{4}[ -]?\\d{4}[ -]?\\d{4}[ -]?(\\d{4})\\b")
TC = re.compile(r"\\b[1-9]\\d{8}(\\d{2})\\b")

def maskele(metin):
    metin = KART.sub(r"**** **** **** \\1", metin)
    return TC.sub(r"*********\\1", metin)


class MaskeFiltresi(logging.Filter):
    pass


def guvenli_logger(ad):
    pass
'''),
 'sol': C('''
import logging, sys, re

KART = re.compile(r"\\b\\d{4}[ -]?\\d{4}[ -]?\\d{4}[ -]?(\\d{4})\\b")
TC = re.compile(r"\\b[1-9]\\d{8}(\\d{2})\\b")

def maskele(metin):
    metin = KART.sub(r"**** **** **** \\1", metin)
    return TC.sub(r"*********\\1", metin)


class MaskeFiltresi(logging.Filter):
    def filter(self, kayit):
        kayit.msg = maskele(kayit.getMessage())
        kayit.args = ()
        return True


def guvenli_logger(ad):
    log = logging.getLogger(ad)
    log.handlers.clear()
    log.propagate = False
    log.setLevel(logging.INFO)
    h = logging.StreamHandler(sys.stdout)
    h.setFormatter(logging.Formatter("%(levelname)s %(message)s"))
    h.addFilter(MaskeFiltresi())
    log.addHandler(h)
    return log
'''),
 'tests': CAPTURE + C('''
def senaryo():
    lg = guvenli_logger("anadolu.kvkk.t")
    lg.info("Ödeme kart=%s tutar=%.2f", "4543 1234 5678 9012", 1499.9)
    lg.warning("Müşteri %s adresi eksik", 12345678946)
    lg.info("Sipariş AM-%d tamam", 1001)
cikti = yakala(senaryo)
beklenen = "INFO Ödeme kart=**** **** **** 9012 tutar=1499.90\\nWARNING Müşteri *********46 adresi eksik\\nINFO Sipariş AM-1001 tamam\\n"
assert cikti == beklenen, f"maskelenmiş çıktı farklı:\\n{cikti}"
lg = logging.getLogger("anadolu.kvkk.t")
assert len(lg.handlers) == 1 and any(isinstance(f, MaskeFiltresi) for f in lg.handlers[0].filters), "filtre handler'a eklenmeli"
'''),
 'hints': ['Argümanlar ayrı durur; önce kayit.getMessage() ile birleştir, sonra maskele.', 'Birleşmiş mesajı msg\'ye yazdıktan sonra args = () yapmazsan formatter tekrar % uygulamaya çalışır.', 'h.addFilter(MaskeFiltresi())'],
 'why': 'Hassas veri çoğunlukla argümanlarda gelir (log.info("kart=%s", kart)); bu yüzden yalnız msg\'yi maskelemek yetmez, önce getMessage ile birleştirilir. args boşaltılmazsa formatter birleşmiş metne yeniden % uygular ve "%" içeren mesajlarda hata çıkar.'},
{'t': 'code', 'stage': 'Kendin yaz', 'id': 'logging-5', 'diff': 2,
 'q': '<p><code>AYAR</code> adında bir <code>dictConfig</code> sözlüğü yaz:</p><ul><li><code>version: 1</code>, mevcut logger\'ları kapatmasın.</li><li><code>"sade"</code> adlı formatter: <code>"%(levelname)s:%(name)s:%(message)s"</code></li><li><code>"ekran"</code> handler\'ı: <code>logging.StreamHandler</code>, akış <code>"ext://sys.stdout"</code>, formatter sade, seviye <code>"INFO"</code></li><li><code>"anadolu.stok"</code> logger\'ı: handler ekran, seviye <code>"DEBUG"</code>, propagate False</li></ul><p>Testler <code>logging.config.dictConfig(AYAR)</code> çağırır.</p>',
 'start': C('''
import logging.config

AYAR = {
    "version": 1,
}
'''),
 'sol': C('''
import logging.config

AYAR = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {"sade": {"format": "%(levelname)s:%(name)s:%(message)s"}},
    "handlers": {
        "ekran": {
            "class": "logging.StreamHandler",
            "stream": "ext://sys.stdout",
            "formatter": "sade",
            "level": "INFO",
        }
    },
    "loggers": {
        "anadolu.stok": {"handlers": ["ekran"], "level": "DEBUG", "propagate": False}
    },
}
'''),
 'tests': CAPTURE + C('''
import logging.config
onceki = logging.getLogger("anadolu.onceden.t")
def senaryo():
    logging.config.dictConfig(AYAR)
    lg = logging.getLogger("anadolu.stok")
    lg.debug("ayrıntı")
    lg.info("Sayım başladı")
    logging.getLogger("anadolu.stok.depo").warning("Raf %s boş", "A3")
cikti = yakala(senaryo)
assert cikti == "INFO:anadolu.stok:Sayım başladı\\nWARNING:anadolu.stok.depo:Raf A3 boş\\n", f"çıktı farklı: {cikti!r}"
assert onceki.disabled is False, "disable_existing_loggers False olmalı: önceden oluşmuş logger'lar kapanmamalı"
assert logging.getLogger("anadolu.stok").propagate is False, "propagate False olmalı"
'''),
 'hints': ['Dört üst anahtar: version, disable_existing_loggers, formatters, handlers, loggers.', 'Handler sözlüğü: {"class": "logging.StreamHandler", "stream": "ext://sys.stdout", "formatter": "sade", "level": "INFO"}'],
 'why': 'dictConfig yapılandırmayı veriye dönüştürür; aynı sözlük JSON/YAML dosyasından da okunabilir. Handler seviyesi INFO olduğu için logger DEBUG olsa bile ayrıntı satırı ekrana çıkmaz. Alt logger anadolu.stok.depo kendi handler\'ı olmadan yayılımla ekrana yazar.'},
{'t': 'code', 'stage': 'Kendin yaz', 'id': 'logging-6', 'diff': 2,
 'q': '<p><code>guvenli_bol(a, b, log)</code> fonksiyonunu yaz: <code>round(a / b, 2)</code> döndürsün. Sıfıra bölmede <code>log.exception("Bölme hatası: %s/%s", a, b)</code> ile traceback\'li kayıt bırakıp <code>None</code> döndürsün. Sayı olmayan girdide (<code>TypeError</code>) <code>log.error("Geçersiz girdi: %r, %r", a, b)</code> yazıp <code>None</code> döndürsün (traceback olmadan).</p>',
 'start': C('''
def guvenli_bol(a, b, log):
    return round(a / b, 2)
'''),
 'sol': C('''
def guvenli_bol(a, b, log):
    try:
        return round(a / b, 2)
    except ZeroDivisionError:
        log.exception("Bölme hatası: %s/%s", a, b)
        return None
    except TypeError:
        log.error("Geçersiz girdi: %r, %r", a, b)
        return None
'''),
 'tests': C('''
import logging
class ListeHandler(logging.Handler):
    def __init__(self):
        super().__init__()
        self.kayitlar = []
    def emit(self, kayit):
        self.kayitlar.append(kayit)
lg = logging.getLogger("anadolu.bol.t")
lg.handlers.clear(); lg.propagate = False; lg.setLevel(logging.DEBUG)
h = ListeHandler(); lg.addHandler(h)
assert guvenli_bol(10, 4, lg) == 2.5 and h.kayitlar == [], "normal bölme log yazmamalı"
assert guvenli_bol(10, 0, lg) is None, "sıfıra bölme None döndürmeli"
k = h.kayitlar[-1]
assert k.levelname == "ERROR" and k.getMessage() == "Bölme hatası: 10/0", f"exception kaydı yanlış: {k.levelname} {k.getMessage()}"
assert k.exc_info and k.exc_info[0] is ZeroDivisionError, "exception() traceback (exc_info) eklemeli"
assert guvenli_bol("10", 2, lg) is None, "TypeError None döndürmeli"
k2 = h.kayitlar[-1]
assert k2.getMessage() == "Geçersiz girdi: '10', 2" and not k2.exc_info, "TypeError için traceback'siz error kaydı"
'''),
 'hints': ['İki ayrı except bloğu yaz.', 'exception() yalnız except içinde anlamlıdır ve exc_info\'yu otomatik ekler; error() eklemez.'],
 'why': 'logger.exception = logger.error + exc_info=True. Beklenmedik hatalarda traceback hayat kurtarır; kullanıcı girdisi gibi beklenen hatalarda ise kısa bir error satırı yeterlidir ve logları şişirmez.'},
]
ex += [
{'t': 'code', 'stage': 'Hata avı', 'kind': 'bug', 'id': 'logging-7', 'diff': 2,
 'q': '<p>Lojistik servisinde her log satırı iki, üç, dört kez basılıyor. <code>get_logger</code> her modülde çağrılıyor. Hatayı bul ve düzelt: aynı adla kaç kez çağrılırsa çağrılsın logger tek handler taşımalı ve her mesaj bir kez basılmalı.</p>',
 'start': C('''
import logging, sys

def get_logger(ad):
    log = logging.getLogger(ad)
    log.propagate = False
    log.setLevel(logging.INFO)
    h = logging.StreamHandler(sys.stdout)
    h.setFormatter(logging.Formatter("%(levelname)s %(message)s"))
    log.addHandler(h)
    return log
'''),
 'sol': C('''
import logging, sys

def get_logger(ad):
    log = logging.getLogger(ad)
    log.propagate = False
    log.setLevel(logging.INFO)
    if not log.handlers:
        h = logging.StreamHandler(sys.stdout)
        h.setFormatter(logging.Formatter("%(levelname)s %(message)s"))
        log.addHandler(h)
    return log
'''),
 'tests': CAPTURE + C('''
logging.getLogger("lojistik.t").handlers.clear()
def senaryo():
    get_logger("lojistik.t")
    get_logger("lojistik.t")
    get_logger("lojistik.t").info("Araç yola çıktı")
cikti = yakala(senaryo)
assert cikti == "INFO Araç yola çıktı\\n", f"mesaj bir kez basılmalı, gelen: {cikti!r}"
assert len(logging.getLogger("lojistik.t").handlers) == 1, "tek handler kalmalı"
'''),
 'hints': ['getLogger aynı adla her zaman AYNI nesneyi döndürür.', 'Handler eklemeden önce if not log.handlers: kontrolü yap.'],
 'why': 'logging.getLogger tekil (singleton) nesne döndürür; her çağrıda yeni handler eklemek aynı kaydın her handler\'dan bir kez basılmasına yol açar. "Yoksa ekle" kontrolü fonksiyonu tekrar çağrılabilir yapar.'},
{'t': 'code', 'stage': 'Hata avı', 'kind': 'bug', 'id': 'logging-8', 'diff': 2,
 'q': '<p>Sağlık randevu sistemindeki geliştirici INFO loglarının neden görünmediğini anlamadı; handler seviyesini INFO yaptı ama yine olmadı. Üstelik hasta TC\'si logda açık görünüyor. İki hatayı da düzelt: <code>randevu_logla(log_adi, hasta_tc, saat)</code> mesajı <code>INFO Randevu oluşturuldu: *********46 09:30</code> biçiminde basmalı (TC\'nin son 2 hanesi açık).</p>',
 'start': C('''
import logging, sys

def randevu_logla(log_adi, hasta_tc, saat):
    log = logging.getLogger(log_adi)
    log.handlers.clear()
    log.propagate = False
    h = logging.StreamHandler(sys.stdout)
    h.setLevel(logging.INFO)
    h.setFormatter(logging.Formatter("%(levelname)s %(message)s"))
    log.addHandler(h)
    log.info("Randevu oluşturuldu: %s %s", hasta_tc, saat)
'''),
 'sol': C('''
import logging, sys

def randevu_logla(log_adi, hasta_tc, saat):
    log = logging.getLogger(log_adi)
    log.handlers.clear()
    log.propagate = False
    log.setLevel(logging.INFO)
    h = logging.StreamHandler(sys.stdout)
    h.setLevel(logging.INFO)
    h.setFormatter(logging.Formatter("%(levelname)s %(message)s"))
    log.addHandler(h)
    maskeli = "*" * 9 + str(hasta_tc)[-2:]
    log.info("Randevu oluşturuldu: %s %s", maskeli, saat)
'''),
 'tests': CAPTURE + C('''
logging.getLogger("saglik.t").setLevel(logging.NOTSET)
cikti = yakala(lambda: randevu_logla("saglik.t", "12345678946", "09:30"))
assert cikti == "INFO Randevu oluşturuldu: *********46 09:30\\n", f"çıktı farklı: {cikti!r} (logger seviyesi ve maskeleme)"
assert "12345678946" not in cikti, "TC açık görünmemeli"
'''),
 'hints': ['Logger seviyesi ayarlanmamış (NOTSET) logger etkin seviyesini kökten alır: WARNING.', 'log.setLevel(logging.INFO) ekle; TC\'yi "*" * 9 + tc[-2:] ile maskele.'],
 'why': 'Handler eşiği ancak logger eşiğinden geçen kayıtlar için çalışır. Logger NOTSET kalınca kökün WARNING seviyesi geçerli olur ve INFO kaydı hiç oluşmaz. Hassas veri ise log çağrısından önce maskelenmeli (ya da bir Filter ile).'},
]
ex += [
{'t': 'code', 'stage': 'Meydan okuma', 'id': 'logging-9', 'diff': 3,
 'q': '<p><code>dosyaya_logla(yol, mesajlar, max_bayt=200, yedek=2)</code> fonksiyonunu yaz. <code>RotatingFileHandler(yol, maxBytes=max_bayt, backupCount=yedek, encoding="utf-8")</code> ile <code>"%(message)s"</code> biçiminde her mesajı INFO olarak yazsın. Bitince handler\'ı <b>kapatıp logger\'dan çıkarsın</b> ve oluşan log dosyalarının adlarını (yolun klasöründe, adı <code>os.path.basename(yol)</code> ile başlayanlar) sıralı liste olarak döndürsün. Her çağrıda benzersiz bir logger adı kullan (ör. <code>"dosya." + yol</code>) ve propagate False yap.</p>',
 'start': C('''
import logging, os
from logging.handlers import RotatingFileHandler

def dosyaya_logla(yol, mesajlar, max_bayt=200, yedek=2):
    return []
'''),
 'sol': C('''
import logging, os
from logging.handlers import RotatingFileHandler

def dosyaya_logla(yol, mesajlar, max_bayt=200, yedek=2):
    log = logging.getLogger("dosya." + yol)
    log.handlers.clear()
    log.propagate = False
    log.setLevel(logging.INFO)
    h = RotatingFileHandler(yol, maxBytes=max_bayt, backupCount=yedek, encoding="utf-8")
    h.setFormatter(logging.Formatter("%(message)s"))
    log.addHandler(h)
    try:
        for m in mesajlar:
            log.info(m)
    finally:
        h.close()
        log.removeHandler(h)
    klasor = os.path.dirname(yol) or "."
    ad = os.path.basename(yol)
    return sorted(f for f in os.listdir(klasor) if f.startswith(ad))
'''),
 'tests': C('''
import os, shutil
shutil.rmtree("log_deneme", ignore_errors=True)
os.makedirs("log_deneme")
yol = os.path.join("log_deneme", "kargo.log")
mesajlar = [f"Paket P{i:03d} sevk edildi" for i in range(30)]
dosyalar = dosyaya_logla(yol, mesajlar)
assert dosyalar == ["kargo.log", "kargo.log.1", "kargo.log.2"], f"ana dosya + 2 yedek bekleniyordu: {dosyalar}"
for f in dosyalar:
    assert os.path.getsize(os.path.join("log_deneme", f)) <= 200, f"{f} 200 baytı aşmamalı"
son = open(yol, encoding="utf-8").read().strip().split("\\n")[-1]
assert son == "Paket P029 sevk edildi", f"son mesaj ana dosyada olmalı: {son!r}"
assert not logging.getLogger("dosya." + yol).handlers, "handler logger'dan çıkarılmalı"
assert dosyaya_logla(os.path.join("log_deneme", "az.log"), ["tek satır"]) == ["az.log"], "az veride tek dosya"
shutil.rmtree("log_deneme", ignore_errors=True)
'''),
 'hints': ['Handler\'ı try/finally içinde kapat ki hata olsa da dosya serbest kalsın.', 'Dosya listesi: klasor = os.path.dirname(yol) or "."; sorted(f for f in os.listdir(klasor) if f.startswith(os.path.basename(yol)))'],
 'why': 'RotatingFileHandler yazmadan önce yeni kaydın dosyayı max_bayt\'ın üstüne çıkarıp çıkarmayacağına bakar; çıkaracaksa dosyaları kaydırır (kargo.log → .1 → .2) ve en eskiyi siler. Bu yüzden disk kullanımı (yedek + 1) * max_bayt ile sınırlı kalır. close + removeHandler testlerde ve kısa betiklerde dosya sızıntısını önler.'},
{'t': 'code', 'stage': 'Meydan okuma', 'id': 'logging-10', 'diff': 3,
 'q': '<p>Alarm sistemi: <code>SayacHandler(logging.Handler)</code> yaz.</p><ul><li><code>__init__(self, esik, alarm)</code>: <code>esik</code> ERROR (ve üstü) kayıt sayısı, <code>alarm</code> bir callback. <code>super().__init__()</code> çağırmayı unutma.</li><li><code>emit(kayit)</code>: seviye adına göre sayaç tutsun (<code>collections.Counter</code>). ERROR ve CRITICAL kayıtların toplamı <b>tam olarak</b> <code>esik</code>\'e ulaştığı anda <code>alarm(son_kayit_mesaji)</code> bir kez çağrılsın (sonraki hatalarda tekrar çağrılmasın).</li><li><code>ozet()</code>: <code>{"DEBUG": n, ...}</code> yalnız görülmüş seviyelerle, sıradan <code>dict</code>.</li></ul>',
 'start': C('''
import logging
from collections import Counter

class SayacHandler(logging.Handler):
    def __init__(self, esik, alarm):
        self.esik = esik
        self.alarm = alarm
'''),
 'sol': C('''
import logging
from collections import Counter

class SayacHandler(logging.Handler):
    def __init__(self, esik, alarm):
        super().__init__()
        self.esik = esik
        self.alarm = alarm
        self.sayac = Counter()
        self._caldi = False

    def emit(self, kayit):
        self.sayac[kayit.levelname] += 1
        hata = self.sayac["ERROR"] + self.sayac["CRITICAL"]
        if not self._caldi and hata >= self.esik:
            self._caldi = True
            self.alarm(kayit.getMessage())

    def ozet(self):
        return {k: v for k, v in self.sayac.items() if v}
'''),
 'tests': C('''
alarmlar = []
lg = logging.getLogger("alarm.t")
lg.handlers.clear(); lg.propagate = False; lg.setLevel(logging.DEBUG)
h = SayacHandler(3, alarmlar.append); lg.addHandler(h)
lg.info("başladı"); lg.error("ödeme hatası %s", 1); lg.debug("ayrıntı")
lg.critical("db yok"); lg.warning("yavaş")
assert alarmlar == [], "eşiğe ulaşmadan alarm çalmamalı"
lg.error("ödeme hatası %s", 2)
assert alarmlar == ["ödeme hatası 2"], f"üçüncü hatada alarm bir kez: {alarmlar}"
lg.error("ödeme hatası %s", 3)
assert alarmlar == ["ödeme hatası 2"], "alarm tekrar çalmamalı"
assert h.ozet() == {"INFO": 1, "ERROR": 3, "DEBUG": 1, "CRITICAL": 1, "WARNING": 1}, f"özet yanlış: {h.ozet()}"
assert type(h.ozet()) is dict, "ozet düz dict döndürmeli"
'''),
 'hints': ['Handler.__init__ kilit ve filtre listesini kurar; super().__init__() çağrılmazsa handle() çalışmaz.', 'Bir kez çalma için bayrak tut: if not self._caldi and hata >= self.esik.', 'ozet: {k: v for k, v in self.sayac.items() if v}; Counter\'a olmayan anahtarla bakmak (sayac["ERROR"]) 0 döner ama sözlüğe eklemez.'],
 'why': 'Özel handler, logging boru hattının en esnek uzantı noktasıdır: kayıtları saymak, eşik aşılınca bildirim (SMS, Slack) tetiklemek ya da testte yakalamak için kullanılır. Bayrak, alarm yağmurunu (alert storm) önler.'},
]
ex += [
{'t': 'code', 'stage': 'Mini proje', 'id': 'logging-11', 'diff': 3,
 'q': '<p><b>Ilgaz Bank ödeme servisi loglaması.</b> Aşağıdakileri yaz:</p><ol><li><code>JsonFormatter</code>: <code>{"seviye", "logger", "mesaj"}</code> + kayıtta varsa <code>islem_id</code>; <code>ensure_ascii=False</code>.</li><li><code>MaskeFiltresi</code>: birleşmiş mesajda 16 haneli kartı (ayraçsız ya da boşluklu) <code>**** **** **** 1234</code> yapsın; <code>args</code>\'ı boşaltsın.</li><li><code>kur(akis)</code>: <code>"anadolu.odeme"</code> logger\'ını temizleyip (propagate False, seviye INFO) verilen <code>akis</code>\'a yazan, JsonFormatter\'lı ve MaskeFiltresi\'li tek bir handler ile kurup döndürsün.</li><li><code>odeme_al(log, islem_id, kart, tutar)</code>: kart boşluklar atılınca 16 rakam değilse <code>log.error("Geçersiz kart: %s", kart)</code> + <code>False</code>; tutar 10000\'den büyükse önce <code>log.warning("Yüksek tutar: %.2f", tutar)</code>; başarıda <code>log.info("Ödeme alındı kart=%s tutar=%.2f", kart, tutar)</code> + <code>True</code>. Tüm çağrılarda <code>extra={"islem_id": islem_id}</code>.</li></ol>',
 'start': C('''
import logging, json, re


class JsonFormatter(logging.Formatter):
    pass


class MaskeFiltresi(logging.Filter):
    pass


def kur(akis):
    pass


def odeme_al(log, islem_id, kart, tutar):
    pass
'''),
 'sol': C('''
import logging, json, re

KART = re.compile(r"\\b\\d{4} ?\\d{4} ?\\d{4} ?(\\d{4})\\b")


class JsonFormatter(logging.Formatter):
    def format(self, kayit):
        veri = {"seviye": kayit.levelname, "logger": kayit.name, "mesaj": kayit.getMessage()}
        if hasattr(kayit, "islem_id"):
            veri["islem_id"] = kayit.islem_id
        return json.dumps(veri, ensure_ascii=False)


class MaskeFiltresi(logging.Filter):
    def filter(self, kayit):
        kayit.msg = KART.sub(r"**** **** **** \\1", kayit.getMessage())
        kayit.args = ()
        return True


def kur(akis):
    log = logging.getLogger("anadolu.odeme")
    log.handlers.clear()
    log.propagate = False
    log.setLevel(logging.INFO)
    h = logging.StreamHandler(akis)
    h.setFormatter(JsonFormatter())
    h.addFilter(MaskeFiltresi())
    log.addHandler(h)
    return log


def odeme_al(log, islem_id, kart, tutar):
    ek = {"islem_id": islem_id}
    temiz = kart.replace(" ", "")
    if not (len(temiz) == 16 and temiz.isdigit()):
        log.error("Geçersiz kart: %s", kart, extra=ek)
        return False
    if tutar > 10000:
        log.warning("Yüksek tutar: %.2f", tutar, extra=ek)
    log.info("Ödeme alındı kart=%s tutar=%.2f", kart, tutar, extra=ek)
    return True
'''),
 'tests': C('''
import io, json
akis = io.StringIO()
log = kur(akis)
assert odeme_al(log, "T1", "4543 1234 5678 9012", 1499.9) is True, "geçerli ödeme True"
assert odeme_al(log, "T2", "4543123456789012", 25000) is True, "yüksek tutar da alınır"
assert odeme_al(log, "T3", "1234-56", 10) is False, "geçersiz kart False"
satirlar = [json.loads(s) for s in akis.getvalue().strip().split("\\n")]
assert satirlar == [
    {"seviye": "INFO", "logger": "anadolu.odeme", "mesaj": "Ödeme alındı kart=**** **** **** 9012 tutar=1499.90", "islem_id": "T1"},
    {"seviye": "WARNING", "logger": "anadolu.odeme", "mesaj": "Yüksek tutar: 25000.00", "islem_id": "T2"},
    {"seviye": "INFO", "logger": "anadolu.odeme", "mesaj": "Ödeme alındı kart=**** **** **** 9012 tutar=25000.00", "islem_id": "T2"},
    {"seviye": "ERROR", "logger": "anadolu.odeme", "mesaj": "Geçersiz kart: 1234-56", "islem_id": "T3"},
], f"log satırları farklı: {satirlar}"
assert "5678" not in akis.getvalue(), "kart numarasının ortası hiçbir satırda görünmemeli"
kur(akis)
assert len(logging.getLogger("anadolu.odeme").handlers) == 1, "kur tekrar çağrılınca tek handler kalmalı"
'''),
 'hints': ['Önce iki sınıfı (formatter, filtre) ayrı ayrı yaz ve dene; kur bunları birleştirir.', 'extra sözlüğünü bir değişkende tut ve her log çağrısına extra=ek olarak ver.', 'Kart deseni: r"\\b\\d{4} ?\\d{4} ?\\d{4} ?(\\d{4})\\b"; geçerlilik: kart.replace(" ", "") 16 rakam mı?'],
 'why': 'Formatter (biçim), filtre (güvenlik) ve iş kodu (ne loglanacağı) ayrı katmanlardır; iş kodu kart numarasını rahatça loglayabilir çünkü maskeleme handler düzeyinde zorunludur. JSON satırları ve islem_id, merkezi log sisteminde tek bir işlemin tüm izini tek sorguyla bulmayı sağlar.'},
]

lesson = {
 'id': 'logging', 'lv': 'orta', 'mod': 'Nesne Yönelimli Programlama', 'min': 45,
 'title': 'logging: profesyonel kayıt tutma',
 'sum': 'Seviyeleri, logger hiyerarşisini ve yayılımı, handler/formatter/filter boru hattını, dosyaya dönen log, dictConfig, JSON log, exception() ile traceback, kütüphanede NullHandler ve KVKK uyumlu TC/kart maskelemeyi öğrenirsin.',
 'goals': [
  'Logger ve handler seviyelerinin birlikte nasıl süzdüğünü açıklar, doğru seviyeyi seçebilirim.',
  'getLogger(__name__) hiyerarşisini ve propagate davranışını kullanır, tekrarlanan log satırlarını önleyebilirim.',
  'Özel Formatter (JSON), Filter (maskeleme) ve Handler (sayaç/alarm) sınıfları yazabilirim.',
  'RotatingFileHandler ve dictConfig ile üretime uygun yapılandırma kurabilirim.',
  'Kütüphane ve uygulama kodunda logging sorumluluklarını ayırır, hassas veriyi loglardan uzak tutabilirim.'
 ],
 'body': body, 'ex': ex,
 'faq': [
  {'q': 'basicConfig mi dictConfig mi?', 'a': 'Küçük betiklerde basicConfig yeterlidir. Birden çok handler, farklı modüllere farklı seviyeler ya da ortama göre değişen ayar gerekiyorsa dictConfig kullan ve sözlüğü bir JSON/YAML dosyasında tut.'},
  {'q': 'Neden aynı log satırı iki kez görünüyor?', 'a': 'Ya aynı logger\'a birden fazla handler eklenmiştir (fonksiyon her çağrıldığında addHandler) ya da hem alt logger\'da hem atasında handler vardır ve propagate True\'dur. Handler\'ları tek yerde (uygulama kökünde) tanımla.'},
  {'q': 'Zaman damgası için hangi alanı kullanmalıyım?', 'a': '%(asctime)s; biçimini Formatter(datefmt="%Y-%m-%d %H:%M:%S") ile verirsin. Sunucularda UTC kullanmak için formatter.converter = time.gmtime ayarlanır. Bu dersteki alıştırmalarda çıktı her çalıştırmada aynı olsun diye zaman koymadık.'},
  {'q': 'Log dosyaları ne kadar tutulmalı?', 'a': 'Kurumun saklama politikası ve mevzuat belirler. Teknik tarafta RotatingFileHandler (boyut) ya da TimedRotatingFileHandler (gün) ile sınır koyarsın; uzun saklama genellikle merkezi log sisteminde yapılır. Kişisel veri içeren loglar KVKK gereği amaçla sınırlı süre tutulmalıdır.'}
 ],
 'mistakes': [
  {'bad': C('''
def get_logger():
    log = logging.getLogger("app")
    log.addHandler(logging.StreamHandler())
    return log
'''), 'good': C('''
def get_logger():
    log = logging.getLogger("app")
    if not log.handlers:
        log.addHandler(logging.StreamHandler())
    return log
'''), 'why': 'getLogger aynı nesneyi döndürür; her çağrıda handler eklemek mesajları çoğaltır.'},
  {'bad': 'log.info("Kart: %s", kart_no)', 'good': 'log.info("Kart: %s", maskele(kart_no))   # ya da handler\'a MaskeFiltresi', 'why': 'Tam kart ve TC numarası loglarda açık metin olarak durmamalıdır; en güvenlisi handler düzeyinde zorunlu bir maskeleme filtresidir.'},
  {'bad': C('''
except Exception as e:
    log.error(e)
'''), 'good': C('''
except Exception:
    log.exception("Ödeme işlenemedi")
'''), 'why': 'log.error(e) yalnız mesajı yazar, traceback kaybolur; exception() hatanın nerede oluştuğunu da kaydeder.'},
  {'bad': 'logging.basicConfig(level=logging.DEBUG)   # kütüphane modülünde', 'good': 'logging.getLogger(__name__).addHandler(logging.NullHandler())', 'why': 'Kütüphane, onu kullanan uygulamanın log yapılandırmasını değiştirmemelidir; yapılandırma uygulamanın işidir.'},
  {'bad': 'h.setLevel(logging.INFO)   # logger seviyesi ayarlanmadı', 'good': 'log.setLevel(logging.INFO)\nh.setLevel(logging.INFO)', 'why': 'Logger NOTSET kalırsa etkin seviyesi kökten (WARNING) gelir ve INFO kayıtları handler\'a hiç ulaşmaz.'}
 ]
}

emit(lesson, '/home/claude/py/v2/o2/logging.js')
