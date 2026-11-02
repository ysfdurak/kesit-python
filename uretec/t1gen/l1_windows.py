import sys; sys.path.insert(0, '/tmp/claude-0/-home-claude/6c066959-3fcb-54bb-bdf1-c8ae148dfc4c/scratchpad/t1gen')
from t1lib import emit

BODY = r'''
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
<li><b>Install Now</b> seçersen Python kullanıcı klasörüne kurulur: <code>C:\Users\ayse\AppData\Local\Programs\Python\Python312</code>. Yönetici izni gerekmez. Yeni başlıyorsan bu yeterlidir.</li>
<li><b>Customize installation</b> seçersen "Optional Features" ekranı gelir: <i>pip</i> (paket yükleyici, açık kalsın), <i>tcl/tk and IDLE</i> (basit editör ve tkinter), <i>Python test suite</i> (gerekmez), <i>py launcher</i> (açık kalsın), <i>for all users</i> (başlatıcıyı herkese kurar).</li>
<li><b>Advanced Options</b> ekranında: <i>Install Python 3.12 for all users</i> (Program Files'a kurar, yönetici ister), <i>Associate files with Python</i> (.py dosyasına çift tıklayınca çalışsın), <i>Add Python to environment variables</i> (ilk ekrandaki PATH kutusunun aynısı), <i>Precompile standard library</i>. Kurulum yolunu <code>C:\Python312</code> gibi <b>kısa, boşluksuz, Türkçe karaktersiz</b> bir yere almak ileride çok baş ağrısı önler.</li>
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
print("64 bit mi  :", sys.maxsize > 2**32)
print("3.10+ mı   :", sys.version_info >= (3, 10))</pre>
<div class="tip"><b>Sürüm karşılaştırmanın doğru yolu</b><code>sys.version_info</code> bir demet (tuple) gibi davranır; <code>sys.version_info &gt;= (3, 10)</code> sayı sayı karşılaştırır. Sürümü metin olarak karşılaştırma: <code>"3.9" &gt; "3.12"</code> ifadesi True döner çünkü metinler karakter karakter karşılaştırılır ve "9" &gt; "1".</div>

<h2>Microsoft Store tuzağı: App execution aliases</h2>
<p>Windows 10 ve 11, Python kurulu olmasa bile <code>C:\Users\ayse\AppData\Local\Microsoft\WindowsApps</code> klasörüne <code>python.exe</code> ve <code>python3.exe</code> adında küçük <b>takma ad (alias)</b> dosyaları koyar. Bunlar gerçek Python değildir; çalışınca Store'u açar ya da <code>Python was not found; run without arguments to install from the Microsoft Store</code> yazar. WindowsApps klasörü PATH'te genellikle senin Python klasöründen <b>önce</b> geldiği için, Python'ı kurmuş olsan bile takma ad kazanır.</p>
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
<pre class="py">path_metni = r"C:\Windows\system32;C:\Users\ayse\AppData\Local\Microsoft\WindowsApps;C:\Users\ayse\AppData\Local\Programs\Python\Python312\Scripts;C:\Users\ayse\AppData\Local\Programs\Python\Python312;;C:\Program Files\Git\cmd"

for sira, klasor in enumerate(path_metni.split(";"), start=1):
    if not klasor:
        print(sira, "(boş girdi)")
        continue
    isaret = "  <-- Python" if "python" in klasor.lower() else ""
    print(sira, klasor + isaret)</pre>
<p>PATH'i kalıcı değiştirmek için Başlat menüsüne "ortam değişkenleri" yaz → <b>Hesabınız için ortam değişkenlerini düzenleyin</b>. Üstte <b>kullanıcı</b> değişkenleri, altta (yönetici gerektiren) <b>sistem</b> değişkenleri vardır. Windows ikisini birleştirir: önce sistem PATH'i, sonra kullanıcı PATH'i. Değişiklikten sonra açık terminaller eski değeri tutar; yeni terminal (bazen VS Code'u tamamen kapatıp açmak) gerekir.</p>
<p><code>where</code> komutunun yaptığını Python ile taklit edelim. Gerçek bilgisayarda dosyalar diskte; burada var olan dosyaları bir küme (set) olarak veriyoruz.</p>
<pre class="py">import ntpath

path_klasorleri = [
    r"C:\Users\ayse\AppData\Local\Microsoft\WindowsApps",
    r"C:\Python312",
    r"C:\Python312\Scripts",
]
diskteki_dosyalar = {
    r"C:\Users\ayse\AppData\Local\Microsoft\WindowsApps\python.exe",
    r"C:\Python312\python.exe",
    r"C:\Python312\Scripts\pip.exe",
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
    print(komut, "->", sonuc[0] if sonuc else "tanınmıyor")</pre>
<p>Çıktıdaki <code>python</code> satırı Store takma adını gösteriyor: gerçek Python kurulu olduğu hâlde ilk sırada takma ad var. <code>ntpath</code> modülü Windows yol kurallarını her işletim sisteminde uygular; Linux'ta çalışırken bile ters bölüyle yol birleştirebilirsin.</p>

<h2>PowerShell mı CMD mi? Yürütme ilkesi ve venv</h2>
<div class="tbl-wrap"><table>
<tr><th>İş</th><th>PowerShell</th><th>CMD</th></tr>
<tr><td>PATH'i görmek</td><td><code>$env:Path -split ';'</code></td><td><code>echo %PATH%</code></td></tr>
<tr><td>Geçici değişken</td><td><code>$env:PYTHONUTF8 = "1"</code></td><td><code>set PYTHONUTF8=1</code></td></tr>
<tr><td>venv etkinleştirme</td><td><code>.venv\Scripts\Activate.ps1</code></td><td><code>.venv\Scripts\activate.bat</code></td></tr>
<tr><td>Komutun yeri</td><td><code>Get-Command python</code></td><td><code>where python</code></td></tr>
<tr><td>Ekranı temizle</td><td><code>cls</code> / <code>Clear-Host</code></td><td><code>cls</code></td></tr>
</table></div>
<p>Windows Terminal ve VS Code varsayılan olarak <b>PowerShell</b> açar. Sanal ortamı (ayrıntısı <b>Sanal ortam ve paket yönetimi</b> dersinde) oluşturup etkinleştirdiğinde ilk karşılaşacağın engel şudur:</p>
<pre class="out">.venv\Scripts\Activate.ps1 cannot be loaded because running scripts is disabled on this system.</pre>
<p>Bu, PowerShell'in <b>yürütme ilkesi (execution policy)</b> güvenlik ayarıdır; varsayılan "Restricted" hiçbir betiğin çalışmasına izin vermez. Yalnızca kendi kullanıcın için, yönetici gerektirmeden şu ayar yeterlidir:</p>
<pre class="code">Get-ExecutionPolicy -List
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
py -3.12 -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip</pre>
<p><b>RemoteSigned</b>: kendi yazdığın yerel betikler çalışır, internetten indirilen betikler imza ister. <code>Unrestricted</code> ya da <code>Bypass</code> kullanma; gereğinden geniştir. Etkinleştirme başarılıysa istemin başında <code>(.venv)</code> görürsün; <code>deactivate</code> ile çıkarsın.</p>
<pre class="py">import ntpath, posixpath, sys

def venv_python(proje, windows=True):
    if windows:
        return ntpath.join(proje, ".venv", "Scripts", "python.exe")
    return posixpath.join(proje, ".venv", "bin", "python")

print(venv_python(r"C:\dev\anadolu-rapor"))
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
<p><b>Kaldırma:</b> Ayarlar → Uygulamalar → "Python 3.11.x" → Kaldır (ya da <code>winget uninstall</code>). Kaldırma sonrası üç artık kalabilir: PATH'teki ölü girdiler (elle sil), <code>%LOCALAPPDATA%\Programs\Python</code> altındaki boş klasör ve <code>%LOCALAPPDATA%\pip\Cache</code> önbelleği. Ölü PATH girdisi zararsız görünür ama <code>where</code> çıktısını kafa karıştırıcı yapar.</p>

<h2>Belirti → neden → çözüm</h2>
<div class="tbl-wrap"><table>
<tr><th>Belirti</th><th>Neden</th><th>Çözüm</th></tr>
<tr><td><code>'python' is not recognized</code> / "terimi cmdlet olarak tanınmıyor"</td><td>Python klasörü PATH'te yok</td><td>Yükleyiciyi tekrar çalıştır → Modify → "Add to environment variables"; ya da <code>py</code> kullan</td></tr>
<tr><td><code>python</code> yazınca Store açılıyor / "Python was not found"</td><td>WindowsApps takma adı PATH'te önde</td><td>App execution aliases'ta python.exe ve python3.exe'yi kapat</td></tr>
<tr><td><code>'pip' is not recognized</code></td><td><code>Scripts</code> klasörü PATH'te yok</td><td>Her zaman <code>python -m pip</code> ya da <code>py -m pip</code> kullan</td></tr>
<tr><td><code>Activate.ps1 cannot be loaded</code></td><td>PowerShell yürütme ilkesi Restricted</td><td><code>Set-ExecutionPolicy -Scope CurrentUser RemoteSigned</code></td></tr>
<tr><td><code>SSL: CERTIFICATE_VERIFY_FAILED</code> (pip install)</td><td>Kurumsal ağ trafiği kendi sertifikasıyla inceliyor</td><td>BT'den kurum sertifikasını iste: <code>pip config set global.cert C:\certs\kurum.pem</code>; <code>--trusted-host</code> yalnız geçici çözüm</td></tr>
<tr><td><code>PermissionError</code> / "Access is denied"</td><td>Program Files'a yöneticisiz paket kurmaya çalışmak ya da dosya başka programda açık</td><td>venv kullan; VS Code ve açık terminalleri kapatıp tekrar dene</td></tr>
<tr><td>Kullanıcı adı "Şükrü" ya da "Ayşe Yılmaz": bazı araçlar yol hatası veriyor</td><td>Türkçe karakter ve boşluk eski araçlarda kodlama/tırnak sorunu yaratır</td><td>Python'ı <code>C:\Python312</code>'ye, projeleri <code>C:\dev</code>'e koy; yolları tırnakla yaz</td></tr>
<tr><td>Yanlış sürüm çalışıyor (3.9 bekliyorsun 3.12 geliyor)</td><td>PATH sırası; <code>where python</code>'da ilk satır başka kurulum</td><td>PATH'te sırayı değiştir ya da <code>py -3.12</code> / venv kullan</td></tr>
<tr><td><code>UnicodeEncodeError</code>: Türkçe karakter yazdırırken</td><td>Eski konsol kod sayfası (cp857/cp1254)</td><td>Windows Terminal kullan; <code>PYTHONUTF8=1</code> ortam değişkenini ayarla</td></tr>
<tr><td>Kurdum ama komut hâlâ yok</td><td>Terminal PATH değişmeden önce açılmıştı</td><td>Yeni terminal aç; VS Code'u tamamen kapatıp aç</td></tr>
<tr><td>pip: "No such file or directory" çok uzun yolda</td><td>260 karakter yol sınırı</td><td>Yükleyicideki "Disable path length limit" ya da projeyi kısa yola taşı</td></tr>
</table></div>
<div class="warn"><b>Hata mesajının ilk satırı değil son satırı</b>pip ve Python hatalarında asıl neden genellikle en alttaki satırdadır. Uzun bir kırmızı metin gördüğünde aşağıdan yukarı oku ve son satırı aynen arat.</div>

<div class="note"><b>Gerçek işte</b>Kurumsal bilgisayarlarda çoğu zaman yönetici iznin olmaz, internet bir vekil sunucu (proxy) üzerinden geçer ve trafik kurum sertifikasıyla incelenir. Bu yüzden ekipler kurulum adımlarını README'ye yazar: "python.org 3.12, Install Now, PATH kutusu işaretli; ardından <code>py -3.12 -m venv .venv</code>". Yeni gelen kişi bu listeyi izler, sorun çıkarsa <code>where python</code>, <code>py --list</code> ve <code>python -m pip config list</code> çıktılarını destek kanalına yapıştırır. Bu üç çıktı, sorunların büyük kısmını uzaktan teşhis etmeye yeter.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Sessiz kurulum ve otomasyon</h3>
<p>BT ekipleri yükleyiciyi ekran açmadan çalıştırır. Komut satırı seçenekleri ekrandaki kutuların karşılığıdır:</p>
<pre class="code">python-3.12.4-amd64.exe /quiet InstallAllUsers=0 PrependPath=1 Include_launcher=1 Include_test=0</pre>
<p>Böyle bir komutu Python'da <code>shlex</code> ile parçalara ayırabilirsin. <code>shlex.split</code>, kabuk kurallarını uygular: çift tırnak içindeki boşluklar korunur ve tırnaklar atılır. Tırnak <b>dışındaki</b> ters bölü ise kaçış karakteri sayılıp silinir; Windows yollarını komutlarda tırnakla yazmanın bir nedeni de budur.</p>
<pre class="py">import shlex

komut = 'python-3.12.4-amd64.exe /quiet InstallAllUsers=0 PrependPath=1 TargetDir="C:\\Program Files\\Python312"'
parcalar = shlex.split(komut)
print(parcalar[0])
for p in parcalar[1:]:
    if "=" in p:
        anahtar, deger = p.split("=", 1)
        print(f"  ayar   {anahtar:16} = {deger}")
    else:
        print(f"  bayrak {p}")

print(shlex.split(r"TargetDir=C:\Python312"))   # tırnaksız: ters bölü kaybolur!</pre>
<h3>Sanal ortamda olup olmadığını anlamak</h3>
<p><code>sys.prefix</code> çalışan ortamın kökünü, <code>sys.base_prefix</code> o ortamın türetildiği Python kurulumunu gösterir. İkisi farklıysa bir venv içindesin. Her venv'in kökünde <code>pyvenv.cfg</code> dosyası vardır; içindeki <code>home = C:\Python312</code> satırı ortamın hangi Python'dan oluşturulduğunu söyler. Bu yüzden Python'ı kaldırıp yeniden kurduğunda eski venv'ler bozulur: <code>home</code> artık var olmayan bir yeri gösterir. Çözüm venv'i silip yeniden oluşturmaktır; venv taşınabilir bir şey değildir.</p>
<h3>PYTHONUTF8 ve kodlama</h3>
<p>Python 3.15 ile UTF-8 modu varsayılan olacak; o zamana kadar Windows'ta <code>open()</code> varsayılan olarak sistemin kod sayfasını kullanır. Türkçe veriyle çalışıyorsan her zaman <code>open(yol, encoding="utf-8")</code> yaz ya da <code>PYTHONUTF8=1</code> değişkenini kalıcı olarak ayarla.</p>
</section>
'''

EX = [
  # ---------- Isınma ----------
  { 't': 'mc', 'stage': 'Isınma',
    'q': '<code>where python</code> komutu şu iki satırı yazdırıyor:<br><code>C:\\Users\\ayse\\AppData\\Local\\Microsoft\\WindowsApps\\python.exe</code><br><code>C:\\Users\\ayse\\AppData\\Local\\Programs\\Python\\Python312\\python.exe</code><br>Terminale <code>python</code> yazınca ne olur?',
    'o': ['Gerçek kurulum her zaman takma addan önce geldiği için Python 3.12 açılır',
          'İlk satırdaki Store takma adı çalışır; Store açılır ya da "not found" yazar',
          'Windows iki eşleşmeyi görünce hangisini istediğini soran bir menü açar',
          'Komut belirsiz olduğu için hiçbiri çalışmaz ve terminal hata kodu döner'],
    'a': 1,
    'why': 'Windows PATH klasörlerini soldan sağa tarar ve bulduğu ilk python.exe dosyasını çalıştırır; where çıktısının sırası bu taramanın sırasıdır. İlk satır WindowsApps takma adı olduğu için Store devreye girer. App execution aliases ayarından takma adı kapatınca ikinci satır ilk sıraya geçer.' },
  { 't': 'mc', 'stage': 'Isınma',
    'q': 'VS Code terminalinde <code>.venv\\Scripts\\Activate.ps1</code> çalıştırınca "running scripts is disabled on this system" hatası alıyorsun. Yönetici iznin yok. En doğru çözüm hangisi?',
    'o': ['Python\'ı kaldırıp Microsoft Store sürümünü kurmak',
          '<code>Set-ExecutionPolicy -Scope CurrentUser RemoteSigned</code> çalıştırmak',
          '<code>Set-ExecutionPolicy Unrestricted</code> ile tüm makineyi serbest bırakmak',
          'venv kullanmayı bırakıp paketleri doğrudan ana Python\'a kurmak'],
    'a': 1,
    'why': 'Hata PowerShell\'in yürütme ilkesinden gelir, Python\'dan değil. CurrentUser kapsamı yönetici istemez ve RemoteSigned yerel betiklere izin verirken indirilen betiklerden imza ister. Unrestricted gereğinden geniştir (ve makine kapsamı yönetici ister); venv\'den vazgeçmek ise sorunu büyütür.' },
  { 't': 'mc', 'stage': 'Isınma',
    'q': 'Bilgisayarında Python 3.11 ve 3.12 kurulu. <code>py -3.11 -m pip install pandas</code> komutu ne yapar?',
    'o': ['pandas paketini PATH\'te ilk sırada bulunan Python sürümüne kurar',
          'pandas paketini bilgisayardaki tüm Python sürümlerine birden kurar',
          'pandas paketini yalnızca Python 3.11 kurulumuna kurar',
          'py komutu yalnızca betik çalıştırır; pip ile birlikte kullanılamaz'],
    'a': 2,
    'why': 'py başlatıcısı PATH\'e bakmaz, kayıt defterindeki kurulumlardan istenen sürümü seçer. -m pip o sürümün kendi pip modülünü çalıştırır; böylece paket tam olarak 3.11\'e gider. "pip install" yazmak ise PATH\'te ilk bulunan pip\'e, yani belki de başka bir sürüme kurar.' },

  # ---------- Kodu oku ----------
  { 't': 'predict', 'stage': 'Kodu oku', 'q': 'Bu kod ne yazdırır?',
    'code': 'path_metni = r"C:\\Windows;C:\\Python312;;C:\\Python312\\Scripts"\nparcalar = path_metni.split(";")\nprint(len(parcalar), parcalar[-1])\n',
    'o': ['3 C:\\Python312\\Scripts', '4 C:\\Python312\\Scripts', '4 C:\\Python312', '3 C:\\Python312'],
    'a': 1,
    'why': 'Art arda iki noktalı virgül arasında boş bir metin vardır; split onu da bir parça sayar. Bu yüzden 4 parça çıkar ve sonuncusu Scripts klasörüdür. Gerçek PATH\'lerde boş girdiler sık görülür; ayrıştırırken atlaman gerekir.' },
  { 't': 'predict', 'stage': 'Kodu oku', 'q': 'Bu kod ne yazdırır? (ntpath, Windows yol kurallarını her işletim sisteminde uygular.)',
    'code': 'import ntpath\nyol = ntpath.join("C:\\\\dev\\\\rapor", ".venv", "Scripts", "python.exe")\nprint(yol)\nprint(ntpath.basename(ntpath.dirname(yol)))\n',
    'o': ['C:\\dev\\rapor\\.venv\\Scripts\\python.exe\nScripts',
          'C:\\dev\\rapor/.venv/Scripts/python.exe\nScripts',
          'C:\\dev\\rapor\\.venv\\Scripts\\python.exe\npython.exe',
          'C:\\dev\\rapor\\.venv\\bin\\python\nbin'],
    'a': 0,
    'why': 'ntpath.join parçaları ters bölüyle birleştirir. dirname son parçayı (python.exe) atar ve Scripts klasörüne kadar olan yolu verir; basename o yolun son parçası olan Scripts\'i döndürür. bin yalnızca macOS/Linux venv\'lerinde kullanılır.' },
  { 't': 'predict', 'stage': 'Kodu oku', 'q': 'Ekip arkadaşın en yeni Python\'ı metin karşılaştırmasıyla seçmeye çalışıyor. Bu kod ne yazdırır?',
    'code': 'surumler = ["3.9.18", "3.12.4", "3.11.9"]\nprint(max(surumler))\nprint(max(surumler, key=lambda s: tuple(int(p) for p in s.split("."))))\n',
    'o': ['3.12.4\n3.12.4', '3.9.18\n3.9.18', '3.9.18\n3.12.4', '3.11.9\n3.12.4'],
    'a': 2,
    'why': 'Metinler karakter karakter karşılaştırılır: "3.9" ile "3.1" karşılaştırmasında "9" büyük olduğu için "3.9.18" en büyük metin olur. Sayı demetine çevirince (3, 12, 4) &gt; (3, 9, 18) doğru sonucu verir.' },
  { 't': 'order', 'stage': 'Kodu oku',
    'q': '<p>Yeni bir Windows bilgisayarında projeyi sıfırdan hazırlayan komut listesini oluşturan betiği sırala. Her komut bir öncekinin sonucuna ihtiyaç duyar: önce Python kurulmalı, sonra kurulduğu doğrulanmalı, sonra sanal ortam oluşturulup etkinleştirilmeli, en son paket kurulmalı.</p>',
    'lines': ['komutlar = []',
              'komutlar.append("winget install Python.Python.3.12")',
              'komutlar.append("py --list")',
              'komutlar.append("py -3.12 -m venv .venv")',
              'komutlar.append(".venv\\\\Scripts\\\\Activate.ps1")',
              'komutlar.append("python -m pip install requests")',
              'for sira, komut in enumerate(komutlar, start=1):',
              '    print(f"{sira}. {komut}")'],
    'expect': '1. winget install Python.Python.3.12\n2. py --list\n3. py -3.12 -m venv .venv\n4. .venv\\Scripts\\Activate.ps1\n5. python -m pip install requests\n',
    'hint': 'Var olmayan bir Python ile venv oluşturamazsın; etkin olmayan venv\'e kurulan paket de ana Python\'a gider.',
    'why': 'Kurulum → doğrulama → venv oluşturma → etkinleştirme → paket kurma. Etkinleştirmeden önce pip install yazarsan paket global Python\'a kurulur; venv oluşturmadan etkinleştirme dosyası yoktur.' },

  # ---------- Rehberli ----------
  { 't': 'code', 'stage': 'Rehberli', 'id': 'kurulum-windows-1', 'diff': 1,
    'q': '<p>Anadolu Bank\'ın rapor betiği en az Python 3.10 istiyor (match ifadesi kullanıyor). <code>surum_kontrol(surum, en_az=(3, 10))</code> fonksiyonunu yaz. <code>surum</code>, <code>(3, 12, 4)</code> gibi üç sayılık bir demettir (sys.version_info[:3] de böyle bir demet verir).</p><ul><li>Sürüm yeterliyse <code>"Uygun: 3.12.4"</code> döndür.</li><li>Yeterli değilse <code>"Eski sürüm: 3.9.18 (en az 3.10 gerekli)"</code> döndür.</li></ul>',
    'guide': ['Demetteki sayıları noktayla birleştirip "3.12.4" metnini üret (map(str, ...) ve ".".join).',
              'en_az demetini de aynı yolla "3.10" metnine çevir.',
              'Karşılaştırmayı metinlerle değil demetlerle yap: surum &gt;= en_az.',
              'Koşula göre iki mesajdan birini f-string ile döndür.'],
    'example': 'import sys\nhedef = (3, 8)\nsimdiki = sys.version_info[:2]\nmetin = ".".join(str(s) for s in simdiki)\nprint(metin, "yeterli" if simdiki >= hedef else "eski")\n',
    'start': 'def surum_kontrol(surum, en_az=(3, 10)):\n    # TODO: surum demetini "3.12.4" biçiminde metne çevir\n    surum_metni = ""\n    # TODO: en_az demetini metne çevir\n    en_az_metni = ""\n    # TODO: demetleri karşılaştır ve uygun mesajı döndür\n    return ""\n',
    'sol': 'def surum_kontrol(surum, en_az=(3, 10)):\n    surum_metni = ".".join(map(str, surum))\n    en_az_metni = ".".join(map(str, en_az))\n    if tuple(surum) >= tuple(en_az):\n        return f"Uygun: {surum_metni}"\n    return f"Eski sürüm: {surum_metni} (en az {en_az_metni} gerekli)"\n',
    'tests': 'import sys\nassert surum_kontrol((3, 12, 4)) == "Uygun: 3.12.4", "3.12.4 en az 3.10 koşulunu sağlar"\nassert surum_kontrol((3, 9, 18)) == "Eski sürüm: 3.9.18 (en az 3.10 gerekli)", "3.9.18 eski sayılmalı; metin karşılaştırması burada yanlış sonuç verir"\nassert surum_kontrol((3, 10, 0)) == "Uygun: 3.10.0", "Sınır değer (tam 3.10) uygundur: >= kullan"\nassert surum_kontrol((3, 11, 2), en_az=(3, 12)) == "Eski sürüm: 3.11.2 (en az 3.12 gerekli)", "en_az parametresine uymalısın"\nassert surum_kontrol(sys.version_info[:3]).startswith("Uygun"), "Çalışan Python 3.10+ olduğundan Uygun dönmeli"\n',
    'hints': ['Sürüm karşılaştırması için demetler kullan; Python demetleri soldan sağa sayı sayı karşılaştırır.',
              '".".join(map(str, (3, 12, 4))) ifadesi "3.12.4" verir.',
              'if tuple(surum) &gt;= tuple(en_az): return f"Uygun: {surum_metni}"'],
    'why': 'Demet karşılaştırması 3.12 ile 3.9\'u doğru sıralar; metin karşılaştırması "3.9" &gt; "3.12" der. sys.version_info da demet gibi davrandığı için aynı fonksiyon gerçek sürümle de çalışır.' },
  { 't': 'code', 'stage': 'Rehberli', 'id': 'kurulum-windows-2', 'diff': 2,
    'q': '<p>Destek ekibine gelen PATH metinlerinde Python ile ilgili klasörleri bulan <code>python_klasorleri(path_metni, ayirici)</code> fonksiyonunu yaz. <code>ayirici</code> parametresi Windows\'ta <code>";"</code>, macOS/Linux\'ta <code>":"</code> olur (gerçek kodda <code>os.pathsep</code> verilir).</p><ul><li>Metni ayırıcıyla böl, her parçanın baş/son boşluklarını at.</li><li>Boş parçaları atla.</li><li>İçinde büyük/küçük harf fark etmeksizin <code>python</code> geçenleri, PATH\'teki sırayla, bir liste olarak döndür.</li></ul>',
    'guide': ['Sonuç için boş bir liste oluştur.',
              'path_metni.split(ayirici) ile parçalar üzerinde dön.',
              'Her parçayı strip() ile temizle; boşsa continue.',
              'parca.lower() içinde "python" geçiyorsa listeye ekle.',
              'Döngüden sonra listeyi döndür.'],
    'example': 'satir = "elma, ,Armut,  kiraz "\nmeyveler = []\nfor p in satir.split(","):\n    p = p.strip()\n    if not p:\n        continue\n    if "a" in p.lower():\n        meyveler.append(p)\nprint(meyveler)\n',
    'start': 'def python_klasorleri(path_metni, ayirici):\n    sonuc = []\n    # TODO: path_metni\'ni ayirici ile böl ve parçalarda dön\n    # TODO: boşlukları temizle, boş parçayı atla\n    # TODO: "python" geçen parçayı sonuca ekle\n    return sonuc\n',
    'sol': 'def python_klasorleri(path_metni, ayirici):\n    sonuc = []\n    for parca in path_metni.split(ayirici):\n        parca = parca.strip()\n        if not parca:\n            continue\n        if "python" in parca.lower():\n            sonuc.append(parca)\n    return sonuc\n',
    'tests': 'w = r"C:\\Windows;C:\\Users\\ayse\\AppData\\Local\\Programs\\Python\\Python312\\Scripts\\; ;C:\\Users\\ayse\\AppData\\Local\\Programs\\Python\\Python312\\;;C:\\Program Files\\Git\\cmd"\nkok = r"C:\\Users\\ayse\\AppData\\Local\\Programs\\Python\\Python312"\nassert python_klasorleri(w, ";") == [kok + "\\\\Scripts\\\\", kok + "\\\\"], "Windows PATH\'inde iki Python klasörü PATH sırasıyla dönmeli"\nl = "/usr/local/bin:/usr/bin:/home/ayse/.pyenv/shims:/opt/homebrew/opt/python@3.12/bin"\nassert python_klasorleri(l, ":") == ["/opt/homebrew/opt/python@3.12/bin"], "Linux/macOS metninde ayırıcı \':\' olmalı; .pyenv içinde \'python\' geçmez"\nassert python_klasorleri("", ";") == [], "Boş PATH boş liste döndürmeli"\nassert python_klasorleri("C:\\\\PYTHON39", ";") == ["C:\\\\PYTHON39"], "Büyük/küçük harf fark etmemeli: lower() kullan"\n',
    'hints': ['Ayırıcıyı sabit yazma; parametreden gelen ayirici\'yi kullan.',
              'for parca in path_metni.split(ayirici): ve içinde parca = parca.strip()',
              'if "python" in parca.lower(): sonuc.append(parca)'],
    'why': 'Ayırıcıyı parametre yapmak aynı fonksiyonun her işletim sisteminde çalışmasını sağlar; gerçek kodda os.pathsep verilir. strip ve boş parça kontrolü, elle düzenlenmiş PATH\'lerdeki boşlukları ve çift ayırıcıları tolere eder.' },
  { 't': 'code', 'stage': 'Rehberli', 'id': 'kurulum-windows-3', 'diff': 2,
    'q': '<p><code>where</code> komutunu taklit eden <code>where_simule(klasorler, diskteki, komut)</code> fonksiyonunu yaz.</p><ul><li><code>klasorler</code>: PATH klasörlerinin sıralı listesi.</li><li><code>diskteki</code>: diskte var olan dosyaların tam yollarını içeren küme.</li><li>Her klasör için <code>ntpath.join(klasor, komut + ".exe")</code> adayını oluştur; kümede varsa sonuca ekle.</li><li>Bulunan tam yolların listesini PATH sırasıyla döndür (bulunamazsa boş liste).</li></ul>',
    'guide': ['ntpath modülünü içe aktar.',
              'Boş bir bulunanlar listesi oluştur.',
              'klasorler listesinde sırayla dön ve aday yolu ntpath.join ile kur.',
              'aday in diskteki ise listeye ekle; sonunda listeyi döndür.'],
    'example': 'import posixpath\nraflar = ["/depo/a", "/depo/b"]\nvar = {"/depo/b/vida.txt"}\nfor r in raflar:\n    aday = posixpath.join(r, "vida" + ".txt")\n    print(aday, aday in var)\n',
    'start': 'import ntpath\n\ndef where_simule(klasorler, diskteki, komut):\n    bulunanlar = []\n    # TODO: her klasör için komut + ".exe" adayını oluştur\n    # TODO: aday diskte varsa bulunanlar\'a ekle\n    return bulunanlar\n',
    'sol': 'import ntpath\n\ndef where_simule(klasorler, diskteki, komut):\n    bulunanlar = []\n    for klasor in klasorler:\n        aday = ntpath.join(klasor, komut + ".exe")\n        if aday in diskteki:\n            bulunanlar.append(aday)\n    return bulunanlar\n',
    'tests': 'k = [r"C:\\Users\\ayse\\AppData\\Local\\Microsoft\\WindowsApps", r"C:\\Python311", r"C:\\Python312", r"C:\\Python312\\Scripts"]\nd = {r"C:\\Users\\ayse\\AppData\\Local\\Microsoft\\WindowsApps\\python.exe", r"C:\\Python311\\python.exe", r"C:\\Python312\\python.exe", r"C:\\Python312\\Scripts\\pip.exe"}\nassert where_simule(k, d, "python") == [r"C:\\Users\\ayse\\AppData\\Local\\Microsoft\\WindowsApps\\python.exe", r"C:\\Python311\\python.exe", r"C:\\Python312\\python.exe"], "Üç python.exe PATH sırasıyla bulunmalı; ilk satır çalışacak olandır"\nassert where_simule(k, d, "pip") == [r"C:\\Python312\\Scripts\\pip.exe"], "pip yalnızca Scripts klasöründe"\nassert where_simule(k, d, "git") == [], "Bulunamayan komut için boş liste dönmeli (where \'INFO: Could not find\' der)"\nassert where_simule(["C:\\\\Python312\\\\"], d, "python") == [r"C:\\Python312\\python.exe"], "Sonda ters bölü olan klasörde ntpath.join çift ters bölü üretmez"\n',
    'hints': ['ntpath.join, Windows yollarını Linux\'ta bile doğru birleştirir.',
              'aday = ntpath.join(klasor, komut + ".exe")',
              'if aday in diskteki: bulunanlar.append(aday)'],
    'why': 'Windows komutu ararken tam olarak bunu yapar: PATH klasörlerini sırayla dener. where hepsini listeler, ama çalışan her zaman ilk eşleşmedir; bu yüzden takma ad ya da eski bir kurulum öndeyse yanlış Python çalışır.' },

  # ---------- Kendin yaz ----------
  { 't': 'code', 'stage': 'Kendin yaz', 'id': 'kurulum-windows-4', 'diff': 1,
    'q': '<p><code>venv_python_yolu(proje, isletim)</code> fonksiyonunu yaz. <code>isletim</code> <code>"windows"</code>, <code>"macos"</code> ya da <code>"linux"</code> olabilir (büyük/küçük harf duyarsız). Proje kökündeki <code>.venv</code> ortamının Python yolunu döndür:</p><ul><li>Windows: <code>ntpath.join(proje, ".venv", "Scripts", "python.exe")</code></li><li>macOS/Linux: <code>posixpath.join(proje, ".venv", "bin", "python")</code></li><li>Başka bir değerde <code>ValueError</code> fırlat.</li></ul>',
    'start': 'def venv_python_yolu(proje, isletim):\n    pass\n',
    'sol': 'import ntpath, posixpath\n\ndef venv_python_yolu(proje, isletim):\n    isletim = isletim.lower()\n    if isletim == "windows":\n        return ntpath.join(proje, ".venv", "Scripts", "python.exe")\n    if isletim in ("macos", "linux"):\n        return posixpath.join(proje, ".venv", "bin", "python")\n    raise ValueError(f"Bilinmeyen işletim sistemi: {isletim}")\n',
    'tests': 'assert venv_python_yolu(r"C:\\dev\\rapor", "windows") == r"C:\\dev\\rapor\\.venv\\Scripts\\python.exe", "Windows\'ta Scripts klasörü ve python.exe"\nassert venv_python_yolu("/home/ayse/rapor", "linux") == "/home/ayse/rapor/.venv/bin/python", "Linux\'ta bin/python"\nassert venv_python_yolu("/Users/ayse/rapor", "macOS") == "/Users/ayse/rapor/.venv/bin/python", "macOS da bin kullanır; büyük/küçük harf duyarsız olmalı"\ntry:\n    venv_python_yolu("x", "amiga")\n    assert False, "Bilinmeyen sistemde ValueError fırlatmalısın"\nexcept ValueError:\n    pass\n',
    'hints': ['ntpath ve posixpath modüllerini içe aktar.', 'isletim.lower() ile karşılaştır; macos ve linux aynı kalıbı kullanır.'],
    'why': 'Windows ve POSIX venv düzenleri farklıdır (Scripts/python.exe ve bin/python). İki yol modülünü açıkça kullanmak, kodun hangi sistemde çalıştığından bağımsız doğru sonuç verir.' },
  { 't': 'code', 'stage': 'Kendin yaz', 'id': 'kurulum-windows-5', 'diff': 2,
    'q': '<p><code>python --version</code> çıktısını ayrıştıran <code>surum_ayristir(cikti)</code> fonksiyonunu yaz. Çıktı <code>"Python 3.12.4"</code> gibidir; sonunda boşluk/satır sonu olabilir, ön sürümlerde <code>"Python 3.13.0rc1"</code> gibi ekler bulunabilir.</p><ul><li><code>(3, 12, 4)</code> gibi üç tam sayılık demet döndür (ekleri yok say: 3.13.0rc1 → (3, 13, 0)).</li><li>Metin <code>Python</code> ile başlamıyorsa (ör. Store takma adının "Python was not found" mesajı) <code>None</code> döndür.</li></ul>',
    'start': 'import re\n\ndef surum_ayristir(cikti):\n    pass\n',
    'sol': 'import re\n\ndef surum_ayristir(cikti):\n    eslesme = re.match(r"Python (\\d+)\\.(\\d+)\\.(\\d+)", cikti.strip())\n    if not eslesme:\n        return None\n    return tuple(int(p) for p in eslesme.groups())\n',
    'tests': 'assert surum_ayristir("Python 3.12.4") == (3, 12, 4), "Temel durum: (3, 12, 4)"\nassert surum_ayristir("Python 3.9.18\\r\\n") == (3, 9, 18), "Windows satır sonu (\\\\r\\\\n) temizlenmeli"\nassert surum_ayristir("Python 3.13.0rc1") == (3, 13, 0), "Ön sürüm eki yok sayılmalı"\nassert surum_ayristir("Python was not found; run without arguments to install from the Microsoft Store") is None, "Store takma adı mesajı sürüm değildir: None"\nassert surum_ayristir("") is None, "Boş çıktı None"\nassert all(isinstance(x, int) for x in surum_ayristir("Python 3.11.9")), "Parçalar int olmalı"\n',
    'hints': ['Düzenli ifade (regex) ile üç sayı grubunu yakala: (\\d+)\\.(\\d+)\\.(\\d+)', 're.match eşleşmezse None döner; groups() metin verir, int\'e çevir.'],
    'why': 'Komut çıktısı insan için yazılmıştır; programda kullanmadan önce sağlam biçimde ayrıştırmak gerekir. re.match yalnızca baştan eşleştirdiği için "Python was not found" metni sayı içermese bile güvenle reddedilir.' },
  { 't': 'code', 'stage': 'Kendin yaz', 'id': 'kurulum-windows-6', 'diff': 2,
    'q': '<p><code>py --list</code> çıktısını ayrıştıran <code>py_list_ayristir(cikti)</code> fonksiyonunu yaz. Örnek çıktı:</p><pre> -V:3.12 *        Python 3.12 (64-bit)\n -V:3.11          Python 3.11 (64-bit)\n -V:3.9           Python 3.9 (64-bit)</pre><p>Sözlük döndür: <code>{"surumler": ["3.12", "3.11", "3.9"], "varsayilan": "3.12"}</code>. Sürümler çıktıdaki sırayla gelsin. Yıldız yoksa varsayılan <code>None</code> olsun. <code>-V:</code> ile başlamayan satırları atla.</p>',
    'start': 'def py_list_ayristir(cikti):\n    pass\n',
    'sol': 'def py_list_ayristir(cikti):\n    surumler = []\n    varsayilan = None\n    for satir in cikti.splitlines():\n        parcalar = satir.split()\n        if not parcalar or not parcalar[0].startswith("-V:"):\n            continue\n        surum = parcalar[0][3:]\n        surumler.append(surum)\n        if len(parcalar) > 1 and parcalar[1] == "*":\n            varsayilan = surum\n    return {"surumler": surumler, "varsayilan": varsayilan}\n',
    'tests': 'c = " -V:3.12 *        Python 3.12 (64-bit)\\n -V:3.11          Python 3.11 (64-bit)\\n -V:3.9           Python 3.9 (64-bit)\\n"\nassert py_list_ayristir(c) == {"surumler": ["3.12", "3.11", "3.9"], "varsayilan": "3.12"}, "Üç sürüm ve yıldızlı varsayılan"\nc2 = "Installed Pythons found by py Launcher for Windows\\n -V:3.13          Python 3.13 (64-bit)\\n -V:3.12 *        Python 3.12 (64-bit)\\n"\nassert py_list_ayristir(c2) == {"surumler": ["3.13", "3.12"], "varsayilan": "3.12"}, "Başlık satırı atlanmalı; yıldız ikinci satırda olabilir"\nassert py_list_ayristir(" -V:3.12          Python 3.12 (64-bit)") == {"surumler": ["3.12"], "varsayilan": None}, "Yıldız yoksa varsayılan None"\nassert py_list_ayristir("") == {"surumler": [], "varsayilan": None}, "Boş çıktı"\n',
    'hints': ['splitlines() ile satırlara, split() ile kelimelere ayır.', 'İlk kelime "-V:3.12" ise [3:] dilimi "3.12" verir; ikinci kelime "*" ise varsayılandır.'],
    'why': 'split() argümansız çağrılınca birden çok boşluğu tek ayırıcı sayar; hizalama için konmuş boşluklar sorun olmaz. Başlık satırları -V: ile başlamadığı için kolayca elenir.' },
  { 't': 'code', 'stage': 'Kendin yaz', 'id': 'kurulum-windows-7', 'diff': 2,
    'q': '<p>BT ekibinin sessiz kurulum komutunu inceleyen <code>kurulum_komutu_ayristir(komut)</code> fonksiyonunu yaz. Örnek:</p><pre>python-3.12.4-amd64.exe /quiet InstallAllUsers=0 PrependPath=1 TargetDir="C:\\Python 312"</pre><p><code>shlex.split(komut)</code> ile parçala: çift tırnak içindeki boşluklu değer tek parça kalır, tırnaklar atılır ve tırnak içindeki ters bölü korunur. Sözlük döndür:</p><ul><li><code>"dosya"</code>: ilk parça.</li><li><code>"bayraklar"</code>: <code>/</code> ile başlayan parçaların listesi.</li><li><code>"ayarlar"</code>: <code>ANAHTAR=DEGER</code> parçalarından sözlük (yalnız ilk <code>=</code> işaretinden böl).</li></ul>',
    'start': 'import shlex\n\ndef kurulum_komutu_ayristir(komut):\n    pass\n',
    'sol': 'import shlex\n\ndef kurulum_komutu_ayristir(komut):\n    parcalar = shlex.split(komut)\n    sonuc = {"dosya": parcalar[0], "bayraklar": [], "ayarlar": {}}\n    for p in parcalar[1:]:\n        if p.startswith("/"):\n            sonuc["bayraklar"].append(p)\n        elif "=" in p:\n            anahtar, deger = p.split("=", 1)\n            sonuc["ayarlar"][anahtar] = deger\n    return sonuc\n',
    'tests': 'k = \'python-3.12.4-amd64.exe /quiet InstallAllUsers=0 PrependPath=1 TargetDir="C:\\\\Python 312"\'\nr = kurulum_komutu_ayristir(k)\nassert r["dosya"] == "python-3.12.4-amd64.exe", "İlk parça yükleyici dosyası"\nassert r["bayraklar"] == ["/quiet"], "/ ile başlayanlar bayraktır"\nassert r["ayarlar"] == {"InstallAllUsers": "0", "PrependPath": "1", "TargetDir": "C:\\\\Python 312"}, "Tırnaklı değer boşluğuyla tek parça kalmalı; shlex tırnakları atar, tırnak içindeki ters bölüyü korur"\nr2 = kurulum_komutu_ayristir("python-3.13.0-amd64.exe /passive /log kurulum.log Include_test=0 X=a=b")\nassert r2["bayraklar"] == ["/passive", "/log"] and r2["ayarlar"] == {"Include_test": "0", "X": "a=b"}, "Birden çok bayrak; = içermeyen düz parça (kurulum.log) yok sayılır; yalnız ilk = işaretinden böl"\n',
    'hints': ['shlex.split tırnaklı değeri tek parça yapar: TargetDir="C:\\Python 312" → TargetDir=C:\\Python 312.', 'p.startswith("/") bayraktır; değilse "=" in p kontrolü ve p.split("=", 1).'],
    'why': 'Basit str.split() tırnak içindeki boşlukta bölünürdü. shlex kabuk kurallarına göre ayırır. Dikkat: POSIX modunda tırnak DIŞINDAKİ ters bölü kaçış sayılıp silinir; Windows yollarını komutlarda her zaman tırnakla yazmak bu yüzden iyi alışkanlıktır.' },

  # ---------- Hata avı ----------
  { 't': 'code', 'stage': 'Hata avı', 'kind': 'bug', 'id': 'kurulum-windows-8', 'diff': 2,
    'q': '<p>Hatayı bul ve düzelt. <code>scripts_eksik_mi(path_metni, ayirici)</code> fonksiyonu PATH\'te bir Python klasörü olup da yanındaki <code>Scripts</code> klasörü olmadığında <code>True</code> döndürmeli (pip tanınmıyor hatasının nedeni budur). Karşılaştırma büyük/küçük harf duyarsız olmalı ve sondaki ters bölü fark yaratmamalı. Kod Windows yollarında yanlış sonuç veriyor.</p>',
    'start': 'def scripts_eksik_mi(path_metni, ayirici):\n    klasorler = [k for k in path_metni.split(":") if k]\n    python_kokleri = [k for k in klasorler if k.lower().endswith("python312")]\n    for kok in python_kokleri:\n        if kok + "\\\\Scripts" not in klasorler:\n            return True\n    return False\n',
    'sol': 'def scripts_eksik_mi(path_metni, ayirici):\n    klasorler = [k.strip().rstrip("\\\\").lower() for k in path_metni.split(ayirici) if k.strip()]\n    python_kokleri = [k for k in klasorler if k.rsplit("\\\\", 1)[-1].startswith("python")]\n    for kok in python_kokleri:\n        if kok + "\\\\scripts" not in klasorler:\n            return True\n    return False\n',
    'tests': 'a = r"C:\\Windows;C:\\Python312\\;C:\\Python312\\Scripts" + "\\\\"\nassert scripts_eksik_mi(a, ";") is False, "Sonda ters bölü olsa da Scripts mevcut: False"\nb = r"C:\\Windows;C:\\Users\\ayse\\AppData\\Local\\Programs\\Python\\Python311"\nassert scripts_eksik_mi(b, ";") is True, "Python311 var ama Scripts yok: True (sürümü sabit yazma)"\nc = r"c:\\python312;C:\\PYTHON312\\SCRIPTS"\nassert scripts_eksik_mi(c, ";") is False, "Windows yolları büyük/küçük harf duyarsızdır"\nassert scripts_eksik_mi(r"C:\\Windows;C:\\Program Files\\Git\\cmd", ";") is False, "Python klasörü yoksa eksik de yoktur"\n',
    'hints': ['Üç sorun var: ayırıcı sabit ":" yazılmış (C: sürücü harfini böler), sürüm "python312" sabit, harf ve sondaki ters bölü normalleştirilmemiş.',
              'Her klasörü strip().rstrip("\\\\").lower() ile normalleştir; kök klasörü son parçası "python" ile başlayan klasör olarak tanı.'],
    'why': 'Windows yollarında ":" sürücü harfinin parçasıdır; PATH ayırıcısı ";"dir ve bu yüzden parametre olarak alınmalıdır. Windows yolları büyük/küçük harf duyarsızdır ve elle eklenen girdilerde sondaki ters bölü sık görülür; karşılaştırmadan önce normalleştirmek gerekir.' },
  { 't': 'code', 'stage': 'Hata avı', 'kind': 'bug', 'id': 'kurulum-windows-9', 'diff': 2,
    'q': '<p>Hatayı bul ve düzelt. <code>en_yeni_surum(surumler)</code> kurulu sürüm metinleri listesinden en yenisini döndürmeli; liste boşsa <code>None</code>. Kod 3.9 ile 3.12 arasında yanlış seçim yapıyor ve boş listede çöküyor.</p>',
    'start': 'def en_yeni_surum(surumler):\n    en_yeni = surumler[0]\n    for s in surumler:\n        if s > en_yeni:\n            en_yeni = s\n    return en_yeni\n',
    'sol': 'def en_yeni_surum(surumler):\n    if not surumler:\n        return None\n    return max(surumler, key=lambda s: tuple(int(p) for p in s.split(".")))\n',
    'tests': 'assert en_yeni_surum(["3.9.18", "3.12.4", "3.11.9"]) == "3.12.4", "3.12.4 en yenisi; metin karşılaştırması 3.9\'u seçer"\nassert en_yeni_surum(["3.10", "3.9"]) == "3.10", "3.10 > 3.9 (sayı olarak)"\nassert en_yeni_surum(["3.12.10", "3.12.9"]) == "3.12.10", "Yama numarası da sayı olarak karşılaştırılmalı"\nassert en_yeni_surum([]) is None, "Boş listede None dönmeli, IndexError değil"\n',
    'hints': ['"3.9" &gt; "3.12" metin olarak True\'dur; parçaları int\'e çevirip demet karşılaştır.', 'max(..., key=lambda s: tuple(int(p) for p in s.split("."))) ve önce boş liste kontrolü.'],
    'why': 'Sürüm numaraları metin değil sayı dizisidir. Demet anahtarı ile max hem 3.10/3.9 hem 3.12.10/3.12.9 durumlarını doğru çözer. Boş liste kontrolü olmadan surumler[0] IndexError verir.' },

  # ---------- Meydan okuma ----------
  { 't': 'code', 'stage': 'Meydan okuma', 'id': 'kurulum-windows-10', 'diff': 3,
    'q': '<p>Destek ekibi için <code>path_teshis(path_metni, ayirici, diskteki)</code> fonksiyonunu yaz. <code>diskteki</code>, var olan dosyaların tam yollarını içeren kümedir. Sözlük döndür:</p><ul><li><code>"calisan"</code>: PATH sırasına göre ilk bulunan <code>python.exe</code> tam yolu (yoksa <code>None</code>).</li><li><code>"store_tuzagi"</code>: çalışan yol <code>\\WindowsApps\\</code> içeriyorsa <code>True</code> (harf duyarsız).</li><li><code>"pip_var"</code>: herhangi bir klasörde <code>pip.exe</code> varsa <code>True</code>.</li><li><code>"bos_girdi"</code>: boş (ya da yalnız boşluk) girdi sayısı.</li><li><code>"tekrarlar"</code>: birden çok kez geçen klasörler; harf duyarsız ve sondaki ters bölü yok sayılarak karşılaştır; ilk görüldüğü biçimiyle (sondaki ters bölü atılmış), tekrarın fark edildiği sırayla listele.</li></ul><p>Diskteki dosya yollarını da harf duyarsız karşılaştır.</p>',
    'start': 'import ntpath\n\ndef path_teshis(path_metni, ayirici, diskteki):\n    pass\n',
    'sol': 'import ntpath\n\ndef path_teshis(path_metni, ayirici, diskteki):\n    disk = {d.lower() for d in diskteki}\n    sonuc = {"calisan": None, "store_tuzagi": False, "pip_var": False, "bos_girdi": 0, "tekrarlar": []}\n    gorulen = {}\n    for ham in path_metni.split(ayirici):\n        klasor = ham.strip().rstrip("\\\\")\n        if not klasor:\n            sonuc["bos_girdi"] += 1\n            continue\n        anahtar = klasor.lower()\n        if anahtar in gorulen:\n            if gorulen[anahtar] not in sonuc["tekrarlar"]:\n                sonuc["tekrarlar"].append(gorulen[anahtar])\n            continue\n        gorulen[anahtar] = klasor\n        py = ntpath.join(klasor, "python.exe")\n        if sonuc["calisan"] is None and py.lower() in disk:\n            sonuc["calisan"] = py\n        if ntpath.join(klasor, "pip.exe").lower() in disk:\n            sonuc["pip_var"] = True\n    if sonuc["calisan"]:\n        sonuc["store_tuzagi"] = "\\\\windowsapps\\\\" in sonuc["calisan"].lower()\n    return sonuc\n',
    'tests': 'p = r"C:\\Windows;C:\\Users\\ayse\\AppData\\Local\\Microsoft\\WindowsApps;;C:\\Python312\\; ;c:\\python312;C:\\Python312\\Scripts;C:\\WINDOWS" + "\\\\"\nd = {r"C:\\Users\\ayse\\AppData\\Local\\Microsoft\\WindowsApps\\python.exe", r"C:\\Python312\\python.exe", r"C:\\Python312\\Scripts\\pip.exe"}\nr = path_teshis(p, ";", d)\nassert r["calisan"] == r"C:\\Users\\ayse\\AppData\\Local\\Microsoft\\WindowsApps\\python.exe", "İlk eşleşme WindowsApps takma adı"\nassert r["store_tuzagi"] is True, "Çalışan yol WindowsApps içinde: Store tuzağı"\nassert r["pip_var"] is True, "Scripts klasöründe pip.exe var"\nassert r["bos_girdi"] == 2, "Bir boş ve bir yalnız boşluk girdi var: 2"\nassert r["tekrarlar"] == [r"C:\\Python312", r"C:\\Windows"], "c:\\\\python312 ve C:\\\\WINDOWS\\\\ tekrar sayılır; ilk görülen biçimle, fark edilme sırasıyla"\nr2 = path_teshis(r"C:\\Python312;C:\\Tools", ";", {r"c:\\python312\\PYTHON.EXE"})\nassert r2 == {"calisan": r"C:\\Python312\\python.exe", "store_tuzagi": False, "pip_var": False, "bos_girdi": 0, "tekrarlar": []}, "Disk karşılaştırması harf duyarsız; Store tuzağı yok"\nassert path_teshis("", ";", set())["calisan"] is None, "Boş PATH: çalışan yok"\n',
    'hints': ['Her girdiyi strip().rstrip("\\\\") ile normalleştir; karşılaştırma anahtarı için lower() kullan.', 'Görülen klasörleri {anahtar: ilk_biçim} sözlüğünde tut; tekrar edince ilk biçimi tekrarlar listesine (bir kez) ekle.', 'Diski de lower() ile bir kümeye çevir; calisan yalnızca ilk eşleşmede atanır.'],
    'why': 'Gerçek PATH\'ler yıllar içinde elle düzenlenir: boş girdiler, tekrarlar ve farklı yazımlar birikir. Windows dosya sistemi harf duyarsız olduğundan tüm karşılaştırmalar normalleştirilmiş anahtarla yapılır; ama kullanıcıya gösterilen değer ilk görülen biçimdir.' },

  # ---------- Mini proje ----------
  { 't': 'code', 'stage': 'Mini proje', 'id': 'kurulum-windows-11', 'diff': 3,
    'q': '<p>Anadolu Market destek kanalına gelen kurulum hatalarını sınıflandıran küçük bir araç yaz.</p><p><b>1)</b> <code>teshis(mesaj)</code>: hata metnine bakıp bir kod döndürsün (harf duyarsız, kontroller bu sırayla):</p><ul><li><code>"running scripts is disabled"</code> geçiyorsa → <code>"YURUTME_ILKESI"</code></li><li><code>"certificate_verify_failed"</code> → <code>"SSL"</code></li><li><code>"python was not found"</code> → <code>"STORE_TAKMA_AD"</code></li><li><code>"\'pip\' is not recognized"</code> → <code>"PIP_PATH"</code></li><li><code>"is not recognized"</code> ya da <code>"tanınmıyor"</code> → <code>"PATH"</code></li><li><code>"access is denied"</code> ya da <code>"permissionerror"</code> → <code>"IZIN"</code></li><li><code>"unicodeencodeerror"</code> → <code>"KODLAMA"</code></li><li>hiçbiri → <code>"BILINMIYOR"</code></li></ul><p><b>2)</b> <code>cozum(kod)</code>: koda karşılık kısa çözüm metni döndürsün; en az şu eşlemeler olsun: <code>"YURUTME_ILKESI"</code> için metin <code>Set-ExecutionPolicy</code> içermeli, <code>"PIP_PATH"</code> için <code>python -m pip</code>, <code>"STORE_TAKMA_AD"</code> için <code>App execution aliases</code>. Bilinmeyen kod için <code>"Hata metninin son satırını arat."</code></p><p><b>3)</b> <code>rapor(mesajlar)</code>: kod → adet sözlüğü döndürsün; en sık kod önce, eşitlikte koda göre alfabetik.</p>',
    'start': 'def teshis(mesaj):\n    pass\n\n\ndef cozum(kod):\n    pass\n\n\ndef rapor(mesajlar):\n    pass\n',
    'sol': 'KURALLAR = [\n    (("running scripts is disabled",), "YURUTME_ILKESI"),\n    (("certificate_verify_failed",), "SSL"),\n    (("python was not found",), "STORE_TAKMA_AD"),\n    (("\'pip\' is not recognized",), "PIP_PATH"),\n    (("is not recognized", "tanınmıyor"), "PATH"),\n    (("access is denied", "permissionerror"), "IZIN"),\n    (("unicodeencodeerror",), "KODLAMA"),\n]\n\nCOZUMLER = {\n    "YURUTME_ILKESI": "Set-ExecutionPolicy -Scope CurrentUser RemoteSigned çalıştır.",\n    "SSL": "Kurum sertifikasını pip config set global.cert ile tanıt.",\n    "STORE_TAKMA_AD": "App execution aliases ekranında python.exe takma adını kapat.",\n    "PIP_PATH": "pip yerine python -m pip kullan.",\n    "PATH": "Yükleyiciyi Modify ile çalıştırıp PATH\'e ekle ya da py kullan.",\n    "IZIN": "venv kullan, açık programları kapatıp tekrar dene.",\n    "KODLAMA": "PYTHONUTF8=1 ayarla, Windows Terminal kullan.",\n}\n\n\ndef teshis(mesaj):\n    kucuk = mesaj.lower()\n    for anahtarlar, kod in KURALLAR:\n        if any(a in kucuk for a in anahtarlar):\n            return kod\n    return "BILINMIYOR"\n\n\ndef cozum(kod):\n    return COZUMLER.get(kod, "Hata metninin son satırını arat.")\n\n\ndef rapor(mesajlar):\n    sayac = {}\n    for m in mesajlar:\n        k = teshis(m)\n        sayac[k] = sayac.get(k, 0) + 1\n    return dict(sorted(sayac.items(), key=lambda kv: (-kv[1], kv[0])))\n',
    'tests': 'assert teshis("File .venv\\\\Scripts\\\\Activate.ps1 cannot be loaded because running scripts is disabled on this system.") == "YURUTME_ILKESI", "Yürütme ilkesi"\nassert teshis("SSL: CERTIFICATE_VERIFY_FAILED certificate verify failed") == "SSL", "SSL hatası (harf duyarsız)"\nassert teshis("Python was not found; run without arguments to install from the Microsoft Store") == "STORE_TAKMA_AD", "Store takma adı"\nassert teshis("\'pip\' is not recognized as an internal or external command") == "PIP_PATH", "pip kontrolü genel PATH kontrolünden ÖNCE yapılmalı"\nassert teshis("\'python\' is not recognized as an internal or external command") == "PATH", "python tanınmıyor: PATH"\nassert teshis("python : \'python\' terimi bir cmdlet adı olarak tanınmıyor") == "PATH", "Türkçe PowerShell mesajı"\nassert teshis("ERROR: [WinError 5] Access is denied") == "IZIN", "Erişim reddedildi"\nassert teshis("UnicodeEncodeError: \'charmap\' codec can\'t encode") == "KODLAMA", "Kodlama"\nassert teshis("Segmentation fault") == "BILINMIYOR", "Bilinmeyen"\nassert "Set-ExecutionPolicy" in cozum("YURUTME_ILKESI"), "Yürütme ilkesi çözümü Set-ExecutionPolicy içermeli"\nassert "python -m pip" in cozum("PIP_PATH"), "pip çözümü python -m pip içermeli"\nassert "App execution aliases" in cozum("STORE_TAKMA_AD"), "Store çözümü"\nassert cozum("XYZ") == "Hata metninin son satırını arat.", "Bilinmeyen kod"\nr = rapor(["\'pip\' is not recognized", "Access is denied", "\'pip\' is not recognized", "bilinmeyen", "PermissionError: [Errno 13]"])\nassert r == {"IZIN": 2, "PIP_PATH": 2, "BILINMIYOR": 1}, "Adet çoktan aza, eşitlikte alfabetik: IZIN, PIP_PATH, BILINMIYOR"\nassert list(r) == ["IZIN", "PIP_PATH", "BILINMIYOR"], "Sözlük sırası da önemli"\n',
    'hints': ['Kuralları (anahtar_kelimeler, kod) çiftlerinden oluşan bir listede tut ve sırayla dene; ilk eşleşen kazanır.', 'pip kuralı genel "is not recognized" kuralından önce gelmeli, yoksa pip hatası PATH sayılır.', 'sorted(sayac.items(), key=lambda kv: (-kv[1], kv[0])) çoktan aza, eşitlikte alfabetik sıralar.'],
    'why': 'Kural tablosunu veri olarak tutmak, yeni bir hata türü eklemeyi tek satıra indirir ve sıralamanın önemini görünür kılar: özel kural (pip) genel kuraldan (is not recognized) önce gelmelidir. Bu yapı derste gördüğün belirti → neden → çözüm tablosunun koda dökülmüş hâlidir.' },
]

LESSON = {
  'id': 'kurulum-windows', 'lv': 'temel', 'mod': 'Başlangıç', 'min': 40,
  'title': 'Windows\'ta Python kurulumu',
  'sum': 'python.org yükleyicisinin her ekranını, Store takma adı tuzağını, py başlatıcısını, PATH\'i, PowerShell yürütme ilkesini ve en sık on bir kurulum hatasının teşhisini öğrenirsin.',
  'goals': ['python.org yükleyicisini doğru seçeneklerle kurup kurulumu üç komutla doğrulayabilirim.',
            'PATH\'in nasıl arandığını açıklar, where ve py --list çıktısından hangi Python\'ın çalışacağını söyleyebilirim.',
            'Store takma adı ve yürütme ilkesi hatalarını tanıyıp tek ayarla çözebilirim.',
            'py başlatıcısıyla birden çok sürümü yönetir, projeye özel venv oluşturabilirim.',
            'Sık kurulum hatalarını belirti → neden → çözüm mantığıyla teşhis edebilirim.'],
  'body': BODY, 'ex': EX,
  'faq': [
    {'q': 'Install Now mı Customize installation mı seçmeliyim?', 'a': 'Kendi bilgisayarında ve kullanıcı adın İngilizce karakterliyse Install Now (PATH kutusu işaretli) yeterlidir. Kullanıcı adında Türkçe karakter ya da boşluk varsa Customize ile C:\\Python312 gibi kısa bir yol seç.'},
    {'q': 'Store sürümü kötü mü?', 'a': 'Kötü değil; yönetici izni gerektirmez ve otomatik güncellenir. Ama py başlatıcısı gelmez ve bazı klasörlere yazma kısıtlıdır. Kurumsal projelerde python.org sürümü daha öngörülebilirdir.'},
    {'q': 'PATH\'e Python\'ı eklemezsem ne kaybederim?', 'a': 'python ve pip komutlarını doğrudan yazamazsın; ama py başlatıcısı PATH\'ten bağımsız çalıştığı için py ve py -m pip ile her şeyi yapabilirsin. Venv etkinken de PATH sorunu yaşamazsın.'},
    {'q': 'Python\'ı güncellemek için eskisini kaldırmam gerekir mi?', 'a': 'Aynı alt sürüm içinde (3.12.3 → 3.12.4) yükleyici üzerine kurar. Yeni alt sürüm (3.12 → 3.13) yan yana kurulur; eski projelerin venv\'leri eski sürüme bağlı kalır. Eskisini ancak hiçbir proje kullanmıyorsa kaldır.'},
    {'q': 'WSL kullanmalı mıyım?', 'a': 'Linux sunuculara dağıtım yapan ekiplerde WSL (Windows Subsystem for Linux) iyi bir seçenektir; içinde Ubuntu çalışır ve macOS/Linux dersindeki adımlar geçerli olur. Yalnızca öğrenmek için Windows\'a doğrudan kurmak yeterlidir.'},
  ],
  'mistakes': [
    {'bad': 'pip install pandas', 'good': 'python -m pip install pandas\n# ya da belirli sürüm için\npy -3.12 -m pip install pandas', 'why': 'Tek başına pip, PATH\'te ilk bulunan pip\'tir ve başka bir Python\'a ait olabilir. python -m pip paketi tam olarak o yorumlayıcıya kurar.'},
    {'bad': 'if platform.python_version() >= "3.10":\n    print("uygun")', 'good': 'import sys\nif sys.version_info >= (3, 10):\n    print("uygun")', 'why': 'Metin karşılaştırmasında "3.9" büyük çıkar. sys.version_info demet olarak sayı sayı karşılaştırılır.'},
    {'bad': 'klasorler = path_metni.split(":")', 'good': 'import os\nklasorler = [k for k in path_metni.split(os.pathsep) if k]', 'why': 'Windows\'ta PATH ayırıcısı ";" ve ":" sürücü harfinin (C:) parçasıdır. os.pathsep her sistemde doğru ayırıcıyı verir; boş girdileri de at.'},
    {'bad': 'yol = "C:\\Users\\ayse\\new_rapor.txt"', 'good': 'yol = r"C:\\Users\\ayse\\new_rapor.txt"\n# ya da\nyol = "C:/Users/ayse/new_rapor.txt"', 'why': 'Normal metinde \\n satır sonu, \\U unicode kaçışıdır; Windows yolu bozulur ya da SyntaxError verir. Ham metin (r"...") ya da düz bölü kullan.'},
  ],
}

if __name__ == '__main__':
    emit(LESSON, '/home/claude/py/v2/t1/kurulum-windows.js')
