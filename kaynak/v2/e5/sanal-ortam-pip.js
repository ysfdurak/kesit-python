/* Kesit Python — sanal-ortam-pip uzantısı (Derinleş) */
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push({
  id: 'sanal-ortam-pip',
  min: 45,
  html: `<h2>Derinleş: Kurulumdan kilit dosyasına paket yönetimi</h2>
<p>Bu bölüm bir başvuru kılavuzudur: her işletim sisteminde sanal ortamı kurup etkinleştirme, pip'in tüm günlük komutları, requirements ve constraints dosyaları, pip-tools, uv, poetry, conda ve pipx ile iş akışları ve en sık karşılaşılan hataların çözümü. Komutları kendi bilgisayarında, proje klasöründe dene; tarayıcıdaki örnekler ise ortamı ve sürümleri <b>Python'dan</b> nasıl sorgulayacağını gösterir. Altın kural: <code>pip</code> yerine <code>python -m pip</code> yaz; böylece paket, o an çalışan Python'a kurulur.</p>
<h3>1. venv: her işletim sisteminde oluştur, etkinleştir, doğrula</h3>
<div class="tbl-wrap"><table><tr><th>Sistem / kabuk</th><th>Oluştur</th><th>Etkinleştir</th></tr><tr><td>Windows – PowerShell</td><td><code>py -3.12 -m venv .venv</code></td><td><code>.venv\\Scripts\\Activate.ps1</code></td></tr><tr><td>Windows – cmd</td><td><code>py -m venv .venv</code></td><td><code>.venv\\Scripts\\activate.bat</code></td></tr><tr><td>Windows – Git Bash</td><td><code>py -m venv .venv</code></td><td><code>source .venv/Scripts/activate</code></td></tr><tr><td>macOS / Linux – bash, zsh</td><td><code>python3 -m venv .venv</code></td><td><code>source .venv/bin/activate</code></td></tr><tr><td>Linux/macOS – fish</td><td><code>python3 -m venv .venv</code></td><td><code>source .venv/bin/activate.fish</code></td></tr><tr><td>csh / tcsh</td><td><code>python3 -m venv .venv</code></td><td><code>source .venv/bin/activate.csh</code></td></tr></table></div>
<p>Etkinleşince istemde <code>(.venv)</code> görünür. Çıkmak için her kabukta <code>deactivate</code>. Etkinleştirmeden de çalışabilirsin: <code>.venv/bin/python betik.py</code> (Windows'ta <code>.venv\\Scripts\\python.exe betik.py</code>) doğrudan o ortamın Python'ını kullanır; zamanlanmış görevlerde ve CI'da en güvenli yol budur.</p>
<pre class="code"># Windows PowerShell: "running scripts is disabled on this system" hatası
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
.venv\\Scripts\\Activate.ps1
where.exe python             # ilk satır ...\\.venv\\Scripts\\python.exe olmalı

# Debian/Ubuntu: "ensurepip is not available" hatası
sudo apt install python3-venv          # (ya da python3.12-venv)
python3 -m venv .venv &amp;&amp; source .venv/bin/activate
which python                 # .../proje/.venv/bin/python olmalı

# Ortamı sıfırdan kurmak (bozulduysa): klasörü sil, yeniden oluştur
rm -rf .venv                 # Windows: Remove-Item -Recurse -Force .venv
python3 -m venv .venv --upgrade-deps   # pip'i de güncel kurar</pre>
<p>Hangi ortamda olduğunu kodla da anlayabilirsin: sanal ortamda <code>sys.prefix</code> ortam klasörünü, <code>sys.base_prefix</code> ise ana kurulumu gösterir.</p>
<pre class="py">import sys, sysconfig, platform
from pathlib import Path

print("Python:", platform.python_version(), "| sistem:", platform.system())
print("Çalışan yorumlayıcı:", sys.executable)
print("Sanal ortamda mı?", sys.prefix != sys.base_prefix)
print("Paketler buraya kurulur:", sysconfig.get_paths()["purelib"])

isaret = Path(sysconfig.get_paths()["stdlib"]) / "EXTERNALLY-MANAGED"
print("PEP 668 korumalı sistem Python\\'ı mı?", isaret.exists())</pre>
<h3>2. pip: günlük komutların tamamı</h3>
<pre class="code">python -m pip install requests                 # en son sürüm
python -m pip install "pandas&gt;=2.2,&lt;3"         # aralık (tırnak şart: &lt; ve &gt; kabuk yönlendirmesidir)
python -m pip install pandas==2.2.3            # tam sürüm
python -m pip install -U pandas                # güncelle (--upgrade)
python -m pip install -U pip                   # pip'in kendisini güncelle
python -m pip install -r requirements.txt      # dosyadan
python -m pip install -e .                     # projeyi düzenlenebilir (editable) kur
python -m pip install "httpx[http2]"           # ekstralarla (extras)
python -m pip install --dry-run -r requirements.txt   # ne kurulacağını göster, kurma

python -m pip uninstall -y requests            # kaldır (bağımlılıkları KALDIRMAZ)
python -m pip show pandas                      # sürüm, konum, Requires, Required-by
python -m pip list                             # kurulu paketler
python -m pip list --outdated                  # güncellenebilenler
python -m pip freeze &gt; requirements.txt        # tam sürümlerle döküm
python -m pip check                            # kırık bağımlılık var mı?
python -m pip download -d paketler -r requirements.txt   # internetsiz kurulum için indir
python -m pip install --no-index --find-links paketler -r requirements.txt
python -m pip cache purge                      # bozuk önbelleği temizle
python -m pip config list                      # aktif pip ayarları</pre>
<div class="warn"><b>uninstall yetim bırakır</b><code>pip uninstall pandas</code> numpy'ı kaldırmaz. Ortam karıştıysa paket paket temizlemek yerine <code>.venv</code>'i silip <code>requirements.txt</code>'den yeniden kurmak daha hızlı ve güvenlidir.</div>
<h3>3. requirements ve constraints</h3>
<p><code>requirements.txt</code> "bunları kur" der. <code>constraints.txt</code> (<code>-c</code>) ise "kurarsan şu sürümü kullan" der ama kendisi hiçbir şey kurmaz. Şirket genelinde onaylı sürümleri tek dosyada tutmak için idealdir: her proje kendi requirements'ını yazar, sürümler ortak constraints'ten gelir.</p>
<pre class="code"># requirements.txt
pandas&gt;=2.2
requests
-c constraints.txt        # dosya içinden de bağlanabilir

# constraints.txt  (şirket onaylı sürümler)
pandas==2.2.3
numpy==2.1.3
requests==2.32.3
django==5.1.4             # kimse istemezse kurulmaz

python -m pip install -r requirements.txt -c constraints.txt</pre>
<p>Kurulu sürümleri Python içinden okumak (ör. bir betiğin başında "doğru sürüm mü?" kontrolü) için <code>importlib.metadata</code> kullanılır:</p>
<pre class="py">from importlib.metadata import version, PackageNotFoundError

for paket in ("pip", "pandas", "olmayan-paket-xyz"):
    try:
        print(f"{paket:20} {version(paket)}")
    except PackageNotFoundError:
        print(f"{paket:20} KURULU DEĞİL -&gt; python -m pip install {paket}")</pre>
<h3>4. pip-tools: elle yazılan liste + otomatik kilit</h3>
<pre class="code">python -m pip install pip-tools
# requirements.in : yalnız doğrudan ihtiyaçlar
#   pandas&gt;=2.2
#   httpx
pip-compile requirements.in              # -&gt; requirements.txt (tüm alt bağımlılıklar sabit, yorumlu)
pip-compile --upgrade-package httpx      # yalnız birini güncelle
pip-compile --generate-hashes            # özet doğrulamalı kilit (güvenlik)
pip-sync requirements.txt                # ortamı dosyayla BİREBİR eşitle (fazlaları kaldırır)</pre>
<h3>5. uv: hızlı, hepsi bir arada</h3>
<p>uv, Rust ile yazılmış, pip'ten kat kat hızlı bir araçtır; Python sürümü kurmayı, sanal ortamı, kilit dosyasını ve araç kurulumunu tek komutta toplar.</p>
<pre class="code"># Kurulum: macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh
# Windows PowerShell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"

uv python install 3.12            # Python'ı uv kursun
uv venv                           # .venv oluşturur (--python 3.12 ile sürüm seç)
uv pip install -r requirements.txt     # pip ile aynı arayüz, çok daha hızlı
uv pip compile requirements.in -o requirements.txt   # pip-tools karşılığı
uv pip sync requirements.txt

# Proje modu (pyproject.toml + uv.lock)
uv init anadolu-rapor &amp;&amp; cd anadolu-rapor
uv add pandas "httpx&gt;=0.27"       # pyproject'e yazar, kilitler, kurar
uv add --dev pytest ruff          # geliştirme bağımlılığı
uv remove httpx
uv lock                           # uv.lock'u güncelle (kurmadan)
uv lock --upgrade-package pandas
uv sync                           # ortamı kilide göre kur (CI'da: uv sync --locked)
uv run python rapor.py            # ortamı etkinleştirmeden çalıştır
uv tool install ruff              # pipx karşılığı</pre>
<h3>6. poetry</h3>
<pre class="code">pipx install poetry
poetry new ilgaz-bank   # ya da mevcut projede: poetry init
poetry add pandas@^2.2    # ^2.2 = &gt;=2.2,&lt;3.0
poetry add --group dev pytest
poetry install            # poetry.lock'tan kur
poetry lock               # kilidi yenile
poetry run pytest
poetry env info --path    # ortamın yeri
poetry export -f requirements.txt -o requirements.txt   # (poetry-plugin-export gerekir)</pre>
<h3>7. conda (Anaconda / Miniconda / Miniforge)</h3>
<p>Conda yalnız Python paketlerini değil, C/C++ kütüphaneleri ve hatta Python'ın kendisini yönetir; GDAL, CUDA gibi derlenmiş bağımlılıklarda ve veri bilimi ekiplerinde yaygındır. Kurumsal lisans koşulları nedeniyle birçok şirket varsayılan kanal yerine <code>conda-forge</code> ve Miniforge kullanır.</p>
<pre class="code">conda create -n anadolu python=3.12 pandas -c conda-forge
conda activate anadolu            # çıkış: conda deactivate
conda install -c conda-forge scikit-learn
conda env export --from-history &gt; environment.yml   # yalnız senin istediklerin
conda env create -f environment.yml
conda env list
conda remove -n anadolu --all

# environment.yml
name: anadolu
channels: [conda-forge]
dependencies:
  - python=3.12
  - pandas&gt;=2.2
  - pip
  - pip:
      - rich==13.9.4       # conda'da olmayanlar en sonda pip ile</pre>
<div class="tip"><b>conda + pip karışımı</b>Önce conda ile olabildiğince çok paket kur, en son pip ile kalanları; tersini yaparsan conda pip'in kurduğunu bilmeden üzerine yazabilir. venv ile conda ortamını iç içe etkinleştirme.</div>
<h3>8. pipx: komut satırı araçları için</h3>
<pre class="code">python -m pip install --user pipx   # Ubuntu: sudo apt install pipx | macOS: brew install pipx
pipx ensurepath                      # ~/.local/bin'i PATH'e ekler; terminali yeniden aç
pipx install ruff                    # her araç kendi izole ortamında
pipx run cowsay "merhaba"            # kurmadan bir kez çalıştır
pipx upgrade-all
pipx list</pre>
<div class="tbl-wrap"><table><tr><th>Araç</th><th>En iyi olduğu iş</th><th>Kilit dosyası</th></tr><tr><td>venv + pip</td><td>Her yerde var, öğrenme ve basit projeler</td><td>requirements.txt (freeze)</td></tr><tr><td>pip-tools</td><td>pip akışını bozmadan sağlam kilit</td><td>requirements.txt (compile)</td></tr><tr><td>uv</td><td>Hız, Python sürümü + ortam + kilit tek araçta</td><td>uv.lock</td></tr><tr><td>poetry</td><td>Kütüphane yayımlama, grup bağımlılıkları</td><td>poetry.lock</td></tr><tr><td>conda</td><td>Derlenmiş bilimsel/GPU bağımlılıkları</td><td>environment.yml (+ conda-lock)</td></tr><tr><td>pipx / uv tool</td><td>Global CLI araçları (ruff, black, httpie)</td><td>gerekmez</td></tr></table></div>
<h3>9. Sık hatalar: PEP 668, SSL, proxy, sürüm çakışması</h3>
<p><b>PEP 668 – <code>error: externally-managed-environment</code>.</b> Ubuntu 23.04+, Debian 12+, Fedora ve Homebrew Python'ı sistem paket yöneticisine aittir; pip ile global kurulum engellenir. Çözüm her zaman bir sanal ortam (proje için) ya da pipx (araç için) kullanmaktır. <code>--break-system-packages</code> bayrağı adının söylediğini yapar: işletim sistemi araçlarını bozabilir.</p>
<p><b>SSL – <code>CERTIFICATE_VERIFY_FAILED</code>.</b> Kurumsal ağlarda güvenlik cihazı trafiği kendi sertifikasıyla yeniden imzalar. Doğru çözüm şirketin kök sertifikasını tanıtmaktır; doğrulamayı kapatmak değil.</p>
<pre class="code">python -m pip install --upgrade pip              # pip 24.2+ sistem sertifika deposunu (truststore) kullanır
python -m pip config set global.cert C:\\sertifikalar\\sirket-kok.pem
# ya da ortam değişkeniyle (PowerShell: $env:PIP_CERT = "...")
export PIP_CERT=/etc/ssl/certs/sirket-kok.pem
export REQUESTS_CA_BUNDLE=/etc/ssl/certs/sirket-kok.pem   # requests/httpx için
# macOS python.org kurulumunda: "Install Certificates.command" dosyasını çalıştır

# Proxy: 407 Proxy Authentication Required / ProxyError
export HTTPS_PROXY=http://kullanici:parola@proxy.sirket.local:8080
python -m pip install --proxy http://proxy.sirket.local:8080 pandas
# Şirket içi ayna (Artifactory/Nexus)
python -m pip config set global.index-url https://nexus.sirket.local/repository/pypi/simple</pre>
<div class="warn"><b>--trusted-host son çaredir</b><code>--trusted-host pypi.org</code> o sunucu için sertifika doğrulamasını kapatır; araya giren herkes sahte paket verebilir. Yalnızca BT ekibinin bildiği şirket içi bir aynada, geçici olarak kullan.</div>
<div class="tbl-wrap"><table><tr><th>Belirti</th><th>Neden</th><th>Çözüm</th></tr><tr><td><code>ResolutionImpossible</code>, "conflicting dependencies"</td><td>İki paket aynı bağımlılığın uyuşmaz aralıklarını istiyor</td><td>Hatadaki "requires" satırlarını oku; birini güncelle/düşür, gereksiz sabit (==) sürümleri gevşet</td></tr><tr><td>"pandas 2.2.3 has requirement numpy&gt;=1.26, but you have numpy 1.24"</td><td>Elle kurulan eski sürüm</td><td><code>pip install -U numpy</code>, sonra <code>pip check</code></td></tr><tr><td><code>No matching distribution found for X==9.9</code></td><td>Sürüm yok ya da Python sürümünle uyumlu wheel yok</td><td><code>pip index versions X</code>; Python sürümünü kontrol et</td></tr><tr><td><code>ModuleNotFoundError</code> ama "Requirement already satisfied"</td><td>Paket başka bir Python'a kurulu</td><td><code>python -m pip</code> kullan; editörde yorumlayıcıyı .venv seç</td></tr><tr><td><code>error: Microsoft Visual C++ 14.0 is required</code></td><td>Wheel yok, kaynak derleniyor</td><td>pip'i güncelle, wheel olan sürümü seç ya da conda</td></tr><tr><td><code>Permission denied</code> / <code>[Errno 13]</code></td><td>Sistem klasörüne yazma</td><td><code>sudo pip</code> değil: sanal ortam</td></tr><tr><td>Yükseltme sonrası her şey bozuldu</td><td>Kilit yoktu, her şey en yeni geldi</td><td>Önceki kilitten kur; pip-tools/uv ile kilit tut</td></tr></table></div>
<p>Uzun bir <code>ResolutionImpossible</code> çıktısında asıl bilgi "X depends on Y" satırlarındadır. Onları ayıklayıp aynı paketi kimin hangi aralıkla istediğini yan yana görmek çakışmayı hemen ortaya çıkarır:</p>
<pre class="py">import re
from collections import defaultdict

hata = """ERROR: Cannot install anadolu-rapor and eski-grafik because these package versions have conflicting dependencies.
The conflict is caused by:
    anadolu-rapor 1.4.0 depends on numpy&gt;=2.0
    eski-grafik 0.9.1 depends on numpy&lt;1.25
    anadolu-rapor 1.4.0 depends on pandas&gt;=2.2
ERROR: ResolutionImpossible"""

isteyenler = defaultdict(list)
for kim, surum, paket, kosul in re.findall(r"([\\w.-]+) ([\\d.]+) depends on ([\\w.-]+)(\\S*)", hata):
    isteyenler[paket].append(f"{kim} {surum} -&gt; {kosul or 'herhangi'}")
for paket, liste in isteyenler.items():
    isaret = "ÇAKIŞMA ADAYI" if len(liste) &gt; 1 else "tamam"
    print(f"{paket}: {isaret}")
    for satir in liste:
        print("   ", satir)</pre>
<div class="note"><b>Gerçek işte</b>Ilgaz Bank'ın veri ekibinde yeni gelen birinin ilk günü şu üç komutla başlar: depoyu klonla, <code>uv sync --locked</code>, <code>uv run pytest</code>. Kilit dosyası depodadır; CI aynı kilitle kurar, böylece "bende çalışıyor" tartışması biter. Bağımlılık güncellemeleri haftalık ayrı bir PR'da yapılır (Dependabot/Renovate), testler geçerse birleştirilir. Kurumsal ağda pip ayarları (<code>index-url</code>, <code>cert</code>) BT tarafından <code>pip.conf</code>/<code>pip.ini</code> ile dağıtılır; sen yalnızca <code>python -m pip config list</code> ile hangi ayarın etkin olduğunu kontrol edersin.</div>
`,
  ex: [
    {
      t: 'mc',
      stage: 'Isınma',
      q: 'Windows PowerShell\'de <code>.venv\\Scripts\\Activate.ps1</code> çalıştırınca <i>"running scripts is disabled on this system"</i> hatası alıyorsun. En uygun çözüm hangisidir?',
      o: ['Python\'ı yönetici olarak yeniden kurmak', 'Set-ExecutionPolicy -Scope CurrentUser RemoteSigned', '.venv klasörünü silip pip install -g ile kurmak', 'Activate.ps1 dosyasını Not Defteri\'nde açmak'],
      a: 1,
      why: 'PowerShell yürütme ilkesi yerel betikleri engelliyor. Yalnızca kendi kullanıcın için RemoteSigned yapmak yerel betiklere izin verir, yönetici yetkisi gerekmez. Alternatif: cmd\'de activate.bat ya da hiç etkinleştirmeden .venv\\Scripts\\python.exe kullanmak.'
    },
    {
      t: 'mc',
      stage: 'Isınma',
      q: 'Ubuntu 24.04\'te <code>pip install pandas</code> yazınca <code>error: externally-managed-environment</code> alıyorsun. Proje için doğru yaklaşım hangisidir?',
      o: ['pip install --break-system-packages pandas', 'sudo pip install pandas', 'python3 -m venv .venv ile ortam kurup içine kurmak', 'pip.conf dosyasını silip pip install --user pandas ile yeniden denemek'],
      a: 2,
      why: 'PEP 668, işletim sisteminin Python\'ını sistem paket yöneticisine ayırır. Proje bağımlılıkları sanal ortama kurulur; komut satırı araçları için pipx kullanılır. --break-system-packages ve sudo pip sistem araçlarını bozabilir.'
    },
    {
      t: 'predict',
      stage: 'Kodu oku',
      q: 'Bu kod ne yazdırır?',
      code: 'import shlex\nkomut = \'python -m pip install "pandas>=2.2,<3" -c constraints.txt\'\nparcalar = shlex.split(komut)\nprint(len(parcalar), parcalar[4])\n',
      o: ['7 pandas>=2.2,<3', '7 "pandas>=2.2,<3"', '6 pandas>=2.2,<3', '8 pandas>=2.2,'],
      a: 0,
      why: 'shlex.split kabuk kurallarıyla böler: tırnak içindeki metin tek parça olur ve tırnaklar atılır. Parçalar: python, -m, pip, install, pandas>=2.2,<3, -c, constraints.txt (7 adet). Tırnak olmasaydı kabuk < işaretini dosya yönlendirmesi sanardı.'
    },
    {
      t: 'predict',
      stage: 'Kodu oku',
      q: 'Bu kod ne yazdırır?',
      code: 'freeze = """numpy==2.1.3\n-e git+https://github.com/anadolu/rapor.git@a1b2#egg=rapor\npandas==2.2.3\nyerel-lib @ file:///home/ayse/yerel_lib\n"""\nsabit = {}\nfor satir in freeze.splitlines():\n    if "==" in satir:\n        ad, surum = satir.split("==")\n        sabit[ad] = surum\nprint(len(sabit), sorted(sabit))\n',
      o: ['4 [\'numpy\', \'pandas\', \'rapor\', \'yerel-lib\']', '2 [\'numpy\', \'pandas\']', '3 [\'numpy\', \'pandas\', \'rapor\']', 'ValueError'],
      a: 1,
      why: 'Yalnızca == içeren iki satır sözlüğe girer. Düzenlenebilir (-e) ve doğrudan URL (@ file://) satırları pip freeze çıktısında sürüm numarası olmadan görünür; başka bir makinede bu yollar çalışmayabilir, dikkat etmek gerekir.'
    },
    {
      t: 'predict',
      stage: 'Kodu oku',
      q: 'Bu kod ne yazdırır?',
      code: 'surumler = ["1.10.0", "1.9.2", "1.2", "2.0.0rc1"]\nprint(max(surumler), sorted(surumler)[0])\n',
      o: ['2.0.0rc1 1.2', '1.10.0 1.2', '2.0.0rc1 1.10.0', '1.10.0 1.9.2'],
      a: 2,
      why: 'Metinler karakter karakter karşılaştırılır: "2" en büyük ilk karakter olduğu için max "2.0.0rc1" olur. sorted sonucu "1.10.0" ile başlar çünkü "1.1" &lt; "1.2" &lt; "1.9". Sürümleri sayı demetlerine çevirmeden (ya da packaging.version kullanmadan) karşılaştırma.'
    },
    {
      t: 'order',
      stage: 'Kodu oku',
      q: '<p>requirements listesine constraints dosyasındaki sabit sürümleri uygulayan kodun satırlarını sırala (constraints\'te olup requirements\'ta olmayan paket eklenmez).</p>',
      lines: ['def uygula(gereksinim, kisit):', '    sonuc = []', '    for g in gereksinim:', '        ad = g.split(">")[0].split("=")[0].split("<")[0]', '        sonuc.append(ad + kisit.get(ad, ""))', '    return sonuc', 'print(uygula(["pandas>=2.2", "requests"], {"pandas": "==2.2.3", "django": "==5.1.4"}))'],
      expect: '[\'pandas==2.2.3\', \'requests\']\n',
      hint: 'Fonksiyon başlığı, boş liste, döngü; döngü içinde önce adı çıkar, sonra ekle; return döngüden sonra.',
      why: 'Constraints yalnızca zaten istenen paketlerin sürümünü sabitler; django istenmediği için listeye girmez. Bu, pip install -r requirements.txt -c constraints.txt davranışının basitleştirilmiş hâlidir.'
    },
    {
      t: 'code',
      stage: 'Rehberli',
      id: 'sanal-ortam-pip-x1',
      diff: 1,
      q: '<p>Ekip wiki\'si için yardımcı: <code>aktivasyon(sistem, kabuk, klasor=".venv")</code> doğru etkinleştirme komutunu döndürsün. Kurallar: <code>sistem</code> "windows" iken kabuk "powershell" → <code>.venv\\Scripts\\Activate.ps1</code>, "cmd" → <code>.venv\\Scripts\\activate.bat</code>, "gitbash" → <code>source .venv/Scripts/activate</code>. <code>sistem</code> "linux" ya da "macos" iken "bash"/"zsh" → <code>source .venv/bin/activate</code>, "fish" → <code>source .venv/bin/activate.fish</code>. <code>sistem</code> ve <code>kabuk</code> harf duyarsız olsun; tanınmayan birleşimde <code>ValueError</code>. Klasör adı parametreden gelsin.</p>',
      guide: ['sistem ve kabuğu lower() ile normalleştir.', 'Windows\'ta yol ayırıcı ters eğik çizgi (Git Bash hariç), dizin adı Scripts.', 'Linux/macOS\'ta dizin adı bin; bash ve zsh aynı komutu kullanır.', 'Hiçbir koşul tutmazsa raise ValueError.'],
      example: '# Benzer teknik: sisteme göre Python çağırma komutu\ndef python_komutu(sistem):\n    sistem = sistem.lower()\n    if sistem == "windows":\n        return "py -3.12"\n    if sistem in ("linux", "macos"):\n        return "python3"\n    raise ValueError(sistem)\nprint(python_komutu("Windows"), "|", python_komutu("macOS"))\n',
      start: 'def aktivasyon(sistem, kabuk, klasor=".venv"):\n    sistem, kabuk = sistem.lower(), kabuk.lower()\n    if sistem == "windows":\n        # TODO: powershell, cmd, gitbash\n        pass\n    # TODO: linux/macos için bash, zsh, fish\n    raise ValueError(f"desteklenmeyen: {sistem}/{kabuk}")\n',
      sol: 'def aktivasyon(sistem, kabuk, klasor=".venv"):\n    sistem, kabuk = sistem.lower(), kabuk.lower()\n    if sistem == "windows":\n        if kabuk == "powershell":\n            return klasor + "\\\\Scripts\\\\Activate.ps1"\n        if kabuk == "cmd":\n            return klasor + "\\\\Scripts\\\\activate.bat"\n        if kabuk == "gitbash":\n            return f"source {klasor}/Scripts/activate"\n    elif sistem in ("linux", "macos"):\n        if kabuk in ("bash", "zsh"):\n            return f"source {klasor}/bin/activate"\n        if kabuk == "fish":\n            return f"source {klasor}/bin/activate.fish"\n    raise ValueError(f"desteklenmeyen: {sistem}/{kabuk}")\n',
      tests: 'assert aktivasyon("Windows", "PowerShell") == ".venv\\\\Scripts\\\\Activate.ps1", "PowerShell komutu yanlış"\nassert aktivasyon("windows", "cmd") == ".venv\\\\Scripts\\\\activate.bat", "cmd komutu yanlış"\nassert aktivasyon("windows", "gitbash") == "source .venv/Scripts/activate", "Git Bash ileri eğik çizgi ve source kullanır"\nassert aktivasyon("linux", "bash") == aktivasyon("macOS", "zsh") == "source .venv/bin/activate", "bash/zsh aynı"\nassert aktivasyon("macos", "fish", "env") == "source env/bin/activate.fish", "klasör adı parametreden gelmeli"\nfor _s, _k in (("linux", "cmd"), ("bsd", "bash"), ("windows", "fish")):\n    try:\n        aktivasyon(_s, _k)\n    except ValueError:\n        pass\n    else:\n        raise AssertionError(f"{_s}/{_k} ValueError vermeli")\n',
      hints: ['Python metninde tek ters eğik çizgi için "\\\\" yazılır.', 'Windows dalında üç, Linux/macOS dalında iki kontrol var.', 'f"source {klasor}/bin/activate"'],
      why: 'Etkinleştirme betikleri işletim sistemine ve kabuğa göre farklı klasörde ve uzantıda durur: Windows\'ta Scripts, POSIX\'te bin. Git Bash Windows üzerinde çalışsa da POSIX sözdizimi kullanır. Python metinlerinde ters eğik çizgi kaçırılmalıdır.'
    },
    {
      t: 'code',
      stage: 'Rehberli',
      id: 'sanal-ortam-pip-x2',
      diff: 2,
      q: '<p><code>freeze_ayristir(metin)</code> yaz: <code>pip freeze</code> çıktısını okuyup <code>(sabit, diger)</code> döndürsün. <code>sabit</code>: <code>ad==sürüm</code> satırlarından <b>normalleştirilmiş ad</b> → sürüm sözlüğü (ad küçük harf, <code>_</code> ve <code>.</code> yerine <code>-</code>). <code>diger</code>: <code>-e</code> ile başlayan ya da <code> @ </code> içeren satırların (kırpılmış) listesi. Boş satırlar ve <code>#</code> yorumları atlanır.</p>',
      guide: ['splitlines ile dön, her satırı strip et; boş ya da # ile başlayanı atla.', 'Satır "-e" ile başlıyorsa ya da " @ " içeriyorsa diger\'e ekle ve devam et.', '"==" içeriyorsa partition("==") ile ad ve sürümü ayır.', 'Adı re.sub(r"[-_.]+", "-", ad).lower() ile normalleştir.'],
      example: 'import re\nfor ad in ["Typing_Extensions", "zope.interface", "Django"]:\n    print(ad, "->", re.sub(r"[-_.]+", "-", ad).lower())\n',
      start: 'import re\n\ndef freeze_ayristir(metin):\n    sabit, diger = {}, []\n    for satir in metin.splitlines():\n        satir = satir.strip()\n        # TODO: boş ve yorum satırlarını atla\n        # TODO: -e ve @ satırlarını diger\'e ekle\n        # TODO: ad==sürüm satırlarını normalleştirerek sabit\'e ekle\n    return sabit, diger\n',
      sol: 'import re\n\ndef freeze_ayristir(metin):\n    sabit, diger = {}, []\n    for satir in metin.splitlines():\n        satir = satir.strip()\n        if not satir or satir.startswith("#"):\n            continue\n        if satir.startswith("-e") or " @ " in satir:\n            diger.append(satir)\n            continue\n        if "==" in satir:\n            ad, _, surum = satir.partition("==")\n            sabit[re.sub(r"[-_.]+", "-", ad).lower()] = surum\n    return sabit, diger\n',
      tests: '_f = """# pip freeze çıktısı\nDjango==5.1.4\ntyping_extensions==4.12.2\n\nzope.interface==7.1\n-e git+https://github.com/anadolu/rapor.git@a1b2#egg=rapor\nyerel-lib @ file:///home/ayse/yerel_lib\n"""\n_s, _d = freeze_ayristir(_f)\nassert _s == {"django": "5.1.4", "typing-extensions": "4.12.2", "zope-interface": "7.1"}, f"sabit sözlük yanlış: {_s}"\nassert _d == ["-e git+https://github.com/anadolu/rapor.git@a1b2#egg=rapor", "yerel-lib @ file:///home/ayse/yerel_lib"], f"diger yanlış: {_d}"\nassert freeze_ayristir("") == ({}, []), "boş çıktı"\n',
      hints: ['" @ " kontrolünü "==" kontrolünden önce yap.', 'ad, _, surum = satir.partition("==")', 'sabit[re.sub(r"[-_.]+", "-", ad).lower()] = surum'],
      why: 'PyPI paket adlarında büyük-küçük harf, alt çizgi, nokta ve tire eşdeğerdir (PEP 503 normalleştirmesi). Düzenlenebilir ve URL\'li kurulumlar başka makinede yeniden üretilemeyebileceği için ayrı raporlanmalıdır.'
    },
    {
      t: 'code',
      stage: 'Rehberli',
      id: 'sanal-ortam-pip-x3',
      diff: 2,
      q: '<p><code>kisit_uygula(gereksinimler, kisitlar)</code> yaz. <code>gereksinimler</code> <code>["pandas&gt;=2.2", "Requests", "rich==13.9.4"]</code> gibi satırların listesi; <code>kisitlar</code> <code>"ad==sürüm"</code> satırlarının listesi. Her gereksinim için paket adını (ilk <code>&lt; &gt; = ! ~</code> karakterine kadar, kırpılmış) bul; kısıtlarda (harf duyarsız) varsa sonuç satırı <code>"ad==sürüm"</code> olsun (kısıttaki sürüm, gereksinimdeki adla), yoksa gereksinim aynen kalsın. Kısıtta olup gereksinimde olmayan paket <b>eklenmesin</b>.</p>',
      guide: ['Önce kısıtlardan {ad.lower(): sürüm} sözlüğü kur (partition("==")).', 'Gereksinim adını re.split(r"[<>=!~]", satir, maxsplit=1)[0].strip() ile al.', 'Ad sözlükte varsa f"{ad}=={surum}", yoksa satırın kendisi.', 'Yalnızca gereksinimlerde dön; kısıtlarda değil.'],
      example: 'import re\nfor s in ["numpy>=1.26", "httpx", "rich ~= 13.0"]:\n    print(repr(re.split(r"[<>=!~]", s, maxsplit=1)[0].strip()))\n',
      start: 'import re\n\ndef kisit_uygula(gereksinimler, kisitlar):\n    sabit = {}\n    # TODO: kısıtlardan ad -> sürüm sözlüğü\n    sonuc = []\n    # TODO: her gereksinimin adını bul, kısıt varsa uygula\n    return sonuc\n',
      sol: 'import re\n\ndef kisit_uygula(gereksinimler, kisitlar):\n    sabit = {}\n    for k in kisitlar:\n        ad, _, surum = k.partition("==")\n        sabit[ad.strip().lower()] = surum.strip()\n    sonuc = []\n    for g in gereksinimler:\n        ad = re.split(r"[<>=!~]", g, maxsplit=1)[0].strip()\n        if ad.lower() in sabit:\n            sonuc.append(f"{ad}=={sabit[ad.lower()]}")\n        else:\n            sonuc.append(g)\n    return sonuc\n',
      tests: '_g = ["pandas>=2.2", "Requests", "rich==13.9.4", "httpx"]\n_k = ["pandas==2.2.3", "requests==2.32.3", "django==5.1.4", "numpy==2.1.3"]\n_r = kisit_uygula(_g, _k)\nassert _r == ["pandas==2.2.3", "Requests==2.32.3", "rich==13.9.4", "httpx"], f"yanlış: {_r}"\nassert not any("django" in x for x in _r), "kısıttaki django kurulmamalı (eklenmemeli)"\nassert kisit_uygula([], _k) == [], "gereksinim yoksa hiçbir şey kurulmaz"\n',
      hints: ['Kısıt sözlüğünün anahtarları küçük harf olsun; aramayı da küçük harfle yap.', 're.split(r"[<>=!~]", g, maxsplit=1)[0].strip()', 'Sonuç listesini gereksinimler üzerinde dönerek kur; kısıtlar yalnızca sözlükte kullanılır.'],
      why: 'Constraints dosyası "ne kurulacağını" değil "kurulursa hangi sürümün kullanılacağını" söyler. Bu yüzden şirket genelinde tek bir constraints dosyası yüzlerce paketi içerse de her proje yalnızca kendi istediklerini kurar.'
    },
    {
      t: 'code',
      stage: 'Kendin yaz',
      id: 'sanal-ortam-pip-x4',
      diff: 2,
      q: '<p>Destek ekibi için <code>pip_teshis(cikti)</code> yaz: pip hata çıktısındaki ipuçlarına göre şu anahtarlardan birini döndürsün (ilk eşleşen kural, yukarıdan aşağı, harf duyarsız): <code>"externally-managed-environment"</code> → <code>"pep668"</code>; <code>"certificate_verify_failed"</code> ya da <code>"ssl:"</code> → <code>"ssl"</code>; <code>"proxyerror"</code> ya da <code>"407"</code> → <code>"proxy"</code>; <code>"resolutionimpossible"</code> ya da <code>"conflicting dependencies"</code> → <code>"cakisma"</code>; <code>"no matching distribution"</code> → <code>"surum_yok"</code>; <code>"permission denied"</code> ya da <code>"errno 13"</code> → <code>"izin"</code>; hiçbiri → <code>"bilinmiyor"</code>.</p>',
      start: 'def pip_teshis(cikti):\n    pass\n',
      sol: 'KURALLAR = [\n    (("externally-managed-environment",), "pep668"),\n    (("certificate_verify_failed", "ssl:"), "ssl"),\n    (("proxyerror", "407"), "proxy"),\n    (("resolutionimpossible", "conflicting dependencies"), "cakisma"),\n    (("no matching distribution",), "surum_yok"),\n    (("permission denied", "errno 13"), "izin"),\n]\n\ndef pip_teshis(cikti):\n    kucuk = cikti.lower()\n    for ipuclari, anahtar in KURALLAR:\n        if any(i in kucuk for i in ipuclari):\n            return anahtar\n    return "bilinmiyor"\n',
      tests: '_v = {\n    "error: externally-managed-environment\\n× This environment is externally managed": "pep668",\n    "SSLError(SSLCertVerificationError(1, \'[SSL: CERTIFICATE_VERIFY_FAILED] certificate verify failed\'))": "ssl",\n    "ProxyError(\'Cannot connect to proxy.\', OSError(\'Tunnel connection failed: 407 Proxy Authentication Required\'))": "proxy",\n    "ERROR: ResolutionImpossible: for help visit https://pip.pypa.io/...": "cakisma",\n    "ERROR: Cannot install a and b because these package versions have conflicting dependencies.": "cakisma",\n    "ERROR: No matching distribution found for pandas==9.9": "surum_yok",\n    "ERROR: Could not install packages due to an OSError: [Errno 13] Permission denied: \'/usr/lib/python3\'": "izin",\n    "Successfully installed rich-13.9.4": "bilinmiyor",\n}\nfor _c, _b in _v.items():\n    assert pip_teshis(_c) == _b, f"{_c[:50]!r}... için {_b!r} beklenir, gelen {pip_teshis(_c)!r}"\n',
      hints: ['Kuralları (ipuçları, anahtar) çiftlerinin listesi olarak tut; sıra önemli.', 'Çıktıyı bir kez lower() yap, any(i in kucuk for i in ipuclari) ile ara.'],
      why: 'Kural tablosu (veri) ile eşleştirme mantığını (kod) ayırmak yeni hata türü eklemeyi kolaylaştırır. Proxy hatası "SSL" kelimesi de içerebildiğinden sıra bilinçli seçilmelidir; ilk eşleşen kazanır.'
    },
    {
      t: 'code',
      stage: 'Kendin yaz',
      id: 'sanal-ortam-pip-x5',
      diff: 2,
      q: '<p><code>pip list --outdated</code> benzeri bir rapor yaz: <code>eskiler(kurulu, en_yeni)</code>. İki sözlük de <code>ad → "X.Y.Z"</code> biçiminde. Kurulu sürümü en yeniden <b>küçük</b> olan paketler için <code>(ad, kurulu, yeni, tur)</code> demetlerinin ada göre sıralı listesini döndür. <code>tur</code>: ilk sayı değiştiyse <code>"major"</code>, değilse ikinci değiştiyse <code>"minor"</code>, değilse <code>"patch"</code>. Sürümleri sayı demetiyle karşılaştır (eksik parça 0). <code>en_yeni</code>\'de olmayan paketleri atla.</p>',
      start: 'def eskiler(kurulu, en_yeni):\n    pass\n',
      sol: 'def _demet(s):\n    p = [int(x) for x in s.split(".")]\n    return tuple(p + [0] * (3 - len(p)))\n\ndef eskiler(kurulu, en_yeni):\n    sonuc = []\n    for ad in sorted(kurulu):\n        if ad not in en_yeni:\n            continue\n        a, b = _demet(kurulu[ad]), _demet(en_yeni[ad])\n        if a < b:\n            tur = "major" if a[0] != b[0] else "minor" if a[1] != b[1] else "patch"\n            sonuc.append((ad, kurulu[ad], en_yeni[ad], tur))\n    return sonuc\n',
      tests: '_k = {"pandas": "2.2.3", "numpy": "1.26.4", "rich": "13.9", "httpx": "0.27.0", "yerel": "1.0"}\n_y = {"pandas": "2.2.10", "numpy": "2.1.3", "rich": "13.9.4", "httpx": "0.28.1"}\nassert eskiler(_k, _y) == [("httpx", "0.27.0", "0.28.1", "minor"), ("numpy", "1.26.4", "2.1.3", "major"), ("pandas", "2.2.3", "2.2.10", "patch"), ("rich", "13.9", "13.9.4", "patch")], f"yanlış: {eskiler(_k, _y)}"\nassert eskiler({"a": "1.10.0"}, {"a": "1.9.0"}) == [], "1.10 > 1.9: metin değil sayı karşılaştırması"\nassert eskiler({"a": "1.0"}, {"a": "1.0.0"}) == [], "1.0 ile 1.0.0 eşittir"\n',
      hints: ['Sürümü (major, minor, patch) tam sayı demetine çevir; eksik parçaları 0 ile doldur.', 'Demetler soldan sağa karşılaştırılır: (1, 10, 0) > (1, 9, 0).'],
      why: 'Güncelleme türünü bilmek risk değerlendirmesidir: semver\'de major sürüm geriye uyumsuz değişiklik içerebilir, ayrı PR ve dikkatli test ister; patch güncellemeleri genelde güvenlidir.'
    },
    {
      t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      id: 'sanal-ortam-pip-x6',
      diff: 2,
      q: '<p>Betiğin başındaki koruma, sanal ortam dışında çalıştırılırsa uyarmalı. Ama yalnızca klasör adı "venv" olanları tanıyor; <code>.venv</code>, <code>env</code> ya da conda ortamlarında yanlış sonuç veriyor, sistemin kendi Python\'ı "venv" içeren bir yolda kuruluysa da yanılıyor. <code>sanal_ortamda_mi(prefix, base_prefix, executable)</code> fonksiyonundaki <b>hatayı bul ve düzelt</b>: Python\'ın resmi ölçütünü kullan (venv içinde <code>sys.prefix</code>, <code>sys.base_prefix</code>\'ten farklıdır).</p>',
      start: 'import sys\n\ndef sanal_ortamda_mi(prefix=sys.prefix, base_prefix=sys.base_prefix, executable=sys.executable):\n    return "venv" in executable.replace("\\\\", "/").split("/")\n',
      sol: 'import sys\n\ndef sanal_ortamda_mi(prefix=sys.prefix, base_prefix=sys.base_prefix, executable=sys.executable):\n    return prefix != base_prefix\n',
      tests: 'assert sanal_ortamda_mi("/proje/.venv", "/usr", "/proje/.venv/bin/python") is True, ".venv klasörü sanal ortamdır"\nassert sanal_ortamda_mi("C:\\\\proje\\\\env", "C:\\\\Python312", "C:\\\\proje\\\\env\\\\Scripts\\\\python.exe") is True, "env adlı klasör de sanal ortamdır"\nassert sanal_ortamda_mi("/opt/venv", "/opt/venv", "/opt/venv/bin/python") is False, "prefix == base_prefix ise sanal ortam değildir (yol adı venv olsa bile)"\nassert sanal_ortamda_mi("/usr", "/usr", "/usr/bin/python3") is False, "sistem Python\'ı"\n',
      hints: ['Klasör adına bakmak kırılgandır: ad her şey olabilir.', 'venv modülü sys.prefix\'i ortam klasörüne ayarlar, base_prefix ana kurulumu gösterir.', 'return prefix != base_prefix'],
      why: 'Sanal ortamın adı serbesttir (.venv, env, proje-ortami); adla tespit hem yanlış negatif hem yanlış pozitif üretir. Python\'ın kendisi venv içindeyken sys.prefix ile sys.base_prefix\'i ayırır; resmi ve taşınabilir ölçüt budur.'
    },
    {
      t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      id: 'sanal-ortam-pip-x7',
      diff: 2,
      q: '<p>Bağımlılık denetim aracı, requirements\'taki <code>typing_extensions</code> ile kurulu <code>typing-extensions</code>\'ı farklı paket sanıp "kurulu değil" diyor. <code>ayni_paket(a, b)</code> fonksiyonundaki <b>hatayı bul ve düzelt</b>: PyPI kurallarına göre adlar büyük-küçük harf, <code>-</code>, <code>_</code> ve <code>.</code> farklarından bağımsız eşittir (art arda gelen ayırıcılar tek ayırıcı sayılır).</p>',
      start: 'def ayni_paket(a, b):\n    return a.strip().lower() == b.strip().lower()\n',
      sol: 'import re\n\ndef _normal(ad):\n    return re.sub(r"[-_.]+", "-", ad.strip()).lower()\n\ndef ayni_paket(a, b):\n    return _normal(a) == _normal(b)\n',
      tests: 'assert ayni_paket("typing_extensions", "typing-extensions"), "_ ve - eşdeğer"\nassert ayni_paket("Zope.Interface", "zope-interface"), ". ve - eşdeğer, harf duyarsız"\nassert ayni_paket("my__pkg", "my-pkg"), "art arda ayırıcılar tek ayırıcı sayılır"\nassert ayni_paket(" Django ", "django"), "boşluklar kırpılır"\nassert not ayni_paket("pandas", "pandas-stubs"), "farklı paketler eşit sayılmamalı"\n',
      hints: ['Yalnızca lower() yetmez; ayırıcıları da tek tipe çevirmen gerek.', 're.sub(r"[-_.]+", "-", ad)'],
      why: 'PEP 503 normalleştirmesi: ad küçük harfe çevrilir ve -, _, . karakterlerinden oluşan her dizi tek tireye dönüşür. pip, uv ve PyPI paketleri bu kurala göre eşleştirir; kendi araçların da aynısını yapmalı.'
    },
    {
      t: 'code',
      stage: 'Meydan okuma',
      id: 'sanal-ortam-pip-x8',
      diff: 3,
      q: '<p>Basit bir çözümleyici (resolver) yaz: <code>coz(kosullar, mevcut)</code>. <code>kosullar</code> bir paket için farklı bağımlılıklardan gelen koşul metinleri listesi (ör. <code>["&gt;=1.26", "&lt;2.1", "!=2.0.1"]</code>; işleçler <code>&gt;= &lt;= &gt; &lt; == !=</code>), <code>mevcut</code> ise PyPI\'daki sürümlerin listesi (sırasız). Tüm koşulları sağlayan <b>en yüksek</b> sürümü döndür; yoksa <code>None</code> (ResolutionImpossible). Sürümleri sayı demetiyle karşılaştır (eksik parça 0).</p>',
      start: 'def coz(kosullar, mevcut):\n    return max(mevcut)\n',
      sol: 'import operator, re\n\nISLEC = {">=": operator.ge, "<=": operator.le, ">": operator.gt, "<": operator.lt, "==": operator.eq, "!=": operator.ne}\n\ndef _demet(s):\n    p = [int(x) for x in s.strip().split(".")]\n    return tuple(p + [0] * (4 - len(p)))\n\ndef _sagla(surum, kosul):\n    m = re.match(r"\\s*(>=|<=|==|!=|>|<)\\s*(.+)", kosul)\n    return ISLEC[m.group(1)](_demet(surum), _demet(m.group(2)))\n\ndef coz(kosullar, mevcut):\n    adaylar = [s for s in mevcut if all(_sagla(s, k) for k in kosullar)]\n    return max(adaylar, key=_demet) if adaylar else None\n',
      tests: '_m = ["1.24.4", "1.26.4", "2.0.0", "2.0.1", "2.1.3", "1.9.0", "2.0.2"]\nassert coz([">=1.26", "<2.1", "!=2.0.1"], _m) == "2.0.2", "2.0.2 tüm koşulları sağlayan en yüksek sürüm"\nassert coz([], _m) == "2.1.3", "koşul yoksa en yüksek sürüm (sayısal: 2.1.3)"\nassert coz(["<1.10"], _m) == "1.9.0", "1.9.0 < 1.10 (metin karşılaştırması yanılır)"\nassert coz([">=2.1", "<2"], _m) is None, "çakışan koşullar None döndürmeli"\nassert coz(["==2.0"], _m) == "2.0.0", "2.0 ile 2.0.0 eşittir"\nassert coz([">= 1.26", "< 2.0"], _m) == "1.26.4", "işleçten sonra boşluk olabilir"\n',
      hints: ['Her koşulu (işleç, sürüm) olarak ayrıştır; iki karakterli işleçleri tek karakterlilerden ÖNCE dene.', 'operator modülündeki ge, lt, ne... fonksiyonlarını bir sözlükte tut.', 'Adayları filtrele, max(..., key=_demet) ile sayısal en yükseği seç; aday yoksa None.'],
      why: 'Gerçek çözümleyiciler (pip\'in resolvelib\'i, uv\'nin PubGrub\'ı) bu işlemi tüm bağımlılık ağacı için geri izlemeyle yapar. Çekirdek fikir aynıdır: tüm koşulların kesişimini bulup en yüksek uygun sürümü seçmek; kesişim boşsa ResolutionImpossible.'
    }
  ],
  faq: [
    {
      q: 'pip, pip-tools, uv, poetry... yeni projede hangisiyle başlamalıyım?',
      a: 'Öğrenirken venv + pip ile başla; mantığı onlar öğretir. Ekip projesinde kilit dosyası şart: bugün en pratik seçenek uv (uv add, uv lock, uv sync); pip akışını bozmak istemeyen ekipler pip-tools, kütüphane yayımlayanlar poetry ya da uv, derlenmiş bilimsel bağımlılıkları olanlar conda kullanır. Hangisini seçersen seç, kilit dosyasını depoya koy.'
    },
    {
      q: 'Şirket ağında pip hiçbir şey indiremiyor, ne yapmalıyım?',
      a: 'Önce hatayı oku: CERTIFICATE_VERIFY_FAILED ise şirket kök sertifikasını pip config set global.cert ile tanıt (pip\'i güncellemek de çoğu zaman çözer); 407 ya da ProxyError ise HTTPS_PROXY ortam değişkenini ya da --proxy seçeneğini ayarla; şirketin Nexus/Artifactory aynası varsa global.index-url olarak ver. BT ekibinden bu üç bilgiyi (sertifika, proxy, ayna) iste; --trusted-host ile doğrulamayı kapatma.'
    }
  ],
  mistakes: [
    {
      bad: 'pip install pandas>=2.2',
      good: 'python -m pip install "pandas>=2.2"',
      why: 'Tırnaksız > işareti kabukta yönlendirmedir: pandas sürümsüz kurulur ve "=2.2" adlı bir dosya oluşur. python -m pip ise paketin doğru yorumlayıcıya kurulmasını garanti eder.'
    },
    {
      bad: 'sudo pip install --break-system-packages rich',
      good: 'python3 -m venv .venv\nsource .venv/bin/activate\npython -m pip install rich\n# araç için: pipx install rich-cli',
      why: 'PEP 668 koruması sistem Python\'ını işletim sistemi araçları için korur; aşmak sistemi bozabilir. Proje paketleri sanal ortama, CLI araçları pipx\'e.'
    }
  ]
});
})(window);
