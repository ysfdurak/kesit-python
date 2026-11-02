from part1 import pre, c

Q = [
dict(roles=['genel'], lv='temel', topic='Tip notasyonları çalışma anında', kind='kod-okuma',
     q='Fonksiyon ' + '<code>int</code> bekliyor ama string veriyoruz. Kod hata verir mi? Çıktı nedir?',
     code='def puan_ikile(puan: int) -> int:\n    return puan * 2\n\nprint(puan_ikile(21))\nprint(puan_ikile("ab"))\nprint(puan_ikile([1]))\nprint(puan_ikile.__annotations__)\n',
     out="42\nabab\n[1, 1]\n{'puan': <class 'int'>, 'return': <class 'int'>}",
     a='<p>Hata vermez. Tip notasyonları Python yorumlayıcısı için yalnızca <b>meta veridir</b>; fonksiyonun ' + c('__annotations__') + ' sözlüğünde saklanır ama çağrı sırasında denetlenmez. Python dinamik tiplidir ve "ördek tiplemesi" uygular: ' + c('*') + ' operatörünü destekleyen her nesne çalışır. String ve liste için ' + c('* 2') + ' tekrar anlamına gelir: ' + c('"abab"') + ' ve ' + c('[1, 1]') + '.</p>'
       '<p><b>Bu hataları kim yakalar?</b></p><ul><li><b>Statik denetleyici:</b> ' + c('mypy') + ' veya ' + c('pyright') + ' çalıştırırsan ' + c('Argument 1 has incompatible type "str"; expected "int"') + ' benzeri bir hata verir. Bu yüzden CI hattına tip denetimi eklemek değerlidir.</li>'
       '<li><b>Çalışma anı doğrulama:</b> Dış dünyadan gelen veri (API isteği, CSV) için Pydantic, ' + c('beartype') + ' ya da açık ' + c('isinstance') + ' kontrolleri kullanılır. FastAPI notasyonları okuyup isteği otomatik doğrular.</li></ul>'
       '<p><b>Neden böyle tasarlandı?</b> Tipler isteğe bağlı ve kademeli (gradual typing) olsun, mevcut kod bozulmasın ve çalışma anı maliyeti oluşmasın diye. Mülakatta bu sorunun amacı, notasyonların "güvence" değil "belge ve araç desteği" olduğunu bilip bilmediğini ölçmektir.</p>',
     follow=['Dış API\'den gelen JSON\'u tiplere göre nasıl doğrularsın?', 'from __future__ import annotations ne değiştirir?'],
     flags=['"TypeError verir" demek', 'Tip notasyonlarını gereksiz bulmak'],
     tip='Çıktıyı söyle, sonra "statik araç yakalar, çalışma anında Pydantic" ayrımını ekle.'),

dict(roles=['genel'], lv='orta', topic='Paketleme', kind='kavram',
     q='Bir Python projesini paket hâline getirip dağıtmak için hangi adımları izlersin? ' + '<code>pyproject.toml</code>, wheel ve sanal ortam bu süreçte nerede durur?',
     a='<p><b>1. Sanal ortam:</b> Her proje kendi bağımlılıklarıyla yalıtılmış bir ortamda geliştirilir: ' + c('python -m venv .venv') + ' (veya ' + c('uv venv') + '). Böylece sistem Python\'u ve diğer projeler etkilenmez.</p>'
       '<p><b>2. Proje yapısı:</b> Kod ' + c('src/anadolu_rapor/') + ' altında durur ("src düzeni"); bu, testlerin yanlışlıkla kurulu paket yerine yerel klasörü import etmesini önler.</p>'
       '<p><b>3. ' + c('pyproject.toml') + ' (PEP 517/518/621):</b> Tek yapılandırma dosyasıdır. ' + c('[build-system]') + ' bölümü derleme arka ucunu (setuptools, hatchling, poetry-core) seçer; ' + c('[project]') + ' bölümünde ad, sürüm, ' + c('requires-python') + ', bağımlılıklar, ' + c('optional-dependencies') + ' ve ' + c('[project.scripts]') + ' ile komut satırı giriş noktaları bulunur. Linter ve test araçlarının ayarları da (' + c('[tool.ruff]') + ', ' + c('[tool.pytest.ini_options]') + ') buraya konur.</p>'
       '<p><b>4. Derleme:</b> ' + c('python -m build') + ' iki çıktı üretir: kaynak dağıtımı (sdist, ' + c('.tar.gz') + ') ve <b>wheel</b> (' + c('.whl') + '). Wheel önceden derlenmiş bir zip arşividir; kurulumu hızlıdır ve kurulum sırasında kod çalıştırmaz.</p>'
       '<p><b>5. Yayın:</b> Önce TestPyPI, sonra ' + c('twine upload') + ' veya güvenilir yayıncı (trusted publishing) ile PyPI. Şirket içinde özel bir paket deposu (Artifactory, devpi) kullanılır. Sürümler anlamsal sürümlemeye (semver) uygun verilir.</p>',
     follow=['setup.py ile pyproject.toml arasındaki geçiş neden yapıldı?', 'Editable kurulum (pip install -e .) ne işe yarar?'],
     flags=['Sanal ortam kullanmadan global pip install yapmayı normal görmek', 'Wheel ile sdist farkını bilmemek'],
     tip='Adımları sırayla say (ortam → yapı → yapılandırma → derleme → yayın); sistematik görünürsün.'),

dict(roles=['genel', 'backend'], lv='orta', topic='Bağımlılık yönetimi', kind='kavram',
     q='' + '<code>requirements.txt</code> ile kilit dosyası (lock file) arasındaki fark nedir? Üretimde tekrarlanabilir kurulumu nasıl sağlarsın?',
     a='<p><b>Sorun:</b> ' + c('requests>=2.0') + ' gibi gevşek bir tanım bugün 2.32, altı ay sonra başka bir sürüm kurar. Ayrıca dolaylı (transitive) bağımlılıklar hiç sabitlenmez. "Benim makinemde çalışıyordu" sorunlarının büyük kısmı buradan çıkar.</p>'
       '<p><b>İki katman ayrılmalı:</b></p><ul><li><b>Soyut bağımlılıklar</b> (' + c('pyproject.toml') + ' veya ' + c('requirements.in') + '): projenin doğrudan ihtiyaçları ve uyumlu aralıklar, örneğin ' + c('fastapi>=0.110,<1') + '.</li>'
       '<li><b>Kilit dosyası:</b> Tüm ağacın (dolaylılar dahil) <i>tam</i> sürümleri ve dosya hash\'leri. ' + c('pip-tools') + ' (' + c('pip-compile --generate-hashes') + '), ' + c('poetry.lock') + ', ' + c('uv.lock') + ' veya ' + c('pdm.lock') + '.</li></ul>'
       '<p><b>Üretimde:</b> Kilit dosyasını sürüm kontrolüne eklerim ve CI\'da ' + c('pip install --require-hashes -r requirements.txt') + ' ya da ' + c('uv sync --frozen') + ' ile kurarım. Docker imajında Python sürümünü de sabitlerim (' + c('python:3.12.7-slim') + '). Kütüphane yazıyorsam ise kilitlemem, geniş aralık veririm; kilitleme <i>uygulamanın</i> işidir.</p>'
       '<p><b>Bakım:</b> Dependabot/Renovate ile düzenli güncelleme PR\'ları, ' + c('pip-audit') + ' ile güvenlik açığı taraması. ' + c('pip freeze') + ' tek başına yeterli değildir; ortamdaki gereksiz paketleri de yakalar ve hash içermez.</p>',
     follow=['Bir kütüphane neden bağımlılıklarını tam sürüme sabitlememeli?', 'Hash doğrulaması hangi saldırıya karşı korur?'],
     flags=['pip freeze çıktısını tek çözüm olarak sunmak', 'Dolaylı bağımlılıkları hiç düşünmemek'],
     tip='Uygulama ile kütüphane ayrımını söylemek bu soruda seni kıdemli adaylardan biri yapar.'),

dict(roles=['genel'], lv='temel', topic='__name__ == "__main__"', kind='kavram',
     q='' + '<code>if __name__ == "__main__":</code> bloğu ne işe yarar?',
     a='<p>Her modülün ' + c('__name__') + ' adında bir özniteliği vardır. Dosya <b>doğrudan çalıştırıldığında</b> (' + c('python rapor.py') + ') bu değer ' + c('"__main__"') + ' olur; başka bir modül tarafından <b>import edildiğinde</b> ise modülün adı olur (' + c('"rapor"') + ').</p>'
       + pre('def gunluk_ciro(siparisler):\n    return sum(s["tutar"] for s in siparisler)\n\nif __name__ == "__main__":\n    # yalnızca "python rapor.py" ile çalışır, import\'ta çalışmaz\n    print(gunluk_ciro([{"tutar": 120}, {"tutar": 80}]))')
       + '<p><b>Neden önemli?</b></p><ul><li>Modülü hem kütüphane hem de betik olarak kullanabilirsin. Testler ' + c('gunluk_ciro') + '\'yu import ettiğinde betik kısmı (dosya yazma, ağ çağrısı) çalışmaz.</li>'
       '<li><b>multiprocessing:</b> Windows ve macOS\'ta varsayılan "spawn" yöntemi ana modülü yeniden import eder; bu koruma olmazsa süreçler sonsuz döngüde yeni süreç başlatır.</li>'
       '<li>Import\'un yan etkisiz olması iyi bir tasarım ilkesidir.</li></ul>'
       '<p>İyi uygulama: bloğun içine yalnızca ' + c('main()') + ' çağrısı koymak ve mantığı bir fonksiyonda tutmak. Paketlerde aynı rolü ' + c('__main__.py') + ' dosyası üstlenir (' + c('python -m paket') + ').</p>',
     follow=['python -m paket komutu hangi dosyayı çalıştırır?', 'multiprocessing\'te bu blok olmazsa neden sorun çıkar?'],
     flags=['"Programın başlangıç noktasıdır, zorunludur" demek', 'Import sırasında modülün çalıştırıldığını bilmemek'],
     tip='Test edilebilirlik ve multiprocessing örneğini vermek cevabı ezber seviyesinden yukarı taşır.'),

dict(roles=['genel', 'backend'], lv='ileri', topic='Import sistemi ve döngüsel import', kind='kavram',
     q='Python\'da import nasıl çalışır? Döngüsel (circular) import hatası neden oluşur ve nasıl çözersin?',
     a='<p><b>Import adımları:</b> Python önce ' + c('sys.modules') + ' önbelleğine bakar; modül oradaysa doğrudan onu verir (bu yüzden modül kodu yalnızca <i>bir kez</i> çalışır). Değilse ' + c('sys.path') + ' üzerindeki bulucularla dosyayı bulur, <b>boş bir modül nesnesi oluşturup hemen</b> ' + c('sys.modules') + '\'a koyar, ardından modül kodunu yukarıdan aşağı çalıştırır.</p>'
       '<p><b>Döngü nasıl patlar?</b> ' + c('siparis.py') + ' başta ' + c('from musteri import Musteri') + ' yapar; ' + c('musteri.py') + ' de ' + c('from siparis import Siparis') + ' yapar. ' + c('siparis') + ' henüz yarıda olduğu için ' + c('sys.modules') + '\'taki nesnesi eksiktir; ' + c('Siparis') + ' henüz tanımlanmamıştır ve ' + c('ImportError: cannot import name ... (most likely due to a circular import)') + ' alınır.</p>'
       '<p><b>Çözümler (tercih sırasıyla):</b></p><ul><li><b>Tasarımı düzelt:</b> Ortak parçaları üçüncü bir modüle (' + c('modeller.py') + ') taşı; bağımlılık yönünü tek yönlü yap. Döngü genellikle katman ihlalinin işaretidir.</li>'
       '<li>Yalnızca tip notasyonu için gerekiyorsa ' + c('if TYPE_CHECKING:') + ' altında import et ve string notasyon veya ' + c('from __future__ import annotations') + ' kullan.</li>'
       '<li>Modülün tamamını import et (' + c('import siparis') + ') ve ismi kullanım anında çöz.</li>'
       '<li>Son çare: import\'u fonksiyonun içine taşı (gecikmeli import).</li></ul>',
     follow=['TYPE_CHECKING sabiti nasıl çalışır?', 'Bir modülü yeniden yüklemek (importlib.reload) neden risklidir?'],
     flags=['Yalnızca "import\'u fonksiyona taşırım" demek', 'sys.modules önbelleğini bilmemek'],
     tip='Mekanizmayı (yarım modül nesnesi) açıkla, sonra çözümleri "tasarımdan başlayarak" sırala.'),

dict(roles=['genel'], lv='orta', topic='pytest', kind='kavram',
     q='pytest ile test yazarken fixture ve ' + '<code>parametrize</code> ne işe yarar? Kısa bir örnekle anlat.',
     a='<p><b>Fixture:</b> Testlerin ihtiyaç duyduğu hazırlığı (veritabanı bağlantısı, örnek veri, geçici dizin) tanımlayan ve <b>bağımlılık enjeksiyonu</b> ile testlere verilen fonksiyondur. Test, fixture adını parametre olarak yazar; pytest gerisini halleder. ' + c('yield') + ' ile hazırlık ve temizlik aynı yerde durur. ' + c('scope') + ' (' + c('function') + ', ' + c('module') + ', ' + c('session') + ') pahalı kaynakların ne sıklıkla oluşturulacağını belirler.</p>'
       '<p><b>' + c('parametrize') + ':</b> Aynı testi farklı girdi ve beklenen çıktı çiftleriyle çalıştırır; her durum ayrı bir test olarak raporlanır.</p>'
       + pre('import pytest\n\n@pytest.fixture\ndef sepet():\n    return {"çay": 45.0, "simit": 15.0}\n\n@pytest.mark.parametrize("kupon, beklenen", [\n    (None, 60.0),\n    ("YUZDE10", 54.0),\n    ("GECERSIZ", 60.0),\n])\ndef test_toplam(sepet, kupon, beklenen):\n    assert toplam(sepet, kupon) == pytest.approx(beklenen)')
       + '<p><b>Diğer güçlü yanlar:</b> düz ' + c('assert') + ' ile ayrıntılı hata mesajları (assert yeniden yazımı), ' + c('pytest.raises') + ' ile istisna testi, ' + c('conftest.py') + ' ile paylaşılan fixture\'lar, ' + c('tmp_path') + ' ve ' + c('monkeypatch') + ' gibi yerleşik fixture\'lar, işaretler (' + c('-m "not yavas"') + '). Float karşılaştırmada ' + c('pytest.approx') + ' kullanmak önemlidir.</p>',
     follow=['session kapsamlı bir veritabanı fixture\'ında testleri birbirinden nasıl yalıtırsın?', 'conftest.py nasıl keşfedilir?'],
     flags=['Fixture\'ı yalnızca "setUp metodunun karşılığı" olarak anlatmak', 'Float\'ları == ile karşılaştırmayı sorun görmemek'],
     tip='Kısa bir parametrize örneği yazmak, gerçekten test yazdığını gösterir.'),

dict(roles=['genel', 'backend'], lv='ileri', topic='Mock ve patch', kind='kavram',
     q='' + '<code>unittest.mock.patch</code> kullanırken "nesnenin tanımlandığı yeri değil, kullanıldığı yeri yamala" kuralını açıkla.',
     a='<p><b>Durum:</b> ' + c('kur_servisi.py') + ' içinde ' + c('def guncel_kur(): ...') + ' var; ' + c('fatura.py') + ' ise ' + c('from kur_servisi import guncel_kur') + ' yapıp onu kullanıyor.</p>'
       '<p><b>Neden?</b> ' + c('from ... import') + ', ' + c('fatura') + ' modülünün kendi isim alanında ' + c('guncel_kur') + ' adlı <i>yeni bir isim</i> oluşturur ve onu orijinal fonksiyona bağlar. ' + c('patch("kur_servisi.guncel_kur")') + ' yalnızca ' + c('kur_servisi') + '\'ndaki ismi değiştirir; ' + c('fatura.guncel_kur') + ' hâlâ eski fonksiyonu gösterir ve test gerçek servise gider.</p>'
       + pre('from unittest.mock import patch\n\n@patch("fatura.guncel_kur", return_value=34.5)  # doğru: kullanıldığı yer\ndef test_fatura(mock_kur):\n    assert fatura_tutari(100) == 3450\n    mock_kur.assert_called_once()')
       + '<p>' + c('fatura.py') + ' ' + c('import kur_servisi') + ' yapıp ' + c('kur_servisi.guncel_kur()') + ' çağırsaydı ' + c('"kur_servisi.guncel_kur"') + ' yamalamak doğru olurdu, çünkü arama çağrı anında modül üzerinden yapılır.</p>'
       '<p><b>İyi uygulamalar:</b> ' + c('autospec=True') + ' ile sahte nesnenin gerçek imzaya uymasını sağla; yanlış argümanla çağrı sessizce geçmesin. Aşırı mock\'lamak testleri uygulama ayrıntısına bağlar; mümkünse bağımlılığı parametre olarak enjekte edip basit bir sahte nesne (fake) ver. HTTP için ' + c('responses') + '/' + c('respx') + ' gibi araçlar daha gerçekçidir.</p>',
     follow=['autospec olmadan mock\'un hangi hatayı gizleyebileceğine örnek verir misin?', 'Mock yerine bağımlılık enjeksiyonu ne zaman daha iyidir?'],
     flags=['Kuralı ezbere söyleyip nedenini (isim bağlama) açıklayamamak', 'Her dış bağımlılığı mock\'lamayı tek strateji görmek'],
     tip='İki dosyalı küçük senaryoyu sözlü anlatmak bu soruda en ikna edici yoldur.'),

dict(roles=['genel'], lv='temel', topic='Test türleri', kind='kavram',
     q='Birim testi, entegrasyon testi ve uçtan uca (E2E) test arasındaki farklar nelerdir? Test piramidi ne anlatır?',
     a='<p><b>Birim testi (unit):</b> Tek bir fonksiyonu veya sınıfı dış bağımlılıklarından yalıtarak test eder. Milisaniyeler sürer, hata yerini net gösterir. Örnek: KDV hesaplayan fonksiyon.</p>'
       '<p><b>Entegrasyon testi:</b> Birden fazla bileşenin birlikte çalışmasını test eder: kodun gerçek (genellikle test) veritabanıyla, kuyrukla veya bir HTTP katmanıyla etkileşimi. Daha yavaştır ama birim testlerin kaçırdığı sorunları (yanlış SQL, serileştirme hatası) yakalar. Örnek: FastAPI ' + c('TestClient') + ' ile ' + c('/siparis') + ' uç noktasına istek atıp veritabanına kaydın düştüğünü görmek.</p>'
       '<p><b>Uçtan uca test:</b> Sistemi gerçek kullanıcı gibi baştan sona kullanır (tarayıcıda Playwright ile giriş yap, sepete ekle, öde). En gerçekçi ama en yavaş, en kırılgan ve bakımı en pahalı olanıdır.</p>'
       '<p><b>Test piramidi:</b> Tabanda çok sayıda hızlı birim testi, ortada daha az entegrasyon testi, tepede az sayıda kritik E2E senaryosu bulunmalıdır. Piramit ters dönerse ("dondurma külahı") test paketi yavaşlar, rastgele kırılır (flaky) ve ekip testlere güvenmez.</p>'
       '<p>Ek olarak sözleşme testleri (servisler arası API uyumu) ve ' + c('hypothesis') + ' ile özellik tabanlı testler değerli tamamlayıcılardır.</p>',
     follow=['Flaky (kararsız) bir testle karşılaştığında ne yaparsın?', 'Test kapsamı (coverage) %100 olmak neden yeterli değildir?'],
     flags=['Yalnızca birim testi yazmanın yeterli olduğunu söylemek', 'Kapsam yüzdesini kalite ölçüsü olarak görmek'],
     tip='Her test türüne aynı projeden (ör. Anadolu Market sepet) bir örnek ver; tutarlı bir hikâye oluşur.'),

dict(roles=['genel'], lv='orta', topic='try/except/else/finally', kind='kod-okuma',
     q='Bu fonksiyonun çıktısı nedir? Özellikle ' + '<code>finally</code> içindeki <code>return</code>\'e dikkat et.',
     code='def isle(deger):\n    try:\n        sonuc = 100 / deger\n    except ZeroDivisionError:\n        print("sıfıra bölme")\n        return "hata"\n    else:\n        print("başarılı")\n        return sonuc\n    finally:\n        print("temizlik")\n\nprint(isle(4))\nprint(isle(0))\n\ndef yutan():\n    try:\n        raise ValueError("kayıp")\n    finally:\n        return "finally kazandı"\n\nprint(yutan())\n',
     out='başarılı\ntemizlik\n25.0\nsıfıra bölme\ntemizlik\nhata\nfinally kazandı',
     a='<p><b>Sıra kuralları:</b> ' + c('try') + ' çalışır; hata olursa eşleşen ' + c('except') + ', olmazsa ' + c('else') + ' çalışır. ' + c('finally') + ' <i>her durumda</i>, fonksiyondan ' + c('return') + ' ile çıkılırken bile en son çalışır.</p>'
       '<p>' + c('isle(4)') + ': bölme başarılı, ' + c('else') + ' "başarılı" basar ve ' + c('return 25.0') + ' hazırlanır; dönmeden önce ' + c('finally') + ' "temizlik" basar, ardından 25.0 yazdırılır. ' + c('isle(0)') + ': ' + c('except') + ' çalışır, yine dönmeden önce "temizlik" basılır.</p>'
       '<p><b>' + c('else') + ' neden var?</b> Yalnızca hata çıkmadığında çalışacak kodu ' + c('try') + ' dışında tutarak, o koddaki beklenmeyen hataların yanlışlıkla aynı ' + c('except') + ' tarafından yakalanmasını önler. ' + c('try') + ' bloğu olabildiğince dar tutulmalıdır.</p>'
       '<p><b>Tehlike:</b> ' + c('finally') + ' içindeki ' + c('return') + ', ' + c('try') + '\'dan gelen dönüş değerini ezer ve <b>yayılmakta olan istisnayı sessizce yutar</b>. ' + c('yutan()') + ' bir ' + c('ValueError') + ' fırlatıyor ama çağıran bunu hiç görmüyor. Python 3.14 bu kullanım için ' + c('SyntaxWarning') + ' verir (PEP 765). ' + c('finally') + ' yalnızca temizlik içindir; ' + c('return') + ', ' + c('break') + ' veya ' + c('continue') + ' koyma.</p>',
     follow=['else bloğu olmasaydı kodu nasıl yazardın ve ne kaybederdin?', 'finally içinde bir istisna fırlarsa orijinal istisnaya ne olur?'],
     flags=['finally\'nin return\'den önce çalıştığını bilmemek', 'yutan() için ValueError fırlayacağını söylemek'],
     tip='Satırları sırayla yazarken "finally dönüşten hemen önce" ifadesini kullan; çıktının mantığı oturur.'),

dict(roles=['genel', 'backend'], lv='orta', topic='İstisna zincirleme', kind='kavram',
     q='' + '<code>raise YeniHata(...) from e</code> ne işe yarar? Örtük zincirleme ve <code>from None</code> ile farkı nedir?',
     a='<p>Bir istisnayı yakalayıp daha anlamlı bir alan istisnasına çevirmek yaygın bir katmanlama tekniğidir: veritabanı sürücüsünün ' + c('IntegrityError') + '\'u servis katmanında ' + c('KullaniciZatenVar') + ' olur. Önemli olan kök nedeni kaybetmemektir.</p>'
       + pre('try:\n    bakiye = hesaplar[iban]\nexcept KeyError as e:\n    raise HesapBulunamadi(iban) from e')
       + '<ul><li><b>' + c('from e') + ' (açık zincirleme):</b> Orijinal hata ' + c('__cause__') + ' özelliğine konur. Hata izinde "The above exception was the direct cause of the following exception" yazar. Niyet açıktır: "bu hatayı bilerek dönüştürdüm".</li>'
       '<li><b>Örtük zincirleme:</b> ' + c('except') + ' bloğunda ' + c('from') + ' olmadan yeni hata fırlarsa eski hata ' + c('__context__') + '\'e konur ve iz "During handling of the above exception, another exception occurred" der. Bu, istisnayı işlerken kazara başka bir hata yapmış gibi görünür.</li>'
       '<li><b>' + c('from None') + ':</b> Zinciri bastırır (' + c('__suppress_context__ = True') + '). İç ayrıntı kullanıcıya gürültü olacaksa veya hassas bilgi içeriyorsa kullanılır.</li></ul>'
       '<p><b>Kural:</b> Hata dönüştürüyorsan ' + c('from e') + ' yaz. Hiçbir zaman ' + c('except Exception: pass') + ' ile kök nedeni yok etme; en azından ' + c('logger.exception') + ' ile logla.</p>',
     follow=['__cause__ ve __context__ özniteliklerini loglama sırasında nasıl kullanırsın?', 'Kendi istisna hiyerarşini nasıl tasarlarsın?'],
     flags=['Hatayı dönüştürürken orijinali tamamen kaybetmeyi sorun görmemek', 'from None\'ı varsayılan alışkanlık hâline getirmek'],
     tip='Katmanlı mimari örneği (DB hatası → alan hatası) vermek, sorunun neden sorulduğunu anladığını gösterir.'),

dict(roles=['genel'], lv='orta', topic='Yineleyici protokolü', kind='kod-okuma',
     q='Kendi yinelenebilir sınıfımızı yazdık. Çıktı nedir ve ' + '<code>__iter__</code> neden her seferinde yeni nesne döndürüyor?',
     code='class Vardiya:\n    def __init__(self, calisanlar):\n        self.calisanlar = calisanlar\n    def __iter__(self):\n        return VardiyaGezgini(self.calisanlar)\n\nclass VardiyaGezgini:\n    def __init__(self, liste):\n        self.liste, self.i = liste, 0\n    def __iter__(self):\n        return self\n    def __next__(self):\n        if self.i >= len(self.liste):\n            raise StopIteration\n        kisi = self.liste[self.i]\n        self.i += 1\n        return kisi.upper()\n\nv = Vardiya(["ece", "can"])\nprint(list(v))\nprint(list(v))\ng = iter(v)\nprint(next(g), list(g), list(g))\n',
     out="['ECE', 'CAN']\n['ECE', 'CAN']\nECE ['CAN'] []",
     a='<p>Python\'da iki ayrı kavram vardır:</p><ul><li><b>Yinelenebilir (iterable):</b> ' + c('__iter__') + ' metodu yeni bir yineleyici döndürür. ' + c('list') + ', ' + c('dict') + ' ve buradaki ' + c('Vardiya') + ' böyledir.</li>'
       '<li><b>Yineleyici (iterator):</b> ' + c('__next__') + ' ile sıradaki elemanı verir, bitince ' + c('StopIteration') + ' fırlatır; ' + c('__iter__') + ' kendisini döndürür.</li></ul>'
       '<p>' + c('for') + ' ve ' + c('list()') + ' önce ' + c('iter(nesne)') + ' çağırır, sonra ' + c('StopIteration') + ' gelene kadar ' + c('next()') + ' çağırır. ' + c('Vardiya.__iter__') + ' her seferinde <b>taze</b> bir gezgin ürettiği için ' + c('list(v)') + ' iki kez aynı sonucu verir.</p>'
       '<p>Ama ' + c('g') + ' bir yineleyicidir: ' + c('next(g)') + ' "ECE"yi alır, ilk ' + c('list(g)') + ' kalan "CAN"ı tüketir, ikinci ' + c('list(g)') + ' boş döner. Yineleyiciler tek kullanımlıktır.</p>'
       '<p><b>Pratik kısayol:</b> Ayrı gezgin sınıfı yazmak yerine ' + c('__iter__') + '\'u üreteç olarak yazabilirsin: ' + c('def __iter__(self): for k in self.calisanlar: yield k.upper()') + '. Python her çağrıda yeni bir üreteç oluşturur ve aynı davranışı daha kısa kodla elde edersin.</p>',
     follow=['__iter__ olmadan yalnızca __getitem__ tanımlarsan for döngüsü çalışır mı?', 'Yinelenebilir sınıfın __iter__\'i self döndürseydi ne olurdu?'],
     flags=['Yinelenebilir ile yineleyiciyi aynı şey saymak', 'Son list(g)\'nin yine [\'CAN\'] vereceğini söylemek'],
     tip='İki kavramı ayırarak başla; sonra "for döngüsü aslında iter + next" diye mekanizmayı göster.'),

dict(roles=['genel'], lv='temel', topic='Sıralama ve kararlılık', kind='kod-okuma',
     q='Kanat Havayolları\'nın uçuşlarını önce rötara göre azalan, eşitlikte kalkış saatine göre artan sıralıyoruz. Çıktı nedir?',
     code='ucuslar = [\n    ("TK101", "08:30", 15),\n    ("TK205", "07:10", 40),\n    ("TK330", "09:00", 15),\n    ("TK412", "06:45", 0),\n]\nsirali = sorted(ucuslar, key=lambda u: (-u[2], u[1]))\nprint([u[0] for u in sirali])\n\nadimli = sorted(ucuslar, key=lambda u: u[1])\nadimli = sorted(adimli, key=lambda u: u[2], reverse=True)\nprint([u[0] for u in adimli])\nprint(ucuslar[0][0])\n',
     out="['TK205', 'TK101', 'TK330', 'TK412']\n['TK205', 'TK101', 'TK330', 'TK412']\nTK101",
     a='<p><b>1. yol — tuple anahtar:</b> ' + c('key') + ' her uçuş için ' + c('(-rötar, saat)') + ' tuple\'ı üretir. Tuple\'lar soldan sağa karşılaştırılır: önce eksi rötar (yani rötar azalan), eşitlikte saat artan. 40 dakikalık TK205 başa gelir; 15 dakikalık TK101 ve TK330 saatlerine göre sıralanır ("08:30" &lt; "09:00"); TK412 en sona kalır. "SS:DD" biçimli saatler string olarak da doğru sıralanır, çünkü sıfırla doldurulmuşlardır.</p>'
       '<p><b>2. yol — çok geçişli sıralama:</b> Python\'un sıralaması (Timsort) <b>kararlıdır</b>: eşit anahtarlı elemanlar önceki göreli sıralarını korur. Önce ikincil ölçüte (saat), sonra birincil ölçüte (rötar, azalan) göre sıralayınca aynı sonuç çıkar. Negatifleştirilemeyen anahtarlarda (örneğin string\'i azalan sıralamak) bu yöntem çok işe yarar.</p>'
       '<p>' + c('sorted') + ' yeni bir liste döndürür; orijinal ' + c('ucuslar') + ' değişmez, bu yüzden son satır hâlâ TK101 yazar. ' + c('list.sort()') + ' ise yerinde sıralar ve ' + c('None') + ' döndürür. Karmaşıklık O(n log n); ' + c('key') + ' her eleman için yalnızca bir kez hesaplanır.</p>',
     follow=['İsimleri azalan, tarihleri artan sıralamak için ne yaparsın?', 'operator.itemgetter burada nasıl kullanılır?'],
     flags=['sorted\'ın orijinal listeyi değiştirdiğini söylemek', 'Kararlılık kavramını bilmemek'],
     tip='"Python sıralaması kararlıdır" bilgisini çok geçişli örnekle göstermek bu soruda fark yaratır.'),

dict(roles=['genel'], lv='orta', topic='dataclass', kind='kavram',
     q='' + '<code>@dataclass</code> ne sağlar? <code>frozen</code>, <code>field(default_factory=...)</code> ve <code>__post_init__</code> ne işe yarar?',
     a='<p>' + c('@dataclass') + ', sınıf gövdesindeki tip notasyonlu alanlardan ' + c('__init__') + ', ' + c('__repr__') + ' ve ' + c('__eq__') + ' metotlarını otomatik üretir. Böylece veri taşıyan sınıflarda tekrar eden kod ortadan kalkar.</p>'
       + pre('from dataclasses import dataclass, field\n\n@dataclass(frozen=True, slots=True)\nclass Siparis:\n    no: str\n    tutar: float\n    urunler: tuple[str, ...] = ()\n\n@dataclass\nclass Sepet:\n    musteri: str\n    kalemler: list[str] = field(default_factory=list)\n    indirim: float = 0.0\n    def __post_init__(self):\n        if not 0 <= self.indirim <= 0.5:\n            raise ValueError("indirim 0-0.5 arası olmalı")')
       + '<ul><li><b>' + c('frozen=True') + ':</b> Alanlara atamayı engeller (' + c('FrozenInstanceError') + ') ve tutarlı bir ' + c('__hash__') + ' üretir; nesne sözlük anahtarı olabilir.</li>'
       '<li><b>' + c('default_factory') + ':</b> Değişebilir varsayılanlar için her örneğe yeni liste verir. ' + c('kalemler: list = []') + ' yazmak ' + c('ValueError') + ' ile reddedilir.</li>'
       '<li><b>' + c('__post_init__') + ':</b> Üretilen ' + c('__init__') + '\'ten sonra çalışır; doğrulama ve türetilmiş alanlar için kullanılır.</li></ul>'
       '<p>Diğer seçenekler: ' + c('order=True') + ' (karşılaştırma), ' + c('kw_only=True') + ', ' + c('slots=True') + ' (3.10+). Dış veri doğrulama ve dönüştürme gerekiyorsa Pydantic daha uygundur; dataclass tipleri çalışma anında denetlemez.</p>',
     follow=['dataclass ile Pydantic modeli arasında nasıl seçim yaparsın?', 'frozen bir dataclass\'ta __post_init__ içinde alan nasıl atanır?'],
     flags=['dataclass\'ın tipleri doğruladığını sanmak', 'Değişebilir varsayılan sorununu bilmemek'],
     tip='Kısa bir örnekle üç özelliği (frozen, default_factory, __post_init__) birlikte göster.'),

dict(roles=['genel'], lv='temel', topic='@property', kind='kavram',
     q='' + '<code>@property</code> ne işe yarar? Java tarzı <code>get_bakiye()</code> / <code>set_bakiye()</code> yazmak yerine neden tercih edilir?',
     a='<p>' + c('@property') + ', bir metodu öznitelik gibi erişilebilir kılar. Okuma, yazma ve silme işlemlerine mantık (doğrulama, hesaplama, önbellek) eklemeni sağlarken çağıran kodun sözdizimini değiştirmez.</p>'
       + pre('class Hesap:\n    def __init__(self, bakiye=0):\n        self.bakiye = bakiye          # setter\'dan geçer\n\n    @property\n    def bakiye(self):\n        return self._bakiye\n\n    @bakiye.setter\n    def bakiye(self, deger):\n        if deger < 0:\n            raise ValueError("bakiye negatif olamaz")\n        self._bakiye = deger')
       + '<p><b>Neden getter/setter yazmayız?</b> Python\'da başlangıçta düz öznitelik kullanmak normaldir (' + c('hesap.bakiye') + '). Sonradan doğrulama gerekirse onu ' + c('property') + '\'ye çevirirsin ve hiçbir çağıran kod değişmez. Java\'da bu esneklik olmadığı için baştan getter/setter yazılır; Python\'da gereksiz törendir.</p>'
       '<p><b>Kullanım alanları:</b> salt okunur öznitelikler (setter yazmamak), türetilmiş değerler (' + c('tam_ad') + ', ' + c('kdvli_fiyat') + '), doğrulama. Pahalı ve değişmeyen hesaplar için ' + c('functools.cached_property') + ' kullanılır.</p>'
       '<p><b>Dikkat:</b> Property\'ler ucuz görünür; içine ağ çağrısı ya da veritabanı sorgusu koymak, kullananı yanıltır ve döngü içinde ciddi performans sorunlarına yol açar. Bu tür işler için açık bir metot kullan.</p>',
     follow=['cached_property ile property farkı nedir?', 'property aslında hangi Python mekanizmasıyla (descriptor) çalışır?'],
     flags=['Her öznitelik için baştan getter/setter yazmayı önermek', 'Property içine pahalı I/O koymayı sorun görmemek'],
     tip='"Önce düz öznitelik, gerekirse property; arayüz değişmez" fikrini mutlaka söyle.'),

dict(roles=['genel'], lv='temel', topic='classmethod ve staticmethod', kind='kavram',
     q='' + '<code>@classmethod</code> ile <code>@staticmethod</code> arasındaki fark nedir? Her biri için gerçek bir kullanım örneği ver.',
     a='<ul><li><b>Örnek metodu:</b> İlk argümanı ' + c('self') + ' (nesnenin kendisi). Nesnenin durumuyla çalışır.</li>'
       '<li><b>' + c('@classmethod') + ':</b> İlk argümanı ' + c('cls') + ' (sınıfın kendisi). Örneğe değil sınıfa bağlıdır; alt sınıftan çağrılınca ' + c('cls') + ' alt sınıf olur.</li>'
       '<li><b>' + c('@staticmethod') + ':</b> Otomatik ilk argüman almaz. Sınıfın isim alanında duran sıradan bir fonksiyondur.</li></ul>'
       + pre('class Calisan:\n    def __init__(self, ad, maas):\n        self.ad, self.maas = ad, maas\n\n    @classmethod\n    def csv_satirindan(cls, satir):          # alternatif kurucu\n        ad, maas = satir.split(";")\n        return cls(ad, float(maas))\n\n    @staticmethod\n    def tc_gecerli_mi(tc):                   # yardımcı, durum gerektirmez\n        return len(tc) == 11 and tc.isdigit() and tc[0] != "0"')
       + '<p><b>classmethod kullanımı:</b> Alternatif kurucular (' + c('dict.fromkeys') + ', ' + c('datetime.fromisoformat') + ' bu kalıptır). ' + c('cls(...)') + ' kullandığı için ' + c('Yonetici(Calisan)') + ' alt sınıfından çağrılınca doğru tipte nesne üretir. Ayrıca sınıf düzeyindeki ayarlara erişmek için de kullanılır.</p>'
       '<p><b>staticmethod kullanımı:</b> Mantıksal olarak sınıfa ait ama ne nesneye ne sınıfa ihtiyaç duyan yardımcılar. Birçok durumda modül düzeyinde bir fonksiyon da aynı derecede iyidir; staticmethod yalnızca gruplama sağlar.</p>',
     follow=['Alternatif kurucuda cls yerine Calisan(...) yazsaydın alt sınıfta ne olurdu?', 'Modül fonksiyonu yerine staticmethod seçmenin artısı ne?'],
     flags=['classmethod ile staticmethod\'u yalnızca "argüman farkı" olarak açıklayıp kullanım senaryosunu verememek', 'Alternatif kurucu kalıbını bilmemek'],
     tip='Alternatif kurucu örneği bu sorunun en güçlü cevabıdır; standart kütüphaneden bir örnekle destekle.'),

dict(roles=['genel'], lv='temel', topic='Liste çarpımı tuzağı', kind='kod-okuma',
     q='Bir mağaza rafı ızgarası kuruyoruz. Tek bir hücreyi değiştirdiğimizde ne olur?',
     code='raf = [[0] * 3] * 2\nraf[0][1] = 5\nprint(raf)\nprint(raf[0] is raf[1])\n\ndogru = [[0] * 3 for _ in range(2)]\ndogru[0][1] = 5\nprint(dogru)\n',
     out='[[0, 5, 0], [0, 5, 0]]\nTrue\n[[0, 5, 0], [0, 0, 0]]',
     a='<p>' + c('[0] * 3') + ' sorunsuzdur: elemanlar değişmez tamsayılardır. Ama ' + c('[satir] * 2') + ' satırın kopyasını değil, <b>aynı liste nesnesine iki referans</b> içeren bir dış liste üretir. Bu yüzden ' + c('raf[0][1] = 5') + ' iki satırda birden görünür ve ' + c('raf[0] is raf[1]') + ' True döner.</p>'
       '<p><b>Çözüm:</b> Kavrayış her döngü adımında ' + c('[0] * 3') + ' ifadesini yeniden değerlendirir ve her satır için yeni bir liste oluşturur. Üçüncü çıktı bunu gösterir.</p>'
       '<p><b>Neden önemli?</b> Bu, matris, oyun tahtası, takvim ızgarası veya dinamik programlama tablosu kurarken en sık yapılan hatalardan biridir ve hata mesajı vermez; yalnızca yanlış sonuç üretir. Aynı tuzak ' + c('dict.fromkeys(anahtarlar, [])') + ' için de geçerlidir: tüm anahtarlar tek bir listeyi paylaşır. Orada ' + c('{k: [] for k in anahtarlar}') + ' ya da ' + c('collections.defaultdict(list)') + ' kullanılmalıdır.</p>'
       '<p>Sayısal tablolar için NumPy (' + c('np.zeros((2, 3))') + ') hem bu sorunu ortadan kaldırır hem de çok daha hızlıdır.</p>',
     follow=['dict.fromkeys(["a", "b"], []) neden aynı sorunu yaşar?', 'Bu hatayı bir birim testiyle nasıl yakalarsın?'],
     flags=['Yalnızca ilk satırın değişeceğini söylemek', '* operatörünün derin kopya yaptığını sanmak'],
     tip='Çıktıyı verdikten sonra "is" kontrolüyle aynı nesne olduğunu kanıtla; açıklaman somutlaşır.'),

dict(roles=['genel'], lv='temel', topic='Kayan nokta ve Decimal', kind='kod-okuma',
     q='Ilgaz Bank\'ta faiz hesabında kuruş farkı çıkıyor. Çıktı nedir, parayı nasıl tutmalıyız?',
     code='from decimal import Decimal, ROUND_HALF_UP\nprint(0.1 + 0.2 == 0.3)\nprint(0.1 + 0.2)\nprint(round(2.675, 2))\nd = Decimal("2.675").quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)\nprint(d)\nprint(Decimal("0.1") + Decimal("0.2") == Decimal("0.3"))\nprint(Decimal(0.1))\n',
     out='False\n0.30000000000000004\n2.67\n2.68\nTrue\n0.1000000000000000055511151231257827021181583404541015625',
     a='<p>' + c('float') + ', IEEE 754 standardında <b>ikili (binary)</b> kayan nokta sayısıdır. 0.1 gibi ondalık kesirler ikili sistemde tam ifade edilemez (1/3\'ün ondalıkta 0.333… olması gibi). Bu yüzden ' + c('0.1 + 0.2') + ' tam 0.3 değildir.</p>'
       '<p>' + c('round(2.675, 2)') + ' 2.68 değil 2.67 verir. Bunun iki nedeni var: 2.675 bellekte aslında 2.67499999… olarak tutulur ve Python\'un ' + c('round') + '\'u ayrıca "bankacı yuvarlaması" (yarımı çifte yuvarla) kullanır.</p>'
       '<p><b>Para için doğru yol:</b></p><ul><li>' + c('Decimal') + '\'i mutlaka <b>string\'ten</b> oluştur. Son satırın gösterdiği gibi ' + c('Decimal(0.1)') + ' float\'ın hatasını olduğu gibi taşır.</li>'
       '<li>Yuvarlamayı açıkça ' + c('quantize') + ' ve mevzuata uygun bir kip (' + c('ROUND_HALF_UP') + ') ile yap.</li>'
       '<li>Alternatif: tutarları tamsayı kuruş olarak sakla.</li>'
       '<li>Veritabanında ' + c('NUMERIC(18, 2)') + ' kullan, ' + c('FLOAT') + ' değil.</li></ul>'
       '<p>Float\'ları karşılaştırırken ' + c('math.isclose(a, b)') + ' kullan. Bilimsel hesaplarda float doğru araçtır; para ve muhasebede değildir.</p>',
     follow=['Decimal(0.1) ile Decimal("0.1") neden farklı?', 'Veritabanında para sütunu için hangi tipi seçersin?'],
     flags=['"Python\'un bir hatası" demek', 'Decimal\'i float\'tan oluşturmayı sorun görmemek', 'Para için float kullanmayı kabul edilebilir bulmak'],
     tip='Bankacılık bağlamını kullan: "Kuruş farkı denetimde sorun olur, bu yüzden Decimal ve açık yuvarlama kipi" de.'),

dict(roles=['genel'], lv='orta', topic='String değişmezliği ve birleştirme', kind='kavram',
     q='Büyük bir CSV raporunu satır satır string\'e ' + '<code>+=</code> ile eklemek neden kötü bir fikir olabilir? Ne önerirsin?',
     a='<p>String\'ler <b>değişmezdir</b>. ' + c('rapor += satir') + ' teknik olarak her seferinde yeni bir string oluşturup eski içeriği ve yeni parçayı ona kopyalar. n satır için toplam kopyalama O(n²)\'ye çıkabilir; 100 binlerce satırda bu fark saniyeler hatta dakikalar demektir.</p>'
       '<p><b>Not:</b> CPython\'da string\'e başka referans yoksa ' + c('+=') + ' için yerinde genişletme yapan bir optimizasyon vardır, bu yüzden küçük testlerde sorun görünmeyebilir. Ancak bu bir uygulama ayrıntısıdır; PyPy\'de veya string\'e başka bir referans olduğunda geçerli değildir. Güvenilmemelidir.</p>'
       '<p><b>Doğru yollar:</b></p>'
       + pre('satirlar = [f"{s[\'id\']};{s[\'tutar\']}" for s in siparisler]\nrapor = "\\n".join(satirlar)          # O(n), tek ayırma')
       + '<ul><li>Parçaları listede topla, sonda ' + c('"".join(...)') + ' kullan.</li>'
       '<li>Akış hâlinde üretiyorsan ' + c('io.StringIO') + ' kullan.</li>'
       '<li>Asıl hedef dosyaysa string biriktirme; doğrudan dosyaya yaz. CSV için ' + c('csv.writer') + ', kaçış ve ayırıcı kurallarını da doğru uygular.</li></ul>'
       '<p>Genel ders: değişmez nesneyi döngüde "değiştirmek" gizli bir kopyalama maliyetidir. Aynı mantık tuple birleştirme ve ' + c('bytes') + ' için de geçerlidir; ikili veri için ' + c('bytearray') + ' kullanılır.</p>',
     follow=['CSV üretirken neden string birleştirme yerine csv modülünü kullanmalısın?', 'Bu farkı timeit ile nasıl ölçersin?'],
     flags=['"+= her zaman yavaştır" diye kesin konuşup CPython optimizasyonunu bilmemek', 'join\'in neden hızlı olduğunu açıklayamamak'],
     tip='Karmaşıklığı (O(n²) ve O(n)) söylemek ve gerçek bir iş örneği (rapor üretimi) vermek cevabı güçlendirir.'),

dict(roles=['genel'], lv='orta', topic='Walrus operatörü', kind='kod-okuma',
     q='Lezzet Kurye loglarını walrus operatörüyle (' + '<code>:=</code>) işliyoruz. Çıktı nedir?',
     code='import re\nloglar = ["sip=101 sure=34", "hata", "sip=102 sure=58", "sip=103 sure=12"]\ngec = [int(m.group(1)) for satir in loglar if (m := re.search(r"sure=(\\d+)", satir)) and int(m.group(1)) > 30]\nprint(gec)\n\nveri = iter([5, 8, 0, 3])\ntoplam = 0\nwhile (x := next(veri)) != 0:\n    toplam += x\nprint(toplam, x)\nprint(m.group(0))\n',
     out='[34, 58]\n13 0\nsure=12',
     a='<p><b>Atama ifadesi</b> (' + c(':=') + ', PEP 572, Python 3.8) bir değeri hem bir isme bağlar hem de ifadenin sonucu olarak döndürür. Böylece aynı hesabı iki kez yapmadan koşulda kullanabilirsin.</p>'
       '<p><b>Kavrayışta:</b> Her satırda ' + c('re.search') + ' bir kez çalışır; sonuç ' + c('m') + '\'ye atanır. "hata" satırında ' + c('None') + ' döner ve ' + c('and') + ' kısa devre yapar. 34 ve 58 eşiği geçer, 12 geçmez.</p>'
       '<p><b>while\'da:</b> ' + c('x := next(veri)') + ' her turda yeni değeri alır ve 0 gelince döngü biter: 5 + 8 = 13. ' + c('x') + ' son okunan değeri (0) korur.</p>'
       '<p><b>İnce nokta:</b> Kavrayış içinde ' + c(':=') + ' ile bağlanan isim, kavrayışın kendi kapsamına değil <b>çevreleyen kapsama</b> sızar (bilinçli bir kural). Bu yüzden son satırda ' + c('m') + ', son eşleşmeyi ("sure=12") gösterir. Normal kavrayış döngü değişkeni ise sızmaz.</p>'
       '<p><b>Ölçülü kullan:</b> Tekrarı önlediği ve kodu kısalttığı yerlerde (regex eşleşmesi, parça parça okuma döngüsü) faydalıdır. Okunabilirliği bozuyorsa iki satırlık açık kod daha iyidir.</p>',
     follow=['Kavrayış içinde := ile bağlanan değişken neden dışarı sızar?', 'Dosyayı parça parça okurken walrus nasıl kullanılır?'],
     flags=['m\'nin kavrayış dışında tanımsız olacağını söylemek', 'Walrus\'u her atama için önermek'],
     tip='Bir regex ve bir while örneği; walrus\'un iki klasik kullanımı budur, ikisini de bilmen beklenir.'),

dict(roles=['genel'], lv='temel', topic='Dinamik ve güçlü tipleme', kind='kavram',
     q='Python için "dinamik tipli ama güçlü tipli bir dil" denir. Bu ne anlama gelir?',
     a='<p>Bu iki ifade farklı eksenleri anlatır.</p>'
       '<p><b>Dinamik tipleme:</b> Tip, <i>değişkene</i> değil <i>nesneye</i> aittir ve çalışma anında belirlenir. Bir isim önce bir sayıyı, sonra bir string\'i gösterebilir: ' + c('x = 5; x = "beş"') + '. Derleme aşamasında tip kontrolü yapılmaz; hatalar kod çalıştığında ortaya çıkar. (Statik tipli dillere örnek: Java, Go, C#.)</p>'
       '<p><b>Güçlü tipleme:</b> Python uyumsuz tipler arasında <i>örtük dönüşüm</i> yapmaz. ' + c('"3" + 4') + ' ' + c('TypeError') + ' verir. JavaScript gibi zayıf tipli bir dilde ise ' + c('"3" + 4') + ' sessizce ' + c('"34"') + ' olur. Python\'da dönüşüm açık olmalıdır: ' + c('int("3") + 4') + '. (Küçük istisnalar sayısal yükseltmelerdir: ' + c('1 + 2.5') + ' ve ' + c('True + 1') + ' çalışır.)</p>'
       '<p><b>Ördek tiplemesi:</b> Python bir nesnenin tipine değil davranışına bakar: "ördek gibi yürüyor ve ötüyorsa ördektir". Bir fonksiyon ' + c('read()') + ' metodu olan her nesneyle çalışabilir.</p>'
       '<p><b>Pratik sonuç:</b> Esneklik ve hızlı geliştirme kazanırsın, ama tip hataları geç yakalanır. Bu açığı tip notasyonları + mypy/pyright ile kapatırız (kademeli tipleme); büyük projelerde bu artık standart bir uygulamadır.</p>',
     follow=['Ördek tiplemesini EAFP ilkesiyle nasıl ilişkilendirirsin?', 'Büyük bir projede dinamik tiplemenin risklerini nasıl azaltırsın?'],
     flags=['Dinamik ile zayıf tiplemeyi aynı şey sanmak', '"Python\'da tip yoktur" demek'],
     tip='İki ekseni (statik/dinamik, güçlü/zayıf) ayrı ayrı tanımla ve her biri için tek satırlık örnek ver.'),
]
