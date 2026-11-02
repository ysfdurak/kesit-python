/* Kesit Python — Orta: Modüller ve paketler (PCAP 1) */
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push({
  id: 'moduller-paketler',
  lv: 'orta',
  mod: 'Modüller ve Paketler',
  min: 45,
  title: 'Modüller ve paketler: import sisteminin içi',
  sum: 'Tüm import biçimlerini, sys.path ve modül arama sırasını, __name__, __pycache__ ve .pyc dosyalarını, paket ve __init__.py yapısını, göreli import ve __all__ kurallarını, importlib.reload ile platform, math ve random modüllerini PCAP düzeyinde öğrenirsin.',
  goals: [
    'import, from-import, as ve * biçimlerinin hangi adları getirdiğini açıklayabilirim.',
    'Python\'ın bir modülü sys.modules, yerleşik modüller ve sys.path sırasıyla nasıl bulduğunu anlatabilirim.',
    'Kendi modülümü ve iç içe paketimi yazıp göreli import, __all__ ve _ad kurallarını doğru kullanabilirim.',
    '__name__, __pycache__, .pyc ve importlib.reload davranışını bilir, eski kod çalışması sorununu çözebilirim.',
    'platform, math ve random modüllerinin PCAP\'ta sorulan fonksiyonlarını doğru kullanabilirim.'
  ],
  body: `
<h2>Neden önemli?</h2>
<p>Anadolu Market'in kodu tek bir dosyada başladı: 200 satır. İki yıl sonra fiyatlama, kargo, raporlama ve kampanya kodu 15 000 satıra çıktı ve tek dosya kimsenin açmak istemediği bir canavara dönüştü. Çözüm, kodu anlamlı parçalara bölmektir: her dosya bir <b>modül</b> (module), ilgili modülleri toplayan klasör bir <b>paket</b> (package). Kapsam ve modüller dersinde <code>import math</code> yazmayı ve <code>if __name__ == "__main__"</code> kalıbını gördün. Bu derste import sisteminin içine giriyoruz: Python modülü nerede arar, neden bir kez yükler, paketi nasıl tanır, göreli import neden bazen patlar. Bu konular PCAP sınavının ilk bölümüdür ve gerçek projede en sık karşılaşılan "ModuleNotFoundError" sorunlarının kaynağıdır.</p>
<div class="note"><b>Tarayıcıda çoklu dosya</b>Bu uygulamada tek bir kod kutun var. Modül ve paket alıştırmalarında dosyaları kodla yazacağız (<code>open(...).write(...)</code>) ya da modülü doğrudan bellekte oluşturacağız (<code>types.ModuleType</code>). Arkada çalışan mekanizma kendi bilgisayarındakinin aynısıdır.</div>

<h2>Dört import biçimi</h2>
<div class="tbl-wrap"><table>
<tr><th>Biçim</th><th>Ad alanına ne girer?</th><th>Kullanım</th></tr>
<tr><td><code>import math</code></td><td>Yalnızca <code>math</code></td><td><code>math.sqrt(16)</code></td></tr>
<tr><td><code>import statistics as st</code></td><td>Yalnızca <code>st</code> (takma ad)</td><td><code>st.mean(x)</code></td></tr>
<tr><td><code>from math import ceil, floor</code></td><td><code>ceil</code> ve <code>floor</code>; <code>math</code> adı GİRMEZ</td><td><code>ceil(2.1)</code></td></tr>
<tr><td><code>from math import sqrt as kok</code></td><td>Yalnızca <code>kok</code></td><td><code>kok(9)</code></td></tr>
<tr><td><code>from math import *</code></td><td><code>__all__</code> varsa onun listesi, yoksa <code>_</code> ile başlamayan tüm adlar</td><td>Etkileşimli denemede; iş kodunda kaçın</td></tr>
</table></div>
<pre class="py">import math
import statistics as st
from math import ceil, floor
from math import sqrt as kok

print(math.pi, st.mean([10, 20, 30]))
print(ceil(2.1), floor(2.9), kok(81))
print("math" in dir(), "sqrt" in dir(), "kok" in dir())</pre>
<p><code>dir()</code> parametresiz çağrılınca o anki ad alanındaki adları, <code>dir(modul)</code> ise modülün içindeki adları listeler. Bir modülün ne sunduğunu keşfetmenin en hızlı yoludur; <code>help(math.hypot)</code> ise belge metnini (docstring) gösterir. Aynı metin <code>math.hypot.__doc__</code> içinde de durur.</p>
<div class="warn"><b>Yıldızlı import sessizce ezer</b><code>e = 1.4</code> (fiyat esnekliği) tanımlayıp sonra <code>from math import *</code> yazarsan senin <code>e</code>'n Euler sayısıyla (2.718...) değiştirilir ve hiçbir uyarı almazsın. Ekip kodunda <code>import math</code> ya da açık adlı <code>from math import ceil</code> kullan.</div>

<h2>Python modülü nerede arar?</h2>
<p><code>import kargo</code> satırında Python şu sırayı izler:</p>
<div class="steps-list"><ol>
<li><b>sys.modules</b>: Daha önce yüklendiyse hazır nesneyi verir, dosyaya hiç bakmaz.</li>
<li><b>Yerleşik modüller</b>: Yorumlayıcıya gömülü modüller (<code>sys.builtin_module_names</code>, ör. <code>sys</code>).</li>
<li><b>sys.path</b> listesi baştan sona: çalıştırılan betiğin klasörü, <code>PYTHONPATH</code> ortam değişkenindeki klasörler, standart kütüphane, <code>site-packages</code> (pip ile kurulanlar).</li>
<li>Hiçbirinde yoksa <b>ModuleNotFoundError</b>.</li>
</ol></div>
<pre class="py">import sys
print(type(sys.path), len(sys.path) &gt; 0)
for yol in sys.path[:4]:
    print(" -", yol)
print("sys" in sys.builtin_module_names)
print("json" in sys.modules)       # henüz yüklenmedi mi?
import json
print("json" in sys.modules)       # artık önbellekte</pre>
<div class="tip"><b>Dosyana standart modül adı verme</b>Proje klasörüne <code>random.py</code> ya da <code>json.py</code> koyarsan, betiğin klasörü <code>sys.path</code>'te önce geldiği için Python seninkini yükler ve "module has no attribute" hatası alırsın. Bu, yeni başlayanların en sık yaşadığı gizemli hatadır.</div>

<h2>Kendi modülünü yazmak</h2>
<p>Her <code>.py</code> dosyası bir modüldür; adı dosya adıdır. Tarayıcıda dosyayı kodla yazıp mevcut klasörü <code>sys.path</code>'e ekleyelim:</p>
<pre class="py">import sys, importlib

kaynak = '''"""Anadolu Market fiyat araçları."""
KDV = 0.20
_IC_SAYAC = 0                  # alt çizgi: iç kullanım

def kdv_ekle(tutar):
    """Tutara KDV ekler, 2 ondalığa yuvarlar."""
    return round(tutar * (1 + KDV), 2)

print("am_fiyat yüklendi, __name__ =", __name__)
'''
with open("am_fiyat.py", "w", encoding="utf-8") as f:
    f.write(kaynak)

if "." not in sys.path:
    sys.path.insert(0, ".")
importlib.invalidate_caches()      # yeni dosyayı bulucuların görmesi için
sys.modules.pop("am_fiyat", None)  # kutuyu yeniden çalıştırırsan diye

import am_fiyat
import am_fiyat                    # ikinci import: hiçbir şey yazdırmaz
print(am_fiyat.kdv_ekle(100), am_fiyat.__doc__)
print(am_fiyat.__file__.endswith("am_fiyat.py"))</pre>
<p>Dikkat: modülün içindeki <code>print</code> yalnızca <b>bir kez</b> çalıştı. Modül ilk importta yukarıdan aşağı çalıştırılır, oluşan nesne <code>sys.modules</code>'e konur; sonraki importlar aynı nesneyi döndürür. Modül içinde <code>__name__</code> modülün adıdır (<code>"am_fiyat"</code>); dosya doğrudan çalıştırıldığında ise <code>"__main__"</code> olur.</p>

<h3>Dosyasız modül: types.ModuleType</h3>
<p>Modül aslında sıradan bir nesnedir. Dosya olmadan da oluşturup <code>sys.modules</code>'e kaydedebilirsin; testlerde sahte modül hazırlamak için bu yöntem kullanılır.</p>
<pre class="py">import sys, types

ayar = types.ModuleType("am_ayar", "Kampanya ayarları")
ayar.ESIK = 500
ayar.ORAN = 0.10
sys.modules["am_ayar"] = ayar

from am_ayar import ESIK, ORAN
print(ESIK, ORAN, ayar.__name__, ayar.__doc__)</pre>

<h2>__pycache__, .pyc ve reload</h2>
<p>Python bir modülü ilk yüklediğinde kaynağı bayt koduna (bytecode) derler ve <code>__pycache__/ad.cpython-312.pyc</code> dosyasına yazar. Sonraki çalıştırmada kaynak değişmemişse (değiştirme zamanı ve boyutu aynıysa) derlemeyi atlar. <code>.pyc</code> dosyaları depoya konmaz; <code>.gitignore</code>'a <code>__pycache__/</code> eklenir.</p>
<p>Modül dosyasını değiştirdin ve yeni hâlini aynı oturumda görmek istiyorsun: <code>import</code> işe yaramaz, çünkü önbellekteki nesneyi döndürür. <code>importlib.reload(modul)</code> modül kodunu <b>aynı nesnenin</b> içinde yeniden çalıştırır.</p>
<pre class="py">import sys, os, importlib, importlib.util

def yaz(metin):
    with open("am_kur.py", "w", encoding="utf-8") as f:
        f.write(metin)

if "." not in sys.path:
    sys.path.insert(0, ".")
yaz("USD = 32.5\\n")
importlib.invalidate_caches()
sys.modules.pop("am_kur", None)
import am_kur
print("ilk:", am_kur.USD)

yaz("USD = 33.1\\n")                               # aynı boyut, aynı saniye!
pyc = importlib.util.cache_from_source("am_kur.py")
print("önbellek dosyası:", pyc)
if os.path.exists(pyc):
    os.remove(pyc)                                # bayat .pyc'yi sil
importlib.reload(am_kur)
print("reload sonrası:", am_kur.USD)</pre>
<div class="warn"><b>reload'un iki tuzağı</b>(1) <code>from am_kur import USD</code> ile aldığın ad eski değeri göstermeye devam eder; reload yalnızca modül nesnesini günceller. (2) Dosyayı aynı saniyede ve aynı boyutla yeniden yazarsan Python <code>.pyc</code>'yi hâlâ geçerli sanabilir; yukarıdaki gibi önbellek dosyasını sil ya da <code>sys.dont_write_bytecode = True</code> kullan.</div>

<h2>Paketler: modül klasörü</h2>
<p>Paket, içinde <code>__init__.py</code> bulunan bir klasördür. <code>__init__.py</code> paket ilk import edildiğinde çalışır; boş olabilir, paket düzeyi ayarları ve dışa açılan adları içerebilir. Paketin içinde başka paketler (alt paketler) olabilir:</p>
<pre class="out">anadolu/
    __init__.py          # SURUM, __all__
    fiyat.py             # kdv_ekle
    rapor/
        __init__.py
        ozet.py          # from ..fiyat import kdv_ekle</pre>
<pre class="py">import os, sys, importlib, shutil

dosyalar = {
    "am_anadolu/__init__.py": 'SURUM = "1.2.0"\\n__all__ = ["fiyat"]\\n',
    "am_anadolu/fiyat.py": "def kdv_ekle(t):\\n    return round(t * 1.2, 2)\\n",
    "am_anadolu/rapor/__init__.py": "",
    "am_anadolu/rapor/ozet.py": (
        "from ..fiyat import kdv_ekle\\n"
        "from . import __name__ as paket_adi\\n"
        "def satir(urun, tutar):\\n"
        "    return f'{urun}: {kdv_ekle(tutar)} TL'\\n"
    ),
}
for yol, icerik in dosyalar.items():
    os.makedirs(os.path.dirname(yol), exist_ok=True)
    with open(yol, "w", encoding="utf-8") as f:
        f.write(icerik)
if "." not in sys.path:
    sys.path.insert(0, ".")
importlib.invalidate_caches()

import am_anadolu
from am_anadolu.rapor import ozet
print(am_anadolu.SURUM, am_anadolu.__path__ is not None)
print(ozet.satir("Çay", 50), "|", ozet.paket_adi, "|", ozet.__name__)
shutil.rmtree("am_anadolu")</pre>
<div class="tbl-wrap"><table>
<tr><th>Yazım</th><th>Anlamı</th></tr>
<tr><td><code>from . import fiyat</code></td><td>Aynı paketteki <code>fiyat</code> modülü</td></tr>
<tr><td><code>from .fiyat import kdv_ekle</code></td><td>Aynı paketin fiyat modülünden bir ad</td></tr>
<tr><td><code>from ..fiyat import kdv_ekle</code></td><td>Bir üst paketin fiyat modülünden</td></tr>
<tr><td><code>import am_anadolu.rapor.ozet</code></td><td>Mutlak import; üç modül de yüklenir, ad alanına <code>am_anadolu</code> girer</td></tr>
</table></div>
<p>Göreli import (relative import) yalnızca <b>paketin içindeki</b> modüllerde çalışır. Bir dosyayı doğrudan <code>python ozet.py</code> ile çalıştırırsan <code>__name__</code> <code>"__main__"</code> olur, paket bilgisi kaybolur ve "attempted relative import with no known parent package" hatası alırsın. Çözüm: kök klasörden <code>python -m am_anadolu.rapor.ozet</code>.</p>

<h3>__all__ ve _ad: dışa ne açılır?</h3>
<p>Python'da gerçek "private" yoktur, <b>anlaşma</b> vardır. Alt çizgiyle başlayan ad (<code>_IC_SAYAC</code>) "iç kullanım, dokunma" demektir ve yıldızlı importa girmez. <code>__all__</code> listesi tanımlıysa yıldızlı import yalnızca o adları getirir; listede alt modül adı varsa o alt modül de yüklenir. Açık importla (<code>from m import _IC_SAYAC</code>) iki kural da aşılabilir; yani koruma değil, belgelemedir.</p>

<h2>PCAP'ın sevdiği üç modül</h2>
<h3>platform: kod nerede çalışıyor?</h3>
<pre class="py">import platform
print(platform.system())                  # Linux, Windows, Darwin; tarayıcıda Emscripten
print(platform.python_version())           # '3.12.x' gibi metin
surum = platform.python_version_tuple()    # METİN demeti: ('3', '12', '1')
print(surum, type(surum[1]))
print(tuple(int(p) for p in surum[:2]) &gt;= (3, 10))
print(platform.python_implementation(), platform.machine())</pre>
<p><code>python_version_tuple()</code> elemanları <b>metin</b> döndürür; <code>"9" &gt; "10"</code> True olduğundan karşılaştırmadan önce <code>int</code>'e çevir. <code>platform.platform()</code> tek satırlık özet verir.</p>
<h3>math: yuvarlama ailesi ve geometri</h3>
<div class="tbl-wrap"><table>
<tr><th>Fonksiyon</th><th>2.7</th><th>-2.7</th><th>Not</th></tr>
<tr><td><code>math.ceil</code></td><td>3</td><td>-2</td><td>Yukarı (artı sonsuza)</td></tr>
<tr><td><code>math.floor</code></td><td>2</td><td>-3</td><td>Aşağı (eksi sonsuza)</td></tr>
<tr><td><code>math.trunc</code></td><td>2</td><td>-2</td><td>Ondalığı at (sıfıra doğru), <code>int()</code> gibi</td></tr>
<tr><td><code>round</code></td><td>3</td><td>-3</td><td>Yerleşik; .5'te çifte yuvarlar: <code>round(2.5) == 2</code></td></tr>
</table></div>
<pre class="py">import math
print(math.ceil(-2.7), math.floor(-2.7), math.trunc(-2.7), round(-2.7))
print(math.factorial(5))                   # 5 teslimat noktası: 120 farklı sıra
print(math.hypot(3, 4), math.sqrt(25))      # depo-müşteri kuş uçuşu mesafe
print(math.ceil(1250 / 400), "koli")       # 1250 ürün, koli başına 400</pre>
<h3>random: tekrarlanabilir rastgelelik</h3>
<pre class="py">import random
musteriler = ["Ayşe", "Mehmet", "Zeynep", "Can", "Elif"]
random.seed(2024)                          # aynı tohum = aynı sonuç
print(random.random() &lt; 1, random.randint(1, 6), random.randrange(0, 10, 2))
print(random.choice(musteriler))           # tek seçim
print(random.sample(musteriler, 2))        # tekrarsız k seçim, yeni liste
kopya = musteriler[:]
print(random.shuffle(kopya), kopya)        # yerinde karıştırır, None döndürür
print(musteriler)                          # orijinal aynı</pre>
<p><code>sample</code> tekrarsız seçer ve yeni liste döndürür; <code>choices(liste, k=3)</code> ise tekrar edebilir. <code>shuffle</code> listeyi yerinde değiştirir ve <code>None</code> döndürür; demet ya da metin gibi değişmez dizilerde çalışmaz.</p>

<div class="note"><b>Gerçek işte</b>Kurumsal projelerde kod genelde <code>src/sirket_adi/</code> altında bir pakettir; testler ayrı <code>tests/</code> klasöründedir ve paketi mutlak importla kullanır. Kod incelemesinde en sık yorumlar: "yıldızlı import kaldır", "döngüsel import var, ortak kodu ayrı modüle taşı", "modül import edilince yan etki (veritabanı bağlantısı, print) yapmasın, main()'e al". Jupyter'de modülü düzenleyip değişikliği göremiyorsan sebep <code>sys.modules</code> önbelleğidir; <code>importlib.reload</code> ya da <code>%autoreload</code> kullanılır.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Döngüsel import</h3>
<p><code>siparis.py</code> <code>musteri.py</code>'yi, o da <code>siparis.py</code>'yi import ederse ikinci import yarım yüklenmiş modülü alır ve "cannot import name" ya da "partially initialized module" hatası çıkar. Çözümler: ortak kodu üçüncü bir modüle taşımak, importu fonksiyonun içine almak ya da tasarımı sadeleştirmek. Alıştırmalarda bağımlılık grafiğinde döngü bulan bir fonksiyon yazacaksın.</p>
<h3>Ad alanı paketleri ve importlib</h3>
<p>Python 3.3'ten beri <code>__init__.py</code> olmayan klasörler de <b>ad alanı paketi</b> (namespace package) olarak import edilebilir; büyük kuruluşlar tek bir ad altında ayrı ayrı dağıtılan paketler için kullanır. Yine de normal projede <code>__init__.py</code> koy: niyeti belli eder ve araçların (pytest, mypy) kafası karışmaz. Adı çalışma anında belli olan modüller için <code>importlib.import_module("am_eklenti." + ad)</code>, var olup olmadığını yüklemeden öğrenmek için <code>importlib.util.find_spec(ad)</code> kullanılır; eklenti sistemleri böyle kurulur.</p>
<h3>Modül bir tekil nesnedir</h3>
<p>Modül yalnızca bir kez yüklendiği için modül düzeyindeki bir sözlük tüm uygulamada paylaşılır. Bu, yapılandırma için kullanışlıdır ama testlerde gizli bağımlılık yaratır; ayarları fonksiyon parametresiyle geçirmek daha test edilebilirdir.</p>
</section>
`,
  ex: [
    { t: 'mc', stage: 'Isınma',
      q: '<code>am_kampanya</code> modülünde <code>__all__ = ["uygula"]</code> tanımlı; modülde ayrıca <code>ORAN</code> ve <code>_log</code> adları var. <code>from am_kampanya import *</code> sonrası ad alanına hangileri girer?',
      o: ['uygula, ORAN ve _log', 'Yalnızca uygula', 'uygula ve ORAN', 'Hiçbiri; __all__ yalnızca belgelemedir'], a: 1,
      why: '__all__ tanımlıysa yıldızlı import YALNIZCA o listeyi getirir. __all__ olmasaydı alt çizgisiz adlar (uygula, ORAN) gelirdi; _log her iki durumda da gelmez.' },
    { t: 'mc', stage: 'Isınma',
      q: 'Bir modülün en üstünde <code>print("yüklendi")</code> var. Aynı programda <code>import am_rapor</code> satırı üç farklı yerde çalışıyor. Ekranda kaç kez "yüklendi" görünür?',
      o: ['Üç kez, her import satırında bir', 'Hiç, import print çalıştırmaz', 'Bir kez', 'İki kez: ilk ve son importta'], a: 2,
      why: 'Modül ilk importta çalıştırılır ve sys.modules önbelleğine konur. Sonraki importlar önbellekteki nesneyi döndürür, modül kodu tekrar çalışmaz. Yeniden çalıştırmak için importlib.reload gerekir.' },
    { t: 'mc', stage: 'Isınma',
      q: '<code>platform.python_version_tuple()</code> bir sistemde <code>(\'3\', \'9\', \'18\')</code> döndürüyor. <code>platform.python_version_tuple() &gt;= (\'3\', \'10\')</code> ifadesi ne verir ve neden?',
      o: ['False, çünkü 3.9 sürümü 3.10\'dan eskidir', 'TypeError, metin demetleri karşılaştırılamaz', 'True, çünkü metinde "9" &gt; "1"', 'False, çünkü demetlerin uzunlukları farklı'], a: 2,
      why: 'Elemanlar metindir; "9" ile "10" karşılaştırılırken ilk karakterler ("9" ve "1") belirleyicidir ve "9" büyüktür. Bu yüzden yanlış biçimde True çıkar. Doğrusu tuple(int(p) for p in surum[:2]) >= (3, 10).' },
    { t: 'predict', stage: 'Kodu oku', q: 'Bu kod ne yazdırır?',
      code: 'import sys, types\n\nm = types.ModuleType("am_kampanya")\nm.ORAN = 0.1\nm._GIZLI = "x"\nm.uygula = lambda t: t * 0.9\nm.__all__ = ["ORAN"]\nsys.modules["am_kampanya"] = m\n\nfrom am_kampanya import *\nprint(ORAN, "uygula" in dir(), "_GIZLI" in dir())\n',
      o: ['0.1 True False', '0.1 False False', '0.1 True True', 'ImportError'], a: 1,
      why: 'Modül sys.modules\'e kaydedildiği için import onu bulur. __all__ yalnızca ORAN içerdiğinden yıldızlı import uygula\'yı da getirmez; _GIZLI zaten hiç gelmez.' },
    { t: 'predict', stage: 'Kodu oku', q: 'Bu kod ne yazdırır?',
      code: 'import math\nprint(math.ceil(-2.5), math.floor(-2.5), math.trunc(-2.5), round(-2.5))\n',
      o: ['-3 -2 -2 -3', '-2 -3 -2 -2', '-2 -3 -3 -3', '-3 -3 -2 -2'], a: 1,
      why: 'ceil artı sonsuza doğru (-2), floor eksi sonsuza doğru (-3), trunc sıfıra doğru (-2) gider. round ise .5 durumunda çift sayıya yuvarlar (bankacı yuvarlaması): -2.5 → -2.' },
    { t: 'predict', stage: 'Kodu oku', q: 'Bu kod ne yazdırır?',
      code: 'import types\n\nm = types.ModuleType("rapor")\nexec("def kim():\\n    return __name__", m.__dict__)\nprint(m.__name__, m.kim(), __name__)\n',
      o: ['__main__ __main__ __main__', 'rapor __main__ __main__', 'rapor rapor __main__', 'rapor rapor rapor'], a: 2,
      why: 'Fonksiyon __name__ adını tanımlandığı modülün ad alanından okur; o da "rapor"dur. Doğrudan çalıştırılan programın kendi __name__ değeri ise "__main__".' },
    { t: 'order', stage: 'Kodu oku',
      q: '<p>Bir modül dosyasını kodla yazıp adıyla (metin olarak) içe aktaran programın satırlarını sırala. Çıktı <code>45 am_kargo_sira</code> olmalı.</p>',
      lines: ['import sys, importlib, pathlib', 'yol = pathlib.Path("am_kargo_sira.py")', 'yol.write_text("UCRET = 45\\n", encoding="utf-8")', 'sys.path.insert(0, str(yol.resolve().parent))', 'importlib.invalidate_caches()', 'kargo = importlib.import_module(yol.stem)', 'print(kargo.UCRET, kargo.__name__)', 'yol.unlink()'],
      expect: '45 am_kargo_sira\n',
      hint: 'Önce dosya yazılır, sonra klasör arama yoluna eklenir, bulucu önbelleği temizlenir, en son import edilir. Dosya en sonda silinir.',
      why: 'import_module, adı çalışma anında belli olan modülleri yükler; yol.stem dosya adını uzantısız verir. invalidate_caches, yeni oluşan dosyanın bulunmasını garanti eder.' },
    { t: 'code', stage: 'Rehberli', id: 'moduller-paketler-1', diff: 1,
      q: '<p>Test ortamı için sahte modül üreticisi: <code>modul_olustur(ad, kaynak)</code> fonksiyonunu yaz. <code>types.ModuleType(ad)</code> ile modül oluştursun, <code>kaynak</code> metnini modülün <code>__dict__</code>\'i içinde <code>exec</code> ile çalıştırsın, modülü <code>sys.modules[ad]</code>\'a kaydetsin ve modülü döndürsün. Böylece sonra <code>import ad</code> çalışmalı.</p>',
      guide: ['types ve sys modüllerini içe aktar.', 'types.ModuleType(ad) ile boş modül oluştur.', 'exec(kaynak, modul.__dict__) ile kodu modülün ad alanında çalıştır.', 'sys.modules[ad] = modul ile kaydet ve modülü döndür.'],
      example: 'import types\nayar = types.ModuleType("am_ornek")\nexec("X = 5\\nY = X * 2", ayar.__dict__)\nprint(ayar.X, ayar.Y, ayar.__name__)\n',
      start: 'import sys, types\n\ndef modul_olustur(ad, kaynak):\n    # TODO: types.ModuleType ile modül oluştur\n    # TODO: kaynak kodu modülün __dict__\'i içinde çalıştır\n    # TODO: sys.modules\'e kaydet ve döndür\n    pass\n',
      sol: 'import sys, types\n\ndef modul_olustur(ad, kaynak):\n    modul = types.ModuleType(ad)\n    exec(kaynak, modul.__dict__)\n    sys.modules[ad] = modul\n    return modul\n\nm = modul_olustur("am_kdv_bellek", "ORAN = 0.2\\ndef kdv(t):\\n    return round(t * (1 + ORAN), 2)\\n")\nprint(m.kdv(100))\n',
      tests: 'import sys\nm = modul_olustur("am_kdv_bellek2", "ORAN = 0.2\\ndef kdv(t):\\n    return round(t * (1 + ORAN), 2)\\n")\nassert m is not None and hasattr(m, "kdv"), "modül döndürülmeli ve kaynak içindeki kdv fonksiyonunu içermeli"\nassert m.kdv(100) == 120.0, "kdv(100) 120.0 olmalı"\nassert m.__name__ == "am_kdv_bellek2", "modülün __name__ değeri verilen ad olmalı"\nassert sys.modules.get("am_kdv_bellek2") is m, "modül sys.modules\'e kaydedilmeli"\nimport am_kdv_bellek2\nassert am_kdv_bellek2 is m, "import aynı nesneyi döndürmeli"\nfrom am_kdv_bellek2 import ORAN\nassert ORAN == 0.2\n',
      hints: ['Modülün ad alanı bir sözlüktür: modul.__dict__.', 'exec(kaynak, modul.__dict__)', 'Son iki satır: sys.modules[ad] = modul ve return modul'],
      why: 'import önce sys.modules\'e bakar; oraya kaydedilen nesne dosya aranmadan döndürülür. unittest.mock.patch.dict(sys.modules, ...) ile testlerde sahte modül vermek de bu ilkeye dayanır.' },
    { t: 'code', stage: 'Rehberli', id: 'moduller-paketler-2', diff: 2,
      q: '<p><code>modul_dosyasi_yukle(ad, kaynak)</code> fonksiyonunu yaz: <code>kaynak</code>\'ı geçerli klasöre <code>ad + ".py"</code> dosyası olarak yazsın, <code>"."</code> klasörü <code>sys.path</code>\'te yoksa başa eklesin, <code>importlib.invalidate_caches()</code> çağırsın, eski kopyayı <code>sys.modules</code>\'ten çıkarsın ve <code>importlib.import_module(ad)</code> ile yükleyip döndürsün.</p>',
      guide: ['open(f"{ad}.py", "w", encoding="utf-8") ile dosyayı yaz.', '"." sys.path\'te yoksa sys.path.insert(0, ".").', 'importlib.invalidate_caches() çağır.', 'sys.modules.pop(ad, None) ile eski kopyayı at.', 'importlib.import_module(ad) döndür.'],
      example: 'import importlib\nad = "json"\nmodul = importlib.import_module(ad)      # adı metin olan modül\nprint(modul.dumps({"sehir": "Van"}))\n',
      start: 'import sys, importlib\n\ndef modul_dosyasi_yukle(ad, kaynak):\n    # TODO: dosyayı yaz\n    # TODO: sys.path ve invalidate_caches\n    # TODO: sys.modules\'ten eskiyi çıkar, import_module ile yükle\n    pass\n',
      sol: 'import sys, importlib\n\ndef modul_dosyasi_yukle(ad, kaynak):\n    with open(f"{ad}.py", "w", encoding="utf-8") as f:\n        f.write(kaynak)\n    if "." not in sys.path:\n        sys.path.insert(0, ".")\n    importlib.invalidate_caches()\n    sys.modules.pop(ad, None)\n    return importlib.import_module(ad)\n\nm = modul_dosyasi_yukle("am_sehir_r2", \'SEHIRLER = ["İzmir", "Ankara"]\\n\')\nprint(m.SEHIRLER)\nimport os\nos.remove("am_sehir_r2.py")\n',
      tests: 'import os\ntry:\n    m = modul_dosyasi_yukle("am_sehir_t2", \'SEHIRLER = ["İzmir", "Ankara"]\\n\')\n    assert m is not None and m.SEHIRLER == ["İzmir", "Ankara"], "dosyaya yazılan modül yüklenmeli"\n    assert m.__file__.endswith("am_sehir_t2.py"), "modül gerçek dosyadan gelmeli (__file__)"\n    m2 = modul_dosyasi_yukle("am_sehir_t2", \'SEHIRLER = ["Van"]\\nEK = 1\\n\')\n    assert m2.SEHIRLER == ["Van"] and m2.EK == 1, "ikinci çağrı yeni içeriği yüklemeli: sys.modules\'ten eskiyi çıkarmayı unutma"\nfinally:\n    if os.path.exists("am_sehir_t2.py"):\n        os.remove("am_sehir_t2.py")\n',
      hints: ['sys.path bir listedir; insert(0, ".") en başa ekler.', 'sys.modules.pop(ad, None) yoksa hata vermez.', 'return importlib.import_module(ad)'],
      why: 'Dosya sys.path\'teki bir klasörde olunca bulunur; invalidate_caches yeni dosyayı görünür kılar. sys.modules\'ten çıkarmazsan import önbellekteki eski modülü döndürür.' },
    { t: 'code', stage: 'Rehberli', id: 'moduller-paketler-3', diff: 2,
      q: '<p>Anadolu Market kurye rotası: <code>rota_ozeti(noktalar)</code> fonksiyonunu yaz. <code>noktalar</code> km cinsinden <code>(x, y)</code> demetleri, ziyaret sırasıyla. Sözlük döndürsün: <code>"mesafe"</code>: ardışık noktalar arası kuş uçuşu mesafelerin toplamının <code>math.ceil</code> ile yukarı yuvarlanmışı; <code>"en_uzun"</code>: en uzun tek ayağın 2 ondalığa yuvarlanmışı (ayak yoksa 0); <code>"rota_sayisi"</code>: ilk nokta depo sabitken diğer noktaların kaç farklı sırayla gezilebileceği (<code>math.factorial</code>). Boş listede rota sayısı 1 kabul edilsin.</p>',
      guide: ['Ardışık çiftleri zip(noktalar, noktalar[1:]) ile al.', 'Her çift için math.hypot(x2 - x1, y2 - y1) hesapla ve listeye koy.', 'mesafe için math.ceil(sum(...)), en_uzun için round(max(...), 2); liste boşsa 0.', 'rota_sayisi = math.factorial(max(len(noktalar) - 1, 0)).'],
      example: 'import math\nkoliler = [1250, 400, 90]\nprint([math.ceil(k / 400) for k in koliler])\nprint(math.hypot(6, 8), math.factorial(4))\n',
      start: 'import math\n\ndef rota_ozeti(noktalar):\n    ayaklar = []\n    # TODO: ardışık noktalar için math.hypot ile ayak uzunlukları\n    # TODO: mesafe, en_uzun, rota_sayisi\n    return {}\n',
      sol: 'import math\n\ndef rota_ozeti(noktalar):\n    ayaklar = [math.hypot(x2 - x1, y2 - y1) for (x1, y1), (x2, y2) in zip(noktalar, noktalar[1:])]\n    return {\n        "mesafe": math.ceil(sum(ayaklar)),\n        "en_uzun": round(max(ayaklar), 2) if ayaklar else 0,\n        "rota_sayisi": math.factorial(max(len(noktalar) - 1, 0)),\n    }\n\nprint(rota_ozeti([(0, 0), (3, 4), (6, 8), (6, 9.5)]))\n',
      tests: 'r = rota_ozeti([(0, 0), (3, 4), (6, 8), (6, 9.5)])\nassert r["mesafe"] == 12, "5 + 5 + 1.5 = 11.5 km, yukarı yuvarlanınca 12"\nassert r["en_uzun"] == 5.0, "en uzun ayak 5.0 km"\nassert r["rota_sayisi"] == 6, "depo sabit, 3 nokta: 3! = 6 sıra"\nassert rota_ozeti([(1, 1)]) == {"mesafe": 0, "en_uzun": 0, "rota_sayisi": 1}, "tek noktada mesafe 0"\nassert rota_ozeti([]) == {"mesafe": 0, "en_uzun": 0, "rota_sayisi": 1}, "boş listede rota_sayisi 1"\nassert isinstance(rota_ozeti([(0, 0), (0, 0.2)])["mesafe"], int) and rota_ozeti([(0, 0), (0, 0.2)])["mesafe"] == 1, "ceil 0.2\'yi 1\'e yuvarlar ve int döndürür"\n',
      hints: ['math.hypot(dx, dy) = kök(dx² + dy²).', 'max boş listede hata verir; ayaklar boşsa 0 kullan.', 'math.factorial(0) == 1 olduğundan max(len - 1, 0) iki kenar durumu da çözer.'],
      why: 'hypot iki nokta arası mesafeyi, ceil "en az kaç km" sorusunu, factorial olası sıra sayısını verir. 10 teslimat noktasında 9! = 362 880 rota olması, rota optimizasyonunun neden zor olduğunu da gösterir.' },
    { t: 'code', stage: 'Rehberli', id: 'moduller-paketler-4', diff: 2,
      q: '<p>Kampanya çekilişi: <code>kampanya_kurasi(musteriler, kazanan_sayisi, tohum)</code> fonksiyonunu yaz. <code>random.seed(tohum)</code> ile başlatıp <code>random.sample</code> ile tekrarsız kazananları seçsin ve liste döndürsün. Orijinal liste değişmemeli. Kazanan sayısı müşteri sayısından fazlaysa <code>ValueError</code> fırlatılmalı (sample bunu kendisi yapar).</p>',
      guide: ['random modülünü içe aktar.', 'random.seed(tohum) ile üreteci sabitle.', 'random.sample(musteriler, kazanan_sayisi) döndür.'],
      example: 'import random\nrandom.seed(7)\nzarlar = [random.randint(1, 6) for _ in range(5)]\nrandom.seed(7)\nprint(zarlar == [random.randint(1, 6) for _ in range(5)])\nprint(random.choice(["kırmızı", "mavi"]))\n',
      start: 'import random\n\ndef kampanya_kurasi(musteriler, kazanan_sayisi, tohum):\n    # TODO: tohumu sabitle\n    # TODO: tekrarsız seçim yap ve döndür\n    pass\n',
      sol: 'import random\n\ndef kampanya_kurasi(musteriler, kazanan_sayisi, tohum):\n    random.seed(tohum)\n    return random.sample(musteriler, kazanan_sayisi)\n\nprint(kampanya_kurasi(["Ayşe", "Mehmet", "Zeynep", "Can", "Elif"], 2, 42))\n',
      tests: 'import random\nm = ["Ayşe", "Mehmet", "Zeynep", "Can", "Elif"]\nk1 = kampanya_kurasi(m, 3, 42)\nrandom.seed(42)\nbeklenen = random.sample(m, 3)\nassert k1 == beklenen, "tohum 42 ile random.sample sonucu dönmeli"\nassert kampanya_kurasi(m, 3, 42) == k1, "aynı tohum aynı kazananları vermeli"\nassert len(set(k1)) == 3, "kazananlar tekrarsız olmalı"\nassert m == ["Ayşe", "Mehmet", "Zeynep", "Can", "Elif"], "orijinal liste değişmemeli"\ntry:\n    kampanya_kurasi(m, 6, 1)\nexcept ValueError:\n    pass\nelse:\n    raise AssertionError("kazanan sayısı müşteri sayısından fazlaysa ValueError")\n',
      hints: ['seed tekrarlanabilirlik sağlar; denetim (audit) için çekilişin tohumunu kaydedersin.', 'shuffle listeyi değiştirir ve None döndürür; sample yeni liste verir.', 'return random.sample(musteriler, kazanan_sayisi)'],
      why: 'Aynı tohum aynı rastgele diziyi üretir; bu yüzden çekiliş tekrar yapılıp doğrulanabilir. sample tekrarsız seçer ve orijinal listeye dokunmaz. Gerçek ödüllü çekilişte tahmin edilemezlik için secrets modülü tercih edilir.' },
    { t: 'code', stage: 'Kendin yaz', id: 'moduller-paketler-5', diff: 2,
      q: '<p><code>genel_adlar(modul)</code> fonksiyonunu yaz: modül <code>__all__</code> tanımlıyorsa onun elemanlarını, tanımlamıyorsa <code>dir(modul)</code> içindeki alt çizgiyle başlamayan adları <b>sıralı liste</b> olarak döndürsün. Yani yıldızlı importun getireceği adları bulsun.</p>',
      start: 'def genel_adlar(modul):\n    pass\n',
      sol: 'def genel_adlar(modul):\n    if hasattr(modul, "__all__"):\n        return sorted(modul.__all__)\n    return sorted(ad for ad in dir(modul) if not ad.startswith("_"))\n\nimport math\nprint(genel_adlar(math)[:5])\n',
      tests: 'import types, math\na = types.ModuleType("am_a")\na.ORAN = 1\na._gizli = 2\na.hesapla = lambda: 0\nassert genel_adlar(a) == ["ORAN", "hesapla"], "__all__ yoksa alt çizgisiz adlar, sıralı"\nb = types.ModuleType("am_b")\nb.x = 1\nb.y = 2\nb.__all__ = ["y", "_ozel"]\nassert genel_adlar(b) == ["_ozel", "y"], "__all__ varsa YALNIZCA o liste (alt çizgili olsa bile)"\ng = genel_adlar(math)\nassert "sqrt" in g and "__name__" not in g, "math için sqrt gelmeli, __name__ gelmemeli"\nassert g == sorted(g), "sonuç sıralı olmalı"\n',
      hints: ['hasattr(modul, "__all__") ile kontrol et.', 'dir(modul) adları metin listesi olarak verir; startswith("_") ile ele.'],
      why: 'Yıldızlı import kuralı budur: __all__ varsa o liste kesin belirleyicidir (alt çizgili ad bile içerebilir), yoksa alt çizgisiz adlar gelir.' },
    { t: 'code', stage: 'Kendin yaz', id: 'moduller-paketler-6', diff: 2,
      q: '<p><code>surum_uygun_mu(gerekli, mevcut=None)</code> fonksiyonunu yaz. <code>gerekli</code> <code>"3.10"</code> ya da <code>"3.11.4"</code> gibi bir metin; <code>mevcut</code> <code>platform.python_version_tuple()</code> biçiminde metin demeti, <code>None</code> ise <code>platform.python_version_tuple()</code> kullanılsın. Mevcut sürüm gereken sürüme eşit ya da yeniyse <code>True</code> döndürsün. Yalnızca gerekli sürümün parça sayısı kadar parça karşılaştır ve sayısal karşılaştır.</p>',
      start: 'import platform\n\ndef surum_uygun_mu(gerekli, mevcut=None):\n    pass\n',
      sol: 'import platform\n\ndef surum_uygun_mu(gerekli, mevcut=None):\n    if mevcut is None:\n        mevcut = platform.python_version_tuple()\n    istenen = tuple(int(p) for p in gerekli.split("."))\n    elde = tuple(int(p) for p in mevcut[:len(istenen)])\n    return elde >= istenen\n\nprint(surum_uygun_mu("3.10"), surum_uygun_mu("3.10", ("3", "9", "18")))\n',
      tests: 'assert surum_uygun_mu("3.10", ("3", "9", "18")) is False, "3.9 < 3.10; metin karşılaştırması yanlış sonuç verir, int\'e çevir"\nassert surum_uygun_mu("3.10", ("3", "12", "1")) is True, "3.12 >= 3.10"\nassert surum_uygun_mu("3.10", ("3", "10", "0")) is True, "eşit sürüm uygun"\nassert surum_uygun_mu("3.11.4", ("3", "11", "2")) is False, "3.11.2 < 3.11.4"\nassert surum_uygun_mu("3.11.4", ("3", "11", "10")) is True, "3.11.10 > 3.11.4"\nassert surum_uygun_mu("3.8") is True, "varsayılan: çalışan Python 3.8\'den yeni"\nassert surum_uygun_mu("99") is False\n',
      hints: ['gerekli.split(".") parçaları verir; int\'e çevirip demet yap.', 'Demetler sırayla karşılaştırılır: (3, 12) >= (3, 10).', 'mevcut[:len(istenen)] ile aynı uzunlukta parça al.'],
      why: 'python_version_tuple metin döndürür; "9" > "10" tuzağından kaçmak için int demetine çevirmek gerekir. Demet karşılaştırması sürüm karşılaştırmanın en sade yoludur.' },
    { t: 'code', stage: 'Kendin yaz', id: 'moduller-paketler-7', diff: 2,
      q: '<p><code>modul_bilgisi(modul)</code> fonksiyonunu yaz ve sözlük döndürsün: <code>"ad"</code>: modülün <code>__name__</code> değeri; <code>"paket_mi"</code>: modül bir paketse (<code>__path__</code> özniteliği varsa) True; <code>"fonksiyonlar"</code>: alt çizgiyle başlamayan ve <b>fonksiyon</b> olan (<code>types.FunctionType</code> ya da <code>types.BuiltinFunctionType</code>) özniteliklerin sıralı ad listesi. Sınıflar, sabitler ve alt modüller listeye girmemeli.</p>',
      start: 'import types\n\ndef modul_bilgisi(modul):\n    pass\n',
      sol: 'import types\n\ndef modul_bilgisi(modul):\n    fonksiyonlar = sorted(\n        ad for ad in dir(modul)\n        if not ad.startswith("_")\n        and isinstance(getattr(modul, ad), (types.FunctionType, types.BuiltinFunctionType))\n    )\n    return {"ad": modul.__name__, "paket_mi": hasattr(modul, "__path__"), "fonksiyonlar": fonksiyonlar}\n\nimport json\nprint(modul_bilgisi(json))\n',
      tests: 'import types, json, json.decoder, math\nm = types.ModuleType("am_hesap")\nexec("import os\\nKDV = 0.2\\nclass Sepet:\\n    pass\\ndef toplam(x):\\n    return sum(x)\\ndef _yardimci():\\n    pass\\nuzunluk = len\\n", m.__dict__)\nb = modul_bilgisi(m)\nassert b["ad"] == "am_hesap", "ad __name__ olmalı"\nassert b["paket_mi"] is False, "ModuleType ile oluşturulan modül paket değil"\nassert b["fonksiyonlar"] == ["toplam", "uzunluk"], "yalnızca fonksiyonlar: sınıf (Sepet), sabit (KDV), alt modül (os) ve _yardimci hariç; len yerleşik fonksiyondur"\nassert modul_bilgisi(json)["paket_mi"] is True, "json bir pakettir (__path__ var)"\nassert modul_bilgisi(json.decoder)["paket_mi"] is False, "json.decoder paket değil, modüldür"\nassert "sqrt" in modul_bilgisi(math)["fonksiyonlar"]\n',
      hints: ['getattr(modul, ad) ile özniteliği al, isinstance ile türünü sına.', 'isinstance ikinci argümanda tür demeti alabilir.', 'Paketlerde __path__ vardır; düz modüllerde yoktur.'],
      why: 'Paket, alt modül aramak için __path__ taşıyan modüldür. dir + getattr + isinstance üçlüsü, inspect modülünün yaptığı işin sade hâlidir.' },
    { t: 'code', stage: 'Kendin yaz', id: 'moduller-paketler-8', diff: 2,
      q: '<p><code>paket_olustur(ad, moduller)</code> fonksiyonunu yaz. <code>moduller</code> sözlüğü <code>{modul_adi: kaynak}</code> biçiminde. Geçerli klasörde <code>ad</code> klasörünü oluştursun; içine her modülü <code>modul_adi.py</code> olarak yazsın; <code>__init__.py</code> dosyasına <code>__all__ = [...]</code> satırını (modül adları, alfabetik) yazsın. Sonra <code>"."</code> klasörünü <code>sys.path</code>\'e ekleyip (yoksa), önbelleği temizleyip paketi <code>importlib.import_module(ad)</code> ile döndürsün.</p>',
      start: 'import os, sys, importlib\n\ndef paket_olustur(ad, moduller):\n    pass\n',
      sol: 'import os, sys, importlib\n\ndef paket_olustur(ad, moduller):\n    os.makedirs(ad, exist_ok=True)\n    for modul_adi, kaynak in moduller.items():\n        with open(os.path.join(ad, modul_adi + ".py"), "w", encoding="utf-8") as f:\n            f.write(kaynak)\n    with open(os.path.join(ad, "__init__.py"), "w", encoding="utf-8") as f:\n        f.write(f"__all__ = {sorted(moduller)!r}\\n")\n    if "." not in sys.path:\n        sys.path.insert(0, ".")\n    importlib.invalidate_caches()\n    return importlib.import_module(ad)\n\nimport shutil\np = paket_olustur("am_paket_ornek", {"fiyat": "def kdv(t):\\n    return round(t * 1.2, 2)\\n"})\nprint(p.__all__)\nshutil.rmtree("am_paket_ornek")\n',
      tests: 'import shutil, sys, importlib\ntry:\n    p = paket_olustur("am_paket_t8", {"rapor": "from .fiyat import kdv\\ndef satir(ad, t):\\n    return f\'{ad}: {kdv(t)}\'\\n", "fiyat": "def kdv(t):\\n    return round(t * 1.2, 2)\\n"})\n    assert p is not None and hasattr(p, "__path__"), "paket döndürülmeli (klasör + __init__.py)"\n    assert p.__all__ == ["fiyat", "rapor"], "__init__.py içinde alfabetik __all__ olmalı"\n    r = importlib.import_module("am_paket_t8.rapor")\n    assert r.satir("Çay", 50) == "Çay: 60.0", "rapor modülü göreli import ile fiyat\'ı kullanabilmeli"\n    ns = {}\n    exec("from am_paket_t8 import *", ns)\n    assert "fiyat" in ns and "rapor" in ns, "__all__ içindeki alt modüller yıldızlı importla gelmeli"\nfinally:\n    shutil.rmtree("am_paket_t8", ignore_errors=True)\n    for k in [k for k in sys.modules if k.startswith("am_paket_t8")]:\n        del sys.modules[k]\n',
      hints: ['os.makedirs(ad, exist_ok=True) klasörü oluşturur.', 'os.path.join(ad, modul_adi + ".py") dosya yolunu verir.', '__init__.py içeriği: f"__all__ = {sorted(moduller)!r}\\n"'],
      why: 'Klasör + __init__.py = paket. __all__ içinde alt modül adları olunca yıldızlı import o alt modülleri de yükler. Göreli import (from .fiyat) paket içindeki kardeş modülü bulur.' },
    { t: 'code', stage: 'Hata avı', kind: 'bug', id: 'moduller-paketler-9', diff: 2,
      q: '<p><b>Hatayı bul ve düzelt.</b> Analist, fiyat esnekliği 1.4 olan bir ürün için yüzde 10 zamda talebin yüzde 14 düşeceğini hesaplamak istiyor. Ama <code>talep_degisimi(10)</code> 27.18 döndürüyor. Hatayı bul; yıldızlı import kullanmadan düzelt.</p>',
      start: 'e = 1.4   # fiyat esnekliği\nfrom math import *\n\ndef talep_degisimi(fiyat_artis_yuzde):\n    return round(e * fiyat_artis_yuzde, 2)\n\nprint(talep_degisimi(10))\nprint(round(sqrt(2), 3))\n',
      sol: 'import math\n\ne = 1.4   # fiyat esnekliği\n\ndef talep_degisimi(fiyat_artis_yuzde):\n    return round(e * fiyat_artis_yuzde, 2)\n\nprint(talep_degisimi(10))\nprint(round(math.sqrt(2), 3))\n',
      tests: 'assert talep_degisimi(10) == 14.0, "1.4 * 10 = 14.0 olmalı; 27.18 görüyorsan e adını math.e ezmiş"\nassert e == 1.4, "e değişkeni esneklik (1.4) olarak kalmalı"\nassert "import *" not in __kod__, "yıldızlı import kullanma; import math yaz"\n',
      hints: ['from math import * math modülündeki e (Euler sayısı) adını da getirir.', 'Senin e = 1.4 tanımın importtan önce olduğu için ezildi.', 'import math yaz, sqrt yerine math.sqrt kullan.'],
      why: 'Yıldızlı import, modüldeki tüm alt çizgisiz adları ad alanına döker ve aynı adlı değişkenlerini sessizce ezer. import math ile adlar math. önekiyle ayrı tutulur.' },
    { t: 'code', stage: 'Hata avı', kind: 'bug', id: 'moduller-paketler-10', diff: 2,
      q: '<p><b>Hatayı bul ve düzelt.</b> Ilgaz Bank\'ın <code>am_bankapkt</code> paketinde <code>kredi.py</code>, kardeş modül <code>faiz.py</code>\'yi kullanıyor. Paket kuruluyor ama <code>from am_bankapkt import kredi</code> satırı <code>ModuleNotFoundError: No module named \'faiz\'</code> veriyor. <code>paketi_kur()</code> içindeki hatayı düzelt.</p>',
      start: 'import os, sys, importlib\n\ndef paketi_kur():\n    os.makedirs("am_bankapkt", exist_ok=True)\n    with open("am_bankapkt/__init__.py", "w", encoding="utf-8") as f:\n        f.write("")\n    with open("am_bankapkt/faiz.py", "w", encoding="utf-8") as f:\n        f.write("def basit(ana, oran, yil):\\n    return round(ana * oran * yil, 2)\\n")\n    with open("am_bankapkt/kredi.py", "w", encoding="utf-8") as f:\n        f.write("from faiz import basit\\n\\ndef toplam_geri_odeme(ana, oran, yil):\\n    return ana + basit(ana, oran, yil)\\n")\n    if "." not in sys.path:\n        sys.path.insert(0, ".")\n    importlib.invalidate_caches()\n\npaketi_kur()\nfor ad in [a for a in sys.modules if a.startswith("am_bankapkt")]:\n    del sys.modules[ad]\nfrom am_bankapkt import kredi\nprint(kredi.toplam_geri_odeme(10000, 0.3, 2))\n',
      sol: 'import os, sys, importlib\n\ndef paketi_kur():\n    os.makedirs("am_bankapkt", exist_ok=True)\n    with open("am_bankapkt/__init__.py", "w", encoding="utf-8") as f:\n        f.write("")\n    with open("am_bankapkt/faiz.py", "w", encoding="utf-8") as f:\n        f.write("def basit(ana, oran, yil):\\n    return round(ana * oran * yil, 2)\\n")\n    with open("am_bankapkt/kredi.py", "w", encoding="utf-8") as f:\n        f.write("from .faiz import basit\\n\\ndef toplam_geri_odeme(ana, oran, yil):\\n    return ana + basit(ana, oran, yil)\\n")\n    if "." not in sys.path:\n        sys.path.insert(0, ".")\n    importlib.invalidate_caches()\n\npaketi_kur()\nfor ad in [a for a in sys.modules if a.startswith("am_bankapkt")]:\n    del sys.modules[ad]\nfrom am_bankapkt import kredi\nprint(kredi.toplam_geri_odeme(10000, 0.3, 2))\n',
      tests: 'import shutil\ntry:\n    from am_bankapkt import kredi as _k\n    assert _k.toplam_geri_odeme(10000, 0.3, 2) == 16000.0, "10000 + 10000*0.3*2 = 16000"\n    with open("am_bankapkt/kredi.py", encoding="utf-8") as f:\n        icerik = f.read()\n    assert "from .faiz import" in icerik or "from am_bankapkt.faiz import" in icerik, "kardeş modül göreli (from .faiz) ya da tam yolla (from am_bankapkt.faiz) import edilmeli"\nfinally:\n    shutil.rmtree("am_bankapkt", ignore_errors=True)\n',
      hints: ['Paket içindeki bir modülde "from faiz import" mutlak importtur: sys.path\'te faiz.py arar.', 'faiz.py sys.path\'te değil, am_bankapkt klasörünün içinde.', 'Göreli import: from .faiz import basit'],
      why: 'Python 3\'te importlar varsayılan olarak mutlaktır; paket içindeki kardeş modül ya göreli (from .faiz) ya da paket adıyla (from am_bankapkt.faiz) içe aktarılmalı. Göreli biçim, paket adı değişse de çalışır.' },
    { t: 'code', stage: 'Meydan okuma', id: 'moduller-paketler-11', diff: 3,
      q: '<p>Canlı ayar yükleyici: <code>ayar_yukle(ad, oran)</code> fonksiyonunu yaz. Geçerli klasöre <code>ad + ".py"</code> dosyasını <code>ORAN = &lt;oran&gt;</code> satırıyla yazsın ve modülü döndürsün. Modül daha önce yüklendiyse <b>aynı modül nesnesini</b> <code>importlib.reload</code> ile güncellesin; yüklenmediyse import etsin. Dikkat: test, dosyayı aynı saniyede aynı uzunlukta yeniden yazar (<code>0.1</code> → <code>0.2</code>); bayat <code>.pyc</code> sorununu çöz.</p>',
      start: 'import sys, importlib\n\ndef ayar_yukle(ad, oran):\n    pass\n',
      sol: 'import sys, os, importlib, importlib.util\n\ndef ayar_yukle(ad, oran):\n    yol = f"{ad}.py"\n    with open(yol, "w", encoding="utf-8") as f:\n        f.write(f"ORAN = {oran!r}\\n")\n    pyc = importlib.util.cache_from_source(yol)\n    if os.path.exists(pyc):\n        os.remove(pyc)\n    if "." not in sys.path:\n        sys.path.insert(0, ".")\n    importlib.invalidate_caches()\n    if ad in sys.modules:\n        return importlib.reload(sys.modules[ad])\n    return importlib.import_module(ad)\n\nm = ayar_yukle("am_ayar_ornek", 0.1)\nprint(m.ORAN, ayar_yukle("am_ayar_ornek", 0.2).ORAN)\nos.remove("am_ayar_ornek.py")\n',
      tests: 'import os, sys\nad = "am_ayar_t11"\nsys.modules.pop(ad, None)\ntry:\n    m1 = ayar_yukle(ad, 0.1)\n    assert m1 is not None and m1.ORAN == 0.1, "ilk yükleme ORAN = 0.1 vermeli"\n    m2 = ayar_yukle(ad, 0.2)\n    assert m2.ORAN == 0.2, "yeniden yazılan dosya okunmalı; 0.1 görüyorsan import önbelleği ya da bayat .pyc"\n    assert m2 is m1, "reload aynı modül nesnesini güncellemeli (yeni nesne değil)"\n    assert ayar_yukle(ad, 0.3).ORAN == 0.3 and m1.ORAN == 0.3, "eski referans da güncel değeri görmeli"\nfinally:\n    if os.path.exists(ad + ".py"):\n        os.remove(ad + ".py")\n',
      hints: ['sys.modules\'te varsa importlib.reload(sys.modules[ad]), yoksa importlib.import_module(ad).', 'Python .pyc\'nin geçerliliğini kaynağın değiştirme zamanı (saniye) ve boyutuyla denetler.', 'importlib.util.cache_from_source(yol) bayat .pyc\'nin yolunu verir; varsa os.remove ile sil (ya da sys.dont_write_bytecode = True).'],
      why: 'reload modül kodunu aynı nesnede yeniden çalıştırır; bu yüzden m1 ve m2 aynı nesnedir. .pyc doğrulaması saniye hassasiyetinde zaman + boyut kullandığından hızlı yeniden yazımda eski bayt kodu çalışabilir; önbellek dosyasını silmek bunu önler.' },
    { t: 'code', stage: 'Meydan okuma', id: 'moduller-paketler-12', diff: 3,
      q: '<p>Döngüsel import dedektörü: <code>yukleme_sirasi(moduller)</code> fonksiyonunu yaz. <code>moduller</code> sözlüğü <code>{ad: [import_ettigi_adlar]}</code>. Sözlükte olmayan adlar (ör. <code>"json"</code>) dış kütüphanedir, yok sayılır. Her modül bağımlılıklarından sonra gelecek şekilde bir yükleme sırası döndür: modülleri <b>alfabetik</b> sırayla gez, her modülden önce bağımlılıklarını (yine alfabetik sırayla) yükle. Döngü varsa <code>ImportError</code> fırlat; mesaj döngüyü <code>"a -&gt; b -&gt; a"</code> biçiminde içersin.</p>',
      start: 'def yukleme_sirasi(moduller):\n    pass\n',
      sol: 'def yukleme_sirasi(moduller):\n    sira = []\n    bitti = set()\n    yol = []\n\n    def ziyaret(ad):\n        if ad in bitti:\n            return\n        if ad in yol:\n            dongu = yol[yol.index(ad):] + [ad]\n            raise ImportError("döngüsel import: " + " -> ".join(dongu))\n        yol.append(ad)\n        for bagimlilik in sorted(moduller[ad]):\n            if bagimlilik in moduller:\n                ziyaret(bagimlilik)\n        yol.pop()\n        bitti.add(ad)\n        sira.append(ad)\n\n    for ad in sorted(moduller):\n        ziyaret(ad)\n    return sira\n\nprint(yukleme_sirasi({"rapor": ["fiyat", "veri"], "fiyat": ["ayar"], "veri": ["ayar", "json"], "ayar": [], "main": ["rapor"]}))\n',
      tests: 'g = {"rapor": ["fiyat", "veri"], "fiyat": ["ayar"], "veri": ["ayar", "json"], "ayar": [], "main": ["rapor"]}\nassert yukleme_sirasi(g) == ["ayar", "fiyat", "veri", "rapor", "main"], "bağımlılıklar önce, alfabetik gezinti"\nassert yukleme_sirasi({}) == [], "boş proje boş sıra"\nassert yukleme_sirasi({"b": [], "a": []}) == ["a", "b"], "bağımsız modüller alfabetik"\ntry:\n    yukleme_sirasi({"a": ["b"], "b": ["c"], "c": ["a"]})\nexcept ImportError as h:\n    assert "a -> b -> c -> a" in str(h), f"mesaj döngüyü göstermeli, gelen: {h}"\nelse:\n    raise AssertionError("döngü varsa ImportError fırlatılmalı")\ntry:\n    yukleme_sirasi({"siparis": ["musteri"], "musteri": ["siparis"], "ayar": []})\nexcept ImportError as h:\n    assert "musteri -> siparis -> musteri" in str(h), f"gelen: {h}"\nelse:\n    raise AssertionError("iki modüllü döngü de yakalanmalı")\ntry:\n    yukleme_sirasi({"a": ["a"]})\nexcept ImportError:\n    pass\nelse:\n    raise AssertionError("modül kendini import ediyorsa da döngüdür")\n',
      hints: ['Derinlik öncelikli arama (DFS): modülü, tüm bağımlılıkları bittikten sonra sıraya ekle.', 'İki küme tut: tamamen bitenler ve şu anki yol (ziyaret ediliyor). Yoldaki bir modüle yeniden gelirsen döngü vardır.', 'Döngü metni: yol[yol.index(ad):] + [ad] listesini " -> " ile birleştir.'],
      why: 'Bu, topolojik sıralamadır; Python\'ın import mekanizması da benzer biçimde bağımlılıkları önce yükler. Ziyaret edilmekte olan bir modüle geri dönmek, gerçek hayattaki "partially initialized module" hatasının sebebidir.' },
    { t: 'code', stage: 'Mini proje', id: 'moduller-paketler-13', diff: 3,
      q: '<p>Anadolu Market eklenti sistemi. İki fonksiyon yaz:</p><ul><li><code>eklentileri_yukle(kaynaklar)</code>: <code>{ad: kaynak}</code> sözlüğündeki her eklenti için (adlar alfabetik) <code>types.ModuleType("eklenti_" + ad)</code> oluşturup kaynağı içinde çalıştırsın. Çalıştırırken hata olursa <code>hatalar[ad] = hata sınıfının adı</code>; çağrılabilir bir <code>calistir</code> yoksa <code>hatalar[ad] = "calistir yok"</code> yazıp geçsin. Başarılı modülleri <code>sys.modules</code>\'e kaydetsin ve <code>(ONCELIK, ad)</code> değerine göre sıralasın (<code>ONCELIK</code> yoksa 100). <code>(moduller, hatalar)</code> demeti döndürsün.</li><li><code>zincir_uygula(moduller, tutar)</code>: tutarı sırayla her modülün <code>calistir</code> fonksiyonundan geçirip 2 ondalığa yuvarlasın.</li></ul>',
      start: 'import sys, types\n\ndef eklentileri_yukle(kaynaklar):\n    pass\n\ndef zincir_uygula(moduller, tutar):\n    pass\n',
      sol: 'import sys, types\n\ndef eklentileri_yukle(kaynaklar):\n    moduller, hatalar = [], {}\n    for ad in sorted(kaynaklar):\n        modul = types.ModuleType("eklenti_" + ad)\n        try:\n            exec(kaynaklar[ad], modul.__dict__)\n        except Exception as h:\n            hatalar[ad] = type(h).__name__\n            continue\n        if not callable(getattr(modul, "calistir", None)):\n            hatalar[ad] = "calistir yok"\n            continue\n        sys.modules[modul.__name__] = modul\n        moduller.append(modul)\n    moduller.sort(key=lambda m: (getattr(m, "ONCELIK", 100), m.__name__))\n    return moduller, hatalar\n\ndef zincir_uygula(moduller, tutar):\n    for m in moduller:\n        tutar = m.calistir(tutar)\n    return round(tutar, 2)\n\nms, hs = eklentileri_yukle({"kdv": "ONCELIK = 90\\ndef calistir(t):\\n    return t * 1.2\\n", "indirim": "ONCELIK = 10\\ndef calistir(t):\\n    return t - 50\\n"})\nprint([m.__name__ for m in ms], zincir_uygula(ms, 1000), hs)\n',
      tests: 'import sys\nk = {\n    "kdv": "ONCELIK = 90\\ndef calistir(t):\\n    return t * 1.2\\n",\n    "indirim": "ONCELIK = 10\\ndef calistir(t):\\n    return t - 50\\n",\n    "bozuk": "def calistir(t)\\n    return t\\n",\n    "bos": "X = 1\\n",\n    "patlayan": "1 / 0\\n",\n    "yuvarla": "def calistir(t):\\n    return int(t)\\n",\n}\nms, hs = eklentileri_yukle(k)\nassert [m.__name__ for m in ms] == ["eklenti_indirim", "eklenti_kdv", "eklenti_yuvarla"], "ONCELIK sırası: indirim (10), kdv (90), yuvarla (varsayılan 100)"\nassert hs == {"bozuk": "SyntaxError", "bos": "calistir yok", "patlayan": "ZeroDivisionError"}, f"hatalar sözlüğü yanlış: {hs}"\nassert sys.modules.get("eklenti_kdv") is ms[1], "başarılı eklentiler sys.modules\'e kaydedilmeli"\nassert "eklenti_bos" not in sys.modules, "başarısız eklenti kaydedilmemeli"\nassert zincir_uygula(ms, 1000) == 1140, "(1000 - 50) * 1.2 = 1140, int ile 1140"\nassert zincir_uygula([], 99.999) == 100.0, "boş zincir yalnızca yuvarlar"\nms2, hs2 = eklentileri_yukle({"b": "def calistir(t):\\n    return t\\n", "a": "def calistir(t):\\n    return t\\n"})\nassert [m.__name__ for m in ms2] == ["eklenti_a", "eklenti_b"], "eşit öncelikte ada göre sırala"\n',
      hints: ['exec bir SyntaxError da fırlatabilir; except Exception hepsini yakalar, type(h).__name__ adını verir.', 'getattr(modul, "calistir", None) yoksa None döndürür; callable(None) False.', 'sort(key=lambda m: (getattr(m, "ONCELIK", 100), m.__name__))'],
      why: 'Gerçek eklenti sistemleri (pytest eklentileri, Django uygulamaları) aynı fikre dayanır: modülü adıyla yükle, beklenen arayüzü (calistir) denetle, hatalıyı sistemi çökertmeden kenara ayır, önceliğe göre sırala.' }
  ],
  faq: [
    { q: 'Modül, paket ve kütüphane arasındaki fark ne?', a: 'Modül tek bir .py dosyasıdır. Paket, __init__.py içeren ve modülleri toplayan klasördür. Kütüphane resmi bir terim değildir; genelde pip ile kurulan bir ya da daha fazla paketin genel adıdır (pandas bir kütüphanedir, içinde onlarca paket vardır).' },
    { q: '__pycache__ klasörünü silebilir miyim?', a: 'Evet, zararı yoktur; Python bir sonraki importta yeniden üretir. Depoya koyma: .gitignore dosyana __pycache__/ ve *.pyc ekle. Python\'ın hiç .pyc yazmamasını istersen PYTHONDONTWRITEBYTECODE=1 ortam değişkenini ya da sys.dont_write_bytecode = True kullanabilirsin.' },
    { q: 'sys.path.append ile her yerde modül bulmak iyi bir fikir mi?', a: 'Hızlı denemede işe yarar ama kalıcı çözüm değildir; kod başka makinede çalışmaz hâle gelir. Doğru yol, projeyi paket yapıp sanal ortamda pip install -e . ile kurmak ya da kök klasörden python -m paket.modul ile çalıştırmaktır.' },
    { q: 'Göreli import mu mutlak import mu kullanmalıyım?', a: 'PEP 8 mutlak importu önerir çünkü okunur ve açıktır. Paket içinde kardeş modüller için kısa göreli import (from . import fiyat) da kabul görür. Tutarlı ol; en sık hata, doğrudan çalıştırılan bir betikte göreli import kullanmaktır.' },
    { q: 'help() ile __doc__ arasındaki fark ne?', a: '__doc__ yalnızca docstring metnini verir. help() ise imza, docstring, metotlar ve alt modüller dahil biçimlendirilmiş tam bir belge sayfası yazdırır. Kodda metin olarak kullanacaksan __doc__, keşfederken help.' }
  ],
  mistakes: [
    { bad: '# proje klasöründe random.py adında dosyan var\nimport random\nrandom.randint(1, 6)', good: '# dosyanın adını kurallar.py gibi özgün bir ad yap\nimport random\nrandom.randint(1, 6)', why: 'Betiğin klasörü sys.path\'te önce aranır; standart modülle aynı adlı dosyan onu gölgeler ve "has no attribute" hatası alırsın.' },
    { bad: 'from ayar import ORAN\nimportlib.reload(ayar)\nprint(ORAN)', good: 'import ayar\nimportlib.reload(ayar)\nprint(ayar.ORAN)', why: 'reload modül nesnesini günceller; from-import ile kopyalanan ad eski değeri göstermeye devam eder.' },
    { bad: '# am_anadolu/rapor/ozet.py içinde\nfrom fiyat import kdv_ekle', good: '# am_anadolu/rapor/ozet.py içinde\nfrom ..fiyat import kdv_ekle', why: 'Paket içinde düz "from fiyat" mutlak importtur ve sys.path\'te fiyat.py arar; kardeş ya da üst paketteki modül için göreli import gerekir.' },
    { bad: 'surum = platform.python_version_tuple()\nif surum >= ("3", "10"):\n    ...', good: 'surum = platform.python_version_tuple()\nif tuple(map(int, surum[:2])) >= (3, 10):\n    ...', why: 'python_version_tuple metin döndürür; "9" > "10" olduğu için 3.9 yanlışlıkla uygun görünür.' },
    { bad: 'kopya = random.shuffle(liste)', good: 'random.shuffle(liste)        # yerinde\nkopya = random.sample(liste, len(liste))', why: 'shuffle listeyi yerinde karıştırır ve None döndürür; karışık yeni liste için sample kullan.' }
  ]
});
})(window);
