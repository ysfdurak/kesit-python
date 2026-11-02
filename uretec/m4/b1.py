QS = []
def S(**k): QS.append(k)

S(id='m-346', roles=['web', 'backend'], lv='temel', topic='Dekoratörle rota kaydı', kind='kod-okuma',
q='Flask\'taki <code>@app.route</code> mantığını taklit eden küçük bir sınıf yazıldı. Çıktı nedir? Dekoratör fonksiyonu neden değiştirmeden geri döndürüyor?',
a='<p><b>Kısa cevap:</b> <code>route(\'/\')</code> önce bir <b>dekoratör üretir</b> (parametreli dekoratör); o dekoratör fonksiyonu alır, bir sözlüğe <code>(metot, yol)</code> anahtarıyla kaydeder ve <b>fonksiyonun kendisini</b> geri verir. Yani dekoratör burada fonksiyonu sarmıyor, yalnızca bir kayıt defterine yazıyor.</p><p><b>Çıktı:</b></p><ul><li><code>(200, \'Hoş geldin\')</code>: GET / kayıtlı.</li><li><code>(200, \'sepet\')</code>: <code>sepet</code> iki metot için iki ayrı anahtarla kaydedildi.</li><li><code>(404, \'bulunamadı\')</code>: DELETE için kayıt yok. Gerçek Flask burada yol var ama metot yok diye <b>405 Method Not Allowed</b> döner; bu mini sürüm iki durumu ayırt etmiyor.</li><li><code>Hoş geldin</code>: <code>return fn</code> sayesinde fonksiyon hâlâ normal bir fonksiyon; testte doğrudan çağrılabilir.</li><li><code>[\'/\', \'/sepet\', \'/sepet\']</code>: üç anahtar, iki yol.</li></ul><p><b>Neden önemli:</b> Kayıt <b>import anında</b> olur. Rotaların bulunduğu modül hiç import edilmezse rota da yoktur; Flask\'ta Blueprint\'i kaydetmeyi ya da modülü içe aktarmayı unutmak "404 ama kod orada" şikâyetinin klasik nedenidir.</p>',
code='''class MiniApp:
    def __init__(self):
        self.rotalar = {}

    def route(self, yol, methods=('GET',)):
        def kaydet(fn):
            for m in methods:
                self.rotalar[(m, yol)] = fn
            return fn
        return kaydet

    def istek(self, metot, yol):
        fn = self.rotalar.get((metot, yol))
        if fn is None:
            return 404, 'bulunamadı'
        return 200, fn()

app = MiniApp()

@app.route('/')
def anasayfa():
    return 'Hoş geldin'

@app.route('/sepet', methods=('GET', 'POST'))
def sepet():
    return 'sepet'

print(app.istek('GET', '/'))
print(app.istek('POST', '/sepet'))
print(app.istek('DELETE', '/sepet'))
print(anasayfa())
print(sorted(yol for _, yol in app.rotalar))
''',
out='''(200, 'Hoş geldin')
(200, 'sepet')
(404, 'bulunamadı')
Hoş geldin
['/', '/sepet', '/sepet']''',
follow=['Aynı yolu iki fonksiyona kaydedersen Flask ne yapar?', 'Dekoratör fonksiyonu sarsaydı functools.wraps neden gerekirdi?', 'Flask 405 ile 404\'ü nasıl ayırt eder?'],
flags=['Dekoratörün her istekte çalıştığını sanmak (yalnız tanım anında bir kez çalışır)', '<code>return fn</code> olmasa <code>anasayfa</code> adının None\'a bağlanacağını fark etmemek'],
tip='Kodu okurken "dekoratör ne zaman çalışır, neyi döndürür" sorularını sesli sor; mülakatçı tam olarak bunu dinler.')

S(id='m-347', roles=['web', 'backend'], lv='orta', topic='Rota eşleme sırası ve dönüştürücüler', kind='kod-okuma',
q='Rota şablonları (<code>/urun/&lt;int:no&gt;</code>) düzenli ifadeye derlenip <b>tanım sırasıyla</b> deneniyor. Üç isteğin çıktısı nedir? Bu davranış FastAPI ve Flask\'ta nasıl farklılaşır?',
a='<p><b>Ne yapıyor:</b> <code>derle</code>, <code>&lt;int:no&gt;</code> gibi parçaları adlandırılmış gruplara (<code>(?P&lt;no&gt;\\d+)</code>) çevirir ve her parametre için bir dönüştürücü (<code>int</code>, <code>str</code>) saklar. <code>esle</code> rotaları listedeki sırayla dener, ilk eşleşen kazanır.</p><p><b>Çıktı:</b></p><ul><li><code>ad=\'42\'</code>: <code>[^/]+</code> deseni "42"yi de kabul eder ve ilk rota o olduğu için sayısal rota hiç denenmez. Değer metin olarak kalır.</li><li><code>ad=\'kalem\'</code>: beklenen davranış.</li><li><code>404</code>: desenin sonundaki <code>$</code> ve <code>[^/]</code> sayesinde fazladan yol parçası eşleşmez.</li></ul><p><b>Çerçevelerde:</b> FastAPI (Starlette) rotaları da <b>tanım sırasıyla</b> dener; <code>/kullanici/me</code> rotasını <code>/kullanici/{id}</code>\'den sonra yazarsan "me" bir id sanılır ve tip doğrulaması 422 verir. Çözüm: özel rotayı önce tanımlamak. Flask\'ın kullandığı Werkzeug ise kuralları özgüllüğe göre sıralar; statik parçalar ve dar dönüştürücüler öne alındığı için bu sorun daha seyrek görülür.</p><p><b>Ders:</b> Yol parametresinin tipi, eşleşmenin parçasıdır; tipi sonradan çevirmek yerine desene gömmek hem doğrulamayı hem doğru rotayı seçmeyi sağlar.</p>',
code=r'''import re

DONUSTURUCU = {'int': (r'\d+', int), 'str': (r'[^/]+', str)}

def derle(sablon):
    tipler = {}
    def degistir(m):
        tip, ad = m.group(1) or 'str', m.group(2)
        desen, cevir = DONUSTURUCU[tip]
        tipler[ad] = cevir
        return f'(?P<{ad}>{desen})'
    desen = re.sub(r'<(?:(\w+):)?(\w+)>', degistir, sablon)
    return re.compile(desen + '$'), tipler

rotalar = []
def rota(sablon):
    def kaydet(fn):
        rotalar.append((*derle(sablon), fn))
        return fn
    return kaydet

@rota('/urun/<ad>')
def urun_ada_gore(ad):
    return f'ad={ad!r}'

@rota('/urun/<int:no>')
def urun_noya_gore(no):
    return f'no={no!r}'

def esle(yol):
    for desen, tipler, fn in rotalar:
        m = desen.match(yol)
        if m:
            args = {k: tipler[k](v) for k, v in m.groupdict().items()}
            return fn(**args)
    return '404'

print(esle('/urun/42'))
print(esle('/urun/kalem'))
print(esle('/urun/42/yorum'))
''',
out='''ad='42'
ad='kalem'
404''',
follow=['İki rotanın sırasını değiştirirsen çıktı nasıl değişir?', 'FastAPI\'de <code>/dosya/{yol:path}</code> ne işe yarar?', 'Rota sayısı binlere çıkarsa doğrusal arama sorun olur mu?'],
flags=['İlk isteğin <code>no=42</code> döndüreceğini söylemek', 'Eşleşme sırası ile tip doğrulamasını ayrı şeyler sanmak'],
tip='FastAPI\'deki "/users/me" tuzağını kendiliğinden anmak, gerçek proje deneyimi izlenimi verir.')

S(id='m-348', roles=['web', 'backend'], lv='temel', topic='Pydantic: tip zorlama ve doğrulama hataları', kind='kod-okuma',
q='Bir sipariş isteği Pydantic modeliyle doğrulanıyor. Çıktı nedir? Hangi değerler sessizce dönüştürülür, hangileri hata verir?',
a='<p><b>Kısa cevap:</b> Pydantic varsayılan olarak <b>esnek (lax) modda</b> çalışır: anlamı açık olan dönüşümleri yapar, veri kaybettirecek olanları reddeder.</p><p><b>İlk model:</b> <code>\'42\'</code> → <code>42</code>, <code>\'19.90\'</code> → <code>19.9</code>, <code>\'yes\'</code> → <code>True</code> dönüştürülür. <code>adet</code> verilmediği için varsayılan 1 kullanılır. Modelde olmayan <code>kupon</code> alanı <b>sessizce yok sayılır</b> (varsayılan <code>extra=\'ignore\'</code>). Çıktı: <code>urun_id=42 adet=1 fiyat=19.9 hediye=True</code> ve <code>int 1</code>.</p><p><b>İkinci model:</b> İki hata birlikte raporlanır; Pydantic ilk hatada durmaz:</p><ul><li><code>\'4a\'</code> tamsayıya çevrilemez.</li><li><code>2.5</code> kesirli olduğu için <code>int</code> alanına giremez; <code>2.0</code> olsaydı kabul edilirdi.</li></ul><p><b>Pratikte:</b> FastAPI bu hataları otomatik olarak 422 yanıtına çevirir; <code>loc</code> bilgisi istemciye hangi alanın hatalı olduğunu söyler. Bilinmeyen alanların yazım hatasını gizlemesini istemiyorsan <code>model_config = ConfigDict(extra=\'forbid\')</code>; dönüşüm istemiyorsan <code>strict=True</code> ya da <code>StrictInt</code> kullan.</p>',
code='''from pydantic import BaseModel, ValidationError

class Siparis(BaseModel):
    urun_id: int
    adet: int = 1
    fiyat: float
    hediye: bool = False

s = Siparis.model_validate({'urun_id': '42', 'fiyat': '19.90', 'hediye': 'yes', 'kupon': 'X1'})
print(s)
print(type(s.urun_id).__name__, s.adet)
try:
    Siparis.model_validate({'urun_id': '4a', 'adet': 2.5, 'fiyat': 10})
except ValidationError as e:
    print(len(e.errors()), [h['loc'] for h in e.errors()])
''',
out='''urun_id=42 adet=1 fiyat=19.9 hediye=True
int 1
2 [('urun_id',), ('adet',)]''',
follow=['<code>extra=\'forbid\'</code> ile <code>extra=\'allow\'</code> farkı nedir?', 'Para tutarı için neden <code>float</code> yerine <code>Decimal</code> seçersin?', 'Strict mod hangi durumlarda tercih edilir?'],
flags=['Pydantic\'in ilk hatada durduğunu sanmak', 'Bilinmeyen alanın hata vereceğini düşünmek', '<code>2.5</code>\'in 2\'ye yuvarlanacağını söylemek'],
tip='Kod okumada "hangi dönüşüm veri kaybettirir" ölçütünü söylemek, kuralları ezberlemekten daha ikna edicidir.')

S(id='m-349', roles=['web', 'backend'], lv='ileri', topic='Pydantic alan ve model doğrulayıcıları', kind='kod-okuma',
q='Kayıt formu için alan ve model düzeyinde doğrulayıcılar tanımlanmış. Çıktı nedir? İlk hatalı veride şifre uyuşmazlığı neden raporlanmıyor?',
a='<p><b>Sıra:</b> <code>mode=\'before\'</code> doğrulayıcı tip kontrolünden <b>önce</b> ham değeri alır: e-posta kırpılır ve küçük harfe çevrilir. Ardından tip doğrulaması, sonra varsayılan (<code>after</code>) alan doğrulayıcısı çalışır. En son <code>model_validator(mode=\'after\')</code>, tüm alanlar başarılıysa hazır nesne üzerinde çalışır.</p><p><b>Çıktı:</b></p><ul><li><code>ayse@firma.com</code>: before doğrulayıcı sayesinde temizlendi.</li><li>İlk veri: <code>(\'eposta\',) Value error, kurumsal adres gerekli</code>. Şifreler de farklı ama model doğrulayıcı <b>hiç çalışmadı</b>; çünkü alan hatası varken "after" model doğrulayıcısına hazır bir nesne yoktur.</li><li>İkinci veri: <code>() Value error, şifreler uyuşmuyor</code>. Model düzeyi hatanın <code>loc</code> değeri boş demettir; belirli bir alana bağlı değildir.</li></ul><p><b>Pratik sonuçlar:</b> Kullanıcı önce e-postayı düzeltir, sonra şifre hatasını görür; iki adımlı geri bildirim formu sinir bozucu yapabilir. Ön yüzde hata gösterirken boş <code>loc</code>\'u formun genel hata alanına bağlamak gerekir. Doğrulayıcılarda <code>ValueError</code> ya da <code>AssertionError</code> fırlatılır; <code>TypeError</code> fırlatmak doğrulama hatası yerine doğrudan istisna olarak sızar.</p>',
code='''from pydantic import BaseModel, ValidationError, field_validator, model_validator

class Kayit(BaseModel):
    eposta: str
    sifre: str
    sifre_tekrar: str

    @field_validator('eposta', mode='before')
    @classmethod
    def temizle(cls, v):
        return v.strip().lower()

    @field_validator('eposta')
    @classmethod
    def alan_adi(cls, v):
        if not v.endswith('@firma.com'):
            raise ValueError('kurumsal adres gerekli')
        return v

    @model_validator(mode='after')
    def sifreler_ayni(self):
        if self.sifre != self.sifre_tekrar:
            raise ValueError('şifreler uyuşmuyor')
        return self

k = Kayit(eposta='  Ayse@Firma.com ', sifre='a1', sifre_tekrar='a1')
print(k.eposta)
for veri in [{'eposta': 'ali@gmail.com', 'sifre': 'x', 'sifre_tekrar': 'y'},
             {'eposta': 'ali@firma.com', 'sifre': 'x', 'sifre_tekrar': 'y'}]:
    try:
        Kayit(**veri)
    except ValidationError as e:
        for h in e.errors():
            print(h['loc'], h['msg'])
''',
out='''ayse@firma.com
('eposta',) Value error, kurumsal adres gerekli
() Value error, şifreler uyuşmuyor''',
follow=['<code>mode=\'before\'</code> doğrulayıcıya sayı gelirse ne olur?', 'Model doğrulayıcı hatasını belirli bir alana nasıl bağlarsın?', '<code>mode=\'wrap\'</code> ne zaman gerekir?'],
flags=['İlk veride iki hatanın birden basılacağını söylemek', 'before ve after doğrulayıcıların sırasını karıştırmak'],
tip='Pydantic sorularında doğrulama hattının sırasını (before → tip → after → model) bir cümleyle çizmek cevabı toparlar.')

S(id='m-350', roles=['web', 'backend'], lv='ileri', topic='Bağımlılık çözümü: Depends nasıl çalışır', kind='kod-okuma',
q='FastAPI\'nin <code>Depends</code> mekanizmasının basitleştirilmiş bir taklidi. <code>inspect.signature</code> ile bağımlılıklar çözülüyor. Çıktı nedir? <code>db_oturumu</code> her istekte kaç kez çağrılır?',
a='<p><b>Nasıl çalışıyor:</b> <code>coz</code>, fonksiyonun imzasını okur. Varsayılan değeri <code>Depends</code> olan parametreler için bağımlılığı <b>özyinelemeli</b> çözer; diğer parametreleri istekten alır. <code>onbellek</code> sözlüğü istek başına bir kez oluşturulur.</p><p><b>Çıktı:</b></p><ul><li><code>ayse oturum#1 oturum#1</code>: <code>db_oturumu</code> hem <code>aktif_kullanici</code> hem <code>siparisler</code> tarafından istenmesine rağmen ilk istekte <b>bir kez</b> çağrıldı; ikinci kullanım önbellekten geldi. Böylece iki bağımlılık aynı veritabanı oturumunu (ve aynı transaction\'ı) paylaşır.</li><li><code>misafir oturum#2 oturum#2</code>: yeni istek, yeni önbellek, yeni oturum.</li><li><code>{\'db\': 2}</code>: toplam iki çağrı.</li></ul><p><b>Gerçek FastAPI\'de:</b> Aynı istek içinde önbellek varsayılan olarak açıktır (<code>Depends(fn, use_cache=False)</code> ile kapatılır). <code>yield</code> kullanan bağımlılıklar oturumu yanıt sonrası kapatır. Testlerde <code>app.dependency_overrides[db_oturumu] = sahte_db</code> ile bağımlılık değiştirilir; bu, mekanizmanın fonksiyon nesnesini anahtar olarak kullanmasından gelir; buradaki sözlük de aynı fikri gösteriyor.</p>',
code='''import inspect

class Depends:
    def __init__(self, fn):
        self.fn = fn

def coz(fn, istek, onbellek):
    kwargs = {}
    for ad, p in inspect.signature(fn).parameters.items():
        if isinstance(p.default, Depends):
            bag = p.default.fn
            if bag not in onbellek:
                onbellek[bag] = coz(bag, istek, onbellek)
            kwargs[ad] = onbellek[bag]
        else:
            kwargs[ad] = istek[ad]
    return fn(**kwargs)

sayac = {'db': 0}

def db_oturumu():
    sayac['db'] += 1
    return f"oturum#{sayac['db']}"

def aktif_kullanici(token, db=Depends(db_oturumu)):
    return {'ad': 'ayse' if token == 'gizli' else 'misafir', 'db': db}

def siparisler(kullanici=Depends(aktif_kullanici), db=Depends(db_oturumu)):
    return f"{kullanici['ad']} {kullanici['db']} {db}"

print(coz(siparisler, {'token': 'gizli'}, {}))
print(coz(siparisler, {'token': 'yanlis'}, {}))
print(sayac)
''',
out='''ayse oturum#1 oturum#1
misafir oturum#2 oturum#2
{'db': 2}''',
follow=['<code>yield</code> kullanan bir bağımlılık hata durumunda nasıl temizlik yapar?', 'dependency_overrides ile bir testi nasıl yazarsın?', 'Önbelleği kapatmak hangi durumda gerekir?'],
flags=['<code>db_oturumu</code>\'nun istek başına iki kez çağrıldığını söylemek', 'Önbelleğin istekler arasında paylaşıldığını sanmak'],
tip='"Depends bir fonksiyonu anahtar olarak tutar" cümlesi, override ve önbellek davranışını tek seferde açıklar.')

S(id='m-351', roles=['web', 'backend'], lv='temel', topic='WSGI environ ve istek gövdesi', kind='kod-okuma',
q='Çerçevesiz bir WSGI uygulaması, sahte bir <code>environ</code> sözlüğüyle çağrılıyor. İki isteğin çıktısı nedir? Flask\'taki <code>request.args</code> ve <code>request.get_json()</code> bu sözlükten nasıl üretilir?',
a='<p><b>WSGI sözleşmesi:</b> Uygulama, <code>environ</code> sözlüğü ve <code>start_response</code> fonksiyonu alan bir çağrılabilirdir; durum ve başlıkları <code>start_response</code>\'a verir, gövdeyi <b>bayt parçalarından oluşan bir yinelenebilir</b> olarak döndürür.</p><p><b>Çıktı:</b></p><ul><li><code>200 OK GET /sepet sayfa=3 adet=None</code>: <code>parse_qs</code> her anahtar için <b>liste</b> döndürür; <code>sayfa</code> iki kez verildiği için <code>[\'3\', \'4\']</code> olur ve ilk eleman alınır. Gövde boş, <code>adet</code> yok.</li><li><code>200 OK POST /sepet sayfa=1 adet=2</code>: gövde <code>wsgi.input</code> akışından tam <code>CONTENT_LENGTH</code> kadar okunup JSON\'a çevrildi.</li></ul><p><b>Çerçeve bağlantısı:</b> Flask/Werkzeug, <code>request.args</code>\'ı <code>QUERY_STRING</code>\'den, <code>request.get_json()</code>\'u <code>wsgi.input</code>\'tan aynı şekilde üretir. <code>setup_testing_defaults</code> yalnız eksik anahtarları doldurur; bu yüzden test istemcileri de özünde böyle bir sözlük kurup uygulamayı çağırır.</p><p><b>Dikkat:</b> <code>CONTENT_LENGTH</code> boş dize gelebilir (<code>or 0</code> bunu karşılar); uzunluk belirtmeden <code>read()</code> çağırmak bazı sunucularda bağlantı açık kaldığı sürece bekleyebilir.</p>',
code='''import io
import json
from urllib.parse import parse_qs
from wsgiref.util import setup_testing_defaults

def uygulama(environ, start_response):
    sorgu = parse_qs(environ['QUERY_STRING'])
    uzunluk = int(environ.get('CONTENT_LENGTH') or 0)
    govde = environ['wsgi.input'].read(uzunluk)
    veri = json.loads(govde) if govde else {}
    cevap = (f"{environ['REQUEST_METHOD']} {environ['PATH_INFO']} "
             f"sayfa={sorgu.get('sayfa', ['1'])[0]} adet={veri.get('adet')}")
    start_response('200 OK', [('Content-Type', 'text/plain; charset=utf-8')])
    return [cevap.encode('utf-8')]

def istek_at(metot, yol, sorgu='', govde=b''):
    env = {'REQUEST_METHOD': metot, 'PATH_INFO': yol, 'QUERY_STRING': sorgu,
           'CONTENT_LENGTH': str(len(govde)), 'wsgi.input': io.BytesIO(govde)}
    setup_testing_defaults(env)
    durum = []
    def start_response(status, headers):
        durum.append(status)
    parcalar = uygulama(env, start_response)
    print(durum[0], b''.join(parcalar).decode('utf-8'))

istek_at('GET', '/sepet', 'sayfa=3&sayfa=4')
istek_at('POST', '/sepet', govde=json.dumps({'adet': 2}).encode())
''',
out='''200 OK GET /sepet sayfa=3 adet=None
200 OK POST /sepet sayfa=1 adet=2''',
follow=['Gövde neden str değil bayt listesi olarak döndürülüyor?', 'HTTP başlıkları environ\'da hangi adlarla bulunur (ör. Authorization)?', 'Bu fonksiyonu Gunicorn ile nasıl çalıştırırsın?'],
flags=['<code>parse_qs</code>\'in tek değer döndürdüğünü sanmak', 'Gövdeyi str olarak döndürmenin WSGI\'de geçerli olduğunu düşünmek'],
tip='WSGI\'yi "bir sözlük ve bir geri çağırma alan fonksiyon" diye tek cümlede tanımlayabilmek, çerçevelerin altını bildiğini gösterir.')

S(id='m-352', roles=['web', 'backend'], lv='ileri', topic='ASGI arayüzü: scope, receive, send', kind='kod-okuma',
q='Ham bir ASGI uygulaması, sahte <code>receive</code> ve <code>send</code> eşyordamlarıyla test ediliyor. Çıktı nedir? Gövde neden döngüyle okunuyor?',
a='<p><b>ASGI sözleşmesi:</b> Uygulama <code>async def app(scope, receive, send)</code> biçimindedir. <code>scope</code> bağlantının sabit bilgisidir (tür, metot, yol, başlıklar); <code>receive</code> istemciden gelen <b>olayları</b>, <code>send</code> istemciye giden olayları taşır. WSGI\'deki tek çağrı yerine çift yönlü bir mesaj akışı vardır.</p><p><b>Gövde neden döngüde:</b> Büyük istek gövdeleri parça parça gelir. Her <code>http.request</code> olayında <code>more_body=True</code> ise devamı vardır. Burada <code>b\'abc\'</code> ve <code>b\'de\'</code> birleştirilir; uzunluk 5\'tir. Yalnız ilk mesajı okumak, yüklemelerde sessizce eksik veri demektir.</p><p><b>Çıktı:</b></p><ul><li><code>http.response.start 200</code>: önce durum ve başlıklar gönderilir.</li><li><code>http.response.body b\'POST /yukle 5 bayt\'</code>: sonra gövde. Başlıklar ve gövde <b>bayt</b> olmalıdır.</li></ul><p><b>Neden önemli:</b> Aynı arayüz WebSocket (<code>scope[\'type\'] == \'websocket\'</code>) ve uygulama açılış/kapanışı (<code>lifespan</code>) için de kullanılır; FastAPI\'nin <code>StreamingResponse</code>\'u gövdeyi <code>more_body=True</code> ile birden çok <code>send</code> çağrısına bölerek akıtır. ASGI ara katmanları da bu üç parametreyi sarmalayarak yazılır.</p>',
code='''import asyncio

async def uygulama(scope, receive, send):
    assert scope['type'] == 'http'
    govde = b''
    while True:
        mesaj = await receive()
        govde += mesaj.get('body', b'')
        if not mesaj.get('more_body'):
            break
    yanit = f"{scope['method']} {scope['path']} {len(govde)} bayt".encode()
    await send({'type': 'http.response.start', 'status': 200,
                'headers': [(b'content-type', b'text/plain')]})
    await send({'type': 'http.response.body', 'body': yanit})

async def test():
    parcalar = [{'type': 'http.request', 'body': b'abc', 'more_body': True},
                {'type': 'http.request', 'body': b'de', 'more_body': False}]
    async def receive():
        return parcalar.pop(0)
    gonderilen = []
    async def send(mesaj):
        gonderilen.append(mesaj)
    scope = {'type': 'http', 'method': 'POST', 'path': '/yukle', 'headers': []}
    await uygulama(scope, receive, send)
    for m in gonderilen:
        print(m['type'], m.get('status', m.get('body')))

asyncio.run(test())
''',
out='''http.response.start 200
http.response.body b'POST /yukle 5 bayt\'''',
follow=['İstemci bağlantıyı yarıda keserse <code>receive</code> ne döndürür?', 'Bu uygulamaya istek süresini ölçen bir ASGI ara katmanı nasıl eklersin?', 'lifespan olayları ne işe yarar?'],
flags=['Gövdenin tek <code>receive</code> çağrısıyla tamamen geldiğini varsaymak', 'scope ile receive arasındaki farkı açıklayamamak'],
tip='WSGI ile ASGI farkını "tek çağrı ve dönüş değeri" ile "olay akışı" karşıtlığıyla anlatmak akılda kalıcıdır.')

S(id='m-353', roles=['web', 'backend'], lv='orta', topic='Django QuerySet tembelliği ve önbelleği', kind='kavram',
q='Django\'da bir <code>QuerySet</code> veritabanına ne zaman gider? <code>len(qs)</code>, <code>qs.count()</code>, <code>if qs:</code> ve <code>qs.exists()</code> arasındaki farklar nelerdir?',
a='<p><b>Kısa cevap:</b> QuerySet <b>tembeldir</b>: <code>filter</code>, <code>exclude</code>, <code>order_by</code> yalnızca sorguyu tarif eden yeni bir nesne üretir. SQL, sonuç gerçekten gerektiğinde çalışır: yineleme, <code>list()</code>, <code>len()</code>, <code>bool()</code>, adımlı dilimleme, <code>repr</code>.</p><pre>acik = Siparis.objects.filter(durum="acik")   # sorgu yok\nif acik.exists(): ...                          # SELECT ... LIMIT 1\nfor s in acik: ...                             # tüm satırlar, sonuç önbelleğe\nlen(acik)                                      # sorgu yok: önbellekten\nacik.filter(tutar__gt=100)                     # YENİ QuerySet, önbellek yok</pre><p><b>Farklar:</b></p><ul><li><code>qs.count()</code>: <code>SELECT COUNT(*)</code>; satırları çekmez. Ama QuerySet zaten değerlendirilmişse önbellekten sayar.</li><li><code>len(qs)</code>: tüm satırları çekip Python\'da sayar; sonra satırları da kullanacaksan mantıklıdır.</li><li><code>if qs:</code> bütün sonucu yükler; yalnız varlık soruyorsan <code>exists()</code> çok daha ucuzdur.</li><li><code>qs[0]</code> ya da <code>qs.first()</code> değerlendirilmemiş QuerySet\'te her çağrıda ayrı sorgudur.</li></ul><p><b>Sık hata:</b> Aynı veriyi değişkende tutmak yerine her seferinde <code>Siparis.objects.filter(...)</code> yazmak, önbelleği hiç kullanmamak demektir. Tersine, milyonlarca satırı tek seferde yinelemek önbellek yüzünden belleği şişirir; orada <code>.iterator(chunk_size=2000)</code> kullanılır.</p>',
follow=['<code>values()</code> ve <code>values_list()</code> ne zaman tercih edilir?', 'Şablonda <code>{{ siparisler|length }}</code> sorgu sayısını nasıl etkiler?', '<code>.iterator()</code> prefetch_related ile birlikte nasıl davranır?'],
flags=['<code>filter()</code> çağrısının hemen SQL çalıştırdığını söylemek', '<code>len(qs)</code> ile <code>qs.count()</code>\'u her durumda eşdeğer saymak'],
tip='Cevabı "hangi işlem değerlendirir, hangisi önbelleği kullanır" diye iki eksende kur; örnek kodu kâğıda yazmak çok etkili olur.')

S(id='m-354', roles=['web', 'backend'], lv='ileri', topic='Vaka: Django sayfasında sorgu patlaması', kind='vaka',
q='Bir Django yönetim listesi 50 siparişi gösterirken 151 SQL sorgusu çalıştırıyor ve sayfa 3 saniyede açılıyor. Şablon her satırda <code>{{ s.musteri.ad }}</code>, <code>{{ s.kalemler.count }}</code> ve <code>{{ s.kargo.firma }}</code> yazıyor. Adım adım nasıl ele alırsın ve tekrar olmamasını nasıl güvenceye alırsın?',
a='<p><b>1. Ölç:</b> <code>django-debug-toolbar</code> ya da <code>connection.queries</code> ile sorguları gör. 151 = 1 liste + 50 × 3: her satırda üç ilişki için ayrı sorgu (N+1\'in üç katı).</p><p><b>2. İlişki türüne göre düzelt:</b></p><pre>qs = (Siparis.objects\n      .select_related("musteri", "kargo")          # FK: JOIN, ek sorgu yok\n      .annotate(kalem_sayisi=Count("kalemler"))     # COUNT için ayrı sorgu yok\n      .only("id", "tarih", "musteri__ad", "kargo__firma"))</pre><ul><li><code>musteri</code> ve <code>kargo</code> yabancı anahtar: <code>select_related</code> ile tek JOIN.</li><li><code>kalemler.count</code> için kalemleri çekmek gereksiz; <code>annotate(Count)</code> sayıyı aynı sorguda getirir. Şablonda <code>{{ s.kalem_sayisi }}</code> kullanılır. Kalemlerin kendisi gerekseydi <code>prefetch_related</code> (gerekirse <code>Prefetch(queryset=...)</code> ile filtreli) kullanırdım.</li><li><code>only</code> geniş tablolarda gereksiz sütunları atar; ama sonra listelenmeyen bir alana erişmek yeniden gizli sorgu üretir, dikkatli kullanılır.</li></ul><p>Sonuç: 1 sorgu (prefetch olsaydı 2).</p><p><b>3. Güvenceye al:</b> Görünüm için <code>self.assertNumQueries(1)</code> (pytest-django\'da <code>django_assert_num_queries</code>) testi yaz; birisi şablona yeni bir ilişki ekleyince test kırılır. Admin\'de <code>list_select_related</code> kullan. İlişki zincirini şablonda değil görünümde/servis katmanında kur.</p><p><b>Neden 3 saniye:</b> Sorgu başına birkaç milisaniye bile 151 gidiş-dönüşte birikir; veritabanı uzakta ise gecikme katlanır.</p>',
follow=['Sayfalama eklenince <code>Count</code> annotate\'i ve JOIN\'ler sayım sorgusunu nasıl etkiler?', 'İki farklı çoğa-çok ilişkiyi aynı anda <code>annotate(Count)</code> ile sayarsan ne ters gider?', 'Sorgu sayısını CI\'da genel olarak nasıl izlersin?'],
flags=['Yalnızca "önbellek ekleriz" demek', '<code>select_related</code>\'ı ters (çoğa) ilişkide kullanmayı önermek', 'Gerilemeyi önleyecek bir test önermemek'],
tip='Vakaya sayı ile başla: "151 = 1 + 50 × 3" ayrıştırması problemi anladığını hemen gösterir.')

S(id='m-355', roles=['web', 'backend'], lv='orta', topic='Middleware zinciri ve sıra', kind='kod-okuma',
q='Django tarzı iki ara katman (middleware) bir görünüm fonksiyonunu sarıyor. Çıktıyı sırasıyla yaz. "yetki: kuruldu" neden yalnız bir kez basılıyor?',
a='<p><b>Yapı:</b> Django\'da ara katman bir <b>fabrikadır</b>: <code>get_response</code> alır, bir <code>middleware(istek)</code> fonksiyonu döndürür. Zincir, listenin <b>sonundan başa</b> doğru sarılarak kurulur; böylece listedeki ilk ara katman en dışta olur.</p><p><b>Çıktı:</b></p><ul><li><code>yetki: kuruldu</code>: fabrika gövdesi <b>uygulama açılırken bir kez</b> çalışır; ağır hazırlık (ayar okuma, bağlantı) buraya konur.</li><li>İstek 1: <code>zaman: önce</code> → <code>yetki: geçti</code> → <code>görünüm çalıştı</code> → <code>zaman: sonra</code> → <code>200</code>. Soğan katmanları gibi: içeri girerken sırayla, çıkarken ters sırayla.</li><li>İstek 2: <code>zaman: önce</code> → <code>yetki: reddedildi</code> → <code>zaman: sonra</code> → <code>401</code>. Yetki katmanı <code>get_response</code>\'u çağırmadan kendi yanıtını döndürdü (kısa devre); görünüm hiç çalışmadı ama dıştaki zamanlayıcı yine de "sonra" kısmını işletti.</li></ul><p><b>Pratik sonuç:</b> <code>MIDDLEWARE</code> listesinde sıra davranışı değiştirir. Örneğin oturumu okuyan <code>AuthenticationMiddleware</code>, <code>SessionMiddleware</code>\'den sonra gelmelidir. Yanıtı değiştiren (sıkıştırma, başlık ekleme) katmanlar, kısa devre yapılan yanıtları da görür; loglama katmanını en dışa koymak reddedilen istekleri de kaydetmeyi sağlar.</p>',
code='''def zamanlayici(get_response):
    def middleware(istek):
        print('zaman: önce')
        yanit = get_response(istek)
        print('zaman: sonra')
        return yanit
    return middleware

def yetki(get_response):
    print('yetki: kuruldu')
    def middleware(istek):
        if not istek.get('kullanici'):
            print('yetki: reddedildi')
            return '401'
        print('yetki: geçti')
        return get_response(istek)
    return middleware

def gorunum(istek):
    print('görünüm çalıştı')
    return '200'

MIDDLEWARE = [zamanlayici, yetki]
handler = gorunum
for mw in reversed(MIDDLEWARE):
    handler = mw(handler)

print('--- istek 1')
print(handler({'kullanici': 'ayse'}))
print('--- istek 2')
print(handler({}))
''',
out='''yetki: kuruldu
--- istek 1
zaman: önce
yetki: geçti
görünüm çalıştı
zaman: sonra
200
--- istek 2
zaman: önce
yetki: reddedildi
zaman: sonra
401''',
follow=['Görünüm istisna fırlatırsa "zaman: sonra" basılır mı? Nasıl garantilersin?', 'Django\'da <code>process_view</code> kancası ne zaman çalışır?', 'Bu deseni FastAPI\'de nasıl yazarsın?'],
flags=['Zincirin liste sırasıyla sarıldığını ve <code>yetki</code>\'nin dışta olduğunu söylemek', 'Kısa devrede dış katmanın "sonra" kısmının çalışmayacağını sanmak'],
tip='Ara katman sorularında soğan çizimi yapıp oklarla giriş ve çıkış sırasını göstermek cevabı netleştirir.')

S(id='m-356', roles=['web'], lv='temel', topic='Jinja2 otomatik kaçış ve |safe', kind='kod-okuma',
q='Kullanıcı yorumu bir Jinja2 şablonunda üç farklı biçimde basılıyor; ortam önce <code>autoescape=False</code>, sonra <code>True</code> ile kuruluyor. Çıktı nedir? Hangisi XSS açığı bırakır?',
a='<p><b>Kısa cevap:</b> <code>autoescape=True</code> olduğunda <code>{{ }}</code> içindeki her değer HTML\'e uygun biçimde kaçırılır (<code>&lt;</code> → <code>&amp;lt;</code>, <code>&amp;</code> → <code>&amp;amp;</code>). <code>|safe</code> bu korumayı <b>bilerek kapatır</b>; <code>|e</code> ise açıkça kaçırır.</p><p><b>Çıktı:</b></p><ul><li><code>False</code> satırı: <code>&lt;p&gt;</code> ve <code>&lt;b&gt;</code> içinde betik <b>olduğu gibi</b> basılır: iki XSS açığı. Yalnız <code>|e</code> kullanılan <code>&lt;i&gt;</code> güvenlidir.</li><li><code>True</code> satırı: <code>&lt;p&gt;</code> ve <code>&lt;i&gt;</code> kaçırılmış. <code>|e</code> çift kaçırma yapmaz, çünkü sonucu "güvenli" işaretli bir dizedir. <code>&lt;b&gt;</code> içinde <code>|safe</code> yüzünden betik yine çalışır.</li></ul><p><b>Çerçevelerde:</b> Flask, yalnız <code>.html</code>, <code>.htm</code>, <code>.xml</code> uzantılı şablonlarda otomatik kaçışı açar; <code>.txt</code> ya da elle kurulan <code>Environment()</code> kapalı başlar. Bu yüzden kendi ortamını kuruyorsan <code>select_autoescape()</code> kullan. Django şablonları varsayılan olarak kaçırır; eşdeğer tuzak <code>mark_safe</code>\'tir.</p><p><b>Kural:</b> <code>|safe</code> yalnızca içeriği senin ürettiğin ya da bir HTML temizleyiciden (ör. <code>bleach</code>/<code>nh3</code>) geçmiş metinlerde kullanılır. HTML özniteliği içinde kaçış yeterlidir; ama <code>&lt;script&gt;</code> bloğu içine veri koyarken <code>|tojson</code> gerekir.</p>',
code='''from jinja2 import Environment

yorum = '<script>x()</script> & ucuz'
sablon = '<p>{{ yorum }}</p> <b>{{ yorum|safe }}</b> <i>{{ yorum|e }}</i>'
for oto in (False, True):
    env = Environment(autoescape=oto)
    print(oto, env.from_string(sablon).render(yorum=yorum))
''',
out='''False <p><script>x()</script> & ucuz</p> <b><script>x()</script> & ucuz</b> <i>&lt;script&gt;x()&lt;/script&gt; &amp; ucuz</i>
True <p>&lt;script&gt;x()&lt;/script&gt; &amp; ucuz</p> <b><script>x()</script> & ucuz</b> <i>&lt;script&gt;x()&lt;/script&gt; &amp; ucuz</i>''',
follow=['JavaScript değişkenine sunucudan veri aktarırken neden <code>|tojson</code> kullanılır?', 'Kullanıcının biçimli (kalın, bağlantı) yorum yazmasına nasıl güvenle izin verirsin?', 'Content-Security-Policy XSS\'e karşı nasıl ikinci savunma hattı olur?'],
flags=['<code>|e</code> ile autoescape birlikteyken çift kaçırma olacağını sanmak', 'Flask\'ın her şablonda otomatik kaçış yaptığını varsaymak'],
tip='"Kaçış varsayılan olmalı, istisna açıkça işaretlenmeli" ilkesini söyle; ardından |safe\'in nerede kabul edilebilir olduğunu örnekle.')

S(id='m-357', roles=['web', 'backend'], lv='orta', topic='İmzalı oturum çerezi ve hmac', kind='kod-okuma',
q='Flask\'ın oturum çerezine benzer şekilde, veri base64 ile kodlanıp HMAC ile imzalanıyor. Çıktı nedir? Saldırgan çerezi okuyabilir mi, değiştirebilir mi?',
a='<p><b>Ne yapıyor:</b> <code>imzala</code>, sözlüğü JSON\'a, sonra URL güvenli base64\'e çevirir ve sunucunun gizli anahtarıyla HMAC-SHA256 imzası ekler. <code>coz</code> imzayı yeniden hesaplar ve <code>hmac.compare_digest</code> ile karşılaştırır.</p><p><b>Çıktı:</b></p><ul><li>İlk satır, çerezin gövdesidir: <code>eyJraWQiOjcsInJvbCI6InV5ZSJ9</code>. Bu <b>şifreli değildir</b>; herkes base64\'ü çözüp <code>{"kid":7,"rol":"uye"}</code> görebilir.</li><li><code>{\'kid\': 7, \'rol\': \'uye\'}</code>: imza doğru, veri geri geldi.</li><li><code>None</code>: saldırgan rolü <code>admin</code> yapıp eski imzayı yapıştırdı; anahtarı bilmediği için doğru imzayı üretemez, değişiklik yakalanır.</li></ul><p><b>Kritik ayrıntılar:</b></p><ul><li><code>==</code> yerine <code>compare_digest</code>: sabit sürede karşılaştırır, zamanlama saldırısıyla imzanın bayt bayt tahmin edilmesini engeller.</li><li>Gizli bilgi (indirim kodu, parola özeti) çereze konmaz; yalnız kimlik ya da küçük tercihler.</li><li>İmzalı çerez sunucuda saklanmadığı için tek tek iptal edilemez; süre sınırı (Flask/itsdangerous zaman damgası ekler) ve anahtar döndürme (eski anahtarı bir süre doğrulamada kabul etme) gerekir.</li><li>Çerez <code>HttpOnly</code>, <code>Secure</code> ve <code>SameSite</code> ile gönderilmelidir.</li></ul>',
code='''import base64
import hashlib
import hmac
import json

ANAHTAR = b'cok-gizli-anahtar'

def imzala(veri):
    govde = base64.urlsafe_b64encode(json.dumps(veri, separators=(',', ':')).encode()).rstrip(b'=')
    imza = hmac.new(ANAHTAR, govde, hashlib.sha256).hexdigest()
    return govde.decode() + '.' + imza

def coz(cerez):
    govde, _, imza = cerez.rpartition('.')
    beklenen = hmac.new(ANAHTAR, govde.encode(), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(imza, beklenen):
        return None
    dolgu = '=' * (-len(govde) % 4)
    return json.loads(base64.urlsafe_b64decode(govde + dolgu))

c = imzala({'kid': 7, 'rol': 'uye'})
print(c.split('.')[0])
print(coz(c))
sahte = base64.urlsafe_b64encode(b'{"kid":7,"rol":"admin"}').rstrip(b'=').decode()
print(coz(sahte + '.' + c.split('.')[1]))
''',
out='''eyJraWQiOjcsInJvbCI6InV5ZSJ9
{'kid': 7, 'rol': 'uye'}
None''',
follow=['Sunucu tarafı oturum (Redis) ile imzalı çerez arasında nasıl seçim yaparsın?', 'Anahtar sızarsa ne olur, nasıl döndürürsün?', 'Çereze zaman damgası ekleyip süre dolumunu nasıl denetlersin?'],
flags=['İmzalı çerezin içeriğinin gizli olduğunu söylemek', 'İmza karşılaştırmasında <code>==</code> kullanmayı sorun görmemek'],
tip='"İmza bütünlüğü sağlar, gizlilik sağlamaz" cümlesi bu sorunun özüdür; cevabın başında söyle.')
