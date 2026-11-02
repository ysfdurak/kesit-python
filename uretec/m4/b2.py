QS = []
def S(**k): QS.append(k)

S(id='m-358', roles=['web', 'backend'], lv='orta', topic='Test istemcisiyle uç nokta testi', kind='tasarim',
q='Bir FastAPI (ya da Flask) servisi için uç nokta testlerini nasıl kurarsın? Veritabanı, kimlik doğrulama ve dış servis çağrıları testlerde nasıl ele alınır?',
a='<p><b>Kısa cevap:</b> Uygulamayı gerçek sunucu açmadan, süreç içinde çalışan bir <b>test istemcisiyle</b> çağırırım; bağımlılıkları testte değiştiririm ve her testi temiz bir durumdan başlatırım.</p><pre>@pytest.fixture\ndef istemci(db_oturumu):\n    app = uygulama_olustur(ayarlar="test")      # uygulama fabrikası\n    app.dependency_overrides[get_db] = lambda: db_oturumu\n    app.dependency_overrides[aktif_kullanici] = lambda: Kullanici(id=1, rol="admin")\n    with TestClient(app) as c:                   # lifespan olayları da çalışır\n        yield c\n    app.dependency_overrides.clear()\n\ndef test_siparis_olustur(istemci):\n    r = istemci.post("/siparis", json={"urun_id": 42, "adet": 2})\n    assert r.status_code == 201\n    assert r.json()["adet"] == 2</pre><ul><li><b>Uygulama fabrikası:</b> <code>create_app()</code>/<code>uygulama_olustur()</code> ayarı parametre alır; modül düzeyinde tek global uygulama testleri birbirine bağlar. Flask\'ta <code>app.test_client()</code> aynı rolü oynar.</li><li><b>Veritabanı:</b> Gerçek motorla (ör. Docker\'daki PostgreSQL) test ederim; SQLite farklı davranabilir. Her test bir transaction içinde çalışır ve sonda <b>geri alınır</b>; böylece testler sıradan bağımsız olur.</li><li><b>Kimlik:</b> Çoğu testte kullanıcı bağımlılığını override ederim; token doğrulamanın kendisini ayrı birkaç testle (geçersiz imza, süresi dolmuş token → 401) sınarım.</li><li><b>Dış servisler:</b> Ağ çağrısı yapan istemciyi bağımlılık olarak enjekte edip sahtesini veririm ya da <code>respx</code>/<code>responses</code> ile HTTP katmanını taklit ederim. Testte gerçek ağa çıkmak yavaş ve kırılgandır.</li><li><b>Kapsam:</b> Mutlu yolun yanında 422 (doğrulama), 404, yetkisiz erişim ve sorgu sayısı testleri.</li></ul>',
follow=['Async uç noktaları test etmek için <code>httpx.AsyncClient</code> ne zaman gerekir?', 'Testler paralel (<code>pytest-xdist</code>) koşunca veritabanını nasıl ayırırsın?', 'Sözleşme testi (contract test) uç nokta testinden nasıl ayrılır?'],
flags=['Testleri ortak, kalıcı bir geliştirme veritabanına karşı çalıştırmak', 'Override\'ları temizlememek ve testler arası sızıntıya yol açmak', 'Her şeyi mock\'layıp gerçek SQL\'i hiç sınamamak'],
tip='Kod örneğinde fixture, override ve tek bir assert göstermek; uzun teorik anlatımdan daha ikna edicidir.')

S(id='m-359', roles=['web', 'backend'], lv='orta', topic='Pydantic yanıt modeli ve alan gizleme', kind='kod-okuma',
q='ORM nesnesinden API yanıtı üretmek için ayrı bir çıktı modeli kullanılıyor. Üç <code>model_dump</code> çağrısının çıktısı nedir? Şifre özeti neden yanıtta yok?',
a='<p><b>Kısa cevap:</b> Çıktı modeli bir <b>beyaz listedir</b>: yalnız tanımlı alanlar okunur. <code>from_attributes=True</code>, modelin sözlük yerine nesne niteliklerinden (<code>satir.id</code>) okumasını sağlar. <code>sifre_ozeti</code> modelde olmadığı için hiç okunmaz.</p><p><b>Çıktı:</b></p><ul><li>İlk satır: dört alan; <code>kayit_kanali</code> nesnede olmadığı için varsayılan <code>\'web\'</code> alır.</li><li>İkinci satır: <code>exclude_none=True</code> değeri <code>None</code> olan <code>telefon</code>\'u atar; <code>by_alias=True</code> alanı <code>kayitKanali</code> adıyla yazar (JavaScript istemcileri için camelCase).</li><li>Üçüncü satır: <code>exclude_unset=True</code> yalnız <b>açıkça verilmiş</b> alanları bırakır. <code>telefon</code> nesnede vardı (değeri <code>None</code> olsa da) bu yüzden kalır; <code>kayit_kanali</code> varsayılandan geldiği için düşer.</li></ul><p><b>FastAPI bağlantısı:</b> <code>response_model=KullaniciCikti</code> tam olarak bunu yapar: uç nokta ORM nesnesini döndürse bile yanıt bu modelden geçer, fazlası süzülür. Giriş ve çıkış için ayrı model (<code>KullaniciOlustur</code>, <code>KullaniciCikti</code>) kullanmak, veritabanına eklenen yeni bir gizli sütunun yanlışlıkla API\'ye sızmasını engeller.</p><p><b>exclude_unset ne işe yarar:</b> PATCH isteklerinde yalnız istemcinin gönderdiği alanları güncellemek için kullanılır; "gönderilmedi" ile "None gönderildi" ayrımını korur.</p>',
code='''from pydantic import BaseModel, ConfigDict, Field

class KullaniciSatiri:
    def __init__(self):
        self.id = 7
        self.eposta = 'ayse@firma.com'
        self.sifre_ozeti = 'pbkdf2$600000$...'
        self.telefon = None

class KullaniciCikti(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    eposta: str
    telefon: str | None = None
    kayit_kanali: str = Field(default='web', serialization_alias='kayitKanali')

c = KullaniciCikti.model_validate(KullaniciSatiri())
print(c.model_dump())
print(c.model_dump(exclude_none=True, by_alias=True))
print(c.model_dump(exclude_unset=True))
''',
out='''{'id': 7, 'eposta': 'ayse@firma.com', 'telefon': None, 'kayit_kanali': 'web'}
{'id': 7, 'eposta': 'ayse@firma.com', 'kayitKanali': 'web'}
{'id': 7, 'eposta': 'ayse@firma.com', 'telefon': None}''',
follow=['PATCH uç noktasını <code>exclude_unset</code> ile nasıl yazarsın?', 'Aynı modelde hem giriş hem çıkış için farklı alias nasıl tanımlanır?', 'Hesaplanan bir alanı (ör. tam ad) yanıta nasıl eklersin?'],
flags=['<code>exclude_unset</code> ile <code>exclude_none</code>\'u aynı şey sanmak', 'Hassas alanı gizlemek için yalnız ön yüze güvenmek'],
tip='"Çıktı modeli beyaz listedir" demek, güvenlik farkındalığını tek cümlede gösterir.')

S(id='m-360', roles=['web', 'backend'], lv='orta', topic='Yüklenen dosya adı ve yol geçişi', kind='kod-okuma',
q='Kullanıcının yüklediği dosya, istemcinin gönderdiği adla kaydediliyor. Saf ve güvenli iki yaklaşım beş ad için karşılaştırılıyor. Çıktı nedir?',
a='<p><b>Saf yaklaşım:</b> <code>YUKLEME / dosya_adi</code>. pathlib\'de <code>/</code> operatörü sağdaki parça <b>mutlak yolsa</b> soldakini tamamen atar; <code>..</code> parçaları da <code>resolve()</code> sonrası klasörün dışına çıkar. Bu yüzden <code>../../etc/cron.d/x</code> ve <code>/tmp/kotu.sh</code> için <code>saf_icerde=False</code>: saldırgan sunucuda istediği yere dosya yazabilir (yol geçişi, path traversal).</p><p><b>Güvenli yaklaşım:</b> Ters eğik çizgiler normalleştirilir, yalnız son parça (<code>.name</code>) alınır, nokta ile başlayan adlar reddedilir ve son olarak <code>is_relative_to</code> ile hedefin gerçekten yükleme klasöründe olduğu doğrulanır.</p><ul><li><code>fatura.pdf</code> → olduğu gibi.</li><li>Yol içerenler → yalnız <code>x</code>, <code>kotu.sh</code>, <code>boot.ini</code>.</li><li><code>..\\..\\boot.ini</code>: Linux\'ta ters eğik çizgi ayraç değildir, saf yol "içeride" görünür; ama aynı kod Windows sunucuda klasörden kaçar. Normalleştirme iki platformu da kapsar.</li><li><code>.htaccess</code> → reddedildi; gizli/yapılandırma dosyaları web sunucusunun davranışını değiştirebilir.</li></ul><p><b>Üretimde daha iyisi:</b> İstemcinin adını hiç kullanmamak: dosyayı <code>uuid4().hex</code> gibi kendi ürettiğin adla sakla, özgün adı veritabanında tut. Werkzeug\'ün <code>secure_filename</code> fonksiyonu da benzer temizlik yapar. Ayrıca boyut sınırı, uzantı/içerik türü beyaz listesi ve yüklemeleri web kökünün dışında saklamak gerekir.</p>',
code='''import tempfile
from pathlib import Path, PurePosixPath

YUKLEME = Path(tempfile.mkdtemp()) / 'yuklemeler'
YUKLEME.mkdir()

def saf_hedef(dosya_adi):
    return YUKLEME / dosya_adi

def guvenli_hedef(dosya_adi):
    ad = PurePosixPath(dosya_adi.replace('\\\\', '/')).name
    if not ad or ad.startswith('.'):
        raise ValueError('geçersiz ad')
    hedef = (YUKLEME / ad).resolve()
    if not hedef.is_relative_to(YUKLEME.resolve()):
        raise ValueError('klasör dışı')
    return hedef

for ad in ['fatura.pdf', '../../etc/cron.d/x', '/tmp/kotu.sh', '..\\\\..\\\\boot.ini', '.htaccess']:
    saf = saf_hedef(ad).resolve()
    try:
        g = guvenli_hedef(ad).name
    except ValueError as e:
        g = f'RED ({e})'
    print(f'{ad:20} saf_icerde={str(saf.is_relative_to(YUKLEME.resolve())):5} guvenli={g}')
''',
out='''fatura.pdf           saf_icerde=True  guvenli=fatura.pdf
../../etc/cron.d/x   saf_icerde=False guvenli=x
/tmp/kotu.sh         saf_icerde=False guvenli=kotu.sh
..\\..\\boot.ini       saf_icerde=True  guvenli=boot.ini
.htaccess            saf_icerde=True  guvenli=RED (geçersiz ad)''',
follow=['Yüklenen dosyanın gerçekten PDF olduğunu nasıl doğrularsın?', 'Zip arşivi yüklemelerinde aynı sorun nasıl ortaya çıkar?', 'Büyük dosyaları belleğe almadan nasıl kaydedersin?'],
flags=['<code>Path / "/tmp/x"</code> işleminin klasörün içinde kalacağını sanmak', 'Yalnız uzantı kontrolünü yeterli görmek'],
tip='Kod okuduktan sonra "istemcinin adını hiç kullanmam" önerisiyle bitirmek, savunmayı kökten düşündüğünü gösterir.')

S(id='m-361', roles=['backend', 'web'], lv='ileri', topic='asyncio görev iptali ve temizlik', kind='kod-okuma',
q='Bir rapor görevi <code>wait_for</code> ile zaman aşımına uğruyor, ikinci bir görev ise iptali yutuyor. Çıktı nedir? <code>CancelledError</code>\'ı yakalayıp yeniden fırlatmamak neden tehlikelidir?',
a='<p><b>Mekanizma:</b> <code>task.cancel()</code> görevi hemen durdurmaz; görevin beklediği <code>await</code> noktasına <code>CancelledError</code> <b>enjekte eder</b>. Görev bu istisnayla temizlik yapabilir.</p><p><b>Çıktı:</b></p><ul><li><code>A: başladı</code>, sonra 0,05 sn içinde bitmediği için <code>wait_for</code> görevi iptal eder: <code>A: iptal edildi, temizlik yapılıyor</code>, ardından <code>finally</code>: <code>A: bağlantı kapatıldı</code>. <code>wait_for</code>, görevin iptali tamamlanmasını bekler ve sonra <code>TimeoutError</code> fırlatır: <code>A: zaman aşımı</code>. "A: bitti" hiç basılmaz.</li><li><code>yutan</code>: istisnayı yakalar ve normal değer döndürür. Çıktı <code>yutan: iptali yuttu</code> ve <code>yutan döndü False</code>; yani iptal isteği <b>sessizce boşa düştü</b>, görev "iptal edildi" sayılmıyor.</li></ul><p><b>Neden tehlikeli:</b> Kapanışta sunucu görevleri iptal eder; iptali yutan görev kapanmayı geciktirir ya da kilitler. <code>TaskGroup</code> ve <code>asyncio.timeout()</code> iptal mekanizmasına dayanır; yutulan iptal zaman aşımını da bozar. Kural: <code>CancelledError</code> yakalanırsa temizlikten sonra <b>mutlaka</b> <code>raise</code> edilir; temizlik için çoğu zaman <code>try/finally</code> yeterlidir. <code>except Exception</code> 3.8\'den beri <code>CancelledError</code>\'ı yakalamaz (artık <code>BaseException</code> alt sınıfı); ama çıplak <code>except:</code> yakalar.</p><p><b>İlgili:</b> Asla iptal edilmemesi gereken bir işi (ör. ödeme kaydı) <code>asyncio.shield()</code> dış iptalden korur.</p>',
code='''import asyncio

async def rapor_uret(ad, sure):
    print(f'{ad}: başladı')
    try:
        await asyncio.sleep(sure)
        print(f'{ad}: bitti')
        return ad
    except asyncio.CancelledError:
        print(f'{ad}: iptal edildi, temizlik yapılıyor')
        raise
    finally:
        print(f'{ad}: bağlantı kapatıldı')

async def yutan():
    try:
        await asyncio.sleep(1)
    except asyncio.CancelledError:
        print('yutan: iptali yuttu')
    return 'yutan döndü'

async def main():
    try:
        await asyncio.wait_for(rapor_uret('A', 1), timeout=0.05)
    except TimeoutError:
        print('A: zaman aşımı')
    t = asyncio.create_task(yutan())
    await asyncio.sleep(0)
    t.cancel()
    print(await t, t.cancelled())

asyncio.run(main())
''',
out='''A: başladı
A: iptal edildi, temizlik yapılıyor
A: bağlantı kapatıldı
A: zaman aşımı
yutan: iptali yuttu
yutan döndü False''',
follow=['<code>asyncio.shield</code> ne zaman kullanılır, sınırları nelerdir?', 'TaskGroup içindeki bir görev hata verirse diğerlerine ne olur?', '<code>await asyncio.sleep(0)</code> satırı kaldırılırsa çıktı nasıl değişir?'],
flags=['<code>cancel()</code> çağrısının görevi anında öldürdüğünü sanmak', '<code>finally</code> bloğunun iptalde çalışmadığını düşünmek', 'Yutulan iptalde <code>t.cancelled()</code>\'ın True döneceğini söylemek'],
tip='Son takip sorusunu kendin cevaplayabilmek için iptalin "henüz başlamamış görevde" nasıl davrandığını da bil: görev hiç çalışmadan iptal edilir.')

S(id='m-362', roles=['backend', 'web'], lv='ileri', topic='contextvars ile istek bağlamı', kind='kod-okuma',
q='Her isteğin kimliği bir <code>ContextVar</code>\'da tutuluyor ve log satırlarına ekleniyor. İki istek eşzamanlı işleniyor. Çıktı nedir? Alt görevin yaptığı değişiklik neden üst göreve yansımıyor?',
a='<p><b>Kural:</b> asyncio her görev oluşturulurken o anki bağlamın (context) <b>kopyasını</b> alır. Görev içinde <code>set()</code> yalnız o görevin kopyasını değiştirir.</p><p><b>Çıktı ve nedenleri:</b></p><ul><li><code>gather</code> iki eşyordamı iki ayrı göreve sarar; her biri kendi kopyasında <code>istek-1</code> ve <code>istek-2</code> değerini ayarlar. Aynı global değişkeni kullanmalarına rağmen loglar karışmaz: <code>[istek-1] sorgu çalıştı</code>, <code>[istek-2] sorgu çalıştı</code>. <code>veritabani()</code> doğrudan await edildiği için (görev değil) çağıranın bağlamını görür.</li><li><code>alt_gorev</code> yeni bir görevdir; değeri <code>alt</code> yapar ve kendi logunu öyle basar. Ama bu değişiklik <b>kopyada</b> kaldığı için ebeveyn görev sonra yine <code>[istek-1] bitti</code> yazar.</li><li>Ana akış hiç <code>set</code> etmediği için varsayılan <code>-</code> görünür.</li></ul><p><b>Neden önemli:</b> İstek kimliği, kullanıcı ya da transaction gibi bilgileri her fonksiyona parametre geçirmeden taşımanın güvenli yoludur. <code>threading.local</code> async kodda işe yaramaz, çünkü tüm görevler aynı iş parçacığındadır. Starlette ara katmanlarında istek kimliği, OpenTelemetry iz bağlamı ve Werkzeug\'ün <code>request</code>/<code>g</code> nesneleri bu mekanizmaya dayanır.</p><p><b>Dikkat:</b> <code>asyncio.to_thread</code> bağlamı kopyalar, ama <code>loop.run_in_executor</code> kopyalamaz; orada <code>contextvars.copy_context().run</code> gerekir. Değeri geçici değiştirirken <code>token = var.set(x)</code> ve sonra <code>var.reset(token)</code> kullanılır.</p>',
code='''import asyncio
import contextvars

istek_id = contextvars.ContextVar('istek_id', default='-')

def log(mesaj):
    print(f'[{istek_id.get()}] {mesaj}')

async def veritabani():
    await asyncio.sleep(0)
    log('sorgu çalıştı')

async def alt_gorev():
    istek_id.set('alt')
    log('alt görev değiştirdi')

async def istek_isle(no):
    istek_id.set(f'istek-{no}')
    log('başladı')
    await veritabani()
    await asyncio.create_task(alt_gorev())
    log('bitti')

async def main():
    await asyncio.gather(istek_isle(1), istek_isle(2))
    log('ana akış')

asyncio.run(main())
''',
out='''[istek-1] başladı
[istek-2] başladı
[istek-1] sorgu çalıştı
[istek-2] sorgu çalıştı
[alt] alt görev değiştirdi
[alt] alt görev değiştirdi
[istek-1] bitti
[istek-2] bitti
[-] ana akış''',
follow=['Bu deseni bir FastAPI ara katmanında istek kimliği için nasıl kurarsın?', 'Bir logging.Filter ile ContextVar değerini her log kaydına nasıl eklersin?', 'Neden <code>threading.local</code> async kodda yanlış sonuç verir?'],
flags=['Alt görevin değişikliğinin ebeveyne geçeceğini söylemek', 'İki isteğin aynı global değişkeni ezeceğini düşünmek'],
tip='Önce "görev oluşturulurken bağlam kopyalanır" kuralını söyle; sonra her satırı bu kurala bağla.')

S(id='m-363', roles=['backend', 'web'], lv='orta', topic='dataclass mı pydantic mi', kind='kod-okuma',
q='Aynı ürün yapısı bir <code>dataclass</code> ve bir Pydantic modeliyle tanımlanıp aynı ham veriyle oluşturuluyor. Çıktı nedir? Hangisini nerede kullanırsın?',
a='<p><b>Kısa cevap:</b> <code>dataclass</code> yalnız <code>__init__</code>, <code>__repr__</code>, <code>__eq__</code> üretir; tip notasyonlarını <b>denetlemez ve dönüştürmez</b>. Pydantic çalışma anında doğrular ve dönüştürür.</p><p><b>Çıktı:</b></p><ul><li><code>\'12.5\' tuple</code>: dataclass ne verdiysen onu sakladı; <code>fiyat</code> metin, <code>etiketler</code> demet kaldı. Hata ancak ileride <code>fiyat * 1.2</code> gibi bir yerde patlar.</li><li><code>12.5 list</code>: Pydantic dönüştürdü.</li><li><code>False</code>: Pydantic\'te <code>= []</code> varsayılanı güvenlidir, her örnek kendi kopyasını alır. dataclass\'ta aynısını yazmak <code>ValueError</code> verir; bu yüzden <code>field(default_factory=list)</code> gerekir.</li><li><code>ValidationError</code>: "bedava" fiyat reddedildi (<code>ValidationError</code>, <code>ValueError</code>\'ın alt sınıfıdır).</li><li><code>bedava</code>: dataclass kabul etti.</li></ul><p><b>Seçim:</b> Sistem <b>sınırında</b> (HTTP gövdesi, JSON dosyası, ortam değişkenleri, kuyruk mesajı) güvenilmeyen veri girer: Pydantic. İç alan nesneleri, zaten doğrulanmış verinin taşındığı sıcak döngüler: <code>dataclass</code> (<code>slots=True</code>, <code>frozen=True</code> ile) daha hafif ve hızlıdır. İkisinin arasında bir köprü olarak <code>pydantic.dataclasses.dataclass</code> ya da <code>TypeAdapter</code> da vardır. Statik tip denetimi (mypy) her ikisinde de çalışır ama çalışma anı güvencesi vermez.</p>',
code='''from dataclasses import dataclass, field
from pydantic import BaseModel

@dataclass
class UrunDC:
    ad: str
    fiyat: float
    etiketler: list[str] = field(default_factory=list)

class UrunPD(BaseModel):
    ad: str
    fiyat: float
    etiketler: list[str] = []

ham = {'ad': 'Kalem', 'fiyat': '12.5', 'etiketler': ('kırtasiye',)}
d = UrunDC(**ham)
p = UrunPD(**ham)
print(repr(d.fiyat), type(d.etiketler).__name__)
print(repr(p.fiyat), type(p.etiketler).__name__)
print(UrunPD(ad='Silgi', fiyat=3).etiketler is UrunPD(ad='Defter', fiyat=9).etiketler)
try:
    UrunPD(ad='Silgi', fiyat='bedava')
except ValueError as e:
    print(type(e).__name__)
print(UrunDC(ad='Silgi', fiyat='bedava').fiyat)
''',
out='''\'12.5\' tuple
12.5 list
False
ValidationError
bedava''',
follow=['<code>__post_init__</code> ile dataclass\'a basit doğrulama nasıl eklenir?', 'Pydantic doğrulamasının maliyeti sıcak bir döngüde sorun olur mu, nasıl ölçersin?', '<code>frozen=True</code> ne kazandırır?'],
flags=['dataclass\'ın tip notasyonlarına göre dönüşüm yaptığını sanmak', 'Pydantic\'te <code>= []</code> varsayılanının paylaşılacağını söylemek'],
tip='"Sınırda Pydantic, içeride dataclass" kuralını gerekçesiyle söylemek olgun bir tasarım bakışı gösterir.')

S(id='m-364', roles=['muhendis', 'otomasyon'], lv='temel', topic='Üreteç zinciriyle akış işleme', kind='kod-okuma',
q='Okuma, temizleme ve gruplama adımları üreteçlerle zincirleniyor. Çıktıyı sırasıyla yaz. Neden "hat kuruldu" ilk satırda?',
a='<p><b>Kısa cevap:</b> Üreteçler <b>tembeldir</b>: <code>parti(temizle(oku(...)), 2)</code> satırı yalnızca üç üreteç nesnesini birbirine bağlar, hiçbir satır okunmaz. İş, <code>for</code> döngüsü ilk elemanı istediğinde başlar ve veri <b>tek tek</b> hattan çekilir.</p><p><b>Çıktı:</b></p><ul><li><code>hat kuruldu</code>: henüz hiçbir şey çalışmadı.</li><li><code>oku: \'a \'</code>, <code>oku: \'\'</code>, <code>oku: \'b\'</code>: <code>parti</code> iki eleman toplayana kadar yukarıdan çeker. Boş satır <code>temizle</code>\'de elenir, bu yüzden üçüncü okuma gerekir.</li><li><code>yaz: [\'A\', \'B\']</code>: ilk grup tamamlanınca hemen yazılır; dördüncü satır henüz okunmadı.</li><li><code>oku: \'c \'</code>, ardından kaynak bitince <code>parti</code> artan eksik grubu verir: <code>yaz: [\'C\']</code>.</li></ul><p><b>Neden önemli:</b> Bellekte aynı anda yalnız bir satır ve bir grup bulunur; 50 GB\'lık bir dosya da aynı kodla işlenir. Her adım küçük, tek işlevli ve ayrı test edilebilir. <code>parti</code>\'nin sondaki eksik grubu unutması klasik bir hatadır. Python 3.12\'de bu iş için <code>itertools.batched</code> hazır gelir.</p><p><b>Sınır:</b> Üreteç zinciri tek iş parçacığında sıralı çalışır; adımlardan biri G/Ç beklerse tüm hat bekler. Bir üreteç ikinci kez yinelenemez; yeniden okumak için hattı yeniden kurmak gerekir.</p>',
code='''def oku(satirlar):
    for s in satirlar:
        print('oku:', repr(s))
        yield s

def temizle(akis):
    for s in akis:
        s = s.strip()
        if s:
            yield s.upper()

def parti(akis, n):
    grup = []
    for s in akis:
        grup.append(s)
        if len(grup) == n:
            yield grup
            grup = []
    if grup:
        yield grup

hat = parti(temizle(oku(['a ', '', 'b', 'c '])), 2)
print('hat kuruldu')
for g in hat:
    print('yaz:', g)
''',
out='''hat kuruldu
oku: 'a '
oku: ''
oku: 'b'
yaz: ['A', 'B']
oku: 'c '
yaz: ['C']''',
follow=['Bu hatta bir adımın hata vermesi durumunda kalan satırlar ne olur?', 'Dosya okumayı <code>with open</code> ile bu zincire nasıl güvenle eklersin?', 'Aynı hattı pandas ile yazmak ne zaman daha mantıklı olur?'],
flags=['Tüm satırların önce okunup sonra işlendiğini söylemek', 'Son eksik grubun (<code>[\'C\']</code>) kaybolacağını sanmak'],
tip='Üreteç çıktısı sorularında "kim kimden çekiyor" diye sağdan sola düşün; tüketici talep ettikçe üretici çalışır.')

S(id='m-365', roles=['muhendis', 'analist'], lv='ileri', topic='Parçalı okumada parça sınırı tuzağı', kind='kod-okuma',
q='Siparişler <code>chunksize=3</code> ile okunuyor; yinelenen siparişler atılıp ortalama sepet tutarı hesaplanıyor. "Yanlış" ve "doğru" satırları ne basar? Hata nereden geliyor?',
a='<p><b>Parçalar:</b> İlk parça sipariş 1, 2, 3; ikinci parça 3 (tekrar), 4, 5. Yinelenen 3 numaralı sipariş <b>iki parçaya bölünmüş</b>.</p><p><b>Yanlış yöntem: iki ayrı hata.</b></p><ul><li><code>drop_duplicates</code> her parçada ayrı çalıştığı için parçalar arası tekrar görülmez: benzersiz sayısı 5 yerine <b>6</b>.</li><li>Parça ortalamalarının ortalaması alınıyor: (150 + 106,67) / 2 = <b>128,33</b>. Parçaların satır sayıları eşit olsa bile, tekrar atıldıktan sonra ağırlıklar değişebilir; ortalamaların ortalaması genelde yanlıştır.</li></ul><p><b>Doğru yöntem:</b> Toplam ve adet ayrı ayrı biriktirilir, sonunda bölünür (toplanabilir istatistikler). Görülen kimlikler bir kümede tutulur, sonraki parçalarda filtrelenir: 720 / 5 = <b>144.0</b>.</p><p><b>Genelleme:</b> Parça parça işlemede yalnız <b>birleştirilebilir</b> özetler güvenlidir: toplam, adet, min, maks. Ortalama = toplam/adet; varyans için toplam ve kareler toplamı (ya da Welford). Medyan ve benzersiz sayısı birleştirilemez; yaklaşık algoritmalar (t-digest, HyperLogLog) ya da veritabanı gerekir.</p><p><b>Bellek notu:</b> <code>gorulen</code> kümesi sipariş sayısıyla büyür. Çok büyük veride tekrar ayıklamayı veritabanına (<code>PRIMARY KEY</code>/<code>DISTINCT</code>) ya da kimliğe göre karma ile bölümlemeye bırakmak gerekir.</p>',
code='''import io
import pandas as pd

csv = io.StringIO('siparis_id,sube,tutar\\n1,A,100\\n2,A,300\\n3,B,50\\n3,B,50\\n4,B,70\\n5,A,200\\n')
ortalamalar, benzersiz = [], 0
toplam, adet, gorulen = 0, 0, set()
for parca in pd.read_csv(csv, chunksize=3):
    p = parca.drop_duplicates('siparis_id')
    benzersiz += len(p)
    ortalamalar.append(p['tutar'].mean())
    yeni = parca[~parca['siparis_id'].isin(gorulen)].drop_duplicates('siparis_id')
    gorulen.update(yeni['siparis_id'])
    toplam += yeni['tutar'].sum()
    adet += len(yeni)
print('yanlış:', benzersiz, round(sum(ortalamalar) / len(ortalamalar), 2))
print('doğru :', adet, round(toplam / adet, 2))
''',
out='''yanlış: 6 128.33
doğru : 5 144.0''',
follow=['Şube bazında ortalamayı parça parça nasıl doğru hesaplarsın?', 'Medyanı belleğe sığmayan veride nasıl bulursun?', 'Bu işi DuckDB ya da Polars ile yapmak neyi değiştirir?'],
flags=['Ortalamaların ortalamasını doğru saymak', 'Tekrarın parçalar arasında kalabileceğini düşünmemek'],
tip='"Hangi istatistik birleştirilebilir?" sorusunu kendin gündeme getirmek veri mühendisliği olgunluğunu gösterir.')

S(id='m-366', roles=['muhendis', 'backend'], lv='temel', topic='sqlite3: executemany ve IN listesi', kind='kod-okuma',
q='Ürünler <code>executemany</code> ile ekleniyor, sonra bir kod listesiyle <code>IN</code> sorgusu yapılıyor. Çıktı nedir? Son denemede liste neden doğrudan tek <code>?</code>\'e verilemiyor?',
a='<p><b>Parametreli sorgu:</b> Değerler SQL metnine yapıştırılmaz, sürücüye ayrı gönderilir. Bu yüzden <code>Ayşe\'nin Defteri</code> içindeki tek tırnak sorguyu bozmaz; SQL enjeksiyonu da mümkün olmaz.</p><p><b>Çıktı:</b></p><ul><li><code>eklenen: 3</code>: <code>executemany</code> aynı hazırlanmış ifadeyi her satır için çalıştırır, <code>rowcount</code> toplam etkilenen satırdır. Döngüde <code>execute</code>\'dan hızlıdır ve tek satırda yazılır.</li><li>Oluşan SQL: <code>... WHERE kod IN (?, ?) ...</code>. Yer tutucu sayısı listenin uzunluğuna göre üretildi; değerler yine parametre olarak gitti. Sonuç: <code>[(\'K1\', 40), (\'M3\', 0)]</code>.</li><li>Adlandırılmış parametre (<code>:esik</code>) sözlükle verilir: <code>[("Ayşe\'nin Defteri",), (\'Makas\',)]</code>.</li><li>Son satır: bir yer tutucu tek bir <b>skaler</b> değer alır; liste bağlanamaz ve sürücü hata verir.</li></ul><p><b>Dikkat:</b> f-string ile yalnız yer tutucu <b>iskeleti</b> üretilir, değer asla. Tablo/sütun adları parametre olamaz; onları sabit bir beyaz listeden seç. Çok uzun listelerde SQLite\'ın parametre sınırına takılmamak için geçici tabloya yazıp JOIN yapmak daha iyidir. PostgreSQL\'de (psycopg) yer tutucu <code>%s</code>\'dir ve <code>= ANY(%s)</code> ile liste tek parametre olarak verilebilir.</p>',
code='''import sqlite3

con = sqlite3.connect(':memory:')
con.execute('CREATE TABLE urun (kod TEXT PRIMARY KEY, ad TEXT, stok INTEGER)')
satirlar = [('K1', 'Kalem', 40), ('S2', "Ayşe'nin Defteri", 5), ('M3', 'Makas', 0)]
cur = con.executemany('INSERT INTO urun VALUES (?, ?, ?)', satirlar)
print('eklenen:', cur.rowcount)

aranan = ['K1', 'M3']
yer = ', '.join('?' * len(aranan))
sql = f'SELECT kod, stok FROM urun WHERE kod IN ({yer}) ORDER BY kod'
print(sql)
print(con.execute(sql, aranan).fetchall())
print(con.execute('SELECT ad FROM urun WHERE stok < :esik ORDER BY ad', {'esik': 10}).fetchall())
try:
    con.execute('SELECT * FROM urun WHERE kod IN (?)', (aranan,))
except sqlite3.Error:
    print('liste tek parametreye bağlanamaz')
''',
out='''eklenen: 3
SELECT kod, stok FROM urun WHERE kod IN (?, ?) ORDER BY kod
[('K1', 40), ('M3', 0)]
[("Ayşe'nin Defteri",), ('Makas',)]
liste tek parametreye bağlanamaz''',
follow=['executemany ile tek tek execute arasında transaction açısından ne fark var?', 'Bir milyon satırı SQLite\'a en hızlı nasıl yüklersin?', 'psycopg\'de <code>%s</code> yer tutucusunu Python\'un <code>%</code> biçimlendirmesiyle karıştırmak neden tehlikelidir?'],
flags=['IN listesini değerleri f-string ile gömerek kurmak', 'Tablo adını parametre olarak vermeye çalışmak'],
tip='IN listesi sorusu klasik bir tuzaktır; "iskeleti üret, değerleri parametre ver" cümlesi cevabın özüdür.')

S(id='m-367', roles=['muhendis', 'backend'], lv='ileri', topic='UPSERT: INSERT OR REPLACE ve ON CONFLICT', kind='kod-okuma',
q='Günlük stok paketi iki farklı yöntemle yükleniyor. Her iki tablonun son hâli nedir? <code>INSERT OR REPLACE</code> neden veri kaybettiriyor?',
a='<p><b>INSERT OR REPLACE:</b> Çakışmada satırı <b>günceller sanılır ama aslında siler ve yeniden ekler</b>. Ekleme cümlesinde verilmeyen <code>not_</code> sütunu yeni satırda NULL olur: <code>raf 3</code> ve <code>kırık kutu</code> notları kayboldu. Silme gerçek bir silme olduğu için tetikleyiciler çalışır, <code>ON DELETE CASCADE</code> varsa bağlı satırlar da gider.</p><p><b>ON CONFLICT DO UPDATE (UPSERT):</b> Yalnız belirtilen sütunlar güncellenir; <code>excluded</code>, eklenmeye çalışılan satırı ifade eder. Notlar korunur, yeni ürün C3 eklenir.</p><p><b>WHERE koşulu:</b> Geç gelen eski bir kayıt (<code>A1, 99, 2024-04-30</code>) yeni veriyi ezmesin diye güncelleme yalnız gelen tarih daha yeniyse yapılır. Bu yüzden A1 hâlâ 7. Böylece yükleme hem <b>idempotent</b> (aynı paket iki kez gelse sonuç değişmez) hem de <b>sıra bağımsız</b> olur.</p><p><b>Çıktı:</b> REPLACE tablosunda üç satırın notu <code>None</code>; UPSERT tablosunda notlar duruyor ve A1 = 7.</p><p><b>PostgreSQL\'de:</b> Sözdizimi aynıdır (<code>ON CONFLICT (sku) DO UPDATE SET ... = EXCLUDED....</code>). psycopg ile <code>executemany</code> ya da büyük hacimde geçici tabloya <code>COPY</code> sonrası tek <code>INSERT ... SELECT ... ON CONFLICT</code> kullanılır. Çakışma hedefi benzersiz bir indeks/kısıt olmalıdır.</p>',
code='''import sqlite3

def kur():
    c = sqlite3.connect(':memory:')
    c.execute('CREATE TABLE stok (sku TEXT PRIMARY KEY, adet INTEGER, guncelleme TEXT, not_ TEXT)')
    c.execute("INSERT INTO stok VALUES ('A1', 10, '2024-05-01', 'raf 3')")
    c.execute("INSERT INTO stok VALUES ('B2', 4, '2024-05-01', 'kırık kutu')")
    return c

paket = [('A1', 7, '2024-05-02'), ('B2', 9, '2024-05-02'), ('C3', 1, '2024-05-02')]

def yukle_replace(c, satirlar):
    c.executemany('INSERT OR REPLACE INTO stok (sku, adet, guncelleme) VALUES (?, ?, ?)', satirlar)

def yukle_upsert(c, satirlar):
    c.executemany("""INSERT INTO stok (sku, adet, guncelleme) VALUES (?, ?, ?)
        ON CONFLICT(sku) DO UPDATE SET adet = excluded.adet, guncelleme = excluded.guncelleme
        WHERE excluded.guncelleme > stok.guncelleme""", satirlar)

r = kur()
yukle_replace(r, paket)
print('REPLACE:', r.execute('SELECT sku, adet, not_ FROM stok ORDER BY sku').fetchall())

u = kur()
yukle_upsert(u, paket)
yukle_upsert(u, paket)
yukle_upsert(u, [('A1', 99, '2024-04-30')])
print('UPSERT :', u.execute('SELECT sku, adet, not_ FROM stok ORDER BY sku').fetchall())
''',
out='''REPLACE: [('A1', 7, None), ('B2', 9, None), ('C3', 1, None)]
UPSERT : [('A1', 7, 'raf 3'), ('B2', 9, 'kırık kutu'), ('C3', 1, None)]''',
follow=['Kaynakta silinen ürünleri hedefte nasıl yansıtırsın?', 'UPSERT ile MERGE arasındaki fark nedir?', 'Aynı paket içinde aynı sku iki kez gelirse ne olur?'],
flags=['INSERT OR REPLACE\'in yalnız verilen sütunları güncellediğini sanmak', 'Eski tarihli kaydın A1\'i 99 yapacağını söylemek'],
tip='UPSERT sorularında idempotentlik ve geç gelen veri (sıra) konularını birlikte anmak cevabı üst seviyeye taşır.')

S(id='m-368', roles=['muhendis', 'backend'], lv='orta', topic='Pydantic ile kayıt doğrulama ve karantina', kind='kod-okuma',
q='Kaynaktan gelen satış kayıtları bir veri hattında Pydantic ile doğrulanıyor; geçersizler karantinaya alınıyor. Çıktı nedir? Bu hat bu hata oranıyla devam etmeli mi?',
a='<p><b>Ne yapıyor:</b> Her kayıt ayrı doğrulanır; geçerli olan nesneye dönüşür, geçersiz olan hangi alanlarda sorun olduğu bilgisiyle karantina listesine yazılır. Tek bozuk satır bütün yüklemeyi düşürmez.</p><p><b>Çıktı:</b></p><ul><li><code>[101] 2024</code>: yalnız ilk kayıt geçerli; <code>\'101\'</code> tamsayıya, <code>\'2024-05-02\'</code> gerçek bir <code>date</code> nesnesine dönüştü.</li><li><code>(1, [\'tarih\'])</code>: <code>02.05.2024</code> ISO biçiminde değil; Pydantic gün/ay sırasını tahmin etmez. Bu iyi bir şey: <code>05.02</code> mı <code>02.05</code> mi belirsizliği sessiz veri bozulmasına yol açardı.</li><li><code>(2, [\'tutar\'])</code>: özel doğrulayıcı negatif tutarı reddetti.</li><li><code>(3, [\'il\'])</code>: zorunlu alan eksik.</li><li><code>hata oranı: 75%</code>.</li></ul><p><b>Karar:</b> Karantina tek tük bozuk satır içindir. %75 hata, kaynağın biçimini değiştirdiğini gösterir: hat <b>durmalı ve alarm vermelidir</b>. Uygulamada bir eşik konur (ör. %1\'i aşarsa <code>sys.exit(1)</code> ve bildirim). Karantina kayıtları ham hâliyle, hata bilgisi ve çalışma kimliğiyle saklanır ki düzeltip yeniden işlenebilsin.</p><p><b>Performans notu:</b> Milyonlarca satırda kayıt kayıt model oluşturmak yavaşlayabilir; <code>TypeAdapter(list[Satis])</code> toplu doğrulama yapar, sütun düzeyi kontroller için pandas/pandera daha uygundur.</p>',
code='''from datetime import date
from pydantic import BaseModel, ValidationError, field_validator

class Satis(BaseModel):
    siparis_id: int
    tarih: date
    tutar: float
    il: str

    @field_validator('tutar')
    @classmethod
    def pozitif(cls, v):
        if v <= 0:
            raise ValueError('tutar pozitif olmalı')
        return v

ham = [
    {'siparis_id': '101', 'tarih': '2024-05-02', 'tutar': '250.0', 'il': 'İzmir'},
    {'siparis_id': '102', 'tarih': '02.05.2024', 'tutar': '99', 'il': 'Bursa'},
    {'siparis_id': '103', 'tarih': '2024-05-03', 'tutar': '-5', 'il': 'Ankara'},
    {'siparis_id': '104', 'tarih': '2024-05-03', 'tutar': '40'},
]
gecerli, karantina = [], []
for i, kayit in enumerate(ham):
    try:
        gecerli.append(Satis.model_validate(kayit))
    except ValidationError as e:
        karantina.append((i, [h['loc'][0] for h in e.errors()]))
print([s.siparis_id for s in gecerli], gecerli[0].tarih.year)
for k in karantina:
    print(k)
print(f'hata oranı: {len(karantina) / len(ham):.0%}')
''',
out='''[101] 2024
(1, ['tarih'])
(2, ['tutar'])
(3, ['il'])
hata oranı: 75%''',
follow=['<code>02.05.2024</code> biçimini kabul etmek istersen bunu nerede ve nasıl yaparsın?', 'Karantinadaki kayıtları yeniden işleme sürecini nasıl tasarlarsın?', 'Şema değişikliğini (yeni sütun) bu model nasıl karşılar?'],
flags=['Pydantic\'in <code>02.05.2024</code>\'ü kendiliğinden çözeceğini sanmak', 'Yüksek hata oranında yüklemeye devam etmeyi önermek'],
tip='Kod çıktısından sonra "bu oranla hattı durdururum" kararını söylemek, yalnız kod okumayan bir mühendis olduğunu gösterir.')
