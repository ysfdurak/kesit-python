import sys; sys.path.insert(0, '/tmp/claude-0/-home-claude/6c066959-3fcb-54bb-bdf1-c8ae148dfc4c/scratchpad')
from gen import PY, CODE, emit

body = '''
<h2>Neden önemli?</h2>
<p>Flask dersinde bir web çatısının nasıl çalıştığını gördün: route kaydı, istek, yanıt, durum kodu. Ama JSON API yazarken Flask'ta işin büyük kısmı tekrar eden "bürokrasidir": gelen gövdeyi oku, her alanı elle doğrula, hatalı alanları toplayıp 400 döndür, dokümantasyonu ayrıca yaz ve kodla güncel tut. <b>FastAPI</b> bu bürokrasiyi <b>tip ipuçlarından</b> (type hints) otomatik üretir: fonksiyonunun parametrelerine yazdığın tiplere bakarak isteği ayrıştırır, pydantic ile doğrular, hatalıysa standart bir 422 yanıtı döner ve tüm API'nin etkileşimli dokümantasyonunu (<code>/docs</code>) kendisi oluşturur.</p>
<p>Bugün bankacılık, e-ticaret ve makine öğrenmesi ekiplerinde yeni Python API'lerinin büyük bölümü FastAPI ile yazılıyor. API ve web dersinde istemci tarafını ve kısa bir FastAPI örneğini, Metaprogramlama dersinde <code>inspect.signature</code>'ı, async dersinde olay döngüsünü gördün. Bu ders hepsini birleştiriyor.</p>
<div class="note"><b>Kendi bilgisayarında dene</b>FastAPI bir sunucu (uvicorn) ister ve bu sayfadaki motorda çalışmaz. Gri kutulardaki kodları kendi bilgisayarında dene. FastAPI'nin doğrulama motoru olan <b>pydantic</b> ise burada çalışır; yeşil kutularda ve alıştırmalarda FastAPI'nin arka planda yaptığını pydantic ve standart kütüphaneyle kendin kuracaksın.</div>

<h2>Kurulum ve ilk API</h2>
''' + CODE(r'''
# main.py
from fastapi import FastAPI

app = FastAPI(title="Anadolu Market API", version="1.0.0")

URUNLER = {1: {"ad": "Çay", "fiyat": 85.5, "kategori": "İçecek"},
           2: {"ad": "Kahve", "fiyat": 240.0, "kategori": "İçecek"}}

@app.get("/saglik")
def saglik():
    return {"durum": "ok"}

@app.get("/urunler/{urun_id}")
def urun_getir(urun_id: int, detay: bool = False):
    urun = URUNLER[urun_id]
    return urun if detay else {"ad": urun["ad"]}
''') + '''
<div class="steps-list"><ol>
<li>Sanal ortam kur ve etkinleştir (<code>python -m venv .venv</code>).</li>
<li>Kur: <code>pip install "fastapi[standard]"</code> (uvicorn sunucusu ve yardımcı araçlar dahil).</li>
<li>Geliştirme modunda çalıştır: <code>fastapi dev main.py</code> ya da <code>uvicorn main:app --reload</code></li>
<li><code>http://127.0.0.1:8000/urunler/1?detay=true</code> adresini aç; sonra <code>/urunler/abc</code> dene ve otomatik 422 yanıtını gör.</li>
<li><code>http://127.0.0.1:8000/docs</code> adresinde Swagger arayüzünü aç: her uç noktayı tarayıcıdan deneyebilirsin. <code>/redoc</code> alternatif görünüm, <code>/openapi.json</code> ham şemadır.</li>
</ol></div>

<h2>Tip ipuçlarının rolü: parametre nereden gelir?</h2>
<p>FastAPI parametrenin kaynağını adından ve tipinden çıkarır. Bu kuralları bilmek, "neden 422 alıyorum?" sorusunun yarısını çözer.</p>
<div class="tbl-wrap"><table>
<tr><th>Parametre</th><th>Kaynak</th><th>Örnek</th></tr>
<tr><td>Adı yol kuralında <code>{urun_id}</code> olarak geçiyor</td><td>Yol (path)</td><td><code>urun_id: int</code></td></tr>
<tr><td>Basit tip (int, str, bool, float), yolda yok</td><td>Sorgu dizesi (query)</td><td><code>detay: bool = False</code> → <code>?detay=true</code></td></tr>
<tr><td>Varsayılanı yok</td><td>Zorunlu; yoksa 422 <code>missing</code></td><td><code>sehir: str</code></td></tr>
<tr><td>pydantic <code>BaseModel</code> alt sınıfı</td><td>JSON gövde (body)</td><td><code>siparis: SiparisOlustur</code></td></tr>
<tr><td><code>Depends(...)</code> varsayılanı</td><td>Bağımlılık enjeksiyonu</td><td><code>db = Depends(get_db)</code></td></tr>
<tr><td><code>Header()</code>, <code>Cookie()</code>, <code>Form()</code>, <code>File()</code></td><td>Başlık, çerez, form, dosya</td><td><code>x_kanal: str = Header()</code></td></tr>
</table></div>
''' + CODE(r'''
from typing import Annotated
from fastapi import FastAPI, Query, Path

app = FastAPI()

@app.get("/urunler")
def urun_ara(
    q: Annotated[str | None, Query(min_length=2, max_length=50)] = None,
    sayfa: Annotated[int, Query(ge=1)] = 1,
    boyut: Annotated[int, Query(ge=1, le=100)] = 20,
    etiket: Annotated[list[str], Query()] = [],       # ?etiket=yeni&etiket=indirim
):
    return {"q": q, "sayfa": sayfa, "boyut": boyut, "etiket": etiket}

@app.get("/subeler/{kod}")
def sube(kod: Annotated[str, Path(pattern=r"^[A-Z]{3}-\d{2}$")]):
    return {"kod": kod}
''') + '''
<p><code>Annotated[tip, Query(...)]</code> hem tipi hem de ek kuralları (en az/en çok, desen) bildirir. Bu kurallar hem doğrulamada hem de <code>/docs</code> sayfasında kullanılır: dokümantasyon kodla <b>asla</b> çelişmez, çünkü ikisi aynı kaynaktan üretilir.</p>

<h2>pydantic modelleri: istek ve yanıt şeması</h2>
<p>JSON gövdeyi bir pydantic modeliyle tanımlarsın. FastAPI gövdeyi okur, modele doğrulatır ve fonksiyonuna hazır bir nesne verir. Doğrulama başarısızsa fonksiyonun <b>hiç çağrılmaz</b>; istemci tüm hataların listesini 422 ile alır. Aynı mekanizma burada çalışıyor:</p>
''' + PY(r'''
from pydantic import BaseModel, Field, ValidationError, field_validator

class SiparisKalemi(BaseModel):
    urun_id: int = Field(gt=0)
    adet: int = Field(ge=1, le=50)

class SiparisOlustur(BaseModel):
    musteri_id: int = Field(gt=0)
    sehir: str = Field(min_length=2)
    kalemler: list[SiparisKalemi] = Field(min_length=1)
    kupon: str | None = None

    @field_validator("sehir")
    @classmethod
    def sehri_duzenle(cls, v: str) -> str:
        return v.strip().title()

govde = {"musteri_id": "42", "sehir": "  izmir ", "kalemler": [{"urun_id": 1, "adet": 2}]}
s = SiparisOlustur.model_validate(govde)     # FastAPI bunu senin yerine yapar
print(s.musteri_id, type(s.musteri_id).__name__, s.sehir, s.kalemler[0].adet, s.kupon)

hatali = {"musteri_id": 0, "kalemler": [{"urun_id": 1, "adet": 99}]}
try:
    SiparisOlustur.model_validate(hatali)
except ValidationError as e:
    # FastAPI'nin 422 gövdesi: {"detail": [...]} ve konum başına "body" eklenir
    for h in e.errors():
        print(["body", *h["loc"]], h["type"])
''') + '''
<p>Dikkat: <code>"42"</code> metni int'e çevrildi. pydantic varsayılan olarak "makul" dönüşümlere izin verir (lax mode); JSON'da sayıların bazen metin gelmesi yaygındır. Kesin tip istiyorsan <code>Field(strict=True)</code> ya da <code>model_config = ConfigDict(strict=True)</code> kullanırsın. Pydantic ile doğrulama dersinde gördüğün her şey burada geçerli.</p>

<h3>Yanıt modeli: neyi döndürdüğünü kontrol et</h3>
<p>Veritabanındaki kullanıcı kaydında şifre özeti (hash) vardır; bunu API yanıtında asla göstermemelisin. <code>response_model</code> yanıtı belirtilen şemaya göre <b>filtreler</b> ve doğrular:</p>
''' + CODE(r'''
from fastapi import FastAPI, status
from pydantic import BaseModel, EmailStr

class KullaniciOlustur(BaseModel):
    eposta: EmailStr
    sifre: str

class KullaniciYanit(BaseModel):
    id: int
    eposta: EmailStr

@app.post("/kullanicilar", response_model=KullaniciYanit, status_code=status.HTTP_201_CREATED)
def kayit(veri: KullaniciOlustur):
    kayit = {"id": 7, "eposta": veri.eposta, "sifre_hash": "pbkdf2$..."}
    return kayit                     # sifre_hash yanıtta GÖRÜNMEZ
''') + PY(r'''
from pydantic import BaseModel

class KullaniciYanit(BaseModel):
    id: int
    eposta: str

db_kaydi = {"id": 7, "eposta": "ayse@ilgazbank.com.tr", "sifre_hash": "pbkdf2$9f...", "rol": "admin"}
print(KullaniciYanit.model_validate(db_kaydi).model_dump())
print(KullaniciYanit.model_json_schema()["required"])
''') + '''

<h2>Hata yönetimi: HTTPException ve durum kodları</h2>
''' + CODE(r'''
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse

class StokYetersiz(Exception):
    def __init__(self, urun):
        self.urun = urun

@app.get("/urunler/{urun_id}")
def urun_getir(urun_id: int):
    if urun_id not in URUNLER:
        raise HTTPException(status_code=404, detail="Ürün bulunamadı")
    return URUNLER[urun_id]

@app.exception_handler(StokYetersiz)
async def stok_hatasi(request: Request, hata: StokYetersiz):
    return JSONResponse(status_code=409, content={"detail": f"{hata.urun} için stok yetersiz"})
''') + '''
<div class="tbl-wrap"><table>
<tr><th>Durum</th><th>Kim üretir?</th><th>Gövde</th></tr>
<tr><td>422 Unprocessable Entity</td><td>FastAPI, doğrulama başarısız olunca otomatik</td><td><code>{"detail": [{"loc": [...], "msg": ..., "type": ...}]}</code></td></tr>
<tr><td>404 / 403 / 409</td><td>Sen, <code>raise HTTPException(...)</code> ile</td><td><code>{"detail": "Ürün bulunamadı"}</code></td></tr>
<tr><td>401 Unauthorized</td><td>Güvenlik bağımlılığı (OAuth2) ya da sen</td><td><code>{"detail": "Not authenticated"}</code> + <code>WWW-Authenticate</code> başlığı</td></tr>
<tr><td>500</td><td>Yakalanmamış istisna</td><td><code>Internal Server Error</code> (ayrıntı günlükte)</td></tr>
</table></div>
<p>Flask'ta hatalı istek için genelde 400 dönülür; FastAPI şema doğrulamasında 422 kullanır. "İstek sözdizimsel olarak doğru (geçerli JSON) ama anlamsal olarak işlenemiyor" demektir. İstemci geliştiricileri <code>detail</code> listesindeki <code>loc</code> alanından hangi alanın hatalı olduğunu görür ve formda ilgili kutuyu işaretler.</p>

<h2>Bağımlılık enjeksiyonu: Depends</h2>
<p>Birçok uç nokta aynı hazırlığa ihtiyaç duyar: veritabanı oturumu açmak, giriş yapan kullanıcıyı bulmak, sayfalama parametrelerini okumak. FastAPI'de bu ortak parçalar <b>bağımlılık</b> (dependency) olarak yazılır ve <code>Depends</code> ile parametreye bağlanır. FastAPI her istekte bağımlılığı çağırır (onun da bağımlılıkları varsa önce onları), sonucu parametreye koyar. <code>yield</code> kullanan bağımlılıklarda <code>yield</code>'dan sonraki kod yanıt gönderildikten sonra çalışır: oturumu kapatmak için ideal.</p>
''' + CODE(r'''
from typing import Annotated
from fastapi import Depends, FastAPI, Header, HTTPException
from sqlalchemy.orm import Session

def get_db():
    db = SessionLocal()           # SQLAlchemy dersindeki sessionmaker
    try:
        yield db
    finally:
        db.close()                # yanıt gittikten sonra çalışır

def aktif_kullanici(authorization: Annotated[str | None, Header()] = None,
                    db: Session = Depends(get_db)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Kimlik doğrulanamadı", headers={"WWW-Authenticate": "Bearer"})
    kullanici = token_ile_bul(db, authorization.removeprefix("Bearer "))
    if kullanici is None:
        raise HTTPException(401, "Geçersiz token")
    return kullanici

class Sayfalama:
    def __init__(self, sayfa: int = 1, boyut: int = 20):
        self.sayfa, self.boyut = sayfa, min(boyut, 100)

@app.get("/siparislerim")
def siparislerim(kullanici=Depends(aktif_kullanici),
                 db: Session = Depends(get_db),           # aynı istekte get_db bir kez çalışır
                 s: Sayfalama = Depends()):
    return listele(db, kullanici.id, s.sayfa, s.boyut)
''') + '''
<p>Bu tasarımın en büyük faydası test sırasında görülür: <code>app.dependency_overrides[get_db] = sahte_db</code> ile gerçek veritabanını tek satırda sahte bir sürümle değiştirirsin. FastAPI bağımlılıkları nasıl çözüyor? Metaprogramlama dersindeki <code>inspect.signature</code> ile. Özünü burada çalıştırabilirsin:</p>
''' + PY(r'''
import inspect

class Depends:
    def __init__(self, bagimlilik):
        self.bagimlilik = bagimlilik

def coz(fn, istek):
    kwargs = {}
    for p in inspect.signature(fn).parameters.values():
        if isinstance(p.default, Depends):
            kwargs[p.name] = coz(p.default.bagimlilik, istek)   # özyinelemeli çöz
        elif p.name in istek:
            kwargs[p.name] = istek[p.name]
    return fn(**kwargs)

def sayfalama(sayfa=1, boyut=20):
    return {"sayfa": int(sayfa), "boyut": min(int(boyut), 100)}

def aktif_kullanici(token=None):
    return {"tok-ayse": "ayse"}.get(token, "anonim")

def siparislerim(kullanici=Depends(aktif_kullanici), s=Depends(sayfalama)):
    return f"{kullanici} için sayfa {s['sayfa']} (boyut {s['boyut']})"

print(coz(siparislerim, {"token": "tok-ayse", "sayfa": "3", "boyut": "500"}))
print(coz(siparislerim, {}))
''') + '''

<h2>async uç noktalar</h2>
<p>FastAPI hem <code>def</code> hem <code>async def</code> uç noktaları destekler. <code>async def</code> ile tanımlanan uç nokta olay döngüsünde çalışır; içinde <code>await</code> ile asenkron HTTP istemcisi (httpx.AsyncClient), asenkron veritabanı sürücüsü kullanırsan tek işlem binlerce bekleyen isteği idare eder. Normal <code>def</code> ile tanımlananları FastAPI bir iş parçacığı havuzunda çalıştırır.</p>
''' + PY(r'''
import asyncio

async def stok_sor(depo, urun):
    await asyncio.sleep(0.05)              # dış servis gecikmesi
    return {"İzmir": 12, "Ankara": 0, "Bursa": 5}[depo]

async def urun_stok(urun_id):              # @app.get("/urunler/{urun_id}/stok")
    depolar = ["İzmir", "Ankara", "Bursa"]
    sonuclar = await asyncio.gather(*(stok_sor(d, urun_id) for d in depolar))
    return {"urun_id": urun_id, "stok": dict(zip(depolar, sonuclar)), "toplam": sum(sonuclar)}

loop = asyncio.new_event_loop()
print(loop.run_until_complete(urun_stok(7)))
loop.close()
''') + '''
<div class="warn"><b>async def içinde bloklayan çağrı</b><code>async def</code> uç noktada <code>time.sleep</code>, <code>requests.get</code> ya da senkron veritabanı sürücüsü kullanırsan olay döngüsünü durdurursun ve <b>tüm</b> istekler bekler. Kural: içeride <code>await</code> edeceğin asenkron bir kütüphane yoksa uç noktayı düz <code>def</code> ile yaz; FastAPI onu iş parçacığında çalıştırır.</div>

<h2>OpenAPI, CORS ve kimlik doğrulama</h2>
<p>FastAPI tüm uç noktaları, parametreleri ve pydantic şemalarını OpenAPI standardında bir JSON belgesine çevirir. Bu belgeden Swagger arayüzü çıkar; ayrıca istemci kodu üreticileri (TypeScript, Kotlin) aynı belgeden otomatik istemci kütüphanesi üretebilir. Modelin JSON şemasını kendin de görebilirsin: <code>SiparisOlustur.model_json_schema()</code>.</p>
<p>Tarayıcıda çalışan bir ön yüz (ör. <code>https://magaza.anadolumarket.com</code>) başka bir alan adındaki API'ye (<code>https://api.anadolumarket.com</code>) istek atacaksa tarayıcı CORS (Cross-Origin Resource Sharing) iznini kontrol eder:</p>
''' + CODE(r'''
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://magaza.anadolumarket.com"],   # "*" üretimde kullanma
    allow_methods=["GET", "POST"],
    allow_headers=["Authorization", "Content-Type"],
    allow_credentials=True,
)
''') + '''
<p>Kimlik doğrulamada yaygın kalıp <b>OAuth2 parola akışı + JWT</b>'dir: istemci <code>/token</code> uç noktasına kullanıcı adı ve şifre gönderir, sunucu imzalı bir <b>JWT</b> (JSON Web Token) döner; istemci sonraki isteklerde <code>Authorization: Bearer &lt;token&gt;</code> başlığını gönderir. JWT üç parçadır: başlık, yük (kullanıcı kimliği, son kullanma zamanı <code>exp</code>) ve imza. Sunucu imzayı gizli anahtarla doğrular; yük şifreli değildir, yalnızca <b>değiştirilemez</b>. Bu yüzden içine şifre ya da kişisel veri koyma.</p>
''' + CODE(r'''
# pip install pyjwt "passlib[bcrypt]"
from datetime import datetime, timedelta, timezone
import jwt
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

GIZLI = os.environ["JWT_GIZLI_ANAHTAR"]
oauth2 = OAuth2PasswordBearer(tokenUrl="token")

@app.post("/token")
def token_al(form: OAuth2PasswordRequestForm = Depends()):
    kullanici = dogrula(form.username, form.password)       # bcrypt ile karşılaştır
    if not kullanici:
        raise HTTPException(401, "Hatalı kullanıcı adı ya da şifre")
    yuk = {"sub": str(kullanici.id), "exp": datetime.now(timezone.utc) + timedelta(minutes=30)}
    return {"access_token": jwt.encode(yuk, GIZLI, algorithm="HS256"), "token_type": "bearer"}

def aktif_kullanici(token: str = Depends(oauth2)):
    try:
        yuk = jwt.decode(token, GIZLI, algorithms=["HS256"])
    except jwt.PyJWTError:
        raise HTTPException(401, "Geçersiz ya da süresi dolmuş token")
    return kullanici_getir(int(yuk["sub"]))
''') + '''

<h2>TestClient ve çalıştırma</h2>
''' + CODE(r'''
# tests/test_api.py
from fastapi.testclient import TestClient
from main import app, get_db

def sahte_db():
    yield {"urunler": {1: {"ad": "Çay"}}}

app.dependency_overrides[get_db] = sahte_db
client = TestClient(app)

def test_urun_bulunamadi():
    yanit = client.get("/urunler/999")
    assert yanit.status_code == 404
    assert yanit.json() == {"detail": "Ürün bulunamadı"}

def test_dogrulama():
    yanit = client.post("/siparisler", json={"musteri_id": 0})
    assert yanit.status_code == 422
    alanlar = {tuple(h["loc"]) for h in yanit.json()["detail"]}
    assert ("body", "musteri_id") in alanlar
''') + CODE(r'''
# Geliştirme
fastapi dev main.py
# Üretim: birden çok işlem
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
# ya da gunicorn yöneticisiyle
gunicorn main:app -k uvicorn.workers.UvicornWorker -w 4 -b 0.0.0.0:8000
''') + '''

<h2>Flask mı, FastAPI mı, Django mı?</h2>
<div class="tbl-wrap"><table>
<tr><th>Ölçüt</th><th>Flask</th><th>FastAPI</th><th>Django</th></tr>
<tr><td>Felsefe</td><td>Mikro çatı, eklentiyle büyür</td><td>Tip ipucu odaklı API çatısı</td><td>"Piller dahil" tam çatı</td></tr>
<tr><td>Doğrulama</td><td>Elle ya da eklenti (WTForms, marshmallow)</td><td>pydantic ile otomatik, 422</td><td>Forms / DRF serializers</td></tr>
<tr><td>Dokümantasyon</td><td>Eklentiyle</td><td>Otomatik OpenAPI + Swagger</td><td>DRF + eklenti</td></tr>
<tr><td>Async</td><td>Kısıtlı</td><td>Doğal (ASGI)</td><td>Kısmi, gelişiyor</td></tr>
<tr><td>ORM ve yönetim paneli</td><td>Yok (Flask-SQLAlchemy)</td><td>Yok (SQLAlchemy, SQLModel)</td><td>Dahili ORM + admin paneli</td></tr>
<tr><td>Tipik kullanım</td><td>İç araçlar, HTML panelleri, küçük servisler</td><td>JSON API, mikroservis, ML model sunumu</td><td>Büyük içerik siteleri, yönetim ağırlıklı ürünler</td></tr>
</table></div>

<div class="note"><b>Gerçek işte</b>Ilgaz Bank'ın kredi ön değerlendirme servisi FastAPI ile yazılmış. Mobil uygulama ekibi API'yi <code>/docs</code> sayfasından keşfediyor ve OpenAPI belgesinden otomatik istemci üretiyor; sözleşme değişince derleme hatası alıyorlar. Başvuru gövdesi pydantic modeliyle doğrulanıyor (TC kimlik no biçimi, gelir pozitif, vade 3-36 ay); hatalı başvurular iş mantığına hiç ulaşmıyor. Skor servisi, kara liste ve gelir doğrulama sorguları <code>asyncio.gather</code> ile paralel atılıyor. Testlerde <code>dependency_overrides</code> ile dış servisler sahte sürümlerle değiştiriliyor ve tüm test paketi saniyeler içinde koşuyor.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>ASGI ve Starlette</h3>
<p>FastAPI, Starlette adlı ASGI çatısının üzerine pydantic doğrulaması ve bağımlılık enjeksiyonu ekler. ASGI, WSGI'nin async karşılığıdır: uygulama <code>async def app(scope, receive, send)</code> imzalı bir çağrılabilirdir. Ara katmanlar (middleware: CORS, sıkıştırma, istek süresi ölçümü) bu çağrılabiliri saran katmanlardır; Dekoratörler dersindeki sarma fikrinin sunucu düzeyindeki hâli.</p>
<h3>Yaşam döngüsü ve arka plan işleri</h3>
<p>Uygulama açılırken bir kez yapılacak işler (veritabanı havuzu, ML modelini belleğe yükleme) <code>lifespan</code> bağlam yöneticisinde yapılır. Yanıttan sonra yapılacak kısa işler için <code>BackgroundTasks</code> vardır; ama uzun ve kaybolmaması gereken işler (fatura üretimi, toplu e-posta) gerçek bir kuyruğa (Celery, RQ, Arq) gönderilmelidir: süreç yeniden başlarsa BackgroundTasks işleri kaybolur.</p>
<h3>Sürümleme ve sözleşme</h3>
<p>Yayındaki bir API'de alan adını değiştirmek, istemcileri kırar. Kalıcı API'lerde <code>APIRouter(prefix="/v1")</code> ile sürümle, alanları kaldırmadan önce kullanımdan kaldırıldı (<code>deprecated=True</code>) olarak işaretle ve OpenAPI belgesini CI'da önceki sürümle karşılaştırarak kırıcı değişiklikleri yakala.</p>
</section>
'''

HTTPEXC = r'''class HTTPException(Exception):
    def __init__(self, status_code, detail=None):
        super().__init__(detail)
        self.status_code = status_code
        self.detail = detail
'''

ex = [
  dict(t='mc', stage='Isınma',
       q='<code>@app.get("/urunler/{urun_id}")</code> altında <code>def urun(urun_id: int, detay: bool = False)</code> tanımlı. <code>detay</code> değeri istekte nereden okunur?',
       o=['JSON istek gövdesinden', 'Sorgu dizesinden: ?detay=true', 'Authorization başlığından', 'Yol parametresinden: /urunler/{detay}'], a=1,
       why='Yol kuralında adı geçen parametreler yoldan, geçmeyen basit tipli parametreler sorgu dizesinden okunur. Gövdeden okunması için parametrenin bir pydantic modeli olması gerekir; başlık için Header() kullanılır.'),
  dict(t='mc', stage='Isınma',
       q='İstemci, <code>adet: int = Field(ge=1)</code> alanına <code>0</code> gönderdi. FastAPI ne yapar?',
       o=['Fonksiyonu çağırır, adet 0 olarak gelir', 'Fonksiyonu çağırmadan 422 ve hata ayrıntısı döner', 'Değeri 1\'e yuvarlar ve devam eder', 'Fonksiyonu çağırır, içinde ValueError fırlar ve 500 döner'], a=1,
       why='Doğrulama, uç nokta fonksiyonu çağrılmadan önce yapılır. Kural ihlalinde FastAPI 422 Unprocessable Entity ile detail listesinde loc ["body", "adet"] ve type "greater_than_equal" döner. Değer sessizce düzeltilmez.'),
  dict(t='mc', stage='Isınma',
       q='Bir ekip arkadaşın <code>async def</code> uç noktasının içinde <code>requests.get(...)</code> ile 2 saniyelik bir dış servis çağırıyor. Yük altında ne olur?',
       o=['Sorun yok; async def her isteği ayrı iş parçacığında çalıştırır', 'Olay döngüsü 2 saniye bloklanır, tüm diğer istekler de bekler', 'FastAPI çağrıyı otomatik olarak await edilebilir hâle getirir', 'requests async içinde çalışmaz, hemen hata verir'], a=1,
       why='async def uç noktalar olay döngüsünde çalışır; senkron requests.get döngüyü durdurur. Ya httpx.AsyncClient ile await et ya da uç noktayı düz def ile yaz (FastAPI onu iş parçacığı havuzunda çalıştırır).'),
  dict(t='predict', stage='Kodu oku', q='pydantic dönüşümleri (lax mode): bu kod ne yazdırır?',
       code=r'''from pydantic import BaseModel

class Kalem(BaseModel):
    urun: str
    adet: int
    fiyat: float
    hediye: bool = False

k = Kalem.model_validate({"urun": "Çay", "adet": "3", "fiyat": 85, "hediye": "yes"})
print(k.adet * 2, k.fiyat, k.hediye)
''',
       o=['33 85 yes', '6 85.0 True', '6 85 True', 'ValidationError'], a=1,
       why='Lax modda "3" int\'e (3 * 2 = 6), 85 float\'a (85.0) dönüştürülür; "yes" pydantic\'in kabul ettiği doğru değerlerinden biridir ve True olur. Kesin tip istenseydi strict mod kullanılırdı.'),
  dict(t='predict', stage='Kodu oku', q='ValidationError ayrıntıları: bu kod ne yazdırır?',
       code=r'''from pydantic import BaseModel, Field, ValidationError

class Basvuru(BaseModel):
    musteri_id: int = Field(gt=0)
    tutar: float = Field(gt=0)
    vade: int = Field(ge=3, le=36)

try:
    Basvuru.model_validate({"musteri_id": 5, "tutar": -100, "vade": 48})
except ValidationError as e:
    print(e.error_count(), [h["loc"][0] for h in e.errors()])
''',
       o=['1 [\'tutar\']', '2 [\'tutar\', \'vade\']', '3 [\'musteri_id\', \'tutar\', \'vade\']', '2 [\'vade\', \'tutar\']'], a=1,
       why='pydantic ilk hatada durmaz, tüm alanları doğrulayıp hataları toplar: tutar (gt=0) ve vade (le=36) hatalıdır; musteri_id geçerlidir. Hatalar alan tanım sırasıyla listelenir. FastAPI bu listeyi 422 gövdesinde aynen iletir.'),
  dict(t='predict', stage='Kodu oku', q='Async uç noktada gather: bu kod ne yazdırır?',
       code=r'''import asyncio

async def sor(ad, sure):
    await asyncio.sleep(sure)
    return f"{ad}:{sure}"

async def uc_nokta():
    sonuc = await asyncio.gather(sor("skor", 0.03), sor("kimlik", 0.01), sor("limit", 0.02))
    return sonuc

loop = asyncio.new_event_loop()
print(loop.run_until_complete(uc_nokta()))
loop.close()
''',
       o=['[\'kimlik:0.01\', \'limit:0.02\', \'skor:0.03\']', '[\'skor:0.03\', \'kimlik:0.01\', \'limit:0.02\']', '[\'skor:0.03\']', 'coroutine nesneleri listesi'], a=1,
       why='gather işleri birlikte başlatır; bitiş sırası farklı olsa da sonuçları VERİLEN sırayla döndürür. Bu yüzden sonuçları zip ile girdilerle güvenle eşleyebilirsin.'),
  dict(t='order', stage='Kodu oku',
       q='<p>Bir istek gövdesini pydantic modeliyle doğrulayıp yanıt sözlüğü üreten programın satırlarını sırala.</p>',
       lines=['from pydantic import BaseModel, Field', 'class Siparis(BaseModel):', '    urun: str', '    adet: int = Field(ge=1)', 'govde = {"urun": "Kahve", "adet": "2"}', 's = Siparis.model_validate(govde)', 'yanit = {"durum": 201, "veri": s.model_dump()}', 'print(yanit)'],
       expect="{'durum': 201, 'veri': {'urun': 'Kahve', 'adet': 2}}\n",
       hint='Önce içe aktarma ve model; sonra ham gövde, doğrulama, yanıt.',
       why='Model tanımlanmadan doğrulama yapılamaz; model_validate "2" metnini int\'e çevirir; model_dump doğrulanmış veriyi sözlüğe geri döker. FastAPI bu üç adımı her istekte senin yerine yapar.'),
  dict(id='fastapi-1', t='code', stage='Rehberli', diff=1,
       q='<p>Anadolu Market sipariş isteği için <code>SiparisIstegi</code> pydantic modelini yaz:</p><ul><li><code>musteri_id</code>: <code>int</code>, 0\'dan büyük</li><li><code>urunler</code>: <code>list[str]</code>, en az 1 eleman</li><li><code>adet</code>: <code>int</code>, 1 ile 100 arası (dahil), varsayılan 1</li><li><code>kupon</code>: <code>str | None</code>, varsayılan <code>None</code>, verilirse en çok 12 karakter</li></ul><p>Ayrıca <code>dogrula(govde)</code> fonksiyonunu yaz: geçerliyse <code>(201, model.model_dump())</code>, değilse <code>(422, [hata konumlarının ilk elemanı, sırayla])</code> döndürsün.</p>',
       guide=['from pydantic import BaseModel, Field, ValidationError', 'Kısıtları Field ile ver: gt, ge, le, min_length, max_length.', 'dogrula içinde SiparisIstegi.model_validate(govde) çağır.', 'except ValidationError as e: e.errors() listesinden h["loc"][0] değerlerini topla.'],
       example=r'''from pydantic import BaseModel, Field, ValidationError

class Personel(BaseModel):
    ad: str = Field(min_length=2)
    maas: float = Field(gt=0)
    bolum: str | None = Field(default=None, max_length=20)

try:
    Personel.model_validate({"ad": "A", "maas": 0})
except ValidationError as e:
    print([h["loc"][0] for h in e.errors()])
print(Personel.model_validate({"ad": "Ali", "maas": 40000}).model_dump())
''',
       start=r'''from pydantic import BaseModel, Field, ValidationError


class SiparisIstegi(BaseModel):
    musteri_id: int
    # TODO: musteri_id 0'dan büyük olmalı
    # TODO: urunler, adet, kupon alanları


def dogrula(govde):
    # TODO
    pass
''',
       sol=r'''from pydantic import BaseModel, Field, ValidationError


class SiparisIstegi(BaseModel):
    musteri_id: int = Field(gt=0)
    urunler: list[str] = Field(min_length=1)
    adet: int = Field(default=1, ge=1, le=100)
    kupon: str | None = Field(default=None, max_length=12)


def dogrula(govde):
    try:
        model = SiparisIstegi.model_validate(govde)
    except ValidationError as e:
        return 422, [h["loc"][0] for h in e.errors()]
    return 201, model.model_dump()
''',
       tests=r'''assert dogrula({"musteri_id": 7, "urunler": ["Çay"]}) == (201, {"musteri_id": 7, "urunler": ["Çay"], "adet": 1, "kupon": None}), "varsayılanlar: adet 1, kupon None"
assert dogrula({"musteri_id": "7", "urunler": ["Çay", "Kahve"], "adet": 100, "kupon": "YAZ25"})[0] == 201, "adet 100 dahil, kupon 12 karakterden kısa"
assert dogrula({"musteri_id": 0, "urunler": []}) == (422, ["musteri_id", "urunler"]), "musteri_id > 0 ve urunler en az 1 eleman"
assert dogrula({"musteri_id": 1, "urunler": ["x"], "adet": 101}) == (422, ["adet"]), "adet en çok 100"
assert dogrula({"musteri_id": 1, "urunler": ["x"], "adet": 0}) == (422, ["adet"]), "adet en az 1"
assert dogrula({"musteri_id": 1, "urunler": ["x"], "kupon": "COKUZUNKUPON2024"}) == (422, ["kupon"]), "kupon en çok 12 karakter"
assert dogrula({"urunler": ["x"]}) == (422, ["musteri_id"]), "eksik zorunlu alan"
''',
       hints=['Sayı sınırları: Field(gt=0), Field(ge=1, le=100); liste ve metin uzunluğu: min_length, max_length.', 'Varsayılanı olan kısıtlı alan: Field(default=1, ge=1, le=100).', 'e.errors() her hata için {"loc": (...), "type": ..., "msg": ...} sözlüğü verir.'],
       why='Model, API sözleşmesinin kendisidir: FastAPI bu modeli hem doğrulama hem de /docs dokümantasyonu için kullanır. Kuralları tek yerde tanımlamak, dokümantasyonla kodun çelişmesini imkânsız kılar.'),
  dict(id='fastapi-2', t='code', stage='Rehberli', diff=2,
       q='<p>FastAPI\'nin sorgu parametresi ayrıştırıcısını taklit et: <code>sorgu_ayristir(sorgu, sema)</code>. <code>sorgu</code> ham sorgu dizesi (<code>"sayfa=2&amp;aktif=true"</code>), <code>sema</code> ise <code>{ad: (tip, varsayilan)}</code> sözlüğüdür; varsayılan <code>...</code> (Ellipsis) ise parametre zorunludur. Desteklenen tipler: <code>int</code>, <code>float</code>, <code>str</code>, <code>bool</code> (<code>true/1/yes/on</code> → True, <code>false/0/no/off</code> → False, büyük/küçük harf duyarsız).</p><p>Tüm hatalar toplandıktan sonra hata varsa <code>Dogrulama422</code> fırlatılsın; <code>hatalar</code> listesi <code>{"loc": ["query", ad], "type": tur}</code> sözlükleri içersin; <code>tur</code>: eksikse <code>"missing"</code>, dönüşüm başarısızsa <code>"int_parsing"</code> / <code>"float_parsing"</code> / <code>"bool_parsing"</code>. Şemada olmayan parametreler yok sayılır.</p>',
       guide=['parse_qsl ile sorguyu (ad, değer) çiftlerine çevir; ilk değeri al (dict(reversed(...)) ya da setdefault).', 'Şemadaki her ad için: sorguda yoksa varsayılan Ellipsis ise "missing" hatası ekle, değilse varsayılanı kullan.', 'Varsa tipe göre dönüştür; bool için iki küme kullan.', 'Dönüşüm hatasında f"{tip.__name__}_parsing" türünde hata ekle.', 'Döngü bitince hata varsa Dogrulama422(hatalar) fırlat, yoksa sonucu döndür.'],
       example=r'''from urllib.parse import parse_qsl

ham = "sehir=%C4%B0zmir&limit=abc&limit=5"
cifter = parse_qsl(ham)
print(cifter)
ilk = {}
for k, v in cifter:
    ilk.setdefault(k, v)
print(ilk)
try:
    int(ilk["limit"])
except ValueError:
    print("limit int değil")
''',
       start=r'''from urllib.parse import parse_qsl

DOGRU = {"true", "1", "yes", "on"}
YANLIS = {"false", "0", "no", "off"}


class Dogrulama422(Exception):
    def __init__(self, hatalar):
        super().__init__(hatalar)
        self.hatalar = hatalar


def sorgu_ayristir(sorgu, sema):
    ham = {}
    for k, v in parse_qsl(sorgu, keep_blank_values=True):
        ham.setdefault(k, v)
    sonuc, hatalar = {}, []
    for ad, (tip, varsayilan) in sema.items():
        # TODO: eksik / varsayılan
        # TODO: tipe göre dönüştür, hatayı kaydet
        pass
    # TODO: hata varsa Dogrulama422 fırlat
    return sonuc
''',
       sol=r'''from urllib.parse import parse_qsl

DOGRU = {"true", "1", "yes", "on"}
YANLIS = {"false", "0", "no", "off"}


class Dogrulama422(Exception):
    def __init__(self, hatalar):
        super().__init__(hatalar)
        self.hatalar = hatalar


def _cevir(tip, deger):
    if tip is bool:
        d = deger.lower()
        if d in DOGRU:
            return True
        if d in YANLIS:
            return False
        raise ValueError(deger)
    return tip(deger)


def sorgu_ayristir(sorgu, sema):
    ham = {}
    for k, v in parse_qsl(sorgu, keep_blank_values=True):
        ham.setdefault(k, v)
    sonuc, hatalar = {}, []
    for ad, (tip, varsayilan) in sema.items():
        if ad not in ham:
            if varsayilan is ...:
                hatalar.append({"loc": ["query", ad], "type": "missing"})
            else:
                sonuc[ad] = varsayilan
            continue
        try:
            sonuc[ad] = _cevir(tip, ham[ad])
        except ValueError:
            hatalar.append({"loc": ["query", ad], "type": f"{tip.__name__}_parsing"})
    if hatalar:
        raise Dogrulama422(hatalar)
    return sonuc
''',
       tests=r'''SEMA = {"q": (str, ...), "sayfa": (int, 1), "fiyat_ust": (float, None), "stokta": (bool, False)}
assert sorgu_ayristir("q=%C3%A7ay&sayfa=3&stokta=YES&bilinmeyen=1", SEMA) == {"q": "çay", "sayfa": 3, "fiyat_ust": None, "stokta": True}, "dönüşüm ve varsayılanlar"
assert sorgu_ayristir("q=kahve&fiyat_ust=99.5&stokta=off", SEMA) == {"q": "kahve", "sayfa": 1, "fiyat_ust": 99.5, "stokta": False}, "float ve bool off"
assert sorgu_ayristir("q=a&sayfa=2&sayfa=9", SEMA)["sayfa"] == 2, "tekrar eden parametrede ilk değer"
try:
    sorgu_ayristir("sayfa=iki&stokta=belki&fiyat_ust=x", SEMA)
    assert False, "hatalı sorgu Dogrulama422 fırlatmalı"
except Dogrulama422 as e:
    assert e.hatalar == [
        {"loc": ["query", "q"], "type": "missing"},
        {"loc": ["query", "sayfa"], "type": "int_parsing"},
        {"loc": ["query", "fiyat_ust"], "type": "float_parsing"},
        {"loc": ["query", "stokta"], "type": "bool_parsing"},
    ], f"tüm hatalar şema sırasıyla toplanmalı: {e.hatalar}"
''',
       hints=['Zorunluluk işareti Ellipsis\'tir: varsayilan is ... ile kontrol et.', 'bool("false") True verir! bool için kendi küme kontrolünü yaz.', 'Hata türü adı: f"{tip.__name__}_parsing"; hepsini topla, sonda tek seferde fırlat.'],
       why='FastAPI de tüm parametre hatalarını toplayıp tek 422 yanıtında verir; istemci tek istekte bütün sorunları görür. bool("false") tuzağı, metinden bool dönüşümünün neden özel ele alınması gerektiğini gösterir.'),
  dict(id='fastapi-3', t='code', stage='Rehberli', diff=2,
       q='<p>FastAPI\'nin hata→durum kodu katmanını taklit et. <code>HTTPException</code> sınıfı hazır. <code>istek_calistir(fn, govde)</code> fonksiyonunu yaz; <code>fn(govde)</code>\'yi çağırsın ve <code>(durum, yanit)</code> döndürsün:</p><ul><li>Başarı: <code>(200, sonuc)</code></li><li><code>HTTPException</code>: <code>(e.status_code, {"detail": e.detail})</code></li><li>pydantic <code>ValidationError</code>: <code>(422, {"detail": [{"loc": ["body", *h["loc"]], "type": h["type"]} ...]})</code></li><li>Diğer her istisna: <code>(500, {"detail": "Internal Server Error"})</code></li></ul>',
       guide=['try bloğunda sonuc = fn(govde) ve (200, sonuc) döndür.', 'Önce except HTTPException, sonra except ValidationError, en son except Exception yaz (özelden genele).', '422 detayı için e.errors() listesini dönüştür: ["body", *h["loc"]] konum listesi üretir.', '500\'de istisnanın mesajını yanıtta gösterme.'],
       example=r'''class Bulunamadi(Exception):
    pass

def guvenli(fn, x):
    try:
        return "ok", fn(x)
    except Bulunamadi as e:
        return "yok", str(e)
    except Exception:
        return "hata", None

print(guvenli(lambda x: 10 / x, 2))
print(guvenli(lambda x: 10 / x, 0))
''',
       start=HTTPEXC + r'''

from pydantic import ValidationError


def istek_calistir(fn, govde):
    # TODO: try/except ile durum ve yanıt üret
    return 200, fn(govde)
''',
       sol=HTTPEXC + r'''

from pydantic import ValidationError


def istek_calistir(fn, govde):
    try:
        return 200, fn(govde)
    except HTTPException as e:
        return e.status_code, {"detail": e.detail}
    except ValidationError as e:
        return 422, {"detail": [{"loc": ["body", *h["loc"]], "type": h["type"]} for h in e.errors()]}
    except Exception:
        return 500, {"detail": "Internal Server Error"}
''',
       tests=r'''from pydantic import BaseModel, Field

class Urun(BaseModel):
    ad: str
    fiyat: float = Field(gt=0)

DEPO = {1: "Çay"}

def urun_ekle(govde):
    u = Urun.model_validate(govde)
    return {"ad": u.ad, "fiyat": u.fiyat}

def urun_getir(govde):
    if govde["id"] not in DEPO:
        raise HTTPException(404, "Ürün bulunamadı")
    return {"ad": DEPO[govde["id"]]}

def bozuk(govde):
    raise KeyError("postgres sifresi=Gizli123")

assert istek_calistir(urun_ekle, {"ad": "Çay", "fiyat": "85.5"}) == (200, {"ad": "Çay", "fiyat": 85.5}), "başarılı istek 200"
assert istek_calistir(urun_getir, {"id": 9}) == (404, {"detail": "Ürün bulunamadı"}), "HTTPException kendi kodunu ve detail'ini vermeli"
d, y = istek_calistir(urun_ekle, {"fiyat": -1})
assert d == 422 and y == {"detail": [{"loc": ["body", "ad"], "type": "missing"}, {"loc": ["body", "fiyat"], "type": "greater_than"}]}, f"422 detayı hatalı: {y}"
assert istek_calistir(bozuk, {}) == (500, {"detail": "Internal Server Error"}), "beklenmeyen hata 500 ve iç mesaj sızmamalı"
''',
       hints=['Birden çok except bloğu yukarıdan aşağı denenir; Exception en sonda olmalı yoksa diğerlerini yutar.', 'Liste içinde açma: ["body", *h["loc"]] → ["body", "fiyat"].', 'return 500, {"detail": "Internal Server Error"}'],
       why='FastAPI bu katmanı istek işleme hattının en dışında çalıştırır: HTTPException\'ı yanıta, RequestValidationError\'ı 422\'ye, diğer her şeyi 500\'e çevirir. İç hata mesajlarını istemciye göstermemek temel bir güvenlik kuralıdır.'),
  dict(id='fastapi-4', t='code', stage='Kendin yaz', diff=2,
       q='<p>Sayfalama yanıtı üret: <code>sayfala(ogeler, sayfa=1, boyut=10, taban_url="/urunler")</code> şu sözlüğü döndürsün:</p><pre class="out">{"toplam": 23, "sayfa": 2, "boyut": 10, "sayfa_sayisi": 3,\n "ogeler": [...11-20. öğeler...],\n "sonraki": "/urunler?sayfa=3&amp;boyut=10", "onceki": "/urunler?sayfa=1&amp;boyut=10"}</pre><ul><li><code>sayfa</code> 1\'den küçükse ya da <code>boyut</code> 1-100 dışındaysa <code>ValueError</code>.</li><li><code>sayfa_sayisi</code>: toplam 0 ise 0, değilse yukarı yuvarlanmış bölüm.</li><li>Son sayfadan sonrası istenirse <code>ogeler</code> boş liste, <code>sonraki</code> <code>None</code>; <code>onceki</code> sayfa 1\'de <code>None</code>.</li></ul>',
       start=r'''def sayfala(ogeler, sayfa=1, boyut=10, taban_url="/urunler"):
    pass
''',
       sol=r'''import math


def sayfala(ogeler, sayfa=1, boyut=10, taban_url="/urunler"):
    if sayfa < 1 or not 1 <= boyut <= 100:
        raise ValueError("sayfa >= 1 ve 1 <= boyut <= 100 olmalı")
    toplam = len(ogeler)
    sayfa_sayisi = math.ceil(toplam / boyut)
    bas = (sayfa - 1) * boyut

    def url(s):
        return f"{taban_url}?sayfa={s}&boyut={boyut}"

    return {
        "toplam": toplam,
        "sayfa": sayfa,
        "boyut": boyut,
        "sayfa_sayisi": sayfa_sayisi,
        "ogeler": list(ogeler[bas:bas + boyut]),
        "sonraki": url(sayfa + 1) if sayfa < sayfa_sayisi else None,
        "onceki": url(sayfa - 1) if sayfa > 1 else None,
    }
''',
       tests=r'''veri = list(range(1, 24))
r = sayfala(veri, 2, 10)
assert r == {"toplam": 23, "sayfa": 2, "boyut": 10, "sayfa_sayisi": 3, "ogeler": list(range(11, 21)),
             "sonraki": "/urunler?sayfa=3&boyut=10", "onceki": "/urunler?sayfa=1&boyut=10"}, f"2. sayfa hatalı: {r}"
r = sayfala(veri, 3, 10)
assert r["ogeler"] == [21, 22, 23] and r["sonraki"] is None, "son sayfada sonraki None"
r = sayfala(veri)
assert r["onceki"] is None and r["ogeler"] == list(range(1, 11)), "ilk sayfada onceki None"
r = sayfala(veri, 5, 10, "/api/siparisler")
assert r["ogeler"] == [] and r["sonraki"] is None and r["onceki"] == "/api/siparisler?sayfa=4&boyut=10", "sayfa aralık dışı: boş liste"
r = sayfala([], 1, 20)
assert r["sayfa_sayisi"] == 0 and r["ogeler"] == [] and r["sonraki"] is None, "boş veri"
assert sayfala(veri, 1, 23)["sayfa_sayisi"] == 1 and sayfala(veri, 1, 100)["sonraki"] is None, "tek sayfa"
for s, b in [(0, 10), (1, 0), (1, 101), (-1, 5)]:
    try:
        sayfala(veri, s, b)
        assert False, f"sayfa={s}, boyut={b} ValueError vermeli"
    except ValueError:
        pass
''',
       hints=['Başlangıç indeksi: (sayfa - 1) * boyut; dilim aralık dışına taşarsa Python boş liste verir.', 'Yukarı yuvarlama: math.ceil(toplam / boyut) ya da -(-toplam // boyut).', 'sonraki yalnız sayfa &lt; sayfa_sayisi iken vardır.'],
       why='Sayfalama, büyük listeleri tek yanıtta göndermemenin standart yoludur. Yanıta toplam ve sonraki/önceki bağlantıları koymak, istemcinin URL kurma mantığını bilmeden gezinmesini sağlar (HATEOAS fikrinin pratik hâli).'),
  dict(id='fastapi-5', t='code', stage='Kendin yaz', diff=2,
       q='<p>Async uç nokta mantığı: <code>async def fiyatlari_getir(urun_idleri, getir, limit=3)</code> yaz. <code>getir(urun_id)</code> bir coroutine fonksiyonudur (dış fiyat servisi). Fonksiyon tüm ürünleri <b>eşzamanlı</b> sorgulasın ama aynı anda en çok <code>limit</code> istek açık olsun (<code>asyncio.Semaphore</code>). <code>{urun_id: fiyat}</code> sözlüğü döndürsün (girdi sırasıyla); <code>getir</code> istisna fırlatırsa o ürünün fiyatı <code>None</code> olsun, diğerleri etkilenmesin.</p>',
       start=r'''import asyncio


async def fiyatlari_getir(urun_idleri, getir, limit=3):
    sonuc = {}
    for uid in urun_idleri:
        sonuc[uid] = await getir(uid)
    return sonuc
''',
       sol=r'''import asyncio


async def fiyatlari_getir(urun_idleri, getir, limit=3):
    sinir = asyncio.Semaphore(limit)

    async def tek(uid):
        async with sinir:
            try:
                return await getir(uid)
            except Exception:
                return None

    fiyatlar = await asyncio.gather(*(tek(uid) for uid in urun_idleri))
    return dict(zip(urun_idleri, fiyatlar))
''',
       tests=r'''import asyncio
durum = {"aktif": 0, "en_cok": 0}
FIYAT = {1: 85.5, 2: 240.0, 3: 25.0, 4: 32.25, 5: 12.0, 6: 9.9, 7: 150.0}

async def sahte_getir(uid):
    durum["aktif"] += 1
    durum["en_cok"] = max(durum["en_cok"], durum["aktif"])
    try:
        await asyncio.sleep(0.01)
        if uid == 5:
            raise ConnectionError("servis yanıt vermedi")
        return FIYAT[uid]
    finally:
        durum["aktif"] -= 1

loop = asyncio.new_event_loop()
r = loop.run_until_complete(fiyatlari_getir([3, 1, 5, 2, 7, 6, 4], sahte_getir, limit=3))
assert list(r) == [3, 1, 5, 2, 7, 6, 4], "sonuç sözlüğü girdi sırasını korumalı"
assert r[1] == 85.5 and r[4] == 32.25, "fiyatlar doğru eşlenmeli"
assert r[5] is None, "hata veren ürün None olmalı, diğerleri etkilenmemeli"
assert durum["en_cok"] == 3, f"aynı anda tam 3 istek açık olmalı (eşzamanlı ama sınırlı), gözlenen {durum['en_cok']}"
durum["en_cok"] = 0
loop.run_until_complete(fiyatlari_getir([1, 2, 3, 4], sahte_getir, limit=2))
assert durum["en_cok"] == 2, "limit parametresine uyulmalı"
loop.close()
''',
       hints=['Her ürün için semaforu async with ile alan küçük bir iç coroutine yaz; hepsini asyncio.gather ile çalıştır.', 'try/except iç coroutine içinde olmalı ki bir hata gather\'ı bozmasın (alternatif: return_exceptions=True).', 'gather sonuçları girdi sırasıyla döner: dict(zip(urun_idleri, fiyatlar)).'],
       why='Sınırsız eşzamanlılık karşı servisi boğar ve hız sınırına (429) takılır; tamamen sıralı çalışmak ise yavaştır. Semaphore ikisinin arasındaki dengeyi kurar. Hata yalıtımı, tek bir ürünün servisi çöktüğünde tüm yanıtın 500 olmasını önler.'),
  dict(id='fastapi-6', t='code', stage='Kendin yaz', diff=2,
       q='<p>Kullanıcı kaydı uç noktasının mantığı. <code>HTTPException</code> hazır. İki pydantic modeli yaz:</p><ul><li><code>KullaniciOlustur</code>: <code>eposta: str</code> (deseni <code>^[^@\\s]+@[^@\\s]+\\.[a-z]{2,}$</code>), <code>sifre: str</code> (en az 8 karakter), <code>ad: str</code> (en az 2 karakter).</li><li><code>KullaniciYanit</code>: <code>id: int</code>, <code>eposta: str</code>, <code>ad: str</code>.</li></ul><p><code>kayit_ol(govde, db)</code>: <code>db</code> bir sözlüktür (<code>eposta → kayıt</code>). Gövdeyi doğrula (hata pydantic <code>ValidationError</code> olarak dışarı çıksın); e-posta küçük harfe çevrilsin; zaten kayıtlıysa <code>HTTPException(409, "E-posta zaten kayıtlı")</code>. Kayda <code>{"id": len(db) + 1, "eposta", "ad", "sifre_hash"}</code> yaz; <code>sifre_hash</code> = <code>hashlib.sha256((tuz + sifre).encode()).hexdigest()</code>, <code>tuz = "anadolu"</code>. Dönüş: <code>KullaniciYanit</code> ile filtrelenmiş sözlük (şifre ya da hash içermemeli).</p>',
       start=HTTPEXC + r'''

import hashlib
from pydantic import BaseModel, Field

TUZ = "anadolu"


def kayit_ol(govde, db):
    pass
''',
       sol=HTTPEXC + r'''

import hashlib
from pydantic import BaseModel, Field

TUZ = "anadolu"


class KullaniciOlustur(BaseModel):
    eposta: str = Field(pattern=r"^[^@\s]+@[^@\s]+\.[a-z]{2,}$")
    sifre: str = Field(min_length=8)
    ad: str = Field(min_length=2)


class KullaniciYanit(BaseModel):
    id: int
    eposta: str
    ad: str


def kayit_ol(govde, db):
    if isinstance(govde.get("eposta"), str):
        govde = {**govde, "eposta": govde["eposta"].strip().lower()}
    veri = KullaniciOlustur.model_validate(govde)
    if veri.eposta in db:
        raise HTTPException(409, "E-posta zaten kayıtlı")
    kayit = {"id": len(db) + 1, "eposta": veri.eposta, "ad": veri.ad,
             "sifre_hash": hashlib.sha256((TUZ + veri.sifre).encode()).hexdigest()}
    db[veri.eposta] = kayit
    return KullaniciYanit.model_validate(kayit).model_dump()
''',
       tests=r'''import hashlib
from pydantic import ValidationError
db = {}
r = kayit_ol({"eposta": "Ayse@IlgazBank.com.tr", "sifre": "Guclu-Sifre1", "ad": "Ayşe"}, db)
assert r == {"id": 1, "eposta": "ayse@ilgazbank.com.tr", "ad": "Ayşe"}, f"yanıt yalnız id, eposta, ad içermeli: {r}"
assert db["ayse@ilgazbank.com.tr"]["sifre_hash"] == hashlib.sha256(b"anadoluGuclu-Sifre1").hexdigest(), "şifre tuzlu sha256 ile saklanmalı"
assert "Guclu-Sifre1" not in str(db), "düz şifre hiçbir yerde saklanmamalı"
try:
    kayit_ol({"eposta": "AYSE@ilgazbank.com.tr", "sifre": "baskaSifre9", "ad": "Ayşe Y"}, db)
    assert False, "aynı e-posta (büyük/küçük harf farkıyla) 409 vermeli"
except HTTPException as e:
    assert e.status_code == 409, "çakışma 409"
try:
    kayit_ol({"eposta": "gecersiz", "sifre": "kisa", "ad": "A"}, db)
    assert False, "geçersiz gövde ValidationError vermeli"
except ValidationError as e:
    assert sorted(h["loc"][0] for h in e.errors()) == ["ad", "eposta", "sifre"], "üç alan da hatalı olmalı"
assert kayit_ol({"eposta": "can@x.com", "sifre": "12345678", "ad": "Can"}, db)["id"] == 2, "ikinci kullanıcı id 2"
assert set(KullaniciYanit.model_fields) == {"id", "eposta", "ad"}, "yanıt modeli yalnız üç alan içermeli"
''',
       hints=['Metin deseni: Field(pattern=r"..."); uzunluk: Field(min_length=8).', 'Küçük harfe çevirmeyi doğrulamadan önce gövde kopyasında yap ki çakışma kontrolü doğru çalışsın.', 'Yanıtı filtrelemek için KullaniciYanit.model_validate(kayit).model_dump(): fazladan alanlar (sifre_hash) varsayılan olarak yok sayılır.'],
       why='Giriş ve çıkış için ayrı modeller kullanmak FastAPI\'nin temel kalıbıdır: istek modeli şifreyi alır, yanıt modeli (response_model) onu asla dışarı vermez. Gerçek sistemlerde sha256 yerine bcrypt/argon2 gibi yavaş, şifreye özel algoritmalar kullanılır; burada fikir gösterilmektedir.'),
  dict(id='fastapi-7', t='code', stage='Kendin yaz', diff=3,
       q='<p>JWT fikrini standart kütüphaneyle kur (gerçek projede <code>pyjwt</code> kullanılır). <code>HTTPException</code> hazır.</p><ul><li><code>b64(veri: bytes) -&gt; str</code>: <code>base64.urlsafe_b64encode</code>, sondaki <code>=</code> dolguları atılmış.</li><li><code>token_uret(yuk: dict, anahtar: str) -&gt; str</code>: <code>govde = b64(json.dumps(yuk, sort_keys=True).encode())</code>, <code>imza = b64(hmac.new(anahtar.encode(), govde.encode(), hashlib.sha256).digest())</code>; token <code>govde + "." + imza</code>.</li><li><code>token_dogrula(token, anahtar, simdi: int) -&gt; dict</code>: biçim bozuksa, imza tutmuyorsa (<code>hmac.compare_digest</code> ile karşılaştır) ya da <code>yuk["exp"] &lt;= simdi</code> ise <code>HTTPException(401, ...)</code>; geçerliyse yükü döndürsün.</li></ul>',
       start=HTTPEXC + r'''

import base64
import hashlib
import hmac
import json


def b64(veri):
    pass


def token_uret(yuk, anahtar):
    pass


def token_dogrula(token, anahtar, simdi):
    pass
''',
       sol=HTTPEXC + r'''

import base64
import hashlib
import hmac
import json


def b64(veri):
    return base64.urlsafe_b64encode(veri).decode().rstrip("=")


def _imza(govde, anahtar):
    return b64(hmac.new(anahtar.encode(), govde.encode(), hashlib.sha256).digest())


def token_uret(yuk, anahtar):
    govde = b64(json.dumps(yuk, sort_keys=True).encode())
    return govde + "." + _imza(govde, anahtar)


def token_dogrula(token, anahtar, simdi):
    try:
        govde, imza = token.split(".")
    except (ValueError, AttributeError):
        raise HTTPException(401, "Bozuk token")
    if not hmac.compare_digest(imza, _imza(govde, anahtar)):
        raise HTTPException(401, "Geçersiz imza")
    yuk = json.loads(base64.urlsafe_b64decode(govde + "=" * (-len(govde) % 4)))
    if yuk.get("exp", 0) <= simdi:
        raise HTTPException(401, "Token süresi dolmuş")
    return yuk
''',
       tests=r'''import base64, json
ANAHTAR = "cok-gizli"
t = token_uret({"sub": "42", "rol": "musteri", "exp": 1_700_000_900}, ANAHTAR)
assert t.count(".") == 1 and "=" not in t, "token 'govde.imza' biçiminde ve dolgusuz olmalı"
assert t == token_uret({"exp": 1_700_000_900, "rol": "musteri", "sub": "42"}, ANAHTAR), "sort_keys sayesinde anahtar sırası tokenı değiştirmemeli"
assert token_dogrula(t, ANAHTAR, 1_700_000_000) == {"exp": 1_700_000_900, "rol": "musteri", "sub": "42"}, "geçerli token yükü döndürmeli"
def reddedilmeli(token, anahtar, simdi, neden):
    try:
        token_dogrula(token, anahtar, simdi)
        assert False, neden
    except HTTPException as e:
        assert e.status_code == 401, "ret 401 olmalı"
reddedilmeli(t, ANAHTAR, 1_700_000_900, "exp anı geçmişse (exp <= simdi) reddedilmeli")
reddedilmeli(t, "baska-anahtar", 1_700_000_000, "farklı anahtarla imza tutmamalı")
govde, imza = t.split(".")
sahte = base64.urlsafe_b64encode(json.dumps({"exp": 1_700_000_900, "rol": "admin", "sub": "42"}, sort_keys=True).encode()).decode().rstrip("=")
reddedilmeli(sahte + "." + imza, ANAHTAR, 1_700_000_000, "yükü değiştirilmiş (rol=admin) token reddedilmeli")
reddedilmeli("bozuk-token", ANAHTAR, 1_700_000_000, "noktasız token reddedilmeli")
''',
       hints=['Dolgu atma: .decode().rstrip("="); geri çözerken dolguyu tamamla: govde + "=" * (-len(govde) % 4).', 'İmzayı aynı yöntemle yeniden hesapla ve hmac.compare_digest ile karşılaştır (zamanlama saldırısına karşı).', 'Sıra: biçim → imza → süre. İmza tutmadan yüke güvenme.'],
       why='JWT\'nin özü budur: yük herkes tarafından okunabilir ama gizli anahtar olmadan değiştirilemez; değiştirilirse imza tutmaz. Süre kontrolü çalınan tokenların ömrünü sınırlar. Kendi kripto kodunu üretimde yazma; bu alıştırma mekanizmayı anlamak içindir.'),
  dict(id='fastapi-8', t='code', stage='Hata avı', kind='bug', diff=2,
       q='<p>Kredi başvurusu modeli yanlış çalışıyor: şehir alanı her zaman <code>None</code> çıkıyor, negatif gelir kabul ediliyor ve vade için 48 ay geçebiliyor. Kurallar: <code>gelir</code> 0\'dan büyük, <code>vade</code> 3-36 ay (dahil), <code>sehir</code> kırpılıp baş harfleri büyütülmüş (<code>title()</code>) olmalı ve boş olmamalı. <b>Hataları bul ve düzelt.</b></p>',
       start=r'''from pydantic import BaseModel, Field, field_validator


class KrediBasvurusu(BaseModel):
    musteri_id: int = Field(gt=0)
    gelir: float = Field(0)
    vade: int = Field(ge=3, lt=36)
    sehir: str

    @field_validator("sehir")
    @classmethod
    def sehir_duzenle(cls, v):
        v = v.strip().title()
        if not v:
            raise ValueError("şehir boş olamaz")
''',
       sol=r'''from pydantic import BaseModel, Field, field_validator


class KrediBasvurusu(BaseModel):
    musteri_id: int = Field(gt=0)
    gelir: float = Field(gt=0)
    vade: int = Field(ge=3, le=36)
    sehir: str

    @field_validator("sehir")
    @classmethod
    def sehir_duzenle(cls, v):
        v = v.strip().title()
        if not v:
            raise ValueError("şehir boş olamaz")
        return v
''',
       tests=r'''from pydantic import ValidationError
b = KrediBasvurusu(musteri_id=1, gelir=45000, vade=36, sehir="  izmir ")
assert b.sehir == "Izmir" or b.sehir == "İzmir", f"şehir kırpılıp title() uygulanmalı (doğrulayıcı değeri döndürmeli), gelen {b.sehir!r}"
assert b.vade == 36, "36 ay dahil olmalı (le=36)"
def hatali(**kw):
    try:
        KrediBasvurusu(**{"musteri_id": 1, "gelir": 1000, "vade": 12, "sehir": "Bursa", **kw})
        return None
    except ValidationError as e:
        return [h["loc"][0] for h in e.errors()]
assert hatali(gelir=-500) == ["gelir"], "negatif gelir reddedilmeli: Field(0) bir kısıt değil, varsayılan değerdir"
assert hatali(gelir=0) == ["gelir"], "sıfır gelir reddedilmeli"
assert hatali(vade=48) == ["vade"] and hatali(vade=2) == ["vade"], "vade 3-36 dışı reddedilmeli"
assert hatali(sehir="   ") == ["sehir"], "boş şehir reddedilmeli"
assert KrediBasvurusu.model_fields["gelir"].is_required(), "gelir zorunlu olmalı (varsayılanı olmamalı)"
''',
       hints=['field_validator dönen değeri alanın yeni değeri yapar; return unutulursa değer None olur.', 'Field\'in ilk konumsal argümanı varsayılan değerdir: Field(0) "varsayılan 0" demektir, kısıt değil.', 'lt "küçüktür", le "küçük eşittir" demektir.'],
       why='Üç hata da sessizdir: hiçbiri istisna fırlatmaz, yanlış veriyi kabul eder. Bu yüzden model kurallarını sınır değerleriyle (0, 36, 37, boş metin) test etmek gerekir; FastAPI\'de bu modeller doğrudan API sözleşmesidir.'),
  dict(id='fastapi-9', t='code', stage='Hata avı', kind='bug', diff=2,
       q='<p>Başvuru ön değerlendirme uç noktası üç dış kontrolü (skor, kara liste, gelir) <b>paralel</b> çalıştırmalı ve <code>{"skor": ..., "kara_liste": ..., "gelir_dogrulandi": ...}</code> döndürmeli. Ama sonuç sözlüğünde değerler yerine coroutine nesneleri var ve kontroller sırayla çalışıyor. <b>Hataları bul ve düzelt.</b> Kontrol fonksiyonlarını (<code>skor_sor</code>, <code>kara_liste_sor</code>, <code>gelir_sor</code>) değiştirme; onlar testte yeniden tanımlanacak.</p>',
       start=r'''import asyncio
import time


async def skor_sor(musteri_id):
    time.sleep(0.01)
    return 720


async def kara_liste_sor(musteri_id):
    time.sleep(0.01)
    return False


async def gelir_sor(musteri_id):
    time.sleep(0.01)
    return True


async def on_degerlendirme(musteri_id):
    skor = skor_sor(musteri_id)
    kara = kara_liste_sor(musteri_id)
    gelir = gelir_sor(musteri_id)
    return {"skor": skor, "kara_liste": kara, "gelir_dogrulandi": gelir}
''',
       sol=r'''import asyncio


async def skor_sor(musteri_id):
    await asyncio.sleep(0.01)
    return 720


async def kara_liste_sor(musteri_id):
    await asyncio.sleep(0.01)
    return False


async def gelir_sor(musteri_id):
    await asyncio.sleep(0.01)
    return True


async def on_degerlendirme(musteri_id):
    skor, kara, gelir = await asyncio.gather(
        skor_sor(musteri_id), kara_liste_sor(musteri_id), gelir_sor(musteri_id)
    )
    return {"skor": skor, "kara_liste": kara, "gelir_dogrulandi": gelir}
''',
       tests=r'''import asyncio, warnings
warnings.simplefilter("ignore", RuntimeWarning)
iz = {"aktif": 0, "en_cok": 0}
async def _izle(deger):
    iz["aktif"] += 1
    iz["en_cok"] = max(iz["en_cok"], iz["aktif"])
    await asyncio.sleep(0.01)
    iz["aktif"] -= 1
    return deger
async def skor_sor(m):
    return await _izle(650 + m)
async def kara_liste_sor(m):
    return await _izle(m == 13)
async def gelir_sor(m):
    return await _izle(True)
loop = asyncio.new_event_loop()
r = loop.run_until_complete(on_degerlendirme(13))
loop.close()
assert r == {"skor": 663, "kara_liste": True, "gelir_dogrulandi": True}, f"değerler await edilmeli: {r}"
assert iz["en_cok"] == 3, f"üç kontrol aynı anda çalışmalı (asyncio.gather), gözlenen eşzamanlılık {iz['en_cok']}"
''',
       hints=['async fonksiyonu await etmeden çağırmak yalnızca bir coroutine nesnesi üretir; hiç çalışmaz.', 'Ayrı ayrı await etmek değerleri verir ama sırayla çalıştırır; paralellik için asyncio.gather.', 'time.sleep olay döngüsünü bloklar; async kodda asyncio.sleep kullanılır.'],
       why='await unutmak async koddaki en yaygın hatadır ve Python yalnızca "coroutine was never awaited" uyarısı verir. FastAPI\'de bu, yanıtın serileştirilememesi ya da sessizce yanlış veri dönmesi olarak görünür. gather ile toplam süre en yavaş kontrolün süresine iner.'),
  dict(id='fastapi-10', t='code', stage='Meydan okuma', diff=3,
       q='<p>FastAPI\'nin bağımlılık çözücüsünü yaz. <code>Depends</code> sınıfı hazır. <code>coz(fn, istek)</code>:</p><ul><li><code>inspect.signature(fn)</code> ile parametreleri gez. Varsayılanı <code>Depends(dep)</code> olanlar için <code>dep</code>\'i <b>özyinelemeli</b> çöz ve sonucu ver.</li><li>Diğer parametreler <code>istek</code> sözlüğünden alınsın; sözlükte yoksa ve varsayılanı varsa varsayılan kullanılsın; ikisi de yoksa <code>TypeError</code>.</li><li><b>Önbellek:</b> aynı istek içinde aynı bağımlılık fonksiyonu yalnız <b>bir kez</b> çağrılsın (birden çok yerde istense de).</li><li><b>yield\'li bağımlılık:</b> <code>inspect.isgeneratorfunction(dep)</code> ise <code>next()</code> ile değeri al; asıl fonksiyon bittikten sonra (istisna olsa bile) tüm üreteçleri <b>ters sırayla</b> kapat (<code>close()</code>; bu, üretecin <code>finally</code> bloğunu çalıştırır).</li></ul><p><code>coz</code> asıl fonksiyonun sonucunu döndürsün (istisnayı aynen dışarı iletsin).</p>',
       start=r'''import inspect


class Depends:
    def __init__(self, bagimlilik):
        self.bagimlilik = bagimlilik


def coz(fn, istek):
    kwargs = {}
    for p in inspect.signature(fn).parameters.values():
        if isinstance(p.default, Depends):
            kwargs[p.name] = p.default.bagimlilik()
        else:
            kwargs[p.name] = istek[p.name]
    return fn(**kwargs)
''',
       sol=r'''import inspect


class Depends:
    def __init__(self, bagimlilik):
        self.bagimlilik = bagimlilik


def _cagir(fn, istek, onbellek, uretecler):
    kwargs = {}
    for p in inspect.signature(fn).parameters.values():
        if isinstance(p.default, Depends):
            dep = p.default.bagimlilik
            if dep not in onbellek:
                if inspect.isgeneratorfunction(dep):
                    gen = _cagir(dep, istek, onbellek, uretecler)
                    uretecler.append(gen)
                    onbellek[dep] = next(gen)
                else:
                    onbellek[dep] = _cagir(dep, istek, onbellek, uretecler)
            kwargs[p.name] = onbellek[dep]
        elif p.name in istek:
            kwargs[p.name] = istek[p.name]
        elif p.default is not inspect.Parameter.empty:
            kwargs[p.name] = p.default
        else:
            raise TypeError(f"Eksik parametre: {p.name}")
    return fn(**kwargs)


def coz(fn, istek):
    uretecler = []
    try:
        return _cagir(fn, istek, {}, uretecler)
    finally:
        for gen in reversed(uretecler):
            gen.close()
''',
       tests=r'''olaylar = []
cagri = {"db": 0, "ayar": 0}

def ayarlar():
    cagri["ayar"] += 1
    return {"sayfa_boyu": 20}

def get_db(ayar=Depends(ayarlar)):
    cagri["db"] += 1
    olaylar.append("db açıldı")
    try:
        yield {"baglanti": "sqlite", "boyut": ayar["sayfa_boyu"]}
    finally:
        olaylar.append("db kapandı")

def get_log():
    olaylar.append("log açıldı")
    try:
        yield "log"
    finally:
        olaylar.append("log kapandı")

def aktif_kullanici(token, db=Depends(get_db)):
    if token != "tok-1":
        raise PermissionError("401")
    return {"ad": "Ayşe", "db": db["baglanti"]}

def siparislerim(sayfa=1, kullanici=Depends(aktif_kullanici), db=Depends(get_db), log=Depends(get_log), ayar=Depends(ayarlar)):
    olaylar.append("uç nokta çalıştı")
    return {"kullanici": kullanici["ad"], "sayfa": sayfa, "boyut": db["boyut"], "log": log}

r = coz(siparislerim, {"token": "tok-1", "sayfa": 3})
assert r == {"kullanici": "Ayşe", "sayfa": 3, "boyut": 20, "log": "log"}, f"sonuç hatalı: {r}"
assert cagri == {"db": 1, "ayar": 1}, f"aynı istekte her bağımlılık bir kez çağrılmalı (önbellek): {cagri}"
assert olaylar == ["db açıldı", "log açıldı", "uç nokta çalıştı", "log kapandı", "db kapandı"], f"üreteçler uç noktadan sonra ters sırayla kapanmalı: {olaylar}"
olaylar.clear()
try:
    coz(siparislerim, {"token": "yanlis"})
    assert False, "bağımlılıktaki istisna dışarı iletilmeli"
except PermissionError:
    pass
assert olaylar == ["db açıldı", "db kapandı"], f"istisna olsa bile açılan üreteç kapanmalı: {olaylar}"
assert cagri["db"] == 2, "yeni istek yeni önbellek kullanmalı"
assert coz(lambda sayfa=1: sayfa, {}) == 1, "istekte yoksa varsayılan kullanılmalı"
try:
    coz(lambda zorunlu: zorunlu, {})
    assert False, "eksik zorunlu parametre TypeError vermeli"
except TypeError:
    pass
''',
       hints=['Özyineleme için iç bir yardımcı yaz: (fn, istek, onbellek, uretecler) alsın; coz bunu yeni boş önbellek ve liste ile çağırsın.', 'yield\'li bağımlılıkta yardımcıyı çağırmak bir üreteç döndürür (fonksiyon gövdesi henüz çalışmaz); next(gen) değeri verir. Üreteci listeye ekle.', 'coz içinde try/finally kullan; finally\'de reversed(uretecler) üzerinde gen.close() çağır.'],
       why='Bu, FastAPI\'nin Depends sisteminin çekirdeğidir: imza okuma, alt bağımlılık ağacını çözme, istek başına önbellek (use_cache=True varsayılanı) ve yield\'li bağımlılıklarda kaynak temizliği. Veritabanı oturumu açıp kapatan get_db kalıbı tam olarak bu mekanizmaya dayanır.'),
  dict(id='fastapi-11', t='code', stage='Mini proje', diff=3,
       q='<p>Anadolu Market sipariş API\'sinin çekirdeğini yaz: <code>SiparisAPI(tokenlar)</code> sınıfı. <code>tokenlar</code>: <code>{token: kullanici_adi}</code>. Tek giriş noktası: <code>istek(metot, yol, govde=None, basliklar=None, sorgu=None)</code> → <code>(durum, yanit)</code>. <code>sorgu</code> bir sözlüktür (metin değerli).</p><ul><li><b>Kimlik:</b> her istekte <code>basliklar["Authorization"] == "Bearer &lt;token&gt;"</code> olmalı; yoksa ya da token bilinmiyorsa <code>(401, {"detail": "Kimlik doğrulanamadı"})</code>.</li><li><code>POST /siparisler</code>: gövde pydantic modeliyle doğrulansın: <code>urun</code> (en az 1 karakter), <code>adet</code> (1-50), <code>birim_fiyat</code> (&gt; 0). Hatalıysa <code>(422, {"detail": [{"loc": ["body", ...], "type": ...}, ...]})</code>. Geçerliyse <code>(201, {"id", "kullanici", "urun", "adet", "tutar"})</code>; <code>id</code> 1\'den artan, <code>tutar = round(adet * birim_fiyat, 2)</code>.</li><li><code>GET /siparisler</code>: yalnız <b>o kullanıcının</b> siparişleri; <code>sayfa</code> (varsayılan 1, ≥1) ve <code>boyut</code> (varsayılan 10, 1-50) sorgu parametreleri; geçersizse 422 (<code>loc</code> <code>["query", ad]</code>). Yanıt <code>{"toplam", "sayfa", "ogeler"}</code>.</li><li><code>GET /siparisler/{id}</code>: kullanıcının kendi siparişi; yoksa ya da başkasınınsa <code>(404, {"detail": "Sipariş bulunamadı"})</code>; id sayı değilse 422.</li><li>Diğer her yol/metot: <code>(404, {"detail": "Not Found"})</code>.</li></ul>',
       start=r'''from pydantic import BaseModel, Field, ValidationError


class SiparisAPI:
    def __init__(self, tokenlar):
        self.tokenlar = tokenlar

    def istek(self, metot, yol, govde=None, basliklar=None, sorgu=None):
        return 404, {"detail": "Not Found"}
''',
       sol=r'''from pydantic import BaseModel, Field, ValidationError


class SiparisOlustur(BaseModel):
    urun: str = Field(min_length=1)
    adet: int = Field(ge=1, le=50)
    birim_fiyat: float = Field(gt=0)


class Sayfalama(BaseModel):
    sayfa: int = Field(default=1, ge=1)
    boyut: int = Field(default=10, ge=1, le=50)


class HTTPHata(Exception):
    def __init__(self, durum, detay):
        self.durum, self.detay = durum, detay


def _detay(e, kaynak):
    return [{"loc": [kaynak, *h["loc"]], "type": h["type"]} for h in e.errors()]


class SiparisAPI:
    def __init__(self, tokenlar):
        self.tokenlar = tokenlar
        self.siparisler = {}

    def _kullanici(self, basliklar):
        deger = (basliklar or {}).get("Authorization", "")
        if not deger.startswith("Bearer ") or deger[7:] not in self.tokenlar:
            raise HTTPHata(401, "Kimlik doğrulanamadı")
        return self.tokenlar[deger[7:]]

    def istek(self, metot, yol, govde=None, basliklar=None, sorgu=None):
        try:
            kullanici = self._kullanici(basliklar)
            parca = yol.strip("/").split("/")
            if parca[0] != "siparisler" or len(parca) > 2:
                raise HTTPHata(404, "Not Found")
            if len(parca) == 1 and metot == "POST":
                return self._olustur(kullanici, govde or {})
            if len(parca) == 1 and metot == "GET":
                return self._listele(kullanici, sorgu or {})
            if len(parca) == 2 and metot == "GET":
                return self._getir(kullanici, parca[1])
            raise HTTPHata(404, "Not Found")
        except HTTPHata as h:
            return h.durum, {"detail": h.detay}
        except ValidationError as e:
            return 422, {"detail": _detay(e, "body")}

    def _olustur(self, kullanici, govde):
        veri = SiparisOlustur.model_validate(govde)
        yeni_id = len(self.siparisler) + 1
        kayit = {"id": yeni_id, "kullanici": kullanici, "urun": veri.urun,
                 "adet": veri.adet, "tutar": round(veri.adet * veri.birim_fiyat, 2)}
        self.siparisler[yeni_id] = kayit
        return 201, kayit

    def _listele(self, kullanici, sorgu):
        try:
            s = Sayfalama.model_validate(sorgu)
        except ValidationError as e:
            return 422, {"detail": _detay(e, "query")}
        benim = [k for k in self.siparisler.values() if k["kullanici"] == kullanici]
        bas = (s.sayfa - 1) * s.boyut
        return 200, {"toplam": len(benim), "sayfa": s.sayfa, "ogeler": benim[bas:bas + s.boyut]}

    def _getir(self, kullanici, ham_id):
        if not ham_id.isdigit():
            return 422, {"detail": [{"loc": ["path", "id"], "type": "int_parsing"}]}
        kayit = self.siparisler.get(int(ham_id))
        if kayit is None or kayit["kullanici"] != kullanici:
            raise HTTPHata(404, "Sipariş bulunamadı")
        return 200, kayit
''',
       tests=r'''api = SiparisAPI({"tok-a": "ayse", "tok-m": "mehmet"})
A = {"Authorization": "Bearer tok-a"}
M = {"Authorization": "Bearer tok-m"}
assert api.istek("GET", "/siparisler") == (401, {"detail": "Kimlik doğrulanamadı"}), "başlıksız istek 401"
assert api.istek("GET", "/siparisler", basliklar={"Authorization": "Bearer sahte"})[0] == 401, "bilinmeyen token 401"
assert api.istek("GET", "/siparisler", basliklar={"Authorization": "tok-a"})[0] == 401, "Bearer öneki zorunlu"
d, y = api.istek("POST", "/siparisler", {"urun": "Çay", "adet": 3, "birim_fiyat": 85.5}, A)
assert (d, y) == (201, {"id": 1, "kullanici": "ayse", "urun": "Çay", "adet": 3, "tutar": 256.5}), f"oluşturma hatalı: {d, y}"
api.istek("POST", "/siparisler", {"urun": "Kahve", "adet": "2", "birim_fiyat": 240}, M)
api.istek("POST", "/siparisler", {"urun": "Şeker", "adet": 1, "birim_fiyat": 32.25}, A)
d, y = api.istek("POST", "/siparisler", {"urun": "", "adet": 51}, A)
assert d == 422 and y == {"detail": [{"loc": ["body", "urun"], "type": "string_too_short"}, {"loc": ["body", "adet"], "type": "less_than_equal"}, {"loc": ["body", "birim_fiyat"], "type": "missing"}]}, f"422 gövdesi hatalı: {y}"
d, y = api.istek("GET", "/siparisler", basliklar=A)
assert d == 200 and y["toplam"] == 2 and [s["urun"] for s in y["ogeler"]] == ["Çay", "Şeker"], "yalnız kendi siparişleri"
d, y = api.istek("GET", "/siparisler", basliklar=A, sorgu={"sayfa": "2", "boyut": "1"})
assert (d, y["sayfa"], [s["id"] for s in y["ogeler"]]) == (200, 2, [3]), "sayfalama sorgu metinlerini int'e çevirmeli"
d, y = api.istek("GET", "/siparisler", basliklar=A, sorgu={"sayfa": "0", "boyut": "x"})
assert d == 422 and [h["loc"] for h in y["detail"]] == [["query", "sayfa"], ["query", "boyut"]], f"sorgu hataları query konumlu olmalı: {y}"
assert api.istek("GET", "/siparisler/1", basliklar=A)[1]["urun"] == "Çay", "kendi siparişi getirilmeli"
assert api.istek("GET", "/siparisler/2", basliklar=A) == (404, {"detail": "Sipariş bulunamadı"}), "başkasının siparişi 404 (varlığı sızdırılmamalı)"
assert api.istek("GET", "/siparisler/99", basliklar=A)[0] == 404, "olmayan sipariş 404"
assert api.istek("GET", "/siparisler/abc", basliklar=A)[0] == 422, "sayı olmayan id 422"
assert api.istek("DELETE", "/siparisler/1", basliklar=A) == (404, {"detail": "Not Found"}), "tanımsız metot"
assert api.istek("GET", "/urunler", basliklar=A) == (404, {"detail": "Not Found"}), "tanımsız yol"
''',
       hints=['Önce kimlik, sonra yönlendirme: yolu "/" ile parçalara ayır, (metot, parça sayısı) ile uygun işleyiciye git.', 'Gövde ve sorgu için ayrı pydantic modelleri kullan (sorgu modeli varsayılanlı sayfa/boyut); ValidationError\'ı ["body"/"query", *loc] konumlarıyla 422\'ye çevir.', 'Hataları özel bir istisna sınıfıyla (durum, detay) fırlatıp tek bir except bloğunda yanıta çevirmek kodu sade tutar; başkasının siparişini 403 yerine 404 ile gizle.'],
       why='Bu yapı bir FastAPI uygulamasının istek hattını tek sınıfta toplar: güvenlik bağımlılığı (401), gövde ve sorgu doğrulaması (422, loc ile), iş kuralı (sahiplik kontrolü, 404) ve yanıt şeması. Başkasına ait kaydı 404 ile gizlemek, kayıt numaralarının tahmin edilmesini (IDOR açığı) zorlaştırır.'),
]

L = dict(
  id='fastapi', lv='ileri', mod='Web ve API', min=60,
  title='FastAPI ile API geliştirme',
  sum='Tip ipuçlarından otomatik doğrulama ve dokümantasyon üreten FastAPI ile path/query parametreleri, pydantic şemaları, 422 hataları, HTTPException, Depends ile bağımlılık enjeksiyonu, async uç noktalar, CORS, OAuth2/JWT, TestClient ve uvicorn\'u öğrenir; mekanizmaları pydantic ve asyncio ile kendin kurarsın.',
  goals=['FastAPI uygulamasını kurup uvicorn ile çalıştırır, /docs üzerinden API\'yi keşfedebilirim.', 'Tip ipuçlarıyla path, query ve gövde parametrelerini; pydantic ile istek ve yanıt şemalarını tanımlayabilirim.', '422 doğrulama hatalarını ve HTTPException ile iş hatalarını doğru durum kodlarıyla yönetirim.', 'Depends ile veritabanı oturumu, kimlik doğrulama ve sayfalama gibi ortak parçaları enjekte ederim.', 'async uç noktaları doğru kullanır, Flask, FastAPI ve Django arasında bilinçli seçim yaparım.'],
  body=body, ex=ex,
  faq=[
    dict(q='FastAPI kodunu neden burada çalıştıramıyorum?', a='FastAPI bir ASGI sunucusu (uvicorn) ile ağ bağlantısı dinler; tarayıcıdaki Python motoru buna izin vermez. Doğrulama motoru pydantic burada çalışır, bu yüzden alıştırmalar FastAPI\'nin yaptığı işi pydantic ve asyncio ile kurar. Gerçek kodu pip install "fastapi[standard]" ile kurup fastapi dev main.py ile çalıştır.'),
    dict(q='Uç noktayı def ile mi async def ile mi yazmalıyım?', a='İçeride await edeceğin asenkron bir kütüphane (httpx.AsyncClient, asyncpg, SQLAlchemy AsyncSession) kullanıyorsan async def. Senkron kütüphane (requests, sqlite3, senkron SQLAlchemy) kullanıyorsan düz def; FastAPI onu iş parçacığı havuzunda çalıştırır ve olay döngüsünü bloklamaz. En kötüsü async def içinde senkron bloklayan çağrıdır.'),
    dict(q='422 yerine 400 döndürebilir miyim?', a='Evet, RequestValidationError için kendi exception_handler\'ını yazarak durumu ve gövde biçimini değiştirebilirsin. Ama istemcilerin ve araçların çoğu FastAPI\'nin standart 422 biçimini bekler; kurumun API kılavuzu aksini söylemiyorsa varsayılanı koru.'),
    dict(q='SQLModel nedir, SQLAlchemy yerine mi kullanılır?', a='SQLModel, FastAPI\'nin yazarının geliştirdiği, pydantic ve SQLAlchemy\'yi tek model sınıfında birleştiren bir kütüphanedir; altta yine SQLAlchemy çalışır. Küçük ve orta projelerde tekrarı azaltır; karmaşık sorgular için SQLAlchemy dersinde öğrendiğin API\'ye inersin.'),
  ],
  mistakes=[
    dict(why='async def içinde bloklayan çağrı olay döngüsünü durdurur; tüm istekler bekler.',
         bad='@app.get("/kur")\nasync def kur():\n    return requests.get(URL).json()', good='@app.get("/kur")\nasync def kur():\n    async with httpx.AsyncClient() as c:\n        return (await c.get(URL)).json()'),
    dict(why='Veritabanı kaydını doğrudan döndürmek şifre özeti gibi alanları sızdırır; response_model ile filtrele.',
         bad='@app.get("/kullanicilar/{id}")\ndef getir(id: int):\n    return db_kullanici(id)', good='@app.get("/kullanicilar/{id}", response_model=KullaniciYanit)\ndef getir(id: int):\n    return db_kullanici(id)'),
    dict(why='Field\'in ilk konumsal argümanı varsayılan değerdir, kısıt değildir.',
         bad='fiyat: float = Field(0)', good='fiyat: float = Field(gt=0)'),
    dict(why='field_validator değeri döndürmezse alan None olur.',
         bad='@field_validator("sehir")\n@classmethod\ndef duzenle(cls, v):\n    v = v.strip().title()', good='@field_validator("sehir")\n@classmethod\ndef duzenle(cls, v):\n    return v.strip().title()'),
    dict(why='Üretimde allow_origins=["*"] ile kimlik bilgisi göndermek her siteye API\'ni açar.',
         bad='app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True)', good='app.add_middleware(CORSMiddleware, allow_origins=["https://magaza.anadolumarket.com"], allow_credentials=True)'),
  ])

emit(L, '/home/claude/py/v2/i4/fastapi.js')
