import sys; sys.path.insert(0, '/tmp/claude-0/-home-claude/6c066959-3fcb-54bb-bdf1-c8ae148dfc4c/scratchpad/t1gen')
from t1lib import emit

BODY = r'''
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
<p>VS Code'daki en önemli tek ayar budur. <b>Ctrl+Shift+P</b> (macOS'ta Cmd+Shift+P) ile komut paletini aç, <b>Python: Select Interpreter</b> yaz. Liste; bulunan sistem Python'larını, conda ortamlarını ve proje klasöründeki <code>.venv</code>'i gösterir. <code>.venv</code> içindekini seç; sağ alt köşedeki durum çubuğunda <code>3.12.4 ('.venv': venv)</code> gibi bir yazı görürsün. Listede yoksa "Enter interpreter path..." ile <code>.venv/bin/python</code> (Windows'ta <code>.venv\Scripts\python.exe</code>) yolunu elle ver.</p>
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
            "cwd": "${workspaceFolder}",
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
    "python.defaultInterpreterPath": "${workspaceFolder}/.venv/bin/python",
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
temiz = re.sub(r",\s*([}\]])", r"\1", "\n".join(satirlar))
ayarlar = json.loads(temiz)
print(ayarlar["[python]"]["editor.formatOnSave"], ayarlar["editor.rulers"])

ayarlar["editor.rulers"] = [88]
print(json.dumps(ayarlar, indent=4, ensure_ascii=False))</pre>
<p>Dikkat: Python'daki <code>True</code>, JSON'da <code>true</code> olur; <code>json.dumps</code> bu çeviriyi senin yerine yapar. Ayar dosyasını f-string ile elle birleştirmek geçersiz JSON üretir.</p>
<h3>Ayar katmanları</h3>
<p>VS Code ayarları katmanlıdır: varsayılanlar → <b>kullanıcı (User)</b> ayarları (tüm projeler) → <b>çalışma alanı (Workspace)</b> ayarları (<code>.vscode/settings.json</code>). Sonraki katman öncekini ezer. Kişisel tercihlerin (yazı tipi, tema) kullanıcı ayarına, projenin kuralları (biçimlendirici, satır uzunluğu, yorumlayıcı yolu) çalışma alanı ayarına gider ve git'e eklenir.</p>

<h2>IntelliSense ve tip ipuçları</h2>
<p>Pylance kodunu yazarken analiz eder: nokta koyunca metotları önerir, fonksiyon imzasını gösterir, <b>F12</b> ile tanıma gider, <b>F2</b> ile bir adı tüm projede yeniden adlandırır. Önerilerin kalitesi <b>tip ipuçlarına (type hints)</b> bağlıdır. Parametrenin <code>list[dict]</code> olduğunu yazarsan Pylance döngüdeki elemanın sözlük olduğunu bilir; <code>typeCheckingMode: "basic"</code> açıksa yanlış türde argümanı kırmızıyla işaretler.</p>
<pre class="py">def indirimli_fiyat(fiyat: float, oran: float = 0.1) -> float:
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

<div class="note"><b>Gerçek işte</b>Anadolu Bank'ın veri ekibinde yeni gelen biri depoyu klonlayıp VS Code'da açtığında sağ altta "Bu depo için önerilen eklentileri kurmak ister misiniz?" bildirimi çıkar; bu, <code>.vscode/extensions.json</code> dosyasının işidir. Ardından <code>settings.json</code> yorumlayıcıyı <code>.venv</code>'e, biçimlendiriciyi Ruff'a ayarlar ve herkes aynı stille kaydeder. Kod incelemelerinde (code review) "buraya boşluk koy" yorumları kaybolur; tartışma mantığa odaklanır. Ekip ayrıca <code>launch.json</code>'a "Günlük rapor (test verisi)" gibi hazır hata ayıklama yapılandırmaları koyar; böylece yeni gelen kişi ilk gün F5 ile sistemi uçtan uca çalıştırabilir.</div>

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
'''

EX = [
  { 't': 'mc', 'stage': 'Isınma',
    'q': 'Terminalde <code>pip install pandas</code> başarıyla bitti. Ama VS Code editörde <code>import pandas</code> satırının altını çizip <code>Import "pandas" could not be resolved</code> diyor. En olası neden ne?',
    'o': ['pandas paketi bozuk kurulmuş, kaldırıp yeniden kurmak gerekir',
          'Editörde seçili yorumlayıcı, pip\'in kurduğu Python\'dan farklı',
          'Pylance yalnız standart kütüphaneyi tanır, dış paketleri hiç görmez',
          'Dosya .py uzantısıyla kaydedilmediği için içe aktarma çözülemiyor'],
    'a': 1,
    'why': 'Paket bir Python ortamına (ör. .venv) kuruldu, VS Code ise başka bir yorumlayıcıya (ör. sistem Python\'ı) bakıyor. Python: Select Interpreter ile .venv\'i seçince uyarı kaybolur. Pylance dış paketleri seçili ortamdan okur.' },
  { 't': 'mc', 'stage': 'Isınma',
    'q': 'Hata ayıklayıcı <code>toplam = sepet_toplami(sepet)</code> satırında durdu. <code>sepet_toplami</code> fonksiyonunun içinde neler olduğunu satır satır görmek istiyorsun. Hangi tuşa basarsın?',
    'o': ['F10 (Step Over)', 'F11 (Step Into)', 'Shift+F11 (Step Out)', 'Shift+F5 (Stop)'],
    'a': 1,
    'why': 'Step Into çağrılan fonksiyonun ilk satırına girer. Step Over fonksiyonu tek adımda çalıştırıp sonraki satıra geçer; Step Out içinde olduğun fonksiyondan çıkar; Shift+F5 oturumu durdurur.' },
  { 't': 'mc', 'stage': 'Isınma',
    'q': 'Kullanıcı ayarlarında <code>"editor.formatOnSave": false</code>, projenin <code>.vscode/settings.json</code> dosyasında <code>"editor.formatOnSave": true</code> yazıyor. O projede bir dosyayı kaydedince ne olur?',
    'o': ['Biçimlendirilmez; kullanıcı ayarı kişisel olduğu için her zaman kazanır',
          'Biçimlendirilir; çalışma alanı ayarı kullanıcı ayarını ezer',
          'VS Code çakışma olduğunu söyleyip hangisini istediğini sorar',
          'İki ayar çeliştiği için ikisi de yok sayılır ve varsayılan kullanılır'],
    'a': 1,
    'why': 'Ayar katmanları sırasıyla varsayılan → kullanıcı → çalışma alanıdır ve daha özel katman kazanır. Bu sayede proje kuralları (biçimlendirme, satır uzunluğu) herkeste aynı uygulanır.' },

  { 't': 'predict', 'stage': 'Kodu oku', 'q': 'settings.json üreten bu kod ne yazdırır?',
    'code': 'import json\nayar = {"editor.formatOnSave": True, "editor.rulers": [88]}\nprint(json.dumps(ayar))\n',
    'o': ['{"editor.formatOnSave": True, "editor.rulers": [88]}',
          '{\'editor.formatOnSave\': True, \'editor.rulers\': [88]}',
          '{"editor.formatOnSave": true, "editor.rulers": [88]}',
          '{"editor.formatOnSave": "true", "editor.rulers": ["88"]}'],
    'a': 2,
    'why': 'json.dumps Python değerlerini JSON karşılıklarına çevirir: True → true, anahtarlar çift tırnaklı. Tek tırnaklı çıktı print(ayar)\'ın (Python temsili) çıktısıdır ve geçersiz JSON\'dur.' },
  { 't': 'predict', 'stage': 'Kodu oku', 'q': 'VS Code ayar katmanlarını taklit eden bu kod ne yazdırır?',
    'code': 'kullanici = {"editor.fontSize": 14, "editor.formatOnSave": False}\ncalisma_alani = {"editor.formatOnSave": True}\netkin = {**kullanici, **calisma_alani}\nprint(etkin["editor.formatOnSave"], len(etkin))\n',
    'o': ['False 2', 'True 3', 'True 2', 'False 3'],
    'a': 2,
    'why': 'Sözlük açma ({**a, **b}) sırasında aynı anahtar ikinci kez gelince değeri güncellenir; sonraki (çalışma alanı) kazanır. Anahtar sayısı artmaz: iki farklı anahtar vardır.' },
  { 't': 'predict', 'stage': 'Kodu oku', 'q': 'Çalışma dizini tuzağı: bu kod ne yazdırır?',
    'code': 'from pathlib import PurePosixPath\nbetik = PurePosixPath("/proje/src/rapor.py")\ncwd = PurePosixPath("/proje")\nprint(cwd / "veri.csv")\nprint(betik.parent / "veri.csv")\n',
    'o': ['/proje/src/veri.csv\n/proje/src/veri.csv', '/proje/veri.csv\n/proje/src/veri.csv', '/proje/veri.csv\n/proje/src/rapor.py/veri.csv', '/proje/veri.csv\n/proje/veri.csv'],
    'a': 1,
    'why': 'Göreli bir dosya adı çalışma dizinine (cwd) göre çözülür; betiğin yeri önemsizdir. betik.parent ise betiğin klasörünü (/proje/src) verir. İkisi farklı olduğu için "bende çalışıyor, düğmeyle çalışmıyor" sorunu doğar.' },
  { 't': 'order', 'stage': 'Kodu oku',
    'q': '<p>Hata ayıklama yapılandırmasını (launch.json) Python ile üreten betiği sırala. Çıktıdaki anahtar sırası, satırların sırasını ele verir.</p>',
    'lines': ['import json',
              'ayar = {"name": "Rapor", "type": "debugpy", "request": "launch"}',
              'ayar["program"] = "${file}"',
              'ayar["args"] = ["--ay", "2026-10"]',
              'launch = {"version": "0.2.0", "configurations": [ayar]}',
              'print(json.dumps(launch))'],
    'expect': '{"version": "0.2.0", "configurations": [{"name": "Rapor", "type": "debugpy", "request": "launch", "program": "${file}", "args": ["--ay", "2026-10"]}]}\n',
    'hint': 'Sözlükler ekleme sırasını korur; program anahtarı args\'tan önce eklenmiş.',
    'why': 'json modülü içe aktarılır, yapılandırma sözlüğü oluşturulup alanları sırayla eklenir, sonra launch sözlüğüne yerleştirilip yazdırılır. Python sözlükleri ekleme sırasını koruduğu için JSON çıktısındaki sıra kodun sırasını yansıtır.' },

  { 't': 'code', 'stage': 'Rehberli', 'id': 'vscode-1', 'diff': 1,
    'q': '<p>Ekibin ayar şablonunu üreten <code>ayarlar_uret(formatlayici, satir_uzunlugu=88)</code> fonksiyonunu yaz. <code>formatlayici</code> <code>"ruff"</code> ya da <code>"black"</code> olabilir (büyük/küçük harf duyarsız); başka değerde <code>ValueError</code> fırlat. Şu sözlüğü döndür:</p><pre>{\n    "[python]": {\n        "editor.defaultFormatter": &lt;eklenti kimliği&gt;,\n        "editor.formatOnSave": True\n    },\n    "editor.rulers": [satir_uzunlugu],\n    "python.terminal.activateEnvironment": True\n}</pre><p>Kimlikler: ruff → <code>"charliermarsh.ruff"</code>, black → <code>"ms-python.black-formatter"</code>.</p>',
    'guide': ['Biçimlendirici adlarını eklenti kimliklerine eşleyen bir sözlük tanımla.', 'formatlayici.lower() sözlükte yoksa ValueError fırlat.', 'İç içe sözlüğü kur: "[python]" anahtarının değeri de bir sözlük.', 'editor.rulers bir liste olmalı: [satir_uzunlugu].'],
    'example': 'RENKLER = {"kirmizi": "#ff0000", "mavi": "#0000ff"}\ndef tema(renk):\n    if renk.lower() not in RENKLER:\n        raise ValueError(renk)\n    return {"[markdown]": {"renk": RENKLER[renk.lower()]}, "kenar": [80]}\nprint(tema("Mavi"))\n',
    'start': 'KIMLIKLER = {\n    # TODO: "ruff" ve "black" için eklenti kimlikleri\n}\n\n\ndef ayarlar_uret(formatlayici, satir_uzunlugu=88):\n    # TODO: bilinmeyen biçimlendiricide ValueError\n    # TODO: iç içe ayar sözlüğünü döndür\n    return {}\n',
    'sol': 'KIMLIKLER = {\n    "ruff": "charliermarsh.ruff",\n    "black": "ms-python.black-formatter",\n}\n\n\ndef ayarlar_uret(formatlayici, satir_uzunlugu=88):\n    ad = formatlayici.lower()\n    if ad not in KIMLIKLER:\n        raise ValueError(f"Bilinmeyen biçimlendirici: {formatlayici}")\n    return {\n        "[python]": {\n            "editor.defaultFormatter": KIMLIKLER[ad],\n            "editor.formatOnSave": True,\n        },\n        "editor.rulers": [satir_uzunlugu],\n        "python.terminal.activateEnvironment": True,\n    }\n',
    'tests': 'import json\nr = ayarlar_uret("ruff")\nassert r["[python]"] == {"editor.defaultFormatter": "charliermarsh.ruff", "editor.formatOnSave": True}, "[python] bölümü Ruff kimliğini ve formatOnSave True içermeli"\nassert r["editor.rulers"] == [88], "Varsayılan satır uzunluğu 88, liste içinde"\nassert r["python.terminal.activateEnvironment"] is True, "Terminalde venv otomatik etkinleşmeli"\nassert ayarlar_uret("Black", 100)["[python]"]["editor.defaultFormatter"] == "ms-python.black-formatter", "Büyük harfli Black de kabul edilmeli"\nassert ayarlar_uret("black", 100)["editor.rulers"] == [100], "satir_uzunlugu parametresi kullanılmalı"\nassert \'"editor.formatOnSave": true\' in json.dumps(r), "Sözlük JSON\'a çevrilebilmeli (True → true)"\ntry:\n    ayarlar_uret("autopep8")\n    assert False, "Bilinmeyen biçimlendiricide ValueError beklenir"\nexcept ValueError:\n    pass\n',
    'hints': ['Eşleme sözlüğü: {"ruff": "charliermarsh.ruff", "black": "ms-python.black-formatter"}', 'if ad not in KIMLIKLER: raise ValueError(...)', '"[python]": {"editor.defaultFormatter": KIMLIKLER[ad], "editor.formatOnSave": True}'],
    'why': 'Ayar şablonunu kodla üretmek, ekipteki tüm projelerin aynı kurallarla başlamasını sağlar. Python sözlüğü doğrudan JSON\'a çevrilebildiği için settings.json\'u elle yazmaya gerek kalmaz.' },
  { 't': 'code', 'stage': 'Rehberli', 'id': 'vscode-2', 'diff': 2,
    'q': '<p>VS Code ayar dosyaları JSONC\'dir: tam satır <code>//</code> yorumları ve kapanış parantezinden önce sondaki virgül içerebilir. <code>jsonc_oku(metin)</code> fonksiyonunu yaz:</p><ul><li>Baş boşlukları atıldığında <code>//</code> ile başlayan satırları çıkar (satır içindeki <code>"https://..."</code> gibi metinlere dokunma).</li><li><code>,</code> ardından yalnız boşluk ve <code>}</code> ya da <code>]</code> geliyorsa virgülü sil.</li><li><code>json.loads</code> ile sözlüğe çevirip döndür.</li></ul>',
    'guide': ['metin.splitlines() ile satırlara ayır; strip().startswith("//") olanları ele.', 'Kalan satırları "\\n".join ile birleştir.', 're.sub(r",\\s*([}\\]])", r"\\1", metin) sondaki virgülleri siler.', 'json.loads ile çözümle ve döndür.'],
    'example': 'import re\nliste_metni = "[1, 2, 3,  ]"\nprint(re.sub(r",\\s*\\]", "]", liste_metni))\nsatirlar = ["# yorum", "a=1", "  # girintili yorum", "b=2"]\nprint([s for s in satirlar if not s.strip().startswith("#")])\n',
    'start': 'import json, re\n\ndef jsonc_oku(metin):\n    # TODO: // ile başlayan satırları çıkar\n    # TODO: sondaki virgülleri sil\n    # TODO: json.loads ile döndür\n    return json.loads(metin)\n',
    'sol': 'import json, re\n\ndef jsonc_oku(metin):\n    satirlar = [s for s in metin.splitlines() if not s.strip().startswith("//")]\n    temiz = "\\n".join(satirlar)\n    temiz = re.sub(r",\\s*([}\\]])", r"\\1", temiz)\n    return json.loads(temiz)\n',
    'tests': 'm = """{\n    // biçimlendirme\n    "[python]": {\n        "editor.formatOnSave": true,\n    },\n        // girintili yorum\n    "editor.rulers": [88, 120,],\n    "json.schemaDownload.enable": false,\n    "workbench.startupEditor": "https://anadolu.example/baslangic",\n}"""\nr = jsonc_oku(m)\nassert r["[python]"] == {"editor.formatOnSave": True}, "İç sözlükteki sondaki virgül silinmeli"\nassert r["editor.rulers"] == [88, 120], "Listedeki sondaki virgül silinmeli"\nassert r["workbench.startupEditor"] == "https://anadolu.example/baslangic", "Metin içindeki // korunmalı: yalnız tam satır yorumlar silinir"\nassert len(r) == 4, "Dört üst düzey anahtar"\nassert jsonc_oku(\'{"a": 1}\') == {"a": 1}, "Temiz JSON olduğu gibi okunmalı"\n',
    'hints': ['Yorum satırlarını filtrelemek için liste üreteci: [s for s in metin.splitlines() if not s.strip().startswith("//")]', 'Düzenli ifade: virgül, ardından sıfır ya da daha çok boşluk (\\s*), ardından } veya ] yakalanır; yerine yalnız parantez konur.', 'temiz = re.sub(r",\\s*([}\\]])", r"\\1", temiz)'],
    'why': 'Tam satır yorumlarını satır bazında silmek, metin içindeki "https://" gibi değerlere dokunmaz; basit bir replace("//", "") URL\'leri bozardı. Düzenli ifadedeki \\s* satır sonlarını da kapsadığı için virgül ile parantez farklı satırlarda olsa da çalışır.' },
  { 't': 'code', 'stage': 'Rehberli', 'id': 'vscode-3', 'diff': 1,
    'q': '<p>VS Code bir klasörü açınca sanal ortamı otomatik bulmaya çalışır. <code>yorumlayici_bul(klasorler, isletim)</code> fonksiyonunu yaz: <code>klasorler</code>, proje kökündeki klasör adlarının kümesidir. Sırayla <code>.venv</code>, <code>venv</code>, <code>env</code> adlarına bak; ilk bulunanın Python yolunu döndür:</p><ul><li><code>isletim == "windows"</code>: <code>&lt;ad&gt;\\Scripts\\python.exe</code></li><li>Diğerleri: <code>&lt;ad&gt;/bin/python</code></li></ul><p>Hiçbiri yoksa <code>None</code>.</p>',
    'guide': ['Aday adları öncelik sırasıyla bir listeye koy.', 'Listede dön; ad klasorler içinde varsa yolu oluştur.', 'Windows\'ta ntpath.join, diğerlerinde posixpath.join kullan.', 'Döngü biterse None döndür.'],
    'example': 'import posixpath\nraflar = {"b-raf", "c-raf"}\nfor aday in ["a-raf", "b-raf", "c-raf"]:\n    if aday in raflar:\n        print("İlk dolu raf:", posixpath.join(aday, "kutu"))\n        break\n',
    'start': 'import ntpath, posixpath\n\nADAYLAR = [".venv", "venv", "env"]\n\n\ndef yorumlayici_bul(klasorler, isletim):\n    # TODO: adaylarda sırayla dön, ilk bulunanın yolunu döndür\n    return None\n',
    'sol': 'import ntpath, posixpath\n\nADAYLAR = [".venv", "venv", "env"]\n\n\ndef yorumlayici_bul(klasorler, isletim):\n    for ad in ADAYLAR:\n        if ad in klasorler:\n            if isletim == "windows":\n                return ntpath.join(ad, "Scripts", "python.exe")\n            return posixpath.join(ad, "bin", "python")\n    return None\n',
    'tests': 'assert yorumlayici_bul({"src", ".venv", "tests"}, "linux") == ".venv/bin/python", "Linux\'ta bin/python"\nassert yorumlayici_bul({"venv", "env"}, "windows") == "venv\\\\Scripts\\\\python.exe", "venv, env\'den önce gelir; Windows\'ta Scripts\\\\python.exe"\nassert yorumlayici_bul({"env", ".venv"}, "macos") == ".venv/bin/python", "Öncelik sırası kümeden bağımsız: .venv önce"\nassert yorumlayici_bul({"src", "docs"}, "linux") is None, "Sanal ortam yoksa None"\n',
    'hints': ['for ad in ADAYLAR: if ad in klasorler: ...', 'ntpath.join(ad, "Scripts", "python.exe") ve posixpath.join(ad, "bin", "python")'],
    'why': 'Küme üyelik testi hızlıdır ama sırası yoktur; önceliği belirleyen, dolaştığın aday listesidir. VS Code da benzer bir arama yapar ve bulduğu ortamı önerir.' },

  { 't': 'code', 'stage': 'Kendin yaz', 'id': 'vscode-4', 'diff': 1,
    'q': '<p>Eğitim dokümanındaki Windows kısayollarını macOS\'a çeviren <code>mac_kisayolu(kisayol)</code> fonksiyonunu yaz. Kısayol <code>+</code> ile ayrılmış tuşlardan oluşur. Basitleştirilmiş kural: <code>Ctrl</code> → <code>Cmd</code>, <code>Alt</code> → <code>Option</code>, diğer tuşlar aynen kalır. Birden çok kısayol virgül ve boşlukla verilebilir (<code>"Ctrl+K, Ctrl+S"</code>); her birini çevir ve aynı biçimde birleştir.</p>',
    'start': 'def mac_kisayolu(kisayol):\n    pass\n',
    'sol': 'ESLEME = {"Ctrl": "Cmd", "Alt": "Option"}\n\n\ndef mac_kisayolu(kisayol):\n    parcalar = []\n    for akor in kisayol.split(", "):\n        tuslar = [ESLEME.get(t, t) for t in akor.split("+")]\n        parcalar.append("+".join(tuslar))\n    return ", ".join(parcalar)\n',
    'tests': 'assert mac_kisayolu("Ctrl+Shift+P") == "Cmd+Shift+P", "Komut paleti"\nassert mac_kisayolu("Shift+Alt+F") == "Shift+Option+F", "Biçimlendirme: Alt → Option"\nassert mac_kisayolu("F5") == "F5", "Tek tuş aynen kalır"\nassert mac_kisayolu("Ctrl+K, Ctrl+S") == "Cmd+K, Cmd+S", "Akor dizisi: her parça ayrı çevrilir"\nassert mac_kisayolu("Ctrl+Alt+Down") == "Cmd+Option+Down", "Birden çok değiştirici tuş"\n',
    'hints': ['Önce ", " ile akorlara, sonra "+" ile tuşlara böl.', 'ESLEME.get(t, t) eşlemede yoksa tuşun kendisini verir.'],
    'why': 'dict.get(anahtar, varsayılan) ile "eşlemede varsa çevir, yoksa aynen bırak" kalıbı tek satırda kurulur. İç içe ayırma (önce akor, sonra tuş) yapılandırılmış metinleri ayrıştırmanın temel tekniğidir.' },
  { 't': 'code', 'stage': 'Kendin yaz', 'id': 'vscode-5', 'diff': 2,
    'q': '<p><code>eksik_eklentiler(extensions_json, kurulu)</code> fonksiyonunu yaz. <code>extensions_json</code>, <code>.vscode/extensions.json</code> içeriğidir (geçerli JSON metni, <code>"recommendations"</code> listesi içerir; anahtar olmayabilir). <code>kurulu</code>, kurulu eklenti kimliklerinin listesidir. Önerilip kurulu olmayanları, <b>önerideki yazımıyla</b> ve alfabetik sırada döndür. Eklenti kimlikleri büyük/küçük harf duyarsızdır; aynı eklenti öneride iki kez geçerse bir kez say.</p>',
    'start': 'import json\n\ndef eksik_eklentiler(extensions_json, kurulu):\n    pass\n',
    'sol': 'import json\n\ndef eksik_eklentiler(extensions_json, kurulu):\n    oneriler = json.loads(extensions_json).get("recommendations", [])\n    kurulu_kucuk = {k.lower() for k in kurulu}\n    eksik = {}\n    for e in oneriler:\n        if e.lower() not in kurulu_kucuk and e.lower() not in eksik:\n            eksik[e.lower()] = e\n    return sorted(eksik.values(), key=str.lower)\n',
    'tests': 'm = \'{"recommendations": ["ms-python.python", "charliermarsh.ruff", "ms-toolsai.jupyter", "MS-Python.vscode-pylance"]}\'\nassert eksik_eklentiler(m, ["ms-python.python", "ms-python.vscode-pylance"]) == ["charliermarsh.ruff", "ms-toolsai.jupyter"], "Kurulu olanlar (harf duyarsız) çıkarılmalı, kalanlar alfabetik"\nassert eksik_eklentiler(m, []) == ["charliermarsh.ruff", "ms-python.python", "MS-Python.vscode-pylance", "ms-toolsai.jupyter"], "Hiçbiri kurulu değil: önerideki yazımla, harf duyarsız alfabetik"\nassert eksik_eklentiler(\'{"recommendations": ["a.b", "A.B"]}\', []) == ["a.b"], "Tekrar eden öneri bir kez sayılır (ilk yazım)"\nassert eksik_eklentiler("{}", ["x.y"]) == [], "recommendations anahtarı yoksa boş liste"\n',
    'hints': ['Kurulu kimlikleri küçük harfli bir kümeye çevir.', 'Tekrarları elemek için küçük harfli anahtar → ilk yazım sözlüğü tut; sorted(..., key=str.lower).'],
    'why': 'Kimlikleri karşılaştırırken normalleştirmek (lower) ama kullanıcıya özgün yazımı göstermek, veri temizliğinde çok sık kullanılan bir kalıptır. Sözlük anahtarı normalleştirilmiş değer, değeri özgün değer olur.' },
  { 't': 'code', 'stage': 'Kendin yaz', 'id': 'vscode-6', 'diff': 2,
    'q': '<p>VS Code ayar katmanlarını birleştiren <code>ayar_birlestir(*katmanlar)</code> fonksiyonunu yaz. Katmanlar soldan sağa uygulanır (varsayılan, kullanıcı, çalışma alanı...); sonraki önceki değeri ezer. <b>İstisna:</b> bir anahtarın hem eski hem yeni değeri sözlükse (ör. <code>"[python]"</code>), iki sözlüğü bir seviye derinlikte birleştir. Girdi sözlüklerini <b>değiştirme</b>; yeni sözlük döndür.</p>',
    'start': 'def ayar_birlestir(*katmanlar):\n    pass\n',
    'sol': 'def ayar_birlestir(*katmanlar):\n    sonuc = {}\n    for katman in katmanlar:\n        for anahtar, deger in katman.items():\n            eski = sonuc.get(anahtar)\n            if isinstance(eski, dict) and isinstance(deger, dict):\n                sonuc[anahtar] = {**eski, **deger}\n            elif isinstance(deger, dict):\n                sonuc[anahtar] = dict(deger)\n            else:\n                sonuc[anahtar] = deger\n    return sonuc\n',
    'tests': 'v = {"editor.tabSize": 4, "[python]": {"editor.formatOnSave": False, "editor.tabSize": 4}}\nk = {"editor.fontSize": 15, "[python]": {"editor.formatOnSave": True}}\nc = {"[python]": {"editor.defaultFormatter": "charliermarsh.ruff"}, "editor.tabSize": 2}\nr = ayar_birlestir(v, k, c)\nassert r["[python]"] == {"editor.formatOnSave": True, "editor.tabSize": 4, "editor.defaultFormatter": "charliermarsh.ruff"}, "[python] bölümleri bir seviye derin birleşmeli"\nassert r["editor.tabSize"] == 2 and r["editor.fontSize"] == 15, "Düz anahtarlarda son katman kazanır"\nassert v["[python]"] == {"editor.formatOnSave": False, "editor.tabSize": 4}, "Girdi sözlükleri değişmemeli"\nr["[python]"]["x"] = 1\nassert "x" not in k["[python]"] and "x" not in c["[python]"], "Sonuçtaki iç sözlük girdilerle paylaşılmamalı (kopya olmalı)"\nassert ayar_birlestir() == {}, "Katman yoksa boş sözlük"\nassert ayar_birlestir({"a": {"b": 1}}, {"a": 5}) == {"a": 5}, "Yeni değer sözlük değilse doğrudan ezer"\n',
    'hints': ['İki sözlüğü birleştirmek için {**eski, **yeni} yeni bir sözlük üretir.', 'Yalnız biri sözlükse ve yeni değer sözlükse dict(deger) ile kopyala; böylece girdiyle aynı nesneyi paylaşmazsın.'],
    'why': 'Sığ birleştirme (dict.update) "[python]" gibi bölümleri bütünüyle ezerdi ve kullanıcının diğer Python ayarları kaybolurdu. Bir seviye derin birleştirme ve kopyalama, VS Code\'un gerçek davranışına yakındır ve yan etki bırakmaz.' },
  { 't': 'code', 'stage': 'Kendin yaz', 'id': 'vscode-7', 'diff': 2,
    'q': '<p>Editörler hata çıktısındaki dosya ve satıra tıklayınca oraya atlar. <code>hata_konumu(traceback_metni)</code> fonksiyonunu yaz: metindeki <b>son</b> <code>File "...", line N</code> kaydını bulsun ve <code>(dosya, satir_no, hata)</code> demeti döndürsün. <code>satir_no</code> int olsun; <code>hata</code>, metnin son boş olmayan satırıdır (ör. <code>"ZeroDivisionError: division by zero"</code>). Hiç <code>File</code> kaydı yoksa <code>None</code>.</p>',
    'start': 'import re\n\ndef hata_konumu(traceback_metni):\n    pass\n',
    'sol': 'import re\n\ndef hata_konumu(traceback_metni):\n    kayitlar = re.findall(r\'File "([^"]+)", line (\\d+)\', traceback_metni)\n    if not kayitlar:\n        return None\n    dosya, satir = kayitlar[-1]\n    satirlar = [s.strip() for s in traceback_metni.splitlines() if s.strip()]\n    return (dosya, int(satir), satirlar[-1])\n',
    'tests': 't = """Traceback (most recent call last):\n  File "/home/ayse/anadolu-rapor/src/rapor/main.py", line 42, in <module>\n    ozet = ortalama(tutarlar)\n  File "/home/ayse/anadolu-rapor/src/rapor/hesap.py", line 7, in ortalama\n    return sum(liste) / len(liste)\n           ~~~~~~~~~~^~~~~~~~~~~~\nZeroDivisionError: division by zero\n"""\nassert hata_konumu(t) == ("/home/ayse/anadolu-rapor/src/rapor/hesap.py", 7, "ZeroDivisionError: division by zero"), "Son kayıt hatanın gerçekten oluştuğu yerdir"\nw = \'Traceback (most recent call last):\\n  File "C:\\\\dev\\\\rapor\\\\main.py", line 3, in <module>\\n    import pandas\\nModuleNotFoundError: No module named \\\'pandas\\\'\\n\\n\'\nassert hata_konumu(w) == ("C:\\\\dev\\\\rapor\\\\main.py", 3, "ModuleNotFoundError: No module named \'pandas\'"), "Windows yolu ve sondaki boş satırlar"\nassert isinstance(hata_konumu(t)[1], int), "Satır numarası int olmalı"\nassert hata_konumu("SyntaxError olmayan düz metin") is None, "File kaydı yoksa None"\n',
    'hints': ['re.findall(r\'File "([^"]+)", line (\\d+)\', metin) tüm (dosya, satır) çiftlerini verir; son eleman en içteki çağrıdır.', 'Son boş olmayan satır için satırları strip edip boşları ele, [-1] al.'],
    'why': 'Python izleme kaydı (traceback) en dıştaki çağrıdan en içtekine doğru yazılır; hatanın oluştuğu yer son File kaydıdır, hata türü ve mesajı ise en alttaki satırdır. Editörlerin "tıkla, hataya git" özelliği tam olarak bu ayrıştırmayı yapar.' },

  { 't': 'code', 'stage': 'Hata avı', 'kind': 'bug', 'id': 'vscode-8', 'diff': 1,
    'q': '<p>Hatayı bul ve düzelt. <code>veri_yolu(betik_yolu, dosya_adi)</code>, betiğin <b>bulunduğu klasördeki</b> veri dosyasının yolunu metin olarak döndürmeli; böylece betik hangi çalışma dizininden başlatılırsa başlatılsın dosya bulunur. Kod yanlış yol üretiyor.</p>',
    'start': 'from pathlib import PurePosixPath\n\ndef veri_yolu(betik_yolu, dosya_adi):\n    return PurePosixPath(betik_yolu) / dosya_adi\n',
    'sol': 'from pathlib import PurePosixPath\n\ndef veri_yolu(betik_yolu, dosya_adi):\n    return str(PurePosixPath(betik_yolu).parent / dosya_adi)\n',
    'tests': 'assert veri_yolu("/proje/src/rapor.py", "veri.csv") == "/proje/src/veri.csv", "Betiğin klasörü + dosya adı; betik dosyasının kendisi klasör değildir"\nassert veri_yolu("/proje/src/rapor.py", "veri/ekim.csv") == "/proje/src/veri/ekim.csv", "Alt klasörlü göreli ad"\nassert isinstance(veri_yolu("/a/b.py", "c.txt"), str), "Sonuç metin (str) olmalı"\n',
    'hints': ['PurePosixPath("/proje/src/rapor.py") / "veri.csv" sonucu "/proje/src/rapor.py/veri.csv" olur.', '.parent ile klasöre çık, str() ile metne çevir.'],
    'why': 'Gerçek kodda bunun karşılığı Path(__file__).resolve().parent / "veri.csv" kalıbıdır. Göreli yol çalışma dizinine bağlıdır; betiğin klasörüne dayalı yol ise VS Code\'un Çalıştır düğmesinde, terminalde ve zamanlanmış görevde aynı dosyayı bulur.' },
  { 't': 'code', 'stage': 'Hata avı', 'kind': 'bug', 'id': 'vscode-9', 'diff': 2,
    'q': '<p>Hatayı bul ve düzelt. <code>ayar_metni(ayarlar)</code>, sözlükten VS Code\'un okuyabileceği geçerli bir settings.json metni üretmeli: 4 boşluk girinti, Türkçe karakterler kaçışsız (<code>ensure_ascii=False</code>). Mevcut kod f-string ile elle birleştiriyor; üretilen dosyayı VS Code okuyamıyor.</p>',
    'start': 'def ayar_metni(ayarlar):\n    satirlar = []\n    for anahtar, deger in ayarlar.items():\n        satirlar.append(f\'    "{anahtar}": {deger}\')\n    return "{\\n" + ",\\n".join(satirlar) + "\\n}"\n',
    'sol': 'import json\n\ndef ayar_metni(ayarlar):\n    return json.dumps(ayarlar, indent=4, ensure_ascii=False)\n',
    'tests': 'import json\na = {"editor.formatOnSave": True, "python.defaultInterpreterPath": ".venv/bin/python", "editor.rulers": [88], "[python]": {"editor.tabSize": 4}, "rapor.baslik": "Şube özeti"}\nm = ayar_metni(a)\ntry:\n    geri = json.loads(m)\nexcept json.JSONDecodeError as e:\n    raise AssertionError(f"Üretilen metin geçerli JSON değil: {e}")\nassert geri == a, "JSON\'dan geri okununca aynı sözlük çıkmalı"\nassert "true" in m and "True" not in m, "Python True, JSON\'da true olmalı"\nassert "Şube özeti" in m, "Türkçe karakterler kaçışsız yazılmalı (ensure_ascii=False)"\nassert m.splitlines()[1].startswith(\'    "\'), "4 boşluk girinti"\n',
    'hints': ['f-string Python temsilini yazar: True, tek tırnaklı metinler, tırnaksız metin değerleri. Bunlar JSON değildir.', 'json.dumps(ayarlar, indent=4, ensure_ascii=False)'],
    'why': 'Veri biçimlerini (JSON, CSV, XML) asla metin birleştirerek üretme; tırnak, kaçış ve tür çevirisi hataları kaçınılmazdır. json.dumps tüm bunları doğru yapar; indent okunabilirlik, ensure_ascii=False Türkçe karakterler içindir.' },

  { 't': 'code', 'stage': 'Meydan okuma', 'id': 'vscode-10', 'diff': 3,
    'q': '<p>Yeni projeleri inceleyen <code>calisma_alani_denetle(dosyalar)</code> fonksiyonunu yaz. <code>dosyalar</code>, proje kökünden göreli yol (<code>/</code> ayırıcılı) → içerik sözlüğüdür. Uyarı kodlarının <b>alfabetik</b> listesini döndür:</p><ul><li><code>"BAGIMLILIK_YOK"</code>: ne <code>requirements.txt</code> ne <code>pyproject.toml</code> var.</li><li><code>"AYAR_YOK"</code>: <code>.vscode/settings.json</code> yok.</li><li><code>"AYAR_BOZUK"</code>: settings.json var ama JSONC olarak okunamıyor (tam satır <code>//</code> yorumları ve sondaki virgüller geçerlidir).</li><li><code>"VENV_IZLENIYOR"</code>: <code>.venv/</code> ile başlayan bir yol var ve <code>.gitignore</code> (yoksa boş say) <code>.venv</code>\'i yok saymıyor. Kabul edilen satırlar: <code>.venv</code>, <code>.venv/</code>, <code>/.venv</code>, <code>/.venv/</code> (baş/son boşluk ve <code>#</code> yorum satırları göz ardı).</li><li><code>"PYCACHE"</code>: yolunda <code>__pycache__/</code> geçen bir dosya var ve .gitignore\'da <code>__pycache__</code> ya da <code>__pycache__/</code> satırı yok.</li><li><code>"TEST_YOK"</code>: <code>tests/</code> ile başlayan ya da dosya adı <code>test_</code> ile başlayan <code>.py</code> dosyası yok.</li></ul>',
    'start': 'import json, re\n\ndef calisma_alani_denetle(dosyalar):\n    pass\n',
    'sol': 'import json, re, posixpath\n\n\ndef _jsonc(metin):\n    satirlar = [s for s in metin.splitlines() if not s.strip().startswith("//")]\n    return json.loads(re.sub(r",\\s*([}\\]])", r"\\1", "\\n".join(satirlar)))\n\n\ndef calisma_alani_denetle(dosyalar):\n    uyarilar = []\n    yoksay = {s.strip() for s in dosyalar.get(".gitignore", "").splitlines()\n              if s.strip() and not s.strip().startswith("#")}\n    if "requirements.txt" not in dosyalar and "pyproject.toml" not in dosyalar:\n        uyarilar.append("BAGIMLILIK_YOK")\n    if ".vscode/settings.json" not in dosyalar:\n        uyarilar.append("AYAR_YOK")\n    else:\n        try:\n            _jsonc(dosyalar[".vscode/settings.json"])\n        except ValueError:\n            uyarilar.append("AYAR_BOZUK")\n    if any(y.startswith(".venv/") for y in dosyalar) and not yoksay & {".venv", ".venv/", "/.venv", "/.venv/"}:\n        uyarilar.append("VENV_IZLENIYOR")\n    if any("__pycache__/" in y for y in dosyalar) and not yoksay & {"__pycache__", "__pycache__/"}:\n        uyarilar.append("PYCACHE")\n    testler = [y for y in dosyalar if y.endswith(".py") and (y.startswith("tests/") or posixpath.basename(y).startswith("test_"))]\n    if not testler:\n        uyarilar.append("TEST_YOK")\n    return sorted(uyarilar)\n',
    'tests': 'iyi = {\n    "pyproject.toml": "[project]\\nname = \'rapor\'",\n    ".gitignore": "# ortam\\n.venv/\\n__pycache__/\\n",\n    ".vscode/settings.json": \'{\\n  // ayar\\n  "editor.formatOnSave": true,\\n}\',\n    ".venv/bin/python": "",\n    "src/rapor/__pycache__/main.cpython-312.pyc": "",\n    "src/rapor/main.py": "print(1)",\n    "tests/test_main.py": "def test(): pass",\n}\nassert calisma_alani_denetle(iyi) == [], "Düzgün projede uyarı olmamalı (JSONC yorum ve sondaki virgül geçerli)"\nkotu = {\n    ".vscode/settings.json": \'{"editor.formatOnSave": True}\',\n    ".venv/bin/python": "",\n    "app/__pycache__/x.pyc": "",\n    "app/main.py": "",\n    "app/testler.py": "",\n}\nassert calisma_alani_denetle(kotu) == ["AYAR_BOZUK", "BAGIMLILIK_YOK", "PYCACHE", "TEST_YOK", "VENV_IZLENIYOR"], "True geçersiz JSON; .gitignore yok; testler.py test dosyası sayılmaz"\nk2 = {"requirements.txt": "", ".gitignore": "  /.venv  \\n# __pycache__/\\n", ".venv/x": "", "a/__pycache__/b.pyc": "", "src/test_hesap.py": ""}\nassert calisma_alani_denetle(k2) == ["AYAR_YOK", "PYCACHE"], "/.venv kabul; yorumdaki __pycache__ sayılmaz; test_hesap.py test dosyasıdır"\nassert calisma_alani_denetle({}) == ["AYAR_YOK", "BAGIMLILIK_YOK", "TEST_YOK"], "Boş proje"\n',
    'hints': ['.gitignore satırlarını strip edip boş ve # ile başlayanları atarak bir kümeye çevir; kabul edilen kalıplarla kesişimine bak.', 'JSONC okuma için önceki görevdeki yaklaşımı yardımcı fonksiyona koy; json.JSONDecodeError, ValueError\'ın alt sınıfıdır.', 'Test dosyası: .py ile bitmeli VE (tests/ ile başlamalı YA DA posixpath.basename(y) test_ ile başlamalı).'],
    'why': 'Gerçek denetim araçları (linter, CI kontrolleri) tam olarak böyle küçük kuralların toplamıdır. Her kuralı bağımsız bir if ile yazmak, sonuçları sıralamak ve kenar durumları (yorum satırları, farklı yazımlar) test etmek, aracı güvenilir kılar.' },
  { 't': 'code', 'stage': 'Mini proje', 'id': 'vscode-11', 'diff': 3,
    'q': '<p>Anadolu Market\'in proje şablonu için <code>vscode_hazirla(isletim, formatlayici)</code> fonksiyonunu yaz. Dosya yolu → JSON metni (4 boşluk girinti, <code>ensure_ascii=False</code>) sözlüğü döndür:</p><ul><li><code>".vscode/settings.json"</code>: <code>"python.defaultInterpreterPath"</code> (Windows: <code>"${workspaceFolder}/.venv/Scripts/python.exe"</code>, diğer: <code>"${workspaceFolder}/.venv/bin/python"</code>), <code>"[python]"</code> bölümünde <code>editor.defaultFormatter</code> (ruff → <code>charliermarsh.ruff</code>, black → <code>ms-python.black-formatter</code>) ve <code>editor.formatOnSave: true</code>, ayrıca <code>"python.testing.pytestEnabled": true</code>.</li><li><code>".vscode/extensions.json"</code>: <code>{"recommendations": ["ms-python.python", "ms-python.vscode-pylance", &lt;biçimlendirici kimliği&gt;]}</code></li><li><code>".vscode/launch.json"</code>: <code>version "0.2.0"</code> ve tek yapılandırma: <code>name "Geçerli dosya"</code>, <code>type "debugpy"</code>, <code>request "launch"</code>, <code>program "${file}"</code>, <code>console "integratedTerminal"</code>, <code>justMyCode true</code>.</li></ul><p>Bilinmeyen biçimlendirici ya da işletim sisteminde (<code>windows</code>, <code>macos</code>, <code>linux</code> dışında) <code>ValueError</code>.</p>',
    'start': 'import json\n\ndef vscode_hazirla(isletim, formatlayici):\n    pass\n',
    'sol': 'import json\n\nKIMLIKLER = {"ruff": "charliermarsh.ruff", "black": "ms-python.black-formatter"}\n\n\ndef _json(veri):\n    return json.dumps(veri, indent=4, ensure_ascii=False)\n\n\ndef vscode_hazirla(isletim, formatlayici):\n    if formatlayici not in KIMLIKLER:\n        raise ValueError(f"Bilinmeyen biçimlendirici: {formatlayici}")\n    if isletim == "windows":\n        yorumlayici = "${workspaceFolder}/.venv/Scripts/python.exe"\n    elif isletim in ("macos", "linux"):\n        yorumlayici = "${workspaceFolder}/.venv/bin/python"\n    else:\n        raise ValueError(f"Bilinmeyen işletim sistemi: {isletim}")\n    kimlik = KIMLIKLER[formatlayici]\n    ayarlar = {\n        "python.defaultInterpreterPath": yorumlayici,\n        "[python]": {"editor.defaultFormatter": kimlik, "editor.formatOnSave": True},\n        "python.testing.pytestEnabled": True,\n    }\n    eklentiler = {"recommendations": ["ms-python.python", "ms-python.vscode-pylance", kimlik]}\n    launch = {\n        "version": "0.2.0",\n        "configurations": [{\n            "name": "Geçerli dosya",\n            "type": "debugpy",\n            "request": "launch",\n            "program": "${file}",\n            "console": "integratedTerminal",\n            "justMyCode": True,\n        }],\n    }\n    return {\n        ".vscode/settings.json": _json(ayarlar),\n        ".vscode/extensions.json": _json(eklentiler),\n        ".vscode/launch.json": _json(launch),\n    }\n',
    'tests': 'import json\nd = vscode_hazirla("windows", "ruff")\nassert set(d) == {".vscode/settings.json", ".vscode/extensions.json", ".vscode/launch.json"}, "Üç dosya üretilmeli"\nassert all(isinstance(v, str) for v in d.values()), "Değerler JSON metni (str) olmalı"\ns = json.loads(d[".vscode/settings.json"])\nassert s["python.defaultInterpreterPath"] == "${workspaceFolder}/.venv/Scripts/python.exe", "Windows yorumlayıcı yolu Scripts/python.exe"\nassert s["[python]"] == {"editor.defaultFormatter": "charliermarsh.ruff", "editor.formatOnSave": True}, "[python] bölümü"\nassert s["python.testing.pytestEnabled"] is True, "pytest açık"\ne = json.loads(d[".vscode/extensions.json"])\nassert e == {"recommendations": ["ms-python.python", "ms-python.vscode-pylance", "charliermarsh.ruff"]}, "Önerilen eklentiler"\nl = json.loads(d[".vscode/launch.json"])\nassert l["version"] == "0.2.0" and len(l["configurations"]) == 1, "launch.json sürümü ve tek yapılandırma"\nassert l["configurations"][0] == {"name": "Geçerli dosya", "type": "debugpy", "request": "launch", "program": "${file}", "console": "integratedTerminal", "justMyCode": True}, "Yapılandırma alanları"\nassert "Geçerli dosya" in d[".vscode/launch.json"], "ensure_ascii=False: Türkçe karakter kaçışsız"\nassert d[".vscode/launch.json"].splitlines()[1].startswith(\'    "version"\'), "4 boşluk girinti"\nm = vscode_hazirla("macos", "black")\nassert json.loads(m[".vscode/settings.json"])["python.defaultInterpreterPath"].endswith("/.venv/bin/python"), "macOS: bin/python"\nassert json.loads(m[".vscode/extensions.json"])["recommendations"][-1] == "ms-python.black-formatter", "Black kimliği"\nfor kotu in [("windows", "yapf"), ("amiga", "ruff")]:\n    try:\n        vscode_hazirla(*kotu)\n        assert False, f"{kotu} için ValueError beklenir"\n    except ValueError:\n        pass\n',
    'hints': ['Üç sözlüğü ayrı ayrı kur, sonra her birini aynı json.dumps(..., indent=4, ensure_ascii=False) yardımcısıyla metne çevir.', '"${workspaceFolder}" ve "${file}" Python için sıradan metindir (f-string değil, düz metin kullan).', 'Doğrulamaları (ValueError) en başta yap; böylece yarım dosya üretilmez.'],
    'why': 'Bu fonksiyon dersin tüm parçalarını birleştirir: yorumlayıcı yolu (işletim sistemine göre), biçimlendirici ve kaydederken biçimlendirme, önerilen eklentiler ve hata ayıklama yapılandırması. Proje şablonlarını kodla üretmek (cookiecutter, copier gibi araçlar) ekiplerde standart bir uygulamadır.' },
]

LESSON = {
  'id': 'vscode', 'lv': 'temel', 'mod': 'Başlangıç', 'min': 40,
  'title': 'VS Code ile Python',
  'sum': 'VS Code\'u doğru eklentiler, doğru yorumlayıcı ve venv ile kurar; hata ayıklayıcıyla adım adım ilerler, Ruff/Black ile kaydederken biçimlendirir, ayarları ekiple paylaşırsın.',
  'goals': ['Python, Pylance, Jupyter ve Ruff eklentilerini kurup proje klasörünü çalışma alanı olarak açabilirim.',
            'Doğru yorumlayıcıyı ve .venv\'i seçer, "could not be resolved" hatasını teşhis edebilirim.',
            'Kesme noktası, F10/F11, Variables ve Watch panelleriyle hata ayıklayabilir, launch.json yazabilirim.',
            'settings.json ile kaydederken biçimlendirmeyi ayarlar, kullanıcı ve çalışma alanı ayarlarını ayırt edebilirim.',
            'Çalışma dizini tuzağını açıklar, betiğe göre yol kurabilirim.'],
  'body': BODY, 'ex': EX,
  'faq': [
    {'q': 'Ruff mu Black mı?', 'a': 'Yeni projede Ruff: hem biçimlendirir hem denetler ve çok hızlıdır. Ekip zaten Black kullanıyorsa ona uy; ikisinin çıktısı büyük ölçüde aynıdır. Önemli olan herkesin aynı aracı aynı ayarla kullanmasıdır.'},
    {'q': '.vscode klasörünü git\'e eklemeli miyim?', 'a': 'settings.json (proje kuralları), extensions.json ve launch.json genellikle eklenir. Kişisel tercihler (tema, yazı tipi) kullanıcı ayarına gider. Mutlak kişisel yollar ya da gizli bilgiler (parola, token) asla bu dosyalara yazılmaz.'},
    {'q': 'Çalıştır düğmesi ile F5 arasındaki fark ne?', 'a': 'Çalıştır düğmesi (ve Ctrl+F5) programı hata ayıklayıcı olmadan çalıştırır; kesme noktaları yok sayılır. F5 hata ayıklayıcıyı bağlar, kesme noktalarında durur ve launch.json yapılandırmasını kullanır.'},
    {'q': 'VS Code yavaşladı, ne yapmalıyım?', 'a': 'Büyük klasörleri (.venv, veri, node_modules) analizden çıkar: files.watcherExclude ve python.analysis.exclude ayarları. Kullanmadığın eklentileri devre dışı bırak; komut paletindeki "Developer: Show Running Extensions" hangisinin yavaş olduğunu gösterir.'},
  ],
  'mistakes': [
    {'bad': 'with open("veri/siparisler.csv") as f:\n    ...', 'good': 'from pathlib import Path\nKOK = Path(__file__).resolve().parent\nwith open(KOK / "veri" / "siparisler.csv", encoding="utf-8") as f:\n    ...', 'why': 'Göreli yol, terminalin bulunduğu klasöre göre çözülür; Çalıştır düğmesi ile terminal farklı klasörden başlatabilir. Betiğin klasörüne dayalı yol her yerden aynı dosyayı bulur.'},
    {'bad': 'metin = "{" + f\'"editor.formatOnSave": {True}\' + "}"', 'good': 'import json\nmetin = json.dumps({"editor.formatOnSave": True}, indent=4)', 'why': 'Elle birleştirilen metin Python temsilini (True) yazar; JSON\'da true olmalıdır. json.dumps tür ve kaçış çevirisini doğru yapar.'},
    {'bad': 'pip install pandas   # VS Code\'da hâlâ "could not be resolved"', 'good': '# Ctrl+Shift+P → Python: Select Interpreter → .venv\npython -m pip install pandas', 'why': 'Paket ve editör farklı Python\'lara bakıyordur. Önce editörde yorumlayıcıyı seç, sonra o ortamın terminalinde python -m pip ile kur.'},
    {'bad': 'print("burada", x)\nprint("burada2", toplam)\n# ...hata bulununca hepsini silmek', 'good': '# for satırına kesme noktası (F9), F5 ile başlat,\n# Variables/Watch panelinde x ve toplamı izle', 'why': 'print ile hata ayıklamak kodu kirletir, unutulan printler üretime gider. Kesme noktası ve logpoint koda dokunmadan aynı bilgiyi verir.'},
  ],
}

if __name__ == '__main__':
    emit(LESSON, '/home/claude/py/v2/t1/vscode.js')
