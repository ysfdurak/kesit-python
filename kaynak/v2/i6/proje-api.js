/* Kesit Python v2/i6 — Bitirme projesi: Sipariş API */
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push({
  id: 'proje-api',
  lv: 'ileri',
  mod: 'Bitirme',
  min: 120,
  title: 'Bitirme projesi: Anadolu Market Sipariş API\'si',
  sum: 'Katmanlı mimariyle (şema → depo → servis → uç nokta) bir sipariş API\'si kurarsın: pydantic şemaları, SQLAlchemy deposu, stok-indirim-durum kurallarını taşıyan servis, mini yönlendirici ve FastAPI karşılığı, hata→HTTP eşleme, hmac token, testler, Dockerfile ve README.',
  goals: ['Bir API\'yi şema, depo, servis ve uç nokta katmanlarına ayırıp her katmanın sorumluluğunu açıklayabilirim.', 'pydantic ile istek sözleşmesini, SQLAlchemy ile bellek içi SQLite üzerinde depo katmanını kurabilirim.', 'Stok kontrolü, kupon indirimi, kargo ve sipariş durum geçişlerini servis katmanında test edilebilir biçimde yazarım.', 'Yönlendirme, hmac imzalı token ile kimlik doğrulama ve alan hatalarını HTTP durum kodlarına eşlemeyi uygularım.', 'Projeyi unittest ve mock ile test eder, Dockerfile ve README ile teslim edilebilir hâle getiririm.'],
  body: `
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
`,
  ex: [
    { t: 'mc',
      stage: 'Isınma',
      q: '"Siparişteki ürünlerin stoğu yeterli mi?" kontrolü katmanlı mimaride nerede yapılmalı?',
      o: ['Uç nokta fonksiyonunda, HTTP isteği gelir gelmez', 'Servis katmanında, iş kuralı olarak', 'pydantic şemasında, alan doğrulayıcısıyla', 'Depo katmanında, her SELECT sorgusunun içinde ayrı ayrı'],
      a: 1,
      why: 'Stok kontrolü bir iş kuralıdır ve veritabanındaki güncel duruma bağlıdır; servis katmanına aittir. Şema yalnızca biçimi (adet pozitif mi) denetler, uç nokta HTTP\'yi çevirir, depo ise yalnızca veriyi okur/yazar.' },
    { t: 'mc',
      stage: 'Isınma',
      q: 'İstek biçimi doğru (geçerli JSON, adet pozitif) ama ürünün stoğu yetersiz. Hangi HTTP durum kodu en uygundur?',
      o: ['400 Bad Request', '404 Not Found', '409 Conflict', '500 Internal Server Error'],
      a: 2,
      why: '409, isteğin kendisi geçerli olduğu hâlde kaynağın mevcut durumuyla çeliştiğini anlatır. 400/422 biçim hatası, 404 olmayan kaynak, 500 sunucunun kendi hatası içindir.' },
    { t: 'mc',
      stage: 'Isınma',
      q: 'Token imzasını doğrularken neden <code>gelen == beklenen</code> yerine <code>hmac.compare_digest(gelen, beklenen)</code> kullanılır?',
      o: ['compare_digest büyük/küçük harf farkını yok sayar', 'compare_digest her zaman sabit sürede karşılaştırır; zamanlama saldırısını önler', '== iki metni karşılaştıramaz, TypeError verir', 'compare_digest imzayı ayrıca şifreler ve böylece token\'ı daha kısa hâle getirir'],
      a: 1,
      why: '== ilk farklı karakterde durur; saldırgan cevap süresini ölçerek imzayı karakter karakter tahmin edebilir. compare_digest karşılaştırmayı girdiden bağımsız sürede yapar.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'pydantic iç içe bir listede hata bulursa konumu nasıl raporlar?',
      code: 'from pydantic import BaseModel, Field, ValidationError\n\nclass KalemGirdi(BaseModel):\n    urun_id: int = Field(gt=0)\n    adet: int = Field(ge=1, le=100)\n\nclass SiparisOlustur(BaseModel):\n    kalemler: list[KalemGirdi] = Field(min_length=1)\n\ntry:\n    SiparisOlustur(kalemler=[{"urun_id": 3, "adet": 2}, {"urun_id": 5, "adet": 0}])\nexcept ValidationError as e:\n    h = e.errors()\n    print(len(h), h[0]["loc"])\n',
      o: ['1 (\'kalemler\', 1, \'adet\')', '1 (\'adet\',)', '2 (\'kalemler\', \'adet\')', '1 (\'kalemler\', 0, \'adet\')'],
      a: 0,
      why: 'Yalnızca ikinci kalemin adeti hatalı; loc tam yolu verir: kalemler alanı, 1. indeks (0 tabanlı), adet alanı. Uç nokta bunu "kalemler.1.adet" gibi bir alan adına çevirip istemciye gösterebilir.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Bu kod ne yazdırır?',
      code: 'desen = "/siparisler/{sid:int}/durum"\nyol = "/siparisler/42/durum"\nparams = {}\nfor d, y in zip(desen.strip("/").split("/"), yol.strip("/").split("/")):\n    if d.startswith("{"):\n        ad, _, tur = d[1:-1].partition(":")\n        params[ad] = int(y) if tur == "int" else y\nprint(params, len(desen.split("/")))\n',
      o: ['{\'sid\': \'42\'} 3', '{\'sid\': 42} 3', '{\'sid\': 42} 4', '{\'sid:int\': 42} 4'],
      a: 2,
      why: 'd[1:-1] süslü parantezleri atar, partition(":") adı ve türü ayırır; tür int olduğu için 42 sayıya çevrilir. strip yapılmamış desen "/" ile başladığı için split başta boş bir parça üretir: 4 eleman.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Fiyatlar kuruş cinsinden. Bu kod ne yazdırır?',
      code: 'KUPONLAR = {"HOSGELDIN10": ("yuzde", 10), "SEPET50": ("tutar", 5000)}\n\ndef indirim(ara, kupon):\n    tur, deger = KUPONLAR[kupon]\n    return ara * deger // 100 if tur == "yuzde" else min(deger, ara)\n\nprint(indirim(18995, "HOSGELDIN10"), indirim(3000, "SEPET50"))\n',
      o: ['1899.5 3000', '1899 5000', '1900 3000', '1899 3000'],
      a: 3,
      why: '18995 * 10 // 100 = 189950 // 100 = 1899 (tam bölme aşağı yuvarlar, kuruş tamsayı kalır). SEPET50 indirimi ara toplamı geçemez: min(5000, 3000) = 3000.' },
    { t: 'order',
      stage: 'Kodu oku',
      q: '<p>Depo katmanının en alt düzeyi: bellek içi SQLite\'ta tablo oluşturup stokta olan ürünleri sorgulayan SQLAlchemy kodunun satırlarını sırala.</p>',
      lines: ['from sqlalchemy import create_engine, text', 'motor = create_engine("sqlite://")', 'with motor.begin() as bag:', '    bag.execute(text("CREATE TABLE urun (ad TEXT, stok INT)"))', '    bag.execute(text("INSERT INTO urun VALUES (\'Çay\', 5), (\'Kahve\', 0), (\'Bal\', 2)"))', '    sonuc = bag.execute(text("SELECT ad FROM urun WHERE stok > 0 ORDER BY ad"))', '    print(sonuc.scalars().all())'],
      expect: '[\'Bal\', \'Çay\']\n',
      hint: 'Önce motor, sonra bağlantı; tablo oluşturulmadan veri eklenemez, veri eklenmeden sorgu boş döner.',
      why: 'create_engine bağlantı havuzunu kurar; begin() bir işlem açar ve blok sonunda commit eder. CREATE → INSERT → SELECT sırası zorunludur. scalars() her satırın ilk sütununu verir.' },
    { t: 'code',
      id: 'proje-api-1',
      stage: 'Rehberli',
      diff: 2,
      q: '<p><b>Katman 1: Şema.</b> pydantic ile iki şema yaz:</p><ul><li><code>KalemGirdi</code>: <code>urun_id: int</code> (0\'dan büyük), <code>adet: int</code> (1–100 arası).</li><li><code>SiparisOlustur</code>: <code>kalemler: list[KalemGirdi]</code> (en az 1 eleman), <code>kupon: str | None = None</code>. Kupon <code>field_validator</code> ile kırpılıp büyük harfe çevrilsin; boş metin <code>None</code> olsun.</li><li>İki şema da bilinmeyen alanları reddetsin: <code>model_config = ConfigDict(extra="forbid")</code>.</li></ul>',
      guide: ['KalemGirdi\'de Field(gt=0) ve Field(ge=1, le=100) kullan.', 'SiparisOlustur\'da kalemler için Field(min_length=1) ver.', 'Her iki sınıfa model_config = ConfigDict(extra="forbid") ekle.', '@field_validator("kupon") + @classmethod ile v\'yi (v or "").strip().upper() yap, boşsa None döndür.'],
      example: 'from pydantic import BaseModel, ConfigDict, Field, field_validator\n\nclass MusteriGirdi(BaseModel):\n    model_config = ConfigDict(extra="forbid")\n    ad: str = Field(min_length=2)\n    sehir: str | None = None\n\n    @field_validator("sehir")\n    @classmethod\n    def sehir_duzenle(cls, v):\n        v = (v or "").strip().title()\n        return v or None\n\nprint(MusteriGirdi(ad="Ayşe", sehir="  izmir "))\nprint(MusteriGirdi(ad="Ali", sehir="   "))\n',
      start: 'from pydantic import BaseModel, ConfigDict, Field, field_validator\n\nclass KalemGirdi(BaseModel):\n    urun_id: int      # TODO: 0\'dan büyük\n    adet: int         # TODO: 1..100\n\nclass SiparisOlustur(BaseModel):\n    kalemler: list[KalemGirdi]     # TODO: en az 1 eleman\n    kupon: str | None = None\n    # TODO: extra="forbid" ve kupon doğrulayıcısı\n',
      sol: 'from pydantic import BaseModel, ConfigDict, Field, field_validator\n\nclass KalemGirdi(BaseModel):\n    model_config = ConfigDict(extra="forbid")\n    urun_id: int = Field(gt=0)\n    adet: int = Field(ge=1, le=100)\n\nclass SiparisOlustur(BaseModel):\n    model_config = ConfigDict(extra="forbid")\n    kalemler: list[KalemGirdi] = Field(min_length=1)\n    kupon: str | None = None\n\n    @field_validator("kupon")\n    @classmethod\n    def kupon_duzenle(cls, v):\n        v = (v or "").strip().upper()\n        return v or None\n',
      tests: 'from pydantic import ValidationError\ns = SiparisOlustur(kalemler=[{"urun_id": 1, "adet": 3}], kupon=" hosgeldin10 ")\nassert s.kupon == "HOSGELDIN10", "Kupon kırpılıp büyük harfe çevrilmeli"\nassert s.kalemler[0].adet == 3, "Kalemler KalemGirdi nesnesine dönüşmeli"\nassert SiparisOlustur(kalemler=[{"urun_id": 1, "adet": 1}], kupon="  ").kupon is None, "Boş kupon None olmalı"\ndef hatali(**veri):\n    try:\n        SiparisOlustur(**veri)\n    except ValidationError as e:\n        return [h["loc"] for h in e.errors()]\n    return None\nassert hatali(kalemler=[]) == [("kalemler",)], "Boş kalem listesi reddedilmeli (min_length=1)"\nassert hatali(kalemler=[{"urun_id": 0, "adet": 1}]) == [("kalemler", 0, "urun_id")], "urun_id 0 reddedilmeli (gt=0)"\nassert hatali(kalemler=[{"urun_id": 1, "adet": 101}]) == [("kalemler", 0, "adet")], "adet 100\'ü geçemez"\nassert hatali(kalemler=[{"urun_id": 1, "adet": 1}], indirim=50) == [("indirim",)], "Bilinmeyen alan reddedilmeli: istemci indirimi kendisi belirleyemez"\nassert hatali(kalemler=[{"urun_id": 1, "adet": 1, "fiyat": 1}]) == [("kalemler", 0, "fiyat")], "Kalemde de bilinmeyen alan (fiyat!) reddedilmeli"\n',
      hints: ['Sınırlar Field ile verilir: gt, ge, le, min_length.', 'extra="forbid" her iki sınıfta da gerekli; kalem içine "fiyat" sızdırılmasını da engeller.', 'Doğrulayıcı: return (v or "").strip().upper() or None'],
      why: 'Şema, API\'nin sözleşmesidir: istemcinin fiyat ya da indirim gibi alanları kendisi göndermesini daha sınırda engeller. extra="forbid" olmadan pydantic bilinmeyen alanları sessizce yok sayar ve istemcinin yazım hatası fark edilmez.' },
    { t: 'code',
      id: 'proje-api-2',
      stage: 'Rehberli',
      diff: 2,
      q: '<p><b>Katman 2: Depo.</b> Başlangıç kodundaki <code>Urun</code> modeli için <code>UrunDepo(oturum)</code> sınıfını yaz:</p><ul><li><code>ekle(ad, fiyat_kurus, stok)</code>: ürünü ekler, <code>flush</code> eder ve nesneyi döndürür (id dolu olmalı).</li><li><code>getir(urun_id)</code>: ürün ya da <code>None</code> (<code>oturum.get</code>).</li><li><code>ad_ile(ad)</code>: adı eşleşen ürün ya da <code>None</code> (<code>select ... where</code>).</li><li><code>stokta_olanlar()</code>: stoğu 0\'dan büyük ürünler, ada göre sıralı liste.</li></ul><p>Depo <code>commit</code> etmez; işlem sınırı servisin işidir.</p>',
      guide: ['__init__ içinde oturumu sakla.', 'ekle: Urun(...) oluştur, oturum.add, oturum.flush, nesneyi döndür.', 'getir: self.oturum.get(Urun, urun_id).', 'ad_ile: self.oturum.scalars(select(Urun).where(Urun.ad == ad)).first().', 'stokta_olanlar: where(Urun.stok > 0).order_by(Urun.ad) ve .all().'],
      example: 'from sqlalchemy import create_engine, select\nfrom sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column\n\nclass Base(DeclarativeBase):\n    pass\n\nclass Sube(Base):\n    __tablename__ = "subeler"\n    id: Mapped[int] = mapped_column(primary_key=True)\n    sehir: Mapped[str]\n\nmotor = create_engine("sqlite://")\nBase.metadata.create_all(motor)\nwith Session(motor) as o:\n    o.add_all([Sube(sehir="Van"), Sube(sehir="Bursa")])\n    o.flush()\n    print(o.get(Sube, 2).sehir)\n    print([s.sehir for s in o.scalars(select(Sube).order_by(Sube.sehir)).all()])\n',
      start: 'from sqlalchemy import ForeignKey, String, create_engine, select\nfrom sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, relationship\n\nclass Base(DeclarativeBase):\n    pass\n\nclass Urun(Base):\n    __tablename__ = "urunler"\n    id: Mapped[int] = mapped_column(primary_key=True)\n    ad: Mapped[str] = mapped_column(String(80), unique=True)\n    fiyat_kurus: Mapped[int]\n    stok: Mapped[int]\nclass UrunDepo:\n    def __init__(self, oturum):\n        self.oturum = oturum\n\n    def ekle(self, ad, fiyat_kurus, stok):\n        # TODO: ekle, flush, döndür\n        pass\n\n    def getir(self, urun_id):\n        # TODO\n        pass\n\n    def ad_ile(self, ad):\n        # TODO\n        pass\n\n    def stokta_olanlar(self):\n        # TODO: stok > 0, ada göre sıralı\n        return []\n',
      sol: 'from sqlalchemy import ForeignKey, String, create_engine, select\nfrom sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, relationship\n\nclass Base(DeclarativeBase):\n    pass\n\nclass Urun(Base):\n    __tablename__ = "urunler"\n    id: Mapped[int] = mapped_column(primary_key=True)\n    ad: Mapped[str] = mapped_column(String(80), unique=True)\n    fiyat_kurus: Mapped[int]\n    stok: Mapped[int]\nclass UrunDepo:\n    def __init__(self, oturum):\n        self.oturum = oturum\n\n    def ekle(self, ad, fiyat_kurus, stok):\n        u = Urun(ad=ad, fiyat_kurus=fiyat_kurus, stok=stok)\n        self.oturum.add(u)\n        self.oturum.flush()\n        return u\n\n    def getir(self, urun_id):\n        return self.oturum.get(Urun, urun_id)\n\n    def ad_ile(self, ad):\n        return self.oturum.scalars(select(Urun).where(Urun.ad == ad)).first()\n\n    def stokta_olanlar(self):\n        return list(self.oturum.scalars(\n            select(Urun).where(Urun.stok > 0).order_by(Urun.ad)).all())\n',
      tests: 'motor = create_engine("sqlite://")\nBase.metadata.create_all(motor)\nwith Session(motor) as o:\n    d = UrunDepo(o)\n    cay = d.ekle("Çay 1 kg", 18950, 40)\n    assert cay is not None and cay.id == 1, "ekle nesneyi döndürmeli ve flush ile id atanmış olmalı"\n    d.ekle("Fındık", 24900, 0)\n    d.ekle("Bal", 42500, 12)\n    assert d.getir(3).ad == "Bal", "getir id ile ürünü bulmalı"\n    assert d.getir(99) is None, "Olmayan id için None"\n    assert d.ad_ile("Fındık").fiyat_kurus == 24900, "ad_ile adı eşleşen ürünü bulmalı"\n    assert d.ad_ile("Kahve") is None, "Olmayan ad için None"\n    assert [u.ad for u in d.stokta_olanlar()] == ["Bal", "Çay 1 kg"], "Stokta olanlar ada göre sıralı, Fındık (stok 0) hariç"\n    o.rollback()\n    assert UrunDepo(o).getir(1) is None, "Depo commit etmemeli; rollback sonrası kayıt kalmamalı"\n',
      hints: ['SQLAlchemy 2 stili: oturum.scalars(select(Model).where(...)).', 'flush, INSERT\'i veritabanına gönderir ve id\'yi doldurur ama işlemi bitirmez; commit\'ten farklıdır.', 'Sıralı filtre: select(Urun).where(Urun.stok > 0).order_by(Urun.ad)'],
      why: 'Depo, servisin SQL bilmeden veriye erişmesini sağlar; testte gerçek SQLite ile entegrasyon testi, servis testinde ise fake/mock ile değiştirilir. commit\'i servise bırakmak, birden fazla depo işlemini tek bir işlemde (ya hep ya hiç) toplamayı mümkün kılar.' },
    { t: 'code',
      id: 'proje-api-3',
      stage: 'Rehberli',
      diff: 2,
      q: '<p><b>Katman 3a: Fiyat kuralı.</b> <code>fiyat_hesapla(kalemler, kupon=None)</code> yaz. <code>kalemler</code>: <code>(birim_kurus, adet)</code> demetleri. Dönüş: <code>{"ara_toplam", "indirim", "kargo", "toplam"}</code> (hepsi kuruş, int).</p><ul><li>ara_toplam = Σ birim × adet</li><li>Kupon <code>KUPONLAR</code>\'da yoksa <code>GecersizKupon</code>. <code>"yuzde"</code>: <code>ara * deger // 100</code>; <code>"tutar"</code>: <code>min(deger, ara)</code>.</li><li>net = ara − indirim; net ≥ <code>KARGO_ESIK</code> ise kargo 0, değilse <code>KARGO_UCRET</code>.</li><li>toplam = net + kargo</li></ul>',
      guide: ['sum(...) ile ara toplamı hesapla.', 'Kupon varsa KUPONLAR\'da ara; yoksa GecersizKupon fırlat.', 'Türüne göre indirimi hesapla.', 'Neti bul, eşiğe göre kargoyu seç, sözlüğü döndür.'],
      example: 'KOMISYON = {"kart": ("yuzde", 2), "havale": ("tutar", 500)}\n\ndef komisyon(tutar, kanal):\n    tur, deger = KOMISYON[kanal]\n    return tutar * deger // 100 if tur == "yuzde" else deger\n\nprint(komisyon(12345, "kart"), komisyon(12345, "havale"))\n',
      start: 'class UygulamaHatasi(Exception): pass\nclass BulunamadiHatasi(UygulamaHatasi): pass\nclass YetkiHatasi(UygulamaHatasi): pass\nclass IsKuraliHatasi(UygulamaHatasi): pass\nclass StokYetersiz(IsKuraliHatasi): pass\nclass GecersizKupon(IsKuraliHatasi): pass\nclass GecersizGecis(IsKuraliHatasi): pass\nKUPONLAR = {"HOSGELDIN10": ("yuzde", 10), "SEPET50": ("tutar", 5000)}\nKARGO_ESIK, KARGO_UCRET = 75000, 3990\nGECISLER = {"yeni": {"odendi", "iptal"}, "odendi": {"kargoda", "iptal"},\n            "kargoda": {"teslim"}, "teslim": set(), "iptal": set()}\ndef fiyat_hesapla(kalemler, kupon=None):\n    ara = sum(f * a for f, a in kalemler)\n    indirim = 0\n    # TODO: kuponu doğrula ve indirimi hesapla\n    net = ara - indirim\n    kargo = KARGO_UCRET     # TODO: eşik kontrolü\n    return {"ara_toplam": ara, "indirim": indirim, "kargo": kargo, "toplam": net + kargo}\n',
      sol: 'class UygulamaHatasi(Exception): pass\nclass BulunamadiHatasi(UygulamaHatasi): pass\nclass YetkiHatasi(UygulamaHatasi): pass\nclass IsKuraliHatasi(UygulamaHatasi): pass\nclass StokYetersiz(IsKuraliHatasi): pass\nclass GecersizKupon(IsKuraliHatasi): pass\nclass GecersizGecis(IsKuraliHatasi): pass\nKUPONLAR = {"HOSGELDIN10": ("yuzde", 10), "SEPET50": ("tutar", 5000)}\nKARGO_ESIK, KARGO_UCRET = 75000, 3990\nGECISLER = {"yeni": {"odendi", "iptal"}, "odendi": {"kargoda", "iptal"},\n            "kargoda": {"teslim"}, "teslim": set(), "iptal": set()}\ndef fiyat_hesapla(kalemler, kupon=None):\n    ara = sum(f * a for f, a in kalemler)\n    indirim = 0\n    if kupon:\n        if kupon not in KUPONLAR:\n            raise GecersizKupon(kupon)\n        tur, deger = KUPONLAR[kupon]\n        indirim = ara * deger // 100 if tur == "yuzde" else min(deger, ara)\n    net = ara - indirim\n    kargo = 0 if net >= KARGO_ESIK else KARGO_UCRET\n    return {"ara_toplam": ara, "indirim": indirim, "kargo": kargo, "toplam": net + kargo}\n',
      tests: 'assert fiyat_hesapla([(18950, 2), (42500, 1)]) == {"ara_toplam": 80400, "indirim": 0, "kargo": 0, "toplam": 80400}, "750 TL üstü kargo ücretsiz"\nassert fiyat_hesapla([(18950, 2), (42500, 1)], "HOSGELDIN10") == {"ara_toplam": 80400, "indirim": 8040, "kargo": 3990, "toplam": 76350}, "Kargo eşiği İNDİRİM SONRASI tutara bakar: 72360 < 75000"\nassert fiyat_hesapla([(1999, 1)], "HOSGELDIN10")["indirim"] == 199, "Yüzde indirim aşağı yuvarlanır (// ile)"\nassert fiyat_hesapla([(3000, 1)], "SEPET50") == {"ara_toplam": 3000, "indirim": 3000, "kargo": 3990, "toplam": 3990}, "Tutar indirimi ara toplamı geçemez"\nassert fiyat_hesapla([(75000, 1)])["kargo"] == 0, "Tam eşikte (75000) kargo ücretsiz"\ntry:\n    fiyat_hesapla([(100, 1)], "BEDAVA")\n    assert False, "Bilinmeyen kupon GecersizKupon fırlatmalı"\nexcept GecersizKupon:\n    pass\nassert isinstance(fiyat_hesapla([(101, 3)], "HOSGELDIN10")["toplam"], int), "Tüm tutarlar int kalmalı"\n',
      hints: ['Kupon None ya da boşsa indirim 0 kalır: if kupon:', 'KUPONLAR[kupon] bir (tur, deger) demeti verir.', 'kargo = 0 if net >= KARGO_ESIK else KARGO_UCRET'],
      why: 'Para kuruş cinsinden tamsayıyla tutulunca yuvarlama farkı oluşmaz ve // ile yuvarlama yönü açıkça bellidir. Kural saf bir fonksiyon olduğu için veritabanı ya da HTTP olmadan milisaniyede test edilir.' },
    { t: 'code',
      id: 'proje-api-4',
      stage: 'Rehberli',
      diff: 1,
      q: '<p><b>Katman 3b: Durum makinesi.</b> <code>durum_degistir(siparis, yeni)</code> yaz. <code>siparis</code> bir sözlük: <code>{"id", "durum", "gecmis"}</code>. Geçiş <code>GECISLER[eski]</code> içinde değilse (bilinmeyen durumlar dahil) <code>GecersizGecis(f"{eski} -&gt; {yeni}")</code> fırlat. Geçerliyse <b>yeni bir sözlük</b> döndür: durum güncellenmiş, <code>gecmis</code> listesinin sonuna <code>(eski, yeni)</code> eklenmiş. Girdi sözlüğü ve listesi değişmemeli.</p>',
      guide: ['eski = siparis["durum"].', 'GECISLER.get(eski, set()) içinde yeni yoksa hata fırlat.', 'Yeni sözlüğü {**siparis, ...} ile kur; gecmis için yeni liste oluştur.', 'Yeni sözlüğü döndür.'],
      example: 'IZINLI = {"taslak": {"onayda"}, "onayda": {"yayinda", "taslak"}, "yayinda": set()}\n\ndef ilerlet(belge, yeni):\n    if yeni not in IZINLI.get(belge["durum"], set()):\n        raise ValueError(f"{belge[\'durum\']} -> {yeni}")\n    return {**belge, "durum": yeni}\n\nb = {"ad": "Kampanya", "durum": "taslak"}\nprint(ilerlet(b, "onayda"), b)\n',
      start: 'class UygulamaHatasi(Exception): pass\nclass BulunamadiHatasi(UygulamaHatasi): pass\nclass YetkiHatasi(UygulamaHatasi): pass\nclass IsKuraliHatasi(UygulamaHatasi): pass\nclass StokYetersiz(IsKuraliHatasi): pass\nclass GecersizKupon(IsKuraliHatasi): pass\nclass GecersizGecis(IsKuraliHatasi): pass\nKUPONLAR = {"HOSGELDIN10": ("yuzde", 10), "SEPET50": ("tutar", 5000)}\nKARGO_ESIK, KARGO_UCRET = 75000, 3990\nGECISLER = {"yeni": {"odendi", "iptal"}, "odendi": {"kargoda", "iptal"},\n            "kargoda": {"teslim"}, "teslim": set(), "iptal": set()}\ndef durum_degistir(siparis, yeni):\n    eski = siparis["durum"]\n    # TODO: geçişi doğrula\n    siparis["durum"] = yeni          # TODO: girdiyi değiştirme, kopya döndür\n    siparis["gecmis"].append((eski, yeni))\n    return siparis\n',
      sol: 'class UygulamaHatasi(Exception): pass\nclass BulunamadiHatasi(UygulamaHatasi): pass\nclass YetkiHatasi(UygulamaHatasi): pass\nclass IsKuraliHatasi(UygulamaHatasi): pass\nclass StokYetersiz(IsKuraliHatasi): pass\nclass GecersizKupon(IsKuraliHatasi): pass\nclass GecersizGecis(IsKuraliHatasi): pass\nKUPONLAR = {"HOSGELDIN10": ("yuzde", 10), "SEPET50": ("tutar", 5000)}\nKARGO_ESIK, KARGO_UCRET = 75000, 3990\nGECISLER = {"yeni": {"odendi", "iptal"}, "odendi": {"kargoda", "iptal"},\n            "kargoda": {"teslim"}, "teslim": set(), "iptal": set()}\ndef durum_degistir(siparis, yeni):\n    eski = siparis["durum"]\n    if yeni not in GECISLER.get(eski, set()):\n        raise GecersizGecis(f"{eski} -> {yeni}")\n    return {**siparis, "durum": yeni, "gecmis": siparis["gecmis"] + [(eski, yeni)]}\n',
      tests: 's0 = {"id": 7, "durum": "yeni", "gecmis": []}\ns1 = durum_degistir(s0, "odendi")\ns2 = durum_degistir(s1, "kargoda")\nassert s2["durum"] == "kargoda" and s2["gecmis"] == [("yeni", "odendi"), ("odendi", "kargoda")], "Geçmiş sırayla birikmeli"\nassert s0 == {"id": 7, "durum": "yeni", "gecmis": []}, "Girdi sözlüğü ve listesi değişmemeli"\nfor eski, yeni in [("yeni", "kargoda"), ("kargoda", "iptal"), ("teslim", "iptal"), ("iptal", "yeni"), ("kayip", "yeni")]:\n    try:\n        durum_degistir({"id": 1, "durum": eski, "gecmis": []}, yeni)\n        assert False, f"{eski} -> {yeni} geçişi reddedilmeli"\n    except GecersizGecis as e:\n        assert str(e) == f"{eski} -> {yeni}", "Mesaj \'eski -> yeni\' biçiminde olmalı"\nassert isinstance(GecersizGecis("x"), IsKuraliHatasi), "GecersizGecis bir iş kuralı hatasıdır (HTTP 409)"\n',
      hints: ['Bilinmeyen eski durum için GECISLER.get(eski, set()) boş küme verir.', 'Sözlük açma ile kopya: {**siparis, "durum": yeni}.', 'Listeyi + ile birleştirmek yeni liste üretir: siparis["gecmis"] + [(eski, yeni)].'],
      why: 'Durum makinesi, "teslim edilmiş sipariş iptal edilemez" gibi kuralları tek bir tabloda toplar; yeni durum eklemek bir satırdır. Girdiyi değiştirmeyen fonksiyon, hata durumunda yarım kalmış güncellemeyi imkânsız kılar.' },
    { t: 'code',
      id: 'proje-api-5',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p><b>Katman 4a: Yönlendirici.</b> <code>Yonlendirici</code> sınıfını yaz:</p><ul><li><code>ekle(metot, desen, isleyici)</code>: rotayı kaydeder. Desende <code>{ad}</code> metin, <code>{ad:int}</code> yalnızca rakamlardan oluşan ve int\'e çevrilen parametredir.</li><li><code>coz(metot, yol)</code>: <code>(isleyici, params)</code> döndürür. Sondaki <code>/</code> önemsizdir.</li><li>Hiçbir desen yolla eşleşmezse <code>RotaYok</code> (404) fırlat.</li><li>Yol eşleşiyor ama metot uymuyorsa <code>MetotYok</code> (405) fırlat; istisnanın <code>izinli</code> özniteliği o yol için izinli metotların sıralı listesi olsun.</li></ul><p><code>RotaYok</code> ve <code>MetotYok</code> sınıflarını da sen tanımla (<code>MetotYok.__init__(self, izinli)</code>).</p>',
      sol: 'class RotaYok(Exception):\n    pass\n\nclass MetotYok(Exception):\n    def __init__(self, izinli):\n        super().__init__(", ".join(izinli))\n        self.izinli = izinli\n\nclass Yonlendirici:\n    def __init__(self):\n        self.rotalar = []\n\n    def ekle(self, metot, desen, isleyici):\n        self.rotalar.append((metot.upper(), desen.strip("/").split("/"), isleyici))\n\n    @staticmethod\n    def _eslestir(desen, parcalar):\n        if len(desen) != len(parcalar):\n            return None\n        params = {}\n        for d, p in zip(desen, parcalar):\n            if d.startswith("{") and d.endswith("}"):\n                ad, _, tur = d[1:-1].partition(":")\n                if tur == "int":\n                    if not p.isdigit():\n                        return None\n                    params[ad] = int(p)\n                else:\n                    params[ad] = p\n            elif d != p:\n                return None\n        return params\n\n    def coz(self, metot, yol):\n        parcalar = yol.strip("/").split("/")\n        izinli = set()\n        for m, desen, f in self.rotalar:\n            params = self._eslestir(desen, parcalar)\n            if params is None:\n                continue\n            if m == metot.upper():\n                return f, params\n            izinli.add(m)\n        if izinli:\n            raise MetotYok(sorted(izinli))\n        raise RotaYok(yol)\n',
      tests: 'y = Yonlendirici()\ndef liste(): return "liste"\ndef olustur(): return "olustur"\ndef getir(sid): return sid\ndef durum(sid): return sid\ndef urun(kod): return kod\ny.ekle("GET", "/siparisler", liste)\ny.ekle("POST", "/siparisler", olustur)\ny.ekle("GET", "/siparisler/{sid:int}", getir)\ny.ekle("PATCH", "/siparisler/{sid:int}/durum", durum)\ny.ekle("GET", "/urunler/{kod}", urun)\nassert y.coz("GET", "/siparisler") == (liste, {}), "Parametresiz rota"\nassert y.coz("POST", "/siparisler/") == (olustur, {}), "Sondaki / önemsiz olmalı"\nassert y.coz("GET", "/siparisler/42") == (getir, {"sid": 42}), "{sid:int} int\'e çevrilmeli"\nassert y.coz("PATCH", "/siparisler/7/durum") == (durum, {"sid": 7}), "Çok parçalı desen"\nassert y.coz("GET", "/urunler/CAY-01") == (urun, {"kod": "CAY-01"}), "{kod} metin kalmalı"\ntry:\n    y.coz("GET", "/siparisler/abc"); assert False, "int olmayan sid eşleşmemeli -> RotaYok"\nexcept RotaYok:\n    pass\ntry:\n    y.coz("DELETE", "/siparisler/5"); assert False, "Yol var ama metot yok -> MetotYok"\nexcept MetotYok as e:\n    assert e.izinli == ["GET"], f"izinli [\'GET\'] olmalı, gelen {e.izinli}"\ntry:\n    y.coz("PUT", "/siparisler"); assert False\nexcept MetotYok as e:\n    assert e.izinli == ["GET", "POST"], "İzinli metotlar sıralı liste olmalı"\ntry:\n    y.coz("GET", "/musteriler"); assert False, "Bilinmeyen yol RotaYok vermeli"\nexcept RotaYok:\n    pass\n',
      hints: ['Desen ve yolu strip("/").split("/") ile parçalara ayır; uzunluk farklıysa eşleşme yok.', 'Eşleşme yardımcı fonksiyonu params sözlüğü ya da None döndürsün; coz bunu tüm rotalarda dener.', 'Metot uymayan ama yolu eşleşen rotaların metotlarını bir kümede topla; sonunda küme doluysa MetotYok, boşsa RotaYok.'],
      why: 'Starlette ve Flask\'ın yönlendiricileri de deseni derleyip her rotayı dener; 404 ile 405 ayrımı istemciye "bu adres yok" ile "bu adres var ama bu metodu desteklemiyor" farkını söyler. Gerçek 405 cevabı Allow başlığında izinli metotları listeler.' },
    { t: 'code',
      id: 'proje-api-6',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p><b>Katman 4b: Hata eşleme.</b> Başlangıç kodundaki hata hiyerarşisi için <code>hata_yaniti(hata)</code> yaz; <code>(durum_kodu, govde)</code> döndürsün:</p><ul><li>Eşleme <b>en özel</b> kayıtlı sınıfa göre yapılır (<code>type(hata).__mro__</code> sırasıyla ara): <code>BulunamadiHatasi</code> → (404, <code>"bulunamadi"</code>), <code>YetkiHatasi</code> → (401, <code>"yetkisiz"</code>), <code>IsKuraliHatasi</code> → (409, <code>"is_kurali"</code>), <code>StokYetersiz</code> → (409, <code>"stok_yetersiz"</code>).</li><li>Bunlar için gövde: <code>{"hata": kod, "mesaj": str(hata)}</code>.</li><li>pydantic <code>ValidationError</code> → 422, gövde <code>{"hata": "dogrulama", "ayrintilar": [{"alan": "kalemler.0.adet", "mesaj": msg}, ...]}</code> (loc elemanları str yapılıp nokta ile birleşir).</li><li>Diğer her şey → 500, <code>{"hata": "sunucu_hatasi", "mesaj": "Beklenmeyen bir hata oluştu"}</code> (iç ayrıntıyı sızdırma).</li></ul>',
      start: 'class UygulamaHatasi(Exception): pass\nclass BulunamadiHatasi(UygulamaHatasi): pass\nclass YetkiHatasi(UygulamaHatasi): pass\nclass IsKuraliHatasi(UygulamaHatasi): pass\nclass StokYetersiz(IsKuraliHatasi): pass\nclass GecersizKupon(IsKuraliHatasi): pass\nclass GecersizGecis(IsKuraliHatasi): pass\nfrom pydantic import ValidationError\n\n\ndef hata_yaniti(hata):\n    pass\n',
      sol: 'class UygulamaHatasi(Exception): pass\nclass BulunamadiHatasi(UygulamaHatasi): pass\nclass YetkiHatasi(UygulamaHatasi): pass\nclass IsKuraliHatasi(UygulamaHatasi): pass\nclass StokYetersiz(IsKuraliHatasi): pass\nclass GecersizKupon(IsKuraliHatasi): pass\nclass GecersizGecis(IsKuraliHatasi): pass\nfrom pydantic import ValidationError\n\nESLEME = {\n    BulunamadiHatasi: (404, "bulunamadi"),\n    YetkiHatasi: (401, "yetkisiz"),\n    IsKuraliHatasi: (409, "is_kurali"),\n    StokYetersiz: (409, "stok_yetersiz"),\n}\n\ndef hata_yaniti(hata):\n    if isinstance(hata, ValidationError):\n        ayrinti = [{"alan": ".".join(str(p) for p in h["loc"]), "mesaj": h["msg"]} for h in hata.errors()]\n        return 422, {"hata": "dogrulama", "ayrintilar": ayrinti}\n    for sinif in type(hata).__mro__:\n        if sinif in ESLEME:\n            kod, ad = ESLEME[sinif]\n            return kod, {"hata": ad, "mesaj": str(hata)}\n    return 500, {"hata": "sunucu_hatasi", "mesaj": "Beklenmeyen bir hata oluştu"}\n',
      tests: 'from pydantic import BaseModel, Field\nassert hata_yaniti(BulunamadiHatasi("sipariş 9 yok")) == (404, {"hata": "bulunamadi", "mesaj": "sipariş 9 yok"}), "404 eşlemesi"\nassert hata_yaniti(YetkiHatasi("süresi dolmuş"))[0] == 401, "YetkiHatasi 401"\nassert hata_yaniti(StokYetersiz("Bal"))== (409, {"hata": "stok_yetersiz", "mesaj": "Bal"}), "En özel sınıf (StokYetersiz) kazanmalı"\nassert hata_yaniti(GecersizKupon("X")) == (409, {"hata": "is_kurali", "mesaj": "X"}), "Kaydı olmayan alt sınıf üst sınıfın (IsKuraliHatasi) eşlemesini almalı"\nclass K(BaseModel):\n    adet: int = Field(ge=1)\nclass S(BaseModel):\n    kalemler: list[K]\ntry:\n    S(kalemler=[{"adet": 0}])\nexcept Exception as e:\n    kod, g = hata_yaniti(e)\n    assert kod == 422 and g["hata"] == "dogrulama", "ValidationError 422 olmalı"\n    assert g["ayrintilar"][0]["alan"] == "kalemler.0.adet", f"Alan yolu noktalı olmalı: {g[\'ayrintilar\']}"\n    assert "mesaj" in g["ayrintilar"][0], "Her ayrıntıda mesaj olmalı"\nkod, g = hata_yaniti(KeyError("SELECT * FROM kullanicilar"))\nassert kod == 500 and g == {"hata": "sunucu_hatasi", "mesaj": "Beklenmeyen bir hata oluştu"}, "500\'de iç ayrıntı (SQL) sızdırılmamalı"\nassert hata_yaniti(UygulamaHatasi("genel"))[0] == 500, "Kaydı olmayan kök hata 500"\n',
      hints: ['Eşlemeyi bir sözlükte tut: {Sinif: (kod, ad)}.', 'type(hata).__mro__ sınıfın kendisinden başlayıp üst sınıflara gider; ilk bulunan en özel olandır.', 'ValidationError kontrolünü en başta yap; loc demetini ".".join(str(p) for p in loc) ile birleştir.'],
      why: 'Tek bir eşleme tablosu, her uç noktada tekrar eden try/except bloklarını ortadan kaldırır. MRO ile arama, yeni bir iş kuralı hatası eklediğinde kayıt yapmasan bile doğru (409) kodu almasını sağlar. 500\'de genel mesaj vermek bilgi sızıntısını önler.' },
    { t: 'code',
      id: 'proje-api-7',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p><b>Kimlik doğrulama.</b> İki fonksiyon yaz:</p><ul><li><code>token_uret(kullanici, son, gizli)</code>: <code>govde = f"{kullanici}.{son}"</code>, imza = <code>hmac.new(gizli, govde.encode(), hashlib.sha256).hexdigest()</code>; <code>f"{govde}.{imza}"</code> döndür.</li><li><code>token_dogrula(token, gizli, simdi)</code>: token\'ı <code>rsplit(".", 2)</code> ile ayır; üç parça çıkmazsa ya da <code>son</code> int değilse <code>YetkiHatasi("bozuk token")</code>. İmza <code>hmac.compare_digest</code> ile tutmazsa <code>YetkiHatasi("imza geçersiz")</code>. <code>simdi &gt;= son</code> ise <code>YetkiHatasi("süresi dolmuş")</code>. Geçerliyse kullanıcı adını döndür.</li></ul>',
      start: 'import hashlib, hmac\n\nclass YetkiHatasi(Exception):\n    pass\n',
      sol: 'import hashlib, hmac\n\nclass YetkiHatasi(Exception):\n    pass\n\ndef _imza(govde, gizli):\n    return hmac.new(gizli, govde.encode(), hashlib.sha256).hexdigest()\n\ndef token_uret(kullanici, son, gizli):\n    govde = f"{kullanici}.{son}"\n    return f"{govde}.{_imza(govde, gizli)}"\n\ndef token_dogrula(token, gizli, simdi):\n    parcalar = token.rsplit(".", 2)\n    if len(parcalar) != 3:\n        raise YetkiHatasi("bozuk token")\n    kullanici, son, imza = parcalar\n    try:\n        son_i = int(son)\n    except ValueError:\n        raise YetkiHatasi("bozuk token")\n    if not hmac.compare_digest(imza, _imza(f"{kullanici}.{son}", gizli)):\n        raise YetkiHatasi("imza geçersiz")\n    if simdi >= son_i:\n        raise YetkiHatasi("süresi dolmuş")\n    return kullanici\n',
      tests: 'import hashlib, hmac\nG = b"test-gizli"\nt = token_uret("ayse", 2000, G)\nassert t == "ayse.2000." + hmac.new(G, b"ayse.2000", hashlib.sha256).hexdigest(), "Token biçimi kullanici.son.imza olmalı"\nassert token_dogrula(t, G, 1999) == "ayse", "Geçerli token kullanıcıyı döndürmeli"\nassert token_dogrula(token_uret("ali.veli", 50, G), G, 1) == "ali.veli", "Kullanıcı adında nokta olabilir: rsplit kullan"\ndef neden(tok, gizli=G, simdi=100):\n    try:\n        token_dogrula(tok, gizli, simdi)\n    except YetkiHatasi as e:\n        return str(e)\n    return None\nassert neden(t, simdi=2000) == "süresi dolmuş", "simdi == son ise süresi dolmuş sayılır"\nassert neden(t.replace("ayse", "admn")) == "imza geçersiz", "Kullanıcı adı değiştirilirse imza tutmamalı"\nassert neden(t.replace(".2000.", ".9999.")) == "imza geçersiz", "Süre uzatılırsa imza tutmamalı"\nassert neden(t, gizli=b"baska") == "imza geçersiz", "Farklı anahtar imzayı bozar"\nassert neden("rastgele") == "bozuk token", "Parçasız token bozuk"\nassert neden("ayse.yarin.abc") == "bozuk token", "son sayı değilse bozuk"\nassert "compare_digest" in __source__, "İmza hmac.compare_digest ile karşılaştırılmalı"\n',
      hints: ['rsplit(".", 2) sağdan en fazla iki kez böler; kullanıcı adındaki noktalar korunur.', 'İmzayı yeniden hesaplamak için aynı govde metnini (kullanici.son) kullan.', 'Sıra: biçim → imza → süre. Süreye imzadan önce bakarsan sahte bir token hakkında bilgi vermiş olursun.'],
      why: 'İmza, token\'ın içeriğini değiştirmeyi imkânsız kılar: kullanıcı adı ya da süre değişince HMAC tutmaz. JWT de özünde budur (başlık.gövde.imza). Gizli anahtar ortam değişkeninden gelir ve asla koda yazılmaz.' },
    { t: 'code',
      id: 'proje-api-8',
      stage: 'Hata avı',
      kind: 'bug',
      diff: 2,
      q: '<p><b>Hatayı bul ve düzelt.</b> Eski bir modül sepet toplamını TL cinsinden <code>float</code> ile hesaplıyor; muhasebe raporlarında kuruş farkları çıkıyor. <code>sepet_toplami(kalemler)</code> fonksiyonu <code>("19.99", 3)</code> gibi (fiyat metni, adet) demetleri alıp toplamı <b>kuruş cinsinden int</b> döndürmeli; <code>kdv_dahil(kurus, oran)</code> ise KDV\'yi ekleyip <b>yarım yukarı</b> (ROUND_HALF_UP) yuvarlanmış kuruş döndürmeli.</p>',
      start: 'def sepet_toplami(kalemler):\n    toplam = 0.0\n    for fiyat, adet in kalemler:\n        toplam += float(fiyat) * adet\n    return int(toplam * 100)\n\ndef kdv_dahil(kurus, oran):\n    return round(kurus * (1 + oran / 100))\n',
      sol: 'from decimal import Decimal, ROUND_HALF_UP\n\ndef sepet_toplami(kalemler):\n    toplam = Decimal("0")\n    for fiyat, adet in kalemler:\n        toplam += Decimal(fiyat) * adet\n    return int(toplam * 100)\n\ndef kdv_dahil(kurus, oran):\n    sonuc = Decimal(kurus) * (Decimal(100) + Decimal(oran)) / Decimal(100)\n    return int(sonuc.quantize(Decimal("1"), rounding=ROUND_HALF_UP))\n',
      tests: 'assert sepet_toplami([("0.10", 1), ("0.20", 1)]) == 30, "0.10 + 0.20 TL = 30 kuruş olmalı (float ile 29 çıkar)"\nassert sepet_toplami([("19.99", 3), ("4.35", 1)]) == 6432, "19.99*3 + 4.35 = 64.32 TL = 6432 kuruş"\nassert sepet_toplami([("1.15", 1)]) == 115, "1.15 TL = 115 kuruş (float ile 114 çıkar)"\nassert kdv_dahil(1250, 20) == 1500, "1250 kuruş + %20 = 1500"\nassert kdv_dahil(1025, 10) == 1128, "1127.5 yarım yukarı 1128 olmalı"\nassert kdv_dahil(1225, 10) == 1348, "1347.5 yarım yukarı 1348 olmalı (round bankacı yuvarlaması yapar)"\nassert kdv_dahil(3, 50) == 5, "4.5 kuruş yarım yukarı 5 olmalı (round(4.5) bankacı yuvarlamasıyla 4 verir)"\nassert isinstance(sepet_toplami([("1", 1)]), int) and isinstance(kdv_dahil(1, 1), int), "Sonuçlar int olmalı"\n',
      hints: ['float ikili tabanda 0.1\'i tam tutamaz; 1.15 * 100 = 114.99999... olur ve int() aşağı keser.', 'Fiyat metnini doğrudan Decimal("19.99") ile çevir; float\'tan geçirme.', 'Python\'un round()\'u yarımları çifte yuvarlar: round(4.5) == 4. Decimal.quantize(Decimal("1"), rounding=ROUND_HALF_UP) kullan.'],
      why: 'Para hesaplarında float kullanmak kuruş kayıplarına yol açar; metinden Decimal\'e çevirmek değeri tam korur. round() bankacı yuvarlaması (yarımı çifte) yapar; muhasebede genellikle yarım yukarı istenir ve bu açıkça belirtilmelidir.' },
    { t: 'code',
      id: 'proje-api-9',
      stage: 'Hata avı',
      kind: 'bug',
      diff: 2,
      q: '<p><b>Hatayı bul ve düzelt.</b> <code>SiparisServisi.olustur</code> iki kalemli siparişte ikinci ürünün stoğu yetmeyince <code>StokYetersiz</code> fırlatıyor ama birinci ürünün stoğu <b>yine de düşmüş</b> oluyor. Ayrıca <code>getir(kullanici, sid)</code> başka bir kullanıcının siparişini döndürüyor. Beklenen: stok ya hep ya hiç düşmeli; sipariş başkasınınsa ya da yoksa <code>BulunamadiHatasi</code> (varlığını sızdırma).</p>',
      start: 'class UygulamaHatasi(Exception): pass\nclass BulunamadiHatasi(UygulamaHatasi): pass\nclass YetkiHatasi(UygulamaHatasi): pass\nclass IsKuraliHatasi(UygulamaHatasi): pass\nclass StokYetersiz(IsKuraliHatasi): pass\nclass GecersizKupon(IsKuraliHatasi): pass\nclass GecersizGecis(IsKuraliHatasi): pass\nclass SiparisServisi:\n    def __init__(self, stok):\n        self.stok = stok            # {urun_id: adet}\n        self.siparisler = {}\n        self.sayac = 0\n\n    def olustur(self, kullanici, kalemler):\n        for uid, adet in kalemler:\n            if self.stok.get(uid, 0) < adet:\n                raise StokYetersiz(uid)\n            self.stok[uid] -= adet\n        self.sayac += 1\n        self.siparisler[self.sayac] = {"id": self.sayac, "kullanici": kullanici, "kalemler": list(kalemler)}\n        return self.sayac\n\n    def getir(self, kullanici, sid):\n        if sid not in self.siparisler:\n            raise BulunamadiHatasi(sid)\n        return self.siparisler[sid]\n',
      sol: 'class UygulamaHatasi(Exception): pass\nclass BulunamadiHatasi(UygulamaHatasi): pass\nclass YetkiHatasi(UygulamaHatasi): pass\nclass IsKuraliHatasi(UygulamaHatasi): pass\nclass StokYetersiz(IsKuraliHatasi): pass\nclass GecersizKupon(IsKuraliHatasi): pass\nclass GecersizGecis(IsKuraliHatasi): pass\nclass SiparisServisi:\n    def __init__(self, stok):\n        self.stok = stok            # {urun_id: adet}\n        self.siparisler = {}\n        self.sayac = 0\n\n    def olustur(self, kullanici, kalemler):\n        for uid, adet in kalemler:\n            if self.stok.get(uid, 0) < adet:\n                raise StokYetersiz(uid)\n        for uid, adet in kalemler:\n            self.stok[uid] -= adet\n        self.sayac += 1\n        self.siparisler[self.sayac] = {"id": self.sayac, "kullanici": kullanici, "kalemler": list(kalemler)}\n        return self.sayac\n\n    def getir(self, kullanici, sid):\n        s = self.siparisler.get(sid)\n        if s is None or s["kullanici"] != kullanici:\n            raise BulunamadiHatasi(sid)\n        return s\n',
      tests: 's = SiparisServisi({1: 5, 2: 1})\ntry:\n    s.olustur("ayse", [(1, 2), (2, 3)])\n    assert False, "Stok yetersizken StokYetersiz beklenir"\nexcept StokYetersiz:\n    pass\nassert s.stok == {1: 5, 2: 1}, f"Başarısız siparişte hiçbir stok düşmemeli: {s.stok}"\nsid = s.olustur("ayse", [(1, 2), (2, 1)])\nassert s.stok == {1: 3, 2: 0}, "Başarılı siparişte tüm stoklar düşmeli"\nassert s.getir("ayse", sid)["kullanici"] == "ayse", "Sahibi siparişi görebilmeli"\nfor k, i in [("mehmet", sid), ("ayse", 99)]:\n    try:\n        s.getir(k, i); assert False, "Başkasının ya da olmayan sipariş BulunamadiHatasi vermeli"\n    except BulunamadiHatasi:\n        pass\n',
      hints: ['İki hata var: biri döngü yapısıyla, biri yetki kontrolüyle ilgili.', 'Önce tüm kalemleri kontrol eden bir döngü, ancak hepsi geçerse stoğu düşen ikinci bir döngü yaz.', 'getir\'de sipariş bulunsa bile kullanici eşleşmiyorsa BulunamadiHatasi fırlat (403 değil 404: varlığı gizle).'],
      why: 'Kontrol ve değişikliği aynı döngüde yapmak, ortada bir hata çıkınca yarım kalmış bir durum bırakır; veritabanında bunu işlem (transaction) geri alma çözer, bellekte ise önce doğrula sonra uygula kalıbı. Başkasının kaynağına 404 dönmek, saldırganın sipariş numaralarını tarayıp hangilerinin var olduğunu öğrenmesini (IDOR) engeller.' },
    { t: 'code',
      id: 'proje-api-10',
      stage: 'Meydan okuma',
      diff: 3,
      q: '<p><b>Atomik stok ayırma.</b> <code>stok_ayir(stok, kalemler)</code> yaz:</p><ul><li><code>stok</code>: <code>{urun_id: adet}</code>; <code>kalemler</code>: <code>(urun_id, adet)</code> listesi. Aynı ürün birden fazla satırda gelebilir; adetler toplanarak değerlendirilir.</li><li>Adet ≤ 0 olan satır varsa <code>ValueError</code>.</li><li>Yetersiz (ya da stokta hiç olmayan) ürünler varsa <code>StokYetersiz</code> fırlat; istisnanın <code>eksik</code> özniteliği <code>{urun_id: (istenen, mevcut)}</code> sözlüğü olsun (tüm eksikler).</li><li>Başarılıysa <b>yeni</b> bir stok sözlüğü döndür. <code>stok</code> asla değişmemeli.</li></ul><p><code>StokYetersiz</code> sınıfını <code>__init__(self, eksik)</code> ile sen tanımla.</p>',
      sol: 'from collections import Counter\n\nclass StokYetersiz(Exception):\n    def __init__(self, eksik):\n        super().__init__(f"yetersiz stok: {sorted(eksik)}")\n        self.eksik = eksik\n\ndef stok_ayir(stok, kalemler):\n    istenen = Counter()\n    for uid, adet in kalemler:\n        if adet <= 0:\n            raise ValueError(f"geçersiz adet: {uid} -> {adet}")\n        istenen[uid] += adet\n    eksik = {uid: (n, stok.get(uid, 0)) for uid, n in istenen.items() if stok.get(uid, 0) < n}\n    if eksik:\n        raise StokYetersiz(eksik)\n    yeni = dict(stok)\n    for uid, n in istenen.items():\n        yeni[uid] -= n\n    return yeni\n',
      tests: 'S = {1: 5, 2: 2, 3: 0}\nassert stok_ayir(S, [(1, 2), (2, 2)]) == {1: 3, 2: 0, 3: 0}, "Başarılı ayırma yeni stok döndürmeli"\nassert S == {1: 5, 2: 2, 3: 0}, "Girdi stok sözlüğü değişmemeli"\ntry:\n    stok_ayir(S, [(1, 3), (2, 1), (1, 3)])\n    assert False, "Aynı ürünün satırları toplanmalı: 3+3 = 6 > 5"\nexcept StokYetersiz as e:\n    assert e.eksik == {1: (6, 5)}, f"eksik {{1: (6, 5)}} olmalı: {e.eksik}"\ntry:\n    stok_ayir(S, [(3, 1), (2, 5), (9, 1), (1, 1)])\n    assert False\nexcept StokYetersiz as e:\n    assert e.eksik == {3: (1, 0), 2: (5, 2), 9: (1, 0)}, f"Tüm eksikler raporlanmalı (stokta olmayan 9 dahil): {e.eksik}"\nassert S == {1: 5, 2: 2, 3: 0}, "Hata durumunda da stok değişmemeli"\nfor kotu in [[(1, 0)], [(1, -2)]]:\n    try:\n        stok_ayir(S, kotu); assert False, "Adet <= 0 ValueError vermeli"\n    except ValueError:\n        pass\nassert stok_ayir({}, []) == {}, "Boş sipariş boş stokla çalışmalı"\n',
      hints: ['Önce Counter ile ürün başına toplam istenen adedi çıkar.', 'Eksikleri bir sözlük comprehension ile tek seferde bul; stokta olmayan ürün için stok.get(uid, 0).', 'Değişikliği yalnızca dict(stok) kopyası üzerinde, tüm kontroller geçtikten sonra yap.'],
      why: 'Satırları birleştirmeden kontrol etmek, aynı ürünü iki satırda isteyerek stok kontrolünü atlatmaya izin verir. Tüm eksikleri birden raporlamak istemciye "şunları azalt" diyebilmeyi sağlar; kopya üzerinde çalışmak ya-hep-ya-hiç garantisidir.' },
    { t: 'code',
      id: 'proje-api-11',
      stage: 'Meydan okuma',
      diff: 3,
      q: '<p><b>Tekrar güvenliği (idempotency).</b> <code>TekrarKoruyucu</code> sınıfını yaz:</p><ul><li><code>isle(anahtar, govde, islem)</code>: <code>govde</code> bir sözlük, <code>islem</code> govde\'yi alıp <code>(durum, cevap)</code> döndüren fonksiyon.</li><li><code>anahtar</code> None ise her seferinde <code>islem(govde)</code> çağrılır.</li><li>Anahtar ilk kez görülüyorsa <code>islem</code> çağrılır; sonuç ve govde\'nin parmak izi (<code>json.dumps(govde, sort_keys=True)</code>\'nın sha256 hex özeti) saklanır.</li><li>Aynı anahtar + aynı govde → <code>islem</code> <b>çağrılmadan</b> saklanan sonuç döner.</li><li>Aynı anahtar + farklı govde → <code>(422, {"hata": "anahtar_baska_istekle_kullanildi"})</code>.</li><li><code>islem</code> istisna fırlatırsa hiçbir şey saklanmaz (istisna yukarı geçer), böylece istemci tekrar deneyebilir.</li></ul>',
      sol: 'import hashlib, json\n\nclass TekrarKoruyucu:\n    def __init__(self):\n        self.kayitlar = {}\n\n    @staticmethod\n    def _iz(govde):\n        return hashlib.sha256(json.dumps(govde, sort_keys=True).encode()).hexdigest()\n\n    def isle(self, anahtar, govde, islem):\n        if anahtar is None:\n            return islem(govde)\n        iz = self._iz(govde)\n        if anahtar in self.kayitlar:\n            eski_iz, sonuc = self.kayitlar[anahtar]\n            if eski_iz != iz:\n                return 422, {"hata": "anahtar_baska_istekle_kullanildi"}\n            return sonuc\n        sonuc = islem(govde)\n        self.kayitlar[anahtar] = (iz, sonuc)\n        return sonuc\n',
      tests: 'cagri = []\ndef siparis_ac(g):\n    cagri.append(g)\n    return 201, {"id": len(cagri)}\nk = TekrarKoruyucu()\ng = {"kalemler": [[1, 2]], "kupon": None}\nassert k.isle("abc", g, siparis_ac) == (201, {"id": 1}), "İlk istek işlenmeli"\nassert k.isle("abc", {"kupon": None, "kalemler": [[1, 2]]}, siparis_ac) == (201, {"id": 1}), "Aynı anahtar + aynı gövde (anahtar sırası farklı olsa da) aynı cevabı vermeli"\nassert len(cagri) == 1, "Tekrar eden istekte işlem İKİNCİ KEZ çalışmamalı (çift sipariş!)"\nassert k.isle("abc", {"kalemler": [[1, 3]]}, siparis_ac) == (422, {"hata": "anahtar_baska_istekle_kullanildi"}), "Aynı anahtar farklı gövdeyle 422"\nassert k.isle(None, g, siparis_ac)[1] == {"id": 2} and k.isle(None, g, siparis_ac)[1] == {"id": 3}, "Anahtarsız istek her seferinde işlenmeli"\ndef patlayan(g):\n    raise ConnectionError("db")\ntry:\n    k.isle("xyz", g, patlayan); assert False, "İstisna yukarı geçmeli"\nexcept ConnectionError:\n    pass\nassert k.isle("xyz", g, siparis_ac)[0] == 201, "Başarısız işlem saklanmamalı; aynı anahtarla tekrar denenebilmeli"\n',
      hints: ['Saklanan değer (parmak_izi, sonuç) demeti olsun.', 'sort_keys=True, sözlük anahtar sırası farklı olsa da aynı JSON\'u üretir.', 'Sonucu yalnızca islem başarıyla döndükten sonra sakla; istisna olursa satıra hiç ulaşılmaz.'],
      why: 'Ödeme ve sipariş API\'lerinde (Stripe gibi) Idempotency-Key başlığı tam bu mantıkla çalışır: ağ zaman aşımında tekrar gönderilen istek çift sipariş oluşturmaz. Parmak izi, aynı anahtarın yanlışlıkla başka bir istekle kullanılmasını yakalar.' },
    { t: 'code',
      id: 'proje-api-12',
      stage: 'Mini proje',
      diff: 3,
      q: '<p><b>Mini proje 1: Servis katmanı + SQLAlchemy.</b> Modeller, hatalar ve kurallar başlangıç kodunda hazır. <code>SiparisServisi(oturum)</code> sınıfını yaz:</p><ul><li><code>olustur(musteri, kalemler, kupon=None)</code>: <code>kalemler</code> <code>(urun_id, adet)</code> listesi. Olmayan ürün → <code>BulunamadiHatasi</code>; aynı ürünün satırları toplanarak stok kontrolü, yetersizse <code>StokYetersiz</code> ve <b>hiçbir değişiklik kalıcı olmasın</b> (<code>rollback</code>). Fiyatı ders kurallarıyla hesapla (kupon, kargo); bilinmeyen kupon <code>GecersizKupon</code>. Stoğu düş, <code>Siparis</code> ve her satır için <code>Kalem</code> (birim_kurus o anki fiyat) oluştur, <code>commit</code> et, siparişin id\'sini döndür.</li><li><code>durum_degistir(sid, yeni)</code>: sipariş yoksa <code>BulunamadiHatasi</code>; <code>GECISLER</code>\'e uymuyorsa <code>GecersizGecis</code>. <code>"iptal"</code>e geçişte kalemlerin stoğu geri eklenir. commit et ve yeni durumu döndür.</li></ul>',
      start: 'class UygulamaHatasi(Exception): pass\nclass BulunamadiHatasi(UygulamaHatasi): pass\nclass YetkiHatasi(UygulamaHatasi): pass\nclass IsKuraliHatasi(UygulamaHatasi): pass\nclass StokYetersiz(IsKuraliHatasi): pass\nclass GecersizKupon(IsKuraliHatasi): pass\nclass GecersizGecis(IsKuraliHatasi): pass\nKUPONLAR = {"HOSGELDIN10": ("yuzde", 10), "SEPET50": ("tutar", 5000)}\nKARGO_ESIK, KARGO_UCRET = 75000, 3990\nGECISLER = {"yeni": {"odendi", "iptal"}, "odendi": {"kargoda", "iptal"},\n            "kargoda": {"teslim"}, "teslim": set(), "iptal": set()}\nfrom sqlalchemy import ForeignKey, String, create_engine, select\nfrom sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, relationship\n\nclass Base(DeclarativeBase):\n    pass\n\nclass Urun(Base):\n    __tablename__ = "urunler"\n    id: Mapped[int] = mapped_column(primary_key=True)\n    ad: Mapped[str] = mapped_column(String(80), unique=True)\n    fiyat_kurus: Mapped[int]\n    stok: Mapped[int]\n\nclass Siparis(Base):\n    __tablename__ = "siparisler"\n    id: Mapped[int] = mapped_column(primary_key=True)\n    musteri: Mapped[str]\n    durum: Mapped[str] = mapped_column(default="yeni")\n    ara_toplam: Mapped[int] = mapped_column(default=0)\n    indirim: Mapped[int] = mapped_column(default=0)\n    kargo: Mapped[int] = mapped_column(default=0)\n    toplam: Mapped[int] = mapped_column(default=0)\n    kalemler: Mapped[list["Kalem"]] = relationship(back_populates="siparis")\n\nclass Kalem(Base):\n    __tablename__ = "kalemler"\n    id: Mapped[int] = mapped_column(primary_key=True)\n    siparis_id: Mapped[int] = mapped_column(ForeignKey("siparisler.id"))\n    urun_id: Mapped[int] = mapped_column(ForeignKey("urunler.id"))\n    adet: Mapped[int]\n    birim_kurus: Mapped[int]\n    siparis: Mapped[Siparis] = relationship(back_populates="kalemler")\nclass SiparisServisi:\n    def __init__(self, oturum):\n        self.oturum = oturum\n\n    def olustur(self, musteri, kalemler, kupon=None):\n        # TODO: ürünleri getir, stok kontrol et, fiyat hesapla,\n        #       stok düş, Siparis + Kalem oluştur, commit\n        pass\n\n    def durum_degistir(self, sid, yeni):\n        # TODO: geçiş kontrolü, iptalde stok iadesi, commit\n        pass\n',
      sol: 'class UygulamaHatasi(Exception): pass\nclass BulunamadiHatasi(UygulamaHatasi): pass\nclass YetkiHatasi(UygulamaHatasi): pass\nclass IsKuraliHatasi(UygulamaHatasi): pass\nclass StokYetersiz(IsKuraliHatasi): pass\nclass GecersizKupon(IsKuraliHatasi): pass\nclass GecersizGecis(IsKuraliHatasi): pass\nKUPONLAR = {"HOSGELDIN10": ("yuzde", 10), "SEPET50": ("tutar", 5000)}\nKARGO_ESIK, KARGO_UCRET = 75000, 3990\nGECISLER = {"yeni": {"odendi", "iptal"}, "odendi": {"kargoda", "iptal"},\n            "kargoda": {"teslim"}, "teslim": set(), "iptal": set()}\nfrom sqlalchemy import ForeignKey, String, create_engine, select\nfrom sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, relationship\n\nclass Base(DeclarativeBase):\n    pass\n\nclass Urun(Base):\n    __tablename__ = "urunler"\n    id: Mapped[int] = mapped_column(primary_key=True)\n    ad: Mapped[str] = mapped_column(String(80), unique=True)\n    fiyat_kurus: Mapped[int]\n    stok: Mapped[int]\n\nclass Siparis(Base):\n    __tablename__ = "siparisler"\n    id: Mapped[int] = mapped_column(primary_key=True)\n    musteri: Mapped[str]\n    durum: Mapped[str] = mapped_column(default="yeni")\n    ara_toplam: Mapped[int] = mapped_column(default=0)\n    indirim: Mapped[int] = mapped_column(default=0)\n    kargo: Mapped[int] = mapped_column(default=0)\n    toplam: Mapped[int] = mapped_column(default=0)\n    kalemler: Mapped[list["Kalem"]] = relationship(back_populates="siparis")\n\nclass Kalem(Base):\n    __tablename__ = "kalemler"\n    id: Mapped[int] = mapped_column(primary_key=True)\n    siparis_id: Mapped[int] = mapped_column(ForeignKey("siparisler.id"))\n    urun_id: Mapped[int] = mapped_column(ForeignKey("urunler.id"))\n    adet: Mapped[int]\n    birim_kurus: Mapped[int]\n    siparis: Mapped[Siparis] = relationship(back_populates="kalemler")\nfrom collections import Counter\n\ndef fiyat_hesapla(satirlar, kupon=None):\n    ara = sum(f * a for f, a in satirlar)\n    indirim = 0\n    if kupon:\n        if kupon not in KUPONLAR:\n            raise GecersizKupon(kupon)\n        tur, deger = KUPONLAR[kupon]\n        indirim = ara * deger // 100 if tur == "yuzde" else min(deger, ara)\n    net = ara - indirim\n    kargo = 0 if net >= KARGO_ESIK else KARGO_UCRET\n    return {"ara_toplam": ara, "indirim": indirim, "kargo": kargo, "toplam": net + kargo}\n\nclass SiparisServisi:\n    def __init__(self, oturum):\n        self.oturum = oturum\n\n    def olustur(self, musteri, kalemler, kupon=None):\n        try:\n            istenen = Counter()\n            urunler = {}\n            for uid, adet in kalemler:\n                u = self.oturum.get(Urun, uid)\n                if u is None:\n                    raise BulunamadiHatasi(f"ürün {uid}")\n                urunler[uid] = u\n                istenen[uid] += adet\n            eksik = [uid for uid, n in istenen.items() if urunler[uid].stok < n]\n            if eksik:\n                raise StokYetersiz(eksik)\n            fiyat = fiyat_hesapla([(urunler[uid].fiyat_kurus, adet) for uid, adet in kalemler], kupon)\n            for uid, n in istenen.items():\n                urunler[uid].stok -= n\n            s = Siparis(musteri=musteri, **fiyat)\n            for uid, adet in kalemler:\n                s.kalemler.append(Kalem(urun_id=uid, adet=adet, birim_kurus=urunler[uid].fiyat_kurus))\n            self.oturum.add(s)\n            self.oturum.commit()\n            return s.id\n        except Exception:\n            self.oturum.rollback()\n            raise\n\n    def durum_degistir(self, sid, yeni):\n        s = self.oturum.get(Siparis, sid)\n        if s is None:\n            raise BulunamadiHatasi(f"sipariş {sid}")\n        if yeni not in GECISLER.get(s.durum, set()):\n            raise GecersizGecis(f"{s.durum} -> {yeni}")\n        if yeni == "iptal":\n            for k in s.kalemler:\n                self.oturum.get(Urun, k.urun_id).stok += k.adet\n        s.durum = yeni\n        self.oturum.commit()\n        return yeni\n',
      tests: 'motor = create_engine("sqlite://")\nBase.metadata.create_all(motor)\nwith Session(motor) as o:\n    o.add_all([Urun(ad="Çay", fiyat_kurus=18950, stok=10), Urun(ad="Bal", fiyat_kurus=42500, stok=2), Urun(ad="Fındık", fiyat_kurus=24900, stok=1)])\n    o.commit()\n    srv = SiparisServisi(o)\n    sid = srv.olustur("ayse", [(1, 2), (2, 1)], "HOSGELDIN10")\n    s = o.get(Siparis, sid)\n    assert s is not None and sid == 1, "olustur sipariş id\'sini döndürmeli"\n    assert (s.ara_toplam, s.indirim, s.kargo, s.toplam) == (80400, 8040, 3990, 76350), f"Fiyat kuralları uygulanmalı: {(s.ara_toplam, s.indirim, s.kargo, s.toplam)}"\n    assert [(k.urun_id, k.adet, k.birim_kurus) for k in s.kalemler] == [(1, 2, 18950), (2, 1, 42500)], "Her satır için Kalem oluşmalı"\n    assert (o.get(Urun, 1).stok, o.get(Urun, 2).stok) == (8, 1), "Stoklar düşmeli"\n    for kalemler, hata in [([(1, 1), (3, 1), (3, 1)], StokYetersiz), ([(1, 1), (99, 1)], BulunamadiHatasi)]:\n        try:\n            srv.olustur("mehmet", kalemler); assert False, f"{hata.__name__} bekleniyordu"\n        except hata:\n            pass\n        assert (o.get(Urun, 1).stok, o.get(Urun, 3).stok) == (8, 1), "Hatalı siparişte hiçbir stok değişmemeli (rollback)"\n    try:\n        srv.olustur("mehmet", [(1, 1)], "BEDAVA"); assert False, "Bilinmeyen kupon"\n    except GecersizKupon:\n        pass\n    assert o.get(Urun, 1).stok == 8 and o.scalars(select(Siparis)).all().__len__() == 1, "Kupon hatasında da hiçbir şey kalıcı olmamalı"\n    assert srv.durum_degistir(sid, "odendi") == "odendi", "yeni -> odendi geçerli"\n    try:\n        srv.durum_degistir(sid, "teslim"); assert False, "odendi -> teslim geçersiz"\n    except GecersizGecis:\n        pass\n    srv.durum_degistir(sid, "iptal")\n    assert (o.get(Urun, 1).stok, o.get(Urun, 2).stok) == (10, 2), "İptalde stok geri eklenmeli"\n    try:\n        srv.durum_degistir(42, "odendi"); assert False\n    except BulunamadiHatasi:\n        pass\nwith Session(motor) as o2:\n    assert o2.get(Siparis, 1).durum == "iptal", "Değişiklikler commit edilmiş olmalı (yeni oturumda görünür)"\n',
      hints: ['Önce tüm doğrulamalar (ürün var mı, stok, kupon), sonra değişiklikler; hepsini try içine al ve except\'te rollback edip yeniden fırlat.', 'Aynı ürünün satırları için Counter kullan; fiyat hesabını Rehberli aşamadaki fiyat_hesapla ile yap.', 'Siparis(musteri=..., **fiyat) alanları doğrudan doldurur; s.kalemler.append(Kalem(...)) ilişki üzerinden ekler.'],
      why: 'Servis katmanı işlem sınırıdır: ya sipariş, kalemler ve stok düşümü birlikte kalıcı olur ya da hiçbiri. Kupon hatası stok düşümünden önce yakalansa bile try/rollback kalıbı, ileride eklenecek yeni bir kuralın yarım kayıt bırakmasını da önler.' },
    { t: 'code',
      id: 'proje-api-13',
      stage: 'Mini proje',
      diff: 3,
      q: '<p><b>Mini proje 2: Uç nokta katmanı.</b> Şemalar, hatalar ve <code>BellekServis</code> başlangıç kodunda hazır. <code>Uygulama(servis, gizli, saat)</code> sınıfını yaz; <code>saat()</code> şimdiki zamanı (int saniye) verir. <code>isle(istek)</code> metodu bir istek sözlüğü <code>{"metot", "yol", "basliklar", "govde"}</code> alıp <code>(durum, govde)</code> döndürsün. Uç noktalar:</p><div class="tbl-wrap"><table><tr><th>Metot ve yol</th><th>Kimlik</th><th>Başarılı cevap</th></tr><tr><td><code>GET /saglik</code></td><td>Gerekmez</td><td><code>200, {"durum": "ok"}</code></td></tr><tr><td><code>POST /siparisler</code></td><td>Gerekir</td><td><code>201</code>, servis sonucu (gövde <code>SiparisOlustur</code> ile doğrulanır; servise <code>[(urun_id, adet), ...]</code> verilir)</td></tr><tr><td><code>GET /siparisler/{sid:int}</code></td><td>Gerekir</td><td><code>200</code>, sipariş</td></tr><tr><td><code>PATCH /siparisler/{sid:int}/durum</code></td><td>Gerekir</td><td><code>200</code>, sipariş (gövde <code>DurumGirdi</code>)</td></tr></table></div><ul><li>Kimlik: <code>basliklar["Authorization"] == "Bearer &lt;token&gt;"</code>; token <code>kullanici.son.imza</code> (hmac-sha256). Eksik/bozuk/süresi dolmuş → <code>YetkiHatasi</code>.</li><li>Hata eşleme: Yetki 401 <code>"yetkisiz"</code>, Bulunamadı 404 <code>"bulunamadi"</code>, iş kuralı 409 <code>"is_kurali"</code> (gövde <code>{"hata", "mesaj"}</code>); ValidationError 422 <code>{"hata": "dogrulama"}</code>; bilinmeyen yol 404 <code>{"hata": "rota_yok"}</code>; yol var metot yok 405 <code>{"hata": "metot_yok"}</code>; diğer her şey 500 <code>{"hata": "sunucu_hatasi"}</code>.</li></ul><p>Önceki görevlerdeki yönlendirici ve token kodunu kullanabilirsin.</p>',
      start: 'class UygulamaHatasi(Exception): pass\nclass BulunamadiHatasi(UygulamaHatasi): pass\nclass YetkiHatasi(UygulamaHatasi): pass\nclass IsKuraliHatasi(UygulamaHatasi): pass\nclass StokYetersiz(IsKuraliHatasi): pass\nclass GecersizKupon(IsKuraliHatasi): pass\nclass GecersizGecis(IsKuraliHatasi): pass\nimport hashlib, hmac\nfrom pydantic import BaseModel, ConfigDict, Field, ValidationError\n\nGIZLI = b"proje-gizli"\n\ndef token_uret(kullanici, son, gizli=GIZLI):\n    govde = f"{kullanici}.{son}"\n    return govde + "." + hmac.new(gizli, govde.encode(), hashlib.sha256).hexdigest()\n\nclass KalemGirdi(BaseModel):\n    model_config = ConfigDict(extra="forbid")\n    urun_id: int = Field(gt=0)\n    adet: int = Field(ge=1, le=100)\n\nclass SiparisOlustur(BaseModel):\n    model_config = ConfigDict(extra="forbid")\n    kalemler: list[KalemGirdi] = Field(min_length=1)\n\nclass DurumGirdi(BaseModel):\n    durum: str\n\nclass BellekServis:\n    """Hazır servis: iş kurallarını uygular, HTTP bilmez."""\n    def __init__(self, stok):\n        self.stok, self.siparisler = dict(stok), {}\n    def olustur(self, kullanici, kalemler):\n        for uid, adet in kalemler:\n            if uid not in self.stok:\n                raise BulunamadiHatasi(f"ürün {uid}")\n            if self.stok[uid] < adet:\n                raise StokYetersiz(f"ürün {uid}")\n        for uid, adet in kalemler:\n            self.stok[uid] -= adet\n        sid = len(self.siparisler) + 1\n        self.siparisler[sid] = {"id": sid, "kullanici": kullanici, "durum": "yeni", "kalemler": kalemler}\n        return self.siparisler[sid]\n    def getir(self, kullanici, sid):\n        s = self.siparisler.get(sid)\n        if s is None or s["kullanici"] != kullanici:\n            raise BulunamadiHatasi(f"sipariş {sid}")\n        return s\n    def durum(self, kullanici, sid, yeni):\n        s = self.getir(kullanici, sid)\n        izin = {"yeni": {"odendi", "iptal"}, "odendi": {"kargoda", "iptal"}, "kargoda": {"teslim"}}\n        if yeni not in izin.get(s["durum"], set()):\n            raise GecersizGecis(f"{s[\'durum\']} -> {yeni}")\n        s["durum"] = yeni\n        return s\nclass Uygulama:\n    def __init__(self, servis, gizli, saat):\n        self.servis, self.gizli, self.saat = servis, gizli, saat\n\n    def isle(self, istek):\n        # TODO: yönlendir, kimlik doğrula, şemayı doğrula, servisi çağır, hatayı eşle\n        return 500, {"hata": "sunucu_hatasi"}\n',
      sol: 'class UygulamaHatasi(Exception): pass\nclass BulunamadiHatasi(UygulamaHatasi): pass\nclass YetkiHatasi(UygulamaHatasi): pass\nclass IsKuraliHatasi(UygulamaHatasi): pass\nclass StokYetersiz(IsKuraliHatasi): pass\nclass GecersizKupon(IsKuraliHatasi): pass\nclass GecersizGecis(IsKuraliHatasi): pass\nimport hashlib, hmac\nfrom pydantic import BaseModel, ConfigDict, Field, ValidationError\n\nGIZLI = b"proje-gizli"\n\ndef token_uret(kullanici, son, gizli=GIZLI):\n    govde = f"{kullanici}.{son}"\n    return govde + "." + hmac.new(gizli, govde.encode(), hashlib.sha256).hexdigest()\n\nclass KalemGirdi(BaseModel):\n    model_config = ConfigDict(extra="forbid")\n    urun_id: int = Field(gt=0)\n    adet: int = Field(ge=1, le=100)\n\nclass SiparisOlustur(BaseModel):\n    model_config = ConfigDict(extra="forbid")\n    kalemler: list[KalemGirdi] = Field(min_length=1)\n\nclass DurumGirdi(BaseModel):\n    durum: str\n\nclass BellekServis:\n    """Hazır servis: iş kurallarını uygular, HTTP bilmez."""\n    def __init__(self, stok):\n        self.stok, self.siparisler = dict(stok), {}\n    def olustur(self, kullanici, kalemler):\n        for uid, adet in kalemler:\n            if uid not in self.stok:\n                raise BulunamadiHatasi(f"ürün {uid}")\n            if self.stok[uid] < adet:\n                raise StokYetersiz(f"ürün {uid}")\n        for uid, adet in kalemler:\n            self.stok[uid] -= adet\n        sid = len(self.siparisler) + 1\n        self.siparisler[sid] = {"id": sid, "kullanici": kullanici, "durum": "yeni", "kalemler": kalemler}\n        return self.siparisler[sid]\n    def getir(self, kullanici, sid):\n        s = self.siparisler.get(sid)\n        if s is None or s["kullanici"] != kullanici:\n            raise BulunamadiHatasi(f"sipariş {sid}")\n        return s\n    def durum(self, kullanici, sid, yeni):\n        s = self.getir(kullanici, sid)\n        izin = {"yeni": {"odendi", "iptal"}, "odendi": {"kargoda", "iptal"}, "kargoda": {"teslim"}}\n        if yeni not in izin.get(s["durum"], set()):\n            raise GecersizGecis(f"{s[\'durum\']} -> {yeni}")\n        s["durum"] = yeni\n        return s\nclass RotaYok(Exception): pass\nclass MetotYok(Exception): pass\n\nclass Uygulama:\n    def __init__(self, servis, gizli, saat):\n        self.servis, self.gizli, self.saat = servis, gizli, saat\n        self.rotalar = [\n            ("GET", "saglik", self.saglik, False),\n            ("POST", "siparisler", self.olustur, True),\n            ("GET", "siparisler/{sid:int}", self.getir, True),\n            ("PATCH", "siparisler/{sid:int}/durum", self.durum, True),\n        ]\n\n    # --- yönlendirme ---\n    @staticmethod\n    def _eslestir(desen, yol):\n        d_p, y_p = desen.split("/"), yol.strip("/").split("/")\n        if len(d_p) != len(y_p):\n            return None\n        params = {}\n        for d, y in zip(d_p, y_p):\n            if d.startswith("{"):\n                ad, _, tur = d[1:-1].partition(":")\n                if tur == "int" and not y.isdigit():\n                    return None\n                params[ad] = int(y) if tur == "int" else y\n            elif d != y:\n                return None\n        return params\n\n    def _coz(self, metot, yol):\n        yol_var = False\n        for m, desen, f, kimlik in self.rotalar:\n            params = self._eslestir(desen, yol)\n            if params is None:\n                continue\n            if m == metot:\n                return f, params, kimlik\n            yol_var = True\n        raise MetotYok() if yol_var else RotaYok()\n\n    # --- kimlik ---\n    def _kullanici(self, basliklar):\n        deger = (basliklar or {}).get("Authorization", "")\n        if not deger.startswith("Bearer "):\n            raise YetkiHatasi("token yok")\n        parcalar = deger[len("Bearer "):].rsplit(".", 2)\n        if len(parcalar) != 3 or not parcalar[1].isdigit():\n            raise YetkiHatasi("bozuk token")\n        kullanici, son, imza = parcalar\n        beklenen = hmac.new(self.gizli, f"{kullanici}.{son}".encode(), hashlib.sha256).hexdigest()\n        if not hmac.compare_digest(imza, beklenen):\n            raise YetkiHatasi("imza geçersiz")\n        if self.saat() >= int(son):\n            raise YetkiHatasi("süresi dolmuş")\n        return kullanici\n\n    # --- uç noktalar ---\n    def saglik(self, kullanici, govde):\n        return 200, {"durum": "ok"}\n\n    def olustur(self, kullanici, govde):\n        g = SiparisOlustur.model_validate(govde or {})\n        return 201, self.servis.olustur(kullanici, [(k.urun_id, k.adet) for k in g.kalemler])\n\n    def getir(self, kullanici, govde, sid):\n        return 200, self.servis.getir(kullanici, sid)\n\n    def durum(self, kullanici, govde, sid):\n        g = DurumGirdi.model_validate(govde or {})\n        return 200, self.servis.durum(kullanici, sid, g.durum)\n\n    # --- giriş noktası ---\n    def isle(self, istek):\n        try:\n            f, params, kimlik = self._coz(istek.get("metot", ""), istek.get("yol", ""))\n            kullanici = self._kullanici(istek.get("basliklar")) if kimlik else None\n            return f(kullanici, istek.get("govde"), **params)\n        except RotaYok:\n            return 404, {"hata": "rota_yok"}\n        except MetotYok:\n            return 405, {"hata": "metot_yok"}\n        except ValidationError:\n            return 422, {"hata": "dogrulama"}\n        except YetkiHatasi as e:\n            return 401, {"hata": "yetkisiz", "mesaj": str(e)}\n        except BulunamadiHatasi as e:\n            return 404, {"hata": "bulunamadi", "mesaj": str(e)}\n        except IsKuraliHatasi as e:\n            return 409, {"hata": "is_kurali", "mesaj": str(e)}\n        except Exception:\n            return 500, {"hata": "sunucu_hatasi"}\n',
      tests: 'SIMDI = 1_700_000_000\napp = Uygulama(BellekServis({1: 5, 2: 1}), GIZLI, lambda: SIMDI)\nA = {"Authorization": "Bearer " + token_uret("ayse", SIMDI + 3600)}\nM = {"Authorization": "Bearer " + token_uret("mehmet", SIMDI + 3600)}\ndef istek(metot, yol, basliklar=None, govde=None):\n    return app.isle({"metot": metot, "yol": yol, "basliklar": basliklar or {}, "govde": govde})\nassert istek("GET", "/saglik") == (200, {"durum": "ok"}), "Sağlık kontrolü kimliksiz çalışmalı"\nd, g = istek("POST", "/siparisler", A, {"kalemler": [{"urun_id": 1, "adet": 2}]})\nassert d == 201 and g["id"] == 1 and g["kullanici"] == "ayse", f"Sipariş 201 ile oluşmalı: {d} {g}"\nassert istek("GET", "/siparisler/1", A)[1]["durum"] == "yeni", "Sahibi siparişi görebilmeli"\nassert istek("GET", "/siparisler/1", M)[0] == 404, "Başkasının siparişi 404 (varlığı gizlenir)"\nassert istek("POST", "/siparisler")[0] == 401, "Token yoksa 401"\nassert istek("POST", "/siparisler", {"Authorization": "Bearer " + token_uret("ayse", SIMDI - 1)}, {"kalemler": []})[0] == 401, "Süresi dolmuş token 401 (doğrulamadan önce kimlik)"\nassert istek("GET", "/siparisler/1", {"Authorization": A["Authorization"].replace("ayse", "mehm")})[0] == 401, "İmzası bozuk token 401"\nassert istek("POST", "/siparisler", A, {"kalemler": [{"urun_id": 1, "adet": 0}]})[0] == 422, "Geçersiz gövde 422"\nassert istek("POST", "/siparisler", A, {"kalemler": [{"urun_id": 2, "adet": 5}]}) == (409, {"hata": "is_kurali", "mesaj": "ürün 2"}), "Stok yetersiz 409"\nassert istek("POST", "/siparisler", A, {"kalemler": [{"urun_id": 9, "adet": 1}]})[0] == 404, "Olmayan ürün 404"\nassert istek("PATCH", "/siparisler/1/durum", A, {"durum": "odendi"})[1]["durum"] == "odendi", "Durum değişmeli"\nassert istek("PATCH", "/siparisler/1/durum", A, {"durum": "teslim"})[0] == 409, "Geçersiz geçiş 409"\nassert istek("GET", "/siparisler/abc", A) == (404, {"hata": "rota_yok"}), "int olmayan id rota bulamamalı"\nassert istek("DELETE", "/siparisler/1", A) == (405, {"hata": "metot_yok"}), "Yol var metot yok 405"\nassert istek("GET", "/musteriler", A) == (404, {"hata": "rota_yok"}), "Bilinmeyen yol 404"\nclass Bozuk(BellekServis):\n    def getir(self, k, s):\n        raise RuntimeError("SELECT gizli tablo")\napp2 = Uygulama(Bozuk({}), GIZLI, lambda: SIMDI)\nassert app2.isle({"metot": "GET", "yol": "/siparisler/1", "basliklar": A, "govde": None}) == (500, {"hata": "sunucu_hatasi"}), "Beklenmeyen hata 500 ve ayrıntısız"\n',
      hints: ['isle\'yi tek bir try bloğu olarak düşün: yönlendir → (gerekirse) kimlik → işleyici; except blokları en özelden en genele sıralı olsun (IsKuraliHatasi, Exception\'dan önce).', 'Rotaları (metot, desen, isleyici, kimlik_gerekli_mi) demetleri olarak tut; yol eşleşip metot eşleşmezse 405.', 'Gövdeyi SiparisOlustur.model_validate(govde or {}) ile doğrula; servise [(k.urun_id, k.adet) for k in g.kalemler] ver.'],
      why: 'Bu katman bir web çatısının yaptığını yapar: yönlendirme, kimlik doğrulama bağımlılığı, şema doğrulama ve istisna işleyicileri. Servis HTTP bilmediği için aynı BellekServis ileride SQLAlchemy servisiyle değiştirilebilir; uç nokta testleri ise gerçek sunucu açmadan istek sözlükleriyle uçtan uca koşar.' }
  ],
  faq: [
    { q: 'Bu projeyi gerçek FastAPI uygulamasına nasıl çeviririm?',
      a: 'Şema, depo ve servis katmanları olduğu gibi kalır. <code>api.py</code>\'de <code>FastAPI()</code> oluşturup her uç noktayı dekoratörle tanımla, servis ve kullanıcıyı <code>Depends</code> ile enjekte et, alan hatalarını <code>@app.exception_handler</code> ile HTTP koduna çevir. Testte <code>fastapi.testclient.TestClient</code> ve <code>app.dependency_overrides</code> ile sahte servis verirsin.' },
    { q: 'Depo katmanı gereksiz bir soyutlama değil mi? SQLAlchemy zaten bir soyutlama.',
      a: 'Küçük projelerde servis doğrudan Session kullanabilir. Depo, sorguları tek yerde toplar, servis testlerinde fake ile değiştirilmesini kolaylaştırır ve "SQL nerede?" sorusuna tek cevap verir. Proje büyüdükçe bu kazanç artar; tamamen dogmatik olma.' },
    { q: 'SQLite yerine PostgreSQL\'e geçince ne değişir?',
      a: 'Kodda yalnızca bağlantı adresi: <code>create_engine(os.environ["DATABASE_URL"])</code>. Ek olarak <code>psycopg</code> sürücüsünü kurarsın, tabloları Alembic göçleriyle yönetirsin ve eşzamanlı stok için <code>with_for_update()</code> gibi satır kilitlerinden yararlanırsın.' },
    { q: 'Token\'ı neden kendim yazdım, JWT kullanmak daha iyi değil mi?',
      a: 'Üretimde evet: <code>PyJWT</code> ya da bir kimlik sağlayıcı (Keycloak, Auth0) kullan. Buradaki amaç imzanın nasıl çalıştığını anlamaktı; JWT de başlık.gövde.imza yapısında aynı HMAC fikrini kullanır. Kendi kripto algoritmanı icat etme, ama kullandığın aracın ne yaptığını bil.' },
    { q: 'Bu projeyi portfolyomda nasıl sunmalıyım?',
      a: 'GitHub deposunda README (mimari diyagramı, çalıştırma komutu, uç nokta tablosu), testlerin CI\'da koştuğu bir GitHub Actions rozeti, Dockerfile ve compose dosyası olsun. Render ya da Fly.io\'ya dağıtıp <code>/docs</code> bağlantısını ekle. Mülakatta katman kararlarını ve stok yarış durumunu nasıl çözdüğünü anlatabilmek en büyük artıdır.' }
  ],
  mistakes: [
    { bad: '@app.post("/siparisler")\ndef olustur(girdi: SiparisOlustur):\n    urun = db.query(Urun).get(girdi.urun_id)\n    if urun.stok < girdi.adet:\n        raise HTTPException(409)',
      good: '@app.post("/siparisler")\ndef olustur(girdi: SiparisOlustur, servis=Depends(servis_al)):\n    return servis.olustur(girdi)',
      why: 'İş kuralı ve SQL uç noktaya gömülünce HTTP olmadan test edilemez ve başka bir girişten (CLI, kuyruk) yeniden kullanılamaz.' },
    { bad: 'for uid, adet in kalemler:\n    kontrol_et(uid, adet)\n    stok_dus(uid, adet)',
      good: 'for uid, adet in kalemler:\n    kontrol_et(uid, adet)\nfor uid, adet in kalemler:\n    stok_dus(uid, adet)',
      why: 'Kontrol ve değişiklik aynı döngüdeyse ikinci kalemde çıkan hata ilk kalemin stoğunu düşmüş bırakır.' },
    { bad: 'fiyat: float = 19.99\ntoplam = fiyat * 3',
      good: 'fiyat_kurus: int = 1999\ntoplam_kurus = fiyat_kurus * 3',
      why: 'float para birimini tam temsil edemez; kuruş cinsinden tamsayı ya da Decimal kullan.' },
    { bad: 'if siparis.kullanici != kullanici:\n    raise HTTPException(403, "Bu sipariş başkasına ait")',
      good: 'if siparis is None or siparis.kullanici != kullanici:\n    raise BulunamadiHatasi(sid)',
      why: '403 siparişin var olduğunu sızdırır; saldırgan numaraları tarayarak bilgi toplar. Başkasının kaynağı için 404 dön.' },
    { bad: 'except Exception as e:\n    return 500, {"hata": str(e)}',
      good: 'except Exception:\n    log.exception("beklenmeyen hata")\n    return 500, {"hata": "sunucu_hatasi"}',
      why: 'İstisna metni SQL sorgusu, dosya yolu gibi iç ayrıntılar içerebilir; istemciye genel mesaj, loga ayrıntı.' }
  ]
});
})(window);
