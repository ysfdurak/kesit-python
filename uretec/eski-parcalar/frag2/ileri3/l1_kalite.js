/* ───────────────────────── 1. kalite-ci ───────────────────────── */
{
  id: 'kalite-ci',
  lv: 'ileri',
  mod: 'Üretime Hazırlık',
  min: 45,
  title: 'Kod kalitesi ve CI: ruff, mypy, pre-commit, pytest, GitHub Actions',
  sum: 'Kod kalitesini otomatik araçlarla korumayı, test ve kapsam ölçmeyi, pre-commit ve GitHub Actions ile her commit\'te kontrol çalıştırmayı öğrenirsin.',
  goals: [
    'ruff, black, isort ve mypy\'nin ne yaptığını ve projeye nasıl eklendiğini açıklayabilirim.',
    'pytest fixture\'larıyla tekrar eden test hazırlığını paylaştırıp coverage ile kapsamı ölçebilirim.',
    'pre-commit kancalarıyla hatalı kodun depoya girmesini commit anında engelleyebilirim.',
    'GitHub Actions iş akışı yazıp her push\'ta lint, tip denetimi ve testleri çalıştırabilirim.',
    'ast modülüyle kendi küçük lint kurallarımı yazabilir, kod inceleme listesi uygulayabilirim.'
  ],
  body: `
<h2>Neden kalite otomasyonu?</h2>
<p>Anadolu Bank\'ın kredi skorlama paketini üç kişi geliştiriyor. Biri sekmeyle, diğeri boşlukla girinti yapıyor; birinin bıraktığı <code>print</code> çağrısı üretim logunu dolduruyor; <code>None</code> dönebilen bir fonksiyon başka bir yerde <code>.upper()</code> ile çağrılıyor ve gece yarısı çöküyor. Bunların hiçbiri "dikkat etmekle" çözülmez; insan dikkati tükenir, araçlar tükenmez. Kalite otomasyonu (quality automation), bu kontrolleri makineye devretmek ve her commit\'te, her pull request\'te aynı standardı uygulamaktır.</p>
<p>Üretime hazır bir Python projesinde kalite zinciri dört halkadan oluşur: biçimlendirici (formatter) kodu tek stile getirir, linter şüpheli kalıpları yakalar, tip denetleyici (type checker) sözleşmeleri doğrular, test koşucusu davranışı kanıtlar. pre-commit bu zinciri yerelde, CI (continuous integration, sürekli tümleştirme) sunucuda çalıştırır.</p>

<h2>Biçim ve lint: ruff, black, isort</h2>
<p><b>black</b> "uzlaşmaz biçimlendirici"dir: tırnak, satır kırma, boşluk gibi tartışmaları tek stile bağlar; tartışma biter. <b>isort</b> import satırlarını gruplar ve alfabetik sıralar (standart kütüphane, üçüncü parti, proje). <b>ruff</b> ise Rust ile yazılmış, çok hızlı bir linter; flake8, isort ve pyflakes kurallarının büyük kısmını tek araçta toplar ve <code>ruff format</code> komutuyla black\'in yerini de alabilir. Yeni projelerde yaygın tercih yalnızca ruff\'tır; eski projelerde üçlüyü birlikte görürsün.</p>
<p>Ayarlar <code>pyproject.toml</code> içinde yaşar:</p>
<pre class="code">[tool.ruff]
line-length = 88
target-version = "py312"

[tool.ruff.lint]
select = ["E", "F", "I", "B", "UP"]   # pycodestyle, pyflakes, isort, bugbear, pyupgrade
ignore = ["E501"]                     # satır uzunluğunu format halleder

[tool.mypy]
python_version = "3.12"
strict = true</pre>
<div class="tbl-wrap"><table>
<tr><th>Araç</th><th>Ne yapar</th><th>Komut</th><th>Yakaladığı örnek</th></tr>
<tr><td>ruff check</td><td>Lint: hatalı/şüpheli kalıp</td><td>ruff check .</td><td>Kullanılmayan import, tanımsız ad, mutable default</td></tr>
<tr><td>ruff format / black</td><td>Biçimlendirme</td><td>ruff format .</td><td>Girinti, tırnak, satır kırma</td></tr>
<tr><td>isort</td><td>Import sıralama</td><td>isort .</td><td>Karışık import grupları</td></tr>
<tr><td>mypy</td><td>Statik tip denetimi</td><td>mypy src/</td><td>str | None değere .upper() çağırmak</td></tr>
<tr><td>pytest --cov</td><td>Test ve kapsam</td><td>pytest --cov=paket</td><td>Hiç test edilmeyen dal</td></tr>
</table></div>

<h2>Kendi lint kuralını yazmak: ast</h2>
<p>Linter\'ların sihri yok: kaynak kodu <code>ast</code> (abstract syntax tree, soyut sözdizimi ağacı) ile ayrıştırır ve ağaçta dolaşırlar. Aynı şeyi sen de yapabilirsin. Aşağıdaki örnek, bir kod parçasında unutulmuş <code>print</code> çağrılarını bulur:</p>
<pre class="py">import ast

KOD = '''
import os
import json

def skor_hesapla(gelir, borc):
    print("debug:", gelir)
    oran = borc / gelir
    return json.dumps({"oran": oran})
'''

agac = ast.parse(KOD)
for dugum in ast.walk(agac):
    if isinstance(dugum, ast.Call) and isinstance(dugum.func, ast.Name):
        if dugum.func.id == "print":
            print(f"satır {dugum.lineno}: print bırakılmış")</pre>
<p><code>ast.walk</code> ağaçtaki her düğümü gezer; <code>ast.Call</code> bir fonksiyon çağrısı, <code>ast.Name</code> basit bir addır. Aynı yaklaşımla kullanılmayan import\'ları bulmak da kolay: import edilen adları topla, kodda <code>ast.Name</code> olarak geçenleri topla, farkı al. Yukarıdaki kodda <code>os</code> import edilmiş ama hiç kullanılmamış; ruff bunu F401 koduyla bildirir. Alıştırmalarda bu kuralı kendin yazacaksın.</p>
<div class="tip"><b>ast.Attribute</b><code>json.dumps</code> gibi çağrılarda modül adı <code>ast.Attribute</code> düğümünün <code>value</code> kısmındaki <code>ast.Name</code> olarak görünür. <code>ast.walk</code> tüm alt düğümleri de gezdiği için yalnızca <code>ast.Name</code> toplamak yeterlidir.</div>

<h2>mypy ile tip sözleşmesi</h2>
<p>Tip ipuçları (type hints) belge gibidir; mypy onları sözleşmeye dönüştürür. Şu fonksiyonu düşün:</p>
<pre class="py">def musteri_bul(idler: dict[int, str], mid: int) -&gt; str | None:
    return idler.get(mid)

ad = musteri_bul({1: "Ayşe"}, 2)
# mypy: Item "None" of "str | None" has no attribute "upper"
# print(ad.upper())
if ad is not None:
    print(ad.upper())
else:
    print("müşteri yok")</pre>
<p>Yorum satırındaki çağrı mypy\'de hata verir, çünkü dönüş tipi <code>None</code> olabilir. Bu uyarı, gece yarısı çökmesini kod yazılırken yakalar. <code>strict = true</code> ile her fonksiyonun tip açıklaması zorunlu olur; yeni projede baştan açmak kolay, eski projede modül modül açmak gerçekçidir.</p>

<h2>pytest fixture ve coverage</h2>
<p>Testlerin çoğu aynı hazırlığı tekrarlar: örnek sipariş listesi, geçici dizin, sahte veritabanı. <b>fixture</b>, bu hazırlığı bir fonksiyona koyup testlere parametre olarak enjekte eder. pytest, test fonksiyonunun parametre adına bakarak aynı adlı fixture\'ı bulur ve çağırır:</p>
<pre class="code">import pytest

@pytest.fixture
def siparisler():
    return [{"id": 1, "tutar": 250}, {"id": 2, "tutar": 90}]

@pytest.fixture
def gecici_db(tmp_path):            # fixture başka fixture kullanabilir
    yol = tmp_path / "test.db"
    baglanti = sqlite3.connect(yol)
    yield baglanti                  # test burada çalışır
    baglanti.close()                # temizlik (teardown)

def test_toplam(siparisler):
    assert toplam_tutar(siparisler) == 340</pre>
<p>Fixture gövdesindeki <code>yield</code>, kurulum ile temizliği ayırır: yield\'den öncesi kurulum, sonrası temizlik. Test hata verse bile temizlik çalışır. Bu, bağlam yöneticisiyle aynı mantıktır; aşağıdaki örnekte pytest olmadan aynı deseni kendi elinle kuruyorsun:</p>
<pre class="py">from contextlib import contextmanager

gunluk = []

@contextmanager
def ornek_hesaplar():
    gunluk.append("kurulum")
    hesaplar = {"TR1": 1000, "TR2": 250}
    try:
        yield hesaplar
    finally:
        gunluk.append("temizlik")

with ornek_hesaplar() as h:
    h["TR1"] -= 100
    print("bakiye:", h["TR1"])

try:
    with ornek_hesaplar() as h:
        raise ValueError("test patladı")
except ValueError:
    pass
print(gunluk)</pre>
<p><b>coverage</b> (kapsam) ise testlerin kodun yüzde kaçını çalıştırdığını ölçer: <code>pytest --cov=anadolu --cov-report=term-missing</code> komutu her dosya için yüzde ve test edilmeyen satır numaralarını listeler. Yüzde yüz hedef değil, işaret fenerdir: hiç dokunulmayan bir hata dalı (<code>except</code> bloğu gibi) genelde en çok çökmeye yol açan yerdir.</p>
<div class="warn"><b>Kapsam yüzdesi kaliteyi garanti etmez</b>Satırın çalışmış olması doğru çalıştığı anlamına gelmez; assert içermeyen bir test yüzde yüz kapsam verir ama hiçbir şey kanıtlamaz. Kapsamı düşük dalları bulmak için kullan, hedef sayı için değil.</div>

<h2>pre-commit: hatayı commit anında yakala</h2>
<p><b>pre-commit</b>, git\'in commit kancasına (hook) bağlanan bir araçtır. Her <code>git commit</code> öncesinde tanımlı araçları yalnızca değişen dosyalarda çalıştırır; biri başarısız olursa commit yapılmaz. Yapılandırma <code>.pre-commit-config.yaml</code> dosyasındadır:</p>
<pre class="code">repos:
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.6.9
    hooks:
      - id: ruff
        args: [--fix]
      - id: ruff-format
  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.11.2
    hooks:
      - id: mypy</pre>
<p>Kurulum iki komut: <code>pip install pre-commit</code> ve <code>pre-commit install</code>. İlk kez tüm projede çalıştırmak için <code>pre-commit run --all-files</code>. Ekip için anlamı şu: biçim tartışması pull request\'e hiç gelmez, inceleme (review) mantığa odaklanır.</p>

<h2>GitHub Actions ile CI</h2>
<p>Yerel kanca kişisel bir güvencedir; birisi <code>--no-verify</code> ile atlayabilir. CI, aynı kontrolleri sunucuda, herkes için, her push\'ta çalıştırır. GitHub Actions iş akışı (workflow) <code>.github/workflows/ci.yml</code> içinde YAML olarak tanımlanır:</p>
<pre class="code">name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  kalite:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python: ["3.11", "3.12"]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: $&#123;&#123; matrix.python &#125;&#125;
      - run: pip install -e ".[dev]"
      - run: ruff check .
      - run: ruff format --check .
      - run: mypy src/
      - run: pytest --cov=anadolu --cov-fail-under=80</pre>
<p>Yapı üç katmanlıdır: <b>on</b> ne zaman tetikleneceğini, <b>jobs</b> hangi işlerin çalışacağını, her işteki <b>steps</b> sıralı adımları belirtir. Bir adım ya hazır bir eylem kullanır (<code>uses</code>) ya da bir kabuk komutu çalıştırır (<code>run</code>). <code>matrix</code> aynı işi birden fazla Python sürümünde koşturur. Son satırdaki <code>--cov-fail-under=80</code>, kapsam eşiğin altına düşerse işi kırmızıya boyar.</p>
<p>YAML yazarken yapıyı kafanda bir Python sözlüğü gibi tut: iş akışı bir dict, <code>jobs</code> bir dict, <code>steps</code> bir dict listesi. Aşağıdaki örnek, aynı yapıyı Python sözlüğü olarak kuruyor ve kurallara uyup uymadığını denetliyor; alıştırmada bunu tam bir doğrulayıcıya çevireceksin:</p>
<pre class="py">akis = {
    "name": "CI",
    "on": ["push", "pull_request"],
    "jobs": {
        "kalite": {
            "runs-on": "ubuntu-latest",
            "steps": [
                {"uses": "actions/checkout@v4"},
                {"run": "pip install -e ."},
                {"run": "pytest"},
            ],
        }
    },
}

for ad, is_ in akis["jobs"].items():
    adimlar = is_.get("steps", [])
    print(f"{ad}: {len(adimlar)} adım, runs-on={is_.get('runs-on')}")
    for i, adim in enumerate(adimlar, 1):
        tur = "uses" if "uses" in adim else "run"
        print(f"  {i}. {tur}: {adim[tur]}")</pre>
<div class="note"><b>Gizli bilgiler</b>API anahtarı ve parolayı YAML\'a yazma; depo ayarlarındaki Secrets bölümüne koy ve <code>$&#123;&#123; secrets.DB_PASSWORD &#125;&#125;</code> ile oku. Loglarda otomatik maskelenir.</div>

<h2>Kod inceleme listesi</h2>
<p>Araçlar biçimi ve tipi denetler; mantığı insan denetler. Pull request incelerken şu listeyi sırayla geç:</p>
<div class="steps-list"><ol>
<li><b>Amaç:</b> PR açıklaması ne yapıldığını ve neden yapıldığını söylüyor mu? Tek bir konuya mı odaklanmış?</li>
<li><b>Test:</b> Yeni davranışın testi var mı? Hata senaryosu (boş liste, None, negatif tutar) test edilmiş mi?</li>
<li><b>Adlandırma:</b> Fonksiyon adı ne yaptığını söylüyor mu? <code>veri2</code>, <code>tmp</code>, <code>islem_yap</code> gibi adlar var mı?</li>
<li><b>Hata yönetimi:</b> Çıplak <code>except:</code> var mı? Hata yutuluyor mu, loglanıyor mu?</li>
<li><b>Yan etki:</b> Fonksiyon parametresini (listeyi, sözlüğü) yerinde değiştiriyor mu? Global durum var mı?</li>
<li><b>Gereksiz karmaşıklık:</b> Aynı iş daha az kodla, standart kütüphaneyle yapılabilir mi?</li>
<li><b>Güvenlik:</b> Kullanıcı girdisi SQL\'e, kabuk komutuna, dosya yoluna doğrudan gidiyor mu? Gizli bilgi kodda mı?</li>
</ol></div>
<p>Yorumlarda ton önemli: "Bu yanlış" yerine "Burada tutar None gelirse ne olur?" diye sor. İyi inceleme, yazarın öğrenmesini sağlar; kötü inceleme bir sonraki PR\'ı geciktirir.</p>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Kalite kapıları (quality gates)</h3>
<p>Kurumsal ekiplerde ana dala birleştirme (merge) için koşullar tanımlanır: CI yeşil, en az bir onay, kapsam düşmemiş, tip hatası sıfır. GitHub\'da "branch protection" ile bu kapılar zorunlu kılınır. Kapıları kademeli sıkılaştır; ilk gün yüzde doksan kapsam istemek ekibi küstürür.</p>
<h3>Hızlı CI</h3>
<p>Yavaş CI, atlanan CI\'dır. Üç pratik: bağımlılıkları önbelleğe al (<code>actions/setup-python</code> içindeki <code>cache: pip</code>), yalnızca değişen testleri önce koş (<code>pytest --lf</code>), yavaş entegrasyon testlerini ayrı işe taşı ve yalnızca ana dalda çalıştır.</p>
<h3>ruff kural seçimi</h3>
<p>Tüm kuralları açmak gürültü yaratır. Başlangıç seti <code>E, F, I</code>; olgun projede <code>B</code> (bugbear: mutable default, gereksiz lambda), <code>UP</code> (pyupgrade: eski sözdizimi), <code>SIM</code> (sadeleştirme) eklenir. Her kuralı kapatırken <code>ignore</code> listesine yorum yaz: altı ay sonra neden kapattığını hatırlamazsın.</p>
<h3>Tip denetimini kademeli açmak</h3>
<p>Eski kod tabanında mypy önce yüzlerce hata verir. Çözüm: <code>[[tool.mypy.overrides]]</code> ile eski modüllere <code>ignore_errors = true</code>, yeni modüllere <code>strict = true</code>. Her dokunulan modül sıkı moda taşınır; birkaç ayda tüm taban temizlenir.</p>
</section>`,
  ex: [
    { t: 'code', id: 'kalite-ci-1',
      q: '<p>Kaynak kodu metin olarak alan <code>uzun_satirlar(kod, limit=88)</code> fonksiyonunu yaz. Uzunluğu <code>limit</code>\'i aşan satırlar için <code>(satir_no, uzunluk)</code> demetlerinden oluşan liste döndürsün; satır numarası 1\'den başlasın. Satır sonundaki <code>\\n</code> uzunluğa dahil değil.</p>',
      start: 'def uzun_satirlar(kod, limit=88):\n    pass\n',
      sol: 'def uzun_satirlar(kod, limit=88):\n    sonuc = []\n    for no, satir in enumerate(kod.splitlines(), 1):\n        if len(satir) > limit:\n            sonuc.append((no, len(satir)))\n    return sonuc\n',
      tests: 'kod = "import os\\n" + "x = " + "1 + " * 30 + "1\\n" + "y = 2\\n"\nr = uzun_satirlar(kod)\nassert r == [(2, 125)], f"2. satır 125 karakter olmalı, gelen {r}"\nassert uzun_satirlar(kod, 200) == [], "limit 200 ise hiçbir satır uzun değil"\nassert uzun_satirlar("a = 1\\nbb = 22\\n", 5) == [(2, 7)], "limit 5 ile yalnızca 2. satır"\nassert uzun_satirlar("") == [], "boş kod boş liste"\n',
      hints: ['kod.splitlines() satır sonlarını atar.', 'enumerate(..., 1) ile 1 tabanlı numara al.'],
      why: 'ruff E501 kuralının çekirdeği tam olarak budur: satır satır gez, uzunluğu ölç, limiti aşanları bildir.' },
    { t: 'code', id: 'kalite-ci-2',
      q: '<p><code>ast</code> modülüyle <code>print_bul(kod)</code> fonksiyonunu yaz: kodda <code>print(...)</code> olarak çağrılan her yerin satır numarasını artan sırada liste olarak döndürsün. Yalnızca doğrudan <code>print</code> adıyla yapılan çağrılar sayılsın; <code>logger.print(...)</code> gibi nitelik çağrıları sayılmasın.</p>',
      start: 'import ast\n\ndef print_bul(kod):\n    pass\n',
      sol: 'import ast\n\ndef print_bul(kod):\n    agac = ast.parse(kod)\n    satirlar = []\n    for d in ast.walk(agac):\n        if isinstance(d, ast.Call) and isinstance(d.func, ast.Name) and d.func.id == "print":\n            satirlar.append(d.lineno)\n    return sorted(satirlar)\n',
      tests: 'kod = "def f(x):\\n    print(x)\\n    y = x * 2\\n    logger.print(y)\\n    if y:\\n        print(\\"ok\\")\\n    return y\\n"\nassert print_bul(kod) == [2, 6], f"print satırları [2, 6] olmalı, gelen {print_bul(kod)}"\nassert print_bul("x = 1\\n") == [], "print yoksa boş liste"\nassert print_bul("print(1); print(2)\\n") == [1, 1], "aynı satırda iki print iki kez sayılır"\n',
      hints: ['ast.parse(kod) ağacı verir; ast.walk ile tüm düğümleri gez.', 'ast.Call düğümünün .func alanı ast.Name ise .id adı verir; .lineno satır numarasıdır.'],
      why: 'Linter mantığı: ağacı gez, ilgilendiğin düğüm türünü filtrele, konumunu bildir. ast.Attribute olan çağrılar (logger.print) ast.Name koşulunda elenir.' },
    { t: 'code', id: 'kalite-ci-3',
      q: '<p><code>kullanilmayan_importlar(kod)</code> fonksiyonunu yaz: <code>import x</code>, <code>import x as y</code> ve <code>from m import x</code> biçimlerinde bağlanan adları toplasın; kod gövdesinde <code>ast.Name</code> olarak hiç geçmeyenleri import sırasıyla liste olarak döndürsün. <code>import os.path</code> için bağlanan ad <code>os</code>\'tur; <code>as</code> varsa takma ad bağlanır.</p>',
      start: 'import ast\n\ndef kullanilmayan_importlar(kod):\n    pass\n',
      sol: 'import ast\n\ndef kullanilmayan_importlar(kod):\n    agac = ast.parse(kod)\n    import_edilen = []\n    for d in ast.walk(agac):\n        if isinstance(d, (ast.Import, ast.ImportFrom)):\n            for alias in d.names:\n                ad = alias.asname or alias.name.split(".")[0]\n                import_edilen.append(ad)\n    kullanilan = {d.id for d in ast.walk(agac) if isinstance(d, ast.Name)}\n    return [ad for ad in import_edilen if ad not in kullanilan]\n',
      tests: 'kod = "import os\\nimport json\\nimport numpy as np\\nfrom collections import Counter, deque\\nimport os.path\\n\\ndef f(x):\\n    return json.dumps(Counter(x))\\n"\nr = kullanilmayan_importlar(kod)\nassert r == ["os", "np", "deque", "os"], f"beklenen [\'os\', \'np\', \'deque\', \'os\'], gelen {r}"\nassert kullanilmayan_importlar("import re\\nprint(re.sub)\\n") == [], "re kullanılıyor"\nassert kullanilmayan_importlar("x = 1\\n") == [], "import yoksa boş"\n',
      hints: ['ast.Import ve ast.ImportFrom düğümlerinin .names listesi alias nesneleri içerir: .name ve .asname.', 'Bağlanan ad: asname varsa o, yoksa name\'in ilk noktadan önceki kısmı.', 'Kullanılan adlar: ast.Name düğümlerinin .id kümesi.'],
      why: 'ruff F401 kuralı bu mantıkla çalışır. json.dumps çağrısında json bir ast.Name olarak göründüğü için kullanılmış sayılır; os ve np hiç geçmediğinden raporlanır.' },
    { t: 'mc', q: 'ruff ile black arasındaki temel fark nedir?',
      o: ['ruff yalnızca import sıralar, black ise lint ve tip denetimi yapar', 'black biçimlendirir; ruff lint yapar ve biçimlendirebilir', 'İkisi de yalnızca biçimlendirir, aralarında tek fark ruff\'ın daha yavaş olmasıdır', 'black tip denetimi de yapar'], a: 1,
      why: 'black yalnızca biçimlendiricidir. ruff bir linter olarak başladı, ruff format ile biçimlendirme de ekledi ve Rust sayesinde çok hızlıdır. Tip denetimi mypy\'nin işidir.' },
    { t: 'code', id: 'kalite-ci-4',
      q: '<p>pytest fixture benzeri bir yardımcı yaz: <code>gecici_hesaplar(gunluk)</code> bir bağlam yöneticisi (contextmanager) olsun. Girişte <code>gunluk</code> listesine <code>"kurulum"</code> eklesin ve <code>{"TR1": 1000, "TR2": 250}</code> sözlüğünün <b>yeni bir kopyasını</b> versin; çıkışta, blok hata verse bile, <code>"temizlik"</code> eklesin.</p>',
      start: 'from contextlib import contextmanager\n\n@contextmanager\ndef gecici_hesaplar(gunluk):\n    pass\n',
      sol: 'from contextlib import contextmanager\n\n@contextmanager\ndef gecici_hesaplar(gunluk):\n    gunluk.append("kurulum")\n    hesaplar = {"TR1": 1000, "TR2": 250}\n    try:\n        yield hesaplar\n    finally:\n        gunluk.append("temizlik")\n',
      tests: 'g = []\nwith gecici_hesaplar(g) as h:\n    h["TR1"] -= 100\n    assert h["TR1"] == 900, "sözlük değiştirilebilir olmalı"\nassert g == ["kurulum", "temizlik"], f"günlük [kurulum, temizlik] olmalı, gelen {g}"\nwith gecici_hesaplar(g) as h2:\n    assert h2["TR1"] == 1000, "her kullanımda taze sözlük verilmeli"\ng2 = []\ntry:\n    with gecici_hesaplar(g2):\n        raise ValueError("x")\nexcept ValueError:\n    pass\nassert g2 == ["kurulum", "temizlik"], "hata olsa da temizlik çalışmalı"\n',
      hints: ['yield öncesi kurulum, sonrası temizlik.', 'try: yield ... finally: temizlik ile hata durumunda da temizlik garanti olur.', 'Sözlüğü her çağrıda fonksiyon içinde yeniden oluştur.'],
      why: 'pytest fixture\'larındaki yield deseni birebir budur. finally bloğu, test hata verse de kaynağın kapanmasını sağlar; sözlüğü her girişte yeniden kurmak testlerin birbirini etkilemesini önler.' },
    { t: 'code', id: 'kalite-ci-5',
      q: '<p>GitHub Actions iş akışını temsil eden sözlüğü doğrulayan <code>is_akisi_dogrula(akis)</code> fonksiyonunu yaz. Hata mesajlarını (str) liste olarak döndürsün; sorun yoksa boş liste. Kurallar ve mesajlar:</p><ul><li><code>"name"</code> yoksa: <code>"name eksik"</code></li><li><code>"on"</code> yoksa: <code>"on eksik"</code></li><li><code>"jobs"</code> yoksa ya da boş sözlükse: <code>"jobs boş"</code> (bu durumda iş kontrolü yapılmaz)</li><li>Her iş için <code>"runs-on"</code> yoksa: <code>"{is}: runs-on eksik"</code></li><li>Her iş için <code>"steps"</code> yoksa ya da boş listeyse: <code>"{is}: steps boş"</code></li><li>Her adımda ne <code>"uses"</code> ne <code>"run"</code> varsa: <code>"{is}: adım {i} uses/run içermiyor"</code> (i 1\'den başlar)</li></ul>',
      start: 'def is_akisi_dogrula(akis):\n    hatalar = []\n    pass\n',
      sol: 'def is_akisi_dogrula(akis):\n    hatalar = []\n    if "name" not in akis:\n        hatalar.append("name eksik")\n    if "on" not in akis:\n        hatalar.append("on eksik")\n    jobs = akis.get("jobs")\n    if not jobs:\n        hatalar.append("jobs boş")\n        return hatalar\n    for ad, is_ in jobs.items():\n        if "runs-on" not in is_:\n            hatalar.append(f"{ad}: runs-on eksik")\n        adimlar = is_.get("steps")\n        if not adimlar:\n            hatalar.append(f"{ad}: steps boş")\n            continue\n        for i, adim in enumerate(adimlar, 1):\n            if "uses" not in adim and "run" not in adim:\n                hatalar.append(f"{ad}: adım {i} uses/run içermiyor")\n    return hatalar\n',
      tests: 'iyi = {"name": "CI", "on": ["push"], "jobs": {"test": {"runs-on": "ubuntu-latest", "steps": [{"uses": "actions/checkout@v4"}, {"run": "pytest"}]}}}\nassert is_akisi_dogrula(iyi) == [], "geçerli akış hata vermemeli"\nkotu = {"on": ["push"], "jobs": {"test": {"steps": [{"uses": "a"}, {"name": "x"}]}, "lint": {"runs-on": "ubuntu-latest", "steps": []}}}\nr = is_akisi_dogrula(kotu)\nassert r == ["name eksik", "test: runs-on eksik", "test: adım 2 uses/run içermiyor", "lint: steps boş"], f"gelen {r}"\nassert is_akisi_dogrula({"name": "x"}) == ["on eksik", "jobs boş"], "jobs boşsa iş kontrolü yapılmaz"\nassert is_akisi_dogrula({"name": "x", "on": "push", "jobs": {}}) == ["jobs boş"], "boş jobs sözlüğü"\n',
      hints: ['Önce üst seviye anahtarları kontrol et; jobs boşsa hemen döndür.', 'Her iş için runs-on ve steps kontrolü, ardından enumerate(steps, 1) ile adımlar.'],
      why: 'YAML doğrulayıcılar aynı mantıkla çalışır: zorunlu anahtarlar, boş olmayan koleksiyonlar, her öğenin asgari alanları. Mesajların sırası kontrol sırasını izler.' },
    { t: 'mc', q: 'pre-commit kancası (hook) ne zaman çalışır ve başarısız olursa ne olur?',
      o: ['Her push\'ta sunucuda çalışır; başarısızsa PR kapanır', 'git commit anında yerelde çalışır; başarısızsa commit oluşmaz', 'Yalnızca pytest çalıştırır', 'Her dosya kaydedildiğinde editörde çalışır'], a: 1,
      why: 'pre-commit git\'in commit kancasına bağlanır ve değişen dosyalarda araçları koşturur; biri hata verirse commit yapılmaz. Sunucu tarafı denetim CI\'nın işidir.' },
    { t: 'code', id: 'kalite-ci-6',
      q: '<p>Kapsam raporu üreten <code>kapsam_raporu(dosyalar)</code> fonksiyonunu yaz. <code>dosyalar</code>, dosya adını <code>(toplam_satir, calisan_satir)</code> demetine eşleyen bir sözlük. Dönüş: her dosya için yüzdeyi (1 ondalık, float) içeren sözlük ve ek olarak <code>"TOPLAM"</code> anahtarında tüm satırlar üzerinden hesaplanan genel yüzde. Toplam satırı 0 olan dosyanın yüzdesi 100.0 sayılsın.</p>',
      start: 'def kapsam_raporu(dosyalar):\n    pass\n',
      sol: 'def kapsam_raporu(dosyalar):\n    rapor = {}\n    toplam = calisan = 0\n    for ad, (t, c) in dosyalar.items():\n        rapor[ad] = round(c / t * 100, 1) if t else 100.0\n        toplam += t\n        calisan += c\n    rapor["TOPLAM"] = round(calisan / toplam * 100, 1) if toplam else 100.0\n    return rapor\n',
      tests: 'r = kapsam_raporu({"rfm.py": (40, 36), "cli.py": (20, 10), "__init__.py": (0, 0)})\nassert r["rfm.py"] == 90.0, "rfm 90.0"\nassert r["cli.py"] == 50.0, "cli 50.0"\nassert r["__init__.py"] == 100.0, "boş dosya 100.0"\nassert abs(r["TOPLAM"] - 76.7) < 1e-9, f"toplam 46/60 = 76.7 olmalı, gelen {r[\'TOPLAM\']}"\nassert kapsam_raporu({}) == {"TOPLAM": 100.0}, "boş girdi yalnızca TOPLAM"\n',
      hints: ['Dosya yüzdesi: calisan / toplam * 100, round(..., 1).', 'Genel yüzde dosya yüzdelerinin ortalaması değil; satır toplamları üzerinden hesaplanır.'],
      why: 'coverage.py raporunun TOTAL satırı satır toplamlarından hesaplanır; dosya yüzdelerinin ortalaması küçük dosyaları abartır. Sıfır satırlı dosya bölme hatasına yol açmasın diye ayrıca ele alınır.' }
  ],
  faq: [
    { q: 'ruff varken black ve isort hâlâ gerekli mi?', a: 'Yeni projede hayır: ruff check (I kuralıyla import sıralama dahil) ve ruff format ikisinin işini görür. Eski projelerde üçlüyü birlikte görebilirsin; aynı anda iki biçimlendirici çalıştırmak çatışma yaratabilir, birini seç.' },
    { q: 'Testler yerelde geçiyor, CI\'da patlıyor. Neden?', a: 'En sık nedenler: CI\'da farklı Python sürümü (matrix), eksik bağımlılık (pyproject\'e yazılmamış), yerel bir dosyaya ya da ortam değişkenine bağımlılık, zaman dilimi veya dosya yolu farkı (Windows/Linux). CI loglarını baştan oku; ilk hata gerçek nedendir.' },
    { q: 'mypy strict çok hata veriyor, ne yapmalıyım?', a: 'Kademeli aç: eski modüllere override ile ignore_errors, yeni modüllere strict. Her dokunduğun modülü sıkı moda taşı. Dış kütüphanenin tip bilgisi yoksa types-* paketini kur ya da ignore_missing_imports kullan.' },
    { q: 'Kapsam hedefi kaç olmalı?', a: 'Tek bir doğru sayı yok. Kritik iş mantığı (ücret, faiz, stok) yüksek, otomatik üretilen kod ve basit CLI düşük olabilir. Pratik kural: kapsamı düşürmeyen PR kabul edilir; eşik mevcut değerin biraz altına konur ve zamanla yükseltilir.' }
  ],
  mistakes: [
    { bad: 'def ekle(x, liste=[]):\n    liste.append(x)\n    return liste', good: 'def ekle(x, liste=None):\n    if liste is None:\n        liste = []\n    liste.append(x)\n    return liste', why: 'Mutable varsayılan değer çağrılar arasında paylaşılır; ruff B006 bunu yakalar. None kullanıp içeride oluştur.' },
    { bad: 'try:\n    tutar = float(s)\nexcept:\n    tutar = 0', good: 'try:\n    tutar = float(s)\nexcept ValueError:\n    tutar = 0.0', why: 'Çıplak except KeyboardInterrupt ve SystemExit dahil her şeyi yutar; ruff E722 uyarır. Beklediğin istisnayı yakala.' },
    { bad: 'import os, sys, json\nprint(json.dumps({}))', good: 'import json\n\nprint(json.dumps({}))', why: 'Kullanılmayan import (F401) gürültü ve yanlış bağımlılık izlenimi yaratır; tek satırda çoklu import (E401) stil kuralını bozar.' },
    { bad: 'def test_toplam():\n    toplam_tutar([{"tutar": 1}])', good: 'def test_toplam():\n    assert toplam_tutar([{"tutar": 1}]) == 1', why: 'assert içermeyen test kapsamı yükseltir ama hiçbir şeyi doğrulamaz; fonksiyon yanlış sonuç verse de yeşil kalır.' }
  ]
}
