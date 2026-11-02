import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from h import py, pc, d

html = (
'<h2>Derinleş: Git\'i gerçekten kullanmak</h2>\n'
'<p>Temel akışı (add, commit, dal, PR) ve proje ağacını gördün. İşte ilk haftanda ise şu sorular gelir: "Git\'i nasıl kurarım, kimliğimi nasıl tanıtırım?", "Yanlış commit\'i nasıl geri alırım?", "Birleştirmede çakışma çıktı, bu &lt;&lt;&lt;&lt;&lt;&lt;&lt; işaretleri ne?", "Windows\'ta çalışan arkadaşımın dosyalarında neden her satır değişmiş görünüyor?", "Hangi commit hatayı getirdi?". Bu bölüm bunları yanıtlar ve Git çıktılarını Python\'la işleyen küçük araçlar yazdırır. Otomatik kalite kontrolleri (pre-commit, GitHub Actions) <i>kalite-ci</i>, paket sürümleme ve yayımlama <i>paketleme-dagitim</i> dersinde.</p>\n'

'<h3>Kurulum ve ilk ayarlar</h3>\n'
+ pc('''
    # Windows:  winget install --id Git.Git -e   (ya da git-scm.com; Git Bash da gelir)
    # macOS:    xcode-select --install   ya da   brew install git
    # Ubuntu:   sudo apt install git     | Fedora: sudo dnf install git
    git --version

    git config --global user.name "Ayşe Yılmaz"
    git config --global user.email "ayse@anadolubank.example"
    git config --global init.defaultBranch main
    git config --global pull.rebase true          # pull sırasında gereksiz merge commit'i olmasın
    git config --global core.autocrlf true        # yalnız Windows: depoda LF, diskte CRLF
    git config --global core.autocrlf input       # macOS/Linux
    git config --list --show-origin               # hangi ayar nereden geliyor

    # GitHub/GitLab için SSH anahtarı (parola yerine)
    ssh-keygen -t ed25519 -C "ayse@anadolubank.example"
    cat ~/.ssh/id_ed25519.pub        # bu satırı GitHub > Settings > SSH keys'e yapıştır
    ssh -T git@github.com            # "Hi ayse! You've successfully authenticated"
''') +
'<p>Satır sonu farkı (Windows CRLF <code>\\r\\n</code>, Linux/macOS LF <code>\\n</code>) karışık ekiplerde "her satır değişti" görünen diff\'lerin bir numaralı nedenidir. Ekip genelinde kalıcı çözüm depo köküne bir <code>.gitattributes</code> koymaktır: <code>* text=auto eol=lf</code> ve <code>*.bat text eol=crlf</code>.</p>\n'

+ py('''
    dosyalar = {
        "src/rapor.py": b"import csv\\nprint('ok')\\n",
        "src/kargo.py": b"UCRET = 45\\r\\nKDV = 0.2\\r\\n",
        "scripts/kur.bat": b"@echo off\\r\\npy -m venv .venv\\r\\n",
        "README.md": b"# Rapor\\r\\nKurulum\\n",
    }
    for yol, icerik in dosyalar.items():
        crlf = icerik.count(b"\\r\\n")
        lf = icerik.count(b"\\n") - crlf
        tur = "KARIŞIK" if crlf and lf else "CRLF" if crlf else "LF"
        uyari = "" if tur == "LF" or yol.endswith(".bat") else "  <- .gitattributes ile LF'e çevrilmeli"
        print(f"{yol:18} {tur}{uyari}")
''') +
'<h3>Geri alma: hangi komut ne zaman?</h3>\n'
'<div class="tbl-wrap"><table>'
'<tr><th>Durum</th><th>Komut</th><th>Paylaşılmış geçmişte güvenli mi?</th></tr>'
'<tr><td>Dosyadaki kaydedilmemiş değişikliği at</td><td><code>git restore dosya</code></td><td>Evet (yerel)</td></tr>'
'<tr><td>Yanlışlıkla <code>add</code> ettin</td><td><code>git restore --staged dosya</code></td><td>Evet (yerel)</td></tr>'
'<tr><td>Son commit mesajı yanlış / dosya unutuldu</td><td><code>git commit --amend</code></td><td>Yalnız push etmediysen</td></tr>'
'<tr><td>Son commit\'i geri al, değişiklikler kalsın</td><td><code>git reset --soft HEAD~1</code></td><td>Yalnız push etmediysen</td></tr>'
'<tr><td>Push edilmiş commit\'i geri al</td><td><code>git revert &lt;hash&gt;</code></td><td>Evet: ters commit üretir</td></tr>'
'<tr><td>"Kaybettim" sandığın commit\'i bul</td><td><code>git reflog</code></td><td>Evet (yerel kayıt)</td></tr>'
'<tr><td>Yarım işi rafa kaldır / geri al</td><td><code>git stash</code> / <code>git stash pop</code></td><td>Evet</td></tr>'
'</table></div>\n'
'<div class="warn"><b>reset --hard ve push --force</b><code>git reset --hard</code> kaydedilmemiş işi geri dönüşsüz siler. Paylaşılan dalda geçmişi yeniden yazıp <code>push --force</code> yapmak ekip arkadaşlarının işini bozar; zorunluysan <code>--force-with-lease</code> kullan ve önce haber ver. Ana dalda geri almanın yolu her zaman <code>revert</code>\'tür.</div>\n'

'<h3>Birleştirme çakışması (merge conflict)</h3>\n'
'<p>İki dal aynı satırı farklı değiştirdiyse Git karar veremez ve dosyaya işaretler koyar. <code>&lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD</code> ile <code>=======</code> arası senin dalın, <code>=======</code> ile <code>&gt;&gt;&gt;&gt;&gt;&gt;&gt;</code> arası gelen dal. Doğru sonucu elle yazar, işaretleri silersin, sonra <code>git add dosya</code> ve <code>git commit</code> (rebase sırasındaysan <code>git rebase --continue</code>). Vazgeçmek için <code>git merge --abort</code>. İşaretlerin yanlışlıkla commit\'lenmemesi için CI\'da basit bir kontrol çok işe yarar:</p>\n'
+ py('''
    dosya = """VERGI_ORANI = 0.20
    <<<<<<< HEAD
    KARGO_UCRETI = 45
    =======
    KARGO_UCRETI = 49.90
    >>>>>>> kargo-zammi
    PARA_BIRIMI = "TL"
    """

    def cakismalar(metin):
        bloklar, durum, bizim, onlarin = [], None, [], []
        for satir in metin.splitlines():
            if satir.startswith("<<<<<<<"):
                durum, bizim, onlarin = "bizim", [], []
            elif satir.startswith("=======") and durum == "bizim":
                durum = "onlarin"
            elif satir.startswith(">>>>>>>") and durum == "onlarin":
                bloklar.append({"bizim": bizim, "onlarin": onlarin, "dal": satir[8:].strip()})
                durum = None
            elif durum == "bizim":
                bizim.append(satir)
            elif durum == "onlarin":
                onlarin.append(satir)
        return bloklar

    for b in cakismalar(dosya):
        print(f"main: {b['bizim']}  |  {b['dal']}: {b['onlarin']}")
''') +

'<h3>Rebase, etiket ve geçmişte arama</h3>\n'
'<p><code>git rebase main</code> dalındaki commit\'leri main\'in en güncel hâlinin üstüne taşır; geçmiş düz kalır. Kural: yalnızca <b>kendi, paylaşılmamış</b> dalını rebase et. Sürüm yayımlarken <code>git tag -a v1.4.0 -m "Kasım sürümü"</code> ve <code>git push origin v1.4.0</code>. Hatanın hangi commit\'le geldiğini bulmak için <code>git bisect</code> ikili arama yapar: iyi ve kötü commit\'i söylersin, Git ortadakini açar, sen test edersin; birkaç adımda suçlu bulunur. <code>git blame dosya</code> her satırı son değiştireni, <code>git log -S "KARGO_UCRETI" --oneline</code> o metni ekleyen/silen commit\'leri gösterir.</p>\n'
+ pc('''
    git log --oneline --graph --all -20       # dalları görsel izle
    git log --since="2 weeks" --author="Ayşe" -- src/
    git show v1.4.0 --stat
    git bisect start; git bisect bad; git bisect good v1.3.0
    git bisect run python -m pytest tests/test_kargo.py   # otomatik ikili arama
    git bisect reset
''') +
'<p>Git\'in "makine dostu" çıktılarını betiklerle işlemek CI ve sürüm otomasyonunun temelidir. <code>git status --porcelain</code> her satırda iki harfli durum kodu verir (<code>M</code> değişti, <code>A</code> eklendi, <code>??</code> izlenmiyor); Conventional Commits (<code>feat:</code>, <code>fix:</code>, <code>feat!:</code>) mesajlarından ise sürüm numarası ve değişiklik günlüğü (CHANGELOG) otomatik üretilir:</p>\n'
+ py('''
    import re

    log = """a1b2c3d feat(rapor): şehir kırılımı eklendi
    9f8e7d6 fix: KDV yuvarlaması Decimal'e taşındı
    5c4b3a2 docs: README kurulum adımları
    1a2b3c4 feat!: CSV ayırıcısı ; oldu"""

    gruplar = {"Yeni özellikler": [], "Hata düzeltmeleri": [], "Kırıcı değişiklikler": []}
    for satir in log.splitlines():
        h, mesaj = satir.split(" ", 1)
        m = re.match(r"(\\w+)(\\([\\w-]+\\))?(!)?: (.+)", mesaj)
        if not m:
            continue
        tur, _, kirici, ozet = m.groups()
        if kirici:
            gruplar["Kırıcı değişiklikler"].append(f"{ozet} ({h})")
        elif tur == "feat":
            gruplar["Yeni özellikler"].append(f"{ozet} ({h})")
        elif tur == "fix":
            gruplar["Hata düzeltmeleri"].append(f"{ozet} ({h})")
    for baslik, maddeler in gruplar.items():
        if maddeler:
            print("##", baslik)
            print("\\n".join("- " + x for x in maddeler))
''') +
'<div class="tip"><b>README, LICENSE, CHANGELOG</b>İyi bir depoda kökte en az şunlar bulunur: ne işe yaradığını ve nasıl kurulup çalıştırılacağını anlatan <code>README.md</code>, kullanım hakkını belirten <code>LICENSE</code> (şirket içi kodda genellikle "tescilli"), sürüm farklarını anlatan <code>CHANGELOG.md</code>, örnek ayar <code>.env.example</code> ve satır sonu kuralı için <code>.gitattributes</code>.</div>\n'
'<div class="note"><b>Gerçek işte</b>Anadolu Bank\'ta ana dal korumalıdır: doğrudan push yasaktır, her değişiklik PR ile gelir, en az bir onay ve yeşil CI gerekir, birleştirme "squash" ile tek commit\'e indirilir. Canlıda hata çıkınca önce <code>git revert</code> ile hızla geri dönülür, sonra kök neden ayrı bir dalda düzeltilir. Sürüm etiketleri ve CHANGELOG, Conventional Commits mesajlarından otomatik üretilir; bu yüzden commit mesajı kuralı PR kontrolünde denetlenir.</div>\n'
)

ex = [
  dict(t='mc', stage='Isınma', q='Ana dala (main) push edilmiş ve ekipçe çekilmiş bir commit hatalı çıktı. Hatalı değişikliği geri almanın en güvenli yolu hangisidir?',
       o=['git reset --hard HEAD~1 ve git push --force', 'git revert &lt;hash&gt; ve git push', 'git commit --amend ile commit\'i düzeltmek', 'Depoyu silip yeniden klonlamak'], a=1,
       why='revert, hatalı commit\'in tersini yapan yeni bir commit ekler; geçmiş yeniden yazılmadığı için ekip arkadaşlarının kopyaları bozulmaz. reset + force push ve amend paylaşılmış geçmişi değiştirir.'),
  dict(t='mc', stage='Isınma', q='Windows kullanan bir ekip arkadaşının PR\'ında yalnızca bir satırı değiştirdiği dosyada Git tüm satırları değişmiş gösteriyor. En olası neden nedir?',
       o=['Dosya UTF-8 değil, UTF-16 kaydedilmiş', 'Satır sonları LF yerine CRLF olmuş', 'Dosya izinleri (chmod) değişmiş', 'Git önbelleği bozulmuş'], a=1,
       why='Windows editörleri satır sonunu CRLF yazabilir; LF beklenen depoda her satır farklı görünür. .gitattributes içinde "* text=auto eol=lf" ve core.autocrlf ayarı bunu ekip genelinde çözer.'),
  dict(t='predict', stage='Kodu oku', q='Bu kod ne yazdırır?',
       code=d('''
           porcelain = " M src/rapor.py\\nA  tests/test_yeni.py\\n?? notlar.txt\\nMM README.md\\n"
           hazir = [s[3:] for s in porcelain.splitlines() if s[0] not in " ?"]
           print(hazir)
       '''),
       o=["['tests/test_yeni.py', 'README.md']", "['src/rapor.py', 'tests/test_yeni.py', 'README.md']", "['tests/test_yeni.py']", "['A  tests/test_yeni.py', 'MM README.md']"], a=0,
       why='git status --porcelain çıktısında ilk sütun hazırlık alanı (staged), ikinci sütun çalışma dizini durumudur. İlk harfi boşluk ya da ? olmayanlar hazırlıktadır: A (eklendi) ve MM (hazırlıkta değişiklik var, sonrasında yine değişti). Dosya adı 3. karakterden başlar.'),
  dict(t='predict', stage='Kodu oku', q='Bu kod ne yazdırır?',
       code=d('''
           import re
           desen = r"^(feat|fix|docs)(\\([a-z-]+\\))?!?: \\S"
           for m in ["feat(rapor): şehir eklendi", "Fix: yazım", "fix!: api değişti", "docs:eksik boşluk"]:
               print(bool(re.match(desen, m)), end=" ")
       '''),
       o=['True False True False', 'True True True False', 'True False False False', 'True False True True'], a=0,
       why='Tür küçük harf olmalı ("Fix" eşleşmez), kapsam (scope) parantez içinde isteğe bağlı, ! isteğe bağlı; iki noktadan sonra bir boşluk ve boşluk olmayan bir karakter şart ("docs:eksik" düşer).'),
  dict(t='predict', stage='Kodu oku', q='Bu kod ne yazdırır?',
       code=d('''
           from fnmatch import fnmatch
           kurallar = ["*.log", "!hata.log", "logs/*", "*.log"]
           def yok_say(yol):
               sonuc = False
               for k in kurallar:
                   istisna = k.startswith("!")
                   if fnmatch(yol, k.lstrip("!")):
                       sonuc = not istisna
               return sonuc
           print(yok_say("hata.log"), yok_say("logs/a.txt"), yok_say("rapor.txt"))
       '''),
       o=['False True False', 'True True False', 'False False False', 'True False False'], a=1,
       why='Son eşleşen kural kazanır: hata.log önce *.log ile yok sayılır, !hata.log ile geri alınır, ama son satırdaki *.log yeniden yok sayar. logs/a.txt "logs/*" ile eşleşir; rapor.txt hiçbir kurala uymaz.'),
  dict(t='order', stage='Kodu oku',
       q='<p><code>git log --oneline</code> çıktısından yazar sayısı değil, <b>commit türlerinin sayısını</b> çıkaran <code>tur_say</code> fonksiyonunun satırlarını sırala.</p>',
       lines=['from collections import Counter', 'def tur_say(log):', '    sayac = Counter()', '    for satir in log.strip().splitlines():', '        mesaj = satir.split(" ", 1)[1]', '        sayac[mesaj.split(":")[0].split("(")[0]] += 1', '    return dict(sayac)'],
       tests='assert tur_say("a1 feat: x\\nb2 fix(api): y\\nc3 feat(ui): z\\n") == {"feat": 2, "fix": 1}, "feat 2, fix 1 olmalı"\n',
       hint='Sayaç döngüden önce; döngüde önce hash\'i ayırıp mesajı al, sonra türü say.',
       why='split(" ", 1) yalnızca ilk boşluktan böler ve hash\'i mesajdan ayırır. Tür, iki noktaya ve varsa kapsam parantezine kadar olan kısımdır.'),
  dict(t='code', stage='Rehberli', id='git-proje-yapisi-x1', diff=2,
       q='<p>CI için çakışma işareti denetimi yaz: <code>cakisma_satirlari(metin)</code>, dosya metninde <b>satır başında</b> <code>&lt;&lt;&lt;&lt;&lt;&lt;&lt;</code>, <code>=======</code> ya da <code>&gt;&gt;&gt;&gt;&gt;&gt;&gt;</code> ile başlayan satırların <b>1 tabanlı</b> numaralarını liste olarak döndürsün. <code>=======</code> yalnızca satırın tamamıysa (sonrasında boşluk dışında karakter yoksa) sayılsın; böylece Markdown başlık çizgisi <code>==========</code> gibi daha uzun satırlar yanlış alarm vermesin. <code>&lt;</code> ve <code>&gt;</code> işaretlerinde ise 7 karakterden sonra boşluk ya da satır sonu gelmeli.</p>',
       guide=['enumerate(metin.splitlines(), start=1) ile dön.', 'satir.rstrip() == "=======" kontrolü ayraç satırını yakalar.', 'İşaret satırları için: satir.startswith("&lt;&lt;&lt;&lt;&lt;&lt;&lt;") ve satir[7:8] in ("", " ").', 'Eşleşen numaraları listeye ekle ve döndür.'],
       example=d('''
           # Benzer teknik: TODO içeren satırların numaraları
           kod = "x = 1\\n# TODO: test\\ny = 2\\n# TODO"
           print([no for no, s in enumerate(kod.splitlines(), start=1) if s.lstrip().startswith("# TODO")])
       '''),
       start=d('''
           def cakisma_satirlari(metin):
               sonuc = []
               for no, satir in enumerate(metin.splitlines(), start=1):
                   # TODO: <<<<<<< ve >>>>>>> işaret satırlarını yakala (8. karakter boşluk ya da yok)
                   # TODO: tam olarak ======= olan satırı yakala
                   pass
               return sonuc
       '''),
       sol=d('''
           def cakisma_satirlari(metin):
               sonuc = []
               for no, satir in enumerate(metin.splitlines(), start=1):
                   if satir[:7] in ("<<<<<<<", ">>>>>>>") and satir[7:8] in ("", " "):
                       sonuc.append(no)
                   elif satir.rstrip() == "=======":
                       sonuc.append(no)
               return sonuc
       '''),
       tests=d('''
           _m = "a = 1\\n<<<<<<< HEAD\\nb = 2\\n=======\\nb = 3\\n>>>>>>> kargo\\nc = 4\\n"
           assert cakisma_satirlari(_m) == [2, 4, 6], f"2, 4 ve 6. satırlar işaret: {cakisma_satirlari(_m)}"
           _md = "Başlık\\n==========\\nmetin <<<<<<< ortada\\n>>>>>>>>> fazla ok\\n"
           assert cakisma_satirlari(_md) == [], "Markdown çizgisi, satır ortası ve 9 karakterlik ok işaret sayılmamalı"
           assert cakisma_satirlari("=======   \\n>>>>>>>") == [1, 2], "sondaki boşluk ve dal adsız kapanış da yakalanmalı"
       '''),
       hints=['satir[:7] ilk yedi karakteri, satir[7:8] sekizinci karakteri (yoksa "") verir.', 'Ayraç için satir.rstrip() == "=======".', 'if satir[:7] in ("&lt;&lt;&lt;&lt;&lt;&lt;&lt;", "&gt;&gt;&gt;&gt;&gt;&gt;&gt;") and satir[7:8] in ("", " "):'],
       why='Git\'in işaretleri tam 7 karakterdir ve satır başında durur; ardından boşluk ve dal adı ya da satır sonu gelir. Kesin kalıp aramak hem unutulmuş çakışmayı yakalar hem de Markdown gibi benzer görünen içerikte yanlış alarmı önler.'),
  dict(t='code', stage='Rehberli', id='git-proje-yapisi-x2', diff=2,
       q='<p>Sürüm otomasyonu: <code>sonraki_surum(surum, mesajlar)</code> yaz. <code>surum</code> <code>"v1.4.2"</code> ya da <code>"1.4.2"</code> biçiminde; <code>mesajlar</code> son sürümden beri gelen commit mesajları. Conventional Commits kuralı: herhangi bir mesajın türünden sonra <code>!</code> varsa (<code>feat!:</code>, <code>fix(api)!:</code>) ya da mesajda <code>BREAKING CHANGE</code> geçiyorsa <b>major</b> artar; yoksa <code>feat</code> varsa <b>minor</b>; yoksa <code>fix</code> varsa <b>patch</b>; hiçbiri yoksa sürüm değişmez. Artırılan parçadan sonrakiler sıfırlanır. Sonuç girişle aynı önek biçiminde dönsün (<code>v</code> varsa <code>v</code>\'li).</p>',
       guide=['Öneki ayır: v ile başlıyorsa önek = "v", sayıları kalan kısımdan al.', 'Her mesaj için türü re.match(r"(\\w+)(\\([^)]*\\))?(!)?:", m) ile çöz.', 'En yüksek seviyeyi bul: 3 major, 2 minor, 1 patch, 0 hiçbiri.', 'Seviyeye göre (major+1, 0, 0), (major, minor+1, 0) ya da patch+1 üret.'],
       example=d('''
           import re
           for m in ["feat(ui)!: yeni tema", "fix: x", "chore: y"]:
               g = re.match(r"(\\w+)(\\([^)]*\\))?(!)?:", m)
               print(g.group(1), bool(g.group(3)))
       '''),
       start=d('''
           import re

           def sonraki_surum(surum, mesajlar):
               onek = "v" if surum.startswith("v") else ""
               major, minor, patch = (int(x) for x in surum.lstrip("v").split("."))
               seviye = 0
               for m in mesajlar:
                   # TODO: türü ve ! işaretini çöz, seviyeyi güncelle
                   pass
               # TODO: seviyeye göre yeni sürümü üret
               return surum
       '''),
       sol=d('''
           import re

           def sonraki_surum(surum, mesajlar):
               onek = "v" if surum.startswith("v") else ""
               major, minor, patch = (int(x) for x in surum.lstrip("v").split("."))
               seviye = 0
               for m in mesajlar:
                   g = re.match(r"(\\w+)(\\([^)]*\\))?(!)?:", m)
                   if "BREAKING CHANGE" in m or (g and g.group(3)):
                       seviye = 3
                   elif g and g.group(1) == "feat":
                       seviye = max(seviye, 2)
                   elif g and g.group(1) == "fix":
                       seviye = max(seviye, 1)
               if seviye == 3:
                   major, minor, patch = major + 1, 0, 0
               elif seviye == 2:
                   minor, patch = minor + 1, 0
               elif seviye == 1:
                   patch += 1
               return f"{onek}{major}.{minor}.{patch}"
       '''),
       tests=d('''
           assert sonraki_surum("v1.4.2", ["fix: kdv", "docs: readme"]) == "v1.4.3", "yalnız fix -> patch"
           assert sonraki_surum("1.4.2", ["fix: a", "feat(rapor): b"]) == "1.5.0", "feat -> minor, patch sıfırlanır, önek yok"
           assert sonraki_surum("v1.4.2", ["feat: a", "fix(api)!: imza değişti"]) == "v2.0.0", "! -> major"
           assert sonraki_surum("v0.9.9", ["refactor: x\\n\\nBREAKING CHANGE: ayar adı değişti"]) == "v1.0.0", "BREAKING CHANGE gövdede de olabilir"
           assert sonraki_surum("v2.1.0", ["chore: bağımlılık", "docs: x"]) == "v2.1.0", "yayın gerektiren değişiklik yoksa sürüm aynı"
           assert sonraki_surum("v1.0.0", ["feature: x", "fixed: y"]) == "v1.0.0", "tür adı birebir feat/fix olmalı"
       '''),
       hints=['re.match yalnız metnin başında eşleşir; group(1) tür, group(3) "!" ya da None.', 'seviye = max(seviye, 2) ile daha düşük bir tür daha yükseği ezmesin.', 'major artınca minor ve patch, minor artınca patch sıfırlanır.'],
       why='Anlamsal sürümleme (semver) değişikliğin etkisini numaraya yansıtır: kırıcı değişiklik major, yeni özellik minor, düzeltme patch. Conventional Commits bu kararı mesajlardan otomatik vermeyi sağlar; semantic-release, release-please gibi araçlar tam olarak bunu yapar.'),
  dict(t='code', stage='Rehberli', id='git-proje-yapisi-x3', diff=2,
       q='<p>Ekip dal adı kuralı: <code>&lt;tür&gt;/&lt;açıklama&gt;</code>; tür <code>feature</code>, <code>bugfix</code>, <code>hotfix</code>, <code>release</code> ya da <code>chore</code>; açıklama yalnızca küçük ASCII harf, rakam ve tek tireden oluşur (tire ile başlayıp bitmez, art arda iki tire yok), en az 3 en çok 40 karakter. İsteğe bağlı olarak tür ile açıklama arasında iş kaydı numarası olabilir: <code>feature/ANB-123-sehir-raporu</code> (büyük harf proje kodu, tire, sayı, tire, açıklama). <code>dal_gecerli_mi(ad)</code> True/False döndürsün; <code>main</code> ve <code>develop</code> da geçerli.</p>',
       guide=['Önce özel adları (main, develop) kontrol et.', 'Türleri (feature|bugfix|...) bir gruba yaz.', 'İş kaydı kısmı: (?:[A-Z]+-\\d+-)? isteğe bağlı grup.', 'Açıklama: [a-z0-9]+(?:-[a-z0-9]+)* ve uzunluğu ayrıca kontrol et; re.fullmatch kullan.'],
       example=d('''
           import re
           desen = r"[a-z]+(?:_[a-z]+)*"     # snake_case kelimeler
           for s in ["sehir_raporu", "_kotu", "iki__alt", "tamam"]:
               print(s, bool(re.fullmatch(desen, s)))
       '''),
       start=d('''
           import re

           DESEN = r"(feature|bugfix)/(.+)"   # TODO: tüm türler, iş kaydı ve açıklama kuralı

           def dal_gecerli_mi(ad):
               # TODO: main/develop, fullmatch ve açıklama uzunluğu
               return re.fullmatch(DESEN, ad) is not None
       '''),
       sol=d('''
           import re

           DESEN = r"(feature|bugfix|hotfix|release|chore)/(?:[A-Z]+-\\d+-)?([a-z0-9]+(?:-[a-z0-9]+)*)"

           def dal_gecerli_mi(ad):
               if ad in ("main", "develop"):
                   return True
               m = re.fullmatch(DESEN, ad)
               return bool(m) and 3 <= len(m.group(2)) <= 40
       '''),
       tests=d('''
           for _a in ["main", "develop", "feature/sehir-raporu", "hotfix/kdv-yuvarlama", "feature/ANB-123-sehir-raporu", "release/v1-4", "chore/abc"]:
               assert dal_gecerli_mi(_a), f"{_a} geçerli olmalı"
           for _a in ["feature/Sehir", "feature/-kotu", "feature/kotu-", "feature/iki--tire", "feat/x-y-z", "feature/ab", "feature/" + "a" * 41, "sehir-raporu", "feature/şehir"]:
               assert not dal_gecerli_mi(_a), f"{_a} geçersiz olmalı"
       '''),
       hints=['re.fullmatch tüm metnin desene uymasını ister; match yalnız başını denetler.', 'Açıklama deseni: [a-z0-9]+(?:-[a-z0-9]+)* tek tireyi ve uçları kendiliğinden yönetir.', 'Uzunluğu desende değil m.group(2) ile ayrıca ölç.'],
       why='Dal adı kuralları CI\'da otomatik denetlenir ve iş kaydı numarası sayesinde PR ile görev takibi birbirine bağlanır. "Kelime(-kelime)*" kalıbı, tireyle başlama/bitme ve art arda tire durumlarını tek desende dışlar.'),
  dict(t='code', stage='Kendin yaz', id='git-proje-yapisi-x4', diff=2,
       q='<p>Commit öncesi gizli bilgi taraması: <code>sizinti_bul(diff)</code>, <code>git diff</code> çıktısında <b>yalnızca eklenen satırlara</b> (<code>+</code> ile başlayan, ama <code>+++</code> dosya başlığı olmayan) bakıp şüpheli satırları <code>(dosya, satir_metni)</code> demetleri olarak döndürsün. Dosya adı en son görülen <code>+++ b/&lt;yol&gt;</code> satırından gelir; satır metni baştaki <code>+</code> olmadan ve kırpılmış olsun. Şüpheli: <code>AKIA</code> ile başlayan 20 karakterlik büyük harf/rakam anahtarı, <code>-----BEGIN</code> ile başlayan özel anahtar, ya da <code>password</code>, <code>parola</code>, <code>secret</code>, <code>api_key</code> kelimelerinden biri (harf duyarsız) ardından <code>=</code> ya da <code>:</code> ve tırnak içinde boş olmayan değer.</p>',
       start=d('''
           import re

           def sizinti_bul(diff):
               pass
       '''),
       sol=d('''
           import re

           DESENLER = [
               re.compile(r"AKIA[0-9A-Z]{16}"),
               re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY"),
               re.compile(r"(password|parola|secret|api_key)\\s*[=:]\\s*['\\"][^'\\"]+['\\"]", re.I),
           ]

           def sizinti_bul(diff):
               dosya, sonuc = None, []
               for satir in diff.splitlines():
                   if satir.startswith("+++ "):
                       dosya = satir[4:].removeprefix("b/")
                   elif satir.startswith("+"):
                       metin = satir[1:].strip()
                       if any(d.search(metin) for d in DESENLER):
                           sonuc.append((dosya, metin))
               return sonuc
       '''),
       tests=d('''
           _d = """diff --git a/ayar.py b/ayar.py
           --- a/ayar.py
           +++ b/ayar.py
           @@ -1,2 +1,4 @@
           -PASSWORD = "eski-parola-123"
           +PASSWORD = os.environ["DB_PAROLA"]
            DEBUG = False
           +API_KEY = "sk-canli-9f8e7d"
           +aws = "AKIAIOSFODNN7EXAMPLE"
           diff --git a/anahtar.pem b/anahtar.pem
           +++ b/anahtar.pem
           +-----BEGIN RSA PRIVATE KEY-----
           +parola: ""
           """
           _r = sizinti_bul(_d)
           assert _r == [("ayar.py", 'API_KEY = "sk-canli-9f8e7d"'), ("ayar.py", 'aws = "AKIAIOSFODNN7EXAMPLE"'), ("anahtar.pem", "-----BEGIN RSA PRIVATE KEY-----")], f"yanlış: {_r}"
           assert sizinti_bul("") == [], "boş diff"
       '''),
       hints=['Satırları sırayla işle; "+++ " satırı yalnızca dosya adını günceller.', 'Silinen (-) satırlar ve bağlam (boşlukla başlayan) satırları yok say.', 'Üç deseni bir listeye koy ve any(d.search(metin) ...) kullan.'],
       why='Gizli bilgi taraması yalnızca eklenen satırlara odaklanmalı: silinen eski parola zaten geçmiştedir (onun için anahtar iptal edilir), ortam değişkeninden okuma ise güvenli bir kalıptır. gitleaks, detect-secrets gibi araçlar bu fikri yüzlerce desenle uygular ve pre-commit kancasına bağlanır.'),
  dict(t='code', stage='Kendin yaz', id='git-proje-yapisi-x5', diff=2,
       q='<p><code>git log --format="%h|%an|%ad|%s" --date=short</code> çıktısını işleyen <code>yazar_ozeti(log)</code> fonksiyonunu yaz. Her yazar için <code>{"commit": sayı, "ilk": "YYYY-AA-GG", "son": "YYYY-AA-GG"}</code> içeren bir sözlük döndürsün (yazar adına göre sözlük). Mesaj (<code>%s</code>) içinde de <code>|</code> geçebilir; yalnızca ilk üç <code>|</code>\'den böl. Boş satırları atla.</p>',
       start=d('''
           def yazar_ozeti(log):
               pass
       '''),
       sol=d('''
           def yazar_ozeti(log):
               ozet = {}
               for satir in log.splitlines():
                   if not satir.strip():
                       continue
                   _, yazar, tarih, _ = satir.split("|", 3)
                   o = ozet.setdefault(yazar, {"commit": 0, "ilk": tarih, "son": tarih})
                   o["commit"] += 1
                   o["ilk"] = min(o["ilk"], tarih)
                   o["son"] = max(o["son"], tarih)
               return ozet
       '''),
       tests=d('''
           _l = "a1|Ayşe Yılmaz|2026-03-15|feat: rapor | özet\\nb2|Can Demir|2026-03-10|fix: kdv\\n\\nc3|Ayşe Yılmaz|2026-02-01|docs: readme\\nd4|Ayşe Yılmaz|2026-03-01|test: x\\n"
           _o = yazar_ozeti(_l)
           assert _o == {"Ayşe Yılmaz": {"commit": 3, "ilk": "2026-02-01", "son": "2026-03-15"}, "Can Demir": {"commit": 1, "ilk": "2026-03-10", "son": "2026-03-10"}}, f"yanlış: {_o}"
           assert yazar_ozeti("") == {}, "boş log"
       '''),
       hints=['split("|", 3) en fazla 4 parça üretir; mesajdaki | korunur.', 'ISO tarih metinleri (YYYY-AA-GG) min/max ile doğru karşılaştırılır.'],
       why='Git\'in --format seçeneği çıktıyı makine dostu yapar; ayırıcı içeriğin içinde de geçebileceği için bölme sayısını sınırlamak gerekir. ISO tarih biçimi sayesinde metin karşılaştırması kronolojik sonuç verir.'),
  dict(t='code', stage='Hata avı', kind='bug', id='git-proje-yapisi-x6', diff=2,
       q='<p>Yeni proje iskeleti oluşturan <code>iskelet_dosyalari(paket)</code> fonksiyonu, kök <code>.gitignore</code> ve <code>.gitattributes</code> içeriklerini üretiyor. Ama ekip şikâyetçi: <code>.env</code> dosyaları depoya giriyor, <code>.env.example</code> ise hiç girmiyor; Windows\'tan gelen dosyalarda da satır sonu farkı devam ediyor. <b>Hataları bul ve düzelt.</b> Beklenen: <code>.env</code> ve <code>.env.*</code> yok sayılsın ama <code>.env.example</code> izlensin (istisna, ilgili kuraldan <b>sonra</b> gelmeli); <code>.gitattributes</code> ilk satırı <code>* text=auto eol=lf</code> olsun.</p>',
       start=d('''
           def iskelet_dosyalari(paket):
               gitignore = "\\n".join([
                   ".venv/",
                   "__pycache__/",
                   "!.env.example",
                   ".env*",
                   "*.log",
               ]) + "\\n"
               gitattributes = "* text=auto eol=crlf\\n*.bat text eol=crlf\\n"
               return {".gitignore": gitignore, ".gitattributes": gitattributes, f"src/{paket}/__init__.py": ""}
       '''),
       sol=d('''
           def iskelet_dosyalari(paket):
               gitignore = "\\n".join([
                   ".venv/",
                   "__pycache__/",
                   ".env",
                   ".env.*",
                   "!.env.example",
                   "*.log",
               ]) + "\\n"
               gitattributes = "* text=auto eol=lf\\n*.bat text eol=crlf\\n"
               return {".gitignore": gitignore, ".gitattributes": gitattributes, f"src/{paket}/__init__.py": ""}
       '''),
       tests=d('''
           from fnmatch import fnmatch as _fn
           def _yok(yol, kurallar):
               s = False
               for k in kurallar:
                   ist = k.startswith("!")
                   if _fn(yol, k[1:] if ist else k):
                       s = not ist
               return s
           _i = iskelet_dosyalari("anadolu_rapor")
           _k = [x for x in _i[".gitignore"].splitlines() if x and not x.endswith("/")]
           assert _yok(".env", _k), ".env yok sayılmalı"
           assert _yok(".env.prod", _k), ".env.prod yok sayılmalı"
           assert not _yok(".env.example", _k), ".env.example izlenmeli (istisna kuraldan sonra gelmeli)"
           assert _i[".gitattributes"].splitlines()[0] == "* text=auto eol=lf", "depoda satır sonu LF olmalı"
           assert "src/anadolu_rapor/__init__.py" in _i, "paket klasörü korunmalı"
       '''),
       hints=['.gitignore\'da son eşleşen kural kazanır.', 'İstisna (!) kendisini ezecek kuraldan önce yazılırsa etkisiz kalır.', 'Ekip genelinde depoda LF tutulur; yalnızca .bat gibi Windows betikleri CRLF.'],
       why='Git kuralları yukarıdan aşağı uygular ve son eşleşen kazanır; bu yüzden "!.env.example" ".env.*" kuralından sonra gelmelidir. Depoda tek bir satır sonu (LF) tutmak platformlar arası gürültülü diff\'leri bitirir.'),
  dict(t='code', stage='Hata avı', kind='bug', id='git-proje-yapisi-x7', diff=2,
       q='<p>PR kontrol aracı, değişen dosyaları <code>git status --porcelain</code> çıktısından okuyor ve yalnızca <b>Python dosyalarını</b> lint\'e gönderiyor. Ama yeniden adlandırılan dosyalar (<code>R  eski.py -&gt; yeni.py</code>) ve adında boşluk olan dosyalar bozuk geliyor, silinen dosyalar (<code>D</code>) da lint\'e gönderilip araç çöküyor. <code>lint_listesi(porcelain)</code> fonksiyonundaki <b>hataları bul ve düzelt</b>: yeniden adlandırmada yeni ad alınmalı, silinenler atlanmalı, sonuç sıralı ve tekrarsız olmalı.</p>',
       start=d('''
           def lint_listesi(porcelain):
               dosyalar = []
               for satir in porcelain.splitlines():
                   yol = satir.split()[1]
                   if yol.endswith(".py"):
                       dosyalar.append(yol)
               return dosyalar
       '''),
       sol=d('''
           def lint_listesi(porcelain):
               dosyalar = set()
               for satir in porcelain.splitlines():
                   if not satir.strip():
                       continue
                   durum, yol = satir[:2], satir[3:]
                   if "D" in durum:
                       continue
                   if " -> " in yol:
                       yol = yol.split(" -> ", 1)[1]
                   if yol.endswith(".py"):
                       dosyalar.add(yol)
               return sorted(dosyalar)
       '''),
       tests=d('''
           _p = " M src/rapor.py\\nR  src/eski.py -> src/yeni.py\\nD  src/kaldirildi.py\\n?? scripts/gece raporu.py\\nA  README.md\\nMM src/rapor.py\\n"
           assert lint_listesi(_p) == ["scripts/gece raporu.py", "src/rapor.py", "src/yeni.py"], f"yanlış: {lint_listesi(_p)}"
           assert lint_listesi("") == [], "boş çıktı"
       '''),
       hints=['split() boşluklu dosya adını ve "a -> b" biçimini parçalar; sabit konumla kes: satir[:2] durum, satir[3:] yol.', 'Durum kodunda D varsa dosya silinmiştir.', 'Tekrarları kaldırmak için küme, sonda sorted.'],
       why='Porcelain biçimi sabit sütunludur: iki karakter durum, bir boşluk, sonra yol. Boşluklu adlar ve yeniden adlandırma için split yerine konumla kesmek gerekir (gerçek araçlar -z seçeneğiyle NUL ayırıcı kullanır). Silinmiş dosyayı lint\'e vermek "dosya yok" hatasına yol açar.'),
  dict(t='code', stage='Meydan okuma', id='git-proje-yapisi-x8', diff=3,
       q='<p><code>git bisect</code>\'i taklit et: <code>ilk_kotu(commitler, test)</code>. <code>commitler</code> eskiden yeniye sıralı hash listesi; ilk eleman kesin <b>iyi</b>, son eleman kesin <b>kötü</b>. Bir commit kötüleştikten sonra hep kötü kalır. <code>test(hash)</code> commit iyiyse True döndürür. İkili arama ile <b>ilk kötü</b> commit\'in hash\'ini döndür ve testi en fazla <code>ceil(log2(n))</code> kez çağır (ilk ve son elemanı test etme).</p>',
       start=d('''
           def ilk_kotu(commitler, test):
               for c in commitler:
                   if not test(c):
                       return c
       '''),
       sol=d('''
           def ilk_kotu(commitler, test):
               iyi, kotu = 0, len(commitler) - 1
               while kotu - iyi > 1:
                   orta = (iyi + kotu) // 2
                   if test(commitler[orta]):
                       iyi = orta
                   else:
                       kotu = orta
               return commitler[kotu]
       '''),
       tests=d('''
           import math as _m
           for _n in (2, 3, 10, 100, 1000):
               _c = [f"c{i:04d}" for i in range(_n)]
               for _k in sorted({1, _n // 2, _n - 1, max(1, _n // 3)}):
                   _cagri = []
                   def _t(h):
                       _cagri.append(h)
                       return int(h[1:]) < _k
                   _r = ilk_kotu(_c, _t)
                   assert _r == _c[_k], f"n={_n}: ilk kötü {_c[_k]} olmalı, gelen {_r}"
                   assert len(_cagri) <= _m.ceil(_m.log2(_n)), f"n={_n}: {len(_cagri)} test çok fazla; ikili arama kullan"
                   assert _c[0] not in _cagri and _c[-1] not in _cagri, "bilinen iyi/kötü uçlar test edilmemeli"
       '''),
       hints=['İki işaretçi tut: iyi (bilinen son iyi) ve kotu (bilinen ilk kötü).', 'Aralarında commit kaldıkça ortadakini test et ve işaretçiyi ona taşı.', 'Döngü kotu - iyi == 1 olunca biter; cevap commitler[kotu].'],
       why='Kötüleşme tek yönlü olduğu için iyi/kötü sınırı ikili aramayla log2(n) adımda bulunur: 1000 commit\'te en fazla 10 test. git bisect run aynı algoritmayı test komutunun çıkış koduyla otomatik yürütür.'),
]

faq = [
  dict(q='merge mi rebase mi kullanmalıyım?', a='İkisi de değişiklikleri birleştirir. merge geçmişi olduğu gibi korur ve bir birleştirme commit\'i ekler; rebase commit\'lerini hedefin üstüne yeniden yazar ve düz bir geçmiş verir. Pratik kural: kendi yerel dalını güncel tutmak için rebase, paylaşılan dalları birleştirmek için PR üzerinden merge (ya da squash). Başkasının da kullandığı dalı asla rebase etme.'),
  dict(q='Büyük veri dosyalarını ya da modelleri Git\'e koyabilir miyim?', a='Koyma: her sürüm depoya kalıcı olarak girer ve klonlamayı yavaşlatır (GitHub 100 MB üstü dosyayı zaten reddeder). Büyük ikili dosyalar için Git LFS, veri ve model sürümleme için DVC ya da nesne depolama (S3 vb.) kullanılır; depoda yalnızca onları üreten kod ve küçük örnek veri durur.'),
]
mistakes = [
  dict(bad='git reset --hard HEAD~1\ngit push --force   # paylaşılan main dalında', good='git revert HEAD\ngit push', why='Paylaşılan geçmişi yeniden yazmak ekip arkadaşlarının kopyalarını bozar; revert geri almayı yeni bir commit olarak ekler.'),
  dict(bad='# .gitignore\n!.env.example\n.env*', good='# .gitignore\n.env\n.env.*\n!.env.example', why='Son eşleşen kural kazanır; istisna, ezilmemesi için genel kuraldan SONRA yazılmalıdır.'),
]

EXT = dict(id='git-proje-yapisi', min=40, html=html, ex=ex, faq=faq, mistakes=mistakes)
