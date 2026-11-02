LESSON = {
'id': 'yapay-zeka-ile-kod', 'lv': 'ileri', 'mod': 'Yapay Zekâ', 'min': 70,
'title': 'Yapay zekâ asistanıyla Python yazmak',
'sum': 'Claude, ChatGPT ve Copilot gibi asistanlardan bağlamlı, örnekli ve kısıtlı istemlerle doğru kod alır; üretilen kodu testle doğrular, uydurma API, eski sözdizimi, sessiz mantık hatası ve güvenlik açıklarını yakalar; yapay zekâ çıktısını (JSON) ayrıştırıp doğrularsın.',
'goals': [
 'Bağlam, girdi-çıktı örneği, kısıt ve çıktı biçimi içeren etkili bir kodlama istemi yazabilirim.',
 'Asistanın ürettiği kodu çalıştırıp test ve kenar durumlarla doğrulayabilirim.',
 'Uydurma API, eski sürüm sözdizimi, sessiz mantık hatası ve güvenlik açığı gibi tipik yapay zekâ hatalarını bulup düzeltebilirim.',
 'Yapay zekâ yanıtındaki JSON\'u güvenle ayıklayıp şemaya göre doğrulayabilirim.',
 'Gizli bilgi, kişisel veri ve lisans konularında kurum kurallarına uygun çalışırım.'],
'body': r'''
<h2>Neden önemli?</h2>
<p>Bugün profesyonel geliştiricilerin büyük kısmı günlük işinde bir yapay zekâ asistanı kullanıyor: sohbet arayüzünde Claude ya da ChatGPT, editörün içinde GitHub Copilot ya da Cursor, terminalde Claude Code gibi ajanlar. Bu araçlar iskelet kodu, test, belge ve yeniden düzenlemeyi dakikalara indirir. Ama asistan <b>emin görünen bir dille yanılabilir</b>: var olmayan bir fonksiyonu çağırabilir, iki yıl önce kaldırılmış bir API kullanabilir, testsiz bırakıldığında yalnızca "mutlu yol"u çalıştıran kod yazabilir. Bu derste asistanı hızlandırıcı olarak kullanmayı, ama son sözü her zaman <b>testlere ve senin muhakemene</b> bırakmayı öğreneceksin. LLM API dersinde modeli kendi kodundan çağırmayı görüyorsun; burada asistanı bir çalışma arkadaşı olarak kullanmaya odaklanıyoruz.</p>

<div class="tbl-wrap"><table>
<tr><th>Araç türü</th><th>Örnek</th><th>En iyi olduğu iş</th><th>Dikkat</th></tr>
<tr><td>Sohbet asistanı</td><td>Claude, ChatGPT, Gemini</td><td>Tasarım tartışması, açıklama, fonksiyon/test yazma, hata ayıklama</td><td>Projenin tamamını görmez; bağlamı sen verirsin</td></tr>
<tr><td>Editör içi tamamlama</td><td>GitHub Copilot, Cursor</td><td>Satır/blok tamamlama, tekrarlayan kalıplar</td><td>Hızlı kabul alışkanlığı; okumadan Tab'a basma</td></tr>
<tr><td>Kodlama ajanı</td><td>Claude Code ve benzerleri</td><td>Çok dosyalı değişiklik, test çalıştırıp düzeltme döngüsü</td><td>Değişikliği diff olarak incele, yetkileri sınırla</td></tr>
</table></div>

<h2>İyi istemin anatomisi</h2>
<p>Asistan senin projeni, veri biçimini, Python sürümünü ve kurum kurallarını bilmez. Ne kadar belirsiz sorarsan o kadar "ortalama internet kodu" alırsın. İyi bir kodlama istemi (prompt) şu parçaları içerir:</p>
<div class="tbl-wrap"><table>
<tr><th>Parça</th><th>Örnek</th></tr>
<tr><td>Rol ve bağlam</td><td>"Anadolu Market'in sipariş servisinde çalışıyorum; Python 3.12, yalnız standart kütüphane."</td></tr>
<tr><td>Görev</td><td>"Siparişleri şehre göre gruplayıp ciroyu hesaplayan fonksiyon yaz."</td></tr>
<tr><td>Girdi-çıktı örneği</td><td>"Girdi: <code>[{"sehir": "İzmir", "tutar": 100}]</code> → Çıktı: <code>{"İzmir": 100.0}</code>"</td></tr>
<tr><td>Kısıtlar</td><td>"Para için Decimal kullan, tip ipuçları ekle, harici paket yok, iptal siparişleri sayma."</td></tr>
<tr><td>Kenar durumlar</td><td>"Boş liste, eksik şehir alanı, negatif tutar ne olmalı?"</td></tr>
<tr><td>Çıktı biçimi</td><td>"Önce fonksiyonu, sonra pytest testlerini ayrı kod bloklarında ver; açıklama 3 maddeyi geçmesin."</td></tr>
</table></div>
<pre class="code">
ZAYIF:  python ile ciro hesaplama kodu yaz

GÜÇLÜ:  Python 3.12, yalnız standart kütüphane.
        Görev: sehir_ciro(siparisler: list[dict]) -> dict[str, Decimal]
        Her sipariş {"sehir": str, "tutar": str, "durum": str}; tutar metin ("149.90").
        Kurallar: durum "iptal" olanları atla; şehir yoksa "Bilinmiyor".
        Örnek: [{"sehir":"İzmir","tutar":"100.50","durum":"teslim"}] -> {"İzmir": Decimal("100.50")}
        Önce bu kurallar için 5 pytest testi yaz, sonra testleri geçen fonksiyonu yaz.
        Varsayım yapman gerekirse kodun üstünde madde olarak yaz.
</pre>
<div class="tip"><b>Adım adım iste</b>Büyük bir görevi tek istemde isteme. Önce "tasarımı madde madde öner, kod yazma" de; tasarımı onayla; sonra parça parça kodu iste. Hata aldığında tam hata mesajını ve ilgili kodu yapıştır, "neden olduğunu açıkla, sonra düzelt" de. Asistanın önce test yazmasını istemek (test-first) çoğu zaman en verimli yoldur.</div>

<h2>Doğrulama döngüsü: güven ama test et</h2>
<p>Asistanın kodunu üç adımda doğrularsın: <b>oku</b> (anlamadığın satırı kabul etme), <b>çalıştır</b> (gerçek örnekle), <b>test et</b> (kenar durumlarla). Aşağıda bir asistanın yazdığı, ilk bakışta doğru görünen bir fonksiyon var; küçük bir test kümesi hatayı hemen ortaya çıkarıyor.</p>
<pre class="py">
def ortalama_sepet(tutarlar):
    """Yapay zekâ çıktısı: sepet tutarlarının ortalaması."""
    return sum(tutarlar) / len(tutarlar)

denemeler = [[100, 200, 300], [49.9], []]
for girdi in denemeler:
    try:
        print(girdi, "->", ortalama_sepet(girdi))
    except Exception as e:
        print(girdi, "-> HATA:", type(e).__name__, e)
</pre>
<p>Boş liste, "mutlu yol" testinde hiç akla gelmeyen ama üretimde ilk gün karşına çıkacak durumdur. Asistana "bu fonksiyonun kenar durumlarını listele ve her biri için test yaz" demek, en ucuz kalite yatırımıdır. Testleri sen de okumalısın: asistan bazen yanlış kodu "doğrulayan" yanlış test yazar.</p>

<h2>Yapay zekânın tipik hataları</h2>
<div class="tbl-wrap"><table>
<tr><th>Hata türü</th><th>Örnek</th><th>Nasıl yakalarsın?</th></tr>
<tr><td>Uydurma API (halüsinasyon)</td><td><code>liste.push(x)</code>, <code>metin.contains("a")</code>, <code>math.clamp</code></td><td>Çalıştır; resmi belgeye bak; <code>hasattr</code>/<code>help()</code></td></tr>
<tr><td>Eski sürüm kodu</td><td><code>from collections import Mapping</code> (3.10'da kaldırıldı), pandas <code>df.append</code> (2.0'da kaldırıldı)</td><td>Sürümünü istemde belirt; uyarıları (DeprecationWarning) oku</td></tr>
<tr><td>Sessiz mantık hatası</td><td>Değiştirilebilir varsayılan argüman, sayfalamada bir eksik/fazla, metin olarak sayı sıralama, float ile para</td><td>Kenar durum testleri, özellik (property) testleri</td></tr>
<tr><td>Güvenlik açığı</td><td>f-string ile SQL, <code>eval</code>, <code>shell=True</code>, <code>random</code> ile token</td><td>Web güvenliği kontrol listesi, bandit</td></tr>
<tr><td>Aşırı geniş hata yakalama</td><td><code>except Exception: return None</code></td><td>Hangi hatanın neden yakalandığını sor</td></tr>
<tr><td>Gereksiz bağımlılık / karmaşıklık</td><td>Tek satırlık iş için paket önermek</td><td>"Yalnız standart kütüphane" kısıtı</td></tr>
</table></div>
<p>Uydurma API şüphesinde kendi ortamında hızlıca kontrol et:</p>
<pre class="py">
import builtins, importlib

def api_var_mi(yol: str) -> bool:
    modul_adi, *oznitelikler = yol.split(".")
    try:
        nesne = importlib.import_module(modul_adi)
    except ImportError:
        if not hasattr(builtins, modul_adi):
            return False
        nesne = getattr(builtins, modul_adi)
    for ad in oznitelikler:
        if not hasattr(nesne, ad):
            return False
        nesne = getattr(nesne, ad)
    return True

for yol in ["str.removeprefix", "str.contains", "list.push", "math.isclose", "math.clamp", "json.loads"]:
    print(f"{yol:18} {api_var_mi(yol)}")
</pre>

<h2>Kod inceleme kontrol listesi</h2>
<div class="steps-list"><ol>
<li><b>Anlıyor muyum?</b> Her satırı açıklayabiliyor musun? Açıklayamıyorsan asistana sor ya da yeniden yazdır.</li>
<li><b>Çalışıyor mu?</b> Gerçek bir örnekle çalıştır; hatasız çalışması doğru olduğu anlamına gelmez.</li>
<li><b>Testi var mı?</b> Mutlu yol + boş girdi + sınır değerler + hatalı girdi.</li>
<li><b>API gerçek mi, güncel mi?</b> Kullandığın Python ve paket sürümüyle uyumlu mu?</li>
<li><b>Güvenli mi?</b> SQL parametreli mi, kullanıcı girdisi doğrulanıyor mu, gizli bilgi koda gömülü mü?</li>
<li><b>Projeye uyuyor mu?</b> Adlandırma, hata yönetimi, loglama ve klasör yapısı ekip standardına uygun mu?</li>
<li><b>Lisans sorunu var mı?</b> Uzun, tanıdık görünen bir blok bilinen bir projeden kopya olabilir.</li>
</ol></div>

<h2>Yeniden düzenleme ve belge yazdırma</h2>
<p>Asistanlar çalışan ama dağınık kodu toparlamada çok iyidir: "davranışı değiştirmeden fonksiyonu küçük parçalara böl, tip ipuçları ve docstring ekle" de. Kural: <b>önce test, sonra yeniden düzenleme</b>. Testler, asistanın davranışı sessizce değiştirmediğini kanıtlar. Docstring'e örnek koyarsan <code>doctest</code> ile belge de test olur:</p>
<pre class="py">
import doctest
from decimal import Decimal

def kdv_ekle(tutar: Decimal, oran: Decimal = Decimal("0.20")) -> Decimal:
    """Tutara KDV ekler ve kuruşa yuvarlar.

    >>> kdv_ekle(Decimal("100"))
    Decimal('120.00')
    >>> kdv_ekle(Decimal("49.90"), Decimal("0.10"))
    Decimal('54.89')
    """
    return (tutar * (1 + oran)).quantize(Decimal("0.01"))

runner = doctest.DocTestRunner()
for test in doctest.DocTestFinder().find(kdv_ekle, "kdv_ekle", globs={"Decimal": Decimal, "kdv_ekle": kdv_ekle}):
    runner.run(test)
print("doctest:", runner.tries, "örnek,", runner.failures, "hata")
</pre>

<h2>Yapay zekâ çıktısını programla işlemek</h2>
<p>Asistanı bir boru hattında kullandığında (ör. müşteri yorumlarını sınıflandırma) yanıtı insan değil kod okur. Modelden JSON iste, ama gelen metnin her zaman temiz JSON olacağını varsayma: başında açıklama cümlesi, etrafında üç ters tırnaklı kod çiti, sonunda fazladan virgül olabilir. Önce ayıkla, sonra <code>json.loads</code>, sonra şemaya göre doğrula; doğrulama başarısızsa hatayı modele geri gönderip yeniden dene.</p>
<pre class="py">
import json, re

CIT = chr(96) * 3   # üç ters tırnak
yanit = ("Tabii, sonuç aşağıda:\n" + CIT + "json\n"
         '{"yorum_id": 17, "duygu": "olumsuz", "konu": "kargo", "guven": 0.92}\n' + CIT)

eslesme = re.search(CIT + r"(?:json)?\s*(\{.*?\})\s*" + CIT, yanit, re.S)
veri = json.loads(eslesme.group(1) if eslesme else yanit)

hatalar = []
if veri.get("duygu") not in {"olumlu", "olumsuz", "notr"}:
    hatalar.append("duygu geçersiz")
if not (isinstance(veri.get("guven"), (int, float)) and 0 <= veri["guven"] <= 1):
    hatalar.append("guven 0-1 aralığında olmalı")
print(veri)
print("hatalar:", hatalar)
</pre>
<p>Pydantic dersinde gördüğün modellerle bu doğrulamayı tek satıra indirebilirsin; birçok LLM API'si de "yapılandırılmış çıktı" (structured output) ya da araç çağrısı (tool use) özelliğiyle şemaya uyan JSON üretmeyi destekler.</p>

<h2>Gizli bilgi, kişisel veri ve lisans</h2>
<div class="warn"><b>Asistana yapıştırmadan önce düşün</b>API anahtarı, veritabanı parolası, müşteri adı, TC kimlik numarası, kart bilgisi, iç sunucu adresleri asla istem içine girmez. Kurumunun onaylı (kurumsal sözleşmeli, veriyi eğitimde kullanmayan) aracını kullan; hata ayıklama için gerçek veri yerine maskelenmiş ya da sahte örnek ver. Yanlışlıkla bir anahtar paylaştıysan anahtarı hemen iptal edip yenile.</div>
<p>Lisans ve telif tarafında: üretilen kod bazen açık kaynak bir projeden neredeyse birebir parça içerebilir; GPL gibi "copyleft" lisanslı kod, kapalı kaynak ürününe girerse hukuki risk doğurur. Uzun, özgün görünen blokları kaynak aramasıyla kontrol et, editör araçlarının "kamuya açık kodla eşleşmeyi engelle" ayarlarını aç ve kurumunun yapay zekâ kullanım politikasına uy. Yazdığın koddan, kim üretmiş olursa olsun, <b>sen sorumlusun</b>.</p>

<div class="note"><b>Gerçek işte</b>Ekiplerde yapay zekâ ile yazılmış kod, diğer kodlarla aynı kod incelemesinden geçer; "yapay zekâ yazdı" bir mazeret değildir. Verimli ekipler asistanı en çok test yazdırma, eski kodu anlama ("bu modül ne yapıyor, akışı madde madde anlat"), hata mesajı yorumlama, belge ve commit mesajı taslağı için kullanır. Mülakatlarda da artık "asistanın önerdiği bu kodda ne yanlış?" türü sorular soruluyor: bu dersteki Hata avı alıştırmaları tam olarak bu beceriyi çalıştırıyor.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Projeye kalıcı bağlam ver</h3>
<p>Kodlama ajanları proje kökündeki talimat dosyalarını (ör. Claude Code için <code>CLAUDE.md</code>) okuyabilir: Python sürümü, test komutu, kod stili, yasaklı kalıplar, klasör yapısı. Her istemde aynı bağlamı tekrar yazmak yerine bir kez yazarsın. Ajanın çalıştırabileceği komutları ve erişebileceği dosyaları sınırla; değişikliği her zaman diff olarak incele.</p>
<h3>Testi sözleşme olarak kullan</h3>
<p>Önce kendi yazdığın (ya da okuyup onayladığın) testler, sonra "bu testleri geçen kodu yaz" istemi: buna yapay zekâ ile TDD diyebilirsin. Testler sözleşmedir; asistan kodu değiştirdikçe testler korur. Testin de yanlış olabileceğini unutma: bilerek hatalı bir sürüme karşı testi çalıştırıp başarısız olduğunu görmek (mutasyon testi fikri), testin işe yaradığını kanıtlar.</p>
<h3>Değerlendirme (eval) kümesi</h3>
<p>Yapay zekâyı bir ürün özelliğinde (ör. yorum sınıflandırma) kullanıyorsan, beklenen çıktısı bilinen 50-200 örneklik bir değerlendirme kümesi kur; istem ya da model değiştiğinde doğruluğu yeniden ölç. Sezgiyle "daha iyi oldu" demek yerine sayıyla karar verirsin.</p>
</section>
''',
'ex': [
 {'t': 'mc', 'stage': 'Isınma',
  'q': 'Asistandan bir fonksiyon isteyeceksin. Hangi istem en iyi sonucu verir?',
  'o': ['"Python ile tarih işleyen, hızlı ve kullanışlı bir fonksiyon yaz; ne gerektiğini sen düşün."', '"Python 3.12, stdlib. is_gunu_ekle(tarih, n): hafta sonunu atla. Örnek: Cuma + 1 → Pazartesi. Önce testler."', '"Dünyanın en iyi ve en hızlı tarih fonksiyonunu yaz, kesinlikle hata yapma, testlere gerek yok."', '"Bir tarih fonksiyonu lazım; iş günleriyle ilgili, sen ne uygun görürsen onu yap."'], 'a': 1,
  'why': 'İyi istem sürümü, kısıtı, fonksiyon imzasını, kuralı, somut girdi-çıktı örneğini ve çıktı biçimini (önce testler) içerir. "Hata yapma" gibi ifadeler bilgi taşımaz; belirsiz istem ortalama ve varsayımlarla dolu kod getirir.'},
 {'t': 'mc', 'stage': 'Isınma',
  'q': 'Asistan 40 satırlık bir fonksiyon üretti ve "test edildi, çalışıyor" dedi. İlk yapman gereken nedir?',
  'o': ['Kodu doğrudan ana dala gönderip ekibin geri bildirimini beklemek', 'Asistana "emin misin?" diye sorup ikinci bir onay almak ve öyle devam etmek', 'Kodu okuyup gerçek örnek ve kenar durum testleriyle kendi ortamında çalıştırmak', 'Kodu daha kısa ve okunur yazması için asistandan tekrar istemek'], 'a': 2,
  'why': 'Asistan kodu gerçekte çalıştırmamış olabilir; "test edildi" ifadesi kanıt değildir. "Emin misin?" sorusu da yeni bir tahmin üretir. Kanıt, senin ortamında çalışan testlerdir.'},
 {'t': 'mc', 'stage': 'Isınma',
  'q': 'Üretim hatasını ayıklamak için asistana ne yapıştırmak <b>uygun değildir</b>?',
  'o': ['Hatanın tam yığın izi (traceback) ve hata mesajının kendisi', 'Gerçek müşteri kayıtları ve .env dosyasındaki veritabanı parolası', 'Hatanın oluştuğu fonksiyonun kodu ve çağrıldığı yer', 'Maskelenmiş, uydurma değerlerle hazırlanmış bir örnek girdi'], 'a': 1,
  'why': 'Kişisel veri (KVKK) ve gizli bilgiler istem içine girmez. Yığın izi, ilgili kod ve sahte/maskeli örnek, hatayı çözmek için çoğu zaman yeterlidir.'},
 {'t': 'predict', 'stage': 'Kodu oku',
  'q': 'Asistanın yazdığı bu sepet fonksiyonu ne yazdırır?',
  'code': r'''def sepete_ekle(urun, sepet=[]):
    sepet.append(urun)
    return sepet

ayse = sepete_ekle("çay")
can = sepete_ekle("kahve")
print(ayse, can)
''',
  'o': ["['çay'] ['kahve']", "['çay', 'kahve'] ['çay', 'kahve']", "['çay'] ['çay', 'kahve']", 'TypeError'], 'a': 1,
  'why': 'Varsayılan liste fonksiyon tanımlanırken bir kez oluşturulur ve tüm çağrılar onu paylaşır. ayse ve can aynı listeyi gösterir; iki müşterinin sepeti birbirine karışır. Yapay zekâ kodunda sık görülen sessiz bir hatadır.'},
 {'t': 'predict', 'stage': 'Kodu oku',
  'q': 'Asistan tutarları "büyükten küçüğe" sıraladığını söylüyor. Gerçekte ne yazdırır?',
  'code': r'''tutarlar = ["950", "1200", "85", "300"]
print(sorted(tutarlar, reverse=True))
''',
  'o': ["['1200', '950', '300', '85']", "['950', '85', '300', '1200']", "['85', '300', '950', '1200']", "['950', '300', '85', '1200']"], 'a': 1,
  'why': 'Metinler sözlük sırasıyla karşılaştırılır: önce ilk karakter. "9" > "8" > "3" > "1" olduğu için 1200 en sona düşer. Doğrusu sorted(tutarlar, key=float, reverse=True) ya da veriyi baştan sayıya çevirmektir. Kod hata vermez, yalnızca yanlış sonuç üretir.'},
 {'t': 'order', 'stage': 'Kodu oku',
  'q': '<p>Yapay zekâ yanıtındaki JSON\'u kod çitinden ayıklayıp doğrulayan programın satırlarını sırala.</p>',
  'lines': ['import json, re', 'cit = chr(96) * 3', 'yanit = "Sonuç:\\n" + cit + "json\\n{\\"duygu\\": \\"olumlu\\"}\\n" + cit', 'm = re.search(cit + r"(?:json)?\\s*(\\{.*\\})\\s*" + cit, yanit, re.S)', 'veri = json.loads(m.group(1))', 'print(veri["duygu"] in {"olumlu", "olumsuz", "notr"})'],
  'expect': 'True\n',
  'hint': 'Çit karakteri yanıttan önce, yanıt aramadan önce, arama sonucu ayrıştırmadan önce gelir.',
  'why': 'Akış her zaman aynıdır: ham metni al, JSON bölümünü ayıkla, ayrıştır, sonra değerleri izin verilen kümeye göre doğrula.'},
 {'id': 'yapay-zeka-ile-kod-1', 't': 'code', 'stage': 'Rehberli', 'diff': 2,
  'q': '<p>Asistan aşağıdaki işi yapan bir fonksiyon yazdı; senin görevin onu <b>sınayacak testleri</b> yazmak. <code>indirimli_fiyat(fiyat, oran)</code>: <code>oran</code> 0 ile 1 arasında olmalı (değilse <code>ValueError</code>), fiyat negatifse <code>ValueError</code>, sonuç 2 ondalığa yuvarlanır.</p><p><code>testleri_calistir(f)</code> fonksiyonunu yaz: verilen <code>f</code> fonksiyonunu <code>assert</code>\'lerle sınasın. Doğru bir uygulamada sessizce bitmeli, hatalı bir uygulamada <code>AssertionError</code> fırlatmalı. Kontrol sisteminde senin testlerin doğru uygulamaya ve <b>dört farklı hatalı uygulamaya</b> karşı çalıştırılacak; hepsini yakalamalısın.</p>',
  'guide': ['Normal durum: indirimli_fiyat(200, 0.25) == 150.0 gibi bir assert yaz.', 'Yuvarlama: sonucu 2 ondalık olmayan bir örnek seç (ör. 99.99 ve 0.15).', 'Sınırlar: oran 0 ve 1 geçerli mi?', 'Hatalı girdiler: oran 1.5, oran -0.1, fiyat -5 için ValueError beklendiğini try/except ile doğrula.', 'ValueError gelmezse assert False ile testi düşür.'],
  'example': 'def test_kare(f):\n    assert f(3) == 9\n    try:\n        f("a")\n        assert False, "TypeError bekleniyordu"\n    except TypeError:\n        pass\n\ntest_kare(lambda x: x * x)\nprint("testler geçti")\n',
  'start': r'''def testleri_calistir(f):
    assert f(200, 0.25) == 150.0, "200 TL %25 indirimle 150 olmalı"
    # TODO: yuvarlama, sınır değerler (0 ve 1) ve hatalı girdiler için testler ekle
''',
  'sol': r'''def testleri_calistir(f):
    assert f(200, 0.25) == 150.0, "200 TL %25 indirimle 150 olmalı"
    assert f(99.99, 0.15) == 84.99, "sonuç 2 ondalığa yuvarlanmalı"
    assert f(100, 0) == 100 and f(100, 1) == 0, "0 ve 1 geçerli sınırlar"
    for fiyat, oran in [(100, 1.5), (100, -0.1), (-5, 0.1)]:
        try:
            f(fiyat, oran)
        except ValueError:
            continue
        assert False, f"{fiyat}, {oran} için ValueError bekleniyordu"
''',
  'tests': r'''def dogru(fiyat, oran):
    if not 0 <= oran <= 1 or fiyat < 0:
        raise ValueError("geçersiz")
    return round(fiyat * (1 - oran), 2)

def mutant_yuvarlamasiz(fiyat, oran):
    if not 0 <= oran <= 1 or fiyat < 0:
        raise ValueError("geçersiz")
    return fiyat * (1 - oran)

def mutant_oran_kontrolsuz(fiyat, oran):
    if fiyat < 0:
        raise ValueError("geçersiz")
    return round(fiyat * (1 - oran), 2)

def mutant_fiyat_kontrolsuz(fiyat, oran):
    if not 0 <= oran <= 1:
        raise ValueError("geçersiz")
    return round(fiyat * (1 - oran), 2)

def mutant_sinir(fiyat, oran):
    if not 0 < oran < 1 or fiyat < 0:
        raise ValueError("geçersiz")
    return round(fiyat * (1 - oran), 2)

testleri_calistir(dogru)
for m in [mutant_yuvarlamasiz, mutant_oran_kontrolsuz, mutant_fiyat_kontrolsuz, mutant_sinir]:
    try:
        testleri_calistir(m)
    except (AssertionError, ValueError):
        continue
    assert False, f"testlerin {m.__name__} adlı hatalı uygulamayı yakalamadı"
''',
  'hints': ['Her hatalı uygulama bir kuralı bozuyor: yuvarlama, oran kontrolü, fiyat kontrolü, sınır değerler.', 'ValueError beklenen durum için: try: f(...) except ValueError: pass, else dalında ya da sonrasında assert False.', 'Sınır testi: f(100, 0) == 100 ve f(100, 1) == 0 geçerli olmalı.'],
  'why': 'Testin değeri, hatalı kodu yakalayabilmesiyle ölçülür. Bilerek bozulmuş sürümlere (mutant) karşı testi çalıştırmak, asistanın kodu için yazdığın testlerin gerçekten koruma sağladığını kanıtlar.'},
 {'id': 'yapay-zeka-ile-kod-2', 't': 'code', 'stage': 'Rehberli', 'diff': 2,
  'q': '<p><code>json_ayikla(yanit)</code> fonksiyonunu yaz: bir yapay zekâ yanıt metninden JSON nesnesini (sözlük) çıkarsın.</p><ul><li>Metinde üç ters tırnaklı bir kod çiti varsa (isteğe bağlı <code>json</code> etiketiyle) çitin içini kullan.</li><li>Çit yoksa metindeki ilk <code>{</code> ile son <code>}</code> arasını kullan.</li><li>Hiçbiri yoksa ya da ayrıştırma başarısızsa <code>ValueError</code> fırlat. Sonuç sözlük değilse de <code>ValueError</code>.</li></ul>',
  'guide': ['Çit kalıbını chr(96) * 3 ile kur (ters tırnağı yazmak zorunda kalmazsın).', 're.search ile çit + (?:json)? + içerik + çit ara; re.S bayrağını unutma.', 'Bulamazsan find("{") ve rfind("}") ile aralığı al.', 'json.loads\'u try içine al; json.JSONDecodeError\'ı ValueError olarak yeniden fırlat.', 'isinstance(sonuc, dict) kontrolü yap.'],
  'example': 'import re\nmetin = "<veri>42</veri> ve <veri>7</veri>"\nm = re.search(r"<veri>(.*?)</veri>", metin)\nprint(m.group(1), metin.find("<"), metin.rfind(">"))\n',
  'start': r'''import json, re

CIT = chr(96) * 3

def json_ayikla(yanit):
    # TODO: önce kod çitini dene, sonra { ... } aralığını
    return json.loads(yanit)
''',
  'sol': r'''import json, re

CIT = chr(96) * 3

def json_ayikla(yanit):
    m = re.search(CIT + r"(?:json)?\s*(.*?)\s*" + CIT, yanit, re.S)
    if m:
        aday = m.group(1)
    else:
        bas, son = yanit.find("{"), yanit.rfind("}")
        if bas == -1 or son <= bas:
            raise ValueError("yanıtta JSON bulunamadı")
        aday = yanit[bas:son + 1]
    try:
        sonuc = json.loads(aday)
    except json.JSONDecodeError as e:
        raise ValueError(f"JSON ayrıştırılamadı: {e}") from None
    if not isinstance(sonuc, dict):
        raise ValueError("JSON nesnesi (sözlük) bekleniyordu")
    return sonuc
''',
  'tests': r'''C = chr(96) * 3
assert json_ayikla('{"a": 1}') == {"a": 1}, "düz JSON"
assert json_ayikla("Tabii! İşte sonuç:\n" + C + "json\n{\"urun\": \"çay\", \"adet\": 2}\n" + C + "\nBaşka bir şey?") == {"urun": "çay", "adet": 2}, "json etiketli kod çiti"
assert json_ayikla(C + "\n{\"x\": [1, 2]}\n" + C) == {"x": [1, 2]}, "etiketsiz kod çiti"
assert json_ayikla("Sonuç şu: {\"durum\": \"ok\", \"detay\": {\"k\": 1}} umarım işe yarar") == {"durum": "ok", "detay": {"k": 1}}, "çitsiz metinde ilk { ile son } arası (iç içe nesne dahil)"
for kotu in ["JSON yok burada", "{bozuk: json,}", C + "json\n[1, 2, 3]\n" + C, ""]:
    try:
        json_ayikla(kotu)
        assert False, f"{kotu!r} için ValueError bekleniyordu"
    except ValueError:
        pass
''',
  'hints': ['Kalıp: CIT + r"(?:json)?\\s*(.*?)\\s*" + CIT, bayrak re.S (nokta satır sonunu da eşlesin).', 'json.JSONDecodeError zaten ValueError\'ın alt sınıfıdır ama mesajı netleştirmek için yeniden fırlatmak iyi bir alışkanlıktır.', 'Liste gelirse isinstance(sonuc, dict) False olur: ValueError.'],
  'why': 'Model yanıtı insan için yazılmış metindir; programın onu güvenle kullanması için önce yapılandırılmış kısmı ayıklaman, sonra türünü doğrulaman gerekir. Her başarısızlığı tek bir hata türüne (ValueError) indirgemek, çağıran kodda yeniden deneme mantığını basitleştirir.'},
 {'id': 'yapay-zeka-ile-kod-3', 't': 'code', 'stage': 'Rehberli', 'diff': 2,
  'q': '<p>Asistan Anadolu Market için ürün açıklaması ve kategori önerisi üretiyor. Gelen sözlüğü doğrulayan <code>oneri_dogrula(veri)</code> fonksiyonunu yaz; hata mesajlarının <b>listesini</b> döndürsün (geçerliyse boş liste). Kurallar:</p><ul><li><code>urun_kodu</code>: metin, <code>"U-"</code> ile başlar ve ardından yalnız rakam gelir → aksi halde <code>"urun_kodu geçersiz"</code></li><li><code>kategori</code>: <code>{"İçecek", "Mutfak", "Temizlik", "Atıştırmalık"}</code> kümesinden → aksi halde <code>"kategori geçersiz"</code></li><li><code>aciklama</code>: metin, 20-300 karakter → aksi halde <code>"aciklama uzunluğu"</code></li><li><code>etiketler</code>: en fazla 5 elemanlı metin listesi → aksi halde <code>"etiketler geçersiz"</code></li><li>Eksik alan da ilgili mesajı üretir; sıra yukarıdaki gibidir.</li></ul>',
  'guide': ['Boş bir hatalar listesi aç.', 'Her alanı veri.get ile al; eksikse None gelir ve kontrol düşer.', 'urun_kodu için isinstance + startswith + kalan kısım isdigit().', 'kategori için küme üyeliği, aciklama için isinstance + len aralığı.', 'etiketler için isinstance(list), uzunluk ve all(isinstance(e, str) ...).'],
  'example': 'veri = {"kod": "A-12"}\nk = veri.get("kod")\nprint(isinstance(k, str) and k.startswith("A-") and k[2:].isdigit())\nprint(veri.get("yok"))\n',
  'start': r'''KATEGORILER = {"İçecek", "Mutfak", "Temizlik", "Atıştırmalık"}

def oneri_dogrula(veri):
    hatalar = []
    # TODO: dört alanı sırayla kontrol et
    return hatalar
''',
  'sol': r'''KATEGORILER = {"İçecek", "Mutfak", "Temizlik", "Atıştırmalık"}

def oneri_dogrula(veri):
    hatalar = []
    kod = veri.get("urun_kodu")
    if not (isinstance(kod, str) and kod.startswith("U-") and kod[2:].isdigit()):
        hatalar.append("urun_kodu geçersiz")
    if veri.get("kategori") not in KATEGORILER:
        hatalar.append("kategori geçersiz")
    ac = veri.get("aciklama")
    if not (isinstance(ac, str) and 20 <= len(ac) <= 300):
        hatalar.append("aciklama uzunluğu")
    et = veri.get("etiketler")
    if not (isinstance(et, list) and len(et) <= 5 and all(isinstance(e, str) for e in et)):
        hatalar.append("etiketler geçersiz")
    return hatalar
''',
  'tests': r'''iyi = {"urun_kodu": "U-104", "kategori": "İçecek", "aciklama": "Rize yaylalarından taze demlik çay.", "etiketler": ["çay", "yerli"]}
assert oneri_dogrula(iyi) == [], f"geçerli öneri boş liste döndürmeli; gelen {oneri_dogrula(iyi)}"
kotu = {"urun_kodu": "U-1a", "kategori": "Elektronik", "aciklama": "Kısa", "etiketler": ["a", "b", "c", "d", "e", "f"]}
assert oneri_dogrula(kotu) == ["urun_kodu geçersiz", "kategori geçersiz", "aciklama uzunluğu", "etiketler geçersiz"], "dört hata sırayla raporlanmalı"
assert oneri_dogrula({}) == ["urun_kodu geçersiz", "kategori geçersiz", "aciklama uzunluğu", "etiketler geçersiz"], "eksik alanlar da hata olmalı"
assert oneri_dogrula(dict(iyi, urun_kodu="U-")) == ["urun_kodu geçersiz"], "U- sonrasında en az bir rakam olmalı"
assert oneri_dogrula(dict(iyi, etiketler=["çay", 5])) == ["etiketler geçersiz"], "etiketler yalnız metin olmalı"
assert oneri_dogrula(dict(iyi, etiketler="çay")) == ["etiketler geçersiz"], "etiketler liste olmalı, metin değil"
''',
  'hints': ['"".isdigit() False döndürür; bu yüzden "U-" tek başına geçersiz olur.', 'Eksik alan için veri.get(...) None verir; isinstance(None, str) False\'tur.', 'all(isinstance(e, str) for e in et)'],
  'why': 'Model çıktısı, kullanıcı girdisi gibi güvenilmeyen veridir. Alan alan, tür ve aralık kontrolüyle doğrulamak; tüm hataları toplayıp döndürmek, yeniden deneme isteminde modele "şu alanları düzelt" diyebilmeni sağlar.'},
 {'id': 'yapay-zeka-ile-kod-4', 't': 'code', 'stage': 'Kendin yaz', 'diff': 1,
  'q': '<p>Ekip için standart bir kodlama istemi şablonu üret. <code>istem_olustur(gorev, baglam, ornekler, kisitlar)</code> fonksiyonunu yaz: <code>ornekler</code> <code>(girdi, cikti)</code> demetlerinin listesi, <code>kisitlar</code> metin listesidir. Çıktı tam olarak şu biçimde olsun (bölümler arasında bir boş satır):</p><pre class="out">## Bağlam\n{baglam}\n\n## Görev\n{gorev}\n\n## Örnekler\n- Girdi: {girdi} → Çıktı: {cikti}\n\n## Kısıtlar\n1. {kisit}\n\n## Çıktı biçimi\nÖnce testleri, sonra kodu ayrı kod bloklarında ver.</pre><p>Örnek ya da kısıt listesi boşsa o bölüm hiç yazılmasın. <code>girdi</code> ve <code>cikti</code> <code>repr()</code> ile yazılsın.</p>',
  'start': 'def istem_olustur(gorev, baglam, ornekler, kisitlar):\n    pass\n',
  'sol': r'''def istem_olustur(gorev, baglam, ornekler, kisitlar):
    bolumler = [f"## Bağlam\n{baglam}", f"## Görev\n{gorev}"]
    if ornekler:
        satirlar = [f"- Girdi: {g!r} → Çıktı: {c!r}" for g, c in ornekler]
        bolumler.append("## Örnekler\n" + "\n".join(satirlar))
    if kisitlar:
        satirlar = [f"{i}. {k}" for i, k in enumerate(kisitlar, 1)]
        bolumler.append("## Kısıtlar\n" + "\n".join(satirlar))
    bolumler.append("## Çıktı biçimi\nÖnce testleri, sonra kodu ayrı kod bloklarında ver.")
    return "\n\n".join(bolumler)
''',
  'tests': r'''s = istem_olustur("sehir_ciro fonksiyonunu yaz.", "Python 3.12, Anadolu Market sipariş servisi.",
                  [([{"sehir": "İzmir", "tutar": 100}], {"İzmir": 100})], ["Yalnız standart kütüphane", "Tip ipuçları ekle"])
beklenen = """## Bağlam
Python 3.12, Anadolu Market sipariş servisi.

## Görev
sehir_ciro fonksiyonunu yaz.

## Örnekler
- Girdi: [{'sehir': 'İzmir', 'tutar': 100}] → Çıktı: {'İzmir': 100}

## Kısıtlar
1. Yalnız standart kütüphane
2. Tip ipuçları ekle

## Çıktı biçimi
Önce testleri, sonra kodu ayrı kod bloklarında ver."""
assert s == beklenen, f"istem biçimi beklenenden farklı:\n{s}"
k = istem_olustur("G", "B", [], [])
assert k == "## Bağlam\nB\n\n## Görev\nG\n\n## Çıktı biçimi\nÖnce testleri, sonra kodu ayrı kod bloklarında ver.", "boş örnek ve kısıt bölümleri yazılmamalı"
assert "- Girdi: 'abc' → Çıktı: 3" in istem_olustur("G", "B", [("abc", 3)], []), "girdi ve çıktı repr ile yazılmalı"
''',
  'hints': ['Bölümleri bir listede topla, en sonda "\\n\\n".join ile birleştir; boş bölüm eklemezsen boş satır sorunu kalmaz.', 'enumerate(kisitlar, 1) numaralandırmayı 1\'den başlatır; f"{g!r}" repr verir.'],
  'why': 'Ekipçe aynı istem şablonunu kullanmak, asistandan alınan kodun kalitesini kişiden bağımsız kılar: bağlam, örnek ve kısıt hiçbir zaman unutulmaz.'},
 {'id': 'yapay-zeka-ile-kod-5', 't': 'code', 'stage': 'Kendin yaz', 'diff': 2,
  'q': '<p>Asistanın önerdiği API\'lerin gerçekten var olup olmadığını kontrol eden <code>uydurma_apiler(yollar)</code> fonksiyonunu yaz. Her yol <code>"modul.ad.ad"</code> biçimindedir; ilk parça ya bir modül (<code>json</code>, <code>math</code>, <code>os.path</code> gibi alt modüller dahil) ya da yerleşik bir ad (<code>str</code>, <code>list</code>, <code>dict</code>) olabilir. Var olmayan (içe aktarılamayan ya da özniteliği bulunmayan) yolların listesini <b>girdi sırasıyla</b> döndürsün.</p>',
  'start': 'import importlib, builtins\n\ndef uydurma_apiler(yollar):\n    pass\n',
  'sol': r'''import importlib, builtins

def _coz(yol):
    parcalar = yol.split(".")
    nesne, kalan = None, []
    for i in range(len(parcalar), 0, -1):
        try:
            nesne = importlib.import_module(".".join(parcalar[:i]))
            kalan = parcalar[i:]
            break
        except ImportError:
            continue
    if nesne is None:
        if not hasattr(builtins, parcalar[0]):
            return False
        nesne, kalan = getattr(builtins, parcalar[0]), parcalar[1:]
    for ad in kalan:
        if not hasattr(nesne, ad):
            return False
        nesne = getattr(nesne, ad)
    return True

def uydurma_apiler(yollar):
    return [y for y in yollar if not _coz(y)]
''',
  'tests': r'''oneriler = ["str.removeprefix", "str.contains", "list.push", "json.loads", "math.clamp",
            "os.path.join", "dict.has_key", "collections.Counter.most_common", "statistics.median", "itertools.batched_list", "jsonx.loads"]
assert uydurma_apiler(oneriler) == ["str.contains", "list.push", "math.clamp", "dict.has_key", "itertools.batched_list", "jsonx.loads"], f"uydurma API listesi hatalı: {uydurma_apiler(oneriler)}"
assert uydurma_apiler(["math.pi", "datetime.date.today"]) == [], "gerçek API\'ler listelenmemeli"
assert uydurma_apiler([]) == [], "boş liste"
''',
  'hints': ['importlib.import_module("os.path") alt modülü de içe aktarır; en uzun içe aktarılabilir öneki bul.', 'Modül değilse builtins modülünde ara: hasattr(builtins, "str").', 'Kalan parçalarda hasattr/getattr ile ilerle; biri yoksa False.'],
  'why': 'Uydurma API, yapay zekâ kodunun en kolay yakalanan ama en sık görülen hatasıdır: başka dillerden (push, contains) ya da eski sürümlerden (has_key) gelen adlar. Çalıştırmadan önce bile otomatik kontrol edilebilir.'},
 {'id': 'yapay-zeka-ile-kod-6', 't': 'code', 'stage': 'Kendin yaz', 'diff': 2,
  'q': '<p>Asistanın yazdığı bir fonksiyonu kenar durumlarla sınayan küçük bir araç yaz: <code>kenar_raporu(f, girdiler)</code>. Her girdi bir argüman demetidir; <code>f(*girdi)</code> çağrılır. Fonksiyon bir sözlük döndürsün: <code>{"basarili": n, "hatalar": [(girdi, "HataAdı"), ...]}</code>. Hatalar girdi sırasıyla listelensin. <code>KeyboardInterrupt</code> gibi <code>Exception</code> dışı istisnalar yakalanmasın.</p>',
  'start': 'def kenar_raporu(f, girdiler):\n    pass\n',
  'sol': r'''def kenar_raporu(f, girdiler):
    basarili, hatalar = 0, []
    for girdi in girdiler:
        try:
            f(*girdi)
            basarili += 1
        except Exception as e:
            hatalar.append((girdi, type(e).__name__))
    return {"basarili": basarili, "hatalar": hatalar}
''',
  'tests': r'''def ortalama(liste):
    return sum(liste) / len(liste)
r = kenar_raporu(ortalama, [([1, 2, 3],), ([],), (None,), (["a"],), ([2.5],)])
assert r == {"basarili": 2, "hatalar": [(([],), "ZeroDivisionError"), ((None,), "TypeError"), ((["a"],), "TypeError")]}, f"rapor hatalı: {r}"
def boluk(a, b):
    return a // b
assert kenar_raporu(boluk, [(7, 2), (1, 0)]) == {"basarili": 1, "hatalar": [((1, 0), "ZeroDivisionError")]}, "çok argümanlı girdiler f(*girdi) ile çağrılmalı"
def kes():
    raise KeyboardInterrupt
try:
    kenar_raporu(kes, [()])
    assert False, "KeyboardInterrupt yakalanmamalı (except Exception kullan)"
except KeyboardInterrupt:
    pass
''',
  'hints': ['except Exception as e: BaseException\'dan türeyen KeyboardInterrupt/SystemExit\'i yakalamaz.', 'Hata adı: type(e).__name__'],
  'why': 'Boş liste, None, yanlış tür ve sıfır gibi girdiler, asistanın "mutlu yol" kodunu en hızlı kıran durumlardır. Bu tür küçük bir koşucu, asistana "şu girdilerde patlıyor, düzelt" diye somut geri bildirim vermeni sağlar.'},
 {'id': 'yapay-zeka-ile-kod-7', 't': 'code', 'stage': 'Hata avı', 'kind': 'bug', 'diff': 1,
  'q': '<p>Hatayı bul ve düzelt. Asistanın yazdığı <code>sepete_ekle(urun, adet, sepet=...)</code> fonksiyonu tek müşteriyle denendiğinde çalışıyor; ama canlıda farklı müşterilerin sepetleri birbirine karışıyor. Sepet verilmezse her çağrıda <b>yeni</b> bir sözlük kullanılmalı.</p>',
  'start': r'''def sepete_ekle(urun, adet, sepet={}):
    sepet[urun] = sepet.get(urun, 0) + adet
    return sepet
''',
  'sol': r'''def sepete_ekle(urun, adet, sepet=None):
    if sepet is None:
        sepet = {}
    sepet[urun] = sepet.get(urun, 0) + adet
    return sepet
''',
  'tests': r'''a = sepete_ekle("çay", 2)
b = sepete_ekle("kahve", 1)
assert a == {"çay": 2}, f"ilk müşterinin sepeti yalnız çay içermeli; gelen {a}"
assert b == {"kahve": 1}, f"ikinci müşterinin sepeti bağımsız olmalı; gelen {b}"
s = {"şeker": 1}
assert sepete_ekle("şeker", 2, s) == {"şeker": 3} and s == {"şeker": 3}, "verilen sepet güncellenmeli"
''',
  'hints': ['Varsayılan değerler fonksiyon tanımlanırken bir kez oluşturulur.', 'Kalıp: sepet=None ve fonksiyonun içinde if sepet is None: sepet = {}'],
  'why': 'Değiştirilebilir varsayılan argüman Python\'un klasik tuzağıdır ve asistanlar da sık üretir. None nöbetçisi her çağrıda yeni nesne oluşturur.'},
 {'id': 'yapay-zeka-ile-kod-8', 't': 'code', 'stage': 'Hata avı', 'kind': 'bug', 'diff': 2,
  'q': '<p>Hatayı bul ve düzelt. Asistanın yazdığı <code>sayfala(kayitlar, sayfa, boyut)</code> fonksiyonu 1\'den başlayan sayfa numarasıyla ilgili sayfanın kayıtlarını döndürmeli. Ürün listesi ekranında ilk ürün hiç görünmüyor ve sayfalar arasında bir ürün kayboluyor. Ayrıca <code>sayfa &lt; 1</code> ya da <code>boyut &lt; 1</code> için <code>ValueError</code> fırlatmalı.</p>',
  'start': r'''def sayfala(kayitlar, sayfa, boyut):
    bas = sayfa * boyut
    son = bas + boyut - 1
    return kayitlar[bas + 1:son + 1]
''',
  'sol': r'''def sayfala(kayitlar, sayfa, boyut):
    if sayfa < 1 or boyut < 1:
        raise ValueError("sayfa ve boyut 1 ya da büyük olmalı")
    bas = (sayfa - 1) * boyut
    return kayitlar[bas:bas + boyut]
''',
  'tests': r'''urunler = list(range(1, 11))
assert sayfala(urunler, 1, 3) == [1, 2, 3], f"1. sayfa ilk üç ürün olmalı; gelen {sayfala(urunler, 1, 3)}"
assert sayfala(urunler, 2, 3) == [4, 5, 6], "2. sayfa"
assert sayfala(urunler, 4, 3) == [10], "son sayfa eksik olabilir"
assert sayfala(urunler, 5, 3) == [], "aralık dışı sayfa boş liste"
assert sum((sayfala(urunler, s, 4) for s in range(1, 4)), []) == urunler, "tüm sayfalar birleşince hiçbir ürün kaybolmamalı"
for s, b in [(0, 3), (1, 0), (-1, 5)]:
    try:
        sayfala(urunler, s, b)
        assert False, f"sayfa={s}, boyut={b} için ValueError bekleniyordu"
    except ValueError:
        pass
''',
  'hints': ['Sayfa 1\'den başlıyorsa başlangıç indeksi (sayfa - 1) * boyut olur.', 'Python dilimi son indeksi dahil etmez: kayitlar[bas:bas + boyut]; -1 ve +1 düzeltmelerine gerek yok.'],
  'why': 'Bir eksik/bir fazla (off-by-one) hatası, 0 ve 1 tabanlı numaralandırma karışınca ortaya çıkar ve kod hata vermeden yanlış sonuç üretir. "Tüm sayfaların birleşimi orijinal liste olmalı" gibi bir özellik testi bu sınıf hatayı garanti yakalar.'},
 {'id': 'yapay-zeka-ile-kod-9', 't': 'code', 'stage': 'Hata avı', 'kind': 'bug', 'diff': 2,
  'q': '<p>Hatayı bul ve düzelt. Anadolu Bank\'ın taksit planı fonksiyonu <code>taksitlendir(tutar, ay)</code> metin olarak verilen tutarı (<code>"1000.00"</code>) eşit taksitlere bölüp <code>Decimal</code> listesi döndürmeli. Her taksit kuruşa (2 ondalık) yuvarlanmalı ve <b>taksitlerin toplamı tutara kuruşu kuruşuna eşit olmalı</b>: yuvarlama farkı son taksite eklenir. Asistanın kodu float kullanıyor ve toplam tutmuyor.</p>',
  'start': r'''from decimal import Decimal

def taksitlendir(tutar, ay):
    taksit = round(float(tutar) / ay, 2)
    return [Decimal(taksit)] * ay
''',
  'sol': r'''from decimal import Decimal, ROUND_HALF_UP

def taksitlendir(tutar, ay):
    toplam = Decimal(tutar)
    taksit = (toplam / ay).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    plan = [taksit] * (ay - 1)
    plan.append(toplam - taksit * (ay - 1))
    return plan
''',
  'tests': r'''from decimal import Decimal
p = taksitlendir("1000.00", 3)
assert p == [Decimal("333.33"), Decimal("333.33"), Decimal("333.34")], f"1000/3 planı 333.33, 333.33, 333.34 olmalı; gelen {p}"
assert sum(p) == Decimal("1000.00"), "taksitlerin toplamı tutara eşit olmalı"
p2 = taksitlendir("100.00", 6)
assert sum(p2) == Decimal("100.00") and p2[0] == Decimal("16.67") and p2[-1] == Decimal("16.65"), f"100/6 planı hatalı: {p2}"
assert taksitlendir("250.00", 1) == [Decimal("250.00")], "tek taksit tutarın kendisi"
assert all(isinstance(x, Decimal) and x.as_tuple().exponent == -2 for x in taksitlendir("99.99", 4)), "her taksit 2 ondalıklı Decimal olmalı"
''',
  'hints': ['float ikili tabanda 0.1\'i bile tam tutamaz; Decimal(float) bu hatayı Decimal\'e taşır. Decimal("1000.00") metinden kur.', 'quantize(Decimal("0.01"), rounding=ROUND_HALF_UP) ile kuruşa yuvarla; son taksit = toplam - taksit * (ay - 1).'],
  'why': 'Para hesabında float ve "eşit böl" yaklaşımı kuruş kaybettirir ya da fazladan kuruş yaratır; bankacılıkta mutabakat (toplamların tutması) zorunludur. Decimal ile yuvarla, farkı bilinçli olarak bir taksite yükle.'},
 {'id': 'yapay-zeka-ile-kod-10', 't': 'code', 'stage': 'Hata avı', 'kind': 'bug', 'diff': 1,
  'q': '<p>Hatayı bul ve düzelt. Asistan başka dillerden alışkanlıklarla <b>Python\'da olmayan</b> metotlar kullanmış. <code>etiket_raporu(urunler)</code> her ürünün etiket listesinde <code>"kampanya"</code> geçen ürünlerin adlarını bir listeye ekleyip, ürün adında <code>"çay"</code> (küçük harfle) geçenlerin sayısıyla birlikte <code>(kampanyalilar, cay_sayisi)</code> döndürmeli.</p>',
  'start': r'''def etiket_raporu(urunler):
    kampanyalilar = []
    cay_sayisi = 0
    for u in urunler:
        if u["etiketler"].includes("kampanya"):
            kampanyalilar.push(u["ad"])
        if u["ad"].lower().contains("çay"):
            cay_sayisi += 1
    return kampanyalilar, cay_sayisi
''',
  'sol': r'''def etiket_raporu(urunler):
    kampanyalilar = []
    cay_sayisi = 0
    for u in urunler:
        if "kampanya" in u["etiketler"]:
            kampanyalilar.append(u["ad"])
        if "çay" in u["ad"].lower():
            cay_sayisi += 1
    return kampanyalilar, cay_sayisi
''',
  'tests': r'''urunler = [
    {"ad": "Rize Çayı", "etiketler": ["kampanya", "yerli"]},
    {"ad": "Türk Kahvesi", "etiketler": ["yerli"]},
    {"ad": "Çay Bardağı", "etiketler": []},
    {"ad": "Filtre Kahve", "etiketler": ["kampanya"]},
]
assert etiket_raporu(urunler) == (["Rize Çayı", "Filtre Kahve"], 2), f"sonuç hatalı: {etiket_raporu(urunler)}"
assert etiket_raporu([]) == ([], 0), "boş liste"
''',
  'hints': ['includes ve contains JavaScript/Java metotlarıdır; Python\'da üyelik için in operatörü kullanılır.', 'push yerine append.'],
  'why': 'Asistanlar birçok dilde eğitildiği için diller arası "karışık" API üretebilir. Kod ilk çalıştırmada AttributeError verir; çalıştırmadan teslim edilen kod bu yüzden en sık bu tür hatayla geri döner.'},
 {'id': 'yapay-zeka-ile-kod-11', 't': 'code', 'stage': 'Hata avı', 'kind': 'bug', 'diff': 2,
  'q': '<p>Hatayı bul ve düzelt. Asistan eski bir blog yazısından öğrendiği kalıpla yazmış; Python 3.10 ve sonrasında modül yüklenirken hata veriyor. <code>derin_birlestir(a, b)</code> iki ayar sözlüğünü derinlemesine birleştirmeli: ikisinde de sözlük (eşleme) olan anahtarlar özyinelemeli birleşir, diğerlerinde <code>b</code> kazanır. Girdiler değişmemeli.</p>',
  'start': r'''from collections import Mapping

def derin_birlestir(a, b):
    sonuc = dict(a)
    for k, v in b.items():
        if k in sonuc and isinstance(sonuc[k], Mapping) and isinstance(v, Mapping):
            sonuc[k] = derin_birlestir(sonuc[k], v)
        else:
            sonuc[k] = v
    return sonuc
''',
  'sol': r'''from collections.abc import Mapping

def derin_birlestir(a, b):
    sonuc = dict(a)
    for k, v in b.items():
        if k in sonuc and isinstance(sonuc[k], Mapping) and isinstance(v, Mapping):
            sonuc[k] = derin_birlestir(sonuc[k], v)
        else:
            sonuc[k] = v
    return sonuc
''',
  'tests': r'''varsayilan = {"db": {"host": "localhost", "port": 5432}, "debug": False, "etiketler": ["a"]}
ortam = {"db": {"host": "db.anadolu.local"}, "debug": True}
s = derin_birlestir(varsayilan, ortam)
assert s == {"db": {"host": "db.anadolu.local", "port": 5432}, "debug": True, "etiketler": ["a"]}, f"derin birleştirme hatalı: {s}"
assert varsayilan["db"]["host"] == "localhost", "girdi sözlükleri değişmemeli"
assert derin_birlestir({"a": 1}, {"a": {"b": 2}}) == {"a": {"b": 2}}, "türler farklıysa b kazanır"
''',
  'hints': ['Soyut temel sınıflar (Mapping, Sequence, Iterable) Python 3.3\'ten beri collections.abc içinde; eski takma adlar 3.10\'da kaldırıldı.', 'Tek satırlık düzeltme: from collections.abc import Mapping'],
  'why': 'Asistanın eğitim verisinde eski sürümlere ait çok kod vardır. İstemde Python sürümünü belirtmek ve DeprecationWarning uyarılarını ciddiye almak bu sınıf hataları önler.'},
 {'id': 'yapay-zeka-ile-kod-12', 't': 'code', 'stage': 'Hata avı', 'kind': 'bug', 'diff': 2,
  'q': '<p>Hatayı bul ve düzelt. Kullanıcıların yüklediği kampanya ayar metnini (<code>"{\'indirim\': 0.1, \'sehirler\': [\'İzmir\']}"</code> gibi Python sözlük gösterimi) okumak için asistan <code>eval</code> kullanmış. Güvenlik incelemesi bunu reddetti. <code>ayar_oku(metin)</code> yalnız sabit değerleri (sözlük, liste, sayı, metin, bool, None) kabul etsin; başka her şeyde <code>ValueError</code> fırlatsın. Sonuç sözlük değilse de <code>ValueError</code>.</p>',
  'start': r'''def ayar_oku(metin):
    ayar = eval(metin)
    return ayar
''',
  'sol': r'''import ast

def ayar_oku(metin):
    try:
        ayar = ast.literal_eval(metin)
    except (ValueError, SyntaxError) as e:
        raise ValueError(f"geçersiz ayar: {e}") from None
    if not isinstance(ayar, dict):
        raise ValueError("ayar bir sözlük olmalı")
    return ayar
''',
  'tests': r'''assert ayar_oku("{'indirim': 0.1, 'sehirler': ['İzmir'], 'aktif': True, 'not': None}") == {"indirim": 0.1, "sehirler": ["İzmir"], "aktif": True, "not": None}, "geçerli ayar okunmalı"
for kotu in ["__import__('os').getcwd()", "{'a': open('x')}", "[1, 2]", "{'a': 1", "(lambda: 1)()"]:
    try:
        ayar_oku(kotu)
        assert False, f"{kotu!r} reddedilmeliydi"
    except ValueError:
        pass
assert "eval(" not in __source__.replace("literal_eval(", ""), "eval kullanılmamalı"
''',
  'hints': ['ast.literal_eval yalnız Python sabitlerini değerlendirir; çağrı, ad, öznitelik içeren ifadelerde ValueError ya da SyntaxError verir.', 'Her iki hatayı da yakalayıp ValueError olarak yeniden fırlat; sonra isinstance(ayar, dict) kontrolü.'],
  'why': 'eval kullanıcı metnini kod olarak çalıştırır; ayar dosyası bir saldırı aracına dönüşür. literal_eval aynı söz dizimini veri olarak okur. Daha da iyisi, dış dünyayla veri alışverişinde JSON kullanmaktır.'},
 {'id': 'yapay-zeka-ile-kod-13', 't': 'code', 'stage': 'Meydan okuma', 'diff': 3,
  'q': '<p>Yapay zekâ kodunu incelemeden önce otomatik ön tarama yapan <code>kod_tara(kaynak)</code> fonksiyonunu <code>ast</code> modülüyle yaz. <code>(satir_no, kod)</code> demetlerinin satır numarasına (eşitse koda) göre sıralı listesini döndürsün:</p><ul><li><code>"EVAL"</code>: <code>eval(...)</code> ya da <code>exec(...)</code> çağrısı</li><li><code>"CIPLAK_EXCEPT"</code>: türü belirtilmemiş <code>except:</code></li><li><code>"DEGISKEN_VARSAYILAN"</code>: fonksiyon varsayılan argümanı liste, sözlük ya da küme sabiti (<code>[]</code>, <code>{}</code>, <code>set()</code> çağrısı da dahil); satır numarası fonksiyonun tanım satırı</li><li><code>"SQL_FSTRING"</code>: <code>.execute(...)</code> metot çağrısının ilk argümanı bir f-string</li><li><code>"SHELL_TRUE"</code>: herhangi bir çağrıda <code>shell=True</code> anahtar argümanı</li></ul>',
  'start': 'import ast\n\ndef kod_tara(kaynak):\n    pass\n',
  'sol': r'''import ast

def _degisken_mi(d):
    if isinstance(d, (ast.List, ast.Dict, ast.Set)):
        return True
    return isinstance(d, ast.Call) and isinstance(d.func, ast.Name) and d.func.id in {"list", "dict", "set"} and not d.args

def kod_tara(kaynak):
    bulgular = []
    for d in ast.walk(ast.parse(kaynak)):
        if isinstance(d, ast.Call):
            if isinstance(d.func, ast.Name) and d.func.id in {"eval", "exec"}:
                bulgular.append((d.lineno, "EVAL"))
            if isinstance(d.func, ast.Attribute) and d.func.attr == "execute" and d.args and isinstance(d.args[0], ast.JoinedStr):
                bulgular.append((d.lineno, "SQL_FSTRING"))
            for kw in d.keywords:
                if kw.arg == "shell" and isinstance(kw.value, ast.Constant) and kw.value.value is True:
                    bulgular.append((d.lineno, "SHELL_TRUE"))
        elif isinstance(d, ast.ExceptHandler) and d.type is None:
            bulgular.append((d.lineno, "CIPLAK_EXCEPT"))
        elif isinstance(d, (ast.FunctionDef, ast.AsyncFunctionDef)):
            varsayilanlar = d.args.defaults + [v for v in d.args.kw_defaults if v is not None]
            if any(_degisken_mi(v) for v in varsayilanlar):
                bulgular.append((d.lineno, "DEGISKEN_VARSAYILAN"))
    return sorted(bulgular)
''',
  'tests': r'''kaynak = """import subprocess, sqlite3

def ekle(x, liste=[]):
    liste.append(x)
    return liste

def bul(db, ad):
    return db.execute(f"SELECT * FROM m WHERE ad = '{ad}'").fetchall()

def guvenli(db, ad, *, secenek=None, etiket=set()):
    try:
        return db.execute("SELECT * FROM m WHERE ad = ?", (ad,))
    except:
        return None

def hesapla(ifade):
    subprocess.run("ls " + ifade, shell=True)
    return eval(ifade)

def normal(a, b=0, c="x", d=(1, 2)):
    try:
        return a / b
    except ZeroDivisionError:
        return 0
"""
sonuc = kod_tara(kaynak)
beklenen = [(3, "DEGISKEN_VARSAYILAN"), (8, "SQL_FSTRING"), (10, "DEGISKEN_VARSAYILAN"), (13, "CIPLAK_EXCEPT"), (17, "SHELL_TRUE"), (18, "EVAL")]
assert sonuc == beklenen, f"bulgular hatalı:\nbeklenen {beklenen}\ngelen    {sonuc}"
assert kod_tara("x = 1\n") == [], "temiz kodda bulgu olmamalı"
''',
  'hints': ['ast.walk(ast.parse(kaynak)) tüm düğümleri gezer; her düğümün lineno özelliği vardır.', 'f-string düğümü ast.JoinedStr; çıplak except\'te ExceptHandler.type None\'dır.', 'Varsayılanlar: d.args.defaults ve d.args.kw_defaults (içinde None olabilir); set() bir ast.Call\'dır.'],
  'why': 'Bandit ve ruff gibi araçlar tam olarak böyle çalışır: kaynak kodu çalıştırmadan sözdizimi ağacında riskli kalıpları arar. Asistan kodunu insan incelemesinden önce böyle bir taramadan geçirmek, inceleyicinin dikkatini asıl mantığa ayırmasını sağlar.'},
 {'id': 'yapay-zeka-ile-kod-14', 't': 'code', 'stage': 'Meydan okuma', 'diff': 3,
  'q': '<p>Bir boru hattında modelden yapılandırılmış yanıt alan, doğrulama başarısızsa hatayı modele geri bildirip yeniden deneyen <code>yapilandirilmis_al(model, istem, dogrula, deneme=3)</code> fonksiyonunu yaz.</p><ul><li><code>model(istem)</code> bir metin döndürür (testte sahte bir model kullanılır).</li><li>Yanıttan JSON\'u hazır <code>json_ayikla</code> ile al; <code>dogrula(veri)</code> hata listesi döndürür (boşsa geçerli).</li><li>Ayıklama <code>ValueError</code> verirse ya da doğrulama hata listesi boş değilse, bir sonraki istem: <code>istem + "\\n\\nÖnceki yanıtın geçersizdi: " + "; ".join(hatalar) + "\\nYalnız geçerli JSON döndür."</code> olsun (ayıklama hatasında hata listesi <code>[str(e)]</code>). Her denemede <b>orijinal</b> istem temel alınır.</li><li>Geçerli veri gelirse onu döndür; <code>deneme</code> hakkı biterse son hatalarla <code>RuntimeError</code> fırlat.</li></ul>',
  'start': r'''import json, re

CIT = chr(96) * 3

def json_ayikla(yanit):
    m = re.search(CIT + r"(?:json)?\s*(.*?)\s*" + CIT, yanit, re.S)
    aday = m.group(1) if m else yanit[yanit.find("{"):yanit.rfind("}") + 1]
    try:
        veri = json.loads(aday)
    except json.JSONDecodeError as e:
        raise ValueError(f"JSON yok: {e.msg}") from None
    if not isinstance(veri, dict):
        raise ValueError("sözlük değil")
    return veri

def yapilandirilmis_al(model, istem, dogrula, deneme=3):
    pass
''',
  'sol': r'''import json, re

CIT = chr(96) * 3

def json_ayikla(yanit):
    m = re.search(CIT + r"(?:json)?\s*(.*?)\s*" + CIT, yanit, re.S)
    aday = m.group(1) if m else yanit[yanit.find("{"):yanit.rfind("}") + 1]
    try:
        veri = json.loads(aday)
    except json.JSONDecodeError as e:
        raise ValueError(f"JSON yok: {e.msg}") from None
    if not isinstance(veri, dict):
        raise ValueError("sözlük değil")
    return veri

def yapilandirilmis_al(model, istem, dogrula, deneme=3):
    simdiki = istem
    hatalar = []
    for _ in range(deneme):
        yanit = model(simdiki)
        try:
            veri = json_ayikla(yanit)
            hatalar = dogrula(veri)
        except ValueError as e:
            hatalar = [str(e)]
        if not hatalar:
            return veri
        simdiki = istem + "\n\nÖnceki yanıtın geçersizdi: " + "; ".join(hatalar) + "\nYalnız geçerli JSON döndür."
    raise RuntimeError("geçerli yanıt alınamadı: " + "; ".join(hatalar))
''',
  'tests': r'''def sahte_model(yanitlar):
    gelen = []
    def model(istem):
        gelen.append(istem)
        return yanitlar[len(gelen) - 1]
    model.gelen = gelen
    return model

def dogrula(v):
    h = []
    if v.get("duygu") not in {"olumlu", "olumsuz", "notr"}:
        h.append("duygu geçersiz")
    if not isinstance(v.get("puan"), int):
        h.append("puan tamsayı olmalı")
    return h

m = sahte_model(["Elbette! Bu yorum olumlu.", '{"duygu": "harika", "puan": "5"}', '{"duygu": "olumlu", "puan": 5}'])
sonuc = yapilandirilmis_al(m, "Yorumu sınıflandır: Kargo hızlıydı.", dogrula)
assert sonuc == {"duygu": "olumlu", "puan": 5}, f"üçüncü denemedeki geçerli veri dönmeli; gelen {sonuc}"
assert len(m.gelen) == 3 and m.gelen[0] == "Yorumu sınıflandır: Kargo hızlıydı.", "ilk istem değişmeden gönderilmeli"
assert m.gelen[1].startswith("Yorumu sınıflandır: Kargo hızlıydı.\n\nÖnceki yanıtın geçersizdi: JSON yok"), f"ayıklama hatası geri bildirilmeli:\n{m.gelen[1]}"
assert m.gelen[2] == "Yorumu sınıflandır: Kargo hızlıydı.\n\nÖnceki yanıtın geçersizdi: duygu geçersiz; puan tamsayı olmalı\nYalnız geçerli JSON döndür.", f"doğrulama hataları birleştirilip orijinal isteme eklenmeli:\n{m.gelen[2]}"
m2 = sahte_model(['{"duygu": "olumlu", "puan": 4}'])
assert yapilandirilmis_al(m2, "x", dogrula) == {"duygu": "olumlu", "puan": 4} and len(m2.gelen) == 1, "ilk yanıt geçerliyse tekrar denenmemeli"
m3 = sahte_model(["yok", "yok", "{\"duygu\": 1}"])
try:
    yapilandirilmis_al(m3, "x", dogrula)
    assert False, "deneme hakkı bitince RuntimeError fırlatılmalı"
except RuntimeError as e:
    assert "duygu geçersiz" in str(e), "RuntimeError son hataları içermeli"
assert len(m3.gelen) == 3, "tam olarak deneme sayısı kadar çağrı yapılmalı"
''',
  'hints': ['Döngü deneme kez döner; her turda ayıkla + doğrula, hata yoksa return.', 'Yeni istemi her zaman orijinal istem değişkeninden kur; aksi halde hata mesajları birikir.', 'Döngü bittiyse son hata listesiyle RuntimeError fırlat.'],
  'why': 'Doğrula-ve-yeniden-dene döngüsü, yapay zekâyı üretim boru hattına bağlamanın standart kalıbıdır: hatayı modele somut olarak bildirmek çoğu zaman ikinci denemede düzeltme sağlar; deneme sınırı ise maliyeti ve sonsuz döngüyü önler.'},
],
'faq': [
 {'q': 'Yapay zekâ ile kod yazmak öğrenmemi engeller mi?',
  'a': 'Kullanım biçimine bağlı. Kodu okumadan kabul edersen evet; açıklatır, kendin test eder, hatalarını bulursan öğrenmeni hızlandırır. Öğrenme aşamasında önce kendin dene, takıldığında ipucu iste, tam çözümü en son iste.'},
 {'q': 'Asistan bir kütüphane fonksiyonu önerdi ama emin değilim. Nasıl kontrol ederim?',
  'a': 'Resmi belgede ara, kendi ortamında <code>help(nesne)</code> ya da <code>dir(nesne)</code> ile bak, küçük bir örnekle çalıştır. Paketin kurulu sürümünü <code>pip show paket</code> ile öğrenip istemde belirt.'},
 {'q': 'Üretilen kodun lisansı kime ait?',
  'a': 'Bu konu ülkeye, araca ve sözleşmeye göre değişir. Kurumsal araçların kullanım koşullarını ve şirketinin politikasını takip et. Pratik kural: kodun sorumluluğu commit edene aittir; uzun ve tanıdık görünen blokların kaynağını kontrol et.'},
 {'q': 'Asistan aynı soruya her seferinde farklı kod veriyor. Hangisi doğru?',
  'a': 'Modeller olasılıksal çalışır; farklılık normaldir. Doğruyu oylamayla değil testlerle seç: hangi sürüm senin test kümeni geçiyor ve daha okunur? Testin yoksa önce testi yazdır ve onayla.'},
],
'mistakes': [
 {'why': 'Varsayılan liste tüm çağrılarda paylaşılır; asistanların sık ürettiği sessiz bir hatadır.',
  'bad': 'def ekle(x, liste=[]):\n    liste.append(x)\n    return liste',
  'good': 'def ekle(x, liste=None):\n    liste = [] if liste is None else liste\n    liste.append(x)\n    return liste'},
 {'why': 'Çıplak except ve sessiz None dönüşü hatayı gizler; sorun saatler sonra başka yerde ortaya çıkar.',
  'bad': 'try:\n    tutar = Decimal(satir["tutar"])\nexcept:\n    tutar = None',
  'good': 'try:\n    tutar = Decimal(satir["tutar"])\nexcept (KeyError, InvalidOperation) as e:\n    log.warning("geçersiz tutar: %s", e)\n    raise'},
 {'why': 'Model yanıtını doğrudan json.loads\'a vermek, metin ya da kod çiti geldiğinde boru hattını çökertir.',
  'bad': 'veri = json.loads(yanit)\nprint(veri["duygu"])',
  'good': 'veri = json_ayikla(yanit)\nhatalar = dogrula(veri)\nif hatalar:\n    raise ValueError(hatalar)'},
 {'why': 'Gizli anahtarı isteme ya da koda yapıştırmak, onu üçüncü taraf sistemlere ve git geçmişine taşır.',
  'bad': 'client = Client(api_key="sk-canli-anahtar-123")',
  'good': 'import os\nclient = Client(api_key=os.environ["API_KEY"])'},
],
}
