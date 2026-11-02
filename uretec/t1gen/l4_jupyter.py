import sys; sys.path.insert(0, '/tmp/claude-0/-home-claude/6c066959-3fcb-54bb-bdf1-c8ae148dfc4c/scratchpad/t1gen')
from t1lib import emit

BODY = r'''
<h2>Defter gibi çalışmak</h2>
<p>Veri analistinin günü çoğu zaman bir soruyla başlar: "Geçen ay İzmir'de iade oranı neden arttı?" Bu tür sorularda kodu baştan sona yazıp çalıştırmak yerine adım adım ilerlemek istersin: veriyi oku, ilk beş satıra bak, bir filtre dene, grafiği çiz, yorum yaz. <b>Jupyter Notebook</b> tam bunun için var. Kod, çıktı, grafik ve açıklama metni tek bir belgede, <b>hücre (cell)</b> denen bloklar hâlinde yan yana durur. <b>Kurulum ve araçlar</b> dersinde Jupyter'a kısaca bakmıştın; bu derste notebook'u bilinçli kullanmayı, en tehlikeli tuzağı (gizli durum), Colab'i, conda'yı ve notebook'tan gerçek bir betiğe geçişi öğreneceksin.</p>

<h2>Kurulum ve ilk açılış</h2>
<p>Jupyter bir Python paketidir; projenin sanal ortamına kurulur:</p>
<pre class="code">python -m venv .venv
source .venv/bin/activate           # Windows: .venv\Scripts\Activate.ps1
python -m pip install jupyterlab pandas matplotlib
jupyter lab                          # tarayıcıda http://localhost:8888 açılır</pre>
<p><b>JupyterLab</b> modern arayüzdür (dosya gezgini, sekmeler, terminal); klasik <b>Notebook</b> arayüzü <code>jupyter notebook</code> ile açılır. İkisi de aynı <code>.ipynb</code> dosyalarını kullanır. Terminali kapatırsan sunucu da kapanır. Arka planda çalışan şeye <b>çekirdek (kernel)</b> denir: kodunu çalıştıran Python sürecidir ve değişkenleri bellekte tutar.</p>

<h2>Hücre türleri ve kısayollar</h2>
<div class="tbl-wrap"><table>
<tr><th>Hücre türü</th><th>Ne içerir</th><th>Çalıştırınca</th></tr>
<tr><td>Code</td><td>Python kodu</td><td>Çekirdekte çalışır, altında çıktı görünür; son ifadenin değeri otomatik gösterilir</td></tr>
<tr><td>Markdown</td><td>Başlık, liste, tablo, formül (<code># Başlık</code>, <code>**kalın**</code>)</td><td>Biçimlendirilmiş metne dönüşür</td></tr>
<tr><td>Raw</td><td>İşlenmeyen düz metin</td><td>Hiçbir şey; dönüştürme araçları için</td></tr>
</table></div>
<p>Jupyter'da iki mod vardır: <b>düzenleme modu</b> (hücrenin içine yazarsın, kenar yeşil/mavi) ve <b>komut modu</b> (Esc ile girilir; hücrelerin kendisini yönetirsin).</p>
<div class="tbl-wrap"><table>
<tr><th>Tuş</th><th>Mod</th><th>Eylem</th></tr>
<tr><td>Shift+Enter</td><td>Her ikisi</td><td>Hücreyi çalıştır, sonrakine geç</td></tr>
<tr><td>Ctrl+Enter</td><td>Her ikisi</td><td>Hücreyi çalıştır, yerinde kal</td></tr>
<tr><td>Alt+Enter</td><td>Her ikisi</td><td>Çalıştır ve altına yeni hücre ekle</td></tr>
<tr><td>A / B</td><td>Komut</td><td>Üste / alta hücre ekle</td></tr>
<tr><td>D, D</td><td>Komut</td><td>Hücreyi sil</td></tr>
<tr><td>M / Y</td><td>Komut</td><td>Markdown'a / koda çevir</td></tr>
<tr><td>0, 0</td><td>Komut</td><td>Çekirdeği yeniden başlat</td></tr>
</table></div>

<h2>En tehlikeli tuzak: çalıştırma sırası ve gizli durum</h2>
<p>Hücrelerin solundaki <code>[5]</code> gibi sayı <b>çalıştırma sayacıdır (execution count)</b>: o hücrenin çekirdekte kaçıncı sırada çalıştığını gösterir. Notebook'u yukarıdan aşağı okursun ama çekirdek hücreleri <b>senin tıkladığın sırayla</b> çalıştırır. Bir değişkeni tanımlayan hücreyi silsen bile değişken bellekte yaşamaya devam eder. Buna <b>gizli durum (hidden state)</b> denir: notebook sende çalışır, ekip arkadaşında ya da yarın sabah çekirdeği yeniden başlattığında çalışmaz.</p>
<pre class="py">hucreler = {
    1: "kur = 32.5",
    2: "tutar_tl = 1000 * kur",
    3: "kur = 34.0",
}
for sira in ([1, 2, 3], [1, 3, 2]):
    cekirdek = {}                       # yeni bir çekirdek
    for no in sira:
        exec(hucreler[no], cekirdek)
    print(f"Sıra {sira}: tutar_tl = {cekirdek['tutar_tl']}")</pre>
<p>Aynı üç hücre, iki farklı sırada iki farklı sonuç verdi. Notebook'a bakan biri hangi sırada çalıştırıldığını göremez. Korunmanın tek güvenilir yolu: paylaşmadan, kaydetmeden ve sonuca güvenmeden önce <b>Kernel → Restart Kernel and Run All Cells</b>. Yukarıdan aşağı hatasız çalışıyorsa notebook'un "temiz"dir.</p>
<div class="warn"><b>Sayaçlara bak</b>Sayaçlar yukarıdan aşağı 1, 2, 3... diye artmıyorsa (ör. [7], [3], [12]) notebook karışık sırada çalıştırılmıştır. Böyle bir notebook'un sonuçlarına rapor yazmadan önce mutlaka yeniden başlatıp baştan çalıştır.</div>

<h2>Sihirli komutlar (magic commands)</h2>
<p>IPython çekirdeği, Python olmayan bazı özel komutlar sunar. Tek <code>%</code> satır sihridir (yalnız o satıra etki eder), çift <code>%%</code> hücre sihridir (hücrenin ilk satırında olmalı ve tüm hücreye etki eder), <code>!</code> ise satırı işletim sistemi kabuğunda çalıştırır.</p>
<pre class="code">%timeit sum(range(10_000))          # satırı defalarca çalıştırıp ortalama süre
%%time                               # (hücrenin ilk satırı) tüm hücrenin süresi
%who                                 # tanımlı değişkenler
%pwd                                 # çalışma dizini
%pip install openpyxl                # paketi BU çekirdeğin ortamına kur
!ls veri/                            # kabuk komutu (Windows'ta !dir)
%load_ext autoreload
%autoreload 2                        # düzenlediğin .py modüllerini otomatik yeniden yükle</pre>
<div class="tip"><b>!pip değil %pip</b><code>!pip install</code> kabukta PATH'teki ilk pip'i çalıştırır; o pip çekirdeğin Python'ına ait olmayabilir ve "kurdum ama ModuleNotFoundError" sorunu doğar. <code>%pip install</code> paketi her zaman çalışan çekirdeğin ortamına kurar.</div>
<p>Sihirli komutlar yalnız Jupyter'da çalışır; <code>.py</code> dosyasında SyntaxError verir. Betikte aynı ölçümü <code>timeit</code> modülüyle yaparsın:</p>
<pre class="py">import timeit

liste_yontemi = timeit.timeit("sum([x * x for x in range(1000)])", number=2000)
uretec_yontemi = timeit.timeit("sum(x * x for x in range(1000))", number=2000)
print(f"Liste   : {liste_yontemi:.3f} sn / 2000 tekrar")
print(f"Üreteç  : {uretec_yontemi:.3f} sn / 2000 tekrar")
print("İkisi de aynı sonucu verir:", sum([x * x for x in range(1000)]) == sum(x * x for x in range(1000)))</pre>

<h2>Anaconda ve Miniconda</h2>
<p><b>Anaconda</b>, Python'ı yüzlerce bilimsel paketle birlikte getiren bir dağıtımdır; <b>Miniconda</b> ise yalnız Python ve <b>conda</b> paket yöneticisini kurar, gerisini sen eklersin. conda, pip'ten farklı olarak Python dışı bağımlılıkları da (C kütüphaneleri, CUDA, hatta R) yönetir ve Python sürümünün kendisini ortam başına kurar.</p>
<pre class="code">conda create -n analiz python=3.12 pandas matplotlib jupyterlab
conda activate analiz
conda install -c conda-forge scikit-learn
pip install bir-paket               # conda'da olmayan paket için, EN SON
conda env export --from-history &gt; environment.yml
conda env create -f environment.yml # başka makinede aynı ortam
conda deactivate</pre>
<div class="tbl-wrap"><table>
<tr><th></th><th>conda</th><th>pip + venv</th></tr>
<tr><td>Python sürümü</td><td>Ortam başına kurar</td><td>Var olan Python'ı kullanır</td></tr>
<tr><td>Python dışı bağımlılık</td><td>Yönetir (C, CUDA, GDAL)</td><td>Yönetemez; tekerlek (wheel) içinde gelmeli</td></tr>
<tr><td>Paket kaynağı</td><td>Anaconda kanalları, conda-forge</td><td>PyPI (en geniş katalog)</td></tr>
<tr><td>Ortam dosyası</td><td><code>environment.yml</code></td><td><code>requirements.txt</code> / <code>pyproject.toml</code></td></tr>
<tr><td>Hız ve boyut</td><td>Daha ağır</td><td>Hafif</td></tr>
</table></div>
<p>Kurallar: bir ortamda önce conda ile kurabildiğin her şeyi kur, pip'i en son kullan; pip'ten sonra tekrar conda install yapmak ortamı tutarsız bırakabilir. Kurumsal kullanımda Anaconda'nın varsayılan kanalının lisans koşullarını kontrol et; ücretsiz <b>conda-forge</b> kanalını kullanan <b>Miniforge</b> yaygın bir alternatiftir. Bir conda ortamını Jupyter'da çekirdek olarak görmek için ortam içinde <code>python -m ipykernel install --user --name analiz</code> çalıştır.</p>

<h2>Google Colab</h2>
<p><b>Colab</b>, Google'ın tarayıcıda çalışan ücretsiz notebook hizmetidir: kurulum yok, pandas ve scikit-learn hazır, sınırlı süreli ücretsiz GPU bile var. Ama makine geçicidir. Oturum bir süre boşta kalınca ya da süre sınırı dolunca <b>çalışma zamanı (runtime)</b> sıfırlanır: <code>/content</code> altına yüklediğin dosyalar, kurduğun paketler ve bellekteki değişkenler gider. Kalıcı dosyalar için Google Drive bağlanır:</p>
<pre class="code">from google.colab import drive
drive.mount("/content/drive")
import pandas as pd
df = pd.read_csv("/content/drive/MyDrive/anadolu/siparisler.csv")

from google.colab import files
yuklenen = files.upload()            # bilgisayardan dosya seç (oturum sonunda silinir)
files.download("rapor.xlsx")         # sonucu indir

%pip install -q openpyxl             # her yeni oturumda yeniden gerekir</pre>
<p>Runtime → Change runtime type menüsünden GPU seçilir. Parola ve API anahtarlarını hücreye yazma; Colab'in sol panelindeki <b>Secrets</b> (anahtar simgesi) bölümüne koyup <code>google.colab.userdata.get("ANAHTAR")</code> ile oku. Paylaşılan bir notebook'a yazılmış anahtar, linki gören herkesindir.</p>

<h2>.ipynb aslında JSON'dur</h2>
<p>Notebook dosyası, hücreleri ve çıktıları tutan bir JSON belgesidir. Bu yüzden git farkları (diff) okunaksızdır: tek satır kod değişse bile çıktılar, sayaçlar ve gömülü grafikler (base64 metin) değişir. Yapıyı bilmek, notebook'ları Python ile işlemeni sağlar:</p>
<pre class="py">import json

nb_metni = """{
 "nbformat": 4, "nbformat_minor": 5, "metadata": {},
 "cells": [
  {"cell_type": "markdown", "metadata": {}, "source": ["# İade analizi\\n", "Ekim 2026"]},
  {"cell_type": "code", "execution_count": 2, "metadata": {}, "outputs": [],
   "source": ["import pandas as pd\\n", "df = pd.read_csv('iadeler.csv')"]},
  {"cell_type": "code", "execution_count": 1, "metadata": {}, "outputs": [],
   "source": "%timeit df.groupby('sehir').size()"}
 ]
}"""
nb = json.loads(nb_metni)
for i, h in enumerate(nb["cells"]):
    kaynak = h["source"] if isinstance(h["source"], str) else "".join(h["source"])
    sayac = h.get("execution_count", "-")
    print(f"[{i}] {h['cell_type']:8} sayaç={sayac} | {kaynak.splitlines()[0]}")</pre>
<p><code>source</code> alanı satır listesi ya da tek metin olabilir; ikisini de desteklemelisin. Bu notebook'ta ikinci kod hücresinin sayacı (1) birincininkinden (2) küçük: sıra bozuk!</p>

<h2>Notebook'tan .py dosyasına</h2>
<p>Keşif bittiğinde düzenli çalışacak kod (günlük rapor, model eğitimi) betiğe ve modüllere taşınır. İlk adım otomatik dönüştürmedir:</p>
<pre class="code">jupyter nbconvert --to script iade_analizi.ipynb      # iade_analizi.py üretir
jupyter nbconvert --to html iade_analizi.ipynb        # paylaşmak için HTML rapor
jupyter nbconvert --to notebook --execute --inplace iade_analizi.ipynb   # baştan çalıştır</pre>
<p>Üretilen .py dosyasında markdown hücreleri yorum olur, sihirli komutlar <code>get_ipython()</code> çağrılarına dönüşür (bunları elle temizlemen gerekir). Ardından kodu fonksiyonlara böl, sabit dosya yollarını parametre yap ve test yaz. VS Code ve Jupytext'in kullandığı <b>yüzde biçimi (percent format)</b> iki dünyayı birleştirir: <code># %%</code> ile ayrılmış sıradan bir .py dosyası, VS Code'da hücre hücre çalıştırılabilir:</p>
<pre class="py">hucreler = [
    ("markdown", "# Şehir bazında iade\nEkim verisi"),
    ("code", "iadeler = {'İzmir': 41, 'Ankara': 28}"),
    ("code", "print(max(iadeler, key=iadeler.get))"),
]
parcalar = []
for tur, kaynak in hucreler:
    if tur == "markdown":
        yorum = "\n".join("# " + s for s in kaynak.splitlines())
        parcalar.append("# %% [markdown]\n" + yorum)
    else:
        parcalar.append("# %%\n" + kaynak)
betik = "\n\n".join(parcalar)
print(betik)
print("---- çalıştırılıyor ----")
exec(betik)</pre>

<h2>Notebook ne zaman uygun değil?</h2>
<ul>
<li><b>Üretimde düzenli çalışan işler:</b> zamanlanmış rapor, API, ETL. Betik + modül + test kullan.</li>
<li><b>Ekipçe geliştirilen kod:</b> JSON farkları kod incelemesini zorlaştırır; ortak fonksiyonları .py modüllerine taşı, notebook'tan içe aktar.</li>
<li><b>Uzun süren hesaplar:</b> tarayıcı sekmesi kapanınca ya da Colab oturumu düşünce iş kaybolabilir.</li>
<li><b>Test edilmesi gereken mantık:</b> notebook hücreleri birim testine uygun değildir.</li>
</ul>
<p>Notebook'un parladığı yerler: keşifsel veri analizi, grafikle anlatılan raporlar, eğitim materyali, bir modelin hızlı denenmesi.</p>

<h2>VS Code'da .ipynb</h2>
<p>Jupyter eklentisi kuruluysa VS Code .ipynb dosyalarını doğrudan açar. Sağ üstteki <b>Select Kernel</b> düğmesiyle projenin <code>.venv</code>'ini seç (ortamda <code>ipykernel</code> yoksa VS Code kurmayı önerir). Üst çubuktaki <b>Variables</b> düğmesi tüm değişkenleri tablo olarak gösterir; hücrelerde kesme noktası koyup hata ayıklayabilirsin. <b>VS Code ile Python</b> dersinde gördüğün yorumlayıcı seçimi burada çekirdek seçimine karşılık gelir.</p>

<h2>Belirti → neden → çözüm</h2>
<div class="tbl-wrap"><table>
<tr><th>Belirti</th><th>Neden</th><th>Çözüm</th></tr>
<tr><td><code>!pip install</code> sonrası <code>ModuleNotFoundError</code></td><td>Paket çekirdekten farklı bir Python'a kuruldu</td><td><code>%pip install</code>; ya da doğru çekirdeği seç</td></tr>
<tr><td>Dün çalışan notebook bugün <code>NameError</code></td><td>Gizli durum: silinen ya da sonra çalıştırılan hücreye bağımlılık</td><td>Restart and Run All; eksik tanımı doğru hücreye koy</td></tr>
<tr><td>"Kernel died / restarting"</td><td>Bellek yetmedi (dev DataFrame) ya da yerel kütüphane çöktü</td><td>Veriyi parça parça oku, gereksiz değişkenleri <code>del</code> et</td></tr>
<tr><td>Colab'de dosyalarım kayboldu</td><td>Runtime sıfırlandı; <code>/content</code> geçicidir</td><td>Drive bağla, sonuçları Drive'a yaz</td></tr>
<tr><td>Colab'de <code>FileNotFoundError</code> Drive yolunda</td><td>Yol yanlış ya da Drive bağlanmadı</td><td><code>/content/drive/MyDrive/...</code>; önce <code>drive.mount</code></td></tr>
<tr><td>.py dosyasında <code>%timeit</code> SyntaxError</td><td>Sihirli komutlar yalnız IPython'da</td><td><code>timeit</code> modülünü kullan</td></tr>
<tr><td>Notebook git'te dev boyutlu, farklar okunmuyor</td><td>Çıktılar ve grafikler dosyada saklanıyor</td><td>Kaydetmeden önce çıktıları temizle; nbstripout</td></tr>
<tr><td><code>asyncio.run()</code> "cannot be called from a running event loop"</td><td>Jupyter'da zaten bir olay döngüsü çalışıyor</td><td>Hücrede doğrudan <code>await</code> kullan</td></tr>
<tr><td>Jupyter yeni kurduğun conda ortamını görmüyor</td><td>Ortam çekirdek olarak kaydedilmemiş</td><td><code>python -m ipykernel install --user --name ortam</code></td></tr>
</table></div>

<div class="note"><b>Gerçek işte</b>Anadolu Market'in analiz ekibi notebook'ları "keşif" klasöründe tutuyor. Bir analiz kalıcı rapora dönüşeceği zaman tekrarlanan mantık <code>src/analiz/</code> altındaki modüllere taşınıyor, notebook ise bu fonksiyonları içe aktaran kısa bir anlatıma dönüşüyor. Depoya girmeden önce bir pre-commit kancası (nbstripout) çıktıları temizliyor; CI'da <code>nbconvert --execute</code> her notebook'u baştan çalıştırıp gizli durum hatalarını yakalıyor. Yönetime giden aylık rapor ise papermill ile parametreli çalıştırılıp HTML'e çevriliyor.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Restart and Run All'u otomatikleştirmek</h3>
<p>Bir notebook'un temiz olup olmadığını, kod hücrelerini yeni ve boş bir ad alanında sırayla çalıştırarak denetleyebilirsin. Sihirli satırları atlamak gerekir; çünkü düz Python onları tanımaz:</p>
<pre class="py">hucreler = [
    "%matplotlib inline\nimport math",
    "yaricap = 3",
    "alan = math.pi * yaricap ** 2",
    "print(round(alan, 2), cevre)",
]

def bastan_calistir(kod_hucreleri):
    ad_alani = {}
    for i, kod in enumerate(kod_hucreleri):
        temiz = "\n".join(s for s in kod.splitlines() if not s.lstrip().startswith(("%", "!")))
        try:
            exec(temiz, ad_alani)
        except Exception as e:
            return f"Hücre {i} başarısız: {type(e).__name__}: {e}"
    return "Temiz: tüm hücreler sırayla çalıştı"

print(bastan_calistir(hucreler))
print(bastan_calistir(hucreler[:3]))</pre>
<h3>Parametreli notebook: papermill</h3>
<p><b>papermill</b>, bir notebook'u dışarıdan parametre vererek çalıştırır: "parameters" etiketli hücredeki değişkenleri ezer ve çıktılarıyla birlikte yeni bir notebook kaydeder. <code>papermill rapor.ipynb cikti/ekim.ipynb -p ay 2026-10</code> gibi bir komutla aynı analizi her ay için üretebilirsin. Notebook artık bir "rapor şablonu" olur.</p>
<h3>Çekirdek nedir, gerçekten?</h3>
<p>Arayüz (tarayıcı ya da VS Code) ile çekirdek ayrı süreçlerdir ve mesajlaşma protokolüyle konuşur. Bu yüzden aynı arayüzle R, Julia ya da başka bir Python ortamının çekirdeğine bağlanabilirsin; <code>jupyter kernelspec list</code> kayıtlı çekirdekleri gösterir. "Hangi Python çalışıyor?" sorusunun notebook'taki cevabı bir hücrede <code>import sys; print(sys.executable)</code> çalıştırmaktır.</p>
</section>
'''

NB_TEST = r'''nb = {"nbformat": 4, "nbformat_minor": 5, "metadata": {}, "cells": [
    {"cell_type": "markdown", "metadata": {}, "source": ["# Rapor\n", "Ekim"]},
    {"cell_type": "code", "execution_count": 1, "metadata": {}, "outputs": [{"output_type": "stream", "name": "stdout", "text": ["42\n"]}], "source": ["import math\n", "print(42)"]},
    {"cell_type": "raw", "metadata": {}, "source": "ham"},
    {"cell_type": "code", "execution_count": 3, "metadata": {}, "outputs": [], "source": "x = 1"},
    {"cell_type": "code", "execution_count": None, "metadata": {}, "outputs": [], "source": []},
]}
'''

EX = [
  { 't': 'mc', 'stage': 'Isınma',
    'q': 'Bir notebook hücresinde <code>!pip install openpyxl</code> çalıştırdın, kurulum başarılı göründü; ama <code>import openpyxl</code> <code>ModuleNotFoundError</code> veriyor. En olası neden ve çözüm hangisi?',
    'o': ['Paket bozuk indirildi; önbelleği temizleyip aynı komutu tekrarlamak gerekir',
          'Kabuktaki pip başka bir Python\'a kurdu; <code>%pip install</code> kullan',
          'Notebook\'ta import yalnız ilk hücrede yapılabilir; hücreyi en üste taşı',
          'Jupyter dış paketleri desteklemez; kodu .py dosyasına taşımak gerekir'],
    'a': 1,
    'why': '! satırı işletim sistemi kabuğunda çalışır ve PATH\'teki ilk pip\'i kullanır; bu pip çekirdeğin ortamına ait olmayabilir. %pip, çalışan çekirdeğin Python\'ına kurar. Kurulumdan sonra bazen çekirdeği yeniden başlatmak da gerekir.' },
  { 't': 'mc', 'stage': 'Isınma',
    'q': 'Notebook\'ta hücreler yukarıdan aşağı şu sayaçları gösteriyor: <code>[4]</code>, <code>[2]</code>, <code>[7]</code>. Bu ne anlama gelir ve ne yapmalısın?',
    'o': ['Hücreler karışık sırada çalışmış; sonuca güvenmeden önce Restart and Run All yap',
          'Üç hücre aynı anda paralel çalışmış; sonuçlar bu yüzden daha hızlı gelmiş',
          'Sayaçlar hücrenin kaç saniye sürdüğünü gösterir; en uzun süren 7 saniye',
          'Sayaçlar yalnızca bilgi amaçlıdır, notebook\'un doğruluğuyla ilgisi yoktur'],
    'a': 0,
    'why': 'Sayaç, hücrenin çekirdekte kaçıncı çalıştırıldığını gösterir. Artmayan sayaçlar, ikinci hücrenin birinciden önce çalıştığını ve aradaki çalıştırmaların silinmiş ya da üzerine yazılmış olabileceğini söyler. Gizli durumdan kurtulmanın yolu çekirdeği yeniden başlatıp baştan çalıştırmaktır.' },
  { 't': 'mc', 'stage': 'Isınma',
    'q': 'Colab\'de dünkü oturumda <code>/content/siparisler.csv</code> dosyasını yükleyip analiz ettin. Bugün aynı notebook\'u açınca <code>FileNotFoundError</code> alıyorsun. Kalıcı çözüm hangisi?',
    'o': ['Dosyayı her gün yeniden <code>files.upload()</code> ile yüklemek',
          'Dosya adını Türkçe karaktersiz yazıp hücreyi yeniden çalıştırmak',
          'Drive\'ı <code>drive.mount</code> ile bağlayıp dosyayı MyDrive\'dan okumak',
          'Runtime türünü GPU yapıp dosyanın orada saklanmasını sağlamak'],
    'a': 2,
    'why': 'Colab çalışma zamanı geçicidir; oturum bitince /content altındaki her şey silinir. Google Drive bağlandığında /content/drive/MyDrive altındaki dosyalar kalıcıdır. GPU seçimi depolamayı etkilemez.' },

  { 't': 'predict', 'stage': 'Kodu oku', 'q': 'Bu kod, hücrelerin farklı sırada çalıştırıldığı bir çekirdeği taklit ediyor. Ne yazdırır?',
    'code': r'''hucreler = ["fiyat = 100", "fiyat = fiyat * 1.2", "print(fiyat)"]
cekirdek = {}
for no in [0, 1, 1, 2]:
    exec(hucreler[no], cekirdek)
''',
    'o': ['120.0', '144.0', '100', '240.0'],
    'a': 1,
    'why': 'İkinci hücre iki kez çalıştı: 100 → 120.0 → 144.0. Notebook\'ta bir hücreye yanlışlıkla iki kez Shift+Enter basmak tam olarak budur; ekranda kod değişmez ama değişkenin değeri değişir.' },
  { 't': 'predict', 'stage': 'Kodu oku', 'q': 'Notebook\'taki bir hücrenin JSON kaydını inceleyen bu kod ne yazdırır?',
    'code': r'''hucre = {"cell_type": "markdown", "source": ["# Başlık\n", "Açıklama"]}
metin = "".join(hucre["source"])
print(hucre["cell_type"] == "code", len(metin.splitlines()))
''',
    'o': ['True 2', 'False 1', 'False 2', 'False 3'],
    'a': 2,
    'why': 'Hücre markdown olduğu için ilk karşılaştırma False. source listesindeki parçalar kendi satır sonlarını taşır; "".join ile birleştirince "# Başlık\\nAçıklama" çıkar ve iki satırdır. Parçaları "\\n".join ile birleştirmek fazladan boş satır üretirdi.' },
  { 't': 'predict', 'stage': 'Kodu oku', 'q': 'Sihirli komut satırlarını ayıklayan bu kod ne yazdırır?',
    'code': r'''kod = "%matplotlib inline\nimport math\n!pip install -q rich\n  %time x = math.sqrt(16)\nprint('hazır')"
temiz = [s for s in kod.splitlines() if not s.startswith(("%", "!"))]
print(len(temiz))
print(temiz[-2].strip())
''',
    'o': ['2\nimport math', '3\n%time x = math.sqrt(16)', '3\nimport math', '4\n%time x = math.sqrt(16)'],
    'a': 1,
    'why': 'startswith baştaki boşluklara dikkat etmez: "  %time ..." boşlukla başladığı için elenmez. Kalan üç satır: import math, "  %time ...", print(...). Sondan ikincisi strip ile "%time x = math.sqrt(16)". Doğru filtre s.lstrip().startswith(...) olurdu.' },
  { 't': 'order', 'stage': 'Kodu oku',
    'q': '<p>En küçük geçerli notebook\'u Python ile oluşturup diske yazan ve geri okuyan betiği sırala. Önce başlık (markdown) hücresi, sonra kod hücresi eklenmeli.</p>',
    'lines': ['import json',
              'nb = {"nbformat": 4, "nbformat_minor": 5, "metadata": {}, "cells": []}',
              'nb["cells"].append({"cell_type": "markdown", "metadata": {}, "source": ["# Satış analizi"]})',
              'nb["cells"].append({"cell_type": "code", "metadata": {}, "execution_count": None, "outputs": [], "source": ["print(42)"]})',
              'with open("analiz.ipynb", "w", encoding="utf-8") as f:',
              '    json.dump(nb, f, ensure_ascii=False, indent=1)',
              'okunan = json.load(open("analiz.ipynb", encoding="utf-8"))',
              'print(len(okunan["cells"]), okunan["cells"][0]["cell_type"])'],
    'expect': '2 markdown\n',
    'hint': 'Notebook sözlüğü hücre eklenmeden önce var olmalı; dosya yazılmadan okunamaz. İlk hücre markdown.',
    'why': 'json içe aktarılır, boş notebook iskeleti kurulur, hücreler sırayla eklenir, dosyaya yazılır ve geri okunur. Bu sayede .ipynb dosyasının sadece bir JSON belgesi olduğunu görürsün; Jupyter bu dosyayı açabilir.' },

  { 't': 'code', 'stage': 'Rehberli', 'id': 'jupyter-colab-1', 'diff': 1,
    'q': '<p><code>kod_hucreleri(nb_metni)</code> fonksiyonunu yaz: <code>.ipynb</code> dosyasının JSON metnini alıp yalnız <b>kod</b> hücrelerinin kaynağını, sırasıyla, metin listesi olarak döndürsün. <code>source</code> alanı satır listesi ya da tek metin olabilir; liste ise parçaları <code>""</code> ile birleştir (parçalar kendi satır sonlarını taşır). Boş kod hücrelerini (yalnız boşluk içerenler dahil) atla.</p>',
    'guide': ['json.loads ile metni sözlüğe çevir.', 'nb["cells"] listesinde dön; cell_type "code" değilse atla.', 'source liste ise "".join, metin ise olduğu gibi kullan.', 'strip() sonrası boşsa atla; değilse listeye ekle (orijinal metni ekle).'],
    'example': r'''siparisler = [{"tur": "iade", "notlar": ["kutu ", "hasarlı"]}, {"tur": "satis", "notlar": "hızlı"}]
for s in siparisler:
    n = s["notlar"]
    metin = "".join(n) if isinstance(n, list) else n
    print(s["tur"], "->", metin)
''',
    'start': r'''import json

def kod_hucreleri(nb_metni):
    nb = json.loads(nb_metni)
    kodlar = []
    for hucre in nb["cells"]:
        # TODO: kod hücresi değilse atla
        # TODO: source liste ise birleştir
        # TODO: boş değilse kodlar'a ekle
        pass
    return kodlar
''',
    'sol': r'''import json

def kod_hucreleri(nb_metni):
    nb = json.loads(nb_metni)
    kodlar = []
    for hucre in nb["cells"]:
        if hucre.get("cell_type") != "code":
            continue
        kaynak = hucre.get("source", "")
        if isinstance(kaynak, list):
            kaynak = "".join(kaynak)
        if kaynak.strip():
            kodlar.append(kaynak)
    return kodlar
''',
    'tests': NB_TEST + r'''import json
nb["cells"].append({"cell_type": "code", "execution_count": None, "metadata": {}, "outputs": [], "source": ["  \n"]})
assert kod_hucreleri(json.dumps(nb)) == ["import math\nprint(42)", "x = 1"], "Yalnız dolu kod hücreleri, satır listesi \"\".join ile birleşmiş"
assert kod_hucreleri('{"cells": []}') == [], "Hücresiz notebook boş liste"
''',
    'hints': ['Hücre türünü hucre["cell_type"] ile kontrol et.', 'isinstance(kaynak, list) ise "".join(kaynak)', 'if kaynak.strip(): kodlar.append(kaynak)'],
    'why': 'nbformat, source alanını genellikle satır listesi olarak yazar ama tek metin de geçerlidir; sağlam kod ikisini de kabul eder. "".join doğru birleştirmedir çünkü her parça kendi \\n karakterini taşır.' },
  { 't': 'code', 'stage': 'Rehberli', 'id': 'jupyter-colab-2', 'diff': 2,
    'q': '<p>Notebook hücrelerini VS Code\'un çalıştırabildiği <b>yüzde biçimine</b> çeviren <code>py_formatina_cevir(hucreler)</code> fonksiyonunu yaz. <code>hucreler</code>, <code>(tur, kaynak)</code> demetlerinin listesidir.</p><ul><li>Kod hücresi: <code>"# %%\n" + kaynak</code></li><li>Markdown hücresi: <code>"# %% [markdown]\n"</code> + kaynağın her satırının başına <code>"# "</code> eklenmiş hâli (boş satır için yalnız <code>"#"</code>).</li><li>Diğer türler atlanır.</li><li>Parçaları <b>bir boş satırla</b> (<code>"\n\n"</code>) birleştir ve sonuna tek <code>"\n"</code> ekle.</li></ul>',
    'guide': ['Boş bir parcalar listesi oluştur.', 'Her (tur, kaynak) için türe göre dal: code / markdown / diğer.', 'Markdown satırlarını tek tek dönüştür: boşsa "#", değilse "# " + satır.', '"\\n\\n".join(parcalar) + "\\n" döndür.'],
    'example': r'''satirlar = ["Toplam ciro", "", "Şehir bazında"]
yorumlu = ["#" if s == "" else "# " + s for s in satirlar]
print("\n".join(yorumlu))
''',
    'start': r'''def py_formatina_cevir(hucreler):
    parcalar = []
    for tur, kaynak in hucreler:
        # TODO: code ise "# %%" başlığıyla ekle
        # TODO: markdown ise satırları yorum yapıp "# %% [markdown]" başlığıyla ekle
        pass
    return "\n\n".join(parcalar) + "\n"
''',
    'sol': r'''def py_formatina_cevir(hucreler):
    parcalar = []
    for tur, kaynak in hucreler:
        if tur == "code":
            parcalar.append("# %%\n" + kaynak)
        elif tur == "markdown":
            satirlar = ["#" if s == "" else "# " + s for s in kaynak.splitlines()]
            parcalar.append("# %% [markdown]\n" + "\n".join(satirlar))
    return "\n\n".join(parcalar) + "\n"
''',
    'tests': r'''h = [("markdown", "# İade raporu\n\nEkim 2026"), ("code", "iade = 41\nprint(iade)"), ("raw", "ham metin"), ("code", "x = 2")]
beklenen = "# %% [markdown]\n# # İade raporu\n#\n# Ekim 2026\n\n# %%\niade = 41\nprint(iade)\n\n# %%\nx = 2\n"
assert py_formatina_cevir(h) == beklenen, "Biçim: markdown satırları '# ' ile, boş satır '#', raw atlanır, parçalar arasında bir boş satır"
import io, contextlib
tampon = io.StringIO()
with contextlib.redirect_stdout(tampon):
    exec(py_formatina_cevir(h), {})
assert tampon.getvalue() == "41\n", "Üretilen betik geçerli Python olmalı ve çalışmalı"
assert py_formatina_cevir([("code", "a = 1")]) == "# %%\na = 1\n", "Tek kod hücresi"
''',
    'hints': ['Markdown kaynağını splitlines() ile böl, her satırı liste üreteciyle dönüştür.', 'Boş satır için "#" yaz ki sonda boşluk kalmasın: "#" if s == "" else "# " + s', 'parcalar.append("# %% [markdown]\\n" + "\\n".join(satirlar))'],
    'why': 'Yüzde biçimi, notebook\'un hücre yapısını korurken düz bir .py dosyası üretir: git farkları okunur, Ruff ve testler çalışır, VS Code yine hücre hücre çalıştırır. Markdown\'ı yorum yapmak dosyanın geçerli Python kalmasını sağlar.' },
  { 't': 'code', 'stage': 'Rehberli', 'id': 'jupyter-colab-3', 'diff': 1,
    'q': '<p>Notebook\'tan kopyalanan kod betikte çalışsın diye <code>sihirleri_temizle(kod)</code> fonksiyonunu yaz: baş boşlukları atıldığında <code>%</code> ya da <code>!</code> ile başlayan her satırın başına <code>"# "</code> ekleyerek yorum yapsın (girintiyi koru: <code>"    !ls"</code> → <code>"    # !ls"</code>). Diğer satırlar aynen kalsın. Satırları <code>"\n"</code> ile birleştirip döndür.</p>',
    'guide': ['kod.splitlines() ile satırlarda dön.', 'satir.lstrip() ile baştaki boşlukları atılmış hâlini al; % ya da ! ile mi başlıyor bak.', 'Girintiyi korumak için: girinti = satir[:len(satir) - len(satir.lstrip())]', 'Sihirli satırı girinti + "# " + satir.lstrip() olarak ekle; sonunda "\\n".join.'],
    'example': r'''satir = "    return toplam"
duz = satir.lstrip()
girinti = satir[:len(satir) - len(duz)]
print(repr(girinti), "|", duz)
''',
    'start': r'''def sihirleri_temizle(kod):
    sonuc = []
    for satir in kod.splitlines():
        # TODO: sihirli satırı girintisini koruyarak yorum yap
        sonuc.append(satir)
    return "\n".join(sonuc)
''',
    'sol': r'''def sihirleri_temizle(kod):
    sonuc = []
    for satir in kod.splitlines():
        duz = satir.lstrip()
        if duz.startswith(("%", "!")):
            girinti = satir[:len(satir) - len(duz)]
            sonuc.append(girinti + "# " + duz)
        else:
            sonuc.append(satir)
    return "\n".join(sonuc)
''',
    'tests': r'''k = "%matplotlib inline\nimport math\nif True:\n    !ls veri\n    x = math.sqrt(9)\n%%time\nprint(x)"
beklenen = "# %matplotlib inline\nimport math\nif True:\n    # !ls veri\n    x = math.sqrt(9)\n# %%time\nprint(x)"
assert sihirleri_temizle(k) == beklenen, "%, %% ve ! satırları yorum olmalı; girinti korunmalı"
assert sihirleri_temizle("a = 5 % 2\nprint('!')") == "a = 5 % 2\nprint('!')", "Satır ortasındaki % ve ! dokunulmamalı"
compile(sihirleri_temizle(k), "<betik>", "exec")
''',
    'hints': ['startswith bir demet alabilir: duz.startswith(("%", "!"))', 'Girinti = satırın başındaki boşluklar = satir[:len(satir) - len(duz)]'],
    'why': 'Sihirli komutlar Python sözdizimi değildir; betikte SyntaxError verir. Girintiyi korumak önemlidir: if bloğunun içindeki bir satırı girintisiz yorum yapmak bloğu bozmaz ama okuyucuyu yanıltır. Yalnız satır başına bakmak, mod operatörü (%) gibi meşru kullanımları korur.' },

  { 't': 'code', 'stage': 'Kendin yaz', 'id': 'jupyter-colab-4', 'diff': 1,
    'q': '<p><code>sira_bozuk_mu(nb)</code> fonksiyonunu yaz. <code>nb</code>, notebook sözlüğüdür. Kod hücrelerinin <code>execution_count</code> değerlerine (<code>None</code> olanları atlayarak) hücre sırasıyla bak; değerler <b>kesin artan</b> değilse <code>True</code>, artıyorsa (ya da hiç değer yoksa) <code>False</code> döndür.</p>',
    'start': 'def sira_bozuk_mu(nb):\n    pass\n',
    'sol': r'''def sira_bozuk_mu(nb):
    sayaclar = [h.get("execution_count") for h in nb.get("cells", []) if h.get("cell_type") == "code"]
    sayaclar = [s for s in sayaclar if s is not None]
    return any(a >= b for a, b in zip(sayaclar, sayaclar[1:]))
''',
    'tests': r'''def nb_yap(*sayaclar):
    return {"cells": [{"cell_type": "code", "execution_count": s, "source": ""} for s in sayaclar]}
assert sira_bozuk_mu(nb_yap(1, 2, 3)) is False, "1, 2, 3 temiz"
assert sira_bozuk_mu(nb_yap(4, 2, 7)) is True, "4'ten sonra 2: bozuk"
assert sira_bozuk_mu(nb_yap(1, 5, 9)) is False, "Atlamalar sorun değil (arada silinmiş hücreler olabilir); önemli olan artış"
assert sira_bozuk_mu(nb_yap(1, None, 2)) is False, "Çalıştırılmamış hücre (None) atlanır"
assert sira_bozuk_mu(nb_yap(3, 3)) is True, "Aynı sayaç iki kez: kesin artan değil"
m = {"cells": [{"cell_type": "markdown", "source": ""}, {"cell_type": "code", "execution_count": 2, "source": ""}, {"cell_type": "code", "execution_count": 1, "source": ""}]}
assert sira_bozuk_mu(m) is True, "Markdown hücreleri yok sayılır; 2 sonra 1 bozuk"
assert sira_bozuk_mu({"cells": []}) is False, "Boş notebook"
''',
    'hints': ['Önce kod hücrelerinin None olmayan sayaçlarını sırayla bir listeye topla.', 'zip(liste, liste[1:]) ardışık çiftleri verir; any(a >= b ...) bozuk çift var mı söyler.'],
    'why': 'zip(liste, liste[1:]) ardışık eleman çiftlerini dolaşmanın Python\'daki kısa yoludur. Bu küçük denetim, CI\'da "karışık sırada çalıştırılmış notebook" uyarısı vermek için kullanılabilir.' },
  { 't': 'code', 'stage': 'Kendin yaz', 'id': 'jupyter-colab-5', 'diff': 2,
    'q': '<p><code>ciktilari_temizle(nb)</code> fonksiyonunu yaz (nbstripout\'un yaptığı iş): her kod hücresinin <code>outputs</code> alanını boş listeye, <code>execution_count</code> alanını <code>None</code>\'a çeviren <b>yeni</b> bir notebook sözlüğü döndür. Orijinal sözlük <b>değişmemeli</b>. Markdown ve raw hücreler aynen kalır.</p>',
    'start': 'import copy\n\ndef ciktilari_temizle(nb):\n    pass\n',
    'sol': r'''import copy

def ciktilari_temizle(nb):
    yeni = copy.deepcopy(nb)
    for hucre in yeni.get("cells", []):
        if hucre.get("cell_type") == "code":
            hucre["outputs"] = []
            hucre["execution_count"] = None
    return yeni
''',
    'tests': NB_TEST + r'''import copy
orijinal = copy.deepcopy(nb)
t = ciktilari_temizle(nb)
assert nb == orijinal, "Orijinal notebook değişmemeli: deepcopy kullan"
kodlar = [h for h in t["cells"] if h["cell_type"] == "code"]
assert all(h["outputs"] == [] and h["execution_count"] is None for h in kodlar), "Tüm kod hücrelerinde çıktı ve sayaç temizlenmeli"
assert t["cells"][0] == nb["cells"][0] and t["cells"][2] == nb["cells"][2], "Markdown ve raw hücreler aynen kalmalı"
assert t["cells"][1]["source"] == ["import math\n", "print(42)"], "Kaynak kod korunmalı"
assert t["cells"][1] is not nb["cells"][1], "Yeni sözlük, eski hücre nesnelerini paylaşmamalı"
''',
    'hints': ['Sığ kopya (dict(nb) ya da nb.copy()) hücre listesini paylaşır; iç içe yapı için copy.deepcopy gerekir.', 'Kopya üzerinde dön ve yalnız code hücrelerini değiştir.'],
    'why': 'Notebook iç içe sözlük ve listelerden oluşur; sığ kopyayı değiştirmek orijinali de değiştirir. deepcopy tüm yapıyı kopyalar. Çıktısız ve sayaçsız notebook git\'te küçük ve okunur farklar üretir.' },
  { 't': 'code', 'stage': 'Kendin yaz', 'id': 'jupyter-colab-6', 'diff': 2,
    'q': '<p>Basit bir conda <code>environment.yml</code> dosyasını ayrıştıran <code>conda_ortami_oku(metin)</code> fonksiyonunu yaz. Biçim:</p><pre>name: analiz\nchannels:\n  - conda-forge\ndependencies:\n  - python=3.12\n  - pandas\n  - pip\n  - pip:\n    - rich==13.7.1</pre><p>Sözlük döndür: <code>{"ad": "analiz", "kanallar": ["conda-forge"], "conda": ["python=3.12", "pandas", "pip"], "pip": ["rich==13.7.1"]}</code>. Kurallar: <code>- pip:</code> satırından sonraki <b>daha derin girintili</b> öğeler pip listesine gider; boş ve <code>#</code> ile başlayan satırlar atlanır; eksik bölümler boş liste, ad yoksa <code>None</code>.</p>',
    'start': 'def conda_ortami_oku(metin):\n    pass\n',
    'sol': r'''def conda_ortami_oku(metin):
    sonuc = {"ad": None, "kanallar": [], "conda": [], "pip": []}
    bolum = None
    pip_girinti = None
    for satir in metin.splitlines():
        duz = satir.strip()
        if not duz or duz.startswith("#"):
            continue
        girinti = len(satir) - len(satir.lstrip())
        if girinti == 0:
            anahtar, _, deger = duz.partition(":")
            deger = deger.strip()
            if anahtar == "name":
                sonuc["ad"] = deger or None
            bolum = anahtar
            pip_girinti = None
            continue
        if not duz.startswith("- "):
            continue
        oge = duz[2:].strip()
        if bolum == "channels":
            sonuc["kanallar"].append(oge)
        elif bolum == "dependencies":
            if oge == "pip:":
                pip_girinti = girinti
            elif pip_girinti is not None and girinti > pip_girinti:
                sonuc["pip"].append(oge)
            else:
                pip_girinti = None
                sonuc["conda"].append(oge)
    return sonuc
''',
    'tests': r'''m = """name: analiz
channels:
  - conda-forge
  - defaults
# yorum
dependencies:
  - python=3.12
  - pandas>=2.2

  - pip
  - pip:
    - rich==13.7.1
    - papermill
"""
assert conda_ortami_oku(m) == {"ad": "analiz", "kanallar": ["conda-forge", "defaults"], "conda": ["python=3.12", "pandas>=2.2", "pip"], "pip": ["rich==13.7.1", "papermill"]}, "Tam örnek: '- pip' conda paketi, '- pip:' altındakiler pip listesi"
m2 = "dependencies:\n  - pip:\n    - httpx\n  - numpy\n"
assert conda_ortami_oku(m2) == {"ad": None, "kanallar": [], "conda": ["numpy"], "pip": ["httpx"]}, "pip bloğundan sonra aynı girintide gelen öğe tekrar conda'ya aittir; ad yoksa None"
assert conda_ortami_oku("") == {"ad": None, "kanallar": [], "conda": [], "pip": []}, "Boş dosya"
''',
    'hints': ['Satırın girintisi = len(satir) - len(satir.lstrip()); girintisi 0 olan satırlar bölüm başlığıdır (partition(":") ile böl).', '"- pip:" görünce girintisini hatırla; sonraki öğelerden girintisi daha büyük olanlar pip\'e, eşit olan ilk öğe pip bloğunu kapatır.'],
    'why': 'YAML gibi girintiye dayalı biçimlerde anlam girinti seviyesindedir; bu yüzden durum (hangi bölümdeyim, pip bloğu açık mı) tutarak satır satır ilerlemek gerekir. Gerçek projede pyyaml kullanırsın; ama bu alıştırma "- pip" (conda paketi) ile "- pip:" (alt liste) farkını netleştirir.' },
  { 't': 'code', 'stage': 'Kendin yaz', 'id': 'jupyter-colab-7', 'diff': 2,
    'q': '<p><code>sihir_ayristir(satir)</code> fonksiyonunu yaz. Baş/son boşlukları atılmış satıra göre demet döndür:</p><ul><li><code>%%</code> ile başlıyorsa <code>("hucre", ad, arguman)</code>: <code>"%%time"</code> → <code>("hucre", "time", "")</code></li><li><code>%</code> ile başlıyorsa <code>("satir", ad, arguman)</code>: <code>"%timeit sum(x)"</code> → <code>("satir", "timeit", "sum(x)")</code></li><li><code>!</code> ile başlıyorsa <code>("kabuk", komut, arguman)</code>: <code>"!pip install -q rich"</code> → <code>("kabuk", "pip", "install -q rich")</code></li><li>Hiçbiri değilse <code>None</code>.</li></ul><p>Ad ile argüman ilk boşluktan ayrılır; argümanın baş/son boşlukları atılır.</p>',
    'start': 'def sihir_ayristir(satir):\n    pass\n',
    'sol': r'''def sihir_ayristir(satir):
    s = satir.strip()
    for onek, tur in (("%%", "hucre"), ("%", "satir"), ("!", "kabuk")):
        if s.startswith(onek):
            govde = s[len(onek):]
            ad, _, arguman = govde.partition(" ")
            return (tur, ad, arguman.strip())
    return None
''',
    'tests': r'''assert sihir_ayristir("%%time") == ("hucre", "time", ""), "Hücre sihri, argümansız"
assert sihir_ayristir("%timeit sum(x)") == ("satir", "timeit", "sum(x)"), "Satır sihri"
assert sihir_ayristir("  !pip install -q rich  ") == ("kabuk", "pip", "install -q rich"), "Kabuk komutu; boşluklar kırpılır"
assert sihir_ayristir("%%writefile rapor.py") == ("hucre", "writefile", "rapor.py"), "%% kontrolü % kontrolünden önce yapılmalı"
assert sihir_ayristir("%pip   install pandas") == ("satir", "pip", "install pandas"), "Argümandaki fazla baş boşluk atılır"
assert sihir_ayristir("x = 10 % 3") is None, "Normal Python satırı"
''',
    'hints': ['Önek kontrol sırası önemli: "%%" önce, sonra "%", sonra "!". Aksi hâlde "%%time" satır sihri sanılır.', 'str.partition(" ") ilk boşluktan böler ve boşluk yoksa üçüncü parça "" olur.'],
    'why': 'Daha uzun önekin önce denenmesi, ayrıştırıcılardaki "en uzun eşleşme" ilkesinin basit bir örneğidir. partition, split\'ten farklı olarak her zaman üç parça döndürdüğü için argümansız durumda hata vermez.' },

  { 't': 'code', 'stage': 'Hata avı', 'kind': 'bug', 'id': 'jupyter-colab-8', 'diff': 1,
    'q': '<p>Hatayı bul ve düzelt. <code>hucre_sayilari(nb)</code> notebook\'taki hücre türlerini saymalı ve <code>{"code": 2, "markdown": 1, ...}</code> gibi bir sözlük döndürmeli. Kod çöküyor; düzeltilse bile ilk hücreyi saymıyor.</p>',
    'start': r'''def hucre_sayilari(nb):
    sayac = {}
    for hucre in nb["cells"][1:]:
        sayac[hucre["cell_type"]] += 1
    return sayac
''',
    'sol': r'''def hucre_sayilari(nb):
    sayac = {}
    for hucre in nb["cells"]:
        tur = hucre["cell_type"]
        sayac[tur] = sayac.get(tur, 0) + 1
    return sayac
''',
    'tests': NB_TEST + r'''assert hucre_sayilari(nb) == {"markdown": 1, "code": 3, "raw": 1}, "Tüm hücreler sayılmalı (ilki dahil)"
assert hucre_sayilari({"cells": []}) == {}, "Boş notebook boş sözlük"
assert hucre_sayilari({"cells": [{"cell_type": "markdown"}]}) == {"markdown": 1}, "Tek hücre de sayılmalı"
''',
    'hints': ['Var olmayan anahtara += uygulamak KeyError verir; get(tur, 0) + 1 kullan (ya da collections.Counter).', '[1:] dilimi ilk hücreyi atlar; çoğu notebook\'ta bu başlık hücresidir.'],
    'why': 'Sayma kalıbında anahtar ilk kez görüldüğünde değeri yoktur; dict.get(anahtar, 0) ya da Counter bu durumu çözer. "İlk satır başlıktır" alışkanlığıyla yazılan [1:] dilimi, CSV\'de doğru olabilir ama notebook hücrelerinde veri kaybettirir.' },
  { 't': 'code', 'stage': 'Hata avı', 'kind': 'bug', 'id': 'jupyter-colab-9', 'diff': 2,
    'q': '<p>Hatayı bul ve düzelt. <code>calistir(hucreler)</code>, kod hücrelerini sırayla <b>yeni ve boş bir çekirdekte</b> çalıştırmalı ve kullanıcı değişkenlerini (<code>__</code> ile başlamayan adlar) sözlük olarak döndürmeli. Her çağrı temiz başlamalı; ama ikinci çağrı birincinin değişkenlerini görüyor. Bu tam olarak notebook\'lardaki gizli durum hatasıdır.</p>',
    'start': r'''def calistir(hucreler, cekirdek={}):
    for kod in hucreler:
        exec(kod, cekirdek)
    return {k: v for k, v in cekirdek.items() if not k.startswith("__")}
''',
    'sol': r'''def calistir(hucreler, cekirdek=None):
    if cekirdek is None:
        cekirdek = {}
    for kod in hucreler:
        exec(kod, cekirdek)
    return {k: v for k, v in cekirdek.items() if not k.startswith("__")}
''',
    'tests': r'''assert calistir(["a = 1", "b = a + 1"]) == {"a": 1, "b": 2}, "Hücreler sırayla aynı çekirdekte çalışmalı"
assert calistir(["c = 10"]) == {"c": 10}, "İkinci çağrı temiz başlamalı; önceki a ve b görünmemeli"
try:
    calistir(["print(a)"])
    assert False, "Yeni çekirdekte a tanımsız olmalı (NameError)"
except NameError:
    pass
ortak = {}
calistir(["x = 5"], ortak)
assert calistir(["y = x * 2"], ortak) == {"x": 5, "y": 10}, "Açıkça verilen çekirdek paylaşılabilmeli"
''',
    'hints': ['Varsayılan parametre değeri fonksiyon tanımlanırken BİR KEZ oluşturulur; değiştirilebilir {} tüm çağrılarda paylaşılır.', 'cekirdek=None yap ve fonksiyonun içinde if cekirdek is None: cekirdek = {}'],
    'why': 'Değiştirilebilir varsayılan argüman Python\'un en bilinen tuzaklarındandır ve burada notebook\'un gizli durumunu birebir taklit eder: önceki çalıştırmanın kalıntıları sonraki sonucu sessizce etkiler. None nöbetçisi her çağrıda yeni bir sözlük oluşturur.' },

  { 't': 'code', 'stage': 'Meydan okuma', 'id': 'jupyter-colab-10', 'diff': 3,
    'q': '<p>CI\'da kullanılacak <code>bastan_calistir(nb)</code> fonksiyonunu yaz ("Restart and Run All" denetimi). <code>nb</code> notebook sözlüğüdür.</p><ul><li>Kod hücrelerini (source liste ya da metin olabilir) sırayla, tek bir yeni ad alanında <code>exec</code> ile çalıştır.</li><li>Baş boşlukları atıldığında <code>%</code> ya da <code>!</code> ile başlayan satırları atla (<code>%%</code> ile başlayan bir hücre sihri varsa <b>hücrenin tamamını</b> atla).</li><li>Çalıştırma sırasında yazdırılanlar ekrana çıkmasın; yakala.</li><li>Başarılıysa <code>{"durum": "temiz", "cikti": &lt;toplam stdout&gt;}</code>.</li><li>Bir hücre hata verirse dur ve <code>{"durum": "hata", "hucre": &lt;notebook içindeki hücre indeksi, markdown dahil&gt;, "hata": &lt;hata sınıfının adı&gt;, "cikti": &lt;o ana kadarki stdout&gt;}</code> döndür.</li></ul>',
    'start': 'import io, contextlib\n\ndef bastan_calistir(nb):\n    pass\n',
    'sol': r'''import io, contextlib

def bastan_calistir(nb):
    ad_alani = {"__name__": "__main__"}
    tampon = io.StringIO()
    for i, hucre in enumerate(nb.get("cells", [])):
        if hucre.get("cell_type") != "code":
            continue
        kaynak = hucre.get("source", "")
        if isinstance(kaynak, list):
            kaynak = "".join(kaynak)
        if kaynak.lstrip().startswith("%%"):
            continue
        satirlar = [s for s in kaynak.splitlines() if not s.lstrip().startswith(("%", "!"))]
        try:
            with contextlib.redirect_stdout(tampon):
                exec("\n".join(satirlar), ad_alani)
        except Exception as e:
            return {"durum": "hata", "hucre": i, "hata": type(e).__name__, "cikti": tampon.getvalue()}
    return {"durum": "temiz", "cikti": tampon.getvalue()}
''',
    'tests': r'''def h(tur, src):
    return {"cell_type": tur, "metadata": {}, "source": src}
nb = {"cells": [
    h("markdown", "# Ciro"),
    h("code", ["%matplotlib inline\n", "import statistics\n", "!pip install -q rich\n", "ciro = [120, 80, 100]"]),
    h("code", "%%time\nbu_hucre_atlanir()"),
    h("code", "ort = statistics.mean(ciro)\nprint('ortalama', ort)"),
]}
r = bastan_calistir(nb)
assert r == {"durum": "temiz", "cikti": "ortalama 100\n"}, "Sihirli satırlar ve %% hücresi atlanmalı; çıktı yakalanmalı"
nb2 = {"cells": [
    h("code", "print('başla')"),
    h("markdown", "ara"),
    h("code", "toplam = sum(satislar)"),
    h("code", "print('buraya gelinmez')"),
]}
r2 = bastan_calistir(nb2)
assert r2 == {"durum": "hata", "hucre": 2, "hata": "NameError", "cikti": "başla\n"}, "Gizli durum: satislar tanımsız; hücre indeksi markdown dahil sayılır, sonrası çalışmaz"
assert bastan_calistir({"cells": [h("code", "1/0")]})["hata"] == "ZeroDivisionError", "Hata sınıfının adı"
assert bastan_calistir({"cells": []}) == {"durum": "temiz", "cikti": ""}, "Boş notebook temizdir"
''',
    'hints': ['enumerate ile tüm hücrelerde dön ki indeks markdown hücrelerini de saysın; kod olmayanları continue ile geç.', 'contextlib.redirect_stdout(tampon) bloğu içindeki print\'leri bir StringIO\'ya yönlendirir.', 'Hücre kaynağı lstrip() sonrası "%%" ile başlıyorsa tüm hücreyi atla; değilse satır satır filtrele.'],
    'why': 'Bu, nbconvert --execute ve papermill\'in yaptığı denetimin küçük bir modelidir: tek ad alanı, sıralı çalıştırma, ilk hatada durma ve hatanın konumunu raporlama. Gizli duruma dayanan bir notebook burada hemen NameError verir.' },
  { 't': 'code', 'stage': 'Mini proje', 'id': 'jupyter-colab-11', 'diff': 3,
    'q': '<p>Ekibin notebook\'larını inceleyen <code>notebook_raporu(nb_metni)</code> fonksiyonunu yaz. JSON metnini okuyup sözlük döndür:</p><ul><li><code>"hucreler"</code>: tür → adet sözlüğü.</li><li><code>"kod_satiri"</code>: kod hücrelerindeki boş olmayan satır sayısı (sihirli satırlar dahil).</li><li><code>"sihirler"</code>: kullanılan satır/hücre sihirlerinin adları (<code>%</code>/<code>%%</code> sonrası ilk kelime), tekrarsız, alfabetik.</li><li><code>"pip_paketleri"</code>: <code>!pip install</code> ya da <code>%pip install</code> satırlarındaki paketler; <code>shlex.split</code> ile parçala, <code>-</code> ile başlayan seçenekleri atla; tekrarsız, ilk görülme sırasıyla.</li><li><code>"sira_bozuk"</code>: kod hücrelerinin None olmayan sayaçları kesin artan değilse True.</li><li><code>"cikti_sayisi"</code>: tüm kod hücrelerindeki <code>outputs</code> öğelerinin toplamı.</li><li><code>"uyarilar"</code>: alfabetik liste; <code>"BANG_PIP"</code> (<code>!pip</code> kullanılmışsa), <code>"SIRA"</code> (sıra bozuksa), <code>"CIKTI"</code> (çıktı sayısı 0\'dan büyükse; git\'e çıktılı notebook girmesin).</li></ul>',
    'start': 'import json, shlex\n\ndef notebook_raporu(nb_metni):\n    pass\n',
    'sol': r'''import json, shlex

def notebook_raporu(nb_metni):
    nb = json.loads(nb_metni)
    hucreler, sihirler, paketler = {}, set(), []
    kod_satiri = cikti = 0
    sayaclar = []
    bang_pip = False
    for h in nb.get("cells", []):
        tur = h.get("cell_type")
        hucreler[tur] = hucreler.get(tur, 0) + 1
        if tur != "code":
            continue
        cikti += len(h.get("outputs", []))
        if h.get("execution_count") is not None:
            sayaclar.append(h["execution_count"])
        kaynak = h.get("source", "")
        if isinstance(kaynak, list):
            kaynak = "".join(kaynak)
        for satir in kaynak.splitlines():
            s = satir.strip()
            if not s:
                continue
            kod_satiri += 1
            if s.startswith("%"):
                ad = s.lstrip("%").split()[0] if s.lstrip("%") else ""
                if ad:
                    sihirler.add(ad)
            parcalar = shlex.split(s.lstrip("%!"))
            if s[0] in "%!" and parcalar[:2] == ["pip", "install"]:
                if s.startswith("!"):
                    bang_pip = True
                for p in parcalar[2:]:
                    if not p.startswith("-") and p not in paketler:
                        paketler.append(p)
    sira_bozuk = any(a >= b for a, b in zip(sayaclar, sayaclar[1:]))
    uyarilar = []
    if bang_pip:
        uyarilar.append("BANG_PIP")
    if sira_bozuk:
        uyarilar.append("SIRA")
    if cikti > 0:
        uyarilar.append("CIKTI")
    return {
        "hucreler": hucreler,
        "kod_satiri": kod_satiri,
        "sihirler": sorted(sihirler),
        "pip_paketleri": paketler,
        "sira_bozuk": sira_bozuk,
        "cikti_sayisi": cikti,
        "uyarilar": sorted(uyarilar),
    }
''',
    'tests': r'''import json
def kod(src, sayac=None, ciktilar=0):
    return {"cell_type": "code", "metadata": {}, "execution_count": sayac, "outputs": [{"output_type": "stream", "text": "x"}] * ciktilar, "source": src}
nb = {"nbformat": 4, "nbformat_minor": 5, "metadata": {}, "cells": [
    {"cell_type": "markdown", "metadata": {}, "source": ["# İade analizi"]},
    kod(["!pip install -q pandas 'openpyxl>=3.1'\n", "%matplotlib inline\n", "\n", "import pandas as pd"], 3, 1),
    kod("%%time\nx = 1\n%pip install pandas rich", 2, 0),
    kod(["%timeit sum(range(9))"], None, 2),
]}
r = notebook_raporu(json.dumps(nb))
assert r["hucreler"] == {"markdown": 1, "code": 3}, "Hücre türleri"
assert r["kod_satiri"] == 7, "Boş olmayan kod satırları: 3 + 3 + 1"
assert r["sihirler"] == ["matplotlib", "pip", "time", "timeit"], "Sihir adları tekrarsız ve alfabetik (%pip de satır sihridir)"
assert r["pip_paketleri"] == ["pandas", "openpyxl>=3.1", "rich"], "Seçenekler (-q) atlanır, tırnaklı belirteç tek parça, tekrar yok, ilk görülme sırası"
assert r["sira_bozuk"] is True, "3'ten sonra 2: sıra bozuk"
assert r["cikti_sayisi"] == 3, "1 + 0 + 2 çıktı"
assert r["uyarilar"] == ["BANG_PIP", "CIKTI", "SIRA"], "Üç uyarı, alfabetik"
temiz = {"cells": [kod("%pip install httpx\nimport httpx", 1), kod("print(1)", 2)]}
r2 = notebook_raporu(json.dumps(temiz))
assert r2["uyarilar"] == [] and r2["pip_paketleri"] == ["httpx"] and r2["sira_bozuk"] is False, "Temiz notebook: %pip uyarı değildir"
assert notebook_raporu('{"cells": []}')["kod_satiri"] == 0, "Boş notebook"
''',
    'hints': ['Hücre başına: türü say; kod hücresinde çıktıları ve sayacı topla; source\'u birleştirip satır satır işle.', 'Sihir adı: s.lstrip("%").split()[0]; pip satırı: shlex.split(s.lstrip("%!")) ilk iki parçası ["pip", "install"] ise sonrakilerden - ile başlamayanları al.', 'Uyarıları ayrı bayraklarla topla ve en sonda sorted ile döndür.'],
    'why': 'Bu rapor, dersin tüm konularını bir araya getirir: .ipynb JSON yapısı, source alanının iki biçimi, sihirli komutlar, !pip ile %pip farkı, çalıştırma sırası ve çıktıların git\'e girmesi. Ekipler benzer betikleri pre-commit kancası ya da CI adımı olarak çalıştırır.' },
]

LESSON = {
  'id': 'jupyter-colab', 'lv': 'temel', 'mod': 'Başlangıç', 'min': 40,
  'title': 'Jupyter, Colab ve conda',
  'sum': 'Jupyter ve Colab\'de hücrelerle çalışır, gizli durum tuzağından Restart and Run All ile korunur, sihirli komutları, conda ortamlarını ve notebook\'tan .py betiğine geçişi öğrenirsin.',
  'goals': ['JupyterLab\'ı venv içine kurup kod ve markdown hücreleriyle kısayolları kullanarak çalışabilirim.',
            'Çalıştırma sayaçlarını okuyup gizli durumu fark eder, Restart and Run All ile notebook\'u doğrulayabilirim.',
            '%timeit, %%time, %pip gibi sihirli komutları kullanır, !pip ile %pip farkını açıklayabilirim.',
            'conda ile ortam oluşturur, Colab\'de Drive bağlayıp kalıcı dosyalarla çalışabilirim.',
            '.ipynb JSON yapısını işler, notebook\'u nbconvert ya da yüzde biçimiyle .py dosyasına taşıyabilirim.'],
  'body': BODY, 'ex': EX,
  'faq': [
    {'q': 'JupyterLab mı klasik Notebook mu, yoksa VS Code mu?', 'a': 'Üçü de aynı .ipynb dosyasını açar. JupyterLab tarayıcıda zengin bir ortam sunar; VS Code ise notebook\'u kodun geri kalanıyla, git ve hata ayıklayıcıyla aynı yerde tutar. Projen .py modülleri de içeriyorsa VS Code daha pratiktir.'},
    {'q': 'Anaconda kurmam şart mı?', 'a': 'Hayır. pip ve venv ile jupyterlab, pandas ve matplotlib rahatça kurulur. conda; GDAL, CUDA gibi Python dışı bağımlılıkları olan paketlerde ya da ekip conda kullanıyorsa öne çıkar. Hafif başlangıç için Miniconda/Miniforge yeterlidir.'},
    {'q': 'Colab\'in ücretsiz GPU\'su ile model eğitebilir miyim?', 'a': 'Küçük ve orta deneyler için evet; ama süre ve kaynak sınırlıdır, oturum beklenmedik anda kapanabilir. Ara sonuçları (model ağırlıkları, işlenmiş veri) düzenli olarak Drive\'a kaydet.'},
    {'q': 'Notebook\'u git\'e nasıl eklemeliyim?', 'a': 'Kaydetmeden önce çıktıları temizle (Edit → Clear All Outputs ya da nbstripout). Ortak fonksiyonları .py modüllerine taşı. Gerekirse Jupytext ile notebook\'un .py eşini de tut; kod incelemesi o dosya üzerinden yapılır.'},
  ],
  'mistakes': [
    {'bad': '!pip install openpyxl', 'good': '%pip install openpyxl', 'why': '! kabuktaki ilk pip\'i çalıştırır ve paket çekirdekten farklı bir Python\'a gidebilir. %pip her zaman çalışan çekirdeğin ortamına kurar.'},
    {'bad': '# Hücre 5: kur = 34.0\n# Hücre 2 yeniden çalıştırıldı, hücre 5 silindi\nprint(tutar_tl)', 'good': '# Kernel → Restart Kernel and Run All Cells\n# Tüm tanımlar yukarıdan aşağı sırada', 'why': 'Silinen ya da sonradan çalıştırılan hücrelerin değişkenleri bellekte kalır. Notebook\'u paylaşmadan önce baştan çalıştırmak gizli durumu ortaya çıkarır.'},
    {'bad': 'kaynak = "\\n".join(hucre["source"])', 'good': 'kaynak = hucre["source"] if isinstance(hucre["source"], str) else "".join(hucre["source"])', 'why': 'source listesindeki her parça zaten satır sonunu taşır; "\\n" ile birleştirmek fazladan boş satırlar üretir. Ayrıca source tek metin de olabilir.'},
    {'bad': 'df = pd.read_csv("/content/siparisler.csv")   # Colab', 'good': 'from google.colab import drive\ndrive.mount("/content/drive")\ndf = pd.read_csv("/content/drive/MyDrive/anadolu/siparisler.csv")', 'why': '/content geçicidir; oturum sıfırlanınca yüklenen dosyalar silinir. Drive\'daki dosyalar kalıcıdır.'},
  ],
}

if __name__ == '__main__':
    emit(LESSON, '/home/claude/py/v2/t1/jupyter-colab.js')
