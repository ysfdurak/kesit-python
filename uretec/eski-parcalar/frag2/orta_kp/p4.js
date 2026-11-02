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
