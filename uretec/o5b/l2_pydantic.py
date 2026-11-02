from build import py, pc

BODY = '''<h2>Neden önemli?</h2>
<p>Anadolu Market\'in web formundan, mobil uygulamasından ve tedarikçilerin gönderdiği CSV dosyalarından her gün binlerce kayıt gelir. Bunların bir kısmında fiyat <code>"12,50"</code> diye virgüllü, adet <code>"üç"</code> diye yazıyla, e-posta <code>"ayse@"</code> diye yarım gelir. Bu veriyi doğrulamadan veritabanına yazarsan hata günler sonra raporda "toplam ciro: NaN" olarak ortaya çıkar ve kaynağını bulmak saatler sürer. Kural basit: <b>dışarıdan gelen her veri, sisteme girdiği kapıda doğrulanır</b>.</p>
<p><i>dataclass ve tip ipuçları</i> dersinde gördüğün gibi Python tip ipuçlarını çalışma zamanında denetlemez: <code>adet: int</code> yazan bir dataclass\'a <code>"üç"</code> verirsen sessizce kabul eder. <b>pydantic</b> tam bu boşluğu doldurur: tip ipuçlarını okuyup veriyi <b>doğrular</b> (validation), gerekirse <b>dönüştürür</b> (coercion/parsing) ve sorunları okunur bir hata listesiyle bildirir. FastAPI, LangChain, Prefect gibi popüler araçların veri katmanı pydantic\'tir; Python iş ilanlarında en çok aranan paketlerden biridir. Bu derste pydantic <b>v2</b> kullanıyoruz (kurulum: <code>pip install pydantic</code>; tarayıcıdaki motor da hazır yükler).</p>

<h2>İlk model: BaseModel</h2>
<p>Bir modeli sınıf olarak tanımlarsın; alanlar tip ipuçlarıyla yazılır. Nesne oluşturulurken tüm alanlar denetlenir.</p>
''' + py('''
from pydantic import BaseModel

class Urun(BaseModel):
    ad: str
    fiyat: float
    stok: int = 0          # varsayılanı olan alan zorunlu değildir

u = Urun(ad="Türk kahvesi", fiyat="89.90", stok="12")
print(u)
print(u.fiyat + 10, type(u.stok).__name__)
print(Urun(ad="Çay", fiyat=45))
''') + '''
<p><code>"89.90"</code> metni <code>float</code>\'a, <code>"12"</code> metni <code>int</code>\'e çevrildi. Buna <b>tip zorlama</b> (type coercion) denir ve pydantic\'in varsayılan "esnek" (lax) modudur: form ve CSV\'den gelen her şey metin olduğu için çok işe yarar. Ama dönüşüm anlamlı olmalıdır: <code>"on iki"</code> ya da <code>12.5</code> (kesirli) bir <code>int</code> alana girmez.</p>
<div class="tbl-wrap"><table>
<tr><th>Alan tipi</th><th>Kabul edilen girdi</th><th>Reddedilen girdi</th></tr>
<tr><td><code>int</code></td><td><code>5</code>, <code>"5"</code>, <code>5.0</code></td><td><code>"5,0"</code>, <code>5.5</code>, <code>"beş"</code></td></tr>
<tr><td><code>float</code></td><td><code>12.5</code>, <code>"12.5"</code>, <code>12</code></td><td><code>"12,5"</code> (virgül), <code>"abc"</code></td></tr>
<tr><td><code>bool</code></td><td><code>True</code>, <code>"true"</code>, <code>"yes"</code>, <code>1</code>, <code>"0"</code></td><td><code>"evet"</code>, <code>2</code></td></tr>
<tr><td><code>date</code></td><td><code>"2026-10-26"</code>, <code>date(...)</code></td><td><code>"26.10.2026"</code></td></tr>
<tr><td><code>str</code></td><td><code>"metin"</code></td><td><code>123</code> (v2 sayıyı metne çevirmez)</td></tr>
</table></div>
<div class="tip"><b>Katı mod</b>Dönüşüm istemediğin yerde <code>model_config = ConfigDict(strict=True)</code> ya da tek alan için <code>Field(strict=True)</code> kullan. Örneğin para transferi API\'sinde <code>"100"</code> metnini sayı saymak istemeyebilirsin.</div>

<h2>ValidationError\'ı okumak</h2>
<p>Doğrulama başarısız olursa pydantic <b>ilk hatada durmaz</b>; tüm alanları dener ve hepsini tek bir <code>ValidationError</code> içinde toplar. <code>e.errors()</code> her hata için bir sözlük verir: <code>loc</code> (hatanın yeri, demet), <code>type</code> (makine için kısa kod), <code>msg</code> (insan için açıklama), <code>input</code> (gelen değer).</p>
''' + py('''
from pydantic import BaseModel, Field, ValidationError

class Urun(BaseModel):
    ad: str = Field(min_length=2)
    fiyat: float = Field(gt=0)
    stok: int = 0

try:
    Urun(ad="X", fiyat=-5, stok="çok")
except ValidationError as e:
    print("hata sayısı:", e.error_count())
    for hata in e.errors():
        alan = ".".join(str(p) for p in hata["loc"])
        print(f"{alan:6} | {hata['type']:18} | girdi={hata['input']!r}")
''') + '''
<p>Programın içinde karar verirken <code>type</code> alanını kullan (sürümler arasında sabittir); kullanıcıya gösterirken <code>msg</code>\'yi kendi Türkçe metninle eşleştir. Sık görülen tipler: <code>missing</code> (alan yok), <code>int_parsing</code>, <code>float_parsing</code>, <code>greater_than</code>, <code>less_than_equal</code>, <code>string_too_short</code>, <code>string_too_long</code>, <code>string_pattern_mismatch</code>, <code>extra_forbidden</code>, <code>value_error</code> (senin validator\'ının fırlattığı hata).</p>

<h2>Field: kısıtlar, varsayılanlar, takma adlar</h2>
<p><code>Field</code> bir alana tipten fazlasını söyler. En sık kullanılanlar:</p>
<div class="tbl-wrap"><table>
<tr><th>Parametre</th><th>Anlamı</th><th>Örnek</th></tr>
<tr><td><code>gt, ge, lt, le</code></td><td>Sayı sınırları (büyük, büyük-eşit...)</td><td><code>Field(gt=0, le=100_000)</code></td></tr>
<tr><td><code>min_length, max_length</code></td><td>Metin ya da liste uzunluğu</td><td><code>Field(max_length=50)</code></td></tr>
<tr><td><code>pattern</code></td><td>Düzenli ifade (regex)</td><td><code>Field(pattern=r"^AM-\\d{4}$")</code></td></tr>
<tr><td><code>default, default_factory</code></td><td>Varsayılan değer / üretici</td><td><code>Field(default_factory=list)</code></td></tr>
<tr><td><code>alias</code></td><td>Dış dünyadaki ad farklıysa</td><td><code>Field(alias="musteriNo")</code></td></tr>
<tr><td><code>description</code></td><td>Belge ve JSON şeması için açıklama</td><td><code>Field(description="TL")</code></td></tr>
</table></div>
''' + py('''
from pydantic import BaseModel, Field, ConfigDict

class Musteri(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")
    musteri_no: int = Field(alias="musteriNo", gt=0)
    ad: str = Field(min_length=2, max_length=50)
    email: str = Field(pattern=r"^[\\w.+-]+@[\\w-]+\\.[\\w.]+$")
    etiketler: list[str] = Field(default_factory=list)

m = Musteri.model_validate({"musteriNo": "1042", "ad": "  Ayşe Kaya ", "email": "ayse@ornek.com"})
print(m)
print(m.model_dump(by_alias=True))
''') + '''
<p><code>ConfigDict</code> model genelinde ayar yapar: <code>str_strip_whitespace=True</code> metinlerin baş/son boşluğunu kırpar, <code>extra="forbid"</code> modelde olmayan bir alan gelirse hata verir (yazım hatalı alan adlarını yakalar; varsayılan <code>"ignore"</code> sessizce atar).</p>

<h2>Optional ve varsayılanlar: ince fark</h2>
<p>v2\'de "None olabilir" ile "verilmeyebilir" iki ayrı şeydir:</p>
<div class="tbl-wrap"><table>
<tr><th>Yazım</th><th>Alan verilmezse</th><th>None verilirse</th></tr>
<tr><td><code>kupon: str</code></td><td>Hata (missing)</td><td>Hata</td></tr>
<tr><td><code>kupon: str | None</code></td><td>Hata (missing): zorunlu ama None olabilir</td><td>Kabul</td></tr>
<tr><td><code>kupon: str | None = None</code></td><td>None olur</td><td>Kabul</td></tr>
<tr><td><code>kupon: str = "YOK"</code></td><td>"YOK" olur</td><td>Hata</td></tr>
</table></div>
<div class="warn"><b>Varsayılan değer doğrulanmaz</b><code>fiyat: float = Field(0, gt=0)</code> yazarsan fiyat verilmediğinde 0 olur ve <code>gt=0</code> kuralı <b>uygulanmaz</b>; pydantic varsayılanları güvenilir kabul eder. Zorunlu bir alana "yanlışlıkla" varsayılan vermek, eksik veriyi sessizce sisteme sokmanın en yaygın yoludur.</div>

<h2>Enum, Literal ve iç içe modeller</h2>
<p>Bir alan sabit bir küme içinden değer alıyorsa <code>Enum</code> ya da <code>Literal</code> kullan. Gerçek veri neredeyse hiç düz değildir: siparişin içinde kalemler, kalemin içinde ürün vardır. Bir modeli başka modelin alan tipi olarak kullanırsın; hatanın <code>loc</code>\'u tam yolu gösterir. Dikkat: <code>Literal</code> tip zorlama yapmaz; <code>Literal[12, 24]</code> alanına <code>"12"</code> metni girmez, Enum ise değeri eşleşen metni üyeye çevirir.</p>
''' + py('''
from enum import Enum
from typing import Literal
from pydantic import BaseModel, Field, ValidationError

class Durum(str, Enum):
    HAZIRLANIYOR = "hazirlaniyor"
    KARGODA = "kargoda"
    TESLIM = "teslim"

class Kalem(BaseModel):
    urun: str
    adet: int = Field(gt=0)
    birim_fiyat: float = Field(gt=0)

class Siparis(BaseModel):
    no: str
    durum: Durum = Durum.HAZIRLANIYOR
    kargo: Literal["standart", "hizli"] = "standart"
    kalemler: list[Kalem] = Field(min_length=1)

s = Siparis(no="AM-1001", durum="kargoda",
            kalemler=[{"urun": "Çay", "adet": 2, "birim_fiyat": 45}])
print(s.durum, s.durum is Durum.KARGODA, s.kalemler[0].adet)
try:
    Siparis(no="AM-1002", kargo="uçak",
            kalemler=[{"urun": "Çay", "adet": 1, "birim_fiyat": 45},
                      {"urun": "Kahve", "adet": 0, "birim_fiyat": 90}])
except ValidationError as e:
    for h in e.errors():
        print(h["loc"], h["type"])
''') + '''

<h2>Validator\'lar: kendi kuralların</h2>
<p>Tip ve <code>Field</code> kısıtları yetmediğinde kendi kuralını yazarsın. İki tür vardır:</p>
<ul>
<li><b><code>@field_validator("alan")</code></b>: tek bir alanı denetler ya da dönüştürür. <code>mode="after"</code> (varsayılan) tip dönüşümünden sonra çalışır, değer artık doğru tiptedir. <code>mode="before"</code> ham girdiyi alır; "12,50" gibi metni sayıya çevirmeden önce düzeltmek için idealdir.</li>
<li><b><code>@model_validator(mode="after")</code></b>: tüm alanlar doğrulandıktan sonra çalışır, alanlar arası kuralları (başlangıç &lt; bitiş, taksit &lt;= gelir) denetler; <code>self</code> döndürmelidir.</li>
</ul>
''' + py('''
from datetime import date
from pydantic import BaseModel, field_validator, model_validator, ValidationError

class KampanyaFiyati(BaseModel):
    urun: str
    fiyat: float
    baslangic: date
    bitis: date

    @field_validator("fiyat", mode="before")
    @classmethod
    def virgulu_noktaya_cevir(cls, v):
        if isinstance(v, str):
            v = v.replace(".", "").replace(",", ".")   # "1.249,90" -> "1249.90"
        return v

    @field_validator("urun")
    @classmethod
    def urun_bos_olamaz(cls, v):
        if not v.strip():
            raise ValueError("ürün adı boş olamaz")
        return v.strip()          # DÖNDÜRMEYİ UNUTMA

    @model_validator(mode="after")
    def tarih_sirasi(self):
        if self.bitis < self.baslangic:
            raise ValueError("bitiş başlangıçtan önce olamaz")
        return self

k = KampanyaFiyati(urun=" Filtre kahve ", fiyat="1.249,90", baslangic="2026-11-01", bitis="2026-11-30")
print(k.urun, k.fiyat)
try:
    KampanyaFiyati(urun="Çay", fiyat="45", baslangic="2026-11-30", bitis="2026-11-01")
except ValidationError as e:
    print(e.errors()[0]["type"], "|", e.errors()[0]["msg"])
''') + '''
<p>Validator içinde <code>ValueError</code> fırlatırsan pydantic onu <code>value_error</code> tipinde bir hataya çevirir ve mesajın başına "Value error, " ekler. Validator\'ın döndürdüğü değer alanın yeni değeridir; <code>return</code> unutulursa alan <code>None</code> olur.</p>

<h2>Serileştirme: model_dump, model_dump_json, model_validate</h2>
<p>Doğrulanmış modeli dış dünyaya geri vermek de önemlidir: JSON API cevabı, veritabanı satırı, log kaydı.</p>
<div class="tbl-wrap"><table>
<tr><th>Metot</th><th>Ne yapar</th></tr>
<tr><td><code>Model.model_validate(sozluk)</code></td><td>Sözlükten model (v1: <code>parse_obj</code>)</td></tr>
<tr><td><code>Model.model_validate_json(metin)</code></td><td>JSON metninden doğrudan model; tek adımda ayrıştırır ve doğrular</td></tr>
<tr><td><code>m.model_dump()</code></td><td>Python sözlüğü (v1: <code>dict()</code>); Enum ve date nesne kalır</td></tr>
<tr><td><code>m.model_dump(mode="json")</code></td><td>JSON uyumlu sözlük: Enum değere, date metne döner</td></tr>
<tr><td><code>m.model_dump_json()</code></td><td>JSON metni (v1: <code>json()</code>)</td></tr>
<tr><td><code>include / exclude / exclude_none / by_alias</code></td><td>Çıktıya hangi alanların gireceğini seçer</td></tr>
<tr><td><code>m.model_copy(update={...})</code></td><td>Kopya; <b>update doğrulanmaz</b></td></tr>
</table></div>
''' + py('''
from datetime import date
from pydantic import BaseModel

class Hesap(BaseModel):
    iban: str
    sahip: str
    bakiye: float
    acilis: date
    not_: str | None = None

h = Hesap.model_validate_json('{"iban": "TR120006200000000123456789", "sahip": "Ali Er", "bakiye": "1500.5", "acilis": "2024-03-01"}')
print(h.acilis.year, h.bakiye)
print(h.model_dump(exclude={"iban"}))
print(h.model_dump(mode="json", exclude_none=True))
print(h.model_dump_json(include={"sahip", "bakiye"}))
''') + '''

<h2>Ayarlar: pydantic-settings</h2>
<p>Uygulama ayarlarını (SMTP sunucusu, port, dry-run bayrağı) koda gömmek yerine ortam değişkenlerinden ve <code>.env</code> dosyasından okumak standarttır. <code>pydantic-settings</code> bunu model gibi yapar: tipler zorlanır, eksik zorunlu ayar program başlarken hata verir. Bu paket tarayıcı motorunda yok; kendi bilgisayarında <code>pip install pydantic-settings</code> ile kur.</p>
''' + pc('''
from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict

class Ayarlar(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="AM_", env_file=".env")
    smtp_host: str = "localhost"
    smtp_port: int = 587
    smtp_sifre: SecretStr               # zorunlu; print edilince ********** görünür
    dry_run: bool = True
    alicilar: list[str] = Field(default_factory=list)   # ortamda JSON: '["a@x.com"]'

ayar = Ayarlar()          # AM_SMTP_PORT=465, AM_DRY_RUN=false ... okunur
print(ayar.smtp_port, ayar.dry_run, ayar.smtp_sifre)
''') + '''
<p><code>SecretStr</code> değeri loglara ve ekrana yanlışlıkla basılmasını engeller; gerçek değere <code>.get_secret_value()</code> ile bilerek erişirsin.</p>

<h2>dataclass mı, pydantic mi?</h2>
<div class="tbl-wrap"><table>
<tr><th>Ölçüt</th><th>dataclass</th><th>pydantic BaseModel</th></tr>
<tr><td>Çalışma zamanında tip denetimi</td><td>Yok</td><td>Var, dönüştürerek</td></tr>
<tr><td>Hız</td><td>Çok hızlı (sıradan sınıf)</td><td>Hızlı (çekirdek Rust ile yazılmış) ama ek maliyetli</td></tr>
<tr><td>Bağımlılık</td><td>Standart kütüphane</td><td>Ek paket</td></tr>
<tr><td>JSON\'a/JSON\'dan</td><td>Elle (<code>asdict</code> + json)</td><td>Hazır, iç içe modellerle</td></tr>
<tr><td>Ne zaman?</td><td>Programın içinde dolaşan, zaten güvenilir veri</td><td>Sistemin sınırı: API, form, dosya, ayar</td></tr>
</table></div>
<p>Ara yol: <code>from pydantic.dataclasses import dataclass</code> dataclass sözdizimiyle doğrulama yapar; <code>TypeAdapter(list[int]).validate_python(veri)</code> ise model tanımlamadan herhangi bir tipi doğrular.</p>

<div class="note"><b>Gerçek işte</b>Bir bankanın kredi başvuru servisinde başvuru formu önce pydantic modeline girer; model_validator taksit/gelir oranını, field_validator TC kimlik numarası algoritmasını denetler. Hata listesi olduğu gibi 422 cevabına dönüştürülür ve ön yüz her hatayı ilgili form kutusunun altında gösterir (<code>loc</code> bu yüzden önemlidir). Aynı model, gece çalışan toplu içe aktarma betiğinde de kullanılır: tek bir kural, tek bir yerde.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>v1\'den v2\'ye geçiş</h3>
<p>İnternetteki örneklerin çoğu hâlâ v1 sözdizimi kullanır. Eşleştirme: <code>@validator</code> → <code>@field_validator</code>, <code>@root_validator</code> → <code>@model_validator</code>, <code>.dict()</code> → <code>.model_dump()</code>, <code>.json()</code> → <code>.model_dump_json()</code>, <code>parse_obj</code> → <code>model_validate</code>, <code>parse_raw</code> → <code>model_validate_json</code>, <code>class Config:</code> → <code>model_config = ConfigDict(...)</code>, <code>regex=</code> → <code>pattern=</code>. Eski adlar çoğunlukla uyarıyla çalışır ama yeni kodda kullanma.</p>
<h3>Hesaplanan alanlar ve değişmezlik</h3>
<p><code>@computed_field</code> ile işaretlenen bir <code>@property</code> (ör. sipariş toplamı) <code>model_dump</code> çıktısına da girer. <code>ConfigDict(frozen=True)</code> modeli değiştirilemez ve hash\'lenebilir yapar. <code>validate_assignment=True</code> ise nesne oluştuktan sonraki atamaları da doğrular.</p>
<h3>JSON şeması ve sözleşme</h3>
<p><code>Model.model_json_schema()</code> modelden JSON Schema üretir. FastAPI\'nin otomatik API belgesi buradan gelir; ön yüz ekibiyle "veri sözleşmesi" paylaşmanın en temiz yoludur.</p>
<h3>Performans</h3>
<p>pydantic v2\'nin çekirdeği (pydantic-core) Rust ile yazılmıştır; v1\'e göre kat kat hızlıdır. Yine de milyonlarca satırda satır satır model oluşturmak yavaştır: toplu veride önce pandas/polars ile vektörel denetim, yalnızca şüpheli satırlarda model kullanmak ya da <code>TypeAdapter(list[Model])</code> ile tek çağrıda doğrulamak tercih edilir.</p>
</section>
'''

LESSON = {
    'id': 'pydantic-dogrulama', 'lv': 'orta', 'mod': 'Otomasyon ve Araçlar', 'min': 45,
    'title': 'Veri doğrulama ve pydantic v2',
    'sum': 'Dışarıdan gelen veriyi pydantic BaseModel ile doğrular ve dönüştürür; Field kısıtları, field/model validator\'lar, iç içe modeller, Enum ve Optional ile kurallarını yazar, ValidationError\'ı okur, model_dump ve model_validate ile JSON\'a gidip gelirsin.',
    'goals': [
        'BaseModel ile alanları tip ipuçlarıyla tanımlayıp tip zorlamanın neyi kabul edip neyi reddettiğini açıklayabilirim.',
        'Field kısıtlarıyla (gt, max_length, pattern, alias) ve Optional/varsayılan ayrımıyla doğru model yazabilirim.',
        'field_validator ve model_validator ile alan ve alanlar arası iş kurallarını uygulayabilirim.',
        'ValidationError\'daki loc, type ve msg bilgisini okuyup kullanıcıya anlaşılır hata raporu üretebilirim.',
        'model_dump, model_dump_json ve model_validate ile iç içe modelleri JSON\'a çevirip geri yükleyebilirim.'
    ],
    'body': BODY,
    'faq': [
        {'q': 'pydantic varken dataclass\'a hâlâ gerek var mı?', 'a': 'Evet. Program içinde dolaşan, zaten doğrulanmış veri için dataclass daha hafif ve bağımlılıksızdır. pydantic\'i sistemin sınırında (API isteği, form, dosya, ayar) kullan; içeride dataclass ya da doğrulanmış model nesnesiyle devam et.'},
        {'q': 'ValidationError, ValueError\'ın alt sınıfı mı?', 'a': 'pydantic v2\'de evet: except ValueError da onu yakalar. Ama hata listesine (errors(), error_count()) erişmek için doğrudan except ValidationError yazmak daha açık ve doğrudur.'},
        {'q': 'Virgüllü ondalık ("12,50") ya da "26.10.2026" gibi Türkçe biçimleri nasıl kabul ederim?', 'a': 'field_validator(..., mode="before") ile ham metni pydantic\'in anlayacağı biçime çevir: virgülü noktaya, gün.ay.yılı datetime.strptime ile date nesnesine. Böylece kuralın tek bir yerde durur ve model her kaynaktan gelen veriyi kabul eder.'},
        {'q': 'model_copy(update=...) neden hatalı değeri kabul etti?', 'a': 'model_copy hız için doğrulama yapmaz. Değiştirilmiş veriyi doğrulamak istiyorsan Model.model_validate({**m.model_dump(), "alan": yeni}) kullan ya da modelde validate_assignment=True açıp atama yap.'},
        {'q': 'Tarayıcıda pydantic_settings neden yok?', 'a': 'Tarayıcı motorunda yalnızca pydantic çekirdeği hazır. Ayar okuma mantığını alıştırmada bir sözlükle taklit ediyoruz; kendi bilgisayarında pip install pydantic-settings ile gerçek sınıfı kullanabilirsin.'}
    ],
    'mistakes': [
        {'bad': '@field_validator("kod")\n@classmethod\ndef kontrol(cls, v):\n    if not v.startswith("AM-"):\n        raise ValueError("geçersiz")', 'good': '@field_validator("kod")\n@classmethod\ndef kontrol(cls, v):\n    if not v.startswith("AM-"):\n        raise ValueError("geçersiz")\n    return v', 'why': 'Validator\'ın döndürdüğü değer alanın yeni değeridir. return unutulursa alan sessizce None olur.'},
        {'bad': 'fiyat: float = Field(0, gt=0)', 'good': 'fiyat: float = Field(gt=0)', 'why': 'Varsayılan değer doğrulanmaz; alan zorunluluktan çıkar ve eksik fiyat 0 olarak sisteme girer.'},
        {'bad': 'kupon: str | None   # "opsiyonel" sanılıyor', 'good': 'kupon: str | None = None', 'why': 'v2\'de None kabul etmek ile verilmeyebilmek ayrı şeylerdir; varsayılan yoksa alan zorunludur.'},
        {'bad': 'm = Musteri.parse_obj(veri)\nprint(m.dict())', 'good': 'm = Musteri.model_validate(veri)\nprint(m.model_dump())', 'why': 'parse_obj ve dict() v1 adlarıdır; v2\'de kullanımdan kalktı ve uyarı verir.'},
        {'bad': 'except ValidationError as e:\n    print(str(e))  # kullanıcıya ham İngilizce metin', 'good': 'except ValidationError as e:\n    for h in e.errors():\n        print(".".join(map(str, h["loc"])), h["type"])', 'why': 'str(e) sürüme göre değişen, İngilizce ve ayrıştırması zor bir metindir. Yapılandırılmış errors() listesini kullan.'}
    ],
}

URUN_MODEL = 'from pydantic import BaseModel, Field, ValidationError\n\nclass Urun(BaseModel):\n    ad: str = Field(min_length=2)\n    fiyat: float = Field(gt=0)\n    stok: int = Field(default=0, ge=0)\n'
KALEM = 'class Kalem(BaseModel):\n    urun: str\n    adet: int = Field(gt=0)\n    birim_fiyat: float = Field(gt=0)\n'

EX = [
    {'t': 'mc', 'stage': 'Isınma', 'q': '<code>class Sepet(BaseModel): adet: int</code> modeli için <code>Sepet(adet="5")</code> çağrısının sonucu nedir?',
     'o': ['adet, "5" metni olarak kalır', 'adet, 5 tam sayısına çevrilir', 'ValidationError fırlatılır: metin int değildir', 'TypeError fırlatılır'],
     'a': 1, 'why': 'pydantic\'in varsayılan esnek (lax) modu anlamlı dönüşümleri yapar: "5" → 5. "beş" ya da 5.5 ise reddedilir. Dönüşüm istemiyorsan strict=True kullanırsın.'},
    {'t': 'mc', 'stage': 'Isınma', 'q': 'v1 ile yazılmış <code>Musteri.parse_obj(d)</code> ve <code>m.dict()</code> çağrılarının pydantic v2 karşılığı nedir?',
     'o': ['Musteri.model_validate(d) ve m.model_dump()', 'Musteri.from_dict(d) ve m.to_dict()', 'Musteri.validate(d) ve m.json()', 'Musteri(**d).parse() ve dict(m)'],
     'a': 0, 'why': 'v2\'de tüm model metotları model_ önekini aldı: parse_obj → model_validate, dict() → model_dump, json() → model_dump_json, parse_raw → model_validate_json.'},
    {'t': 'mc', 'stage': 'Isınma', 'q': 'pydantic v2\'de varsayılanı olmayan <code>iban: str | None</code> alanı için hangisi doğrudur?',
     'o': ['Alan opsiyoneldir; verilmezse None olur', 'Alan zorunludur ama değeri None olabilir', 'Alan yalnızca None değerini kabul eder', 'Bu yazım v2\'de sözdizimi hatasıdır'],
     'a': 1, 'why': 'Tip ipucundaki None yalnızca "None değeri kabul edilir" demektir. Alanın verilmeyebilmesi için varsayılan gerekir: iban: str | None = None.'},
    {'t': 'predict', 'stage': 'Kodu oku', 'q': 'Bu kod ne yazdırır?',
     'code': 'from pydantic import BaseModel\n\nclass Urun(BaseModel):\n    ad: str\n    fiyat: float\n    stok: int = 0\n\nu = Urun(ad="Çay", fiyat="12.5")\nprint(u.fiyat, type(u.fiyat).__name__)\nprint(u)\n',
     'o': ['12.5 str\nad=\'Çay\' fiyat=\'12.5\' stok=0', '12.5 float\nad=\'Çay\' fiyat=12.5 stok=0', '12.5 float\nUrun(ad=\'Çay\', fiyat=12.5)', 'ValidationError: fiyat metin olamaz'],
     'a': 1, 'why': '"12.5" float\'a çevrilir. Verilmeyen stok varsayılan 0 olur. print(model) alan=değer çiftlerini sınıf adı olmadan yazar (repr ise Urun(...) biçimindedir).'},
    {'t': 'predict', 'stage': 'Kodu oku', 'q': 'Üç alanı da hatalı veride pydantic ne raporlar?',
     'code': URUN_MODEL.replace('Field(default=0, ge=0)', '0') + '\ntry:\n    Urun(ad="X", fiyat=-5, stok="çok")\nexcept ValidationError as e:\n    print(e.error_count())\n    for h in e.errors():\n        print(h["loc"][0], h["type"])\n',
     'o': ['1\nad string_too_short', '3\nad string_too_short\nfiyat greater_than\nstok int_parsing', '2\nad string_too_short\nfiyat greater_than', '3\nad value_error\nfiyat value_error\nstok value_error'],
     'a': 1, 'why': 'pydantic ilk hatada durmaz, tüm alanları dener ve her hatayı kendi tipiyle listeler. value_error yalnızca senin validator\'ın ValueError fırlattığında görülür.'},
    {'t': 'predict', 'stage': 'Kodu oku', 'q': 'Enum alanı farklı serileştirme modlarında nasıl görünür?',
     'code': 'from enum import Enum\nfrom pydantic import BaseModel\n\nclass Durum(str, Enum):\n    HAZIR = "hazirlaniyor"\n    KARGO = "kargoda"\n\nclass Kargo(BaseModel):\n    no: str\n    durum: Durum\n    teslim: str | None = None\n\nk = Kargo(no="AM-1", durum="kargoda")\nprint(k.durum is Durum.KARGO)\nprint(k.model_dump(mode="json"))\nprint(k.model_dump_json(exclude_none=True))\n',
     'o': ['False\n{\'no\': \'AM-1\', \'durum\': \'kargoda\', \'teslim\': None}\n{"no":"AM-1","durum":"kargoda"}', 'True\n{\'no\': \'AM-1\', \'durum\': \'kargoda\', \'teslim\': None}\n{"no":"AM-1","durum":"kargoda"}', 'True\n{\'no\': \'AM-1\', \'durum\': \'kargoda\'}\n{"no":"AM-1","durum":"kargoda","teslim":null}', 'True\n{\'no\': \'AM-1\', \'durum\': <Durum.KARGO: \'kargoda\'>, \'teslim\': None}\n{"no":"AM-1","durum":"KARGO"}'],
     'a': 1, 'why': '"kargoda" metni Durum.KARGO üyesine çevrilir. mode="json" Enum\'u değerine çevirir ama None alanları tutar; exclude_none=True ise None olan teslim alanını çıktıdan atar.'},
    {'t': 'order', 'stage': 'Kodu oku', 'q': '<p>Negatif bakiyeyi yakalayıp hata tipini yazdıran programın satırlarını sırala. Çıktı <code>greater_than_equal</code> olmalı.</p>',
     'lines': ['from pydantic import BaseModel, Field, ValidationError', 'class Hesap(BaseModel):', '    bakiye: float = Field(ge=0)', 'try:', '    Hesap(bakiye=-50)', 'except ValidationError as e:', '    print(e.errors()[0]["type"])'],
     'expect': 'greater_than_equal\n', 'hint': 'Önce içe aktarma, sonra model; doğrulama try içinde, hata okuma except içinde.',
     'why': 'Model tanımlanmadan kullanılamaz; ValidationError yalnızca except bloğunda e adına bağlanır. ge=0 kısıtının hata tipi greater_than_equal\'dır.'},
]

EX += [
    {'t': 'code', 'stage': 'Rehberli', 'diff': 1,
     'q': '<p>Anadolu Market üyelik formu için <code>Musteri</code> modelini yaz:</p><ul><li><code>ad</code>: metin, 2-50 karakter</li><li><code>email</code>: metin, <code>pattern=r"^[\\w.+-]+@[\\w-]+\\.[\\w.]+$"</code></li><li><code>yas</code>: tam sayı, 18 ile 120 arası (ikisi dahil)</li><li><code>sehir</code>: metin, varsayılan <code>"İstanbul"</code></li><li>Tüm metinlerin baş/son boşlukları otomatik kırpılsın (<code>ConfigDict(str_strip_whitespace=True)</code>).</li></ul>',
     'guide': ['model_config = ConfigDict(str_strip_whitespace=True) satırını sınıfın başına koy.', 'ad için Field(min_length=2, max_length=50).', 'email için Field(pattern=...).', 'yas için Field(ge=18, le=120); sehir için düz varsayılan.'],
     'example': 'from pydantic import BaseModel, Field, ConfigDict\n\nclass Personel(BaseModel):\n    model_config = ConfigDict(str_strip_whitespace=True)\n    sicil: str = Field(pattern=r"^P\\d{4}$")\n    maas: float = Field(gt=0, le=1_000_000)\n    departman: str = "Genel"\n\nprint(Personel(sicil=" P0042 ", maas="52000"))\n',
     'start': 'from pydantic import BaseModel, Field, ConfigDict, ValidationError\n\nclass Musteri(BaseModel):\n    # TODO: boşluk kırpma ayarı\n    ad: str          # TODO: 2-50 karakter\n    email: str       # TODO: pattern\n    yas: int         # TODO: 18-120\n    # TODO: sehir alanı, varsayılan "İstanbul"\n',
     'sol': 'from pydantic import BaseModel, Field, ConfigDict, ValidationError\n\nclass Musteri(BaseModel):\n    model_config = ConfigDict(str_strip_whitespace=True)\n    ad: str = Field(min_length=2, max_length=50)\n    email: str = Field(pattern=r"^[\\w.+-]+@[\\w-]+\\.[\\w.]+$")\n    yas: int = Field(ge=18, le=120)\n    sehir: str = "İstanbul"\n',
     'tests': 'm = Musteri(ad="  Ayşe Kaya ", email="ayse@ornek.com", yas="34")\nassert m.ad == "Ayşe Kaya", "Baş/son boşluklar kırpılmalı (str_strip_whitespace)"\nassert m.yas == 34 and m.sehir == "İstanbul", "yas int\'e çevrilmeli, sehir varsayılanı İstanbul"\ndef tipler(**veri):\n    try:\n        Musteri(**veri)\n        return []\n    except ValidationError as e:\n        return sorted((h["loc"][0], h["type"]) for h in e.errors())\nassert tipler(ad="A", email="a@b.com", yas=20) == [("ad", "string_too_short")], "Tek harfli ad reddedilmeli"\nassert tipler(ad="Ali", email="ali@", yas=20) == [("email", "string_pattern_mismatch")], "Yarım e-posta reddedilmeli"\nassert tipler(ad="Ali", email="ali@x.com", yas=17) == [("yas", "greater_than_equal")], "18 yaş altı reddedilmeli"\nassert tipler(ad="Ali", email="ali@x.com", yas=121) == [("yas", "less_than_equal")]\nassert tipler(ad="Ali", email="ali@x.com", yas=18) == [], "18 sınır değeri kabul edilmeli (ge)"\nassert tipler(ad="A" * 51, email="a@b.co", yas=30) == [("ad", "string_too_long")]\n',
     'hints': ['Kısıtlar Field(...) içinde anahtar kelime argümanı olarak verilir.', 'Sınırlar dahilse ge/le, hariçse gt/lt.', 'model_config = ConfigDict(str_strip_whitespace=True) sınıf gövdesinde bir atamadır.'],
     'why': 'Kuralları modelin içinde bildirimsel yazmak, aynı kuralın form, API ve toplu içe aktarmada tek kaynaktan uygulanmasını sağlar. Sınır değer testleri (18 ve 121) ge/le ile gt/lt farkını yakalar.'},
    {'t': 'code', 'stage': 'Rehberli', 'diff': 2,
     'q': '<p><code>Iletisim</code> modelinde <code>telefon</code> alanı için bir <code>field_validator</code> yaz. Farklı biçimlerde gelen cep telefonlarını <code>+905XXXXXXXXX</code> biçimine çevirsin:</p><ul><li>Boşluk, tire ve parantezleri sil.</li><li>Başta <code>+90</code> ya da <code>0</code> varsa at.</li><li>Kalan 10 haneli değil, tamamı rakam değil ya da <code>5</code> ile başlamıyorsa <code>ValueError("geçersiz cep telefonu")</code> fırlat.</li><li>Sonucu <code>"+90" + rakamlar</code> olarak döndür.</li></ul>',
     'guide': ['@field_validator("telefon") ve altına @classmethod yaz.', 'Gereksiz karakterleri bir döngüyle ya da re.sub(r"[\\s\\-()]", "", v) ile temizle.', 'removeprefix ile "+90" ve "0" önekini at.', 'Uzunluk, isdigit ve "5" ile başlama koşulunu denetle; uymazsa ValueError.', 'Normalleştirilmiş değeri döndür.'],
     'example': 'from pydantic import BaseModel, field_validator\n\nclass Adres(BaseModel):\n    posta_kodu: str\n\n    @field_validator("posta_kodu")\n    @classmethod\n    def posta_kodu_denetle(cls, v):\n        v = v.replace(" ", "")\n        if len(v) != 5 or not v.isdigit():\n            raise ValueError("posta kodu 5 rakam olmalı")\n        return v\n\nprint(Adres(posta_kodu="34 710"))\n',
     'start': 'import re\nfrom pydantic import BaseModel, field_validator, ValidationError\n\nclass Iletisim(BaseModel):\n    ad: str\n    telefon: str\n\n    # TODO: telefon için field_validator yaz\n    # 1) boşluk, tire, parantez sil  2) +90 / 0 önekini at\n    # 3) 10 rakam ve 5 ile başlama denetimi  4) "+90" + rakamlar döndür\n',
     'sol': 'import re\nfrom pydantic import BaseModel, field_validator, ValidationError\n\nclass Iletisim(BaseModel):\n    ad: str\n    telefon: str\n\n    @field_validator("telefon")\n    @classmethod\n    def telefonu_normallestir(cls, v):\n        rakamlar = re.sub(r"[\\s\\-()]", "", v)\n        if rakamlar.startswith("+90"):\n            rakamlar = rakamlar[3:]\n        elif rakamlar.startswith("0"):\n            rakamlar = rakamlar[1:]\n        if len(rakamlar) != 10 or not rakamlar.isdigit() or not rakamlar.startswith("5"):\n            raise ValueError("geçersiz cep telefonu")\n        return "+90" + rakamlar\n',
     'tests': 'assert Iletisim(ad="Ali", telefon=" 0532 123 45 67").telefon == "+905321234567", "Baştaki 0 atılıp +90 eklenmeli"\nassert Iletisim(ad="Ali", telefon="+90 (532) 123-45-67").telefon == "+905321234567", "Parantez ve tireler silinmeli, +90 tekrarlanmamalı"\nassert Iletisim(ad="Ali", telefon="5321234567").telefon == "+905321234567"\nfor kotu in ["0212 123 45 67", "0532 123 45", "0532-ABC-4567"]:\n    try:\n        Iletisim(ad="Ali", telefon=kotu)\n        assert False, f"{kotu!r} reddedilmeliydi"\n    except ValidationError as e:\n        h = e.errors()[0]\n        assert h["type"] == "value_error" and h["loc"] == ("telefon",), "ValueError fırlatınca pydantic value_error üretir"\n        assert "geçersiz cep telefonu" in h["msg"], "Hata mesajı korunmalı"\n',
     'hints': ['field_validator varsayılan olarak mode="after" çalışır; v burada zaten str\'dir.', 're.sub(r"[\\s\\-()]", "", v) temizler; v.startswith("+90") kontrolünü "0"dan önce yap.', 'Son satır: return "+90" + rakamlar. return unutulursa telefon None olur.'],
     'why': 'Normalleştirme (normalization) kuralını modele koymak, veritabanında aynı numaranın beş farklı yazımla durmasını engeller. Doğrulayıcının döndürdüğü değer alanın yeni değeri olur.'},
    {'t': 'code', 'stage': 'Rehberli', 'diff': 2,
     'q': '<p>Tedarikçi listesini doğrulayan <code>toplu_dogrula(kayitlar)</code> fonksiyonunu tamamla. <code>kayitlar</code> sözlüklerden oluşan bir liste. Her kaydı <code>Urun</code> modeliyle doğrula ve <code>(gecerliler, hatalar)</code> döndür:</p><ul><li><code>gecerliler</code>: geçerli <code>Urun</code> nesneleri</li><li><code>hatalar</code>: her hata için bir metin: <code>"satır {no}: {alan} {tip}"</code> (satır no 1\'den başlar; iç içe konumlarda alanlar noktayla birleşir)</li></ul>',
     'guide': ['enumerate(kayitlar, start=1) ile satır numarasını al.', 'try içinde Urun.model_validate(kayit) çağır ve sonucu gecerliler listesine ekle.', 'except ValidationError as e: içinde e.errors() üzerinde dön.', 'Her hata için alan = ".".join(str(p) for p in h["loc"]) ve metni hatalar\'a ekle.'],
     'example': 'from pydantic import BaseModel, ValidationError\n\nclass Nokta(BaseModel):\n    x: int\n    y: int\n\nfor i, veri in enumerate([{"x": 1, "y": 2}, {"x": "a"}], start=1):\n    try:\n        print(i, Nokta.model_validate(veri))\n    except ValidationError as e:\n        print(i, [(h["loc"], h["type"]) for h in e.errors()])\n',
     'start': URUN_MODEL + '\ndef toplu_dogrula(kayitlar):\n    gecerliler, hatalar = [], []\n    # TODO: her kaydı satır numarasıyla gez\n    # TODO: geçerliyse modeli gecerliler\'e ekle\n    # TODO: değilse her hatayı "satır N: alan tip" olarak hatalar\'a ekle\n    return gecerliler, hatalar\n',
     'sol': URUN_MODEL + '\ndef toplu_dogrula(kayitlar):\n    gecerliler, hatalar = [], []\n    for no, kayit in enumerate(kayitlar, start=1):\n        try:\n            gecerliler.append(Urun.model_validate(kayit))\n        except ValidationError as e:\n            for h in e.errors():\n                alan = ".".join(str(p) for p in h["loc"])\n                hatalar.append(f"satır {no}: {alan} {h[\'type\']}")\n    return gecerliler, hatalar\n',
     'tests': 'kayitlar = [\n    {"ad": "Çay", "fiyat": "45", "stok": 10},\n    {"ad": "K", "fiyat": 0},\n    {"ad": "Kahve", "fiyat": 120.5},\n    {"fiyat": 10, "stok": -1},\n]\ng, h = toplu_dogrula(kayitlar)\nassert [u.ad for u in g] == ["Çay", "Kahve"], "Geçerli kayıtlar sırasıyla model nesnesi olarak dönmeli"\nassert isinstance(g[0], Urun) and g[0].fiyat == 45.0, "Geçerli kayıt Urun nesnesi olmalı ve fiyat float\'a çevrilmeli"\nassert h == ["satır 2: ad string_too_short", "satır 2: fiyat greater_than", "satır 4: ad missing", "satır 4: stok greater_than_equal"], f"Hata raporu: {h}"\nassert toplu_dogrula([]) == ([], [])\n',
     'hints': ['Bir kayıttaki tüm hatalar tek ValidationError içinde gelir; hepsini gez.', 'h["loc"] bir demettir: ("ad",) gibi. Noktayla birleştir.', 'f"satır {no}: {alan} {h[\'type\']}"'],
     'why': 'Hatalı satırda tüm süreci durdurmak yerine geçerlileri ayırıp hataları raporlamak toplu veri işlemenin standart kalıbıdır ("karantina"). Tedarikçi bu raporla neyi düzelteceğini satır satır görür.'},
]

EX += [
    {'t': 'code', 'stage': 'Kendin yaz', 'diff': 2,
     'q': '<p>İç içe modeller yaz:</p><ul><li><code>Kalem</code>: <code>urun</code> (str), <code>adet</code> (int, &gt; 0), <code>birim_fiyat</code> (float, &gt; 0)</li><li><code>Siparis</code>: <code>no</code> (str, <code>AM-</code> + 4 rakam: <code>pattern=r"^AM-\\d{4}$"</code>), <code>musteri</code> (str), <code>kalemler</code> (<code>list[Kalem]</code>, en az 1 eleman)</li><li><code>Siparis</code>\'e <code>toplam()</code> metodu ekle: adet × birim fiyat toplamını 2 ondalığa yuvarlayıp döndürsün.</li></ul>',
     'start': 'from pydantic import BaseModel, Field, ValidationError\n\n# Kalem ve Siparis modellerini yaz\n',
     'sol': 'from pydantic import BaseModel, Field, ValidationError\n\n' + KALEM + '\nclass Siparis(BaseModel):\n    no: str = Field(pattern=r"^AM-\\d{4}$")\n    musteri: str\n    kalemler: list[Kalem] = Field(min_length=1)\n\n    def toplam(self):\n        return round(sum(k.adet * k.birim_fiyat for k in self.kalemler), 2)\n',
     'tests': 's = Siparis(no="AM-1001", musteri="Ayşe", kalemler=[{"urun": "Çay", "adet": "2", "birim_fiyat": "45.5"}, {"urun": "Kahve", "adet": 1, "birim_fiyat": 120.25}])\nassert isinstance(s.kalemler[0], Kalem), "Sözlükler otomatik olarak Kalem nesnesine çevrilmeli"\nassert s.toplam() == 211.25, f"toplam: 2*45.5 + 120.25 = 211.25, gelen {s.toplam()}"\ndef hatalar(**v):\n    try:\n        Siparis(**v)\n        return []\n    except ValidationError as e:\n        return [(h["loc"], h["type"]) for h in e.errors()]\nassert hatalar(no="AM-1", musteri="A", kalemler=[{"urun": "Çay", "adet": 1, "birim_fiyat": 1}]) == [(("no",), "string_pattern_mismatch")], "Sipariş no AM- + 4 rakam olmalı"\nassert hatalar(no="AM-1002", musteri="A", kalemler=[]) == [(("kalemler",), "too_short")], "Boş kalem listesi reddedilmeli (min_length=1)"\nassert hatalar(no="AM-1003", musteri="A", kalemler=[{"urun": "Çay", "adet": 1, "birim_fiyat": 1}, {"urun": "Su", "adet": 0, "birim_fiyat": 5}]) == [(("kalemler", 1, "adet"), "greater_than")], "Hata konumu kalemler.1.adet olmalı"\n',
     'hints': ['Önce Kalem\'i tanımla; Siparis onu alan tipi olarak kullanır: list[Kalem].', 'Liste uzunluğu için Field(min_length=1).', 'toplam: round(sum(k.adet * k.birim_fiyat for k in self.kalemler), 2)'],
     'why': 'İç içe modellerde pydantic sözlükleri alt modellere kendisi çevirir ve hatanın tam yolunu (kalemler, 1, adet) verir. Modele iş mantığı (toplam) eklemek, veriyle davranışı bir arada tutar.'},
    {'t': 'code', 'stage': 'Kendin yaz', 'diff': 2,
     'q': '<p>Ilgaz Bank için <code>KrediBasvurusu</code> modelini yaz:</p><ul><li><code>tutar</code>: float, &gt; 0</li><li><code>vade_ay</code>: yalnızca 12, 24, 36 ya da 48 (<code>Literal</code>)</li><li><code>aylik_gelir</code>: float, &gt; 0</li><li>Alanlar arası kural (<code>model_validator(mode="after")</code>): <code>tutar / vade_ay</code> aylık gelirin yarısını aşıyorsa <code>ValueError("taksit gelirin yarısını aşamaz")</code>.</li><li><code>taksit()</code> metodu: <code>tutar / vade_ay</code> değerini 2 ondalıkla döndürsün.</li></ul>',
     'start': 'from typing import Literal\nfrom pydantic import BaseModel, Field, ValidationError, model_validator\n\n# KrediBasvurusu modelini yaz\n',
     'sol': 'from typing import Literal\nfrom pydantic import BaseModel, Field, ValidationError, model_validator\n\nclass KrediBasvurusu(BaseModel):\n    tutar: float = Field(gt=0)\n    vade_ay: Literal[12, 24, 36, 48]\n    aylik_gelir: float = Field(gt=0)\n\n    @model_validator(mode="after")\n    def taksit_denetle(self):\n        if self.tutar / self.vade_ay > self.aylik_gelir * 0.5:\n            raise ValueError("taksit gelirin yarısını aşamaz")\n        return self\n\n    def taksit(self):\n        return round(self.tutar / self.vade_ay, 2)\n',
     'tests': 'k = KrediBasvurusu(tutar=120000, vade_ay=24, aylik_gelir=12000)\nassert k.taksit() == 5000.0, "120000 / 24 = 5000"\nassert KrediBasvurusu(tutar=144000, vade_ay=12, aylik_gelir=24000).vade_ay == 12, "Sınırda (taksit = gelirin yarısı) kabul edilmeli"\ndef tip(**v):\n    try:\n        KrediBasvurusu(**v)\n        return None\n    except ValidationError as e:\n        return [(h["loc"], h["type"]) for h in e.errors()]\nassert tip(tutar=100000, vade_ay=18, aylik_gelir=50000) == [(("vade_ay",), "literal_error")], "18 ay izinli vadelerden biri değil"\nassert tip(tutar=100000, vade_ay="12", aylik_gelir=50000) == [(("vade_ay",), "literal_error")], "Literal metni sayıya çevirmez: \\"12\\" reddedilir"\nr = tip(tutar=300000, vade_ay=12, aylik_gelir=20000)\nassert r == [((), "value_error")], f"Alanlar arası hata model düzeyinde (loc boş) value_error olmalı, gelen {r}"\nassert tip(tutar=-5, vade_ay=12, aylik_gelir=1000) == [(("tutar",), "greater_than")], "Alan hatası varsa model_validator(after) çalışmaz"\n',
     'hints': ['Literal[12, 24, 36, 48] tip olarak yazılır; Literal tip zorlama yapmaz, "12" metni reddedilir.', 'model_validator(mode="after") bir örnek metodudur: self ile alanlara eriş ve sonunda return self.', 'Koşul: self.tutar / self.vade_ay > self.aylik_gelir * 0.5'],
     'why': 'Alanlar arası kurallar tek bir alanın validator\'ına sığmaz; mode="after" tüm alanlar geçerli olduktan sonra çalışır. Alan hataları varsa model validator hiç çalışmaz, böylece None ya da yanlış tiple uğraşmazsın.'},
    {'t': 'code', 'stage': 'Kendin yaz', 'diff': 2,
     'q': '<p>pydantic-settings\'i taklit eden bir ayar yükleyici yaz. <code>Ayarlar</code> modeli: <code>smtp_host</code> (str, varsayılan <code>"localhost"</code>), <code>smtp_port</code> (int, varsayılan 587), <code>dry_run</code> (bool, varsayılan True), <code>alicilar</code> (<code>list[str]</code>, varsayılan boş liste). <code>alicilar</code> virgüllü bir metin olarak da gelebilir: <code>mode="before"</code> validator ile parçala ve boşlukları kırp.</p><p><code>ayarlari_yukle(ortam)</code>: <code>ortam</code> sözlüğünden yalnızca <code>AM_</code> önekli anahtarları alsın, öneki atıp küçük harfe çevirsin ve <code>Ayarlar.model_validate</code> ile model döndürsün.</p>',
     'start': 'from pydantic import BaseModel, Field, field_validator\n\nclass Ayarlar(BaseModel):\n    pass\n\ndef ayarlari_yukle(ortam):\n    pass\n',
     'sol': 'from pydantic import BaseModel, Field, field_validator\n\nclass Ayarlar(BaseModel):\n    smtp_host: str = "localhost"\n    smtp_port: int = 587\n    dry_run: bool = True\n    alicilar: list[str] = Field(default_factory=list)\n\n    @field_validator("alicilar", mode="before")\n    @classmethod\n    def virgullu_metin(cls, v):\n        if isinstance(v, str):\n            return [p.strip() for p in v.split(",") if p.strip()]\n        return v\n\ndef ayarlari_yukle(ortam):\n    veri = {k[3:].lower(): v for k, v in ortam.items() if k.startswith("AM_")}\n    return Ayarlar.model_validate(veri)\n',
     'tests': 'a = ayarlari_yukle({"AM_SMTP_PORT": "465", "AM_DRY_RUN": "false", "AM_ALICILAR": "mudur@am.com, finans@am.com,", "PATH": "/usr/bin", "HOME": "/root"})\nassert a.smtp_port == 465, "Port metinden int\'e çevrilmeli"\nassert a.dry_run is False, "\\"false\\" metni False olmalı"\nassert a.alicilar == ["mudur@am.com", "finans@am.com"], f"Alıcılar virgülle parçalanıp kırpılmalı, boşlar atılmalı: {a.alicilar}"\nassert a.smtp_host == "localhost", "Verilmeyen ayar varsayılanını almalı"\nb = ayarlari_yukle({})\nassert b.alicilar == [] and b.dry_run is True and b.smtp_port == 587\nassert ayarlari_yukle({"AM_ALICILAR": ["x@y.com"]}).alicilar == ["x@y.com"], "Liste olarak gelirse olduğu gibi kabul edilmeli"\nfrom pydantic import ValidationError\ntry:\n    ayarlari_yukle({"AM_SMTP_PORT": "beş yüz"})\n    assert False, "Geçersiz port ValidationError vermeli"\nexcept ValidationError:\n    pass\n',
     'hints': ['Liste varsayılanı için Field(default_factory=list).', 'mode="before" validator ham değeri alır: str ise split(",") ile parçala, değilse olduğu gibi döndür.', 'Sözlük comprehension: {k[3:].lower(): v for k, v in ortam.items() if k.startswith("AM_")}'],
     'why': 'Ayarları ortamdan okuyup modelle doğrulamak, eksik ya da bozuk ayarın program başlarken fark edilmesini sağlar ("hızlı başarısız ol"). pydantic-settings bunu öneki, .env dosyasını ve gizli değerleri de yöneterek yapar.'},
    {'t': 'code', 'stage': 'Kendin yaz', 'diff': 2,
     'q': '<p>Kargo durum güncelleme servisi yaz. <code>Gonderi</code> modeli: <code>no</code> (str), <code>durum</code> (<code>Durum</code> Enum: <code>"hazirlaniyor"</code>, <code>"kargoda"</code>, <code>"teslim"</code>), <code>desi</code> (float, &gt; 0).</p><p><code>durum_guncelle(json_metin, yeni_durum)</code>: JSON\'dan modeli <code>model_validate_json</code> ile yüklesin, durumu güncellerken <b>doğrulamayı atlamasın</b> (geçersiz durum <code>ValidationError</code> vermeli) ve sonucu <code>model_dump_json()</code> ile JSON metni olarak döndürsün.</p>',
     'start': 'from enum import Enum\nfrom pydantic import BaseModel, Field, ValidationError\n\n# Durum ve Gonderi\n\ndef durum_guncelle(json_metin, yeni_durum):\n    pass\n',
     'sol': 'from enum import Enum\nfrom pydantic import BaseModel, Field, ValidationError\n\nclass Durum(str, Enum):\n    HAZIRLANIYOR = "hazirlaniyor"\n    KARGODA = "kargoda"\n    TESLIM = "teslim"\n\nclass Gonderi(BaseModel):\n    no: str\n    durum: Durum\n    desi: float = Field(gt=0)\n\ndef durum_guncelle(json_metin, yeni_durum):\n    g = Gonderi.model_validate_json(json_metin)\n    yeni = Gonderi.model_validate({**g.model_dump(), "durum": yeni_durum})\n    return yeni.model_dump_json()\n',
     'tests': 'j = \'{"no": "AM-77", "durum": "hazirlaniyor", "desi": "2.5"}\'\nassert durum_guncelle(j, "kargoda") == \'{"no":"AM-77","durum":"kargoda","desi":2.5}\', f"Gelen: {durum_guncelle(j, \'kargoda\')}"\ntry:\n    durum_guncelle(j, "kayboldu")\n    assert False, "Geçersiz durum ValidationError vermeli: model_copy(update=...) doğrulama yapmaz"\nexcept ValidationError as e:\n    assert e.errors()[0]["loc"] == ("durum",)\ntry:\n    durum_guncelle(\'{"no": "AM-78", "durum": "teslim"\', "kargoda")\n    assert False, "Bozuk JSON ValidationError (json_invalid) vermeli"\nexcept ValidationError as e:\n    assert e.errors()[0]["type"] == "json_invalid"\n',
     'hints': ['model_validate_json hem json.loads hem doğrulama yapar.', 'model_copy(update=...) DOĞRULAMAZ. Bunun yerine sözlüğü birleştirip yeniden model_validate et.', 'Gonderi.model_validate({**g.model_dump(), "durum": yeni_durum})'],
     'why': 'model_copy hızlıdır ama güvenilir veri varsayar. Dışarıdan gelen bir değeri modele koyarken her zaman doğrulama yolundan geçirmek gerekir. model_dump_json Enum\'u değerine çevirir ve boşluksuz JSON üretir.'},
]

EX += [
    {'t': 'code', 'stage': 'Hata avı', 'kind': 'bug', 'diff': 1,
     'q': '<p>Ürün kodlarını büyük harfe çevirip <code>AM-</code> önekini denetleyen model, geçerli kodlarda bile <code>kod</code> alanını <code>None</code> yapıyor. <b>Hatayı bul ve düzelt.</b></p>',
     'start': 'from pydantic import BaseModel, field_validator, ValidationError\n\nclass Urun(BaseModel):\n    ad: str\n    kod: str\n\n    @field_validator("kod")\n    @classmethod\n    def kodu_duzelt(cls, v):\n        v = v.strip().upper()\n        if not v.startswith("AM-"):\n            raise ValueError("kod AM- ile başlamalı")\n',
     'sol': 'from pydantic import BaseModel, field_validator, ValidationError\n\nclass Urun(BaseModel):\n    ad: str\n    kod: str\n\n    @field_validator("kod")\n    @classmethod\n    def kodu_duzelt(cls, v):\n        v = v.strip().upper()\n        if not v.startswith("AM-"):\n            raise ValueError("kod AM- ile başlamalı")\n        return v\n',
     'tests': 'u = Urun(ad="Çay", kod=" am-1042 ")\nassert u.kod == "AM-1042", f"kod büyük harfe çevrilmiş ve kırpılmış olmalı, gelen {u.kod!r}"\ntry:\n    Urun(ad="Çay", kod="XY-1")\n    assert False, "AM- ile başlamayan kod reddedilmeli"\nexcept ValidationError as e:\n    assert e.errors()[0]["type"] == "value_error"\n',
     'hints': ['Validator\'ın döndürdüğü değer alanın yeni değeridir.', 'Fonksiyonun sonunda hiçbir şey döndürülmezse Python None döndürür.'],
     'why': 'Validator hem denetler hem dönüştürür; dönüş değeri olmadan pydantic alanı None yapar. Bu hata sessizdir: doğrulama "geçer" ama veri kaybolur.'},
    {'t': 'code', 'stage': 'Hata avı', 'kind': 'bug', 'diff': 2,
     'q': '<p><code>odeme_hatalari(veri)</code> ödeme talimatındaki hataları <code>"alan:tip"</code> metinleri listesi olarak döndürmeli (hata yoksa boş liste). Ama tutarı hiç olmayan talimat geçerli sayılıyor ve hata listesi okunmuyor. <b>İki hatayı bul ve düzelt.</b></p>',
     'start': 'from pydantic import BaseModel, Field, ValidationError\n\nclass Odeme(BaseModel):\n    iban: str = Field(pattern=r"^TR\\d{24}$")\n    tutar: float = Field(0, gt=0)\n\ndef odeme_hatalari(veri):\n    try:\n        Odeme(**veri)\n        return []\n    except ValidationError as e:\n        return [h["loc"] for h in e.errors()]\n',
     'sol': 'from pydantic import BaseModel, Field, ValidationError\n\nclass Odeme(BaseModel):\n    iban: str = Field(pattern=r"^TR\\d{24}$")\n    tutar: float = Field(gt=0)\n\ndef odeme_hatalari(veri):\n    try:\n        Odeme(**veri)\n        return []\n    except ValidationError as e:\n        return [f"{\'.\'.join(map(str, h[\'loc\']))}:{h[\'type\']}" for h in e.errors()]\n',
     'tests': 'IBAN = "TR" + "0" * 24\nassert odeme_hatalari({"iban": IBAN, "tutar": 250}) == []\nassert odeme_hatalari({"iban": IBAN}) == ["tutar:missing"], "Tutarı olmayan talimat reddedilmeli: varsayılan değer gt=0 ile doğrulanmaz"\nassert odeme_hatalari({"iban": "TR12", "tutar": -1}) == ["iban:string_pattern_mismatch", "tutar:greater_than"], "Hatalar alan:tip biçiminde olmalı"\n',
     'hints': ['Field(0, gt=0): ilk argüman varsayılandır; varsayılan doğrulanmaz ve alan opsiyonel olur.', 'h["loc"] bir demettir; noktayla birleştirip h["type"] ile metin oluştur.'],
     'why': 'Zorunlu bir alana varsayılan vermek eksik veriyi sessizce kabul ettirir; para işlemlerinde en tehlikeli hatalardandır. Hata listesini yapılandırılmış bir biçime çevirmek, raporu ve testleri kolaylaştırır.'},
    {'t': 'code', 'stage': 'Meydan okuma', 'diff': 3,
     'q': '<p>Mağazalardan gelen günlük satış CSV\'sini doğrula. <code>csv_dogrula(csv_metin)</code> yaz; <code>SatisSatiri</code> modelini sen tasarla:</p><ul><li>Sütunlar: <code>tarih</code> (date, ISO), <code>sube</code> (boş olamaz, kırpılır), <code>adet</code> (int, &gt; 0), <code>fiyat</code> (float, &gt; 0), <code>indirim</code> (float ya da None)</li><li><code>fiyat</code> ve <code>indirim</code> Türkçe biçimde gelebilir: <code>"1.249,90"</code> → 1249.9, <code>"45,5"</code> → 45.5, <code>"120.75"</code> → 120.75 (virgül yoksa nokta ondalıktır).</li><li><code>indirim</code> boş metinse None olsun.</li></ul><p>Dönüş: <code>{"gecerli": [SatisSatiri, ...], "hatali": {satir_no: ["alan:tip", ...]}}</code>. Satır numarası dosyadaki satırdır: başlık 1. satır, ilk veri 2. satır.</p>',
     'start': 'import csv, io\nfrom datetime import date\nfrom pydantic import BaseModel, Field, ConfigDict, ValidationError, field_validator\n\ndef csv_dogrula(csv_metin):\n    pass\n',
     'sol': 'import csv, io\nfrom datetime import date\nfrom pydantic import BaseModel, Field, ConfigDict, ValidationError, field_validator\n\ndef tr_sayi(v):\n    if isinstance(v, str):\n        v = v.strip()\n        if "," in v:\n            v = v.replace(".", "").replace(",", ".")\n    return v\n\nclass SatisSatiri(BaseModel):\n    model_config = ConfigDict(str_strip_whitespace=True)\n    tarih: date\n    sube: str = Field(min_length=1)\n    adet: int = Field(gt=0)\n    fiyat: float = Field(gt=0)\n    indirim: float | None = None\n\n    @field_validator("fiyat", mode="before")\n    @classmethod\n    def fiyat_tr(cls, v):\n        return tr_sayi(v)\n\n    @field_validator("indirim", mode="before")\n    @classmethod\n    def indirim_tr(cls, v):\n        if isinstance(v, str) and not v.strip():\n            return None\n        return tr_sayi(v)\n\ndef csv_dogrula(csv_metin):\n    sonuc = {"gecerli": [], "hatali": {}}\n    for no, satir in enumerate(csv.DictReader(io.StringIO(csv_metin)), start=2):\n        try:\n            sonuc["gecerli"].append(SatisSatiri.model_validate(satir))\n        except ValidationError as e:\n            sonuc["hatali"][no] = [f"{\'.\'.join(map(str, h[\'loc\']))}:{h[\'type\']}" for h in e.errors()]\n    return sonuc\n',
     'tests': 'metin = """tarih,sube,adet,fiyat,indirim\n2026-10-26, Kadıköy ,3,\"1.249,90\",\n2026-10-26,Çankaya,2,45.5,\"10,5\"\n2026-10-27,,0,abc,\n26.10.2026,Bornova,1,\"45,5\",5\n2026-10-27,Konak,4,120.75,0\n"""\nr = csv_dogrula(metin)\ng = r["gecerli"]\nassert [s.sube for s in g] == ["Kadıköy", "Çankaya", "Konak"], f"Geçerli şubeler: {[s.sube for s in g]}"\nassert g[0].fiyat == 1249.9 and g[0].indirim is None, "\\"1.249,90\\" -> 1249.9; boş indirim -> None"\nassert g[1].fiyat == 45.5 and g[1].indirim == 10.5, "45.5 nokta ondalık; \\"10,5\\" -> 10.5"\nassert g[2].indirim == 0.0 and g[0].tarih.day == 26\nassert sorted(r["hatali"]) == [4, 5], f"Hatalı satır numaraları (başlık 1. satır): {sorted(r[\'hatali\'])}"\nassert sorted(r["hatali"][4]) == ["adet:greater_than", "fiyat:float_parsing", "sube:string_too_short"], f"4. satır: {r[\'hatali\'][4]}"\nassert len(r["hatali"][5]) == 1 and r["hatali"][5][0].startswith("tarih:"), "26.10.2026 ISO tarih değil"\n',
     'hints': ['csv.DictReader tüm değerleri metin verir; tip zorlama gerisini halleder. enumerate(..., start=2) satır numarasını dosyaya göre verir.', 'Türkçe sayı kuralı: metinde virgül varsa noktaları (binlik) sil, virgülü noktaya çevir; yoksa dokunma. Bunu mode="before" validator\'da yap.', 'indirim için ayrı before validator: boş metin → None, değilse aynı sayı dönüşümü.'],
     'why': 'Gerçek CSV\'lerde aynı sütun farklı biçimlerde gelir. Biçim düzeltmeyi before validator\'a, iş kurallarını Field kısıtlarına koymak kodu düzenli tutar. Binlik ayırıcıyı yalnızca virgül varken silmek "120.75" gibi nokta ondalıklı değerleri bozmaz.'},
    {'t': 'code', 'stage': 'Mini proje', 'diff': 3,
     'q': '<p><b>API doğrulama katmanı.</b> FastAPI\'nin yaptığını küçük ölçekte yap. <code>istek_isle(json_metin)</code> bir <code>(durum_kodu, govde)</code> demeti döndürsün:</p><ul><li>Model <code>SiparisIstegi</code>: <code>musteri_id</code> (int, &gt; 0), <code>kalemler</code> (<code>list[Kalem]</code>, en az 1), <code>kupon</code> (str ya da None, varsayılan None; verilirse 5 büyük harf/rakam: <code>^[A-Z0-9]{5}$</code>). Fazladan alan gelirse hata olsun (<code>extra="forbid"</code>). <code>Kalem</code> hazır verildi.</li><li>Başarıda: <code>(201, {"musteri_id": ..., "kalem_sayisi": ..., "toplam": ...})</code>; toplam 2 ondalık.</li><li>Hatada (bozuk JSON dahil): <code>(422, {"hatalar": [{"alan": "kalemler.0.adet", "tip": "greater_than"}, ...]})</code>. Konumu olmayan hatada alan boş metin olsun.</li></ul>',
     'start': 'from pydantic import BaseModel, Field, ConfigDict, ValidationError\n\n' + KALEM + '\n# SiparisIstegi modelini yaz\n\ndef istek_isle(json_metin):\n    pass\n',
     'sol': 'from pydantic import BaseModel, Field, ConfigDict, ValidationError\n\n' + KALEM + '\nclass SiparisIstegi(BaseModel):\n    model_config = ConfigDict(extra="forbid")\n    musteri_id: int = Field(gt=0)\n    kalemler: list[Kalem] = Field(min_length=1)\n    kupon: str | None = Field(default=None, pattern=r"^[A-Z0-9]{5}$")\n\ndef istek_isle(json_metin):\n    try:\n        istek = SiparisIstegi.model_validate_json(json_metin)\n    except ValidationError as e:\n        hatalar = [{"alan": ".".join(map(str, h["loc"])), "tip": h["type"]} for h in e.errors()]\n        return 422, {"hatalar": hatalar}\n    toplam = round(sum(k.adet * k.birim_fiyat for k in istek.kalemler), 2)\n    return 201, {"musteri_id": istek.musteri_id, "kalem_sayisi": len(istek.kalemler), "toplam": toplam}\n',
     'tests': 'ok = \'{"musteri_id": 42, "kalemler": [{"urun": "Çay", "adet": 2, "birim_fiyat": 45.5}, {"urun": "Kahve", "adet": 1, "birim_fiyat": 120}], "kupon": "EKIM5"}\'\nassert istek_isle(ok) == (201, {"musteri_id": 42, "kalem_sayisi": 2, "toplam": 211.0}), f"Başarılı istek: {istek_isle(ok)}"\nassert istek_isle(\'{"musteri_id": "7", "kalemler": [{"urun": "Su", "adet": 3, "birim_fiyat": 7.5}]}\')[0] == 201, "Kupon opsiyonel olmalı"\nkod, govde = istek_isle(\'{"musteri_id": 0, "kalemler": [{"urun": "Su", "adet": 0, "birim_fiyat": 7.5}], "kupon": "ekim", "not": "hızlı"}\')\nassert kod == 422\nassert sorted((h["alan"], h["tip"]) for h in govde["hatalar"]) == [("kalemler.0.adet", "greater_than"), ("kupon", "string_pattern_mismatch"), ("musteri_id", "greater_than"), ("not", "extra_forbidden")], f"Hatalar: {govde}"\nassert istek_isle(\'{"musteri_id": 1, "kalemler": []}\') == (422, {"hatalar": [{"alan": "kalemler", "tip": "too_short"}]})\nkod, govde = istek_isle("{bozuk json")\nassert kod == 422 and govde["hatalar"][0] == {"alan": "", "tip": "json_invalid"}, f"Bozuk JSON: {govde}"\n',
     'hints': ['model_validate_json bozuk JSON\'da da ValidationError (json_invalid) fırlatır; ayrıca json.loads yakalamana gerek yok.', 'kupon: str | None = Field(default=None, pattern=...); None değerde pattern uygulanmaz.', 'Hata sözlüğü: {"alan": ".".join(map(str, h["loc"])), "tip": h["type"]}; boş loc boş metin verir.'],
     'why': 'Bu, gerçek bir web servisinin ön kapısıdır: tek bir model, girdi sözleşmesini (zorunlu alanlar, kısıtlar, fazladan alan yasağı) tanımlar; hata listesi ön yüzün her hatayı doğru form kutusunda göstermesini sağlar. 201/422 ayrımı HTTP\'nin standart dilidir.'},
]
LESSON['ex'] = EX
