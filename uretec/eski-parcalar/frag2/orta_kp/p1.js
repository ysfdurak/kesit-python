/* ───────────────────────── 1. standart-kutuphane ───────────────────────── */
{
  id: 'standart-kutuphane',
  lv: 'orta',
  mod: 'Standart Kütüphane',
  min: 35,
  title: 'Standart kütüphane turu',
  sum: 'pathlib, shutil, argparse, decimal, statistics, hashlib ve secrets gibi "pilleri dahil" modüllerle dosya, komut satırı, para hesabı ve güvenlik işlerini tek satır import ile çözersin.',
  goals: [
    'pathlib ve shutil ile geçici klasörde dosya oluşturup listeleyebilir, kopyalayıp silebilirim.',
    'argparse ile komut satırı argümanlarını tanımlayıp parse_args ile test edebilirim.',
    'Para hesabında float yerine Decimal ve quantize kullanmanın nedenini açıklayabilirim.',
    'statistics, math, random, textwrap ve enum modüllerini doğru yerde seçebilirim.',
    'hashlib ile özet (hash) üretip secrets ile güvenli rastgele değer oluşturabilirim.'
  ],
  body: `
<h2>Neden "piller dahil"?</h2>
<p>Python'ın sloganlarından biri "batteries included" (piller dahil): kurulumla birlikte gelen standart kütüphane (standard library) yüzlerce modül içerir. Anadolu Market'te bir analist olarak her gün şunlarla karşılaşırsın: rapor klasörünü taramak, betiğe komut satırından parametre vermek, kuruşu kuruşuna tutar hesaplamak, satış rakamlarının ortalamasını ve sapmasını almak, bir parolayı güvenli saklamak. Bunların hiçbiri için pip ile paket kurman gerekmez. Bu ders, en sık kullanacağın modülleri tek turda gezer; her birini derinlemesine değil, "ne zaman hangisine uzanırım" düzeyinde öğrenirsin.</p>

<div class="tbl-wrap"><table>
<tr><th>İhtiyaç</th><th>Modül</th><th>Anahtar fonksiyon / sınıf</th></tr>
<tr><td>Dosya yolu, klasör, okuma-yazma</td><td>pathlib, os, shutil, tempfile</td><td>Path, mkdir, glob, copy, rmtree</td></tr>
<tr><td>Komut satırı argümanı</td><td>argparse, sys</td><td>ArgumentParser, parse_args, sys.argv</td></tr>
<tr><td>Zaman ölçme, bekleme</td><td>time</td><td>perf_counter, sleep</td></tr>
<tr><td>Rastgelelik</td><td>random, secrets</td><td>seed, choice, sample / token_hex</td></tr>
<tr><td>İstatistik ve matematik</td><td>statistics, math</td><td>mean, median, stdev / ceil, floor, sqrt</td></tr>
<tr><td>Metin sarma</td><td>textwrap</td><td>fill, shorten, dedent</td></tr>
<tr><td>Sabit küme</td><td>enum</td><td>Enum, auto</td></tr>
<tr><td>Kesin ondalık, kesir</td><td>decimal, fractions</td><td>Decimal, quantize / Fraction</td></tr>
<tr><td>Özet (hash)</td><td>hashlib</td><td>sha256, hexdigest</td></tr>
</table></div>

<h2>Dosya sistemi: pathlib, shutil, tempfile</h2>
<p><code>pathlib.Path</code>, dosya yolunu bir nesne olarak temsil eder; <code>/</code> işleciyle parça ekler, <code>.name</code>, <code>.suffix</code>, <code>.parent</code> ile parçalara ayırırsın. <code>os</code> modülü daha eski ve düşük seviyelidir; <code>os.environ</code> ve <code>os.getcwd()</code> gibi birkaç şey için hâlâ gerekir. <code>shutil</code> ise "kabuk yardımcıları": kopyalama, taşıma, klasörü komple silme. Aşağıdaki örnek, geçici bir klasörde (tempfile) küçük bir rapor arşivi kurar; bu klasör bellekte oluşur ve <code>with</code> bloğu bitince otomatik silinir.</p>
<pre class="py">import shutil
import tempfile
from pathlib import Path

with tempfile.TemporaryDirectory() as gecici:
    kok = Path(gecici) / "raporlar"
    kok.mkdir()
    for ay in ("ocak", "subat", "mart"):
        (kok / f"satis_{ay}.csv").write_text(f"sehir,tutar\\nAnkara,{len(ay) * 100}\\n", encoding="utf-8")
    (kok / "notlar.txt").write_text("Mart raporu eksik kontrol edilecek", encoding="utf-8")

    csvler = sorted(p.name for p in kok.glob("*.csv"))
    print("CSV dosyaları:", csvler)
    print("İlk dosyanın gövdesi:", (kok / "satis_ocak.csv").stem, "| uzantı:", (kok / "satis_ocak.csv").suffix)

    yedek = Path(gecici) / "yedek"
    shutil.copytree(kok, yedek)
    print("Yedekteki dosya sayısı:", len(list(yedek.iterdir())))

    shutil.rmtree(yedek)
    print("Yedek silindi mi?", not yedek.exists())
print("Geçici klasör de silindi mi?", not Path(gecici).exists())</pre>
<p><code>glob("*.csv")</code> deseni yalnızca o klasöre bakar; alt klasörler dahil aramak için <code>rglob</code> kullan. <code>write_text</code> / <code>read_text</code> dosyayı açıp kapatma işini senin yerine yapar.</p>
<div class="tip"><b>Yol birleştirmede string toplama yapma</b><code>klasor + "/" + ad</code> yerine <code>Path(klasor) / ad</code> yaz. Windows'ta ters eğik çizgi, Linux'ta düz çizgi sorununu pathlib kendisi çözer.</div>

<h2>Komut satırı: sys.argv ve argparse</h2>
<p>Betiği terminalden <code>python rapor.py --sehir Ankara --limit 5</code> diye çalıştırdığında argümanlar <code>sys.argv</code> listesine düşer. Bunları elle ayrıştırmak yerine <code>argparse</code> kullanırsın: tür dönüşümü, varsayılan değer, zorunluluk kontrolü ve <code>--help</code> çıktısı hazır gelir. Testte ya da burada tarayıcıda gerçek terminal olmadığı için <code>parse_args</code>'a listeyi elinle verirsin; bu, argparse'ı test etmenin de standart yoludur.</p>
<pre class="py">import argparse

def parser_kur() -&gt; argparse.ArgumentParser:
    p = argparse.ArgumentParser(prog="rapor", description="Anadolu Market şehir raporu")
    p.add_argument("--sehir", required=True, help="Raporlanacak şehir")
    p.add_argument("--limit", type=int, default=10, help="Kaç satır gösterilsin")
    p.add_argument("--ozet", action="store_true", help="Yalnızca toplamları yaz")
    return p

p = parser_kur()
a = p.parse_args(["--sehir", "Ankara", "--limit", "5"])
print(a.sehir, a.limit, a.ozet)
b = p.parse_args(["--sehir", "İzmir", "--ozet"])
print(b.sehir, b.limit, b.ozet)
print(type(b.limit).__name__)</pre>
<p><code>action="store_true"</code> bayrak (flag) tanımlar: yazılırsa True, yazılmazsa False. <code>type=int</code> sayesinde "5" metni tam sayıya çevrilir; geçersiz bir değer gelirse argparse anlaşılır bir hata basıp çıkar.</p>
<div class="note"><b>sys ne işe yarar?</b><code>sys.argv</code> dışında <code>sys.exit(1)</code> ile betiği hata koduyla bitirir, <code>sys.version</code> ile sürümü okur, <code>sys.path</code> ile modül arama yollarını görürsün. Betiğin "başarısız" bittiğini zamanlayıcıya bildirmenin yolu sıfır dışı bir çıkış kodudur.</div>

<h2>Para hesabı: neden float değil, Decimal?</h2>
<p>Ilgaz Bank'ta 0.1 + 0.2 liranın 0.3 çıkmaması kabul edilemez. Float ikili tabanda saklandığı için bazı ondalıkları tam temsil edemez. <code>decimal.Decimal</code> ise onluk tabanda, senin belirlediğin hassasiyette çalışır. İki kural: Decimal'i <b>string</b>'den kur (float'tan kurarsan hata taşınır) ve sonucu <code>quantize</code> ile kuruşa yuvarla.</p>
<pre class="py">from decimal import Decimal, ROUND_HALF_UP
from fractions import Fraction

print("float:  ", 0.1 + 0.2)
print("Decimal:", Decimal("0.1") + Decimal("0.2"))

tutar = Decimal("1234.567")
kdv = tutar * Decimal("0.20")
print("KDV ham:", kdv)
print("KDV kuruş:", kdv.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))

# Yanlış kullanım: float'tan Decimal
print("float'tan:", Decimal(0.1))

# Kesir: 3 ortağın payı tam olarak 1/3
pay = Fraction(1, 3)
print("3 pay toplamı:", pay * 3, "| ondalık:", float(pay))</pre>
<p><code>ROUND_HALF_UP</code> ticari yuvarlamadır (0.005 yukarı). Varsayılan <code>ROUND_HALF_EVEN</code> bankacı yuvarlaması olarak bilinir; muhasebe kuralına göre hangisini kullanacağını iş birimine sor. <code>Fraction</code> ise oran ve pay hesaplarında kayıpsız sonuç verir.</p>
<div class="warn"><b>Decimal ile float'ı karıştırma</b><code>Decimal("10") * 0.2</code> yazarsan TypeError alırsın. Çarpanı da Decimal yap: <code>Decimal("10") * Decimal("0.2")</code>. Tam sayıyla çarpmak serbesttir.</div>

<h2>Sayılar ve rastgelelik: statistics, math, random, time</h2>
<p>Küçük bir satış listesinin özetini çıkarmak için pandas'a gerek yok. <code>statistics</code> ortalama, medyan ve standart sapmayı verir; <code>math</code> yuvarlama ve kök işlemlerini; <code>random</code> örneklem seçmeyi; <code>time.perf_counter</code> ise bir işin kaç saniye sürdüğünü ölçmeyi sağlar.</p>
<pre class="py">import math
import random
import statistics
import time

satislar = [1250, 980, 1430, 1120, 2990, 1010, 1180]
print("ortalama:", round(statistics.mean(satislar), 2))
print("medyan:  ", statistics.median(satislar))
print("sapma:   ", round(statistics.stdev(satislar), 2))
print("en büyük tam sayı sayfa:", math.ceil(len(satislar) / 3), "| kök:", math.sqrt(144))

random.seed(42)
print("denetim için seçilen 3 satış:", random.sample(satislar, 3))

t0 = time.perf_counter()
toplam = sum(i * i for i in range(100_000))
print("süre (sn) sıfırdan büyük mü?", time.perf_counter() - t0 &gt; 0)</pre>
<p><code>random.seed(42)</code> deterministik sonuç verir: aynı tohumla aynı örneklem çıkar. Test yazarken ve raporu tekrarlanabilir kılarken bu şarttır. Medyanın ortalamadan küçük olması, 2990 gibi bir uç değerin ortalamayı yukarı çektiğini anlatır.</p>

<h2>Metin, sabit küme, özet: textwrap, enum, hashlib, secrets</h2>
<p>Son grup birbirinden bağımsız ama hepsi günlük işte çıkar. <code>textwrap.fill</code> uzun açıklamayı satırlara böler, <code>shorten</code> listede sığmayan başlığı kısaltır. <code>enum.Enum</code>, "ONAYLI / BEKLEMEDE / RED" gibi sabit kümeleri yazım hatasına kapalı hale getirir. <code>hashlib</code> bir metnin parmak izini (hash) üretir; parola doğrulamada parolayı değil, tuzla (salt) birleştirilmiş özetini saklarsın. Tuz üretmek için <code>random</code> değil, kriptografik <code>secrets</code> modülü kullanılır.</p>
<pre class="py">import hashlib
import secrets
import textwrap
from enum import Enum, auto

aciklama = "Anadolu Market, müşterinin iade talebini 14 gün içinde değerlendirir ve sonucu e-posta ile bildirir."
print(textwrap.fill(aciklama, width=40))
print(textwrap.shorten(aciklama, width=30, placeholder="..."))

class Durum(Enum):
    BEKLEMEDE = auto()
    ONAYLI = auto()
    RED = auto()

basvuru = Durum.ONAYLI
print(basvuru, "|", basvuru.name, "|", basvuru.value, "|", basvuru is Durum["ONAYLI"])

tuz = secrets.token_hex(8)
parola = "Gizli123"
ozet = hashlib.sha256((tuz + parola).encode("utf-8")).hexdigest()
print("tuz uzunluğu:", len(tuz), "| özet uzunluğu:", len(ozet))
print("aynı parola aynı özeti verir mi?", ozet == hashlib.sha256((tuz + parola).encode("utf-8")).hexdigest())
print("parola değişince özet değişir mi?", ozet != hashlib.sha256((tuz + "gizli123").encode("utf-8")).hexdigest())</pre>
<p>Özet tek yönlüdür: özetten parolaya dönülemez. Tuz, iki müşteri aynı parolayı seçse bile saklanan özetlerin farklı olmasını sağlar. Gerçek sistemlerde sha256 yerine yavaş ve tuzlu parola algoritmaları (bcrypt, argon2) tercih edilir; sha256'yı dosya bütünlüğü ve veri parmak izi için kullan.</p>
<div class="tip"><b>random mı, secrets mi?</b>Örneklem, simülasyon ve test verisi için <code>random</code>; token, tuz, geçici şifre, sıfırlama bağlantısı için <code>secrets</code>. random'ın çıktısı tahmin edilebilir, secrets'ınki işletim sisteminin kriptografik kaynağından gelir.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Standart kütüphane ne zaman yetmez?</h3>
<p>Tur bitti; şimdi sınırlar. Bir işi standart kütüphaneyle çözebiliyorsan dış paket ekleme: bağımlılık, güvenlik ve sürüm yükü taşırsın. Ama şu durumlarda dış pakete geçmek doğru karardır: argparse ile 20'den fazla alt komut yönetiyorsan <code>typer</code> ya da <code>click</code>; binlerce satırlık istatistikte <code>statistics</code> yerine numpy ve pandas; parola saklamada hashlib yerine <code>argon2-cffi</code> veya <code>bcrypt</code>; karmaşık tarih işlerinde <code>dateutil</code>. Karar ölçütün şu: "Standart kütüphane bu işi yapabiliyor mu ve kod hâlâ okunur mu?"</p>
<p>Bir de kurumsal kodda sık görülen üç küçük kalıbı aklında tut. Birincisi, betiğin her zaman <code>main(argv=None)</code> fonksiyonuyla başlaması: <code>argv</code> None ise <code>sys.argv[1:]</code> kullanır, değilse verileni; böylece aynı fonksiyon hem terminalden hem testten çağrılır. İkincisi, para alanlarını veritabanından okuduğun anda <code>Decimal</code>'e çevirip raporun sonuna kadar Decimal tutmak; float'a yalnızca grafik çizerken dönmek. Üçüncüsü, <code>Enum</code> üyelerini veritabanında <code>.name</code> olarak saklamak; sayısal <code>.value</code> saklarsan üye sırası değişince veri bozulur.</p>
</section>
`,
  ex: [
    { t: 'mc', q: 'Ilgaz Bank\'ta faiz hesabı yazıyorsun. <code>0.1 + 0.2 == 0.3</code> ifadesi float ile neden <code>False</code> döner?',
      o: ['Python toplama işleminde yuvarlama hatası yapar', 'İkili tabanda 0.1 ve 0.2 tam temsil edilemez', '== işleci float için çalışmaz', 'Sonuç 0.30000000000000004 olduğu için Python onu metne çevirir'],
      a: 1,
      why: 'Float sayılar ikili (binary) kesirlerle saklanır; 0.1 ve 0.2 sonsuz ikili kesir olduğu için en yakın değere yuvarlanır ve toplam 0.3 olmaz. Decimal onluk tabanda çalıştığı için bu sorunu yaşamaz.' },

    { t: 'code', id: 'standart-kutuphane-1',
      q: '<p>Anadolu Market için <code>kdv_hesapla(tutar, oran="0.20")</code> fonksiyonunu yaz. İki parametre de metin (string) olarak gelir. Fonksiyon tutarı <code>Decimal</code>\'e çevirip KDV\'yi hesaplasın ve sonucu <code>ROUND_HALF_UP</code> ile kuruşa (<code>Decimal("0.01")</code>) yuvarlanmış bir <code>Decimal</code> olarak döndürsün.</p>',
      start: 'from decimal import Decimal, ROUND_HALF_UP\n\ndef kdv_hesapla(tutar, oran="0.20"):\n    # tutar ve oran string gelir\n    pass\n',
      sol: 'from decimal import Decimal, ROUND_HALF_UP\n\ndef kdv_hesapla(tutar, oran="0.20"):\n    kdv = Decimal(tutar) * Decimal(oran)\n    return kdv.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)\n',
      tests: 'from decimal import Decimal\nr = kdv_hesapla("100")\nassert isinstance(r, Decimal), "Sonuç Decimal olmalı"\nassert r == Decimal("20.00"), "100 TL için KDV 20.00 olmalı"\nassert str(r) == "20.00", "Sonuç kuruşa yuvarlanmış olmalı (20.00)"\nassert kdv_hesapla("1234.567") == Decimal("246.91"), "1234.567 * 0.20 = 246.9134 -> 246.91 olmalı"\nassert kdv_hesapla("0.025", "1") == Decimal("0.03"), "ROUND_HALF_UP: 0.025 -> 0.03 olmalı"\nassert kdv_hesapla("50", "0.10") == Decimal("5.00"), "oran parametresi kullanılmalı"\n',
      hints: ['Decimal(tutar) * Decimal(oran) ile ham KDV\'yi bul.', 'quantize(Decimal("0.01"), rounding=ROUND_HALF_UP) iki basamağa yuvarlar.'],
      why: 'Metinden Decimal kurmak float hatasını baştan engeller; quantize ise hem yuvarlar hem de sonucun her zaman iki ondalıkla gösterilmesini sağlar.' },

    { t: 'code', id: 'standart-kutuphane-2',
      q: '<p><code>uzantiya_gore_say(klasor)</code> fonksiyonunu yaz. <code>klasor</code> bir <code>pathlib.Path</code>\'tir. Fonksiyon yalnızca o klasördeki (alt klasörler hariç) <b>dosyaları</b> uzantısına göre saysın ve <code>{".csv": 2, ".txt": 1}</code> gibi bir sözlük döndürsün. Uzantısız dosyalar <code>""</code> anahtarına yazılsın.</p>',
      start: 'from pathlib import Path\n\ndef uzantiya_gore_say(klasor):\n    pass\n',
      sol: 'from pathlib import Path\n\ndef uzantiya_gore_say(klasor):\n    sayim = {}\n    for p in klasor.iterdir():\n        if p.is_file():\n            sayim[p.suffix] = sayim.get(p.suffix, 0) + 1\n    return sayim\n',
      tests: 'import tempfile\nfrom pathlib import Path\nwith tempfile.TemporaryDirectory() as d:\n    kok = Path(d)\n    for ad in ("ocak.csv", "subat.csv", "notlar.txt", "README"):\n        (kok / ad).write_text("x", encoding="utf-8")\n    (kok / "alt").mkdir()\n    (kok / "alt" / "gizli.csv").write_text("y", encoding="utf-8")\n    r = uzantiya_gore_say(kok)\n    assert isinstance(r, dict), "Sözlük dönmeli"\n    assert r.get(".csv") == 2, "Üst klasörde 2 csv var (alt klasördeki sayılmamalı)"\n    assert r.get(".txt") == 1, "1 txt olmalı"\n    assert r.get("") == 1, "Uzantısız dosya \\"\\" anahtarına yazılmalı"\n    assert ".alt" not in r and "alt" not in r, "Klasörler sayılmamalı"\n    assert uzantiya_gore_say(kok / "alt") == {".csv": 1}, "Alt klasör tek başına verilince 1 csv"\n',
      hints: ['klasor.iterdir() ile içeriği gez; p.is_file() ile klasörleri ele.', 'p.suffix uzantıyı nokta ile verir; uzantısızda boş metindir.'],
      why: 'iterdir yalnızca bir seviye tarar; is_file klasörleri eler; suffix doğrudan sözlük anahtarı olarak kullanılır.' },

    { t: 'code', id: 'standart-kutuphane-3',
      q: '<p>Komut satırı aracı için <code>argumanlari_ayristir(argv)</code> fonksiyonunu argparse ile yaz. <code>argv</code> bir liste olarak gelir (örn. <code>["--sehir", "Ankara"]</code>). Tanımlanacak argümanlar: <code>--sehir</code> (zorunlu, metin), <code>--limit</code> (tam sayı, varsayılan 10), <code>--ozet</code> (bayrak; yazılırsa True). Fonksiyon <code>parse_args(argv)</code> sonucunu (Namespace) döndürsün.</p>',
      start: 'import argparse\n\ndef argumanlari_ayristir(argv):\n    p = argparse.ArgumentParser(prog="rapor")\n    # argümanları ekle\n    return p.parse_args(argv)\n',
      sol: 'import argparse\n\ndef argumanlari_ayristir(argv):\n    p = argparse.ArgumentParser(prog="rapor")\n    p.add_argument("--sehir", required=True)\n    p.add_argument("--limit", type=int, default=10)\n    p.add_argument("--ozet", action="store_true")\n    return p.parse_args(argv)\n',
      tests: 'a = argumanlari_ayristir(["--sehir", "Ankara"])\nassert a.sehir == "Ankara", "--sehir okunmalı"\nassert a.limit == 10, "limit varsayılanı 10 olmalı"\nassert a.ozet is False, "--ozet yazılmayınca False olmalı"\nb = argumanlari_ayristir(["--sehir", "İzmir", "--limit", "5", "--ozet"])\nassert b.limit == 5 and isinstance(b.limit, int), "--limit tam sayıya çevrilmeli (type=int)"\nassert b.ozet is True, "--ozet yazılınca True olmalı"\ntry:\n    argumanlari_ayristir(["--limit", "3"])\n    assert False, "--sehir verilmezse hata olmalı (required=True)"\nexcept SystemExit:\n    pass\n',
      hints: ['add_argument("--sehir", required=True)', 'Sayı için type=int, default=10; bayrak için action="store_true".'],
      why: 'argparse zorunlu argüman eksikse SystemExit fırlatır; testte bunu yakalamak argparse davranışını doğrulamanın standart yoludur.' },

    { t: 'code', id: 'standart-kutuphane-4',
      q: '<p>Anadolu Market günlük satış listesi için <code>ozet_istatistik(sayilar)</code> fonksiyonunu yaz. <code>statistics</code> modülünü kullanarak <code>{"ortalama": ..., "medyan": ..., "sapma": ...}</code> sözlüğü döndürsün; üç değer de <code>round(x, 2)</code> ile yuvarlansın. Sapma için örneklem standart sapması (<code>stdev</code>) kullanılsın. Liste tek elemanlıysa sapma <code>0.0</code> olsun.</p>',
      start: 'import statistics\n\ndef ozet_istatistik(sayilar):\n    pass\n',
      sol: 'import statistics\n\ndef ozet_istatistik(sayilar):\n    sapma = statistics.stdev(sayilar) if len(sayilar) > 1 else 0.0\n    return {\n        "ortalama": round(statistics.mean(sayilar), 2),\n        "medyan": round(statistics.median(sayilar), 2),\n        "sapma": round(sapma, 2),\n    }\n',
      tests: 'r = ozet_istatistik([1250, 980, 1430, 1120, 2990, 1010, 1180])\nassert set(r) == {"ortalama", "medyan", "sapma"}, "Anahtarlar ortalama, medyan, sapma olmalı"\nassert abs(r["ortalama"] - 1422.86) < 0.01, "ortalama 1422.86 olmalı"\nassert abs(r["medyan"] - 1180) < 0.01, "medyan 1180 olmalı"\nassert abs(r["sapma"] - 707.48) < 0.01, "örneklem sapması 707.48 olmalı (stdev)"\nassert ozet_istatistik([500]) == {"ortalama": 500, "medyan": 500, "sapma": 0.0}, "Tek elemanda sapma 0.0 olmalı"\n',
      hints: ['statistics.mean, statistics.median, statistics.stdev', 'stdev tek elemanda hata verir; len kontrolü yap.'],
      why: 'stdev örneklem sapmasıdır (n-1 ile böler); pstdev ise popülasyon sapması. Tek elemanlı listede stdev StatisticsError fırlatır, bu yüzden korunur.' },

    { t: 'mc', q: 'Ilgaz Bank müşterisine şifre sıfırlama bağlantısı için tek kullanımlık bir token üreteceksin. Hangisi doğru seçimdir?',
      o: ['random.randint(100000, 999999)', 'hashlib.sha256(b"token").hexdigest()', 'secrets.token_urlsafe(32)', 'random.choice(string.ascii_letters)'],
      a: 2,
      why: 'secrets modülü kriptografik olarak güvenli rastgelelik üretir; random tahmin edilebilirdir. hashlib ise rastgele değer üretmez, verilen girdinin özetini alır; sabit girdiyle her zaman aynı sonucu verir.' },

    { t: 'code', id: 'standart-kutuphane-5',
      q: '<p><code>parola_ozeti(parola, tuz)</code> fonksiyonunu yaz: <code>tuz + parola</code> metnini UTF-8 olarak kodlayıp SHA-256 özetinin onaltılık (hex) halini döndürsün. Ardından <code>tuz_uret()</code> fonksiyonunu yaz: <code>secrets.token_hex(8)</code> ile 16 karakterlik bir tuz döndürsün.</p>',
      start: 'import hashlib\nimport secrets\n\ndef parola_ozeti(parola, tuz):\n    pass\n\ndef tuz_uret():\n    pass\n',
      sol: 'import hashlib\nimport secrets\n\ndef parola_ozeti(parola, tuz):\n    return hashlib.sha256((tuz + parola).encode("utf-8")).hexdigest()\n\ndef tuz_uret():\n    return secrets.token_hex(8)\n',
      tests: 'import hashlib\nbeklenen = hashlib.sha256("abc123Gizli".encode("utf-8")).hexdigest()\nassert parola_ozeti("Gizli", "abc123") == beklenen, "Özet sha256(tuz + parola) olmalı"\nassert len(parola_ozeti("x", "y")) == 64, "sha256 hex özeti 64 karakter olmalı"\nassert parola_ozeti("Gizli", "abc123") != parola_ozeti("gizli", "abc123"), "Farklı parola farklı özet vermeli"\nt1, t2 = tuz_uret(), tuz_uret()\nassert len(t1) == 16, "token_hex(8) 16 karakter üretir"\nassert t1 != t2, "Her çağrı farklı tuz üretmeli"\nassert all(c in "0123456789abcdef" for c in t1), "Tuz onaltılık karakterlerden oluşmalı"\n',
      hints: ['hashlib.sha256(metin.encode("utf-8")).hexdigest()', 'Önce tuz, sonra parola: (tuz + parola)'],
      why: 'hexdigest 32 baytlık özeti 64 karakterlik hex metne çevirir. Tuz, aynı parolaya sahip iki kullanıcının farklı özet almasını sağlar.' },

    { t: 'mc', q: '<code>class Durum(Enum)</code> içinde <code>ONAYLI = auto()</code> tanımladın. Bir sipariş kaydını veritabanına yazarken hangi değeri saklamak daha güvenlidir?',
      o: ['Durum.ONAYLI.value (sayı)', 'Durum.ONAYLI.name ("ONAYLI")', 'str(Durum.ONAYLI)', 'id(Durum.ONAYLI)'],
      a: 1,
      why: 'auto() ile üretilen sayısal value, üyeler yeniden sıralanınca değişebilir; name ise sabit ve okunurdur. str() "Durum.ONAYLI" gibi sınıf adını da taşır, id() ise çalıştırma arasında değişen bellek adresidir.' }
  ],
  faq: [
    { q: 'os.path ile pathlib arasında hangisini kullanmalıyım?', a: 'Yeni kodda pathlib. os.path metin tabanlıdır ve her işlem için ayrı fonksiyon çağırırsın; Path nesnesi ise okunur ve zincirlenebilir. Eski kodu okurken os.path.join, os.path.exists gibi fonksiyonları tanıman yeter.' },
    { q: 'Decimal her yerde float\'tan yavaş mı?', a: 'Evet, belirgin biçimde yavaştır ama para hesabında doğruluk hızdan önemlidir. Bilimsel hesap ve grafik için float, para ve muhasebe için Decimal kullan.' },
    { q: 'argparse parse_args() argümansız çağrılınca ne olur?', a: 'sys.argv[1:] listesini okur, yani terminalden gelen gerçek argümanları. Test ve notebook ortamında bu beklenmedik hatalara yol açar; bu yüzden argümanı her zaman liste olarak geçirebilen bir yapı kur.' },
    { q: 'sha256 ile parola saklamak yeterli mi?', a: 'Üretimde yeterli değil: sha256 hızlıdır, saldırgan milyarlarca denemeyi kısa sürede yapar. Parola için argon2 veya bcrypt gibi yavaş ve tuzlu algoritmalar kullanılır; sha256 dosya bütünlüğü ve parmak izi için uygundur.' }
  ],
  mistakes: [
    { bad: 'Decimal(0.1) + Decimal(0.2)', good: 'Decimal("0.1") + Decimal("0.2")', why: 'Float\'tan kurulan Decimal, float\'ın hatasını olduğu gibi taşır. Decimal her zaman metinden ya da tam sayıdan kurulur.' },
    { bad: 'yol = klasor + "/" + "rapor.csv"', good: 'yol = Path(klasor) / "rapor.csv"', why: 'Metin birleştirme işletim sistemine göre bozulur ve klasor zaten Path ise TypeError verir. / işleci her platformda doğru ayırıcıyı kullanır.' },
    { bad: 'token = str(random.randint(0, 10**9))', good: 'token = secrets.token_urlsafe(32)', why: 'random tahmin edilebilir bir üreteçtir; güvenlik amaçlı değerler kriptografik secrets modülünden gelmelidir.' },
    { bad: 'statistics.stdev([1500])', good: 'statistics.stdev(x) if len(x) > 1 else 0.0', why: 'Örneklem sapması en az iki değer ister; tek elemanda StatisticsError fırlatır.' }
  ]
},
