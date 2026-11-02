/* ───────────────────────── 2. kapsam-moduller ───────────────────────── */
{
  id: 'kapsam-moduller',
  lv: 'temel',
  mod: 'Fonksiyonlar ve Modüller',
  min: 28,
  title: 'Kapsam ve modüller',
  sum: 'Bir adın nerede geçerli olduğunu (LEGB) öğrenir, global tuzağından kaçınır, import biçimlerini ve __name__ kalıbını kavrar, math/random/statistics ile standart kütüphaneye ilk adımı atarsın.',
  goals: [
    'Yerel ve global kapsamı ayırt edip LEGB arama sırasını açıklayabilirim.',
    'global anahtar sözcüğünün ne zaman gerekip ne zaman tuzak olduğunu söyleyebilirim.',
    'import, from ... import ve as biçimlerini yerinde kullanabilirim.',
    'if __name__ == "__main__" kalıbının ne işe yaradığını anlatabilirim.',
    'math, random ve statistics modülleriyle hesap yapabilir, random için seed kullanabilirim.'
  ],
  body: `
<h2>Bir isim nerede görünür?</h2>
<p>Ilgaz Bank'ta günlük işlem raporu üreten bir betik yazdın. Fonksiyonun içinde <code>toplam</code> adında bir değişken var, dışarıda da başka bir <code>toplam</code>. Hangisi hangisi? Python bunu <b>kapsam</b> (scope) kurallarıyla çözer: her ad belirli bir bölgede geçerlidir. Fonksiyon içinde atanan ad o fonksiyona aittir, dışarıdan görünmez; fonksiyon bittiğinde silinir.</p>
<pre class="py">komisyon_orani = 0.002          # global (modül düzeyi)

def komisyon(tutar):
    kesinti = tutar * komisyon_orani   # global okunur
    return round(kesinti, 2)

print(komisyon(15000))
print(komisyon_orani)
try:
    print(kesinti)               # yerel ad dışarıdan görünmez
except NameError as e:
    print("Hata:", e)</pre>
<p><code>kesinti</code> fonksiyonun <b>yerel</b> (local) değişkenidir; dışarıda yoktur. <code>komisyon_orani</code> ise <b>global</b>: modülün en üst düzeyinde tanımlandı, her fonksiyon onu okuyabilir.</p>

<h2>LEGB sırası</h2>
<p>Python bir adı gördüğünde dört katmanı sırayla arar: <b>L</b>ocal (içinde bulunulan fonksiyon), <b>E</b>nclosing (iç içe fonksiyonlarda dıştaki fonksiyon), <b>G</b>lobal (modül), <b>B</b>uilt-in (print, len gibi yerleşikler). İlk bulduğunda durur.</p>
<div class="tbl-wrap"><table>
<tr><th>Katman</th><th>Nerede tanımlanır</th><th>Örnek</th></tr>
<tr><td>Local</td><td>Fonksiyon gövdesinde atanan adlar ve parametreler</td><td><code>kesinti</code>, <code>tutar</code></td></tr>
<tr><td>Enclosing</td><td>İç fonksiyonu saran dış fonksiyonun yerelleri</td><td>iç fonksiyonun gördüğü <code>oran</code></td></tr>
<tr><td>Global</td><td>Dosyanın en üst düzeyi</td><td><code>komisyon_orani</code></td></tr>
<tr><td>Built-in</td><td>Python'ın kendisi</td><td><code>print</code>, <code>len</code>, <code>sum</code></td></tr>
</table></div>
<pre class="py">def rapor_hazirla(hesaplar):
    baslik = "Ilgaz Bank Günlük Özet"     # enclosing

    def satir(ad, bakiye):
        return baslik[:12] + " | " + ad + ": " + str(bakiye)   # baslik dıştan okunur

    for ad, bakiye in hesaplar:
        print(satir(ad, bakiye))

rapor_hazirla([("Ayşe", 12500), ("Mehmet", 830)])
print(len("deneme"))      # built-in katmanı</pre>
<div class="warn"><b>Yerleşik adı ezme</b><code>sum = 0</code> ya da <code>list = [1, 2]</code> yazarsan built-in <code>sum</code>/<code>list</code> gölgelenir ve sonraki satırlarda <code>sum(fiyatlar)</code> "int object is not callable" hatası verir. Değişken adlarını yerleşiklerden seçme: <code>toplam</code>, <code>liste</code> de.</div>

<h2>global tuzağı</h2>
<p>Globali okumak serbesttir. Ama fonksiyon içinde ona <b>atama</b> yaparsan Python yeni bir yerel oluşturur; global değişmez. Hem okuyup hem değiştirmeye kalkarsan <code>UnboundLocalError</code> alırsın.</p>
<pre class="py">sayac = 0

def islem_kaydet_yanlis():
    sayac_yerel = sayac + 1      # okumak sorun değil
    return sayac_yerel

def islem_kaydet_global():
    global sayac
    sayac += 1

islem_kaydet_global()
islem_kaydet_global()
print("global sayaç:", sayac)

def islem_kaydet_temiz(sayac):
    return sayac + 1             # saf: değer al, yeni değer döndür

yeni = islem_kaydet_temiz(sayac)
print("temiz yol:", yeni)</pre>
<p><code>global sayac</code> satırı "bu fonksiyonda sayac derken modüldekini kastediyorum" der. Çalışır, ama bir programda on tane fonksiyon aynı globali değiştiriyorsa hangi değeri kimin bozduğunu bulmak kabusa döner. Kural: <b>değeri parametre olarak al, yenisini return et</b>. <code>global</code> yalnızca küçük betiklerde ve bilinçli kullanılan bir istisnadır.</p>
<div class="note"><b>nonlocal</b>İç içe fonksiyonlarda dıştaki fonksiyonun değişkenini değiştirmek için <code>nonlocal</code> kullanılır. Nadir gerekir; dekoratör ve kapanış (closure) konularında karşına çıkacak.</div>

<h2>Modül nedir, nasıl içe aktarılır?</h2>
<p>Bir <code>.py</code> dosyası aynı zamanda bir <b>modüldür</b> (module). <code>fiyat.py</code> içine <code>kdv_hesapla</code> yazdıysan başka dosyadan <code>import fiyat</code> deyip <code>fiyat.kdv_hesapla(100)</code> diye çağırırsın. Python'la gelen yüzlerce modüle <b>standart kütüphane</b> (standard library) denir; hiçbir şey kurmadan kullanılır. Dört import biçimi var:</p>
<pre class="py">import math                      # 1) modülü tümüyle al, math. öneki ile kullan
print(math.ceil(1234.1))

from math import sqrt, floor     # 2) yalnızca istenen adları al
print(sqrt(144), floor(7.9))

import statistics as st          # 3) kısa takma ad (alias)
print(st.mean([120, 85, 230]))

from random import randint as rastgele_tam   # 4) ada takma ad
print(type(rastgele_tam(1, 6)))</pre>
<p>Kurumsal kodda en yaygın olanlar 1 ve 3: <code>math.sqrt</code> yazımı, <code>sqrt</code>'nin nereden geldiğini okuyana söyler. <code>from x import *</code> ise bütün adları dosyaya boca eder; hangi ad nereden geldi belli olmaz, kaçın.</p>

<h2>if __name__ == "__main__"</h2>
<p>Her modülün <code>__name__</code> adlı bir değişkeni vardır. Dosya doğrudan çalıştırılıyorsa değeri <code>"__main__"</code>, başka bir dosya tarafından <code>import</code> edildiyse dosyanın adıdır. Bu sayede aynı dosya hem kütüphane hem de çalıştırılabilir betik olabilir: fonksiyonlar her zaman tanımlanır, ama "demo" ya da "ana akış" kodu yalnızca doğrudan çalıştırıldığında koşar.</p>
<pre class="py">def faiz_hesapla(anapara, yillik_oran, ay):
    """Basit faiz: anapara * oran * (ay / 12)"""
    return round(anapara * yillik_oran * ay / 12, 2)

def main():
    print("Ilgaz Bank mevduat hesabı")
    print("6 ay, 50.000 TL, %40:", faiz_hesapla(50000, 0.40, 6))

print("__name__ değeri:", __name__)
if __name__ == "__main__":
    main()</pre>
<p>Bu dosyayı başka bir yerden <code>import faiz</code> dersen yalnızca <code>faiz_hesapla</code> ve <code>main</code> tanımlanır; demo satırları basılmaz. Yazdığın her betiğe bu kalıbı koymak, ileride test yazarken ve kodu başkasıyla paylaşırken hayat kurtarır.</p>

<h2>Standart kütüphaneye giriş: math, random, statistics</h2>
<pre class="py">import math, random, statistics

# math: matematik
print(math.ceil(2.1), math.floor(2.9), round(2.5), round(3.5))
print(math.sqrt(2), math.pi)

# statistics: temel istatistik
bakiyeler = [1200, 4500, 980, 4500, 13000]
print("ortalama:", statistics.mean(bakiyeler))
print("medyan:", statistics.median(bakiyeler))
print("mod:", statistics.mode(bakiyeler))

# random: rastgelelik, seed ile tekrarlanabilir
random.seed(42)
print(random.randint(1, 100))
print(random.choice(["İstanbul", "Ankara", "İzmir"]))
print(random.sample(range(1000, 2000), 3))</pre>
<p><code>random.seed(42)</code> rastgele sayı üretecini sabit bir başlangıca getirir; aynı seed, aynı dizi. Test yazarken ve sahte veri üretirken bu şart: aksi hâlde testin her koşuda farklı veri görür. <code>round</code>'un 2.5'i 2'ye, 3.5'i 4'e yuvarladığına dikkat et; bu "bankacı yuvarlaması"dır (round half to even), <code>math.floor</code> ve <code>math.ceil</code> ise her zaman aşağı/yukarı gider.</p>
<div class="tip"><b>os ve sys kısaca</b><code>os.getcwd()</code> çalışma klasörünü, <code>os.listdir()</code> dosyaları, <code>sys.argv</code> komut satırı argümanlarını, <code>sys.version</code> Python sürümünü verir. Dosya işlemleri dersinde <code>os</code> ve <code>pathlib</code>'e döneceğiz. Tarayıcı ortamında dosya sistemi bellek içidir, o yüzden burada <code>os.listdir</code> çıktısı bilgisayarındakinden farklı görünür.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Modül bir kez yüklenir</h3>
<p>Aynı modülü on dosyada import etsen de Python onu bir kez çalıştırır ve <code>sys.modules</code> sözlüğünde saklar; sonraki importlar oradan döner. Bu yüzden modülün en üst düzeyine yazdığın kod (örneğin bir veritabanı bağlantısı) yalnızca ilk importta koşar. Modülün üst düzeyinde "iş" yapma; fonksiyon tanımla, işi <code>main()</code> içinde yap.</p>
<h3>Paketler ve kendi modüllerin</h3>
<p>Klasörün içine <code>__init__.py</code> koyarsan o klasör bir <b>paket</b> (package) olur: <code>from anadolu.fiyat import kdv_hesapla</code>. Python modülü bulmak için <code>sys.path</code> listesindeki klasörlere sırayla bakar; ilk sırada çalıştırılan dosyanın klasörü vardır. "ModuleNotFoundError" aldığında ilk kontrol edeceğin şey bu listedir. Git ve proje yapısı dersinde paket düzenine ayrıntılı gireceğiz.</p>
<h3>Kapsam neden önemli?</h3>
<p>Globale bağımlı fonksiyon, dışarıdaki durumu bilmeden test edilemez. Bir üretim sisteminde "fonksiyon dün çalışıyordu, bugün bozuldu" hatalarının büyük kısmı bir yerde değiştirilen global bir değerden çıkar. Fonksiyona ihtiyacı olan her şeyi parametre olarak vermek (dependency injection fikrinin en sade hâli) kodu hem test edilebilir hem taşınabilir yapar.</p>
</section>
`,
  ex: [
    { t: 'mc', q: 'Aşağıdaki kod ne yazdırır?<br><code>x = 10</code><br><code>def f():</code><br><code>&nbsp;&nbsp;&nbsp;&nbsp;x = 5</code><br><code>f()</code><br><code>print(x)</code>',
      o: ['5', '10', 'UnboundLocalError', 'None'], a: 1,
      why: 'Fonksiyon içindeki x = 5 yeni bir yerel değişken oluşturur; global x\'e dokunmaz. Globali değiştirmek için global x gerekirdi.' },
    { t: 'code', id: 'kapsam-moduller-1',
      q: '<p>Aşağıdaki kod <code>global</code> kullanarak <code>toplam_islem</code> sayacını artırıyor. Kodu globalsiz, saf bir fonksiyona çevir: <code>islem_ekle(sayac, tutar)</code> fonksiyonu mevcut sayaç değerini ve tutarı alsın, tutar 0\'dan büyükse sayacı 1 artırılmış olarak, değilse aynı değerle döndürsün. Global değişken kullanma.</p>',
      start: 'toplam_islem = 0\n\ndef islem_ekle(tutar):\n    global toplam_islem\n    if tutar > 0:\n        toplam_islem += 1\n\n# islem_ekle(sayac, tutar) olarak yeniden yaz\n',
      sol: 'def islem_ekle(sayac, tutar):\n    if tutar > 0:\n        return sayac + 1\n    return sayac\n',
      tests: 'assert "global " not in __source__, "global anahtar sözcüğü kullanılmamalı"\nassert islem_ekle(0, 250) == 1, "pozitif tutar sayacı 1 artırmalı"\nassert islem_ekle(5, 0) == 5, "sıfır tutar sayacı değiştirmemeli"\nassert islem_ekle(5, -40) == 5, "negatif tutar sayacı değiştirmemeli"\ns = 0\nfor t in [100, -5, 30, 0, 70]:\n    s = islem_ekle(s, t)\nassert s == 3, "beş işlemden üçü pozitif: sayaç 3 olmalı"\n',
      hints: ['Fonksiyon iki parametre alsın: sayac ve tutar.', 'Değiştirmek yerine yeni değeri return et.'],
      why: 'Saf fonksiyon dış durumu değiştirmez: mevcut değeri parametre olarak alır, yeni değeri döndürür. Çağıran yer sonucu değişkene atar.' },
    { t: 'mc', q: 'Hangi import biçimi, bir modüldeki tüm adları dosyaya kontrolsüzce döktüğü için ekip kodunda kaçınılması gereken biçimdir?',
      o: ['import math', 'from math import sqrt', 'from math import *', 'import statistics as st'], a: 2,
      why: 'Yıldızlı import modüldeki her adı mevcut ad alanına ekler; hangi adın nereden geldiği belirsizleşir ve var olan adlar sessizce ezilebilir. Diğer üç biçim açık ve okunurdur.' },
    { t: 'code', id: 'kapsam-moduller-2',
      q: '<p><code>math</code> modülünü kullanarak <code>kargo_kutusu(adet, kutu_kapasitesi)</code> fonksiyonunu yaz: verilen adet ürünü taşımak için gereken kutu sayısını döndürsün (yukarı yuvarlanmış tam sayı). Ayrıca <code>taksit_tutari(toplam, ay)</code> fonksiyonu toplam tutarı aya bölüp sonucu 2 ondalığa yuvarlasın ve döndürsün.</p>',
      start: 'import math\n\ndef kargo_kutusu(adet, kutu_kapasitesi):\n    pass\n\ndef taksit_tutari(toplam, ay):\n    pass\n',
      sol: 'import math\n\ndef kargo_kutusu(adet, kutu_kapasitesi):\n    return math.ceil(adet / kutu_kapasitesi)\n\ndef taksit_tutari(toplam, ay):\n    return round(toplam / ay, 2)\n',
      tests: 'assert kargo_kutusu(10, 4) == 3, "10 ürün, 4\'lük kutu: 3 kutu"\nassert kargo_kutusu(8, 4) == 2, "8 ürün, 4\'lük kutu: 2 kutu"\nassert kargo_kutusu(1, 12) == 1, "1 ürün: 1 kutu"\nassert isinstance(kargo_kutusu(10, 4), int), "kutu sayısı tam sayı olmalı"\nassert taksit_tutari(1000, 3) == 333.33, "1000 / 3 iki ondalıkla 333.33"\nassert taksit_tutari(2400, 12) == 200.0, "2400 / 12 = 200.0"\n',
      hints: ['math.ceil(x) sayıyı yukarı yuvarlar ve int döndürür.', 'round(toplam / ay, 2) kuruş hassasiyeti verir.'],
      why: 'Kutu sayısında yarım kutu olmaz; math.ceil yukarı yuvarlar. Taksitte ise kuruş için round(…, 2) yeter.' },
    { t: 'code', id: 'kapsam-moduller-3',
      q: '<p><code>statistics</code> modülüyle <code>bakiye_ozeti(bakiyeler)</code> fonksiyonunu yaz. Sayı listesinden üç değerli bir demet döndürsün: ortalama (2 ondalığa yuvarlanmış), medyan ve en yüksek değer.</p>',
      start: 'import statistics\n\ndef bakiye_ozeti(bakiyeler):\n    # (ortalama, medyan, en_yuksek) döndür\n    pass\n',
      sol: 'import statistics\n\ndef bakiye_ozeti(bakiyeler):\n    ort = round(statistics.mean(bakiyeler), 2)\n    med = statistics.median(bakiyeler)\n    return ort, med, max(bakiyeler)\n',
      tests: 'r = bakiye_ozeti([1200, 4500, 980, 4500, 13000])\nassert r == (4836.0, 4500, 13000), "beklenen (4836.0, 4500, 13000), gelen %r" % (r,)\nr2 = bakiye_ozeti([10, 20, 30, 40])\nassert r2[0] == 25.0 and r2[1] == 25.0 and r2[2] == 40, "çift sayıda eleman: medyan ortadaki ikinin ortalaması"\nassert bakiye_ozeti([7]) == (7, 7, 7), "tek elemanlı liste"\n',
      hints: ['statistics.mean ve statistics.median kullan.', 'En yüksek için yerleşik max yeter.'],
      why: 'statistics modülü ortalama ve medyanı hazır verir; demet döndürerek üç değeri tek seferde yollarsın.' },
    { t: 'code', id: 'kapsam-moduller-4',
      q: '<p><code>random</code> modülüyle <code>sahte_siparisler(n, seed)</code> fonksiyonunu yaz. Önce <code>random.seed(seed)</code> çağırsın, sonra n adet sipariş üretip liste olarak döndürsün. Her sipariş bir sözlük: <code>{"sehir": ..., "tutar": ...}</code>. Şehir <code>["İstanbul", "Ankara", "İzmir"]</code> listesinden <code>random.choice</code> ile, tutar <code>random.randint(50, 500)</code> ile seçilsin.</p>',
      start: 'import random\n\nSEHIRLER = ["İstanbul", "Ankara", "İzmir"]\n\ndef sahte_siparisler(n, seed):\n    pass\n',
      sol: 'import random\n\nSEHIRLER = ["İstanbul", "Ankara", "İzmir"]\n\ndef sahte_siparisler(n, seed):\n    random.seed(seed)\n    liste = []\n    for _ in range(n):\n        liste.append({"sehir": random.choice(SEHIRLER), "tutar": random.randint(50, 500)})\n    return liste\n',
      tests: 'a = sahte_siparisler(5, 1)\nassert len(a) == 5, "5 sipariş üretilmeli"\nassert all(set(s.keys()) == {"sehir", "tutar"} for s in a), "her sipariş sehir ve tutar anahtarlarını taşımalı"\nassert all(s["sehir"] in ["İstanbul", "Ankara", "İzmir"] for s in a), "şehir listeden seçilmeli"\nassert all(50 <= s["tutar"] <= 500 for s in a), "tutar 50-500 aralığında olmalı"\nb = sahte_siparisler(5, 1)\nassert a == b, "aynı seed aynı siparişleri üretmeli"\nassert sahte_siparisler(0, 3) == [], "n=0 boş liste vermeli"\n',
      hints: ['Fonksiyonun ilk satırı random.seed(seed) olsun.', 'for _ in range(n): ile n kez sözlük oluşturup listeye ekle.'],
      why: 'seed sabitlenince choice ve randint aynı sırayı üretir; test bu sayede iki çağrının birebir eşit olduğunu doğrulayabilir.' },
    { t: 'mc', q: 'Bir dosyada <code>if __name__ == "__main__":</code> bloğu ne zaman çalışır?',
      o: ['Dosya başka bir modülden import edildiğinde', 'Dosya doğrudan çalıştırıldığında', 'Her zaman', 'Yalnızca main() fonksiyonu tanımlıysa'], a: 1,
      why: 'Doğrudan çalıştırılan dosyanın __name__ değeri "__main__" olur; import edilen dosyada ise modülün adıdır ve blok atlanır. Böylece aynı dosya hem kütüphane hem betik olur.' },
    { t: 'code', id: 'kapsam-moduller-5',
      q: '<p><code>net_maas(brut, kesinti_orani=0.15)</code> fonksiyonu brütten kesinti düşüp sonucu 2 ondalığa yuvarlayarak döndürsün. Ardından <code>main()</code> fonksiyonu tanımla; bu fonksiyon <code>print(net_maas(30000))</code> çalıştırsın. <code>main()</code> çağrısı yalnızca <code>if __name__ == "__main__":</code> bloğunun içinde olsun.</p>',
      start: 'def net_maas(brut, kesinti_orani=0.15):\n    pass\n\ndef main():\n    pass\n\n# __name__ kontrolü ile main() çağır\n',
      sol: 'def net_maas(brut, kesinti_orani=0.15):\n    return round(brut * (1 - kesinti_orani), 2)\n\ndef main():\n    print(net_maas(30000))\n\nif __name__ == "__main__":\n    main()\n',
      tests: 'assert net_maas(30000) == 25500.0, "30000 brüt, %15 kesinti: 25500.0"\nassert net_maas(10000, 0.2) == 8000.0, "10000 brüt, %20 kesinti: 8000.0"\nassert "__name__" in __source__ and "__main__" in __source__, "if __name__ == \\"__main__\\": kalıbı kullanılmalı"\n',
      expect: '25500.0\n',
      hints: ['net = brut * (1 - kesinti_orani).', 'Dosyanın sonuna if __name__ == "__main__": main() yaz.'],
      why: 'Bu ortamda kod doğrudan çalıştığı için __name__ "__main__" olur ve main() koşar; aynı dosya import edilseydi yalnızca fonksiyonlar tanımlanırdı.' }
  ],
  faq: [
    { q: 'Fonksiyon içinden global değişkeni okumak için de global yazmam gerekir mi?', a: 'Hayır. Okumak serbesttir; LEGB sırası globali bulur. global yalnızca fonksiyon içinde o ada yeni bir değer atamak istediğinde gerekir ve o da genelde kötü tasarım işaretidir.' },
    { q: 'import math ile from math import sqrt arasında performans farkı var mı?', a: 'Pratikte yok; modül her iki durumda da bir kez yüklenir. Fark okunurluktur: math.sqrt yazımı adın nereden geldiğini gösterir, bu yüzden ekip kodunda tercih edilir.' },
    { q: 'random.seed olmadan testler neden bozulur?', a: 'Seed verilmezse üreteç sistem saatinden başlar ve her koşuda farklı sayı üretir. Test "beklenen değer" ile karşılaştıramaz. Seed sabitlenince dizi tekrarlanabilir olur.' },
    { q: 'Kendi yazdığım .py dosyasını nasıl import ederim?', a: 'Aynı klasöre koy ve dosya adını .py olmadan yaz: fiyat.py için import fiyat. Dosya adı Python kurallarına uymalı (boşluk ve tire yok) ve standart kütüphane modülleriyle çakışmamalı; random.py adlı bir dosya gerçek random modülünü gölgeler.' }
  ],
  mistakes: [
    { bad: 'sayac = 0\ndef art():\n    sayac += 1', good: 'def art(sayac):\n    return sayac + 1', why: 'Fonksiyon içinde atama yapılan ad yerel sayılır; okunmadan artırılamaz ve UnboundLocalError verir. Parametre al, değer döndür.' },
    { bad: 'sum = 0\nfor f in fiyatlar:\n    sum += f\nprint(sum(fiyatlar))', good: 'toplam = 0\nfor f in fiyatlar:\n    toplam += f\nprint(sum(fiyatlar))', why: 'sum adını değişkene verince yerleşik sum fonksiyonu gölgelenir ve çağrı "int object is not callable" hatası verir.' },
    { bad: 'import math\nprint(sqrt(16))', good: 'import math\nprint(math.sqrt(16))', why: 'import math yalnızca math adını getirir; sqrt\'ye math. öneki ile ulaşılır ya da from math import sqrt yazılır.' },
    { bad: 'main()', good: 'if __name__ == "__main__":\n    main()', why: 'Koşulsuz çağrı, dosya import edildiğinde de main()\'i çalıştırır; kalıp bunu yalnızca doğrudan çalıştırmaya sınırlar.' }
  ]
},
