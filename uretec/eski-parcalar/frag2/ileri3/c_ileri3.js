/* Kesit Python — İleri 3: Üretime Hazırlık ve Bitirme (kalite-ci, mulakat-hazirlik, proje-ileri) */
// needs: pandas
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push(
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
<p>Ilgaz Bank\'ın kredi skorlama paketini üç kişi geliştiriyor. Biri sekmeyle, diğeri boşlukla girinti yapıyor; birinin bıraktığı <code>print</code> çağrısı üretim logunu dolduruyor; <code>None</code> dönebilen bir fonksiyon başka bir yerde <code>.upper()</code> ile çağrılıyor ve gece yarısı çöküyor. Bunların hiçbiri "dikkat etmekle" çözülmez; insan dikkati tükenir, araçlar tükenmez. Kalite otomasyonu (quality automation), bu kontrolleri makineye devretmek ve her commit\'te, her pull request\'te aynı standardı uygulamaktır.</p>
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
,
/* ───────────────────────── 2. mulakat-hazirlik ───────────────────────── */
{
  id: 'mulakat-hazirlik',
  lv: 'ileri',
  mod: 'Üretime Hazırlık',
  min: 50,
  title: 'Mülakat hazırlığı: Python soruları, algoritmalar, canlı kodlama',
  sum: 'Teknik mülakatlarda sık sorulan Python kavram sorularını, klasik algoritma görevlerini ve canlı kodlama tekniklerini çalışırsın.',
  goals: [
    'GIL, mutable default, is/==, shallow/deep copy, generator, decorator ve __slots__ sorularına net ve kısa cevap verebilirim.',
    'İki toplam, anagram grupları, en uzun ardışık dizi gibi klasik görevleri sözlük ve küme ile O(n) çözebilirim.',
    'Kayan pencere, iki pointer, ikili arama ve BFS kalıplarını tanıyıp uygun soruda kullanabilirim.',
    'Çözümün zaman ve bellek karmaşıklığını Big-O ile açıklayabilirim.',
    'Canlı kodlamada soruyu netleştirme, örnekle düşünme, kaba çözümden iyileştirme adımlarını uygulayabilirim.'
  ],
  body: `
<h2>Mülakat neyi ölçer?</h2>
<p>Anadolu Market\'in veri ekibine Python geliştirici alınıyor. İlk tur kavram soruları: "GIL nedir, pandas\'ı neden etkilemez?" İkinci tur canlı kodlama: "Şu sipariş listesinde toplamı X eden iki ürünü bul." Üçüncü tur sistem tasarımı: "Günde milyonlarca siparişi işleyen bir boru hattını nasıl kurarsın?" Üç tur üç farklı şeyi ölçer: dili gerçekten anlıyor musun, problemi yapılandırılmış biçimde çözebiliyor musun, büyük resmi görüyor musun. Bu ders üçünü de çalıştırır; ağırlık ikinci turda, çünkü en çok orada elenilir.</p>

<h2>Sık sorulan Python kavram soruları</h2>
<p>Aşağıdaki tablo, mülakatlarda en sık çıkan kavram sorularını ve bir cümlelik çekirdek cevaplarını listeler. Cevabı ezberleme; her birini küçük bir örnekle gösterebilecek kadar anla.</p>
<div class="tbl-wrap"><table>
<tr><th>Soru</th><th>Çekirdek cevap</th><th>Takip sorusu</th></tr>
<tr><td>GIL nedir?</td><td>CPython\'da aynı anda yalnızca bir iş parçacığının Python bytecode çalıştırmasına izin veren kilit</td><td>Neden threading I/O için işe yarar ama CPU için yaramaz? (I/O beklerken kilit bırakılır; numpy/pandas C kodu da bırakır)</td></tr>
<tr><td>Mutable default argüman</td><td>Varsayılan değer tanım anında bir kez oluşur; liste/sözlük çağrılar arasında paylaşılır</td><td>Çözüm? (None + içeride oluştur)</td></tr>
<tr><td>is ile == farkı</td><td>is kimlik (aynı nesne mi), == eşitlik (__eq__)</td><td>Neden <code>x is None</code> doğru, <code>x == None</code> yanlış stil? (None tekildir; __eq__ ezilebilir)</td></tr>
<tr><td>Shallow / deep copy</td><td>Shallow dış kabı kopyalar, iç nesneler paylaşılır; deep özyinelemeli kopyalar</td><td>list(x), x[:], x.copy() hangisi? (hepsi shallow)</td></tr>
<tr><td>Generator vs list</td><td>Generator tembel, tek geçişlik, O(1) bellek; liste tüm veriyi tutar, tekrar gezilir</td><td>sum(x*x for x in r) neden sum([x*x for x in r])\'den iyi?</td></tr>
<tr><td>Decorator</td><td>Fonksiyon alıp fonksiyon döndüren fonksiyon; @ sözdizimi şekerdir</td><td>functools.wraps neden? (ad ve docstring korunur)</td></tr>
<tr><td>__slots__</td><td>Örnek başına __dict__ yerine sabit alanlar; bellek ve erişim hızı kazancı</td><td>Dezavantaj? (dinamik nitelik eklenemez, çoklu kalıtımda dikkat)</td></tr>
</table></div>
<p>Üçünü kodla doğrula; mülakatta "göstereyim" diyebilmek güven verir:</p>
<pre class="py">import copy

# is vs ==
a = [1, 2]
b = [1, 2]
print(a == b, a is b)          # True False

# shallow vs deep
siparis = {"id": 1, "urunler": ["kalem"]}
s1 = siparis.copy()
s2 = copy.deepcopy(siparis)
siparis["urunler"].append("defter")
print(s1["urunler"], s2["urunler"])   # paylaşılan liste / bağımsız liste

# mutable default
def ekle(x, kutu=[]):
    kutu.append(x)
    return kutu
print(ekle(1), ekle(2))        # aynı liste iki kez

# __slots__
class Nokta:
    __slots__ = ("x", "y")
    def __init__(self, x, y):
        self.x, self.y = x, y
n = Nokta(1, 2)
print(hasattr(n, "__dict__"))  # False</pre>

<h2>Algoritma soruları: kalıpları tanı</h2>
<p>Mülakat sorularının büyük kısmı beş altı kalıba iner. Soruyu duyunca kalıbı tanırsan çözümün yarısı bitmiştir.</p>
<h3>1. Sözlükle sayım ve arama: iki toplam</h3>
<p>"Listede toplamı hedef eden iki elemanın indekslerini bul." Kaba yol çift döngü, O(n²). Akıllı yol: gördüğün her sayıyı sözlüğe koy, sıradaki sayının tamamlayıcısı (hedef - sayı) sözlükte mi diye bak. Tek geçiş, O(n).</p>
<pre class="py">def iki_toplam(sayilar, hedef):
    gorulen = {}                       # değer -&gt; indeks
    for i, s in enumerate(sayilar):
        kalan = hedef - s
        if kalan in gorulen:
            return [gorulen[kalan], i]
        gorulen[s] = i
    return []

fiyatlar = [250, 90, 410, 160, 300]
print(iki_toplam(fiyatlar, 500))   # 250 + 250 yok; 90 + 410 -&gt; [1, 2]
print(iki_toplam(fiyatlar, 1000))  # []</pre>
<p>Aynı kalıp "anagram grupları"nda anahtarı sıralanmış harfler yaparak, "en çok tekrar eden ürün"de <code>Counter</code> ile görünür. Soru "bul, say, grupla" diyorsa sözlük düşün.</p>

<h3>2. Küme ile O(n): en uzun ardışık dizi</h3>
<p>"Sırasız sayılarda en uzun ardışık sayı dizisinin uzunluğu?" Sıralamak O(n log n). Küme ile O(n): her sayı için, bir eksiği kümede yoksa bu bir dizinin başıdır; ileri say.</p>
<pre class="py">def en_uzun_ardisik(sayilar):
    kume = set(sayilar)
    en_iyi = 0
    for s in kume:
        if s - 1 not in kume:          # yalnızca dizi başlarından say
            n = 1
            while s + n in kume:
                n += 1
            en_iyi = max(en_iyi, n)
    return en_iyi

print(en_uzun_ardisik([100, 4, 200, 1, 3, 2]))   # 1,2,3,4 -&gt; 4</pre>
<p>Neden O(n)? Her sayı yalnızca ait olduğu dizinin başından itibaren bir kez sayılır. Mülakatçı "neden while içinde while var ama O(n)?" diye sorar; cevap bu.</p>

<h3>3. Kayan pencere (sliding window)</h3>
<p>"Art arda k günün en yüksek toplam cirosu" ya da "tekrarsız en uzun alt dize." Sabit ya da esneyen bir pencereyi sağa kaydırırsın; giren elemanı ekler, çıkanı çıkarırsın. Her adımda yeniden toplamak O(n·k); pencereyle O(n).</p>
<pre class="py">def en_iyi_pencere(ciro, k):
    toplam = sum(ciro[:k])
    en_iyi, bas = toplam, 0
    for i in range(k, len(ciro)):
        toplam += ciro[i] - ciro[i - k]
        if toplam &gt; en_iyi:
            en_iyi, bas = toplam, i - k + 1
    return bas, en_iyi

gunluk = [120, 300, 80, 450, 200, 90, 310]
print(en_iyi_pencere(gunluk, 3))   # (1, 830): 300+80+450</pre>

<h3>4. İki pointer ve ikili arama</h3>
<p>Sıralı veride iki uçtan ortaya yürümek (iki pointer) ya da ortadan ikiye bölmek (ikili arama, O(log n)) klasik kalıplardır. <code>bisect</code> modülü ikili aramayı hazır verir ama mülakatta elle yazmanı isterler: <code>lo, hi</code> sınırları ve <code>mid</code> hesabı; döngü <code>lo &lt;= hi</code> sürdükçe.</p>
<pre class="py">def ikili_ara(sirali, hedef):
    lo, hi = 0, len(sirali) - 1
    while lo &lt;= hi:
        mid = (lo + hi) // 2
        if sirali[mid] == hedef:
            return mid
        if sirali[mid] &lt; hedef:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1

print(ikili_ara([3, 8, 15, 21, 42, 57], 21))   # 3
print(ikili_ara([3, 8, 15, 21, 42, 57], 22))   # -1</pre>

<h3>5. BFS: en kısa yol</h3>
<p>Grafta "A\'dan B\'ye en az kaç adım?" sorusunda genişlik öncelikli arama (BFS) kullanılır: kuyruk (<code>collections.deque</code>) ve ziyaret edilenler kümesi. Depo ağı, sosyal bağlantı, kelime merdiveni; hepsi aynı kalıp.</p>
<pre class="py">from collections import deque

depolar = {
    "İstanbul": ["Bursa", "Kocaeli"],
    "Bursa": ["İstanbul", "Eskişehir"],
    "Kocaeli": ["İstanbul", "Ankara"],
    "Eskişehir": ["Bursa", "Ankara"],
    "Ankara": ["Kocaeli", "Eskişehir"],
}

def en_kisa_adim(graf, bas, hedef):
    kuyruk = deque([(bas, 0)])
    ziyaret = {bas}
    while kuyruk:
        dugum, adim = kuyruk.popleft()
        if dugum == hedef:
            return adim
        for komsu in graf.get(dugum, []):
            if komsu not in ziyaret:
                ziyaret.add(komsu)
                kuyruk.append((komsu, adim + 1))
    return -1

print(en_kisa_adim(depolar, "İstanbul", "Ankara"))   # 2</pre>
<div class="warn"><b>Ziyareti kuyruğa eklerken işaretle</b>Kuyruktan çıkarırken işaretlersen aynı düğüm kuyruğa birden çok kez girer; büyük grafta süre patlar. Kümeye ekleme anı, kuyruğa ekleme anıyla aynı olmalı.</div>

<h2>Karmaşıklık: Big-O konuşabilmek</h2>
<p>Her çözümden sonra mülakatçı "karmaşıklığı ne?" diye sorar. Kısa sözlük: sözlük/küme erişimi O(1) ortalama; listede arama O(n); sıralama O(n log n); çift döngü O(n²); ikili arama O(log n); BFS O(V + E). Bellek için de aynı soru gelir: ek sözlük tutuyorsan O(n) bellek. "Daha iyisi var mı?" sorusuna, mümkünse "hayır, çünkü her elemana en az bir kez bakmak gerekir" gibi bir alt sınır argümanı ver.</p>
<div class="tip"><b>Python\'a özgü püf noktalar</b><code>in</code> listede O(n), kümede O(1). String birleştirmede döngüde <code>+=</code> yerine liste toplayıp <code>"".join</code>. <code>list.pop(0)</code> O(n), <code>deque.popleft()</code> O(1). Bunları söylemek "dili biliyor" izlenimi verir.</div>

<h2>Canlı kodlama ipuçları</h2>
<div class="steps-list"><ol>
<li><b>Soruyu tekrar et ve netleştir:</b> Girdi boş olabilir mi? Negatif sayı var mı? Tekrar eden eleman? Çıktı indeks mi değer mi? Her soru bir puan.</li>
<li><b>Küçük bir örnek yaz:</b> 4-5 elemanlı girdi ve beklenen çıktı. Örnek olmadan kod yazma.</li>
<li><b>Önce kaba çözümü söyle:</b> "Çift döngüyle O(n²) olur; sözlükle O(n)\'e indirebilirim." Mülakatçı düşünme sürecini görmek ister.</li>
<li><b>Sesli düşün, sessiz yazma:</b> Takıldığında "burada iki seçenek var" de. Sessizlik en kötü sinyaldir.</li>
<li><b>Yazdıktan sonra örnekle izle:</b> Kodu satır satır örnek üzerinde yürüt. Kenar durumları (boş, tek eleman, hepsi aynı) kontrol et.</li>
<li><b>Karmaşıklığı kendin söyle:</b> Sorulmadan "zaman O(n), bellek O(n)" de.</li>
<li><b>Temiz ad ve küçük fonksiyon:</b> <code>a, b, tmp</code> yerine <code>gorulen, kalan</code>. Test edilebilir fonksiyon yaz, <code>print</code> ile değil <code>return</code> ile sonuç ver.</li>
</ol></div>

<h2>Sistem tasarımı için Python</h2>
<p>Üst düzey pozisyonlarda "Ilgaz Bank\'ın işlem akışını işleyen bir servis tasarla" tarzı sorular gelir. Beklenen, kod değil, bileşenler ve seçimler: giriş (API, kuyruk), işleme (worker havuzu), depolama (ilişkisel/belge), gözlemleme (log, metrik). Python özelinde şunları söyleyebilmek fark yaratır: I/O yoğun servis için asyncio + FastAPI; CPU yoğun iş için multiprocessing ya da ayrı worker; büyük veri için pandas yerine parçalı işleme ya da polars/duckdb; durum paylaşımı için Redis; kuyruk için Celery/RQ ya da bulut kuyruğu. Her seçimi "neden" ile bağla: "GIL yüzünden CPU işini thread\'e değil process\'e veririm."</p>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Soruyu kalıba indirgeme pratiği</h3>
<p>Her gün bir soru çöz ve çözümden sonra şu üç satırı yaz: kalıp (sözlük / küme / pencere / iki pointer / ikili arama / BFS-DFS / dinamik programlama), karmaşıklık, kenar durumları. Bir ay sonra soruları duyar duymaz kalıbı göreceksin. Dinamik programlama (en uzun ortak alt dizi, para üstü) ve heap (en büyük k eleman, <code>heapq.nlargest</code>) bu dersin kapsamı dışında kalan ama sık sorulan iki kalıptır; sırada onlar olsun.</p>
<h3>Yanlış ama sık verilen cevaplar</h3>
<p>"GIL Python\'ı tek çekirdekli yapar" (yanlış: multiprocessing ve C uzantıları çekirdekleri kullanır). "Tuple değişmezdir, içi de değişmez" (yanlış: tuple içindeki liste değişir). "Decorator yalnızca loglama içindir" (eksik: önbellek, yetki, yeniden deneme, kayıt). "is daha hızlıdır, hep onu kullan" (yanlış: kimlik ile eşitlik farklı sorulardır; küçük tamsayı önbelleği yanıltır).</p>
<h3>Ev ödevi projesi (take-home)</h3>
<p>Bazı şirketler canlı kodlama yerine ev ödevi verir. Değerlendirme ölçütleri: README (nasıl çalışır, nasıl test edilir), testler, tip ipuçları, lint temizliği, küçük ve odaklı commit\'ler, hata yönetimi. Bir önceki dersin kalite zincirini uygula; "çalışıyor" yetmez, "üretime konabilir" izlenimi ver.</p>
<h3>Davranışsal sorular</h3>
<p>"Zor bir hatayı nasıl buldun?" sorusuna STAR biçiminde cevap ver: Durum, Görev, Eylem, Sonuç. Teknik ayrıntı ver (profil aldım, darboğaz sorgu birleştirmedeydi, indeks ekledim) ama bir dakikayı geçme.</p>
</section>`,
  ex: [
    { t: 'code', id: 'mulakat-hazirlik-1',
      q: '<p><code>iki_toplam(sayilar, hedef)</code>: toplamı <code>hedef</code> eden iki farklı elemanın indekslerini <code>[kucuk, buyuk]</code> listesi olarak döndürsün; yoksa boş liste. Çözüm tek geçişte O(n) olmalı (sözlük kullan); çift döngü testte zaman aşımına düşer.</p>',
      start: 'def iki_toplam(sayilar, hedef):\n    pass\n',
      sol: 'def iki_toplam(sayilar, hedef):\n    gorulen = {}\n    for i, s in enumerate(sayilar):\n        kalan = hedef - s\n        if kalan in gorulen:\n            return [gorulen[kalan], i]\n        gorulen[s] = i\n    return []\n',
      tests: 'assert iki_toplam([250, 90, 410, 160, 300], 500) == [1, 2], "90 + 410"\nassert iki_toplam([3, 3], 6) == [0, 1], "aynı değerden iki tane farklı indeks"\nassert iki_toplam([1, 2, 3], 10) == [], "yoksa boş liste"\nassert iki_toplam([], 5) == [], "boş girdi"\nimport time\nbuyuk = list(range(200000))\nt0 = time.perf_counter()\nassert iki_toplam(buyuk, 399997) == [199998, 199999], "büyük girdi"\nassert time.perf_counter() - t0 < 2, "çözüm O(n) olmalı; çift döngü çok yavaş"\n',
      hints: ['Sözlükte değer -> indeks tut.', 'Her elemanda hedef - s sözlükte var mı diye bak; yoksa elemanı ekle.'],
      why: 'Zaman O(n), bellek O(n). Sözlük aramasının O(1) olması çift döngüyü tek geçişe indirir. Elemanı kontrolden sonra eklemek aynı indeksin iki kez kullanılmasını önler.' },
    { t: 'code', id: 'mulakat-hazirlik-2',
      q: '<p><code>anagram_gruplari(kelimeler)</code>: aynı harflerden oluşan kelimeleri gruplasın. Dönüş: her grup bir liste (girdi sırası korunur), gruplar ilk görülme sırasına göre dizilmiş liste.</p>',
      start: 'def anagram_gruplari(kelimeler):\n    pass\n',
      sol: 'def anagram_gruplari(kelimeler):\n    gruplar = {}\n    for k in kelimeler:\n        anahtar = "".join(sorted(k))\n        gruplar.setdefault(anahtar, []).append(k)\n    return list(gruplar.values())\n',
      tests: 'r = anagram_gruplari(["kalem", "melak", "defter", "lemak", "silgi", "ilgis"])\nassert r == [["kalem", "melak", "lemak"], ["defter"], ["silgi", "ilgis"]], f"gelen {r}"\nassert anagram_gruplari([]) == [], "boş girdi"\nassert anagram_gruplari(["a"]) == [["a"]], "tek kelime"\n',
      hints: ['Anahtar: "".join(sorted(kelime)).', 'dict.setdefault(anahtar, []).append(k) ile grupla; dict ekleme sırasını korur.'],
      why: 'Zaman O(n · k log k) (k kelime uzunluğu, sıralama için); bellek O(n). Sıralanmış harfler anagramlar için ortak anahtar üretir; sözlük ekleme sırasını koruduğundan grup sırası doğal olarak ilk görülme sırasıdır.' },
    { t: 'code', id: 'mulakat-hazirlik-3',
      q: '<p><code>en_uzun_ardisik(sayilar)</code>: sırasız tamsayı listesinde ardışık (1 farkla) sayılardan oluşan en uzun dizinin uzunluğunu döndürsün. Sıralama kullanmadan küme ile O(n) çöz. Boş liste için 0.</p>',
      start: 'def en_uzun_ardisik(sayilar):\n    pass\n',
      sol: 'def en_uzun_ardisik(sayilar):\n    kume = set(sayilar)\n    en_iyi = 0\n    for s in kume:\n        if s - 1 not in kume:\n            n = 1\n            while s + n in kume:\n                n += 1\n            en_iyi = max(en_iyi, n)\n    return en_iyi\n',
      tests: 'assert en_uzun_ardisik([100, 4, 200, 1, 3, 2]) == 4, "1,2,3,4"\nassert en_uzun_ardisik([]) == 0, "boş"\nassert en_uzun_ardisik([7, 7, 7]) == 1, "tekrarlar tek sayılır"\nassert en_uzun_ardisik([-2, -1, 0, 5, 6]) == 3, "negatifler"\nimport time\nbuyuk = list(range(0, 300000, 2)) + list(range(1, 100000, 2))\nt0 = time.perf_counter()\nassert en_uzun_ardisik(buyuk) == 100001, "0..100000 ardışık"\nassert time.perf_counter() - t0 < 3, "O(n) olmalı; her sayıdan ileri sayma O(n²) olur"\n',
      hints: ['Listeyi kümeye çevir.', 'Yalnızca s-1 kümede olmayan sayılardan (dizi başı) ileri say.'],
      why: 'Zaman O(n), bellek O(n). İç while yalnızca dizi başlarında çalışır; her eleman toplamda bir kez sayılır. Dizi başı kontrolü olmadan çözüm O(n²) olur, büyük girdi testi bunu yakalar.' },
    { t: 'code', id: 'mulakat-hazirlik-4',
      q: '<p>Kayan pencere: <code>en_iyi_pencere(ciro, k)</code> art arda <code>k</code> günün en yüksek toplam cirosunu veren pencerenin <code>(baslangic_indeksi, toplam)</code> demetini döndürsün. Eşitlikte ilk pencere kazanır. <code>k</code> liste uzunluğundan büyükse ya da liste boşsa <code>(-1, 0)</code> döndür. Her pencereyi yeniden toplamadan O(n) çöz.</p>',
      start: 'def en_iyi_pencere(ciro, k):\n    pass\n',
      sol: 'def en_iyi_pencere(ciro, k):\n    if k <= 0 or k > len(ciro):\n        return (-1, 0)\n    toplam = sum(ciro[:k])\n    en_iyi, bas = toplam, 0\n    for i in range(k, len(ciro)):\n        toplam += ciro[i] - ciro[i - k]\n        if toplam > en_iyi:\n            en_iyi, bas = toplam, i - k + 1\n    return (bas, en_iyi)\n',
      tests: 'assert en_iyi_pencere([120, 300, 80, 450, 200, 90, 310], 3) == (1, 830), "300+80+450"\nassert en_iyi_pencere([5, 5, 5], 2) == (0, 10), "eşitlikte ilk pencere"\nassert en_iyi_pencere([1, 2], 3) == (-1, 0), "k büyükse (-1, 0)"\nassert en_iyi_pencere([], 1) == (-1, 0), "boş liste"\nassert en_iyi_pencere([4, 9, 1], 1) == (1, 9), "k=1 en büyük eleman"\n',
      hints: ['İlk k elemanın toplamıyla başla.', 'Her adımda yeni elemanı ekle, pencereden çıkanı (i-k) çıkar.'],
      why: 'Zaman O(n), bellek O(1). Pencere kaydıkça yalnızca bir giren bir çıkan eleman güncellenir; yeniden toplama O(n·k) olurdu.' },
    { t: 'mc', q: '<code>x = [1, 2]; y = x[:]</code> ve ardından <code>x.append(3)</code> sonrasında <code>y</code> nedir?',
      o: ['[1, 2, 3]', '[1, 2]', 'Hata verir', 'None'], a: 1,
      why: 'Dilimleme yeni bir liste (shallow copy) üretir; dış kap ayrıdır, bu yüzden x\'e ekleme y\'yi etkilemez. İç nesneler mutable olsaydı (iç içe liste) onlar paylaşılırdı.' },
    { t: 'code', id: 'mulakat-hazirlik-5',
      q: '<p>İkili arama: <code>ikili_ara(sirali, hedef)</code> artan sıralı listede <code>hedef</code>\'in indeksini, yoksa <code>-1</code> döndürsün. <code>bisect</code> ve <code>list.index</code> kullanma; <code>lo/hi/mid</code> ile elle yaz. Ayrıca döngü adım sayısını say ve <code>(indeks, adim)</code> döndür (adım: mid hesaplanan tur sayısı).</p>',
      start: 'def ikili_ara(sirali, hedef):\n    lo, hi = 0, len(sirali) - 1\n    adim = 0\n    pass\n',
      sol: 'def ikili_ara(sirali, hedef):\n    lo, hi = 0, len(sirali) - 1\n    adim = 0\n    while lo <= hi:\n        adim += 1\n        mid = (lo + hi) // 2\n        if sirali[mid] == hedef:\n            return (mid, adim)\n        if sirali[mid] < hedef:\n            lo = mid + 1\n        else:\n            hi = mid - 1\n    return (-1, adim)\n',
      tests: 'veri = [3, 8, 15, 21, 42, 57, 60, 75]\nassert ikili_ara(veri, 21)[0] == 3, "21 indeks 3"\nassert ikili_ara(veri, 22)[0] == -1, "22 yok"\nassert ikili_ara([], 5) == (-1, 0), "boş liste 0 adım"\nassert ikili_ara([7], 7) == (0, 1), "tek eleman 1 adım"\nbuyuk = list(range(0, 2000000, 2))\nidx, adim = ikili_ara(buyuk, 1999998)\nassert idx == 999999, "son eleman"\nassert adim <= 21, f"1 milyon elemanda en çok ~20 adım olmalı, {adim} adım yapıldı"\n',
      hints: ['while lo <= hi: mid = (lo + hi) // 2.', 'Küçükse lo = mid + 1, büyükse hi = mid - 1.'],
      why: 'Zaman O(log n), bellek O(1). Her tur arama aralığını yarılar; 1 milyon eleman için en çok 20-21 adım. lo <= hi koşulu tek elemanlı aralığı da kontrol eder.' },
    { t: 'code', id: 'mulakat-hazirlik-6',
      q: '<p>BFS: <code>en_kisa_adim(graf, bas, hedef)</code> komşuluk sözlüğü (<code>{dugum: [komsular]}</code>) verilen yönsüz grafta <code>bas</code>\'tan <code>hedef</code>\'e en az kaç kenar geçildiğini döndürsün; ulaşılamıyorsa <code>-1</code>. <code>bas == hedef</code> ise 0. <code>collections.deque</code> kullan.</p>',
      start: 'from collections import deque\n\ndef en_kisa_adim(graf, bas, hedef):\n    pass\n',
      sol: 'from collections import deque\n\ndef en_kisa_adim(graf, bas, hedef):\n    kuyruk = deque([(bas, 0)])\n    ziyaret = {bas}\n    while kuyruk:\n        dugum, adim = kuyruk.popleft()\n        if dugum == hedef:\n            return adim\n        for komsu in graf.get(dugum, []):\n            if komsu not in ziyaret:\n                ziyaret.add(komsu)\n                kuyruk.append((komsu, adim + 1))\n    return -1\n',
      tests: 'g = {"İstanbul": ["Bursa", "Kocaeli"], "Bursa": ["İstanbul", "Eskişehir"], "Kocaeli": ["İstanbul", "Ankara"], "Eskişehir": ["Bursa", "Ankara"], "Ankara": ["Kocaeli", "Eskişehir"], "Van": []}\nassert en_kisa_adim(g, "İstanbul", "Ankara") == 2, "İstanbul-Kocaeli-Ankara"\nassert en_kisa_adim(g, "Bursa", "Kocaeli") == 2, "Bursa-İstanbul-Kocaeli"\nassert en_kisa_adim(g, "İstanbul", "Van") == -1, "ulaşılamaz"\nassert en_kisa_adim(g, "Ankara", "Ankara") == 0, "aynı düğüm 0"\n',
      hints: ['Kuyruğa (düğüm, adım) çifti koy; ziyaret kümesine kuyruğa eklerken ekle.', 'Hedefi kuyruktan çıkarırken kontrol et ve adımı döndür.'],
      why: 'Zaman O(V + E), bellek O(V). BFS katman katman ilerlediği için hedefe ilk ulaşan yol en kısadır. Ziyareti kuyruğa eklerken işaretlemek aynı düğümün tekrar kuyruğa girmesini önler.' },
    { t: 'code', id: 'mulakat-hazirlik-7',
      q: '<p>İki pointer: artan sıralı <code>fiyatlar</code> listesinde toplamı <code>butce</code>\'yi aşmayan en büyük toplamı veren iki farklı ürünün <code>(i, j)</code> indekslerini döndür (<code>i &lt; j</code>). Hiçbir çift sığmıyorsa ya da liste 2\'den kısaysa <code>None</code>. Fonksiyon adı <code>en_iyi_cift(fiyatlar, butce)</code>; iki uçtan ortaya yürüyen O(n) çözüm yaz.</p>',
      start: 'def en_iyi_cift(fiyatlar, butce):\n    pass\n',
      sol: 'def en_iyi_cift(fiyatlar, butce):\n    i, j = 0, len(fiyatlar) - 1\n    en_iyi = None\n    en_iyi_toplam = -1\n    while i < j:\n        t = fiyatlar[i] + fiyatlar[j]\n        if t <= butce:\n            if t > en_iyi_toplam:\n                en_iyi_toplam, en_iyi = t, (i, j)\n            i += 1\n        else:\n            j -= 1\n    return en_iyi\n',
      tests: 'assert en_iyi_cift([90, 160, 250, 300, 410], 500) == (0, 4), "90 + 410 = 500"\nassert en_iyi_cift([90, 160, 250, 300, 410], 1000) == (3, 4), "en pahalı iki"\nassert en_iyi_cift([300, 400], 500) == None, "hiçbir çift sığmaz"\nassert en_iyi_cift([100], 500) == None, "tek eleman"\nassert en_iyi_cift([50, 50, 50], 100) == (0, 2), "ilk bulunan 100 toplamı; daha iyisi yok"\n',
      hints: ['i baştan, j sondan başlasın.', 'Toplam bütçeyi aşıyorsa j azalt; sığıyorsa en iyiyi güncelle ve i artır.'],
      why: 'Zaman O(n), bellek O(1). Sıralı veride toplam fazla geliyorsa büyük ucu küçültmek, az geliyorsa küçük ucu büyütmek tüm anlamlı çiftleri tek geçişte tarar.' }
  ],
  faq: [
    { q: 'Mülakatta çözümü hatırlayamazsam ne yapmalıyım?', a: 'Kaba çözümü yaz ve karmaşıklığını söyle; sonra "sözlükle iyileştirebilirim" gibi yönü belirt. Çalışan O(n²) çözüm, bitmemiş O(n) çözümden iyidir. Mülakatçıdan ipucu istemek de puan kaybettirmez; sessiz kalmak kaybettirir.' },
    { q: 'Hangi dili/araçları bildiğimi nasıl kanıtlarım?', a: 'Kodda Pythonic kalıplar kullan: enumerate, zip, comprehension, setdefault, deque, Counter. Big-O ve bellek yorumunu kendin ekle. Küçük bir test (assert) yazmak güçlü bir sinyaldir.' },
    { q: 'GIL sorusunda ne kadar derine inmeliyim?', a: 'Üç cümle: ne olduğu, neden I/O için threading işe yarar (bekleme sırasında kilit bırakılır), CPU işi için multiprocessing ya da C uzantıları (numpy) kullanılır. Python 3.13 ile deneysel serbest iş parçacığı (free-threaded) derlemesinin varlığını bilmek artı puan.' },
    { q: 'Ev ödevi projesinde en çok neye bakıyorlar?', a: 'README, testler, temiz yapı ve hata yönetimi. Fazla özellik eklemek yerine istenen işi eksiksiz, test edilmiş ve okunur biçimde teslim et.' }
  ],
  mistakes: [
    { bad: 'if x == None:\n    ...', good: 'if x is None:\n    ...', why: 'None tekil nesnedir; kimlik karşılaştırması hem doğru hem de __eq__ ezilmiş sınıflarda güvenlidir (PEP 8).' },
    { bad: 'kuyruk = []\n...\ndugum = kuyruk.pop(0)', good: 'from collections import deque\nkuyruk = deque()\n...\ndugum = kuyruk.popleft()', why: 'list.pop(0) tüm elemanları kaydırır, O(n); BFS\'te toplam O(n²) olur. deque.popleft() O(1).' },
    { bad: 'for i in range(len(a)):\n    for j in range(len(a)):\n        if a[i] + a[j] == hedef:\n            ...', good: 'gorulen = {}\nfor i, s in enumerate(a):\n    if hedef - s in gorulen:\n        ...\n    gorulen[s] = i', why: 'Çift döngü O(n²) ve i == j durumunda aynı elemanı iki kez kullanır; sözlük hem O(n) hem doğru.' },
    { bad: 'metin = ""\nfor p in parcalar:\n    metin += p', good: 'metin = "".join(parcalar)', why: 'Döngüde string birleştirme her adımda yeni nesne oluşturur; join tek seferde birleştirir ve mülakatta "dili biliyor" sinyali verir.' }
  ]
}
,
/* ───────────────────────── 3. proje-ileri ───────────────────────── */
// needs: pandas
{
  id: 'proje-ileri',
  lv: 'ileri',
  mod: 'Bitirme',
  min: 90,
  needs: ['pandas'],
  title: 'Bitirme projesi: Anadolu Market müşteri analitiği paketi',
  sum: 'pandas ile RFM segmentasyonu ve kohort analizi, async ile sayfalı veri çekme, argparse CLI ve unittest içeren uçtan uca bir analitik paket kurarsın.',
  goals: [
    'Sipariş verisinden müşteri başına recency/frequency/monetary ölçütlerini hesaplayıp quantile skorlarıyla segment üretebilirim.',
    'İlk sipariş ayına göre kohort tablosu kurup müşteri tutundurmayı (retention) okuyabilirim.',
    'groupby ile en çok satan ürün ve kategoriyi ciro ve adetle raporlayabilirim.',
    'asyncio ile sayfalı bir API\'den tüm kayıtları sırayla ve güvenli biçimde çekebilirim.',
    'argparse ile alt komutlu bir CLI tasarlayıp iş mantığını unittest ile test edebilirim.'
  ],
  body: `
<h2>Proje: müşteri analitiği paketi</h2>
<p>Anadolu Market\'in pazarlama ekibi üç soru soruyor: "Hangi müşterilere kampanya gönderelim?", "Yeni gelen müşteriler ikinci ay geri dönüyor mu?", "Hangi ürün ve kategori ciroyu taşıyor?" Bu projede üç soruyu cevaplayan, komut satırından çalışan ve testli bir paket kuracaksın. Paket, önceki derslerin hepsini birleştirir: pandas (groupby, qcut, pivot), asyncio (sayfalı veri çekme), argparse (CLI), unittest (doğrulama).</p>
<div class="tbl-wrap"><table>
<tr><th>Modül</th><th>Sorumluluk</th><th>Ana fonksiyonlar</th></tr>
<tr><td>veri.py</td><td>Ham kayıtları DataFrame\'e çevirmek</td><td>siparis_df</td></tr>
<tr><td>rfm.py</td><td>RFM ölçütleri, skor, segment</td><td>rfm_hesapla, rfm_skor, segment</td></tr>
<tr><td>kohort.py</td><td>İlk sipariş ayına göre tutundurma tablosu</td><td>kohort_tablosu</td></tr>
<tr><td>urun.py</td><td>En çok satan ürün/kategori</td><td>en_cok_satan</td></tr>
<tr><td>api.py</td><td>Sayfalı veri çekme (async)</td><td>api_sayfa, hepsini_cek</td></tr>
<tr><td>cli.py</td><td>argparse ile komutlar</td><td>parse_args, main</td></tr>
<tr><td>tests/</td><td>unittest</td><td>TestRfm, TestKohort</td></tr>
</table></div>
<div class="note"><b>Her kutu bağımsız</b>Bu sayfadaki her kod kutusu kendi başına çalışır; bu yüzden örnek veri ve gerekli fonksiyonlar her kutuda yeniden kurulur. Gerçek pakette hepsi ayrı modüllerde bir kez yazılır.</div>
<div class="note"><b>Sürüm uyumu</b>Bu uygulama tarayıcıda pandas 2.2, bilgisayarında büyük olasılıkla pandas 3.x çalıştırır. İkisinde de aynı sonucu veren sade bir API kullanacağız: <code>groupby(..., observed=True)</code> belirt, <code>inplace=True</code> kullanma (kopya döndür), <code>pd.qcut</code>\'tan önce <code>rank(method="first")</code> uygula, kategorik/str tür ayrıntılarına yaslanma.</div>

<h2>1. Veri katmanı</h2>
<p>Veri ders içinde küçük bir sözlük listesi; gerçek hayatta aynı yapı CSV ya da API\'den gelir. İlk iş tarihi gerçek tarih türüne çevirmek ve ay sütununu çıkarmak:</p>
<pre class="py">import pandas as pd

KAYITLAR = [
    {"musteri": "Ayşe", "tarih": "2024-01-05", "urun": "Kalem", "kategori": "Kırtasiye", "tutar": 120.0},
    {"musteri": "Mehmet", "tarih": "2024-01-12", "urun": "Kulaklık", "kategori": "Elektronik", "tutar": 850.0},
    {"musteri": "Ayşe", "tarih": "2024-02-03", "urun": "Defter", "kategori": "Kırtasiye", "tutar": 60.0},
    {"musteri": "Zeynep", "tarih": "2024-02-10", "urun": "Kulaklık", "kategori": "Elektronik", "tutar": 850.0},
    {"musteri": "Ayşe", "tarih": "2024-03-15", "urun": "Kulaklık", "kategori": "Elektronik", "tutar": 850.0},
    {"musteri": "Mehmet", "tarih": "2024-03-20", "urun": "Kalem", "kategori": "Kırtasiye", "tutar": 120.0},
    {"musteri": "Ali", "tarih": "2024-03-22", "urun": "Çanta", "kategori": "Aksesuar", "tutar": 400.0},
    {"musteri": "Zeynep", "tarih": "2024-04-01", "urun": "Defter", "kategori": "Kırtasiye", "tutar": 60.0},
    {"musteri": "Ali", "tarih": "2024-04-18", "urun": "Kalem", "kategori": "Kırtasiye", "tutar": 120.0},
    {"musteri": "Elif", "tarih": "2024-04-25", "urun": "Çanta", "kategori": "Aksesuar", "tutar": 400.0},
]

def siparis_df(kayitlar):
    df = pd.DataFrame(kayitlar)
    df["tarih"] = pd.to_datetime(df["tarih"])
    df["ay"] = df["tarih"].dt.to_period("M").astype(str)
    return df

df = siparis_df(KAYITLAR)
print(df[["musteri", "ay", "tutar"]].head())
print("satır:", len(df), "| müşteri:", df["musteri"].nunique())</pre>
<p><code>to_period("M")</code> tarihi aya yuvarlar; <code>astype(str)</code> ile "2024-01" gibi karşılaştırması kolay bir metne çevirmek iki pandas sürümünde de aynı davranır.</p>

<h2>2. RFM segmentasyonu</h2>
<p>RFM üç ölçüt: <b>Recency</b> (son siparişten bu yana geçen gün; az olması iyi), <b>Frequency</b> (sipariş sayısı), <b>Monetary</b> (toplam harcama). Her müşteri için üçünü hesaplayıp her birini 1-4 arası skora çeviririz; skorların toplamı segment belirler.</p>
<pre class="py">import pandas as pd

df = pd.DataFrame({
    "musteri": ["Ayşe", "Mehmet", "Ayşe", "Zeynep", "Ayşe", "Mehmet", "Ali", "Zeynep", "Ali", "Elif"],
    "tarih": pd.to_datetime(["2024-01-05", "2024-01-12", "2024-02-03", "2024-02-10", "2024-03-15",
                             "2024-03-20", "2024-03-22", "2024-04-01", "2024-04-18", "2024-04-25"]),
    "urun": ["Kalem", "Kulaklık", "Defter", "Kulaklık", "Kulaklık", "Kalem", "Çanta", "Defter", "Kalem", "Çanta"],
    "kategori": ["Kırtasiye", "Elektronik", "Kırtasiye", "Elektronik", "Elektronik", "Kırtasiye", "Aksesuar", "Kırtasiye", "Kırtasiye", "Aksesuar"],
    "tutar": [120.0, 850.0, 60.0, 850.0, 850.0, 120.0, 400.0, 60.0, 120.0, 400.0],
})

def rfm_hesapla(df, bugun):
    bugun = pd.Timestamp(bugun)
    g = df.groupby("musteri", observed=True)
    rfm = pd.DataFrame({
        "recency": (bugun - g["tarih"].max()).dt.days,
        "frequency": g["tarih"].count(),
        "monetary": g["tutar"].sum(),
    })
    return rfm.reset_index()

rfm = rfm_hesapla(df, "2024-05-01")
print(rfm)</pre>
<p>Skorlama için quantile (çeyreklik) kullanırız: müşterileri ölçüte göre dört eşit gruba böl, en iyi gruba 4 ver. <code>pd.qcut</code> bunu yapar; ancak aynı değere sahip çok müşteri varsa "kenarlar tekrarlı" hatası verir. Çare, önce <code>rank(method="first")</code> ile her müşteriye benzersiz bir sıra vermek. Recency\'de küçük değer iyi olduğu için etiketleri ters çeviririz.</p>
<pre class="py">import pandas as pd

df = pd.DataFrame({
    "musteri": ["Ayşe", "Mehmet", "Ayşe", "Zeynep", "Ayşe", "Mehmet", "Ali", "Zeynep", "Ali", "Elif"],
    "tarih": pd.to_datetime(["2024-01-05", "2024-01-12", "2024-02-03", "2024-02-10", "2024-03-15",
                             "2024-03-20", "2024-03-22", "2024-04-01", "2024-04-18", "2024-04-25"]),
    "urun": ["Kalem", "Kulaklık", "Defter", "Kulaklık", "Kulaklık", "Kalem", "Çanta", "Defter", "Kalem", "Çanta"],
    "kategori": ["Kırtasiye", "Elektronik", "Kırtasiye", "Elektronik", "Elektronik", "Kırtasiye", "Aksesuar", "Kırtasiye", "Kırtasiye", "Aksesuar"],
    "tutar": [120.0, 850.0, 60.0, 850.0, 850.0, 120.0, 400.0, 60.0, 120.0, 400.0],
})

def rfm_hesapla(df, bugun):
    bugun = pd.Timestamp(bugun)
    g = df.groupby("musteri", observed=True)
    rfm = pd.DataFrame({
        "recency": (bugun - g["tarih"].max()).dt.days,
        "frequency": g["tarih"].count(),
        "monetary": g["tutar"].sum(),
    })
    return rfm.reset_index()

def rfm_skor(rfm, q=4):
    rfm = rfm.copy()
    etiket = list(range(1, q + 1))
    rfm["R"] = pd.qcut(rfm["recency"].rank(method="first"), q, labels=etiket[::-1]).astype(int)
    rfm["F"] = pd.qcut(rfm["frequency"].rank(method="first"), q, labels=etiket).astype(int)
    rfm["M"] = pd.qcut(rfm["monetary"].rank(method="first"), q, labels=etiket).astype(int)
    rfm["skor"] = rfm["R"] + rfm["F"] + rfm["M"]
    return rfm

def segment(skor, q=4):
    ust = 3 * q
    if skor &gt;= ust - 2:
        return "Şampiyon"
    if skor &gt;= ust - 5:
        return "Sadık"
    if skor &gt;= 6:
        return "Potansiyel"
    return "Riskli"

rfm = rfm_hesapla(df, "2024-05-01")
skorlu = rfm_skor(rfm)
skorlu["segment"] = skorlu["skor"].apply(segment)
print(skorlu[["musteri", "R", "F", "M", "skor", "segment"]])</pre>
<div class="tip"><b>Neden rank(method="first")?</b>Beş müşteriden üçünün frequency\'si 2 ise qcut dört kutuya bölemez ve ValueError verir. rank(method="first") eşitleri görülme sırasına göre ayırır; kutu sınırları benzersiz olur. Üretimde eşitlik bozma kuralını (ör. son sipariş tarihi) belgele; farklı sürümlerde sıra değişmesin diye önce sırala.</div>

<h2>3. Kohort analizi</h2>
<p>Kohort (cohort), ilk siparişini aynı ayda veren müşteri grubudur. Soru: Ocak kohortundan kaç müşteri şubatta (1. ay), martta (2. ay) yine alışveriş yaptı? Hesap üç adım: her müşterinin ilk ayı, her siparişin ilk aya göre kaçıncı ayda olduğu, kohort × ay_no tablosunda benzersiz müşteri sayısı. Ay farkını sürümden bağımsız hesaplamak için yıl*12+ay tamsayısını kullanıyoruz.</p>
<pre class="py">import pandas as pd

df = pd.DataFrame({
    "musteri": ["Ayşe", "Mehmet", "Ayşe", "Zeynep", "Ayşe", "Mehmet", "Ali", "Zeynep", "Ali", "Elif"],
    "tarih": pd.to_datetime(["2024-01-05", "2024-01-12", "2024-02-03", "2024-02-10", "2024-03-15",
                             "2024-03-20", "2024-03-22", "2024-04-01", "2024-04-18", "2024-04-25"]),
    "urun": ["Kalem", "Kulaklık", "Defter", "Kulaklık", "Kulaklık", "Kalem", "Çanta", "Defter", "Kalem", "Çanta"],
    "kategori": ["Kırtasiye", "Elektronik", "Kırtasiye", "Elektronik", "Elektronik", "Kırtasiye", "Aksesuar", "Kırtasiye", "Kırtasiye", "Aksesuar"],
    "tutar": [120.0, 850.0, 60.0, 850.0, 850.0, 120.0, 400.0, 60.0, 120.0, 400.0],
})

def ay_index(seri):
    return seri.dt.year * 12 + seri.dt.month

def kohort_tablosu(df):
    df = df.copy()
    ilk = df.groupby("musteri", observed=True)["tarih"].min()
    df["ilk"] = df["musteri"].map(ilk)
    df["kohort"] = df["ilk"].dt.to_period("M").astype(str)
    df["ay_no"] = ay_index(df["tarih"]) - ay_index(df["ilk"])
    tablo = (df.groupby(["kohort", "ay_no"], observed=True)["musteri"]
               .nunique().unstack(fill_value=0))
    return tablo

tablo = kohort_tablosu(df)
print(tablo)
print("Ocak kohortu 2. ayda:", int(tablo.loc["2024-01", 2]))</pre>
<p>Tabloyu okuma: satır kohort, sütun ilk aydan itibaren geçen ay. 0. sütun kohort büyüklüğüdür; sonraki sütunları ona bölersen tutundurma oranını (retention rate) elde edersin. Üretimde bu tablo ısı haritasına dönüşür.</p>

<h2>4. En çok satan ürün ve kategori</h2>
<pre class="py">import pandas as pd

df = pd.DataFrame({
    "musteri": ["Ayşe", "Mehmet", "Ayşe", "Zeynep", "Ayşe", "Mehmet", "Ali", "Zeynep", "Ali", "Elif"],
    "tarih": pd.to_datetime(["2024-01-05", "2024-01-12", "2024-02-03", "2024-02-10", "2024-03-15",
                             "2024-03-20", "2024-03-22", "2024-04-01", "2024-04-18", "2024-04-25"]),
    "urun": ["Kalem", "Kulaklık", "Defter", "Kulaklık", "Kulaklık", "Kalem", "Çanta", "Defter", "Kalem", "Çanta"],
    "kategori": ["Kırtasiye", "Elektronik", "Kırtasiye", "Elektronik", "Elektronik", "Kırtasiye", "Aksesuar", "Kırtasiye", "Kırtasiye", "Aksesuar"],
    "tutar": [120.0, 850.0, 60.0, 850.0, 850.0, 120.0, 400.0, 60.0, 120.0, 400.0],
})

def en_cok_satan(df, sutun="urun", n=3):
    g = df.groupby(sutun, observed=True)["tutar"].agg(["count", "sum"]).reset_index()
    g.columns = [sutun, "adet", "ciro"]
    return (g.sort_values(["ciro", sutun], ascending=[False, True])
             .head(n).reset_index(drop=True))

print(en_cok_satan(df))
print(en_cok_satan(df, "kategori", 2))</pre>
<p>Sıralamada ikinci anahtar olarak ürün adını eklemek, eşit ciroda sonucu deterministik yapar; testler bunu sever.</p>

<h2>5. Sahte API\'den sayfalı veri çekme</h2>
<p>Gerçek sistemde siparişler bir API\'den sayfa sayfa gelir: <code>?sayfa=0&amp;boyut=100</code>. Ağ erişimimiz yok, bu yüzden API\'yi <code>asyncio.sleep</code> ile bekleyen bir coroutine olarak simüle ediyoruz. Yanıt, veriyi ve "son sayfa mı" bilgisini taşır; istemci son sayfaya kadar döner.</p>
<pre class="py">import asyncio

KAYITLAR = [{"id": i, "tutar": 100 + i * 10} for i in range(10)]

async def api_sayfa(kayitlar, sayfa, boyut):
    await asyncio.sleep(0.01)            # ağ gecikmesi simülasyonu
    bas = sayfa * boyut
    return {"veri": kayitlar[bas:bas + boyut], "son": bas + boyut &gt;= len(kayitlar)}

async def hepsini_cek(kayitlar, boyut):
    hepsi, sayfa = [], 0
    while True:
        yanit = await api_sayfa(kayitlar, sayfa, boyut)
        hepsi.extend(yanit["veri"])
        if yanit["son"]:
            break
        sayfa += 1
    return hepsi, sayfa + 1

loop = asyncio.new_event_loop()
veri, sayfa_sayisi = loop.run_until_complete(hepsini_cek(KAYITLAR, 4))
loop.close()
print(len(veri), "kayıt,", sayfa_sayisi, "sayfa")</pre>
<p>Sayfalar birbirine bağlı (bir sonrakini çekmek için öncekinin "son" bilgisi gerekir), bu yüzden sıralı await doğru. Toplam sayfa sayısı önceden biliniyorsa <code>gather</code> ile paralel çekmek mümkündür; alıştırmada iki yaklaşımı da göreceksin.</p>
<div class="warn"><b>Olay döngüsü</b>Tarayıcıda ve Jupyter\'da zaten bir döngü çalıştığı için <code>asyncio.run</code> hata verebilir; <code>new_event_loop().run_until_complete</code> kalıbı her ortamda çalışır.</div>

<h2>6. CLI: argparse ile alt komutlar</h2>
<p>Pazarlama ekibi kod yazmadan <code>python -m analitik rfm --bugun 2024-05-01</code> diyebilmeli. <code>parse_args</code> fonksiyonuna liste verebilmek test için kritik: <code>sys.argv</code> yerine <code>parse_args(["rfm", "--q", "3"])</code> ile her komutu testte deneyebilirsin.</p>
<pre class="py">import argparse

def parse_args(argv=None):
    p = argparse.ArgumentParser(prog="analitik", description="Anadolu Market müşteri analitiği")
    p.add_argument("komut", choices=["rfm", "kohort", "top"])
    p.add_argument("--bugun", default="2024-05-01")
    p.add_argument("--q", type=int, default=4)
    p.add_argument("--n", type=int, default=3)
    p.add_argument("--sutun", choices=["urun", "kategori"], default="urun")
    return p.parse_args(argv)

a = parse_args(["top", "--sutun", "kategori", "--n", "2"])
print(a.komut, a.sutun, a.n)
try:
    parse_args(["sil"])
except SystemExit as e:
    print("geçersiz komut, çıkış kodu:", e.code)</pre>
<p><code>main(argv)</code> fonksiyonu argümana göre ilgili fonksiyonu çağırıp sonucu yazdırır; iş mantığı CLI\'dan ayrı kaldığı için testler <code>main</code>\'e dokunmadan hesap fonksiyonlarını doğrular.</p>

<h2>7. unittest ile doğrulama</h2>
<pre class="code">import unittest

class TestRfm(unittest.TestCase):
    def setUp(self):
        self.df = siparis_df(KAYITLAR)

    def test_recency_ayse(self):
        rfm = rfm_hesapla(self.df, "2024-05-01").set_index("musteri")
        self.assertEqual(int(rfm.loc["Ayşe", "recency"]), 47)

    def test_skor_araligi(self):
        sk = rfm_skor(rfm_hesapla(self.df, "2024-05-01"))
        self.assertTrue(sk["skor"].between(3, 12).all())

if __name__ == "__main__":
    unittest.main(argv=["x"], exit=False)</pre>
<p><code>setUp</code> her testten önce taze veri kurar. Tarayıcıda <code>unittest.main(argv=["x"], exit=False)</code> kalıbı gerekir; aksi halde unittest tarayıcının argümanlarını okumaya çalışır ve çıkış yapar.</p>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Üretime taşırken</h3>
<p>Gerçek paket şu farklarla büyür: veri CSV/parquet ya da veritabanından okunur (<code>pd.read_sql</code>), API çağrıları httpx ile yapılır ve yeniden deneme (retry) + zaman aşımı eklenir, çıktı parquet ya da bir BI aracına yazılır, iş akışı zamanlayıcıyla (cron, Airflow) her gece koşar. RFM eşikleri sabit kodlanmaz, yapılandırma dosyasından okunur.</p>
<h3>Sürüm uyumunu test etmek</h3>
<p>pandas 2.2 ve 3.x farkları (varsayılan str türü, Copy-on-Write, groupby observed varsayılanı) için CI matrisinde iki sürümü de koştur. <code>inplace</code>\'ten kaçınmak, <code>observed=True</code> yazmak ve zincirleme atama yapmamak uyumun yüzde doksanıdır.</p>
<h3>RFM\'in ötesi</h3>
<p>RFM basit ve açıklanabilir olduğu için hâlâ yaygın; ama müşteri yaşam boyu değeri (CLV) tahmini, kayıp (churn) olasılığı ve ürün öneri sistemleri bir sonraki adımdır. Hepsi aynı veri katmanının üstüne kurulur; bu projedeki <code>siparis_df</code> temel kalır.</p>
<h3>Performans</h3>
<p>Milyonlarca satırda <code>apply(segment)</code> yavaşlar; <code>pd.cut</code> ile vektörel segmentleme ya da <code>np.select</code> kullan. Kohort tablosu için <code>pivot_table</code> ve kategorik türler belleği düşürür.</p>
</section>`,
  ex: [
    { t: 'code', id: 'proje-ileri-1',
      q: '<p>Parça 1: <code>siparis_df(kayitlar)</code> ve <code>rfm_hesapla(df, bugun)</code> fonksiyonlarını yaz. <code>siparis_df</code> sözlük listesini DataFrame\'e çevirsin, <code>tarih</code> sütununu datetime yapsın, <code>ay</code> sütununu <code>"YYYY-MM"</code> metni olarak eklesin. <code>rfm_hesapla</code> müşteri başına <code>recency</code> (bugün - son sipariş, gün), <code>frequency</code> (sipariş adedi) ve <code>monetary</code> (toplam tutar) sütunlarıyla, <code>musteri</code> sütunu olan (indeks değil) bir DataFrame döndürsün.</p>',
      start: 'import pandas as pd\n\nKAYITLAR = [\n    {"musteri": "Ayşe", "tarih": "2024-01-05", "urun": "Kalem", "kategori": "Kırtasiye", "tutar": 120.0},\n    {"musteri": "Mehmet", "tarih": "2024-01-12", "urun": "Kulaklık", "kategori": "Elektronik", "tutar": 850.0},\n    {"musteri": "Ayşe", "tarih": "2024-02-03", "urun": "Defter", "kategori": "Kırtasiye", "tutar": 60.0},\n    {"musteri": "Zeynep", "tarih": "2024-02-10", "urun": "Kulaklık", "kategori": "Elektronik", "tutar": 850.0},\n    {"musteri": "Ayşe", "tarih": "2024-03-15", "urun": "Kulaklık", "kategori": "Elektronik", "tutar": 850.0},\n    {"musteri": "Mehmet", "tarih": "2024-03-20", "urun": "Kalem", "kategori": "Kırtasiye", "tutar": 120.0},\n    {"musteri": "Ali", "tarih": "2024-03-22", "urun": "Çanta", "kategori": "Aksesuar", "tutar": 400.0},\n    {"musteri": "Zeynep", "tarih": "2024-04-01", "urun": "Defter", "kategori": "Kırtasiye", "tutar": 60.0},\n    {"musteri": "Ali", "tarih": "2024-04-18", "urun": "Kalem", "kategori": "Kırtasiye", "tutar": 120.0},\n    {"musteri": "Elif", "tarih": "2024-04-25", "urun": "Çanta", "kategori": "Aksesuar", "tutar": 400.0},\n]\n\ndef siparis_df(kayitlar):\n    pass\n\ndef rfm_hesapla(df, bugun):\n    pass\n',
      sol: 'import pandas as pd\n\nKAYITLAR = [\n    {"musteri": "Ayşe", "tarih": "2024-01-05", "urun": "Kalem", "kategori": "Kırtasiye", "tutar": 120.0},\n    {"musteri": "Mehmet", "tarih": "2024-01-12", "urun": "Kulaklık", "kategori": "Elektronik", "tutar": 850.0},\n    {"musteri": "Ayşe", "tarih": "2024-02-03", "urun": "Defter", "kategori": "Kırtasiye", "tutar": 60.0},\n    {"musteri": "Zeynep", "tarih": "2024-02-10", "urun": "Kulaklık", "kategori": "Elektronik", "tutar": 850.0},\n    {"musteri": "Ayşe", "tarih": "2024-03-15", "urun": "Kulaklık", "kategori": "Elektronik", "tutar": 850.0},\n    {"musteri": "Mehmet", "tarih": "2024-03-20", "urun": "Kalem", "kategori": "Kırtasiye", "tutar": 120.0},\n    {"musteri": "Ali", "tarih": "2024-03-22", "urun": "Çanta", "kategori": "Aksesuar", "tutar": 400.0},\n    {"musteri": "Zeynep", "tarih": "2024-04-01", "urun": "Defter", "kategori": "Kırtasiye", "tutar": 60.0},\n    {"musteri": "Ali", "tarih": "2024-04-18", "urun": "Kalem", "kategori": "Kırtasiye", "tutar": 120.0},\n    {"musteri": "Elif", "tarih": "2024-04-25", "urun": "Çanta", "kategori": "Aksesuar", "tutar": 400.0},\n]\n\ndef siparis_df(kayitlar):\n    df = pd.DataFrame(kayitlar)\n    df["tarih"] = pd.to_datetime(df["tarih"])\n    df["ay"] = df["tarih"].dt.to_period("M").astype(str)\n    return df\n\ndef rfm_hesapla(df, bugun):\n    bugun = pd.Timestamp(bugun)\n    g = df.groupby("musteri", observed=True)\n    rfm = pd.DataFrame({\n        "recency": (bugun - g["tarih"].max()).dt.days,\n        "frequency": g["tarih"].count(),\n        "monetary": g["tutar"].sum(),\n    })\n    return rfm.reset_index()\n',
      tests: 'import pandas as pd\ndf = siparis_df(KAYITLAR)\nassert len(df) == 10, "10 satır"\nassert pd.api.types.is_datetime64_any_dtype(df["tarih"]), "tarih datetime olmalı"\nassert list(df["ay"].head(3)) == ["2024-01", "2024-01", "2024-02"], "ay sütunu YYYY-MM metni"\nrfm = rfm_hesapla(df, "2024-05-01")\nassert "musteri" in rfm.columns, "musteri bir sütun olmalı (reset_index)"\nr = rfm.set_index("musteri")\nassert int(r.loc["Ayşe", "recency"]) == 47, "Ayşe recency 47 gün"\nassert int(r.loc["Ayşe", "frequency"]) == 3, "Ayşe 3 sipariş"\nassert abs(float(r.loc["Ayşe", "monetary"]) - 1030.0) < 1e-6, "Ayşe toplam 1030"\nassert int(r.loc["Elif", "recency"]) == 6 and int(r.loc["Elif", "frequency"]) == 1, "Elif 6 gün, 1 sipariş"\nassert len(rfm) == 5, "5 müşteri"\n',
      hints: ['pd.to_datetime ve .dt.to_period("M").astype(str).', 'groupby("musteri", observed=True) üzerinde tarih max/count ve tutar sum; (bugun - max).dt.days.', 'Sonunda reset_index() ile musteri sütun olsun.'],
      why: 'Üç ölçüt tek groupby nesnesinden üç ayrı toplamla gelir. Timestamp farkı Timedelta verir; .dt.days ile gün sayısına çevrilir.' },
    { t: 'code', id: 'proje-ileri-2',
      q: '<p>Parça 2: <code>rfm_skor(rfm, q=4)</code> ve <code>segment(skor, q=4)</code> yaz. <code>rfm_skor</code> girdiyi değiştirmeden kopya döndürsün; <code>R</code>, <code>F</code>, <code>M</code> sütunlarını <code>pd.qcut</code> ile 1..q arası tamsayı skor olarak eklesin (recency\'de küçük değer yüksek skor; eşitlikler için <code>rank(method="first")</code>), <code>skor</code> = R+F+M. <code>segment</code>: skor ≥ 3q-2 ise <code>"Şampiyon"</code>, ≥ 3q-5 ise <code>"Sadık"</code>, ≥ 6 ise <code>"Potansiyel"</code>, aksi halde <code>"Riskli"</code>.</p>',
      start: 'import pandas as pd\n\nRFM = pd.DataFrame({\n    "musteri": ["Ali", "Ayşe", "Elif", "Mehmet", "Zeynep"],\n    "recency": [13, 47, 6, 42, 30],\n    "frequency": [2, 3, 1, 2, 2],\n    "monetary": [520.0, 1030.0, 400.0, 970.0, 910.0],\n})\n\ndef rfm_skor(rfm, q=4):\n    pass\n\ndef segment(skor, q=4):\n    pass\n',
      sol: 'import pandas as pd\n\nRFM = pd.DataFrame({\n    "musteri": ["Ali", "Ayşe", "Elif", "Mehmet", "Zeynep"],\n    "recency": [13, 47, 6, 42, 30],\n    "frequency": [2, 3, 1, 2, 2],\n    "monetary": [520.0, 1030.0, 400.0, 970.0, 910.0],\n})\n\ndef rfm_skor(rfm, q=4):\n    rfm = rfm.copy()\n    etiket = list(range(1, q + 1))\n    rfm["R"] = pd.qcut(rfm["recency"].rank(method="first"), q, labels=etiket[::-1]).astype(int)\n    rfm["F"] = pd.qcut(rfm["frequency"].rank(method="first"), q, labels=etiket).astype(int)\n    rfm["M"] = pd.qcut(rfm["monetary"].rank(method="first"), q, labels=etiket).astype(int)\n    rfm["skor"] = rfm["R"] + rfm["F"] + rfm["M"]\n    return rfm\n\ndef segment(skor, q=4):\n    ust = 3 * q\n    if skor >= ust - 2:\n        return "Şampiyon"\n    if skor >= ust - 5:\n        return "Sadık"\n    if skor >= 6:\n        return "Potansiyel"\n    return "Riskli"\n',
      tests: 'sk = rfm_skor(RFM).set_index("musteri")\nassert "R" not in RFM.columns, "girdi değiştirilmemeli (kopya döndür)"\nassert int(sk.loc["Ayşe", "R"]) == 1 and int(sk.loc["Ayşe", "F"]) == 4 and int(sk.loc["Ayşe", "M"]) == 4, "Ayşe R=1 F=4 M=4"\nassert int(sk.loc["Elif", "R"]) == 4, "en yeni müşteri R=4"\nassert int(sk.loc["Ayşe", "skor"]) == 9, "Ayşe skor 9"\nassert sk["skor"].between(3, 12).all(), "skor 3..12 arası"\nassert set(sk["R"]) == {1, 2, 3, 4}, "R 1..4 değer almalı"\nsk3 = rfm_skor(RFM, q=3)\nassert sk3["skor"].between(3, 9).all() and set(sk3["F"]) == {1, 2, 3}, "q=3 ile skor 3..9"\nassert segment(12) == "Şampiyon" and segment(10) == "Şampiyon", "12 ve 10 Şampiyon"\nassert segment(9) == "Sadık" and segment(7) == "Sadık", "9 ve 7 Sadık"\nassert segment(6) == "Potansiyel" and segment(5) == "Riskli", "6 Potansiyel, 5 Riskli"\nassert segment(7, q=3) == "Şampiyon", "q=3: 7 Şampiyon"\n',
      hints: ['rfm.copy() ile başla.', 'pd.qcut(seri.rank(method="first"), q, labels=[...]).astype(int); recency için labels tersten.', 'segment eşikleri 3q-2, 3q-5, 6.'],
      why: 'qcut eşit sayıda müşteri içeren kutular üretir; rank(method="first") eşit değerlerde kutu sınırlarının çakışmasını önler. Etiketleri tersten vermek recency için "az gün = yüksek skor" kuralını uygular.' },
    { t: 'code', id: 'proje-ileri-3',
      q: '<p>Parça 3: <code>kohort_tablosu(df)</code> yaz. Her müşterinin kohortu ilk sipariş ayı (<code>"YYYY-MM"</code> metni), her siparişin <code>ay_no</code>\'su ilk aya göre geçen tam ay sayısı (yıl*12+ay farkı). Dönüş: satırlar kohort, sütunlar ay_no, hücreler o kohorttan o ayda sipariş veren <b>benzersiz</b> müşteri sayısı; olmayan hücre 0. (<code>groupby(...).nunique().unstack(fill_value=0)</code>)</p>',
      start: 'import pandas as pd\n\nKAYITLAR = [\n    {"musteri": "Ayşe", "tarih": "2024-01-05", "tutar": 120.0},\n    {"musteri": "Mehmet", "tarih": "2024-01-12", "tutar": 850.0},\n    {"musteri": "Ayşe", "tarih": "2024-02-03", "tutar": 60.0},\n    {"musteri": "Zeynep", "tarih": "2024-02-10", "tutar": 850.0},\n    {"musteri": "Ayşe", "tarih": "2024-03-15", "tutar": 850.0},\n    {"musteri": "Mehmet", "tarih": "2024-03-20", "tutar": 120.0},\n    {"musteri": "Ali", "tarih": "2024-03-22", "tutar": 400.0},\n    {"musteri": "Zeynep", "tarih": "2024-04-01", "tutar": 60.0},\n    {"musteri": "Ali", "tarih": "2024-04-18", "tutar": 120.0},\n    {"musteri": "Elif", "tarih": "2024-04-25", "tutar": 400.0},\n]\ndf = pd.DataFrame(KAYITLAR)\ndf["tarih"] = pd.to_datetime(df["tarih"])\n\ndef kohort_tablosu(df):\n    pass\n',
      sol: 'import pandas as pd\n\nKAYITLAR = [\n    {"musteri": "Ayşe", "tarih": "2024-01-05", "tutar": 120.0},\n    {"musteri": "Mehmet", "tarih": "2024-01-12", "tutar": 850.0},\n    {"musteri": "Ayşe", "tarih": "2024-02-03", "tutar": 60.0},\n    {"musteri": "Zeynep", "tarih": "2024-02-10", "tutar": 850.0},\n    {"musteri": "Ayşe", "tarih": "2024-03-15", "tutar": 850.0},\n    {"musteri": "Mehmet", "tarih": "2024-03-20", "tutar": 120.0},\n    {"musteri": "Ali", "tarih": "2024-03-22", "tutar": 400.0},\n    {"musteri": "Zeynep", "tarih": "2024-04-01", "tutar": 60.0},\n    {"musteri": "Ali", "tarih": "2024-04-18", "tutar": 120.0},\n    {"musteri": "Elif", "tarih": "2024-04-25", "tutar": 400.0},\n]\ndf = pd.DataFrame(KAYITLAR)\ndf["tarih"] = pd.to_datetime(df["tarih"])\n\ndef ay_index(seri):\n    return seri.dt.year * 12 + seri.dt.month\n\ndef kohort_tablosu(df):\n    df = df.copy()\n    ilk = df.groupby("musteri", observed=True)["tarih"].min()\n    df["ilk"] = df["musteri"].map(ilk)\n    df["kohort"] = df["ilk"].dt.to_period("M").astype(str)\n    df["ay_no"] = ay_index(df["tarih"]) - ay_index(df["ilk"])\n    tablo = (df.groupby(["kohort", "ay_no"], observed=True)["musteri"]\n               .nunique().unstack(fill_value=0))\n    return tablo\n',
      tests: 't = kohort_tablosu(df)\nassert list(t.index) == ["2024-01", "2024-02", "2024-03", "2024-04"], f"kohort satırları, gelen {list(t.index)}"\nassert [int(c) for c in t.columns] == [0, 1, 2], f"ay_no sütunları 0,1,2; gelen {list(t.columns)}"\nassert int(t.loc["2024-01", 0]) == 2 and int(t.loc["2024-01", 1]) == 1 and int(t.loc["2024-01", 2]) == 2, "Ocak kohortu: 2, 1, 2"\nassert int(t.loc["2024-02", 1]) == 0 and int(t.loc["2024-02", 2]) == 1, "Şubat kohortu: 1. ay 0, 2. ay 1"\nassert int(t.loc["2024-04", 0]) == 1 and int(t.loc["2024-04", 1]) == 0, "Nisan kohortu 1, sonra 0"\nassert "ilk" not in df.columns and "kohort" not in df.columns, "girdi değiştirilmemeli"\n',
      hints: ['İlk sipariş: groupby("musteri")["tarih"].min(); map ile her satıra yay.', 'Ay indeksi: dt.year*12 + dt.month; fark ay_no.', 'groupby(["kohort", "ay_no"])["musteri"].nunique().unstack(fill_value=0).'],
      why: 'Kohort analizi üç adım: ilk ay, görece ay, pivot. nunique aynı müşterinin aynı ayda iki siparişini bir kez sayar; fill_value=0 boş hücreleri doldurur. Yıl*12+ay tamsayısı Period aritmetiğine göre sürümden bağımsızdır.' },
    { t: 'code', id: 'proje-ileri-4',
      q: '<p>Parça 4: <code>en_cok_satan(df, sutun="urun", n=3)</code> yaz. <code>sutun</code>\'a göre gruplayıp <code>adet</code> (satır sayısı) ve <code>ciro</code> (tutar toplamı) sütunlarıyla, ciroya göre azalan (eşitlikte <code>sutun</code> değerine göre artan) sıralı ilk <code>n</code> satırı döndür; indeks 0\'dan başlasın ve sütunlar tam olarak <code>[sutun, "adet", "ciro"]</code> olsun.</p>',
      start: 'import pandas as pd\n\ndf = pd.DataFrame({\n    "urun": ["Kalem", "Kulaklık", "Defter", "Kulaklık", "Kulaklık", "Kalem", "Çanta", "Defter", "Kalem", "Çanta"],\n    "kategori": ["Kırtasiye", "Elektronik", "Kırtasiye", "Elektronik", "Elektronik", "Kırtasiye", "Aksesuar", "Kırtasiye", "Kırtasiye", "Aksesuar"],\n    "tutar": [120.0, 850.0, 60.0, 850.0, 850.0, 120.0, 400.0, 60.0, 120.0, 400.0],\n})\n\ndef en_cok_satan(df, sutun="urun", n=3):\n    pass\n',
      sol: 'import pandas as pd\n\ndf = pd.DataFrame({\n    "urun": ["Kalem", "Kulaklık", "Defter", "Kulaklık", "Kulaklık", "Kalem", "Çanta", "Defter", "Kalem", "Çanta"],\n    "kategori": ["Kırtasiye", "Elektronik", "Kırtasiye", "Elektronik", "Elektronik", "Kırtasiye", "Aksesuar", "Kırtasiye", "Kırtasiye", "Aksesuar"],\n    "tutar": [120.0, 850.0, 60.0, 850.0, 850.0, 120.0, 400.0, 60.0, 120.0, 400.0],\n})\n\ndef en_cok_satan(df, sutun="urun", n=3):\n    g = df.groupby(sutun, observed=True)["tutar"].agg(["count", "sum"]).reset_index()\n    g.columns = [sutun, "adet", "ciro"]\n    return (g.sort_values(["ciro", sutun], ascending=[False, True])\n             .head(n).reset_index(drop=True))\n',
      tests: 'r = en_cok_satan(df)\nassert list(r.columns) == ["urun", "adet", "ciro"], f"sütunlar, gelen {list(r.columns)}"\nassert list(r["urun"]) == ["Kulaklık", "Çanta", "Kalem"], f"sıra, gelen {list(r[\'urun\'])}"\nassert list(r["adet"]) == [3, 2, 3], "adetler"\nassert [float(x) for x in r["ciro"]] == [2550.0, 800.0, 360.0], "cirolar"\nassert list(r.index) == [0, 1, 2], "indeks 0..2"\nk = en_cok_satan(df, "kategori", 2)\nassert list(k["kategori"]) == ["Elektronik", "Aksesuar"], "kategori ilk 2"\nassert len(en_cok_satan(df, n=10)) == 4, "n büyükse tüm ürünler"\n',
      hints: ['groupby(sutun)["tutar"].agg(["count", "sum"]).reset_index() ve sütunları yeniden adlandır.', 'sort_values([ciro, sutun], ascending=[False, True]).head(n).reset_index(drop=True).'],
      why: 'agg ile iki özet tek seferde gelir. İkincil sıralama anahtarı eşit ciroda deterministik sıra sağlar; reset_index(drop=True) temiz 0..n-1 indeks verir.' },
    { t: 'code', id: 'proje-ileri-5',
      q: '<p>Parça 5: sahte API ve istemci. <code>api_sayfa(kayitlar, sayfa, boyut)</code> coroutine\'i <code>asyncio.sleep(0.01)</code> bekleyip <code>{"veri": [...], "son": bool}</code> döndürsün (<code>son</code>: bu sayfadan sonra kayıt kalmadı mı). <code>hepsini_cek(kayitlar, boyut)</code> sayfaları 0\'dan başlayarak <code>son</code> gelene kadar sırayla çekip <code>(tum_kayitlar, sayfa_sayisi)</code> döndürsün. Boş liste için 1 sayfa (boş) çekilmiş sayılır.</p>',
      start: 'import asyncio\n\nasync def api_sayfa(kayitlar, sayfa, boyut):\n    pass\n\nasync def hepsini_cek(kayitlar, boyut):\n    pass\n',
      sol: 'import asyncio\n\nasync def api_sayfa(kayitlar, sayfa, boyut):\n    await asyncio.sleep(0.01)\n    bas = sayfa * boyut\n    return {"veri": kayitlar[bas:bas + boyut], "son": bas + boyut >= len(kayitlar)}\n\nasync def hepsini_cek(kayitlar, boyut):\n    hepsi, sayfa = [], 0\n    while True:\n        yanit = await api_sayfa(kayitlar, sayfa, boyut)\n        hepsi.extend(yanit["veri"])\n        if yanit["son"]:\n            break\n        sayfa += 1\n    return hepsi, sayfa + 1\n',
      tests: 'import asyncio, inspect\nassert inspect.iscoroutinefunction(api_sayfa) and inspect.iscoroutinefunction(hepsini_cek), "ikisi de async def olmalı"\nloop = asyncio.new_event_loop()\nkayit = [{"id": i} for i in range(10)]\ny = loop.run_until_complete(api_sayfa(kayit, 2, 4))\nassert y["veri"] == [{"id": 8}, {"id": 9}] and y["son"] is True, "2. sayfa (boyut 4) son 2 kayıt ve son=True"\ny0 = loop.run_until_complete(api_sayfa(kayit, 0, 4))\nassert len(y0["veri"]) == 4 and y0["son"] is False, "0. sayfa 4 kayıt, son değil"\nhepsi, n = loop.run_until_complete(hepsini_cek(kayit, 4))\nassert hepsi == kayit and n == 3, "10 kayıt, boyut 4 -> 3 sayfa"\nhepsi2, n2 = loop.run_until_complete(hepsini_cek(kayit, 5))\nassert hepsi2 == kayit and n2 == 2, "boyut 5 -> tam 2 sayfa"\nbos, nb = loop.run_until_complete(hepsini_cek([], 4))\nassert bos == [] and nb == 1, "boş veri: 1 boş sayfa"\nloop.close()\n',
      hints: ['Dilim: kayitlar[sayfa*boyut : sayfa*boyut + boyut]; son = bas + boyut >= len.', 'İstemcide while True: await, extend, son ise break, sayfa += 1.'],
      why: 'Sayfalı API kalıbı: sunucu "daha var mı" bilgisini döndürür, istemci ona göre durur. Sıralı await burada doğru çünkü bir sonraki istek öncekinin cevabına bağlı; tam boyutta biten veri için son bayrağı >= ile doğru hesaplanır.' },
    { t: 'code', id: 'proje-ileri-6',
      q: '<p>Parça 6: CLI. <code>parse_args(argv)</code> fonksiyonu argparse ile şu arayüzü kursun: zorunlu konumsal <code>komut</code> (<code>rfm</code>, <code>kohort</code>, <code>top</code> seçenekleri), <code>--bugun</code> (varsayılan <code>"2024-05-01"</code>), <code>--q</code> (int, 4), <code>--n</code> (int, 3), <code>--sutun</code> (<code>urun</code>/<code>kategori</code>, varsayılan <code>urun</code>). Ardından <code>main(argv)</code>: komuta göre <code>"rfm q=4 bugun=2024-05-01"</code>, <code>"kohort"</code> ya da <code>"top sutun=urun n=3"</code> biçiminde metin döndürsün (gerçek hesap yerine özet metin; iş mantığı diğer parçalarda).</p>',
      start: 'import argparse\n\ndef parse_args(argv):\n    pass\n\ndef main(argv):\n    pass\n',
      sol: 'import argparse\n\ndef parse_args(argv):\n    p = argparse.ArgumentParser(prog="analitik")\n    p.add_argument("komut", choices=["rfm", "kohort", "top"])\n    p.add_argument("--bugun", default="2024-05-01")\n    p.add_argument("--q", type=int, default=4)\n    p.add_argument("--n", type=int, default=3)\n    p.add_argument("--sutun", choices=["urun", "kategori"], default="urun")\n    return p.parse_args(argv)\n\ndef main(argv):\n    a = parse_args(argv)\n    if a.komut == "rfm":\n        return f"rfm q={a.q} bugun={a.bugun}"\n    if a.komut == "kohort":\n        return "kohort"\n    return f"top sutun={a.sutun} n={a.n}"\n',
      tests: 'a = parse_args(["rfm"])\nassert a.komut == "rfm" and a.q == 4 and a.bugun == "2024-05-01" and a.n == 3 and a.sutun == "urun", "varsayılanlar"\nb = parse_args(["top", "--sutun", "kategori", "--n", "2"])\nassert b.sutun == "kategori" and b.n == 2 and isinstance(b.n, int), "--n int olmalı"\nassert main(["rfm", "--q", "3", "--bugun", "2024-06-01"]) == "rfm q=3 bugun=2024-06-01", "rfm çıktısı"\nassert main(["kohort"]) == "kohort", "kohort çıktısı"\nassert main(["top"]) == "top sutun=urun n=3", "top çıktısı"\nimport contextlib, io\nfor kotu in (["sil"], ["top", "--sutun", "fiyat"], ["rfm", "--q", "abc"]):\n    try:\n        with contextlib.redirect_stderr(io.StringIO()):\n            parse_args(kotu)\n        raise AssertionError(f"{kotu} geçersiz olmalı (SystemExit)")\n    except SystemExit:\n        pass\n',
      hints: ['add_argument("komut", choices=[...]) konumsal; --q için type=int, default=4.', 'parse_args(argv) listeyi doğrudan alır; sys.argv kullanma.', 'main içinde a.komut\'a göre f-string döndür.'],
      why: 'argparse choices ve type doğrulamayı sana bırakmaz; geçersiz değerde hata mesajı basıp SystemExit fırlatır. parse_args(liste) tasarımı CLI\'yı test edilebilir kılar; main sonucu print etmek yerine döndürünce testler çıktıyı yakalamakla uğraşmaz.' },
    { t: 'mc', q: '<code>pd.qcut</code> çağrısından önce <code>rank(method="first")</code> uygulamanın amacı nedir?',
      o: ['Değerleri büyükten küçüğe sıralayıp en büyüğe 1 vermek', 'Eşit değerleri ayırıp kutu sınırı çakışmasını önlemek', 'NaN değerleri sütun ortalamasıyla doldurmak', 'Skorları 0-1 aralığına ölçeklemek'], a: 1,
      why: 'qcut quantile sınırlarını değerlerden hesaplar; çok sayıda eşit değer olunca sınırlar çakışır ve ValueError verir. rank(method="first") her satıra benzersiz sıra vererek sınırları ayırır.' },
    { t: 'mc', q: 'Kohort tablosunda 0. sütun (ay_no = 0) neyi gösterir?',
      o: ['Kohortun ilk ayındaki toplam cirosu', 'Kohort büyüklüğü (ilk aydaki müşteri sayısı)', 'İlk aydan sonra kaybedilen müşteri sayısı', 'Kohortun ortalama sipariş tutarı'], a: 1,
      why: 'ay_no = 0, her müşterinin ilk sipariş ayıdır; o hücre kohorttaki herkesi içerir. Sonraki sütunlar bu sayıya bölünerek tutundurma oranı elde edilir.' }
  ],
  faq: [
    { q: 'RFM için kaç kutu (q) kullanmalıyım?', a: 'Yaygın tercih 4 ya da 5. Müşteri sayısı az ise (yüzlerin altında) 3 yeterli; fazla kutu küçük gruplarda anlamsız ayrımlar üretir. Kutu sayısını yapılandırmadan okunur yap, sabit kodlama.' },
    { q: 'pandas 2.2 ile 3.x arasında bu projeyi etkileyen fark var mı?', a: 'Kullandığımız API\'de yok: groupby(observed=True), qcut, unstack, sort_values iki sürümde de aynı. 3.x\'te metin sütunları varsayılan olarak str türünde gelir ve Copy-on-Write açıktır; bu yüzden inplace ve zincirleme atama kullanmıyoruz.' },
    { q: 'Sayfaları paralel çekmek daha hızlı olmaz mıydı?', a: 'Toplam sayfa sayısı önceden biliniyorsa (API toplam kayıt sayısını döndürüyorsa) gather ile paralel çekmek çok daha hızlıdır; aynı anda istek sayısını Semaphore ile sınırla. "Son sayfa" bayrağına bağlı API\'de sıralı çekmek zorunludur ya da iki aşamalı strateji (önce ilk sayfa, sonra kalanlar paralel) kurulur.' },
    { q: 'Testleri nasıl çalıştırırım, hangi dosya yapısı?', a: 'Paket kökünde tests/ klasörü, her modül için test_*.py; python -m unittest discover ya da pytest. CI\'da (önceki ders) pandas 2.2 ve 3.x için iki matris girişi tanımla.' }
  ],
  mistakes: [
    { bad: 'df["ay"] = df["tarih"].dt.to_period("M")\ndf[df["ay"] == "2024-01"]', good: 'df["ay"] = df["tarih"].dt.to_period("M").astype(str)\ndf[df["ay"] == "2024-01"]', why: 'Period ile metin karşılaştırması sürüme göre farklı davranır; astype(str) ile karşılaştırma ve test her yerde aynı sonucu verir.' },
    { bad: 'pd.qcut(rfm["frequency"], 4, labels=[1, 2, 3, 4])', good: 'pd.qcut(rfm["frequency"].rank(method="first"), 4, labels=[1, 2, 3, 4])', why: 'Çok sayıda eşit frequency değeri kutu sınırlarını çakıştırır ve ValueError üretir; rank ile benzersiz sıra verilir.' },
    { bad: 'rfm.sort_values("skor", inplace=True)\nreturn rfm', good: 'return rfm.sort_values("skor")', why: 'inplace girdiyi değiştirir, test ve çağıran kodu şaşırtır; pandas 3.x Copy-on-Write ile de kafa karıştırıcıdır. Yeni DataFrame döndür.' },
    { bad: 'def main():\n    args = parser.parse_args()\n    ...', good: 'def main(argv=None):\n    args = parser.parse_args(argv)\n    ...', why: 'sys.argv\'ye bağlı main test edilemez; argv parametresi testte liste vermeye, üretimde None ile gerçek argümanları okumaya izin verir.' }
  ]
}
);
})(window);
