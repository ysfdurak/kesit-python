/* PythonPatika — Orta 3: Standart Kütüphane (devam), Kalite ve Proje, Bitirme (standart-kutuphane … proje-orta) */
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push(
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
<p>Anadolu Bank'ta 0.1 + 0.2 liranın 0.3 çıkmaması kabul edilemez. Float ikili tabanda saklandığı için bazı ondalıkları tam temsil edemez. <code>decimal.Decimal</code> ise onluk tabanda, senin belirlediğin hassasiyette çalışır. İki kural: Decimal'i <b>string</b>'den kur (float'tan kurarsan hata taşınır) ve sonucu <code>quantize</code> ile kuruşa yuvarla.</p>
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
    { t: 'mc', q: 'Anadolu Bank\'ta faiz hesabı yazıyorsun. <code>0.1 + 0.2 == 0.3</code> ifadesi float ile neden <code>False</code> döner?',
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

    { t: 'mc', q: 'Anadolu Bank müşterisine şifre sıfırlama bağlantısı için tek kullanımlık bir token üreteceksin. Hangisi doğru seçimdir?',
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
/* ───────────────────────── 2. sqlite-python ───────────────────────── */
{
  id: 'sqlite-python',
  lv: 'orta',
  mod: 'Standart Kütüphane',
  min: 35,
  title: 'sqlite3 ile Python',
  sum: 'Bellek içi SQLite veritabanı kurar, parametreli sorguyla SQL enjeksiyonundan korunur, executemany ile toplu yükler, Row factory ile satırları sözlük gibi okur ve transaction mantığını kavrarsın.',
  goals: [
    'sqlite3 ile bellek içi veritabanı açıp tablo oluşturabilir, veri ekleyip sorgulayabilirim.',
    'Parametreli sorgu (?) ile SQL enjeksiyonunu engelleyebilir, executemany ile toplu ekleme yapabilirim.',
    'Row factory ile satırları sütun adıyla okuyup sözlüğe çevirebilirim.',
    'commit, rollback ve bağlam yöneticisi ile transaction davranışını yönetebilirim.',
    'Hangi işi SQL\'e, hangisini Python\'a bırakacağıma karar verebilirim.'
  ],
  body: `
<h2>Neden SQLite?</h2>
<p>SQLite, tek bir dosyada (ya da bellekte) yaşayan, sunucu gerektirmeyen bir ilişkisel veritabanıdır (relational database). Python ile birlikte gelen <code>sqlite3</code> modülü sayesinde kurulum yapmadan SQL yazabilirsin. Anadolu Market'te bir analist için tipik kullanım şu: binlerce satırlık sipariş CSV'sini bir SQLite tablosuna yükle, SQL ile grupla ve filtrele, sonucu Python ile raporla. Masaüstü uygulamaları, mobil uygulamalar ve tarayıcılar da yerel verisini SQLite'ta tutar; yani öğrendiğin şey oyuncak değil, dünyanın en yaygın veritabanı motoru.</p>
<p>SQLPatika'da SQL'in kendisini öğrendin. Bu derste sorulan soru farklı: <b>Python, SQL ile nasıl konuşur?</b> Üç kavram yeter: bağlantı (connection), imleç (cursor) ve transaction.</p>

<h2>Bağlantı, tablo, ekleme, sorgu</h2>
<p><code>sqlite3.connect(":memory:")</code> yalnızca RAM'de yaşayan bir veritabanı açar; program bitince kaybolur. Derste ve testte idealdir. Dosya istersen <code>connect("market.db")</code> yazarsın. <code>execute</code> bir SQL cümlesi çalıştırır, <code>fetchall</code> sonuç satırlarını demet listesi olarak getirir.</p>
<pre class="py">import sqlite3

con = sqlite3.connect(":memory:")
con.execute("""
    CREATE TABLE siparis (
        id INTEGER PRIMARY KEY,
        musteri TEXT NOT NULL,
        sehir TEXT NOT NULL,
        tutar REAL NOT NULL
    )
""")
con.execute("INSERT INTO siparis (musteri, sehir, tutar) VALUES (?, ?, ?)", ("Ayşe", "Ankara", 1250.0))
con.execute("INSERT INTO siparis (musteri, sehir, tutar) VALUES (?, ?, ?)", ("Mehmet", "İzmir", 480.5))
con.commit()

satirlar = con.execute("SELECT id, musteri, sehir, tutar FROM siparis ORDER BY id").fetchall()
print(satirlar)
print("ilk satır türü:", type(satirlar[0]).__name__)
toplam = con.execute("SELECT SUM(tutar) FROM siparis").fetchone()[0]
print("toplam:", toplam)
con.close()</pre>
<p>Dikkat edilecek nokta: <code>fetchall</code> demet (tuple) listesi döner, sütun adları yoktur. <code>fetchone</code> tek satır (ya da None) getirir; tek değerli sonuçlarda <code>[0]</code> ile içini alırsın. <code>con.execute</code>, arka planda bir imleç oluşturup çalıştırmanın kısa yoludur; <code>cur = con.cursor()</code> ile açık imleç de kullanabilirsin.</p>

<h2>Parametreli sorgu ve SQL enjeksiyonu</h2>
<p>Yukarıdaki <code>?</code> işaretleri yer tutucudur (placeholder). Değerleri SQL metnine f-string ile gömmek yerine ayrı bir demetle verirsin. Bunun iki nedeni var: sqlite3 tırnak ve özel karakterleri doğru kaçırır, ve kullanıcıdan gelen metin SQL olarak <b>yorumlanmaz</b>. Aşağıdaki örnek, kötü niyetli bir girdinin f-string'li sorguyu nasıl ele geçirdiğini, parametreli sorgunun ise aynı metni sadece veri olarak gördüğünü gösterir.</p>
<pre class="py">import sqlite3

con = sqlite3.connect(":memory:")
con.execute("CREATE TABLE musteri (ad TEXT, sehir TEXT)")
con.executemany("INSERT INTO musteri VALUES (?, ?)", [("Ayşe", "Ankara"), ("Can", "Bursa"), ("Elif", "Ankara")])

girdi = "Ankara' OR '1'='1"   # arama kutusuna yazılan kötü niyetli metin

# YANLIŞ: metin SQL'in parçası olur, koşul her zaman doğru çıkar
kotu = con.execute(f"SELECT ad FROM musteri WHERE sehir = '{girdi}'").fetchall()
print("f-string ile:", [r[0] for r in kotu])

# DOĞRU: metin yalnızca bir değerdir, hiçbir şehirle eşleşmez
iyi = con.execute("SELECT ad FROM musteri WHERE sehir = ?", (girdi,)).fetchall()
print("parametre ile:", [r[0] for r in iyi])

# İsimli parametre: okunur ve sıraya bağlı değil
isimli = con.execute("SELECT ad FROM musteri WHERE sehir = :s ORDER BY ad", {"s": "Ankara"}).fetchall()
print("isimli parametre:", [r[0] for r in isimli])</pre>
<div class="warn"><b>Tek değerli parametre demet olmalı</b><code>(girdi,)</code> sondaki virgüle dikkat. <code>(girdi)</code> yazarsan parantez bir işlem önceliği parantezi olur, demet değil; sqlite3 metni karakter karakter parametre sanıp hata verir.</div>
<p><code>executemany</code>, aynı sorguyu bir dizi parametreyle tekrar tekrar çalıştırır; CSV'den yüzlerce satır yüklerken döngüde tek tek <code>execute</code> çağırmaktan hem kısa hem hızlıdır.</p>

<h2>Row factory: satırı sözlük gibi okumak</h2>
<p><code>r[2]</code> yazıp "üçüncü sütun hangisiydi" diye düşünmek hata kaynağıdır. <code>con.row_factory = sqlite3.Row</code> dedikten sonra her satır hem indeksle hem sütun adıyla okunur; <code>dict(satir)</code> ile gerçek sözlüğe çevrilir ve JSON'a gitmeye hazır olur.</p>
<pre class="py">import json
import sqlite3

con = sqlite3.connect(":memory:")
con.row_factory = sqlite3.Row
con.execute("CREATE TABLE siparis (id INTEGER PRIMARY KEY, sehir TEXT, tutar REAL)")
con.executemany("INSERT INTO siparis (sehir, tutar) VALUES (?, ?)", [
    ("Ankara", 1250.0), ("İzmir", 480.5), ("Ankara", 300.0), ("Bursa", 920.0), ("İzmir", 150.0)
])

for row in con.execute("SELECT sehir, COUNT(*) AS adet, SUM(tutar) AS toplam FROM siparis GROUP BY sehir ORDER BY toplam DESC"):
    print(row["sehir"], row["adet"], row["toplam"])

ilk = con.execute("SELECT * FROM siparis WHERE id = ?", (1,)).fetchone()
print("sütunlar:", ilk.keys())
print("sözlük:", dict(ilk))
print(json.dumps([dict(r) for r in con.execute("SELECT id, sehir FROM siparis WHERE sehir = 'İzmir'")], ensure_ascii=False))</pre>
<p>GROUP BY, SUM ve ORDER BY işini SQL yaptı; Python yalnızca sonucu dolaştı. Bu iş bölümü dersin sonundaki "köprü" bölümünün özeti.</p>

<h2>Transaction: commit, rollback, bağlam yöneticisi</h2>
<p>Anadolu Bank'ta bir havale iki UPDATE'tir: gönderenden düş, alıcıya ekle. İlki olup ikincisi olmazsa para buharlaşır. Transaction (işlem bütünlüğü) tam bunu çözer: bir grup değişiklik ya hep birlikte kalıcı olur (<code>commit</code>) ya da hep birlikte geri alınır (<code>rollback</code>). sqlite3'te bağlantı nesnesi <code>with</code> ile kullanılınca blok hatasız biterse otomatik commit, istisna çıkarsa otomatik rollback yapar. Dikkat: <code>with con:</code> bağlantıyı <b>kapatmaz</b>, yalnızca transaction'ı yönetir.</p>
<pre class="py">import sqlite3

con = sqlite3.connect(":memory:")
con.execute("CREATE TABLE hesap (no TEXT PRIMARY KEY, bakiye REAL NOT NULL CHECK (bakiye &gt;= 0))")
con.executemany("INSERT INTO hesap VALUES (?, ?)", [("TR01", 1000.0), ("TR02", 200.0)])
con.commit()

def havale(gonderen: str, alici: str, tutar: float) -&gt; bool:
    try:
        with con:
            con.execute("UPDATE hesap SET bakiye = bakiye - ? WHERE no = ?", (tutar, gonderen))
            con.execute("UPDATE hesap SET bakiye = bakiye + ? WHERE no = ?", (tutar, alici))
        return True
    except sqlite3.IntegrityError as e:
        print("geri alındı:", e)
        return False

def bakiyeler():
    return dict(con.execute("SELECT no, bakiye FROM hesap ORDER BY no").fetchall())

print("başlangıç:", bakiyeler())
print("300 havale:", havale("TR01", "TR02", 300.0), bakiyeler())
print("5000 havale:", havale("TR01", "TR02", 5000.0), bakiyeler())</pre>
<p>İkinci havalede ilk UPDATE bakiyeyi eksiye düşürmeye çalışınca CHECK kısıtı <code>IntegrityError</code> fırlattı; <code>with con</code> bloğu bu istisnayı görüp her şeyi geri aldı. Bakiyeler ilk havaleden sonraki halinde kaldı. Kısıtı veritabanına yazmak, Python tarafındaki <code>if</code> kontrolünü unutsan bile veriyi korur.</p>
<div class="tip"><b>Bağlantıyı kapatmayı unutma</b>Dosya tabanlı veritabanında işin bitince <code>con.close()</code> çağır; en temizi bağlantıyı <code>contextlib.closing(sqlite3.connect(...))</code> ile açmak ya da sınıfına <code>__enter__/__exit__</code> yazmaktır. Bellek içi veritabanında kapatma, veriyi de siler.</div>
<div class="note"><b>Tür eşlemesi</b>SQLite'ın INTEGER, REAL, TEXT, BLOB türleri sırasıyla int, float, str, bytes olarak gelir. Tarih tipi yoktur: tarihleri ISO metni ("2024-03-15") olarak sakla, karşılaştırma yine doğru çalışır. NULL ise Python'da None olur.</div>

<h2>SQLPatika'ya köprü: SQL ne yapar, Python ne yapar?</h2>
<p>İki araç rakip değil, iş arkadaşı. Küme işlemleri (filtre, gruplama, birleştirme, sıralama) veritabanı motorunun uzmanlık alanıdır; milyon satırda Python döngüsünden kat kat hızlıdır ve veriyi belleğe taşımaz. Python ise SQL'in beceremediği yerde devreye girer: karmaşık iş kuralları, dış sistemlerle konuşma, rapor biçimleme, test.</p>
<div class="tbl-wrap"><table>
<tr><th>İş</th><th>SQL'e bırak</th><th>Python'a bırak</th></tr>
<tr><td>Şehre göre toplam ciro</td><td>GROUP BY sehir, SUM(tutar)</td><td>Sonucu tabloya/JSON'a dök</td></tr>
<tr><td>Son 30 günün siparişleri</td><td>WHERE tarih &gt;= ?</td><td>Tarih aralığını hesapla, parametre olarak ver</td></tr>
<tr><td>Şüpheli işlem kuralı (çok adımlı)</td><td>Ham satırları getir</td><td>Kuralı fonksiyonla uygula, test et</td></tr>
<tr><td>CSV'den yükleme</td><td>INSERT (executemany)</td><td>CSV'yi oku, temizle, türleri çevir</td></tr>
<tr><td>Müşteriye e-posta</td><td>Alıcı listesini seç</td><td>Şablon doldur, gönder</td></tr>
</table></div>
<p>Pratik kural: "Veriyi azaltan iş SQL'de, veriyi anlamlandıran iş Python'da." Bir SELECT'in döndürdüğü satır sayısı ne kadar azsa, Python tarafı o kadar hızlı ve basit olur.</p>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Üretimde sqlite3: kalıplar ve sınırlar</h3>
<p>Bir veri katmanı (data layer) yazarken sorguları uygulamanın her yerine dağıtma; bir <code>Depo</code> sınıfında topla. Sınıfın kurucusu bağlantıyı alır, metotları (<code>ekle</code>, <code>sehre_gore_toplam</code>) SQL'i saklar, geri kalan kod SQL görmez. Böylece bir gün PostgreSQL'e geçersen yalnızca bu sınıfı değiştirirsin. Testlerde ise aynı sınıfa <code>":memory:"</code> bağlantısı verirsin; her test temiz bir veritabanıyla başlar, dosya kirliliği olmaz.</p>
<p>Şema değişiklikleri (migration) için <code>CREATE TABLE IF NOT EXISTS</code> başlangıçtır; büyüyen projede <code>PRAGMA user_version</code> ile şema sürümü tutup sırayla ALTER TABLE betikleri çalıştırırsın. Performans için iki not: toplu eklemede her satırdan sonra commit yapma, executemany + tek commit kullan; sık filtrelenen sütuna <code>CREATE INDEX</code> ekle. SQLite'ın sınırı eşzamanlı yazmadır: aynı anda tek yazar kabul eder. Çok kullanıcılı web uygulaması ya da gigabaytlarca büyüyen veri için PostgreSQL gibi sunucu tabanlı bir motora geçersin; ama Python tarafındaki kalıp (bağlantı, parametreli sorgu, transaction) birebir aynı kalır, çünkü hepsi DB-API 2.0 standardını izler.</p>
</section>
`,
  ex: [
    { t: 'mc', q: 'Arama kutusundan gelen <code>sehir</code> değişkenini sorguya eklemenin güvenli yolu hangisidir?',
      o: ['con.execute(f"SELECT * FROM m WHERE sehir = \'{sehir}\'")', 'con.execute("SELECT * FROM m WHERE sehir = " + repr(sehir))', 'con.execute("SELECT * FROM m WHERE sehir = ?", (sehir,))', 'con.execute("SELECT * FROM m WHERE sehir = ?" % sehir)'],
      a: 2,
      why: 'Yer tutucu (?) ile değer ayrı geçirilir; sqlite3 onu asla SQL olarak yorumlamaz. f-string, + ve % ile metin birleştirme, girdiyi SQL\'in parçası yapar ve enjeksiyona açıktır.' },

    { t: 'code', id: 'sqlite-python-1',
      q: '<p>Anadolu Market için <code>veritabani_kur()</code> fonksiyonunu yaz: <code>":memory:"</code> bağlantısı açsın, <code>siparis</code> tablosunu <code>id INTEGER PRIMARY KEY, musteri TEXT, sehir TEXT, tutar REAL</code> sütunlarıyla oluştursun ve bağlantıyı döndürsün. Sonra <code>siparis_ekle(con, kayitlar)</code> fonksiyonunu yaz: <code>kayitlar</code> <code>(musteri, sehir, tutar)</code> demetlerinden oluşan bir listedir; <code>executemany</code> ile eklesin, <code>commit</code> yapsın ve eklenen satır sayısını döndürsün.</p>',
      start: 'import sqlite3\n\ndef veritabani_kur():\n    pass\n\ndef siparis_ekle(con, kayitlar):\n    pass\n',
      sol: 'import sqlite3\n\ndef veritabani_kur():\n    con = sqlite3.connect(":memory:")\n    con.execute("CREATE TABLE siparis (id INTEGER PRIMARY KEY, musteri TEXT, sehir TEXT, tutar REAL)")\n    return con\n\ndef siparis_ekle(con, kayitlar):\n    con.executemany("INSERT INTO siparis (musteri, sehir, tutar) VALUES (?, ?, ?)", kayitlar)\n    con.commit()\n    return len(kayitlar)\n',
      tests: 'import sqlite3\ncon = veritabani_kur()\nassert isinstance(con, sqlite3.Connection), "Bağlantı nesnesi dönmeli"\ncols = [r[1] for r in con.execute("PRAGMA table_info(siparis)")]\nassert cols == ["id", "musteri", "sehir", "tutar"], "Sütunlar id, musteri, sehir, tutar olmalı"\nn = siparis_ekle(con, [("Ayşe", "Ankara", 1250.0), ("Can", "Bursa", 300.0), ("Elif", "Ankara", 90.5)])\nassert n == 3, "Eklenen satır sayısı 3 dönmeli"\nassert con.execute("SELECT COUNT(*) FROM siparis").fetchone()[0] == 3, "Tabloda 3 satır olmalı"\nassert con.execute("SELECT musteri FROM siparis WHERE id = 1").fetchone()[0] == "Ayşe", "id otomatik artmalı (1 -> Ayşe)"\nassert siparis_ekle(con, []) == 0, "Boş listede 0 dönmeli"\n',
      hints: ['sqlite3.connect(":memory:") ve con.execute("CREATE TABLE ...")', 'executemany("INSERT ... VALUES (?, ?, ?)", kayitlar) sonra con.commit()'],
      why: 'INTEGER PRIMARY KEY sütunu verilmeyince SQLite otomatik numara atar; executemany tüm demetleri tek sorguyla işler.' },

    { t: 'code', id: 'sqlite-python-2',
      q: '<p><code>sehre_gore_toplam(con)</code> fonksiyonunu yaz. <code>con</code> içinde <code>siparis(sehir, tutar)</code> tablosu dolu gelir. Fonksiyon SQL ile (GROUP BY) şehir başına sipariş adedini ve toplam tutarı hesaplasın ve toplam tutara göre azalan sırada <code>[{"sehir": ..., "adet": ..., "toplam": ...}, ...]</code> listesi döndürsün. İpucu: <code>con.row_factory = sqlite3.Row</code> ile satırları <code>dict(...)</code>\'e çevirebilirsin.</p>',
      start: 'import sqlite3\n\ndef sehre_gore_toplam(con):\n    pass\n',
      sol: 'import sqlite3\n\ndef sehre_gore_toplam(con):\n    con.row_factory = sqlite3.Row\n    sql = "SELECT sehir, COUNT(*) AS adet, SUM(tutar) AS toplam FROM siparis GROUP BY sehir ORDER BY toplam DESC"\n    return [dict(r) for r in con.execute(sql)]\n',
      tests: 'import sqlite3\ncon = sqlite3.connect(":memory:")\ncon.execute("CREATE TABLE siparis (id INTEGER PRIMARY KEY, sehir TEXT, tutar REAL)")\ncon.executemany("INSERT INTO siparis (sehir, tutar) VALUES (?, ?)", [("Ankara", 1250.0), ("İzmir", 480.5), ("Ankara", 300.0), ("Bursa", 920.0), ("İzmir", 150.0)])\nr = sehre_gore_toplam(con)\nassert isinstance(r, list) and all(isinstance(x, dict) for x in r), "Sözlük listesi dönmeli"\nassert [x["sehir"] for x in r] == ["Ankara", "Bursa", "İzmir"], "Toplama göre azalan: Ankara, Bursa, İzmir"\nassert r[0]["adet"] == 2 and abs(r[0]["toplam"] - 1550.0) < 1e-6, "Ankara: adet 2, toplam 1550.0"\nassert r[2]["adet"] == 2 and abs(r[2]["toplam"] - 630.5) < 1e-6, "İzmir: adet 2, toplam 630.5"\nassert set(r[1]) == {"sehir", "adet", "toplam"}, "Anahtarlar sehir, adet, toplam olmalı"\n',
      hints: ['SELECT sehir, COUNT(*) AS adet, SUM(tutar) AS toplam FROM siparis GROUP BY sehir ORDER BY toplam DESC', 'row_factory = sqlite3.Row sonra [dict(r) for r in ...]'],
      why: 'Gruplama ve sıralama SQL\'de yapılır; AS ile verilen takma adlar Row üzerinden doğrudan sözlük anahtarı olur.' },

    { t: 'code', id: 'sqlite-python-3',
      q: '<p>Anadolu Bank için <code>havale(con, gonderen, alici, tutar)</code> fonksiyonunu yaz. <code>hesap(no TEXT PRIMARY KEY, bakiye REAL CHECK (bakiye &gt;= 0))</code> tablosu hazır gelir. Fonksiyon <code>with con:</code> bloğu içinde gönderenin bakiyesini düşüp alıcınınkini artırsın. Blok başarılı biterse <code>True</code> döndürsün; <code>sqlite3.IntegrityError</code> çıkarsa (bakiye eksiye düşerse) istisnayı yakalayıp <code>False</code> döndürsün. Başarısız havalede hiçbir bakiye değişmemeli.</p>',
      start: 'import sqlite3\n\ndef havale(con, gonderen, alici, tutar):\n    pass\n',
      sol: 'import sqlite3\n\ndef havale(con, gonderen, alici, tutar):\n    try:\n        with con:\n            con.execute("UPDATE hesap SET bakiye = bakiye - ? WHERE no = ?", (tutar, gonderen))\n            con.execute("UPDATE hesap SET bakiye = bakiye + ? WHERE no = ?", (tutar, alici))\n        return True\n    except sqlite3.IntegrityError:\n        return False\n',
      tests: 'import sqlite3\ncon = sqlite3.connect(":memory:")\ncon.execute("CREATE TABLE hesap (no TEXT PRIMARY KEY, bakiye REAL NOT NULL CHECK (bakiye >= 0))")\ncon.executemany("INSERT INTO hesap VALUES (?, ?)", [("TR01", 1000.0), ("TR02", 200.0)])\ncon.commit()\ndef bak(): return dict(con.execute("SELECT no, bakiye FROM hesap").fetchall())\nassert havale(con, "TR01", "TR02", 300.0) is True, "Yeterli bakiyede True dönmeli"\nassert bak() == {"TR01": 700.0, "TR02": 500.0}, "300 havale sonrası TR01=700, TR02=500 olmalı"\nassert havale(con, "TR01", "TR02", 5000.0) is False, "Yetersiz bakiyede False dönmeli"\nassert bak() == {"TR01": 700.0, "TR02": 500.0}, "Başarısız havalede bakiyeler değişmemeli (rollback)"\nassert havale(con, "TR02", "TR01", 500.0) is True, "Tam bakiye kadar havale geçerli"\nassert bak() == {"TR01": 1200.0, "TR02": 0.0}, "Son durum TR01=1200, TR02=0"\n',
      hints: ['with con: bloğu içinde iki UPDATE; istisna çıkarsa blok otomatik rollback yapar.', 'try/except sqlite3.IntegrityError ile False döndür.'],
      why: 'Bağlantı bağlam yöneticisi olarak kullanılınca hatasız çıkışta commit, istisnada rollback yapar; CHECK kısıtı eksi bakiyeyi veritabanı seviyesinde engeller.' },

    { t: 'mc', q: '<code>with con:</code> bloğu bittiğinde sqlite3 bağlantısına ne olur?',
      o: ['Bağlantı kapanır', 'Transaction commit edilir, bağlantı açık kalır', 'Tablolar silinir', 'Hiçbir şey; with yalnızca dosyalar içindir'],
      a: 1,
      why: 'sqlite3.Connection\'ın bağlam yöneticisi transaction\'ı yönetir: hatasız çıkışta commit, istisnada rollback. Bağlantıyı kapatmak için ayrıca close() gerekir.' },

    { t: 'code', id: 'sqlite-python-4',
      q: '<p><code>csv_den_yukle(con, metin)</code> fonksiyonunu yaz. <code>metin</code>, başlık satırı <code>musteri,sehir,tutar</code> olan bir CSV string\'idir. Fonksiyon <code>csv.DictReader</code> ile satırları okusun, <code>tutar</code>\'ı float\'a çevirsin, <code>siparis(musteri, sehir, tutar)</code> tablosuna <code>executemany</code> ile eklesin, commit yapsın ve eklenen satır sayısını döndürsün. Tablo hazır gelir.</p>',
      start: 'import csv\nimport io\nimport sqlite3\n\ndef csv_den_yukle(con, metin):\n    pass\n',
      sol: 'import csv\nimport io\nimport sqlite3\n\ndef csv_den_yukle(con, metin):\n    okuyucu = csv.DictReader(io.StringIO(metin))\n    kayitlar = [(r["musteri"], r["sehir"], float(r["tutar"])) for r in okuyucu]\n    con.executemany("INSERT INTO siparis (musteri, sehir, tutar) VALUES (?, ?, ?)", kayitlar)\n    con.commit()\n    return len(kayitlar)\n',
      tests: 'import sqlite3\ncon = sqlite3.connect(":memory:")\ncon.execute("CREATE TABLE siparis (id INTEGER PRIMARY KEY, musteri TEXT, sehir TEXT, tutar REAL)")\nmetin = "musteri,sehir,tutar\\nAyşe,Ankara,1250.0\\nCan,Bursa,300\\nElif,İzmir,90.5\\n"\nassert csv_den_yukle(con, metin) == 3, "3 satır eklenmeli"\nrows = con.execute("SELECT musteri, sehir, tutar FROM siparis ORDER BY id").fetchall()\nassert rows == [("Ayşe", "Ankara", 1250.0), ("Can", "Bursa", 300.0), ("Elif", "İzmir", 90.5)], "Satırlar doğru sırayla ve float tutarla eklenmeli"\nassert isinstance(rows[1][2], float), "tutar REAL (float) olarak saklanmalı"\nassert csv_den_yukle(con, "musteri,sehir,tutar\\n") == 0, "Yalnızca başlık varsa 0 dönmeli"\n',
      hints: ['csv.DictReader(io.StringIO(metin)) her satırı sözlük verir.', 'Önce (musteri, sehir, float(tutar)) demetleri listesini kur, sonra executemany.'],
      why: 'CSV\'yi okuyup türleri çevirmek Python\'un işi, satırları saklamak SQL\'in; executemany ikisini tek adımda bağlar.' },

    { t: 'mc', q: 'Bir milyon satırlık sipariş tablosunda şehir başına ciroyu hesaplayacaksın. En doğru yaklaşım hangisi?',
      o: ['SELECT * ile hepsini çekip Python sözlüğüyle toplamak', 'Her şehir için ayrı SELECT SUM sorgusu göndermek', 'GROUP BY ile tek sorguda özetleyip sonucu Python\'da raporlamak', 'Satırları pandas\'a aktarmak için önce CSV\'ye yazmak'],
      a: 2,
      why: 'Veriyi azaltan iş (gruplama) veritabanında yapılır; tek sorgu hem ağ/bellek yükünü düşürür hem hızlıdır. Her şehir için ayrı sorgu N kat yavaştır; tüm satırları Python\'a taşımak belleği boşa harcar.' }
  ],
  faq: [
    { q: 'executemany ile döngüde execute arasında gerçek fark var mı?', a: 'Sonuç aynı, hız farklı: executemany sorguyu bir kez derler ve parametreleri art arda uygular. Binlerce satırda belirgin kazanç sağlar; ayrıca kod kısalır.' },
    { q: 'Sorgu sonucunu neden tuple olarak alıyorum, sözlük daha kolay değil mi?', a: 'Varsayılan tuple hız içindir. con.row_factory = sqlite3.Row dersen hem indeks hem sütun adıyla erişirsin; dict(row) ile tam sözlüğe çevirirsin. Yeni projede row_factory ayarlamak iyi alışkanlıktır.' },
    { q: 'Tarihleri nasıl saklamalıyım?', a: 'ISO 8601 metni olarak: "2024-03-15" ya da "2024-03-15T10:30:00". Metin karşılaştırması kronolojik sırayla örtüşür, SQLite\'ın date() fonksiyonları da bu biçimi tanır.' },
    { q: 'Pyodide/tarayıcıda dosya veritabanı açabilir miyim?', a: 'Evet, sanal dosya sistemine yazılır ama sayfa yenilenince kaybolur. Derste ve testte ":memory:" kullan; kalıcı veri gerçek Python kurulumunda dosya ile tutulur.' }
  ],
  mistakes: [
    { bad: 'con.execute("SELECT * FROM m WHERE ad = ?", ad)', good: 'con.execute("SELECT * FROM m WHERE ad = ?", (ad,))', why: 'Parametreler bir dizi olmalı. Metin verilirse sqlite3 onu karakter karakter parametre sayar ve "Incorrect number of bindings" hatası verir.' },
    { bad: 'con.execute("INSERT INTO t VALUES (?)", (x,))\n# commit yok', good: 'con.execute("INSERT INTO t VALUES (?)", (x,))\ncon.commit()', why: 'Commit edilmeyen değişiklik bağlantı kapanınca kaybolur; başka bir bağlantı da onu göremez.' },
    { bad: 'with con:\n    ...\n# "bağlantı kapandı" sanmak', good: 'with con:\n    ...\ncon.close()', why: 'Bağlantı nesnesinin with bloğu yalnızca commit/rollback yapar; kaynağı serbest bırakmak için close gerekir.' },
    { bad: 'for sehir in sehirler:\n    con.execute(f"SELECT SUM(tutar) FROM s WHERE sehir=\'{sehir}\'")', good: 'con.execute("SELECT sehir, SUM(tutar) FROM s GROUP BY sehir")', why: 'Hem enjeksiyona açık hem de N ayrı sorgu; tek GROUP BY sorgusu hem güvenli hem hızlıdır.' }
  ]
},
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
/* ───────────────────────── 4. sanal-ortam-pip ───────────────────────── */
{
  id: 'sanal-ortam-pip',
  lv: 'orta',
  mod: 'Kalite ve Proje',
  min: 30,
  title: 'Sanal ortam ve paket yönetimi',
  sum: 'venv ile projeye özel ortam kurar, pip ile paket yükler, requirements.txt ve pyproject.toml ile bağımlılıkları sürüm sabitleyerek yönetir, çatışmaları tanır ve uv/poetry gibi modern araçları tanırsın.',
  goals: [
    'venv ile sanal ortam oluşturup etkinleştirebilir, neden gerekli olduğunu açıklayabilirim.',
    'pip install, pip freeze ve requirements.txt ile bağımlılıkları kurup kaydedebilirim.',
    '==, >=, ~= sürüm belirteçlerinin farkını ve semver mantığını açıklayabilirim.',
    'pyproject.toml dosyasındaki bağımlılıkları tomllib ile okuyabilirim.',
    'Bağımlılık çatışmasının ne olduğunu ve nasıl çözüleceğini anlatabilirim.'
  ],
  body: `
<h2>Sorun: "Benim makinemde çalışıyordu"</h2>
<p>Anadolu Market'in raporlama betiği senin bilgisayarında kusursuz çalışıyor; iş arkadaşın çalıştırınca <code>ModuleNotFoundError: No module named 'openpyxl'</code> alıyor. Bir başka projede pandas'ın eski sürümü gerekiyor, ama bilgisayarına yenisini kurdun ve eski proje bozuldu. İki sorunun da kaynağı aynı: paketler (package) bilgisayara <b>global</b> kurulmuş. Çözüm iki parçalı: her projeye kendi izole paket klasörü (sanal ortam, virtual environment) ve projenin hangi paketlerin hangi sürümünü istediğini yazan bir liste (requirements.txt ya da pyproject.toml).</p>
<div class="note"><b>Bu derste terminal komutları gösterilir</b>Tarayıcıdaki Python'da pip ya da venv çalıştıramayız; komutları kendi bilgisayarında dene. Kod alıştırmaları ise bu araçların ürettiği metin dosyalarını Python ile ayrıştırmak üzerine; iş hayatında da tam bunu yaparsın: CI betiği requirements'ı okur, sürümü kontrol eder.</div>

<h2>Sanal ortam: venv</h2>
<p><code>venv</code>, standart kütüphanenin parçasıdır. Proje klasöründe şu üç komut yeter:</p>
<div class="steps-list"><ol>
<li><code>python -m venv .venv</code> — proje içinde <code>.venv</code> klasörü oluşturur; içinde ayrı bir Python ve boş bir paket klasörü vardır.</li>
<li>Etkinleştir: Windows'ta <code>.venv\\Scripts\\activate</code>, macOS/Linux'ta <code>source .venv/bin/activate</code>. Terminal satırının başında <code>(.venv)</code> belirir.</li>
<li>Artık <code>pip install</code> yalnızca bu klasöre kurar; <code>deactivate</code> ile çıkarsın.</li>
</ol></div>
<p>Kural: her proje kendi <code>.venv</code>'ine sahip olur ve bu klasör <b>asla</b> Git'e girmez (sonraki derste <code>.gitignore</code>'a yazacağız). Ortamı başkasıyla paylaşmazsın; paylaştığın şey bağımlılık listesidir, ortamı herkes kendi makinesinde o listeden yeniden kurar.</p>
<pre class="py">import sys
from pathlib import Path

# Sanal ortam etkin mi? sys.prefix sanal ortamın yolunu, base_prefix gerçek kurulumu gösterir
etkin = sys.prefix != sys.base_prefix
print("sanal ortam etkin mi?", etkin)
print("Python sürümü:", sys.version_info.major, ".", sys.version_info.minor, sep="")

# Tipik bir proje yerleşimi (gösterim)
agac = {
    "anadolu-rapor/": ["pyproject.toml", "requirements.txt", "README.md", ".gitignore", ".venv/  (Git'e girmez)", "src/anadolu_rapor/", "tests/"],
}
for kok, parcalar in agac.items():
    print(kok)
    for p in parcalar:
        print("  ", p)</pre>

<h2>pip: kur, listele, dondur</h2>
<p><code>pip</code> Python'ın paket yöneticisidir ve PyPI (Python Package Index) deposundan indirir. Günlük komutlar:</p>
<div class="tbl-wrap"><table>
<tr><th>Komut</th><th>Ne yapar</th></tr>
<tr><td>pip install pandas</td><td>En yeni uyumlu sürümü kurar</td></tr>
<tr><td>pip install "pandas==2.2.2"</td><td>Tam o sürümü kurar</td></tr>
<tr><td>pip install -r requirements.txt</td><td>Listedeki her şeyi kurar</td></tr>
<tr><td>pip install -e .</td><td>Projenin kendisini düzenlenebilir modda kurar (pyproject gerekir)</td></tr>
<tr><td>pip list</td><td>Kurulu paketleri gösterir</td></tr>
<tr><td>pip freeze &gt; requirements.txt</td><td>Kurulu paketleri tam sürümle dosyaya yazar</td></tr>
<tr><td>pip uninstall pandas</td><td>Kaldırır</td></tr>
<tr><td>pip install --upgrade pip</td><td>pip'in kendisini günceller</td></tr>
</table></div>
<p><code>pip freeze</code> çıktısı <code>paket==sürüm</code> satırlarından oluşur. Bu, "o gün çalışan tam kombinasyon"un fotoğrafıdır; dağıtımda (deployment) bu dosyayı kullanırsın ki sunucuda da birebir aynı sürümler kurulsun.</p>

<h2>Sürüm belirteçleri ve semver</h2>
<p>Paketler çoğunlukla anlamsal sürümleme (semantic versioning, semver) kullanır: <code>MAJOR.MINOR.PATCH</code>. PATCH hata düzeltmesidir, MINOR geriye uyumlu yeni özellik, MAJOR ise uyumu bozabilen değişiklik. requirements.txt satırında hangi sürümleri kabul ettiğini belirtirsin:</p>
<div class="tbl-wrap"><table>
<tr><th>Belirteç</th><th>Anlamı</th><th>Ne zaman</th></tr>
<tr><td>pandas==2.2.2</td><td>Tam olarak 2.2.2</td><td>Dağıtım, tekrarlanabilirlik</td></tr>
<tr><td>pandas&gt;=2.0</td><td>2.0 ve üstü, sınırsız</td><td>Kütüphane yazarken (esnek)</td></tr>
<tr><td>pandas~=2.2.0</td><td>&gt;=2.2.0 ve &lt;2.3 (son basamak serbest)</td><td>Yama güncellemelerine açık</td></tr>
<tr><td>pandas&gt;=2.0,&lt;3</td><td>2.x serisi</td><td>MAJOR kırılmasından korunmak</td></tr>
<tr><td>pandas</td><td>Herhangi bir sürüm</td><td>Hızlı deneme; üretimde kaçın</td></tr>
</table></div>
<p>Sürüm metnini karşılaştırırken metin karşılaştırması yanıltır: <code>"2.10.0" &lt; "2.9.0"</code> metin olarak doğru ama sürüm olarak yanlıştır. Parçalara bölüp tam sayıya çevirmek gerekir; aşağıdaki küçük ayrıştırıcı requirements satırlarını sözlüğe döker ve sürümü doğru karşılaştırır.</p>
<pre class="py">import re

def surum_demeti(s: str) -&gt; tuple[int, ...]:
    return tuple(int(p) for p in s.split("."))

print('"2.10.0" &lt; "2.9.0" metin olarak:', "2.10.0" &lt; "2.9.0")
print("demet olarak:", surum_demeti("2.10.0") &lt; surum_demeti("2.9.0"))

requirements = """
# Anadolu Market rapor aracı
pandas==2.2.2
openpyxl&gt;=3.1
requests~=2.31.0

rich
"""
desen = re.compile(r"^([A-Za-z0-9_.-]+)\\s*(==|&gt;=|~=|&lt;=|&gt;|&lt;)?\\s*([0-9.]+)?$")
for satir in requirements.splitlines():
    satir = satir.strip()
    if not satir or satir.startswith("#"):
        continue
    ad, op, ver = desen.match(satir).groups()
    print(f"{ad:10} {op or '(her sürüm)':12} {ver or ''}")</pre>
<p>Düzenli ifade üç parça yakalar: paket adı, işleç, sürüm. Yorum ve boş satırlar atlanır. Gerçek requirements dosyalarında ek kurallar da bulunur (ortam işaretleri, <code>-r</code> ile başka dosya), ama günlük işte bu kadarı yeter.</p>
<div class="warn"><b>~= tuzağı</b><code>~=2.2</code> ile <code>~=2.2.0</code> farklıdır. İlki "&gt;=2.2, &lt;3.0" (minor serbest), ikincisi "&gt;=2.2.0, &lt;2.3" (yalnızca patch serbest). Son basamak kaç haneli yazıldıysa o basamak serbest kalır.</div>

<h2>pyproject.toml: modern standart</h2>
<p>Yeni projelerde bağımlılıklar <code>requirements.txt</code> yerine (ya da onunla birlikte) <code>pyproject.toml</code> içinde tutulur. TOML, okunur bir yapılandırma biçimidir; Python 3.11'den beri standart kütüphanedeki <code>tomllib</code> ile okunur (yalnızca okuma; yazmak için dış paket gerekir). Aynı dosya projenin adını, sürümünü ve araç ayarlarını da taşır.</p>
<pre class="py">import tomllib

pyproject = """
[project]
name = "anadolu-rapor"
version = "0.3.1"
requires-python = "&gt;=3.11"
dependencies = [
    "pandas==2.2.2",
    "openpyxl&gt;=3.1",
]

[project.optional-dependencies]
dev = ["pytest&gt;=8", "ruff"]

[tool.ruff]
line-length = 100
"""
veri = tomllib.loads(pyproject)
proje = veri["project"]
print(proje["name"], proje["version"], "| Python:", proje["requires-python"])
print("bağımlılıklar:", proje["dependencies"])
print("geliştirme:", proje["optional-dependencies"]["dev"])
print("ruff satır uzunluğu:", veri["tool"]["ruff"]["line-length"])</pre>
<p><code>optional-dependencies</code> altındaki <code>dev</code> grubu yalnızca geliştiricilerin kurduğu paketlerdir (test, biçimlendirici); <code>pip install -e ".[dev]"</code> ile kurulur. Üretim sunucusuna pytest kurmazsın.</p>
<div class="tip"><b>uv ve poetry</b>pip + venv her yerde çalışır ama yavaş ve elle yönetimlidir. <code>uv</code> (Rust ile yazılmış, çok hızlı) ve <code>poetry</code>, sanal ortamı ve kilit dosyasını (lock file) otomatik yönetir: <code>uv add pandas</code> hem pyproject'e yazar hem kurar hem <code>uv.lock</code> üretir. Kilit dosyası, pip freeze'in modern karşılığıdır: her bağımlılığın bağımlılığının bile tam sürümünü tutar.</div>

<h2>Bağımlılık çatışması</h2>
<p>Paket A, <code>requests&gt;=2.31</code> isterken paket B <code>requests&lt;2.30</code> isterse pip "ResolutionImpossible" hatası verir: iki koşulu aynı anda sağlayan sürüm yok. Çatışma (dependency conflict) genellikle eski bir paketin güncellenmemesinden doğar. Çözüm sırası: önce iki paketin daha yeni sürümlerini dene; olmuyorsa birini değiştir; son çare, çatışan işi ayrı sanal ortamda çalışan ayrı bir araca taşı. Çatışmayı erken fark etmek için bağımlılık listesini küçük tut: gerçekten kullandığın paketleri yaz, "bir gün lazım olur" diye ekleme.</p>
<pre class="py">def aralikta(ver: tuple, kosullar: list[tuple[str, tuple]]) -&gt; bool:
    for op, hedef in kosullar:
        if op == "&gt;=" and not ver &gt;= hedef: return False
        if op == "&lt;" and not ver &lt; hedef: return False
        if op == "==" and not ver == hedef: return False
    return True

# A: requests&gt;=2.31  |  B: requests&lt;2.30
kosullar = [("&gt;=", (2, 31, 0)), ("&lt;", (2, 30, 0))]
adaylar = [(2, 28, 0), (2, 29, 0), (2, 31, 0), (2, 32, 3)]
uygun = [v for v in adaylar if aralikta(v, kosullar)]
print("iki koşulu da sağlayan sürüm:", uygun or "YOK -> çatışma")</pre>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Tekrarlanabilir ortam: kurumsal pratik</h3>
<p>Kurumsal projelerde iki dosya birlikte yaşar: <code>pyproject.toml</code> geniş aralıklarla "ne istiyoruz"u söyler (<code>pandas&gt;=2.2,&lt;3</code>), kilit dosyası (<code>uv.lock</code>, <code>poetry.lock</code> ya da <code>pip freeze</code> çıktısı) "bugün tam olarak ne kuruldu"yu. Geliştirici esnek aralıkla çalışır, sunucu ve CI kilit dosyasıyla kurar; böylece "testler geçti ama üretimde patladı" sürprizi kalkar. Kilit dosyasını Git'e koyarsın; <code>.venv</code>'i koymazsın.</p>
<p>Üç alışkanlık daha: Birincisi, <code>requires-python</code> alanını yaz; ekip üyeleri 3.9 ile 3.12 arasında dağılmışsa <code>match</code> gibi yeni sözdizimi bir makinede çalışıp diğerinde çalışmaz. İkincisi, bağımlılıkları düzenli olarak güncelle ama tek tek: hepsini aynı anda yükseltirsen kırılan testin hangi paketten kaynaklandığını bulamazsın. Üçüncüsü, güvenlik taraması: <code>pip audit</code> (ya da uv/poetry'nin eşdeğeri) bilinen açıklı sürümleri listeler; Anadolu Bank gibi düzenlemeye tabi kurumlarda bu tarama CI'da zorunlu adımdır.</p>
</section>
`,
  ex: [
    { t: 'mc', q: 'requirements.txt içinde <code>pandas~=2.2.0</code> yazıyor. Hangi sürümler kabul edilir?',
      o: ['Yalnızca 2.2.0', '2.2.0 ve üstü, 3.0 hariç', '2.2.0 ve üstü, 2.3.0 hariç', 'Yalnızca 2.x.0 biçimindekiler'],
      a: 2,
      why: '~= "uyumlu sürüm" işlecidir: yazılan son basamak serbest bırakılır. ~=2.2.0 için bu, >=2.2.0 ve <2.3 demektir; yama güncellemelerine açık, minor değişikliğe kapalı.' },

    { t: 'code', id: 'sanal-ortam-pip-1',
      q: '<p><code>requirements_ayristir(metin)</code> fonksiyonunu yaz. <code>metin</code> bir requirements.txt içeriğidir. Boş satırları ve <code>#</code> ile başlayan yorum satırlarını atla. Her paket satırı için <code>(ad, islec, surum)</code> demeti üret; işleç ve sürüm yoksa ikisi de <code>None</code> olsun. Satır başı/sonu boşlukları kırp. Desteklenecek işleçler: <code>==</code>, <code>&gt;=</code>, <code>&lt;=</code>, <code>~=</code>, <code>&gt;</code>, <code>&lt;</code>. Liste döndür.</p>',
      start: 'import re\n\ndef requirements_ayristir(metin):\n    pass\n',
      sol: 'import re\n\nDESEN = re.compile(r"^([A-Za-z0-9_.\\-]+)\\s*(==|>=|<=|~=|>|<)?\\s*([0-9][0-9A-Za-z.]*)?$")\n\ndef requirements_ayristir(metin):\n    sonuc = []\n    for satir in metin.splitlines():\n        satir = satir.strip()\n        if not satir or satir.startswith("#"):\n            continue\n        m = DESEN.match(satir)\n        ad, op, ver = m.groups()\n        sonuc.append((ad, op, ver))\n    return sonuc\n',
      tests: 'metin = "# rapor araci\\npandas==2.2.2\\n\\nopenpyxl>=3.1\\n  requests ~= 2.31.0  \\nrich\\n# son\\n"\nr = requirements_ayristir(metin)\nassert isinstance(r, list), "Liste dönmeli"\nassert len(r) == 4, "4 paket satırı var (yorum ve boş satırlar atlanmalı)"\nassert r[0] == ("pandas", "==", "2.2.2"), "pandas==2.2.2 -> (\'pandas\', \'==\', \'2.2.2\')"\nassert r[1] == ("openpyxl", ">=", "3.1"), "openpyxl>=3.1 doğru ayrışmalı"\nassert r[2] == ("requests", "~=", "2.31.0"), "Boşluklu satır kırpılıp ~= tanınmalı"\nassert r[3] == ("rich", None, None), "Sürümsüz paket (ad, None, None) olmalı"\nassert requirements_ayristir("") == [], "Boş metinde boş liste"\n',
      hints: ['splitlines ile dön, strip et, boş ve # satırları continue.', 'Düzenli ifade: ad, isteğe bağlı işleç, isteğe bağlı sürüm; groups() üç değer verir.'],
      why: 'Düzenli ifadede işleç ve sürüm grupları isteğe bağlı (?) olduğu için eksik olduklarında None döner; alternatifler uzun işleçlerden (==, >=) kısa olanlara (>) sıralanır ki >= önce denensin.' },

    { t: 'code', id: 'sanal-ortam-pip-2',
      q: '<p><code>surum_karsilastir(a, b)</code> fonksiyonunu yaz. <code>a</code> ve <code>b</code> <code>"2.10.0"</code> gibi sürüm metinleridir. Noktayla bölüp her parçayı tam sayıya çevir; eksik parçaları 0 say (<code>"2.2"</code> ile <code>"2.2.0"</code> eşit). <code>a &lt; b</code> ise <code>-1</code>, eşitse <code>0</code>, büyükse <code>1</code> döndür.</p>',
      start: 'def surum_karsilastir(a, b):\n    pass\n',
      sol: 'def surum_karsilastir(a, b):\n    pa = [int(p) for p in a.split(".")]\n    pb = [int(p) for p in b.split(".")]\n    n = max(len(pa), len(pb))\n    pa += [0] * (n - len(pa))\n    pb += [0] * (n - len(pb))\n    if pa < pb:\n        return -1\n    if pa > pb:\n        return 1\n    return 0\n',
      tests: 'assert surum_karsilastir("2.10.0", "2.9.0") == 1, "2.10.0 > 2.9.0 olmalı (metin karşılaştırması yanıltır)"\nassert surum_karsilastir("2.9.0", "2.10.0") == -1, "2.9.0 < 2.10.0"\nassert surum_karsilastir("2.2", "2.2.0") == 0, "Eksik parça 0 sayılmalı"\nassert surum_karsilastir("3.0.0", "2.99.99") == 1, "MAJOR öncelikli"\nassert surum_karsilastir("1.0.1", "1.0.1") == 0, "Eşit sürüm 0"\nassert surum_karsilastir("1.0", "1.0.5") == -1, "1.0 < 1.0.5"\n',
      hints: ['[int(p) for p in a.split(".")] ile listeye çevir.', 'Kısa listeyi 0 ile doldur; sonra liste karşılaştırması soldan sağa çalışır.'],
      why: 'Tam sayı listeleri sözlük sırasıyla karşılaştırılır: önce MAJOR, eşitse MINOR, eşitse PATCH. Metin karşılaştırmasında "1" < "9" olduğu için 10, 9\'dan küçük görünürdü.' },

    { t: 'code', id: 'sanal-ortam-pip-3',
      q: '<p><code>bagimliliklar(toml_metni, grup=None)</code> fonksiyonunu yaz. <code>tomllib.loads</code> ile pyproject içeriğini oku. <code>grup</code> None ise <code>[project].dependencies</code> listesini, bir grup adı verilmişse <code>[project.optional-dependencies]</code> altındaki o grubun listesini döndür. Grup yoksa boş liste döndür.</p>',
      start: 'import tomllib\n\ndef bagimliliklar(toml_metni, grup=None):\n    pass\n',
      sol: 'import tomllib\n\ndef bagimliliklar(toml_metni, grup=None):\n    proje = tomllib.loads(toml_metni).get("project", {})\n    if grup is None:\n        return list(proje.get("dependencies", []))\n    return list(proje.get("optional-dependencies", {}).get(grup, []))\n',
      tests: 'py = \'[project]\\nname = "anadolu-rapor"\\nversion = "0.3.1"\\ndependencies = ["pandas==2.2.2", "openpyxl>=3.1"]\\n\\n[project.optional-dependencies]\\ndev = ["pytest>=8", "ruff"]\\n\\n[tool.ruff]\\nline-length = 100\\n\'\nassert bagimliliklar(py) == ["pandas==2.2.2", "openpyxl>=3.1"], "Ana bağımlılıklar dönmeli"\nassert bagimliliklar(py, "dev") == ["pytest>=8", "ruff"], "dev grubu dönmeli"\nassert bagimliliklar(py, "docs") == [], "Olmayan grupta boş liste"\nassert bagimliliklar(\'[project]\\nname = "x"\\n\') == [], "dependencies yoksa boş liste"\n',
      hints: ['tomllib.loads(metin)["project"]', 'optional-dependencies bir sözlüktür; .get(grup, []) ile güvenle al.'],
      why: 'tomllib TOML\'ı iç içe sözlüklere çevirir; get zinciri eksik alanlarda KeyError yerine boş liste vermeyi sağlar.' },

    { t: 'mc', q: 'Ekip arkadaşın projeyi klonladı, <code>pip install -r requirements.txt</code> çalıştırmadan betiği başlattı ve ModuleNotFoundError aldı. Ama senin repoda <code>.venv</code> klasörü de vardı. Doğru yaklaşım hangisi?',
      o: ['.venv klasörünü Git\'e ekleyip herkesle paylaşmak, böylece kurulum gerekmez', '.venv\'i .gitignore\'a yazıp requirements.txt ile kurdurmak', 'Paketleri global kurmasını söylemek', 'Betiğin başına subprocess ile pip install çağıran bir satır eklemek'],
      a: 1,
      why: 'Sanal ortam makineye özgüdür (mutlak yollar, işletim sistemi); paylaşılmaz, bağımlılık listesinden yeniden kurulur. Global kurulum projeler arası çatışma yaratır; betik içinden pip çağırmak ise kırılgan ve güvensizdir.' },

    { t: 'code', id: 'sanal-ortam-pip-4',
      q: '<p><code>kosulu_saglar(surum, kosul)</code> fonksiyonunu yaz. <code>surum</code> <code>"2.2.5"</code> gibi bir metin, <code>kosul</code> ise <code>"&gt;=2.2"</code>, <code>"==2.2.5"</code>, <code>"&lt;3"</code> ya da <code>"~=2.2.0"</code> gibi tek koşuldur. Sürümleri tam sayı demetine çevirip (eksik parçalar 0) koşulu değerlendir. <code>~=X.Y.Z</code>: <code>&gt;=X.Y.Z</code> ve <code>&lt;X.(Y+1)</code>; <code>~=X.Y</code>: <code>&gt;=X.Y</code> ve <code>&lt;(X+1)</code>. Bool döndür.</p>',
      start: 'import re\n\ndef _demet(s, n=3):\n    p = [int(x) for x in s.split(".")]\n    return tuple(p + [0] * (n - len(p)))\n\ndef kosulu_saglar(surum, kosul):\n    pass\n',
      sol: 'import re\n\ndef _demet(s, n=3):\n    p = [int(x) for x in s.split(".")]\n    return tuple(p + [0] * (n - len(p)))\n\ndef kosulu_saglar(surum, kosul):\n    m = re.match(r"^(==|>=|<=|~=|>|<)\\s*([0-9.]+)$", kosul.strip())\n    op, hedef_metin = m.groups()\n    v = _demet(surum)\n    hedef = _demet(hedef_metin)\n    if op == "==":\n        return v == hedef\n    if op == ">=":\n        return v >= hedef\n    if op == "<=":\n        return v <= hedef\n    if op == ">":\n        return v > hedef\n    if op == "<":\n        return v < hedef\n    # ~= : son yazılan basamak serbest\n    parcalar = [int(x) for x in hedef_metin.split(".")]\n    ust = parcalar[:-1]\n    ust[-1] += 1\n    ust_demet = _demet(".".join(str(x) for x in ust))\n    return hedef <= v < ust_demet\n',
      tests: 'assert kosulu_saglar("2.2.5", ">=2.2") is True, "2.2.5 >= 2.2"\nassert kosulu_saglar("2.1.9", ">=2.2") is False, "2.1.9 < 2.2"\nassert kosulu_saglar("2.2.5", "==2.2.5") is True, "tam eşleşme"\nassert kosulu_saglar("2.10.0", "<3") is True, "2.10.0 < 3"\nassert kosulu_saglar("3.0.0", "<3") is False, "3.0.0 < 3 değil"\nassert kosulu_saglar("2.2.9", "~=2.2.0") is True, "~=2.2.0: 2.2.9 uygun"\nassert kosulu_saglar("2.3.0", "~=2.2.0") is False, "~=2.2.0: 2.3.0 uygun değil"\nassert kosulu_saglar("2.9.0", "~=2.2") is True, "~=2.2: 2.9.0 uygun (minor serbest)"\nassert kosulu_saglar("3.0.0", "~=2.2") is False, "~=2.2: 3.0.0 uygun değil"\n',
      hints: ['Önce düzenli ifadeyle işleç ve sürümü ayır; _demet ile demete çevir.', '~= için üst sınır: yazılan sürümün son parçasını at, bir öncekini 1 artır.'],
      why: 'Demet karşılaştırması sürüm sırasını doğru verir. ~= işlecinin üst sınırı, kaç basamak yazıldığına bağlıdır; bu yüzden sınır orijinal metinden hesaplanır, doldurulmuş demetten değil.' },

    { t: 'mc', q: '<code>pip freeze &gt; requirements.txt</code> ile üretilen dosyanın asıl amacı nedir?',
      o: ['Projenin istediği en düşük sürümleri ve esnek aralıkları belgelemek', 'Kurulu tam sürümlerin fotoğrafını alıp başka makinede aynısını kurmak', 'Kullanılmayan paketleri bulup sanal ortamdan temizlemek', 'pyproject.toml dosyasını kurulu paketlerden otomatik üretmek'],
      a: 1,
      why: 'freeze, kurulu her paketi paket==sürüm biçiminde yazar; bu, dağıtımda birebir aynı ortamı yeniden kurmak içindir. En düşük sürümler ve esnek aralıklar pyproject.toml\'un işidir.' }
  ],
  faq: [
    { q: 'conda ile venv arasındaki fark ne?', a: 'conda hem Python hem Python dışı (C kütüphaneleri, R) paketleri yönetir ve veri bilimi ekosisteminde yaygındır. venv yalnızca Python paketleri içindir ve standart kütüphaneyle gelir. Şirketin hangisini kullandığına uy; mantık aynıdır: projeye özel izole ortam.' },
    { q: 'requirements.txt mi pyproject.toml mu?', a: 'Yeni projede pyproject.toml ana kaynak; requirements.txt (ya da kilit dosyası) dağıtım için ondan üretilir. Eski projelerde yalnızca requirements.txt görürsün; ikisini de okuyabilmen yeter.' },
    { q: 'Paketi yanlışlıkla global kurdum, ne olur?', a: 'Genelde zarar yok ama projeler arası sürüm çatışması riski doğar. pip uninstall ile kaldır, sanal ortamı etkinleştirip yeniden kur. Terminalde (.venv) ön ekini görmeden pip install yazmamayı alışkanlık edin.' },
    { q: 'uv kullanıyorsam pip öğrenmeme gerek var mı?', a: 'Var: uv, pip komutlarını da destekler (uv pip install) ve şirket sunucularının çoğunda hâlâ yalnızca pip bulunur. uv/poetry, pip bilgisinin üstüne gelen kolaylıktır, yerine geçen değil.' }
  ],
  mistakes: [
    { bad: '"2.10.0" > "2.9.0"  # False', good: 'tuple(map(int, "2.10.0".split("."))) > tuple(map(int, "2.9.0".split(".")))  # True', why: 'Metin karşılaştırması karakter karakter gider: "1" < "9" olduğu için 10, 9\'dan küçük görünür. Sürümler tam sayı parçalarıyla karşılaştırılır.' },
    { bad: 'git add .venv/', good: 'echo ".venv/" >> .gitignore', why: 'Sanal ortam makineye özgü ve büyüktür; depoya girmez. Paylaşılan şey bağımlılık listesidir.' },
    { bad: 'pandas\nrequests\n# requirements.txt (sürümsüz)', good: 'pandas==2.2.2\nrequests~=2.31.0', why: 'Sürümsüz liste her kurulumda farklı sürüm getirir; "dün çalışıyordu" sorununa yol açar. Dağıtımda sürüm sabitle.' },
    { bad: 'pip install pandas  # (.venv) etkin değilken', good: 'source .venv/bin/activate\npip install pandas', why: 'Ortam etkin değilse paket global kuruluma gider ve proje ortamında bulunamaz.' }
  ]
},
/* ───────────────────────── 5. git-proje-yapisi ───────────────────────── */
{
  id: 'git-proje-yapisi',
  lv: 'orta',
  mod: 'Kalite ve Proje',
  min: 35,
  title: 'Git ve proje yapısı',
  sum: 'Temel Git akışını (init, add, commit, branch, merge, pull request) kavrar, .gitignore kurallarını fnmatch ile çözümler, src yerleşimli proje ağacı kurar, README yazar, config ve .env ile gizli bilgiyi koddan ayırır ve kod inceleme kültürünü tanırsın.',
  goals: [
    'init, add, commit, branch, merge ve pull request adımlarıyla temel Git akışını anlatabilirim.',
    '.gitignore kurallarını okuyup bir dosya yolunun kurala uyup uymadığını fnmatch ile belirleyebilirim.',
    'src yerleşimli standart bir Python proje ağacını kurabilir ve doğrulayabilirim.',
    'Gizli bilgiyi .env ve os.environ ile koddan ayırabilir, eksik değişkende anlamlı hata verebilirim.',
    'Kod incelemesinde (code review) neye bakılacağını ve nasıl yorum yazılacağını açıklayabilirim.'
  ],
  body: `
<h2>Neden Git?</h2>
<p>Anadolu Bank'ın risk ekibinde üç analist aynı rapor betiğini geliştiriyor. "rapor_v2_son_FINAL.py" dosyaları e-postayla dolaşıyor, kimin hangi satırı değiştirdiği belli değil, dün çalışan sürüm kayboldu. Git, sürüm kontrol sistemi (version control system) olarak bu kaosu bitirir: her değişiklik kim, ne zaman, neden bilgisiyle kaydedilir; herkes aynı anda ayrı dallarda çalışır; istenirse herhangi bir güne geri dönülür. Git öğrenmek Python'dan bağımsız bir beceri ama Python geliştiricisi için şart: işe alım testlerinde ilk sorulan şey GitHub profilindir.</p>
<div class="note"><b>Bu derste Git komutları gösterilir</b>Tarayıcıda Git çalıştıramayız; komutları kendi bilgisayarında dene. Kod alıştırmaları Git ve proje yapısının Python tarafını işler: .gitignore kurallarını eşleştirmek, proje ağacını doğrulamak, ortam değişkeni okumak.</div>

<h2>Temel akış: init, add, commit</h2>
<p>Git üç bölgeyle çalışır: çalışma dizini (dosyaların), hazırlık alanı (staging, "sonraki kayda girecekler") ve depo (repository, kalıcı geçmiş). Günlük döngü şudur:</p>
<div class="steps-list"><ol>
<li><code>git init</code> — klasörü depo yapar (bir kez).</li>
<li>Dosyaları düzenle; <code>git status</code> ile neyin değiştiğini gör.</li>
<li><code>git add src/rapor.py</code> — değişikliği hazırlık alanına koy (<code>git add .</code> hepsini).</li>
<li><code>git commit -m "Şehir raporuna KDV sütunu eklendi"</code> — anlamlı bir mesajla kaydet.</li>
<li><code>git log --oneline</code> — geçmişi gör.</li>
</ol></div>
<p>İyi commit mesajı emir kipinde, kısa ve "ne, neden" sorusuna yanıt verir: "KDV hesabını Decimal'e taşı (float yuvarlama hatası)". "düzeltmeler", "wip", "asdf" gibi mesajlar üç ay sonra hiçbir şey anlatmaz.</p>

<h2>Dal, birleştirme ve pull request</h2>
<p>Dal (branch), ana koda dokunmadan deneme yapmanı sağlar. <code>git switch -c sehir-raporu</code> yeni dal açar; orada commit'lersin; iş bitince <code>git switch main</code> ve <code>git merge sehir-raporu</code> ile birleştirirsin. Ekip çalışmasında birleştirme doğrudan değil, <b>pull request</b> (PR; GitLab'da merge request) üzerinden yapılır: dalını sunucuya <code>git push</code> ile gönderirsin, PR açarsın, ekip arkadaşın inceler, onaylar, sonra main'e birleşir. Aynı satırı iki kişi farklı değiştirdiyse çakışma (conflict) çıkar; Git dosyaya <code>&lt;&lt;&lt;&lt;&lt;&lt;&lt;</code> ve <code>&gt;&gt;&gt;&gt;&gt;&gt;&gt;</code> işaretleri koyar, sen doğru halini seçip yeniden commit'lersin.</p>
<div class="tbl-wrap"><table>
<tr><th>Komut</th><th>Ne yapar</th></tr>
<tr><td>git clone URL</td><td>Uzak depoyu indirir</td></tr>
<tr><td>git switch -c dal-adi</td><td>Yeni dal açıp ona geçer</td></tr>
<tr><td>git pull</td><td>Uzaktaki değişiklikleri alır</td></tr>
<tr><td>git push -u origin dal-adi</td><td>Dalı uzak depoya gönderir</td></tr>
<tr><td>git merge dal-adi</td><td>Dalı bulunduğun dala birleştirir</td></tr>
<tr><td>git diff</td><td>Kaydedilmemiş değişiklikleri gösterir</td></tr>
<tr><td>git restore dosya</td><td>Dosyadaki kaydedilmemiş değişikliği geri alır</td></tr>
<tr><td>git stash</td><td>Yarım işi geçici rafa kaldırır</td></tr>
</table></div>

<h2>.gitignore: neyi depoya koymazsın?</h2>
<p>Sanal ortam, önbellek, gizli anahtar ve büyük veri dosyaları depoya girmez. <code>.gitignore</code> dosyası satır satır desen (pattern) içerir; Git o desenlere uyan dosyaları görmezden gelir. Desenler kabuk joker karakterleriyle yazılır: <code>*</code> herhangi karakter dizisi, <code>?</code> tek karakter, sonda <code>/</code> klasör, başta <code>!</code> istisna. Python tarafında aynı jokerleri <code>fnmatch</code> modülü çözer; CI betiklerinde "bu dosya ignore'da mı" kontrolü böyle yazılır.</p>
<pre class="py">from fnmatch import fnmatch

gitignore = """
# Python
__pycache__/
*.pyc
.venv/
# Gizli bilgi
.env
# Veri ve çıktı
data/*.csv
*.log
!onemli.log
"""

def kurallar(metin: str) -&gt; list[str]:
    return [s.strip() for s in metin.splitlines() if s.strip() and not s.strip().startswith("#")]

def yok_sayilir_mi(yol: str, kurallar: list[str]) -&gt; bool:
    sonuc = False
    for k in kurallar:
        istisna = k.startswith("!")
        desen = k[1:] if istisna else k
        if desen.endswith("/"):
            uydu = yol.startswith(desen) or ("/" + desen) in ("/" + yol)
        else:
            uydu = fnmatch(yol, desen) or fnmatch(yol.rsplit("/", 1)[-1], desen)
        if uydu:
            sonuc = not istisna
    return sonuc

k = kurallar(gitignore)
for yol in ["src/rapor.py", "src/__pycache__/rapor.cpython-312.pyc", ".env", "data/satis.csv", "data/README.md", "hata.log", "onemli.log", ".venv/bin/python"]:
    print(f"{yol:40} {'YOK SAY' if yok_sayilir_mi(yol, k) else 'izle'}")</pre>
<p>Kurallar sırayla uygulanır ve son eşleşen kazanır; bu yüzden <code>!onemli.log</code> satırı <code>*.log</code>'dan sonra gelince istisna olur. Gerçek Git'in eşleştirme kuralları biraz daha zengindir (<code>**</code>, kök bağıl yollar) ama bu basit model günlük ihtiyacın yüzde doksanını karşılar.</p>
<div class="warn"><b>Bir kez push edilen gizli bilgi geri alınamaz</b>.env dosyasını yanlışlıkla commit'leyip push ettiysen silmek yetmez: geçmişte kalır. Anahtarı derhal iptal edip yenisini üret. .env satırını .gitignore'a <b>ilk commit'ten önce</b> yaz.</div>

<h2>Proje yapısı: src yerleşimi</h2>
<p>Küçük bir betik tek dosya olabilir; ama test, bağımlılık ve ekip devreye girince standart bir ağaç gerekir. Python topluluğunun önerdiği <b>src yerleşimi</b> (src layout), paketi <code>src/</code> altına koyar; böylece testler yanlışlıkla kurulmamış yerel kodu değil, kurulmuş paketi test eder.</p>
<pre class="py">import tempfile
from pathlib import Path

AGAC = {
    "README.md": "# Anadolu Rapor\\n\\nŞehir bazlı satış raporu aracı.\\n\\n## Kurulum\\n\\n    pip install -e .\\n",
    ".gitignore": ".venv/\\n__pycache__/\\n.env\\n",
    "pyproject.toml": '[project]\\nname = "anadolu-rapor"\\nversion = "0.1.0"\\n',
    ".env.example": "DB_URL=sqlite:///market.db\\nAPI_KEY=buraya-anahtar\\n",
    "src/anadolu_rapor/__init__.py": "",
    "src/anadolu_rapor/rapor.py": "def sehir_ozeti(satirlar):\\n    return {}\\n",
    "tests/test_rapor.py": "import unittest\\n",
}

with tempfile.TemporaryDirectory() as d:
    kok = Path(d) / "anadolu-rapor"
    for yol, icerik in AGAC.items():
        hedef = kok / yol
        hedef.parent.mkdir(parents=True, exist_ok=True)
        hedef.write_text(icerik, encoding="utf-8")
    for p in sorted(kok.rglob("*")):
        derinlik = len(p.relative_to(kok).parts) - 1
        print("  " * derinlik + ("+ " if p.is_dir() else "- ") + p.name)
    print("README ilk satır:", (kok / "README.md").read_text(encoding="utf-8").splitlines()[0])</pre>
<p>README (benioku) dosyası projenin kapısıdır: ne yapar, nasıl kurulur, nasıl çalıştırılır, nasıl test edilir. Dört başlık yeterlidir. <code>.env.example</code> ise gerçek değerler olmadan hangi ortam değişkenlerinin gerektiğini gösterir; depoya girer, <code>.env</code> girmez.</p>

<h2>Config ve .env: gizli bilgi koddan ayrı</h2>
<p>Veritabanı parolası, API anahtarı, e-posta şifresi kodda yazmaz. Bunlar ortam değişkeni (environment variable) olarak işletim sisteminden okunur: <code>os.environ</code> bir sözlük gibi davranır. Geliştirme makinesinde değişkenleri <code>.env</code> dosyasından yüklersin (python-dotenv paketi ya da birkaç satırlık kendi okuyucun); sunucuda ise dağıtım sistemi onları doğrudan tanımlar. Kod iki ortamda da aynıdır.</p>
<pre class="py">import os

ENV_ORNEK = """
# Anadolu Market yerel ayarlar
DB_URL=sqlite:///market.db
API_KEY="abc-123"
DEBUG=true
"""

def env_yukle(metin: str) -&gt; dict[str, str]:
    degerler = {}
    for satir in metin.splitlines():
        satir = satir.strip()
        if not satir or satir.startswith("#") or "=" not in satir:
            continue
        ad, deger = satir.split("=", 1)
        degerler[ad.strip()] = deger.strip().strip('"').strip("'")
    return degerler

for ad, deger in env_yukle(ENV_ORNEK).items():
    os.environ.setdefault(ad, deger)   # gerçek ortamda zaten varsa ezme

def ayar(ad: str, varsayilan: str | None = None) -&gt; str:
    deger = os.environ.get(ad, varsayilan)
    if deger is None:
        raise RuntimeError(f"Eksik ortam değişkeni: {ad} (.env dosyasını kontrol et)")
    return deger

print("DB_URL :", ayar("DB_URL"))
print("API_KEY:", ayar("API_KEY")[:3] + "***")
print("DEBUG  :", ayar("DEBUG").lower() == "true")
print("PORT   :", ayar("PORT", "8000"))
try:
    ayar("SMTP_SIFRE")
except RuntimeError as e:
    print("hata:", e)</pre>
<p><code>setdefault</code> önemli: sunucuda tanımlı gerçek değer varsa .env'deki değeri yazmaz. Eksik değişkende programın ilk saniyede anlaşılır bir mesajla durması, iki saat sonra "None" hatasıyla çökmesinden iyidir.</p>
<div class="tip"><b>Anahtarı loglama</b>Hata ayıklarken <code>print(os.environ)</code> yazmak tüm gizli bilgileri log dosyasına döker. Değeri göstermen gerekiyorsa ilk üç karakter artı yıldız yeter.</div>

<h2>Kod inceleme kültürü</h2>
<p>Pull request'in asıl değeri kodun ikinci bir göz tarafından okunmasıdır. İnceleyen (reviewer) şunlara bakar: iş kuralı doğru mu, test var mı, isimler anlaşılır mı, gizli bilgi sızmış mı, aynı şey daha basit yazılabilir mi? Yorum yazarken kişiyi değil kodu konuş: "Bu döngü O(n²), sözlükle tek geçişte olur" iyi; "Bunu nasıl böyle yazarsın" kötü. Yazar olarak ise PR'ı küçük tut (bir PR bir iş), açıklamaya "neden"i yaz ve yorumları savunma değil öğrenme fırsatı olarak gör. İncelemeyi bekletmemek de nezakettir: küçük PR aynı gün incelenir.</p>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Dal stratejisi ve otomasyon</h3>
<p>Ekipler büyüdükçe dal düzeni kural haline gelir. En yaygın model "GitHub flow": <code>main</code> her zaman çalışır durumdadır; her iş kısa ömürlü bir dalda yapılır (<code>feature/sehir-raporu</code>, <code>fix/kdv-yuvarlama</code>); PR ile birleşir; birleşince dal silinir. Daha katı kurumlarda (bankacılık gibi) <code>develop</code> ve <code>release</code> dalları da olur. Hangi modeli kullanırsan kullan, kural aynı: main'e doğrudan push yok, her değişiklik incelenir.</p>
<p>Otomasyon bunu destekler. Pre-commit kancaları (hook) commit'ten önce biçimlendiriciyi (ruff, black) ve basit kontrolleri çalıştırır; böylece inceleme, girinti ve boşluk tartışmasına harcanmaz. CI (GitHub Actions, GitLab CI) her PR'da testleri koşar ve kırmızıysa birleştirmeyi engeller. Commit mesajlarında "Conventional Commits" düzeni (<code>feat:</code>, <code>fix:</code>, <code>docs:</code>) değişiklik günlüğünü otomatik üretmeyi sağlar. İleri seviyedeki "Kalite ve CI" dersinde bu zinciri uçtan uca kuracaksın; bugün için hedefin küçük: anlamlı commit, temiz .gitignore, gizli bilgi .env'de.</p>
</section>
`,
  ex: [
    { t: 'mc', q: 'Yeni bir özellik üzerinde çalışırken ana kodu bozmamak için ilk yapılacak şey hangisidir?',
      o: ['git commit -m "wip"', 'git switch -c ozellik-adi', 'git stash', 'git push origin main'],
      a: 1,
      why: 'Yeni dal açmak (switch -c) işi ana koddan izole eder. stash yarım işi geçici kaldırır, wip commit geçmişi kirletir, main\'e push ise tam da kaçınılması gereken şeydir.' },

    { t: 'code', id: 'git-proje-yapisi-1',
      q: '<p><code>yok_sayilir_mi(yol, kurallar)</code> fonksiyonunu yaz. <code>kurallar</code> .gitignore satırlarının listesidir (yorum ve boş satırlar temizlenmiş gelir). Kural türleri: (1) sonu <code>/</code> ile bitenler klasör kuralıdır: yol o klasörle başlıyorsa ya da yolun içinde <code>/klasor/</code> geçiyorsa uyar; (2) diğerleri <code>fnmatch</code> ile tam yola <b>veya</b> dosya adına (son parça) uygulanır; (3) <code>!</code> ile başlayan kural istisnadır. Kurallar sırayla değerlendirilir, <b>son eşleşen</b> kazanır. Bool döndür.</p>',
      start: 'from fnmatch import fnmatch\n\ndef yok_sayilir_mi(yol, kurallar):\n    pass\n',
      sol: 'from fnmatch import fnmatch\n\ndef yok_sayilir_mi(yol, kurallar):\n    sonuc = False\n    for k in kurallar:\n        istisna = k.startswith("!")\n        desen = k[1:] if istisna else k\n        if desen.endswith("/"):\n            uydu = yol.startswith(desen) or ("/" + desen) in ("/" + yol)\n        else:\n            uydu = fnmatch(yol, desen) or fnmatch(yol.rsplit("/", 1)[-1], desen)\n        if uydu:\n            sonuc = not istisna\n    return sonuc\n',
      tests: 'k = ["__pycache__/", "*.pyc", ".venv/", ".env", "data/*.csv", "*.log", "!onemli.log"]\nassert yok_sayilir_mi("src/rapor.py", k) is False, "src/rapor.py izlenmeli"\nassert yok_sayilir_mi("src/__pycache__/rapor.cpython-312.pyc", k) is True, "__pycache__ içindeki dosya yok sayılmalı"\nassert yok_sayilir_mi(".env", k) is True, ".env yok sayılmalı"\nassert yok_sayilir_mi("config/.env", k) is True, "Dosya adı eşleşmesi: config/.env de yok sayılmalı"\nassert yok_sayilir_mi("data/satis.csv", k) is True, "data/*.csv yok sayılmalı"\nassert yok_sayilir_mi("data/README.md", k) is False, "data/README.md izlenmeli"\nassert yok_sayilir_mi("hata.log", k) is True, "*.log yok sayılmalı"\nassert yok_sayilir_mi("onemli.log", k) is False, "!onemli.log istisnası sonra geldiği için izlenmeli"\nassert yok_sayilir_mi(".venv/bin/python", k) is True, ".venv/ klasör kuralı"\nassert yok_sayilir_mi("hata.log", ["!*.log", "*.log"]) is True, "Son eşleşen kazanmalı"\n',
      hints: ['Her kural için önce ! kontrolü yap, deseni ayır.', 'fnmatch(yol, desen) or fnmatch(yol.rsplit("/", 1)[-1], desen); sonuç = not istisna.'],
      why: 'Son eşleşen kazandığı için döngü tüm kuralları gezer ve her eşleşmede sonucu günceller; istisna kuralı eşleşince sonucu False\'a çeker.' },

    { t: 'code', id: 'git-proje-yapisi-2',
      q: '<p><code>proje_dogrula(kok)</code> fonksiyonunu yaz. <code>kok</code> bir <code>Path</code>\'tir. Şu yolları kontrol et ve <b>eksik</b> olanların listesini (kök bağıl, <code>/</code> ayırıcılı metin) döndür: <code>README.md</code>, <code>pyproject.toml</code>, <code>.gitignore</code>, <code>src/</code> (klasör), <code>tests/</code> (klasör). Ayrıca <code>.gitignore</code> varsa içinde <code>.env</code> satırı yoksa listeye <code>".gitignore:.env"</code> ekle. Hepsi tamamsa boş liste döndür.</p>',
      start: 'from pathlib import Path\n\ndef proje_dogrula(kok):\n    pass\n',
      sol: 'from pathlib import Path\n\ndef proje_dogrula(kok):\n    eksik = []\n    for ad in ("README.md", "pyproject.toml", ".gitignore"):\n        if not (kok / ad).is_file():\n            eksik.append(ad)\n    for ad in ("src", "tests"):\n        if not (kok / ad).is_dir():\n            eksik.append(ad + "/")\n    gi = kok / ".gitignore"\n    if gi.is_file():\n        satirlar = [s.strip() for s in gi.read_text(encoding="utf-8").splitlines()]\n        if ".env" not in satirlar:\n            eksik.append(".gitignore:.env")\n    return eksik\n',
      tests: 'import tempfile\nfrom pathlib import Path\nwith tempfile.TemporaryDirectory() as d:\n    kok = Path(d)\n    assert sorted(proje_dogrula(kok)) == sorted(["README.md", "pyproject.toml", ".gitignore", "src/", "tests/"]), "Boş klasörde 5 eksik olmalı"\n    (kok / "README.md").write_text("# x", encoding="utf-8")\n    (kok / "pyproject.toml").write_text("[project]", encoding="utf-8")\n    (kok / ".gitignore").write_text(".venv/\\n__pycache__/\\n", encoding="utf-8")\n    (kok / "src").mkdir()\n    (kok / "tests").mkdir()\n    assert proje_dogrula(kok) == [".gitignore:.env"], ".env satırı eksikse .gitignore:.env dönmeli"\n    (kok / ".gitignore").write_text(".venv/\\n.env\\n", encoding="utf-8")\n    assert proje_dogrula(kok) == [], "Tam projede boş liste"\n    (kok / "tests").rmdir()\n    (kok / "tests").write_text("dosya", encoding="utf-8")\n    assert proje_dogrula(kok) == ["tests/"], "tests bir dosyaysa klasör eksik sayılmalı"\n',
      hints: ['(kok / ad).is_file() ve (kok / ad).is_dir() ile kontrol et.', '.gitignore satırlarını strip edip ".env" var mı diye bak.'],
      why: 'is_file ve is_dir ayrımı, aynı adda yanlış türde bir şey varsa (klasör yerine dosya) eksik saymayı sağlar; .gitignore içeriği satır bazında okunur.' },

    { t: 'code', id: 'git-proje-yapisi-3',
      q: '<p>İki fonksiyon yaz. <code>env_yukle(metin)</code>: .env içeriğini okuyup <code>{AD: deger}</code> sözlüğü döndürsün; boş satır ve <code>#</code> yorumlarını atlasın, ilk <code>=</code> işaretinden bölsün, değerin başındaki/sonundaki tek ya da çift tırnağı kaldırsın. <code>ayar(ad, varsayilan=None)</code>: <code>os.environ</code>\'dan okusun; değer yoksa ve varsayılan None ise <code>RuntimeError</code> fırlatsın (mesajda değişken adı geçsin), aksi halde değeri döndürsün.</p>',
      start: 'import os\n\ndef env_yukle(metin):\n    pass\n\ndef ayar(ad, varsayilan=None):\n    pass\n',
      sol: 'import os\n\ndef env_yukle(metin):\n    degerler = {}\n    for satir in metin.splitlines():\n        satir = satir.strip()\n        if not satir or satir.startswith("#") or "=" not in satir:\n            continue\n        ad, deger = satir.split("=", 1)\n        degerler[ad.strip()] = deger.strip().strip(\'"\').strip("\'")\n    return degerler\n\ndef ayar(ad, varsayilan=None):\n    deger = os.environ.get(ad, varsayilan)\n    if deger is None:\n        raise RuntimeError(f"Eksik ortam değişkeni: {ad}")\n    return deger\n',
      tests: 'import os\nmetin = "# yerel\\nDB_URL=sqlite:///market.db\\nAPI_KEY=\\"abc-123\\"\\nSIFRE=\'gizli=1\'\\n\\nDEBUG = true\\n"\nd = env_yukle(metin)\nassert d == {"DB_URL": "sqlite:///market.db", "API_KEY": "abc-123", "SIFRE": "gizli=1", "DEBUG": "true"}, "Sözlük beklenen gibi olmalı (tırnaklar kalkmalı, ilk = ile bölünmeli)"\nos.environ["PP_TEST_X"] = "42"\nassert ayar("PP_TEST_X") == "42", "Ortamdaki değer dönmeli"\nassert ayar("PP_TEST_YOK_123", "8000") == "8000", "Yoksa varsayılan dönmeli"\ntry:\n    ayar("PP_TEST_YOK_123")\n    assert False, "Eksik değişkende RuntimeError fırlatılmalı"\nexcept RuntimeError as e:\n    assert "PP_TEST_YOK_123" in str(e), "Hata mesajında değişken adı geçmeli"\ndel os.environ["PP_TEST_X"]\n',
      hints: ['split("=", 1) ilk eşittir işaretinden böler; değerde = varsa korunur.', 'os.environ.get(ad, varsayilan) None dönerse raise RuntimeError(f"... {ad}")'],
      why: 'split("=", 1) değer içindeki eşittiri korur; strip zinciri tırnakları temizler. ayar fonksiyonu eksik yapılandırmayı ilk anda anlaşılır biçimde bildirir.' },

    { t: 'mc', q: 'Bir ekip arkadaşın yanlışlıkla <code>.env</code> dosyasını commit edip push etti ve sonra sildi. Şimdi ne yapılmalı?',
      o: ['Hiçbir şey; dosya silindiği için geçmişte de kalmaz, sorun yok', '.env\'i .gitignore\'a eklemek yeterli, geçmişteki kopya zararsızdır', 'Anahtarları derhal iptal edip yenilemek, .gitignore\'a eklemek', 'Yerel depoyu silip uzak depodan yeniden klonlamak'],
      a: 2,
      why: 'Push edilen içerik Git geçmişinde ve uzak sunucuda kalır; silmek geçmişi temizlemez. Sızan anahtar artık sızmış sayılır ve iptal edilir. .gitignore tekrarını önler ama olanı geri almaz.' },

    { t: 'code', id: 'git-proje-yapisi-4',
      q: '<p><code>commit_mesaji_gecerli(mesaj)</code> fonksiyonunu yaz. Ekip kuralı: mesaj <code>feat:</code>, <code>fix:</code>, <code>docs:</code>, <code>test:</code> ya da <code>refactor:</code> ile başlamalı; iki noktadan sonra bir boşluk ve en az 10 karakterlik açıklama gelmeli; ilk satır en fazla 72 karakter olmalı. Yalnızca ilk satır değerlendirilir. Bool döndür.</p>',
      start: 'def commit_mesaji_gecerli(mesaj):\n    pass\n',
      sol: 'ONEKLER = ("feat", "fix", "docs", "test", "refactor")\n\ndef commit_mesaji_gecerli(mesaj):\n    ilk = mesaj.splitlines()[0] if mesaj else ""\n    if len(ilk) > 72 or ":" not in ilk:\n        return False\n    onek, _, aciklama = ilk.partition(":")\n    if onek not in ONEKLER:\n        return False\n    if not aciklama.startswith(" "):\n        return False\n    return len(aciklama.strip()) >= 10\n',
      tests: 'assert commit_mesaji_gecerli("feat: şehir raporuna KDV sütunu eklendi") is True, "Geçerli feat mesajı"\nassert commit_mesaji_gecerli("fix: KDV hesabını Decimal\'e taşı\\n\\nfloat yuvarlama hatası vardı") is True, "Çok satırlı mesajda yalnızca ilk satır değerlendirilir"\nassert commit_mesaji_gecerli("düzeltmeler") is False, "Önek yoksa geçersiz"\nassert commit_mesaji_gecerli("feat:boşluksuz açıklama burada") is False, "İki noktadan sonra boşluk şart"\nassert commit_mesaji_gecerli("fix: kısa") is False, "Açıklama en az 10 karakter"\nassert commit_mesaji_gecerli("chore: bağımlılıkları güncelle") is False, "chore izin verilen önek değil"\nassert commit_mesaji_gecerli("docs: " + "a" * 70) is False, "72 karakteri aşan ilk satır geçersiz"\nassert commit_mesaji_gecerli("") is False, "Boş mesaj geçersiz"\n',
      hints: ['splitlines()[0] ile ilk satırı al; partition(":") ile öneki ayır.', 'Açıklama " " ile başlamalı ve strip sonrası uzunluğu >= 10 olmalı.'],
      why: 'partition ilk iki noktadan böler; önek kümeye bakılır, açıklamanın boşlukla başlaması ve uzunluğu ayrı ayrı denetlenir. Bu tür bir kontrol pre-commit kancası olarak çalıştırılır.' },

    { t: 'mc', q: 'Kod incelemesinde (code review) aşağıdaki yorumlardan hangisi iyi örnektir?',
      o: ['Bu nasıl çalışıyor hiç anlamadım, lütfen baştan yaz, böyle olmaz.', 'İç içe döngü O(n²); şehir sözlüğüyle tek geçişte olur, örnek yazayım mı?', 'Bence olmuş, hiçbir şeye bakmadım ama onaylıyorum, birleştirelim.', 'Girintiler 2 boşluk olmalıydı, ekipte herkes öyle yazıyor, düzelt.'],
      a: 1,
      why: 'İyi yorum kodu konuşur, somut sorun ve çözüm önerir, yardım teklif eder. "Baştan yaz" kişiselleştirir ve yol göstermez; girinti tartışması biçimlendiriciye bırakılır; içeriksiz onay inceleme sayılmaz.' },

    { t: 'mc', q: 'src yerleşiminin (src layout) temel avantajı nedir?',
      o: ['Daha az klasör gerektirdiği için proje ağacı sade kalır', 'Testler kurulu paketi test eder, yerel kodu değil', 'pip install gerekmeden paket doğrudan içe aktarılır', 'Aynı dosyada çalışan ekip üyeleri arasında Git çakışmalarını azaltır'],
      a: 1,
      why: 'Paket src/ altında olunca proje kökünden çalışan testler onu doğrudan içe aktaramaz; pip install -e . ile kurulu paket kullanılır. Böylece "bende çalışıyor, kurulumda bozuk" hataları yakalanır.' }
  ],
  faq: [
    { q: 'Git ile GitHub aynı şey mi?', a: 'Hayır. Git bilgisayarında çalışan sürüm kontrol aracıdır; GitHub (ve GitLab, Bitbucket) Git depolarını barındıran, pull request ve inceleme arayüzü sunan web hizmetidir. Git olmadan GitHub olmaz, ama GitHub olmadan Git olur.' },
    { q: 'Ne sıklıkla commit yapmalıyım?', a: 'Çalışan her mantıksal adımda: bir fonksiyon, bir test, bir düzeltme. Günde birkaç küçük commit, haftada bir dev commit\'ten iyidir; geri almak ve incelemek kolaylaşır.' },
    { q: '.env dosyasını Python nasıl okur?', a: 'Standart kütüphanede hazır okuyucu yok; derste yazdığımız birkaç satır ya da python-dotenv paketi (load_dotenv) kullanılır. Sunucuda .env yerine dağıtım aracı değişkenleri doğrudan tanımlar; kod os.environ üzerinden aynı şekilde okur.' },
    { q: 'Tek kişilik projede dal ve PR gerekli mi?', a: 'Zorunlu değil ama alışkanlık değerli: dal açıp birleştirmek main\'i her zaman çalışır tutar ve iş başvurusunda GitHub geçmişin düzenli görünür.' }
  ],
  mistakes: [
    { bad: 'API_KEY = "sk-abc123..."  # kodun içinde', good: 'API_KEY = os.environ["API_KEY"]', why: 'Kodda yazılan gizli bilgi depoya girer ve herkesin eline geçer; ortam değişkeni koddan ayrı yaşar.' },
    { bad: 'git add .\ngit commit -m "düzeltmeler"', good: 'git add src/rapor.py\ngit commit -m "fix: KDV hesabını Decimal\'e taşı"', why: 'Anlamsız mesaj geçmişi işe yaramaz kılar; add . ise istemediğin dosyaları (.env, veri) da ekleyebilir.' },
    { bad: 'print(os.environ)  # hata ayıklama', good: 'print(ayar("API_KEY")[:3] + "***")', why: 'Tüm ortamı yazdırmak gizli bilgileri log dosyasına döker. Yalnızca gerekli değeri, maskeleyerek göster.' },
    { bad: '# .gitignore\n*.py', good: '# .gitignore\n__pycache__/\n*.pyc\n.venv/\n.env', why: 'Kaynak kodu yok saymak projeyi boş bırakır; yok sayılan şey türetilmiş, makineye özgü ve gizli dosyalardır.' }
  ]
},
/* ───────────────────────── 6. proje-orta ───────────────────────── */
{
  id: 'proje-orta',
  lv: 'orta',
  mod: 'Bitirme',
  min: 60,
  title: 'Orta bitirme projesi: Anadolu Bank işlem analizi',
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
<p>Anadolu Bank'ın kart operasyon ekibi senden küçük ama gerçekçi bir araç istiyor: günlük kart işlemlerini okuyacak, kategori bazında harcamayı özetleyecek, şüpheli görünen işlemleri işaretleyecek ve sonucu JSON raporu olarak verecek. Ekip, kuralların test edilmiş olmasını şart koşuyor; çünkü yanlış pozitif bir müşterinin kartını gereksiz yere bloke eder, yanlış negatif ise dolandırıcılığı kaçırır.</p>
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
);
})(window);
