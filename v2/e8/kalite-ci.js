/* PythonPatika — v2 e8 uzantı: kalite-ci (karmaşıklık, güvenlik, ileri CI) */
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push({
  id: 'kalite-ci',
  min: 35,
  html: `<h2>Derinleş: kalite hattını üretim düzeyine taşımak</h2>
<p>ruff, mypy, pre-commit ve temel bir GitHub Actions iş akışı kurmayı gördün. Gerçek bir ekipte bunların üstüne dört konu daha eklenir: <b>karmaşıklık ölçümü</b> (kodun ne kadar dallandığı), <b>bilinçli istisnalar</b> (<code>noqa</code>, dosya bazlı kural kapatma), <b>güvenlik taraması</b> (bandit, pip-audit) ve <b>ileri CI</b> (işler arası bağımlılık, önbellek, matris, eşzamanlılık). Parametrize testler ve mock ayrıntıları "İleri test" dersinde; paket yayımlama adımları "Paketleme ve dağıtım" dersinde.</p>

<h3>1. Döngüsel karmaşıklık (cyclomatic complexity)</h3>
<p>Bir fonksiyondaki bağımsız yol sayısıdır: 1'den başlar, her <code>if</code>, <code>elif</code>, <code>for</code>, <code>while</code>, <code>except</code>, üçlü ifade ve her ek <code>and</code>/<code>or</code> koşulu bir ekler. 10'u geçen fonksiyonu test etmek zorlaşır, çünkü her yol için ayrı test gerekir. ruff'ta <code>C901</code> kuralı ve <code>max-complexity</code> ayarı bunu denetler; <code>radon cc -s src/</code> ise harf notu (A–F) verir. Hesap ast ile birkaç satırdır:</p>
<pre class="py">import ast

KOD = """
def kredi_karari(skor, gelir, kara_liste):
    if kara_liste:
        return "red"
    elif skor &gt;= 700 and gelir &gt; 30000:
        return "onay"
    elif skor &gt;= 600 or gelir &gt; 80000:
        return "inceleme"
    return "red"

def kdv(tutar):
    return round(tutar * 1.2, 2)
"""

DALLAR = (ast.If, ast.For, ast.While, ast.IfExp, ast.ExceptHandler)

for f in ast.parse(KOD).body:
    k = 1
    for d in ast.walk(f):
        if isinstance(d, DALLAR):
            k += 1
        elif isinstance(d, ast.BoolOp):
            k += len(d.values) - 1
    print(f"{f.name}: {k}")</pre>
<p><code>elif</code> ast'te ayrı bir düğüm değildir; önceki <code>if</code>'in <code>orelse</code> listesinde iç içe bir <code>ast.If</code> olarak durur. Bu yüzden saymak doğru sonucu verir: <code>kredi_karari</code> için 1 + 3 if + 2 BoolOp = 6.</p>

<h3>2. Bilinçli istisnalar: noqa ve per-file-ignores</h3>
<p>Her kural her yerde doğru değildir. <code>__init__.py</code> içindeki yeniden dışa aktarımlar (re-export) "kullanılmayan import" (F401) gibi görünür; testlerde <code>assert</code> kullanımı bandit'in S101 kuralına takılır. Kuralı bütün projede kapatmak yerine dar kapsamda kapat:</p>
<pre class="code">[tool.ruff.lint]
select = ["E", "F", "I", "B", "UP", "C90", "S"]

[tool.ruff.lint.mccabe]
max-complexity = 10

[tool.ruff.lint.per-file-ignores]
"__init__.py" = ["F401"]        # yeniden dışa aktarım
"tests/**" = ["S101"]           # testte assert serbest</pre>
<p>Tek satırlık istisna için satır sonuna <code># noqa: F401</code> yazılır. Kural kodu olmadan çıplak <code># noqa</code> o satırdaki <b>her</b> uyarıyı susturur; bu yüzden ruff'ın <code>PGH004</code> kuralı çıplak noqa'yı yasaklar. <code>ruff check --statistics</code> hangi kuralın kaç kez tetiklendiğini özetler; yeni bir kuralı açmadan önce bu sayıya bakarsın.</p>
<pre class="py">import re

KAYNAK = """import os  # noqa: F401
import sys  # noqa
eval(girdi)  # noqa: S307, E501
x=1"""

RX = re.compile(r"#\s*noqa(?::\s*([A-Z]+[0-9]+(?:\s*,\s*[A-Z]+[0-9]+)*))?", re.I)
for no, satir in enumerate(KAYNAK.splitlines(), 1):
    m = RX.search(satir)
    if not m:
        print(no, "istisna yok")
    elif m[1] is None:
        print(no, "TÜM kurallar susturuldu (tehlikeli)")
    else:
        print(no, "susturulan:", [k.strip().upper() for k in m[1].split(",")])</pre>

<h3>3. Güvenlik taraması</h3>
<div class="tbl-wrap"><table>
<tr><th>Araç</th><th>Kurulum ve komut</th><th>Ne bulur?</th></tr>
<tr><td>bandit</td><td><code>pip install bandit</code> → <code>bandit -r src -ll</code></td><td>Kod kalıpları: <code>eval</code>, <code>shell=True</code>, sabit parola, <code>pickle.loads</code>, SQL birleştirme</td></tr>
<tr><td>ruff S kuralları</td><td><code>select = ["S"]</code></td><td>bandit kurallarının ruff içindeki karşılığı, çok daha hızlı</td></tr>
<tr><td>pip-audit</td><td><code>pip install pip-audit</code> → <code>pip-audit -r requirements.txt</code></td><td>Bilinen zafiyetli bağımlılık sürümleri (CVE)</td></tr>
<tr><td>detect-secrets / gitleaks</td><td>pre-commit kancası olarak</td><td>Depoya giren token ve anahtarlar</td></tr>
</table></div>
<p>Sık bulgular: <b>B602</b> <code>subprocess.run(komut, shell=True)</code> (kabuk enjeksiyonu; liste argüman kullan), <b>B105</b> <code>parola = "1234"</code> (gizli bilgiyi ortam değişkeninden oku), <b>B608</b> f-string ile kurulmuş SQL (parametreli sorgu kullan), <b>B307</b> <code>eval</code>. Bir bulgu yanlış alarmsa <code># nosec B602</code> ile gerekçesini yazarak kapatırsın.</p>
<div class="warn"><b>Yerelde geçti, CI'da patladı</b>Çoğu zaman sebep sürüm farkıdır: yerelde ruff 0.4, CI'da en yeni sürüm kurulur ve yeni kurallar devreye girer. Araç sürümlerini <code>pyproject.toml</code> dev bağımlılıklarında ve <code>.pre-commit-config.yaml</code>'daki <code>rev</code> alanında sabitle; <code>pre-commit autoupdate</code> ile bilinçli olarak yükselt.</div>

<h3>4. İleri GitHub Actions</h3>
<pre class="code">name: CI
on:
  push: { branches: [main] }
  pull_request:
  workflow_dispatch:                 # elle tetikleme düğmesi

concurrency:                         # aynı PR'a yeni push gelince eskisini iptal et
  group: ci-$&#123;&#123; github.ref &#125;&#125;
  cancel-in-progress: true

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: "3.12", cache: pip }
      - run: pip install ruff mypy && ruff check . && mypy src/
  test:
    needs: lint                      # lint geçmeden test başlamaz
    timeout-minutes: 15
    strategy:
      fail-fast: false               # bir kombinasyon düşse de diğerleri sürsün
      matrix:
        os: [ubuntu-latest, windows-latest]
        python: ["3.11", "3.12"]
        exclude:
          - { os: windows-latest, python: "3.11" }
    runs-on: $&#123;&#123; matrix.os &#125;&#125;
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: "$&#123;&#123; matrix.python &#125;&#125;", cache: pip }
      - run: pip install -e ".[dev]" && pytest --cov --cov-report=xml
      - uses: actions/upload-artifact@v4
        if: always()
        with: { name: "kapsam-$&#123;&#123; matrix.os &#125;&#125;-$&#123;&#123; matrix.python &#125;&#125;", path: coverage.xml }</pre>
<p>Matrisi kafanda genişletebilmelisin: <code>os × python</code> 4 kombinasyon, <code>exclude</code> birini çıkarır, 3 iş koşar. Aynı mantık Python'da:</p>
<pre class="py">from itertools import product

matris = {"os": ["ubuntu-latest", "windows-latest"], "python": ["3.11", "3.12"]}
haric = [{"os": "windows-latest", "python": "3.11"}]

anahtarlar = list(matris)
isler = []
for degerler in product(*matris.values()):
    kombin = dict(zip(anahtarlar, degerler))
    if any(all(kombin[k] == v for k, v in h.items()) for h in haric):
        continue
    isler.append(kombin)
for i in isler:
    print(i["os"], i["python"])
print("toplam iş:", len(isler))</pre>
<p>Yerelde birden fazla Python sürümünde aynı kontrolü koşmak için <b>nox</b> (ya da tox) kullanılır: <code>pip install nox</code>, kökte <code>noxfile.py</code> ve <code>nox -s testler</code>. CI dosyası da yalnızca <code>nox</code> çağırır; böylece "CI'da ne çalışıyorsa yerelde de o çalışır".</p>
<pre class="code">import nox

@nox.session(python=["3.11", "3.12"])
def testler(session):
    session.install("-e", ".[dev]")
    session.run("pytest", "--cov")

@nox.session
def lint(session):
    session.install("ruff")
    session.run("ruff", "check", ".")</pre>
<div class="note"><b>Gerçek işte</b>Yeni katıldığın bir ekipte ilk haftanın tipik görevi: CI'ın neden 20 dakika sürdüğünü bulmak ya da "flaky" (bazen geçen bazen düşen) bir testi ayıklamak. İlk bakacağın yerler: pip önbelleği açık mı, lint ve test ayrı işlerde paralel mi, <code>concurrency</code> ile eski koşular iptal ediliyor mu, yavaş entegrasyon testleri <code>-m "not slow"</code> ile PR'dan ayrılmış mı. Bir de PR açıklamasına "CI yeşil, kapsam %82 → %84" yazmak, inceleyenin işini ciddi biçimde kolaylaştırır.</div>`,
  ex: [
    { t: 'mc', stage: 'Isınma', q: 'Bir satırın sonunda <code># noqa: F401</code> yazıyor. Bu ne anlama gelir?', o: ['Linter bu satırdaki tüm uyarıları, kural ayırt etmeden gizler', 'Yalnız bu satırdaki F401 uyarısı bilinçli olarak susturulur', 'F401 kuralı pyproject ayarı olmadan bütün projede kapatılır', 'Bu satır CI\'da atlanır, yerelde çalıştırılır'], a: 1, why: 'noqa: KOD yalnız o satırda, yalnız belirtilen kuralı susturur. Kural kodu olmayan çıplak # noqa her uyarıyı gizler; proje çapında kapatma ise pyproject.toml\'daki ignore/per-file-ignores ile yapılır.' },
    { t: 'mc', stage: 'Isınma', q: 'GitHub Actions\'ta <code>test</code> işine <code>needs: lint</code> eklersen ne olur?', o: ['test ve lint aynı makinede, aynı ortamda sırayla çalışır', 'lint başarısız olsa bile test hemen paralel olarak başlar', 'test, lint başarıyla bitmeden başlamaz', 'lint, test bittikten sonra ve yalnız başarılıysa çalışır'], a: 2, why: 'İşler varsayılan olarak paralel ve ayrı makinelerde koşar. needs bir bağımlılık kurar: test yalnız lint başarılı biterse başlar. Böylece biçim hatası olan PR için uzun test süresi harcanmaz.' },
    { t: 'predict', stage: 'Kodu oku', q: 'Matrisi genişleten bu kod ne yazdırır?', code: 'from itertools import product\npythonlar = ["3.11", "3.12", "3.13"]\nsistemler = ["ubuntu", "windows"]\nharic = {("3.11", "windows"), ("3.13", "windows")}\nisler = [k for k in product(pythonlar, sistemler) if k not in haric]\nprint(len(isler), isler[-1])\n', o: ['6 (\'3.13\', \'windows\')', '4 (\'3.13\', \'ubuntu\')', '4 (\'3.12\', \'windows\')', '5 (\'3.13\', \'ubuntu\')'], a: 1, why: '3 × 2 = 6 kombinasyondan 2\'si çıkarılır, 4 kalır. product son listeyi en hızlı döndürür: ... ("3.13", "ubuntu"), ("3.13", "windows"); ikincisi hariç olduğu için son eleman ("3.13", "ubuntu").' },
    { t: 'predict', stage: 'Kodu oku', q: '<code>elif</code> içeren bu kodda kaç tane <code>ast.If</code> düğümü vardır?', code: 'import ast\nkod = """\nif tutar > 1000:\n    seviye = "yüksek"\nelif tutar > 100:\n    seviye = "orta"\nelse:\n    seviye = "düşük"\n"""\nagac = ast.parse(kod.strip())\nprint(sum(isinstance(d, ast.If) for d in ast.walk(agac)))\n', o: ['1', '2', '3', '0'], a: 1, why: 'ast\'te elif diye ayrı düğüm yoktur: elif, dıştaki If düğümünün orelse listesinde ikinci bir If olarak durur. else ise yalnızca bu iç If\'in orelse gövdesidir, yeni düğüm eklemez. Toplam 2.' },
    { t: 'predict', stage: 'Kodu oku', q: 'CI adımlarını taklit eden bu döngü hangi adımları çalıştırır? (Üçüncü alan <code>continue-on-error</code> karşılığıdır.)', code: 'adimlar = [("ruff", 0, False), ("mypy", 1, True), ("pytest", 1, False), ("rapor", 0, False)]\ncalisan = []\nfor ad, kod, devam in adimlar:\n    calisan.append(ad)\n    if kod != 0 and not devam:\n        break\nprint(calisan)\n', o: ['[\'ruff\', \'mypy\']', '[\'ruff\', \'mypy\', \'pytest\', \'rapor\']', '[\'ruff\']', '[\'ruff\', \'mypy\', \'pytest\']'], a: 3, why: 'mypy başarısız (1) ama continue-on-error True olduğu için iş sürer. pytest de başarısız ve devam izni yok; listeye eklendikten sonra döngü kırılır, rapor çalışmaz. GitHub Actions\'ta da başarısız bir adım sonraki adımları atlatır.' },
    { t: 'order', stage: 'Kodu oku', q: '<p>Kaynak koddaki <code># noqa: KURAL</code> yorumlarını bulup satır numarasıyla susturulan kuralları yazdıran programın satırlarını sırala.</p>', lines: ['import re', 'kaynak = "import os  # noqa: F401\\nx = 1\\neval(s)  # noqa: S307"', 'for no, satir in enumerate(kaynak.splitlines(), 1):', '    m = re.search(r"#\\s*noqa:\\s*([A-Z]+\\d+)", satir)', '    if m:', '        print(no, m.group(1))'], expect: '1 F401\n3 S307\n', hint: 'Kaynak metin döngüden önce tanımlanmalı; arama her satır için döngü içinde yapılır.', why: 'enumerate(..., 1) satır numaralarını 1\'den başlatır. Düzenli ifade "# noqa:" sonrasındaki kural kodunu yakalar; eşleşme yoksa (x = 1) satır atlanır.' },
    { t: 'code', stage: 'Rehberli', id: 'kalite-ci-x1', diff: 2, q: '<p><code>karmasiklik(kod: str) -&gt; dict[str, int]</code> yaz. Kodun <b>en üst düzeyindeki</b> her fonksiyon için döngüsel karmaşıklığı hesapla: 1\'den başla; fonksiyonun içindeki her <code>ast.If</code>, <code>ast.For</code>, <code>ast.While</code>, <code>ast.IfExp</code>, <code>ast.ExceptHandler</code> düğümü için +1; her <code>ast.BoolOp</code> için <code>len(values) - 1</code> ekle. Sözlüğü fonksiyon adı → karmaşıklık olarak döndür.</p>', guide: ['ast.parse(kod) ile ağacı kur.', 'Yalnız ağacın body listesindeki ast.FunctionDef düğümlerini dolaş.', 'Her fonksiyon için sayacı 1\'den başlat ve ast.walk(fonksiyon) ile düğümleri gez.', 'Dal düğümleri için +1, BoolOp için len(values) - 1 ekle.', 'Sonucu sözlüğe yaz.'], example: 'import ast\n\nkod = "def f(x):\\n    for i in x:\\n        print(i)\\n\\ndef g():\\n    return 1\\n"\nfor dugum in ast.parse(kod).body:\n    if isinstance(dugum, ast.FunctionDef):\n        donguler = sum(isinstance(d, ast.For) for d in ast.walk(dugum))\n        print(dugum.name, "döngü sayısı:", donguler)\n', start: 'import ast\n\nDALLAR = (ast.If, ast.For, ast.While, ast.IfExp, ast.ExceptHandler)\n\ndef karmasiklik(kod):\n    sonuc = {}\n    for dugum in ast.parse(kod).body:\n        # TODO: yalnız FunctionDef düğümleri\n        # TODO: 1\'den başla, dalları ve BoolOp\'ları say\n        pass\n    return sonuc\n', sol: 'import ast\n\nDALLAR = (ast.If, ast.For, ast.While, ast.IfExp, ast.ExceptHandler)\n\ndef karmasiklik(kod):\n    sonuc = {}\n    for dugum in ast.parse(kod).body:\n        if not isinstance(dugum, ast.FunctionDef):\n            continue\n        k = 1\n        for d in ast.walk(dugum):\n            if isinstance(d, DALLAR):\n                k += 1\n            elif isinstance(d, ast.BoolOp):\n                k += len(d.values) - 1\n        sonuc[dugum.name] = k\n    return sonuc\n', tests: 'KOD = """\nX = 5\n\ndef basit(a):\n    return a * 2\n\ndef karar(skor, gelir, liste):\n    if liste:\n        return "red"\n    elif skor > 700 and gelir > 3 and gelir < 9:\n        return "onay"\n    for _ in range(3):\n        try:\n            pass\n        except ValueError:\n            pass\n    return "a" if skor else "b"\n"""\nimport textwrap\nr = karmasiklik(textwrap.dedent(KOD))\nassert r.get("basit") == 1, "dalsız fonksiyonun karmaşıklığı 1\'dir"\nassert r.get("karar") == 8, f"karar: 1 + 2 if + 2 (üçlü and) + 1 for + 1 except + 1 üçlü ifade = 8, gelen {r.get(\'karar\')}"\nassert set(r) == {"basit", "karar"}, "yalnız fonksiyonlar sözlükte olmalı"\nassert karmasiklik("x = 1") == {}, "fonksiyon yoksa boş sözlük"\n', hints: ['ast.walk(dugum) fonksiyonun tüm alt düğümlerini (iç içe olanlar dahil) gezer.', 'isinstance ikinci argüman olarak bir demet alabilir: isinstance(d, DALLAR).', 'a and b and c tek BoolOp\'tur, values uzunluğu 3: 2 ek yol.'], why: 'ruff C901 ve radon tam olarak bu sayımı yapar. Eşiği (genelde 10) aşan fonksiyonu daha küçük fonksiyonlara bölmek hem okunabilirliği hem test edilebilirliği artırır.' },
    { t: 'code', stage: 'Rehberli', id: 'kalite-ci-x2', diff: 2, q: '<p>Küçük bir bandit yaz. <code>guvenlik_tara(kod: str) -&gt; list[tuple[int, str]]</code> şu bulguları <code>(satır, kod)</code> olarak satıra göre sıralı döndürsün:</p><ul><li><code>B307</code>: <code>eval(...)</code> ya da <code>exec(...)</code> çağrısı (ad doğrudan <code>ast.Name</code>).</li><li><code>B602</code>: herhangi bir çağrıda <code>shell=True</code> anahtar argümanı (değer sabit <code>True</code>).</li><li><code>B105</code>: adı (küçük harfle) <code>parola</code>, <code>password</code>, <code>secret</code> ya da <code>token</code> <b>içeren</b> bir değişkene metin sabiti atanması (<code>ast.Assign</code>, hedef <code>ast.Name</code>).</li></ul>', guide: ['ast.walk ile tüm düğümleri gez, bulgular listesini doldur.', 'ast.Call düğümünde func bir ast.Name ise id\'si eval/exec mi bak.', 'Aynı Call düğümünün keywords listesinde arg == "shell" ve value bir ast.Constant True mu bak.', 'ast.Assign düğümünde value ast.Constant ve str ise hedef adlarını kontrol et.', 'sorted(bulgular) döndür.'], example: 'import ast\n\nkod = "open(yol, mode=\'w\')\\nprint(\'x\', end=\'\')\\n"\nfor d in ast.walk(ast.parse(kod)):\n    if isinstance(d, ast.Call):\n        for kw in d.keywords:\n            print(d.lineno, kw.arg, repr(kw.value.value))\n', start: 'import ast\n\nGIZLI = ("parola", "password", "secret", "token")\n\ndef guvenlik_tara(kod):\n    bulgular = []\n    for d in ast.walk(ast.parse(kod)):\n        if isinstance(d, ast.Call):\n            # TODO: eval/exec -> B307, shell=True -> B602\n            pass\n        elif isinstance(d, ast.Assign):\n            # TODO: gizli adlı değişkene str sabiti -> B105\n            pass\n    return bulgular\n', sol: 'import ast\n\nGIZLI = ("parola", "password", "secret", "token")\n\ndef guvenlik_tara(kod):\n    bulgular = []\n    for d in ast.walk(ast.parse(kod)):\n        if isinstance(d, ast.Call):\n            if isinstance(d.func, ast.Name) and d.func.id in ("eval", "exec"):\n                bulgular.append((d.lineno, "B307"))\n            for kw in d.keywords:\n                if kw.arg == "shell" and isinstance(kw.value, ast.Constant) and kw.value.value is True:\n                    bulgular.append((d.lineno, "B602"))\n        elif isinstance(d, ast.Assign):\n            if isinstance(d.value, ast.Constant) and isinstance(d.value.value, str):\n                for h in d.targets:\n                    if isinstance(h, ast.Name) and any(g in h.id.lower() for g in GIZLI):\n                        bulgular.append((d.lineno, "B105"))\n    return sorted(bulgular)\n', tests: 'KOD = "\\n".join([\n    "import subprocess",\n    "DB_PAROLA = \'Anadolu123\'",\n    "api_token = os.environ[\'TOKEN\']",\n    "sonuc = eval(girdi)",\n    "subprocess.run(\'ls \' + yol, shell=True)",\n    "subprocess.run([\'ls\', yol], shell=False)",\n    "aciklama = \'parola sıfırlama\'",\n    "exec(kod)",\n])\nr = guvenlik_tara(KOD)\nassert r == [(2, "B105"), (4, "B307"), (5, "B602"), (8, "B307")], f"beklenen bulgular farklı, gelen: {r}"\nassert guvenlik_tara("x = 1\\nprint(x)") == [], "temiz kodda bulgu olmamalı"\n', hints: ['Call düğümünde iki ayrı kontrol var; ikisi de aynı düğümde tetiklenebilir, elif kullanma.', 'shell=False ya da shell=degisken bulgu değildir: değer sabit True olmalı.', 'Ortam değişkeninden okunan token (ast.Subscript) sabit değildir; yalnız ast.Constant str yakala.'], why: 'bandit ve ruff\'ın S kuralları ast üzerinde bu tür kalıp eşleştirmesi yapar. Ad içinde "parola" geçen ama değeri ortam değişkeninden gelen satırın bulgu sayılmaması, yanlış alarmı azaltan ayrıntıdır.' },
    { t: 'code', stage: 'Rehberli', id: 'kalite-ci-x3', diff: 2, q: '<p><code>matris_genislet(matris: dict) -&gt; list[dict]</code> yaz. <code>matris</code> içindeki <code>exclude</code> ve <code>include</code> dışındaki her anahtar bir değer listesidir. Bu listelerin kartezyen çarpımını anahtar sırasını koruyarak sözlükler olarak üret. <code>exclude</code> listesindeki her sözlüğün <b>tüm</b> anahtar/değerleri eşleşen kombinasyonu çıkar. <code>include</code> listesindeki sözlükleri sona olduğu gibi ekle. İki anahtar da isteğe bağlıdır.</p>', guide: ['exclude ve include listelerini matris.get(..., []) ile al.', 'Diğer anahtarları sırayla bir listeye koy.', 'itertools.product(*değer_listeleri) ile kombinasyonları üret; dict(zip(anahtarlar, degerler)).', 'Bir hariç sözlüğün tüm öğeleri kombinasyonda aynıysa onu atla.', 'Sonuna include sözlüklerinin kopyalarını ekle.'], example: 'from itertools import product\n\nbedenler = ["S", "M"]\nrenkler = ["mavi", "siyah"]\nfor b, r in product(bedenler, renkler):\n    if (b, r) == ("S", "siyah"):\n        continue\n    print({"beden": b, "renk": r})\n', start: 'from itertools import product\n\ndef matris_genislet(matris):\n    haric = matris.get("exclude", [])\n    ekle = matris.get("include", [])\n    anahtarlar = [k for k in matris if k not in ("exclude", "include")]\n    sonuc = []\n    # TODO: kartezyen çarpım, exclude filtresi\n    # TODO: include ekle\n    return sonuc\n', sol: 'from itertools import product\n\ndef matris_genislet(matris):\n    haric = matris.get("exclude", [])\n    ekle = matris.get("include", [])\n    anahtarlar = [k for k in matris if k not in ("exclude", "include")]\n    sonuc = []\n    for degerler in product(*(matris[k] for k in anahtarlar)):\n        kombin = dict(zip(anahtarlar, degerler))\n        if any(all(kombin.get(k) == v for k, v in h.items()) for h in haric):\n            continue\n        sonuc.append(kombin)\n    sonuc.extend(dict(e) for e in ekle)\n    return sonuc\n', tests: 'm = {"os": ["ubuntu", "windows"], "python": ["3.11", "3.12"],\n     "exclude": [{"os": "windows", "python": "3.11"}],\n     "include": [{"os": "macos", "python": "3.12", "deneysel": True}]}\nr = matris_genislet(m)\nassert r[:3] == [{"os": "ubuntu", "python": "3.11"}, {"os": "ubuntu", "python": "3.12"}, {"os": "windows", "python": "3.12"}], f"çarpım sırası ve exclude yanlış: {r}"\nassert r[3] == {"os": "macos", "python": "3.12", "deneysel": True}, "include sona eklenmeli"\nassert len(r) == 4, "4 iş beklenir"\nr2 = matris_genislet({"python": ["3.12"], "exclude": [{"os": "windows"}]})\nassert r2 == [{"python": "3.12"}], "kombinasyonda olmayan anahtarla exclude eşleşmemeli"\nr3 = matris_genislet({"db": ["sqlite", "pg"], "py": ["3.12"], "exclude": [{"db": "pg"}]})\nassert r3 == [{"db": "sqlite", "py": "3.12"}], "kısmi exclude: yalnız db=pg olan tüm kombinasyonlar çıkar"\n', hints: ['product(*listeler) her listeden bir eleman seçerek demetler üretir.', 'Kısmi eşleşme: all(kombin.get(k) == v for k, v in h.items()).', 'Eksik anahtar için kombin[k] yerine kombin.get(k) kullan, KeyError almazsın.'], why: 'GitHub Actions matrisi tam olarak böyle genişler. Kaç iş koşacağını önceden hesaplamak hem CI süresini hem dakika maliyetini tahmin etmeni sağlar.' },
    { t: 'code', stage: 'Kendin yaz', id: 'kalite-ci-x4', diff: 2, q: '<p><code>noqa_filtrele(bulgular: list[tuple[int, str]], kaynak: str) -&gt; list[tuple[int, str]]</code> yaz. <code>bulgular</code> linter çıktısıdır: <code>(satır_no, kural)</code>. Bir satırda çıplak <code># noqa</code> varsa o satırdaki tüm bulgular, <code># noqa: F401, E501</code> biçimindeyse yalnız listelenen kurallar elenir (büyük/küçük harf duyarsız, virgül çevresinde boşluk olabilir). Kalan bulguları orijinal sırada döndür.</p>', start: 'def noqa_filtrele(bulgular, kaynak):\n    pass\n', sol: 'import re\n\nRX = re.compile(r"#\\s*noqa(?::\\s*([A-Za-z]+\\d+(?:\\s*,\\s*[A-Za-z]+\\d+)*))?", re.I)\n\ndef noqa_filtrele(bulgular, kaynak):\n    istisna = {}\n    for no, satir in enumerate(kaynak.splitlines(), 1):\n        m = RX.search(satir)\n        if m:\n            istisna[no] = None if m[1] is None else {k.strip().upper() for k in m[1].split(",")}\n    kalan = []\n    for no, kural in bulgular:\n        if no in istisna and (istisna[no] is None or kural.upper() in istisna[no]):\n            continue\n        kalan.append((no, kural))\n    return kalan\n', tests: 'kaynak = "import os  # noqa: F401\\nimport sys  # NOQA\\nx=eval(s)  # noqa: s307 , E225\\ny = 1"\nb = [(1, "F401"), (1, "E501"), (2, "F401"), (2, "E401"), (3, "S307"), (3, "E225"), (3, "E501"), (4, "F821")]\nr = noqa_filtrele(b, kaynak)\nassert r == [(1, "E501"), (3, "E501"), (4, "F821")], f"beklenmeyen sonuç: {r}"\nassert noqa_filtrele([(1, "F401")], "import os") == [(1, "F401")], "noqa yoksa bulgu kalır"\n', hints: ['Önce her satır için susturma bilgisini sözlükte topla: None = hepsi, küme = belirli kurallar.', 'Düzenli ifadede kural listesi isteğe bağlı grup olmalı: #\\s*noqa(?::\\s*(...))?', 'Kuralları karşılaştırmadan önce .strip().upper() uygula.'], why: 'ruff ve flake8 noqa yorumlarını bu mantıkla işler. Çıplak noqa\'nın her şeyi susturması, onu tehlikeli yapan şeydir; ekipler bu yüzden kural kodlu noqa\'yı zorunlu tutar.' },
    { t: 'code', stage: 'Kendin yaz', id: 'kalite-ci-x5', diff: 2, q: '<p><code>is_sirasi(isler: dict[str, list[str]]) -&gt; list[str]</code> yaz. Anahtar iş adı, değer o işin <code>needs</code> listesidir. İşleri, her iş bağımlı olduğu işlerden <b>sonra</b> gelecek şekilde sırala; aynı anda başlayabilecek işler arasında alfabetik sıra kullan. Döngüsel bağımlılık varsa ya da <code>needs</code> tanımsız bir işi gösteriyorsa <code>ValueError</code> fırlat.</p>', start: 'def is_sirasi(isler):\n    pass\n', sol: 'def is_sirasi(isler):\n    for ad, gerekli in isler.items():\n        for g in gerekli:\n            if g not in isler:\n                raise ValueError(f"{ad}: tanımsız iş {g}")\n    kalan = {ad: set(g) for ad, g in isler.items()}\n    sira = []\n    while kalan:\n        hazir = sorted(ad for ad, g in kalan.items() if not g)\n        if not hazir:\n            raise ValueError(f"döngüsel bağımlılık: {sorted(kalan)}")\n        ad = hazir[0]\n        sira.append(ad)\n        del kalan[ad]\n        for g in kalan.values():\n            g.discard(ad)\n    return sira\n', tests: 'isler = {"deploy": ["test", "build"], "test": ["lint"], "lint": [], "build": ["lint"], "docs": []}\nassert is_sirasi(isler) == ["docs", "lint", "build", "test", "deploy"], f"sıra yanlış: {is_sirasi(isler)}"\nassert is_sirasi({}) == [], "boş iş akışı"\nfor kotu in [{"a": ["b"], "b": ["a"]}, {"a": ["yok"]}]:\n    try:\n        is_sirasi(kotu)\n        assert False, f"{kotu} için ValueError bekleniyordu"\n    except ValueError:\n        pass\n', hints: ['Bu bir topolojik sıralama (Kahn algoritması) problemi.', 'Her adımda bağımlılığı kalmamış işleri bul, alfabetik ilkini seç.', 'Hazır iş yoksa ama iş kaldıysa döngü vardır.'], why: 'GitHub Actions needs grafiğini tam olarak böyle çözer; döngüsel needs tanımında iş akışı hiç başlamaz. Aynı algoritma Makefile hedeflerinde, Airflow DAG\'lerinde ve paket kurulum sırasında da kullanılır.' },
    { t: 'code', stage: 'Hata avı', kind: 'bug', id: 'kalite-ci-x6', diff: 1, q: '<p><b>Hatayı bul ve düzelt.</b> <code>kapsam_kapisi(calisan, toplam, esik)</code> kapsam yüzdesini bir ondalığa yuvarlayıp <code>(yuzde, gecti)</code> döndürmeli; yüzde eşiğe <b>eşit veya</b> büyükse geçer. Toplam satır 0 ise yüzde 100.0 kabul edilir. Mevcut kod 830/1000 satırda yüzdeyi 0 buluyor, tam eşikte düşürüyor ve boş projede çöküyor.</p>', start: 'def kapsam_kapisi(calisan, toplam, esik):\n    yuzde = calisan // toplam * 100\n    return round(yuzde, 1), yuzde > esik\n', sol: 'def kapsam_kapisi(calisan, toplam, esik):\n    if toplam == 0:\n        return 100.0, True\n    yuzde = round(calisan / toplam * 100, 1)\n    return yuzde, yuzde >= esik\n', tests: 'assert kapsam_kapisi(830, 1000, 80) == (83.0, True), "830/1000 = %83.0, eşik 80 geçer"\nassert kapsam_kapisi(800, 1000, 80) == (80.0, True), "tam eşikte geçmeli (>=)"\nassert kapsam_kapisi(2, 3, 70) == (66.7, False), "2/3 = %66.7"\nassert kapsam_kapisi(0, 0, 80) == (100.0, True), "boş projede ZeroDivisionError yerine 100.0"\n', hints: ['// tam sayı bölmesidir: 830 // 1000 = 0.', 'Eşik karşılaştırmasında "eşit veya büyük" isteniyor.', 'toplam == 0 durumunu bölmeden önce ele al.'], why: 'Üç klasik hata bir arada: tam sayı bölmesi, sınır koşulunda > / >= karışıklığı ve sıfıra bölme. pytest-cov\'un --cov-fail-under seçeneği de eşitliği geçer sayar.' },
    { t: 'code', stage: 'Hata avı', kind: 'bug', id: 'kalite-ci-x7', diff: 2, q: '<p><b>Hatayı bul ve düzelt.</b> pre-commit benzeri bir betik, yalnız <code>src/</code> ya da <code>tests/</code> altındaki <b>silinmemiş</b> <code>.py</code> dosyalarını lint\'e göndermeli. <code>degisenler</code> listesi <code>(durum, yol)</code> demetlerinden oluşur; durum <code>"A"</code> eklendi, <code>"M"</code> değişti, <code>"D"</code> silindi. Mevcut kod <code>docs/happy.txt</code>, <code>resources/src_logo.png</code> ve silinmiş dosyaları da seçiyor. Sonuç sıralı olmalı.</p>', start: 'def lint_hedefleri(degisenler):\n    sonuc = []\n    for durum, yol in degisenler:\n        if "py" in yol and ("src" in yol or "tests" in yol):\n            sonuc.append(yol)\n    return sorted(sonuc)\n', sol: 'def lint_hedefleri(degisenler):\n    sonuc = []\n    for durum, yol in degisenler:\n        if durum == "D":\n            continue\n        if yol.endswith(".py") and yol.startswith(("src/", "tests/")):\n            sonuc.append(yol)\n    return sorted(sonuc)\n', tests: 'd = [("M", "src/anadolu/skor.py"), ("A", "tests/test_skor.py"), ("D", "src/anadolu/eski.py"),\n     ("M", "docs/happy.txt"), ("A", "resources/src_logo.png"), ("M", "scripts/tests_helper.py"),\n     ("M", "src/anadolu/py.typed")]\nr = lint_hedefleri(d)\nassert r == ["src/anadolu/skor.py", "tests/test_skor.py"], f"yalnız src/ ve tests/ altındaki, silinmemiş .py dosyaları seçilmeli; gelen: {r}"\n', hints: ['"py" in yol, yolun herhangi bir yerinde "py" geçmesini yakalar (happy, py.typed).', 'Uzantı için endswith(".py"), klasör için startswith(("src/", "tests/")).', 'Silinmiş dosya diskte yoktur; linter\'a verirsen hata alırsın.'], why: 'Alt dize (in) kontrolü yol eşleştirmede neredeyse her zaman yanlıştır. Gerçek araçlar glob desenleri (fnmatch, pathlib.PurePath.match) kullanır; git diff --diff-filter=d ile silinenler zaten dışarıda bırakılır.' },
    { t: 'code', stage: 'Meydan okuma', id: 'kalite-ci-x8', diff: 3, q: '<p>ruff çıktısını CI özeti için ayrıştır. <code>ruff_ozet(cikti: str) -&gt; dict</code> yaz. Bulgu satırları <code>yol:satır:sütun: KURAL [*] mesaj</code> biçimindedir; <code>[*]</code> yalnız otomatik düzeltilebilir bulgularda bulunur. Yol Windows sürücü harfi içerebilir (<code>C:\\proje\\app.py:3:1: ...</code>). Diğer satırları (boş satır, <code>Found 3 errors.</code> vb.) yok say. Döndür: <code>{"toplam": int, "duzeltilebilir": int, "kurallar": {kural: adet}, "dosyalar": {yol: adet}, "en_cok": kural ya da None, "cikis_kodu": 0 ya da 1}</code>. <code>en_cok</code> en sık kuraldır; eşitlikte alfabetik olarak küçük olan. <code>kurallar</code> ve <code>dosyalar</code> anahtara göre sıralı sözlükler olsun.</p>', start: 'import re\n\ndef ruff_ozet(cikti):\n    pass\n', sol: 'import re\nfrom collections import Counter\n\nRX = re.compile(r"^(.+):(\\d+):(\\d+): ([A-Z]+\\d+) (\\[\\*\\] )?(.*)$")\n\ndef ruff_ozet(cikti):\n    kurallar, dosyalar = Counter(), Counter()\n    duzeltilebilir = 0\n    for satir in cikti.splitlines():\n        m = RX.match(satir.strip())\n        if not m:\n            continue\n        kurallar[m[4]] += 1\n        dosyalar[m[1]] += 1\n        if m[5]:\n            duzeltilebilir += 1\n    toplam = sum(kurallar.values())\n    en_cok = min(kurallar, key=lambda k: (-kurallar[k], k)) if kurallar else None\n    return {"toplam": toplam, "duzeltilebilir": duzeltilebilir,\n            "kurallar": dict(sorted(kurallar.items())), "dosyalar": dict(sorted(dosyalar.items())),\n            "en_cok": en_cok, "cikis_kodu": 1 if toplam else 0}\n', tests: 'CIKTI = "\\n".join([\n    "src/app.py:1:8: F401 [*] `os` imported but unused",\n    "src/app.py:14:5: E741 Ambiguous variable name: `l`",\n    "C:\\\\proje\\\\araclar.py:3:1: F401 [*] `sys` imported but unused",\n    "tests/test_app.py:9:1: B006 Do not use mutable data structures for argument defaults",\n    "tests/test_app.py:20:1: E741 Ambiguous variable name: `I`",\n    "",\n    "Found 5 errors.",\n    "[*] 2 fixable with the `--fix` option.",\n])\nr = ruff_ozet(CIKTI)\nassert r["toplam"] == 5, f"5 bulgu var, gelen {r[\'toplam\']}"\nassert r["duzeltilebilir"] == 2, "[*] işaretli 2 bulgu"\nassert r["kurallar"] == {"B006": 1, "E741": 2, "F401": 2}, f"kural sayıları: {r[\'kurallar\']}"\nassert list(r["kurallar"]) == ["B006", "E741", "F401"], "kurallar sıralı olmalı"\nassert r["dosyalar"]["C:\\\\proje\\\\araclar.py"] == 1, "sürücü harfli Windows yolu bozulmamalı"\nassert r["dosyalar"]["src/app.py"] == 2 and len(r["dosyalar"]) == 3, "dosya sayıları"\nassert r["en_cok"] == "E741", "eşitlikte alfabetik olarak küçük kural (E741 < F401)"\nassert r["cikis_kodu"] == 1, "bulgu varsa çıkış kodu 1"\nbos = ruff_ozet("All checks passed!")\nassert bos == {"toplam": 0, "duzeltilebilir": 0, "kurallar": {}, "dosyalar": {}, "en_cok": None, "cikis_kodu": 0}, "temiz çıktı"\n', hints: ['Yolun kendisi ":" içerebilir; açgözlü (greedy) .+ grubu son "satır:sütun:" kalıbına kadar her şeyi alır.', 'Sayım için collections.Counter, sıralı sözlük için dict(sorted(c.items())).', 'Eşitlik kuralı: min(kurallar, key=lambda k: (-sayi, k)).'], why: 'CI\'da PR yorumu olarak "5 bulgu, 2\'si --fix ile düzelir, en sık E741" gibi özet yazmak, ham çıktıyı okumaktan çok daha faydalıdır. Windows yolundaki iki nokta, split(":") ile yazılan ayrıştırıcıları bozan klasik kenar durumdur.' }
  ],
  faq: [
    { q: 'tox mu nox mu?', a: 'İkisi de birden fazla Python sürümünde izole ortam kurup komut çalıştırır. tox ayarını ini/toml ile, nox ise düz Python dosyasıyla (noxfile.py) yapar; koşul ve döngü gerektiğinde nox daha esnektir. Yeni projede nox, mevcut tox kurulumu olan projede tox ile devam etmek mantıklıdır.' },
    { q: 'CI çok yavaş; ilk neye bakmalıyım?', a: 'Sırasıyla: pip önbelleği (setup-python cache: pip) açık mı, lint ve test ayrı paralel işlerde mi, matris gereğinden büyük mü (her PR\'da 3 OS × 4 sürüm gerekmez; tam matrisi yalnız main\'de koş), yavaş testler işaretlenip PR\'dan ayrılmış mı, concurrency ile eski koşular iptal ediliyor mu.' },
    { q: 'bandit çok yanlış alarm veriyor; kapatabilir miyim?', a: 'Tamamen kapatma; önce -ll ile yalnız orta ve yüksek önem derecesini göster. Testlerde assert (B101/S101) gibi kategorik yanlış alarmları per-file-ignores ile kapat, tekil durumlarda # nosec B602 ve yanına gerekçe yaz. Böylece gerçek bulgular gürültüde kaybolmaz.' }
  ],
  mistakes: [
    { bad: 'import os, sys, json  # noqa', good: 'import os  # noqa: F401  (yeniden dışa aktarım)', why: 'Çıplak noqa satırdaki tüm uyarıları gizler; ileride eklenen gerçek bir hata da sessizce geçer. Kural kodu ve gerekçe yaz.' },
    { bad: 'subprocess.run(f"git log {dal}", shell=True)', good: 'subprocess.run(["git", "log", dal], check=True)', why: 'shell=True ile kullanıcıdan gelen dal adı "main; rm -rf ~" olabilir (kabuk enjeksiyonu). Liste argüman kabuk kullanmaz; bandit B602 bunu yakalar.' },
    { bad: '# ci.yml\n- run: pip install ruff        # her koşuda en yeni sürüm', good: '# pyproject.toml [project.optional-dependencies]\ndev = ["ruff==0.6.9", "mypy==1.11.2"]\n# ci.yml\n- run: pip install -e ".[dev]"', why: 'Sabitlenmemiş araç sürümü, kod değişmeden CI\'ın bir sabah kırmızıya dönmesine yol açar. Sürümü sabitle, bilinçli yükselt.' }
  ]
});
})(window);
