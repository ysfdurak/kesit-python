/* ───────────────────────── 6. proje-orta ───────────────────────── */
{
  id: 'proje-orta',
  lv: 'orta',
  mod: 'Bitirme',
  min: 60,
  title: 'Orta bitirme projesi: Ilgaz Bank işlem analizi',
  sum: 'Orta seviyede öğrendiğin her şeyi tek projede birleştirirsin: dataclass ile işlem modeli, CSV ayrıştırma, kategori toplamları, çok koşullu şüpheli işlem kuralı, JSON rapor ve unittest ile doğrulama.',
  goals: [
    'dataclass ile alan tipleri belirli bir Transaction modeli kurup CSV metninden nesne listesi üretebilirim.',
    'Kategoriye göre toplamları Decimal ile hatasız hesaplayabilirim.',
    'Gece saati, yüksek tutar ve kısa sürede tekrarlayan işlem kurallarını birleştirip şüpheli işlemleri işaretleyebilirim.',
    'Analiz sonucunu JSON rapor olarak üretebilir ve JSON\'a uygun olmayan tipleri dönüştürebilirim.',
    'Projenin parçalarını unittest ile test edip bütünü tek bir akışta çalıştırabilirim.'
  ],
  body: `
<h2>Proje tanımı</h2>
<p>Ilgaz Bank'ın kart operasyon ekibi senden küçük ama gerçekçi bir araç istiyor: günlük kart işlemlerini okuyacak, kategori bazında harcamayı özetleyecek, şüpheli görünen işlemleri işaretleyecek ve sonucu JSON raporu olarak verecek. Ekip, kuralların test edilmiş olmasını şart koşuyor; çünkü yanlış pozitif bir müşterinin kartını gereksiz yere bloke eder, yanlış negatif ise dolandırıcılığı kaçırır.</p>
<p>Bu ders diğerlerinden farklı: yeni kavram öğretmez, öğrendiklerini birleştirir. Alıştırmalar birbirini tamamlayan altı parçadır; her parçada bir önceki parçanın fonksiyonu hazır gelir. Aşağıda her parçanın kuramı ve örnek çıktısı var; alıştırmalarda kendi sürümünü yazacaksın.</p>
<div class="tbl-wrap"><table>
<tr><th>Parça</th><th>Ne yapar</th><th>Kullandığın dersler</th></tr>
<tr><td>1. Model</td><td>Transaction dataclass'ı ve CSV'den okuma</td><td>dataclass-typing, json-csv, tarih-saat, decimal</td></tr>
<tr><td>2. Özet</td><td>Kategoriye göre toplam</td><td>collections, kapsamli-ifadeler</td></tr>
<tr><td>3. Kural A-B</td><td>Gece saati ve yüksek tutar</td><td>tarih-saat, fonksiyonel</td></tr>
<tr><td>4. Kural C</td><td>Aynı kartta 10 dakikada 3 işlem</td><td>iteratorler, tarih-saat, sıralama</td></tr>
<tr><td>5. Rapor</td><td>JSON çıktı, tip dönüşümü</td><td>json-csv, decimal</td></tr>
<tr><td>6. Test</td><td>unittest ile kural testleri</td><td>test-yazma</td></tr>
</table></div>

<h2>Parça 1: Veri modeli ve CSV okuma</h2>
<p>Her işlem beş alan taşır: işlem kimliği, kart numarası (maskeli), zaman, tutar, kategori. Tutar para olduğu için <code>Decimal</code>, zaman <code>datetime</code>. <code>frozen=True</code> ile işlem nesnesi değiştirilemez olur: analiz sırasında kimse bir tutarı yanlışlıkla güncelleyemez. CSV metni <code>csv.DictReader</code> ile okunur, her satır <code>Transaction</code>'a dönüştürülür.</p>
<pre class="py">import csv
import io
from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal

@dataclass(frozen=True)
class Transaction:
    id: str
    kart: str
    zaman: datetime
    tutar: Decimal
    kategori: str

VERI = """id,kart,zaman,tutar,kategori
T1,****1111,2024-03-15 09:12:00,245.90,market
T2,****1111,2024-03-15 13:40:00,1200.00,elektronik
T3,****2222,2024-03-15 02:15:00,8500.00,kuyumcu
T4,****3333,2024-03-15 23:50:00,60.00,yakit
T5,****3333,2024-03-15 23:54:00,75.50,yakit
T6,****3333,2024-03-15 23:58:00,90.00,market
T7,****2222,2024-03-15 18:00:00,430.00,market
"""

def csv_oku(metin: str) -&gt; list[Transaction]:
    islemler = []
    for satir in csv.DictReader(io.StringIO(metin)):
        islemler.append(Transaction(
            id=satir["id"],
            kart=satir["kart"],
            zaman=datetime.strptime(satir["zaman"], "%Y-%m-%d %H:%M:%S"),
            tutar=Decimal(satir["tutar"]),
            kategori=satir["kategori"],
        ))
    return islemler

islemler = csv_oku(VERI)
print(len(islemler), "işlem okundu")
print(islemler[2])
print("tutar türü:", type(islemler[0].tutar).__name__, "| saat:", islemler[2].zaman.hour)</pre>
<div class="tip"><b>Dönüşüm tek yerde</b>Metinden tipe dönüşüm yalnızca csv_oku içinde yapılır. Sonraki hiçbir parça "acaba tutar string mi" diye düşünmez; bu, katmanlı tasarımın en sade halidir.</div>

<h2>Parça 2: Kategoriye göre toplam</h2>
<p>Klasik gruplama: sözlükte biriktir. <code>defaultdict(Decimal)</code> başlangıç değeri olarak <code>Decimal(0)</code> verir, böylece <code>+=</code> doğrudan çalışır. Çıktıyı toplam tutara göre azalan sıralamak raporun okunurluğunu artırır.</p>
<pre class="py">from collections import defaultdict
from decimal import Decimal

# Parça 1'deki islemler listesini yeniden kuralım (kısa sürüm)
from dataclasses import dataclass
from datetime import datetime

@dataclass(frozen=True)
class Transaction:
    id: str
    kart: str
    zaman: datetime
    tutar: Decimal
    kategori: str

islemler = [
    Transaction("T1", "****1111", datetime(2024, 3, 15, 9, 12), Decimal("245.90"), "market"),
    Transaction("T2", "****1111", datetime(2024, 3, 15, 13, 40), Decimal("1200.00"), "elektronik"),
    Transaction("T3", "****2222", datetime(2024, 3, 15, 2, 15), Decimal("8500.00"), "kuyumcu"),
    Transaction("T7", "****2222", datetime(2024, 3, 15, 18, 0), Decimal("430.00"), "market"),
]

def kategori_toplam(islemler: list[Transaction]) -&gt; dict[str, Decimal]:
    toplam: dict[str, Decimal] = defaultdict(Decimal)
    for t in islemler:
        toplam[t.kategori] += t.tutar
    return dict(sorted(toplam.items(), key=lambda kv: kv[1], reverse=True))

for kategori, tutar in kategori_toplam(islemler).items():
    print(f"{kategori:12} {tutar:&gt;10}")</pre>

<h2>Parça 3 ve 4: Şüpheli işlem kuralları</h2>
<p>Operasyon ekibinin üç kuralı var; bir işlem bunlardan <b>en az birine</b> uyarsa şüpheli sayılır ve hangi kurallara takıldığı raporda görünür:</p>
<ul>
<li><b>gece:</b> işlem saati 23:00 ve sonrası ya da 06:00'dan önce.</li>
<li><b>yuksek_tutar:</b> tutar 5000 TL ve üzeri.</li>
<li><b>sik_islem:</b> aynı kartta, herhangi bir 10 dakikalık pencerede 3 ya da daha fazla işlem; pencereye giren her işlem işaretlenir.</li>
</ul>
<p>İlk iki kural tek işleme bakar; birer satırlık saf fonksiyonlardır. Üçüncü kural işlemler arası ilişkiye bakar: karta göre grupla, zamana göre sırala, her işlem için "bu işlemle başlayan 10 dakikalık pencerede kaç işlem var?" diye say; 3 ve üstüyse penceredeki tüm işlemleri işaretle.</p>
<pre class="py">from collections import defaultdict
from dataclasses import dataclass
from datetime import datetime, timedelta
from decimal import Decimal

@dataclass(frozen=True)
class Transaction:
    id: str
    kart: str
    zaman: datetime
    tutar: Decimal
    kategori: str

islemler = [
    Transaction("T3", "****2222", datetime(2024, 3, 15, 2, 15), Decimal("8500.00"), "kuyumcu"),
    Transaction("T4", "****3333", datetime(2024, 3, 15, 23, 50), Decimal("60.00"), "yakit"),
    Transaction("T5", "****3333", datetime(2024, 3, 15, 23, 54), Decimal("75.50"), "yakit"),
    Transaction("T6", "****3333", datetime(2024, 3, 15, 23, 58), Decimal("90.00"), "market"),
    Transaction("T7", "****2222", datetime(2024, 3, 15, 18, 0), Decimal("430.00"), "market"),
]

def gece_mi(t: Transaction) -&gt; bool:
    return t.zaman.hour &gt;= 23 or t.zaman.hour &lt; 6

def yuksek_mi(t: Transaction, esik: Decimal = Decimal("5000")) -&gt; bool:
    return t.tutar &gt;= esik

def sik_islem_idleri(islemler: list[Transaction], pencere_dk: int = 10, esik: int = 3) -&gt; set[str]:
    karta_gore: dict[str, list[Transaction]] = defaultdict(list)
    for t in islemler:
        karta_gore[t.kart].append(t)
    supheli: set[str] = set()
    pencere = timedelta(minutes=pencere_dk)
    for grup in karta_gore.values():
        grup.sort(key=lambda t: t.zaman)
        for i, baslangic in enumerate(grup):
            icindekiler = [t for t in grup[i:] if t.zaman - baslangic.zaman &lt;= pencere]
            if len(icindekiler) &gt;= esik:
                supheli.update(t.id for t in icindekiler)
    return supheli

def supheli_isaretle(islemler: list[Transaction]) -&gt; dict[str, list[str]]:
    sik = sik_islem_idleri(islemler)
    sonuc = {}
    for t in islemler:
        nedenler = []
        if gece_mi(t): nedenler.append("gece")
        if yuksek_mi(t): nedenler.append("yuksek_tutar")
        if t.id in sik: nedenler.append("sik_islem")
        if nedenler:
            sonuc[t.id] = nedenler
    return sonuc

for tid, nedenler in supheli_isaretle(islemler).items():
    print(tid, "-&gt;", ", ".join(nedenler))</pre>
<p>T3 iki kurala birden takıldı (gece ve yüksek tutar); T4-T5-T6 ise hem gece hem sık işlem. T7 temiz. Pencere mantığında <code>grup[i:]</code> dilimi yalnızca ileriye bakar; sıralı liste sayesinde geçmişe bakmaya gerek yoktur.</p>
<div class="warn"><b>Sınır değerleri test et</b>23:00 tam saati gece mi? 5000.00 tam tutar yüksek mi? 10 dakika 0 saniye pencerede mi? Kuralları yazarken <code>&gt;=</code> ile <code>&gt;</code> arasındaki farkı iş birimine sor ve testte sabitle. Bu projede üç sınır da dahil (&gt;=) kabul edildi.</div>

<h2>Parça 5: JSON rapor</h2>
<p>Rapor üç bölüm taşır: genel özet (işlem sayısı, toplam tutar), kategori toplamları ve şüpheli işlemler. <code>json.dumps</code> Decimal ve datetime'ı tanımaz; ya rapor sözlüğünü kurarken metne çevirirsin ya da <code>default=</code> parametresine bir dönüştürücü verirsin. Para alanlarını <b>metin</b> olarak yazmak ("8500.00") float'a çevirmekten güvenlidir: alıcı sistem tekrar Decimal'e dönebilir.</p>
<pre class="py">import json
from datetime import datetime
from decimal import Decimal

def json_uyumlu(nesne):
    if isinstance(nesne, Decimal):
        return str(nesne)
    if isinstance(nesne, datetime):
        return nesne.isoformat()
    raise TypeError(f"JSON'a çevrilemez: {type(nesne).__name__}")

rapor = {
    "tarih": datetime(2024, 3, 15).date().isoformat(),
    "islem_sayisi": 7,
    "toplam_tutar": Decimal("10601.40"),
    "kategori_toplam": {"kuyumcu": Decimal("8500.00"), "elektronik": Decimal("1200.00")},
    "supheli": [
        {"id": "T3", "kart": "****2222", "zaman": datetime(2024, 3, 15, 2, 15), "tutar": Decimal("8500.00"), "nedenler": ["gece", "yuksek_tutar"]},
    ],
}
metin = json.dumps(rapor, default=json_uyumlu, ensure_ascii=False, indent=2)
print(metin)
geri = json.loads(metin)
print("geri okunan toplam:", Decimal(geri["toplam_tutar"]) + Decimal("0.60"))</pre>

<h2>Parça 6: Testler</h2>
<p>Kurallar test edilmeden teslim edilmez. Her kural için en az bir pozitif, bir negatif ve bir sınır testi yazarsın. Test verisi küçük ve elle hesaplanabilir olmalı; büyük CSV'yi teste sokma. Aşağıdaki örnek yalnızca gece kuralını test eder; alıştırmada üç kuralı birden yazacaksın.</p>
<pre class="py">import io
import unittest
from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal

@dataclass(frozen=True)
class Transaction:
    id: str
    kart: str
    zaman: datetime
    tutar: Decimal
    kategori: str

def gece_mi(t):
    return t.zaman.hour &gt;= 23 or t.zaman.hour &lt; 6

def islem(saat, dakika=0, tutar="100"):
    return Transaction("X", "****0000", datetime(2024, 3, 15, saat, dakika), Decimal(tutar), "market")

class GeceKuraliTest(unittest.TestCase):
    def test_gece_yarisi_sonrasi(self):
        self.assertTrue(gece_mi(islem(2, 15)))
    def test_sinir_23_dahil(self):
        self.assertTrue(gece_mi(islem(23, 0)))
    def test_sinir_6_haric(self):
        self.assertFalse(gece_mi(islem(6, 0)))
    def test_ogle_degil(self):
        self.assertFalse(gece_mi(islem(13, 40)))

suite = unittest.defaultTestLoader.loadTestsFromTestCase(GeceKuraliTest)
adlar = [t.id().split(".")[-1] for t in suite]
sonuc = unittest.TextTestRunner(stream=io.StringIO(), verbosity=0).run(suite)
print(len(adlar), "test:", adlar)
print("başarılı:", sonuc.wasSuccessful())</pre>
<p><code>islem(...)</code> yardımcı fonksiyonu test verisini tek satırda kurar; test gövdeleri yalnızca kuralı konuşur. Bu küçük "fabrika" kalıbı, test dosyalarını okunur tutmanın en ucuz yoludur.</p>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Bu projeyi üretime taşısaydın</h3>
<p>Gerçek bir kart izleme sistemi aynı iskeleti büyütür. Kurallar bir listede tutulur: her kural <code>(ad, fonksiyon)</code> çifti olur ve <code>supheli_isaretle</code> listeyi dolaşır; yeni kural eklemek if satırı eklemek değil, listeye eleman eklemek haline gelir. Eşikler (5000 TL, 10 dakika, 3 işlem) koda değil yapılandırmaya yazılır; operasyon ekibi kodu değiştirmeden ayarı değiştirir. Sık işlem kuralı milyonlarca işlemde O(n²)'ye yaklaşır; sıralı listede iki işaretçiyle (sliding window) tek geçişe iner, İleri seviyedeki performans dersinin konusu.</p>
<p>Veri CSV'den değil veritabanından gelir: sqlite3 dersindeki iş bölümü burada da geçerli; kart ve tarih aralığı filtresini SQL yapar, kuralları Python uygular. Rapor JSON olarak bir kuyruk ya da API'ye gider, operasyon ekibi panelde görür. Testler CI'da her commit'te koşar; bir kuralın eşiği değişince önce test güncellenir. Bu dersteki altı parça, o sistemin küçültülmüş ama eksiksiz bir modelidir: model, hesap, kural, rapor, test. Bir mülakatta "orta seviye Python projesi anlat" dendiğinde anlatacağın şey tam olarak bu.</p>
</section>
`,
  ex: [
    { t: 'code', id: 'proje-orta-1',
      q: '<p><b>Parça 1.</b> <code>Transaction</code> dataclass\'ını (<code>frozen=True</code>; alanlar: <code>id: str</code>, <code>kart: str</code>, <code>zaman: datetime</code>, <code>tutar: Decimal</code>, <code>kategori: str</code>) ve <code>csv_oku(metin)</code> fonksiyonunu yaz. CSV başlığı <code>id,kart,zaman,tutar,kategori</code>; zaman biçimi <code>%Y-%m-%d %H:%M:%S</code>. Tutar <code>Decimal</code>\'e (metinden), zaman <code>datetime</code>\'a çevrilsin. <code>Transaction</code> listesi döndür.</p>',
      start: 'import csv\nimport io\nfrom dataclasses import dataclass\nfrom datetime import datetime\nfrom decimal import Decimal\n\n@dataclass(frozen=True)\nclass Transaction:\n    pass\n\ndef csv_oku(metin):\n    pass\n',
      sol: 'import csv\nimport io\nfrom dataclasses import dataclass\nfrom datetime import datetime\nfrom decimal import Decimal\n\n@dataclass(frozen=True)\nclass Transaction:\n    id: str\n    kart: str\n    zaman: datetime\n    tutar: Decimal\n    kategori: str\n\ndef csv_oku(metin):\n    islemler = []\n    for satir in csv.DictReader(io.StringIO(metin)):\n        islemler.append(Transaction(\n            id=satir["id"],\n            kart=satir["kart"],\n            zaman=datetime.strptime(satir["zaman"], "%Y-%m-%d %H:%M:%S"),\n            tutar=Decimal(satir["tutar"]),\n            kategori=satir["kategori"],\n        ))\n    return islemler\n',
      tests: 'import dataclasses\nfrom datetime import datetime\nfrom decimal import Decimal\nveri = "id,kart,zaman,tutar,kategori\\nT1,****1111,2024-03-15 09:12:00,245.90,market\\nT3,****2222,2024-03-15 02:15:00,8500.00,kuyumcu\\n"\nassert dataclasses.is_dataclass(Transaction), "Transaction bir dataclass olmalı"\nalanlar = [f.name for f in dataclasses.fields(Transaction)]\nassert alanlar == ["id", "kart", "zaman", "tutar", "kategori"], "Alan sırası id, kart, zaman, tutar, kategori olmalı"\nr = csv_oku(veri)\nassert len(r) == 2, "2 işlem okunmalı"\nassert r[0].id == "T1" and r[0].kart == "****1111" and r[0].kategori == "market", "T1 alanları doğru olmalı"\nassert r[0].zaman == datetime(2024, 3, 15, 9, 12, 0), "zaman datetime\'a çevrilmeli"\nassert isinstance(r[1].tutar, Decimal) and r[1].tutar == Decimal("8500.00"), "tutar Decimal olmalı"\ntry:\n    r[0].tutar = Decimal("1")\n    assert False, "frozen=True: alan değiştirilememeli"\nexcept dataclasses.FrozenInstanceError:\n    pass\nassert csv_oku("id,kart,zaman,tutar,kategori\\n") == [], "Yalnızca başlıkta boş liste"\n',
      hints: ['@dataclass(frozen=True) ve beş alanı tip ipucuyla sırayla yaz.', 'datetime.strptime(metin, "%Y-%m-%d %H:%M:%S"); Decimal(satir["tutar"])'],
      why: 'frozen dataclass değişmez bir kayıt tipi verir; dönüşümler yalnızca okuma katmanında yapılır, sonraki parçalar tipli nesnelerle çalışır.' },

    { t: 'code', id: 'proje-orta-2',
      q: '<p><b>Parça 2.</b> <code>Transaction</code> hazır. <code>kategori_toplam(islemler)</code> fonksiyonunu yaz: kategori → toplam tutar (<code>Decimal</code>) sözlüğü döndürsün; sözlük toplam tutara göre <b>azalan</b> sırada olsun (eşit tutarlarda kategori adına göre artan). Ayrıca <code>genel_ozet(islemler)</code>: <code>{"islem_sayisi": int, "toplam_tutar": Decimal, "kart_sayisi": int}</code> döndürsün (kart_sayisi farklı kart adedi).</p>',
      start: 'from collections import defaultdict\nfrom dataclasses import dataclass\nfrom datetime import datetime\nfrom decimal import Decimal\n\n@dataclass(frozen=True)\nclass Transaction:\n    id: str\n    kart: str\n    zaman: datetime\n    tutar: Decimal\n    kategori: str\n\ndef kategori_toplam(islemler):\n    pass\n\ndef genel_ozet(islemler):\n    pass\n',
      sol: 'from collections import defaultdict\nfrom dataclasses import dataclass\nfrom datetime import datetime\nfrom decimal import Decimal\n\n@dataclass(frozen=True)\nclass Transaction:\n    id: str\n    kart: str\n    zaman: datetime\n    tutar: Decimal\n    kategori: str\n\ndef kategori_toplam(islemler):\n    toplam = defaultdict(Decimal)\n    for t in islemler:\n        toplam[t.kategori] += t.tutar\n    return dict(sorted(toplam.items(), key=lambda kv: (-kv[1], kv[0])))\n\ndef genel_ozet(islemler):\n    return {\n        "islem_sayisi": len(islemler),\n        "toplam_tutar": sum((t.tutar for t in islemler), Decimal(0)),\n        "kart_sayisi": len({t.kart for t in islemler}),\n    }\n',
      tests: 'from datetime import datetime\nfrom decimal import Decimal\ndef T(i, kart, saat, tutar, kat):\n    return Transaction(i, kart, datetime(2024, 3, 15, saat), Decimal(tutar), kat)\nislemler = [T("T1", "****1111", 9, "245.90", "market"), T("T2", "****1111", 13, "1200.00", "elektronik"), T("T3", "****2222", 2, "8500.00", "kuyumcu"), T("T7", "****2222", 18, "430.00", "market"), T("T8", "****3333", 10, "1200.00", "yakit")]\nkt = kategori_toplam(islemler)\nassert list(kt) == ["kuyumcu", "elektronik", "yakit", "market"], "Azalan tutar, eşitlikte ad sırası: kuyumcu, elektronik, yakit, market"\nassert kt["market"] == Decimal("675.90") and isinstance(kt["market"], Decimal), "market toplamı Decimal 675.90"\no = genel_ozet(islemler)\nassert o["islem_sayisi"] == 5, "5 işlem"\nassert o["toplam_tutar"] == Decimal("11575.90") and isinstance(o["toplam_tutar"], Decimal), "Toplam Decimal 11575.90"\nassert o["kart_sayisi"] == 3, "3 farklı kart"\nassert genel_ozet([]) == {"islem_sayisi": 0, "toplam_tutar": Decimal(0), "kart_sayisi": 0}, "Boş listede sıfırlar; toplam Decimal(0) olmalı"\n',
      hints: ['defaultdict(Decimal) ile biriktir; sorted(..., key=lambda kv: (-kv[1], kv[0]))', 'sum(üreteç, Decimal(0)) başlangıç değeri verilmezse boş listede int 0 döner.'],
      why: 'Sıralama anahtarı (-tutar, ad) ikili ölçütü tek seferde verir; sum\'a Decimal(0) başlangıcı tipin her durumda Decimal kalmasını sağlar.' },

    { t: 'code', id: 'proje-orta-3',
      q: '<p><b>Parça 3.</b> İki saf kural fonksiyonu yaz. <code>gece_mi(t)</code>: işlem saati 23 ve üzeri ya da 6\'dan küçükse True. <code>yuksek_mi(t, esik=Decimal("5000"))</code>: tutar eşiğe eşit ya da büyükse True. Sonra <code>kurallari_uygula(t, kurallar)</code>: <code>kurallar</code> <code>[("gece", gece_mi), ("yuksek_tutar", yuksek_mi)]</code> gibi (ad, fonksiyon) çiftleridir; işleme uyan kuralların adlarını sırayla liste olarak döndürsün.</p>',
      start: 'from dataclasses import dataclass\nfrom datetime import datetime\nfrom decimal import Decimal\n\n@dataclass(frozen=True)\nclass Transaction:\n    id: str\n    kart: str\n    zaman: datetime\n    tutar: Decimal\n    kategori: str\n\ndef gece_mi(t):\n    pass\n\ndef yuksek_mi(t, esik=Decimal("5000")):\n    pass\n\ndef kurallari_uygula(t, kurallar):\n    pass\n',
      sol: 'from dataclasses import dataclass\nfrom datetime import datetime\nfrom decimal import Decimal\n\n@dataclass(frozen=True)\nclass Transaction:\n    id: str\n    kart: str\n    zaman: datetime\n    tutar: Decimal\n    kategori: str\n\ndef gece_mi(t):\n    return t.zaman.hour >= 23 or t.zaman.hour < 6\n\ndef yuksek_mi(t, esik=Decimal("5000")):\n    return t.tutar >= esik\n\ndef kurallari_uygula(t, kurallar):\n    return [ad for ad, fn in kurallar if fn(t)]\n',
      tests: 'from datetime import datetime\nfrom decimal import Decimal\ndef T(saat, dakika=0, tutar="100"):\n    return Transaction("X", "****0000", datetime(2024, 3, 15, saat, dakika), Decimal(tutar), "market")\nassert gece_mi(T(2, 15)) is True, "02:15 gece"\nassert gece_mi(T(23, 0)) is True, "23:00 sınırı dahil"\nassert gece_mi(T(5, 59)) is True, "05:59 gece"\nassert gece_mi(T(6, 0)) is False, "06:00 gece değil"\nassert gece_mi(T(13, 40)) is False, "13:40 gece değil"\nassert yuksek_mi(T(12, tutar="5000.00")) is True, "5000 sınırı dahil"\nassert yuksek_mi(T(12, tutar="4999.99")) is False, "4999.99 yüksek değil"\nassert yuksek_mi(T(12, tutar="1000"), esik=Decimal("999")) is True, "esik parametresi kullanılmalı"\nkurallar = [("gece", gece_mi), ("yuksek_tutar", yuksek_mi)]\nassert kurallari_uygula(T(2, tutar="8500"), kurallar) == ["gece", "yuksek_tutar"], "İkisine de uyan"\nassert kurallari_uygula(T(12, tutar="8500"), kurallar) == ["yuksek_tutar"], "Yalnız yüksek"\nassert kurallari_uygula(T(12), kurallar) == [], "Hiçbirine uymayan boş liste"\n',
      hints: ['t.zaman.hour >= 23 or t.zaman.hour < 6', '[ad for ad, fn in kurallar if fn(t)]'],
      why: 'Kurallar saf fonksiyon olunca tek tek test edilir; (ad, fonksiyon) listesi yeni kural eklemeyi if eklemekten ayırır.' },

    { t: 'code', id: 'proje-orta-4',
      q: '<p><b>Parça 4.</b> <code>sik_islem_idleri(islemler, pencere_dk=10, esik=3)</code> fonksiyonunu yaz. İşlemleri karta göre grupla, her grubu zamana göre sırala. Her işlem için, o işlemle başlayan ve <code>pencere_dk</code> dakika süren (sınır dahil) pencereye giren işlemleri say; sayı <code>esik</code> ve üzeriyse penceredeki <b>tüm</b> işlemlerin id\'lerini sonuç kümesine ekle. <code>set</code> döndür.</p>',
      start: 'from collections import defaultdict\nfrom dataclasses import dataclass\nfrom datetime import datetime, timedelta\nfrom decimal import Decimal\n\n@dataclass(frozen=True)\nclass Transaction:\n    id: str\n    kart: str\n    zaman: datetime\n    tutar: Decimal\n    kategori: str\n\ndef sik_islem_idleri(islemler, pencere_dk=10, esik=3):\n    pass\n',
      sol: 'from collections import defaultdict\nfrom dataclasses import dataclass\nfrom datetime import datetime, timedelta\nfrom decimal import Decimal\n\n@dataclass(frozen=True)\nclass Transaction:\n    id: str\n    kart: str\n    zaman: datetime\n    tutar: Decimal\n    kategori: str\n\ndef sik_islem_idleri(islemler, pencere_dk=10, esik=3):\n    karta_gore = defaultdict(list)\n    for t in islemler:\n        karta_gore[t.kart].append(t)\n    pencere = timedelta(minutes=pencere_dk)\n    supheli = set()\n    for grup in karta_gore.values():\n        grup.sort(key=lambda t: t.zaman)\n        for i, bas in enumerate(grup):\n            icinde = [t for t in grup[i:] if t.zaman - bas.zaman <= pencere]\n            if len(icinde) >= esik:\n                supheli.update(t.id for t in icinde)\n    return supheli\n',
      tests: 'from datetime import datetime\nfrom decimal import Decimal\ndef T(i, kart, saat, dk):\n    return Transaction(i, kart, datetime(2024, 3, 15, saat, dk), Decimal("50"), "yakit")\nislemler = [T("T6", "****3333", 23, 58), T("T4", "****3333", 23, 50), T("T5", "****3333", 23, 54), T("T1", "****1111", 9, 0), T("T2", "****1111", 9, 5), T("T9", "****1111", 9, 30)]\nr = sik_islem_idleri(islemler)\nassert isinstance(r, set), "set dönmeli"\nassert r == {"T4", "T5", "T6"}, "3333 kartında 10 dk içinde 3 işlem: T4, T5, T6 (sırasız girdi sıralanmalı)"\nassert "T1" not in r and "T9" not in r, "1111 kartında 10 dk içinde yalnızca 2 işlem var"\nsinir = [T("A", "****5", 10, 0), T("B", "****5", 10, 4), T("C", "****5", 10, 10)]\nassert sik_islem_idleri(sinir) == {"A", "B", "C"}, "Tam 10 dakika sınırı dahil"\nassert sik_islem_idleri(sinir + [T("D", "****5", 10, 11)], pencere_dk=5) == set(), "5 dk pencerede 3 işlem yok"\nassert sik_islem_idleri(sinir, esik=4) == set(), "esik 4 iken 3 işlem yetmez"\nassert sik_islem_idleri([]) == set(), "Boş listede boş küme"\n',
      hints: ['defaultdict(list) ile karta göre grupla, grup.sort(key=lambda t: t.zaman).', 'grup[i:] dilimi ileriye bakar; t.zaman - bas.zaman <= timedelta(minutes=pencere_dk)'],
      why: 'Sıralı grup üzerinde her işlemden ileriye bakan pencere, aynı karttaki yoğunluğu yakalar; set kullanmak aynı işlemin birden çok pencerede tekrar işaretlenmesini sorun olmaktan çıkarır.' },

    { t: 'code', id: 'proje-orta-5',
      q: '<p><b>Parça 5.</b> Önceki parçaların fonksiyonları hazır. <code>rapor_uret(islemler)</code> fonksiyonunu yaz: şu yapıda bir sözlük kurup <code>json.dumps(..., ensure_ascii=False, default=json_uyumlu)</code> ile JSON <b>metni</b> döndürsün. Yapı: <code>{"ozet": genel_ozet sonucu, "kategori_toplam": {...}, "supheli": [{"id", "kart", "zaman", "tutar", "nedenler"}, ...]}</code>. Şüpheli listesi işlem id\'sine göre sıralı; nedenler sırası <code>gece, yuksek_tutar, sik_islem</code>. <code>json_uyumlu(nesne)</code> fonksiyonunu da yaz: <code>Decimal</code> → <code>str</code>, <code>datetime</code> → <code>isoformat()</code>, diğerleri <code>TypeError</code>.</p>',
      start: 'import json\nfrom collections import defaultdict\nfrom dataclasses import dataclass\nfrom datetime import datetime, timedelta\nfrom decimal import Decimal\n\n@dataclass(frozen=True)\nclass Transaction:\n    id: str\n    kart: str\n    zaman: datetime\n    tutar: Decimal\n    kategori: str\n\ndef kategori_toplam(islemler):\n    toplam = defaultdict(Decimal)\n    for t in islemler:\n        toplam[t.kategori] += t.tutar\n    return dict(sorted(toplam.items(), key=lambda kv: (-kv[1], kv[0])))\n\ndef genel_ozet(islemler):\n    return {"islem_sayisi": len(islemler), "toplam_tutar": sum((t.tutar for t in islemler), Decimal(0)), "kart_sayisi": len({t.kart for t in islemler})}\n\ndef gece_mi(t):\n    return t.zaman.hour >= 23 or t.zaman.hour < 6\n\ndef yuksek_mi(t, esik=Decimal("5000")):\n    return t.tutar >= esik\n\ndef sik_islem_idleri(islemler, pencere_dk=10, esik=3):\n    karta_gore = defaultdict(list)\n    for t in islemler:\n        karta_gore[t.kart].append(t)\n    pencere = timedelta(minutes=pencere_dk)\n    supheli = set()\n    for grup in karta_gore.values():\n        grup.sort(key=lambda t: t.zaman)\n        for i, bas in enumerate(grup):\n            icinde = [t for t in grup[i:] if t.zaman - bas.zaman <= pencere]\n            if len(icinde) >= esik:\n                supheli.update(t.id for t in icinde)\n    return supheli\n\ndef json_uyumlu(nesne):\n    pass\n\ndef rapor_uret(islemler):\n    pass\n',
      sol: 'import json\nfrom collections import defaultdict\nfrom dataclasses import dataclass\nfrom datetime import datetime, timedelta\nfrom decimal import Decimal\n\n@dataclass(frozen=True)\nclass Transaction:\n    id: str\n    kart: str\n    zaman: datetime\n    tutar: Decimal\n    kategori: str\n\ndef kategori_toplam(islemler):\n    toplam = defaultdict(Decimal)\n    for t in islemler:\n        toplam[t.kategori] += t.tutar\n    return dict(sorted(toplam.items(), key=lambda kv: (-kv[1], kv[0])))\n\ndef genel_ozet(islemler):\n    return {"islem_sayisi": len(islemler), "toplam_tutar": sum((t.tutar for t in islemler), Decimal(0)), "kart_sayisi": len({t.kart for t in islemler})}\n\ndef gece_mi(t):\n    return t.zaman.hour >= 23 or t.zaman.hour < 6\n\ndef yuksek_mi(t, esik=Decimal("5000")):\n    return t.tutar >= esik\n\ndef sik_islem_idleri(islemler, pencere_dk=10, esik=3):\n    karta_gore = defaultdict(list)\n    for t in islemler:\n        karta_gore[t.kart].append(t)\n    pencere = timedelta(minutes=pencere_dk)\n    supheli = set()\n    for grup in karta_gore.values():\n        grup.sort(key=lambda t: t.zaman)\n        for i, bas in enumerate(grup):\n            icinde = [t for t in grup[i:] if t.zaman - bas.zaman <= pencere]\n            if len(icinde) >= esik:\n                supheli.update(t.id for t in icinde)\n    return supheli\n\ndef json_uyumlu(nesne):\n    if isinstance(nesne, Decimal):\n        return str(nesne)\n    if isinstance(nesne, datetime):\n        return nesne.isoformat()\n    raise TypeError(f"JSON\'a çevrilemez: {type(nesne).__name__}")\n\ndef rapor_uret(islemler):\n    sik = sik_islem_idleri(islemler)\n    supheli = []\n    for t in sorted(islemler, key=lambda t: t.id):\n        nedenler = []\n        if gece_mi(t):\n            nedenler.append("gece")\n        if yuksek_mi(t):\n            nedenler.append("yuksek_tutar")\n        if t.id in sik:\n            nedenler.append("sik_islem")\n        if nedenler:\n            supheli.append({"id": t.id, "kart": t.kart, "zaman": t.zaman, "tutar": t.tutar, "nedenler": nedenler})\n    rapor = {"ozet": genel_ozet(islemler), "kategori_toplam": kategori_toplam(islemler), "supheli": supheli}\n    return json.dumps(rapor, ensure_ascii=False, default=json_uyumlu)\n',
      tests: 'import json\nfrom datetime import datetime\nfrom decimal import Decimal\nassert json_uyumlu(Decimal("8500.00")) == "8500.00", "Decimal str olmalı"\nassert json_uyumlu(datetime(2024, 3, 15, 2, 15)) == "2024-03-15T02:15:00", "datetime isoformat olmalı"\ntry:\n    json_uyumlu({1, 2})\n    assert False, "Bilinmeyen tipte TypeError"\nexcept TypeError:\n    pass\ndef T(i, kart, saat, dk, tutar, kat):\n    return Transaction(i, kart, datetime(2024, 3, 15, saat, dk), Decimal(tutar), kat)\nislemler = [T("T1", "****1111", 9, 12, "245.90", "market"), T("T2", "****1111", 13, 40, "1200.00", "elektronik"), T("T3", "****2222", 2, 15, "8500.00", "kuyumcu"), T("T4", "****3333", 23, 50, "60.00", "yakit"), T("T5", "****3333", 23, 54, "75.50", "yakit"), T("T6", "****3333", 23, 58, "90.00", "market"), T("T7", "****2222", 18, 0, "430.00", "market")]\nmetin = rapor_uret(islemler)\nassert isinstance(metin, str), "JSON metni (str) dönmeli"\nr = json.loads(metin)\nassert set(r) == {"ozet", "kategori_toplam", "supheli"}, "Üst anahtarlar ozet, kategori_toplam, supheli"\nassert r["ozet"]["islem_sayisi"] == 7 and r["ozet"]["toplam_tutar"] == "10601.40" and r["ozet"]["kart_sayisi"] == 3, "Özet: 7 işlem, 10601.40, 3 kart"\nassert list(r["kategori_toplam"]) == ["kuyumcu", "elektronik", "market", "yakit"], "Kategori sırası azalan tutar"\nassert r["kategori_toplam"]["market"] == "765.90", "market toplamı metin olarak 765.90"\nids = [s["id"] for s in r["supheli"]]\nassert ids == ["T3", "T4", "T5", "T6"], "Şüpheliler id sırasıyla T3, T4, T5, T6"\nassert r["supheli"][0]["nedenler"] == ["gece", "yuksek_tutar"], "T3: gece ve yuksek_tutar"\nassert r["supheli"][1]["nedenler"] == ["gece", "sik_islem"], "T4: gece ve sik_islem"\nassert r["supheli"][0]["zaman"] == "2024-03-15T02:15:00" and r["supheli"][0]["tutar"] == "8500.00", "zaman isoformat, tutar metin"\nassert "ş" not in metin or "\\\\u" not in metin, "ensure_ascii=False ile Türkçe karakter korunmalı"\n',
      hints: ['json_uyumlu: isinstance ile Decimal ve datetime ayrımı, sonra raise TypeError.', 'rapor_uret: sorted(islemler, key=lambda t: t.id) üzerinde nedenleri topla; json.dumps(rapor, ensure_ascii=False, default=json_uyumlu).'],
      why: 'default parametresi json.dumps\'ın tanımadığı her nesne için çağrılır; para metin olarak yazılır ki alıcı taraf kayıpsız Decimal\'e dönebilsin.' },

    { t: 'code', id: 'proje-orta-6',
      q: '<p><b>Parça 6.</b> Kural fonksiyonları hazır. <code>KuralTest(unittest.TestCase)</code> sınıfını yaz; en az şu beş test metodu olsun: <code>test_gece_sinir</code> (23:00 True, 06:00 False), <code>test_gunduz_degil</code> (13:00 False), <code>test_yuksek_sinir</code> (5000.00 True, 4999.99 False), <code>test_sik_islem_uc</code> (aynı kartta 10 dk içinde 3 işlem hepsi işaretli), <code>test_sik_islem_iki</code> (2 işlem işaretlenmez). Yardımcı bir <code>islem(...)</code> fabrika fonksiyonu yazabilirsin.</p>',
      start: 'import io\nimport unittest\nfrom collections import defaultdict\nfrom dataclasses import dataclass\nfrom datetime import datetime, timedelta\nfrom decimal import Decimal\n\n@dataclass(frozen=True)\nclass Transaction:\n    id: str\n    kart: str\n    zaman: datetime\n    tutar: Decimal\n    kategori: str\n\ndef gece_mi(t):\n    return t.zaman.hour >= 23 or t.zaman.hour < 6\n\ndef yuksek_mi(t, esik=Decimal("5000")):\n    return t.tutar >= esik\n\ndef sik_islem_idleri(islemler, pencere_dk=10, esik=3):\n    karta_gore = defaultdict(list)\n    for t in islemler:\n        karta_gore[t.kart].append(t)\n    pencere = timedelta(minutes=pencere_dk)\n    supheli = set()\n    for grup in karta_gore.values():\n        grup.sort(key=lambda t: t.zaman)\n        for i, bas in enumerate(grup):\n            icinde = [t for t in grup[i:] if t.zaman - bas.zaman <= pencere]\n            if len(icinde) >= esik:\n                supheli.update(t.id for t in icinde)\n    return supheli\n\ndef islem(i="X", kart="****0000", saat=12, dakika=0, tutar="100"):\n    return Transaction(i, kart, datetime(2024, 3, 15, saat, dakika), Decimal(tutar), "market")\n\nclass KuralTest(unittest.TestCase):\n    pass\n',
      sol: 'import io\nimport unittest\nfrom collections import defaultdict\nfrom dataclasses import dataclass\nfrom datetime import datetime, timedelta\nfrom decimal import Decimal\n\n@dataclass(frozen=True)\nclass Transaction:\n    id: str\n    kart: str\n    zaman: datetime\n    tutar: Decimal\n    kategori: str\n\ndef gece_mi(t):\n    return t.zaman.hour >= 23 or t.zaman.hour < 6\n\ndef yuksek_mi(t, esik=Decimal("5000")):\n    return t.tutar >= esik\n\ndef sik_islem_idleri(islemler, pencere_dk=10, esik=3):\n    karta_gore = defaultdict(list)\n    for t in islemler:\n        karta_gore[t.kart].append(t)\n    pencere = timedelta(minutes=pencere_dk)\n    supheli = set()\n    for grup in karta_gore.values():\n        grup.sort(key=lambda t: t.zaman)\n        for i, bas in enumerate(grup):\n            icinde = [t for t in grup[i:] if t.zaman - bas.zaman <= pencere]\n            if len(icinde) >= esik:\n                supheli.update(t.id for t in icinde)\n    return supheli\n\ndef islem(i="X", kart="****0000", saat=12, dakika=0, tutar="100"):\n    return Transaction(i, kart, datetime(2024, 3, 15, saat, dakika), Decimal(tutar), "market")\n\nclass KuralTest(unittest.TestCase):\n    def test_gece_sinir(self):\n        self.assertTrue(gece_mi(islem(saat=23)))\n        self.assertFalse(gece_mi(islem(saat=6)))\n\n    def test_gunduz_degil(self):\n        self.assertFalse(gece_mi(islem(saat=13)))\n\n    def test_yuksek_sinir(self):\n        self.assertTrue(yuksek_mi(islem(tutar="5000.00")))\n        self.assertFalse(yuksek_mi(islem(tutar="4999.99")))\n\n    def test_sik_islem_uc(self):\n        uc = [islem("A", saat=23, dakika=50), islem("B", saat=23, dakika=54), islem("C", saat=23, dakika=58)]\n        self.assertEqual(sik_islem_idleri(uc), {"A", "B", "C"})\n\n    def test_sik_islem_iki(self):\n        iki = [islem("A", saat=9, dakika=0), islem("B", saat=9, dakika=5)]\n        self.assertEqual(sik_islem_idleri(iki), set())\n',
      tests: 'import io\nimport unittest\nassert issubclass(KuralTest, unittest.TestCase), "KuralTest TestCase\'den türemeli"\nsuite = unittest.defaultTestLoader.loadTestsFromTestCase(KuralTest)\nadlar = {t.id().split(".")[-1] for t in suite}\nfor ad in ("test_gece_sinir", "test_gunduz_degil", "test_yuksek_sinir", "test_sik_islem_uc", "test_sik_islem_iki"):\n    assert ad in adlar, f"{ad} metodu olmalı"\nsonuc = unittest.TextTestRunner(stream=io.StringIO(), verbosity=0).run(suite)\nassert sonuc.testsRun >= 5 and sonuc.wasSuccessful(), "Doğru kurallara karşı tüm testler geçmeli"\n# Testler gerçekten kontrol ediyor mu? Kuralları bozup düşmelerini bekle\n_y, _s = yuksek_mi, sik_islem_idleri\ndef yuksek_mi(t, esik=Decimal("5000")): return t.tutar > esik\nr2 = unittest.TextTestRunner(stream=io.StringIO(), verbosity=0).run(unittest.defaultTestLoader.loadTestsFromTestCase(KuralTest))\nyuksek_mi = _y\ndef sik_islem_idleri(islemler, pencere_dk=10, esik=3): return {t.id for t in islemler}\nr3 = unittest.TextTestRunner(stream=io.StringIO(), verbosity=0).run(unittest.defaultTestLoader.loadTestsFromTestCase(KuralTest))\nsik_islem_idleri = _s\nassert not r2.wasSuccessful(), "yuksek_mi 5000 sınırını dışlayınca test_yuksek_sinir düşmeli (5000.00 True beklenmeli)"\nassert not r3.wasSuccessful(), "Her işlemi işaretleyen sik_islem_idleri ile test_sik_islem_iki düşmeli"\n',
      hints: ['islem(saat=23) ile sınır işlemi üret; assertTrue/assertFalse.', 'test_sik_islem_uc: aynı kartta 23:50, 23:54, 23:58; assertEqual(sik_islem_idleri(...), {"A", "B", "C"})'],
      why: 'Her kural için pozitif, negatif ve sınır testi yazılır; fabrika fonksiyonu test verisini kısa tutar. Bozulmuş kurala karşı testin düşmesi, testin gerçekten çalıştığını gösterir.' },

    { t: 'mc', q: 'Raporda tutarları JSON\'a <code>"8500.00"</code> metni olarak yazdık, <code>8500.0</code> sayısı olarak değil. Bunun nedeni nedir?',
      o: ['JSON standardı ondalıklı sayı tipini desteklemediği için mecburen metin yazılır', 'Metin daha az yer kaplar ve dosya küçülür', 'Alıcı taraf metni kayıpsız Decimal\'e çevirir; float hata taşıyabilir', 'json.dumps Decimal\'i zaten otomatik olarak metne çevirir, biz de uyduk'],
      a: 2,
      why: 'JSON sayıları çoğu dilde float olarak okunur ve para hassasiyeti kaybolabilir; metin ise Decimal("8500.00") ile birebir geri döner. json.dumps Decimal\'i tanımaz, default ile biz çeviririz.' }
  ],
  faq: [
    { q: 'Gerçek projede CSV yerine ne kullanırdım?', a: 'Veritabanı ya da API. sqlite3 dersindeki gibi SQL ile tarih ve kart filtresini yapıp yalnızca gerekli satırları Python\'a alırdın; csv_oku yerine satırları Transaction\'a çeviren tek bir fonksiyon değişirdi, kalan parçalar aynı kalır.' },
    { q: 'Sık işlem kuralı büyük veride yavaş olmaz mı?', a: 'Olur: her işlem için ileriye bakan liste O(n²)\'ye yaklaşır. Sıralı listede iki işaretçiyle kayan pencere tek geçişte çözer; İleri seviyedeki performans dersinde bu dönüşümü yapacaksın.' },
    { q: 'Kuralların eşiklerini nereye koymalıyım?', a: 'Parametre olarak (esik, pencere_dk) fonksiyonda; değerlerini yapılandırma dosyası ya da ortam değişkeninden okuyarak. Kod değişmeden operasyon ekibi eşiği ayarlayabilmeli.' },
    { q: 'Bu projeyi portföyüme nasıl koyarım?', a: 'src yerleşimiyle bir depo aç, README\'ye ne yaptığını ve nasıl çalıştırılacağını yaz, testleri tests/ altına koy, örnek CSV ekle, .gitignore ve pyproject.toml ile tamamla. Git dersindeki her şey burada işe yarar.' }
  ],
  mistakes: [
    { bad: 'tutar=float(satir["tutar"])', good: 'tutar=Decimal(satir["tutar"])', why: 'Para hesabında float yuvarlama hatası birikir; CSV\'den gelen metin doğrudan Decimal\'e çevrilir.' },
    { bad: 'sum(t.tutar for t in islemler)', good: 'sum((t.tutar for t in islemler), Decimal(0))', why: 'Boş listede sum int 0 döner ve tip tutarsızlaşır; başlangıç değeri Decimal(0) her durumda Decimal verir.' },
    { bad: 'json.dumps(rapor)  # Decimal içeriyor', good: 'json.dumps(rapor, default=json_uyumlu)', why: 'json Decimal ve datetime\'ı tanımaz, TypeError fırlatır; default ile dönüştürücü verilir.' },
    { bad: 'for i, bas in enumerate(grup):\n    icinde = [t for t in grup if abs(t.zaman - bas.zaman) <= pencere]', good: 'grup.sort(key=lambda t: t.zaman)\nfor i, bas in enumerate(grup):\n    icinde = [t for t in grup[i:] if t.zaman - bas.zaman <= pencere]', why: 'Sıralamadan ve ileriye bakmadan pencere hesaplamak hem yanlış (geçmiş ve gelecek karışır, 20 dakikalık pencere oluşur) hem gereksiz yavaştır.' }
  ]
}
