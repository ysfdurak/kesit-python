/* ───────────────────────── 3. test-yazma ───────────────────────── */
{
  id: 'test-yazma',
  lv: 'orta',
  mod: 'Kalite ve Proje',
  min: 40,
  title: 'Test yazma: unittest, pytest ve mock',
  sum: 'unittest ile TestCase yazar, assert metotlarını ve setUp/subTest kalıplarını kullanır, pytest tarzını tanır, mock ile dış bağımlılığı taklit eder ve TDD döngüsünü uygularsın.',
  goals: [
    'unittest.TestCase ile test sınıfı yazıp assertEqual, assertAlmostEqual, assertRaises gibi metotları kullanabilirim.',
    'setUp/tearDown ve subTest ile tekrarı azaltıp parametreli test kurabilirim.',
    'Test paketini loadTestsFromTestCase ve TextTestRunner ile programatik olarak çalıştırıp sonucu okuyabilirim.',
    'pytest tarzı assert ve parametrize mantığını açıklayabilirim.',
    'unittest.mock ile zaman, ağ gibi dış bağımlılıkları taklit edip TDD döngüsünü uygulayabilirim.'
  ],
  body: `
<h2>Neden test yazarız?</h2>
<p>Anadolu Bank'ta komisyon hesaplayan fonksiyonu değiştirdin; üç ay sonra biri "EFT komisyonu yanlış çıkıyor" dedi. Test olmadan hatanın hangi değişiklikle geldiğini bulmak saatler alır. Test (test) olduğunda ise her değişiklikten sonra tek komutla "hâlâ her şey doğru mu?" sorusunun yanıtını alırsın. Test, kodun sözleşmesidir: "Bu girdiyle bu çıktıyı veririm" cümlesinin çalıştırılabilir hali. İyi test üç şey sağlar: hatayı erken yakalar, kodu korkmadan değiştirmeni (refactoring) sağlar ve fonksiyonun nasıl kullanıldığını belgeler.</p>

<h2>unittest ile ilk test sınıfı</h2>
<p>Python'ın standart test çerçevesi <code>unittest</code>'tir. Kural basit: <code>unittest.TestCase</code>'den türeyen bir sınıf yazarsın, adı <code>test_</code> ile başlayan her metot bir testtir, içinde <code>self.assert...</code> metotlarıyla beklentini belirtirsin. Normalde testleri terminalden <code>python -m unittest</code> ile koşarsın; burada tarayıcıda olduğumuz için paketi (suite) elle yükleyip <code>TextTestRunner</code> ile çalıştıracağız. Çıktıyı <code>io.StringIO</code>'ya yönlendirmek, test raporunun program çıktısına karışmasını önler.</p>
<pre class="py">import io
import unittest

def komisyon(tutar: float, kanal: str) -&gt; float:
    """Anadolu Bank havale komisyonu: mobil ücretsiz, şube binde 5, en az 5 TL."""
    if tutar &lt;= 0:
        raise ValueError("tutar pozitif olmalı")
    if kanal == "mobil":
        return 0.0
    return max(5.0, tutar * 0.005)

class KomisyonTest(unittest.TestCase):
    def test_mobil_ucretsiz(self):
        self.assertEqual(komisyon(1000, "mobil"), 0.0)

    def test_sube_binde_bes(self):
        self.assertAlmostEqual(komisyon(10_000, "sube"), 50.0)

    def test_sube_asgari_bes(self):
        self.assertEqual(komisyon(100, "sube"), 5.0)

    def test_negatif_tutar_hata(self):
        with self.assertRaises(ValueError):
            komisyon(-1, "mobil")

suite = unittest.defaultTestLoader.loadTestsFromTestCase(KomisyonTest)
print("test sayısı:", suite.countTestCases())
sonuc = unittest.TextTestRunner(stream=io.StringIO(), verbosity=0).run(suite)
print("koşan:", sonuc.testsRun, "| hata:", len(sonuc.failures) + len(sonuc.errors))
print("hepsi geçti mi?", sonuc.wasSuccessful())</pre>
<p><code>assertAlmostEqual</code> kayan noktalı sayıları 7 basamağa kadar karşılaştırır; para hesabında <code>assertEqual(0.1 + 0.2, 0.3)</code> yazarsan test boşuna düşer. <code>assertRaises</code> bir bağlam yöneticisidir: bloğun içinde beklenen istisna çıkmazsa test başarısız olur.</p>
<div class="tbl-wrap"><table>
<tr><th>Metot</th><th>Ne kontrol eder</th><th>Örnek</th></tr>
<tr><td>assertEqual(a, b)</td><td>a == b</td><td>assertEqual(topla(2, 3), 5)</td></tr>
<tr><td>assertNotEqual(a, b)</td><td>a != b</td><td>assertNotEqual(token1, token2)</td></tr>
<tr><td>assertTrue(x) / assertFalse(x)</td><td>bool(x)</td><td>assertTrue(gecerli_mi("TR01"))</td></tr>
<tr><td>assertIn(a, b)</td><td>a in b</td><td>assertIn("Ankara", sehirler)</td></tr>
<tr><td>assertIsNone(x)</td><td>x is None</td><td>assertIsNone(bul("yok"))</td></tr>
<tr><td>assertAlmostEqual(a, b, places=2)</td><td>round(a-b, places) == 0</td><td>assertAlmostEqual(kdv, 20.0, places=2)</td></tr>
<tr><td>assertRaises(Hata)</td><td>blok Hata fırlatır</td><td>with self.assertRaises(ValueError): ...</td></tr>
<tr><td>assertCountEqual(a, b)</td><td>aynı elemanlar, sıra fark etmez</td><td>assertCountEqual(sonuc, [1, 2, 3])</td></tr>
</table></div>

<h2>setUp, tearDown ve subTest</h2>
<p>Her testte aynı veriyi kurmak tekrar yaratır. <code>setUp</code> her test metodundan <b>önce</b>, <code>tearDown</code> her testten <b>sonra</b> çalışır; nesneleri <code>self</code> üzerinde paylaşırsın. <code>subTest</code> ise tek bir test metodunda birden çok girdiyi denemeni sağlar; biri düşse bile diğerleri koşmaya devam eder ve rapor hangi girdinin düştüğünü söyler. Bu, pytest'teki <code>parametrize</code>'ın unittest karşılığıdır.</p>
<pre class="py">import io
import unittest

class Sepet:
    def __init__(self):
        self.urunler = []
    def ekle(self, ad, fiyat, adet=1):
        if adet &lt; 1:
            raise ValueError("adet en az 1")
        self.urunler.append((ad, fiyat, adet))
    def toplam(self):
        return sum(f * a for _, f, a in self.urunler)
    def indirimli(self, oran):
        return round(self.toplam() * (1 - oran), 2)

class SepetTest(unittest.TestCase):
    def setUp(self):
        self.sepet = Sepet()
        self.sepet.ekle("klavye", 450.0)
        self.sepet.ekle("kablo", 25.0, 2)

    def tearDown(self):
        self.sepet.urunler.clear()

    def test_toplam(self):
        self.assertEqual(self.sepet.toplam(), 500.0)

    def test_indirim_oranlari(self):
        for oran, beklenen in [(0.0, 500.0), (0.1, 450.0), (0.5, 250.0)]:
            with self.subTest(oran=oran):
                self.assertAlmostEqual(self.sepet.indirimli(oran), beklenen)

    def test_sifir_adet_hata(self):
        with self.assertRaises(ValueError):
            self.sepet.ekle("x", 1.0, 0)

suite = unittest.defaultTestLoader.loadTestsFromTestCase(SepetTest)
adlar = [t.id().split(".")[-1] for t in suite]
print("testler:", adlar)
sonuc = unittest.TextTestRunner(stream=io.StringIO(), verbosity=0).run(suite)
print("başarılı:", sonuc.wasSuccessful(), "| koşan:", sonuc.testsRun)</pre>
<div class="warn"><b>Test adlarını run'dan ÖNCE topla</b>Suite çalıştırıldıktan sonra içi boşaltılır; <code>for t in suite</code> artık hiçbir şey vermez. Test adlarını ya da sayısını raporlayacaksan <code>run</code> çağrısından önce al. Yukarıdaki <code>adlar</code> satırının yeri bu yüzden önemli.</div>
<div class="note"><b>Testler birbirinden bağımsız olmalı</b>unittest metotları alfabetik sırada koşturur, sen yazdığın sırada değil. Bir testin diğerinin bıraktığı veriye güvenmesi gizli hata üretir; setUp her test için temiz başlangıç sağlar.</div>

<h2>pytest tarzı: düz assert ve parametrize</h2>
<p>Sektörde çoğu proje <code>pytest</code> kullanır (pip ile kurulur; burada çalıştıramıyoruz ama tanıman gerekir). Fark biçimseldir: sınıf şart değil, <code>test_</code> ile başlayan düz fonksiyon yeter; <code>self.assertEqual</code> yerine düz <code>assert</code> yazarsın ve pytest hata mesajını kendisi zenginleştirir. Parametreli test için dekoratör vardır:</p>
<pre class="py"># pytest tarzı (gösterim; burada çalıştırmıyoruz)
ornek = '''
import pytest
from bank import komisyon

def test_mobil_ucretsiz():
    assert komisyon(1000, "mobil") == 0.0

@pytest.mark.parametrize("tutar, beklenen", [
    (100, 5.0),
    (10_000, 50.0),
    (2_000, 10.0),
])
def test_sube(tutar, beklenen):
    assert komisyon(tutar, "sube") == pytest.approx(beklenen)

def test_negatif():
    with pytest.raises(ValueError):
        komisyon(-1, "mobil")
'''
print(ornek.strip().count("def test_"), "test fonksiyonu; parametrize 3 ayrı test üretir")
print("komut: pytest -v    ->  test_sube[100-5.0], test_sube[10000-50.0], ...")</pre>
<p>pytest unittest sınıflarını da koşturabilir; yani bugün unittest ile yazdığın testler pytest kurulduğunda da çalışır. Yeni projede pytest, standart kütüphaneyle sınırlı ortamda unittest seçersin; mantık ikisinde de aynı: düzenle (arrange), çalıştır (act), doğrula (assert).</p>

<h2>Dış bağımlılığı taklit etmek: unittest.mock</h2>
<p>"Gece saatinde yapılan işlem şüphelidir" kuralını test etmek istiyorsun; ama fonksiyon <code>datetime.now()</code> çağırıyor ve testin sonucu saat kaçta koştuğuna bağlı. Çözüm, gerçek bağımlılığı sahte bir nesneyle (mock) değiştirmek. <code>patch</code> bir adı geçici olarak değiştirir, <code>MagicMock</code> ise her çağrıyı kaydeden ve istediğin değeri döndüren esnek bir nesnedir. Kural: bağımlılığı <b>kullanıldığı yerde</b> yamalarsın, tanımlandığı yerde değil.</p>
<pre class="py">import io
import unittest
from datetime import datetime
from unittest.mock import MagicMock, patch

class IslemKurali:
    def saat(self) -&gt; int:
        return datetime.now().hour          # dış bağımlılık: gerçek saat

    def gece_mi(self) -&gt; bool:
        s = self.saat()
        return s &gt;= 23 or s &lt; 6

def sms_gonder(gonderici, telefon, metin):
    return gonderici.gonder(telefon, metin)

class KuralTest(unittest.TestCase):
    def test_gece_uc(self):
        with patch.object(IslemKurali, "saat", return_value=3):
            self.assertTrue(IslemKurali().gece_mi())

    def test_ogle_on_iki(self):
        with patch.object(IslemKurali, "saat", return_value=12):
            self.assertFalse(IslemKurali().gece_mi())

    def test_sms_cagrisi(self):
        sahte = MagicMock()
        sahte.gonder.return_value = "OK"
        self.assertEqual(sms_gonder(sahte, "5551234567", "Kod: 1234"), "OK")
        sahte.gonder.assert_called_once_with("5551234567", "Kod: 1234")

suite = unittest.defaultTestLoader.loadTestsFromTestCase(KuralTest)
sonuc = unittest.TextTestRunner(stream=io.StringIO(), verbosity=0).run(suite)
print("başarılı:", sonuc.wasSuccessful(), "| koşan:", sonuc.testsRun)
print("gerçek saat şu an gece mi?", IslemKurali().gece_mi())</pre>
<p><code>patch.object(IslemKurali, "saat", return_value=3)</code> sınıfın <code>saat</code> metodunu blok boyunca sabit 3 döndüren sahte bir metotla değiştirir. Modül düzeyindeki bir fonksiyonu yamalamak için <code>patch("anadolu.kurallar.saat_ver", return_value=3)</code> gibi modül yolu yazarsın; bu derste tek dosyada çalıştığımız için sınıf üzerinden yamalıyoruz. <code>assert_called_once_with</code> ise mock'un tam olarak bu argümanlarla bir kez çağrıldığını doğrular; SMS'in gerçekten gönderilmediğinden de emin olursun.</p>
<div class="tip"><b>Mock'u az kullan</b>Her şeyi mock'larsan testler kodun yapısına yapışır; fonksiyonu yeniden düzenlediğinde testler bozulur ama hata yoktur. Yalnızca yavaş, dışa bağımlı ya da rastgele olanı (saat, ağ, veritabanı, random) taklit et.</div>

<h2>TDD döngüsü: Kırmızı, Yeşil, Düzenle</h2>
<p>Test güdümlü geliştirme (Test-Driven Development) kodu yazmadan önce testi yazmaktır. Döngü üç adımdır ve her tur birkaç dakika sürer:</p>
<div class="steps-list"><ol>
<li><b>Kırmızı:</b> İstediğin davranış için küçük bir test yaz; henüz kod olmadığı için test düşer.</li>
<li><b>Yeşil:</b> Testi geçirecek en basit kodu yaz. Güzel olması gerekmez, geçmesi gerekir.</li>
<li><b>Düzenle (refactor):</b> Testler yeşilken kodu temizle: tekrarı kaldır, ad düzelt. Testler hâlâ yeşilse bitti; sonraki davranışa geç.</li>
</ol></div>
<p>TDD'nin asıl kazancı tasarımdır: fonksiyonu önce kullanan kişi olarak yazdığın için arayüzü (parametre adları, dönüş tipi) kullanıcı gözüyle seçersin. Alıştırmalarda tam bunu yapacaksın: önce test sınıfı, sonra fonksiyon.</p>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Test piramidi ve kurumsal pratik</h3>
<p>Bir projede üç katman test bulunur. Tabanda <b>birim testleri</b> (unit): tek fonksiyon ya da sınıf, milisaniyede koşar, yüzlerce olur. Ortada <b>entegrasyon testleri</b>: veritabanı, dosya, API ile birlikte çalışır; sqlite3 <code>":memory:"</code> burada kahramandır. Tepede <b>uçtan uca</b> testler: gerçek sistemin tamamı; azdır ve yavaştır. Piramidin ters dönmesi (çok uçtan uca, az birim) testlerin yavaş ve kırılgan olmasına yol açar.</p>
<p>Üç pratik kural: Birincisi, test adı bir cümle olsun: <code>test_sube_komisyonu_asgari_bes_lira</code>; düşen testin adı hatayı anlatır. İkincisi, her test tek bir şeyi doğrulasın; üç assert'li test düştüğünde hangisi diye bakmak zaman alır. Üçüncüsü, kapsama (coverage) yüzdesine takılma; kritik iş kuralı (para, yetki, tarih) yüzde yüz, loglama satırı sıfır olabilir. CI (sürekli entegrasyon) ortamında testler her commit'te otomatik koşar; İleri seviyede GitHub Actions ile bunu kuracaksın. O gün geldiğinde elinde zaten yeşil bir test paketi olmalı.</p>
</section>
`,
  ex: [
    { t: 'mc', q: 'Anadolu Bank\'ta <code>faiz(1000, 0.03)</code> fonksiyonunun <code>30.0</code> döndürmesini bekliyorsun; sonuç float. Hangi assert en uygundur?',
      o: ['self.assertEqual(faiz(1000, 0.03), 30)', 'self.assertTrue(faiz(1000, 0.03) == 30.0)', 'self.assertAlmostEqual(faiz(1000, 0.03), 30.0)', 'self.assertIs(faiz(1000, 0.03), 30.0)'],
      a: 2,
      why: 'Float sonuçlar yuvarlama farkı taşıyabilir; assertAlmostEqual 7 basamağa kadar yakınlığı kabul eder. assertEqual ve assertTrue tam eşitlik ister, assertIs ise kimlik (aynı nesne) karşılaştırır ve float için yanlıştır.' },

    { t: 'code', id: 'test-yazma-1',
      q: '<p>Hazır gelen <code>komisyon(tutar, kanal)</code> fonksiyonu için <code>KomisyonTest(unittest.TestCase)</code> sınıfını yaz. En az üç test metodu olsun: (1) <code>test_mobil</code>: mobil kanalda 0.0 döner; (2) <code>test_sube</code>: 10000 TL şube işleminde 50.0 döner (assertAlmostEqual); (3) <code>test_negatif</code>: negatif tutarda <code>ValueError</code> fırlatılır (assertRaises). Metot adları tam böyle olsun.</p>',
      start: 'import unittest\n\ndef komisyon(tutar, kanal):\n    if tutar <= 0:\n        raise ValueError("tutar pozitif olmalı")\n    if kanal == "mobil":\n        return 0.0\n    return max(5.0, tutar * 0.005)\n\nclass KomisyonTest(unittest.TestCase):\n    pass\n',
      sol: 'import unittest\n\ndef komisyon(tutar, kanal):\n    if tutar <= 0:\n        raise ValueError("tutar pozitif olmalı")\n    if kanal == "mobil":\n        return 0.0\n    return max(5.0, tutar * 0.005)\n\nclass KomisyonTest(unittest.TestCase):\n    def test_mobil(self):\n        self.assertEqual(komisyon(1000, "mobil"), 0.0)\n\n    def test_sube(self):\n        self.assertAlmostEqual(komisyon(10000, "sube"), 50.0)\n\n    def test_negatif(self):\n        with self.assertRaises(ValueError):\n            komisyon(-1, "mobil")\n',
      tests: 'import io\nimport unittest\nassert issubclass(KomisyonTest, unittest.TestCase), "KomisyonTest unittest.TestCase\'den türemeli"\nsuite = unittest.defaultTestLoader.loadTestsFromTestCase(KomisyonTest)\nadlar = {t.id().split(".")[-1] for t in suite}\nfor ad in ("test_mobil", "test_sube", "test_negatif"):\n    assert ad in adlar, f"{ad} adlı test metodu olmalı"\nsonuc = unittest.TextTestRunner(stream=io.StringIO(), verbosity=0).run(suite)\nassert sonuc.testsRun >= 3, "En az 3 test koşmalı"\nassert sonuc.wasSuccessful(), "Tüm testler geçmeli (doğru fonksiyona karşı testler düşmemeli)"\n',
      hints: ['def test_mobil(self): self.assertEqual(komisyon(1000, "mobil"), 0.0)', 'with self.assertRaises(ValueError): komisyon(-1, "mobil")'],
      why: 'Üç test üç davranışı belgeler: ücretsiz kanal, oran hesabı ve hata durumu. assertRaises bağlam yöneticisi olarak kullanıldığında bloktaki çağrının istisna fırlatması beklenir.' },

    { t: 'code', id: 'test-yazma-2',
      q: '<p>TDD: önce test var, kod yok. Aşağıdaki <code>SepetTest</code> sınıfı hazır. Testleri geçirecek <code>Sepet</code> sınıfını yaz: <code>ekle(ad, fiyat, adet=1)</code> (adet 1\'den küçükse <code>ValueError</code>), <code>toplam()</code> (fiyat × adet toplamı) ve <code>indirimli(oran)</code> (toplamın <code>1 - oran</code> katı, <code>round(..., 2)</code>).</p>',
      start: 'import unittest\n\nclass Sepet:\n    # TDD: testleri geçirecek sınıfı yaz\n    pass\n\nclass SepetTest(unittest.TestCase):\n    def setUp(self):\n        self.sepet = Sepet()\n        self.sepet.ekle("klavye", 450.0)\n        self.sepet.ekle("kablo", 25.0, 2)\n\n    def test_toplam(self):\n        self.assertEqual(self.sepet.toplam(), 500.0)\n\n    def test_indirim(self):\n        for oran, beklenen in [(0.0, 500.0), (0.1, 450.0), (0.5, 250.0)]:\n            with self.subTest(oran=oran):\n                self.assertAlmostEqual(self.sepet.indirimli(oran), beklenen)\n\n    def test_sifir_adet(self):\n        with self.assertRaises(ValueError):\n            self.sepet.ekle("x", 1.0, 0)\n',
      sol: 'import unittest\n\nclass Sepet:\n    def __init__(self):\n        self.urunler = []\n\n    def ekle(self, ad, fiyat, adet=1):\n        if adet < 1:\n            raise ValueError("adet en az 1")\n        self.urunler.append((ad, fiyat, adet))\n\n    def toplam(self):\n        return sum(f * a for _, f, a in self.urunler)\n\n    def indirimli(self, oran):\n        return round(self.toplam() * (1 - oran), 2)\n\nclass SepetTest(unittest.TestCase):\n    def setUp(self):\n        self.sepet = Sepet()\n        self.sepet.ekle("klavye", 450.0)\n        self.sepet.ekle("kablo", 25.0, 2)\n\n    def test_toplam(self):\n        self.assertEqual(self.sepet.toplam(), 500.0)\n\n    def test_indirim(self):\n        for oran, beklenen in [(0.0, 500.0), (0.1, 450.0), (0.5, 250.0)]:\n            with self.subTest(oran=oran):\n                self.assertAlmostEqual(self.sepet.indirimli(oran), beklenen)\n\n    def test_sifir_adet(self):\n        with self.assertRaises(ValueError):\n            self.sepet.ekle("x", 1.0, 0)\n',
      tests: 'import io\nimport unittest\nsuite = unittest.defaultTestLoader.loadTestsFromTestCase(SepetTest)\nsayi = suite.countTestCases()\nsonuc = unittest.TextTestRunner(stream=io.StringIO(), verbosity=0).run(suite)\nassert sonuc.testsRun == sayi == 3, "3 test koşmalı"\nassert sonuc.wasSuccessful(), "Sepet sınıfı tüm testleri geçmeli"\ns = Sepet()\nassert s.toplam() == 0, "Boş sepetin toplamı 0 olmalı"\ns.ekle("a", 10.0, 3)\nassert s.toplam() == 30.0, "10 x 3 = 30 olmalı"\nassert s.indirimli(0.25) == 22.5, "30 * 0.75 = 22.5 olmalı"\n',
      hints: ['__init__ içinde self.urunler = [] tut; ekle demet eklesin.', 'toplam: sum(fiyat * adet ...); indirimli: round(self.toplam() * (1 - oran), 2)'],
      why: 'Testler arayüzü önceden belirledi; sınıf yalnızca onları geçecek kadar yazıldı. setUp her testte yeni sepet kurduğu için testler birbirini etkilemez.' },

    { t: 'mc', q: '<code>suite = loadTestsFromTestCase(T)</code> yükledin ve <code>run(suite)</code> çağırdın. Sonra <code>[t.id() for t in suite]</code> boş liste döndü. Neden?',
      o: ['Testler başarısız olduğu için suite temizlendi', 'id() yalnızca pytest\'te vardır', 'TextTestRunner suite\'i çalıştırdıktan sonra içini boşaltır', 'loadTestsFromTestCase tembel (lazy) çalışır'],
      a: 2,
      why: 'unittest, çalıştırılan testleri bellekten düşürmek için suite\'i run sonrasında boşaltır. Test adlarını ya da sayısını kaydetmek istiyorsan run çağrısından önce topla.' },

    { t: 'code', id: 'test-yazma-3',
      q: '<p>Anadolu Bank şüpheli işlem kuralı: <code>IslemKurali.gece_mi()</code>, <code>self.saat()</code> 23 ve üzeri ya da 6\'dan küçükse True döner. <code>GeceTest(unittest.TestCase)</code> sınıfını yaz; <code>unittest.mock.patch.object(IslemKurali, "saat", return_value=...)</code> kullanarak iki test metodu oluştur: <code>test_gece</code> (saat 2 iken <code>IslemKurali().gece_mi()</code> True) ve <code>test_gunduz</code> (saat 14 iken False). Testler gerçek saate bağımlı olmamalı.</p>',
      start: 'import unittest\nfrom datetime import datetime\nfrom unittest.mock import patch\n\nclass IslemKurali:\n    def saat(self):\n        return datetime.now().hour\n\n    def gece_mi(self):\n        s = self.saat()\n        return s >= 23 or s < 6\n\nclass GeceTest(unittest.TestCase):\n    pass\n',
      sol: 'import unittest\nfrom datetime import datetime\nfrom unittest.mock import patch\n\nclass IslemKurali:\n    def saat(self):\n        return datetime.now().hour\n\n    def gece_mi(self):\n        s = self.saat()\n        return s >= 23 or s < 6\n\nclass GeceTest(unittest.TestCase):\n    def test_gece(self):\n        with patch.object(IslemKurali, "saat", return_value=2):\n            self.assertTrue(IslemKurali().gece_mi())\n\n    def test_gunduz(self):\n        with patch.object(IslemKurali, "saat", return_value=14):\n            self.assertFalse(IslemKurali().gece_mi())\n',
      tests: 'import io\nimport unittest\nfrom unittest.mock import patch\nsuite = unittest.defaultTestLoader.loadTestsFromTestCase(GeceTest)\nadlar = {t.id().split(".")[-1] for t in suite}\nassert {"test_gece", "test_gunduz"} <= adlar, "test_gece ve test_gunduz metotları olmalı"\n# Testler gerçek saatten bağımsız olmalı: datetime.now sabitlenince de geçmeli\nimport datetime as _dt\nclass _SahteDT(_dt.datetime):\n    _saat = 12\n    @classmethod\n    def now(cls, tz=None):\n        return _dt.datetime(2024, 1, 1, cls._saat, 0, 0)\nfor sabit in (3, 12, 23):\n    _SahteDT._saat = sabit\n    globals()["datetime"] = _SahteDT\n    s2 = unittest.defaultTestLoader.loadTestsFromTestCase(GeceTest)\n    r = unittest.TextTestRunner(stream=io.StringIO(), verbosity=0).run(s2)\n    globals()["datetime"] = _dt.datetime\n    assert r.wasSuccessful(), f"saat {sabit} iken bile testler geçmeli (patch.object kullanılmalı)"\nsonuc = unittest.TextTestRunner(stream=io.StringIO(), verbosity=0).run(suite)\nassert sonuc.testsRun >= 2 and sonuc.wasSuccessful(), "Tüm testler geçmeli"\n',
      hints: ['with patch.object(IslemKurali, "saat", return_value=2): self.assertTrue(IslemKurali().gece_mi())', 'patch.object bloğu bitince gerçek saat metodu geri gelir.'],
      why: 'patch.object, gece_mi içinde çağrılan saat metodunu blok süresince sahte bir metotla değiştirir; test ne zaman koşarsa koşsun aynı sonucu verir.' },

    { t: 'code', id: 'test-yazma-4',
      q: '<p><code>iban_gecerli(iban)</code> fonksiyonu hazır: "TR" ile başlayıp toplam 26 karakter ve ilk ikisinden sonrası rakam ise True. <code>IbanTest(unittest.TestCase)</code> sınıfında <b>tek</b> bir <code>test_ornekler</code> metodu yaz; içinde <code>self.subTest(iban=...)</code> ile şu dört örneği sırayla dene: <code>"TR" + "1"*24</code> → True, <code>"DE" + "1"*24</code> → False, <code>"TR123"</code> → False, <code>"TR" + "A"*24</code> → False.</p>',
      start: 'import unittest\n\ndef iban_gecerli(iban):\n    return len(iban) == 26 and iban.startswith("TR") and iban[2:].isdigit()\n\nclass IbanTest(unittest.TestCase):\n    pass\n',
      sol: 'import unittest\n\ndef iban_gecerli(iban):\n    return len(iban) == 26 and iban.startswith("TR") and iban[2:].isdigit()\n\nclass IbanTest(unittest.TestCase):\n    def test_ornekler(self):\n        ornekler = [\n            ("TR" + "1" * 24, True),\n            ("DE" + "1" * 24, False),\n            ("TR123", False),\n            ("TR" + "A" * 24, False),\n        ]\n        for iban, beklenen in ornekler:\n            with self.subTest(iban=iban):\n                self.assertEqual(iban_gecerli(iban), beklenen)\n',
      tests: 'import io\nimport unittest\nsuite = unittest.defaultTestLoader.loadTestsFromTestCase(IbanTest)\nadlar = [t.id().split(".")[-1] for t in suite]\nassert adlar == ["test_ornekler"], "Yalnızca test_ornekler adlı tek bir test metodu olmalı"\nassert "subTest" in __source__, "subTest kullanılmalı"\nsonuc = unittest.TextTestRunner(stream=io.StringIO(), verbosity=0).run(suite)\nassert sonuc.testsRun == 1 and sonuc.wasSuccessful(), "test_ornekler geçmeli"\n# Yanlış fonksiyona karşı test düşmeli (test gerçekten kontrol ediyor mu?)\n_orj = iban_gecerli\ndef iban_gecerli(iban):\n    return True\ns2 = unittest.defaultTestLoader.loadTestsFromTestCase(IbanTest)\nr2 = unittest.TextTestRunner(stream=io.StringIO(), verbosity=0).run(s2)\nassert not r2.wasSuccessful(), "Her zaman True dönen fonksiyona karşı test düşmeli (False beklenen örnekler kontrol edilmeli)"\niban_gecerli = _orj\n',
      hints: ['Örnekleri (iban, beklenen) listesinde tut, for ile dön.', 'with self.subTest(iban=iban): self.assertEqual(iban_gecerli(iban), beklenen)'],
      why: 'subTest tek metotta çok girdi dener; düşen alt test diğerlerini durdurmaz ve rapor hangi iban\'ın düştüğünü gösterir. Testin bozuk fonksiyonda düşmesi, testin gerçekten bir şey kontrol ettiğinin kanıtıdır.' },

    { t: 'mc', q: '<code>rapor.py</code> modülü <code>from saat import simdi</code> ile saat fonksiyonunu içe aktarıp kullanıyor. Testte hangi yolu yamalamalısın?',
      o: ['patch("saat.simdi")', 'patch("rapor.simdi")', 'patch("datetime.datetime.now")', 'patch("simdi")'],
      a: 1,
      why: 'from ... import ile ad rapor modülünün ad alanına kopyalanır; rapor o kopyayı kullanır. Bu yüzden bağımlılık kullanıldığı yerde (rapor.simdi) yamalanır; saat.simdi yamalansa rapor hâlâ eski referansı tutar.' },

    { t: 'mc', q: 'TDD döngüsünde "Yeşil" adımının amacı nedir?',
      o: ['Kodu en temiz haliyle yazmak', 'Testi geçirecek en basit kodu yazmak', 'Tüm olası testleri önceden yazmak', 'Kapsama raporunu yüzde yüze çıkarmak'],
      a: 1,
      why: 'Yeşil adımı yalnızca testi geçirmeye odaklanır; temizlik bir sonraki Düzenle (refactor) adımının işidir. Tüm testleri önceden yazmak TDD\'nin küçük adımlar ilkesine aykırıdır.' }
  ],
  faq: [
    { q: 'unittest mi pytest mi öğrenmeliyim?', a: 'İkisini de tanı. unittest kurulum gerektirmez ve her ortamda vardır; pytest sektörde yaygın, daha kısa ve okunur. pytest unittest sınıflarını da çalıştırır, yani burada yazdığın testler boşa gitmez.' },
    { q: 'Testleri gerçek projede nasıl çalıştırırım?', a: 'Terminalde proje kökünde python -m unittest discover (tests/ klasöründeki test_*.py dosyalarını bulur) ya da pytest. Bu derste tarayıcıda olduğumuz için suite\'i elle yükleyip TextTestRunner ile koşturuyoruz.' },
    { q: 'Özel (private) metotları test etmeli miyim?', a: 'Genelde hayır; testler dışa açık davranışı doğrular. Özel metot karmaşıksa bu, onun ayrı bir sınıfa ya da fonksiyona çıkması gerektiğinin işaretidir.' },
    { q: 'Mock ile her şeyi taklit etmek zararlı mı?', a: 'Aşırı mock testleri kodun iç yapısına bağlar; yeniden düzenlemede testler bozulur ama hata yoktur. Yalnızca dışa bağımlı ya da yavaş parçayı (saat, ağ, veritabanı, dosya) taklit et.' }
  ],
  mistakes: [
    { bad: 'def mobil_testi(self):\n    self.assertEqual(komisyon(100, "mobil"), 0)', good: 'def test_mobil(self):\n    self.assertEqual(komisyon(100, "mobil"), 0)', why: 'unittest yalnızca adı test_ ile başlayan metotları toplar; diğer ad hiç çalışmaz ve "hepsi geçti" yanılgısı doğar.' },
    { bad: 'self.assertEqual(kdv(100), 20.000000001)', good: 'self.assertAlmostEqual(kdv(100), 20.0, places=2)', why: 'Float sonuçlar yuvarlama farkı taşır; assertAlmostEqual belirli basamağa kadar yakınlığı kabul eder.' },
    { bad: 'self.assertRaises(ValueError, komisyon(-1, "x"))', good: 'with self.assertRaises(ValueError):\n    komisyon(-1, "x")', why: 'İlk biçimde fonksiyon assertRaises\'e girmeden çağrılır ve istisna testin dışında patlar. Bağlam yöneticisi biçimi çağrıyı denetim altında yapar.' },
    { bad: 'sonuc = runner.run(suite)\nadlar = [t.id() for t in suite]', good: 'adlar = [t.id() for t in suite]\nsonuc = runner.run(suite)', why: 'Suite çalıştırıldıktan sonra boşaltılır; adlar run\'dan önce toplanmalıdır.' }
  ]
},
