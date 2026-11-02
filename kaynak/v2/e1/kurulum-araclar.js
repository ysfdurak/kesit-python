/* Kesit Python — 'kurulum-araclar' dersi uzantısı (Derinleş + ek alıştırmalar) */
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
  {
    id: 'kurulum-araclar',
    min: 25,
    html: `<p>Bu ders artık kurulum dizisinin genel bakış dersi. Adım adım kurulum için <b>Windows</b> ve <b>macOS / Linux</b> derslerine, editör için <b>VS Code</b>, defter ortamı için <b>Jupyter ve Colab</b> derslerine bak. Burada hangi işletim sisteminde olursan ol geçerli kararları ve araçları ele alıyoruz: hangi sürüm, hangi Python, REPL'den nasıl daha çok verim alınır, <code>python -m</code> neden bu kadar önemli ve pip ile ilk paket nasıl kurulur.</p><h2>Sürüm seçimi ve Python'ın sürüm döngüsü</h2><p>Python sürümleri <code>3.12.4</code> gibi üç parçalıdır: <b>3</b> ana sürüm (major), <b>12</b> özellik sürümü (minor), <b>4</b> düzeltme sürümü (micro / patch). Önemli olan ortadaki sayıdır; yeni söz dizimi ve modüller orada gelir. Sondaki sayı yalnızca hata ve güvenlik düzeltmesi içerir, bu yüzden 3.12.3'ten 3.12.4'e geçmek her zaman güvenlidir.</p><p>PEP 602 ile Python yıllık bir takvime geçti: her yıl Ekim ayında yeni bir 3.x çıkar (3.12 → 2023, 3.13 → 2024, 3.14 → 2025). Her sürüm yaklaşık 2 yıl tam destek (hata düzeltmeleri) alır, ardından yalnızca güvenlik düzeltmeleriyle toplam 5 yıl yaşar. Örneğin 3.9 Ekim 2025'te, 3.10 Ekim 2026'da destek dışı kaldı. Destek dışı bir sürüm çalışmaya devam eder ama artık güvenlik açıkları kapatılmaz; kurum sunucularında bu kabul edilmez.</p><div class="tbl-wrap"><table><tr><th>Aşama</th><th>Süre</th><th>Ne gelir?</th><th>Ne zaman kullanılır?</th></tr><tr><td>alpha / beta / rc</td><td>Yayın öncesi ~1 yıl</td><td>Deneme sürümleri, özellikler değişebilir</td><td>Yalnız kütüphane yazarları test için</td></tr><tr><td>Tam destek (bugfix)</td><td>İlk ~2 yıl</td><td>Hata ve güvenlik düzeltmeleri, düzenli 3.x.y sürümleri</td><td>Yeni projeler için ideal</td></tr><tr><td>Güvenlik desteği</td><td>Sonraki ~3 yıl</td><td>Yalnız güvenlik yamaları, çoğunlukla kaynak kodu olarak</td><td>Mevcut projeler; göç planı yap</td></tr><tr><td>Destek dışı (EOL)</td><td>5 yıldan sonra</td><td>Hiçbir şey</td><td>Kullanma; acilen yükselt</td></tr></table></div><div class="tip"><b>Hangi sürümü kurmalıyım?</b>Pratik kural: <b>en yeni sürümün bir öncesi</b>. Yeni çıkmış bir sürümde pandas, numpy gibi paketlerin hazır derlenmiş dosyaları (wheel) birkaç ay gecikebilir. Ekibin bir sürüm kullanıyorsa onunla aynısını kur; bu uygulama tarayıcıda Python 3.12 kullanır ve öğrendiğin her şey 3.10 ve üstünde çalışır.</div><h2>CPython, PyPy ve diğerleri</h2><p>"Python" aslında bir dil tanımıdır; onu çalıştıran programa uygulama (implementation) denir. python.org'dan indirdiğin sürüm <b>CPython</b>'dır: C ile yazılmış, referans kabul edilen uygulama. Bu uygulamadaki tarayıcı motoru Pyodide da WebAssembly'ye derlenmiş CPython'dır. Kendin kontrol et:</p><pre class="py">import sys
import platform
print("Uygulama:", platform.python_implementation())
print("İç adı:", sys.implementation.name)
print("Sürüm:", platform.python_version())
print("Sürüm demeti:", sys.version_info[:3])
print("En az 3.10 mu?", sys.version_info &gt;= (3, 10))</pre><div class="tbl-wrap"><table><tr><th>Uygulama</th><th>Nedir?</th><th>Ne zaman?</th></tr><tr><td>CPython</td><td>Referans uygulama, C ile yazılmış</td><td>Varsayılan; hemen her iş</td></tr><tr><td>PyPy</td><td>JIT derleyicili uygulama</td><td>Uzun çalışan saf Python döngüleri; C eklentili paketlerde uyumluluk sınırlı olabilir</td></tr><tr><td>MicroPython</td><td>Mikrodenetleyiciler için küçük Python</td><td>Sensör, ESP32, Raspberry Pi Pico</td></tr><tr><td>Pyodide</td><td>Tarayıcıda çalışan CPython</td><td>Bu uygulama, JupyterLite</td></tr></table></div><p>CPython'ın son sürümlerinde iki deneysel yenilik var: GIL'siz (free-threaded) derleme ve bir JIT derleyici. İkisi de varsayılan olarak kapalıdır; Eşzamanlılık ve Performans derslerinde konuşacağız.</p><h2>REPL'i iyi kullanmak</h2><p>Terminalde <code>python</code> (macOS/Linux'ta <code>python3</code>, Windows'ta <code>py</code> da olur) yazınca açılan REPL, en hızlı deneme alanındır. Birkaç numara verimini katlar:</p><pre class="code">&gt;&gt;&gt; 1499.9 * 3
4499.700000000001
&gt;&gt;&gt; round(_, 2)          # _ son sonucu tutar (yalnız REPL'de)
4499.7
&gt;&gt;&gt; help(round)          # belgeyi gösterir; q ile çık
&gt;&gt;&gt; dir("metin")         # bir nesnenin metotlarını listeler
&gt;&gt;&gt; import math; math.sqrt(144)
12.0
&gt;&gt;&gt; exit()</pre><ul><li><b><code>_</code> değişkeni:</b> REPL'de son ifadenin sonucunu tutar. Betikte bu özellik yoktur.</li><li><b><code>help()</code> ve <code>dir()</code>:</b> İnternete çıkmadan belge okumanın yolu. <code>help(str.split)</code> bir metodun ne yaptığını anlatır.</li><li><b>Yukarı ok:</b> Önceki satırları geri getirir. Python 3.13 ile gelen yeni REPL renkli istem, çok satırlı düzenleme, F1 (yardım), F2 (geçmiş) ve F3 (yapıştırma kipi) sunar; <code>exit</code> parantezsiz de çalışır.</li><li><b><code>python -i rapor.py</code>:</b> Betiği çalıştırır ve bittiğinde REPL'e düşer; betikteki değişkenleri inceleyebilirsin. Hata ayıklamanın en basit biçimidir.</li></ul><p><code>help</code> ve <code>dir</code> burada da çalışır; çıktıyı kısaltmak için yalnız ilk elemanları alıyoruz:</p><pre class="py">yontemler = dir("Anadolu")
print(len(yontemler) &gt; 30)
print([y for y in yontemler if y.startswith("s")])
help(len)</pre><h2><code>python -m</code>: modülü program gibi çalıştırmak</h2><p><code>-m</code> bayrağı "şu modülü, <b>bu</b> Python'la çalıştır" demektir. Makinede birden fazla Python olduğunda doğru olanı kullandığından emin olmanın en güvenli yolu budur.</p><div class="tbl-wrap"><table><tr><th>Komut</th><th>Ne yapar?</th></tr><tr><td><code>python -V</code> / <code>-VV</code></td><td>Sürümü gösterir (-VV derleme ayrıntısıyla)</td></tr><tr><td><code>python -c "print(2**10)"</code></td><td>Tek satırlık kodu dosya yazmadan çalıştırır</td></tr><tr><td><code>python -m pip install pandas</code></td><td>Bu Python'ın pip'iyle paket kurar</td></tr><tr><td><code>python -m venv .venv</code></td><td>Projeye özel sanal ortam oluşturur</td></tr><tr><td><code>python -m http.server 8000</code></td><td>Klasörü yerel bir web sunucusuyla paylaşır</td></tr><tr><td><code>python -m json.tool veri.json</code></td><td>JSON dosyasını okunur biçimde yazdırır ve doğrular</td></tr><tr><td><code>python -m timeit "sum(range(1000))"</code></td><td>Küçük bir ifadenin süresini ölçer</td></tr><tr><td><code>python -m site</code></td><td>Paketlerin hangi klasörlere kurulduğunu gösterir</td></tr></table></div><p>Kendi betiğin de bir modüldür. Doğrudan çalıştırıldığında özel değişken <code>__name__</code>, <code>"__main__"</code> değerini alır; içe aktarıldığında ise modülün adını. İleride <code>if __name__ == "__main__":</code> kalıbını bu yüzden göreceksin.</p><pre class="py">print("Bu kod şu adla çalışıyor:", __name__)
import json
print("json modülünün adı:", json.__name__)</pre><h2>pip ile ilk adımlar</h2><p>pip, PyPI'daki paketleri kuran resmî araçtır. Komutları her zaman <code>python -m pip</code> biçiminde yaz ve mümkünse bir sanal ortamın içinde çalıştır (Orta seviyedeki Sanal ortam ve pip dersi bunu derinleştirir).</p><pre class="code">python -m pip --version                 # hangi Python'a bağlı? yol yazar
python -m pip install requests          # en yeni sürüm
python -m pip install "pandas==2.2.3"   # tam sürüm (tırnak kabuk için)
python -m pip install --upgrade pip     # pip'in kendisini güncelle
python -m pip list                      # kurulu paketler
python -m pip show pandas               # sürüm, bağımlılıklar, konum
python -m pip freeze &gt; requirements.txt # ortamı dosyaya dök
python -m pip install -r requirements.txt
python -m pip uninstall requests</pre><div class="tbl-wrap"><table><tr><th>Belirti</th><th>Neden</th><th>Çözüm</th></tr><tr><td><code>pip: command not found</code> / tanınmıyor</td><td>Scripts klasörü PATH'te değil</td><td><code>python -m pip</code> kullan</td></tr><tr><td>Kurdum ama <code>ModuleNotFoundError</code></td><td>Paket başka bir Python'a kuruldu</td><td><code>python -m pip --version</code> ile yolu karşılaştır; editörde aynı yorumlayıcıyı seç</td></tr><tr><td><code>externally-managed-environment</code></td><td>Sistem Python'ı korunuyor (PEP 668)</td><td>Sanal ortam oluştur; sistem Python'ına kurma</td></tr><tr><td><code>Permission denied</code></td><td>Yönetici klasörüne yazmaya çalışıyor</td><td>sudo kullanma; sanal ortam ya da <code>--user</code></td></tr><tr><td>SSL / proxy hatası</td><td>Kurum ağı trafiği denetliyor</td><td>BT'den proxy ve sertifika ayarını iste</td></tr><tr><td>REPL'de <code>pip install</code> SyntaxError</td><td>Terminal komutu Python'a yazıldı</td><td><code>exit()</code> ile çık, terminalde çalıştır</td></tr></table></div><div class="warn"><b>Paket adı ile içe aktarma adı farklı olabilir</b><code>pip install beautifulsoup4</code> kurar, kodda <code>import bs4</code> yazarsın; <code>scikit-learn</code> kurulur, <code>sklearn</code> içe aktarılır. Ayrıca PyPI'da tanınmış paketlere benzeyen sahte adlar (typosquatting) bulunur; adı kopyala-yapıştır yapmadan önce paket sayfasını kontrol et.</div><h2>uv'ye kısa bakış</h2><p>uv, Rust ile yazılmış, pip ve venv'in işini çok daha hızlı yapan yeni nesil bir araçtır; Python sürümlerini de kendisi indirebilir. Tek başına bir kurulum yolu olarak macOS / Linux dersinde ayrıntılı anlatılıyor. Bilmen gereken dört komut:</p><pre class="code">uv python install 3.12        # Python'ın kendisini indir
uv init rapor &amp;&amp; cd rapor     # pyproject.toml ile proje başlat
uv add pandas                 # paketi ekle (ortamı kendisi kurar)
uv run main.py                # projenin ortamında çalıştır</pre><p>Ekibin pip kullanıyorsa pip, uv kullanıyorsa uv; ikisinin de mantığı aynı: projeye özel ortam ve kayıtlı bağımlılık listesi.</p><h2>Kurulum doğrulama kontrol listesi</h2><p>Yeni bir bilgisayarda ya da sunucuda işe başlamadan önce bu listeyi sırayla geç. Her satır bir öncekinin varsayımını doğrular:</p><div class="steps-list"><ol><li><code>python --version</code> (ya da <code>python3</code>, <code>py</code>): beklenen sürüm mü?</li><li><code>where python</code> (Windows) / <code>which -a python3</code> (macOS/Linux): kaç Python var, ilki hangisi?</li><li><code>python -c "import sys; print(sys.executable)"</code>: çalışan yorumlayıcının tam yolu.</li><li><code>python -m pip --version</code>: pip aynı yolu mu gösteriyor?</li><li><code>python -c "import ssl, sqlite3, venv; print('tamam')"</code>: ağ, veritabanı ve sanal ortam modülleri sağlam mı?</li><li><code>python -m venv deneme</code>, etkinleştir, <code>python -m pip install requests</code>: tüm zincir çalışıyor mu? Sonra klasörü sil.</li><li>Editörde (VS Code) seçili yorumlayıcı 3. adımdaki yolla aynı mı?</li></ol></div><div class="note"><b>Gerçek işte</b>Kurumlarda "bende çalışıyor, sunucuda çalışmıyor" sorunlarının çoğu bu listedeki bir adımın atlanmasından çıkar: sunucuda farklı bir minor sürüm, paketin yanlış Python'a kurulması ya da proxy yüzünden yarım kalmış bir kurulum. Projenin README dosyasına "Python 3.12, <code>python -m pip install -r requirements.txt</code>" gibi iki satır eklemek, ekibe katılan her yeni kişiye saatler kazandırır.</div>`,
    ex: [
      {
        t: 'mc',
        id: 'kurulum-araclar-x1',
        stage: 'Isınma',
        q: 'Python\'ın sürüm döngüsü (PEP 602) için hangisi doğrudur?',
        o: [
          'Her yıl Ekim\'de yeni bir 3.x çıkar ve bir sürüm toplam yaklaşık 5 yıl desteklenir',
          'Yeni sürümler düzensiz çıkar; her sürüm sonsuza dek güvenlik yaması almaya devam eder',
          'Her ay yeni bir 3.x çıkar; eski sürümler yeni çıkanla birlikte hemen kaldırılır',
          'Yalnızca sondaki sayı (3.12.4\'teki 4) yeni dil özellikleri ve söz dizimi getirir'
        ],
        a: 0,
        why: 'PEP 602 ile özellik sürümleri yıllık ve Ekim ayındadır; yaklaşık 2 yıl tam destek, ardından güvenlik yamalarıyla toplam 5 yıl. Sondaki sayı yalnız düzeltme içerir; yeni özellikler ortadaki sayıyla gelir.'
      },
      {
        t: 'mc',
        id: 'kurulum-araclar-x2',
        stage: 'Isınma',
        q: 'Neden <code>pip install pandas</code> yerine <code>python -m pip install pandas</code> yazmak önerilir?',
        o: [
          'İkinci yazım paketi daha hızlı indirir ve sıkıştırılmış biçimde kurar',
          'Paket, tam olarak o <code>python</code> komutunun çalıştırdığı yorumlayıcıya kurulur',
          'pip artık tek başına bir komut olarak hiçbir işletim sisteminde bulunmuyor',
          'İkinci yazım sanal ortama gerek kalmadan tüm projeleri birbirinden yalıtır'
        ],
        a: 1,
        why: 'Makinede birden çok Python varsa PATH\'teki ilk pip başka bir Python\'a ait olabilir. python -m pip, "bu Python\'ın pip modülünü çalıştır" demektir; kurulum ile kodu çalıştıran yorumlayıcı aynı olur. Hız ve yalıtım sağlamaz.'
      },
      {
        t: 'predict',
        id: 'kurulum-araclar-x3',
        stage: 'Kodu oku',
        q: 'Bu kod (Python 3.10 veya üstünde) ne yazdırır?',
        code: 'import sys\nprint(sys.version_info[:2] >= (3, 8), sys.version_info.major)\n',
        o: ['True 3', 'False 3', '(3, 12) 3', 'True 12'],
        a: 0,
        why: 'sys.version_info[:2] (3, 12) gibi bir demettir; demetler soldan sağa eleman eleman karşılaştırılır ve (3, 12) >= (3, 8) doğrudur. major ana sürümdür, yani 3.'
      },
      {
        t: 'predict',
        id: 'kurulum-araclar-x4',
        stage: 'Kodu oku',
        q: 'Bu kod bir dosyaya yazılıp <code>python rapor.py</code> ile doğrudan çalıştırılırsa ne yazdırır?',
        code: 'print(__name__)\n',
        o: ['rapor', '__main__', 'rapor.py', '__name__'],
        a: 1,
        why: 'Doğrudan çalıştırılan dosyada __name__ her zaman "__main__" olur. Aynı dosya başka bir yerden import rapor ile içe aktarılsaydı "rapor" yazardı. Bu fark, if __name__ == "__main__": kalıbının temelidir.'
      },
      {
        t: 'predict',
        id: 'kurulum-araclar-x5',
        stage: 'Kodu oku',
        q: 'Bu uygulamada (tarayıcıdaki Pyodide) ya da python.org\'dan kurduğun Python\'da bu kod ne yazdırır?',
        code: 'import platform\nprint(platform.python_implementation())\n',
        o: ['Python', 'Pyodide', 'CPython', 'PyPy'],
        a: 2,
        why: 'python.org sürümü de Pyodide da C ile yazılmış referans uygulama CPython\'dır; Pyodide onun WebAssembly\'ye derlenmiş hâlidir. PyPy ayrı bir uygulamadır ve orada "PyPy" yazar.'
      },
      {
        t: 'order',
        id: 'kurulum-araclar-x6',
        stage: 'Kodu oku',
        q: '<p>Kurulum doğrulama betiğinin satırlarını sırala: betik çalışan sürümü <code>"3.12"</code> gibi bir metne çevirip uygunluk notuyla birlikte yazdırmalı (ör. <code>Python 3.12 (uygun)</code>).</p>',
        lines: ['import sys', 'surum = sys.version_info[:2]', 'metin = ".".join(str(p) for p in surum)', 'rapor = f"Python {metin}"', 'rapor += " (uygun)" if surum >= (3, 10) else " (eski)"', 'print(rapor)'],
        tests: 'assert rapor.startswith("Python 3."), "Rapor Python 3.x ile başlamalı"\nassert rapor.endswith("(uygun)") or rapor.endswith("(eski)"), "Rapor uygunluk notuyla bitmeli"\n',
        hint: 'Her satır bir önceki satırda oluşan bir adı kullanıyor; o adın nerede tanımlandığını izle.',
        why: 'sys önce içe aktarılmalı; surum ondan, metin surum\'dan, rapor metin\'den türetilir. += ile not ekleme rapor oluştuktan sonra, print en sonda gelir.'
      },
      {
        t: 'code',
        id: 'kurulum-araclar-x7',
        stage: 'Rehberli',
        diff: 1,
        q: '<p><code>pip_komutu(paket, surum=None)</code> fonksiyonunu yaz. Ekip arkadaşlarına gönderilecek kurulum komutunu metin olarak döndürsün:</p><ul><li><code>pip_komutu("requests")</code> → <code>"python -m pip install requests"</code></li><li><code>pip_komutu("pandas", "2.2.3")</code> → <code>"python -m pip install pandas==2.2.3"</code></li></ul>',
        guide: ['Sabit kısmı bir değişkende tut: "python -m pip install ".', 'surum None ise yalnızca paket adını ekle.', 'surum verilmişse paket adının arkasına == ve sürümü ekle (boşluksuz).', 'Oluşan metni döndür.'],
        example: 'def selam(ad, unvan=None):\n    if unvan is None:\n        return f"Merhaba {ad}"\n    return f"Merhaba {unvan} {ad}"\n\nprint(selam("Ayşe"))\nprint(selam("Kaya", "Dr."))\n',
        start: 'def pip_komutu(paket, surum=None):\n    komut = "python -m pip install "\n    # TODO: surum yoksa yalnız paket adını ekle\n    # TODO: surum varsa paket==surum biçiminde ekle\n    return komut\n',
        sol: 'def pip_komutu(paket, surum=None):\n    komut = "python -m pip install "\n    if surum is None:\n        return komut + paket\n    return f"{komut}{paket}=={surum}"\n',
        tests: 'assert pip_komutu("requests") == "python -m pip install requests", "Sürüm verilmeyince yalnız paket adı eklenmeli"\nassert pip_komutu("pandas", "2.2.3") == "python -m pip install pandas==2.2.3", "Sürüm == ile, boşluksuz eklenmeli"\nassert pip_komutu("numpy", "1.26.4").count(" ") == 4, "Komutta fazladan boşluk olmamalı: pandas == 2.2 yazımı pip\'te hata verir"\n',
        hints: ['None kontrolü için "is None" kullan.', 'f-string ile f"{komut}{paket}=={surum}" yazabilirsin.', 'if surum is None: return komut + paket'],
        why: '== tam sürüm sabitler ve boşluk içermemelidir. Varsayılan değeri None olan parametre "verilmedi" durumunu ayırt etmenin standart yoludur.'
      },
      {
        t: 'code',
        id: 'kurulum-araclar-x8',
        stage: 'Rehberli',
        diff: 2,
        q: '<p>Python 3.x sürümleri her yıl Ekim\'de çıkar: 3.8 → 2019, 3.9 → 2020, ... yani yayın yılı = 2011 + minor. Destek yaklaşık olarak yayından sonraki ilk 2 takvim yılı (yayın yılı dahil) tam, 5. yıla kadar güvenlik desteğidir. <code>surum_durumu(minor, yil)</code> fonksiyonunu yaz; yıl bazında yaklaşık şu metinlerden birini döndürsün:</p><ul><li><code>yil &lt; yayın</code> → <code>"henüz çıkmadı"</code></li><li><code>yil &lt;= yayın + 1</code> → <code>"tam destek"</code></li><li><code>yil &lt;= yayın + 5</code> → <code>"güvenlik desteği"</code></li><li>aksi hâlde → <code>"destek bitti"</code></li></ul>',
        guide: [
          'Önce yayın yılını hesapla: yayin = 2011 + minor.',
          'Koşulları küçükten büyüğe sırayla yaz: önce yil &lt; yayin.',
          'Sonra yayin + 1 ve yayin + 5 sınırlarını if/elif ile dene.',
          'Hiçbiri tutmazsa "destek bitti" döndür.'
        ],
        example: 'def kargo_durumu(gun):\n    if gun < 1:\n        return "hazırlanıyor"\n    elif gun <= 3:\n        return "yolda"\n    return "gecikti"\n\nprint(kargo_durumu(0), kargo_durumu(2), kargo_durumu(5))\n',
        start: 'def surum_durumu(minor, yil):\n    # TODO: yayın yılını hesapla\n    yayin = 0\n    # TODO: koşulları sırayla dene\n    return "destek bitti"\n',
        sol: 'def surum_durumu(minor, yil):\n    yayin = 2011 + minor\n    if yil < yayin:\n        return "henüz çıkmadı"\n    elif yil <= yayin + 1:\n        return "tam destek"\n    elif yil <= yayin + 5:\n        return "güvenlik desteği"\n    return "destek bitti"\n',
        tests: 'assert surum_durumu(12, 2024) == "tam destek", "3.12 2023\'te çıktı; 2024 tam destek döneminde"\nassert surum_durumu(9, 2025) == "güvenlik desteği", "3.9 (2020) için 2025 son güvenlik yılı"\nassert surum_durumu(8, 2025) == "destek bitti", "3.8 (2019) 2024\'te destek dışı kaldı"\nassert surum_durumu(16, 2026) == "henüz çıkmadı", "3.16 2027\'de çıkacak"\nassert surum_durumu(13, 2024) == "tam destek", "Yayın yılının kendisi de tam destektir"\n',
        hints: ['Yayın yılı formülü: 2011 + minor (3.12 → 2023).', 'if / elif / elif / return zinciri kur; sıralama önemli.', 'elif yil <= yayin + 5: return "güvenlik desteği"'],
        why: 'Koşulları dar aralıktan geniş aralığa sıraladığında her yıl tam olarak bir dala düşer. Gerçek destek tarihleri ay bazındadır; bu fonksiyon yıl bazında yaklaşık bir tablo üretir.'
      },
      {
        t: 'code',
        id: 'kurulum-araclar-x9',
        stage: 'Rehberli',
        diff: 2,
        q: '<p><code>python --version</code> komutu <code>"Python 3.12.4"</code> gibi bir satır yazar. <code>surum_ayikla(cikti)</code> fonksiyonunu yaz: bu metinden <code>(3, 12, 4)</code> biçiminde tam sayılardan oluşan bir demet (tuple) döndürsün. Baştaki ve sondaki boşluklar ile satır sonu temizlenmeli.</p>',
        guide: [
          'strip() ile metnin iki ucundaki boşluk ve satır sonlarını sil.',
          'split() ile "Python" ve "3.12.4" parçalarına ayır; sürüm ikinci parçadır.',
          'Sürümü "." ile böl; üç metin parçası elde edersin.',
          'Her parçayı int() ile çevirip (a, b, c) demetini döndür.'
        ],
        example: 'tarih = " 2025-03-14\\n".strip()\nyil, ay, gun = tarih.split("-")\nprint((int(yil), int(ay), int(gun)))\n',
        start: 'def surum_ayikla(cikti):\n    # TODO: uçları temizle ve sürüm parçasını al\n    surum = cikti\n    # TODO: noktadan böl ve sayılara çevir\n    return surum\n',
        sol: 'def surum_ayikla(cikti):\n    surum = cikti.strip().split()[1]\n    ana, alt, duzeltme = surum.split(".")\n    return (int(ana), int(alt), int(duzeltme))\n',
        tests: 'assert surum_ayikla("Python 3.12.4") == (3, 12, 4), "Python 3.12.4 → (3, 12, 4)"\nassert surum_ayikla("Python 3.9.18\\n") == (3, 9, 18), "Sondaki satır sonu temizlenmeli"\nassert surum_ayikla("  Python 3.13.0  ") == (3, 13, 0), "Baştaki ve sondaki boşluklar temizlenmeli"\nassert surum_ayikla("Python 3.9.18") < surum_ayikla("Python 3.10.1"), "Sayı demetleri doğru karşılaştırılır: 9 < 10"\n',
        hints: ['split() ayraçsız çağrılırsa boşluklardan böler.', 'surum.split(".") üç parça verir: "3", "12", "4".', 'return (int(ana), int(alt), int(duzeltme))'],
        why: 'Sürümleri metin olarak karşılaştırmak yanlıştır ("3.9" > "3.10" doğru çıkar). Sayı demetine çevirdiğinde (3, 9) < (3, 10) olur ve karşılaştırma doğru çalışır.'
      },
      {
        t: 'code',
        id: 'kurulum-araclar-x10',
        stage: 'Kendin yaz',
        diff: 1,
        q: '<p>Yeni başlayanlar terminal komutlarını REPL\'e, Python kodunu terminale yazıp karıştırır. <code>nereye_yazilir(satir)</code> fonksiyonunu yaz:</p><ul><li>satır <code>"&gt;&gt;&gt; "</code> ile başlıyorsa <code>"REPL"</code></li><li>satır <code>"python"</code>, <code>"py "</code> ya da <code>"pip"</code> ile başlıyorsa <code>"terminal"</code></li><li>aksi hâlde <code>"bilinmiyor"</code></li></ul><p>Baştaki boşlukları yok say.</p>',
        sol: 'def nereye_yazilir(satir):\n    s = satir.lstrip()\n    if s.startswith(">>> "):\n        return "REPL"\n    if s.startswith("python") or s.startswith("py ") or s.startswith("pip"):\n        return "terminal"\n    return "bilinmiyor"\n',
        tests: 'assert nereye_yazilir(">>> print(1)") == "REPL", ">>> REPL istemidir"\nassert nereye_yazilir("python -m pip list") == "terminal", "python komutu terminalde çalışır"\nassert nereye_yazilir("  pip install pandas") == "terminal", "Baştaki boşluk yok sayılmalı"\nassert nereye_yazilir("py -3.12 rapor.py") == "terminal", "Windows py başlatıcısı da terminal komutudur"\nassert nereye_yazilir("print(1)") == "bilinmiyor", "Ne istem ne komut: bilinmiyor"\nassert nereye_yazilir("pyenv versions") == "bilinmiyor", "py ile başlayan her şey py başlatıcısı değildir; boşluğa dikkat"\n',
        hints: ['lstrip() yalnızca soldaki boşlukları siler.', 'startswith birden çok kez kullanılabilir; or ile bağla. "py " sonundaki boşluk önemli.'],
        why: 'startswith ile önek kontrolü, metni bölmeden sınıflandırmanın en okunur yoludur. "py " önekindeki boşluk, pyenv gibi başka araçların yanlışlıkla eşleşmesini engeller.'
      },
      {
        t: 'code',
        id: 'kurulum-araclar-x11',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 2,
        q: '<p>Bu fonksiyon sabitlenmiş sürümle kurulum komutu üretmeli, ama ürettiği komut pip\'te hata veriyor ve yanlış Python\'a kurabiliyor. <b>Hatayı bul ve düzelt.</b> Beklenen: <code>kur("pandas", "2.2.3")</code> → <code>"python -m pip install pandas==2.2.3"</code>.</p>',
        start: 'def kur(paket, surum):\n    return "pip install " + paket + " = " + surum\n',
        sol: 'def kur(paket, surum):\n    return "python -m pip install " + paket + "==" + surum\n',
        tests: 'assert kur("pandas", "2.2.3") == "python -m pip install pandas==2.2.3", "Komut python -m pip ile başlamalı ve sürüm == ile boşluksuz eklenmeli"\nassert kur("rich", "13.7.1") == "python -m pip install rich==13.7.1", "Başka paketle de doğru çalışmalı"\n',
        hints: ['pip\'te sürüm sabitleme operatörü tek = değil, iki eşittir: ==', 'Operatörün etrafında boşluk olursa kabuk onu ayrı argüman sayar.', 'Doğru Python\'a kurmak için komut "python -m pip" ile başlamalı.'],
        why: '"pandas = 2.2.3" kabukta üç ayrı argüman olur ve pip "=" adlı paketi bulamaz. Sürüm belirteci == olmalı ve paket adına bitişik yazılmalı. python -m pip ise paketin tam bu yorumlayıcıya gitmesini sağlar.'
      },
      {
        t: 'code',
        id: 'kurulum-araclar-x12',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 2,
        q: '<p>Sanal ortamda olup olmadığını anlamanın yolu: <code>sys.prefix</code> (çalışan ortamın klasörü) ile <code>sys.base_prefix</code> (ana Python kurulumunun klasörü) <b>farklıysa</b> bir sanal ortamın içindesin. Aşağıdaki fonksiyon ters sonuç veriyor. <b>Hatayı bul ve düzelt.</b></p>',
        start: 'def sanal_ortamda_mi(prefix, base_prefix):\n    return prefix == base_prefix\n\n\ndef ortam_mesaji(prefix, base_prefix):\n    if sanal_ortamda_mi(prefix, base_prefix):\n        return "Sanal ortam: " + base_prefix\n    return "Global Python: " + base_prefix\n',
        sol: 'def sanal_ortamda_mi(prefix, base_prefix):\n    return prefix != base_prefix\n\n\ndef ortam_mesaji(prefix, base_prefix):\n    if sanal_ortamda_mi(prefix, base_prefix):\n        return "Sanal ortam: " + prefix\n    return "Global Python: " + base_prefix\n',
        tests: 'assert sanal_ortamda_mi("/proje/.venv", "/usr") is True, "prefix ile base_prefix farklıysa sanal ortamdasın"\nassert sanal_ortamda_mi("/usr", "/usr") is False, "İkisi aynıysa global Python çalışıyor"\nassert ortam_mesaji("/proje/.venv", "/usr") == "Sanal ortam: /proje/.venv", "Sanal ortam mesajı ortamın kendi klasörünü (prefix) göstermeli"\nassert ortam_mesaji("/usr", "/usr") == "Global Python: /usr", "Global mesajı doğru olmalı"\n',
        hints: ['Karşılaştırma operatörü ters: "farklıysa" demek != demektir.', 'İkinci bir hata daha var: sanal ortam mesajında hangi klasör gösterilmeli?', 'Sanal ortamın yolu prefix\'tir; base_prefix ana kurulumdur.'],
        why: 'venv etkinken sys.prefix .venv klasörünü, sys.base_prefix ise ortamın türetildiği ana kurulumu gösterir. Eşitlik global Python demektir. Mesajda da ortamın kendi yolu (prefix) gösterilmeli, yoksa kullanıcı yanlış klasöre bakar.'
      },
      {
        t: 'code',
        id: 'kurulum-araclar-x13',
        stage: 'Meydan okuma',
        diff: 3,
        q: '<p>requirements.txt dosyasındaki tek bir satırı ayrıştıran <code>paket_ayir(satir)</code> fonksiyonunu yaz. <code>(paket_adi, surum_kosulu)</code> demeti döndürsün; paket adı küçük harfe çevrilsin:</p><ul><li><code>"pandas==2.2.3"</code> → <code>("pandas", "==2.2.3")</code></li><li><code>"numpy &gt;= 1.26"</code> → <code>("numpy", "&gt;=1.26")</code> (boşlukları temizle)</li><li><code>"Requests"</code> → <code>("requests", None)</code></li><li><code>"rich==13.7.1  # renkli çıktı"</code> → <code>("rich", "==13.7.1")</code> (yorumu at)</li><li>Boş satır ya da yalnız yorum (<code>"# test araçları"</code>) → <code>None</code></li></ul><p>Yalnızca <code>==</code> ve <code>&gt;=</code> operatörlerini desteklemen yeterli.</p>',
        sol: 'def paket_ayir(satir):\n    satir = satir.split("#")[0].replace(" ", "").strip()\n    if not satir:\n        return None\n    if "==" in satir:\n        ad, surum = satir.split("==", 1)\n        return (ad.lower(), "==" + surum)\n    if ">=" in satir:\n        ad, surum = satir.split(">=", 1)\n        return (ad.lower(), ">=" + surum)\n    return (satir.lower(), None)\n',
        tests: 'assert paket_ayir("pandas==2.2.3") == ("pandas", "==2.2.3"), "== ile sabitlenmiş satır"\nassert paket_ayir("numpy >= 1.26") == ("numpy", ">=1.26"), "Boşluklar temizlenmeli"\nassert paket_ayir("Requests") == ("requests", None), "Sürümsüz paket: koşul None, ad küçük harf"\nassert paket_ayir("rich==13.7.1  # renkli çıktı") == ("rich", "==13.7.1"), "Satır sonu yorumu atılmalı"\nassert paket_ayir("# test araçları") is None, "Yalnız yorum satırı None döndürmeli"\nassert paket_ayir("   ") is None, "Boş satır None döndürmeli"\n',
        hints: [
          'Önce yorumu at: satir.split("#")[0]. Sonra boşlukları sil.',
          'Kalan metin boşsa None döndür. Sonra "==" ve ">=" için in ile kontrol et.',
          'satir.split("==", 1) ad ve sürümü verir; operatörü sürümün önüne geri ekle.'
        ],
        why: 'Ayrıştırmada sıra önemlidir: önce gürültüyü (yorum, boşluk) temizle, sonra boşluğu kontrol et, en son yapıyı böl. split("==", 1) yalnızca ilk eşleşmede böler. Gerçek projelerde bu iş için packaging kütüphanesinin Requirement sınıfı kullanılır; ama mantık aynıdır.'
      }
    ],
    faq: [
      {
        q: 'Bilgisayarımda Python 3.9 var, bu kursu takip edebilir miyim?',
        a: 'Temel konuların çoğu çalışır ama match ifadesi (3.10), int | str gibi tip birleşimleri (3.10) ve daha iyi hata mesajları gibi özellikler eksik kalır. Üstelik 3.9 Ekim 2025\'te destek dışı kaldı. En az 3.11, tercihen 3.12 kur; eski sürümü kaldırmak zorunda değilsin, yan yana durabilirler.'
      },
      {
        q: 'uv mu kullanmalıyım, pip mi?',
        a: 'Öğrenirken pip ve venv\'i bilmen şart; her sunucuda, her dokümanda karşına çıkarlar. uv aynı kavramları çok daha hızlı ve tek araçla sunar ve yeni projelerde hızla yaygınlaşıyor. Ekibin hangisini kullanıyorsa onu kullan; ikisi aynı requirements ve pyproject dosyalarını okuyabilir.'
      }
    ],
    mistakes: [
      {
        bad: '>>> pip install pandas',
        good: '# önce REPL\'den çık: exit()\npython -m pip install pandas',
        why: 'pip bir terminal komutudur; REPL\'e (>>> istemine) yazılırsa SyntaxError verir. Önce exit() ile çık, sonra terminalde python -m pip ile kur.'
      },
      {
        bad: 'if sys.version >= "3.10":\n    print("uygun")',
        good: 'if sys.version_info >= (3, 10):\n    print("uygun")',
        why: 'sys.version bir metindir ve metinler karakter karakter karşılaştırılır: "3.9" > "3.10" doğru çıkar. Sürüm kontrolü için sayı demeti olan sys.version_info kullan.'
      }
    ]
  }
);
})(window);
