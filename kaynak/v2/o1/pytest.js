/* Kesit Python — Orta: pytest ile test */
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push({
  id: 'pytest',
  lv: 'orta',
  mod: 'Kalite ve Proje',
  min: 45,
  title: 'pytest ile test: fixture, parametrize ve gerçek proje düzeni',
  sum: 'pytest\'in test keşfini, düz assert ve assert yeniden yazımını, pytest.raises ve pytest.approx\'u, fixture (scope, yield ile temizlik), parametrize, conftest.py, skip/xfail işaretlerini, tmp_path, monkeypatch ve capsys\'i, coverage ölçümünü ve komut satırı seçeneklerini öğrenirsin.',
  goals: [
    'pytest\'in hangi dosya ve fonksiyonları test olarak topladığını bilir, düz assert ile anlamlı test yazabilirim.',
    'pytest.raises ile hata, pytest.approx ile ondalıklı sonuç test edebilirim.',
    'fixture (scope ve yield ile temizlik) ve parametrize ile tekrarsız, okunur test setleri kurabilirim.',
    'tmp_path, monkeypatch ve capsys ile dosya, dış servis, ortam değişkeni ve ekran çıktısını test edebilirim.',
    'Bozuk koda karşı gerçekten başarısız olan (hata yakalayan) testler yazabilir, coverage ve -k, -x, --lf gibi seçenekleri kullanabilirim.'
  ],
  body: `
<h2>Neden pytest?</h2>
<p>Test yazma dersinde unittest ile test sınıfı kurdun, pytest tarzına da kısaca göz attın. Bugün Python ekosisteminde yeni projelerin büyük çoğunluğu <b>pytest</b> kullanır: test bir sınıf değil sıradan bir fonksiyondur, karşılaştırma için <code>self.assertEqual</code> yerine düz <code>assert</code> yazılır ve fixture sistemi test verisini hazırlamayı çok kolaylaştırır. Ilgaz Bank'ta faiz hesabını değiştiren bir geliştirici, 800 testlik paketi bir komutla çalıştırır; kırmızı çıkan test ona hangi hesaplamayı bozduğunu dakikalar içinde söyler.</p>
<p>Ama asıl ders şudur: <b>iyi test, bozuk kodda başarısız olan testtir.</b> Her zaman yeşil yanan bir test güven vermez, sadece süs olur. Bu dersin alıştırmalarında yazdığın testler önce doğru koda, sonra kasıtlı bozulmuş sürümlere karşı çalıştırılacak; bozuk sürümleri yakalayamayan test "geçmiş" sayılmayacak.</p>
<div class="note"><b>Tarayıcıda pytest</b>pytest bir komut satırı aracıdır: dosyaları tarar, testleri toplar ve raporlar. Tarayıcıda dosya taraması yerine test fonksiyonlarını doğrudan çağıracağız; <code>pytest.raises</code>, <code>pytest.approx</code>, <code>pytest.fixture</code> ve <code>pytest.mark</code> ise gerçek pytest modülünden gelir. Komut satırı örnekleri kendi bilgisayarında çalıştırman içindir.</div>

<h2>Kurulum ve test keşfi</h2>
<pre class="code"># Kendi bilgisayarında (sanal ortam etkinken)
pip install pytest pytest-cov
pytest                 # bulunduğun klasörden itibaren tüm testleri bul ve çalıştır</pre>
<p>pytest şu kurallarla test toplar (test discovery):</p>
<div class="tbl-wrap"><table>
<tr><th>Öğe</th><th>Kural</th><th>Örnek</th></tr>
<tr><td>Dosya</td><td><code>test_*.py</code> ya da <code>*_test.py</code></td><td><code>test_fiyat.py</code></td></tr>
<tr><td>Fonksiyon</td><td><code>test</code> ile başlayan</td><td><code>def test_kdv_ekle():</code></td></tr>
<tr><td>Sınıf</td><td><code>Test</code> ile başlayan, <code>__init__</code> içermeyen</td><td><code>class TestSepet:</code></td></tr>
<tr><td>Metot</td><td>Test sınıfında <code>test</code> ile başlayan</td><td><code>def test_toplam(self):</code></td></tr>
</table></div>
<p>Tipik proje düzeni:</p>
<pre class="out">anadolu_market/
    src/anadolu/fiyat.py
    tests/
        conftest.py          # ortak fixture'lar
        test_fiyat.py
        test_sepet.py
    pyproject.toml           # [tool.pytest.ini_options]</pre>

<h2>Düz assert ve assert yeniden yazımı</h2>
<p>pytest, test dosyalarını import ederken içlerindeki <code>assert</code> ifadelerini yeniden yazar (assertion rewriting). Bu sayede başarısız bir <code>assert toplam == 120</code> satırı yalnızca "AssertionError" demez; sol ve sağ tarafın değerlerini, listelerde farklı elemanı, sözlüklerde eksik anahtarı gösterir.</p>
<pre class="code"># tests/test_fiyat.py
from anadolu.fiyat import kdv_ekle

def test_kdv_ekle():
    assert kdv_ekle(100) == 120.0
    assert kdv_ekle(9.99) == 11.99          # yuvarlama da test edilir
    assert kdv_ekle(100, oran=0.10) == 110.0</pre>
<pre class="out">    def test_kdv_ekle():
&gt;       assert kdv_ekle(9.99) == 11.99
E       assert 11.988 == 11.99
E        +  where 11.988 = kdv_ekle(9.99)
FAILED tests/test_fiyat.py::test_kdv_ekle - assert 11.988 == 11.99</pre>
<p>Tarayıcıda aynı test fonksiyonunu doğrudan çağırabiliriz. Doğru kodda sessizce geçer; bozuk kodda AssertionError fırlatır:</p>
<pre class="py">def kdv_ekle(tutar, oran=0.20):
    return round(tutar * (1 + oran), 2)

def test_kdv_ekle():
    assert kdv_ekle(100) == 120.0
    assert kdv_ekle(9.99) == 11.99
    assert kdv_ekle(100, oran=0.10) == 110.0

test_kdv_ekle()
print("doğru sürüm: geçti")

def kdv_ekle(tutar, oran=0.20):          # yuvarlamayı unutan sürüm
    return tutar * (1 + oran)
try:
    test_kdv_ekle()
except AssertionError:
    print("bozuk sürüm: test yakaladı")</pre>
<div class="warn"><b>assert'e virgülle beklenen değer yazma</b><code>assert indirim(1000, 0.25), 750</code> "sonuç 750 mi?" diye sormaz; "sonuç doğru mu (sıfır değil mi)?" diye sorar, 750 ise hata mesajıdır. Bu test, sonuç sıfır olmadığı sürece hep geçer. Doğrusu <code>assert indirim(1000, 0.25) == 750</code>.</div>

<h2>pytest.raises ve pytest.approx</h2>
<pre class="py">import pytest

class YetersizBakiye(Exception):
    pass

def para_cek(bakiye, tutar):
    if tutar &lt;= 0:
        raise ValueError("tutar negatif ya da sıfır olamaz")
    if tutar &gt; bakiye:
        raise YetersizBakiye(f"bakiye {bakiye} TL, istenen {tutar} TL")
    return bakiye - tutar

with pytest.raises(ValueError, match="negatif"):
    para_cek(100, -5)
with pytest.raises(YetersizBakiye) as bilgi:
    para_cek(100, 250)
print("yakalanan:", bilgi.type.__name__, "|", bilgi.value)

print(0.1 + 0.2 == 0.3)                        # False: kayan nokta
print(0.1 + 0.2 == pytest.approx(0.3))         # True
print(1000 * 1.1 ** 2, 1000 * 1.1 ** 2 == pytest.approx(1210))
print([0.1 + 0.2, 1.0] == pytest.approx([0.3, 1.0]))
print(101 == pytest.approx(100, rel=0.02))     # yüzde 2 tolerans</pre>
<p><code>match</code> bir düzenli ifadedir ve hata mesajında <code>re.search</code> ile aranır. <code>with</code> bloğunda hata fırlatan satırdan <b>sonra</b> yazılan kod asla çalışmaz; bloğa yalnızca hatayı beklediğin tek çağrıyı koy. Hata hiç fırlatılmazsa <code>pytest.raises</code> testi <code>Failed: DID NOT RAISE</code> ile düşürür.</p>

<h2>Fixture: test verisini hazırlayan fonksiyon</h2>
<p>Birçok testin aynı hazırlığa ihtiyacı varsa (dolu bir sepet, örnek müşteri listesi, veritabanı bağlantısı) bunu <b>fixture</b> olarak yazarsın. Test fonksiyonu fixture'ın adını parametre olarak ister; pytest fixture'ı çalıştırıp sonucunu verir. Buna bağımlılık enjeksiyonu (dependency injection) denir.</p>
<pre class="code">import pytest
from anadolu.sepet import Sepet

@pytest.fixture
def dolu_sepet():
    s = Sepet()
    s.ekle("Çay", 50, adet=2)
    s.ekle("Şeker", 35.5)
    return s

def test_toplam(dolu_sepet):          # pytest dolu_sepet() sonucunu verir
    assert dolu_sepet.toplam() == 135.5

def test_gecersiz_adet(dolu_sepet):   # her test TAZE bir sepet alır
    with pytest.raises(ValueError):
        dolu_sepet.ekle("Kahve", 120, adet=0)</pre>
<p><b>yield ile temizlik:</b> fixture <code>return</code> yerine <code>yield</code> kullanırsa, <code>yield</code> sonrası kod test bittikten sonra (test başarısız olsa bile) çalışır. Geçici veritabanını kapatmak, dosya silmek için idealdir. <b>scope</b> fixture'ın ne sıklıkla yeniden oluşturulacağını belirler:</p>
<div class="tbl-wrap"><table>
<tr><th>scope</th><th>Ne zaman oluşturulur?</th><th>Örnek kullanım</th></tr>
<tr><td><code>"function"</code> (varsayılan)</td><td>Her test için yeniden</td><td>Değiştirilebilir sepet, sözlük</td></tr>
<tr><td><code>"class"</code></td><td>Test sınıfı başına bir kez</td><td>Sınıftaki testlerin ortak verisi</td></tr>
<tr><td><code>"module"</code></td><td>Test dosyası başına bir kez</td><td>Pahalı ama salt okunur veri</td></tr>
<tr><td><code>"session"</code></td><td>Tüm çalıştırmada bir kez</td><td>Test veritabanı, Docker konteyneri</td></tr>
</table></div>
<p>Bir fixture'ın yaşam döngüsünü tarayıcıda üreteçle taklit edebiliriz; pytest de yield fixture'ı tam olarak böyle çalıştırır:</p>
<pre class="py">def baglanti():                      # @pytest.fixture olsaydı
    print("kur: test veritabanı açıldı")
    db = {"musteriler": ["Ayşe", "Can"]}
    yield db
    db.clear()
    print("temizle: veritabanı kapatıldı")

def test_musteri_sayisi(db):
    assert len(db["musteriler"]) == 2
    print("test çalıştı")

uretec = baglanti()
db = next(uretec)                    # yield'e kadar: hazırlık
try:
    test_musteri_sayisi(db)
finally:
    next(uretec, None)               # yield sonrası: temizlik</pre>
<p><b>conftest.py:</b> Birden çok test dosyasının kullandığı fixture'lar <code>tests/conftest.py</code> dosyasına yazılır. pytest bu dosyayı otomatik yükler; import etmene gerek yoktur. Alt klasörlerde ayrı conftest.py dosyaları olabilir, en yakındaki öncelik kazanır.</p>

<h2>parametrize: tek test, çok durum</h2>
<pre class="py">import pytest

def kargo_ucreti(tutar):
    if tutar &lt; 0:
        raise ValueError("tutar negatif olamaz")
    return 0.0 if tutar &gt;= 500 else 49.9

@pytest.mark.parametrize("tutar, beklenen", [
    (0, 49.9),
    (499.99, 49.9),      # sınırın hemen altı
    (500, 0.0),          # tam sınır
    (1250, 0.0),
])
def test_kargo(tutar, beklenen):
    assert kargo_ucreti(tutar) == beklenen

# pytest her satırı ayrı test sayar: test_kargo[0-49.9], test_kargo[499.99-49.9] ...
isaret = test_kargo.pytestmark[0]
print(isaret.name, isaret.args[0])
for durum in isaret.args[1]:
    test_kargo(*durum)
print(len(isaret.args[1]), "durum geçti")</pre>
<div class="tip"><b>Sınır değerlerini test et</b>Hataların çoğu sınırlardadır: <code>&gt;=</code> yerine <code>&gt;</code>, boş liste, sıfır, negatif sayı, tam eşik. Parametre listesine her zaman "sınırın kendisi" ve "hemen altı/üstü" durumlarını koy.</div>

<h2>İşaretler: skip, skipif, xfail</h2>
<pre class="code">import sys, pytest

@pytest.mark.skip(reason="Kur servisi bakımda")
def test_canli_kur(): ...

@pytest.mark.skipif(sys.platform == "win32", reason="Yalnızca Linux sunucuda")
def test_dosya_izinleri(): ...

@pytest.mark.xfail(reason="Hata #142: yuvarlama düzeltilecek")
def test_kusurat_yuvarlama(): ...

@pytest.mark.yavas              # kendi işaretin: pyproject'te tanımla
def test_buyuk_rapor(): ...</pre>
<p><code>xfail</code> "bu testin şu an başarısız olmasını bekliyorum" demektir; geçerse <b>XPASS</b> olarak raporlanır, böylece hata düzeldiğinde haberin olur. Kendi işaretlerini <code>pytest -m "not yavas"</code> ile süzersin.</p>

<h2>Yerleşik fixture'lar: tmp_path, monkeypatch, capsys</h2>
<div class="tbl-wrap"><table>
<tr><th>Fixture</th><th>Ne verir?</th><th>Ne zaman?</th></tr>
<tr><td><code>tmp_path</code></td><td>Her teste özel, boş bir <code>pathlib.Path</code> klasörü</td><td>Dosya yazan/okuyan kod</td></tr>
<tr><td><code>monkeypatch</code></td><td><code>setattr</code>, <code>setenv</code>, <code>delenv</code>, <code>setitem</code>; test bitince her şeyi geri alır</td><td>Dış servis, saat, ortam değişkeni</td></tr>
<tr><td><code>capsys</code></td><td><code>readouterr()</code> ile o ana kadarki stdout/stderr</td><td>print eden kod</td></tr>
<tr><td><code>caplog</code></td><td>logging kayıtları</td><td>Log mesajı denetimi</td></tr>
</table></div>
<pre class="py">import os, pytest

class KurServisi:
    @staticmethod
    def usd_kuru():
        raise ConnectionError("testte gerçek servise bağlanma")

def tl_karsiligi(usd):
    kur = KurServisi.usd_kuru()
    komisyon = float(os.environ.get("AM_KOMISYON", "0"))
    return round(usd * kur * (1 + komisyon), 2)

def test_tl_karsiligi(monkeypatch):
    monkeypatch.setattr(KurServisi, "usd_kuru", lambda: 32.5)
    monkeypatch.setenv("AM_KOMISYON", "0.01")
    assert tl_karsiligi(10) == 328.25

mp = pytest.MonkeyPatch()           # pytest bunu fixture olarak verir
try:
    test_tl_karsiligi(mp)
    print("test geçti")
finally:
    mp.undo()                       # test sonrası otomatik geri alma
print("AM_KOMISYON" in os.environ)  # False: ortam eski hâline döndü
try:
    KurServisi.usd_kuru()
except ConnectionError:
    print("asıl servis geri geldi")</pre>

<h2>Coverage ve komut satırı</h2>
<p><b>Kapsam</b> (coverage), testler çalışırken kodun hangi satırlarının çalıştığını ölçer: <code>pytest --cov=anadolu --cov-report=term-missing</code> her dosya için yüzde ve çalışmayan satır numaralarını gösterir. Yüzde 100 kapsam hatasız kod demek değildir (satır çalışmış ama sonucu kontrol edilmemiş olabilir); ama yüzde 40 kapsam, kodun yarısından fazlasının hiç denenmediğini kesin olarak söyler.</p>
<div class="tbl-wrap"><table>
<tr><th>Komut</th><th>Ne yapar?</th></tr>
<tr><td><code>pytest -v</code></td><td>Her testi adıyla ve sonucuyla listeler</td></tr>
<tr><td><code>pytest -q</code></td><td>Kısa çıktı</td></tr>
<tr><td><code>pytest -x</code></td><td>İlk başarısızlıkta durur</td></tr>
<tr><td><code>pytest -k "kdv and not yavas"</code></td><td>Adı ifadeye uyan testleri seçer</td></tr>
<tr><td><code>pytest --lf</code> / <code>--ff</code></td><td>Yalnızca son başarısızları / önce başarısızları çalıştırır</td></tr>
<tr><td><code>pytest tests/test_fiyat.py::test_kdv_ekle</code></td><td>Tek bir testi çalıştırır</td></tr>
<tr><td><code>pytest -m yavas</code></td><td>İşarete göre seçer</td></tr>
<tr><td><code>pytest -s</code></td><td>print çıktısını yakalamadan gösterir</td></tr>
<tr><td><code>pytest --pdb</code></td><td>Başarısızlıkta hata ayıklayıcıyı açar</td></tr>
<tr><td><code>pytest --cov=paket</code></td><td>Kapsam ölçer (pytest-cov)</td></tr>
<tr><td><code>pytest -n auto</code></td><td>Testleri paralel çalıştırır (pytest-xdist)</td></tr>
</table></div>

<div class="note"><b>Gerçek işte</b>Kurumsal projelerde testler her pull request'te CI (GitHub Actions, GitLab CI) tarafından çalıştırılır; kırmızı test birleştirmeyi engeller. Kod incelemesinde "bu değişikliğin testi nerede?" sorusu standarttır. Hata bildirimi geldiğinde iyi ekipler önce hatayı yeniden üreten başarısız bir test yazar, sonra kodu düzeltir; böylece aynı hata bir daha geri gelmez (regresyon testi). Dış servisler (ödeme, kur, SMS) testte asla gerçek çağrılmaz; monkeypatch ya da mock ile taklit edilir.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Mutasyon testi: testlerini test et</h3>
<p>Kapsam yüzdesi "satır çalıştı mı" sorusunu yanıtlar, "test bir hatayı yakalar mıydı" sorusunu yanıtlamaz. Mutasyon testi araçları (<code>mutmut</code>, <code>cosmic-ray</code>) kodda küçük değişiklikler (mutant) yapar: <code>&gt;=</code> yerine <code>&gt;</code>, <code>+</code> yerine <code>-</code>, <code>return</code> değerini değiştirme. Testlerin bu mutantı "öldürmesi", yani başarısız olması gerekir. Bu dersin alıştırmaları tam olarak bu fikirle denetleniyor.</p>
<h3>İyi testin özellikleri</h3>
<ul><li><b>Bağımsız:</b> Sırası değişince sonucu değişmez; global durum paylaşmaz.</li><li><b>Hızlı:</b> Ağ, disk ve uyku yok; binlerce test saniyeler içinde biter.</li><li><b>Belirleyici:</b> Rastgelelik ve saat sabitlenir; bazen geçip bazen düşen (flaky) test güveni yok eder.</li><li><b>Okunur:</b> Hazırla, çalıştır, doğrula (Arrange, Act, Assert) düzeni; adı neyi test ettiğini söyler: <code>test_uye_olmayan_1000_tl_ustu_50_indirim_alir</code>.</li></ul>
<h3>Özellik tabanlı test</h3>
<p><code>hypothesis</code> kütüphanesi senin yerine yüzlerce rastgele girdi üretip "her tutar için indirimli fiyat tutardan büyük olamaz" gibi genel özellikleri dener ve hatayı bulunca en küçük örneğe indirger. Parametrize ile seçtiğin durumların kaçırdığı köşeleri bulmakta çok güçlüdür.</p>
</section>
`,
  ex: [
    { t: 'mc', stage: 'Isınma',
      q: '<code>test_sepet.py</code> dosyasında şu fonksiyonlar var: <code>sepet_testi()</code>, <code>test_toplam()</code>, <code>_test_gizli()</code>, <code>kontrol_test()</code>. pytest varsayılan ayarlarla hangisini test olarak toplar?',
      o: ['Hepsini, çünkü dosya adı test_ ile başlıyor', 'Yalnızca test_toplam', 'test_toplam ve kontrol_test', 'test_toplam ve _test_gizli'], a: 1,
      why: 'Dosya adı test_*.py olduğu için dosya taranır, ama içindeki fonksiyonlardan yalnızca adı "test" ile BAŞLAYANLAR toplanır. kontrol_test sonda test içerir, _test_gizli alt çizgiyle başlar; ikisi de toplanmaz.' },
    { t: 'mc', stage: 'Isınma',
      q: 'pytest\'te başarısız <code>assert toplam == 120</code> satırı, unittest\'teki gibi özel bir metot kullanmadan sol ve sağ değerleri nasıl gösterebiliyor?',
      o: ['Python 3.8\'den beri assert her başarısızlıkta değerleri kendisi yazdırıyor', 'pytest, test modüllerini yüklerken assert ifadelerini yeniden yazıyor', 'pytest her testi arka planda pdb hata ayıklayıcısında adım adım çalıştırıyor', 'Değerleri göstermiyor; yalnızca dosya adını ve satır numarasını gösteriyor'], a: 1,
      why: 'pytest, test dosyalarını yüklerken bir import kancasıyla assert ifadelerini ara değerleri kaydeden koda dönüştürür (assertion rewriting). Düz Python\'da assert yalnızca AssertionError fırlatır.' },
    { t: 'mc', stage: 'Isınma',
      q: 'Ürün kataloğunu dosyadan okuyan, okunması 3 saniye süren ve testlerde yalnızca okunan (değiştirilmeyen) bir fixture yazıyorsun. Hangi scope en uygun?',
      o: ['scope="function", her test kendi kopyasını alsın', 'scope="module" ya da "session", veri bir kez yüklensin', 'scope="class", çünkü veri sınıfa aittir', 'Fixture değil, her testin başında dosyayı oku'], a: 1,
      why: 'Pahalı ve salt okunur veri bir kez yüklenip paylaşılabilir. Veriyi değiştiren testler olsaydı paylaşım testleri birbirine bağımlı yapardı; o zaman function scope doğru olurdu.' },
    { t: 'predict', stage: 'Kodu oku', q: 'Bu kod ne yazdırır?',
      code: 'import pytest\n\ndef bol(a, b):\n    if b == 0:\n        raise ZeroDivisionError("bölen sıfır olamaz")\n    return a / b\n\nwith pytest.raises(ZeroDivisionError, match="sıfır") as hata:\n    bol(10, 0)\n    print("bu satır")\nprint(hata.type.__name__, "|", hata.value)\n',
      o: ['bu satır\nZeroDivisionError | bölen sıfır olamaz', 'ZeroDivisionError | bölen sıfır olamaz', 'ZeroDivisionError | sıfır', 'Failed hatası verir'], a: 1,
      why: 'Hata fırlatan satırdan sonra with bloğundaki kod çalışmaz; pytest.raises hatayı yakalar ve bilgi nesnesine koyar. type hatanın sınıfı, value hata nesnesidir; yazdırılınca mesajı verir. match yalnızca mesajda aranan kalıptır.' },
    { t: 'predict', stage: 'Kodu oku', q: 'Bu kod ne yazdırır?',
      code: 'import pytest\n\nprint(0.1 + 0.2 == 0.3, 0.1 + 0.2 == pytest.approx(0.3))\ntry:\n    with pytest.raises(ValueError):\n        int("42")\nexcept BaseException as h:\n    print(type(h).__name__)\n',
      o: ['False True\nValueError', 'True True\nFailed', 'False True\nFailed', 'False False\nAssertionError'], a: 2,
      why: '0.1 + 0.2 kayan nokta hatasıyla 0.30000000000000004 olur; approx küçük farkı tolere eder. int("42") hata fırlatmadığı için pytest.raises testi düşürür: pytest\'in Failed istisnası ("DID NOT RAISE") fırlar.' },
    { t: 'predict', stage: 'Kodu oku', q: 'Bu kod ne yazdırır?',
      code: 'def indirim(tutar, oran):\n    return tutar * oran        # hatalı: indirim yerine indirim miktarı\n\ndef test_indirim():\n    assert indirim(1000, 0.25), 750\n\ntest_indirim()\nprint("geçti", indirim(1000, 0.25))\n',
      o: ['AssertionError: 750', 'geçti 750.0', 'geçti 250.0', 'SyntaxError'], a: 2,
      why: 'assert x, y ifadesinde y beklenen değer değil hata mesajıdır. 250.0 doğru (sıfır değil) sayıldığı için test geçer ve bozuk kod fark edilmez. Doğrusu assert indirim(1000, 0.25) == 750.' },
    { t: 'order', stage: 'Kodu oku',
      q: '<p>Parametrize edilmiş bir testi tanımlayıp tüm durumlarını elle çalıştıran kodu sırala. Çıktı <code>3 durum geçti</code> olmalı.</p>',
      lines: ['import pytest', 'def kdv(t):', '    return round(t * 1.2, 2)', '@pytest.mark.parametrize("tutar, beklenen", [(100, 120.0), (0, 0.0), (9.99, 11.99)])', 'def test_kdv(tutar, beklenen):', '    assert kdv(tutar) == beklenen', 'durumlar = test_kdv.pytestmark[0].args[1]', 'for tutar, beklenen in durumlar:', '    test_kdv(tutar, beklenen)', ],
      tests: 'assert len(durumlar) == 3, "üç durum olmalı"\n',
      hint: 'Dekoratör, süslediği def satırının hemen üstünde olmalı. Durumlar test tanımlandıktan sonra okunur.',
      why: 'pytest.mark.parametrize, fonksiyona pytestmark listesi ekler; pytest çalışırken bu listeyi okuyup her durumu ayrı test olarak çalıştırır. Burada aynı işi elle yaptık.' },
    { t: 'code', stage: 'Rehberli', id: 'pytest-1', diff: 1,
      q: '<p><code>kdv_ekle(tutar, oran=0.20)</code> hazır. Onun için <code>test_kdv_ekle()</code> test fonksiyonunu yaz: düz <code>assert</code> ile en az üç durum dene. Testin, doğru koda karşı geçmeli ve şu bozuk sürümlerin <b>hepsinde</b> başarısız olmalı: yuvarlamayı unutan, <code>oran</code> parametresini yok sayıp hep 0.20 kullanan ve oranı çarpmak yerine toplayan sürüm.</p>',
      guide: ['Varsayılan oranla tam sayı bir durum yaz: kdv_ekle(100) == 120.0.', 'Yuvarlama gerektiren bir durum ekle (ör. 9.99 → 11.99).', 'oran parametresini değiştiren bir durum ekle (ör. oran=0.10).', 'Her durumu ayrı assert satırı olarak yaz.'],
      example: 'def kargo(desi):\n    return 30 + desi * 5\n\ndef test_kargo():\n    assert kargo(0) == 30\n    assert kargo(4) == 50\n\ntest_kargo()\nprint("geçti")\n',
      start: 'def kdv_ekle(tutar, oran=0.20):\n    return round(tutar * (1 + oran), 2)\n\ndef test_kdv_ekle():\n    # TODO: varsayılan oranla bir durum\n    # TODO: yuvarlama gerektiren bir durum\n    # TODO: farklı oranla bir durum\n    pass\n',
      sol: 'def kdv_ekle(tutar, oran=0.20):\n    return round(tutar * (1 + oran), 2)\n\ndef test_kdv_ekle():\n    assert kdv_ekle(100) == 120.0\n    assert kdv_ekle(9.99) == 11.99\n    assert kdv_ekle(200, oran=0.10) == 220.0\n\ntest_kdv_ekle()\nprint("geçti")\n',
      tests: 'def _yakala(test, hedef, bozuklar):\n    dogru = globals()[hedef]\n    try:\n        try:\n            test()\n        except AssertionError as h:\n            raise AssertionError(f"testin DOĞRU kodda başarısız oldu: {h}")\n        for ad, bozuk in bozuklar:\n            globals()[hedef] = bozuk\n            try:\n                test()\n            except BaseException:\n                continue\n            raise AssertionError(f"testin şu bozuk sürümü yakalamadı: {ad}")\n    finally:\n        globals()[hedef] = dogru\n\n_yakala(test_kdv_ekle, "kdv_ekle", [\n    ("yuvarlama yok", lambda tutar, oran=0.20: tutar * (1 + oran)),\n    ("oran yok sayılıyor", lambda tutar, oran=0.20: round(tutar * 1.20, 2)),\n    ("oran toplanıyor", lambda tutar, oran=0.20: round(tutar + oran, 2)),\n])\n',
      hints: ['Testin bir bozuk sürümü yakalaması için o hatanın ortaya çıktığı bir girdi gerekir.', 'Yuvarlama hatası yalnızca küsuratlı sonuçta görünür: 9.99 * 1.2 = 11.988.', 'assert kdv_ekle(200, oran=0.10) == 220.0'],
      why: 'Her bozuk sürüm farklı bir girdide ortaya çıkar: yuvarlama küsuratlı tutarda, oran hatası farklı oranda. İyi test seti, olası hata türlerinin her biri için en az bir durum içerir.' },
    { t: 'code', stage: 'Rehberli', id: 'pytest-2', diff: 2,
      q: '<p>Ilgaz Bank <code>para_cek(bakiye, tutar)</code> fonksiyonu hazır: tutar 0 ya da negatifse <code>ValueError</code> ("negatif" kelimesi geçen mesajla), bakiyeden büyükse <code>YetersizBakiye</code> fırlatır. <code>test_para_cek_hatalar()</code> testini <code>pytest.raises</code> ile yaz: negatif tutar, <b>sıfır</b> tutar ve bakiyeyi aşan tutar durumlarını dene; ValueError için <code>match="negatif"</code> kullan. Ayrıca geçerli bir çekimin sonucunu da doğrula.</p>',
      guide: ['import pytest yaz.', 'Her hata durumu için ayrı bir with pytest.raises(...) bloğu aç; blokta yalnızca tek çağrı olsun.', 'Negatif ve sıfır tutar için ValueError, match="negatif".', 'Aşan tutar için YetersizBakiye; geçerli çekim için düz assert.'],
      example: 'import pytest\n\ndef yas_dogrula(yas):\n    if yas < 18:\n        raise ValueError("yaş 18 altında")\n    return True\n\ndef test_yas():\n    with pytest.raises(ValueError, match="18"):\n        yas_dogrula(16)\n    assert yas_dogrula(30) is True\n\ntest_yas()\nprint("geçti")\n',
      start: 'import pytest\n\nclass YetersizBakiye(Exception):\n    pass\n\ndef para_cek(bakiye, tutar):\n    if tutar <= 0:\n        raise ValueError("tutar negatif ya da sıfır olamaz")\n    if tutar > bakiye:\n        raise YetersizBakiye(f"bakiye {bakiye} TL, istenen {tutar} TL")\n    return bakiye - tutar\n\ndef test_para_cek_hatalar():\n    # TODO: negatif tutar -> ValueError (match="negatif")\n    # TODO: sıfır tutar -> ValueError\n    # TODO: bakiyeyi aşan tutar -> YetersizBakiye\n    # TODO: geçerli çekim sonucu\n    pass\n',
      sol: 'import pytest\n\nclass YetersizBakiye(Exception):\n    pass\n\ndef para_cek(bakiye, tutar):\n    if tutar <= 0:\n        raise ValueError("tutar negatif ya da sıfır olamaz")\n    if tutar > bakiye:\n        raise YetersizBakiye(f"bakiye {bakiye} TL, istenen {tutar} TL")\n    return bakiye - tutar\n\ndef test_para_cek_hatalar():\n    with pytest.raises(ValueError, match="negatif"):\n        para_cek(100, -5)\n    with pytest.raises(ValueError, match="negatif"):\n        para_cek(100, 0)\n    with pytest.raises(YetersizBakiye):\n        para_cek(100, 250)\n    assert para_cek(100, 40) == 60\n\ntest_para_cek_hatalar()\nprint("geçti")\n',
      tests: 'def _yakala(test, hedef, bozuklar):\n    dogru = globals()[hedef]\n    try:\n        try:\n            test()\n        except BaseException as h:\n            raise AssertionError(f"testin DOĞRU kodda başarısız oldu: {type(h).__name__}: {h}")\n        for ad, bozuk in bozuklar:\n            globals()[hedef] = bozuk\n            try:\n                test()\n            except BaseException:\n                continue\n            raise AssertionError(f"testin şu bozuk sürümü yakalamadı: {ad}")\n    finally:\n        globals()[hedef] = dogru\n\ndef _b1(bakiye, tutar):\n    if tutar > bakiye:\n        raise YetersizBakiye("x")\n    return bakiye - tutar\ndef _b2(bakiye, tutar):\n    if tutar < 0:\n        raise ValueError("tutar negatif olamaz")\n    if tutar > bakiye:\n        raise YetersizBakiye("x")\n    return bakiye - tutar\ndef _b3(bakiye, tutar):\n    if tutar <= 0 or tutar > bakiye:\n        raise ValueError("tutar negatif ya da fazla")\n    return bakiye - tutar\ndef _b4(bakiye, tutar):\n    if tutar <= 0:\n        raise ValueError("geçersiz tutar")\n    if tutar > bakiye:\n        raise YetersizBakiye("x")\n    return bakiye - tutar\ndef _b5(bakiye, tutar):\n    if tutar <= 0:\n        raise ValueError("tutar negatif")\n    if tutar > bakiye:\n        raise YetersizBakiye("x")\n    return bakiye\n_yakala(test_para_cek_hatalar, "para_cek", [("negatif kontrolü yok", _b1), ("sıfır tutara izin veriliyor", _b2), ("aşımda yanlış hata türü", _b3), ("mesajda negatif yok", _b4), ("bakiye düşülmüyor", _b5)])\nassert "pytest.raises" in __source__, "hata durumlarını pytest.raises ile test et"\n',
      hints: ['pytest.raises hata fırlatılmazsa testi düşürür; bu yüzden "kontrol yok" sürümlerini otomatik yakalar.', 'Sıfır, &lt; ile &lt;= arasındaki farkı yakalayan sınır değeridir.', 'Geçerli bir çekim için de assert para_cek(100, 40) == 60 yaz.'],
      why: 'Hata yolları da davranışın parçasıdır ve en az test edilen yerlerdir. Doğru hata türü, mesajı ve sınır değeri (sıfır) ayrı ayrı denetlenince her bozuk sürüm yakalanır.' },
    { t: 'code', stage: 'Rehberli', id: 'pytest-3', diff: 2,
      q: '<p><code>bilesik_faiz(ana, oran, yil)</code> hazır: <code>ana * (1 + oran) ** yil</code>. <code>test_bilesik_faiz()</code> testini yaz: en az üç durum (ör. 1000 TL yüzde 10 ile 2 yıl = 1210; 0 yıl = ana para; bir durum daha) ve karşılaştırmada <code>pytest.approx</code> kullan. Dikkat: <code>1000 * 1.1 ** 2</code> tam olarak 1210 değildir.</p>',
      guide: ['import pytest yaz.', 'assert bilesik_faiz(1000, 0.10, 2) == pytest.approx(1210) biçimini kullan.', 'yil=0 durumunda sonucun ana para olduğunu doğrula.', 'Basit faizle karışmayacak bir durum ekle (ör. 3 yıl).'],
      example: 'import pytest\nprint(1 / 3 * 3 == 1, 0.1 * 3 == pytest.approx(0.3))\nprint([0.1 + 0.2, 2.0] == pytest.approx([0.3, 2.0]))\n',
      start: 'import pytest\n\ndef bilesik_faiz(ana, oran, yil):\n    return ana * (1 + oran) ** yil\n\ndef test_bilesik_faiz():\n    # TODO: 1000, 0.10, 2 -> 1210 (approx ile)\n    # TODO: yil = 0 -> ana para\n    # TODO: bir durum daha\n    pass\n',
      sol: 'import pytest\n\ndef bilesik_faiz(ana, oran, yil):\n    return ana * (1 + oran) ** yil\n\ndef test_bilesik_faiz():\n    assert bilesik_faiz(1000, 0.10, 2) == pytest.approx(1210)\n    assert bilesik_faiz(5000, 0.30, 0) == pytest.approx(5000)\n    assert bilesik_faiz(1000, 0.10, 3) == pytest.approx(1331)\n\ntest_bilesik_faiz()\nprint("geçti")\n',
      tests: 'def _yakala(test, hedef, bozuklar):\n    dogru = globals()[hedef]\n    try:\n        try:\n            test()\n        except AssertionError as h:\n            raise AssertionError(f"testin DOĞRU kodda başarısız oldu (approx kullandın mı?): {h}")\n        for ad, bozuk in bozuklar:\n            globals()[hedef] = bozuk\n            try:\n                test()\n            except BaseException:\n                continue\n            raise AssertionError(f"testin şu bozuk sürümü yakalamadı: {ad}")\n    finally:\n        globals()[hedef] = dogru\n\n_yakala(test_bilesik_faiz, "bilesik_faiz", [\n    ("basit faiz", lambda ana, oran, yil: ana * (1 + oran * yil)),\n    ("bir yıl eksik", lambda ana, oran, yil: ana * (1 + oran) ** max(yil - 1, 0)),\n    ("yalnızca faiz döndürüyor", lambda ana, oran, yil: ana * (1 + oran) ** yil - ana),\n])\nassert "approx" in __source__, "ondalıklı sonuçları pytest.approx ile karşılaştır"\n',
      hints: ['1000 * 1.1 ** 2 = 1210.0000000000002; düz == başarısız olur.', 'Basit faiz 2 yılda da 1200 verir, ama 0 yılda ikisi de aynı; 2+ yıllık durum şart.', 'assert bilesik_faiz(1000, 0.10, 3) == pytest.approx(1331)'],
      why: 'approx varsayılan olarak yaklaşık milyonda birlik göreli farkı tolere eder; kayan nokta hatası testi düşürmez ama gerçek formül hatası (1200 ve 1210) yakalanır.' },
    { t: 'code', stage: 'Rehberli', id: 'pytest-4', diff: 2,
      q: '<p><code>kargo_ucreti(tutar)</code> hazır: 500 TL ve üstü 0.0, altı 49.9. <code>@pytest.mark.parametrize("tutar, beklenen", [...])</code> ile <code>test_kargo(tutar, beklenen)</code> yaz. Listede en az 4 durum olsun ve mutlaka <b>tam sınır</b> (500) ile <b>sınırın hemen altı</b> (499.99) bulunsun.</p>',
      guide: ['import pytest yaz.', 'Dekoratöre argüman adlarını tek metin olarak ver: "tutar, beklenen".', 'Durumları (tutar, beklenen) demetleri listesi olarak yaz: 0, 499.99, 500, büyük bir tutar.', 'Test gövdesi tek satır: assert kargo_ucreti(tutar) == beklenen.'],
      example: 'import pytest\n\n@pytest.mark.parametrize("metin, beklenen", [("ankara", "Ankara"), ("", "")])\ndef test_baslik(metin, beklenen):\n    assert metin.capitalize() == beklenen\n\nfor d in test_baslik.pytestmark[0].args[1]:\n    test_baslik(*d)\nprint("geçti")\n',
      start: 'import pytest\n\ndef kargo_ucreti(tutar):\n    if tutar < 0:\n        raise ValueError("tutar negatif olamaz")\n    return 0.0 if tutar >= 500 else 49.9\n\n# TODO: @pytest.mark.parametrize("tutar, beklenen", [...])\ndef test_kargo(tutar, beklenen):\n    # TODO: kargo_ucreti sonucunu beklenenle karşılaştır\n    pass\n',
      sol: 'import pytest\n\ndef kargo_ucreti(tutar):\n    if tutar < 0:\n        raise ValueError("tutar negatif olamaz")\n    return 0.0 if tutar >= 500 else 49.9\n\n@pytest.mark.parametrize("tutar, beklenen", [\n    (0, 49.9),\n    (499.99, 49.9),\n    (500, 0.0),\n    (1250, 0.0),\n])\ndef test_kargo(tutar, beklenen):\n    assert kargo_ucreti(tutar) == beklenen\n\nfor d in test_kargo.pytestmark[0].args[1]:\n    test_kargo(*d)\nprint("geçti")\n',
      tests: 'isaretler = [m for m in getattr(test_kargo, "pytestmark", []) if m.name == "parametrize"]\nassert isaretler, "test_kargo @pytest.mark.parametrize ile süslenmeli"\ndurumlar = list(isaretler[0].args[1])\nassert len(durumlar) >= 4, "en az 4 durum olmalı"\ntutarlar = [d[0] for d in durumlar]\nassert 500 in tutarlar, "tam sınır (500) durumu olmalı"\nassert 499.99 in tutarlar, "sınırın hemen altı (499.99) durumu olmalı"\ndogru = kargo_ucreti\ntry:\n    for d in durumlar:\n        try:\n            test_kargo(*d)\n        except AssertionError:\n            raise AssertionError(f"{d} durumu DOĞRU kodda başarısız; beklenen değeri kontrol et")\n    for ad, bozuk in [("> yerine >=", lambda t: 0.0 if t > 500 else 49.9), ("eşik 499", lambda t: 0.0 if t >= 499 else 49.9), ("ücret 39.9", lambda t: 0.0 if t >= 500 else 39.9)]:\n        kargo_ucreti = bozuk\n        yakalandi = False\n        for d in durumlar:\n            try:\n                test_kargo(*d)\n            except AssertionError:\n                yakalandi = True\n        assert yakalandi, f"durumların şu bozuk sürümü yakalamadı: {ad}"\nfinally:\n    kargo_ucreti = dogru\n',
      hints: ['Dekoratör def satırının hemen üstüne yazılır.', 'Sınır hataları ancak sınırdaki girdilerle yakalanır: 500 ve 499.99.', '@pytest.mark.parametrize("tutar, beklenen", [(0, 49.9), (499.99, 49.9), (500, 0.0), (1250, 0.0)])'],
      why: 'parametrize, aynı testi veri tablosuyla çalıştırır; her satır raporda ayrı görünür. Sınır değerleri (500, 499.99) en sık yapılan >= / > hatasını yakalar.' },
    { t: 'code', stage: 'Kendin yaz', id: 'pytest-5', diff: 2,
      q: '<p><code>Sepet</code> sınıfı hazır. <code>@pytest.fixture</code> ile <code>dolu_sepet</code> fixture\'ını yaz: yeni bir Sepet oluşturup <code>ekle("Çay", 50, 2)</code> ve <code>ekle("Şeker", 35.5)</code> çağırsın ve sepeti döndürsün. Sonra iki test yaz: <code>test_toplam(dolu_sepet)</code> toplamın 135.5 olduğunu, <code>test_gecersiz_adet(dolu_sepet)</code> <code>adet=0</code> ile eklemenin <code>ValueError</code> fırlattığını doğrulasın. (Tarayıcıda fixture\'ı test fonksiyonuna biz vereceğiz.)</p>',
      start: 'import pytest\n\nclass Sepet:\n    def __init__(self):\n        self.kalemler = []\n\n    def ekle(self, ad, fiyat, adet=1):\n        if adet < 1:\n            raise ValueError("adet en az 1 olmalı")\n        self.kalemler.append((ad, fiyat, adet))\n\n    def toplam(self):\n        return round(sum(f * a for _, f, a in self.kalemler), 2)\n',
      sol: 'import pytest\n\nclass Sepet:\n    def __init__(self):\n        self.kalemler = []\n\n    def ekle(self, ad, fiyat, adet=1):\n        if adet < 1:\n            raise ValueError("adet en az 1 olmalı")\n        self.kalemler.append((ad, fiyat, adet))\n\n    def toplam(self):\n        return round(sum(f * a for _, f, a in self.kalemler), 2)\n\n@pytest.fixture\ndef dolu_sepet():\n    s = Sepet()\n    s.ekle("Çay", 50, 2)\n    s.ekle("Şeker", 35.5)\n    return s\n\ndef test_toplam(dolu_sepet):\n    assert dolu_sepet.toplam() == 135.5\n\ndef test_gecersiz_adet(dolu_sepet):\n    with pytest.raises(ValueError):\n        dolu_sepet.ekle("Kahve", 120, adet=0)\n',
      tests: 'assert "dolu_sepet" in globals(), "dolu_sepet fixture\'ı tanımlanmalı"\nfx = dolu_sepet\nassert hasattr(fx, "_fixture_function_marker") or hasattr(fx, "_pytestfixturefunction"), "dolu_sepet @pytest.fixture ile süslenmeli"\nham = getattr(fx, "__wrapped__", None) or fx._get_wrapped_function()\nimport inspect\nassert "dolu_sepet" in inspect.signature(test_toplam).parameters, "test_toplam fixture\'ı parametre olarak istemeli"\nassert "dolu_sepet" in inspect.signature(test_gecersiz_adet).parameters, "test_gecersiz_adet fixture\'ı parametre olarak istemeli"\nasil = Sepet\nclass _AdetsizToplam(asil):\n    def toplam(self):\n        return round(sum(f for _, f, a in self.kalemler), 2)\nclass _KontrolsuzEkle(asil):\n    def ekle(self, ad, fiyat, adet=1):\n        self.kalemler.append((ad, fiyat, adet))\ntry:\n    for t in (test_toplam, test_gecersiz_adet):\n        try:\n            t(ham())\n        except BaseException as h:\n            raise AssertionError(f"{t.__name__} DOĞRU kodda başarısız: {type(h).__name__}: {h}")\n    for ad, bozuk in [("toplam adedi yok sayıyor", _AdetsizToplam), ("ekle adedi denetlemiyor", _KontrolsuzEkle)]:\n        Sepet = bozuk\n        yakalandi = False\n        for t in (test_toplam, test_gecersiz_adet):\n            try:\n                t(ham())\n            except BaseException:\n                yakalandi = True\n        assert yakalandi, f"testlerin şu bozuk sürümü yakalamadı: {ad}"\nfinally:\n    Sepet = asil\n',
      hints: ['@pytest.fixture ile süslenmiş fonksiyon return ile sepeti verir.', 'Test fonksiyonu fixture adını parametre olarak yazar: def test_toplam(dolu_sepet).', 'Çay 50 x 2 = 100, Şeker 35.5 x 1; toplam 135.5.'],
      why: 'Fixture hazırlığı tek yerde toplar; her test taze bir sepet alır, böylece bir testin eklediği kalem diğerini etkilemez. Testler davranışı (toplam, doğrulama) denetlediği için iki bozuk sürüm de yakalanır.' },
    { t: 'code', stage: 'Kendin yaz', id: 'pytest-6', diff: 2,
      q: '<p><code>rapor_yaz(klasor, satirlar)</code> hazır: klasöre <code>rapor.csv</code> yazar (başlık <code>sehir,ciro</code>, sonra her satır) ve dosya yolunu döndürür. <code>test_rapor_yaz(tmp_path)</code> testini yaz: dönen yolun <code>tmp_path / "rapor.csv"</code> olduğunu ve dosyanın satırlarının tam beklendiği gibi olduğunu doğrula. (pytest\'te tmp_path her teste özel boş bir klasördür; tarayıcıda biz vereceğiz.)</p>',
      start: 'def rapor_yaz(klasor, satirlar):\n    yol = klasor / "rapor.csv"\n    with open(yol, "w", encoding="utf-8") as f:\n        f.write("sehir,ciro\\n")\n        for sehir, ciro in satirlar:\n            f.write(f"{sehir},{ciro}\\n")\n    return yol\n\ndef test_rapor_yaz(tmp_path):\n    pass\n',
      sol: 'def rapor_yaz(klasor, satirlar):\n    yol = klasor / "rapor.csv"\n    with open(yol, "w", encoding="utf-8") as f:\n        f.write("sehir,ciro\\n")\n        for sehir, ciro in satirlar:\n            f.write(f"{sehir},{ciro}\\n")\n    return yol\n\ndef test_rapor_yaz(tmp_path):\n    yol = rapor_yaz(tmp_path, [("İzmir", 1200), ("Ankara", 800)])\n    assert yol == tmp_path / "rapor.csv"\n    assert yol.read_text(encoding="utf-8").splitlines() == ["sehir,ciro", "İzmir,1200", "Ankara,800"]\n',
      tests: 'import tempfile, pathlib, shutil\ndef _calistir():\n    k = pathlib.Path(tempfile.mkdtemp())\n    try:\n        test_rapor_yaz(k)\n    finally:\n        shutil.rmtree(k, ignore_errors=True)\ndogru = rapor_yaz\ndef _basliksiz(klasor, satirlar):\n    yol = klasor / "rapor.csv"\n    yol.write_text("".join(f"{s},{c}\\n" for s, c in satirlar), encoding="utf-8")\n    return yol\ndef _yanlis_ad(klasor, satirlar):\n    yol = klasor / "rapor.txt"\n    yol.write_text("sehir,ciro\\n" + "".join(f"{s},{c}\\n" for s, c in satirlar), encoding="utf-8")\n    return yol\ndef _tek_satir(klasor, satirlar):\n    yol = klasor / "rapor.csv"\n    yol.write_text("sehir,ciro\\n" + "".join(f"{s},{c}\\n" for s, c in satirlar[:1]), encoding="utf-8")\n    return yol\ntry:\n    try:\n        _calistir()\n    except BaseException as h:\n        raise AssertionError(f"testin DOĞRU kodda başarısız: {type(h).__name__}: {h}")\n    for ad, bozuk in [("başlık yok", _basliksiz), ("dosya adı yanlış", _yanlis_ad), ("yalnızca ilk satır yazılıyor", _tek_satir)]:\n        rapor_yaz = bozuk\n        try:\n            _calistir()\n        except BaseException:\n            continue\n        raise AssertionError(f"testin şu bozuk sürümü yakalamadı: {ad} (en az iki satır kullan, tüm içeriği karşılaştır)")\nfinally:\n    rapor_yaz = dogru\n',
      hints: ['tmp_path bir pathlib.Path; tmp_path / "rapor.csv" yolu verir.', 'yol.read_text(encoding="utf-8").splitlines() satır listesini verir.', 'En az iki veri satırı kullan ki "yalnızca ilk satır" hatası görünsün.'],
      why: 'tmp_path, testin gerçek proje klasörünü kirletmeden dosya yazmasını sağlar ve her test temiz bir klasör alır. İçeriğin tamamını karşılaştırmak; başlık, dosya adı ve eksik satır hatalarını birlikte yakalar.' },
    { t: 'code', stage: 'Kendin yaz', id: 'pytest-7', diff: 2,
      q: '<p><code>tl_karsiligi(usd)</code>, <code>KurServisi.usd_kuru()</code> ile kuru alır (testte gerçek servise bağlanmaz, ConnectionError fırlatır) ve <code>AM_KOMISYON</code> ortam değişkenindeki oranı ekler. <code>test_tl_karsiligi(monkeypatch)</code> yaz: <code>monkeypatch.setattr</code> ile kuru 32.5 yap; <code>monkeypatch.delenv("AM_KOMISYON", raising=False)</code> ile komisyonsuz durumu (10 USD → 325.0), <code>monkeypatch.setenv</code> ile <code>"0.01"</code> komisyonlu durumu (10 USD → 328.25) doğrula.</p>',
      start: 'import os\n\nclass KurServisi:\n    @staticmethod\n    def usd_kuru():\n        raise ConnectionError("testte gerçek servise bağlanma")\n\ndef tl_karsiligi(usd):\n    kur = KurServisi.usd_kuru()\n    komisyon = float(os.environ.get("AM_KOMISYON", "0"))\n    return round(usd * kur * (1 + komisyon), 2)\n\ndef test_tl_karsiligi(monkeypatch):\n    pass\n',
      sol: 'import os\n\nclass KurServisi:\n    @staticmethod\n    def usd_kuru():\n        raise ConnectionError("testte gerçek servise bağlanma")\n\ndef tl_karsiligi(usd):\n    kur = KurServisi.usd_kuru()\n    komisyon = float(os.environ.get("AM_KOMISYON", "0"))\n    return round(usd * kur * (1 + komisyon), 2)\n\ndef test_tl_karsiligi(monkeypatch):\n    monkeypatch.setattr(KurServisi, "usd_kuru", lambda: 32.5)\n    monkeypatch.delenv("AM_KOMISYON", raising=False)\n    assert tl_karsiligi(10) == 325.0\n    monkeypatch.setenv("AM_KOMISYON", "0.01")\n    assert tl_karsiligi(10) == 328.25\n',
      tests: 'import os, pytest\nos.environ.pop("AM_KOMISYON", None)\ndef _calistir():\n    mp = pytest.MonkeyPatch()\n    try:\n        test_tl_karsiligi(mp)\n    finally:\n        mp.undo()\ndogru = tl_karsiligi\ntry:\n    try:\n        _calistir()\n    except BaseException as h:\n        raise AssertionError(f"testin DOĞRU kodda başarısız: {type(h).__name__}: {h}")\n    for ad, bozuk in [\n        ("komisyon yok sayılıyor", lambda usd: round(usd * KurServisi.usd_kuru(), 2)),\n        ("komisyon çıkarılıyor", lambda usd: round(usd * KurServisi.usd_kuru() * (1 - float(os.environ.get("AM_KOMISYON", "0"))), 2)),\n        ("kur sabit yazılmış", lambda usd: round(usd * 30 * (1 + float(os.environ.get("AM_KOMISYON", "0"))), 2)),\n    ]:\n        tl_karsiligi = bozuk\n        try:\n            _calistir()\n        except BaseException:\n            continue\n        raise AssertionError(f"testin şu bozuk sürümü yakalamadı: {ad}")\nfinally:\n    tl_karsiligi = dogru\nassert "AM_KOMISYON" not in os.environ, "monkeypatch geri alındıktan sonra ortam değişkeni kalmamalı (os.environ\'a doğrudan yazma)"\ntry:\n    KurServisi.usd_kuru()\nexcept ConnectionError:\n    pass\nelse:\n    raise AssertionError("KurServisi elle değiştirilmiş; monkeypatch.setattr kullan ki test sonrası geri alınsın")\n',
      hints: ['monkeypatch.setattr(KurServisi, "usd_kuru", lambda: 32.5) sınıftaki metodu geçici olarak değiştirir.', 'monkeypatch.setenv("AM_KOMISYON", "0.01"); ortam değişkenleri her zaman metindir.', '10 * 32.5 * 1.01 = 328.25'],
      why: 'monkeypatch, dış servisi ve ortamı test süresince değiştirir ve test bitince otomatik geri alır; böylece testler ağdan bağımsız, hızlı ve birbirinden yalıtılmış olur. Elle atama yapsaydın sonraki testler de sahte kuru görürdü.' },
    { t: 'code', stage: 'Kendin yaz', id: 'pytest-8', diff: 2,
      q: '<p><code>ozet_yazdir(siparisler)</code> hazır: sipariş sayısını ve toplamı (2 ondalıklı) ekrana yazar. <code>test_ozet_yazdir(capsys)</code> testini yaz: iki siparişle (tutarlar 100 ve 50.5) çağır, <code>capsys.readouterr().out</code> ile yakalanan çıktının tam olarak <code>"Sipariş sayısı: 2\\nToplam: 150.50 TL\\n"</code> olduğunu doğrula.</p>',
      start: 'def ozet_yazdir(siparisler):\n    toplam = sum(s["tutar"] for s in siparisler)\n    print(f"Sipariş sayısı: {len(siparisler)}")\n    print(f"Toplam: {toplam:.2f} TL")\n\ndef test_ozet_yazdir(capsys):\n    pass\n',
      sol: 'def ozet_yazdir(siparisler):\n    toplam = sum(s["tutar"] for s in siparisler)\n    print(f"Sipariş sayısı: {len(siparisler)}")\n    print(f"Toplam: {toplam:.2f} TL")\n\ndef test_ozet_yazdir(capsys):\n    ozet_yazdir([{"tutar": 100}, {"tutar": 50.5}])\n    cikti = capsys.readouterr().out\n    assert cikti == "Sipariş sayısı: 2\\nToplam: 150.50 TL\\n"\n',
      tests: 'import io, contextlib, collections\n_Sonuc = collections.namedtuple("CaptureResult", "out err")\nclass _SahteCapsys:\n    def __init__(self):\n        self.tampon = io.StringIO()\n    def readouterr(self):\n        v = self.tampon.getvalue()\n        self.tampon.seek(0)\n        self.tampon.truncate(0)\n        return _Sonuc(v, "")\ndef _calistir():\n    c = _SahteCapsys()\n    with contextlib.redirect_stdout(c.tampon):\n        test_ozet_yazdir(c)\ndef _b1(siparisler):\n    print(f"Sipariş sayısı: {len(siparisler)}")\n    print(f"Toplam: {sum(s[\'tutar\'] for s in siparisler)} TL")\ndef _b2(siparisler):\n    print(f"Sipariş sayısı: {len(siparisler) - 1}")\n    print(f"Toplam: {sum(s[\'tutar\'] for s in siparisler):.2f} TL")\ndef _b3(siparisler):\n    print(f"Sipariş sayısı: {len(siparisler)}")\ndogru = ozet_yazdir\ntry:\n    try:\n        _calistir()\n    except BaseException as h:\n        raise AssertionError(f"testin DOĞRU kodda başarısız: {type(h).__name__}: {h}")\n    for ad, bozuk in [("2 ondalık biçim yok", _b1), ("sayı yanlış", _b2), ("toplam satırı yok", _b3)]:\n        ozet_yazdir = bozuk\n        try:\n            _calistir()\n        except BaseException:\n            continue\n        raise AssertionError(f"testin şu bozuk sürümü yakalamadı: {ad}")\nfinally:\n    ozet_yazdir = dogru\nassert "readouterr" in __source__, "çıktıyı capsys.readouterr() ile oku"\n',
      hints: ['capsys.readouterr() çağrıldığı ana kadar yazılanları döndürür; .out stdout\'tur.', 'print her satırın sonuna \\n ekler.', 'Toplam 150.5 değil, 2 ondalıkla 150.50 yazılır.'],
      why: 'capsys, print çıktısını yakalayıp metin olarak verir; böylece rapor ve CLI çıktıları birebir test edilir. Tam metni karşılaştırmak, biçim hatalarını (150.5 / 150.50) da yakalar.' },
    { t: 'code', stage: 'Hata avı', kind: 'bug', id: 'pytest-9', diff: 2,
      q: '<p><b>Hatayı bul ve düzelt.</b> <code>test_indirim()</code> her zaman yeşil yanıyor; ekip arkadaşın <code>indirim</code> fonksiyonunu bozduğunda bile. Testteki iki hatayı bul ve testi gerçekten denetleyen hâle getir. (<code>indirim</code> fonksiyonuna dokunma.)</p>',
      start: 'def indirim(tutar, oran):\n    return round(tutar * (1 - oran), 2)\n\ndef test_indirim():\n    sonuc = indirim(200, 0.1)\n    sonuc == 180\n    assert indirim(1000, 0.25), 750\n\ntest_indirim()\nprint("geçti")\n',
      sol: 'def indirim(tutar, oran):\n    return round(tutar * (1 - oran), 2)\n\ndef test_indirim():\n    sonuc = indirim(200, 0.1)\n    assert sonuc == 180\n    assert indirim(1000, 0.25) == 750\n\ntest_indirim()\nprint("geçti")\n',
      tests: 'dogru = indirim\ntry:\n    try:\n        test_indirim()\n    except AssertionError as h:\n        raise AssertionError(f"test DOĞRU kodda başarısız: {h}")\n    for ad, bozuk in [("indirim miktarını döndürüyor", lambda t, o: round(t * o, 2)), ("oranı iki kez uyguluyor", lambda t, o: round(t * (1 - o) ** 2, 2)), ("yalnızca 200 için doğru", lambda t, o: 180.0)]:\n        indirim = bozuk\n        try:\n            test_indirim()\n        except AssertionError:\n            continue\n        raise AssertionError(f"test şu bozuk sürümü yakalamadı: {ad}")\nfinally:\n    indirim = dogru\n',
      hints: ['Bir karşılaştırma ifadesi tek başına yazılırsa sonucu atılır; hiçbir şey denetlenmez.', 'assert x, y ifadesinde y mesajdır, beklenen değer değil.', 'assert sonuc == 180 ve assert indirim(1000, 0.25) == 750'],
      why: 'assert\'siz karşılaştırma bir ifade olarak hesaplanıp çöpe gider; virgüllü assert ise yalnızca sonucun sıfır olmadığını denetler. İki satır da "her zaman geçen" sahte testlerdir. Testi yazınca bir kez bilerek bozup kırmızı yandığını görmek bu hatayı önler.' },
    { t: 'code', stage: 'Hata avı', kind: 'bug', id: 'pytest-10', diff: 2,
      q: '<p><b>Hatayı bul ve düzelt.</b> <code>ortalama_sepet</code> doğru çalışıyor ama <code>test_ortalama_sepet()</code> doğru koda karşı <b>kırmızı</b> yanıyor. Ayrıca testte hiç çalışmayan bir satır var. Testi düzelt: ondalıklı karşılaştırmayı doğru yap ve çalışmayan satırı kaldır.</p>',
      start: 'import pytest\n\ndef ortalama_sepet(tutarlar):\n    if not tutarlar:\n        raise ValueError("boş liste")\n    return sum(tutarlar) / len(tutarlar)\n\ndef test_ortalama_sepet():\n    assert ortalama_sepet([0.1, 0.2]) == 0.15\n    assert ortalama_sepet([10, 20, 30]) == 20\n    with pytest.raises(ValueError):\n        ortalama_sepet([])\n        assert False, "buraya hiç gelinmez"\n\ntest_ortalama_sepet()\nprint("geçti")\n',
      sol: 'import pytest\n\ndef ortalama_sepet(tutarlar):\n    if not tutarlar:\n        raise ValueError("boş liste")\n    return sum(tutarlar) / len(tutarlar)\n\ndef test_ortalama_sepet():\n    assert ortalama_sepet([0.1, 0.2]) == pytest.approx(0.15)\n    assert ortalama_sepet([10, 20, 30]) == 20\n    with pytest.raises(ValueError):\n        ortalama_sepet([])\n\ntest_ortalama_sepet()\nprint("geçti")\n',
      tests: 'dogru = ortalama_sepet\ntry:\n    try:\n        test_ortalama_sepet()\n    except AssertionError as h:\n        raise AssertionError(f"test DOĞRU kodda başarısız: {h}")\n    def _b1(t):\n        return sum(t) / (len(t) + 1)\n    def _b2(t):\n        return sum(t) / len(t)\n    for ad, bozuk in [("yanlış bölen", _b1), ("boş listede ZeroDivisionError", _b2)]:\n        ortalama_sepet = bozuk\n        try:\n            test_ortalama_sepet()\n        except BaseException:\n            continue\n        raise AssertionError(f"test şu bozuk sürümü yakalamadı: {ad}")\nfinally:\n    ortalama_sepet = dogru\nassert "assert False" not in __kod__, "with pytest.raises bloğundaki çalışmayan satırı kaldır"\nassert "approx" in __source__, "ondalıklı sonucu pytest.approx ile karşılaştır"\n',
      hints: ['(0.1 + 0.2) / 2 = 0.15000000000000002.', 'pytest.raises bloğunda hata fırlatan satırdan sonraki kod hiç çalışmaz.', 'assert ortalama_sepet([0.1, 0.2]) == pytest.approx(0.15)'],
      why: 'Kayan nokta sonucunu == ile karşılaştırmak doğru kodu bile düşürür (yanlış alarm). raises bloğunda hata satırından sonra yazılan assert ise asla çalışmadığı için yanlış güven verir.' },
    { t: 'code', stage: 'Meydan okuma', id: 'pytest-11', diff: 3,
      q: '<p>Mutasyon testi: <code>kampanya_fiyati(tutar, uye=False)</code> kuralları: tutar negatifse <code>ValueError</code>; üyeyse önce yüzde 10 indirim; (indirimli) tutar 1000 ve üstüyse ayrıca 50 TL düş; sonuç 2 ondalığa yuvarlanır. İstediğin kadar <code>test_</code> ile başlayan fonksiyon yaz. Testlerin doğru kodda geçmeli ve gizli <b>7 mutantın hepsini</b> öldürmeli (her mutant için en az bir test başarısız olmalı). Mutantlar sınır, oran, yuvarlama, hata kontrolü ve işlem sırası hatalarını içeriyor.</p>',
      start: 'import pytest\n\ndef kampanya_fiyati(tutar, uye=False):\n    if tutar < 0:\n        raise ValueError("tutar negatif olamaz")\n    if uye:\n        tutar = tutar * 0.9\n    if tutar >= 1000:\n        tutar -= 50\n    return round(tutar, 2)\n\n# test_ ile başlayan fonksiyonlarını yaz\n',
      sol: 'import pytest\n\ndef kampanya_fiyati(tutar, uye=False):\n    if tutar < 0:\n        raise ValueError("tutar negatif olamaz")\n    if uye:\n        tutar = tutar * 0.9\n    if tutar >= 1000:\n        tutar -= 50\n    return round(tutar, 2)\n\ndef test_uye_olmayan_esik_alti_ve_ustu():\n    assert kampanya_fiyati(999.99) == 999.99\n    assert kampanya_fiyati(1000) == 950\n\ndef test_uye_indirimi_ve_sira():\n    assert kampanya_fiyati(500, uye=True) == 450\n    assert kampanya_fiyati(1000, uye=True) == 900\n    assert kampanya_fiyati(2000, uye=True) == 1750\n\ndef test_yuvarlama():\n    assert kampanya_fiyati(33.33, uye=True) == 30.0\n\ndef test_sifir_ve_negatif():\n    assert kampanya_fiyati(0) == 0\n    with pytest.raises(ValueError):\n        kampanya_fiyati(-1)\n',
      tests: 'testler = [f for ad, f in list(globals().items()) if ad.startswith("test_") and callable(f)]\nassert len(testler) >= 1, "test_ ile başlayan en az bir fonksiyon yaz"\ndef _k(tutar, uye=False, esik_op=lambda t: t >= 1000, oran=0.9, yuvarla=True, kontrol=lambda t: t < 0, once_50=False, uye_say=True):\n    if kontrol(tutar):\n        raise ValueError("tutar negatif olamaz")\n    if once_50 and tutar >= 1000:\n        tutar -= 50\n    if uye and uye_say:\n        tutar = tutar * oran\n    if not once_50 and esik_op(tutar):\n        tutar -= 50\n    return round(tutar, 2) if yuvarla else tutar\nmutantlar = [\n    ("eşikte > kullanılıyor", lambda t, uye=False: _k(t, uye, esik_op=lambda x: x > 1000)),\n    ("üye oranı %20", lambda t, uye=False: _k(t, uye, oran=0.8)),\n    ("yuvarlama yok", lambda t, uye=False: _k(t, uye, yuvarla=False)),\n    ("negatif kontrolü yok", lambda t, uye=False: _k(t, uye, kontrol=lambda x: False)),\n    ("50 TL indirimden önce düşülüyor", lambda t, uye=False: _k(t, uye, once_50=True)),\n    ("üyelik yok sayılıyor", lambda t, uye=False: _k(t, uye, uye_say=False)),\n    ("sıfır tutar reddediliyor", lambda t, uye=False: _k(t, uye, kontrol=lambda x: x <= 0)),\n]\ndogru = kampanya_fiyati\ntry:\n    for t in testler:\n        try:\n            t()\n        except BaseException as h:\n            raise AssertionError(f"{t.__name__} DOĞRU kodda başarısız: {type(h).__name__}: {h}")\n    hayatta = []\n    for ad, m in mutantlar:\n        kampanya_fiyati = m\n        olu = False\n        for t in testler:\n            try:\n                t()\n            except BaseException:\n                olu = True\n                break\n        if not olu:\n            hayatta.append(ad)\n    assert not hayatta, f"hayatta kalan mutantlar: {hayatta}"\nfinally:\n    kampanya_fiyati = dogru\n',
      hints: ['Her mutant için kendine sor: hangi girdi doğru kodla bu mutantı ayırır?', 'Sınır: tam 1000 (üye değil). Sıra: üye ve 1000 TL (doğru: 900, mutant: 855). Yuvarlama: üye ve 33.33 (29.997 → 30.0).', 'Sıfır tutar 0 döndürmeli; negatif tutar pytest.raises(ValueError) ile.'],
      why: 'Mutasyon skoru, testlerin gerçekten hata yakalama gücünü ölçer. Kapsam yüzde 100 olsa bile sınır, sıra ve yuvarlama durumları seçilmezse mutantlar hayatta kalır; iyi test tasarımı her olası hata için ayırt edici bir girdi seçmektir.' },
    { t: 'code', stage: 'Mini proje', id: 'pytest-12', diff: 3,
      q: '<p>pytest nasıl çalışır? Küçük bir test koşucusu yaz: <code>kostur(testler)</code> test fonksiyonları listesi alsın ve sözlük döndürsün: <code>{"passed", "failed", "skipped", "xfailed", "xpassed"}</code> sayıları ve <code>"hatalar"</code> listesi. Her fonksiyonun <code>pytestmark</code> listesine bak (yoksa boş):</p><ul><li><code>skip</code> işareti varsa ya da <code>skipif</code> işaretinin ilk argümanı True ise: skipped.</li><li><code>parametrize</code> varsa her durum ayrı test sayılır: <code>fonk(*durum)</code>; yoksa <code>fonk()</code>.</li><li>Çalışma başarılıysa passed (xfail işareti varsa xpassed); herhangi bir <code>Exception</code> fırlarsa failed (xfail varsa xfailed). failed durumunda <code>"ad: HataTürü"</code> metnini hatalar listesine ekle (parametrize\'da ad <code>fonk_adi[indeks]</code>).</li></ul>',
      start: 'import pytest\n\ndef kostur(testler):\n    pass\n',
      sol: 'import pytest\n\ndef kostur(testler):\n    sonuc = {"passed": 0, "failed": 0, "skipped": 0, "xfailed": 0, "xpassed": 0, "hatalar": []}\n    for fonk in testler:\n        isaretler = {m.name: m for m in getattr(fonk, "pytestmark", [])}\n        if "skip" in isaretler or ("skipif" in isaretler and isaretler["skipif"].args[0]):\n            sonuc["skipped"] += 1\n            continue\n        xfail = "xfail" in isaretler\n        if "parametrize" in isaretler:\n            durumlar = [(f"{fonk.__name__}[{i}]", tuple(d) if isinstance(d, (tuple, list)) else (d,)) for i, d in enumerate(isaretler["parametrize"].args[1])]\n        else:\n            durumlar = [(fonk.__name__, ())]\n        for ad, argumanlar in durumlar:\n            try:\n                fonk(*argumanlar)\n            except Exception as h:\n                if xfail:\n                    sonuc["xfailed"] += 1\n                else:\n                    sonuc["failed"] += 1\n                    sonuc["hatalar"].append(f"{ad}: {type(h).__name__}")\n            else:\n                sonuc["xpassed" if xfail else "passed"] += 1\n    return sonuc\n\n@pytest.mark.parametrize("a, b", [(1, 1), (2, 3)])\ndef test_esit(a, b):\n    assert a == b\nprint(kostur([test_esit]))\n',
      tests: 'import pytest\ndef test_gecen():\n    assert 1 + 1 == 2\ndef test_dusen():\n    assert [1, 2] == [1, 3]\n@pytest.mark.skip(reason="bakımda")\ndef test_atlanan():\n    raise RuntimeError("çalışmamalı")\n@pytest.mark.skipif(True, reason="koşul")\ndef test_kosullu_atlanan():\n    raise RuntimeError("çalışmamalı")\n@pytest.mark.skipif(False, reason="koşul yanlış")\ndef test_kosul_yanlis():\n    pass\n@pytest.mark.xfail(reason="bilinen hata")\ndef test_beklenen_hata():\n    raise ZeroDivisionError\n@pytest.mark.xfail(reason="düzelmiş olabilir")\ndef test_beklenmedik_gecis():\n    pass\n@pytest.mark.parametrize("tutar, beklenen", [(100, 120.0), (0, 0.0), (10, 99)])\ndef test_kdv(tutar, beklenen):\n    assert round(tutar * 1.2, 2) == beklenen\n@pytest.mark.parametrize("x", [1, 0])\ndef test_bol(x):\n    10 / x\nr = kostur([test_gecen, test_dusen, test_atlanan, test_kosullu_atlanan, test_kosul_yanlis, test_beklenen_hata, test_beklenmedik_gecis, test_kdv, test_bol])\nassert r["passed"] == 5, f"passed: gecen, kosul_yanlis, kdv[0], kdv[1], bol[0] = 5; gelen {r[\'passed\']}"\nassert r["failed"] == 3, f"failed: dusen, kdv[2], bol[1] = 3; gelen {r[\'failed\']}"\nassert r["skipped"] == 2, "skip ve doğru koşullu skipif atlanmalı"\nassert r["xfailed"] == 1 and r["xpassed"] == 1, "xfail: biri beklenen hata, biri beklenmedik geçiş"\nassert r["hatalar"] == ["test_dusen: AssertionError", "test_kdv[2]: AssertionError", "test_bol[1]: ZeroDivisionError"], f"hatalar listesi: {r[\'hatalar\']}"\nassert kostur([]) == {"passed": 0, "failed": 0, "skipped": 0, "xfailed": 0, "xpassed": 0, "hatalar": []}\n',
      hints: ['İşaretleri ada göre sözlüğe koy: {m.name: m for m in getattr(fonk, "pytestmark", [])}.', 'parametrize işaretinin args[1] elemanı durum listesidir; tek argümanlı durumları demete çevir.', 'try/except Exception/else: else bloğu hata yoksa çalışır.'],
      why: 'pytest\'in çekirdeği budur: topla, işaretleri oku, parametreleri genişlet, her durumu yalıt ve sonucu sınıflandır. İşaretlerin fonksiyona pytestmark özniteliği olarak eklendiğini bilmek, pytest eklentilerini ve hata ayıklamayı anlamayı kolaylaştırır.' }
  ],
  faq: [
    { q: 'unittest ile yazılmış testleri pytest çalıştırabilir mi?', a: 'Evet. pytest unittest.TestCase sınıflarını da toplar ve çalıştırır. Bu yüzden eski bir projeye pytest\'i hemen ekleyip yeni testleri pytest tarzında yazmaya başlayabilirsin; geçiş kademeli olabilir.' },
    { q: 'conftest.py\'yi import etmem gerekir mi?', a: 'Hayır, asla import etme. pytest test klasörlerindeki conftest.py dosyalarını otomatik bulur ve içindeki fixture\'ları o klasör ve alt klasörlerdeki tüm testlere açar.' },
    { q: 'Coverage yüzde kaç olmalı?', a: 'Sihirli bir sayı yoktur; birçok ekip yüzde 80 civarını alt sınır olarak CI\'a koyar. Asıl önemli olan iş açısından kritik yolların (ödeme, faiz, yetki) ve hata yollarının test edilmesidir. Yüzdeyi yükseltmek için anlamsız test yazmak kaliteyi artırmaz.' },
    { q: 'Fixture ile setUp metodu arasındaki fark ne?', a: 'setUp sınıftaki her teste aynı hazırlığı uygular. Fixture ise yalnızca isteyen teste verilir, birbirini kullanabilir (fixture içinde fixture), scope ile paylaşılabilir ve yield ile temizlik yapar. Daha esnek ve birleştirilebilirdir.' },
    { q: 'Bazen geçip bazen düşen (flaky) test ne yapmalıyım?', a: 'Nedenini bul: genelde rastgelelik, saat, test sırası ya da paylaşılan durumdur. random.seed, sabit tarih (monkeypatch ile), function scope fixture ve tmp_path çoğunu çözer. Flaky testi xfail ile susturmak geçici çözümdür; kalıcı olursa ekip testlere güvenmeyi bırakır.' }
  ],
  mistakes: [
    { bad: 'def test_toplam():\n    toplam(sepet) == 135.5', good: 'def test_toplam():\n    assert toplam(sepet) == 135.5', why: 'assert olmadan karşılaştırmanın sonucu atılır; test hiçbir şeyi denetlemez ve hep geçer.' },
    { bad: 'with pytest.raises(ValueError):\n    para_cek(100, -5)\n    assert bakiye == 100', good: 'with pytest.raises(ValueError):\n    para_cek(100, -5)\nassert bakiye == 100', why: 'Hata fırlatan satırdan sonra with bloğundaki kod çalışmaz; sonrasında denetlenecek her şeyi bloğun dışına yaz.' },
    { bad: 'assert faiz(1000, 0.1, 2) == 1210', good: 'assert faiz(1000, 0.1, 2) == pytest.approx(1210)', why: 'Kayan nokta sonuçları küçük farklar taşır (1210.0000000000002); düz == doğru kodu bile düşürür.' },
    { bad: 'def test_kur():\n    KurServisi.usd_kuru = lambda: 32.5\n    assert tl_karsiligi(10) == 325.0', good: 'def test_kur(monkeypatch):\n    monkeypatch.setattr(KurServisi, "usd_kuru", lambda: 32.5)\n    assert tl_karsiligi(10) == 325.0', why: 'Elle yapılan değişiklik test bitince geri alınmaz ve sonraki testleri de etkiler; monkeypatch otomatik geri alır.' },
    { bad: '@pytest.fixture\ndef sepet():\n    return Sepet()\n\ndef test_bos():\n    s = sepet()', good: '@pytest.fixture\ndef sepet():\n    return Sepet()\n\ndef test_bos(sepet):\n    assert sepet.toplam() == 0', why: 'Fixture doğrudan çağrılmaz ("Fixture called directly" hatası); test fonksiyonu adını parametre olarak ister, pytest değeri verir.' }
  ]
});
})(window);
