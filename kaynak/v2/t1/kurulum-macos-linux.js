/* Kesit Python — v2/t1: kurulum-macos-linux */
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push(
{
  id: 'kurulum-macos-linux',
  lv: 'temel',
  mod: 'Başlangıç',
  min: 40,
  title: 'macOS ve Linux\'ta Python kurulumu',
  sum: 'Sistem Python\'ına dokunmadan Homebrew, apt, pyenv, deadsnakes ve uv ile Python kurar; PEP 668 hatasını venv ve pipx ile çözer, doğru yolu seçmeyi öğrenirsin.',
  goals: [
    'macOS\'ta Xcode CLT ve Homebrew ile Python kurup Apple Silicon/Intel farkını açıklayabilirim.',
    'Ubuntu/Debian ve Fedora\'da Python, venv ve pip paketlerini doğru komutlarla kurabilirim.',
    'externally-managed-environment hatasının nedenini açıklar, venv ve pipx ile çözebilirim.',
    'pyenv ve uv ile birden çok sürümü yönetir, duruma göre doğru kurulum yolunu seçebilirim.',
    'which -a, shebang ve os-release bilgisinden hangi Python\'ın çalıştığını teşhis edebilirim.'
  ],
  body: `
<h2>Unix dünyasında Python zaten var... ya da var gibi görünür</h2>
<p>Windows dersinde Python'ın sıfırdan kurulduğunu gördün. macOS ve Linux'ta durum farklıdır: işletim sistemi kendi işleri için bir Python'a sahiptir ya da ona benzeyen bir yer tutucu koyar. Bu ders, <b>sistemin Python'ına dokunmadan</b> kendi Python'ını nasıl kuracağını, birden çok sürümü nasıl yöneteceğini ve Linux'ta bir gün mutlaka göreceğin <code>externally-managed-environment</code> hatasını anlatır. Kurulumun kısa hâlini <b>Kurulum ve araçlar</b> dersinde, sanal ortamın ayrıntısını <b>Sanal ortam ve paket yönetimi</b> dersinde bulursun; burada işletim sistemine özgü kısımlara odaklanıyoruz.</p>
<p>Altın kural: <b>sistem Python'ı işletim sistemine aittir</b>. Ubuntu'nun paket yöneticisi, ağ araçları ve masaüstü bileşenleri <code>/usr/bin/python3</code>'e güvenir. Oraya <code>sudo pip install</code> ile paket eklemek ya da <code>/usr/bin/python3</code> bağlantısını başka sürüme çevirmek sistemi bozabilir. Senin projelerin her zaman ya ayrı bir kurulumda ya da bir sanal ortamda yaşar.</p>

<h2>macOS</h2>
<h3>Sistem python3 ve Xcode Command Line Tools</h3>
<p>Yeni bir Mac'te Terminal'e <code>python3</code> yazınca çoğu zaman bir pencere açılır: "python3 komutu geliştirici araçlarını gerektiriyor". <code>/usr/bin/python3</code> aslında bir yer tutucudur; gerçek Python, Apple'ın <b>Xcode Command Line Tools</b> (CLT) paketiyle gelir ve genellikle eski bir sürümdür. CLT yine de gereklidir: derleyici, <code>git</code> ve Homebrew bunlara ihtiyaç duyar.</p>
<pre class="code">xcode-select --install        # Command Line Tools'u kurar
xcode-select -p               # kurulu mu? /Library/Developer/CommandLineTools
python3 --version             # sistem python3 (eski olabilir)
which -a python3              # PATH'te bulunan tüm python3'ler, sırayla</pre>
<p>macOS 12.3'ten beri <code>python</code> (sürümsüz) komutu yoktur; yalnız <code>python3</code> vardır. Bir eğitimde <code>python</code> yazıyorsa sen <code>python3</code> yaz. Sanal ortam etkinken ise <code>python</code> komutu da çalışır, çünkü venv kendi <code>bin/python</code> bağlantısını getirir.</p>

<h3>Homebrew ile kurulum</h3>
<p><b>Homebrew</b>, macOS'un fiilî paket yöneticisidir. brew.sh'deki tek satırlık betikle kurulur. Kurulum sonunda ekrana yazılan "Next steps" komutlarını mutlaka çalıştır; yoksa <code>brew: command not found</code> alırsın.</p>
<pre class="code">/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' &gt;&gt; ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
brew install python@3.12
python3.12 --version
python3.12 -m venv .venv &amp;&amp; source .venv/bin/activate</pre>
<p>Apple Silicon (M serisi) Mac'lerde Homebrew <code>/opt/homebrew</code>'a, Intel Mac'lerde <code>/usr/local</code>'a kurulur. <code>brew install python@3.12</code> sana <code>python3.12</code> komutunu verir; sürümsüz <code>python3</code> ise Homebrew'un o anki varsayılan Python'ını gösterebilir. Projelerde sürümlü komutu kullanmak sürprizleri önler. Homebrew'un Python'ı da "dışarıdan yönetilen" olarak işaretlidir; global <code>pip install</code> yerine venv kullanman beklenir.</p>
<pre class="py">import posixpath

def homebrew_onegi(makine):
    return "/opt/homebrew" if makine == "arm64" else "/usr/local"

for makine in ["arm64", "x86_64"]:
    onek = homebrew_onegi(makine)
    print(f"{makine:7} -&gt; {posixpath.join(onek, 'bin', 'python3.12')}")</pre>
<p>Gerçek bilgisayarda <code>platform.machine()</code> bu değeri verir. python.org'un macOS yükleyicisini tercih edersen, kurulumdan sonra <code>/Applications/Python 3.12/</code> klasöründeki <b>Install Certificates.command</b> dosyasına çift tıkla; yoksa ilk <code>pip install</code> denemende SSL sertifika hatası alabilirsin.</p>

<h3>pyenv: sürüm yönetimi</h3>
<p>Bir projen 3.11, diğeri 3.12 istiyorsa <b>pyenv</b> her sürümü kaynak koddan derleyip kullanıcı klasörüne kurar ve klasöre göre otomatik geçiş yapar. Bunu PATH'in başına koyduğu <b>shim</b> adlı küçük betiklerle yapar: <code>python</code> yazınca önce shim çalışır, hangi sürümün istendiğine bakar ve onu başlatır.</p>
<pre class="code">brew install pyenv                          # Linux'ta: curl https://pyenv.run | bash
echo 'export PYENV_ROOT="$HOME/.pyenv"' &gt;&gt; ~/.zshrc
echo '[[ -d $PYENV_ROOT/bin ]] &amp;&amp; export PATH="$PYENV_ROOT/bin:$PATH"' &gt;&gt; ~/.zshrc
echo 'eval "$(pyenv init - zsh)"' &gt;&gt; ~/.zshrc
exec "$SHELL"                               # kabuğu yeniden başlat
pyenv install 3.12.4
pyenv global 3.12.4                         # varsayılan sürüm (~/.pyenv/version)
cd anadolu-rapor &amp;&amp; pyenv local 3.11.9     # bu klasöre özel (.python-version dosyası)
pyenv versions</pre>
<p>pyenv sürümü şu sırayla seçer: <code>PYENV_VERSION</code> ortam değişkeni → bulunduğun klasörde (ya da üst klasörlerde) <code>.python-version</code> dosyası → <code>~/.pyenv/version</code> (global) → sistem Python'ı. Bu sıra bir "ilk dolu olan kazanır" zinciridir:</p>
<pre class="py">def pyenv_secimi(ortam_degiskeni, yerel_dosya, global_dosya):
    adaylar = [
        ("PYENV_VERSION", ortam_degiskeni),
        (".python-version", yerel_dosya),
        ("global", global_dosya),
    ]
    for kaynak, deger in adaylar:
        if deger and deger.strip():
            return deger.strip(), kaynak
    return "system", "sistem"

print(pyenv_secimi(None, "3.11.9\\n", "3.12.4"))
print(pyenv_secimi("3.13.0", "3.11.9", "3.12.4"))
print(pyenv_secimi("", None, None))</pre>

<h2>Linux</h2>
<h3>Ubuntu / Debian</h3>
<p>Ubuntu'da <code>python3</code> hemen her zaman kuruludur (Ubuntu 24.04'te 3.12). Ama sanal ortam ve pip modülleri <b>ayrı paketlerdir</b>; bu yüzden ilk iş:</p>
<pre class="code">sudo apt update
sudo apt install python3 python3-venv python3-pip
python3 --version
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt</pre>
<p><code>python3-venv</code> kurulu değilse <code>python3 -m venv</code> "ensurepip is not available" hatası verir. <code>python</code> komutunu istersen <code>sudo apt install python-is-python3</code> paketi bir bağlantı ekler.</p>
<h3>Fedora / RHEL</h3>
<pre class="code">sudo dnf install python3 python3-pip       # venv modülü python3 ile gelir
python3 -m venv .venv &amp;&amp; source .venv/bin/activate</pre>

<h3>externally-managed-environment (PEP 668)</h3>
<p>Ubuntu 23.04, Debian 12 ve sonrasında (ayrıca Arch ve Homebrew'da) sistem Python'ına <code>pip install</code> yapınca şu hatayı görürsün:</p>
<pre class="out">error: externally-managed-environment

× This environment is externally managed
╰─&gt; To install Python packages system-wide, try apt install
    python3-xyz, where xyz is the package you are trying to install.</pre>
<p>Bu bir hata değil, bir korumadır. <b>PEP 668</b> ile dağıtımlar, Python'ın standart kütüphane klasörüne <code>EXTERNALLY-MANAGED</code> adında bir işaret dosyası koyar; pip bu dosyayı görünce global kurulumu reddeder. Böylece pip ile apt aynı dosyaların üzerine yazıp birbirini bozmaz. Doğru çözümler:</p>
<div class="tbl-wrap"><table>
<tr><th>İhtiyacın</th><th>Çözüm</th><th>Komut</th></tr>
<tr><td>Bir proje için kütüphane</td><td>Sanal ortam</td><td><code>python3 -m venv .venv; source .venv/bin/activate; pip install pandas</code></td></tr>
<tr><td>Her yerden çalışan bir komut satırı aracı (ruff, black, httpie)</td><td>pipx: her aracı kendi gizli venv'ine kurar</td><td><code>sudo apt install pipx; pipx ensurepath; pipx install ruff</code></td></tr>
<tr><td>Dağıtımın paketlediği bir kütüphane</td><td>apt</td><td><code>sudo apt install python3-requests</code></td></tr>
<tr><td>"Ne olursa olsun kur"</td><td><code>--break-system-packages</code></td><td>Kullanma: adındaki uyarı gerçektir</td></tr>
</table></div>
<pre class="py">import sysconfig, pathlib, sys

stdlib = pathlib.Path(sysconfig.get_path("stdlib"))
isaret = stdlib / "EXTERNALLY-MANAGED"
print("Standart kütüphane:", stdlib)
print("PEP 668 işareti var mı:", isaret.exists())
print("Sanal ortam mı:", sys.prefix != sys.base_prefix)
if sys.prefix != sys.base_prefix:
    print("venv içinde pip serbest; işaret dosyası venv'e uygulanmaz.")</pre>

<h3>deadsnakes PPA: Ubuntu'da daha yeni Python</h3>
<p>Ubuntu LTS sürümleri Python'ı sabit tutar (22.04'te 3.10). Daha yenisi gerekiyorsa topluluğun <b>deadsnakes</b> deposu ek sürümleri <b>yan yana</b> kurar:</p>
<pre class="code">sudo add-apt-repository ppa:deadsnakes/ppa
sudo apt update
sudo apt install python3.13 python3.13-venv
python3.13 -m venv .venv</pre>
<div class="warn"><b>/usr/bin/python3'ü değiştirme</b>update-alternatives ya da elle bağlantıyla <code>python3</code>'ü yeni sürüme çevirmek apt, ağ yöneticisi ve terminal gibi sistem araçlarını bozabilir. Yeni sürümü her zaman sürümlü adıyla (<code>python3.13</code>) ve bir venv içinde kullan.</div>

<h2>uv: tek araçla Python ve ortam</h2>
<p><b>uv</b>, Rust ile yazılmış, çok hızlı bir Python paket ve proje yöneticisidir. Python'ın kendisini de indirip kurabildiği için pyenv, venv, pip ve pipx'in işini tek araçta toplar ve üç işletim sisteminde aynı komutlarla çalışır.</p>
<pre class="code">curl -LsSf https://astral.sh/uv/install.sh | sh     # macOS/Linux (ya da: brew install uv)
uv python install 3.12                               # Python 3.12'yi indir
uv python list                                       # bilinen/kurulu sürümler
uv venv --python 3.12                                # .venv oluştur
source .venv/bin/activate
uv pip install pandas                                # pip ile aynı arayüz, çok daha hızlı
uv tool install ruff                                 # pipx benzeri global araç
uv run betik.py                                      # ortamı hazırlayıp betiği çalıştır</pre>

<h2>Hangi yolu ne zaman seçmeli?</h2>
<div class="tbl-wrap"><table>
<tr><th>Durum</th><th>Önerilen yol</th><th>Neden</th></tr>
<tr><td>Mac'te öğrenmeye başlıyorum</td><td>python.org yükleyicisi ya da Homebrew</td><td>Basit, belgelenmiş</td></tr>
<tr><td>Mac/Linux'ta birden çok sürümle çalışıyorum</td><td>uv ya da pyenv</td><td>Klasöre göre sürüm, sisteme dokunmaz</td></tr>
<tr><td>Ubuntu sunucuda üretim servisi</td><td>apt'nin python3'ü + venv</td><td>Güvenlik güncellemelerini dağıtım yapar</td></tr>
<tr><td>Ubuntu LTS'de daha yeni sürüm lazım</td><td>deadsnakes ya da uv</td><td>Sistem Python'ı yerinde kalır</td></tr>
<tr><td>ruff, black gibi araçları her yerde kullanmak</td><td>pipx ya da <code>uv tool</code></td><td>Her araç izole, PEP 668 ile uyumlu</td></tr>
<tr><td>Ekip hızlı ve tekrarlanabilir kurulum istiyor</td><td>uv (+ uv.lock)</td><td>Tek komut, kilit dosyası</td></tr>
<tr><td>Uygulamayı konteynerde çalıştıracağım</td><td>Resmî <code>python:3.12-slim</code> imajı</td><td>Ortam imajla birlikte gelir</td></tr>
</table></div>

<h2>Hangi python3 çalışıyor?</h2>
<p>Unix'te PATH klasörleri <b>iki nokta</b> (<code>:</code>) ile ayrılır ve kabuk, Windows'taki gibi soldan sağa ilk eşleşmeyi çalıştırır. <code>which -a python3</code> hepsini, <code>type python3</code> çalışacak olanı gösterir. Kabuk bulduğu yolu önbelleğe alır; PATH'i değiştirdikten sonra garip davranış görürsen <code>hash -r</code> önbelleği temizler.</p>
<pre class="py">import posixpath

path_metni = "/home/ayse/.pyenv/shims:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin"
diskte = {"/opt/homebrew/bin/python3", "/usr/bin/python3", "/home/ayse/.pyenv/shims/python3"}

eslesmeler = [posixpath.join(k, "python3") for k in path_metni.split(":")
              if posixpath.join(k, "python3") in diskte]
print("which -a python3:")
for yol in eslesmeler:
    print("  ", yol)
print("Çalışacak olan:", eslesmeler[0])</pre>

<h2>Belirti → neden → çözüm</h2>
<div class="tbl-wrap"><table>
<tr><th>Belirti</th><th>Neden</th><th>Çözüm</th></tr>
<tr><td><code>python: command not found</code></td><td>Sistemde yalnız <code>python3</code> var</td><td><code>python3</code> yaz; Ubuntu'da <code>python-is-python3</code>; venv içinde <code>python</code> zaten var</td></tr>
<tr><td><code>error: externally-managed-environment</code></td><td>PEP 668 koruması</td><td>venv; araçlar için pipx / <code>uv tool</code></td></tr>
<tr><td><code>ensurepip is not available</code></td><td><code>python3-venv</code> paketi eksik</td><td><code>sudo apt install python3-venv</code> (ya da <code>python3.12-venv</code>)</td></tr>
<tr><td><code>No module named pip</code></td><td>pip paketi kurulmamış</td><td><code>sudo apt install python3-pip</code> ya da venv içinde çalış</td></tr>
<tr><td><code>xcrun: error: invalid active developer path</code></td><td>macOS güncellemesi sonrası CLT kayıp</td><td><code>xcode-select --install</code></td></tr>
<tr><td><code>brew: command not found</code> (kurulumdan hemen sonra)</td><td>"Next steps" adımı atlandı; <code>/opt/homebrew/bin</code> PATH'te yok</td><td><code>brew shellenv</code> satırını <code>~/.zprofile</code>'a ekle</td></tr>
<tr><td>macOS'ta <code>SSL: CERTIFICATE_VERIFY_FAILED</code></td><td>python.org kurulumunun sertifika adımı yapılmadı</td><td><code>Install Certificates.command</code> çalıştır</td></tr>
<tr><td><code>pyenv install</code> sonrası <code>No module named '_ssl'</code> ya da <code>'_sqlite3'</code></td><td>Derleme bağımlılıkları eksikti</td><td>libssl-dev, libsqlite3-dev, zlib1g-dev, libffi-dev vb. kur, sürümü yeniden derle</td></tr>
<tr><td><code>pyenv local</code> çalışmıyor, eski sürüm geliyor</td><td>Kabuk başlangıç dosyasına <code>pyenv init</code> eklenmemiş</td><td><code>~/.zshrc</code>/<code>~/.bashrc</code> satırlarını ekle, <code>exec "$SHELL"</code></td></tr>
<tr><td><code>Permission denied</code> (pip install)</td><td>Sistem klasörüne yazmaya çalışıyorsun</td><td>sudo kullanma; venv içinde kur</td></tr>
<tr><td><code>./betik.py: Permission denied</code></td><td>Dosya çalıştırılabilir değil</td><td><code>chmod +x betik.py</code> ve ilk satıra <code>#!/usr/bin/env python3</code></td></tr>
</table></div>

<div class="note"><b>Gerçek işte</b>Anadolu Lojistik'in rota raporu her gece bir Ubuntu sunucuda çalışıyor. Ekip sunucuya <code>apt</code> ile <code>python3</code> ve <code>python3-venv</code> kurmuş, uygulamayı <code>/opt/rota-rapor/.venv</code> içine yerleştirmiş ve systemd servisinde <code>ExecStart=/opt/rota-rapor/.venv/bin/python -m rota_rapor</code> yazmış. Venv'in Python'ını tam yoluyla çağırmak, etkinleştirmeye (<code>source</code>) gerek bırakmaz ve "sunucuda hangi Python çalışıyor" sorusunu ortadan kaldırır. Geliştiriciler ise Mac'lerinde aynı sürümü <code>uv python install 3.12</code> ile kuruyor.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Shebang ve çalıştırılabilir betikler</h3>
<p>Unix'te bir betiğin ilk satırı <code>#!</code> ile başlıyorsa (<b>shebang</b>), çekirdek o satırdaki programı yorumlayıcı olarak kullanır. <code>#!/usr/bin/env python3</code>, PATH'teki ilk <code>python3</code>'ü bulur; etkin venv'e ve pyenv'e uyum sağlar. <code>#!/usr/bin/python3</code> ise hep sistem Python'ını çağırır. Venv içindeki bir betik için en sağlamı venv'in Python'ını tam yoluyla yazmaktır.</p>
<pre class="py">import shlex, posixpath

def yorumlayici(ilk_satir):
    if not ilk_satir.startswith("#!"):
        return None
    parcalar = shlex.split(ilk_satir[2:])
    if posixpath.basename(parcalar[0]) == "env":
        return next(p for p in parcalar[1:] if not p.startswith("-"))
    return parcalar[0]

for satir in ["#!/usr/bin/env python3", "#!/usr/bin/python3.12 -u", "#!/usr/bin/env -S python3 -X utf8", "print('merhaba')"]:
    print(f"{satir!r:40} -&gt; {yorumlayici(satir)}")</pre>
<h3>Kabuk başlangıç dosyaları</h3>
<p>macOS varsayılan olarak <b>zsh</b> kullanır: oturum açılışında <code>~/.zprofile</code>, her yeni terminalde <code>~/.zshrc</code> okunur. Ubuntu <b>bash</b> kullanır: <code>~/.bashrc</code>. PATH'e eklediğin satırı yanlış dosyaya yazarsan "bir terminalde çalışıyor, ötekinde çalışmıyor" durumu oluşur. Değişiklikten sonra <code>source ~/.zshrc</code> ya da yeni terminal.</p>
<h3>pip3 mü, python3 -m pip mi?</h3>
<p><code>pip3</code>, PATH'te ilk bulunan pip'tir ve başka bir Python'a ait olabilir; Homebrew, pyenv ve sistem Python'ı bir arada olduğunda bu sık olur. <code>python3.12 -m pip</code> ise paketin hangi yorumlayıcıya gideceğini kesinleştirir. Venv etkinken <code>pip</code> güvenlidir çünkü venv'in <code>bin</code> klasörü PATH'in en başına eklenmiştir.</p>
</section>
`,
  ex: [
    {
      t: 'mc',
      stage: 'Isınma',
      q: 'Ubuntu 24.04\'te <code>pip install pandas</code> yazınca <code>error: externally-managed-environment</code> alıyorsun. Bir analiz projesi için en doğru hareket hangisi?',
      o: [
        '<code>sudo pip install pandas</code> ile yönetici olarak yeniden denemek',
        'Komutun sonuna <code>--break-system-packages</code> ekleyip kurulumu zorlamak',
        'Proje klasöründe <code>python3 -m venv .venv</code> kurup etkinleştirdikten sonra kurmak',
        '<code>/usr/bin/python3</code> bağlantısını başka bir Python sürümüne yönlendirmek'
      ],
      a: 2,
      why: 'PEP 668 koruması, apt\'nin yönettiği sistem Python\'ını pip\'in bozmasını engeller. Venv bu korumanın dışındadır ve projeye özeldir. sudo ve --break-system-packages korumayı deler; /usr/bin/python3\'ü değiştirmek sistem araçlarını bozabilir.'
    },
    {
      t: 'mc',
      stage: 'Isınma',
      q: 'M2 işlemcili bir Mac\'te Homebrew ile <code>brew install python@3.12</code> yaptın. Python 3.12 yorumlayıcısı büyük olasılıkla nerededir?',
      o: ['<code>/usr/bin/python3.12</code>', '<code>/usr/local/bin/python3.12</code>', '<code>/opt/homebrew/bin/python3.12</code>', '<code>~/Library/Python/3.12/python</code>'],
      a: 2,
      why: 'Apple Silicon Mac\'lerde Homebrew /opt/homebrew önekini, Intel Mac\'lerde /usr/local önekini kullanır. /usr/bin Apple\'ın sistem klasörüdür ve Homebrew oraya yazmaz.'
    },
    {
      t: 'mc',
      stage: 'Isınma',
      q: 'ruff kod biçimlendiricisini her projede, hiçbir venv etkin değilken de komut olarak kullanmak istiyorsun. Linux\'ta en uygun araç hangisi?',
      o: [
        '<code>pipx install ruff</code> ya da <code>uv tool install ruff</code>',
        '<code>sudo pip install ruff</code> ile tüm kullanıcılara kurmak',
        'Her projenin venv\'ine ayrı ayrı kurup PATH\'e eklemek',
        '<code>apt install python3-venv</code> kurup ruff\'ı oradan çağırmak'
      ],
      a: 0,
      why: 'pipx her komut satırı aracını kendi gizli venv\'ine kurar ve yalnızca komutu ~/.local/bin\'e bağlar; PEP 668 ile çatışmaz, araçların bağımlılıkları birbirine karışmaz. sudo pip sistem Python\'ını kirletir.'
    },
    {
      t: 'predict',
      stage: 'Kodu oku',
      q: '/etc/os-release benzeri bir metni ayrıştıran bu kod ne yazdırır?',
      code: 'metin = \'NAME="Ubuntu"\\nVERSION_ID="24.04"\\nID=ubuntu\'\nbilgi = {}\nfor satir in metin.splitlines():\n    anahtar, deger = satir.split("=", 1)\n    bilgi[anahtar] = deger.strip(\'"\')\nprint(bilgi["ID"], bilgi["VERSION_ID"], len(bilgi))\n',
      o: ['ubuntu "24.04" 3', 'ubuntu 24.04 3', 'Ubuntu 24.04 3', 'ubuntu 24.04 2'],
      a: 1,
      why: 'strip(\'"\') değerin başındaki ve sonundaki çift tırnakları atar; tırnaksız ID değeri olduğu gibi kalır. Üç satır üç anahtar üretir. NAME "Ubuntu", ID ise küçük harfli "ubuntu"dur; programlar ID\'ye bakar.'
    },
    {
      t: 'predict',
      stage: 'Kodu oku',
      q: 'Bu kod <code>which -a python3</code> komutunu taklit ediyor. Ne yazdırır?',
      code: 'yollar = "/opt/homebrew/bin:/usr/local/bin:/usr/bin".split(":")\ndiskte = {"/usr/bin/python3", "/opt/homebrew/bin/python3", "/usr/local/bin/pip3"}\nbulunan = [y + "/python3" for y in yollar if y + "/python3" in diskte]\nprint(bulunan[0])\nprint(len(bulunan))\n',
      o: ['/usr/bin/python3\n2', '/opt/homebrew/bin/python3\n3', '/opt/homebrew/bin/python3\n2', '/usr/local/bin/python3\n2'],
      a: 2,
      why: 'Liste PATH sırasıyla kurulur: önce /opt/homebrew/bin, sonra /usr/local/bin (orada yalnız pip3 var), sonra /usr/bin. İki python3 bulunur ve çalışacak olan ilkidir. Kümenin kendi sırası sonucu etkilemez.'
    },
    {
      t: 'predict',
      stage: 'Kodu oku',
      q: 'pyenv\'in sürüm seçme mantığını taklit eden bu kod ne yazdırır?',
      code: 'def surum_sec(ortam, yerel, genel):\n    return ortam or yerel or genel or "system"\n\nprint(surum_sec(None, "3.11.9", "3.12.4"))\nprint(surum_sec("", None, None))\n',
      o: ['3.12.4\nsystem', '3.11.9\nsystem', '3.11.9\n', 'None\nsystem'],
      a: 1,
      why: 'or zinciri ilk "doğru sayılan" değeri döndürür. None ve boş metin yanlış sayılır; ilk çağrıda yerel dosya (3.11.9) global\'den önce gelir. İkinci çağrıda hepsi boş olduğu için "system" döner.'
    },
    {
      t: 'order',
      stage: 'Kodu oku',
      q: '<p>Yeni bir Ubuntu sunucuda projeyi hazırlayan komut zincirini (CI ve Dockerfile\'larda böyle tek satır yazılır) üreten betiği sırala. Her komut bir öncekine bağlıdır.</p>',
      lines: [
        'adimlar = ["sudo apt update"]',
        'adimlar.append("sudo apt install -y python3 python3-venv python3-pip")',
        'adimlar.append("python3 -m venv .venv")',
        'adimlar.append("source .venv/bin/activate")',
        'adimlar.append("pip install -r requirements.txt")',
        'print(" && ".join(adimlar))'
      ],
      expect: 'sudo apt update && sudo apt install -y python3 python3-venv python3-pip && python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt\n',
      hint: 'Paket listesi güncellenmeden apt kurulum yapamaz; python3-venv olmadan venv oluşmaz.',
      why: 'apt update paket listesini yeniler, ardından python3-venv kurulur; venv oluşturulur ve etkinleştirilir; pip en son çalışır ki paketler venv\'e gitsin. && zinciri bir adım başarısız olursa sonrakileri çalıştırmaz.'
    },
    {
      t: 'code',
      stage: 'Rehberli',
      id: 'kurulum-macos-linux-1',
      diff: 1,
      q: '<p>Linux\'ta dağıtım bilgisi <code>/etc/os-release</code> dosyasındadır. <code>os_release_oku(metin)</code> fonksiyonunu yaz: her <code>ANAHTAR=DEGER</code> satırını sözlüğe koysun.</p><ul><li>Boş satırları ve <code>#</code> ile başlayan yorumları atla.</li><li>Yalnız <b>ilk</b> <code>=</code> işaretinden böl (değerde <code>=</code> olabilir).</li><li>Değerin etrafındaki çift ya da tek tırnakları at.</li></ul>',
      guide: [
        'Boş bir sözlük oluştur.',
        'metin.splitlines() ile satırlarda dön; satırı strip() ile temizle.',
        'Satır boşsa ya da "#" ile başlıyorsa continue.',
        'split("=", 1) ile anahtar ve değeri ayır; değeri strip(\'"\\\'\') ile tırnaklardan arındır.',
        'Sözlüğü döndür.'
      ],
      example: 'ayarlar = "renk=mavi\\n# yorum\\n\\nbaslik=\'Anadolu Market\'"\nsonuc = {}\nfor satir in ayarlar.splitlines():\n    satir = satir.strip()\n    if not satir or satir.startswith("#"):\n        continue\n    k, v = satir.split("=", 1)\n    sonuc[k] = v.strip("\'\\"")\nprint(sonuc)\n',
      start: 'def os_release_oku(metin):\n    bilgi = {}\n    # TODO: satırlarda dön, boş ve yorum satırlarını atla\n    # TODO: yalnız ilk "=" işaretinden böl\n    # TODO: değerin tırnaklarını atıp sözlüğe koy\n    return bilgi\n',
      sol: 'def os_release_oku(metin):\n    bilgi = {}\n    for satir in metin.splitlines():\n        satir = satir.strip()\n        if not satir or satir.startswith("#"):\n            continue\n        anahtar, deger = satir.split("=", 1)\n        bilgi[anahtar] = deger.strip("\\"\'")\n    return bilgi\n',
      tests: 'm = """PRETTY_NAME="Ubuntu 24.04.1 LTS"\nNAME="Ubuntu"\nVERSION_ID="24.04"\n# yorum satırı\n\nID=ubuntu\nID_LIKE=debian\nHOME_URL="https://www.ubuntu.com/?ref=os"\n"""\nb = os_release_oku(m)\nassert b["PRETTY_NAME"] == "Ubuntu 24.04.1 LTS", "Çift tırnaklar atılmalı, içteki boşluklar kalmalı"\nassert b["ID"] == "ubuntu" and b["ID_LIKE"] == "debian", "Tırnaksız değerler olduğu gibi kalır"\nassert b["HOME_URL"] == "https://www.ubuntu.com/?ref=os", "Değerdeki = işareti korunmalı: split(\\"=\\", 1)"\nassert len(b) == 6, "Yorum ve boş satır sözlüğe girmemeli: 6 anahtar"\nassert os_release_oku("NAME=\'Fedora Linux\'")["NAME"] == "Fedora Linux", "Tek tırnaklar da atılmalı"\nassert os_release_oku("") == {}, "Boş metin boş sözlük"\n',
      hints: ['Satırı temizleyip boş/yorum kontrolünü en başta yap.', 'anahtar, deger = satir.split("=", 1)', 'bilgi[anahtar] = deger.strip("\\"\'")  # iki tırnak türünü birden atar'],
      why: 'os-release biçimi basit görünse de değerler tırnaklı ya da tırnaksız, URL\'ler = içerebilir. maxsplit=1 ve strip ile iki tırnak türünü atmak bu farklılıkları tek kalıpta çözer.'
    },
    {
      t: 'code',
      stage: 'Rehberli',
      id: 'kurulum-macos-linux-2',
      diff: 2,
      q: '<p>Kurulum betiği, dağıtıma göre doğru komutu önermeli. <code>kurulum_komutu(bilgi)</code> fonksiyonunu yaz; <code>bilgi</code> os-release sözlüğüdür (<code>ID</code> ve isteğe bağlı <code>ID_LIKE</code> anahtarları). <code>ID_LIKE</code> boşlukla ayrılmış birden çok ad içerebilir (ör. <code>"rhel centos fedora"</code>).</p><ul><li>ID ya da ID_LIKE içinde <code>debian</code> veya <code>ubuntu</code> varsa → <code>"sudo apt install python3 python3-venv python3-pip"</code></li><li><code>fedora</code> veya <code>rhel</code> → <code>"sudo dnf install python3 python3-pip"</code></li><li><code>arch</code> → <code>"sudo pacman -S python python-pip"</code></li><li>Hiçbiri → <code>"uv python install 3.12"</code></li></ul>',
      guide: [
        'ID ve ID_LIKE değerlerini bilgi.get(..., "") ile al, küçük harfe çevir.',
        'İkisini boşlukla birleştirip split() ile bir "adlar" kümesi oluştur.',
        'Sırayla kümede debian/ubuntu, fedora/rhel, arch var mı kontrol et (küme kesişimi ya da any).',
        'Hiçbiri yoksa uv komutunu döndür.'
      ],
      example: 'etiketler = set("Elektronik Telefon".lower().split()) | {"kampanya"}\nif etiketler & {"telefon", "tablet"}:\n    print("Mobil kategori")\nelse:\n    print("Diğer")\n',
      start: 'def kurulum_komutu(bilgi):\n    # TODO: ID ve ID_LIKE\'tan küçük harfli bir adlar kümesi oluştur\n    adlar = set()\n    # TODO: sırayla apt, dnf, pacman ailelerini kontrol et\n    return ""\n',
      sol: 'def kurulum_komutu(bilgi):\n    adlar = set((bilgi.get("ID", "") + " " + bilgi.get("ID_LIKE", "")).lower().split())\n    if adlar & {"debian", "ubuntu"}:\n        return "sudo apt install python3 python3-venv python3-pip"\n    if adlar & {"fedora", "rhel"}:\n        return "sudo dnf install python3 python3-pip"\n    if "arch" in adlar:\n        return "sudo pacman -S python python-pip"\n    return "uv python install 3.12"\n',
      tests: 'assert kurulum_komutu({"ID": "ubuntu", "ID_LIKE": "debian"}) == "sudo apt install python3 python3-venv python3-pip", "Ubuntu apt kullanır"\nassert kurulum_komutu({"ID": "linuxmint", "ID_LIKE": "ubuntu debian"}) == "sudo apt install python3 python3-venv python3-pip", "Mint, ID_LIKE üzerinden apt ailesindedir"\nassert kurulum_komutu({"ID": "rocky", "ID_LIKE": "rhel centos fedora"}) == "sudo dnf install python3 python3-pip", "Rocky Linux, rhel ailesi: dnf"\nassert kurulum_komutu({"ID": "Fedora"}) == "sudo dnf install python3 python3-pip", "ID_LIKE olmayabilir; büyük harf de gelebilir"\nassert kurulum_komutu({"ID": "arch"}) == "sudo pacman -S python python-pip", "Arch: pacman"\nassert kurulum_komutu({"ID": "alpine"}) == "uv python install 3.12", "Tanınmayan dağıtım: uv önerisi"\nassert kurulum_komutu({}) == "uv python install 3.12", "Boş sözlükte de çökmemeli"\n',
      hints: ['bilgi.get("ID_LIKE", "") anahtar yoksa boş metin verir.', 'set(metin.lower().split()) & {"debian", "ubuntu"} boş değilse apt ailesidir.', 'Kontrol sırası: apt, dnf, pacman, en sonda uv.'],
      why: 'Türev dağıtımlar (Mint, Pop!_OS, Rocky, AlmaLinux) kendi ID\'lerini taşır ama ID_LIKE ile ailelerini bildirir. İkisini tek kümede toplamak, yüzlerce dağıtımı birkaç kuralla kapsar.'
    },
    {
      t: 'code',
      stage: 'Rehberli',
      id: 'kurulum-macos-linux-3',
      diff: 2,
      q: '<p>pyenv\'in sürüm seçimini taklit eden <code>pyenv_surumu(ortam, yerel, genel)</code> fonksiyonunu yaz.</p><ul><li><code>ortam</code>: ortam değişkenleri sözlüğü; <code>"PYENV_VERSION"</code> anahtarı olabilir.</li><li><code>yerel</code>: <code>.python-version</code> dosyasının içeriği ya da <code>None</code>.</li><li><code>genel</code>: <code>~/.pyenv/version</code> içeriği ya da <code>None</code>.</li></ul><p>Sırayla ilk <b>dolu</b> kaynağı kullan ve <code>(surum, kaynak)</code> döndür; kaynak <code>"PYENV_VERSION"</code>, <code>".python-version"</code>, <code>"global"</code> ya da hepsi boşsa <code>("system", "sistem")</code>. Dosya içeriğinde yorum satırları (<code>#</code>) ve boş satırlar olabilir; ilk gerçek satırı al ve boşluklarını temizle.</p>',
      guide: [
        'Dosya içeriğinden ilk anlamlı satırı veren küçük bir yardımcı yaz (ilk_satir).',
        'Yardımcı: None ise None döndür; satırlarda dön, strip et, boş ya da # ile başlayanı atla.',
        'Adayları (kaynak, değer) listesi olarak sırala.',
        'İlk dolu değeri bulunca (değer, kaynak) döndür; döngü biterse ("system", "sistem").'
      ],
      example: 'def ilk_dolu(*degerler):\n    for d in degerler:\n        if d:\n            return d\n    return "yok"\nprint(ilk_dolu(None, "", "kargo", "iade"))\n',
      start: 'def ilk_satir(icerik):\n    # TODO: None ise None; değilse ilk boş olmayan ve # ile başlamayan satır\n    return None\n\n\ndef pyenv_surumu(ortam, yerel, genel):\n    adaylar = [\n        ("PYENV_VERSION", ortam.get("PYENV_VERSION")),\n        # TODO: yerel ve genel dosyaları ilk_satir ile ekle\n    ]\n    # TODO: ilk dolu adayı döndür\n    return ("system", "sistem")\n',
      sol: 'def ilk_satir(icerik):\n    if icerik is None:\n        return None\n    for satir in icerik.splitlines():\n        satir = satir.strip()\n        if satir and not satir.startswith("#"):\n            return satir\n    return None\n\n\ndef pyenv_surumu(ortam, yerel, genel):\n    adaylar = [\n        ("PYENV_VERSION", (ortam.get("PYENV_VERSION") or "").strip()),\n        (".python-version", ilk_satir(yerel)),\n        ("global", ilk_satir(genel)),\n    ]\n    for kaynak, deger in adaylar:\n        if deger:\n            return (deger, kaynak)\n    return ("system", "sistem")\n',
      tests: 'assert pyenv_surumu({}, "3.11.9\\n", "3.12.4\\n") == ("3.11.9", ".python-version"), "Klasördeki .python-version global\'den önce gelir"\nassert pyenv_surumu({"PYENV_VERSION": "3.13.0"}, "3.11.9", "3.12.4") == ("3.13.0", "PYENV_VERSION"), "Ortam değişkeni her şeyi ezer"\nassert pyenv_surumu({"PYENV_VERSION": ""}, None, "# yorum\\n\\n  3.12.4  \\n") == ("3.12.4", "global"), "Boş ortam değişkeni sayılmaz; yorum ve boş satır atlanır"\nassert pyenv_surumu({}, "\\n# boş\\n", None) == ("system", "sistem"), "Yalnız yorum içeren dosya boş sayılır"\nassert pyenv_surumu({}, None, None) == ("system", "sistem"), "Hiçbiri yoksa sistem Python\'ı"\n',
      hints: [
        'Boş metin ve None, if koşulunda yanlış sayılır; "ilk dolu" kontrolü için yeterli.',
        'ilk_satir içinde: for satir in icerik.splitlines(): satir = satir.strip(); if satir and not satir.startswith("#"): return satir',
        'Adaylara (".python-version", ilk_satir(yerel)) ve ("global", ilk_satir(genel)) ekle; döngüde if deger: return (deger, kaynak)'
      ],
      why: 'Öncelik zincirleri yapılandırma sistemlerinde çok yaygındır (ortam değişkeni → proje dosyası → kullanıcı ayarı → varsayılan). Adayları sıralı bir listede tutmak, kuralı okunur ve genişletilebilir yapar.'
    },
    {
      t: 'code',
      stage: 'Kendin yaz',
      id: 'kurulum-macos-linux-4',
      diff: 1,
      q: '<p><code>homebrew_python_yolu(makine, surum="3.12", isletim="macos")</code> fonksiyonunu yaz. Homebrew öneki: macOS\'ta <code>makine == "arm64"</code> ise <code>/opt/homebrew</code>, <code>"x86_64"</code> ise <code>/usr/local</code>; Linux\'ta (Linuxbrew) makineden bağımsız <code>/home/linuxbrew/.linuxbrew</code>. Dönüş: <code>&lt;önek&gt;/bin/python&lt;surum&gt;</code>. macOS\'ta tanınmayan makinede <code>ValueError</code> fırlat.</p>',
      start: 'def homebrew_python_yolu(makine, surum="3.12", isletim="macos"):\n    pass\n',
      sol: 'def homebrew_python_yolu(makine, surum="3.12", isletim="macos"):\n    if isletim == "linux":\n        onek = "/home/linuxbrew/.linuxbrew"\n    elif makine == "arm64":\n        onek = "/opt/homebrew"\n    elif makine == "x86_64":\n        onek = "/usr/local"\n    else:\n        raise ValueError(f"Bilinmeyen makine: {makine}")\n    return f"{onek}/bin/python{surum}"\n',
      tests: 'assert homebrew_python_yolu("arm64") == "/opt/homebrew/bin/python3.12", "Apple Silicon: /opt/homebrew"\nassert homebrew_python_yolu("x86_64", "3.11") == "/usr/local/bin/python3.11", "Intel Mac: /usr/local"\nassert homebrew_python_yolu("x86_64", "3.13", "linux") == "/home/linuxbrew/.linuxbrew/bin/python3.13", "Linuxbrew öneki"\ntry:\n    homebrew_python_yolu("ppc")\n    assert False, "Tanınmayan makinede ValueError beklenir"\nexcept ValueError:\n    pass\n',
      hints: ['Önce işletim sistemini, sonra makineyi kontrol et.', 'f"{onek}/bin/python{surum}"'],
      why: 'Aynı formül iki farklı önekte yaşar; kurulum betikleri ve VS Code yapılandırmaları bu farkı bilmezse Intel ve Apple Silicon makinelerde farklı davranır.'
    },
    {
      t: 'code',
      stage: 'Kendin yaz',
      id: 'kurulum-macos-linux-5',
      diff: 2,
      q: '<p>Ekip wiki\'sindeki komutları denetleyen <code>pip_komutu_denetle(komut)</code> fonksiyonunu yaz. <code>shlex.split</code> ile parçala ve şu sırayla uyarı kodlarının listesini döndür:</p><ul><li>İlk parça <code>sudo</code> ise <code>"SUDO"</code> (sonraki kontroller sudo\'dan sonraki parçalara bakar).</li><li>Komut doğrudan <code>pip</code> ya da <code>pip3</code> ile başlıyorsa <code>"DOGRUDAN_PIP"</code> (öneri: python3 -m pip). <code>python3 -m pip</code> ya da <code>python3.12 -m pip</code> biçimi uyarı almaz.</li><li>Parçalarda <code>--break-system-packages</code> varsa <code>"PEP668_DELME"</code>.</li></ul><p>Sorun yoksa boş liste.</p>',
      start: 'import shlex\n\ndef pip_komutu_denetle(komut):\n    pass\n',
      sol: 'import shlex\n\ndef pip_komutu_denetle(komut):\n    parcalar = shlex.split(komut)\n    uyarilar = []\n    if parcalar and parcalar[0] == "sudo":\n        uyarilar.append("SUDO")\n        parcalar = parcalar[1:]\n    if parcalar and parcalar[0] in ("pip", "pip3"):\n        uyarilar.append("DOGRUDAN_PIP")\n    if "--break-system-packages" in parcalar:\n        uyarilar.append("PEP668_DELME")\n    return uyarilar\n',
      tests: 'assert pip_komutu_denetle("sudo pip3 install pandas --break-system-packages") == ["SUDO", "DOGRUDAN_PIP", "PEP668_DELME"], "Üç sorun da yakalanmalı, sırayla"\nassert pip_komutu_denetle("python3 -m pip install pandas") == [], "python3 -m pip doğru kullanım"\nassert pip_komutu_denetle("pip install \'pandas>=2.2\'") == ["DOGRUDAN_PIP"], "Tırnaklı sürüm belirteci tek parça kalır"\nassert pip_komutu_denetle("sudo python3.12 -m pip install requests") == ["SUDO"], "sudo tek başına uyarı"\nassert pip_komutu_denetle("python3 -m pip install x --break-system-packages") == ["PEP668_DELME"], "Bayrak her yerde yakalanır"\nassert pip_komutu_denetle("") == [], "Boş komut"\n',
      hints: ['shlex.split, tırnaklı \'pandas&gt;=2.2\' parçasını tek parça yapar.', 'sudo\'yu gördükten sonra parcalar = parcalar[1:] ile kalan komuta bak.'],
      why: 'Komutları str.split ile değil shlex ile parçalamak tırnaklı argümanları doğru işler. sudo pip ve --break-system-packages, Linux\'ta sistem Python\'ını bozmanın en kısa iki yoludur; doğrudan pip ise yanlış yorumlayıcıya kurulum riskidir.'
    },
    {
      t: 'code',
      stage: 'Kendin yaz',
      id: 'kurulum-macos-linux-6',
      diff: 2,
      q: '<p><code>venv_aktivasyon(kabuk, klasor=".venv")</code> fonksiyonunu yaz. <code>kabuk</code> ya <code>"zsh"</code> gibi bir ad ya da <code>$SHELL</code> değeri gibi tam yol (<code>"/bin/zsh"</code>) olabilir; adı yoldan çıkar. Dönüşler:</p><ul><li><code>bash</code>, <code>zsh</code>, <code>sh</code> → <code>"source .venv/bin/activate"</code></li><li><code>fish</code> → <code>"source .venv/bin/activate.fish"</code></li><li><code>csh</code>, <code>tcsh</code> → <code>"source .venv/bin/activate.csh"</code></li><li><code>pwsh</code> → <code>".venv/bin/Activate.ps1"</code></li><li>Diğerleri → <code>ValueError</code></li></ul><p><code>.venv</code> yerine <code>klasor</code> parametresini kullan.</p>',
      start: 'def venv_aktivasyon(kabuk, klasor=".venv"):\n    pass\n',
      sol: 'import posixpath\n\ndef venv_aktivasyon(kabuk, klasor=".venv"):\n    ad = posixpath.basename(kabuk)\n    if ad in ("bash", "zsh", "sh"):\n        return f"source {klasor}/bin/activate"\n    if ad == "fish":\n        return f"source {klasor}/bin/activate.fish"\n    if ad in ("csh", "tcsh"):\n        return f"source {klasor}/bin/activate.csh"\n    if ad == "pwsh":\n        return f"{klasor}/bin/Activate.ps1"\n    raise ValueError(f"Desteklenmeyen kabuk: {kabuk}")\n',
      tests: 'assert venv_aktivasyon("/bin/zsh") == "source .venv/bin/activate", "Tam yoldan kabuk adı çıkarılmalı"\nassert venv_aktivasyon("bash", "env") == "source env/bin/activate", "klasor parametresi kullanılmalı"\nassert venv_aktivasyon("/usr/bin/fish") == "source .venv/bin/activate.fish", "fish kendi betiğini kullanır"\nassert venv_aktivasyon("tcsh") == "source .venv/bin/activate.csh", "tcsh: activate.csh"\nassert venv_aktivasyon("/usr/local/bin/pwsh") == ".venv/bin/Activate.ps1", "Linux/macOS\'ta PowerShell de bin altındadır"\ntry:\n    venv_aktivasyon("nushell")\n    assert False, "Desteklenmeyen kabukta ValueError"\nexcept ValueError:\n    pass\n',
      hints: ['posixpath.basename("/bin/zsh") → "zsh"', 'Her kabuk ailesi için bir if; f-string içinde klasor kullan.'],
      why: 'venv her kabuk için ayrı etkinleştirme betiği üretir, çünkü kabukların sözdizimi farklıdır. $SHELL tam yol verdiği için basename ile adı ayırmak gerekir.'
    },
    {
      t: 'code',
      stage: 'Kendin yaz',
      id: 'kurulum-macos-linux-7',
      diff: 2,
      q: '<p><code>shebang_yorumla(ilk_satir)</code> fonksiyonunu yaz: betiğin ilk satırına bakıp hangi yorumlayıcının çağrılacağını döndürsün.</p><ul><li><code>#!</code> ile başlamıyorsa <code>None</code>.</li><li><code>#!</code> sonrasını <code>shlex.split</code> ile parçala (<code>#! /usr/bin/python3</code> gibi boşluklu yazım da olur).</li><li>İlk parçanın son bileşeni <code>env</code> ise, <code>-</code> ile başlamayan ilk sonraki parçayı döndür (<code>#!/usr/bin/env -S python3 -u</code> → <code>"python3"</code>).</li><li>Değilse ilk parçayı (tam yolu) döndür.</li></ul>',
      start: 'import shlex\n\ndef shebang_yorumla(ilk_satir):\n    pass\n',
      sol: 'import shlex, posixpath\n\ndef shebang_yorumla(ilk_satir):\n    if not ilk_satir.startswith("#!"):\n        return None\n    parcalar = shlex.split(ilk_satir[2:])\n    if not parcalar:\n        return None\n    if posixpath.basename(parcalar[0]) == "env":\n        for p in parcalar[1:]:\n            if not p.startswith("-"):\n                return p\n        return None\n    return parcalar[0]\n',
      tests: 'assert shebang_yorumla("#!/usr/bin/env python3") == "python3", "env ile PATH\'teki python3"\nassert shebang_yorumla("#!/usr/bin/python3.12 -u") == "/usr/bin/python3.12", "Doğrudan yol; seçenekler önemsiz"\nassert shebang_yorumla("#! /usr/bin/python3") == "/usr/bin/python3", "#! sonrası boşluk olabilir"\nassert shebang_yorumla("#!/usr/bin/env -S python3 -X utf8") == "python3", "env seçenekleri (-S) atlanmalı"\nassert shebang_yorumla("#!/home/ayse/rapor/.venv/bin/python") == "/home/ayse/rapor/.venv/bin/python", "venv yorumlayıcısı"\nassert shebang_yorumla("import sys") is None, "Shebang değil"\nassert shebang_yorumla("#!") is None, "Boş shebang"\n',
      hints: ['ilk_satir[2:] ile #! işaretinden sonrasını al.', 'posixpath.basename(parcalar[0]) == "env" ise sonraki parçalarda - ile başlamayan ilkini bul.'],
      why: 'env, PATH\'te arama yaparak yorumlayıcıyı bulur; bu yüzden etkin venv ya da pyenv sürümü kullanılır. Doğrudan yol ise hep aynı yorumlayıcıyı çağırır. Teşhiste ilk soru budur: betik hangi Python ile başlıyor?'
    },
    {
      t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      id: 'kurulum-macos-linux-8',
      diff: 2,
      q: '<p>Hatayı bul ve düzelt. <code>dagitim_adi(metin)</code> os-release metninden <code>PRETTY_NAME</code> değerini (tırnaksız) döndürmeli; anahtar yoksa <code>NAME</code>, o da yoksa <code>"Linux"</code>. Gerçek dosyalarda kod çöküyor ya da tırnaklı sonuç veriyor.</p>',
      start: 'def dagitim_adi(metin):\n    bilgi = {}\n    for satir in metin.splitlines():\n        anahtar, deger = satir.split("=")\n        bilgi[anahtar] = deger\n    return bilgi.get("PRETTY_NAME", bilgi["NAME"])\n',
      sol: 'def dagitim_adi(metin):\n    bilgi = {}\n    for satir in metin.splitlines():\n        satir = satir.strip()\n        if not satir or satir.startswith("#") or "=" not in satir:\n            continue\n        anahtar, deger = satir.split("=", 1)\n        bilgi[anahtar] = deger.strip("\\"\'")\n    return bilgi.get("PRETTY_NAME") or bilgi.get("NAME") or "Linux"\n',
      tests: 'm = \'PRETTY_NAME="Debian GNU/Linux 12 (bookworm)"\\nNAME="Debian GNU/Linux"\\n\\nHOME_URL="https://www.debian.org/?a=b"\\n\'\nassert dagitim_adi(m) == "Debian GNU/Linux 12 (bookworm)", "Boş satır ve = içeren URL çökertmemeli, tırnaklar atılmalı"\nassert dagitim_adi(\'NAME="Alpine Linux"\\nID=alpine\') == "Alpine Linux", "PRETTY_NAME yoksa NAME"\nassert dagitim_adi("ID=bilinmeyen") == "Linux", "İkisi de yoksa Linux; KeyError değil"\nassert dagitim_adi("# yorum\\nPRETTY_NAME=\'Fedora Linux 40\'") == "Fedora Linux 40", "Yorum satırı atlanmalı; tek tırnak da atılmalı"\n',
      hints: [
        'Dört sorun var: boş/yorum satırı atlanmıyor, split("=") maxsplit olmadan URL\'de patlıyor, tırnaklar atılmıyor ve bilgi["NAME"] varsayılan bile kullanılmasa önce değerlendirilip KeyError veriyor.',
        'bilgi.get("PRETTY_NAME") or bilgi.get("NAME") or "Linux" zinciri hiç KeyError vermez.'
      ],
      why: 'dict.get(k, varsayilan) çağrısında varsayılan ifade her durumda önce hesaplanır; bilgi["NAME"] anahtar yoksa çağrıdan önce KeyError verir. or zinciri ise tembeldir. Gerçek dosyalarda boş satır, yorum ve = içeren değerler bulunur.'
    },
    {
      t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      id: 'kurulum-macos-linux-9',
      diff: 2,
      q: '<p>Hatayı bul ve düzelt. <code>ortam_etiketi(prefix, base_prefix)</code>, terminal isteminde gösterilecek etiketi üretiyor: sanal ortamdaysan (prefix ile base_prefix farklıysa) ortam klasörünün adı, değilsen <code>"sistem"</code>. Kod tersini yapıyor ve sonunda <code>/</code> olan yollarda boş etiket veriyor.</p>',
      start: 'import posixpath\n\ndef ortam_etiketi(prefix, base_prefix):\n    if prefix == base_prefix:\n        return posixpath.basename(prefix)\n    return "sistem"\n',
      sol: 'import posixpath\n\ndef ortam_etiketi(prefix, base_prefix):\n    if posixpath.normpath(prefix) == posixpath.normpath(base_prefix):\n        return "sistem"\n    return posixpath.basename(posixpath.normpath(prefix))\n',
      tests: 'assert ortam_etiketi("/home/ayse/rapor/.venv", "/usr") == ".venv", "Farklı önek: venv içindesin, klasör adı .venv"\nassert ortam_etiketi("/usr", "/usr") == "sistem", "Aynı önek: sistem Python\'ı"\nassert ortam_etiketi("/opt/proje/env/", "/opt/homebrew/opt/python@3.12") == "env", "Sondaki / basename\'i boşaltmamalı: normpath kullan"\nassert ortam_etiketi("/usr/", "/usr") == "sistem", "Sondaki / farkı venv sanılmamalı"\n',
      hints: ['Koşul ters: prefix != base_prefix ise venv içindesin.', 'posixpath.basename("/a/b/") boş metin döner; önce posixpath.normpath ile sondaki /\'i at.'],
      why: 'sys.prefix çalışan ortamın kökü, sys.base_prefix onun türediği kurulumdur; ikisi farklıysa venv içindesin. Yolları karşılaştırmadan ve bileşen almadan önce normalleştirmek, sondaki ayırıcı gibi biçim farklarını ortadan kaldırır.'
    },
    {
      t: 'code',
      stage: 'Meydan okuma',
      id: 'kurulum-macos-linux-10',
      diff: 3,
      q: '<p>Yıllar içinde <code>~/.zshrc</code>\'ye eklenen satırlar PATH\'i karmakarışık yaptı. <code>path_temizle(path_metni, ev)</code> fonksiyonunu yaz (ayırıcı <code>:</code>):</p><ul><li>Boş girdileri at.</li><li>Başta <code>~</code> varsa <code>ev</code> klasörüyle değiştir (<code>~</code> tek başına ya da <code>~/...</code>).</li><li>Her girdiyi <code>posixpath.normpath</code> ile normalleştir (<code>/usr//bin/</code> → <code>/usr/bin</code>).</li><li><b>Göreli</b> girdileri (<code>.</code>, <code>bin</code> gibi <code>/</code> ile başlamayanlar) güvenlik nedeniyle at.</li><li>Tekrarları at; <b>ilk</b> görüleni tut (sıra önemlidir!).</li></ul><p>Temizlenmiş PATH\'i yine <code>:</code> ile birleştirilmiş metin olarak döndür.</p>',
      start: 'import posixpath\n\ndef path_temizle(path_metni, ev):\n    pass\n',
      sol: 'import posixpath\n\ndef path_temizle(path_metni, ev):\n    sonuc = []\n    gorulen = set()\n    for girdi in path_metni.split(":"):\n        girdi = girdi.strip()\n        if not girdi:\n            continue\n        if girdi == "~" or girdi.startswith("~/"):\n            girdi = ev + girdi[1:]\n        if not girdi.startswith("/"):\n            continue\n        girdi = posixpath.normpath(girdi)\n        if girdi in gorulen:\n            continue\n        gorulen.add(girdi)\n        sonuc.append(girdi)\n    return ":".join(sonuc)\n',
      tests: 'p = "~/.local/bin:/opt/homebrew/bin::/usr//bin/:/home/ayse/.local/bin:.:/usr/bin:bin:/opt/homebrew/bin/:~"\nassert path_temizle(p, "/home/ayse") == "/home/ayse/.local/bin:/opt/homebrew/bin:/usr/bin:/home/ayse", "~ açılmalı, normalleştirilmeli, göreli ve tekrarlar atılmalı; ilk görülen sırası korunmalı"\nassert path_temizle("", "/home/x") == "", "Boş PATH"\nassert path_temizle("/a/../b:/b", "/h") == "/b", "normpath /a/../b\'yi /b yapar; ikinci /b tekrardır"\nassert path_temizle("~user/bin:/usr/bin", "/h") == "/usr/bin", "~user başka kullanıcıdır; açılmaz ve göreli sayılıp atılır"\n',
      hints: [
        'Kontrol sırası önemli: boş → ~ açma → göreli mi → normpath → tekrar mı.',
        'Sırayı korumak için hem bir liste (sonuc) hem bir küme (gorulen) tut.',
        '"~user/bin" ~ ile başlar ama "~/" ile başlamaz; açma, göreli olduğu için atılır.'
      ],
      why: 'PATH\'te sıra anlam taşır; tekrarları atarken ilk görüleni tutmak davranışı değiştirmez. Göreli girdiler (özellikle ".") güvenlik açığıdır: bulunduğun klasördeki "python3" adlı kötü niyetli bir dosya gerçek Python\'ın yerine çalışabilir.'
    },
    {
      t: 'code',
      stage: 'Mini proje',
      id: 'kurulum-macos-linux-11',
      diff: 3,
      q: '<p>Anadolu Lojistik\'in sunucu envanteri için <code>ortam_raporu(os_release_metni, path_metni, diskteki)</code> fonksiyonunu yaz. Sözlük döndür:</p><ul><li><code>"dagitim"</code>: PRETTY_NAME (yoksa NAME, o da yoksa <code>"Linux"</code>), tırnaksız.</li><li><code>"kurulum"</code>: ID/ID_LIKE ailesine göre komut (apt: <code>"sudo apt install python3 python3-venv python3-pip"</code>, dnf: <code>"sudo dnf install python3 python3-pip"</code>, diğer: <code>"uv python install 3.12"</code>).</li><li><code>"pep668"</code>: ID <code>ubuntu</code> ve VERSION_ID ≥ 23.04, ya da ID <code>debian</code> ve VERSION_ID ≥ 12 ise <code>True</code>; aksi hâlde <code>False</code>. Sürümleri sayı demeti olarak karşılaştır.</li><li><code>"python3"</code>: PATH (<code>:</code> ayırıcı) sırasıyla <code>diskteki</code> kümesinde bulunan ilk <code>&lt;klasör&gt;/python3</code>; yoksa <code>None</code>.</li><li><code>"oneri"</code>: python3 yoksa kurulum komutu; varsa ve pep668 True ise <code>"python3 -m venv .venv"</code>; değilse <code>"python3 -m pip install --user"</code>.</li></ul>',
      start: 'def ortam_raporu(os_release_metni, path_metni, diskteki):\n    pass\n',
      sol: 'import posixpath\n\ndef _oku(metin):\n    bilgi = {}\n    for satir in metin.splitlines():\n        satir = satir.strip()\n        if not satir or satir.startswith("#") or "=" not in satir:\n            continue\n        k, v = satir.split("=", 1)\n        bilgi[k] = v.strip("\\"\'")\n    return bilgi\n\ndef _surum(metin):\n    try:\n        return tuple(int(p) for p in metin.split("."))\n    except ValueError:\n        return ()\n\ndef ortam_raporu(os_release_metni, path_metni, diskteki):\n    b = _oku(os_release_metni)\n    adlar = set((b.get("ID", "") + " " + b.get("ID_LIKE", "")).lower().split())\n    if adlar & {"debian", "ubuntu"}:\n        kurulum = "sudo apt install python3 python3-venv python3-pip"\n    elif adlar & {"fedora", "rhel"}:\n        kurulum = "sudo dnf install python3 python3-pip"\n    else:\n        kurulum = "uv python install 3.12"\n    kimlik = b.get("ID", "").lower()\n    surum = _surum(b.get("VERSION_ID", ""))\n    pep668 = (kimlik == "ubuntu" and surum >= (23, 4)) or (kimlik == "debian" and surum >= (12,))\n    python3 = None\n    for klasor in path_metni.split(":"):\n        if klasor and posixpath.join(klasor, "python3") in diskteki:\n            python3 = posixpath.join(klasor, "python3")\n            break\n    if python3 is None:\n        oneri = kurulum\n    elif pep668:\n        oneri = "python3 -m venv .venv"\n    else:\n        oneri = "python3 -m pip install --user"\n    return {\n        "dagitim": b.get("PRETTY_NAME") or b.get("NAME") or "Linux",\n        "kurulum": kurulum,\n        "pep668": pep668,\n        "python3": python3,\n        "oneri": oneri,\n    }\n',
      tests: 'u = \'PRETTY_NAME="Ubuntu 24.04.1 LTS"\\nID=ubuntu\\nID_LIKE=debian\\nVERSION_ID="24.04"\'\nr = ortam_raporu(u, "/usr/local/bin:/usr/bin", {"/usr/bin/python3"})\nassert r == {"dagitim": "Ubuntu 24.04.1 LTS", "kurulum": "sudo apt install python3 python3-venv python3-pip", "pep668": True, "python3": "/usr/bin/python3", "oneri": "python3 -m venv .venv"}, "Ubuntu 24.04: PEP 668 açık, venv önerilir"\nu22 = \'PRETTY_NAME="Ubuntu 22.04.4 LTS"\\nID=ubuntu\\nVERSION_ID="22.04"\'\nr = ortam_raporu(u22, "/usr/bin", {"/usr/bin/python3"})\nassert r["pep668"] is False and r["oneri"] == "python3 -m pip install --user", "22.04 < 23.04: PEP 668 yok"\nd = \'PRETTY_NAME="Debian GNU/Linux 12 (bookworm)"\\nID=debian\\nVERSION_ID="12"\'\nr = ortam_raporu(d, "/usr/bin", set())\nassert r["pep668"] is True and r["python3"] is None and r["oneri"] == "sudo apt install python3 python3-venv python3-pip", "Debian 12: PEP 668; python3 yoksa öneri kurulum komutudur"\nf = \'NAME="Fedora Linux"\\nID=fedora\\nVERSION_ID=40\'\nr = ortam_raporu(f, "/home/u/.local/bin:/usr/bin", {"/usr/bin/python3", "/home/u/.local/bin/python3"})\nassert r["dagitim"] == "Fedora Linux" and r["kurulum"] == "sudo dnf install python3 python3-pip" and r["python3"] == "/home/u/.local/bin/python3" and r["pep668"] is False, "Fedora: dnf, PATH\'teki ilk python3"\na = \'ID=alpine\\nVERSION_ID=3.20.1\'\nr = ortam_raporu(a, "", set())\nassert r["dagitim"] == "Linux" and r["kurulum"] == "uv python install 3.12" and r["oneri"] == "uv python install 3.12", "Tanınmayan dağıtım"\nassert ortam_raporu(\'ID=ubuntu\\nVERSION_ID="23.10"\', "", set())["pep668"] is True, "23.10 >= 23.04: (23, 10) >= (23, 4)"\n',
      hints: [
        'Önce os-release ayrıştırıcısını (_oku) ve sürüm demeti çeviricisini (_surum) yardımcı fonksiyon olarak yaz.',
        '"24.04" → (24, 4); (24, 4) >= (23, 4) doğru, metin karşılaştırmasına güvenme.',
        'PATH\'te ilk bulunan python3 için döngüde break kullan; öneriyi en sonda üç durumla seç.'
      ],
      why: 'Küçük ve test edilebilir yardımcılar (ayrıştırma, sürüm çevirme) büyük kararı okunur kılar. Bu fonksiyon, derste öğrendiğin her şeyi birleştirir: os-release, dağıtım aileleri, PEP 668, PATH sırası ve doğru kurulum önerisi.'
    }
  ],
  faq: [
    {
      q: 'Mac\'te python.org mu Homebrew mu?',
      a: 'İkisi de iyidir. Homebrew başka geliştirme araçlarını da kuruyorsan tutarlıdır; python.org yükleyicisi ise Homebrew\'un güncellemeyle sürümü değiştirmesinden etkilenmez. Birden çok sürüm gerekiyorsa uv ya da pyenv daha esnektir.'
    },
    {
      q: 'pyenv mi uv mi?',
      a: 'pyenv olgun ve yaygındır ama sürümleri derlediği için yavaştır ve derleme bağımlılıkları ister. uv hazır derlenmiş Python indirir, saniyeler içinde kurar ve ortam ile paket yönetimini de yapar. Yeni projelerde uv giderek varsayılan hâline geliyor; mevcut ekip pyenv kullanıyorsa ona uy.'
    },
    {
      q: '--break-system-packages gerçekten bu kadar tehlikeli mi?',
      a: 'pip, apt\'nin kurduğu bir kütüphanenin üzerine farklı bir sürüm yazabilir; apt\'ye bağlı bir sistem aracı o kütüphanenin yeni sürümüyle çalışmayıp bozulabilir. Bir konteyner ya da tek kullanımlık sanal makinede kabul edilebilir; kendi bilgisayarında ve sunucuda venv kullan.'
    },
    {
      q: 'WSL\'de hangi adımları izlemeliyim?',
      a: 'WSL içinde Ubuntu çalışır; bu dersteki Ubuntu adımları aynen geçerlidir. Projelerini Windows diskinde (/mnt/c) değil WSL\'in kendi dosya sisteminde (~/projeler) tut; dosya işlemleri çok daha hızlı olur.'
    }
  ],
  mistakes: [
    {
      bad: 'sudo pip install pandas',
      good: 'python3 -m venv .venv\nsource .venv/bin/activate\npip install pandas',
      why: 'sudo pip sistem Python\'ına yazar, apt\'nin dosyalarıyla çakışır ve PEP 668 korumasını deler. Proje bağımlılıkları venv\'e gider.'
    },
    {
      bad: 'sudo ln -sf /usr/bin/python3.13 /usr/bin/python3',
      good: 'python3.13 -m venv .venv\n# projede: .venv/bin/python',
      why: 'Sistem araçları /usr/bin/python3\'ün dağıtımın sürümü olmasına güvenir; bağlantıyı değiştirmek apt ve diğer araçları bozabilir.'
    },
    {
      bad: 'anahtar, deger = satir.split("=")',
      good: 'anahtar, deger = satir.split("=", 1)',
      why: 'Yapılandırma değerleri (URL\'ler, parametreler) = içerebilir; maxsplit olmadan iki yerine üç parça çıkar ve ValueError alırsın.'
    },
    {
      bad: '#!/usr/bin/python3\n# venv\'deki paketleri kullanacak betik',
      good: '#!/usr/bin/env python3\n# ya da venv yorumlayıcısının tam yolu',
      why: '/usr/bin/python3 hep sistem Python\'ıdır ve venv\'e kurduğun paketleri görmez. env, PATH\'teki (etkin venv\'deki) python3\'ü bulur.'
    }
  ]
}
);
})(window);
