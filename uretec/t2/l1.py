from gen import emit

body = r'''
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
<p><b>Mutlak yol</b> (absolute path) kökten başlar: <code>/home/ayse/veri/satis.csv</code> ya da <code>C:\Users\ayse\veri\satis.csv</code>. Nerede olursan ol aynı dosyayı gösterir. <b>Göreli yol</b> (relative path) çalışma dizinine göre yorumlanır: <code>veri/satis.csv</code>, <code>./satis.csv</code> (bu klasör), <code>../arsiv/eski.csv</code> (bir üst klasör). <code>~</code> ise macOS/Linux'ta ev klasörünün kısaltmasıdır.</p>
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

<div class="note"><b>Gerçek işte</b>Anadolu Bank'ın gün sonu mutabakat betiği şöyle çağrılır: <code>python -m mutabakat 2026-10-27 --sube 0412 &gt; mutabakat.csv 2&gt; mutabakat.log</code>. Zamanlayıcı her gece bu komutu koşturur; veritabanı adresi <code>BANKA_DB_URL</code> ortam değişkeninden gelir. Betik çıkış kodu 0 dönerse CSV muhasebeye gider; 1 dönerse nöbetçi geliştiriciye otomatik bildirim düşer ve log dosyası incelenir. Hiç kimse ekrana bakmaz; her şeyi çıkış kodu, stdout ve stderr anlatır.</div>

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
'''

ex = []

# ---- Isınma
ex += [
  dict(t='mc', stage='Isınma',
    q='Terminalde <code>/home/ayse/proje</code> klasöründesin ve <code>cd ..</code> yazıyorsun. Ardından <code>pwd</code> ne gösterir?',
    o=['/home/ayse/proje/..', '/home/ayse', '/home', 'Hata verir; .. bir klasör adı değildir'], a=1,
    why='<code>..</code> her klasörde bulunan "bir üst klasör" kısaltmasıdır. cd .. seni proje\'nin üstüne, /home/ayse\'ye taşır. pwd sadeleşmiş yolu yazar, ".." içeren hâli değil.'),
  dict(t='mc', stage='Isınma',
    q='<code>python rapor.py İzmir 7</code> komutuyla çalışan betikte <code>sys.argv[1]</code> nedir?',
    o=['"rapor.py"', '7 (int)', '"İzmir"', '["İzmir", "7"]'], a=2,
    why='sys.argv[0] betiğin adıdır; argümanlar 1. indeksten başlar. Tüm argümanlar str olarak gelir; "7" de int değil metindir.'),
  dict(t='mc', stage='Isınma',
    q='Gece çalışan bir betik bitince zamanlayıcı "başarısız" alarmı veriyor. Zamanlayıcı başarıyı genellikle neye bakarak anlar?',
    o=['Çıkış kodunun 0 olmasına', 'Ekrana "Bitti" yazılmasına', 'stderr\'in boş olmasına', 'Betiğin 1 dakikadan kısa sürmesine'], a=0,
    why='İşletim sistemi ve zamanlayıcılar çıkış koduna bakar: 0 başarı, diğerleri hata. stderr\'e uyarı yazan ama 0 ile biten program başarılı sayılır.'),
]

# ---- Kodu oku
ex += [
  dict(t='predict', stage='Kodu oku', q='Bu kod ne yazdırır?',
    code='argv = ["topla.py", "5", "3"]\nprint(argv[1] + argv[2], len(argv))\n',
    o=['8 3', '53 3', '53 2', '8 2'], a=1,
    why='Argümanlar metindir; "5" + "3" metin birleştirmesidir ve "53" verir. Liste betik adını da içerdiği için uzunluk 3\'tür.'),
  dict(t='predict', stage='Kodu oku', q='Bu kod ne yazdırır?',
    code='import posixpath\nyol = posixpath.join("/home/ayse/proje", "../veri/./satis.csv")\nprint(posixpath.normpath(yol))\n',
    o=['/home/ayse/proje/veri/satis.csv', '/home/ayse/proje/../veri/./satis.csv', '/home/ayse/veri/satis.csv', '/home/veri/satis.csv'], a=2,
    why='join iki parçayı birleştirir; normpath ".." ile bir üst klasöre çıkar (proje düşer) ve "." parçalarını siler. Sonuç /home/ayse/veri/satis.csv olur.'),
  dict(t='predict', stage='Kodu oku', q='Bu kod ne yazdırır?',
    code='import sys\n\ndef calis(n):\n    if n &lt; 0:\n        sys.exit(2)\n    return n * 2\n\ntry:\n    print(calis(4))\n    print(calis(-1))\nexcept SystemExit as e:\n    print("kod", e.code)\n'.replace('&lt;', '<'),
    o=['8\nkod 2', '8\n-2', 'kod 2', '8\nkod 1'], a=0,
    why='İlk çağrı 8 yazar. İkincisinde sys.exit(2) SystemExit fırlatır; print çalışmadan except bloğuna geçilir ve e.code 2\'dir.'),
  dict(t='order', stage='Kodu oku',
    q='<p>Argüman sayısını denetleyip çıkış kodu döndüren <code>main(argv)</code> fonksiyonunun ve çağrısının satırlarını sırala. Çıktı <code>Bursa raporu</code> ve <code>0</code> olmalı.</p>',
    lines=['def main(argv):', '    if len(argv) < 2:', '        return 2', '    print(argv[1], "raporu")', '    return 0', 'print(main(["rapor.py", "Bursa"]))'],
    expect='Bursa raporu\n0\n',
    hint='Önce argüman eksikliğini kontrol et (erken dönüş), sonra asıl işi yap ve 0 döndür.',
    why='Erken dönüş (guard clause) kalıbı: hatalı kullanımda hemen 2 ile çık; geri kalan kod "argüman var" varsayımıyla rahatça yazılır.'),
]

# ---- Rehberli
ex += [
  dict(t='code', id='terminal-temelleri-1', stage='Rehberli', diff=1,
    q='<p>Anadolu Market rapor betiği şöyle çağrılıyor: <code>python rapor.py &lt;şehir&gt; [gün]</code>. <code>rapor_argumanlari(argv)</code> fonksiyonunu yaz:</p><ul><li>Şehir yoksa (argv yalnızca betik adını içeriyorsa) <code>None</code> döndür.</li><li>Gün verilmemişse varsayılan <b>7</b> olsun.</li><li>Gün verilmişse <b>int</b>\'e çevir.</li><li>Sonuç <code>(sehir, gun)</code> demeti olsun.</li></ul>',
    guide=['argv uzunluğu 2\'den küçükse None döndür.', 'Şehri argv[1]\'den al.', 'Uzunluk 2\'den büyükse argv[2]\'yi int\'e çevir, değilse 7 kullan.', '(sehir, gun) demetini döndür.'],
    example='def kullanici_ve_rol(argv):\n    if len(argv) < 2:\n        return None\n    kullanici = argv[1]\n    rol = argv[2] if len(argv) > 2 else "okuyucu"\n    return (kullanici, rol)\n\nprint(kullanici_ve_rol(["yetki.py", "ayse"]))\nprint(kullanici_ve_rol(["yetki.py", "ayse", "admin"]))\n',
    start='def rapor_argumanlari(argv):\n    # TODO: şehir yoksa None döndür\n    sehir = argv[1]\n    # TODO: gün verilmişse int\'e çevir, verilmemişse 7 kullan\n    gun = argv[2]\n    return (sehir, gun)\n',
    sol='def rapor_argumanlari(argv):\n    if len(argv) < 2:\n        return None\n    sehir = argv[1]\n    gun = int(argv[2]) if len(argv) > 2 else 7\n    return (sehir, gun)\n',
    tests='assert rapor_argumanlari(["rapor.py"]) is None, "Şehir verilmezse None dönmeli (IndexError değil)"\nassert rapor_argumanlari(["rapor.py", "İzmir"]) == ("İzmir", 7), "Gün verilmezse varsayılan 7 olmalı"\nassert rapor_argumanlari(["rapor.py", "Ankara", "30"]) == ("Ankara", 30), "Gün \'30\' metni int 30\'a çevrilmeli"\nassert isinstance(rapor_argumanlari(["r.py", "Bursa", "5"])[1], int), "Gün int türünde olmalı: argümanlar str gelir"\n',
    hints=['Önce len(argv) ile kaç argüman geldiğini kontrol et.', 'Koşullu ifade: deger = int(argv[2]) if len(argv) > 2 else 7', 'İlk satır: if len(argv) < 2: return None'],
    why='Argüman listesini fonksiyona parametre olarak vermek, sys.argv\'ye dokunmadan her senaryoyu test etmeyi sağlar. Eksik argüman kontrolü IndexError yerine anlamlı bir sonuç üretir.'),
  dict(t='code', id='terminal-temelleri-2', stage='Rehberli', diff=2,
    q='<p><code>yolu_coz(cwd, yol)</code> fonksiyonunu yaz. Terminalin yaptığı gibi bir yolu çalışma dizinine göre çözsün ve sadeleşmiş mutlak yolu <b>str</b> olarak döndürsün:</p><ul><li><code>yol</code> mutlaksa (<code>/</code> ile başlıyorsa) cwd yok sayılır.</li><li>Göreliyse cwd ile birleştirilir.</li><li><code>.</code> ve <code>..</code> parçaları sadeleştirilir.</li></ul><p>Deterministik olması için <code>PurePosixPath</code> ve <code>posixpath.normpath</code> kullan.</p>',
    guide=['PurePosixPath(yol).is_absolute() ile mutlak olup olmadığını öğren.', 'Göreliyse PurePosixPath(cwd) / yol ile birleştir.', 'Sonucu str\'ye çevirip posixpath.normpath ile sadeleştir.', 'Sadeleşmiş metni döndür.'],
    example='import posixpath\nfrom pathlib import PurePosixPath\n\nkok = PurePosixPath("/srv/uygulama")\nprint((kok / "loglar/../ayarlar.ini"))\nprint(posixpath.normpath(str(kok / "loglar/../ayarlar.ini")))\nprint(PurePosixPath("/tmp/x").is_absolute())\n',
    start='import posixpath\nfrom pathlib import PurePosixPath\n\ndef yolu_coz(cwd, yol):\n    # TODO: yol mutlaksa cwd\'yi kullanma\n    tam = PurePosixPath(cwd) / yol\n    # TODO: .. ve . parçalarını sadeleştir\n    return str(tam)\n',
    sol='import posixpath\nfrom pathlib import PurePosixPath\n\ndef yolu_coz(cwd, yol):\n    p = PurePosixPath(yol)\n    tam = p if p.is_absolute() else PurePosixPath(cwd) / p\n    return posixpath.normpath(str(tam))\n',
    tests='assert yolu_coz("/home/ayse", "veri/satis.csv") == "/home/ayse/veri/satis.csv", "Göreli yol cwd\'ye eklenmeli"\nassert yolu_coz("/home/ayse/proje", "../arsiv/eski.csv") == "/home/ayse/arsiv/eski.csv", ".. bir üst klasöre çıkmalı"\nassert yolu_coz("/home/ayse", "./a/./b.txt") == "/home/ayse/a/b.txt", ". parçaları silinmeli"\nassert yolu_coz("/home/ayse", "/etc/hosts") == "/etc/hosts", "Mutlak yol cwd\'den bağımsızdır"\nassert yolu_coz("/a/b/c", "../../x") == "/a/x", "İki kez .. iki seviye çıkmalı"\nassert isinstance(yolu_coz("/a", "b"), str), "Sonuç str olmalı"\n',
    hints=['Mutlak/göreli ayrımı için is_absolute() metodu var.', 'Aslında PurePosixPath(cwd) / "/etc/hosts" zaten mutlak yolu verir; yine de açıkça kontrol etmek okunurluğu artırır.', 'return posixpath.normpath(str(tam))'],
    why='PurePosixPath yalnızca yol metniyle çalışır, diski okumaz; testler her işletim sisteminde aynı sonucu verir. normpath ".." ve "." parçalarını terminalin yaptığı gibi çözer.'),
  dict(t='code', id='terminal-temelleri-3', stage='Rehberli', diff=1,
    q='<p>Bir veri yükleme betiği bitince şu sözleşmeye göre çıkış kodu üretmeli. <code>cikis_kodu(okunan, hatali)</code> fonksiyonunu yaz:</p><ul><li><code>okunan == 0</code> ise (hiç satır yok) <b>2</b></li><li>Hatalı satır oranı (<code>hatali / okunan</code>) %10\'dan büyükse <b>1</b></li><li>Aksi hâlde <b>0</b></li></ul>',
    guide=['Önce okunan == 0 durumunu kontrol et; yoksa sıfıra bölme hatası alırsın.', 'Oranı hatali / okunan ile hesapla.', 'Oran 0.10\'dan büyükse 1 döndür.', 'Hiçbiri değilse 0 döndür.'],
    example='def sinav_kodu(cevaplanan, yanlis):\n    if cevaplanan == 0:\n        return 3\n    if yanlis / cevaplanan > 0.5:\n        return 1\n    return 0\n\nprint(sinav_kodu(0, 0), sinav_kodu(10, 6), sinav_kodu(10, 2))\n',
    start='def cikis_kodu(okunan, hatali):\n    # TODO: hiç satır yoksa 2 döndür\n    oran = hatali / okunan\n    # TODO: oran %10\'dan büyükse 1 döndür\n    return 0\n',
    sol='def cikis_kodu(okunan, hatali):\n    if okunan == 0:\n        return 2\n    oran = hatali / okunan\n    if oran > 0.10:\n        return 1\n    return 0\n',
    tests='assert cikis_kodu(0, 0) == 2, "Hiç satır okunmadıysa 2 dönmeli (ZeroDivisionError değil)"\nassert cikis_kodu(100, 5) == 0, "%5 hata kabul edilebilir: 0 dönmeli"\nassert cikis_kodu(100, 10) == 0, "Tam %10 sınırı aşmaz: 0 dönmeli"\nassert cikis_kodu(100, 11) == 1, "%11 hata oranı 1 döndürmeli"\nassert cikis_kodu(3, 3) == 1, "Tüm satırlar hatalıysa 1 dönmeli"\n',
    hints=['Koşulların sırası önemli: bölmeden önce sıfır kontrolü.', '"Büyükse" diyor: > kullan, >= değil.', 'if oran > 0.10: return 1'],
    why='Çıkış kodu, zamanlayıcının ve diğer programların betiğinle konuştuğu dildir. Sıfıra bölme gibi kenar durumları ayrı bir kodla işaretlemek sorunun kaynağını ilk bakışta gösterir.'),
  dict(t='code', id='terminal-temelleri-4', stage='Rehberli', diff=2,
    q='<p><code>stok_bildir(stoklar, out, err)</code> fonksiyonunu yaz. <code>stoklar</code> bir sözlük: ürün → adet. Her ürün için:</p><ul><li>Adet 0 ise <code>err</code> akışına <code>UYARI: &lt;ürün&gt; tükendi</code> yaz.</li><li>Değilse <code>out</code> akışına <code>&lt;ürün&gt;,&lt;adet&gt;</code> yaz (CSV satırı).</li></ul><p>Yazmak için <code>print(..., file=akis)</code> kullan. Fonksiyon tükenen ürün sayısını döndürsün.</p>',
    guide=['Sayaç için tukenen = 0 ile başla.', 'stoklar.items() üzerinde dön.', 'Adet 0 ise print(..., file=err) ile uyar ve sayacı artır.', 'Değilse print(f"{urun},{adet}", file=out) yaz.', 'Sayacı döndür.'],
    example='import io, sys\n\ndef notlari_yaz(notlar, out, err):\n    for ad, puan in notlar.items():\n        if puan < 50:\n            print(f"KALDI: {ad}", file=err)\n        else:\n            print(f"{ad};{puan}", file=out)\n\nkutu = io.StringIO()\nnotlari_yaz({"Ali": 70, "Ece": 40}, sys.stdout, kutu)\nprint("stderr kutusu:", kutu.getvalue())\n',
    start='def stok_bildir(stoklar, out, err):\n    tukenen = 0\n    for urun, adet in stoklar.items():\n        # TODO: adet 0 ise err\'e UYARI yaz ve sayacı artır\n        # TODO: değilse out\'a "urun,adet" yaz\n        print(urun, adet)\n    return tukenen\n',
    sol='def stok_bildir(stoklar, out, err):\n    tukenen = 0\n    for urun, adet in stoklar.items():\n        if adet == 0:\n            print(f"UYARI: {urun} tükendi", file=err)\n            tukenen += 1\n        else:\n            print(f"{urun},{adet}", file=out)\n    return tukenen\n',
    tests='import io\no, e = io.StringIO(), io.StringIO()\nn = stok_bildir({"çay": 40, "kahve": 0, "şeker": 12, "un": 0}, o, e)\nassert o.getvalue() == "çay,40\\nşeker,12\\n", "out yalnız CSV satırlarını içermeli, geldi: " + repr(o.getvalue())\nassert e.getvalue() == "UYARI: kahve tükendi\\nUYARI: un tükendi\\n", "err yalnız uyarıları içermeli, geldi: " + repr(e.getvalue())\nassert n == 2, "Tükenen ürün sayısı 2 dönmeli"\no2, e2 = io.StringIO(), io.StringIO()\nassert stok_bildir({}, o2, e2) == 0 and o2.getvalue() == "", "Boş sözlükte hiçbir şey yazılmamalı"\n',
    hints=['print\'in file parametresi yazılacak akışı seçer.', 'Veri out\'a, mesaj err\'e: python stok.py > stok.csv yapan kişi CSV\'de uyarı görmemeli.', 'print(f"UYARI: {urun} tükendi", file=err)'],
    why='Veri ile mesajları ayrı akışlara yazmak betiği boru hattına uygun kılar: stdout dosyaya yönlendirilince temiz CSV kalır, uyarılar ekranda ya da log dosyasında görünür.'),
]

# ---- Kendin yaz
ex += [
  dict(t='code', id='terminal-temelleri-5', stage='Kendin yaz', diff=1,
    q='<p><code>ortam_ayari(env, anahtar, varsayilan)</code> fonksiyonunu yaz. <code>env</code> bir sözlük (os.environ gibi). Anahtar yoksa <b>ya da</b> değeri boşluklardan ibaretse <code>varsayilan</code> döndür; aksi hâlde değerin baştaki/sondaki boşlukları kırpılmış hâlini döndür.</p>',
    start='def ortam_ayari(env, anahtar, varsayilan):\n    pass\n',
    sol='def ortam_ayari(env, anahtar, varsayilan):\n    deger = env.get(anahtar, "").strip()\n    return deger if deger else varsayilan\n',
    tests='env = {"ANADOLU_ORTAM": " canli ", "LOG_SEVIYE": "   ", "DB": "sqlite"}\nassert ortam_ayari(env, "ANADOLU_ORTAM", "gelistirme") == "canli", "Değer kırpılmalı: \' canli \' -> \'canli\'"\nassert ortam_ayari(env, "LOG_SEVIYE", "INFO") == "INFO", "Yalnız boşluk içeren değer yok sayılmalı"\nassert ortam_ayari(env, "YOK", "x") == "x", "Olmayan anahtarda varsayılan dönmeli (KeyError değil)"\nassert ortam_ayari(env, "DB", "postgres") == "sqlite", "Var olan değer dönmeli"\n',
    hints=['dict.get(anahtar, "") yoksa boş metin verir.', 'Boş metin falsy\'dir: if deger: ...', 'return deger if deger else varsayilan'],
    why='Ortam değişkenleri elle ayarlanır ve sık sık yanlışlıkla boş bırakılır. get + strip + varsayılan üçlüsü bu kirli girdiye karşı sağlam bir ayar okuyucu üretir.'),
  dict(t='code', id='terminal-temelleri-6', stage='Kendin yaz', diff=2,
    q='<p><code>bayraklari_ayir(argv)</code> fonksiyonunu yaz. <code>argv[0]</code> betik adıdır, atla. Kalan argümanlar için:</p><ul><li><code>--anahtar=deger</code> biçimindekiler sözlüğe <code>"anahtar": "deger"</code> olarak girsin.</li><li><code>--anahtar</code> (eşittir yok) biçimindekiler <code>"anahtar": True</code> olsun.</li><li><code>--</code> ile başlamayanlar <code>"_konum"</code> anahtarındaki listeye sırayla eklensin.</li></ul><p>Sözlük her zaman <code>"_konum"</code> anahtarını içersin (boş liste olabilir).</p>',
    start='def bayraklari_ayir(argv):\n    pass\n',
    sol='def bayraklari_ayir(argv):\n    sonuc = {"_konum": []}\n    for arg in argv[1:]:\n        if arg.startswith("--"):\n            govde = arg[2:]\n            if "=" in govde:\n                anahtar, deger = govde.split("=", 1)\n                sonuc[anahtar] = deger\n            else:\n                sonuc[govde] = True\n        else:\n            sonuc["_konum"].append(arg)\n    return sonuc\n',
    tests='r = bayraklari_ayir(["rapor.py", "İzmir", "--gun=30", "--detay", "Ankara"])\nassert r == {"_konum": ["İzmir", "Ankara"], "gun": "30", "detay": True}, "Beklenen sözlük farklı, geldi: " + repr(r)\nassert bayraklari_ayir(["rapor.py"]) == {"_konum": []}, "Argüman yoksa yalnız boş _konum olmalı"\nassert bayraklari_ayir(["x.py", "--filtre=a=b"])["filtre"] == "a=b", "Yalnız ilk = ayırmalı: split(\'=\', 1)"\n',
    hints=['startswith("--") ile bayrak mı diye bak, arg[2:] ile başını at.', 'split("=", 1) yalnızca ilk eşittirden böler.', 'Eşittir yoksa değer True olur.'],
    why='argparse\'ın temel işi budur: konumsal argümanları ve bayrakları ayırmak. split("=", 1) değerin kendisi = içerse bile doğru çalışır.'),
  dict(t='code', id='terminal-temelleri-7', stage='Kendin yaz', diff=2,
    q='<p>Ekipte Windows kullananlarla Linux sunucu arasında köprü kuracaksın. <code>komut_cevir(komut)</code> fonksiyonu Windows cmd komutunu macOS/Linux karşılığına çevirsin. İlk kelime şu tabloya göre değişir, geri kalan argümanlar aynen kalır:</p><p><code>dir→ls</code>, <code>type→cat</code>, <code>copy→cp</code>, <code>move→mv</code>, <code>del→rm</code>, <code>cls→clear</code>, <code>findstr→grep</code>. Tabloda olmayan komut (ör. <code>cd</code>, <code>mkdir</code>) aynen kalsın. Komut adı büyük/küçük harf duyarsız eşleşsin (<code>DIR</code> da <code>ls</code> olur). Fazla boşlukları tek boşluğa indir.</p>',
    start='def komut_cevir(komut):\n    pass\n',
    sol='ESLEME = {"dir": "ls", "type": "cat", "copy": "cp", "move": "mv", "del": "rm", "cls": "clear", "findstr": "grep"}\n\ndef komut_cevir(komut):\n    parcalar = komut.split()\n    if not parcalar:\n        return ""\n    ad = parcalar[0].lower()\n    parcalar[0] = ESLEME.get(ad, parcalar[0])\n    return " ".join(parcalar)\n',
    tests='assert komut_cevir("type satis.csv") == "cat satis.csv", "type -> cat"\nassert komut_cevir("DIR") == "ls", "Büyük harf DIR de ls olmalı"\nassert komut_cevir("findstr HATA stok.log") == "grep HATA stok.log", "findstr -> grep, argümanlar aynı"\nassert komut_cevir("mkdir rapor") == "mkdir rapor", "Tabloda olmayan komut aynen kalmalı"\nassert komut_cevir("copy   a.txt    b.txt") == "cp a.txt b.txt", "Fazla boşluk tek boşluğa inmeli"\nassert komut_cevir("") == "", "Boş komut boş dönmeli"\n',
    hints=['Eşlemeyi bir sözlükte tut.', 'split() argümansız çağrılınca birden fazla boşluğu tek ayırıcı sayar.', 'ESLEME.get(ad.lower(), ad) yoksa orijinali döndürür.'],
    why='Sözlük tabanlı eşleme if/elif zincirinden kısa ve genişletilebilirdir. split() + join() ikilisi boşluk normalizasyonunu bedavaya verir.'),
  dict(t='code', id='terminal-temelleri-8', stage='Kendin yaz', diff=2,
    q='<p>Linux\'ta <code>cat stok.log | grep HATA | wc -l</code> komutu log içinde "HATA" geçen satır sayısını verir. Aynı boru hattını Python\'da taklit et: <code>boru_say(metin, kelime)</code> çok satırlı metni satırlara böler, <code>kelime</code>\'yi içeren satırları süzer ve <b>sayısını</b> döndürür. Ayrıca <code>boru_suz(metin, kelime)</code> aynı satırları liste olarak döndürsün (sıra korunarak). Eşleşme büyük/küçük harf duyarlı.</p>',
    start='def boru_suz(metin, kelime):\n    pass\n\ndef boru_say(metin, kelime):\n    pass\n',
    sol='def boru_suz(metin, kelime):\n    return [satir for satir in metin.splitlines() if kelime in satir]\n\ndef boru_say(metin, kelime):\n    return len(boru_suz(metin, kelime))\n',
    tests='log = "02:00 BILGI basladi\\n02:01 HATA depo=Gebze\\n02:02 BILGI 120 urun\\n02:03 HATA depo=Izmir\\n02:04 hata degil\\n"\nassert boru_suz(log, "HATA") == ["02:01 HATA depo=Gebze", "02:03 HATA depo=Izmir"], "Yalnız HATA içeren iki satır kalmalı"\nassert boru_say(log, "HATA") == 2, "grep büyük/küçük harf duyarlıdır: \'hata\' sayılmaz"\nassert boru_say(log, "Gebze") == 1, "Gebze 1 satırda geçiyor"\nassert boru_say("", "HATA") == 0, "Boş metinde 0"\n',
    hints=['splitlines() satırlara böler ve son boş satırı üretmez.', 'Süzme için comprehension: [s for s in ... if kelime in s]', 'Saymak için len(boru_suz(...)): fonksiyonlar da boru gibi birleşir.'],
    why='Her fonksiyonun tek iş yapması ve birinin çıktısının diğerine girdi olması, Unix borusunun Python\'daki karşılığıdır. boru_say, boru_suz\'u yeniden kullanır.'),
]

# ---- Hata avı
ex += [
  dict(t='code', id='terminal-temelleri-9', stage='Hata avı', kind='bug', diff=2,
    q='<p><b>Hatayı bul ve düzelt.</b> <code>python topla.py 10 20 30</code> çağrısını taklit eden <code>topla(argv)</code> fonksiyonu betik adından sonraki tüm sayıları toplamalı: <code>topla(["topla.py", "10", "20", "30"])</code> → <code>60</code>. Mevcut kod hata veriyor.</p>',
    start='def topla(argv):\n    toplam = 0\n    for arg in argv:\n        toplam += arg\n    return toplam\n',
    sol='def topla(argv):\n    toplam = 0\n    for arg in argv[1:]:\n        toplam += int(arg)\n    return toplam\n',
    tests='assert topla(["topla.py", "10", "20", "30"]) == 60, "10+20+30 = 60 olmalı"\nassert topla(["topla.py"]) == 0, "Argüman yoksa toplam 0"\nassert topla(["topla.py", "-5", "5"]) == 0, "Negatif sayılar da çalışmalı"\n',
    hints=['İki hata var: biri hangi elemanların toplandığıyla ilgili.', 'argv[0] betiğin adıdır, sayı değildir; argv[1:] ile atla.', 'Argümanlar str gelir: int(arg) ile çevir.'],
    why='sys.argv iki klasik tuzak taşır: ilk eleman betik adıdır ve tüm elemanlar metindir. int + str TypeError verir; "topla.py" ise int\'e çevrilemez.'),
  dict(t='code', id='terminal-temelleri-10', stage='Hata avı', kind='bug', diff=2,
    q='<p><b>Hatayı bul ve düzelt.</b> <code>zaman_asimi(env)</code>, <code>ZAMAN_ASIMI</code> ortam değişkenini saniye olarak <b>int</b> döndürmeli; değişken tanımlı değilse varsayılan <b>30</b> olmalı. Mevcut kod tanımsız değişkende çöküyor ve tanımlıyken yanlış türde değer döndürüyor.</p>',
    start='def zaman_asimi(env):\n    deger = env["ZAMAN_ASIMI"]\n    return deger\n',
    sol='def zaman_asimi(env):\n    deger = env.get("ZAMAN_ASIMI", "30")\n    return int(deger)\n',
    tests='assert zaman_asimi({}) == 30, "Değişken yoksa 30 dönmeli (KeyError değil)"\nassert zaman_asimi({"ZAMAN_ASIMI": "45"}) == 45, "\'45\' metni int 45 olmalı"\nassert isinstance(zaman_asimi({"ZAMAN_ASIMI": "5"}), int), "Dönüş türü int olmalı: ortam değişkenleri hep str\'dir"\n',
    hints=['env["X"] anahtar yoksa KeyError fırlatır.', '.get(anahtar, varsayilan) kullan; varsayılanı da metin ver ki tek dönüşüm yetsin.', 'return int(env.get("ZAMAN_ASIMI", "30"))'],
    why='Ortam değişkenleri her zaman metindir ve tanımsız olabilir. get ile varsayılan vermek ve tek noktada int\'e çevirmek iki hatayı birden çözer.'),
]

# ---- Meydan okuma
ex += [
  dict(t='code', id='terminal-temelleri-11', stage='Meydan okuma', diff=3,
    q='<p>Tam bir komut satırı aracı yaz: <code>main(argv, env, out, err)</code>. Kullanım: <code>kargo.py &lt;şehir&gt; &lt;desi&gt;</code>. Kurallar:</p><ul><li>Argüman sayısı tam 2 değilse <code>err</code>\'e <code>Kullanım: kargo.py &lt;şehir&gt; &lt;desi&gt;</code> yaz, <b>2</b> döndür.</li><li>Desi sayı değilse ya da 0 veya negatifse <code>err</code>\'e <code>Hata: desi pozitif sayı olmalı</code> yaz, <b>1</b> döndür. (Ondalık olabilir: <code>"2.5"</code>)</li><li>Birim fiyat <code>env</code>\'deki <code>KARGO_BIRIM</code> değeridir (yoksa <code>"12"</code>), float\'a çevir.</li><li>Şehir <code>İstanbul</code> ise ücret 1.0 katsayılı, başka şehir ise 1.25 katsayılıdır. Ücret = desi × birim × katsayı, 2 basamağa yuvarla.</li><li><code>out</code>\'a <code>&lt;şehir&gt;: &lt;ücret&gt; TL</code> yaz (ücreti <code>:.2f</code> ile), <b>0</b> döndür.</li></ul>',
    start='def main(argv, env, out, err):\n    pass\n',
    sol='def main(argv, env, out, err):\n    if len(argv) != 3:\n        print("Kullanım: kargo.py <şehir> <desi>", file=err)\n        return 2\n    sehir = argv[1]\n    try:\n        desi = float(argv[2])\n    except ValueError:\n        desi = 0\n    if desi <= 0:\n        print("Hata: desi pozitif sayı olmalı", file=err)\n        return 1\n    birim = float(env.get("KARGO_BIRIM", "12"))\n    katsayi = 1.0 if sehir == "İstanbul" else 1.25\n    ucret = round(desi * birim * katsayi, 2)\n    print(f"{sehir}: {ucret:.2f} TL", file=out)\n    return 0\n',
    tests='import io\ndef calistir(argv, env=None):\n    o, e = io.StringIO(), io.StringIO()\n    kod = main(argv, env or {}, o, e)\n    return kod, o.getvalue(), e.getvalue()\n\nk, o, e = calistir(["kargo.py", "İstanbul", "3"])\nassert (k, o, e) == (0, "İstanbul: 36.00 TL\\n", ""), "3 desi x 12 x 1.0 = 36.00, geldi: " + repr((k, o, e))\nk, o, e = calistir(["kargo.py", "İzmir", "2.5"], {"KARGO_BIRIM": "10"})\nassert (k, o) == (0, "İzmir: 31.25 TL\\n"), "2.5 x 10 x 1.25 = 31.25 olmalı, geldi: " + repr(o)\nk, o, e = calistir(["kargo.py", "İzmir"])\nassert k == 2 and e.startswith("Kullanım:") and o == "", "Eksik argümanda 2 dönmeli, mesaj err\'e gitmeli"\nk, o, e = calistir(["kargo.py", "Ankara", "abc"])\nassert k == 1 and "desi pozitif" in e and o == "", "Sayı olmayan desi 1 döndürmeli (ValueError ile çökmemeli)"\nk, o, e = calistir(["kargo.py", "Ankara", "-4"])\nassert k == 1, "Negatif desi 1 döndürmeli"\nk, o, e = calistir(["kargo.py", "Ankara", "1", "fazla"])\nassert k == 2, "Fazla argüman da kullanım hatasıdır: 2"\n',
    hints=['Sıra: önce argüman sayısı (2), sonra desi doğrulama (1), en son hesap (0).', 'float("abc") ValueError fırlatır; try/except ile yakala ve hata yoluna yönlendir.', 'Ücret formatı: f"{sehir}: {ucret:.2f} TL"'],
    why='Bu, profesyonel CLI iskeletidir: tüm girdiler parametre (argv, env, akışlar), sonuç çıkış kodu. Kenar durumlar (eksik/fazla argüman, sayı olmayan desi, negatif değer) ayrı kodlarla ve stderr mesajlarıyla raporlanır; stdout yalnız temiz sonucu içerir.'),
]

faq = [
  dict(q='python mu yazmalıyım, python3 mü, py mi?', a='macOS ve Linux\'ta sistemde eski Python 2 kalıntıları olabildiği için genellikle <code>python3</code> yazılır. Windows\'ta resmi kurulum <code>py</code> başlatıcısını getirir; <code>py -3.12</code> ile sürüm de seçebilirsin. Sanal ortam etkinken üçü de aynı Python\'ı gösterir; emin olmak için <code>python -c "import sys; print(sys.executable)"</code> yaz.'),
  dict(q='Komut "is not recognized" ya da "command not found" diyor. Neden?', a='Terminal o programı PATH ortam değişkenindeki klasörlerde bulamadı. Ya kurulu değil, ya kurulumda PATH\'e eklenmedi, ya da terminal kurulumdan önce açıldı. Terminali kapatıp aç; olmazsa kurulum dersindeki PATH adımlarına dön.'),
  dict(q='sys.exit() ile return arasındaki fark ne?', a='<code>return</code> yalnızca içinde bulunduğun fonksiyondan çıkar. <code>sys.exit()</code> SystemExit istisnası fırlatarak tüm programı bitirir. Test edilebilirlik için iç fonksiyonlarda return kullan, sys.exit\'i yalnız en dışta <code>sys.exit(main(sys.argv))</code> olarak çağır.'),
  dict(q='Ortam değişkenini kalıcı nasıl yaparım?', a='<code>export</code> ve <code>set</code> yalnız açık terminal oturumu için geçerlidir. Kalıcı yapmak için macOS/Linux\'ta <code>~/.bashrc</code> ya da <code>~/.zshrc</code> dosyasına export satırı eklenir; Windows\'ta "Sistem ortam değişkenlerini düzenle" penceresi ya da <code>setx</code> kullanılır. Projelerde sık görülen yol ise <code>.env</code> dosyası ve python-dotenv paketidir (dosya Git\'e eklenmez).'),
  dict(q='stdout ve stderr ekranda aynı görünüyor, ayrımı neden önemsemeliyim?', a='Çünkü biri dosyaya yönlendirildiğinde fark ortaya çıkar. <code>python rapor.py &gt; rapor.csv</code> yalnız stdout\'u dosyaya yazar; stderr ekranda kalır. Uyarıları print ile stdout\'a yazarsan CSV dosyan bozulur ve onu okuyan bir sonraki program hata verir.'),
]

mistakes = [
  dict(bad='gun = sys.argv[2]\nbitis = baslangic + gun', good='gun = int(sys.argv[2])\nbitis = baslangic + gun', why='Komut satırı argümanları her zaman str gelir; sayısal işlemden önce int/float ile çevir.'),
  dict(bad='for dosya in sys.argv:\n    isle(dosya)', good='for dosya in sys.argv[1:]:\n    isle(dosya)', why='sys.argv[0] betiğin kendi adıdır; argümanlar 1. indeksten başlar.'),
  dict(bad='sifre = os.environ["DB_SIFRE"]\nport = os.environ.get("DB_PORT")', good='sifre = os.environ.get("DB_SIFRE")\nif sifre is None:\n    sys.exit("DB_SIFRE tanımlı değil")\nport = int(os.environ.get("DB_PORT", "5432"))', why='Köşeli parantez tanımsız değişkende KeyError verir; get ile kontrol et, varsayılan ver ve sayıları dönüştür.'),
  dict(bad='print("UYARI: 3 satır atlandı")\nprint("urun,adet")', good='print("UYARI: 3 satır atlandı", file=sys.stderr)\nprint("urun,adet")', why='Uyarılar stdout\'a yazılırsa > ile yönlendirilen veri dosyasına karışır; mesajlar stderr\'e gider.'),
  dict(bad='open("veri/satis.csv")   # betik başka klasörden çalışınca bulunamaz', good='from pathlib import Path\nKLASOR = Path(__file__).parent\nopen(KLASOR / "veri" / "satis.csv")', why='Göreli yollar betiğin değil terminalin çalışma dizinine göre çözülür; betiğe göre yol için __file__ kullan.'),
]

L = dict(id='terminal-temelleri', lv='temel', mod='Başlangıç', min=35,
  title='Terminal ve komut satırı',
  sum='Çalışma dizini, göreli/mutlak yol, python betik.py ve -m, sys.argv ile argüman, sys.exit ile çıkış kodu, stdout/stderr, yönlendirme ve ortam değişkenleriyle betiklerini terminalden profesyonelce çalıştırırsın.',
  goals=['Terminalde klasörler arasında gezinip dosya ve klasörleri Windows ile macOS/Linux komutlarıyla yönetebilirim.',
         'Göreli ve mutlak yolu ayırt eder, pathlib ile yolları birleştirip çözebilirim.',
         'Betiğe sys.argv ile argüman verir, sayıya dönüştürür ve eksik argümanı yakalarım.',
         'Çıkış kodu, stdout ve stderr ile betiğimin sonucunu diğer programlara doğru bildiririm.',
         'Ortam değişkenlerini os.environ ile güvenli varsayılanlarla okurum.'],
  body=body, ex=ex, faq=faq, mistakes=mistakes)
emit(L)
