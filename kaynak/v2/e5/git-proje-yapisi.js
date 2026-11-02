/* Kesit Python — git-proje-yapisi uzantısı (Derinleş) */
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push({
  id: 'git-proje-yapisi',
  min: 40,
  html: `<h2>Derinleş: Git'i gerçekten kullanmak</h2>
<p>Temel akışı (add, commit, dal, PR) ve proje ağacını gördün. İşte ilk haftanda ise şu sorular gelir: "Git'i nasıl kurarım, kimliğimi nasıl tanıtırım?", "Yanlış commit'i nasıl geri alırım?", "Birleştirmede çakışma çıktı, bu &lt;&lt;&lt;&lt;&lt;&lt;&lt; işaretleri ne?", "Windows'ta çalışan arkadaşımın dosyalarında neden her satır değişmiş görünüyor?", "Hangi commit hatayı getirdi?". Bu bölüm bunları yanıtlar ve Git çıktılarını Python'la işleyen küçük araçlar yazdırır. Otomatik kalite kontrolleri (pre-commit, GitHub Actions) <i>kalite-ci</i>, paket sürümleme ve yayımlama <i>paketleme-dagitim</i> dersinde.</p>
<h3>Kurulum ve ilk ayarlar</h3>
<pre class="code"># Windows:  winget install --id Git.Git -e   (ya da git-scm.com; Git Bash da gelir)
# macOS:    xcode-select --install   ya da   brew install git
# Ubuntu:   sudo apt install git     | Fedora: sudo dnf install git
git --version

git config --global user.name "Ayşe Yılmaz"
git config --global user.email "ayse@ilgazbank.example"
git config --global init.defaultBranch main
git config --global pull.rebase true          # pull sırasında gereksiz merge commit'i olmasın
git config --global core.autocrlf true        # yalnız Windows: depoda LF, diskte CRLF
git config --global core.autocrlf input       # macOS/Linux
git config --list --show-origin               # hangi ayar nereden geliyor

# GitHub/GitLab için SSH anahtarı (parola yerine)
ssh-keygen -t ed25519 -C "ayse@ilgazbank.example"
cat ~/.ssh/id_ed25519.pub        # bu satırı GitHub &gt; Settings &gt; SSH keys'e yapıştır
ssh -T git@github.com            # "Hi ayse! You've successfully authenticated"</pre>
<p>Satır sonu farkı (Windows CRLF <code>\\r\\n</code>, Linux/macOS LF <code>\\n</code>) karışık ekiplerde "her satır değişti" görünen diff'lerin bir numaralı nedenidir. Ekip genelinde kalıcı çözüm depo köküne bir <code>.gitattributes</code> koymaktır: <code>* text=auto eol=lf</code> ve <code>*.bat text eol=crlf</code>.</p>
<pre class="py">dosyalar = {
    "src/rapor.py": b"import csv\\nprint('ok')\\n",
    "src/kargo.py": b"UCRET = 45\\r\\nKDV = 0.2\\r\\n",
    "scripts/kur.bat": b"@echo off\\r\\npy -m venv .venv\\r\\n",
    "README.md": b"# Rapor\\r\\nKurulum\\n",
}
for yol, icerik in dosyalar.items():
    crlf = icerik.count(b"\\r\\n")
    lf = icerik.count(b"\\n") - crlf
    tur = "KARIŞIK" if crlf and lf else "CRLF" if crlf else "LF"
    uyari = "" if tur == "LF" or yol.endswith(".bat") else "  &lt;- .gitattributes ile LF'e çevrilmeli"
    print(f"{yol:18} {tur}{uyari}")</pre>
<h3>Geri alma: hangi komut ne zaman?</h3>
<div class="tbl-wrap"><table><tr><th>Durum</th><th>Komut</th><th>Paylaşılmış geçmişte güvenli mi?</th></tr><tr><td>Dosyadaki kaydedilmemiş değişikliği at</td><td><code>git restore dosya</code></td><td>Evet (yerel)</td></tr><tr><td>Yanlışlıkla <code>add</code> ettin</td><td><code>git restore --staged dosya</code></td><td>Evet (yerel)</td></tr><tr><td>Son commit mesajı yanlış / dosya unutuldu</td><td><code>git commit --amend</code></td><td>Yalnız push etmediysen</td></tr><tr><td>Son commit'i geri al, değişiklikler kalsın</td><td><code>git reset --soft HEAD~1</code></td><td>Yalnız push etmediysen</td></tr><tr><td>Push edilmiş commit'i geri al</td><td><code>git revert &lt;hash&gt;</code></td><td>Evet: ters commit üretir</td></tr><tr><td>"Kaybettim" sandığın commit'i bul</td><td><code>git reflog</code></td><td>Evet (yerel kayıt)</td></tr><tr><td>Yarım işi rafa kaldır / geri al</td><td><code>git stash</code> / <code>git stash pop</code></td><td>Evet</td></tr></table></div>
<div class="warn"><b>reset --hard ve push --force</b><code>git reset --hard</code> kaydedilmemiş işi geri dönüşsüz siler. Paylaşılan dalda geçmişi yeniden yazıp <code>push --force</code> yapmak ekip arkadaşlarının işini bozar; zorunluysan <code>--force-with-lease</code> kullan ve önce haber ver. Ana dalda geri almanın yolu her zaman <code>revert</code>'tür.</div>
<h3>Birleştirme çakışması (merge conflict)</h3>
<p>İki dal aynı satırı farklı değiştirdiyse Git karar veremez ve dosyaya işaretler koyar. <code>&lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD</code> ile <code>=======</code> arası senin dalın, <code>=======</code> ile <code>&gt;&gt;&gt;&gt;&gt;&gt;&gt;</code> arası gelen dal. Doğru sonucu elle yazar, işaretleri silersin, sonra <code>git add dosya</code> ve <code>git commit</code> (rebase sırasındaysan <code>git rebase --continue</code>). Vazgeçmek için <code>git merge --abort</code>. İşaretlerin yanlışlıkla commit'lenmemesi için CI'da basit bir kontrol çok işe yarar:</p>
<pre class="py">dosya = """VERGI_ORANI = 0.20
&lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD
KARGO_UCRETI = 45
=======
KARGO_UCRETI = 49.90
&gt;&gt;&gt;&gt;&gt;&gt;&gt; kargo-zammi
PARA_BIRIMI = "TL"
"""

def cakismalar(metin):
    bloklar, durum, bizim, onlarin = [], None, [], []
    for satir in metin.splitlines():
        if satir.startswith("&lt;&lt;&lt;&lt;&lt;&lt;&lt;"):
            durum, bizim, onlarin = "bizim", [], []
        elif satir.startswith("=======") and durum == "bizim":
            durum = "onlarin"
        elif satir.startswith("&gt;&gt;&gt;&gt;&gt;&gt;&gt;") and durum == "onlarin":
            bloklar.append({"bizim": bizim, "onlarin": onlarin, "dal": satir[8:].strip()})
            durum = None
        elif durum == "bizim":
            bizim.append(satir)
        elif durum == "onlarin":
            onlarin.append(satir)
    return bloklar

for b in cakismalar(dosya):
    print(f"main: {b['bizim']}  |  {b['dal']}: {b['onlarin']}")</pre>
<h3>Rebase, etiket ve geçmişte arama</h3>
<p><code>git rebase main</code> dalındaki commit'leri main'in en güncel hâlinin üstüne taşır; geçmiş düz kalır. Kural: yalnızca <b>kendi, paylaşılmamış</b> dalını rebase et. Sürüm yayımlarken <code>git tag -a v1.4.0 -m "Kasım sürümü"</code> ve <code>git push origin v1.4.0</code>. Hatanın hangi commit'le geldiğini bulmak için <code>git bisect</code> ikili arama yapar: iyi ve kötü commit'i söylersin, Git ortadakini açar, sen test edersin; birkaç adımda suçlu bulunur. <code>git blame dosya</code> her satırı son değiştireni, <code>git log -S "KARGO_UCRETI" --oneline</code> o metni ekleyen/silen commit'leri gösterir.</p>
<pre class="code">git log --oneline --graph --all -20       # dalları görsel izle
git log --since="2 weeks" --author="Ayşe" -- src/
git show v1.4.0 --stat
git bisect start; git bisect bad; git bisect good v1.3.0
git bisect run python -m pytest tests/test_kargo.py   # otomatik ikili arama
git bisect reset</pre>
<p>Git'in "makine dostu" çıktılarını betiklerle işlemek CI ve sürüm otomasyonunun temelidir. <code>git status --porcelain</code> her satırda iki harfli durum kodu verir (<code>M</code> değişti, <code>A</code> eklendi, <code>??</code> izlenmiyor); Conventional Commits (<code>feat:</code>, <code>fix:</code>, <code>feat!:</code>) mesajlarından ise sürüm numarası ve değişiklik günlüğü (CHANGELOG) otomatik üretilir:</p>
<pre class="py">import re

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
        print("\\n".join("- " + x for x in maddeler))</pre>
<div class="tip"><b>README, LICENSE, CHANGELOG</b>İyi bir depoda kökte en az şunlar bulunur: ne işe yaradığını ve nasıl kurulup çalıştırılacağını anlatan <code>README.md</code>, kullanım hakkını belirten <code>LICENSE</code> (şirket içi kodda genellikle "tescilli"), sürüm farklarını anlatan <code>CHANGELOG.md</code>, örnek ayar <code>.env.example</code> ve satır sonu kuralı için <code>.gitattributes</code>.</div>
<div class="note"><b>Gerçek işte</b>Ilgaz Bank'ta ana dal korumalıdır: doğrudan push yasaktır, her değişiklik PR ile gelir, en az bir onay ve yeşil CI gerekir, birleştirme "squash" ile tek commit'e indirilir. Canlıda hata çıkınca önce <code>git revert</code> ile hızla geri dönülür, sonra kök neden ayrı bir dalda düzeltilir. Sürüm etiketleri ve CHANGELOG, Conventional Commits mesajlarından otomatik üretilir; bu yüzden commit mesajı kuralı PR kontrolünde denetlenir.</div>
`,
  ex: [{
      t: 'mc',
      stage: 'Isınma',
      q: 'Ana dala (main) push edilmiş ve ekipçe çekilmiş bir commit hatalı çıktı. Hatalı değişikliği geri almanın en güvenli yolu hangisidir?',
      o: ['git reset --hard HEAD~1 ve git push --force', 'git revert &lt;hash&gt; ve git push', 'git commit --amend ile commit\'i düzeltmek', 'Depoyu silip yeniden klonlamak'],
      a: 1,
      why: 'revert, hatalı commit\'in tersini yapan yeni bir commit ekler; geçmiş yeniden yazılmadığı için ekip arkadaşlarının kopyaları bozulmaz. reset + force push ve amend paylaşılmış geçmişi değiştirir.'
    },
    {
      t: 'mc',
      stage: 'Isınma',
      q: 'Windows kullanan bir ekip arkadaşının PR\'ında yalnızca bir satırı değiştirdiği dosyada Git tüm satırları değişmiş gösteriyor. En olası neden nedir?',
      o: ['Dosya UTF-8 değil, UTF-16 kaydedilmiş', 'Satır sonları LF yerine CRLF olmuş', 'Dosya izinleri (chmod) değişmiş', 'Git önbelleği bozulmuş'],
      a: 1,
      why: 'Windows editörleri satır sonunu CRLF yazabilir; LF beklenen depoda her satır farklı görünür. .gitattributes içinde "* text=auto eol=lf" ve core.autocrlf ayarı bunu ekip genelinde çözer.'
    }],
  faq: [
    {
      q: 'merge mi rebase mi kullanmalıyım?',
      a: 'İkisi de değişiklikleri birleştirir. merge geçmişi olduğu gibi korur ve bir birleştirme commit\'i ekler; rebase commit\'lerini hedefin üstüne yeniden yazar ve düz bir geçmiş verir. Pratik kural: kendi yerel dalını güncel tutmak için rebase, paylaşılan dalları birleştirmek için PR üzerinden merge (ya da squash). Başkasının da kullandığı dalı asla rebase etme.'
    },
    {
      q: 'Büyük veri dosyalarını ya da modelleri Git\'e koyabilir miyim?',
      a: 'Koyma: her sürüm depoya kalıcı olarak girer ve klonlamayı yavaşlatır (GitHub 100 MB üstü dosyayı zaten reddeder). Büyük ikili dosyalar için Git LFS, veri ve model sürümleme için DVC ya da nesne depolama (S3 vb.) kullanılır; depoda yalnızca onları üreten kod ve küçük örnek veri durur.'
    }
  ],
  mistakes: [
    {
      bad: 'git reset --hard HEAD~1\ngit push --force   # paylaşılan main dalında',
      good: 'git revert HEAD\ngit push',
      why: 'Paylaşılan geçmişi yeniden yazmak ekip arkadaşlarının kopyalarını bozar; revert geri almayı yeni bir commit olarak ekler.'
    },
    {
      bad: '# .gitignore\n!.env.example\n.env*',
      good: '# .gitignore\n.env\n.env.*\n!.env.example',
      why: 'Son eşleşen kural kazanır; istisna, ezilmemesi için genel kuraldan SONRA yazılmalıdır.'
    }
  ]
});
})(window);
