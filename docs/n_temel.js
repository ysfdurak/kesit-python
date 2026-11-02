/* PythonPatika — v2/t1: jupyter-colab */
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push(
{
  id: 'jupyter-colab',
  lv: 'temel',
  mod: 'Başlangıç',
  min: 40,
  title: 'Jupyter, Colab ve conda',
  sum: 'Jupyter ve Colab\'de hücrelerle çalışır, gizli durum tuzağından Restart and Run All ile korunur, sihirli komutları, conda ortamlarını ve notebook\'tan .py betiğine geçişi öğrenirsin.',
  goals: [
    'JupyterLab\'ı venv içine kurup kod ve markdown hücreleriyle kısayolları kullanarak çalışabilirim.',
    'Çalıştırma sayaçlarını okuyup gizli durumu fark eder, Restart and Run All ile notebook\'u doğrulayabilirim.',
    '%timeit, %%time, %pip gibi sihirli komutları kullanır, !pip ile %pip farkını açıklayabilirim.',
    'conda ile ortam oluşturur, Colab\'de Drive bağlayıp kalıcı dosyalarla çalışabilirim.',
    '.ipynb JSON yapısını işler, notebook\'u nbconvert ya da yüzde biçimiyle .py dosyasına taşıyabilirim.'
  ],
  body: `
<h2>Defter gibi çalışmak</h2>
<p>Veri analistinin günü çoğu zaman bir soruyla başlar: "Geçen ay İzmir'de iade oranı neden arttı?" Bu tür sorularda kodu baştan sona yazıp çalıştırmak yerine adım adım ilerlemek istersin: veriyi oku, ilk beş satıra bak, bir filtre dene, grafiği çiz, yorum yaz. <b>Jupyter Notebook</b> tam bunun için var. Kod, çıktı, grafik ve açıklama metni tek bir belgede, <b>hücre (cell)</b> denen bloklar hâlinde yan yana durur. <b>Kurulum ve araçlar</b> dersinde Jupyter'a kısaca bakmıştın; bu derste notebook'u bilinçli kullanmayı, en tehlikeli tuzağı (gizli durum), Colab'i, conda'yı ve notebook'tan gerçek bir betiğe geçişi öğreneceksin.</p>

<h2>Kurulum ve ilk açılış</h2>
<p>Jupyter bir Python paketidir; projenin sanal ortamına kurulur:</p>
<pre class="code">python -m venv .venv
source .venv/bin/activate           # Windows: .venv\\Scripts\\Activate.ps1
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
  {"cell_type": "markdown", "metadata": {}, "source": ["# İade analizi\\\\n", "Ekim 2026"]},
  {"cell_type": "code", "execution_count": 2, "metadata": {}, "outputs": [],
   "source": ["import pandas as pd\\\\n", "df = pd.read_csv('iadeler.csv')"]},
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
    ("markdown", "# Şehir bazında iade\\nEkim verisi"),
    ("code", "iadeler = {'İzmir': 41, 'Ankara': 28}"),
    ("code", "print(max(iadeler, key=iadeler.get))"),
]
parcalar = []
for tur, kaynak in hucreler:
    if tur == "markdown":
        yorum = "\\n".join("# " + s for s in kaynak.splitlines())
        parcalar.append("# %% [markdown]\\n" + yorum)
    else:
        parcalar.append("# %%\\n" + kaynak)
betik = "\\n\\n".join(parcalar)
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
    "%matplotlib inline\\nimport math",
    "yaricap = 3",
    "alan = math.pi * yaricap ** 2",
    "print(round(alan, 2), cevre)",
]

def bastan_calistir(kod_hucreleri):
    ad_alani = {}
    for i, kod in enumerate(kod_hucreleri):
        temiz = "\\n".join(s for s in kod.splitlines() if not s.lstrip().startswith(("%", "!")))
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
`,
  ex: [
    {
      t: 'mc',
      stage: 'Isınma',
      q: 'Bir notebook hücresinde <code>!pip install openpyxl</code> çalıştırdın, kurulum başarılı göründü; ama <code>import openpyxl</code> <code>ModuleNotFoundError</code> veriyor. En olası neden ve çözüm hangisi?',
      o: [
        'Paket bozuk indirildi; önbelleği temizleyip aynı komutu tekrarlamak gerekir',
        'Kabuktaki pip başka bir Python\'a kurdu; <code>%pip install</code> kullan',
        'Notebook\'ta import yalnız ilk hücrede yapılabilir; hücreyi en üste taşı',
        'Jupyter dış paketleri desteklemez; kodu .py dosyasına taşımak gerekir'
      ],
      a: 1,
      why: '! satırı işletim sistemi kabuğunda çalışır ve PATH\'teki ilk pip\'i kullanır; bu pip çekirdeğin ortamına ait olmayabilir. %pip, çalışan çekirdeğin Python\'ına kurar. Kurulumdan sonra bazen çekirdeği yeniden başlatmak da gerekir.'
    },
    {
      t: 'mc',
      stage: 'Isınma',
      q: 'Notebook\'ta hücreler yukarıdan aşağı şu sayaçları gösteriyor: <code>[4]</code>, <code>[2]</code>, <code>[7]</code>. Bu ne anlama gelir ve ne yapmalısın?',
      o: [
        'Hücreler karışık sırada çalışmış; sonuca güvenmeden önce Restart and Run All yap',
        'Üç hücre aynı anda paralel çalışmış; sonuçlar bu yüzden daha hızlı gelmiş',
        'Sayaçlar hücrenin kaç saniye sürdüğünü gösterir; en uzun süren 7 saniye',
        'Sayaçlar yalnızca bilgi amaçlıdır, notebook\'un doğruluğuyla ilgisi yoktur'
      ],
      a: 0,
      why: 'Sayaç, hücrenin çekirdekte kaçıncı çalıştırıldığını gösterir. Artmayan sayaçlar, ikinci hücrenin birinciden önce çalıştığını ve aradaki çalıştırmaların silinmiş ya da üzerine yazılmış olabileceğini söyler. Gizli durumdan kurtulmanın yolu çekirdeği yeniden başlatıp baştan çalıştırmaktır.'
    },
    {
      t: 'mc',
      stage: 'Isınma',
      q: 'Colab\'de dünkü oturumda <code>/content/siparisler.csv</code> dosyasını yükleyip analiz ettin. Bugün aynı notebook\'u açınca <code>FileNotFoundError</code> alıyorsun. Kalıcı çözüm hangisi?',
      o: [
        'Dosyayı her gün yeniden <code>files.upload()</code> ile yüklemek',
        'Dosya adını Türkçe karaktersiz yazıp hücreyi yeniden çalıştırmak',
        'Drive\'ı <code>drive.mount</code> ile bağlayıp dosyayı MyDrive\'dan okumak',
        'Runtime türünü GPU yapıp dosyanın orada saklanmasını sağlamak'
      ],
      a: 2,
      why: 'Colab çalışma zamanı geçicidir; oturum bitince /content altındaki her şey silinir. Google Drive bağlandığında /content/drive/MyDrive altındaki dosyalar kalıcıdır. GPU seçimi depolamayı etkilemez.'
    },
    {
      t: 'predict',
      stage: 'Kodu oku',
      q: 'Bu kod, hücrelerin farklı sırada çalıştırıldığı bir çekirdeği taklit ediyor. Ne yazdırır?',
      code: 'hucreler = ["fiyat = 100", "fiyat = fiyat * 1.2", "print(fiyat)"]\ncekirdek = {}\nfor no in [0, 1, 1, 2]:\n    exec(hucreler[no], cekirdek)\n',
      o: ['120.0', '144.0', '100', '240.0'],
      a: 1,
      why: 'İkinci hücre iki kez çalıştı: 100 → 120.0 → 144.0. Notebook\'ta bir hücreye yanlışlıkla iki kez Shift+Enter basmak tam olarak budur; ekranda kod değişmez ama değişkenin değeri değişir.'
    },
    {
      t: 'predict',
      stage: 'Kodu oku',
      q: 'Notebook\'taki bir hücrenin JSON kaydını inceleyen bu kod ne yazdırır?',
      code: 'hucre = {"cell_type": "markdown", "source": ["# Başlık\\n", "Açıklama"]}\nmetin = "".join(hucre["source"])\nprint(hucre["cell_type"] == "code", len(metin.splitlines()))\n',
      o: ['True 2', 'False 1', 'False 2', 'False 3'],
      a: 2,
      why: 'Hücre markdown olduğu için ilk karşılaştırma False. source listesindeki parçalar kendi satır sonlarını taşır; "".join ile birleştirince "# Başlık\\nAçıklama" çıkar ve iki satırdır. Parçaları "\\n".join ile birleştirmek fazladan boş satır üretirdi.'
    },
    {
      t: 'predict',
      stage: 'Kodu oku',
      q: 'Sihirli komut satırlarını ayıklayan bu kod ne yazdırır?',
      code: 'kod = "%matplotlib inline\\nimport math\\n!pip install -q rich\\n  %time x = math.sqrt(16)\\nprint(\'hazır\')"\ntemiz = [s for s in kod.splitlines() if not s.startswith(("%", "!"))]\nprint(len(temiz))\nprint(temiz[-2].strip())\n',
      o: ['2\nimport math', '3\n%time x = math.sqrt(16)', '3\nimport math', '4\n%time x = math.sqrt(16)'],
      a: 1,
      why: 'startswith baştaki boşluklara dikkat etmez: "  %time ..." boşlukla başladığı için elenmez. Kalan üç satır: import math, "  %time ...", print(...). Sondan ikincisi strip ile "%time x = math.sqrt(16)". Doğru filtre s.lstrip().startswith(...) olurdu.'
    },
    {
      t: 'order',
      stage: 'Kodu oku',
      q: '<p>En küçük geçerli notebook\'u Python ile oluşturup diske yazan ve geri okuyan betiği sırala. Önce başlık (markdown) hücresi, sonra kod hücresi eklenmeli.</p>',
      lines: [
        'import json',
        'nb = {"nbformat": 4, "nbformat_minor": 5, "metadata": {}, "cells": []}',
        'nb["cells"].append({"cell_type": "markdown", "metadata": {}, "source": ["# Satış analizi"]})',
        'nb["cells"].append({"cell_type": "code", "metadata": {}, "execution_count": None, "outputs": [], "source": ["print(42)"]})',
        'with open("analiz.ipynb", "w", encoding="utf-8") as f:',
        '    json.dump(nb, f, ensure_ascii=False, indent=1)',
        'okunan = json.load(open("analiz.ipynb", encoding="utf-8"))',
        'print(len(okunan["cells"]), okunan["cells"][0]["cell_type"])'
      ],
      expect: '2 markdown\n',
      hint: 'Notebook sözlüğü hücre eklenmeden önce var olmalı; dosya yazılmadan okunamaz. İlk hücre markdown.',
      why: 'json içe aktarılır, boş notebook iskeleti kurulur, hücreler sırayla eklenir, dosyaya yazılır ve geri okunur. Bu sayede .ipynb dosyasının sadece bir JSON belgesi olduğunu görürsün; Jupyter bu dosyayı açabilir.'
    },
    {
      t: 'code',
      stage: 'Rehberli',
      id: 'jupyter-colab-1',
      diff: 1,
      q: '<p><code>kod_hucreleri(nb_metni)</code> fonksiyonunu yaz: <code>.ipynb</code> dosyasının JSON metnini alıp yalnız <b>kod</b> hücrelerinin kaynağını, sırasıyla, metin listesi olarak döndürsün. <code>source</code> alanı satır listesi ya da tek metin olabilir; liste ise parçaları <code>""</code> ile birleştir (parçalar kendi satır sonlarını taşır). Boş kod hücrelerini (yalnız boşluk içerenler dahil) atla.</p>',
      guide: [
        'json.loads ile metni sözlüğe çevir.',
        'nb["cells"] listesinde dön; cell_type "code" değilse atla.',
        'source liste ise "".join, metin ise olduğu gibi kullan.',
        'strip() sonrası boşsa atla; değilse listeye ekle (orijinal metni ekle).'
      ],
      example: 'siparisler = [{"tur": "iade", "notlar": ["kutu ", "hasarlı"]}, {"tur": "satis", "notlar": "hızlı"}]\nfor s in siparisler:\n    n = s["notlar"]\n    metin = "".join(n) if isinstance(n, list) else n\n    print(s["tur"], "->", metin)\n',
      start: 'import json\n\ndef kod_hucreleri(nb_metni):\n    nb = json.loads(nb_metni)\n    kodlar = []\n    for hucre in nb["cells"]:\n        # TODO: kod hücresi değilse atla\n        # TODO: source liste ise birleştir\n        # TODO: boş değilse kodlar\'a ekle\n        pass\n    return kodlar\n',
      sol: 'import json\n\ndef kod_hucreleri(nb_metni):\n    nb = json.loads(nb_metni)\n    kodlar = []\n    for hucre in nb["cells"]:\n        if hucre.get("cell_type") != "code":\n            continue\n        kaynak = hucre.get("source", "")\n        if isinstance(kaynak, list):\n            kaynak = "".join(kaynak)\n        if kaynak.strip():\n            kodlar.append(kaynak)\n    return kodlar\n',
      tests: 'nb = {"nbformat": 4, "nbformat_minor": 5, "metadata": {}, "cells": [\n    {"cell_type": "markdown", "metadata": {}, "source": ["# Rapor\\n", "Ekim"]},\n    {"cell_type": "code", "execution_count": 1, "metadata": {}, "outputs": [{"output_type": "stream", "name": "stdout", "text": ["42\\n"]}], "source": ["import math\\n", "print(42)"]},\n    {"cell_type": "raw", "metadata": {}, "source": "ham"},\n    {"cell_type": "code", "execution_count": 3, "metadata": {}, "outputs": [], "source": "x = 1"},\n    {"cell_type": "code", "execution_count": None, "metadata": {}, "outputs": [], "source": []},\n]}\nimport json\nnb["cells"].append({"cell_type": "code", "execution_count": None, "metadata": {}, "outputs": [], "source": ["  \\n"]})\nassert kod_hucreleri(json.dumps(nb)) == ["import math\\nprint(42)", "x = 1"], "Yalnız dolu kod hücreleri, satır listesi \\"\\".join ile birleşmiş"\nassert kod_hucreleri(\'{"cells": []}\') == [], "Hücresiz notebook boş liste"\n',
      hints: ['Hücre türünü hucre["cell_type"] ile kontrol et.', 'isinstance(kaynak, list) ise "".join(kaynak)', 'if kaynak.strip(): kodlar.append(kaynak)'],
      why: 'nbformat, source alanını genellikle satır listesi olarak yazar ama tek metin de geçerlidir; sağlam kod ikisini de kabul eder. "".join doğru birleştirmedir çünkü her parça kendi \\n karakterini taşır.'
    },
    {
      t: 'code',
      stage: 'Rehberli',
      id: 'jupyter-colab-2',
      diff: 2,
      q: '<p>Notebook hücrelerini VS Code\'un çalıştırabildiği <b>yüzde biçimine</b> çeviren <code>py_formatina_cevir(hucreler)</code> fonksiyonunu yaz. <code>hucreler</code>, <code>(tur, kaynak)</code> demetlerinin listesidir.</p><ul><li>Kod hücresi: <code>"# %%\n" + kaynak</code></li><li>Markdown hücresi: <code>"# %% [markdown]\n"</code> + kaynağın her satırının başına <code>"# "</code> eklenmiş hâli (boş satır için yalnız <code>"#"</code>).</li><li>Diğer türler atlanır.</li><li>Parçaları <b>bir boş satırla</b> (<code>"\n\n"</code>) birleştir ve sonuna tek <code>"\n"</code> ekle.</li></ul>',
      guide: [
        'Boş bir parcalar listesi oluştur.',
        'Her (tur, kaynak) için türe göre dal: code / markdown / diğer.',
        'Markdown satırlarını tek tek dönüştür: boşsa "#", değilse "# " + satır.',
        '"\\n\\n".join(parcalar) + "\\n" döndür.'
      ],
      example: 'satirlar = ["Toplam ciro", "", "Şehir bazında"]\nyorumlu = ["#" if s == "" else "# " + s for s in satirlar]\nprint("\\n".join(yorumlu))\n',
      start: 'def py_formatina_cevir(hucreler):\n    parcalar = []\n    for tur, kaynak in hucreler:\n        # TODO: code ise "# %%" başlığıyla ekle\n        # TODO: markdown ise satırları yorum yapıp "# %% [markdown]" başlığıyla ekle\n        pass\n    return "\\n\\n".join(parcalar) + "\\n"\n',
      sol: 'def py_formatina_cevir(hucreler):\n    parcalar = []\n    for tur, kaynak in hucreler:\n        if tur == "code":\n            parcalar.append("# %%\\n" + kaynak)\n        elif tur == "markdown":\n            satirlar = ["#" if s == "" else "# " + s for s in kaynak.splitlines()]\n            parcalar.append("# %% [markdown]\\n" + "\\n".join(satirlar))\n    return "\\n\\n".join(parcalar) + "\\n"\n',
      tests: 'h = [("markdown", "# İade raporu\\n\\nEkim 2026"), ("code", "iade = 41\\nprint(iade)"), ("raw", "ham metin"), ("code", "x = 2")]\nbeklenen = "# %% [markdown]\\n# # İade raporu\\n#\\n# Ekim 2026\\n\\n# %%\\niade = 41\\nprint(iade)\\n\\n# %%\\nx = 2\\n"\nassert py_formatina_cevir(h) == beklenen, "Biçim: markdown satırları \'# \' ile, boş satır \'#\', raw atlanır, parçalar arasında bir boş satır"\nimport io, contextlib\ntampon = io.StringIO()\nwith contextlib.redirect_stdout(tampon):\n    exec(py_formatina_cevir(h), {})\nassert tampon.getvalue() == "41\\n", "Üretilen betik geçerli Python olmalı ve çalışmalı"\nassert py_formatina_cevir([("code", "a = 1")]) == "# %%\\na = 1\\n", "Tek kod hücresi"\n',
      hints: [
        'Markdown kaynağını splitlines() ile böl, her satırı liste üreteciyle dönüştür.',
        'Boş satır için "#" yaz ki sonda boşluk kalmasın: "#" if s == "" else "# " + s',
        'parcalar.append("# %% [markdown]\\n" + "\\n".join(satirlar))'
      ],
      why: 'Yüzde biçimi, notebook\'un hücre yapısını korurken düz bir .py dosyası üretir: git farkları okunur, Ruff ve testler çalışır, VS Code yine hücre hücre çalıştırır. Markdown\'ı yorum yapmak dosyanın geçerli Python kalmasını sağlar.'
    },
    {
      t: 'code',
      stage: 'Rehberli',
      id: 'jupyter-colab-3',
      diff: 1,
      q: '<p>Notebook\'tan kopyalanan kod betikte çalışsın diye <code>sihirleri_temizle(kod)</code> fonksiyonunu yaz: baş boşlukları atıldığında <code>%</code> ya da <code>!</code> ile başlayan her satırın başına <code>"# "</code> ekleyerek yorum yapsın (girintiyi koru: <code>"    !ls"</code> → <code>"    # !ls"</code>). Diğer satırlar aynen kalsın. Satırları <code>"\n"</code> ile birleştirip döndür.</p>',
      guide: [
        'kod.splitlines() ile satırlarda dön.',
        'satir.lstrip() ile baştaki boşlukları atılmış hâlini al; % ya da ! ile mi başlıyor bak.',
        'Girintiyi korumak için: girinti = satir[:len(satir) - len(satir.lstrip())]',
        'Sihirli satırı girinti + "# " + satir.lstrip() olarak ekle; sonunda "\\n".join.'
      ],
      example: 'satir = "    return toplam"\nduz = satir.lstrip()\ngirinti = satir[:len(satir) - len(duz)]\nprint(repr(girinti), "|", duz)\n',
      start: 'def sihirleri_temizle(kod):\n    sonuc = []\n    for satir in kod.splitlines():\n        # TODO: sihirli satırı girintisini koruyarak yorum yap\n        sonuc.append(satir)\n    return "\\n".join(sonuc)\n',
      sol: 'def sihirleri_temizle(kod):\n    sonuc = []\n    for satir in kod.splitlines():\n        duz = satir.lstrip()\n        if duz.startswith(("%", "!")):\n            girinti = satir[:len(satir) - len(duz)]\n            sonuc.append(girinti + "# " + duz)\n        else:\n            sonuc.append(satir)\n    return "\\n".join(sonuc)\n',
      tests: 'k = "%matplotlib inline\\nimport math\\nif True:\\n    !ls veri\\n    x = math.sqrt(9)\\n%%time\\nprint(x)"\nbeklenen = "# %matplotlib inline\\nimport math\\nif True:\\n    # !ls veri\\n    x = math.sqrt(9)\\n# %%time\\nprint(x)"\nassert sihirleri_temizle(k) == beklenen, "%, %% ve ! satırları yorum olmalı; girinti korunmalı"\nassert sihirleri_temizle("a = 5 % 2\\nprint(\'!\')") == "a = 5 % 2\\nprint(\'!\')", "Satır ortasındaki % ve ! dokunulmamalı"\ncompile(sihirleri_temizle(k), "<betik>", "exec")\n',
      hints: ['startswith bir demet alabilir: duz.startswith(("%", "!"))', 'Girinti = satırın başındaki boşluklar = satir[:len(satir) - len(duz)]'],
      why: 'Sihirli komutlar Python sözdizimi değildir; betikte SyntaxError verir. Girintiyi korumak önemlidir: if bloğunun içindeki bir satırı girintisiz yorum yapmak bloğu bozmaz ama okuyucuyu yanıltır. Yalnız satır başına bakmak, mod operatörü (%) gibi meşru kullanımları korur.'
    },
    {
      t: 'code',
      stage: 'Kendin yaz',
      id: 'jupyter-colab-4',
      diff: 1,
      q: '<p><code>sira_bozuk_mu(nb)</code> fonksiyonunu yaz. <code>nb</code>, notebook sözlüğüdür. Kod hücrelerinin <code>execution_count</code> değerlerine (<code>None</code> olanları atlayarak) hücre sırasıyla bak; değerler <b>kesin artan</b> değilse <code>True</code>, artıyorsa (ya da hiç değer yoksa) <code>False</code> döndür.</p>',
      start: 'def sira_bozuk_mu(nb):\n    pass\n',
      sol: 'def sira_bozuk_mu(nb):\n    sayaclar = [h.get("execution_count") for h in nb.get("cells", []) if h.get("cell_type") == "code"]\n    sayaclar = [s for s in sayaclar if s is not None]\n    return any(a >= b for a, b in zip(sayaclar, sayaclar[1:]))\n',
      tests: 'def nb_yap(*sayaclar):\n    return {"cells": [{"cell_type": "code", "execution_count": s, "source": ""} for s in sayaclar]}\nassert sira_bozuk_mu(nb_yap(1, 2, 3)) is False, "1, 2, 3 temiz"\nassert sira_bozuk_mu(nb_yap(4, 2, 7)) is True, "4\'ten sonra 2: bozuk"\nassert sira_bozuk_mu(nb_yap(1, 5, 9)) is False, "Atlamalar sorun değil (arada silinmiş hücreler olabilir); önemli olan artış"\nassert sira_bozuk_mu(nb_yap(1, None, 2)) is False, "Çalıştırılmamış hücre (None) atlanır"\nassert sira_bozuk_mu(nb_yap(3, 3)) is True, "Aynı sayaç iki kez: kesin artan değil"\nm = {"cells": [{"cell_type": "markdown", "source": ""}, {"cell_type": "code", "execution_count": 2, "source": ""}, {"cell_type": "code", "execution_count": 1, "source": ""}]}\nassert sira_bozuk_mu(m) is True, "Markdown hücreleri yok sayılır; 2 sonra 1 bozuk"\nassert sira_bozuk_mu({"cells": []}) is False, "Boş notebook"\n',
      hints: ['Önce kod hücrelerinin None olmayan sayaçlarını sırayla bir listeye topla.', 'zip(liste, liste[1:]) ardışık çiftleri verir; any(a >= b ...) bozuk çift var mı söyler.'],
      why: 'zip(liste, liste[1:]) ardışık eleman çiftlerini dolaşmanın Python\'daki kısa yoludur. Bu küçük denetim, CI\'da "karışık sırada çalıştırılmış notebook" uyarısı vermek için kullanılabilir.'
    },
    {
      t: 'code',
      stage: 'Kendin yaz',
      id: 'jupyter-colab-5',
      diff: 2,
      q: '<p><code>ciktilari_temizle(nb)</code> fonksiyonunu yaz (nbstripout\'un yaptığı iş): her kod hücresinin <code>outputs</code> alanını boş listeye, <code>execution_count</code> alanını <code>None</code>\'a çeviren <b>yeni</b> bir notebook sözlüğü döndür. Orijinal sözlük <b>değişmemeli</b>. Markdown ve raw hücreler aynen kalır.</p>',
      start: 'import copy\n\ndef ciktilari_temizle(nb):\n    pass\n',
      sol: 'import copy\n\ndef ciktilari_temizle(nb):\n    yeni = copy.deepcopy(nb)\n    for hucre in yeni.get("cells", []):\n        if hucre.get("cell_type") == "code":\n            hucre["outputs"] = []\n            hucre["execution_count"] = None\n    return yeni\n',
      tests: 'nb = {"nbformat": 4, "nbformat_minor": 5, "metadata": {}, "cells": [\n    {"cell_type": "markdown", "metadata": {}, "source": ["# Rapor\\n", "Ekim"]},\n    {"cell_type": "code", "execution_count": 1, "metadata": {}, "outputs": [{"output_type": "stream", "name": "stdout", "text": ["42\\n"]}], "source": ["import math\\n", "print(42)"]},\n    {"cell_type": "raw", "metadata": {}, "source": "ham"},\n    {"cell_type": "code", "execution_count": 3, "metadata": {}, "outputs": [], "source": "x = 1"},\n    {"cell_type": "code", "execution_count": None, "metadata": {}, "outputs": [], "source": []},\n]}\nimport copy\norijinal = copy.deepcopy(nb)\nt = ciktilari_temizle(nb)\nassert nb == orijinal, "Orijinal notebook değişmemeli: deepcopy kullan"\nkodlar = [h for h in t["cells"] if h["cell_type"] == "code"]\nassert all(h["outputs"] == [] and h["execution_count"] is None for h in kodlar), "Tüm kod hücrelerinde çıktı ve sayaç temizlenmeli"\nassert t["cells"][0] == nb["cells"][0] and t["cells"][2] == nb["cells"][2], "Markdown ve raw hücreler aynen kalmalı"\nassert t["cells"][1]["source"] == ["import math\\n", "print(42)"], "Kaynak kod korunmalı"\nassert t["cells"][1] is not nb["cells"][1], "Yeni sözlük, eski hücre nesnelerini paylaşmamalı"\n',
      hints: ['Sığ kopya (dict(nb) ya da nb.copy()) hücre listesini paylaşır; iç içe yapı için copy.deepcopy gerekir.', 'Kopya üzerinde dön ve yalnız code hücrelerini değiştir.'],
      why: 'Notebook iç içe sözlük ve listelerden oluşur; sığ kopyayı değiştirmek orijinali de değiştirir. deepcopy tüm yapıyı kopyalar. Çıktısız ve sayaçsız notebook git\'te küçük ve okunur farklar üretir.'
    },
    {
      t: 'code',
      stage: 'Kendin yaz',
      id: 'jupyter-colab-6',
      diff: 2,
      q: '<p>Basit bir conda <code>environment.yml</code> dosyasını ayrıştıran <code>conda_ortami_oku(metin)</code> fonksiyonunu yaz. Biçim:</p><pre>name: analiz\nchannels:\n  - conda-forge\ndependencies:\n  - python=3.12\n  - pandas\n  - pip\n  - pip:\n    - rich==13.7.1</pre><p>Sözlük döndür: <code>{"ad": "analiz", "kanallar": ["conda-forge"], "conda": ["python=3.12", "pandas", "pip"], "pip": ["rich==13.7.1"]}</code>. Kurallar: <code>- pip:</code> satırından sonraki <b>daha derin girintili</b> öğeler pip listesine gider; boş ve <code>#</code> ile başlayan satırlar atlanır; eksik bölümler boş liste, ad yoksa <code>None</code>.</p>',
      start: 'def conda_ortami_oku(metin):\n    pass\n',
      sol: 'def conda_ortami_oku(metin):\n    sonuc = {"ad": None, "kanallar": [], "conda": [], "pip": []}\n    bolum = None\n    pip_girinti = None\n    for satir in metin.splitlines():\n        duz = satir.strip()\n        if not duz or duz.startswith("#"):\n            continue\n        girinti = len(satir) - len(satir.lstrip())\n        if girinti == 0:\n            anahtar, _, deger = duz.partition(":")\n            deger = deger.strip()\n            if anahtar == "name":\n                sonuc["ad"] = deger or None\n            bolum = anahtar\n            pip_girinti = None\n            continue\n        if not duz.startswith("- "):\n            continue\n        oge = duz[2:].strip()\n        if bolum == "channels":\n            sonuc["kanallar"].append(oge)\n        elif bolum == "dependencies":\n            if oge == "pip:":\n                pip_girinti = girinti\n            elif pip_girinti is not None and girinti > pip_girinti:\n                sonuc["pip"].append(oge)\n            else:\n                pip_girinti = None\n                sonuc["conda"].append(oge)\n    return sonuc\n',
      tests: 'm = """name: analiz\nchannels:\n  - conda-forge\n  - defaults\n# yorum\ndependencies:\n  - python=3.12\n  - pandas>=2.2\n\n  - pip\n  - pip:\n    - rich==13.7.1\n    - papermill\n"""\nassert conda_ortami_oku(m) == {"ad": "analiz", "kanallar": ["conda-forge", "defaults"], "conda": ["python=3.12", "pandas>=2.2", "pip"], "pip": ["rich==13.7.1", "papermill"]}, "Tam örnek: \'- pip\' conda paketi, \'- pip:\' altındakiler pip listesi"\nm2 = "dependencies:\\n  - pip:\\n    - httpx\\n  - numpy\\n"\nassert conda_ortami_oku(m2) == {"ad": None, "kanallar": [], "conda": ["numpy"], "pip": ["httpx"]}, "pip bloğundan sonra aynı girintide gelen öğe tekrar conda\'ya aittir; ad yoksa None"\nassert conda_ortami_oku("") == {"ad": None, "kanallar": [], "conda": [], "pip": []}, "Boş dosya"\n',
      hints: [
        'Satırın girintisi = len(satir) - len(satir.lstrip()); girintisi 0 olan satırlar bölüm başlığıdır (partition(":") ile böl).',
        '"- pip:" görünce girintisini hatırla; sonraki öğelerden girintisi daha büyük olanlar pip\'e, eşit olan ilk öğe pip bloğunu kapatır.'
      ],
      why: 'YAML gibi girintiye dayalı biçimlerde anlam girinti seviyesindedir; bu yüzden durum (hangi bölümdeyim, pip bloğu açık mı) tutarak satır satır ilerlemek gerekir. Gerçek projede pyyaml kullanırsın; ama bu alıştırma "- pip" (conda paketi) ile "- pip:" (alt liste) farkını netleştirir.'
    },
    {
      t: 'code',
      stage: 'Kendin yaz',
      id: 'jupyter-colab-7',
      diff: 2,
      q: '<p><code>sihir_ayristir(satir)</code> fonksiyonunu yaz. Baş/son boşlukları atılmış satıra göre demet döndür:</p><ul><li><code>%%</code> ile başlıyorsa <code>("hucre", ad, arguman)</code>: <code>"%%time"</code> → <code>("hucre", "time", "")</code></li><li><code>%</code> ile başlıyorsa <code>("satir", ad, arguman)</code>: <code>"%timeit sum(x)"</code> → <code>("satir", "timeit", "sum(x)")</code></li><li><code>!</code> ile başlıyorsa <code>("kabuk", komut, arguman)</code>: <code>"!pip install -q rich"</code> → <code>("kabuk", "pip", "install -q rich")</code></li><li>Hiçbiri değilse <code>None</code>.</li></ul><p>Ad ile argüman ilk boşluktan ayrılır; argümanın baş/son boşlukları atılır.</p>',
      start: 'def sihir_ayristir(satir):\n    pass\n',
      sol: 'def sihir_ayristir(satir):\n    s = satir.strip()\n    for onek, tur in (("%%", "hucre"), ("%", "satir"), ("!", "kabuk")):\n        if s.startswith(onek):\n            govde = s[len(onek):]\n            ad, _, arguman = govde.partition(" ")\n            return (tur, ad, arguman.strip())\n    return None\n',
      tests: 'assert sihir_ayristir("%%time") == ("hucre", "time", ""), "Hücre sihri, argümansız"\nassert sihir_ayristir("%timeit sum(x)") == ("satir", "timeit", "sum(x)"), "Satır sihri"\nassert sihir_ayristir("  !pip install -q rich  ") == ("kabuk", "pip", "install -q rich"), "Kabuk komutu; boşluklar kırpılır"\nassert sihir_ayristir("%%writefile rapor.py") == ("hucre", "writefile", "rapor.py"), "%% kontrolü % kontrolünden önce yapılmalı"\nassert sihir_ayristir("%pip   install pandas") == ("satir", "pip", "install pandas"), "Argümandaki fazla baş boşluk atılır"\nassert sihir_ayristir("x = 10 % 3") is None, "Normal Python satırı"\n',
      hints: ['Önek kontrol sırası önemli: "%%" önce, sonra "%", sonra "!". Aksi hâlde "%%time" satır sihri sanılır.', 'str.partition(" ") ilk boşluktan böler ve boşluk yoksa üçüncü parça "" olur.'],
      why: 'Daha uzun önekin önce denenmesi, ayrıştırıcılardaki "en uzun eşleşme" ilkesinin basit bir örneğidir. partition, split\'ten farklı olarak her zaman üç parça döndürdüğü için argümansız durumda hata vermez.'
    },
    {
      t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      id: 'jupyter-colab-8',
      diff: 1,
      q: '<p>Hatayı bul ve düzelt. <code>hucre_sayilari(nb)</code> notebook\'taki hücre türlerini saymalı ve <code>{"code": 2, "markdown": 1, ...}</code> gibi bir sözlük döndürmeli. Kod çöküyor; düzeltilse bile ilk hücreyi saymıyor.</p>',
      start: 'def hucre_sayilari(nb):\n    sayac = {}\n    for hucre in nb["cells"][1:]:\n        sayac[hucre["cell_type"]] += 1\n    return sayac\n',
      sol: 'def hucre_sayilari(nb):\n    sayac = {}\n    for hucre in nb["cells"]:\n        tur = hucre["cell_type"]\n        sayac[tur] = sayac.get(tur, 0) + 1\n    return sayac\n',
      tests: 'nb = {"nbformat": 4, "nbformat_minor": 5, "metadata": {}, "cells": [\n    {"cell_type": "markdown", "metadata": {}, "source": ["# Rapor\\n", "Ekim"]},\n    {"cell_type": "code", "execution_count": 1, "metadata": {}, "outputs": [{"output_type": "stream", "name": "stdout", "text": ["42\\n"]}], "source": ["import math\\n", "print(42)"]},\n    {"cell_type": "raw", "metadata": {}, "source": "ham"},\n    {"cell_type": "code", "execution_count": 3, "metadata": {}, "outputs": [], "source": "x = 1"},\n    {"cell_type": "code", "execution_count": None, "metadata": {}, "outputs": [], "source": []},\n]}\nassert hucre_sayilari(nb) == {"markdown": 1, "code": 3, "raw": 1}, "Tüm hücreler sayılmalı (ilki dahil)"\nassert hucre_sayilari({"cells": []}) == {}, "Boş notebook boş sözlük"\nassert hucre_sayilari({"cells": [{"cell_type": "markdown"}]}) == {"markdown": 1}, "Tek hücre de sayılmalı"\n',
      hints: ['Var olmayan anahtara += uygulamak KeyError verir; get(tur, 0) + 1 kullan (ya da collections.Counter).', '[1:] dilimi ilk hücreyi atlar; çoğu notebook\'ta bu başlık hücresidir.'],
      why: 'Sayma kalıbında anahtar ilk kez görüldüğünde değeri yoktur; dict.get(anahtar, 0) ya da Counter bu durumu çözer. "İlk satır başlıktır" alışkanlığıyla yazılan [1:] dilimi, CSV\'de doğru olabilir ama notebook hücrelerinde veri kaybettirir.'
    },
    {
      t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      id: 'jupyter-colab-9',
      diff: 2,
      q: '<p>Hatayı bul ve düzelt. <code>calistir(hucreler)</code>, kod hücrelerini sırayla <b>yeni ve boş bir çekirdekte</b> çalıştırmalı ve kullanıcı değişkenlerini (<code>__</code> ile başlamayan adlar) sözlük olarak döndürmeli. Her çağrı temiz başlamalı; ama ikinci çağrı birincinin değişkenlerini görüyor. Bu tam olarak notebook\'lardaki gizli durum hatasıdır.</p>',
      start: 'def calistir(hucreler, cekirdek={}):\n    for kod in hucreler:\n        exec(kod, cekirdek)\n    return {k: v for k, v in cekirdek.items() if not k.startswith("__")}\n',
      sol: 'def calistir(hucreler, cekirdek=None):\n    if cekirdek is None:\n        cekirdek = {}\n    for kod in hucreler:\n        exec(kod, cekirdek)\n    return {k: v for k, v in cekirdek.items() if not k.startswith("__")}\n',
      tests: 'assert calistir(["a = 1", "b = a + 1"]) == {"a": 1, "b": 2}, "Hücreler sırayla aynı çekirdekte çalışmalı"\nassert calistir(["c = 10"]) == {"c": 10}, "İkinci çağrı temiz başlamalı; önceki a ve b görünmemeli"\ntry:\n    calistir(["print(a)"])\n    assert False, "Yeni çekirdekte a tanımsız olmalı (NameError)"\nexcept NameError:\n    pass\nortak = {}\ncalistir(["x = 5"], ortak)\nassert calistir(["y = x * 2"], ortak) == {"x": 5, "y": 10}, "Açıkça verilen çekirdek paylaşılabilmeli"\n',
      hints: ['Varsayılan parametre değeri fonksiyon tanımlanırken BİR KEZ oluşturulur; değiştirilebilir {} tüm çağrılarda paylaşılır.', 'cekirdek=None yap ve fonksiyonun içinde if cekirdek is None: cekirdek = {}'],
      why: 'Değiştirilebilir varsayılan argüman Python\'un en bilinen tuzaklarındandır ve burada notebook\'un gizli durumunu birebir taklit eder: önceki çalıştırmanın kalıntıları sonraki sonucu sessizce etkiler. None nöbetçisi her çağrıda yeni bir sözlük oluşturur.'
    },
    {
      t: 'code',
      stage: 'Meydan okuma',
      id: 'jupyter-colab-10',
      diff: 3,
      q: '<p>CI\'da kullanılacak <code>bastan_calistir(nb)</code> fonksiyonunu yaz ("Restart and Run All" denetimi). <code>nb</code> notebook sözlüğüdür.</p><ul><li>Kod hücrelerini (source liste ya da metin olabilir) sırayla, tek bir yeni ad alanında <code>exec</code> ile çalıştır.</li><li>Baş boşlukları atıldığında <code>%</code> ya da <code>!</code> ile başlayan satırları atla (<code>%%</code> ile başlayan bir hücre sihri varsa <b>hücrenin tamamını</b> atla).</li><li>Çalıştırma sırasında yazdırılanlar ekrana çıkmasın; yakala.</li><li>Başarılıysa <code>{"durum": "temiz", "cikti": &lt;toplam stdout&gt;}</code>.</li><li>Bir hücre hata verirse dur ve <code>{"durum": "hata", "hucre": &lt;notebook içindeki hücre indeksi, markdown dahil&gt;, "hata": &lt;hata sınıfının adı&gt;, "cikti": &lt;o ana kadarki stdout&gt;}</code> döndür.</li></ul>',
      start: 'import io, contextlib\n\ndef bastan_calistir(nb):\n    pass\n',
      sol: 'import io, contextlib\n\ndef bastan_calistir(nb):\n    ad_alani = {"__name__": "__main__"}\n    tampon = io.StringIO()\n    for i, hucre in enumerate(nb.get("cells", [])):\n        if hucre.get("cell_type") != "code":\n            continue\n        kaynak = hucre.get("source", "")\n        if isinstance(kaynak, list):\n            kaynak = "".join(kaynak)\n        if kaynak.lstrip().startswith("%%"):\n            continue\n        satirlar = [s for s in kaynak.splitlines() if not s.lstrip().startswith(("%", "!"))]\n        try:\n            with contextlib.redirect_stdout(tampon):\n                exec("\\n".join(satirlar), ad_alani)\n        except Exception as e:\n            return {"durum": "hata", "hucre": i, "hata": type(e).__name__, "cikti": tampon.getvalue()}\n    return {"durum": "temiz", "cikti": tampon.getvalue()}\n',
      tests: 'def h(tur, src):\n    return {"cell_type": tur, "metadata": {}, "source": src}\nnb = {"cells": [\n    h("markdown", "# Ciro"),\n    h("code", ["%matplotlib inline\\n", "import statistics\\n", "!pip install -q rich\\n", "ciro = [120, 80, 100]"]),\n    h("code", "%%time\\nbu_hucre_atlanir()"),\n    h("code", "ort = statistics.mean(ciro)\\nprint(\'ortalama\', ort)"),\n]}\nr = bastan_calistir(nb)\nassert r == {"durum": "temiz", "cikti": "ortalama 100\\n"}, "Sihirli satırlar ve %% hücresi atlanmalı; çıktı yakalanmalı"\nnb2 = {"cells": [\n    h("code", "print(\'başla\')"),\n    h("markdown", "ara"),\n    h("code", "toplam = sum(satislar)"),\n    h("code", "print(\'buraya gelinmez\')"),\n]}\nr2 = bastan_calistir(nb2)\nassert r2 == {"durum": "hata", "hucre": 2, "hata": "NameError", "cikti": "başla\\n"}, "Gizli durum: satislar tanımsız; hücre indeksi markdown dahil sayılır, sonrası çalışmaz"\nassert bastan_calistir({"cells": [h("code", "1/0")]})["hata"] == "ZeroDivisionError", "Hata sınıfının adı"\nassert bastan_calistir({"cells": []}) == {"durum": "temiz", "cikti": ""}, "Boş notebook temizdir"\n',
      hints: [
        'enumerate ile tüm hücrelerde dön ki indeks markdown hücrelerini de saysın; kod olmayanları continue ile geç.',
        'contextlib.redirect_stdout(tampon) bloğu içindeki print\'leri bir StringIO\'ya yönlendirir.',
        'Hücre kaynağı lstrip() sonrası "%%" ile başlıyorsa tüm hücreyi atla; değilse satır satır filtrele.'
      ],
      why: 'Bu, nbconvert --execute ve papermill\'in yaptığı denetimin küçük bir modelidir: tek ad alanı, sıralı çalıştırma, ilk hatada durma ve hatanın konumunu raporlama. Gizli duruma dayanan bir notebook burada hemen NameError verir.'
    },
    {
      t: 'code',
      stage: 'Mini proje',
      id: 'jupyter-colab-11',
      diff: 3,
      q: '<p>Ekibin notebook\'larını inceleyen <code>notebook_raporu(nb_metni)</code> fonksiyonunu yaz. JSON metnini okuyup sözlük döndür:</p><ul><li><code>"hucreler"</code>: tür → adet sözlüğü.</li><li><code>"kod_satiri"</code>: kod hücrelerindeki boş olmayan satır sayısı (sihirli satırlar dahil).</li><li><code>"sihirler"</code>: kullanılan satır/hücre sihirlerinin adları (<code>%</code>/<code>%%</code> sonrası ilk kelime), tekrarsız, alfabetik.</li><li><code>"pip_paketleri"</code>: <code>!pip install</code> ya da <code>%pip install</code> satırlarındaki paketler; <code>shlex.split</code> ile parçala, <code>-</code> ile başlayan seçenekleri atla; tekrarsız, ilk görülme sırasıyla.</li><li><code>"sira_bozuk"</code>: kod hücrelerinin None olmayan sayaçları kesin artan değilse True.</li><li><code>"cikti_sayisi"</code>: tüm kod hücrelerindeki <code>outputs</code> öğelerinin toplamı.</li><li><code>"uyarilar"</code>: alfabetik liste; <code>"BANG_PIP"</code> (<code>!pip</code> kullanılmışsa), <code>"SIRA"</code> (sıra bozuksa), <code>"CIKTI"</code> (çıktı sayısı 0\'dan büyükse; git\'e çıktılı notebook girmesin).</li></ul>',
      start: 'import json, shlex\n\ndef notebook_raporu(nb_metni):\n    pass\n',
      sol: 'import json, shlex\n\ndef notebook_raporu(nb_metni):\n    nb = json.loads(nb_metni)\n    hucreler, sihirler, paketler = {}, set(), []\n    kod_satiri = cikti = 0\n    sayaclar = []\n    bang_pip = False\n    for h in nb.get("cells", []):\n        tur = h.get("cell_type")\n        hucreler[tur] = hucreler.get(tur, 0) + 1\n        if tur != "code":\n            continue\n        cikti += len(h.get("outputs", []))\n        if h.get("execution_count") is not None:\n            sayaclar.append(h["execution_count"])\n        kaynak = h.get("source", "")\n        if isinstance(kaynak, list):\n            kaynak = "".join(kaynak)\n        for satir in kaynak.splitlines():\n            s = satir.strip()\n            if not s:\n                continue\n            kod_satiri += 1\n            if s.startswith("%"):\n                ad = s.lstrip("%").split()[0] if s.lstrip("%") else ""\n                if ad:\n                    sihirler.add(ad)\n            parcalar = shlex.split(s.lstrip("%!"))\n            if s[0] in "%!" and parcalar[:2] == ["pip", "install"]:\n                if s.startswith("!"):\n                    bang_pip = True\n                for p in parcalar[2:]:\n                    if not p.startswith("-") and p not in paketler:\n                        paketler.append(p)\n    sira_bozuk = any(a >= b for a, b in zip(sayaclar, sayaclar[1:]))\n    uyarilar = []\n    if bang_pip:\n        uyarilar.append("BANG_PIP")\n    if sira_bozuk:\n        uyarilar.append("SIRA")\n    if cikti > 0:\n        uyarilar.append("CIKTI")\n    return {\n        "hucreler": hucreler,\n        "kod_satiri": kod_satiri,\n        "sihirler": sorted(sihirler),\n        "pip_paketleri": paketler,\n        "sira_bozuk": sira_bozuk,\n        "cikti_sayisi": cikti,\n        "uyarilar": sorted(uyarilar),\n    }\n',
      tests: 'import json\ndef kod(src, sayac=None, ciktilar=0):\n    return {"cell_type": "code", "metadata": {}, "execution_count": sayac, "outputs": [{"output_type": "stream", "text": "x"}] * ciktilar, "source": src}\nnb = {"nbformat": 4, "nbformat_minor": 5, "metadata": {}, "cells": [\n    {"cell_type": "markdown", "metadata": {}, "source": ["# İade analizi"]},\n    kod(["!pip install -q pandas \'openpyxl>=3.1\'\\n", "%matplotlib inline\\n", "\\n", "import pandas as pd"], 3, 1),\n    kod("%%time\\nx = 1\\n%pip install pandas rich", 2, 0),\n    kod(["%timeit sum(range(9))"], None, 2),\n]}\nr = notebook_raporu(json.dumps(nb))\nassert r["hucreler"] == {"markdown": 1, "code": 3}, "Hücre türleri"\nassert r["kod_satiri"] == 7, "Boş olmayan kod satırları: 3 + 3 + 1"\nassert r["sihirler"] == ["matplotlib", "pip", "time", "timeit"], "Sihir adları tekrarsız ve alfabetik (%pip de satır sihridir)"\nassert r["pip_paketleri"] == ["pandas", "openpyxl>=3.1", "rich"], "Seçenekler (-q) atlanır, tırnaklı belirteç tek parça, tekrar yok, ilk görülme sırası"\nassert r["sira_bozuk"] is True, "3\'ten sonra 2: sıra bozuk"\nassert r["cikti_sayisi"] == 3, "1 + 0 + 2 çıktı"\nassert r["uyarilar"] == ["BANG_PIP", "CIKTI", "SIRA"], "Üç uyarı, alfabetik"\ntemiz = {"cells": [kod("%pip install httpx\\nimport httpx", 1), kod("print(1)", 2)]}\nr2 = notebook_raporu(json.dumps(temiz))\nassert r2["uyarilar"] == [] and r2["pip_paketleri"] == ["httpx"] and r2["sira_bozuk"] is False, "Temiz notebook: %pip uyarı değildir"\nassert notebook_raporu(\'{"cells": []}\')["kod_satiri"] == 0, "Boş notebook"\n',
      hints: [
        'Hücre başına: türü say; kod hücresinde çıktıları ve sayacı topla; source\'u birleştirip satır satır işle.',
        'Sihir adı: s.lstrip("%").split()[0]; pip satırı: shlex.split(s.lstrip("%!")) ilk iki parçası ["pip", "install"] ise sonrakilerden - ile başlamayanları al.',
        'Uyarıları ayrı bayraklarla topla ve en sonda sorted ile döndür.'
      ],
      why: 'Bu rapor, dersin tüm konularını bir araya getirir: .ipynb JSON yapısı, source alanının iki biçimi, sihirli komutlar, !pip ile %pip farkı, çalıştırma sırası ve çıktıların git\'e girmesi. Ekipler benzer betikleri pre-commit kancası ya da CI adımı olarak çalıştırır.'
    }
  ],
  faq: [
    {
      q: 'JupyterLab mı klasik Notebook mu, yoksa VS Code mu?',
      a: 'Üçü de aynı .ipynb dosyasını açar. JupyterLab tarayıcıda zengin bir ortam sunar; VS Code ise notebook\'u kodun geri kalanıyla, git ve hata ayıklayıcıyla aynı yerde tutar. Projen .py modülleri de içeriyorsa VS Code daha pratiktir.'
    },
    {
      q: 'Anaconda kurmam şart mı?',
      a: 'Hayır. pip ve venv ile jupyterlab, pandas ve matplotlib rahatça kurulur. conda; GDAL, CUDA gibi Python dışı bağımlılıkları olan paketlerde ya da ekip conda kullanıyorsa öne çıkar. Hafif başlangıç için Miniconda/Miniforge yeterlidir.'
    },
    {
      q: 'Colab\'in ücretsiz GPU\'su ile model eğitebilir miyim?',
      a: 'Küçük ve orta deneyler için evet; ama süre ve kaynak sınırlıdır, oturum beklenmedik anda kapanabilir. Ara sonuçları (model ağırlıkları, işlenmiş veri) düzenli olarak Drive\'a kaydet.'
    },
    {
      q: 'Notebook\'u git\'e nasıl eklemeliyim?',
      a: 'Kaydetmeden önce çıktıları temizle (Edit → Clear All Outputs ya da nbstripout). Ortak fonksiyonları .py modüllerine taşı. Gerekirse Jupytext ile notebook\'un .py eşini de tut; kod incelemesi o dosya üzerinden yapılır.'
    }
  ],
  mistakes: [
    {
      bad: '!pip install openpyxl',
      good: '%pip install openpyxl',
      why: '! kabuktaki ilk pip\'i çalıştırır ve paket çekirdekten farklı bir Python\'a gidebilir. %pip her zaman çalışan çekirdeğin ortamına kurar.'
    },
    {
      bad: '# Hücre 5: kur = 34.0\n# Hücre 2 yeniden çalıştırıldı, hücre 5 silindi\nprint(tutar_tl)',
      good: '# Kernel → Restart Kernel and Run All Cells\n# Tüm tanımlar yukarıdan aşağı sırada',
      why: 'Silinen ya da sonradan çalıştırılan hücrelerin değişkenleri bellekte kalır. Notebook\'u paylaşmadan önce baştan çalıştırmak gizli durumu ortaya çıkarır.'
    },
    {
      bad: 'kaynak = "\\n".join(hucre["source"])',
      good: 'kaynak = hucre["source"] if isinstance(hucre["source"], str) else "".join(hucre["source"])',
      why: 'source listesindeki her parça zaten satır sonunu taşır; "\\n" ile birleştirmek fazladan boş satırlar üretir. Ayrıca source tek metin de olabilir.'
    },
    {
      bad: 'df = pd.read_csv("/content/siparisler.csv")   # Colab',
      good: 'from google.colab import drive\ndrive.mount("/content/drive")\ndf = pd.read_csv("/content/drive/MyDrive/anadolu/siparisler.csv")',
      why: '/content geçicidir; oturum sıfırlanınca yüklenen dosyalar silinir. Drive\'daki dosyalar kalıcıdır.'
    }
  ]
}
);
})(window);
/* PythonPatika — v2/t1: kurulum-macos-linux */
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push(
{
  id: 'kurulum-macos-linux',
  lv: 'temel',
  mod: 'Başlangıç',
  min: 40,
  title: 'macOS ve Linux\'ta Python kurulumu',
  sum: 'Sistem Python\'ına dokunmadan Homebrew, apt, pyenv, deadsnakes ve uv ile Python kurar; PEP 668 hatasını venv ve pipx ile çözer, doğru yolu seçmeyi öğrenirsin.',
  goals: [
    'macOS\'ta Xcode CLT ve Homebrew ile Python kurup Apple Silicon/Intel farkını açıklayabilirim.',
    'Ubuntu/Debian ve Fedora\'da Python, venv ve pip paketlerini doğru komutlarla kurabilirim.',
    'externally-managed-environment hatasının nedenini açıklar, venv ve pipx ile çözebilirim.',
    'pyenv ve uv ile birden çok sürümü yönetir, duruma göre doğru kurulum yolunu seçebilirim.',
    'which -a, shebang ve os-release bilgisinden hangi Python\'ın çalıştığını teşhis edebilirim.'
  ],
  body: `
<h2>Unix dünyasında Python zaten var... ya da var gibi görünür</h2>
<p>Windows dersinde Python'ın sıfırdan kurulduğunu gördün. macOS ve Linux'ta durum farklıdır: işletim sistemi kendi işleri için bir Python'a sahiptir ya da ona benzeyen bir yer tutucu koyar. Bu ders, <b>sistemin Python'ına dokunmadan</b> kendi Python'ını nasıl kuracağını, birden çok sürümü nasıl yöneteceğini ve Linux'ta bir gün mutlaka göreceğin <code>externally-managed-environment</code> hatasını anlatır. Kurulumun kısa hâlini <b>Kurulum ve araçlar</b> dersinde, sanal ortamın ayrıntısını <b>Sanal ortam ve paket yönetimi</b> dersinde bulursun; burada işletim sistemine özgü kısımlara odaklanıyoruz.</p>
<p>Altın kural: <b>sistem Python'ı işletim sistemine aittir</b>. Ubuntu'nun paket yöneticisi, ağ araçları ve masaüstü bileşenleri <code>/usr/bin/python3</code>'e güvenir. Oraya <code>sudo pip install</code> ile paket eklemek ya da <code>/usr/bin/python3</code> bağlantısını başka sürüme çevirmek sistemi bozabilir. Senin projelerin her zaman ya ayrı bir kurulumda ya da bir sanal ortamda yaşar.</p>

<h2>macOS</h2>
<h3>Sistem python3 ve Xcode Command Line Tools</h3>
<p>Yeni bir Mac'te Terminal'e <code>python3</code> yazınca çoğu zaman bir pencere açılır: "python3 komutu geliştirici araçlarını gerektiriyor". <code>/usr/bin/python3</code> aslında bir yer tutucudur; gerçek Python, Apple'ın <b>Xcode Command Line Tools</b> (CLT) paketiyle gelir ve genellikle eski bir sürümdür. CLT yine de gereklidir: derleyici, <code>git</code> ve Homebrew bunlara ihtiyaç duyar.</p>
<pre class="code">xcode-select --install        # Command Line Tools'u kurar
xcode-select -p               # kurulu mu? /Library/Developer/CommandLineTools
python3 --version             # sistem python3 (eski olabilir)
which -a python3              # PATH'te bulunan tüm python3'ler, sırayla</pre>
<p>macOS 12.3'ten beri <code>python</code> (sürümsüz) komutu yoktur; yalnız <code>python3</code> vardır. Bir eğitimde <code>python</code> yazıyorsa sen <code>python3</code> yaz. Sanal ortam etkinken ise <code>python</code> komutu da çalışır, çünkü venv kendi <code>bin/python</code> bağlantısını getirir.</p>

<h3>Homebrew ile kurulum</h3>
<p><b>Homebrew</b>, macOS'un fiilî paket yöneticisidir. brew.sh'deki tek satırlık betikle kurulur. Kurulum sonunda ekrana yazılan "Next steps" komutlarını mutlaka çalıştır; yoksa <code>brew: command not found</code> alırsın.</p>
<pre class="code">/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' &gt;&gt; ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
brew install python@3.12
python3.12 --version
python3.12 -m venv .venv &amp;&amp; source .venv/bin/activate</pre>
<p>Apple Silicon (M serisi) Mac'lerde Homebrew <code>/opt/homebrew</code>'a, Intel Mac'lerde <code>/usr/local</code>'a kurulur. <code>brew install python@3.12</code> sana <code>python3.12</code> komutunu verir; sürümsüz <code>python3</code> ise Homebrew'un o anki varsayılan Python'ını gösterebilir. Projelerde sürümlü komutu kullanmak sürprizleri önler. Homebrew'un Python'ı da "dışarıdan yönetilen" olarak işaretlidir; global <code>pip install</code> yerine venv kullanman beklenir.</p>
<pre class="py">import posixpath

def homebrew_onegi(makine):
    return "/opt/homebrew" if makine == "arm64" else "/usr/local"

for makine in ["arm64", "x86_64"]:
    onek = homebrew_onegi(makine)
    print(f"{makine:7} -&gt; {posixpath.join(onek, 'bin', 'python3.12')}")</pre>
<p>Gerçek bilgisayarda <code>platform.machine()</code> bu değeri verir. python.org'un macOS yükleyicisini tercih edersen, kurulumdan sonra <code>/Applications/Python 3.12/</code> klasöründeki <b>Install Certificates.command</b> dosyasına çift tıkla; yoksa ilk <code>pip install</code> denemende SSL sertifika hatası alabilirsin.</p>

<h3>pyenv: sürüm yönetimi</h3>
<p>Bir projen 3.11, diğeri 3.12 istiyorsa <b>pyenv</b> her sürümü kaynak koddan derleyip kullanıcı klasörüne kurar ve klasöre göre otomatik geçiş yapar. Bunu PATH'in başına koyduğu <b>shim</b> adlı küçük betiklerle yapar: <code>python</code> yazınca önce shim çalışır, hangi sürümün istendiğine bakar ve onu başlatır.</p>
<pre class="code">brew install pyenv                          # Linux'ta: curl https://pyenv.run | bash
echo 'export PYENV_ROOT="$HOME/.pyenv"' &gt;&gt; ~/.zshrc
echo '[[ -d $PYENV_ROOT/bin ]] &amp;&amp; export PATH="$PYENV_ROOT/bin:$PATH"' &gt;&gt; ~/.zshrc
echo 'eval "$(pyenv init - zsh)"' &gt;&gt; ~/.zshrc
exec "$SHELL"                               # kabuğu yeniden başlat
pyenv install 3.12.4
pyenv global 3.12.4                         # varsayılan sürüm (~/.pyenv/version)
cd anadolu-rapor &amp;&amp; pyenv local 3.11.9     # bu klasöre özel (.python-version dosyası)
pyenv versions</pre>
<p>pyenv sürümü şu sırayla seçer: <code>PYENV_VERSION</code> ortam değişkeni → bulunduğun klasörde (ya da üst klasörlerde) <code>.python-version</code> dosyası → <code>~/.pyenv/version</code> (global) → sistem Python'ı. Bu sıra bir "ilk dolu olan kazanır" zinciridir:</p>
<pre class="py">def pyenv_secimi(ortam_degiskeni, yerel_dosya, global_dosya):
    adaylar = [
        ("PYENV_VERSION", ortam_degiskeni),
        (".python-version", yerel_dosya),
        ("global", global_dosya),
    ]
    for kaynak, deger in adaylar:
        if deger and deger.strip():
            return deger.strip(), kaynak
    return "system", "sistem"

print(pyenv_secimi(None, "3.11.9\\n", "3.12.4"))
print(pyenv_secimi("3.13.0", "3.11.9", "3.12.4"))
print(pyenv_secimi("", None, None))</pre>

<h2>Linux</h2>
<h3>Ubuntu / Debian</h3>
<p>Ubuntu'da <code>python3</code> hemen her zaman kuruludur (Ubuntu 24.04'te 3.12). Ama sanal ortam ve pip modülleri <b>ayrı paketlerdir</b>; bu yüzden ilk iş:</p>
<pre class="code">sudo apt update
sudo apt install python3 python3-venv python3-pip
python3 --version
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt</pre>
<p><code>python3-venv</code> kurulu değilse <code>python3 -m venv</code> "ensurepip is not available" hatası verir. <code>python</code> komutunu istersen <code>sudo apt install python-is-python3</code> paketi bir bağlantı ekler.</p>
<h3>Fedora / RHEL</h3>
<pre class="code">sudo dnf install python3 python3-pip       # venv modülü python3 ile gelir
python3 -m venv .venv &amp;&amp; source .venv/bin/activate</pre>

<h3>externally-managed-environment (PEP 668)</h3>
<p>Ubuntu 23.04, Debian 12 ve sonrasında (ayrıca Arch ve Homebrew'da) sistem Python'ına <code>pip install</code> yapınca şu hatayı görürsün:</p>
<pre class="out">error: externally-managed-environment

× This environment is externally managed
╰─&gt; To install Python packages system-wide, try apt install
    python3-xyz, where xyz is the package you are trying to install.</pre>
<p>Bu bir hata değil, bir korumadır. <b>PEP 668</b> ile dağıtımlar, Python'ın standart kütüphane klasörüne <code>EXTERNALLY-MANAGED</code> adında bir işaret dosyası koyar; pip bu dosyayı görünce global kurulumu reddeder. Böylece pip ile apt aynı dosyaların üzerine yazıp birbirini bozmaz. Doğru çözümler:</p>
<div class="tbl-wrap"><table>
<tr><th>İhtiyacın</th><th>Çözüm</th><th>Komut</th></tr>
<tr><td>Bir proje için kütüphane</td><td>Sanal ortam</td><td><code>python3 -m venv .venv; source .venv/bin/activate; pip install pandas</code></td></tr>
<tr><td>Her yerden çalışan bir komut satırı aracı (ruff, black, httpie)</td><td>pipx: her aracı kendi gizli venv'ine kurar</td><td><code>sudo apt install pipx; pipx ensurepath; pipx install ruff</code></td></tr>
<tr><td>Dağıtımın paketlediği bir kütüphane</td><td>apt</td><td><code>sudo apt install python3-requests</code></td></tr>
<tr><td>"Ne olursa olsun kur"</td><td><code>--break-system-packages</code></td><td>Kullanma: adındaki uyarı gerçektir</td></tr>
</table></div>
<pre class="py">import sysconfig, pathlib, sys

stdlib = pathlib.Path(sysconfig.get_path("stdlib"))
isaret = stdlib / "EXTERNALLY-MANAGED"
print("Standart kütüphane:", stdlib)
print("PEP 668 işareti var mı:", isaret.exists())
print("Sanal ortam mı:", sys.prefix != sys.base_prefix)
if sys.prefix != sys.base_prefix:
    print("venv içinde pip serbest; işaret dosyası venv'e uygulanmaz.")</pre>

<h3>deadsnakes PPA: Ubuntu'da daha yeni Python</h3>
<p>Ubuntu LTS sürümleri Python'ı sabit tutar (22.04'te 3.10). Daha yenisi gerekiyorsa topluluğun <b>deadsnakes</b> deposu ek sürümleri <b>yan yana</b> kurar:</p>
<pre class="code">sudo add-apt-repository ppa:deadsnakes/ppa
sudo apt update
sudo apt install python3.13 python3.13-venv
python3.13 -m venv .venv</pre>
<div class="warn"><b>/usr/bin/python3'ü değiştirme</b>update-alternatives ya da elle bağlantıyla <code>python3</code>'ü yeni sürüme çevirmek apt, ağ yöneticisi ve terminal gibi sistem araçlarını bozabilir. Yeni sürümü her zaman sürümlü adıyla (<code>python3.13</code>) ve bir venv içinde kullan.</div>

<h2>uv: tek araçla Python ve ortam</h2>
<p><b>uv</b>, Rust ile yazılmış, çok hızlı bir Python paket ve proje yöneticisidir. Python'ın kendisini de indirip kurabildiği için pyenv, venv, pip ve pipx'in işini tek araçta toplar ve üç işletim sisteminde aynı komutlarla çalışır.</p>
<pre class="code">curl -LsSf https://astral.sh/uv/install.sh | sh     # macOS/Linux (ya da: brew install uv)
uv python install 3.12                               # Python 3.12'yi indir
uv python list                                       # bilinen/kurulu sürümler
uv venv --python 3.12                                # .venv oluştur
source .venv/bin/activate
uv pip install pandas                                # pip ile aynı arayüz, çok daha hızlı
uv tool install ruff                                 # pipx benzeri global araç
uv run betik.py                                      # ortamı hazırlayıp betiği çalıştır</pre>

<h2>Hangi yolu ne zaman seçmeli?</h2>
<div class="tbl-wrap"><table>
<tr><th>Durum</th><th>Önerilen yol</th><th>Neden</th></tr>
<tr><td>Mac'te öğrenmeye başlıyorum</td><td>python.org yükleyicisi ya da Homebrew</td><td>Basit, belgelenmiş</td></tr>
<tr><td>Mac/Linux'ta birden çok sürümle çalışıyorum</td><td>uv ya da pyenv</td><td>Klasöre göre sürüm, sisteme dokunmaz</td></tr>
<tr><td>Ubuntu sunucuda üretim servisi</td><td>apt'nin python3'ü + venv</td><td>Güvenlik güncellemelerini dağıtım yapar</td></tr>
<tr><td>Ubuntu LTS'de daha yeni sürüm lazım</td><td>deadsnakes ya da uv</td><td>Sistem Python'ı yerinde kalır</td></tr>
<tr><td>ruff, black gibi araçları her yerde kullanmak</td><td>pipx ya da <code>uv tool</code></td><td>Her araç izole, PEP 668 ile uyumlu</td></tr>
<tr><td>Ekip hızlı ve tekrarlanabilir kurulum istiyor</td><td>uv (+ uv.lock)</td><td>Tek komut, kilit dosyası</td></tr>
<tr><td>Uygulamayı konteynerde çalıştıracağım</td><td>Resmî <code>python:3.12-slim</code> imajı</td><td>Ortam imajla birlikte gelir</td></tr>
</table></div>

<h2>Hangi python3 çalışıyor?</h2>
<p>Unix'te PATH klasörleri <b>iki nokta</b> (<code>:</code>) ile ayrılır ve kabuk, Windows'taki gibi soldan sağa ilk eşleşmeyi çalıştırır. <code>which -a python3</code> hepsini, <code>type python3</code> çalışacak olanı gösterir. Kabuk bulduğu yolu önbelleğe alır; PATH'i değiştirdikten sonra garip davranış görürsen <code>hash -r</code> önbelleği temizler.</p>
<pre class="py">import posixpath

path_metni = "/home/ayse/.pyenv/shims:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin"
diskte = {"/opt/homebrew/bin/python3", "/usr/bin/python3", "/home/ayse/.pyenv/shims/python3"}

eslesmeler = [posixpath.join(k, "python3") for k in path_metni.split(":")
              if posixpath.join(k, "python3") in diskte]
print("which -a python3:")
for yol in eslesmeler:
    print("  ", yol)
print("Çalışacak olan:", eslesmeler[0])</pre>

<h2>Belirti → neden → çözüm</h2>
<div class="tbl-wrap"><table>
<tr><th>Belirti</th><th>Neden</th><th>Çözüm</th></tr>
<tr><td><code>python: command not found</code></td><td>Sistemde yalnız <code>python3</code> var</td><td><code>python3</code> yaz; Ubuntu'da <code>python-is-python3</code>; venv içinde <code>python</code> zaten var</td></tr>
<tr><td><code>error: externally-managed-environment</code></td><td>PEP 668 koruması</td><td>venv; araçlar için pipx / <code>uv tool</code></td></tr>
<tr><td><code>ensurepip is not available</code></td><td><code>python3-venv</code> paketi eksik</td><td><code>sudo apt install python3-venv</code> (ya da <code>python3.12-venv</code>)</td></tr>
<tr><td><code>No module named pip</code></td><td>pip paketi kurulmamış</td><td><code>sudo apt install python3-pip</code> ya da venv içinde çalış</td></tr>
<tr><td><code>xcrun: error: invalid active developer path</code></td><td>macOS güncellemesi sonrası CLT kayıp</td><td><code>xcode-select --install</code></td></tr>
<tr><td><code>brew: command not found</code> (kurulumdan hemen sonra)</td><td>"Next steps" adımı atlandı; <code>/opt/homebrew/bin</code> PATH'te yok</td><td><code>brew shellenv</code> satırını <code>~/.zprofile</code>'a ekle</td></tr>
<tr><td>macOS'ta <code>SSL: CERTIFICATE_VERIFY_FAILED</code></td><td>python.org kurulumunun sertifika adımı yapılmadı</td><td><code>Install Certificates.command</code> çalıştır</td></tr>
<tr><td><code>pyenv install</code> sonrası <code>No module named '_ssl'</code> ya da <code>'_sqlite3'</code></td><td>Derleme bağımlılıkları eksikti</td><td>libssl-dev, libsqlite3-dev, zlib1g-dev, libffi-dev vb. kur, sürümü yeniden derle</td></tr>
<tr><td><code>pyenv local</code> çalışmıyor, eski sürüm geliyor</td><td>Kabuk başlangıç dosyasına <code>pyenv init</code> eklenmemiş</td><td><code>~/.zshrc</code>/<code>~/.bashrc</code> satırlarını ekle, <code>exec "$SHELL"</code></td></tr>
<tr><td><code>Permission denied</code> (pip install)</td><td>Sistem klasörüne yazmaya çalışıyorsun</td><td>sudo kullanma; venv içinde kur</td></tr>
<tr><td><code>./betik.py: Permission denied</code></td><td>Dosya çalıştırılabilir değil</td><td><code>chmod +x betik.py</code> ve ilk satıra <code>#!/usr/bin/env python3</code></td></tr>
</table></div>

<div class="note"><b>Gerçek işte</b>Anadolu Lojistik'in rota raporu her gece bir Ubuntu sunucuda çalışıyor. Ekip sunucuya <code>apt</code> ile <code>python3</code> ve <code>python3-venv</code> kurmuş, uygulamayı <code>/opt/rota-rapor/.venv</code> içine yerleştirmiş ve systemd servisinde <code>ExecStart=/opt/rota-rapor/.venv/bin/python -m rota_rapor</code> yazmış. Venv'in Python'ını tam yoluyla çağırmak, etkinleştirmeye (<code>source</code>) gerek bırakmaz ve "sunucuda hangi Python çalışıyor" sorusunu ortadan kaldırır. Geliştiriciler ise Mac'lerinde aynı sürümü <code>uv python install 3.12</code> ile kuruyor.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Shebang ve çalıştırılabilir betikler</h3>
<p>Unix'te bir betiğin ilk satırı <code>#!</code> ile başlıyorsa (<b>shebang</b>), çekirdek o satırdaki programı yorumlayıcı olarak kullanır. <code>#!/usr/bin/env python3</code>, PATH'teki ilk <code>python3</code>'ü bulur; etkin venv'e ve pyenv'e uyum sağlar. <code>#!/usr/bin/python3</code> ise hep sistem Python'ını çağırır. Venv içindeki bir betik için en sağlamı venv'in Python'ını tam yoluyla yazmaktır.</p>
<pre class="py">import shlex, posixpath

def yorumlayici(ilk_satir):
    if not ilk_satir.startswith("#!"):
        return None
    parcalar = shlex.split(ilk_satir[2:])
    if posixpath.basename(parcalar[0]) == "env":
        return next(p for p in parcalar[1:] if not p.startswith("-"))
    return parcalar[0]

for satir in ["#!/usr/bin/env python3", "#!/usr/bin/python3.12 -u", "#!/usr/bin/env -S python3 -X utf8", "print('merhaba')"]:
    print(f"{satir!r:40} -&gt; {yorumlayici(satir)}")</pre>
<h3>Kabuk başlangıç dosyaları</h3>
<p>macOS varsayılan olarak <b>zsh</b> kullanır: oturum açılışında <code>~/.zprofile</code>, her yeni terminalde <code>~/.zshrc</code> okunur. Ubuntu <b>bash</b> kullanır: <code>~/.bashrc</code>. PATH'e eklediğin satırı yanlış dosyaya yazarsan "bir terminalde çalışıyor, ötekinde çalışmıyor" durumu oluşur. Değişiklikten sonra <code>source ~/.zshrc</code> ya da yeni terminal.</p>
<h3>pip3 mü, python3 -m pip mi?</h3>
<p><code>pip3</code>, PATH'te ilk bulunan pip'tir ve başka bir Python'a ait olabilir; Homebrew, pyenv ve sistem Python'ı bir arada olduğunda bu sık olur. <code>python3.12 -m pip</code> ise paketin hangi yorumlayıcıya gideceğini kesinleştirir. Venv etkinken <code>pip</code> güvenlidir çünkü venv'in <code>bin</code> klasörü PATH'in en başına eklenmiştir.</p>
</section>
`,
  ex: [
    {
      t: 'mc',
      stage: 'Isınma',
      q: 'Ubuntu 24.04\'te <code>pip install pandas</code> yazınca <code>error: externally-managed-environment</code> alıyorsun. Bir analiz projesi için en doğru hareket hangisi?',
      o: [
        '<code>sudo pip install pandas</code> ile yönetici olarak yeniden denemek',
        'Komutun sonuna <code>--break-system-packages</code> ekleyip kurulumu zorlamak',
        'Proje klasöründe <code>python3 -m venv .venv</code> kurup etkinleştirdikten sonra kurmak',
        '<code>/usr/bin/python3</code> bağlantısını başka bir Python sürümüne yönlendirmek'
      ],
      a: 2,
      why: 'PEP 668 koruması, apt\'nin yönettiği sistem Python\'ını pip\'in bozmasını engeller. Venv bu korumanın dışındadır ve projeye özeldir. sudo ve --break-system-packages korumayı deler; /usr/bin/python3\'ü değiştirmek sistem araçlarını bozabilir.'
    },
    {
      t: 'mc',
      stage: 'Isınma',
      q: 'M2 işlemcili bir Mac\'te Homebrew ile <code>brew install python@3.12</code> yaptın. Python 3.12 yorumlayıcısı büyük olasılıkla nerededir?',
      o: ['<code>/usr/bin/python3.12</code>', '<code>/usr/local/bin/python3.12</code>', '<code>/opt/homebrew/bin/python3.12</code>', '<code>~/Library/Python/3.12/python</code>'],
      a: 2,
      why: 'Apple Silicon Mac\'lerde Homebrew /opt/homebrew önekini, Intel Mac\'lerde /usr/local önekini kullanır. /usr/bin Apple\'ın sistem klasörüdür ve Homebrew oraya yazmaz.'
    },
    {
      t: 'mc',
      stage: 'Isınma',
      q: 'ruff kod biçimlendiricisini her projede, hiçbir venv etkin değilken de komut olarak kullanmak istiyorsun. Linux\'ta en uygun araç hangisi?',
      o: [
        '<code>pipx install ruff</code> ya da <code>uv tool install ruff</code>',
        '<code>sudo pip install ruff</code> ile tüm kullanıcılara kurmak',
        'Her projenin venv\'ine ayrı ayrı kurup PATH\'e eklemek',
        '<code>apt install python3-venv</code> kurup ruff\'ı oradan çağırmak'
      ],
      a: 0,
      why: 'pipx her komut satırı aracını kendi gizli venv\'ine kurar ve yalnızca komutu ~/.local/bin\'e bağlar; PEP 668 ile çatışmaz, araçların bağımlılıkları birbirine karışmaz. sudo pip sistem Python\'ını kirletir.'
    },
    {
      t: 'predict',
      stage: 'Kodu oku',
      q: '/etc/os-release benzeri bir metni ayrıştıran bu kod ne yazdırır?',
      code: 'metin = \'NAME="Ubuntu"\\nVERSION_ID="24.04"\\nID=ubuntu\'\nbilgi = {}\nfor satir in metin.splitlines():\n    anahtar, deger = satir.split("=", 1)\n    bilgi[anahtar] = deger.strip(\'"\')\nprint(bilgi["ID"], bilgi["VERSION_ID"], len(bilgi))\n',
      o: ['ubuntu "24.04" 3', 'ubuntu 24.04 3', 'Ubuntu 24.04 3', 'ubuntu 24.04 2'],
      a: 1,
      why: 'strip(\'"\') değerin başındaki ve sonundaki çift tırnakları atar; tırnaksız ID değeri olduğu gibi kalır. Üç satır üç anahtar üretir. NAME "Ubuntu", ID ise küçük harfli "ubuntu"dur; programlar ID\'ye bakar.'
    },
    {
      t: 'predict',
      stage: 'Kodu oku',
      q: 'Bu kod <code>which -a python3</code> komutunu taklit ediyor. Ne yazdırır?',
      code: 'yollar = "/opt/homebrew/bin:/usr/local/bin:/usr/bin".split(":")\ndiskte = {"/usr/bin/python3", "/opt/homebrew/bin/python3", "/usr/local/bin/pip3"}\nbulunan = [y + "/python3" for y in yollar if y + "/python3" in diskte]\nprint(bulunan[0])\nprint(len(bulunan))\n',
      o: ['/usr/bin/python3\n2', '/opt/homebrew/bin/python3\n3', '/opt/homebrew/bin/python3\n2', '/usr/local/bin/python3\n2'],
      a: 2,
      why: 'Liste PATH sırasıyla kurulur: önce /opt/homebrew/bin, sonra /usr/local/bin (orada yalnız pip3 var), sonra /usr/bin. İki python3 bulunur ve çalışacak olan ilkidir. Kümenin kendi sırası sonucu etkilemez.'
    },
    {
      t: 'predict',
      stage: 'Kodu oku',
      q: 'pyenv\'in sürüm seçme mantığını taklit eden bu kod ne yazdırır?',
      code: 'def surum_sec(ortam, yerel, genel):\n    return ortam or yerel or genel or "system"\n\nprint(surum_sec(None, "3.11.9", "3.12.4"))\nprint(surum_sec("", None, None))\n',
      o: ['3.12.4\nsystem', '3.11.9\nsystem', '3.11.9\n', 'None\nsystem'],
      a: 1,
      why: 'or zinciri ilk "doğru sayılan" değeri döndürür. None ve boş metin yanlış sayılır; ilk çağrıda yerel dosya (3.11.9) global\'den önce gelir. İkinci çağrıda hepsi boş olduğu için "system" döner.'
    },
    {
      t: 'order',
      stage: 'Kodu oku',
      q: '<p>Yeni bir Ubuntu sunucuda projeyi hazırlayan komut zincirini (CI ve Dockerfile\'larda böyle tek satır yazılır) üreten betiği sırala. Her komut bir öncekine bağlıdır.</p>',
      lines: [
        'adimlar = ["sudo apt update"]',
        'adimlar.append("sudo apt install -y python3 python3-venv python3-pip")',
        'adimlar.append("python3 -m venv .venv")',
        'adimlar.append("source .venv/bin/activate")',
        'adimlar.append("pip install -r requirements.txt")',
        'print(" && ".join(adimlar))'
      ],
      expect: 'sudo apt update && sudo apt install -y python3 python3-venv python3-pip && python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt\n',
      hint: 'Paket listesi güncellenmeden apt kurulum yapamaz; python3-venv olmadan venv oluşmaz.',
      why: 'apt update paket listesini yeniler, ardından python3-venv kurulur; venv oluşturulur ve etkinleştirilir; pip en son çalışır ki paketler venv\'e gitsin. && zinciri bir adım başarısız olursa sonrakileri çalıştırmaz.'
    },
    {
      t: 'code',
      stage: 'Rehberli',
      id: 'kurulum-macos-linux-1',
      diff: 1,
      q: '<p>Linux\'ta dağıtım bilgisi <code>/etc/os-release</code> dosyasındadır. <code>os_release_oku(metin)</code> fonksiyonunu yaz: her <code>ANAHTAR=DEGER</code> satırını sözlüğe koysun.</p><ul><li>Boş satırları ve <code>#</code> ile başlayan yorumları atla.</li><li>Yalnız <b>ilk</b> <code>=</code> işaretinden böl (değerde <code>=</code> olabilir).</li><li>Değerin etrafındaki çift ya da tek tırnakları at.</li></ul>',
      guide: [
        'Boş bir sözlük oluştur.',
        'metin.splitlines() ile satırlarda dön; satırı strip() ile temizle.',
        'Satır boşsa ya da "#" ile başlıyorsa continue.',
        'split("=", 1) ile anahtar ve değeri ayır; değeri strip(\'"\\\'\') ile tırnaklardan arındır.',
        'Sözlüğü döndür.'
      ],
      example: 'ayarlar = "renk=mavi\\n# yorum\\n\\nbaslik=\'Anadolu Market\'"\nsonuc = {}\nfor satir in ayarlar.splitlines():\n    satir = satir.strip()\n    if not satir or satir.startswith("#"):\n        continue\n    k, v = satir.split("=", 1)\n    sonuc[k] = v.strip("\'\\"")\nprint(sonuc)\n',
      start: 'def os_release_oku(metin):\n    bilgi = {}\n    # TODO: satırlarda dön, boş ve yorum satırlarını atla\n    # TODO: yalnız ilk "=" işaretinden böl\n    # TODO: değerin tırnaklarını atıp sözlüğe koy\n    return bilgi\n',
      sol: 'def os_release_oku(metin):\n    bilgi = {}\n    for satir in metin.splitlines():\n        satir = satir.strip()\n        if not satir or satir.startswith("#"):\n            continue\n        anahtar, deger = satir.split("=", 1)\n        bilgi[anahtar] = deger.strip("\\"\'")\n    return bilgi\n',
      tests: 'm = """PRETTY_NAME="Ubuntu 24.04.1 LTS"\nNAME="Ubuntu"\nVERSION_ID="24.04"\n# yorum satırı\n\nID=ubuntu\nID_LIKE=debian\nHOME_URL="https://www.ubuntu.com/?ref=os"\n"""\nb = os_release_oku(m)\nassert b["PRETTY_NAME"] == "Ubuntu 24.04.1 LTS", "Çift tırnaklar atılmalı, içteki boşluklar kalmalı"\nassert b["ID"] == "ubuntu" and b["ID_LIKE"] == "debian", "Tırnaksız değerler olduğu gibi kalır"\nassert b["HOME_URL"] == "https://www.ubuntu.com/?ref=os", "Değerdeki = işareti korunmalı: split(\\"=\\", 1)"\nassert len(b) == 6, "Yorum ve boş satır sözlüğe girmemeli: 6 anahtar"\nassert os_release_oku("NAME=\'Fedora Linux\'")["NAME"] == "Fedora Linux", "Tek tırnaklar da atılmalı"\nassert os_release_oku("") == {}, "Boş metin boş sözlük"\n',
      hints: ['Satırı temizleyip boş/yorum kontrolünü en başta yap.', 'anahtar, deger = satir.split("=", 1)', 'bilgi[anahtar] = deger.strip("\\"\'")  # iki tırnak türünü birden atar'],
      why: 'os-release biçimi basit görünse de değerler tırnaklı ya da tırnaksız, URL\'ler = içerebilir. maxsplit=1 ve strip ile iki tırnak türünü atmak bu farklılıkları tek kalıpta çözer.'
    },
    {
      t: 'code',
      stage: 'Rehberli',
      id: 'kurulum-macos-linux-2',
      diff: 2,
      q: '<p>Kurulum betiği, dağıtıma göre doğru komutu önermeli. <code>kurulum_komutu(bilgi)</code> fonksiyonunu yaz; <code>bilgi</code> os-release sözlüğüdür (<code>ID</code> ve isteğe bağlı <code>ID_LIKE</code> anahtarları). <code>ID_LIKE</code> boşlukla ayrılmış birden çok ad içerebilir (ör. <code>"rhel centos fedora"</code>).</p><ul><li>ID ya da ID_LIKE içinde <code>debian</code> veya <code>ubuntu</code> varsa → <code>"sudo apt install python3 python3-venv python3-pip"</code></li><li><code>fedora</code> veya <code>rhel</code> → <code>"sudo dnf install python3 python3-pip"</code></li><li><code>arch</code> → <code>"sudo pacman -S python python-pip"</code></li><li>Hiçbiri → <code>"uv python install 3.12"</code></li></ul>',
      guide: [
        'ID ve ID_LIKE değerlerini bilgi.get(..., "") ile al, küçük harfe çevir.',
        'İkisini boşlukla birleştirip split() ile bir "adlar" kümesi oluştur.',
        'Sırayla kümede debian/ubuntu, fedora/rhel, arch var mı kontrol et (küme kesişimi ya da any).',
        'Hiçbiri yoksa uv komutunu döndür.'
      ],
      example: 'etiketler = set("Elektronik Telefon".lower().split()) | {"kampanya"}\nif etiketler & {"telefon", "tablet"}:\n    print("Mobil kategori")\nelse:\n    print("Diğer")\n',
      start: 'def kurulum_komutu(bilgi):\n    # TODO: ID ve ID_LIKE\'tan küçük harfli bir adlar kümesi oluştur\n    adlar = set()\n    # TODO: sırayla apt, dnf, pacman ailelerini kontrol et\n    return ""\n',
      sol: 'def kurulum_komutu(bilgi):\n    adlar = set((bilgi.get("ID", "") + " " + bilgi.get("ID_LIKE", "")).lower().split())\n    if adlar & {"debian", "ubuntu"}:\n        return "sudo apt install python3 python3-venv python3-pip"\n    if adlar & {"fedora", "rhel"}:\n        return "sudo dnf install python3 python3-pip"\n    if "arch" in adlar:\n        return "sudo pacman -S python python-pip"\n    return "uv python install 3.12"\n',
      tests: 'assert kurulum_komutu({"ID": "ubuntu", "ID_LIKE": "debian"}) == "sudo apt install python3 python3-venv python3-pip", "Ubuntu apt kullanır"\nassert kurulum_komutu({"ID": "linuxmint", "ID_LIKE": "ubuntu debian"}) == "sudo apt install python3 python3-venv python3-pip", "Mint, ID_LIKE üzerinden apt ailesindedir"\nassert kurulum_komutu({"ID": "rocky", "ID_LIKE": "rhel centos fedora"}) == "sudo dnf install python3 python3-pip", "Rocky Linux, rhel ailesi: dnf"\nassert kurulum_komutu({"ID": "Fedora"}) == "sudo dnf install python3 python3-pip", "ID_LIKE olmayabilir; büyük harf de gelebilir"\nassert kurulum_komutu({"ID": "arch"}) == "sudo pacman -S python python-pip", "Arch: pacman"\nassert kurulum_komutu({"ID": "alpine"}) == "uv python install 3.12", "Tanınmayan dağıtım: uv önerisi"\nassert kurulum_komutu({}) == "uv python install 3.12", "Boş sözlükte de çökmemeli"\n',
      hints: ['bilgi.get("ID_LIKE", "") anahtar yoksa boş metin verir.', 'set(metin.lower().split()) & {"debian", "ubuntu"} boş değilse apt ailesidir.', 'Kontrol sırası: apt, dnf, pacman, en sonda uv.'],
      why: 'Türev dağıtımlar (Mint, Pop!_OS, Rocky, AlmaLinux) kendi ID\'lerini taşır ama ID_LIKE ile ailelerini bildirir. İkisini tek kümede toplamak, yüzlerce dağıtımı birkaç kuralla kapsar.'
    },
    {
      t: 'code',
      stage: 'Rehberli',
      id: 'kurulum-macos-linux-3',
      diff: 2,
      q: '<p>pyenv\'in sürüm seçimini taklit eden <code>pyenv_surumu(ortam, yerel, genel)</code> fonksiyonunu yaz.</p><ul><li><code>ortam</code>: ortam değişkenleri sözlüğü; <code>"PYENV_VERSION"</code> anahtarı olabilir.</li><li><code>yerel</code>: <code>.python-version</code> dosyasının içeriği ya da <code>None</code>.</li><li><code>genel</code>: <code>~/.pyenv/version</code> içeriği ya da <code>None</code>.</li></ul><p>Sırayla ilk <b>dolu</b> kaynağı kullan ve <code>(surum, kaynak)</code> döndür; kaynak <code>"PYENV_VERSION"</code>, <code>".python-version"</code>, <code>"global"</code> ya da hepsi boşsa <code>("system", "sistem")</code>. Dosya içeriğinde yorum satırları (<code>#</code>) ve boş satırlar olabilir; ilk gerçek satırı al ve boşluklarını temizle.</p>',
      guide: [
        'Dosya içeriğinden ilk anlamlı satırı veren küçük bir yardımcı yaz (ilk_satir).',
        'Yardımcı: None ise None döndür; satırlarda dön, strip et, boş ya da # ile başlayanı atla.',
        'Adayları (kaynak, değer) listesi olarak sırala.',
        'İlk dolu değeri bulunca (değer, kaynak) döndür; döngü biterse ("system", "sistem").'
      ],
      example: 'def ilk_dolu(*degerler):\n    for d in degerler:\n        if d:\n            return d\n    return "yok"\nprint(ilk_dolu(None, "", "kargo", "iade"))\n',
      start: 'def ilk_satir(icerik):\n    # TODO: None ise None; değilse ilk boş olmayan ve # ile başlamayan satır\n    return None\n\n\ndef pyenv_surumu(ortam, yerel, genel):\n    adaylar = [\n        ("PYENV_VERSION", ortam.get("PYENV_VERSION")),\n        # TODO: yerel ve genel dosyaları ilk_satir ile ekle\n    ]\n    # TODO: ilk dolu adayı döndür\n    return ("system", "sistem")\n',
      sol: 'def ilk_satir(icerik):\n    if icerik is None:\n        return None\n    for satir in icerik.splitlines():\n        satir = satir.strip()\n        if satir and not satir.startswith("#"):\n            return satir\n    return None\n\n\ndef pyenv_surumu(ortam, yerel, genel):\n    adaylar = [\n        ("PYENV_VERSION", (ortam.get("PYENV_VERSION") or "").strip()),\n        (".python-version", ilk_satir(yerel)),\n        ("global", ilk_satir(genel)),\n    ]\n    for kaynak, deger in adaylar:\n        if deger:\n            return (deger, kaynak)\n    return ("system", "sistem")\n',
      tests: 'assert pyenv_surumu({}, "3.11.9\\n", "3.12.4\\n") == ("3.11.9", ".python-version"), "Klasördeki .python-version global\'den önce gelir"\nassert pyenv_surumu({"PYENV_VERSION": "3.13.0"}, "3.11.9", "3.12.4") == ("3.13.0", "PYENV_VERSION"), "Ortam değişkeni her şeyi ezer"\nassert pyenv_surumu({"PYENV_VERSION": ""}, None, "# yorum\\n\\n  3.12.4  \\n") == ("3.12.4", "global"), "Boş ortam değişkeni sayılmaz; yorum ve boş satır atlanır"\nassert pyenv_surumu({}, "\\n# boş\\n", None) == ("system", "sistem"), "Yalnız yorum içeren dosya boş sayılır"\nassert pyenv_surumu({}, None, None) == ("system", "sistem"), "Hiçbiri yoksa sistem Python\'ı"\n',
      hints: [
        'Boş metin ve None, if koşulunda yanlış sayılır; "ilk dolu" kontrolü için yeterli.',
        'ilk_satir içinde: for satir in icerik.splitlines(): satir = satir.strip(); if satir and not satir.startswith("#"): return satir',
        'Adaylara (".python-version", ilk_satir(yerel)) ve ("global", ilk_satir(genel)) ekle; döngüde if deger: return (deger, kaynak)'
      ],
      why: 'Öncelik zincirleri yapılandırma sistemlerinde çok yaygındır (ortam değişkeni → proje dosyası → kullanıcı ayarı → varsayılan). Adayları sıralı bir listede tutmak, kuralı okunur ve genişletilebilir yapar.'
    },
    {
      t: 'code',
      stage: 'Kendin yaz',
      id: 'kurulum-macos-linux-4',
      diff: 1,
      q: '<p><code>homebrew_python_yolu(makine, surum="3.12", isletim="macos")</code> fonksiyonunu yaz. Homebrew öneki: macOS\'ta <code>makine == "arm64"</code> ise <code>/opt/homebrew</code>, <code>"x86_64"</code> ise <code>/usr/local</code>; Linux\'ta (Linuxbrew) makineden bağımsız <code>/home/linuxbrew/.linuxbrew</code>. Dönüş: <code>&lt;önek&gt;/bin/python&lt;surum&gt;</code>. macOS\'ta tanınmayan makinede <code>ValueError</code> fırlat.</p>',
      start: 'def homebrew_python_yolu(makine, surum="3.12", isletim="macos"):\n    pass\n',
      sol: 'def homebrew_python_yolu(makine, surum="3.12", isletim="macos"):\n    if isletim == "linux":\n        onek = "/home/linuxbrew/.linuxbrew"\n    elif makine == "arm64":\n        onek = "/opt/homebrew"\n    elif makine == "x86_64":\n        onek = "/usr/local"\n    else:\n        raise ValueError(f"Bilinmeyen makine: {makine}")\n    return f"{onek}/bin/python{surum}"\n',
      tests: 'assert homebrew_python_yolu("arm64") == "/opt/homebrew/bin/python3.12", "Apple Silicon: /opt/homebrew"\nassert homebrew_python_yolu("x86_64", "3.11") == "/usr/local/bin/python3.11", "Intel Mac: /usr/local"\nassert homebrew_python_yolu("x86_64", "3.13", "linux") == "/home/linuxbrew/.linuxbrew/bin/python3.13", "Linuxbrew öneki"\ntry:\n    homebrew_python_yolu("ppc")\n    assert False, "Tanınmayan makinede ValueError beklenir"\nexcept ValueError:\n    pass\n',
      hints: ['Önce işletim sistemini, sonra makineyi kontrol et.', 'f"{onek}/bin/python{surum}"'],
      why: 'Aynı formül iki farklı önekte yaşar; kurulum betikleri ve VS Code yapılandırmaları bu farkı bilmezse Intel ve Apple Silicon makinelerde farklı davranır.'
    },
    {
      t: 'code',
      stage: 'Kendin yaz',
      id: 'kurulum-macos-linux-5',
      diff: 2,
      q: '<p>Ekip wiki\'sindeki komutları denetleyen <code>pip_komutu_denetle(komut)</code> fonksiyonunu yaz. <code>shlex.split</code> ile parçala ve şu sırayla uyarı kodlarının listesini döndür:</p><ul><li>İlk parça <code>sudo</code> ise <code>"SUDO"</code> (sonraki kontroller sudo\'dan sonraki parçalara bakar).</li><li>Komut doğrudan <code>pip</code> ya da <code>pip3</code> ile başlıyorsa <code>"DOGRUDAN_PIP"</code> (öneri: python3 -m pip). <code>python3 -m pip</code> ya da <code>python3.12 -m pip</code> biçimi uyarı almaz.</li><li>Parçalarda <code>--break-system-packages</code> varsa <code>"PEP668_DELME"</code>.</li></ul><p>Sorun yoksa boş liste.</p>',
      start: 'import shlex\n\ndef pip_komutu_denetle(komut):\n    pass\n',
      sol: 'import shlex\n\ndef pip_komutu_denetle(komut):\n    parcalar = shlex.split(komut)\n    uyarilar = []\n    if parcalar and parcalar[0] == "sudo":\n        uyarilar.append("SUDO")\n        parcalar = parcalar[1:]\n    if parcalar and parcalar[0] in ("pip", "pip3"):\n        uyarilar.append("DOGRUDAN_PIP")\n    if "--break-system-packages" in parcalar:\n        uyarilar.append("PEP668_DELME")\n    return uyarilar\n',
      tests: 'assert pip_komutu_denetle("sudo pip3 install pandas --break-system-packages") == ["SUDO", "DOGRUDAN_PIP", "PEP668_DELME"], "Üç sorun da yakalanmalı, sırayla"\nassert pip_komutu_denetle("python3 -m pip install pandas") == [], "python3 -m pip doğru kullanım"\nassert pip_komutu_denetle("pip install \'pandas>=2.2\'") == ["DOGRUDAN_PIP"], "Tırnaklı sürüm belirteci tek parça kalır"\nassert pip_komutu_denetle("sudo python3.12 -m pip install requests") == ["SUDO"], "sudo tek başına uyarı"\nassert pip_komutu_denetle("python3 -m pip install x --break-system-packages") == ["PEP668_DELME"], "Bayrak her yerde yakalanır"\nassert pip_komutu_denetle("") == [], "Boş komut"\n',
      hints: ['shlex.split, tırnaklı \'pandas&gt;=2.2\' parçasını tek parça yapar.', 'sudo\'yu gördükten sonra parcalar = parcalar[1:] ile kalan komuta bak.'],
      why: 'Komutları str.split ile değil shlex ile parçalamak tırnaklı argümanları doğru işler. sudo pip ve --break-system-packages, Linux\'ta sistem Python\'ını bozmanın en kısa iki yoludur; doğrudan pip ise yanlış yorumlayıcıya kurulum riskidir.'
    },
    {
      t: 'code',
      stage: 'Kendin yaz',
      id: 'kurulum-macos-linux-6',
      diff: 2,
      q: '<p><code>venv_aktivasyon(kabuk, klasor=".venv")</code> fonksiyonunu yaz. <code>kabuk</code> ya <code>"zsh"</code> gibi bir ad ya da <code>$SHELL</code> değeri gibi tam yol (<code>"/bin/zsh"</code>) olabilir; adı yoldan çıkar. Dönüşler:</p><ul><li><code>bash</code>, <code>zsh</code>, <code>sh</code> → <code>"source .venv/bin/activate"</code></li><li><code>fish</code> → <code>"source .venv/bin/activate.fish"</code></li><li><code>csh</code>, <code>tcsh</code> → <code>"source .venv/bin/activate.csh"</code></li><li><code>pwsh</code> → <code>".venv/bin/Activate.ps1"</code></li><li>Diğerleri → <code>ValueError</code></li></ul><p><code>.venv</code> yerine <code>klasor</code> parametresini kullan.</p>',
      start: 'def venv_aktivasyon(kabuk, klasor=".venv"):\n    pass\n',
      sol: 'import posixpath\n\ndef venv_aktivasyon(kabuk, klasor=".venv"):\n    ad = posixpath.basename(kabuk)\n    if ad in ("bash", "zsh", "sh"):\n        return f"source {klasor}/bin/activate"\n    if ad == "fish":\n        return f"source {klasor}/bin/activate.fish"\n    if ad in ("csh", "tcsh"):\n        return f"source {klasor}/bin/activate.csh"\n    if ad == "pwsh":\n        return f"{klasor}/bin/Activate.ps1"\n    raise ValueError(f"Desteklenmeyen kabuk: {kabuk}")\n',
      tests: 'assert venv_aktivasyon("/bin/zsh") == "source .venv/bin/activate", "Tam yoldan kabuk adı çıkarılmalı"\nassert venv_aktivasyon("bash", "env") == "source env/bin/activate", "klasor parametresi kullanılmalı"\nassert venv_aktivasyon("/usr/bin/fish") == "source .venv/bin/activate.fish", "fish kendi betiğini kullanır"\nassert venv_aktivasyon("tcsh") == "source .venv/bin/activate.csh", "tcsh: activate.csh"\nassert venv_aktivasyon("/usr/local/bin/pwsh") == ".venv/bin/Activate.ps1", "Linux/macOS\'ta PowerShell de bin altındadır"\ntry:\n    venv_aktivasyon("nushell")\n    assert False, "Desteklenmeyen kabukta ValueError"\nexcept ValueError:\n    pass\n',
      hints: ['posixpath.basename("/bin/zsh") → "zsh"', 'Her kabuk ailesi için bir if; f-string içinde klasor kullan.'],
      why: 'venv her kabuk için ayrı etkinleştirme betiği üretir, çünkü kabukların sözdizimi farklıdır. $SHELL tam yol verdiği için basename ile adı ayırmak gerekir.'
    },
    {
      t: 'code',
      stage: 'Kendin yaz',
      id: 'kurulum-macos-linux-7',
      diff: 2,
      q: '<p><code>shebang_yorumla(ilk_satir)</code> fonksiyonunu yaz: betiğin ilk satırına bakıp hangi yorumlayıcının çağrılacağını döndürsün.</p><ul><li><code>#!</code> ile başlamıyorsa <code>None</code>.</li><li><code>#!</code> sonrasını <code>shlex.split</code> ile parçala (<code>#! /usr/bin/python3</code> gibi boşluklu yazım da olur).</li><li>İlk parçanın son bileşeni <code>env</code> ise, <code>-</code> ile başlamayan ilk sonraki parçayı döndür (<code>#!/usr/bin/env -S python3 -u</code> → <code>"python3"</code>).</li><li>Değilse ilk parçayı (tam yolu) döndür.</li></ul>',
      start: 'import shlex\n\ndef shebang_yorumla(ilk_satir):\n    pass\n',
      sol: 'import shlex, posixpath\n\ndef shebang_yorumla(ilk_satir):\n    if not ilk_satir.startswith("#!"):\n        return None\n    parcalar = shlex.split(ilk_satir[2:])\n    if not parcalar:\n        return None\n    if posixpath.basename(parcalar[0]) == "env":\n        for p in parcalar[1:]:\n            if not p.startswith("-"):\n                return p\n        return None\n    return parcalar[0]\n',
      tests: 'assert shebang_yorumla("#!/usr/bin/env python3") == "python3", "env ile PATH\'teki python3"\nassert shebang_yorumla("#!/usr/bin/python3.12 -u") == "/usr/bin/python3.12", "Doğrudan yol; seçenekler önemsiz"\nassert shebang_yorumla("#! /usr/bin/python3") == "/usr/bin/python3", "#! sonrası boşluk olabilir"\nassert shebang_yorumla("#!/usr/bin/env -S python3 -X utf8") == "python3", "env seçenekleri (-S) atlanmalı"\nassert shebang_yorumla("#!/home/ayse/rapor/.venv/bin/python") == "/home/ayse/rapor/.venv/bin/python", "venv yorumlayıcısı"\nassert shebang_yorumla("import sys") is None, "Shebang değil"\nassert shebang_yorumla("#!") is None, "Boş shebang"\n',
      hints: ['ilk_satir[2:] ile #! işaretinden sonrasını al.', 'posixpath.basename(parcalar[0]) == "env" ise sonraki parçalarda - ile başlamayan ilkini bul.'],
      why: 'env, PATH\'te arama yaparak yorumlayıcıyı bulur; bu yüzden etkin venv ya da pyenv sürümü kullanılır. Doğrudan yol ise hep aynı yorumlayıcıyı çağırır. Teşhiste ilk soru budur: betik hangi Python ile başlıyor?'
    },
    {
      t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      id: 'kurulum-macos-linux-8',
      diff: 2,
      q: '<p>Hatayı bul ve düzelt. <code>dagitim_adi(metin)</code> os-release metninden <code>PRETTY_NAME</code> değerini (tırnaksız) döndürmeli; anahtar yoksa <code>NAME</code>, o da yoksa <code>"Linux"</code>. Gerçek dosyalarda kod çöküyor ya da tırnaklı sonuç veriyor.</p>',
      start: 'def dagitim_adi(metin):\n    bilgi = {}\n    for satir in metin.splitlines():\n        anahtar, deger = satir.split("=")\n        bilgi[anahtar] = deger\n    return bilgi.get("PRETTY_NAME", bilgi["NAME"])\n',
      sol: 'def dagitim_adi(metin):\n    bilgi = {}\n    for satir in metin.splitlines():\n        satir = satir.strip()\n        if not satir or satir.startswith("#") or "=" not in satir:\n            continue\n        anahtar, deger = satir.split("=", 1)\n        bilgi[anahtar] = deger.strip("\\"\'")\n    return bilgi.get("PRETTY_NAME") or bilgi.get("NAME") or "Linux"\n',
      tests: 'm = \'PRETTY_NAME="Debian GNU/Linux 12 (bookworm)"\\nNAME="Debian GNU/Linux"\\n\\nHOME_URL="https://www.debian.org/?a=b"\\n\'\nassert dagitim_adi(m) == "Debian GNU/Linux 12 (bookworm)", "Boş satır ve = içeren URL çökertmemeli, tırnaklar atılmalı"\nassert dagitim_adi(\'NAME="Alpine Linux"\\nID=alpine\') == "Alpine Linux", "PRETTY_NAME yoksa NAME"\nassert dagitim_adi("ID=bilinmeyen") == "Linux", "İkisi de yoksa Linux; KeyError değil"\nassert dagitim_adi("# yorum\\nPRETTY_NAME=\'Fedora Linux 40\'") == "Fedora Linux 40", "Yorum satırı atlanmalı; tek tırnak da atılmalı"\n',
      hints: [
        'Dört sorun var: boş/yorum satırı atlanmıyor, split("=") maxsplit olmadan URL\'de patlıyor, tırnaklar atılmıyor ve bilgi["NAME"] varsayılan bile kullanılmasa önce değerlendirilip KeyError veriyor.',
        'bilgi.get("PRETTY_NAME") or bilgi.get("NAME") or "Linux" zinciri hiç KeyError vermez.'
      ],
      why: 'dict.get(k, varsayilan) çağrısında varsayılan ifade her durumda önce hesaplanır; bilgi["NAME"] anahtar yoksa çağrıdan önce KeyError verir. or zinciri ise tembeldir. Gerçek dosyalarda boş satır, yorum ve = içeren değerler bulunur.'
    },
    {
      t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      id: 'kurulum-macos-linux-9',
      diff: 2,
      q: '<p>Hatayı bul ve düzelt. <code>ortam_etiketi(prefix, base_prefix)</code>, terminal isteminde gösterilecek etiketi üretiyor: sanal ortamdaysan (prefix ile base_prefix farklıysa) ortam klasörünün adı, değilsen <code>"sistem"</code>. Kod tersini yapıyor ve sonunda <code>/</code> olan yollarda boş etiket veriyor.</p>',
      start: 'import posixpath\n\ndef ortam_etiketi(prefix, base_prefix):\n    if prefix == base_prefix:\n        return posixpath.basename(prefix)\n    return "sistem"\n',
      sol: 'import posixpath\n\ndef ortam_etiketi(prefix, base_prefix):\n    if posixpath.normpath(prefix) == posixpath.normpath(base_prefix):\n        return "sistem"\n    return posixpath.basename(posixpath.normpath(prefix))\n',
      tests: 'assert ortam_etiketi("/home/ayse/rapor/.venv", "/usr") == ".venv", "Farklı önek: venv içindesin, klasör adı .venv"\nassert ortam_etiketi("/usr", "/usr") == "sistem", "Aynı önek: sistem Python\'ı"\nassert ortam_etiketi("/opt/proje/env/", "/opt/homebrew/opt/python@3.12") == "env", "Sondaki / basename\'i boşaltmamalı: normpath kullan"\nassert ortam_etiketi("/usr/", "/usr") == "sistem", "Sondaki / farkı venv sanılmamalı"\n',
      hints: ['Koşul ters: prefix != base_prefix ise venv içindesin.', 'posixpath.basename("/a/b/") boş metin döner; önce posixpath.normpath ile sondaki /\'i at.'],
      why: 'sys.prefix çalışan ortamın kökü, sys.base_prefix onun türediği kurulumdur; ikisi farklıysa venv içindesin. Yolları karşılaştırmadan ve bileşen almadan önce normalleştirmek, sondaki ayırıcı gibi biçim farklarını ortadan kaldırır.'
    },
    {
      t: 'code',
      stage: 'Meydan okuma',
      id: 'kurulum-macos-linux-10',
      diff: 3,
      q: '<p>Yıllar içinde <code>~/.zshrc</code>\'ye eklenen satırlar PATH\'i karmakarışık yaptı. <code>path_temizle(path_metni, ev)</code> fonksiyonunu yaz (ayırıcı <code>:</code>):</p><ul><li>Boş girdileri at.</li><li>Başta <code>~</code> varsa <code>ev</code> klasörüyle değiştir (<code>~</code> tek başına ya da <code>~/...</code>).</li><li>Her girdiyi <code>posixpath.normpath</code> ile normalleştir (<code>/usr//bin/</code> → <code>/usr/bin</code>).</li><li><b>Göreli</b> girdileri (<code>.</code>, <code>bin</code> gibi <code>/</code> ile başlamayanlar) güvenlik nedeniyle at.</li><li>Tekrarları at; <b>ilk</b> görüleni tut (sıra önemlidir!).</li></ul><p>Temizlenmiş PATH\'i yine <code>:</code> ile birleştirilmiş metin olarak döndür.</p>',
      start: 'import posixpath\n\ndef path_temizle(path_metni, ev):\n    pass\n',
      sol: 'import posixpath\n\ndef path_temizle(path_metni, ev):\n    sonuc = []\n    gorulen = set()\n    for girdi in path_metni.split(":"):\n        girdi = girdi.strip()\n        if not girdi:\n            continue\n        if girdi == "~" or girdi.startswith("~/"):\n            girdi = ev + girdi[1:]\n        if not girdi.startswith("/"):\n            continue\n        girdi = posixpath.normpath(girdi)\n        if girdi in gorulen:\n            continue\n        gorulen.add(girdi)\n        sonuc.append(girdi)\n    return ":".join(sonuc)\n',
      tests: 'p = "~/.local/bin:/opt/homebrew/bin::/usr//bin/:/home/ayse/.local/bin:.:/usr/bin:bin:/opt/homebrew/bin/:~"\nassert path_temizle(p, "/home/ayse") == "/home/ayse/.local/bin:/opt/homebrew/bin:/usr/bin:/home/ayse", "~ açılmalı, normalleştirilmeli, göreli ve tekrarlar atılmalı; ilk görülen sırası korunmalı"\nassert path_temizle("", "/home/x") == "", "Boş PATH"\nassert path_temizle("/a/../b:/b", "/h") == "/b", "normpath /a/../b\'yi /b yapar; ikinci /b tekrardır"\nassert path_temizle("~user/bin:/usr/bin", "/h") == "/usr/bin", "~user başka kullanıcıdır; açılmaz ve göreli sayılıp atılır"\n',
      hints: [
        'Kontrol sırası önemli: boş → ~ açma → göreli mi → normpath → tekrar mı.',
        'Sırayı korumak için hem bir liste (sonuc) hem bir küme (gorulen) tut.',
        '"~user/bin" ~ ile başlar ama "~/" ile başlamaz; açma, göreli olduğu için atılır.'
      ],
      why: 'PATH\'te sıra anlam taşır; tekrarları atarken ilk görüleni tutmak davranışı değiştirmez. Göreli girdiler (özellikle ".") güvenlik açığıdır: bulunduğun klasördeki "python3" adlı kötü niyetli bir dosya gerçek Python\'ın yerine çalışabilir.'
    },
    {
      t: 'code',
      stage: 'Mini proje',
      id: 'kurulum-macos-linux-11',
      diff: 3,
      q: '<p>Anadolu Lojistik\'in sunucu envanteri için <code>ortam_raporu(os_release_metni, path_metni, diskteki)</code> fonksiyonunu yaz. Sözlük döndür:</p><ul><li><code>"dagitim"</code>: PRETTY_NAME (yoksa NAME, o da yoksa <code>"Linux"</code>), tırnaksız.</li><li><code>"kurulum"</code>: ID/ID_LIKE ailesine göre komut (apt: <code>"sudo apt install python3 python3-venv python3-pip"</code>, dnf: <code>"sudo dnf install python3 python3-pip"</code>, diğer: <code>"uv python install 3.12"</code>).</li><li><code>"pep668"</code>: ID <code>ubuntu</code> ve VERSION_ID ≥ 23.04, ya da ID <code>debian</code> ve VERSION_ID ≥ 12 ise <code>True</code>; aksi hâlde <code>False</code>. Sürümleri sayı demeti olarak karşılaştır.</li><li><code>"python3"</code>: PATH (<code>:</code> ayırıcı) sırasıyla <code>diskteki</code> kümesinde bulunan ilk <code>&lt;klasör&gt;/python3</code>; yoksa <code>None</code>.</li><li><code>"oneri"</code>: python3 yoksa kurulum komutu; varsa ve pep668 True ise <code>"python3 -m venv .venv"</code>; değilse <code>"python3 -m pip install --user"</code>.</li></ul>',
      start: 'def ortam_raporu(os_release_metni, path_metni, diskteki):\n    pass\n',
      sol: 'import posixpath\n\ndef _oku(metin):\n    bilgi = {}\n    for satir in metin.splitlines():\n        satir = satir.strip()\n        if not satir or satir.startswith("#") or "=" not in satir:\n            continue\n        k, v = satir.split("=", 1)\n        bilgi[k] = v.strip("\\"\'")\n    return bilgi\n\ndef _surum(metin):\n    try:\n        return tuple(int(p) for p in metin.split("."))\n    except ValueError:\n        return ()\n\ndef ortam_raporu(os_release_metni, path_metni, diskteki):\n    b = _oku(os_release_metni)\n    adlar = set((b.get("ID", "") + " " + b.get("ID_LIKE", "")).lower().split())\n    if adlar & {"debian", "ubuntu"}:\n        kurulum = "sudo apt install python3 python3-venv python3-pip"\n    elif adlar & {"fedora", "rhel"}:\n        kurulum = "sudo dnf install python3 python3-pip"\n    else:\n        kurulum = "uv python install 3.12"\n    kimlik = b.get("ID", "").lower()\n    surum = _surum(b.get("VERSION_ID", ""))\n    pep668 = (kimlik == "ubuntu" and surum >= (23, 4)) or (kimlik == "debian" and surum >= (12,))\n    python3 = None\n    for klasor in path_metni.split(":"):\n        if klasor and posixpath.join(klasor, "python3") in diskteki:\n            python3 = posixpath.join(klasor, "python3")\n            break\n    if python3 is None:\n        oneri = kurulum\n    elif pep668:\n        oneri = "python3 -m venv .venv"\n    else:\n        oneri = "python3 -m pip install --user"\n    return {\n        "dagitim": b.get("PRETTY_NAME") or b.get("NAME") or "Linux",\n        "kurulum": kurulum,\n        "pep668": pep668,\n        "python3": python3,\n        "oneri": oneri,\n    }\n',
      tests: 'u = \'PRETTY_NAME="Ubuntu 24.04.1 LTS"\\nID=ubuntu\\nID_LIKE=debian\\nVERSION_ID="24.04"\'\nr = ortam_raporu(u, "/usr/local/bin:/usr/bin", {"/usr/bin/python3"})\nassert r == {"dagitim": "Ubuntu 24.04.1 LTS", "kurulum": "sudo apt install python3 python3-venv python3-pip", "pep668": True, "python3": "/usr/bin/python3", "oneri": "python3 -m venv .venv"}, "Ubuntu 24.04: PEP 668 açık, venv önerilir"\nu22 = \'PRETTY_NAME="Ubuntu 22.04.4 LTS"\\nID=ubuntu\\nVERSION_ID="22.04"\'\nr = ortam_raporu(u22, "/usr/bin", {"/usr/bin/python3"})\nassert r["pep668"] is False and r["oneri"] == "python3 -m pip install --user", "22.04 < 23.04: PEP 668 yok"\nd = \'PRETTY_NAME="Debian GNU/Linux 12 (bookworm)"\\nID=debian\\nVERSION_ID="12"\'\nr = ortam_raporu(d, "/usr/bin", set())\nassert r["pep668"] is True and r["python3"] is None and r["oneri"] == "sudo apt install python3 python3-venv python3-pip", "Debian 12: PEP 668; python3 yoksa öneri kurulum komutudur"\nf = \'NAME="Fedora Linux"\\nID=fedora\\nVERSION_ID=40\'\nr = ortam_raporu(f, "/home/u/.local/bin:/usr/bin", {"/usr/bin/python3", "/home/u/.local/bin/python3"})\nassert r["dagitim"] == "Fedora Linux" and r["kurulum"] == "sudo dnf install python3 python3-pip" and r["python3"] == "/home/u/.local/bin/python3" and r["pep668"] is False, "Fedora: dnf, PATH\'teki ilk python3"\na = \'ID=alpine\\nVERSION_ID=3.20.1\'\nr = ortam_raporu(a, "", set())\nassert r["dagitim"] == "Linux" and r["kurulum"] == "uv python install 3.12" and r["oneri"] == "uv python install 3.12", "Tanınmayan dağıtım"\nassert ortam_raporu(\'ID=ubuntu\\nVERSION_ID="23.10"\', "", set())["pep668"] is True, "23.10 >= 23.04: (23, 10) >= (23, 4)"\n',
      hints: [
        'Önce os-release ayrıştırıcısını (_oku) ve sürüm demeti çeviricisini (_surum) yardımcı fonksiyon olarak yaz.',
        '"24.04" → (24, 4); (24, 4) >= (23, 4) doğru, metin karşılaştırmasına güvenme.',
        'PATH\'te ilk bulunan python3 için döngüde break kullan; öneriyi en sonda üç durumla seç.'
      ],
      why: 'Küçük ve test edilebilir yardımcılar (ayrıştırma, sürüm çevirme) büyük kararı okunur kılar. Bu fonksiyon, derste öğrendiğin her şeyi birleştirir: os-release, dağıtım aileleri, PEP 668, PATH sırası ve doğru kurulum önerisi.'
    }
  ],
  faq: [
    {
      q: 'Mac\'te python.org mu Homebrew mu?',
      a: 'İkisi de iyidir. Homebrew başka geliştirme araçlarını da kuruyorsan tutarlıdır; python.org yükleyicisi ise Homebrew\'un güncellemeyle sürümü değiştirmesinden etkilenmez. Birden çok sürüm gerekiyorsa uv ya da pyenv daha esnektir.'
    },
    {
      q: 'pyenv mi uv mi?',
      a: 'pyenv olgun ve yaygındır ama sürümleri derlediği için yavaştır ve derleme bağımlılıkları ister. uv hazır derlenmiş Python indirir, saniyeler içinde kurar ve ortam ile paket yönetimini de yapar. Yeni projelerde uv giderek varsayılan hâline geliyor; mevcut ekip pyenv kullanıyorsa ona uy.'
    },
    {
      q: '--break-system-packages gerçekten bu kadar tehlikeli mi?',
      a: 'pip, apt\'nin kurduğu bir kütüphanenin üzerine farklı bir sürüm yazabilir; apt\'ye bağlı bir sistem aracı o kütüphanenin yeni sürümüyle çalışmayıp bozulabilir. Bir konteyner ya da tek kullanımlık sanal makinede kabul edilebilir; kendi bilgisayarında ve sunucuda venv kullan.'
    },
    {
      q: 'WSL\'de hangi adımları izlemeliyim?',
      a: 'WSL içinde Ubuntu çalışır; bu dersteki Ubuntu adımları aynen geçerlidir. Projelerini Windows diskinde (/mnt/c) değil WSL\'in kendi dosya sisteminde (~/projeler) tut; dosya işlemleri çok daha hızlı olur.'
    }
  ],
  mistakes: [
    {
      bad: 'sudo pip install pandas',
      good: 'python3 -m venv .venv\nsource .venv/bin/activate\npip install pandas',
      why: 'sudo pip sistem Python\'ına yazar, apt\'nin dosyalarıyla çakışır ve PEP 668 korumasını deler. Proje bağımlılıkları venv\'e gider.'
    },
    {
      bad: 'sudo ln -sf /usr/bin/python3.13 /usr/bin/python3',
      good: 'python3.13 -m venv .venv\n# projede: .venv/bin/python',
      why: 'Sistem araçları /usr/bin/python3\'ün dağıtımın sürümü olmasına güvenir; bağlantıyı değiştirmek apt ve diğer araçları bozabilir.'
    },
    {
      bad: 'anahtar, deger = satir.split("=")',
      good: 'anahtar, deger = satir.split("=", 1)',
      why: 'Yapılandırma değerleri (URL\'ler, parametreler) = içerebilir; maxsplit olmadan iki yerine üç parça çıkar ve ValueError alırsın.'
    },
    {
      bad: '#!/usr/bin/python3\n# venv\'deki paketleri kullanacak betik',
      good: '#!/usr/bin/env python3\n# ya da venv yorumlayıcısının tam yolu',
      why: '/usr/bin/python3 hep sistem Python\'ıdır ve venv\'e kurduğun paketleri görmez. env, PATH\'teki (etkin venv\'deki) python3\'ü bulur.'
    }
  ]
}
);
})(window);
/* PythonPatika — v2/t1: kurulum-windows */
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push(
{
  id: 'kurulum-windows',
  lv: 'temel',
  mod: 'Başlangıç',
  min: 40,
  title: 'Windows\'ta Python kurulumu',
  sum: 'python.org yükleyicisinin her ekranını, Store takma adı tuzağını, py başlatıcısını, PATH\'i, PowerShell yürütme ilkesini ve en sık on bir kurulum hatasının teşhisini öğrenirsin.',
  goals: [
    'python.org yükleyicisini doğru seçeneklerle kurup kurulumu üç komutla doğrulayabilirim.',
    'PATH\'in nasıl arandığını açıklar, where ve py --list çıktısından hangi Python\'ın çalışacağını söyleyebilirim.',
    'Store takma adı ve yürütme ilkesi hatalarını tanıyıp tek ayarla çözebilirim.',
    'py başlatıcısıyla birden çok sürümü yönetir, projeye özel venv oluşturabilirim.',
    'Sık kurulum hatalarını belirti → neden → çözüm mantığıyla teşhis edebilirim.'
  ],
  body: `
<h2>Neden ayrı bir Windows dersi?</h2>
<p><b>Kurulum ve araçlar</b> dersinde Python'ı kurmayı kısaca gördün. Bu ders, o kısa anlatımın "ama bende çalışmadı" kısmıdır. Windows'ta Python kurulumu çoğu zaman beş dakika sürer; sorun çıktığında ise saatler alabilir, çünkü hata mesajı genellikle asıl nedeni söylemez. <code>'python' is not recognized</code> diyen bir terminal sana "PATH ortam değişkeninde Python klasörü yok" demez. Bu derste kurulumun her ekranını, Windows'un bir komutu nasıl bulduğunu ve en sık karşılaşılan hataların gerçek nedenini öğreneceksin. Amaç ezber değil, <b>teşhis</b> yapabilmek: bir sonraki bilgisayarda ya da bir ekip arkadaşının ekranında sorunu iki dakikada çözmek.</p>
<p>Anadolu Market'in veri ekibine yeni katılan bir stajyer düşün. İlk gün kurumsal dizüstü bilgisayarına Python kuruyor, VS Code'u açıyor ve ilk betiği çalıştırınca terminal Microsoft Store'u açıyor. Bu derste o sorunun neden olduğunu ve neden tek bir ayar düğmesiyle çözüldüğünü göreceksin.</p>

<h2>Dört kurulum yolu</h2>
<div class="tbl-wrap"><table>
<tr><th>Yol</th><th>Artısı</th><th>Eksisi</th><th>Kimin için</th></tr>
<tr><td>python.org yükleyicisi</td><td>Resmî, tam denetim, <code>py</code> başlatıcısı gelir</td><td>Ekranları doğru işaretlemek gerekir</td><td>Çoğu kişi için önerilen yol</td></tr>
<tr><td>Microsoft Store</td><td>Yönetici izni istemez, otomatik güncellenir</td><td>Bazı klasörlere yazma kısıtlı, <code>py</code> başlatıcısı yok</td><td>Okul ya da kilitli bilgisayar</td></tr>
<tr><td><code>winget</code></td><td>Tek komut, betikle tekrarlanabilir</td><td>Kurulum seçeneklerini görmezsin</td><td>Birden çok makine kuran, otomasyon seven</td></tr>
<tr><td>Anaconda/Miniconda</td><td>Bilimsel paketler hazır gelir</td><td>Büyük, kendi ortam sistemi var</td><td>Veri bilimi; <b>Jupyter ve Colab</b> dersinde</td></tr>
</table></div>

<h2>python.org yükleyicisi adım adım</h2>
<p>python.org/downloads adresinden <b>Windows installer (64-bit)</b> dosyasını indir (örneğin <code>python-3.12.4-amd64.exe</code>). "embeddable package" başka programların içine gömülmek içindir; öğrenme için değil.</p>
<div class="steps-list"><ol>
<li><b>İlk ekran:</b> en altta iki kutu var. <b>"Use admin privileges when installing py.exe"</b> başlatıcıyı tüm kullanıcılar için kurar (yönetici izni ister; yoksa işaretini kaldır). <b>"Add python.exe to PATH"</b> kutusunu mutlaka işaretle; varsayılan olarak <i>işaretsiz</i> gelir ve sorunların yarısı buradan çıkar.</li>
<li><b>Install Now</b> seçersen Python kullanıcı klasörüne kurulur: <code>C:\\Users\\ayse\\AppData\\Local\\Programs\\Python\\Python312</code>. Yönetici izni gerekmez. Yeni başlıyorsan bu yeterlidir.</li>
<li><b>Customize installation</b> seçersen "Optional Features" ekranı gelir: <i>pip</i> (paket yükleyici, açık kalsın), <i>tcl/tk and IDLE</i> (basit editör ve tkinter), <i>Python test suite</i> (gerekmez), <i>py launcher</i> (açık kalsın), <i>for all users</i> (başlatıcıyı herkese kurar).</li>
<li><b>Advanced Options</b> ekranında: <i>Install Python 3.12 for all users</i> (Program Files'a kurar, yönetici ister), <i>Associate files with Python</i> (.py dosyasına çift tıklayınca çalışsın), <i>Add Python to environment variables</i> (ilk ekrandaki PATH kutusunun aynısı), <i>Precompile standard library</i>. Kurulum yolunu <code>C:\\Python312</code> gibi <b>kısa, boşluksuz, Türkçe karaktersiz</b> bir yere almak ileride çok baş ağrısı önler.</li>
<li><b>Son ekran:</b> "Disable path length limit" düğmesi çıkarsa tıkla. Windows'un 260 karakterlik yol sınırını kaldırır; derin klasörlü paketlerde pip hatalarını önler.</li>
</ol></div>
<p>Kurulum bitince <b>yeni</b> bir terminal aç (açık olan terminal eski PATH'i hatırlar) ve doğrula:</p>
<pre class="code">python --version
py --version
python -m pip --version
where python</pre>
<p>Python'a kendisini anlattırmak da mümkün. Aşağıdaki kod, hangi yorumlayıcının çalıştığını ve nereye kurulduğunu gösterir; "yanlış Python çalışıyor" şüphesinde ilk bakılacak yer burasıdır.</p>
<pre class="py">import sys, platform

print("Sürüm      :", platform.python_version())
print("Ana / alt  :", sys.version_info.major, sys.version_info.minor)
print("Yorumlayıcı:", sys.executable or "(tarayıcıda yol yok)")
print("Kurulum    :", sys.prefix)
print("İşletim    :", platform.system())
print("64 bit mi  :", sys.maxsize &gt; 2**32)
print("3.10+ mı   :", sys.version_info &gt;= (3, 10))</pre>
<div class="tip"><b>Sürüm karşılaştırmanın doğru yolu</b><code>sys.version_info</code> bir demet (tuple) gibi davranır; <code>sys.version_info &gt;= (3, 10)</code> sayı sayı karşılaştırır. Sürümü metin olarak karşılaştırma: <code>"3.9" &gt; "3.12"</code> ifadesi True döner çünkü metinler karakter karakter karşılaştırılır ve "9" &gt; "1".</div>

<h2>Microsoft Store tuzağı: App execution aliases</h2>
<p>Windows 10 ve 11, Python kurulu olmasa bile <code>C:\\Users\\ayse\\AppData\\Local\\Microsoft\\WindowsApps</code> klasörüne <code>python.exe</code> ve <code>python3.exe</code> adında küçük <b>takma ad (alias)</b> dosyaları koyar. Bunlar gerçek Python değildir; çalışınca Store'u açar ya da <code>Python was not found; run without arguments to install from the Microsoft Store</code> yazar. WindowsApps klasörü PATH'te genellikle senin Python klasöründen <b>önce</b> geldiği için, Python'ı kurmuş olsan bile takma ad kazanır.</p>
<p><b>Çözüm:</b> Ayarlar → Uygulamalar → Gelişmiş uygulama ayarları → <b>Uygulama yürütme diğer adları</b> (App execution aliases) ekranında "Uygulama yükleyici python.exe" ve "python3.exe" satırlarını kapat. Ardından yeni terminal aç. Store sürümünü bilerek kullanıyorsan bu takma adlar gerçek Python'ı gösterir; o durumda sorun yoktur.</p>

<h2>py başlatıcısı: birden çok sürümün trafik polisi</h2>
<p>python.org yükleyicisi <code>py.exe</code> adlı bir <b>başlatıcı (launcher)</b> kurar. Bu küçük program PATH'e bakmaz; Windows kayıt defterindeki kurulu Python'ları bilir ve istediğin sürümü çalıştırır. PATH karıştığında en güvenilir araç budur.</p>
<div class="tbl-wrap"><table>
<tr><th>Komut</th><th>Ne yapar</th></tr>
<tr><td><code>py</code></td><td>Varsayılan (genelde en yeni) Python'ı açar</td></tr>
<tr><td><code>py -3.12 betik.py</code></td><td>Betiği özellikle 3.12 ile çalıştırır</td></tr>
<tr><td><code>py --list</code> (ya da <code>py -0</code>)</td><td>Kurulu sürümleri listeler; yıldızlı olan varsayılandır</td></tr>
<tr><td><code>py -0p</code></td><td>Sürümleri dosya yollarıyla listeler</td></tr>
<tr><td><code>py -3.12 -m pip install requests</code></td><td>Paketi tam olarak 3.12'ye kurar</td></tr>
<tr><td><code>py -3.12 -m venv .venv</code></td><td>3.12 tabanlı sanal ortam oluşturur</td></tr>
</table></div>
<pre class="out"> -V:3.12 *        Python 3.12 (64-bit)
 -V:3.11          Python 3.11 (64-bit)</pre>
<p><code>py --list</code> çıktısı yukarıdaki gibidir. <code>PY_PYTHON=3.11</code> ortam değişkeniyle varsayılanı değiştirebilirsin.</p>

<h2>PATH nedir, Windows bir komutu nasıl bulur?</h2>
<p><b>PATH</b>, klasör yollarını <b>noktalı virgülle</b> (Windows) ayırarak tutan bir <b>ortam değişkenidir (environment variable)</b>. Terminale <code>python</code> yazdığında Windows önce bulunduğun klasöre, sonra PATH'teki klasörlere <b>soldan sağa</b> bakar ve <code>python.exe</code> (ya da .bat, .cmd) bulduğu <b>ilk</b> klasördekini çalıştırır. Gerisine bakmaz. İki Python kuruluysa hangisinin çalışacağını PATH sırası belirler.</p>
<pre class="code">where python                       # CMD ve PowerShell: tüm eşleşmeleri sırayla gösterir
$env:Path -split ';'               # PowerShell: PATH'i satır satır göster
echo %PATH%                        # CMD: PATH'i tek satırda göster
Get-Command python | Format-List   # PowerShell: çalışacak olanın tam yolu</pre>
<p>PowerShell'de <code>where</code> yerine <code>where.exe</code> yazman gerekebilir; çünkü <code>where</code> orada <code>Where-Object</code> komutunun kısaltmasıdır ve sessizce hiçbir şey yazdırmaz.</p>
<pre class="py">path_metni = r"C:\\Windows\\system32;C:\\Users\\ayse\\AppData\\Local\\Microsoft\\WindowsApps;C:\\Users\\ayse\\AppData\\Local\\Programs\\Python\\Python312\\Scripts;C:\\Users\\ayse\\AppData\\Local\\Programs\\Python\\Python312;;C:\\Program Files\\Git\\cmd"

for sira, klasor in enumerate(path_metni.split(";"), start=1):
    if not klasor:
        print(sira, "(boş girdi)")
        continue
    isaret = "  &lt;-- Python" if "python" in klasor.lower() else ""
    print(sira, klasor + isaret)</pre>
<p>PATH'i kalıcı değiştirmek için Başlat menüsüne "ortam değişkenleri" yaz → <b>Hesabınız için ortam değişkenlerini düzenleyin</b>. Üstte <b>kullanıcı</b> değişkenleri, altta (yönetici gerektiren) <b>sistem</b> değişkenleri vardır. Windows ikisini birleştirir: önce sistem PATH'i, sonra kullanıcı PATH'i. Değişiklikten sonra açık terminaller eski değeri tutar; yeni terminal (bazen VS Code'u tamamen kapatıp açmak) gerekir.</p>
<p><code>where</code> komutunun yaptığını Python ile taklit edelim. Gerçek bilgisayarda dosyalar diskte; burada var olan dosyaları bir küme (set) olarak veriyoruz.</p>
<pre class="py">import ntpath

path_klasorleri = [
    r"C:\\Users\\ayse\\AppData\\Local\\Microsoft\\WindowsApps",
    r"C:\\Python312",
    r"C:\\Python312\\Scripts",
]
diskteki_dosyalar = {
    r"C:\\Users\\ayse\\AppData\\Local\\Microsoft\\WindowsApps\\python.exe",
    r"C:\\Python312\\python.exe",
    r"C:\\Python312\\Scripts\\pip.exe",
}

def where(komut):
    bulunanlar = []
    for klasor in path_klasorleri:
        aday = ntpath.join(klasor, komut + ".exe")
        if aday in diskteki_dosyalar:
            bulunanlar.append(aday)
    return bulunanlar

for komut in ["python", "pip", "git"]:
    sonuc = where(komut)
    print(komut, "-&gt;", sonuc[0] if sonuc else "tanınmıyor")</pre>
<p>Çıktıdaki <code>python</code> satırı Store takma adını gösteriyor: gerçek Python kurulu olduğu hâlde ilk sırada takma ad var. <code>ntpath</code> modülü Windows yol kurallarını her işletim sisteminde uygular; Linux'ta çalışırken bile ters bölüyle yol birleştirebilirsin.</p>

<h2>PowerShell mı CMD mi? Yürütme ilkesi ve venv</h2>
<div class="tbl-wrap"><table>
<tr><th>İş</th><th>PowerShell</th><th>CMD</th></tr>
<tr><td>PATH'i görmek</td><td><code>$env:Path -split ';'</code></td><td><code>echo %PATH%</code></td></tr>
<tr><td>Geçici değişken</td><td><code>$env:PYTHONUTF8 = "1"</code></td><td><code>set PYTHONUTF8=1</code></td></tr>
<tr><td>venv etkinleştirme</td><td><code>.venv\\Scripts\\Activate.ps1</code></td><td><code>.venv\\Scripts\\activate.bat</code></td></tr>
<tr><td>Komutun yeri</td><td><code>Get-Command python</code></td><td><code>where python</code></td></tr>
<tr><td>Ekranı temizle</td><td><code>cls</code> / <code>Clear-Host</code></td><td><code>cls</code></td></tr>
</table></div>
<p>Windows Terminal ve VS Code varsayılan olarak <b>PowerShell</b> açar. Sanal ortamı (ayrıntısı <b>Sanal ortam ve paket yönetimi</b> dersinde) oluşturup etkinleştirdiğinde ilk karşılaşacağın engel şudur:</p>
<pre class="out">.venv\\Scripts\\Activate.ps1 cannot be loaded because running scripts is disabled on this system.</pre>
<p>Bu, PowerShell'in <b>yürütme ilkesi (execution policy)</b> güvenlik ayarıdır; varsayılan "Restricted" hiçbir betiğin çalışmasına izin vermez. Yalnızca kendi kullanıcın için, yönetici gerektirmeden şu ayar yeterlidir:</p>
<pre class="code">Get-ExecutionPolicy -List
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
py -3.12 -m venv .venv
.venv\\Scripts\\Activate.ps1
python -m pip install --upgrade pip</pre>
<p><b>RemoteSigned</b>: kendi yazdığın yerel betikler çalışır, internetten indirilen betikler imza ister. <code>Unrestricted</code> ya da <code>Bypass</code> kullanma; gereğinden geniştir. Etkinleştirme başarılıysa istemin başında <code>(.venv)</code> görürsün; <code>deactivate</code> ile çıkarsın.</p>
<pre class="py">import ntpath, posixpath, sys

def venv_python(proje, windows=True):
    if windows:
        return ntpath.join(proje, ".venv", "Scripts", "python.exe")
    return posixpath.join(proje, ".venv", "bin", "python")

print(venv_python(r"C:\\dev\\anadolu-rapor"))
print(venv_python("/home/ayse/anadolu-rapor", windows=False))
print("Şu an sanal ortamda mıyım?", sys.prefix != sys.base_prefix)</pre>
<div class="note"><b>Neden Scripts?</b>Windows'ta venv içindeki çalıştırılabilir dosyalar <code>Scripts</code> klasörüne, macOS ve Linux'ta <code>bin</code> klasörüne konur. VS Code bu farkı kendisi bilir; ama bir yapılandırma dosyasına elle yol yazarken ya da CI betiğinde bu fark sık hata kaynağıdır.</div>

<h2>winget, birden çok sürüm ve kaldırma</h2>
<pre class="code">winget search Python.Python
winget install Python.Python.3.12
winget install Python.Python.3.13
winget upgrade Python.Python.3.12
winget uninstall Python.Python.3.11</pre>
<p>Birden çok sürüm yan yana sorunsuz yaşar; her biri kendi klasöründedir. Kural basit: <b>projeyi sürüme bağla, PATH'e değil</b>. Her proje kendi venv'ini <code>py -3.12 -m venv .venv</code> ile oluşturur; o venv etkinken <code>python</code> hep doğru sürümdür. PATH'teki "varsayılan" Python yalnızca hızlı denemeler içindir.</p>
<p><b>Kaldırma:</b> Ayarlar → Uygulamalar → "Python 3.11.x" → Kaldır (ya da <code>winget uninstall</code>). Kaldırma sonrası üç artık kalabilir: PATH'teki ölü girdiler (elle sil), <code>%LOCALAPPDATA%\\Programs\\Python</code> altındaki boş klasör ve <code>%LOCALAPPDATA%\\pip\\Cache</code> önbelleği. Ölü PATH girdisi zararsız görünür ama <code>where</code> çıktısını kafa karıştırıcı yapar.</p>

<h2>Belirti → neden → çözüm</h2>
<div class="tbl-wrap"><table>
<tr><th>Belirti</th><th>Neden</th><th>Çözüm</th></tr>
<tr><td><code>'python' is not recognized</code> / "terimi cmdlet olarak tanınmıyor"</td><td>Python klasörü PATH'te yok</td><td>Yükleyiciyi tekrar çalıştır → Modify → "Add to environment variables"; ya da <code>py</code> kullan</td></tr>
<tr><td><code>python</code> yazınca Store açılıyor / "Python was not found"</td><td>WindowsApps takma adı PATH'te önde</td><td>App execution aliases'ta python.exe ve python3.exe'yi kapat</td></tr>
<tr><td><code>'pip' is not recognized</code></td><td><code>Scripts</code> klasörü PATH'te yok</td><td>Her zaman <code>python -m pip</code> ya da <code>py -m pip</code> kullan</td></tr>
<tr><td><code>Activate.ps1 cannot be loaded</code></td><td>PowerShell yürütme ilkesi Restricted</td><td><code>Set-ExecutionPolicy -Scope CurrentUser RemoteSigned</code></td></tr>
<tr><td><code>SSL: CERTIFICATE_VERIFY_FAILED</code> (pip install)</td><td>Kurumsal ağ trafiği kendi sertifikasıyla inceliyor</td><td>BT'den kurum sertifikasını iste: <code>pip config set global.cert C:\\certs\\kurum.pem</code>; <code>--trusted-host</code> yalnız geçici çözüm</td></tr>
<tr><td><code>PermissionError</code> / "Access is denied"</td><td>Program Files'a yöneticisiz paket kurmaya çalışmak ya da dosya başka programda açık</td><td>venv kullan; VS Code ve açık terminalleri kapatıp tekrar dene</td></tr>
<tr><td>Kullanıcı adı "Şükrü" ya da "Ayşe Yılmaz": bazı araçlar yol hatası veriyor</td><td>Türkçe karakter ve boşluk eski araçlarda kodlama/tırnak sorunu yaratır</td><td>Python'ı <code>C:\\Python312</code>'ye, projeleri <code>C:\\dev</code>'e koy; yolları tırnakla yaz</td></tr>
<tr><td>Yanlış sürüm çalışıyor (3.9 bekliyorsun 3.12 geliyor)</td><td>PATH sırası; <code>where python</code>'da ilk satır başka kurulum</td><td>PATH'te sırayı değiştir ya da <code>py -3.12</code> / venv kullan</td></tr>
<tr><td><code>UnicodeEncodeError</code>: Türkçe karakter yazdırırken</td><td>Eski konsol kod sayfası (cp857/cp1254)</td><td>Windows Terminal kullan; <code>PYTHONUTF8=1</code> ortam değişkenini ayarla</td></tr>
<tr><td>Kurdum ama komut hâlâ yok</td><td>Terminal PATH değişmeden önce açılmıştı</td><td>Yeni terminal aç; VS Code'u tamamen kapatıp aç</td></tr>
<tr><td>pip: "No such file or directory" çok uzun yolda</td><td>260 karakter yol sınırı</td><td>Yükleyicideki "Disable path length limit" ya da projeyi kısa yola taşı</td></tr>
</table></div>
<div class="warn"><b>Hata mesajının ilk satırı değil son satırı</b>pip ve Python hatalarında asıl neden genellikle en alttaki satırdadır. Uzun bir kırmızı metin gördüğünde aşağıdan yukarı oku ve son satırı aynen arat.</div>

<div class="note"><b>Gerçek işte</b>Kurumsal bilgisayarlarda çoğu zaman yönetici iznin olmaz, internet bir vekil sunucu (proxy) üzerinden geçer ve trafik kurum sertifikasıyla incelenir. Bu yüzden ekipler kurulum adımlarını README'ye yazar: "python.org 3.12, Install Now, PATH kutusu işaretli; ardından <code>py -3.12 -m venv .venv</code>". Yeni gelen kişi bu listeyi izler, sorun çıkarsa <code>where python</code>, <code>py --list</code> ve <code>python -m pip config list</code> çıktılarını destek kanalına yapıştırır. Bu üç çıktı, sorunların büyük kısmını uzaktan teşhis etmeye yeter.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Sessiz kurulum ve otomasyon</h3>
<p>BT ekipleri yükleyiciyi ekran açmadan çalıştırır. Komut satırı seçenekleri ekrandaki kutuların karşılığıdır:</p>
<pre class="code">python-3.12.4-amd64.exe /quiet InstallAllUsers=0 PrependPath=1 Include_launcher=1 Include_test=0</pre>
<p>Böyle bir komutu Python'da <code>shlex</code> ile parçalara ayırabilirsin. <code>shlex.split</code>, kabuk kurallarını uygular: çift tırnak içindeki boşluklar korunur ve tırnaklar atılır. Tırnak <b>dışındaki</b> ters bölü ise kaçış karakteri sayılıp silinir; Windows yollarını komutlarda tırnakla yazmanın bir nedeni de budur.</p>
<pre class="py">import shlex

komut = 'python-3.12.4-amd64.exe /quiet InstallAllUsers=0 PrependPath=1 TargetDir="C:\\\\Program Files\\\\Python312"'
parcalar = shlex.split(komut)
print(parcalar[0])
for p in parcalar[1:]:
    if "=" in p:
        anahtar, deger = p.split("=", 1)
        print(f"  ayar   {anahtar:16} = {deger}")
    else:
        print(f"  bayrak {p}")

print(shlex.split(r"TargetDir=C:\\Python312"))   # tırnaksız: ters bölü kaybolur!</pre>
<h3>Sanal ortamda olup olmadığını anlamak</h3>
<p><code>sys.prefix</code> çalışan ortamın kökünü, <code>sys.base_prefix</code> o ortamın türetildiği Python kurulumunu gösterir. İkisi farklıysa bir venv içindesin. Her venv'in kökünde <code>pyvenv.cfg</code> dosyası vardır; içindeki <code>home = C:\\Python312</code> satırı ortamın hangi Python'dan oluşturulduğunu söyler. Bu yüzden Python'ı kaldırıp yeniden kurduğunda eski venv'ler bozulur: <code>home</code> artık var olmayan bir yeri gösterir. Çözüm venv'i silip yeniden oluşturmaktır; venv taşınabilir bir şey değildir.</p>
<h3>PYTHONUTF8 ve kodlama</h3>
<p>Python 3.15 ile UTF-8 modu varsayılan olacak; o zamana kadar Windows'ta <code>open()</code> varsayılan olarak sistemin kod sayfasını kullanır. Türkçe veriyle çalışıyorsan her zaman <code>open(yol, encoding="utf-8")</code> yaz ya da <code>PYTHONUTF8=1</code> değişkenini kalıcı olarak ayarla.</p>
</section>
`,
  ex: [
    {
      t: 'mc',
      stage: 'Isınma',
      q: '<code>where python</code> komutu şu iki satırı yazdırıyor:<br><code>C:\\Users\\ayse\\AppData\\Local\\Microsoft\\WindowsApps\\python.exe</code><br><code>C:\\Users\\ayse\\AppData\\Local\\Programs\\Python\\Python312\\python.exe</code><br>Terminale <code>python</code> yazınca ne olur?',
      o: [
        'Gerçek kurulum her zaman takma addan önce geldiği için Python 3.12 açılır',
        'İlk satırdaki Store takma adı çalışır; Store açılır ya da "not found" yazar',
        'Windows iki eşleşmeyi görünce hangisini istediğini soran bir menü açar',
        'Komut belirsiz olduğu için hiçbiri çalışmaz ve terminal hata kodu döner'
      ],
      a: 1,
      why: 'Windows PATH klasörlerini soldan sağa tarar ve bulduğu ilk python.exe dosyasını çalıştırır; where çıktısının sırası bu taramanın sırasıdır. İlk satır WindowsApps takma adı olduğu için Store devreye girer. App execution aliases ayarından takma adı kapatınca ikinci satır ilk sıraya geçer.'
    },
    {
      t: 'mc',
      stage: 'Isınma',
      q: 'VS Code terminalinde <code>.venv\\Scripts\\Activate.ps1</code> çalıştırınca "running scripts is disabled on this system" hatası alıyorsun. Yönetici iznin yok. En doğru çözüm hangisi?',
      o: [
        'Python\'ı kaldırıp Microsoft Store sürümünü kurmak',
        '<code>Set-ExecutionPolicy -Scope CurrentUser RemoteSigned</code> çalıştırmak',
        '<code>Set-ExecutionPolicy Unrestricted</code> ile tüm makineyi serbest bırakmak',
        'venv kullanmayı bırakıp paketleri doğrudan ana Python\'a kurmak'
      ],
      a: 1,
      why: 'Hata PowerShell\'in yürütme ilkesinden gelir, Python\'dan değil. CurrentUser kapsamı yönetici istemez ve RemoteSigned yerel betiklere izin verirken indirilen betiklerden imza ister. Unrestricted gereğinden geniştir (ve makine kapsamı yönetici ister); venv\'den vazgeçmek ise sorunu büyütür.'
    },
    {
      t: 'mc',
      stage: 'Isınma',
      q: 'Bilgisayarında Python 3.11 ve 3.12 kurulu. <code>py -3.11 -m pip install pandas</code> komutu ne yapar?',
      o: [
        'pandas paketini PATH\'te ilk sırada bulunan Python sürümüne kurar',
        'pandas paketini bilgisayardaki tüm Python sürümlerine birden kurar',
        'pandas paketini yalnızca Python 3.11 kurulumuna kurar',
        'py komutu yalnızca betik çalıştırır; pip ile birlikte kullanılamaz'
      ],
      a: 2,
      why: 'py başlatıcısı PATH\'e bakmaz, kayıt defterindeki kurulumlardan istenen sürümü seçer. -m pip o sürümün kendi pip modülünü çalıştırır; böylece paket tam olarak 3.11\'e gider. "pip install" yazmak ise PATH\'te ilk bulunan pip\'e, yani belki de başka bir sürüme kurar.'
    },
    {
      t: 'predict',
      stage: 'Kodu oku',
      q: 'Bu kod ne yazdırır?',
      code: 'path_metni = r"C:\\Windows;C:\\Python312;;C:\\Python312\\Scripts"\nparcalar = path_metni.split(";")\nprint(len(parcalar), parcalar[-1])\n',
      o: ['3 C:\\Python312\\Scripts', '4 C:\\Python312\\Scripts', '4 C:\\Python312', '3 C:\\Python312'],
      a: 1,
      why: 'Art arda iki noktalı virgül arasında boş bir metin vardır; split onu da bir parça sayar. Bu yüzden 4 parça çıkar ve sonuncusu Scripts klasörüdür. Gerçek PATH\'lerde boş girdiler sık görülür; ayrıştırırken atlaman gerekir.'
    },
    {
      t: 'predict',
      stage: 'Kodu oku',
      q: 'Bu kod ne yazdırır? (ntpath, Windows yol kurallarını her işletim sisteminde uygular.)',
      code: 'import ntpath\nyol = ntpath.join("C:\\\\dev\\\\rapor", ".venv", "Scripts", "python.exe")\nprint(yol)\nprint(ntpath.basename(ntpath.dirname(yol)))\n',
      o: ['C:\\dev\\rapor\\.venv\\Scripts\\python.exe\nScripts', 'C:\\dev\\rapor/.venv/Scripts/python.exe\nScripts', 'C:\\dev\\rapor\\.venv\\Scripts\\python.exe\npython.exe', 'C:\\dev\\rapor\\.venv\\bin\\python\nbin'],
      a: 0,
      why: 'ntpath.join parçaları ters bölüyle birleştirir. dirname son parçayı (python.exe) atar ve Scripts klasörüne kadar olan yolu verir; basename o yolun son parçası olan Scripts\'i döndürür. bin yalnızca macOS/Linux venv\'lerinde kullanılır.'
    },
    {
      t: 'predict',
      stage: 'Kodu oku',
      q: 'Ekip arkadaşın en yeni Python\'ı metin karşılaştırmasıyla seçmeye çalışıyor. Bu kod ne yazdırır?',
      code: 'surumler = ["3.9.18", "3.12.4", "3.11.9"]\nprint(max(surumler))\nprint(max(surumler, key=lambda s: tuple(int(p) for p in s.split("."))))\n',
      o: ['3.12.4\n3.12.4', '3.9.18\n3.9.18', '3.9.18\n3.12.4', '3.11.9\n3.12.4'],
      a: 2,
      why: 'Metinler karakter karakter karşılaştırılır: "3.9" ile "3.1" karşılaştırmasında "9" büyük olduğu için "3.9.18" en büyük metin olur. Sayı demetine çevirince (3, 12, 4) &gt; (3, 9, 18) doğru sonucu verir.'
    },
    {
      t: 'order',
      stage: 'Kodu oku',
      q: '<p>Yeni bir Windows bilgisayarında projeyi sıfırdan hazırlayan komut listesini oluşturan betiği sırala. Her komut bir öncekinin sonucuna ihtiyaç duyar: önce Python kurulmalı, sonra kurulduğu doğrulanmalı, sonra sanal ortam oluşturulup etkinleştirilmeli, en son paket kurulmalı.</p>',
      lines: [
        'komutlar = []',
        'komutlar.append("winget install Python.Python.3.12")',
        'komutlar.append("py --list")',
        'komutlar.append("py -3.12 -m venv .venv")',
        'komutlar.append(".venv\\\\Scripts\\\\Activate.ps1")',
        'komutlar.append("python -m pip install requests")',
        'for sira, komut in enumerate(komutlar, start=1):',
        '    print(f"{sira}. {komut}")'
      ],
      expect: '1. winget install Python.Python.3.12\n2. py --list\n3. py -3.12 -m venv .venv\n4. .venv\\Scripts\\Activate.ps1\n5. python -m pip install requests\n',
      hint: 'Var olmayan bir Python ile venv oluşturamazsın; etkin olmayan venv\'e kurulan paket de ana Python\'a gider.',
      why: 'Kurulum → doğrulama → venv oluşturma → etkinleştirme → paket kurma. Etkinleştirmeden önce pip install yazarsan paket global Python\'a kurulur; venv oluşturmadan etkinleştirme dosyası yoktur.'
    },
    {
      t: 'code',
      stage: 'Rehberli',
      id: 'kurulum-windows-1',
      diff: 1,
      q: '<p>Anadolu Bank\'ın rapor betiği en az Python 3.10 istiyor (match ifadesi kullanıyor). <code>surum_kontrol(surum, en_az=(3, 10))</code> fonksiyonunu yaz. <code>surum</code>, <code>(3, 12, 4)</code> gibi üç sayılık bir demettir (sys.version_info[:3] de böyle bir demet verir).</p><ul><li>Sürüm yeterliyse <code>"Uygun: 3.12.4"</code> döndür.</li><li>Yeterli değilse <code>"Eski sürüm: 3.9.18 (en az 3.10 gerekli)"</code> döndür.</li></ul>',
      guide: [
        'Demetteki sayıları noktayla birleştirip "3.12.4" metnini üret (map(str, ...) ve ".".join).',
        'en_az demetini de aynı yolla "3.10" metnine çevir.',
        'Karşılaştırmayı metinlerle değil demetlerle yap: surum &gt;= en_az.',
        'Koşula göre iki mesajdan birini f-string ile döndür.'
      ],
      example: 'import sys\nhedef = (3, 8)\nsimdiki = sys.version_info[:2]\nmetin = ".".join(str(s) for s in simdiki)\nprint(metin, "yeterli" if simdiki >= hedef else "eski")\n',
      start: 'def surum_kontrol(surum, en_az=(3, 10)):\n    # TODO: surum demetini "3.12.4" biçiminde metne çevir\n    surum_metni = ""\n    # TODO: en_az demetini metne çevir\n    en_az_metni = ""\n    # TODO: demetleri karşılaştır ve uygun mesajı döndür\n    return ""\n',
      sol: 'def surum_kontrol(surum, en_az=(3, 10)):\n    surum_metni = ".".join(map(str, surum))\n    en_az_metni = ".".join(map(str, en_az))\n    if tuple(surum) >= tuple(en_az):\n        return f"Uygun: {surum_metni}"\n    return f"Eski sürüm: {surum_metni} (en az {en_az_metni} gerekli)"\n',
      tests: 'import sys\nassert surum_kontrol((3, 12, 4)) == "Uygun: 3.12.4", "3.12.4 en az 3.10 koşulunu sağlar"\nassert surum_kontrol((3, 9, 18)) == "Eski sürüm: 3.9.18 (en az 3.10 gerekli)", "3.9.18 eski sayılmalı; metin karşılaştırması burada yanlış sonuç verir"\nassert surum_kontrol((3, 10, 0)) == "Uygun: 3.10.0", "Sınır değer (tam 3.10) uygundur: >= kullan"\nassert surum_kontrol((3, 11, 2), en_az=(3, 12)) == "Eski sürüm: 3.11.2 (en az 3.12 gerekli)", "en_az parametresine uymalısın"\nassert surum_kontrol(sys.version_info[:3]).startswith("Uygun"), "Çalışan Python 3.10+ olduğundan Uygun dönmeli"\n',
      hints: [
        'Sürüm karşılaştırması için demetler kullan; Python demetleri soldan sağa sayı sayı karşılaştırır.',
        '".".join(map(str, (3, 12, 4))) ifadesi "3.12.4" verir.',
        'if tuple(surum) &gt;= tuple(en_az): return f"Uygun: {surum_metni}"'
      ],
      why: 'Demet karşılaştırması 3.12 ile 3.9\'u doğru sıralar; metin karşılaştırması "3.9" &gt; "3.12" der. sys.version_info da demet gibi davrandığı için aynı fonksiyon gerçek sürümle de çalışır.'
    },
    {
      t: 'code',
      stage: 'Rehberli',
      id: 'kurulum-windows-2',
      diff: 2,
      q: '<p>Destek ekibine gelen PATH metinlerinde Python ile ilgili klasörleri bulan <code>python_klasorleri(path_metni, ayirici)</code> fonksiyonunu yaz. <code>ayirici</code> parametresi Windows\'ta <code>";"</code>, macOS/Linux\'ta <code>":"</code> olur (gerçek kodda <code>os.pathsep</code> verilir).</p><ul><li>Metni ayırıcıyla böl, her parçanın baş/son boşluklarını at.</li><li>Boş parçaları atla.</li><li>İçinde büyük/küçük harf fark etmeksizin <code>python</code> geçenleri, PATH\'teki sırayla, bir liste olarak döndür.</li></ul>',
      guide: [
        'Sonuç için boş bir liste oluştur.',
        'path_metni.split(ayirici) ile parçalar üzerinde dön.',
        'Her parçayı strip() ile temizle; boşsa continue.',
        'parca.lower() içinde "python" geçiyorsa listeye ekle.',
        'Döngüden sonra listeyi döndür.'
      ],
      example: 'satir = "elma, ,Armut,  kiraz "\nmeyveler = []\nfor p in satir.split(","):\n    p = p.strip()\n    if not p:\n        continue\n    if "a" in p.lower():\n        meyveler.append(p)\nprint(meyveler)\n',
      start: 'def python_klasorleri(path_metni, ayirici):\n    sonuc = []\n    # TODO: path_metni\'ni ayirici ile böl ve parçalarda dön\n    # TODO: boşlukları temizle, boş parçayı atla\n    # TODO: "python" geçen parçayı sonuca ekle\n    return sonuc\n',
      sol: 'def python_klasorleri(path_metni, ayirici):\n    sonuc = []\n    for parca in path_metni.split(ayirici):\n        parca = parca.strip()\n        if not parca:\n            continue\n        if "python" in parca.lower():\n            sonuc.append(parca)\n    return sonuc\n',
      tests: 'w = r"C:\\Windows;C:\\Users\\ayse\\AppData\\Local\\Programs\\Python\\Python312\\Scripts\\; ;C:\\Users\\ayse\\AppData\\Local\\Programs\\Python\\Python312\\;;C:\\Program Files\\Git\\cmd"\nkok = r"C:\\Users\\ayse\\AppData\\Local\\Programs\\Python\\Python312"\nassert python_klasorleri(w, ";") == [kok + "\\\\Scripts\\\\", kok + "\\\\"], "Windows PATH\'inde iki Python klasörü PATH sırasıyla dönmeli"\nl = "/usr/local/bin:/usr/bin:/home/ayse/.pyenv/shims:/opt/homebrew/opt/python@3.12/bin"\nassert python_klasorleri(l, ":") == ["/opt/homebrew/opt/python@3.12/bin"], "Linux/macOS metninde ayırıcı \':\' olmalı; .pyenv içinde \'python\' geçmez"\nassert python_klasorleri("", ";") == [], "Boş PATH boş liste döndürmeli"\nassert python_klasorleri("C:\\\\PYTHON39", ";") == ["C:\\\\PYTHON39"], "Büyük/küçük harf fark etmemeli: lower() kullan"\n',
      hints: ['Ayırıcıyı sabit yazma; parametreden gelen ayirici\'yi kullan.', 'for parca in path_metni.split(ayirici): ve içinde parca = parca.strip()', 'if "python" in parca.lower(): sonuc.append(parca)'],
      why: 'Ayırıcıyı parametre yapmak aynı fonksiyonun her işletim sisteminde çalışmasını sağlar; gerçek kodda os.pathsep verilir. strip ve boş parça kontrolü, elle düzenlenmiş PATH\'lerdeki boşlukları ve çift ayırıcıları tolere eder.'
    },
    {
      t: 'code',
      stage: 'Rehberli',
      id: 'kurulum-windows-3',
      diff: 2,
      q: '<p><code>where</code> komutunu taklit eden <code>where_simule(klasorler, diskteki, komut)</code> fonksiyonunu yaz.</p><ul><li><code>klasorler</code>: PATH klasörlerinin sıralı listesi.</li><li><code>diskteki</code>: diskte var olan dosyaların tam yollarını içeren küme.</li><li>Her klasör için <code>ntpath.join(klasor, komut + ".exe")</code> adayını oluştur; kümede varsa sonuca ekle.</li><li>Bulunan tam yolların listesini PATH sırasıyla döndür (bulunamazsa boş liste).</li></ul>',
      guide: ['ntpath modülünü içe aktar.', 'Boş bir bulunanlar listesi oluştur.', 'klasorler listesinde sırayla dön ve aday yolu ntpath.join ile kur.', 'aday in diskteki ise listeye ekle; sonunda listeyi döndür.'],
      example: 'import posixpath\nraflar = ["/depo/a", "/depo/b"]\nvar = {"/depo/b/vida.txt"}\nfor r in raflar:\n    aday = posixpath.join(r, "vida" + ".txt")\n    print(aday, aday in var)\n',
      start: 'import ntpath\n\ndef where_simule(klasorler, diskteki, komut):\n    bulunanlar = []\n    # TODO: her klasör için komut + ".exe" adayını oluştur\n    # TODO: aday diskte varsa bulunanlar\'a ekle\n    return bulunanlar\n',
      sol: 'import ntpath\n\ndef where_simule(klasorler, diskteki, komut):\n    bulunanlar = []\n    for klasor in klasorler:\n        aday = ntpath.join(klasor, komut + ".exe")\n        if aday in diskteki:\n            bulunanlar.append(aday)\n    return bulunanlar\n',
      tests: 'k = [r"C:\\Users\\ayse\\AppData\\Local\\Microsoft\\WindowsApps", r"C:\\Python311", r"C:\\Python312", r"C:\\Python312\\Scripts"]\nd = {r"C:\\Users\\ayse\\AppData\\Local\\Microsoft\\WindowsApps\\python.exe", r"C:\\Python311\\python.exe", r"C:\\Python312\\python.exe", r"C:\\Python312\\Scripts\\pip.exe"}\nassert where_simule(k, d, "python") == [r"C:\\Users\\ayse\\AppData\\Local\\Microsoft\\WindowsApps\\python.exe", r"C:\\Python311\\python.exe", r"C:\\Python312\\python.exe"], "Üç python.exe PATH sırasıyla bulunmalı; ilk satır çalışacak olandır"\nassert where_simule(k, d, "pip") == [r"C:\\Python312\\Scripts\\pip.exe"], "pip yalnızca Scripts klasöründe"\nassert where_simule(k, d, "git") == [], "Bulunamayan komut için boş liste dönmeli (where \'INFO: Could not find\' der)"\nassert where_simule(["C:\\\\Python312\\\\"], d, "python") == [r"C:\\Python312\\python.exe"], "Sonda ters bölü olan klasörde ntpath.join çift ters bölü üretmez"\n',
      hints: ['ntpath.join, Windows yollarını Linux\'ta bile doğru birleştirir.', 'aday = ntpath.join(klasor, komut + ".exe")', 'if aday in diskteki: bulunanlar.append(aday)'],
      why: 'Windows komutu ararken tam olarak bunu yapar: PATH klasörlerini sırayla dener. where hepsini listeler, ama çalışan her zaman ilk eşleşmedir; bu yüzden takma ad ya da eski bir kurulum öndeyse yanlış Python çalışır.'
    },
    {
      t: 'code',
      stage: 'Kendin yaz',
      id: 'kurulum-windows-4',
      diff: 1,
      q: '<p><code>venv_python_yolu(proje, isletim)</code> fonksiyonunu yaz. <code>isletim</code> <code>"windows"</code>, <code>"macos"</code> ya da <code>"linux"</code> olabilir (büyük/küçük harf duyarsız). Proje kökündeki <code>.venv</code> ortamının Python yolunu döndür:</p><ul><li>Windows: <code>ntpath.join(proje, ".venv", "Scripts", "python.exe")</code></li><li>macOS/Linux: <code>posixpath.join(proje, ".venv", "bin", "python")</code></li><li>Başka bir değerde <code>ValueError</code> fırlat.</li></ul>',
      start: 'def venv_python_yolu(proje, isletim):\n    pass\n',
      sol: 'import ntpath, posixpath\n\ndef venv_python_yolu(proje, isletim):\n    isletim = isletim.lower()\n    if isletim == "windows":\n        return ntpath.join(proje, ".venv", "Scripts", "python.exe")\n    if isletim in ("macos", "linux"):\n        return posixpath.join(proje, ".venv", "bin", "python")\n    raise ValueError(f"Bilinmeyen işletim sistemi: {isletim}")\n',
      tests: 'assert venv_python_yolu(r"C:\\dev\\rapor", "windows") == r"C:\\dev\\rapor\\.venv\\Scripts\\python.exe", "Windows\'ta Scripts klasörü ve python.exe"\nassert venv_python_yolu("/home/ayse/rapor", "linux") == "/home/ayse/rapor/.venv/bin/python", "Linux\'ta bin/python"\nassert venv_python_yolu("/Users/ayse/rapor", "macOS") == "/Users/ayse/rapor/.venv/bin/python", "macOS da bin kullanır; büyük/küçük harf duyarsız olmalı"\ntry:\n    venv_python_yolu("x", "amiga")\n    assert False, "Bilinmeyen sistemde ValueError fırlatmalısın"\nexcept ValueError:\n    pass\n',
      hints: ['ntpath ve posixpath modüllerini içe aktar.', 'isletim.lower() ile karşılaştır; macos ve linux aynı kalıbı kullanır.'],
      why: 'Windows ve POSIX venv düzenleri farklıdır (Scripts/python.exe ve bin/python). İki yol modülünü açıkça kullanmak, kodun hangi sistemde çalıştığından bağımsız doğru sonuç verir.'
    },
    {
      t: 'code',
      stage: 'Kendin yaz',
      id: 'kurulum-windows-5',
      diff: 2,
      q: '<p><code>python --version</code> çıktısını ayrıştıran <code>surum_ayristir(cikti)</code> fonksiyonunu yaz. Çıktı <code>"Python 3.12.4"</code> gibidir; sonunda boşluk/satır sonu olabilir, ön sürümlerde <code>"Python 3.13.0rc1"</code> gibi ekler bulunabilir.</p><ul><li><code>(3, 12, 4)</code> gibi üç tam sayılık demet döndür (ekleri yok say: 3.13.0rc1 → (3, 13, 0)).</li><li>Metin <code>Python</code> ile başlamıyorsa (ör. Store takma adının "Python was not found" mesajı) <code>None</code> döndür.</li></ul>',
      start: 'import re\n\ndef surum_ayristir(cikti):\n    pass\n',
      sol: 'import re\n\ndef surum_ayristir(cikti):\n    eslesme = re.match(r"Python (\\d+)\\.(\\d+)\\.(\\d+)", cikti.strip())\n    if not eslesme:\n        return None\n    return tuple(int(p) for p in eslesme.groups())\n',
      tests: 'assert surum_ayristir("Python 3.12.4") == (3, 12, 4), "Temel durum: (3, 12, 4)"\nassert surum_ayristir("Python 3.9.18\\r\\n") == (3, 9, 18), "Windows satır sonu (\\\\r\\\\n) temizlenmeli"\nassert surum_ayristir("Python 3.13.0rc1") == (3, 13, 0), "Ön sürüm eki yok sayılmalı"\nassert surum_ayristir("Python was not found; run without arguments to install from the Microsoft Store") is None, "Store takma adı mesajı sürüm değildir: None"\nassert surum_ayristir("") is None, "Boş çıktı None"\nassert all(isinstance(x, int) for x in surum_ayristir("Python 3.11.9")), "Parçalar int olmalı"\n',
      hints: ['Düzenli ifade (regex) ile üç sayı grubunu yakala: (\\d+)\\.(\\d+)\\.(\\d+)', 're.match eşleşmezse None döner; groups() metin verir, int\'e çevir.'],
      why: 'Komut çıktısı insan için yazılmıştır; programda kullanmadan önce sağlam biçimde ayrıştırmak gerekir. re.match yalnızca baştan eşleştirdiği için "Python was not found" metni sayı içermese bile güvenle reddedilir.'
    },
    {
      t: 'code',
      stage: 'Kendin yaz',
      id: 'kurulum-windows-6',
      diff: 2,
      q: '<p><code>py --list</code> çıktısını ayrıştıran <code>py_list_ayristir(cikti)</code> fonksiyonunu yaz. Örnek çıktı:</p><pre> -V:3.12 *        Python 3.12 (64-bit)\n -V:3.11          Python 3.11 (64-bit)\n -V:3.9           Python 3.9 (64-bit)</pre><p>Sözlük döndür: <code>{"surumler": ["3.12", "3.11", "3.9"], "varsayilan": "3.12"}</code>. Sürümler çıktıdaki sırayla gelsin. Yıldız yoksa varsayılan <code>None</code> olsun. <code>-V:</code> ile başlamayan satırları atla.</p>',
      start: 'def py_list_ayristir(cikti):\n    pass\n',
      sol: 'def py_list_ayristir(cikti):\n    surumler = []\n    varsayilan = None\n    for satir in cikti.splitlines():\n        parcalar = satir.split()\n        if not parcalar or not parcalar[0].startswith("-V:"):\n            continue\n        surum = parcalar[0][3:]\n        surumler.append(surum)\n        if len(parcalar) > 1 and parcalar[1] == "*":\n            varsayilan = surum\n    return {"surumler": surumler, "varsayilan": varsayilan}\n',
      tests: 'c = " -V:3.12 *        Python 3.12 (64-bit)\\n -V:3.11          Python 3.11 (64-bit)\\n -V:3.9           Python 3.9 (64-bit)\\n"\nassert py_list_ayristir(c) == {"surumler": ["3.12", "3.11", "3.9"], "varsayilan": "3.12"}, "Üç sürüm ve yıldızlı varsayılan"\nc2 = "Installed Pythons found by py Launcher for Windows\\n -V:3.13          Python 3.13 (64-bit)\\n -V:3.12 *        Python 3.12 (64-bit)\\n"\nassert py_list_ayristir(c2) == {"surumler": ["3.13", "3.12"], "varsayilan": "3.12"}, "Başlık satırı atlanmalı; yıldız ikinci satırda olabilir"\nassert py_list_ayristir(" -V:3.12          Python 3.12 (64-bit)") == {"surumler": ["3.12"], "varsayilan": None}, "Yıldız yoksa varsayılan None"\nassert py_list_ayristir("") == {"surumler": [], "varsayilan": None}, "Boş çıktı"\n',
      hints: ['splitlines() ile satırlara, split() ile kelimelere ayır.', 'İlk kelime "-V:3.12" ise [3:] dilimi "3.12" verir; ikinci kelime "*" ise varsayılandır.'],
      why: 'split() argümansız çağrılınca birden çok boşluğu tek ayırıcı sayar; hizalama için konmuş boşluklar sorun olmaz. Başlık satırları -V: ile başlamadığı için kolayca elenir.'
    },
    {
      t: 'code',
      stage: 'Kendin yaz',
      id: 'kurulum-windows-7',
      diff: 2,
      q: '<p>BT ekibinin sessiz kurulum komutunu inceleyen <code>kurulum_komutu_ayristir(komut)</code> fonksiyonunu yaz. Örnek:</p><pre>python-3.12.4-amd64.exe /quiet InstallAllUsers=0 PrependPath=1 TargetDir="C:\\Python 312"</pre><p><code>shlex.split(komut)</code> ile parçala: çift tırnak içindeki boşluklu değer tek parça kalır, tırnaklar atılır ve tırnak içindeki ters bölü korunur. Sözlük döndür:</p><ul><li><code>"dosya"</code>: ilk parça.</li><li><code>"bayraklar"</code>: <code>/</code> ile başlayan parçaların listesi.</li><li><code>"ayarlar"</code>: <code>ANAHTAR=DEGER</code> parçalarından sözlük (yalnız ilk <code>=</code> işaretinden böl).</li></ul>',
      start: 'import shlex\n\ndef kurulum_komutu_ayristir(komut):\n    pass\n',
      sol: 'import shlex\n\ndef kurulum_komutu_ayristir(komut):\n    parcalar = shlex.split(komut)\n    sonuc = {"dosya": parcalar[0], "bayraklar": [], "ayarlar": {}}\n    for p in parcalar[1:]:\n        if p.startswith("/"):\n            sonuc["bayraklar"].append(p)\n        elif "=" in p:\n            anahtar, deger = p.split("=", 1)\n            sonuc["ayarlar"][anahtar] = deger\n    return sonuc\n',
      tests: 'k = \'python-3.12.4-amd64.exe /quiet InstallAllUsers=0 PrependPath=1 TargetDir="C:\\\\Python 312"\'\nr = kurulum_komutu_ayristir(k)\nassert r["dosya"] == "python-3.12.4-amd64.exe", "İlk parça yükleyici dosyası"\nassert r["bayraklar"] == ["/quiet"], "/ ile başlayanlar bayraktır"\nassert r["ayarlar"] == {"InstallAllUsers": "0", "PrependPath": "1", "TargetDir": "C:\\\\Python 312"}, "Tırnaklı değer boşluğuyla tek parça kalmalı; shlex tırnakları atar, tırnak içindeki ters bölüyü korur"\nr2 = kurulum_komutu_ayristir("python-3.13.0-amd64.exe /passive /log kurulum.log Include_test=0 X=a=b")\nassert r2["bayraklar"] == ["/passive", "/log"] and r2["ayarlar"] == {"Include_test": "0", "X": "a=b"}, "Birden çok bayrak; = içermeyen düz parça (kurulum.log) yok sayılır; yalnız ilk = işaretinden böl"\n',
      hints: ['shlex.split tırnaklı değeri tek parça yapar: TargetDir="C:\\Python 312" → TargetDir=C:\\Python 312.', 'p.startswith("/") bayraktır; değilse "=" in p kontrolü ve p.split("=", 1).'],
      why: 'Basit str.split() tırnak içindeki boşlukta bölünürdü. shlex kabuk kurallarına göre ayırır. Dikkat: POSIX modunda tırnak DIŞINDAKİ ters bölü kaçış sayılıp silinir; Windows yollarını komutlarda her zaman tırnakla yazmak bu yüzden iyi alışkanlıktır.'
    },
    {
      t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      id: 'kurulum-windows-8',
      diff: 2,
      q: '<p>Hatayı bul ve düzelt. <code>scripts_eksik_mi(path_metni, ayirici)</code> fonksiyonu PATH\'te bir Python klasörü olup da yanındaki <code>Scripts</code> klasörü olmadığında <code>True</code> döndürmeli (pip tanınmıyor hatasının nedeni budur). Karşılaştırma büyük/küçük harf duyarsız olmalı ve sondaki ters bölü fark yaratmamalı. Kod Windows yollarında yanlış sonuç veriyor.</p>',
      start: 'def scripts_eksik_mi(path_metni, ayirici):\n    klasorler = [k for k in path_metni.split(":") if k]\n    python_kokleri = [k for k in klasorler if k.lower().endswith("python312")]\n    for kok in python_kokleri:\n        if kok + "\\\\Scripts" not in klasorler:\n            return True\n    return False\n',
      sol: 'def scripts_eksik_mi(path_metni, ayirici):\n    klasorler = [k.strip().rstrip("\\\\").lower() for k in path_metni.split(ayirici) if k.strip()]\n    python_kokleri = [k for k in klasorler if k.rsplit("\\\\", 1)[-1].startswith("python")]\n    for kok in python_kokleri:\n        if kok + "\\\\scripts" not in klasorler:\n            return True\n    return False\n',
      tests: 'a = r"C:\\Windows;C:\\Python312\\;C:\\Python312\\Scripts" + "\\\\"\nassert scripts_eksik_mi(a, ";") is False, "Sonda ters bölü olsa da Scripts mevcut: False"\nb = r"C:\\Windows;C:\\Users\\ayse\\AppData\\Local\\Programs\\Python\\Python311"\nassert scripts_eksik_mi(b, ";") is True, "Python311 var ama Scripts yok: True (sürümü sabit yazma)"\nc = r"c:\\python312;C:\\PYTHON312\\SCRIPTS"\nassert scripts_eksik_mi(c, ";") is False, "Windows yolları büyük/küçük harf duyarsızdır"\nassert scripts_eksik_mi(r"C:\\Windows;C:\\Program Files\\Git\\cmd", ";") is False, "Python klasörü yoksa eksik de yoktur"\n',
      hints: [
        'Üç sorun var: ayırıcı sabit ":" yazılmış (C: sürücü harfini böler), sürüm "python312" sabit, harf ve sondaki ters bölü normalleştirilmemiş.',
        'Her klasörü strip().rstrip("\\\\").lower() ile normalleştir; kök klasörü son parçası "python" ile başlayan klasör olarak tanı.'
      ],
      why: 'Windows yollarında ":" sürücü harfinin parçasıdır; PATH ayırıcısı ";"dir ve bu yüzden parametre olarak alınmalıdır. Windows yolları büyük/küçük harf duyarsızdır ve elle eklenen girdilerde sondaki ters bölü sık görülür; karşılaştırmadan önce normalleştirmek gerekir.'
    },
    {
      t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      id: 'kurulum-windows-9',
      diff: 2,
      q: '<p>Hatayı bul ve düzelt. <code>en_yeni_surum(surumler)</code> kurulu sürüm metinleri listesinden en yenisini döndürmeli; liste boşsa <code>None</code>. Kod 3.9 ile 3.12 arasında yanlış seçim yapıyor ve boş listede çöküyor.</p>',
      start: 'def en_yeni_surum(surumler):\n    en_yeni = surumler[0]\n    for s in surumler:\n        if s > en_yeni:\n            en_yeni = s\n    return en_yeni\n',
      sol: 'def en_yeni_surum(surumler):\n    if not surumler:\n        return None\n    return max(surumler, key=lambda s: tuple(int(p) for p in s.split(".")))\n',
      tests: 'assert en_yeni_surum(["3.9.18", "3.12.4", "3.11.9"]) == "3.12.4", "3.12.4 en yenisi; metin karşılaştırması 3.9\'u seçer"\nassert en_yeni_surum(["3.10", "3.9"]) == "3.10", "3.10 > 3.9 (sayı olarak)"\nassert en_yeni_surum(["3.12.10", "3.12.9"]) == "3.12.10", "Yama numarası da sayı olarak karşılaştırılmalı"\nassert en_yeni_surum([]) is None, "Boş listede None dönmeli, IndexError değil"\n',
      hints: ['"3.9" &gt; "3.12" metin olarak True\'dur; parçaları int\'e çevirip demet karşılaştır.', 'max(..., key=lambda s: tuple(int(p) for p in s.split("."))) ve önce boş liste kontrolü.'],
      why: 'Sürüm numaraları metin değil sayı dizisidir. Demet anahtarı ile max hem 3.10/3.9 hem 3.12.10/3.12.9 durumlarını doğru çözer. Boş liste kontrolü olmadan surumler[0] IndexError verir.'
    },
    {
      t: 'code',
      stage: 'Meydan okuma',
      id: 'kurulum-windows-10',
      diff: 3,
      q: '<p>Destek ekibi için <code>path_teshis(path_metni, ayirici, diskteki)</code> fonksiyonunu yaz. <code>diskteki</code>, var olan dosyaların tam yollarını içeren kümedir. Sözlük döndür:</p><ul><li><code>"calisan"</code>: PATH sırasına göre ilk bulunan <code>python.exe</code> tam yolu (yoksa <code>None</code>).</li><li><code>"store_tuzagi"</code>: çalışan yol <code>\\WindowsApps\\</code> içeriyorsa <code>True</code> (harf duyarsız).</li><li><code>"pip_var"</code>: herhangi bir klasörde <code>pip.exe</code> varsa <code>True</code>.</li><li><code>"bos_girdi"</code>: boş (ya da yalnız boşluk) girdi sayısı.</li><li><code>"tekrarlar"</code>: birden çok kez geçen klasörler; harf duyarsız ve sondaki ters bölü yok sayılarak karşılaştır; ilk görüldüğü biçimiyle (sondaki ters bölü atılmış), tekrarın fark edildiği sırayla listele.</li></ul><p>Diskteki dosya yollarını da harf duyarsız karşılaştır.</p>',
      start: 'import ntpath\n\ndef path_teshis(path_metni, ayirici, diskteki):\n    pass\n',
      sol: 'import ntpath\n\ndef path_teshis(path_metni, ayirici, diskteki):\n    disk = {d.lower() for d in diskteki}\n    sonuc = {"calisan": None, "store_tuzagi": False, "pip_var": False, "bos_girdi": 0, "tekrarlar": []}\n    gorulen = {}\n    for ham in path_metni.split(ayirici):\n        klasor = ham.strip().rstrip("\\\\")\n        if not klasor:\n            sonuc["bos_girdi"] += 1\n            continue\n        anahtar = klasor.lower()\n        if anahtar in gorulen:\n            if gorulen[anahtar] not in sonuc["tekrarlar"]:\n                sonuc["tekrarlar"].append(gorulen[anahtar])\n            continue\n        gorulen[anahtar] = klasor\n        py = ntpath.join(klasor, "python.exe")\n        if sonuc["calisan"] is None and py.lower() in disk:\n            sonuc["calisan"] = py\n        if ntpath.join(klasor, "pip.exe").lower() in disk:\n            sonuc["pip_var"] = True\n    if sonuc["calisan"]:\n        sonuc["store_tuzagi"] = "\\\\windowsapps\\\\" in sonuc["calisan"].lower()\n    return sonuc\n',
      tests: 'p = r"C:\\Windows;C:\\Users\\ayse\\AppData\\Local\\Microsoft\\WindowsApps;;C:\\Python312\\; ;c:\\python312;C:\\Python312\\Scripts;C:\\WINDOWS" + "\\\\"\nd = {r"C:\\Users\\ayse\\AppData\\Local\\Microsoft\\WindowsApps\\python.exe", r"C:\\Python312\\python.exe", r"C:\\Python312\\Scripts\\pip.exe"}\nr = path_teshis(p, ";", d)\nassert r["calisan"] == r"C:\\Users\\ayse\\AppData\\Local\\Microsoft\\WindowsApps\\python.exe", "İlk eşleşme WindowsApps takma adı"\nassert r["store_tuzagi"] is True, "Çalışan yol WindowsApps içinde: Store tuzağı"\nassert r["pip_var"] is True, "Scripts klasöründe pip.exe var"\nassert r["bos_girdi"] == 2, "Bir boş ve bir yalnız boşluk girdi var: 2"\nassert r["tekrarlar"] == [r"C:\\Python312", r"C:\\Windows"], "c:\\\\python312 ve C:\\\\WINDOWS\\\\ tekrar sayılır; ilk görülen biçimle, fark edilme sırasıyla"\nr2 = path_teshis(r"C:\\Python312;C:\\Tools", ";", {r"c:\\python312\\PYTHON.EXE"})\nassert r2 == {"calisan": r"C:\\Python312\\python.exe", "store_tuzagi": False, "pip_var": False, "bos_girdi": 0, "tekrarlar": []}, "Disk karşılaştırması harf duyarsız; Store tuzağı yok"\nassert path_teshis("", ";", set())["calisan"] is None, "Boş PATH: çalışan yok"\n',
      hints: [
        'Her girdiyi strip().rstrip("\\\\") ile normalleştir; karşılaştırma anahtarı için lower() kullan.',
        'Görülen klasörleri {anahtar: ilk_biçim} sözlüğünde tut; tekrar edince ilk biçimi tekrarlar listesine (bir kez) ekle.',
        'Diski de lower() ile bir kümeye çevir; calisan yalnızca ilk eşleşmede atanır.'
      ],
      why: 'Gerçek PATH\'ler yıllar içinde elle düzenlenir: boş girdiler, tekrarlar ve farklı yazımlar birikir. Windows dosya sistemi harf duyarsız olduğundan tüm karşılaştırmalar normalleştirilmiş anahtarla yapılır; ama kullanıcıya gösterilen değer ilk görülen biçimdir.'
    },
    {
      t: 'code',
      stage: 'Mini proje',
      id: 'kurulum-windows-11',
      diff: 3,
      q: '<p>Anadolu Market destek kanalına gelen kurulum hatalarını sınıflandıran küçük bir araç yaz.</p><p><b>1)</b> <code>teshis(mesaj)</code>: hata metnine bakıp bir kod döndürsün (harf duyarsız, kontroller bu sırayla):</p><ul><li><code>"running scripts is disabled"</code> geçiyorsa → <code>"YURUTME_ILKESI"</code></li><li><code>"certificate_verify_failed"</code> → <code>"SSL"</code></li><li><code>"python was not found"</code> → <code>"STORE_TAKMA_AD"</code></li><li><code>"\'pip\' is not recognized"</code> → <code>"PIP_PATH"</code></li><li><code>"is not recognized"</code> ya da <code>"tanınmıyor"</code> → <code>"PATH"</code></li><li><code>"access is denied"</code> ya da <code>"permissionerror"</code> → <code>"IZIN"</code></li><li><code>"unicodeencodeerror"</code> → <code>"KODLAMA"</code></li><li>hiçbiri → <code>"BILINMIYOR"</code></li></ul><p><b>2)</b> <code>cozum(kod)</code>: koda karşılık kısa çözüm metni döndürsün; en az şu eşlemeler olsun: <code>"YURUTME_ILKESI"</code> için metin <code>Set-ExecutionPolicy</code> içermeli, <code>"PIP_PATH"</code> için <code>python -m pip</code>, <code>"STORE_TAKMA_AD"</code> için <code>App execution aliases</code>. Bilinmeyen kod için <code>"Hata metninin son satırını arat."</code></p><p><b>3)</b> <code>rapor(mesajlar)</code>: kod → adet sözlüğü döndürsün; en sık kod önce, eşitlikte koda göre alfabetik.</p>',
      start: 'def teshis(mesaj):\n    pass\n\n\ndef cozum(kod):\n    pass\n\n\ndef rapor(mesajlar):\n    pass\n',
      sol: 'KURALLAR = [\n    (("running scripts is disabled",), "YURUTME_ILKESI"),\n    (("certificate_verify_failed",), "SSL"),\n    (("python was not found",), "STORE_TAKMA_AD"),\n    (("\'pip\' is not recognized",), "PIP_PATH"),\n    (("is not recognized", "tanınmıyor"), "PATH"),\n    (("access is denied", "permissionerror"), "IZIN"),\n    (("unicodeencodeerror",), "KODLAMA"),\n]\n\nCOZUMLER = {\n    "YURUTME_ILKESI": "Set-ExecutionPolicy -Scope CurrentUser RemoteSigned çalıştır.",\n    "SSL": "Kurum sertifikasını pip config set global.cert ile tanıt.",\n    "STORE_TAKMA_AD": "App execution aliases ekranında python.exe takma adını kapat.",\n    "PIP_PATH": "pip yerine python -m pip kullan.",\n    "PATH": "Yükleyiciyi Modify ile çalıştırıp PATH\'e ekle ya da py kullan.",\n    "IZIN": "venv kullan, açık programları kapatıp tekrar dene.",\n    "KODLAMA": "PYTHONUTF8=1 ayarla, Windows Terminal kullan.",\n}\n\n\ndef teshis(mesaj):\n    kucuk = mesaj.lower()\n    for anahtarlar, kod in KURALLAR:\n        if any(a in kucuk for a in anahtarlar):\n            return kod\n    return "BILINMIYOR"\n\n\ndef cozum(kod):\n    return COZUMLER.get(kod, "Hata metninin son satırını arat.")\n\n\ndef rapor(mesajlar):\n    sayac = {}\n    for m in mesajlar:\n        k = teshis(m)\n        sayac[k] = sayac.get(k, 0) + 1\n    return dict(sorted(sayac.items(), key=lambda kv: (-kv[1], kv[0])))\n',
      tests: 'assert teshis("File .venv\\\\Scripts\\\\Activate.ps1 cannot be loaded because running scripts is disabled on this system.") == "YURUTME_ILKESI", "Yürütme ilkesi"\nassert teshis("SSL: CERTIFICATE_VERIFY_FAILED certificate verify failed") == "SSL", "SSL hatası (harf duyarsız)"\nassert teshis("Python was not found; run without arguments to install from the Microsoft Store") == "STORE_TAKMA_AD", "Store takma adı"\nassert teshis("\'pip\' is not recognized as an internal or external command") == "PIP_PATH", "pip kontrolü genel PATH kontrolünden ÖNCE yapılmalı"\nassert teshis("\'python\' is not recognized as an internal or external command") == "PATH", "python tanınmıyor: PATH"\nassert teshis("python : \'python\' terimi bir cmdlet adı olarak tanınmıyor") == "PATH", "Türkçe PowerShell mesajı"\nassert teshis("ERROR: [WinError 5] Access is denied") == "IZIN", "Erişim reddedildi"\nassert teshis("UnicodeEncodeError: \'charmap\' codec can\'t encode") == "KODLAMA", "Kodlama"\nassert teshis("Segmentation fault") == "BILINMIYOR", "Bilinmeyen"\nassert "Set-ExecutionPolicy" in cozum("YURUTME_ILKESI"), "Yürütme ilkesi çözümü Set-ExecutionPolicy içermeli"\nassert "python -m pip" in cozum("PIP_PATH"), "pip çözümü python -m pip içermeli"\nassert "App execution aliases" in cozum("STORE_TAKMA_AD"), "Store çözümü"\nassert cozum("XYZ") == "Hata metninin son satırını arat.", "Bilinmeyen kod"\nr = rapor(["\'pip\' is not recognized", "Access is denied", "\'pip\' is not recognized", "bilinmeyen", "PermissionError: [Errno 13]"])\nassert r == {"IZIN": 2, "PIP_PATH": 2, "BILINMIYOR": 1}, "Adet çoktan aza, eşitlikte alfabetik: IZIN, PIP_PATH, BILINMIYOR"\nassert list(r) == ["IZIN", "PIP_PATH", "BILINMIYOR"], "Sözlük sırası da önemli"\n',
      hints: [
        'Kuralları (anahtar_kelimeler, kod) çiftlerinden oluşan bir listede tut ve sırayla dene; ilk eşleşen kazanır.',
        'pip kuralı genel "is not recognized" kuralından önce gelmeli, yoksa pip hatası PATH sayılır.',
        'sorted(sayac.items(), key=lambda kv: (-kv[1], kv[0])) çoktan aza, eşitlikte alfabetik sıralar.'
      ],
      why: 'Kural tablosunu veri olarak tutmak, yeni bir hata türü eklemeyi tek satıra indirir ve sıralamanın önemini görünür kılar: özel kural (pip) genel kuraldan (is not recognized) önce gelmelidir. Bu yapı derste gördüğün belirti → neden → çözüm tablosunun koda dökülmüş hâlidir.'
    }
  ],
  faq: [
    {
      q: 'Install Now mı Customize installation mı seçmeliyim?',
      a: 'Kendi bilgisayarında ve kullanıcı adın İngilizce karakterliyse Install Now (PATH kutusu işaretli) yeterlidir. Kullanıcı adında Türkçe karakter ya da boşluk varsa Customize ile C:\\Python312 gibi kısa bir yol seç.'
    },
    {
      q: 'Store sürümü kötü mü?',
      a: 'Kötü değil; yönetici izni gerektirmez ve otomatik güncellenir. Ama py başlatıcısı gelmez ve bazı klasörlere yazma kısıtlıdır. Kurumsal projelerde python.org sürümü daha öngörülebilirdir.'
    },
    {
      q: 'PATH\'e Python\'ı eklemezsem ne kaybederim?',
      a: 'python ve pip komutlarını doğrudan yazamazsın; ama py başlatıcısı PATH\'ten bağımsız çalıştığı için py ve py -m pip ile her şeyi yapabilirsin. Venv etkinken de PATH sorunu yaşamazsın.'
    },
    {
      q: 'Python\'ı güncellemek için eskisini kaldırmam gerekir mi?',
      a: 'Aynı alt sürüm içinde (3.12.3 → 3.12.4) yükleyici üzerine kurar. Yeni alt sürüm (3.12 → 3.13) yan yana kurulur; eski projelerin venv\'leri eski sürüme bağlı kalır. Eskisini ancak hiçbir proje kullanmıyorsa kaldır.'
    },
    {
      q: 'WSL kullanmalı mıyım?',
      a: 'Linux sunuculara dağıtım yapan ekiplerde WSL (Windows Subsystem for Linux) iyi bir seçenektir; içinde Ubuntu çalışır ve macOS/Linux dersindeki adımlar geçerli olur. Yalnızca öğrenmek için Windows\'a doğrudan kurmak yeterlidir.'
    }
  ],
  mistakes: [
    {
      bad: 'pip install pandas',
      good: 'python -m pip install pandas\n# ya da belirli sürüm için\npy -3.12 -m pip install pandas',
      why: 'Tek başına pip, PATH\'te ilk bulunan pip\'tir ve başka bir Python\'a ait olabilir. python -m pip paketi tam olarak o yorumlayıcıya kurar.'
    },
    {
      bad: 'if platform.python_version() >= "3.10":\n    print("uygun")',
      good: 'import sys\nif sys.version_info >= (3, 10):\n    print("uygun")',
      why: 'Metin karşılaştırmasında "3.9" büyük çıkar. sys.version_info demet olarak sayı sayı karşılaştırılır.'
    },
    {
      bad: 'klasorler = path_metni.split(":")',
      good: 'import os\nklasorler = [k for k in path_metni.split(os.pathsep) if k]',
      why: 'Windows\'ta PATH ayırıcısı ";" ve ":" sürücü harfinin (C:) parçasıdır. os.pathsep her sistemde doğru ayırıcıyı verir; boş girdileri de at.'
    },
    {
      bad: 'yol = "C:\\Users\\ayse\\new_rapor.txt"',
      good: 'yol = r"C:\\Users\\ayse\\new_rapor.txt"\n# ya da\nyol = "C:/Users/ayse/new_rapor.txt"',
      why: 'Normal metinde \\n satır sonu, \\U unicode kaçışıdır; Windows yolu bozulur ya da SyntaxError verir. Ham metin (r"...") ya da düz bölü kullan.'
    }
  ]
}
);
})(window);
/* PythonPatika — v2/t1: vscode */
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
`,
  ex: [
    {
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
    },
    {
      t: 'predict',
      stage: 'Kodu oku',
      q: 'settings.json üreten bu kod ne yazdırır?',
      code: 'import json\nayar = {"editor.formatOnSave": True, "editor.rulers": [88]}\nprint(json.dumps(ayar))\n',
      o: [
        '{"editor.formatOnSave": True, "editor.rulers": [88]}',
        '{\'editor.formatOnSave\': True, \'editor.rulers\': [88]}',
        '{"editor.formatOnSave": true, "editor.rulers": [88]}',
        '{"editor.formatOnSave": "true", "editor.rulers": ["88"]}'
      ],
      a: 2,
      why: 'json.dumps Python değerlerini JSON karşılıklarına çevirir: True → true, anahtarlar çift tırnaklı. Tek tırnaklı çıktı print(ayar)\'ın (Python temsili) çıktısıdır ve geçersiz JSON\'dur.'
    },
    {
      t: 'predict',
      stage: 'Kodu oku',
      q: 'VS Code ayar katmanlarını taklit eden bu kod ne yazdırır?',
      code: 'kullanici = {"editor.fontSize": 14, "editor.formatOnSave": False}\ncalisma_alani = {"editor.formatOnSave": True}\netkin = {**kullanici, **calisma_alani}\nprint(etkin["editor.formatOnSave"], len(etkin))\n',
      o: ['False 2', 'True 3', 'True 2', 'False 3'],
      a: 2,
      why: 'Sözlük açma ({**a, **b}) sırasında aynı anahtar ikinci kez gelince değeri güncellenir; sonraki (çalışma alanı) kazanır. Anahtar sayısı artmaz: iki farklı anahtar vardır.'
    },
    {
      t: 'predict',
      stage: 'Kodu oku',
      q: 'Çalışma dizini tuzağı: bu kod ne yazdırır?',
      code: 'from pathlib import PurePosixPath\nbetik = PurePosixPath("/proje/src/rapor.py")\ncwd = PurePosixPath("/proje")\nprint(cwd / "veri.csv")\nprint(betik.parent / "veri.csv")\n',
      o: ['/proje/src/veri.csv\n/proje/src/veri.csv', '/proje/veri.csv\n/proje/src/veri.csv', '/proje/veri.csv\n/proje/src/rapor.py/veri.csv', '/proje/veri.csv\n/proje/veri.csv'],
      a: 1,
      why: 'Göreli bir dosya adı çalışma dizinine (cwd) göre çözülür; betiğin yeri önemsizdir. betik.parent ise betiğin klasörünü (/proje/src) verir. İkisi farklı olduğu için "bende çalışıyor, düğmeyle çalışmıyor" sorunu doğar.'
    },
    {
      t: 'order',
      stage: 'Kodu oku',
      q: '<p>Hata ayıklama yapılandırmasını (launch.json) Python ile üreten betiği sırala. Çıktıdaki anahtar sırası, satırların sırasını ele verir.</p>',
      lines: [
        'import json',
        'ayar = {"name": "Rapor", "type": "debugpy", "request": "launch"}',
        'ayar["program"] = "${file}"',
        'ayar["args"] = ["--ay", "2026-10"]',
        'launch = {"version": "0.2.0", "configurations": [ayar]}',
        'print(json.dumps(launch))'
      ],
      expect: '{"version": "0.2.0", "configurations": [{"name": "Rapor", "type": "debugpy", "request": "launch", "program": "${file}", "args": ["--ay", "2026-10"]}]}\n',
      hint: 'Sözlükler ekleme sırasını korur; program anahtarı args\'tan önce eklenmiş.',
      why: 'json modülü içe aktarılır, yapılandırma sözlüğü oluşturulup alanları sırayla eklenir, sonra launch sözlüğüne yerleştirilip yazdırılır. Python sözlükleri ekleme sırasını koruduğu için JSON çıktısındaki sıra kodun sırasını yansıtır.'
    },
    {
      t: 'code',
      stage: 'Rehberli',
      id: 'vscode-1',
      diff: 1,
      q: '<p>Ekibin ayar şablonunu üreten <code>ayarlar_uret(formatlayici, satir_uzunlugu=88)</code> fonksiyonunu yaz. <code>formatlayici</code> <code>"ruff"</code> ya da <code>"black"</code> olabilir (büyük/küçük harf duyarsız); başka değerde <code>ValueError</code> fırlat. Şu sözlüğü döndür:</p><pre>{\n    "[python]": {\n        "editor.defaultFormatter": &lt;eklenti kimliği&gt;,\n        "editor.formatOnSave": True\n    },\n    "editor.rulers": [satir_uzunlugu],\n    "python.terminal.activateEnvironment": True\n}</pre><p>Kimlikler: ruff → <code>"charliermarsh.ruff"</code>, black → <code>"ms-python.black-formatter"</code>.</p>',
      guide: [
        'Biçimlendirici adlarını eklenti kimliklerine eşleyen bir sözlük tanımla.',
        'formatlayici.lower() sözlükte yoksa ValueError fırlat.',
        'İç içe sözlüğü kur: "[python]" anahtarının değeri de bir sözlük.',
        'editor.rulers bir liste olmalı: [satir_uzunlugu].'
      ],
      example: 'RENKLER = {"kirmizi": "#ff0000", "mavi": "#0000ff"}\ndef tema(renk):\n    if renk.lower() not in RENKLER:\n        raise ValueError(renk)\n    return {"[markdown]": {"renk": RENKLER[renk.lower()]}, "kenar": [80]}\nprint(tema("Mavi"))\n',
      start: 'KIMLIKLER = {\n    # TODO: "ruff" ve "black" için eklenti kimlikleri\n}\n\n\ndef ayarlar_uret(formatlayici, satir_uzunlugu=88):\n    # TODO: bilinmeyen biçimlendiricide ValueError\n    # TODO: iç içe ayar sözlüğünü döndür\n    return {}\n',
      sol: 'KIMLIKLER = {\n    "ruff": "charliermarsh.ruff",\n    "black": "ms-python.black-formatter",\n}\n\n\ndef ayarlar_uret(formatlayici, satir_uzunlugu=88):\n    ad = formatlayici.lower()\n    if ad not in KIMLIKLER:\n        raise ValueError(f"Bilinmeyen biçimlendirici: {formatlayici}")\n    return {\n        "[python]": {\n            "editor.defaultFormatter": KIMLIKLER[ad],\n            "editor.formatOnSave": True,\n        },\n        "editor.rulers": [satir_uzunlugu],\n        "python.terminal.activateEnvironment": True,\n    }\n',
      tests: 'import json\nr = ayarlar_uret("ruff")\nassert r["[python]"] == {"editor.defaultFormatter": "charliermarsh.ruff", "editor.formatOnSave": True}, "[python] bölümü Ruff kimliğini ve formatOnSave True içermeli"\nassert r["editor.rulers"] == [88], "Varsayılan satır uzunluğu 88, liste içinde"\nassert r["python.terminal.activateEnvironment"] is True, "Terminalde venv otomatik etkinleşmeli"\nassert ayarlar_uret("Black", 100)["[python]"]["editor.defaultFormatter"] == "ms-python.black-formatter", "Büyük harfli Black de kabul edilmeli"\nassert ayarlar_uret("black", 100)["editor.rulers"] == [100], "satir_uzunlugu parametresi kullanılmalı"\nassert \'"editor.formatOnSave": true\' in json.dumps(r), "Sözlük JSON\'a çevrilebilmeli (True → true)"\ntry:\n    ayarlar_uret("autopep8")\n    assert False, "Bilinmeyen biçimlendiricide ValueError beklenir"\nexcept ValueError:\n    pass\n',
      hints: [
        'Eşleme sözlüğü: {"ruff": "charliermarsh.ruff", "black": "ms-python.black-formatter"}',
        'if ad not in KIMLIKLER: raise ValueError(...)',
        '"[python]": {"editor.defaultFormatter": KIMLIKLER[ad], "editor.formatOnSave": True}'
      ],
      why: 'Ayar şablonunu kodla üretmek, ekipteki tüm projelerin aynı kurallarla başlamasını sağlar. Python sözlüğü doğrudan JSON\'a çevrilebildiği için settings.json\'u elle yazmaya gerek kalmaz.'
    },
    {
      t: 'code',
      stage: 'Rehberli',
      id: 'vscode-2',
      diff: 2,
      q: '<p>VS Code ayar dosyaları JSONC\'dir: tam satır <code>//</code> yorumları ve kapanış parantezinden önce sondaki virgül içerebilir. <code>jsonc_oku(metin)</code> fonksiyonunu yaz:</p><ul><li>Baş boşlukları atıldığında <code>//</code> ile başlayan satırları çıkar (satır içindeki <code>"https://..."</code> gibi metinlere dokunma).</li><li><code>,</code> ardından yalnız boşluk ve <code>}</code> ya da <code>]</code> geliyorsa virgülü sil.</li><li><code>json.loads</code> ile sözlüğe çevirip döndür.</li></ul>',
      guide: [
        'metin.splitlines() ile satırlara ayır; strip().startswith("//") olanları ele.',
        'Kalan satırları "\\n".join ile birleştir.',
        're.sub(r",\\s*([}\\]])", r"\\1", metin) sondaki virgülleri siler.',
        'json.loads ile çözümle ve döndür.'
      ],
      example: 'import re\nliste_metni = "[1, 2, 3,  ]"\nprint(re.sub(r",\\s*\\]", "]", liste_metni))\nsatirlar = ["# yorum", "a=1", "  # girintili yorum", "b=2"]\nprint([s for s in satirlar if not s.strip().startswith("#")])\n',
      start: 'import json, re\n\ndef jsonc_oku(metin):\n    # TODO: // ile başlayan satırları çıkar\n    # TODO: sondaki virgülleri sil\n    # TODO: json.loads ile döndür\n    return json.loads(metin)\n',
      sol: 'import json, re\n\ndef jsonc_oku(metin):\n    satirlar = [s for s in metin.splitlines() if not s.strip().startswith("//")]\n    temiz = "\\n".join(satirlar)\n    temiz = re.sub(r",\\s*([}\\]])", r"\\1", temiz)\n    return json.loads(temiz)\n',
      tests: 'm = """{\n    // biçimlendirme\n    "[python]": {\n        "editor.formatOnSave": true,\n    },\n        // girintili yorum\n    "editor.rulers": [88, 120,],\n    "json.schemaDownload.enable": false,\n    "workbench.startupEditor": "https://anadolu.example/baslangic",\n}"""\nr = jsonc_oku(m)\nassert r["[python]"] == {"editor.formatOnSave": True}, "İç sözlükteki sondaki virgül silinmeli"\nassert r["editor.rulers"] == [88, 120], "Listedeki sondaki virgül silinmeli"\nassert r["workbench.startupEditor"] == "https://anadolu.example/baslangic", "Metin içindeki // korunmalı: yalnız tam satır yorumlar silinir"\nassert len(r) == 4, "Dört üst düzey anahtar"\nassert jsonc_oku(\'{"a": 1}\') == {"a": 1}, "Temiz JSON olduğu gibi okunmalı"\n',
      hints: [
        'Yorum satırlarını filtrelemek için liste üreteci: [s for s in metin.splitlines() if not s.strip().startswith("//")]',
        'Düzenli ifade: virgül, ardından sıfır ya da daha çok boşluk (\\s*), ardından } veya ] yakalanır; yerine yalnız parantez konur.',
        'temiz = re.sub(r",\\s*([}\\]])", r"\\1", temiz)'
      ],
      why: 'Tam satır yorumlarını satır bazında silmek, metin içindeki "https://" gibi değerlere dokunmaz; basit bir replace("//", "") URL\'leri bozardı. Düzenli ifadedeki \\s* satır sonlarını da kapsadığı için virgül ile parantez farklı satırlarda olsa da çalışır.'
    },
    {
      t: 'code',
      stage: 'Rehberli',
      id: 'vscode-3',
      diff: 1,
      q: '<p>VS Code bir klasörü açınca sanal ortamı otomatik bulmaya çalışır. <code>yorumlayici_bul(klasorler, isletim)</code> fonksiyonunu yaz: <code>klasorler</code>, proje kökündeki klasör adlarının kümesidir. Sırayla <code>.venv</code>, <code>venv</code>, <code>env</code> adlarına bak; ilk bulunanın Python yolunu döndür:</p><ul><li><code>isletim == "windows"</code>: <code>&lt;ad&gt;\\Scripts\\python.exe</code></li><li>Diğerleri: <code>&lt;ad&gt;/bin/python</code></li></ul><p>Hiçbiri yoksa <code>None</code>.</p>',
      guide: ['Aday adları öncelik sırasıyla bir listeye koy.', 'Listede dön; ad klasorler içinde varsa yolu oluştur.', 'Windows\'ta ntpath.join, diğerlerinde posixpath.join kullan.', 'Döngü biterse None döndür.'],
      example: 'import posixpath\nraflar = {"b-raf", "c-raf"}\nfor aday in ["a-raf", "b-raf", "c-raf"]:\n    if aday in raflar:\n        print("İlk dolu raf:", posixpath.join(aday, "kutu"))\n        break\n',
      start: 'import ntpath, posixpath\n\nADAYLAR = [".venv", "venv", "env"]\n\n\ndef yorumlayici_bul(klasorler, isletim):\n    # TODO: adaylarda sırayla dön, ilk bulunanın yolunu döndür\n    return None\n',
      sol: 'import ntpath, posixpath\n\nADAYLAR = [".venv", "venv", "env"]\n\n\ndef yorumlayici_bul(klasorler, isletim):\n    for ad in ADAYLAR:\n        if ad in klasorler:\n            if isletim == "windows":\n                return ntpath.join(ad, "Scripts", "python.exe")\n            return posixpath.join(ad, "bin", "python")\n    return None\n',
      tests: 'assert yorumlayici_bul({"src", ".venv", "tests"}, "linux") == ".venv/bin/python", "Linux\'ta bin/python"\nassert yorumlayici_bul({"venv", "env"}, "windows") == "venv\\\\Scripts\\\\python.exe", "venv, env\'den önce gelir; Windows\'ta Scripts\\\\python.exe"\nassert yorumlayici_bul({"env", ".venv"}, "macos") == ".venv/bin/python", "Öncelik sırası kümeden bağımsız: .venv önce"\nassert yorumlayici_bul({"src", "docs"}, "linux") is None, "Sanal ortam yoksa None"\n',
      hints: ['for ad in ADAYLAR: if ad in klasorler: ...', 'ntpath.join(ad, "Scripts", "python.exe") ve posixpath.join(ad, "bin", "python")'],
      why: 'Küme üyelik testi hızlıdır ama sırası yoktur; önceliği belirleyen, dolaştığın aday listesidir. VS Code da benzer bir arama yapar ve bulduğu ortamı önerir.'
    },
    {
      t: 'code',
      stage: 'Kendin yaz',
      id: 'vscode-4',
      diff: 1,
      q: '<p>Eğitim dokümanındaki Windows kısayollarını macOS\'a çeviren <code>mac_kisayolu(kisayol)</code> fonksiyonunu yaz. Kısayol <code>+</code> ile ayrılmış tuşlardan oluşur. Basitleştirilmiş kural: <code>Ctrl</code> → <code>Cmd</code>, <code>Alt</code> → <code>Option</code>, diğer tuşlar aynen kalır. Birden çok kısayol virgül ve boşlukla verilebilir (<code>"Ctrl+K, Ctrl+S"</code>); her birini çevir ve aynı biçimde birleştir.</p>',
      start: 'def mac_kisayolu(kisayol):\n    pass\n',
      sol: 'ESLEME = {"Ctrl": "Cmd", "Alt": "Option"}\n\n\ndef mac_kisayolu(kisayol):\n    parcalar = []\n    for akor in kisayol.split(", "):\n        tuslar = [ESLEME.get(t, t) for t in akor.split("+")]\n        parcalar.append("+".join(tuslar))\n    return ", ".join(parcalar)\n',
      tests: 'assert mac_kisayolu("Ctrl+Shift+P") == "Cmd+Shift+P", "Komut paleti"\nassert mac_kisayolu("Shift+Alt+F") == "Shift+Option+F", "Biçimlendirme: Alt → Option"\nassert mac_kisayolu("F5") == "F5", "Tek tuş aynen kalır"\nassert mac_kisayolu("Ctrl+K, Ctrl+S") == "Cmd+K, Cmd+S", "Akor dizisi: her parça ayrı çevrilir"\nassert mac_kisayolu("Ctrl+Alt+Down") == "Cmd+Option+Down", "Birden çok değiştirici tuş"\n',
      hints: ['Önce ", " ile akorlara, sonra "+" ile tuşlara böl.', 'ESLEME.get(t, t) eşlemede yoksa tuşun kendisini verir.'],
      why: 'dict.get(anahtar, varsayılan) ile "eşlemede varsa çevir, yoksa aynen bırak" kalıbı tek satırda kurulur. İç içe ayırma (önce akor, sonra tuş) yapılandırılmış metinleri ayrıştırmanın temel tekniğidir.'
    },
    {
      t: 'code',
      stage: 'Kendin yaz',
      id: 'vscode-5',
      diff: 2,
      q: '<p><code>eksik_eklentiler(extensions_json, kurulu)</code> fonksiyonunu yaz. <code>extensions_json</code>, <code>.vscode/extensions.json</code> içeriğidir (geçerli JSON metni, <code>"recommendations"</code> listesi içerir; anahtar olmayabilir). <code>kurulu</code>, kurulu eklenti kimliklerinin listesidir. Önerilip kurulu olmayanları, <b>önerideki yazımıyla</b> ve alfabetik sırada döndür. Eklenti kimlikleri büyük/küçük harf duyarsızdır; aynı eklenti öneride iki kez geçerse bir kez say.</p>',
      start: 'import json\n\ndef eksik_eklentiler(extensions_json, kurulu):\n    pass\n',
      sol: 'import json\n\ndef eksik_eklentiler(extensions_json, kurulu):\n    oneriler = json.loads(extensions_json).get("recommendations", [])\n    kurulu_kucuk = {k.lower() for k in kurulu}\n    eksik = {}\n    for e in oneriler:\n        if e.lower() not in kurulu_kucuk and e.lower() not in eksik:\n            eksik[e.lower()] = e\n    return sorted(eksik.values(), key=str.lower)\n',
      tests: 'm = \'{"recommendations": ["ms-python.python", "charliermarsh.ruff", "ms-toolsai.jupyter", "MS-Python.vscode-pylance"]}\'\nassert eksik_eklentiler(m, ["ms-python.python", "ms-python.vscode-pylance"]) == ["charliermarsh.ruff", "ms-toolsai.jupyter"], "Kurulu olanlar (harf duyarsız) çıkarılmalı, kalanlar alfabetik"\nassert eksik_eklentiler(m, []) == ["charliermarsh.ruff", "ms-python.python", "MS-Python.vscode-pylance", "ms-toolsai.jupyter"], "Hiçbiri kurulu değil: önerideki yazımla, harf duyarsız alfabetik"\nassert eksik_eklentiler(\'{"recommendations": ["a.b", "A.B"]}\', []) == ["a.b"], "Tekrar eden öneri bir kez sayılır (ilk yazım)"\nassert eksik_eklentiler("{}", ["x.y"]) == [], "recommendations anahtarı yoksa boş liste"\n',
      hints: ['Kurulu kimlikleri küçük harfli bir kümeye çevir.', 'Tekrarları elemek için küçük harfli anahtar → ilk yazım sözlüğü tut; sorted(..., key=str.lower).'],
      why: 'Kimlikleri karşılaştırırken normalleştirmek (lower) ama kullanıcıya özgün yazımı göstermek, veri temizliğinde çok sık kullanılan bir kalıptır. Sözlük anahtarı normalleştirilmiş değer, değeri özgün değer olur.'
    },
    {
      t: 'code',
      stage: 'Kendin yaz',
      id: 'vscode-6',
      diff: 2,
      q: '<p>VS Code ayar katmanlarını birleştiren <code>ayar_birlestir(*katmanlar)</code> fonksiyonunu yaz. Katmanlar soldan sağa uygulanır (varsayılan, kullanıcı, çalışma alanı...); sonraki önceki değeri ezer. <b>İstisna:</b> bir anahtarın hem eski hem yeni değeri sözlükse (ör. <code>"[python]"</code>), iki sözlüğü bir seviye derinlikte birleştir. Girdi sözlüklerini <b>değiştirme</b>; yeni sözlük döndür.</p>',
      start: 'def ayar_birlestir(*katmanlar):\n    pass\n',
      sol: 'def ayar_birlestir(*katmanlar):\n    sonuc = {}\n    for katman in katmanlar:\n        for anahtar, deger in katman.items():\n            eski = sonuc.get(anahtar)\n            if isinstance(eski, dict) and isinstance(deger, dict):\n                sonuc[anahtar] = {**eski, **deger}\n            elif isinstance(deger, dict):\n                sonuc[anahtar] = dict(deger)\n            else:\n                sonuc[anahtar] = deger\n    return sonuc\n',
      tests: 'v = {"editor.tabSize": 4, "[python]": {"editor.formatOnSave": False, "editor.tabSize": 4}}\nk = {"editor.fontSize": 15, "[python]": {"editor.formatOnSave": True}}\nc = {"[python]": {"editor.defaultFormatter": "charliermarsh.ruff"}, "editor.tabSize": 2}\nr = ayar_birlestir(v, k, c)\nassert r["[python]"] == {"editor.formatOnSave": True, "editor.tabSize": 4, "editor.defaultFormatter": "charliermarsh.ruff"}, "[python] bölümleri bir seviye derin birleşmeli"\nassert r["editor.tabSize"] == 2 and r["editor.fontSize"] == 15, "Düz anahtarlarda son katman kazanır"\nassert v["[python]"] == {"editor.formatOnSave": False, "editor.tabSize": 4}, "Girdi sözlükleri değişmemeli"\nr["[python]"]["x"] = 1\nassert "x" not in k["[python]"] and "x" not in c["[python]"], "Sonuçtaki iç sözlük girdilerle paylaşılmamalı (kopya olmalı)"\nassert ayar_birlestir() == {}, "Katman yoksa boş sözlük"\nassert ayar_birlestir({"a": {"b": 1}}, {"a": 5}) == {"a": 5}, "Yeni değer sözlük değilse doğrudan ezer"\n',
      hints: ['İki sözlüğü birleştirmek için {**eski, **yeni} yeni bir sözlük üretir.', 'Yalnız biri sözlükse ve yeni değer sözlükse dict(deger) ile kopyala; böylece girdiyle aynı nesneyi paylaşmazsın.'],
      why: 'Sığ birleştirme (dict.update) "[python]" gibi bölümleri bütünüyle ezerdi ve kullanıcının diğer Python ayarları kaybolurdu. Bir seviye derin birleştirme ve kopyalama, VS Code\'un gerçek davranışına yakındır ve yan etki bırakmaz.'
    },
    {
      t: 'code',
      stage: 'Kendin yaz',
      id: 'vscode-7',
      diff: 2,
      q: '<p>Editörler hata çıktısındaki dosya ve satıra tıklayınca oraya atlar. <code>hata_konumu(traceback_metni)</code> fonksiyonunu yaz: metindeki <b>son</b> <code>File "...", line N</code> kaydını bulsun ve <code>(dosya, satir_no, hata)</code> demeti döndürsün. <code>satir_no</code> int olsun; <code>hata</code>, metnin son boş olmayan satırıdır (ör. <code>"ZeroDivisionError: division by zero"</code>). Hiç <code>File</code> kaydı yoksa <code>None</code>.</p>',
      start: 'import re\n\ndef hata_konumu(traceback_metni):\n    pass\n',
      sol: 'import re\n\ndef hata_konumu(traceback_metni):\n    kayitlar = re.findall(r\'File "([^"]+)", line (\\d+)\', traceback_metni)\n    if not kayitlar:\n        return None\n    dosya, satir = kayitlar[-1]\n    satirlar = [s.strip() for s in traceback_metni.splitlines() if s.strip()]\n    return (dosya, int(satir), satirlar[-1])\n',
      tests: 't = """Traceback (most recent call last):\n  File "/home/ayse/anadolu-rapor/src/rapor/main.py", line 42, in <module>\n    ozet = ortalama(tutarlar)\n  File "/home/ayse/anadolu-rapor/src/rapor/hesap.py", line 7, in ortalama\n    return sum(liste) / len(liste)\n           ~~~~~~~~~~^~~~~~~~~~~~\nZeroDivisionError: division by zero\n"""\nassert hata_konumu(t) == ("/home/ayse/anadolu-rapor/src/rapor/hesap.py", 7, "ZeroDivisionError: division by zero"), "Son kayıt hatanın gerçekten oluştuğu yerdir"\nw = \'Traceback (most recent call last):\\n  File "C:\\\\dev\\\\rapor\\\\main.py", line 3, in <module>\\n    import pandas\\nModuleNotFoundError: No module named \\\'pandas\\\'\\n\\n\'\nassert hata_konumu(w) == ("C:\\\\dev\\\\rapor\\\\main.py", 3, "ModuleNotFoundError: No module named \'pandas\'"), "Windows yolu ve sondaki boş satırlar"\nassert isinstance(hata_konumu(t)[1], int), "Satır numarası int olmalı"\nassert hata_konumu("SyntaxError olmayan düz metin") is None, "File kaydı yoksa None"\n',
      hints: ['re.findall(r\'File "([^"]+)", line (\\d+)\', metin) tüm (dosya, satır) çiftlerini verir; son eleman en içteki çağrıdır.', 'Son boş olmayan satır için satırları strip edip boşları ele, [-1] al.'],
      why: 'Python izleme kaydı (traceback) en dıştaki çağrıdan en içtekine doğru yazılır; hatanın oluştuğu yer son File kaydıdır, hata türü ve mesajı ise en alttaki satırdır. Editörlerin "tıkla, hataya git" özelliği tam olarak bu ayrıştırmayı yapar.'
    },
    {
      t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      id: 'vscode-8',
      diff: 1,
      q: '<p>Hatayı bul ve düzelt. <code>veri_yolu(betik_yolu, dosya_adi)</code>, betiğin <b>bulunduğu klasördeki</b> veri dosyasının yolunu metin olarak döndürmeli; böylece betik hangi çalışma dizininden başlatılırsa başlatılsın dosya bulunur. Kod yanlış yol üretiyor.</p>',
      start: 'from pathlib import PurePosixPath\n\ndef veri_yolu(betik_yolu, dosya_adi):\n    return PurePosixPath(betik_yolu) / dosya_adi\n',
      sol: 'from pathlib import PurePosixPath\n\ndef veri_yolu(betik_yolu, dosya_adi):\n    return str(PurePosixPath(betik_yolu).parent / dosya_adi)\n',
      tests: 'assert veri_yolu("/proje/src/rapor.py", "veri.csv") == "/proje/src/veri.csv", "Betiğin klasörü + dosya adı; betik dosyasının kendisi klasör değildir"\nassert veri_yolu("/proje/src/rapor.py", "veri/ekim.csv") == "/proje/src/veri/ekim.csv", "Alt klasörlü göreli ad"\nassert isinstance(veri_yolu("/a/b.py", "c.txt"), str), "Sonuç metin (str) olmalı"\n',
      hints: ['PurePosixPath("/proje/src/rapor.py") / "veri.csv" sonucu "/proje/src/rapor.py/veri.csv" olur.', '.parent ile klasöre çık, str() ile metne çevir.'],
      why: 'Gerçek kodda bunun karşılığı Path(__file__).resolve().parent / "veri.csv" kalıbıdır. Göreli yol çalışma dizinine bağlıdır; betiğin klasörüne dayalı yol ise VS Code\'un Çalıştır düğmesinde, terminalde ve zamanlanmış görevde aynı dosyayı bulur.'
    },
    {
      t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      id: 'vscode-9',
      diff: 2,
      q: '<p>Hatayı bul ve düzelt. <code>ayar_metni(ayarlar)</code>, sözlükten VS Code\'un okuyabileceği geçerli bir settings.json metni üretmeli: 4 boşluk girinti, Türkçe karakterler kaçışsız (<code>ensure_ascii=False</code>). Mevcut kod f-string ile elle birleştiriyor; üretilen dosyayı VS Code okuyamıyor.</p>',
      start: 'def ayar_metni(ayarlar):\n    satirlar = []\n    for anahtar, deger in ayarlar.items():\n        satirlar.append(f\'    "{anahtar}": {deger}\')\n    return "{\\n" + ",\\n".join(satirlar) + "\\n}"\n',
      sol: 'import json\n\ndef ayar_metni(ayarlar):\n    return json.dumps(ayarlar, indent=4, ensure_ascii=False)\n',
      tests: 'import json\na = {"editor.formatOnSave": True, "python.defaultInterpreterPath": ".venv/bin/python", "editor.rulers": [88], "[python]": {"editor.tabSize": 4}, "rapor.baslik": "Şube özeti"}\nm = ayar_metni(a)\ntry:\n    geri = json.loads(m)\nexcept json.JSONDecodeError as e:\n    raise AssertionError(f"Üretilen metin geçerli JSON değil: {e}")\nassert geri == a, "JSON\'dan geri okununca aynı sözlük çıkmalı"\nassert "true" in m and "True" not in m, "Python True, JSON\'da true olmalı"\nassert "Şube özeti" in m, "Türkçe karakterler kaçışsız yazılmalı (ensure_ascii=False)"\nassert m.splitlines()[1].startswith(\'    "\'), "4 boşluk girinti"\n',
      hints: ['f-string Python temsilini yazar: True, tek tırnaklı metinler, tırnaksız metin değerleri. Bunlar JSON değildir.', 'json.dumps(ayarlar, indent=4, ensure_ascii=False)'],
      why: 'Veri biçimlerini (JSON, CSV, XML) asla metin birleştirerek üretme; tırnak, kaçış ve tür çevirisi hataları kaçınılmazdır. json.dumps tüm bunları doğru yapar; indent okunabilirlik, ensure_ascii=False Türkçe karakterler içindir.'
    },
    {
      t: 'code',
      stage: 'Meydan okuma',
      id: 'vscode-10',
      diff: 3,
      q: '<p>Yeni projeleri inceleyen <code>calisma_alani_denetle(dosyalar)</code> fonksiyonunu yaz. <code>dosyalar</code>, proje kökünden göreli yol (<code>/</code> ayırıcılı) → içerik sözlüğüdür. Uyarı kodlarının <b>alfabetik</b> listesini döndür:</p><ul><li><code>"BAGIMLILIK_YOK"</code>: ne <code>requirements.txt</code> ne <code>pyproject.toml</code> var.</li><li><code>"AYAR_YOK"</code>: <code>.vscode/settings.json</code> yok.</li><li><code>"AYAR_BOZUK"</code>: settings.json var ama JSONC olarak okunamıyor (tam satır <code>//</code> yorumları ve sondaki virgüller geçerlidir).</li><li><code>"VENV_IZLENIYOR"</code>: <code>.venv/</code> ile başlayan bir yol var ve <code>.gitignore</code> (yoksa boş say) <code>.venv</code>\'i yok saymıyor. Kabul edilen satırlar: <code>.venv</code>, <code>.venv/</code>, <code>/.venv</code>, <code>/.venv/</code> (baş/son boşluk ve <code>#</code> yorum satırları göz ardı).</li><li><code>"PYCACHE"</code>: yolunda <code>__pycache__/</code> geçen bir dosya var ve .gitignore\'da <code>__pycache__</code> ya da <code>__pycache__/</code> satırı yok.</li><li><code>"TEST_YOK"</code>: <code>tests/</code> ile başlayan ya da dosya adı <code>test_</code> ile başlayan <code>.py</code> dosyası yok.</li></ul>',
      start: 'import json, re\n\ndef calisma_alani_denetle(dosyalar):\n    pass\n',
      sol: 'import json, re, posixpath\n\n\ndef _jsonc(metin):\n    satirlar = [s for s in metin.splitlines() if not s.strip().startswith("//")]\n    return json.loads(re.sub(r",\\s*([}\\]])", r"\\1", "\\n".join(satirlar)))\n\n\ndef calisma_alani_denetle(dosyalar):\n    uyarilar = []\n    yoksay = {s.strip() for s in dosyalar.get(".gitignore", "").splitlines()\n              if s.strip() and not s.strip().startswith("#")}\n    if "requirements.txt" not in dosyalar and "pyproject.toml" not in dosyalar:\n        uyarilar.append("BAGIMLILIK_YOK")\n    if ".vscode/settings.json" not in dosyalar:\n        uyarilar.append("AYAR_YOK")\n    else:\n        try:\n            _jsonc(dosyalar[".vscode/settings.json"])\n        except ValueError:\n            uyarilar.append("AYAR_BOZUK")\n    if any(y.startswith(".venv/") for y in dosyalar) and not yoksay & {".venv", ".venv/", "/.venv", "/.venv/"}:\n        uyarilar.append("VENV_IZLENIYOR")\n    if any("__pycache__/" in y for y in dosyalar) and not yoksay & {"__pycache__", "__pycache__/"}:\n        uyarilar.append("PYCACHE")\n    testler = [y for y in dosyalar if y.endswith(".py") and (y.startswith("tests/") or posixpath.basename(y).startswith("test_"))]\n    if not testler:\n        uyarilar.append("TEST_YOK")\n    return sorted(uyarilar)\n',
      tests: 'iyi = {\n    "pyproject.toml": "[project]\\nname = \'rapor\'",\n    ".gitignore": "# ortam\\n.venv/\\n__pycache__/\\n",\n    ".vscode/settings.json": \'{\\n  // ayar\\n  "editor.formatOnSave": true,\\n}\',\n    ".venv/bin/python": "",\n    "src/rapor/__pycache__/main.cpython-312.pyc": "",\n    "src/rapor/main.py": "print(1)",\n    "tests/test_main.py": "def test(): pass",\n}\nassert calisma_alani_denetle(iyi) == [], "Düzgün projede uyarı olmamalı (JSONC yorum ve sondaki virgül geçerli)"\nkotu = {\n    ".vscode/settings.json": \'{"editor.formatOnSave": True}\',\n    ".venv/bin/python": "",\n    "app/__pycache__/x.pyc": "",\n    "app/main.py": "",\n    "app/testler.py": "",\n}\nassert calisma_alani_denetle(kotu) == ["AYAR_BOZUK", "BAGIMLILIK_YOK", "PYCACHE", "TEST_YOK", "VENV_IZLENIYOR"], "True geçersiz JSON; .gitignore yok; testler.py test dosyası sayılmaz"\nk2 = {"requirements.txt": "", ".gitignore": "  /.venv  \\n# __pycache__/\\n", ".venv/x": "", "a/__pycache__/b.pyc": "", "src/test_hesap.py": ""}\nassert calisma_alani_denetle(k2) == ["AYAR_YOK", "PYCACHE"], "/.venv kabul; yorumdaki __pycache__ sayılmaz; test_hesap.py test dosyasıdır"\nassert calisma_alani_denetle({}) == ["AYAR_YOK", "BAGIMLILIK_YOK", "TEST_YOK"], "Boş proje"\n',
      hints: [
        '.gitignore satırlarını strip edip boş ve # ile başlayanları atarak bir kümeye çevir; kabul edilen kalıplarla kesişimine bak.',
        'JSONC okuma için önceki görevdeki yaklaşımı yardımcı fonksiyona koy; json.JSONDecodeError, ValueError\'ın alt sınıfıdır.',
        'Test dosyası: .py ile bitmeli VE (tests/ ile başlamalı YA DA posixpath.basename(y) test_ ile başlamalı).'
      ],
      why: 'Gerçek denetim araçları (linter, CI kontrolleri) tam olarak böyle küçük kuralların toplamıdır. Her kuralı bağımsız bir if ile yazmak, sonuçları sıralamak ve kenar durumları (yorum satırları, farklı yazımlar) test etmek, aracı güvenilir kılar.'
    },
    {
      t: 'code',
      stage: 'Mini proje',
      id: 'vscode-11',
      diff: 3,
      q: '<p>Anadolu Market\'in proje şablonu için <code>vscode_hazirla(isletim, formatlayici)</code> fonksiyonunu yaz. Dosya yolu → JSON metni (4 boşluk girinti, <code>ensure_ascii=False</code>) sözlüğü döndür:</p><ul><li><code>".vscode/settings.json"</code>: <code>"python.defaultInterpreterPath"</code> (Windows: <code>"${workspaceFolder}/.venv/Scripts/python.exe"</code>, diğer: <code>"${workspaceFolder}/.venv/bin/python"</code>), <code>"[python]"</code> bölümünde <code>editor.defaultFormatter</code> (ruff → <code>charliermarsh.ruff</code>, black → <code>ms-python.black-formatter</code>) ve <code>editor.formatOnSave: true</code>, ayrıca <code>"python.testing.pytestEnabled": true</code>.</li><li><code>".vscode/extensions.json"</code>: <code>{"recommendations": ["ms-python.python", "ms-python.vscode-pylance", &lt;biçimlendirici kimliği&gt;]}</code></li><li><code>".vscode/launch.json"</code>: <code>version "0.2.0"</code> ve tek yapılandırma: <code>name "Geçerli dosya"</code>, <code>type "debugpy"</code>, <code>request "launch"</code>, <code>program "${file}"</code>, <code>console "integratedTerminal"</code>, <code>justMyCode true</code>.</li></ul><p>Bilinmeyen biçimlendirici ya da işletim sisteminde (<code>windows</code>, <code>macos</code>, <code>linux</code> dışında) <code>ValueError</code>.</p>',
      start: 'import json\n\ndef vscode_hazirla(isletim, formatlayici):\n    pass\n',
      sol: 'import json\n\nKIMLIKLER = {"ruff": "charliermarsh.ruff", "black": "ms-python.black-formatter"}\n\n\ndef _json(veri):\n    return json.dumps(veri, indent=4, ensure_ascii=False)\n\n\ndef vscode_hazirla(isletim, formatlayici):\n    if formatlayici not in KIMLIKLER:\n        raise ValueError(f"Bilinmeyen biçimlendirici: {formatlayici}")\n    if isletim == "windows":\n        yorumlayici = "${workspaceFolder}/.venv/Scripts/python.exe"\n    elif isletim in ("macos", "linux"):\n        yorumlayici = "${workspaceFolder}/.venv/bin/python"\n    else:\n        raise ValueError(f"Bilinmeyen işletim sistemi: {isletim}")\n    kimlik = KIMLIKLER[formatlayici]\n    ayarlar = {\n        "python.defaultInterpreterPath": yorumlayici,\n        "[python]": {"editor.defaultFormatter": kimlik, "editor.formatOnSave": True},\n        "python.testing.pytestEnabled": True,\n    }\n    eklentiler = {"recommendations": ["ms-python.python", "ms-python.vscode-pylance", kimlik]}\n    launch = {\n        "version": "0.2.0",\n        "configurations": [{\n            "name": "Geçerli dosya",\n            "type": "debugpy",\n            "request": "launch",\n            "program": "${file}",\n            "console": "integratedTerminal",\n            "justMyCode": True,\n        }],\n    }\n    return {\n        ".vscode/settings.json": _json(ayarlar),\n        ".vscode/extensions.json": _json(eklentiler),\n        ".vscode/launch.json": _json(launch),\n    }\n',
      tests: 'import json\nd = vscode_hazirla("windows", "ruff")\nassert set(d) == {".vscode/settings.json", ".vscode/extensions.json", ".vscode/launch.json"}, "Üç dosya üretilmeli"\nassert all(isinstance(v, str) for v in d.values()), "Değerler JSON metni (str) olmalı"\ns = json.loads(d[".vscode/settings.json"])\nassert s["python.defaultInterpreterPath"] == "${workspaceFolder}/.venv/Scripts/python.exe", "Windows yorumlayıcı yolu Scripts/python.exe"\nassert s["[python]"] == {"editor.defaultFormatter": "charliermarsh.ruff", "editor.formatOnSave": True}, "[python] bölümü"\nassert s["python.testing.pytestEnabled"] is True, "pytest açık"\ne = json.loads(d[".vscode/extensions.json"])\nassert e == {"recommendations": ["ms-python.python", "ms-python.vscode-pylance", "charliermarsh.ruff"]}, "Önerilen eklentiler"\nl = json.loads(d[".vscode/launch.json"])\nassert l["version"] == "0.2.0" and len(l["configurations"]) == 1, "launch.json sürümü ve tek yapılandırma"\nassert l["configurations"][0] == {"name": "Geçerli dosya", "type": "debugpy", "request": "launch", "program": "${file}", "console": "integratedTerminal", "justMyCode": True}, "Yapılandırma alanları"\nassert "Geçerli dosya" in d[".vscode/launch.json"], "ensure_ascii=False: Türkçe karakter kaçışsız"\nassert d[".vscode/launch.json"].splitlines()[1].startswith(\'    "version"\'), "4 boşluk girinti"\nm = vscode_hazirla("macos", "black")\nassert json.loads(m[".vscode/settings.json"])["python.defaultInterpreterPath"].endswith("/.venv/bin/python"), "macOS: bin/python"\nassert json.loads(m[".vscode/extensions.json"])["recommendations"][-1] == "ms-python.black-formatter", "Black kimliği"\nfor kotu in [("windows", "yapf"), ("amiga", "ruff")]:\n    try:\n        vscode_hazirla(*kotu)\n        assert False, f"{kotu} için ValueError beklenir"\n    except ValueError:\n        pass\n',
      hints: [
        'Üç sözlüğü ayrı ayrı kur, sonra her birini aynı json.dumps(..., indent=4, ensure_ascii=False) yardımcısıyla metne çevir.',
        '"${workspaceFolder}" ve "${file}" Python için sıradan metindir (f-string değil, düz metin kullan).',
        'Doğrulamaları (ValueError) en başta yap; böylece yarım dosya üretilmez.'
      ],
      why: 'Bu fonksiyon dersin tüm parçalarını birleştirir: yorumlayıcı yolu (işletim sistemine göre), biçimlendirici ve kaydederken biçimlendirme, önerilen eklentiler ve hata ayıklama yapılandırması. Proje şablonlarını kodla üretmek (cookiecutter, copier gibi araçlar) ekiplerde standart bir uygulamadır.'
    }
  ],
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
/* PythonPatika v2/t2 — Kullanıcı girdisi ve tür dönüşümü */
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push({
  id: 'girdi-donusum',
  lv: 'temel',
  mod: 'Veri Türleri',
  min: 40,
  title: 'Kullanıcı girdisi ve tür dönüşümü',
  sum: 'input() her zaman str döndürür: int/float/bool dönüşümlerinin tuzaklarını, Türkçe virgüllü ondalığı, isdigit/isnumeric/isdecimal farkını, while True + try/except doğrulama döngüsünü, split ile çoklu değer ve varsayılan değer kalıplarını öğrenirsin.',
  goals: ['input() ile aldığım metni int, float ve bool\'a tuzaklara düşmeden dönüştürebilirim.', '"12,5" ve "1.234,56" gibi Türkçe sayı biçimlerini float\'a çevirebilirim.', 'isdigit, isnumeric ve isdecimal farkını bilir, doğru olanı seçerim.', 'while True, try/except ve break ile kullanıcı doğru girene kadar soran doğrulama döngüsü yazabilirim.', 'Tek satırda birden fazla değer alır, boş girdide varsayılan değer kullanırım.'],
  body: `
<h2>Kullanıcı ne yazarsa yazar</h2>
<p>Anadolu Market'in depo görevlisi stok sayım programına "12" yerine "on iki", "12,5" ya da yanlışlıkla boş bir satır girer. Kasa görevlisi "Onaylıyor musun?" sorusuna "Hayır" yazar ve program bunu "evet" sanar. Kullanıcı girdisi (user input) programın en kirli kapısıdır: <b>her şey metin olarak gelir, hiçbir şeyin doğru biçimde geleceği garanti değildir</b>. İlk program dersinde <code>input()</code> ile tanıştın, değişkenler dersinde <code>int()</code> ve <code>float()</code> gördün. Bu derste ikisini birleştirip sağlam bir girdi katmanı kuracaksın: dönüştür, doğrula, gerekirse tekrar sor.</p>

<h2>input() her zaman str döndürür</h2>
<p><code>input(istem)</code> ekrana istem (prompt) metnini yazar, kullanıcının Enter'a basmasını bekler ve yazılanı <b>sondaki satır sonu olmadan</b> bir <code>str</code> olarak döndürür. Kullanıcı 42 yazsa da gelen değer <code>"42"</code> metnidir.</p>
<pre class="code">adet = input("Adet: ")          # kullanıcı 3 yazar
fiyat = input("Fiyat: ")        # kullanıcı 20 yazar
print(adet * 2)                 # 33   (metin tekrarı!)
print(adet + fiyat)             # 320  (metin birleştirme!)
print(int(adet) * int(fiyat))   # 60</pre>
<p>Bu derste tarayıcıdaki örnekler <code>input()</code> yerine "kullanıcının yazdığı" metni doğrudan bir değişkene koyarak çalışır; alıştırmalarda ise gerçek <code>input()</code> kullanacaksın ve sistem senin yerine yazacak. Doğrulayıcı istemi ve girilen değeri çıktıya ekler: <code>Ad: Ayşe</code> gibi.</p>
<pre class="py">girilen_adet = "3"        # input("Adet: ") sonucu gibi düşün
girilen_fiyat = "20"
print(type(girilen_adet).__name__)
print(girilen_adet * 2, girilen_adet + girilen_fiyat)
print(int(girilen_adet) * int(girilen_fiyat))</pre>

<h2>Dönüşüm fonksiyonları ve tuzakları</h2>
<p><code>int()</code>, <code>float()</code>, <code>bool()</code> ve <code>str()</code> yeni bir değer üretir; orijinal metin değişmez. Hangi metinleri kabul ettiklerini bilmek, ValueError'ı önceden kestirmeni sağlar.</p>
<div class="tbl-wrap"><table>
<tr><th>İfade</th><th>Sonuç</th><th>Not</th></tr>
<tr><td><code>int("42")</code>, <code>int(" 42 ")</code></td><td>42</td><td>Baştaki/sondaki boşluk sorun değil</td></tr>
<tr><td><code>int("1_000")</code></td><td>1000</td><td>Alt çizgi basamak ayırıcısı kabul edilir</td></tr>
<tr><td><code>int("4.5")</code></td><td>ValueError</td><td>Ondalık metni doğrudan int olmaz: <code>int(float("4.5"))</code></td></tr>
<tr><td><code>int(4.9)</code>, <code>int(-4.9)</code></td><td>4, -4</td><td>Yuvarlamaz, sıfıra doğru keser</td></tr>
<tr><td><code>int("ff", 16)</code></td><td>255</td><td>İkinci parametre taban</td></tr>
<tr><td><code>float("12.5")</code>, <code>float("1e3")</code></td><td>12.5, 1000.0</td><td>Bilimsel gösterim kabul</td></tr>
<tr><td><code>float("12,5")</code></td><td>ValueError</td><td>Python ondalık ayırıcı olarak yalnız nokta bilir</td></tr>
<tr><td><code>float("nan")</code>, <code>float("inf")</code></td><td>nan, inf</td><td>Sürpriz: bunlar da geçerli float!</td></tr>
<tr><td><code>bool("False")</code>, <code>bool("0")</code></td><td>True, True</td><td>Boş olmayan her metin True</td></tr>
<tr><td><code>bool("")</code></td><td>False</td><td>Yalnız boş metin False</td></tr>
<tr><td><code>str(3.0)</code></td><td>"3.0"</td><td>Sayıdan metne her zaman çalışır</td></tr>
</table></div>
<pre class="py">for metin in ["42", " 42 ", "1_000", "4.5", "on iki", ""]:
    try:
        print(repr(metin), "-&gt;", int(metin))
    except ValueError as e:
        print(repr(metin), "-&gt; ValueError:", e)

print(bool("False"), bool("0"), bool(""), bool(" "))
print(int(float("4.5")), round(float("4.5")), round(float("5.5")))</pre>
<div class="warn"><b>bool("False") True'dur</b><code>bool()</code> metnin <b>içeriğine</b> bakmaz, yalnızca boş olup olmadığına bakar. Kullanıcıdan evet/hayır almak için metni kendin yorumlamalısın: <code>cevap.strip().lower() in ("e", "evet")</code>. Aynı tuzak ortam değişkenlerinde ve CSV'deki "True"/"False" sütunlarında da karşına çıkar.</div>
<p>Son satırdaki <code>round(4.5)</code> sonucunun 4 çıkması hata değil: Python "bankacı yuvarlaması" yapar (yarımları çift sayıya). Sayılar dersinde bunu ayrıntılı gördün.</p>

<h2>Virgüllü ondalık: "12,5" → 12.5</h2>
<p>Türkiye'de ondalık ayırıcı virgül, binlik ayırıcı noktadır: <code>1.234,56</code>. Python ise tam tersini bekler. Kullanıcı ve Excel verisinde bu biçim çok sık gelir. Güvenli dönüşüm sırası: önce binlik noktalarını sil, sonra virgülü noktaya çevir.</p>
<pre class="py">def tr_float(metin):
    temiz = metin.strip().replace(" ", "")
    if "," in temiz:                       # Türkçe biçim: 1.234,56
        temiz = temiz.replace(".", "").replace(",", ".")
    return float(temiz)

for m in ["12,5", "1.234,56", " 99 ", "3.75", "1 250,00"]:
    print(repr(m), "-&gt;", tr_float(m))</pre>
<div class="note"><b>Belirsiz durum</b><code>"1.234"</code> bin iki yüz otuz dört mü, bir virgül iki yüz otuz dört mü? Metinden anlaşılamaz. Bu yüzden kurumsal sistemlerde girdi biçimi açıkça belirlenir ("ondalık için virgül kullanın") ya da her iki ayırıcıyı içeren metin reddedilip kullanıcıya tekrar sorulur. Para için float yerine <code>Decimal</code> kullanmayı da unutma.</div>

<h2>isdigit, isnumeric, isdecimal farkı</h2>
<p>Bir metnin sayı olup olmadığını dönüştürmeden önce sormak için üç metot vardır. Hepsi boş metinde, eksi işaretinde, noktada ve boşlukta <b>False</b> döner. Farkları Unicode'daki özel rakamlardadır:</p>
<div class="tbl-wrap"><table>
<tr><th>Metin</th><th>isdecimal()</th><th>isdigit()</th><th>isnumeric()</th><th>int() çalışır mı?</th></tr>
<tr><td><code>"123"</code></td><td>True</td><td>True</td><td>True</td><td>Evet</td></tr>
<tr><td><code>"٣"</code> (Arapça 3)</td><td>True</td><td>True</td><td>True</td><td>Evet → 3</td></tr>
<tr><td><code>"²"</code> (üst simge)</td><td>False</td><td>True</td><td>True</td><td>Hayır!</td></tr>
<tr><td><code>"½"</code>, <code>"Ⅻ"</code></td><td>False</td><td>False</td><td>True</td><td>Hayır</td></tr>
<tr><td><code>"-5"</code>, <code>"3.5"</code>, <code>" 7"</code>, <code>""</code></td><td>False</td><td>False</td><td>False</td><td>-5 ve " 7" evet!</td></tr>
</table></div>
<p>Kural: <code>int()</code> öncesi ön kontrol için en güvenlisi <code>isdecimal()</code>'dır. Ama tablo son satırı gösteriyor ki hiçbiri negatif sayıyı ve boşluklu girdiyi tanımaz. Bu yüzden profesyonel kod "önce sor" yerine "<b>dene ve yakala</b>" (EAFP: easier to ask forgiveness than permission) yaklaşımını tercih eder: <code>try: int(metin) except ValueError: ...</code>.</p>
<pre class="py">for m in ["123", "²", "½", "-5", " 7"]:
    try:
        sonuc = int(m)
    except ValueError:
        sonuc = "dönüştürülemez"
    print(f"{m!r:6} isdecimal={m.isdecimal()!s:5} isdigit={m.isdigit()!s:5} int: {sonuc}")</pre>

<h2>Doğrulama döngüsü: doğru girene kadar sor</h2>
<p>Kullanıcıya bir kez sorup hatalı girdide programı çökertmek kabul edilemez. Standart kalıp: <code>while True</code> ile sonsuz döngü kur, <code>try</code> içinde dönüştür, aralık gibi iş kurallarını kontrol et, her şey yolundaysa <code>break</code> ile çık. Hata mesajı neyin yanlış olduğunu ve ne beklendiğini söylemeli.</p>
<pre class="code">while True:
    metin = input("Adet (1-99): ")
    try:
        adet = int(metin)
    except ValueError:
        print("Lütfen tam sayı gir.")
        continue
    if 1 &lt;= adet &lt;= 99:
        break
    print("1 ile 99 arasında olmalı.")
print("Sepete", adet, "adet eklendi.")</pre>
<p>Tarayıcıda aynı mantığı, kullanıcının sırayla yazdığı değerleri bir listeden alarak çalıştırabilirsin:</p>
<pre class="py">girdiler = iter(["on iki", "0", "150", "12"])   # kullanıcının sırayla yazdıkları

def sor(istem):
    deger = next(girdiler)
    print(istem + deger)
    return deger

while True:
    metin = sor("Adet (1-99): ")
    try:
        adet = int(metin)
    except ValueError:
        print("Lütfen tam sayı gir.")
        continue
    if 1 &lt;= adet &lt;= 99:
        break
    print("1 ile 99 arasında olmalı.")
print("Sepete", adet, "adet eklendi.")</pre>
<div class="tip"><b>Deneme hakkı sınırı koy</b>Otomatik testlerde ya da boru hattında (stdin bir dosyadan gelirken) sonsuz döngü programı kilitleyebilir. <code>for deneme in range(3):</code> ile hak sınırı koyup döngü sonunda <code>else:</code> bloğunda "çok fazla hatalı deneme" diyerek çıkmak daha sağlamdır. Girdi bittiğinde <code>input()</code> EOFError fırlatır; onu da yakalayabilirsin.</div>

<h2>Bir satırda birden fazla değer</h2>
<p>Kullanıcı "1,75 70" ya da "120 85 140" gibi birden fazla değeri tek satıra yazabilir. <code>split()</code> argümansız çağrılınca her türlü boşlukta böler ve fazla boşlukları yok sayar; ardından her parçayı dönüştürürsün.</p>
<pre class="py">satir = "  120   85 140 "               # input("Satışlar: ") sonucu gibi
sayilar = [int(p) for p in satir.split()]
print(sayilar, sum(sayilar))

en, boy = map(int, "40x60".split("x"))   # tam iki parça bekler
print(en * boy, "cm²")

try:
    a, b = "1 2 3".split()
except ValueError as e:
    print("Beklenenden fazla değer:", e)</pre>
<p>Açma (unpacking) ile <code>a, b = ...</code> yazdığında parça sayısı tutmazsa ValueError alırsın; bu da bir doğrulama fırsatıdır.</p>

<h2>Varsayılan değer: Enter'a basılırsa</h2>
<p>Komut satırı araçlarında yaygın bir kibarlık: köşeli parantezde varsayılanı gösterip boş bırakılırsa onu kullanmak. <code>or</code> operatörü boş metni yanlış saydığı için tek satırda çözülür.</p>
<pre class="py">girilen_sehir = ""          # kullanıcı yalnız Enter'a bastı
girilen_gun = " 30 "
sehir = girilen_sehir.strip() or "İstanbul"
gun = int(girilen_gun.strip() or "7")
print(f"Rapor: {sehir}, {gun} gün")</pre>

<div class="note"><b>Gerçek işte</b>Anadolu Bank şubelerinde kullanılan eski bir terminal uygulaması, gişe görevlisinin girdiği tutarı <code>float(input())</code> ile okuyordu. "1.500" yazan görevli 1,5 TL'lik işlem yaptı; "1500,00" yazan ise ValueError ile ekranı kilitledi. Yeni sürümde girdi katmanı üç kurala bağlandı: Türkçe biçim ayrıştırıcı (binlik nokta, ondalık virgül), aralık kontrolü (0 &lt; tutar ≤ günlük limit) ve büyük tutarlarda "1.500,00 TL onaylıyor musunuz? (e/h)" teyidi. Aynı ilkeler web formlarında da geçerlidir: istemci tarafı kontrol yetmez, sunucu girdiyi her zaman yeniden doğrular.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Asla eval(input()) yazma</h3>
<p>Eski öğreticilerde "sayı ya da liste girsin diye" <code>eval(input())</code> görürsün. <code>eval</code> metni Python kodu olarak çalıştırır; kullanıcı <code>__import__("os").remove("veri.db")</code> yazarsa onu da çalıştırır. Bir metni Python değerine (sayı, liste, sözlük) güvenle çevirmek için <code>ast.literal_eval</code> kullan; yalnız sabit değerleri kabul eder. JSON biçimindeki girdiler için <code>json.loads</code> daha da uygundur.</p>
<h3>Girdi katmanını ayır</h3>
<p>İş mantığını <code>input()</code> çağrılarıyla karıştırma. "Metni al → dönüştür → doğrula" işini saf fonksiyonlara (<code>tr_float</code>, <code>evet_mi</code>, <code>adet_dogrula</code>) koy; <code>input()</code> yalnızca en dış katmanda kalsın. Böylece aynı fonksiyonları komut satırında, web formunda ve CSV içe aktarmada yeniden kullanır, input olmadan test edersin.</p>
<h3>Etkileşimsiz girdi: stdin</h3>
<p>Sunucuda çalışan betiklerin karşısında insan yoktur; girdi bir dosyadan ya da başka programdan boru ile gelir (<code>python sayim.py &lt; sayim.txt</code>). Bu durumda <code>input()</code> her satırı okur ve dosya bitince EOFError fırlatır. Satır satır işlemek için <code>for satir in sys.stdin:</code> kalıbı daha uygundur. Terminal dersinde stdin'i ve yönlendirmeyi görmüştün.</p>
<h3>Parola girişi</h3>
<p>Parola gibi gizli bilgiler <code>input()</code> ile alınmaz; ekranda görünür. Standart kütüphanedeki <code>getpass.getpass("Parola: ")</code> yazılanı göstermez (kendi terminalinde dene).</p>
</section>
`,
  ex: [
    { t: 'mc',
      stage: 'Isınma',
      q: '<code>yas = input("Yaş: ")</code> satırında kullanıcı <code>30</code> yazdı. <code>type(yas)</code> nedir?',
      o: ['int', 'float', 'str', 'Kullanıcının yazdığına göre değişir'],
      a: 2,
      why: 'input() ne yazılırsa yazılsın her zaman str döndürür. Sayı olarak kullanmak için int(yas) ile açıkça dönüştürmen gerekir.' },
    { t: 'mc',
      stage: 'Isınma',
      q: 'Kullanıcı "Onaylıyor musun?" sorusuna <code>False</code> yazdı. <code>onay = bool(input(...))</code> sonrası <code>onay</code> nedir?',
      o: ['False', 'True', 'None', 'ValueError'],
      a: 1,
      why: 'bool() metnin içeriğine değil boş olup olmadığına bakar; "False" boş olmayan bir metin olduğu için True\'dur. Evet/hayır cevabını kendin yorumlamalısın.' },
    { t: 'mc',
      stage: 'Isınma',
      q: 'Hangisi <code>ValueError</code> fırlatır?',
      o: ['int(" 42 ")', 'int("4.5")', 'float("1e3")', 'int("1_000")'],
      a: 1,
      why: 'int() ondalık noktası içeren metni kabul etmez; önce float\'a çevirmen gerekir. Boşluklar kırpılır, alt çizgi basamak ayırıcısıdır, 1e3 geçerli bir float gösterimidir.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Kullanıcıdan gelen iki değer metin olarak tutuluyor. Bu kod ne yazdırır?',
      code: 'a = "5"\nb = "3"\nprint(a + b, int(a) + int(b), a * 2)\n',
      o: ['8 8 10', '53 8 55', '53 8 10', '8 53 55'],
      a: 1,
      why: 'Metinlerde + birleştirir ("53"), * tekrarlar ("55"). Yalnız int() ile dönüştürülen değerler toplanır: 8.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Bu kod ne yazdırır?',
      code: 'print(int(" 42 "), int(7.9), float("1e3"), bool("0"))\n',
      o: ['42 8 1000.0 False', '42 7 1000.0 True', '42 7 1e3 False', 'ValueError'],
      a: 1,
      why: 'int() boşlukları kırpar; float\'tan int\'e dönüşüm yuvarlamaz, keser (7). "1e3" bilimsel gösterimdir: 1000.0. "0" boş olmayan bir metin olduğu için bool("0") True\'dur.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Bu kod ne yazdırır?',
      code: 'print("²".isdigit(), "²".isdecimal(), "½".isnumeric(), "-5".isdigit())\n',
      o: ['True True True True', 'False False True False', 'True False True False', 'True False False False'],
      a: 2,
      why: 'Üst simge ² bir "digit"tir ama ondalık rakam (decimal) değildir; int("²") de hata verir. ½ yalnız numeric\'tir. Eksi işareti rakam olmadığı için "-5".isdigit() False\'tur.' },
    { t: 'order',
      stage: 'Kodu oku',
      q: '<p>Kullanıcı tam sayı girene kadar soran doğrulama döngüsünün satırlarını sırala. Kullanıcı önce <code>abc</code>, sonra <code>12</code> yazıyor.</p>',
      lines: ['while True:', '    giris = input("Adet: ")', '    try:', '        adet = int(giris)', '        break', '    except ValueError:', '        print("Sayı gir!")', 'print("Tamam:", adet)'],
      stdin: ['abc', '12'],
      expect: 'Adet: abc\nSayı gir!\nAdet: 12\nTamam: 12\n',
      hint: 'break yalnızca dönüşüm başarılı olduktan sonra çalışmalı; hata mesajı except bloğunda.',
      why: 'Dönüşüm try içinde denenir; başarılıysa hemen sonraki break döngüden çıkar. ValueError olursa break atlanır, mesaj yazılır ve döngü baştan sorar.' },
    { t: 'code',
      id: 'girdi-donusum-1',
      stage: 'Rehberli',
      diff: 1,
      q: '<p>Kullanıcıdan önce adını (<code>"Ad: "</code>), sonra yaşını (<code>"Yaş: "</code>) iste. Ardından <code>Ayşe, 5 yıl sonra 35 yaşında olacaksın.</code> biçiminde bir cümle yazdır. İstem metinlerini aynen kullan.</p>',
      guide: ['input("Ad: ") ile adı al.', 'input("Yaş: ") ile yaşı al ve int() ile tam sayıya çevir.', '5 ekleyerek yeni yaşı hesapla.', 'f-string ile cümleyi yazdır.'],
      example: 'urun = "Çay"      # input("Ürün: ") gibi\nadet = int("3")    # int(input("Adet: ")) gibi\nprint(f"{urun} x {adet * 2} (çift paket)")\n',
      start: 'ad = input("Ad: ")\nyas = input("Yaş: ")   # TODO: sayıya çevir\n# TODO: 5 yıl sonraki yaşı hesapla ve cümleyi yazdır\nprint(ad, yas + 5)\n',
      sol: 'ad = input("Ad: ")\nyas = int(input("Yaş: "))\nprint(f"{ad}, 5 yıl sonra {yas + 5} yaşında olacaksın.")\n',
      stdin: ['Ayşe', '30'],
      expect: 'Ad: Ayşe\nYaş: 30\nAyşe, 5 yıl sonra 35 yaşında olacaksın.\n',
      hints: ['input her zaman str döndürür; "30" + 5 TypeError verir.', 'int(input("Yaş: ")) ile alırken dönüştürebilirsin.', 'print(f"{ad}, 5 yıl sonra {yas + 5} yaşında olacaksın.")'],
      why: 'Girdiyi alır almaz doğru türe çevirmek, sonraki satırlarda tür hatası riskini ortadan kaldırır. İstem metinleri çıktının parçası olduğu için aynen yazılmalı.' },
    { t: 'code',
      id: 'girdi-donusum-2',
      stage: 'Rehberli',
      diff: 2,
      q: '<p>Kasada fiyatlar Türkçe biçimde giriliyor: <code>12,5</code>, <code>1.234,50</code>, <code>99</code>. Önce <code>tr_float(metin)</code> fonksiyonunu yaz: boşlukları sil; metinde virgül varsa binlik noktalarını kaldırıp virgülü noktaya çevir; float döndür. Sonra programda <code>"Fiyat: "</code> ve <code>"Adet: "</code> sor, toplamı <code>Toplam: 2469.00 TL</code> biçiminde (2 ondalık) yazdır.</p>',
      guide: ['tr_float içinde metni strip() et ve içindeki boşlukları sil.', '"," in temiz ise önce "." → "", sonra "," → "." değiştir.', 'float(temiz) döndür.', 'Programda fiyatı tr_float ile, adedi int ile oku ve toplamı :.2f ile yazdır.'],
      example: 'def yuzde_oku(metin):\n    # "%18" ya da "18 %" -> 0.18\n    temiz = metin.replace("%", "").strip()\n    return float(temiz) / 100\n\nprint(yuzde_oku("%18"), yuzde_oku(" 8 % "))\n',
      start: 'def tr_float(metin):\n    temiz = metin.strip()\n    # TODO: boşlukları sil, Türkçe biçimi Python biçimine çevir\n    return float(temiz)\n\nfiyat = tr_float(input("Fiyat: "))\nadet = int(input("Adet: "))\n# TODO: toplamı 2 ondalıkla yazdır\n',
      sol: 'def tr_float(metin):\n    temiz = metin.strip().replace(" ", "")\n    if "," in temiz:\n        temiz = temiz.replace(".", "").replace(",", ".")\n    return float(temiz)\n\nfiyat = tr_float(input("Fiyat: "))\nadet = int(input("Adet: "))\nprint(f"Toplam: {fiyat * adet:.2f} TL")\n',
      stdin: ['1.234,50', '2'],
      expect: 'Fiyat: 1.234,50\nAdet: 2\nToplam: 2469.00 TL\n',
      tests: 'assert tr_float("12,5") == 12.5, "12,5 -> 12.5"\nassert tr_float("1.234,56") == 1234.56, "Binlik nokta silinmeli: 1.234,56 -> 1234.56"\nassert tr_float(" 99 ") == 99.0, "Boşluklar kırpılmalı"\nassert tr_float("3.75") == 3.75, "Virgül yoksa nokta ondalık sayılır"\nassert tr_float("1 250,00") == 1250.0, "Aradaki boşluk da silinmeli"\n',
      hints: ['Sıra önemli: önce binlik noktaları sil, sonra virgülü noktaya çevir.', 'Virgül yoksa metne dokunma: "3.75" zaten Python biçiminde.', 'Yazdırma: print(f"Toplam: {fiyat * adet:.2f} TL")'],
      why: 'Türkçe sayı biçiminde nokta binlik, virgül ondalık ayırıcıdır; Python\'da tersi. Virgül varsa metnin Türkçe biçimde olduğu anlaşılır ve ayırıcılar dönüştürülür. Dönüşümü fonksiyona ayırmak onu input olmadan test etmeyi sağlar.' },
    { t: 'code',
      id: 'girdi-donusum-3',
      stage: 'Rehberli',
      diff: 2,
      q: '<p>Sepete ürün eklerken adet <b>1 ile 99 arasında tam sayı</b> olmalı. Kullanıcıya <code>"Adet (1-99): "</code> diye sor. Tam sayı değilse <code>Lütfen tam sayı gir.</code>, aralık dışındaysa <code>1 ile 99 arasında olmalı.</code> yazıp tekrar sor. Geçerli değer gelince <code>Sepete 12 adet eklendi.</code> yazdır.</p>',
      guide: ['while True ile sonsuz döngü kur.', 'try içinde int(input(...)) dene; except ValueError içinde mesaj yaz ve continue.', 'Aralık doğruysa break ile çık; değilse aralık mesajını yaz.', 'Döngüden sonra sonucu yazdır.'],
      example: 'denemeler = iter(["x", "-2", "7"])\nwhile True:\n    s = next(denemeler)\n    try:\n        n = int(s)\n    except ValueError:\n        print("sayı değil:", s)\n        continue\n    if n > 0:\n        break\n    print("pozitif olmalı:", n)\nprint("kabul:", n)\n',
      start: 'while True:\n    metin = input("Adet (1-99): ")\n    # TODO: int\'e çevirmeyi dene; olmazsa mesaj + continue\n    adet = int(metin)\n    # TODO: aralık kontrolü; uygunsa break\n    break\nprint(f"Sepete {adet} adet eklendi.")\n',
      sol: 'while True:\n    metin = input("Adet (1-99): ")\n    try:\n        adet = int(metin)\n    except ValueError:\n        print("Lütfen tam sayı gir.")\n        continue\n    if 1 <= adet <= 99:\n        break\n    print("1 ile 99 arasında olmalı.")\nprint(f"Sepete {adet} adet eklendi.")\n',
      stdin: ['on iki', '0', '150', '2.5', '12'],
      expect: 'Adet (1-99): on iki\nLütfen tam sayı gir.\nAdet (1-99): 0\n1 ile 99 arasında olmalı.\nAdet (1-99): 150\n1 ile 99 arasında olmalı.\nAdet (1-99): 2.5\nLütfen tam sayı gir.\nAdet (1-99): 12\nSepete 12 adet eklendi.\n',
      hints: ['Dönüşüm hatası ile iş kuralı hatası ayrı mesajlar alıyor: önce try/except, sonra if.', 'continue döngünün başına döner; break döngüden çıkar.', 'if 1 <= adet <= 99: break'],
      why: 'Doğrulama döngüsünün iki katmanı vardır: biçim (int\'e dönüşüyor mu?) ve iş kuralı (aralıkta mı?). Her birine ayrı ve yol gösterici mesaj vermek kullanıcının neyi düzelteceğini anlamasını sağlar.' },
    { t: 'code',
      id: 'girdi-donusum-4',
      stage: 'Rehberli',
      diff: 1,
      q: '<p>Mağaza müdürü son üç günün satış adetlerini <b>tek satırda boşlukla ayırarak</b> giriyor. <code>"Üç günün satışı: "</code> diye sor, değerleri tam sayıya çevir ve <code>Toplam: 345 | Ortalama: 115.0</code> biçiminde yazdır. Kullanıcı fazladan boşluk bırakabilir.</p>',
      guide: ['Satırı input ile al.', 'split() ile parçala (argümansız: fazla boşlukları yok sayar).', 'Her parçayı int\'e çevirip bir listeye koy (comprehension ya da map).', 'sum ve len ile toplam ve ortalamayı hesaplayıp yazdır.'],
      example: 'satir = " 3  4 5 "     # input sonucu gibi\nkenarlar = [int(p) for p in satir.split()]\nprint(kenarlar, "çevre:", sum(kenarlar))\n',
      start: 'satir = input("Üç günün satışı: ")\n# TODO: parçala ve int listesine çevir\nsayilar = satir.split(" ")\nprint(f"Toplam: {sum(sayilar)} | Ortalama: {sum(sayilar) / len(sayilar)}")\n',
      sol: 'satir = input("Üç günün satışı: ")\nsayilar = [int(p) for p in satir.split()]\nprint(f"Toplam: {sum(sayilar)} | Ortalama: {sum(sayilar) / len(sayilar)}")\n',
      stdin: ['120  85 140 '],
      expect: 'Üç günün satışı: 120  85 140 \nToplam: 345 | Ortalama: 115.0\n',
      hints: ['split(" ") ardışık boşluklarda boş parçalar üretir; split() üretmez.', 'Parçalar str\'dir; sum için int\'e çevir.', 'sayilar = [int(p) for p in satir.split()]'],
      why: 'split() argümansızken her türlü boşluk dizisini tek ayırıcı sayar ve baştaki/sondaki boşlukları yok sayar; kullanıcı girdisi için en güvenli bölme yoludur. Ardından her parçayı ayrı ayrı dönüştürmek gerekir.' },
    { t: 'code',
      id: 'girdi-donusum-5',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p><code>evet_mi(cevap)</code> fonksiyonu yaz: baş/son boşluk ve büyük/küçük harf fark etmeksizin <code>e, evet, y, yes</code> için <code>True</code>; <code>h, hayır, hayir, n, no</code> için <code>False</code>; diğer her şey için <code>None</code> döndürsün (Türkçe büyük harf için <code>"HAYIR"</code> da hayır sayılmalı). Sonra programda <code>"Fatura e-posta ile gönderilsin mi? (e/h): "</code> diye sor; anlaşılmayan cevapta <code>Lütfen e ya da h yaz.</code> deyip tekrar sor. Sonuçta <code>E-posta: açık</code> ya da <code>E-posta: kapalı</code> yazdır.</p>',
      start: 'def evet_mi(cevap):\n    pass\n',
      sol: 'EVET = {"e", "evet", "y", "yes"}\nHAYIR = {"h", "hayır", "hayir", "n", "no"}\n\ndef evet_mi(cevap):\n    c = cevap.strip().replace("I", "ı").replace("İ", "i").lower()\n    if c in EVET:\n        return True\n    if c in HAYIR:\n        return False\n    return None\n\nwhile True:\n    sonuc = evet_mi(input("Fatura e-posta ile gönderilsin mi? (e/h): "))\n    if sonuc is not None:\n        break\n    print("Lütfen e ya da h yaz.")\nprint("E-posta:", "açık" if sonuc else "kapalı")\n',
      stdin: ['belki', '', ' HAYIR '],
      expect: 'Fatura e-posta ile gönderilsin mi? (e/h): belki\nLütfen e ya da h yaz.\nFatura e-posta ile gönderilsin mi? (e/h): \nLütfen e ya da h yaz.\nFatura e-posta ile gönderilsin mi? (e/h):  HAYIR \nE-posta: kapalı\n',
      tests: 'assert evet_mi(" Evet ") is True, "Boşluk ve büyük harf fark etmemeli"\nassert evet_mi("Y") is True, "Y evet sayılır"\nassert evet_mi("HAYIR") is False, "HAYIR hayır sayılmalı"\nassert evet_mi("no") is False, "no hayır sayılır"\nassert evet_mi("False") is None, "Tanınmayan cevap None olmalı; bool(\'False\') tuzağına düşme"\nassert evet_mi("") is None, "Boş cevap None"\n',
      hints: ['Cevabı normalleştir: strip + Türkçe küçültme (I → ı).', 'Kümeye hem "hayır" hem "hayir" koy: "HAYIR".lower() noktalı i ile "hayir", Türkçe küçültme ise "hayır" verir.', 'Döngüde None kontrolü için is not None kullan; False da geçerli bir cevaptır.'],
      why: 'Üç değerli sonuç (True/False/None) "anlaşılmadı" durumunu ayırt eder. Döngüde "if sonuc:" yazmak hayır cevabını da reddederdi; bu yüzden is not None gerekir. Türkçe I harfi yine özel ilgi ister.' },
    { t: 'code',
      id: 'girdi-donusum-6',
      stage: 'Kendin yaz',
      diff: 1,
      q: '<p>Rapor aracı iki soru soruyor ve köşeli parantezde varsayılanı gösteriyor: <code>"Şehir [İstanbul]: "</code> ve <code>"Gün [7]: "</code>. Kullanıcı yalnızca Enter\'a basarsa (ya da sadece boşluk yazarsa) varsayılan kullanılsın. Gün tam sayı olmalı. Sonuçta <code>Rapor: İstanbul, 30 gün</code> biçiminde yazdır.</p>',
      start: '# Şehir ve gün iste; boşsa varsayılanı kullan\n',
      sol: 'sehir = input("Şehir [İstanbul]: ").strip() or "İstanbul"\ngun = int(input("Gün [7]: ").strip() or "7")\nprint(f"Rapor: {sehir}, {gun} gün")\n',
      stdin: ['', ' 30 '],
      expect: 'Şehir [İstanbul]: \nGün [7]:  30 \nRapor: İstanbul, 30 gün\n',
      hints: ['Boş metin falsy\'dir: metin or "varsayılan".', 'Önce strip(): yalnız boşluk yazan kullanıcı da Enter\'a basmış sayılır.', 'gun = int(input("Gün [7]: ").strip() or "7")'],
      why: 'strip() + or kalıbı varsayılan değeri tek satırda verir. Varsayılanı metin olarak ("7") verip dönüşümü sona bırakmak, iki yolun da aynı int() çağrısından geçmesini sağlar.' },
    { t: 'code',
      id: 'girdi-donusum-7',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p>Sağlık randevu sistemi cep telefonunu her biçimde kabul etmeli: <code>0532 111 22 33</code>, <code>+90 (532) 111-22-33</code>, <code>5321112233</code>. <code>telefon_temizle(metin)</code> fonksiyonu boşluk, tire ve parantezleri silsin; başta <code>+90</code> ya da <code>0</code> varsa atsın; kalan metin <b>tam 10 haneli</b>, yalnız rakamlardan oluşan (<code>isdecimal</code>) ve <b>5</b> ile başlayan bir metinse onu, değilse <code>None</code> döndürsün. Programda <code>"Cep telefonu: "</code> diye geçerli numara gelene kadar sor (geçersizde <code>Geçersiz numara.</code>), sonunda <code>Kayıt: 5321112233</code> yazdır.</p>',
      start: 'def telefon_temizle(metin):\n    pass\n',
      sol: 'def telefon_temizle(metin):\n    t = metin\n    for isaret in " -()":\n        t = t.replace(isaret, "")\n    if t.startswith("+90"):\n        t = t[3:]\n    elif t.startswith("0"):\n        t = t[1:]\n    if len(t) == 10 and t.isdecimal() and t.startswith("5"):\n        return t\n    return None\n\nwhile (tel := telefon_temizle(input("Cep telefonu: "))) is None:\n    print("Geçersiz numara.")\nprint("Kayıt:", tel)\n',
      stdin: ['0532 abc', '0212 444 55 66', '+90 (532) 111-22-33'],
      expect: 'Cep telefonu: 0532 abc\nGeçersiz numara.\nCep telefonu: 0212 444 55 66\nGeçersiz numara.\nCep telefonu: +90 (532) 111-22-33\nKayıt: 5321112233\n',
      tests: 'assert telefon_temizle("0532 111 22 33") == "5321112233", "Baştaki 0 ve boşluklar silinmeli"\nassert telefon_temizle("5321112233") == "5321112233", "Zaten temiz numara"\nassert telefon_temizle("+90 (532) 111-22-33") == "5321112233", "+90, parantez ve tire silinmeli"\nassert telefon_temizle("0212 444 55 66") is None, "5 ile başlamayan sabit hat reddedilmeli"\nassert telefon_temizle("0532 111 22 3") is None, "9 hane geçersiz"\nassert telefon_temizle("0532 111 22 3²") is None, "Üst simge ² rakam değil: isdigit değil isdecimal kullan"\n',
      hints: ['Silinecek karakterleri bir döngüyle replace et.', 'startswith("+90") kontrolünü startswith("0")\'dan önce yap.', '"²".isdigit() True\'dur ama int\'e çevrilemez; isdecimal() False döner.'],
      why: 'Girdiyi önce normalleştirip (gereksiz işaretleri silmek, ülke kodunu atmak) sonra kurallarla doğrulamak, kullanıcıyı tek bir biçime zorlamadan veriyi tutarlı saklamayı sağlar. isdecimal yalnız gerçek ondalık rakamları kabul eder.' },
    { t: 'code',
      id: 'girdi-donusum-8',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p>Ayar dosyasından ya da formdan gelen metin değerleri otomatik olarak doğru türe çevir. <code>otomatik_donustur(metin)</code> önce baştaki/sondaki boşlukları kırpsın, sonra sırayla:</p><ul><li>Boş metin → <code>None</code></li><li><code>evet/true</code> → <code>True</code>, <code>hayır/hayir/false</code> → <code>False</code> (büyük/küçük harf duyarsız; <code>"HAYIR"</code> da dahil)</li><li>Tam sayıya dönüşebiliyorsa → <code>int</code> (<code>"-12"</code> dahil)</li><li>Ondalık sayıya dönüşebiliyorsa → <code>float</code>; virgüllü <code>"3,5"</code> de kabul (yalnız tek virgül, nokta yokken)</li><li>Diğer her şey → kırpılmış <code>str</code>. <code>"nan"</code> ve <code>"inf"</code> sayı değil, metin kalsın.</li></ul>',
      start: 'def otomatik_donustur(metin):\n    pass\n',
      sol: 'def otomatik_donustur(metin):\n    m = metin.strip()\n    if m == "":\n        return None\n    k = m.replace("I", "ı").replace("İ", "i").lower()\n    if k in ("evet", "true"):\n        return True\n    if k in ("hayır", "hayir", "false"):\n        return False\n    try:\n        return int(m)\n    except ValueError:\n        pass\n    aday = m.replace(",", ".") if (m.count(",") == 1 and "." not in m) else m\n    if m.lower().lstrip("+-") in ("nan", "inf", "infinity"):\n        return m\n    try:\n        return float(aday)\n    except ValueError:\n        return m\n',
      tests: 'assert otomatik_donustur("  ") is None, "Boş -> None"\nassert otomatik_donustur("Evet") is True and otomatik_donustur("TRUE") is True, "evet/true -> True"\nassert otomatik_donustur("HAYIR") is False and otomatik_donustur("false") is False, "hayır/false -> False"\nr = otomatik_donustur(" -12 ")\nassert r == -12 and type(r) is int, "-12 int olmalı"\nr = otomatik_donustur("3,5")\nassert r == 3.5 and type(r) is float, "3,5 -> 3.5"\nassert otomatik_donustur("2.75") == 2.75, "2.75 -> float"\nassert otomatik_donustur("1,2,3") == "1,2,3", "Birden fazla virgül sayı değil"\nassert otomatik_donustur("nan") == "nan" and otomatik_donustur("Inf") == "Inf", "nan/inf metin kalmalı"\nassert otomatik_donustur(" Anadolu ") == "Anadolu", "Metin kırpılarak dönmeli"\nassert otomatik_donustur("0") == 0 and otomatik_donustur("0") is not False, "0 bool değil int olmalı"\n',
      hints: ['Sıra önemli: önce None, sonra bool kelimeleri, sonra int, en son float.', 'int denemesi try/except ValueError ile; başarısızsa float\'a geç.', 'float("nan") ve float("inf") hata vermez; bu kelimeleri float denemesinden önce ayıkla.'],
      why: 'Tür çıkarımı dar türden genişe doğru denenir: int, float\'tan önce gelmeli yoksa "12" 12.0 olur. float() fonksiyonunun nan/inf gibi sürpriz kabulleri açıkça dışlanmalıdır; bu tür ayrıntılar CSV ve form içe aktarımında sessiz veri hatalarına yol açar.' },
    { t: 'code',
      id: 'girdi-donusum-9',
      stage: 'Hata avı',
      kind: 'bug',
      diff: 1,
      q: '<p><b>Hatayı bul ve düzelt.</b> Program iki tutar soruyor (<code>"Tutar 1: "</code>, <code>"Tutar 2: "</code>) ve toplamını <code>Toplam: 200.00 TL</code> biçiminde yazdırmalı. Kullanıcılar ondalık için virgül kullanıyor (<code>120,5</code>). Mevcut program yanlış sonuç veriyor ya da çöküyor.</p>',
      start: 't1 = input("Tutar 1: ")\nt2 = input("Tutar 2: ")\ntoplam = t1 + t2\nprint(f"Toplam: {toplam} TL")\n',
      sol: 't1 = float(input("Tutar 1: ").replace(",", "."))\nt2 = float(input("Tutar 2: ").replace(",", "."))\ntoplam = t1 + t2\nprint(f"Toplam: {toplam:.2f} TL")\n',
      stdin: ['120,5', '79,5'],
      expect: 'Tutar 1: 120,5\nTutar 2: 79,5\nToplam: 200.00 TL\n',
      hints: ['input str döndürür; + iki metni birleştirir.', 'float("120,5") ValueError verir: önce virgülü noktaya çevir.', 'Biçim: {toplam:.2f}'],
      why: 'Üç hata vardı: metin birleştirme (dönüşüm yok), Türkçe ondalık virgül ve biçimlendirme. Girdiyi alırken hemen temizleyip dönüştürmek, hatayı kaynağında çözer.' },
    { t: 'code',
      id: 'girdi-donusum-10',
      stage: 'Hata avı',
      kind: 'bug',
      diff: 1,
      q: '<p><b>Hatayı bul ve düzelt.</b> İK kayıt formu yaş soruyor: <code>"Yaş: "</code>. Yalnızca rakamlardan oluşan girdi kabul edilmeli; aksi hâlde <code>Geçersiz yaş.</code> yazıp tekrar sorulmalı. Sonunda <code>Kayıt: 34 yaş</code> yazdırılmalı. Mevcut kod ilk hatalı girdide çöküyor.</p>',
      start: 'while True:\n    yas = input("Yaş: ")\n    if yas.isdigit:\n        yas = int(yas)\n        break\n    print("Geçersiz yaş.")\nprint("Kayıt:", yas, "yaş")\n',
      sol: 'while True:\n    yas = input("Yaş: ")\n    if yas.isdecimal():\n        yas = int(yas)\n        break\n    print("Geçersiz yaş.")\nprint("Kayıt:", yas, "yaş")\n',
      stdin: ['otuz', '-3', '34'],
      expect: 'Yaş: otuz\nGeçersiz yaş.\nYaş: -3\nGeçersiz yaş.\nYaş: 34\nKayıt: 34 yaş\n',
      hints: ['yas.isdigit metodu çağırmaz, metodun kendisini verir; fonksiyon nesneleri her zaman truthy\'dir.', 'Parantez ekle: yas.isdigit() — ya da daha güvenlisi isdecimal().', 'if yas.isdecimal():'],
      why: 'Parantezsiz metot adı bir "bound method" nesnesidir ve if içinde her zaman True sayılır; bu yüzden int("otuz") çalışıp çöküyordu. isdecimal() ayrıca ² gibi int\'e çevrilemeyen karakterleri de reddeder.' },
    { t: 'code',
      id: 'girdi-donusum-11',
      stage: 'Meydan okuma',
      diff: 3,
      q: '<p>Depo sayım terminali: görevli her satıra <code>ürün;adet;birim fiyat</code> yazıyor, boş satırla bitiriyor. İstem: <code>"Kalem: "</code>. Kurallar:</p><ul><li>Tam 3 parça olmalı; değilse <code>Atlandı: 3 alan gerekli</code></li><li>Ürün adı kırpılmış hâliyle boş olmamalı; değilse <code>Atlandı: ürün adı boş</code></li><li>Adet pozitif tam sayı (<code>isdecimal</code> ve &gt; 0); değilse <code>Atlandı: adet geçersiz</code></li><li>Fiyat Türkçe biçimde olabilir (<code>1.250,75</code>, <code>12,5</code>, <code>40</code>) ve &gt; 0 olmalı; değilse <code>Atlandı: fiyat geçersiz</code></li><li>Geçerli satırda <code>Eklendi: &lt;ürün&gt; x&lt;adet&gt;</code> yaz.</li></ul><p>Boş satırdan sonra <code>Kalem sayısı: N</code> ve <code>Genel toplam: 1.234,50 TL</code> (Türkçe biçim: binlik nokta, ondalık virgül, 2 hane) yazdır.</p>',
      start: '# Boş satır gelene kadar Kalem: sor\n',
      sol: 'def tr_float(metin):\n    t = metin.strip().replace(" ", "")\n    if "," in t:\n        t = t.replace(".", "").replace(",", ".")\n    return float(t)\n\ndef tr_para(x):\n    s = f"{x:,.2f}"\n    return s.replace(",", "_").replace(".", ",").replace("_", ".")\n\nkalem = 0\ntoplam = 0.0\nwhile (satir := input("Kalem: ").strip()) != "":\n    parcalar = satir.split(";")\n    if len(parcalar) != 3:\n        print("Atlandı: 3 alan gerekli")\n        continue\n    urun, adet_m, fiyat_m = (p.strip() for p in parcalar)\n    if not urun:\n        print("Atlandı: ürün adı boş")\n        continue\n    if not adet_m.isdecimal() or int(adet_m) == 0:\n        print("Atlandı: adet geçersiz")\n        continue\n    try:\n        fiyat = tr_float(fiyat_m)\n    except ValueError:\n        fiyat = 0\n    if not fiyat > 0 or fiyat == float("inf"):\n        print("Atlandı: fiyat geçersiz")\n        continue\n    adet = int(adet_m)\n    kalem += 1\n    toplam += adet * fiyat\n    print(f"Eklendi: {urun} x{adet}")\nprint("Kalem sayısı:", kalem)\nprint(f"Genel toplam: {tr_para(toplam)} TL")\n',
      stdin: ['Çay 1 kg;3;89,90', 'Şeker;iki;40', 'Un;5', ' ;2;10', 'Zeytinyağı 5 L; 2 ;1.250,75', 'Pirinç;4;-15', 'Makarna;0;12', 'Kahve;1;abc', 'Tuz;10;7,5', ''],
      expect: 'Kalem: Çay 1 kg;3;89,90\nEklendi: Çay 1 kg x3\nKalem: Şeker;iki;40\nAtlandı: adet geçersiz\nKalem: Un;5\nAtlandı: 3 alan gerekli\nKalem:  ;2;10\nAtlandı: ürün adı boş\nKalem: Zeytinyağı 5 L; 2 ;1.250,75\nEklendi: Zeytinyağı 5 L x2\nKalem: Pirinç;4;-15\nAtlandı: fiyat geçersiz\nKalem: Makarna;0;12\nAtlandı: adet geçersiz\nKalem: Kahve;1;abc\nAtlandı: fiyat geçersiz\nKalem: Tuz;10;7,5\nEklendi: Tuz x10\nKalem: \nKalem sayısı: 3\nGenel toplam: 2.846,20 TL\n',
      hints: ['Döngü koşulu: boş satır gelene kadar. Mors operatörü ile while (satir := input(...).strip()) != "" kısa yazılır.', 'Her doğrulama başarısızlığında mesaj + continue; sıra: alan sayısı, ürün, adet, fiyat.', 'Türkçe para biçimi: f"{x:,.2f}" İngilizce biçim verir (2,846.20); virgül ve noktayı bir geçici karakter üzerinden yer değiştir.'],
      why: 'Gerçek girdi katmanı: satır satır oku, her alanı ayrı doğrula, hatalı satırı nedeniyle raporla ama işlemi durdurma. Dönüşüm (tr_float) ve biçimlendirme (tr_para) yardımcıları saf fonksiyonlar olarak ayrı tutulur. f"{x:,.2f}" ile üretilen İngilizce biçimi Türkçe biçime çevirmek için geçici bir karakter kullanmak, iki ayırıcının birbirini ezmesini önler.' }
  ],
  faq: [
    { q: 'input() ile gelen sayıyı her seferinde int() ile mi sarmalıyım?',
      a: 'Evet, ama tek bir yerde. En iyi kalıp girdiyi alır almaz dönüştürmek ve doğrulamaktır: <code>adet = adet_oku("Adet: ")</code> gibi bir yardımcı fonksiyon yaz; içinde döngü, try/except ve aralık kontrolü olsun. Programın geri kalanı hep doğru türde değerle çalışır.' },
    { q: 'isdigit ile kontrol etmek mi, try/except ile denemek mi daha iyi?',
      a: 'Python topluluğu genellikle try/except\'i (EAFP) tercih eder: hem negatif sayıları ve boşlukları doğru işler hem de int()\'in kendi kurallarıyla tutarlıdır. isdecimal() ise "yalnız rakam" gibi daha katı bir iş kuralın varsa (telefon, posta kodu) uygundur. isdigit()\'i int() ön kontrolü için kullanma; ² gibi karakterleri kabul eder.' },
    { q: 'float yerine Decimal ne zaman kullanmalıyım?',
      a: 'Para ve muhasebe tutarlarında. <code>Decimal("12.50")</code> metinden tam olarak oluşturulur ve 0.1 + 0.2 gibi yuvarlama hataları yaşamaz. Kullanıcı girdisini <code>Decimal(tr_metni.replace(",", "."))</code> ile çevirebilirsin; float\'tan Decimal oluşturma, hatayı da taşır.' },
    { q: 'Alıştırmalarda input() nasıl çalışıyor? Klavye yok.',
      a: 'Sistem her alıştırma için önceden belirlenmiş girdileri sırayla verir ve senin istem metnini ve "yazılan" değeri çıktıya ekler (gerçek terminalde de ekranda böyle görünür). Bu yüzden istem metnini görevdeki gibi aynen yazman gerekir. Girdiler biterse input() EOFError fırlatır; doğrulama döngün beklenmedik yerde dönmeye devam ediyorsa bu hatayı görürsün.' }
  ],
  mistakes: [
    { bad: 'yas = input("Yaş: ")\nif yas >= 18:\n    print("Reşit")',
      good: 'yas = int(input("Yaş: "))\nif yas >= 18:\n    print("Reşit")',
      why: 'input str döndürür; str ile int karşılaştırması TypeError verir.' },
    { bad: 'onay = bool(input("Onay (e/h): "))',
      good: 'onay = input("Onay (e/h): ").strip().lower() in ("e", "evet")',
      why: 'bool() yalnız boşluğa bakar; "h" ve "False" dahil her dolu metin True\'dur.' },
    { bad: 'fiyat = float(input("Fiyat: "))   # kullanıcı 12,5 yazar',
      good: 'fiyat = float(input("Fiyat: ").replace(",", "."))',
      why: 'Python ondalık ayırıcı olarak yalnız noktayı kabul eder; Türkçe virgül ValueError verir.' },
    { bad: 'if metin.isdigit:\n    n = int(metin)',
      good: 'if metin.isdecimal():\n    n = int(metin)',
      why: 'Parantezsiz metot adı her zaman truthy\'dir; ayrıca isdigit() int\'e çevrilemeyen ² gibi karakterleri de kabul eder.' },
    { bad: 'deger = eval(input("Sayı: "))',
      good: 'import ast\ndeger = ast.literal_eval(input("Sayı: "))',
      why: 'eval girilen metni kod olarak çalıştırır; güvenlik açığıdır. Değer çözmek için literal_eval ya da doğrudan int/float kullan.' }
  ]
});
})(window);
/* PythonPatika v2/t2 — Operatörler derinlemesine */
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push({
  id: 'operatorler',
  lv: 'temel',
  mod: 'Veri Türleri',
  min: 35,
  title: 'Operatörler derinlemesine',
  sum: 'Aritmetik ve atama, zincirleme karşılaştırma, değer döndüren and/or ve kısa devre, in ve is, izin bayraklarıyla bit operatörleri, PCEP öncelik tablosu ve mors operatörü := ile ifadeleri doğru ve okunur yazarsın.',
  goals: ['Artırılmış atamayı ve // ile % operatörlerini negatif sayılarda doğru kullanabilirim.', 'Zincirleme karşılaştırma yazar, and/or\'un kısa devresini ve döndürdüğü değeri açıklayabilirim.', 'in ile is\'i doğru yerde kullanır, == ile is farkını bilirim.', 'Bit operatörleriyle izin bayraklarını ekler, kaldırır ve denetlerim.', 'Öncelik tablosuna göre bir ifadenin sonucunu çalıştırmadan tahmin eder, gerekirse mors operatörünü kullanırım.'],
  body: `
<h2>Operatör: küçük sembol, büyük sonuç</h2>
<p>Anadolu Market'in sepet ekranında tek bir satır şunu karar verir: "Tutar 500 TL'yi geçiyor <b>ve</b> müşteri premium <b>ya da</b> kampanya kodu girmişse kargo bedava." Bu satırda yanlış yere konmuş bir parantez, binlerce siparişte bedava kargo vermek ya da hiç vermemek demektir. <b>Operatörler</b> (operators), değerler üzerinde işlem yapan sembollerdir: <code>+</code>, <code>==</code>, <code>and</code>, <code>in</code>, <code>&amp;</code>... Sayılar dersinde aritmetiği, koşullar dersinde karşılaştırma ve mantık operatörlerine giriş yaptın. Bu ders bütün operatör ailesini bir arada, <b>öncelik</b> ve <b>değer döndürme</b> ayrıntılarıyla ele alıyor; Python Institute PCEP sınavının en çok soru sorduğu konulardan biridir.</p>

<h2>Aritmetik ve atama operatörleri</h2>
<p>Hatırlatma: <code>+ - * /</code> bildiğin dört işlem, <code>//</code> tam bölme (floor division), <code>%</code> kalan (modulo), <code>**</code> üs alma. <code>/</code> her zaman float döndürür, <code>//</code> iki int arasında int döndürür.</p>
<p><b>Artırılmış atama</b> (augmented assignment) operatörleri "değişkeni kendisiyle işleme sok ve geri yaz" kısaltmasıdır: <code>x += 3</code>, <code>x = x + 3</code> ile aynı sonucu verir. Hepsinin karşılığı vardır: <code>-=</code>, <code>*=</code>, <code>/=</code>, <code>//=</code>, <code>%=</code>, <code>**=</code>, hatta bit operatörleri için <code>&amp;=</code>, <code>|=</code>.</p>
<pre class="py">stok = 120
stok -= 15        # satış
stok += 40        # tedarik geldi
stok //= 2        # yarısı başka depoya
print("Stok:", stok)

puan = 3
puan **= 2
puan %= 5
print("Puan:", puan)

etiket = "AM-"
etiket += "00417"     # metinlerde de çalışır
etiket *= 2
print(etiket)</pre>
<div class="note"><b>Python'da ++ yok</b>C, Java ya da JavaScript'ten gelenler <code>sayac++</code> yazmayı dener. Python'da bu sözdizimi hatasıdır; <code>sayac += 1</code> yaz. <code>++sayac</code> ise hata bile vermez: iki tekli artı işaretidir ve değeri değiştirmez. Sinsi bir tuzaktır.</div>

<h3>// ve % negatif sayılarda</h3>
<p>Python'da <code>//</code> sonucu her zaman <b>aşağıya</b> (eksi sonsuza doğru) yuvarlar; <code>%</code> de bu kurala uyacak şekilde <b>bölenin işaretini</b> alır. Kural her zaman şudur: <code>a == (a // b) * b + a % b</code>.</p>
<pre class="py">print(7 // 2, 7 % 2)       # 3 1
print(-7 // 2, -7 % 2)     # -4 1   (−3.5 aşağıya: −4)
print(7 // -2, 7 % -2)     # -4 -1
print(int(-7 / 2))         # -3     (int sıfıra doğru keser!)

# Pratik fayda: haftanın günlerinde geriye sarma
gunler = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"]
bugun = 1                     # Salı
print("3 gün önce:", gunler[(bugun - 3) % 7])</pre>
<p>C ve Java'da <code>-7 % 2</code> sonucu -1'dir; Python'da 1. Bu fark sayesinde Python'da <code>% 7</code> negatif sayılarda bile geçerli bir indeks verir.</p>

<h2>Karşılaştırma ve zincirleme</h2>
<p><code>==</code>, <code>!=</code>, <code>&lt;</code>, <code>&lt;=</code>, <code>&gt;</code>, <code>&gt;=</code> her zaman <code>True</code> ya da <code>False</code> döndürür. Python'un az dilde bulunan bir güzelliği <b>zincirleme karşılaştırmadır</b> (chained comparison): <code>0 &lt; x &lt; 10</code>, matematikteki gibi okunur ve <code>0 &lt; x and x &lt; 10</code> anlamına gelir; <code>x</code> yalnızca bir kez hesaplanır.</p>
<pre class="py">tutar = 750
print(500 &lt; tutar &lt;= 1000)        # True
print(1 &lt; 3 &gt; 2)                   # True: 1 &lt; 3 and 3 &gt; 2
print(1 == 1.0, "a" &lt; "b", [1, 2] &lt; [1, 3])
print(3 == 3 == 3.0, 1 &lt; 2 &lt; 2)</pre>
<div class="warn"><b>Zincir sezgiye ters düşebilir</b><code>1 &lt; 3 &gt; 2</code> geçerlidir ama okuması zordur; zinciri yalnızca aynı yönde (<code>a &lt; b &lt; c</code>) kullan. <code>x == y == 0</code> "ikisi de sıfır mı" demektir, "x, y==0 sonucuna eşit mi" değil.</div>

<h2>Mantıksal operatörler: and, or, not</h2>
<p><code>and</code> iki koşul da doğruysa, <code>or</code> en az biri doğruysa doğrudur, <code>not</code> tersine çevirir. İki önemli ayrıntı var:</p>
<ol>
<li><b>Kısa devre</b> (short-circuit): <code>and</code> ilk değer yanlışsa ikinciye hiç bakmaz; <code>or</code> ilk değer doğruysa ikinciye bakmaz. Bu sayede <code>adet != 0 and toplam / adet &gt; 100</code> sıfıra bölme hatası vermez.</li>
<li><b>Değer döndürme</b>: <code>and</code> ve <code>or</code> True/False değil, <b>son baktıkları işleneni</b> döndürür. <code>or</code> ilk doğru (truthy) değeri, hepsi yanlışsa sonuncuyu; <code>and</code> ilk yanlış (falsy) değeri, hepsi doğruysa sonuncuyu verir. <code>not</code> ise her zaman bool döndürür.</li>
</ol>
<pre class="py">print("" or "misafir")          # misafir
print("Ayşe" or "misafir")      # Ayşe
print(0 and 1 / 0)              # 0  (1/0 hiç çalışmadı!)
print(5 and "ok")               # ok
print([] or {} or None)         # None (hepsi falsy, sonuncusu)
print(not "", not 42)           # True False

def pahali_kontrol():
    print("  (pahalı kontrol çalıştı)")
    return True

print(False and pahali_kontrol())   # pahalı kontrol hiç çağrılmaz
print(True or pahali_kontrol())</pre>
<p>Bu davranış günlük kodda varsayılan değer vermek için kullanılır: <code>ad = girilen_ad or "Misafir"</code>. Ama dikkat: <code>0</code> ve boş metin de falsy'dir; sayısal değerlerde <code>if x is None</code> kontrolü daha güvenlidir.</p>

<h2>Üyelik ve kimlik: in ve is</h2>
<p><code>in</code> / <code>not in</code> bir değerin koleksiyonda olup olmadığını sorar: metinde alt metin, listede eleman, sözlükte <b>anahtar</b>. <code>is</code> / <code>is not</code> ise iki adın <b>aynı nesneyi</b> gösterip göstermediğini sorar; <code>==</code> ise değerlerin eşitliğini.</p>
<pre class="py">sepet = ["çay", "şeker"]
stok = {"çay": 40, "kahve": 0}
print("çay" in sepet, "kahve" not in sepet)
print("kahve" in stok, 40 in stok)          # sözlükte anahtar aranır
print("AM-" in "AM-00417")

a = [1, 2, 3]
b = a
c = [1, 2, 3]
print(a == c, a is c, a is b)              # True False True
indirim = None
print(indirim is None)                     # None için doğru yol</pre>
<div class="tip"><b>is'i yalnız None (ve True/False) için kullan</b>Küçük tam sayılar ve kısa metinler bellekte önbelleğe alındığından <code>is</code> bazen "tesadüfen" doğru çalışır ve hatayı gizler. Değer karşılaştırması her zaman <code>==</code> ile yapılır. Python 3.8'den beri <code>x is 5</code> gibi bir literalle <code>is</code> karşılaştırması SyntaxWarning üretir.</div>

<h2>Bit operatörleri ve izin bayrakları</h2>
<p>Bilgisayar sayıları ikili (binary) tutar. <b>Bit operatörleri</b> (bitwise operators) sayıların bitleri üzerinde çalışır: <code>&amp;</code> (VE), <code>|</code> (VEYA), <code>^</code> (ÖZEL VEYA, XOR), <code>~</code> (tümleyen: <code>~x == -x - 1</code>), <code>&lt;&lt;</code> (sola kaydır: 2 ile çarpar), <code>&gt;&gt;</code> (sağa kaydır: 2'ye tam böler). İş hayatında en sık karşılaştığın yer <b>izin bayraklarıdır</b> (flags): her bit bir yetkiyi temsil eder ve birden fazla izin tek bir sayıda saklanır. Linux dosya izinleri (<code>chmod 755</code>) tam olarak böyle çalışır.</p>
<pre class="py">OKU, YAZ, SIL = 1, 2, 4          # 0b001, 0b010, 0b100

analist = OKU                    # 0b001
editor = OKU | YAZ               # 0b011 -&gt; 3
print("editör:", editor, bin(editor))

print("Editör yazabilir mi?", editor &amp; YAZ == YAZ)
print("Editör silebilir mi?", bool(editor &amp; SIL))

editor |= SIL                    # izin ekle
print("Sil eklendi:", bin(editor))
editor &amp;= ~YAZ                   # izin kaldır
print("Yaz kaldırıldı:", bin(editor))
print("Değişen bitler:", bin((OKU | YAZ) ^ editor))
print(1 &lt;&lt; 3, 40 &gt;&gt; 2, ~5)</pre>
<div class="warn"><b>&amp; ile and aynı şey değil</b><code>and</code> mantıksal doğruluğa bakar ve işlenen döndürür; <code>&amp;</code> bit bit işlem yapar. <code>2 and 4</code> sonucu 4'tür, <code>2 &amp; 4</code> sonucu 0. Ayrıca <code>&amp;</code>, <code>==</code>'den <b>daha yüksek</b> önceliklidir; bu yüzden <code>editor &amp; YAZ == YAZ</code> doğru çalışır ama okunurluk için parantez eklemek iyi bir alışkanlıktır.</div>

<h2>Operatör önceliği</h2>
<p>Birden fazla operatör yan yana gelince Python hangisini önce yapacağına <b>öncelik</b> (precedence) tablosuyla karar verir. Yukarıdaki satırlar önce işlenir; aynı satırdakiler soldan sağa gider (tek istisna <code>**</code>).</p>
<div class="tbl-wrap"><table>
<tr><th>Öncelik</th><th>Operatör</th><th>Açıklama</th></tr>
<tr><td>1 (en yüksek)</td><td><code>()</code></td><td>Parantez</td></tr>
<tr><td>2</td><td><code>**</code></td><td>Üs (sağdan sola!)</td></tr>
<tr><td>3</td><td><code>+x</code>, <code>-x</code>, <code>~x</code></td><td>Tekli (unary) işaret, bit tümleyen</td></tr>
<tr><td>4</td><td><code>*</code>, <code>/</code>, <code>//</code>, <code>%</code></td><td>Çarpma ailesi</td></tr>
<tr><td>5</td><td><code>+</code>, <code>-</code></td><td>Toplama, çıkarma</td></tr>
<tr><td>6</td><td><code>&lt;&lt;</code>, <code>&gt;&gt;</code></td><td>Kaydırma</td></tr>
<tr><td>7</td><td><code>&amp;</code></td><td>Bit VE</td></tr>
<tr><td>8</td><td><code>^</code></td><td>Bit XOR</td></tr>
<tr><td>9</td><td><code>|</code></td><td>Bit VEYA</td></tr>
<tr><td>10</td><td><code>==  !=  &lt;  &lt;=  &gt;  &gt;=  in  not in  is  is not</code></td><td>Karşılaştırma, üyelik, kimlik</td></tr>
<tr><td>11</td><td><code>not</code></td><td>Mantıksal DEĞİL</td></tr>
<tr><td>12</td><td><code>and</code></td><td>Mantıksal VE</td></tr>
<tr><td>13</td><td><code>or</code></td><td>Mantıksal VEYA</td></tr>
<tr><td>14 (en düşük)</td><td><code>:=</code></td><td>Mors (walrus) ataması</td></tr>
</table></div>
<pre class="py">print(2 + 3 * 4)          # 14
print(2 ** 3 ** 2)        # 512: 3 ** 2 önce, sonra 2 ** 9
print((2 ** 3) ** 2)      # 64
print(-3 ** 2)            # -9: ** tekli eksiden önce
print(not 1 == 2)         # True: not (1 == 2)
print(True or False and False)   # True: and, or'dan önce</pre>
<p>PCEP sınavında <code>-3 ** 2</code>, <code>2 ** 3 ** 2</code> ve <code>and/or</code> karışımı klasik sorulardır. Gerçek kodda kural basit: <b>emin değilsen parantez koy</b>. Parantez hiçbir şeyi yavaşlatmaz, okuyanın zihnini rahatlatır.</p>

<h2>Mors operatörü :=</h2>
<p>Python 3.8 ile gelen <code>:=</code> (assignment expression, görünüşü mors bıyığına benzediği için walrus) bir <b>ifadenin içinde</b> atama yapar: değeri hem değişkene koyar hem de döndürür. En çok, bir değeri hesaplayıp hemen kontrol etmek istediğin yerlerde işe yarar.</p>
<pre class="py">kodlar = ["  AM-417 ", "AM-9", " AM-10022  ", ""]

# Uzunluğu bir kez hesapla, hem koşulda hem sonuçta kullan
uzunlar = [(k.strip(), n) for k in kodlar if (n := len(k.strip())) &gt;= 6]
print(uzunlar)

satirlar = ["120", "85", "", "40"]
i = 0
while (satir := satirlar[i]) != "":
    print("Okunan:", satir)
    i += 1</pre>
<p>Önceliği en düşük operatör olduğu için koşul içinde genellikle parantez gerekir: <code>(n := len(x)) &gt; 5</code>. Parantezsiz <code>n := len(x) &gt; 5</code>, n'ye <code>True/False</code> atar. Okunurluğu artırdığı yerde kullan; her atamayı mors'a çevirmek kodu zorlaştırır.</p>

<div class="note"><b>Gerçek işte</b>Anadolu Bank'ın kullanıcı yetki tablosunda her personelin izinleri tek bir tam sayı sütununda tutulur: 1 = hesap görüntüleme, 2 = havale başlatma, 4 = havale onaylama, 8 = limit değiştirme. Denetim ekibi "havale başlatıp aynı zamanda onaylayabilen" riskli kullanıcıları <code>(izin &amp; 6) == 6</code> sorgusuyla bulur. Aynı bit mantığı Linux dosya izinlerinde, ağ maskelerinde (IP alt ağları) ve oyun motorlarındaki çarpışma katmanlarında da karşına çıkacak.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Operatörler aslında metot çağrısıdır</h3>
<p><code>a + b</code> yazdığında Python <code>a.__add__(b)</code> çağırır; <code>a == b</code> için <code>__eq__</code>, <code>x in y</code> için <code>y.__contains__(x)</code>. Bu yüzden <code>+</code> sayılarda toplar, metinlerde birleştirir, listelerde ekler. Sınıflar dersinde kendi sınıfların için bu "sihirli metotları" (dunder methods) yazıp <code>para1 + para2</code> gibi okunur kod üreteceksin. Standart kütüphanedeki <code>operator</code> modülü de operatörlerin fonksiyon hâlini verir: <code>operator.add(2, 3)</code>, <code>sorted(liste, key=operator.itemgetter(1))</code>.</p>
<h3>Kısa devre ile korumalı erişim</h3>
<p><code>musteri and musteri.get("adres") and musteri["adres"].get("il")</code> zinciri, ara değerlerden biri None/boş olduğunda hata vermeden durur. Okunur ama uzar; orta seviyede <code>dict.get</code> zincirleri ve try/except ile alternatiflerini karşılaştıracaksın.</p>
<h3>Kayan noktada == kullanma</h3>
<p><code>0.1 + 0.2 == 0.3</code> False'tur (sayılar dersinde gördün). Para ve ölçüm karşılaştırmalarında <code>math.isclose(a, b)</code> ya da <code>abs(a - b) &lt; 1e-9</code> kullan; para için Decimal tercih et.</p>
<h3>Bit hileleri</h3>
<p><code>n &amp; 1</code> sayının tek olup olmadığını, <code>n &amp; (n - 1) == 0</code> (n &gt; 0 iken) 2'nin kuvveti olup olmadığını söyler; <code>n.bit_count()</code> (3.10+) açık bit sayısını verir. Bunlar mülakatlarda sık sorulur, ama iş kodunda okunurluk için <code>enum.Flag</code> sınıfını tercih et: <code>Izin.OKU | Izin.YAZ</code> hem bit verimliliği hem anlamlı adlar verir.</p>
</section>
`,
  ex: [
    { t: 'mc',
      stage: 'Isınma',
      q: '<code>x = 5</code> ardından <code>x += 3 * 2</code> çalışınca <code>x</code> kaç olur?',
      o: ['16', '11', '13', 'SyntaxError'],
      a: 1,
      why: 'Artırılmış atama önce sağ tarafı tamamen hesaplar (3 * 2 = 6), sonra x = x + 6 yapar: 11. (x + 3) * 2 = 16 değildir.' },
    { t: 'mc',
      stage: 'Isınma',
      q: '<code>a = [1, 2]</code> ve <code>b = [1, 2]</code> için hangisi doğrudur?',
      o: ['a == b True, a is b True', 'a == b False, a is b False', 'a == b True, a is b False', 'a == b False, a is b True'],
      a: 2,
      why: 'İki liste aynı değerleri taşır (== True) ama ayrı ayrı oluşturulmuş iki nesnedir (is False). is kimliği, == değeri karşılaştırır.' },
    { t: 'mc',
      stage: 'Isınma',
      q: '<code>print(not 1 == 2)</code> ne yazdırır?',
      o: ['False', 'True', 'TypeError', '0'],
      a: 1,
      why: '== operatörü not\'tan daha önceliklidir: not (1 == 2) = not False = True. (not 1) == 2 olarak okunmaz.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Bu kod ne yazdırır?',
      code: 'print(2 ** 3 ** 2, -2 ** 2)\n',
      o: ['64 4', '512 -4', '64 -4', '512 4'],
      a: 1,
      why: '** sağdan sola birleşir: 3 ** 2 = 9, sonra 2 ** 9 = 512. Ayrıca ** tekli eksiden önceliklidir: -(2 ** 2) = -4.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Bu kod ne yazdırır?',
      code: 'ad = ""\nindirim = 0\nprint(ad or "misafir", indirim and 100 / indirim, [] or None)\n',
      o: ['misafir 0 None', 'misafir False None', 'True 0 []', 'ZeroDivisionError'],
      a: 0,
      why: 'or ilk truthy değeri döndürür ("misafir"); and ilk falsy değerde durur ve onu döndürür (0), 100 / 0 hiç çalışmaz. [] or None ikisi de falsy olduğundan sonuncuyu verir: None.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Bu kod ne yazdırır?',
      code: 'print(-7 // 2, -7 % 2, 7 % -3)\n',
      o: ['-3 -1 1', '-4 1 1', '-3 1 -2', '-4 1 -2'],
      a: 3,
      why: '// aşağıya (eksi sonsuza) yuvarlar: -3.5 → -4. % bölenin işaretini alır: -7 % 2 = 1 (çünkü -4*2 + 1 = -7), 7 % -3 = -2 (çünkü -3*-3 + -2 = 7).' },
    { t: 'order',
      stage: 'Kodu oku',
      q: '<p>Bir kullanıcıya önce okuma ve yazma izni verip sonra yazma iznini kaldıran, son durumda silme izni olmadığını gösteren programı sırala. Çıktı <code>1</code> ve <code>False</code> olmalı.</p>',
      lines: ['OKU, YAZ, SIL = 1, 2, 4', 'izin = OKU | YAZ', 'izin &= ~YAZ', 'print(izin)', 'print(izin & SIL == SIL)'],
      expect: '1\nFalse\n',
      hint: 'Sabitler önce tanımlanmalı; izin kaldırmak için önce izin verilmiş olmalı.',
      why: '| bit ekler (1 | 2 = 3), &= ~YAZ ilgili biti sıfırlar (3 & ~2 = 1). & işlemi == den önce yapılır: (1 & 4) == 4 → False.' },
    { t: 'code',
      id: 'operatorler-1',
      stage: 'Rehberli',
      diff: 1,
      q: '<p>Anadolu Market kargo kuralı: Sepet tutarı <b>500 TL\'den fazla</b> ise <b>ve</b> müşteri premium <b>ya da</b> kampanya kodu girmişse kargo bedava. <code>kargo_bedava_mi(tutar, premium, kampanya_kodu)</code> fonksiyonu <b>bool</b> döndürsün. <code>kampanya_kodu</code> bir metindir; boş metin "kod girilmedi" demektir.</p>',
      guide: ['Tutar koşulunu yaz: tutar > 500.', 'Kod girilmiş mi: kampanya_kodu != "" (ya da bool(kampanya_kodu)).', 'premium or kod koşulunu PARANTEZ içine al.', 'İki parçayı and ile bağla ve sonucu bool olarak döndür.'],
      example: 'def yemek_karti_gecerli(gun, tatil, izinli):\n    # hafta içi VE (tatil değil YA DA izinli değil) gibi karışık kural\n    return gun < 5 and (not tatil or not izinli)\n\nprint(yemek_karti_gecerli(2, False, True))\nprint(yemek_karti_gecerli(6, False, False))\n',
      start: 'def kargo_bedava_mi(tutar, premium, kampanya_kodu):\n    # TODO: and ile or\'u karıştırma; parantezi unutma\n    return tutar > 500 and premium or kampanya_kodu\n',
      sol: 'def kargo_bedava_mi(tutar, premium, kampanya_kodu):\n    return tutar > 500 and (premium or kampanya_kodu != "")\n',
      tests: 'assert kargo_bedava_mi(750, True, "") is True, "750 TL premium: bedava"\nassert kargo_bedava_mi(750, False, "KARGO50") is True, "750 TL kampanya kodlu: bedava"\nassert kargo_bedava_mi(300, False, "KARGO50") is False, "300 TL kodlu olsa bile bedava DEĞİL: and, or\'dan önce bağlar; parantez gerekli"\nassert kargo_bedava_mi(750, False, "") is False, "Ne premium ne kod: bedava değil"\nassert kargo_bedava_mi(500, True, "") is False, "Tam 500 \'fazla\' değildir"\n',
      hints: ['and, or\'dan daha önceliklidir: a and b or c → (a and b) or c.', 'Sonucun bool olması için metni doğrudan döndürme; kampanya_kodu != "" karşılaştırması bool üretir.', 'return tutar > 500 and (premium or kampanya_kodu != "")'],
      why: 'and/or önceliği iş kurallarında en sık hata kaynağıdır. Parantez kuralın anlamını açıkça yazar. Karşılaştırma kullanmak da sonucun her zaman True/False olmasını sağlar; or\'un metin döndürmesini engeller.' },
    { t: 'code',
      id: 'operatorler-2',
      stage: 'Rehberli',
      diff: 2,
      q: '<p>Anadolu Bank yetki sistemi: <code>GORUNTULE=1</code>, <code>HAVALE=2</code>, <code>ONAY=4</code>, <code>LIMIT=8</code>. Üç fonksiyon yaz:</p><ul><li><code>izin_ekle(mevcut, izin)</code> → izni eklenmiş sayı</li><li><code>izin_kaldir(mevcut, izin)</code> → izni kaldırılmış sayı (izin yoksa sayı değişmez)</li><li><code>izin_var_mi(mevcut, izin)</code> → <b>bool</b>; birden fazla bit verilirse <b>hepsi</b> olmalı</li></ul>',
      guide: ['Eklemek için bit VEYA (|) kullan.', 'Kaldırmak için iznin tümleyeniyle (~izin) bit VE (&) yap.', 'Kontrol için (mevcut & izin) == izin karşılaştırmasını döndür.', 'Sabitleri dosyanın başında tanımla.'],
      example: 'KALIN, ITALIK, ALTI_CIZILI = 1, 2, 4\nstil = KALIN | ALTI_CIZILI\nprint(stil, (stil & ITALIK) == ITALIK)\nstil = stil & ~KALIN\nprint(stil)\n',
      start: 'GORUNTULE, HAVALE, ONAY, LIMIT = 1, 2, 4, 8\n\ndef izin_ekle(mevcut, izin):\n    # TODO: bit VEYA\n    return mevcut + izin\n\ndef izin_kaldir(mevcut, izin):\n    # TODO: bit VE ve tümleyen\n    return mevcut - izin\n\ndef izin_var_mi(mevcut, izin):\n    # TODO: tüm bitler var mı?\n    return bool(mevcut & izin)\n',
      sol: 'GORUNTULE, HAVALE, ONAY, LIMIT = 1, 2, 4, 8\n\ndef izin_ekle(mevcut, izin):\n    return mevcut | izin\n\ndef izin_kaldir(mevcut, izin):\n    return mevcut & ~izin\n\ndef izin_var_mi(mevcut, izin):\n    return (mevcut & izin) == izin\n',
      tests: 'assert izin_ekle(GORUNTULE, HAVALE) == 3, "1 | 2 = 3"\nassert izin_ekle(3, HAVALE) == 3, "Var olan izni tekrar eklemek sayıyı değiştirmemeli (+ kullanırsan 5 olur)"\nassert izin_kaldir(3, HAVALE) == 1, "3 içinden HAVALE çıkınca 1"\nassert izin_kaldir(1, ONAY) == 1, "Olmayan izni kaldırmak sayıyı değiştirmemeli (- kullanırsan -3 olur)"\nassert izin_var_mi(7, HAVALE | ONAY) is True, "7 hem HAVALE hem ONAY içerir"\nassert izin_var_mi(3, HAVALE | ONAY) is False, "3 ONAY içermez: birden fazla bitte HEPSİ olmalı"\nassert izin_var_mi(0, GORUNTULE) is False, "0 hiçbir izin içermez"\n',
      hints: ['Aritmetik + ve - bit işlemleri gibi davranmaz: aynı izni iki kez eklemek sayıyı bozar.', 'Tümleyen ~izin, o bit hariç tüm bitleri 1 yapar; & ile maske gibi kullanılır.', 'Kontrol: return (mevcut & izin) == izin'],
      why: 'Bit operatörleri izinleri birbirinden bağımsız açıp kapatır: | tekrar eklemede idempotenttir, & ~ olmayan izni kaldırmada sorun çıkarmaz. (m & i) == i birden fazla bitin hepsini birden doğrular.' },
    { t: 'code',
      id: 'operatorler-3',
      stage: 'Rehberli',
      diff: 1,
      q: '<p>Raporlarda müşterinin görünen adı şöyle seçilir: takma ad varsa o; yoksa gerçek ad; o da yoksa e-postanın <code>@</code> öncesi; hiçbiri yoksa <code>"anonim"</code>. <code>gorunen_ad(takma_ad, ad, eposta)</code> fonksiyonunu <code>or</code> zinciriyle yaz. Boş metin "yok" demektir; adlar baş/son boşluklardan kırpılmalı.</p>',
      guide: ['Her metni .strip() ile kırp.', 'E-postanın @ öncesi için eposta.split("@")[0] kullan (eposta boşsa da "" döner).', 'Değerleri öncelik sırasıyla or ile bağla.', 'Zincirin sonuna "anonim" koy.'],
      example: 'def iletisim(cep, ev, is_tel):\n    return cep.strip() or ev.strip() or is_tel.strip() or "telefon yok"\n\nprint(iletisim("", " 0232 111 ", ""))\nprint(iletisim("", "", ""))\n',
      start: 'def gorunen_ad(takma_ad, ad, eposta):\n    # TODO: or zinciri ile ilk dolu değeri seç\n    kullanici = eposta.split("@")[0]\n    return takma_ad\n',
      sol: 'def gorunen_ad(takma_ad, ad, eposta):\n    kullanici = eposta.strip().split("@")[0]\n    return takma_ad.strip() or ad.strip() or kullanici or "anonim"\n',
      tests: 'assert gorunen_ad("aysem", "Ayşe Kaya", "ayse@ornek.com") == "aysem", "Takma ad öncelikli"\nassert gorunen_ad("", "Ayşe Kaya", "ayse@ornek.com") == "Ayşe Kaya", "Takma ad boşsa gerçek ad"\nassert gorunen_ad("   ", "", "mehmet.y@ornek.com") == "mehmet.y", "Yalnız boşluk da boş sayılır; e-posta öneki dönmeli"\nassert gorunen_ad("", "", "") == "anonim", "Hiçbiri yoksa anonim"\n',
      hints: ['or ilk truthy değeri döndürür; boş metin falsy\'dir.', '"   ".strip() boş metin verir.', 'return takma_ad.strip() or ad.strip() or kullanici or "anonim"'],
      why: 'or zinciri "ilk dolu değeri seç" kalıbının en kısa yazımıdır. Değerler metin olduğu ve 0 gibi geçerli-ama-falsy bir değer olmadığı için burada güvenlidir.' },
    { t: 'code',
      id: 'operatorler-4',
      stage: 'Rehberli',
      diff: 2,
      q: '<p>Depodan gelen ürün kodları düzensiz boşluklar içeriyor. <code>uzun_kodlar(kodlar, esik)</code> fonksiyonu, kırpılmış uzunluğu <code>esik</code> veya daha fazla olan kodları <code>(kirpilmis_kod, uzunluk)</code> demetleri listesi olarak döndürsün. Uzunluğu yalnız <b>bir kez</b> hesaplamak için list comprehension içinde <b>mors operatörü</b> <code>:=</code> kullan (test kodunda <code>:=</code> arıyor).</p>',
      guide: ['Comprehension iskeleti: [(...) for k in kodlar if ...].', 'Koşulda kırpılmış metni ve uzunluğu mors ile yakala: (t := k.strip()).', 'Uzunluğu da yakala: (n := len(t)) >= esik — parantezi unutma.', 'Sonuç kısmında t ve n\'yi kullan.'],
      example: 'fiyatlar = ["12.5", "abc", "7", ""]\n# Değeri bir kez dönüştür, hem filtrele hem kullan\ntemiz = [f for s in fiyatlar if (f := s.strip()) and f.replace(".", "").isdigit()]\nprint(temiz)\n',
      start: 'def uzun_kodlar(kodlar, esik):\n    sonuc = []\n    for k in kodlar:\n        # TODO: bunu mors (:=) kullanan tek bir comprehension\'a çevir\n        if len(k.strip()) > esik:\n            sonuc.append((k.strip(), len(k.strip())))\n    return sonuc\n',
      sol: 'def uzun_kodlar(kodlar, esik):\n    return [(t, n) for k in kodlar if (n := len(t := k.strip())) >= esik]\n',
      tests: 'assert ":=" in __source__, "Mors operatörü := kullanılmalı"\nkodlar = ["  AM-417 ", "AM-9", " AM-10022  ", ""]\nassert uzun_kodlar(kodlar, 6) == [("AM-417", 6), ("AM-10022", 8)], "Eşik dahil (>=) olmalı ve kodlar kırpılmalı"\nassert uzun_kodlar(kodlar, 9) == [], "9 karakterlik kod yok"\nassert uzun_kodlar([], 1) == [], "Boş liste boş döner"\n',
      hints: ['Mors ifadesi bir değer döndürür; o değeri başka bir ifadenin içinde kullanabilirsin.', 'İç içe mors: len(t := k.strip()) önce t\'yi atar sonra uzunluğu hesaplar.', 'Koşul: if (n := len(t := k.strip())) >= esik'],
      why: 'Mors operatörü, comprehension içinde aynı hesabı iki kez yapmaktan kurtarır. Önceliği en düşük olduğu için (n := ...) >= esik parantezi zorunludur; yoksa n\'ye karşılaştırmanın bool sonucu atanır.' },
    { t: 'code',
      id: 'operatorler-5',
      stage: 'Kendin yaz',
      diff: 1,
      q: '<p>Vardiya planlamada gün numaraları <code>0=Pzt ... 6=Paz</code>. <code>gun_kaydir(gun, kaydirma)</code> fonksiyonu, verilen günden <code>kaydirma</code> kadar ileri (negatifse geri) gidince hangi günün adı geldiğini döndürsün. Gün adları: <code>["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"]</code>. Kaydırma çok büyük ya da negatif olabilir; if kullanmadan <code>%</code> ile çöz.</p>',
      start: 'GUNLER = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"]\n\ndef gun_kaydir(gun, kaydirma):\n    pass\n',
      sol: 'GUNLER = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"]\n\ndef gun_kaydir(gun, kaydirma):\n    return GUNLER[(gun + kaydirma) % 7]\n',
      tests: 'assert gun_kaydir(0, 2) == "Çar", "Pzt + 2 = Çar"\nassert gun_kaydir(5, 2) == "Pzt", "Cmt + 2 haftayı sarar: Pzt"\nassert gun_kaydir(1, -3) == "Cmt", "Sal - 3 = Cmt: Python\'da % negatifte de 0..6 verir"\nassert gun_kaydir(2, 700) == "Çar", "700 gün = 100 hafta: aynı gün"\nassert gun_kaydir(0, -15) == "Paz", "Pzt - 15 = Paz"\n',
      hints: ['(gun + kaydirma) % 7 her zaman 0 ile 6 arasındadır (bölen pozitifken).', 'Python\'da -2 % 7 == 5; C/Java\'daki gibi negatif çıkmaz.', 'return GUNLER[(gun + kaydirma) % 7]'],
      why: 'Python\'un % operatörü bölenin işaretini aldığı için döngüsel indekslemede (gün, saat, dairesel tampon) negatif kaydırmalar bile ek kontrol gerektirmez.' },
    { t: 'code',
      id: 'operatorler-6',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p>Web sitesinin tema rengi <code>0xRRGGBB</code> biçiminde tek bir tam sayı olarak saklanıyor (ör. <code>0x1E90FF</code>). İki fonksiyon yaz:</p><ul><li><code>rgb_ayir(renk)</code> → <code>(r, g, b)</code> demeti (her biri 0-255)</li><li><code>rgb_birlestir(r, g, b)</code> → tek tam sayı</li></ul><p>Yalnızca bit operatörleri (<code>&gt;&gt;</code>, <code>&lt;&lt;</code>, <code>&amp;</code>, <code>|</code>) kullan; metne çevirme.</p>',
      start: 'def rgb_ayir(renk):\n    pass\n\ndef rgb_birlestir(r, g, b):\n    pass\n',
      sol: 'def rgb_ayir(renk):\n    r = (renk >> 16) & 0xFF\n    g = (renk >> 8) & 0xFF\n    b = renk & 0xFF\n    return (r, g, b)\n\ndef rgb_birlestir(r, g, b):\n    return (r << 16) | (g << 8) | b\n',
      tests: 'assert rgb_ayir(0x1E90FF) == (30, 144, 255), "0x1E90FF -> (30, 144, 255)"\nassert rgb_ayir(0x000000) == (0, 0, 0), "Siyah"\nassert rgb_ayir(0xFF0000) == (255, 0, 0), "Kırmızı"\nassert rgb_birlestir(30, 144, 255) == 0x1E90FF, "Birleştirme ayırmanın tersi olmalı"\nassert rgb_birlestir(*rgb_ayir(0xABCDEF)) == 0xABCDEF, "Gidiş-dönüş aynı rengi vermeli"\nassert "str(" not in __source__ and "hex(" not in __source__, "Metne çevirmeden, bit operatörleriyle çöz"\n',
      hints: ['Her renk kanalı 8 bittir; kırmızı en üstteki 8 bit.', 'Sağa 16 kaydırınca kırmızı en alta iner; & 0xFF ile yalnız alttaki 8 bit kalır.', 'Birleştirme: (r << 16) | (g << 8) | b'],
      why: 'Kaydırma bitleri yerine taşır, & 0xFF maskesi istenmeyen bitleri siler, | parçaları birleştirir. Bu kalıp renklerde, ağ adreslerinde ve ikili dosya biçimlerinde aynen kullanılır.' },
    { t: 'code',
      id: 'operatorler-7',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p>Denetim için iki tarih arasındaki yetki değişikliklerini raporla. Yetkiler <code>IZINLER = {"GORUNTULE": 1, "HAVALE": 2, "ONAY": 4, "LIMIT": 8}</code>. <code>degisen_izinler(eski, yeni)</code> fonksiyonu <code>{"eklenen": [...], "kaldirilan": [...]}</code> döndürsün; listeler <code>IZINLER</code> sözlüğündeki sırayla izin adlarını içersin. Değişen bitleri bulmak için <code>^</code> (XOR) kullan.</p>',
      start: 'IZINLER = {"GORUNTULE": 1, "HAVALE": 2, "ONAY": 4, "LIMIT": 8}\n\ndef degisen_izinler(eski, yeni):\n    pass\n',
      sol: 'IZINLER = {"GORUNTULE": 1, "HAVALE": 2, "ONAY": 4, "LIMIT": 8}\n\ndef degisen_izinler(eski, yeni):\n    fark = eski ^ yeni\n    sonuc = {"eklenen": [], "kaldirilan": []}\n    for ad, bit in IZINLER.items():\n        if fark & bit:\n            if yeni & bit:\n                sonuc["eklenen"].append(ad)\n            else:\n                sonuc["kaldirilan"].append(ad)\n    return sonuc\n',
      tests: 'assert degisen_izinler(0b0011, 0b0110) == {"eklenen": ["ONAY"], "kaldirilan": ["GORUNTULE"]}, "3 -> 6: ONAY eklendi, GORUNTULE kaldırıldı"\nassert degisen_izinler(5, 5) == {"eklenen": [], "kaldirilan": []}, "Değişiklik yoksa iki liste de boş"\nassert degisen_izinler(0, 15) == {"eklenen": ["GORUNTULE", "HAVALE", "ONAY", "LIMIT"], "kaldirilan": []}, "Hepsi eklendi"\nassert "^" in __source__, "XOR (^) kullanılmalı"\n',
      hints: ['eski ^ yeni, yalnız değişen bitlerde 1 olan bir sayı verir.', 'Değişen bir bit yeni\'de 1 ise eklenmiş, 0 ise kaldırılmıştır.', 'for ad, bit in IZINLER.items(): if fark & bit: ...'],
      why: 'XOR "farklı olan bitleri" bulmanın en doğrudan yoludur. Ardından yeni değere bakarak değişimin yönü (ekleme/kaldırma) anlaşılır. Sözlük sırası Python 3.7+\'ta korunur.' },
    { t: 'code',
      id: 'operatorler-8',
      stage: 'Kendin yaz',
      diff: 1,
      q: '<p>İK performans notlandırması: <code>kademe(puan)</code> fonksiyonu 0-100 arası puan için harf döndürsün: <code>90 ≤ p ≤ 100 → "A"</code>, <code>75 ≤ p &lt; 90 → "B"</code>, <code>60 ≤ p &lt; 75 → "C"</code>, <code>0 ≤ p &lt; 60 → "D"</code>. Aralık dışındaki puanda <code>ValueError</code> fırlat. Her koşulu <b>zincirleme karşılaştırma</b> ile yaz.</p>',
      start: 'def kademe(puan):\n    pass\n',
      sol: 'def kademe(puan):\n    if 90 <= puan <= 100:\n        return "A"\n    if 75 <= puan < 90:\n        return "B"\n    if 60 <= puan < 75:\n        return "C"\n    if 0 <= puan < 60:\n        return "D"\n    raise ValueError(f"Geçersiz puan: {puan}")\n',
      tests: 'assert [kademe(p) for p in (100, 90, 89.5, 75, 74, 60, 59, 0)] == ["A", "A", "B", "B", "C", "C", "D", "D"], "Sınırlar: 90 A, 75 B, 60 C dahil"\ntry:\n    kademe(101)\n    assert False, "101 için ValueError beklenirdi"\nexcept ValueError:\n    pass\ntry:\n    kademe(-1)\n    assert False, "-1 için ValueError beklenirdi"\nexcept ValueError:\n    pass\n',
      hints: ['Zincirleme: 75 <= puan < 90 tek ifadede iki sınırı birden denetler.', 'Hiçbir aralığa uymayan puan en sona düşer; orada raise ValueError(...) yaz.', 'Sınırlarda dahil/hariç ayrımına dikkat: 90 A\'dır, B değil.'],
      why: 'Zincirleme karşılaştırma aralık kontrolünü matematikteki gibi okunur yazar ve her sınırı açıkça gösterir. Aralık dışını sessizce "D" yapmak yerine hata fırlatmak, bozuk veriyi erken yakalar.' },
    { t: 'code',
      id: 'operatorler-9',
      stage: 'Hata avı',
      kind: 'bug',
      diff: 1,
      q: '<p><b>Hatayı bul ve düzelt.</b> <code>bolge_indirimi(sehir)</code> yalnızca İzmir ve Ankara için 0.10, diğer şehirler için 0 döndürmeli. Mevcut kod her şehre indirim veriyor.</p>',
      start: 'def bolge_indirimi(sehir):\n    if sehir == "İzmir" or "Ankara":\n        return 0.10\n    return 0\n',
      sol: 'def bolge_indirimi(sehir):\n    if sehir in ("İzmir", "Ankara"):\n        return 0.10\n    return 0\n',
      tests: 'assert bolge_indirimi("İzmir") == 0.10, "İzmir indirimli"\nassert bolge_indirimi("Ankara") == 0.10, "Ankara indirimli"\nassert bolge_indirimi("Bursa") == 0, "Bursa indirimsiz olmalı; or \'Ankara\' her zaman truthy\'dir"\nassert bolge_indirimi("") == 0, "Boş şehir indirimsiz"\n',
      hints: ['Koşulu öncelik tablosuyla oku: (sehir == "İzmir") or ("Ankara").', 'Boş olmayan metin her zaman truthy\'dir; or ifadesi bu yüzden hep doğru çıkar.', 'Üyelik operatörü: sehir in ("İzmir", "Ankara")'],
      why: 'or iki tarafı ayrı ayrı değerlendirir; "Ankara" kendi başına truthy olduğu için koşul hep True olur. Doğrusu her tarafı tam yazmak (sehir == "İzmir" or sehir == "Ankara") ya da in ile tek seferde sormaktır.' },
    { t: 'code',
      id: 'operatorler-10',
      stage: 'Hata avı',
      kind: 'bug',
      diff: 2,
      q: '<p><b>Hatayı bul ve düzelt.</b> <code>limit_asildi(tutar, limit)</code>, tutar limite <b>eşit ya da büyükse</b> True döndürmeli. Testlerde küçük sayılarla doğru çalışıyor gibiydi, ama canlıda 5000 TL\'lik işlemler limiti (5000) aşmadı sanıldı. İki hata var.</p>',
      start: 'def limit_asildi(tutar, limit):\n    return tutar is limit or tutar > limit is True\n',
      sol: 'def limit_asildi(tutar, limit):\n    return tutar >= limit\n',
      tests: 'assert limit_asildi(int("5000"), int("5000")) is True, "5000 >= 5000 True olmalı; is kimlik karşılaştırır, değer değil"\nassert limit_asildi(int("7500"), 5000) is True, "7500 limiti aşar"\nassert limit_asildi(10, 10) is True, "Küçük sayılarda da eşitlik True"\nassert limit_asildi(4999, 5000) is False, "4999 aşmaz"\n',
      hints: ['is iki adın aynı nesne olup olmadığını sorar. Küçük tam sayılar (-5..256) önbellekte olduğu için tesadüfen çalışır.', 'tutar > limit is True bir zincirdir: (tutar > limit) and (limit is True). limit hiçbir zaman True nesnesi değildir.', 'Tek karşılaştırma yeter: return tutar >= limit'],
      why: 'is değer eşitliği için kullanılmaz; Python yalnız küçük tam sayıları önbelleğe aldığından hata sadece büyük tutarlarda ortaya çıkar. "x > y is True" ise karşılaştırma zinciridir ve beklenmedik biçimde limit is True\'ya dönüşür.' },
    { t: 'code',
      id: 'operatorler-11',
      stage: 'Meydan okuma',
      diff: 3,
      q: '<p>Eski bir lojistik cihazı tarihleri 16 bitlik tek bir sayıya sıkıştırıyor (FAT dosya sistemi biçimi): en üst 7 bit <code>yil - 1980</code>, sonraki 4 bit ay (1-12), en alttaki 5 bit gün (1-31).</p><ul><li><code>tarih_paketle(yil, ay, gun)</code> → tam sayı. Yıl 1980-2107, ay 1-12, gün 1-31 dışındaysa <code>ValueError</code>.</li><li><code>tarih_coz(paket)</code> → <code>(yil, ay, gun)</code>. Paket 0-65535 dışındaysa <code>ValueError</code>.</li></ul><p>Yalnız bit operatörleri ve zincirleme karşılaştırmalar kullan.</p>',
      start: 'def tarih_paketle(yil, ay, gun):\n    pass\n\ndef tarih_coz(paket):\n    pass\n',
      sol: 'def tarih_paketle(yil, ay, gun):\n    if not (1980 <= yil <= 2107 and 1 <= ay <= 12 and 1 <= gun <= 31):\n        raise ValueError("Geçersiz tarih")\n    return ((yil - 1980) << 9) | (ay << 5) | gun\n\ndef tarih_coz(paket):\n    if not 0 <= paket <= 0xFFFF:\n        raise ValueError("16 bit dışında")\n    yil = (paket >> 9) + 1980\n    ay = (paket >> 5) & 0b1111\n    gun = paket & 0b11111\n    return (yil, ay, gun)\n',
      tests: 'p = tarih_paketle(2026, 10, 28)\nassert p == (46 << 9) | (10 << 5) | 28, "Bit yerleşimi: yıl<<9 | ay<<5 | gün"\nassert tarih_coz(p) == (2026, 10, 28), "Çözme paketlemenin tersi olmalı"\nassert tarih_coz(tarih_paketle(1980, 1, 1)) == (1980, 1, 1), "Alt sınır"\nassert tarih_coz(tarih_paketle(2107, 12, 31)) == (2107, 12, 31), "Üst sınır: 7 bit yıl 127\'ye kadar"\nassert tarih_paketle(2107, 12, 31) <= 0xFFFF, "Sonuç 16 bite sığmalı"\nfor kotu in [(1979, 1, 1), (2108, 1, 1), (2000, 0, 1), (2000, 13, 1), (2000, 1, 0), (2000, 1, 32)]:\n    try:\n        tarih_paketle(*kotu)\n        assert False, f"{kotu} için ValueError beklenirdi"\n    except ValueError:\n        pass\nfor kotu in [-1, 65536]:\n    try:\n        tarih_coz(kotu)\n        assert False, f"{kotu} için ValueError beklenirdi"\n    except ValueError:\n        pass\n',
      hints: ['Gün 5 bit (0-31), ay 4 bit (0-15): ay 5 bit, yıl 9 bit sola kaydırılır.', 'Çözerken önce kaydır sonra maskele: ay = (paket >> 5) & 0b1111.', 'Doğrulama: if not (1980 <= yil <= 2107 and 1 <= ay <= 12 and 1 <= gun <= 31): raise ValueError(...)'],
      why: 'Bit paketleme, alanların genişliklerini bilerek her alanı kendi yerine kaydırmak ve | ile birleştirmektir; çözme ise kaydırıp & maskesiyle o alanı yalıtmaktır. Zincirleme karşılaştırmalar doğrulamayı tek satırda okunur kılar. Not: "and" önce bağlar, "not" tüm parantezi tersine çevirir.' }
  ],
  faq: [
    { q: 'and/or neden True/False yerine başka değerler döndürüyor?',
      a: 'Python bu operatörleri "kısa devre seçici" olarak tasarlamıştır: sonucu belirleyen işleneni döndürür. if içinde kullandığında fark etmez (değer zaten truthy/falsy olarak yorumlanır), ama atamada <code>ad = girdi or "Misafir"</code> gibi kısa varsayılan kalıpları mümkün kılar. Kesin bool istiyorsan <code>bool(...)</code> ile sar.' },
    { q: 'Öncelik tablosunu ezberlemem gerekiyor mu?',
      a: 'Sınav (PCEP/PCAP) için ana hatlarını bilmelisin: ** en yüksek ve sağdan, sonra tekli eksi, çarpma ailesi, toplama, karşılaştırmalar, not, and, or. Gerçek kodda ise ezberine güvenme; okuyanın da bilmesi gerekmesin diye parantez kullan.' },
    { q: 'Bit operatörlerini veri analizinde kullanacak mıyım?',
      a: 'Doğrudan sayılarda az; ama pandas ve numpy\'da <code>&amp;</code>, <code>|</code>, <code>~</code> filtrelerde çok kullanılır: <code>df[(df.tutar &gt; 500) &amp; (df.sehir == "İzmir")]</code>. Orada and/or çalışmaz ve parantezler zorunludur, çünkü &amp; karşılaştırmalardan önceliklidir.' },
    { q: 'Mors operatörünü ne zaman kullanmalıyım?',
      a: 'Bir değeri hesaplayıp hemen test ettiğin ve sonra da kullandığın yerlerde: while döngüsünde okuma (<code>while (satir := f.readline())</code>), regex eşleşmesi (<code>if (m := re.match(...))</code>), comprehension içinde pahalı hesap. Sıradan atamalarda <code>=</code> daha okunurdur.' }
  ],
  mistakes: [
    { bad: 'if sehir == "İzmir" or "Ankara":',
      good: 'if sehir in ("İzmir", "Ankara"):',
      why: 'or her tarafı ayrı değerlendirir; boş olmayan metin her zaman truthy olduğundan koşul hep doğru çıkar.' },
    { bad: 'if tutar is 5000:',
      good: 'if tutar == 5000:',
      why: 'is kimlik karşılaştırır; değer eşitliği için == kullan. is yalnız None/True/False içindir.' },
    { bad: 'sayac++',
      good: 'sayac += 1',
      why: 'Python\'da ++ operatörü yoktur; artırılmış atama kullan.' },
    { bad: 'sonuc = -2 ** 2      # 4 beklenmiş',
      good: 'sonuc = (-2) ** 2    # 4',
      why: '** tekli eksiden daha önceliklidir: -2 ** 2 = -(2 ** 2) = -4.' },
    { bad: 'if n := len(kodlar) > 10:\n    print(n, "kod")',
      good: 'if (n := len(kodlar)) > 10:\n    print(n, "kod")',
      why: 'Mors en düşük öncelikli operatördür; parantezsiz yazınca n\'ye karşılaştırmanın sonucu (True/False) atanır.' }
  ]
});
})(window);
/* PythonPatika v2/t2 — Terminal ve komut satırı */
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push({
  id: 'terminal-temelleri',
  lv: 'temel',
  mod: 'Başlangıç',
  min: 35,
  title: 'Terminal ve komut satırı',
  sum: 'Çalışma dizini, göreli/mutlak yol, python betik.py ve -m, sys.argv ile argüman, sys.exit ile çıkış kodu, stdout/stderr, yönlendirme ve ortam değişkenleriyle betiklerini terminalden profesyonelce çalıştırırsın.',
  goals: ['Terminalde klasörler arasında gezinip dosya ve klasörleri Windows ile macOS/Linux komutlarıyla yönetebilirim.', 'Göreli ve mutlak yolu ayırt eder, pathlib ile yolları birleştirip çözebilirim.', 'Betiğe sys.argv ile argüman verir, sayıya dönüştürür ve eksik argümanı yakalarım.', 'Çıkış kodu, stdout ve stderr ile betiğimin sonucunu diğer programlara doğru bildiririm.', 'Ortam değişkenlerini os.environ ile güvenli varsayılanlarla okurum.'],
  body: `
<h2>Neden terminal?</h2>
<p>Anadolu Market'in gece 02.00'de çalışan stok raporu bir sunucuda, kimsenin ekranına bakmadığı bir makinede koşar. Orada VS Code yok, "Çalıştır" düğmesi yok; yalnızca <b>terminal</b> (terminal, komut satırı, shell) var. Veri ekipleri betiklerini terminalden çalıştırır, zamanlayıcılar (cron, Windows Görev Zamanlayıcı) betiği terminal komutuyla başlatır, CI sistemleri testleri terminalde koşturur. Terminali rahat kullanmak, "kendi bilgisayarımda çalışıyor" ile "şirkette her gece çalışıyor" arasındaki köprüdür.</p>
<p>Bu derste terminalin dört temel fikrini öğreneceksin: <b>neredesin</b> (çalışma dizini), <b>neyi çalıştırıyorsun</b> (komut ve argümanlar), <b>sonuç ne oldu</b> (çıkış kodu) ve <b>veri nereye akıyor</b> (standart girdi/çıktı/hata). Python tarafında bunların karşılığı <code>os.getcwd()</code>, <code>sys.argv</code>, <code>sys.exit()</code>, <code>sys.stdin/stdout/stderr</code> ve <code>os.environ</code>'dur. Kurulum dersinde terminali açıp <code>python --version</code> yazmıştın; şimdi derine iniyoruz.</p>

<h2>Neredesin? Çalışma dizini</h2>
<p>Terminal her an bir klasörün "içinde" durur; buna <b>çalışma dizini</b> (working directory, cwd) denir. Yazdığın göreli dosya adları bu klasöre göre çözülür. Nerede olduğunu <code>pwd</code> (macOS/Linux) ya da <code>cd</code> (Windows'ta tek başına) söyler; başka klasöre <code>cd klasor</code> ile geçersin.</p>
<pre class="code">$ pwd
/home/ayse
$ mkdir anadolu-rapor
$ cd anadolu-rapor
$ ls
$ cd ..
$ pwd
/home/ayse</pre>
<p>Python içinden çalışma dizinini <code>os.getcwd()</code> ya da <code>pathlib.Path.cwd()</code> verir. Tarayıcıdaki Python da sanal bir dosya sisteminde çalışır; aşağıdaki kodu çalıştırıp kendi "konumunu" gör:</p>
<pre class="py">import os
from pathlib import Path

print("Çalışma dizini:", os.getcwd())
print("Path ile:", Path.cwd())
os.makedirs("rapor_deneme", exist_ok=True)   # mkdir'in Python karşılığı
os.chdir("rapor_deneme")                     # cd'nin Python karşılığı
print("Şimdi:", os.getcwd())
os.chdir("..")
print("Geri döndük:", os.getcwd())</pre>

<h2>Windows ve macOS/Linux komutları</h2>
<p>macOS ve Linux aynı aileden (Unix) gelir, komutları neredeyse aynıdır. Windows'ta iki terminal vardır: eski <b>cmd</b> ve modern <b>PowerShell</b>. PowerShell, <code>ls</code>, <code>pwd</code>, <code>cat</code> gibi Unix adlarını da takma ad (alias) olarak tanır; bu yüzden yeni başlayanlara PowerShell'i öneririz.</p>
<div class="tbl-wrap"><table>
<tr><th>Ne yapar</th><th>macOS / Linux</th><th>Windows cmd</th><th>PowerShell</th></tr>
<tr><td>Bulunduğun klasör</td><td><code>pwd</code></td><td><code>cd</code></td><td><code>pwd</code> / <code>Get-Location</code></td></tr>
<tr><td>Klasör içeriği</td><td><code>ls</code>, <code>ls -la</code></td><td><code>dir</code></td><td><code>ls</code> / <code>dir</code></td></tr>
<tr><td>Klasöre gir / üst klasör</td><td><code>cd veri</code> / <code>cd ..</code></td><td><code>cd veri</code> / <code>cd ..</code></td><td>aynı</td></tr>
<tr><td>Klasör oluştur</td><td><code>mkdir rapor</code></td><td><code>mkdir rapor</code></td><td><code>mkdir rapor</code></td></tr>
<tr><td>Dosya içeriğini göster</td><td><code>cat satis.csv</code></td><td><code>type satis.csv</code></td><td><code>cat</code> / <code>Get-Content</code></td></tr>
<tr><td>Kopyala / taşı / sil</td><td><code>cp</code> / <code>mv</code> / <code>rm</code></td><td><code>copy</code> / <code>move</code> / <code>del</code></td><td><code>cp</code> / <code>mv</code> / <code>rm</code></td></tr>
<tr><td>Ekranı temizle</td><td><code>clear</code></td><td><code>cls</code></td><td><code>cls</code> / <code>clear</code></td></tr>
<tr><td>Metin içinde ara</td><td><code>grep HATA log.txt</code></td><td><code>findstr HATA log.txt</code></td><td><code>Select-String HATA log.txt</code></td></tr>
<tr><td>Python'ı çağır</td><td><code>python3</code></td><td><code>py</code> ya da <code>python</code></td><td><code>py</code> ya da <code>python</code></td></tr>
<tr><td>Ortam değişkeni oku</td><td><code>echo $HOME</code></td><td><code>echo %USERPROFILE%</code></td><td><code>$env:USERPROFILE</code></td></tr>
<tr><td>Son çıkış kodu</td><td><code>echo $?</code></td><td><code>echo %ERRORLEVEL%</code></td><td><code>$LASTEXITCODE</code></td></tr>
</table></div>
<div class="tip"><b>Tab tuşu senin dostun</b>Klasör ya da dosya adının ilk birkaç harfini yazıp Tab'a bas; terminal gerisini tamamlar. Yukarı ok tuşu önceki komutu geri getirir. Bu iki alışkanlık yazım hatalarının çoğunu önler.</div>

<h2>Göreli ve mutlak yol</h2>
<p><b>Mutlak yol</b> (absolute path) kökten başlar: <code>/home/ayse/veri/satis.csv</code> ya da <code>C:\\Users\\ayse\\veri\\satis.csv</code>. Nerede olursan ol aynı dosyayı gösterir. <b>Göreli yol</b> (relative path) çalışma dizinine göre yorumlanır: <code>veri/satis.csv</code>, <code>./satis.csv</code> (bu klasör), <code>../arsiv/eski.csv</code> (bir üst klasör). <code>~</code> ise macOS/Linux'ta ev klasörünün kısaltmasıdır.</p>
<pre class="py">import posixpath
from pathlib import PurePosixPath

cwd = PurePosixPath("/home/ayse/anadolu-rapor")
goreli = "../veri/./satis.csv"

birlesik = cwd / goreli
print("Birleştirilmiş:", birlesik)
print("Sadeleştirilmiş:", posixpath.normpath(str(birlesik)))
print("Mutlak mı?", PurePosixPath(goreli).is_absolute(), PurePosixPath("/etc/hosts").is_absolute())
print("Dosya adı:", birlesik.name, "| uzantı:", birlesik.suffix, "| gövde:", birlesik.stem)</pre>
<p><code>PurePosixPath</code> diske dokunmadan yalnızca yol metniyle çalışır; bu yüzden her bilgisayarda aynı sonucu verir ve test yazmak için idealdir. <code>/</code> operatörü yolları birleştirir. <code>..</code> parçalarını sadeleştirmek için <code>posixpath.normpath</code> kullanılır (gerçek diskte <code>Path.resolve()</code> aynı işi yapar).</p>
<div class="warn"><b>Betik nerede, sen neredesin?</b>Betiğin <code>open("veri/satis.csv")</code> diyorsa dosya, betiğin klasörüne göre değil, <b>terminalin bulunduğu klasöre</b> göre aranır. <code>cd</code> yapmadan başka yerden çalıştırırsan FileNotFoundError alırsın. Sağlam çözüm: <code>Path(__file__).parent / "veri" / "satis.csv"</code>.</div>

<h2>Python'ı terminalden çalıştırmak</h2>
<pre class="code">python rapor.py               # betiği çalıştır (macOS/Linux'ta çoğu zaman python3)
py rapor.py                   # Windows'ta Python başlatıcısı
python -m pip install rich    # pip'i "bu Python'ın" modülü olarak çalıştır
python -m venv .venv          # sanal ortam oluştur
python -m json.tool veri.json # JSON'u güzel biçimde yazdır
python -c "print(2 ** 10)"    # tek satırlık kod</pre>
<p><code>python betik.py</code> bir dosyayı, <code>python -m modul</code> ise Python'ın bulduğu bir <b>modülü</b> betik gibi çalıştırır. <code>pip</code> yerine <code>python -m pip</code> yazmak, paketin tam olarak o Python'a kurulmasını garanti eder; bilgisayarda birden fazla Python varken en sık karışıklığı böyle önlersin.</p>

<h2>Betiğe argüman vermek: sys.argv</h2>
<p>Terminalde betik adından sonra yazdığın her kelime <b>argüman</b> (argument) olur ve <code>sys.argv</code> listesine metin (str) olarak düşer. İlk eleman (<code>sys.argv[0]</code>) her zaman betiğin adıdır.</p>
<pre class="code">$ python rapor.py İzmir 7 --detay
# sys.argv == ["rapor.py", "İzmir", "7", "--detay"]</pre>
<p>Tarayıcıda terminal olmadığı için aynı mantığı bir liste ile taklit ediyoruz. Profesyonel kodda da yaygın kalıp budur: argümanları <code>main(argv)</code> fonksiyonuna parametre olarak vermek; böylece fonksiyonu test edebilirsin.</p>
<pre class="py">def main(argv):
    if len(argv) &lt; 2:
        print("Kullanım: python rapor.py &lt;şehir&gt; [gün]")
        return 2
    sehir = argv[1]
    gun = int(argv[2]) if len(argv) &gt; 2 else 7     # argümanlar hep str!
    print(f"{sehir} için son {gun} günün raporu hazırlanıyor")
    return 0

print("Kod:", main(["rapor.py", "İzmir", "30"]))
print("Kod:", main(["rapor.py", "Ankara"]))
print("Kod:", main(["rapor.py"]))</pre>
<div class="note"><b>Argümanlar her zaman metindir</b><code>"7"</code> ile <code>7</code> farklıdır. Sayı bekliyorsan <code>int()</code> ile dönüştür. Çok seçenekli araçlar için standart kütüphanedeki <code>argparse</code> modülünü orta seviyede göreceksin; sys.argv onun altında yatan temeldir.</div>

<h2>Çıkış kodu: işin sonucu bir sayı</h2>
<p>Her program bittiğinde işletim sistemine bir <b>çıkış kodu</b> (exit code) bırakır. Kural basittir: <b>0 başarı</b>, 0 dışındaki her şey hata. Gelenek olarak 1 genel hata, 2 hatalı kullanım (eksik/yanlış argüman) demektir. Zamanlayıcılar ve CI sistemleri ekrana değil bu sayıya bakar: kod 0 değilse alarm üretir.</p>
<p>Python'da <code>sys.exit(kod)</code> çağırınca <code>SystemExit</code> istisnası fırlatılır ve program o kodla biter. Hiç çağırmazsan ve hata da olmazsa kod 0'dır; yakalanmamış bir istisnada kod 1 olur.</p>
<pre class="py">import sys

def kontrol(satir_sayisi):
    if satir_sayisi == 0:
        print("Rapor boş, çıkılıyor", file=sys.stderr)
        sys.exit(1)
    print("Rapor tamam:", satir_sayisi, "satır")

for n in [120, 0]:
    try:
        kontrol(n)
    except SystemExit as e:
        print("Program şu kodla bitecekti:", e.code)</pre>

<h2>Standart girdi, çıktı ve hata</h2>
<p>Her program üç "boru" ile doğar: <b>standart girdi</b> (stdin, klavyeden ya da başka programdan gelen veri), <b>standart çıktı</b> (stdout, asıl sonuç) ve <b>standart hata</b> (stderr, uyarı ve hata mesajları). <code>print()</code> varsayılan olarak stdout'a yazar; <code>print(..., file=sys.stderr)</code> ise stderr'e. İkisi ekranda aynı görünür ama ayrı borulardır ve ayrı yönlendirilebilir.</p>
<pre class="py">import sys, io

def ozetle(tutarlar, out=sys.stdout, err=sys.stderr):
    gecerli = []
    for t in tutarlar:
        if t &lt; 0:
            print(f"UYARI: negatif tutar atlandı: {t}", file=err)
        else:
            gecerli.append(t)
    print(f"toplam={sum(gecerli)}", file=out)

hata_kutusu = io.StringIO()          # stderr'i bir metin kutusunda yakala
ozetle([250, -40, 1200], err=hata_kutusu)
print("Yakalanan uyarılar:", hata_kutusu.getvalue().strip())</pre>
<p>Akışı parametre yapmak (<code>out</code>, <code>err</code>) fonksiyonu test edilebilir kılar: testte <code>io.StringIO</code> verirsin, gerçekte <code>sys.stdout</code>. Kullanıcıdan girdi almayı (<code>input()</code>) "Kullanıcı girdisi ve tür dönüşümü" dersinde derinlemesine göreceksin.</p>

<h2>Yönlendirme ve boru hattı</h2>
<pre class="code">python rapor.py İzmir &gt; rapor.txt        # stdout'u dosyaya yaz (üzerine)
python rapor.py Bursa &gt;&gt; rapor.txt       # dosyanın sonuna ekle
python rapor.py İzmir 2&gt; hatalar.log      # yalnız stderr'i dosyaya
python rapor.py İzmir &gt; out.txt 2&gt;&amp;1     # ikisini aynı dosyaya
cat stok.log | grep HATA | wc -l        # boru: birinin çıktısı diğerinin girdisi
type stok.log | findstr HATA            # Windows cmd karşılığı
python temizle.py &lt; ham.csv &gt; temiz.csv  # stdin'i dosyadan oku</pre>
<p><code>|</code> (boru, pipe) Unix felsefesinin kalbidir: her araç tek işi iyi yapar, borularla birleşir. Senin betiğin de iyi bir boru vatandaşı olsun: <b>veriyi stdout'a, mesajları stderr'e</b> yaz. Böylece <code>&gt; sonuc.csv</code> yapan kişi dosyasında uyarı satırı bulmaz.</p>

<h2>Ortam değişkenleri</h2>
<p><b>Ortam değişkenleri</b> (environment variables), işletim sisteminin programa verdiği anahtar-değer ayarlarıdır: <code>PATH</code>, <code>HOME</code>, veritabanı adresi, ortam adı (geliştirme/canlı). Python'da <code>os.environ</code> bir sözlük gibi davranır. Değer her zaman metindir ve olmayabilir; bu yüzden <code>.get(ad, varsayilan)</code> kullan.</p>
<pre class="code">export ANADOLU_ORTAM=canli        # macOS/Linux (bu oturum için)
set ANADOLU_ORTAM=canli           # Windows cmd
$env:ANADOLU_ORTAM = "canli"      # PowerShell</pre>
<pre class="py">import os

ortam = os.environ.get("ANADOLU_ORTAM", "gelistirme")
zaman_asimi = int(os.environ.get("ZAMAN_ASIMI", "30"))
print("Ortam:", ortam, "| zaman aşımı:", zaman_asimi, "sn")
print("PATH tanımlı mı?", "PATH" in os.environ)

os.environ["ANADOLU_ORTAM"] = "test"     # yalnız bu süreç ve alt süreçleri görür
print("Yeni değer:", os.environ["ANADOLU_ORTAM"])</pre>
<div class="warn"><b>Parolayı koda yazma</b>Veritabanı parolası, API anahtarı gibi sırlar kod dosyasına değil ortam değişkenine (ya da gizli kasa/vault aracına) konur. Kod Git'e gider; ortam değişkeni gitmez. <code>os.environ["SIFRE"]</code> değişken yoksa KeyError verir, <code>.get()</code> ise None ya da varsayılanı döndürür.</div>

<div class="note"><b>Gerçek işte</b>Anadolu Bank'ın gün sonu mutabakat betiği şöyle çağrılır: <code>python -m mutabakat 2026-10-27 --sube 0412 &gt; mutabakat.csv 2&gt; mutabakat.log</code>. Zamanlayıcı her gece bu komutu koşturur; veritabanı adresi <code>BANKA_DB_URL</code> ortam değişkeninden gelir. Betik çıkış kodu 0 dönerse CSV muhasebeye gider; 1 dönerse nöbetçi geliştiriciye otomatik bildirim düşer ve log dosyası incelenir. Hiç kimse ekrana bakmaz; her şeyi çıkış kodu, stdout ve stderr anlatır.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Test edilebilir komut satırı kalıbı</h3>
<p>Profesyonel Python betiklerinin neredeyse hepsi aynı iskeleti kullanır: tüm iş <code>main(argv)</code> içinde yapılır, fonksiyon çıkış kodunu <b>döndürür</b>, <code>sys.exit</code> yalnızca en dışta bir kez çağrılır.</p>
<pre class="py">import sys

def main(argv, env=None, out=sys.stdout, err=sys.stderr):
    env = env if env is not None else {}
    if len(argv) != 2:
        print("Kullanım: stok.py &lt;depo&gt;", file=err)
        return 2
    esik = int(env.get("STOK_ESIK", "10"))
    print(f"{argv[1]} deposu, eşik {esik}", file=out)
    return 0

kod = main(["stok.py", "Gebze"], env={"STOK_ESIK": "25"})
print("Çıkış kodu:", kod)
# Gerçek betikte en altta:
# if __name__ == "__main__":
#     sys.exit(main(sys.argv, dict(os.environ)))</pre>
<p>Bu kalıbın üç faydası var: testte argv, ortam ve akışları istediğin gibi verirsin; çıkış kodu tek yerden yönetilir; modül içe aktarıldığında (<code>import</code>) hiçbir şey kendiliğinden çalışmaz.</p>
<h3>Tırnaklar ve boşluklu argümanlar</h3>
<p>Terminal argümanları boşluktan böler: <code>python rapor.py Kahraman Maraş</code> iki argüman verir. Tek argüman için tırnak kullan: <code>"Kahraman Maraş"</code>. Python'da bir komut satırını terminal gibi bölmek için <code>shlex.split('rapor.py "Kahraman Maraş" 7')</code> kullanılır. Alt süreç (subprocess) çalıştırırken komutu tek metin yerine liste olarak vermek de aynı nedenle güvenlidir.</p>
<h3>Çıkış kodu sözleşmesi</h3>
<p>Ekibinle bir tablo üzerinde anlaş: 0 başarı, 1 iş hatası (veri bozuk), 2 kullanım hatası, 3 dış sistem erişilemiyor gibi. Zamanlayıcı kuralları ("kod 3 ise 10 dakika sonra yeniden dene") bu sözleşmeye dayanır. Unix'te 126-255 arası kodlar kabuğa ayrılmıştır; kendi kodlarını küçük tut.</p>
</section>
`,
  ex: [
    { t: 'mc',
      stage: 'Isınma',
      q: 'Terminalde <code>/home/ayse/proje</code> klasöründesin ve <code>cd ..</code> yazıyorsun. Ardından <code>pwd</code> ne gösterir?',
      o: ['/home/ayse/proje/..', '/home/ayse', '/home', 'Hata verir; .. bir klasör adı değildir'],
      a: 1,
      why: '<code>..</code> her klasörde bulunan "bir üst klasör" kısaltmasıdır. cd .. seni proje\'nin üstüne, /home/ayse\'ye taşır. pwd sadeleşmiş yolu yazar, ".." içeren hâli değil.' },
    { t: 'mc',
      stage: 'Isınma',
      q: '<code>python rapor.py İzmir 7</code> komutuyla çalışan betikte <code>sys.argv[1]</code> nedir?',
      o: ['"rapor.py"', '7 (int)', '"İzmir"', '["İzmir", "7"]'],
      a: 2,
      why: 'sys.argv[0] betiğin adıdır; argümanlar 1. indeksten başlar. Tüm argümanlar str olarak gelir; "7" de int değil metindir.' },
    { t: 'mc',
      stage: 'Isınma',
      q: 'Gece çalışan bir betik bitince zamanlayıcı "başarısız" alarmı veriyor. Zamanlayıcı başarıyı genellikle neye bakarak anlar?',
      o: ['Çıkış kodunun 0 olmasına', 'Ekrana "Bitti" yazılmasına', 'stderr\'in boş olmasına', 'Betiğin 1 dakikadan kısa sürmesine'],
      a: 0,
      why: 'İşletim sistemi ve zamanlayıcılar çıkış koduna bakar: 0 başarı, diğerleri hata. stderr\'e uyarı yazan ama 0 ile biten program başarılı sayılır.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Bu kod ne yazdırır?',
      code: 'argv = ["topla.py", "5", "3"]\nprint(argv[1] + argv[2], len(argv))\n',
      o: ['8 3', '53 3', '53 2', '8 2'],
      a: 1,
      why: 'Argümanlar metindir; "5" + "3" metin birleştirmesidir ve "53" verir. Liste betik adını da içerdiği için uzunluk 3\'tür.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Bu kod ne yazdırır?',
      code: 'import posixpath\nyol = posixpath.join("/home/ayse/proje", "../veri/./satis.csv")\nprint(posixpath.normpath(yol))\n',
      o: ['/home/ayse/proje/veri/satis.csv', '/home/ayse/proje/../veri/./satis.csv', '/home/ayse/veri/satis.csv', '/home/veri/satis.csv'],
      a: 2,
      why: 'join iki parçayı birleştirir; normpath ".." ile bir üst klasöre çıkar (proje düşer) ve "." parçalarını siler. Sonuç /home/ayse/veri/satis.csv olur.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Bu kod ne yazdırır?',
      code: 'import sys\n\ndef calis(n):\n    if n < 0:\n        sys.exit(2)\n    return n * 2\n\ntry:\n    print(calis(4))\n    print(calis(-1))\nexcept SystemExit as e:\n    print("kod", e.code)\n',
      o: ['8\nkod 2', '8\n-2', 'kod 2', '8\nkod 1'],
      a: 0,
      why: 'İlk çağrı 8 yazar. İkincisinde sys.exit(2) SystemExit fırlatır; print çalışmadan except bloğuna geçilir ve e.code 2\'dir.' },
    { t: 'order',
      stage: 'Kodu oku',
      q: '<p>Argüman sayısını denetleyip çıkış kodu döndüren <code>main(argv)</code> fonksiyonunun ve çağrısının satırlarını sırala. Çıktı <code>Bursa raporu</code> ve <code>0</code> olmalı.</p>',
      lines: ['def main(argv):', '    if len(argv) < 2:', '        return 2', '    print(argv[1], "raporu")', '    return 0', 'print(main(["rapor.py", "Bursa"]))'],
      expect: 'Bursa raporu\n0\n',
      hint: 'Önce argüman eksikliğini kontrol et (erken dönüş), sonra asıl işi yap ve 0 döndür.',
      why: 'Erken dönüş (guard clause) kalıbı: hatalı kullanımda hemen 2 ile çık; geri kalan kod "argüman var" varsayımıyla rahatça yazılır.' },
    { t: 'code',
      id: 'terminal-temelleri-1',
      stage: 'Rehberli',
      diff: 1,
      q: '<p>Anadolu Market rapor betiği şöyle çağrılıyor: <code>python rapor.py &lt;şehir&gt; [gün]</code>. <code>rapor_argumanlari(argv)</code> fonksiyonunu yaz:</p><ul><li>Şehir yoksa (argv yalnızca betik adını içeriyorsa) <code>None</code> döndür.</li><li>Gün verilmemişse varsayılan <b>7</b> olsun.</li><li>Gün verilmişse <b>int</b>\'e çevir.</li><li>Sonuç <code>(sehir, gun)</code> demeti olsun.</li></ul>',
      guide: ['argv uzunluğu 2\'den küçükse None döndür.', 'Şehri argv[1]\'den al.', 'Uzunluk 2\'den büyükse argv[2]\'yi int\'e çevir, değilse 7 kullan.', '(sehir, gun) demetini döndür.'],
      example: 'def kullanici_ve_rol(argv):\n    if len(argv) < 2:\n        return None\n    kullanici = argv[1]\n    rol = argv[2] if len(argv) > 2 else "okuyucu"\n    return (kullanici, rol)\n\nprint(kullanici_ve_rol(["yetki.py", "ayse"]))\nprint(kullanici_ve_rol(["yetki.py", "ayse", "admin"]))\n',
      start: 'def rapor_argumanlari(argv):\n    # TODO: şehir yoksa None döndür\n    sehir = argv[1]\n    # TODO: gün verilmişse int\'e çevir, verilmemişse 7 kullan\n    gun = argv[2]\n    return (sehir, gun)\n',
      sol: 'def rapor_argumanlari(argv):\n    if len(argv) < 2:\n        return None\n    sehir = argv[1]\n    gun = int(argv[2]) if len(argv) > 2 else 7\n    return (sehir, gun)\n',
      tests: 'assert rapor_argumanlari(["rapor.py"]) is None, "Şehir verilmezse None dönmeli (IndexError değil)"\nassert rapor_argumanlari(["rapor.py", "İzmir"]) == ("İzmir", 7), "Gün verilmezse varsayılan 7 olmalı"\nassert rapor_argumanlari(["rapor.py", "Ankara", "30"]) == ("Ankara", 30), "Gün \'30\' metni int 30\'a çevrilmeli"\nassert isinstance(rapor_argumanlari(["r.py", "Bursa", "5"])[1], int), "Gün int türünde olmalı: argümanlar str gelir"\n',
      hints: ['Önce len(argv) ile kaç argüman geldiğini kontrol et.', 'Koşullu ifade: deger = int(argv[2]) if len(argv) > 2 else 7', 'İlk satır: if len(argv) < 2: return None'],
      why: 'Argüman listesini fonksiyona parametre olarak vermek, sys.argv\'ye dokunmadan her senaryoyu test etmeyi sağlar. Eksik argüman kontrolü IndexError yerine anlamlı bir sonuç üretir.' },
    { t: 'code',
      id: 'terminal-temelleri-2',
      stage: 'Rehberli',
      diff: 2,
      q: '<p><code>yolu_coz(cwd, yol)</code> fonksiyonunu yaz. Terminalin yaptığı gibi bir yolu çalışma dizinine göre çözsün ve sadeleşmiş mutlak yolu <b>str</b> olarak döndürsün:</p><ul><li><code>yol</code> mutlaksa (<code>/</code> ile başlıyorsa) cwd yok sayılır.</li><li>Göreliyse cwd ile birleştirilir.</li><li><code>.</code> ve <code>..</code> parçaları sadeleştirilir.</li></ul><p>Deterministik olması için <code>PurePosixPath</code> ve <code>posixpath.normpath</code> kullan.</p>',
      guide: ['PurePosixPath(yol).is_absolute() ile mutlak olup olmadığını öğren.', 'Göreliyse PurePosixPath(cwd) / yol ile birleştir.', 'Sonucu str\'ye çevirip posixpath.normpath ile sadeleştir.', 'Sadeleşmiş metni döndür.'],
      example: 'import posixpath\nfrom pathlib import PurePosixPath\n\nkok = PurePosixPath("/srv/uygulama")\nprint((kok / "loglar/../ayarlar.ini"))\nprint(posixpath.normpath(str(kok / "loglar/../ayarlar.ini")))\nprint(PurePosixPath("/tmp/x").is_absolute())\n',
      start: 'import posixpath\nfrom pathlib import PurePosixPath\n\ndef yolu_coz(cwd, yol):\n    # TODO: yol mutlaksa cwd\'yi kullanma\n    tam = PurePosixPath(cwd) / yol\n    # TODO: .. ve . parçalarını sadeleştir\n    return str(tam)\n',
      sol: 'import posixpath\nfrom pathlib import PurePosixPath\n\ndef yolu_coz(cwd, yol):\n    p = PurePosixPath(yol)\n    tam = p if p.is_absolute() else PurePosixPath(cwd) / p\n    return posixpath.normpath(str(tam))\n',
      tests: 'assert yolu_coz("/home/ayse", "veri/satis.csv") == "/home/ayse/veri/satis.csv", "Göreli yol cwd\'ye eklenmeli"\nassert yolu_coz("/home/ayse/proje", "../arsiv/eski.csv") == "/home/ayse/arsiv/eski.csv", ".. bir üst klasöre çıkmalı"\nassert yolu_coz("/home/ayse", "./a/./b.txt") == "/home/ayse/a/b.txt", ". parçaları silinmeli"\nassert yolu_coz("/home/ayse", "/etc/hosts") == "/etc/hosts", "Mutlak yol cwd\'den bağımsızdır"\nassert yolu_coz("/a/b/c", "../../x") == "/a/x", "İki kez .. iki seviye çıkmalı"\nassert isinstance(yolu_coz("/a", "b"), str), "Sonuç str olmalı"\n',
      hints: ['Mutlak/göreli ayrımı için is_absolute() metodu var.', 'Aslında PurePosixPath(cwd) / "/etc/hosts" zaten mutlak yolu verir; yine de açıkça kontrol etmek okunurluğu artırır.', 'return posixpath.normpath(str(tam))'],
      why: 'PurePosixPath yalnızca yol metniyle çalışır, diski okumaz; testler her işletim sisteminde aynı sonucu verir. normpath ".." ve "." parçalarını terminalin yaptığı gibi çözer.' },
    { t: 'code',
      id: 'terminal-temelleri-3',
      stage: 'Rehberli',
      diff: 1,
      q: '<p>Bir veri yükleme betiği bitince şu sözleşmeye göre çıkış kodu üretmeli. <code>cikis_kodu(okunan, hatali)</code> fonksiyonunu yaz:</p><ul><li><code>okunan == 0</code> ise (hiç satır yok) <b>2</b></li><li>Hatalı satır oranı (<code>hatali / okunan</code>) %10\'dan büyükse <b>1</b></li><li>Aksi hâlde <b>0</b></li></ul>',
      guide: ['Önce okunan == 0 durumunu kontrol et; yoksa sıfıra bölme hatası alırsın.', 'Oranı hatali / okunan ile hesapla.', 'Oran 0.10\'dan büyükse 1 döndür.', 'Hiçbiri değilse 0 döndür.'],
      example: 'def sinav_kodu(cevaplanan, yanlis):\n    if cevaplanan == 0:\n        return 3\n    if yanlis / cevaplanan > 0.5:\n        return 1\n    return 0\n\nprint(sinav_kodu(0, 0), sinav_kodu(10, 6), sinav_kodu(10, 2))\n',
      start: 'def cikis_kodu(okunan, hatali):\n    # TODO: hiç satır yoksa 2 döndür\n    oran = hatali / okunan\n    # TODO: oran %10\'dan büyükse 1 döndür\n    return 0\n',
      sol: 'def cikis_kodu(okunan, hatali):\n    if okunan == 0:\n        return 2\n    oran = hatali / okunan\n    if oran > 0.10:\n        return 1\n    return 0\n',
      tests: 'assert cikis_kodu(0, 0) == 2, "Hiç satır okunmadıysa 2 dönmeli (ZeroDivisionError değil)"\nassert cikis_kodu(100, 5) == 0, "%5 hata kabul edilebilir: 0 dönmeli"\nassert cikis_kodu(100, 10) == 0, "Tam %10 sınırı aşmaz: 0 dönmeli"\nassert cikis_kodu(100, 11) == 1, "%11 hata oranı 1 döndürmeli"\nassert cikis_kodu(3, 3) == 1, "Tüm satırlar hatalıysa 1 dönmeli"\n',
      hints: ['Koşulların sırası önemli: bölmeden önce sıfır kontrolü.', '"Büyükse" diyor: > kullan, >= değil.', 'if oran > 0.10: return 1'],
      why: 'Çıkış kodu, zamanlayıcının ve diğer programların betiğinle konuştuğu dildir. Sıfıra bölme gibi kenar durumları ayrı bir kodla işaretlemek sorunun kaynağını ilk bakışta gösterir.' },
    { t: 'code',
      id: 'terminal-temelleri-4',
      stage: 'Rehberli',
      diff: 2,
      q: '<p><code>stok_bildir(stoklar, out, err)</code> fonksiyonunu yaz. <code>stoklar</code> bir sözlük: ürün → adet. Her ürün için:</p><ul><li>Adet 0 ise <code>err</code> akışına <code>UYARI: &lt;ürün&gt; tükendi</code> yaz.</li><li>Değilse <code>out</code> akışına <code>&lt;ürün&gt;,&lt;adet&gt;</code> yaz (CSV satırı).</li></ul><p>Yazmak için <code>print(..., file=akis)</code> kullan. Fonksiyon tükenen ürün sayısını döndürsün.</p>',
      guide: ['Sayaç için tukenen = 0 ile başla.', 'stoklar.items() üzerinde dön.', 'Adet 0 ise print(..., file=err) ile uyar ve sayacı artır.', 'Değilse print(f"{urun},{adet}", file=out) yaz.', 'Sayacı döndür.'],
      example: 'import io, sys\n\ndef notlari_yaz(notlar, out, err):\n    for ad, puan in notlar.items():\n        if puan < 50:\n            print(f"KALDI: {ad}", file=err)\n        else:\n            print(f"{ad};{puan}", file=out)\n\nkutu = io.StringIO()\nnotlari_yaz({"Ali": 70, "Ece": 40}, sys.stdout, kutu)\nprint("stderr kutusu:", kutu.getvalue())\n',
      start: 'def stok_bildir(stoklar, out, err):\n    tukenen = 0\n    for urun, adet in stoklar.items():\n        # TODO: adet 0 ise err\'e UYARI yaz ve sayacı artır\n        # TODO: değilse out\'a "urun,adet" yaz\n        print(urun, adet)\n    return tukenen\n',
      sol: 'def stok_bildir(stoklar, out, err):\n    tukenen = 0\n    for urun, adet in stoklar.items():\n        if adet == 0:\n            print(f"UYARI: {urun} tükendi", file=err)\n            tukenen += 1\n        else:\n            print(f"{urun},{adet}", file=out)\n    return tukenen\n',
      tests: 'import io\no, e = io.StringIO(), io.StringIO()\nn = stok_bildir({"çay": 40, "kahve": 0, "şeker": 12, "un": 0}, o, e)\nassert o.getvalue() == "çay,40\\nşeker,12\\n", "out yalnız CSV satırlarını içermeli, geldi: " + repr(o.getvalue())\nassert e.getvalue() == "UYARI: kahve tükendi\\nUYARI: un tükendi\\n", "err yalnız uyarıları içermeli, geldi: " + repr(e.getvalue())\nassert n == 2, "Tükenen ürün sayısı 2 dönmeli"\no2, e2 = io.StringIO(), io.StringIO()\nassert stok_bildir({}, o2, e2) == 0 and o2.getvalue() == "", "Boş sözlükte hiçbir şey yazılmamalı"\n',
      hints: ['print\'in file parametresi yazılacak akışı seçer.', 'Veri out\'a, mesaj err\'e: python stok.py > stok.csv yapan kişi CSV\'de uyarı görmemeli.', 'print(f"UYARI: {urun} tükendi", file=err)'],
      why: 'Veri ile mesajları ayrı akışlara yazmak betiği boru hattına uygun kılar: stdout dosyaya yönlendirilince temiz CSV kalır, uyarılar ekranda ya da log dosyasında görünür.' },
    { t: 'code',
      id: 'terminal-temelleri-5',
      stage: 'Kendin yaz',
      diff: 1,
      q: '<p><code>ortam_ayari(env, anahtar, varsayilan)</code> fonksiyonunu yaz. <code>env</code> bir sözlük (os.environ gibi). Anahtar yoksa <b>ya da</b> değeri boşluklardan ibaretse <code>varsayilan</code> döndür; aksi hâlde değerin baştaki/sondaki boşlukları kırpılmış hâlini döndür.</p>',
      start: 'def ortam_ayari(env, anahtar, varsayilan):\n    pass\n',
      sol: 'def ortam_ayari(env, anahtar, varsayilan):\n    deger = env.get(anahtar, "").strip()\n    return deger if deger else varsayilan\n',
      tests: 'env = {"ANADOLU_ORTAM": " canli ", "LOG_SEVIYE": "   ", "DB": "sqlite"}\nassert ortam_ayari(env, "ANADOLU_ORTAM", "gelistirme") == "canli", "Değer kırpılmalı: \' canli \' -> \'canli\'"\nassert ortam_ayari(env, "LOG_SEVIYE", "INFO") == "INFO", "Yalnız boşluk içeren değer yok sayılmalı"\nassert ortam_ayari(env, "YOK", "x") == "x", "Olmayan anahtarda varsayılan dönmeli (KeyError değil)"\nassert ortam_ayari(env, "DB", "postgres") == "sqlite", "Var olan değer dönmeli"\n',
      hints: ['dict.get(anahtar, "") yoksa boş metin verir.', 'Boş metin falsy\'dir: if deger: ...', 'return deger if deger else varsayilan'],
      why: 'Ortam değişkenleri elle ayarlanır ve sık sık yanlışlıkla boş bırakılır. get + strip + varsayılan üçlüsü bu kirli girdiye karşı sağlam bir ayar okuyucu üretir.' },
    { t: 'code',
      id: 'terminal-temelleri-6',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p><code>bayraklari_ayir(argv)</code> fonksiyonunu yaz. <code>argv[0]</code> betik adıdır, atla. Kalan argümanlar için:</p><ul><li><code>--anahtar=deger</code> biçimindekiler sözlüğe <code>"anahtar": "deger"</code> olarak girsin.</li><li><code>--anahtar</code> (eşittir yok) biçimindekiler <code>"anahtar": True</code> olsun.</li><li><code>--</code> ile başlamayanlar <code>"_konum"</code> anahtarındaki listeye sırayla eklensin.</li></ul><p>Sözlük her zaman <code>"_konum"</code> anahtarını içersin (boş liste olabilir).</p>',
      start: 'def bayraklari_ayir(argv):\n    pass\n',
      sol: 'def bayraklari_ayir(argv):\n    sonuc = {"_konum": []}\n    for arg in argv[1:]:\n        if arg.startswith("--"):\n            govde = arg[2:]\n            if "=" in govde:\n                anahtar, deger = govde.split("=", 1)\n                sonuc[anahtar] = deger\n            else:\n                sonuc[govde] = True\n        else:\n            sonuc["_konum"].append(arg)\n    return sonuc\n',
      tests: 'r = bayraklari_ayir(["rapor.py", "İzmir", "--gun=30", "--detay", "Ankara"])\nassert r == {"_konum": ["İzmir", "Ankara"], "gun": "30", "detay": True}, "Beklenen sözlük farklı, geldi: " + repr(r)\nassert bayraklari_ayir(["rapor.py"]) == {"_konum": []}, "Argüman yoksa yalnız boş _konum olmalı"\nassert bayraklari_ayir(["x.py", "--filtre=a=b"])["filtre"] == "a=b", "Yalnız ilk = ayırmalı: split(\'=\', 1)"\n',
      hints: ['startswith("--") ile bayrak mı diye bak, arg[2:] ile başını at.', 'split("=", 1) yalnızca ilk eşittirden böler.', 'Eşittir yoksa değer True olur.'],
      why: 'argparse\'ın temel işi budur: konumsal argümanları ve bayrakları ayırmak. split("=", 1) değerin kendisi = içerse bile doğru çalışır.' },
    { t: 'code',
      id: 'terminal-temelleri-7',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p>Ekipte Windows kullananlarla Linux sunucu arasında köprü kuracaksın. <code>komut_cevir(komut)</code> fonksiyonu Windows cmd komutunu macOS/Linux karşılığına çevirsin. İlk kelime şu tabloya göre değişir, geri kalan argümanlar aynen kalır:</p><p><code>dir→ls</code>, <code>type→cat</code>, <code>copy→cp</code>, <code>move→mv</code>, <code>del→rm</code>, <code>cls→clear</code>, <code>findstr→grep</code>. Tabloda olmayan komut (ör. <code>cd</code>, <code>mkdir</code>) aynen kalsın. Komut adı büyük/küçük harf duyarsız eşleşsin (<code>DIR</code> da <code>ls</code> olur). Fazla boşlukları tek boşluğa indir.</p>',
      start: 'def komut_cevir(komut):\n    pass\n',
      sol: 'ESLEME = {"dir": "ls", "type": "cat", "copy": "cp", "move": "mv", "del": "rm", "cls": "clear", "findstr": "grep"}\n\ndef komut_cevir(komut):\n    parcalar = komut.split()\n    if not parcalar:\n        return ""\n    ad = parcalar[0].lower()\n    parcalar[0] = ESLEME.get(ad, parcalar[0])\n    return " ".join(parcalar)\n',
      tests: 'assert komut_cevir("type satis.csv") == "cat satis.csv", "type -> cat"\nassert komut_cevir("DIR") == "ls", "Büyük harf DIR de ls olmalı"\nassert komut_cevir("findstr HATA stok.log") == "grep HATA stok.log", "findstr -> grep, argümanlar aynı"\nassert komut_cevir("mkdir rapor") == "mkdir rapor", "Tabloda olmayan komut aynen kalmalı"\nassert komut_cevir("copy   a.txt    b.txt") == "cp a.txt b.txt", "Fazla boşluk tek boşluğa inmeli"\nassert komut_cevir("") == "", "Boş komut boş dönmeli"\n',
      hints: ['Eşlemeyi bir sözlükte tut.', 'split() argümansız çağrılınca birden fazla boşluğu tek ayırıcı sayar.', 'ESLEME.get(ad.lower(), ad) yoksa orijinali döndürür.'],
      why: 'Sözlük tabanlı eşleme if/elif zincirinden kısa ve genişletilebilirdir. split() + join() ikilisi boşluk normalizasyonunu bedavaya verir.' },
    { t: 'code',
      id: 'terminal-temelleri-8',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p>Linux\'ta <code>cat stok.log | grep HATA | wc -l</code> komutu log içinde "HATA" geçen satır sayısını verir. Aynı boru hattını Python\'da taklit et: <code>boru_say(metin, kelime)</code> çok satırlı metni satırlara böler, <code>kelime</code>\'yi içeren satırları süzer ve <b>sayısını</b> döndürür. Ayrıca <code>boru_suz(metin, kelime)</code> aynı satırları liste olarak döndürsün (sıra korunarak). Eşleşme büyük/küçük harf duyarlı.</p>',
      start: 'def boru_suz(metin, kelime):\n    pass\n\ndef boru_say(metin, kelime):\n    pass\n',
      sol: 'def boru_suz(metin, kelime):\n    return [satir for satir in metin.splitlines() if kelime in satir]\n\ndef boru_say(metin, kelime):\n    return len(boru_suz(metin, kelime))\n',
      tests: 'log = "02:00 BILGI basladi\\n02:01 HATA depo=Gebze\\n02:02 BILGI 120 urun\\n02:03 HATA depo=Izmir\\n02:04 hata degil\\n"\nassert boru_suz(log, "HATA") == ["02:01 HATA depo=Gebze", "02:03 HATA depo=Izmir"], "Yalnız HATA içeren iki satır kalmalı"\nassert boru_say(log, "HATA") == 2, "grep büyük/küçük harf duyarlıdır: \'hata\' sayılmaz"\nassert boru_say(log, "Gebze") == 1, "Gebze 1 satırda geçiyor"\nassert boru_say("", "HATA") == 0, "Boş metinde 0"\n',
      hints: ['splitlines() satırlara böler ve son boş satırı üretmez.', 'Süzme için comprehension: [s for s in ... if kelime in s]', 'Saymak için len(boru_suz(...)): fonksiyonlar da boru gibi birleşir.'],
      why: 'Her fonksiyonun tek iş yapması ve birinin çıktısının diğerine girdi olması, Unix borusunun Python\'daki karşılığıdır. boru_say, boru_suz\'u yeniden kullanır.' },
    { t: 'code',
      id: 'terminal-temelleri-9',
      stage: 'Hata avı',
      kind: 'bug',
      diff: 2,
      q: '<p><b>Hatayı bul ve düzelt.</b> <code>python topla.py 10 20 30</code> çağrısını taklit eden <code>topla(argv)</code> fonksiyonu betik adından sonraki tüm sayıları toplamalı: <code>topla(["topla.py", "10", "20", "30"])</code> → <code>60</code>. Mevcut kod hata veriyor.</p>',
      start: 'def topla(argv):\n    toplam = 0\n    for arg in argv:\n        toplam += arg\n    return toplam\n',
      sol: 'def topla(argv):\n    toplam = 0\n    for arg in argv[1:]:\n        toplam += int(arg)\n    return toplam\n',
      tests: 'assert topla(["topla.py", "10", "20", "30"]) == 60, "10+20+30 = 60 olmalı"\nassert topla(["topla.py"]) == 0, "Argüman yoksa toplam 0"\nassert topla(["topla.py", "-5", "5"]) == 0, "Negatif sayılar da çalışmalı"\n',
      hints: ['İki hata var: biri hangi elemanların toplandığıyla ilgili.', 'argv[0] betiğin adıdır, sayı değildir; argv[1:] ile atla.', 'Argümanlar str gelir: int(arg) ile çevir.'],
      why: 'sys.argv iki klasik tuzak taşır: ilk eleman betik adıdır ve tüm elemanlar metindir. int + str TypeError verir; "topla.py" ise int\'e çevrilemez.' },
    { t: 'code',
      id: 'terminal-temelleri-10',
      stage: 'Hata avı',
      kind: 'bug',
      diff: 2,
      q: '<p><b>Hatayı bul ve düzelt.</b> <code>zaman_asimi(env)</code>, <code>ZAMAN_ASIMI</code> ortam değişkenini saniye olarak <b>int</b> döndürmeli; değişken tanımlı değilse varsayılan <b>30</b> olmalı. Mevcut kod tanımsız değişkende çöküyor ve tanımlıyken yanlış türde değer döndürüyor.</p>',
      start: 'def zaman_asimi(env):\n    deger = env["ZAMAN_ASIMI"]\n    return deger\n',
      sol: 'def zaman_asimi(env):\n    deger = env.get("ZAMAN_ASIMI", "30")\n    return int(deger)\n',
      tests: 'assert zaman_asimi({}) == 30, "Değişken yoksa 30 dönmeli (KeyError değil)"\nassert zaman_asimi({"ZAMAN_ASIMI": "45"}) == 45, "\'45\' metni int 45 olmalı"\nassert isinstance(zaman_asimi({"ZAMAN_ASIMI": "5"}), int), "Dönüş türü int olmalı: ortam değişkenleri hep str\'dir"\n',
      hints: ['env["X"] anahtar yoksa KeyError fırlatır.', '.get(anahtar, varsayilan) kullan; varsayılanı da metin ver ki tek dönüşüm yetsin.', 'return int(env.get("ZAMAN_ASIMI", "30"))'],
      why: 'Ortam değişkenleri her zaman metindir ve tanımsız olabilir. get ile varsayılan vermek ve tek noktada int\'e çevirmek iki hatayı birden çözer.' },
    { t: 'code',
      id: 'terminal-temelleri-11',
      stage: 'Meydan okuma',
      diff: 3,
      q: '<p>Tam bir komut satırı aracı yaz: <code>main(argv, env, out, err)</code>. Kullanım: <code>kargo.py &lt;şehir&gt; &lt;desi&gt;</code>. Kurallar:</p><ul><li>Argüman sayısı tam 2 değilse <code>err</code>\'e <code>Kullanım: kargo.py &lt;şehir&gt; &lt;desi&gt;</code> yaz, <b>2</b> döndür.</li><li>Desi sayı değilse ya da 0 veya negatifse <code>err</code>\'e <code>Hata: desi pozitif sayı olmalı</code> yaz, <b>1</b> döndür. (Ondalık olabilir: <code>"2.5"</code>)</li><li>Birim fiyat <code>env</code>\'deki <code>KARGO_BIRIM</code> değeridir (yoksa <code>"12"</code>), float\'a çevir.</li><li>Şehir <code>İstanbul</code> ise ücret 1.0 katsayılı, başka şehir ise 1.25 katsayılıdır. Ücret = desi × birim × katsayı, 2 basamağa yuvarla.</li><li><code>out</code>\'a <code>&lt;şehir&gt;: &lt;ücret&gt; TL</code> yaz (ücreti <code>:.2f</code> ile), <b>0</b> döndür.</li></ul>',
      start: 'def main(argv, env, out, err):\n    pass\n',
      sol: 'def main(argv, env, out, err):\n    if len(argv) != 3:\n        print("Kullanım: kargo.py <şehir> <desi>", file=err)\n        return 2\n    sehir = argv[1]\n    try:\n        desi = float(argv[2])\n    except ValueError:\n        desi = 0\n    if desi <= 0:\n        print("Hata: desi pozitif sayı olmalı", file=err)\n        return 1\n    birim = float(env.get("KARGO_BIRIM", "12"))\n    katsayi = 1.0 if sehir == "İstanbul" else 1.25\n    ucret = round(desi * birim * katsayi, 2)\n    print(f"{sehir}: {ucret:.2f} TL", file=out)\n    return 0\n',
      tests: 'import io\ndef calistir(argv, env=None):\n    o, e = io.StringIO(), io.StringIO()\n    kod = main(argv, env or {}, o, e)\n    return kod, o.getvalue(), e.getvalue()\n\nk, o, e = calistir(["kargo.py", "İstanbul", "3"])\nassert (k, o, e) == (0, "İstanbul: 36.00 TL\\n", ""), "3 desi x 12 x 1.0 = 36.00, geldi: " + repr((k, o, e))\nk, o, e = calistir(["kargo.py", "İzmir", "2.5"], {"KARGO_BIRIM": "10"})\nassert (k, o) == (0, "İzmir: 31.25 TL\\n"), "2.5 x 10 x 1.25 = 31.25 olmalı, geldi: " + repr(o)\nk, o, e = calistir(["kargo.py", "İzmir"])\nassert k == 2 and e.startswith("Kullanım:") and o == "", "Eksik argümanda 2 dönmeli, mesaj err\'e gitmeli"\nk, o, e = calistir(["kargo.py", "Ankara", "abc"])\nassert k == 1 and "desi pozitif" in e and o == "", "Sayı olmayan desi 1 döndürmeli (ValueError ile çökmemeli)"\nk, o, e = calistir(["kargo.py", "Ankara", "-4"])\nassert k == 1, "Negatif desi 1 döndürmeli"\nk, o, e = calistir(["kargo.py", "Ankara", "1", "fazla"])\nassert k == 2, "Fazla argüman da kullanım hatasıdır: 2"\n',
      hints: ['Sıra: önce argüman sayısı (2), sonra desi doğrulama (1), en son hesap (0).', 'float("abc") ValueError fırlatır; try/except ile yakala ve hata yoluna yönlendir.', 'Ücret formatı: f"{sehir}: {ucret:.2f} TL"'],
      why: 'Bu, profesyonel CLI iskeletidir: tüm girdiler parametre (argv, env, akışlar), sonuç çıkış kodu. Kenar durumlar (eksik/fazla argüman, sayı olmayan desi, negatif değer) ayrı kodlarla ve stderr mesajlarıyla raporlanır; stdout yalnız temiz sonucu içerir.' }
  ],
  faq: [
    { q: 'python mu yazmalıyım, python3 mü, py mi?',
      a: 'macOS ve Linux\'ta sistemde eski Python 2 kalıntıları olabildiği için genellikle <code>python3</code> yazılır. Windows\'ta resmi kurulum <code>py</code> başlatıcısını getirir; <code>py -3.12</code> ile sürüm de seçebilirsin. Sanal ortam etkinken üçü de aynı Python\'ı gösterir; emin olmak için <code>python -c "import sys; print(sys.executable)"</code> yaz.' },
    { q: 'Komut "is not recognized" ya da "command not found" diyor. Neden?',
      a: 'Terminal o programı PATH ortam değişkenindeki klasörlerde bulamadı. Ya kurulu değil, ya kurulumda PATH\'e eklenmedi, ya da terminal kurulumdan önce açıldı. Terminali kapatıp aç; olmazsa kurulum dersindeki PATH adımlarına dön.' },
    { q: 'sys.exit() ile return arasındaki fark ne?',
      a: '<code>return</code> yalnızca içinde bulunduğun fonksiyondan çıkar. <code>sys.exit()</code> SystemExit istisnası fırlatarak tüm programı bitirir. Test edilebilirlik için iç fonksiyonlarda return kullan, sys.exit\'i yalnız en dışta <code>sys.exit(main(sys.argv))</code> olarak çağır.' },
    { q: 'Ortam değişkenini kalıcı nasıl yaparım?',
      a: '<code>export</code> ve <code>set</code> yalnız açık terminal oturumu için geçerlidir. Kalıcı yapmak için macOS/Linux\'ta <code>~/.bashrc</code> ya da <code>~/.zshrc</code> dosyasına export satırı eklenir; Windows\'ta "Sistem ortam değişkenlerini düzenle" penceresi ya da <code>setx</code> kullanılır. Projelerde sık görülen yol ise <code>.env</code> dosyası ve python-dotenv paketidir (dosya Git\'e eklenmez).' },
    { q: 'stdout ve stderr ekranda aynı görünüyor, ayrımı neden önemsemeliyim?',
      a: 'Çünkü biri dosyaya yönlendirildiğinde fark ortaya çıkar. <code>python rapor.py &gt; rapor.csv</code> yalnız stdout\'u dosyaya yazar; stderr ekranda kalır. Uyarıları print ile stdout\'a yazarsan CSV dosyan bozulur ve onu okuyan bir sonraki program hata verir.' }
  ],
  mistakes: [
    { bad: 'gun = sys.argv[2]\nbitis = baslangic + gun',
      good: 'gun = int(sys.argv[2])\nbitis = baslangic + gun',
      why: 'Komut satırı argümanları her zaman str gelir; sayısal işlemden önce int/float ile çevir.' },
    { bad: 'for dosya in sys.argv:\n    isle(dosya)',
      good: 'for dosya in sys.argv[1:]:\n    isle(dosya)',
      why: 'sys.argv[0] betiğin kendi adıdır; argümanlar 1. indeksten başlar.' },
    { bad: 'sifre = os.environ["DB_SIFRE"]\nport = os.environ.get("DB_PORT")',
      good: 'sifre = os.environ.get("DB_SIFRE")\nif sifre is None:\n    sys.exit("DB_SIFRE tanımlı değil")\nport = int(os.environ.get("DB_PORT", "5432"))',
      why: 'Köşeli parantez tanımsız değişkende KeyError verir; get ile kontrol et, varsayılan ver ve sayıları dönüştür.' },
    { bad: 'print("UYARI: 3 satır atlandı")\nprint("urun,adet")',
      good: 'print("UYARI: 3 satır atlandı", file=sys.stderr)\nprint("urun,adet")',
      why: 'Uyarılar stdout\'a yazılırsa > ile yönlendirilen veri dosyasına karışır; mesajlar stderr\'e gider.' },
    { bad: 'open("veri/satis.csv")   # betik başka klasörden çalışınca bulunamaz',
      good: 'from pathlib import Path\nKLASOR = Path(__file__).parent\nopen(KLASOR / "veri" / "satis.csv")',
      why: 'Göreli yollar betiğin değil terminalin çalışma dizinine göre çözülür; betiğe göre yol için __file__ kullan.' }
  ]
});
})(window);
/* PythonPatika v2/t2 — Karakterler, Unicode ve Türkçe */
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push({
  id: 'unicode-metin',
  lv: 'temel',
  mod: 'Veri Türleri',
  min: 40,
  title: 'Karakterler, Unicode ve Türkçe',
  sum: 'ASCII, Unicode ve UTF-8 farkı, kod noktası ve ord/chr, kaçış dizileri ve ham dize, bytes ile encode/decode, encoding="utf-8", Türkçe I/İ tuzakları, Türk alfabesine göre sıralama ve unicodedata ile normalleştirmeyi öğrenirsin.',
  goals: ['ASCII, Unicode ve UTF-8 arasındaki farkı açıklar, bir karakterin kod noktasını ve bayt sayısını bulabilirim.', 'Kaçış dizilerini ve ham dizeleri doğru kullanır, Windows yolu tuzağından kaçınırım.', 'str ile bytes arasında encode/decode yapar, UnicodeDecodeError\'ı doğru kodlamayla çözerim.', 'Türkçe I/İ/ı/i için doğru büyük-küçük harf dönüşümü ve Türk alfabesine göre sıralama yazabilirim.', 'unicodedata.normalize ile metinleri karşılaştırma ve arama için normalleştiririm.'],
  body: `
<h2>Bir harf neden bu kadar sorun çıkarır?</h2>
<p>Anadolu Market'in müşteri listesini Excel'den aldın; "Şişli" yerine "Ãžiãžli", "İzmir" yerine "Ä°zmir" görüyorsun. Aramada "istanbul" yazan müşteri "İSTANBUL" kaydını bulamıyor. Alfabetik sıralı raporda "Çorum" listenin en sonunda, "Zonguldak"tan sonra çıkıyor. Bunların hepsi aynı kökten gelir: bilgisayar harf bilmez, <b>sayı</b> bilir. Bir harfin hangi sayıyla, o sayının da hangi baytlarla saklandığını anlamayan geliştirici, Türkçe veriyle her gün bu hatalarla boğuşur. Bu ders metinlerin "altını" gösteriyor: Unicode, UTF-8, bytes ve Türkçeye özel tuzaklar. Metin metotlarını (split, strip, replace) metinler dersinde gördün; burada karakterin kendisine iniyoruz.</p>

<h2>ASCII, Unicode ve UTF-8</h2>
<p><b>ASCII</b> (1960'lar) 128 karakterlik bir tablodur: İngilizce harfler, rakamlar, noktalama. "A" = 65, "a" = 97. ç, ş, ğ, ı, İ, ö, ü yoktur. Bu yüzden her ülke kendi 256'lık tablosunu yaptı; Türkçe için Windows'ta <b>cp1254</b>, standartlarda <b>ISO-8859-9</b>. Aynı sayı farklı tabloda farklı harf demekti ve karmaşa buradan doğdu.</p>
<p><b>Unicode</b> bu karmaşayı bitiren evrensel katalogdur: dünyadaki her karaktere (emoji dâhil) tek bir numara verir. Bu numaraya <b>kod noktası</b> (code point) denir ve <code>U+00E7</code> (ç) biçiminde yazılır. Unicode "hangi numara" sorusunu çözer; "bu numara diske hangi baytlarla yazılır" sorusunu ise bir <b>kodlama</b> (encoding) çözer. Bugünün standardı <b>UTF-8</b>'dir: ASCII karakterlerini 1 bayt, Türkçe harfleri 2 bayt, çoğu Asya karakterini 3, emojileri 4 baytla yazar. ASCII ile geriye dönük uyumludur; web sayfalarının çok büyük bölümü UTF-8'dir.</p>
<div class="tbl-wrap"><table>
<tr><th>Karakter</th><th>Kod noktası</th><th>ord()</th><th>UTF-8 baytları</th><th>cp1254</th></tr>
<tr><td>A</td><td>U+0041</td><td>65</td><td>41 (1 bayt)</td><td>41</td></tr>
<tr><td>ç</td><td>U+00E7</td><td>231</td><td>C3 A7 (2 bayt)</td><td>E7</td></tr>
<tr><td>ş</td><td>U+015F</td><td>351</td><td>C5 9F (2 bayt)</td><td>FE</td></tr>
<tr><td>ı</td><td>U+0131</td><td>305</td><td>C4 B1 (2 bayt)</td><td>FD</td></tr>
<tr><td>İ</td><td>U+0130</td><td>304</td><td>C4 B0 (2 bayt)</td><td>DD</td></tr>
<tr><td>₺</td><td>U+20BA</td><td>8378</td><td>E2 82 BA (3 bayt)</td><td>yok</td></tr>
<tr><td>😀</td><td>U+1F600</td><td>128512</td><td>F0 9F 98 80 (4 bayt)</td><td>yok</td></tr>
</table></div>

<h2>ord, chr ve kaçış dizileri</h2>
<p>Python 3'te <code>str</code> türü bir Unicode kod noktaları dizisidir. <code>ord(karakter)</code> kod noktasını, <code>chr(sayi)</code> karakteri verir. Klavyede olmayan karakterleri metin içinde <b>kaçış dizileriyle</b> (escape sequences) yazarsın.</p>
<pre class="py">print(ord("A"), ord("a"), ord("ç"), ord("₺"))
print(chr(65), chr(304), chr(0x20BA))
print(f"U+{ord('ş'):04X}")              # kod noktası gösterimi

print("Fiyat: 120\\u20ba")               # \\u + 4 hane
print("\\N{LATIN CAPITAL LETTER I WITH DOT ABOVE}zmir")   # adıyla
print("Ad\\tŞehir\\nAyşe\\tİzmir")         # sekme ve satır sonu
print("C:\\\\raporlar\\\\yeni", 'Market\\'in', "\\"tırnak\\"")
print(r"C:\\raporlar\\yeni")              # ham dize: \\ olduğu gibi</pre>
<div class="tbl-wrap"><table>
<tr><th>Dizi</th><th>Anlamı</th><th>Dizi</th><th>Anlamı</th></tr>
<tr><td><code>\\n</code></td><td>Satır sonu (newline)</td><td><code>\\\\</code></td><td>Ters eğik çizginin kendisi</td></tr>
<tr><td><code>\\t</code></td><td>Sekme (tab)</td><td><code>\\'</code> <code>\\"</code></td><td>Tırnak işareti</td></tr>
<tr><td><code>\\r</code></td><td>Satır başına dön (Windows satır sonu <code>\\r\\n</code>)</td><td><code>\\xhh</code></td><td>2 haneli onaltılık kod</td></tr>
<tr><td><code>\\uhhhh</code></td><td>4 haneli kod noktası</td><td><code>\\U0001F600</code></td><td>8 haneli kod noktası</td></tr>
</table></div>
<div class="warn"><b>Windows yolu tuzağı</b><code>"C:\\yeni\\tablo.csv"</code> yazarsan <code>\\t</code> sekmeye dönüşür ve dosya bulunamaz (<code>\\y</code> ise Python 3.12'de SyntaxWarning verir). Üç çözüm: ham dize <code>r"C:\\yeni\\tablo.csv"</code>, ileri eğik çizgi <code>"C:/yeni/tablo.csv"</code> (Windows bunu da kabul eder) ya da en iyisi <code>pathlib.Path</code>. Ham dize tek ters eğik çizgiyle bitemez: <code>r"C:\\"</code> sözdizimi hatasıdır.</div>

<h2>bytes: metnin disk ve ağdaki hâli</h2>
<p>Dosyalar, ağ paketleri ve veritabanı sürücüleri <b>bayt</b> taşır. Python'da bunun türü <code>bytes</code>'tır ve <code>b"..."</code> ile yazılır. Metni bayta çevirmeye <b>encode</b> (kodlama), bayttan metne dönmeye <b>decode</b> (kod çözme) denir. Kural: <b>içeride str, sınırda bytes</b>. Programına giren baytı hemen decode et, çıkarken encode et.</p>
<pre class="py">metin = "Şube: İzmir ₺"
veri = metin.encode("utf-8")
print(veri)
print(len(metin), "karakter,", len(veri), "bayt")
print(veri.decode("utf-8") == metin)

eski = metin[:-2].encode("cp1254")          # eski Windows Türkçe tablosu
print(eski, len(eski), "bayt")
try:
    eski.decode("utf-8")
except UnicodeDecodeError as e:
    print("Hata:", e.reason, "| konum:", e.start)
print(eski.decode("cp1254"))
print(eski.decode("utf-8", errors="replace"))</pre>
<p>Son satırdaki <code>errors="replace"</code> çözülemeyen baytları <code>&#xFFFD;</code> ile değiştirir; <code>"ignore"</code> sessizce atar. İkisi de veri kaybıdır, yalnızca son çare olarak kullan. Asıl çözüm: verinin hangi kodlamayla yazıldığını öğrenip onunla açmak.</p>
<h3>Dosyalarda encoding="utf-8"</h3>
<p><code>open()</code> kodlama belirtilmezse işletim sisteminin varsayılanını kullanır; Türkçe Windows'ta bu genellikle cp1254'tür, macOS/Linux'ta UTF-8. Aynı kod iki bilgisayarda farklı davranır. Bu yüzden metin dosyası açarken <b>her zaman</b> <code>encoding="utf-8"</code> yaz. Excel'in "CSV UTF-8" kaydı dosyanın başına görünmez bir BOM işareti koyar; böyle dosyaları <code>encoding="utf-8-sig"</code> ile açarsan ilk sütun adı bozulmaz.</p>
<pre class="py">with open("musteriler.csv", "w", encoding="utf-8") as f:
    f.write("ad;şehir\\nAyşe;İzmir\\nÇağrı;Muğla\\n")

with open("musteriler.csv", encoding="utf-8") as f:
    print(f.read())

with open("musteriler.csv", "rb") as f:          # ikili mod: bytes gelir
    print(f.read()[:12])</pre>

<h2>Türkçe I/İ/ı/i: büyük-küçük harf tuzağı</h2>
<p>Türkçede dört ayrı i harfi vardır: noktalı <b>i/İ</b> ve noktasız <b>ı/I</b>. Python'un <code>upper()</code> ve <code>lower()</code> metotları Unicode'un <b>dilden bağımsız</b> kurallarını uygular; o kurallarda <code>i</code>'nin büyüğü <code>I</code>'dır. Sonuç:</p>
<pre class="py">print("istanbul".upper())          # ISTANBUL  (İSTANBUL değil!)
print("IĞDIR".lower())             # iğdir     (ığdır değil!)
print("ırmak".upper())             # IRMAK     (doğru)
kucuk = "İzmir".lower()
print(kucuk, len(kucuk), len("İzmir"))   # i + birleşik nokta: 6 karakter!
print(kucuk == "izmir")
print("Straße".lower(), "Straße".casefold())   # casefold daha agresif</pre>
<p><code>"İ".lower()</code>, <code>i</code> ve ardından görünmez bir <b>birleşik nokta</b> (U+0307) üretir; uzunluk 2 olur ve "izmir" ile eşleşmez. <code>casefold()</code> büyük/küçük harf duyarsız karşılaştırma için tasarlanmıştır (Almanca ß → ss) ama Türkçe I sorununu o da çözmez. Çözüm basit: büyütmeden/küçültmeden önce dört harfi elle eşle.</p>
<pre class="py">def tr_upper(metin):
    return metin.replace("i", "İ").replace("ı", "I").upper()

def tr_lower(metin):
    return metin.replace("İ", "i").replace("I", "ı").lower()

print(tr_upper("istanbul ılgaz"))     # İSTANBUL ILGAZ
print(tr_lower("IĞDIR İZMİR"))        # ığdır izmir
print(tr_lower("İzmir") == "izmir")   # True</pre>
<div class="tip"><b>str.maketrans ile daha hızlı</b>Çok sayıda kayıtta <code>TR_BUYUK = str.maketrans("iı", "İI")</code> tablosunu bir kez oluşturup <code>metin.translate(TR_BUYUK).upper()</code> kullanmak, zincirleme replace'ten daha hızlı ve okunurdur.</div>

<h2>Metin karşılaştırma ve Türkçe sıralama</h2>
<p>Python metinleri <b>kod noktası sırasıyla</b>, karakter karakter karşılaştırır (sözlükbilimsel, lexicographic). İlk farklı karakter kazananı belirler; biri diğerinin başıysa kısa olan küçüktür. Bu, PCAP sınavının sevdiği bir konudur ve üç sürpriz içerir: büyük harfler küçüklerden önce gelir (<code>"Z" &lt; "a"</code>), rakamlar metin gibi karşılaştırılır (<code>"10" &lt; "9"</code>) ve Türkçe harfler İngilizce alfabenin <b>sonuna</b> düşer (ç = 231, z = 122).</p>
<pre class="py">print("Zeytin" &lt; "armut", "10" &lt; "9", "elma" &lt; "elmas")
sehirler = ["Zonguldak", "çorum", "Ankara", "Iğdır", "İzmir", "ağrı", "Bursa", "Şanlıurfa"]
print(sorted(sehirler))

ALFABE = "abcçdefgğhıijklmnoöpqrsştuüvwxyz"
SIRA = {harf: i for i, harf in enumerate(ALFABE)}

def tr_anahtar(kelime):
    kucuk = kelime.replace("İ", "i").replace("I", "ı").lower()
    return [SIRA.get(h, 100 + ord(h)) for h in kucuk]

print(sorted(sehirler, key=tr_anahtar))</pre>
<p><code>sorted</code>'a verdiğin <code>key</code> fonksiyonu her elemanı karşılaştırılabilir bir değere çevirir; burada her harfi Türk alfabesindeki sırasına. Alfabede olmayan karakterler (boşluk, rakam) 100'den sonraya, kendi kod noktası sırasıyla yerleşir. Kendi bilgisayarında <code>locale.setlocale(locale.LC_COLLATE, "tr_TR.UTF-8")</code> ve <code>key=locale.strxfrm</code> da kullanılabilir, ama yerel ayarın sistemde kurulu olmasına bağlıdır; sunucularda çoğu zaman yoktur.</p>

<h2>Normalleştirme: aynı görünen, farklı olan</h2>
<p>"ç" harfi Unicode'da iki biçimde yazılabilir: tek kod noktası <code>U+00E7</code> (birleşik, NFC) ya da <code>c</code> + birleşik çengel <code>U+0327</code> (ayrışık, NFD). Ekranda aynı görünürler ama <code>==</code> False döner. macOS dosya adları ve bazı kopyala-yapıştır kaynakları NFD üretir. <code>unicodedata.normalize</code> ikisini aynı biçime getirir; aynı araç aksanları silmek (URL kısaltması, "slug") için de kullanılır.</p>
<pre class="py">import unicodedata

a = "\\u00e7ay"           # ç tek kod noktası
b = "c\\u0327ay"          # c + birleşik çengel
print(a, b, a == b, len(a), len(b))
print(unicodedata.normalize("NFC", a) == unicodedata.normalize("NFC", b))

def aksansiz(metin):
    ayrik = unicodedata.normalize("NFD", metin)
    sade = "".join(h for h in ayrik if not unicodedata.combining(h))
    return sade.replace("ı", "i")      # ı ayrışmaz, elle eşle

print(aksansiz("Çağrı Şüküroğlu Gölbaşı"))
print(unicodedata.name("ğ"))</pre>
<div class="note"><b>Gerçek işte</b>Anadolu Bank müşteri eşleştirme ekibi, şubelerden gelen "İSMAİL ÖZTÜRK", "ismail ozturk" ve "Ismail Öztürk" kayıtlarının aynı kişi olup olmadığını bulmak zorunda. Kullandıkları "anahtar üretici" tam olarak bu dersin adımlarıdır: NFC normalleştirme, Türkçe kurallarıyla küçük harf, aksanları silme, fazla boşlukları teke indirme. Bu anahtar üzerinden yapılan eşleştirme, mükerrer müşteri kaydını ve bunun yol açtığı yanlış risk raporlarını büyük ölçüde azaltır. E-ticaret aramasında da aynı mantık çalışır: "cagri" yazan kullanıcı "Çağrı" ürününü bulmalıdır.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Karakter mi, kod noktası mı, grafem mi?</h3>
<p><code>len()</code> kod noktası sayar. Kullanıcının "bir karakter" gördüğü şeye <b>grafem</b> (grapheme) denir ve birden fazla kod noktasından oluşabilir: ayrışık "ç" 2, bayrak emojisi 2, aile emojisi 7 kod noktasıdır. SMS karakter sayacı ya da isim kısaltma gibi işlerde bu fark hataya yol açar. Grafem kümelemesi için <code>regex</code> paketinin <code>\\X</code> deseni ya da <code>grapheme</code> paketi kullanılır (kendi bilgisayarında: <code>pip install regex</code>).</p>
<h3>Bayt sınırı olan alanlar</h3>
<p>Bazı veritabanı sütunları ve protokoller sınırı karakter değil <b>bayt</b> olarak koyar. "50 karakter" sandığın "ŞŞŞ..." metni UTF-8'de 100 bayttır. Kırparken baytı ortadan bölersen geçersiz UTF-8 üretirsin; doğru yol karakter karakter ilerleyip bayt toplamını izlemek ya da <code>veri[:sinir].decode("utf-8", errors="ignore")</code> ile yarım kalan son karakteri atmaktır.</p>
<h3>Varsayılan kodlamanın geleceği</h3>
<p>PEP 686 ile Python 3.15'te UTF-8 modu varsayılan hâle geliyor; o zaman <code>open()</code> her platformda UTF-8 kullanacak. O güne kadar ve eski sürümleri destekleyen her kodda <code>encoding="utf-8"</code> yazmak tek güvenli yoldur. <code>python -X utf8</code> ya da <code>PYTHONUTF8=1</code> ortam değişkeni bu modu bugünden açar.</p>
<h3>Gerçek dilbilimsel sıralama</h3>
<p>Kendi anahtar fonksiyonun Türkçe için yeterlidir; çok dilli ürünlerde ise Unicode Collation Algorithm (UCA) gerekir. PyICU paketi bunu sağlar: <code>icu.Collator.createInstance(icu.Locale("tr_TR"))</code>. Veritabanı tarafında PostgreSQL'in <code>COLLATE "tr-TR-x-icu"</code> ayarı aynı işi yapar.</p>
</section>
`,
  ex: [
    { t: 'mc',
      stage: 'Isınma',
      q: '"ş" harfi UTF-8 ile kodlandığında kaç bayt yer kaplar?',
      o: ['1', '2', '3', '4'],
      a: 1,
      why: 'ASCII dışındaki Latin harfleri (ç, ş, ğ, ı, İ, ö, ü) UTF-8\'de 2 bayttır. ASCII karakterleri 1, ₺ gibi semboller 3, emojiler 4 bayttır.' },
    { t: 'mc',
      stage: 'Isınma',
      q: 'Python\'da <code>"IĞDIR".lower()</code> ne döndürür?',
      o: ['"ığdır"', '"iğdir"', '"IĞDIR"', 'UnicodeError'],
      a: 1,
      why: 'lower() dilden bağımsız Unicode kuralını uygular: I\'nın küçüğü i\'dir. Türkçe doğru sonuç (ığdır) için I → ı eşlemesini önceden elle yapmalısın.' },
    { t: 'mc',
      stage: 'Isınma',
      q: '<code>UnicodeDecodeError</code> hatası en çok hangi durumda ortaya çıkar?',
      o: ['Metin çok uzun olduğunda', 'str değerini encode etmeye çalışırken', 'Baytları yanlış kodlamayla çözerken', 'Dosya bulunamadığında'],
      a: 2,
      why: 'Decode bayttan metne dönüştür. cp1254 ile yazılmış baytları utf-8 ile çözmeye çalışınca geçersiz bayt dizileri bu hatayı verir. Çözüm doğru kodlamayı (encoding=...) belirtmektir.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Bu kod ne yazdırır?',
      code: 'print(len("çay"), len("çay".encode("utf-8")), "Zeytin" < "armut")\n',
      o: ['3 3 False', '3 4 True', '4 4 True', '3 4 False'],
      a: 1,
      why: '"çay" 3 karakterdir; ç UTF-8\'de 2 bayt olduğundan toplam 4 bayt. "Z" (90) "a"dan (97) küçük kod noktasına sahip olduğu için "Zeytin" < "armut" True\'dur.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Bu kod ne yazdırır?',
      code: 'k = "İ".lower()\nprint(k == "i", len(k))\n',
      o: ['True 1', 'False 1', 'False 2', 'True 2'],
      a: 2,
      why: '"İ".lower() tek başına i değil, i + birleşik nokta (U+0307) üretir. Bu yüzden "i" ile eşit değildir ve uzunluğu 2\'dir. Türkçe metinde tr_lower gibi bir yardımcı şart.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Bu kod ne yazdırır?',
      code: 'print(sorted(["Zeytin", "armut", "Çilek", "elma"]))\n',
      o: ['[\'armut\', \'Çilek\', \'elma\', \'Zeytin\']', '[\'Zeytin\', \'armut\', \'elma\', \'Çilek\']', '[\'armut\', \'elma\', \'Zeytin\', \'Çilek\']', '[\'Çilek\', \'Zeytin\', \'armut\', \'elma\']'],
      a: 1,
      why: 'Varsayılan sıralama kod noktasına göredir: büyük harfler (Z=90) küçüklerden (a=97) önce, Ç (199) ise ASCII harflerinin tamamından sonra gelir. Türkçe sıralama için key fonksiyonu gerekir.' },
    { t: 'order',
      stage: 'Kodu oku',
      q: '<p>Bir metni UTF-8 baytlarına çevirip geri çözen ve karakter sayısı, bayt sayısı ile gidiş-dönüş eşitliğini yazdıran programı sırala. Çıktı <code>11 13 True</code> olmalı.</p>',
      lines: ['ham = "Şube: İzmir"', 'veri = ham.encode("utf-8")', 'geri = veri.decode("utf-8")', 'print(len(ham), len(veri), geri == ham)'],
      expect: '11 13 True\n',
      hint: 'Önce metin, sonra encode (str → bytes), sonra decode (bytes → str).',
      why: 'encode metni bayta, decode baytı metne çevirir. Ş ve İ ikişer bayt olduğu için 11 karakter 13 bayt eder; aynı kodlamayla gidiş-dönüş kayıpsızdır.' },
    { t: 'code',
      id: 'unicode-metin-1',
      stage: 'Rehberli',
      diff: 1,
      q: '<p>Anadolu Market kargo etiketlerinde şehir ve müşteri adları büyük harfle basılıyor, arama kutusunda ise küçük harfe çevriliyor. Türkçe kurallarına uyan iki fonksiyon yaz: <code>tr_upper(metin)</code> ve <code>tr_lower(metin)</code>. <code>i ↔ İ</code> ve <code>ı ↔ I</code> doğru eşleşmeli; diğer harfler normal upper/lower ile dönüşmeli.</p>',
      guide: ['tr_upper: önce "i" → "İ" ve "ı" → "I" değiştir.', 'Sonra kalan harfler için .upper() çağır.', 'tr_lower: önce "İ" → "i" ve "I" → "ı" değiştir.', 'Sonra .lower() çağır.'],
      example: '# Aynı fikir: özel durumu önce elle çöz, sonra genel kuralı uygula\ndef almanca_buyuk(metin):\n    return metin.replace("ß", "ẞ").upper()\n\nprint(almanca_buyuk("straße"))\n',
      start: 'def tr_upper(metin):\n    # TODO: i ve ı harflerini önce elle dönüştür\n    return metin.upper()\n\ndef tr_lower(metin):\n    # TODO: İ ve I harflerini önce elle dönüştür\n    return metin.lower()\n',
      sol: 'def tr_upper(metin):\n    return metin.replace("i", "İ").replace("ı", "I").upper()\n\ndef tr_lower(metin):\n    return metin.replace("İ", "i").replace("I", "ı").lower()\n',
      tests: 'assert tr_upper("istanbul") == "İSTANBUL", "i büyüyünce İ olmalı"\nassert tr_upper("ılgaz çiçek") == "ILGAZ ÇİÇEK", "ı → I, i → İ, ç → Ç"\nassert tr_lower("IĞDIR") == "ığdır", "I küçülünce ı olmalı"\nassert tr_lower("İZMİR") == "izmir", "İ küçülünce tek karakterlik i olmalı"\nassert len(tr_lower("İ")) == 1, "Birleşik nokta (U+0307) kalmamalı"\nassert tr_lower(tr_upper("şırınga ile")) == "şırınga ile", "Gidiş-dönüş aynı metni vermeli"\n',
      hints: ['Python\'un upper/lower\'ı Türkçe değil, dilden bağımsız kurala göre çalışır.', 'replace\'i upper/lower\'dan ÖNCE uygula; sonra yaparsan iş işten geçmiş olur.', 'return metin.replace("i", "İ").replace("ı", "I").upper()'],
      why: 'Özel durumları önce elle dönüştürüp kalanını genel metoda bırakmak, dil-özel kuralları uygulamanın en basit yoludur. "İ".lower() birleşik nokta ürettiği için tr_lower\'da İ → i eşlemesi şarttır.' },
    { t: 'code',
      id: 'unicode-metin-2',
      stage: 'Rehberli',
      diff: 2,
      q: '<p>Belediye nüfus raporundaki mahalle adları Türk alfabesine göre sıralanmalı. <code>tr_sirala(kelimeler)</code> fonksiyonu yeni bir sıralı liste döndürsün:</p><ul><li>Alfabe: <code>"abcçdefgğhıijklmnoöpqrsştuüvwxyz"</code></li><li>Büyük/küçük harf fark etmesin (Türkçe kurallarıyla küçült: İ→i, I→ı).</li><li>Alfabede olmayan karakterler (boşluk, rakam, tire) tüm harflerden sonra, kendi kod noktası sırasıyla gelsin.</li></ul>',
      guide: ['Harf → sıra numarası sözlüğü kur: {harf: i for i, harf in enumerate(ALFABE)}.', 'tr_anahtar(kelime) yardımcı fonksiyonu yaz: önce Türkçe küçült.', 'Her harfi sıra numarasına çevir; sözlükte yoksa 100 + ord(harf) kullan.', 'Liste döndür ve sorted(kelimeler, key=tr_anahtar) ile sırala.'],
      example: '# Özel sıra: beden ölçülerini mantıklı sıraya koy\nSIRA = {"S": 0, "M": 1, "L": 2, "XL": 3}\nbedenler = ["XL", "S", "L", "M", "S"]\nprint(sorted(bedenler, key=lambda b: SIRA.get(b, 99)))\n',
      start: 'ALFABE = "abcçdefgğhıijklmnoöpqrsştuüvwxyz"\nSIRA = {harf: i for i, harf in enumerate(ALFABE)}\n\ndef tr_anahtar(kelime):\n    # TODO: Türkçe küçült, sonra her harfi sıra numarasına çevir\n    return kelime.lower()\n\ndef tr_sirala(kelimeler):\n    # TODO: key olarak tr_anahtar kullan\n    return sorted(kelimeler)\n',
      sol: 'ALFABE = "abcçdefgğhıijklmnoöpqrsştuüvwxyz"\nSIRA = {harf: i for i, harf in enumerate(ALFABE)}\n\ndef tr_anahtar(kelime):\n    kucuk = kelime.replace("İ", "i").replace("I", "ı").lower()\n    return [SIRA.get(h, 100 + ord(h)) for h in kucuk]\n\ndef tr_sirala(kelimeler):\n    return sorted(kelimeler, key=tr_anahtar)\n',
      tests: 'm = ["Zafer", "çamlık", "Cumhuriyet", "Işıklar", "İnönü", "hürriyet", "Ğ Sokak", "Gazi", "Şirinyer", "sahil", "Ufuk", "Ümit", "Ova", "Özgür"]\nbeklenen = ["Cumhuriyet", "çamlık", "Gazi", "Ğ Sokak", "hürriyet", "Işıklar", "İnönü", "Ova", "Özgür", "sahil", "Şirinyer", "Ufuk", "Ümit", "Zafer"]\nassert tr_sirala(m) == beklenen, "Türk alfabesi sırası bekleniyordu, geldi: " + repr(tr_sirala(m))\nassert tr_sirala(["ab", "a"]) == ["a", "ab"], "Kısa olan (önek) önce gelmeli"\nassert tr_sirala(["a1", "a b", "ab"]) == ["ab", "a b", "a1"], "Harf olmayanlar harflerden sonra gelmeli"\nliste = ["b", "a"]\ntr_sirala(liste)\nassert liste == ["b", "a"], "Orijinal liste değişmemeli (sorted yeni liste döndürür)"\n',
      hints: ['sorted(..., key=f) her elemanı f ile karşılaştırılabilir bir değere çevirir; listeler eleman eleman karşılaştırılır.', 'dict.get(h, 100 + ord(h)) alfabede olmayan karakteri sona atar.', 'return [SIRA.get(h, 100 + ord(h)) for h in kucuk]'],
      why: 'key fonksiyonu her kelimeyi bir sayı listesine çevirir; Python listeleri soldan sağa karşılaştırdığı için sonuç Türk alfabesine göre sözlükbilimsel sıradır. Küçültmeyi Türkçe kuralıyla yapmak I/İ harflerinin doğru yere düşmesini sağlar.' },
    { t: 'code',
      id: 'unicode-metin-3',
      stage: 'Rehberli',
      diff: 2,
      q: '<p>Şubelerden gelen dosyaların bazıları UTF-8, bazıları eski Windows Türkçe (cp1254) kodlamasında. <code>guvenli_coz(veri)</code> fonksiyonu <code>bytes</code> alsın ve:</p><ul><li>Önce UTF-8 ile çözmeyi denesin.</li><li><code>UnicodeDecodeError</code> olursa cp1254 ile çözsün.</li><li><code>(metin, kullanilan_kodlama)</code> demeti döndürsün; kodlama adı <code>"utf-8"</code> ya da <code>"cp1254"</code>.</li></ul>',
      guide: ['try bloğunda veri.decode("utf-8") dene ve ("...", "utf-8") döndür.', 'except UnicodeDecodeError bloğu yaz.', 'Orada veri.decode("cp1254") ile çöz ve kodlamayı "cp1254" olarak döndür.'],
      example: 'def sayi_oku(metin):\n    try:\n        return int(metin), "tam sayı"\n    except ValueError:\n        return float(metin), "ondalık"\n\nprint(sayi_oku("42"), sayi_oku("4.5"))\n',
      start: 'def guvenli_coz(veri):\n    # TODO: önce utf-8 dene, olmazsa cp1254\n    return veri.decode("utf-8"), "utf-8"\n',
      sol: 'def guvenli_coz(veri):\n    try:\n        return veri.decode("utf-8"), "utf-8"\n    except UnicodeDecodeError:\n        return veri.decode("cp1254"), "cp1254"\n',
      tests: 'assert guvenli_coz("Şeker 1 kg".encode("utf-8")) == ("Şeker 1 kg", "utf-8"), "UTF-8 veri utf-8 ile çözülmeli"\nassert guvenli_coz("Şeker 1 kg".encode("cp1254")) == ("Şeker 1 kg", "cp1254"), "cp1254 veri UnicodeDecodeError sonrası cp1254 ile çözülmeli"\nassert guvenli_coz(b"Cay 2 kg") == ("Cay 2 kg", "utf-8"), "Saf ASCII her iki kodlamada geçerli; utf-8 önce denenmeli"\nassert guvenli_coz("Iğdır".encode("cp1254"))[0] == "Iğdır", "ğ ve ı cp1254\'te de doğru çözülmeli"\n',
      hints: ['Hata türü UnicodeDecodeError; genel except kullanma.', 'try içindeki return başarılıysa except hiç çalışmaz.', 'except UnicodeDecodeError: return veri.decode("cp1254"), "cp1254"'],
      why: 'UTF-8 katı bir biçime sahiptir; cp1254 baytları (ör. Ş = 0xDE) çoğu zaman geçersiz UTF-8 dizisi oluşturur ve hata verir. Bu yüzden önce UTF-8 denemek, olmazsa eski kodlamaya düşmek pratik ve güvenilir bir sezgiseldir. Ters sırayla denersen cp1254 her baytı kabul ettiği için UTF-8 veriyi bozuk çözersin.' },
    { t: 'code',
      id: 'unicode-metin-4',
      stage: 'Rehberli',
      diff: 2,
      q: '<p>Anadolu Market ürün sayfası adresleri (URL) için "slug" üret. <code>slug_yap(baslik)</code>:</p><ul><li>Türkçe kurallarıyla küçük harfe çevir (İ→i, I→ı).</li><li><code>unicodedata.normalize("NFD", ...)</code> ile ayrıştırıp birleşik işaretleri (<code>unicodedata.combining</code>) at; <code>ı</code> harfini elle <code>i</code> yap.</li><li>Harf ya da rakam olmayan her karakter dizisini tek tireye çevir; baştaki/sondaki tireleri sil.</li></ul><p>Örnek: <code>"Çağrı Merkezi: İş İlanı!"</code> → <code>"cagri-merkezi-is-ilani"</code></p>',
      guide: ['Önce Türkçe küçült (İ → i, I → ı, sonra lower).', 'NFD ile ayrıştır ve combining olmayan karakterleri birleştir; ardından ı → i.', 'Karakter karakter gez: isalnum() ise ekle, değilse tire ekle (son karakter zaten tire değilse).', 'Sonucu strip("-") ile temizleyip döndür.'],
      example: 'import unicodedata\nad = "Gölbaşı"\nayrik = unicodedata.normalize("NFD", ad)\nprint(len(ad), len(ayrik))\nprint([unicodedata.name(h) for h in ayrik][:3])\nprint("".join(h for h in ayrik if not unicodedata.combining(h)))\n',
      start: 'import unicodedata\n\ndef slug_yap(baslik):\n    metin = baslik.lower()   # TODO: Türkçe küçült\n    # TODO: NFD + combining olanları at + ı -> i\n    sonuc = ""\n    for h in metin:\n        # TODO: harf/rakam değilse tek tire\n        sonuc += h\n    return sonuc\n',
      sol: 'import unicodedata\n\ndef slug_yap(baslik):\n    metin = baslik.replace("İ", "i").replace("I", "ı").lower()\n    ayrik = unicodedata.normalize("NFD", metin)\n    metin = "".join(h for h in ayrik if not unicodedata.combining(h)).replace("ı", "i")\n    sonuc = ""\n    for h in metin:\n        if h.isalnum():\n            sonuc += h\n        elif not sonuc.endswith("-"):\n            sonuc += "-"\n    return sonuc.strip("-")\n',
      tests: 'assert slug_yap("Çağrı Merkezi: İş İlanı!") == "cagri-merkezi-is-ilani", "Örnek başlık"\nassert slug_yap("  IĞDIR   Kayısısı 1 kg ") == "igdir-kayisisi-1-kg", "Baş/son tire olmamalı, ardışık boşluk tek tire"\nassert slug_yap("Şüküroğlu & Öztürk") == "sukuroglu-ozturk", "Aksanlar silinmeli, & ve boşluklar tek tire"\nassert slug_yap("!!!") == "", "Yalnız işaret varsa boş slug"\n',
      hints: ['ı harfinin NFD ayrışması yoktur; combining ile silinmez, replace("ı", "i") gerekir.', 'İ\'yi lower() ile küçültürsen i + birleşik nokta olur; NFD aşaması noktayı siler ama Türkçe küçültme ile başlamak daha temizdir.', 'Tire eklemeden önce sonuc.endswith("-") ile tekrarı engelle.'],
      why: 'NFD her aksanlı harfi taban harf + birleşik işarete ayırır; combining işaretleri atınca ç→c, ş→s, ğ→g, ö→o, ü→u olur. ı tek kod noktası olduğundan elle eşlenir. Bu, arama motorları ve URL\'ler için yaygın bir "ASCII\'leştirme" kalıbıdır.' },
    { t: 'code',
      id: 'unicode-metin-5',
      stage: 'Kendin yaz',
      diff: 1,
      q: '<p><code>kod_noktalari(metin)</code> fonksiyonu metindeki her karakterin Unicode kod noktasını <code>"U+XXXX"</code> biçiminde (en az 4 haneli, büyük harfli onaltılık) bir liste olarak döndürsün. Örnek: <code>kod_noktalari("Aç")</code> → <code>["U+0041", "U+00E7"]</code>.</p>',
      start: 'def kod_noktalari(metin):\n    pass\n',
      sol: 'def kod_noktalari(metin):\n    return [f"U+{ord(h):04X}" for h in metin]\n',
      tests: 'assert kod_noktalari("Aç") == ["U+0041", "U+00E7"], "A=0041, ç=00E7"\nassert kod_noktalari("İı") == ["U+0130", "U+0131"], "İ ve ı ardışık kod noktalarıdır"\nassert kod_noktalari("₺") == ["U+20BA"], "Türk lirası işareti"\nassert kod_noktalari("😀") == ["U+1F600"], "4 haneden büyük kod noktası kırpılmamalı"\nassert kod_noktalari("") == [], "Boş metin boş liste"\n',
      hints: ['ord(h) kod noktasını tam sayı olarak verir.', 'f-string biçimi: :04X → en az 4 hane, sıfırla doldur, büyük onaltılık.', 'return [f"U+{ord(h):04X}" for h in metin]'],
      why: 'ord karakteri sayıya çevirir, :04X biçimi onu Unicode belgelerindeki standart gösterime dönüştürür. 04 en az genişliktir; daha büyük sayılar kırpılmaz.' },
    { t: 'code',
      id: 'unicode-metin-6',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p>Log dosyasına yazılan kullanıcı mesajlarında satır sonu ve sekme karakterleri log satırlarını bozuyor. <code>gorunur_yap(metin)</code> fonksiyonu:</p><ul><li>Ters eğik çizgi <code>\\</code> → iki karakterlik <code>\\\\</code></li><li>Satır sonu → iki karakterlik <code>\\n</code></li><li>Sekme → iki karakterlik <code>\\t</code></li></ul><p>dönüşümlerini yapsın. Sonuç tek satır olmalı ve dönüşüm geri alınabilir olmalı (önceden metinde bulunan ters eğik çizgi ile senin eklediğin karışmamalı).</p>',
      start: 'def gorunur_yap(metin):\n    pass\n',
      sol: 'def gorunur_yap(metin):\n    return metin.replace("\\\\", "\\\\\\\\").replace("\\n", "\\\\n").replace("\\t", "\\\\t")\n',
      tests: 'assert gorunur_yap("Merhaba\\nDünya") == "Merhaba\\\\nDünya", "Satır sonu iki karakterlik \\\\n olmalı"\nassert gorunur_yap("a\\tb") == "a\\\\tb", "Sekme \\\\t olmalı"\nassert gorunur_yap("C:\\\\yeni") == "C:\\\\\\\\yeni", "Var olan ters eğik çizgi ikiye katlanmalı"\nassert gorunur_yap("x\\\\n") == "x\\\\\\\\n", "Metindeki \\\\ + n ile gerçek satır sonu karışmamalı: önce ters eğik çizgiyi kaçır"\nassert "\\n" not in gorunur_yap("1\\n2\\n3"), "Sonuç tek satır olmalı"\n',
      hints: ['Python kodunda tek ters eğik çizgi "\\\\" ile yazılır; satır sonu "\\n".', 'Sıra önemli: ters eğik çizgiyi EN ÖNCE kaçır, yoksa eklediğin \\n\'leri de ikiye katlarsın.', 'Üç replace\'i zincirle: önce "\\\\", sonra "\\n", sonra "\\t".'],
      why: 'Kaçış işleminde kaçış karakterinin kendisi önce işlenmelidir; aksi hâlde sonraki adımda eklenen ters eğik çizgiler yeniden kaçırılır ve dönüşüm geri alınamaz hâle gelir. repr() ve json.dumps da aynı kuralı izler.' },
    { t: 'code',
      id: 'unicode-metin-7',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p>Müşteri arama formunda iki adın "aynı" sayılıp sayılmayacağına karar veren <code>turkce_esit(a, b)</code> fonksiyonunu yaz. İki metin şu işlemlerden sonra eşitse True döndür: NFC normalleştirme, baş/son boşlukları kırpma, aradaki birden fazla boşluğu teke indirme, Türkçe kurallarıyla küçük harfe çevirme (İ→i, I→ı). Aksanları <b>silme</b>: "Öztürk" ile "Ozturk" farklıdır.</p>',
      start: 'def turkce_esit(a, b):\n    pass\n',
      sol: 'import unicodedata\n\ndef _anahtar(s):\n    s = unicodedata.normalize("NFC", s)\n    s = " ".join(s.split())\n    return s.replace("İ", "i").replace("I", "ı").lower()\n\ndef turkce_esit(a, b):\n    return _anahtar(a) == _anahtar(b)\n',
      tests: 'assert turkce_esit("İSTANBUL", "istanbul"), "İSTANBUL = istanbul"\nassert turkce_esit("IĞDIR", "ığdır"), "IĞDIR = ığdır"\nassert not turkce_esit("ISPARTA", "isparta"), "Türkçede ISPARTA\'nın küçüğü ısparta\'dır; isparta ile eşit değil"\nassert turkce_esit("  Ayşe   Kaya ", "ayşe kaya"), "Boşluklar normalleşmeli"\nassert turkce_esit("c\\u0327ay", "Çay"), "NFD yazılmış ç ile NFC Ç aynı kabul edilmeli"\nassert not turkce_esit("Öztürk", "Ozturk"), "Aksanlar silinmemeli"\n',
      hints: ['Önce iki metni aynı "anahtar" biçimine getiren yardımcı fonksiyon yaz, sonra anahtarları karşılaştır.', '" ".join(s.split()) hem kırpar hem ardışık boşlukları teke indirir.', 'NFC normalleştirmeyi küçültmeden önce yap.'],
      why: 'Karşılaştırmadan önce her iki tarafı aynı kanonik biçime çevirmek (normalize → boşluk → küçült) eşleştirme işlerinin temel kalıbıdır. Python\'un lower() ya da casefold() fonksiyonu Türkçe I/İ için yanlış sonuç vereceğinden kendi eşlemen gerekir.' },
    { t: 'code',
      id: 'unicode-metin-8',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p>SMS sağlayıcısı mesaj başına <b>bayt</b> sınırı koyuyor. <code>utf8_kirp(metin, max_bayt)</code> fonksiyonu, metnin UTF-8 kodlaması <code>max_bayt</code>\'ı aşmayacak en uzun <b>baş kısmını</b> str olarak döndürsün. Karakter asla ortadan bölünmemeli (yarım bayt dizisi kalmamalı).</p>',
      start: 'def utf8_kirp(metin, max_bayt):\n    pass\n',
      sol: 'def utf8_kirp(metin, max_bayt):\n    toplam = 0\n    sonuc = []\n    for h in metin:\n        n = len(h.encode("utf-8"))\n        if toplam + n > max_bayt:\n            break\n        sonuc.append(h)\n        toplam += n\n    return "".join(sonuc)\n',
      tests: 'assert utf8_kirp("Merhaba", 4) == "Merh", "ASCII\'de bayt = karakter"\nassert utf8_kirp("şşş", 5) == "şş", "Her ş 2 bayt; 5 bayta 2 tane sığar, 3. yarım kalmamalı"\nassert utf8_kirp("a₺b", 3) == "a", "₺ 3 bayt; a(1) + ₺(3) = 4 > 3"\nassert utf8_kirp("İzmir", 100) == "İzmir", "Sınır yeterliyse metin aynen döner"\nassert utf8_kirp("çay", 0) == "", "0 baytta boş metin"\nfor n in range(0, 12):\n    assert len(utf8_kirp("Çağrı ₺ 😀", n).encode("utf-8")) <= n, f"{n} bayt sınırı aşılmamalı"\n',
      hints: ['Her karakterin bayt sayısı farklı: len(h.encode("utf-8")).', 'Karakter karakter ilerle; eklemeden önce toplam + n > max_bayt mı diye kontrol et.', 'Alternatif tek satır: metin.encode()[:max_bayt].decode("utf-8", errors="ignore")'],
      why: 'Bayt sınırı olan alanlarda karakter sayısı yanıltıcıdır. Karakter karakter ilerleyip bayt toplamını izlemek kırpmanın her zaman geçerli UTF-8 üretmesini garanti eder. errors="ignore" ile yarım kalan son diziyi atmak da aynı sonucu veren kısa bir yoldur.' },
    { t: 'code',
      id: 'unicode-metin-9',
      stage: 'Hata avı',
      kind: 'bug',
      diff: 1,
      q: '<p><b>Hatayı bul ve düzelt.</b> SMS ağ geçidinden gelen baytları çözen <code>sms_bilgi(veri)</code> fonksiyonu <code>(metin, karakter_sayisi)</code> döndürmeli. Türkçe karakterli mesajlarda çöküyor ve karakter sayısı da yanlış hesaplanıyor. Veri UTF-8 kodlu geliyor.</p>',
      start: 'def sms_bilgi(veri):\n    metin = veri.decode("ascii")\n    return metin, len(veri)\n',
      sol: 'def sms_bilgi(veri):\n    metin = veri.decode("utf-8")\n    return metin, len(metin)\n',
      tests: 'assert sms_bilgi("Kargonuz yolda".encode("utf-8")) == ("Kargonuz yolda", 14), "ASCII mesaj"\nassert sms_bilgi("Şifreniz: 4821".encode("utf-8")) == ("Şifreniz: 4821", 14), "Ş 2 bayttır ama 1 karakterdir: 14 karakter"\nassert sms_bilgi("İyi günler ₺".encode("utf-8"))[1] == 12, "Karakter sayısı baytlardan değil metinden hesaplanmalı"\n',
      hints: ['ASCII yalnızca 128 karakteri bilir; ş, İ, ₺ yoktur.', 'len(veri) bayt sayısıdır; karakter sayısı için çözülmüş metnin uzunluğunu al.', 'veri.decode("utf-8") ve len(metin)'],
      why: 'Veriyi yazıldığı kodlamayla çözmek gerekir: ascii Türkçe baytlarda UnicodeDecodeError verir. len(bytes) bayt, len(str) karakter sayar; UTF-8\'de bunlar ancak saf ASCII metinde eşittir.' },
    { t: 'code',
      id: 'unicode-metin-10',
      stage: 'Hata avı',
      kind: 'bug',
      diff: 2,
      q: '<p><b>Hatayı bul ve düzelt.</b> <code>urun_ara(urunler, sorgu)</code> ürün adlarında büyük/küçük harf duyarsız arama yapıp eşleşenleri liste sırasıyla döndürmeli. Kullanıcı "izmir" yazınca "İZMİR KÖFTE" bulunmuyor, "ISPARTA" yazınca "Isparta Gülü" de bulunmuyor. Türkçe kurallarıyla düzelt.</p>',
      start: 'def urun_ara(urunler, sorgu):\n    s = sorgu.lower()\n    return [u for u in urunler if s in u.lower()]\n',
      sol: 'def tr_lower(metin):\n    return metin.replace("İ", "i").replace("I", "ı").lower()\n\ndef urun_ara(urunler, sorgu):\n    s = tr_lower(sorgu)\n    return [u for u in urunler if s in tr_lower(u)]\n',
      tests: 'urunler = ["İZMİR KÖFTE", "Isparta Gülü", "Iğdır Kayısısı", "izmir boyozu", "Çay"]\nassert urun_ara(urunler, "izmir") == ["İZMİR KÖFTE", "izmir boyozu"], "izmir iki ürünü bulmalı: İ\'nin küçüğü i"\nassert urun_ara(urunler, "ISPARTA") == ["Isparta Gülü"], "ISPARTA → ısparta, Isparta → ısparta"\nassert urun_ara(urunler, "ığdır") == ["Iğdır Kayısısı"], "ı ile arama I içeren ürünü bulmalı"\nassert urun_ara(urunler, "ÇAY") == ["Çay"], "Ç normal kuralla da doğru küçülür"\n',
      hints: ['"İ".lower() i + birleşik nokta verir; "I".lower() ise ı değil i verir.', 'Sorguyu VE ürün adını aynı Türkçe küçültme fonksiyonundan geçir.', 'tr_lower = replace("İ", "i").replace("I", "ı").lower()'],
      why: 'Arama karşılaştırmasında iki taraf aynı kurala göre küçültülmeli. Python\'un lower() metodu Türkçe I/İ için dilden bağımsız sonuç ürettiği için eşleşmeler kaçar; tek bir tr_lower yardımcısı iki sorunu birden çözer.' },
    { t: 'code',
      id: 'unicode-metin-11',
      stage: 'Meydan okuma',
      diff: 3,
      q: '<p>Müşteri yorumlarında en sık geçen kelimeleri raporla. <code>kelime_frekansi(metin, n)</code>:</p><ul><li>Metni NFC normalleştir, Türkçe kurallarıyla küçült (İ→i, I→ı).</li><li>Kelime = ardışık <b>harflerden</b> (<code>str.isalpha()</code>) oluşan dizi; diğer her karakter ayırıcıdır (kesme işareti dahil: "Market\'in" → "market", "in").</li><li>2 harften kısa kelimeleri sayma.</li><li>En sık <code>n</code> kelimeyi <code>(kelime, sayı)</code> listesi olarak döndür: sayıya göre azalan, eşitlikte <b>Türk alfabesi</b> sırasıyla (alfabe: <code>"abcçdefgğhıijklmnoöpqrsştuüvwxyz"</code>).</li></ul>',
      start: 'def kelime_frekansi(metin, n):\n    pass\n',
      sol: 'import unicodedata\n\nALFABE = "abcçdefgğhıijklmnoöpqrsştuüvwxyz"\nSIRA = {h: i for i, h in enumerate(ALFABE)}\n\ndef _tr_lower(s):\n    return s.replace("İ", "i").replace("I", "ı").lower()\n\ndef _tr_anahtar(k):\n    return [SIRA.get(h, 100 + ord(h)) for h in k]\n\ndef kelime_frekansi(metin, n):\n    metin = _tr_lower(unicodedata.normalize("NFC", metin))\n    sayac = {}\n    kelime = ""\n    for h in metin + " ":\n        if h.isalpha():\n            kelime += h\n        else:\n            if len(kelime) >= 2:\n                sayac[kelime] = sayac.get(kelime, 0) + 1\n            kelime = ""\n    sirali = sorted(sayac.items(), key=lambda kv: (-kv[1], _tr_anahtar(kv[0])))\n    return sirali[:n]\n',
      tests: 'yorum = "Çay çok güzel! ÇAY taze, kargo hızlı. Iğdır kayısısı güzel; İZMİR\'e kargo hızlı geldi. Çok çok iyi."\nr = kelime_frekansi(yorum, 4)\nassert r == [("çok", 3), ("çay", 2), ("güzel", 2), ("hızlı", 2)], "Sayıya göre azalan, eşitlikte Türk alfabesi: çay < güzel < hızlı < kargo; geldi: " + repr(r)\nassert ("kargo", 2) in kelime_frekansi(yorum, 10), "kargo 2 kez geçiyor"\nassert ("ığdır", 1) in kelime_frekansi(yorum, 20), "IĞDIR → ığdır (Türkçe küçültme)"\nassert ("izmir", 1) in kelime_frekansi(yorum, 20), "İZMİR\'e → izmir ve e; e tek harf olduğu için sayılmaz"\nassert all(len(k) >= 2 for k, _ in kelime_frekansi(yorum, 50)), "Tek harfli kelimeler sayılmamalı"\nassert kelime_frekansi("c\\u0327ay C\\u0327AY çay", 1) == [("çay", 3)], "NFD yazılmış ç de aynı kelime sayılmalı"\nassert kelime_frekansi("", 3) == [], "Boş metin boş liste"\n',
      hints: ['Önce normalleştir ve Türkçe küçült; sonra karakter karakter gezerek harf dizilerini topla.', 'Metnin sonuna bir boşluk ekleyerek son kelimenin de sayılmasını garanti et.', 'Sıralama anahtarı demet olabilir: key=lambda kv: (-kv[1], tr_anahtar(kv[0]))'],
      why: 'Gerçek metin işleme hattı: normalleştir → küçült → böl → say → sırala. NFC adımı farklı yazılmış aynı kelimeleri birleştirir; isalpha() Türkçe harfleri de harf sayar. Demet anahtarında -sayı azalan sıralama, ikinci eleman ise eşitlik durumunda Türk alfabesi sırası sağlar.' }
  ],
  faq: [
    { q: 'Python 2\'deki unicode/str karmaşası Python 3\'te var mı?',
      a: 'Hayır. Python 3\'te <code>str</code> her zaman Unicode metindir, <code>bytes</code> ise ham baytlardır ve ikisi otomatik karışmaz: <code>"a" + b"b"</code> TypeError verir. Eski kod örneklerinde gördüğün <code>u"..."</code> öneki Python 3\'te zararsızdır ama gereksizdir.' },
    { q: 'Dosyamın hangi kodlamada olduğunu nasıl anlarım?',
      a: 'Kesin bir yolu yoktur; baytlar kodlamayı söylemez. Pratikte: önce UTF-8 dene (katı biçimi sayesinde yanlışsa çoğu zaman hata verir), olmazsa kaynağa sor ya da cp1254/ISO-8859-9 dene. <code>charset-normalizer</code> paketi istatistiksel tahmin yapar (kendi bilgisayarında: <code>pip install charset-normalizer</code>).' },
    { q: 'Excel CSV\'mi açınca ilk sütunun adı "\\ufeffad" görünüyor. Neden?',
      a: 'Excel "CSV UTF-8" kaydında dosyanın başına BOM (U+FEFF) koyar. <code>open(..., encoding="utf-8-sig")</code> ile açarsan BOM otomatik atılır. Excel\'in Türkçe karakterleri doğru göstermesi için dosya yazarken de <code>utf-8-sig</code> kullanabilirsin.' },
    { q: 'casefold() ile lower() arasındaki fark ne?',
      a: '<code>casefold()</code> büyük/küçük harf duyarsız karşılaştırma için tasarlanmış daha agresif bir dönüşümdür; örneğin Almanca ß\'yi ss yapar. İkisi de Türkçe I/İ kuralını bilmez. Türkçe metin için önce I/İ eşlemesini elle yap, sonra lower ya da casefold uygula.' }
  ],
  mistakes: [
    { bad: 'with open("musteriler.csv") as f:\n    veri = f.read()',
      good: 'with open("musteriler.csv", encoding="utf-8") as f:\n    veri = f.read()',
      why: 'Kodlama belirtilmezse işletim sisteminin varsayılanı kullanılır; Türkçe Windows\'ta cp1254 olabilir ve Türkçe karakterler bozulur.' },
    { bad: 'if sorgu.lower() in urun.lower():',
      good: 'def tr_lower(s):\n    return s.replace("İ", "i").replace("I", "ı").lower()\nif tr_lower(sorgu) in tr_lower(urun):',
      why: 'lower() Türkçe I/İ kuralını bilmez: "I" → "i", "İ" → "i̇" (2 karakter) olur ve arama eşleşmeleri kaçar.' },
    { bad: 'yol = "C:\\yeni\\tablo.csv"',
      good: 'yol = r"C:\\yeni\\tablo.csv"\n# ya da: Path("C:/yeni/tablo.csv")',
      why: 'Normal metinde \\t sekmeye dönüşür; Windows yollarında ham dize ya da pathlib kullan.' },
    { bad: 'sehirler.sort()   # Çorum en sona düşer',
      good: 'sehirler.sort(key=tr_anahtar)',
      why: 'Varsayılan sıralama kod noktasına göredir; Türkçe harfler İngilizce harflerin tamamından sonra gelir.' },
    { bad: 'metin = veri.decode("utf-8", errors="ignore")   # her ihtimale karşı',
      good: 'metin = veri.decode("utf-8")   # hata verirse kaynağın kodlamasını öğren',
      why: 'errors="ignore" hatayı gizler ve veriyi sessizce kaybeder; önce doğru kodlamayı bul.' }
  ]
});
})(window);
/* PythonPatika v2 — dongu-kaliplari */
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push(
{ id: 'dongu-kaliplari',
  lv: 'temel',
  mod: 'Akış Kontrolü',
  min: 40,
  title: 'Döngü kalıpları ve temel algoritmalar',
  sum: 'Sayaç, biriktirici, en büyük/en küçük, doğrusal arama ve bayrak, komşu karşılaştırma, frekans, iç içe döngü, erken çıkış ve while ile hedefe kadar tekrar kalıplarını tanır; her yeni problemi bu kalıplarla çözmeyi öğrenirsin.',
  goals: ['Bir problemi sayaç, biriktirici, arama, en iyi değer gibi bilinen bir döngü kalıbına eşleyebilirim.', 'max/min kullanmadan en büyük ve en küçük değeri ve konumunu doğru başlangıç değeriyle bulabilirim.', 'Bayrak değişkeni ya da for-else ile doğrusal arama yazar, break ile erken çıkarım.', 'Komşu elemanları karşılaştırarak artış/azalış ve seri (streak) hesaplayabilirim.', 'while ile "hedefe ulaşana kadar" döngüsü kurar, döngüde liste değiştirme tuzağından kaçınırım.'],
  body: `
<h2>Döngü yazmak, kalıp tanımaktır</h2>
<p>Döngüler dersinde <code>for</code>, <code>while</code>, <code>range</code>, <code>enumerate</code>, <code>zip</code>, <code>break</code> ve <code>continue</code>'yu öğrendin. Bu ders bir adım geri çekilip şu soruyu soruyor: deneyimli bir geliştirici yeni bir problemi gördüğünde döngüyü nasıl bu kadar hızlı yazıyor? Cevap: yazdığı döngülerin büyük çoğunluğu bir avuç <b>kalıbın</b> (pattern) tekrarıdır. "Kaç tane?" sorusu sayaçtır, "toplam ne?" biriktiricidir, "en pahalısı hangisi?" en iyi değer kalıbıdır, "var mı?" aramadır.</p>
<p>Her kalıbın üç parçası vardır: döngüden <b>önce</b> başlangıç değeri, döngünün <b>içinde</b> güncelleme kuralı, döngüden <b>sonra</b> sonucu kullanma. Hataların çoğu bu üçünden birinde yapılır; özellikle başlangıç değerinde.</p>
<div class="tbl-wrap"><table>
<tr><th>Soru</th><th>Kalıp</th><th>Başlangıç</th><th>Güncelleme</th></tr>
<tr><td>Kaç tane?</td><td>Sayaç</td><td><code>sayac = 0</code></td><td><code>sayac += 1</code> (koşullu)</td></tr>
<tr><td>Toplam/çarpım ne?</td><td>Biriktirici</td><td><code>0</code> ya da <code>1</code>, <code>""</code>, <code>[]</code></td><td><code>toplam += x</code></td></tr>
<tr><td>En büyüğü hangisi?</td><td>En iyi değer</td><td>İlk eleman</td><td>Daha iyisi gelince değiştir</td></tr>
<tr><td>Var mı, nerede?</td><td>Doğrusal arama</td><td><code>bulundu = False</code></td><td>Bulunca bayrak + <code>break</code></td></tr>
<tr><td>Hepsi mi uyuyor?</td><td>Doğrulama</td><td><code>hepsi = True</code></td><td>Uymayan gelince False + <code>break</code></td></tr>
<tr><td>Önceki güne göre?</td><td>Komşu karşılaştırma</td><td>İlk eleman ya da indeks 1</td><td><code>x</code> ile <code>onceki</code></td></tr>
<tr><td>Her değerden kaç tane?</td><td>Frekans</td><td><code>{}</code></td><td><code>d[x] = d.get(x, 0) + 1</code></td></tr>
<tr><td>Hedefe kaç adımda?</td><td>Koşula kadar tekrar</td><td>Durum + adım sayacı</td><td><code>while</code> koşulu</td></tr>
</table></div>

<h2>Sayaç ve biriktirici: tek geçişte birden fazla sonuç</h2>
<p>Bu ikisini zaten biliyorsun. Burada kazanman gereken alışkanlık: aynı veriyi birkaç kez gezmek yerine <b>tek geçişte</b> birden fazla sayaç ve biriktirici tutmak.</p>
<pre class="py">islemler = [1200, -350, 4800, -90, -1500, 600, 0, 75]   # Anadolu Bank hesap hareketleri

giris_toplam = 0
cikis_toplam = 0
cikis_sayisi = 0
buyuk_islem = 0                      # |tutar| &gt;= 1000
for t in islemler:
    if t &gt; 0:
        giris_toplam += t
    elif t &lt; 0:
        cikis_toplam += -t
        cikis_sayisi += 1
    if abs(t) &gt;= 1000:
        buyuk_islem += 1

print("Giriş:", giris_toplam, "Çıkış:", cikis_toplam)
print("Çıkış adedi:", cikis_sayisi, "Büyük işlem:", buyuk_islem)
print("Net:", giris_toplam - cikis_toplam)</pre>
<p>Biriktiricinin başlangıç değeri işleme göre değişir: toplamada 0, çarpmada 1 (0 ile başlarsan sonuç hep 0 olur), metin birleştirmede <code>""</code>, liste toplamada <code>[]</code>.</p>

<h2>En büyük ve en küçük: max kullanmadan</h2>
<p>Gerçek kodda <code>max</code> ve <code>min</code> kullanırsın; ama kalıbı bilmek iki sebeple önemli. Birincisi, çoğu zaman yalnız değeri değil <b>kaydın kendisini</b> ya da konumunu istersin. İkincisi, "en iyi" tanımı karmaşıklaşabilir: en yüksek tutarlı ama iptal edilmemiş sipariş, eşitlikte en eski olan gibi.</p>
<pre class="py">bakiyeler = [-250.0, -1200.5, -40.0, -980.0]      # hepsi negatif!

# YANLIŞ başlangıç: 0 hiçbir negatif değerden küçük değil
en_buyuk_yanlis = 0
for b in bakiyeler:
    if b &gt; en_buyuk_yanlis:
        en_buyuk_yanlis = b
print("Yanlış sonuç:", en_buyuk_yanlis)

# DOĞRU: ilk elemanla başla, konumu da tut
en_kucuk = bakiyeler[0]
en_kucuk_i = 0
for i, b in enumerate(bakiyeler):
    if b &lt; en_kucuk:
        en_kucuk = b
        en_kucuk_i = i
print("En düşük bakiye:", en_kucuk, "konum:", en_kucuk_i)</pre>
<div class="warn"><b>Başlangıç değeri tuzağı</b>En büyüğü bulurken 0 ile başlamak, tüm değerler negatifse yanlış sonuç verir; en küçüğü bulurken 0 ile başlamak, tüm değerler pozitifse yanlış sonuç verir. Güvenli seçenekler: listenin ilk elemanı ya da <code>float("-inf")</code> / <code>float("inf")</code>. Boş liste ihtimali varsa önce onu kontrol et: <code>if not bakiyeler: return None</code>.</div>
<p>Eşitlik durumunda hangi kaydın seçileceği karşılaştırma operatörüne bağlıdır: <code>&lt;</code> ilk görüleni, <code>&lt;=</code> son görüleni tutar. Bu küçük fark, raporlarda "neden bu müşteri çıktı" sorusunun cevabıdır.</p>

<h2>Doğrusal arama ve bayrak değişkeni</h2>
<p>"Bu listede şu koşulu sağlayan var mı, varsa ilki hangisi?" Elemanları baştan sona tek tek kontrol etmeye <b>doğrusal arama</b> (linear search) denir. Sonucu tutmak için bir <b>bayrak</b> (flag) değişkeni kullanırsın; aradığını bulunca da <code>break</code> ile çıkarsın, çünkü geri kalanı kontrol etmek boşa iştir.</p>
<pre class="py">siparisler = [("AM-1", 120), ("AM-2", 4500), ("AM-3", 80), ("AM-4", 9000)]
esik = 4000

bulundu = False
for no, tutar in siparisler:
    if tutar &gt; esik:
        bulundu = True
        ilk_buyuk = no
        break
if bulundu:
    print("İlk büyük sipariş:", ilk_buyuk)
else:
    print("Büyük sipariş yok")

# Aynı iş for-else ile: else, döngü break OLMADAN biterse çalışır
for no, tutar in siparisler:
    if tutar &gt; 10000:
        print("Çok büyük sipariş:", no)
        break
else:
    print("10000 üstü sipariş yok")</pre>
<p>Bayrağın tersi <b>doğrulama</b> kalıbıdır: "hepsi uyuyor mu?" sorusunda <code>hepsi = True</code> ile başlar, uymayan ilk elemanda False yapıp çıkarsın. Bu iki kalıbın hazır karşılıkları <code>any()</code> ve <code>all()</code>'dur; ama hangi elemanın uyduğunu ya da uymadığını öğrenmen gerekiyorsa döngü yazarsın.</p>
<div class="tip"><b>Fonksiyon içinde daha kısa</b>Arama bir fonksiyonun içindeyse bayrağa gerek kalmaz: bulduğun anda <code>return</code> et, döngü bitince "bulunamadı" değerini (<code>None</code> ya da <code>-1</code>) döndür. Erken dönüş (early return), bayrak ve break'in en okunur hâlidir.</div>

<h2>Komşu elemanları karşılaştırmak</h2>
<p>Zaman serilerinde (günlük satış, aylık bakiye, saatlik sıcaklık) asıl soru çoğu zaman bir değerin <b>bir öncekine göre</b> ne olduğudur: arttı mı, azaldı mı, kaç gün üst üste arttı? Bunun için her adımda iki elemana birden bakarsın.</p>
<pre class="py">satislar = [120, 135, 135, 150, 90, 110, 130, 160]   # günlük satış adedi

# Yöntem 1: indeksle, 1'den başla
artis = 0
for i in range(1, len(satislar)):
    if satislar[i] &gt; satislar[i - 1]:
        artis += 1
print("Artış günü:", artis)

# Yöntem 2: zip ile (önceki, şimdiki) çiftleri
for onceki, simdi in zip(satislar, satislar[1:]):
    if simdi &lt; onceki:
        print(f"Düşüş: {onceki} → {simdi} ({simdi - onceki})")

# Seri (streak): en uzun üst üste artış
seri = en_uzun = 0
for onceki, simdi in zip(satislar, satislar[1:]):
    if simdi &gt; onceki:
        seri += 1
        en_uzun = max(en_uzun, seri)
    else:
        seri = 0
print("En uzun artış serisi:", en_uzun, "gün")</pre>
<p><code>zip(satislar, satislar[1:])</code> güzel bir hiledir: listeyi bir kaydırılmış kopyasıyla eşler ve <code>n</code> elemandan <code>n-1</code> komşu çifti verir. Döngünün ilk elemandan değil ikinciden başladığına dikkat et; ilk günün "önceki günü" yoktur. İndeks yönteminde <code>range(len(satislar))</code> yazıp <code>satislar[i - 1]</code> kullanırsan ilk turda <code>satislar[-1]</code>, yani <b>son</b> eleman okunur ve hata vermeden yanlış sonuç alırsın.</p>

<h2>Frekans ve gruplama</h2>
<p>Sözlükler dersinde sayım kalıbını, İç içe veri yapıları dersinde gruplamayı gördün. Kalıp olarak hatırla: frekans, anahtar başına bir <b>sayaç</b>; gruplama, anahtar başına bir <b>liste biriktiricisi</b>. İkisi birleşince "en sık" sorusu iki adımlı olur: önce say, sonra en iyi değer kalıbıyla en büyüğü bul.</p>
<pre class="py">satilan = ["çay", "kahve", "çay", "şeker", "kahve", "çay", "su"]
frekans = {}
for urun in satilan:
    frekans[urun] = frekans.get(urun, 0) + 1

en_cok, en_cok_adet = None, 0
for urun, adet in frekans.items():
    if adet &gt; en_cok_adet:
        en_cok, en_cok_adet = urun, adet
print(frekans)
print("En çok satan:", en_cok, en_cok_adet)</pre>

<h2>İç içe döngü: tablolar ve çiftler</h2>
<p>Dış döngünün her turunda iç döngü baştan sona çalışır. İki tipik kullanım: satır-sütun tablosu üretmek ve bir listedeki tüm <b>çiftleri</b> denemek. Çiftlerde aynı çifti iki kez (a-b ve b-a) ve elemanı kendisiyle eşlememek için iç döngü <code>i + 1</code>'den başlar.</p>
<pre class="py">for i in range(1, 4):
    satir = ""
    for j in range(1, 6):
        satir += f"{i * j:4}"
    print(satir)

fiyatlar = [150, 350, 200, 50]
butce = 400
for i in range(len(fiyatlar)):
    for j in range(i + 1, len(fiyatlar)):
        if fiyatlar[i] + fiyatlar[j] == butce:
            print("Bütçeye tam uyan ikili:", fiyatlar[i], fiyatlar[j])</pre>
<p>İç içe döngüde iş sayısı çarpılır: 1000 elemanlı listede tüm çiftler yaklaşık yarım milyon karşılaştırmadır. Bu, Uzmanlaş bölümündeki karmaşıklık konusunun girişidir.</p>

<h2>while: koşula kadar tekrar</h2>
<p>Kaç tur süreceğini <b>önceden bilmediğin</b> durumlarda <code>while</code> kullanırsın. Anadolu Bank'ın klasik müşteri sorusu: "Hesabımda 10.000 TL var, aylık %3 faiz alırsam 15.000 TL'ye kaç ayda ulaşırım?"</p>
<pre class="py">bakiye = 10_000
aylik_faiz = 0.03
hedef = 15_000

ay = 0
while bakiye &lt; hedef:
    bakiye *= 1 + aylik_faiz
    ay += 1
print(f"{ay} ayda hedefe ulaşılır, bakiye: {bakiye:.2f} TL")

# Güvenlik sınırı: faiz 0 olursa döngü sonsuza gider
bakiye, ay = 10_000, 0
while bakiye &lt; hedef and ay &lt; 600:
    bakiye *= 1 + 0.0
    ay += 1
if bakiye &lt; hedef:
    print("Hedefe ulaşılamadı, döngü", ay, "ayda durduruldu")</pre>
<p>while döngüsünün üç sorusunu her zaman cevapla: koşul ne, döngü içinde koşulu hedefe yaklaştıran satır hangisi, ve hedefe asla ulaşılamazsa ne olur? Son soru için bir üst sınır (en fazla 600 ay gibi) koymak, üretim kodunda hayat kurtarır.</p>

<h2>Döngüde liste değiştirme tuzağı</h2>
<p>Gezdiğin listeden eleman silmek, Python'daki en sinsi hatalardan biridir: hata vermez, sessizce eleman atlar. Sebep: for döngüsü içeride bir indeks sayacı tutar; sen bir elemanı silince sonrakiler bir sola kayar ve sayaç bir sonrakini atlar.</p>
<pre class="py">siparisler = ["iptal", "iptal", "aktif", "iptal", "aktif"]
for s in siparisler:
    if s == "iptal":
        siparisler.remove(s)
print("Yanlış:", siparisler)        # bir iptal kaldı!

siparisler = ["iptal", "iptal", "aktif", "iptal", "aktif"]
temiz = []
for s in siparisler:
    if s != "iptal":
        temiz.append(s)
print("Doğru (yeni liste):", temiz)

siparisler = ["iptal", "iptal", "aktif", "iptal", "aktif"]
for s in siparisler[:]:             # kopya üzerinde gez, orijinalden sil
    if s == "iptal":
        siparisler.remove(s)
print("Doğru (kopya üzerinde):", siparisler)</pre>
<p>En temiz yol, istediğin elemanlarla <b>yeni bir liste</b> kurmaktır (Orta seviyede bunu tek satırlık comprehension ile yapacaksın). Orijinal listeyi mutlaka yerinde değiştirmen gerekiyorsa kopyası üzerinde gez ya da listeyi sondan başa doğru gez. Aynı kural sözlükler için daha da serttir: gezerken sözlüğe anahtar ekleyip silmek <code>RuntimeError</code> verir.</p>

<div class="note"><b>Gerçek işte</b>Raporlama betiklerinin büyük kısmı bu kalıpların birleşimidir: gün sonu raporunda tek geçişte ciro, iade sayısı ve en büyük sipariş hesaplanır; dolandırıcılık izleme kuralı "aynı karttan 10 dakika içinde art arda 3 işlem" gibi komşu karşılaştırmasıdır; stok uyarısı doğrulama kalıbıdır; kredi simülatörü while döngüsüdür. Kod incelemesinde kıdemli bir geliştirici "burada en büyüğü 0 ile başlatmışsın, iade tutarları negatif" dediğinde konuştuğu şey bu dersin kendisidir.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Döngü değişmezi (loop invariant)</h3>
<p>Doğru döngü yazmanın en güçlü düşünme aracı, her turun sonunda doğru kalan cümledir. En büyük bulma kalıbında değişmez şudur: "<code>en_buyuk</code>, şimdiye kadar görülen elemanların en büyüğüdür." Başlangıçta doğru olmalı (ilk elemanla başlatmanın sebebi), her tur korumalı ve döngü bitince sonucu vermeli. Hata ayıklarken "bu cümle hangi turda bozuldu?" diye sormak, rastgele print eklemekten çok daha hızlıdır.</p>
<h3>Karmaşıklık: kaç adım?</h3>
<div class="tbl-wrap"><table>
<tr><th>Kalıp</th><th>Adım sayısı</th><th>1 milyon eleman</th></tr>
<tr><td>Tek geçiş (sayaç, toplam, en büyük, arama)</td><td>n</td><td>Göz açıp kapayıncaya kadar</td></tr>
<tr><td>Erken çıkışlı arama</td><td>En iyi 1, en kötü n</td><td>Bulunacak yere bağlı</td></tr>
<tr><td>Tüm çiftler (iç içe döngü)</td><td>n × n / 2</td><td>Yarım trilyon: kullanılamaz</td></tr>
<tr><td>Sözlük/küme ile eşleme</td><td>n</td><td>Hızlı</td></tr>
</table></div>
<p>"Toplamı bütçeye eşit iki ürün" problemini iç içe döngü yerine tek geçişte çözebilirsin: gördüğün fiyatları bir kümede tut, her yeni fiyatta <code>butce - fiyat</code> kümede var mı diye bak. Bu, mülakatların en klasik sorusudur (two sum) ve kalıp birleştirmenin gücünü gösterir.</p>
<pre class="py">def butce_ikilisi(fiyatlar, butce):
    gorulen = set()
    for f in fiyatlar:
        if butce - f in gorulen:
            return (butce - f, f)
        gorulen.add(f)
    return None

print(butce_ikilisi([150, 350, 200, 50], 400))
print(butce_ikilisi([10, 20], 100))</pre>
<h3>Kalıptan yerleşik fonksiyona</h3>
<p>Kalıbı tanıdıktan sonra kısaltmasını kullanmak profesyonel koddur: sayaç → <code>sum(1 for x in v if ...)</code>, biriktirici → <code>sum</code>, en iyi → <code>max(v, key=...)</code>, arama → <code>next((x for x in v if ...), None)</code>, doğrulama → <code>all</code>, frekans → <code>collections.Counter</code>, komşu çiftleri → <code>itertools.pairwise</code>. Bunların çoğunu Orta seviyede göreceksin. Ama kısaltma çalışmadığında ya da kural karmaşıklaştığında açık döngüye dönebilmek, kalıbı bilmekle mümkün.</p>
</section>
`,
  ex: [
    { t: 'mc',
      stage: 'Isınma',
      q: 'Günlük kâr/zarar listesinde en yüksek değeri <code>max</code> kullanmadan bulacaksın. Değerlerin hepsi negatif olabilir. <code>en_buyuk</code> neyle başlatılmalı?',
      o: ['0 ile, çünkü nötr değerdir', 'Listenin ilk elemanıyla', 'Listenin uzunluğuyla', '1 ile, çarpım gibi'],
      a: 1,
      why: '0 ile başlarsan tüm değerler negatifken hiçbir değer 0\'dan büyük olmaz ve sonuç yanlışlıkla 0 çıkar. İlk eleman (ya da float("-inf")) her durumda doğru başlangıçtır.' },
    { t: 'mc',
      stage: 'Isınma',
      q: 'Bir listede günlük satışların bir önceki güne göre kaç kez arttığını sayacaksın. Hangi döngü başlığı doğru ve güvenlidir?',
      o: ['for i in range(len(s)): ... s[i] > s[i - 1]', 'for i in range(1, len(s)): ... s[i] > s[i - 1]', 'for i in range(len(s)): ... s[i + 1] > s[i]', 'for x in s: ... x > x - 1'],
      a: 1,
      why: 'İlk günün öncesi yoktur, bu yüzden indeks 1\'den başlanır. 0\'dan başlamak s[-1] ile son günü okur (hatasız ama yanlış); s[i + 1] son turda IndexError verir; x > x - 1 her zaman doğrudur.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'for-else ve break: bu kod ne yazdırır?',
      code: 'stoklar = {"çay": 12, "kahve": 0, "şeker": 3}\nfor urun, adet in stoklar.items():\n    if adet == 0:\n        print("Tükendi:", urun)\n        break\nelse:\n    print("Hepsi stokta")\nprint("bitti")\n',
      o: ['Tükendi: kahve\nbitti', 'Tükendi: kahve\nHepsi stokta\nbitti', 'Hepsi stokta\nbitti', 'Tükendi: kahve'],
      a: 0,
      why: 'kahve\'de break çalışır; döngü break ile bittiği için else bloğu atlanır. Döngüden sonraki "bitti" her durumda yazılır.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Komşu karşılaştırma: bu kod ne yazdırır?',
      code: 's = [5, 7, 7, 3, 8, 9]\nartis = azalis = 0\nfor onceki, simdi in zip(s, s[1:]):\n    if simdi > onceki:\n        artis += 1\n    elif simdi < onceki:\n        azalis += 1\nprint(artis, azalis)\n',
      o: ['3 1', '4 1', '3 2', '3 1 1'],
      a: 0,
      why: 'Çiftler: (5,7) artış, (7,7) eşit, (7,3) azalış, (3,8) artış, (8,9) artış. 6 elemandan 5 çift çıkar; eşit çift hiçbir sayaca girmez: 3 artış, 1 azalış.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Döngüde silme tuzağı: bu kod ne yazdırır?',
      code: 'tutarlar = [10, -5, -8, 20, -1]\nfor t in tutarlar:\n    if t < 0:\n        tutarlar.remove(t)\nprint(tutarlar)\n',
      o: ['[10, 20]', '[10, -8, 20]', '[10, -8, 20, -1]', 'RuntimeError hatası verir'],
      a: 1,
      why: '-5 silinince -8 onun yerine kayar ve döngü bir sonraki konuma (20) geçer; -8 hiç kontrol edilmez. -1 ise ayrıca kontrol edilip silinir. Listeler bu durumda hata vermez, sessizce eleman atlar.' },
    { t: 'order',
      stage: 'Kodu oku',
      q: '<p>Aylık %2 faizle 1000 TL\'nin 1200 TL\'ye kaç ayda ulaştığını bulan programın satırlarını sırala.</p>',
      lines: ['bakiye = 1000', 'ay = 0', 'while bakiye < 1200:', '    bakiye = bakiye * 1.02', '    ay += 1', 'print(ay, "ay")'],
      expect: '10 ay\n',
      hint: 'Başlangıç değerleri döngüden önce; koşulu hedefe yaklaştıran satır ve sayaç döngünün içinde; sonuç döngüden sonra.',
      why: 'while kalıbı: durumu başlat, koşul sağlandıkça durumu güncelle ve adım say, döngü bitince sonucu kullan. 1000 × 1.02¹⁰ ≈ 1218.99 ile ilk kez 1200\'ü geçer.' },
    { id: 'dongu-kaliplari-1',
      t: 'code',
      stage: 'Rehberli',
      diff: 1,
      q: '<p><code>en_dusuk_bakiye(hesaplar)</code> fonksiyonunu <b>min kullanmadan</b> yaz. <code>hesaplar</code>, <code>(hesap_no, bakiye)</code> demetlerinden oluşan bir listedir. En düşük bakiyeli hesabın demetini döndür; eşitlikte <b>ilk görüleni</b> seç. Liste boşsa <code>None</code> döndür.</p>',
      guide: ['Liste boşsa hemen None döndür.', 'En iyi adayı listenin ilk elemanıyla başlat (0 ile değil!).', 'Kalan elemanları gez; bakiyesi adayınkinden kesinlikle küçükse adayı değiştir.', 'Döngü bitince adayı döndür.'],
      example: 'urunler = [("çay", 120), ("kahve", 350), ("şeker", 45)]\nen_pahali = urunler[0]\nfor u in urunler[1:]:\n    if u[1] > en_pahali[1]:\n        en_pahali = u\nprint(en_pahali)\n',
      start: 'def en_dusuk_bakiye(hesaplar):\n    # TODO: boş liste kontrolü\n    aday = None  # TODO: ilk elemanla başlat\n    for hesap in hesaplar:\n        # TODO: daha düşük bakiye gelirse adayı değiştir\n        pass\n    return aday\n',
      sol: 'def en_dusuk_bakiye(hesaplar):\n    if not hesaplar:\n        return None\n    aday = hesaplar[0]\n    for hesap in hesaplar:\n        if hesap[1] < aday[1]:\n            aday = hesap\n    return aday\n',
      tests: 'assert en_dusuk_bakiye([("H-1", 500), ("H-2", -120), ("H-3", 40)]) == ("H-2", -120), "en düşük bakiye H-2 (-120)"\nassert en_dusuk_bakiye([("H-1", 300), ("H-2", 100), ("H-3", 100)]) == ("H-2", 100), "eşitlikte ilk görülen (H-2) seçilmeli: < kullan, <= değil"\nassert en_dusuk_bakiye([("H-1", 50), ("H-2", 80)]) == ("H-1", 50), "hepsi pozitifken de doğru çalışmalı (0 ile başlatma tuzağı)"\nassert en_dusuk_bakiye([]) is None, "boş liste None döndürmeli"\nassert "min(" not in __source__, "min kullanmadan kalıbı kendin yaz"\n',
      hints: ['En iyi değer kalıbı: aday = ilk eleman, sonra karşılaştır.', 'Bakiye demetin 1. indeksinde: hesap[1] < aday[1]', 'if hesap[1] < aday[1]: aday = hesap'],
      why: 'İlk elemanla başlamak değişmezi baştan doğru kurar; kesin küçüktür (<) eşitlikte ilk görüleni korur.' },
    { id: 'dongu-kaliplari-2',
      t: 'code',
      stage: 'Rehberli',
      diff: 2,
      q: '<p><code>degisim_raporu(satislar)</code> fonksiyonunu yaz. Günlük satış listesindeki her ardışık gün çifti için değişimi incelesin ve <code>{"artis": a, "azalis": b, "sabit": c, "en_buyuk_dusus": d}</code> döndürsün. <code>en_buyuk_dusus</code>, bir günden ertesine en büyük düşüş miktarıdır (pozitif sayı); hiç düşüş yoksa 0.</p>',
      guide: ['Dört sonucu döngüden önce 0 ile başlat.', 'zip(satislar, satislar[1:]) ile (onceki, simdi) çiftlerini gez.', 'if/elif/else ile artis, azalis ya da sabit sayacını artır.', 'Azalışta düşüş miktarını (onceki - simdi) hesapla; en_buyuk_dusus\'ten büyükse güncelle.', 'Sözlüğü döndür.'],
      example: 'sicaklik = [18, 21, 21, 17]\nfor dun, bugun in zip(sicaklik, sicaklik[1:]):\n    print(dun, "→", bugun, "fark:", bugun - dun)\n',
      start: 'def degisim_raporu(satislar):\n    artis = azalis = sabit = 0\n    en_buyuk_dusus = 0\n    # TODO: komşu çiftleri gez ve sayaçları güncelle\n    return {"artis": artis, "azalis": azalis, "sabit": sabit, "en_buyuk_dusus": en_buyuk_dusus}\n',
      sol: 'def degisim_raporu(satislar):\n    artis = azalis = sabit = 0\n    en_buyuk_dusus = 0\n    for onceki, simdi in zip(satislar, satislar[1:]):\n        if simdi > onceki:\n            artis += 1\n        elif simdi < onceki:\n            azalis += 1\n            if onceki - simdi > en_buyuk_dusus:\n                en_buyuk_dusus = onceki - simdi\n        else:\n            sabit += 1\n    return {"artis": artis, "azalis": azalis, "sabit": sabit, "en_buyuk_dusus": en_buyuk_dusus}\n',
      tests: 'r = degisim_raporu([120, 135, 135, 150, 90, 110, 100])\nassert r == {"artis": 3, "azalis": 2, "sabit": 1, "en_buyuk_dusus": 60}, f"beklenen 3 artış, 2 azalış, 1 sabit, en büyük düşüş 60 (150→90); gelen {r}"\nassert degisim_raporu([5]) == {"artis": 0, "azalis": 0, "sabit": 0, "en_buyuk_dusus": 0}, "tek günde karşılaştırılacak çift yok"\nassert degisim_raporu([])["artis"] == 0, "boş listede hata olmamalı"\nassert degisim_raporu([1, 2, 3])["en_buyuk_dusus"] == 0, "düşüş yoksa 0"\n',
      hints: ['n günden n-1 çift çıkar; zip(s, s[1:]) bunları verir.', 'Düşüş miktarı onceki - simdi (pozitif).', 'elif simdi < onceki: azalis += 1 ve ardından en büyük düşüş kontrolü'],
      why: 'Komşu karşılaştırma kalıbı ile en iyi değer kalıbı tek döngüde birleşir; zip kaydırması ilk günün öncesini okuma hatasını yapısal olarak önler.' },
    { id: 'dongu-kaliplari-3',
      t: 'code',
      stage: 'Rehberli',
      diff: 1,
      q: '<p><code>ilk_supheli(islemler, limit)</code> fonksiyonunu yaz. <code>islemler</code> tutar listesidir. Mutlak değeri <code>limit</code>\'i aşan <b>ilk</b> işlemin indeksini döndür; böyle bir işlem yoksa <code>-1</code> döndür. Bulduğun anda döngüden çık.</p>',
      guide: ['enumerate ile hem indeksi hem tutarı gez.', 'abs(tutar) > limit ise indeksi hemen return et (erken çıkış).', 'Döngü bitip return olmadıysa "bulunamadı" demektir: -1 döndür.'],
      example: 'def ilk_bos_raf(raflar):\n    for i, adet in enumerate(raflar):\n        if adet == 0:\n            return i\n    return -1\n\nprint(ilk_bos_raf([4, 2, 0, 0]), ilk_bos_raf([1, 1]))\n',
      start: 'def ilk_supheli(islemler, limit):\n    for i, tutar in enumerate(islemler):\n        # TODO: limit aşılırsa indeksi döndür\n        pass\n    # TODO: bulunamadı\n',
      sol: 'def ilk_supheli(islemler, limit):\n    for i, tutar in enumerate(islemler):\n        if abs(tutar) > limit:\n            return i\n    return -1\n',
      tests: 'assert ilk_supheli([100, -250, 9000, 12000], 5000) == 2, "ilk aşan işlem indeks 2 (9000)"\nassert ilk_supheli([100, -7000, 9000], 5000) == 1, "negatif tutarlarda mutlak değer kullanılmalı (-7000)"\nassert ilk_supheli([100, 200], 5000) == -1, "hiç yoksa -1"\nassert ilk_supheli([], 10) == -1, "boş listede -1"\nassert ilk_supheli([5000], 5000) == -1, "limit\'e eşit olan aşmış sayılmaz"\n',
      hints: ['Doğrusal arama + erken dönüş.', 'abs(tutar) > limit', 'Döngüden sonra return -1'],
      why: 'Fonksiyon içinde return hem bayrağın hem break\'in yerini tutar; döngü sonuna gelinmesi "bulunamadı" anlamına gelir.' },
    { id: 'dongu-kaliplari-4',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p>Anadolu Bank birikim simülatörü: <code>kac_ay(bakiye, aylik_faiz, hedef, aylik_ek=0)</code> fonksiyonunu while ile yaz. Her ay önce faiz eklenir (<code>bakiye *= 1 + aylik_faiz</code>), sonra <code>aylik_ek</code> yatırılır. Bakiyenin <code>hedef</code>\'e ulaştığı (<code>&gt;=</code>) ay sayısını döndür. Başta zaten hedefteyse 0 döndür. Hedefe 1200 ayda (100 yıl) ulaşılamıyorsa <code>None</code> döndür.</p>',
      start: 'def kac_ay(bakiye, aylik_faiz, hedef, aylik_ek=0):\n    pass\n',
      sol: 'def kac_ay(bakiye, aylik_faiz, hedef, aylik_ek=0):\n    ay = 0\n    while bakiye < hedef:\n        if ay >= 1200:\n            return None\n        bakiye *= 1 + aylik_faiz\n        bakiye += aylik_ek\n        ay += 1\n    return ay\n',
      tests: 'assert kac_ay(10000, 0.03, 15000) == 14, "10000 TL %3 ile 14. ayda 15000\'i geçer"\nassert kac_ay(1000, 0.0, 2000, 250) == 4, "faizsiz, ayda 250 ek ile 4 ay"\nassert kac_ay(5000, 0.05, 5000) == 0, "zaten hedefteyse 0 ay"\nassert kac_ay(1000, 0.0, 2000) is None, "faiz ve ek yoksa hedefe ulaşılamaz: None (sonsuz döngü olmamalı)"\nassert kac_ay(1000, 0.01, 1100, 0) == 10, "1000 × 1.01^10 ≈ 1104.6"\n',
      hints: ['while bakiye < hedef: ve döngü içinde ay sayacı.', 'Sonsuz döngüyü önlemek için ay 1200\'e ulaşınca None döndür.'],
      why: 'Kaç tur süreceği bilinmeyen tekrar while ister; üst sınır, hedefe hiç ulaşılamayan girdilerde programın donmasını engeller.' },
    { id: 'dongu-kaliplari-5',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p><code>en_cok_satan(satislar)</code> fonksiyonunu yaz. <code>satislar</code>, satılan ürün adlarının listesidir. Önce frekansları say, sonra en çok satan ürünü <code>(urun, adet)</code> olarak döndür. Eşitlikte <b>alfabetik olarak önce gelen</b> ürünü seç. Liste boşsa <code>None</code> döndür. <code>max</code> ve <code>Counter</code> kullanma.</p>',
      start: 'def en_cok_satan(satislar):\n    pass\n',
      sol: 'def en_cok_satan(satislar):\n    frekans = {}\n    for u in satislar:\n        frekans[u] = frekans.get(u, 0) + 1\n    en_iyi = None\n    for urun, adet in frekans.items():\n        if en_iyi is None or adet > en_iyi[1] or (adet == en_iyi[1] and urun < en_iyi[0]):\n            en_iyi = (urun, adet)\n    return en_iyi\n',
      tests: 'assert en_cok_satan(["çay", "kahve", "çay", "su", "kahve", "çay"]) == ("çay", 3), "çay 3 kez satıldı"\nassert en_cok_satan(["su", "kahve", "su", "kahve"]) == ("kahve", 2), "eşitlikte alfabetik önce gelen (kahve) seçilmeli"\nassert en_cok_satan(["limon"]) == ("limon", 1), "tek ürün"\nassert en_cok_satan([]) is None, "boş liste None"\nassert "max(" not in __source__ and "Counter" not in __source__, "max ve Counter kullanmadan yaz"\n',
      hints: ['İki kalıp art arda: önce frekans sözlüğü, sonra en iyi değer.', 'Eşitlik kuralı: adet > en_iyi[1] ya da (adet eşit ve urun < en_iyi[0]).'],
      why: 'Frekans kalıbı veriyi özetler, en iyi değer kalıbı özetten seçim yapar; eşitlik kuralını karşılaştırmaya eklemek sonucu deterministik kılar.' },
    { id: 'dongu-kaliplari-6',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 1,
      q: '<p><code>carpim_tablosu(satir, sutun)</code> fonksiyonunu iç içe döngüyle yaz: 1\'den <code>satir</code>\'a kadar her i için 1\'den <code>sutun</code>\'a kadar i×j değerlerini her biri 4 karakter sağa yaslı olacak şekilde (<code>f"{x:4}"</code>) tek satırda yazdırsın. Program sonunda <code>carpim_tablosu(3, 5)</code> çağır.</p><pre class="out">   1   2   3   4   5\n   2   4   6   8  10\n   3   6   9  12  15</pre>',
      start: 'def carpim_tablosu(satir, sutun):\n    pass\n\ncarpim_tablosu(3, 5)\n',
      sol: 'def carpim_tablosu(satir, sutun):\n    for i in range(1, satir + 1):\n        metin = ""\n        for j in range(1, sutun + 1):\n            metin += f"{i * j:4}"\n        print(metin)\n\ncarpim_tablosu(3, 5)\n',
      expect: '   1   2   3   4   5\n   2   4   6   8  10\n   3   6   9  12  15\n',
      hints: ['Dış döngü satırlar, iç döngü sütunlar; range bitişi dahil etmez: range(1, satir + 1).', 'Her satır için boş metin başlat, iç döngüde ekle, iç döngü bitince yazdır.'],
      why: 'İç döngü her dış turda baştan çalışır; satır metnini iç döngüde biriktirip dış döngüde yazdırmak tabloyu satır satır üretir.' },
    { id: 'dongu-kaliplari-7',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p>Kampanya ekibi "iki ürün al, bütçeyi tam kullan" önerisi istiyor. <code>butce_ikilileri(urunler, butce)</code> fonksiyonunu yaz: <code>urunler</code>, <code>(ad, fiyat)</code> listesidir. Fiyatları toplamı tam <code>butce</code>\'ye eşit olan tüm farklı ürün ikililerini <code>(ad1, ad2)</code> demetleri olarak döndür. ad1 listede ad2\'den önce gelen ürün olsun; ikililer bulunma sırasıyla listelensin. Bir ürün kendisiyle eşleşmesin.</p>',
      start: 'def butce_ikilileri(urunler, butce):\n    pass\n',
      sol: 'def butce_ikilileri(urunler, butce):\n    sonuc = []\n    for i in range(len(urunler)):\n        for j in range(i + 1, len(urunler)):\n            if urunler[i][1] + urunler[j][1] == butce:\n                sonuc.append((urunler[i][0], urunler[j][0]))\n    return sonuc\n',
      tests: 'u = [("çay", 150), ("kahve", 250), ("kupa", 200), ("şeker", 50), ("termos", 350), ("bardak", 200)]\nassert butce_ikilileri(u, 400) == [("çay", "kahve"), ("kupa", "bardak"), ("şeker", "termos")], f"çay+kahve, kupa+bardak, şeker+termos bekleniyordu (bulunma sırasıyla); gelen {butce_ikilileri(u, 400)}"\nassert butce_ikilileri(u, 100) == [], "50 + 50 için iki farklı ürün yok: ürün kendisiyle eşleşmemeli"\nassert butce_ikilileri([], 10) == [], "boş liste"\n',
      hints: ['Tüm çiftler için iç döngü i + 1\'den başlar.', 'urunler[i][1] + urunler[j][1] == butce'],
      why: 'İç döngünün i + 1\'den başlaması her çifti bir kez ve elemanı kendisiyle eşlemeden üretir.' },
    { id: 'dongu-kaliplari-8',
      t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      diff: 2,
      q: '<p>Hatayı bul ve düzelt. <code>en_kotu_gun(gunluk_kar)</code> en düşük kâr değerini ve onun gün numarasını (1\'den başlayarak) <code>(gun, deger)</code> olarak döndürmeli. Zarar eden günleri olan şubede doğru çalışıyor ama tüm günleri kârlı bir şubede saçma sonuç veriyor.</p>',
      start: 'def en_kotu_gun(gunluk_kar):\n    en_kotu = 0\n    gun = 0\n    for i, k in enumerate(gunluk_kar, start=1):\n        if k < en_kotu:\n            en_kotu = k\n            gun = i\n    return (gun, en_kotu)\n',
      sol: 'def en_kotu_gun(gunluk_kar):\n    en_kotu = gunluk_kar[0]\n    gun = 1\n    for i, k in enumerate(gunluk_kar, start=1):\n        if k < en_kotu:\n            en_kotu = k\n            gun = i\n    return (gun, en_kotu)\n',
      tests: 'assert en_kotu_gun([300, -50, 120, -400, 80]) == (4, -400), "zararlı şubede 4. gün -400"\nassert en_kotu_gun([300, 150, 220]) == (2, 150), "tüm günler kârlıyken en kötü gün 2. gün (150) olmalı: 0 ile başlatma tuzağı"\nassert en_kotu_gun([75]) == (1, 75), "tek günlük veride o gün döner"\n',
      hints: ['Başlangıç değeri 0 olunca pozitif değerlerin hiçbiri ondan küçük olmaz.', 'Adayı ilk elemanla ve gün 1 ile başlat.'],
      why: 'En iyi değer kalıbında başlangıç, verinin içinden gelmelidir; 0 gibi dışarıdan bir değer, değişmezi ("aday, görülenlerin en küçüğüdür") baştan bozar.' },
    { id: 'dongu-kaliplari-9',
      t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      diff: 2,
      q: '<p>Hatayı bul ve düzelt. <code>iptalleri_temizle(siparisler)</code> durumu <code>"iptal"</code> olan sözlükleri listeden <b>yerinde</b> (aynı liste nesnesinde) çıkarmalı ve çıkarılan sipariş sayısını döndürmeli. Art arda iki iptal geldiğinde biri listede kalıyor.</p>',
      start: 'def iptalleri_temizle(siparisler):\n    sayi = 0\n    for s in siparisler:\n        if s["durum"] == "iptal":\n            siparisler.remove(s)\n            sayi += 1\n    return sayi\n',
      sol: 'def iptalleri_temizle(siparisler):\n    sayi = 0\n    for s in siparisler[:]:\n        if s["durum"] == "iptal":\n            siparisler.remove(s)\n            sayi += 1\n    return sayi\n',
      tests: 'liste = [{"no": 1, "durum": "iptal"}, {"no": 2, "durum": "iptal"}, {"no": 3, "durum": "aktif"}, {"no": 4, "durum": "iptal"}]\nayni = liste\nn = iptalleri_temizle(liste)\nassert [s["no"] for s in liste] == [3], f"yalnız 3 numaralı sipariş kalmalı; kalanlar {[s[\'no\'] for s in liste]}"\nassert n == 3, f"3 iptal çıkarılmalı; gelen {n}"\nassert liste is ayni, "liste yerinde değiştirilmeli (aynı nesne)"\n',
      hints: ['Gezdiğin listeden silince elemanlar sola kayar ve döngü bir elemanı atlar.', 'Kopya üzerinde gez (siparisler[:]), orijinalden sil.'],
      why: 'Kopya üzerinde gezmek döngünün iç sayacını silmelerden bağımsız kılar; silmeler orijinal liste nesnesine uygulandığından çağıranın listesi de güncellenir.' },
    { id: 'dongu-kaliplari-10',
      t: 'code',
      stage: 'Meydan okuma',
      diff: 3,
      q: '<p><code>en_uzun_artis(degerler)</code> fonksiyonunu yaz: listedeki <b>kesin artan</b> (her eleman bir öncekinden büyük) en uzun ardışık bölümü bulsun ve <code>(baslangic_indeksi, uzunluk)</code> döndürsün. Uzunluk eleman sayısıdır (tek eleman da 1 uzunluğunda bir seridir). Eşit uzunlukta birden fazla seri varsa <b>ilkini</b> döndür. Boş liste için <code>(-1, 0)</code> döndür. Tek geçişte çöz.</p>',
      start: 'def en_uzun_artis(degerler):\n    pass\n',
      sol: 'def en_uzun_artis(degerler):\n    if not degerler:\n        return (-1, 0)\n    en_bas, en_uzun = 0, 1\n    bas, uzun = 0, 1\n    for i in range(1, len(degerler)):\n        if degerler[i] > degerler[i - 1]:\n            uzun += 1\n        else:\n            bas, uzun = i, 1\n        if uzun > en_uzun:\n            en_bas, en_uzun = bas, uzun\n    return (en_bas, en_uzun)\n',
      tests: 'assert en_uzun_artis([5, 1, 2, 3, 2, 4, 6, 8, 1]) == (4, 4), "2,4,6,8 serisi indeks 4\'ten başlar, uzunluk 4"\nassert en_uzun_artis([1, 2, 2, 3]) == (0, 2), "eşit değer seriyi kırar; ilk eşit uzunluktaki seri (0, 2) seçilir"\nassert en_uzun_artis([9, 7, 5]) == (0, 1), "hiç artış yoksa ilk eleman tek başına seridir"\nassert en_uzun_artis([1, 2, 3, 4]) == (0, 4), "liste sonuna kadar süren seri de sayılmalı"\nassert en_uzun_artis([7]) == (0, 1), "tek eleman"\nassert en_uzun_artis([]) == (-1, 0), "boş liste (-1, 0)"\nassert en_uzun_artis([3, 1, 2, 0, 5]) == (1, 2), "eşitlikte ilk seri"\n',
      hints: ['İki durum tut: şu anki seri (başlangıç, uzunluk) ve en iyi seri.', 'Artış yoksa yeni seri bu indekste başlar: bas, uzun = i, 1.', 'En iyiyi döngünün içinde, her adımda güncelle; böylece sona kadar süren seri de yakalanır. Eşitlikte güncelleme yapma (> kullan).'],
      why: 'Komşu karşılaştırma (seri) ile en iyi değer kalıbı birleşir. En iyiyi her turda kontrol etmek, liste sonunda biten seriyi kaçırma hatasını önler; kesin büyüktür eşitlikte ilk seriyi korur.' },
    { id: 'dongu-kaliplari-11',
      t: 'code',
      stage: 'Mini proje',
      diff: 3,
      q: '<p>Anadolu Market şube müdürü için aylık satış raporu: <code>aylik_rapor(gunluk, hedef)</code> fonksiyonunu yaz. <code>gunluk</code>, günlük ciro listesidir (gün 1\'den başlar). Tek geçişte şu anahtarlarla bir sözlük döndür:</p><ul><li><code>"toplam"</code>: toplam ciro</li><li><code>"ortalama"</code>: 2 ondalığa yuvarlanmış ortalama (boş listede 0)</li><li><code>"en_iyi_gun"</code>: en yüksek cirolu günün numarası (eşitlikte ilki; boşsa None)</li><li><code>"artis_gunu"</code>: bir önceki güne göre ciro artan gün sayısı</li><li><code>"hedef_gunu"</code>: kümülatif cironun ilk kez <code>hedef</code>\'e ulaştığı (<code>&gt;=</code>) gün numarası; ulaşılmadıysa None</li></ul><p><code>sum</code>, <code>max</code>, <code>min</code> kullanma.</p>',
      start: 'def aylik_rapor(gunluk, hedef):\n    # TODO: tek döngüde tüm kalıpları birleştir\n    pass\n',
      sol: 'def aylik_rapor(gunluk, hedef):\n    toplam = 0\n    en_iyi_gun = None\n    en_iyi = None\n    artis = 0\n    hedef_gunu = None\n    onceki = None\n    for gun, ciro in enumerate(gunluk, start=1):\n        toplam += ciro\n        if en_iyi is None or ciro > en_iyi:\n            en_iyi, en_iyi_gun = ciro, gun\n        if onceki is not None and ciro > onceki:\n            artis += 1\n        if hedef_gunu is None and toplam >= hedef:\n            hedef_gunu = gun\n        onceki = ciro\n    ortalama = round(toplam / len(gunluk), 2) if gunluk else 0\n    return {"toplam": toplam, "ortalama": ortalama, "en_iyi_gun": en_iyi_gun,\n            "artis_gunu": artis, "hedef_gunu": hedef_gunu}\n',
      tests: 'r = aylik_rapor([1200, 900, 1500, 1500, 800, 2100], 4000)\nassert r is not None, "fonksiyon sözlük döndürmeli"\nassert r["toplam"] == 8000, "toplam 8000"\nassert r["ortalama"] == 1333.33, "ortalama 8000/6 = 1333.33"\nassert r["en_iyi_gun"] == 6, "en yüksek ciro 6. gün (2100)"\nassert r["artis_gunu"] == 2, "artış: 900→1500 ve 800→2100; eşit gün artış sayılmaz"\nassert r["hedef_gunu"] == 4, "kümülatif: 1200, 2100, 3600, 5100 → 4. gün hedefe ulaşır"\nr2 = aylik_rapor([500, 500], 5000)\nassert r2["en_iyi_gun"] == 1 and r2["hedef_gunu"] is None, "eşitlikte ilk gün; hedefe ulaşılmazsa None"\nassert aylik_rapor([], 100) == {"toplam": 0, "ortalama": 0, "en_iyi_gun": None, "artis_gunu": 0, "hedef_gunu": None}, "boş ay için sıfır rapor"\nfor yasak in ("sum(", "max(", "min("):\n    assert yasak not in __source__, f"{yasak} kullanmadan kalıpları kendin yaz"\n',
      hints: ['Tek döngüde beş kalıp: biriktirici (toplam), en iyi değer, komşu karşılaştırma (onceki değişkeni), ilk kez olan olay (hedef_gunu None ise kontrol et).', 'onceki değişkenini None ile başlat ve her turun sonunda güncelle.', 'Ortalamayı döngüden sonra hesapla; boş liste için sıfıra bölmeyi önle.'],
      why: 'Gerçek raporlar tek bir kalıptan değil, aynı geçişte birlikte çalışan birkaç kalıptan oluşur. Her kalıbın kendi başlangıç değeri ve güncelleme kuralı olduğunu bilmek, bunları karıştırmadan tek döngüde birleştirmeni sağlar.' }
  ],
  faq: [
    { q: 'max ve min varken neden elle en büyük bulmayı öğreniyorum?',
      a: 'Çünkü çoğu zaman değerin kendisini değil, ona ait kaydı, konumu ya da özel bir eşitlik kuralını istersin. Ayrıca karmaşık kurallarda (iptal edilmemiş en büyük sipariş gibi) kalıbı bilmek gerekir. max(liste, key=...) bunun kısaltmasıdır; Orta seviyede göreceksin.' },
    { q: 'Bayrak değişkeni mi, for-else mi, return mü?',
      a: 'Fonksiyon içindeysen erken return en okunur olanıdır. Fonksiyon dışında, sonucu sonra kullanacaksan bayrak; yalnız "bulunamadı" durumunda bir şey yapacaksan for-else kısa ve açıktır.' },
    { q: 'İç içe döngü her zaman kötü mü?',
      a: 'Hayır. Küçük verilerde ya da gerçekten tüm kombinasyonlara bakman gerekiyorsa doğru araçtır. Sorun büyük veride başlar: 10 bin elemanlı listede tüm çiftler 50 milyon işlem eder. O zaman sözlük ya da kümeyle tek geçişe indirmenin yolunu ara.' },
    { q: 'while True ile döngü kurmak kötü bir alışkanlık mı?',
      a: 'Bilinçli kullanıldığında değil: menü döngüleri, kuyruk dinleyicileri ve "en az bir kez çalış" gerektiren işler için yaygındır. Şart olan, döngünün içinde mutlaka bir break ya da return olması ve çıkış koşulunun açık olmasıdır.' }
  ],
  mistakes: [
    { why: 'Tüm değerler negatifse 0 yanlış sonuç verir; aday her zaman verinin içinden başlamalı.',
      bad: 'en_buyuk = 0\nfor x in degerler:\n    if x > en_buyuk:\n        en_buyuk = x',
      good: 'en_buyuk = degerler[0]\nfor x in degerler:\n    if x > en_buyuk:\n        en_buyuk = x' },
    { why: 'i = 0 iken s[-1] son elemanı okur; hata vermez ama sonucu bozar.',
      bad: 'for i in range(len(s)):\n    if s[i] > s[i - 1]:\n        artis += 1',
      good: 'for i in range(1, len(s)):\n    if s[i] > s[i - 1]:\n        artis += 1' },
    { why: 'Gezilen listeden silmek elemanları kaydırır ve bazılarını atlatır.',
      bad: 'for s in siparisler:\n    if s == "iptal":\n        siparisler.remove(s)',
      good: 'siparisler = [s for s in siparisler if s != "iptal"]\n# ya da: for s in siparisler[:]: ...' },
    { why: 'Çarpım biriktiricisi 1 ile başlar; 0 ile başlarsan sonuç hep 0 olur.',
      bad: 'carpim = 0\nfor x in oranlar:\n    carpim *= x',
      good: 'carpim = 1\nfor x in oranlar:\n    carpim *= x' },
    { why: 'Faiz 0 ya da negatifse koşul hiç bozulmaz; üst sınır sonsuz döngüyü önler.',
      bad: 'while bakiye < hedef:\n    bakiye *= 1 + faiz',
      good: 'ay = 0\nwhile bakiye < hedef and ay < 1200:\n    bakiye *= 1 + faiz\n    ay += 1' }
  ] }
);
})(window);
/* PythonPatika v2 — ic-ice-veri */
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push(
{ id: 'ic-ice-veri',
  lv: 'temel',
  mod: 'Veri Türleri',
  min: 35,
  title: 'İç içe veri yapıları',
  sum: 'Liste içinde sözlük, sözlük içinde liste ve JSON benzeri derin yapılarda gezinir; güvenli erişim, güncelleme, gruplama, düzleştirme, tablo gibi yazdırma ve sığ/derin kopya tuzağını Anadolu Market verisiyle öğrenirsin.',
  goals: ['Kayıt listesi (liste içinde sözlük) ve sözlük içinde liste yapılarını kurup gezebilirim.', 'Derin bir yapıda bir değere giden yolu adım adım yazar, .get zinciriyle güvenli okurum.', 'İç içe yapıyı yerinde güncelleyebilir, kayıtları bir alana göre gruplayabilirim.', 'İç içe siparişleri düz bir satır listesine çevirip tablo gibi hizalı yazdırabilirim.', 'Sığ kopya ile derin kopya arasındaki farkı açıklar, doğru olanı seçerim.'],
  body: `
<h2>Gerçek veri düz değildir</h2>
<p>Şimdiye kadar tek bir liste ya da tek bir sözlükle çalıştın. Gerçek işte veri neredeyse hiç böyle gelmez. Anadolu Market'in sipariş sisteminden gelen bir kayıt düşün: siparişin bir müşterisi var, müşterinin bir adresi var, siparişin içinde birden fazla ürün kalemi var, her kalemin adedi ve fiyatı var. Bu bilgi doğal olarak <b>iç içe</b> (nested) bir yapıdır: sözlüğün içinde sözlük, onun içinde liste, listenin içinde yine sözlük.</p>
<p>Web servislerinden (API) gelen JSON yanıtları, yapılandırma dosyaları, e-ticaret sepetleri, banka hesap hareketleri; hepsi bu biçimdedir. Bu derste iç içe yapıları okumayı, güvenle erişmeyi, değiştirmeyi ve analiz için düzleştirmeyi öğreneceksin. Listeler ve Sözlükler derslerinde gördüğün her şey burada birleşiyor.</p>

<h2>Kayıt listesi: liste içinde sözlük</h2>
<p>En yaygın yapı budur: her eleman bir kayıt (satır), her kayıt bir sözlük (sütun adı → değer). Bir Excel tablosunun Python karşılığı diye düşünebilirsin.</p>
<pre class="py">siparisler = [
    {"no": "AM-101", "musteri": "Ayşe", "sehir": "İzmir", "tutar": 1499.9},
    {"no": "AM-102", "musteri": "Mehmet", "sehir": "Ankara", "tutar": 250.0},
    {"no": "AM-103", "musteri": "Zeynep", "sehir": "İzmir", "tutar": 89.5},
]
print(len(siparisler), "sipariş")
print(siparisler[0]["musteri"])          # ilk kaydın müşterisi
for s in siparisler:
    if s["sehir"] == "İzmir":
        print(s["no"], s["tutar"])
toplam = 0
for s in siparisler:
    toplam += s["tutar"]
print("Toplam:", round(toplam, 2))</pre>
<p>Okuma kuralı basit: önce köşeli parantezle <b>hangi kayıt</b> (indeks), sonra <b>hangi alan</b> (anahtar). <code>siparisler[0]["musteri"]</code> "0. kaydın musteri alanı" demektir. Döngüde ise <code>s</code> zaten tek bir sözlüktür; doğrudan <code>s["tutar"]</code> yazarsın.</p>

<h2>Sözlük içinde liste</h2>
<p>Ters yön de çok kullanılır: bir anahtarın altında birden fazla değer tutmak. Bir müşterinin sipariş numaraları, bir şehrin şube listesi, bir ürünün etiketleri.</p>
<pre class="py">musteri = {
    "no": "M-101",
    "ad": "Ayşe Yılmaz",
    "siparisler": ["AM-101", "AM-117"],
    "etiketler": ["sadık", "kampanya"],
}
musteri["siparisler"].append("AM-130")     # iç listeye ekle
print(musteri["siparisler"])
print(len(musteri["siparisler"]), "sipariş")
print("sadık" in musteri["etiketler"])
print(musteri["siparisler"][-1])           # son sipariş</pre>
<p><code>musteri["siparisler"]</code> bir liste döndürür; ona <code>.append</code>, <code>len</code>, <code>in</code>, dilim gibi tüm liste işlemlerini uygulayabilirsin. İç listeyi değiştirdiğinde sözlüğün içindeki liste değişir, çünkü ikisi aynı nesnedir.</p>

<h2>Derin yapılarda gezinme: yolu adım adım yaz</h2>
<p>Gerçek bir sipariş kaydı daha derindir. Aşağıdaki yapı, bir API'den gelen JSON yanıtının tipik görünümüdür.</p>
<pre class="py">siparis = {
    "no": "AM-205",
    "musteri": {
        "ad": "Ayşe Yılmaz",
        "adres": {"sehir": "İzmir", "ilce": "Konak"},
    },
    "kalemler": [
        {"urun": "Kahve makinesi", "adet": 1, "fiyat": 1499.9},
        {"urun": "Filtre kağıdı", "adet": 3, "fiyat": 45.0},
    ],
}
print(siparis["musteri"]["adres"]["sehir"])
print(siparis["kalemler"][1]["urun"])
print(type(siparis["kalemler"]), type(siparis["kalemler"][0]))
toplam = 0
for k in siparis["kalemler"]:
    toplam += k["adet"] * k["fiyat"]
print("Sipariş toplamı:", round(toplam, 2))</pre>
<p>Derin bir değere ulaşmak için yolu soldan sağa okursun: <code>siparis</code> → <code>["musteri"]</code> (sözlük) → <code>["adres"]</code> (sözlük) → <code>["sehir"]</code> (metin). Her adımda elindeki şeyin türünü bil: sözlükse anahtar, listeyse indeks kullanırsın. Kaybolduğunda bir ara adımı <code>print(type(...))</code> ile yazdır; bu, deneyimli geliştiricilerin de en çok kullandığı yöntemdir.</p>
<div class="tbl-wrap"><table>
<tr><th>İfade</th><th>Elindeki şey</th><th>Sonraki adım</th></tr>
<tr><td><code>siparis</code></td><td>sözlük</td><td>anahtar: <code>["kalemler"]</code></td></tr>
<tr><td><code>siparis["kalemler"]</code></td><td>liste</td><td>indeks: <code>[1]</code> ya da <code>for</code></td></tr>
<tr><td><code>siparis["kalemler"][1]</code></td><td>sözlük</td><td>anahtar: <code>["urun"]</code></td></tr>
<tr><td><code>siparis["kalemler"][1]["urun"]</code></td><td>metin</td><td>metin işlemleri</td></tr>
</table></div>

<h2>Güvenli erişim: .get zinciri</h2>
<p>Gerçek veride alanlar eksik olabilir: bazı müşterilerin adresi girilmemiştir, bazı siparişlerde indirim alanı yoktur. Köşeli parantez eksik anahtarda <code>KeyError</code> verir ve tüm rapor durur. Sözlükler dersinde <code>get</code> ile varsayılan değeri gördün; iç içe yapıda bunu <b>zincirlersin</b>.</p>
<pre class="py">musteriler = [
    {"ad": "Ayşe", "adres": {"sehir": "İzmir"}},
    {"ad": "Mehmet"},                       # adres yok
    {"ad": "Zeynep", "adres": {}},          # adres var, şehir yok
]
for m in musteriler:
    sehir = m.get("adres", {}).get("sehir", "Bilinmiyor")
    print(m["ad"], "→", sehir)</pre>
<p>Püf noktası ara adımdaki varsayılan: <code>m.get("adres", {})</code>. Adres yoksa boş sözlük döner ve ikinci <code>.get</code> onun üzerinde güvenle çalışır. Varsayılanı yazmazsan <code>None</code> döner ve <code>None.get(...)</code> <code>AttributeError</code> verir. Listede eksik olabilecek bir indeks için de benzer bir kontrol yaparsın: <code>kalemler[0] if kalemler else None</code>.</p>
<div class="warn"><b>get zinciri her şeyi çözmez</b>Zincirin ara adımı bazen anahtar eksikliği değil <b>None</b> değeri olarak gelir: <code>{"adres": None}</code>. Bu durumda <code>.get("adres", {})</code> yine None döndürür, çünkü anahtar vardır. Kirli veride <code>(m.get("adres") or {}).get("sehir")</code> yazmak daha dayanıklıdır: <code>or</code>, None'ı da boş sözlükle değiştirir.</div>
<p>Çok derin yollar için küçük bir yardımcı fonksiyon yazmak işini kolaylaştırır. Yolu bir liste olarak verirsin; fonksiyon her adımda bir sonraki katmana iner, bir adım bulunamazsa varsayılanı döndürür.</p>
<pre class="py">def derin_al(veri, yol, varsayilan=None):
    for adim in yol:
        try:
            veri = veri[adim]
        except (KeyError, IndexError, TypeError):
            return varsayilan
    return veri

siparis = {"musteri": {"adres": {"sehir": "İzmir"}}, "kalemler": [{"urun": "Çay"}]}
print(derin_al(siparis, ["musteri", "adres", "sehir"]))
print(derin_al(siparis, ["kalemler", 0, "urun"]))
print(derin_al(siparis, ["kalemler", 5, "urun"], "yok"))
print(derin_al(siparis, ["musteri", "telefon"], "yok"))</pre>
<p>Buradaki <code>try/except</code> yapısını Hatalar dersinde ayrıntılı göreceksin; şimdilik "bu adım patlarsa varsayılanı döndür" diye oku.</p>

<h2>İç içe yapıyı güncellemek</h2>
<p>Okuduğun yolun aynısıyla yazabilirsin. Son adıma atama yaparsan değer değişir; iç listeye <code>append</code> yaparsan eleman eklenir.</p>
<pre class="py">siparis = {
    "no": "AM-205",
    "durum": "hazırlanıyor",
    "musteri": {"ad": "Ayşe", "adres": {"sehir": "İzmir"}},
    "kalemler": [{"urun": "Çay", "adet": 2, "fiyat": 120.0}],
}
siparis["durum"] = "kargoda"
siparis["musteri"]["adres"]["ilce"] = "Bornova"          # yeni alan
siparis["kalemler"][0]["adet"] += 1                       # adet 3 oldu
siparis["kalemler"].append({"urun": "Bardak", "adet": 6, "fiyat": 25.0})
siparis.setdefault("notlar", []).append("Kapıya bırak")   # liste yoksa oluştur
print(siparis["musteri"]["adres"])
print(len(siparis["kalemler"]), siparis["kalemler"][0]["adet"])
print(siparis["notlar"])</pre>
<p><code>setdefault(anahtar, [])</code> çok kullanışlıdır: anahtar yoksa boş liste koyup onu döndürür, varsa mevcut listeyi döndürür. Böylece "liste var mı yok mu" kontrolünü tek satırda geçersin.</p>

<h2>Gruplama: şehre göre sipariş listesi</h2>
<p>Sözlükler dersinde sayım kalıbını gördün: her şehirde kaç sipariş var. Gruplama bir adım ötesidir: her şehrin <b>siparişlerinin kendisini</b> bir listede toplarsın. Sonuç sözlük içinde liste yapısıdır.</p>
<pre class="py">siparisler = [
    {"no": "AM-101", "sehir": "İzmir", "tutar": 1499.9},
    {"no": "AM-102", "sehir": "Ankara", "tutar": 250.0},
    {"no": "AM-103", "sehir": "İzmir", "tutar": 89.5},
    {"no": "AM-104", "sehir": "Bursa", "tutar": 3200.0},
]
gruplar = {}
for s in siparisler:
    gruplar.setdefault(s["sehir"], []).append(s["no"])
print(gruplar)
for sehir, nolar in gruplar.items():
    print(sehir, len(nolar), nolar)</pre>
<p>Aynı işi <code>if s["sehir"] not in gruplar: gruplar[s["sehir"]] = []</code> diye iki satırla da yazabilirsin; <code>setdefault</code> bunun kısaltmasıdır. Orta seviyede <code>collections.defaultdict(list)</code> ile daha da kısalacak. Sık yapılan hata, <code>gruplar[sehir] = [no]</code> yazıp her seferinde listeyi sıfırlamaktır.</p>

<h2>Düzleştirme: iç içe veriyi tabloya çevirmek</h2>
<p>Analiz ve raporlama için çoğu zaman <b>düz</b> (flat) bir tablo istersin: her satır bir kalem, her sütun bir alan. Bu, pandas'a ya da Excel'e aktarmanın da ön adımıdır. İç içe döngüyle dış kaydın bilgisini her iç satıra taşırsın.</p>
<pre class="py">siparisler = [
    {"no": "AM-101", "sehir": "İzmir",
     "kalemler": [{"urun": "Çay", "adet": 2, "fiyat": 120.0},
                  {"urun": "Bardak", "adet": 6, "fiyat": 25.0}]},
    {"no": "AM-102", "sehir": "Ankara",
     "kalemler": [{"urun": "Kahve", "adet": 1, "fiyat": 350.0}]},
]
satirlar = []
for s in siparisler:
    for k in s["kalemler"]:
        satirlar.append({
            "no": s["no"], "sehir": s["sehir"], "urun": k["urun"],
            "tutar": k["adet"] * k["fiyat"],
        })
print(len(satirlar), "satır")
for r in satirlar:
    print(r)</pre>

<h2>Tablo gibi yazdırmak</h2>
<p>Düz satırları ekranda okunur göstermek için f-string hizalaması kullan: <code>:&lt;12</code> sola, <code>:&gt;10</code> sağa yaslar, <code>:.2f</code> iki ondalık verir. Metinler sola, sayılar sağa hizalanır; muhasebe raporlarının da kuralı budur.</p>
<pre class="py">satirlar = [
    {"no": "AM-101", "urun": "Çay", "tutar": 240.0},
    {"no": "AM-101", "urun": "Bardak", "tutar": 150.0},
    {"no": "AM-102", "urun": "Kahve", "tutar": 350.0},
]
print(f"{'Sipariş':&lt;8} {'Ürün':&lt;10} {'Tutar':&gt;8}")
print("-" * 28)
for r in satirlar:
    print(f"{r['no']:&lt;8} {r['urun']:&lt;10} {r['tutar']:&gt;8.2f}")
print("-" * 28)
print(f"{'TOPLAM':&lt;19} {sum(r['tutar'] for r in satirlar):&gt;8.2f}")</pre>
<div class="tip"><b>Tırnak karışıklığı</b>f-string içinde sözlük anahtarı yazarken dıştaki tırnakla aynı tırnağı kullanma: <code>f"{r['no']}"</code> doğru, eski sürümlerde <code>f"{r["no"]}"</code> SyntaxError verir. Python 3.12 bunu kabul etse de karışık tırnak alışkanlığı her sürümde çalışır. Biçimlendirmenin tüm ayrıntısını String biçimleme dersinde göreceksin.</div>
<p>Bir yapının içini hızlıca görmek için iki araç daha var: <code>pprint.pprint(veri)</code> iç içe yapıyı girintili yazdırır, <code>json.dumps(veri, indent=2, ensure_ascii=False)</code> JSON görünümü verir. Hata ayıklarken ikisi de hayat kurtarır.</p>

<h2>Sığ kopya, derin kopya tuzağı</h2>
<p>Listeler dersinde atamanın kopya olmadığını gördün. İç içe yapıda bir adım daha var: <code>.copy()</code> yalnızca <b>en dış katmanı</b> kopyalar. Bu sığ kopyadır (shallow copy); içteki listeler ve sözlükler hâlâ paylaşılır.</p>
<pre class="py">import copy

katalog = {"Çay": {"fiyat": 120.0, "etiket": ["içecek"]}}
sig = katalog.copy()
derin = copy.deepcopy(katalog)

sig["Çay"]["fiyat"] = 99.0           # iç sözlük paylaşılıyor!
derin["Çay"]["etiket"].append("kampanya")

print(katalog["Çay"]["fiyat"])        # orijinal de değişti: 99.0
print(katalog["Çay"]["etiket"])       # orijinal etkilenmedi
print(sig["Çay"] is katalog["Çay"], derin["Çay"] is katalog["Çay"])</pre>
<div class="tbl-wrap"><table>
<tr><th>Yöntem</th><th>Dış katman</th><th>İç katmanlar</th><th>Ne zaman</th></tr>
<tr><td><code>b = a</code></td><td>Paylaşılır</td><td>Paylaşılır</td><td>Kopya istemiyorsan, aynı nesneye ikinci ad</td></tr>
<tr><td><code>a.copy()</code>, <code>list(a)</code>, <code>a[:]</code></td><td>Yeni</td><td>Paylaşılır</td><td>Yapı düzse (sayı, metin elemanlar)</td></tr>
<tr><td><code>copy.deepcopy(a)</code></td><td>Yeni</td><td>Yeni</td><td>İç içe yapıyı bağımsız değiştireceksen</td></tr>
</table></div>
<p>Aynı tuzak <code>[[0] * 3] * 3</code> ile tablo kurarken de karşına çıkar: üç satır aynı iç listedir, birini değiştirince hepsi değişir. Doğrusu her satırı ayrı oluşturmaktır: <code>[[0] * 3 for _ in range(3)]</code>.</p>
<div class="note"><b>Gerçek işte</b>Bir veri analisti ya da backend geliştiricisi gününün önemli kısmını iç içe JSON'la geçirir: ödeme sağlayıcısının webhook mesajı, kargo firmasının takip yanıtı, CRM'den gelen müşteri kaydı. Tipik iş akışı hep aynıdır: yanıtı al, <code>.get</code> zinciriyle eksik alanlara dayanıklı oku, ihtiyacın olan alanları düz satırlara çevir, sonra raporla ya da veritabanına yaz. Kampanya fiyatı hesaplarken orijinal kataloğu sığ kopyayla bozmak ise canlı sistemde yaşanan klasik hatalardandır; fiyat ekranı birden yanlış göstermeye başlar.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Ne kadar iç içe olmalı?</h3>
<p>İç içelik veriyi doğal gösterir ama her katman okumayı zorlaştırır. Üç-dört katmandan derin yapılar genellikle tasarım kokusudur. Veritabanı mantığında veriyi <b>normalize</b> edersin: müşterileri ayrı bir sözlükte (<code>{"M-101": {...}}</code>), siparişleri ayrı bir listede tutar, siparişte yalnızca <code>"musteri_no"</code> saklarsın. Gerektiğinde sözlükten anında bulursun. Bu, SQL'deki JOIN'in Python karşılığıdır ve aynı müşteri bilgisinin yüz siparişte kopyalanmasını önler.</p>
<pre class="py">musteriler = {"M-1": {"ad": "Ayşe", "sehir": "İzmir"}, "M-2": {"ad": "Mehmet", "sehir": "Ankara"}}
siparisler = [{"no": "AM-1", "musteri_no": "M-1", "tutar": 300}, {"no": "AM-2", "musteri_no": "M-2", "tutar": 120}]
for s in siparisler:
    m = musteriler.get(s["musteri_no"], {})
    print(s["no"], m.get("ad", "?"), m.get("sehir", "?"), s["tutar"])</pre>
<h3>Sözlükten sınıfa</h3>
<p><code>s["musteri"]["adres"]["sehir"]</code> yazarken anahtarı yanlış yazarsan hata ancak çalışırken ortaya çıkar. Orta seviyede <code>dataclass</code> ile kayıtları sınıfa çevirip <code>s.musteri.adres.sehir</code> yazacak, editörün otomatik tamamlamasından ve tip denetiminden yararlanacaksın. Dış dünyadan gelen JSON'u sınıflara çevirmek için de pydantic gibi kütüphaneler kullanılır.</p>
<h3>Bilinmeyen derinlik</h3>
<p>Bazen yapının kaç katman olduğunu bilmezsin: klasör ağacı, kategori ağacı, organizasyon şeması. Bunları gezmek için ya bir yığın (stack) ile döngü kurarsın ya da fonksiyonun kendini çağırdığı özyinelemeyi (recursion) kullanırsın. Özyineleme dersinde iç içe listenin toplamını ve klasör ağacını tam bu tekniklerle gezeceksin.</p>
</section>
`,
  ex: [
    { t: 'mc',
      stage: 'Isınma',
      q: '<code>siparisler[1]["kalemler"][0]["urun"]</code> ifadesi neyi verir?',
      o: ['İlk siparişin ikinci kaleminin ürün adını', 'İkinci siparişin ilk kaleminin ürün adını', 'İkinci siparişin tüm kalemlerini', 'Hata verir, iki tür köşeli parantez karışamaz'],
      a: 1,
      why: 'Yol soldan sağa okunur: [1] ikinci sipariş (indeks 0\'dan başlar), ["kalemler"] o siparişin kalem listesi, [0] ilk kalem, ["urun"] o kalemin ürün adı. Liste indeksi ve sözlük anahtarı aynı ifadede serbestçe karışabilir.' },
    { t: 'mc',
      stage: 'Isınma',
      q: '<code>m.get("adres", {}).get("sehir", "?")</code> ifadesinde ilk get\'e neden <code>{}</code> varsayılanı verilir?',
      o: ['Boş sözlük daha az bellek kullandığı için', 'Adres yoksa ikinci .get boş sözlükte güvenle çalışsın diye', 'Python get\'te varsayılanı zorunlu tuttuğu için', 'Şehir alanını otomatik olarak oluşturmak için'],
      a: 1,
      why: 'Adres anahtarı yoksa varsayılansız get None döndürür ve None.get(...) AttributeError verir. {} döndüğünde ikinci get onun üzerinde çalışır ve "?" verir. Varsayılan zorunlu değildir ve hiçbir alan oluşturmaz.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Bu kod ne yazdırır?',
      code: 'siparis = {\n    "no": "AM-7",\n    "kalemler": [\n        {"urun": "Çay", "adet": 2},\n        {"urun": "Şeker", "adet": 1},\n    ],\n}\nsiparis["kalemler"][1]["adet"] += 4\nprint(len(siparis["kalemler"]), siparis["kalemler"][1]["adet"])\n',
      o: ['2 5', '2 1', '3 5', '2 4'],
      a: 0,
      why: 'Kalem listesinde iki eleman var; [1] ikinci kalemdir (Şeker) ve adedi 1 + 4 = 5 olur. Yerinde güncelleme listenin uzunluğunu değiştirmez.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Sığ kopyaya dikkat: bu kod ne yazdırır?',
      code: 'stok = {"Çay": [10, 20], "Kahve": [5]}\nyedek = stok.copy()\nyedek["Çay"].append(30)\nyedek["Kahve"] = [0]\nprint(stok)\n',
      o: ['{\'Çay\': [10, 20], \'Kahve\': [5]}', '{\'Çay\': [10, 20, 30], \'Kahve\': [5]}', '{\'Çay\': [10, 20, 30], \'Kahve\': [0]}', '{\'Çay\': [10, 20], \'Kahve\': [0]}'],
      a: 1,
      why: 'copy() sığ kopyadır: "Çay" listesi iki sözlükte aynı nesnedir, append orijinale de yansır. "Kahve" ise yedekte yeni bir listeyle değiştirildi; bu yalnız yedek sözlüğün anahtarını etkiler, orijinal [5] kalır.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Bu gruplama kodu ne yazdırır?',
      code: 'siparisler = [("AM-1", "İzmir"), ("AM-2", "Bursa"), ("AM-3", "İzmir")]\ngruplar = {}\nfor no, sehir in siparisler:\n    gruplar.setdefault(sehir, []).append(no)\nprint(gruplar)\n',
      o: ['{\'İzmir\': [\'AM-3\'], \'Bursa\': [\'AM-2\']}', '{\'İzmir\': 2, \'Bursa\': 1}', '{\'İzmir\': [\'AM-1\', \'AM-3\'], \'Bursa\': [\'AM-2\']}', '{\'Bursa\': [\'AM-2\'], \'İzmir\': [\'AM-1\', \'AM-3\']}'],
      a: 2,
      why: 'setdefault anahtar yoksa boş liste koyar, varsa mevcut listeyi döndürür; append ile numaralar birikir. Sözlük ekleme sırasını korur: İzmir önce geldiği için önce yazılır. Sayım değil, listenin kendisi tutulur.' },
    { t: 'order',
      stage: 'Kodu oku',
      q: '<p>Siparişleri düzleştirip her kalemi <code>(no, urun, tutar)</code> demeti olarak <code>satirlar</code> listesine ekleyen programın satırlarını sırala.</p>',
      lines: ['siparisler = [{"no": "AM-1", "kalemler": [{"urun": "Çay", "adet": 2, "fiyat": 50}]}]', 'satirlar = []', 'for s in siparisler:', '    for k in s["kalemler"]:', '        tutar = k["adet"] * k["fiyat"]', '        satirlar.append((s["no"], k["urun"], tutar))', 'print(satirlar)'],
      expect: '[(\'AM-1\', \'Çay\', 100)]\n',
      hint: 'Dış döngü siparişleri, iç döngü o siparişin kalemlerini gezer; liste döngüden önce oluşturulur.',
      why: 'Boş liste en başta kurulur; dış döngüdeki s, iç döngüde de görünür olduğundan sipariş numarası her kalem satırına taşınır.' },
    { id: 'ic-ice-veri-1',
      t: 'code',
      stage: 'Rehberli',
      diff: 1,
      q: '<p><code>musteri_sehri(musteri)</code> fonksiyonunu yaz. Müşteri sözlüğünde <code>"adres"</code> alanı, onun içinde <code>"sehir"</code> alanı olabilir ya da olmayabilir. Şehir bulunursa onu, bulunmazsa <code>"Bilinmiyor"</code> döndür. Hiçbir durumda hata vermemeli.</p>',
      guide: ['Önce müşteriden "adres" alanını get ile al; yoksa boş sözlük gelsin.', 'Gelen sözlükten "sehir" alanını yine get ile al; varsayılan "Bilinmiyor" olsun.', 'İki adımı tek satırda zincirleyebilirsin.', 'Sonucu return et.'],
      example: 'urun = {"ad": "Çay", "detay": {"marka": "Rize"}}\nmarka = urun.get("detay", {}).get("marka", "markasız")\nmense = urun.get("detay", {}).get("mense", "bilinmiyor")\nprint(marka, mense)\n',
      start: 'def musteri_sehri(musteri):\n    # TODO: adres alanını güvenle al (yoksa boş sözlük)\n    # TODO: adresten sehir alanını güvenle al (yoksa "Bilinmiyor")\n    pass\n',
      sol: 'def musteri_sehri(musteri):\n    adres = musteri.get("adres", {})\n    return adres.get("sehir", "Bilinmiyor")\n',
      tests: 'assert musteri_sehri({"ad": "Ayşe", "adres": {"sehir": "İzmir"}}) == "İzmir", "adres ve şehir varsa şehri döndürmeli"\nassert musteri_sehri({"ad": "Mehmet"}) == "Bilinmiyor", "adres alanı hiç yoksa \'Bilinmiyor\' dönmeli, KeyError değil"\nassert musteri_sehri({"ad": "Zeynep", "adres": {"ilce": "Konak"}}) == "Bilinmiyor", "adres var ama şehir yoksa yine \'Bilinmiyor\'"\n',
      hints: ['Sözlüklerde get(anahtar, varsayilan) eksik anahtarda hata vermez.', 'İlk get\'in varsayılanı {} olmalı ki ikinci get çalışabilsin.', 'return musteri.get("adres", {}).get("sehir", ...)'],
      why: 'Ara katmanda boş sözlük varsayılanı, zincirin sonraki halkasının her zaman bir sözlük üzerinde çalışmasını garanti eder.' },
    { id: 'ic-ice-veri-2',
      t: 'code',
      stage: 'Rehberli',
      diff: 2,
      q: '<p><code>sehre_gore_grupla(siparisler)</code> fonksiyonunu yaz. Her sipariş <code>{"no": ..., "sehir": ..., "tutar": ...}</code> sözlüğüdür. Fonksiyon, her şehir için o şehirdeki sipariş <b>numaralarının listesini</b> tutan bir sözlük döndürsün. Numaralar geliş sırasını korusun. Örnek: <code>{"İzmir": ["AM-1", "AM-3"], "Ankara": ["AM-2"]}</code>.</p>',
      guide: ['Boş bir sonuç sözlüğü oluştur.', 'Siparişleri tek tek gez.', 'Şehir sözlükte yoksa ona boş bir liste aç (setdefault ya da if ile).', 'O şehrin listesine siparişin numarasını ekle.', 'Sözlüğü döndür.'],
      example: 'calisanlar = [("Ali", "Satış"), ("Ece", "İK"), ("Can", "Satış")]\nbolumler = {}\nfor ad, bolum in calisanlar:\n    bolumler.setdefault(bolum, []).append(ad)\nprint(bolumler)\n',
      start: 'def sehre_gore_grupla(siparisler):\n    gruplar = {}\n    for s in siparisler:\n        # TODO: şehir için liste yoksa oluştur ve numarayı ekle\n        pass\n    return gruplar\n',
      sol: 'def sehre_gore_grupla(siparisler):\n    gruplar = {}\n    for s in siparisler:\n        gruplar.setdefault(s["sehir"], []).append(s["no"])\n    return gruplar\n',
      tests: 'veri = [\n    {"no": "AM-1", "sehir": "İzmir", "tutar": 100},\n    {"no": "AM-2", "sehir": "Ankara", "tutar": 50},\n    {"no": "AM-3", "sehir": "İzmir", "tutar": 75},\n]\nsonuc = sehre_gore_grupla(veri)\nassert sonuc == {"İzmir": ["AM-1", "AM-3"], "Ankara": ["AM-2"]}, f"beklenen İzmir: [AM-1, AM-3], Ankara: [AM-2]; gelen {sonuc}"\nassert sehre_gore_grupla([]) == {}, "boş sipariş listesi için boş sözlük dönmeli"\nassert list(sonuc) == ["İzmir", "Ankara"], "şehirler ilk görülme sırasıyla gelmeli"\n',
      hints: ['Bu bir gruplama kalıbı: sözlük içinde liste biriktirirsin.', 'gruplar.setdefault(anahtar, []) listeyi döndürür; üzerine append yapabilirsin.', 'gruplar.setdefault(s["sehir"], []).append(s["no"])'],
      why: 'setdefault, "liste yoksa oluştur" ile "listeyi getir" adımlarını birleştirir; append ile o şehrin listesi büyür. gruplar[sehir] = [no] yazmak her seferinde listeyi sıfırlardı.' },
    { id: 'ic-ice-veri-3',
      t: 'code',
      stage: 'Rehberli',
      diff: 2,
      q: '<p><code>kalemleri_duzlestir(siparisler)</code> fonksiyonunu yaz. Her siparişte <code>"no"</code> ve bir <code>"kalemler"</code> listesi var; her kalem <code>{"urun", "adet", "fiyat"}</code> taşır. Fonksiyon her kalem için bir <code>(siparis_no, urun, tutar)</code> demeti üretip hepsini tek bir listede döndürsün. Tutar = adet × fiyat.</p>',
      guide: ['Boş bir satirlar listesi aç.', 'Dış döngüyle siparişleri gez.', 'İç döngüyle o siparişin "kalemler" listesini gez.', 'Her kalemde tutarı hesapla ve (no, urun, tutar) demetini listeye ekle.', 'Listeyi döndür.'],
      example: 'subeler = [{"sehir": "İzmir", "calisanlar": ["Ali", "Ece"]}, {"sehir": "Bursa", "calisanlar": ["Can"]}]\nduz = []\nfor sb in subeler:\n    for ad in sb["calisanlar"]:\n        duz.append((sb["sehir"], ad))\nprint(duz)\n',
      start: 'def kalemleri_duzlestir(siparisler):\n    satirlar = []\n    for s in siparisler:\n        # TODO: s["kalemler"] içinde gez, her kalem için demet ekle\n        pass\n    return satirlar\n',
      sol: 'def kalemleri_duzlestir(siparisler):\n    satirlar = []\n    for s in siparisler:\n        for k in s["kalemler"]:\n            satirlar.append((s["no"], k["urun"], k["adet"] * k["fiyat"]))\n    return satirlar\n',
      tests: 'veri = [\n    {"no": "AM-1", "kalemler": [{"urun": "Çay", "adet": 2, "fiyat": 50}, {"urun": "Bardak", "adet": 6, "fiyat": 10}]},\n    {"no": "AM-2", "kalemler": [{"urun": "Kahve", "adet": 1, "fiyat": 300}]},\n    {"no": "AM-3", "kalemler": []},\n]\nsonuc = kalemleri_duzlestir(veri)\nassert len(sonuc) == 3, f"üç kalem satırı bekleniyordu (kalemsiz sipariş satır üretmez), gelen {len(sonuc)}"\nassert sonuc[0] == ("AM-1", "Çay", 100), "ilk satır (\'AM-1\', \'Çay\', 100) olmalı: tutar adet × fiyat"\nassert sonuc[2] == ("AM-2", "Kahve", 300), "sipariş numarası her kalem satırına taşınmalı"\n',
      hints: ['İç içe döngü kur: dışta siparişler, içte kalemler.', 'İç döngüde dış döngünün s değişkenine hâlâ erişebilirsin.', 'satirlar.append((s["no"], k["urun"], k["adet"] * k["fiyat"]))'],
      why: 'Düzleştirmede dış kaydın alanları (sipariş no) iç döngüde her satıra kopyalanır; kalemsiz sipariş hiç satır üretmez.' },
    { id: 'ic-ice-veri-4',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 1,
      q: '<p><code>siparis_toplami(siparis)</code> fonksiyonunu yaz: siparişin <code>"kalemler"</code> listesindeki her kalem için <code>adet * fiyat</code> değerlerini toplayıp 2 ondalığa yuvarlanmış toplamı döndürsün. Siparişte <code>"kalemler"</code> alanı hiç yoksa 0 döndürsün.</p>',
      start: 'def siparis_toplami(siparis):\n    pass\n',
      sol: 'def siparis_toplami(siparis):\n    toplam = 0\n    for k in siparis.get("kalemler", []):\n        toplam += k["adet"] * k["fiyat"]\n    return round(toplam, 2)\n',
      tests: 'assert siparis_toplami({"no": "AM-1", "kalemler": [{"urun": "Çay", "adet": 2, "fiyat": 49.95}, {"urun": "Kahve", "adet": 1, "fiyat": 350}]}) == 449.9, "2×49.95 + 1×350 = 449.9 olmalı"\nassert siparis_toplami({"no": "AM-2", "kalemler": []}) == 0, "boş kalem listesi 0 vermeli"\nassert siparis_toplami({"no": "AM-3"}) == 0, "kalemler alanı yoksa 0 dönmeli; get ile boş liste varsayılanı kullan"\n',
      hints: ['siparis.get("kalemler", []) eksik alanda boş liste verir.', 'Biriktirici: toplam += k["adet"] * k["fiyat"]'],
      why: 'get ile boş liste varsayılanı, eksik alanı "kalemsiz sipariş" gibi ele alır; döngü hiç çalışmaz ve 0 döner.' },
    { id: 'ic-ice-veri-5',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p><code>derin_al(veri, yol, varsayilan=None)</code> fonksiyonunu yaz. <code>yol</code>, anahtar ve indekslerden oluşan bir listedir (ör. <code>["musteri", "adres", "sehir"]</code> ya da <code>["kalemler", 0, "urun"]</code>). Fonksiyon yolu adım adım izlesin; herhangi bir adım bulunamazsa (eksik anahtar, aralık dışı indeks, sözlük/liste olmayan bir değerin içine inme) <code>varsayilan</code> döndürsün.</p>',
      start: 'def derin_al(veri, yol, varsayilan=None):\n    pass\n',
      sol: 'def derin_al(veri, yol, varsayilan=None):\n    for adim in yol:\n        try:\n            veri = veri[adim]\n        except (KeyError, IndexError, TypeError):\n            return varsayilan\n    return veri\n',
      tests: 's = {"musteri": {"adres": {"sehir": "İzmir"}}, "kalemler": [{"urun": "Çay"}, {"urun": "Kahve"}]}\nassert derin_al(s, ["musteri", "adres", "sehir"]) == "İzmir", "sözlük yolu izlenmeli"\nassert derin_al(s, ["kalemler", 1, "urun"]) == "Kahve", "liste indeksi de yol adımı olabilir"\nassert derin_al(s, ["kalemler", 9, "urun"], "yok") == "yok", "aralık dışı indeks varsayılanı döndürmeli"\nassert derin_al(s, ["musteri", "telefon"]) is None, "eksik anahtar varsayılan None döndürmeli"\nassert derin_al(s, ["musteri", "adres", "sehir", "posta"], "yok") == "yok", "metnin içine anahtarla inilemez; varsayılan dönmeli"\nassert derin_al(s, []) is s, "boş yol verinin kendisini döndürmeli"\n',
      hints: ['Her adımda veri = veri[adim] ile bir katman aşağı in.', 'Eksik anahtar KeyError, aralık dışı indeks IndexError, metne anahtarla erişim TypeError verir; üçünü birden yakala.'],
      why: 'Tek bir döngü hem sözlük anahtarını hem liste indeksini aynı köşeli parantezle işler; olası üç hatayı yakalamak fonksiyonu kirli veriye dayanıklı yapar.' },
    { id: 'ic-ice-veri-6',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p>Anadolu Market stok sözlüğü ürün koduna göre iç içe tutuluyor: <code>{"U-1": {"ad": "Çay", "stok": 10}, ...}</code>. <code>stok_dus(stok, siparis)</code> fonksiyonunu yaz: siparişin <code>"kalemler"</code> listesindeki her <code>{"kod", "adet"}</code> için ilgili ürünün stoğunu <b>yerinde</b> düşsün. Stokta olmayan bir kod gelirse o kalemi atlasın. Fonksiyon, stoğu 5\'in altına düşen ürünlerin <b>adlarını</b> (kalem sırasıyla) liste olarak döndürsün.</p>',
      start: 'def stok_dus(stok, siparis):\n    pass\n',
      sol: 'def stok_dus(stok, siparis):\n    azalan = []\n    for k in siparis["kalemler"]:\n        urun = stok.get(k["kod"])\n        if urun is None:\n            continue\n        urun["stok"] -= k["adet"]\n        if urun["stok"] < 5:\n            azalan.append(urun["ad"])\n    return azalan\n',
      tests: 'stok = {"U-1": {"ad": "Çay", "stok": 10}, "U-2": {"ad": "Kahve", "stok": 4}, "U-3": {"ad": "Şeker", "stok": 20}}\nsonuc = stok_dus(stok, {"no": "AM-9", "kalemler": [{"kod": "U-1", "adet": 7}, {"kod": "U-9", "adet": 1}, {"kod": "U-3", "adet": 2}]})\nassert stok["U-1"]["stok"] == 3, "Çay stoğu 10-7=3 olmalı; iç sözlüğü yerinde güncelle"\nassert stok["U-3"]["stok"] == 18, "Şeker stoğu 20-2=18 olmalı"\nassert stok["U-2"]["stok"] == 4, "siparişte olmayan ürün değişmemeli"\nassert sonuc == ["Çay"], f"yalnız Çay 5\'in altına düştü; gelen {sonuc}"\nassert stok_dus(stok, {"kalemler": []}) == [], "boş siparişte boş liste dönmeli"\n',
      hints: ['stok.get(kod) ürün yoksa None döndürür; None ise continue ile atla.', 'urun = stok[kod] iç sözlüğün kendisidir; urun["stok"] -= adet orijinali değiştirir.'],
      why: 'Sözlükten aldığın iç sözlük kopya değil aynı nesnedir; onun üzerindeki değişiklik dış yapıya yansır. Bu sefer istenen davranış tam olarak bu.' },
    { id: 'ic-ice-veri-7',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p><code>tablo_yazdir(satirlar)</code> fonksiyonunu yaz. <code>satirlar</code>, <code>{"no", "urun", "tutar"}</code> sözlüklerinin listesidir. Fonksiyon şu biçimde yazdırsın: başlık satırı, 28 tireli çizgi, her satır, yine çizgi ve toplam. Sipariş sütunu 8, ürün sütunu 10 karakter sola yaslı; tutar 8 karakter sağa yaslı ve 2 ondalık; sütunlar arasında birer boşluk. Toplam satırında <code>TOPLAM</code> 19 karakter sola yaslı, ardından boşluk ve 8 karakter sağa yaslı toplam.</p><pre class="out">Sipariş  Ürün          Tutar\n----------------------------\nAM-101   Çay          240.00\nAM-101   Bardak       150.00\nAM-102   Kahve        350.00\n----------------------------\nTOPLAM                740.00</pre><p>Program sonunda fonksiyonu verilen örnek veriyle çağır.</p>',
      start: 'def tablo_yazdir(satirlar):\n    pass\n\nveri = [\n    {"no": "AM-101", "urun": "Çay", "tutar": 240.0},\n    {"no": "AM-101", "urun": "Bardak", "tutar": 150.0},\n    {"no": "AM-102", "urun": "Kahve", "tutar": 350.0},\n]\ntablo_yazdir(veri)\n',
      sol: 'def tablo_yazdir(satirlar):\n    print(f"{\'Sipariş\':<8} {\'Ürün\':<10} {\'Tutar\':>8}")\n    print("-" * 28)\n    toplam = 0\n    for r in satirlar:\n        print(f"{r[\'no\']:<8} {r[\'urun\']:<10} {r[\'tutar\']:>8.2f}")\n        toplam += r["tutar"]\n    print("-" * 28)\n    print(f"{\'TOPLAM\':<19} {toplam:>8.2f}")\n\nveri = [\n    {"no": "AM-101", "urun": "Çay", "tutar": 240.0},\n    {"no": "AM-101", "urun": "Bardak", "tutar": 150.0},\n    {"no": "AM-102", "urun": "Kahve", "tutar": 350.0},\n]\ntablo_yazdir(veri)\n',
      expect: 'Sipariş  Ürün          Tutar\n----------------------------\nAM-101   Çay          240.00\nAM-101   Bardak       150.00\nAM-102   Kahve        350.00\n----------------------------\nTOPLAM                740.00\n',
      hints: ['f"{deger:<8}" sola, f"{deger:>8.2f}" sağa yaslar ve 2 ondalık verir.', 'f-string içinde anahtar yazarken tek tırnak kullan: f"{r[\'no\']:<8}"'],
      why: 'Genişlik ve hizalama belirteçleri, sütunları değer uzunluğundan bağımsız hizalar; metin sola, sayı sağa yaslanır.' },
    { id: 'ic-ice-veri-8',
      t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      diff: 2,
      q: '<p>Hatayı bul ve düzelt. <code>kampanyali_katalog(katalog, oran)</code> kataloğun bir kopyasında tüm fiyatları verilen oranda indirip kopyayı döndürmeli; <b>orijinal katalog asla değişmemeli</b>. Fonksiyon kopya alıyor gibi görünüyor ama canlı fiyatlar da düşüyor.</p>',
      start: 'def kampanyali_katalog(katalog, oran):\n    yeni = katalog.copy()\n    for kod, urun in yeni.items():\n        urun["fiyat"] = round(urun["fiyat"] * (1 - oran), 2)\n    return yeni\n',
      sol: 'import copy\n\ndef kampanyali_katalog(katalog, oran):\n    yeni = copy.deepcopy(katalog)\n    for kod, urun in yeni.items():\n        urun["fiyat"] = round(urun["fiyat"] * (1 - oran), 2)\n    return yeni\n',
      tests: 'katalog = {"U-1": {"ad": "Çay", "fiyat": 100.0}, "U-2": {"ad": "Kahve", "fiyat": 300.0}}\nkampanya = kampanyali_katalog(katalog, 0.2)\nassert kampanya["U-1"]["fiyat"] == 80.0, "kampanyalı Çay 80.0 olmalı"\nassert kampanya["U-2"]["fiyat"] == 240.0, "kampanyalı Kahve 240.0 olmalı"\nassert katalog["U-1"]["fiyat"] == 100.0, "orijinal Çay fiyatı 100.0 kalmalı: copy() iç sözlükleri paylaşır, deepcopy gerekir"\nassert kampanya["U-1"] is not katalog["U-1"], "iç sözlükler de bağımsız olmalı"\n',
      hints: ['copy() yalnızca dış sözlüğü kopyalar; ürün sözlükleri iki katalogda ortaktır.', 'import copy ve copy.deepcopy(katalog) kullan.'],
      why: 'Sığ kopyada iç sözlükler paylaşılır; urun["fiyat"] ataması orijinal ürün sözlüğünü değiştirir. deepcopy her katmanı yeniden oluşturur.' },
    { id: 'ic-ice-veri-9',
      t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      diff: 2,
      q: '<p>Hatayı bul ve düzelt. <code>musteri_siparisleri(siparisler)</code> her müşteri için sipariş tutarlarının listesini döndürmeli: <code>{"Ayşe": [100, 40], "Mehmet": [75]}</code>. Ama her müşteride yalnızca <b>son</b> tutar kalıyor.</p>',
      start: 'def musteri_siparisleri(siparisler):\n    sonuc = {}\n    for s in siparisler:\n        sonuc[s["musteri"]] = [s["tutar"]]\n    return sonuc\n',
      sol: 'def musteri_siparisleri(siparisler):\n    sonuc = {}\n    for s in siparisler:\n        sonuc.setdefault(s["musteri"], []).append(s["tutar"])\n    return sonuc\n',
      tests: 'veri = [{"musteri": "Ayşe", "tutar": 100}, {"musteri": "Mehmet", "tutar": 75}, {"musteri": "Ayşe", "tutar": 40}]\nsonuc = musteri_siparisleri(veri)\nassert sonuc["Ayşe"] == [100, 40], f"Ayşe\'nin iki siparişi birikmeli; gelen {sonuc[\'Ayşe\']}"\nassert sonuc["Mehmet"] == [75], "Mehmet\'in tek siparişi olmalı"\n',
      hints: ['sonuc[anahtar] = [deger] her seferinde yeni liste kurup eskisini siler.', 'Liste varsa ona ekle, yoksa oluştur: setdefault(..., []).append(...)'],
      why: 'Atama listeyi her turda sıfırlar; gruplamada mevcut listeye append yapmak gerekir.' },
    { id: 'ic-ice-veri-10',
      t: 'code',
      stage: 'Meydan okuma',
      diff: 3,
      q: '<p><code>sehir_ciro_raporu(musteriler)</code> fonksiyonunu yaz. Her müşteri şu biçimdedir ama alanlar eksik ya da None olabilir:</p><pre class="out">{"ad": "Ayşe", "adres": {"sehir": "İzmir"},\n "siparisler": [{"durum": "teslim", "kalemler": [{"adet": 2, "fiyat": 50.0}]}]}</pre><p>Kurallar: şehir yoksa (adres eksik, adres None ya da şehir eksik) <code>"Bilinmiyor"</code> kullan; <code>"durum"</code> değeri <code>"iptal"</code> olan siparişleri sayma; siparişler ya da kalemler eksikse boş say. Sonuç, şehir → toplam ciro (2 ondalık) sözlüğü olsun ve <b>ciroya göre büyükten küçüğe</b> sıralı olsun. Cirosu 0 olan şehirler de rapora girsin.</p>',
      start: 'def sehir_ciro_raporu(musteriler):\n    pass\n',
      sol: 'def sehir_ciro_raporu(musteriler):\n    ciro = {}\n    for m in musteriler:\n        sehir = (m.get("adres") or {}).get("sehir") or "Bilinmiyor"\n        toplam = 0\n        for s in m.get("siparisler") or []:\n            if s.get("durum") == "iptal":\n                continue\n            for k in s.get("kalemler") or []:\n                toplam += k["adet"] * k["fiyat"]\n        ciro[sehir] = ciro.get(sehir, 0) + toplam\n    sirali = sorted(ciro.items(), key=lambda x: x[1], reverse=True)\n    return {s: round(t, 2) for s, t in sirali}\n',
      tests: 'veri = [\n    {"ad": "Ayşe", "adres": {"sehir": "İzmir"}, "siparisler": [\n        {"durum": "teslim", "kalemler": [{"adet": 2, "fiyat": 50.0}]},\n        {"durum": "iptal", "kalemler": [{"adet": 1, "fiyat": 999.0}]}]},\n    {"ad": "Mehmet", "adres": {"sehir": "Ankara"}, "siparisler": [\n        {"kalemler": [{"adet": 1, "fiyat": 300.0}, {"adet": 3, "fiyat": 10.1}]}]},\n    {"ad": "Zeynep", "adres": None, "siparisler": [{"durum": "teslim", "kalemler": [{"adet": 1, "fiyat": 40.0}]}]},\n    {"ad": "Can", "adres": {"sehir": "İzmir"}},\n    {"ad": "Ece", "adres": {"ilce": "Nilüfer"}, "siparisler": None},\n    {"ad": "Deniz", "adres": {"sehir": "Bursa"}, "siparisler": [{"durum": "iptal", "kalemler": [{"adet": 5, "fiyat": 10.0}]}]},\n]\nr = sehir_ciro_raporu(veri)\nassert r.get("İzmir") == 100.0, f"İzmir 100.0 olmalı (iptal sayılmaz, siparişsiz müşteri 0 ekler); gelen {r.get(\'İzmir\')}"\nassert r.get("Ankara") == 330.3, f"Ankara 300 + 3×10.1 = 330.3 olmalı; gelen {r.get(\'Ankara\')}"\nassert r.get("Bilinmiyor") == 40.0, "adres None ya da şehir eksikse \'Bilinmiyor\' altında toplanmalı"\nassert r.get("Bursa") == 0, "yalnız iptal siparişi olan şehir 0 ile rapora girmeli"\nassert list(r) == ["Ankara", "İzmir", "Bilinmiyor", "Bursa"], f"ciroya göre azalan sıralı olmalı; gelen {list(r)}"\nassert sehir_ciro_raporu([]) == {}, "boş girdi boş sözlük vermeli"\n',
      hints: ['None olabilen ara katman için (m.get("adres") or {}) kalıbı; siparişler için (m.get("siparisler") or []).', 'Önce şehir → toplam sözlüğünü kur, sonra sorted(ciro.items(), key=lambda x: x[1], reverse=True) ile sırala ve yeni sözlüğe aktar.', 'Sözlükler ekleme sırasını korur; sıralı demetlerden kurulan sözlük de sıralı kalır.'],
      why: 'or kalıbı hem eksik anahtarı hem None değeri aynı yoldan karşılar; iptal filtresi iç döngüden önce continue ile uygulanır; sıralama için sözlük, değere göre sıralanmış demetlerden yeniden kurulur.' },
    { id: 'ic-ice-veri-11',
      t: 'code',
      stage: 'Mini proje',
      diff: 3,
      q: '<p>Anadolu Market verisi normalize tutuluyor: <code>musteriler</code> (müşteri no → bilgi), <code>urunler</code> (ürün kodu → bilgi) ve <code>siparisler</code> (yalnız kodları taşıyan liste). İki fonksiyon yaz:</p><ul><li><code>zenginlestir(siparisler, musteriler, urunler)</code>: her sipariş kalemi için <code>{"no", "musteri", "sehir", "urun", "kategori", "tutar"}</code> sözlüğü üreten düz bir liste döndürsün. Tutar = adet × ürün fiyatı. Bilinmeyen müşteri için müşteri ve şehir <code>"?"</code> olsun; bilinmeyen ürün kodlu kalemleri atla.</li><li><code>kategori_ozeti(satirlar)</code>: zenginleştirilmiş satırlardan kategori → toplam tutar (2 ondalık) sözlüğü döndürsün.</li></ul>',
      start: 'musteriler = {"M-1": {"ad": "Ayşe", "sehir": "İzmir"}, "M-2": {"ad": "Mehmet", "sehir": "Ankara"}}\nurunler = {\n    "U-1": {"ad": "Çay", "kategori": "İçecek", "fiyat": 120.0},\n    "U-2": {"ad": "Bardak", "kategori": "Mutfak", "fiyat": 25.0},\n    "U-3": {"ad": "Kahve", "kategori": "İçecek", "fiyat": 350.0},\n}\nsiparisler = [\n    {"no": "AM-1", "musteri_no": "M-1", "kalemler": [{"kod": "U-1", "adet": 2}, {"kod": "U-2", "adet": 6}]},\n    {"no": "AM-2", "musteri_no": "M-2", "kalemler": [{"kod": "U-3", "adet": 1}, {"kod": "U-404", "adet": 1}]},\n    {"no": "AM-3", "musteri_no": "M-9", "kalemler": [{"kod": "U-1", "adet": 1}]},\n]\n\ndef zenginlestir(siparisler, musteriler, urunler):\n    # TODO\n    pass\n\ndef kategori_ozeti(satirlar):\n    # TODO\n    pass\n',
      sol: 'musteriler = {"M-1": {"ad": "Ayşe", "sehir": "İzmir"}, "M-2": {"ad": "Mehmet", "sehir": "Ankara"}}\nurunler = {\n    "U-1": {"ad": "Çay", "kategori": "İçecek", "fiyat": 120.0},\n    "U-2": {"ad": "Bardak", "kategori": "Mutfak", "fiyat": 25.0},\n    "U-3": {"ad": "Kahve", "kategori": "İçecek", "fiyat": 350.0},\n}\nsiparisler = [\n    {"no": "AM-1", "musteri_no": "M-1", "kalemler": [{"kod": "U-1", "adet": 2}, {"kod": "U-2", "adet": 6}]},\n    {"no": "AM-2", "musteri_no": "M-2", "kalemler": [{"kod": "U-3", "adet": 1}, {"kod": "U-404", "adet": 1}]},\n    {"no": "AM-3", "musteri_no": "M-9", "kalemler": [{"kod": "U-1", "adet": 1}]},\n]\n\ndef zenginlestir(siparisler, musteriler, urunler):\n    satirlar = []\n    for s in siparisler:\n        m = musteriler.get(s["musteri_no"], {})\n        for k in s["kalemler"]:\n            u = urunler.get(k["kod"])\n            if u is None:\n                continue\n            satirlar.append({\n                "no": s["no"],\n                "musteri": m.get("ad", "?"),\n                "sehir": m.get("sehir", "?"),\n                "urun": u["ad"],\n                "kategori": u["kategori"],\n                "tutar": k["adet"] * u["fiyat"],\n            })\n    return satirlar\n\ndef kategori_ozeti(satirlar):\n    ozet = {}\n    for r in satirlar:\n        ozet[r["kategori"]] = ozet.get(r["kategori"], 0) + r["tutar"]\n    return {k: round(v, 2) for k, v in ozet.items()}\n',
      tests: 'satirlar = zenginlestir(siparisler, musteriler, urunler)\nassert isinstance(satirlar, list) and len(satirlar) == 4, f"4 satır bekleniyordu (U-404 atlanır); gelen {satirlar if satirlar is None else len(satirlar)}"\nassert satirlar[0] == {"no": "AM-1", "musteri": "Ayşe", "sehir": "İzmir", "urun": "Çay", "kategori": "İçecek", "tutar": 240.0}, f"ilk satır hatalı: {satirlar[0]}"\nassert satirlar[3]["musteri"] == "?" and satirlar[3]["sehir"] == "?", "bilinmeyen müşteri (M-9) için \'?\' kullanılmalı"\nassert all(r["urun"] != "U-404" for r in satirlar), "bilinmeyen ürün kodu atlanmalı"\nozet = kategori_ozeti(satirlar)\nassert ozet == {"İçecek": 710.0, "Mutfak": 150.0}, f"İçecek 240+350+120=710, Mutfak 150 olmalı; gelen {ozet}"\nassert kategori_ozeti([]) == {}, "boş satır listesi boş özet vermeli"\n',
      hints: ['Normalize veride kodla sözlükten bulursun: musteriler.get(s["musteri_no"], {}).', 'Ürün None ise continue; değilse tüm alanları tek sözlükte topla.', 'Özet için sayım kalıbının toplama versiyonu: ozet[k] = ozet.get(k, 0) + tutar.'],
      why: 'Bu, SQL\'deki JOIN + GROUP BY\'ın Python karşılığıdır: kodları sözlükten çözüp düz satırlar üretir, sonra bir alana göre toplarsın.' }
  ],
  faq: [
    { q: 'Ne zaman liste içinde sözlük, ne zaman sözlük içinde sözlük kullanmalıyım?',
      a: 'Kayıtları sırayla gezeceksen ve sıra önemliyse liste içinde sözlük (kayıt listesi) kullan. Kayıtlara bir kimlikle (müşteri no, ürün kodu) hızlıca erişeceksen sözlük içinde sözlük kullan: <code>urunler["U-1"]</code> listede arama yapmadan anında bulur.' },
    { q: 'get zinciri mi, try/except mi?',
      a: 'Bir iki katmanlı ve eksikliğin normal olduğu durumlarda get zinciri okunur ve kısadır. Çok derin yollarda ya da liste indeksleri de işin içindeyse derin_al gibi try/except kullanan küçük bir yardımcı fonksiyon daha temizdir.' },
    { q: 'deepcopy her zaman kullanılsa daha güvenli olmaz mı?',
      a: 'Güvenlidir ama yavaştır ve bellek harcar; büyük yapılarda her şeyi kopyalar. Yapın düzse (elemanlar sayı ya da metin) copy() yeter. İç katmanları değiştireceksen deepcopy kullan.' },
    { q: 'İç içe yapıyı ekranda düzgün görmenin en hızlı yolu ne?',
      a: '<code>from pprint import pprint</code> ile <code>pprint(veri)</code> ya da <code>print(json.dumps(veri, indent=2, ensure_ascii=False))</code>. İkincisi Türkçe karakterleri de bozmadan gösterir.' }
  ],
  mistakes: [
    { why: 'Adres yoksa ilk get None döndürür ve None.get AttributeError verir; ara adıma boş sözlük varsayılanı ver.',
      bad: 'sehir = m.get("adres").get("sehir")',
      good: 'sehir = m.get("adres", {}).get("sehir", "Bilinmiyor")' },
    { why: 'Atama listeyi her turda sıfırlar; gruplamada mevcut listeye ekleme yapılır.',
      bad: 'for s in siparisler:\n    gruplar[s["sehir"]] = [s["no"]]',
      good: 'for s in siparisler:\n    gruplar.setdefault(s["sehir"], []).append(s["no"])' },
    { why: 'copy() sığdır; iç sözlükler paylaşılır ve orijinal fiyat da değişir.',
      bad: 'yedek = katalog.copy()\nyedek["U-1"]["fiyat"] = 0',
      good: 'import copy\nyedek = copy.deepcopy(katalog)\nyedek["U-1"]["fiyat"] = 0' },
    { why: 'Listeyi çarpmak aynı iç listeyi üç kez koyar; bir hücreyi değiştirmek tüm satırları değiştirir.',
      bad: 'tablo = [[0] * 3] * 3\ntablo[0][0] = 1',
      good: 'tablo = [[0] * 3 for _ in range(3)]\ntablo[0][0] = 1' },
    { why: 'kalemler bir listedir; önce indeksle bir kalem seçmeden anahtar kullanılamaz (TypeError).',
      bad: 'print(siparis["kalemler"]["urun"])',
      good: 'print(siparis["kalemler"][0]["urun"])' }
  ] }
);
})(window);
/* PythonPatika v2 — match-case */
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push(
{ id: 'match-case',
  lv: 'temel',
  mod: 'Akış Kontrolü',
  min: 35,
  title: 'match-case: yapısal desen eşleme',
  sum: 'Python 3.10 ile gelen match-case ile değer, birleşik, dizi, sözlük ve sınıf desenlerini; guard ve yakalamayı öğrenir, komut ayrıştırıcı ve banka işlem yönlendirici yazarsın.',
  goals: ['match-case ile değer desenleri, | birleşik desenler ve _ jokeriyle çoklu dallanma yazabilirim.', 'Yakalama (capture) desenini ve "her şeyi yakalayan ad" tuzağını açıklayabilirim.', 'Dizi desenleriyle ([komut, *arg]) metin komutlarını ayrıştırabilirim.', 'Sözlük ve sınıf desenleriyle JSON benzeri mesajları ve dataclass nesnelerini yönlendirebilirim.', 'Bir problemde match mi if/elif mi kullanacağıma gerekçeyle karar verebilirim.'],
  body: `
<h2>Neden yeni bir dallanma aracı?</h2>
<p>Koşullar dersinde <code>match</code>'i kısaca gördün: bir değeri birkaç sabitle karşılaştırmanın düzenli yolu. Ama <code>match</code> aslında bundan çok daha güçlüdür. Adı <b>yapısal desen eşleme</b> (structural pattern matching): yalnızca "değer şuna eşit mi" diye sormaz, "veri <b>şu şekilde</b> mi" diye sorar ve şekle uyuyorsa parçalarını tek hamlede değişkenlere ayırır.</p>
<p>Anadolu Bank'ın işlem kuyruğunu düşün. Kuyruğa gelen her mesaj bir sözlüktür ama türü farklıdır: havalede alıcı IBAN'ı ve tutar vardır, fatura ödemesinde kurum kodu, kart işleminde kart numarası ve taksit sayısı. if/elif ile yazarsan her dalda önce türü kontrol eder, sonra anahtarların var olup olmadığına bakar, sonra değerleri tek tek çekersin. <code>match</code> bunların üçünü tek satırda yapar.</p>

<h2>Temel söz dizimi ve değer desenleri</h2>
<pre class="py">def kargo_durumu(kod):
    match kod:
        case "H":
            return "Hazırlanıyor"
        case "K":
            return "Kargoda"
        case "T":
            return "Teslim edildi"
        case _:
            return "Bilinmeyen kod"

for k in ["H", "T", "X"]:
    print(k, "→", kargo_durumu(k))</pre>
<p><code>match</code>'ten sonraki ifadeye <b>konu</b> (subject) denir. Her <code>case</code> bir <b>desen</b> (pattern) taşır; desenler yukarıdan aşağıya denenir ve <b>ilk eşleşen</b> çalışır, sonrakilere bakılmaz. C ya da Java'daki <code>switch</code>'ten farklı olarak "düşme" (fall-through) yoktur, <code>break</code> yazmazsın. <code>_</code> joker (wildcard) desendir: her şeyle eşleşir, bu yüzden en sona konur ve <code>else</code> görevini görür. Hiçbir desen eşleşmezse ve <code>_</code> yoksa <code>match</code> sessizce hiçbir şey yapmaz.</p>
<p>Değer desenleri (literal patterns) sayı, metin, <code>True</code>, <code>False</code> ve <code>None</code> olabilir. Sayılarda <code>==</code> ile, <code>True/False/None</code>'da <code>is</code> ile karşılaştırılır.</p>

<h2>Birleşik desen: |</h2>
<p>Birkaç değer aynı sonuca gidiyorsa onları <code>|</code> ("veya") ile birleştirirsin.</p>
<pre class="py">def gun_tipi(gun):
    match gun.lower():
        case "cumartesi" | "pazar":
            return "Hafta sonu: şube kapalı"
        case "pazartesi" | "salı" | "çarşamba" | "perşembe" | "cuma":
            return "İş günü"
        case _:
            return "Geçersiz gün"

print(gun_tipi("Pazar"))
print(gun_tipi("salı"))
print(gun_tipi("bayram"))</pre>

<h2>Yakalama deseni ve en önemli tuzak</h2>
<p>Desende tırnaksız, noktasız bir <b>ad</b> yazarsan Python onu karşılaştırılacak bir değer olarak değil, <b>yakalanacak bir değişken</b> olarak görür. Yakalama deseni (capture pattern) her şeyle eşleşir ve konuyu o ada bağlar.</p>
<pre class="py">ONAY = "onay"

def durum_eski(durum):
    match durum:
        case "iptal":
            return "İptal"
        case ONAY:                 # DİKKAT: bu bir karşılaştırma DEĞİL
            return "Onaylandı (" + ONAY + ")"

print(durum_eski("onay"))
print(durum_eski("beklemede"))     # yanlışlıkla "Onaylandı" der!</pre>
<p><code>case ONAY:</code> satırı "durum ONAY'a eşit mi" diye sormaz; "ne gelirse gelsin, adı ONAY olsun" der. İkinci çağrıda <code>"beklemede"</code> bu dala girer ve ONAY artık <code>"beklemede"</code>dir. Arkasından başka bir <code>case</code> yazsaydın Python bunu fark edip SyntaxError verirdi; en sonda olduğu için sessizce yanlış çalışır.</p>
<div class="warn"><b>Sabitle karşılaştırmak için nokta gerekir</b>Bir sabitle karşılaştırmak istiyorsan ya değeri doğrudan yaz (<code>case "onay":</code>) ya da <b>noktalı ad</b> kullan: <code>case Durum.ONAY:</code>. Noktalı adlar (sınıf özelliği, enum üyesi, modül sabiti) değer deseni sayılır. Düz ad her zaman yakalamadır.</div>

<h2>Guard: desene ek koşul</h2>
<p>Bazen şekil yetmez, değere bir koşul da koymak istersin. <code>case desen if koşul:</code> yazımına <b>guard</b> (koruma) denir. Desen eşleşir, değişkenler bağlanır, sonra koşul denetlenir; koşul yanlışsa sıradaki <code>case</code>'e geçilir.</p>
<pre class="py">def tutar_sinifi(tutar):
    match tutar:
        case 0:
            return "Boş işlem"
        case t if t &lt; 0:
            return "İade"
        case t if t &gt;= 50_000:
            return "Yüksek tutar: onay gerekir"
        case _:
            return "Normal"

for t in [0, -120, 75_000, 900]:
    print(t, tutar_sinifi(t))</pre>
<p>Guard'lı dallarda sıra önemlidir: daha özel koşulu üste yaz. Genel bir desen (<code>case t:</code>) üstte kalırsa altındaki özel dallar hiç çalışmaz.</p>

<h2>Dizi desenleri: komut ayrıştırıcı</h2>
<p>Konu bir liste ya da demetse eleman sayısına ve elemanlara göre eşleştirebilirsin. <code>[x, y]</code> tam iki elemanlı dizilerle eşleşir ve elemanları <code>x</code> ile <code>y</code>'ye bağlar. <code>*rest</code> "geri kalanların hepsi" demektir (demet açmadaki yıldızlı ad gibi).</p>
<pre class="py">def komut(satir):
    match satir.split():
        case []:
            return "Boş komut"
        case ["yardım"] | ["help"]:
            return "Komutlar: ekle, sil, listele"
        case ["listele"]:
            return "Sepet listeleniyor"
        case ["ekle", urun]:
            return f"{urun} sepete eklendi (1 adet)"
        case ["ekle", urun, adet] if adet.isdigit():
            return f"{urun} sepete eklendi ({adet} adet)"
        case ["sil", *urunler] if urunler:
            return f"Silindi: {', '.join(urunler)}"
        case [bilinmeyen, *_]:
            return f"Bilinmeyen komut: {bilinmeyen}"

for s in ["", "help", "ekle çay", "ekle çay 3", "ekle çay üç", "sil çay kahve", "uç"]:
    print(repr(s), "→", komut(s))</pre>
<p>Bu örnekte birçok kavram birlikte çalışıyor: <code>[]</code> boş listeyle, <code>["yardım"] | ["help"]</code> iki tek elemanlı listeden biriyle eşleşir; <code>urun</code> ve <code>adet</code> yakalanır; guard (<code>adet.isdigit()</code>) "üç" gibi geçersiz adedi dışarıda bırakır ve son dala düşürür. <code>*_</code> geri kalanı yakalamadan yok sayar.</p>
<div class="note"><b>Metin dizi deseniyle eşleşmez</b>Metin teknik olarak bir dizi olsa da <code>match "abc": case [a, b, c]:</code> eşleşmez; Python bu karışıklığı önlemek için str, bytes ve bytearray'i dizi desenlerinden hariç tutar. Metni parçalara ayırmak istiyorsan önce <code>split()</code> ile listeye çevir.</div>

<h2>Sözlük desenleri: banka işlem yönlendirme</h2>
<p>JSON benzeri mesajlar için en kullanışlı desen budur. <code>{"tip": "havale", "tutar": t}</code> deseni, konu bir sözlükse, <code>"tip"</code> anahtarı <code>"havale"</code> ise ve <code>"tutar"</code> anahtarı varsa eşleşir; tutarı <code>t</code>'ye bağlar. Desende yazmadığın <b>fazladan anahtarlar yok sayılır</b>; bu, sürekli alan eklenen gerçek mesajlarla çalışırken çok işe yarar.</p>
<pre class="py">def yonlendir(islem):
    match islem:
        case {"tip": "havale", "tutar": t, "alici": alici} if t &gt; 50_000:
            return f"Uyum ekibine: {alici} için {t} TL havale"
        case {"tip": "havale" | "eft", "tutar": t, "alici": alici}:
            return f"Transfer: {alici} ← {t} TL"
        case {"tip": "fatura", "kurum": kurum, "tutar": t}:
            return f"Fatura ödemesi: {kurum} {t} TL"
        case {"tip": "kart", "taksit": int(n)} if n &gt; 1:
            return f"Taksitli kart işlemi ({n} taksit)"
        case {"tip": "kart"}:
            return "Tek çekim kart işlemi"
        case {"tip": tip}:
            return f"Desteklenmeyen işlem türü: {tip}"
        case _:
            return "Geçersiz mesaj"

islemler = [
    {"tip": "havale", "tutar": 75_000, "alici": "TR12", "kanal": "mobil"},
    {"tip": "eft", "tutar": 1_200, "alici": "TR34"},
    {"tip": "fatura", "kurum": "Su", "tutar": 310},
    {"tip": "kart", "taksit": 6},
    {"tip": "kart", "taksit": 1},
    {"tip": "kripto"},
    ["havale", 100],
]
for i in islemler:
    print(yonlendir(i))</pre>
<p>Desenler iç içe girebilir: <code>"havale" | "eft"</code> bir sözlük deseninin içinde birleşik desendir, <code>int(n)</code> ise "değer int olsun ve n'ye bağlansın" diyen bir sınıf desenidir. Liste olarak gelen son mesaj hiçbir sözlük deseniyle eşleşmez ve joker dala düşer. Geri kalan anahtarları toplamak istersen <code>**diger</code> yazabilirsin: <code>case {"tip": "havale", **diger}:</code>.</p>
<div class="tip"><b>as ile alt deseni adlandır</b><code>case {"tip": ("havale" | "eft") as tur, "tutar": t}:</code> yazarsan hangi alternatifin eşleştiğini <code>tur</code> değişkeninde bulursun. <code>as</code>, bir desenin tamamını bir ada bağlar.</div>

<h2>Sınıf desenleri: dataclass ile</h2>
<p>Konu bir nesneyse türüne ve özelliklerine göre eşleştirebilirsin. <code>int()</code>, <code>str()</code>, <code>float()</code> gibi yerleşik türler zaten sınıf desenidir. Kendi sınıfların için en kolay yol <code>dataclass</code>'tır (orta seviyede ayrıntılı göreceksin; burada yalnızca kısa bir kayıt tanımlamak için kullanıyoruz). dataclass, alanlarını sırayla desene açar; böylece konumsal yazabilirsin.</p>
<pre class="py">from dataclasses import dataclass

@dataclass
class Havale:
    alici: str
    tutar: float

@dataclass
class Fatura:
    kurum: str
    tutar: float

def ozet(islem):
    match islem:
        case Havale(alici, tutar) if tutar &gt; 10_000:
            return f"Büyük havale → {alici}"
        case Havale(alici=a):
            return f"Havale → {a}"
        case Fatura(kurum="Elektrik" | "Doğalgaz", tutar=t):
            return f"Enerji faturası: {t}"
        case Fatura():
            return "Diğer fatura"
        case int() | float() as tutar:
            return f"Ham tutar: {tutar}"
        case _:
            return "Tanınmadı"

for i in [Havale("TR12", 25_000), Havale("TR34", 50), Fatura("Elektrik", 640.5), Fatura("Su", 90), 42, "x"]:
    print(ozet(i))</pre>
<p><code>Havale(alici, tutar)</code> konumsal, <code>Havale(alici=a)</code> anahtar sözcüklü yazımdır. <code>Fatura()</code> boş parantezle "türü Fatura olsun, alanları önemli değil" demektir. Parantezsiz <code>case Fatura:</code> yazmak ise yine yakalama tuzağıdır.</p>

<h2>match mi if/elif mi?</h2>
<div class="tbl-wrap"><table>
<tr><th>Durum</th><th>Tercih</th><th>Neden</th></tr>
<tr><td>Bir değeri birkaç sabitle karşılaştırmak</td><td>İkisi de olur</td><td>3-4 dalda if/elif yeterince açık; daha fazlasında match okunur</td></tr>
<tr><td>Aralık ve eşik (tutar &gt;= 500)</td><td>if/elif</td><td>match'te her dal guard ister, kazanç yok</td></tr>
<tr><td>Birden fazla değişkene bağlı karmaşık mantık</td><td>if/elif</td><td>match tek bir konu üzerine kuruludur</td></tr>
<tr><td>Listenin uzunluğuna ve elemanlarına göre dallanma</td><td>match</td><td>Uzunluk kontrolü ve açma tek desende</td></tr>
<tr><td>JSON/sözlük mesajın türüne göre yönlendirme</td><td>match</td><td>Anahtar varlığı, değer ve çekme bir arada</td></tr>
<tr><td>Nesnenin türüne ve alanlarına göre işlem</td><td>match</td><td>isinstance + özellik okuma tek satırda</td></tr>
<tr><td>Python 3.9 ve öncesini desteklemesi gereken kod</td><td>if/elif</td><td>match 3.10'da geldi; eski sürümde SyntaxError</td></tr>
</table></div>
<div class="note"><b>Gerçek işte</b>Bir bankanın ya da e-ticaret sitesinin arka planında olay güdümlü (event-driven) sistemler çalışır: mesaj kuyruğundan "sipariş_oluştu", "ödeme_alındı", "iade_talebi" gibi türü farklı JSON olaylar gelir ve her biri farklı bir işleyiciye yönlendirilir. Webhook alıcıları, sohbet botlarının komut ayrıştırıcıları, CLI araçları ve basit yorumlayıcılar da aynı işi yapar. Bu kodu match ile yazmak, kod incelemesinde "hangi mesaj nereye gidiyor" sorusunu tek bakışta yanıtlatır; yeni bir olay türü eklemek tek bir case eklemektir.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Desen türlerinin özeti</h3>
<div class="tbl-wrap"><table>
<tr><th>Desen</th><th>Örnek</th><th>Eşleşir</th></tr>
<tr><td>Değer</td><td><code>case 404:</code></td><td>Konu 404'e eşitse</td></tr>
<tr><td>Noktalı değer</td><td><code>case Durum.ONAY:</code></td><td>Sabite eşitse</td></tr>
<tr><td>Yakalama</td><td><code>case x:</code></td><td>Her zaman; x'e bağlar</td></tr>
<tr><td>Joker</td><td><code>case _:</code></td><td>Her zaman; bağlamaz</td></tr>
<tr><td>Birleşik</td><td><code>case 301 | 302:</code></td><td>Alternatiflerden biri</td></tr>
<tr><td>Dizi</td><td><code>case [x, *rest]:</code></td><td>En az bir elemanlı liste/demet</td></tr>
<tr><td>Sözlük</td><td><code>case {"tip": t}:</code></td><td>"tip" anahtarı olan sözlük</td></tr>
<tr><td>Sınıf</td><td><code>case Havale(tutar=t):</code></td><td>Havale örneği</td></tr>
<tr><td>as</td><td><code>case [_, _] as cift:</code></td><td>Desen + tümünü bağlama</td></tr>
</table></div>
<h3>Enum ile güvenli sabitler</h3>
<p>Durum kodlarını metin olarak dağıtmak yerine <code>enum.Enum</code> tanımlarsan hem yazım hatası riskini azaltır hem de noktalı adla güvenle eşleştirirsin.</p>
<pre class="py">from enum import Enum

class Durum(Enum):
    BEKLIYOR = "bekliyor"
    ONAY = "onay"
    RED = "red"

def mesaj(d):
    match d:
        case Durum.ONAY:
            return "Kredi onaylandı"
        case Durum.RED:
            return "Başvuru reddedildi"
        case Durum.BEKLIYOR:
            return "İnceleniyor"

print(mesaj(Durum("onay")), "|", mesaj(Durum.BEKLIYOR))</pre>
<h3>Performans ve sınırlar</h3>
<p>match bir "atlama tablosu" değildir; desenler sırayla denenir, yani if/elif zincirinden hızlı değildir. Avantajı hız değil okunabilirlik ve doğruluktur. Yüzlerce sabit değere göre dallanıyorsan sözlükle eşleme (<code>{"H": "Hazırlanıyor", ...}.get(kod)</code>) hem daha hızlı hem daha kısadır. Ayrıca derleyici, eksik dalları (exhaustiveness) denetlemez; tüm durumları kapsadığından emin olmak için sonda <code>case _:</code> ile açıkça hata fırlatmak iyi bir alışkanlıktır.</p>
</section>
`,
  ex: [
    { t: 'mc',
      stage: 'Isınma',
      q: '<code>LIMIT = 100</code> tanımlıyken <code>match x:</code> içinde <code>case LIMIT:</code> yazılırsa ne olur?',
      o: ['Yalnızca x == 100 olduğunda eşleşir', 'Her değerle eşleşir, değeri LIMIT adına bağlar', 'LIMIT tanımlı olduğu için NameError verir', 'x ile LIMIT aynı türdeyse eşleşir'],
      a: 1,
      why: 'Desende düz bir ad yakalama desenidir; karşılaştırma yapmaz, her şeyle eşleşir. Sabitle karşılaştırmak için değeri doğrudan yazmak ya da noktalı ad (Ayar.LIMIT) kullanmak gerekir.' },
    { t: 'mc',
      stage: 'Isınma',
      q: 'Konu <code>["sil", "çay", "kahve"]</code> listesiyken aşağıdaki desenlerden hangisi eşleşir?',
      o: ['case ["sil", urun]:', 'case ["sil"]:', 'case ["sil", *urunler]:', 'case {"sil": urunler}:'],
      a: 2,
      why: '["sil", urun] tam iki, ["sil"] tam bir elemanlı listeyle eşleşir. *urunler kalan tüm elemanları (["çay", "kahve"]) toplar. Sözlük deseni listeyle eşleşmez.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Guard sırasına dikkat: bu kod ne yazdırır?',
      code: 'def sinif(t):\n    match t:\n        case x if x > 100:\n            return "büyük"\n        case x if x > 1000:\n            return "çok büyük"\n        case _:\n            return "küçük"\n\nprint(sinif(5000), sinif(50))\n',
      o: ['çok büyük küçük', 'büyük küçük', 'büyük büyük', 'çok büyük büyük'],
      a: 1,
      why: 'Desenler sırayla denenir; 5000 için ilk guard (x > 100) zaten doğrudur, "çok büyük" dalına hiç gelinmez. Özel koşul üste yazılmalıydı.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Sözlük deseninde fazladan anahtarlar: bu kod ne yazdırır?',
      code: 'islem = {"tip": "eft", "tutar": 250, "kanal": "mobil", "aciklama": "kira"}\nmatch islem:\n    case {"tip": "havale", "tutar": t}:\n        print("havale", t)\n    case {"tip": "eft", "tutar": t}:\n        print("eft", t)\n    case _:\n        print("diğer")\n',
      o: ['diğer', 'eft 250', 'havale 250', 'Hiçbir şey yazdırmaz'],
      a: 1,
      why: 'Sözlük deseni yalnızca yazılan anahtarlara bakar; kanal ve aciklama gibi fazladan anahtarlar eşleşmeyi bozmaz. tip "eft" olduğu için ikinci dal çalışır.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Dizi desenleri: bu kod ne yazdırır?',
      code: 'def ayir(parcalar):\n    match parcalar:\n        case [ilk]:\n            return f"tek:{ilk}"\n        case [ilk, *orta, son]:\n            return f"{ilk}|{len(orta)}|{son}"\n        case _:\n            return "boş"\n\nprint(ayir(["a", "b", "c", "d"]), ayir([]), ayir(["x", "y"]))\n',
      o: ['a|2|d boş x|0|y', 'a|3|d boş x|1|y', 'a|2|d boş tek:x', 'a|2|d tek: x|0|y'],
      a: 0,
      why: '[ilk, *orta, son] en az iki elemanla eşleşir; dört elemanda orta ["b", "c"] olur, iki elemanda orta boş liste olur. Boş liste ne [ilk] ne de en az iki elemanlı desenle eşleşir, joker dala düşer.' },
    { t: 'order',
      stage: 'Kodu oku',
      q: '<p>Anadolu Bank işlemini sözlük desenleriyle yönlendiren fonksiyonun satırlarını sırala. Büyük havale kontrolü genel havaleden önce gelmeli.</p>',
      lines: ['def yonlendir(islem):', '    match islem:', '        case {"tip": "havale", "tutar": t} if t > 50000:', '            return "uyum"', '        case {"tip": "havale"}:', '            return "transfer"', '        case _:', '            return "diğer"', 'print(yonlendir({"tip": "havale", "tutar": 90000}), yonlendir({"tip": "havale", "tutar": 10}), yonlendir({}))'],
      expect: 'uyum transfer diğer\n',
      hint: 'Her case satırının hemen altında kendi return satırı gelir; özel (guard\'lı) dal genel daldan önce, joker en sonda.',
      why: 'Desenler sırayla denendiği için guard\'lı özel dal üstte olmalı; joker her şeyle eşleştiğinden en sona yazılır.' },
    { id: 'match-case-1',
      t: 'code',
      stage: 'Rehberli',
      diff: 1,
      q: '<p><code>kargo_mesaji(kod)</code> fonksiyonunu match-case ile yaz. Kod büyük/küçük harf duyarsız olsun. Kurallar: <code>"H"</code> → <code>"Hazırlanıyor"</code>; <code>"K"</code> ya da <code>"D"</code> (dağıtımda) → <code>"Yolda"</code>; <code>"T"</code> → <code>"Teslim edildi"</code>; <code>"I"</code> ya da <code>"R"</code> → <code>"İade sürecinde"</code>; diğer her şey → <code>"Bilinmeyen kod"</code>.</p>',
      guide: ['Konuyu büyük harfe çevirerek match\'e ver: match kod.upper():', 'Tek değerli dallar için case "H": yaz.', 'Aynı sonuca giden kodları | ile birleştir: case "K" | "D":', 'En sona case _: ile varsayılan dalı ekle.'],
      example: 'def oncelik(seviye):\n    match seviye.lower():\n        case "acil" | "kritik":\n            return 1\n        case "normal":\n            return 2\n        case _:\n            return 3\n\nprint(oncelik("KRİTİK"), oncelik("normal"), oncelik("x"))\n',
      start: 'def kargo_mesaji(kod):\n    match kod.upper():\n        case "H":\n            return "Hazırlanıyor"\n        # TODO: K ya da D → "Yolda"\n        # TODO: T → "Teslim edildi"\n        # TODO: I ya da R → "İade sürecinde"\n        # TODO: diğer her şey → "Bilinmeyen kod"\n',
      sol: 'def kargo_mesaji(kod):\n    match kod.upper():\n        case "H":\n            return "Hazırlanıyor"\n        case "K" | "D":\n            return "Yolda"\n        case "T":\n            return "Teslim edildi"\n        case "I" | "R":\n            return "İade sürecinde"\n        case _:\n            return "Bilinmeyen kod"\n',
      tests: 'assert kargo_mesaji("h") == "Hazırlanıyor", "küçük h de Hazırlanıyor olmalı (upper ile)"\nassert kargo_mesaji("K") == "Yolda" and kargo_mesaji("d") == "Yolda", "K ve D birleşik desenle Yolda vermeli"\nassert kargo_mesaji("T") == "Teslim edildi", "T Teslim edildi olmalı"\nassert kargo_mesaji("R") == "İade sürecinde" and kargo_mesaji("i") == "İade sürecinde", "I ve R İade sürecinde olmalı"\nassert kargo_mesaji("Z") == "Bilinmeyen kod", "tanımsız kod için joker dal \'Bilinmeyen kod\' döndürmeli"\nassert kargo_mesaji("") == "Bilinmeyen kod", "boş metin de bilinmeyen kod"\n',
      hints: ['Birden fazla değer için birleşik desen kullan.', 'case "K" | "D": ve case "I" | "R":', 'Son dal: case _: return "Bilinmeyen kod"'],
      why: 'Birleşik desen aynı sonuca giden değerleri tek dalda toplar; joker, eşleşmeyen her şeyi yakalayarak fonksiyonun hep bir değer döndürmesini sağlar.' },
    { id: 'match-case-2',
      t: 'code',
      stage: 'Rehberli',
      diff: 2,
      q: '<p>Anadolu Market sepet komutlarını ayrıştıran <code>sepet_komutu(satir)</code> fonksiyonunu dizi desenleriyle yaz. Satırı <code>split()</code> ile parçala. Kurallar:</p><ul><li><code>"listele"</code> → <code>"LISTE"</code></li><li><code>"ekle URUN"</code> → <code>("EKLE", URUN, 1)</code></li><li><code>"ekle URUN ADET"</code> (ADET rakamlardan oluşuyorsa) → <code>("EKLE", URUN, ADET)</code>, ADET int olarak</li><li><code>"sil URUN1 URUN2 ..."</code> (en az bir ürün) → <code>("SIL", [URUN1, URUN2, ...])</code></li><li>diğer her şey (boş satır dahil) → <code>"HATA"</code></li></ul>',
      guide: ['match satir.split(): ile başla.', 'Tek elemanlı ["listele"] desenini yaz.', 'İki elemanlı ["ekle", urun] ve üç elemanlı ["ekle", urun, adet] desenlerini ayrı yaz; üçlüye if adet.isdigit() guard\'ı ekle.', '["sil", *urunler] desenine if urunler guard\'ı ekle ki "sil" tek başına hata versin.', 'En sona case _: "HATA"'],
      example: 'def git(satir):\n    match satir.split():\n        case ["git", yon]:\n            return f"{yon} yönüne gidiliyor"\n        case ["al", *esyalar] if esyalar:\n            return f"Alındı: {esyalar}"\n        case _:\n            return "Anlaşılmadı"\n\nprint(git("git kuzey"), git("al anahtar fener"), git("al"))\n',
      start: 'def sepet_komutu(satir):\n    match satir.split():\n        case ["listele"]:\n            return "LISTE"\n        # TODO: ["ekle", urun]\n        # TODO: ["ekle", urun, adet] ve adet rakam ise\n        # TODO: ["sil", *urunler] ve en az bir ürün varsa\n        case _:\n            return "HATA"\n',
      sol: 'def sepet_komutu(satir):\n    match satir.split():\n        case ["listele"]:\n            return "LISTE"\n        case ["ekle", urun]:\n            return ("EKLE", urun, 1)\n        case ["ekle", urun, adet] if adet.isdigit():\n            return ("EKLE", urun, int(adet))\n        case ["sil", *urunler] if urunler:\n            return ("SIL", urunler)\n        case _:\n            return "HATA"\n',
      tests: 'assert sepet_komutu("listele") == "LISTE", "listele komutu LISTE döndürmeli"\nassert sepet_komutu("ekle çay") == ("EKLE", "çay", 1), "adet verilmezse 1 olmalı"\nassert sepet_komutu("ekle çay 3") == ("EKLE", "çay", 3), "adet int olarak dönmeli: (\'EKLE\', \'çay\', 3)"\nassert sepet_komutu("ekle çay üç") == "HATA", "rakam olmayan adet guard\'a takılıp HATA vermeli"\nassert sepet_komutu("sil çay kahve") == ("SIL", ["çay", "kahve"]), "sil kalan tüm ürünleri liste olarak döndürmeli"\nassert sepet_komutu("sil") == "HATA", "ürünsüz sil HATA olmalı (if urunler guard\'ı)"\nassert sepet_komutu("") == "HATA" and sepet_komutu("ekle a 1 2") == "HATA", "boş satır ve fazla parça HATA vermeli"\n',
      hints: ['Dizi desenleri eleman sayısına bakar: ["ekle", urun] tam iki parça ister.', 'Guard: case ["ekle", urun, adet] if adet.isdigit():', 'case ["sil", *urunler] if urunler: return ("SIL", urunler)'],
      why: 'Her desen hem parça sayısını hem ilk kelimeyi aynı anda denetler; guard\'lar geçersiz girdiyi joker dala düşürür. if/elif ile aynı işi len() ve indekslerle çok daha uzun yazardın.' },
    { id: 'match-case-3',
      t: 'code',
      stage: 'Rehberli',
      diff: 2,
      q: '<p>Anadolu Bank işlem kuyruğu için <code>islem_kanali(islem)</code> fonksiyonunu sözlük desenleriyle yaz. Dönüş değerleri:</p><ul><li><code>"tip"</code> <code>"havale"</code> ya da <code>"eft"</code> ve <code>"tutar"</code> 50000\'den büyükse → <code>"UYUM"</code></li><li><code>"tip"</code> <code>"havale"</code> ya da <code>"eft"</code> (tutar var) → <code>"TRANSFER"</code></li><li><code>"tip": "fatura"</code> ve <code>"kurum"</code> anahtarı varsa → <code>"FATURA:" + kurum</code></li><li><code>"tip"</code> anahtarı olan diğer sözlükler → <code>"DESTEKLENMIYOR"</code></li><li>geri kalan her şey (sözlük değil ya da tip yok) → <code>"GECERSIZ"</code></li></ul>',
      guide: ['En özel dalı en üste yaz: havale/eft + guard ile tutar kontrolü.', 'Birleşik deseni sözlük içinde kullan: {"tip": "havale" | "eft", "tutar": t}', 'Fatura için kurumu yakala: {"tip": "fatura", "kurum": kurum}', 'Tip anahtarı olan her sözlük için {"tip": _} ve en sonda case _:'],
      example: 'def olay(m):\n    match m:\n        case {"olay": "giris" | "cikis", "kullanici": k}:\n            return f"oturum:{k}"\n        case {"olay": _}:\n            return "bilinmeyen olay"\n        case _:\n            return "geçersiz"\n\nprint(olay({"olay": "giris", "kullanici": "ece", "ip": "1.2.3.4"}), olay({"olay": "x"}), olay([1]))\n',
      start: 'def islem_kanali(islem):\n    match islem:\n        # TODO: havale/eft ve tutar > 50000 → "UYUM"\n        # TODO: havale/eft (tutar var) → "TRANSFER"\n        # TODO: fatura + kurum → "FATURA:" + kurum\n        # TODO: tip anahtarı olan diğerleri → "DESTEKLENMIYOR"\n        case _:\n            return "GECERSIZ"\n',
      sol: 'def islem_kanali(islem):\n    match islem:\n        case {"tip": "havale" | "eft", "tutar": t} if t > 50000:\n            return "UYUM"\n        case {"tip": "havale" | "eft", "tutar": _}:\n            return "TRANSFER"\n        case {"tip": "fatura", "kurum": kurum}:\n            return "FATURA:" + kurum\n        case {"tip": _}:\n            return "DESTEKLENMIYOR"\n        case _:\n            return "GECERSIZ"\n',
      tests: 'assert islem_kanali({"tip": "havale", "tutar": 75000, "alici": "TR1"}) == "UYUM", "50000 üstü havale UYUM olmalı"\nassert islem_kanali({"tip": "eft", "tutar": 50000}) == "TRANSFER", "tam 50000 büyük değil; TRANSFER olmalı"\nassert islem_kanali({"tip": "havale", "tutar": 10, "kanal": "mobil"}) == "TRANSFER", "fazladan anahtarlar eşleşmeyi bozmamalı"\nassert islem_kanali({"tip": "fatura", "kurum": "Su", "tutar": 90}) == "FATURA:Su", "fatura kurumu yakalanmalı"\nassert islem_kanali({"tip": "fatura"}) == "DESTEKLENMIYOR", "kurumsuz fatura özel dala girmemeli"\nassert islem_kanali({"tip": "havale"}) == "DESTEKLENMIYOR", "tutarsız havale transfer sayılmamalı"\nassert islem_kanali({"tutar": 5}) == "GECERSIZ" and islem_kanali(["havale", 5]) == "GECERSIZ", "tip yoksa ya da sözlük değilse GECERSIZ"\n',
      hints: ['Sözlük deseni yalnız yazdığın anahtarlara bakar; anahtar eksikse eşleşmez.', 'Guard\'lı UYUM dalı TRANSFER dalının üstünde olmalı.', 'Tutarın varlığını şart koşmak için {"tutar": _} yaz.'],
      why: 'Sözlük desenleri anahtar varlığını, değeri ve çekmeyi birlikte yapar; özelden genele sıralama ve son joker dal, her mesajın tam bir kanala gitmesini garanti eder.' },
    { id: 'match-case-4',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 1,
      q: '<p><code>http_durum(kod)</code> fonksiyonunu match-case ile yaz: 200 ya da 201 → <code>"Başarılı"</code>; 301 ya da 302 → <code>"Yönlendirme"</code>; 404 → <code>"Bulunamadı"</code>; 400–499 arası diğer kodlar → <code>"İstemci hatası"</code>; 500–599 → <code>"Sunucu hatası"</code>; diğer her şey → <code>"Bilinmiyor"</code>.</p>',
      start: 'def http_durum(kod):\n    pass\n',
      sol: 'def http_durum(kod):\n    match kod:\n        case 200 | 201:\n            return "Başarılı"\n        case 301 | 302:\n            return "Yönlendirme"\n        case 404:\n            return "Bulunamadı"\n        case k if 400 <= k <= 499:\n            return "İstemci hatası"\n        case k if 500 <= k <= 599:\n            return "Sunucu hatası"\n        case _:\n            return "Bilinmiyor"\n',
      tests: 'assert http_durum(200) == "Başarılı" and http_durum(201) == "Başarılı", "200 ve 201 Başarılı"\nassert http_durum(302) == "Yönlendirme", "302 Yönlendirme"\nassert http_durum(404) == "Bulunamadı", "404 kendi özel dalına girmeli; aralık dalından önce yaz"\nassert http_durum(403) == "İstemci hatası", "403 istemci hatası"\nassert http_durum(503) == "Sunucu hatası", "503 sunucu hatası"\nassert http_durum(100) == "Bilinmiyor" and http_durum(600) == "Bilinmiyor", "aralık dışı kodlar Bilinmiyor"\nassert "match" in __source__, "çözümü match-case ile yaz"\n',
      hints: ['Aralıklar için yakalama + guard: case k if 400 <= k <= 499:', '404 özel dalı, 4xx aralık dalının üstünde olmalı.'],
      why: 'Sabit değerler birleşik desenle, aralıklar guard ile ifade edilir; özel değer (404) genel aralıktan önce gelmelidir.' },
    { id: 'match-case-5',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p>Lojistik ekibi depo raflarının taban alanını hesaplıyor. Başlangıç kodunda üç dataclass var: <code>Daire(r)</code>, <code>Dikdortgen(en, boy)</code>, <code>Kare(kenar)</code>. <code>alan(sekil)</code> fonksiyonunu <b>sınıf desenleriyle</b> yaz ve alanı 2 ondalığa yuvarla (daire için <code>math.pi</code>). Bilinmeyen bir nesne gelirse <code>ValueError</code> fırlat. Ayrıca kenarı 0 ya da negatif olan bir <code>Kare</code> için de <code>ValueError</code> fırlat.</p>',
      start: 'import math\nfrom dataclasses import dataclass\n\n@dataclass\nclass Daire:\n    r: float\n\n@dataclass\nclass Dikdortgen:\n    en: float\n    boy: float\n\n@dataclass\nclass Kare:\n    kenar: float\n\ndef alan(sekil):\n    pass\n',
      sol: 'import math\nfrom dataclasses import dataclass\n\n@dataclass\nclass Daire:\n    r: float\n\n@dataclass\nclass Dikdortgen:\n    en: float\n    boy: float\n\n@dataclass\nclass Kare:\n    kenar: float\n\ndef alan(sekil):\n    match sekil:\n        case Daire(r):\n            return round(math.pi * r * r, 2)\n        case Dikdortgen(en, boy):\n            return round(en * boy, 2)\n        case Kare(k) if k > 0:\n            return round(k * k, 2)\n        case Kare():\n            raise ValueError("Kare kenarı pozitif olmalı")\n        case _:\n            raise ValueError("Bilinmeyen şekil")\n',
      tests: 'assert alan(Daire(1)) == 3.14, "yarıçapı 1 olan dairenin alanı 3.14"\nassert alan(Dikdortgen(2.5, 4)) == 10.0, "2.5 × 4 = 10.0"\nassert alan(Kare(3)) == 9, "kenarı 3 olan kare 9"\nfor kotu in [Kare(0), Kare(-2), "kare", 5]:\n    try:\n        alan(kotu)\n        assert False, f"{kotu!r} için ValueError bekleniyordu"\n    except ValueError:\n        pass\n',
      hints: ['dataclass alanları konumsal desene açılır: case Daire(r):', 'Geçersiz kare için önce guard\'lı case Kare(k) if k > 0:, ardından case Kare(): raise ValueError(...)'],
      why: 'Sınıf deseni hem türü denetler (isinstance) hem alanları açar. Guard ile geçerli kareyi ayırıp, kalan Kare örneklerini ayrı dalda reddedersin.' },
    { id: 'match-case-6',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p>Bir harita uygulaması için <code>konum_tanimla(nokta)</code> fonksiyonunu yaz. <code>nokta</code> bir demet ya da listedir. Kurallar (sırayla): <code>(0, 0)</code> → <code>"Merkez"</code>; x 0 ise → <code>"Y ekseni: y=..."</code>; y 0 ise → <code>"X ekseni: x=..."</code>; x ile y eşitse → <code>"Köşegen"</code>; iki elemanlı diğerleri → <code>"Düzlem"</code>; üç elemanlı her şey → <code>"3B nokta"</code>; diğer her şey → <code>"Geçersiz"</code>.</p>',
      start: 'def konum_tanimla(nokta):\n    pass\n',
      sol: 'def konum_tanimla(nokta):\n    match nokta:\n        case (0, 0):\n            return "Merkez"\n        case (0, y):\n            return f"Y ekseni: y={y}"\n        case (x, 0):\n            return f"X ekseni: x={x}"\n        case (x, y) if x == y:\n            return "Köşegen"\n        case (_, _):\n            return "Düzlem"\n        case (_, _, _):\n            return "3B nokta"\n        case _:\n            return "Geçersiz"\n',
      tests: 'assert konum_tanimla((0, 0)) == "Merkez", "(0, 0) Merkez"\nassert konum_tanimla((0, 5)) == "Y ekseni: y=5", "x 0 ise Y ekseni: y=5"\nassert konum_tanimla([3, 0]) == "X ekseni: x=3", "liste de dizi deseniyle eşleşir"\nassert konum_tanimla((4, 4)) == "Köşegen", "x == y Köşegen"\nassert konum_tanimla((2, 7)) == "Düzlem", "diğer ikililer Düzlem"\nassert konum_tanimla((1, 2, 3)) == "3B nokta", "üç eleman 3B nokta"\nassert konum_tanimla("ab") == "Geçersiz", "metin dizi deseniyle eşleşmez: Geçersiz"\nassert konum_tanimla((1,)) == "Geçersiz", "tek eleman Geçersiz"\n',
      hints: ['Dizi desenlerinde hem değer hem yakalama karışabilir: case (0, y):', 'Eşitlik için guard: case (x, y) if x == y:'],
      why: 'Dizi desenleri eleman sayısını ve belirli konumlardaki değerleri aynı anda denetler; metinlerin dizi deseninden hariç tutulması "ab" gibi girdileri güvenle eler.' },
    { id: 'match-case-7',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p>Anadolu Market sitesinin olay günlüğünü özetleyen <code>olay_ozeti(olaylar)</code> fonksiyonunu yaz. Olaylar sözlüktür:</p><ul><li><code>{"tip": "giris", "kullanici": k}</code> → giriş sayısını 1 artır</li><li><code>{"tip": "satin_alma", "tutar": t}</code> → ciroya t ekle</li><li><code>{"tip": "hata", "kod": c}</code> → c\'yi hata kodları listesine ekle</li><li>diğer her şey yok sayılır</li></ul><p>Fonksiyon <code>{"giris": sayı, "ciro": toplam, "hatalar": [kodlar]}</code> döndürsün (ciro 2 ondalık).</p>',
      start: 'def olay_ozeti(olaylar):\n    pass\n',
      sol: 'def olay_ozeti(olaylar):\n    ozet = {"giris": 0, "ciro": 0, "hatalar": []}\n    for o in olaylar:\n        match o:\n            case {"tip": "giris", "kullanici": _}:\n                ozet["giris"] += 1\n            case {"tip": "satin_alma", "tutar": t}:\n                ozet["ciro"] += t\n            case {"tip": "hata", "kod": c}:\n                ozet["hatalar"].append(c)\n    ozet["ciro"] = round(ozet["ciro"], 2)\n    return ozet\n',
      tests: 'olaylar = [\n    {"tip": "giris", "kullanici": "ayse"},\n    {"tip": "satin_alma", "tutar": 149.9, "urun": "Çay"},\n    {"tip": "hata", "kod": 500},\n    {"tip": "giris", "kullanici": "can"},\n    {"tip": "satin_alma", "tutar": 50.15},\n    {"tip": "cikis", "kullanici": "ayse"},\n    {"tip": "giris"},\n    "bozuk kayıt",\n    {"tip": "hata", "kod": 404},\n]\nr = olay_ozeti(olaylar)\nassert r["giris"] == 2, f"kullanıcısı olan 2 giriş var; gelen {r[\'giris\']}"\nassert r["ciro"] == 200.05, f"ciro 149.9 + 50.15 = 200.05 olmalı; gelen {r[\'ciro\']}"\nassert r["hatalar"] == [500, 404], "hata kodları sırayla toplanmalı"\nassert olay_ozeti([]) == {"giris": 0, "ciro": 0, "hatalar": []}, "boş günlükte sıfır özet"\n',
      hints: ['Döngünün içinde her olayı match ile yönlendir.', 'Eşleşmeyen olaylar için case _ yazmana gerek yok; match hiçbir şey yapmaz.'],
      why: 'match, döngü içinde her olayın türüne göre doğru biriktiriciye yönlendirme yapar; bozuk ya da bilinmeyen kayıtlar hiçbir desenle eşleşmediği için sessizce atlanır.' },
    { id: 'match-case-8',
      t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      diff: 2,
      q: '<p>Hatayı bul ve düzelt. <code>basvuru_mesaji(durum)</code> kredi başvurusu durumuna göre mesaj döndürmeli: <code>"onay"</code> → <code>"Onaylandı"</code>, <code>"red"</code> → <code>"Reddedildi"</code>, diğer her şey → <code>"Bilinmeyen durum"</code>. Kod sabitleri kullanıyor ama tanımsız durumlar da "Onaylandı" çıkıyor.</p>',
      start: 'ONAY = "onay"\nRED = "red"\n\ndef basvuru_mesaji(durum):\n    match durum:\n        case "red":\n            return "Reddedildi"\n        case ONAY:\n            return "Onaylandı"\n',
      sol: 'class Durum:\n    ONAY = "onay"\n    RED = "red"\n\ndef basvuru_mesaji(durum):\n    match durum:\n        case Durum.RED:\n            return "Reddedildi"\n        case Durum.ONAY:\n            return "Onaylandı"\n        case _:\n            return "Bilinmeyen durum"\n',
      tests: 'assert basvuru_mesaji("onay") == "Onaylandı", "onay Onaylandı olmalı"\nassert basvuru_mesaji("red") == "Reddedildi", "red Reddedildi olmalı"\nassert basvuru_mesaji("beklemede") == "Bilinmeyen durum", "case ONAY: yakalama desenidir ve her şeyle eşleşir; noktalı ad ya da metin değeri kullan"\nassert basvuru_mesaji("") == "Bilinmeyen durum", "boş durum da bilinmeyen olmalı"\n',
      hints: ['Desende düz ad (ONAY) karşılaştırma değil yakalamadır.', 'case "onay": yaz ya da sabitleri bir sınıfa koyup case Durum.ONAY: kullan; sona case _: ekle.'],
      why: 'Düz ad her şeyi yakalar ve "beklemede" de o dala düşer. Noktalı ad (Durum.ONAY) değer deseni sayılır ve gerçekten karşılaştırma yapar; joker dal da bilinmeyenleri doğru yönlendirir.' },
    { id: 'match-case-9',
      t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      diff: 2,
      q: '<p>Hatayı bul ve düzelt. <code>komut_cevir(satir)</code> şu çevirileri yapmalı: <code>"çık"</code> → <code>"QUIT"</code>, <code>"git YER"</code> → <code>"GO YER"</code>, <code>"git YER hızlı"</code> → <code>"RUN YER"</code>, diğerleri → <code>"?"</code>. Ama <code>"git ofis hızlı"</code> hiçbir zaman RUN olmuyor ve <code>"çık"</code> da yanlış çevriliyor.</p>',
      start: 'def komut_cevir(satir):\n    match satir.split():\n        case [komut, *_] if komut == "git":\n            return "GO " + satir.split()[1]\n        case ["git", yer, "hızlı"]:\n            return "RUN " + yer\n        case "çık":\n            return "QUIT"\n        case _:\n            return "?"\n',
      sol: 'def komut_cevir(satir):\n    match satir.split():\n        case ["çık"]:\n            return "QUIT"\n        case ["git", yer, "hızlı"]:\n            return "RUN " + yer\n        case ["git", yer]:\n            return "GO " + yer\n        case _:\n            return "?"\n',
      tests: 'assert komut_cevir("çık") == "QUIT", "konu bir liste: [\'çık\'] deseni gerekir, \'çık\' metni listeyle eşleşmez"\nassert komut_cevir("git ofis") == "GO ofis", "git ofis → GO ofis"\nassert komut_cevir("git ofis hızlı") == "RUN ofis", "özel desen genel desenden önce gelmeli"\nassert komut_cevir("git") == "?", "yersiz git ? olmalı (IndexError değil)"\nassert komut_cevir("git a b c") == "?", "fazla parça ? olmalı"\n',
      hints: ['İki sorun var: desen sırası ve konunun türü. split() liste döndürür.', 'case ["çık"]:, sonra ["git", yer, "hızlı"], sonra ["git", yer] sırası doğru.'],
      why: 'Genel desen üstte kaldığı için özel dal ölü koddu; ayrıca konu bir liste olduğundan "çık" metin deseni hiç eşleşmezdi. Kesin uzunluklu dizi desenleri hem sırayı hem "git" tek başına geldiğindeki IndexError\'ı çözer.' },
    { id: 'match-case-10',
      t: 'code',
      stage: 'Meydan okuma',
      diff: 3,
      q: '<p>Anadolu Bank için küçük bir komut satırı simülatörü yaz: <code>banka_cli(komutlar, hesaplar)</code>. <code>hesaplar</code> hesap no → bakiye sözlüğüdür ve <b>yerinde</b> güncellenir; aktif hesap başta <code>"H-1"</code>dir. Fonksiyon her komut için bir çıktı satırı üreten listeyi döndürsün. Komutlar:</p><ul><li><code>bakiye</code> → <code>"H-1: 150.00"</code> (aktif hesap, 2 ondalık)</li><li><code>yatir TUTAR</code> → bakiyeye ekle, <code>"OK"</code></li><li><code>cek TUTAR</code> → bakiye yetmiyorsa <code>"Yetersiz bakiye"</code>, yoksa düş ve <code>"OK"</code></li><li><code>transfer TUTAR HESAP</code> → hedef hesap yoksa <code>"Hesap yok"</code>, bakiye yetmiyorsa <code>"Yetersiz bakiye"</code>, yoksa aktarıp <code>"OK"</code></li><li><code>hesap HESAP</code> → hesap varsa aktif yap ve <code>"Aktif: HESAP"</code>, yoksa <code>"Hesap yok"</code></li><li>TUTAR pozitif bir sayı olmalı (ondalıklı olabilir: <code>"12.5"</code>); değilse <code>"Geçersiz tutar"</code>. Tanınmayan komut ya da yanlış parça sayısı → <code>"Bilinmeyen komut"</code>.</li></ul>',
      start: 'def banka_cli(komutlar, hesaplar):\n    pass\n',
      sol: 'def tutar_coz(metin):\n    try:\n        t = float(metin)\n    except ValueError:\n        return None\n    return t if t > 0 else None\n\ndef banka_cli(komutlar, hesaplar):\n    aktif = "H-1"\n    cikti = []\n    for satir in komutlar:\n        match satir.split():\n            case ["bakiye"]:\n                cikti.append(f"{aktif}: {hesaplar[aktif]:.2f}")\n            case ["yatir" | "cek", metin] if tutar_coz(metin) is None:\n                cikti.append("Geçersiz tutar")\n            case ["transfer", metin, _] if tutar_coz(metin) is None:\n                cikti.append("Geçersiz tutar")\n            case ["yatir", metin]:\n                hesaplar[aktif] += tutar_coz(metin)\n                cikti.append("OK")\n            case ["cek", metin]:\n                t = tutar_coz(metin)\n                if t > hesaplar[aktif]:\n                    cikti.append("Yetersiz bakiye")\n                else:\n                    hesaplar[aktif] -= t\n                    cikti.append("OK")\n            case ["transfer", metin, hedef]:\n                t = tutar_coz(metin)\n                if hedef not in hesaplar:\n                    cikti.append("Hesap yok")\n                elif t > hesaplar[aktif]:\n                    cikti.append("Yetersiz bakiye")\n                else:\n                    hesaplar[aktif] -= t\n                    hesaplar[hedef] += t\n                    cikti.append("OK")\n            case ["hesap", no] if no in hesaplar:\n                aktif = no\n                cikti.append(f"Aktif: {no}")\n            case ["hesap", _]:\n                cikti.append("Hesap yok")\n            case _:\n                cikti.append("Bilinmeyen komut")\n    return cikti\n',
      tests: 'h = {"H-1": 100.0, "H-2": 20.0}\nkomutlar = ["bakiye", "yatir 50", "cek 500", "cek 30.5", "transfer 19.5 H-2", "transfer 10 H-9",\n            "transfer 1000 H-2", "yatir -5", "cek abc", "hesap H-2", "bakiye", "hesap H-7", "uç", "yatir", "transfer 5"]\nr = banka_cli(komutlar, h)\nbeklenen = ["H-1: 100.00", "OK", "Yetersiz bakiye", "OK", "OK", "Hesap yok",\n            "Yetersiz bakiye", "Geçersiz tutar", "Geçersiz tutar", "Aktif: H-2", "H-2: 39.50", "Hesap yok", "Bilinmeyen komut", "Bilinmeyen komut", "Bilinmeyen komut"]\nassert isinstance(r, list) and len(r) == len(beklenen), f"her komut için bir çıktı satırı olmalı ({len(beklenen)} satır)"\nfor i, (gelen, bek) in enumerate(zip(r, beklenen)):\n    assert gelen == bek, f"{komutlar[i]!r} komutu için {bek!r} bekleniyordu, gelen {gelen!r}"\nassert abs(h["H-1"] - 100.0) < 1e-9, "H-1 bakiyesi 100 + 50 - 30.5 - 19.5 = 100.0 olmalı"\nassert abs(h["H-2"] - 39.5) < 1e-9, "H-2 bakiyesi 20 + 19.5 = 39.5 olmalı"\n',
      hints: ['Tutar doğrulamayı ayrı bir yardımcı fonksiyona koy: float() dene, ValueError ya da sıfır/negatif ise None döndür.', 'Doğru parça sayısında ama geçersiz tutarlı komutları, normal dallardan önce guard\'lı bir dalla yakala; parça sayısı yanlışsa "Bilinmeyen komut".', 'hesap komutu için guard: case ["hesap", no] if no in hesaplar: ve ardından case ["hesap", _]:'],
      why: 'Komutun şekli (parça sayısı, ilk kelime) desenle, anlamsal geçerlilik (tutar sayı mı, hesap var mı) guard ve iç if\'lerle denetlenir. Doğrulamayı ayrı fonksiyona çekmek match dallarını kısa tutar. Tek dal yerine ayrı dallar tercih etmek de geçerlidir; önemli olan sıralama ve tüm kenar durumların karşılanmasıdır.' },
    { id: 'match-case-11',
      t: 'code',
      stage: 'Mini proje',
      diff: 3,
      q: '<p>Anadolu Market sipariş olaylarından durum tablosu çıkaran iki fonksiyon yaz:</p><ul><li><code>durum_tablosu(olaylar)</code>: olaylar sırayla işlenir ve sipariş no → <code>{"tutar": ..., "durum": ...}</code> sözlüğü döner. Olaylar:<br><code>{"olay": "olustu", "no": n, "tutar": t}</code> → kaydı <code>"yeni"</code> durumla oluştur;<br><code>{"olay": "odeme", "no": n}</code> → durum <code>"odendi"</code>;<br><code>{"olay": "kargo", "no": n, "firma": _}</code> → durum <code>"kargoda"</code>;<br><code>{"olay": "iade", "no": n, "tutar": t}</code> → tutardan t düş; tutar 0 ya da altına inerse durum <code>"iade"</code>.<br>Tabloda olmayan bir siparişe gelen olay ve tanınmayan olaylar yok sayılır.</li><li><code>durum_sayilari(tablo)</code>: durum → kaç sipariş sözlüğü döndürsün.</li></ul>',
      start: 'def durum_tablosu(olaylar):\n    # TODO\n    pass\n\ndef durum_sayilari(tablo):\n    # TODO\n    pass\n',
      sol: 'def durum_tablosu(olaylar):\n    tablo = {}\n    for o in olaylar:\n        match o:\n            case {"olay": "olustu", "no": n, "tutar": t}:\n                tablo[n] = {"tutar": t, "durum": "yeni"}\n            case {"olay": "odeme", "no": n} if n in tablo:\n                tablo[n]["durum"] = "odendi"\n            case {"olay": "kargo", "no": n, "firma": _} if n in tablo:\n                tablo[n]["durum"] = "kargoda"\n            case {"olay": "iade", "no": n, "tutar": t} if n in tablo:\n                tablo[n]["tutar"] -= t\n                if tablo[n]["tutar"] <= 0:\n                    tablo[n]["durum"] = "iade"\n    return tablo\n\ndef durum_sayilari(tablo):\n    sayilar = {}\n    for kayit in tablo.values():\n        sayilar[kayit["durum"]] = sayilar.get(kayit["durum"], 0) + 1\n    return sayilar\n',
      tests: 'olaylar = [\n    {"olay": "olustu", "no": "AM-1", "tutar": 300},\n    {"olay": "olustu", "no": "AM-2", "tutar": 120},\n    {"olay": "olustu", "no": "AM-3", "tutar": 80},\n    {"olay": "odeme", "no": "AM-1"},\n    {"olay": "kargo", "no": "AM-1", "firma": "Yurtiçi"},\n    {"olay": "odeme", "no": "AM-2"},\n    {"olay": "iade", "no": "AM-2", "tutar": 50},\n    {"olay": "iade", "no": "AM-3", "tutar": 80},\n    {"olay": "odeme", "no": "AM-99"},\n    {"olay": "kargo", "no": "AM-2"},\n    {"olay": "puan", "no": "AM-1"},\n]\nt = durum_tablosu(olaylar)\nassert t is not None and set(t) == {"AM-1", "AM-2", "AM-3"}, "tabloda yalnız oluşturulan üç sipariş olmalı; AM-99 eklenmemeli"\nassert t["AM-1"] == {"tutar": 300, "durum": "kargoda"}, f"AM-1 kargoda olmalı: {t[\'AM-1\']}"\nassert t["AM-2"] == {"tutar": 70, "durum": "odendi"}, f"AM-2 kısmi iade: tutar 70, durum odendi (firmasız kargo olayı yok sayılır); gelen {t[\'AM-2\']}"\nassert t["AM-3"] == {"tutar": 0, "durum": "iade"}, "AM-3 tamamen iade edildi"\nassert durum_sayilari(t) == {"kargoda": 1, "odendi": 1, "iade": 1}, f"durum sayıları hatalı: {durum_sayilari(t)}"\nassert durum_sayilari({}) == {}, "boş tablo boş sayım vermeli"\n',
      hints: ['Her olayı sözlük deseniyle yakala; tabloda olmayan siparişler için if n in tablo guard\'ı ekle.', 'İade dalında önce tutarı düş, sonra <= 0 ise durumu değiştir.', 'durum_sayilari için sözlükler dersindeki sayım kalıbını kullan.'],
      why: 'Olay güdümlü sistemlerin özü budur: her olay türü bir case, durum bir sözlükte tutulur. Guard\'lar bilinmeyen siparişlere gelen olayları güvenle eler; eksik alanlı olaylar hiçbir desene uymadığı için kendiliğinden yok sayılır.' }
  ],
  faq: [
    { q: 'match-case Python\'un her sürümünde çalışır mı?',
      a: 'Hayır, Python 3.10 ve sonrasında çalışır. Daha eski bir sürümde match satırı SyntaxError verir. Kodun eski sunucularda da çalışması gerekiyorsa if/elif kullan.' },
    { q: 'match ile switch aynı şey mi?',
      a: 'Kısmen. Değer desenleriyle switch gibi kullanılabilir ama fall-through yoktur ve break gerekmez. Asıl gücü dizi, sözlük ve sınıf desenleriyle veriyi şekline göre eşleyip parçalarına ayırmasıdır; switch bunu yapamaz.' },
    { q: 'match içinde yakalanan değişkenler match bittikten sonra da kullanılabilir mi?',
      a: 'Evet. Yakalama, normal bir atama gibi davranır; değişken match\'ten sonra da yaşar. Ama eşleşmeyen bir dalın değişkenine güvenme; o dal çalışmadıysa değişken tanımsız olabilir.' },
    { q: 'Sözlük deseninde bir anahtarın OLMAMASINI nasıl şart koşarım?',
      a: 'Sözlük deseni yalnız var olan anahtarları denetler. Yokluğu şart koşmak için guard kullan: <code>case {"tip": "havale"} as m if "iptal" not in m:</code>.' }
  ],
  mistakes: [
    { why: 'Düz ad yakalama desenidir ve her şeyle eşleşir; sabit için değeri yaz ya da noktalı ad (Durum.ONAY) kullan.',
      bad: 'ONAY = "onay"\nmatch durum:\n    case ONAY:\n        print("Onaylandı")',
      good: 'match durum:\n    case "onay":\n        print("Onaylandı")' },
    { why: 'Desenler sırayla denenir; genel koşul üstteyse özel dal hiç çalışmaz.',
      bad: 'match t:\n    case x if x > 100:\n        ...\n    case x if x > 1000:\n        ...',
      good: 'match t:\n    case x if x > 1000:\n        ...\n    case x if x > 100:\n        ...' },
    { why: 'Metin dizi deseniyle eşleşmez; önce split() ile listeye çevir.',
      bad: 'match satir:\n    case ["ekle", urun]:\n        ...',
      good: 'match satir.split():\n    case ["ekle", urun]:\n        ...' },
    { why: 'Parantezsiz sınıf adı yakalama desenidir; tür kontrolü için Havale() yaz.',
      bad: 'match islem:\n    case Havale:\n        ...',
      good: 'match islem:\n    case Havale():\n        ...' },
    { why: 'Hiçbir desen eşleşmezse match sessizce geçer; varsayılan davranış için case _ ekle.',
      bad: 'match kod:\n    case 200:\n        return "OK"\n# eşleşmeyen kodlar None döner',
      good: 'match kod:\n    case 200:\n        return "OK"\n    case _:\n        return "Bilinmiyor"' }
  ] }
);
})(window);
/* PythonPatika v2 — ozyineleme */
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push(
{ id: 'ozyineleme',
  lv: 'temel',
  mod: 'Fonksiyonlar ve Modüller',
  min: 40,
  title: 'Özyineleme (recursion)',
  sum: 'Kendini çağıran fonksiyonları temel durum ve özyinelemeli adımla kurar; çağrı yığınını girintili print ile izler, faktöriyel, fibonacci ve memoization, iç içe liste, klasör ağacı ve ikili aramayı özyinelemeyle çözer, RecursionError\'ı ve döngüyle karşılaştırmayı öğrenirsin.',
  goals: ['Özyinelemeli bir fonksiyonu temel durum ve küçülen özyinelemeli adım olarak kurabilirim.', 'Çağrı yığınını girintili print ile görselleştirip çağrıların hangi sırayla açılıp kapandığını açıklayabilirim.', 'Fibonacci\'nin neden yavaşladığını açıklar, sözlükle ya da lru_cache ile memoization uygularım.', 'İç içe listeleri ve klasör/kategori ağaçlarını özyinelemeyle gezebilirim.', 'RecursionError\'ın sebebini bilir, özyineleme ile döngü arasında gerekçeyle seçim yaparım.'],
  body: `
<h2>Kendine benzeyen problemler</h2>
<p>Anadolu Market'in ürün kategorilerini düşün: "Elektronik" altında "Telefon", onun altında "Akıllı telefon" ve "Aksesuar", aksesuarın altında "Kılıf" ve "Şarj aleti". Kaç katman olduğu belli değil; yarın bir katman daha eklenebilir. Kategori ağacındaki toplam ürün sayısını nasıl hesaplarsın? İç içe kaç döngü yazacağını bilemezsin.</p>
<p>Ama şu cümle her katman için doğrudur: "Bir kategorinin ürün sayısı, kendi ürünleri artı her alt kategorinin ürün sayısıdır." Cümlenin içinde aynı soru, daha küçük bir parça için tekrar soruluyor. İşte <b>özyineleme</b> (recursion) budur: bir fonksiyonun, problemi daha küçük bir parçası için <b>kendini çağırması</b>. Klasör ağaçları, organizasyon şemaları, iç içe yorum dizileri, JSON belgeleri, matematikteki faktöriyel ve fibonacci hep bu yapıdadır.</p>

<h2>İki zorunlu parça</h2>
<p>Her özyinelemeli fonksiyonun iki parçası vardır:</p>
<ul>
<li><b>Temel durum</b> (base case): cevabı doğrudan bilinen, kendini çağırmayan en küçük durum. Olmazsa fonksiyon sonsuza dek kendini çağırır.</li>
<li><b>Özyinelemeli adım</b> (recursive step): problemi <b>küçültüp</b> kendini çağıran ve gelen cevabı kullanarak sonucu kuran kısım. Her çağrı temel duruma biraz daha yaklaşmalı.</li>
</ul>
<pre class="py">def geri_say(n):
    if n == 0:                 # temel durum
        print("Kampanya başladı!")
        return
    print(n)
    geri_say(n - 1)            # özyinelemeli adım: n küçülüyor

geri_say(3)

def faktoriyel(n):
    if n &lt;= 1:                 # temel durum: 0! = 1! = 1
        return 1
    return n * faktoriyel(n - 1)

print(faktoriyel(5))
print(faktoriyel(0))</pre>
<p>Faktöriyelin matematiksel tanımı zaten özyinelemelidir: <code>n! = n × (n-1)!</code> ve <code>0! = 1</code>. Kod bu tanımın neredeyse birebir kopyası. Özyinelemeyi tasarlarken kendine iki soru sor: "En küçük, cevabını doğrudan bildiğim durum ne?" ve "Bir küçüğünün cevabını bilseydim, bunun cevabını nasıl kurardım?" İkinci soruda <b>küçüğün cevabının doğru geleceğine güvenirsin</b>; buna "özyinelemeli inanç sıçraması" (recursive leap of faith) denir.</p>

<h2>Çağrı yığınını görmek</h2>
<p>Bir fonksiyon çağrıldığında Python onun yerel değişkenlerini bir <b>çerçeve</b> (frame) içinde tutar ve çerçeveyi <b>çağrı yığınının</b> (call stack) tepesine koyar. Fonksiyon dönünce çerçeve yığından kalkar. Özyinelemede aynı fonksiyonun birçok çerçevesi aynı anda yığında bekler; her birinin kendi <code>n</code>'i vardır. Bunu görmenin en iyi yolu, derinliği bir parametreyle taşıyıp girintili yazdırmaktır.</p>
<pre class="py">def faktoriyel_iz(n, derinlik=0):
    girinti = "    " * derinlik
    print(f"{girinti}faktoriyel({n}) çağrıldı")
    if n &lt;= 1:
        print(f"{girinti}temel durum → 1")
        return 1
    alt = faktoriyel_iz(n - 1, derinlik + 1)
    sonuc = n * alt
    print(f"{girinti}faktoriyel({n}) = {n} × {alt} = {sonuc}")
    return sonuc

faktoriyel_iz(4)</pre>
<p>Çıktıda iki aşama görürsün: <b>iniş</b> sırasında çağrılar açılır ve hiçbiri henüz bitmemiştir (çarpma bekliyor); temel duruma varınca <b>çıkış</b> başlar ve her çerçeve, alttan gelen cevapla kendi çarpmasını yapıp yukarıya döner. Özyinelemeli adımdan <b>sonra</b> yazılan kod çıkış sırasında, yani ters sırayla çalışır.</p>
<div class="tip"><b>Hata ayıklama alışkanlığı</b>Özyinelemeli bir fonksiyon beklediğin sonucu vermiyorsa, ilk iş bu örnekteki gibi bir <code>derinlik</code> parametresi ekleyip giriş ve çıkışı girintili yazdır. Ağacın hangi dalında yanlış değer üretildiği hemen görünür.</div>

<h2>Liste üzerinde özyineleme</h2>
<p>Listeler de doğal olarak özyinelemelidir: bir liste, "ilk eleman" ile "geri kalan liste"den oluşur. Boş liste temel durumdur.</p>
<pre class="py">def toplam(liste):
    if not liste:                          # boş liste
        return 0
    return liste[0] + toplam(liste[1:])

def ters(metin):
    if len(metin) &lt;= 1:
        return metin
    return ters(metin[1:]) + metin[0]

print(toplam([120, 80, 45.5]))
print(ters("Anadolu"))</pre>
<p>Bu örnekler kavramı öğretmek içindir; gerçek kodda <code>sum</code> ve <code>[::-1]</code> kullanırsın. Ayrıca <code>liste[1:]</code> her çağrıda yeni bir kopya oluşturur; uzun listelerde hem yavaş hem de yığın derinliği sınırına takılır. Özyinelemenin asıl gücü, düz listelerde değil, <b>derinliği bilinmeyen</b> yapılarda ortaya çıkar.</p>

<h2>İç içe liste: derinliği bilinmeyen yapı</h2>
<p>Bir depo sayım listesi, raflar içinde kutular, kutular içinde paketler olarak iç içe gelmiş olsun. Kaç katman olduğunu bilmeden tüm adetleri toplamak döngüyle zordur; özyinelemeyle doğaldır: her eleman ya bir sayıdır (temel durum) ya da yine bir listedir (özyinelemeli adım).</p>
<pre class="py">depo = [12, [3, 4, [10, 2]], [], [[[7]]], 1]

def ic_ice_toplam(veri):
    toplam = 0
    for x in veri:
        if isinstance(x, list):
            toplam += ic_ice_toplam(x)     # alt liste: aynı soruyu sor
        else:
            toplam += x                    # sayı: doğrudan ekle
    return toplam

def derinlik(veri):
    if not isinstance(veri, list):
        return 0
    en = 0
    for x in veri:
        en = max(en, derinlik(x))
    return 1 + en

print(ic_ice_toplam(depo))
print(derinlik(depo))</pre>
<p>Burada döngü ve özyineleme birlikte çalışıyor: döngü bir katmandaki <b>kardeşleri</b> gezer, özyineleme bir katman <b>aşağı</b> iner. Ağaç gezen fonksiyonların çoğu bu şekildedir. Temel durum ayrı bir <code>if</code> olarak değil, "liste değilse doğrudan ekle" dalı olarak gizlenmiştir.</p>

<h2>Klasör ağacı gezmek</h2>
<p>Dosya sistemi en tanıdık ağaçtır. Gerçek diske dokunmadan iç içe sözlükle simüle edelim: değer bir sayıysa dosya (boyutu KB), sözlükse klasördür.</p>
<pre class="py">disk = {
    "raporlar": {
        "2025": {"ocak.csv": 120, "subat.csv": 135},
        "ozet.pdf": 900,
    },
    "gorseller": {"logo.png": 48, "kampanya": {"banner.png": 310}},
    "notlar.txt": 4,
}

def toplam_boyut(klasor):
    toplam = 0
    for ad, icerik in klasor.items():
        if isinstance(icerik, dict):
            toplam += toplam_boyut(icerik)
        else:
            toplam += icerik
    return toplam

def agac_yazdir(klasor, derinlik=0):
    for ad, icerik in klasor.items():
        girinti = "  " * derinlik
        if isinstance(icerik, dict):
            print(f"{girinti}{ad}/  ({toplam_boyut(icerik)} KB)")
            agac_yazdir(icerik, derinlik + 1)
        else:
            print(f"{girinti}{ad}  {icerik} KB")

agac_yazdir(disk)
print("Toplam:", toplam_boyut(disk), "KB")</pre>
<p>Gerçek diskte aynı mantığı <code>pathlib.Path.iterdir()</code> ve <code>is_dir()</code> ile kurarsın; Python'un <code>os.walk</code> fonksiyonu da içeride tam olarak bu gezintiyi yapar.</p>

<h2>Fibonacci ve memoization</h2>
<p>Fibonacci dizisinde her sayı önceki ikisinin toplamıdır: 0, 1, 1, 2, 3, 5, 8, ... Tanımı özyinelemelidir ve koda doğrudan çevrilir. Ama bir sorun var: her çağrı <b>iki</b> çağrı daha yapar ve aynı değerler tekrar tekrar hesaplanır.</p>
<pre class="py">cagri = 0

def fib(n):
    global cagri
    cagri += 1
    if n &lt; 2:
        return n
    return fib(n - 1) + fib(n - 2)

for n in [10, 20, 25]:
    cagri = 0
    print(f"fib({n}) = {fib(n)}, çağrı sayısı: {cagri}")</pre>
<p>fib(25) için iki yüz binden fazla çağrı yapılıyor; fib(40) yüz milyonları bulur. Çare: bir kez hesapladığın sonucu bir sözlükte saklayıp tekrar istendiğinde oradan vermek. Bu tekniğe <b>memoization</b> (ezberleme) denir.</p>
<pre class="py">def fib_memo(n, memo=None):
    if memo is None:
        memo = {}
    if n &lt; 2:
        return n
    if n in memo:
        return memo[n]
    memo[n] = fib_memo(n - 1, memo) + fib_memo(n - 2, memo)
    return memo[n]

print(fib_memo(80))

from functools import lru_cache

@lru_cache(maxsize=None)
def fib_cache(n):
    if n &lt; 2:
        return n
    return fib_cache(n - 1) + fib_cache(n - 2)

print(fib_cache(80))
print(fib_cache.cache_info())</pre>
<p><code>memo=None</code> ile başlayıp içeride sözlük oluşturmamızın sebebi, Fonksiyonlar dersindeki değişebilir varsayılan tuzağıdır. <code>@lru_cache</code> ise aynı işi otomatik yapan hazır bir araçtır; başındaki <code>@</code> işaretiyle yazılan yapıya dekoratör denir ve Orta seviyede ayrıntılı göreceksin. Ezberleme yalnızca aynı argümanla aynı sonucu veren (saf) fonksiyonlarda güvenlidir.</p>

<h2>İkili arama: özyinelemeli</h2>
<p>Sıralı bir listede arama yaparken her adımda ortadaki elemana bakıp aramayı yarıya indirebilirsin: aranan değer ortadakinden küçükse sol yarıda, büyükse sağ yarıda ara. "Yarıda ara" aynı problemin küçüğüdür; temel durum, aralığın boşalmasıdır.</p>
<pre class="py">def ikili_ara(liste, hedef, bas=0, son=None):
    if son is None:
        son = len(liste) - 1
    if bas &gt; son:                       # aralık boş: yok
        return -1
    orta = (bas + son) // 2
    print(f"  aralık [{bas}, {son}], orta={orta} ({liste[orta]})")
    if liste[orta] == hedef:
        return orta
    if hedef &lt; liste[orta]:
        return ikili_ara(liste, hedef, bas, orta - 1)
    return ikili_ara(liste, hedef, orta + 1, son)

musteri_nolari = [101, 115, 220, 318, 402, 517, 640, 777, 812, 905]
print("Sonuç:", ikili_ara(musteri_nolari, 640))
print("Sonuç:", ikili_ara(musteri_nolari, 300))</pre>
<p>On elemanlı listede en fazla dört adım; bir milyon elemanda yaklaşık yirmi adım. Doğrusal arama bir milyon adım sürebilirdi. Her çağrıda listeyi dilimlemek yerine <code>bas</code> ve <code>son</code> indekslerini taşıdığımıza dikkat et; böylece kopya oluşturmayız.</p>

<h2>RecursionError ve yığın sınırı</h2>
<p>Yığın sonsuz değildir. Python, çok derin özyinelemeyi bir koruma sınırıyla durdurur ve <code>RecursionError</code> fırlatır. Sınır varsayılan olarak yaklaşık 1000 çerçevedir.</p>
<pre class="py">import sys
print("Sınır:", sys.getrecursionlimit())

def sonsuz(n):
    return sonsuz(n + 1)               # temel durum yok!

try:
    sonsuz(0)
except RecursionError as e:
    print("Hata:", e)

def toplam(liste):
    return 0 if not liste else liste[0] + toplam(liste[1:])

try:
    print(toplam(list(range(5000))))
except RecursionError:
    print("5000 elemanlı listede özyinelemeli toplam sınırı aştı")</pre>
<div class="warn"><b>Sınırı yükseltmek çözüm değildir</b><code>sys.setrecursionlimit(100000)</code> yazmak mümkündür ama gerçek yığın belleği tükenirse Python hata mesajı bile veremeden çökebilir. RecursionError genelde iki şeyden birini söyler: ya temel durum eksik/ulaşılamaz (hata), ya da problem bu derinlik için döngüyle çözülmelidir. Python, bazı dillerdeki gibi kuyruk çağrısı eniyilemesi (tail call optimization) yapmaz; özyinelemenin derinliği her zaman yığında yer kaplar.</div>

<h2>Döngü mü, özyineleme mi?</h2>
<div class="tbl-wrap"><table>
<tr><th>Durum</th><th>Tercih</th><th>Neden</th></tr>
<tr><td>Düz liste, sayaç, toplam, arama</td><td>Döngü</td><td>Daha hızlı, yığın sınırı yok, okunur</td></tr>
<tr><td>Derinliği bilinmeyen ağaç (klasör, kategori, JSON)</td><td>Özyineleme</td><td>Yapının tanımıyla aynı şekilde yazılır</td></tr>
<tr><td>Böl ve yönet (ikili arama, birleştirerek sıralama)</td><td>Özyineleme (ya da döngü)</td><td>Derinlik log n, sınır sorun olmaz</td></tr>
<tr><td>Çok derin zincir (on binlerce adım)</td><td>Döngü + yığın listesi</td><td>RecursionError riski</td></tr>
<tr><td>Tüm kombinasyonları deneme (sepet seçenekleri)</td><td>Özyineleme</td><td>"Al ya da alma" kararı doğal olarak dallanır</td></tr>
</table></div>
<div class="note"><b>Gerçek işte</b>Bir backend geliştiricisi özyinelemeyi en çok ağaç biçimli veride kullanır: e-ticaret sitesinin kategori menüsünü oluşturmak, bir yorumun tüm yanıt zincirini göstermek, organizasyon şemasında bir yöneticinin altındaki tüm çalışanları bulmak, bilinmeyen derinlikteki bir JSON yanıtında belirli bir anahtarı aramak, bir klasördeki tüm faturaları toplamak. Veri analistleri ise memoization fikrini sık kullanır: pahalı bir hesap ya da sorgu sonucunu önbelleğe almak, raporun dakikalar yerine saniyeler içinde çıkmasını sağlar.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Özyinelemeyi döngüye çevirmek: açık yığın</h3>
<p>Her özyineleme, Python'un çağrı yığınının işini senin yöneteceğin bir listeyle (açık yığın, explicit stack) yapılabilir. Böylece derinlik sınırı ortadan kalkar. Klasör boyutunu yığınla hesaplayalım:</p>
<pre class="py">disk = {"a": {"b": {"c.txt": 5}, "d.txt": 7}, "e.txt": 1}

def toplam_boyut_yigin(kok):
    toplam = 0
    yigin = [kok]
    while yigin:
        klasor = yigin.pop()
        for icerik in klasor.values():
            if isinstance(icerik, dict):
                yigin.append(icerik)       # sonra gezilecek
            else:
                toplam += icerik
    return toplam

print(toplam_boyut_yigin(disk))</pre>
<p><code>pop()</code> sondan alırsa derinlik öncelikli (depth-first), <code>pop(0)</code> ya da <code>collections.deque.popleft()</code> baştan alırsa genişlik öncelikli (breadth-first) gezinti olur. Graf algoritmalarının temeli bu iki gezintidir.</p>
<h3>Böl ve yönet</h3>
<p>Birleştirerek sıralama (merge sort) listeyi ikiye böler, her yarıyı özyinelemeyle sıralar, sonra iki sıralı yarıyı birleştirir. Derinlik yalnızca log n olduğundan bir milyon elemanda bile yirmi katmanı geçmez. Python'un <code>sorted</code> fonksiyonu (Timsort) bu fikrin geliştirilmiş bir hâlini kullanır.</p>
<h3>Özyinelemeli düşünmenin kontrol listesi</h3>
<ol>
<li>Temel durum(lar) her olası girdi için gerçekten ulaşılabilir mi? (Negatif sayı, boş liste, boş sözlük)</li>
<li>Her çağrı problemi küçültüyor mu?</li>
<li>Özyinelemeli çağrının <b>dönüş değerini kullanıyor musun</b>? (En sık hata: çağırıp sonucu atmak)</li>
<li>Aynı alt problemler tekrar tekrar mı çözülüyor? Öyleyse memoization.</li>
<li>Derinlik binleri bulabilir mi? Öyleyse açık yığınla döngü.</li>
</ol>
</section>
`,
  ex: [
    { t: 'mc',
      stage: 'Isınma',
      q: 'Özyinelemeli bir fonksiyonda temel durum (base case) hiç yazılmazsa ne olur?',
      o: ['Python fonksiyonu otomatik olarak döngüye çevirir', 'Fonksiyon kendini durmadan çağırır ve RecursionError oluşur', 'Fonksiyon None döndürüp sessizce biter', 'SyntaxError verir, kod hiç çalışmaz'],
      a: 1,
      why: 'Temel durum olmadan her çağrı yeni bir çağrı yapar; yığın yaklaşık 1000 çerçevelik sınıra ulaşınca Python RecursionError fırlatır. Söz dizimi açısından kod geçerlidir, bu yüzden SyntaxError oluşmaz.' },
    { t: 'mc',
      stage: 'Isınma',
      q: 'Naif <code>fib(n) = fib(n-1) + fib(n-2)</code> neden büyük n için çok yavaştır?',
      o: ['Büyük sayıları toplamak her adımda daha fazla bellek ve zaman istediği için', 'Aynı alt değerler tekrar tekrar hesaplanır, çağrı sayısı üstel büyür', 'Python özyinelemeli fonksiyonları her çağrıda yeniden derlediği için', 'Her çağrı bir önceki çağrının listesini baştan kopyaladığı için'],
      a: 1,
      why: 'Her çağrı iki çağrı daha yapar ve fib(n-2) gibi değerler ağacın farklı dallarında defalarca yeniden hesaplanır. Memoization her değeri bir kez hesaplayarak çağrı sayısını doğrusal düzeye indirir.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Bu kod ne yazdırır?',
      code: 'def f(n):\n    if n == 0:\n        return 0\n    return n + f(n - 1)\n\nprint(f(4))\n',
      o: ['4', '10', '24', '0'],
      a: 1,
      why: 'f(4) = 4 + f(3) = 4 + 3 + f(2) = 4 + 3 + 2 + 1 + f(0) = 10. 24 faktöriyel (çarpım) olurdu; 0 temel durumun kendisidir.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Çağrı yığınının iniş ve çıkışı: bu kod ne yazdırır?',
      code: 'def g(n):\n    if n == 0:\n        return\n    print("giriş", n)\n    g(n - 1)\n    print("çıkış", n)\n\ng(2)\n',
      o: ['giriş 2\nçıkış 2\ngiriş 1\nçıkış 1', 'giriş 2\ngiriş 1\nçıkış 2\nçıkış 1', 'giriş 2\ngiriş 1\nçıkış 1\nçıkış 2', 'giriş 1\ngiriş 2\nçıkış 2\nçıkış 1'],
      a: 2,
      why: 'Özyinelemeli çağrıdan önceki print iniş sırasında (2, 1), sonraki print çıkış sırasında ters sırayla (1, 2) çalışır. g(1) tamamen bitmeden g(2)\'nin "çıkış" satırına geçilmez.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Bu kod çalıştırılınca ne olur?',
      code: 'def bakiye_hesapla(ay):\n    if ay == 0:\n        return 1000\n    return bakiye_hesapla(ay - 2) * 1.02\n\nprint(bakiye_hesapla(5))\n',
      o: ['1104.08 yazdırır', 'RecursionError hatası verir', '1061.21 yazdırır', 'ValueError hatası verir'],
      a: 1,
      raises: true,
      why: 'ay 5, 3, 1, -1, -3 ... diye ikişer azalır ve hiçbir zaman tam 0 olmaz; temel duruma ulaşılamaz. Güvenli temel durum if ay <= 0 olurdu.' },
    { t: 'order',
      stage: 'Kodu oku',
      q: '<p>İç içe listedeki tüm sayıları sayan (kaç tane sayı olduğunu bulan) özyinelemeli fonksiyonun satırlarını sırala.</p>',
      lines: ['def say(veri):', '    adet = 0', '    for x in veri:', '        if isinstance(x, list):', '            adet += say(x)', '        else:', '            adet += 1', '    return adet', 'print(say([1, [2, 3, [4]], [], 5]))'],
      expect: '5\n',
      hint: 'Sayaç döngüden önce başlar; döngü içinde alt liste için özyinelemeli çağrının sonucu eklenir, sayı için 1 eklenir; return döngüden sonra.',
      why: 'Döngü bir katmandaki elemanları gezer, alt listeler için aynı fonksiyon bir katman aşağı iner ve kendi sayısını döndürür; bu sonuç üst katmandaki sayaca eklenir.' },
    { id: 'ozyineleme-1',
      t: 'code',
      stage: 'Rehberli',
      diff: 1,
      q: '<p><code>basamak_toplami(n)</code> fonksiyonunu <b>özyinelemeyle</b> yaz: negatif olmayan bir tam sayının basamaklarının toplamını döndürsün. Örnek: <code>basamak_toplami(4071)</code> → 12. (Anadolu Bank hesap numarası kontrol hanesi hesaplarında bu tür işlemler kullanılır.) Döngü ve <code>str</code> dönüşümü kullanma.</p>',
      guide: ['Temel durumu yaz: n tek basamaklıysa (n < 10) n\'nin kendisini döndür.', 'Son basamağı n % 10 ile al.', 'Geri kalan sayıyı n // 10 ile elde et.', 'Son basamak + basamak_toplami(geri kalan) döndür.'],
      example: 'def basamak_sayisi(n):\n    if n < 10:\n        return 1\n    return 1 + basamak_sayisi(n // 10)\n\nprint(basamak_sayisi(4071), basamak_sayisi(7))\n',
      start: 'def basamak_toplami(n):\n    # TODO: temel durum (tek basamak)\n    # TODO: son basamak + kalan sayının basamak toplamı\n    pass\n',
      sol: 'def basamak_toplami(n):\n    if n < 10:\n        return n\n    return n % 10 + basamak_toplami(n // 10)\n',
      tests: 'assert basamak_toplami(4071) == 12, "4 + 0 + 7 + 1 = 12"\nassert basamak_toplami(7) == 7, "tek basamaklı sayı temel durumdur, kendisini döndürür"\nassert basamak_toplami(0) == 0, "0 için 0"\nassert basamak_toplami(99999) == 45, "99999 için 45"\nassert "for " not in __source__ and "while " not in __source__ and "str(" not in __source__, "döngü ve str kullanmadan özyinelemeyle çöz"\n',
      hints: ['n % 10 son basamağı, n // 10 son basamağı atılmış sayıyı verir.', 'Temel durum: if n < 10: return n', 'return n % 10 + basamak_toplami(n // 10)'],
      why: 'Her çağrı sayıdan bir basamak atar, böylece tek basamağa (temel duruma) mutlaka ulaşılır; dönüşte basamaklar toplanır.' },
    { id: 'ozyineleme-2',
      t: 'code',
      stage: 'Rehberli',
      diff: 2,
      q: '<p>Depo sayım verisi rastgele derinlikte iç içe listeler olarak geliyor. <code>ic_ice_toplam(veri)</code> fonksiyonunu yaz: tüm sayıları (int ya da float) toplasın; alt listelere özyinelemeyle insin. Metin gibi sayı olmayan elemanları yok saysın.</p>',
      guide: ['Toplamı 0 ile başlat ve elemanları döngüyle gez.', 'Eleman bir listeyse ic_ice_toplam(eleman) sonucunu toplama ekle.', 'Eleman int ya da float ise doğrudan ekle (isinstance(x, (int, float))).', 'Diğer her şeyi atla ve döngüden sonra toplamı döndür.'],
      example: 'def metinleri_say(veri):\n    adet = 0\n    for x in veri:\n        if isinstance(x, list):\n            adet += metinleri_say(x)\n        elif isinstance(x, str):\n            adet += 1\n    return adet\n\nprint(metinleri_say(["a", [1, "b", ["c"]], 2]))\n',
      start: 'def ic_ice_toplam(veri):\n    toplam = 0\n    for x in veri:\n        # TODO: liste ise özyinelemeli çağrının sonucunu ekle\n        # TODO: sayı ise doğrudan ekle\n        pass\n    return toplam\n',
      sol: 'def ic_ice_toplam(veri):\n    toplam = 0\n    for x in veri:\n        if isinstance(x, list):\n            toplam += ic_ice_toplam(x)\n        elif isinstance(x, (int, float)):\n            toplam += x\n    return toplam\n',
      tests: 'assert ic_ice_toplam([12, [3, 4, [10, 2]], [], [[[7]]], 1]) == 39, "tüm katmanlardaki sayıların toplamı 39"\nassert ic_ice_toplam([]) == 0, "boş liste 0"\nassert ic_ice_toplam([[[]]]) == 0, "yalnız boş listeler 0"\nassert ic_ice_toplam([1.5, ["raf-A", [2.5]], "not"]) == 4.0, "metinler yok sayılmalı, ondalıklılar toplanmalı"\n',
      hints: ['Döngü kardeşleri gezer, özyineleme bir katman aşağı iner.', 'isinstance(x, list) ile alt listeyi tanı.', 'toplam += ic_ice_toplam(x) satırında dönüş değerini mutlaka kullan.'],
      why: 'Her alt liste aynı problemin küçük bir örneğidir; fonksiyon onun toplamını hesaplayıp döndürür ve üst katman bu sonucu kendi toplamına ekler.' },
    { id: 'ozyineleme-3',
      t: 'code',
      stage: 'Rehberli',
      diff: 2,
      q: '<p>İç içe sözlükle simüle edilen bir dosya sisteminde, değer sayıysa dosya (KB), sözlükse klasördür. <code>dosya_sayisi(klasor)</code> fonksiyonunu yaz: tüm alt klasörlerdekiler dahil toplam <b>dosya</b> sayısını döndürsün (klasörler sayılmaz).</p>',
      guide: ['Sayacı 0 ile başlat.', 'klasor.values() ile içerikleri gez.', 'İçerik bir sözlükse dosya_sayisi(icerik) sonucunu ekle.', 'Değilse (dosya) 1 ekle.', 'Sayacı döndür.'],
      example: 'def klasor_sayisi(klasor):\n    adet = 0\n    for icerik in klasor.values():\n        if isinstance(icerik, dict):\n            adet += 1 + klasor_sayisi(icerik)\n    return adet\n\nprint(klasor_sayisi({"a": {"b": {}, "x.txt": 1}, "c": {}}))\n',
      start: 'def dosya_sayisi(klasor):\n    adet = 0\n    for ad, icerik in klasor.items():\n        # TODO: alt klasörse özyinele, dosyaysa 1 ekle\n        pass\n    return adet\n',
      sol: 'def dosya_sayisi(klasor):\n    adet = 0\n    for ad, icerik in klasor.items():\n        if isinstance(icerik, dict):\n            adet += dosya_sayisi(icerik)\n        else:\n            adet += 1\n    return adet\n',
      tests: 'disk = {"raporlar": {"2025": {"ocak.csv": 120, "subat.csv": 135}, "ozet.pdf": 900}, "gorseller": {"logo.png": 48, "kampanya": {"banner.png": 310}}, "notlar.txt": 4}\nassert dosya_sayisi(disk) == 6, f"6 dosya var; gelen {dosya_sayisi(disk)}"\nassert dosya_sayisi({}) == 0, "boş klasörde 0 dosya"\nassert dosya_sayisi({"bos": {}, "daha_bos": {"x": {}}}) == 0, "yalnız boş klasörler 0"\nassert dosya_sayisi({"a.txt": 0}) == 1, "boyutu 0 olan dosya da dosyadır"\n',
      hints: ['Klasör = sözlük, dosya = sayı.', 'isinstance(icerik, dict) ise adet += dosya_sayisi(icerik)', 'else: adet += 1'],
      why: 'Klasör ağacı kendine benzer bir yapıdır: bir klasörün dosya sayısı, doğrudan dosyaları ile alt klasörlerinin dosya sayılarının toplamıdır.' },
    { id: 'ozyineleme-4',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p><code>fib(n, memo=None)</code> fonksiyonunu özyineleme ve sözlükle memoization kullanarak yaz (<code>fib(0) = 0</code>, <code>fib(1) = 1</code>). <code>fib(90)</code> anında hesaplanabilmeli. Değişebilir varsayılan tuzağına düşme: <code>memo={}</code> yerine <code>None</code> ile başla. (lru_cache kullanma; tekniği elle kur.)</p>',
      start: 'def fib(n, memo=None):\n    pass\n',
      sol: 'def fib(n, memo=None):\n    if memo is None:\n        memo = {}\n    if n < 2:\n        return n\n    if n in memo:\n        return memo[n]\n    memo[n] = fib(n - 1, memo) + fib(n - 2, memo)\n    return memo[n]\n',
      tests: 'assert [fib(i) for i in range(8)] == [0, 1, 1, 2, 3, 5, 8, 13], "ilk sekiz değer 0, 1, 1, 2, 3, 5, 8, 13 olmalı"\nassert fib(90) == 2880067194370816120, "fib(90) memoization ile anında hesaplanmalı"\nassert "lru_cache" not in __source__ and "cache" not in __source__.replace("memo", ""), "lru_cache kullanmadan sözlükle yaz"\nassert "memo={})" not in __source__.replace(" ", ""), "değişebilir varsayılan kullanma; None ile başla"\n',
      hints: ['Önce memo None ise boş sözlük oluştur, sonra temel durum, sonra sözlükte var mı kontrolü.', 'Hesaplanan değeri memo[n] = ... ile sakla ve memo\'yu özyinelemeli çağrılara aktar.'],
      why: 'Her n değeri bir kez hesaplanıp sözlükte saklandığı için çağrı sayısı üstelden doğrusala iner; memo\'yu parametreyle taşımak tüm çağrıların aynı sözlüğü paylaşmasını sağlar.' },
    { id: 'ozyineleme-5',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p><code>ikili_ara(liste, hedef, bas=0, son=None)</code> fonksiyonunu <b>özyinelemeli</b> yaz. <code>liste</code> küçükten büyüğe sıralı müşteri numaralarıdır. Hedef bulunursa indeksini, yoksa <code>-1</code> döndür. Listeyi dilimleme (kopya oluşturma); <code>bas</code> ve <code>son</code> indekslerini taşı.</p>',
      start: 'def ikili_ara(liste, hedef, bas=0, son=None):\n    pass\n',
      sol: 'def ikili_ara(liste, hedef, bas=0, son=None):\n    if son is None:\n        son = len(liste) - 1\n    if bas > son:\n        return -1\n    orta = (bas + son) // 2\n    if liste[orta] == hedef:\n        return orta\n    if hedef < liste[orta]:\n        return ikili_ara(liste, hedef, bas, orta - 1)\n    return ikili_ara(liste, hedef, orta + 1, son)\n',
      tests: 'nolar = [101, 115, 220, 318, 402, 517, 640, 777, 812, 905]\nfor i, n in enumerate(nolar):\n    assert ikili_ara(nolar, n) == i, f"{n} indeks {i}\'de bulunmalı"\nassert ikili_ara(nolar, 300) == -1, "olmayan numara -1"\nassert ikili_ara(nolar, 1) == -1 and ikili_ara(nolar, 9999) == -1, "aralık dışı değerler -1"\nassert ikili_ara([], 5) == -1, "boş liste -1"\nbuyuk = list(range(0, 2_000_000, 2))\nassert ikili_ara(buyuk, 1_234_566) == 617_283, "büyük listede de hızlı ve doğru çalışmalı"\nassert __source__.count("ikili_ara(") >= 2, "fonksiyon kendini çağırmalı (özyinelemeli)"\nassert "while" not in __source__, "döngü değil özyineleme kullan"\n',
      hints: ['Temel durum: bas > son ise aralık boştur, -1 döndür.', 'Ortadaki değerle karşılaştır; küçükse (bas, orta - 1), büyükse (orta + 1, son) aralığında kendini çağır ve sonucu return et.'],
      why: 'Her çağrı aralığı yarıya indirir; bir milyon elemanda en fazla yaklaşık 20 çağrı olduğundan yığın sınırına yaklaşılmaz. İndeks taşımak kopya maliyetini ortadan kaldırır.' },
    { id: 'ozyineleme-6',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p>İK departmanı organizasyon şemasını iç içe sözlük olarak tutuyor: her çalışan <code>{"ad": ..., "unvan": ..., "ekip": [alt çalışanlar]}</code>. <code>sema_yazdir(calisan, derinlik=0)</code> fonksiyonunu yaz: her çalışanı derinlik başına 4 boşluk girintiyle <code>Ad (Unvan)</code> biçiminde yazdırsın, sonra ekibini aynı şekilde bir derinlik fazla girintiyle yazdırsın. <code>"ekip"</code> anahtarı olmayabilir. Program sonunda verilen <code>sirket</code> ile çağır.</p><pre class="out">Ayşe (Genel Müdür)\n    Mehmet (Satış Direktörü)\n        Can (Bölge Müdürü)\n        Ece (Bölge Müdürü)\n    Zeynep (BT Direktörü)\n        Deniz (Yazılımcı)</pre>',
      start: 'sirket = {"ad": "Ayşe", "unvan": "Genel Müdür", "ekip": [\n    {"ad": "Mehmet", "unvan": "Satış Direktörü", "ekip": [\n        {"ad": "Can", "unvan": "Bölge Müdürü"},\n        {"ad": "Ece", "unvan": "Bölge Müdürü", "ekip": []},\n    ]},\n    {"ad": "Zeynep", "unvan": "BT Direktörü", "ekip": [\n        {"ad": "Deniz", "unvan": "Yazılımcı"},\n    ]},\n]}\n\ndef sema_yazdir(calisan, derinlik=0):\n    pass\n\nsema_yazdir(sirket)\n',
      sol: 'sirket = {"ad": "Ayşe", "unvan": "Genel Müdür", "ekip": [\n    {"ad": "Mehmet", "unvan": "Satış Direktörü", "ekip": [\n        {"ad": "Can", "unvan": "Bölge Müdürü"},\n        {"ad": "Ece", "unvan": "Bölge Müdürü", "ekip": []},\n    ]},\n    {"ad": "Zeynep", "unvan": "BT Direktörü", "ekip": [\n        {"ad": "Deniz", "unvan": "Yazılımcı"},\n    ]},\n]}\n\ndef sema_yazdir(calisan, derinlik=0):\n    print("    " * derinlik + f"{calisan[\'ad\']} ({calisan[\'unvan\']})")\n    for alt in calisan.get("ekip", []):\n        sema_yazdir(alt, derinlik + 1)\n\nsema_yazdir(sirket)\n',
      expect: 'Ayşe (Genel Müdür)\n    Mehmet (Satış Direktörü)\n        Can (Bölge Müdürü)\n        Ece (Bölge Müdürü)\n    Zeynep (BT Direktörü)\n        Deniz (Yazılımcı)\n',
      hints: ['Önce çalışanın kendisini "    " * derinlik girintiyle yazdır.', 'Sonra calisan.get("ekip", []) içindeki her alt çalışan için sema_yazdir(alt, derinlik + 1) çağır. Ekibi boş olan çalışan temel durumdur: döngü hiç çalışmaz.'],
      why: 'Derinlik parametresi çağrı yığınındaki seviyeyi taşır; ekibi olmayan çalışanda döngü çalışmadığı için özyineleme kendiliğinden durur, ayrı bir if gerekmez.' },
    { id: 'ozyineleme-7',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p><code>dosya_bul(klasor, uzanti, yol="")</code> fonksiyonunu yaz. Klasör iç içe sözlüktür (sözlük = klasör, sayı = dosya boyutu). Adı <code>uzanti</code> ile biten tüm dosyaların tam yollarını (<code>"raporlar/2025/ocak.csv"</code> gibi, ayraç <code>/</code>) sözlükteki gezinme sırasıyla bir liste olarak döndürsün.</p>',
      start: 'def dosya_bul(klasor, uzanti, yol=""):\n    pass\n',
      sol: 'def dosya_bul(klasor, uzanti, yol=""):\n    bulunan = []\n    for ad, icerik in klasor.items():\n        tam = yol + "/" + ad if yol else ad\n        if isinstance(icerik, dict):\n            bulunan.extend(dosya_bul(icerik, uzanti, tam))\n        elif ad.endswith(uzanti):\n            bulunan.append(tam)\n    return bulunan\n',
      tests: 'disk = {"raporlar": {"2025": {"ocak.csv": 120, "subat.csv": 135, "grafik.png": 40}, "ozet.pdf": 900}, "gorseller": {"logo.png": 48, "kampanya": {"banner.png": 310}}, "liste.csv": 4}\nassert dosya_bul(disk, ".csv") == ["raporlar/2025/ocak.csv", "raporlar/2025/subat.csv", "liste.csv"], f"csv yolları hatalı: {dosya_bul(disk, \'.csv\')}"\nassert dosya_bul(disk, ".png") == ["raporlar/2025/grafik.png", "gorseller/logo.png", "gorseller/kampanya/banner.png"], "png dosyaları tam yollarıyla gelmeli"\nassert dosya_bul(disk, ".exe") == [], "eşleşme yoksa boş liste"\nassert dosya_bul({}, ".csv") == [], "boş klasör"\n',
      hints: ['Yolu parametreyle aşağı taşı: alt klasör çağrısına yol + "/" + ad ver (en üstte başında / olmamalı).', 'Alt klasörden dönen listeyi extend ile kendi listene ekle.'],
      why: 'Yol bilgisi iniş sırasında parametreyle taşınır, bulunan dosyalar çıkış sırasında listelerle yukarı toplanır; bu iki yönlü akış ağaç gezen fonksiyonların temel kalıbıdır.' },
    { id: 'ozyineleme-8',
      t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      diff: 1,
      q: '<p>Hatayı bul ve düzelt. <code>taksit_secenekleri(n)</code> n taksitli bir alışverişte kampanya kodu için n! (faktöriyel) hesaplıyor. <code>taksit_secenekleri(5)</code> doğru çalışıyor ama tek çekim (0 taksit) gönderilince sistem çöküyor.</p>',
      start: 'def taksit_secenekleri(n):\n    if n == 1:\n        return 1\n    return n * taksit_secenekleri(n - 1)\n',
      sol: 'def taksit_secenekleri(n):\n    if n <= 1:\n        return 1\n    return n * taksit_secenekleri(n - 1)\n',
      tests: 'assert taksit_secenekleri(5) == 120, "5! = 120"\nassert taksit_secenekleri(1) == 1, "1! = 1"\ntry:\n    sonuc = taksit_secenekleri(0)\nexcept RecursionError:\n    raise AssertionError("0 için temel duruma hiç ulaşılmıyor (0, -1, -2, ...): temel durumu n <= 1 yap")\nassert sonuc == 1, "0! = 1 olmalı"\n',
      hints: ['n = 0 ile başlayınca çağrılar 0, -1, -2 diye iner; n == 1 hiç gerçekleşmez.', 'Temel durumu tüm küçük girdileri kapsayacak şekilde genişlet: n <= 1.'],
      why: 'Temel durum her olası girdi için ulaşılabilir olmalı. Eşitlik (==) yerine aralık (<=) kontrolü, beklenmeyen başlangıç değerlerinde de özyinelemeyi durdurur.' },
    { id: 'ozyineleme-9',
      t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      diff: 2,
      q: '<p>Hatayı bul ve düzelt. <code>en_derin(kategori)</code> bir kategori ağacının derinliğini döndürmeli: alt kategorisi olmayan kategori 1, bir katman alt kategorisi olan 2, ... Fonksiyon hata vermiyor ama her ağaç için 1 döndürüyor.</p>',
      start: 'def en_derin(kategori):\n    en = 0\n    for alt in kategori.get("alt", []):\n        en_derin(alt)\n        en = max(en, 1)\n    return 1 + en\n',
      sol: 'def en_derin(kategori):\n    en = 0\n    for alt in kategori.get("alt", []):\n        en = max(en, en_derin(alt))\n    return 1 + en\n',
      tests: 'yaprak = {"ad": "Kılıf"}\nassert en_derin(yaprak) == 1, "alt kategorisi olmayan kategori derinliği 1"\nagac = {"ad": "Elektronik", "alt": [\n    {"ad": "Telefon", "alt": [{"ad": "Aksesuar", "alt": [{"ad": "Kılıf"}, {"ad": "Şarj"}]}, {"ad": "Akıllı"}]},\n    {"ad": "TV"},\n]}\nassert en_derin(agac) == 4, f"Elektronik > Telefon > Aksesuar > Kılıf: derinlik 4; gelen {en_derin(agac)}"\nassert en_derin({"ad": "A", "alt": [{"ad": "B"}]}) == 2, "tek katman alt kategori: 2"\n',
      hints: ['Özyinelemeli çağrının dönüş değeri nereye gidiyor?', 'Alt ağacın derinliğini kullan: en = max(en, en_derin(alt))'],
      why: 'Özyinelemeli çağrıyı yapıp sonucunu kullanmamak en sık hatadır: alt ağaçlar hesaplanır ama cevap çöpe gider. Dönüş değeri üst katmanın hesabına katılmalıdır.' },
    { id: 'ozyineleme-10',
      t: 'code',
      stage: 'Meydan okuma',
      diff: 3,
      q: '<p>Anadolu Market "hediye çeki" kampanyası: müşteri çekinin tutarını <b>tam olarak</b> harcamak istiyor. <code>tam_sepetler(urunler, butce)</code> fonksiyonunu özyinelemeyle yaz: <code>urunler</code> <code>(ad, fiyat)</code> listesidir; her ürün en fazla bir kez seçilebilir. Fiyat toplamı tam <code>butce</code> olan tüm ürün kombinasyonlarını, her biri ürün adlarının listede geçtiği sırayla bir liste olacak şekilde döndür. Kombinasyonların sırası: her adımda ürünü <b>almayı</b> önce dene, sonra <b>almamayı</b>.</p><p>Örnek: <code>[("çay", 50), ("kahve", 100), ("kupa", 50)]</code>, bütçe 100 → <code>[["çay", "kupa"], ["kahve"]]</code></p>',
      start: 'def tam_sepetler(urunler, butce):\n    pass\n',
      sol: 'def tam_sepetler(urunler, butce, i=0, secilen=None):\n    if secilen is None:\n        secilen = []\n    if butce == 0:\n        return [secilen[:]]\n    if butce < 0 or i == len(urunler):\n        return []\n    ad, fiyat = urunler[i]\n    secilen.append(ad)\n    alinan = tam_sepetler(urunler, butce - fiyat, i + 1, secilen)\n    secilen.pop()\n    alinmayan = tam_sepetler(urunler, butce, i + 1, secilen)\n    return alinan + alinmayan\n',
      tests: 'u = [("çay", 50), ("kahve", 100), ("kupa", 50)]\nassert tam_sepetler(u, 100) == [["çay", "kupa"], ["kahve"]], f"örnekteki sonuç bekleniyordu; gelen {tam_sepetler(u, 100)}"\nassert tam_sepetler(u, 200) == [["çay", "kahve", "kupa"]], "tüm ürünler tam 200"\nassert tam_sepetler(u, 30) == [], "hiçbir kombinasyon 30 etmiyor"\nassert tam_sepetler(u, 0) == [[]], "bütçe 0 ise tek çözüm boş sepettir"\nassert tam_sepetler([], 50) == [], "ürün yoksa çözüm yok"\nv = [("a", 10), ("b", 20), ("c", 30), ("d", 40), ("e", 50)]\nr = tam_sepetler(v, 60)\nassert r == [["a", "b", "c"], ["a", "e"], ["b", "d"]], f"al/alma sırası korunmalı; gelen {r}"\nassert tam_sepetler(u, 100) == [["çay", "kupa"], ["kahve"]], "art arda çağrılar birbirini etkilememeli (değişebilir varsayılan tuzağı)"\n',
      hints: ['Her ürün için iki dal var: al (bütçeden düş, sonraki ürüne geç) ya da alma (bütçe aynı, sonraki ürüne geç).', 'Temel durumlar: bütçe 0 → bir çözüm bulundu; bütçe negatif ya da ürün kalmadı → çözüm yok.', 'İndeks (i) ve o ana kadar seçilenleri ek parametrelerle taşı; seçilen listesini kopyalayarak sonuca ekle ve dönüşte pop ile geri al (geri izleme, backtracking).'],
      why: '"Al ya da alma" kararı her üründe ikiye dallanan bir ağaç kurar; temel durumlar bu ağacın yapraklarıdır. Seçilen listesini ekle-çalıştır-geri al kalıbıyla yönetmek geri izleme (backtracking) tekniğidir; sonuca eklerken kopya almak, sonraki değişikliklerin çözümü bozmasını önler.' },
    { id: 'ozyineleme-11',
      t: 'code',
      stage: 'Mini proje',
      diff: 3,
      q: '<p>Anadolu Market kategori ağacı için üç özyinelemeli fonksiyon yaz. Her düğüm <code>{"ad": ..., "urunler": [fiyatlar], "alt": [alt düğümler]}</code> biçimindedir; <code>"urunler"</code> ve <code>"alt"</code> anahtarları olmayabilir.</p><ul><li><code>urun_sayisi(dugum)</code>: düğüm ve tüm alt kategorilerdeki toplam ürün sayısı.</li><li><code>en_pahali(dugum)</code>: ağaçtaki en yüksek fiyat; hiç ürün yoksa <code>None</code>.</li><li><code>yol_bul(dugum, ad)</code>: kökten adı verilen kategoriye kadar kategori adlarının listesi (ör. <code>["Elektronik", "Telefon", "Aksesuar"]</code>); bulunamazsa <code>None</code>.</li></ul>',
      start: 'agac = {"ad": "Elektronik", "urunler": [15000], "alt": [\n    {"ad": "Telefon", "urunler": [32000, 18500], "alt": [\n        {"ad": "Aksesuar", "urunler": [250, 400, 650]},\n        {"ad": "Akıllı saat", "urunler": [], "alt": []},\n    ]},\n    {"ad": "Bilgisayar", "alt": [{"ad": "Dizüstü", "urunler": [45000]}]},\n]}\n\ndef urun_sayisi(dugum):\n    # TODO\n    pass\n\ndef en_pahali(dugum):\n    # TODO\n    pass\n\ndef yol_bul(dugum, ad):\n    # TODO\n    pass\n',
      sol: 'agac = {"ad": "Elektronik", "urunler": [15000], "alt": [\n    {"ad": "Telefon", "urunler": [32000, 18500], "alt": [\n        {"ad": "Aksesuar", "urunler": [250, 400, 650]},\n        {"ad": "Akıllı saat", "urunler": [], "alt": []},\n    ]},\n    {"ad": "Bilgisayar", "alt": [{"ad": "Dizüstü", "urunler": [45000]}]},\n]}\n\ndef urun_sayisi(dugum):\n    adet = len(dugum.get("urunler", []))\n    for alt in dugum.get("alt", []):\n        adet += urun_sayisi(alt)\n    return adet\n\ndef en_pahali(dugum):\n    en = None\n    for f in dugum.get("urunler", []):\n        if en is None or f > en:\n            en = f\n    for alt in dugum.get("alt", []):\n        alt_en = en_pahali(alt)\n        if alt_en is not None and (en is None or alt_en > en):\n            en = alt_en\n    return en\n\ndef yol_bul(dugum, ad):\n    if dugum["ad"] == ad:\n        return [dugum["ad"]]\n    for alt in dugum.get("alt", []):\n        yol = yol_bul(alt, ad)\n        if yol is not None:\n            return [dugum["ad"]] + yol\n    return None\n',
      tests: 'assert urun_sayisi(agac) == 7, f"toplam 7 ürün (1 + 2 + 3 + 0 + 0 + 1); gelen {urun_sayisi(agac)}"\nassert urun_sayisi({"ad": "Boş"}) == 0, "anahtarları olmayan düğümde 0"\nassert en_pahali(agac) == 45000, "en pahalı ürün Dizüstü altında 45000"\nassert en_pahali({"ad": "Boş", "alt": [{"ad": "Daha boş"}]}) is None, "hiç ürün yoksa None"\nassert en_pahali(agac["alt"][0]) == 32000, "Telefon alt ağacında en pahalı 32000"\nassert yol_bul(agac, "Aksesuar") == ["Elektronik", "Telefon", "Aksesuar"], f"Aksesuar yolu hatalı: {yol_bul(agac, \'Aksesuar\')}"\nassert yol_bul(agac, "Dizüstü") == ["Elektronik", "Bilgisayar", "Dizüstü"], "Dizüstü yolu"\nassert yol_bul(agac, "Elektronik") == ["Elektronik"], "kökün yolu yalnız kendisi"\nassert yol_bul(agac, "Mobilya") is None, "bulunamayan kategori None"\n',
      hints: ['Üç fonksiyonun da iskeleti aynı: kendi düğümünü işle, sonra dugum.get("alt", []) içindeki her alt düğüm için kendini çağır ve sonucu birleştir.', 'en_pahali\'de alt ağaçtan None gelebilir; karşılaştırmadan önce kontrol et.', 'yol_bul\'da bir alt ağaçtan None olmayan bir yol gelirse başına kendi adını ekleyip hemen döndür.'],
      why: 'Ağaç üzerindeki hemen her soru aynı kalıpla çözülür: düğümün kendi katkısı + alt ağaçların özyinelemeli cevaplarının birleşimi. Birleştirme işlemi soruya göre değişir: toplama, en büyük seçme ya da ilk bulunan yolu öne ekleyerek yukarı taşıma.' }
  ],
  faq: [
    { q: 'Özyineleme döngüden daha mı yavaş?',
      a: 'Python\'da genellikle evet: her çağrı bir çerçeve oluşturur ve bunun maliyeti vardır. Düz listelerde döngü tercih edilir. Ama ağaç gibi yapılarda özyineleme hem daha kısa hem daha az hataya açıktır; hız farkı çoğu iş için önemsizdir.' },
    { q: 'Recursion limit\'i yükseltmek güvenli mi?',
      a: 'sys.setrecursionlimit ile yükseltebilirsin ama gerçek yığın belleği tükenirse yorumlayıcı hata mesajı vermeden çökebilir. Derinlik binleri buluyorsa açık yığınlı döngüye geçmek daha sağlıklıdır.' },
    { q: 'Memoization ile önbellek (cache) aynı şey mi?',
      a: 'Memoization, bir fonksiyonun sonuçlarını argümanlarına göre saklayan özel bir önbellekleme türüdür. Genel önbellek kavramı daha geniştir: veritabanı sorgusu, web yanıtı, dosya içeriği gibi her pahalı sonucu kapsar.' },
    { q: 'Her özyinelemeli fonksiyon döngüyle yazılabilir mi?',
      a: 'Evet. En kötü ihtimalle çağrı yığınının işini kendi listenle (açık yığın) yaparsın. Bazen sonuç çok daha uzun ve karışık olur; bu yüzden ağaç ve geri izleme problemlerinde özyineleme tercih edilir.' }
  ],
  mistakes: [
    { why: 'fakt(0) ya da negatif girdide n == 1 hiç gerçekleşmez ve RecursionError oluşur.',
      bad: 'def fakt(n):\n    if n == 1:\n        return 1\n    return n * fakt(n - 1)',
      good: 'def fakt(n):\n    if n <= 1:\n        return 1\n    return n * fakt(n - 1)' },
    { why: 'Özyinelemeli çağrının dönüş değeri kullanılmazsa alt ağacın cevabı kaybolur.',
      bad: 'for alt in dugum["alt"]:\n    derinlik(alt)',
      good: 'for alt in dugum["alt"]:\n    en = max(en, derinlik(alt))' },
    { why: 'Değişebilir varsayılan tüm çağrılar arasında paylaşılır; beklenmedik sonuçlar ve bellek sızıntısı yaratabilir.',
      bad: 'def fib(n, memo={}):\n    ...',
      good: 'def fib(n, memo=None):\n    if memo is None:\n        memo = {}' },
    { why: 'Boş liste temel durumu yoksa sonunda liste[0] IndexError verir.',
      bad: 'def toplam(liste):\n    return liste[0] + toplam(liste[1:])',
      good: 'def toplam(liste):\n    if not liste:\n        return 0\n    return liste[0] + toplam(liste[1:])' },
    { why: 'Geri izlemede seçilen listesi sonra değişir; kopya almazsan kaydettiğin çözümler de bozulur.',
      bad: 'sonuclar.append(secilen)',
      good: 'sonuclar.append(secilen[:])' }
  ] }
);
})(window);
/* PythonPatika — Hata ayıklama (debugging) — temel / Dosya ve Hata */
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push(
{ id: 'hata-ayiklama',
  lv: 'temel',
  mod: 'Dosya ve Hata',
  min: 35,
  title: 'Hata ayıklama (debugging)',
  sum: 'Traceback\'i alttan yukarı okur, print ve f"{x=}" ile izler, assert ile varsayımları denetler, pdb ve VS Code ile adım adım ilerler, sorunu küçültüp doğru soruyu sorarak hatayı yöntemle bulursun.',
  goals: [
    'Traceback\'i alttan yukarı okuyup hatanın türünü ve yerini bulabilirim.',
    'Sözdizimi, çalışma zamanı ve mantık hatalarını ayırt edebilirim.',
    'print, f"{x=}", assert ve breakpoint()/pdb ile kodun gerçekte ne yaptığını izleyebilirim.',
    'Sorunu minimal bir örneğe küçültüp arama motoruna ya da yapay zekâya doğru soruyu sorabilirim.',
    'Off-by-one, döngü içi return, değişebilir varsayılan, gölgeleme gibi klasik böcekleri tanıyıp düzeltebilirim.'
  ],
  body: `
<h2>Neden önemli?</h2>
<p>Anadolu Market'in gece çalışan ciro raporu bu sabah İzmir için 0 TL gösterdi. Program hata vermedi, sadece yanlış sonuç üretti. Ekipte biri "dün çalışıyordu" dedi, bir başkası kodu baştan yazmayı önerdi. Deneyimli geliştirici ise şunu yaptı: hatayı tekrar üretti, veriyi küçülttü, iki <code>print</code> ekledi ve on dakikada sorunun bir sözlük anahtarındaki tek harf olduğunu buldu. Hata ayıklama (debugging), yazılımcının günlük işinin belki de yarısıdır ve şansa değil <b>yönteme</b> dayanır. Bu derste o yöntemi öğreneceksin.</p>
<p><code>try/except</code> ile hatayı yakalamayı ve kendi hatanı fırlatmayı "Hatalar ve istisnalar" dersinde gördün. Burada amaç farklı: hatanın <b>nedenini</b> bulmak ve düzeltmek.</p>

<h2>Üç hata ailesi</h2>
<div class="tbl-wrap"><table>
<tr><th>Aile</th><th>Ne zaman ortaya çıkar?</th><th>Örnek</th><th>Belirti</th></tr>
<tr><td>Sözdizimi hatası (syntax error)</td><td>Kod daha çalışmadan, derlenirken</td><td>Kapanmamış parantez, eksik iki nokta, yanlış girinti</td><td>Program hiç başlamaz; <code>SyntaxError</code>, <code>IndentationError</code></td></tr>
<tr><td>Çalışma zamanı hatası (runtime error, exception)</td><td>Kod çalışırken, o satıra gelince</td><td>Sıfıra bölme, olmayan anahtar, yanlış tür</td><td>Traceback ile durur: <code>ZeroDivisionError</code>, <code>KeyError</code>, <code>TypeError</code></td></tr>
<tr><td>Mantık hatası (logic error)</td><td>Hiçbir zaman "patlamaz"</td><td>Yanlış aralık, yanlış koşul, yanlış formül</td><td>Program sessizce <b>yanlış sonuç</b> verir</td></tr>
</table></div>
<p>En tehlikelisi sonuncusudur: kimse fark etmezse yanlış rakam yönetim raporuna kadar gider. Sözdizimi ve çalışma zamanı hataları ise aslında dosttur; sana tam olarak nerede durduklarını söylerler.</p>

<h2>Traceback'i alttan yukarı oku</h2>
<p>Python bir istisna fırlattığında geriye dönük iz (traceback) yazdırır. Yeni başlayanlar en üstten okumaya başlar ve kaybolur. Doğru sıra tam tersidir:</p>
<pre class="out">Traceback (most recent call last):
  File "gunluk_rapor.py", line 12, in &lt;module&gt;
    print(sehir_ozeti(siparisler))
  File "gunluk_rapor.py", line 7, in sehir_ozeti
    toplam[s["sehir"]] += s["tutar"]
KeyError: 'İzmir'</pre>
<div class="steps-list"><ol>
<li><b>En alt satır:</b> hata türü ve mesajı. <code>KeyError: 'İzmir'</code> → sözlükte "İzmir" anahtarı yok.</li>
<li><b>Hemen üstündeki File satırı:</b> hatanın gerçekleştiği yer. 7. satır, <code>sehir_ozeti</code> fonksiyonu.</li>
<li><b>Kod satırı:</b> <code>toplam[s["sehir"]] += s["tutar"]</code>. <code>+=</code> önce okur; anahtar ilk kez geliyorsa okuma başarısız olur.</li>
<li><b>Yukarı çık:</b> bu fonksiyonu kim çağırdı? 12. satır. Üst satırlar "buraya nasıl gelindi" hikâyesidir.</li>
</ol></div>
<p>"most recent call last" ifadesi zaten ipucunu verir: en son çağrı en alttadır. Kütüphane kodunun içinde biten bir traceback'te, alttan yukarı çıkarken <b>kendi dosyanın</b> ilk satırını ara; hata çoğunlukla oraya senin verdiğin bir değerden kaynaklanır.</p>
<pre class="py">siparisler = [
    {"sehir": "İzmir", "tutar": 300},
    {"sehir": "Ankara", "tutar": 150},
    {"sehir": "İzmir", "tutar": 120},
]

def sehir_ozeti(siparisler):
    toplam = {}
    for s in siparisler:
        # Hatalı hâli: toplam[s["sehir"]] += s["tutar"]
        toplam[s["sehir"]] = toplam.get(s["sehir"], 0) + s["tutar"]
    return toplam

print(sehir_ozeti(siparisler))</pre>

<h2>Hata türüne göre ilk bakılacak yer</h2>
<div class="tbl-wrap"><table>
<tr><th>Hata</th><th>Genelde ne demek?</th><th>İlk bakacağın yer</th></tr>
<tr><td><code>SyntaxError</code></td><td>Python cümleyi anlayamadı</td><td>Gösterilen satır <b>ve bir üstü</b>: kapanmamış parantez/tırnak, eksik <code>:</code></td></tr>
<tr><td><code>IndentationError</code></td><td>Girinti tutarsız</td><td>Sekme/boşluk karışımı, blok sonrası boş gövde</td></tr>
<tr><td><code>NameError</code></td><td>Bu ad tanımlı değil</td><td>Yazım hatası, tanımdan önce kullanım, yanlış kapsam</td></tr>
<tr><td><code>TypeError</code></td><td>Bu türle bu işlem olmaz</td><td><code>input()</code>'tan gelen metin, <code>None</code> dönen fonksiyon, eksik argüman</td></tr>
<tr><td><code>ValueError</code></td><td>Tür doğru, değer uygunsuz</td><td><code>int("12,5")</code> gibi dönüşümler, veri temizliği</td></tr>
<tr><td><code>KeyError</code></td><td>Sözlükte bu anahtar yok</td><td>Anahtarın yazımı, büyük-küçük harf, Türkçe karakter</td></tr>
<tr><td><code>IndexError</code></td><td>Liste bu kadar uzun değil</td><td><code>range</code> sınırları, boş liste, off-by-one</td></tr>
<tr><td><code>AttributeError</code></td><td>Bu nesnede bu nitelik yok</td><td>Değişken beklediğin türde değil (çoğu zaman <code>None</code>)</td></tr>
<tr><td><code>ZeroDivisionError</code></td><td>Sıfıra bölme</td><td>Boş listede ortalama, sıfır adet</td></tr>
</table></div>

<h2>print ile izleme ve f"{x=}" kalıbı</h2>
<p>En eski ve hâlâ en hızlı araç: şüphelendiğin yere değerleri yazdırmak. Python 3.8'den beri f-string içinde <code>=</code> kullanırsan hem ifadeyi hem değerini yazar; etiketi elle yazma derdi biter.</p>
<pre class="py">def kargo_ucreti(agirlik_kg, sehir):
    taban = 40
    ek = (agirlik_kg - 1) * 12 if agirlik_kg &gt; 1 else 0
    uzak = sehir in ("Van", "Hakkari")
    print(f"{agirlik_kg=} {ek=} {uzak=}")      # geçici izleme satırı
    ucret = taban + ek + (25 if uzak else 0)
    print(f"{ucret=}  {ucret / agirlik_kg=:.2f}")
    return ucret

kargo_ucreti(3, "Van")
kargo_ucreti(0.5, "İzmir")</pre>
<div class="tip"><b>İzleme satırını işaretle</b>Geçici <code>print</code> satırlarının sonuna <code># DEBUG</code> yaz; iş bitince hepsini tek aramayla bul ve sil. Kalıcı izleme gerekiyorsa <code>print</code> değil <code>logging</code> kullanılır (orta seviyede göreceksin).</div>

<h2>assert ile varsayım kontrolü</h2>
<p>Her kodun içinde söylenmemiş varsayımlar vardır: "liste boş olmaz", "indirim oranı 0 ile 1 arasındadır". <code>assert koşul, "mesaj"</code> bu varsayımı yazıya döker; koşul yanlışsa <code>AssertionError</code> fırlatır. Böylece hata, yanlış değerin <b>doğduğu yerde</b> yakalanır, üç fonksiyon sonra değil.</p>
<pre class="py">def indirim_uygula(fiyat, oran):
    assert 0 &lt;= oran &lt;= 1, f"oran 0-1 arasında olmalı, gelen: {oran}"
    yeni = fiyat * (1 - oran)
    assert yeni &lt;= fiyat, "indirimli fiyat eskisinden büyük olamaz"
    return round(yeni, 2)

print(indirim_uygula(200, 0.15))
try:
    print(indirim_uygula(200, 15))      # yüzde yerine 15 verildi
except AssertionError as hata:
    print("Yakalandı:", hata)</pre>
<div class="warn"><b>assert kullanıcı girdisi için değildir</b>Python <code>-O</code> seçeneğiyle çalıştırılınca tüm assert satırları atlanır. Kullanıcıdan ya da dosyadan gelen veriyi doğrulamak için <code>if</code> + <code>raise ValueError</code> kullan; assert yalnızca "bu asla olmamalı" dediğin programcı varsayımları içindir.</div>

<h2>breakpoint() ve pdb</h2>
<p>print'in yetmediği yerde hata ayıklayıcı (debugger) devreye girer: programı bir satırda durdurur, değişkenlere bakmanı ve satır satır ilerlemeni sağlar. Kodun içine <code>breakpoint()</code> yazman yeterli; Python yerleşik <code>pdb</code> ayıklayıcısını açar.</p>
<pre class="code">def faiz_hesapla(anapara, yillik_oran, ay):
    aylik = yillik_oran / 12
    breakpoint()                 # program burada durur, (Pdb) istemi açılır
    return anapara * (1 + aylik) ** ay

faiz_hesapla(10_000, 0.42, 12)</pre>
<div class="tbl-wrap"><table>
<tr><th>Komut</th><th>Açılımı</th><th>Ne yapar?</th></tr>
<tr><td><code>n</code></td><td>next</td><td>Sonraki satıra geç; fonksiyon çağrısının içine girmez</td></tr>
<tr><td><code>s</code></td><td>step</td><td>Satırda bir fonksiyon çağrısı varsa içine gir</td></tr>
<tr><td><code>c</code></td><td>continue</td><td>Bir sonraki durma noktasına kadar çalış</td></tr>
<tr><td><code>p ifade</code></td><td>print</td><td>Değeri göster: <code>p aylik</code>, <code>p anapara * 2</code></td></tr>
<tr><td><code>l</code></td><td>list</td><td>Bulunduğun yerin çevresindeki kodu göster</td></tr>
<tr><td><code>w</code></td><td>where</td><td>Çağrı yığınını göster (canlı traceback)</td></tr>
<tr><td><code>q</code></td><td>quit</td><td>Ayıklayıcıdan ve programdan çık</td></tr>
</table></div>
<div class="note"><b>Kendi bilgisayarında dene</b>Tarayıcıdaki çalıştırıcı etkileşimli konsol açmadığı için <code>breakpoint()</code>'i burada değil, terminalde dene: <code>python faiz.py</code>. Program çökmüşse <code>python -m pdb faiz.py</code> ile başlatıp hata anında otomatik durdurabilirsin (post-mortem).</div>

<h2>VS Code hata ayıklayıcısı</h2>
<p>Aynı işi fareyle yapmak istersen VS Code'un Python eklentisi yeterli:</p>
<div class="steps-list"><ol>
<li>Satır numarasının soluna tıkla (ya da <b>F9</b>): kırmızı nokta, yani kesme noktası (breakpoint).</li>
<li><b>F5</b> → "Python File". Program kırmızı noktada durur.</li>
<li>Sol panelde <b>Variables</b> tüm yerel değişkenleri gösterir; <b>Watch</b>'a ifade ekleyip izleyebilirsin.</li>
<li><b>F10</b> step over (n), <b>F11</b> step into (s), <b>Shift+F11</b> fonksiyondan çık, <b>F5</b> devam (c).</li>
<li>Kesme noktasına sağ tıklayıp <b>koşullu</b> yapabilirsin: <code>s["sehir"] == "İzmir"</code>. Bin kayıtlık döngüde yalnızca ilgilendiğin kayıtta durur.</li>
<li><b>Debug Console</b>'da durduğun andaki değişkenlerle Python ifadesi çalıştırabilirsin.</li>
</ol></div>

<h2>Sorunu küçült: minimal örnek</h2>
<p>Elinde 50 bin satırlık sipariş dosyası ve bir yerde patlayan bir rapor var. Gözle aramak yerine sorunu üreten en küçük girdiyi bul. Önce hatayı üreten kaydı otomatik yakala, sonra yalnızca o kayıtla çalış:</p>
<pre class="py">kayitlar = [
    {"no": "AM-1", "tutar": "120.5"},
    {"no": "AM-2", "tutar": "89"},
    {"no": "AM-3", "tutar": "1.250,00"},     # Türkçe biçim: float'a çevrilmez
    {"no": "AM-4", "tutar": "40"},
]

for i, k in enumerate(kayitlar):
    try:
        float(k["tutar"])
    except ValueError as hata:
        print(f"{i=} {k['no']=} -&gt; {hata}")
        break</pre>
<p>Artık sorun "rapor çalışmıyor" değil, "<code>float("1.250,00")</code> ValueError veriyor". Bu cümleyle düzeltme yapmak, aramak ve soru sormak çok kolaydır. Minimal örneğin kuralları: hatayı hâlâ üretsin, bunun dışında her şey silinsin, başkası kopyalayıp çalıştırabilsin.</p>

<h2>Rubber duck: sesli anlat</h2>
<p>Masaya bir lastik ördek koy ve kodunu ona satır satır anlat: "Burada listeyi geziyorum, burada toplamı artırıyorum, burada döndürüyorum..." Çoğu zaman cümlenin ortasında "dur, return döngünün içinde" dersin. Yöntemin adı komik ama işe yarar, çünkü sesli anlatmak seni varsaydığın şeyi değil, <b>kodun gerçekten yaptığını</b> okumaya zorlar.</p>

<h2>Hata mesajını aramak ve yapay zekâya sormak</h2>
<p>Hata mesajının <b>genel kısmını</b> ara, sana özel kısmını çıkar: <code>"TypeError: unsupported operand type(s) for +: 'int' and 'str'"</code> iyi bir aramadır; dosya adların ve değişken adların değildir. Yapay zekâya ya da bir foruma sorarken şu beşini ver:</p>
<ol>
<li><b>Ne yapmaya çalışıyorsun?</b> (bir cümle iş hedefi)</li>
<li><b>Minimal kod</b> (çalıştırılabilir, gizli bilgi ve müşteri verisi içermeyen)</li>
<li><b>Tam hata mesajı</b> (traceback'in tamamı, ekran görüntüsü değil metin)</li>
<li><b>Beklenen ve gelen sonuç</b></li>
<li><b>Denediklerin</b> ve Python sürümün</li>
</ol>
<div class="warn"><b>Yapıştırmadan önce düşün</b>Şirket kodu, müşteri adları, IBAN, şifre ve API anahtarları dış bir hizmete gönderilmez. Minimal örnek hazırlamanın bir faydası da budur: gerçek veriyi kurgusal küçük veriyle değiştirirsin. Gelen cevabı da körü körüne yapıştırma; neden çalıştığını anlamadığın düzeltme bir sonraki hatanın tohumudur.</div>

<h2>Klasik böcekler kataloğu</h2>
<div class="tbl-wrap"><table>
<tr><th>Böcek</th><th>Belirti</th><th>Düzeltme</th></tr>
<tr><td>Off-by-one</td><td>Son ya da ilk eleman eksik</td><td><code>range</code> bitişinin hariç olduğunu hatırla</td></tr>
<tr><td>Döngü içinde <code>return</code></td><td>Yalnızca ilk eleman işlenir</td><td><code>return</code>'ü döngü hizasından çıkar</td></tr>
<tr><td><code>==</code> yerine <code>=</code> ya da tersi</td><td>Değer güncellenmez</td><td>Atama <code>=</code>, karşılaştırma <code>==</code></td></tr>
<tr><td>Tamsayı bölme</td><td>Kuruşlar kaybolur</td><td><code>//</code> yerine <code>/</code></td></tr>
<tr><td>Değişebilir varsayılan</td><td>Çağrılar arasında veri sızar</td><td><code>None</code> varsayılanı + içeride yeni liste</td></tr>
<tr><td>Gölgeleme (shadowing)</td><td><code>'int' object is not callable</code></td><td><code>sum</code>, <code>list</code>, <code>max</code> adlarını değişkene verme</td></tr>
<tr><td>Yanlış anahtar</td><td><code>KeyError</code> ya da <code>.get</code> ile sessiz 0</td><td>Anahtarı veriden kopyala</td></tr>
</table></div>

<div class="note"><b>Gerçek işte</b>Profesyonel ekiplerde bir hata bildirimi (bug report) "çalışmıyor" diye açılmaz: adımlar, beklenen, gelen, ortam ve log eklenir. Düzeltmeden önce hatayı yeniden üreten bir test yazılır; test kırmızıyken düzeltilir, yeşile dönünce kod incelemesine gönderilir. Böylece aynı hata bir daha geri gelirse test hemen yakalar. Mülakatlarda da sık sorulur: "Son zamanlarda ayıkladığın zor bir hatayı anlat." İyi cevap, yöntemi anlatan cevaptır.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Bilimsel yöntem olarak hata ayıklama</h3>
<p>Gözlem → hipotez → deney → sonuç. "Sanırım tutar metin olarak geliyor" bir hipotezdir; <code>print(f"{type(tutar)=}")</code> onun deneyidir. Hipotezleri tek tek ele, aynı anda üç şeyi değiştirme; yoksa hangisinin düzelttiğini bilemezsin.</p>
<h3>İkiye bölerek arama</h3>
<p>Kod dün çalışıyordu, bugün çalışmıyorsa aradaki değişikliklerin ortasını dene, sonra kalan yarının ortasını... Git bunu <code>git bisect</code> komutuyla otomatik yapar: yüz commit arasından bozan commit'i yaklaşık yedi denemede bulursun. Aynı fikir veri için de geçerlidir: dosyanın yarısıyla dene, hata hangi yarıdaysa onu böl.</p>
<h3>Heisenbug ve ortam farkları</h3>
<p>Bazı hatalar gözlemlediğinde kaybolur (zamanlama, rastgelelik, önbellek). Rastgelelikte <code>random.seed</code> ile tekrarlanabilir hâle getir; ortam farkında <code>python --version</code>, <code>pip freeze</code> ve işletim sistemini karşılaştır. "Bende çalışıyor" cümlesi bir sonuç değil, bir ipucudur: iki ortam arasında bir fark var demektir.</p>
<h3>Post-mortem</h3>
<p>Uzun süren bir iş gecenin üçünde çöktüyse, interaktif konsolda <code>import pdb; pdb.pm()</code> son istisnanın yığınına girip o anki değişkenleri gösterir. Üretimde ise log ve hata izleme servisleri (Sentry gibi) traceback'i değişken değerleriyle birlikte saklar.</p>
</section>
`,
  ex: [
    { t: 'mc',
      stage: 'Isınma',
      q: 'Uzun bir traceback ile karşılaştın. Hatayı anlamak için <b>ilk</b> hangi satırı okumalısın?',
      o: ['En üstteki "Traceback (most recent call last):" satırını', 'En alttaki hata türü ve mesajı satırını', 'İlk "File ..." satırını', 'En uzun kod satırını'],
      a: 1,
      why: 'En son çağrı en alttadır: hata türü ve mesajı oradadır, hemen üstündeki File satırı hatanın gerçekleştiği yeri gösterir. Üst satırlar oraya nasıl gelindiğinin hikâyesidir.' },
    { t: 'mc',
      stage: 'Isınma',
      q: 'Rapor programı hiç hata vermeden çalışıyor ama İzmir cirosunu her gün 0 TL gösteriyor. Bu hangi hata ailesidir?',
      o: ['Sözdizimi hatası (SyntaxError)', 'Mantık hatası', 'Çalışma zamanı hatası (exception)', 'Girinti hatası (IndentationError)'],
      a: 1,
      why: 'Program durmuyor, traceback yok; yalnızca sonuç yanlış. Bu mantık hatasıdır ve en tehlikelisidir, çünkü kendini belli etmez. Sözdizimi hatası programı hiç başlatmaz, çalışma zamanı hatası traceback ile durdurur.' },
    { t: 'mc',
      stage: 'Isınma',
      q: 'pdb ile durduğun satırda <code>toplam = hesapla(sepet)</code> var ve <code>hesapla</code> fonksiyonunun <b>içine</b> girip satır satır izlemek istiyorsun. Hangi komutu yazarsın?',
      o: ['n (next)', 'c (continue)', 's (step)', 'q (quit)'],
      a: 2,
      why: 's (step) satırdaki çağrının içine girer. n (next) çağrıyı tek adımda çalıştırıp sonraki satıra geçer, c bir sonraki kesme noktasına kadar çalışır, q ayıklayıcıdan çıkar.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'f-string içindeki <code>=</code> kalıbı ne yazdırır?',
      code: 'sepet = [120, 80]\nindirim = 0.25\ntoplam = sum(sepet)\nprint(f"{toplam=}")\nprint(f"{toplam * (1 - indirim)=}")\n',
      o: ['toplam=200\n150.0', 'toplam=200\ntoplam * (1 - indirim)=150.0', '200\n150.0', 'toplam = 200\ntoplam * (1 - indirim) = 150.0'],
      a: 1,
      why: '<code>f"{ifade=}"</code> ifadenin metnini, eşittir işaretini ve değerini yazar; boşluk eklemez (eşittirin çevresine boşluk koyarsan o boşlukları da aynen yazar). Karmaşık ifadelerde de ifade metni olduğu gibi görünür.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Değişebilir varsayılan parametre: bu kod ne yazdırır?',
      code: 'def sepete_ekle(urun, sepet=[]):\n    sepet.append(urun)\n    return sepet\n\na = sepete_ekle("çay")\nb = sepete_ekle("kahve")\nprint(a)\nprint(b)\n',
      o: ['[\'çay\']\n[\'kahve\']', '[\'çay\']\n[\'çay\', \'kahve\']', '[\'çay\', \'kahve\']\n[\'çay\', \'kahve\']', '[\'kahve\']\n[\'kahve\']'],
      a: 2,
      why: 'Varsayılan liste fonksiyon tanımlanırken BİR KEZ oluşturulur ve her çağrıda aynı liste kullanılır. a ve b aynı nesneyi gösterir; bu yüzden ikisi de iki ürünü içerir. Düzeltmesi: <code>sepet=None</code> ve içeride <code>if sepet is None: sepet = []</code>.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Bu kod çalışınca ne olur?',
      code: 'musteri = {"ad": "Ayşe", "sehir": "İzmir"}\nprint("Müşteri:", musteri["ad"])\nprint("Şehir:", musteri["Sehir"])\n',
      raises: true,
      o: ['Müşteri: Ayşe\nŞehir: İzmir', 'İlk satırı yazar, sonra KeyError verir', 'Müşteri: Ayşe\nŞehir: None', 'NameError verir'],
      a: 1,
      why: 'Sözlük anahtarları büyük-küçük harfe duyarlıdır: "sehir" var, "Sehir" yok. Python ilk print\'i çalıştırır, ikincisinde KeyError ile durur. Köşeli parantez None döndürmez; o davranış <code>.get()</code>\'e aittir.' },
    { t: 'order',
      stage: 'Kodu oku',
      q: '<p>Varsayımlarını assert ile kontrol eden <code>ortalama</code> fonksiyonunun satırlarını sırala. Boş liste, bölme yapılmadan <b>önce</b> yakalanmalı.</p>',
      lines: [
        'def ortalama(tutarlar):',
        '    assert tutarlar, "tutarlar boş olamaz"',
        '    sonuc = sum(tutarlar) / len(tutarlar)',
        '    assert min(tutarlar) <= sonuc <= max(tutarlar), "ortalama aralık dışında"',
        '    return sonuc',
        'print(ortalama([100, 200, 300]))'
      ],
      tests: 'hata = None\ntry:\n    ortalama([])\nexcept AssertionError as e:\n    hata = str(e)\nexcept ZeroDivisionError:\n    hata = "sıfıra bölme"\nassert hata == "tutarlar boş olamaz", "Boş liste bölmeden ÖNCE ilk assert ile yakalanmalı; gelen: " + str(hata)\n',
      expect: '200.0\n',
      hint: 'Ön koşul (girdi boş olmamalı) hesaptan önce, son koşul (sonuç aralıkta olmalı) hesaptan sonra gelir.',
      why: 'Ön koşul assert\'i girdiyi, son koşul assert\'i sonucu denetler. İlk assert bölmeden sonra gelseydi boş listede anlamlı mesaj yerine ZeroDivisionError görürdün.' },
    { id: 'hata-ayiklama-r1',
      t: 'code',
      stage: 'Rehberli',
      diff: 2,
      q: '<p>Destek ekibi sana traceback metinlerini yapıştırıyor. <code>traceback_ozeti(metin)</code> fonksiyonunu yaz; şu üç anahtarlı sözlüğü döndürsün:</p><ul><li><code>"tur"</code>: son satırdaki hata türü (ör. <code>"KeyError"</code>)</li><li><code>"mesaj"</code>: ilk <code>": "</code>\'den sonraki kısım; mesaj yoksa <code>""</code></li><li><code>"satir"</code>: metindeki <b>son</b> <code>line N</code> ifadesindeki N (int); hiç yoksa <code>None</code></li></ul>',
      guide: [
        'Metni satırlara böl ve boş satırları at.',
        'Son satırı al: hata türü ve mesaj oradadır.',
        'Son satırı yalnızca ilk ": " noktasından ikiye böl (mesajın içinde de ": " olabilir).',
        're.findall ile tüm "line N" sayılarını bul, sonuncusunu int yap.',
        'Üç değeri sözlükte döndür.'
      ],
      example: 'log = "2026-10-28 09:14 ERROR: disk dolu: /var/log"\nseviye_ve_zaman, mesaj = log.split(": ", 1)\nprint(seviye_ve_zaman.split()[-1], "|", mesaj)\n\nimport re\nmetin = "sayfa 3, sayfa 7, sayfa 12"\nprint(re.findall(r"sayfa (\\d+)", metin)[-1])\n',
      start: 'import re\n\ndef traceback_ozeti(metin):\n    satirlar = [s for s in metin.strip().splitlines() if s.strip()]\n    son = satirlar[-1]\n    # TODO: son satırı ": " noktasından EN FAZLA bir kez böl (tur, mesaj)\n    # TODO: mesaj yoksa mesaj = ""\n    # TODO: re.findall ile "line (sayı)" eşleşmelerini bul, sonuncuyu int yap\n    pass\n',
      sol: 'import re\n\ndef traceback_ozeti(metin):\n    satirlar = [s for s in metin.strip().splitlines() if s.strip()]\n    son = satirlar[-1]\n    if ": " in son:\n        tur, mesaj = son.split(": ", 1)\n    else:\n        tur, mesaj = son, ""\n    numaralar = re.findall(r"line (\\d+)", metin)\n    satir = int(numaralar[-1]) if numaralar else None\n    return {"tur": tur.strip(), "mesaj": mesaj, "satir": satir}\n',
      tests: 'tb = "\\n".join([\n    "Traceback (most recent call last):",\n    \'  File "rapor.py", line 14, in <module>\',\n    "    print(rapor(siparisler))",\n    \'  File "rapor.py", line 9, in rapor\',\n    \'    toplam += s["tutar"]\',\n    "KeyError: \'tutar\'",\n])\no = traceback_ozeti(tb)\nassert isinstance(o, dict), "Fonksiyon bir sözlük döndürmeli"\nassert o["tur"] == "KeyError", "tur KeyError olmalı: hata türü EN ALT satırdadır"\nassert o["mesaj"] == "\'tutar\'", "mesaj \\"\'tutar\'\\" olmalı"\nassert o["satir"] == 9, "satir 9 olmalı: hatanın gerçekleştiği yer EN SONDAKİ line ifadesidir, 14 değil"\ntb2 = "Traceback (most recent call last):\\n  File \\"x.py\\", line 3, in <module>\\nValueError: invalid literal for int() with base 10: \'abc\'"\no2 = traceback_ozeti(tb2)\nassert o2["mesaj"] == "invalid literal for int() with base 10: \'abc\'", "Mesajın içinde de \': \' var; yalnızca İLK \': \' noktasından böl (split(\': \', 1))"\nassert o2["satir"] == 3, "tek line varsa o alınmalı"\ntb3 = "Traceback (most recent call last):\\n  File \\"y.py\\", line 2, in <module>\\nKeyboardInterrupt\\n"\no3 = traceback_ozeti(tb3)\nassert o3["tur"] == "KeyboardInterrupt" and o3["mesaj"] == "", "Mesajsız hatada mesaj boş metin olmalı"\nassert traceback_ozeti("SyntaxError: invalid syntax")["satir"] is None, "line ifadesi yoksa satir None olmalı"\n',
      hints: [
        'Hatanın türü ve mesajı traceback\'in son satırındadır; satır numarası da EN SON "line N" ifadesindedir.',
        'str.split(": ", 1) yalnızca ilk ayırıcıda böler; re.findall(r"line (\\d+)", metin) tüm numaraları liste olarak verir.',
        'numaralar = re.findall(r"line (\\d+)", metin) ve satir = int(numaralar[-1]) if numaralar else None'
      ],
      why: 'Traceback alttan yukarı okunur: son satır "ne oldu", son File satırı "nerede oldu" sorusunu yanıtlar. split(": ", 1) mesajın kendi içindeki iki noktaları korur.' },
    { id: 'hata-ayiklama-r2',
      t: 'code',
      stage: 'Rehberli',
      diff: 1,
      q: '<p>Anadolu Market\'te <code>indirimli_fiyat(fiyat, oran)</code> fonksiyonu yanlış girdilerle sessizce saçma fiyatlar üretiyor. Varsayımları <code>assert</code> ile yaz:</p><ul><li><code>fiyat &gt;= 0</code> değilse mesaj: <code>"fiyat negatif olamaz"</code></li><li><code>0 &lt;= oran &lt;= 1</code> değilse mesaj: <code>"oran 0 ile 1 arasında olmalı"</code></li></ul><p>Sonra <code>round(fiyat * (1 - oran), 2)</code> döndür.</p>',
      guide: [
        'Fonksiyonun ilk satırında fiyat için assert yaz.',
        'İkinci assert ile oranın aralığını denetle (zincirli karşılaştırma kullanabilirsin).',
        'Mesajları görevdeki metinlerle BİREBİR aynı yaz.',
        'Hesabı yap ve yuvarlayıp döndür.'
      ],
      example: 'def stoktan_dus(stok, adet):\n    assert adet > 0, "adet pozitif olmalı"\n    assert adet <= stok, "stok yetersiz"\n    return stok - adet\n\nprint(stoktan_dus(10, 3))\ntry:\n    stoktan_dus(2, 5)\nexcept AssertionError as e:\n    print("Yakalandı:", e)\n',
      start: 'def indirimli_fiyat(fiyat, oran):\n    # TODO: fiyat negatifse "fiyat negatif olamaz" mesajlı assert\n    # TODO: oran 0-1 dışındaysa "oran 0 ile 1 arasında olmalı" mesajlı assert\n    return round(fiyat * (1 - oran), 2)\n',
      sol: 'def indirimli_fiyat(fiyat, oran):\n    assert fiyat >= 0, "fiyat negatif olamaz"\n    assert 0 <= oran <= 1, "oran 0 ile 1 arasında olmalı"\n    return round(fiyat * (1 - oran), 2)\n',
      tests: 'assert indirimli_fiyat(200, 0.15) == 170.0, "200 TL %15 indirimle 170.0 olmalı"\nassert indirimli_fiyat(99.9, 0) == 99.9, "oran 0 ise fiyat aynı kalmalı"\ndef _mesaj(f, o):\n    try:\n        indirimli_fiyat(f, o)\n    except AssertionError as e:\n        return str(e)\n    return None\nassert _mesaj(200, 15) == "oran 0 ile 1 arasında olmalı", "oran=15 (yüzde sanılmış) AssertionError vermeli"\nassert _mesaj(200, -0.1) == "oran 0 ile 1 arasında olmalı", "negatif oran AssertionError vermeli"\nassert _mesaj(-5, 0.1) == "fiyat negatif olamaz", "negatif fiyat AssertionError vermeli"\nassert _mesaj(100, 1) is None, "oran tam 1 (yüzde 100 indirim) geçerli bir sınır değeri"\n',
      hints: [
        'assert koşul, "mesaj" biçimi: koşul False ise mesajla AssertionError fırlar.',
        'Aralık denetimini tek satırda yaz: 0 <= oran <= 1',
        'assert 0 <= oran <= 1, "oran 0 ile 1 arasında olmalı"'
      ],
      why: 'assert, yanlış değeri doğduğu yerde durdurur. oran=15 gibi bir hata, assert olmadan -2800 TL gibi bir fiyat üretip çok sonra fark edilirdi.' },
    { id: 'hata-ayiklama-r3',
      t: 'code',
      stage: 'Rehberli',
      diff: 2,
      q: '<p>Sorunu küçültmenin ilk adımı, hatayı üreten kaydı bulmaktır. <code>ilk_bozuk_kayit(kayitlar, islem)</code> fonksiyonunu yaz: kayıtları sırayla gezsin, her birine <code>islem(kayit)</code> uygulasın; <b>ilk</b> hata veren kayıt için <code>(indeks, hata_turu_adi)</code> demetini döndürsün (ör. <code>(2, "ValueError")</code>). Hiçbiri hata vermezse <code>None</code> döndürsün.</p>',
      guide: [
        'enumerate ile hem indeksi hem kaydı al.',
        'islem(kayit) çağrısını try bloğuna koy.',
        'except Exception as e ile yakala; hata türünün adı type(e).__name__ ile alınır.',
        'İlk hatada hemen döndür; döngü biterse None döndür.'
      ],
      example: 'degerler = ["10", "x", "30"]\nfor i, d in enumerate(degerler):\n    try:\n        int(d)\n    except Exception as e:\n        print(i, type(e).__name__, e)\n',
      start: 'def ilk_bozuk_kayit(kayitlar, islem):\n    for i, kayit in enumerate(kayitlar):\n        # TODO: islem(kayit) çağrısını try içine al\n        # TODO: hata olursa (i, hata türünün adı) döndür\n        pass\n    return None\n',
      sol: 'def ilk_bozuk_kayit(kayitlar, islem):\n    for i, kayit in enumerate(kayitlar):\n        try:\n            islem(kayit)\n        except Exception as e:\n            return i, type(e).__name__\n    return None\n',
      tests: 'assert ilk_bozuk_kayit(["120", "85.5", "1.250,00", "x"], float) == (2, "ValueError"), "float(\\"1.250,00\\") ValueError verir: sonuç (2, \\"ValueError\\") olmalı (ilk bozuk kayıt)"\nsiparisler = [{"tutar": 10, "adet": 2}, {"tutar": 5}, {"adet": 1}]\nassert ilk_bozuk_kayit(siparisler, lambda s: s["tutar"] * s["adet"]) == (1, "KeyError"), "1. kayıtta adet yok: (1, \\"KeyError\\") beklenir"\nassert ilk_bozuk_kayit([4, 2, 1], lambda x: 10 / x) is None, "Hiç hata yoksa None döndürmeli"\nassert ilk_bozuk_kayit([], float) is None, "Boş listede None döndürmeli"\nassert ilk_bozuk_kayit([1, 0, "a"], lambda x: 10 / x) == (1, "ZeroDivisionError"), "Sıfıra bölme de yakalanmalı"\n',
      hints: [
        'Hata yakalamak için try/except, indeks için enumerate kullan.',
        'Hata türünün adı: type(e).__name__',
        'except Exception as e:\n    return i, type(e).__name__'
      ],
      why: 'Elli bin kayıtlık bir dosyada sorunu gözle aramak yerine ilk bozuk kaydı otomatik buldun. Artık hatayı o tek kayıtla, yani minimal örnekle inceleyebilirsin.' },
    { id: 'hata-ayiklama-k1',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p>Üç hata ailesini otomatik ayırt et. <code>hata_sinifi(kod)</code> fonksiyonu Python kodunu metin olarak alsın ve şunu döndürsün:</p><ul><li>Kod derlenemiyorsa (SyntaxError, IndentationError dahil) <code>"sözdizimi"</code></li><li>Derleniyor ama çalışırken istisna fırlatıyorsa <code>"çalışma zamanı"</code></li><li>Sorunsuz çalışıyorsa <code>"çalıştı"</code></li></ul><p>İpucu: <code>compile(kod, "&lt;kod&gt;", "exec")</code> derler, <code>exec(derlenmis, {})</code> boş bir ad alanında çalıştırır.</p>',
      start: 'def hata_sinifi(kod):\n    pass\n',
      sol: 'def hata_sinifi(kod):\n    try:\n        derlenmis = compile(kod, "<kod>", "exec")\n    except SyntaxError:\n        return "sözdizimi"\n    try:\n        exec(derlenmis, {})\n    except Exception:\n        return "çalışma zamanı"\n    return "çalıştı"\n',
      tests: 'assert hata_sinifi("x = (1, 2") == "sözdizimi", "Kapanmamış parantez sözdizimi hatasıdır"\nassert hata_sinifi("if True:\\nx = 1") == "sözdizimi", "IndentationError, SyntaxError\\\'un alt sınıfıdır: sözdizimi"\nassert hata_sinifi("d = {}\\nd[\\"a\\"]") == "çalışma zamanı", "Olmayan anahtar çalışırken KeyError verir"\nassert hata_sinifi("x = 1 / 0") == "çalışma zamanı", "Sıfıra bölme çalışma zamanı hatasıdır"\nassert hata_sinifi("x = 2\\ny = x * 3") == "çalıştı", "Hatasız kod çalıştı olmalı"\nassert hata_sinifi("ortalama = sum([1, 2]) // 2") == "çalıştı", "Mantık hatası (// ile kuruş kaybı) otomatik yakalanamaz: kod çalışır"\n',
      hints: [
        'İki ayrı try bloğu kullan: biri derleme, biri çalıştırma için.',
        'IndentationError, SyntaxError\'un alt sınıfıdır; except SyntaxError ikisini de yakalar.'
      ],
      why: 'Derleme aşaması sözdizimini, çalıştırma aşaması çalışma zamanı hatalarını ortaya çıkarır. Son test önemli bir dersi gösterir: mantık hatası hiçbir aşamada "patlamaz"; onu ancak beklenen sonucu denetleyen testler yakalar.' },
    { id: 'hata-ayiklama-k2',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 1,
      q: '<p>İyi soru, yarı cevaptır. <code>soru_sablonu(hedef, kod, hata, beklenen, denenenler, surum="3.12")</code> fonksiyonu, yapay zekâya ya da foruma sorulacak metni şu biçimde döndürsün (satırlar <code>"\\n"</code> ile birleşir):</p><pre class="out">Hedef: {hedef}\nPython: {surum}\nKod:\n{kod}\nHata:\n{hata}\nBeklenen: {beklenen}\nDenediklerim:\n- {1. deneme}\n- {2. deneme}</pre><p><code>kod</code> ve <code>hata</code>\'nın sonundaki boşluk/satır sonları kırpılsın (<code>rstrip</code>). <code>denenenler</code> boş listeyse tek satır <code>- (henüz bir şey denemedim)</code> yazılsın.</p>',
      start: 'def soru_sablonu(hedef, kod, hata, beklenen, denenenler, surum="3.12"):\n    pass\n',
      sol: 'def soru_sablonu(hedef, kod, hata, beklenen, denenenler, surum="3.12"):\n    satirlar = [\n        f"Hedef: {hedef}",\n        f"Python: {surum}",\n        "Kod:",\n        kod.rstrip(),\n        "Hata:",\n        hata.rstrip(),\n        f"Beklenen: {beklenen}",\n        "Denediklerim:",\n    ]\n    if denenenler:\n        for d in denenenler:\n            satirlar.append(f"- {d}")\n    else:\n        satirlar.append("- (henüz bir şey denemedim)")\n    return "\\n".join(satirlar)\n',
      tests: 's = soru_sablonu("Şehre göre ciro toplamak", "t = {}\\nt[\'İzmir\'] += 5\\n", "KeyError: \'İzmir\'\\n", "{\'İzmir\': 5}", ["get kullanmayı denedim", "anahtarı yazdırdım"])\nbeklenen = "Hedef: Şehre göre ciro toplamak\\nPython: 3.12\\nKod:\\nt = {}\\nt[\'İzmir\'] += 5\\nHata:\\nKeyError: \'İzmir\'\\nBeklenen: {\'İzmir\': 5}\\nDenediklerim:\\n- get kullanmayı denedim\\n- anahtarı yazdırdım"\nassert s == beklenen, "Biçim birebir aynı olmalı. Gelen:\\n" + str(s)\ns2 = soru_sablonu("Ortalama", "print(1/0)", "ZeroDivisionError: division by zero", "hata yok", [], surum="3.13")\nassert "Python: 3.13" in s2, "surum parametresi kullanılmalı"\nassert s2.endswith("Denediklerim:\\n- (henüz bir şey denemedim)"), "Deneme yoksa \\"- (henüz bir şey denemedim)\\" satırı eklenmeli"\n',
      hints: [
        'Satırları bir listede toplayıp en sonda "\\n".join ile birleştirmek en temiz yoldur.',
        'Boş liste koşullarda False sayılır: if denenenler: ... else: ...'
      ],
      why: 'Hedef, minimal kod, tam hata, beklenen sonuç ve denediklerin: iyi bir sorunun beş parçası. Bu şablonu kullanan biri genellikle soruyu yazarken cevabı kendisi bulur.' },
    { id: 'hata-ayiklama-b1',
      t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      diff: 1,
      q: '<p><b>Hatayı bul ve düzelt.</b> <code>son_n_gun_toplami(gunluk_ciro, n)</code> listenin son <code>n</code> gününün cirosunu toplamalı. Satış müdürü "son gün hiç sayılmıyor" diyor.</p>',
      start: 'def son_n_gun_toplami(gunluk_ciro, n):\n    """Listenin son n gününün cirosunu toplar."""\n    toplam = 0\n    for i in range(len(gunluk_ciro) - n, len(gunluk_ciro) - 1):\n        toplam += gunluk_ciro[i]\n    return toplam\n',
      sol: 'def son_n_gun_toplami(gunluk_ciro, n):\n    """Listenin son n gününün cirosunu toplar."""\n    toplam = 0\n    for i in range(len(gunluk_ciro) - n, len(gunluk_ciro)):\n        toplam += gunluk_ciro[i]\n    return toplam\n',
      tests: 'assert son_n_gun_toplami([100, 200, 300, 400], 2) == 700, "Son 2 gün 300 + 400 = 700 olmalı"\nassert son_n_gun_toplami([100, 200, 300, 400], 1) == 400, "Son 1 gün 400 olmalı"\nassert son_n_gun_toplami([100, 200, 300, 400], 4) == 1000, "Tüm günler 1000 olmalı"\n',
      hints: [
        'range(baslangic, bitis) bitişi DAHİL ETMEZ.',
        'Son indeks len - 1\'dir; onu da dahil etmek için bitiş len olmalı.'
      ],
      why: 'Klasik off-by-one: range\'in bitişi zaten hariçtir, ayrıca 1 çıkarınca son eleman iki kez dışarıda kalır. Daha Pythonic çözüm: <code>sum(gunluk_ciro[-n:])</code>.' },
    { id: 'hata-ayiklama-b2',
      t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      diff: 1,
      q: '<p><b>Hatayı bul ve düzelt.</b> <code>onayli_toplam(siparisler)</code> durum alanı <code>"onaylandı"</code> olan siparişlerin tutarlarını toplamalı. Ama rapor çoğu gün yalnızca ilk siparişi sayıyor, bazen 0 veriyor.</p>',
      start: 'def onayli_toplam(siparisler):\n    toplam = 0\n    for s in siparisler:\n        if s["durum"] == "onaylandı":\n            toplam += s["tutar"]\n        return toplam\n',
      sol: 'def onayli_toplam(siparisler):\n    toplam = 0\n    for s in siparisler:\n        if s["durum"] == "onaylandı":\n            toplam += s["tutar"]\n    return toplam\n',
      tests: 'sip = [\n    {"durum": "onaylandı", "tutar": 100},\n    {"durum": "iptal", "tutar": 50},\n    {"durum": "onaylandı", "tutar": 250},\n]\nassert onayli_toplam(sip) == 350, "100 + 250 = 350 olmalı; tüm siparişler gezilmeli"\nassert onayli_toplam(sip[1:]) == 250, "İlk sipariş iptalse de diğerleri sayılmalı"\nassert onayli_toplam([]) == 0, "Boş listede 0 dönmeli (None değil)"\n',
      hints: ['return satırının girintisine bak: hangi bloğun içinde?', 'return döngüyle aynı hizada (for ile aynı sütunda) olmalı.'],
      why: 'return döngünün içinde kalınca ilk turdan sonra fonksiyon biter. Boş listede ise döngüye hiç girilmez ve fonksiyon None döndürür. Python\'da girinti anlam taşır; bu tür hatayı rubber duck yöntemiyle sesli okuyarak çabucak yakalarsın.' },
    { id: 'hata-ayiklama-b3',
      t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      diff: 1,
      q: '<p><b>Hatayı bul ve düzelt.</b> Ödemesi tamamlanan siparişin durumu <code>"kargoda"</code> olmalı. Kod hata vermiyor ama siparişler hep <code>"hazırlanıyor"</code> durumunda kalıyor.</p>',
      start: 'def durumu_guncelle(siparis):\n    if siparis["odeme"] == "tamam":\n        siparis["durum"] == "kargoda"\n    return siparis\n',
      sol: 'def durumu_guncelle(siparis):\n    if siparis["odeme"] == "tamam":\n        siparis["durum"] = "kargoda"\n    return siparis\n',
      tests: 's = durumu_guncelle({"no": "AM-7", "odeme": "tamam", "durum": "hazırlanıyor"})\nassert s["durum"] == "kargoda", "Ödeme tamamsa durum \'kargoda\' olmalı"\ns2 = durumu_guncelle({"no": "AM-8", "odeme": "bekliyor", "durum": "hazırlanıyor"})\nassert s2["durum"] == "hazırlanıyor", "Ödeme bekliyorsa durum değişmemeli"\n',
      hints: [
        'İkinci satırdaki işlem bir atama mı, yoksa karşılaştırma mı?',
        '== karşılaştırır ve sonucu (True/False) bir yere koymadan atar; atama = ile yapılır.'
      ],
      why: '<code>siparis["durum"] == "kargoda"</code> geçerli bir ifadedir: False üretir ve sonuç çöpe gider. Python hata vermez, çünkü sözdizimi doğrudur; bu yüzden mantık hatasıdır. ruff gibi araçlar "etkisiz ifade" uyarısıyla bunu yakalar.' },
    { id: 'hata-ayiklama-b4',
      t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      diff: 1,
      q: '<p><b>Hatayı bul ve düzelt.</b> İK\'nın performans paneli çalışanın ortalama puanını 2 ondalıkla göstermeli. [4, 5, 4] puanları için 4.33 beklenirken ekranda hep 4 görünüyor.</p>',
      start: 'def ortalama_puan(puanlar):\n    return round(sum(puanlar) // len(puanlar), 2)\n',
      sol: 'def ortalama_puan(puanlar):\n    return round(sum(puanlar) / len(puanlar), 2)\n',
      tests: 'assert ortalama_puan([4, 5, 4]) == 4.33, "13 / 3 = 4.333... → 4.33 olmalı"\nassert ortalama_puan([3, 4]) == 3.5, "7 / 2 = 3.5 olmalı"\nassert ortalama_puan([5]) == 5, "Tek puanda puanın kendisi"\n',
      hints: ['Python\'da iki bölme operatörü vardır: / ve //', '// tamsayı (taban) bölmesidir, kesirli kısmı atar.'],
      why: '// taban bölmesi yapar: 13 // 3 = 4. round sonradan kesirli kısmı geri getiremez. Ortalama, oran ve para hesaplarında / kullanılır.' },
    { id: 'hata-ayiklama-b5',
      t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      diff: 2,
      q: '<p><b>Hatayı bul ve düzelt.</b> Her müşteriye yeni bir sepet açılıyor. Ama Mehmet sepetini açtığında Ayşe\'nin ürünlerini görüyor! <code>yeni_sepet</code> ve <code>sepete_ekle</code> fonksiyonlarını düzelt; çağıranın verdiği bir liste varsa o yine kullanılabilmeli.</p>',
      start: 'def yeni_sepet(musteri, urunler=[]):\n    return {"musteri": musteri, "urunler": urunler}\n\ndef sepete_ekle(sepet, urun):\n    sepet["urunler"].append(urun)\n',
      sol: 'def yeni_sepet(musteri, urunler=None):\n    if urunler is None:\n        urunler = []\n    return {"musteri": musteri, "urunler": urunler}\n\ndef sepete_ekle(sepet, urun):\n    sepet["urunler"].append(urun)\n',
      tests: 'a = yeni_sepet("Ayşe")\nsepete_ekle(a, "çay")\nb = yeni_sepet("Mehmet")\nassert b["urunler"] == [], "Mehmet\'in sepeti boş başlamalı; varsayılan liste paylaşılıyor"\nsepete_ekle(b, "kahve")\nassert a["urunler"] == ["çay"], "Ayşe\'nin sepetinde yalnızca çay olmalı"\nc = yeni_sepet("Zeynep", ["süt"])\nassert c["urunler"] == ["süt"], "Verilen liste kullanılmalı"\n',
      hints: [
        'Varsayılan değer fonksiyon tanımlanırken bir kez oluşturulur.',
        'Varsayılanı None yap; fonksiyonun içinde None ise yeni bir boş liste oluştur.'
      ],
      why: 'Değişebilir (mutable) varsayılan bütün çağrılarda aynı nesnedir; veri müşteriler arasında sızar. None + içeride yeni liste, Python\'ın standart kalıbıdır.' },
    { id: 'hata-ayiklama-b6',
      t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      diff: 2,
      q: '<p><b>Hatayı bul ve düzelt.</b> <code>sepet_ozeti(sepetler)</code> her sepetin toplamını ve genel toplamı <code>(liste, genel)</code> olarak döndürmeli. Çalıştırınca <code>TypeError: \'int\' object is not callable</code> alıyorsun. Değişkene anlamlı ve yerleşik fonksiyonları gölgelemeyen bir ad ver.</p>',
      start: 'def sepet_ozeti(sepetler):\n    """Her sepetin toplamını ve genel toplamı döndürür."""\n    sonuc = []\n    for sepet in sepetler:\n        sum = 0\n        for fiyat in sepet:\n            sum += fiyat\n        sonuc.append(sum)\n    genel = sum(sonuc)\n    return sonuc, genel\n',
      sol: 'def sepet_ozeti(sepetler):\n    """Her sepetin toplamını ve genel toplamı döndürür."""\n    sonuc = []\n    for sepet in sepetler:\n        sepet_toplami = 0\n        for fiyat in sepet:\n            sepet_toplami += fiyat\n        sonuc.append(sepet_toplami)\n    genel = sum(sonuc)\n    return sonuc, genel\n',
      tests: 'assert sepet_ozeti([[10, 20], [5], [1, 2, 3]]) == ([30, 5, 6], 41), "([30, 5, 6], 41) bekleniyor"\nassert sepet_ozeti([]) == ([], 0), "Boş girdide ([], 0) dönmeli"\nassert "sum =" not in __source__ and "sum +=" not in __source__, "sum yerleşik bir fonksiyondur; değişkene bu adı verme"\n',
      hints: [
        'Hata mesajı "int çağrılamaz" diyor: hangi ad hem sayı hem fonksiyon olarak kullanılıyor?',
        'Fonksiyon içinde sum\'a atama yapınca o ad yerelde bir sayıya dönüşür ve yerleşik sum() gizlenir.'
      ],
      why: 'Bir adı yeniden atamak, aynı adlı yerleşik fonksiyonu o kapsamda gölgeler (shadowing). sum, list, max, min, id, input, type sık gölgelenen adlardır. Anlamlı ad (sepet_toplami) hem hatayı giderir hem de kodu okunur kılar.' },
    { id: 'hata-ayiklama-b7',
      t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      diff: 2,
      q: '<p><b>Hatayı bul ve düzelt.</b> Bu sabahki sorun: İzmir cirosu 0 TL çıkıyor ama İzmir\'den siparişler olduğu kesin. Kod hata vermiyor. Önce <code>print</code> ile bir kaydın anahtarlarına bak, sonra düzelt.</p>',
      start: 'siparisler = [\n    {"no": "AM-1", "sehir": "İzmir", "tutar": 300},\n    {"no": "AM-2", "sehir": "Ankara", "tutar": 150},\n    {"no": "AM-3", "sehir": "İzmir", "tutar": 120},\n]\n\ndef sehir_cirosu(siparisler, sehir):\n    toplam = 0\n    for s in siparisler:\n        if s.get("şehir") == sehir:\n            toplam += s["tutar"]\n    return toplam\n\nprint(sehir_cirosu(siparisler, "İzmir"))\n',
      sol: 'siparisler = [\n    {"no": "AM-1", "sehir": "İzmir", "tutar": 300},\n    {"no": "AM-2", "sehir": "Ankara", "tutar": 150},\n    {"no": "AM-3", "sehir": "İzmir", "tutar": 120},\n]\n\ndef sehir_cirosu(siparisler, sehir):\n    toplam = 0\n    for s in siparisler:\n        if s["sehir"] == sehir:\n            toplam += s["tutar"]\n    return toplam\n\nprint(sehir_cirosu(siparisler, "İzmir"))\n',
      tests: 'assert sehir_cirosu(siparisler, "İzmir") == 420, "İzmir cirosu 300 + 120 = 420 olmalı"\nassert sehir_cirosu(siparisler, "Ankara") == 150, "Ankara cirosu 150 olmalı"\nassert sehir_cirosu(siparisler, "Bursa") == 0, "Siparişi olmayan şehir 0"\n',
      hints: [
        'print(siparisler[0].keys()) ile gerçek anahtar adlarına bak.',
        'Veride "sehir" (s ile), kodda "şehir" (ş ile) yazıyor. .get olmayan anahtarda None döndürdüğü için hata gizleniyor.'
      ],
      why: '.get olmayan anahtarda sessizce None döndürür; None hiçbir şehre eşit olmadığı için toplam 0 kalır. Anahtarın her zaman var olması gereken yerde köşeli parantez kullanmak hatayı KeyError olarak hemen görünür kılardı. Anahtar adını elle yazmak yerine veriden kopyala.' },
    { id: 'hata-ayiklama-m1',
      t: 'code',
      stage: 'Meydan okuma',
      diff: 3,
      q: '<p>Minimal örneği otomatik bul. <code>kucult(kayitlar, hata_verir)</code> fonksiyonunu yaz. <code>hata_verir(liste)</code>, verilen liste hatayı üretiyorsa True döndüren bir fonksiyondur.</p><ul><li>Başlangıç listesi hatayı üretmiyorsa <code>ValueError("başlangıç listesi hatayı üretmiyor")</code> fırlat.</li><li>Elemanları tek tek çıkarmayı dene: çıkarınca hata hâlâ oluşuyorsa o elemanı kalıcı olarak at, oluşmuyorsa tut ve sonrakine geç.</li><li>Sonuç <b>1-minimal</b> olmalı: hatayı üretir ama içinden herhangi tek bir eleman çıkarılırsa artık üretmez.</li><li>Girdi listesini değiştirme; elemanların göreli sırasını koru.</li></ul>',
      start: 'def kucult(kayitlar, hata_verir):\n    pass\n',
      sol: 'def kucult(kayitlar, hata_verir):\n    if not hata_verir(list(kayitlar)):\n        raise ValueError("başlangıç listesi hatayı üretmiyor")\n    sonuc = list(kayitlar)\n    i = 0\n    while i < len(sonuc):\n        aday = sonuc[:i] + sonuc[i + 1:]\n        if hata_verir(aday):\n            sonuc = aday\n        else:\n            i += 1\n    return sonuc\n',
      tests: 'def _bir_minimal(sonuc, f):\n    return f(sonuc) and all(not f(sonuc[:i] + sonuc[i + 1:]) for i in range(len(sonuc)))\n\nveri = [100, -5, 30, -2, 80]\nkopya = list(veri)\nnegatif_var = lambda l: any(x < 0 for x in l)\nr = kucult(veri, negatif_var)\nassert veri == kopya, "Girdi listesi değiştirilmemeli"\nassert len(r) == 1 and r[0] < 0, "Tek bir negatif sayı yeterli: sonuç tek elemanlı olmalı, gelen " + str(r)\n\nikili = lambda l: "A" in l and "B" in l\nr2 = kucult(["x", "A", "y", "z", "B", "w"], ikili)\nassert r2 == ["A", "B"], "Hata A ve B birlikteyken oluşuyor: [\'A\', \'B\'] beklenir (sıra korunmalı), gelen " + str(r2)\n\nbuyuk = lambda l: sum(l) > 1000\nr3 = kucult([400, 300, 200, 500, 100], buyuk)\nassert _bir_minimal(r3, buyuk), "Sonuç 1-minimal olmalı: hangi elemanı çıkarsan hata kaybolmalı, gelen " + str(r3)\n\ntry:\n    kucult([1, 2, 3], negatif_var)\n    assert False, "Hata üretmeyen başlangıç listesinde ValueError beklenir"\nexcept ValueError as e:\n    assert str(e) == "başlangıç listesi hatayı üretmiyor", "ValueError mesajı görevdeki gibi olmalı"\n',
      hints: [
        'Bir indeks i ile listede ilerle; aday = sonuc[:i] + sonuc[i+1:] i. elemanı çıkarılmış kopyadır.',
        'Aday hâlâ hata veriyorsa sonuc = aday yap ve i\'yi ARTIRMA (aynı konuma yeni bir eleman kaydı); vermiyorsa i += 1.'
      ],
      why: 'Bu, delta debugging fikrinin sade hâlidir: hatayı üreten girdiden gereksiz her parçayı atarak tekrar üreten en küçük örneğe inersin. Gerçek araçlar parçaları ikiye bölerek daha hızlı ilerler ama ilke aynıdır.' }
  ],
  faq: [
    { q: 'print ile mi ayıklamalıyım, debugger ile mi?',
      a: 'İkisi de meşru. Küçük betikte ve hızlı bir hipotezi denerken print (özellikle f"{x=}") çoğu zaman yeterli ve hızlıdır. Döngünün 500. turunda ne olduğunu görmek, çağrı yığınında gezmek ya da birçok değişkene aynı anda bakmak gerekiyorsa debugger zaman kazandırır.' },
    { q: 'Traceback kütüphane dosyalarıyla doluysa ne yapmalıyım?',
      a: 'Alttan yukarı çık ve kendi dosyanın ilk geçtiği File satırını bul. Hata çoğunlukla oradan kütüphaneye verdiğin değerdedir (yanlış tür, None, boş veri). Kütüphanenin kendisinin hatalı olması çok daha nadirdir.' },
    { q: 'assert ile if + raise arasındaki fark ne?',
      a: 'assert programcı varsayımları içindir ve python -O ile kapatılabilir. Kullanıcı girdisini, dosya içeriğini ya da dış sistemden gelen veriyi doğrulamak için her zaman if + raise ValueError kullan; bu denetim asla kapatılmamalıdır.' },
    { q: 'Yapay zekâ düzeltmeyi verdi ve çalıştı. Yeterli mi?',
      a: 'Hayır. Neden çalıştığını anlayana kadar iş bitmiş sayılmaz. Hatayı yeniden üreten küçük bir test ekle, düzeltmenin yalnızca belirtiyi mi yoksa nedeni mi giderdiğini kontrol et. Anlamadığın düzeltme ileride daha zor bir hataya dönüşebilir.' },
    { q: 'Hata bazen oluyor bazen olmuyor. Nereden başlamalıyım?',
      a: 'Önce tekrarlanabilir hâle getir: rastgeleliği seed ile sabitle, girdiyi kaydet, tarih-saati sabit ver. Tekrarlanamayan hata ayıklanamaz; tekrarlanınca normal bir hataya dönüşür.' }
  ],
  mistakes: [
    { bad: 'try:\n    rapor = hazirla(veri)\nexcept:\n    pass',
      good: 'try:\n    rapor = hazirla(veri)\nexcept KeyError as e:\n    print("Eksik alan:", e)\n    raise',
      why: 'Hatayı yutmak, hata ayıklamanın en büyük düşmanıdır: traceback kaybolur ve sorun çok sonra başka bir yerde ortaya çıkar.' },
    { bad: 'print(toplam)\nprint(adet)',
      good: 'print(f"{toplam=} {adet=}")',
      why: 'Etiketsiz print çıktıları karışır; hangi sayının hangi değişkene ait olduğunu unutursun. f"{x=}" adıyla birlikte yazar.' },
    { bad: 'def oran_hesapla(kullanici_girdisi):\n    assert kullanici_girdisi > 0\n    ...',
      good: 'def oran_hesapla(kullanici_girdisi):\n    if kullanici_girdisi <= 0:\n        raise ValueError("pozitif olmalı")\n    ...',
      why: 'assert -O ile kapatılabilir; kullanıcı ve dış veri doğrulaması her zaman açık kalmalıdır.' },
    { bad: 'for i in range(1, len(gunler)):\n    print(gunler[i])',
      good: 'for gun in gunler:\n    print(gun)',
      why: 'İndeksle gezmek off-by-one hatasına kapı açar; doğrudan elemanlar üzerinde gezmek hem daha kısa hem daha güvenlidir.' },
    { bad: 'sehir = s.get("şehir")   # anahtar aslında "sehir"',
      good: 'sehir = s["sehir"]',
      why: 'Var olması gereken anahtarda .get hatayı gizler ve None döndürür; köşeli parantez yanlış anahtarı KeyError ile hemen gösterir.' }
  ] }
);
})(window);
/* PythonPatika — Temiz kod ve PEP 8 — temel / Dosya ve Hata */
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push(
{ id: 'kod-stili',
  lv: 'temel',
  mod: 'Dosya ve Hata',
  min: 35,
  title: 'Temiz kod ve PEP 8',
  sum: 'PEP 8 adlandırma, boşluk ve import kurallarını, docstring yazmayı, sihirli sayılardan kaçınmayı, DRY ve erken dönüşü öğrenir; dağınık kodu davranışını bozmadan yeniden düzenler, ruff ve black ile stili otomatiğe bağlarsın.',
  goals: [
    'Değişken, fonksiyon, sınıf ve sabitleri PEP 8\'e uygun ve anlamlı adlandırabilirim.',
    'Girinti, boşluk, satır uzunluğu ve import sırasını kurallara göre düzenleyebilirim.',
    'Google ya da NumPy stilinde docstring ve "neden"i anlatan yorumlar yazabilirim.',
    'Sihirli sayıları sabite taşıyıp tekrarı fonksiyona çevirerek ve erken dönüş kullanarak kodu davranışını bozmadan yeniden düzenleyebilirim.',
    'ruff ve black\'in ne işe yaradığını bilir, re ve ast ile basit stil denetimleri yazabilirim.'
  ],
  body: `
<h2>Neden önemli?</h2>
<p>Kod bir kez yazılır, onlarca kez okunur: kod incelemesinde (code review), hata ayıklarken, altı ay sonra yeni özellik eklerken. Anadolu Bank'ın faiz modülünü yazan kişi izne çıktığında, <code>def f(a, b, c)</code> ve içinde <code>* 0.0175</code> gibi açıklamasız sayılar gören ekip arkadaşı bir günü yalnızca "bu ne yapıyor" sorusuna harcar. Temiz kod (clean code), çalışan kodun bir üst basamağıdır: <b>doğru çalışan ve kolay anlaşılan</b> kod.</p>
<p>Python topluluğunun ortak stil kılavuzu <b>PEP 8</b>'dir (Python Enhancement Proposal 8). Kuralların çoğu zevk meselesi gibi görünür ama asıl amaç tutarlılıktır: herkes aynı biçimde yazınca göz biçime değil içeriğe odaklanır. Değişken adlandırmanın temellerini "Değişkenler" dersinde gördün; burada bütün bir programa bakıyoruz.</p>

<h2>Adlandırma kuralları</h2>
<div class="tbl-wrap"><table>
<tr><th>Ne?</th><th>Biçim</th><th>Örnek</th></tr>
<tr><td>Değişken, fonksiyon, parametre, modül</td><td>snake_case</td><td><code>aylik_taksit</code>, <code>hesap_ozeti()</code>, <code>rapor.py</code></td></tr>
<tr><td>Sınıf</td><td>PascalCase (CapWords)</td><td><code>KrediBasvurusu</code>, <code>Siparis</code></td></tr>
<tr><td>Sabit (modül düzeyinde, değişmeyen)</td><td>UPPER_CASE</td><td><code>KDV_ORANI</code>, <code>MAX_DENEME</code></td></tr>
<tr><td>"İçeride kullan" işareti</td><td>_ ile başla</td><td><code>_yardimci()</code>, <code>_onbellek</code></td></tr>
<tr><td>Kaçınılacak</td><td>l, O, I tek harfleri; yerleşik adlar</td><td><code>l = 1</code> (1 mi l mi?), <code>list = [...]</code></td></tr>
</table></div>
<p><b>Anlamlı ad</b> ise kuraldan da önemlidir. Adın uzunluğu kapsamıyla orantılı olsun: üç satırlık bir döngüde <code>i</code> yeterlidir, ama modül boyunca yaşayan bir değişken <code>d</code> olamaz. Mantıksal (bool) değerlere soru gibi okunan adlar ver: <code>odendi_mi</code>, <code>stok_var</code>. Fonksiyon adı bir fiil olsun: <code>hesapla</code>, <code>getir</code>, <code>dogrula</code>.</p>
<pre class="py"># Önce: ne yaptığını anlamak için kodu çözmen gerekir
def f(l):
    t = 0
    for x in l:
        if x[1]:
            t += x[0]
    return t

# Sonra: adlar kodu anlatır
def odenen_toplam(faturalar):
    toplam = 0
    for tutar, odendi_mi in faturalar:
        if odendi_mi:
            toplam += tutar
    return toplam

faturalar = [(1200, True), (450, False), (300, True)]
print(f(faturalar), odenen_toplam(faturalar))</pre>
<div class="note"><b>Türkçe ad, Türkçe karakter?</b>Python 3 adlarda ş, ğ, ı gibi harflere izin verir (<code>öğrenci_sayısı = 5</code> çalışır). Yine de çoğu ekip klavye, arama ve araç uyumu için adları ASCII yazar: <code>ogrenci_sayisi</code>. Bu uygulamada da öyle yapıyoruz. Uluslararası ekiplerde adlar genellikle İngilizcedir; önemli olan bir projede <b>tek</b> dil seçmektir.</div>

<h2>Girinti, boşluk ve satır uzunluğu</h2>
<ul>
<li>Girinti <b>4 boşluk</b>; sekme (tab) ile boşluk asla karışmaz.</li>
<li>Atama ve karşılaştırma operatörlerinin iki yanında birer boşluk: <code>toplam = a + b</code>. Varsayılan parametrede boşluk yok: <code>def f(oran=0.2)</code>.</li>
<li>Virgülden sonra boşluk, parantezin içine boşluk yok: <code>f(a, b)</code>, <code>f( a,b )</code> değil.</li>
<li>Satır en fazla <b>79 karakter</b> (birçok ekip black'in varsayılanı olan 88'i kullanır). Uzun satırı ters bölü ile değil, <b>parantez içinde</b> böl.</li>
<li>Üst düzey fonksiyon ve sınıflar arasında <b>iki</b> boş satır, sınıf içindeki metotlar arasında <b>bir</b> boş satır.</li>
</ul>
<pre class="py">KDV_ORANI = 0.20
KARGO_UCRETI = 39.90
INDIRIM_ESIGI = 1000


def sepet_toplami(ara_toplam, uye_mi):
    indirim = 0.05 if uye_mi and ara_toplam &gt;= INDIRIM_ESIGI else 0
    genel_toplam = (
        ara_toplam * (1 - indirim) * (1 + KDV_ORANI)
        + KARGO_UCRETI
    )
    return round(genel_toplam, 2)


print(sepet_toplami(1200, uye_mi=True))
print(sepet_toplami(400, uye_mi=False))</pre>
<p>Operatörün satır başında olması (<code>+ KARGO_UCRETI</code>) PEP 8'in güncel önerisidir: matematikte olduğu gibi gözün hangi işlemin yapıldığını satır başında görür.</p>

<h2>Import sırası</h2>
<p>Dosyanın en üstünde, docstring'den hemen sonra, üç grup hâlinde ve aralarında birer boş satırla:</p>
<pre class="code">"""Anadolu Market günlük ciro raporu."""

import csv                      # 1) standart kütüphane
import datetime as dt
from pathlib import Path

import pandas as pd             # 2) üçüncü taraf (pip ile kurulanlar)

from rapor.ayarlar import KDV_ORANI   # 3) projenin kendi modülleri</pre>
<p>Her grup kendi içinde alfabetiktir; her satırda tek modül içe aktarılır (<code>import os, sys</code> değil). <code>from modul import *</code> hangi adların geldiğini gizlediği için kullanılmaz. Bu sırayı elle tutmana gerek yok: ruff (<code>ruff check --select I --fix</code>) ya da isort senin yerine dizer.</p>

<h2>Yorum ve docstring</h2>
<p>İyi yorum kodun <b>ne</b> yaptığını değil <b>neden</b> öyle yaptığını anlatır. <code># i'yi 1 artır</code> gürültüdür; <code># Banka hafta sonu çalışmadığı için valörü cumaya çekiyoruz</code> altın değerindedir. Kod değişip yorum değişmezse yorum yalan söylemeye başlar; bu yüzden kodu kendini anlatacak kadar açık yaz, yorumu iş kuralı ve tuhaflıklar için sakla.</p>
<p><b>Docstring</b>, fonksiyonun, sınıfın ya da modülün ilk satırına yazılan üç tırnaklı metindir. Yorumdan farkı: Python onu saklar, <code>help()</code> ve editörler gösterir. İlk satır tek cümlelik özettir; ardından boş satır ve ayrıntılar gelir. İki yaygın biçim vardır:</p>
<pre class="py">def aylik_taksit(anapara, yillik_faiz, vade_ay):
    """Eşit taksitli kredinin aylık taksitini hesaplar.

    Args:
        anapara: Çekilen kredi tutarı (TL).
        yillik_faiz: Yıllık faiz oranı, 0.42 gibi ondalık.
        vade_ay: Taksit sayısı.

    Returns:
        2 ondalığa yuvarlanmış aylık taksit.

    Raises:
        ValueError: vade_ay pozitif değilse.
    """
    if vade_ay &lt;= 0:
        raise ValueError("vade pozitif olmalı")
    r = yillik_faiz / 12
    if r == 0:
        return round(anapara / vade_ay, 2)
    return round(anapara * r / (1 - (1 + r) ** -vade_ay), 2)


print(aylik_taksit(100_000, 0.42, 12))
print(aylik_taksit.__doc__.splitlines()[0])</pre>
<p>Yukarıdaki <b>Google stili</b>dir (Args / Returns / Raises). Veri bilimi kütüphanelerinde (numpy, pandas) yaygın olan <b>NumPy stili</b> başlıkları çizgiyle ayırır:</p>
<pre class="code">def ortalama_sepet(tutarlar):
    """Ortalama sepet tutarını döndürür.

    Parameters
    ----------
    tutarlar : list of float
        Sipariş tutarları.

    Returns
    -------
    float
        Ortalama; liste boşsa 0.0.
    """</pre>
<p>Hangisini seçtiğin değil, projede <b>tek</b> birini tutarlı kullanman önemlidir. Tip ipuçları (type hints) da belgelemenin parçasıdır: <code>def aylik_taksit(anapara: float, yillik_faiz: float, vade_ay: int) -&gt; float</code> yazınca docstring'de türleri tekrar etmene gerek kalmaz.</p>

<h2>Sihirli sayılardan kaçın</h2>
<p>Kodun ortasındaki açıklamasız sayı "sihirli sayı"dır (magic number). <code>if puan &gt; 1250</code> satırında 1250'nin ne olduğunu bilen tek kişi yazandır. Sayıyı adı olan bir sabite taşı: hem anlam kazanır hem de değiştiğinde tek yerden güncellenir.</p>
<pre class="py"># Önce
def kart_limiti(gelir):
    if gelir &gt; 85000:
        return gelir * 3
    return gelir * 1.5

# Sonra
YUKSEK_GELIR_ESIGI = 85_000
YUKSEK_GELIR_CARPANI = 3
STANDART_CARPAN = 1.5

def kart_limiti_temiz(aylik_gelir):
    if aylik_gelir &gt; YUKSEK_GELIR_ESIGI:
        return aylik_gelir * YUKSEK_GELIR_CARPANI
    return aylik_gelir * STANDART_CARPAN

print(kart_limiti(90000) == kart_limiti_temiz(90000), kart_limiti_temiz(40000))</pre>
<p>0, 1, -1 gibi bariz değerler ve <code>range(len(x))</code> gibi kullanımlar sabite çevrilmez; kural "anlamı açık olmayan sayı"lar içindir. <code>85_000</code> yazımı da bir stil inceliğidir: alt çizgi sayıyı okunur yapar, değerini değiştirmez.</p>

<h2>Küçük fonksiyon, DRY, erken dönüş</h2>
<p><b>Tek sorumluluk:</b> bir fonksiyon tek iş yapsın ve adı o işi söylesin. Adında "ve" geçiyorsa (<code>oku_ve_hesapla_ve_yazdir</code>) bölme zamanıdır. Kabaca ekrana sığmayan fonksiyon, büyük olasılıkla fazla iş yapıyordur.</p>
<p><b>DRY</b> (Don't Repeat Yourself, kendini tekrar etme): aynı mantık iki yerde yazılırsa bir gün yalnızca birinde güncellenir ve iki yer birbirini tutmaz. Üç kez kopyalanmış bir blok, bir fonksiyonun habercisidir.</p>
<p><b>Erken dönüş</b> (early return, guard clause): iç içe if merdiveni yerine geçersiz durumları başta eleyip ana yolu düz bırak.</p>
<pre class="py"># Önce: iç içe merdiven
def kredi_karari_eski(yas, gelir, borc_orani):
    if yas &gt;= 18:
        if gelir &gt;= 20000:
            if borc_orani &lt;= 0.5:
                return "ön onay"
            else:
                return "red: borç"
        else:
            return "red: gelir"
    else:
        return "red: yaş"

# Sonra: erken dönüş
def kredi_karari(yas, gelir, borc_orani):
    if yas &lt; 18:
        return "red: yaş"
    if gelir &lt; 20000:
        return "red: gelir"
    if borc_orani &gt; 0.5:
        return "red: borç"
    return "ön onay"

for basvuru in [(17, 50000, 0.1), (30, 15000, 0.1), (30, 40000, 0.7), (30, 40000, 0.2)]:
    print(kredi_karari(*basvuru), kredi_karari_eski(*basvuru) == kredi_karari(*basvuru))</pre>

<h2>Zen of Python</h2>
<p>Python'ın tasarım felsefesi 19 kısa ilkeyle yorumlayıcının içine gömülüdür. Çalıştır ve oku:</p>
<pre class="py">import this</pre>
<p>En çok alıntılananlar: <i>Beautiful is better than ugly</i> (güzel, çirkinden iyidir), <i>Explicit is better than implicit</i> (açık olan örtük olandan iyidir: <code>from x import *</code> bu yüzden kötüdür), <i>Readability counts</i> (okunabilirlik önemlidir), <i>Errors should never pass silently</i> (hatalar sessizce geçmemeli: çıplak <code>except: pass</code> bu yüzden kötüdür), <i>There should be one obvious way to do it</i> (bir işi yapmanın tek bariz yolu olmalı).</p>

<h2>ruff ve black: stili makineye bırak</h2>
<p>Kuralları ezberlemek yerine araçlara uygulat. <b>black</b> bir biçimlendiricidir (formatter): kodu tek ve tartışmasız bir stile sokar. <b>ruff</b> ise çok hızlı bir denetleyicidir (linter): kullanılmayan import, tanımsız ad, etkisiz ifade, import sırası gibi yüzlerce kuralı denetler; <code>ruff format</code> ile black uyumlu biçimlendirme de yapar.</p>
<pre class="code">pip install ruff black
ruff check .              # sorunları listele
ruff check . --fix        # düzeltilebilenleri düzelt
ruff format .             # biçimlendir (black uyumlu)
black rapor.py            # ya da yalnızca black</pre>
<p>Ayarlar proje kökündeki <code>pyproject.toml</code> içinde tutulur, böylece ekipteki herkes aynı kuralları kullanır:</p>
<pre class="code">[tool.ruff]
line-length = 88

[tool.ruff.lint]
select = ["E", "F", "I", "N", "B"]   # pycodestyle, pyflakes, import, adlandırma, bugbear</pre>
<div class="note"><b>Kendi bilgisayarında dene</b>ruff ve black tarayıcıda çalışmaz; terminalde <code>pip install ruff</code> ile kur. VS Code'da "Ruff" eklentisini kurup "Format on Save" açarsan her kayıtta dosya kendiliğinden düzelir. Bu derste bazı denetimleri Python'ın kendi <code>re</code> ve <code>ast</code> modülleriyle nasıl yapabileceğini alıştırmalarda göreceksin.</div>
<div class="tip"><b>Biçim tartışmasını kapat</b>"Bu virgülden sonra boşluk olmalı mı" tartışması kod incelemesinde vakit kaybıdır. Formatter'ı ekip kuralı yapınca bu yorumlar tamamen ortadan kalkar ve inceleme mantığa odaklanır.</div>

<div class="note"><b>Gerçek işte</b>Çoğu şirkette kod, ana dala birleşmeden önce otomatik denetimden geçer: pre-commit kancası commit anında ruff ve black'i çalıştırır, CI hattı (GitHub Actions gibi) stil hatası olan değişikliği kırmızıya boyar. Kod incelemesinde en sık yazılan yorumlar da bu dersin konularıdır: "bu sayının adı ne olmalı?", "bu fonksiyon iki iş yapıyor", "bu blok şurada da var". İş görüşmelerinde verilen ev ödevlerinde (take-home) çalışan ama dağınık kod, çalışan ve temiz koda neredeyse her zaman kaybeder.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Tutarlılık, kuraldan önce gelir</h3>
<p>PEP 8'in kendisi bir bölümüne "A Foolish Consistency is the Hobgoblin of Little Minds" başlığını koyar: proje içi tutarlılık PEP 8'den, fonksiyon içi tutarlılık proje kuralından önemlidir. Eski bir kod tabanına camelCase ile yazılmışsa, tek fonksiyonu snake_case'e çevirmek karmaşayı artırır; ya hepsini (bir araçla, ayrı bir değişiklikte) çevirirsin ya da mevcut stile uyarsın.</p>
<h3>Bilişsel karmaşıklık</h3>
<p>Kodun zorluğunu satır sayısı değil, okurun aklında aynı anda tutması gereken şey sayısı belirler. Her iç içe if, her döngü, her bayrak (flag) değişkeni bu yükü artırır. Erken dönüş, küçük yardımcı fonksiyonlar ve anlamlı ara değişkenler (<code>uygun_mu = yas &gt;= 18 and gelir &gt;= ESIK</code>) yükü azaltır. ruff'ın <code>C901</code> kuralı karmaşıklığı sayıp sınırı aşan fonksiyonları işaretler.</p>
<h3>Yeniden düzenleme (refactoring) güvenli yapılır</h3>
<p>Refactor, davranışı değiştirmeden yapıyı iyileştirmektir. Güvenli yolu: önce mevcut davranışı test et, küçük bir adım at, testleri çalıştır, tekrarla. Bu dersin refactor alıştırmaları tam olarak bunu yapar: testler hem eski davranışın korunduğunu hem de yapının düzeldiğini denetler. Orta seviyedeki "Test yazma" dersinde bu güvenlik ağını kendin kuracaksın.</p>
</section>
`,
  ex: [
    { t: 'mc',
      stage: 'Isınma',
      q: 'Modül düzeyinde tanımlanan ve program boyunca değişmeyen KDV oranı için PEP 8\'e uygun ad hangisidir?',
      o: ['kdvOrani', 'KdvOrani', 'KDV_ORANI', 'kdv_orani'],
      a: 2,
      why: 'Sabitler UPPER_CASE yazılır. kdvOrani camelCase\'dir ve Python\'da kullanılmaz; KdvOrani sınıf adı gibi okunur; kdv_orani değişken için doğrudur ama sabit olduğunu belli etmez.' },
    { t: 'mc',
      stage: 'Isınma',
      q: 'PEP 8\'e göre import grupları dosyanın başında hangi sırayla yazılır?',
      o: [
        'Yerel modüller, üçüncü taraf, standart kütüphane',
        'Standart kütüphane, üçüncü taraf, yerel modüller',
        'Tamamen alfabetik; gruplamaya gerek yok',
        'Üçüncü taraf, standart kütüphane, yerel modüller'
      ],
      a: 1,
      why: 'Önce standart kütüphane (csv, json), sonra pip ile kurulan üçüncü taraf paketler (pandas), en son projenin kendi modülleri gelir; gruplar arasında birer boş satır bulunur ve her grup kendi içinde alfabetiktir.' },
    { t: 'mc',
      stage: 'Isınma',
      q: 'Aşağıdaki yorumlardan hangisi koda en çok değer katar?',
      o: [
        '# i değişkenini bir artırıyoruz çünkü döngü devam ediyor',
        '# Banka hafta sonu çalışmadığından valörü cumaya çekiyoruz',
        '# liste sort metodu ile küçükten büyüğe sıralanıyor',
        '# bu fonksiyon hesap yapar'
      ],
      a: 1,
      why: 'İyi yorum kodun neden öyle yazıldığını, yani koddan okunamayan iş kuralını anlatır. Diğerleri kodun zaten açıkça söylediğini tekrarlar ya da hiçbir şey söylemez.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Docstring Python tarafından saklanır. Bu kod ne yazdırır?',
      code: 'def kdv_ekle(tutar, oran=0.20):\n    """KDV dahil tutarı döndürür.\n\n    Args:\n        tutar: KDV hariç tutar (TL).\n        oran: KDV oranı, 0-1 arası.\n    """\n    return round(tutar * (1 + oran), 2)\n\nprint(kdv_ekle.__doc__.splitlines()[0])\nprint(kdv_ekle(100))\n',
      o: ['KDV dahil tutarı döndürür.\n120.0', 'None\n120.0', '"""KDV dahil tutarı döndürür.\n120.0', 'KDV dahil tutarı döndürür.\n120'],
      a: 0,
      why: 'Fonksiyonun ilk ifadesi olan metin __doc__ niteliğinde saklanır (tırnaklar olmadan). splitlines()[0] özet satırını verir. 100 * 1.2 float çarpımı olduğu için sonuç 120.0\'dır.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Erken dönüşlü (guard clause) bu fonksiyon ne yazdırır?',
      code: 'def kargo_durumu(siparis):\n    if siparis is None:\n        return "sipariş yok"\n    if not siparis.get("odendi"):\n        return "ödeme bekleniyor"\n    if siparis.get("stok", 0) == 0:\n        return "stok bekleniyor"\n    return "kargoya hazır"\n\nprint(kargo_durumu({"odendi": True, "stok": 0}))\nprint(kargo_durumu({"stok": 3}))\n',
      o: ['kargoya hazır\nkargoya hazır', 'stok bekleniyor\nödeme bekleniyor', 'stok bekleniyor\nkargoya hazır', 'ödeme bekleniyor\nstok bekleniyor'],
      a: 1,
      why: 'Koşullar yukarıdan aşağı denenir, ilk tutan return fonksiyonu bitirir. İlk siparişte ödeme var ama stok 0; ikincide "odendi" anahtarı yok, get None döndürür ve not None True olur.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Geçerli ad (Python kabul eder) ile PEP 8\'e uygun ad aynı şey değildir. Bu kod ne yazdırır?',
      code: 'print("hesaplaToplam".isidentifier(), "2tutar".isidentifier(), "aylik_taksit".islower())\n',
      o: ['False False True', 'True False True', 'True True True', 'True False False'],
      a: 1,
      why: 'hesaplaToplam geçerli bir Python adıdır (yalnızca PEP 8\'e aykırıdır), rakamla başlayan 2tutar geçersizdir. islower() harflerin hepsi küçükse True döner; alt çizgi harf olmadığından sonucu etkilemez.' },
    { t: 'order',
      stage: 'Kodu oku',
      q: '<p>PEP 8\'e uygun küçük bir modülün satırlarını sırala: import, sabit, docstring\'li fonksiyon, <code>__main__</code> bloğu.</p>',
      lines: [
        'import math',
        'KUTU_KAPASITESI = 12',
        'def kutu_sayisi(adet):',
        '    """Adet ürün için gereken kutu sayısını döndürür."""',
        '    return math.ceil(adet / KUTU_KAPASITESI)',
        'if __name__ == "__main__":',
        '    print(kutu_sayisi(30))'
      ],
      tests: 'assert kutu_sayisi.__doc__ == "Adet ürün için gereken kutu sayısını döndürür.", "Docstring fonksiyonun İLK satırı olmalı"\nassert kutu_sayisi(24) == 2 and kutu_sayisi(25) == 3, "kutu_sayisi yukarı yuvarlamalı"\n',
      expect: '3\n',
      hint: 'PEP 8 sırası: import\'lar, sonra sabitler, sonra fonksiyonlar, en sonda betik olarak çalıştırılınca devreye giren blok. Docstring, def satırının hemen altında olmalı.',
      why: 'İçe aktarmalar en üstte, sabitler onların altında, ardından tanımlar gelir. Docstring yalnızca gövdenin ilk ifadesi olduğunda __doc__ olarak saklanır. __main__ bloğu dosya import edildiğinde çalışmaz.' },
    { id: 'kod-stili-r1',
      t: 'code',
      stage: 'Rehberli',
      diff: 2,
      q: '<p>Bir adın hangi adlandırma biçiminde olduğunu bulan <code>ad_turu(ad)</code> fonksiyonunu <code>re.fullmatch</code> ile yaz. Dönüş değerleri:</p><ul><li><code>"snake_case"</code>: küçük harfle başlar; küçük harf, rakam ve tek alt çizgilerle ayrılmış parçalar (<code>aylik_taksit</code>, <code>x</code>, <code>kdv_orani2</code>)</li><li><code>"UPPER_CASE"</code>: büyük harfle başlar; büyük harf, rakam ve alt çizgiler (<code>KDV_ORANI</code>, <code>MAX</code>)</li><li><code>"PascalCase"</code>: her parça büyük harf + en az bir küçük harf/rakam (<code>KrediBasvurusu</code>, <code>Hesap</code>)</li><li>Hiçbiri değilse <code>"diğer"</code> (<code>toplamTutar</code>, <code>Kdv_Orani</code>, <code>_gizli</code>)</li></ul>',
      guide: [
        'Her biçim için bir desen yaz: snake için [a-z][a-z0-9]*(_[a-z0-9]+)*',
        'UPPER için aynı deseni büyük harflerle yaz.',
        'PascalCase için ([A-Z][a-z0-9]+)+ deseni yeterli.',
        're.fullmatch ile sırayla dene; eşleşen ilk biçimi döndür, hiçbiri yoksa "diğer".'
      ],
      example: 'import re\n\nPLAKA = r"\\d{2} [A-Z]{1,3} \\d{2,4}"\nfor metin in ["34 ABC 123", "34abc123", "06 A 1234"]:\n    print(metin, bool(re.fullmatch(PLAKA, metin)))\n',
      start: 'import re\n\nSNAKE = r"[a-z][a-z0-9]*(_[a-z0-9]+)*"\n# TODO: UPPER = ...\n# TODO: PASCAL = ...\n\ndef ad_turu(ad):\n    if re.fullmatch(SNAKE, ad):\n        return "snake_case"\n    # TODO: UPPER_CASE ve PascalCase kontrolleri\n    return "diğer"\n',
      sol: 'import re\n\nSNAKE = r"[a-z][a-z0-9]*(_[a-z0-9]+)*"\nUPPER = r"[A-Z][A-Z0-9]*(_[A-Z0-9]+)*"\nPASCAL = r"([A-Z][a-z0-9]+)+"\n\ndef ad_turu(ad):\n    if re.fullmatch(SNAKE, ad):\n        return "snake_case"\n    if re.fullmatch(UPPER, ad):\n        return "UPPER_CASE"\n    if re.fullmatch(PASCAL, ad):\n        return "PascalCase"\n    return "diğer"\n',
      tests: 'for ad in ["aylik_taksit", "x", "kdv_orani2", "rapor"]:\n    assert ad_turu(ad) == "snake_case", ad + " snake_case olmalı"\nfor ad in ["KDV_ORANI", "MAX", "HTTP_404"]:\n    assert ad_turu(ad) == "UPPER_CASE", ad + " UPPER_CASE olmalı"\nfor ad in ["KrediBasvurusu", "Hesap", "Siparis2"]:\n    assert ad_turu(ad) == "PascalCase", ad + " PascalCase olmalı"\nfor ad in ["toplamTutar", "Kdv_Orani", "_gizli", "aylik__taksit", "2tutar"]:\n    assert ad_turu(ad) == "diğer", ad + " hiçbir biçime uymuyor: diğer olmalı"\n',
      hints: [
        're.fullmatch metnin TAMAMI desene uyarsa eşleşme döndürür, yoksa None.',
        'UPPER deseni snake deseninin büyük harfli kopyasıdır: [A-Z][A-Z0-9]*(_[A-Z0-9]+)*',
        'PASCAL = r"([A-Z][a-z0-9]+)+" ve if re.fullmatch(PASCAL, ad): return "PascalCase"'
      ],
      why: 'Linter\'ların adlandırma kuralları (ruff N kuralları, pep8-naming) tam olarak bu tür desenlerle çalışır. fullmatch kullanmak önemlidir; match yalnızca başı denetler ve "aylikTaksit"i snake sanabilir.' },
    { id: 'kod-stili-r2',
      t: 'code',
      stage: 'Rehberli',
      diff: 2,
      q: '<p>Kod incelemesinde "docstring\'i olmayan fonksiyonlar" listesini otomatik çıkar. <code>docstringsiz_fonksiyonlar(kaynak)</code> Python kaynak kodunu metin olarak alsın, docstring\'i olmayan tüm fonksiyonların (iç içe ve sınıf metotları dahil) adlarını <b>kaynaktaki satır sırasına göre</b> liste olarak döndürsün. <code>ast</code> modülünü kullan.</p>',
      guide: [
        'ast.parse(kaynak) ile sözdizimi ağacını oluştur.',
        'ast.walk(agac) ile tüm düğümleri gez.',
        'Düğüm ast.FunctionDef ya da ast.AsyncFunctionDef ise ast.get_docstring(dugum) ile docstring\'e bak.',
        'None ise (satır_no, ad) olarak biriktir; sonunda satır numarasına göre sıralayıp yalnızca adları döndür.'
      ],
      example: 'import ast\n\nkaynak = "import json\\nx = 1\\ndef f():\\n    return x\\nclass Hesap:\\n    pass\\n"\nagac = ast.parse(kaynak)\nfor dugum in ast.walk(agac):\n    if isinstance(dugum, ast.ClassDef):\n        print("sınıf:", dugum.name, "satır", dugum.lineno, "docstring:", ast.get_docstring(dugum))\n',
      start: 'import ast\n\ndef docstringsiz_fonksiyonlar(kaynak):\n    agac = ast.parse(kaynak)\n    bulunan = []\n    for dugum in ast.walk(agac):\n        # TODO: dugum bir fonksiyon tanımı mı? (FunctionDef / AsyncFunctionDef)\n        # TODO: ast.get_docstring(dugum) None ise (satır, ad) ekle\n        pass\n    # TODO: satıra göre sırala, yalnızca adları döndür\n    return []\n',
      sol: 'import ast\n\ndef docstringsiz_fonksiyonlar(kaynak):\n    agac = ast.parse(kaynak)\n    bulunan = []\n    for dugum in ast.walk(agac):\n        if isinstance(dugum, (ast.FunctionDef, ast.AsyncFunctionDef)):\n            if ast.get_docstring(dugum) is None:\n                bulunan.append((dugum.lineno, dugum.name))\n    bulunan.sort()\n    return [ad for _, ad in bulunan]\n',
      tests: 'kod = """\ndef toplam(a, b):\n    \\"\\"\\"İki sayıyı toplar.\\"\\"\\"\n    return a + b\n\ndef fark(a, b):\n    # yorum docstring değildir\n    return a - b\n\nclass Hesap:\n    \\"\\"\\"Banka hesabı.\\"\\"\\"\n    def yatir(self, tutar):\n        def _kontrol(t):\n            return t > 0\n        return _kontrol(tutar)\n\n    def bakiye(self):\n        \\"\\"\\"Bakiyeyi döndürür.\\"\\"\\"\n        return 0\n"""\nassert docstringsiz_fonksiyonlar(kod) == ["fark", "yatir", "_kontrol"], "Beklenen [\'fark\', \'yatir\', \'_kontrol\'] (satır sırasıyla), gelen " + str(docstringsiz_fonksiyonlar(kod))\nassert docstringsiz_fonksiyonlar("x = 1\\n") == [], "Fonksiyon yoksa boş liste"\nassert docstringsiz_fonksiyonlar("async def getir():\\n    return 1\\n") == ["getir"], "async fonksiyonlar da sayılmalı"\n',
      hints: [
        'ast.walk tüm düğümleri (iç içe olanlar dahil) gezer ama sırası kaynaktaki sıra değildir; bu yüzden lineno ile sıralaman gerekir.',
        'isinstance(dugum, (ast.FunctionDef, ast.AsyncFunctionDef)) ve ast.get_docstring(dugum) is None',
        'bulunan.append((dugum.lineno, dugum.name)); bulunan.sort(); return [ad for _, ad in bulunan]'
      ],
      why: 'ast, kodu metin olarak değil yapı olarak okur: yorum ile docstring\'i, fonksiyon ile değişkeni ayırt eder. ruff\'ın D (pydocstyle) kuralları ve birçok kalite aracı tam olarak bu ağaç üzerinde çalışır.' },
    { id: 'kod-stili-r3',
      t: 'code',
      stage: 'Rehberli',
      diff: 2,
      q: '<p><b>Refactor:</b> İskeletteki <code>f(a, s)</code> fonksiyonu Anadolu Market\'in kargo ücretini doğru hesaplıyor ama okunmuyor. Davranışı <b>aynen koruyarak</b> <code>kargo_ucreti(agirlik_kg, sehir)</code> fonksiyonunu yaz ve sihirli sayıları şu modül sabitlerine taşı:</p><ul><li><code>TABAN_UCRET = 40</code>, <code>KG_BASI_EK = 12</code>, <code>UZAK_BOLGE_EK = 25</code></li><li><code>UZAK_SEHIRLER = ("Van", "Hakkari")</code></li></ul><p>Testler, fonksiyon gövdesinde 0 ve 1 dışında sayı kalmadığını da denetler.</p>',
      guide: [
        'Dört sabiti dosyanın üstünde tanımla.',
        'Ağırlık 1 kg\'ı aşıyorsa aşan her kg için KG_BASI_EK eklenir; ek ücreti ayrı bir değişkende hesapla.',
        'Şehir UZAK_SEHIRLER içindeyse UZAK_BOLGE_EK ekle (in ile).',
        'Toplamı döndür; eski f fonksiyonunu silebilirsin.'
      ],
      example: 'SAATLIK_UCRET = 250\nMESAI_CARPANI = 1.5\nNORMAL_SAAT = 45\n\ndef haftalik_ucret(calisilan_saat):\n    fazla_mesai = max(0, calisilan_saat - NORMAL_SAAT)\n    normal = calisilan_saat - fazla_mesai\n    return normal * SAATLIK_UCRET + fazla_mesai * SAATLIK_UCRET * MESAI_CARPANI\n\nprint(haftalik_ucret(40), haftalik_ucret(50))\n',
      start: 'def f(a, s):\n    if s == "Van" or s == "Hakkari":\n        return 40 + (a - 1) * 12 + 25 if a > 1 else 40 + 25\n    else:\n        return 40 + (a - 1) * 12 if a > 1 else 40\n\n# TODO: sabitleri tanımla\n# TODO: def kargo_ucreti(agirlik_kg, sehir): ...\n',
      sol: 'TABAN_UCRET = 40\nKG_BASI_EK = 12\nUZAK_BOLGE_EK = 25\nUZAK_SEHIRLER = ("Van", "Hakkari")\n\n\ndef kargo_ucreti(agirlik_kg, sehir):\n    """Ağırlık ve şehre göre kargo ücretini döndürür."""\n    ek_kilo = max(0, agirlik_kg - 1)\n    ucret = TABAN_UCRET + ek_kilo * KG_BASI_EK\n    if sehir in UZAK_SEHIRLER:\n        ucret += UZAK_BOLGE_EK\n    return ucret\n',
      tests: 'import ast\n\ndef _eski(a, s):\n    if s == "Van" or s == "Hakkari":\n        return 40 + (a - 1) * 12 + 25 if a > 1 else 40 + 25\n    return 40 + (a - 1) * 12 if a > 1 else 40\n\nassert (TABAN_UCRET, KG_BASI_EK, UZAK_BOLGE_EK) == (40, 12, 25), "Sabit değerleri görevdeki gibi olmalı"\nassert set(UZAK_SEHIRLER) == {"Van", "Hakkari"}, "UZAK_SEHIRLER Van ve Hakkari\'yi içermeli"\nfor agirlik in [0.5, 1, 2, 3.5, 10]:\n    for sehir in ["İzmir", "Van", "Hakkari", "Ankara"]:\n        assert abs(kargo_ucreti(agirlik, sehir) - _eski(agirlik, sehir)) < 1e-9, f"Davranış değişti: {agirlik} kg, {sehir}"\n_fn = [d for d in ast.walk(ast.parse(__source__)) if isinstance(d, ast.FunctionDef) and d.name == "kargo_ucreti"][0]\n_sayilar = [d.value for d in ast.walk(_fn) if isinstance(d, ast.Constant) and type(d.value) in (int, float)]\nassert all(v in (0, 1) for v in _sayilar), "kargo_ucreti içinde sihirli sayı kaldı: " + str([v for v in _sayilar if v not in (0, 1)])\n',
      hints: [
        'Önce sabitleri yaz, sonra eski formüldeki 40, 12, 25 yerine adlarını koy.',
        'a > 1 ise (a - 1) * 12, değilse 0: bunu max(0, agirlik_kg - 1) * KG_BASI_EK ile tek ifadede yazabilirsin.',
        'if sehir in UZAK_SEHIRLER: ucret += UZAK_BOLGE_EK'
      ],
      why: 'Davranış aynı, ama artık ücret değişince tek satır güncellenir ve kod iş kuralını kendisi anlatır. Eski koddaki iki dallı tekrar da (DRY ihlali) ortadan kalktı.' },
    { id: 'kod-stili-k1',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p><b>Erken dönüşle yeniden yaz.</b> Anadolu Bank\'ın ön onay kuralları, sırasıyla:</p><ol><li><code>yas &lt; 18</code> → <code>"red: yaş"</code></li><li><code>aylik_gelir &lt; 20000</code> → <code>"red: gelir"</code></li><li><code>borc_orani &gt; 0.5</code> → <code>"red: borç"</code></li><li>Hepsi geçerse → <code>"ön onay"</code></li></ol><p><code>kredi_on_onay(yas, aylik_gelir, borc_orani)</code> fonksiyonunu <b>else ve elif kullanmadan</b>, iç içe if olmadan (her if fonksiyon gövdesinin doğrudan içinde) yaz.</p>',
      start: 'def kredi_on_onay(yas, aylik_gelir, borc_orani):\n    if yas >= 18:\n        if aylik_gelir >= 20000:\n            if borc_orani <= 0.5:\n                return "ön onay"\n            else:\n                return "red: borç"\n        else:\n            return "red: gelir"\n    else:\n        return "red: yaş"\n',
      sol: 'def kredi_on_onay(yas, aylik_gelir, borc_orani):\n    if yas < 18:\n        return "red: yaş"\n    if aylik_gelir < 20000:\n        return "red: gelir"\n    if borc_orani > 0.5:\n        return "red: borç"\n    return "ön onay"\n',
      tests: 'import ast\nassert kredi_on_onay(17, 50000, 0.1) == "red: yaş", "17 yaş reddedilmeli"\nassert kredi_on_onay(30, 15000, 0.1) == "red: gelir", "Düşük gelir reddedilmeli"\nassert kredi_on_onay(30, 40000, 0.7) == "red: borç", "Yüksek borç oranı reddedilmeli"\nassert kredi_on_onay(18, 20000, 0.5) == "ön onay", "Sınır değerler (18, 20000, 0.5) onaylanmalı"\nassert kredi_on_onay(16, 1000, 0.9) == "red: yaş", "Kurallar sırayla denetlenmeli: önce yaş"\n_fn = [d for d in ast.walk(ast.parse(__source__)) if isinstance(d, ast.FunctionDef) and d.name == "kredi_on_onay"][0]\n_ifler = [d for d in ast.walk(_fn) if isinstance(d, ast.If)]\nassert all(not d.orelse for d in _ifler), "else/elif kullanma: geçersiz durumu return ile erkenden ele"\nassert all(d in _fn.body for d in _ifler), "İç içe if olmamalı; her if fonksiyon gövdesinin doğrudan içinde olmalı"\n',
      hints: [
        'Koşulları tersine çevir: "yaş 18 ve üstüyse devam" yerine "18\'den küçükse hemen reddet".',
        'Her red durumu kendi if\'i ve return\'üyle; en sonda koşulsuz return "ön onay".'
      ],
      why: 'Erken dönüşle her kural tek satırda okunur, yeni kural eklemek bir if eklemek kadar kolaydır ve girinti hiç derinleşmez. İç içe merdivende ise hangi else\'in hangi if\'e ait olduğunu takip etmek gerekir.' },
    { id: 'kod-stili-k2',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 1,
      q: '<p>Küçük bir stil denetleyicisi: <code>uzun_satirlar(kaynak, sinir=79)</code> kaynak metindeki satırlardan uzunluğu <code>sinir</code>\'ı <b>aşan</b> satırların numaralarını (1\'den başlayarak) liste olarak döndürsün. Satır sonundaki boşluklar da uzunluğa dahildir; satır sonu karakteri dahil değildir.</p>',
      start: 'def uzun_satirlar(kaynak, sinir=79):\n    pass\n',
      sol: 'def uzun_satirlar(kaynak, sinir=79):\n    return [no for no, satir in enumerate(kaynak.splitlines(), start=1) if len(satir) > sinir]\n',
      tests: 'kod = "x = 1\\n" + "y = " + "1 + " * 20 + "1\\n" + "\\n" + "z = 2" + " " * 80 + "\\n"\nassert uzun_satirlar(kod) == [2, 4], "2. satır uzun, 4. satır sondaki boşluklar yüzünden uzun: [2, 4] beklenir; gelen " + str(uzun_satirlar(kod))\nassert uzun_satirlar("a" * 79) == [], "Tam 79 karakter sınırı AŞMAZ"\nassert uzun_satirlar("a" * 80) == [1], "80 karakter sınırı aşar"\nassert uzun_satirlar("kisa\\n" + "b" * 90, sinir=88) == [2], "sinir parametresi kullanılmalı"\nassert uzun_satirlar("") == [], "Boş metinde boş liste"\n',
      hints: [
        'splitlines() satırları satır sonu olmadan verir; enumerate(..., start=1) 1\'den numaralandırır.',
        'Koşul len(satir) > sinir (eşitlik serbest).'
      ],
      why: 'pycodestyle\'ın E501 kuralı bu kadar basittir. Liste kavrayışı (list comprehension) ile tek satırda yazılabilir; bu yapıyı orta seviyede ayrıntılı göreceksin.' },
    { id: 'kod-stili-k3',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p><b>DRY refactor.</b> Ekipteki bir rapor betiği aynı bloğu her şehir için kopyalamış:</p><pre class="out">izmir_adet = 0\nizmir_toplam = 0\nfor s in siparisler:\n    if s["sehir"] == "İzmir":\n        izmir_adet += 1\n        izmir_toplam += s["tutar"]\nprint("İzmir: " + str(izmir_adet) + " sipariş, " + str(round(izmir_toplam, 2)) + " TL")\n# ... aynısı Ankara ve Bursa için ...</pre><p>Bunun yerine iki fonksiyon yaz:</p><ul><li><code>sehir_raporu(siparisler, sehir)</code> → <code>"İzmir: 2 sipariş, 420.50 TL"</code> biçiminde metin (tutar her zaman 2 ondalık)</li><li><code>tum_raporlar(siparisler, sehirler)</code> → her şehir için bir satır içeren liste</li></ul><p>Kodunda şehir adı (İzmir, Ankara, Bursa) <b>hiç geçmemeli</b>.</p>',
      start: 'def sehir_raporu(siparisler, sehir):\n    pass\n\n\ndef tum_raporlar(siparisler, sehirler):\n    pass\n',
      sol: 'def sehir_raporu(siparisler, sehir):\n    """Bir şehrin sipariş sayısını ve cirosunu tek satırlık metin olarak döndürür."""\n    adet = 0\n    toplam = 0\n    for siparis in siparisler:\n        if siparis["sehir"] == sehir:\n            adet += 1\n            toplam += siparis["tutar"]\n    return f"{sehir}: {adet} sipariş, {toplam:.2f} TL"\n\n\ndef tum_raporlar(siparisler, sehirler):\n    """Her şehir için rapor satırlarını liste olarak döndürür."""\n    return [sehir_raporu(siparisler, sehir) for sehir in sehirler]\n',
      tests: 'sip = [\n    {"sehir": "İzmir", "tutar": 300},\n    {"sehir": "Ankara", "tutar": 150.25},\n    {"sehir": "İzmir", "tutar": 120.5},\n]\nassert sehir_raporu(sip, "İzmir") == "İzmir: 2 sipariş, 420.50 TL", "Biçim: \'İzmir: 2 sipariş, 420.50 TL\'; gelen " + repr(sehir_raporu(sip, "İzmir"))\nassert sehir_raporu(sip, "Bursa") == "Bursa: 0 sipariş, 0.00 TL", "Siparişi olmayan şehir: 0 sipariş, 0.00 TL"\nassert tum_raporlar(sip, ["Ankara", "Bursa"]) == ["Ankara: 1 sipariş, 150.25 TL", "Bursa: 0 sipariş, 0.00 TL"], "tum_raporlar her şehir için bir satır döndürmeli"\nfor ad in ["İzmir", "Ankara", "Bursa"]:\n    assert ad not in __source__, ad + " kodda geçmemeli: şehir bir parametredir, sabit kodlanmamalı"\n',
      hints: ['Değişen tek şey şehir adı: onu parametre yap.', 'f-string\'te {toplam:.2f} her zaman 2 ondalık yazar.'],
      why: 'Tekrarlanan blok bir fonksiyona dönüşünce yeni şehir eklemek tek kelimelik bir değişiklik olur ve biçim değişikliği tek yerden yapılır.' },
    { id: 'kod-stili-b1',
      t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      diff: 1,
      q: '<p><b>Hatayı bul ve düzelt.</b> KDV oranı geçen yıl %18\'den %20\'ye çıktı. Muhasebe, sepet toplamı ile ürün fiyatlarının toplamının tutmadığını bildirdi. Sorunu düzelt ve bir daha olmaması için oranı tek bir <code>KDV_ORANI = 0.20</code> sabitine taşı; üç fonksiyon da onu kullansın.</p>',
      start: 'def urun_fiyati(net):\n    return round(net * 1.20, 2)\n\n\ndef sepet_toplami(netler):\n    return round(sum(netler) * 1.18, 2)\n\n\ndef fatura_satiri(urun, net):\n    return f"{urun}: {round(net * 1.20, 2)} TL"\n',
      sol: 'KDV_ORANI = 0.20\n\n\ndef urun_fiyati(net):\n    return round(net * (1 + KDV_ORANI), 2)\n\n\ndef sepet_toplami(netler):\n    return round(sum(netler) * (1 + KDV_ORANI), 2)\n\n\ndef fatura_satiri(urun, net):\n    return f"{urun}: {urun_fiyati(net)} TL"\n',
      tests: 'assert sepet_toplami([100, 50]) == 180.0, "150 TL net, %20 KDV ile 180.0 olmalı"\nassert urun_fiyati(100) == 120.0, "100 TL net ürün 120.0 olmalı"\nassert fatura_satiri("Çay", 50) == "Çay: 60.0 TL", "Fatura satırı \'Çay: 60.0 TL\' olmalı"\nassert KDV_ORANI == 0.20, "KDV_ORANI sabiti 0.20 olmalı"\nassert "1.18" not in __source__ and "1.20" not in __source__ and "1.2)" not in __source__, "Oran sayı olarak tekrar yazılmamalı; KDV_ORANI sabitini kullan"\n',
      hints: [
        'Üç fonksiyondaki çarpanları karşılaştır: biri farklı.',
        'Sabiti dosyanın başında tanımla ve çarpanı (1 + KDV_ORANI) olarak yaz.'
      ],
      why: 'Aynı sayı üç yerde yazılınca oran değiştiğinde biri unutuldu: DRY ihlalinin tipik sonucu. Sabit, bilginin tek kaynağı (single source of truth) olur.' },
    { id: 'kod-stili-b2',
      t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      diff: 2,
      q: '<p><b>Hatayı bul ve düzelt.</b> IBAN\'ın ülke kodunu kontrol eden fonksiyon <code>"TR33..."</code> için bazen "yurt dışı" diyor, <code>eksik_mi</code> ise PEP 8 denetiminden geçmiyor. PEP 8 kuralı: <code>is</code> yalnızca <code>None</code> gibi tekil nesnelerle, değer karşılaştırması <code>==</code> ile yapılır.</p>',
      start: 'def iban_bolgesi(iban):\n    """TR ile başlayan IBAN\'ları yurt içi sayar."""\n    ulke = iban.replace(" ", "")[:2].upper()\n    if ulke is "TR":\n        return "yurt içi"\n    return "yurt dışı"\n\n\ndef eksik_mi(deger):\n    return deger == None or deger == ""\n',
      sol: 'def iban_bolgesi(iban):\n    """TR ile başlayan IBAN\'ları yurt içi sayar."""\n    ulke = iban.replace(" ", "")[:2].upper()\n    if ulke == "TR":\n        return "yurt içi"\n    return "yurt dışı"\n\n\ndef eksik_mi(deger):\n    return deger is None or deger == ""\n',
      tests: 'assert iban_bolgesi("tr33 0006 1005 1978 6457 8413 26") == "yurt içi", "Küçük harfli TR IBAN da yurt içi olmalı"\nassert iban_bolgesi("TR33 0006 1005 1978 6457 8413 26") == "yurt içi", "TR IBAN yurt içi olmalı"\nassert iban_bolgesi("DE89 3704 0044 0532 0130 00") == "yurt dışı", "DE IBAN yurt dışı olmalı"\nassert eksik_mi(None) and eksik_mi("") and not eksik_mi(0), "None ve boş metin eksik, 0 eksik değil"\nassert \'is "\' not in __source__, "Metinleri is ile karşılaştırma; == kullan"\nassert "== None" not in __source__, "None ile karşılaştırma is None ile yapılır"\n',
      hints: [
        'is "aynı nesne mi?" diye sorar; upper() her seferinde YENİ bir metin nesnesi üretir.',
        'ulke == "TR" ve deger is None'
      ],
      why: 'is kimlik, == eşitlik karşılaştırmasıdır. Kısa metinler bazen önbelleğe alındığı için is tesadüfen çalışır; bu yüzden hata "bazen" görünür. Python 3.8+ bu kullanım için SyntaxWarning de verir. None tekil olduğundan onu is ile karşılaştırmak hem doğru hem PEP 8 önerisidir.' },
    { id: 'kod-stili-m1',
      t: 'code',
      stage: 'Meydan okuma',
      diff: 3,
      q: '<p>Mini bir adlandırma linter\'ı yaz: <code>adlandirma_denetle(kaynak)</code> kaynağı <code>ast</code> ile tarasın ve şu ihlalleri <b>satır numarasına göre sıralı</b> metin listesi olarak döndürsün:</p><ul><li>Fonksiyon adı snake_case değilse: <code>"3: fonksiyon \'hesaplaToplam\' snake_case değil"</code></li><li>Sınıf adı PascalCase değilse: <code>"7: sınıf \'banka_hesabi\' PascalCase değil"</code></li><li>Parametre adı snake_case değilse: <code>"3: parametre \'Tutar\' snake_case değil"</code> (satır: parametrenin satırı)</li></ul><p>Başında alt çizgi olan adlar (<code>_yardimci</code>, <code>__init__</code>) baştaki/sondaki alt çizgiler atılarak denetlenir. Aynı satırda birden çok ihlal varsa önce fonksiyon/sınıf, sonra parametreler (soldan sağa) gelir. Desenler: snake <code>[a-z][a-z0-9]*(_[a-z0-9]+)*</code>, Pascal <code>([A-Z][a-z0-9]+)+</code>.</p>',
      start: 'import ast\nimport re\n\ndef adlandirma_denetle(kaynak):\n    pass\n',
      sol: 'import ast\nimport re\n\nSNAKE = re.compile(r"[a-z][a-z0-9]*(_[a-z0-9]+)*")\nPASCAL = re.compile(r"([A-Z][a-z0-9]+)+")\n\n\ndef _uygun(desen, ad):\n    return desen.fullmatch(ad.strip("_")) is not None\n\n\ndef adlandirma_denetle(kaynak):\n    """Fonksiyon, sınıf ve parametre adlarındaki PEP 8 ihlallerini döndürür."""\n    bulgular = []\n    for dugum in ast.walk(ast.parse(kaynak)):\n        if isinstance(dugum, (ast.FunctionDef, ast.AsyncFunctionDef)):\n            if not _uygun(SNAKE, dugum.name):\n                bulgular.append((dugum.lineno, dugum.col_offset, f"{dugum.lineno}: fonksiyon \'{dugum.name}\' snake_case değil"))\n            argumanlar = dugum.args.posonlyargs + dugum.args.args + dugum.args.kwonlyargs\n            for arg in argumanlar:\n                if not _uygun(SNAKE, arg.arg):\n                    bulgular.append((arg.lineno, arg.col_offset, f"{arg.lineno}: parametre \'{arg.arg}\' snake_case değil"))\n        elif isinstance(dugum, ast.ClassDef):\n            if not _uygun(PASCAL, dugum.name):\n                bulgular.append((dugum.lineno, dugum.col_offset, f"{dugum.lineno}: sınıf \'{dugum.name}\' PascalCase değil"))\n    bulgular.sort()\n    return [metin for _, _, metin in bulgular]\n',
      tests: 'kod = """import math\n\ndef hesaplaToplam(Tutar, adet):\n    return Tutar * adet\n\ndef _yardimci(x):\n    return x\n\nclass banka_hesabi:\n    def __init__(self, ilkBakiye):\n        self.bakiye = ilkBakiye\n\n    def ParaYatir(self, tutar):\n        return tutar\n\nclass KrediBasvurusu:\n    pass\n"""\nbeklenen = [\n    "3: fonksiyon \'hesaplaToplam\' snake_case değil",\n    "3: parametre \'Tutar\' snake_case değil",\n    "9: sınıf \'banka_hesabi\' PascalCase değil",\n    "10: parametre \'ilkBakiye\' snake_case değil",\n    "13: fonksiyon \'ParaYatir\' snake_case değil",\n]\nsonuc = adlandirma_denetle(kod)\nassert sonuc == beklenen, "Beklenen:\\n" + "\\n".join(beklenen) + "\\nGelen:\\n" + "\\n".join(map(str, sonuc or []))\nassert adlandirma_denetle("def f(a, *, b_c=1):\\n    pass\\n") == [], "Uygun adlarda boş liste"\nassert adlandirma_denetle("def g(*, Oran):\\n    pass\\n") == ["1: parametre \'Oran\' snake_case değil"], "Yalnız-anahtar (keyword-only) parametreler de denetlenmeli"\n',
      hints: [
        'ast.walk ile FunctionDef ve ClassDef düğümlerini bul; parametreler dugum.args.args, posonlyargs ve kwonlyargs listelerindedir (her biri ast.arg, adı .arg).',
        'Sıralamayı garantiye almak için her bulguyu (satır, sütun, metin) demeti olarak biriktir ve sort et; def adının sütunu parametrelerinkinden küçüktür.',
        'Alt çizgileri at: ad.strip("_") ve desen.fullmatch(...) ile denetle.'
      ],
      why: 'Gerçek linter\'lar (ruff\'ın N kuralları) aynı yolu izler: kaynağı ağaca çevirir, düğümleri gezer, her kural bir desen ya da koşuldur. (satır, sütun) ile sıralamak çıktıyı deterministik ve editördeki konumla uyumlu yapar.' },
    { id: 'kod-stili-m2',
      t: 'code',
      stage: 'Meydan okuma',
      diff: 3,
      q: '<p>isort\'un küçük bir kopyası: <code>importlari_duzenle(satirlar, yerel=())</code> import satırlarından oluşan listeyi PEP 8 düzenine soksun ve yeni liste döndürsün:</p><ul><li>Gruplar: 1) standart kütüphane (üst modül adı <code>sys.stdlib_module_names</code> içinde), 2) üçüncü taraf, 3) yerel (üst modül adı <code>yerel</code> içinde ya da <code>from .</code> ile başlayan).</li><li>Her grup modül adına göre (küçük harfe çevrilmiş) alfabetik; modül adı aynıysa satır metnine göre.</li><li>Boş olmayan gruplar arasına tek bir <code>""</code> satırı; başta ve sonda boş satır yok.</li><li>Satırlardaki baş/son boşlukları temizle, boş satırları ve tekrarları at.</li></ul><p>Modül adı: <code>import a.b as c</code> → <code>a.b</code>; <code>from a.b import c</code> → <code>a.b</code>. Üst modül adı ilk noktaya kadarki kısımdır.</p>',
      start: 'import sys\n\ndef importlari_duzenle(satirlar, yerel=()):\n    pass\n',
      sol: 'import sys\n\n\ndef _modul_adi(satir):\n    parcalar = satir.split()\n    return parcalar[1]\n\n\ndef _grup(modul, yerel):\n    if modul.startswith("."):\n        return 2\n    ust = modul.split(".")[0]\n    if ust in yerel:\n        return 2\n    if ust in sys.stdlib_module_names:\n        return 0\n    return 1\n\n\ndef importlari_duzenle(satirlar, yerel=()):\n    """Import satırlarını standart / üçüncü taraf / yerel gruplarına ayırıp sıralar."""\n    temiz = {s.strip() for s in satirlar if s.strip()}\n    gruplar = [[], [], []]\n    for satir in temiz:\n        modul = _modul_adi(satir)\n        gruplar[_grup(modul, yerel)].append((modul.lower(), satir))\n    sonuc = []\n    for grup in gruplar:\n        if not grup:\n            continue\n        if sonuc:\n            sonuc.append("")\n        sonuc.extend(satir for _, satir in sorted(grup))\n    return sonuc\n',
      tests: 'girdi = [\n    "import pandas as pd",\n    "from rapor.ayarlar import KDV_ORANI",\n    "  import json",\n    "",\n    "from pathlib import Path",\n    "import numpy as np",\n    "from . import yardimci",\n    "import csv",\n    "import json",\n    "from collections import Counter",\n]\nbeklenen = [\n    "from collections import Counter",\n    "import csv",\n    "import json",\n    "from pathlib import Path",\n    "",\n    "import numpy as np",\n    "import pandas as pd",\n    "",\n    "from . import yardimci",\n    "from rapor.ayarlar import KDV_ORANI",\n]\nsonuc = importlari_duzenle(girdi, yerel=("rapor",))\nassert sonuc == beklenen, "Beklenen:\\n" + "\\n".join(beklenen) + "\\nGelen:\\n" + "\\n".join(map(str, sonuc or []))\nassert importlari_duzenle(["import requests", "import os.path"]) == ["import os.path", "", "import requests"], "os.path\'in üst modülü os: standart kütüphane"\nassert importlari_duzenle(["import Zebra_lib", "import attr"]) == ["import attr", "import Zebra_lib"], "Sıralama büyük-küçük harfe duyarsız olmalı"\nassert importlari_duzenle([]) == [], "Boş girdide boş liste"\n',
      hints: [
        '"import x" ve "from x import y" satırlarının ikisinde de modül adı ikinci kelimedir: satir.split()[1].',
        'Üç gruplu bir liste tut ([[], [], []]); her satırı (modul.lower(), satir) demeti olarak doğru gruba ekle ve sorted ile sırala.',
        'Tekrarları atmak için önce temizlenmiş satırları bir kümeye koy; grupları birleştirirken yalnızca sonuç boş değilse araya "" ekle.'
      ],
      why: 'Sıralama anahtarını (modül adı, satır) demeti olarak kurmak hem birincil hem ikincil sıralamayı tek seferde çözer. sys.stdlib_module_names Python 3.10\'dan beri standart kütüphane modüllerinin resmi listesidir; isort ve ruff da benzer listeler kullanır.' },
    { id: 'kod-stili-p1',
      t: 'code',
      stage: 'Mini proje',
      diff: 3,
      q: '<p><b>Dağınık rapor betiğini temizle.</b> İskeletteki <code>r(l)</code> fonksiyonu doğru sonuç üretiyor ama okunmuyor. Veri anahtarları değiştirilemez (başka sistemden geliyor): <code>"d"</code> durum, <code>"a"</code> adet, <code>"p"</code> birim fiyat, <code>"c"</code> şehir.</p><p>Aynı metni üreten şu yapıyı kur:</p><ul><li><code>siparis_tutari(siparis)</code>: adet × birim fiyat</li><li><code>sehre_gore_ciro(siparisler)</code>: yalnızca durumu <code>"ok"</code> olanlar için şehir → ciro sözlüğü (şehirler ilk görülme sırasıyla)</li><li><code>siparis_raporu(siparisler)</code>: <code>r</code> ile <b>birebir aynı</b> metni döndürür</li></ul><p>Kurallar: her fonksiyonun docstring\'i olsun; fonksiyon, parametre ve değişken adları en az 3 karakter (<code>_</code> hariç); <code>"ok"</code> durumu <code>ONAYLI_DURUM</code> sabitinde dursun; hiçbir satır 79 karakteri aşmasın; eski <code>r</code> fonksiyonunu sil.</p>',
      start: 'def r(l):\n    t=0\n    d={}\n    for x in l:\n        if x["d"]=="ok":\n            t=t+x["a"]*x["p"]\n            if x["c"] in d:\n                d[x["c"]]=d[x["c"]]+x["a"]*x["p"]\n            else:\n                d[x["c"]]=x["a"]*x["p"]\n    s=""\n    for k in d:\n        s=s+k+": "+str(round(d[k],2))+"\\n"\n    s=s+"TOPLAM: "+str(round(t,2))\n    return s\n\n# TODO: ONAYLI_DURUM, siparis_tutari, sehre_gore_ciro, siparis_raporu\n',
      sol: 'ONAYLI_DURUM = "ok"\n\n\ndef siparis_tutari(siparis):\n    """Siparişin tutarını (adet x birim fiyat) döndürür."""\n    return siparis["a"] * siparis["p"]\n\n\ndef sehre_gore_ciro(siparisler):\n    """Onaylı siparişlerin şehir bazında toplam cirosunu döndürür."""\n    ciro = {}\n    for siparis in siparisler:\n        if siparis["d"] != ONAYLI_DURUM:\n            continue\n        sehir = siparis["c"]\n        ciro[sehir] = ciro.get(sehir, 0) + siparis_tutari(siparis)\n    return ciro\n\n\ndef siparis_raporu(siparisler):\n    """Şehir satırları ve genel toplamdan oluşan rapor metnini döndürür."""\n    ciro = sehre_gore_ciro(siparisler)\n    satirlar = [f"{sehir}: {round(tutar, 2)}" for sehir, tutar in ciro.items()]\n    satirlar.append(f"TOPLAM: {round(sum(ciro.values()), 2)}")\n    return "\\n".join(satirlar)\n',
      tests: 'import ast\n\ndef _eski(l):\n    t = 0\n    d = {}\n    for x in l:\n        if x["d"] == "ok":\n            t = t + x["a"] * x["p"]\n            if x["c"] in d:\n                d[x["c"]] = d[x["c"]] + x["a"] * x["p"]\n            else:\n                d[x["c"]] = x["a"] * x["p"]\n    s = ""\n    for k in d:\n        s = s + k + ": " + str(round(d[k], 2)) + "\\n"\n    s = s + "TOPLAM: " + str(round(t, 2))\n    return s\n\nveri = [\n    {"d": "ok", "a": 2, "p": 49.9, "c": "İzmir"},\n    {"d": "iptal", "a": 1, "p": 500, "c": "Ankara"},\n    {"d": "ok", "a": 1, "p": 1250, "c": "Ankara"},\n    {"d": "ok", "a": 3, "p": 15.5, "c": "İzmir"},\n]\nassert siparis_tutari(veri[0]) == 2 * 49.9, "siparis_tutari adet x fiyat olmalı"\nassert sehre_gore_ciro(veri) == {"İzmir": 2 * 49.9 + 3 * 15.5, "Ankara": 1250}, "sehre_gore_ciro yalnızca \'ok\' siparişleri saymalı"\nfor ornek in [veri, [], veri[1:2], veri[::-1]]:\n    assert siparis_raporu(ornek) == _eski(ornek), "Rapor metni eski r() ile birebir aynı olmalı. Beklenen:\\n" + _eski(ornek) + "\\nGelen:\\n" + str(siparis_raporu(ornek))\nassert ONAYLI_DURUM == "ok", "ONAYLI_DURUM sabiti \'ok\' olmalı"\n_agac = ast.parse(__source__)\n_fonks = [d for d in ast.walk(_agac) if isinstance(d, ast.FunctionDef)]\nassert "r" not in [f.name for f in _fonks], "Eski r fonksiyonunu sil"\nfor _f in _fonks:\n    assert ast.get_docstring(_f), _f.name + " fonksiyonunun docstring\'i olmalı"\n_adlar = [f.name for f in _fonks] + [a.arg for f in _fonks for a in f.args.args]\n_adlar += [d.id for d in ast.walk(_agac) if isinstance(d, ast.Name) and isinstance(d.ctx, ast.Store)]\n_kisa = sorted({a for a in _adlar if len(a) < 3 and a != "_"})\nassert not _kisa, "Anlamsız kısa adlar var: " + str(_kisa)\nassert all(len(s) <= 79 for s in __source__.splitlines()), "79 karakteri aşan satır var"\n',
      hints: [
        'Önce siparis_tutari\'yı yaz; r içinde x["a"]*x["p"] üç kez tekrar ediyor.',
        'Şehir toplamı için ciro.get(sehir, 0) + ... kalıbı if/else\'i gereksiz kılar. Genel toplam, onaylı şehir cirolarının toplamıyla aynıdır.',
        'Rapor: önce satırları bir listede topla, sonra "\\n".join; f"{sehir}: {round(tutar, 2)}" eski str(round(...)) ile aynı metni üretir.'
      ],
      why: 'Davranış eski fonksiyonla karşılaştırılarak korundu (karakterizasyon testi), yapı ise üç küçük, adı ve docstring\'i olan fonksiyona ayrıldı. Gerçek projelerde eski kodu temizlerken izlenen yol tam olarak budur: önce davranışı kilitle, sonra yeniden düzenle.' }
  ],
  faq: [
    { q: 'Satır sınırı 79 mu, 88 mi, 120 mi?',
      a: 'PEP 8 79 der; black ve ruff varsayılanı 88\'dir; bazı ekipler 100-120 kullanır. Doğru sayı, ekibinin pyproject.toml dosyasında yazan sayıdır. Önemli olan herkesin aynı sınırı kullanması ve bunu bir aracın denetlemesidir.' },
    { q: 'Her fonksiyona docstring yazmak zorunda mıyım?',
      a: 'Başkalarının çağıracağı (public) her fonksiyon, sınıf ve modül için evet. _ ile başlayan küçük iç yardımcılarda, adı ve tip ipuçları yeterince açıksa atlanabilir. Kural koymak yerine ruff\'ın D kurallarıyla hangi düzeyin zorunlu olduğunu ekipçe seçin.' },
    { q: 'black ile ruff arasında hangisini seçmeliyim?',
      a: 'İkisi farklı işler yapar: black biçimlendirir, ruff denetler (ve ruff format ile black uyumlu biçimlendirme de yapar). Yeni projelerde çoğu ekip tek araçla ilerlemek için yalnızca ruff (check + format) kullanır.' },
    { q: 'Kısa değişken adları hiç mi kullanılmaz?',
      a: 'Kısa kapsamda kullanılır: üç satırlık döngüde i, matematik formülünde x ve y, comprehension\'da tek harf kabul görür. Kural "ad, kapsamı kadar uzun olsun"dur: modül boyunca yaşayan bir değişken tek harf olamaz.' },
    { q: 'Yorum mu yazmalıyım, kodu mu açık yazmalıyım?',
      a: 'Önce kodu açık yaz: anlamlı ad, küçük fonksiyon, adlandırılmış sabit. Bunlar yetmiyorsa, yani kodun neden öyle olduğu (iş kuralı, dış sistemin tuhaflığı, performans tercihi) koddan anlaşılmıyorsa yorum yaz.' }
  ],
  mistakes: [
    { bad: 'def HesaplaToplam(siparisListesi):\n    ...',
      good: 'def hesapla_toplam(siparisler):\n    ...',
      why: 'Fonksiyon ve parametre adları snake_case yazılır; PascalCase sınıflara aittir. Liste olduğunu adla değil çoğul ekle belirtmek yeterlidir.' },
    { bad: 'if puan > 1250:\n    limit = gelir * 3',
      good: 'PRIM_ESIGI = 1250\nLIMIT_CARPANI = 3\nif puan > PRIM_ESIGI:\n    limit = gelir * LIMIT_CARPANI',
      why: 'Sihirli sayının anlamını yalnızca yazan bilir ve değiştiğinde tüm kopyaları bulmak gerekir.' },
    { bad: 'import os, sys\nfrom hesap import *',
      good: 'import os\nimport sys\n\nfrom hesap import faiz_hesapla',
      why: 'Her satırda tek import; yıldızlı import hangi adların geldiğini gizler ve ad çakışmalarına yol açar.' },
    { bad: 'def f(x):\n    # x\'i 2 ile çarp\n    return x * 2',
      good: 'def iki_katina_cikar(tutar):\n    """Kampanya günü puanı ikiye katlar."""\n    return tutar * 2',
      why: 'Kodu tekrar eden yorum değer katmaz; iyi ad ve iş kuralını söyleyen docstring katar.' },
    { bad: 'if deger == None:\n    ...',
      good: 'if deger is None:\n    ...',
      why: 'None tekil bir nesnedir; PEP 8 onu is ile karşılaştırmayı ister. Değer karşılaştırması ise her zaman == ile yapılır.' }
  ] }
);
})(window);
/* PythonPatika — Mini projeler: oyunlar ve araçlar — temel / Bitirme */
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push(
{ id: 'proje-oyunlar',
  lv: 'temel',
  mod: 'Bitirme',
  min: 60,
  title: 'Mini projeler: oyunlar ve araçlar',
  sum: 'Sayı tahmin, adam asmaca, taş-kağıt-makas, şifre üretici, Sezar şifresi, hesap bölüşme ve ATM menüsünü gereksinimden tasarıma, adım adım inşadan teste kadar kurarak temel kavramları gerçek programlarda birleştirirsin.',
  goals: [
    'Bir projeyi gereksinim, tasarım, inşa ve test adımlarıyla planlayabilirim.',
    'Oyun mantığını saf fonksiyonlara, kullanıcı etkileşimini döngü fonksiyonuna ayırabilirim.',
    'random.seed ve random.Random ile rastgele davranan kodu tekrarlanabilir ve test edilebilir yapabilirim.',
    'while, match, sözlük, küme ve metin işlemlerini birleştirerek menü tabanlı programlar yazabilirim.',
    'Girdiyi doğrulayıp geçersiz değerlerde programın çökmesini önleyebilirim.'
  ],
  body: `
<h2>Neden mini projeler?</h2>
<p>Değişken, koşul, döngü, fonksiyon, liste ve sözlüğü tek tek öğrendin. Gerçek program ise bunların <b>birlikte</b> çalışmasıdır ve asıl beceri boş bir dosyaya bakıp "nereden başlayacağım?" sorusunu yanıtlayabilmektir. Bu derste yedi küçük, eğlenceli ama ciddi biçimde tasarlanmış proje yapacağız. Her biri aynı dört adımı izler:</p>
<div class="steps-list"><ol>
<li><b>Gereksinimler:</b> program tam olarak ne yapmalı? Kenar durumlar neler?</li>
<li><b>Tasarım:</b> işi hangi fonksiyonlara bölerim? Hangisi hesap yapar, hangisi kullanıcıyla konuşur?</li>
<li><b>Adım adım inşa:</b> en küçük çalışan parçayı yaz, dene, sonra büyüt.</li>
<li><b>Test:</b> fonksiyonları tek tek, oyun döngüsünü hazır girdilerle dene.</li>
</ol></div>
<div class="tbl-wrap"><table>
<tr><th>Proje</th><th>Birleştirdiği kavramlar</th></tr>
<tr><td>Sayı tahmin oyunu</td><td>random + seed, while, int dönüşümü, try/except</td></tr>
<tr><td>Adam asmaca</td><td>küme, metin birleştirme, oyun durumu</td></tr>
<tr><td>Taş-kağıt-makas</td><td>sözlükle kural tablosu, random.choice, skor</td></tr>
<tr><td>Şifre üretici</td><td>string modülü, random.Random, kurallı üretim</td></tr>
<tr><td>Sezar şifreleme</td><td>ord/chr, mod aritmetiği, metin dönüştürme</td></tr>
<tr><td>Bahşiş ve hesap bölüşme</td><td>kayan nokta, yuvarlama, doğrulama</td></tr>
<tr><td>ATM menüsü</td><td>while True, match, durum (bakiye) yönetimi</td></tr>
</table></div>

<h2>Tasarımın altın kuralı: mantığı girdi/çıktıdan ayır</h2>
<p>Yeni başlayan biri sayı tahmin oyununu tek bir <code>while</code> içinde, <code>input</code> ve <code>print</code> arasına gömülmüş <code>if</code>'lerle yazar. Çalışır ama test edilemez: her denemede klavyeden sayı girmen gerekir. Profesyonel yol iki katmandır:</p>
<ul>
<li><b>Saf fonksiyonlar</b> (mantık): girdi alır, değer döndürür, ekrana dokunmaz. <code>tahmin_degerlendir(50, 37)</code> → <code>"küçük"</code>.</li>
<li><b>Döngü fonksiyonu</b> (arayüz): kullanıcıyla konuşur, mantık fonksiyonlarını çağırır. Girdiyi <code>girdi=input</code> parametresiyle alır.</li>
</ul>
<p>Son madde küçük ama güçlü bir hiledir: fonksiyon varsayılan olarak gerçek <code>input</code>'u kullanır, testte ise ona hazır cevaplar veren bir fonksiyon verirsin. Buna bağımlılık enjeksiyonu (dependency injection) denir.</p>
<pre class="py">def selamla(girdi=input):
    ad = girdi("Adın? ")
    return f"Merhaba {ad}!"

cevaplar = iter(["Ayşe"])
print(selamla(lambda istem: next(cevaplar)))   # klavye beklemeden test</pre>

<h2>Proje 1: Sayı tahmin oyunu</h2>
<p><b>Gereksinimler:</b> bilgisayar 1-100 arasında sayı tutar; oyuncunun 7 hakkı var; her tahminde "daha büyük/küçük" ipucu verilir; sayı olmayan ya da aralık dışı girdi hak yemez; bilinirse kaç denemede bilindiği, bilinemezse sayı söylenir.</p>
<p><b>Tasarım:</b> <code>tahmini_oku(metin)</code> → int ya da None; <code>tahmin_degerlendir(tahmin, hedef)</code> → "büyük" / "küçük" / "doğru"; <code>oyna(hedef, hak, girdi)</code> → döngü.</p>
<div class="steps-list"><ol>
<li>Önce <code>tahmin_degerlendir</code>'i yaz ve üç durumla dene; en kolay ve en önemli parça budur.</li>
<li><code>tahmini_oku</code>: <code>int()</code>'i try içine al, aralığı denetle.</li>
<li>Döngü: hak bitene kadar sor; geçersiz girdide <code>continue</code>.</li>
<li>Rastgele hedefi en dışta üret ve <code>random.seed</code> ile sabitlenebilir bırak: test ederken hep aynı sayı gelsin.</li>
</ol></div>
<pre class="py">import random

def tahmini_oku(metin, alt=1, ust=100):
    try:
        sayi = int(metin)
    except ValueError:
        return None
    return sayi if alt &lt;= sayi &lt;= ust else None

def tahmin_degerlendir(tahmin, hedef):
    if tahmin &lt; hedef:
        return "büyük"
    if tahmin &gt; hedef:
        return "küçük"
    return "doğru"

def oyna(hedef, hak=7, girdi=input):
    deneme = 0
    while deneme &lt; hak:
        tahmin = tahmini_oku(girdi("Tahmin: "))
        if tahmin is None:
            print("1-100 arası bir sayı gir.")
            continue
        deneme += 1
        sonuc = tahmin_degerlendir(tahmin, hedef)
        if sonuc == "doğru":
            print(f"Bildin! {deneme} denemede.")
            return deneme
        print(f"Daha {sonuc} bir sayı dene.")
    print(f"Hakkın bitti, sayı {hedef} idi.")
    return None

random.seed(42)
hedef = random.randint(1, 100)
cevaplar = iter(["50", "on", "25", str(hedef)])
oyna(hedef, girdi=lambda istem: next(cevaplar))</pre>
<p>Kendi bilgisayarında gerçek oyun için son satırı <code>oyna(random.randint(1, 100))</code> yapman yeter. İkili arama (binary search) stratejisiyle (hep aralığın ortasını söyle) 1-100 arası her sayı en fazla 7 denemede bulunur; hak sayısının 7 olmasının nedeni budur.</p>

<h2>Proje 2: Adam asmaca</h2>
<p><b>Gereksinimler:</b> gizli kelime harf harf tahmin edilir; bilinen harfler açılır, bilinmeyenler <code>_</code>; 6 yanlışta oyun biter; aynı harfi tekrar söylemek hak yemez.</p>
<p><b>Tasarım:</b> oyun durumunu iki kümede tut: <code>dogru</code> ve <code>yanlis</code> harfler. Ekranda görünen her şey bu iki kümeden <b>hesaplanır</b>; ayrı sayaçlar tutmazsın, böylece tutarsızlık da olmaz.</p>
<pre class="py">MAX_HATA = 6

def maske(kelime, tahminler):
    return " ".join(h if h in tahminler else "_" for h in kelime)

def kazandi_mi(kelime, tahminler):
    return set(kelime) &lt;= tahminler

def adam_asmaca(kelime, girdi=input):
    dogru, yanlis = set(), set()
    while len(yanlis) &lt; MAX_HATA and not kazandi_mi(kelime, dogru):
        harf = girdi(f"{maske(kelime, dogru)}  Harf: ").strip().lower()
        if harf in dogru | yanlis:
            print("Bunu zaten söyledin.")
        elif harf in kelime:
            dogru.add(harf)
        else:
            yanlis.add(harf)
            print(f"Yok! Kalan hak: {MAX_HATA - len(yanlis)}")
    print("Kazandın!" if kazandi_mi(kelime, dogru) else f"Kaybettin, kelime: {kelime}")

cevaplar = iter(["a", "e", "k", "a", "n", "r"])
adam_asmaca("ankara", lambda istem: (print(istem), next(cevaplar))[1])</pre>
<p><code>set(kelime) &lt;= tahminler</code> "kelimedeki tüm harfler tahmin edildi mi?" sorusunu tek ifadede yanıtlar (alt küme). Son satırdaki lambda, testte istemi de ekrana yazar ki oyunun akışını görebilesin.</p>

<h2>Proje 3: Taş-kağıt-makas</h2>
<p><b>Tasarım:</b> kuralı <code>if</code> merdiveniyle değil, <b>veriyle</b> anlat: "kim kimi yener" bir sözlüktür. Yeni bir seçenek (kertenkele, Spock) eklemek kod değil veri değişikliği olur.</p>
<pre class="py">import random

YENER = {"taş": "makas", "makas": "kağıt", "kağıt": "taş"}

def kazanan(oyuncu, bilgisayar):
    if oyuncu not in YENER or bilgisayar not in YENER:
        raise ValueError("geçersiz seçim")
    if oyuncu == bilgisayar:
        return "berabere"
    return "oyuncu" if YENER[oyuncu] == bilgisayar else "bilgisayar"

rng = random.Random(7)                 # kendi tohumlu üreteci
skor = {"oyuncu": 0, "bilgisayar": 0, "berabere": 0}
for secim in ["taş", "kağıt", "makas", "taş"]:
    pc = rng.choice(list(YENER))
    sonuc = kazanan(secim, pc)
    skor[sonuc] += 1
    print(f"{secim:6} - {pc:6} → {sonuc}")
print(skor)</pre>
<p><code>random.Random(7)</code> programın geri kalanını etkilemeyen, kendine ait bir rastgele üreteç oluşturur; testte global <code>random.seed</code> yerine bunu tercih etmek daha temizdir.</p>

<h2>Proje 4: Şifre üretici</h2>
<p><b>Gereksinimler:</b> en az 8 karakter; en az bir küçük harf, bir büyük harf, bir rakam ve bir sembol. <b>Tasarım:</b> önce her gruptan birer karakter seç (kuralı garanti et), kalan uzunluğu tüm havuzdan doldur, sonra karıştır (yoksa ilk dört karakter hep aynı düzende olur).</p>
<pre class="py">import random
import string

SEMBOLLER = "!@#%&amp;*?"

def sifre_uret(uzunluk=12, rng=random):
    if uzunluk &lt; 8:
        raise ValueError("en az 8 karakter")
    gruplar = [string.ascii_lowercase, string.ascii_uppercase, string.digits, SEMBOLLER]
    karakterler = [rng.choice(g) for g in gruplar]
    havuz = "".join(gruplar)
    karakterler += [rng.choice(havuz) for _ in range(uzunluk - len(gruplar))]
    rng.shuffle(karakterler)
    return "".join(karakterler)

print(sifre_uret(12, random.Random(1)))
print(sifre_uret(12, random.Random(1)))   # aynı tohum → aynı şifre</pre>
<div class="warn"><b>Gerçek şifre için random değil secrets</b><code>random</code> modülü tahmin edilebilir bir üreteç kullanır; oyun ve simülasyon içindir. Gerçek şifre, token ya da doğrulama kodu üretirken <code>secrets</code> modülünü kullan: <code>secrets.choice(havuz)</code>. Bu derste tohumla test edebilmek için <code>random</code> kullanıyoruz.</div>

<h2>Proje 5: Sezar şifreleme</h2>
<p>Her harfi alfabede k adım kaydır: k=3 için A→D, Z→C. Sona gelince başa dönmek mod aritmetiğidir: <code>(konum + k) % 26</code>. Çözmek, ters yönde kaydırmaktır: <code>sezar(metin, -k)</code>. Ayrı bir çözme algoritması yazmana gerek yok.</p>
<pre class="py">def sezar(metin, k):
    sonuc = []
    for h in metin:
        if "A" &lt;= h &lt;= "Z":
            sonuc.append(chr((ord(h) - ord("A") + k) % 26 + ord("A")))
        elif "a" &lt;= h &lt;= "z":
            sonuc.append(chr((ord(h) - ord("a") + k) % 26 + ord("a")))
        else:
            sonuc.append(h)
    return "".join(sonuc)

gizli = sezar("Toplanti Cuma 14:00", 3)
print(gizli)
print(sezar(gizli, -3))
for k in range(1, 4):                      # kaba kuvvetle kırma
    print(k, sezar(gizli, -k))</pre>
<p>Yalnızca 25 olası anahtar olduğu için Sezar şifresi bir döngüyle kırılır; tarihsel bir oyuncaktır, gerçek güvenlik değildir. Türkçe alfabeyle (29 harf) çalışan sürümünü Meydan okuma aşamasında yazacaksın.</p>

<h2>Proje 6: Bahşiş ve hesap bölüşme</h2>
<p><b>Gereksinimler:</b> hesap tutarı, bahşiş yüzdesi ve kişi sayısı alınır; bahşiş, toplam ve kişi başı tutar 2 ondalıkla verilir; kişi sayısı en az 1, tutar negatif olamaz.</p>
<pre class="py">def hesap_bolustur(hesap, bahsis_yuzde, kisi):
    if kisi &lt; 1 or hesap &lt; 0 or bahsis_yuzde &lt; 0:
        raise ValueError("geçersiz değer")
    bahsis = hesap * bahsis_yuzde / 100
    toplam = hesap + bahsis
    return round(bahsis, 2), round(toplam, 2), round(toplam / kisi, 2)

bahsis, toplam, kisi_basi = hesap_bolustur(1240, 12.5, 3)
print(f"Bahşiş: {bahsis:.2f} TL | Toplam: {toplam:.2f} TL | Kişi başı: {kisi_basi:.2f} TL")</pre>
<p>Kuruş farkına dikkat: 1395 TL'yi 3 kişiye bölünce 465.00 çıkar ama 1000 TL'yi 3'e bölünce 333.33 × 3 = 999.99 olur. Gerçek bir uygulamada son kişiye kalan kuruş eklenir ya da para birimi kuruş cinsinden tamsayıyla tutulur.</p>

<h2>Proje 7: ATM menüsü</h2>
<p><b>Tasarım:</b> sonsuz döngü (<code>while True</code>) menüyü gösterir, <code>match</code> seçime göre dallanır, <code>return</code> ya da <code>break</code> çıkışı sağlar. Bakiye döngü boyunca yaşayan <b>durumdur</b> (state).</p>
<pre class="py">def atm(bakiye, girdi=input):
    while True:
        secim = girdi("1) Bakiye 2) Yatır 3) Çek 4) Çıkış: ").strip()
        match secim:
            case "1":
                print(f"Bakiye: {bakiye:.2f} TL")
            case "2" | "3":
                tutar = float(girdi("Tutar: "))
                if secim == "3" and tutar &gt; bakiye:
                    print("Yetersiz bakiye")
                    continue
                bakiye += tutar if secim == "2" else -tutar
                print(f"Yeni bakiye: {bakiye:.2f} TL")
            case "4":
                print("İyi günler!")
                return bakiye
            case _:
                print("Geçersiz seçim")

cevaplar = iter(["1", "2", "250", "3", "5000", "9", "4"])
print(atm(1000, lambda istem: next(cevaplar)))</pre>
<p>Bu sürümde <code>float("abc")</code> programı çökertir; alıştırmalarda tutarı doğrulayan ve PIN denetimi ekleyen sağlam sürümü yazacaksın.</p>

<div class="note"><b>Gerçek işte</b>Bu projeler oyuncak gibi görünse de aynı kalıplar her yerdedir: ATM menüsü bir komut satırı aracının ya da sohbet botunun ana döngüsüdür; taş-kağıt-makas sözlüğü bir iş kuralı tablosudur (kampanya kuralları, onay matrisleri); şifre üretici kurallı veri üretimidir (test verisi, kupon kodları). "Mantığı arayüzden ayır" ilkesi de web uygulamalarında aynen geçerlidir: hesap fonksiyonları Flask'tan da, mobil uygulamadan da, testten de çağrılabilir. Mülakatlarda istenen ev ödevleri de çoğunlukla bu büyüklüktedir ve değerlendirmede çalışmasından çok tasarımına ve testlerine bakılır.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Durum makinesi olarak oyun</h3>
<p>Her oyun bir durum makinesidir (state machine): adam asmacada durum (doğru, yanlış harfler), olay (yeni tahmin), geçiş (kümeye ekle), bitiş koşulu (kazandı ya da 6 hata). Durumu tek bir yapıda tutup "durum + olay → yeni durum" fonksiyonu yazarsan, oyunun her anını test edebilir, kaydedip geri yükleyebilir, hatta geri al (undo) özelliği ekleyebilirsin.</p>
<h3>Tekrarlanabilir rastgelelik</h3>
<p>Rastgelelik içeren kodu test etmenin iki yolu var: tohumu sabitlemek (<code>random.Random(42)</code>) ya da sonucun <b>özelliklerini</b> test etmek (şifrenin uzunluğu, içerdiği karakter grupları). İyi test ikisini birlikte kullanır. Üreteci parametre olarak almak (<code>rng=random</code>) ise testte sabit tohumlu, gerçekte <code>secrets.SystemRandom()</code> gibi güvenli bir üreteç vermeni sağlar.</p>
<h3>Sonraki adım: arayüz</h3>
<p>Mantık ayrı olduğu için aynı fonksiyonlarla terminal yerine bir grafik arayüz (tkinter), web sayfası (Flask) ya da Discord botu yazabilirsin; yalnızca döngü katmanı değişir. Orta seviyede bu projeleri sınıflarla (<code>class AdamAsmaca</code>) ve testlerle yeniden kuracaksın.</p>
</section>
`,
  ex: [
    { t: 'mc',
      stage: 'Isınma',
      q: 'Sayı tahmin oyununu test ederken programın başında <code>random.seed(42)</code> çağırmanın amacı nedir?',
      o: [
        'Üretilen sayıların daha rastgele ve tahmin edilemez olması',
        'Her çalıştırmada aynı rastgele dizinin üretilmesi',
        'Üretilecek sayıları 0 ile 42 arasında sınırlamak',
        'Rastgele sayı üretimini hızlandırıp bellek kazanmak'
      ],
      a: 1,
      why: 'seed, sözde rastgele üretecin başlangıç noktasını sabitler: aynı tohum her seferinde aynı diziyi verir. Böylece "hedef 37 iken şu girdilerle oyun nasıl biter?" sorusunu tekrar tekrar test edebilirsin.' },
    { t: 'mc',
      stage: 'Isınma',
      q: '<code>kazanan(oyuncu, bilgisayar)</code> gibi mantık fonksiyonlarını <code>input</code>/<code>print</code> içeren oyun döngüsünden ayrı yazmanın asıl faydası nedir?',
      o: [
        'Program belirgin biçimde daha hızlı çalışır ve az bellek harcar',
        'Mantık klavye beklemeden test edilir, başka arayüzde de kullanılır',
        'input() ve print() çağrılarına artık hiç gerek kalmaz',
        'Python, fonksiyonsuz yazılmış while döngüsüne izin vermez'
      ],
      a: 1,
      why: 'Saf fonksiyon girdi alıp değer döndürür; onu assert ile saniyeler içinde yüzlerce durumla deneyebilirsin. Aynı fonksiyon yarın bir web sayfasından ya da bottan da çağrılabilir. Hız farkı yoktur ve döngü katmanı yine input/print kullanır.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Sezar kaydırması: bu kod ne yazdırır?',
      code: 'def kaydir(harf, k):\n    return chr((ord(harf) - ord("A") + k) % 26 + ord("A"))\n\nprint(kaydir("A", 3), kaydir("Y", 3), kaydir("C", -3))\n',
      o: ['D B Z', 'D A Z', 'D B @', 'D Z B'],
      a: 0,
      why: 'Y alfabede 24. konumdadır (0\'dan sayınca); 24 + 3 = 27, 27 % 26 = 1 → B. C (2) için 2 - 3 = -1; Python\'da -1 % 26 = 25 → Z. Mod işlemi sayesinde alfabenin iki ucunda da başa/sona sarılır.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Adam asmaca durumu: bu kod ne yazdırır?',
      code: 'kelime = "ankara"\ntahminler = {"a", "k", "e"}\nprint(" ".join(h if h in tahminler else "_" for h in kelime))\nprint(len(set(kelime) - tahminler))\n',
      o: ['a _ k a _ a\n3', 'a _ k a _ a\n2', 'a n k a r a\n2', 'a _ k _ _ _\n2'],
      a: 1,
      why: 'Maske her harfi tahmin edilmişse kendisiyle, değilse _ ile gösterir; "a" üç yerde de açılır. set("ankara") = {a, n, k, r}; tahminleri çıkarınca {n, r} kalır: 2 harf. "e" kelimede olmadığı için fark kümesini etkilemez.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Kural tablosu sözlükte: bu kod ne yazdırır?',
      code: 'YENER = {"taş": "makas", "makas": "kağıt", "kağıt": "taş"}\n\ndef kazanan(o, b):\n    if o == b:\n        return "berabere"\n    return "oyuncu" if YENER[o] == b else "bilgisayar"\n\nprint(kazanan("taş", "kağıt"), kazanan("makas", "kağıt"), kazanan("taş", "taş"))\n',
      o: ['oyuncu bilgisayar berabere', 'bilgisayar oyuncu berabere', 'bilgisayar bilgisayar berabere', 'oyuncu oyuncu berabere'],
      a: 1,
      why: 'YENER["taş"] "makas"tır, bilgisayar kağıt seçmişse oyuncu kaybeder. YENER["makas"] "kağıt"tır, bu yüzden makas kağıdı yener. Aynı seçim berabere.' },
    { t: 'order',
      stage: 'Kodu oku',
      q: '<p>Hesap bölüşme fonksiyonunu ve kullanımını doğru sıraya koy.</p>',
      lines: [
        'def hesap_bolustur(hesap, bahsis_yuzde, kisi):',
        '    bahsis = hesap * bahsis_yuzde / 100',
        '    toplam = hesap + bahsis',
        '    return round(toplam / kisi, 2)',
        'pay = hesap_bolustur(1240, 10, 4)',
        'print(f"Kişi başı: {pay} TL")'
      ],
      expect: 'Kişi başı: 341.0 TL\n',
      hint: 'Her satır bir öncekinin ürettiği değeri kullanıyor: bahşiş → toplam → kişi başı.',
      why: 'Bahşiş tutarı (124.0) toplamdan önce hesaplanmalı, toplam (1364.0) da bölmeden önce. Fonksiyon tanımı çağrısından önce gelmeli.' },
    { id: 'proje-oyunlar-r1',
      t: 'code',
      stage: 'Rehberli',
      diff: 1,
      q: '<p>Sayı tahmin oyununun iki mantık fonksiyonunu yaz:</p><ul><li><code>tahmini_oku(metin, alt=1, ust=100)</code>: metnin baş/son boşluklarını at, tam sayıya çevir; çevrilemiyorsa ya da aralık dışındaysa <code>None</code>, yoksa sayıyı döndür.</li><li><code>tahmin_degerlendir(tahmin, hedef)</code>: tahmin küçükse <code>"Daha büyük"</code>, büyükse <code>"Daha küçük"</code>, eşitse <code>"Bildin!"</code> döndür.</li></ul>',
      guide: [
        'tahmini_oku içinde int(metin.strip()) çağrısını try bloğuna al.',
        'ValueError olursa None döndür.',
        'Sayı alt-ust aralığında değilse de None döndür (zincirli karşılaştırma).',
        'tahmin_degerlendir\'de iki if ve bir son return yeterli (erken dönüş).'
      ],
      example: 'def yas_oku(metin):\n    try:\n        yas = int(metin.strip())\n    except ValueError:\n        return None\n    return yas if 0 <= yas <= 120 else None\n\nprint(yas_oku(" 34 "), yas_oku("otuz"), yas_oku("150"))\n',
      start: 'def tahmini_oku(metin, alt=1, ust=100):\n    # TODO: int(metin.strip()) dene; ValueError ise None\n    # TODO: aralık dışıysa None, değilse sayı\n    pass\n\n\ndef tahmin_degerlendir(tahmin, hedef):\n    # TODO: "Daha büyük" / "Daha küçük" / "Bildin!"\n    pass\n',
      sol: 'def tahmini_oku(metin, alt=1, ust=100):\n    try:\n        sayi = int(metin.strip())\n    except ValueError:\n        return None\n    if alt <= sayi <= ust:\n        return sayi\n    return None\n\n\ndef tahmin_degerlendir(tahmin, hedef):\n    if tahmin < hedef:\n        return "Daha büyük"\n    if tahmin > hedef:\n        return "Daha küçük"\n    return "Bildin!"\n',
      tests: 'assert tahmini_oku("42") == 42, "\\"42\\" → 42"\nassert tahmini_oku(" 7 ") == 7, "Boşluklar atılmalı"\nassert tahmini_oku("yedi") is None, "Sayı olmayan metin None"\nassert tahmini_oku("3.5") is None, "Ondalıklı metin tam sayı değil: None"\nassert tahmini_oku("0") is None and tahmini_oku("101") is None, "Aralık dışı None"\nassert tahmini_oku("1") == 1 and tahmini_oku("100") == 100, "Sınırlar dahil"\nassert tahmini_oku("15", alt=1, ust=10) is None, "alt/ust parametreleri kullanılmalı"\nassert tahmin_degerlendir(30, 37) == "Daha büyük", "Tahmin küçükse daha büyük denemeli"\nassert tahmin_degerlendir(50, 37) == "Daha küçük", "Tahmin büyükse daha küçük denemeli"\nassert tahmin_degerlendir(37, 37) == "Bildin!", "Eşitse Bildin!"\n',
      hints: [
        'int("3.5") ve int("yedi") ikisi de ValueError verir; ikisini de aynı except yakalar.',
        'Aralık için: if alt <= sayi <= ust: return sayi',
        'tahmin < hedef ise oyuncu daha BÜYÜK bir sayı denemeli.'
      ],
      why: 'Girdiyi okuma ve değerlendirme oyunun beyni; ikisi de saf fonksiyon olduğu için klavye olmadan, birkaç assert ile her durumu denedin. Döngü bunları yalnızca çağıracak.' },
    { id: 'proje-oyunlar-r2',
      t: 'code',
      stage: 'Rehberli',
      diff: 1,
      q: '<p>Adam asmacanın iki yardımcısını yaz (kelimeler küçük harflidir):</p><ul><li><code>maske(kelime, tahminler)</code>: tahmin edilen harfleri göster, diğerlerini <code>_</code> yap, aralarına birer boşluk koy. Kelimedeki boşluk karakteri (iki kelimeli ifadelerde) her zaman <code>/</code> olarak görünsün: <code>maske("iyi gunler", {"i"})</code> → <code>"i _ i / _ _ _ _ _ _"</code></li><li><code>kazandi_mi(kelime, tahminler)</code>: kelimedeki tüm harfler (boşluk hariç) tahmin edildiyse True.</li></ul>',
      guide: [
        'Kelimenin her karakteri için bir parça üret: boşluksa "/", tahmin edildiyse harfin kendisi, değilse "_".',
        'Parçaları " ".join ile birleştir.',
        'kazandi_mi için kelimedeki harflerin kümesini al, boşluğu çıkar.',
        'Bu küme tahminlerin alt kümesi mi? (<= operatörü ya da issubset)'
      ],
      example: 'kod = "AM-42"\ngosterim = " ".join("#" if k.isdigit() else k for k in kod)\nprint(gosterim)\ngerekli = {"süt", "ekmek"}\nsepet = {"ekmek", "süt", "çay"}\nprint(gerekli <= sepet, gerekli - {"süt"})\n',
      start: 'def maske(kelime, tahminler):\n    parcalar = []\n    for h in kelime:\n        # TODO: boşluk → "/", tahmin edilmiş → h, diğer → "_"\n        pass\n    return " ".join(parcalar)\n\n\ndef kazandi_mi(kelime, tahminler):\n    # TODO: boşluk hariç harf kümesi tahminlerin alt kümesi mi?\n    pass\n',
      sol: 'def maske(kelime, tahminler):\n    parcalar = []\n    for h in kelime:\n        if h == " ":\n            parcalar.append("/")\n        elif h in tahminler:\n            parcalar.append(h)\n        else:\n            parcalar.append("_")\n    return " ".join(parcalar)\n\n\ndef kazandi_mi(kelime, tahminler):\n    harfler = set(kelime) - {" "}\n    return harfler <= set(tahminler)\n',
      tests: 'assert maske("ankara", {"a", "k"}) == "a _ k a _ a", "maske(\'ankara\', {\'a\',\'k\'}) → \'a _ k a _ a\'"\nassert maske("ankara", set()) == "_ _ _ _ _ _", "Hiç tahmin yoksa hepsi _"\nassert maske("iyi gunler", {"i"}) == "i _ i / _ _ _ _ _ _", "Boşluk / olarak gösterilmeli; gelen " + repr(maske("iyi gunler", {"i"}))\nassert kazandi_mi("ankara", {"a", "n", "k", "r"}) is True, "Tüm harfler bilindi: True"\nassert kazandi_mi("ankara", {"a", "n", "k"}) is False, "r eksik: False"\nassert kazandi_mi("iyi gunler", set("iyguner l")) is True, "Boşluk tahmin gerektirmez"\nassert kazandi_mi("iyi gunler", set("iygunelr")) is True, "Boşluk tahmin edilmese de kazanılır"\n',
      hints: [
        'Üç dallı bir if/elif/else, her karakter için parçayı belirler.',
        'set(kelime) - {" "} boşluk hariç harf kümesini verir.',
        'return harfler <= set(tahminler)'
      ],
      why: 'Ekrandaki görüntü (maske) ve oyunun sonucu (kazandi_mi), oyun durumundan (tahmin kümesi) hesaplanır. Ayrı sayaç tutmadığın için "ekranda her şey açık ama oyun bitmedi" gibi tutarsızlıklar oluşamaz.' },
    { id: 'proje-oyunlar-r3',
      t: 'code',
      stage: 'Rehberli',
      diff: 2,
      q: '<p>Sezar şifrelemesini yaz: <code>sezar(metin, k)</code> İngilizce alfabedeki harfleri (A-Z, a-z) k adım kaydırsın, büyük/küçük harfi korusun; diğer karakterleri (rakam, boşluk, noktalama, Türkçe harfler) olduğu gibi bıraksın. k negatif ya da 26\'dan büyük olabilir. Ardından <code>coz(metin, k)</code> fonksiyonunu <code>sezar</code>\'ı çağırarak tek satırda yaz.</p>',
      guide: [
        'Sonucu bir listede biriktir.',
        'Karakter "A" ile "Z" arasındaysa: konum = ord(h) - ord("A"), yeni = (konum + k) % 26, chr(yeni + ord("A")).',
        'Küçük harfler için aynısını "a" ile yap.',
        'Diğer karakterleri değiştirmeden ekle; sonunda "".join.',
        'coz, sezar\'ı -k ile çağırır.'
      ],
      example: '# Saat aritmetiği: 22:00\'den 5 saat sonra\nsaat = 22\nprint((saat + 5) % 24)\n# Haftanın günleri: Cumartesi (5) + 3 gün\ngunler = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"]\nprint(gunler[(5 + 3) % 7], gunler[(0 - 1) % 7])\n',
      start: 'def sezar(metin, k):\n    sonuc = []\n    for h in metin:\n        if "A" <= h <= "Z":\n            # TODO: büyük harfi k kaydır\n            pass\n        elif "a" <= h <= "z":\n            # TODO: küçük harfi k kaydır\n            pass\n        else:\n            sonuc.append(h)\n    return "".join(sonuc)\n\n\ndef coz(metin, k):\n    # TODO: sezar\'ı kullan\n    pass\n',
      sol: 'def sezar(metin, k):\n    sonuc = []\n    for h in metin:\n        if "A" <= h <= "Z":\n            sonuc.append(chr((ord(h) - ord("A") + k) % 26 + ord("A")))\n        elif "a" <= h <= "z":\n            sonuc.append(chr((ord(h) - ord("a") + k) % 26 + ord("a")))\n        else:\n            sonuc.append(h)\n    return "".join(sonuc)\n\n\ndef coz(metin, k):\n    return sezar(metin, -k)\n',
      tests: 'assert sezar("ABC", 3) == "DEF", "ABC +3 → DEF"\nassert sezar("xyz", 3) == "abc", "Sona gelince başa sarmalı: xyz +3 → abc"\nassert sezar("Merhaba Dunya!", 1) == "Nfsibcb Evozb!", "Büyük/küçük korunmalı, boşluk ve ! değişmemeli"\nassert sezar("Saat 14:00", 2) == "Uccv 14:00", "Rakamlar değişmemeli"\nassert sezar("Şifre", 1) == "Şjgsf", "Türkçe harfler (Ş) olduğu gibi kalmalı"\nassert sezar("abc", 29) == sezar("abc", 3), "k=29, k=3 ile aynı olmalı"\nassert sezar("abc", -1) == "zab", "Negatif kaydırma da çalışmalı"\nassert coz(sezar("Gizli Toplanti", 7), 7) == "Gizli Toplanti", "coz, sezar\'ı geri almalı"\n',
      hints: [
        'ord harfi sayıya, chr sayıyı harfe çevirir.',
        '% 26 hem 25\'i aşan hem de 0\'ın altına düşen değerleri alfabeye geri sarar.',
        'Büyük harf için: sonuc.append(chr((ord(h) - ord("A") + k) % 26 + ord("A")))'
      ],
      why: 'Konumu 0-25 aralığına indirip mod 26 ile kaydırmak, sarma ve negatif kaydırma gibi tüm kenar durumlarını tek formülle çözer. Çözme ayrı bir algoritma değil, ters yöndeki şifrelemedir.' },
    { id: 'proje-oyunlar-k1',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 1,
      q: '<p>Taş-kağıt-makas: <code>kazanan(oyuncu, bilgisayar)</code> fonksiyonu <code>"oyuncu"</code>, <code>"bilgisayar"</code> ya da <code>"berabere"</code> döndürsün. Seçimler büyük/küçük harf ve baş/son boşluktan bağımsız olsun (<code>" Taş"</code> = <code>"taş"</code>). Geçersiz seçimde <code>ValueError("geçersiz seçim")</code> fırlat. Kuralları bir <code>YENER</code> sözlüğünde tut.</p>',
      start: 'YENER = {}\n\n\ndef kazanan(oyuncu, bilgisayar):\n    pass\n',
      sol: 'YENER = {"taş": "makas", "makas": "kağıt", "kağıt": "taş"}\n\n\ndef kazanan(oyuncu, bilgisayar):\n    oyuncu = oyuncu.strip().lower()\n    bilgisayar = bilgisayar.strip().lower()\n    if oyuncu not in YENER or bilgisayar not in YENER:\n        raise ValueError("geçersiz seçim")\n    if oyuncu == bilgisayar:\n        return "berabere"\n    if YENER[oyuncu] == bilgisayar:\n        return "oyuncu"\n    return "bilgisayar"\n',
      tests: 'assert kazanan("taş", "makas") == "oyuncu", "Taş makası yener"\nassert kazanan("makas", "taş") == "bilgisayar", "Makas taşa yenilir"\nassert kazanan("kağıt", "taş") == "oyuncu", "Kağıt taşı yener"\nassert kazanan("kağıt", "kağıt") == "berabere", "Aynı seçim berabere"\nassert kazanan(" Taş", "MAKAS ") == "oyuncu", "Büyük harf ve boşluklar yok sayılmalı"\ntry:\n    kazanan("kalem", "taş")\n    assert False, "Geçersiz seçimde ValueError beklenir"\nexcept ValueError as e:\n    assert str(e) == "geçersiz seçim", "Hata mesajı \'geçersiz seçim\' olmalı"\nassert len(YENER) == 3, "YENER sözlüğü üç kuralı içermeli"\n',
      hints: [
        'YENER = {"taş": "makas", "makas": "kağıt", "kağıt": "taş"}: anahtar, değeri yener.',
        'Önce iki seçimi de strip().lower() ile normalleştir, sonra geçerliliği denetle.'
      ],
      why: 'Kural tablosu veride durduğu için kazanan() üç satırlık bir arama olur. Girdiyi normalleştirmek (strip, lower) kullanıcı hatalarını sessizce tolere eder; geçersiz girdide ise açıkça hata verilir.' },
    { id: 'proje-oyunlar-k2',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p>Restoran hesabı bölüşme: <code>hesap_bolustur(hesap, bahsis_yuzde, kisi)</code> şu üç anahtarlı sözlüğü döndürsün (değerler 2 ondalığa yuvarlanmış): <code>"bahsis"</code>, <code>"toplam"</code>, <code>"kisi_basi"</code>. Ek kural: kişi başı tutar, toplamı karşılamak için <b>kuruşa yukarı yuvarlanır</b> (1000 TL / 3 kişi → 333.34; çünkü 333.33 × 3 hesabı karşılamaz). Kişi sayısı 1\'den küçükse ya da hesap veya bahşiş negatifse <code>ValueError</code> fırlat.</p>',
      start: 'import math\n\n\ndef hesap_bolustur(hesap, bahsis_yuzde, kisi):\n    pass\n',
      sol: 'import math\n\n\ndef hesap_bolustur(hesap, bahsis_yuzde, kisi):\n    if kisi < 1 or hesap < 0 or bahsis_yuzde < 0:\n        raise ValueError("geçersiz değer")\n    bahsis = round(hesap * bahsis_yuzde / 100, 2)\n    toplam = round(hesap + bahsis, 2)\n    kisi_basi = math.ceil(round(toplam * 100 / kisi, 6)) / 100\n    return {"bahsis": bahsis, "toplam": toplam, "kisi_basi": kisi_basi}\n',
      tests: 'r = hesap_bolustur(1240, 10, 4)\nassert r == {"bahsis": 124.0, "toplam": 1364.0, "kisi_basi": 341.0}, "1240 TL, %10, 4 kişi → 124.0 / 1364.0 / 341.0; gelen " + str(r)\nr2 = hesap_bolustur(1000, 0, 3)\nassert r2["kisi_basi"] == 333.34, "1000/3 kuruşa YUKARI yuvarlanmalı: 333.34; gelen " + str(r2["kisi_basi"])\nr3 = hesap_bolustur(850, 12.5, 2)\nassert r3 == {"bahsis": 106.25, "toplam": 956.25, "kisi_basi": 478.13}, "850 TL %12.5 2 kişi → 106.25 / 956.25 / 478.13; gelen " + str(r3)\nassert hesap_bolustur(100, 0, 1)["kisi_basi"] == 100.0, "Tek kişi tüm hesabı öder"\nassert hesap_bolustur(0.3, 0, 3)["kisi_basi"] == 0.1, "Kayan nokta gürültüsü yukarı yuvarlamayı bozmamalı (0.3/3 = 0.1)"\nfor kotu in [(100, 10, 0), (-5, 10, 2), (100, -1, 2)]:\n    try:\n        hesap_bolustur(*kotu)\n        assert False, f"{kotu} için ValueError beklenir"\n    except ValueError:\n        pass\n',
      hints: [
        'Kuruşa yukarı yuvarlamak: tutarı 100 ile çarp, math.ceil uygula, 100\'e böl.',
        '0.3 * 100 / 3 gibi işlemler 10.000000000000002 verebilir ve ceil bunu 11 yapar; ceil\'den önce round(..., 6) ile gürültüyü temizle.'
      ],
      why: 'Para hesabında "yuvarla" her zaman yeterli değildir: bölüşmede herkes aşağı yuvarlarsa hesap eksik kalır. math.ceil ile kuruşa yukarı yuvarlamak toplamı garanti eder; round(…, 6) ise kayan nokta gürültüsünün bir kuruşluk hata yaratmasını önler.' },
    { id: 'proje-oyunlar-k3',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p>Kurallı şifre üretici: <code>sifre_uret(uzunluk, rng)</code> şifreyi metin olarak döndürsün. <code>rng</code> bir <code>random.Random</code> nesnesidir; tüm rastgele seçimleri onunla yap (<code>rng.choice</code>, <code>rng.shuffle</code>).</p><ul><li>uzunluk 8\'den küçükse <code>ValueError("şifre en az 8 karakter olmalı")</code></li><li>En az bir küçük harf, bir büyük harf, bir rakam ve <code>SEMBOLLER = "!@#%&amp;*?"</code> içinden bir sembol içersin</li><li>Yalnızca bu dört gruptaki karakterlerden oluşsun (İngilizce harfler: <code>string.ascii_lowercase</code> vb.)</li><li>Aynı tohumla aynı şifre üretilsin</li></ul>',
      start: 'import random\nimport string\n\nSEMBOLLER = "!@#%&*?"\n\n\ndef sifre_uret(uzunluk, rng):\n    pass\n',
      sol: 'import random\nimport string\n\nSEMBOLLER = "!@#%&*?"\nGRUPLAR = [string.ascii_lowercase, string.ascii_uppercase, string.digits, SEMBOLLER]\n\n\ndef sifre_uret(uzunluk, rng):\n    if uzunluk < 8:\n        raise ValueError("şifre en az 8 karakter olmalı")\n    karakterler = [rng.choice(grup) for grup in GRUPLAR]\n    havuz = "".join(GRUPLAR)\n    for _ in range(uzunluk - len(karakterler)):\n        karakterler.append(rng.choice(havuz))\n    rng.shuffle(karakterler)\n    return "".join(karakterler)\n',
      tests: 'import string as _s\n_izinli = set(_s.ascii_letters + _s.digits + "!@#%&*?")\nfor tohum in range(30):\n    for n in (8, 12, 20):\n        s = sifre_uret(n, random.Random(tohum))\n        assert isinstance(s, str) and len(s) == n, f"Uzunluk {n} olmalı"\n        assert any(c.islower() for c in s), "En az bir küçük harf olmalı: " + s\n        assert any(c.isupper() for c in s), "En az bir büyük harf olmalı: " + s\n        assert any(c.isdigit() for c in s), "En az bir rakam olmalı: " + s\n        assert any(c in "!@#%&*?" for c in s), "En az bir sembol olmalı: " + s\n        assert set(s) <= _izinli, "İzinli olmayan karakter var: " + s\nassert sifre_uret(12, random.Random(5)) == sifre_uret(12, random.Random(5)), "Aynı tohum aynı şifreyi vermeli (yalnızca rng kullan)"\nassert len({sifre_uret(12, random.Random(t)) for t in range(10)}) > 1, "Farklı tohumlar farklı şifreler vermeli"\ntry:\n    sifre_uret(6, random.Random(0))\n    assert False, "6 karakterde ValueError beklenir"\nexcept ValueError as e:\n    assert str(e) == "şifre en az 8 karakter olmalı", "Hata mesajı görevdeki gibi olmalı"\n',
      hints: [
        'Önce her gruptan birer karakter seç (kuralı garanti eder), kalanı dört grubun birleşiminden doldur.',
        'Sonunda rng.shuffle ile karıştır; yoksa ilk dört karakter hep küçük-büyük-rakam-sembol sırasında olur.'
      ],
      why: 'Kuralı garanti etmek için "üret, kurala uymuyorsa tekrar üret" yerine her gruptan birini baştan koymak deterministik ve hızlıdır. Rastgeleliği dışarıdan rng olarak almak testi mümkün kılar; gerçek uygulamada buraya secrets.SystemRandom() verilir.' },
    { id: 'proje-oyunlar-k4',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p>ATM\'nin işlem çekirdeği: <code>atm_islem(bakiye, komut, tutar=0)</code> <code>(yeni_bakiye, mesaj)</code> demeti döndürsün. <code>match</code> kullan:</p><ul><li><code>"bakiye"</code> → bakiye aynı, <code>"Bakiye: 1500.00 TL"</code></li><li><code>"yatir"</code> ya da <code>"cek"</code> ve <code>tutar &lt;= 0</code> → bakiye aynı, <code>"Geçersiz tutar"</code></li><li><code>"yatir"</code> → bakiye artar, <code>"250.00 TL yatırıldı"</code></li><li><code>"cek"</code> ve tutar bakiyeden büyük → bakiye aynı, <code>"Yetersiz bakiye"</code></li><li><code>"cek"</code> → bakiye azalır, <code>"100.00 TL çekildi"</code></li><li>diğer her komut → bakiye aynı, <code>"Bilinmeyen işlem"</code></li></ul>',
      start: 'def atm_islem(bakiye, komut, tutar=0):\n    pass\n',
      sol: 'def atm_islem(bakiye, komut, tutar=0):\n    match komut:\n        case "bakiye":\n            return bakiye, f"Bakiye: {bakiye:.2f} TL"\n        case "yatir" | "cek" if tutar <= 0:\n            return bakiye, "Geçersiz tutar"\n        case "yatir":\n            return bakiye + tutar, f"{tutar:.2f} TL yatırıldı"\n        case "cek" if tutar > bakiye:\n            return bakiye, "Yetersiz bakiye"\n        case "cek":\n            return bakiye - tutar, f"{tutar:.2f} TL çekildi"\n        case _:\n            return bakiye, "Bilinmeyen işlem"\n',
      tests: 'assert atm_islem(1500, "bakiye") == (1500, "Bakiye: 1500.00 TL"), "Bakiye sorgusu"\nassert atm_islem(1000, "yatir", 250) == (1250, "250.00 TL yatırıldı"), "Para yatırma"\nassert atm_islem(1000, "cek", 100) == (900, "100.00 TL çekildi"), "Para çekme"\nassert atm_islem(1000, "cek", 1000) == (0, "1000.00 TL çekildi"), "Bakiyenin tamamı çekilebilir"\nassert atm_islem(1000, "cek", 5000) == (1000, "Yetersiz bakiye"), "Yetersiz bakiye"\nassert atm_islem(1000, "yatir", -50) == (1000, "Geçersiz tutar"), "Negatif yatırma geçersiz"\nassert atm_islem(1000, "cek", 0) == (1000, "Geçersiz tutar"), "Sıfır çekme geçersiz (yetersiz bakiye değil)"\nassert atm_islem(1000, "havale", 10) == (1000, "Bilinmeyen işlem"), "Bilinmeyen komut"\nassert "match" in __source__, "match yapısını kullan"\n',
      hints: [
        'case "yatir" | "cek" if tutar <= 0: iki komutu ve bir koşulu tek case\'te birleştirir.',
        'case\'ler yukarıdan aşağı denenir: önce geçersiz tutar, sonra yetersiz bakiye, sonra normal çekme.'
      ],
      why: 'match + koruma koşulu (guard, case ... if ...) iş kurallarını okunur bir tabloya dönüştürür. Sıra önemlidir: daha özel durumlar (geçersiz tutar, yetersiz bakiye) genel durumdan önce gelmelidir.' },
    { id: 'proje-oyunlar-b1',
      t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      diff: 2,
      q: '<p><b>Hatayı bul ve düzelt.</b> Arkadaşının yazdığı sayı tahmin oyunu ilk tahminde <code>TypeError</code> ile çöküyor. Düzelttiğinde fark edeceksin: oyuncu 3 hak yerine 4 kez tahmin edebiliyor. İki hatayı da düzelt (geçersiz girdi denetimi bu görevin konusu değil).</p>',
      start: 'def oyna(hedef, hak, girdi=input):\n    deneme = 0\n    while deneme <= hak:\n        tahmin = girdi("Tahmin: ")\n        deneme += 1\n        if tahmin == hedef:\n            print(f"Bildin! {deneme} denemede.")\n            return deneme\n        elif tahmin < hedef:\n            print("Daha büyük")\n        else:\n            print("Daha küçük")\n    print(f"Hakkın bitti. Sayı {hedef} idi.")\n    return None\n\n\noyna(37, 3)\n',
      sol: 'def oyna(hedef, hak, girdi=input):\n    deneme = 0\n    while deneme < hak:\n        tahmin = int(girdi("Tahmin: "))\n        deneme += 1\n        if tahmin == hedef:\n            print(f"Bildin! {deneme} denemede.")\n            return deneme\n        elif tahmin < hedef:\n            print("Daha büyük")\n        else:\n            print("Daha küçük")\n    print(f"Hakkın bitti. Sayı {hedef} idi.")\n    return None\n\n\noyna(37, 3)\n',
      stdin: ['50', '25', '30', '37'],
      expect: 'Tahmin: 50\nDaha küçük\nTahmin: 25\nDaha büyük\nTahmin: 30\nDaha büyük\nHakkın bitti. Sayı 37 idi.\n',
      tests: 'import io, contextlib\n_g = iter(["40", "37"])\nwith contextlib.redirect_stdout(io.StringIO()):\n    _sonuc = oyna(37, 5, girdi=lambda istem: next(_g))\nassert _sonuc == 2, "37\'yi ikinci denemede bilen oyuncu için 2 dönmeli"\n',
      hints: [
        'input (ve girdi) her zaman METİN döndürür: "50" < 37 karşılaştırması TypeError verir.',
        'deneme 0\'dan başlıyor; deneme <= hak koşulu 0, 1, 2, 3 için, yani 4 kez doğrudur.'
      ],
      why: 'İki klasik hata: input\'tan gelen metni sayıya çevirmemek ve döngü sınırında off-by-one. İkincisi sessizdir; yalnızca oyunu gerçekten oynayan ya da hakkı sayan bir test fark eder. Beklenen çıktı (expect) tam olarak bunu denetler: 3 tahminden sonra oyun bitmeli.' },
    { id: 'proje-oyunlar-b2',
      t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      diff: 2,
      q: '<p><b>Hatayı bul ve düzelt.</b> Sezar şifreleme kodunda <b>üç</b> hata var: küçük harfler bozuk çıkıyor, Türkçe harfler (ş, ğ, İ) anlamsız karakterlere dönüşüyor ve <code>coz</code> metni geri çözmüyor. Yalnızca İngilizce harfler (A-Z, a-z) kaydırılmalı.</p>',
      start: 'def sezar(metin, k):\n    sonuc = ""\n    for h in metin:\n        if h.isupper():\n            sonuc += chr((ord(h) - 65 + k) % 26 + 65)\n        elif h.islower():\n            sonuc += chr((ord(h) - 97 + k) % 26 + 65)\n        else:\n            sonuc += h\n    return sonuc\n\n\ndef coz(metin, k):\n    return sezar(metin, k)\n',
      sol: 'def sezar(metin, k):\n    sonuc = ""\n    for h in metin:\n        if "A" <= h <= "Z":\n            sonuc += chr((ord(h) - 65 + k) % 26 + 65)\n        elif "a" <= h <= "z":\n            sonuc += chr((ord(h) - 97 + k) % 26 + 97)\n        else:\n            sonuc += h\n    return sonuc\n\n\ndef coz(metin, k):\n    return sezar(metin, -k)\n',
      tests: 'assert sezar("abc", 1) == "bcd", "Küçük harfler küçük kalmalı: abc +1 → bcd; gelen " + sezar("abc", 1)\nassert sezar("Ankara", 2) == "Cpmctc", "Ankara +2 → Cpmctc"\nassert sezar("Şeker", 1) == "Şflfs", "Ş kaydırılmamalı (yalnızca A-Z, a-z); gelen " + sezar("Şeker", 1)\nassert sezar("İğne", 3) == "İğqh", "İ ve ğ olduğu gibi kalmalı"\nassert coz(sezar("Gizli Mesaj", 5), 5) == "Gizli Mesaj", "coz şifreyi geri almalı"\n',
      hints: [
        'Küçük harf satırında hangi sayı eklenerek harfe dönülüyor? 65 "A"nın, 97 "a"nın kodudur.',
        'isupper() Türkçe Ş için de True döner; aralık kontrolü ("A" <= h <= "Z") kullan.',
        'Çözmek ters yönde kaydırmaktır.'
      ],
      why: 'isupper/islower Unicode\'un tüm harflerini kapsar, ama formül yalnızca 26 harflik İngilizce alfabe için geçerli: Ş gibi bir harf alfabe dışına taşar. Kopyala-yapıştır ile yazılan küçük harf satırında 65 değişmeden kalmış; çözme ise -k ile yapılır.' },
    { id: 'proje-oyunlar-m1',
      t: 'code',
      stage: 'Meydan okuma',
      diff: 3,
      q: '<p>Türkçe Sezar ve kaba kuvvet kırıcı. Türk alfabesi 29 harftir:</p><pre class="out">BUYUK = "ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ"\nKUCUK = "abcçdefgğhıijklmnoöprsştuüvyz"</pre><ul><li><code>sezar_tr(metin, k)</code>: bu iki alfabedeki harfleri k adım kaydır (büyük harf büyük, küçük harf küçük kalır); Q, W, X dahil diğer tüm karakterler değişmez.</li><li><code>kir(sifreli, bilinen_kelime)</code>: 0-28 arasındaki anahtarları dene; <code>sezar_tr(sifreli, -k)</code> sonucu <code>bilinen_kelime</code>\'yi içeren <b>en küçük</b> k için <code>(k, cozulmus_metin)</code> döndür; bulamazsan <code>None</code>.</li></ul>',
      start: 'BUYUK = "ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ"\nKUCUK = "abcçdefgğhıijklmnoöprsştuüvyz"\n\n\ndef sezar_tr(metin, k):\n    pass\n\n\ndef kir(sifreli, bilinen_kelime):\n    pass\n',
      sol: 'BUYUK = "ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ"\nKUCUK = "abcçdefgğhıijklmnoöprsştuüvyz"\n\n\ndef sezar_tr(metin, k):\n    sonuc = []\n    for h in metin:\n        for alfabe in (BUYUK, KUCUK):\n            if h in alfabe:\n                sonuc.append(alfabe[(alfabe.index(h) + k) % len(alfabe)])\n                break\n        else:\n            sonuc.append(h)\n    return "".join(sonuc)\n\n\ndef kir(sifreli, bilinen_kelime):\n    for k in range(len(KUCUK)):\n        aday = sezar_tr(sifreli, -k)\n        if bilinen_kelime in aday:\n            return k, aday\n    return None\n',
      tests: 'assert len(BUYUK) == 29 and len(KUCUK) == 29, "Alfabeler 29 harf olmalı"\nassert sezar_tr("abc", 1) == "bcç", "Türk alfabesinde b\'den sonra c, c\'den sonra ç gelir"\nassert sezar_tr("Ğ", 1) == "H" and sezar_tr("ı", 1) == "i", "Ğ → H, ı → i"\nassert sezar_tr("Zz", 1) == "Aa", "Z\'den sonra başa sarmalı"\nassert sezar_tr("Wifi 5G!", 2) == "Wkğk 5H!", "W, rakam ve noktalama değişmemeli; gelen " + sezar_tr("Wifi 5G!", 2)\nasil = "Şubat toplantısı perşembe günü İzmir ofisinde"\nfor k in (1, 7, 28, 30, -4):\n    assert sezar_tr(sezar_tr(asil, k), -k) == asil, f"k={k} için şifrele-çöz turu orijinali vermeli"\nsifreli = sezar_tr(asil, 11)\nassert kir(sifreli, "toplantı") == (11, asil), "kir doğru anahtarı (11) ve metni bulmalı"\nassert kir("abc", "abc") == (0, "abc"), "k=0 da denenmeli"\nassert kir(sifreli, "kahve") is None, "Bilinen kelime hiçbir anahtarda çıkmıyorsa None"\n',
      hints: [
        'Harfin alfabedeki konumunu .index ile bul, (konum + k) % 29 ile yeni konumu hesapla.',
        'İki alfabeyi bir döngüde dene; for ... else yapısı "hiçbirinde bulunamadı" durumunu temizce yakalar.',
        'kir: for k in range(29) ile sezar_tr(sifreli, -k) dene, ilk eşleşmede döndür.'
      ],
      why: 'ord/chr hilesi yalnızca harflerin kodları ardışık olduğunda çalışır; Türkçe harfler Unicode\'da dağınık durduğu için alfabeyi bir metin olarak tutup konumla çalışmak gerekir. Kaba kuvvet kırıcı da Sezar\'ın neden güvensiz olduğunu gösterir: 29 deneme yeter.' },
    { id: 'proje-oyunlar-m2',
      t: 'code',
      stage: 'Meydan okuma',
      diff: 3,
      q: '<p>Adam asmacanın tüm durumunu hesaplayan saf fonksiyon: <code>oyun_durumu(kelime, tahminler, max_hata=6)</code>. <code>kelime</code> küçük harfli, <code>tahminler</code> oyuncunun sırayla girdiği metinlerin listesi. Kurallar:</p><ul><li>Her tahmin <code>strip().lower()</code> ile normalleştirilir; boş tahmin yok sayılır.</li><li>Tek harfli tahmin: kelimede varsa doğru, yoksa hata. Daha önce söylenmiş harf tekrar sayılmaz.</li><li>Birden çok harfli tahmin, kelimenin tamamı için bir denemedir: doğruysa oyun kazanılır, yanlışsa 1 hata sayılır (aynı yanlış kelime tekrar sayılmaz).</li><li>Oyun bittikten sonraki (kazanma ya da max_hata\'ya ulaşma) tahminler yok sayılır.</li></ul><p>Döndür: <code>{"maske": "a _ k a _ a", "hatalar": [...], "kalan_hak": int, "bitti": bool, "kazandi": bool}</code>. <code>hatalar</code> yanlış tahminlerin ilk söylenme sırasıdır; kazanılınca maske tüm harfleri gösterir.</p>',
      start: 'def oyun_durumu(kelime, tahminler, max_hata=6):\n    pass\n',
      sol: 'def oyun_durumu(kelime, tahminler, max_hata=6):\n    dogru = set()\n    hatalar = []\n    kazandi = False\n    for ham in tahminler:\n        if kazandi or len(hatalar) >= max_hata:\n            break\n        tahmin = ham.strip().lower()\n        if not tahmin or tahmin in dogru or tahmin in hatalar:\n            continue\n        if len(tahmin) > 1:\n            if tahmin == kelime:\n                kazandi = True\n            else:\n                hatalar.append(tahmin)\n        elif tahmin in kelime:\n            dogru.add(tahmin)\n            kazandi = set(kelime) <= dogru\n        else:\n            hatalar.append(tahmin)\n    gorunen = set(kelime) if kazandi else dogru\n    maske = " ".join(h if h in gorunen else "_" for h in kelime)\n    return {\n        "maske": maske,\n        "hatalar": hatalar,\n        "kalan_hak": max_hata - len(hatalar),\n        "bitti": kazandi or len(hatalar) >= max_hata,\n        "kazandi": kazandi,\n    }\n',
      tests: 'd = oyun_durumu("ankara", ["a", "e", "K", " a ", "", "z"])\nassert d == {"maske": "a _ k a _ a", "hatalar": ["e", "z"], "kalan_hak": 4, "bitti": False, "kazandi": False}, "Normalleştirme ve tekrar kuralı; gelen " + str(d)\nd2 = oyun_durumu("ankara", ["a", "n", "k", "r", "x", "y"])\nassert d2["kazandi"] and d2["bitti"] and d2["hatalar"] == [], "Tüm harfler bilinince kazanılır ve sonraki tahminler yok sayılır; gelen " + str(d2)\nassert d2["maske"] == "a n k a r a", "Kazanınca maske açık olmalı"\nd3 = oyun_durumu("izmir", ["i", "Izmir"])\nassert d3["kazandi"] and d3["maske"] == "i z m i r", "Kelimenin tamamı doğru tahmin edilirse kazanılır"\nd4 = oyun_durumu("bursa", ["konya", "konya", "a", "e", "i", "o", "k", "l", "m"], max_hata=4)\nassert d4["hatalar"] == ["konya", "e", "i", "o"], "Yanlış kelime 1 hata; tekrar sayılmaz; max_hata\'dan sonrası yok sayılır; gelen " + str(d4["hatalar"])\nassert d4["bitti"] and not d4["kazandi"] and d4["kalan_hak"] == 0, "4 hatada oyun kaybedilerek biter"\nassert d4["maske"] == "_ _ _ _ a", "Kaybedince maske yalnızca bilinen harfleri gösterir"\nd5 = oyun_durumu("van", [])\nassert d5 == {"maske": "_ _ _", "hatalar": [], "kalan_hak": 6, "bitti": False, "kazandi": False}, "Başlangıç durumu"\n',
      hints: [
        'Durumu iki yapıda tut: doğru harfler kümesi ve hatalar listesi (sıra önemli olduğu için liste).',
        'Döngünün başında oyun bitti mi diye bak (break); sonra normalleştir, boş ve tekrar tahminleri continue ile atla.',
        'Kazanınca gösterilecek harf kümesi set(kelime) olur; maske bu kümeden hesaplanır.'
      ],
      why: 'Tüm oyun, tahmin listesinden hesaplanan saf bir fonksiyona dönüştü: herhangi bir anın durumunu yeniden üretebilir, test edebilir, kaydedebilirsin. Ekran ve döngü katmanı artık yalnızca bu fonksiyonun sonucunu gösterir.' },
    { id: 'proje-oyunlar-p1',
      t: 'code',
      stage: 'Mini proje',
      diff: 2,
      q: '<p><b>Sayı tahmin oyunu (tam sürüm).</b> <code>oyna(hedef, hak=7, girdi=input)</code> fonksiyonunu yaz:</p><ul><li>Her turda <code>girdi(f"Tahmin ({kalan} hak): ")</code> ile sor (kalan = hak - geçerli deneme sayısı).</li><li>Girdi 1-100 arası tam sayı değilse <code>Lütfen 1-100 arası bir tam sayı gir.</code> yazdır; bu deneme hak yemez.</li><li>Küçükse <code>Daha büyük</code>, büyükse <code>Daha küçük</code> yazdır.</li><li>Bilirse <code>Tebrikler! {deneme} denemede bildin.</code> yazdır ve deneme sayısını döndür.</li><li>Hak biterse <code>Hakkın bitti. Sayı {hedef} idi.</code> yazdır, <code>None</code> döndür.</li></ul><p>Dosyanın sonunda: <code>if __name__ == "__main__":</code> bloğunda <code>random.seed(2026)</code>, <code>hedef = random.randint(1, 100)</code> ve <code>oyna(hedef)</code>. Girdiler hazır verildi; beklenen çıktı tam olarak denetlenir.</p>',
      start: 'import random\n\n\ndef oyna(hedef, hak=7, girdi=input):\n    # TODO\n    pass\n\n\nif __name__ == "__main__":\n    random.seed(2026)\n    hedef = random.randint(1, 100)\n    oyna(hedef)\n',
      sol: 'import random\n\n\ndef tahmini_oku(metin, alt=1, ust=100):\n    try:\n        sayi = int(metin.strip())\n    except ValueError:\n        return None\n    return sayi if alt <= sayi <= ust else None\n\n\ndef oyna(hedef, hak=7, girdi=input):\n    deneme = 0\n    while deneme < hak:\n        tahmin = tahmini_oku(girdi(f"Tahmin ({hak - deneme} hak): "))\n        if tahmin is None:\n            print("Lütfen 1-100 arası bir tam sayı gir.")\n            continue\n        deneme += 1\n        if tahmin == hedef:\n            print(f"Tebrikler! {deneme} denemede bildin.")\n            return deneme\n        print("Daha büyük" if tahmin < hedef else "Daha küçük")\n    print(f"Hakkın bitti. Sayı {hedef} idi.")\n    return None\n\n\nif __name__ == "__main__":\n    random.seed(2026)\n    hedef = random.randint(1, 100)\n    oyna(hedef)\n',
      stdin: ['50', 'abc', '20', '150', '10', '16'],
      expect: 'Tahmin (7 hak): 50\nDaha küçük\nTahmin (6 hak): abc\nLütfen 1-100 arası bir tam sayı gir.\nTahmin (6 hak): 20\nDaha küçük\nTahmin (5 hak): 150\nLütfen 1-100 arası bir tam sayı gir.\nTahmin (5 hak): 10\nDaha büyük\nTahmin (4 hak): 16\nTebrikler! 4 denemede bildin.\n',
      tests: 'import io, contextlib\n_tampon = io.StringIO()\n_g = iter(["1", "2", "3"])\nwith contextlib.redirect_stdout(_tampon):\n    _r = oyna(99, hak=3, girdi=lambda istem: next(_g))\nassert _r is None, "Hak bitince None dönmeli"\nassert "Hakkın bitti. Sayı 99 idi." in _tampon.getvalue(), "Hak bitince hedef sayı söylenmeli"\n_g2 = iter(["x", "", "42"])\nwith contextlib.redirect_stdout(io.StringIO()):\n    _r2 = oyna(42, hak=1, girdi=lambda istem: next(_g2))\nassert _r2 == 1, "Geçersiz girdiler hak yememeli: tek hakla 42 bilinmeli"\n',
      hints: [
        'Rehberli aşamadaki tahmini_oku fonksiyonunu burada yardımcı olarak kullan.',
        'Geçerli deneme sayısını ayrı say: geçersiz girdide continue ile deneme artmadan başa dön.',
        'Kalan hak her istemde hak - deneme; seed 2026 ile hedef 16\'dır.'
      ],
      why: 'Saf yardımcılar (tahmini_oku) ve girdi parametresi sayesinde oyun hem gerçek klavyeyle hem de hazır girdilerle aynı kodla çalışıyor. Sabit tohum, beklenen çıktıyı karakteri karakterine sabitlemeyi mümkün kıldı.' },
    { id: 'proje-oyunlar-p2',
      t: 'code',
      stage: 'Mini proje',
      diff: 3,
      q: '<p><b>Anadolu Bank ATM\'si.</b> <code>atm(bakiye, pin, girdi=input)</code> fonksiyonunu yaz:</p><ol><li><b>PIN:</b> <code>girdi("PIN: ")</code> ile en fazla 3 kez sor. Yanlışsa <code>Hatalı PIN. Kalan deneme: {n}</code> yazdır. Üçüncü yanlışta <code>Kart bloke edildi.</code> yazdır ve <code>None</code> döndür.</li><li><b>Menü döngüsü</b> (<code>while True</code> + <code>match</code>): <code>girdi("İşlem (1 bakiye, 2 yatır, 3 çek, 4 çıkış): ")</code><ul><li><code>"1"</code> → <code>Bakiye: {bakiye:.2f} TL</code></li><li><code>"2"</code>/<code>"3"</code> → <code>girdi("Tutar: ")</code>; tutar pozitif bir sayı (float) değilse <code>Geçersiz tutar</code>; çekmede bakiye yetmiyorsa <code>Yetersiz bakiye</code>; başarılıysa <code>Yeni bakiye: {bakiye:.2f} TL</code></li><li><code>"4"</code> → <code>İyi günler!</code> yazdır, bakiyeyi döndür</li><li>diğer → <code>Geçersiz seçim</code></li></ul></li></ol><p>Dosyanın sonunda <code>atm(1000, "1234")</code> çağrısı hazır girdilerle çalışacak.</p>',
      start: 'def atm(bakiye, pin, girdi=input):\n    # TODO: PIN kontrolü (3 hak)\n    # TODO: while True + match menüsü\n    pass\n\n\natm(1000, "1234")\n',
      sol: 'MAX_PIN_DENEME = 3\n\n\ndef tutar_oku(metin):\n    try:\n        tutar = float(metin)\n    except ValueError:\n        return None\n    return tutar if tutar > 0 else None\n\n\ndef pin_dogrula(pin, girdi):\n    for deneme in range(1, MAX_PIN_DENEME + 1):\n        if girdi("PIN: ").strip() == pin:\n            return True\n        kalan = MAX_PIN_DENEME - deneme\n        if kalan:\n            print(f"Hatalı PIN. Kalan deneme: {kalan}")\n    print("Kart bloke edildi.")\n    return False\n\n\ndef atm(bakiye, pin, girdi=input):\n    if not pin_dogrula(pin, girdi):\n        return None\n    while True:\n        secim = girdi("İşlem (1 bakiye, 2 yatır, 3 çek, 4 çıkış): ").strip()\n        match secim:\n            case "1":\n                print(f"Bakiye: {bakiye:.2f} TL")\n            case "2" | "3":\n                tutar = tutar_oku(girdi("Tutar: "))\n                if tutar is None:\n                    print("Geçersiz tutar")\n                elif secim == "3" and tutar > bakiye:\n                    print("Yetersiz bakiye")\n                else:\n                    bakiye = bakiye + tutar if secim == "2" else bakiye - tutar\n                    print(f"Yeni bakiye: {bakiye:.2f} TL")\n            case "4":\n                print("İyi günler!")\n                return bakiye\n            case _:\n                print("Geçersiz seçim")\n\n\natm(1000, "1234")\n',
      stdin: ['0000', '1234', '1', '2', 'yüz', '2', '250.5', '3', '5000', '3', '-10', '7', '3', '200', '4'],
      expect: 'PIN: 0000\nHatalı PIN. Kalan deneme: 2\nPIN: 1234\nİşlem (1 bakiye, 2 yatır, 3 çek, 4 çıkış): 1\nBakiye: 1000.00 TL\nİşlem (1 bakiye, 2 yatır, 3 çek, 4 çıkış): 2\nTutar: yüz\nGeçersiz tutar\nİşlem (1 bakiye, 2 yatır, 3 çek, 4 çıkış): 2\nTutar: 250.5\nYeni bakiye: 1250.50 TL\nİşlem (1 bakiye, 2 yatır, 3 çek, 4 çıkış): 3\nTutar: 5000\nYetersiz bakiye\nİşlem (1 bakiye, 2 yatır, 3 çek, 4 çıkış): 3\nTutar: -10\nGeçersiz tutar\nİşlem (1 bakiye, 2 yatır, 3 çek, 4 çıkış): 7\nGeçersiz seçim\nİşlem (1 bakiye, 2 yatır, 3 çek, 4 çıkış): 3\nTutar: 200\nYeni bakiye: 1050.50 TL\nİşlem (1 bakiye, 2 yatır, 3 çek, 4 çıkış): 4\nİyi günler!\n',
      tests: 'import io, contextlib\n_t = io.StringIO()\n_g = iter(["1", "2", "3", "1234"])\nwith contextlib.redirect_stdout(_t):\n    _r = atm(500, "1234", girdi=lambda istem: next(_g))\nassert _r is None, "3 yanlış PIN\'de None dönmeli ve dördüncü kez sormamalı"\nassert _t.getvalue().strip().endswith("Kart bloke edildi."), "3 yanlış PIN\'den sonra \'Kart bloke edildi.\' yazmalı"\nassert "Kalan deneme: 0" not in _t.getvalue(), "Üçüncü yanlışta \'Kalan deneme: 0\' yerine doğrudan bloke mesajı yazılmalı"\n_g2 = iter(["1234", "2", "100", "4"])\nwith contextlib.redirect_stdout(io.StringIO()):\n    assert atm(50, "1234", girdi=lambda istem: next(_g2)) == 150, "Çıkışta son bakiye döndürülmeli"\nassert "match" in __source__, "Menüde match kullan"\n',
      hints: [
        'İşi üç parçaya böl: tutar_oku (metin → pozitif float ya da None), pin_dogrula (3 deneme, True/False), atm (menü döngüsü).',
        'PIN döngüsünde kalan deneme 0 olduğunda "Hatalı PIN" satırını yazma; döngü bitince bloke mesajı yaz.',
        'case "2" | "3": içinde önce tutarı doğrula, sonra secim == "3" ise bakiyeyi denetle.'
      ],
      why: 'Proje üç sorumluluğa ayrıldı: girdi doğrulama, kimlik doğrulama ve menü döngüsü. Her biri tek başına anlaşılır ve test edilir; while True + match ise menü tabanlı her uygulamanın (CLI araçları, botlar) iskeletidir.' },
    { id: 'proje-oyunlar-p3',
      t: 'code',
      stage: 'Mini proje',
      diff: 3,
      q: '<p><b>Taş-kağıt-makas turnuvası.</b> <code>turnuva(tur_sayisi, seed, girdi=input)</code> fonksiyonunu yaz:</p><ul><li><code>rng = random.Random(seed)</code> oluştur; <code>SECENEKLER = ("taş", "kağıt", "makas")</code>.</li><li>Her turda <code>girdi("Seçimin (taş/kağıt/makas): ")</code>; <code>strip().lower()</code> ile normalleştir. Geçersizse <code>Geçersiz seçim, tekrar dene.</code> yazdır; tur sayılmaz ve bilgisayar seçim <b>yapmaz</b>.</li><li>Geçerliyse bilgisayar <code>rng.choice(SECENEKLER)</code> ile seçer; <code>Bilgisayar: {seçim} → {sonuç}</code> yazdır. Sonuç: <code>Kazandın</code>, <code>Kaybettin</code> ya da <code>Berabere</code>.</li><li>Turlar bitince <code>Skor: Sen {o} - {b} Bilgisayar</code> yazdır ve <code>(o, b)</code> döndür.</li></ul><p>Dosyanın sonunda <code>turnuva(3, 5)</code> çağrısı hazır girdilerle çalışacak.</p>',
      start: 'import random\n\nSECENEKLER = ("taş", "kağıt", "makas")\n\n\ndef turnuva(tur_sayisi, seed, girdi=input):\n    # TODO\n    pass\n\n\nturnuva(3, 5)\n',
      sol: 'import random\n\nSECENEKLER = ("taş", "kağıt", "makas")\nYENER = {"taş": "makas", "makas": "kağıt", "kağıt": "taş"}\nMESAJ = {"oyuncu": "Kazandın", "bilgisayar": "Kaybettin", "berabere": "Berabere"}\n\n\ndef kazanan(oyuncu, bilgisayar):\n    if oyuncu == bilgisayar:\n        return "berabere"\n    return "oyuncu" if YENER[oyuncu] == bilgisayar else "bilgisayar"\n\n\ndef turnuva(tur_sayisi, seed, girdi=input):\n    rng = random.Random(seed)\n    skor = {"oyuncu": 0, "bilgisayar": 0, "berabere": 0}\n    oynanan = 0\n    while oynanan < tur_sayisi:\n        secim = girdi("Seçimin (taş/kağıt/makas): ").strip().lower()\n        if secim not in SECENEKLER:\n            print("Geçersiz seçim, tekrar dene.")\n            continue\n        bilgisayar = rng.choice(SECENEKLER)\n        sonuc = kazanan(secim, bilgisayar)\n        skor[sonuc] += 1\n        oynanan += 1\n        print(f"Bilgisayar: {bilgisayar} → {MESAJ[sonuc]}")\n    print(f"Skor: Sen {skor[\'oyuncu\']} - {skor[\'bilgisayar\']} Bilgisayar")\n    return skor["oyuncu"], skor["bilgisayar"]\n\n\nturnuva(3, 5)\n',
      stdin: ['taş', 'kalem', 'makas', 'Kağıt '],
      expect: 'Seçimin (taş/kağıt/makas): taş\nBilgisayar: makas → Kazandın\nSeçimin (taş/kağıt/makas): kalem\nGeçersiz seçim, tekrar dene.\nSeçimin (taş/kağıt/makas): makas\nBilgisayar: kağıt → Kazandın\nSeçimin (taş/kağıt/makas): Kağıt \nBilgisayar: makas → Kaybettin\nSkor: Sen 2 - 1 Bilgisayar\n',
      tests: 'import io, contextlib\n_rng = random.Random(9)\n_pc = [_rng.choice(SECENEKLER) for _ in range(4)]\n_yener = {"taş": "makas", "makas": "kağıt", "kağıt": "taş"}\n_oyuncu = [_p for _p in _pc]\n_g = iter(_oyuncu)\nwith contextlib.redirect_stdout(io.StringIO()):\n    _r = turnuva(4, 9, girdi=lambda istem: next(_g))\nassert _r == (0, 0), "Bilgisayarla hep aynı seçimi yapan oyuncu: 4 beraberlik, skor (0, 0) olmalı; gelen " + str(_r)\n_kazanan_hamle = {v: k for k, v in _yener.items()}\n_g2 = iter([_kazanan_hamle[_p].capitalize() for _p in _pc])\nwith contextlib.redirect_stdout(io.StringIO()):\n    _r2 = turnuva(4, 9, girdi=lambda istem: next(_g2))\nassert _r2 == (4, 0), "Her turda bilgisayarı yenen hamle: (4, 0) olmalı; bilgisayar yalnızca geçerli turda rng.choice çağırmalı"\n',
      hints: [
        'Oynanan tur sayısını ayrı say; geçersiz girdide continue ile sayaç artmadan başa dön (bilgisayar seçimi de continue\'dan SONRA yapılmalı).',
        'Sonuç → mesaj eşlemesini sözlükte tut: {"oyuncu": "Kazandın", ...}.',
        'Seed 5 ile bilgisayarın ilk üç seçimi: makas, kağıt, makas.'
      ],
      why: 'Kendi tohumlu üreteci (random.Random(seed)) sayesinde testler bilgisayarın her hamlesini önceden bildi ve "hep berabere", "hep kazan" senaryolarını kurabildi. Bilgisayarın yalnızca geçerli turda seçim yapması, rastgele dizinin girdi hatalarından etkilenmemesini sağlar.' }
  ],
  faq: [
    { q: 'Neden oyunlarda girdi=input diye bir parametre var?',
      a: 'Fonksiyon normalde gerçek input\'u kullanır; testte ise ona hazır cevaplar döndüren bir fonksiyon verirsin. Böylece oyunu klavyeye dokunmadan, saniyeler içinde onlarca senaryoyla deneyebilirsin. Bu kalıba bağımlılık enjeksiyonu denir ve büyük projelerde veritabanı, saat ve ağ için de aynı şekilde kullanılır.' },
    { q: 'random.seed mi kullanmalıyım, random.Random(seed) mi?',
      a: 'random.seed tüm programın ortak üretecini sabitler; programın başka bir yeri de random kullanıyorsa dizi kayar. random.Random(seed) yalnızca sana ait bir üreteç oluşturur; testte daha güvenilirdir. Kısa betiklerde ikisi de iş görür.' },
    { q: 'Şifre üretici için random yeterli mi?',
      a: 'Hayır. random oyun ve simülasyon içindir; ürettiği dizi tahmin edilebilir. Gerçek şifre, token ve doğrulama kodu için secrets modülünü (secrets.choice, secrets.token_urlsafe) kullan. Bu derste test edebilmek için tohumlu random kullandık.' },
    { q: 'Bu projeleri tarayıcıda değil kendi bilgisayarımda nasıl oynarım?',
      a: 'Kodu bir .py dosyasına kaydet, test için verdiğin girdi fonksiyonunu kaldır (girdi varsayılan olarak input olur) ve python oyun.py ile çalıştır. Seed satırını kaldırırsan her oyunda farklı sayı gelir.' },
    { q: 'Projeyi daha da geliştirmek için ne ekleyebilirim?',
      a: 'Skor tablosunu JSON dosyasına kaydetme, zorluk seviyeleri (aralık ve hak sayısı), adam asmacaya kelime listesi dosyası ve ipucu hakkı, ATM\'ye işlem geçmişi ve günlük çekim limiti. Her eklemeyi önce saf bir fonksiyon olarak yazıp test et, sonra döngüye bağla.' }
  ],
  mistakes: [
    { bad: 'tahmin = input("Tahmin: ")\nif tahmin < hedef:\n    ...',
      good: 'tahmin = int(input("Tahmin: "))\nif tahmin < hedef:\n    ...',
      why: 'input her zaman metin döndürür; metinle sayıyı karşılaştırmak TypeError verir. Ayrıca int() de geçersiz girdide hata verir, onu da try ile koru.' },
    { bad: 'while True:\n    secim = input()\n    if secim == "1":\n        ...\n    # çıkış seçeneği yok',
      good: 'while True:\n    secim = input()\n    match secim:\n        case "4":\n            break\n        ...',
      why: 'Sonsuz döngünün mutlaka bir çıkış yolu olmalı; yoksa program ancak zorla durdurulur.' },
    { bad: 'def oyna():\n    hedef = random.randint(1, 100)\n    ...',
      good: 'def oyna(hedef, girdi=input):\n    ...\n\noyna(random.randint(1, 100))',
      why: 'Rastgeleliği fonksiyonun içine gömersen test edilemez; hedefi dışarıdan almak, testte bilinen bir değer vermeni sağlar.' },
    { bad: 'sifre = "".join(random.choice(havuz) for _ in range(12))',
      good: 'sifre = "".join(secrets.choice(havuz) for _ in range(12))',
      why: 'random tahmin edilebilir; güvenlikle ilgili her üretimde secrets kullanılır. Ayrıca yalnızca havuzdan seçmek her gruptan karakter olacağını garanti etmez.' },
    { bad: 'def coz(metin, k):\n    # ayrı, tersine algoritma\n    ...',
      good: 'def coz(metin, k):\n    return sezar(metin, -k)',
      why: 'Çözme, ters yönde şifrelemedir; ayrı bir algoritma yazmak kodu ikiye katlar ve iki fonksiyonun birbirini tutmama riskini doğurur.' }
  ] }
);
})(window);
