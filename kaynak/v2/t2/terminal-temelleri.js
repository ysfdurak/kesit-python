/* Kesit Python v2/t2 — Terminal ve komut satırı */
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push({
  id: 'terminal-temelleri',
  lv: 'temel',
  mod: 'Başlangıç',
  min: 35,
  title: 'Terminal ve komut satırı',
  sum: 'Çalışma dizini, göreli/mutlak yol, python betik.py ve -m, sys.argv ile argüman, sys.exit ile çıkış kodu, stdout/stderr, yönlendirme ve ortam değişkenleriyle betiklerini terminalden profesyonelce çalıştırırsın.',
  goals: ['Terminalde klasörler arasında gezinip dosya ve klasörleri Windows ile macOS/Linux komutlarıyla yönetebilirim.', 'Göreli ve mutlak yolu ayırt eder, pathlib ile yolları birleştirip çözebilirim.', 'Betiğe sys.argv ile argüman verir, sayıya dönüştürür ve eksik argümanı yakalarım.', 'Çıkış kodu, stdout ve stderr ile betiğimin sonucunu diğer programlara doğru bildiririm.', 'Ortam değişkenlerini os.environ ile güvenli varsayılanlarla okurum.'],
  body: `
<h2>Neden terminal?</h2>
<p>Anadolu Market'in gece 02.00'de çalışan stok raporu bir sunucuda, kimsenin ekranına bakmadığı bir makinede koşar. Orada VS Code yok, "Çalıştır" düğmesi yok; yalnızca <b>terminal</b> (terminal, komut satırı, shell) var. Veri ekipleri betiklerini terminalden çalıştırır, zamanlayıcılar (cron, Windows Görev Zamanlayıcı) betiği terminal komutuyla başlatır, CI sistemleri testleri terminalde koşturur. Terminali rahat kullanmak, "kendi bilgisayarımda çalışıyor" ile "şirkette her gece çalışıyor" arasındaki köprüdür.</p>
<p>Bu derste terminalin dört temel fikrini öğreneceksin: <b>neredesin</b> (çalışma dizini), <b>neyi çalıştırıyorsun</b> (komut ve argümanlar), <b>sonuç ne oldu</b> (çıkış kodu) ve <b>veri nereye akıyor</b> (standart girdi/çıktı/hata). Python tarafında bunların karşılığı <code>os.getcwd()</code>, <code>sys.argv</code>, <code>sys.exit()</code>, <code>sys.stdin/stdout/stderr</code> ve <code>os.environ</code>'dur. Kurulum dersinde terminali açıp <code>python --version</code> yazmıştın; şimdi derine iniyoruz.</p>

<h2>Neredesin? Çalışma dizini</h2>
<p>Terminal her an bir klasörün "içinde" durur; buna <b>çalışma dizini</b> (working directory, cwd) denir. Yazdığın göreli dosya adları bu klasöre göre çözülür. Nerede olduğunu <code>pwd</code> (macOS/Linux) ya da <code>cd</code> (Windows'ta tek başına) söyler; başka klasöre <code>cd klasor</code> ile geçersin.</p>
<pre class="code">$ pwd
/home/ayse
$ mkdir anadolu-rapor
$ cd anadolu-rapor
$ ls
$ cd ..
$ pwd
/home/ayse</pre>
<p>Python içinden çalışma dizinini <code>os.getcwd()</code> ya da <code>pathlib.Path.cwd()</code> verir. Tarayıcıdaki Python da sanal bir dosya sisteminde çalışır; aşağıdaki kodu çalıştırıp kendi "konumunu" gör:</p>
<pre class="py">import os
from pathlib import Path

print("Çalışma dizini:", os.getcwd())
print("Path ile:", Path.cwd())
os.makedirs("rapor_deneme", exist_ok=True)   # mkdir'in Python karşılığı
os.chdir("rapor_deneme")                     # cd'nin Python karşılığı
print("Şimdi:", os.getcwd())
os.chdir("..")
print("Geri döndük:", os.getcwd())</pre>

<h2>Windows ve macOS/Linux komutları</h2>
<p>macOS ve Linux aynı aileden (Unix) gelir, komutları neredeyse aynıdır. Windows'ta iki terminal vardır: eski <b>cmd</b> ve modern <b>PowerShell</b>. PowerShell, <code>ls</code>, <code>pwd</code>, <code>cat</code> gibi Unix adlarını da takma ad (alias) olarak tanır; bu yüzden yeni başlayanlara PowerShell'i öneririz.</p>
<div class="tbl-wrap"><table>
<tr><th>Ne yapar</th><th>macOS / Linux</th><th>Windows cmd</th><th>PowerShell</th></tr>
<tr><td>Bulunduğun klasör</td><td><code>pwd</code></td><td><code>cd</code></td><td><code>pwd</code> / <code>Get-Location</code></td></tr>
<tr><td>Klasör içeriği</td><td><code>ls</code>, <code>ls -la</code></td><td><code>dir</code></td><td><code>ls</code> / <code>dir</code></td></tr>
<tr><td>Klasöre gir / üst klasör</td><td><code>cd veri</code> / <code>cd ..</code></td><td><code>cd veri</code> / <code>cd ..</code></td><td>aynı</td></tr>
<tr><td>Klasör oluştur</td><td><code>mkdir rapor</code></td><td><code>mkdir rapor</code></td><td><code>mkdir rapor</code></td></tr>
<tr><td>Dosya içeriğini göster</td><td><code>cat satis.csv</code></td><td><code>type satis.csv</code></td><td><code>cat</code> / <code>Get-Content</code></td></tr>
<tr><td>Kopyala / taşı / sil</td><td><code>cp</code> / <code>mv</code> / <code>rm</code></td><td><code>copy</code> / <code>move</code> / <code>del</code></td><td><code>cp</code> / <code>mv</code> / <code>rm</code></td></tr>
<tr><td>Ekranı temizle</td><td><code>clear</code></td><td><code>cls</code></td><td><code>cls</code> / <code>clear</code></td></tr>
<tr><td>Metin içinde ara</td><td><code>grep HATA log.txt</code></td><td><code>findstr HATA log.txt</code></td><td><code>Select-String HATA log.txt</code></td></tr>
<tr><td>Python'ı çağır</td><td><code>python3</code></td><td><code>py</code> ya da <code>python</code></td><td><code>py</code> ya da <code>python</code></td></tr>
<tr><td>Ortam değişkeni oku</td><td><code>echo $HOME</code></td><td><code>echo %USERPROFILE%</code></td><td><code>$env:USERPROFILE</code></td></tr>
<tr><td>Son çıkış kodu</td><td><code>echo $?</code></td><td><code>echo %ERRORLEVEL%</code></td><td><code>$LASTEXITCODE</code></td></tr>
</table></div>
<div class="tip"><b>Tab tuşu senin dostun</b>Klasör ya da dosya adının ilk birkaç harfini yazıp Tab'a bas; terminal gerisini tamamlar. Yukarı ok tuşu önceki komutu geri getirir. Bu iki alışkanlık yazım hatalarının çoğunu önler.</div>

<h2>Göreli ve mutlak yol</h2>
<p><b>Mutlak yol</b> (absolute path) kökten başlar: <code>/home/ayse/veri/satis.csv</code> ya da <code>C:\\Users\\ayse\\veri\\satis.csv</code>. Nerede olursan ol aynı dosyayı gösterir. <b>Göreli yol</b> (relative path) çalışma dizinine göre yorumlanır: <code>veri/satis.csv</code>, <code>./satis.csv</code> (bu klasör), <code>../arsiv/eski.csv</code> (bir üst klasör). <code>~</code> ise macOS/Linux'ta ev klasörünün kısaltmasıdır.</p>
<pre class="py">import posixpath
from pathlib import PurePosixPath

cwd = PurePosixPath("/home/ayse/anadolu-rapor")
goreli = "../veri/./satis.csv"

birlesik = cwd / goreli
print("Birleştirilmiş:", birlesik)
print("Sadeleştirilmiş:", posixpath.normpath(str(birlesik)))
print("Mutlak mı?", PurePosixPath(goreli).is_absolute(), PurePosixPath("/etc/hosts").is_absolute())
print("Dosya adı:", birlesik.name, "| uzantı:", birlesik.suffix, "| gövde:", birlesik.stem)</pre>
<p><code>PurePosixPath</code> diske dokunmadan yalnızca yol metniyle çalışır; bu yüzden her bilgisayarda aynı sonucu verir ve test yazmak için idealdir. <code>/</code> operatörü yolları birleştirir. <code>..</code> parçalarını sadeleştirmek için <code>posixpath.normpath</code> kullanılır (gerçek diskte <code>Path.resolve()</code> aynı işi yapar).</p>
<div class="warn"><b>Betik nerede, sen neredesin?</b>Betiğin <code>open("veri/satis.csv")</code> diyorsa dosya, betiğin klasörüne göre değil, <b>terminalin bulunduğu klasöre</b> göre aranır. <code>cd</code> yapmadan başka yerden çalıştırırsan FileNotFoundError alırsın. Sağlam çözüm: <code>Path(__file__).parent / "veri" / "satis.csv"</code>.</div>

<h2>Python'ı terminalden çalıştırmak</h2>
<pre class="code">python rapor.py               # betiği çalıştır (macOS/Linux'ta çoğu zaman python3)
py rapor.py                   # Windows'ta Python başlatıcısı
python -m pip install rich    # pip'i "bu Python'ın" modülü olarak çalıştır
python -m venv .venv          # sanal ortam oluştur
python -m json.tool veri.json # JSON'u güzel biçimde yazdır
python -c "print(2 ** 10)"    # tek satırlık kod</pre>
<p><code>python betik.py</code> bir dosyayı, <code>python -m modul</code> ise Python'ın bulduğu bir <b>modülü</b> betik gibi çalıştırır. <code>pip</code> yerine <code>python -m pip</code> yazmak, paketin tam olarak o Python'a kurulmasını garanti eder; bilgisayarda birden fazla Python varken en sık karışıklığı böyle önlersin.</p>

<h2>Betiğe argüman vermek: sys.argv</h2>
<p>Terminalde betik adından sonra yazdığın her kelime <b>argüman</b> (argument) olur ve <code>sys.argv</code> listesine metin (str) olarak düşer. İlk eleman (<code>sys.argv[0]</code>) her zaman betiğin adıdır.</p>
<pre class="code">$ python rapor.py İzmir 7 --detay
# sys.argv == ["rapor.py", "İzmir", "7", "--detay"]</pre>
<p>Tarayıcıda terminal olmadığı için aynı mantığı bir liste ile taklit ediyoruz. Profesyonel kodda da yaygın kalıp budur: argümanları <code>main(argv)</code> fonksiyonuna parametre olarak vermek; böylece fonksiyonu test edebilirsin.</p>
<pre class="py">def main(argv):
    if len(argv) &lt; 2:
        print("Kullanım: python rapor.py &lt;şehir&gt; [gün]")
        return 2
    sehir = argv[1]
    gun = int(argv[2]) if len(argv) &gt; 2 else 7     # argümanlar hep str!
    print(f"{sehir} için son {gun} günün raporu hazırlanıyor")
    return 0

print("Kod:", main(["rapor.py", "İzmir", "30"]))
print("Kod:", main(["rapor.py", "Ankara"]))
print("Kod:", main(["rapor.py"]))</pre>
<div class="note"><b>Argümanlar her zaman metindir</b><code>"7"</code> ile <code>7</code> farklıdır. Sayı bekliyorsan <code>int()</code> ile dönüştür. Çok seçenekli araçlar için standart kütüphanedeki <code>argparse</code> modülünü orta seviyede göreceksin; sys.argv onun altında yatan temeldir.</div>

<h2>Çıkış kodu: işin sonucu bir sayı</h2>
<p>Her program bittiğinde işletim sistemine bir <b>çıkış kodu</b> (exit code) bırakır. Kural basittir: <b>0 başarı</b>, 0 dışındaki her şey hata. Gelenek olarak 1 genel hata, 2 hatalı kullanım (eksik/yanlış argüman) demektir. Zamanlayıcılar ve CI sistemleri ekrana değil bu sayıya bakar: kod 0 değilse alarm üretir.</p>
<p>Python'da <code>sys.exit(kod)</code> çağırınca <code>SystemExit</code> istisnası fırlatılır ve program o kodla biter. Hiç çağırmazsan ve hata da olmazsa kod 0'dır; yakalanmamış bir istisnada kod 1 olur.</p>
<pre class="py">import sys

def kontrol(satir_sayisi):
    if satir_sayisi == 0:
        print("Rapor boş, çıkılıyor", file=sys.stderr)
        sys.exit(1)
    print("Rapor tamam:", satir_sayisi, "satır")

for n in [120, 0]:
    try:
        kontrol(n)
    except SystemExit as e:
        print("Program şu kodla bitecekti:", e.code)</pre>

<h2>Standart girdi, çıktı ve hata</h2>
<p>Her program üç "boru" ile doğar: <b>standart girdi</b> (stdin, klavyeden ya da başka programdan gelen veri), <b>standart çıktı</b> (stdout, asıl sonuç) ve <b>standart hata</b> (stderr, uyarı ve hata mesajları). <code>print()</code> varsayılan olarak stdout'a yazar; <code>print(..., file=sys.stderr)</code> ise stderr'e. İkisi ekranda aynı görünür ama ayrı borulardır ve ayrı yönlendirilebilir.</p>
<pre class="py">import sys, io

def ozetle(tutarlar, out=sys.stdout, err=sys.stderr):
    gecerli = []
    for t in tutarlar:
        if t &lt; 0:
            print(f"UYARI: negatif tutar atlandı: {t}", file=err)
        else:
            gecerli.append(t)
    print(f"toplam={sum(gecerli)}", file=out)

hata_kutusu = io.StringIO()          # stderr'i bir metin kutusunda yakala
ozetle([250, -40, 1200], err=hata_kutusu)
print("Yakalanan uyarılar:", hata_kutusu.getvalue().strip())</pre>
<p>Akışı parametre yapmak (<code>out</code>, <code>err</code>) fonksiyonu test edilebilir kılar: testte <code>io.StringIO</code> verirsin, gerçekte <code>sys.stdout</code>. Kullanıcıdan girdi almayı (<code>input()</code>) "Kullanıcı girdisi ve tür dönüşümü" dersinde derinlemesine göreceksin.</p>

<h2>Yönlendirme ve boru hattı</h2>
<pre class="code">python rapor.py İzmir &gt; rapor.txt        # stdout'u dosyaya yaz (üzerine)
python rapor.py Bursa &gt;&gt; rapor.txt       # dosyanın sonuna ekle
python rapor.py İzmir 2&gt; hatalar.log      # yalnız stderr'i dosyaya
python rapor.py İzmir &gt; out.txt 2&gt;&amp;1     # ikisini aynı dosyaya
cat stok.log | grep HATA | wc -l        # boru: birinin çıktısı diğerinin girdisi
type stok.log | findstr HATA            # Windows cmd karşılığı
python temizle.py &lt; ham.csv &gt; temiz.csv  # stdin'i dosyadan oku</pre>
<p><code>|</code> (boru, pipe) Unix felsefesinin kalbidir: her araç tek işi iyi yapar, borularla birleşir. Senin betiğin de iyi bir boru vatandaşı olsun: <b>veriyi stdout'a, mesajları stderr'e</b> yaz. Böylece <code>&gt; sonuc.csv</code> yapan kişi dosyasında uyarı satırı bulmaz.</p>

<h2>Ortam değişkenleri</h2>
<p><b>Ortam değişkenleri</b> (environment variables), işletim sisteminin programa verdiği anahtar-değer ayarlarıdır: <code>PATH</code>, <code>HOME</code>, veritabanı adresi, ortam adı (geliştirme/canlı). Python'da <code>os.environ</code> bir sözlük gibi davranır. Değer her zaman metindir ve olmayabilir; bu yüzden <code>.get(ad, varsayilan)</code> kullan.</p>
<pre class="code">export ANADOLU_ORTAM=canli        # macOS/Linux (bu oturum için)
set ANADOLU_ORTAM=canli           # Windows cmd
$env:ANADOLU_ORTAM = "canli"      # PowerShell</pre>
<pre class="py">import os

ortam = os.environ.get("ANADOLU_ORTAM", "gelistirme")
zaman_asimi = int(os.environ.get("ZAMAN_ASIMI", "30"))
print("Ortam:", ortam, "| zaman aşımı:", zaman_asimi, "sn")
print("PATH tanımlı mı?", "PATH" in os.environ)

os.environ["ANADOLU_ORTAM"] = "test"     # yalnız bu süreç ve alt süreçleri görür
print("Yeni değer:", os.environ["ANADOLU_ORTAM"])</pre>
<div class="warn"><b>Parolayı koda yazma</b>Veritabanı parolası, API anahtarı gibi sırlar kod dosyasına değil ortam değişkenine (ya da gizli kasa/vault aracına) konur. Kod Git'e gider; ortam değişkeni gitmez. <code>os.environ["SIFRE"]</code> değişken yoksa KeyError verir, <code>.get()</code> ise None ya da varsayılanı döndürür.</div>

<div class="note"><b>Gerçek işte</b>Ilgaz Bank'ın gün sonu mutabakat betiği şöyle çağrılır: <code>python -m mutabakat 2026-10-27 --sube 0412 &gt; mutabakat.csv 2&gt; mutabakat.log</code>. Zamanlayıcı her gece bu komutu koşturur; veritabanı adresi <code>BANKA_DB_URL</code> ortam değişkeninden gelir. Betik çıkış kodu 0 dönerse CSV muhasebeye gider; 1 dönerse nöbetçi geliştiriciye otomatik bildirim düşer ve log dosyası incelenir. Hiç kimse ekrana bakmaz; her şeyi çıkış kodu, stdout ve stderr anlatır.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Test edilebilir komut satırı kalıbı</h3>
<p>Profesyonel Python betiklerinin neredeyse hepsi aynı iskeleti kullanır: tüm iş <code>main(argv)</code> içinde yapılır, fonksiyon çıkış kodunu <b>döndürür</b>, <code>sys.exit</code> yalnızca en dışta bir kez çağrılır.</p>
<pre class="py">import sys

def main(argv, env=None, out=sys.stdout, err=sys.stderr):
    env = env if env is not None else {}
    if len(argv) != 2:
        print("Kullanım: stok.py &lt;depo&gt;", file=err)
        return 2
    esik = int(env.get("STOK_ESIK", "10"))
    print(f"{argv[1]} deposu, eşik {esik}", file=out)
    return 0

kod = main(["stok.py", "Gebze"], env={"STOK_ESIK": "25"})
print("Çıkış kodu:", kod)
# Gerçek betikte en altta:
# if __name__ == "__main__":
#     sys.exit(main(sys.argv, dict(os.environ)))</pre>
<p>Bu kalıbın üç faydası var: testte argv, ortam ve akışları istediğin gibi verirsin; çıkış kodu tek yerden yönetilir; modül içe aktarıldığında (<code>import</code>) hiçbir şey kendiliğinden çalışmaz.</p>
<h3>Tırnaklar ve boşluklu argümanlar</h3>
<p>Terminal argümanları boşluktan böler: <code>python rapor.py Kahraman Maraş</code> iki argüman verir. Tek argüman için tırnak kullan: <code>"Kahraman Maraş"</code>. Python'da bir komut satırını terminal gibi bölmek için <code>shlex.split('rapor.py "Kahraman Maraş" 7')</code> kullanılır. Alt süreç (subprocess) çalıştırırken komutu tek metin yerine liste olarak vermek de aynı nedenle güvenlidir.</p>
<h3>Çıkış kodu sözleşmesi</h3>
<p>Ekibinle bir tablo üzerinde anlaş: 0 başarı, 1 iş hatası (veri bozuk), 2 kullanım hatası, 3 dış sistem erişilemiyor gibi. Zamanlayıcı kuralları ("kod 3 ise 10 dakika sonra yeniden dene") bu sözleşmeye dayanır. Unix'te 126-255 arası kodlar kabuğa ayrılmıştır; kendi kodlarını küçük tut.</p>
</section>
`,
  ex: [{ t: 'mc',
      stage: 'Isınma',
      q: 'Terminalde <code>/home/ayse/proje</code> klasöründesin ve <code>cd ..</code> yazıyorsun. Ardından <code>pwd</code> ne gösterir?',
      o: ['/home/ayse/proje/..', '/home/ayse', '/home', 'Hata verir; .. bir klasör adı değildir'],
      a: 1,
      why: '<code>..</code> her klasörde bulunan "bir üst klasör" kısaltmasıdır. cd .. seni proje\'nin üstüne, /home/ayse\'ye taşır. pwd sadeleşmiş yolu yazar, ".." içeren hâli değil.' },
    { t: 'mc',
      stage: 'Isınma',
      q: '<code>python rapor.py İzmir 7</code> komutuyla çalışan betikte <code>sys.argv[1]</code> nedir?',
      o: ['"rapor.py"', '7 (int)', '"İzmir"', '["İzmir", "7"]'],
      a: 2,
      why: 'sys.argv[0] betiğin adıdır; argümanlar 1. indeksten başlar. Tüm argümanlar str olarak gelir; "7" de int değil metindir.' },
    { t: 'mc',
      stage: 'Isınma',
      q: 'Gece çalışan bir betik bitince zamanlayıcı "başarısız" alarmı veriyor. Zamanlayıcı başarıyı genellikle neye bakarak anlar?',
      o: ['Çıkış kodunun 0 olmasına', 'Ekrana "Bitti" yazılmasına', 'stderr\'in boş olmasına', 'Betiğin 1 dakikadan kısa sürmesine'],
      a: 0,
      why: 'İşletim sistemi ve zamanlayıcılar çıkış koduna bakar: 0 başarı, diğerleri hata. stderr\'e uyarı yazan ama 0 ile biten program başarılı sayılır.' }],
  faq: [
    { q: 'python mu yazmalıyım, python3 mü, py mi?',
      a: 'macOS ve Linux\'ta sistemde eski Python 2 kalıntıları olabildiği için genellikle <code>python3</code> yazılır. Windows\'ta resmi kurulum <code>py</code> başlatıcısını getirir; <code>py -3.12</code> ile sürüm de seçebilirsin. Sanal ortam etkinken üçü de aynı Python\'ı gösterir; emin olmak için <code>python -c "import sys; print(sys.executable)"</code> yaz.' },
    { q: 'Komut "is not recognized" ya da "command not found" diyor. Neden?',
      a: 'Terminal o programı PATH ortam değişkenindeki klasörlerde bulamadı. Ya kurulu değil, ya kurulumda PATH\'e eklenmedi, ya da terminal kurulumdan önce açıldı. Terminali kapatıp aç; olmazsa kurulum dersindeki PATH adımlarına dön.' },
    { q: 'sys.exit() ile return arasındaki fark ne?',
      a: '<code>return</code> yalnızca içinde bulunduğun fonksiyondan çıkar. <code>sys.exit()</code> SystemExit istisnası fırlatarak tüm programı bitirir. Test edilebilirlik için iç fonksiyonlarda return kullan, sys.exit\'i yalnız en dışta <code>sys.exit(main(sys.argv))</code> olarak çağır.' },
    { q: 'Ortam değişkenini kalıcı nasıl yaparım?',
      a: '<code>export</code> ve <code>set</code> yalnız açık terminal oturumu için geçerlidir. Kalıcı yapmak için macOS/Linux\'ta <code>~/.bashrc</code> ya da <code>~/.zshrc</code> dosyasına export satırı eklenir; Windows\'ta "Sistem ortam değişkenlerini düzenle" penceresi ya da <code>setx</code> kullanılır. Projelerde sık görülen yol ise <code>.env</code> dosyası ve python-dotenv paketidir (dosya Git\'e eklenmez).' },
    { q: 'stdout ve stderr ekranda aynı görünüyor, ayrımı neden önemsemeliyim?',
      a: 'Çünkü biri dosyaya yönlendirildiğinde fark ortaya çıkar. <code>python rapor.py &gt; rapor.csv</code> yalnız stdout\'u dosyaya yazar; stderr ekranda kalır. Uyarıları print ile stdout\'a yazarsan CSV dosyan bozulur ve onu okuyan bir sonraki program hata verir.' }
  ],
  mistakes: [
    { bad: 'gun = sys.argv[2]\nbitis = baslangic + gun',
      good: 'gun = int(sys.argv[2])\nbitis = baslangic + gun',
      why: 'Komut satırı argümanları her zaman str gelir; sayısal işlemden önce int/float ile çevir.' },
    { bad: 'for dosya in sys.argv:\n    isle(dosya)',
      good: 'for dosya in sys.argv[1:]:\n    isle(dosya)',
      why: 'sys.argv[0] betiğin kendi adıdır; argümanlar 1. indeksten başlar.' },
    { bad: 'sifre = os.environ["DB_SIFRE"]\nport = os.environ.get("DB_PORT")',
      good: 'sifre = os.environ.get("DB_SIFRE")\nif sifre is None:\n    sys.exit("DB_SIFRE tanımlı değil")\nport = int(os.environ.get("DB_PORT", "5432"))',
      why: 'Köşeli parantez tanımsız değişkende KeyError verir; get ile kontrol et, varsayılan ver ve sayıları dönüştür.' },
    { bad: 'print("UYARI: 3 satır atlandı")\nprint("urun,adet")',
      good: 'print("UYARI: 3 satır atlandı", file=sys.stderr)\nprint("urun,adet")',
      why: 'Uyarılar stdout\'a yazılırsa > ile yönlendirilen veri dosyasına karışır; mesajlar stderr\'e gider.' },
    { bad: 'open("veri/satis.csv")   # betik başka klasörden çalışınca bulunamaz',
      good: 'from pathlib import Path\nKLASOR = Path(__file__).parent\nopen(KLASOR / "veri" / "satis.csv")',
      why: 'Göreli yollar betiğin değil terminalin çalışma dizinine göre çözülür; betiğe göre yol için __file__ kullan.' }
  ]
});
})(window);
