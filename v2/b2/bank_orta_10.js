/* PythonPatika — pratik bankası (orta): Test, Otomasyon (b-301…b-310) */
(function (W) {
'use strict';
const B = W.PY_BANK = W.PY_BANK || [];
B.push(
  {
    id: 'b-301',
    lv: 'orta',
    topic: 'Test',
    diff: 2,
    t: 'order',
    kind: 'order',
    title: 'subTest ile tablo tabanlı test',
    q: '<p>KDV hesabını birden çok girdiyle sınayan bir <code>unittest</code> sınıfını tanımlayıp programın içinden çalıştıran kodu sırala. Çıktı <code>1 0</code> olmalı (1 test çalıştı, 0 başarısız).</p>',
    lines: ['import io, unittest', 'class KdvTest(unittest.TestCase):', '    def test_tutarlar(self):', '        for tutar, beklenen in [(100, 120.0), (0, 0.0), (19.99, 23.99)]:', '            with self.subTest(tutar=tutar):', '                self.assertEqual(round(tutar * 1.2, 2), beklenen)', 'sonuc = unittest.TextTestRunner(stream=io.StringIO()).run(unittest.defaultTestLoader.loadTestsFromTestCase(KdvTest))', 'print(sonuc.testsRun, len(sonuc.failures))'],
    expect: '1 0\n',
    hint: 'Test sınıfı çalıştırılmadan önce tanımlanmalı; subTest bloğu döngünün içinde, assert de subTest\'in içinde olmalı.',
    hints: ['Test sınıfı çalıştırılmadan önce tanımlanmalı; subTest bloğu döngünün içinde, assert de subTest\'in içinde olmalı.'],
    why: '<code>subTest</code>, tek test metodunda birçok girdiyi dener ve bir girdi başarısız olsa bile diğerlerini çalıştırmaya devam eder; raporda hangi <code>tutar</code> ile başarısız olduğu görünür. Böylece "tablo tabanlı" (table-driven) testler kopyala-yapıştır metotlara gerek kalmadan yazılır. pytest\'te karşılığı <code>@pytest.mark.parametrize</code>\'dır. <code>TextTestRunner(stream=...)</code> testleri program içinden çalıştırıp sonucu nesne olarak almayı sağlar.',
    tags: ['unittest', 'subTest', 'TextTestRunner'],
    min: 4
  },

  {
    id: 'b-302',
    lv: 'orta',
    topic: 'Test',
    diff: 2,
    kind: 'rehberli',
    title: 'Banka API\'sini Mock ile taklit et',
    q: '<p><code>odeme_yap(hesap, tutar, banka_api)</code> gerçek banka API\'sine istek atıyor; testte gerçek para çekilemez. <code>OdemeTest(unittest.TestCase)</code> sınıfına iki test yaz ve <code>banka_api</code> yerine <code>unittest.mock.Mock</code> ver:</p><ul><li><code>test_onay</code>: API <code>{"durum": "onay"}</code> döndürünce fonksiyon <code>True</code> dönmeli ve <code>cek</code> <b>tam bir kez</b> <code>(hesap, tutar)</code> argümanlarıyla çağrılmalı.</li><li><code>test_negatif_tutar</code>: tutar 0 ya da negatifse <code>ValueError</code> fırlamalı ve API <b>hiç çağrılmamalı</b>.</li></ul><p>Testlerin, fonksiyonun hatalı sürümlerini yakalaması gerekiyor (değerlendirici bunu deniyor).</p>',
    guide: ['<code>api = Mock()</code> oluştur; <code>api.cek.return_value = {"durum": "onay"}</code> ile dönüşü ayarla.', '<code>self.assertTrue(odeme_yap("TR1", 100, api))</code> ile sonucu doğrula.', '<code>api.cek.assert_called_once_with("TR1", 100)</code> ile çağrıyı doğrula.', 'İkinci testte <code>with self.assertRaises(ValueError):</code> içinde çağır, sonra <code>api.cek.assert_not_called()</code>.'],
    example: 'from unittest.mock import Mock\nsms = Mock()\nsms.gonder.return_value = "ok"\nprint(sms.gonder("0532...", "Kodunuz: 1234"))   # ok\nsms.gonder.assert_called_once_with("0532...", "Kodunuz: 1234")\nprint(sms.gonder.call_count)                    # 1\n',
    start: 'import unittest\nfrom unittest.mock import Mock\n\ndef odeme_yap(hesap, tutar, banka_api):\n    if tutar <= 0:\n        raise ValueError("tutar pozitif olmalı")\n    sonuc = banka_api.cek(hesap, tutar)\n    return sonuc["durum"] == "onay"\n\n\nclass OdemeTest(unittest.TestCase):\n    def test_onay(self):\n        # TODO 1: Mock API kur, dönüşü ayarla\n        # TODO 2: sonucu ve çağrı argümanlarını doğrula\n        pass\n\n    def test_negatif_tutar(self):\n        # TODO 3: ValueError ve API\'nin hiç çağrılmadığını doğrula\n        pass\n',
    sol: 'import unittest\nfrom unittest.mock import Mock\n\ndef odeme_yap(hesap, tutar, banka_api):\n    if tutar <= 0:\n        raise ValueError("tutar pozitif olmalı")\n    sonuc = banka_api.cek(hesap, tutar)\n    return sonuc["durum"] == "onay"\n\n\nclass OdemeTest(unittest.TestCase):\n    def test_onay(self):\n        api = Mock()\n        api.cek.return_value = {"durum": "onay"}\n        self.assertTrue(odeme_yap("TR1", 100, api))\n        api.cek.assert_called_once_with("TR1", 100)\n\n    def test_negatif_tutar(self):\n        api = Mock()\n        with self.assertRaises(ValueError):\n            odeme_yap("TR1", -5, api)\n        api.cek.assert_not_called()\n',
    tests: 'import unittest as _ut, io as _io\ndef _calistir(sinif):\n    s = _ut.defaultTestLoader.loadTestsFromTestCase(sinif)\n    return _ut.TextTestRunner(stream=_io.StringIO(), verbosity=0).run(s)\nr = _calistir(OdemeTest)\nassert r.testsRun >= 2 and r.wasSuccessful(), "testlerin doğru fonksiyonda GEÇMESİ gerekir"\n_dogru = odeme_yap\ndef odeme_yap(hesap, tutar, banka_api):\n    return banka_api.cek(hesap, tutar)["durum"] == "onay"\nassert not _calistir(OdemeTest).wasSuccessful(), "tutar kontrolü olmayan hatalı sürümü yakalamalısın (assertRaises + assert_not_called)"\ndef odeme_yap(hesap, tutar, banka_api):\n    if tutar <= 0:\n        raise ValueError("x")\n    return banka_api.cek(tutar, hesap)["durum"] == "onay"\nassert not _calistir(OdemeTest).wasSuccessful(), "argümanları ters gönderen sürümü yakalamalısın (assert_called_once_with)"\ndef odeme_yap(hesap, tutar, banka_api):\n    if tutar <= 0:\n        raise ValueError("x")\n    banka_api.cek(hesap, tutar)\n    return banka_api.cek(hesap, tutar)["durum"] == "onay"\nassert not _calistir(OdemeTest).wasSuccessful(), "API\'yi iki kez çağıran (çift çekim!) sürümü yakalamalısın: called_ONCE"\nodeme_yap = _dogru\n',
    hints: ['<code>Mock</code> nesnesinin her özniteliği de bir Mock\'tur; <code>api.cek</code> otomatik oluşur.', 'Dönüş değeri: <code>api.cek.return_value = {...}</code>; çağrı denetimi: <code>assert_called_once_with</code>.', 'Negatif testte API\'nin çağrılmadığını <code>api.cek.assert_not_called()</code> ile kanıtla.'],
    why: 'Mock, dış bağımlılığı (banka, e-posta, ödeme servisi) taklit ederek testi hızlı, tekrarlanabilir ve yan etkisiz yapar. Yalnızca dönüş değerini test etmek yetmez: "API tam bir kez, doğru argümanlarla çağrıldı mı?" sorusu çift çekim gibi gerçek para kaybettiren hataları yakalar. Bağımlılığı parametre olarak almak (dependency injection) Mock\'u kolaylaştırır; modül içinde sabit çağrılan bir fonksiyonu taklit etmek gerekirse <code>unittest.mock.patch</code> kullanılır.',
    tags: ['unittest.mock', 'Mock', 'assert_called_once_with'],
    min: 9
  },

  {
    id: 'b-303',
    lv: 'orta',
    topic: 'Test',
    diff: 3,
    kind: 'yaz',
    title: 'Mutantları öldüren test sınıfı',
    q: '<p>Kupon kuralları: <code>indirimli_fiyat(fiyat, kod)</code> → <code>"YAZ10"</code> %10, <code>"VIP25"</code> %25 indirim uygular (sonuç <code>round(..., 2)</code>); kod <code>None</code> ise fiyat aynen döner; bilinmeyen kodda <code>KeyError</code>; fiyat negatifse <code>ValueError</code>. Fonksiyon hazır. Sen <code>IndirimTest(unittest.TestCase)</code> sınıfını yaz: değerlendirici testlerini doğru fonksiyonda çalıştırıp <b>geçmesini</b>, sonra 4 hatalı sürümde (mutant) çalıştırıp <b>her birinde başarısız olmasını</b> bekliyor. Her kuralı en az bir testle kapsa.</p>',
    start: 'import unittest\n\nORANLAR = {"YAZ10": 0.10, "VIP25": 0.25}\n\ndef indirimli_fiyat(fiyat, kod):\n    if fiyat < 0:\n        raise ValueError("fiyat negatif olamaz")\n    if kod is None:\n        return fiyat\n    return round(fiyat * (1 - ORANLAR[kod]), 2)\n\n\nclass IndirimTest(unittest.TestCase):\n    # buraya yaz\n    pass\n',
    sol: 'import unittest\n\nORANLAR = {"YAZ10": 0.10, "VIP25": 0.25}\n\ndef indirimli_fiyat(fiyat, kod):\n    if fiyat < 0:\n        raise ValueError("fiyat negatif olamaz")\n    if kod is None:\n        return fiyat\n    return round(fiyat * (1 - ORANLAR[kod]), 2)\n\n\nclass IndirimTest(unittest.TestCase):\n    def test_oranlar(self):\n        for kod, beklenen in [("YAZ10", 90.0), ("VIP25", 75.0)]:\n            with self.subTest(kod=kod):\n                self.assertEqual(indirimli_fiyat(100, kod), beklenen)\n\n    def test_yuvarlama(self):\n        self.assertEqual(indirimli_fiyat(19.99, "YAZ10"), 17.99)\n\n    def test_kodsuz(self):\n        self.assertEqual(indirimli_fiyat(50, None), 50)\n\n    def test_bilinmeyen_kod(self):\n        with self.assertRaises(KeyError):\n            indirimli_fiyat(100, "SAHTE")\n\n    def test_negatif_fiyat(self):\n        with self.assertRaises(ValueError):\n            indirimli_fiyat(-1, "YAZ10")\n',
    tests: 'import unittest as _ut, io as _io\ndef _calistir(sinif):\n    s = _ut.defaultTestLoader.loadTestsFromTestCase(sinif)\n    return _ut.TextTestRunner(stream=_io.StringIO(), verbosity=0).run(s)\nassert len(_ut.defaultTestLoader.getTestCaseNames(IndirimTest)) >= 2, "en az iki test_ metodu yaz"\nassert _calistir(IndirimTest).wasSuccessful(), "testlerin doğru fonksiyonda geçmesi gerekir"\n_dogru = indirimli_fiyat\ndef m1(fiyat, kod):\n    if fiyat < 0: raise ValueError()\n    if kod is None: return fiyat\n    return round(fiyat * (1 - {"YAZ10": 0.10, "VIP25": 0.20}[kod]), 2)\ndef m2(fiyat, kod):\n    if kod is None: return fiyat\n    return round(fiyat * (1 - ORANLAR[kod]), 2)\ndef m3(fiyat, kod):\n    if fiyat < 0: raise ValueError()\n    if kod is None: return fiyat\n    return round(fiyat * (1 - ORANLAR.get(kod, 0)), 2)\ndef m4(fiyat, kod):\n    if fiyat < 0: raise ValueError()\n    if kod is None: return 0\n    return round(fiyat * (1 - ORANLAR[kod]), 2)\nfor ad, mutant, ipucu in [("m1", m1, "VIP25 oranı yanlış"), ("m2", m2, "negatif fiyat kontrolü yok"),\n                          ("m3", m3, "bilinmeyen kod sessizce kabul ediliyor"), ("m4", m4, "kodsuz fiyat yanlış")]:\n    indirimli_fiyat = mutant\n    assert not _calistir(IndirimTest).wasSuccessful(), f"mutant {ad} hayatta kaldı ({ipucu}): bu kuralı sınayan bir test ekle"\nindirimli_fiyat = _dogru\n',
    hints: ['Her kural için ayrı bir <code>test_</code> metodu düşün: iki oran, kodsuz, bilinmeyen kod, negatif fiyat.', 'Hata beklenen durumlar için <code>with self.assertRaises(KeyError):</code>.', 'Birden çok oranı <code>subTest</code> ile tek metotta deneyebilirsin.'],
    why: 'Mutasyon testi (mutation testing), test takımının kalitesini ölçer: koda bilerek küçük hatalar eklenir ve testlerin bunları yakalayıp yakalamadığına bakılır. Satır kapsamı (coverage) %100 olsa bile, örneğin yalnızca YAZ10 test edilirse VIP25 oranındaki hata kaçar. İyi test, her iş kuralını hem "mutlu yol" hem de hata durumlarıyla ayrı ayrı sınar. Python\'da bu işi otomatik yapan araçlar <code>mutmut</code> ve <code>cosmic-ray</code>\'dir.',
    tags: ['unittest', 'mutation testing', 'assertRaises'],
    min: 10
  },

  {
    id: 'b-304',
    lv: 'orta',
    topic: 'Test',
    diff: 1,
    kind: 'bug',
    title: 'Kayan nokta yüzünden kırmızı yanan test',
    q: '<p>Hatayı bul ve düzelt. <code>bilesik_faiz</code> fonksiyonu doğru, ama testi sürekli başarısız oluyor: <code>1108.7178749999998 != 1108.717875</code>. Testi, kayan nokta küçük farklarını tolere edecek ama gerçek hesap hatalarını yine yakalayacak biçimde düzelt (fonksiyona dokunma).</p>',
    start: 'import unittest\n\ndef bilesik_faiz(anapara, oran, yil):\n    return anapara * (1 + oran) ** yil\n\n\nclass FaizTest(unittest.TestCase):\n    def test_uc_yil(self):\n        self.assertEqual(bilesik_faiz(1000, 0.035, 3), 1108.717875)\n',
    sol: 'import unittest\n\ndef bilesik_faiz(anapara, oran, yil):\n    return anapara * (1 + oran) ** yil\n\n\nclass FaizTest(unittest.TestCase):\n    def test_uc_yil(self):\n        self.assertAlmostEqual(bilesik_faiz(1000, 0.035, 3), 1108.717875, places=6)\n',
    tests: 'import unittest as _ut, io as _io\ndef _calistir(sinif):\n    s = _ut.defaultTestLoader.loadTestsFromTestCase(sinif)\n    return _ut.TextTestRunner(stream=_io.StringIO(), verbosity=0).run(s)\nassert _calistir(FaizTest).wasSuccessful(), "test doğru fonksiyonda geçmeli: assertEqual yerine assertAlmostEqual kullan"\n_dogru = bilesik_faiz\ndef bilesik_faiz(anapara, oran, yil):\n    return anapara * (1 + oran * yil)\nassert not _calistir(FaizTest).wasSuccessful(), "test basit faiz hatasını (1105.0) hâlâ yakalamalı; toleransı çok gevşek tutma"\ndef bilesik_faiz(anapara, oran, yil):\n    return round(anapara * (1 + oran) ** yil, 1)\nassert not _calistir(FaizTest).wasSuccessful(), "0.1\'e yuvarlayan hatalı sürümü de yakalamalı (places en az 2 olmalı)"\nbilesik_faiz = _dogru\n',
    hints: ['İkili kayan noktada <code>1.035 ** 3</code> tam ifade edilemez; tam eşitlik beklemek yanlış.', '<code>self.assertAlmostEqual(a, b, places=6)</code> farkı 6 basamağa yuvarlayıp karşılaştırır.'],
    why: '<code>float</code> değerleri ikili tabanda yaklaşık tutulur; hesap sırasına göre son basamaklar değişebilir. Bu yüzden testte <code>assertAlmostEqual</code> (varsayılan <code>places=7</code>) ya da <code>delta=</code> kullanılır; pytest\'te karşılığı <code>pytest.approx</code>, düz Python\'da <code>math.isclose</code>\'dur. Tolerans, gerçek hataları gizlemeyecek kadar dar olmalı. Para hesaplarında asıl çözüm ise <code>decimal.Decimal</code> kullanıp kuruşa yuvarlamaktır.',
    tags: ['unittest', 'assertAlmostEqual', 'float'],
    min: 3
  },

  {
    id: 'b-305',
    lv: 'orta',
    topic: 'Test',
    diff: 2,
    kind: 'tamamla',
    title: 'Uyarı log\'unu test et',
    q: '<p><code>buyuk_islem_kontrol(tutar)</code> 50.000 TL üstü işlemlerde <code>"odeme"</code> logger\'ına <b>WARNING</b> seviyesinde <code>"büyük işlem: 75000"</code> gibi bir kayıt düşmeli (uyum ekibi bu log\'u izliyor). Testteki boşlukları tamamla: <code>assertLogs</code> ile doğru logger ve seviyeyi dinle, ardından mesajı kontrol et.</p>',
    start: 'import logging\nimport unittest\n\nlog = logging.getLogger("odeme")\n\ndef buyuk_islem_kontrol(tutar):\n    if tutar > 50000:\n        log.warning("büyük işlem: %s", tutar)\n        return True\n    return False\n\n\nclass LogTest(unittest.TestCase):\n    def test_uyari(self):\n        with self.assertLogs(___, level=___) as cm:\n            buyuk_islem_kontrol(75000)\n        self.assertEqual(cm.output, ["WARNING:odeme:büyük işlem: 75000"])\n',
    sol: 'import logging\nimport unittest\n\nlog = logging.getLogger("odeme")\n\ndef buyuk_islem_kontrol(tutar):\n    if tutar > 50000:\n        log.warning("büyük işlem: %s", tutar)\n        return True\n    return False\n\n\nclass LogTest(unittest.TestCase):\n    def test_uyari(self):\n        with self.assertLogs("odeme", level="WARNING") as cm:\n            buyuk_islem_kontrol(75000)\n        self.assertEqual(cm.output, ["WARNING:odeme:büyük işlem: 75000"])\n',
    tests: 'import unittest as _ut, io as _io\ndef _calistir(sinif):\n    s = _ut.defaultTestLoader.loadTestsFromTestCase(sinif)\n    return _ut.TextTestRunner(stream=_io.StringIO(), verbosity=0).run(s)\nassert _calistir(LogTest).wasSuccessful(), "test geçmeli: assertLogs(\'odeme\', level=\'WARNING\')"\n_dogru = buyuk_islem_kontrol\ndef buyuk_islem_kontrol(tutar):\n    return tutar > 50000\nassert not _calistir(LogTest).wasSuccessful(), "log yazmayan sürümde test başarısız olmalı"\nbuyuk_islem_kontrol = _dogru\n',
    hints: ['İlk boşluk logger adı (metin), ikincisi seviye.', '<code>self.assertLogs("odeme", level="WARNING")</code>'],
    why: '<code>assertLogs</code> blok içinde belirtilen logger\'a (ve alt logger\'larına) en az verilen seviyede kayıt düşülmesini bekler, yoksa test başarısız olur; <code>cm.output</code> kayıtları <code>"SEVİYE:logger:mesaj"</code> biçiminde verir. Log\'lar denetim ve uyum (compliance) için iş gereksinimi olduğunda test edilmelidir. Tersini, yani hiç log yazılmadığını doğrulamak için Python 3.10+ <code>assertNoLogs</code> vardır; pytest\'te <code>caplog</code> fikstürü aynı işi görür.',
    tags: ['unittest', 'assertLogs', 'logging'],
    min: 4
  },

  {
    id: 'b-306',
    lv: 'orta',
    topic: 'Otomasyon',
    diff: 1,
    t: 'predict',
    kind: 'predict',
    title: 'pathlib ile dosya adı parçaları',
    q: '<p>Yedekleme betiği arşiv dosyalarının adlarını parçalıyor. Bu kod ne yazdırır?</p>',
    code: 'from pathlib import PurePosixPath\n\np = PurePosixPath("/srv/raporlar/2026/mart_satis.tar.gz")\nprint(p.name, p.stem, p.suffix)\nprint(p.suffixes, p.parent.name)\nprint(p.with_suffix(".zip").name)\n',
    o: ['mart_satis.tar.gz mart_satis .tar.gz\n[\'.tar\', \'.gz\'] 2026\nmart_satis.zip', 'mart_satis.tar.gz mart_satis.tar .gz\n[\'.tar\', \'.gz\'] 2026\nmart_satis.tar.zip', 'mart_satis.tar.gz mart_satis.tar .gz\n[\'.gz\'] raporlar\nmart_satis.tar.zip', 'mart_satis.tar.gz mart_satis.tar gz\n[\'tar\', \'gz\'] 2026\nmart_satis.zip'],
    a: 1,
    hints: ['<code>suffix</code> yalnızca SON uzantıdır; <code>stem</code> adın son uzantısız hâlidir.', '<code>with_suffix</code> yalnızca son uzantıyı değiştirir.'],
    why: 'pathlib çok parçalı uzantılarda yalnızca son noktadan sonrasını <code>suffix</code> sayar; tümü <code>suffixes</code> listesindedir. Bu yüzden <code>stem</code> "mart_satis.tar" olur ve <code>with_suffix(".zip")</code> "mart_satis.tar.zip" üretir. ".tar.gz" gibi dosyalarda gerçek temel adı almak için <code>p.name.removesuffix("".join(p.suffixes))</code> gibi bir yol gerekir. <code>PurePosixPath</code> dosya sistemine dokunmadan yol hesabı yapar, testlerde kullanışlıdır.',
    tags: ['pathlib', 'suffix', 'stem'],
    min: 2
  },

  {
    id: 'b-307',
    lv: 'orta',
    topic: 'Otomasyon',
    diff: 2,
    kind: 'rehberli',
    title: 'Ekli rapor e-postası hazırla',
    q: '<p>Her ay satış raporu CSV olarak muhasebeye gönderiliyor. <code>rapor_epostasi(alici, ay, csv_metin)</code> fonksiyonunu <code>email.message.EmailMessage</code> ile yaz: gönderen <code>"rapor@anadolumarket.example"</code>, alıcı <code>alici</code>, konu <code>"&lt;ay&gt; satış raporu"</code>, düz metin gövde <code>"Merhaba,\\n&lt;ay&gt; raporu ektedir."</code>; CSV ek olarak <code>"&lt;ay küçük harf&gt;_satis.csv"</code> adıyla (<code>text/csv</code>) eklensin. Mesajı döndür (göndermek yok; SMTP tarayıcıda çalışmaz).</p>',
    guide: ['<code>msg = EmailMessage()</code>; <code>msg["From"]</code>, <code>msg["To"]</code>, <code>msg["Subject"]</code> başlıklarını ata.', '<code>msg.set_content(...)</code> ile düz metin gövdeyi ver.', '<code>msg.add_attachment(csv_metin, subtype="csv", filename=...)</code> ile eki ekle (metin verince ana tür <code>text</code> olur).', 'Dosya adında <code>ay.lower()</code> kullan ve mesajı döndür.'],
    example: 'from email.message import EmailMessage\nm = EmailMessage()\nm["Subject"] = "Toplantı notu"\nm.set_content("Notlar ekte.")\nm.add_attachment("madde 1\\nmadde 2", subtype="plain", filename="not.txt")\nprint(m["Subject"], [p.get_filename() for p in m.iter_attachments()])\n',
    start: 'from email.message import EmailMessage\n\ndef rapor_epostasi(alici, ay, csv_metin):\n    msg = EmailMessage()\n    # TODO 1: From / To / Subject\n    # TODO 2: gövde\n    # TODO 3: CSV eki\n    return msg\n',
    sol: 'from email.message import EmailMessage\n\ndef rapor_epostasi(alici, ay, csv_metin):\n    msg = EmailMessage()\n    msg["From"] = "rapor@anadolumarket.example"\n    msg["To"] = alici\n    msg["Subject"] = f"{ay} satış raporu"\n    msg.set_content(f"Merhaba,\\n{ay} raporu ektedir.")\n    msg.add_attachment(csv_metin, subtype="csv", filename=f"{ay.lower()}_satis.csv")\n    return msg\n',
    tests: 'm = rapor_epostasi("muhasebe@anadolumarket.example", "Mart", "sehir;ciro\\nAnkara;350\\n")\nassert m["To"] == "muhasebe@anadolumarket.example" and m["From"] == "rapor@anadolumarket.example", "From/To başlıkları ayarlanmalı"\nassert m["Subject"] == "Mart satış raporu", "konu \'Mart satış raporu\' olmalı"\nassert m.get_body(("plain",)).get_content().strip() == "Merhaba,\\nMart raporu ektedir.", "düz metin gövde yanlış"\nekler = list(m.iter_attachments())\nassert len(ekler) == 1, "tam bir ek olmalı"\nassert ekler[0].get_filename() == "mart_satis.csv" and ekler[0].get_content_type() == "text/csv", "ek adı mart_satis.csv ve türü text/csv olmalı"\nassert "Ankara;350" in ekler[0].get_content(), "ek içeriği CSV metni olmalı"\n',
    hints: ['Başlıklar sözlük gibi atanır: <code>msg["Subject"] = ...</code>.', '<code>add_attachment</code> metin aldığında <code>subtype</code> ile türü belirlersin: <code>subtype="csv"</code>.', 'Gerçek gönderim kendi bilgisayarında: <code>smtplib.SMTP_SSL(...).send_message(msg)</code>.'],
    why: '<code>EmailMessage</code> MIME yapısını (çok parçalı gövde, kodlama, Türkçe karakterli başlıklar) otomatik kurar; elle MIME metni yazmak hataya çok açıktır. Mesajı üretmek ile göndermeyi ayırmak, içeriğin SMTP sunucusu olmadan test edilmesini sağlar. Gönderim tarafında kimlik bilgileri koda yazılmaz, ortam değişkeninden okunur. Toplu ve HTML e-postalarda gövde jinja2 şablonuyla üretilip <code>msg.add_alternative(html, subtype="html")</code> ile eklenir.',
    tags: ['EmailMessage', 'ek', 'otomasyon'],
    min: 7
  },

  {
    id: 'b-308',
    lv: 'orta',
    topic: 'Otomasyon',
    diff: 2,
    kind: 'rehberli',
    needs: ['beautifulsoup4'],
    title: 'Tedarikçi sayfasından fiyat tablosu çek',
    q: '<p>Tedarikçi fiyatlarını bir HTML tablosunda yayınlıyor (sayfa önceden indirilmiş, metin olarak elindesin). <code>fiyatlari_cek(html)</code> fonksiyonunu BeautifulSoup ile yaz: <code>id="fiyatlar"</code> olan tablonun gövde satırlarından <code>{"urun": ..., "fiyat": float, "stokta": bool}</code> sözlüklerinin listesini döndürsün. Fiyat <code>"1.250,00 TL"</code> biçiminde; stok hücresi <code>"Var"</code>/<code>"Yok"</code>. Başlık satırını (<code>th</code>) atla.</p>',
    guide: ['<code>soup = BeautifulSoup(html, "html.parser")</code>.', 'Tabloyu <code>soup.select("#fiyatlar tr")</code> ile seç; hücreleri <code>tr.find_all("td")</code> ile al, <code>td</code>\'si olmayan satırı atla.', 'Hücre metni: <code>td.get_text(strip=True)</code>.', 'Fiyatı <code>.</code> sil, <code>,</code> → <code>.</code>, <code>TL</code> sil, <code>float</code>; stok <code>== "Var"</code>.'],
    example: 'from bs4 import BeautifulSoup\nhtml = "<ul id=\'m\'><li>Ankara</li><li class=\'x\'> İzmir </li></ul>"\nsoup = BeautifulSoup(html, "html.parser")\nprint([li.get_text(strip=True) for li in soup.select("#m li")])\nprint(soup.select_one("li.x").get_text(strip=True))\n',
    start: 'from bs4 import BeautifulSoup\n\ndef fiyatlari_cek(html):\n    soup = BeautifulSoup(html, "html.parser")\n    sonuc = []\n    # TODO 1: #fiyatlar tablosundaki satırları dolaş\n    # TODO 2: td hücrelerini al, başlık satırını atla\n    # TODO 3: fiyatı float\'a, stoku bool\'a çevirip ekle\n    return sonuc\n',
    sol: 'from bs4 import BeautifulSoup\n\ndef fiyatlari_cek(html):\n    soup = BeautifulSoup(html, "html.parser")\n    sonuc = []\n    for tr in soup.select("#fiyatlar tr"):\n        hucreler = [td.get_text(strip=True) for td in tr.find_all("td")]\n        if len(hucreler) < 3:\n            continue\n        urun, fiyat, stok = hucreler[:3]\n        fiyat = float(fiyat.replace("TL", "").replace(".", "").replace(",", ".").strip())\n        sonuc.append({"urun": urun, "fiyat": fiyat, "stokta": stok == "Var"})\n    return sonuc\n',
    tests: 'html = """\n<html><body>\n  <table id="kampanya"><tr><td>Reklam</td><td>0</td><td>Var</td></tr></table>\n  <table id="fiyatlar">\n    <tr><th>Ürün</th><th>Fiyat</th><th>Stok</th></tr>\n    <tr><td> A4 Kağıt </td><td>1.250,00 TL</td><td>Var</td></tr>\n    <tr><td>Toner <b>XL</b></td><td>899,90 TL</td><td>Yok</td></tr>\n  </table>\n</body></html>\n"""\nr = fiyatlari_cek(html)\nassert r == [{"urun": "A4 Kağıt", "fiyat": 1250.0, "stokta": True}, {"urun": "TonerXL", "fiyat": 899.9, "stokta": False}], f"beklenmeyen sonuç: {r}"\nassert fiyatlari_cek("<p>tablo yok</p>") == [], "tablo yoksa boş liste"\n',
    hints: ['CSS seçici <code>#fiyatlar tr</code> yalnızca o tablonun satırlarını verir; diğer tablolar karışmaz.', 'Başlık satırında <code>td</code> yoktur; <code>find_all("td")</code> boş döner.', '<code>get_text(strip=True)</code> iç etiketlerin (<code>&lt;b&gt;</code>) metnini de birleştirir.'],
    why: 'BeautifulSoup HTML\'i ağaç olarak ayrıştırır; CSS seçicileri (<code>select</code>) sayfadaki doğru tabloyu kimliğiyle hedeflemeyi sağlar, böylece reklam tablosu gibi gürültü karışmaz. Regex ile HTML ayrıştırmak iç içe etiketlerde kırılır. Gerçek otomasyonda sayfa <code>requests/httpx</code> ile indirilir (tarayıcıda ağ yok), site kullanım koşulları ve <code>robots.txt</code> kontrol edilir; tablo düzgünse <code>pandas.read_html</code> da tek satırlık bir alternatiftir.',
    tags: ['BeautifulSoup', 'web scraping', 'CSS seçici'],
    min: 8
  },

  {
    id: 'b-309',
    lv: 'orta',
    topic: 'Otomasyon',
    diff: 2,
    kind: 'yaz',
    needs: ['jinja2'],
    title: 'Güvenli HTML fatura e-postası (jinja2)',
    q: '<p>Müşteriye gidecek HTML fatura özeti jinja2 şablonuyla üretilecek. <code>fatura_html(musteri, kalemler)</code> fonksiyonunu yaz: <code>jinja2.Environment(autoescape=True)</code> ile aşağıdaki şablonu derleyip doldursun. <code>kalemler</code> <code>[{"ad": ..., "adet": int, "fiyat": float}]</code>; şablon her kalem için bir satır, sonunda toplamı iki ondalıkla gösterir. Müşteri adındaki HTML (ör. <code>&lt;script&gt;</code>) <b>kaçırılmalı</b>.</p><pre>&lt;p&gt;Sayın {{ musteri }},&lt;/p&gt;\n&lt;ul&gt;{% for k in kalemler %}&lt;li&gt;{{ k.ad }} x{{ k.adet }}&lt;/li&gt;{% endfor %}&lt;/ul&gt;\n&lt;p&gt;Toplam: {{ "%.2f"|format(toplam) }} TL&lt;/p&gt;</pre>',
    start: 'from jinja2 import Environment\n\nSABLON = (\n    "<p>Sayın {{ musteri }},</p>\\n"\n    "<ul>{% for k in kalemler %}<li>{{ k.ad }} x{{ k.adet }}</li>{% endfor %}</ul>\\n"\n    "<p>Toplam: {{ \\"%.2f\\"|format(toplam) }} TL</p>"\n)\n\ndef fatura_html(musteri, kalemler):\n    # buraya yaz\n    pass\n',
    sol: 'from jinja2 import Environment\n\nSABLON = (\n    "<p>Sayın {{ musteri }},</p>\\n"\n    "<ul>{% for k in kalemler %}<li>{{ k.ad }} x{{ k.adet }}</li>{% endfor %}</ul>\\n"\n    "<p>Toplam: {{ \\"%.2f\\"|format(toplam) }} TL</p>"\n)\n\nORTAM = Environment(autoescape=True)\n\ndef fatura_html(musteri, kalemler):\n    toplam = sum(k["adet"] * k["fiyat"] for k in kalemler)\n    return ORTAM.from_string(SABLON).render(musteri=musteri, kalemler=kalemler, toplam=toplam)\n',
    tests: 'h = fatura_html("Ece Kaya", [{"ad": "Kalem", "adet": 3, "fiyat": 15.0}, {"ad": "Defter", "adet": 1, "fiyat": 40.5}])\nassert h == "<p>Sayın Ece Kaya,</p>\\n<ul><li>Kalem x3</li><li>Defter x1</li></ul>\\n<p>Toplam: 85.50 TL</p>", f"HTML çıktısı farklı:\\n{h}"\nk = fatura_html("<script>alert(1)</script>", [])\nassert "<script>" not in k and "&lt;script&gt;" in k, "müşteri adındaki HTML kaçırılmalı (autoescape=True)"\nassert "Toplam: 0.00 TL" in k, "kalem yoksa toplam 0.00"\n',
    hints: ['Toplamı Python\'da hesaplayıp şablona değişken olarak ver.', '<code>Environment(autoescape=True).from_string(SABLON).render(...)</code>', 'jinja2\'de <code>k.ad</code> sözlük anahtarına da erişir.'],
    why: 'Şablon motoru sunumu (HTML) mantıktan (toplam hesabı) ayırır; pazarlama ekibi şablonu kod değiştirmeden düzenleyebilir. <code>autoescape=True</code> kullanıcı kaynaklı metindeki <code>&lt;</code> <code>&gt;</code> <code>&amp;</code> karakterlerini kaçırarak XSS (betik enjeksiyonu) saldırılarını önler; jinja2\'de varsayılan kapalıdır, bu yüzden HTML üretirken açıkça açılmalıdır. Güvenilir HTML parçası eklemek gerekirse <code>|safe</code> filtresi bilinçli olarak kullanılır. <code>Environment</code>\'ı bir kez oluşturmak, şablon önbelleği sayesinde tekrar eden çağrıları hızlandırır.',
    tags: ['jinja2', 'autoescape', 'şablon'],
    min: 6
  },

  {
    id: 'b-310',
    lv: 'orta',
    topic: 'Otomasyon',
    diff: 2,
    kind: 'tamamla',
    needs: ['pydantic'],
    title: 'Kredi başvurusu formunu pydantic ile doğrula',
    q: '<p>Web formundan gelen kredi başvuruları <code>pydantic</code> modeliyle doğrulanıyor. <code>Basvuru</code> modelindeki boşlukları tamamla: <code>yas</code> 18 ile 75 arasında (dahil) olmalı, <code>aylik_gelir</code> 0\'dan büyük olmalı, <code>iban</code> boşlukları silinmiş hâliyle <code>TR</code> ile başlamalı ve 26 karakter olmalı (doğrulayıcı temizlenmiş değeri döndürsün). Formdan gelen metin sayılar (<code>"35"</code>) otomatik dönüşmeli.</p>',
    start: 'from pydantic import BaseModel, Field, field_validator\n\nclass Basvuru(BaseModel):\n    ad: str\n    yas: int = Field(___)\n    aylik_gelir: float = Field(___)\n    iban: str\n\n    @field_validator("iban")\n    @classmethod\n    def iban_kontrol(cls, v):\n        temiz = v.replace(" ", "")\n        if not (temiz.startswith("TR") and len(temiz) == 26):\n            raise ValueError("geçersiz IBAN")\n        return ___\n',
    sol: 'from pydantic import BaseModel, Field, field_validator\n\nclass Basvuru(BaseModel):\n    ad: str\n    yas: int = Field(ge=18, le=75)\n    aylik_gelir: float = Field(gt=0)\n    iban: str\n\n    @field_validator("iban")\n    @classmethod\n    def iban_kontrol(cls, v):\n        temiz = v.replace(" ", "")\n        if not (temiz.startswith("TR") and len(temiz) == 26):\n            raise ValueError("geçersiz IBAN")\n        return temiz\n',
    tests: 'from pydantic import ValidationError\nb = Basvuru(ad="Ece", yas="35", aylik_gelir="42000.5", iban="TR33 0006 1005 1978 6457 8413 26")\nassert b.yas == 35 and b.aylik_gelir == 42000.5, "metin sayılar otomatik dönüşmeli"\nassert b.iban == "TR330006100519786457841326", "doğrulayıcı boşluksuz IBAN\'ı döndürmeli"\nfor hatali, aciklama in [({"yas": 17}, "18 yaş altı"), ({"yas": 76}, "75 yaş üstü"), ({"aylik_gelir": 0}, "gelir 0"), ({"iban": "DE33000610051978645784132"}, "TR dışı IBAN")]:\n    veri = {"ad": "Can", "yas": 30, "aylik_gelir": 1000, "iban": "TR330006100519786457841326"}\n    veri.update(hatali)\n    try:\n        Basvuru(**veri)\n        assert False, f"{aciklama} için ValidationError bekleniyordu"\n    except ValidationError:\n        pass\nassert Basvuru(ad="A", yas=18, aylik_gelir=1, iban="TR330006100519786457841326").yas == 18, "18 sınırı dahil"\nassert Basvuru(ad="A", yas=75, aylik_gelir=1, iban="TR330006100519786457841326").yas == 75, "75 sınırı dahil"\n',
    hints: ['Dahil sınırlar: <code>ge</code> (≥) ve <code>le</code> (≤); kesin büyük: <code>gt</code>.', '<code>Field(ge=18, le=75)</code>, <code>Field(gt=0)</code>; doğrulayıcı <code>temiz</code> döndürmeli.'],
    why: 'pydantic, tip ipuçlarını çalışma anı doğrulamasına çevirir: formdan gelen <code>"35"</code> metnini int\'e dönüştürür, kısıtları (<code>ge/le/gt</code>) denetler ve tüm hataları tek bir <code>ValidationError</code>\'da alan adlarıyla raporlar. <code>field_validator</code> özel kurallar içindir ve döndürdüğü değer alana yazılır; bu sayede doğrulama ile normalizasyon (boşluk silme) tek yerde olur. FastAPI istek gövdelerini bu modellerle doğrular; dataclass\'a göre fark, dönüşüm ve doğrulamanın yerleşik olmasıdır.',
    tags: ['pydantic', 'Field', 'field_validator', 'doğrulama'],
    min: 6
  }
);
})(window);
