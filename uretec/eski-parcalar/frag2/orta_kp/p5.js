/* ───────────────────────── 5. git-proje-yapisi ───────────────────────── */
{
  id: 'git-proje-yapisi',
  lv: 'orta',
  mod: 'Kalite ve Proje',
  min: 35,
  title: 'Git ve proje yapısı',
  sum: 'Temel Git akışını (init, add, commit, branch, merge, pull request) kavrar, .gitignore kurallarını fnmatch ile çözümler, src yerleşimli proje ağacı kurar, README yazar, config ve .env ile gizli bilgiyi koddan ayırır ve kod inceleme kültürünü tanırsın.',
  goals: [
    'init, add, commit, branch, merge ve pull request adımlarıyla temel Git akışını anlatabilirim.',
    '.gitignore kurallarını okuyup bir dosya yolunun kurala uyup uymadığını fnmatch ile belirleyebilirim.',
    'src yerleşimli standart bir Python proje ağacını kurabilir ve doğrulayabilirim.',
    'Gizli bilgiyi .env ve os.environ ile koddan ayırabilir, eksik değişkende anlamlı hata verebilirim.',
    'Kod incelemesinde (code review) neye bakılacağını ve nasıl yorum yazılacağını açıklayabilirim.'
  ],
  body: `
<h2>Neden Git?</h2>
<p>Anadolu Bank'ın risk ekibinde üç analist aynı rapor betiğini geliştiriyor. "rapor_v2_son_FINAL.py" dosyaları e-postayla dolaşıyor, kimin hangi satırı değiştirdiği belli değil, dün çalışan sürüm kayboldu. Git, sürüm kontrol sistemi (version control system) olarak bu kaosu bitirir: her değişiklik kim, ne zaman, neden bilgisiyle kaydedilir; herkes aynı anda ayrı dallarda çalışır; istenirse herhangi bir güne geri dönülür. Git öğrenmek Python'dan bağımsız bir beceri ama Python geliştiricisi için şart: işe alım testlerinde ilk sorulan şey GitHub profilindir.</p>
<div class="note"><b>Bu derste Git komutları gösterilir</b>Tarayıcıda Git çalıştıramayız; komutları kendi bilgisayarında dene. Kod alıştırmaları Git ve proje yapısının Python tarafını işler: .gitignore kurallarını eşleştirmek, proje ağacını doğrulamak, ortam değişkeni okumak.</div>

<h2>Temel akış: init, add, commit</h2>
<p>Git üç bölgeyle çalışır: çalışma dizini (dosyaların), hazırlık alanı (staging, "sonraki kayda girecekler") ve depo (repository, kalıcı geçmiş). Günlük döngü şudur:</p>
<div class="steps-list"><ol>
<li><code>git init</code> — klasörü depo yapar (bir kez).</li>
<li>Dosyaları düzenle; <code>git status</code> ile neyin değiştiğini gör.</li>
<li><code>git add src/rapor.py</code> — değişikliği hazırlık alanına koy (<code>git add .</code> hepsini).</li>
<li><code>git commit -m "Şehir raporuna KDV sütunu eklendi"</code> — anlamlı bir mesajla kaydet.</li>
<li><code>git log --oneline</code> — geçmişi gör.</li>
</ol></div>
<p>İyi commit mesajı emir kipinde, kısa ve "ne, neden" sorusuna yanıt verir: "KDV hesabını Decimal'e taşı (float yuvarlama hatası)". "düzeltmeler", "wip", "asdf" gibi mesajlar üç ay sonra hiçbir şey anlatmaz.</p>

<h2>Dal, birleştirme ve pull request</h2>
<p>Dal (branch), ana koda dokunmadan deneme yapmanı sağlar. <code>git switch -c sehir-raporu</code> yeni dal açar; orada commit'lersin; iş bitince <code>git switch main</code> ve <code>git merge sehir-raporu</code> ile birleştirirsin. Ekip çalışmasında birleştirme doğrudan değil, <b>pull request</b> (PR; GitLab'da merge request) üzerinden yapılır: dalını sunucuya <code>git push</code> ile gönderirsin, PR açarsın, ekip arkadaşın inceler, onaylar, sonra main'e birleşir. Aynı satırı iki kişi farklı değiştirdiyse çakışma (conflict) çıkar; Git dosyaya <code>&lt;&lt;&lt;&lt;&lt;&lt;&lt;</code> ve <code>&gt;&gt;&gt;&gt;&gt;&gt;&gt;</code> işaretleri koyar, sen doğru halini seçip yeniden commit'lersin.</p>
<div class="tbl-wrap"><table>
<tr><th>Komut</th><th>Ne yapar</th></tr>
<tr><td>git clone URL</td><td>Uzak depoyu indirir</td></tr>
<tr><td>git switch -c dal-adi</td><td>Yeni dal açıp ona geçer</td></tr>
<tr><td>git pull</td><td>Uzaktaki değişiklikleri alır</td></tr>
<tr><td>git push -u origin dal-adi</td><td>Dalı uzak depoya gönderir</td></tr>
<tr><td>git merge dal-adi</td><td>Dalı bulunduğun dala birleştirir</td></tr>
<tr><td>git diff</td><td>Kaydedilmemiş değişiklikleri gösterir</td></tr>
<tr><td>git restore dosya</td><td>Dosyadaki kaydedilmemiş değişikliği geri alır</td></tr>
<tr><td>git stash</td><td>Yarım işi geçici rafa kaldırır</td></tr>
</table></div>

<h2>.gitignore: neyi depoya koymazsın?</h2>
<p>Sanal ortam, önbellek, gizli anahtar ve büyük veri dosyaları depoya girmez. <code>.gitignore</code> dosyası satır satır desen (pattern) içerir; Git o desenlere uyan dosyaları görmezden gelir. Desenler kabuk joker karakterleriyle yazılır: <code>*</code> herhangi karakter dizisi, <code>?</code> tek karakter, sonda <code>/</code> klasör, başta <code>!</code> istisna. Python tarafında aynı jokerleri <code>fnmatch</code> modülü çözer; CI betiklerinde "bu dosya ignore'da mı" kontrolü böyle yazılır.</p>
<pre class="py">from fnmatch import fnmatch

gitignore = """
# Python
__pycache__/
*.pyc
.venv/
# Gizli bilgi
.env
# Veri ve çıktı
data/*.csv
*.log
!onemli.log
"""

def kurallar(metin: str) -&gt; list[str]:
    return [s.strip() for s in metin.splitlines() if s.strip() and not s.strip().startswith("#")]

def yok_sayilir_mi(yol: str, kurallar: list[str]) -&gt; bool:
    sonuc = False
    for k in kurallar:
        istisna = k.startswith("!")
        desen = k[1:] if istisna else k
        if desen.endswith("/"):
            uydu = yol.startswith(desen) or ("/" + desen) in ("/" + yol)
        else:
            uydu = fnmatch(yol, desen) or fnmatch(yol.rsplit("/", 1)[-1], desen)
        if uydu:
            sonuc = not istisna
    return sonuc

k = kurallar(gitignore)
for yol in ["src/rapor.py", "src/__pycache__/rapor.cpython-312.pyc", ".env", "data/satis.csv", "data/README.md", "hata.log", "onemli.log", ".venv/bin/python"]:
    print(f"{yol:40} {'YOK SAY' if yok_sayilir_mi(yol, k) else 'izle'}")</pre>
<p>Kurallar sırayla uygulanır ve son eşleşen kazanır; bu yüzden <code>!onemli.log</code> satırı <code>*.log</code>'dan sonra gelince istisna olur. Gerçek Git'in eşleştirme kuralları biraz daha zengindir (<code>**</code>, kök bağıl yollar) ama bu basit model günlük ihtiyacın yüzde doksanını karşılar.</p>
<div class="warn"><b>Bir kez push edilen gizli bilgi geri alınamaz</b>.env dosyasını yanlışlıkla commit'leyip push ettiysen silmek yetmez: geçmişte kalır. Anahtarı derhal iptal edip yenisini üret. .env satırını .gitignore'a <b>ilk commit'ten önce</b> yaz.</div>

<h2>Proje yapısı: src yerleşimi</h2>
<p>Küçük bir betik tek dosya olabilir; ama test, bağımlılık ve ekip devreye girince standart bir ağaç gerekir. Python topluluğunun önerdiği <b>src yerleşimi</b> (src layout), paketi <code>src/</code> altına koyar; böylece testler yanlışlıkla kurulmamış yerel kodu değil, kurulmuş paketi test eder.</p>
<pre class="py">import tempfile
from pathlib import Path

AGAC = {
    "README.md": "# Anadolu Rapor\\n\\nŞehir bazlı satış raporu aracı.\\n\\n## Kurulum\\n\\n    pip install -e .\\n",
    ".gitignore": ".venv/\\n__pycache__/\\n.env\\n",
    "pyproject.toml": '[project]\\nname = "anadolu-rapor"\\nversion = "0.1.0"\\n',
    ".env.example": "DB_URL=sqlite:///market.db\\nAPI_KEY=buraya-anahtar\\n",
    "src/anadolu_rapor/__init__.py": "",
    "src/anadolu_rapor/rapor.py": "def sehir_ozeti(satirlar):\\n    return {}\\n",
    "tests/test_rapor.py": "import unittest\\n",
}

with tempfile.TemporaryDirectory() as d:
    kok = Path(d) / "anadolu-rapor"
    for yol, icerik in AGAC.items():
        hedef = kok / yol
        hedef.parent.mkdir(parents=True, exist_ok=True)
        hedef.write_text(icerik, encoding="utf-8")
    for p in sorted(kok.rglob("*")):
        derinlik = len(p.relative_to(kok).parts) - 1
        print("  " * derinlik + ("+ " if p.is_dir() else "- ") + p.name)
    print("README ilk satır:", (kok / "README.md").read_text(encoding="utf-8").splitlines()[0])</pre>
<p>README (benioku) dosyası projenin kapısıdır: ne yapar, nasıl kurulur, nasıl çalıştırılır, nasıl test edilir. Dört başlık yeterlidir. <code>.env.example</code> ise gerçek değerler olmadan hangi ortam değişkenlerinin gerektiğini gösterir; depoya girer, <code>.env</code> girmez.</p>

<h2>Config ve .env: gizli bilgi koddan ayrı</h2>
<p>Veritabanı parolası, API anahtarı, e-posta şifresi kodda yazmaz. Bunlar ortam değişkeni (environment variable) olarak işletim sisteminden okunur: <code>os.environ</code> bir sözlük gibi davranır. Geliştirme makinesinde değişkenleri <code>.env</code> dosyasından yüklersin (python-dotenv paketi ya da birkaç satırlık kendi okuyucun); sunucuda ise dağıtım sistemi onları doğrudan tanımlar. Kod iki ortamda da aynıdır.</p>
<pre class="py">import os

ENV_ORNEK = """
# Anadolu Market yerel ayarlar
DB_URL=sqlite:///market.db
API_KEY="abc-123"
DEBUG=true
"""

def env_yukle(metin: str) -&gt; dict[str, str]:
    degerler = {}
    for satir in metin.splitlines():
        satir = satir.strip()
        if not satir or satir.startswith("#") or "=" not in satir:
            continue
        ad, deger = satir.split("=", 1)
        degerler[ad.strip()] = deger.strip().strip('"').strip("'")
    return degerler

for ad, deger in env_yukle(ENV_ORNEK).items():
    os.environ.setdefault(ad, deger)   # gerçek ortamda zaten varsa ezme

def ayar(ad: str, varsayilan: str | None = None) -&gt; str:
    deger = os.environ.get(ad, varsayilan)
    if deger is None:
        raise RuntimeError(f"Eksik ortam değişkeni: {ad} (.env dosyasını kontrol et)")
    return deger

print("DB_URL :", ayar("DB_URL"))
print("API_KEY:", ayar("API_KEY")[:3] + "***")
print("DEBUG  :", ayar("DEBUG").lower() == "true")
print("PORT   :", ayar("PORT", "8000"))
try:
    ayar("SMTP_SIFRE")
except RuntimeError as e:
    print("hata:", e)</pre>
<p><code>setdefault</code> önemli: sunucuda tanımlı gerçek değer varsa .env'deki değeri yazmaz. Eksik değişkende programın ilk saniyede anlaşılır bir mesajla durması, iki saat sonra "None" hatasıyla çökmesinden iyidir.</p>
<div class="tip"><b>Anahtarı loglama</b>Hata ayıklarken <code>print(os.environ)</code> yazmak tüm gizli bilgileri log dosyasına döker. Değeri göstermen gerekiyorsa ilk üç karakter artı yıldız yeter.</div>

<h2>Kod inceleme kültürü</h2>
<p>Pull request'in asıl değeri kodun ikinci bir göz tarafından okunmasıdır. İnceleyen (reviewer) şunlara bakar: iş kuralı doğru mu, test var mı, isimler anlaşılır mı, gizli bilgi sızmış mı, aynı şey daha basit yazılabilir mi? Yorum yazarken kişiyi değil kodu konuş: "Bu döngü O(n²), sözlükle tek geçişte olur" iyi; "Bunu nasıl böyle yazarsın" kötü. Yazar olarak ise PR'ı küçük tut (bir PR bir iş), açıklamaya "neden"i yaz ve yorumları savunma değil öğrenme fırsatı olarak gör. İncelemeyi bekletmemek de nezakettir: küçük PR aynı gün incelenir.</p>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Dal stratejisi ve otomasyon</h3>
<p>Ekipler büyüdükçe dal düzeni kural haline gelir. En yaygın model "GitHub flow": <code>main</code> her zaman çalışır durumdadır; her iş kısa ömürlü bir dalda yapılır (<code>feature/sehir-raporu</code>, <code>fix/kdv-yuvarlama</code>); PR ile birleşir; birleşince dal silinir. Daha katı kurumlarda (bankacılık gibi) <code>develop</code> ve <code>release</code> dalları da olur. Hangi modeli kullanırsan kullan, kural aynı: main'e doğrudan push yok, her değişiklik incelenir.</p>
<p>Otomasyon bunu destekler. Pre-commit kancaları (hook) commit'ten önce biçimlendiriciyi (ruff, black) ve basit kontrolleri çalıştırır; böylece inceleme, girinti ve boşluk tartışmasına harcanmaz. CI (GitHub Actions, GitLab CI) her PR'da testleri koşar ve kırmızıysa birleştirmeyi engeller. Commit mesajlarında "Conventional Commits" düzeni (<code>feat:</code>, <code>fix:</code>, <code>docs:</code>) değişiklik günlüğünü otomatik üretmeyi sağlar. İleri seviyedeki "Kalite ve CI" dersinde bu zinciri uçtan uca kuracaksın; bugün için hedefin küçük: anlamlı commit, temiz .gitignore, gizli bilgi .env'de.</p>
</section>
`,
  ex: [
    { t: 'mc', q: 'Yeni bir özellik üzerinde çalışırken ana kodu bozmamak için ilk yapılacak şey hangisidir?',
      o: ['git commit -m "wip"', 'git switch -c ozellik-adi', 'git stash', 'git push origin main'],
      a: 1,
      why: 'Yeni dal açmak (switch -c) işi ana koddan izole eder. stash yarım işi geçici kaldırır, wip commit geçmişi kirletir, main\'e push ise tam da kaçınılması gereken şeydir.' },

    { t: 'code', id: 'git-proje-yapisi-1',
      q: '<p><code>yok_sayilir_mi(yol, kurallar)</code> fonksiyonunu yaz. <code>kurallar</code> .gitignore satırlarının listesidir (yorum ve boş satırlar temizlenmiş gelir). Kural türleri: (1) sonu <code>/</code> ile bitenler klasör kuralıdır: yol o klasörle başlıyorsa ya da yolun içinde <code>/klasor/</code> geçiyorsa uyar; (2) diğerleri <code>fnmatch</code> ile tam yola <b>veya</b> dosya adına (son parça) uygulanır; (3) <code>!</code> ile başlayan kural istisnadır. Kurallar sırayla değerlendirilir, <b>son eşleşen</b> kazanır. Bool döndür.</p>',
      start: 'from fnmatch import fnmatch\n\ndef yok_sayilir_mi(yol, kurallar):\n    pass\n',
      sol: 'from fnmatch import fnmatch\n\ndef yok_sayilir_mi(yol, kurallar):\n    sonuc = False\n    for k in kurallar:\n        istisna = k.startswith("!")\n        desen = k[1:] if istisna else k\n        if desen.endswith("/"):\n            uydu = yol.startswith(desen) or ("/" + desen) in ("/" + yol)\n        else:\n            uydu = fnmatch(yol, desen) or fnmatch(yol.rsplit("/", 1)[-1], desen)\n        if uydu:\n            sonuc = not istisna\n    return sonuc\n',
      tests: 'k = ["__pycache__/", "*.pyc", ".venv/", ".env", "data/*.csv", "*.log", "!onemli.log"]\nassert yok_sayilir_mi("src/rapor.py", k) is False, "src/rapor.py izlenmeli"\nassert yok_sayilir_mi("src/__pycache__/rapor.cpython-312.pyc", k) is True, "__pycache__ içindeki dosya yok sayılmalı"\nassert yok_sayilir_mi(".env", k) is True, ".env yok sayılmalı"\nassert yok_sayilir_mi("config/.env", k) is True, "Dosya adı eşleşmesi: config/.env de yok sayılmalı"\nassert yok_sayilir_mi("data/satis.csv", k) is True, "data/*.csv yok sayılmalı"\nassert yok_sayilir_mi("data/README.md", k) is False, "data/README.md izlenmeli"\nassert yok_sayilir_mi("hata.log", k) is True, "*.log yok sayılmalı"\nassert yok_sayilir_mi("onemli.log", k) is False, "!onemli.log istisnası sonra geldiği için izlenmeli"\nassert yok_sayilir_mi(".venv/bin/python", k) is True, ".venv/ klasör kuralı"\nassert yok_sayilir_mi("hata.log", ["!*.log", "*.log"]) is True, "Son eşleşen kazanmalı"\n',
      hints: ['Her kural için önce ! kontrolü yap, deseni ayır.', 'fnmatch(yol, desen) or fnmatch(yol.rsplit("/", 1)[-1], desen); sonuç = not istisna.'],
      why: 'Son eşleşen kazandığı için döngü tüm kuralları gezer ve her eşleşmede sonucu günceller; istisna kuralı eşleşince sonucu False\'a çeker.' },

    { t: 'code', id: 'git-proje-yapisi-2',
      q: '<p><code>proje_dogrula(kok)</code> fonksiyonunu yaz. <code>kok</code> bir <code>Path</code>\'tir. Şu yolları kontrol et ve <b>eksik</b> olanların listesini (kök bağıl, <code>/</code> ayırıcılı metin) döndür: <code>README.md</code>, <code>pyproject.toml</code>, <code>.gitignore</code>, <code>src/</code> (klasör), <code>tests/</code> (klasör). Ayrıca <code>.gitignore</code> varsa içinde <code>.env</code> satırı yoksa listeye <code>".gitignore:.env"</code> ekle. Hepsi tamamsa boş liste döndür.</p>',
      start: 'from pathlib import Path\n\ndef proje_dogrula(kok):\n    pass\n',
      sol: 'from pathlib import Path\n\ndef proje_dogrula(kok):\n    eksik = []\n    for ad in ("README.md", "pyproject.toml", ".gitignore"):\n        if not (kok / ad).is_file():\n            eksik.append(ad)\n    for ad in ("src", "tests"):\n        if not (kok / ad).is_dir():\n            eksik.append(ad + "/")\n    gi = kok / ".gitignore"\n    if gi.is_file():\n        satirlar = [s.strip() for s in gi.read_text(encoding="utf-8").splitlines()]\n        if ".env" not in satirlar:\n            eksik.append(".gitignore:.env")\n    return eksik\n',
      tests: 'import tempfile\nfrom pathlib import Path\nwith tempfile.TemporaryDirectory() as d:\n    kok = Path(d)\n    assert sorted(proje_dogrula(kok)) == sorted(["README.md", "pyproject.toml", ".gitignore", "src/", "tests/"]), "Boş klasörde 5 eksik olmalı"\n    (kok / "README.md").write_text("# x", encoding="utf-8")\n    (kok / "pyproject.toml").write_text("[project]", encoding="utf-8")\n    (kok / ".gitignore").write_text(".venv/\\n__pycache__/\\n", encoding="utf-8")\n    (kok / "src").mkdir()\n    (kok / "tests").mkdir()\n    assert proje_dogrula(kok) == [".gitignore:.env"], ".env satırı eksikse .gitignore:.env dönmeli"\n    (kok / ".gitignore").write_text(".venv/\\n.env\\n", encoding="utf-8")\n    assert proje_dogrula(kok) == [], "Tam projede boş liste"\n    (kok / "tests").rmdir()\n    (kok / "tests").write_text("dosya", encoding="utf-8")\n    assert proje_dogrula(kok) == ["tests/"], "tests bir dosyaysa klasör eksik sayılmalı"\n',
      hints: ['(kok / ad).is_file() ve (kok / ad).is_dir() ile kontrol et.', '.gitignore satırlarını strip edip ".env" var mı diye bak.'],
      why: 'is_file ve is_dir ayrımı, aynı adda yanlış türde bir şey varsa (klasör yerine dosya) eksik saymayı sağlar; .gitignore içeriği satır bazında okunur.' },

    { t: 'code', id: 'git-proje-yapisi-3',
      q: '<p>İki fonksiyon yaz. <code>env_yukle(metin)</code>: .env içeriğini okuyup <code>{AD: deger}</code> sözlüğü döndürsün; boş satır ve <code>#</code> yorumlarını atlasın, ilk <code>=</code> işaretinden bölsün, değerin başındaki/sonundaki tek ya da çift tırnağı kaldırsın. <code>ayar(ad, varsayilan=None)</code>: <code>os.environ</code>\'dan okusun; değer yoksa ve varsayılan None ise <code>RuntimeError</code> fırlatsın (mesajda değişken adı geçsin), aksi halde değeri döndürsün.</p>',
      start: 'import os\n\ndef env_yukle(metin):\n    pass\n\ndef ayar(ad, varsayilan=None):\n    pass\n',
      sol: 'import os\n\ndef env_yukle(metin):\n    degerler = {}\n    for satir in metin.splitlines():\n        satir = satir.strip()\n        if not satir or satir.startswith("#") or "=" not in satir:\n            continue\n        ad, deger = satir.split("=", 1)\n        degerler[ad.strip()] = deger.strip().strip(\'"\').strip("\'")\n    return degerler\n\ndef ayar(ad, varsayilan=None):\n    deger = os.environ.get(ad, varsayilan)\n    if deger is None:\n        raise RuntimeError(f"Eksik ortam değişkeni: {ad}")\n    return deger\n',
      tests: 'import os\nmetin = "# yerel\\nDB_URL=sqlite:///market.db\\nAPI_KEY=\\"abc-123\\"\\nSIFRE=\'gizli=1\'\\n\\nDEBUG = true\\n"\nd = env_yukle(metin)\nassert d == {"DB_URL": "sqlite:///market.db", "API_KEY": "abc-123", "SIFRE": "gizli=1", "DEBUG": "true"}, "Sözlük beklenen gibi olmalı (tırnaklar kalkmalı, ilk = ile bölünmeli)"\nos.environ["PP_TEST_X"] = "42"\nassert ayar("PP_TEST_X") == "42", "Ortamdaki değer dönmeli"\nassert ayar("PP_TEST_YOK_123", "8000") == "8000", "Yoksa varsayılan dönmeli"\ntry:\n    ayar("PP_TEST_YOK_123")\n    assert False, "Eksik değişkende RuntimeError fırlatılmalı"\nexcept RuntimeError as e:\n    assert "PP_TEST_YOK_123" in str(e), "Hata mesajında değişken adı geçmeli"\ndel os.environ["PP_TEST_X"]\n',
      hints: ['split("=", 1) ilk eşittir işaretinden böler; değerde = varsa korunur.', 'os.environ.get(ad, varsayilan) None dönerse raise RuntimeError(f"... {ad}")'],
      why: 'split("=", 1) değer içindeki eşittiri korur; strip zinciri tırnakları temizler. ayar fonksiyonu eksik yapılandırmayı ilk anda anlaşılır biçimde bildirir.' },

    { t: 'mc', q: 'Bir ekip arkadaşın yanlışlıkla <code>.env</code> dosyasını commit edip push etti ve sonra sildi. Şimdi ne yapılmalı?',
      o: ['Hiçbir şey; dosya silindiği için geçmişte de kalmaz, sorun yok', '.env\'i .gitignore\'a eklemek yeterli, geçmişteki kopya zararsızdır', 'Anahtarları derhal iptal edip yenilemek, .gitignore\'a eklemek', 'Yerel depoyu silip uzak depodan yeniden klonlamak'],
      a: 2,
      why: 'Push edilen içerik Git geçmişinde ve uzak sunucuda kalır; silmek geçmişi temizlemez. Sızan anahtar artık sızmış sayılır ve iptal edilir. .gitignore tekrarını önler ama olanı geri almaz.' },

    { t: 'code', id: 'git-proje-yapisi-4',
      q: '<p><code>commit_mesaji_gecerli(mesaj)</code> fonksiyonunu yaz. Ekip kuralı: mesaj <code>feat:</code>, <code>fix:</code>, <code>docs:</code>, <code>test:</code> ya da <code>refactor:</code> ile başlamalı; iki noktadan sonra bir boşluk ve en az 10 karakterlik açıklama gelmeli; ilk satır en fazla 72 karakter olmalı. Yalnızca ilk satır değerlendirilir. Bool döndür.</p>',
      start: 'def commit_mesaji_gecerli(mesaj):\n    pass\n',
      sol: 'ONEKLER = ("feat", "fix", "docs", "test", "refactor")\n\ndef commit_mesaji_gecerli(mesaj):\n    ilk = mesaj.splitlines()[0] if mesaj else ""\n    if len(ilk) > 72 or ":" not in ilk:\n        return False\n    onek, _, aciklama = ilk.partition(":")\n    if onek not in ONEKLER:\n        return False\n    if not aciklama.startswith(" "):\n        return False\n    return len(aciklama.strip()) >= 10\n',
      tests: 'assert commit_mesaji_gecerli("feat: şehir raporuna KDV sütunu eklendi") is True, "Geçerli feat mesajı"\nassert commit_mesaji_gecerli("fix: KDV hesabını Decimal\'e taşı\\n\\nfloat yuvarlama hatası vardı") is True, "Çok satırlı mesajda yalnızca ilk satır değerlendirilir"\nassert commit_mesaji_gecerli("düzeltmeler") is False, "Önek yoksa geçersiz"\nassert commit_mesaji_gecerli("feat:boşluksuz açıklama burada") is False, "İki noktadan sonra boşluk şart"\nassert commit_mesaji_gecerli("fix: kısa") is False, "Açıklama en az 10 karakter"\nassert commit_mesaji_gecerli("chore: bağımlılıkları güncelle") is False, "chore izin verilen önek değil"\nassert commit_mesaji_gecerli("docs: " + "a" * 70) is False, "72 karakteri aşan ilk satır geçersiz"\nassert commit_mesaji_gecerli("") is False, "Boş mesaj geçersiz"\n',
      hints: ['splitlines()[0] ile ilk satırı al; partition(":") ile öneki ayır.', 'Açıklama " " ile başlamalı ve strip sonrası uzunluğu >= 10 olmalı.'],
      why: 'partition ilk iki noktadan böler; önek kümeye bakılır, açıklamanın boşlukla başlaması ve uzunluğu ayrı ayrı denetlenir. Bu tür bir kontrol pre-commit kancası olarak çalıştırılır.' },

    { t: 'mc', q: 'Kod incelemesinde (code review) aşağıdaki yorumlardan hangisi iyi örnektir?',
      o: ['Bu nasıl çalışıyor hiç anlamadım, lütfen baştan yaz, böyle olmaz.', 'İç içe döngü O(n²); şehir sözlüğüyle tek geçişte olur, örnek yazayım mı?', 'Bence olmuş, hiçbir şeye bakmadım ama onaylıyorum, birleştirelim.', 'Girintiler 2 boşluk olmalıydı, ekipte herkes öyle yazıyor, düzelt.'],
      a: 1,
      why: 'İyi yorum kodu konuşur, somut sorun ve çözüm önerir, yardım teklif eder. "Baştan yaz" kişiselleştirir ve yol göstermez; girinti tartışması biçimlendiriciye bırakılır; içeriksiz onay inceleme sayılmaz.' },

    { t: 'mc', q: 'src yerleşiminin (src layout) temel avantajı nedir?',
      o: ['Daha az klasör gerektirdiği için proje ağacı sade kalır', 'Testler kurulu paketi test eder, yerel kodu değil', 'pip install gerekmeden paket doğrudan içe aktarılır', 'Aynı dosyada çalışan ekip üyeleri arasında Git çakışmalarını azaltır'],
      a: 1,
      why: 'Paket src/ altında olunca proje kökünden çalışan testler onu doğrudan içe aktaramaz; pip install -e . ile kurulu paket kullanılır. Böylece "bende çalışıyor, kurulumda bozuk" hataları yakalanır.' }
  ],
  faq: [
    { q: 'Git ile GitHub aynı şey mi?', a: 'Hayır. Git bilgisayarında çalışan sürüm kontrol aracıdır; GitHub (ve GitLab, Bitbucket) Git depolarını barındıran, pull request ve inceleme arayüzü sunan web hizmetidir. Git olmadan GitHub olmaz, ama GitHub olmadan Git olur.' },
    { q: 'Ne sıklıkla commit yapmalıyım?', a: 'Çalışan her mantıksal adımda: bir fonksiyon, bir test, bir düzeltme. Günde birkaç küçük commit, haftada bir dev commit\'ten iyidir; geri almak ve incelemek kolaylaşır.' },
    { q: '.env dosyasını Python nasıl okur?', a: 'Standart kütüphanede hazır okuyucu yok; derste yazdığımız birkaç satır ya da python-dotenv paketi (load_dotenv) kullanılır. Sunucuda .env yerine dağıtım aracı değişkenleri doğrudan tanımlar; kod os.environ üzerinden aynı şekilde okur.' },
    { q: 'Tek kişilik projede dal ve PR gerekli mi?', a: 'Zorunlu değil ama alışkanlık değerli: dal açıp birleştirmek main\'i her zaman çalışır tutar ve iş başvurusunda GitHub geçmişin düzenli görünür.' }
  ],
  mistakes: [
    { bad: 'API_KEY = "sk-abc123..."  # kodun içinde', good: 'API_KEY = os.environ["API_KEY"]', why: 'Kodda yazılan gizli bilgi depoya girer ve herkesin eline geçer; ortam değişkeni koddan ayrı yaşar.' },
    { bad: 'git add .\ngit commit -m "düzeltmeler"', good: 'git add src/rapor.py\ngit commit -m "fix: KDV hesabını Decimal\'e taşı"', why: 'Anlamsız mesaj geçmişi işe yaramaz kılar; add . ise istemediğin dosyaları (.env, veri) da ekleyebilir.' },
    { bad: 'print(os.environ)  # hata ayıklama', good: 'print(ayar("API_KEY")[:3] + "***")', why: 'Tüm ortamı yazdırmak gizli bilgileri log dosyasına döker. Yalnızca gerekli değeri, maskeleyerek göster.' },
    { bad: '# .gitignore\n*.py', good: '# .gitignore\n__pycache__/\n*.pyc\n.venv/\n.env', why: 'Kaynak kodu yok saymak projeyi boş bırakır; yok sayılan şey türetilmiş, makineye özgü ve gizli dosyalardır.' }
  ]
},
