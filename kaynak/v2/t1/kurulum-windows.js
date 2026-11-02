/* Kesit Python — v2/t1: kurulum-windows */
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push(
{
  id: 'kurulum-windows',
  lv: 'temel',
  mod: 'Başlangıç',
  min: 40,
  title: 'Windows\'ta Python kurulumu',
  sum: 'python.org yükleyicisinin her ekranını, Store takma adı tuzağını, py başlatıcısını, PATH\'i, PowerShell yürütme ilkesini ve en sık on bir kurulum hatasının teşhisini öğrenirsin.',
  goals: [
    'python.org yükleyicisini doğru seçeneklerle kurup kurulumu üç komutla doğrulayabilirim.',
    'PATH\'in nasıl arandığını açıklar, where ve py --list çıktısından hangi Python\'ın çalışacağını söyleyebilirim.',
    'Store takma adı ve yürütme ilkesi hatalarını tanıyıp tek ayarla çözebilirim.',
    'py başlatıcısıyla birden çok sürümü yönetir, projeye özel venv oluşturabilirim.',
    'Sık kurulum hatalarını belirti → neden → çözüm mantığıyla teşhis edebilirim.'
  ],
  body: `
<h2>Neden ayrı bir Windows dersi?</h2>
<p><b>Kurulum ve araçlar</b> dersinde Python'ı kurmayı kısaca gördün. Bu ders, o kısa anlatımın "ama bende çalışmadı" kısmıdır. Windows'ta Python kurulumu çoğu zaman beş dakika sürer; sorun çıktığında ise saatler alabilir, çünkü hata mesajı genellikle asıl nedeni söylemez. <code>'python' is not recognized</code> diyen bir terminal sana "PATH ortam değişkeninde Python klasörü yok" demez. Bu derste kurulumun her ekranını, Windows'un bir komutu nasıl bulduğunu ve en sık karşılaşılan hataların gerçek nedenini öğreneceksin. Amaç ezber değil, <b>teşhis</b> yapabilmek: bir sonraki bilgisayarda ya da bir ekip arkadaşının ekranında sorunu iki dakikada çözmek.</p>
<p>Anadolu Market'in veri ekibine yeni katılan bir stajyer düşün. İlk gün kurumsal dizüstü bilgisayarına Python kuruyor, VS Code'u açıyor ve ilk betiği çalıştırınca terminal Microsoft Store'u açıyor. Bu derste o sorunun neden olduğunu ve neden tek bir ayar düğmesiyle çözüldüğünü göreceksin.</p>

<h2>Dört kurulum yolu</h2>
<div class="tbl-wrap"><table>
<tr><th>Yol</th><th>Artısı</th><th>Eksisi</th><th>Kimin için</th></tr>
<tr><td>python.org yükleyicisi</td><td>Resmî, tam denetim, <code>py</code> başlatıcısı gelir</td><td>Ekranları doğru işaretlemek gerekir</td><td>Çoğu kişi için önerilen yol</td></tr>
<tr><td>Microsoft Store</td><td>Yönetici izni istemez, otomatik güncellenir</td><td>Bazı klasörlere yazma kısıtlı, <code>py</code> başlatıcısı yok</td><td>Okul ya da kilitli bilgisayar</td></tr>
<tr><td><code>winget</code></td><td>Tek komut, betikle tekrarlanabilir</td><td>Kurulum seçeneklerini görmezsin</td><td>Birden çok makine kuran, otomasyon seven</td></tr>
<tr><td>Anaconda/Miniconda</td><td>Bilimsel paketler hazır gelir</td><td>Büyük, kendi ortam sistemi var</td><td>Veri bilimi; <b>Jupyter ve Colab</b> dersinde</td></tr>
</table></div>

<h2>python.org yükleyicisi adım adım</h2>
<p>python.org/downloads adresinden <b>Windows installer (64-bit)</b> dosyasını indir (örneğin <code>python-3.12.4-amd64.exe</code>). "embeddable package" başka programların içine gömülmek içindir; öğrenme için değil.</p>
<div class="steps-list"><ol>
<li><b>İlk ekran:</b> en altta iki kutu var. <b>"Use admin privileges when installing py.exe"</b> başlatıcıyı tüm kullanıcılar için kurar (yönetici izni ister; yoksa işaretini kaldır). <b>"Add python.exe to PATH"</b> kutusunu mutlaka işaretle; varsayılan olarak <i>işaretsiz</i> gelir ve sorunların yarısı buradan çıkar.</li>
<li><b>Install Now</b> seçersen Python kullanıcı klasörüne kurulur: <code>C:\\Users\\ayse\\AppData\\Local\\Programs\\Python\\Python312</code>. Yönetici izni gerekmez. Yeni başlıyorsan bu yeterlidir.</li>
<li><b>Customize installation</b> seçersen "Optional Features" ekranı gelir: <i>pip</i> (paket yükleyici, açık kalsın), <i>tcl/tk and IDLE</i> (basit editör ve tkinter), <i>Python test suite</i> (gerekmez), <i>py launcher</i> (açık kalsın), <i>for all users</i> (başlatıcıyı herkese kurar).</li>
<li><b>Advanced Options</b> ekranında: <i>Install Python 3.12 for all users</i> (Program Files'a kurar, yönetici ister), <i>Associate files with Python</i> (.py dosyasına çift tıklayınca çalışsın), <i>Add Python to environment variables</i> (ilk ekrandaki PATH kutusunun aynısı), <i>Precompile standard library</i>. Kurulum yolunu <code>C:\\Python312</code> gibi <b>kısa, boşluksuz, Türkçe karaktersiz</b> bir yere almak ileride çok baş ağrısı önler.</li>
<li><b>Son ekran:</b> "Disable path length limit" düğmesi çıkarsa tıkla. Windows'un 260 karakterlik yol sınırını kaldırır; derin klasörlü paketlerde pip hatalarını önler.</li>
</ol></div>
<p>Kurulum bitince <b>yeni</b> bir terminal aç (açık olan terminal eski PATH'i hatırlar) ve doğrula:</p>
<pre class="code">python --version
py --version
python -m pip --version
where python</pre>
<p>Python'a kendisini anlattırmak da mümkün. Aşağıdaki kod, hangi yorumlayıcının çalıştığını ve nereye kurulduğunu gösterir; "yanlış Python çalışıyor" şüphesinde ilk bakılacak yer burasıdır.</p>
<pre class="py">import sys, platform

print("Sürüm      :", platform.python_version())
print("Ana / alt  :", sys.version_info.major, sys.version_info.minor)
print("Yorumlayıcı:", sys.executable or "(tarayıcıda yol yok)")
print("Kurulum    :", sys.prefix)
print("İşletim    :", platform.system())
print("64 bit mi  :", sys.maxsize &gt; 2**32)
print("3.10+ mı   :", sys.version_info &gt;= (3, 10))</pre>
<div class="tip"><b>Sürüm karşılaştırmanın doğru yolu</b><code>sys.version_info</code> bir demet (tuple) gibi davranır; <code>sys.version_info &gt;= (3, 10)</code> sayı sayı karşılaştırır. Sürümü metin olarak karşılaştırma: <code>"3.9" &gt; "3.12"</code> ifadesi True döner çünkü metinler karakter karakter karşılaştırılır ve "9" &gt; "1".</div>

<h2>Microsoft Store tuzağı: App execution aliases</h2>
<p>Windows 10 ve 11, Python kurulu olmasa bile <code>C:\\Users\\ayse\\AppData\\Local\\Microsoft\\WindowsApps</code> klasörüne <code>python.exe</code> ve <code>python3.exe</code> adında küçük <b>takma ad (alias)</b> dosyaları koyar. Bunlar gerçek Python değildir; çalışınca Store'u açar ya da <code>Python was not found; run without arguments to install from the Microsoft Store</code> yazar. WindowsApps klasörü PATH'te genellikle senin Python klasöründen <b>önce</b> geldiği için, Python'ı kurmuş olsan bile takma ad kazanır.</p>
<p><b>Çözüm:</b> Ayarlar → Uygulamalar → Gelişmiş uygulama ayarları → <b>Uygulama yürütme diğer adları</b> (App execution aliases) ekranında "Uygulama yükleyici python.exe" ve "python3.exe" satırlarını kapat. Ardından yeni terminal aç. Store sürümünü bilerek kullanıyorsan bu takma adlar gerçek Python'ı gösterir; o durumda sorun yoktur.</p>

<h2>py başlatıcısı: birden çok sürümün trafik polisi</h2>
<p>python.org yükleyicisi <code>py.exe</code> adlı bir <b>başlatıcı (launcher)</b> kurar. Bu küçük program PATH'e bakmaz; Windows kayıt defterindeki kurulu Python'ları bilir ve istediğin sürümü çalıştırır. PATH karıştığında en güvenilir araç budur.</p>
<div class="tbl-wrap"><table>
<tr><th>Komut</th><th>Ne yapar</th></tr>
<tr><td><code>py</code></td><td>Varsayılan (genelde en yeni) Python'ı açar</td></tr>
<tr><td><code>py -3.12 betik.py</code></td><td>Betiği özellikle 3.12 ile çalıştırır</td></tr>
<tr><td><code>py --list</code> (ya da <code>py -0</code>)</td><td>Kurulu sürümleri listeler; yıldızlı olan varsayılandır</td></tr>
<tr><td><code>py -0p</code></td><td>Sürümleri dosya yollarıyla listeler</td></tr>
<tr><td><code>py -3.12 -m pip install requests</code></td><td>Paketi tam olarak 3.12'ye kurar</td></tr>
<tr><td><code>py -3.12 -m venv .venv</code></td><td>3.12 tabanlı sanal ortam oluşturur</td></tr>
</table></div>
<pre class="out"> -V:3.12 *        Python 3.12 (64-bit)
 -V:3.11          Python 3.11 (64-bit)</pre>
<p><code>py --list</code> çıktısı yukarıdaki gibidir. <code>PY_PYTHON=3.11</code> ortam değişkeniyle varsayılanı değiştirebilirsin.</p>

<h2>PATH nedir, Windows bir komutu nasıl bulur?</h2>
<p><b>PATH</b>, klasör yollarını <b>noktalı virgülle</b> (Windows) ayırarak tutan bir <b>ortam değişkenidir (environment variable)</b>. Terminale <code>python</code> yazdığında Windows önce bulunduğun klasöre, sonra PATH'teki klasörlere <b>soldan sağa</b> bakar ve <code>python.exe</code> (ya da .bat, .cmd) bulduğu <b>ilk</b> klasördekini çalıştırır. Gerisine bakmaz. İki Python kuruluysa hangisinin çalışacağını PATH sırası belirler.</p>
<pre class="code">where python                       # CMD ve PowerShell: tüm eşleşmeleri sırayla gösterir
$env:Path -split ';'               # PowerShell: PATH'i satır satır göster
echo %PATH%                        # CMD: PATH'i tek satırda göster
Get-Command python | Format-List   # PowerShell: çalışacak olanın tam yolu</pre>
<p>PowerShell'de <code>where</code> yerine <code>where.exe</code> yazman gerekebilir; çünkü <code>where</code> orada <code>Where-Object</code> komutunun kısaltmasıdır ve sessizce hiçbir şey yazdırmaz.</p>
<pre class="py">path_metni = r"C:\\Windows\\system32;C:\\Users\\ayse\\AppData\\Local\\Microsoft\\WindowsApps;C:\\Users\\ayse\\AppData\\Local\\Programs\\Python\\Python312\\Scripts;C:\\Users\\ayse\\AppData\\Local\\Programs\\Python\\Python312;;C:\\Program Files\\Git\\cmd"

for sira, klasor in enumerate(path_metni.split(";"), start=1):
    if not klasor:
        print(sira, "(boş girdi)")
        continue
    isaret = "  &lt;-- Python" if "python" in klasor.lower() else ""
    print(sira, klasor + isaret)</pre>
<p>PATH'i kalıcı değiştirmek için Başlat menüsüne "ortam değişkenleri" yaz → <b>Hesabınız için ortam değişkenlerini düzenleyin</b>. Üstte <b>kullanıcı</b> değişkenleri, altta (yönetici gerektiren) <b>sistem</b> değişkenleri vardır. Windows ikisini birleştirir: önce sistem PATH'i, sonra kullanıcı PATH'i. Değişiklikten sonra açık terminaller eski değeri tutar; yeni terminal (bazen VS Code'u tamamen kapatıp açmak) gerekir.</p>
<p><code>where</code> komutunun yaptığını Python ile taklit edelim. Gerçek bilgisayarda dosyalar diskte; burada var olan dosyaları bir küme (set) olarak veriyoruz.</p>
<pre class="py">import ntpath

path_klasorleri = [
    r"C:\\Users\\ayse\\AppData\\Local\\Microsoft\\WindowsApps",
    r"C:\\Python312",
    r"C:\\Python312\\Scripts",
]
diskteki_dosyalar = {
    r"C:\\Users\\ayse\\AppData\\Local\\Microsoft\\WindowsApps\\python.exe",
    r"C:\\Python312\\python.exe",
    r"C:\\Python312\\Scripts\\pip.exe",
}

def where(komut):
    bulunanlar = []
    for klasor in path_klasorleri:
        aday = ntpath.join(klasor, komut + ".exe")
        if aday in diskteki_dosyalar:
            bulunanlar.append(aday)
    return bulunanlar

for komut in ["python", "pip", "git"]:
    sonuc = where(komut)
    print(komut, "-&gt;", sonuc[0] if sonuc else "tanınmıyor")</pre>
<p>Çıktıdaki <code>python</code> satırı Store takma adını gösteriyor: gerçek Python kurulu olduğu hâlde ilk sırada takma ad var. <code>ntpath</code> modülü Windows yol kurallarını her işletim sisteminde uygular; Linux'ta çalışırken bile ters bölüyle yol birleştirebilirsin.</p>

<h2>PowerShell mı CMD mi? Yürütme ilkesi ve venv</h2>
<div class="tbl-wrap"><table>
<tr><th>İş</th><th>PowerShell</th><th>CMD</th></tr>
<tr><td>PATH'i görmek</td><td><code>$env:Path -split ';'</code></td><td><code>echo %PATH%</code></td></tr>
<tr><td>Geçici değişken</td><td><code>$env:PYTHONUTF8 = "1"</code></td><td><code>set PYTHONUTF8=1</code></td></tr>
<tr><td>venv etkinleştirme</td><td><code>.venv\\Scripts\\Activate.ps1</code></td><td><code>.venv\\Scripts\\activate.bat</code></td></tr>
<tr><td>Komutun yeri</td><td><code>Get-Command python</code></td><td><code>where python</code></td></tr>
<tr><td>Ekranı temizle</td><td><code>cls</code> / <code>Clear-Host</code></td><td><code>cls</code></td></tr>
</table></div>
<p>Windows Terminal ve VS Code varsayılan olarak <b>PowerShell</b> açar. Sanal ortamı (ayrıntısı <b>Sanal ortam ve paket yönetimi</b> dersinde) oluşturup etkinleştirdiğinde ilk karşılaşacağın engel şudur:</p>
<pre class="out">.venv\\Scripts\\Activate.ps1 cannot be loaded because running scripts is disabled on this system.</pre>
<p>Bu, PowerShell'in <b>yürütme ilkesi (execution policy)</b> güvenlik ayarıdır; varsayılan "Restricted" hiçbir betiğin çalışmasına izin vermez. Yalnızca kendi kullanıcın için, yönetici gerektirmeden şu ayar yeterlidir:</p>
<pre class="code">Get-ExecutionPolicy -List
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
py -3.12 -m venv .venv
.venv\\Scripts\\Activate.ps1
python -m pip install --upgrade pip</pre>
<p><b>RemoteSigned</b>: kendi yazdığın yerel betikler çalışır, internetten indirilen betikler imza ister. <code>Unrestricted</code> ya da <code>Bypass</code> kullanma; gereğinden geniştir. Etkinleştirme başarılıysa istemin başında <code>(.venv)</code> görürsün; <code>deactivate</code> ile çıkarsın.</p>
<pre class="py">import ntpath, posixpath, sys

def venv_python(proje, windows=True):
    if windows:
        return ntpath.join(proje, ".venv", "Scripts", "python.exe")
    return posixpath.join(proje, ".venv", "bin", "python")

print(venv_python(r"C:\\dev\\anadolu-rapor"))
print(venv_python("/home/ayse/anadolu-rapor", windows=False))
print("Şu an sanal ortamda mıyım?", sys.prefix != sys.base_prefix)</pre>
<div class="note"><b>Neden Scripts?</b>Windows'ta venv içindeki çalıştırılabilir dosyalar <code>Scripts</code> klasörüne, macOS ve Linux'ta <code>bin</code> klasörüne konur. VS Code bu farkı kendisi bilir; ama bir yapılandırma dosyasına elle yol yazarken ya da CI betiğinde bu fark sık hata kaynağıdır.</div>

<h2>winget, birden çok sürüm ve kaldırma</h2>
<pre class="code">winget search Python.Python
winget install Python.Python.3.12
winget install Python.Python.3.13
winget upgrade Python.Python.3.12
winget uninstall Python.Python.3.11</pre>
<p>Birden çok sürüm yan yana sorunsuz yaşar; her biri kendi klasöründedir. Kural basit: <b>projeyi sürüme bağla, PATH'e değil</b>. Her proje kendi venv'ini <code>py -3.12 -m venv .venv</code> ile oluşturur; o venv etkinken <code>python</code> hep doğru sürümdür. PATH'teki "varsayılan" Python yalnızca hızlı denemeler içindir.</p>
<p><b>Kaldırma:</b> Ayarlar → Uygulamalar → "Python 3.11.x" → Kaldır (ya da <code>winget uninstall</code>). Kaldırma sonrası üç artık kalabilir: PATH'teki ölü girdiler (elle sil), <code>%LOCALAPPDATA%\\Programs\\Python</code> altındaki boş klasör ve <code>%LOCALAPPDATA%\\pip\\Cache</code> önbelleği. Ölü PATH girdisi zararsız görünür ama <code>where</code> çıktısını kafa karıştırıcı yapar.</p>

<h2>Belirti → neden → çözüm</h2>
<div class="tbl-wrap"><table>
<tr><th>Belirti</th><th>Neden</th><th>Çözüm</th></tr>
<tr><td><code>'python' is not recognized</code> / "terimi cmdlet olarak tanınmıyor"</td><td>Python klasörü PATH'te yok</td><td>Yükleyiciyi tekrar çalıştır → Modify → "Add to environment variables"; ya da <code>py</code> kullan</td></tr>
<tr><td><code>python</code> yazınca Store açılıyor / "Python was not found"</td><td>WindowsApps takma adı PATH'te önde</td><td>App execution aliases'ta python.exe ve python3.exe'yi kapat</td></tr>
<tr><td><code>'pip' is not recognized</code></td><td><code>Scripts</code> klasörü PATH'te yok</td><td>Her zaman <code>python -m pip</code> ya da <code>py -m pip</code> kullan</td></tr>
<tr><td><code>Activate.ps1 cannot be loaded</code></td><td>PowerShell yürütme ilkesi Restricted</td><td><code>Set-ExecutionPolicy -Scope CurrentUser RemoteSigned</code></td></tr>
<tr><td><code>SSL: CERTIFICATE_VERIFY_FAILED</code> (pip install)</td><td>Kurumsal ağ trafiği kendi sertifikasıyla inceliyor</td><td>BT'den kurum sertifikasını iste: <code>pip config set global.cert C:\\certs\\kurum.pem</code>; <code>--trusted-host</code> yalnız geçici çözüm</td></tr>
<tr><td><code>PermissionError</code> / "Access is denied"</td><td>Program Files'a yöneticisiz paket kurmaya çalışmak ya da dosya başka programda açık</td><td>venv kullan; VS Code ve açık terminalleri kapatıp tekrar dene</td></tr>
<tr><td>Kullanıcı adı "Şükrü" ya da "Ayşe Yılmaz": bazı araçlar yol hatası veriyor</td><td>Türkçe karakter ve boşluk eski araçlarda kodlama/tırnak sorunu yaratır</td><td>Python'ı <code>C:\\Python312</code>'ye, projeleri <code>C:\\dev</code>'e koy; yolları tırnakla yaz</td></tr>
<tr><td>Yanlış sürüm çalışıyor (3.9 bekliyorsun 3.12 geliyor)</td><td>PATH sırası; <code>where python</code>'da ilk satır başka kurulum</td><td>PATH'te sırayı değiştir ya da <code>py -3.12</code> / venv kullan</td></tr>
<tr><td><code>UnicodeEncodeError</code>: Türkçe karakter yazdırırken</td><td>Eski konsol kod sayfası (cp857/cp1254)</td><td>Windows Terminal kullan; <code>PYTHONUTF8=1</code> ortam değişkenini ayarla</td></tr>
<tr><td>Kurdum ama komut hâlâ yok</td><td>Terminal PATH değişmeden önce açılmıştı</td><td>Yeni terminal aç; VS Code'u tamamen kapatıp aç</td></tr>
<tr><td>pip: "No such file or directory" çok uzun yolda</td><td>260 karakter yol sınırı</td><td>Yükleyicideki "Disable path length limit" ya da projeyi kısa yola taşı</td></tr>
</table></div>
<div class="warn"><b>Hata mesajının ilk satırı değil son satırı</b>pip ve Python hatalarında asıl neden genellikle en alttaki satırdadır. Uzun bir kırmızı metin gördüğünde aşağıdan yukarı oku ve son satırı aynen arat.</div>

<div class="note"><b>Gerçek işte</b>Kurumsal bilgisayarlarda çoğu zaman yönetici iznin olmaz, internet bir vekil sunucu (proxy) üzerinden geçer ve trafik kurum sertifikasıyla incelenir. Bu yüzden ekipler kurulum adımlarını README'ye yazar: "python.org 3.14, kurulum adımları, ardından <code>py -3.14 -m venv .venv</code>". Yeni gelen kişi bu listeyi izler, sorun çıkarsa <code>where python</code>, <code>py --list</code> ve <code>python -m pip config list</code> çıktılarını destek kanalına yapıştırır. Bu üç çıktı, sorunların büyük kısmını uzaktan teşhis etmeye yeter.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Sessiz kurulum ve otomasyon</h3>
<p>BT ekipleri yükleyiciyi ekran açmadan çalıştırır. Komut satırı seçenekleri ekrandaki kutuların karşılığıdır:</p>
<pre class="code">python-3.12.4-amd64.exe /quiet InstallAllUsers=0 PrependPath=1 Include_launcher=1 Include_test=0</pre>
<p>Böyle bir komutu Python'da <code>shlex</code> ile parçalara ayırabilirsin. <code>shlex.split</code>, kabuk kurallarını uygular: çift tırnak içindeki boşluklar korunur ve tırnaklar atılır. Tırnak <b>dışındaki</b> ters bölü ise kaçış karakteri sayılıp silinir; Windows yollarını komutlarda tırnakla yazmanın bir nedeni de budur.</p>
<pre class="py">import shlex

komut = 'python-3.12.4-amd64.exe /quiet InstallAllUsers=0 PrependPath=1 TargetDir="C:\\\\Program Files\\\\Python312"'
parcalar = shlex.split(komut)
print(parcalar[0])
for p in parcalar[1:]:
    if "=" in p:
        anahtar, deger = p.split("=", 1)
        print(f"  ayar   {anahtar:16} = {deger}")
    else:
        print(f"  bayrak {p}")

print(shlex.split(r"TargetDir=C:\\Python312"))   # tırnaksız: ters bölü kaybolur!</pre>
<h3>Sanal ortamda olup olmadığını anlamak</h3>
<p><code>sys.prefix</code> çalışan ortamın kökünü, <code>sys.base_prefix</code> o ortamın türetildiği Python kurulumunu gösterir. İkisi farklıysa bir venv içindesin. Her venv'in kökünde <code>pyvenv.cfg</code> dosyası vardır; içindeki <code>home = C:\\Python312</code> satırı ortamın hangi Python'dan oluşturulduğunu söyler. Bu yüzden Python'ı kaldırıp yeniden kurduğunda eski venv'ler bozulur: <code>home</code> artık var olmayan bir yeri gösterir. Çözüm venv'i silip yeniden oluşturmaktır; venv taşınabilir bir şey değildir.</p>
<h3>PYTHONUTF8 ve kodlama</h3>
<p>Python 3.15 ile UTF-8 modu varsayılan oldu (Ekim 2026). 3.14 ve öncesinde Windows'ta <code>open()</code> varsayılan olarak sistemin kod sayfasını kullanır. Türkçe veriyle çalışıyorsan her zaman <code>open(yol, encoding="utf-8")</code> yaz ya da <code>PYTHONUTF8=1</code> değişkenini kalıcı olarak ayarla.</p>
</section>
`,
  ex: [{
      t: 'mc',
      stage: 'Isınma',
      q: '<code>where python</code> komutu şu iki satırı yazdırıyor:<br><code>C:\\Users\\ayse\\AppData\\Local\\Microsoft\\WindowsApps\\python.exe</code><br><code>C:\\Users\\ayse\\AppData\\Local\\Programs\\Python\\Python312\\python.exe</code><br>Terminale <code>python</code> yazınca ne olur?',
      o: [
        'Gerçek kurulum her zaman takma addan önce geldiği için Python 3.12 açılır',
        'İlk satırdaki Store takma adı çalışır; Store açılır ya da "not found" yazar',
        'Windows iki eşleşmeyi görünce hangisini istediğini soran bir menü açar',
        'Komut belirsiz olduğu için hiçbiri çalışmaz ve terminal hata kodu döner'
      ],
      a: 1,
      why: 'Windows PATH klasörlerini soldan sağa tarar ve bulduğu ilk python.exe dosyasını çalıştırır; where çıktısının sırası bu taramanın sırasıdır. İlk satır WindowsApps takma adı olduğu için Store devreye girer. App execution aliases ayarından takma adı kapatınca ikinci satır ilk sıraya geçer.'
    },
    {
      t: 'mc',
      stage: 'Isınma',
      q: 'VS Code terminalinde <code>.venv\\Scripts\\Activate.ps1</code> çalıştırınca "running scripts is disabled on this system" hatası alıyorsun. Yönetici iznin yok. En doğru çözüm hangisi?',
      o: [
        'Python\'ı kaldırıp Microsoft Store sürümünü kurmak',
        '<code>Set-ExecutionPolicy -Scope CurrentUser RemoteSigned</code> çalıştırmak',
        '<code>Set-ExecutionPolicy Unrestricted</code> ile tüm makineyi serbest bırakmak',
        'venv kullanmayı bırakıp paketleri doğrudan ana Python\'a kurmak'
      ],
      a: 1,
      why: 'Hata PowerShell\'in yürütme ilkesinden gelir, Python\'dan değil. CurrentUser kapsamı yönetici istemez ve RemoteSigned yerel betiklere izin verirken indirilen betiklerden imza ister. Unrestricted gereğinden geniştir (ve makine kapsamı yönetici ister); venv\'den vazgeçmek ise sorunu büyütür.'
    },
    {
      t: 'mc',
      stage: 'Isınma',
      q: 'Bilgisayarında Python 3.11 ve 3.12 kurulu. <code>py -3.11 -m pip install pandas</code> komutu ne yapar?',
      o: [
        'pandas paketini PATH\'te ilk sırada bulunan Python sürümüne kurar',
        'pandas paketini bilgisayardaki tüm Python sürümlerine birden kurar',
        'pandas paketini yalnızca Python 3.11 kurulumuna kurar',
        'py komutu yalnızca betik çalıştırır; pip ile birlikte kullanılamaz'
      ],
      a: 2,
      why: 'py başlatıcısı PATH\'e bakmaz, kayıt defterindeki kurulumlardan istenen sürümü seçer. -m pip o sürümün kendi pip modülünü çalıştırır; böylece paket tam olarak 3.11\'e gider. "pip install" yazmak ise PATH\'te ilk bulunan pip\'e, yani belki de başka bir sürüme kurar.'
    }],
  faq: [
    {
      q: 'Install Now mı Customize installation mı seçmeliyim?',
      a: 'Kendi bilgisayarında ve kullanıcı adın İngilizce karakterliyse Install Now (PATH kutusu işaretli) yeterlidir. Kullanıcı adında Türkçe karakter ya da boşluk varsa Customize ile C:\\Python312 gibi kısa bir yol seç.'
    },
    {
      q: 'Store sürümü kötü mü?',
      a: 'Kötü değil; yönetici izni gerektirmez ve otomatik güncellenir. Ama py başlatıcısı gelmez ve bazı klasörlere yazma kısıtlıdır. Kurumsal projelerde python.org sürümü daha öngörülebilirdir.'
    },
    {
      q: 'PATH\'e Python\'ı eklemezsem ne kaybederim?',
      a: 'python ve pip komutlarını doğrudan yazamazsın; ama py başlatıcısı PATH\'ten bağımsız çalıştığı için py ve py -m pip ile her şeyi yapabilirsin. Venv etkinken de PATH sorunu yaşamazsın.'
    },
    {
      q: 'Python\'ı güncellemek için eskisini kaldırmam gerekir mi?',
      a: 'Aynı alt sürüm içinde (3.12.3 → 3.12.4) yükleyici üzerine kurar. Yeni alt sürüm (3.12 → 3.13) yan yana kurulur; eski projelerin venv\'leri eski sürüme bağlı kalır. Eskisini ancak hiçbir proje kullanmıyorsa kaldır.'
    },
    {
      q: 'WSL kullanmalı mıyım?',
      a: 'Linux sunuculara dağıtım yapan ekiplerde WSL (Windows Subsystem for Linux) iyi bir seçenektir; içinde Ubuntu çalışır ve macOS/Linux dersindeki adımlar geçerli olur. Yalnızca öğrenmek için Windows\'a doğrudan kurmak yeterlidir.'
    }
  ],
  mistakes: [
    {
      bad: 'pip install pandas',
      good: 'python -m pip install pandas\n# ya da belirli sürüm için\npy -3.12 -m pip install pandas',
      why: 'Tek başına pip, PATH\'te ilk bulunan pip\'tir ve başka bir Python\'a ait olabilir. python -m pip paketi tam olarak o yorumlayıcıya kurar.'
    },
    {
      bad: 'if platform.python_version() >= "3.10":\n    print("uygun")',
      good: 'import sys\nif sys.version_info >= (3, 10):\n    print("uygun")',
      why: 'Metin karşılaştırmasında "3.9" büyük çıkar. sys.version_info demet olarak sayı sayı karşılaştırılır.'
    },
    {
      bad: 'klasorler = path_metni.split(":")',
      good: 'import os\nklasorler = [k for k in path_metni.split(os.pathsep) if k]',
      why: 'Windows\'ta PATH ayırıcısı ";" ve ":" sürücü harfinin (C:) parçasıdır. os.pathsep her sistemde doğru ayırıcıyı verir; boş girdileri de at.'
    },
    {
      bad: 'yol = "C:\\Users\\ayse\\new_rapor.txt"',
      good: 'yol = r"C:\\Users\\ayse\\new_rapor.txt"\n# ya da\nyol = "C:/Users/ayse/new_rapor.txt"',
      why: 'Normal metinde \\n satır sonu, \\U unicode kaçışıdır; Windows yolu bozulur ya da SyntaxError verir. Ham metin (r"...") ya da düz bölü kullan.'
    }
  ]
}
);
})(window);
