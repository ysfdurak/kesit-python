import sys
sys.path.insert(0, '.')
from jsgen import emit, ded, check_body

BODY = r'''
<h2>Proje: Anadolu Market Sipariş API'si</h2>
<p>Bu bitirme projesinde, ileri seviyede öğrendiklerini tek bir üretim kalitesinde serviste birleştireceksin: müşterinin sepetini siparişe çeviren, stoğu düşen, kuponu uygulayan, sipariş durumunu yöneten ve bunu güvenli bir HTTP API'si olarak sunan <b>Anadolu Market Sipariş API'si</b>. İşe alım mülakatlarında "bana bir sipariş servisi tasarla" sorusunun cevabı tam olarak bu projedir.</p>
<p>Tarayıcıda FastAPI çalışmaz; ama projenin asıl değeri web çatısında değil, katmanlarda. Şema, depo ve servis katmanlarını <b>gerçek</b> pydantic ve SQLAlchemy ile (bellek içi SQLite) kuracak, uç noktaları küçük bir yönlendiriciyle taklit edeceksin. Her adımın FastAPI karşılığını da göreceksin; kendi bilgisayarında birkaç satırla gerçek API'ye dönüşür.</p>

<h2>Mimari: dört katman</h2>
<p><b>Katmanlı mimari</b> (layered architecture), her katmanın tek bir sorumluluğu olduğu ve yalnızca bir alttaki katmanı tanıdığı bir düzendir. İstek yukarıdan aşağıya akar, cevap aşağıdan yukarıya döner:</p>
<pre class="out">  HTTP isteği  ──►  [ Uç nokta (endpoint) ]   yol, kimlik, şema doğrulama, HTTP kodu
                          │
                          ▼
                    [ Servis (service) ]       iş kuralları: stok, indirim, durum geçişi
                          │
                          ▼
                    [ Depo (repository) ]      veritabanı erişimi: ekle, getir, sorgula
                          │
                          ▼
                    [ Model / ORM ]            tablolar: urunler, siparisler, kalemler</pre>
<div class="tbl-wrap"><table>
<tr><th>Katman</th><th>Sorumluluk</th><th>Bilmez</th><th>Araç</th></tr>
<tr><td>Şema (schema)</td><td>Dışarıdan gelen/giden verinin biçimi ve doğrulaması</td><td>Veritabanı, iş kuralı</td><td>pydantic</td></tr>
<tr><td>Uç nokta</td><td>HTTP'yi servise çevirir, hatayı HTTP koduna eşler</td><td>SQL, indirim hesabı</td><td>FastAPI / mini yönlendirici</td></tr>
<tr><td>Servis</td><td>İş kuralları ve işlem (transaction) sınırı</td><td>HTTP, JSON</td><td>Saf Python</td></tr>
<tr><td>Depo</td><td>Kalıcılık: sorgu ve kayıt</td><td>İş kuralları</td><td>SQLAlchemy Session</td></tr>
<tr><td>Model</td><td>Tablo ve ilişki tanımları</td><td>Her şey</td><td>SQLAlchemy ORM</td></tr>
</table></div>
<p>Kazanç: servis katmanını HTTP olmadan test edersin, veritabanını değiştirmek yalnızca depoyu etkiler, aynı servisi yarın bir CLI ya da kuyruk tüketicisi de kullanabilir.</p>
<pre class="code">anadolu-siparis/
├── market/
│   ├── modeller.py      # SQLAlchemy ORM
│   ├── semalar.py       # pydantic
│   ├── depolar.py       # repository
│   ├── servisler.py     # iş kuralları
│   ├── hatalar.py       # alan hataları
│   ├── guvenlik.py      # hmac token
│   └── api.py           # FastAPI uç noktaları
├── tests/
├── Dockerfile
├── pyproject.toml
└── README.md</pre>

<h2>Adım 1: Şemalar (pydantic)</h2>
<p>Dış dünyadan gelen her veri güvenilmezdir. pydantic şeması türü, aralığı ve fazladan alanları <b>sınırda</b> denetler; servis katmanına yalnızca temiz veri ulaşır. Pydantic dersinde (<code>pydantic-dogrulama</code>) temelini gördün, burada API sözleşmesini kuruyoruz:</p>
<pre class="py">from pydantic import BaseModel, ConfigDict, Field, ValidationError, field_validator

class KalemGirdi(BaseModel):
    model_config = ConfigDict(extra="forbid")
    urun_id: int = Field(gt=0)
    adet: int = Field(ge=1, le=100)

class SiparisOlustur(BaseModel):
    model_config = ConfigDict(extra="forbid")
    kalemler: list[KalemGirdi] = Field(min_length=1)
    kupon: str | None = None

    @field_validator("kupon")
    @classmethod
    def kuponu_duzenle(cls, v):
        v = (v or "").strip().upper()
        return v or None

g = SiparisOlustur(kalemler=[{"urun_id": 1, "adet": 2}], kupon=" hosgeldin10 ")
print(g.kupon, g.model_dump())
try:
    SiparisOlustur(kalemler=[{"urun_id": 1, "adet": 0}], indirim=99)
except ValidationError as e:
    for h in e.errors():
        print(h["loc"], h["type"])</pre>

<h2>Adım 2: ORM modelleri ve depo</h2>
<p>Fiyatları <b>kuruş cinsinden tamsayı</b> tutuyoruz: kayan noktalı sayı (<code>0.1 + 0.2</code>) para için uygun değildir, SQLite ise <code>Decimal</code>'ı doğal desteklemez. Depo (repository) sınıfı SQLAlchemy oturumunu (Session) sarmalar; servis SQL görmez. SQLAlchemy dersinde ORM'i gördün; burada onu bir desenin parçası yapıyoruz.</p>
<pre class="py">from sqlalchemy import ForeignKey, String, create_engine, select
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, relationship

class Base(DeclarativeBase):
    pass

class Urun(Base):
    __tablename__ = "urunler"
    id: Mapped[int] = mapped_column(primary_key=True)
    ad: Mapped[str] = mapped_column(String(80), unique=True)
    fiyat_kurus: Mapped[int]
    stok: Mapped[int]

class Siparis(Base):
    __tablename__ = "siparisler"
    id: Mapped[int] = mapped_column(primary_key=True)
    musteri: Mapped[str]
    durum: Mapped[str] = mapped_column(default="yeni")
    toplam_kurus: Mapped[int] = mapped_column(default=0)
    kalemler: Mapped[list["Kalem"]] = relationship(back_populates="siparis")

class Kalem(Base):
    __tablename__ = "kalemler"
    id: Mapped[int] = mapped_column(primary_key=True)
    siparis_id: Mapped[int] = mapped_column(ForeignKey("siparisler.id"))
    urun_id: Mapped[int] = mapped_column(ForeignKey("urunler.id"))
    adet: Mapped[int]
    birim_kurus: Mapped[int]
    siparis: Mapped[Siparis] = relationship(back_populates="kalemler")

class UrunDepo:
    def __init__(self, oturum):
        self.oturum = oturum
    def ekle(self, ad, fiyat_kurus, stok):
        u = Urun(ad=ad, fiyat_kurus=fiyat_kurus, stok=stok)
        self.oturum.add(u)
        self.oturum.flush()          # id'yi almak için
        return u
    def getir(self, urun_id):
        return self.oturum.get(Urun, urun_id)
    def stokta_olanlar(self):
        return self.oturum.scalars(select(Urun).where(Urun.stok &gt; 0).order_by(Urun.ad)).all()

motor = create_engine("sqlite://")      # bellek içi
Base.metadata.create_all(motor)
with Session(motor) as oturum:
    depo = UrunDepo(oturum)
    depo.ekle("Çay 1 kg", 18950, 40)
    depo.ekle("Fındık 500 g", 24900, 0)
    depo.ekle("Bal 850 g", 42500, 12)
    oturum.commit()
    print([u.ad for u in depo.stokta_olanlar()], depo.getir(1).fiyat_kurus)</pre>

<h2>Adım 3: Servis katmanı ve iş kuralları</h2>
<p>Projenin kalbi burası. Kurallar:</p>
<ul>
<li><b>Stok:</b> siparişteki <b>bütün</b> kalemlerin stoğu önce kontrol edilir, ancak hepsi yeterliyse düşülür (ya hep ya hiç).</li>
<li><b>İndirim:</b> <code>HOSGELDIN10</code> ara toplamdan %10 (aşağı yuvarlanmış kuruş), <code>SEPET50</code> 5.000 kuruş (50 TL) indirir ama ara toplamı geçemez; bilinmeyen kupon hatadır.</li>
<li><b>Kargo:</b> indirim sonrası tutar 75.000 kuruş (750 TL) ve üzeriyse ücretsiz, değilse 3.990 kuruş.</li>
<li><b>Durum geçişleri:</b> sipariş bir <b>durum makinesi</b>dir (state machine); yalnızca izinli geçişler yapılabilir.</li>
</ul>
<pre class="py">KUPONLAR = {"HOSGELDIN10": ("yuzde", 10), "SEPET50": ("tutar", 5000)}
KARGO_ESIK, KARGO_UCRET = 75000, 3990
GECISLER = {"yeni": {"odendi", "iptal"}, "odendi": {"kargoda", "iptal"},
            "kargoda": {"teslim"}, "teslim": set(), "iptal": set()}

class GecersizKupon(Exception): pass
class GecersizGecis(Exception): pass

def fiyat_hesapla(kalemler, kupon=None):
    ara = sum(fiyat * adet for fiyat, adet in kalemler)
    indirim = 0
    if kupon:
        if kupon not in KUPONLAR:
            raise GecersizKupon(kupon)
        tur, deger = KUPONLAR[kupon]
        indirim = ara * deger // 100 if tur == "yuzde" else min(deger, ara)
    net = ara - indirim
    kargo = 0 if net &gt;= KARGO_ESIK else KARGO_UCRET
    return {"ara_toplam": ara, "indirim": indirim, "kargo": kargo, "toplam": net + kargo}

def gecis_kontrol(eski, yeni):
    if yeni not in GECISLER.get(eski, set()):
        raise GecersizGecis(f"{eski} -&gt; {yeni}")
    return yeni

print(fiyat_hesapla([(18950, 2), (42500, 1)], "HOSGELDIN10"))
print(fiyat_hesapla([(42500, 2)]))
print(gecis_kontrol("yeni", "odendi"))
try:
    gecis_kontrol("teslim", "iptal")
except GecersizGecis as e:
    print("Reddedildi:", e)</pre>
<div class="warn"><b>Servis HTTP bilmez</b>Servis katmanında <code>return 404</code> ya da <code>HTTPException</code> görürsen katmanlar karışmış demektir. Servis <b>alan hatası</b> (domain exception: <code>StokYetersiz</code>, <code>GecersizGecis</code>) fırlatır; onu HTTP koduna çevirmek uç noktanın işidir.</div>

<h2>Adım 4: Uç noktalar ve yönlendirme</h2>
<p>Bir web çatısının çekirdeği <b>yönlendiricidir</b> (router): metot + yol desenini işleyici fonksiyona eşler ve yoldaki parametreleri (<code>/siparisler/42</code> → <code>sid=42</code>) çıkarır. Önce gerçek FastAPI kodu:</p>
<pre class="code">from fastapi import Depends, FastAPI, Header, HTTPException

app = FastAPI(title="Anadolu Market Sipariş API")

def aktif_kullanici(authorization: str = Header()) -&gt; str:
    return token_dogrula(authorization.removeprefix("Bearer "), GIZLI, time.time())

@app.post("/siparisler", status_code=201)
def siparis_olustur(girdi: SiparisOlustur, kullanici: str = Depends(aktif_kullanici),
                    servis: SiparisServisi = Depends(servis_al)):
    return servis.olustur(kullanici, girdi)

@app.get("/siparisler/{sid}")
def siparis_getir(sid: int, kullanici: str = Depends(aktif_kullanici),
                  servis: SiparisServisi = Depends(servis_al)):
    return servis.getir(kullanici, sid)</pre>
<p>Kendi bilgisayarında dene: <code>pip install fastapi uvicorn sqlalchemy</code>, sonra <code>uvicorn market.api:app --reload</code> ve tarayıcıda <code>http://127.0.0.1:8000/docs</code>. FastAPI şemadan otomatik belge üretir. Aynı mantığı tarayıcıda küçük bir yönlendiriciyle kuralım:</p>
<pre class="py">class Yonlendirici:
    def __init__(self):
        self.rotalar = []

    def rota(self, metot, desen):
        def kaydet(f):
            self.rotalar.append((metot, desen.strip("/").split("/"), f))
            return f
        return kaydet

    def coz(self, metot, yol):
        parcalar = yol.strip("/").split("/")
        for m, desen, f in self.rotalar:
            if m != metot or len(desen) != len(parcalar):
                continue
            params = {}
            for d, p in zip(desen, parcalar):
                if d.startswith("{"):
                    ad, _, tur = d[1:-1].partition(":")
                    if tur == "int" and not p.isdigit():
                        break
                    params[ad] = int(p) if tur == "int" else p
                elif d != p:
                    break
            else:
                return f, params
        return None, {}

api = Yonlendirici()

@api.rota("GET", "/siparisler/{sid:int}")
def siparis_getir(sid):
    return 200, {"id": sid, "durum": "kargoda"}

f, params = api.coz("GET", "/siparisler/42")
print(params, f(**params))
print(api.coz("GET", "/siparisler/abc")[0])</pre>

<h2>Adım 5: Hata → HTTP durum kodu</h2>
<p>Her alan hatası tek bir yerde HTTP koduna eşlenir. FastAPI'de bu <code>@app.exception_handler(IsKuraliHatasi)</code> ile yapılır. Eşleme sınıf hiyerarşisini izler: <code>StokYetersiz</code>, <code>IsKuraliHatasi</code>'nin alt sınıfıysa kendi kaydı yoksa üst sınıfın kodunu alır.</p>
<div class="tbl-wrap"><table>
<tr><th>Hata</th><th>HTTP</th><th>Anlamı</th></tr>
<tr><td>Şema doğrulama (<code>ValidationError</code>)</td><td>422</td><td>İstek biçimi hatalı</td></tr>
<tr><td><code>YetkiHatasi</code></td><td>401</td><td>Token yok, bozuk ya da süresi dolmuş</td></tr>
<tr><td><code>BulunamadiHatasi</code></td><td>404</td><td>Kayıt yok (ya da başkasına ait: varlığını sızdırma)</td></tr>
<tr><td><code>IsKuraliHatasi</code> (stok, kupon, geçiş)</td><td>409</td><td>İstek geçerli ama mevcut durumla çelişiyor</td></tr>
<tr><td>Beklenmeyen istisna</td><td>500</td><td>Genel mesaj; ayrıntı yalnızca loga</td></tr>
</table></div>
<div class="tip"><b>500'de ayrıntı verme</b>Beklenmeyen hatanın metni (SQL sorgusu, dosya yolu) saldırgana sistem hakkında bilgi verir. İstemciye "Beklenmeyen bir hata oluştu" ve bir istek kimliği dön; asıl istisnayı istek kimliğiyle loga yaz.</div>

<h2>Adım 6: Kimlik doğrulama: hmac imzalı token</h2>
<p>Gerçek projelerde JWT ve OAuth2 kullanılır (Web güvenliği dersinde gördün); hepsinin çekirdeği <b>imzadır</b>. Sunucu <code>kullanici.son_kullanma</code> metnini gizli anahtarla HMAC-SHA256 ile imzalar; token değiştirilirse imza tutmaz. Karşılaştırmayı <code>hmac.compare_digest</code> ile yaparsın; <code>==</code> ilk farklı karakterde durduğu için zamanlama saldırısına (timing attack) açıktır.</p>
<pre class="py">import hashlib, hmac

GIZLI = b"gelistirme-anahtari"     # üretimde ortam değişkeninden

class YetkiHatasi(Exception): pass

def imza(metin, gizli):
    return hmac.new(gizli, metin.encode(), hashlib.sha256).hexdigest()

def token_uret(kullanici, son, gizli=GIZLI):
    govde = f"{kullanici}.{son}"
    return f"{govde}.{imza(govde, gizli)}"

def token_dogrula(token, gizli, simdi):
    try:
        kullanici, son, gelen = token.rsplit(".", 2)
        son = int(son)
    except ValueError:
        raise YetkiHatasi("bozuk token")
    if not hmac.compare_digest(gelen, imza(f"{kullanici}.{son}", gizli)):
        raise YetkiHatasi("imza geçersiz")
    if simdi &gt;= son:
        raise YetkiHatasi("süresi dolmuş")
    return kullanici

t = token_uret("ayse", 1_800_000_000)
print(t[:30] + "...")
print(token_dogrula(t, GIZLI, 1_700_000_000))
for sahte in [t.replace("ayse", "ali_"), "rastgele"]:
    try:
        token_dogrula(sahte, GIZLI, 1_700_000_000)
    except YetkiHatasi as e:
        print("Reddedildi:", e)</pre>

<h2>Adım 7: Testler</h2>
<p>Katmanlar sayesinde her düzeyi ayrı test edersin: fiyat ve geçiş kuralları için saf birim testleri, depo için bellek içi SQLite ile entegrasyon testleri, servis için depo yerine mock, uç noktalar için istek sözlüğüyle uçtan uca testler.</p>
<pre class="py">import unittest
from unittest.mock import Mock

class StokYetersiz(Exception): pass

class SiparisServisi:
    def __init__(self, urun_depo):
        self.urun_depo = urun_depo
    def stok_dus(self, kalemler):
        urunler = {uid: self.urun_depo.getir(uid) for uid, _ in kalemler}
        eksik = [uid for uid, adet in kalemler if urunler[uid]["stok"] &lt; adet]
        if eksik:
            raise StokYetersiz(eksik)
        for uid, adet in kalemler:
            self.urun_depo.stok_guncelle(uid, urunler[uid]["stok"] - adet)

class ServisTest(unittest.TestCase):
    def setUp(self):
        self.depo = Mock()
        self.depo.getir.side_effect = lambda uid: {1: {"stok": 5}, 2: {"stok": 1}}[uid]

    def test_hepsi_yeterli(self):
        SiparisServisi(self.depo).stok_dus([(1, 2), (2, 1)])
        self.assertEqual(self.depo.stok_guncelle.call_count, 2)

    def test_biri_yetersizse_hicbiri_dusmez(self):
        with self.assertRaises(StokYetersiz):
            SiparisServisi(self.depo).stok_dus([(1, 2), (2, 3)])
        self.depo.stok_guncelle.assert_not_called()

sonuc = unittest.TextTestRunner(verbosity=0).run(unittest.TestLoader().loadTestsFromTestCase(ServisTest))
print("Başarılı:", sonuc.wasSuccessful(), "| test:", sonuc.testsRun)</pre>

<h2>Adım 8: Dockerfile ve README</h2>
<p>Docker dersindeki kurallarla imajı hazırla ve projeyi bir README ile teslim et:</p>
<pre class="code">FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY market/ market/
RUN useradd --create-home app
USER app
EXPOSE 8000
CMD ["uvicorn", "market.api:app", "--host", "0.0.0.0", "--port", "8000"]</pre>
<pre class="code"># Anadolu Market Sipariş API

## Çalıştırma
    docker compose up --build        # API + PostgreSQL
    open http://localhost:8000/docs

## Ortam değişkenleri
| Ad            | Zorunlu | Açıklama                    |
| DATABASE_URL  | evet    | postgresql://...            |
| TOKEN_GIZLI   | evet    | HMAC imza anahtarı          |

## Uç noktalar
POST  /siparisler                 201  sipariş oluştur
GET   /siparisler/{id}            200  sipariş getir
PATCH /siparisler/{id}/durum      200  durum değiştir

## Test
    python -m pytest -q</pre>
<div class="note"><b>Gerçek işte</b>E-ticaret ekiplerinde sipariş servisi en kritik servislerden biridir ve mülakatlarda en çok sorulan tasarım konularındandır. Kod incelemesinde bakılanlar genellikle şunlardır: iş kuralları servis katmanında mı, stok düşümü bir işlem (transaction) içinde mi, aynı istek iki kez gelirse (ağ tekrarı) iki sipariş oluşuyor mu, başka kullanıcının siparişi 404 ile mi gizleniyor, para tamsayı kuruşla mı tutuluyor ve hata yolları test edilmiş mi. Bu projede hepsini tek tek kuruyorsun.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Eşzamanlı stok ve kilitleme</h3>
<p>Aynı anda iki müşteri son ürünü alırsa ikisi de "stok 1" okuyup düşebilir (yarış durumu, race condition). PostgreSQL'de <code>SELECT ... FOR UPDATE</code> (SQLAlchemy: <code>select(Urun).with_for_update()</code>) satırı işlem bitene kadar kilitler; alternatif olarak koşullu güncelleme yapılır: <code>UPDATE urunler SET stok = stok - 2 WHERE id = 1 AND stok &gt;= 2</code> ve etkilenen satır sayısı 0 ise stok yetersizdir.</p>
<h3>Tekrar güvenliği (idempotency)</h3>
<p>Mobil uygulama zaman aşımına uğrayıp isteği tekrar gönderirse iki sipariş oluşmamalı. İstemci her işlem için bir <code>Idempotency-Key</code> başlığı gönderir; sunucu anahtarı ve ilk cevabı saklar, aynı anahtarla gelen ikinci isteğe aynı cevabı döner.</p>
<h3>Şema göçleri ve sürümleme</h3>
<p>Üretimde tablo yapısı <code>create_all</code> ile değil <b>Alembic</b> göçleriyle (migration) değişir. API'yi kıran değişiklikler <code>/v2/</code> önekiyle ya da yeni alanları isteğe bağlı ekleyerek yapılır; eski istemciler bir süre çalışmaya devam etmelidir.</p>
</section>
'''

LESSON = {
 'id': 'proje-api', 'lv': 'ileri', 'mod': 'Bitirme', 'min': 120,
 'title': 'Bitirme projesi: Anadolu Market Sipariş API\'si',
 'sum': 'Katmanlı mimariyle (şema → depo → servis → uç nokta) bir sipariş API\'si kurarsın: pydantic şemaları, SQLAlchemy deposu, stok-indirim-durum kurallarını taşıyan servis, mini yönlendirici ve FastAPI karşılığı, hata→HTTP eşleme, hmac token, testler, Dockerfile ve README.',
 'goals': [
  'Bir API\'yi şema, depo, servis ve uç nokta katmanlarına ayırıp her katmanın sorumluluğunu açıklayabilirim.',
  'pydantic ile istek sözleşmesini, SQLAlchemy ile bellek içi SQLite üzerinde depo katmanını kurabilirim.',
  'Stok kontrolü, kupon indirimi, kargo ve sipariş durum geçişlerini servis katmanında test edilebilir biçimde yazarım.',
  'Yönlendirme, hmac imzalı token ile kimlik doğrulama ve alan hatalarını HTTP durum kodlarına eşlemeyi uygularım.',
  'Projeyi unittest ve mock ile test eder, Dockerfile ve README ile teslim edilebilir hâle getiririm.'],
 'body': BODY,
}

HATALAR = ded('''
    class UygulamaHatasi(Exception): pass
    class BulunamadiHatasi(UygulamaHatasi): pass
    class YetkiHatasi(UygulamaHatasi): pass
    class IsKuraliHatasi(UygulamaHatasi): pass
    class StokYetersiz(IsKuraliHatasi): pass
    class GecersizKupon(IsKuraliHatasi): pass
    class GecersizGecis(IsKuraliHatasi): pass
''')

KURALLAR = ded('''
    KUPONLAR = {"HOSGELDIN10": ("yuzde", 10), "SEPET50": ("tutar", 5000)}
    KARGO_ESIK, KARGO_UCRET = 75000, 3990
    GECISLER = {"yeni": {"odendi", "iptal"}, "odendi": {"kargoda", "iptal"},
                "kargoda": {"teslim"}, "teslim": set(), "iptal": set()}
''')

MODELLER = ded('''
    from sqlalchemy import ForeignKey, String, create_engine, select
    from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, relationship

    class Base(DeclarativeBase):
        pass

    class Urun(Base):
        __tablename__ = "urunler"
        id: Mapped[int] = mapped_column(primary_key=True)
        ad: Mapped[str] = mapped_column(String(80), unique=True)
        fiyat_kurus: Mapped[int]
        stok: Mapped[int]
''')

EX = []
EX += [
 {'t': 'mc', 'stage': 'Isınma', 'q': '"Siparişteki ürünlerin stoğu yeterli mi?" kontrolü katmanlı mimaride nerede yapılmalı?',
  'o': ['Uç nokta fonksiyonunda, HTTP isteği gelir gelmez', 'Servis katmanında, iş kuralı olarak', 'pydantic şemasında, alan doğrulayıcısıyla', 'Depo katmanında, her SELECT sorgusunun içinde ayrı ayrı'],
  'a': 1, 'why': 'Stok kontrolü bir iş kuralıdır ve veritabanındaki güncel duruma bağlıdır; servis katmanına aittir. Şema yalnızca biçimi (adet pozitif mi) denetler, uç nokta HTTP\'yi çevirir, depo ise yalnızca veriyi okur/yazar.'},
 {'t': 'mc', 'stage': 'Isınma', 'q': 'İstek biçimi doğru (geçerli JSON, adet pozitif) ama ürünün stoğu yetersiz. Hangi HTTP durum kodu en uygundur?',
  'o': ['400 Bad Request', '404 Not Found', '409 Conflict', '500 Internal Server Error'],
  'a': 2, 'why': '409, isteğin kendisi geçerli olduğu hâlde kaynağın mevcut durumuyla çeliştiğini anlatır. 400/422 biçim hatası, 404 olmayan kaynak, 500 sunucunun kendi hatası içindir.'},
 {'t': 'mc', 'stage': 'Isınma', 'q': 'Token imzasını doğrularken neden <code>gelen == beklenen</code> yerine <code>hmac.compare_digest(gelen, beklenen)</code> kullanılır?',
  'o': ['compare_digest büyük/küçük harf farkını yok sayar', 'compare_digest her zaman sabit sürede karşılaştırır; zamanlama saldırısını önler', '== iki metni karşılaştıramaz, TypeError verir', 'compare_digest imzayı ayrıca şifreler ve böylece token\'ı daha kısa hâle getirir'],
  'a': 1, 'why': '== ilk farklı karakterde durur; saldırgan cevap süresini ölçerek imzayı karakter karakter tahmin edebilir. compare_digest karşılaştırmayı girdiden bağımsız sürede yapar.'},
]
EX += [
 {'t': 'predict', 'stage': 'Kodu oku', 'q': 'pydantic iç içe bir listede hata bulursa konumu nasıl raporlar?',
  'code': ded('''
    from pydantic import BaseModel, Field, ValidationError

    class KalemGirdi(BaseModel):
        urun_id: int = Field(gt=0)
        adet: int = Field(ge=1, le=100)

    class SiparisOlustur(BaseModel):
        kalemler: list[KalemGirdi] = Field(min_length=1)

    try:
        SiparisOlustur(kalemler=[{"urun_id": 3, "adet": 2}, {"urun_id": 5, "adet": 0}])
    except ValidationError as e:
        h = e.errors()
        print(len(h), h[0]["loc"])
  '''),
  'o': ["1 ('kalemler', 1, 'adet')", "1 ('adet',)", "2 ('kalemler', 'adet')", "1 ('kalemler', 0, 'adet')"], 'a': 0,
  'why': 'Yalnızca ikinci kalemin adeti hatalı; loc tam yolu verir: kalemler alanı, 1. indeks (0 tabanlı), adet alanı. Uç nokta bunu "kalemler.1.adet" gibi bir alan adına çevirip istemciye gösterebilir.'},
 {'t': 'predict', 'stage': 'Kodu oku', 'q': 'Bu kod ne yazdırır?',
  'code': ded('''
    desen = "/siparisler/{sid:int}/durum"
    yol = "/siparisler/42/durum"
    params = {}
    for d, y in zip(desen.strip("/").split("/"), yol.strip("/").split("/")):
        if d.startswith("{"):
            ad, _, tur = d[1:-1].partition(":")
            params[ad] = int(y) if tur == "int" else y
    print(params, len(desen.split("/")))
  '''),
  'o': ["{'sid': '42'} 3", "{'sid': 42} 3", "{'sid': 42} 4", "{'sid:int': 42} 4"], 'a': 2,
  'why': 'd[1:-1] süslü parantezleri atar, partition(":") adı ve türü ayırır; tür int olduğu için 42 sayıya çevrilir. strip yapılmamış desen "/" ile başladığı için split başta boş bir parça üretir: 4 eleman.'},
 {'t': 'predict', 'stage': 'Kodu oku', 'q': 'Fiyatlar kuruş cinsinden. Bu kod ne yazdırır?',
  'code': ded('''
    KUPONLAR = {"HOSGELDIN10": ("yuzde", 10), "SEPET50": ("tutar", 5000)}

    def indirim(ara, kupon):
        tur, deger = KUPONLAR[kupon]
        return ara * deger // 100 if tur == "yuzde" else min(deger, ara)

    print(indirim(18995, "HOSGELDIN10"), indirim(3000, "SEPET50"))
  '''),
  'o': ['1899.5 3000', '1899 5000', '1900 3000', '1899 3000'], 'a': 3,
  'why': '18995 * 10 // 100 = 189950 // 100 = 1899 (tam bölme aşağı yuvarlar, kuruş tamsayı kalır). SEPET50 indirimi ara toplamı geçemez: min(5000, 3000) = 3000.'},
 {'t': 'order', 'stage': 'Kodu oku', 'q': '<p>Depo katmanının en alt düzeyi: bellek içi SQLite\'ta tablo oluşturup stokta olan ürünleri sorgulayan SQLAlchemy kodunun satırlarını sırala.</p>',
  'lines': ['from sqlalchemy import create_engine, text', 'motor = create_engine("sqlite://")', 'with motor.begin() as bag:', '    bag.execute(text("CREATE TABLE urun (ad TEXT, stok INT)"))', '    bag.execute(text("INSERT INTO urun VALUES (\'Çay\', 5), (\'Kahve\', 0), (\'Bal\', 2)"))', '    sonuc = bag.execute(text("SELECT ad FROM urun WHERE stok > 0 ORDER BY ad"))', '    print(sonuc.scalars().all())'],
  'expect': "['Bal', 'Çay']\n",
  'hint': 'Önce motor, sonra bağlantı; tablo oluşturulmadan veri eklenemez, veri eklenmeden sorgu boş döner.',
  'why': 'create_engine bağlantı havuzunu kurar; begin() bir işlem açar ve blok sonunda commit eder. CREATE → INSERT → SELECT sırası zorunludur. scalars() her satırın ilk sütununu verir.'},
]
EX += [
 {'t': 'code', 'id': 'proje-api-1', 'stage': 'Rehberli', 'diff': 2,
  'q': '<p><b>Katman 1: Şema.</b> pydantic ile iki şema yaz:</p><ul><li><code>KalemGirdi</code>: <code>urun_id: int</code> (0\'dan büyük), <code>adet: int</code> (1–100 arası).</li><li><code>SiparisOlustur</code>: <code>kalemler: list[KalemGirdi]</code> (en az 1 eleman), <code>kupon: str | None = None</code>. Kupon <code>field_validator</code> ile kırpılıp büyük harfe çevrilsin; boş metin <code>None</code> olsun.</li><li>İki şema da bilinmeyen alanları reddetsin: <code>model_config = ConfigDict(extra="forbid")</code>.</li></ul>',
  'guide': ['KalemGirdi\'de Field(gt=0) ve Field(ge=1, le=100) kullan.', 'SiparisOlustur\'da kalemler için Field(min_length=1) ver.', 'Her iki sınıfa model_config = ConfigDict(extra="forbid") ekle.', '@field_validator("kupon") + @classmethod ile v\'yi (v or "").strip().upper() yap, boşsa None döndür.'],
  'example': ded('''
    from pydantic import BaseModel, ConfigDict, Field, field_validator

    class MusteriGirdi(BaseModel):
        model_config = ConfigDict(extra="forbid")
        ad: str = Field(min_length=2)
        sehir: str | None = None

        @field_validator("sehir")
        @classmethod
        def sehir_duzenle(cls, v):
            v = (v or "").strip().title()
            return v or None

    print(MusteriGirdi(ad="Ayşe", sehir="  izmir "))
    print(MusteriGirdi(ad="Ali", sehir="   "))
  '''),
  'start': ded('''
    from pydantic import BaseModel, ConfigDict, Field, field_validator

    class KalemGirdi(BaseModel):
        urun_id: int      # TODO: 0'dan büyük
        adet: int         # TODO: 1..100

    class SiparisOlustur(BaseModel):
        kalemler: list[KalemGirdi]     # TODO: en az 1 eleman
        kupon: str | None = None
        # TODO: extra="forbid" ve kupon doğrulayıcısı
  '''),
  'sol': ded('''
    from pydantic import BaseModel, ConfigDict, Field, field_validator

    class KalemGirdi(BaseModel):
        model_config = ConfigDict(extra="forbid")
        urun_id: int = Field(gt=0)
        adet: int = Field(ge=1, le=100)

    class SiparisOlustur(BaseModel):
        model_config = ConfigDict(extra="forbid")
        kalemler: list[KalemGirdi] = Field(min_length=1)
        kupon: str | None = None

        @field_validator("kupon")
        @classmethod
        def kupon_duzenle(cls, v):
            v = (v or "").strip().upper()
            return v or None
  '''),
  'tests': ded('''
    from pydantic import ValidationError
    s = SiparisOlustur(kalemler=[{"urun_id": 1, "adet": 3}], kupon=" hosgeldin10 ")
    assert s.kupon == "HOSGELDIN10", "Kupon kırpılıp büyük harfe çevrilmeli"
    assert s.kalemler[0].adet == 3, "Kalemler KalemGirdi nesnesine dönüşmeli"
    assert SiparisOlustur(kalemler=[{"urun_id": 1, "adet": 1}], kupon="  ").kupon is None, "Boş kupon None olmalı"
    def hatali(**veri):
        try:
            SiparisOlustur(**veri)
        except ValidationError as e:
            return [h["loc"] for h in e.errors()]
        return None
    assert hatali(kalemler=[]) == [("kalemler",)], "Boş kalem listesi reddedilmeli (min_length=1)"
    assert hatali(kalemler=[{"urun_id": 0, "adet": 1}]) == [("kalemler", 0, "urun_id")], "urun_id 0 reddedilmeli (gt=0)"
    assert hatali(kalemler=[{"urun_id": 1, "adet": 101}]) == [("kalemler", 0, "adet")], "adet 100'ü geçemez"
    assert hatali(kalemler=[{"urun_id": 1, "adet": 1}], indirim=50) == [("indirim",)], "Bilinmeyen alan reddedilmeli: istemci indirimi kendisi belirleyemez"
    assert hatali(kalemler=[{"urun_id": 1, "adet": 1, "fiyat": 1}]) == [("kalemler", 0, "fiyat")], "Kalemde de bilinmeyen alan (fiyat!) reddedilmeli"
  '''),
  'hints': ['Sınırlar Field ile verilir: gt, ge, le, min_length.', 'extra="forbid" her iki sınıfta da gerekli; kalem içine "fiyat" sızdırılmasını da engeller.', 'Doğrulayıcı: return (v or "").strip().upper() or None'],
  'why': 'Şema, API\'nin sözleşmesidir: istemcinin fiyat ya da indirim gibi alanları kendisi göndermesini daha sınırda engeller. extra="forbid" olmadan pydantic bilinmeyen alanları sessizce yok sayar ve istemcinin yazım hatası fark edilmez.'},
 {'t': 'code', 'id': 'proje-api-2', 'stage': 'Rehberli', 'diff': 2,
  'q': '<p><b>Katman 2: Depo.</b> Başlangıç kodundaki <code>Urun</code> modeli için <code>UrunDepo(oturum)</code> sınıfını yaz:</p><ul><li><code>ekle(ad, fiyat_kurus, stok)</code>: ürünü ekler, <code>flush</code> eder ve nesneyi döndürür (id dolu olmalı).</li><li><code>getir(urun_id)</code>: ürün ya da <code>None</code> (<code>oturum.get</code>).</li><li><code>ad_ile(ad)</code>: adı eşleşen ürün ya da <code>None</code> (<code>select ... where</code>).</li><li><code>stokta_olanlar()</code>: stoğu 0\'dan büyük ürünler, ada göre sıralı liste.</li></ul><p>Depo <code>commit</code> etmez; işlem sınırı servisin işidir.</p>',
  'guide': ['__init__ içinde oturumu sakla.', 'ekle: Urun(...) oluştur, oturum.add, oturum.flush, nesneyi döndür.', 'getir: self.oturum.get(Urun, urun_id).', 'ad_ile: self.oturum.scalars(select(Urun).where(Urun.ad == ad)).first().', 'stokta_olanlar: where(Urun.stok > 0).order_by(Urun.ad) ve .all().'],
  'example': ded('''
    from sqlalchemy import create_engine, select
    from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column

    class Base(DeclarativeBase):
        pass

    class Sube(Base):
        __tablename__ = "subeler"
        id: Mapped[int] = mapped_column(primary_key=True)
        sehir: Mapped[str]

    motor = create_engine("sqlite://")
    Base.metadata.create_all(motor)
    with Session(motor) as o:
        o.add_all([Sube(sehir="Van"), Sube(sehir="Bursa")])
        o.flush()
        print(o.get(Sube, 2).sehir)
        print([s.sehir for s in o.scalars(select(Sube).order_by(Sube.sehir)).all()])
  '''),
  'start': MODELLER + ded('''

    class UrunDepo:
        def __init__(self, oturum):
            self.oturum = oturum

        def ekle(self, ad, fiyat_kurus, stok):
            # TODO: ekle, flush, döndür
            pass

        def getir(self, urun_id):
            # TODO
            pass

        def ad_ile(self, ad):
            # TODO
            pass

        def stokta_olanlar(self):
            # TODO: stok > 0, ada göre sıralı
            return []
  '''),
  'sol': MODELLER + ded('''

    class UrunDepo:
        def __init__(self, oturum):
            self.oturum = oturum

        def ekle(self, ad, fiyat_kurus, stok):
            u = Urun(ad=ad, fiyat_kurus=fiyat_kurus, stok=stok)
            self.oturum.add(u)
            self.oturum.flush()
            return u

        def getir(self, urun_id):
            return self.oturum.get(Urun, urun_id)

        def ad_ile(self, ad):
            return self.oturum.scalars(select(Urun).where(Urun.ad == ad)).first()

        def stokta_olanlar(self):
            return list(self.oturum.scalars(
                select(Urun).where(Urun.stok > 0).order_by(Urun.ad)).all())
  '''),
  'tests': ded('''
    motor = create_engine("sqlite://")
    Base.metadata.create_all(motor)
    with Session(motor) as o:
        d = UrunDepo(o)
        cay = d.ekle("Çay 1 kg", 18950, 40)
        assert cay is not None and cay.id == 1, "ekle nesneyi döndürmeli ve flush ile id atanmış olmalı"
        d.ekle("Fındık", 24900, 0)
        d.ekle("Bal", 42500, 12)
        assert d.getir(3).ad == "Bal", "getir id ile ürünü bulmalı"
        assert d.getir(99) is None, "Olmayan id için None"
        assert d.ad_ile("Fındık").fiyat_kurus == 24900, "ad_ile adı eşleşen ürünü bulmalı"
        assert d.ad_ile("Kahve") is None, "Olmayan ad için None"
        assert [u.ad for u in d.stokta_olanlar()] == ["Bal", "Çay 1 kg"], "Stokta olanlar ada göre sıralı, Fındık (stok 0) hariç"
        o.rollback()
        assert UrunDepo(o).getir(1) is None, "Depo commit etmemeli; rollback sonrası kayıt kalmamalı"
  '''),
  'hints': ['SQLAlchemy 2 stili: oturum.scalars(select(Model).where(...)).', 'flush, INSERT\'i veritabanına gönderir ve id\'yi doldurur ama işlemi bitirmez; commit\'ten farklıdır.', 'Sıralı filtre: select(Urun).where(Urun.stok > 0).order_by(Urun.ad)'],
  'why': 'Depo, servisin SQL bilmeden veriye erişmesini sağlar; testte gerçek SQLite ile entegrasyon testi, servis testinde ise fake/mock ile değiştirilir. commit\'i servise bırakmak, birden fazla depo işlemini tek bir işlemde (ya hep ya hiç) toplamayı mümkün kılar.'},
 {'t': 'code', 'id': 'proje-api-3', 'stage': 'Rehberli', 'diff': 2,
  'q': '<p><b>Katman 3a: Fiyat kuralı.</b> <code>fiyat_hesapla(kalemler, kupon=None)</code> yaz. <code>kalemler</code>: <code>(birim_kurus, adet)</code> demetleri. Dönüş: <code>{"ara_toplam", "indirim", "kargo", "toplam"}</code> (hepsi kuruş, int).</p><ul><li>ara_toplam = Σ birim × adet</li><li>Kupon <code>KUPONLAR</code>\'da yoksa <code>GecersizKupon</code>. <code>"yuzde"</code>: <code>ara * deger // 100</code>; <code>"tutar"</code>: <code>min(deger, ara)</code>.</li><li>net = ara − indirim; net ≥ <code>KARGO_ESIK</code> ise kargo 0, değilse <code>KARGO_UCRET</code>.</li><li>toplam = net + kargo</li></ul>',
  'guide': ['sum(...) ile ara toplamı hesapla.', 'Kupon varsa KUPONLAR\'da ara; yoksa GecersizKupon fırlat.', 'Türüne göre indirimi hesapla.', 'Neti bul, eşiğe göre kargoyu seç, sözlüğü döndür.'],
  'example': ded('''
    KOMISYON = {"kart": ("yuzde", 2), "havale": ("tutar", 500)}

    def komisyon(tutar, kanal):
        tur, deger = KOMISYON[kanal]
        return tutar * deger // 100 if tur == "yuzde" else deger

    print(komisyon(12345, "kart"), komisyon(12345, "havale"))
  '''),
  'start': HATALAR + KURALLAR + ded('''

    def fiyat_hesapla(kalemler, kupon=None):
        ara = sum(f * a for f, a in kalemler)
        indirim = 0
        # TODO: kuponu doğrula ve indirimi hesapla
        net = ara - indirim
        kargo = KARGO_UCRET     # TODO: eşik kontrolü
        return {"ara_toplam": ara, "indirim": indirim, "kargo": kargo, "toplam": net + kargo}
  '''),
  'sol': HATALAR + KURALLAR + ded('''

    def fiyat_hesapla(kalemler, kupon=None):
        ara = sum(f * a for f, a in kalemler)
        indirim = 0
        if kupon:
            if kupon not in KUPONLAR:
                raise GecersizKupon(kupon)
            tur, deger = KUPONLAR[kupon]
            indirim = ara * deger // 100 if tur == "yuzde" else min(deger, ara)
        net = ara - indirim
        kargo = 0 if net >= KARGO_ESIK else KARGO_UCRET
        return {"ara_toplam": ara, "indirim": indirim, "kargo": kargo, "toplam": net + kargo}
  '''),
  'tests': ded('''
    assert fiyat_hesapla([(18950, 2), (42500, 1)]) == {"ara_toplam": 80400, "indirim": 0, "kargo": 0, "toplam": 80400}, "750 TL üstü kargo ücretsiz"
    assert fiyat_hesapla([(18950, 2), (42500, 1)], "HOSGELDIN10") == {"ara_toplam": 80400, "indirim": 8040, "kargo": 3990, "toplam": 76350}, "Kargo eşiği İNDİRİM SONRASI tutara bakar: 72360 < 75000"
    assert fiyat_hesapla([(1999, 1)], "HOSGELDIN10")["indirim"] == 199, "Yüzde indirim aşağı yuvarlanır (// ile)"
    assert fiyat_hesapla([(3000, 1)], "SEPET50") == {"ara_toplam": 3000, "indirim": 3000, "kargo": 3990, "toplam": 3990}, "Tutar indirimi ara toplamı geçemez"
    assert fiyat_hesapla([(75000, 1)])["kargo"] == 0, "Tam eşikte (75000) kargo ücretsiz"
    try:
        fiyat_hesapla([(100, 1)], "BEDAVA")
        assert False, "Bilinmeyen kupon GecersizKupon fırlatmalı"
    except GecersizKupon:
        pass
    assert isinstance(fiyat_hesapla([(101, 3)], "HOSGELDIN10")["toplam"], int), "Tüm tutarlar int kalmalı"
  '''),
  'hints': ['Kupon None ya da boşsa indirim 0 kalır: if kupon:', 'KUPONLAR[kupon] bir (tur, deger) demeti verir.', 'kargo = 0 if net >= KARGO_ESIK else KARGO_UCRET'],
  'why': 'Para kuruş cinsinden tamsayıyla tutulunca yuvarlama farkı oluşmaz ve // ile yuvarlama yönü açıkça bellidir. Kural saf bir fonksiyon olduğu için veritabanı ya da HTTP olmadan milisaniyede test edilir.'},
 {'t': 'code', 'id': 'proje-api-4', 'stage': 'Rehberli', 'diff': 1,
  'q': '<p><b>Katman 3b: Durum makinesi.</b> <code>durum_degistir(siparis, yeni)</code> yaz. <code>siparis</code> bir sözlük: <code>{"id", "durum", "gecmis"}</code>. Geçiş <code>GECISLER[eski]</code> içinde değilse (bilinmeyen durumlar dahil) <code>GecersizGecis(f"{eski} -&gt; {yeni}")</code> fırlat. Geçerliyse <b>yeni bir sözlük</b> döndür: durum güncellenmiş, <code>gecmis</code> listesinin sonuna <code>(eski, yeni)</code> eklenmiş. Girdi sözlüğü ve listesi değişmemeli.</p>',
  'guide': ['eski = siparis["durum"].', 'GECISLER.get(eski, set()) içinde yeni yoksa hata fırlat.', 'Yeni sözlüğü {**siparis, ...} ile kur; gecmis için yeni liste oluştur.', 'Yeni sözlüğü döndür.'],
  'example': ded('''
    IZINLI = {"taslak": {"onayda"}, "onayda": {"yayinda", "taslak"}, "yayinda": set()}

    def ilerlet(belge, yeni):
        if yeni not in IZINLI.get(belge["durum"], set()):
            raise ValueError(f"{belge['durum']} -> {yeni}")
        return {**belge, "durum": yeni}

    b = {"ad": "Kampanya", "durum": "taslak"}
    print(ilerlet(b, "onayda"), b)
  '''),
  'start': HATALAR + KURALLAR + ded('''

    def durum_degistir(siparis, yeni):
        eski = siparis["durum"]
        # TODO: geçişi doğrula
        siparis["durum"] = yeni          # TODO: girdiyi değiştirme, kopya döndür
        siparis["gecmis"].append((eski, yeni))
        return siparis
  '''),
  'sol': HATALAR + KURALLAR + ded('''

    def durum_degistir(siparis, yeni):
        eski = siparis["durum"]
        if yeni not in GECISLER.get(eski, set()):
            raise GecersizGecis(f"{eski} -> {yeni}")
        return {**siparis, "durum": yeni, "gecmis": siparis["gecmis"] + [(eski, yeni)]}
  '''),
  'tests': ded('''
    s0 = {"id": 7, "durum": "yeni", "gecmis": []}
    s1 = durum_degistir(s0, "odendi")
    s2 = durum_degistir(s1, "kargoda")
    assert s2["durum"] == "kargoda" and s2["gecmis"] == [("yeni", "odendi"), ("odendi", "kargoda")], "Geçmiş sırayla birikmeli"
    assert s0 == {"id": 7, "durum": "yeni", "gecmis": []}, "Girdi sözlüğü ve listesi değişmemeli"
    for eski, yeni in [("yeni", "kargoda"), ("kargoda", "iptal"), ("teslim", "iptal"), ("iptal", "yeni"), ("kayip", "yeni")]:
        try:
            durum_degistir({"id": 1, "durum": eski, "gecmis": []}, yeni)
            assert False, f"{eski} -> {yeni} geçişi reddedilmeli"
        except GecersizGecis as e:
            assert str(e) == f"{eski} -> {yeni}", "Mesaj 'eski -> yeni' biçiminde olmalı"
    assert isinstance(GecersizGecis("x"), IsKuraliHatasi), "GecersizGecis bir iş kuralı hatasıdır (HTTP 409)"
  '''),
  'hints': ['Bilinmeyen eski durum için GECISLER.get(eski, set()) boş küme verir.', 'Sözlük açma ile kopya: {**siparis, "durum": yeni}.', 'Listeyi + ile birleştirmek yeni liste üretir: siparis["gecmis"] + [(eski, yeni)].'],
  'why': 'Durum makinesi, "teslim edilmiş sipariş iptal edilemez" gibi kuralları tek bir tabloda toplar; yeni durum eklemek bir satırdır. Girdiyi değiştirmeyen fonksiyon, hata durumunda yarım kalmış güncellemeyi imkânsız kılar.'},
]
EX += [
 {'t': 'code', 'id': 'proje-api-5', 'stage': 'Kendin yaz', 'diff': 2,
  'q': '<p><b>Katman 4a: Yönlendirici.</b> <code>Yonlendirici</code> sınıfını yaz:</p><ul><li><code>ekle(metot, desen, isleyici)</code>: rotayı kaydeder. Desende <code>{ad}</code> metin, <code>{ad:int}</code> yalnızca rakamlardan oluşan ve int\'e çevrilen parametredir.</li><li><code>coz(metot, yol)</code>: <code>(isleyici, params)</code> döndürür. Sondaki <code>/</code> önemsizdir.</li><li>Hiçbir desen yolla eşleşmezse <code>RotaYok</code> (404) fırlat.</li><li>Yol eşleşiyor ama metot uymuyorsa <code>MetotYok</code> (405) fırlat; istisnanın <code>izinli</code> özniteliği o yol için izinli metotların sıralı listesi olsun.</li></ul><p><code>RotaYok</code> ve <code>MetotYok</code> sınıflarını da sen tanımla (<code>MetotYok.__init__(self, izinli)</code>).</p>',
  'sol': ded('''
    class RotaYok(Exception):
        pass

    class MetotYok(Exception):
        def __init__(self, izinli):
            super().__init__(", ".join(izinli))
            self.izinli = izinli

    class Yonlendirici:
        def __init__(self):
            self.rotalar = []

        def ekle(self, metot, desen, isleyici):
            self.rotalar.append((metot.upper(), desen.strip("/").split("/"), isleyici))

        @staticmethod
        def _eslestir(desen, parcalar):
            if len(desen) != len(parcalar):
                return None
            params = {}
            for d, p in zip(desen, parcalar):
                if d.startswith("{") and d.endswith("}"):
                    ad, _, tur = d[1:-1].partition(":")
                    if tur == "int":
                        if not p.isdigit():
                            return None
                        params[ad] = int(p)
                    else:
                        params[ad] = p
                elif d != p:
                    return None
            return params

        def coz(self, metot, yol):
            parcalar = yol.strip("/").split("/")
            izinli = set()
            for m, desen, f in self.rotalar:
                params = self._eslestir(desen, parcalar)
                if params is None:
                    continue
                if m == metot.upper():
                    return f, params
                izinli.add(m)
            if izinli:
                raise MetotYok(sorted(izinli))
            raise RotaYok(yol)
  '''),
  'tests': ded('''
    y = Yonlendirici()
    def liste(): return "liste"
    def olustur(): return "olustur"
    def getir(sid): return sid
    def durum(sid): return sid
    def urun(kod): return kod
    y.ekle("GET", "/siparisler", liste)
    y.ekle("POST", "/siparisler", olustur)
    y.ekle("GET", "/siparisler/{sid:int}", getir)
    y.ekle("PATCH", "/siparisler/{sid:int}/durum", durum)
    y.ekle("GET", "/urunler/{kod}", urun)
    assert y.coz("GET", "/siparisler") == (liste, {}), "Parametresiz rota"
    assert y.coz("POST", "/siparisler/") == (olustur, {}), "Sondaki / önemsiz olmalı"
    assert y.coz("GET", "/siparisler/42") == (getir, {"sid": 42}), "{sid:int} int'e çevrilmeli"
    assert y.coz("PATCH", "/siparisler/7/durum") == (durum, {"sid": 7}), "Çok parçalı desen"
    assert y.coz("GET", "/urunler/CAY-01") == (urun, {"kod": "CAY-01"}), "{kod} metin kalmalı"
    try:
        y.coz("GET", "/siparisler/abc"); assert False, "int olmayan sid eşleşmemeli -> RotaYok"
    except RotaYok:
        pass
    try:
        y.coz("DELETE", "/siparisler/5"); assert False, "Yol var ama metot yok -> MetotYok"
    except MetotYok as e:
        assert e.izinli == ["GET"], f"izinli ['GET'] olmalı, gelen {e.izinli}"
    try:
        y.coz("PUT", "/siparisler"); assert False
    except MetotYok as e:
        assert e.izinli == ["GET", "POST"], "İzinli metotlar sıralı liste olmalı"
    try:
        y.coz("GET", "/musteriler"); assert False, "Bilinmeyen yol RotaYok vermeli"
    except RotaYok:
        pass
  '''),
  'hints': ['Desen ve yolu strip("/").split("/") ile parçalara ayır; uzunluk farklıysa eşleşme yok.', 'Eşleşme yardımcı fonksiyonu params sözlüğü ya da None döndürsün; coz bunu tüm rotalarda dener.', 'Metot uymayan ama yolu eşleşen rotaların metotlarını bir kümede topla; sonunda küme doluysa MetotYok, boşsa RotaYok.'],
  'why': 'Starlette ve Flask\'ın yönlendiricileri de deseni derleyip her rotayı dener; 404 ile 405 ayrımı istemciye "bu adres yok" ile "bu adres var ama bu metodu desteklemiyor" farkını söyler. Gerçek 405 cevabı Allow başlığında izinli metotları listeler.'},
 {'t': 'code', 'id': 'proje-api-6', 'stage': 'Kendin yaz', 'diff': 2,
  'q': '<p><b>Katman 4b: Hata eşleme.</b> Başlangıç kodundaki hata hiyerarşisi için <code>hata_yaniti(hata)</code> yaz; <code>(durum_kodu, govde)</code> döndürsün:</p><ul><li>Eşleme <b>en özel</b> kayıtlı sınıfa göre yapılır (<code>type(hata).__mro__</code> sırasıyla ara): <code>BulunamadiHatasi</code> → (404, <code>"bulunamadi"</code>), <code>YetkiHatasi</code> → (401, <code>"yetkisiz"</code>), <code>IsKuraliHatasi</code> → (409, <code>"is_kurali"</code>), <code>StokYetersiz</code> → (409, <code>"stok_yetersiz"</code>).</li><li>Bunlar için gövde: <code>{"hata": kod, "mesaj": str(hata)}</code>.</li><li>pydantic <code>ValidationError</code> → 422, gövde <code>{"hata": "dogrulama", "ayrintilar": [{"alan": "kalemler.0.adet", "mesaj": msg}, ...]}</code> (loc elemanları str yapılıp nokta ile birleşir).</li><li>Diğer her şey → 500, <code>{"hata": "sunucu_hatasi", "mesaj": "Beklenmeyen bir hata oluştu"}</code> (iç ayrıntıyı sızdırma).</li></ul>',
  'start': HATALAR + ded('''
    from pydantic import ValidationError


    def hata_yaniti(hata):
        pass
  '''),
  'sol': HATALAR + ded('''
    from pydantic import ValidationError

    ESLEME = {
        BulunamadiHatasi: (404, "bulunamadi"),
        YetkiHatasi: (401, "yetkisiz"),
        IsKuraliHatasi: (409, "is_kurali"),
        StokYetersiz: (409, "stok_yetersiz"),
    }

    def hata_yaniti(hata):
        if isinstance(hata, ValidationError):
            ayrinti = [{"alan": ".".join(str(p) for p in h["loc"]), "mesaj": h["msg"]} for h in hata.errors()]
            return 422, {"hata": "dogrulama", "ayrintilar": ayrinti}
        for sinif in type(hata).__mro__:
            if sinif in ESLEME:
                kod, ad = ESLEME[sinif]
                return kod, {"hata": ad, "mesaj": str(hata)}
        return 500, {"hata": "sunucu_hatasi", "mesaj": "Beklenmeyen bir hata oluştu"}
  '''),
  'tests': ded('''
    from pydantic import BaseModel, Field
    assert hata_yaniti(BulunamadiHatasi("sipariş 9 yok")) == (404, {"hata": "bulunamadi", "mesaj": "sipariş 9 yok"}), "404 eşlemesi"
    assert hata_yaniti(YetkiHatasi("süresi dolmuş"))[0] == 401, "YetkiHatasi 401"
    assert hata_yaniti(StokYetersiz("Bal"))== (409, {"hata": "stok_yetersiz", "mesaj": "Bal"}), "En özel sınıf (StokYetersiz) kazanmalı"
    assert hata_yaniti(GecersizKupon("X")) == (409, {"hata": "is_kurali", "mesaj": "X"}), "Kaydı olmayan alt sınıf üst sınıfın (IsKuraliHatasi) eşlemesini almalı"
    class K(BaseModel):
        adet: int = Field(ge=1)
    class S(BaseModel):
        kalemler: list[K]
    try:
        S(kalemler=[{"adet": 0}])
    except Exception as e:
        kod, g = hata_yaniti(e)
        assert kod == 422 and g["hata"] == "dogrulama", "ValidationError 422 olmalı"
        assert g["ayrintilar"][0]["alan"] == "kalemler.0.adet", f"Alan yolu noktalı olmalı: {g['ayrintilar']}"
        assert "mesaj" in g["ayrintilar"][0], "Her ayrıntıda mesaj olmalı"
    kod, g = hata_yaniti(KeyError("SELECT * FROM kullanicilar"))
    assert kod == 500 and g == {"hata": "sunucu_hatasi", "mesaj": "Beklenmeyen bir hata oluştu"}, "500'de iç ayrıntı (SQL) sızdırılmamalı"
    assert hata_yaniti(UygulamaHatasi("genel"))[0] == 500, "Kaydı olmayan kök hata 500"
  '''),
  'hints': ['Eşlemeyi bir sözlükte tut: {Sinif: (kod, ad)}.', 'type(hata).__mro__ sınıfın kendisinden başlayıp üst sınıflara gider; ilk bulunan en özel olandır.', 'ValidationError kontrolünü en başta yap; loc demetini ".".join(str(p) for p in loc) ile birleştir.'],
  'why': 'Tek bir eşleme tablosu, her uç noktada tekrar eden try/except bloklarını ortadan kaldırır. MRO ile arama, yeni bir iş kuralı hatası eklediğinde kayıt yapmasan bile doğru (409) kodu almasını sağlar. 500\'de genel mesaj vermek bilgi sızıntısını önler.'},
 {'t': 'code', 'id': 'proje-api-7', 'stage': 'Kendin yaz', 'diff': 2,
  'q': '<p><b>Kimlik doğrulama.</b> İki fonksiyon yaz:</p><ul><li><code>token_uret(kullanici, son, gizli)</code>: <code>govde = f"{kullanici}.{son}"</code>, imza = <code>hmac.new(gizli, govde.encode(), hashlib.sha256).hexdigest()</code>; <code>f"{govde}.{imza}"</code> döndür.</li><li><code>token_dogrula(token, gizli, simdi)</code>: token\'ı <code>rsplit(".", 2)</code> ile ayır; üç parça çıkmazsa ya da <code>son</code> int değilse <code>YetkiHatasi("bozuk token")</code>. İmza <code>hmac.compare_digest</code> ile tutmazsa <code>YetkiHatasi("imza geçersiz")</code>. <code>simdi &gt;= son</code> ise <code>YetkiHatasi("süresi dolmuş")</code>. Geçerliyse kullanıcı adını döndür.</li></ul>',
  'start': ded('''
    import hashlib, hmac

    class YetkiHatasi(Exception):
        pass
  '''),
  'sol': ded('''
    import hashlib, hmac

    class YetkiHatasi(Exception):
        pass

    def _imza(govde, gizli):
        return hmac.new(gizli, govde.encode(), hashlib.sha256).hexdigest()

    def token_uret(kullanici, son, gizli):
        govde = f"{kullanici}.{son}"
        return f"{govde}.{_imza(govde, gizli)}"

    def token_dogrula(token, gizli, simdi):
        parcalar = token.rsplit(".", 2)
        if len(parcalar) != 3:
            raise YetkiHatasi("bozuk token")
        kullanici, son, imza = parcalar
        try:
            son_i = int(son)
        except ValueError:
            raise YetkiHatasi("bozuk token")
        if not hmac.compare_digest(imza, _imza(f"{kullanici}.{son}", gizli)):
            raise YetkiHatasi("imza geçersiz")
        if simdi >= son_i:
            raise YetkiHatasi("süresi dolmuş")
        return kullanici
  '''),
  'tests': ded('''
    import hashlib, hmac
    G = b"test-gizli"
    t = token_uret("ayse", 2000, G)
    assert t == "ayse.2000." + hmac.new(G, b"ayse.2000", hashlib.sha256).hexdigest(), "Token biçimi kullanici.son.imza olmalı"
    assert token_dogrula(t, G, 1999) == "ayse", "Geçerli token kullanıcıyı döndürmeli"
    assert token_dogrula(token_uret("ali.veli", 50, G), G, 1) == "ali.veli", "Kullanıcı adında nokta olabilir: rsplit kullan"
    def neden(tok, gizli=G, simdi=100):
        try:
            token_dogrula(tok, gizli, simdi)
        except YetkiHatasi as e:
            return str(e)
        return None
    assert neden(t, simdi=2000) == "süresi dolmuş", "simdi == son ise süresi dolmuş sayılır"
    assert neden(t.replace("ayse", "admn")) == "imza geçersiz", "Kullanıcı adı değiştirilirse imza tutmamalı"
    assert neden(t.replace(".2000.", ".9999.")) == "imza geçersiz", "Süre uzatılırsa imza tutmamalı"
    assert neden(t, gizli=b"baska") == "imza geçersiz", "Farklı anahtar imzayı bozar"
    assert neden("rastgele") == "bozuk token", "Parçasız token bozuk"
    assert neden("ayse.yarin.abc") == "bozuk token", "son sayı değilse bozuk"
    assert "compare_digest" in __source__, "İmza hmac.compare_digest ile karşılaştırılmalı"
  '''),
  'hints': ['rsplit(".", 2) sağdan en fazla iki kez böler; kullanıcı adındaki noktalar korunur.', 'İmzayı yeniden hesaplamak için aynı govde metnini (kullanici.son) kullan.', 'Sıra: biçim → imza → süre. Süreye imzadan önce bakarsan sahte bir token hakkında bilgi vermiş olursun.'],
  'why': 'İmza, token\'ın içeriğini değiştirmeyi imkânsız kılar: kullanıcı adı ya da süre değişince HMAC tutmaz. JWT de özünde budur (başlık.gövde.imza). Gizli anahtar ortam değişkeninden gelir ve asla koda yazılmaz.'},
]
EX += [
 {'t': 'code', 'id': 'proje-api-8', 'stage': 'Hata avı', 'kind': 'bug', 'diff': 2,
  'q': '<p><b>Hatayı bul ve düzelt.</b> Eski bir modül sepet toplamını TL cinsinden <code>float</code> ile hesaplıyor; muhasebe raporlarında kuruş farkları çıkıyor. <code>sepet_toplami(kalemler)</code> fonksiyonu <code>("19.99", 3)</code> gibi (fiyat metni, adet) demetleri alıp toplamı <b>kuruş cinsinden int</b> döndürmeli; <code>kdv_dahil(kurus, oran)</code> ise KDV\'yi ekleyip <b>yarım yukarı</b> (ROUND_HALF_UP) yuvarlanmış kuruş döndürmeli.</p>',
  'start': ded('''
    def sepet_toplami(kalemler):
        toplam = 0.0
        for fiyat, adet in kalemler:
            toplam += float(fiyat) * adet
        return int(toplam * 100)

    def kdv_dahil(kurus, oran):
        return round(kurus * (1 + oran / 100))
  '''),
  'sol': ded('''
    from decimal import Decimal, ROUND_HALF_UP

    def sepet_toplami(kalemler):
        toplam = Decimal("0")
        for fiyat, adet in kalemler:
            toplam += Decimal(fiyat) * adet
        return int(toplam * 100)

    def kdv_dahil(kurus, oran):
        sonuc = Decimal(kurus) * (Decimal(100) + Decimal(oran)) / Decimal(100)
        return int(sonuc.quantize(Decimal("1"), rounding=ROUND_HALF_UP))
  '''),
  'tests': ded('''
    assert sepet_toplami([("0.10", 1), ("0.20", 1)]) == 30, "0.10 + 0.20 TL = 30 kuruş olmalı (float ile 29 çıkar)"
    assert sepet_toplami([("19.99", 3), ("4.35", 1)]) == 6432, "19.99*3 + 4.35 = 64.32 TL = 6432 kuruş"
    assert sepet_toplami([("1.15", 1)]) == 115, "1.15 TL = 115 kuruş (float ile 114 çıkar)"
    assert kdv_dahil(1250, 20) == 1500, "1250 kuruş + %20 = 1500"
    assert kdv_dahil(1025, 10) == 1128, "1127.5 yarım yukarı 1128 olmalı"
    assert kdv_dahil(1225, 10) == 1348, "1347.5 yarım yukarı 1348 olmalı (round bankacı yuvarlaması yapar)"
    assert kdv_dahil(3, 50) == 5, "4.5 kuruş yarım yukarı 5 olmalı (round(4.5) bankacı yuvarlamasıyla 4 verir)"
    assert isinstance(sepet_toplami([("1", 1)]), int) and isinstance(kdv_dahil(1, 1), int), "Sonuçlar int olmalı"
  '''),
  'hints': ['float ikili tabanda 0.1\'i tam tutamaz; 1.15 * 100 = 114.99999... olur ve int() aşağı keser.', 'Fiyat metnini doğrudan Decimal("19.99") ile çevir; float\'tan geçirme.', 'Python\'un round()\'u yarımları çifte yuvarlar: round(4.5) == 4. Decimal.quantize(Decimal("1"), rounding=ROUND_HALF_UP) kullan.'],
  'why': 'Para hesaplarında float kullanmak kuruş kayıplarına yol açar; metinden Decimal\'e çevirmek değeri tam korur. round() bankacı yuvarlaması (yarımı çifte) yapar; muhasebede genellikle yarım yukarı istenir ve bu açıkça belirtilmelidir.'},
 {'t': 'code', 'id': 'proje-api-9', 'stage': 'Hata avı', 'kind': 'bug', 'diff': 2,
  'q': '<p><b>Hatayı bul ve düzelt.</b> <code>SiparisServisi.olustur</code> iki kalemli siparişte ikinci ürünün stoğu yetmeyince <code>StokYetersiz</code> fırlatıyor ama birinci ürünün stoğu <b>yine de düşmüş</b> oluyor. Ayrıca <code>getir(kullanici, sid)</code> başka bir kullanıcının siparişini döndürüyor. Beklenen: stok ya hep ya hiç düşmeli; sipariş başkasınınsa ya da yoksa <code>BulunamadiHatasi</code> (varlığını sızdırma).</p>',
  'start': HATALAR + ded('''

    class SiparisServisi:
        def __init__(self, stok):
            self.stok = stok            # {urun_id: adet}
            self.siparisler = {}
            self.sayac = 0

        def olustur(self, kullanici, kalemler):
            for uid, adet in kalemler:
                if self.stok.get(uid, 0) < adet:
                    raise StokYetersiz(uid)
                self.stok[uid] -= adet
            self.sayac += 1
            self.siparisler[self.sayac] = {"id": self.sayac, "kullanici": kullanici, "kalemler": list(kalemler)}
            return self.sayac

        def getir(self, kullanici, sid):
            if sid not in self.siparisler:
                raise BulunamadiHatasi(sid)
            return self.siparisler[sid]
  '''),
  'sol': HATALAR + ded('''

    class SiparisServisi:
        def __init__(self, stok):
            self.stok = stok            # {urun_id: adet}
            self.siparisler = {}
            self.sayac = 0

        def olustur(self, kullanici, kalemler):
            for uid, adet in kalemler:
                if self.stok.get(uid, 0) < adet:
                    raise StokYetersiz(uid)
            for uid, adet in kalemler:
                self.stok[uid] -= adet
            self.sayac += 1
            self.siparisler[self.sayac] = {"id": self.sayac, "kullanici": kullanici, "kalemler": list(kalemler)}
            return self.sayac

        def getir(self, kullanici, sid):
            s = self.siparisler.get(sid)
            if s is None or s["kullanici"] != kullanici:
                raise BulunamadiHatasi(sid)
            return s
  '''),
  'tests': ded('''
    s = SiparisServisi({1: 5, 2: 1})
    try:
        s.olustur("ayse", [(1, 2), (2, 3)])
        assert False, "Stok yetersizken StokYetersiz beklenir"
    except StokYetersiz:
        pass
    assert s.stok == {1: 5, 2: 1}, f"Başarısız siparişte hiçbir stok düşmemeli: {s.stok}"
    sid = s.olustur("ayse", [(1, 2), (2, 1)])
    assert s.stok == {1: 3, 2: 0}, "Başarılı siparişte tüm stoklar düşmeli"
    assert s.getir("ayse", sid)["kullanici"] == "ayse", "Sahibi siparişi görebilmeli"
    for k, i in [("mehmet", sid), ("ayse", 99)]:
        try:
            s.getir(k, i); assert False, "Başkasının ya da olmayan sipariş BulunamadiHatasi vermeli"
        except BulunamadiHatasi:
            pass
  '''),
  'hints': ['İki hata var: biri döngü yapısıyla, biri yetki kontrolüyle ilgili.', 'Önce tüm kalemleri kontrol eden bir döngü, ancak hepsi geçerse stoğu düşen ikinci bir döngü yaz.', 'getir\'de sipariş bulunsa bile kullanici eşleşmiyorsa BulunamadiHatasi fırlat (403 değil 404: varlığı gizle).'],
  'why': 'Kontrol ve değişikliği aynı döngüde yapmak, ortada bir hata çıkınca yarım kalmış bir durum bırakır; veritabanında bunu işlem (transaction) geri alma çözer, bellekte ise önce doğrula sonra uygula kalıbı. Başkasının kaynağına 404 dönmek, saldırganın sipariş numaralarını tarayıp hangilerinin var olduğunu öğrenmesini (IDOR) engeller.'},
]
EX += [
 {'t': 'code', 'id': 'proje-api-10', 'stage': 'Meydan okuma', 'diff': 3,
  'q': '<p><b>Atomik stok ayırma.</b> <code>stok_ayir(stok, kalemler)</code> yaz:</p><ul><li><code>stok</code>: <code>{urun_id: adet}</code>; <code>kalemler</code>: <code>(urun_id, adet)</code> listesi. Aynı ürün birden fazla satırda gelebilir; adetler toplanarak değerlendirilir.</li><li>Adet ≤ 0 olan satır varsa <code>ValueError</code>.</li><li>Yetersiz (ya da stokta hiç olmayan) ürünler varsa <code>StokYetersiz</code> fırlat; istisnanın <code>eksik</code> özniteliği <code>{urun_id: (istenen, mevcut)}</code> sözlüğü olsun (tüm eksikler).</li><li>Başarılıysa <b>yeni</b> bir stok sözlüğü döndür. <code>stok</code> asla değişmemeli.</li></ul><p><code>StokYetersiz</code> sınıfını <code>__init__(self, eksik)</code> ile sen tanımla.</p>',
  'sol': ded('''
    from collections import Counter

    class StokYetersiz(Exception):
        def __init__(self, eksik):
            super().__init__(f"yetersiz stok: {sorted(eksik)}")
            self.eksik = eksik

    def stok_ayir(stok, kalemler):
        istenen = Counter()
        for uid, adet in kalemler:
            if adet <= 0:
                raise ValueError(f"geçersiz adet: {uid} -> {adet}")
            istenen[uid] += adet
        eksik = {uid: (n, stok.get(uid, 0)) for uid, n in istenen.items() if stok.get(uid, 0) < n}
        if eksik:
            raise StokYetersiz(eksik)
        yeni = dict(stok)
        for uid, n in istenen.items():
            yeni[uid] -= n
        return yeni
  '''),
  'tests': ded('''
    S = {1: 5, 2: 2, 3: 0}
    assert stok_ayir(S, [(1, 2), (2, 2)]) == {1: 3, 2: 0, 3: 0}, "Başarılı ayırma yeni stok döndürmeli"
    assert S == {1: 5, 2: 2, 3: 0}, "Girdi stok sözlüğü değişmemeli"
    try:
        stok_ayir(S, [(1, 3), (2, 1), (1, 3)])
        assert False, "Aynı ürünün satırları toplanmalı: 3+3 = 6 > 5"
    except StokYetersiz as e:
        assert e.eksik == {1: (6, 5)}, f"eksik {{1: (6, 5)}} olmalı: {e.eksik}"
    try:
        stok_ayir(S, [(3, 1), (2, 5), (9, 1), (1, 1)])
        assert False
    except StokYetersiz as e:
        assert e.eksik == {3: (1, 0), 2: (5, 2), 9: (1, 0)}, f"Tüm eksikler raporlanmalı (stokta olmayan 9 dahil): {e.eksik}"
    assert S == {1: 5, 2: 2, 3: 0}, "Hata durumunda da stok değişmemeli"
    for kotu in [[(1, 0)], [(1, -2)]]:
        try:
            stok_ayir(S, kotu); assert False, "Adet <= 0 ValueError vermeli"
        except ValueError:
            pass
    assert stok_ayir({}, []) == {}, "Boş sipariş boş stokla çalışmalı"
  '''),
  'hints': ['Önce Counter ile ürün başına toplam istenen adedi çıkar.', 'Eksikleri bir sözlük comprehension ile tek seferde bul; stokta olmayan ürün için stok.get(uid, 0).', 'Değişikliği yalnızca dict(stok) kopyası üzerinde, tüm kontroller geçtikten sonra yap.'],
  'why': 'Satırları birleştirmeden kontrol etmek, aynı ürünü iki satırda isteyerek stok kontrolünü atlatmaya izin verir. Tüm eksikleri birden raporlamak istemciye "şunları azalt" diyebilmeyi sağlar; kopya üzerinde çalışmak ya-hep-ya-hiç garantisidir.'},
 {'t': 'code', 'id': 'proje-api-11', 'stage': 'Meydan okuma', 'diff': 3,
  'q': '<p><b>Tekrar güvenliği (idempotency).</b> <code>TekrarKoruyucu</code> sınıfını yaz:</p><ul><li><code>isle(anahtar, govde, islem)</code>: <code>govde</code> bir sözlük, <code>islem</code> govde\'yi alıp <code>(durum, cevap)</code> döndüren fonksiyon.</li><li><code>anahtar</code> None ise her seferinde <code>islem(govde)</code> çağrılır.</li><li>Anahtar ilk kez görülüyorsa <code>islem</code> çağrılır; sonuç ve govde\'nin parmak izi (<code>json.dumps(govde, sort_keys=True)</code>\'nın sha256 hex özeti) saklanır.</li><li>Aynı anahtar + aynı govde → <code>islem</code> <b>çağrılmadan</b> saklanan sonuç döner.</li><li>Aynı anahtar + farklı govde → <code>(422, {"hata": "anahtar_baska_istekle_kullanildi"})</code>.</li><li><code>islem</code> istisna fırlatırsa hiçbir şey saklanmaz (istisna yukarı geçer), böylece istemci tekrar deneyebilir.</li></ul>',
  'sol': ded('''
    import hashlib, json

    class TekrarKoruyucu:
        def __init__(self):
            self.kayitlar = {}

        @staticmethod
        def _iz(govde):
            return hashlib.sha256(json.dumps(govde, sort_keys=True).encode()).hexdigest()

        def isle(self, anahtar, govde, islem):
            if anahtar is None:
                return islem(govde)
            iz = self._iz(govde)
            if anahtar in self.kayitlar:
                eski_iz, sonuc = self.kayitlar[anahtar]
                if eski_iz != iz:
                    return 422, {"hata": "anahtar_baska_istekle_kullanildi"}
                return sonuc
            sonuc = islem(govde)
            self.kayitlar[anahtar] = (iz, sonuc)
            return sonuc
  '''),
  'tests': ded('''
    cagri = []
    def siparis_ac(g):
        cagri.append(g)
        return 201, {"id": len(cagri)}
    k = TekrarKoruyucu()
    g = {"kalemler": [[1, 2]], "kupon": None}
    assert k.isle("abc", g, siparis_ac) == (201, {"id": 1}), "İlk istek işlenmeli"
    assert k.isle("abc", {"kupon": None, "kalemler": [[1, 2]]}, siparis_ac) == (201, {"id": 1}), "Aynı anahtar + aynı gövde (anahtar sırası farklı olsa da) aynı cevabı vermeli"
    assert len(cagri) == 1, "Tekrar eden istekte işlem İKİNCİ KEZ çalışmamalı (çift sipariş!)"
    assert k.isle("abc", {"kalemler": [[1, 3]]}, siparis_ac) == (422, {"hata": "anahtar_baska_istekle_kullanildi"}), "Aynı anahtar farklı gövdeyle 422"
    assert k.isle(None, g, siparis_ac)[1] == {"id": 2} and k.isle(None, g, siparis_ac)[1] == {"id": 3}, "Anahtarsız istek her seferinde işlenmeli"
    def patlayan(g):
        raise ConnectionError("db")
    try:
        k.isle("xyz", g, patlayan); assert False, "İstisna yukarı geçmeli"
    except ConnectionError:
        pass
    assert k.isle("xyz", g, siparis_ac)[0] == 201, "Başarısız işlem saklanmamalı; aynı anahtarla tekrar denenebilmeli"
  '''),
  'hints': ['Saklanan değer (parmak_izi, sonuç) demeti olsun.', 'sort_keys=True, sözlük anahtar sırası farklı olsa da aynı JSON\'u üretir.', 'Sonucu yalnızca islem başarıyla döndükten sonra sakla; istisna olursa satıra hiç ulaşılmaz.'],
  'why': 'Ödeme ve sipariş API\'lerinde (Stripe gibi) Idempotency-Key başlığı tam bu mantıkla çalışır: ağ zaman aşımında tekrar gönderilen istek çift sipariş oluşturmaz. Parmak izi, aynı anahtarın yanlışlıkla başka bir istekle kullanılmasını yakalar.'},
]

# ---------- Mini proje 1: SQLAlchemy servis ----------
MP1_ORTAK = HATALAR + KURALLAR + ded('''
    from sqlalchemy import ForeignKey, String, create_engine, select
    from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, relationship

    class Base(DeclarativeBase):
        pass

    class Urun(Base):
        __tablename__ = "urunler"
        id: Mapped[int] = mapped_column(primary_key=True)
        ad: Mapped[str] = mapped_column(String(80), unique=True)
        fiyat_kurus: Mapped[int]
        stok: Mapped[int]

    class Siparis(Base):
        __tablename__ = "siparisler"
        id: Mapped[int] = mapped_column(primary_key=True)
        musteri: Mapped[str]
        durum: Mapped[str] = mapped_column(default="yeni")
        ara_toplam: Mapped[int] = mapped_column(default=0)
        indirim: Mapped[int] = mapped_column(default=0)
        kargo: Mapped[int] = mapped_column(default=0)
        toplam: Mapped[int] = mapped_column(default=0)
        kalemler: Mapped[list["Kalem"]] = relationship(back_populates="siparis")

    class Kalem(Base):
        __tablename__ = "kalemler"
        id: Mapped[int] = mapped_column(primary_key=True)
        siparis_id: Mapped[int] = mapped_column(ForeignKey("siparisler.id"))
        urun_id: Mapped[int] = mapped_column(ForeignKey("urunler.id"))
        adet: Mapped[int]
        birim_kurus: Mapped[int]
        siparis: Mapped[Siparis] = relationship(back_populates="kalemler")

''')

EX += [
 {'t': 'code', 'id': 'proje-api-12', 'stage': 'Mini proje', 'diff': 3,
  'q': '<p><b>Mini proje 1: Servis katmanı + SQLAlchemy.</b> Modeller, hatalar ve kurallar başlangıç kodunda hazır. <code>SiparisServisi(oturum)</code> sınıfını yaz:</p><ul><li><code>olustur(musteri, kalemler, kupon=None)</code>: <code>kalemler</code> <code>(urun_id, adet)</code> listesi. Olmayan ürün → <code>BulunamadiHatasi</code>; aynı ürünün satırları toplanarak stok kontrolü, yetersizse <code>StokYetersiz</code> ve <b>hiçbir değişiklik kalıcı olmasın</b> (<code>rollback</code>). Fiyatı ders kurallarıyla hesapla (kupon, kargo); bilinmeyen kupon <code>GecersizKupon</code>. Stoğu düş, <code>Siparis</code> ve her satır için <code>Kalem</code> (birim_kurus o anki fiyat) oluştur, <code>commit</code> et, siparişin id\'sini döndür.</li><li><code>durum_degistir(sid, yeni)</code>: sipariş yoksa <code>BulunamadiHatasi</code>; <code>GECISLER</code>\'e uymuyorsa <code>GecersizGecis</code>. <code>"iptal"</code>e geçişte kalemlerin stoğu geri eklenir. commit et ve yeni durumu döndür.</li></ul>',
  'start': MP1_ORTAK + ded('''
    class SiparisServisi:
        def __init__(self, oturum):
            self.oturum = oturum

        def olustur(self, musteri, kalemler, kupon=None):
            # TODO: ürünleri getir, stok kontrol et, fiyat hesapla,
            #       stok düş, Siparis + Kalem oluştur, commit
            pass

        def durum_degistir(self, sid, yeni):
            # TODO: geçiş kontrolü, iptalde stok iadesi, commit
            pass
  '''),
  'sol': MP1_ORTAK + ded('''
    from collections import Counter

    def fiyat_hesapla(satirlar, kupon=None):
        ara = sum(f * a for f, a in satirlar)
        indirim = 0
        if kupon:
            if kupon not in KUPONLAR:
                raise GecersizKupon(kupon)
            tur, deger = KUPONLAR[kupon]
            indirim = ara * deger // 100 if tur == "yuzde" else min(deger, ara)
        net = ara - indirim
        kargo = 0 if net >= KARGO_ESIK else KARGO_UCRET
        return {"ara_toplam": ara, "indirim": indirim, "kargo": kargo, "toplam": net + kargo}

    class SiparisServisi:
        def __init__(self, oturum):
            self.oturum = oturum

        def olustur(self, musteri, kalemler, kupon=None):
            try:
                istenen = Counter()
                urunler = {}
                for uid, adet in kalemler:
                    u = self.oturum.get(Urun, uid)
                    if u is None:
                        raise BulunamadiHatasi(f"ürün {uid}")
                    urunler[uid] = u
                    istenen[uid] += adet
                eksik = [uid for uid, n in istenen.items() if urunler[uid].stok < n]
                if eksik:
                    raise StokYetersiz(eksik)
                fiyat = fiyat_hesapla([(urunler[uid].fiyat_kurus, adet) for uid, adet in kalemler], kupon)
                for uid, n in istenen.items():
                    urunler[uid].stok -= n
                s = Siparis(musteri=musteri, **fiyat)
                for uid, adet in kalemler:
                    s.kalemler.append(Kalem(urun_id=uid, adet=adet, birim_kurus=urunler[uid].fiyat_kurus))
                self.oturum.add(s)
                self.oturum.commit()
                return s.id
            except Exception:
                self.oturum.rollback()
                raise

        def durum_degistir(self, sid, yeni):
            s = self.oturum.get(Siparis, sid)
            if s is None:
                raise BulunamadiHatasi(f"sipariş {sid}")
            if yeni not in GECISLER.get(s.durum, set()):
                raise GecersizGecis(f"{s.durum} -> {yeni}")
            if yeni == "iptal":
                for k in s.kalemler:
                    self.oturum.get(Urun, k.urun_id).stok += k.adet
            s.durum = yeni
            self.oturum.commit()
            return yeni
  '''),
  'tests': ded('''
    motor = create_engine("sqlite://")
    Base.metadata.create_all(motor)
    with Session(motor) as o:
        o.add_all([Urun(ad="Çay", fiyat_kurus=18950, stok=10), Urun(ad="Bal", fiyat_kurus=42500, stok=2), Urun(ad="Fındık", fiyat_kurus=24900, stok=1)])
        o.commit()
        srv = SiparisServisi(o)
        sid = srv.olustur("ayse", [(1, 2), (2, 1)], "HOSGELDIN10")
        s = o.get(Siparis, sid)
        assert s is not None and sid == 1, "olustur sipariş id'sini döndürmeli"
        assert (s.ara_toplam, s.indirim, s.kargo, s.toplam) == (80400, 8040, 3990, 76350), f"Fiyat kuralları uygulanmalı: {(s.ara_toplam, s.indirim, s.kargo, s.toplam)}"
        assert [(k.urun_id, k.adet, k.birim_kurus) for k in s.kalemler] == [(1, 2, 18950), (2, 1, 42500)], "Her satır için Kalem oluşmalı"
        assert (o.get(Urun, 1).stok, o.get(Urun, 2).stok) == (8, 1), "Stoklar düşmeli"
        for kalemler, hata in [([(1, 1), (3, 1), (3, 1)], StokYetersiz), ([(1, 1), (99, 1)], BulunamadiHatasi)]:
            try:
                srv.olustur("mehmet", kalemler); assert False, f"{hata.__name__} bekleniyordu"
            except hata:
                pass
            assert (o.get(Urun, 1).stok, o.get(Urun, 3).stok) == (8, 1), "Hatalı siparişte hiçbir stok değişmemeli (rollback)"
        try:
            srv.olustur("mehmet", [(1, 1)], "BEDAVA"); assert False, "Bilinmeyen kupon"
        except GecersizKupon:
            pass
        assert o.get(Urun, 1).stok == 8 and o.scalars(select(Siparis)).all().__len__() == 1, "Kupon hatasında da hiçbir şey kalıcı olmamalı"
        assert srv.durum_degistir(sid, "odendi") == "odendi", "yeni -> odendi geçerli"
        try:
            srv.durum_degistir(sid, "teslim"); assert False, "odendi -> teslim geçersiz"
        except GecersizGecis:
            pass
        srv.durum_degistir(sid, "iptal")
        assert (o.get(Urun, 1).stok, o.get(Urun, 2).stok) == (10, 2), "İptalde stok geri eklenmeli"
        try:
            srv.durum_degistir(42, "odendi"); assert False
        except BulunamadiHatasi:
            pass
    with Session(motor) as o2:
        assert o2.get(Siparis, 1).durum == "iptal", "Değişiklikler commit edilmiş olmalı (yeni oturumda görünür)"
  '''),
  'hints': ['Önce tüm doğrulamalar (ürün var mı, stok, kupon), sonra değişiklikler; hepsini try içine al ve except\'te rollback edip yeniden fırlat.', 'Aynı ürünün satırları için Counter kullan; fiyat hesabını Rehberli aşamadaki fiyat_hesapla ile yap.', 'Siparis(musteri=..., **fiyat) alanları doğrudan doldurur; s.kalemler.append(Kalem(...)) ilişki üzerinden ekler.'],
  'why': 'Servis katmanı işlem sınırıdır: ya sipariş, kalemler ve stok düşümü birlikte kalıcı olur ya da hiçbiri. Kupon hatası stok düşümünden önce yakalansa bile try/rollback kalıbı, ileride eklenecek yeni bir kuralın yarım kayıt bırakmasını da önler.'},
]

# ---------- Mini proje 2: uç nokta katmanı ----------
MP2_ORTAK = HATALAR + ded('''
    import hashlib, hmac
    from pydantic import BaseModel, ConfigDict, Field, ValidationError

    GIZLI = b"proje-gizli"

    def token_uret(kullanici, son, gizli=GIZLI):
        govde = f"{kullanici}.{son}"
        return govde + "." + hmac.new(gizli, govde.encode(), hashlib.sha256).hexdigest()

    class KalemGirdi(BaseModel):
        model_config = ConfigDict(extra="forbid")
        urun_id: int = Field(gt=0)
        adet: int = Field(ge=1, le=100)

    class SiparisOlustur(BaseModel):
        model_config = ConfigDict(extra="forbid")
        kalemler: list[KalemGirdi] = Field(min_length=1)

    class DurumGirdi(BaseModel):
        durum: str

    class BellekServis:
        """Hazır servis: iş kurallarını uygular, HTTP bilmez."""
        def __init__(self, stok):
            self.stok, self.siparisler = dict(stok), {}
        def olustur(self, kullanici, kalemler):
            for uid, adet in kalemler:
                if uid not in self.stok:
                    raise BulunamadiHatasi(f"ürün {uid}")
                if self.stok[uid] < adet:
                    raise StokYetersiz(f"ürün {uid}")
            for uid, adet in kalemler:
                self.stok[uid] -= adet
            sid = len(self.siparisler) + 1
            self.siparisler[sid] = {"id": sid, "kullanici": kullanici, "durum": "yeni", "kalemler": kalemler}
            return self.siparisler[sid]
        def getir(self, kullanici, sid):
            s = self.siparisler.get(sid)
            if s is None or s["kullanici"] != kullanici:
                raise BulunamadiHatasi(f"sipariş {sid}")
            return s
        def durum(self, kullanici, sid, yeni):
            s = self.getir(kullanici, sid)
            izin = {"yeni": {"odendi", "iptal"}, "odendi": {"kargoda", "iptal"}, "kargoda": {"teslim"}}
            if yeni not in izin.get(s["durum"], set()):
                raise GecersizGecis(f"{s['durum']} -> {yeni}")
            s["durum"] = yeni
            return s

''')

EX += [
 {'t': 'code', 'id': 'proje-api-13', 'stage': 'Mini proje', 'diff': 3,
  'q': '<p><b>Mini proje 2: Uç nokta katmanı.</b> Şemalar, hatalar ve <code>BellekServis</code> başlangıç kodunda hazır. <code>Uygulama(servis, gizli, saat)</code> sınıfını yaz; <code>saat()</code> şimdiki zamanı (int saniye) verir. <code>isle(istek)</code> metodu bir istek sözlüğü <code>{"metot", "yol", "basliklar", "govde"}</code> alıp <code>(durum, govde)</code> döndürsün. Uç noktalar:</p><div class="tbl-wrap"><table><tr><th>Metot ve yol</th><th>Kimlik</th><th>Başarılı cevap</th></tr><tr><td><code>GET /saglik</code></td><td>Gerekmez</td><td><code>200, {"durum": "ok"}</code></td></tr><tr><td><code>POST /siparisler</code></td><td>Gerekir</td><td><code>201</code>, servis sonucu (gövde <code>SiparisOlustur</code> ile doğrulanır; servise <code>[(urun_id, adet), ...]</code> verilir)</td></tr><tr><td><code>GET /siparisler/{sid:int}</code></td><td>Gerekir</td><td><code>200</code>, sipariş</td></tr><tr><td><code>PATCH /siparisler/{sid:int}/durum</code></td><td>Gerekir</td><td><code>200</code>, sipariş (gövde <code>DurumGirdi</code>)</td></tr></table></div><ul><li>Kimlik: <code>basliklar["Authorization"] == "Bearer &lt;token&gt;"</code>; token <code>kullanici.son.imza</code> (hmac-sha256). Eksik/bozuk/süresi dolmuş → <code>YetkiHatasi</code>.</li><li>Hata eşleme: Yetki 401 <code>"yetkisiz"</code>, Bulunamadı 404 <code>"bulunamadi"</code>, iş kuralı 409 <code>"is_kurali"</code> (gövde <code>{"hata", "mesaj"}</code>); ValidationError 422 <code>{"hata": "dogrulama"}</code>; bilinmeyen yol 404 <code>{"hata": "rota_yok"}</code>; yol var metot yok 405 <code>{"hata": "metot_yok"}</code>; diğer her şey 500 <code>{"hata": "sunucu_hatasi"}</code>.</li></ul><p>Önceki görevlerdeki yönlendirici ve token kodunu kullanabilirsin.</p>',
  'start': MP2_ORTAK + ded('''
    class Uygulama:
        def __init__(self, servis, gizli, saat):
            self.servis, self.gizli, self.saat = servis, gizli, saat

        def isle(self, istek):
            # TODO: yönlendir, kimlik doğrula, şemayı doğrula, servisi çağır, hatayı eşle
            return 500, {"hata": "sunucu_hatasi"}
  '''),
  'sol': MP2_ORTAK + ded('''
    class RotaYok(Exception): pass
    class MetotYok(Exception): pass

    class Uygulama:
        def __init__(self, servis, gizli, saat):
            self.servis, self.gizli, self.saat = servis, gizli, saat
            self.rotalar = [
                ("GET", "saglik", self.saglik, False),
                ("POST", "siparisler", self.olustur, True),
                ("GET", "siparisler/{sid:int}", self.getir, True),
                ("PATCH", "siparisler/{sid:int}/durum", self.durum, True),
            ]

        # --- yönlendirme ---
        @staticmethod
        def _eslestir(desen, yol):
            d_p, y_p = desen.split("/"), yol.strip("/").split("/")
            if len(d_p) != len(y_p):
                return None
            params = {}
            for d, y in zip(d_p, y_p):
                if d.startswith("{"):
                    ad, _, tur = d[1:-1].partition(":")
                    if tur == "int" and not y.isdigit():
                        return None
                    params[ad] = int(y) if tur == "int" else y
                elif d != y:
                    return None
            return params

        def _coz(self, metot, yol):
            yol_var = False
            for m, desen, f, kimlik in self.rotalar:
                params = self._eslestir(desen, yol)
                if params is None:
                    continue
                if m == metot:
                    return f, params, kimlik
                yol_var = True
            raise MetotYok() if yol_var else RotaYok()

        # --- kimlik ---
        def _kullanici(self, basliklar):
            deger = (basliklar or {}).get("Authorization", "")
            if not deger.startswith("Bearer "):
                raise YetkiHatasi("token yok")
            parcalar = deger[len("Bearer "):].rsplit(".", 2)
            if len(parcalar) != 3 or not parcalar[1].isdigit():
                raise YetkiHatasi("bozuk token")
            kullanici, son, imza = parcalar
            beklenen = hmac.new(self.gizli, f"{kullanici}.{son}".encode(), hashlib.sha256).hexdigest()
            if not hmac.compare_digest(imza, beklenen):
                raise YetkiHatasi("imza geçersiz")
            if self.saat() >= int(son):
                raise YetkiHatasi("süresi dolmuş")
            return kullanici

        # --- uç noktalar ---
        def saglik(self, kullanici, govde):
            return 200, {"durum": "ok"}

        def olustur(self, kullanici, govde):
            g = SiparisOlustur.model_validate(govde or {})
            return 201, self.servis.olustur(kullanici, [(k.urun_id, k.adet) for k in g.kalemler])

        def getir(self, kullanici, govde, sid):
            return 200, self.servis.getir(kullanici, sid)

        def durum(self, kullanici, govde, sid):
            g = DurumGirdi.model_validate(govde or {})
            return 200, self.servis.durum(kullanici, sid, g.durum)

        # --- giriş noktası ---
        def isle(self, istek):
            try:
                f, params, kimlik = self._coz(istek.get("metot", ""), istek.get("yol", ""))
                kullanici = self._kullanici(istek.get("basliklar")) if kimlik else None
                return f(kullanici, istek.get("govde"), **params)
            except RotaYok:
                return 404, {"hata": "rota_yok"}
            except MetotYok:
                return 405, {"hata": "metot_yok"}
            except ValidationError:
                return 422, {"hata": "dogrulama"}
            except YetkiHatasi as e:
                return 401, {"hata": "yetkisiz", "mesaj": str(e)}
            except BulunamadiHatasi as e:
                return 404, {"hata": "bulunamadi", "mesaj": str(e)}
            except IsKuraliHatasi as e:
                return 409, {"hata": "is_kurali", "mesaj": str(e)}
            except Exception:
                return 500, {"hata": "sunucu_hatasi"}
  '''),
  'tests': ded('''
    SIMDI = 1_700_000_000
    app = Uygulama(BellekServis({1: 5, 2: 1}), GIZLI, lambda: SIMDI)
    A = {"Authorization": "Bearer " + token_uret("ayse", SIMDI + 3600)}
    M = {"Authorization": "Bearer " + token_uret("mehmet", SIMDI + 3600)}
    def istek(metot, yol, basliklar=None, govde=None):
        return app.isle({"metot": metot, "yol": yol, "basliklar": basliklar or {}, "govde": govde})
    assert istek("GET", "/saglik") == (200, {"durum": "ok"}), "Sağlık kontrolü kimliksiz çalışmalı"
    d, g = istek("POST", "/siparisler", A, {"kalemler": [{"urun_id": 1, "adet": 2}]})
    assert d == 201 and g["id"] == 1 and g["kullanici"] == "ayse", f"Sipariş 201 ile oluşmalı: {d} {g}"
    assert istek("GET", "/siparisler/1", A)[1]["durum"] == "yeni", "Sahibi siparişi görebilmeli"
    assert istek("GET", "/siparisler/1", M)[0] == 404, "Başkasının siparişi 404 (varlığı gizlenir)"
    assert istek("POST", "/siparisler")[0] == 401, "Token yoksa 401"
    assert istek("POST", "/siparisler", {"Authorization": "Bearer " + token_uret("ayse", SIMDI - 1)}, {"kalemler": []})[0] == 401, "Süresi dolmuş token 401 (doğrulamadan önce kimlik)"
    assert istek("GET", "/siparisler/1", {"Authorization": A["Authorization"].replace("ayse", "mehm")})[0] == 401, "İmzası bozuk token 401"
    assert istek("POST", "/siparisler", A, {"kalemler": [{"urun_id": 1, "adet": 0}]})[0] == 422, "Geçersiz gövde 422"
    assert istek("POST", "/siparisler", A, {"kalemler": [{"urun_id": 2, "adet": 5}]}) == (409, {"hata": "is_kurali", "mesaj": "ürün 2"}), "Stok yetersiz 409"
    assert istek("POST", "/siparisler", A, {"kalemler": [{"urun_id": 9, "adet": 1}]})[0] == 404, "Olmayan ürün 404"
    assert istek("PATCH", "/siparisler/1/durum", A, {"durum": "odendi"})[1]["durum"] == "odendi", "Durum değişmeli"
    assert istek("PATCH", "/siparisler/1/durum", A, {"durum": "teslim"})[0] == 409, "Geçersiz geçiş 409"
    assert istek("GET", "/siparisler/abc", A) == (404, {"hata": "rota_yok"}), "int olmayan id rota bulamamalı"
    assert istek("DELETE", "/siparisler/1", A) == (405, {"hata": "metot_yok"}), "Yol var metot yok 405"
    assert istek("GET", "/musteriler", A) == (404, {"hata": "rota_yok"}), "Bilinmeyen yol 404"
    class Bozuk(BellekServis):
        def getir(self, k, s):
            raise RuntimeError("SELECT gizli tablo")
    app2 = Uygulama(Bozuk({}), GIZLI, lambda: SIMDI)
    assert app2.isle({"metot": "GET", "yol": "/siparisler/1", "basliklar": A, "govde": None}) == (500, {"hata": "sunucu_hatasi"}), "Beklenmeyen hata 500 ve ayrıntısız"
  '''),
  'hints': ['isle\'yi tek bir try bloğu olarak düşün: yönlendir → (gerekirse) kimlik → işleyici; except blokları en özelden en genele sıralı olsun (IsKuraliHatasi, Exception\'dan önce).', 'Rotaları (metot, desen, isleyici, kimlik_gerekli_mi) demetleri olarak tut; yol eşleşip metot eşleşmezse 405.', 'Gövdeyi SiparisOlustur.model_validate(govde or {}) ile doğrula; servise [(k.urun_id, k.adet) for k in g.kalemler] ver.'],
  'why': 'Bu katman bir web çatısının yaptığını yapar: yönlendirme, kimlik doğrulama bağımlılığı, şema doğrulama ve istisna işleyicileri. Servis HTTP bilmediği için aynı BellekServis ileride SQLAlchemy servisiyle değiştirilebilir; uç nokta testleri ise gerçek sunucu açmadan istek sözlükleriyle uçtan uca koşar.'},
]

LESSON['ex'] = EX
LESSON['faq'] = [
 {'q': 'Bu projeyi gerçek FastAPI uygulamasına nasıl çeviririm?', 'a': 'Şema, depo ve servis katmanları olduğu gibi kalır. <code>api.py</code>\'de <code>FastAPI()</code> oluşturup her uç noktayı dekoratörle tanımla, servis ve kullanıcıyı <code>Depends</code> ile enjekte et, alan hatalarını <code>@app.exception_handler</code> ile HTTP koduna çevir. Testte <code>fastapi.testclient.TestClient</code> ve <code>app.dependency_overrides</code> ile sahte servis verirsin.'},
 {'q': 'Depo katmanı gereksiz bir soyutlama değil mi? SQLAlchemy zaten bir soyutlama.', 'a': 'Küçük projelerde servis doğrudan Session kullanabilir. Depo, sorguları tek yerde toplar, servis testlerinde fake ile değiştirilmesini kolaylaştırır ve "SQL nerede?" sorusuna tek cevap verir. Proje büyüdükçe bu kazanç artar; tamamen dogmatik olma.'},
 {'q': 'SQLite yerine PostgreSQL\'e geçince ne değişir?', 'a': 'Kodda yalnızca bağlantı adresi: <code>create_engine(os.environ["DATABASE_URL"])</code>. Ek olarak <code>psycopg</code> sürücüsünü kurarsın, tabloları Alembic göçleriyle yönetirsin ve eşzamanlı stok için <code>with_for_update()</code> gibi satır kilitlerinden yararlanırsın.'},
 {'q': 'Token\'ı neden kendim yazdım, JWT kullanmak daha iyi değil mi?', 'a': 'Üretimde evet: <code>PyJWT</code> ya da bir kimlik sağlayıcı (Keycloak, Auth0) kullan. Buradaki amaç imzanın nasıl çalıştığını anlamaktı; JWT de başlık.gövde.imza yapısında aynı HMAC fikrini kullanır. Kendi kripto algoritmanı icat etme, ama kullandığın aracın ne yaptığını bil.'},
 {'q': 'Bu projeyi portfolyomda nasıl sunmalıyım?', 'a': 'GitHub deposunda README (mimari diyagramı, çalıştırma komutu, uç nokta tablosu), testlerin CI\'da koştuğu bir GitHub Actions rozeti, Dockerfile ve compose dosyası olsun. Render ya da Fly.io\'ya dağıtıp <code>/docs</code> bağlantısını ekle. Mülakatta katman kararlarını ve stok yarış durumunu nasıl çözdüğünü anlatabilmek en büyük artıdır.'},
]
LESSON['mistakes'] = [
 {'bad': '@app.post("/siparisler")\ndef olustur(girdi: SiparisOlustur):\n    urun = db.query(Urun).get(girdi.urun_id)\n    if urun.stok < girdi.adet:\n        raise HTTPException(409)', 'good': '@app.post("/siparisler")\ndef olustur(girdi: SiparisOlustur, servis=Depends(servis_al)):\n    return servis.olustur(girdi)', 'why': 'İş kuralı ve SQL uç noktaya gömülünce HTTP olmadan test edilemez ve başka bir girişten (CLI, kuyruk) yeniden kullanılamaz.'},
 {'bad': 'for uid, adet in kalemler:\n    kontrol_et(uid, adet)\n    stok_dus(uid, adet)', 'good': 'for uid, adet in kalemler:\n    kontrol_et(uid, adet)\nfor uid, adet in kalemler:\n    stok_dus(uid, adet)', 'why': 'Kontrol ve değişiklik aynı döngüdeyse ikinci kalemde çıkan hata ilk kalemin stoğunu düşmüş bırakır.'},
 {'bad': 'fiyat: float = 19.99\ntoplam = fiyat * 3', 'good': 'fiyat_kurus: int = 1999\ntoplam_kurus = fiyat_kurus * 3', 'why': 'float para birimini tam temsil edemez; kuruş cinsinden tamsayı ya da Decimal kullan.'},
 {'bad': 'if siparis.kullanici != kullanici:\n    raise HTTPException(403, "Bu sipariş başkasına ait")', 'good': 'if siparis is None or siparis.kullanici != kullanici:\n    raise BulunamadiHatasi(sid)', 'why': '403 siparişin var olduğunu sızdırır; saldırgan numaraları tarayarak bilgi toplar. Başkasının kaynağı için 404 dön.'},
 {'bad': 'except Exception as e:\n    return 500, {"hata": str(e)}', 'good': 'except Exception:\n    log.exception("beklenmeyen hata")\n    return 500, {"hata": "sunucu_hatasi"}', 'why': 'İstisna metni SQL sorgusu, dosya yolu gibi iç ayrıntılar içerebilir; istemciye genel mesaj, loga ayrıntı.'},
]

check_body(BODY)
emit(LESSON, '/home/claude/py/v2/i6/proje-api.js', 'Bitirme projesi: Sipariş API')
