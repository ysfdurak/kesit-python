import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from h import py, pc, d

KOS = d('''
    import io as _io, unittest as _u
    def _kos(cls):
        return _u.TextTestRunner(stream=_io.StringIO(), verbosity=0).run(_u.defaultTestLoader.loadTestsFromTestCase(cls))
''')

html = (
'<h2>Derinleş: İyi test yazmanın araç kutusu</h2>\n'
'<p>Test yazabiliyorsun; şimdi soru şu: testlerin <b>gerçekten hata yakalıyor mu</b>? Her zaman geçen bir test, hiç olmayan testten daha tehlikelidir çünkü sahte güven verir. Bu bölümde doğru assert metodunu seçmeyi, mock\'u ayrıntılı kullanmayı (<code>side_effect</code>, çağrı doğrulama, <code>spec</code>), belge içi testleri (doctest), testleri komut satırından koşturmayı ve kapsamı (coverage) ölçmeyi görüyoruz. pytest\'in fixture ve eklenti dünyası <i>pytest</i> dersinde, property-based test ve CI entegrasyonu <i>test-ileri</i> ile <i>kalite-ci</i> derslerinde.</p>\n'

'<h3>Doğru assert, iyi hata mesajı</h3>\n'
'<p><code>assertTrue(a == b)</code> düşerse yalnızca "False is not true" yazar; <code>assertEqual(a, b)</code> ise iki değeri ve farkı gösterir. Hata mesajı, testi yazmayan birinin sorunu anlamasını sağlamalıdır.</p>\n'
'<div class="tbl-wrap"><table>'
'<tr><th>Durum</th><th>unittest</th><th>pytest karşılığı</th></tr>'
'<tr><td>Eşitlik (liste/sözlük farkını gösterir)</td><td><code>assertEqual(a, b)</code></td><td><code>assert a == b</code></td></tr>'
'<tr><td>Float karşılaştırma</td><td><code>assertAlmostEqual(a, b, places=2)</code></td><td><code>a == pytest.approx(b)</code></td></tr>'
'<tr><td>Sırasız aynı elemanlar</td><td><code>assertCountEqual(a, b)</code></td><td><code>Counter(a) == Counter(b)</code></td></tr>'
'<tr><td>İstisna ve mesajı</td><td><code>assertRaisesRegex(ValueError, "negatif")</code></td><td><code>pytest.raises(ValueError, match="negatif")</code></td></tr>'
'<tr><td>Üyelik, tip, None</td><td><code>assertIn</code>, <code>assertIsInstance</code>, <code>assertIsNone</code></td><td><code>assert x in y</code> ...</td></tr>'
'<tr><td>Log üretildi mi</td><td><code>assertLogs("ad", level="WARNING")</code></td><td><code>caplog</code> fixture</td></tr>'
'<tr><td>Bilerek atla / beklenen hata</td><td><code>@skip</code>, <code>@expectedFailure</code></td><td><code>@pytest.mark.skip</code>, <code>xfail</code></td></tr>'
'</table></div>\n'
+ py('''
    import io, unittest

    def iade(tutar, gun):
        if tutar < 0:
            raise ValueError("tutar negatif olamaz")
        return tutar if gun <= 14 else round(tutar * 0.5, 2)

    class IadeTest(unittest.TestCase):
        def test_mesaj_kontrolu(self):
            with self.assertRaisesRegex(ValueError, "negatif"):
                iade(-1, 3)

        def test_istisna_nesnesi(self):
            with self.assertRaises(ValueError) as bag:
                iade(-5, 1)
            self.assertIn("tutar", str(bag.exception))

        def test_sirasiz(self):
            self.assertCountEqual([iade(100, 20), iade(10, 1)], [10, 50.0])

        def test_kotu_mesaj_ornegi(self):
            self.assertTrue(iade(100, 20) == 100)     # bilerek yanlış: mesaja bak

    r = unittest.TextTestRunner(stream=io.StringIO(), verbosity=0).run(unittest.defaultTestLoader.loadTestsFromTestCase(IadeTest))
    print("koşan:", r.testsRun, "| düşen:", len(r.failures))
    print("assertTrue mesajı:", r.failures[0][1].strip().splitlines()[-1])
''') +

'<h3>Mock ayrıntıları: side_effect, çağrı doğrulama, spec</h3>\n'
'<p><code>return_value</code> her çağrıda aynı değeri döndürür. <code>side_effect</code> ise üç şey olabilir: bir <b>liste</b> (her çağrıda sıradaki değer; istisna nesnesi varsa fırlatılır), bir <b>istisna</b> (her çağrıda fırlatılır) ya da bir <b>fonksiyon</b> (argümanlara göre hesaplar). Böylece "banka ilk iki denemede zaman aşımına düştü, üçüncüde başardı" senaryosunu ağa çıkmadan test edersin. Ardından mock\'a ne ile, kaç kez çağrıldığını sorarsın.</p>\n'
+ py('''
    from unittest.mock import Mock, call

    class BankaHatasi(Exception):
        pass

    def tahsil_et(banka, tutar, deneme=3):
        for i in range(deneme):
            try:
                return banka.cek(tutar)
            except BankaHatasi:
                if i == deneme - 1:
                    raise

    banka = Mock()
    banka.cek.side_effect = [BankaHatasi("zaman aşımı"), BankaHatasi("zaman aşımı"), "ONAY-77"]
    print(tahsil_et(banka, 250))
    print("çağrı sayısı:", banka.cek.call_count)
    banka.cek.assert_called_with(250)
    print(banka.cek.call_args_list == [call(250)] * 3)

    sms = Mock()
    sms.gonder("0555", "Siparişiniz yolda")
    sms.gonder.assert_called_once_with("0555", "Siparişiniz yolda")
    sms.gonder.reset_mock()
    sms.gonder.assert_not_called()

    class SmsServisi:
        def gonder(self, numara, metin): ...
    siki = Mock(spec=SmsServisi)
    try:
        siki.gondr("0555", "x")             # yazım hatası: spec yakalar
    except AttributeError as e:
        print("spec yakaladı:", e)
''') +
'<div class="warn"><b>spec kullanmayan mock her şeye evet der</b>Düz <code>Mock()</code> var olmayan bir metoda da çağrı kabul eder; gerçek sınıfta metot adı değişse bile testlerin geçmeye devam eder. <code>Mock(spec=Sinif)</code> ya da <code>patch(..., autospec=True)</code> ile mock\'u gerçek arayüze bağla.</div>\n'

'<h3>Test dublörleri ve bağımlılık enjeksiyonu</h3>\n'
'<p>Her sahte nesne "mock" değildir. <b>Stub</b> hazır cevap verir, <b>mock</b> çağrıları doğrular, <b>fake</b> çalışan ama basit bir gerçekleme sunar (ör. sözlükle çalışan bellek içi depo). En temiz yöntem çoğu zaman yamalamak değil, bağımlılığı parametre olarak almaktır (dependency injection): fonksiyon saati, depoyu ya da istemciyi dışarıdan alırsa testte gerçeğinin yerine basit bir fake verirsin.</p>\n'
+ py('''
    from datetime import datetime

    class BellekDepo:                         # fake: gerçek veritabanının basit hâli
        def __init__(self):
            self.kayitlar = {}
        def kaydet(self, no, veri):
            self.kayitlar[no] = veri

    def siparis_al(depo, no, tutar, saat=datetime.now):
        damga = saat()
        depo.kaydet(no, {"tutar": tutar, "gece": damga.hour < 6})
        return damga

    depo = BellekDepo()
    sabit = lambda: datetime(2026, 3, 15, 2, 30)   # stub saat
    siparis_al(depo, "S-1", 120, saat=sabit)
    print(depo.kayitlar)
''') +

'<h3>doctest: belgedeki örnek de bir testtir</h3>\n'
'<p>Docstring içine <code>&gt;&gt;&gt;</code> ile yazdığın örnekleri <code>doctest</code> çalıştırıp çıktıyı karşılaştırır. Belge ile kodun birbirinden kopmasını engeller; küçük saf fonksiyonlar için idealdir, karmaşık senaryolar için unittest/pytest daha uygundur.</p>\n'
+ py('''
    import doctest

    def kurus(tutar_tl):
        """TL tutarını kuruşa çevirir.

        >>> kurus(12.5)
        1250
        >>> kurus(0.1)
        10
        """
        return round(tutar_tl * 100)

    kosucu = doctest.DocTestRunner(verbose=False)
    for t in doctest.DocTestFinder().find(kurus, "kurus", globs={"kurus": kurus}):
        kosucu.run(t)
    print(kosucu.summarize(verbose=False))
''') +

'<h3>Komut satırında koşturmak ve kapsam ölçmek</h3>\n'
'<p>Testler genelde <code>tests/</code> klasöründe <code>test_*.py</code> dosyalarında durur. Kendi bilgisayarında proje kökünde şu komutları kullanırsın:</p>\n'
+ pc('''
    python -m unittest discover -s tests -v          # tüm unittest testleri
    python -m unittest tests.test_sepet.SepetTest.test_toplam   # tek test
    python -m doctest -v kurus.py                    # docstring örnekleri

    pip install pytest pytest-cov                    # sanal ortam etkinken
    pytest -q                                        # kısa çıktı
    pytest -k "iade and not negatif"                 # adla süz
    pytest -x --lf                                   # ilk hatada dur, son düşenleri tekrar koş
    pytest --cov=src --cov-report=term-missing       # kapsam: hangi satırlar test edilmedi
''') +
'<p>Sık karşılaşılan sorunlar: <code>Ran 0 tests</code> görüyorsan dosya adı <code>test_</code> ile başlamıyor ya da <code>tests</code> klasöründe <code>__init__.py</code> yok (unittest discover için gerekebilir). <code>ModuleNotFoundError: No module named \'src\'</code> alıyorsan paketi <code>pip install -e .</code> ile kur ya da testleri proje kökünden çalıştır. Kapsam (coverage) yüzdesi hedef değil, bir el fenerdir: %100 kapsam doğru assert\'ler olmadan hiçbir şey kanıtlamaz.</p>\n'
'<div class="tip"><b>Testini test et</b>Bir testin değerli olup olmadığını anlamanın en kısa yolu: koddaki bir koşulu bilerek boz (ör. <code>&lt;=</code> yerine <code>&lt;</code>) ve testin <b>kırmızıya döndüğünü</b> gör. Buna mutasyon testi denir; <code>mutmut</code> gibi araçlar bunu otomatik yapar. Bu dersteki bazı alıştırmalar da testini bozuk bir gerçeklemeye karşı koşturarak doğrular.</div>\n'
'<div class="note"><b>Gerçek işte</b>Ilgaz Bank\'ta bir hata canlıya çıktığında ilk iş, hatayı yeniden üreten bir test yazmaktır (regression test); test kırmızıyken düzeltme yapılır, yeşile dönünce birleştirilir. Pull request\'ler ancak tüm testler CI\'da geçtiğinde ve değişen satırların kapsamı belirli bir eşiğin üzerinde olduğunda onaylanır. Dış servisler (SMS, ödeme, kur) testlerde her zaman spec\'li mock ya da fake ile değiştirilir; test süitinin ağsız ve birkaç saniyede bitmesi hedeflenir.</div>\n'
)

ex = [
  dict(t='mc', stage='Isınma', q='<code>sehirler()</code> fonksiyonu doğru şehirleri döndürüyor ama sırası her çalıştırmada değişebiliyor (küme kullanıyor). Hangi assert en uygundur?',
       o=['self.assertEqual(sehirler(), ["Van", "Ankara"])', 'self.assertCountEqual(sehirler(), ["Van", "Ankara"])', 'self.assertTrue(sehirler())', 'self.assertIn("Van", sehirler())'], a=1,
       why='assertCountEqual elemanları sıradan bağımsız (tekrar sayılarıyla birlikte) karşılaştırır. assertEqual sıraya duyarlıdır ve rastgele düşer; assertTrue ve assertIn ise yanlış sonuçları da kabul edecek kadar zayıftır.'),
  dict(t='predict', stage='Kodu oku', q='Bu kod ne yazdırır?',
       code=d('''
           from unittest.mock import Mock
           m = Mock(side_effect=[1, ValueError("ağ"), 3])
           print(m())
           try:
               m()
           except ValueError as e:
               print("hata", e)
           print(m(), m.call_count)
       '''),
       o=['1\nhata ağ\n3 3', '1\nhata ağ\n3 2', '1\n3 3', '1\nhata ağ\nStopIteration'], a=0,
       why='side_effect listesi sırayla tüketilir; istisna nesnesine gelindiğinde fırlatılır. Hata veren çağrı da sayılır, bu yüzden call_count 3\'tür.'),
  dict(t='predict', stage='Kodu oku', q='Bu kod ne yazdırır?',
       code=d('''
           import math
           from unittest.mock import patch
           with patch("math.floor", return_value=99):
               print(math.floor(3.7))
           print(math.floor(3.7))
       '''),
       o=['99\n99', '3\n3', '99\n3', '3\n99'], a=2,
       why='patch bağlam yöneticisi olarak kullanıldığında yalnızca with bloğu içinde adı değiştirir; blok bitince orijinal fonksiyon geri yüklenir.'),
  dict(t='predict', stage='Kodu oku', q='Bu kod ne yazdırır?',
       code=d('''
           import io, unittest
           class T(unittest.TestCase):
               def test_a(self):
                   self.assertEqual(1 + 1, 3)
               def test_b(self):
                   {}["yok"]
               def test_c(self):
                   self.assertIn("a", "kalem")
               def yardimci(self):
                   self.fail("çalışmamalı")
           r = unittest.TextTestRunner(stream=io.StringIO()).run(unittest.defaultTestLoader.loadTestsFromTestCase(T))
           print(r.testsRun, len(r.failures), len(r.errors))
       '''),
       o=['4 2 1', '3 1 1', '3 2 0', '3 0 2'], a=1,
       why='Yalnızca test_ ile başlayan üç metot koşar. Assert düşmesi "failure", beklenmeyen istisna (KeyError) ise "error" sayılır: 3 koşu, 1 failure, 1 error.'),
  dict(t='order', stage='Kodu oku',
       q='<p>Geçersiz sayı metninde <code>ValueError</code> beklendiğini doğrulayan testi yazıp koşturan kodun satırlarını sırala.</p>',
       lines=['import io, unittest', 'class DonusumTest(unittest.TestCase):', '    def test_gecersiz(self):', '        with self.assertRaises(ValueError):', '            int("on iki")', 'r = unittest.TextTestRunner(stream=io.StringIO()).run(unittest.defaultTestLoader.loadTestsFromTestCase(DonusumTest))', 'print(r.wasSuccessful(), r.testsRun)'],
       expect='True 1\n',
       hint='Hata vermesi beklenen satır with bloğunun İÇİNDE olmalı.',
       why='assertRaises bağlam yöneticisi, blok içindeki kodun belirtilen istisnayı fırlatmasını bekler; fırlatırsa test geçer. Koşturucu sınıf tanımlandıktan sonra çağrılır.'),
  dict(t='code', stage='Rehberli', id='test-yazma-x1', diff=2,
       q='<p><code>iade_tutari(tutar, gun)</code> hazır: tutar negatifse <code>ValueError("tutar negatif olamaz")</code>; <b>14 gün dahil</b> tam iade; 15–30 gün yarı iade (<code>round(tutar / 2, 2)</code>); 30 günden sonra 0. <code>IadeTest(unittest.TestCase)</code> sınıfını yaz: en az şu testler olsun: <code>test_sinirlar</code> (subTest ile 14, 15, 30, 31. günler), <code>test_negatif</code> (<code>assertRaisesRegex</code> ile mesajda "negatif" geçtiğini doğrula). Testlerin, bozuk gerçeklemeleri yakalayıp yakalamadığı da denetlenecek.</p>',
       guide=['test_sinirlar içinde (gun, beklenen) çiftlerinden bir liste kur: 14→100, 15→50, 30→50, 31→0 (tutar 100).', 'Her çift için with self.subTest(gun=gun): içinde assertEqual.', 'test_negatif: with self.assertRaisesRegex(ValueError, "negatif"): iade_tutari(-1, 3).', 'Sınır değerleri (14/15, 30/31) atlama: hatalar en çok orada çıkar.'],
       example=d('''
           import io, unittest
           def not_harfi(p):
               return "geçti" if p >= 50 else "kaldı"
           class NotTest(unittest.TestCase):
               def test_sinir(self):
                   for p, b in [(49, "kaldı"), (50, "geçti")]:
                       with self.subTest(p=p):
                           self.assertEqual(not_harfi(p), b)
           r = unittest.TextTestRunner(stream=io.StringIO()).run(unittest.defaultTestLoader.loadTestsFromTestCase(NotTest))
           print(r.wasSuccessful())
       '''),
       start=d('''
           import unittest

           def iade_tutari(tutar, gun):
               if tutar < 0:
                   raise ValueError("tutar negatif olamaz")
               if gun <= 14:
                   return tutar
               if gun <= 30:
                   return round(tutar / 2, 2)
               return 0

           class IadeTest(unittest.TestCase):
               def test_sinirlar(self):
                   # TODO: 14, 15, 30, 31. günleri subTest ile dene
                   pass

               def test_negatif(self):
                   # TODO: assertRaisesRegex ile mesajı doğrula
                   pass
       '''),
       sol=d('''
           import unittest

           def iade_tutari(tutar, gun):
               if tutar < 0:
                   raise ValueError("tutar negatif olamaz")
               if gun <= 14:
                   return tutar
               if gun <= 30:
                   return round(tutar / 2, 2)
               return 0

           class IadeTest(unittest.TestCase):
               def test_sinirlar(self):
                   for gun, beklenen in [(14, 100), (15, 50), (30, 50), (31, 0)]:
                       with self.subTest(gun=gun):
                           self.assertEqual(iade_tutari(100, gun), beklenen)

               def test_negatif(self):
                   with self.assertRaisesRegex(ValueError, "negatif"):
                       iade_tutari(-1, 3)
       '''),
       tests=KOS + d('''
           _dogru = iade_tutari
           assert _kos(IadeTest).wasSuccessful(), "testler doğru gerçeklemede geçmeli"
           assert _kos(IadeTest).testsRun >= 2, "en az iki test metodu olmalı"
           _mutantlar = {
               "14. gün yarı iade (< yerine <=)": lambda t, g: (_ for _ in ()).throw(ValueError("negatif")) if t < 0 else (t if g < 14 else round(t / 2, 2) if g <= 30 else 0),
               "31. gün yarı iade": lambda t, g: (_ for _ in ()).throw(ValueError("negatif")) if t < 0 else (t if g <= 14 else round(t / 2, 2) if g <= 31 else 0),
               "negatifte yanlış mesaj": lambda t, g: (_ for _ in ()).throw(ValueError("geçersiz")) if t < 0 else (t if g <= 14 else round(t / 2, 2) if g <= 30 else 0),
               "negatif kontrolü yok": lambda t, g: t if g <= 14 else round(t / 2, 2) if g <= 30 else 0,
           }
           for _ad, _m in _mutantlar.items():
               globals()["iade_tutari"] = _m
               assert not _kos(IadeTest).wasSuccessful(), f"testlerin şu hatayı yakalamadı: {_ad}"
           globals()["iade_tutari"] = _dogru
       '''),
       hints=['Sınır değer testi: kuralın değiştiği her noktanın iki yanını dene.', 'for gun, beklenen in [...]: with self.subTest(gun=gun): self.assertEqual(...)', 'assertRaisesRegex(ValueError, "negatif") hem türü hem mesajı denetler.'],
       why='Hataların çoğu sınırlarda (<= ile < farkı) çıkar; her eşiğin iki yanını test etmek bu mutantları yakalar. assertRaisesRegex ise yanlış nedenle fırlatılan aynı türdeki istisnayı da ayırt eder.'),
  dict(t='code', stage='Rehberli', id='test-yazma-x2', diff=2,
       q='<p><code>siparis_onayla(siparis, sms)</code> hazır: tutar 0\'dan büyükse <code>sms.gonder(telefon, "Siparişiniz {no} onaylandı")</code> çağırır ve <code>True</code> döndürür; değilse SMS göndermez, <code>False</code> döndürür. <code>OnayTest</code> sınıfını <code>unittest.mock.Mock</code> ile yaz: <code>test_sms_gider</code> (doğru argümanlarla <b>bir kez</b> çağrıldığını <code>assert_called_once_with</code> ile doğrula) ve <code>test_sifir_tutar</code> (<code>assert_not_called</code>).</p>',
       guide=['from unittest.mock import Mock ile içe aktar.', 'Her testte yeni bir sms = Mock() oluştur.', 'Örnek sipariş sözlüğü kur: {"no": "S-1", "telefon": "0555", "tutar": 100}.', 'Fonksiyonu çağır, dönüş değerini assertTrue/assertFalse ile, mock\'u assert_called_once_with / assert_not_called ile denetle.'],
       example=d('''
           from unittest.mock import Mock
           def hosgeldin(eposta_servisi, ad):
               eposta_servisi.yolla(f"Merhaba {ad}")
           e = Mock()
           hosgeldin(e, "Ayşe")
           e.yolla.assert_called_once_with("Merhaba Ayşe")
           print("doğrulandı", e.yolla.call_args)
       '''),
       start=d('''
           import unittest
           from unittest.mock import Mock

           def siparis_onayla(siparis, sms):
               if siparis["tutar"] <= 0:
                   return False
               sms.gonder(siparis["telefon"], f"Siparişiniz {siparis['no']} onaylandı")
               return True

           class OnayTest(unittest.TestCase):
               def test_sms_gider(self):
                   sms = Mock()
                   # TODO: çağır ve doğrula
                   pass

               def test_sifir_tutar(self):
                   # TODO
                   pass
       '''),
       sol=d('''
           import unittest
           from unittest.mock import Mock

           def siparis_onayla(siparis, sms):
               if siparis["tutar"] <= 0:
                   return False
               sms.gonder(siparis["telefon"], f"Siparişiniz {siparis['no']} onaylandı")
               return True

           class OnayTest(unittest.TestCase):
               def test_sms_gider(self):
                   sms = Mock()
                   self.assertTrue(siparis_onayla({"no": "S-1", "telefon": "0555", "tutar": 100}, sms))
                   sms.gonder.assert_called_once_with("0555", "Siparişiniz S-1 onaylandı")

               def test_sifir_tutar(self):
                   sms = Mock()
                   self.assertFalse(siparis_onayla({"no": "S-2", "telefon": "0555", "tutar": 0}, sms))
                   sms.gonder.assert_not_called()
       '''),
       tests=KOS + d('''
           _dogru = siparis_onayla
           assert _kos(OnayTest).wasSuccessful(), "testler doğru gerçeklemede geçmeli"
           def _m1(s, sms):
               sms.gonder(s["telefon"], f"Siparişiniz {s['no']} onaylandı")
               return s["tutar"] > 0
           def _m2(s, sms):
               if s["tutar"] <= 0:
                   return False
               sms.gonder(s["telefon"], f"Siparişiniz {s['no']} onaylandı")
               sms.gonder(s["telefon"], f"Siparişiniz {s['no']} onaylandı")
               return True
           def _m3(s, sms):
               if s["tutar"] <= 0:
                   return False
               sms.gonder(s["telefon"], "Siparişiniz onaylandı")
               return True
           def _m4(s, sms):
               if s["tutar"] <= 0:
                   return False
               sms.gonder(s["telefon"], f"Siparişiniz {s['no']} onaylandı")
           for _ad, _m in [("sıfır tutarda da SMS", _m1), ("iki kez SMS", _m2), ("mesajda sipariş no yok", _m3), ("True döndürmüyor", _m4)]:
               globals()["siparis_onayla"] = _m
               assert not _kos(OnayTest).wasSuccessful(), f"testlerin şu hatayı yakalamadı: {_ad}"
           globals()["siparis_onayla"] = _dogru
       '''),
       hints=['Mock\'un her metodu kendiliğinden bir Mock\'tur: sms.gonder çağrıları kaydedilir.', 'sms.gonder.assert_called_once_with("0555", "Siparişiniz S-1 onaylandı")', 'Dönüş değerini de doğrula: assertTrue(...) / assertFalse(...).'],
       why='Mock gerçek SMS göndermeden çağrıyı kaydeder; assert_called_once_with hem çağrı sayısını hem argümanları denetler. Yan etkisi olan fonksiyonlarda yalnızca dönüş değerini test etmek yetmez; yan etkinin kendisini de doğrula.'),
  dict(t='code', stage='Rehberli', id='test-yazma-x3', diff=1,
       q='<p><code>kdv_ekle(tutar, oran=0.20)</code> fonksiyonunu yaz: <code>round(tutar * (1 + oran), 2)</code> döndürsün. Docstring\'ine <b>en az iki</b> doctest örneği ekle; biri varsayılan oranla, biri farklı oranla. Testler docstring örneklerini <code>doctest</code> ile çalıştırıp hepsinin geçtiğini denetleyecek.</p>',
       guide=['Fonksiyonun hemen altına üç tırnaklı docstring yaz.', 'Her örnek: &gt;&gt;&gt; ile başlayan çağrı satırı, altında beklenen çıktı.', 'Çıktıyı Python\'un yazacağı biçimde yaz (ör. 120.0).', 'Docstring\'den sonra return satırını yaz.'],
       example=d('''
           import doctest
           def ikiye_kat(x):
               """
               >>> ikiye_kat(4)
               8
               """
               return x * 2
           print(doctest.testmod())
       '''),
       start=d('''
           def kdv_ekle(tutar, oran=0.20):
               """KDV dahil tutarı döndürür.

               # TODO: en az iki >>> örneği ekle
               """
               pass
       '''),
       sol=d('''
           def kdv_ekle(tutar, oran=0.20):
               """KDV dahil tutarı döndürür.

               >>> kdv_ekle(100)
               120.0
               >>> kdv_ekle(50, 0.10)
               55.0
               """
               return round(tutar * (1 + oran), 2)
       '''),
       tests=d('''
           import doctest as _dt
           _tests = _dt.DocTestFinder().find(kdv_ekle, "kdv_ekle", globs={"kdv_ekle": kdv_ekle})
           _ornek = sum(len(t.examples) for t in _tests)
           assert _ornek >= 2, f"docstring'de en az 2 doctest örneği olmalı, {_ornek} bulundu"
           _r = _dt.DocTestRunner(verbose=False)
           for _t in _tests:
               _r.run(_t, out=lambda s: None)
           assert _r.failures == 0, "docstring örneklerinden biri gerçek çıktıyla uyuşmuyor"
           assert kdv_ekle(100) == 120.0 and kdv_ekle(10, 0.01) == 10.1, "kdv_ekle hesabı yanlış"
       '''),
       hints=['Örnek satırı: &gt;&gt;&gt; kdv_ekle(100)', 'Altındaki satır tam çıktı olmalı: 120.0 (120 değil).', 'return round(tutar * (1 + oran), 2)'],
       why='doctest, belgede gösterdiğin örneği gerçek çağrıyla karşılaştırır; böylece belge kodla birlikte doğru kalır. Çıktı metin olarak karşılaştırıldığı için 120 ile 120.0 farklıdır.'),
  dict(t='code', stage='Kendin yaz', id='test-yazma-x4', diff=2,
       q='<p>Bir test koşturucusunun ne yaptığını anlamak için minik bir tane yaz. <code>calistir(testler)</code>, test fonksiyonlarının listesini alsın ve her birini çağırsın. <code>{"gecti": [...], "kaldi": [...], "hata": [...]}</code> sözlüğü döndürsün (fonksiyon <b>adları</b>, <code>__name__</code>). <code>AssertionError</code> fırlatan test "kaldi", başka herhangi bir istisna fırlatan "hata", hiç fırlatmayan "gecti" sayılır. Bir testin düşmesi diğerlerini durdurmamalı.</p>',
       start=d('''
           def calistir(testler):
               pass
       '''),
       sol=d('''
           def calistir(testler):
               sonuc = {"gecti": [], "kaldi": [], "hata": []}
               for t in testler:
                   try:
                       t()
                   except AssertionError:
                       sonuc["kaldi"].append(t.__name__)
                   except Exception:
                       sonuc["hata"].append(t.__name__)
                   else:
                       sonuc["gecti"].append(t.__name__)
               return sonuc
       '''),
       tests=d('''
           def test_bir():
               assert 1 + 1 == 2
           def test_iki():
               assert "a" in "xyz", "a yok"
           def test_uc():
               {}["k"]
           def test_dort():
               pass
           _r = calistir([test_bir, test_iki, test_uc, test_dort])
           assert _r == {"gecti": ["test_bir", "test_dort"], "kaldi": ["test_iki"], "hata": ["test_uc"]}, f"yanlış: {_r}"
           assert calistir([]) == {"gecti": [], "kaldi": [], "hata": []}, "boş liste"
       '''),
       hints=['except AssertionError, except Exception\'dan ÖNCE gelmeli (AssertionError da bir Exception\'dır).', 'try/except/else: else bloğu istisna olmadığında çalışır.'],
       why='unittest ve pytest\'in çekirdeği budur: her testi izole çağırmak, AssertionError\'ı "failure", diğer istisnaları "error" olarak sınıflandırmak. except sırası önemlidir; daha özel istisna önce yakalanır.'),
  dict(t='code', stage='Kendin yaz', id='test-yazma-x5', diff=2,
       q='<p><code>KurTest(unittest.TestCase)</code> sınıfını yaz. Hazır kodda <code>KurServisi.getir(doviz)</code> gerçek ağa çıkıyor (testte çağrılırsa <code>ConnectionError</code>). <code>fiyat_tl(usd, servis)</code> USD fiyatı TL\'ye çevirip 2 basamağa yuvarlıyor. <code>unittest.mock.patch.object</code> ile <code>KurServisi.getir</code>\'i yamalayan (dönüş 32.5) ve <code>fiyat_tl(10, KurServisi())</code> sonucunun 325.0 olduğunu, <code>getir</code>\'in <code>"USD"</code> ile çağrıldığını doğrulayan <code>test_cevirim</code> metodunu yaz.</p>',
       start=d('''
           import unittest
           from unittest.mock import patch

           class KurServisi:
               def getir(self, doviz):
                   raise ConnectionError("testte ağa çıkılmaz")

           def fiyat_tl(usd, servis):
               return round(usd * servis.getir("USD"), 2)

           class KurTest(unittest.TestCase):
               pass
       '''),
       sol=d('''
           import unittest
           from unittest.mock import patch

           class KurServisi:
               def getir(self, doviz):
                   raise ConnectionError("testte ağa çıkılmaz")

           def fiyat_tl(usd, servis):
               return round(usd * servis.getir("USD"), 2)

           class KurTest(unittest.TestCase):
               def test_cevirim(self):
                   with patch.object(KurServisi, "getir", return_value=32.5) as sahte:
                       self.assertEqual(fiyat_tl(10, KurServisi()), 325.0)
                   sahte.assert_called_once_with("USD")
       '''),
       tests=KOS + d('''
           _r = _kos(KurTest)
           assert _r.testsRun >= 1, "test_cevirim metodu olmalı"
           assert _r.wasSuccessful(), f"test geçmeli; ağa çıkılmamalı: {[str(e[1])[-200:] for e in _r.errors + _r.failures]}"
           _dogru = fiyat_tl
           globals()["fiyat_tl"] = lambda usd, servis: round(usd * servis.getir("EUR"), 2)
           assert not _kos(KurTest).wasSuccessful(), "yanlış dövizle çağrıyı yakalamalı (assert_called_once_with)"
           globals()["fiyat_tl"] = lambda usd, servis: round(usd * 30, 2)
           assert not _kos(KurTest).wasSuccessful(), "kur kullanılmadan sabit hesaplanırsa yakalamalı"
           globals()["fiyat_tl"] = _dogru
           try:
               KurServisi().getir("USD")
           except ConnectionError:
               pass
           else:
               raise AssertionError("yama test bitince geri alınmalı (with ya da dekoratör kullan)")
       '''),
       hints=['patch.object(Sinif, "metot_adi", return_value=...) sınıftaki metodu geçici değiştirir.', 'with ... as sahte: bloğu içinde fiyat_tl çağır; sahte.assert_called_once_with("USD").', 'Sonucu assertEqual ile 325.0\'a karşı denetle.'],
       why='patch.object, adı metin olarak yazmadan doğrudan sınıf nesnesi üzerinden yama yapar ve with bloğu bitince orijinali geri koyar. Hem sonucu hem de bağımlılığa giden çağrıyı doğrulamak iki farklı hatayı yakalar.'),
  dict(t='code', stage='Hata avı', kind='bug', id='test-yazma-x6', diff=2,
       q='<p>Ekipteki biri <code>KampanyaTest</code>\'i yazdı; testler hep yeşil. Ama <code>indirimli</code> fonksiyonu bozulduğunda bile yeşil kalıyor! Testteki <b>hatayı bul ve düzelt</b> (fonksiyona dokunma). Düzeltilmiş test doğru fonksiyonda geçmeli, bozuk sürümleri yakalamalı.</p>',
       start=d('''
           import unittest

           def indirimli(tutar, oran):
               return round(tutar * (1 - oran), 2)

           class KampanyaTest(unittest.TestCase):
               def test_yuzde_on(self):
                   self.assertTrue(indirimli(200, 0.10), 180.0)

               def test_sifir(self):
                   self.assertTrue(indirimli(99.9, 0), 99.9)
       '''),
       sol=d('''
           import unittest

           def indirimli(tutar, oran):
               return round(tutar * (1 - oran), 2)

           class KampanyaTest(unittest.TestCase):
               def test_yuzde_on(self):
                   self.assertEqual(indirimli(200, 0.10), 180.0)

               def test_sifir(self):
                   self.assertEqual(indirimli(99.9, 0), 99.9)
       '''),
       tests=KOS + d('''
           _dogru = indirimli
           assert _kos(KampanyaTest).wasSuccessful(), "doğru fonksiyonda testler geçmeli"
           for _ad, _m in [("oran eklenmiş", lambda t, o: round(t * (1 + o), 2)), ("indirim yok", lambda t, o: t + 1)]:
               globals()["indirimli"] = _m
               assert not _kos(KampanyaTest).wasSuccessful(), f"testler şu bozukluğu yakalamalı: {_ad}"
           globals()["indirimli"] = _dogru
       '''),
       hints=['assertTrue(x, msg) ikinci argümanı MESAJ olarak alır, karşılaştırmaz.', 'Sıfırdan farklı her sayı "doğru" sayıldığı için test hep geçer.', 'assertEqual(gercek, beklenen) kullan.'],
       why='assertTrue(a, b) yalnızca a\'nın doğruluk değerine bakar; b hata mesajıdır. Bu klasik hata, hiçbir şeyi test etmeyen yeşil testler üretir. Testini, kodu bilerek bozarak sına.'),
  dict(t='code', stage='Hata avı', kind='bug', id='test-yazma-x7', diff=2,
       q='<p><code>SepetTest</code>\'teki testler tek tek çalışınca geçiyor, birlikte çalışınca biri düşüyor. Testler birbirinden bağımsız olmalı. <b>Hatayı bul ve düzelt</b> (Sepet sınıfına dokunma).</p>',
       start=d('''
           import unittest

           class Sepet:
               def __init__(self):
                   self.kalemler = []
               def ekle(self, fiyat):
                   self.kalemler.append(fiyat)
               def toplam(self):
                   return sum(self.kalemler)

           class SepetTest(unittest.TestCase):
               sepet = Sepet()

               def test_a_tek_urun(self):
                   self.sepet.ekle(10)
                   self.assertEqual(self.sepet.toplam(), 10)

               def test_b_iki_urun(self):
                   self.sepet.ekle(5)
                   self.sepet.ekle(7)
                   self.assertEqual(self.sepet.toplam(), 12)
       '''),
       sol=d('''
           import unittest

           class Sepet:
               def __init__(self):
                   self.kalemler = []
               def ekle(self, fiyat):
                   self.kalemler.append(fiyat)
               def toplam(self):
                   return sum(self.kalemler)

           class SepetTest(unittest.TestCase):
               def setUp(self):
                   self.sepet = Sepet()

               def test_a_tek_urun(self):
                   self.sepet.ekle(10)
                   self.assertEqual(self.sepet.toplam(), 10)

               def test_b_iki_urun(self):
                   self.sepet.ekle(5)
                   self.sepet.ekle(7)
                   self.assertEqual(self.sepet.toplam(), 12)
       '''),
       tests=KOS + d('''
           _r = _kos(SepetTest)
           assert _r.testsRun == 2, "iki test koşmalı"
           assert _r.wasSuccessful(), "testler birlikte çalışınca da geçmeli: her test kendi sepetini almalı"
           assert _kos(SepetTest).wasSuccessful(), "ikinci kez koşturunca da geçmeli (paylaşılan durum kalmamalı)"
       '''),
       hints=['Sınıf gövdesindeki sepet = Sepet() tüm testlerce PAYLAŞILAN tek nesnedir.', 'Her testten önce çalışan metot hangisiydi?', 'def setUp(self): self.sepet = Sepet()'],
       why='Sınıf özniteliği bir kez oluşturulur ve tüm test metotları aynı nesneyi kullanır; ilk testin eklediği ürün ikinciye sızar. setUp her testten önce taze nesne kurar ve testleri sıradan bağımsız yapar.'),
  dict(t='code', stage='Meydan okuma', id='test-yazma-x8', diff=3,
       q='<p>pytest\'in <code>parametrize</code>\'ını taklit eden bir dekoratör yaz: <code>parametreli(vakalar)</code>. <code>vakalar</code> argüman demetlerinin listesidir. Süslenen test fonksiyonu argümansız çağrıldığında her vaka için orijinal fonksiyonu <code>f(*vaka)</code> ile çalıştırsın; <b>hepsini</b> denesin (ilk hatada durmasın). Düşen vaka varsa sonunda tek bir <code>AssertionError</code> fırlatsın ve mesajında düşen vakaların <b>indekslerini</b> <code>"başarısız vakalar: [1, 3]"</code> biçiminde versin. Süslenen fonksiyonun <code>__name__</code>\'i korunsun.</p>',
       start=d('''
           def parametreli(vakalar):
               def dekorator(f):
                   return f
               return dekorator
       '''),
       sol=d('''
           import functools

           def parametreli(vakalar):
               def dekorator(f):
                   @functools.wraps(f)
                   def sarmal():
                       dusenler = []
                       for i, vaka in enumerate(vakalar):
                           try:
                               f(*vaka)
                           except AssertionError:
                               dusenler.append(i)
                       if dusenler:
                           raise AssertionError(f"başarısız vakalar: {dusenler}")
                   return sarmal
               return dekorator
       '''),
       tests=d('''
           _cagri = []
           @parametreli([(1, 2, 3), (2, 2, 5), (0, 0, 0), (5, 5, 11)])
           def test_topla(a, b, beklenen):
               _cagri.append((a, b))
               assert a + b == beklenen
           assert test_topla.__name__ == "test_topla", "functools.wraps ile ad korunmalı"
           try:
               test_topla()
           except AssertionError as _e:
               assert "başarısız vakalar: [1, 3]" in str(_e), f"mesaj düşen indeksleri vermeli: {_e}"
           else:
               raise AssertionError("düşen vaka varken AssertionError fırlatılmalı")
           assert len(_cagri) == 4, "ilk hatada durmadan dört vakanın hepsi denenmeli"
           @parametreli([(1,), (2,)])
           def test_pozitif(x):
               assert x > 0
           assert test_pozitif() is None, "hepsi geçerse sessizce bitmeli"
       '''),
       hints=['Üç katman: parametreli(vakalar) -> dekorator(f) -> sarmal().', 'Döngüde her vakayı try/except AssertionError içinde çalıştır, indeksi biriktir.', 'Döngü bitince liste doluysa raise AssertionError(f"başarısız vakalar: {dusenler}"); functools.wraps(f) adı korur.'],
       why='Argüman alan dekoratör bir dekoratör fabrikasıdır. Vakaları biriktirip sonda tek hata fırlatmak, pytest\'in her vakayı ayrı raporlamasının basit bir taklididir; wraps, test keşfi ve raporlar için fonksiyon adını korur.'),
]

faq = [
  dict(q='Ne kadar test yeterli? %100 kapsam hedeflemeli miyim?', a='Kapsam hangi satırların hiç çalışmadığını gösterir; ne kadar iyi test edildiğini göstermez. İş kuralları, sınır değerler ve geçmişte hata çıkan yerler önceliklidir. Çoğu ekip %80 civarı bir eşikle birlikte "değişen kodun testi olsun" kuralı uygular.'),
  dict(q='Mock mu kullanmalıyım, fake mi?', a='Dış sistemle "konuşmanın kendisi" önemliyse (doğru SMS doğru numaraya gitti mi) mock ile çağrıyı doğrula. Davranış önemliyse (kaydettiğim veriyi geri okuyabiliyor muyum) basit bir fake (bellek içi depo) daha sağlam testler üretir; çünkü uygulama içindeki her çağrıya bağlanmazsın.'),
]
mistakes = [
  dict(bad='self.assertTrue(toplam(), 150)', good='self.assertEqual(toplam(), 150)', why='assertTrue\'nun ikinci argümanı hata mesajıdır; sıfırdan farklı her sonuç testi geçirir.'),
  dict(bad='m = Mock()\nm.gondr("0555")   # yazım hatası sessizce geçer', good='m = Mock(spec=SmsServisi)\nm.gonder("0555", "metin")', why='spec olmadan mock her metodu kabul eder; gerçek arayüz değişince testler yanlışlıkla yeşil kalır.'),
]

EXT = dict(id='test-yazma', min=35, html=html, ex=ex, faq=faq, mistakes=mistakes)
