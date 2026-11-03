/* Kesit Python — 'kurulum-araclar' dersi uzantısı (Derinleş + ek alıştırmalar) */
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
  {
    id: 'kurulum-araclar',
    min: 25,
    html: `<p>Bu bölümde kurulumun büyük resmini görürsün. Adım adım kurulum için <b>Windows</b> ve <b>macOS / Linux</b> derslerine, editör için <b>VS Code</b>, defter ortamı için <b>Jupyter ve Colab</b> derslerine bak. Burada hangi işletim sisteminde olursan ol geçerli kararları ve araçları ele alıyoruz: hangi sürüm, hangi Python, REPL'den nasıl daha çok verim alınır, <code>python -m</code> neden bu kadar önemli ve pip ile ilk paket nasıl kurulur.</p><h2>Sürüm seçimi ve Python'ın sürüm döngüsü</h2><p>Python sürümleri <code>3.12.4</code> gibi üç parçalıdır: <b>3</b> ana sürüm (major), <b>12</b> özellik sürümü (minor), <b>4</b> düzeltme sürümü (micro / patch). Önemli olan ortadaki sayıdır; yeni söz dizimi ve modüller orada gelir. Sondaki sayı yalnızca hata ve güvenlik düzeltmesi içerir, bu yüzden 3.12.3'ten 3.12.4'e geçmek her zaman güvenlidir.</p><p>PEP 602 ile Python yıllık bir takvime geçti: her yıl Ekim ayında yeni bir 3.x çıkar (3.12 → 2023, 3.13 → 2024, 3.14 → 2025). Her sürüm yaklaşık 2 yıl tam destek (hata düzeltmeleri) alır, ardından yalnızca güvenlik düzeltmeleriyle toplam 5 yıl yaşar. Örneğin 3.9 Ekim 2025'te, 3.10 Ekim 2026'da destek dışı kaldı. Destek dışı bir sürüm çalışmaya devam eder ama artık güvenlik açıkları kapatılmaz; kurum sunucularında bu kabul edilmez.</p><div class="tbl-wrap"><table><tr><th>Aşama</th><th>Süre</th><th>Ne gelir?</th><th>Ne zaman kullanılır?</th></tr><tr><td>alpha / beta / rc</td><td>Yayın öncesi ~1 yıl</td><td>Deneme sürümleri, özellikler değişebilir</td><td>Yalnız kütüphane yazarları test için</td></tr><tr><td>Tam destek (bugfix)</td><td>İlk ~2 yıl</td><td>Hata ve güvenlik düzeltmeleri, düzenli 3.x.y sürümleri</td><td>Yeni projeler için ideal</td></tr><tr><td>Güvenlik desteği</td><td>Sonraki ~3 yıl</td><td>Yalnız güvenlik yamaları, çoğunlukla kaynak kodu olarak</td><td>Mevcut projeler; göç planı yap</td></tr><tr><td>Destek dışı (EOL)</td><td>5 yıldan sonra</td><td>Hiçbir şey</td><td>Kullanma; acilen yükselt</td></tr></table></div><div class="tip"><b>Hangi sürümü kurmalıyım?</b>Pratik kural: <b>en yeni sürümün bir öncesi</b>. Yeni çıkmış bir sürümde pandas, numpy gibi paketlerin hazır derlenmiş dosyaları (wheel) birkaç ay gecikebilir. Ekibin bir sürüm kullanıyorsa onunla aynısını kur; bu uygulama tarayıcıda Python 3.12 kullanır ve öğrendiğin her şey 3.10 ve üstünde çalışır.</div><h2>CPython, PyPy ve diğerleri</h2><p>"Python" aslında bir dil tanımıdır; onu çalıştıran programa uygulama (implementation) denir. python.org'dan indirdiğin sürüm <b>CPython</b>'dır: C ile yazılmış, referans kabul edilen uygulama. Bu uygulamadaki tarayıcı motoru Pyodide da WebAssembly'ye derlenmiş CPython'dır. Kendin kontrol et:</p><pre class="py">import sys
import platform
print("Uygulama:", platform.python_implementation())
print("İç adı:", sys.implementation.name)
print("Sürüm:", platform.python_version())
print("Sürüm demeti:", sys.version_info[:3])
print("En az 3.10 mu?", sys.version_info &gt;= (3, 10))</pre><div class="tbl-wrap"><table><tr><th>Uygulama</th><th>Nedir?</th><th>Ne zaman?</th></tr><tr><td>CPython</td><td>Referans uygulama, C ile yazılmış</td><td>Varsayılan; hemen her iş</td></tr><tr><td>PyPy</td><td>JIT derleyicili uygulama</td><td>Uzun çalışan saf Python döngüleri; C eklentili paketlerde uyumluluk sınırlı olabilir</td></tr><tr><td>MicroPython</td><td>Mikrodenetleyiciler için küçük Python</td><td>Sensör, ESP32, Raspberry Pi Pico</td></tr><tr><td>Pyodide</td><td>Tarayıcıda çalışan CPython</td><td>Bu uygulama, JupyterLite</td></tr></table></div><p>CPython'ın son sürümlerinde iki yenilik var: GIL'siz (free-threaded) derleme (3.13'te deneysel, 3.14'te resmî destekli, ama ayrı bir derleme ve varsayılan değil) ve hâlâ deneysel olan JIT derleyici. İkisi de varsayılan olarak kapalıdır; Eşzamanlılık ve Performans derslerinde konuşacağız.</p><h2>REPL'i iyi kullanmak</h2><p>Terminalde <code>python</code> (macOS/Linux'ta <code>python3</code>, Windows'ta <code>py</code> da olur) yazınca açılan REPL, en hızlı deneme alanındır. Birkaç numara verimini katlar:</p><pre class="code">&gt;&gt;&gt; 1499.9 * 3
4499.700000000001
&gt;&gt;&gt; round(_, 2)          # _ son sonucu tutar (yalnız REPL'de)
4499.7
&gt;&gt;&gt; help(round)          # belgeyi gösterir; q ile çık
&gt;&gt;&gt; dir("metin")         # bir nesnenin metotlarını listeler
&gt;&gt;&gt; import math; math.sqrt(144)
12.0
&gt;&gt;&gt; exit()</pre><ul><li><b><code>_</code> değişkeni:</b> REPL'de son ifadenin sonucunu tutar. Betikte bu özellik yoktur.</li><li><b><code>help()</code> ve <code>dir()</code>:</b> İnternete çıkmadan belge okumanın yolu. <code>help(str.split)</code> bir metodun ne yaptığını anlatır.</li><li><b>Yukarı ok:</b> Önceki satırları geri getirir. Python 3.13 ile gelen yeni REPL renkli istem (prompt), çok satırlı düzenleme, F1 (yardım), F2 (geçmiş) ve F3 (yapıştırma kipi) sunar; <code>exit</code> parantezsiz de çalışır.</li><li><b><code>python -i rapor.py</code>:</b> Betiği çalıştırır ve bittiğinde REPL'e düşer; betikteki değişkenleri inceleyebilirsin. Hata ayıklamanın en basit biçimidir.</li></ul><p><code>help</code> ve <code>dir</code> burada da çalışır; çıktıyı kısaltmak için yalnız ilk elemanları alıyoruz:</p><pre class="py">yontemler = dir("Anadolu")
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
    ex: [{
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
      }],
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
