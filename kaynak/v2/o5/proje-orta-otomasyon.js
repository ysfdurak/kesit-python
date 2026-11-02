/* PythonPatika — Bitirme projesi: haftalık satış raporu otomasyonu (v2/o5) */
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push(
{ id: 'proje-orta-otomasyon',
  lv: 'orta',
  mod: 'Bitirme',
  min: 90,
  title: 'Bitirme projesi: haftalık satış raporu otomasyonu',
  sum: 'Anadolu Market\'in günlük CSV dökümlerini okuyan, pydantic ile doğrulayıp tekrarları ayıklayan, collections/itertools ile özetleyen, Jinja2 ile HTML rapor ve EmailMessage taslağı üreten; log, dry-run ve argparse CLI ile zamanlanmaya hazır bir otomasyon aracı kurarsın.',
  goals: [
    'Bir otomasyon sürecini okuma, doğrulama, özetleme, sunum ve yan etki katmanlarına ayırarak tasarlayabilirim.',
    'Klasördeki CSV dosyalarını kaynağını kaybetmeden okuyup pydantic modeliyle temizleyebilir, tekrarları ayıklayabilirim.',
    'Counter ve groupby ile kararlı (her çalıştırmada aynı) bir özet üretip Jinja2 ile HTML rapora dönüştürebilirim.',
    'Düz metin, HTML ve CSV eki içeren bir e-posta taslağı oluşturabilirim.',
    'argparse, logging ve varsayılan dry-run ile zamanlayıcıdan güvenle çalıştırılabilen bir komut satırı aracı yazabilirim.'
  ],
  body: `<h2>Proje tanımı</h2>
<p>Anadolu Market'in 12 mağazası her gün kasa sisteminden bir CSV dökümü üretir ve bunları ortak bir klasöre bırakır. Bölge müdürü her pazartesi sabahı bu dosyaları Excel'de birleştirir, hatalı satırları ayıklar, mağaza ve ürün bazında özet çıkarır, bir e-posta yazıp tabloyu yapıştırır. Bu iş yaklaşık iki saat sürüyor ve geçen ay iki kez aynı dosya iki kere eklendiği için ciro şişik raporlandı.</p>
<p>Senin görevin bu süreci uçtan uca otomatikleştiren, cron ya da Görev Zamanlayıcı ile her pazartesi 07:45'te çalışacak bir komut satırı aracı yazmak: <b>"Anadolu Market haftalık satış raporu otomasyonu"</b>. Bu proje orta seviyedeki otomasyon derslerinin hepsini birleştirir: <i>Ofis ve iş akışı otomasyonu</i> (pathlib, dry-run, log, EmailMessage), <i>Veri doğrulama ve pydantic v2</i>, <i>collections ve itertools</i>, <i>Şablonla rapor üretme</i> (Jinja2) ve <i>Standart kütüphane turu</i> (argparse).</p>
<div class="tbl-wrap"><table>
<tr><th>Gereksinim</th><th>Nasıl karşılanır</th></tr>
<tr><td>Klasördeki tüm günlük CSV'leri oku, başka dosyaları yok say</td><td><code>Path.glob("*.csv")</code> + <code>csv.DictReader</code></td></tr>
<tr><td>Hatalı satırları ayıkla, hangi dosyanın hangi satırı olduğunu raporla</td><td>pydantic modeli + <code>_kaynak</code> alanı</td></tr>
<tr><td>Aynı satır iki kez gelirse bir kez say</td><td>(sipariş no, ürün) anahtarlı küme</td></tr>
<tr><td>Mağaza cirosu, en çok satan 3 ürün, günlük ciro</td><td><code>Counter</code>, <code>groupby</code></td></tr>
<tr><td>Okunur HTML rapor ve e-posta taslağı</td><td>Jinja2 (autoescape) + <code>EmailMessage</code></td></tr>
<tr><td>Güvenli çalıştırma, iz bırakma</td><td>Varsayılan dry-run, <code>--uygula</code> bayrağı, <code>logging</code></td></tr>
<tr><td>Zamanlayıcıdan parametreyle çağrılabilme</td><td><code>argparse</code> CLI, çıkış kodu</td></tr>
</table></div>

<h2>Mimari: küçük, test edilebilir parçalar</h2>
<p>Her adım <b>tek bir iş yapan saf bir fonksiyon</b> olsun: girdi alır, çıktı döndürür, mümkünse dosyaya ya da ağa dokunmaz. Yan etkiler (dosya yazma, e-posta) yalnızca en dıştaki <code>calistir</code> fonksiyonunda toplanır. Bu tasarım her parçayı ayrı test etmeni, dry-run'ı tek bir <code>if</code> ile kurmanı ve ileride bir parçayı (ör. CSV yerine veritabanı) değiştirmeni kolaylaştırır.</p>
<div class="steps-list"><ol>
<li><code>klasoru_oku(klasor)</code> → ham satır sözlükleri (her biri <code>_kaynak</code>: "dosya.csv:satır")</li>
<li><code>SatisSatiri</code> modeli → tek satırın kuralları</li>
<li><code>temizle(satirlar)</code> → (geçerli modeller, hata metinleri)</li>
<li><code>ozetle(gecerli)</code> → özet sözlüğü</li>
<li><code>html_rapor(ozet, hafta, hatalar)</code> → HTML metni</li>
<li><code>eposta_taslagi(html, ozet, hafta, alicilar)</code> → <code>EmailMessage</code></li>
<li><code>arguman_ayristir(argv)</code> → komut satırı ayarları</li>
<li><code>calistir(argv)</code> → hepsini sırayla çağırır, loglar, dry-run değilse dosyaları yazar, çıkış kodu döndürür</li>
</ol></div>
<div class="tip"><b>Dosya düzeni</b>Gerçek projede bu kod <code>haftalik_rapor/</code> paketinde <code>okuma.py</code>, <code>model.py</code>, <code>ozet.py</code>, <code>rapor.py</code>, <code>cli.py</code> ve <code>templates/rapor.html</code> olarak bölünür; <code>tests/</code> klasöründe her modülün testi durur. Burada tek dosyada ilerliyoruz ki tarayıcıda çalıştırabilesin.</div>

<h2>Adım 1: Klasörü okumak</h2>
<p>Gerçek klasöre dokunmadan çalışmak için örnek veriyi geçici bir klasöre yazıyoruz. Veriye kasıtlı olarak sorunlar ekledik: virgüllü fiyat, boşluklu mağaza adı, boş kategori, iki kez gelmiş bir satır, adedi 0 olan satır, bozuk sipariş numarası ve klasöre karışmış bir .txt dosyası.</p>
<pre class="py">import tempfile
from pathlib import Path

BASLIK = "siparis_no,tarih,magaza,urun,kategori,adet,birim_fiyat\\n"

def ornek_klasor():
    k = Path(tempfile.mkdtemp()) / "satis"
    k.mkdir()
    (k / "satis_2026-10-26.csv").write_text(BASLIK
        + 'AM-1001,2026-10-26,Kadıköy,Türk kahvesi,İçecek,2,"89,90"\\n'
        + "AM-1002,2026-10-26,Çankaya,Çay,İçecek,5,45\\n"
        + 'AM-1003,2026-10-26, Kadıköy ,Çaydanlık,Mutfak,1,"1.249,00"\\n', encoding="utf-8")
    (k / "satis_2026-10-27.csv").write_text(BASLIK
        + "AM-1004,2026-10-27,Bornova,Çay,İçecek,10,45\\n"
        + "AM-1002,2026-10-26,Çankaya,Çay,İçecek,5,45\\n"
        + "AM-1005,2026-10-27,Çankaya,Filtre kahve,,3,120.5\\n"
        + "AM-1006,2026-10-27,Bornova,Su,İçecek,0,7.5\\n"
        + "X-1,2026-10-27,Konak,Su,İçecek,2,abc\\n", encoding="utf-8")
    (k / "okubeni.txt").write_text("CSV değil, okunmamalı", encoding="utf-8")
    return k

import csv
from pathlib import Path

def klasoru_oku(klasor):
    """Klasördeki tüm .csv dosyalarını ad sırasıyla okur; her satıra _kaynak ekler."""
    satirlar = []
    for dosya in sorted(Path(klasor).glob("*.csv")):
        with dosya.open(encoding="utf-8", newline="") as f:
            for no, satir in enumerate(csv.DictReader(f), start=2):
                satir["_kaynak"] = f"{dosya.name}:{no}"
                satirlar.append(satir)
    return satirlar

satirlar = klasoru_oku(ornek_klasor())
print(len(satirlar), "satır")
for s in satirlar[:2]:
    print(s)</pre>
<p><code>enumerate(..., start=2)</code> satır numarasını dosyadaki gerçek satırla eşler (1. satır başlık). Hata raporunda "satis_2026-10-27.csv:5" yazmak, mağaza çalışanının sorunu Excel'de saniyede bulmasını sağlar. <code>newline=""</code> csv modülünün tırnak içindeki satır sonlarını doğru işlemesi için önerilen ayardır.</p>

<h2>Adım 2: Model ve temizlik</h2>
<p>Tek bir satırın kuralları pydantic modelinde durur: sipariş numarası <code>AM-</code> ile başlar, adet ve fiyat pozitiftir, Türkçe ondalık (<code>"1.249,00"</code>) kabul edilir, boş kategori "Diğer" olur. Temizlik fonksiyonu modeli her satıra uygular, hatalıları ve tekrarları ayırır. Tekrarı tanımlayan anahtar <b>(sipariş no, ürün)</b>: bir sipariş birden çok ürün içerebilir ama aynı ürün aynı siparişte iki satır olamaz.</p>
<pre class="py">from datetime import date
from pydantic import BaseModel, ConfigDict, Field, ValidationError, field_validator

class SatisSatiri(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    siparis_no: str = Field(pattern=r"^AM-\\d+$")
    tarih: date
    magaza: str = Field(min_length=1)
    urun: str = Field(min_length=1)
    kategori: str = "Diğer"
    adet: int = Field(gt=0)
    birim_fiyat: float = Field(gt=0)

    @field_validator("birim_fiyat", mode="before")
    @classmethod
    def tr_ondalik(cls, v):
        if isinstance(v, str) and "," in v:
            v = v.replace(".", "").replace(",", ".")
        return v

    @field_validator("kategori", mode="before")
    @classmethod
    def bos_kategori(cls, v):
        if v is None or (isinstance(v, str) and not v.strip()):
            return "Diğer"
        return v

    @property
    def tutar(self):
        return round(self.adet * self.birim_fiyat, 2)

def temizle(satirlar):
    """(geçerli SatisSatiri listesi, hata metinleri) döndürür."""
    gecerli, hatalar, gorulen = [], [], set()
    for satir in satirlar:
        kaynak = satir.get("_kaynak", "?")
        veri = {k: v for k, v in satir.items() if not k.startswith("_")}
        try:
            s = SatisSatiri.model_validate(veri)
        except ValidationError as e:
            alanlar = ",".join(".".join(map(str, h["loc"])) for h in e.errors())
            hatalar.append(f"{kaynak} geçersiz: {alanlar}")
            continue
        anahtar = (s.siparis_no, s.urun)
        if anahtar in gorulen:
            hatalar.append(f"{kaynak} tekrar: {s.siparis_no}/{s.urun}")
            continue
        gorulen.add(anahtar)
        gecerli.append(s)
    return gecerli, hatalar

ham = [
    {"siparis_no": "AM-1", "tarih": "2026-10-26", "magaza": " Kadıköy ", "urun": "Çay", "kategori": "", "adet": "2", "birim_fiyat": "1.249,50", "_kaynak": "a.csv:2"},
    {"siparis_no": "AM-1", "tarih": "2026-10-26", "magaza": "Kadıköy", "urun": "Çay", "kategori": "", "adet": "2", "birim_fiyat": "1249.5", "_kaynak": "b.csv:7"},
    {"siparis_no": "X-2", "tarih": "2026-10-26", "magaza": "Konak", "urun": "Su", "kategori": "İçecek", "adet": "0", "birim_fiyat": "7,5", "_kaynak": "b.csv:8"},
]
gecerli, hatalar = temizle(ham)
print(gecerli[0].magaza, gecerli[0].kategori, gecerli[0].birim_fiyat, gecerli[0].tutar)
print(hatalar)</pre>
<div class="warn"><b>Tekrarlı veri sessiz bir felakettir</b>Aynı dosyanın iki kez kopyalanması rapora hata olarak değil, <i>daha yüksek ciro</i> olarak yansır ve kimse şikâyet etmez. Tekrarları atmak kadar, atıldıklarını loglamak da önemlidir: log'da 300 "tekrar" satırı görmek, kaynakta bir sorun olduğunun işaretidir.</div>

<h2>Adım 3: Özet</h2>
<p>Özet bir sözlük: toplam ciro, sipariş ve satır sayısı, mağaza cirosu (büyükten küçüğe), en çok satan 3 ürün (adet), günlük ciro. Mağaza ve ürün için <code>Counter</code>, gün için <code>itertools.groupby</code> kullanıyoruz. groupby yalnızca <b>ardışık</b> eşit anahtarları gruplar; bu yüzden önce sıralamak zorunludur. Eşitlikte sıralamayı ada göre sabitlemek (<code>key=lambda x: (-x[1], x[0])</code>) raporun her çalıştırmada aynı çıkmasını sağlar; <code>most_common</code> eşitlikleri ekleme sırasına göre bırakır.</p>
<pre class="py">from collections import namedtuple
from datetime import date
S = namedtuple("S", "siparis_no tarih magaza urun adet tutar")
D = date.fromisoformat

from collections import Counter
from itertools import groupby

def ozetle(gecerli):
    magaza, urun_adet = Counter(), Counter()
    for s in gecerli:
        magaza[s.magaza] += s.tutar
        urun_adet[s.urun] += s.adet
    sirali = sorted(gecerli, key=lambda s: s.tarih)
    gunluk = {t.isoformat(): round(sum(s.tutar for s in grup), 2)
              for t, grup in groupby(sirali, key=lambda s: s.tarih)}
    return {
        "toplam_ciro": round(sum(magaza.values()), 2),
        "satir_sayisi": len(gecerli),
        "siparis_sayisi": len({s.siparis_no for s in gecerli}),
        "magaza_ciro": sorted(((m, round(c, 2)) for m, c in magaza.items()), key=lambda x: (-x[1], x[0])),
        "en_cok_satan": sorted(urun_adet.items(), key=lambda x: (-x[1], x[0]))[:3],
        "gunluk_ciro": gunluk,
    }

veri = [S("AM-1", D("2026-10-27"), "Kadıköy", "Çay", 5, 225.0),
        S("AM-2", D("2026-10-26"), "Çankaya", "Kahve", 2, 179.8),
        S("AM-2", D("2026-10-26"), "Çankaya", "Çay", 1, 45.0),
        S("AM-3", D("2026-10-27"), "Kadıköy", "Su", 6, 45.0)]
for anahtar, deger in ozetle(veri).items():
    print(f"{anahtar:15} {deger}")</pre>
<p>Testlerde pydantic modeli yerine aynı niteliklere sahip bir <code>namedtuple</code> kullandık: <code>ozetle</code> yalnızca <code>.magaza</code>, <code>.tutar</code> gibi niteliklere ihtiyaç duyar (ördek tiplemesi, duck typing). Parçalar arası bağımlılık ne kadar azsa test o kadar kolaydır.</p>

<h2>Adım 4: HTML rapor ve e-posta taslağı</h2>
<p>Sunum Jinja şablonunda, biçim (<code>tl</code> filtresi) tek bir fonksiyonda. autoescape açık: mağaza ya da ürün adında <code>&lt;</code> olsa bile rapor bozulmaz. E-posta taslağı düz metin + HTML alternatifi + mağaza cirosu CSV eki içerir; müdür isterse eki doğrudan Excel'de açar.</p>
<pre class="py">from jinja2 import Environment

def tl(x):
    return f"{x:,.2f}".translate(str.maketrans(",.", ".,")) + " TL"

ENV = Environment(autoescape=True, trim_blocks=True, lstrip_blocks=True)
ENV.filters["tl"] = tl
RAPOR = ENV.from_string("""&lt;h1&gt;Anadolu Market | {{ hafta }} haftalık satış raporu&lt;/h1&gt;
&lt;p&gt;Toplam ciro: &lt;b&gt;{{ ozet.toplam_ciro|tl }}&lt;/b&gt; ({{ ozet.siparis_sayisi }} sipariş, {{ ozet.satir_sayisi }} satır)&lt;/p&gt;
&lt;table&gt;
{% for magaza, ciro in ozet.magaza_ciro %}
&lt;tr&gt;&lt;td&gt;{{ magaza }}&lt;/td&gt;&lt;td&gt;{{ ciro|tl }}&lt;/td&gt;&lt;/tr&gt;
{% endfor %}
&lt;/table&gt;
&lt;ol&gt;
{% for urun, adet in ozet.en_cok_satan %}
&lt;li&gt;{{ urun }} ({{ adet }} adet)&lt;/li&gt;
{% endfor %}
&lt;/ol&gt;
{% if hatalar %}
&lt;p&gt;Uyarı: {{ hatalar|length }} satır rapora alınmadı.&lt;/p&gt;
{% endif %}""")

def html_rapor(ozet, hafta, hatalar=()):
    return RAPOR.render(ozet=ozet, hafta=hafta, hatalar=hatalar)

from email.message import EmailMessage

def eposta_taslagi(html, ozet, hafta, alicilar):
    msg = EmailMessage()
    msg["From"] = "rapor@anadolumarket.com.tr"
    msg["To"] = ", ".join(alicilar)
    msg["Subject"] = f"{hafta} haftalık satış raporu - {tl(ozet['toplam_ciro'])}"
    msg.set_content(f"Merhaba,\\n\\n{hafta} haftasında toplam ciro {tl(ozet['toplam_ciro'])}.\\nAyrıntılar HTML raporda ve ekteki CSV'de.\\n")
    msg.add_alternative(html, subtype="html")
    satirlar = ["magaza,ciro"] + [f"{m},{c:.2f}" for m, c in ozet["magaza_ciro"]]
    msg.add_attachment("\\n".join(satirlar) + "\\n", subtype="csv", filename=f"magaza_ciro_{hafta}.csv")
    return msg

ozet = {"toplam_ciro": 2465.3, "satir_sayisi": 5, "siparis_sayisi": 5,
        "magaza_ciro": [("Kadıköy", 1428.8), ("Çankaya", 586.5), ("Bornova", 450.0)],
        "en_cok_satan": [("Çay", 15), ("Filtre kahve", 3), ("Türk kahvesi", 2)], "gunluk_ciro": {}}
html = html_rapor(ozet, "2026-W44", ["x.csv:3 tekrar"])
print(html)
msg = eposta_taslagi(html, ozet, "2026-W44", ["mudur@anadolumarket.com.tr"])
print(msg["Subject"])
print([p.get_content_type() for p in msg.iter_parts()], [p.get_filename() for p in msg.iter_attachments()])</pre>

<h2>Adım 5: Komut satırı, log ve dry-run</h2>
<p>Zamanlayıcı betiği parametrelerle çağırır: <code>python haftalik_rapor.py --klasor /veri/satis --hafta 2026-W44 --alici mudur@... --uygula</code>. <code>argparse</code> argümanları ayrıştırır, <code>--help</code> çıktısını otomatik üretir ve hatalı girdide anlaşılır mesajla 2 koduyla çıkar. Önemli kararlar:</p>
<ul>
<li><b>Varsayılan dry-run:</b> <code>--uygula</code> verilmedikçe hiçbir dosya yazılmaz. <code>action="store_true"</code> bayrağı değer almaz; <code>type=bool</code> kullanma (<code>bool("False")</code> True'dur).</li>
<li><b>Birden çok alıcı:</b> <code>action="append"</code> aynı bayrağın tekrarlanmasıyla liste oluşturur.</li>
<li><b>Hafta doğrulama:</b> <code>type=</code> parametresine kendi fonksiyonunu verip <code>ArgumentTypeError</code> fırlatırsan argparse güzel bir hata mesajı basar.</li>
<li><b>Çıkış kodu:</b> 0 başarı, 1 iş hatası (CSV yok). Zamanlayıcı ve izleme araçları buna bakar.</li>
<li><b>Log seviyesi:</b> cron'da <code>WARNING</code>, elle denemede <code>DEBUG</code>. Mesajlarda <code>%s</code> yer tutucu kullan.</li>
</ul>

<h2>Tam çözüm</h2>
<p>Aşağıdaki program tüm parçaları birleştirir ve önce dry-run, sonra gerçek çalıştırma yapar. Çalıştırıp log satırlarını, çıkış kodlarını ve üretilen HTML'i incele.</p>
<pre class="py">import tempfile
from pathlib import Path

BASLIK = "siparis_no,tarih,magaza,urun,kategori,adet,birim_fiyat\\n"

def ornek_klasor():
    k = Path(tempfile.mkdtemp()) / "satis"
    k.mkdir()
    (k / "satis_2026-10-26.csv").write_text(BASLIK
        + 'AM-1001,2026-10-26,Kadıköy,Türk kahvesi,İçecek,2,"89,90"\\n'
        + "AM-1002,2026-10-26,Çankaya,Çay,İçecek,5,45\\n"
        + 'AM-1003,2026-10-26, Kadıköy ,Çaydanlık,Mutfak,1,"1.249,00"\\n', encoding="utf-8")
    (k / "satis_2026-10-27.csv").write_text(BASLIK
        + "AM-1004,2026-10-27,Bornova,Çay,İçecek,10,45\\n"
        + "AM-1002,2026-10-26,Çankaya,Çay,İçecek,5,45\\n"
        + "AM-1005,2026-10-27,Çankaya,Filtre kahve,,3,120.5\\n"
        + "AM-1006,2026-10-27,Bornova,Su,İçecek,0,7.5\\n"
        + "X-1,2026-10-27,Konak,Su,İçecek,2,abc\\n", encoding="utf-8")
    (k / "okubeni.txt").write_text("CSV değil, okunmamalı", encoding="utf-8")
    return k

import csv
from pathlib import Path

def klasoru_oku(klasor):
    """Klasördeki tüm .csv dosyalarını ad sırasıyla okur; her satıra _kaynak ekler."""
    satirlar = []
    for dosya in sorted(Path(klasor).glob("*.csv")):
        with dosya.open(encoding="utf-8", newline="") as f:
            for no, satir in enumerate(csv.DictReader(f), start=2):
                satir["_kaynak"] = f"{dosya.name}:{no}"
                satirlar.append(satir)
    return satirlar

from datetime import date
from pydantic import BaseModel, ConfigDict, Field, ValidationError, field_validator

class SatisSatiri(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    siparis_no: str = Field(pattern=r"^AM-\\d+$")
    tarih: date
    magaza: str = Field(min_length=1)
    urun: str = Field(min_length=1)
    kategori: str = "Diğer"
    adet: int = Field(gt=0)
    birim_fiyat: float = Field(gt=0)

    @field_validator("birim_fiyat", mode="before")
    @classmethod
    def tr_ondalik(cls, v):
        if isinstance(v, str) and "," in v:
            v = v.replace(".", "").replace(",", ".")
        return v

    @field_validator("kategori", mode="before")
    @classmethod
    def bos_kategori(cls, v):
        if v is None or (isinstance(v, str) and not v.strip()):
            return "Diğer"
        return v

    @property
    def tutar(self):
        return round(self.adet * self.birim_fiyat, 2)

def temizle(satirlar):
    """(geçerli SatisSatiri listesi, hata metinleri) döndürür."""
    gecerli, hatalar, gorulen = [], [], set()
    for satir in satirlar:
        kaynak = satir.get("_kaynak", "?")
        veri = {k: v for k, v in satir.items() if not k.startswith("_")}
        try:
            s = SatisSatiri.model_validate(veri)
        except ValidationError as e:
            alanlar = ",".join(".".join(map(str, h["loc"])) for h in e.errors())
            hatalar.append(f"{kaynak} geçersiz: {alanlar}")
            continue
        anahtar = (s.siparis_no, s.urun)
        if anahtar in gorulen:
            hatalar.append(f"{kaynak} tekrar: {s.siparis_no}/{s.urun}")
            continue
        gorulen.add(anahtar)
        gecerli.append(s)
    return gecerli, hatalar

from collections import Counter
from itertools import groupby

def ozetle(gecerli):
    magaza, urun_adet = Counter(), Counter()
    for s in gecerli:
        magaza[s.magaza] += s.tutar
        urun_adet[s.urun] += s.adet
    sirali = sorted(gecerli, key=lambda s: s.tarih)
    gunluk = {t.isoformat(): round(sum(s.tutar for s in grup), 2)
              for t, grup in groupby(sirali, key=lambda s: s.tarih)}
    return {
        "toplam_ciro": round(sum(magaza.values()), 2),
        "satir_sayisi": len(gecerli),
        "siparis_sayisi": len({s.siparis_no for s in gecerli}),
        "magaza_ciro": sorted(((m, round(c, 2)) for m, c in magaza.items()), key=lambda x: (-x[1], x[0])),
        "en_cok_satan": sorted(urun_adet.items(), key=lambda x: (-x[1], x[0]))[:3],
        "gunluk_ciro": gunluk,
    }

from jinja2 import Environment

def tl(x):
    return f"{x:,.2f}".translate(str.maketrans(",.", ".,")) + " TL"

ENV = Environment(autoescape=True, trim_blocks=True, lstrip_blocks=True)
ENV.filters["tl"] = tl
RAPOR = ENV.from_string("""&lt;h1&gt;Anadolu Market | {{ hafta }} haftalık satış raporu&lt;/h1&gt;
&lt;p&gt;Toplam ciro: &lt;b&gt;{{ ozet.toplam_ciro|tl }}&lt;/b&gt; ({{ ozet.siparis_sayisi }} sipariş, {{ ozet.satir_sayisi }} satır)&lt;/p&gt;
&lt;table&gt;
{% for magaza, ciro in ozet.magaza_ciro %}
&lt;tr&gt;&lt;td&gt;{{ magaza }}&lt;/td&gt;&lt;td&gt;{{ ciro|tl }}&lt;/td&gt;&lt;/tr&gt;
{% endfor %}
&lt;/table&gt;
&lt;ol&gt;
{% for urun, adet in ozet.en_cok_satan %}
&lt;li&gt;{{ urun }} ({{ adet }} adet)&lt;/li&gt;
{% endfor %}
&lt;/ol&gt;
{% if hatalar %}
&lt;p&gt;Uyarı: {{ hatalar|length }} satır rapora alınmadı.&lt;/p&gt;
{% endif %}""")

def html_rapor(ozet, hafta, hatalar=()):
    return RAPOR.render(ozet=ozet, hafta=hafta, hatalar=hatalar)

from email.message import EmailMessage

def eposta_taslagi(html, ozet, hafta, alicilar):
    msg = EmailMessage()
    msg["From"] = "rapor@anadolumarket.com.tr"
    msg["To"] = ", ".join(alicilar)
    msg["Subject"] = f"{hafta} haftalık satış raporu - {tl(ozet['toplam_ciro'])}"
    msg.set_content(f"Merhaba,\\n\\n{hafta} haftasında toplam ciro {tl(ozet['toplam_ciro'])}.\\nAyrıntılar HTML raporda ve ekteki CSV'de.\\n")
    msg.add_alternative(html, subtype="html")
    satirlar = ["magaza,ciro"] + [f"{m},{c:.2f}" for m, c in ozet["magaza_ciro"]]
    msg.add_attachment("\\n".join(satirlar) + "\\n", subtype="csv", filename=f"magaza_ciro_{hafta}.csv")
    return msg

import argparse, re

def hafta_tipi(metin):
    if not re.fullmatch(r"\\d{4}-W\\d{2}", metin):
        raise argparse.ArgumentTypeError(f"hafta YYYY-Www biçiminde olmalı: {metin}")
    return metin

def arguman_ayristir(argv=None):
    p = argparse.ArgumentParser(prog="haftalik_rapor", description="Anadolu Market haftalık satış raporu")
    p.add_argument("--klasor", required=True, help="CSV dosyalarının klasörü")
    p.add_argument("--hafta", required=True, type=hafta_tipi, help="ör. 2026-W44")
    p.add_argument("--cikti", default="cikti", help="rapor klasörü")
    p.add_argument("--alici", action="append", default=[], dest="alicilar", help="birden çok kez verilebilir")
    p.add_argument("--uygula", action="store_true", help="dosyaları gerçekten yaz (varsayılan: dry-run)")
    p.add_argument("--log-seviye", default="INFO", choices=["DEBUG", "INFO", "WARNING", "ERROR"])
    return p.parse_args(argv)

import logging

log = logging.getLogger("haftalik_rapor")

def calistir(argv=None):
    args = arguman_ayristir(argv)
    log.setLevel(args.log_seviye)
    satirlar = klasoru_oku(args.klasor)
    if not satirlar:
        log.error("klasörde CSV satırı yok: %s", args.klasor)
        return 1
    log.info("%d satır okundu", len(satirlar))
    gecerli, hatalar = temizle(satirlar)
    for h in hatalar:
        log.warning(h)
    ozet = ozetle(gecerli)
    html = html_rapor(ozet, args.hafta, hatalar)
    msg = eposta_taslagi(html, ozet, args.hafta, args.alicilar or ["mudurler@anadolumarket.com.tr"])
    cikti = Path(args.cikti)
    hedefler = [cikti / f"rapor_{args.hafta}.html", cikti / f"taslak_{args.hafta}.eml"]
    if not args.uygula:
        for h in hedefler:
            log.info("[DRY-RUN] yazılacaktı: %s", h.name)
        return 0
    cikti.mkdir(parents=True, exist_ok=True)
    hedefler[0].write_text(html, encoding="utf-8")
    hedefler[1].write_bytes(bytes(msg))
    log.info("yazıldı: %s", ", ".join(h.name for h in hedefler))
    return 0

if __name__ == "__main__":
    import sys
    logging.basicConfig(stream=sys.stdout, format="%(levelname)-7s %(message)s", force=True)
    klasor = ornek_klasor()
    cikti = klasor.parent / "cikti"
    print("Çıkış kodu:", calistir(["--klasor", str(klasor), "--hafta", "2026-W44", "--cikti", str(cikti)]))
    print("Çıkış kodu:", calistir(["--klasor", str(klasor), "--hafta", "2026-W44", "--cikti", str(cikti),
                                   "--alici", "mudur@anadolumarket.com.tr", "--uygula", "--log-seviye", "WARNING"]))
    print(sorted(p.name for p in cikti.iterdir()))
    print((cikti / "rapor_2026-W44.html").read_text(encoding="utf-8"))</pre>
<h3>Çıktıyı okumak</h3>
<p>İlk çalıştırmada (dry-run) log önce okunan satır sayısını, ardından atılan üç satırı nedenleriyle gösterir: <code>satis_2026-10-27.csv:3</code> önceki dosyadaki siparişin tekrarı, <code>:5</code> adedi 0 olan satır, <code>:6</code> hem sipariş numarası hem fiyatı bozuk satır. Sonra yazılacak iki dosyanın adını söyler ama klasör oluşturulmaz. İkinci çalıştırmada <code>--uygula</code> ve <code>--log-seviye WARNING</code> verdik: bilgi satırları kaybolur, yalnızca uyarılar kalır ve dosyalar yazılır. Bu, cron'daki tipik kullanımdır: her şey yolundaysa log sessizdir, bir sorun varsa yalnızca o görünür.</p>
<p>Rapordaki toplam ciro 2.465,30 TL'dir. Tekrar ayıklanmasaydı Çankaya'nın cirosu 225 TL fazla, yani yaklaşık %38 şişik görünecekti; bu, otomasyona eklediğin tek bir kümenin değerini somut olarak gösterir. Alıştırmalarda bu parçaları tek tek yazacak, ardından iki mini projeyle aracı genişleteceksin: tüm boru hattını birleştiren <code>calistir</code> ve geçen haftayla karşılaştırma tablosu. Meydan okuma görevindeki anomali tespiti de rapora "dikkat" bölümü eklemenin ilk adımıdır.</p>
<p>Kendi bilgisayarında bu dosyayı <code>haftalik_rapor.py</code> olarak kaydedip <code>ornek_klasor()</code> yerine gerçek klasörü vererek çalıştırabilirsin. Gönderim için <i>Ofis ve iş akışı otomasyonu</i> dersindeki <code>smtplib.SMTP_SSL</code> bloğunu <code>--gonder</code> bayrağının arkasına ekle; varsayılan davranış her zaman yalnızca taslak üretmek olsun.</p>
<pre class="code"># Linux/macOS cron (crontab -e): her pazartesi 07:45
45 7 * * 1 /opt/rapor/.venv/bin/python /opt/rapor/haftalik_rapor.py --klasor /veri/satis --hafta $(date +\\%G-W\\%V) --uygula &gt;&gt; /var/log/rapor.log 2&gt;&amp;1

# Windows Görev Zamanlayıcı
schtasks /create /sc weekly /d MON /st 07:45 /tn HaftalikRapor /tr "C:\\rapor\\.venv\\Scripts\\python.exe C:\\rapor\\haftalik_rapor.py --klasor D:\\satis --hafta 2026-W44 --uygula"</pre>

<div class="note"><b>Gerçek işte</b>Bu tür bir rapor otomasyonu genellikle küçük başlar ve hızla kritikleşir: birkaç ay sonra finans ekibi kararlarını o rapora göre verir. O noktada üç soru sorulur: "Rapor bu hafta çalıştı mı?" (log ve çıkış kodu izlemesi), "Rakam neden geçen haftadan farklı?" (atılan satırların raporu, tekrar sayısı) ve "Bunu kim değiştirdi?" (git, testler, kod incelemesi). Projeyi baştan bu sorulara cevap verecek biçimde kurmak, onu bir betikten bir <b>ürüne</b> dönüştürür.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Bu projeyi üretime taşısaydın</h3>
<ul>
<li><b>Testler:</b> Her parça için pytest testleri; <code>tmp_path</code> fikstürü ile geçici klasör; HTML çıktısı için anlık görüntü (snapshot) testi. <code>calistir</code> için uçtan uca test: örnek klasör → dry-run → çıkış kodu 0 ve hiç dosya yok.</li>
<li><b>Yapılandırma:</b> Alıcılar, SMTP ve klasör yolları <code>pydantic-settings</code> ile ortam değişkenlerinden; şifre <code>SecretStr</code>.</li>
<li><b>İdempotentlik:</b> Aynı hafta için rapor zaten gönderildiyse (durum dosyası ya da SQLite tablosu) ikinci çalıştırma göndermesin.</li>
<li><b>Ölçek:</b> Dosyalar büyüdüğünde satır satır pydantic yerine pandas/polars ile vektörel doğrulama; özetleme <code>groupby</code> ile.</li>
<li><b>Gözlemlenebilirlik:</b> Log'u JSON biçiminde yazıp merkezi bir sisteme gönder; "atılan satır oranı %5'i aştı" gibi eşiklerde uyarı üret.</li>
<li><b>Paketleme:</b> <code>pyproject.toml</code> içinde <code>[project.scripts] haftalik-rapor = "haftalik_rapor.cli:calistir"</code> ile komut olarak kur.</li>
</ul>
</section>
`,
  ex: [
    { t: 'mc',
      stage: 'Isınma',
      q: 'Bu projede yan etkiler (dosya yazma, e-posta) neden yalnızca en dıştaki <code>calistir</code> fonksiyonunda toplanıyor?',
      o: [
        'Python iç içe çağrılan fonksiyonlarda dosya yazmaya izin vermediği için',
        'Diğer parçalar saf kalır: kolay test edilir ve dry-run tek bir kontrolle sağlanır',
        'Böylece program daha az bellek kullanır ve daha hızlı çalışır',
        'argparse yalnızca en dıştaki fonksiyonda çağrılabildiği için'
      ],
      a: 1,
      why: 'Girdi alıp çıktı döndüren saf fonksiyonlar dosya sistemi kurmadan test edilir. Yan etkiler tek yerde olunca dry-run, loglama ve hata yönetimi de tek yerde yapılır.' },
    { t: 'mc',
      stage: 'Isınma',
      q: 'Aynı günlük CSV klasöre yanlışlıkla iki kez kopyalandı ve tekrarlar ayıklanmadı. Raporda ne görülür?',
      o: ['Program çöker ve rapor hiç üretilmez', 'Ciro ve adetler şişer; hata mesajı çıkmaz', 'pydantic tekrarları kendiliğinden atar', 'Yalnızca e-posta ekinde fark görülür'],
      a: 1,
      why: 'Tekrarlı satırlar geçerli satırlardır; doğrulamadan geçer ve toplamları büyütür. Bu yüzden (sipariş no, ürün) gibi bir anahtarla tekrar kontrolü ve tekrar sayısının loglanması gerekir.' },
    { t: 'mc',
      stage: 'Isınma',
      q: '<code>p.add_argument("--alici", action="append", default=[], dest="alicilar")</code> tanımıyla <code>--alici a@x.com --alici b@x.com</code> verildiğinde <code>args.alicilar</code> nedir?',
      o: ['"b@x.com"', '["a@x.com", "b@x.com"]', '"a@x.com b@x.com"', 'argparse hata verir: aynı bayrak iki kez kullanılamaz'],
      a: 1,
      why: 'action="append" her kullanımda değeri listeye ekler. Varsayılan "store" olsaydı son değer (b@x.com) kalırdı.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Bu argparse çağrısı ne yazdırır?',
      code: 'import argparse\np = argparse.ArgumentParser()\np.add_argument("--klasor", required=True)\np.add_argument("--cikti", default="cikti")\np.add_argument("--alici", action="append", default=[], dest="alicilar")\np.add_argument("--uygula", action="store_true")\np.add_argument("--log-seviye", default="INFO")\nargs = p.parse_args(["--klasor", "veri", "--alici", "a@am.com", "--log-seviye", "DEBUG"])\nprint(args.klasor, args.cikti, args.alicilar)\nprint(args.uygula, args.log_seviye)\n',
      o: ['veri cikti [\'a@am.com\']\nFalse DEBUG', 'veri None a@am.com\nFalse DEBUG', 'veri cikti [\'a@am.com\']\nNone INFO', 'AttributeError: log-seviye'],
      a: 0,
      why: 'Verilmeyen --cikti varsayılanını alır; append tek değerde bile liste üretir; store_true verilmeyince False\'tur. Tireli seçenek adı (--log-seviye) nitelikte alt çizgiye (log_seviye) dönüşür.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'groupby sıralı ve sırasız veride ne üretir?',
      code: 'from itertools import groupby\ntarihler = ["10-26", "10-27", "10-26"]\nprint([(t, len(list(g))) for t, g in groupby(tarihler)])\nprint([(t, len(list(g))) for t, g in groupby(sorted(tarihler))])\n',
      o: [
        '[(\'10-26\', 2), (\'10-27\', 1)]\n[(\'10-26\', 2), (\'10-27\', 1)]',
        '[(\'10-26\', 1), (\'10-27\', 1), (\'10-26\', 1)]\n[(\'10-26\', 2), (\'10-27\', 1)]',
        '[(\'10-26\', 1), (\'10-27\', 1)]\n[(\'10-26\', 2), (\'10-27\', 1)]',
        '[(\'10-26\', 1), (\'10-27\', 1), (\'10-26\', 1)]\n[(\'10-26\', 1), (\'10-27\', 1), (\'10-26\', 1)]'
      ],
      a: 1,
      why: 'groupby SQL\'deki GROUP BY değildir: yalnızca art arda gelen eşit anahtarları birleştirir. Sırasız veride "10-26" iki ayrı grup olur; önce sorted ile sıralamak gerekir.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Log seviyesi WARNING iken hangi satırlar görünür?',
      code: 'import logging, sys\nlogging.basicConfig(stream=sys.stdout, level=logging.WARNING, format="%(levelname)s:%(message)s", force=True)\nlog = logging.getLogger("rapor")\nlog.debug("ayrıntı")\nlog.info("12 satır okundu")\nlog.warning("%d satır atlandı", 2)\nlog.error("CSV yok")\n',
      o: ['INFO:12 satır okundu\nWARNING:2 satır atlandı\nERROR:CSV yok', 'WARNING:2 satır atlandı\nERROR:CSV yok', 'ERROR:CSV yok', 'WARNING:%d satır atlandı\nERROR:CSV yok'],
      a: 1,
      why: 'Seviye eşiği WARNING olduğunda DEBUG ve INFO mesajları elenir. %d yer tutucusu kayıt yazılırken argümanla doldurulur. Cron\'da WARNING, elle denemede DEBUG seviyesi tipiktir.' },
    { t: 'order',
      stage: 'Kodu oku',
      q: '<p>Mağaza cirosunu Counter ile toplayıp en yüksek mağazayı yazdıran satırları sırala. Çıktı <code>[(\'Kadıköy\', 150.0)]</code> olmalı.</p>',
      lines: ['from collections import Counter', 'satirlar = [("Kadıköy", 120.0), ("Çankaya", 80.5), ("Kadıköy", 30.0)]', 'ciro = Counter()', 'for magaza, tutar in satirlar:', '    ciro[magaza] += tutar', 'print(ciro.most_common(1))'],
      expect: '[(\'Kadıköy\', 150.0)]\n',
      hint: 'Counter döngüden önce oluşturulmalı; olmayan anahtar 0 sayılır.',
      why: 'Counter olmayan anahtarı 0 kabul ettiği için += doğrudan çalışır. most_common(1) en büyük değeri (anahtar, değer) listesi olarak döndürür.' },
    { id: 'proje-orta-otomasyon-8',
      t: 'code',
      stage: 'Rehberli',
      diff: 1,
      q: '<p><b>Parça 1.</b> <code>klasoru_oku(klasor)</code> fonksiyonunu tamamla. Klasördeki yalnızca <code>.csv</code> dosyalarını <b>ad sırasıyla</b> oku (<code>csv.DictReader</code>, utf-8). Her satır sözlüğüne <code>"_kaynak"</code> anahtarıyla <code>"dosya_adi:satir_no"</code> ekle; satır numarası dosyadaki gerçek satırdır (başlık 1, ilk veri 2). Tüm satırları tek liste olarak döndür.</p>',
      guide: [
        'sorted(Path(klasor).glob("*.csv")) ile dosyaları sırala.',
        'Her dosyayı open(encoding="utf-8", newline="") ile aç.',
        'enumerate(csv.DictReader(f), start=2) ile satır numarasını al.',
        'satir["_kaynak"] = f"{dosya.name}:{no}" ekleyip listeye koy.'
      ],
      example: 'import csv, io\n\nmetin = "ad,puan\\nAli,5\\nAyşe,4\\n"\nfor no, satir in enumerate(csv.DictReader(io.StringIO(metin)), start=2):\n    satir["_satir"] = no\n    print(satir)\n',
      start: 'import csv\nfrom pathlib import Path\n\ndef klasoru_oku(klasor):\n    satirlar = []\n    # TODO: yalnız .csv dosyalarını ad sırasıyla gez\n    # TODO: her satıra _kaynak = "dosya:satır" ekle\n    return satirlar\n',
      sol: 'import csv\nfrom pathlib import Path\n\ndef klasoru_oku(klasor):\n    """Klasördeki tüm .csv dosyalarını ad sırasıyla okur; her satıra _kaynak ekler."""\n    satirlar = []\n    for dosya in sorted(Path(klasor).glob("*.csv")):\n        with dosya.open(encoding="utf-8", newline="") as f:\n            for no, satir in enumerate(csv.DictReader(f), start=2):\n                satir["_kaynak"] = f"{dosya.name}:{no}"\n                satirlar.append(satir)\n    return satirlar\n',
      tests: 'import tempfile\nfrom pathlib import Path\n\nBASLIK = "siparis_no,tarih,magaza,urun,kategori,adet,birim_fiyat\\n"\n\ndef ornek_klasor():\n    k = Path(tempfile.mkdtemp()) / "satis"\n    k.mkdir()\n    (k / "satis_2026-10-26.csv").write_text(BASLIK\n        + \'AM-1001,2026-10-26,Kadıköy,Türk kahvesi,İçecek,2,"89,90"\\n\'\n        + "AM-1002,2026-10-26,Çankaya,Çay,İçecek,5,45\\n"\n        + \'AM-1003,2026-10-26, Kadıköy ,Çaydanlık,Mutfak,1,"1.249,00"\\n\', encoding="utf-8")\n    (k / "satis_2026-10-27.csv").write_text(BASLIK\n        + "AM-1004,2026-10-27,Bornova,Çay,İçecek,10,45\\n"\n        + "AM-1002,2026-10-26,Çankaya,Çay,İçecek,5,45\\n"\n        + "AM-1005,2026-10-27,Çankaya,Filtre kahve,,3,120.5\\n"\n        + "AM-1006,2026-10-27,Bornova,Su,İçecek,0,7.5\\n"\n        + "X-1,2026-10-27,Konak,Su,İçecek,2,abc\\n", encoding="utf-8")\n    (k / "okubeni.txt").write_text("CSV değil, okunmamalı", encoding="utf-8")\n    return k\nk = ornek_klasor()\nsatirlar = klasoru_oku(k)\nassert len(satirlar) == 8, f"İki CSV\'de toplam 8 veri satırı var, gelen {len(satirlar)} (okubeni.txt okunmamalı)"\nassert satirlar[0]["_kaynak"] == "satis_2026-10-26.csv:2", f"İlk kaynak: {satirlar[0][\'_kaynak\']}"\nassert satirlar[3]["_kaynak"] == "satis_2026-10-27.csv:2", "Dosyalar ad sırasıyla okunmalı"\nassert satirlar[-1]["_kaynak"] == "satis_2026-10-27.csv:6"\nassert satirlar[0]["birim_fiyat"] == "89,90" and satirlar[0]["magaza"] == "Kadıköy", "Ham değerler metin olarak kalmalı; temizlik sonraki adımın işi"\nimport tempfile\nassert klasoru_oku(tempfile.mkdtemp()) == [], "Boş klasör boş liste döndürmeli"\n',
      hints: [
        'Path.glob("*.csv") yalnız CSV\'leri verir; sorted ile sırayı sabitle.',
        'DictReader satırları sözlük olarak verir; başlık satırı sayılmaz, bu yüzden start=2.',
        'with dosya.open(encoding="utf-8", newline="") as f:'
      ],
      why: 'Kaynağı satıra iliştirmek, hata raporunu eyleme dönüştürülebilir yapar. Dosya sırasını sabitlemek, aynı girdiyle her çalıştırmada aynı sonucu (ve aynı tekrar kararlarını) garanti eder.' },
    { id: 'proje-orta-otomasyon-9',
      t: 'code',
      stage: 'Rehberli',
      diff: 2,
      q: '<p><b>Parça 2.</b> <code>SatisSatiri</code> pydantic modelini tamamla:</p><ul><li>Tüm metinler kırpılsın (<code>str_strip_whitespace</code>).</li><li><code>siparis_no</code>: <code>AM-</code> + rakamlar (<code>pattern=r"^AM-\\d+$"</code>); <code>tarih</code>: date; <code>magaza</code>, <code>urun</code>: boş olamaz.</li><li><code>kategori</code>: boş ya da None gelirse <code>"Diğer"</code> (before validator).</li><li><code>adet</code>: int &gt; 0; <code>birim_fiyat</code>: float &gt; 0, virgül içeriyorsa Türkçe biçim (<code>"1.249,00"</code> → 1249.0).</li><li><code>tutar</code> özelliği (<code>@property</code>): adet × birim fiyat, 2 ondalık.</li></ul>',
      guide: [
        'model_config = ConfigDict(str_strip_whitespace=True) ekle.',
        'Kısıtları Field(pattern=..., min_length=1, gt=0) ile yaz.',
        'birim_fiyat için mode="before" validator: metinde virgül varsa noktaları sil, virgülü noktaya çevir.',
        'kategori için mode="before" validator: None ya da boş metin → "Diğer".',
        '@property tutar: round(self.adet * self.birim_fiyat, 2).'
      ],
      example: 'from pydantic import BaseModel, Field, field_validator\n\nclass Stok(BaseModel):\n    urun: str = Field(min_length=1)\n    depo: str = "Merkez"\n    miktar: int = Field(ge=0)\n\n    @field_validator("depo", mode="before")\n    @classmethod\n    def bos_depo(cls, v):\n        return v or "Merkez"\n\n    @property\n    def kritik(self):\n        return self.miktar < 10\n\ns = Stok(urun="Çay", depo="", miktar="4")\nprint(s.depo, s.kritik)\n',
      start: 'from datetime import date\nfrom pydantic import BaseModel, ConfigDict, Field, ValidationError, field_validator\n\nclass SatisSatiri(BaseModel):\n    # TODO: boşluk kırpma ayarı\n    siparis_no: str      # TODO: pattern\n    tarih: date\n    magaza: str          # TODO: boş olamaz\n    urun: str            # TODO: boş olamaz\n    kategori: str = "Diğer"\n    adet: int            # TODO: > 0\n    birim_fiyat: float   # TODO: > 0\n\n    # TODO: birim_fiyat için Türkçe ondalık validator\'ı (mode="before")\n    # TODO: kategori için boş -> "Diğer" validator\'ı\n    # TODO: tutar özelliği\n',
      sol: 'from datetime import date\nfrom pydantic import BaseModel, ConfigDict, Field, ValidationError, field_validator\n\nclass SatisSatiri(BaseModel):\n    model_config = ConfigDict(str_strip_whitespace=True)\n    siparis_no: str = Field(pattern=r"^AM-\\d+$")\n    tarih: date\n    magaza: str = Field(min_length=1)\n    urun: str = Field(min_length=1)\n    kategori: str = "Diğer"\n    adet: int = Field(gt=0)\n    birim_fiyat: float = Field(gt=0)\n\n    @field_validator("birim_fiyat", mode="before")\n    @classmethod\n    def tr_ondalik(cls, v):\n        if isinstance(v, str) and "," in v:\n            v = v.replace(".", "").replace(",", ".")\n        return v\n\n    @field_validator("kategori", mode="before")\n    @classmethod\n    def bos_kategori(cls, v):\n        if v is None or (isinstance(v, str) and not v.strip()):\n            return "Diğer"\n        return v\n\n    @property\n    def tutar(self):\n        return round(self.adet * self.birim_fiyat, 2)\n',
      tests: 'r = {"siparis_no": "AM-1003", "tarih": "2026-10-26", "magaza": " Kadıköy ", "urun": "Çaydanlık", "kategori": "", "adet": "2", "birim_fiyat": "1.249,50"}\ns = SatisSatiri.model_validate(r)\nassert s.magaza == "Kadıköy", "Mağaza adı kırpılmalı"\nassert s.kategori == "Diğer", "Boş kategori Diğer olmalı"\nassert s.birim_fiyat == 1249.5, f"1.249,50 -> 1249.5 olmalı, gelen {s.birim_fiyat}"\nassert s.tutar == 2499.0, "tutar = adet * birim_fiyat"\nassert SatisSatiri.model_validate({**r, "birim_fiyat": "120.5"}).birim_fiyat == 120.5, "Virgül yoksa nokta ondalıktır"\nassert SatisSatiri.model_validate({**r, "kategori": None}).kategori == "Diğer"\nassert SatisSatiri.model_validate({**r, "adet": 3, "birim_fiyat": 0.1}).tutar == 0.3, "tutar 2 ondalığa yuvarlanmalı"\ndef alanlar(**degisen):\n    try:\n        SatisSatiri.model_validate({**r, **degisen})\n        return []\n    except ValidationError as e:\n        return sorted(h["loc"][0] for h in e.errors())\nassert alanlar(siparis_no="X-1", adet="0") == ["adet", "siparis_no"]\nassert alanlar(magaza="   ") == ["magaza"], "Yalnız boşluktan oluşan mağaza reddedilmeli"\nassert alanlar(birim_fiyat="abc", tarih="dün") == ["birim_fiyat", "tarih"]\n',
      hints: [
        'Kırpma, min_length kontrolünden önce uygulanır; bu yüzden "   " boş metne dönüşüp reddedilir.',
        'def tr_ondalik(cls, v): if isinstance(v, str) and "," in v: v = v.replace(".", "").replace(",", ".") ; return v',
        '@property def tutar(self): return round(self.adet * self.birim_fiyat, 2)'
      ],
      why: 'Satır düzeyindeki tüm kurallar tek bir modelde toplandı: biçim düzeltme (before validator), iş kuralları (Field), türetilmiş değer (property). Model hem bu projede hem ileride bir API\'de aynen kullanılabilir.' },
    { id: 'proje-orta-otomasyon-10',
      t: 'code',
      stage: 'Rehberli',
      diff: 2,
      q: '<p><b>Parça 3.</b> <code>temizle(satirlar)</code> fonksiyonunu tamamla (model hazır). Her ham satırı (<code>_</code> ile başlayan anahtarları çıkararak) modelle doğrula ve <code>(gecerli, hatalar)</code> döndür:</p><ul><li>Geçersiz satır: <code>"{kaynak} geçersiz: {alan1,alan2}"</code> (hatalı alanlar pydantic\'in verdiği sırayla, virgülle)</li><li>Daha önce görülmüş (sipariş no, ürün) çifti: <code>"{kaynak} tekrar: {siparis_no}/{urun}"</code></li><li><code>kaynak</code> satırın <code>_kaynak</code> değeri, yoksa <code>"?"</code>.</li></ul>',
      guide: [
        'Görülen anahtarlar için boş bir küme oluştur.',
        'Her satırda kaynak = satir.get("_kaynak", "?") ve veri = {k: v ... if not k.startswith("_")}.',
        'try: model_validate; except ValidationError: alan adlarını virgülle birleştirip hata ekle, continue.',
        'anahtar = (s.siparis_no, s.urun) kümede ise tekrar hatası ekle, continue; değilse kümeye ve gecerli\'ye ekle.'
      ],
      example: 'gorulen = set()\nfor kod in ["A", "B", "A", "C", "B"]:\n    if kod in gorulen:\n        print("tekrar:", kod)\n        continue\n    gorulen.add(kod)\nprint(sorted(gorulen))\n',
      start: 'from datetime import date\nfrom pydantic import BaseModel, ConfigDict, Field, ValidationError, field_validator\n\nclass SatisSatiri(BaseModel):\n    model_config = ConfigDict(str_strip_whitespace=True)\n    siparis_no: str = Field(pattern=r"^AM-\\d+$")\n    tarih: date\n    magaza: str = Field(min_length=1)\n    urun: str = Field(min_length=1)\n    kategori: str = "Diğer"\n    adet: int = Field(gt=0)\n    birim_fiyat: float = Field(gt=0)\n\n    @field_validator("birim_fiyat", mode="before")\n    @classmethod\n    def tr_ondalik(cls, v):\n        if isinstance(v, str) and "," in v:\n            v = v.replace(".", "").replace(",", ".")\n        return v\n\n    @field_validator("kategori", mode="before")\n    @classmethod\n    def bos_kategori(cls, v):\n        if v is None or (isinstance(v, str) and not v.strip()):\n            return "Diğer"\n        return v\n\n    @property\n    def tutar(self):\n        return round(self.adet * self.birim_fiyat, 2)\n\ndef temizle(satirlar):\n    gecerli, hatalar, gorulen = [], [], set()\n    for satir in satirlar:\n        # TODO: kaynak ve _ ile başlamayan alanlardan veri sözlüğü\n        # TODO: doğrula; hatalıysa "kaynak geçersiz: alanlar"\n        # TODO: (siparis_no, urun) tekrarını yakala\n        pass\n    return gecerli, hatalar\n',
      sol: 'from datetime import date\nfrom pydantic import BaseModel, ConfigDict, Field, ValidationError, field_validator\n\nclass SatisSatiri(BaseModel):\n    model_config = ConfigDict(str_strip_whitespace=True)\n    siparis_no: str = Field(pattern=r"^AM-\\d+$")\n    tarih: date\n    magaza: str = Field(min_length=1)\n    urun: str = Field(min_length=1)\n    kategori: str = "Diğer"\n    adet: int = Field(gt=0)\n    birim_fiyat: float = Field(gt=0)\n\n    @field_validator("birim_fiyat", mode="before")\n    @classmethod\n    def tr_ondalik(cls, v):\n        if isinstance(v, str) and "," in v:\n            v = v.replace(".", "").replace(",", ".")\n        return v\n\n    @field_validator("kategori", mode="before")\n    @classmethod\n    def bos_kategori(cls, v):\n        if v is None or (isinstance(v, str) and not v.strip()):\n            return "Diğer"\n        return v\n\n    @property\n    def tutar(self):\n        return round(self.adet * self.birim_fiyat, 2)\n\ndef temizle(satirlar):\n    """(geçerli SatisSatiri listesi, hata metinleri) döndürür."""\n    gecerli, hatalar, gorulen = [], [], set()\n    for satir in satirlar:\n        kaynak = satir.get("_kaynak", "?")\n        veri = {k: v for k, v in satir.items() if not k.startswith("_")}\n        try:\n            s = SatisSatiri.model_validate(veri)\n        except ValidationError as e:\n            alanlar = ",".join(".".join(map(str, h["loc"])) for h in e.errors())\n            hatalar.append(f"{kaynak} geçersiz: {alanlar}")\n            continue\n        anahtar = (s.siparis_no, s.urun)\n        if anahtar in gorulen:\n            hatalar.append(f"{kaynak} tekrar: {s.siparis_no}/{s.urun}")\n            continue\n        gorulen.add(anahtar)\n        gecerli.append(s)\n    return gecerli, hatalar\n',
      tests: 'import tempfile\nfrom pathlib import Path\n\nBASLIK = "siparis_no,tarih,magaza,urun,kategori,adet,birim_fiyat\\n"\n\ndef ornek_klasor():\n    k = Path(tempfile.mkdtemp()) / "satis"\n    k.mkdir()\n    (k / "satis_2026-10-26.csv").write_text(BASLIK\n        + \'AM-1001,2026-10-26,Kadıköy,Türk kahvesi,İçecek,2,"89,90"\\n\'\n        + "AM-1002,2026-10-26,Çankaya,Çay,İçecek,5,45\\n"\n        + \'AM-1003,2026-10-26, Kadıköy ,Çaydanlık,Mutfak,1,"1.249,00"\\n\', encoding="utf-8")\n    (k / "satis_2026-10-27.csv").write_text(BASLIK\n        + "AM-1004,2026-10-27,Bornova,Çay,İçecek,10,45\\n"\n        + "AM-1002,2026-10-26,Çankaya,Çay,İçecek,5,45\\n"\n        + "AM-1005,2026-10-27,Çankaya,Filtre kahve,,3,120.5\\n"\n        + "AM-1006,2026-10-27,Bornova,Su,İçecek,0,7.5\\n"\n        + "X-1,2026-10-27,Konak,Su,İçecek,2,abc\\n", encoding="utf-8")\n    (k / "okubeni.txt").write_text("CSV değil, okunmamalı", encoding="utf-8")\n    return k\nimport csv\nfrom pathlib import Path\n\ndef klasoru_oku(klasor):\n    """Klasördeki tüm .csv dosyalarını ad sırasıyla okur; her satıra _kaynak ekler."""\n    satirlar = []\n    for dosya in sorted(Path(klasor).glob("*.csv")):\n        with dosya.open(encoding="utf-8", newline="") as f:\n            for no, satir in enumerate(csv.DictReader(f), start=2):\n                satir["_kaynak"] = f"{dosya.name}:{no}"\n                satirlar.append(satir)\n    return satirlar\ngecerli, hatalar = temizle(klasoru_oku(ornek_klasor()))\nassert [s.siparis_no for s in gecerli] == ["AM-1001", "AM-1002", "AM-1003", "AM-1004", "AM-1005"], f"Geçerliler: {[s.siparis_no for s in gecerli]}"\nassert hatalar == ["satis_2026-10-27.csv:3 tekrar: AM-1002/Çay", "satis_2026-10-27.csv:5 geçersiz: adet", "satis_2026-10-27.csv:6 geçersiz: siparis_no,birim_fiyat"], f"Hatalar: {hatalar}"\nassert gecerli[4].kategori == "Diğer"\nayni_siparis = [{"siparis_no": "AM-9", "tarih": "2026-10-26", "magaza": "A", "urun": u, "adet": 1, "birim_fiyat": 1} for u in ["Çay", "Su"]]\nassert len(temizle(ayni_siparis)[0]) == 2, "Aynı siparişin farklı ürünleri tekrar sayılmamalı"\nassert temizle([{"siparis_no": "AM-1"}])[1][0].startswith("? geçersiz: "), "_kaynak yoksa ? kullanılmalı"\n',
      hints: [
        '_kaynak modele girerse extra alan olur; sözlük comprehension ile çıkar.',
        '",".join(".".join(map(str, h["loc"])) for h in e.errors())',
        'Tekrar kontrolünü doğrulamadan SONRA yap; böylece " AM-1002" ile "AM-1002" kırpıldıktan sonra aynı anahtar olur.'
      ],
      why: 'Temizlik adımı hiçbir satırı sessizce kaybetmez: her atılan satır nedeniyle birlikte raporlanır. Tekrar kontrolünün doğrulanmış (kırpılmış, normalleştirilmiş) değerler üzerinde yapılması, yazım farklarından doğan gizli tekrarları da yakalar.' },
    { id: 'proje-orta-otomasyon-11',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p><b>Parça 4.</b> <code>ozetle(gecerli)</code> yaz. Her eleman <code>siparis_no, tarih (date), magaza, urun, adet, tutar</code> niteliklerine sahip. Sözlük döndürsün:</p><ul><li><code>"toplam_ciro"</code>: tutarlar toplamı, 2 ondalık</li><li><code>"satir_sayisi"</code>, <code>"siparis_sayisi"</code> (benzersiz sipariş no)</li><li><code>"magaza_ciro"</code>: <code>(mağaza, ciro)</code> listesi, ciro büyükten küçüğe, eşitlikte ada göre; ciro 2 ondalık</li><li><code>"en_cok_satan"</code>: adede göre ilk 3 <code>(ürün, adet)</code>, eşitlikte ada göre</li><li><code>"gunluk_ciro"</code>: <code>{"2026-10-26": ciro, ...}</code> tarih sıralı, 2 ondalık (<code>itertools.groupby</code> kullan)</li></ul>',
      start: 'from collections import Counter\nfrom itertools import groupby\n\ndef ozetle(gecerli):\n    pass\n',
      sol: 'from collections import Counter\nfrom itertools import groupby\n\ndef ozetle(gecerli):\n    magaza, urun_adet = Counter(), Counter()\n    for s in gecerli:\n        magaza[s.magaza] += s.tutar\n        urun_adet[s.urun] += s.adet\n    sirali = sorted(gecerli, key=lambda s: s.tarih)\n    gunluk = {t.isoformat(): round(sum(s.tutar for s in grup), 2)\n              for t, grup in groupby(sirali, key=lambda s: s.tarih)}\n    return {\n        "toplam_ciro": round(sum(magaza.values()), 2),\n        "satir_sayisi": len(gecerli),\n        "siparis_sayisi": len({s.siparis_no for s in gecerli}),\n        "magaza_ciro": sorted(((m, round(c, 2)) for m, c in magaza.items()), key=lambda x: (-x[1], x[0])),\n        "en_cok_satan": sorted(urun_adet.items(), key=lambda x: (-x[1], x[0]))[:3],\n        "gunluk_ciro": gunluk,\n    }\n',
      tests: 'from collections import namedtuple\nfrom datetime import date\nS = namedtuple("S", "siparis_no tarih magaza urun adet tutar")\nD = date.fromisoformat\nveri = [S("AM-1", D("2026-10-27"), "Kadıköy", "Çay", 5, 225.0),\n        S("AM-2", D("2026-10-26"), "Çankaya", "Kahve", 2, 179.8),\n        S("AM-2", D("2026-10-26"), "Çankaya", "Çay", 1, 45.0),\n        S("AM-3", D("2026-10-27"), "Bornova", "Su", 6, 0.1),\n        S("AM-4", D("2026-10-28"), "Bornova", "Kahve", 4, 404.7),\n        S("AM-5", D("2026-10-26"), "Konak", "Simit", 6, 0.2)]\no = ozetle(veri)\nassert o["toplam_ciro"] == 854.8, f"toplam: {o[\'toplam_ciro\']}"\nassert o["satir_sayisi"] == 6 and o["siparis_sayisi"] == 5\nassert o["magaza_ciro"] == [("Bornova", 404.8), ("Kadıköy", 225.0), ("Çankaya", 224.8), ("Konak", 0.2)], f"magaza_ciro: {o[\'magaza_ciro\']}"\nassert o["en_cok_satan"] == [("Kahve", 6), ("Simit", 6), ("Su", 6)], f"en_cok_satan: {o[\'en_cok_satan\']} (eşit adetlerde ada göre sırala)"\nassert o["gunluk_ciro"] == {"2026-10-26": 225.0, "2026-10-27": 225.1, "2026-10-28": 404.7}, f"gunluk: {o[\'gunluk_ciro\']} (sırasız veride önce tarihe göre sırala)"\nassert list(o["gunluk_ciro"]) == ["2026-10-26", "2026-10-27", "2026-10-28"]\nbos = ozetle([])\nassert bos["toplam_ciro"] == 0 and bos["magaza_ciro"] == [] and bos["gunluk_ciro"] == {}\n',
      hints: [
        'Mağaza cirosu ve ürün adedi için iki Counter; döngüde += ile topla.',
        'Sıralama anahtarı: key=lambda x: (-x[1], x[0]). most_common eşitlikleri ada göre sıralamaz.',
        'Günlük ciro: önce sorted(gecerli, key=lambda s: s.tarih), sonra groupby; anahtar t.isoformat().'
      ],
      why: 'Özet katmanı hem doğru hem kararlı olmalı: aynı girdi her zaman aynı raporu üretmeli. İkincil sıralama ölçütü ve groupby öncesi sıralama bu kararlılığı sağlar; yuvarlama float artıklarını (0.30000000000000004) rapordan uzak tutar.' },
    { id: 'proje-orta-otomasyon-12',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p><b>Parça 5.</b> <code>html_rapor(ozet, hafta, hatalar=())</code> yaz (Jinja2, autoescape açık). Çıktı satırları (her biri ayrı satırda, baş/son boşluksuz):</p><pre class="out">&lt;h1&gt;Anadolu Market | 2026-W44 haftalık satış raporu&lt;/h1&gt;\n&lt;p&gt;Toplam ciro: &lt;b&gt;2.465,30 TL&lt;/b&gt; (5 sipariş, 5 satır)&lt;/p&gt;\n&lt;table&gt;\n&lt;tr&gt;&lt;td&gt;Kadıköy&lt;/td&gt;&lt;td&gt;1.428,80 TL&lt;/td&gt;&lt;/tr&gt;   (her mağaza)\n&lt;/table&gt;\n&lt;ol&gt;\n&lt;li&gt;Çay (15 adet)&lt;/li&gt;   (en çok satanlar)\n&lt;/ol&gt;\n&lt;p&gt;Uyarı: 3 satır rapora alınmadı.&lt;/p&gt;   (yalnız hata varsa)</pre><p>Para biçimi için <code>tl</code> filtresi yaz (1.234,50 TL).</p>',
      start: 'from jinja2 import Environment\n\ndef tl(x):\n    pass\n\ndef html_rapor(ozet, hafta, hatalar=()):\n    pass\n',
      sol: 'from jinja2 import Environment\n\ndef tl(x):\n    return f"{x:,.2f}".translate(str.maketrans(",.", ".,")) + " TL"\n\nENV = Environment(autoescape=True, trim_blocks=True, lstrip_blocks=True)\nENV.filters["tl"] = tl\nRAPOR = ENV.from_string("""<h1>Anadolu Market | {{ hafta }} haftalık satış raporu</h1>\n<p>Toplam ciro: <b>{{ ozet.toplam_ciro|tl }}</b> ({{ ozet.siparis_sayisi }} sipariş, {{ ozet.satir_sayisi }} satır)</p>\n<table>\n{% for magaza, ciro in ozet.magaza_ciro %}\n<tr><td>{{ magaza }}</td><td>{{ ciro|tl }}</td></tr>\n{% endfor %}\n</table>\n<ol>\n{% for urun, adet in ozet.en_cok_satan %}\n<li>{{ urun }} ({{ adet }} adet)</li>\n{% endfor %}\n</ol>\n{% if hatalar %}\n<p>Uyarı: {{ hatalar|length }} satır rapora alınmadı.</p>\n{% endif %}""")\n\ndef html_rapor(ozet, hafta, hatalar=()):\n    return RAPOR.render(ozet=ozet, hafta=hafta, hatalar=hatalar)\n',
      tests: 'ozet = {"toplam_ciro": 2465.3, "satir_sayisi": 5, "siparis_sayisi": 5, "magaza_ciro": [("Kadıköy", 1428.8), ("Çankaya", 586.5), ("<Bornova>", 450.0)], "en_cok_satan": [("Çay", 15), ("Filtre kahve", 3)], "gunluk_ciro": {}}\nsatirlar = [s.strip() for s in html_rapor(ozet, "2026-W44", ["a", "b", "c"]).strip().splitlines()]\nbeklenen = ["<h1>Anadolu Market | 2026-W44 haftalık satış raporu</h1>", "<p>Toplam ciro: <b>2.465,30 TL</b> (5 sipariş, 5 satır)</p>", "<table>", "<tr><td>Kadıköy</td><td>1.428,80 TL</td></tr>", "<tr><td>Çankaya</td><td>586,50 TL</td></tr>", "<tr><td>&lt;Bornova&gt;</td><td>450,00 TL</td></tr>", "</table>", "<ol>", "<li>Çay (15 adet)</li>", "<li>Filtre kahve (3 adet)</li>", "</ol>", "<p>Uyarı: 3 satır rapora alınmadı.</p>"]\nassert satirlar == beklenen, f"Satırlar:\\n" + "\\n".join(satirlar)\nassert "Uyarı" not in html_rapor(ozet, "2026-W44"), "Hata yoksa uyarı paragrafı olmamalı"\nassert tl(1234567.891) == "1.234.567,89 TL"\n',
      hints: [
        'Environment(autoescape=True, trim_blocks=True, lstrip_blocks=True); filtreyi from_string\'den önce kaydet.',
        'Demet listesini for içinde aç: {% for magaza, ciro in ozet.magaza_ciro %}.',
        '{% if hatalar %}...{{ hatalar|length }}...{% endif %}'
      ],
      why: 'Sunum katmanı özet sözlüğünü alır, hiçbir hesap yapmaz. Bu sayede aynı özetten Markdown ya da PDF şablonu da üretilebilir; autoescape veri kaynaklı HTML bozulmalarını engeller.' },
    { id: 'proje-orta-otomasyon-13',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p><b>Parça 6.</b> <code>eposta_taslagi(html, ozet, hafta, alicilar)</code> yaz (<code>tl</code> hazır). <code>EmailMessage</code> döndürsün:</p><ul><li>From <code>rapor@anadolumarket.com.tr</code>, To alıcılar <code>", "</code> ile</li><li>Subject: <code>"{hafta} haftalık satış raporu - {tl(toplam)}"</code></li><li>Düz metin gövde <code>{hafta} haftasında toplam ciro {tl(toplam)}.</code> cümlesini içersin; HTML sürüm <code>add_alternative</code> ile</li><li>Ek: <code>magaza_ciro_{hafta}.csv</code>, içerik <code>magaza,ciro</code> başlığı + her mağaza için <code>Ad,1428.80</code> satırı (2 ondalık, nokta)</li></ul>',
      start: 'from email.message import EmailMessage\n\ndef tl(x):\n    return f"{x:,.2f}".translate(str.maketrans(",.", ".,")) + " TL"\n\ndef eposta_taslagi(html, ozet, hafta, alicilar):\n    pass\n',
      sol: 'def tl(x):\n    return f"{x:,.2f}".translate(str.maketrans(",.", ".,")) + " TL"\n\nfrom email.message import EmailMessage\n\ndef eposta_taslagi(html, ozet, hafta, alicilar):\n    msg = EmailMessage()\n    msg["From"] = "rapor@anadolumarket.com.tr"\n    msg["To"] = ", ".join(alicilar)\n    msg["Subject"] = f"{hafta} haftalık satış raporu - {tl(ozet[\'toplam_ciro\'])}"\n    msg.set_content(f"Merhaba,\\n\\n{hafta} haftasında toplam ciro {tl(ozet[\'toplam_ciro\'])}.\\nAyrıntılar HTML raporda ve ekteki CSV\'de.\\n")\n    msg.add_alternative(html, subtype="html")\n    satirlar = ["magaza,ciro"] + [f"{m},{c:.2f}" for m, c in ozet["magaza_ciro"]]\n    msg.add_attachment("\\n".join(satirlar) + "\\n", subtype="csv", filename=f"magaza_ciro_{hafta}.csv")\n    return msg\n',
      tests: 'ozet = {"toplam_ciro": 2465.3, "magaza_ciro": [("Kadıköy", 1428.8), ("Çankaya", 586.5)]}\nm = eposta_taslagi("<h1>Rapor</h1>", ozet, "2026-W44", ["mudur@am.com", "finans@am.com"])\nassert m["From"] == "rapor@anadolumarket.com.tr" and m["To"] == "mudur@am.com, finans@am.com"\nassert m["Subject"] == "2026-W44 haftalık satış raporu - 2.465,30 TL", f"Konu: {m[\'Subject\']}"\nassert "2026-W44 haftasında toplam ciro 2.465,30 TL." in m.get_body(("plain",)).get_content()\nassert m.get_body(("html",)).get_content().strip() == "<h1>Rapor</h1>", "HTML sürüm add_alternative ile eklenmeli"\nekler = list(m.iter_attachments())\nassert [e.get_filename() for e in ekler] == ["magaza_ciro_2026-W44.csv"], "Tek bir CSV eki olmalı"\nassert ekler[0].get_content() == "magaza,ciro\\nKadıköy,1428.80\\nÇankaya,586.50\\n", f"Ek içeriği: {ekler[0].get_content()!r}"\nassert m.get_content_type() == "multipart/mixed"\n',
      hints: [
        'Sıra: set_content (düz), add_alternative (html), add_attachment (csv).',
        'CSV satırları: ["magaza,ciro"] + [f"{m},{c:.2f}" for m, c in ozet["magaza_ciro"]].',
        'Ek metin olduğu için subtype="csv" ve filename yeterli.'
      ],
      why: 'Üç katmanlı e-posta (metin, HTML, ek) farklı okuyucuları aynı anda karşılar: mobilde düz metin, masaüstünde HTML, analizde CSV. Mesaj nesnesi gönderilmeden test edilir; dry-run\'da .eml olarak yazılabilir.' },
    { id: 'proje-orta-otomasyon-14',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p><b>Parça 7.</b> <code>arguman_ayristir(argv=None)</code> yaz (argparse):</p><ul><li><code>--klasor</code> zorunlu; <code>--hafta</code> zorunlu ve <code>YYYY-Www</code> biçiminde olmalı (<code>hafta_tipi</code> fonksiyonu <code>type=</code> ile; hatalıysa <code>argparse.ArgumentTypeError</code>)</li><li><code>--cikti</code> varsayılan <code>"cikti"</code></li><li><code>--alici</code> tekrar edilebilir, <code>args.alicilar</code> listesine (varsayılan boş)</li><li><code>--uygula</code> bayrağı (varsayılan False)</li><li><code>--log-seviye</code>: DEBUG, INFO, WARNING, ERROR (varsayılan INFO)</li></ul>',
      start: 'import argparse, re\n\ndef hafta_tipi(metin):\n    pass\n\ndef arguman_ayristir(argv=None):\n    pass\n',
      sol: 'import argparse, re\n\ndef hafta_tipi(metin):\n    if not re.fullmatch(r"\\d{4}-W\\d{2}", metin):\n        raise argparse.ArgumentTypeError(f"hafta YYYY-Www biçiminde olmalı: {metin}")\n    return metin\n\ndef arguman_ayristir(argv=None):\n    p = argparse.ArgumentParser(prog="haftalik_rapor", description="Anadolu Market haftalık satış raporu")\n    p.add_argument("--klasor", required=True, help="CSV dosyalarının klasörü")\n    p.add_argument("--hafta", required=True, type=hafta_tipi, help="ör. 2026-W44")\n    p.add_argument("--cikti", default="cikti", help="rapor klasörü")\n    p.add_argument("--alici", action="append", default=[], dest="alicilar", help="birden çok kez verilebilir")\n    p.add_argument("--uygula", action="store_true", help="dosyaları gerçekten yaz (varsayılan: dry-run)")\n    p.add_argument("--log-seviye", default="INFO", choices=["DEBUG", "INFO", "WARNING", "ERROR"])\n    return p.parse_args(argv)\n',
      tests: 'a = arguman_ayristir(["--klasor", "veri", "--hafta", "2026-W44"])\nassert (a.klasor, a.hafta, a.cikti, a.alicilar, a.uygula, a.log_seviye) == ("veri", "2026-W44", "cikti", [], False, "INFO"), f"Varsayılanlar: {vars(a)}"\nb = arguman_ayristir(["--klasor", "v", "--hafta", "2026-W01", "--alici", "a@x", "--alici", "b@x", "--uygula", "--log-seviye", "DEBUG", "--cikti", "out"])\nassert b.alicilar == ["a@x", "b@x"] and b.uygula is True and b.log_seviye == "DEBUG" and b.cikti == "out"\nimport io, contextlib\ndef hata_verir(argv):\n    try:\n        with contextlib.redirect_stderr(io.StringIO()):\n            arguman_ayristir(argv)\n        return False\n    except SystemExit as e:\n        return e.code == 2\nassert hata_verir(["--hafta", "2026-W44"]), "--klasor zorunlu olmalı"\nassert hata_verir(["--klasor", "v", "--hafta", "44. hafta"]), "Hatalı hafta biçimi reddedilmeli"\nassert hata_verir(["--klasor", "v", "--hafta", "2026-W44", "--log-seviye", "COK"]), "log seviyesi choices ile sınırlı olmalı"\ntry:\n    hafta_tipi("2026-44")\n    assert False, "hafta_tipi hatalı biçimde ArgumentTypeError fırlatmalı"\nexcept argparse.ArgumentTypeError:\n    pass\nassert hafta_tipi("2026-W09") == "2026-W09"\n',
      hints: [
        'hafta_tipi: re.fullmatch(r"\\d{4}-W\\d{2}", metin) değilse raise argparse.ArgumentTypeError(...), ise metni döndür.',
        'Tekrarlanan bayrak: action="append", default=[], dest="alicilar".',
        'Bayrak: action="store_true"; sınırlı değer: choices=[...]. parse_args(argv) argv None ise sys.argv kullanır.'
      ],
      why: 'argparse kullanıcı hatalarını programın derinliklerine inmeden, girişte yakalar ve 2 koduyla anlaşılır bir mesajla çıkar. parse_args\'a liste verebilmek CLI\'yı test edilebilir yapar.' },
    { id: 'proje-orta-otomasyon-15',
      t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      diff: 2,
      q: '<p>Bu <code>ozetle</code> sürümü üç hata içeriyor: günlük ciroda bazı günler eksik/yanlış çıkıyor, en çok satanlar her çalıştırmada farklı sırada geliyor (eşit adetlerde ada göre sıralanmalı) ve toplam ciro <code>0.30000000000000004</code> gibi değerler üretiyor. <b>Hataları bul ve düzelt.</b></p>',
      start: 'from collections import Counter\nfrom itertools import groupby\n\ndef ozetle(gecerli):\n    magaza, urun_adet = Counter(), Counter()\n    for s in gecerli:\n        magaza[s.magaza] += s.tutar\n        urun_adet[s.urun] += s.adet\n    gunluk = {t.isoformat(): round(sum(s.tutar for s in grup), 2)\n              for t, grup in groupby(gecerli, key=lambda s: s.tarih)}\n    return {\n        "toplam_ciro": sum(magaza.values()),\n        "satir_sayisi": len(gecerli),\n        "siparis_sayisi": len({s.siparis_no for s in gecerli}),\n        "magaza_ciro": sorted(((m, round(c, 2)) for m, c in magaza.items()), key=lambda x: (-x[1], x[0])),\n        "en_cok_satan": urun_adet.most_common(3),\n        "gunluk_ciro": gunluk,\n    }\n',
      sol: 'from collections import Counter\nfrom itertools import groupby\n\ndef ozetle(gecerli):\n    magaza, urun_adet = Counter(), Counter()\n    for s in gecerli:\n        magaza[s.magaza] += s.tutar\n        urun_adet[s.urun] += s.adet\n    sirali = sorted(gecerli, key=lambda s: s.tarih)\n    gunluk = {t.isoformat(): round(sum(s.tutar for s in grup), 2)\n              for t, grup in groupby(sirali, key=lambda s: s.tarih)}\n    return {\n        "toplam_ciro": round(sum(magaza.values()), 2),\n        "satir_sayisi": len(gecerli),\n        "siparis_sayisi": len({s.siparis_no for s in gecerli}),\n        "magaza_ciro": sorted(((m, round(c, 2)) for m, c in magaza.items()), key=lambda x: (-x[1], x[0])),\n        "en_cok_satan": sorted(urun_adet.items(), key=lambda x: (-x[1], x[0]))[:3],\n        "gunluk_ciro": gunluk,\n    }\n',
      tests: 'from collections import namedtuple\nfrom datetime import date\nS = namedtuple("S", "siparis_no tarih magaza urun adet tutar")\nD = date.fromisoformat\nveri = [S("AM-1", D("2026-10-27"), "A", "Su", 2, 0.1), S("AM-2", D("2026-10-26"), "B", "Çay", 2, 0.2),\n        S("AM-3", D("2026-10-27"), "A", "Kahve", 2, 0.4), S("AM-4", D("2026-10-26"), "B", "Ayran", 1, 0.3)]\no = ozetle(veri)\nassert o["gunluk_ciro"] == {"2026-10-26": 0.5, "2026-10-27": 0.5}, f"gunluk: {o[\'gunluk_ciro\']} (groupby\'dan önce sıralama gerekir)"\nassert o["en_cok_satan"] == [("Kahve", 2), ("Su", 2), ("Çay", 2)], f"en_cok_satan: {o[\'en_cok_satan\']}"\nassert o["toplam_ciro"] == 1.0, f"toplam: {o[\'toplam_ciro\']!r} (2 ondalığa yuvarla)"\n',
      hints: ['groupby yalnızca ardışık eşit anahtarları gruplar.', 'most_common eşitlikleri ekleme sırasında bırakır; sorted(..., key=lambda x: (-x[1], x[0]))[:3] kullan.', 'Toplamı round(..., 2) ile yuvarla.'],
      why: 'Üç hata da "çoğu zaman doğru çalışan" türdendir: veri tarih sıralı gelirse groupby doğru görünür, eşitlik yoksa most_common doğru görünür, tutarlar tamsa toplam düzgün görünür. Bu yüzden testlerde bilerek sırasız veri, eşitlik ve kayan nokta değerleri kullanılır.' },
    { id: 'proje-orta-otomasyon-16',
      t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      diff: 2,
      q: '<p>Zamanlayıcıda <code>--uygula False</code> yazıldığı halde dosyalar yazıldı; ayrıca iki alıcı verildiğinde yalnızca sonuncusu e-postaya eklendi. <b>Argüman tanımlarındaki iki hatayı bul ve düzelt.</b> (<code>--uygula</code> değer almayan bir bayrak olmalı; <code>--alici</code> tekrar edilebilmeli ve <code>args.alicilar</code> liste olmalı.)</p>',
      start: 'import argparse\n\ndef arguman_ayristir(argv=None):\n    p = argparse.ArgumentParser(prog="haftalik_rapor")\n    p.add_argument("--klasor", required=True)\n    p.add_argument("--hafta", required=True)\n    p.add_argument("--alici", dest="alicilar", default=[])\n    p.add_argument("--uygula", type=bool, default=False)\n    return p.parse_args(argv)\n',
      sol: 'import argparse\n\ndef arguman_ayristir(argv=None):\n    p = argparse.ArgumentParser(prog="haftalik_rapor")\n    p.add_argument("--klasor", required=True)\n    p.add_argument("--hafta", required=True)\n    p.add_argument("--alici", dest="alicilar", action="append", default=[])\n    p.add_argument("--uygula", action="store_true")\n    return p.parse_args(argv)\n',
      tests: 'import io, contextlib\nT = ["--klasor", "v", "--hafta", "2026-W44"]\nassert arguman_ayristir(T).uygula is False\nassert arguman_ayristir(T + ["--uygula"]).uygula is True, "--uygula değer almadan True yapmalı (store_true)"\ntry:\n    with contextlib.redirect_stderr(io.StringIO()):\n        r = arguman_ayristir(T + ["--uygula", "False"])\n    assert False, f"--uygula False artık kabul edilmemeli (bayrak değer almaz); gelen uygula={r.uygula}"\nexcept SystemExit:\n    pass\nassert arguman_ayristir(T + ["--alici", "a@x", "--alici", "b@x"]).alicilar == ["a@x", "b@x"], "Tüm alıcılar listede olmalı (append)"\nassert arguman_ayristir(T).alicilar == []\n',
      hints: ['bool("False") True\'dur: boş olmayan her metin doğrudur.', 'Bayrak için action="store_true".', 'Tekrar eden seçenek için action="append".'],
      why: 'type=bool argparse\'ın en ünlü tuzağıdır ve dry-run güvenliğini tamamen ortadan kaldırır. store_true bayrağı değer almaz; "--uygula False" artık hata verir, yani yanlış kullanım fark edilir.' },
    { id: 'proje-orta-otomasyon-17',
      t: 'code',
      stage: 'Meydan okuma',
      diff: 3,
      q: '<p><b>Anomali uyarısı.</b> <code>anomaliler(gunluk_ciro, pencere=3, esik=0.3)</code> yaz. <code>gunluk_ciro</code>: <code>{"YYYY-MM-DD": ciro}</code> (sırasız gelebilir). Günleri tarih sırasıyla gez; her gün için <b>önceki en fazla <code>pencere</code> günün</b> ortalamasını referans al (ilk günün referansı yoktur, atla). Ciro referansın <code>esik</code> oranından fazla altındaysa (<code>(ref - ciro) / ref &gt; esik</code>) uyarı ekle: <code>(gun, round(ref, 2), ciro, degisim_yuzde)</code>, <code>degisim_yuzde = round((ciro - ref) / ref * 100, 1)</code>. Referans 0 ise o günü atla. Uyarı listesini döndür.</p>',
      start: 'def anomaliler(gunluk_ciro, pencere=3, esik=0.3):\n    pass\n',
      sol: 'def anomaliler(gunluk_ciro, pencere=3, esik=0.3):\n    gunler = sorted(gunluk_ciro)\n    uyarilar = []\n    for i, gun in enumerate(gunler):\n        onceki = [gunluk_ciro[g] for g in gunler[max(0, i - pencere):i]]\n        if not onceki:\n            continue\n        ref = sum(onceki) / len(onceki)\n        if ref <= 0:\n            continue\n        ciro = gunluk_ciro[gun]\n        if (ref - ciro) / ref > esik:\n            uyarilar.append((gun, round(ref, 2), ciro, round((ciro - ref) / ref * 100, 1)))\n    return uyarilar\n',
      tests: 'g = {"2026-10-29": 1000.0, "2026-10-26": 1000.0, "2026-10-27": 1200.0, "2026-10-28": 500.0, "2026-10-30": 400.0, "2026-10-31": 900.0}\nr = anomaliler(g)\nassert r == [("2026-10-28", 1100.0, 500.0, -54.5), ("2026-10-30", 900.0, 400.0, -55.6)], f"Uyarılar: {r}"\nassert anomaliler(g, pencere=1) == [("2026-10-28", 1200.0, 500.0, -58.3), ("2026-10-30", 1000.0, 400.0, -60.0)], f"pencere=1: {anomaliler(g, pencere=1)}"\nassert anomaliler(g, esik=0.6) == [], "Eşik yükselince uyarı kalmamalı"\nassert anomaliler({"2026-10-26": 0.0, "2026-10-27": 0.0}) == [], "Referans 0 ise sıfıra bölme olmamalı"\nassert anomaliler({}) == [] and anomaliler({"2026-10-26": 5.0}) == []\n',
      hints: ['ISO tarih metinleri (YYYY-MM-DD) alfabetik sıralamayla kronolojik sıralanır.', 'Önceki günler: gunler[max(0, i - pencere):i]. Boşsa (ilk gün) atla.', 'Referans 0 ya da negatifse bölme yapma; continue.'],
      why: 'Hareketli ortalamayla karşılaştırma, tek bir önceki güne göre daha az yanlış alarm üretir. Kenar durumlar (ilk gün, sıfır ciro, sırasız giriş) gerçek veride mutlaka gelir; uyarı sistemi bunlarda çökmemelidir. Raporun sonuna bu uyarıları eklemek, insanın gözden kaçırabileceği düşüşleri öne çıkarır.' },
    { id: 'proje-orta-otomasyon-18',
      t: 'code',
      stage: 'Mini proje',
      diff: 3,
      q: '<p><b>Mini proje 1: hepsini birleştir.</b> Tüm parçalar (okuma, model, temizleme, özet, HTML, e-posta, CLI) hazır verildi. <code>calistir(argv=None)</code> fonksiyonunu yaz:</p><ol><li>Argümanları ayrıştır; <code>log</code> seviyesini <code>args.log_seviye</code> yap.</li><li>Klasörü oku; satır yoksa <code>log.error</code> ile bildir ve <code>1</code> döndür. Varsa <code>log.info("%d satır okundu", n)</code>.</li><li>Temizle; her hatayı <code>log.warning</code> ile yaz. Özetle, HTML\'i ve e-posta taslağını üret (alıcı verilmediyse <code>["mudurler@anadolumarket.com.tr"]</code>).</li><li>Hedefler: <code>cikti/rapor_{hafta}.html</code> ve <code>cikti/taslak_{hafta}.eml</code>.</li><li><code>--uygula</code> yoksa her hedef için <code>log.info("[DRY-RUN] yazılacaktı: %s", ad)</code> yaz ve <code>0</code> döndür; dosya yazma.</li><li>Varsa klasörü oluştur, HTML\'i (utf-8) ve <code>bytes(msg)</code>\'ı yaz, <code>0</code> döndür.</li></ol>',
      start: 'import csv\nfrom pathlib import Path\n\ndef klasoru_oku(klasor):\n    """Klasördeki tüm .csv dosyalarını ad sırasıyla okur; her satıra _kaynak ekler."""\n    satirlar = []\n    for dosya in sorted(Path(klasor).glob("*.csv")):\n        with dosya.open(encoding="utf-8", newline="") as f:\n            for no, satir in enumerate(csv.DictReader(f), start=2):\n                satir["_kaynak"] = f"{dosya.name}:{no}"\n                satirlar.append(satir)\n    return satirlar\n\nfrom datetime import date\nfrom pydantic import BaseModel, ConfigDict, Field, ValidationError, field_validator\n\nclass SatisSatiri(BaseModel):\n    model_config = ConfigDict(str_strip_whitespace=True)\n    siparis_no: str = Field(pattern=r"^AM-\\d+$")\n    tarih: date\n    magaza: str = Field(min_length=1)\n    urun: str = Field(min_length=1)\n    kategori: str = "Diğer"\n    adet: int = Field(gt=0)\n    birim_fiyat: float = Field(gt=0)\n\n    @field_validator("birim_fiyat", mode="before")\n    @classmethod\n    def tr_ondalik(cls, v):\n        if isinstance(v, str) and "," in v:\n            v = v.replace(".", "").replace(",", ".")\n        return v\n\n    @field_validator("kategori", mode="before")\n    @classmethod\n    def bos_kategori(cls, v):\n        if v is None or (isinstance(v, str) and not v.strip()):\n            return "Diğer"\n        return v\n\n    @property\n    def tutar(self):\n        return round(self.adet * self.birim_fiyat, 2)\n\ndef temizle(satirlar):\n    """(geçerli SatisSatiri listesi, hata metinleri) döndürür."""\n    gecerli, hatalar, gorulen = [], [], set()\n    for satir in satirlar:\n        kaynak = satir.get("_kaynak", "?")\n        veri = {k: v for k, v in satir.items() if not k.startswith("_")}\n        try:\n            s = SatisSatiri.model_validate(veri)\n        except ValidationError as e:\n            alanlar = ",".join(".".join(map(str, h["loc"])) for h in e.errors())\n            hatalar.append(f"{kaynak} geçersiz: {alanlar}")\n            continue\n        anahtar = (s.siparis_no, s.urun)\n        if anahtar in gorulen:\n            hatalar.append(f"{kaynak} tekrar: {s.siparis_no}/{s.urun}")\n            continue\n        gorulen.add(anahtar)\n        gecerli.append(s)\n    return gecerli, hatalar\n\nfrom collections import Counter\nfrom itertools import groupby\n\ndef ozetle(gecerli):\n    magaza, urun_adet = Counter(), Counter()\n    for s in gecerli:\n        magaza[s.magaza] += s.tutar\n        urun_adet[s.urun] += s.adet\n    sirali = sorted(gecerli, key=lambda s: s.tarih)\n    gunluk = {t.isoformat(): round(sum(s.tutar for s in grup), 2)\n              for t, grup in groupby(sirali, key=lambda s: s.tarih)}\n    return {\n        "toplam_ciro": round(sum(magaza.values()), 2),\n        "satir_sayisi": len(gecerli),\n        "siparis_sayisi": len({s.siparis_no for s in gecerli}),\n        "magaza_ciro": sorted(((m, round(c, 2)) for m, c in magaza.items()), key=lambda x: (-x[1], x[0])),\n        "en_cok_satan": sorted(urun_adet.items(), key=lambda x: (-x[1], x[0]))[:3],\n        "gunluk_ciro": gunluk,\n    }\n\nfrom jinja2 import Environment\n\ndef tl(x):\n    return f"{x:,.2f}".translate(str.maketrans(",.", ".,")) + " TL"\n\nENV = Environment(autoescape=True, trim_blocks=True, lstrip_blocks=True)\nENV.filters["tl"] = tl\nRAPOR = ENV.from_string("""<h1>Anadolu Market | {{ hafta }} haftalık satış raporu</h1>\n<p>Toplam ciro: <b>{{ ozet.toplam_ciro|tl }}</b> ({{ ozet.siparis_sayisi }} sipariş, {{ ozet.satir_sayisi }} satır)</p>\n<table>\n{% for magaza, ciro in ozet.magaza_ciro %}\n<tr><td>{{ magaza }}</td><td>{{ ciro|tl }}</td></tr>\n{% endfor %}\n</table>\n<ol>\n{% for urun, adet in ozet.en_cok_satan %}\n<li>{{ urun }} ({{ adet }} adet)</li>\n{% endfor %}\n</ol>\n{% if hatalar %}\n<p>Uyarı: {{ hatalar|length }} satır rapora alınmadı.</p>\n{% endif %}""")\n\ndef html_rapor(ozet, hafta, hatalar=()):\n    return RAPOR.render(ozet=ozet, hafta=hafta, hatalar=hatalar)\n\nfrom email.message import EmailMessage\n\ndef eposta_taslagi(html, ozet, hafta, alicilar):\n    msg = EmailMessage()\n    msg["From"] = "rapor@anadolumarket.com.tr"\n    msg["To"] = ", ".join(alicilar)\n    msg["Subject"] = f"{hafta} haftalık satış raporu - {tl(ozet[\'toplam_ciro\'])}"\n    msg.set_content(f"Merhaba,\\n\\n{hafta} haftasında toplam ciro {tl(ozet[\'toplam_ciro\'])}.\\nAyrıntılar HTML raporda ve ekteki CSV\'de.\\n")\n    msg.add_alternative(html, subtype="html")\n    satirlar = ["magaza,ciro"] + [f"{m},{c:.2f}" for m, c in ozet["magaza_ciro"]]\n    msg.add_attachment("\\n".join(satirlar) + "\\n", subtype="csv", filename=f"magaza_ciro_{hafta}.csv")\n    return msg\n\nimport argparse, re\n\ndef hafta_tipi(metin):\n    if not re.fullmatch(r"\\d{4}-W\\d{2}", metin):\n        raise argparse.ArgumentTypeError(f"hafta YYYY-Www biçiminde olmalı: {metin}")\n    return metin\n\ndef arguman_ayristir(argv=None):\n    p = argparse.ArgumentParser(prog="haftalik_rapor", description="Anadolu Market haftalık satış raporu")\n    p.add_argument("--klasor", required=True, help="CSV dosyalarının klasörü")\n    p.add_argument("--hafta", required=True, type=hafta_tipi, help="ör. 2026-W44")\n    p.add_argument("--cikti", default="cikti", help="rapor klasörü")\n    p.add_argument("--alici", action="append", default=[], dest="alicilar", help="birden çok kez verilebilir")\n    p.add_argument("--uygula", action="store_true", help="dosyaları gerçekten yaz (varsayılan: dry-run)")\n    p.add_argument("--log-seviye", default="INFO", choices=["DEBUG", "INFO", "WARNING", "ERROR"])\n    return p.parse_args(argv)\n\nimport logging\n\nlog = logging.getLogger("haftalik_rapor")\n\ndef calistir(argv=None):\n    pass\n',
      sol: 'import csv\nfrom pathlib import Path\n\ndef klasoru_oku(klasor):\n    """Klasördeki tüm .csv dosyalarını ad sırasıyla okur; her satıra _kaynak ekler."""\n    satirlar = []\n    for dosya in sorted(Path(klasor).glob("*.csv")):\n        with dosya.open(encoding="utf-8", newline="") as f:\n            for no, satir in enumerate(csv.DictReader(f), start=2):\n                satir["_kaynak"] = f"{dosya.name}:{no}"\n                satirlar.append(satir)\n    return satirlar\n\nfrom datetime import date\nfrom pydantic import BaseModel, ConfigDict, Field, ValidationError, field_validator\n\nclass SatisSatiri(BaseModel):\n    model_config = ConfigDict(str_strip_whitespace=True)\n    siparis_no: str = Field(pattern=r"^AM-\\d+$")\n    tarih: date\n    magaza: str = Field(min_length=1)\n    urun: str = Field(min_length=1)\n    kategori: str = "Diğer"\n    adet: int = Field(gt=0)\n    birim_fiyat: float = Field(gt=0)\n\n    @field_validator("birim_fiyat", mode="before")\n    @classmethod\n    def tr_ondalik(cls, v):\n        if isinstance(v, str) and "," in v:\n            v = v.replace(".", "").replace(",", ".")\n        return v\n\n    @field_validator("kategori", mode="before")\n    @classmethod\n    def bos_kategori(cls, v):\n        if v is None or (isinstance(v, str) and not v.strip()):\n            return "Diğer"\n        return v\n\n    @property\n    def tutar(self):\n        return round(self.adet * self.birim_fiyat, 2)\n\ndef temizle(satirlar):\n    """(geçerli SatisSatiri listesi, hata metinleri) döndürür."""\n    gecerli, hatalar, gorulen = [], [], set()\n    for satir in satirlar:\n        kaynak = satir.get("_kaynak", "?")\n        veri = {k: v for k, v in satir.items() if not k.startswith("_")}\n        try:\n            s = SatisSatiri.model_validate(veri)\n        except ValidationError as e:\n            alanlar = ",".join(".".join(map(str, h["loc"])) for h in e.errors())\n            hatalar.append(f"{kaynak} geçersiz: {alanlar}")\n            continue\n        anahtar = (s.siparis_no, s.urun)\n        if anahtar in gorulen:\n            hatalar.append(f"{kaynak} tekrar: {s.siparis_no}/{s.urun}")\n            continue\n        gorulen.add(anahtar)\n        gecerli.append(s)\n    return gecerli, hatalar\n\nfrom collections import Counter\nfrom itertools import groupby\n\ndef ozetle(gecerli):\n    magaza, urun_adet = Counter(), Counter()\n    for s in gecerli:\n        magaza[s.magaza] += s.tutar\n        urun_adet[s.urun] += s.adet\n    sirali = sorted(gecerli, key=lambda s: s.tarih)\n    gunluk = {t.isoformat(): round(sum(s.tutar for s in grup), 2)\n              for t, grup in groupby(sirali, key=lambda s: s.tarih)}\n    return {\n        "toplam_ciro": round(sum(magaza.values()), 2),\n        "satir_sayisi": len(gecerli),\n        "siparis_sayisi": len({s.siparis_no for s in gecerli}),\n        "magaza_ciro": sorted(((m, round(c, 2)) for m, c in magaza.items()), key=lambda x: (-x[1], x[0])),\n        "en_cok_satan": sorted(urun_adet.items(), key=lambda x: (-x[1], x[0]))[:3],\n        "gunluk_ciro": gunluk,\n    }\n\nfrom jinja2 import Environment\n\ndef tl(x):\n    return f"{x:,.2f}".translate(str.maketrans(",.", ".,")) + " TL"\n\nENV = Environment(autoescape=True, trim_blocks=True, lstrip_blocks=True)\nENV.filters["tl"] = tl\nRAPOR = ENV.from_string("""<h1>Anadolu Market | {{ hafta }} haftalık satış raporu</h1>\n<p>Toplam ciro: <b>{{ ozet.toplam_ciro|tl }}</b> ({{ ozet.siparis_sayisi }} sipariş, {{ ozet.satir_sayisi }} satır)</p>\n<table>\n{% for magaza, ciro in ozet.magaza_ciro %}\n<tr><td>{{ magaza }}</td><td>{{ ciro|tl }}</td></tr>\n{% endfor %}\n</table>\n<ol>\n{% for urun, adet in ozet.en_cok_satan %}\n<li>{{ urun }} ({{ adet }} adet)</li>\n{% endfor %}\n</ol>\n{% if hatalar %}\n<p>Uyarı: {{ hatalar|length }} satır rapora alınmadı.</p>\n{% endif %}""")\n\ndef html_rapor(ozet, hafta, hatalar=()):\n    return RAPOR.render(ozet=ozet, hafta=hafta, hatalar=hatalar)\n\nfrom email.message import EmailMessage\n\ndef eposta_taslagi(html, ozet, hafta, alicilar):\n    msg = EmailMessage()\n    msg["From"] = "rapor@anadolumarket.com.tr"\n    msg["To"] = ", ".join(alicilar)\n    msg["Subject"] = f"{hafta} haftalık satış raporu - {tl(ozet[\'toplam_ciro\'])}"\n    msg.set_content(f"Merhaba,\\n\\n{hafta} haftasında toplam ciro {tl(ozet[\'toplam_ciro\'])}.\\nAyrıntılar HTML raporda ve ekteki CSV\'de.\\n")\n    msg.add_alternative(html, subtype="html")\n    satirlar = ["magaza,ciro"] + [f"{m},{c:.2f}" for m, c in ozet["magaza_ciro"]]\n    msg.add_attachment("\\n".join(satirlar) + "\\n", subtype="csv", filename=f"magaza_ciro_{hafta}.csv")\n    return msg\n\nimport argparse, re\n\ndef hafta_tipi(metin):\n    if not re.fullmatch(r"\\d{4}-W\\d{2}", metin):\n        raise argparse.ArgumentTypeError(f"hafta YYYY-Www biçiminde olmalı: {metin}")\n    return metin\n\ndef arguman_ayristir(argv=None):\n    p = argparse.ArgumentParser(prog="haftalik_rapor", description="Anadolu Market haftalık satış raporu")\n    p.add_argument("--klasor", required=True, help="CSV dosyalarının klasörü")\n    p.add_argument("--hafta", required=True, type=hafta_tipi, help="ör. 2026-W44")\n    p.add_argument("--cikti", default="cikti", help="rapor klasörü")\n    p.add_argument("--alici", action="append", default=[], dest="alicilar", help="birden çok kez verilebilir")\n    p.add_argument("--uygula", action="store_true", help="dosyaları gerçekten yaz (varsayılan: dry-run)")\n    p.add_argument("--log-seviye", default="INFO", choices=["DEBUG", "INFO", "WARNING", "ERROR"])\n    return p.parse_args(argv)\n\nimport logging\n\nlog = logging.getLogger("haftalik_rapor")\n\ndef calistir(argv=None):\n    args = arguman_ayristir(argv)\n    log.setLevel(args.log_seviye)\n    satirlar = klasoru_oku(args.klasor)\n    if not satirlar:\n        log.error("klasörde CSV satırı yok: %s", args.klasor)\n        return 1\n    log.info("%d satır okundu", len(satirlar))\n    gecerli, hatalar = temizle(satirlar)\n    for h in hatalar:\n        log.warning(h)\n    ozet = ozetle(gecerli)\n    html = html_rapor(ozet, args.hafta, hatalar)\n    msg = eposta_taslagi(html, ozet, args.hafta, args.alicilar or ["mudurler@anadolumarket.com.tr"])\n    cikti = Path(args.cikti)\n    hedefler = [cikti / f"rapor_{args.hafta}.html", cikti / f"taslak_{args.hafta}.eml"]\n    if not args.uygula:\n        for h in hedefler:\n            log.info("[DRY-RUN] yazılacaktı: %s", h.name)\n        return 0\n    cikti.mkdir(parents=True, exist_ok=True)\n    hedefler[0].write_text(html, encoding="utf-8")\n    hedefler[1].write_bytes(bytes(msg))\n    log.info("yazıldı: %s", ", ".join(h.name for h in hedefler))\n    return 0\n',
      tests: 'import tempfile\nfrom pathlib import Path\n\nBASLIK = "siparis_no,tarih,magaza,urun,kategori,adet,birim_fiyat\\n"\n\ndef ornek_klasor():\n    k = Path(tempfile.mkdtemp()) / "satis"\n    k.mkdir()\n    (k / "satis_2026-10-26.csv").write_text(BASLIK\n        + \'AM-1001,2026-10-26,Kadıköy,Türk kahvesi,İçecek,2,"89,90"\\n\'\n        + "AM-1002,2026-10-26,Çankaya,Çay,İçecek,5,45\\n"\n        + \'AM-1003,2026-10-26, Kadıköy ,Çaydanlık,Mutfak,1,"1.249,00"\\n\', encoding="utf-8")\n    (k / "satis_2026-10-27.csv").write_text(BASLIK\n        + "AM-1004,2026-10-27,Bornova,Çay,İçecek,10,45\\n"\n        + "AM-1002,2026-10-26,Çankaya,Çay,İçecek,5,45\\n"\n        + "AM-1005,2026-10-27,Çankaya,Filtre kahve,,3,120.5\\n"\n        + "AM-1006,2026-10-27,Bornova,Su,İçecek,0,7.5\\n"\n        + "X-1,2026-10-27,Konak,Su,İçecek,2,abc\\n", encoding="utf-8")\n    (k / "okubeni.txt").write_text("CSV değil, okunmamalı", encoding="utf-8")\n    return k\nimport logging, email\nfrom email import policy\nclass Toplayici(logging.Handler):\n    def __init__(self):\n        super().__init__()\n        self.kayitlar = []\n    def emit(self, r):\n        self.kayitlar.append((r.levelname, r.getMessage()))\nt = Toplayici()\nlogging.getLogger("haftalik_rapor").addHandler(t)\nk = ornek_klasor()\ncikti = k.parent / "cikti"\nkod = calistir(["--klasor", str(k), "--hafta", "2026-W44", "--cikti", str(cikti)])\nassert kod == 0, "Dry-run başarılı olmalı (0)"\nassert not cikti.exists(), "Dry-run\'da çıktı klasörü bile oluşturulmamalı"\nassert ("INFO", "8 satır okundu") in t.kayitlar, f"Loglar: {t.kayitlar}"\nassert ("WARNING", "satis_2026-10-27.csv:3 tekrar: AM-1002/Çay") in t.kayitlar, "Her hata WARNING olarak loglanmalı"\nassert ("INFO", "[DRY-RUN] yazılacaktı: rapor_2026-W44.html") in t.kayitlar and ("INFO", "[DRY-RUN] yazılacaktı: taslak_2026-W44.eml") in t.kayitlar\nt.kayitlar.clear()\nkod = calistir(["--klasor", str(k), "--hafta", "2026-W44", "--cikti", str(cikti), "--uygula", "--alici", "bolge@am.com", "--log-seviye", "WARNING"])\nassert kod == 0 and sorted(p.name for p in cikti.iterdir()) == ["rapor_2026-W44.html", "taslak_2026-W44.eml"], "--uygula ile iki dosya yazılmalı"\nassert all(sev != "INFO" for sev, _ in t.kayitlar), "WARNING seviyesinde INFO logları görünmemeli"\nhtml = (cikti / "rapor_2026-W44.html").read_text(encoding="utf-8")\nassert "2.465,30 TL" in html and "<td>Kadıköy</td><td>1.428,80 TL</td>" in html, "Rapor doğru toplamı içermeli"\nmsg = email.message_from_bytes((cikti / "taslak_2026-W44.eml").read_bytes(), policy=policy.default)\nassert msg["To"] == "bolge@am.com" and msg["Subject"] == "2026-W44 haftalık satış raporu - 2.465,30 TL", f"Taslak başlıkları: {msg[\'To\']} | {msg[\'Subject\']}"\nimport tempfile\nbos = Path(tempfile.mkdtemp())\nassert calistir(["--klasor", str(bos), "--hafta", "2026-W44", "--cikti", str(bos / "c")]) == 1, "CSV yoksa çıkış kodu 1"\nassert t.kayitlar[-1][0] == "ERROR"\n',
      hints: [
        'Sıra: ayrıştır → oku → (boşsa 1) → temizle → logla → özetle → html → e-posta → hedefler.',
        'Dry-run dalında erken return 0; mkdir ve write çağrıları bu dalın SONRASINDA olmalı.',
        '.eml için hedef.write_bytes(bytes(msg)); HTML için write_text(html, encoding="utf-8").'
      ],
      why: 'calistir, saf parçaları bir araya getiren ince bir orkestratördür: tüm yan etkiler ve kararlar (dry-run, log, çıkış kodu) burada, görünür ve test edilebilir biçimde durur. Testin log kayıtlarını bir Handler ile toplaması, gözlemlenebilirliğin de test edilebileceğini gösterir.' },
    { id: 'proje-orta-otomasyon-19',
      t: 'code',
      stage: 'Mini proje',
      diff: 3,
      q: '<p><b>Mini proje 2: haftalık karşılaştırma.</b> İki haftanın mağaza cirolarını (<code>{magaza: ciro}</code>) karşılaştır.</p><ol><li><code>karsilastir(bu_hafta, gecen_hafta)</code>: her mağaza (iki haftadan herhangi birinde olan) için <code>{"magaza", "gecen", "bu", "degisim"}</code> sözlüğü üretsin. Olmayan hafta 0 sayılır. <code>degisim = round((bu - gecen) / gecen * 100, 1)</code>; geçen hafta 0 ise <code>None</code> (yeni mağaza). Sıralama: değişime göre <b>küçükten büyüğe</b> (en kötü üstte), <code>None</code>\'lar en sonda, eşitlikte mağaza adına göre.</li><li><code>karsilastirma_md(liste)</code>: Jinja ile Markdown tablo üretsin:<pre class="out">| Mağaza | Geçen | Bu | Değişim |\n|---|---:|---:|---:|\n| Bornova | 900.00 | 450.00 | %-50.0 |\n| Konak | 0.00 | 120.00 | yeni |</pre>Değişim pozitifse <code>%+12.5</code> biçiminde işaretli yazılsın (<code>"%+.1f"</code>); sonda satır sonu olmasın.</li></ol>',
      start: 'from jinja2 import Environment\n\ndef karsilastir(bu_hafta, gecen_hafta):\n    pass\n\ndef karsilastirma_md(liste):\n    pass\n',
      sol: 'from jinja2 import Environment\n\ndef karsilastir(bu_hafta, gecen_hafta):\n    sonuc = []\n    for m in set(bu_hafta) | set(gecen_hafta):\n        bu, gecen = bu_hafta.get(m, 0.0), gecen_hafta.get(m, 0.0)\n        degisim = round((bu - gecen) / gecen * 100, 1) if gecen else None\n        sonuc.append({"magaza": m, "gecen": gecen, "bu": bu, "degisim": degisim})\n    sonuc.sort(key=lambda r: (r["degisim"] is None, r["degisim"] or 0, r["magaza"]))\n    return sonuc\n\nENV = Environment(trim_blocks=True, lstrip_blocks=True)\nMD = ENV.from_string("""| Mağaza | Geçen | Bu | Değişim |\n|---|---:|---:|---:|\n{% for r in liste %}\n| {{ r.magaza }} | {{ "%.2f"|format(r.gecen) }} | {{ "%.2f"|format(r.bu) }} | {{ "yeni" if r.degisim is none else "%" ~ ("%+.1f"|format(r.degisim)) }} |\n{% endfor %}""")\n\ndef karsilastirma_md(liste):\n    return MD.render(liste=liste).rstrip("\\n")\n',
      tests: 'bu = {"Kadıköy": 1428.8, "Çankaya": 586.5, "Bornova": 450.0, "Konak": 120.0}\ngecen = {"Kadıköy": 1270.0, "Çankaya": 586.5, "Bornova": 900.0, "Karşıyaka": 300.0}\nk = karsilastir(bu, gecen)\nassert [r["magaza"] for r in k] == ["Karşıyaka", "Bornova", "Çankaya", "Kadıköy", "Konak"], f"Sıra: {[r[\'magaza\'] for r in k]}"\nassert k[0] == {"magaza": "Karşıyaka", "gecen": 300.0, "bu": 0.0, "degisim": -100.0}, f"Kapanan mağaza: {k[0]}"\nassert k[3]["degisim"] == 12.5 and k[2]["degisim"] == 0.0 and k[4]["degisim"] is None\nmd = karsilastirma_md(k)\nassert md.split("\\n") == ["| Mağaza | Geçen | Bu | Değişim |", "|---|---:|---:|---:|", "| Karşıyaka | 300.00 | 0.00 | %-100.0 |", "| Bornova | 900.00 | 450.00 | %-50.0 |", "| Çankaya | 586.50 | 586.50 | %+0.0 |", "| Kadıköy | 1270.00 | 1428.80 | %+12.5 |", "| Konak | 0.00 | 120.00 | yeni |"], "Markdown:\\n" + md\nassert karsilastir({}, {}) == [] and karsilastirma_md([]) == "| Mağaza | Geçen | Bu | Değişim |\\n|---|---:|---:|---:|"\n',
      hints: [
        'Mağaza kümesi: set(bu_hafta) | set(gecen_hafta); eksik değer .get(m, 0.0).',
        'None\'ları sona atmak için sıralama anahtarının ilk elemanı r["degisim"] is None olsun (False < True).',
        'Jinja\'da koşullu ifade: {{ "yeni" if r.degisim is none else ... }}; metin birleştirme ~ ile.'
      ],
      why: 'Haftalık rapora "geçen haftaya göre" sütunu eklemek, mutlak rakamları anlamlı hale getirir. Yeni ve kapanan mağazalar, sıfıra bölme ve None sıralaması gerçek karşılaştırmaların kaçınılmaz kenar durumlarıdır; en kötü değişimi en üste koymak yöneticinin dikkatini doğru yere çeker.' }
  ],
  faq: [
    { q: 'Neden pydantic yerine dataclass kullanmadık?',
      a: 'Veri dışarıdan (CSV) geldiği için doğrulama ve tip dönüşümü gerekiyor; pydantic bunu modelde bildirimsel olarak yapar. Bağımlılık istemiyorsan dataclass + __post_init__ içinde elle denetim de olur ama kod uzar ve hata raporu yapılandırılmış olmaz.' },
    { q: 'Hafta bilgisini neden argümanla veriyoruz, tarihten hesaplamıyoruz?',
      a: 'Geçmiş bir haftanın raporunu yeniden üretebilmek (ör. veri düzeltildikten sonra) için. Cron satırında date +%G-W%V ile o haftanın ISO numarası otomatik verilebilir; Python\'da date.isocalendar() aynı bilgiyi verir.' },
    { q: 'calistir neden sys.exit yerine çıkış kodu döndürüyor?',
      a: 'Döndürülen kod test edilebilir; sys.exit testte süreci sonlandırır. Betiğin en altında sys.exit(calistir()) yazarak kodu işletim sistemine iletirsin.' },
    { q: 'Dry-run modunda e-postayı neden yine de oluşturuyoruz?',
      a: 'Dry-run\'ın amacı gerçek çalıştırmanın birebir provasıdır: şablon hatası, eksik alan ya da bozuk veri dry-run\'da da ortaya çıkmalı. Yalnızca dosya yazma ve gönderme gibi yan etkiler atlanır.' },
    { q: 'Projeyi portfolyomda nasıl sunarım?',
      a: 'GitHub deposunda README (problem, mimari şeması, nasıl çalıştırılır), örnek veri klasörü, pytest testleri ve örnek HTML rapor ekran görüntüsü olsun. Sonra yeni özellikler ekle: haftalık karşılaştırma, anomali uyarısı, PDF çıktısı.' }
  ],
  mistakes: [
    { why: 'type=bool metni bool()\'a verir; "--uygula False" bile True olur. Bayraklar için store_true kullan.',
      bad: 'p.add_argument("--uygula", type=bool, default=False)',
      good: 'p.add_argument("--uygula", action="store_true")' },
    { why: 'groupby yalnızca ardışık eşit anahtarları gruplar; sırasız veride aynı gün birden çok grup olur ve sözlükte sonuncusu öncekileri ezer.',
      bad: 'gunluk = {t: sum(...) for t, g in groupby(satirlar, key=lambda s: s.tarih)}',
      good: 'sirali = sorted(satirlar, key=lambda s: s.tarih)\ngunluk = {t: sum(...) for t, g in groupby(sirali, key=lambda s: s.tarih)}' },
    { why: 'Klasöre karışan .txt, .xlsx ya da gizli dosyalar okunmaya çalışılır; iterdir sırası da işletim sistemine göre değişir.',
      bad: 'for dosya in Path(klasor).iterdir():\n    oku(dosya)',
      good: 'for dosya in sorted(Path(klasor).glob("*.csv")):\n    oku(dosya)' },
    { why: 'most_common eşitlikleri ekleme sırasına göre bırakır; dosya sırası değişince rapor değişir. Ada göre ikincil sıralama sonucu kararlı yapar.',
      bad: 'en_iyi = urun_adet.most_common(3)',
      good: 'en_iyi = sorted(urun_adet.items(), key=lambda x: (-x[1], x[0]))[:3]' },
    { why: 'Dry-run dalı erken dönmezse yan etki yine gerçekleşir. Yan etkileri tek bir yerde, dry-run kontrolünün arkasında topla.',
      bad: 'if not args.uygula:\n    log.info("dry-run")\nhedef.write_text(html)',
      good: 'if not args.uygula:\n    log.info("dry-run")\n    return 0\nhedef.write_text(html)' }
  ] }
);
})(window);
