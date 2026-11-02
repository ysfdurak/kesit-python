/* Kesit Python v2/i6 — İleri test teknikleri */
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push({
  id: 'test-ileri',
  lv: 'ileri',
  mod: 'Üretime Hazırlık',
  min: 60,
  title: 'İleri test teknikleri: mock, test ikizleri, özellik ve mutasyon testi',
  sum: 'Test piramidini kurar, unittest.mock\'u side_effect, spec ve doğru patch hedefiyle ustalıkla kullanır, bağımlılık enjeksiyonuyla zamanı, rastgeleliği ve ağı izole eder; fabrikalar, özellik tabanlı ve mutasyon testiyle testlerinin gerçekten hata yakaladığını kanıtlarsın.',
  goals: ['Birim, entegrasyon ve uçtan uca testi ayırt edip test piramidine göre dengeli bir test paketi tasarlayabilirim.', 'Stub, fake, mock ve spy arasından doğru test ikizini seçer; return_value, side_effect, spec ve assert_called_with\'i doğru kullanırım.', 'patch hedefini doğru belirler, saat/rastgelelik/ağ bağımlılıklarını enjeksiyonla izole ederek deterministik testler yazarım.', 'Test verisi fabrikası, tablo güdümlü test ve kendi mini özellik testimle az kodla çok durum denerim.', 'Dal kapsamı ve mutasyon testiyle testlerimin boşluklarını bulur, refactor öncesi güvenlik ağı kurarım.'],
  body: `
<h2>Neden ileri test teknikleri?</h2>
<p>Test yazma dersinde <code>unittest</code>, düz <code>assert</code>, <code>patch.object</code> ve TDD döngüsünü gördün. Gerçek projede ise testlerin kendisi bir kod tabanına dönüşür: yüzlerce test, dış servislere bağlı kod, saatle değişen kurallar, rastgele üretilen kimlikler. Kötü tasarlanmış bir test paketi ya yavaştır, ya rastgele kırılır (flaky), ya da daha kötüsü <b>her şey yeşilken hatayı kaçırır</b>. Bu derste Ilgaz Bank ve Anadolu Market örnekleriyle testlerini hızlı, güvenilir ve gerçekten hata yakalayan hâle getirmeyi öğreneceksin.</p>

<h2>Test piramidi</h2>
<p>Test piramidi (test pyramid), farklı düzeydeki testlerden ne kadar yazman gerektiğini anlatan bir kılavuzdur: tabanda çok sayıda hızlı <b>birim testi</b> (unit test), ortada daha az <b>entegrasyon testi</b> (integration test), tepede birkaç <b>uçtan uca test</b> (end-to-end, E2E).</p>
<div class="tbl-wrap"><table>
<tr><th>Düzey</th><th>Neyi sınar?</th><th>Hız</th><th>Örnek (Anadolu Market)</th></tr>
<tr><td>Birim</td><td>Tek fonksiyon/sınıf, dış bağımlılık yok</td><td>Milisaniye</td><td><code>indirim_hesapla(sepet)</code></td></tr>
<tr><td>Entegrasyon</td><td>Bileşenlerin birlikte çalışması (gerçek SQLite, gerçek ORM)</td><td>Saniye altı</td><td>Sipariş deposu + veritabanı</td></tr>
<tr><td>Uçtan uca</td><td>Kullanıcının gördüğü akış, tüm sistem ayakta</td><td>Saniyeler-dakikalar</td><td>Sepete ekle → öde → e-posta gelsin</td></tr>
</table></div>
<p>Piramit ters dönerse (çok E2E, az birim testi) CI yavaşlar, hatanın yeri bulunamaz ve testler küçük arayüz değişikliklerinde topluca kırılır.</p>

<h2>Test ikizleri: dummy, stub, fake, mock, spy</h2>
<p>Gerçek bir bağımlılığın yerine geçen nesneye genel olarak <b>test ikizi</b> (test double) denir. Türleri karıştırılır ama farkları önemlidir:</p>
<div class="tbl-wrap"><table>
<tr><th>Tür</th><th>Ne yapar?</th><th>Ne zaman?</th></tr>
<tr><td>Dummy</td><td>Yalnızca parametre doldurur, kullanılmaz</td><td>İmza gerektiriyor ama test ilgilenmiyor</td></tr>
<tr><td>Saplama (stub)</td><td>Sabit cevap döndürür</td><td>"Kur servisi 40.0 desin"</td></tr>
<tr><td>Sahte (fake)</td><td>Çalışan ama basit bir gerçekleme</td><td>Bellek içi depo, sözlükle çalışan önbellek</td></tr>
<tr><td>Taklit (mock)</td><td>Çağrıları kaydeder, beklentiyi doğrular</td><td>"SMS tam bir kez bu numaraya gitti mi?"</td></tr>
<tr><td>Casus (spy)</td><td>Gerçeği çağırır, çağrıları da kaydeder</td><td><code>Mock(wraps=gercek)</code></td></tr>
</table></div>
<p>Kural: <b>durumu</b> (sonuç ne oldu?) doğrulamak için stub ve fake, <b>etkileşimi</b> (kim, kime, neyle çağrıldı?) doğrulamak için mock kullan. Her şeyi mock'larsan testler gerçekleştirmenin ayrıntısına kilitlenir ve her yeniden düzenlemede kırılır.</p>
<pre class="py">class SahteMusteriDepo:
    """Gerçek SQL deposuyla aynı arayüz, bellekte çalışır (fake)."""
    def __init__(self):
        self._kayitlar = {}
    def ekle(self, musteri):
        self._kayitlar[musteri["id"]] = dict(musteri)
    def getir(self, mid):
        return self._kayitlar.get(mid)

def sadakat_puani_ekle(depo, mid, tutar):
    m = depo.getir(mid)
    m["puan"] = m.get("puan", 0) + int(tutar // 10)
    depo.ekle(m)
    return m["puan"]

depo = SahteMusteriDepo()
depo.ekle({"id": 7, "ad": "Ayşe"})
print(sadakat_puani_ekle(depo, 7, 255))
print(depo.getir(7))     # durumu doğruluyoruz, etkileşimi değil</pre>

<h2>unittest.mock derinlemesine</h2>
<p><code>Mock</code> ve <code>MagicMock</code> erişilen her özniteliği anında yaratır ve her çağrıyı kaydeder. En sık kullanacağın ayarlar:</p>
<div class="tbl-wrap"><table>
<tr><th>Özellik</th><th>Görevi</th></tr>
<tr><td><code>return_value</code></td><td>Çağrı hep bu değeri döndürür</td></tr>
<tr><td><code>side_effect = İstisna</code></td><td>Çağrı istisna fırlatır (ağ hatası taklidi)</td></tr>
<tr><td><code>side_effect = [a, b, c]</code></td><td>Her çağrıda sıradaki değer (listede istisna varsa fırlatılır)</td></tr>
<tr><td><code>side_effect = fonksiyon</code></td><td>Argümanlara göre hesaplanan cevap</td></tr>
<tr><td><code>assert_called_once_with(...)</code></td><td>Tam bir kez, bu argümanlarla çağrıldı mı?</td></tr>
<tr><td><code>call_args</code>, <code>call_args_list</code>, <code>call_count</code></td><td>Kayıtlı çağrıları incelemek için</td></tr>
<tr><td><code>Mock(spec=Sinif)</code>, <code>create_autospec</code></td><td>Yalnızca gerçek sınıfta olan özniteliklere izin verir; autospec imzayı da denetler</td></tr>
</table></div>
<pre class="py">from unittest.mock import Mock, MagicMock, call

kur = Mock(side_effect=[38.5, ConnectionError("TCMB yanıt vermiyor"), 38.7])
print(kur("USD"))
try:
    kur("USD")
except ConnectionError as e:
    print("yakalandı:", e)
print(kur("USD"), "| çağrı sayısı:", kur.call_count)

sms = Mock()
sms.gonder("05321112233", "Siparişin yola çıktı")
sms.gonder.assert_called_once_with("05321112233", "Siparişin yola çıktı")
print(sms.gonder.call_args_list == [call("05321112233", "Siparişin yola çıktı")])

sepet = MagicMock()          # sihirli metotları da destekler
sepet.__len__.return_value = 3
print(len(sepet), "ürün")</pre>
<div class="warn"><b>spec kullanmayan mock yalan söyleyebilir</b>Gerçek sınıfta metot <code>kaydet</code> ama kodun <code>depo.kayit_et()</code> çağırıyorsa, düz <code>Mock()</code> bunu sessizce kabul eder ve test yeşil kalır; üretimde ise AttributeError alırsın. <code>Mock(spec=Depo)</code> ya da <code>create_autospec(Depo)</code> bu yalanı engeller. Ayrıca <code>m.assert_called_once_wiht(...)</code> gibi yazım hatalarını Python 3.12 AttributeError ile yakalar.</div>
<pre class="py">from unittest.mock import Mock, create_autospec

class Depo:
    def kaydet(self, siparis): ...

serbest = Mock()
serbest.kayit_et({"id": 1})               # hata yok: yalan söyleyen test
print("düz Mock sorunu fark etmedi")

kati = create_autospec(Depo, instance=True)
try:
    kati.kayit_et({"id": 1})
except AttributeError as e:
    print("autospec yakaladı:", type(e).__name__)
try:
    kati.kaydet()                          # eksik argüman
except TypeError as e:
    print("imza da denetlendi:", type(e).__name__)</pre>

<h2>patch hedefi: nerede kullanılıyorsa orası</h2>
<p><code>patch("a.b.c")</code> bir modüldeki <b>adı</b> geçici olarak değiştirir. <code>rapor.py</code> içinde <code>from kur import kur_getir</code> yazılmışsa, <code>rapor</code> modülü kendi <code>kur_getir</code> adına sahiptir; <code>patch("kur.kur_getir")</code> bunu etkilemez. Doğru hedef <code>patch("rapor.kur_getir")</code>'dir. Aşağıda iki modülü bellekte oluşturup farkı görüyoruz:</p>
<pre class="py">import sys, types
from unittest.mock import patch

kur = types.ModuleType("kur")
def kur_getir(doviz):
    raise ConnectionError("ağ yok")
kur.kur_getir = kur_getir
sys.modules["kur"] = kur

rapor = types.ModuleType("rapor")
exec("from kur import kur_getir\\ndef tl(tutar): return round(tutar * kur_getir('USD'), 2)", rapor.__dict__)
sys.modules["rapor"] = rapor

with patch("kur.kur_getir", return_value=40.0):
    try:
        rapor.tl(100)
    except ConnectionError:
        print("Yanlış hedef: rapor hâlâ gerçek fonksiyonu çağırdı")

with patch("rapor.kur_getir", return_value=40.0) as sahte:
    print("Doğru hedef:", rapor.tl(100))
    sahte.assert_called_once_with("USD")</pre>

<h2>Bağımlılık enjeksiyonu: test edilebilir tasarım</h2>
<p>Patch'e çok ihtiyaç duyuyorsan bu genellikle tasarımın bağımlılıkları içeride sakladığını gösterir. <b>Bağımlılık enjeksiyonu</b> (dependency injection) ile saat, rastgele sayı üreteci, HTTP istemcisi ve depo dışarıdan verilir; testte yerine sabit/sahte olanı koyarsın. Zaman (<code>datetime.now</code>), rastgelelik (<code>random</code>) ve ağ, testleri "bazen kırmızı" yapan üç büyük kaynaktır.</p>
<pre class="py">import random
from datetime import datetime

class KuponUretici:
    def __init__(self, saat=datetime.now, rng=None):
        self.saat = saat
        self.rng = rng or random.Random()

    def uret(self, musteri_id):
        gun = self.saat().strftime("%y%m%d")
        return f"AM{gun}-{musteri_id}-{self.rng.randint(100, 999)}"

sabit_saat = lambda: datetime(2026, 3, 13, 9, 30)
u1 = KuponUretici(saat=sabit_saat, rng=random.Random(42))
u2 = KuponUretici(saat=sabit_saat, rng=random.Random(42))
print(u1.uret(15), u2.uret(15))      # aynı tohum, aynı sonuç: deterministik test</pre>

<h2>Parametrize ve test verisi fabrikaları</h2>
<p>Aynı mantığı onlarca girdiyle denemek için testi kopyalamazsın; <b>tablo güdümlü</b> (table-driven) yazarsın. pytest'te bu <code>@pytest.mark.parametrize</code>, unittest'te <code>subTest</code>'tir:</p>
<pre class="code">import pytest

@pytest.mark.parametrize("tutar, beklenen", [(100, 120.0), (0, 0.0), (19.99, 23.99)])
def test_kdv(tutar, beklenen):
    assert kdv_ekle(tutar) == pytest.approx(beklenen)</pre>
<p>Testlerde sık ihtiyaç duyulan nesneleri (müşteri, sipariş) her seferinde elle yazmak hem uzun hem kırılgandır. <b>Fabrika</b> (factory) fonksiyonu makul varsayılanlar üretir; test yalnızca kendisini ilgilendiren alanı değiştirir. Python'da <code>factory_boy</code> kütüphanesi bunu büyük ölçekte yapar.</p>
<pre class="py">import copy, itertools

_sayac = itertools.count(1)
VARSAYILAN = {"musteri": "Ayşe", "sehir": "İzmir", "kalemler": [{"urun": "Çay", "adet": 1, "fiyat": 50.0}]}

def siparis(**ozel):
    s = copy.deepcopy(VARSAYILAN)
    s["id"] = next(_sayac)
    s.update(ozel)
    return s

print(siparis())
print(siparis(sehir="Van", musteri="Mehmet"))</pre>

<h2>Özellik tabanlı test</h2>
<p>Örnek tabanlı testte girdiyi sen seçersin; <b>özellik tabanlı testte</b> (property-based testing) her girdi için doğru olması gereken bir <b>özellik</b> yazarsın ve araç yüzlerce rastgele girdi üretir. Python'da standart araç <b>hypothesis</b>'tir; bulduğu hatalı girdiyi en küçük hâline <b>küçültür</b> (shrinking).</p>
<pre class="code">from hypothesis import given, strategies as st

@given(st.floats(min_value=0, max_value=1e6), st.integers(min_value=0, max_value=100))
def test_indirim_fiyati_asmaz(fiyat, oran):
    sonuc = indirimli(fiyat, oran)
    assert 0 &lt;= sonuc &lt;= fiyat</pre>
<p>Kendi bilgisayarında dene: <code>pip install hypothesis pytest</code>. Tarayıcıda hypothesis yok; ama fikri <code>random.Random(tohum)</code> ile kendimiz kurabiliriz. Aşağıdaki indirim fonksiyonundaki hatayı elle yazdığın üç örnek muhtemelen yakalamazdı:</p>
<pre class="py">import random

def indirimli(fiyat, oran):
    return round(fiyat - fiyat * oran / 10, 2)     # hata: /100 olmalıydı

def ozellik(fiyat, oran):
    s = indirimli(fiyat, oran)
    return 0 &lt;= s &lt;= fiyat

rng = random.Random(0)
for deneme in range(1, 501):
    fiyat, oran = round(rng.uniform(0, 1000), 2), rng.randint(0, 100)
    if not ozellik(fiyat, oran):
        print(f"{deneme}. denemede karşı örnek: fiyat={fiyat}, oran={oran} -&gt; {indirimli(fiyat, oran)}")
        break
else:
    print("500 denemede özellik bozulmadı")</pre>
<p>İyi özellik kalıpları: <b>gidiş-dönüş</b> (<code>json.loads(json.dumps(x)) == x</code>), <b>değişmezler</b> (sıralama eleman sayısını korur), <b>eşgüç</b> (idempotence: <code>temizle(temizle(x)) == temizle(x)</code>) ve <b>referansla karşılaştırma</b> (hızlı algoritma = yavaş ama kesin olan).</p>

<h2>Kapsam, dal kapsamı ve mutasyon testi</h2>
<p><b>Satır kapsamı</b> (line coverage) hangi satırların çalıştığını ölçer; <b>dal kapsamı</b> (branch coverage) her <code>if</code>'in hem doğru hem yanlış yolunun denendiğini. <code>if vip: oran += 5</code> satırı yalnızca VIP müşteriyle test edilirse satır kapsamı %100 olur ama "VIP değil" yolu hiç denenmemiştir. Komut: <code>coverage run --branch -m pytest</code> ve <code>coverage report -m</code> (Kalite ve CI dersinde kapsam eşiğini gördün).</p>
<p>Kapsam bir testin kodu <b>çalıştırdığını</b> söyler, <b>doğruladığını</b> söylemez. <b>Mutasyon testi</b> (mutation testing) bunu ölçer: araç koda küçük hatalar (mutant) sokar, ör. <code>&lt;</code> yerine <code>&lt;=</code>, ve testleri koşturur. Testler kırmızıya dönerse mutant <b>öldürülmüştür</b>; yeşil kalırsa <b>hayatta kalmıştır</b> ve testlerinde bir boşluk var demektir. Python'da <code>mutmut</code> ve <code>cosmic-ray</code> bu işi yapar.</p>
<pre class="py">import ast

kaynak = "def ucretsiz_kargo(tutar):\\n    return tutar &gt;= 500\\n"

class BuyukEsitToBuyuk(ast.NodeTransformer):
    def visit_Compare(self, dugum):
        dugum.ops = [ast.Gt() if isinstance(o, ast.GtE) else o for o in dugum.ops]
        return dugum

mutant = ast.unparse(BuyukEsitToBuyuk().visit(ast.parse(kaynak)))
print("Mutant:", mutant.splitlines()[1].strip())

def testler(f):
    assert f(1000) is True
    assert f(100) is False

for ad, kod in [("orijinal", kaynak), ("mutant", mutant)]:
    ns = {}
    exec(kod, ns)
    testler(ns["ucretsiz_kargo"])
    print(ad, "testleri geçti")
print("Mutant hayatta kaldı: sınır değeri 500 hiç test edilmemiş!")</pre>

<h2>TDD ve güvenli yeniden düzenleme</h2>
<p>Kırmızı-yeşil-düzenle döngüsünü biliyorsun. İleri seviyede asıl kazanç "düzenle" adımındadır: davranışı kilitleyen testler varken kodu gönül rahatlığıyla yeniden yapılandırırsın (refactor). Eski, testsiz bir koda dokunmadan önce <b>karakterizasyon testi</b> (characterization test) yaz: kodun bugün ne yaptığını (doğru ya da yanlış) kaydeden testler. Sonra küçük adımlarla değiştir, her adımda testleri çalıştır.</p>
<div class="tip"><b>İyi testin özellikleri: FIRST</b><b>F</b>ast (hızlı), <b>I</b>solated (birbirinden bağımsız, sıra önemsiz), <b>R</b>epeatable (her makinede aynı sonuç: sabit saat, sabit tohum), <b>S</b>elf-validating (assert ile kendi karar verir, çıktıya bakmayı gerektirmez), <b>T</b>imely (kodla birlikte yazılır).</div>
<div class="note"><b>Gerçek işte</b>Bankacılık ve e-ticaret ekiplerinde birleştirme isteği (pull request) incelemesinde ilk bakılan şeylerden biri yeni kodun testidir: "Hata yolu test edilmiş mi? Saat sabitlenmiş mi? Mock'lar spec'li mi?" Rastgele kırılan (flaky) bir test bulunduğunda genellikle karantinaya alınır ve kök nedeni (çoğu zaman paylaşılan durum, gerçek saat ya da test sırası) düzeltilene kadar bir iş kaydı açık kalır. Kritik modüllerde (ödeme, faiz hesabı) mutasyon testi gece çalışan ayrı bir CI işinde koşturulabilir.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Sözleşme testleri ve sahtenin doğruluğu</h3>
<p>Fake kullanmanın riski, sahtenin gerçekten farklı davranmasıdır. Çözüm: aynı test paketini hem fake hem gerçek depo üzerinde çalıştırmak (<b>sözleşme testi</b>, contract test). pytest'te bunu parametrize edilmiş bir fixture ile yaparsın; gerçek PostgreSQL için <code>testcontainers</code> testte geçici bir konteyner açar.</p>
<h3>Flaky testlerin anatomisi</h3>
<p>Rastgele kırılan testlerin çoğu şu kaynaklardan gelir: gerçek saat (gece yarısı geçişi, saat dilimi), sabitlenmemiş rastgelelik, testler arasında paylaşılan modül düzeyi durum, sıraya bağımlılık (<code>pytest-randomly</code> sırayı karıştırarak bunu ortaya çıkarır), ağ ve <code>time.sleep</code> ile beklenen eşzamanlılık. Her birinin ilacı aynıdır: bağımlılığı dışarıdan ver ve testte kontrol et.</p>
<h3>Ne kadar mock?</h3>
<p>"Sahip olmadığın şeyi mock'lama" sık duyulan bir ilkedir: üçüncü taraf bir kütüphaneyi doğrudan mock'lamak yerine onu kendi küçük adaptör sınıfının arkasına koy, testte adaptörü değiştir. Böylece kütüphane değiştiğinde yalnızca adaptör ve onun entegrasyon testi etkilenir.</p>
</section>
`,
  ex: [
    { t: 'mc',
      stage: 'Isınma',
      q: '<code>rapor.py</code> dosyası <code>from kur import kur_getir</code> ile fonksiyonu içe aktarıp kullanıyor. Testte <code>rapor.doviz_raporu</code>\'nun gerçek servisi çağırmaması için neyi yamalamalısın?',
      o: ['patch("kur.kur_getir")', 'patch("rapor.kur_getir")', 'patch("kur_getir")', 'Hiçbirini; from-import edilen fonksiyonlar yamalanamaz'],
      a: 1,
      why: 'from-import, rapor modülünde kur_getir adında yeni bir ad oluşturur. patch adı değiştirir; bu yüzden kullanıldığı yer olan rapor.kur_getir yamalanmalıdır. kur.kur_getir\'i yamalamak rapor\'daki kopyayı etkilemez.' },
    { t: 'mc',
      stage: 'Isınma',
      q: 'Sipariş servisini test ederken veritabanı yerine sözlükte çalışan, <code>ekle/getir/listele</code> metotları gerçekten çalışan bir <code>BellekDepo</code> sınıfı kullanıyorsun. Bu hangi test ikizidir?',
      o: ['Mock: çağrıları kaydeder', 'Dummy: yalnızca parametre doldurur', 'Fake (sahte): basit ama çalışan bir gerçekleme', 'Spy: gerçek veritabanını sarmalayıp çağrıları izler'],
      a: 2,
      why: 'Fake, gerçek bileşenin basitleştirilmiş ama çalışan bir sürümüdür; testte durumu (ne kaydedildi) doğrularsın. Mock etkileşimi doğrulamak içindir, dummy hiç kullanılmaz, spy ise gerçeği sarmalar.' },
    { t: 'mc',
      stage: 'Isınma',
      q: 'Test paketinin satır kapsamı %100. Mutasyon testi aracı <code>tutar &gt;= 500</code> ifadesini <code>tutar &gt; 500</code> yaptı ve tüm testler yine geçti. Bu ne anlama gelir?',
      o: ['Mutasyon aracı hatalı çalışıyor', 'Sınır değeri 500 test edilmemiş; testlerde bir boşluk var', 'Kod yanlış, >= yerine > yazılmalı', 'Satır kapsamı %100 olduğu için sorun yok, mutant görmezden gelinebilir'],
      a: 1,
      why: 'Hayatta kalan mutant, testlerin o değişikliği fark etmediğini gösterir. Satır kapsamı yalnızca satırın çalıştığını söyler; tutar == 500 durumu hiç denenmemiş. Çözüm: sınır değeri için test eklemek.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Bu kod ne yazdırır?',
      code: 'from unittest.mock import Mock\n\nkur = Mock(side_effect=[38.5, ValueError("bozuk yanıt"), 38.9])\nsonuclar = []\nfor _ in range(3):\n    try:\n        sonuclar.append(kur("USD"))\n    except ValueError:\n        sonuclar.append("hata")\nprint(sonuclar, kur.call_count)\n',
      o: ['[38.5, \'hata\', 38.9] 3', '[38.5, \'hata\', 38.9] 2', '[38.5, 38.5, 38.5] 3', '[38.5, \'hata\'] 2'],
      a: 0,
      why: 'side_effect bir liste olduğunda her çağrı sıradaki elemanı verir; eleman bir istisnaysa fırlatılır. Fırlatan çağrı da sayılır, bu yüzden call_count 3.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'return_value ile side_effect birlikte verilirse ne olur?',
      code: 'from unittest.mock import Mock\n\nkomisyon = Mock(return_value=5, side_effect=lambda tutar: tutar * 0.01)\nprint(komisyon(2000), komisyon.call_args.args)\n',
      o: ['5 (2000,)', '20.0 (2000,)', '5 2000', '20.0 ()'],
      a: 1,
      why: 'side_effect bir fonksiyonsa çağrının sonucunu o belirler (DEFAULT döndürmedikçe); return_value devreye girmez. call_args.args konumsal argümanların demetidir: (2000,).' },
    { t: 'predict',
      stage: 'Kodu oku',
      raises: true,
      q: 'Bu kod ne yapar?',
      code: 'from unittest.mock import Mock\n\nclass Hesap:\n    def bakiye(self):\n        return 0\n\nh = Mock(spec=Hesap)\nh.bakiye.return_value = 1500\nprint(h.bakiye())\nprint(h.bakiye_getir())\n',
      o: ['1500 yazar, sonra yeni bir Mock nesnesi yazar', 'Önce 1500 yazar, sonra AttributeError hatası verir', 'Hemen TypeError hatası verir', '0 yazar, sonra AttributeError verir'],
      a: 1,
      why: 'spec=Hesap, mock\'a yalnızca Hesap\'ta bulunan öznitelikleri tanır. bakiye var ve return_value 1500; bakiye_getir yok, bu yüzden AttributeError. Düz Mock() olsaydı sessizce yeni bir Mock döndürürdü.' },
    { t: 'order',
      stage: 'Kodu oku',
      q: '<p>Ödeme ağ geçidini taklit edip çağrıyı inceleyen kodun satırlarını sırala.</p>',
      lines: ['from unittest.mock import Mock', 'odeme = Mock()', 'odeme.cek.return_value = {"durum": "onay"}', 'sonuc = odeme.cek(tutar=250, kart="TR-1")', 'cagri = odeme.cek.call_args', 'print(sonuc["durum"], cagri.kwargs["tutar"])'],
      expect: 'onay 250\n',
      hint: 'Dönüş değeri çağrıdan ÖNCE ayarlanmalı; call_args ancak çağrıdan sonra dolar.',
      why: 'Mock önce oluşturulur, cevabı (return_value) ayarlanır, sonra kod onu çağırır. call_args çağrı yapılmadan None\'dur; kwargs anahtar sözcüklü argümanları verir.' },
    { t: 'code',
      id: 'test-ileri-1',
      stage: 'Rehberli',
      diff: 2,
      q: '<p>Anadolu Market sipariş numarası üreten <code>Numaralandirici</code> sınıfı şu an <code>datetime.now()</code> ve modül düzeyi <code>random</code> kullandığı için test edilemiyor. Sınıfı bağımlılık enjeksiyonuyla yeniden yaz:</p><ul><li><code>__init__(self, saat, rng)</code>: <code>saat</code> argümansız çağrılınca datetime döndüren bir fonksiyon, <code>rng</code> bir <code>random.Random</code> nesnesi.</li><li><code>yeni(self)</code>: <code>"S-YYYYMMDD-NNNN"</code> döndürsün; tarih <code>self.saat()</code>\'ten, NNNN <code>self.rng.randint(1000, 9999)</code>\'dan.</li></ul>',
      guide: ['__init__ içinde saat ve rng\'yi self\'e kaydet.', 'yeni() içinde tarihi self.saat() ile al.', 'Tarihi strftime("%Y%m%d") ile biçimle.', 'Sayıyı self.rng.randint(1000, 9999) ile üret ve f-string ile birleştir.'],
      example: 'import random\nfrom datetime import datetime\n\nclass FaturaNo:\n    def __init__(self, saat, rng):\n        self.saat = saat\n        self.rng = rng\n    def yeni(self):\n        return f"F{self.saat():%y%m}-{self.rng.randint(10, 99)}"\n\nf = FaturaNo(lambda: datetime(2026, 1, 5), random.Random(1))\nprint(f.yeni())\n',
      start: 'import random\nfrom datetime import datetime\n\nclass Numaralandirici:\n    def __init__(self, saat, rng):\n        # TODO: bağımlılıkları sakla\n        pass\n\n    def yeni(self):\n        # TODO: datetime.now ve random yerine enjekte edilenleri kullan\n        tarih = datetime.now().strftime("%Y%m%d")\n        return f"S-{tarih}-{random.randint(1000, 9999)}"\n',
      sol: 'import random\nfrom datetime import datetime\n\nclass Numaralandirici:\n    def __init__(self, saat, rng):\n        self.saat = saat\n        self.rng = rng\n\n    def yeni(self):\n        tarih = self.saat().strftime("%Y%m%d")\n        return f"S-{tarih}-{self.rng.randint(1000, 9999)}"\n',
      tests: 'import random\nfrom datetime import datetime\nsabit = lambda: datetime(2026, 11, 27, 10, 0)\na = Numaralandirici(sabit, random.Random(7))\nb = Numaralandirici(sabit, random.Random(7))\nx, y = a.yeni(), b.yeni()\nassert x == y, "Aynı saat ve aynı tohumla iki üretici aynı numarayı vermeli (deterministik)"\nassert x.startswith("S-20261127-"), f"Tarih enjekte edilen saatten gelmeli; gelen {x}"\nbeklenen = random.Random(7).randint(1000, 9999)\nassert x == f"S-20261127-{beklenen}", "Sayı enjekte edilen rng\'den gelmeli"\n',
      hints: ['Bağımlılık enjeksiyonu: dışarıdan gelen nesneyi self\'e kaydet ve hep onu kullan.', 'self.saat() çağrısı bir datetime döndürür: self.saat().strftime("%Y%m%d").', 'return f"S-{tarih}-{self.rng.randint(1000, 9999)}"'],
      why: 'Saat ve rastgelelik dışarıdan verildiğinde test, patch kullanmadan sabit bir saat ve tohumlu üreteçle her makinede aynı sonucu alır. Üretimde ise datetime.now ve random.Random() verilir; kod değişmez.' },
    { t: 'code',
      id: 'test-ileri-2',
      stage: 'Rehberli',
      diff: 2,
      q: '<p>Bu görevde <b>test</b> yazıyorsun. <code>odeme_al(tutar, banka)</code> fonksiyonunun sözleşmesi:</p><ul><li><code>banka.cek(tutar, "TRY")</code>\'yi tam bir kez çağırır ve onun sonucunu döndürür.</li><li><code>banka.cek</code> <code>ConnectionError</code> fırlatırsa <code>"tekrar_dene"</code> döndürür.</li></ul><p><code>odeme_testi(odeme_al)</code> fonksiyonunu yaz: verilen gerçeklemeyi <code>Mock</code> ile test etsin ve sözleşmeye uymuyorsa <code>AssertionError</code> fırlatsın (assert kullan). Doğru gerçeklemede sessizce bitmeli. Gizli testler senin testini bir doğru ve birkaç <b>hatalı</b> gerçeklemeyle çalıştırıp hataları yakalayıp yakalamadığına bakacak.</p>',
      guide: ['banka = Mock() oluştur ve banka.cek.return_value\'yu "onay-1" yap.', 'odeme_al(250, banka) sonucunun "onay-1" olduğunu doğrula.', 'banka.cek.assert_called_once_with(250, "TRY") ile çağrıyı doğrula.', 'Yeni bir Mock oluşturup cek.side_effect = ConnectionError() ver; sonucun "tekrar_dene" olduğunu doğrula.'],
      example: 'from unittest.mock import Mock\n\ndef bildir(musteri, sms):\n    sms.gonder(musteri["tel"], "Siparişin hazır")\n    return True\n\nsms = Mock()\nassert bildir({"tel": "0532"}, sms) is True\nsms.gonder.assert_called_once_with("0532", "Siparişin hazır")\nprint("test geçti")\n',
      start: 'from unittest.mock import Mock\n\ndef odeme_testi(odeme_al):\n    banka = Mock()\n    banka.cek.return_value = "onay-1"\n    odeme_al(250, banka)\n    # TODO: dönüş değerini ve çağrı argümanlarını doğrula\n    # TODO: ConnectionError durumunu side_effect ile dene\n',
      sol: 'from unittest.mock import Mock\n\ndef odeme_testi(odeme_al):\n    banka = Mock()\n    banka.cek.return_value = "onay-1"\n    assert odeme_al(250, banka) == "onay-1", "banka sonucu döndürülmeli"\n    banka.cek.assert_called_once_with(250, "TRY")\n\n    kopuk = Mock()\n    kopuk.cek.side_effect = ConnectionError("ağ yok")\n    assert odeme_al(100, kopuk) == "tekrar_dene", "ağ hatasında tekrar_dene"\n',
      tests: 'def dogru(tutar, banka):\n    try:\n        return banka.cek(tutar, "TRY")\n    except ConnectionError:\n        return "tekrar_dene"\ndef yakalamayan(tutar, banka):\n    return banka.cek(tutar, "TRY")\ndef yanlis_doviz(tutar, banka):\n    try:\n        return banka.cek(tutar, "USD")\n    except ConnectionError:\n        return "tekrar_dene"\ndef iki_kez(tutar, banka):\n    try:\n        banka.cek(tutar, "TRY")\n        return banka.cek(tutar, "TRY")\n    except ConnectionError:\n        return "tekrar_dene"\ndef sonuc_yutan(tutar, banka):\n    try:\n        banka.cek(tutar, "TRY")\n        return "ok"\n    except ConnectionError:\n        return "tekrar_dene"\nodeme_testi(dogru)\nfor ad, hatali in [("ConnectionError yakalamayan", yakalamayan), ("USD ile çeken", yanlis_doviz), ("iki kez çeken", iki_kez), ("sonucu döndürmeyen", sonuc_yutan)]:\n    try:\n        odeme_testi(hatali)\n    except Exception:\n        continue\n    raise AssertionError(f"Testin şu hatalı gerçeklemeyi yakalamadı: {ad}")\n',
      hints: ['İki senaryo var: başarılı çekim ve ağ hatası; her biri için ayrı Mock kullan.', 'assert_called_once_with hem çağrı sayısını (1) hem argümanları denetler.', 'kopuk.cek.side_effect = ConnectionError("ağ yok") ile ağ hatasını taklit et.'],
      why: 'İyi bir test, doğru kodda geçip hatalı kodda kırılan testtir. Gizli testler burada küçük bir mutasyon testi yaptı: dört farklı hatalı gerçeklemenin her birini testinin yakaladığını doğruladı.' },
    { t: 'code',
      id: 'test-ileri-3',
      stage: 'Rehberli',
      diff: 2,
      q: '<p>Testler için sipariş <b>fabrikası</b> yaz: <code>siparis_yap(**ozel)</code>.</p><ul><li>Varsayılanlar: <code>{"id": &lt;sıradaki&gt;, "musteri": "Ayşe", "sehir": "İzmir", "durum": "yeni", "kalemler": [{"urun": "Çay", "adet": 1, "fiyat": 50.0}]}</code></li><li><code>id</code> 1\'den başlayarak her çağrıda bir artsın (<code>itertools.count</code>).</li><li><code>ozel</code> ile verilen alanlar varsayılanların üzerine yazsın.</li><li>Her sipariş <b>kendi</b> kalem listesine sahip olsun (birinin listesini değiştirmek diğerini etkilememeli).</li></ul>',
      guide: ['Modül düzeyinde _sayac = itertools.count(1) oluştur.', 'Fonksiyon içinde varsayılan sözlüğü copy.deepcopy ile kopyala.', 'id alanını next(_sayac) ile ver.', 'ozel sözlüğüyle update edip döndür.'],
      example: 'import copy, itertools\n\n_no = itertools.count(100)\nSABLON = {"ad": "Deneme", "etiketler": ["yeni"]}\n\ndef urun_yap(**ozel):\n    u = copy.deepcopy(SABLON)\n    u["kod"] = next(_no)\n    u.update(ozel)\n    return u\n\na, b = urun_yap(), urun_yap(ad="Kahve")\na["etiketler"].append("indirim")\nprint(a, b)\n',
      start: 'import copy, itertools\n\nVARSAYILAN = {"musteri": "Ayşe", "sehir": "İzmir", "durum": "yeni",\n              "kalemler": [{"urun": "Çay", "adet": 1, "fiyat": 50.0}]}\n# TODO: sayaç oluştur\n\ndef siparis_yap(**ozel):\n    s = VARSAYILAN          # TODO: derin kopya al\n    s["id"] = 1             # TODO: sıradaki id\n    # TODO: özel alanları uygula\n    return s\n',
      sol: 'import copy, itertools\n\nVARSAYILAN = {"musteri": "Ayşe", "sehir": "İzmir", "durum": "yeni",\n              "kalemler": [{"urun": "Çay", "adet": 1, "fiyat": 50.0}]}\n_sayac = itertools.count(1)\n\ndef siparis_yap(**ozel):\n    s = copy.deepcopy(VARSAYILAN)\n    s["id"] = next(_sayac)\n    s.update(ozel)\n    return s\n',
      tests: 'a = siparis_yap()\nb = siparis_yap(sehir="Van", durum="kargoda")\nassert a["id"] == 1 and b["id"] == 2, "id\'ler 1\'den başlayıp artmalı"\nassert a["sehir"] == "İzmir" and b["sehir"] == "Van", "Özel alan varsayılanı ezmeli, diğer siparişi etkilememeli"\nassert b["durum"] == "kargoda" and b["musteri"] == "Ayşe", "Verilmeyen alanlar varsayılan kalmalı"\na["kalemler"].append({"urun": "Simit", "adet": 2, "fiyat": 15.0})\nassert len(b["kalemler"]) == 1, "Kalem listeleri paylaşılmamalı: deepcopy kullan"\nassert len(siparis_yap()["kalemler"]) == 1, "Varsayılan şablon testler arasında kirlenmemeli"\nc = siparis_yap(id=99)\nassert c["id"] == 99, "id de özel olarak verilebilmeli"\n',
      hints: ['Sözlüğü doğrudan döndürürsen her test aynı nesneyi değiştirir; kopya gerekir.', 'copy.copy yetmez: içteki liste yine paylaşılır; copy.deepcopy kullan.', 'Sıra: kopya → id → update; böylece ozel içindeki id de kazanır.'],
      why: 'Fabrika, her testin yalnızca kendisini ilgilendiren alanı yazmasını sağlar; bir alan eklendiğinde yüzlerce test yerine tek fabrika güncellenir. Paylaşılan değiştirilebilir veri, testlerin birbirini etkilediği flaky hataların bir numaralı kaynağıdır.' },
    { t: 'code',
      id: 'test-ileri-4',
      stage: 'Rehberli',
      diff: 2,
      q: '<p>Kendi mini özellik tabanlı test aracını yaz: <code>ozellik_dene(f, uret, ozellik, n=300, tohum=0)</code>.</p><ul><li><code>rng = random.Random(tohum)</code> oluştur.</li><li><code>n</code> kez: <code>girdi = uret(rng)</code>, <code>sonuc = f(girdi)</code>; <code>ozellik(girdi, sonuc)</code> False ise o <b>girdiyi</b> döndür (karşı örnek).</li><li>Hiç bozulmazsa <code>None</code> döndür.</li></ul>',
      guide: ['Tohumlu bir random.Random oluştur.', 'range(n) ile dön ve her turda uret(rng) ile girdi üret.', 'f(girdi) sonucunu hesapla, ozellik ile kontrol et.', 'Özellik bozulursa girdiyi hemen döndür; döngü biterse None.'],
      example: 'import random\n\nrng = random.Random(3)\nfor _ in range(5):\n    liste = [rng.randint(-5, 5) for _ in range(rng.randint(0, 4))]\n    print(liste, sorted(liste), len(liste) == len(sorted(liste)))\n',
      start: 'import random\n\ndef ozellik_dene(f, uret, ozellik, n=300, tohum=0):\n    rng = random.Random(tohum)\n    # TODO: n kez girdi üret, f\'yi çağır, özelliği kontrol et\n    return None\n',
      sol: 'import random\n\ndef ozellik_dene(f, uret, ozellik, n=300, tohum=0):\n    rng = random.Random(tohum)\n    for _ in range(n):\n        girdi = uret(rng)\n        if not ozellik(girdi, f(girdi)):\n            return girdi\n    return None\n',
      tests: 'liste_uret = lambda r: [r.randint(-50, 50) for _ in range(r.randint(0, 8))]\nsirali_mi = lambda g, s: all(a <= b for a, b in zip(s, s[1:])) and sorted(g) == s\nassert ozellik_dene(sorted, liste_uret, sirali_mi) is None, "sorted için özellik hiç bozulmamalı -> None"\ndef hatali_sirala(x):\n    return sorted(set(x))          # tekrarları siler!\nornek = ozellik_dene(hatali_sirala, liste_uret, sirali_mi)\nassert ornek is not None, "Tekrarları silen sıralama yakalanmalı"\nassert len(ornek) != len(set(ornek)), "Karşı örnekte tekrar eden eleman olmalı"\na = ozellik_dene(hatali_sirala, liste_uret, sirali_mi, tohum=5)\nb = ozellik_dene(hatali_sirala, liste_uret, sirali_mi, tohum=5)\nassert a == b, "Aynı tohum aynı karşı örneği vermeli (tekrarlanabilirlik)"\nsayac = []\nozellik_dene(lambda x: x, lambda r: sayac.append(1) or 1, lambda g, s: True, n=17)\nassert len(sayac) == 17, "Tam n girdi üretilmeli"\n',
      hints: ['Döngü + erken return kalıbı.', 'ozellik iki argüman alır: girdi ve f(girdi).', 'if not ozellik(girdi, f(girdi)): return girdi'],
      why: 'Özellik tabanlı testin özü budur: girdiyi sen seçmezsin, kuralı yazarsın. Tohum, bulunan karşı örneği yeniden üretmeyi sağlar; hypothesis da bulduğu hatayı bir veritabanına kaydedip sonraki çalıştırmada önce onu dener.' },
    { t: 'code',
      id: 'test-ileri-5',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p>Başlangıç kodundaki hazırlık bloğu bellekte iki modül oluşturur: <code>kur</code> (gerçek <code>kur_getir</code> ağ olmadığı için <code>ConnectionError</code> fırlatır) ve <code>rapor</code> (<code>from kur import kur_getir</code> ile içe aktarır; <code>doviz_raporu(tutar, doviz="USD")</code> fonksiyonu var).</p><p><code>rapor_testi()</code> fonksiyonunu yaz: <code>patch</code> ile kuru 40.0 yap, <code>rapor.doviz_raporu(100)</code> sonucunu döndür ve sahte fonksiyonun <code>"USD"</code> ile bir kez çağrıldığını doğrula. Hazırlık bloğunu değiştirme.</p>',
      start: '# --- hazırlık: bellekte iki modül (değiştirme) ---\nimport sys, types\nkur = types.ModuleType("kur")\ndef _kur_getir(doviz):\n    raise ConnectionError("ağ yok: gerçek kur servisi çağrıldı")\nkur.kur_getir = _kur_getir\nsys.modules["kur"] = kur\nrapor = types.ModuleType("rapor")\nexec(\n    "from kur import kur_getir\\n"\n    "def doviz_raporu(tutar, doviz=\'USD\'):\\n"\n    "    try:\\n"\n    "        k = kur_getir(doviz)\\n"\n    "    except ConnectionError:\\n"\n    "        return \'kur alınamadı\'\\n"\n    "    return f\'{tutar} {doviz} = {tutar * k:.2f} TL\'\\n",\n    rapor.__dict__,\n)\nsys.modules["rapor"] = rapor\n# --- hazırlık sonu ---\nfrom unittest.mock import patch\n\ndef rapor_testi():\n    # patch\'i doğru hedefe uygula\n    pass\n',
      sol: '# --- hazırlık: bellekte iki modül (değiştirme) ---\nimport sys, types\nkur = types.ModuleType("kur")\ndef _kur_getir(doviz):\n    raise ConnectionError("ağ yok: gerçek kur servisi çağrıldı")\nkur.kur_getir = _kur_getir\nsys.modules["kur"] = kur\nrapor = types.ModuleType("rapor")\nexec(\n    "from kur import kur_getir\\n"\n    "def doviz_raporu(tutar, doviz=\'USD\'):\\n"\n    "    try:\\n"\n    "        k = kur_getir(doviz)\\n"\n    "    except ConnectionError:\\n"\n    "        return \'kur alınamadı\'\\n"\n    "    return f\'{tutar} {doviz} = {tutar * k:.2f} TL\'\\n",\n    rapor.__dict__,\n)\nsys.modules["rapor"] = rapor\n# --- hazırlık sonu ---\nfrom unittest.mock import patch\n\ndef rapor_testi():\n    with patch("rapor.kur_getir", return_value=40.0) as sahte:\n        sonuc = rapor.doviz_raporu(100)\n        sahte.assert_called_once_with("USD")\n    return sonuc\n',
      tests: 's = rapor_testi()\nassert s == "100 USD = 4000.00 TL", f"Rapor sahte kurla üretilmeli; gelen {s!r}"\nassert rapor.kur_getir is sys.modules["kur"].kur_getir, "patch blok bitince orijinali geri koymalı (with kullan)"\nassert rapor.doviz_raporu(1) == "kur alınamadı", "Test dışında gerçek (ağsız) fonksiyon çalışmalı"\n',
      hints: ['from-import edilen adı kullanıldığı modülde yamala.', 'with patch("rapor.kur_getir", return_value=40.0) as sahte:', 'Bloğun içinde sahte.assert_called_once_with("USD") çağır, sonucu bloktan sonra döndür.'],
      why: '"kur.kur_getir" yamalansaydı rapor modülü kendi kopyası üzerinden gerçek fonksiyonu çağırır ve ConnectionError alırdın. with bloğu, test bitince orijinal adı geri yükleyerek diğer testlerin etkilenmesini önler.' },
    { t: 'code',
      id: 'test-ileri-6',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p>Gerçek <code>SqlMusteriDepo</code> ile aynı arayüze sahip bir <b>fake</b> yaz: <code>BellekMusteriDepo</code>.</p><ul><li><code>ekle(musteri)</code>: sözlüğün <b>kopyasını</b> saklar ve atanan id\'yi döndürür. id 1\'den başlayıp artar; sözlükte <code>"id"</code> yoksa eklenir.</li><li><code>getir(mid)</code>: kaydın kopyasını döndürür; yoksa <code>KeyError</code>.</li><li><code>listele(sehir=None)</code>: id sırasına göre kopyalar; şehir verilirse filtreler.</li><li><code>sil(mid)</code>: kaydı siler; yoksa <code>KeyError</code>.</li></ul><p>Kod, aşağıdaki hazır <code>MusteriServisi</code> ile çalışmalı.</p>',
      start: 'class MusteriServisi:\n    def __init__(self, depo):\n        self.depo = depo\n    def kaydol(self, ad, sehir):\n        if not ad.strip():\n            raise ValueError("ad boş")\n        return self.depo.ekle({"ad": ad.strip().title(), "sehir": sehir})\n    def sehir_sayisi(self, sehir):\n        return len(self.depo.listele(sehir=sehir))\n\n\nclass BellekMusteriDepo:\n    pass\n',
      sol: 'class MusteriServisi:\n    def __init__(self, depo):\n        self.depo = depo\n    def kaydol(self, ad, sehir):\n        if not ad.strip():\n            raise ValueError("ad boş")\n        return self.depo.ekle({"ad": ad.strip().title(), "sehir": sehir})\n    def sehir_sayisi(self, sehir):\n        return len(self.depo.listele(sehir=sehir))\n\n\nclass BellekMusteriDepo:\n    def __init__(self):\n        self._veri = {}\n        self._sonraki = 1\n\n    def ekle(self, musteri):\n        kayit = dict(musteri)\n        mid = self._sonraki\n        self._sonraki += 1\n        kayit["id"] = mid\n        self._veri[mid] = kayit\n        return mid\n\n    def getir(self, mid):\n        return dict(self._veri[mid])\n\n    def listele(self, sehir=None):\n        return [dict(k) for _, k in sorted(self._veri.items())\n                if sehir is None or k["sehir"] == sehir]\n\n    def sil(self, mid):\n        del self._veri[mid]\n',
      tests: 'depo = BellekMusteriDepo()\ns = MusteriServisi(depo)\na = s.kaydol("  ayşe yılmaz ", "İzmir")\nb = s.kaydol("Mehmet", "Van")\nc = s.kaydol("Zeynep", "İzmir")\nassert (a, b, c) == (1, 2, 3), "id\'ler 1\'den başlayıp artmalı"\nassert depo.getir(1) == {"ad": "Ayşe Yılmaz", "sehir": "İzmir", "id": 1}, "getir kaydı id ile döndürmeli"\nassert s.sehir_sayisi("İzmir") == 2, "listele(sehir=...) filtrelemeli"\nassert [m["id"] for m in depo.listele()] == [1, 2, 3], "listele id sırasıyla tümünü döndürmeli"\nk = depo.getir(2); k["sehir"] = "Ankara"\nassert depo.getir(2)["sehir"] == "Van", "getir kopya döndürmeli; dışarıdaki değişiklik depoyu bozmamalı"\ngirdi = {"ad": "Can", "sehir": "Bursa"}; depo.ekle(girdi)\nassert "id" not in girdi, "ekle, çağıranın sözlüğünü değiştirmemeli (kopyala)"\ndepo.sil(1)\ntry:\n    depo.getir(1); assert False, "Silinen kayıt için KeyError beklenir"\nexcept KeyError:\n    pass\ntry:\n    depo.sil(42); assert False, "Olmayan kaydı silmek KeyError vermeli"\nexcept KeyError:\n    pass\nassert depo.ekle({"ad": "X", "sehir": "Y"}) == 5, "Silme sonrası id\'ler yeniden kullanılmamalı"\n',
      hints: ['İç durum: bir sözlük (id → kayıt) ve sıradaki id sayacı.', 'Kopyalamayı hem girişte (ekle) hem çıkışta (getir/listele) yap: dict(kayit).', 'Sıralı listeleme: sorted(self._veri.items()) id\'ye göre sıralar.'],
      why: 'Fake, servis testlerinin veritabanı olmadan milisaniyede koşmasını sağlar ve durum doğrulamaya izin verir. Kopyalama kuralı gerçek veritabanının davranışını taklit eder: veritabanından okuduğun nesneyi değiştirmek kaydı değiştirmez.' },
    { t: 'code',
      id: 'test-ileri-7',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p>pytest\'in <code>parametrize</code>\'ını taklit eden tablo güdümlü bir çalıştırıcı yaz: <code>tablo_testi(f, vakalar)</code>. Her vaka <code>(argumanlar_demeti, beklenen)</code>. <code>beklenen</code> bir istisna sınıfıysa (<code>isinstance(beklenen, type) and issubclass(beklenen, Exception)</code>) f\'nin o istisnayı fırlatması beklenir. Başarısız vakalar için mesaj listesi döndür (hepsi geçerse boş liste). Mesaj biçimleri (<code>i</code> vakanın 0 tabanlı sırası, <code>ad</code> = <code>f.__name__</code>, argümanlar <code>repr</code> ile virgül+boşlukla birleşik):</p><ul><li>Yanlış değer: <code>"#i ad(args): beklenen X, gelen Y"</code> (X, Y <code>repr</code>)</li><li>İstisna bekleniyordu, gelmedi: <code>"#i ad(args): IstisnaAdı bekleniyordu"</code></li><li>Beklenmeyen istisna: <code>"#i ad(args): beklenmeyen IstisnaAdı"</code></li></ul>',
      sol: 'def tablo_testi(f, vakalar):\n    hatalar = []\n    for i, (args, beklenen) in enumerate(vakalar):\n        imza = f"#{i} {f.__name__}({\', \'.join(repr(a) for a in args)})"\n        istisna_mi = isinstance(beklenen, type) and issubclass(beklenen, Exception)\n        try:\n            gelen = f(*args)\n        except Exception as e:\n            if istisna_mi and isinstance(e, beklenen):\n                continue\n            hatalar.append(f"{imza}: beklenmeyen {type(e).__name__}")\n            continue\n        if istisna_mi:\n            hatalar.append(f"{imza}: {beklenen.__name__} bekleniyordu")\n        elif gelen != beklenen:\n            hatalar.append(f"{imza}: beklenen {beklenen!r}, gelen {gelen!r}")\n    return hatalar\n',
      tests: 'def kdv(tutar, oran=20):\n    if tutar < 0:\n        raise ValueError("negatif")\n    return round(tutar * (1 + oran / 100), 2)\nassert tablo_testi(kdv, [((100,), 120.0), ((50, 10), 55.0), ((-1,), ValueError)]) == [], "Tüm vakalar geçerse boş liste"\nh = tablo_testi(kdv, [((100,), 118.0), ((5,), ValueError), ((-3,), 0), ((10,), 12.0)])\nassert h[0] == "#0 kdv(100): beklenen 118.0, gelen 120.0", f"Yanlış değer mesajı: {h[0] if h else None}"\nassert h[1] == "#1 kdv(5): ValueError bekleniyordu", f"İstisna bekleniyordu mesajı: {h[1] if len(h) > 1 else None}"\nassert h[2] == "#2 kdv(-3): beklenmeyen ValueError", f"Beklenmeyen istisna mesajı: {h[2] if len(h) > 2 else None}"\nassert len(h) == 3, "Geçen 3. vaka (12.0) listede olmamalı"\ndef ad_birlestir(ad, soyad):\n    return f"{ad} {soyad}"\nassert tablo_testi(ad_birlestir, [(("Ayşe", "Kaya"), "Ayşe K.")]) == ["#0 ad_birlestir(\'Ayşe\', \'Kaya\'): beklenen \'Ayşe K.\', gelen \'Ayşe Kaya\'"], "Argümanlar repr ile, virgül+boşlukla yazılmalı"\nassert tablo_testi(kdv, [((1,), KeyError)]) == ["#0 kdv(1): KeyError bekleniyordu"], "Farklı istisna sınıfı beklenebilir"\n',
      hints: ['Önce imza metnini hazırla: f"#{i} {f.__name__}(" + ", ".join(map(repr, args)) + ")".', 'try/except içinde f(*args) çağır; except bloğunda beklenen istisnayla isinstance kontrolü yap.', 'Değer karşılaştırmasını yalnızca istisna beklenmiyorsa yap; mesajlarda !r kullan.'],
      why: 'parametrize\'ın değeri de budur: bir tablo, her satır bağımsız bir test, başarısız olan satır net bir mesajla raporlanır. Mesajda girdinin repr\'ı olması, hatayı yeniden üretmeyi tek kopyala-yapıştıra indirir.' },
    { t: 'code',
      id: 'test-ileri-8',
      stage: 'Kendin yaz',
      diff: 3,
      q: '<p>Mutasyon aracının ilk parçası: <code>mutantlar(kaynak)</code> fonksiyonunu <code>ast</code> ile yaz. Kaynaktaki karşılaştırma ve aritmetik işleçlerden <b>her biri için ayrı</b> bir mutant üretsin (her mutantta yalnızca tek değişiklik):</p><ul><li>Karşılaştırma: <code>&lt;</code>↔<code>&lt;=</code>, <code>&gt;</code>↔<code>&gt;=</code>, <code>==</code>↔<code>!=</code></li><li>İkili işlem: <code>+</code>↔<code>-</code>, <code>*</code>↔<code>/</code></li></ul><p>Her mutant için <code>(aciklama, yeni_kaynak)</code> demeti döndür; <code>aciklama</code> <code>"satır N: ESKI -&gt; YENI"</code> biçiminde (işleç sembolleriyle, ör. <code>"satır 2: &gt;= -&gt; &gt;"</code>), <code>yeni_kaynak</code> <code>ast.unparse</code> çıktısı. Sıra: <code>ast.walk</code> sırası.</p>',
      sol: 'import ast, copy\n\nTAKAS = {ast.Lt: ast.LtE, ast.LtE: ast.Lt, ast.Gt: ast.GtE, ast.GtE: ast.Gt,\n         ast.Eq: ast.NotEq, ast.NotEq: ast.Eq,\n         ast.Add: ast.Sub, ast.Sub: ast.Add, ast.Mult: ast.Div, ast.Div: ast.Mult}\nSEMBOL = {ast.Lt: "<", ast.LtE: "<=", ast.Gt: ">", ast.GtE: ">=", ast.Eq: "==", ast.NotEq: "!=",\n          ast.Add: "+", ast.Sub: "-", ast.Mult: "*", ast.Div: "/"}\n\ndef _yerler(agac):\n    yerler = []\n    for d in ast.walk(agac):\n        if isinstance(d, ast.Compare):\n            for j, op in enumerate(d.ops):\n                if type(op) in TAKAS:\n                    yerler.append((d, j))\n        elif isinstance(d, ast.BinOp) and type(d.op) in TAKAS:\n            yerler.append((d, None))\n    return yerler\n\ndef mutantlar(kaynak):\n    agac = ast.parse(kaynak)\n    sonuc = []\n    for k in range(len(_yerler(agac))):\n        kopya = copy.deepcopy(agac)\n        d, j = _yerler(kopya)[k]\n        eski = d.ops[j] if j is not None else d.op\n        yeni = TAKAS[type(eski)]()\n        if j is not None:\n            d.ops[j] = yeni\n        else:\n            d.op = yeni\n        acik = f"satır {d.lineno}: {SEMBOL[type(eski)]} -> {SEMBOL[type(yeni)]}"\n        sonuc.append((acik, ast.unparse(kopya)))\n    return sonuc\n',
      tests: 'k = "def kargo(tutar, uye):\\n    if tutar >= 500 or uye == True:\\n        return 0\\n    return 30 + tutar * 0\\n"\nm = mutantlar(k)\nacik = [a for a, _ in m]\nassert len(m) == 4, f"4 işleç -> 4 mutant bekleniyordu, {len(m)} geldi: {acik}"\nassert "satır 2: >= -> >" in acik and "satır 2: == -> !=" in acik, f"Karşılaştırma mutantları eksik: {acik}"\nassert "satır 4: + -> -" in acik and "satır 4: * -> /" in acik, f"Aritmetik mutantlar eksik: {acik}"\nfor a, kod in m:\n    assert kod != ast.unparse(ast.parse(k)), "Her mutant orijinalden farklı olmalı"\n    compile(kod, "<mutant>", "exec")\ntek = dict(m)["satır 2: >= -> >"]\nassert "tutar > 500" in tek and "uye == True" in tek, "Her mutantta yalnızca TEK değişiklik olmalı"\nassert mutantlar("x = 1\\nprint(x)\\n") == [], "İşleç yoksa mutant yok"\n',
      hints: ['ast.walk ile Compare (ops listesi) ve BinOp (op) düğümlerini bul; her mutant için ağacın derin kopyası üzerinde çalış.', 'Değişecek yeri indeksle seç: kopya ağaçta aynı ast.walk sırası aynı düğümü verir.', 'Takas ve sembol için iki sözlük tut: {ast.Lt: ast.LtE, ...} ve {ast.Lt: "<", ...}.'],
      why: 'mutmut gibi araçlar tam olarak böyle çalışır: kaynağı ağaca çevirir, her işleç için tek bir değişiklik yapar ve testleri koşturur. Derin kopya, mutantların birbirini etkilememesini garanti eder.' },
    { t: 'code',
      id: 'test-ileri-9',
      stage: 'Hata avı',
      kind: 'bug',
      diff: 2,
      q: '<p><b>Hatayı bul ve düzelt.</b> Hazırlık bloğundaki <code>rapor</code> modülü için yazılan <code>test_kur_hatasi()</code> testi, kur servisi çöktüğünde raporun <code>"kur alınamadı"</code> döndürdüğünü ve servisin <code>"EUR"</code> ile bir kez çağrıldığını doğrulamalı. Test şu an kendisi hata veriyor. Hazırlık bloğunu değiştirme.</p>',
      start: '# --- hazırlık: bellekte iki modül (değiştirme) ---\nimport sys, types\nkur = types.ModuleType("kur")\ndef _kur_getir(doviz):\n    raise ConnectionError("ağ yok: gerçek kur servisi çağrıldı")\nkur.kur_getir = _kur_getir\nsys.modules["kur"] = kur\nrapor = types.ModuleType("rapor")\nexec(\n    "from kur import kur_getir\\n"\n    "def doviz_raporu(tutar, doviz=\'USD\'):\\n"\n    "    try:\\n"\n    "        k = kur_getir(doviz)\\n"\n    "    except ConnectionError:\\n"\n    "        return \'kur alınamadı\'\\n"\n    "    return f\'{tutar} {doviz} = {tutar * k:.2f} TL\'\\n",\n    rapor.__dict__,\n)\nsys.modules["rapor"] = rapor\n# --- hazırlık sonu ---\nfrom unittest.mock import patch\n\ndef test_kur_hatasi():\n    with patch("rapor.kur_getir") as sahte:\n        sahte.return_value = ConnectionError("servis çöktü")\n        assert rapor.doviz_raporu(50, "EUR") == "kur alınamadı"\n        sahte.assert_called_once_wiht("EUR")\n',
      sol: '# --- hazırlık: bellekte iki modül (değiştirme) ---\nimport sys, types\nkur = types.ModuleType("kur")\ndef _kur_getir(doviz):\n    raise ConnectionError("ağ yok: gerçek kur servisi çağrıldı")\nkur.kur_getir = _kur_getir\nsys.modules["kur"] = kur\nrapor = types.ModuleType("rapor")\nexec(\n    "from kur import kur_getir\\n"\n    "def doviz_raporu(tutar, doviz=\'USD\'):\\n"\n    "    try:\\n"\n    "        k = kur_getir(doviz)\\n"\n    "    except ConnectionError:\\n"\n    "        return \'kur alınamadı\'\\n"\n    "    return f\'{tutar} {doviz} = {tutar * k:.2f} TL\'\\n",\n    rapor.__dict__,\n)\nsys.modules["rapor"] = rapor\n# --- hazırlık sonu ---\nfrom unittest.mock import patch\n\ndef test_kur_hatasi():\n    with patch("rapor.kur_getir") as sahte:\n        sahte.side_effect = ConnectionError("servis çöktü")\n        assert rapor.doviz_raporu(50, "EUR") == "kur alınamadı"\n        sahte.assert_called_once_with("EUR")\n',
      tests: 'test_kur_hatasi()\nassert "side_effect" in __source__, "İstisna fırlatmak için side_effect kullanılmalı"\nassert "assert_called_once_wiht" not in __source__, "Yazım hatalı doğrulama metodu düzeltilmeli"\n',
      hints: ['İki hata var: biri istisnayı taklit etme biçimiyle, biri doğrulama metodunun adıyla ilgili.', 'return_value istisnayı FIRLATMAZ, onu bir değer olarak döndürür; istisna için side_effect gerekir.', 'Python 3.12 assert ile başlayan yanlış yazılmış metotları AttributeError ile yakalar: assert_called_once_with.'],
      why: 'return_value = ConnectionError(...) çağrının istisna nesnesini değer olarak döndürmesine yol açar; kod onu kurla çarpmaya çalışıp TypeError alır. side_effect istisnayı gerçekten fırlatır. Eski Python sürümlerinde yanlış yazılmış assert metotları sessizce yeni Mock döndürüp testi her zaman geçirirdi; 3.12 bunun bir kısmını yakalar ama spec kullanmak yine en güvenlisidir.' },
    { t: 'code',
      id: 'test-ileri-10',
      stage: 'Hata avı',
      kind: 'bug',
      diff: 2,
      q: '<p><b>Hatayı bul ve düzelt.</b> <code>SiparisServisi.olustur</code> testi yeşil ama üretimde her siparişte <code>AttributeError</code> alınıyor. Hem servis kodundaki hatayı düzelt hem de <code>test_olustur()</code>\'u, bu tür hataları yakalayacak şekilde <b>spec\'li</b> bir mock (<code>Mock(spec=SiparisDepo)</code> ya da <code>create_autospec</code>) kullanacak hâle getir.</p>',
      start: 'from unittest.mock import Mock\n\nclass SiparisDepo:\n    def kaydet(self, siparis):\n        raise NotImplementedError("gerçek veritabanı")\n\nclass SiparisServisi:\n    def __init__(self, depo):\n        self.depo = depo\n    def olustur(self, musteri, tutar):\n        siparis = {"musteri": musteri, "tutar": tutar, "durum": "yeni"}\n        self.depo.siparis_kaydet(siparis)\n        return siparis\n\ndef test_olustur():\n    depo = Mock()\n    s = SiparisServisi(depo).olustur("Ayşe", 120)\n    assert s["durum"] == "yeni"\n    depo.siparis_kaydet.assert_called_once()\n',
      sol: 'from unittest.mock import Mock, create_autospec\n\nclass SiparisDepo:\n    def kaydet(self, siparis):\n        raise NotImplementedError("gerçek veritabanı")\n\nclass SiparisServisi:\n    def __init__(self, depo):\n        self.depo = depo\n    def olustur(self, musteri, tutar):\n        siparis = {"musteri": musteri, "tutar": tutar, "durum": "yeni"}\n        self.depo.kaydet(siparis)\n        return siparis\n\ndef test_olustur():\n    depo = create_autospec(SiparisDepo, instance=True)\n    s = SiparisServisi(depo).olustur("Ayşe", 120)\n    assert s["durum"] == "yeni"\n    depo.kaydet.assert_called_once_with(s)\n',
      tests: 'from unittest.mock import create_autospec\ntest_olustur()\nd = create_autospec(SiparisDepo, instance=True)\nSiparisServisi(d).olustur("Mehmet", 80)\nd.kaydet.assert_called_once_with({"musteri": "Mehmet", "tutar": 80, "durum": "yeni"})\nassert "spec" in __source__, "test_olustur spec\'li bir mock kullanmalı (spec=SiparisDepo ya da create_autospec)"\n',
      hints: ['Gerçek SiparisDepo sınıfında hangi metot var? Servis hangisini çağırıyor?', 'Düz Mock() her özniteliği kabul ettiği için yanlış metot adı testte fark edilmedi.', 'depo = create_autospec(SiparisDepo, instance=True) ve depo.kaydet.assert_called_once_with(s).'],
      why: 'Spec\'siz mock gerçek arayüzü bilmez; kodun ve testin aynı yanlış adı kullanması testi yeşil bırakır. create_autospec mock\'u gerçek sınıfın metotları ve imzalarıyla sınırlar, böylece arayüz uyumsuzluğu testte patlar.' },
    { t: 'code',
      id: 'test-ileri-11',
      stage: 'Meydan okuma',
      diff: 3,
      q: '<p>Mini mutasyon testi çalıştırıcısı: <code>mutasyon_skoru(kaynak, fonk_adi, testler)</code>.</p><ul><li>Kaynaktaki her karşılaştırma işleci (<code>&lt; &lt;= &gt; &gt;= == !=</code>) için tek değişiklikli bir mutant üret (<code>&lt;</code>↔<code>&lt;=</code>, <code>&gt;</code>↔<code>&gt;=</code>, <code>==</code>↔<code>!=</code>).</li><li>Her mutantı yeni bir sözlükte <code>exec</code> et, <code>testler(ns[fonk_adi])</code> çağır. Herhangi bir istisna fırlarsa mutant <b>öldürülmüştür</b>.</li><li>Önce orijinal kaynakla testler çalışmalı; orijinalde testler başarısızsa <code>ValueError</code> fırlat.</li><li>Dönüş: <code>{"toplam": n, "olduren": k, "skor": k / n (n=0 ise 1.0), "hayatta": [satır numaraları listesi]}</code></li></ul>',
      sol: 'import ast, copy\n\nTAKAS = {ast.Lt: ast.LtE, ast.LtE: ast.Lt, ast.Gt: ast.GtE, ast.GtE: ast.Gt, ast.Eq: ast.NotEq, ast.NotEq: ast.Eq}\n\ndef _yerler(agac):\n    return [(d, j) for d in ast.walk(agac) if isinstance(d, ast.Compare)\n            for j, op in enumerate(d.ops) if type(op) in TAKAS]\n\ndef _calistir(kod, fonk_adi, testler):\n    ns = {}\n    exec(kod, ns)\n    testler(ns[fonk_adi])\n\ndef mutasyon_skoru(kaynak, fonk_adi, testler):\n    try:\n        _calistir(kaynak, fonk_adi, testler)\n    except Exception as e:\n        raise ValueError(f"orijinal kod testleri geçmiyor: {e!r}")\n    agac = ast.parse(kaynak)\n    n = len(_yerler(agac))\n    olduren, hayatta = 0, []\n    for k in range(n):\n        kopya = copy.deepcopy(agac)\n        d, j = _yerler(kopya)[k]\n        d.ops[j] = TAKAS[type(d.ops[j])]()\n        try:\n            _calistir(ast.unparse(kopya), fonk_adi, testler)\n        except Exception:\n            olduren += 1\n        else:\n            hayatta.append(d.lineno)\n    return {"toplam": n, "olduren": olduren, "skor": olduren / n if n else 1.0, "hayatta": hayatta}\n',
      tests: 'KAYNAK = "def kampanya(tutar, adet):\\n    if tutar >= 1000:\\n        return \'büyük\'\\n    if adet > 3:\\n        return \'çoklu\'\\n    return \'yok\'\\n"\ndef zayif(f):\n    assert f(5000, 1) == "büyük"\n    assert f(10, 10) == "çoklu"\n    assert f(10, 1) == "yok"\nr = mutasyon_skoru(KAYNAK, "kampanya", zayif)\nassert r["toplam"] == 2 and r["olduren"] == 0, f"Sınır değerleri test edilmediği için iki mutant da hayatta kalmalı: {r}"\nassert r["hayatta"] == [2, 4] and r["skor"] == 0.0, f"Hayatta kalanlar satır 2 ve 4: {r}"\ndef guclu(f):\n    zayif(f)\n    assert f(1000, 1) == "büyük", "sınır 1000"\n    assert f(10, 3) == "yok", "sınır 3"\nr2 = mutasyon_skoru(KAYNAK, "kampanya", guclu)\nassert r2 == {"toplam": 2, "olduren": 2, "skor": 1.0, "hayatta": []}, f"Sınır testleri eklenince skor 1.0 olmalı: {r2}"\ndef bozuk(f):\n    assert f(1, 1) == "büyük"\ntry:\n    mutasyon_skoru(KAYNAK, "kampanya", bozuk)\n    assert False, "Orijinal testleri geçmiyorsa ValueError fırlatılmalı"\nexcept ValueError:\n    pass\nassert mutasyon_skoru("def f(x):\\n    return x\\n", "f", lambda f: None)["skor"] == 1.0, "Mutant yoksa skor 1.0"\n',
      hints: ['Önce orijinali çalıştır; başarısızsa skor anlamsızdır, ValueError fırlat.', 'Her mutant için ağacın derin kopyasını al, yalnızca k. karşılaştırmayı değiştir, ast.unparse ile koda çevir.', 'try: testler(...) except Exception: öldürüldü; else: hayatta.append(d.lineno).'],
      why: 'Mutasyon skoru kapsamın söyleyemediğini söyler: testler kodu yalnızca çalıştırıyor mu, yoksa davranışı gerçekten kilitliyor mu? Sınır değer testleri eklenince skor 0\'dan 1\'e çıktı; satır kapsamı ise iki durumda da aynıydı.' },
    { t: 'code',
      id: 'test-ileri-12',
      stage: 'Meydan okuma',
      diff: 3,
      q: '<p>hypothesis\'in en sevilen özelliği <b>küçültme</b>dir (shrinking). Tamsayı listeleri için <code>kucult(girdi, basarisiz)</code> yaz: <code>basarisiz(liste)</code> True dönen bir girdiden başlayıp hâlâ başarısız olan <b>daha küçük</b> bir liste bulana kadar şu adımları tekrarla; hiçbir adım işe yaramayınca sonucu döndür:</p><ol><li>Her i için i. elemanı silmeyi dene (baştan sona); başarısız kalıyorsa kabul et ve baştan başla.</li><li>Silme işe yaramazsa her elemanı sıfıra yaklaştırmayı dene: sırasıyla <code>0</code>, yarısı (<code>x // 2</code>, negatiflerde <code>-((-x) // 2)</code>) ve bir adım sıfıra yakını (pozitifte <code>x - 1</code>, negatifte <code>x + 1</code>); eleman değişiyor ve başarısız kalıyorsa kabul et ve baştan başla.</li></ol><p>Girdi listesini değiştirme.</p>',
      sol: 'def _yarim(x):\n    return x // 2 if x >= 0 else -((-x) // 2)\n\ndef kucult(girdi, basarisiz):\n    mevcut = list(girdi)\n    degisti = True\n    while degisti:\n        degisti = False\n        for i in range(len(mevcut)):\n            aday = mevcut[:i] + mevcut[i + 1:]\n            if basarisiz(aday):\n                mevcut, degisti = aday, True\n                break\n        if degisti:\n            continue\n        for i, x in enumerate(mevcut):\n            for yeni in (0, _yarim(x), x - 1 if x > 0 else x + 1):\n                if yeni != x:\n                    aday = mevcut[:i] + [yeni] + mevcut[i + 1:]\n                    if basarisiz(aday):\n                        mevcut, degisti = aday, True\n                        break\n            if degisti:\n                break\n    return mevcut\n',
      tests: 'toplam_100_ustu = lambda l: sum(l) > 100\ng = [37, 5, 80, -3, 12, 64]\ns = kucult(g, toplam_100_ustu)\nassert g == [37, 5, 80, -3, 12, 64], "Girdi listesi değiştirilmemeli"\nassert toplam_100_ustu(s), "Sonuç hâlâ başarısız olmalı"\nassert len(s) == 2, f"İki elemana kadar küçülmeli (tek eleman 100\'ü geçemez): {s}"\nassert sum(s) == 101, f"Değerler de sıfıra doğru küçülmeli; minimum toplam 101: {s}"\ntekrar_var = lambda l: len(l) != len(set(l))\nassert kucult([9, 4, 7, 4, 2], tekrar_var) == [4, 4], "Tekrar hatası iki eşit elemana inmeli: [4, 4] (tek elemanı değiştirmek tekrarı bozar)"\nnegatif_var = lambda l: any(x < 0 for x in l)\nassert kucult([5, -40, 3], negatif_var) == [-1], "Negatif sayı -1\'e kadar yaklaştırılmalı"\nassert kucult([], lambda l: True) == [], "Boş liste boş kalır"\n',
      hints: ['Dış döngü "bir şey değişti mi?" bayrağıyla döner; her başarılı küçültmede baştan başla.', 'Silme adayı: mevcut[:i] + mevcut[i+1:]. Değer adayı: aynı dilimlemeyle i. elemanı değiştir.', 'Adaylar: (0, _yarim(x), x - 1 if x > 0 else x + 1). Negatifte yarıya inerken -((-x) // 2) kullan; yeni == x ise denemeyi atla ki sonsuz döngü olmasın.'],
      why: 'Rastgele bulunan karşı örnek genellikle karmaşıktır ([37, 5, 80, -3, 12, 64]); küçültme onu hatanın özüne ([37, 64] ya da [4, 4] gibi) indirir ve hata ayıklamayı kolaylaştırır. "Değişiklik yoksa dur" koşulu algoritmanın sonlanmasını garanti eder.' },
    { t: 'code',
      id: 'test-ileri-13',
      stage: 'Mini proje',
      diff: 3,
      q: '<p><b>Ilgaz Bank havale servisi için test paketi.</b> Başlangıç kodunda <code>HavaleServisi</code> hazır. Kuralları:</p><ul><li><code>tutar &lt;= 0</code> → <code>ValueError</code>; gönderenin bakiyesi tutardan azsa → <code>YetersizBakiye</code> (bakiye tam tutara eşitse havale yapılır).</li><li>Saat 00:00–05:59 arasında ve tutar <b>50.000\'den büyükse</b> havale <code>"beklemede"</code> olur: para gönderenden düşer ama alıcıya geçmez. Diğer durumlarda <code>"tamam"</code>: alıcıya geçer.</li><li>Her başarılı havalede <code>bildirim.gonder(gonderen, mesaj)</code> tam bir kez çağrılır.</li></ul><p><code>HavaleTestleri(unittest.TestCase)</code> sınıfını tamamla. Servisi her zaman <code>SERVIS(...)</code> ile oluştur (doğrudan <code>HavaleServisi</code> yazma), saati sabit bir fonksiyonla ver, bildirim için <code>Mock</code> kullan. Gizli testler paketini önce doğru servisle (hepsi geçmeli), sonra 5 farklı <b>hatalı</b> servisle çalıştıracak; her hatalıda en az bir testin başarısız olması gerekiyor.</p>',
      start: 'import unittest\nfrom datetime import datetime\nfrom unittest.mock import Mock\n\nclass YetersizBakiye(Exception):\n    pass\n\nclass HavaleServisi:\n    def __init__(self, hesaplar, saat, bildirim):\n        self.hesaplar, self.saat, self.bildirim = hesaplar, saat, bildirim\n\n    def havale(self, gonderen, alici, tutar):\n        if tutar <= 0:\n            raise ValueError("tutar pozitif olmalı")\n        if self.hesaplar[gonderen] < tutar:\n            raise YetersizBakiye(gonderen)\n        self.hesaplar[gonderen] -= tutar\n        if self.saat().hour < 6 and tutar > 50_000:\n            durum = "beklemede"\n        else:\n            self.hesaplar[alici] += tutar\n            durum = "tamam"\n        self.bildirim.gonder(gonderen, f"{tutar} TL havale: {durum}")\n        return durum\n\nSERVIS = HavaleServisi   # gizli testler bunu hatalı sürümlerle değiştirecek\n\nOGLE = lambda: datetime(2026, 5, 4, 12, 0)\n\nclass HavaleTestleri(unittest.TestCase):\n    def setUp(self):\n        self.hesaplar = {"ayse": 100_000, "mehmet": 0}\n        self.bildirim = Mock()\n\n    def yap(self, saat=OGLE):\n        return SERVIS(self.hesaplar, saat, self.bildirim)\n\n    def test_basarili_havale(self):\n        durum = self.yap().havale("ayse", "mehmet", 1_000)\n        self.assertEqual(durum, "tamam")\n        # TODO: bakiyeleri doğrula\n\n    # TODO: sınır değer, gece kuralı, bildirim ve hata testleri ekle\n',
      sol: 'import unittest\nfrom datetime import datetime\nfrom unittest.mock import Mock\n\nclass YetersizBakiye(Exception):\n    pass\n\nclass HavaleServisi:\n    def __init__(self, hesaplar, saat, bildirim):\n        self.hesaplar, self.saat, self.bildirim = hesaplar, saat, bildirim\n\n    def havale(self, gonderen, alici, tutar):\n        if tutar <= 0:\n            raise ValueError("tutar pozitif olmalı")\n        if self.hesaplar[gonderen] < tutar:\n            raise YetersizBakiye(gonderen)\n        self.hesaplar[gonderen] -= tutar\n        if self.saat().hour < 6 and tutar > 50_000:\n            durum = "beklemede"\n        else:\n            self.hesaplar[alici] += tutar\n            durum = "tamam"\n        self.bildirim.gonder(gonderen, f"{tutar} TL havale: {durum}")\n        return durum\n\nSERVIS = HavaleServisi   # gizli testler bunu hatalı sürümlerle değiştirecek\n\nOGLE = lambda: datetime(2026, 5, 4, 12, 0)\n\ndef saat(h, m=0):\n    return lambda: datetime(2026, 5, 4, h, m)\n\nclass HavaleTestleri(unittest.TestCase):\n    def setUp(self):\n        self.hesaplar = {"ayse": 100_000, "mehmet": 0}\n        self.bildirim = Mock()\n\n    def yap(self, saat=OGLE):\n        return SERVIS(self.hesaplar, saat, self.bildirim)\n\n    def test_basarili_havale(self):\n        durum = self.yap().havale("ayse", "mehmet", 1_000)\n        self.assertEqual(durum, "tamam")\n        self.assertEqual(self.hesaplar, {"ayse": 99_000, "mehmet": 1_000})\n\n    def test_tum_bakiye_gonderilebilir(self):\n        self.hesaplar["ayse"] = 500\n        self.assertEqual(self.yap().havale("ayse", "mehmet", 500), "tamam")\n        self.assertEqual(self.hesaplar["ayse"], 0)\n\n    def test_yetersiz_bakiye(self):\n        with self.assertRaises(YetersizBakiye):\n            self.yap().havale("mehmet", "ayse", 1)\n        self.bildirim.gonder.assert_not_called()\n\n    def test_sifir_tutar(self):\n        with self.assertRaises(ValueError):\n            self.yap().havale("ayse", "mehmet", 0)\n\n    def test_gece_buyuk_tutar_beklemede(self):\n        durum = self.yap(saat(3)).havale("ayse", "mehmet", 60_000)\n        self.assertEqual(durum, "beklemede")\n        self.assertEqual(self.hesaplar, {"ayse": 40_000, "mehmet": 0})\n\n    def test_gece_sinir_saat_6(self):\n        self.assertEqual(self.yap(saat(6)).havale("ayse", "mehmet", 60_000), "tamam")\n\n    def test_gece_sinir_saat_5_59(self):\n        self.assertEqual(self.yap(saat(5, 59)).havale("ayse", "mehmet", 60_000), "beklemede")\n\n    def test_gece_sinir_tutar_50000(self):\n        self.assertEqual(self.yap(saat(2)).havale("ayse", "mehmet", 50_000), "tamam")\n\n    def test_bildirim(self):\n        self.yap().havale("ayse", "mehmet", 250)\n        self.bildirim.gonder.assert_called_once_with("ayse", "250 TL havale: tamam")\n',
      tests: 'import unittest\n\ndef calistir():\n    suite = unittest.TestLoader().loadTestsFromTestCase(HavaleTestleri)\n    sonuc = unittest.TestResult()\n    suite.run(sonuc)\n    return sonuc\n\nr = calistir()\nassert r.testsRun >= 5, f"En az 5 test bekleniyor, {r.testsRun} bulundu"\nassert r.wasSuccessful(), "Doğru serviste tüm testler geçmeli: " + "; ".join(str(t) + \' \' + m.strip().splitlines()[-1] for t, m in r.failures + r.errors)\n\nclass H1(HavaleServisi):          # bakiye tam eşitken reddediyor\n    def havale(self, g, a, t):\n        if t > 0 and self.hesaplar[g] == t:\n            raise YetersizBakiye(g)\n        return super().havale(g, a, t)\nclass H2(HavaleServisi):          # gece sınırı 6:59\'a kadar\n    def havale(self, g, a, t):\n        gercek = self.saat\n        self.saat = lambda: gercek().replace(hour=gercek().hour - 1) if gercek().hour == 6 else gercek()\n        try:\n            return super().havale(g, a, t)\n        finally:\n            self.saat = gercek\nclass H3(HavaleServisi):          # beklemede de alıcıya para geçiyor\n    def havale(self, g, a, t):\n        d = super().havale(g, a, t)\n        if d == "beklemede":\n            self.hesaplar[a] += t\n        return d\nclass H4(HavaleServisi):          # bildirim alıcıya gidiyor\n    def havale(self, g, a, t):\n        gercek = self.bildirim\n        class Ters:\n            def gonder(_, kisi, mesaj):\n                gercek.gonder(a if kisi == g else kisi, mesaj)\n        self.bildirim = Ters()\n        try:\n            return super().havale(g, a, t)\n        finally:\n            self.bildirim = gercek\nclass H5(HavaleServisi):          # 50.000 tam sınırda da bekletiyor\n    def havale(self, g, a, t):\n        if t == 50_000 and self.saat().hour < 6:\n            if self.hesaplar[g] < t:\n                raise YetersizBakiye(g)\n            self.hesaplar[g] -= t\n            self.bildirim.gonder(g, f"{t} TL havale: beklemede")\n            return "beklemede"\n        return super().havale(g, a, t)\n\ndogru = SERVIS\naciklama = {H1: "bakiye tam tutara eşitken reddeden", H2: "saat 6\'yı da gece sayan", H3: "beklemede iken alıcıya para geçiren", H4: "bildirimi alıcıya gönderen", H5: "tam 50.000\'i de bekleten"}\ntry:\n    for H, ad in aciklama.items():\n        SERVIS = H\n        assert not calistir().wasSuccessful(), f"Test paketin şu hatalı servisi yakalamadı: {ad}"\nfinally:\n    SERVIS = dogru\n',
      hints: ['Her kural için en az bir test yaz; özellikle sınırlar: bakiye == tutar, saat 6:00 ve 5:59, tutar tam 50.000.', 'Beklemede durumunda iki bakiyeyi de doğrula; bildirim için assert_called_once_with("ayse", ...) kullan.', 'Farklı saatler için küçük bir yardımcı: def saat(h, m=0): return lambda: datetime(2026, 5, 4, h, m).'],
      why: 'Bu mini proje, "testlerim yeşil" ile "testlerim hatayı yakalıyor" arasındaki farkı ölçtü: gizli hatalı sürümlerin her biri, ancak o kuralın sınırını hedefleyen bir testle yakalanabiliyordu. Enjekte edilen saat ve Mock bildirim sayesinde hiçbir test gerçek zamana ya da SMS servisine bağlı değil.' }
  ],
  faq: [
    { q: 'Mock mu kullanmalıyım, fake mi?',
      a: 'Durumu doğrulamak (sonunda ne kaydedildi?) için fake daha dayanıklıdır, çünkü gerçekleştirme değişse de davranış aynı kaldıkça test kırılmaz. Etkileşimin kendisi önemliyse (SMS tam bir kez gitti mi, ödeme servisi hangi tutarla çağrıldı?) mock kullan. Dış dünyaya yan etkisi olan sınırlarda mock, kendi bileşenlerin arasında fake tercih et.' },
    { q: 'patch mi, bağımlılık enjeksiyonu mu?',
      a: 'Yeni yazdığın kodda bağımlılık enjeksiyonu tercih et: test daha okunur olur ve patch hedefi tuzağı ortadan kalkar. patch, değiştiremediğin eski kodda ya da üçüncü taraf kütüphane içinde bir adı geçici değiştirmek için iyidir.' },
    { q: 'hypothesis\'i gerçek projede nasıl kullanırım?',
      a: '<code>pip install hypothesis</code> ile kur, testine <code>@given(...)</code> ekle ve pytest ile çalıştır. Strateji olarak <code>st.integers()</code>, <code>st.text()</code>, <code>st.lists(...)</code>, <code>st.builds(Siparis, ...)</code> kullanırsın. Bulunan karşı örnekler <code>.hypothesis</code> klasöründe saklanır ve sonraki çalıştırmada önce onlar denenir.' },
    { q: 'Kapsam yüzde kaç olmalı?',
      a: 'Tek bir sihirli sayı yok; çoğu ekip %80 civarında bir alt eşik koyar ve kritik modüllerde (ödeme, faiz) dal kapsamına ve mutasyon skoruna bakar. %100 satır kapsamı bile hatasız kod demek değildir; bu dersteki mutasyon örneği bunu gösterdi.' },
    { q: 'Uçtan uca testleri Python\'la nasıl yazarım?',
      a: 'Web arayüzü için Playwright (<code>pip install pytest-playwright</code>) yaygındır; API için ise test istemcisiyle (FastAPI TestClient, httpx) gerçek uygulamaya istek atarsın. Bunları az sayıda, kritik kullanıcı akışları için yaz; ayrıntıları birim testlerine bırak.' }
  ],
  mistakes: [
    { bad: 'with patch("kur.kur_getir", return_value=40.0):\n    rapor.doviz_raporu(100)',
      good: 'with patch("rapor.kur_getir", return_value=40.0):\n    rapor.doviz_raporu(100)',
      why: 'from-import edilen ad kullanıldığı modülde yaşar; tanımlandığı modülü yamalamak onu etkilemez.' },
    { bad: 'servis.side_effect = None\nservis.return_value = ConnectionError("kapalı")',
      good: 'servis.side_effect = ConnectionError("kapalı")',
      why: 'return_value istisnayı fırlatmaz, değer olarak döndürür; hata yolu hiç test edilmez.' },
    { bad: 'depo = Mock()\nSiparisServisi(depo).olustur(...)',
      good: 'depo = create_autospec(SiparisDepo, instance=True)\nSiparisServisi(depo).olustur(...)',
      why: 'Spec\'siz mock var olmayan metot çağrılarını da kabul eder; arayüz hatası testte değil üretimde ortaya çıkar.' },
    { bad: 'def test_kupon():\n    assert kupon_uret().startswith(datetime.now().strftime("%y%m%d"))',
      good: 'def test_kupon():\n    u = KuponUretici(saat=lambda: datetime(2026, 3, 13), rng=random.Random(1))\n    assert u.uret(5).startswith("AM260313")',
      why: 'Gerçek saate bağlı test gece yarısı geçişinde ya da farklı saat diliminde rastgele kırılır (flaky); saati enjekte et.' },
    { bad: 'VARSAYILAN = {"kalemler": []}\ndef siparis():\n    return VARSAYILAN',
      good: 'def siparis():\n    return copy.deepcopy(VARSAYILAN)',
      why: 'Aynı sözlüğü döndüren fabrika, bir testin değişikliğini diğer testlere sızdırır; testler sıraya bağımlı hâle gelir.' }
  ]
});
})(window);
