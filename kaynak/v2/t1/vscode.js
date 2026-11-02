/* Kesit Python — v2/t1: vscode */
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push(
{
  id: 'vscode',
  lv: 'temel',
  mod: 'Başlangıç',
  min: 40,
  title: 'VS Code ile Python',
  sum: 'VS Code\'u doğru eklentiler, doğru yorumlayıcı ve venv ile kurar; hata ayıklayıcıyla adım adım ilerler, Ruff/Black ile kaydederken biçimlendirir, ayarları ekiple paylaşırsın.',
  goals: [
    'Python, Pylance, Jupyter ve Ruff eklentilerini kurup proje klasörünü çalışma alanı olarak açabilirim.',
    'Doğru yorumlayıcıyı ve .venv\'i seçer, "could not be resolved" hatasını teşhis edebilirim.',
    'Kesme noktası, F10/F11, Variables ve Watch panelleriyle hata ayıklayabilir, launch.json yazabilirim.',
    'settings.json ile kaydederken biçimlendirmeyi ayarlar, kullanıcı ve çalışma alanı ayarlarını ayırt edebilirim.',
    'Çalışma dizini tuzağını açıklar, betiğe göre yol kurabilirim.'
  ],
  body: `
<h2>Editör değil, çalışma ortamı</h2>
<p><b>Kurulum ve araçlar</b> dersinde VS Code'u kurup ilk betiği çalıştırdın. Bu derste onu gerçek bir Python çalışma ortamına çeviriyoruz: doğru yorumlayıcıyı seçmek, hata ayıklayıcıyla kodun içine girmek, kaydederken otomatik biçimlendirmek ve ayarları ekiple paylaşmak. Bir geliştiricinin günlük verimini en çok etkileyen şey dilin kendisi değil, araçlarını ne kadar iyi kullandığıdır. <code>print</code> ekleyip silerek hata aramak ile bir kesme noktasında durup tüm değişkenleri görmek arasındaki fark, dakikalar ile saniyeler arasındaki farktır.</p>

<h2>Kurulum ve eklentiler</h2>
<p>code.visualstudio.com adresinden işletim sistemine uygun sürümü indir. Windows yükleyicisinde <b>"Add to PATH"</b> ve <b>"Add 'Open with Code' action"</b> kutularını işaretle. macOS'ta uygulamayı Applications'a sürükledikten sonra komut paletinden <b>Shell Command: Install 'code' command in PATH</b> komutunu çalıştır. Böylece terminalde bir klasördeyken <code>code .</code> yazarak o klasörü açabilirsin.</p>
<div class="tbl-wrap"><table>
<tr><th>Eklenti</th><th>Kimlik (ID)</th><th>Ne verir</th></tr>
<tr><td>Python</td><td><code>ms-python.python</code></td><td>Yorumlayıcı seçimi, çalıştırma, test paneli; aşağıdakileri de getirir</td></tr>
<tr><td>Pylance</td><td><code>ms-python.vscode-pylance</code></td><td>Otomatik tamamlama (IntelliSense), tip denetimi, tanıma git</td></tr>
<tr><td>Python Debugger</td><td><code>ms-python.debugpy</code></td><td>Kesme noktası, adım adım çalıştırma</td></tr>
<tr><td>Jupyter</td><td><code>ms-toolsai.jupyter</code></td><td>.ipynb dosyaları ve etkileşimli pencere</td></tr>
<tr><td>Ruff</td><td><code>charliermarsh.ruff</code></td><td>Çok hızlı denetleyici (linter) ve biçimlendirici</td></tr>
<tr><td>Black Formatter</td><td><code>ms-python.black-formatter</code></td><td>Black ile biçimlendirme (Ruff'a alternatif)</td></tr>
</table></div>

<h2>Dosya değil klasör aç</h2>
<p>VS Code'un ayarları, yorumlayıcı seçimi ve hata ayıklama yapılandırması <b>çalışma alanına (workspace)</b>, yani açtığın klasöre bağlıdır. Tek bir .py dosyasını açarsan bunların hiçbiri düzgün çalışmaz. Her zaman <b>File → Open Folder</b> ile proje kökünü aç. Önerilen yapı:</p>
<pre class="code">anadolu-rapor/
├── .venv/                  # sanal ortam (git'e girmez)
├── .vscode/
│   ├── settings.json       # bu projenin ayarları (ekiple paylaşılır)
│   ├── launch.json         # hata ayıklama yapılandırmaları
│   └── extensions.json     # önerilen eklentiler
├── src/rapor/
│   ├── __init__.py
│   └── main.py
├── tests/
│   └── test_main.py
├── veri/siparisler.csv
├── .gitignore
├── pyproject.toml          # ya da requirements.txt
└── README.md</pre>

<h2>Yorumlayıcı seçimi</h2>
<p>VS Code'daki en önemli tek ayar budur. <b>Ctrl+Shift+P</b> (macOS'ta Cmd+Shift+P) ile komut paletini aç, <b>Python: Select Interpreter</b> yaz. Liste; bulunan sistem Python'larını, conda ortamlarını ve proje klasöründeki <code>.venv</code>'i gösterir. <code>.venv</code> içindekini seç; sağ alt köşedeki durum çubuğunda <code>3.12.4 ('.venv': venv)</code> gibi bir yazı görürsün. Listede yoksa "Enter interpreter path..." ile <code>.venv/bin/python</code> (Windows'ta <code>.venv\\Scripts\\python.exe</code>) yolunu elle ver.</p>
<p>Yanlış yorumlayıcı seçiliyse şu belirtileri görürsün: terminalde <code>pip install pandas</code> yapmışsın ama editör <code>Import "pandas" could not be resolved</code> diye sarı dalga çiziyor; ya da Çalıştır düğmesi <code>ModuleNotFoundError</code> veriyor. Paket bir Python'a, editör başka bir Python'a bakıyordur.</p>
<div class="tip"><b>Yeni terminal, otomatik venv</b>Yorumlayıcıyı seçtikten sonra açtığın her entegre terminalde venv otomatik etkinleşir (<code>python.terminal.activateEnvironment</code> ayarı). Windows'ta bu, PowerShell yürütme ilkesine takılabilir; çözümünü <b>Windows'ta Python kurulumu</b> dersinde gördün.</div>

<h2>Çalıştır düğmesi mi, terminal mi?</h2>
<p>Sağ üstteki ▷ düğmesi (Run Python File) seçili yorumlayıcıyla <code>python dosya.py</code> komutunu entegre terminalde çalıştırır. Entegre terminali <b>Ctrl+&#96;</b> ya da View → Terminal ile açarsın. İki yol arasındaki en büyük tuzak <b>çalışma dizinidir (current working directory)</b>: betik <code>open("veri/siparisler.csv")</code> diyorsa, dosya betiğin yanında değil <i>terminalin bulunduğu klasörde</i> aranır. Çalıştır düğmesi varsayılan olarak çalışma alanının kökünden çalıştırır; sen terminalde <code>src/rapor</code> klasörüne girip çalıştırırsan aynı kod <code>FileNotFoundError</code> verir.</p>
<pre class="py">from pathlib import PurePosixPath

betik = PurePosixPath("/home/ayse/anadolu-rapor/src/rapor/main.py")
for cwd in ["/home/ayse/anadolu-rapor", "/home/ayse/anadolu-rapor/src/rapor"]:
    print("cwd'ye göre :", PurePosixPath(cwd) / "veri" / "siparisler.csv")

proje_koku = betik.parent.parent.parent
print("Betiğe göre :", proje_koku / "veri" / "siparisler.csv")</pre>
<p>Gerçek kodda bunu <code>Path(__file__).resolve().parent</code> ile yaparsın: betiğin kendi klasöründen yola çıkan yol, nereden çalıştırılırsa çalıştırılsın aynı dosyayı bulur.</p>

<h2>Hata ayıklayıcı (debugger)</h2>
<p>Satır numarasının soluna tıklayınca (ya da <b>F9</b>) kırmızı bir nokta belirir: <b>kesme noktası (breakpoint)</b>. <b>F5</b> ile hata ayıklamayı başlatınca program o satıra gelince durur ve sol panelde şunları görürsün:</p>
<ul>
<li><b>Variables</b>: o andaki tüm yerel ve küresel değişkenler, iç içe açılabilir listeler ve sözlükler.</li>
<li><b>Watch</b>: izlemek istediğin ifadeler; örneğin <code>len(sepet)</code> ya da <code>toplam &gt; 1000</code>.</li>
<li><b>Call Stack</b>: hangi fonksiyonun hangisini çağırdığı.</li>
<li><b>Debug Console</b>: durduğun yerde istediğin Python ifadesini çalıştırabileceğin konsol.</li>
</ul>
<div class="tbl-wrap"><table>
<tr><th>Tuş</th><th>Eylem</th><th>Ne zaman</th></tr>
<tr><td>F5</td><td>Başlat / devam et (sonraki kesme noktasına kadar)</td><td>Hata ayıklamaya başlarken</td></tr>
<tr><td>F10</td><td>Step Over: satırı çalıştır, fonksiyonun içine girme</td><td>Fonksiyonun doğru çalıştığından eminsen</td></tr>
<tr><td>F11</td><td>Step Into: çağrılan fonksiyonun içine gir</td><td>Hatanın o fonksiyonda olduğundan şüpheleniyorsan</td></tr>
<tr><td>Shift+F11</td><td>Step Out: fonksiyonun sonuna kadar çalıştır, çağırana dön</td><td>Yanlışlıkla içine girdiysen</td></tr>
<tr><td>Shift+F5</td><td>Durdur</td><td>Sorunu buldun</td></tr>
</table></div>
<p>Kesme noktasına sağ tıklayıp <b>koşullu kesme noktası (conditional breakpoint)</b> yapabilirsin: <code>siparis["id"] == "AM-417"</code> koşulu, 10.000 siparişlik döngüde yalnızca sorunlu kayıtta durur. <b>Logpoint</b> ise durmadan mesaj yazdırır; koda <code>print</code> eklemenin temiz hâlidir. Koddan durmak istersen <code>breakpoint()</code> yerleşik fonksiyonunu çağırabilirsin.</p>
<p>Aşağıdaki fonksiyonda bir hata var. Hata ayıklayıcıda <code>for</code> satırına kesme noktası koyup F10 ile ilerlesen, Variables panelinde <code>toplam</code>'ın her turda ne olduğunu görürdün; burada aynı bilgiyi elle yazdırıyoruz:</p>
<pre class="py">def sepet_toplami(sepet, indirim_orani):
    toplam = 0
    for urun in sepet:
        toplam = urun["fiyat"] * urun["adet"]          # hata: += olmalı
        print(f"  [izle] urun={urun['ad']:8} toplam={toplam}")
    return toplam * (1 - indirim_orani)

sepet = [{"ad": "Kalem", "fiyat": 12.5, "adet": 4},
         {"ad": "Defter", "fiyat": 45.0, "adet": 2},
         {"ad": "Silgi", "fiyat": 7.5, "adet": 1}]
print("Sonuç:", sepet_toplami(sepet, 0.1))</pre>
<p>İzleme çıktısı <code>toplam</code>'ın birikmediğini, her turda üzerine yazıldığını hemen gösterir. Hata ayıklayıcı bu "izleme"yi senin yerine, koda dokunmadan yapar.</p>

<h3>launch.json</h3>
<p>Betiğine argüman, ortam değişkeni ya da belirli bir çalışma dizini vermek istiyorsan Run and Debug panelindeki "create a launch.json file" bağlantısıyla <code>.vscode/launch.json</code> oluştur:</p>
<pre class="code">{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Rapor: Ekim 2026",
            "type": "debugpy",
            "request": "launch",
            "module": "rapor.main",
            "args": ["--ay", "2026-10", "--sehir", "İzmir"],
            "cwd": "&#36;{workspaceFolder}",
            "env": {"RAPOR_ORTAM": "test"},
            "console": "integratedTerminal",
            "justMyCode": true
        }
    ]
}</pre>
<p><code>&#36;{workspaceFolder}</code> ve <code>&#36;{file}</code> gibi değişkenler VS Code tarafından doldurulur. <code>justMyCode: true</code>, adım adım ilerlerken pandas gibi kütüphanelerin içine girmeni engeller.</p>

<h2>Biçimlendirme ve denetim: Ruff, Black</h2>
<p>Biçimlendirici (formatter) kodunu tek tip bir stile sokar: girintiler, boşluklar, satır uzunluğu, tırnaklar. Ekipte "virgülden sonra boşluk" tartışması biter. <b>Ruff</b> hem biçimlendirici hem denetleyicidir (kullanılmayan içe aktarma, tanımsız ad gibi hataları yakalar) ve çok hızlıdır. <b>Black</b> uzun süredir standart biçimlendiricidir; Ruff'ın biçimlendiricisi Black ile büyük ölçüde uyumludur. Birini seç, ikisini birden biçimlendirici yapma.</p>
<p>Ayarlar <code>settings.json</code> dosyasında JSON olarak tutulur. Komut paletinden <b>Preferences: Open Workspace Settings (JSON)</b> projeye özel dosyayı açar:</p>
<pre class="code">{
    // Python dosyaları için
    "[python]": {
        "editor.defaultFormatter": "charliermarsh.ruff",
        "editor.formatOnSave": true,
        "editor.codeActionsOnSave": {
            "source.organizeImports": "explicit"
        }
    },
    "python.defaultInterpreterPath": "&#36;{workspaceFolder}/.venv/bin/python",
    "python.analysis.typeCheckingMode": "basic",
    "python.testing.pytestEnabled": true,
    "editor.rulers": [88],
    "files.trimTrailingWhitespace": true,
}</pre>
<p>Bu dosya aslında <b>JSONC</b>'dir (yorumlu JSON): <code>//</code> yorumlarına ve sondaki virgüle izin verir. Python'ın <code>json</code> modülü ikisini de kabul etmez. Ayar dosyasını bir betikle okumak ya da üretmek istersen bu farkı bilmen gerekir:</p>
<pre class="py">import json, re

ayar_metni = """{
    // Python dosyaları için
    "[python]": {"editor.formatOnSave": true},
    "editor.rulers": [88, 120],
}"""

satirlar = [s for s in ayar_metni.splitlines() if not s.strip().startswith("//")]
temiz = re.sub(r",\\s*([}\\]])", r"\\1", "\\n".join(satirlar))
ayarlar = json.loads(temiz)
print(ayarlar["[python]"]["editor.formatOnSave"], ayarlar["editor.rulers"])

ayarlar["editor.rulers"] = [88]
print(json.dumps(ayarlar, indent=4, ensure_ascii=False))</pre>
<p>Dikkat: Python'daki <code>True</code>, JSON'da <code>true</code> olur; <code>json.dumps</code> bu çeviriyi senin yerine yapar. Ayar dosyasını f-string ile elle birleştirmek geçersiz JSON üretir.</p>
<h3>Ayar katmanları</h3>
<p>VS Code ayarları katmanlıdır: varsayılanlar → <b>kullanıcı (User)</b> ayarları (tüm projeler) → <b>çalışma alanı (Workspace)</b> ayarları (<code>.vscode/settings.json</code>). Sonraki katman öncekini ezer. Kişisel tercihlerin (yazı tipi, tema) kullanıcı ayarına, projenin kuralları (biçimlendirici, satır uzunluğu, yorumlayıcı yolu) çalışma alanı ayarına gider ve git'e eklenir.</p>

<h2>IntelliSense ve tip ipuçları</h2>
<p>Pylance kodunu yazarken analiz eder: nokta koyunca metotları önerir, fonksiyon imzasını gösterir, <b>F12</b> ile tanıma gider, <b>F2</b> ile bir adı tüm projede yeniden adlandırır. Önerilerin kalitesi <b>tip ipuçlarına (type hints)</b> bağlıdır. Parametrenin <code>list[dict]</code> olduğunu yazarsan Pylance döngüdeki elemanın sözlük olduğunu bilir; <code>typeCheckingMode: "basic"</code> açıksa yanlış türde argümanı kırmızıyla işaretler.</p>
<pre class="py">def indirimli_fiyat(fiyat: float, oran: float = 0.1) -&gt; float:
    """Anadolu Market kampanya fiyatı."""
    return round(fiyat * (1 - oran), 2)

print(indirimli_fiyat(1499.90))
print(indirimli_fiyat.__annotations__)
print(indirimli_fiyat.__doc__)</pre>
<p>Tip ipuçları çalışma zamanında zorunlu değildir; Python onları yalnızca <code>__annotations__</code>'ta saklar. Ama editör ve denetim araçları için altın değerindedir. Fare imlecini fonksiyon adının üzerine getirince görünen açıklama da belge dizesinden (docstring) gelir.</p>

<h2>Kısayollar</h2>
<div class="tbl-wrap"><table>
<tr><th>Eylem</th><th>Windows / Linux</th><th>macOS</th></tr>
<tr><td>Komut paleti</td><td>Ctrl+Shift+P</td><td>Cmd+Shift+P</td></tr>
<tr><td>Dosyaya hızlı git</td><td>Ctrl+P</td><td>Cmd+P</td></tr>
<tr><td>Entegre terminal</td><td>Ctrl+&#96;</td><td>Ctrl+&#96;</td></tr>
<tr><td>Belgeyi biçimlendir</td><td>Shift+Alt+F</td><td>Shift+Option+F</td></tr>
<tr><td>Satırı yorum yap / aç</td><td>Ctrl+/</td><td>Cmd+/</td></tr>
<tr><td>Tanıma git / yeniden adlandır</td><td>F12 / F2</td><td>F12 / F2</td></tr>
<tr><td>Seçimi Python terminalinde çalıştır</td><td>Shift+Enter</td><td>Shift+Enter</td></tr>
<tr><td>Hata ayıklamadan çalıştır</td><td>Ctrl+F5</td><td>Ctrl+F5</td></tr>
<tr><td>Çoklu imleç</td><td>Alt+Tık</td><td>Option+Tık</td></tr>
</table></div>

<h2>Başka editörler</h2>
<div class="tbl-wrap"><table>
<tr><th>Araç</th><th>Güçlü yanı</th><th>Zayıf yanı</th><th>Kime uygun</th></tr>
<tr><td>VS Code</td><td>Ücretsiz, hafif, her dil, dev eklenti ekosistemi, uzaktan geliştirme</td><td>Kurulum ve ayar gerektirir</td><td>Çoğu geliştirici ve analist</td></tr>
<tr><td>PyCharm</td><td>Python'a özel derin analiz, güçlü yeniden düzenleme (refactoring), hazır test ve veritabanı araçları</td><td>Ağır; bazı özellikler ücretli</td><td>Büyük Python projeleri, Django</td></tr>
<tr><td>Thonny</td><td>Yeni başlayanlar için; ifadelerin adım adım nasıl hesaplandığını gösterir</td><td>Büyük projeler için yetersiz</td><td>İlk haftalar, eğitim</td></tr>
<tr><td>IDLE</td><td>Python ile birlikte gelir, kurulum yok</td><td>Çok temel</td><td>Hızlı deneme, kısıtlı bilgisayar</td></tr>
<tr><td>Spyder</td><td>MATLAB/RStudio benzeri, değişken gezgini</td><td>Genel yazılım geliştirmede sınırlı</td><td>Bilimsel hesaplama, Anaconda kullanıcıları</td></tr>
<tr><td>JupyterLab</td><td>Hücre hücre keşif, grafik ve tablo çıktısı</td><td>Uzun kod ve test için uygun değil</td><td>Veri analizi; <b>Jupyter ve Colab</b> dersinde</td></tr>
</table></div>

<div class="note"><b>Gerçek işte</b>Ilgaz Bank'ın veri ekibinde yeni gelen biri depoyu klonlayıp VS Code'da açtığında sağ altta "Bu depo için önerilen eklentileri kurmak ister misiniz?" bildirimi çıkar; bu, <code>.vscode/extensions.json</code> dosyasının işidir. Ardından <code>settings.json</code> yorumlayıcıyı <code>.venv</code>'e, biçimlendiriciyi Ruff'a ayarlar ve herkes aynı stille kaydeder. Kod incelemelerinde (code review) "buraya boşluk koy" yorumları kaybolur; tartışma mantığa odaklanır. Ekip ayrıca <code>launch.json</code>'a "Günlük rapor (test verisi)" gibi hazır hata ayıklama yapılandırmaları koyar; böylece yeni gelen kişi ilk gün F5 ile sistemi uçtan uca çalıştırabilir.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Hata ayıklayıcı nasıl çalışır?</h3>
<p>Python, her satır çalışmadan önce haber veren bir izleme (trace) mekanizmasına sahiptir. Hata ayıklayıcılar bu kancayı (Python 3.12 ile gelen daha hızlı <code>sys.monitoring</code> arayüzünü ya da klasik <code>sys.settrace</code>'i) kullanarak kesme noktasındaki satıra gelince programı durdurur. Küçük bir izleyiciyle bunu kendin görebilirsin:</p>
<pre class="py">import sys

def izleyici(cerceve, olay, arg):
    if olay == "line" and cerceve.f_code.co_name == "faiz":
        yereller = {k: v for k, v in cerceve.f_locals.items()}
        print(f"satır {cerceve.f_lineno}: {yereller}")
    return izleyici

def faiz(anapara, oran, yil):
    tutar = anapara
    for _ in range(yil):
        tutar = tutar * (1 + oran)
    return round(tutar, 2)

sys.settrace(izleyici)
sonuc = faiz(10000, 0.4, 2)
sys.settrace(None)
print("Sonuç:", sonuc)</pre>
<h3>Uzaktan geliştirme</h3>
<p><b>Remote - SSH</b> eklentisiyle bir sunucudaki klasörü kendi bilgisayarındaymış gibi açarsın; kod sunucuda çalışır, sen yerel editörü kullanırsın. <b>WSL</b> eklentisi Windows'ta Linux ortamını, <b>Dev Containers</b> ise projeyi bir Docker konteynerinin içinde açar. Dev Containers ile <code>.devcontainer/devcontainer.json</code> dosyası Python sürümünü, eklentileri ve ayarları tanımlar; ekipteki herkes birebir aynı ortamda çalışır.</p>
<h3>Testleri editörden çalıştırmak</h3>
<p><code>python.testing.pytestEnabled</code> açıkken Test panelinde tüm testler ağaç olarak görünür; tek bir testin yanındaki düğmeyle onu çalıştırabilir ya da hata ayıklayıcıyla içine girebilirsin. Test yazmayı <b>Test yazma</b> dersinde göreceksin.</p>
</section>
`,
  ex: [{
      t: 'mc',
      stage: 'Isınma',
      q: 'Terminalde <code>pip install pandas</code> başarıyla bitti. Ama VS Code editörde <code>import pandas</code> satırının altını çizip <code>Import "pandas" could not be resolved</code> diyor. En olası neden ne?',
      o: [
        'pandas paketi bozuk kurulmuş, kaldırıp yeniden kurmak gerekir',
        'Editörde seçili yorumlayıcı, pip\'in kurduğu Python\'dan farklı',
        'Pylance yalnız standart kütüphaneyi tanır, dış paketleri hiç görmez',
        'Dosya .py uzantısıyla kaydedilmediği için içe aktarma çözülemiyor'
      ],
      a: 1,
      why: 'Paket bir Python ortamına (ör. .venv) kuruldu, VS Code ise başka bir yorumlayıcıya (ör. sistem Python\'ı) bakıyor. Python: Select Interpreter ile .venv\'i seçince uyarı kaybolur. Pylance dış paketleri seçili ortamdan okur.'
    },
    {
      t: 'mc',
      stage: 'Isınma',
      q: 'Hata ayıklayıcı <code>toplam = sepet_toplami(sepet)</code> satırında durdu. <code>sepet_toplami</code> fonksiyonunun içinde neler olduğunu satır satır görmek istiyorsun. Hangi tuşa basarsın?',
      o: ['F10 (Step Over)', 'F11 (Step Into)', 'Shift+F11 (Step Out)', 'Shift+F5 (Stop)'],
      a: 1,
      why: 'Step Into çağrılan fonksiyonun ilk satırına girer. Step Over fonksiyonu tek adımda çalıştırıp sonraki satıra geçer; Step Out içinde olduğun fonksiyondan çıkar; Shift+F5 oturumu durdurur.'
    },
    {
      t: 'mc',
      stage: 'Isınma',
      q: 'Kullanıcı ayarlarında <code>"editor.formatOnSave": false</code>, projenin <code>.vscode/settings.json</code> dosyasında <code>"editor.formatOnSave": true</code> yazıyor. O projede bir dosyayı kaydedince ne olur?',
      o: [
        'Biçimlendirilmez; kullanıcı ayarı kişisel olduğu için her zaman kazanır',
        'Biçimlendirilir; çalışma alanı ayarı kullanıcı ayarını ezer',
        'VS Code çakışma olduğunu söyleyip hangisini istediğini sorar',
        'İki ayar çeliştiği için ikisi de yok sayılır ve varsayılan kullanılır'
      ],
      a: 1,
      why: 'Ayar katmanları sırasıyla varsayılan → kullanıcı → çalışma alanıdır ve daha özel katman kazanır. Bu sayede proje kuralları (biçimlendirme, satır uzunluğu) herkeste aynı uygulanır.'
    }],
  faq: [
    {
      q: 'Ruff mu Black mı?',
      a: 'Yeni projede Ruff: hem biçimlendirir hem denetler ve çok hızlıdır. Ekip zaten Black kullanıyorsa ona uy; ikisinin çıktısı büyük ölçüde aynıdır. Önemli olan herkesin aynı aracı aynı ayarla kullanmasıdır.'
    },
    {
      q: '.vscode klasörünü git\'e eklemeli miyim?',
      a: 'settings.json (proje kuralları), extensions.json ve launch.json genellikle eklenir. Kişisel tercihler (tema, yazı tipi) kullanıcı ayarına gider. Mutlak kişisel yollar ya da gizli bilgiler (parola, token) asla bu dosyalara yazılmaz.'
    },
    {
      q: 'Çalıştır düğmesi ile F5 arasındaki fark ne?',
      a: 'Çalıştır düğmesi (ve Ctrl+F5) programı hata ayıklayıcı olmadan çalıştırır; kesme noktaları yok sayılır. F5 hata ayıklayıcıyı bağlar, kesme noktalarında durur ve launch.json yapılandırmasını kullanır.'
    },
    {
      q: 'VS Code yavaşladı, ne yapmalıyım?',
      a: 'Büyük klasörleri (.venv, veri, node_modules) analizden çıkar: files.watcherExclude ve python.analysis.exclude ayarları. Kullanmadığın eklentileri devre dışı bırak; komut paletindeki "Developer: Show Running Extensions" hangisinin yavaş olduğunu gösterir.'
    }
  ],
  mistakes: [
    {
      bad: 'with open("veri/siparisler.csv") as f:\n    ...',
      good: 'from pathlib import Path\nKOK = Path(__file__).resolve().parent\nwith open(KOK / "veri" / "siparisler.csv", encoding="utf-8") as f:\n    ...',
      why: 'Göreli yol, terminalin bulunduğu klasöre göre çözülür; Çalıştır düğmesi ile terminal farklı klasörden başlatabilir. Betiğin klasörüne dayalı yol her yerden aynı dosyayı bulur.'
    },
    {
      bad: 'metin = "{" + f\'"editor.formatOnSave": {True}\' + "}"',
      good: 'import json\nmetin = json.dumps({"editor.formatOnSave": True}, indent=4)',
      why: 'Elle birleştirilen metin Python temsilini (True) yazar; JSON\'da true olmalıdır. json.dumps tür ve kaçış çevirisini doğru yapar.'
    },
    {
      bad: 'pip install pandas   # VS Code\'da hâlâ "could not be resolved"',
      good: '# Ctrl+Shift+P → Python: Select Interpreter → .venv\npython -m pip install pandas',
      why: 'Paket ve editör farklı Python\'lara bakıyordur. Önce editörde yorumlayıcıyı seç, sonra o ortamın terminalinde python -m pip ile kur.'
    },
    {
      bad: 'print("burada", x)\nprint("burada2", toplam)\n# ...hata bulununca hepsini silmek',
      good: '# for satırına kesme noktası (F9), F5 ile başlat,\n# Variables/Watch panelinde x ve toplamı izle',
      why: 'print ile hata ayıklamak kodu kirletir, unutulan printler üretime gider. Kesme noktası ve logpoint koda dokunmadan aynı bilgiyi verir.'
    }
  ]
}
);
})(window);
