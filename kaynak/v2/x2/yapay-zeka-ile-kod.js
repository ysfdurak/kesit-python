/* Kesit Python — 'yapay-zeka-ile-kod' dersi uzantısı: ajanlı kodlama iş akışı, kurallar dosyası, MCP, ajan PR inceleme kontrol listesi (AUDIT Ekle-10) */
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
  { id: 'yapay-zeka-ile-kod',
    min: 25,
    html: `<h2>Derinleş: ajanlı kodlama iş akışı</h2><p>Sohbet asistanı sana kod parçası verir; <b>kodlama ajanı</b> (coding agent) ise depoyu okur, dosyaları düzenler, testleri ve komutları çalıştırır, çıktıya bakıp kendini düzeltir. Claude Code (terminal ve IDE), Cursor'ın ajan modu ve GitHub'daki ajanlar bu sınıftadır. Güç arttıkça senin rolün "kodu yazan"dan <b>görevi tanımlayan, sınırları çizen ve sonucu inceleyen</b> kişiye kayar. Bu bölüm o rolü anlatıyor.</p><h3>Döngü: keşfet → planla → uygula → doğrula</h3><div class="steps-list"><ol><li><b>Keşfet:</b> Ajandan önce kodu okumasını iste ("ilgili dosyaları bul, henüz değiştirme"). Yanlış varsayımlar en ucuz bu aşamada yakalanır.</li><li><b>Planla:</b> Değişikliği adımlara bölmesini ve planı sana göstermesini iste. Planı onayla ya da düzelt.</li><li><b>Uygula:</b> Küçük adımlarla; her adım ayrı commit. Büyük tek seferlik değişiklik incelenemez.</li><li><b>Doğrula:</b> Testler, linter, tip denetimi ajanın kendi çalıştırabileceği komutlar olmalı. "Bitti" demesi değil, testlerin yeşil olması ölçüttür.</li></ol></div><p>İyi görev tanımı bir iş biletine benzer: amaç, kapsam (hangi dosyalar/modüller), kapsam dışı, kabul ölçütleri (hangi testler geçmeli), kısıtlar (yeni bağımlılık yok, genel API değişmez). Büyük işi bağımsız alt görevlere böl: "CSV içe aktarmayı yeniden yaz" yerine önce "mevcut davranışı belgeleyen testleri yaz", sonra "ayrıştırıcıyı ayır", sonra "hata raporlamayı ekle".</p><pre class="py">gorevler = {
    "testleri_yaz": [],
    "ayristiriciyi_ayir": ["testleri_yaz"],
    "hata_raporu": ["ayristiriciyi_ayir"],
    "belgeleri_guncelle": ["ayristiriciyi_ayir"],
}
from graphlib import TopologicalSorter
print(list(TopologicalSorter(gorevler).static_order()))</pre><h3>Kurallar dosyası: projenin hafızası</h3><p>Ajan her oturuma sıfır bağlamla başlar. Projenin kökündeki kurallar dosyası (Claude Code için <code>CLAUDE.md</code>, Cursor için <code>.cursor/rules</code>, birçok araç için <code>AGENTS.md</code>) her oturumda otomatik okunur. İçine yalnız <b>kalıcı ve doğrulanabilir</b> bilgi koy: nasıl kurulur, nasıl test edilir, kod stili, dokunulmayacak yerler. Uzun ve belirsiz dosya ("temiz kod yaz") işe yaramaz; kısa ve komut odaklı olsun.</p><pre class="code"># CLAUDE.md — Anadolu Market sipariş servisi

## Komutlar
- Kurulum: uv sync
- Test: uv run pytest -q   (her değişiklikten sonra çalıştır)
- Lint/biçim: uv run ruff check . &amp;&amp; uv run ruff format --check .

## Kurallar
- Python 3.12, tip ipuçları zorunlu; para tutarları Decimal.
- Yeni bağımlılık eklemeden önce sor.
- migrations/ ve config/prod.yaml dosyalarını DEĞİŞTİRME.
- Veritabanı sorgularında f-string YOK; parametre kullan.

## Mimari
- api/ (FastAPI uç noktaları) → servis/ (iş kuralları) → depo/ (SQL). Katman atlama yok.</pre><h3>MCP ile araç bağlamak</h3><p><b>Model Context Protocol</b> (MCP), ajanın dış araçlara (veritabanı, hata takip sistemi, belge deposu, tarayıcı) standart bir arayüzle bağlanmasını sağlar. Bir MCP sunucusu araçlarını adı, açıklaması ve JSON şemalı girdileriyle ilan eder; ajan gerektiğinde çağırır. LLM API dersindeki araç çağırma döngüsünün standartlaşmış hâlidir. Güvenlik kuralı: ajana yalnız gereken araçları ve en az yetkiyi ver (salt okunur veritabanı kullanıcısı, test ortamı anahtarı). Araçtan gelen metin de güvenilmeyen girdidir; istem enjeksiyonu taşıyabilir.</p><pre class="code">// .mcp.json (proje kökü) — örnek yapı
{
  "mcpServers": {
    "market-db": {
      "command": "uvx",
      "args": ["mcp-server-sqlite", "--db-path", "./yerel_kopya.db"]
    }
  }
}</pre><h3>Ajan çıktısını PR olarak incelemek</h3><p>Ajanın değişikliği bir dal (branch) ve çekme isteği (pull request) olarak gelmeli; ana dala doğrudan yazmamalı. İncelerken bir insanın kodunu incelerken baktığın her şeye ek olarak ajanlara özgü risklere bak:</p><div class="tbl-wrap"><table><tr><th>Kontrol</th><th>Neden?</th></tr><tr><td>Diff kapsamı görevle uyumlu mu? İlgisiz dosya değişmiş mi?</td><td>Ajanlar "bu arada" düzeltmeler yapar; incelenmemiş değişiklik riski.</td></tr><tr><td>Testler silinmiş, atlanmış (<code>skip</code>) ya da beklenen değer kodu tutacak şekilde değiştirilmiş mi?</td><td>Testi geçirmenin en kolay yolu testi bozmaktır.</td></tr><tr><td>Yeni bağımlılık var mı? Paket gerçekten var mı, adı doğru mu?</td><td>Uydurma ya da adı benzeyen kötü niyetli paketler (typosquatting).</td></tr><tr><td>Sır, anahtar, kişisel veri eklenmiş mi?</td><td>Ajan log ya da örnek veriyi koda gömebilir.</td></tr><tr><td>Hata yutma: çıplak <code>except</code>, <code>pass</code>, sessiz <code>None</code></td><td>Çalışıyor gibi görünür, hatayı gizler.</td></tr><tr><td>CI yeşil mi ve sen de yerelde çalıştırdın mı?</td><td>"Testler geçti" cümlesi kanıt değildir.</td></tr></table></div><div class="warn"><b>İzinler</b>Ajana komut çalıştırma izni verirken izin listesini dar tut (test, lint, git diff). <code>rm -rf</code>, üretim veritabanı, <code>git push --force</code>, dağıtım komutları insan onayı istemeli. Mümkünse ajanı konteyner ya da ayrı bir çalışma ağacında (git worktree) çalıştır.</div><div class="note"><b>Gerçek işte</b>Ekipler ajanları en çok iyi tanımlı işlerde verimli buluyor: test yazma, bağımlılık güncelleme, tip ipucu ekleme, küçük hata düzeltmeleri, belge. Mimari kararlar ve belirsiz gereksinimler hâlâ insanın işi. Mülakatlarda "yapay zekâ araçlarını nasıl kullanıyorsun?" sorusuna iyi cevap, aracın adını değil doğrulama alışkanlığını anlatır: kurallar dosyası, küçük PR, test kanıtı, inceleme listesi.</div>`,
    ex: [
      { t: 'mc',
        stage: 'Isınma',
        q: 'Kodlama ajanından büyük bir yeniden düzenleme (refactor) isteyeceksin. İlk adım olarak en verimli istek hangisi?',
        o: ['"Tüm modülü baştan, en iyi uygulamalarla yeniden yaz ve bitince bana haber ver."', '"İlgili dosyaları oku, mevcut davranışı özetle ve adım adım plan öner; henüz kod değiştirme."', '"Testleri sonra yazarız; önce kodun tamamını tek seferde güncelle ki zaman kazanalım."', '"Ne yapacağına sen karar ver; değişiklikleri doğrudan ana dala gönderebilirsin."'],
        a: 1,
        why: 'Keşif ve plan aşaması yanlış varsayımları kod yazılmadan yakalar. Tek seferlik büyük değişiklik incelenemez; ana dala doğrudan yazma ise inceleme adımını ortadan kaldırır.' },
      { t: 'mc',
        stage: 'Isınma',
        q: 'Proje kurallar dosyasına (CLAUDE.md / AGENTS.md) hangisini yazmak EN AZ faydalıdır?',
        o: ['Testleri çalıştırma komutu: uv run pytest -q', '"migrations/ klasörünü değiştirme" gibi dokunulmayacak yerler', '"Her zaman temiz, okunabilir ve kaliteli kod yaz."', 'Para tutarları için Decimal kullanılması kuralı'],
        a: 2,
        why: 'Kurallar dosyası somut ve doğrulanabilir bilgi içermeli. "Temiz kod yaz" ajanın zaten varsayılan hedefidir; davranışı değiştirmez, yalnız bağlamı doldurur.' },
      { t: 'predict',
        stage: 'Kodu oku',
        q: 'Ajan PR\'ındaki değişen dosyaları kapsam listesiyle karşılaştıran kod. Ne yazdırır?',
        code: 'from fnmatch import fnmatch\nizinli = ["servis/*.py", "tests/test_*.py"]\ndegisen = ["servis/sepet.py", "tests/test_sepet.py", "config/prod.yaml", "servis/alt/vergi.py"]\ndisari = [f for f in degisen if not any(fnmatch(f, d) for d in izinli)]\nprint(disari)\n',
        o: ['[\'config/prod.yaml\']', '[\'config/prod.yaml\', \'servis/alt/vergi.py\']', '[]', '[\'servis/alt/vergi.py\']'],
        a: 0,
        why: 'fnmatch\'te * eğik çizgi dahil her karakterle eşleşir; bu yüzden "servis/*.py" alt klasördeki vergi.py\'yi de kapsar. Kapsam dışı tek dosya config/prod.yaml\'dır. Klasör sınırı istiyorsan pathlib.PurePath.match ya da ayrı kontrol gerekir.' },
      { t: 'code',
        id: 'yapay-zeka-ile-kod-w1',
        stage: 'Rehberli',
        diff: 2,
        q: '<p>Ajan PR\'ının diff metninden değişen dosyaları çıkar: <code>degisen_dosyalar(diff)</code> <code>diff --git a/X b/X</code> satırlarındaki <code>b/</code> yolunu sırayla (tekrarsız) liste olarak döndürsün. Sonra <code>kapsam_disi(diff, izinli_onekler)</code> yaz: yolu verilen öneklerin hiçbiriyle başlamayan dosyaları döndürsün.</p>',
        guide: ['Diff\'i satırlara böl.', '"diff --git " ile başlayan satırlarda son parçayı al ve "b/" önekini at.', 'Tekrarı önlemek için görülen yolları takip et.', 'kapsam_disi için str.startswith\'e önek demeti ver.'],
        example: 'satir = "diff --git a/x.py b/x.py"\nprint(satir.split()[-1][2:])\n',
        start: 'def degisen_dosyalar(diff):\n    # TODO\n    return []\n\ndef kapsam_disi(diff, izinli_onekler):\n    # TODO\n    return []\n',
        sol: 'def degisen_dosyalar(diff):\n    yollar = []\n    for satir in diff.splitlines():\n        if satir.startswith("diff --git "):\n            yol = satir.split()[-1]\n            if yol.startswith("b/"):\n                yol = yol[2:]\n            if yol not in yollar:\n                yollar.append(yol)\n    return yollar\n\ndef kapsam_disi(diff, izinli_onekler):\n    return [y for y in degisen_dosyalar(diff) if not y.startswith(tuple(izinli_onekler))]\n',
        tests: 'DIFF = \'diff --git a/servis/sepet.py b/servis/sepet.py\\n@@ -10,3 +10,4 @@\\n+import requests\\n def toplam(kalemler):\\n-    return sum(k.fiyat * k.adet for k in kalemler)\\n+    return round(sum(k.fiyat * k.adet for k in kalemler), 2)\\ndiff --git a/tests/test_sepet.py b/tests/test_sepet.py\\n@@ -5,4 +5,4 @@\\n-def test_toplam():\\n+@pytest.mark.skip\\n+def test_toplam():\\ndiff --git a/config/prod.yaml b/config/prod.yaml\\n@@ -1,1 +1,1 @@\\n-debug: false\\n+debug: true\\n\'\nassert degisen_dosyalar(DIFF) == ["servis/sepet.py", "tests/test_sepet.py", "config/prod.yaml"], f"Gelen {degisen_dosyalar(DIFF)}"\nassert kapsam_disi(DIFF, ["servis/", "tests/"]) == ["config/prod.yaml"], "prod ayarı kapsam dışı"\nassert kapsam_disi(DIFF, ["servis/", "tests/", "config/"]) == []\nassert degisen_dosyalar("") == []\n',
        hints: ['satir.split()[-1] "b/servis/sepet.py" verir.', 'startswith bir demet alabilir: y.startswith(("a/", "b/")).'],
        why: 'İncelemenin ilk sorusu "değişiklik görevle sınırlı mı?" sorusudur. Bunu otomatikleştirmek, ajanın ilgisiz dosyalara dokunduğunu insan diff\'i okumadan önce yakalar.' },
      { t: 'code',
        id: 'yapay-zeka-ile-kod-w2',
        stage: 'Rehberli',
        diff: 2,
        q: '<p>PR inceleme kontrol listesinin otomatik kısmı: <code>riskler(diff)</code> yalnız <b>eklenen</b> satırlara (<code>+</code> ile başlayan, <code>+++</code> hariç) bakarak şu risk etiketlerini, ilk görüldükleri sırayla ve tekrarsız liste olarak döndürsün:</p><ul><li><code>"test-atlama"</code>: satırda <code>pytest.mark.skip</code> ya da <code>@unittest.skip</code></li><li><code>"yeni-bagimlilik"</code>: satır (önek <code>+</code> atıldıktan sonra) <code>import </code> ya da <code>from </code> ile başlıyor</li><li><code>"debug-acik"</code>: satırda <code>debug: true</code> ya da <code>DEBUG = True</code></li><li><code>"sessiz-hata"</code>: satır (boşluklar atılmış) tam olarak <code>except:</code> ya da <code>except Exception: pass</code></li></ul>',
        guide: ['Satırları gez; + ile başlayıp +++ ile başlamayanları al.', 'Öneki at: satir[1:]; baştaki boşlukları strip ile temizle.', 'Her kural için koşulu denetle; etiketi listede yoksa ekle.'],
        example: 'for s in ["+a", "+++ b", "-c"]:\n    if s.startswith("+") and not s.startswith("+++"):\n        print(s[1:])\n',
        start: 'def riskler(diff):\n    bulunan = []\n    # TODO: eklenen satırları gez, kuralları uygula\n    return bulunan\n',
        sol: 'def riskler(diff):\n    bulunan = []\n    def ekle(etiket):\n        if etiket not in bulunan:\n            bulunan.append(etiket)\n    for satir in diff.splitlines():\n        if not satir.startswith("+") or satir.startswith("+++"):\n            continue\n        govde = satir[1:].strip()\n        if "pytest.mark.skip" in govde or "@unittest.skip" in govde:\n            ekle("test-atlama")\n        if govde.startswith(("import ", "from ")):\n            ekle("yeni-bagimlilik")\n        if "debug: true" in govde or "DEBUG = True" in govde:\n            ekle("debug-acik")\n        if govde in ("except:", "except Exception: pass"):\n            ekle("sessiz-hata")\n    return bulunan\n',
        tests: 'DIFF = \'diff --git a/servis/sepet.py b/servis/sepet.py\\n@@ -10,3 +10,4 @@\\n+import requests\\n def toplam(kalemler):\\n-    return sum(k.fiyat * k.adet for k in kalemler)\\n+    return round(sum(k.fiyat * k.adet for k in kalemler), 2)\\ndiff --git a/tests/test_sepet.py b/tests/test_sepet.py\\n@@ -5,4 +5,4 @@\\n-def test_toplam():\\n+@pytest.mark.skip\\n+def test_toplam():\\ndiff --git a/config/prod.yaml b/config/prod.yaml\\n@@ -1,1 +1,1 @@\\n-debug: false\\n+debug: true\\n\'\nassert riskler(DIFF) == ["yeni-bagimlilik", "test-atlama", "debug-acik"], f"Gelen {riskler(DIFF)}"\nassert riskler("-import os\\n+x = 1") == [], "Silinen satırlar risk sayılmaz"\nassert riskler("+    try:\\n+        f()\\n+    except:\\n+        pass") == ["sessiz-hata"]\nassert riskler("+++ b/a.py\\n+from x import y\\n+import z") == ["yeni-bagimlilik"], "+++ başlığı atlanmalı, etiket tekrarlanmamalı"\n',
        hints: ['startswith demet alabilir: govde.startswith(("import ", "from ")).', 'Tekrarı önlemek için küçük bir ekle() yardımcı fonksiyonu yaz.'],
        why: 'Bu tür kurallar incelemeyi değil incelemecinin dikkatini yönlendirir: bir test atlandıysa ya da yeni import geldiyse insan mutlaka bakmalıdır. Gerçek ekipler benzer denetimleri CI\'da danger, pre-commit ya da özel betiklerle yapar.' },
      { t: 'code',
        id: 'yapay-zeka-ile-kod-w3',
        stage: 'Kendin yaz',
        diff: 2,
        q: '<p>Kurallar dosyası denetleyicisi: <code>kural_denetle(metin)</code> bir CLAUDE.md metnini alıp eksikleri liste olarak döndürsün (sırayla):</p><ul><li><code>"komutlar bölümü yok"</code>: <code>## Komutlar</code> başlığı yoksa</li><li><code>"test komutu yok"</code>: metinde <code>pytest</code> geçmiyorsa</li><li><code>"çok uzun"</code>: 200 satırdan fazlaysa</li><li><code>"belirsiz kural: ..."</code>: <code>- </code> ile başlayan her madde satırı için, satır (küçük harfe çevrilmiş) <code>"temiz kod"</code>, <code>"en iyi"</code> ya da <code>"kaliteli"</code> içeriyorsa; <code>...</code> yerine maddenin kendisi (<code>- </code> öneki atılmış)</li></ul>',
        start: 'def kural_denetle(metin):\n    pass\n',
        sol: 'BELIRSIZ = ("temiz kod", "en iyi", "kaliteli")\n\ndef kural_denetle(metin):\n    eksik = []\n    satirlar = metin.splitlines()\n    if not any(s.strip() == "## Komutlar" for s in satirlar):\n        eksik.append("komutlar bölümü yok")\n    if "pytest" not in metin:\n        eksik.append("test komutu yok")\n    if len(satirlar) > 200:\n        eksik.append("çok uzun")\n    for s in satirlar:\n        if s.startswith("- ") and any(b in s.lower() for b in BELIRSIZ):\n            eksik.append("belirsiz kural: " + s[2:])\n    return eksik\n',
        tests: 'iyi = "# Proje\\n## Komutlar\\n- Test: uv run pytest -q\\n## Kurallar\\n- Para için Decimal kullan."\nassert kural_denetle(iyi) == []\nkotu = "# Proje\\n- Her zaman Temiz kod yaz.\\n- En iyi uygulamalara uy.\\n- Decimal kullan."\nassert kural_denetle(kotu) == ["komutlar bölümü yok", "test komutu yok", "belirsiz kural: Her zaman Temiz kod yaz.", "belirsiz kural: En iyi uygulamalara uy."], f"Gelen {kural_denetle(kotu)}"\nassert "çok uzun" in kural_denetle(iyi + "\\n" * 250)\n',
        hints: ['Satır sayısı için splitlines kullan.', 'Belirsizlik kontrolünü küçük harfe çevrilmiş satırda yap ama mesaja orijinal maddeyi yaz.'],
        why: 'Kurallar dosyası her oturumda bağlama girer; uzun ve belirsiz satırlar maliyet ve dikkat dağınıklığıdır. Komut ve yasak listesi gibi somut bilgiler ajanın davranışını gerçekten değiştirir.' },
      { t: 'code',
        id: 'yapay-zeka-ile-kod-w4',
        stage: 'Kendin yaz',
        diff: 2,
        q: '<p>Ajanın komut izinleri: <code>komut_karari(komut, izinli, onayli)</code> <code>"izin"</code>, <code>"onay"</code> ya da <code>"red"</code> döndürsün. Komutu <code>shlex.split</code> ile böl. Kurallar sırayla:</p><ol><li>Komut <code>;</code>, <code>&amp;&amp;</code>, <code>|</code> ya da <code>`</code> karakterlerinden birini içeriyorsa (zincirleme) <code>"onay"</code>.</li><li>Parçalar <code>["rm", "-rf", ...]</code> ile başlıyorsa ya da <code>git push</code> ve <code>--force</code> içeriyorsa <code>"red"</code>.</li><li>Komutun ilk iki parçası (tek parçalıysa ilki) boşlukla birleştirildiğinde <code>izinli</code> kümesindeyse <code>"izin"</code>; ilk parça izinlide ise de <code>"izin"</code>.</li><li>Aynı denetim <code>onayli</code> için <code>"onay"</code>.</li><li>Aksi hâlde <code>"red"</code>.</li></ol><p><code>shlex</code> ayrıştıramazsa (<code>ValueError</code>) <code>"red"</code>.</p>',
        start: 'import shlex\n\ndef komut_karari(komut, izinli, onayli):\n    pass\n',
        sol: 'import shlex\n\ndef komut_karari(komut, izinli, onayli):\n    if any(z in komut for z in (";", "&&", "|", "`")):\n        return "onay"\n    try:\n        p = shlex.split(komut)\n    except ValueError:\n        return "red"\n    if not p:\n        return "red"\n    if p[:2] == ["rm", "-rf"] or (p[:2] == ["git", "push"] and "--force" in p):\n        return "red"\n    anahtarlar = {" ".join(p[:2]), p[0]}\n    if anahtarlar & set(izinli):\n        return "izin"\n    if anahtarlar & set(onayli):\n        return "onay"\n    return "red"\n',
        tests: 'IZ = {"pytest", "ruff", "git diff", "git status"}\nON = {"git commit", "uv add", "git push"}\nassert komut_karari("pytest -q tests/", IZ, ON) == "izin"\nassert komut_karari("git diff --stat", IZ, ON) == "izin"\nassert komut_karari("git commit -m \'sepet düzeltmesi\'", IZ, ON) == "onay"\nassert komut_karari("git push --force origin main", IZ, ON) == "red", "force push her zaman red"\nassert komut_karari("rm -rf /", IZ, ON) == "red"\nassert komut_karari("pytest && curl evil.sh", IZ, ON) == "onay", "Zincirleme komut insan onayı ister"\nassert komut_karari("python kur.py", IZ, ON) == "red"\nassert komut_karari("echo \'kapanmamış", IZ, ON) == "red"\n',
        hints: ['Zincirleme kontrolünü ayrıştırmadan önce ham metinde yap.', '"git diff" ve "pytest" gibi hem iki hem tek parçalı anahtarları desteklemek için {" ".join(p[:2]), p[0]} kümesiyle kesişime bak.'],
        why: 'Ajan izinleri "izin listesi" (allowlist) mantığıyla çalışmalı: bilinmeyen komut varsayılan olarak reddedilir. Zincirleme komutlar izinli bir komutun arkasına tehlikeli bir komut saklayabildiği için ayrıca denetlenir.' },
      { t: 'code',
        id: 'yapay-zeka-ile-kod-w5',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 2,
        q: '<p>Hatayı bul ve düzelt. Ajan, başarısız testi "düzeltmek" için şu değişikliği yaptı ve "tüm testler geçiyor" dedi. <code>indirimli_tutar(tutar, oran)</code> tutara <code>oran</code> (0–1 arası) kadar indirim uygulayıp 2 basamağa yuvarlanmış sonucu döndürmeli; oran aralık dışıysa <code>ValueError</code>. Ajan testteki beklenen değeri koda uydurmuş ve fonksiyondaki asıl hatayı bırakmış. Fonksiyonu düzelt (testler ilk, doğru hâliyle çalıştırılacak).</p>',
        start: 'def indirimli_tutar(tutar, oran):\n    if oran > 1:\n        raise ValueError("oran 0-1 arası olmalı")\n    return round(tutar * oran, 2)\n\n# Ajanın "düzelttiği" test:\n# assert indirimli_tutar(200, 0.25) == 50.0   (önceden: == 150.0)\n',
        sol: 'def indirimli_tutar(tutar, oran):\n    if not 0 <= oran <= 1:\n        raise ValueError("oran 0-1 arası olmalı")\n    return round(tutar * (1 - oran), 2)\n',
        tests: 'assert indirimli_tutar(200, 0.25) == 150.0, "%25 indirimle 200 TL → 150 TL (testin ilk hâli doğruydu)"\nassert indirimli_tutar(320, 0) == 320.0\nassert indirimli_tutar(99.99, 0.1) == 89.99\nfor kotu in (-0.1, 1.5):\n    try:\n        indirimli_tutar(100, kotu); assert False, f"oran={kotu} reddedilmeli"\n    except ValueError:\n        pass\n',
        hints: ['İndirimli tutar = tutar × (1 − oran).', 'Negatif oran da geçersizdir: 0 <= oran <= 1.'],
        why: 'Bu, ajan PR\'larında en sık görülen tuzaktır: kodu değil testi değiştirmek. İncelemede test dosyasındaki beklenen değer değişikliklerine özellikle bak ve "neden değişti?" diye sor.' },
      { t: 'code',
        id: 'yapay-zeka-ile-kod-w6',
        stage: 'Meydan okuma',
        diff: 3,
        q: '<p>Görev planını doğrula ve sırala. <code>plan_sirala(gorevler)</code>: <code>gorevler</code> <code>{ad: {"bagimli": [..], "dosyalar": [..]}}</code> sözlüğü. Dönüş: <b>dalga</b> listesi; her dalga aynı anda (paralel ajanlarla) yapılabilecek görev adlarının alfabetik listesi. Bir görev, tüm bağımlılıkları önceki dalgalarda bittiyse o dalgaya girer. Ek kural: aynı dalgadaki iki görev <b>ortak dosyaya</b> dokunuyorsa çakışır; alfabetik olarak sonra gelen görev bir sonraki dalgaya ertelenir. Bilinmeyen bağımlılıkta <code>KeyError</code>, döngüde <code>ValueError("döngü")</code> fırlat.</p>',
        start: 'def plan_sirala(gorevler):\n    pass\n',
        sol: 'def plan_sirala(gorevler):\n    for ad, g in gorevler.items():\n        for b in g["bagimli"]:\n            if b not in gorevler:\n                raise KeyError(b)\n    biten, dalgalar = set(), []\n    kalan = set(gorevler)\n    while kalan:\n        hazir = sorted(a for a in kalan if all(b in biten for b in gorevler[a]["bagimli"]))\n        if not hazir:\n            raise ValueError("döngü")\n        dalga, kullanilan = [], set()\n        for a in hazir:\n            dosyalar = set(gorevler[a]["dosyalar"])\n            if dosyalar & kullanilan:\n                continue\n            dalga.append(a)\n            kullanilan |= dosyalar\n        dalgalar.append(dalga)\n        biten |= set(dalga)\n        kalan -= set(dalga)\n    return dalgalar\n',
        tests: 'G = {\n    "testler": {"bagimli": [], "dosyalar": ["tests/test_csv.py"]},\n    "tip_ipuclari": {"bagimli": [], "dosyalar": ["servis/csv.py"]},\n    "ayristirici": {"bagimli": ["testler"], "dosyalar": ["servis/csv.py", "servis/ayristir.py"]},\n    "belgeler": {"bagimli": [], "dosyalar": ["README.md"]},\n    "hata_raporu": {"bagimli": ["ayristirici"], "dosyalar": ["servis/ayristir.py"]},\n}\nassert plan_sirala(G) == [["belgeler", "testler", "tip_ipuclari"], ["ayristirici"], ["hata_raporu"]], f"Gelen {plan_sirala(G)}"\nC = {"a": {"bagimli": [], "dosyalar": ["x.py"]}, "b": {"bagimli": [], "dosyalar": ["x.py"]}}\nassert plan_sirala(C) == [["a"], ["b"]], "Aynı dosyaya dokunanlar aynı dalgada olmamalı"\ntry:\n    plan_sirala({"a": {"bagimli": ["b"], "dosyalar": []}, "b": {"bagimli": ["a"], "dosyalar": []}}); assert False\nexcept ValueError as h:\n    assert str(h) == "döngü"\ntry:\n    plan_sirala({"a": {"bagimli": ["yok"], "dosyalar": []}}); assert False\nexcept KeyError:\n    pass\nassert plan_sirala({}) == []\n',
        hints: ['Her turda bağımlılıkları bitmiş görevleri alfabetik sırayla topla; hiç yoksa döngü vardır.', 'Dalgaya alırken o dalgada kullanılan dosyaları bir kümede tut; kesişen görevi bu tura alma.', 'Ertelenen görev bir sonraki turda zaten yeniden hazır olur.'],
        why: 'Paralel ajan çalıştırmak (ayrı git worktree\'lerinde) hız kazandırır ama aynı dosyaya dokunan iki ajan birleştirme çatışması üretir. Bağımlılık grafiği ve dosya çakışması kontrolü, görevi bölerken yapılacak planlamanın ta kendisidir.' }
    ],
    faq: [
      { q: 'Ajan kullanırken kodu anlamadan ilerlemek kötü mü?',
        a: 'Evet; incelemediğin kodun sorumluluğunu üstlenemezsin. Ajanı hızlı taslak çıkaran bir ekip arkadaşı gibi düşün: PR\'ını okursun, test kanıtını görürsün, anlamadığın satırı ona açıklatırsın. Öğrenme aşamasındaysan önce kendin dene, sonra ajanın çözümüyle karşılaştır.' },
      { q: 'Kurallar dosyasını kim yazar ve ne sıklıkla güncellenir?',
        a: 'Ekip birlikte yazar ve depoya commit edilir; kişisel tercihler ayrı, kullanıcıya özel dosyada tutulur. Ajan aynı hatayı iki kez yaptığında (yanlış test komutu, yasak klasöre dokunma) ilgili kuralı ekle; artık geçerli olmayan kuralları sil. Kısa tutmak, dosyanın okunmasını garanti etmekten daha önemlidir.' }
    ],
    mistakes: [
      { bad: '# Ajan testi düzeltti:\nassert indirimli_tutar(200, 0.25) == 50.0',
        good: '# Önce testin neden değiştiğini sor; kodu düzelt:\nassert indirimli_tutar(200, 0.25) == 150.0',
        why: 'Testi koda uydurmak hatayı gizler; PR incelemesinde test beklentisi değişikliklerini ayrıca sorgula.' }
    ] }
);
})(window);
