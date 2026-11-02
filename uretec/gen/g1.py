import sys; sys.path.insert(0, '/tmp/claude-0/-home-claude/6c066959-3fcb-54bb-bdf1-c8ae148dfc4c/scratchpad/gen')
from jsgen import D, write

LID = 'paketleme-dagitim'

HTML = r'''
<h2>Derinleş: PyPI'ye adım adım yayımlama</h2>
<p>Paketi yerelde kurabilmek işin yarısı. Diğer yarısı onu başkalarının <code>pip install anadolu-skor</code> diyerek kurabileceği hale getirmek: doğru derleme arka ucu (build backend) seçmek, dağıtım dosyalarını üretmek, TestPyPI'de prova yapmak, gerçek PyPI'ye yüklemek ve her yayını bir git etiketine bağlamak. Bu bölüm bu zinciri baştan sona yürür. Docker tarafını "Docker ile dağıtım" dersinde, CI iş akışlarını "Kalite ve CI" dersinde ayrıntılı göreceksin; burada yalnızca yayına dokunan kısmı ele alıyoruz.</p>

<h3>1. [build-system]: paketi kim derleyecek?</h3>
<p><code>pip</code> ve <code>python -m build</code> önce <code>[build-system]</code> tablosunu okur (PEP 517/518). <code>requires</code> derleme sırasında geçici ortama kurulacak paketleri, <code>build-backend</code> ise çağrılacak modülü söyler. Bu tablo yoksa araçlar eski setuptools davranışına düşer; uyarı verir ve sonuç tahmin edilemez olur.</p>
<div class="tbl-wrap"><table>
<tr><th>Arka uç</th><th>requires</th><th>build-backend</th><th>Ne zaman?</th></tr>
<tr><td>hatchling</td><td><code>["hatchling"]</code></td><td><code>hatchling.build</code></td><td>Yeni saf Python projeleri; sade ayar, src düzenini kendisi bulur</td></tr>
<tr><td>setuptools</td><td><code>["setuptools&gt;=69"]</code></td><td><code>setuptools.build_meta</code></td><td>Eski projeler, C uzantıları, şirket şablonları</td></tr>
<tr><td>flit-core</td><td><code>["flit_core&gt;=3.9"]</code></td><td><code>flit_core.buildapi</code></td><td>Tek modüllü küçük kütüphaneler</td></tr>
<tr><td>poetry-core</td><td><code>["poetry-core"]</code></td><td><code>poetry.core.masonry.api</code></td><td>Ekip poetry kullanıyorsa</td></tr>
<tr><td>pdm-backend</td><td><code>["pdm-backend"]</code></td><td><code>pdm.backend</code></td><td>pdm iş akışı</td></tr>
</table></div>
<p>Aşağıda hatchling ile yayına hazır bir <code>pyproject.toml</code> var. PyPI sayfasında görünen her şey (açıklama, README, lisans, sınıflandırıcılar, bağlantılar) <code>[project]</code> tablosundan gelir. Sürümü git etiketinden almak için <code>dynamic = ["version"]</code> ve <code>hatch-vcs</code> eklentisi kullanılır.</p>
<pre class="py">import tomllib

PYPROJECT = """
[build-system]
requires = ["hatchling", "hatch-vcs"]
build-backend = "hatchling.build"

[project]
name = "anadolu-skor"
dynamic = ["version"]
description = "Anadolu Bank kredi skoru araçları"
readme = "README.md"
license = "MIT"
requires-python = "&gt;=3.11"
authors = [{name = "Veri Ekibi", email = "veri@example.com"}]
classifiers = ["Programming Language :: Python :: 3", "Operating System :: OS Independent"]
dependencies = ["httpx&gt;=0.27,&lt;1"]

[project.urls]
Homepage = "https://example.com/anadolu-skor"

[project.scripts]
anadolu-skor = "anadolu_skor.cli:main"

[project.entry-points."anadolu_skor.raporlar"]
pdf = "anadolu_skor.rapor:pdf_yaz"

[tool.hatch.version]
source = "vcs"
"""
cfg = tomllib.loads(PYPROJECT)
p = cfg["project"]
print("arka uç:", cfg["build-system"]["build-backend"])
print("dinamik alanlar:", p["dynamic"])
print("komutlar:", p["scripts"])
print("eklenti grupları:", list(p["entry-points"]))</pre>

<h3>2. Dağıtımı üret: python -m build</h3>
<p><code>build</code> paketi, arka ucu yalıtılmış geçici bir ortamda çağırır ve <code>dist/</code> klasörüne iki dosya bırakır: <code>.tar.gz</code> (sdist) ve <code>.whl</code> (wheel). Wheel adı bilgi taşır: <code>ad-sürüm(-derleme)-python-abi-platform.whl</code>. Adın içindeki tireler alt çizgiye çevrilir, çünkü ayırıcı tiredir.</p>
<div class="steps-list"><ol>
<li><code>python -m pip install --upgrade build twine</code> → araçları kur (sanal ortam içinde).</li>
<li><code>rm -rf dist/</code> (Windows: <code>rmdir /s /q dist</code>) → eski sürüm dosyalarını temizle.</li>
<li><code>python -m build</code> → <code>dist/anadolu_skor-1.2.0.tar.gz</code> ve <code>dist/anadolu_skor-1.2.0-py3-none-any.whl</code>.</li>
<li><code>python -m twine check dist/*</code> → README'nin PyPI'de düzgün görüneceğini ve üst verinin geçerli olduğunu denetler; <code>PASSED</code> görmelisin.</li>
<li>Yeni bir sanal ortamda <code>pip install dist/*.whl</code> ve <code>anadolu-skor --help</code> → wheel gerçekten çalışıyor mu?</li>
</ol></div>
<pre class="py">import re

def wheel_oku(dosya):
    govde = dosya.removesuffix(".whl").split("-")
    ad, surum, *orta, py, abi, plat = govde
    return {"ad": ad, "surum": surum, "derleme": orta[0] if orta else None,
            "python": py, "abi": abi, "platform": plat}

for d in ["anadolu_skor-1.2.0-py3-none-any.whl",
          "numpy-2.1.0-cp312-cp312-manylinux_2_17_x86_64.whl"]:
    w = wheel_oku(d)
    saf = w["abi"] == "none" and w["platform"] == "any"
    print(w["ad"], w["surum"], "saf Python" if saf else "platforma özel: " + w["platform"])

# PyPI ad normalleştirmesi (PEP 503): Anadolu_Skor, anadolu.skor ve anadolu-skor AYNI projedir
print({re.sub(r"[-_.]+", "-", a).lower() for a in ["Anadolu_Skor", "anadolu.skor", "anadolu-skor"]})</pre>

<h3>3. Önce TestPyPI, sonra PyPI</h3>
<p>TestPyPI (<code>test.pypi.org</code>) gerçek PyPI'nin ayrı veritabanlı kopyasıdır. Hesabı ayrıdır; orada yaptığın hata gerçek projeyi etkilemez. PyPI'de bir sürüm numarasını <b>bir kez</b> yükleyebilirsin: dosyayı silsen bile aynı numarayı tekrar kullanamazsın. Provayı bu yüzden TestPyPI'de yaparsın.</p>
<pre class="code"># 1) pypi.org ve test.pypi.org'da hesap aç, 2FA'yı aç, Account settings → API tokens → token üret
# 2) TestPyPI'ye yükle (kullanıcı adı: __token__, parola: pypi-... ile başlayan token)
python -m twine upload --repository testpypi dist/*

# 3) Temiz ortamda TestPyPI'den kurmayı dene (bağımlılıklar gerçek PyPI'den gelsin)
python -m pip install --index-url https://test.pypi.org/simple/ --extra-index-url https://pypi.org/simple/ anadolu-skor

# 4) Her şey yolundaysa gerçek PyPI
python -m twine upload dist/*</pre>
<p>Token'ı her seferinde yazmamak için <code>~/.pypirc</code> dosyası kullanılır; dosya izinlerini <code>chmod 600 ~/.pypirc</code> ile kısıtla ve asla git'e koyma. CI'da daha iyisi <b>Trusted Publishing</b>: PyPI proje ayarlarında GitHub deposunu "güvenilir yayıncı" olarak eklersin; iş akışı OIDC ile kısa ömürlü kimlik alır, depoda hiç gizli token tutulmaz.</p>
<pre class="code">[distutils]
index-servers = pypi testpypi

[pypi]
username = __token__
password = pypi-AgEIcHlwaS5vcmc...

[testpypi]
repository = https://test.pypi.org/legacy/
username = __token__
password = pypi-AgENdGVzdC5weXBp...</pre>
<div class="tbl-wrap"><table>
<tr><th>Belirti</th><th>Neden</th><th>Çözüm</th></tr>
<tr><td><code>400 File already exists</code></td><td>Bu sürüm daha önce yüklendi (silinmiş olsa bile)</td><td>Sürümü yükselt, yeniden derle</td></tr>
<tr><td><code>403 Forbidden</code> / "not allowed to upload"</td><td>Ad başkasına ait ya da yanlış token</td><td>Farklı ad seç; proje kapsamlı token üret</td></tr>
<tr><td><code>twine check</code>: README render hatası</td><td><code>readme</code> türü yanlış ya da RST hatası</td><td>Markdown kullan, <code>readme = "README.md"</code></td></tr>
<tr><td>Kurulumdan sonra <code>ModuleNotFoundError</code></td><td>Paket klasörü wheel'e girmemiş</td><td>wheel'i <code>unzip -l</code> ile incele; src düzeni ayarını kontrol et</td></tr>
<tr><td>Eski sürüm de yüklenmeye çalışıyor</td><td><code>dist/</code> temizlenmemiş</td><td>Derlemeden önce <code>dist/</code> klasörünü sil</td></tr>
<tr><td>TestPyPI'den kurarken bağımlılık bulunamadı</td><td>Bağımlılık TestPyPI'de yok</td><td><code>--extra-index-url https://pypi.org/simple/</code></td></tr>
</table></div>

<h3>4. Sürüm etiketleme</h3>
<p>Yayın akışı şöyledir: CHANGELOG'u güncelle, sürümü yükselt, commit et, <b>açıklamalı etiket</b> at, etiketi it. <code>hatch-vcs</code> ya da <code>setuptools-scm</code> kullanıyorsan sürüm numarasını hiçbir dosyaya yazmazsın; etiketten okunur, etiketsiz commit'lerde <code>1.2.1.dev3+g1a2b3c</code> gibi geliştirme sürümü üretilir.</p>
<pre class="code">git tag -a v1.2.0 -m "Sürüm 1.2.0"
git push origin v1.2.0          # CI bu etiketi görünce derler ve yayımlar
git describe --tags             # v1.2.0-3-g1a2b3c: etiketten bu yana 3 commit</pre>
<div class="warn"><b>Yanlış sürüm yayımladıysan</b>PyPI'de sürümü silmek yerine "yank" et: <code>pip install anadolu-skor</code> o sürümü artık seçmez ama <code>==1.2.0</code> ile sabitleyenler kırılmaz. Ardından düzeltilmiş <code>1.2.1</code> yayımla.</div>

<h3>5. Entry point'ler ayrıntılı</h3>
<p>Entry point, "bu ad şu modülün şu nesnesidir" diyen kayıttır: <code>ad = "paket.modul:nesne"</code>. Üç türü vardır:</p>
<ul>
<li><code>[project.scripts]</code> → <code>console_scripts</code> grubu: kurulumda <code>bin/</code> (Windows'ta <code>Scripts</code>) altına çalıştırılabilir dosya üretilir. Fonksiyonun dönüş değeri çıkış kodu olur.</li>
<li><code>[project.gui-scripts]</code> → Windows'ta konsol penceresi açmadan çalışan GUI uygulamaları.</li>
<li><code>[project.entry-points."grup.adi"]</code> → eklenti (plugin) sistemi: başka paketler senin grubuna kayıt ekler, sen <code>importlib.metadata.entry_points(group=...)</code> ile bulup yüklersin. pytest eklentileri bu yolla çalışır.</li>
</ul>
<p><code>python -m anadolu_skor</code> ile de çalışsın istiyorsan paketin içine <code>__main__.py</code> koy ve içinde <code>from .cli import main; raise SystemExit(main())</code> yaz.</p>
<pre class="py">from importlib.metadata import EntryPoint

# Kurulu paketlerin kaydını taklit ediyoruz: başka ekipler kendi dışa aktarıcılarını ekledi
kayitlar = [
    EntryPoint(name="json", value="json:dumps", group="anadolu.export"),
    EntryPoint(name="girinti", value="textwrap:indent", group="anadolu.export"),
    EntryPoint(name="bozuk", value="olmayan_paket.mod:yaz", group="anadolu.export"),
]
eklentiler = {}
for ep in kayitlar:
    try:
        eklentiler[ep.name] = ep.load()          # import + getattr
    except ImportError as e:
        print(f"atlandı: {ep.name} ({type(e).__name__})")
print(sorted(eklentiler))
print(ep.module, ep.attr)
print(eklentiler["json"]({"sube": 34, "adet": 3}))</pre>
<div class="note"><b>Gerçek işte</b>Şirket içi kütüphanelerde akış neredeyse hep aynıdır: <code>main</code> dalına birleştirilen PR → <code>v1.4.0</code> etiketi → CI testleri koşar, <code>python -m build</code>, <code>twine check</code>, önce iç TestPyPI benzeri "staging" depoya, onaydan sonra Artifactory/Nexus'a yükler. Senden beklenen, bu adımları elle bir kez yapıp anlamış olman ve <code>pyproject.toml</code>'daki bir hatanın hangi adımda patlayacağını tahmin edebilmendir.</div>
<div class="tip"><b>Paket verisi</b>Pakete JSON/CSV gibi dosya koyuyorsan <code>open("veri/oranlar.json")</code> yazma; kurulumdan sonra çalışma klasörü farklıdır. <code>importlib.resources.files("anadolu_skor") / "veri/oranlar.json"</code> kullan ve dosyanın wheel'e girdiğini <code>unzip -l</code> ile doğrula.</div>
'''

ex = []
ex.append(dict(t='mc', stage='Isınma', q='Yeni paketini gerçek PyPI\'ye yüklemeden önce neden TestPyPI\'de deneme yükleme yaparsın?',
    o=['TestPyPI yüklemeyi daha hızlı yapar, gerçek PyPI ise kuyrukta bekletir', 'Aynı sürüm PyPI\'ye bir kez yüklenir; hatayı provada yakalarsın', 'twine yalnız TestPyPI\'ye yükleyebilir, PyPI\'ye pip yükler', 'PyPI, önce TestPyPI\'de görmediği her paketi reddeder'], a=1,
    why='PyPI\'de dosyayı silsen bile aynı sürüm numarasını tekrar yükleyemezsin. README render hatası, eksik dosya ya da yanlış ad gibi sorunları TestPyPI\'de görüp düzeltirsin. Diğer şıklar doğru değil: iki sunucu da aynı yazılımı çalıştırır ve twine ikisine de yükler.'))
ex.append(dict(t='mc', stage='Isınma', q='<code>pyproject.toml</code> içindeki <code>[build-system]</code> tablosunun görevi nedir?',
    o=['Paketin çalışma zamanında ihtiyaç duyduğu bağımlılıkları listeler', 'CI\'da hangi testlerin hangi sırayla koşacağını belirler', 'Derleme arka ucunu ve onun gereksinimlerini söyler', 'PyPI sayfasındaki açıklama ve sınıflandırıcıları belirler'], a=2,
    why='requires derleme ortamına kurulacak paketleri (ör. hatchling), build-backend ise çağrılacak modülü (hatchling.build) verir. Çalışma zamanı bağımlılıkları [project] altındaki dependencies alanındadır; açıklama da [project] tablosundan gelir.'))
ex.append(dict(t='predict', stage='Kodu oku', q='Wheel dosya adını parçalayan bu kod ne yazdırır?',
    code=D('''
        ad = "anadolu_skor-1.2.0-py3-none-any.whl"
        parcalar = ad.removesuffix(".whl").split("-")
        print(len(parcalar), parcalar[1], parcalar[-1])
    '''),
    o=['5 1.2.0 any', '4 1.2.0 any', '5 1.2.0 any.whl', '6 anadolu any'], a=0,
    why='removesuffix ".whl" uzantısını atar; kalan metin tirelerden 5 parçaya ayrılır: ad, sürüm, python etiketi, abi, platform. Paket adındaki tire alt çizgiye çevrildiği için ad tek parçadır.'))
ex.append(dict(t='predict', stage='Kodu oku', q='PyPI ad normalleştirmesini uygulayan bu kod ne yazdırır?',
    code=D('''
        import re
        adlar = ["Anadolu_Skor", "anadolu.skor", "ANADOLU--skor", "anadolu-skor2"]
        normal = {re.sub(r"[-_.]+", "-", a).lower() for a in adlar}
        print(len(normal))
    '''),
    o=['4', '1', '2', '3'], a=2,
    why='İlk üç ad "anadolu-skor" olur: art arda gelen -, _ ve . karakterleri tek tireye iner, harfler küçülür. "anadolu-skor2" farklı bir projedir. Kümede 2 eleman kalır; PyPI de ilk üçünü aynı proje sayar.'))
ex.append(dict(t='predict', stage='Kodu oku', q='Bu entry point nesnesinin parçaları nedir?',
    code=D('''
        from importlib.metadata import EntryPoint
        ep = EntryPoint(name="anadolu-skor", value="anadolu_skor.cli:main", group="console_scripts")
        print(ep.module, ep.attr, ep.group == "console_scripts")
    '''),
    o=['anadolu_skor.cli main True', 'anadolu_skor cli.main True', 'anadolu-skor main True', 'anadolu_skor.cli main False'], a=0,
    why='value "modül:nesne" biçimindedir; iki noktanın solu module (anadolu_skor.cli), sağı attr (main) olur. [project.scripts] altındaki her satır console_scripts grubuna kaydedilir.'))
ex.append(dict(t='order', stage='Kodu oku', q='<p><code>[project.scripts]</code> tablosunu okuyup her komutun hangi modülün hangi fonksiyonunu çağırdığını yazdıran programın satırlarını sırala.</p>',
    lines=['import tomllib',
           'cfg = tomllib.loads(\'[project.scripts]\\nkdv = "kdv_araci.cli:main"\\nrapor = "kdv_araci.rapor:calistir"\\n\')',
           'komutlar = cfg["project"]["scripts"]',
           'for ad, hedef in komutlar.items():',
           '    modul, fonk = hedef.split(":")',
           '    print(f"{ad}: {modul} -> {fonk}()")'],
    expect='kdv: kdv_araci.cli -> main()\nrapor: kdv_araci.rapor -> calistir()\n',
    hint='Önce modülü içe aktar, sonra metni ayrıştır; döngü gövdesinde önce ayır, sonra yazdır.',
    why='tomllib.loads iç içe tabloyu sözlüğe çevirir: [project.scripts] → cfg["project"]["scripts"]. Her değer "modül:fonksiyon" biçimindedir; split(":") ile ikiye ayrılır.'))

ex.append(dict(t='code', stage='Rehberli', id=LID + '-x1', diff=2,
    q='<p><code>wheel_ayristir(dosya: str) -&gt; dict</code> yaz. Wheel adı <code>ad-sürüm(-derleme)-python-abi-platform.whl</code> biçimindedir; derleme etiketi isteğe bağlıdır. Sözlük şu anahtarları içersin: <code>ad</code>, <code>surum</code>, <code>derleme</code> (yoksa <code>None</code>), <code>python</code>, <code>abi</code>, <code>platform</code>, <code>saf</code> (abi <code>"none"</code> ve platform <code>"any"</code> ise <code>True</code>). Dosya <code>.whl</code> ile bitmiyorsa ya da parça sayısı 5 veya 6 değilse <code>ValueError</code> fırlat.</p>',
    guide=['Önce uzantıyı kontrol et; değilse ValueError.', 'removesuffix(".whl") ve split("-") ile parçala.', 'Parça sayısı 5 ise derleme None, 6 ise üçüncü parça derlemedir; başka sayıda ValueError.', 'Son üç parça her zaman python, abi, platform\'dur.', 'saf alanını iki koşulun "ve"si olarak hesapla.'],
    example=D('''
        def sdist_ayristir(dosya):
            if not dosya.endswith(".tar.gz"):
                raise ValueError("sdist değil")
            govde = dosya.removesuffix(".tar.gz")
            ad, surum = govde.rsplit("-", 1)
            return {"ad": ad, "surum": surum}

        print(sdist_ayristir("anadolu_skor-1.2.0.tar.gz"))
    '''),
    start=D('''
        def wheel_ayristir(dosya):
            # TODO: .whl değilse ValueError
            parcalar = dosya.split("-")
            # TODO: 5 parça -> derleme None, 6 parça -> derleme var, diğer -> ValueError
            # TODO: sözlüğü kur ve saf alanını hesapla
            return {}
    '''),
    sol=D('''
        def wheel_ayristir(dosya):
            if not dosya.endswith(".whl"):
                raise ValueError(f"wheel değil: {dosya}")
            parcalar = dosya.removesuffix(".whl").split("-")
            if len(parcalar) == 5:
                ad, surum, py, abi, plat = parcalar
                derleme = None
            elif len(parcalar) == 6:
                ad, surum, derleme, py, abi, plat = parcalar
            else:
                raise ValueError(f"geçersiz wheel adı: {dosya}")
            return {"ad": ad, "surum": surum, "derleme": derleme, "python": py,
                    "abi": abi, "platform": plat, "saf": abi == "none" and plat == "any"}
    '''),
    tests=D('''
        w = wheel_ayristir("anadolu_skor-1.2.0-py3-none-any.whl")
        assert w["ad"] == "anadolu_skor" and w["surum"] == "1.2.0", "ad ve sürüm ilk iki parçadır"
        assert w["derleme"] is None, "5 parçalı adda derleme etiketi yoktur, None olmalı"
        assert w["saf"] is True, "py3-none-any saf Python wheel'idir"
        w = wheel_ayristir("numpy-2.1.0-cp312-cp312-win_amd64.whl")
        assert w["python"] == "cp312" and w["platform"] == "win_amd64", "son üç parça python, abi, platform"
        assert w["saf"] is False, "platforma özel wheel saf değildir"
        w = wheel_ayristir("rapor_araci-0.3.0-1-py3-none-any.whl")
        assert w["derleme"] == "1" and w["python"] == "py3", "6 parçalı adda üçüncü parça derleme etiketidir"
        for kotu in ["anadolu_skor-1.2.0.tar.gz", "eksik-1.0-py3.whl"]:
            try:
                wheel_ayristir(kotu)
                assert False, f"{kotu} için ValueError bekleniyordu"
            except ValueError:
                pass
    '''),
    hints=['Paket uzantısını str.endswith ve str.removesuffix ile ele al.', 'len(parcalar) 5 ve 6 için iki ayrı açma (unpacking) satırı yaz.', 'saf = abi == "none" and plat == "any"'],
    why='Wheel adı makine tarafından okunur: pip uyumlu wheel\'i seçerken tam olarak bu parçalara bakar. Derleme etiketi nadirdir ama ad yapısı bozulmasın diye ayrı ele alınır.'))

ex.append(dict(t='code', stage='Rehberli', id=LID + '-x2', diff=2,
    q='<p>Sürüm etiketleme yardımcısı yaz. <code>etiketten_surum(etiket)</code>: <code>"v1.4.2"</code> → <code>(1, 4, 2)</code>; etiket <code>v</code> ile başlamıyor ya da üç sayısal parçası yoksa <code>ValueError</code>. <code>sonraki_etiket(etiketler, tur)</code>: geçerli etiketler arasından <b>sayısal olarak</b> en büyüğünü bulup <code>tur</code>\'a (<code>"major"</code>, <code>"minor"</code>, <code>"patch"</code>) göre yükseltilmiş etiketi döndürsün; geçersiz etiketleri (ör. <code>"deneme"</code>) yok saysın; hiç geçerli etiket yoksa <code>"v0.1.0"</code> döndürsün.</p>',
    guide=['etiketten_surum: startswith("v") kontrolü, sonra [1:].split(".").', 'Üç parça mı ve hepsi isdigit() mi, kontrol et; tuple(int(...)) döndür.', 'sonraki_etiket: her etiketi try/except ValueError ile dönüştür, geçerlileri listede topla.', 'Tuple\'lar sayısal karşılaştırılır: max(gecerliler).', 'major yükselince minor ve patch sıfırlanır; minor yükselince patch sıfırlanır.'],
    example=D('''
        def tarih_ayristir(metin):
            parcalar = metin.split("-")
            if len(parcalar) != 3 or not all(p.isdigit() for p in parcalar):
                raise ValueError(metin)
            return tuple(int(p) for p in parcalar)

        tarihler = ["2026-03-01", "bozuk", "2026-11-09"]
        gecerli = []
        for t in tarihler:
            try:
                gecerli.append(tarih_ayristir(t))
            except ValueError:
                pass
        print(max(gecerli))
    '''),
    start=D('''
        def etiketten_surum(etiket):
            # TODO: "v" ile başlamalı, üç sayısal parça olmalı
            pass

        def sonraki_etiket(etiketler, tur):
            gecerliler = []
            # TODO: geçerli etiketleri topla, yoksa "v0.1.0"
            # TODO: en büyüğü bul ve türüne göre yükselt
            return "v0.0.0"
    '''),
    sol=D('''
        def etiketten_surum(etiket):
            if not etiket.startswith("v"):
                raise ValueError(f"etiket v ile başlamalı: {etiket}")
            parcalar = etiket[1:].split(".")
            if len(parcalar) != 3 or not all(p.isdigit() for p in parcalar):
                raise ValueError(f"geçersiz etiket: {etiket}")
            return tuple(int(p) for p in parcalar)

        def sonraki_etiket(etiketler, tur):
            gecerliler = []
            for e in etiketler:
                try:
                    gecerliler.append(etiketten_surum(e))
                except ValueError:
                    pass
            if not gecerliler:
                return "v0.1.0"
            ma, mi, pa = max(gecerliler)
            if tur == "major":
                ma, mi, pa = ma + 1, 0, 0
            elif tur == "minor":
                mi, pa = mi + 1, 0
            elif tur == "patch":
                pa += 1
            else:
                raise ValueError(f"bilinmeyen tür: {tur}")
            return f"v{ma}.{mi}.{pa}"
    '''),
    tests=D('''
        assert etiketten_surum("v1.4.2") == (1, 4, 2), "v1.4.2 -> (1, 4, 2)"
        for kotu in ["1.4.2", "v1.4", "v1.x.0"]:
            try:
                etiketten_surum(kotu)
                assert False, f"{kotu!r} için ValueError bekleniyordu"
            except ValueError:
                pass
        et = ["v1.9.0", "v1.10.0", "deneme", "v1.2.7"]
        assert sonraki_etiket(et, "patch") == "v1.10.1", "en büyük v1.10.0'dır (metin sıralaması v1.9.0 sanır)"
        assert sonraki_etiket(et, "minor") == "v1.11.0", "minor yükselince patch sıfırlanır"
        assert sonraki_etiket(et, "major") == "v2.0.0", "major yükselince minor ve patch sıfırlanır"
        assert sonraki_etiket(["taslak"], "patch") == "v0.1.0", "geçerli etiket yoksa v0.1.0"
    '''),
    hints=['Sürümleri tuple olarak tutarsan karşılaştırma sayısal olur.', 'Geçersiz etiketleri try/except ValueError: pass ile atla.', 'ma, mi, pa = max(gecerliler) sonrasında türe göre üç ayrı dal yaz.'],
    why='Etiketten sürüm türetmek, hatch-vcs ve setuptools-scm\'in yaptığı işin özüdür. Sürümü metin değil sayı demeti olarak karşılaştırmak "v1.9.0 > v1.10.0" tuzağını önler.'))

ex.append(dict(t='code', stage='Rehberli', id=LID + '-x3', diff=2,
    q='<p>Eklenti (plugin) sistemi kur. <code>eklentileri_yukle(tanimlar: dict, grup: str) -&gt; tuple[dict, list]</code>: <code>tanimlar</code> sözlüğü <code>{"ad": "modul:nesne"}</code> biçimindedir. Her biri için <code>importlib.metadata.EntryPoint(name=..., value=..., group=grup)</code> oluştur ve <code>.load()</code> ile yükle. Başarılı olanları <code>{ad: nesne}</code> sözlüğüne, yüklenemeyenlerin adlarını (<code>ImportError</code> ya da <code>AttributeError</code>) listeye koy. Sözlüğü ve <b>alfabetik sıralı</b> hata listesini döndür.</p>',
    guide=['from importlib.metadata import EntryPoint ile başla.', 'Boş bir sözlük ve boş bir liste oluştur.', 'Her tanım için EntryPoint nesnesi kur, load()\'u try içinde çağır.', 'except (ImportError, AttributeError) ile adı hata listesine ekle.', 'return yuklenen, sorted(hatalar)'],
    example=D('''
        import importlib

        def modul_dene(adlar):
            bulunan = []
            for ad in adlar:
                try:
                    importlib.import_module(ad)
                    bulunan.append(ad)
                except ImportError:
                    print("yok:", ad)
            return bulunan

        print(modul_dene(["json", "olmayan_modul", "csv"]))
    '''),
    start=D('''
        from importlib.metadata import EntryPoint

        def eklentileri_yukle(tanimlar, grup):
            yuklenen = {}
            hatalar = []
            for ad, deger in tanimlar.items():
                # TODO: EntryPoint oluştur ve load() et; hatada adı listeye ekle
                pass
            return yuklenen, hatalar
    '''),
    sol=D('''
        from importlib.metadata import EntryPoint

        def eklentileri_yukle(tanimlar, grup):
            yuklenen = {}
            hatalar = []
            for ad, deger in tanimlar.items():
                ep = EntryPoint(name=ad, value=deger, group=grup)
                try:
                    yuklenen[ad] = ep.load()
                except (ImportError, AttributeError):
                    hatalar.append(ad)
            return yuklenen, sorted(hatalar)
    '''),
    tests=D('''
        import json, textwrap
        tanim = {"json": "json:dumps", "yok": "olmayan_paket_xyz:yaz", "girinti": "textwrap:indent", "eksik": "json:olmayan_fonk"}
        y, h = eklentileri_yukle(tanim, "anadolu.export")
        assert y.get("json") is json.dumps, "json:dumps yüklenip gerçek fonksiyon olmalı"
        assert y.get("girinti") is textwrap.indent, "textwrap:indent yüklenmeli"
        assert h == ["eksik", "yok"], f"modülü olmayan (ImportError) ve niteliği olmayan (AttributeError) eklentiler sıralı listelenmeli, gelen: {h}"
        assert eklentileri_yukle({}, "g") == ({}, []), "boş tanımda boş sonuç"
    '''),
    hints=['EntryPoint(name=ad, value=deger, group=grup).load() modülü içe aktarıp nesneyi getirir.', 'Modül yoksa ImportError (ModuleNotFoundError), nesne yoksa AttributeError gelir.', 'İki hatayı tek except satırında demet olarak yakala.'],
    why='Gerçek sistemde tanımlar entry_points(group=...) çağrısından gelir; geri kalan her şey aynıdır. Bozuk bir eklentinin tüm uygulamayı çökertmemesi, hata listesini raporlaman iyi tasarımdır.'))

ex.append(dict(t='code', stage='Kendin yaz', id=LID + '-x4', diff=2,
    q='<p><code>dagitim_adi(proje: str) -&gt; tuple[str, str]</code> yaz. Önce adın geçerli olduğunu denetle: yalnız ASCII harf, rakam, <code>.</code>, <code>_</code>, <code>-</code> içermeli ve harf/rakamla başlayıp bitmeli (aksi halde <code>ValueError</code>). Sonra iki biçimi döndür: PyPI adı (ardışık <code>-_.</code> → tek <code>-</code>, küçük harf) ve wheel öneki (aynı normalleştirme ama ayırıcı <code>_</code>). Örnek: <code>"Anadolu.Skor__Araclari"</code> → <code>("anadolu-skor-araclari", "anadolu_skor_araclari")</code>.</p>',
    start=D('''
        def dagitim_adi(proje):
            pass
    '''),
    sol=D('''
        import re

        GECERLI = re.compile(r"^[A-Za-z0-9]([A-Za-z0-9._-]*[A-Za-z0-9])?$")

        def dagitim_adi(proje):
            if not GECERLI.match(proje):
                raise ValueError(f"geçersiz proje adı: {proje!r}")
            pypi = re.sub(r"[-_.]+", "-", proje).lower()
            return pypi, pypi.replace("-", "_")
    '''),
    tests=D('''
        assert dagitim_adi("Anadolu.Skor__Araclari") == ("anadolu-skor-araclari", "anadolu_skor_araclari"), "normalleştirme"
        assert dagitim_adi("kdv") == ("kdv", "kdv"), "tek kelimelik ad değişmez"
        assert dagitim_adi("A") == ("a", "a"), "tek karakterlik ad geçerlidir"
        for kotu in ["-skor", "skor_", "anadolu skor", "şube-araci", ""]:
            try:
                dagitim_adi(kotu)
                assert False, f"{kotu!r} geçersiz sayılmalı"
            except ValueError:
                pass
    '''),
    hints=['Geçerlilik için tek bir düzenli ifade yeterli: baş ve son karakter [A-Za-z0-9], ortası [A-Za-z0-9._-]*.', 'Tek karakterli adlar için ortadaki grubu isteğe bağlı (?) yap.', 'Normalleştirme: re.sub(r"[-_.]+", "-", ad).lower()'],
    why='PEP 508 ad kuralı ve PEP 503 normalleştirmesi, pip\'in "Anadolu_Skor" ile "anadolu-skor"u aynı proje sayma nedenidir. Wheel dosya adında tire ayırıcı olduğu için ad alt çizgiyle yazılır.'))

ex.append(dict(t='code', stage='Kendin yaz', id=LID + '-x5', diff=2,
    q='<p><code>yukleme_plani(dosyalar: list[str], yayimlanan: set[str]) -&gt; list[str]</code> yaz. <code>dosyalar</code>, <code>dist/</code> klasörünün içeriğidir. Yalnız <code>.whl</code> ve <code>.tar.gz</code> dosyalarını dikkate al. Sürüm, <code>.whl</code> için tireyle ayrılmış 2. parça; <code>.tar.gz</code> için son tireden sonraki kısımdır. Dağıtım dosyalarında <b>birden fazla sürüm</b> varsa <code>ValueError("dist/ temizlenmeli: ...")</code> fırlat. Sürüm <code>yayimlanan</code> içindeyse <code>ValueError("sürüm zaten yayımlanmış: ...")</code> fırlat. Aksi halde yüklenecek dosyaları alfabetik sıralı döndür; hiç dağıtım dosyası yoksa boş liste.</p>',
    start=D('''
        def yukleme_plani(dosyalar, yayimlanan):
            pass
    '''),
    sol=D('''
        def _surum(dosya):
            if dosya.endswith(".whl"):
                return dosya.split("-")[1]
            return dosya.removesuffix(".tar.gz").rsplit("-", 1)[1]

        def yukleme_plani(dosyalar, yayimlanan):
            dagitim = sorted(d for d in dosyalar if d.endswith((".whl", ".tar.gz")))
            if not dagitim:
                return []
            surumler = {_surum(d) for d in dagitim}
            if len(surumler) > 1:
                raise ValueError(f"dist/ temizlenmeli: {sorted(surumler)}")
            surum = surumler.pop()
            if surum in yayimlanan:
                raise ValueError(f"sürüm zaten yayımlanmış: {surum}")
            return dagitim
    '''),
    tests=D('''
        d = ["anadolu_skor-1.3.0.tar.gz", "anadolu_skor-1.3.0-py3-none-any.whl", ".gitignore"]
        assert yukleme_plani(d, {"1.2.0"}) == ["anadolu_skor-1.3.0-py3-none-any.whl", "anadolu_skor-1.3.0.tar.gz"], "yalnız dağıtım dosyaları, sıralı"
        assert yukleme_plani(["README.md"], set()) == [], "dağıtım dosyası yoksa boş liste"
        try:
            yukleme_plani(d + ["anadolu_skor-1.2.0-py3-none-any.whl"], set())
            assert False, "iki farklı sürüm varken ValueError bekleniyordu"
        except ValueError as e:
            assert "temizlenmeli" in str(e), "mesaj dist/ temizlenmeli demeli"
        try:
            yukleme_plani(d, {"1.3.0"})
            assert False, "yayımlanmış sürüm yeniden yüklenmemeli"
        except ValueError as e:
            assert "zaten" in str(e), "mesaj sürümün zaten yayımlandığını söylemeli"
    '''),
    hints=['str.endswith bir demet alabilir: d.endswith((".whl", ".tar.gz")).', 'Sürümleri bir kümede topla; kümede birden fazla eleman varsa dist/ eskidir.', 'sdist için removesuffix(".tar.gz").rsplit("-", 1)[1].'],
    why='twine upload dist/* komutu klasördeki her şeyi yüklemeye çalışır; eski sürüm dosyası kalmışsa "File already exists" hatası alırsın. Yüklemeden önce bu plan kontrolünü yapan bir betik CI\'da sık görülür.'))

ex.append(dict(t='code', stage='Hata avı', kind='bug', id=LID + '-x6', diff=1,
    q='<p><b>Hatayı bul ve düzelt.</b> <code>son_etiket(etiketler)</code> en yeni sürüm etiketini döndürmeli; CI bu etiketi yayımlıyor. Ama <code>["v1.9.0", "v1.10.0", "v1.2.0"]</code> için <code>"v1.9.0"</code> döndürüyor ve eski sürüm yeniden yayımlanmaya çalışılıyor. Fonksiyonu düzelt (etiketler hep <code>vX.Y.Z</code> biçiminde).</p>',
    start=D('''
        def son_etiket(etiketler):
            return sorted(etiketler)[-1]
    '''),
    sol=D('''
        def son_etiket(etiketler):
            return max(etiketler, key=lambda e: tuple(int(p) for p in e[1:].split(".")))
    '''),
    tests=D('''
        assert son_etiket(["v1.9.0", "v1.10.0", "v1.2.0"]) == "v1.10.0", "1.10 sayısal olarak 1.9'dan büyüktür"
        assert son_etiket(["v2.0.0", "v10.0.0"]) == "v10.0.0", "major da sayısal karşılaştırılmalı"
        assert son_etiket(["v0.1.0"]) == "v0.1.0", "tek etiket"
    '''),
    hints=['sorted metinleri karakter karakter karşılaştırır: "1" < "9".', 'Her etiketi (major, minor, patch) sayı demetine çeviren bir key fonksiyonu yaz.'],
    why='Metin sıralamasında "v1.10.0" < "v1.9.0" olur çünkü "1" karakteri "9"dan küçüktür. key ile sayı demetine çevirmek doğru sıralamayı verir.'))

ex.append(dict(t='code', stage='Hata avı', kind='bug', id=LID + '-x7', diff=2,
    q='<p><b>Hatayı bul ve düzelt.</b> <code>scripts_coz(satirlar)</code>, <code>[project.scripts]</code> altından kopyalanmış satırları <code>{komut: (modül, fonksiyon)}</code> sözlüğüne çevirmeli. Boş satırlar ve <code>#</code> ile başlayan yorumlar atlanmalı. Mevcut kod <code>\'kdv = "kdv_araci.cli:main"\'</code> için <code>{"kdv ": (\' "kdv_araci.cli\', \'main"\')}</code> gibi bozuk değerler üretiyor ve yorum satırında çöküyor.</p>',
    start=D('''
        def scripts_coz(satirlar):
            sonuc = {}
            for satir in satirlar:
                ad, hedef = satir.split("=")
                modul, fonk = hedef.split(":")
                sonuc[ad] = (modul, fonk)
            return sonuc
    '''),
    sol=D('''
        def scripts_coz(satirlar):
            sonuc = {}
            for satir in satirlar:
                satir = satir.strip()
                if not satir or satir.startswith("#"):
                    continue
                ad, hedef = satir.split("=", 1)
                modul, fonk = hedef.strip().strip('"').split(":")
                sonuc[ad.strip()] = (modul, fonk)
            return sonuc
    '''),
    tests=D('''
        r = scripts_coz(['kdv = "kdv_araci.cli:main"', '', '# yardımcı komutlar', '  rapor="kdv_araci.rapor:calistir"  '])
        assert r == {"kdv": ("kdv_araci.cli", "main"), "rapor": ("kdv_araci.rapor", "calistir")}, f"boşluk ve tırnaklar temizlenmeli, gelen: {r}"
        assert scripts_coz([]) == {}, "boş girdi"
    '''),
    hints=['Üç sorun var: boşluklar, çift tırnaklar ve yorum/boş satırlar.', 'Her satırı strip() et; boşsa ya da # ile başlıyorsa continue.', 'Değeri hedef.strip().strip(\'"\') ile tırnaklardan arındır.'],
    why='TOML değerleri tırnaklıdır ve "=" etrafında boşluk olabilir. Gerçek kodda tomllib kullanırsın; ama elle ayrıştırırken strip ve split("=", 1) en sık unutulan ayrıntılardır.'))

ex.append(dict(t='code', stage='Meydan okuma', id=LID + '-x8', diff=3,
    q='<p>PEP 440 sürüm sıralaması. <code>en_yeni(surumler: list[str], on_surum: bool = False) -&gt; str | None</code> yaz. Desteklenecek biçim: <code>N(.N)*</code> sürüm parçaları, isteğe bağlı ön sürüm <code>aN</code> / <code>bN</code> / <code>rcN</code>, isteğe bağlı <code>.postN</code>, isteğe bağlı <code>.devN</code>. Sıra (aynı numara için): <code>1.0.dev1 &lt; 1.0a1 &lt; 1.0b2 &lt; 1.0rc1 &lt; 1.0 &lt; 1.0.post1</code>. Sondaki sıfırlar önemsizdir (<code>1.0 == 1.0.0</code>). <code>on_surum=False</code> iken ön sürümler ve dev sürümler aday sayılmaz (pip gibi). Aday yoksa <code>None</code>. Geçersiz metin <code>ValueError</code> versin. Eşit sürümlerde listede önce geleni döndür.</p>',
    start=D('''
        import re

        def en_yeni(surumler, on_surum=False):
            pass
    '''),
    sol=D('''
        import re

        RX = re.compile(r"^(\\d+(?:\\.\\d+)*)(?:(a|b|rc)(\\d+))?(?:\\.post(\\d+))?(?:\\.dev(\\d+))?$")
        ON = {"a": 0, "b": 1, "rc": 2}

        def _anahtar(s):
            m = RX.match(s)
            if not m:
                raise ValueError(f"geçersiz sürüm: {s}")
            sayilar = [int(x) for x in m[1].split(".")]
            while len(sayilar) > 1 and sayilar[-1] == 0:
                sayilar.pop()
            if m[2]:
                on = (ON[m[2]], int(m[3]))
            elif m[5] and not m[4]:
                on = (-1, 0)
            else:
                on = (3, 0)
            post = int(m[4]) if m[4] else -1
            dev = int(m[5]) if m[5] else float("inf")
            return (tuple(sayilar), on, post, dev)

        def _kararli(s):
            m = RX.match(s)
            return not m[2] and not m[5]

        def en_yeni(surumler, on_surum=False):
            adaylar = [s for s in surumler if _anahtar(s) and (on_surum or _kararli(s))]
            if not adaylar:
                return None
            return max(adaylar, key=_anahtar)
    '''),
    tests=D('''
        s = ["1.0.dev1", "1.0a1", "1.0b2", "1.0rc1", "1.0", "1.0.post1"]
        assert en_yeni(s) == "1.0.post1", "post sürüm finalden sonra gelir ve kararlıdır"
        assert en_yeni(["1.0", "1.1rc1"]) == "1.0", "ön sürüm varsayılan olarak aday değildir"
        assert en_yeni(["1.0", "1.1rc1"], on_surum=True) == "1.1rc1", "on_surum=True iken 1.1rc1 > 1.0"
        assert en_yeni(["1.1a1", "1.1.dev3", "1.1b1"], on_surum=True) == "1.1b1", "dev < a < b"
        assert en_yeni(["1.0rc1", "1.0rc2"], on_surum=True) == "1.0rc2", "rc numarası sayısal"
        assert en_yeni(["1.9", "1.10.0", "1.2.7"]) == "1.10.0", "parçalar sayısal karşılaştırılır"
        assert en_yeni(["1.0.0", "1.0"]) == "1.0.0", "1.0 ile 1.0.0 eşittir; önce gelen döner"
        assert en_yeni(["2.0a1"]) is None, "kararlı aday yoksa None"
        assert en_yeni([]) is None, "boş liste"
        try:
            en_yeni(["1.0", "sürüm-bir"])
            assert False, "geçersiz sürümde ValueError bekleniyordu"
        except ValueError:
            pass
    '''),
    hints=['Her sürümü karşılaştırılabilir bir demete çevir: (sayılar, ön_sürüm_sırası, post, dev).', 'Ön sürüm yoksa sırası 3 (finalden sonra hiçbir ön sürüm gelmez); yalnız .devN varsa -1 (her şeyden önce).', 'max(..., key=...) eşitlikte ilk görülen elemanı döndürür; sondaki sıfırları atmayı unutma.'],
    why='Gerçek projelerde packaging.version.Version kullanılır; ama pip\'in "en yeni kararlı sürümü seç" davranışını anlamak, ön sürüm yayımlarken kullanıcıların neden onu otomatik almadığını açıklar.'))

faq = [
    dict(q='TestPyPI\'den kurarken bağımlılıklar neden bulunamıyor?', a='TestPyPI ayrı bir depodur ve httpx, pydantic gibi bağımlılıkların çoğu orada yoktur ya da eski/bozuk kopyalardır. Kurarken <code>--index-url https://test.pypi.org/simple/ --extra-index-url https://pypi.org/simple/</code> kullan: paketin kendisi TestPyPI\'den, bağımlılıklar gerçek PyPI\'den gelir.'),
    dict(q='Yanlış sürümü yayımladım; silebilir miyim?', a='Silebilirsin ama aynı sürüm numarasını bir daha kullanamazsın ve o sürüme sabitlenmiş kullanıcılar kırılır. Önerilen yol "yank" etmektir: pip o sürümü varsayılan olarak seçmez, açıkça isteyen yine kurabilir. Ardından düzeltilmiş PATCH sürümünü yayımla.'),
    dict(q='hatchling mi setuptools mu seçmeliyim?', a='Yeni saf Python projesi için hatchling daha az ayar ister ve src düzenini kendisi bulur. C uzantısı derliyorsan ya da şirket şablonu setuptools ise setuptools. İkisi de aynı pyproject.toml [project] standardını okur; sonradan geçiş genellikle yalnız [build-system] tablosunu değiştirmektir.')
]
mistakes = [
    dict(bad='# dist/ içinde eski 1.2.0 dosyaları duruyor\n# python -m build\n# twine upload dist/*', good='# rm -rf dist/\n# python -m build\n# twine check dist/* && twine upload dist/*', why='dist/ temizlenmezse twine eski sürümü de yüklemeye çalışır ve "400 File already exists" ile durur; hangi dosyanın yüklendiği belirsizleşir.'),
    dict(bad='# .pypirc depoda, içinde kişisel parola\n[pypi]\nusername = ahmet\npassword = Gizli123', good='# CI: Trusted Publishing (token yok)\n# yerelde: proje kapsamlı API token, chmod 600 ~/.pypirc\n[pypi]\nusername = __token__\npassword = pypi-...', why='PyPI parola ile yüklemeyi kabul etmez; API token gerekir. Token\'ı depoya koymak paketini başkasının yayımlamasına izin verir. Trusted Publishing gizli bilgi saklamayı tamamen ortadan kaldırır.'),
    dict(bad='VERI = open("veri/oranlar.json").read()  # paket içinde', good='from importlib.resources import files\nVERI = (files("anadolu_skor") / "veri/oranlar.json").read_text()', why='Göreli yol, çalışma klasörüne göre çözülür; paket kurulduktan sonra dosya site-packages altındadır ve open bulamaz.')
]

write('/home/claude/py/v2/e8/paketleme-dagitim.js', LID, 40, HTML, ex, faq, mistakes, 'PyPI yayımlama')
