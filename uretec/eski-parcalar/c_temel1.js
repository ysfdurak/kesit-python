/* Kesit Python — Temel 1: Başlangıç ve Veri Türleri (python-nedir … sozlukler) */
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push(
/* ───────────────────────── 1. python-nedir ───────────────────────── */
{
  id: 'python-nedir',
  lv: 'temel',
  mod: 'Başlangıç',
  min: 15,
  title: 'Python nedir, nerede kullanılır?',
  sum: "Python'ın ne olduğunu, iş dünyasında nerelerde kullanıldığını öğrenir ve ilk print komutlarını çalıştırırsın.",
  goals: [
    "Python'ın ne tür bir dil olduğunu ve neden bu kadar yaygın olduğunu açıklayabilirim.",
    'Veri, otomasyon, web ve yapay zekâ alanlarında Python ile neler yapıldığını sayabilirim.',
    'Bir e-ticaret analistinin günlük işinde Python ile hangi adımları yürüttüğünü anlatabilirim.',
    'print ile ekrana metin ve sayı yazdırabilirim.'
  ],
  body: `
<h2>Python nedir?</h2>
<p>Python, 1991'de Guido van Rossum'un yayımladığı, okunabilirliği her şeyin önüne koyan genel amaçlı bir programlama dili (programming language). Adını yılandan değil, Monty Python komedi grubundan alır. Bugün kullanılan sürüm ailesi Python 3; bu uygulamada Python 3.12 ile çalışacaksın. Yazdığın kod, tarayıcının içinde gerçek bir Python yorumlayıcısında (interpreter) koşar. Yani burada öğrendiğin her satır, bilgisayarına kuracağın Python'da da birebir aynı şekilde çalışır.</p>
<p>Python'ı bu kadar sevdiren üç özellik var:</p>
<ul>
<li><b>Okunur sözdizimi:</b> Süslü parantez yerine girinti, noktalı virgül yerine satır sonu. Kod, kısa İngilizce cümlelere benzer; başkasının kodunu okumak kolaydır.</li>
<li><b>Dev kütüphane ekosistemi:</b> Veri analizi için pandas, yapay zekâ için PyTorch, web için Django ve FastAPI, otomasyon için yüzlerce paket. Çoğu iş için hazır bir araç vardır.</li>
<li><b>Hemen sonuç:</b> Ayrı bir derleme adımı yoktur. Yaz, çalıştır, sonucu gör, düzelt.</li>
</ul>

<h2>Nerede kullanılır?</h2>
<p>Python'ı tek bir alana sıkıştırmak zor. Aşağıdaki tablo, iş dünyasında en sık karşılaşacağın kullanım alanlarını özetliyor:</p>
<div class="tbl-wrap"><table>
<tr><th>Alan</th><th>Tipik iş</th><th>Öne çıkan araçlar</th></tr>
<tr><td>Veri analizi ve raporlama</td><td>Satış verisini temizleyip özet tablo ve grafik üretmek</td><td>pandas, matplotlib, Jupyter</td></tr>
<tr><td>Otomasyon</td><td>Her sabah 20 Excel dosyasını birleştirip e-posta göndermek</td><td>standart kütüphane, openpyxl</td></tr>
<tr><td>Web ve API</td><td>Sipariş sistemine servis yazmak, web sitesi kurmak</td><td>Django, FastAPI, Flask</td></tr>
<tr><td>Yapay zekâ ve makine öğrenmesi</td><td>Müşteri kaybı tahmini, öneri sistemi, dil modelleri</td><td>scikit-learn, PyTorch, TensorFlow</td></tr>
<tr><td>Veri mühendisliği</td><td>Veritabanından veri çekip dönüştürüp başka sisteme aktarmak</td><td>SQLAlchemy, Airflow</td></tr>
<tr><td>Test ve DevOps</td><td>Sunucu betikleri, test otomasyonu, dağıtım</td><td>pytest, Ansible</td></tr>
</table></div>
<p>Bu listedeki alanların ortak noktası şu: hepsinde Python, "işi bir kere yaz, her gün otomatik koşsun" mantığıyla kullanılır. Bir analist için bu, Excel'de elle yaptığı her tekrarlı işi birkaç satır koda dönüştürmek demektir.</p>

<h2>Anadolu Market'te bir analist Python'la ne yapar?</h2>
<p>Diyelim ki Anadolu Market'in e-ticaret ekibinde veri analistisin. Pazartesi sabahı gelen kutunda şu istek var: "Geçen haftanın şehir bazlı satış özetini çıkarır mısın?" Python bilen bir analist şu akışı izler:</p>
<div class="steps-list"><ol>
<li>Sipariş verisini kaynağından okur (CSV dosyası, veritabanı ya da API).</li>
<li>Veriyi temizler: boş şehir adlarını doldurur, "istanbul" ile "İstanbul"u aynı şehir sayar.</li>
<li>Şehre göre gruplar, sipariş adedini ve toplam tutarı hesaplar.</li>
<li>Sonucu bir tabloya ve grafiğe döker, yöneticinin anlayacağı dilde özetler.</li>
<li>Betiği zamanlayıcıya bağlar; artık her pazartesi rapor kendiliğinden gelir.</li>
</ol></div>
<p>Bu kursun sonunda bu akışın tamamını tek başına yazabileceksin. Ama her yolculuk küçük bir adımla başlar: ekrana bir şey yazdırmak.</p>

<h2>İlk print örnekleri</h2>
<p><code>print</code>, Python'ın ekrana yazdırma fonksiyonudur (function). Parantez içine ne verirsen onu gösterir. Aşağıdaki kutuda Çalıştır'a bas:</p>
<pre class="py">print("Merhaba, Anadolu Market!")
print("Bugün 3 yeni sipariş geldi.")</pre>
<p>Tırnak içine yazdığın şeye metin (string) denir. Birden fazla değeri virgülle ayırarak aynı satıra yazdırabilirsin; Python aralarına otomatik boşluk koyar:</p>
<pre class="py">print("Sipariş adedi:", 3)
print("Toplam tutar:", 3 * 250)
print("Anadolu", "Bank", sep=" - ")</pre>
<p>Üçüncü satırdaki <code>sep</code>, değerler arasına ne konulacağını belirler. Şimdi en önemli ayrımı gör: tırnak içindeki her şey metindir, tırnak dışındaki sayılarla hesap yapılır.</p>
<pre class="py">print(3 * 250)
print("3 * 250")
print(5 + 3)
print("5" + "3")</pre>
<p>İlk satırda çarpma gerçekten yapılır ve 750 çıkar. İkinci satır ise sadece bir metindir; Python onu olduğu gibi basar. Son iki satır da aynı mantığın devamı: sayılar toplanır, metinler ise uç uca eklenir.</p>
<div class="tip"><b>Tırnak seçimi</b>Çift tırnak ("...") ve tek tırnak ('...') Python'da aynı işi görür. Metnin içinde kesme işareti varsa çift tırnak kullanmak rahat eder: <code>print("Anadolu Market'te indirim var")</code>.</div>
<div class="warn"><b>Büyük-küçük harf önemli</b><code>Print("x")</code> yazarsan Python "NameError: name 'Print' is not defined" der. Python'da <code>print</code> ile <code>Print</code> farklı iki addır. Her zaman küçük harfle yaz.</div>
<div class="note"><b>Python 2 ile karıştırma</b>İnternette <code>print "Merhaba"</code> gibi parantezsiz örnekler görebilirsin. Bu, 2020'de desteği biten Python 2 yazımıdır. Sen her zaman parantez kullan.</div>

<h2>Python ile ilk hesaplar</h2>
<p>print yalnızca metin basmaz; parantez içindeki her ifadeyi hesaplayıp sonucu gösterir. Anadolu Market'in bir günlük küçük özetini sadece print ile çıkarabilirsin. Değişken kavramını henüz görmedin, bu yüzden değerleri doğrudan yazıyoruz; birkaç ders sonra aynı hesabı adlandırılmış değerlerle, çok daha okunur biçimde yapacaksın.</p>
<pre class="py">print("Sabah siparişi:", 12)
print("Öğleden sonra:", 19)
print("Günlük toplam:", 12 + 19)
print("Ortalama sepet (TL):", (1499 + 250 + 89) / 3)
print("Kalan stok:", 250 - 31)</pre>
<p>Dördüncü satırdaki bölme işlemi ondalıklı sonuç verir; bunun neden hep böyle olduğunu Sayılar dersinde öğreneceksin. Şimdilik şunu gör: Python bir hesap makinesi gibi parantez önceliğine uyar ve sonucu hemen basar.</p>

<h2>Yorumlanan dil ne demek?</h2>
<p>Python yorumlanan (interpreted) bir dildir: kodunu önce makine diline çeviren ayrı bir program çalıştırmazsın; yorumlayıcı satırları sırayla okur ve uygular. Bunun iki sonucu var. Birincisi, deneme yapmak hızlıdır: bir satır yazar, hemen sonucu görürsün. İkincisi, bir hata ancak o satıra sıra geldiğinde ortaya çıkar; dolayısıyla kodu küçük parçalar hâlinde sık sık çalıştırmak iyi bir alışkanlıktır. Bir sonraki derste Python'ı kendi bilgisayarına kuracak ve bu yorumlayıcıyı terminalden çalıştıracaksın.</p>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Excel'den Python'a geçiş neden kârlı?</h3>
<p>Çoğu analist Python'a Excel'in sınırına çarpınca gelir: dosya yüz binlerce satıra ulaşınca yavaşlar, aynı raporu her hafta elle yenilemek hata üretir, iki kaynağı birleştirmek saatler alır. Python'da aynı iş bir betiktir: veriyi okur, dönüştürür, raporu yazar. Betik bir kez doğru çalışıyorsa her hafta aynı kalitede çalışır. Excel'in yerini almaz; Excel'in yapamadığı tekrarlı ve büyük işleri üstlenir.</p>
<h3>Python her şeyin çözümü değil</h3>
<p>Dürüst olmak gerekirse Python'ın zayıf olduğu yerler de var. Mobil uygulama arayüzleri için Swift ve Kotlin, tarayıcıda çalışan arayüzler için JavaScript, çok yüksek performans gerektiren oyun motoru ya da işletim sistemi çekirdeği için C, C++ ve Rust tercih edilir. Python'ın gücü, bu dillerle yazılmış hızlı kütüphaneleri kolayca kullanabilmesinde yatar: pandas ve numpy'nin altında C kodu çalışır, sen ise Python'ın rahatlığıyla yazarsın.</p>
<h3>İş ilanlarında ne beklenir?</h3>
<p>Veri analisti ilanlarında genellikle "Python (pandas), SQL ve bir görselleştirme aracı" üçlüsü geçer. Otomasyon ve yazılım rollerinde buna standart kütüphane, test yazma ve Git eklenir. Bu kursun Temel seviyesi dilin kendisini, Orta seviyesi Pythonic kod ve standart kütüphaneyi, İleri seviyesi ise pandas, eşzamanlılık ve dağıtımı kapsıyor; yani ilanlardaki beklentiyle aynı sırayı izliyorsun.</p>
</section>
`,
  ex: [
    { t: 'mc', q: "Python adını nereden alır?",
      o: ['Piton yılanından', 'Monty Python komedi grubundan', 'Yunan mitolojisindeki bir yaratıktan', "Guido van Rossum'un doğduğu kasabanın adından"], a: 1,
      why: "Guido van Rossum dilin adını, sevdiği Monty Python komedi grubundan seçti. Yılan logosu sonradan geldi; mitoloji ve kasaba seçenekleri uydurmadır." },
    { t: 'code', id: 'python-nedir-1',
      q: '<p>Ekrana tam olarak <code>Merhaba, Anadolu Market!</code> yazdır.</p>',
      start: '# print ile yazdır\n',
      sol: 'print("Merhaba, Anadolu Market!")\n',
      expect: 'Merhaba, Anadolu Market!\n',
      hints: ['print(...) parantezi içine metni tırnakla yaz.', 'Virgül ve ünlem işaretini de aynen koy.'],
      why: 'Tırnak içindeki metin olduğu gibi ekrana basılır.' },
    { t: 'code', id: 'python-nedir-2',
      q: '<p>Üç satırlık bir sipariş fişi yazdır. Satırlar sırasıyla tam olarak şöyle olmalı:</p><pre class="out">Ürün: Kahve Makinesi\nAdet: 2\nFiyat: 1500</pre>',
      start: 'print("Ürün: Kahve Makinesi")\n# diğer iki satırı ekle\n',
      sol: 'print("Ürün: Kahve Makinesi")\nprint("Adet: 2")\nprint("Fiyat: 1500")\n',
      expect: 'Ürün: Kahve Makinesi\nAdet: 2\nFiyat: 1500\n',
      hints: ['Her satır için ayrı bir print yaz.', 'İki nokta ile sayı arasında bir boşluk var.'],
      why: 'Her print çağrısı yeni bir satıra yazar; üç satır için üç print yeter.' },
    { t: 'mc', q: "Aşağıdakilerden hangisi Python'ın <b>zayıf</b> olduğu, genelde başka dillerin tercih edildiği bir alandır?",
      o: ['Satış verisini temizleyip haftalık rapor üretmek', 'Her gün tekrarlanan dosya işlerinin otomasyonu', 'Oyun motoru çekirdeği gibi ham hız isteyen kod', 'Web servisleri ve API yazmak'], a: 2,
      why: "Oyun motoru çekirdeği, işletim sistemi gibi ham hız gerektiren işlerde C, C++ ve Rust tercih edilir. Veri analizi, otomasyon ve web, Python'ın en güçlü olduğu alanlardır." },
    { t: 'code', id: 'python-nedir-3',
      q: "<p>Tek bir <code>print</code> çağrısı ile <code>Anadolu-Bank</code> yazdır. <code>\"Anadolu\"</code> ve <code>\"Bank\"</code> ayrı iki değer olarak verilsin; aralarına tire koymak için <code>sep</code> kullan. İkinci satırda ise <code>Toplam: 750</code> yazdır; 750 sayısını <code>3 * 250</code> çarpımıyla üret.</p>",
      start: 'print("Anadolu", "Bank")\nprint("Toplam:", 3 * 250)\n',
      sol: 'print("Anadolu", "Bank", sep="-")\nprint("Toplam:", 3 * 250)\n',
      expect: 'Anadolu-Bank\nToplam: 750\n',
      hints: ['sep="-" parametresi değerlerin arasına tire koyar.', 'İkinci print zaten doğru; ilkine sep ekle.'],
      why: 'sep, print içindeki değerlerin arasına konacak ayracı belirler; varsayılanı tek boşluktur.' },
    { t: 'mc', q: '<code>print("5" + "3")</code> ne yazdırır?',
      o: ['8', '53', 'Hata verir', '5 3'], a: 1,
      why: 'Tırnak içindeki 5 ve 3 metindir; + işareti metinleri uç uca ekler ve "53" çıkar. Sayı toplamak için tırnaksız 5 + 3 yazılır.' },
    { t: 'code', id: 'python-nedir-4',
      q: '<p>Anadolu Market\'te bir müşteri 4 adet 325 TL\'lik ürün aldı. Çarpımı Python\'a yaptırarak sadece sonucu yazdır (tırnak kullanma).</p>',
      start: '# 4 * 325 sonucunu yazdır\n',
      sol: 'print(4 * 325)\n',
      expect: '1300\n',
      hints: ['Tırnak dışına yazılan sayılarla hesap yapılır.', 'print(4 * 325)'],
      why: 'Tırnaksız yazılan 4 * 325 gerçekten çarpılır ve 1300 basılır.' }
  ],
  faq: [
    { q: "Python öğrenmek için matematik bilmem gerekir mi?", a: "Hayır. Dört işlem ve biraz mantık yeter. İleri seviyede istatistik ve makine öğrenmesi için matematik işe yarar ama dili öğrenmek için gerekmez." },
    { q: "Python 2 ile Python 3 arasındaki fark ne?", a: "Python 2 2020'de emekli oldu. Python 3, print'i fonksiyon yaptı, metinleri varsayılan olarak Unicode tuttu ve bölme gibi işlemleri daha tutarlı hâle getirdi. Bugün yalnızca Python 3 öğrenilir ve kullanılır." },
    { q: "Tarayıcıda çalışan Python gerçek Python mı?", a: "Evet. Pyodide adlı proje CPython 3.12'yi tarayıcıda çalıştırır. Yazdığın kod bilgisayarına kurduğun Python'da da aynı sonucu verir; yalnızca ağ erişimi ve bazı sistem işlemleri kısıtlıdır." }
  ],
  mistakes: [
    { bad: 'Print("Merhaba")', good: 'print("Merhaba")', why: 'Python büyük-küçük harfe duyarlıdır; Print diye bir fonksiyon yoktur.' },
    { bad: 'print(Merhaba)', good: 'print("Merhaba")', why: 'Tırnaksız Merhaba bir değişken adı sayılır ve tanımlı olmadığı için NameError alırsın.' },
    { bad: 'print "Merhaba"', good: 'print("Merhaba")', why: 'Parantezsiz yazım Python 2 söz dizimidir; Python 3 SyntaxError verir.' }
  ]
},

/* ───────────────────────── 2. kurulum-araclar ───────────────────────── */
{
  id: 'kurulum-araclar',
  lv: 'temel',
  mod: 'Başlangıç',
  min: 18,
  title: 'Kurulum ve araçlar',
  sum: "Python'ı ve VS Code'u kurar, terminalden sürümü kontrol eder, REPL ile betik çalıştırmayı ayırt eder ve sanal ortam kavramına ilk bakışı atarsın.",
  goals: [
    "python.org'dan Python 3.12'yi kurup terminalde sürümü doğrulayabilirim.",
    'VS Code ile bir .py dosyası oluşturup terminalden çalıştırabilirim.',
    'REPL ile betik çalıştırmanın farkını ve hangisini ne zaman kullanacağımı açıklayabilirim.',
    "Jupyter'ın ne işe yaradığını ve sanal ortamın neden gerektiğini özetleyebilirim."
  ],
  body: `
<h2>Neden kurulumu önemsiyoruz?</h2>
<p>Bu uygulamada kodu tarayıcıda çalıştırıyorsun ve bu, öğrenmek için yeterli. Ama iş hayatında Python, senin bilgisayarında ya da bir sunucuda bir betik (script) olarak çalışır: Ilgaz Bank'ın gece raporu bir sunucuda, Anadolu Market analistinin günlük özeti onun dizüstünde koşar. Bu derste o ortamı kuruyoruz. Kurulumu bir kez düzgün yaparsan sonraki aylarda saatlerce "neden çalışmıyor" sorusuyla uğraşmazsın.</p>

<h2>1. Python'ı kurmak</h2>
<p>Resmî kaynak <b>python.org</b>. İndirme sayfasından işletim sistemine uygun Python 3.12 kurulumunu al.</p>
<div class="steps-list"><ol>
<li><b>Windows:</b> Kurulum sihirbazının ilk ekranında "Add python.exe to PATH" kutusunu mutlaka işaretle. Bu kutu, terminalde <code>python</code> yazınca bilgisayarın Python'ı bulmasını sağlar.</li>
<li><b>macOS:</b> python.org paketini kur. Sistemle gelen eski Python'a dokunma; sen hep <code>python3</code> komutunu kullan.</li>
<li><b>Linux:</b> Çoğu dağıtımda Python zaten vardır. Yoksa paket yöneticisinden (apt, dnf) <code>python3</code> kur.</li>
</ol></div>
<p>Kurulum bittikten sonra bir terminal (Windows'ta PowerShell ya da Komut İstemi, macOS ve Linux'ta Terminal) aç ve şunu yaz:</p>
<pre class="out">python --version
Python 3.12.x</pre>
<p>Windows'ta <code>python</code>, macOS ve Linux'ta genelde <code>python3</code> çalışır. "Python 3.12" ile başlayan bir satır görüyorsan kurulum tamam. "command not found" ya da "tanınmıyor" diyorsa büyük ihtimalle PATH adımı atlanmıştır; kurulumu "Modify" ile tekrar aç ve kutuyu işaretle.</p>

<h2>2. Editör: VS Code</h2>
<p>Kodu Not Defteri'nde de yazabilirsin ama bir kod editörü (code editor) sana renklendirme, otomatik tamamlama ve hata altı çizme verir. En yaygın tercih ücretsiz <b>Visual Studio Code</b>. Kurduktan sonra sol taraftaki Extensions panelinden Microsoft'un <b>Python</b> eklentisini yükle. Bu eklenti, dosyanın sağ üstündeki "Run" düğmesini ve hata uyarılarını getirir.</p>
<div class="tip"><b>Klasör aç, dosya değil</b>VS Code'da "File &gt; Open Folder" ile projenin klasörünü aç. Editör, terminali o klasörde başlatır ve dosyalarını yan yana görürsün. Tek dosya açmak işleri karıştırır.</div>

<h2>3. İki çalışma biçimi: REPL ve betik</h2>
<p>Python'la iki şekilde konuşursun. Terminale sadece <code>python</code> yazıp Enter'a basarsan <b>REPL</b> açılır: Read-Eval-Print Loop, yani oku-hesapla-yazdır döngüsü. Başında <code>&gt;&gt;&gt;</code> olan satıra bir ifade yazarsın, Python hemen sonucunu gösterir. Deneme için mükemmel. Çıkmak için <code>exit()</code> yazarsın.</p>
<pre class="out">&gt;&gt;&gt; 3 * 250
750
&gt;&gt;&gt; "Anadolu" + " Market"
'Anadolu Market'</pre>
<p>Kalıcı bir iş için ise kodu bir dosyaya yazarsın: uzantısı <code>.py</code> olan düz bir metin dosyası. Örneğin <code>rapor.py</code> adıyla şu içeriği kaydet ve terminalde <code>python rapor.py</code> ile çalıştır. Aynı kodu burada da çalıştırabilirsin:</p>
<pre class="py">siparis_adedi = 3
birim_fiyat = 250
print("Haftalık özet")
print("Sipariş:", siparis_adedi)
print("Ciro:", siparis_adedi * birim_fiyat)</pre>
<p>Aradaki fark önemli: REPL'de her ifadenin değeri otomatik gösterilir, betikte ise sadece <code>print</code> ettiğin şey ekrana çıkar. Betikte <code>3 * 250</code> yazıp bırakırsan hiçbir şey görmezsin.</p>
<div class="tbl-wrap"><table>
<tr><th>Komut</th><th>Ne yapar</th></tr>
<tr><td><code>python --version</code></td><td>Kurulu sürümü gösterir</td></tr>
<tr><td><code>python</code></td><td>REPL'i açar (çıkış: <code>exit()</code>)</td></tr>
<tr><td><code>python rapor.py</code></td><td>rapor.py betiğini baştan sona çalıştırır</td></tr>
<tr><td><code>python -m venv .venv</code></td><td>Projeye özel sanal ortam oluşturur</td></tr>
<tr><td><code>pip install pandas</code></td><td>Bir paket kurar (sanal ortam etkinken)</td></tr>
</table></div>

<h2>4. Python'ın kendisine soru sormak</h2>
<p>Hangi sürümde çalıştığını kodla da öğrenebilirsin. <code>sys</code> modülü (module), yorumlayıcı hakkında bilgi taşır; <code>import</code> ile içe alırsın:</p>
<pre class="py">import sys
print(sys.version)
print("Ana sürüm:", sys.version_info.major)
print("Alt sürüm:", sys.version_info.minor)</pre>
<p>Modül kavramını ileride ayrıntılı göreceksin; şimdilik "başkasının hazırladığı araç kutusu" diye düşün. Üçüncü örnek, hazır gelen <code>platform</code> modülüyle sistem bilgisini çeker:</p>
<pre class="py">import platform
print("Python:", platform.python_version())
print("Uygulama:", platform.python_implementation())</pre>

<h2>İlk betiği adım adım çalıştırmak</h2>
<div class="steps-list"><ol>
<li>VS Code'da bir klasör aç (örneğin <code>pythonpatika</code>).</li>
<li>Yeni dosya oluştur, adını <code>merhaba.py</code> koy ve içine <code>print("Merhaba")</code> yaz, kaydet.</li>
<li>Üst menüden Terminal &gt; New Terminal ile editörün içinde bir terminal aç; terminal zaten klasörün içinde başlar.</li>
<li><code>python merhaba.py</code> (ya da <code>python3 merhaba.py</code>) yaz ve Enter'a bas.</li>
<li>Çıktıyı gör. Bir hata varsa son satırı oku; büyük ihtimalle dosya adı ya da yazım hatasıdır.</li>
</ol></div>
<p>Bu beş adım, önümüzdeki aylarda yüzlerce kez tekrarlayacağın döngüdür: yaz, kaydet, çalıştır, oku, düzelt. Editördeki Run düğmesi aynı komutu senin yerine yazar; ama terminal komutunu bilmek, düğmenin olmadığı sunucularda hayat kurtarır.</p>

<h2>5. Jupyter'a kısa bakış</h2>
<p>Veri analistleri genelde <b>Jupyter Notebook</b> kullanır: kod hücreleri, çıktılar ve açıklama metinleri tek bir belgede durur, her hücre tek tek çalıştırılır. Bir satır veri okuyup sonucunu hemen görmek için idealdir; VS Code da <code>.ipynb</code> dosyalarını açar. Betik yazmayı öğrendikten sonra Jupyter'a geçmek kolaydır; tersi daha zordur. Bu yüzden önce betik mantığını oturtuyoruz.</p>

<h2>6. Sanal ortam kavramına ön bakış</h2>
<p>Her proje farklı paketler ister: Anadolu Market raporu pandas'ın bir sürümünü, başka bir proje başka sürümünü. Hepsini aynı yere kurarsan birbirini bozar. <b>Sanal ortam</b> (virtual environment), projeye özel, izole bir Python kopyasıdır. <code>python -m venv .venv</code> ile oluşturur, etkinleştirir, paketleri oraya kurarsın. Orta seviyede bunu adım adım yapacağız; şimdilik "her projenin kendi çantası olur" fikri yeter.</p>
<div class="warn"><b>Paket kurmak için acele etme</b>İlk haftalarda hiçbir paket kurmana gerek yok. Standart kütüphane bu seviyedeki her şeyi karşılar. İnternette gördüğün her "pip install" komutunu hemen çalıştırma; önce ne kurduğunu anla.</div>
<div class="note"><b>Dosya adlarında Türkçe karakter</b>Betik dosyasına <code>rapor.py</code> gibi küçük harfli, boşluksuz, ASCII bir ad ver. <code>Haftalık Rapor.py</code> çalışır ama terminalde yazması ve paylaşması zahmetlidir.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Kurumsal bilgisayarda kurulum</h3>
<p>Şirket dizüstünde yönetici yetkisi olmayabilir. python.org kurulumu "Install for me only" seçeneğiyle yönetici istemeden kurulur. Bazı kurumlar Python'ı yazılım merkezinden dağıtır; önce oraya bak. Vekil sunucu (proxy) arkasındaysan pip paket indiremeyebilir; bu durumda BT ekibinden proxy ayarını iste, kendi başına çözüm aramaya çalışma.</p>
<h3>Birden fazla Python sürümü</h3>
<p>Bir süre sonra makinede birkaç Python olur: sistemle gelen, python.org'dan kurulan, belki bir de Anaconda. Hangisinin çalıştığını <code>python --version</code> ve Windows'ta <code>where python</code>, macOS ve Linux'ta <code>which python3</code> söyler. Karışıklığı önlemenin yolu yine sanal ortamdır: ortam etkinken <code>python</code> hep o projenin Python'ıdır.</p>
<h3>Editör alternatifleri</h3>
<p>PyCharm, Python'a özel güçlü bir editördür ve büyük projelerde tercih edilir. Jupyter Lab veri keşfi için, Thonny ise tamamen yeni başlayanlar için sadeleştirilmiştir. Hangisini seçersen seç, temel beceriler aynıdır: dosya oluştur, kaydet, terminalden çalıştır, hata mesajını oku.</p>
</section>
`,
  ex: [
    { t: 'mc', q: "Windows'ta Python kurarken \"Add python.exe to PATH\" kutusunu işaretlemezsen ne olur?",
      o: ['Python hiç kurulmaz', 'Terminalde python komutu bulunamaz', 'Sadece REPL çalışır, betik çalışmaz', 'pip kurulmaz'], a: 1,
      why: 'Python kurulur ama terminal onun yerini bilmez; python yazınca "tanınmıyor" hatası alırsın. PATH, komutların nerede arandığını söyleyen listedir.' },
    { t: 'code', id: 'kurulum-araclar-1',
      q: '<p><code>sys</code> modülünü içe aktar ve çalışan Python\'ın <b>ana sürüm numarasını</b> (<code>sys.version_info.major</code>) yazdır. Beklenen çıktı tek satır: <code>3</code></p>',
      start: 'import sys\n# ana sürümü yazdır\n',
      sol: 'import sys\nprint(sys.version_info.major)\n',
      expect: '3\n',
      hints: ['sys.version_info.major bir sayıdır; print ile yazdır.', 'print(sys.version_info.major)'],
      why: 'version_info, sürümü parçalara ayırmış bir nesnedir; major alanı 3 verir.' },
    { t: 'mc', q: 'REPL ile betik (.py dosyası) arasındaki temel fark nedir?',
      o: ['REPL yalnızca Windows\'ta çalışır', 'Betik dosyasında print kullanılamaz, yalnızca REPL\'de kullanılır', 'REPL her ifadenin değerini kendiliğinden gösterir', 'Betik daha yavaş çalışır'], a: 2,
      why: 'REPL etkileşimlidir ve her ifadenin sonucunu otomatik basar. Betikte yalnızca print çıktıları görünür; 3 * 250 yazıp bırakırsan hiçbir şey çıkmaz.' },
    { t: 'code', id: 'kurulum-araclar-2',
      q: '<p>Bir betik adı değişkeni tanımla: <code>dosya = "rapor.py"</code>. Sonra terminalde yazılacak komutu üret ve yazdır: çıktı tam olarak <code>python rapor.py</code> olmalı. Metni birleştirmek için <code>"python " + dosya</code> ya da print\'in virgülünü kullanabilirsin.</p>',
      start: 'dosya = "rapor.py"\n# komutu yazdır\n',
      sol: 'dosya = "rapor.py"\nprint("python", dosya)\n',
      expect: 'python rapor.py\n',
      hints: ['print("python", dosya) araya boşluk koyar.', 'Alternatif: print("python " + dosya)'],
      why: 'print virgülle ayrılan değerlerin arasına bir boşluk koyar; + ile birleştirirken boşluğu kendin eklersin.' },
    { t: 'mc', q: 'Sanal ortam (virtual environment) neden kullanılır?',
      o: ['Python\'ı daha hızlı çalıştırmak için', 'Her projenin paketlerini birbirinden izole tutmak için', 'Kodun internete çıkmasını engellemek için', 'VS Code\'un çalışması için zorunlu olduğundan'], a: 1,
      why: 'Sanal ortam projeye özel bir paket deposudur; farklı projelerin farklı sürüm ihtiyaçları birbirini bozmaz. Hız ya da güvenlikle ilgisi yoktur.' },
    { t: 'code', id: 'kurulum-araclar-3',
      q: '<p>Bir kurulum kontrol listesi yazdır. Üç değişken tanımla: <code>surum = "3.12"</code>, <code>editor = "VS Code"</code>, <code>komut = "python --version"</code>. Sonra tam olarak şu üç satırı üret:</p><pre class="out">Sürüm: 3.12\nEditör: VS Code\nKontrol: python --version</pre>',
      start: 'surum = "3.12"\neditor = "VS Code"\nkomut = "python --version"\n# üç satırı yazdır\n',
      sol: 'surum = "3.12"\neditor = "VS Code"\nkomut = "python --version"\nprint("Sürüm:", surum)\nprint("Editör:", editor)\nprint("Kontrol:", komut)\n',
      expect: 'Sürüm: 3.12\nEditör: VS Code\nKontrol: python --version\n',
      hints: ['Her satır için print("Etiket:", degisken) kalıbını kullan.', 'Değişken adlarını tırnaksız yaz ki değerleri basılsın.'],
      why: 'Değişkenler tırnaksız yazılınca değerleri basılır; print araya boşluğu kendisi koyar.' },
    { t: 'mc', q: 'Aşağıdaki dosya adlarından hangisi bir Python betiği için en uygundur?',
      o: ['Haftalık Rapor.py', 'rapor.txt', 'haftalik_rapor.py', 'rapor'], a: 2,
      why: 'Python betiği .py uzantısı taşımalı; küçük harf, boşluksuz ve ASCII ad terminalde yazmayı ve paylaşmayı kolaylaştırır.' }
  ],
  faq: [
    { q: "Terminalde python yazınca Microsoft Store açılıyor, ne yapmalıyım?", a: "Windows'un kısayol davranışı. Ya python.org kurulumunu PATH seçeneğiyle yeniden yap ya da Ayarlar > Uygulamalar > Uygulama yürütme diğer adları bölümünden python kısayollarını kapat." },
    { q: "Anaconda kurmalı mıyım?", a: "Veri bilimi için pandas, numpy ve Jupyter'ı tek pakette getirir, ama büyüktür ve kendi ortam sistemi vardır. Başlangıçta python.org kurulumu ve pip yeterli; Anaconda'ya ihtiyacın olursa ileride geçersin." },
    { q: "VS Code'da Run düğmesine basınca yanlış Python çalışıyor.", a: "Sağ alttaki yorumlayıcı seçiciye tıkla (ya da Ctrl+Shift+P > Python: Select Interpreter) ve 3.12 olanı seç. Sanal ortam kullanıyorsan .venv içindekini seçmelisin." }
  ],
  mistakes: [
    { bad: 'python rapor', good: 'python rapor.py', why: 'Betik çalıştırırken dosya adını uzantısıyla birlikte verirsin.' },
    { bad: '>>> python rapor.py', good: 'python rapor.py', why: 'REPL içindeyken (>>> görünürken) terminal komutu çalışmaz; önce exit() ile çık, sonra terminalde yaz.' },
    { bad: '3 * 250', good: 'print(3 * 250)', why: 'Betik dosyasında ifade tek başına ekrana yazılmaz; REPL dışında print gerekir.' }
  ]
},

/* ───────────────────────── 3. ilk-program ───────────────────────── */
{
  id: 'ilk-program',
  lv: 'temel',
  mod: 'Başlangıç',
  min: 20,
  title: 'İlk program: print, yorum, input',
  sum: 'print ile biçimli çıktı üretir, koda yorum eklersin, input ile kullanıcıdan veri alır ve ilk hata mesajını okumayı öğrenirsin.',
  goals: [
    'print ile birden fazla değeri, sep ve end seçenekleriyle düzenli yazdırabilirim.',
    'Koda tek satırlık ve çok satırlı açıklama ekleyebilirim.',
    'input ile girdi alıp metni sayıya çevirerek hesap yapabilirim.',
    'Bir hata mesajını (traceback) okuyup hatanın hangi satırda olduğunu bulabilirim.'
  ],
  body: `
<h2>Küçük ama gerçek bir program</h2>
<p>Bir program, birbiri ardına çalışan satırlardan oluşur. Bu derste üç temel yapı taşını öğreneceksin: ekrana yazmak (<code>print</code>), kodu açıklamak (yorum) ve dışarıdan veri almak (<code>input</code>). Sonunda da her programcının günlük ekmeği olan hata mesajını okumayı. Senaryo: Ilgaz Bank'ın şubesinde çalışan bir görevli, müşterinin adını ve hesaba yatırdığı tutarı alıp bir makbuz yazdıran küçük bir program istiyor.</p>

<h2>print'i daha iyi tanımak</h2>
<p><code>print</code> birden fazla değeri virgülle alır, aralarına boşluk koyar ve sonunda satır atlar. İki küçük ayar bunu değiştirir: <code>sep</code> (separator, ayraç) değerlerin arasına, <code>end</code> ise satırın sonuna ne konacağını belirler.</p>
<pre class="py">print("Müşteri", "Ayşe Yılmaz")
print("Tarih", "2025", "03", "14", sep="/")
print("Tutar:", end=" ")
print(1500, "TL")
print("-" * 20)</pre>
<p>Üçüncü satırda <code>end=" "</code> sayesinde satır sonu yerine boşluk konur; dördüncü print aynı satıra devam eder. Son satırdaki <code>"-" * 20</code> ise bir metni 20 kez tekrarlar; makbuzlara çizgi çekmek için pratik bir yoldur.</p>
<div class="tip"><b>Boş satır</b>Parantezi boş bırakırsan, <code>print()</code>, sadece satır atlar. Çıktıyı bölümlere ayırmak için kullanışlıdır.</div>

<h2>Yorumlar: kendine ve ekibine not</h2>
<p><code>#</code> işaretinden satır sonuna kadar olan her şey yorumdur (comment); Python onu görmezden gelir. Yorum, "ne" yaptığını değil "neden" yaptığını anlatmalı. Kod zaten ne yaptığını gösterir.</p>
<pre class="py"># Makbuz başlığı; şube yöneticisi bu biçimi istedi
print("ILGAZ BANK - MAKBUZ")
tutar = 1500  # TL cinsinden, kuruş yok
print("Yatırılan:", tutar)
# print("Bu satır çalışmaz, yorum hâline getirildi")</pre>
<p>Son satırdaki gibi bir kod satırını geçici olarak kapatmaya "yoruma almak" denir; hata ararken çok kullanılır. Üç tırnaklı metinler (<code>"""..."""</code>) ise çok satırlı açıklama için kullanılır; bunları fonksiyon derslerinde belge dizgisi (docstring) olarak tekrar göreceksin.</p>
<div class="tbl-wrap"><table>
<tr><th>Yorum türü</th><th>Yazım</th><th>Ne zaman</th></tr>
<tr><td>Satır yorumu</td><td><code># açıklama</code></td><td>Kısa not, bir satırı kapatmak</td></tr>
<tr><td>Satır sonu yorumu</td><td><code>x = 5  # neden 5</code></td><td>Tek bir değeri açıklamak</td></tr>
<tr><td>Belge dizgisi</td><td><code>"""Açıklama"""</code></td><td>Fonksiyon ve modül başında</td></tr>
</table></div>

<h2>input: kullanıcıdan veri almak</h2>
<p><code>input</code>, ekrana bir soru yazar, kullanıcı bir şey yazıp Enter'a basana kadar bekler ve yazılanı <b>metin olarak</b> döndürür. Bu "metin olarak" kısmı çok önemli: kullanıcı 1500 yazsa bile elinde <code>"1500"</code> diye bir metin olur, sayı değil.</p>
<pre class="py">ad = input("Müşteri adı: ")
tutar_metin = input("Yatırılan tutar: ")
tutar = int(tutar_metin)      # metni tam sayıya çevir
print("Sayın", ad, "hesabınıza", tutar, "TL yatırıldı.")
print("Yeni bakiye tahmini:", tutar + 250)</pre>
<p>Bu kutuda motor, <code>input</code> çağrılarına hazır örnek değerler verir; kendi bilgisayarında ise klavyeden girersin. <code>int()</code> metni tam sayıya, <code>float()</code> ondalıklı sayıya çevirir. Çevirmeyi unutursan <code>tutar + 250</code> satırı hata verir çünkü metinle sayı toplanamaz.</p>
<div class="warn"><b>input her zaman metin döndürür</b><code>"1500" + 250</code> yazmak TypeError üretir. Sayı olarak kullanacağın her girdiyi <code>int()</code> ya da <code>float()</code> ile çevir. Kullanıcı "abc" yazarsa çevirme de hata verir; bunu Hatalar dersinde yakalamayı öğreneceksin.</div>

<h2>Hata mesajı okumak</h2>
<p>Her programcı her gün hata görür; fark, mesajı okuyabilmekte. Python hata verince bir <b>traceback</b> (izleme) basar. Şu kodu çalıştır ve mesaja bak:</p>
<pre class="py">print("Makbuz hazırlanıyor")
print("Toplam:", toplam)</pre>
<p>Çıktının sonunda şuna benzer bir satır göreceksin: <code>NameError: name 'toplam' is not defined</code>. Okuma kuralı şöyle:</p>
<div class="steps-list"><ol>
<li><b>En alt satıra bak:</b> Hatanın türü ve açıklaması oradadır. NameError, "bu ada sahip bir şey tanımlı değil" demektir.</li>
<li><b>Bir üstteki "line N" ifadesini bul:</b> Hatanın hangi satırda çıktığını söyler.</li>
<li><b>Hatadan önce ne basıldığına bak:</b> "Makbuz hazırlanıyor" çıktıysa ilk satır çalışmış, sorun ikinci satırda.</li>
</ol></div>
<p>En sık göreceğin üç tür: <b>NameError</b> (tanımsız ad, genelde yazım hatası), <b>SyntaxError</b> (eksik parantez ya da tırnak; Python daha kodu çalıştırmadan yakalar) ve <b>TypeError</b> (uyumsuz türler, örneğin metinle sayıyı toplamak).</p>
<div class="note"><b>Hata, başarısızlık değildir</b>Hata mesajı, Python'ın sana verdiği en dürüst geri bildirimdir. Mesajı okuma alışkanlığı, kod yazmaktan daha değerli bir beceridir; deneyimli geliştiriciyi ayıran şey hata görmemesi değil, mesajı iki saniyede çözmesidir.</div>

<h2>input ile küçük bir hesap</h2>
<p>Girdi almayı hesapla birleştirince program artık her çalıştırmada farklı sonuç üretebilir. Aşağıdaki örnekte Anadolu Market kasiyeri adet ve birim fiyatı giriyor; program toplamı ve KDV dahil tutarı yazıyor. Motor, bu kutuda input çağrılarına örnek değerler verecek.</p>
<pre class="py">adet = int(input("Adet: "))
birim = float(input("Birim fiyat: "))
ara_toplam = adet * birim
print("Ara toplam:", ara_toplam)
print("KDV dahil:", ara_toplam * 1.2)</pre>
<p>İki dönüşüme dikkat et: adet tam sayı olduğundan <code>int</code>, fiyat ondalıklı olabileceğinden <code>float</code>. Yanlış seçersen ya hata alırsın ("3.5" int olmaz) ya da gereksiz ondalık görürsün. Girdiyi hangi türe çevireceğine, o değeri ne için kullanacağına bakarak karar ver.</p>

<h2>Hepsini birleştirelim</h2>
<pre class="py"># Ilgaz Bank şube makbuzu
print("=" * 28)
print("ILGAZ BANK - MAKBUZ")
print("=" * 28)
musteri = "Mehmet Kaya"
tutar = 2750
komisyon = 5
print("Müşteri :", musteri)
print("İşlem   : Para yatırma")
print("Tutar   :", tutar, "TL")
print("Komisyon:", komisyon, "TL")
print("Net     :", tutar - komisyon, "TL")
print("=" * 28)</pre>
<p>Dikkat et: değişken adları (<code>musteri</code>, <code>tutar</code>) tırnaksız, etiketler tırnaklı. Değişkenleri bir sonraki derste derinlemesine ele alacağız.</p>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Gerçek programlarda input nerede?</h3>
<p>Şaşırtıcı gelebilir ama iş yazılımlarında <code>input</code> nadiren kullanılır. Veri klavyeden değil dosyadan, veritabanından, bir web formundan ya da komut satırı argümanlarından gelir. <code>input</code>, öğrenirken ve küçük araçlar yazarken işe yarar; "girdi metin gelir, sen çevirirsin" kuralı ise her kaynak için geçerlidir. CSV'den okuduğun tutar da metindir, web formundan gelen yaş da.</p>
<h3>Çıktıyı dosyaya yönlendirmek</h3>
<p>Terminalde <code>python makbuz.py &gt; makbuz.txt</code> yazarsan print çıktıları ekrana değil dosyaya gider. Bu, hiçbir kod değişikliği gerektirmeyen en basit rapor üretme yoludur ve sunucularda çok kullanılır. print'in kendisi de <code>file=</code> parametresiyle doğrudan bir dosyaya yazabilir; Dosya İşlemleri dersinde göreceksin.</p>
<h3>Yorum kültürü</h3>
<p>Kurumsal kodda yorum az ama yerinde olur. İyi yorum, bir iş kuralını açıklar: "Komisyon, şube yönetmeliği gereği 5 TL sabit." Kötü yorum, kodu tekrar eder: "tutardan 5 çıkar." Kodun kendisi anlaşılır değilse çözüm yorum eklemek değil, değişken adlarını düzeltmektir.</p>
</section>
`,
  ex: [
    { t: 'code', id: 'ilk-program-1',
      q: '<p>Kullanıcıdan adını <code>input()</code> ile al ve <code>ad</code> değişkenine koy. Sonra <code>mesaj</code> adlı bir değişkende <code>Merhaba, Ayşe!</code> biçiminde selamlama metni oluştur (ad yerine girilen ad gelecek) ve yazdır. Test girdisi olarak <code>Ayşe</code> verilecek.</p>',
      start: 'ad = input("Adınız: ")\n# mesaj değişkenini oluştur ve yazdır\n',
      sol: 'ad = input("Adınız: ")\nmesaj = "Merhaba, " + ad + "!"\nprint(mesaj)\n',
      tests: 'assert ad == "Ayşe", "ad değişkeni girilen adı tutmalı"\nassert mesaj == "Merhaba, Ayşe!", "mesaj tam olarak Merhaba, Ayşe! olmalı"\n',
      stdin: ['Ayşe'],
      hints: ['Metinleri + ile birleştir: "Merhaba, " + ad + "!"', 'Virgülden sonra bir boşluk olduğuna dikkat et.'],
      why: 'input metni döndürür; + ile sabit metinlerle birleştirip mesaj değişkenine atıyoruz.' },
    { t: 'mc', q: '<code>input()</code> fonksiyonu kullanıcı <code>42</code> yazdığında ne döndürür?',
      o: ['42 tam sayısı', '"42" metni', '42.0 ondalıklı sayısı', 'Kullanıcının yazdığına göre tür değişir'], a: 1,
      why: 'input her zaman metin (str) döndürür. Sayı olarak kullanmak için int() ya da float() ile çevirmen gerekir.' },
    { t: 'code', id: 'ilk-program-2',
      q: '<p>Ilgaz Bank görevlisi iki tutar girecek. İki <code>input()</code> ile değerleri al, <code>int()</code> ile sayıya çevir ve toplamlarını <code>toplam</code> değişkenine koy; sonra yazdır. Test girdileri sırasıyla <code>1500</code> ve <code>250</code>.</p>',
      start: 'ilk = input("İlk tutar: ")\nikinci = input("İkinci tutar: ")\n# sayıya çevir ve topla\n',
      sol: 'ilk = input("İlk tutar: ")\nikinci = input("İkinci tutar: ")\ntoplam = int(ilk) + int(ikinci)\nprint("Toplam:", toplam)\n',
      tests: 'assert toplam == 1750, "toplam 1750 olmalı; girdileri int ile çevirdin mi?"\nassert isinstance(toplam, int), "toplam bir tam sayı (int) olmalı"\n',
      stdin: ['1500', '250'],
      hints: ['int(ilk) metni tam sayıya çevirir.', 'toplam = int(ilk) + int(ikinci)'],
      why: 'Çevirmeden toplarsan "1500250" metni çıkar; int() ile gerçek toplama yapılır.' },
    { t: 'code', id: 'ilk-program-3',
      q: '<p>Aşağıdaki kodda bir satır yanlışlıkla çalışıyor ve bir satır da yorum olarak kalmış. Düzelt: <code>Taslak</code> yazan satırı yoruma al, <code>Toplam: 1300</code> yazan satırın yorumunu kaldır. Beklenen çıktı iki satır: <code>Makbuz</code> ve <code>Toplam: 1300</code>.</p>',
      start: 'print("Makbuz")\nprint("Taslak")\n# print("Toplam:", 4 * 325)\n',
      sol: 'print("Makbuz")\n# print("Taslak")\nprint("Toplam:", 4 * 325)\n',
      expect: 'Makbuz\nToplam: 1300\n',
      hints: ['Satır başına # koymak o satırı kapatır.', 'Üçüncü satırın başındaki # işaretini sil.'],
      why: 'Yorum işareti satırı devre dışı bırakır; kaldırınca satır yeniden çalışır.' },
    { t: 'mc', q: 'Şu hata mesajını alıyorsun: <code>NameError: name \'tutr\' is not defined</code>. En olası sebep nedir?',
      o: ['Python kurulumu bozuk', 'Değişken adı yanlış yazılmış ya da hiç tanımlanmamış', 'Parantez eksik', 'Bir metin ile bir sayı + işaretiyle toplanmaya çalışılmış'], a: 1,
      why: 'NameError, kullanılan adın tanımlı olmadığını söyler; burada tutar yerine tutr yazılmış. Parantez eksikliği SyntaxError, tür uyumsuzluğu TypeError verir.' },
    { t: 'code', id: 'ilk-program-4',
      q: '<p>Tek satırlık bir tarih yazdır: <code>print</code> içine <code>"14"</code>, <code>"03"</code>, <code>"2025"</code> değerlerini ver ve <code>sep</code> ile aralarına nokta koy. Çıktı: <code>14.03.2025</code>. Ardından ikinci bir print ile <code>Bitti</code> yaz.</p>',
      start: 'print("14", "03", "2025")\nprint("Bitti")\n',
      sol: 'print("14", "03", "2025", sep=".")\nprint("Bitti")\n',
      expect: '14.03.2025\nBitti\n',
      hints: ['sep="." parametresini ekle.'],
      why: 'sep, print içindeki değerlerin arasına konacak metni belirler.' },
    { t: 'mc', q: 'Aşağıdaki hangi satır <b>SyntaxError</b> üretir?',
      o: ['print("Merhaba"', 'print(toplam)', 'print("5" + 5)', 'print(5 / 0)'], a: 0,
      why: 'Kapanmayan parantez, kod daha çalışmadan SyntaxError verir. Diğerleri çalışma anında NameError, TypeError ve ZeroDivisionError üretir.' }
  ],
  faq: [
    { q: "input ile aldığım sayıyı neden hemen kullanamıyorum?", a: "Çünkü input metin döndürür. \"1500\" ile 250 toplanamaz. int(\"1500\") ile çevirdiğinde 1500 sayısını elde eder ve hesap yapabilirsin." },
    { q: "Yorumları çok mu yazmalıyım?", a: "Hayır. Kodun neden öyle olduğunu açıklayan kısa yorumlar yeter. Kodun ne yaptığını tekrar eden yorum gürültüdür; onun yerine değişken adlarını açıklayıcı seç." },
    { q: "Hata mesajı İngilizce, nasıl anlayacağım?", a: "En alt satırdaki hata adına ve iki nokta sonrasındaki kısa açıklamaya bak. NameError, TypeError, SyntaxError gibi birkaç ad tüm hataların büyük çoğunluğunu oluşturur; bunları tanımak yeterli." }
  ],
  mistakes: [
    { bad: 'tutar = input("Tutar: ")\nprint(tutar + 250)', good: 'tutar = int(input("Tutar: "))\nprint(tutar + 250)', why: 'input metin döndürür; sayıyla toplamak için int() ile çevirmen gerekir.' },
    { bad: 'print("Toplam: " + 1300)', good: 'print("Toplam:", 1300)', why: 'Metinle sayı + ile birleştirilemez (TypeError). Virgül kullan ya da str(1300) yaz.' },
    { bad: 'print("Makbuz)', good: 'print("Makbuz")', why: 'Kapanmayan tırnak SyntaxError verir; tırnak ve parantezler çift olmalı.' }
  ]
},
/* ───────────────────────── 4. degiskenler ───────────────────────── */
{
  id: 'degiskenler',
  lv: 'temel',
  mod: 'Veri Türleri',
  min: 22,
  title: 'Değişkenler ve veri türleri',
  sum: 'int, float, str, bool ve None türlerini tanır; type() ile türü sorgular, dönüşüm yapar ve doğru adlandırma kurallarıyla değişken tanımlarsın.',
  goals: [
    'Değişken tanımlayıp değerini değiştirebilir, atamanın nasıl çalıştığını açıklayabilirim.',
    'int, float, str, bool ve None türlerini ayırt edip type() ile sorgulayabilirim.',
    'int(), float(), str() ve bool() ile türler arasında dönüşüm yapabilirim.',
    'PEP 8 adlandırma kurallarına uygun, anlamlı değişken adları seçebilirim.',
    "Dinamik tiplemenin ne olduğunu ve hangi hatalara yol açabileceğini anlatabilirim."
  ],
  body: `
<h2>Değişken: değere takılan etiket</h2>
<p>Anadolu Market'in sipariş sisteminde bir siparişin tutarı, müşterinin adı, kargonun teslim edilip edilmediği gibi bilgileri saklamak gerekir. Python'da bu bilgiler <b>değişkenlerde</b> (variable) tutulur. Değişken, bir değere taktığın etikettir: <code>tutar = 1500</code> dediğinde Python bellekte 1500 değerini oluşturur ve ona <code>tutar</code> etiketini yapıştırır.</p>
<pre class="py">tutar = 1500
musteri = "Ayşe Yılmaz"
print(musteri, "için tutar:", tutar)
tutar = tutar + 250      # etiketi yeni değere taşı
print("Güncel tutar:", tutar)</pre>
<p>Eşittir işareti matematikteki "eşittir" değil, <b>atama</b> (assignment) işlemidir: sağdaki hesaplanır, soldaki ada bağlanır. Bu yüzden <code>tutar = tutar + 250</code> gayet mantıklıdır: önce sağdaki toplanır (1750), sonra etiket oraya taşınır. Aynı satırda birden fazla değişkene atama da yapabilirsin: <code>ad, yas = "Ali", 30</code>.</p>

<h2>Beş temel tür</h2>
<p>Her değerin bir <b>türü</b> (type) vardır ve tür, o değerle ne yapılabileceğini belirler. <code>type()</code> fonksiyonu türü söyler:</p>
<pre class="py">siparis_no = 10452            # int: tam sayı
tutar = 1499.90               # float: ondalıklı sayı
sehir = "İzmir"               # str: metin
teslim_edildi = False         # bool: True ya da False
iade_tarihi = None            # None: henüz değer yok
print(type(siparis_no), type(tutar))
print(type(sehir), type(teslim_edildi), type(iade_tarihi))</pre>
<div class="tbl-wrap"><table>
<tr><th>Tür</th><th>Adı</th><th>Örnek</th><th>Ne için</th></tr>
<tr><td><code>int</code></td><td>tam sayı (integer)</td><td><code>42</code>, <code>-7</code>, <code>0</code></td><td>Adet, sipariş numarası, yıl</td></tr>
<tr><td><code>float</code></td><td>kayan noktalı sayı</td><td><code>3.14</code>, <code>1499.90</code></td><td>Tutar, oran, ölçüm</td></tr>
<tr><td><code>str</code></td><td>metin (string)</td><td><code>"İzmir"</code>, <code>'A'</code></td><td>Ad, adres, kod</td></tr>
<tr><td><code>bool</code></td><td>mantıksal (boolean)</td><td><code>True</code>, <code>False</code></td><td>Evet/hayır durumları</td></tr>
<tr><td><code>NoneType</code></td><td>yokluk</td><td><code>None</code></td><td>"Henüz bilinmiyor"</td></tr>
</table></div>
<p>Birkaç ayrıntı: Python'da tam sayıların üst sınırı yoktur, bankanın toplam mevduatını bile <code>int</code> tutar. Ondalık ayracı her zaman noktadır (<code>1499.90</code>), virgül değil. <code>True</code> ve <code>False</code> büyük harfle başlar. <code>None</code> ise "boş" ya da "henüz atanmadı" anlamına gelen özel bir değerdir; iade edilmemiş bir siparişin iade tarihi <code>None</code>'dır.</p>
<div class="note"><b>bool aslında bir sayıdır</b><code>True</code> 1, <code>False</code> 0 gibi davranır: <code>True + True</code> 2 verir. Bu, bir listede kaç koşulun sağlandığını saymak için ileride işine yarayacak.</div>

<h2>Tür dönüşümü</h2>
<p>Veri çoğu zaman yanlış türde gelir: CSV dosyasından okunan tutar metindir, formdan gelen yaş metindir. Dönüşüm (conversion) fonksiyonları türü değiştirir:</p>
<pre class="py">metin_tutar = "1499.90"
tutar = float(metin_tutar)
print(tutar + 100)              # artık hesap yapılabilir
adet = int("3")
print(adet * tutar)
etiket = "Adet: " + str(adet)   # sayıyı metne çevirip birleştir
print(etiket)
print(int(7.99), float(5))      # 7 ve 5.0</pre>
<p>Dikkat: <code>int(7.99)</code> yuvarlamaz, ondalık kısmı atar ve 7 verir. <code>int("7.99")</code> ise hata verir; metin önce <code>float</code> olmalı. <code>bool()</code> dönüşümünün de bir kuralı vardır: 0, boş metin <code>""</code> ve <code>None</code> False'a, geri kalan her şey True'ya dönüşür.</p>
<pre class="py">print(bool(0), bool(1500), bool(""), bool("İzmir"), bool(None))</pre>
<div class="warn"><b>Metin sayı değildir</b><code>"1500" + 250</code> TypeError verir, <code>"1500" * 2</code> ise <code>"15001500"</code> üretir. İkincisi hata vermediği için daha tehlikelidir; raporda tutarın iki kere yan yana yazıldığını görürsün. Sayı olarak kullanacağın her metni önce çevir.</div>

<h2>Adlandırma kuralları</h2>
<p>Python'ın zorunlu kuralları az: ad harf ya da alt çizgiyle başlar, rakam içerebilir ama rakamla başlayamaz, boşluk ve tire içeremez, <code>if</code>, <code>for</code>, <code>class</code> gibi anahtar sözcükler (keyword) ad olamaz. Türkçe karakter teknik olarak çalışır ama kurumsal kodda kullanılmaz. Geri kalanı stil rehberi <b>PEP 8</b>'den gelir:</p>
<ul>
<li><b>snake_case:</b> küçük harf, kelimeler alt çizgiyle: <code>toplam_tutar</code>, <code>musteri_adi</code>.</li>
<li><b>Anlamlı ad:</b> <code>t</code> yerine <code>tutar</code>, <code>x1</code> yerine <code>siparis_adedi</code>. Üç ay sonra kodu okuyan sen olacaksın.</li>
<li><b>Sabitler BÜYÜK_HARF:</b> değişmeyecek değerler için: <code>KDV_ORANI = 0.20</code>. Python bunu zorlamaz, ekip arkadaşlarına mesajdır.</li>
<li><b>Hazır adları gölgeleme:</b> <code>print</code>, <code>list</code>, <code>sum</code>, <code>type</code> gibi adlara değer atama; o fonksiyonu kaybedersin.</li>
</ul>
<pre class="py">KDV_ORANI = 0.20
urun_fiyati = 1250
kdv_tutari = urun_fiyati * KDV_ORANI
print("KDV:", kdv_tutari)
print("KDV dahil:", urun_fiyati + kdv_tutari)</pre>
<div class="tip"><b>Ad seçerken soru sor</b>"Bu değişkenin içinde ne var?" sorusunun cevabı adın kendisi olmalı. <code>veri</code> ya da <code>deger</code> gibi genel adlar hiçbir şey anlatmaz; <code>aylik_ciro</code> anlatır.</div>

<h2>Birden fazla değişkenle küçük bir rapor</h2>
<p>Türleri ve adlandırmayı öğrendin; şimdi hepsini bir sipariş özetinde birleştir. Her değişkenin türünün görevine uyduğuna dikkat et: adet için <code>int</code>, fiyat için <code>float</code>, durum için <code>bool</code>, henüz bilinmeyen kargo numarası için <code>None</code>.</p>
<pre class="py">siparis_no = 10452
musteri_adi = "Ayşe Yılmaz"
adet = 3
birim_fiyat = 1499.9
odendi = True
kargo_no = None
toplam = adet * birim_fiyat
print("Sipariş", siparis_no, "-", musteri_adi)
print("Toplam:", round(toplam, 2), "TL")
print("Ödendi mi?", odendi)
print("Kargo numarası:", kargo_no)
print("Kargo verildi mi?", kargo_no is not None)</pre>
<p>Son satır küçük ama kıymetli bir kalıp: bir alanın dolu olup olmadığını <code>is not None</code> ile sorarsın. Kargo numarası geldiğinde değişkene gerçek değeri atayacak ve aynı satır <code>True</code> verecek.</p>

<h2>Dinamik tipleme</h2>
<p>Python'da değişkenin türü yoktur, değerin türü vardır. Aynı etiket önce bir sayıya, sonra bir metne takılabilir; buna <b>dinamik tipleme</b> (dynamic typing) denir:</p>
<pre class="py">deger = 42
print(type(deger))
deger = "kırk iki"
print(type(deger))
deger = None
print(type(deger), deger is None)</pre>
<p>Bu esneklik hızlı yazdırır ama bir bedeli var: Python, <code>tutar</code> değişkenine yanlışlıkla metin atadığını sana söylemez; hata ancak o değişkenle hesap yapmaya çalıştığında çıkar. İki alışkanlık bunu yönetir: bir değişkene hep aynı türde değer koymak ve belirsiz durumda <code>type()</code> ya da <code>isinstance()</code> ile kontrol etmek. Son satırdaki <code>is None</code> ise bir değerin None olup olmadığını sormanın doğru yoludur.</p>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Tip ipuçları: dinamik dilde belgeleme</h3>
<p>Python 3'te değişkene beklenen türü yazabilirsin: <code>tutar: float = 1499.90</code>. Buna tip ipucu (type hint) denir. Python bunu çalışırken denetlemez; ama VS Code ve mypy gibi araçlar okur, yanlış türde atama yapınca altını çizer. Kurumsal projelerde fonksiyon imzalarında neredeyse standarttır; Orta seviyede ayrıntılı göreceksin.</p>
<h3>Para için float mı?</h3>
<p>Bankacılıkta kuruş hatası kabul edilmez ve <code>float</code> bazı ondalıkları tam temsil edemez (bir sonraki derste göreceksin). Finans yazılımları ya tutarı kuruş cinsinden <code>int</code> tutar (1499.90 TL yerine 149990 kuruş) ya da <code>decimal</code> modülünü kullanır. Raporlama ve analizde <code>float</code> yeterlidir; muhasebe kaydında değildir.</p>
<h3>Değişken aslında neye işaret eder?</h3>
<p>Python'da her değer bellekte bir nesnedir (object) ve değişken ona bir referanstır. <code>a = b</code> dediğinde değer kopyalanmaz, ikinci bir etiket aynı nesneye takılır. Sayı ve metinler değiştirilemez olduğundan bunu fark etmezsin; ama liste gibi değiştirilebilir nesnelerde bu "kopyalama tuzağı"na dönüşür. Listeler dersinde başına gelmeden önce burada duymuş ol.</p>
</section>
`,
  ex: [
    { t: 'code', id: 'degiskenler-1',
      q: '<p>Anadolu Market\'teki bir sipariş için dört değişken tanımla: <code>siparis_no = 10452</code> (int), <code>tutar = 1499.9</code> (float), <code>sehir = "İzmir"</code> (str) ve <code>teslim_edildi = False</code> (bool). Ardından her birinin türünü ayrı bir satırda <code>print(type(...))</code> ile yazdır.</p>',
      start: '# dört değişkeni tanımla\n\n# türlerini yazdır\n',
      sol: 'siparis_no = 10452\ntutar = 1499.9\nsehir = "İzmir"\nteslim_edildi = False\nprint(type(siparis_no))\nprint(type(tutar))\nprint(type(sehir))\nprint(type(teslim_edildi))\n',
      tests: 'assert siparis_no == 10452 and isinstance(siparis_no, int), "siparis_no int olmalı"\nassert abs(tutar - 1499.9) < 1e-9 and isinstance(tutar, float), "tutar float olmalı"\nassert sehir == "İzmir", "sehir İzmir olmalı"\nassert teslim_edildi is False, "teslim_edildi False olmalı"\n',
      expect: "<class 'int'>\n<class 'float'>\n<class 'str'>\n<class 'bool'>\n",
      hints: ['Ondalık ayracı nokta: 1499.9', 'False büyük harfle başlar ve tırnaksızdır.'],
      why: 'Her değerin türü yazım biçiminden belirlenir: tırnak str, nokta float, True/False bool.' },
    { t: 'mc', q: '<code>int("7.5")</code> ifadesi ne yapar?',
      o: ['7 döndürür', '8 döndürür', 'ValueError verir', '7.5 döndürür'], a: 2,
      why: 'int() ondalıklı bir metni doğrudan çeviremez ve ValueError üretir. Önce float("7.5") sonra int() gerekir; o zaman 7 çıkar.' },
    { t: 'code', id: 'degiskenler-2',
      q: '<p>CSV\'den okunmuş gibi iki metin değer var: <code>adet_metin = "3"</code> ve <code>fiyat_metin = "1499.90"</code>. Bunları uygun türe çevirip <code>toplam</code> değişkeninde çarpımlarını hesapla (3 adet × 1499.90). Sonra <code>etiket</code> adlı değişkende <code>"Toplam: " + str(toplam)</code> biçiminde bir metin oluştur.</p>',
      start: 'adet_metin = "3"\nfiyat_metin = "1499.90"\n# çevir, çarp, etiket oluştur\n',
      sol: 'adet_metin = "3"\nfiyat_metin = "1499.90"\nadet = int(adet_metin)\nfiyat = float(fiyat_metin)\ntoplam = adet * fiyat\netiket = "Toplam: " + str(toplam)\nprint(etiket)\n',
      tests: 'assert abs(toplam - 4499.7) < 1e-6, "toplam 4499.7 olmalı"\nassert isinstance(toplam, float), "toplam float olmalı"\nassert etiket.startswith("Toplam: 4499.7"), "etiket Toplam: 4499.7 ile başlamalı"\n',
      hints: ['adet için int(), fiyat için float() kullan.', 'Sayıyı metinle birleştirmek için str(toplam).'],
      why: 'Metin değerler sayıya çevrilmeden çarpılamaz; sonucu metinle birleştirmek için de str() gerekir.' },
    { t: 'mc', q: 'Aşağıdaki değişken adlarından hangisi PEP 8\'e uygun ve anlamlıdır?',
      o: ['toplamTutar', '2_tutar', 'toplam_tutar', 'x'], a: 2,
      why: 'PEP 8 değişkenler için snake_case ister. toplamTutar camelCase, 2_tutar rakamla başladığı için geçersiz, x ise anlamsız.' },
    { t: 'code', id: 'degiskenler-3',
      q: '<p>Bir KDV hesabı yap. <code>KDV_ORANI = 0.20</code> sabitini ve <code>fiyat = 1250</code> değişkenini tanımla. <code>kdv</code> değişkeninde KDV tutarını, <code>kdv_dahil</code> değişkeninde KDV dahil fiyatı hesapla ve her ikisini de yazdır.</p>',
      start: 'KDV_ORANI = 0.20\nfiyat = 1250\n# kdv ve kdv_dahil hesapla\n',
      sol: 'KDV_ORANI = 0.20\nfiyat = 1250\nkdv = fiyat * KDV_ORANI\nkdv_dahil = fiyat + kdv\nprint("KDV:", kdv)\nprint("KDV dahil:", kdv_dahil)\n',
      tests: 'assert abs(kdv - 250.0) < 1e-6, "kdv 250.0 olmalı"\nassert abs(kdv_dahil - 1500.0) < 1e-6, "kdv_dahil 1500.0 olmalı"\n',
      hints: ['kdv = fiyat * KDV_ORANI', 'kdv_dahil = fiyat + kdv'],
      why: 'Sabit büyük harfle yazılır; hesaplar iki ayrı değişkene konunca rapor satırları okunur olur.' },
    { t: 'mc', q: 'Hangi değer <code>bool()</code> ile <b>True</b>\'ya dönüşür?',
      o: ['0', '""', 'None', '"0"'], a: 3,
      why: '"0" boş olmayan bir metindir, bu yüzden True olur. 0 sayısı, boş metin ve None ise False\'a dönüşür.' },
    { t: 'code', id: 'degiskenler-4',
      q: '<p>Dinamik tiplemeyi göster. <code>deger</code> değişkenine önce <code>100</code> ata ve türünü yazdır, sonra <code>"yüz"</code> ata ve türünü yazdır, en son <code>None</code> ata ve türünü yazdır. Çıktı üç satır olmalı.</p>',
      start: 'deger = 100\n# türünü yazdır, sonra yeni değerler ata\n',
      sol: 'deger = 100\nprint(type(deger))\ndeger = "yüz"\nprint(type(deger))\ndeger = None\nprint(type(deger))\n',
      expect: "<class 'int'>\n<class 'str'>\n<class 'NoneType'>\n",
      tests: 'assert deger is None, "son değer None olmalı"\n',
      hints: ['Aynı ada farklı türde değer atayabilirsin.', 'None büyük N ile yazılır.'],
      why: 'Tür değişkene değil değere aittir; her atamada type() yeni değerin türünü gösterir.' },
    { t: 'mc', q: '<code>a = 5</code> ve ardından <code>a = a + 1</code> satırlarından sonra <code>a</code> kaçtır?',
      o: ['5', 'Hata verir, çünkü a kendine eşit olamaz', '6', '51'], a: 2,
      why: 'Eşittir atama işlemidir: önce sağ taraf hesaplanır (6), sonra a etiketi bu yeni değere taşınır.' }
  ],
  faq: [
    { q: "Değişkeni tanımlarken türünü belirtmem gerekiyor mu?", a: "Hayır. Python değerin türünü kendisi anlar. İstersen tutar: float = 10.0 gibi tip ipucu ekleyebilirsin; bu çalışmayı etkilemez ama editör ve ekip için belgedir." },
    { q: "None ile 0 ya da boş metin aynı şey mi?", a: "Hayır. 0 bir sayıdır, \"\" boş bir metindir, None ise \"değer yok\" demektir. Bir siparişin iade tarihi yoksa None'dır; 0 olsaydı bu bir tarih anlamına gelirdi." },
    { q: "Türkçe karakterli değişken adı kullanabilir miyim?", a: "Teknik olarak evet (Python 3 Unicode adlara izin verir), ama ekip çalışmasında ve farklı klavyelerde sorun çıkarır. Kurumsal kodda ASCII snake_case kullan: musteri_adi." }
  ],
  mistakes: [
    { bad: 'tutar = "1500"\nprint(tutar + 250)', good: 'tutar = int("1500")\nprint(tutar + 250)', why: 'Metinle sayı toplanamaz; önce int() ile çevir.' },
    { bad: 'fiyat = 1499,90', good: 'fiyat = 1499.90', why: 'Virgül Python\'da demet oluşturur; ondalık ayracı noktadır.' },
    { bad: 'sum = 10 + 20', good: 'toplam = 10 + 20', why: 'sum hazır bir fonksiyondur; üzerine yazarsan artık listeleri toplayamazsın.' },
    { bad: 'teslim = false', good: 'teslim = False', why: 'Mantıksal değerler büyük harfle başlar; false tanımsız bir ad sayılır ve NameError verir.' }
  ]
},

/* ───────────────────────── 5. sayilar-islemler ───────────────────────── */
{
  id: 'sayilar-islemler',
  lv: 'temel',
  mod: 'Veri Türleri',
  min: 22,
  title: 'Sayılar ve işlemler',
  sum: 'Aritmetik işlemleri, tam bölme ve kalanı, üs almayı, yuvarlamayı, kayan nokta hatasını ve math modülünü Ilgaz Bank faiz hesabı üzerinden öğrenirsin.',
  goals: [
    'Dört işlem, //, % ve ** operatörlerini doğru öncelikle kullanabilirim.',
    'Tam bölme ve kalan ile gerçek iş problemlerini (taksit, sayfa, paketleme) çözebilirim.',
    'Kayan nokta hatasının neden oluştuğunu açıklayıp round ile yönetebilirim.',
    'math modülünden ceil, floor, sqrt gibi fonksiyonları kullanabilirim.',
    'Basit ve bileşik faiz hesabını Python ile yapabilirim.'
  ],
  body: `
<h2>Sayılar neden bu kadar önemli?</h2>
<p>Ilgaz Bank'ta bir mevduat hesabının faizi, Anadolu Market'te bir sepetin indirimli tutarı, bir kargonun kaç kutuya sığacağı... Hepsi sayı işlemi. Python'ın aritmetiği hesap makinesine benzer ama birkaç yerde sürpriz yapar: bölme hep ondalıklı sonuç verir, ondalıklı sayılar bazen "yanlış" görünür ve yuvarlama sandığın gibi çalışmaz. Bu derste bu sürprizlerin hepsini önceden göreceksin.</p>

<h2>Temel operatörler</h2>
<pre class="py">bakiye = 10000
print(bakiye + 2500)     # toplama
print(bakiye - 750)      # çıkarma
print(bakiye * 1.05)     # çarpma
print(bakiye / 3)        # bölme: her zaman float
print(bakiye // 3)       # tam bölme: ondalık atılır
print(bakiye % 3)        # kalan (mod)
print(2 ** 10)           # üs alma</pre>
<p>En çok dikkat isteyen üçlü: <code>/</code> her zaman <code>float</code> döndürür, 10 / 2 bile 5.0'dır. <code>//</code> tam bölme (floor division) aşağı yuvarlanmış tam sonucu verir. <code>%</code> ise kalanı (modulo). Bu ikili birlikte çok iş görür: 10000 TL'yi 3 taksite bölersen taksit başına 3333 TL düşer, 1 TL artar.</p>
<div class="tbl-wrap"><table>
<tr><th>Operatör</th><th>Anlamı</th><th>Örnek</th><th>Sonuç</th></tr>
<tr><td><code>+ - *</code></td><td>Toplama, çıkarma, çarpma</td><td><code>7 * 3</code></td><td><code>21</code></td></tr>
<tr><td><code>/</code></td><td>Bölme (hep float)</td><td><code>7 / 2</code></td><td><code>3.5</code></td></tr>
<tr><td><code>//</code></td><td>Tam bölme</td><td><code>7 // 2</code></td><td><code>3</code></td></tr>
<tr><td><code>%</code></td><td>Kalan</td><td><code>7 % 2</code></td><td><code>1</code></td></tr>
<tr><td><code>**</code></td><td>Üs</td><td><code>2 ** 3</code></td><td><code>8</code></td></tr>
<tr><td><code>-x</code></td><td>İşaret değiştirme</td><td><code>-(5 - 8)</code></td><td><code>3</code></td></tr>
</table></div>
<p>İşlem önceliği matematikteki gibidir: önce parantez, sonra üs, sonra çarpma-bölme-kalan, en son toplama-çıkarma. Emin değilsen parantez kullan; parantez ücretsizdir ve okuyana yardım eder. Bir de kısayol atamalar var: <code>bakiye += 500</code>, <code>bakiye = bakiye + 500</code> demektir. Aynı şekilde <code>-=</code>, <code>*=</code>, <code>/=</code>, <code>//=</code>, <code>%=</code> kullanılır.</p>

<h2>Tam bölme ve kalanla gerçek problemler</h2>
<p>Anadolu Market deposunda 250 ürün var, her kutuya 12 ürün sığıyor. Kaç tam kutu dolar, kaç ürün açıkta kalır, toplam kaç kutu gerekir?</p>
<pre class="py">urun = 250
kutu_kapasitesi = 12
tam_kutu = urun // kutu_kapasitesi
artan = urun % kutu_kapasitesi
print("Tam kutu:", tam_kutu)
print("Açıkta kalan:", artan)
gereken_kutu = tam_kutu + (1 if artan else 0)
print("Gereken kutu:", gereken_kutu)
print("Çift mi?", 250 % 2 == 0)</pre>
<p>Son satır, kalan operatörünün klasik kullanımı: bir sayının 2'ye bölümünden kalan 0 ise sayı çifttir. Aynı mantıkla "her 100. sipariş hediye" kuralı <code>siparis_no % 100 == 0</code> ile yazılır. <code>divmod(250, 12)</code> fonksiyonu ise tam bölüm ve kalanı tek seferde verir: <code>(20, 10)</code>.</p>

<h2>Kayan nokta hatası</h2>
<p>Şimdi sürpriz. Şu kodu çalıştır:</p>
<pre class="py">print(0.1 + 0.2)
print(0.1 + 0.2 == 0.3)
print(1499.90 * 3)
print(round(0.1 + 0.2, 2))
print(round(2.675, 2), round(2.5), round(3.5))</pre>
<p>0.1 + 0.2, 0.30000000000000004 çıkar. Bu Python'ın hatası değil; bilgisayarlar sayıları ikilik tabanda saklar ve 0.1, ikilik tabanda sonsuz basamaklı bir sayıdır (ondalıkta 1/3'ün 0.333... olması gibi). Her dil aynı sonucu verir. Sonuçları yuvarlamak için <code>round(x, basamak)</code> kullanırsın. Ancak <code>round</code>'un kendisi de sürprizli: Python "bankacı yuvarlaması" yapar, tam .5 durumunda en yakın <b>çift</b> sayıya gider; bu yüzden <code>round(2.5)</code> 2, <code>round(3.5)</code> 4 verir. <code>round(2.675, 2)</code> ise 2.67 çıkar çünkü 2.675 bellekte aslında 2.67499... olarak durur.</p>
<div class="warn"><b>Ondalıklı sayıları == ile karşılaştırma</b><code>a == b</code> yerine <code>abs(a - b) &lt; 0.001</code> gibi bir tolerans kullan ya da sonucu önce yuvarla. Bu uygulamadaki testler de aynı yöntemi kullanır.</div>
<div class="tip"><b>Para hesabında güvenli yol</b>Tutarları kuruş cinsinden tam sayı tut (1499.90 TL = 149990 kuruş) ve sadece gösterirken 100'e böl. Ya da <code>decimal</code> modülünü kullan. Analiz ve raporlamada float ile round yeterlidir.</div>

<h2>Yuvarlama seçenekleri bir arada</h2>
<p>Aynı sayıyı farklı amaçlarla yuvarlayabilirsin: rapor için iki ondalık, fatura için kuruşa, kutu sayısı için yukarı. Hangi fonksiyonun ne verdiğini yan yana gör:</p>
<pre class="py">import math
x = 7.456
print(round(x, 1), round(x, 2))   # en yakına
print(math.floor(x), math.ceil(x))  # aşağı, yukarı
print(int(x))                        # ondalığı at
print(round(-7.456), math.floor(-7.456), int(-7.456))</pre>
<p>Son satır negatif sayılarda farkı gösterir: <code>int</code> sıfıra doğru keser (-7), <code>floor</code> aşağı iner (-8), <code>round</code> en yakını seçer (-7). Bakiye ve borç hesaplarında bu üçünü karıştırmak kuruş farklarına yol açar.</p>

<h2>math modülü</h2>
<p>Daha fazlası için <code>math</code> modülünü içe aktarırsın. En sık kullanacakların: yukarı yuvarlama <code>ceil</code>, aşağı yuvarlama <code>floor</code>, karekök <code>sqrt</code>, sabit <code>pi</code>.</p>
<pre class="py">import math
print(math.ceil(250 / 12))     # 21: gereken kutu, tek satırda
print(math.floor(7.9))         # 7
print(math.sqrt(144))          # 12.0
print(round(math.pi, 4))
print(abs(-350), max(3, 9, 4), min(3, 9, 4))
print(pow(2, 10), 10 ** 3)</pre>
<p><code>abs</code>, <code>max</code>, <code>min</code>, <code>pow</code> ve <code>round</code> hazır (built-in) fonksiyonlardır, içe aktarmaya gerek yoktur. Kutu problemine geri dönersen: <code>math.ceil(250 / 12)</code> tek satırda "gereken kutu" sayısını verir.</p>

<h2>Ilgaz Bank faiz hesabı</h2>
<p>Bir müşteri 50.000 TL'yi yıllık %30 faizle 3 yıl vadeli hesaba yatırıyor. Basit faizde her yıl ana para üzerinden faiz işler; bileşik faizde (compound interest) faiz de faiz kazanır. Formül: bileşik tutar = anapara × (1 + oran) üzeri yıl.</p>
<pre class="py">anapara = 50_000
oran = 0.30
yil = 3
basit = anapara * (1 + oran * yil)
bilesik = anapara * (1 + oran) ** yil
print("Basit faizle:", round(basit, 2))
print("Bileşik faizle:", round(bilesik, 2))
print("Fark:", round(bilesik - basit, 2))</pre>
<p><code>50_000</code> yazımına dikkat: alt çizgi, büyük sayıları okunur yapar ve Python onu yok sayar. Üs operatörünün çarpmadan önce hesaplandığını da gör; parantez yalnızca <code>1 + oran</code> için gerekti.</p>
<div class="note"><b>Oran yüzde değil kesirdir</b>%30'u koda <code>30</code> değil <code>0.30</code> olarak yazarsın. Kullanıcıdan 30 alıyorsan 100'e bölmeyi unutma; en sık yapılan finans hatalarından biridir.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Decimal ve Fraction</h3>
<p><code>from decimal import Decimal</code> ile ondalık sayıları tam olarak temsil edersin: <code>Decimal("0.1") + Decimal("0.2")</code> tam 0.3 verir. Dikkat, Decimal'ı metinden oluşturmalısın; <code>Decimal(0.1)</code> zaten bozuk float'ı alır. Muhasebe, faturalama ve faiz hesapları Decimal ister. <code>fractions.Fraction</code> ise kesirleri tam tutar: 1/3 + 1/3, 2/3 çıkar. Analizde nadir, bilimsel hesapta değerlidir.</p>
<h3>Tam sayı bölmede negatif sayılar</h3>
<p><code>-7 // 2</code> sonucu -4'tür, -3 değil. Python tam bölmeyi her zaman aşağı (eksi sonsuza) yuvarlar ve <code>%</code> işareti bölenin işaretini alır: <code>-7 % 2</code> 1 verir. Bu tutarlılık takvim hesaplarında (haftanın günü, ay döngüsü) işe yarar, ama C ya da JavaScript'ten gelenleri şaşırtır.</p>
<h3>Büyük sayılar ve performans</h3>
<p>Python tam sayıları sınırsızdır: <code>2 ** 1000</code> sorunsuz hesaplanır. Bu rahatlığın bedeli hızdır; milyonlarca sayıyla işlem yapacaksan numpy'nin sabit boyutlu sayı tipleri çok daha hızlıdır. İleri seviyede bu geçişi yapacaksın.</p>
</section>
`,
  ex: [
    { t: 'mc', q: '<code>17 // 5</code> ve <code>17 % 5</code> sırasıyla kaçtır?',
      o: ['3.4 ve 2', '3 ve 2', '3 ve 0.4', '4 ve 2'], a: 1,
      why: '// tam bölme sonucu 3, % kalan 2 verir. 3.4 normal bölmenin (/) sonucudur.' },
    { t: 'code', id: 'sayilar-islemler-1',
      q: '<p><code>taksit_hesapla(tutar, taksit_sayisi)</code> fonksiyonu yaz. Tutar tam sayı olarak taksitlere bölünür; fonksiyon <code>(taksit, artan)</code> demeti döndürsün: <code>taksit</code> tam bölme sonucu, <code>artan</code> kalan. Örnek: <code>taksit_hesapla(10000, 3)</code> → <code>(3333, 1)</code>.</p>',
      start: 'def taksit_hesapla(tutar, taksit_sayisi):\n    # tam bölme ve kalan\n    pass\n',
      sol: 'def taksit_hesapla(tutar, taksit_sayisi):\n    taksit = tutar // taksit_sayisi\n    artan = tutar % taksit_sayisi\n    return taksit, artan\n',
      tests: 'assert taksit_hesapla(10000, 3) == (3333, 1), "10000/3 -> (3333, 1) olmalı"\nassert taksit_hesapla(1200, 4) == (300, 0), "1200/4 -> (300, 0) olmalı"\nassert taksit_hesapla(999, 10) == (99, 9), "999/10 -> (99, 9) olmalı"\n',
      hints: ['// tam bölme, % kalan verir.', 'return taksit, artan iki değeri demet olarak döndürür.'],
      why: 'Tam bölme taksit tutarını, kalan ise son taksite eklenecek artığı verir; divmod da aynı işi yapar.' },
    { t: 'code', id: 'sayilar-islemler-2',
      q: '<p><code>gereken_kutu(urun, kapasite)</code> fonksiyonu yaz: ürünleri taşımak için gereken kutu sayısını döndürsün. Kalan ürün varsa bir kutu daha gerekir. <code>math.ceil</code> kullanabilirsin. Örnek: <code>gereken_kutu(250, 12)</code> → <code>21</code>, <code>gereken_kutu(24, 12)</code> → <code>2</code>. Sonuç int olmalı.</p>',
      start: 'import math\n\ndef gereken_kutu(urun, kapasite):\n    pass\n',
      sol: 'import math\n\ndef gereken_kutu(urun, kapasite):\n    return math.ceil(urun / kapasite)\n',
      tests: 'assert gereken_kutu(250, 12) == 21, "250 ürün, 12 kapasite -> 21 kutu"\nassert gereken_kutu(24, 12) == 2, "24 ürün -> 2 kutu"\nassert gereken_kutu(1, 12) == 1, "1 ürün -> 1 kutu"\nassert isinstance(gereken_kutu(250, 12), int), "sonuç int olmalı"\n',
      hints: ['math.ceil yukarı yuvarlar ve int döndürür.', 'Alternatif: urun // kapasite + (1 if urun % kapasite else 0)'],
      why: 'Yukarı yuvarlama, kalan varsa fazladan bir kutu ekler; math.ceil bunu tek adımda yapar.' },
    { t: 'mc', q: '<code>print(0.1 + 0.2 == 0.3)</code> ne yazdırır ve neden?',
      o: ['True, çünkü matematiksel olarak eşittir', 'False, çünkü ondalık sayılar ikilik tabanda tam saklanamaz', 'Hata verir', 'True, çünkü Python karşılaştırmadan önce iki sayıyı da yuvarlar'], a: 1,
      why: '0.1 ve 0.2 ikilik tabanda sonsuz basamaklıdır; toplamları 0.30000000000000004 olur ve 0.3 ile eşit değildir. Karşılaştırmada tolerans ya da round kullanılır.' },
    { t: 'code', id: 'sayilar-islemler-3',
      q: '<p>Ilgaz Bank için <code>bilesik_faiz(anapara, oran, yil)</code> fonksiyonu yaz. Bileşik faizle vade sonundaki tutarı hesaplayıp <b>2 basamağa yuvarlanmış</b> olarak döndürsün. Formül: anapara × (1 + oran) ** yil. Örnek: <code>bilesik_faiz(50000, 0.30, 3)</code> → <code>109850.0</code>.</p>',
      start: 'def bilesik_faiz(anapara, oran, yil):\n    pass\n',
      sol: 'def bilesik_faiz(anapara, oran, yil):\n    tutar = anapara * (1 + oran) ** yil\n    return round(tutar, 2)\n',
      tests: 'assert abs(bilesik_faiz(50000, 0.30, 3) - 109850.0) < 1e-6, "50000, %30, 3 yıl -> 109850.0"\nassert abs(bilesik_faiz(1000, 0.10, 2) - 1210.0) < 1e-6, "1000, %10, 2 yıl -> 1210.0"\nassert abs(bilesik_faiz(1000, 0.0, 5) - 1000.0) < 1e-6, "oran 0 ise tutar değişmez"\n',
      hints: ['Üs operatörü ** çarpmadan önce hesaplanır; 1 + oran parantez içinde olmalı.', 'round(tutar, 2) iki basamağa yuvarlar.'],
      why: 'Bileşik faizde her yıl faiz de faiz kazanır; (1 + oran) ** yil bunu tek ifadede verir.' },
    { t: 'mc', q: '<code>round(2.5)</code> ve <code>round(3.5)</code> sonuçları nedir?',
      o: ['3 ve 4', '2 ve 4', '2 ve 3', '3 ve 3'], a: 1,
      why: 'Python tam .5 durumunda en yakın çift sayıya yuvarlar (bankacı yuvarlaması): 2.5 → 2, 3.5 → 4.' },
    { t: 'code', id: 'sayilar-islemler-4',
      q: '<p><code>indirimli_fiyat(fiyat, yuzde)</code> fonksiyonu yaz: yüzde cinsinden verilen indirimi (örneğin 15 → %15) uygulayıp sonucu 2 basamağa yuvarlayarak döndürsün. Örnek: <code>indirimli_fiyat(1500, 15)</code> → <code>1275.0</code>.</p>',
      start: 'def indirimli_fiyat(fiyat, yuzde):\n    pass\n',
      sol: 'def indirimli_fiyat(fiyat, yuzde):\n    return round(fiyat * (1 - yuzde / 100), 2)\n',
      tests: 'assert abs(indirimli_fiyat(1500, 15) - 1275.0) < 1e-6, "1500, %15 -> 1275.0"\nassert abs(indirimli_fiyat(200, 50) - 100.0) < 1e-6, "200, %50 -> 100.0"\nassert abs(indirimli_fiyat(80, 0) - 80.0) < 1e-6, "indirim 0 ise fiyat aynı"\n',
      hints: ['Yüzdeyi 100\'e bölerek kesire çevir.', 'fiyat * (1 - yuzde / 100)'],
      why: 'Yüzde değeri kesire çevrilmeden çarpılırsa sonuç 15 kat büyür; 100\'e bölmek bu hatayı önler.' }
  ],
  faq: [
    { q: "10 / 2 neden 5 değil de 5.0 veriyor?", a: "Python 3'te / operatörü her zaman float döndürür; böylece 7 / 2 gibi işlemlerde ondalık kaybolmaz. Tam sayı sonuç istiyorsan // kullan ya da int() ile çevir." },
    { q: "Kayan nokta hatasını tamamen önleyebilir miyim?", a: "float kullandığın sürece hayır, ama yönetebilirsin: karşılaştırmada tolerans, gösterimde round. Para için decimal modülü ya da kuruş cinsinden int tam sonuç verir." },
    { q: "** ile math.pow arasında fark var mı?", a: "** tam sayılarla tam sayı sonuç verir (2 ** 10 = 1024), math.pow her zaman float döndürür (1024.0). Genelde ** yeterli; math.pow nadiren gerekir." }
  ],
  mistakes: [
    { bad: 'oran = 30\ntutar = 1000 * (1 + oran)', good: 'oran = 30 / 100\ntutar = 1000 * (1 + oran)', why: 'Yüzde olarak verilen oranı kesire çevirmeden kullanırsan sonuç 31 kat büyür.' },
    { bad: 'if 0.1 + 0.2 == 0.3:\n    print("eşit")', good: 'if abs((0.1 + 0.2) - 0.3) < 1e-9:\n    print("eşit")', why: 'Ondalıklı sayılarda == güvenilmezdir; tolerans ile karşılaştır.' },
    { bad: 'kutu = 250 / 12', good: 'kutu = 250 // 12', why: 'Adet gibi tam sayı sonuç gereken yerde / float verir; // kullan ya da math.ceil ile yukarı yuvarla.' },
    { bad: 'taksit = 10000 / 3\nprint(int(taksit) + 1)', good: 'import math\nprint(math.ceil(10000 / 3))', why: 'Her zaman 1 eklemek tam bölünen durumlarda yanlış sonuç verir; ceil yalnızca gerektiğinde yukarı yuvarlar.' }
  ]
},

/* ───────────────────────── 6. metinler ───────────────────────── */
{
  id: 'metinler',
  lv: 'temel',
  mod: 'Veri Türleri',
  min: 24,
  title: 'Metinler (string)',
  sum: 'Metinleri dilimler, upper/strip/split/join/replace/find metotlarıyla temizler, f-string ile biçimler ve değişmezlik kuralını öğrenirsin.',
  goals: [
    'İndeks ve dilimleme ile metnin istediğim parçasını alabilirim.',
    'strip, upper, lower, replace, split, join, find gibi metotlarla metni temizleyip dönüştürebilirim.',
    'f-string ile değişkenleri metne yerleştirip düzenli çıktı üretebilirim.',
    'Metinlerin değişmez olduğunu bilir, metot sonuçlarını yeni değişkene atarım.',
    'in operatörü ve len ile metin içinde arama ve ölçüm yapabilirim.'
  ],
  body: `
<h2>Metin her yerde</h2>
<p>Anadolu Market'in müşteri tablosunda e-posta adresleri bazen büyük harfli, bazen başında boşluklu; şehir alanında "istanbul", "İstanbul" ve "ISTANBUL" aynı anda var. Veri temizliğinin büyük kısmı metin (string) işlemidir. Python'ın metin desteği bu yüzden zengindir: dilimleme, onlarca metot ve f-string biçimleme.</p>

<h2>Metin oluşturma ve temel işlemler</h2>
<pre class="py">ad = "Ayşe"
soyad = 'Yılmaz'
tam_ad = ad + " " + soyad        # birleştirme
print(tam_ad)
print(len(tam_ad))                # karakter sayısı
print("-" * 10)                   # tekrar
print("Yıl" in tam_ad)            # içeriyor mu?
adres = """Atatürk Cad. No: 5
Konak / İzmir"""
print(adres)</pre>
<p>Üç tırnak, satır sonlarını içeren uzun metinler için. <code>len</code> karakter sayısını verir; Türkçe karakterler de tek karakter sayılır. <code>in</code> operatörü bir parçanın metinde geçip geçmediğini <code>True</code>/<code>False</code> olarak söyler ve büyük-küçük harfe duyarlıdır.</p>

<h2>İndeks ve dilimleme</h2>
<p>Metin, sıralı karakterlerden oluşur ve her karakterin bir konumu (index) vardır. Sayma 0'dan başlar; negatif indeks sondan sayar. <b>Dilimleme</b> (slicing) <code>metin[baslangic:bitis]</code> biçiminde bir parça alır; başlangıç dahil, bitiş hariçtir.</p>
<pre class="py">siparis_kodu = "AM-2025-IZM-00417"
print(siparis_kodu[0])        # A
print(siparis_kodu[-1])       # 7
print(siparis_kodu[3:7])      # 2025 (yıl)
print(siparis_kodu[8:11])     # IZM (şehir)
print(siparis_kodu[-5:])      # 00417 (sıra no)
print(siparis_kodu[:2])       # AM
print(siparis_kodu[::-1])     # ters çevir</pre>
<p>Sınırı boş bırakırsan baştan ya da sona kadar gider. Üçüncü değer adımdır: <code>[::2]</code> ikide bir, <code>[::-1]</code> ters sıra. Var olmayan tek bir indeks (<code>siparis_kodu[50]</code>) IndexError verir, ama dilim sınırı aşarsa sessizce elindekini verir.</p>
<div class="tbl-wrap"><table>
<tr><th>İfade</th><th>Sonuç</th><th>Açıklama</th></tr>
<tr><td><code>s[0]</code></td><td>ilk karakter</td><td>sayma 0'dan başlar</td></tr>
<tr><td><code>s[-1]</code></td><td>son karakter</td><td>negatif sondan sayar</td></tr>
<tr><td><code>s[2:5]</code></td><td>2, 3, 4. karakterler</td><td>bitiş hariç</td></tr>
<tr><td><code>s[:3]</code></td><td>ilk 3 karakter</td><td>baştan</td></tr>
<tr><td><code>s[3:]</code></td><td>3'ten sona</td><td>sona kadar</td></tr>
<tr><td><code>s[::-1]</code></td><td>ters metin</td><td>adım -1</td></tr>
</table></div>

<h2>Metotlar: metni dönüştürmek</h2>
<p>Metot (method), bir değere ait fonksiyondur ve nokta ile çağrılır. Metin metotları metni <b>değiştirmez</b>, yeni bir metin döndürür; bu yüzden sonucu bir değişkene atarsın.</p>
<pre class="py">ham = "  ayse.yilmaz@ANADOLUMARKET.com  "
temiz = ham.strip().lower()
print(repr(temiz))
print(temiz.upper())
print(temiz.replace(".com", ".com.tr"))
print(temiz.find("@"))           # @ işaretinin konumu
print(temiz.startswith("ayse"), temiz.endswith(".com"))
print("İzmir".upper(), "İZMİR".lower())</pre>
<p><code>strip</code> baştaki ve sondaki boşlukları (ve satır sonlarını) temizler; <code>lstrip</code> ve <code>rstrip</code> tek taraflı çalışır. <code>repr</code> metni tırnaklarıyla gösterir; boşlukların gerçekten gittiğini görmek için işe yarar. <code>find</code> aranan parçanın ilk konumunu, bulamazsa <code>-1</code> döndürür. Metotlar zincirlenebilir: <code>ham.strip().lower()</code> önce temizler, sonra küçültür.</p>
<div class="note"><b>Türkçe İ sorunu</b><code>"İzmir".upper()</code> doğru şekilde İZMİR verir, ama <code>"İZMİR".lower()</code> sonucu <code>i̇zmi̇r</code> gibi noktalı ek karakterler içerebilir; bu Unicode'un İ harfini iki parça olarak ele almasından kaynaklanır. Karşılaştırma yapmadan önce <code>casefold()</code> kullanmak ya da İ/I harflerini elle <code>replace</code> etmek daha güvenlidir.</div>

<h2>split ve join: parçala, birleştir</h2>
<p>Veri genellikle ayraçla gelir: "İzmir,Konak,35220" gibi. <code>split</code> metni ayraçtan böler ve liste döndürür; <code>join</code> bir listeyi ayraçla birleştirir. İkisi birbirinin tersidir.</p>
<pre class="py">satir = "İzmir,Konak,35220"
parcalar = satir.split(",")
print(parcalar)
print(parcalar[0], "-", parcalar[2])
kelimeler = "  Kahve   Makinesi  Siyah ".split()
print(kelimeler)
print(" ".join(kelimeler))
print(" | ".join(["Ad", "Şehir", "Tutar"]))</pre>
<p><code>split()</code> ayraçsız çağrılırsa her türlü boşluktan böler ve fazla boşlukları yok sayar; dağınık metni kelimelere ayırmanın en kolay yolu budur. <code>join</code>'in yazımına dikkat: ayraç önde, liste parantez içinde. Listeleri bir sonraki derste ayrıntılı göreceksin.</p>

<h2>f-string: değişkeni metne yerleştirmek</h2>
<p>Rapor satırı üretmek için + ile birleştirmek hem yorucu hem hataya açıktır (sayıları str'ye çevirmek gerekir). <b>f-string</b> çözümdür: tırnağın önüne <code>f</code> koy, süslü parantez içine değişken ya da ifade yaz.</p>
<pre class="py">musteri = "Ayşe Yılmaz"
tutar = 1499.9
adet = 3
print(f"Sayın {musteri}, {adet} ürün için toplam {adet * tutar} TL.")
print(f"Tutar: {tutar:.2f} TL")          # 2 ondalık
print(f"Toplam: {adet * tutar:,.2f} TL")  # binlik ayraç
print(f"{'Ürün':&lt;12}{'Adet':&gt;6}")       # hizalama
print(f"{'Kahve':&lt;12}{adet:&gt;6}")</pre>
<p>İki nokta sonrası biçim belirtimidir: <code>.2f</code> iki ondalık, <code>,</code> binlik ayraç, <code>&lt;12</code> sola yaslayıp 12 karaktere tamamla, <code>&gt;6</code> sağa yasla. String Biçimleme dersinde bunu derinleştireceğiz; şimdilik bu dört kalıp raporların çoğunu karşılar.</p>
<div class="tip"><b>f-string içinde ifade</b>Süslü parantez içine <code>{adet * tutar}</code> gibi hesap, <code>{ad.upper()}</code> gibi metot çağrısı yazabilirsin. Ama çok uzun ifadeyi önce değişkene al; okunurluk önce gelir.</div>

<h2>Metin kontrolleri</h2>
<p>Veri doğrulamada bazı sorular çok sık sorulur: bu değer yalnızca rakamdan mı oluşuyor, boş mu, belirli bir ekle mi bitiyor? Metin metotları bu sorulara <code>True</code>/<code>False</code> ile cevap verir.</p>
<pre class="py">posta_kodu = "35220"
print(posta_kodu.isdigit())
print("abc12".isalpha(), "abc".isalpha())
print("".strip() == "", "   ".strip() == "")
dosya = "rapor_2025.csv"
print(dosya.endswith(".csv"), dosya.startswith("rapor"))
print("İZMİR".isupper(), "izmir".islower())
print("kahve makinesi".title())</pre>
<div class="warn"><b>isdigit ile int farkı</b><code>"-5".isdigit()</code> False döner çünkü eksi işareti rakam değildir; ama <code>int("-5")</code> çalışır. Boşluklu <code>" 42 "</code> için de isdigit False'tur. Doğrulamadan önce <code>strip</code> uygula, işaretli sayı bekliyorsan isdigit yerine dönüşümü deneyip hatayı yakala.</div>

<h2>Değişmezlik (immutability)</h2>
<p>Metinler <b>değişmezdir</b>: oluşturduktan sonra tek bir karakterini bile yerinde değiştiremezsin. <code>ad[0] = "a"</code> TypeError verir. Metotlar yeni metin döndürür ve eski metin olduğu gibi kalır; bu yüzden <code>ad.upper()</code> yazıp sonucu kullanmazsan hiçbir şey değişmez.</p>
<pre class="py">sehir = "izmir"
sehir.upper()                 # sonuç kayboldu
print(sehir)
sehir = sehir.upper()         # yeni metni aynı ada bağla
print(sehir)
yeni = "İ" + sehir[1:]        # ilk harfi değiştirmek: yeni metin kur
print(yeni)</pre>
<p>Değişmezlik ilk bakışta kısıtlama gibi dursa da bir güvencedir: bir metni fonksiyona verdiğinde fonksiyonun onu bozmayacağını bilirsin. Listelerde bu güvence yoktur ve bunun sonuçlarını bir sonraki derste yaşayacaksın.</p>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Veri temizliğinin standart hattı</h3>
<p>Kurumsal müşteri verisi temizlerken neredeyse hep aynı zincir kurulur: <code>deger.strip().casefold()</code> ile normalize et, <code>replace</code> ile bilinen yazım hatalarını düzelt, <code>split</code> ile alanlara ayır, sonra karşılaştır. Bu zincir, "İstanbul", " istanbul " ve "ISTANBUL" değerlerini tek şehre indirir. pandas'ta aynı metotlar <code>.str</code> erişimcisi altında vardır; burada öğrendiğin her şey oraya taşınır.</p>
<h3>Metin birleştirmede performans</h3>
<p>Döngü içinde binlerce kez <code>metin += parca</code> yapmak her seferinde yeni metin oluşturduğu için yavaştır. Pythonic yol, parçaları bir listede biriktirip sonda <code>"".join(liste)</code> ile tek seferde birleştirmektir. Küçük raporlarda fark edilmez, milyon satırlık log üretiminde belirleyicidir.</p>
<h3>Ham metin ve kaçış dizileri</h3>
<p><code>"\\n"</code> satır sonu, <code>"\\t"</code> sekme, <code>"\\\\"</code> ters eğik çizgidir. Windows dosya yolları ve düzenli ifadelerde ters eğik çizgi çok geçtiği için önüne <code>r</code> konmuş ham metin (raw string) kullanılır: <code>r"C:\\raporlar\\yeni"</code>. Regex dersinde buna sık sık ihtiyaç duyacaksın.</p>
</section>
`,
  ex: [
    { t: 'code', id: 'metinler-1',
      q: '<p><code>sehir_kodu(siparis_kodu)</code> fonksiyonu yaz. Sipariş kodu <code>"AM-2025-IZM-00417"</code> biçimindedir; fonksiyon 8–10 arası konumlardaki üç harfli şehir kodunu döndürsün (<code>"IZM"</code>). Dilimleme kullan.</p>',
      start: 'def sehir_kodu(siparis_kodu):\n    pass\n',
      sol: 'def sehir_kodu(siparis_kodu):\n    return siparis_kodu[8:11]\n',
      tests: 'assert sehir_kodu("AM-2025-IZM-00417") == "IZM", "IZM dönmeli"\nassert sehir_kodu("AM-2024-ANK-00001") == "ANK", "ANK dönmeli"\n',
      hints: ['İndeks 0\'dan başlar; dilimde bitiş hariçtir.', 'siparis_kodu[8:11]'],
      why: 'Sabit biçimli kodlarda dilimleme en hızlı yoldur; 8. karakterden başlayıp 11. karakterden önce biter.' },
    { t: 'code', id: 'metinler-2',
      q: '<p><code>eposta_temizle(ham)</code> fonksiyonu yaz: baştaki ve sondaki boşlukları silip tamamını küçük harfe çevirsin. Örnek: <code>eposta_temizle("  Ayse.Yilmaz@Example.com ")</code> → <code>"ayse.yilmaz@example.com"</code>.</p>',
      start: 'def eposta_temizle(ham):\n    pass\n',
      sol: 'def eposta_temizle(ham):\n    return ham.strip().lower()\n',
      tests: 'assert eposta_temizle("  Ayse.Yilmaz@Example.com ") == "ayse.yilmaz@example.com", "boşluk ve büyük harf temizlenmeli"\nassert eposta_temizle("MEHMET@BANK.COM") == "mehmet@bank.com", "küçük harfe çevrilmeli"\nassert eposta_temizle("\\tali@x.com\\n") == "ali@x.com", "sekme ve satır sonu da temizlenmeli"\n',
      hints: ['strip() baş ve sondaki boşlukları siler.', 'Metotları zincirle: ham.strip().lower()'],
      why: 'strip ve lower birlikte, farklı yazılmış aynı adresleri tek biçime indirir.' },
    { t: 'mc', q: '<code>"Python"[1:4]</code> ifadesinin sonucu nedir?',
      o: ['"Pyt"', '"yth"', '"ytho"', '"Pyth"'], a: 1,
      why: 'Dilim 1. indeksten başlar (y) ve 4. indeksten önce biter: y, t, h. Bitiş sınırı dahil değildir.' },
    { t: 'code', id: 'metinler-3',
      q: '<p><code>satir_ayir(satir)</code> fonksiyonu yaz. Virgülle ayrılmış <code>"İzmir,Konak,35220"</code> gibi bir satırı alıp <code>"Konak / İzmir (35220)"</code> biçiminde bir metin döndürsün. <code>split</code> ve f-string kullan.</p>',
      start: 'def satir_ayir(satir):\n    pass\n',
      sol: 'def satir_ayir(satir):\n    sehir, ilce, posta = satir.split(",")\n    return f"{ilce} / {sehir} ({posta})"\n',
      tests: 'assert satir_ayir("İzmir,Konak,35220") == "Konak / İzmir (35220)", "biçim: ilçe / şehir (posta)"\nassert satir_ayir("Ankara,Çankaya,06420") == "Çankaya / Ankara (06420)", "ikinci örnek"\n',
      hints: ['satir.split(",") üç parçalı liste verir.', 'f"{ilce} / {sehir} ({posta})"'],
      why: 'split alanları ayırır; f-string onları istenen düzende yeniden kurar.' },
    { t: 'mc', q: 'Aşağıdaki kod ne yazdırır?<br><code>s = "kahve"<br>s.upper()<br>print(s)</code>',
      o: ['KAHVE', 'kahve', 'Hata verir', 'None'], a: 1,
      why: 'Metinler değişmezdir; upper() yeni bir metin döndürür ama sonuç bir yere atanmadığı için s aynı kalır.' },
    { t: 'code', id: 'metinler-4',
      q: '<p><code>fis_satiri(urun, adet, fiyat)</code> fonksiyonu yaz. f-string ile <code>"Kahve Makinesi x3 = 4499.70 TL"</code> biçiminde bir satır döndürsün: toplam (adet × fiyat) iki ondalıkla gösterilsin.</p>',
      start: 'def fis_satiri(urun, adet, fiyat):\n    pass\n',
      sol: 'def fis_satiri(urun, adet, fiyat):\n    return f"{urun} x{adet} = {adet * fiyat:.2f} TL"\n',
      tests: 'assert fis_satiri("Kahve Makinesi", 3, 1499.90) == "Kahve Makinesi x3 = 4499.70 TL", "biçim: urun xadet = toplam TL"\nassert fis_satiri("Kalem", 10, 2.5) == "Kalem x10 = 25.00 TL", "iki ondalık basamak olmalı"\n',
      hints: ['f-string içinde {adet * fiyat:.2f} iki ondalık verir.', 'x ile adet arasında boşluk yok.'],
      why: ':.2f biçim belirtimi, kayan nokta hatasını gizleyip iki basamaklı düzgün tutar gösterir.' },
    { t: 'mc', q: '<code>"a,b,,c".split(",")</code> sonucu kaç elemanlı bir listedir?',
      o: ['3', '4', '2', 'Hata verir'], a: 1,
      why: 'Ayraç verilince her virgül bir bölme noktasıdır; iki virgül arasındaki boş metin de eleman sayılır: ["a", "b", "", "c"]. Ayraçsız split() ise boşları atar.' },
    { t: 'code', id: 'metinler-5',
      q: '<p><code>bas_harf_buyut(ad)</code> fonksiyonu yaz: metnin ilk harfini büyük, geri kalanını olduğu gibi döndürsün. Dilimleme ve <code>upper</code> kullan; <code>capitalize</code> kullanma (o, geri kalanı küçültür). Örnek: <code>bas_harf_buyut("ayşe YILMAZ")</code> → <code>"Ayşe YILMAZ"</code>.</p>',
      start: 'def bas_harf_buyut(ad):\n    pass\n',
      sol: 'def bas_harf_buyut(ad):\n    return ad[0].upper() + ad[1:]\n',
      tests: 'assert bas_harf_buyut("ayşe YILMAZ") == "Ayşe YILMAZ", "ilk harf büyük, gerisi aynı"\nassert bas_harf_buyut("ankara") == "Ankara", "a -> A olmalı"\nassert bas_harf_buyut("Mehmet") == "Mehmet", "zaten büyükse değişmez"\n',
      hints: ['ad[0] ilk karakter, ad[1:] geri kalanı.', 'İki parçayı + ile birleştir.'],
      why: 'Metin değişmez olduğundan ilk harfi yerinde değiştiremezsin; yeni bir metin kurarsın.' }
  ],
  faq: [
    { q: "Tek tırnak mı çift tırnak mı kullanmalıyım?", a: "İkisi de aynı. Metnin içinde kesme işareti varsa çift tırnak, çift tırnak varsa tek tırnak kullanmak kaçış karakterinden kurtarır. Ekip içinde tek tip seçmek yeterli." },
    { q: "find ile index arasındaki fark ne?", a: "İkisi de ilk konumu döndürür; ama find bulamazsa -1, index ise ValueError verir. Aramanın başarısız olabileceği yerde find, bulunacağından eminsen index kullan." },
    { q: "f-string içinde tırnak kullanabilir miyim?", a: "Evet. Python 3.12'den itibaren f-string içinde dıştaki tırnakla aynı tırnağı bile kullanabilirsin. Daha eski sürümlerde dıştan farklı tırnak seçmen gerekir." }
  ],
  mistakes: [
    { bad: 'ad = "ayşe"\nad.upper()\nprint(ad)', good: 'ad = "ayşe"\nad = ad.upper()\nprint(ad)', why: 'Metin metotları yeni metin döndürür; sonucu atamazsan değişiklik kaybolur.' },
    { bad: 'print("Tutar: " + 1500)', good: 'print(f"Tutar: {1500}")', why: 'Metinle sayı + ile birleşmez; f-string ya da str() kullan.' },
    { bad: '",".join("a", "b", "c")', good: '",".join(["a", "b", "c"])', why: 'join tek bir liste (ya da yinelenebilir) alır, ayrı ayrı argüman değil.' },
    { bad: 'kod = "AM-2025"\nkod[0] = "B"', good: 'kod = "AM-2025"\nkod = "B" + kod[1:]', why: 'Metin değişmezdir; indeksle atama TypeError verir. Yeni bir metin oluştur.' }
  ]
},
/* ───────────────────────── 7. listeler ───────────────────────── */
{
  id: 'listeler',
  lv: 'temel',
  mod: 'Veri Türleri',
  min: 25,
  title: 'Listeler',
  sum: 'Sipariş ve tutar listelerini indeks ve dilimle okur; append, insert, pop, remove ile değiştirir; sort ve sorted ile sıralar; iç içe liste ve kopyalama tuzağını öğrenirsin.',
  goals: [
    'Liste oluşturup indeks ve dilimle elemanlara erişebilirim.',
    'append, insert, pop, remove, extend ile listeyi yerinde değiştirebilirim.',
    'sort ile sorted arasındaki farkı bilir, doğru olanı seçerim.',
    'İç içe listelerle tablo benzeri veriyi tutup okuyabilirim.',
    'Liste kopyalama tuzağını açıklayıp copy ile güvenli kopya alabilirim.'
  ],
  body: `
<h2>Tek değişken yetmeyince</h2>
<p>Anadolu Market'e bugün 5 sipariş geldi. Tutarları <code>t1</code>, <code>t2</code>, <code>t3</code>... diye ayrı değişkenlerde tutmak hem yorucu hem de yarın 500 sipariş gelince imkânsız. <b>Liste</b> (list), birden fazla değeri sıralı biçimde tek değişkende tutar. Köşeli parantezle yazılır, elemanlar virgülle ayrılır ve her türden değer içerebilir.</p>
<pre class="py">tutarlar = [1499.9, 250, 89.5, 3200, 475]
sehirler = ["İzmir", "Ankara", "İzmir", "Bursa", "İstanbul"]
karisik = ["AM-00417", 1499.9, True, None]
print(tutarlar)
print(len(tutarlar), "sipariş")
print(sum(tutarlar), max(tutarlar), min(tutarlar))
print(round(sum(tutarlar) / len(tutarlar), 2), "TL ortalama")</pre>
<p><code>len</code>, <code>sum</code>, <code>max</code>, <code>min</code> hazır fonksiyonları listelerle doğrudan çalışır. Beş satırda bir günün özet raporu çıktı; analistin ilk Python kazancı budur.</p>

<h2>İndeks ve dilim</h2>
<p>Metinlerdeki kuralların aynısı: 0'dan başlar, negatif sondan sayar, dilimde bitiş hariçtir.</p>
<pre class="py">sehirler = ["İzmir", "Ankara", "İzmir", "Bursa", "İstanbul"]
print(sehirler[0], sehirler[-1])
print(sehirler[1:3])
print(sehirler[:2], sehirler[3:])
print("Bursa" in sehirler)
print(sehirler.index("Bursa"))
print(sehirler.count("İzmir"))</pre>
<p><code>in</code> elemanın var olup olmadığını, <code>index</code> ilk konumunu, <code>count</code> kaç kez geçtiğini verir. Var olmayan bir indeks IndexError, var olmayan bir değer için <code>index</code> ValueError verir; önce <code>in</code> ile sormak güvenlidir.</p>

<h2>Listeyi değiştirmek</h2>
<p>Metinlerden en büyük farkı burada: liste <b>değiştirilebilir</b> (mutable). Metotların çoğu listeyi yerinde değiştirir ve hiçbir şey döndürmez (<code>None</code>).</p>
<pre class="py">bekleyen = ["AM-101", "AM-102", "AM-103"]
bekleyen.append("AM-104")          # sona ekle
bekleyen.insert(0, "AM-100")       # başa ekle (konum, değer)
print(bekleyen)
islenen = bekleyen.pop(0)          # konumdaki elemanı çıkar ve döndür
print("İşlendi:", islenen, "| kalan:", bekleyen)
bekleyen.remove("AM-102")          # değere göre ilk eşleşeni sil
print(bekleyen)
bekleyen.extend(["AM-105", "AM-106"])   # başka listeyi ekle
print(bekleyen, len(bekleyen))
bekleyen[0] = "AM-101-DUZELTME"    # yerinde değiştir
print(bekleyen[0])</pre>
<div class="tbl-wrap"><table>
<tr><th>Metot</th><th>Ne yapar</th><th>Döndürür</th></tr>
<tr><td><code>append(x)</code></td><td>Sona tek eleman ekler</td><td>None</td></tr>
<tr><td><code>insert(i, x)</code></td><td>i konumuna ekler</td><td>None</td></tr>
<tr><td><code>extend(liste)</code></td><td>Başka listenin elemanlarını ekler</td><td>None</td></tr>
<tr><td><code>pop(i)</code></td><td>i konumundakini çıkarır (varsayılan: son)</td><td>Çıkarılan eleman</td></tr>
<tr><td><code>remove(x)</code></td><td>x değerinin ilkini siler</td><td>None</td></tr>
<tr><td><code>sort()</code></td><td>Yerinde sıralar</td><td>None</td></tr>
<tr><td><code>reverse()</code></td><td>Yerinde ters çevirir</td><td>None</td></tr>
</table></div>
<div class="warn"><b>append bir liste eklemez, elemanı ekler</b><code>a.append([1, 2])</code> listenin içine bir liste koyar (iç içe). İki listeyi birleştirmek için <code>extend</code> ya da <code>a + b</code> kullan.</div>

<h2>sort ve sorted</h2>
<p>En sık karıştırılan ikili. <code>liste.sort()</code> listeyi yerinde sıralar ve <code>None</code> döndürür. <code>sorted(liste)</code> ise orijinale dokunmaz, sıralı <b>yeni</b> bir liste döndürür.</p>
<pre class="py">tutarlar = [1499.9, 250, 89.5, 3200, 475]
sirali = sorted(tutarlar)
print(sirali)
print(tutarlar)                       # orijinal aynı
tutarlar.sort(reverse=True)           # yerinde, büyükten küçüğe
print(tutarlar)
print("En büyük 3:", tutarlar[:3])
sehirler = ["İzmir", "ankara", "Bursa"]
print(sorted(sehirler))
print(sorted(sehirler, key=str.lower))</pre>
<p>Son iki satır önemli bir ayrıntıyı gösterir: sıralama büyük-küçük harfe duyarlıdır, büyük harfler önce gelir. <code>key=str.lower</code> ile "küçük harfli hâline göre sırala" dersin. Türkçe karakterler için tam alfabetik sıralama <code>locale</code> modülü gerektirir; raporda genellikle <code>key=str.lower</code> yeterlidir.</p>
<div class="tip"><b>Hangisini seçmeli?</b>Orijinal sıralamaya tekrar ihtiyacın olacaksa <code>sorted</code>, olmayacaksa <code>sort</code> (bellek kullanmaz). Zincirleme bir ifadede, örneğin <code>sorted(x)[:3]</code>, yalnızca sorted çalışır.</div>

<h2>İç içe liste: küçük bir tablo</h2>
<p>Her sipariş birden fazla bilgi taşıyorsa her satır bir liste, tüm satırlar da bir liste olur. Bu, bir tablonun en basit hâlidir.</p>
<pre class="py">siparisler = [
    ["AM-101", "İzmir", 1499.9],
    ["AM-102", "Ankara", 250],
    ["AM-103", "İzmir", 89.5],
]
print(siparisler[1])            # ikinci satır
print(siparisler[1][2])         # ikinci satırın tutarı
siparisler[2][2] = 99.5         # tutarı düzelt
print(siparisler[2])
siparisler.append(["AM-104", "Bursa", 3200])
print(len(siparisler), "satır")
print(siparisler[0][1], siparisler[-1][1])</pre>
<p>İlk indeks satırı, ikinci indeks sütunu seçer. Döngüleri öğrenince bu yapıyı satır satır gezip şehir bazlı toplam çıkaracaksın; sözlükler dersinde ise sütunlara isimle erişmenin daha okunur yolunu göreceksin.</p>

<h2>Listeyi listeyle birleştirmek ve karşılaştırmak</h2>
<pre class="py">sabah = ["AM-101", "AM-102"]
ogle = ["AM-103"]
gun = sabah + ogle              # yeni liste
print(gun)
print(sabah * 2)                # tekrar
print(sabah == ["AM-101", "AM-102"])   # içerik karşılaştırma
print([] == [], len([]))
print(gun[1:] == ["AM-102", "AM-103"])</pre>
<p><code>+</code> iki listeden yeni bir liste üretir; <code>extend</code> ise var olanı yerinde büyütür. <code>==</code> sıra ve içerik aynıysa True verir. Boş liste <code>[]</code>, koşullarda False gibi davranır; "sipariş var mı" sorusunu <code>if siparisler:</code> ile soracaksın.</p>

<h2>Kopyalama tuzağı</h2>
<p>Burası herkesin bir kere başına gelen hata. <code>b = a</code> yazmak listeyi kopyalamaz; aynı listeye ikinci bir etiket takar. Birini değiştirdiğinde diğeri de değişir çünkü ikisi de aynı nesnedir.</p>
<pre class="py">onayli = ["AM-101", "AM-102"]
yedek = onayli                 # kopya DEĞİL, aynı liste
yedek.append("AM-103")
print("onayli:", onayli)       # o da değişti!
print(onayli is yedek)

gercek_yedek = onayli.copy()   # ya da onayli[:] ya da list(onayli)
gercek_yedek.append("AM-999")
print("onayli:", onayli)
print("gercek_yedek:", gercek_yedek)
print(onayli is gercek_yedek)</pre>
<p><code>is</code> operatörü "aynı nesne mi" diye sorar; <code>==</code> ise "içerikleri eşit mi". <code>copy()</code>, <code>[:]</code> ve <code>list()</code> üçü de yüzeysel kopya (shallow copy) alır: dış liste yeni, ama içindeki listeler hâlâ paylaşılır. İç içe listelerde tam bağımsız kopya için <code>copy.deepcopy</code> gerekir.</p>
<div class="note"><b>Neden metinlerde bu sorun yoktu?</b>Metin değişmezdir; onu "değiştiren" her işlem yeni nesne üretir, dolayısıyla paylaşılan nesne hiç bozulmaz. Liste yerinde değiştiğinden paylaşım görünür hâle gelir. Aynı tuzak sözlük ve kümelerde de vardır.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Fonksiyona liste vermek</h3>
<p>Bir fonksiyon parametre olarak liste alıp <code>append</code> yaparsa çağıranın listesi de değişir; bu kopyalama tuzağının fonksiyon hâlidir. İyi uygulama: fonksiyon ya listeyi değiştirdiğini adıyla belli eder (<code>listeye_ekle</code>) ya da hiç dokunmayıp yeni liste döndürür. Varsayılan parametre olarak <code>def f(x=[])</code> yazmak ise klasik bir tuzaktır; fonksiyonlar dersinde göreceksin.</p>
<h3>Liste ne zaman yanlış araçtır?</h3>
<p>Liste "var mı" sorusunu baştan sona tarayarak yanıtlar; yüz bin müşteri numarasının içinde arama yapacaksan küme (set) ya da sözlük (dict) çok daha hızlıdır. Listenin başından sürekli eleman çıkarmak (<code>pop(0)</code>) da yavaştır; kuyruk için <code>collections.deque</code> vardır. Sayısal hesaplar içinse numpy dizileri hem hızlı hem bellek dostudur. Liste, sıralı ve küçük-orta boyutlu veri için doğru araçtır.</p>
<h3>Comprehension'a hazırlık</h3>
<p>Orta seviyede <code>[t * 1.2 for t in tutarlar]</code> gibi tek satırda yeni liste üreten liste kavrayışlarını (list comprehension) öğreneceksin. Şimdi append ile adım adım yaptığın her şey orada tek ifadeye inecek; temel sağlamsa geçiş bir gün sürer.</p>
</section>
`,
  ex: [
    { t: 'code', id: 'listeler-1',
      q: '<p>Bugünkü tutarlar <code>tutarlar = [1499.9, 250, 89.5, 3200, 475]</code>. Üç değişken hesapla: <code>toplam</code> (tüm tutarların toplamı), <code>en_buyuk</code> (en büyük tutar) ve <code>ortalama</code> (2 basamağa yuvarlanmış ortalama).</p>',
      start: 'tutarlar = [1499.9, 250, 89.5, 3200, 475]\n# toplam, en_buyuk, ortalama\n',
      sol: 'tutarlar = [1499.9, 250, 89.5, 3200, 475]\ntoplam = sum(tutarlar)\nen_buyuk = max(tutarlar)\nortalama = round(toplam / len(tutarlar), 2)\nprint(toplam, en_buyuk, ortalama)\n',
      tests: 'assert abs(toplam - 5514.4) < 1e-6, "toplam 5514.4 olmalı"\nassert en_buyuk == 3200, "en_buyuk 3200 olmalı"\nassert abs(ortalama - 1102.88) < 1e-6, "ortalama 1102.88 olmalı"\n',
      hints: ['sum, max ve len hazır fonksiyonlardır.', 'ortalama = round(toplam / len(tutarlar), 2)'],
      why: 'Hazır fonksiyonlar liste üzerinde doğrudan çalışır; döngüye gerek kalmaz.' },
    { t: 'code', id: 'listeler-2',
      q: '<p>Bekleyen sipariş kuyruğu <code>kuyruk = ["AM-101", "AM-102", "AM-103"]</code>. Şu işlemleri sırayla yap: sona <code>"AM-104"</code> ekle; başa <code>"AM-100"</code> ekle; baştaki elemanı <code>pop</code> ile çıkarıp <code>islenen</code> değişkenine koy; <code>"AM-102"</code> değerini <code>remove</code> ile sil. Sonunda <code>kuyruk</code> şöyle olmalı: <code>["AM-101", "AM-103", "AM-104"]</code>.</p>',
      start: 'kuyruk = ["AM-101", "AM-102", "AM-103"]\n# işlemleri sırayla uygula\n',
      sol: 'kuyruk = ["AM-101", "AM-102", "AM-103"]\nkuyruk.append("AM-104")\nkuyruk.insert(0, "AM-100")\nislenen = kuyruk.pop(0)\nkuyruk.remove("AM-102")\nprint(islenen, kuyruk)\n',
      tests: 'assert islenen == "AM-100", "islenen AM-100 olmalı (başa eklenen çıkarıldı)"\nassert kuyruk == ["AM-101", "AM-103", "AM-104"], "kuyruk [AM-101, AM-103, AM-104] olmalı"\n',
      hints: ['insert(0, x) başa ekler; pop(0) baştakini çıkarır.', 'remove değere göre siler, pop konuma göre.'],
      why: 'append/insert ekler, pop konumdan çıkarıp döndürür, remove değere göre siler; hepsi listeyi yerinde değiştirir.' },
    { t: 'mc', q: '<code>a = [3, 1, 2]</code> için <code>b = a.sort()</code> yazarsan <code>b</code> ne olur?',
      o: ['[1, 2, 3]', '[3, 1, 2]', 'None', 'Hata verir'], a: 2,
      why: 'sort() listeyi yerinde sıralar ve None döndürür; b None olur, a ise [1, 2, 3]. Yeni liste istiyorsan sorted(a) kullan.' },
    { t: 'code', id: 'listeler-3',
      q: '<p><code>en_buyuk_uc(tutarlar)</code> fonksiyonu yaz: verilen tutar listesinin en büyük üç değerini büyükten küçüğe yeni bir liste olarak döndürsün. <b>Orijinal liste değişmemeli</b> (sorted kullan).</p>',
      start: 'def en_buyuk_uc(tutarlar):\n    pass\n',
      sol: 'def en_buyuk_uc(tutarlar):\n    return sorted(tutarlar, reverse=True)[:3]\n',
      tests: 'veri = [1499.9, 250, 89.5, 3200, 475]\nassert en_buyuk_uc(veri) == [3200, 1499.9, 475], "en büyük üç: [3200, 1499.9, 475]"\nassert veri == [1499.9, 250, 89.5, 3200, 475], "orijinal liste değişmemeli; sorted kullan"\nassert en_buyuk_uc([5, 1]) == [5, 1], "kısa listede eldekini döndür"\n',
      hints: ['sorted(liste, reverse=True) büyükten küçüğe yeni liste verir.', 'Dilim [:3] ilk üçü alır.'],
      why: 'sorted orijinale dokunmaz; reverse=True ve dilim ile en büyük üç elde edilir.' },
    { t: 'mc', q: 'Aşağıdaki kod ne yazdırır?<br><code>a = [1, 2]<br>b = a<br>b.append(3)<br>print(a)</code>',
      o: ['[1, 2]', '[1, 2, 3]', 'Hata verir', '[3]'], a: 1,
      why: 'b = a kopyalamaz; iki ad aynı listeye işaret eder. b üzerinden eklenen eleman a\'da da görünür. Kopya için a.copy() gerekir.' },
    { t: 'code', id: 'listeler-4',
      q: '<p>Sipariş tablosu iç içe liste olarak verildi. <code>izmir_toplam</code> adlı değişkende yalnızca şehri <code>"İzmir"</code> olan satırların tutar toplamını hesapla. Henüz döngü bilmiyorsan satırlara indeksle tek tek erişebilirsin (0. ve 2. satır İzmir). Ayrıca 3. satırın (indeks 3) tutarını <code>3300</code> olarak düzelt.</p>',
      start: 'siparisler = [\n    ["AM-101", "İzmir", 1499.9],\n    ["AM-102", "Ankara", 250],\n    ["AM-103", "İzmir", 89.5],\n    ["AM-104", "Bursa", 3200],\n]\n# izmir_toplam hesapla, AM-104 tutarını 3300 yap\n',
      sol: 'siparisler = [\n    ["AM-101", "İzmir", 1499.9],\n    ["AM-102", "Ankara", 250],\n    ["AM-103", "İzmir", 89.5],\n    ["AM-104", "Bursa", 3200],\n]\nizmir_toplam = siparisler[0][2] + siparisler[2][2]\nsiparisler[3][2] = 3300\nprint(izmir_toplam, siparisler[3])\n',
      tests: 'assert abs(izmir_toplam - 1589.4) < 1e-6, "izmir_toplam 1589.4 olmalı"\nassert siparisler[3][2] == 3300, "AM-104 tutarı 3300 olmalı"\nassert siparisler[3][0] == "AM-104", "diğer alanlar değişmemeli"\n',
      hints: ['siparisler[0][2] ilk satırın tutarı.', 'siparisler[3][2] = 3300 yerinde değiştirir.'],
      why: 'İlk indeks satırı, ikinci indeks sütunu seçer; iç liste değiştirilebilir olduğundan yerinde atama yapılır.' },
    { t: 'mc', q: '<code>a = [1, 2]</code> ve <code>a.append([3, 4])</code> sonrası <code>len(a)</code> kaçtır?',
      o: ['4', '2', '3', 'Hata verir'], a: 2,
      why: 'append tek bir eleman ekler; [3, 4] listesi tek eleman olarak girer ve a = [1, 2, [3, 4]] olur. Dört elemanlı liste için extend gerekir.' },
    { t: 'code', id: 'listeler-5',
      q: '<p><code>guvenli_kopya_ekle(liste, eleman)</code> fonksiyonu yaz: verilen listenin bir <b>kopyasını</b> alıp sonuna elemanı eklesin ve yeni listeyi döndürsün. Orijinal liste kesinlikle değişmemeli.</p>',
      start: 'def guvenli_kopya_ekle(liste, eleman):\n    pass\n',
      sol: 'def guvenli_kopya_ekle(liste, eleman):\n    yeni = liste.copy()\n    yeni.append(eleman)\n    return yeni\n',
      tests: 'orijinal = ["AM-101", "AM-102"]\nsonuc = guvenli_kopya_ekle(orijinal, "AM-103")\nassert sonuc == ["AM-101", "AM-102", "AM-103"], "yeni liste elemanı içermeli"\nassert orijinal == ["AM-101", "AM-102"], "orijinal liste değişmemeli; copy() kullan"\nassert sonuc is not orijinal, "farklı bir liste nesnesi dönmeli"\n',
      hints: ['liste.copy() ya da liste[:] yeni liste verir.', 'Kopyaya append yap, kopyayı döndür.'],
      why: 'Kopya almadan append yaparsan çağıranın listesi bozulur; copy bu tuzağı önler.' }
  ],
  faq: [
    { q: "Liste ile metin aynı şekilde dilimleniyor, farkları ne?", a: "Dilimleme ve indeks kuralları aynı. Temel fark: liste değiştirilebilir (eleman atayabilir, ekleyip silebilirsin), metin değişmez. Ayrıca liste her türden eleman tutar, metin yalnızca karakter." },
    { q: "pop() ile remove() arasındaki fark ne?", a: "pop konuma göre çıkarır ve çıkardığı elemanı döndürür (parametresiz sonuncuyu alır). remove değere göre ilk eşleşeni siler ve hiçbir şey döndürmez." },
    { q: "Listenin içindeki listeleri de kopyalamak istersem?", a: "copy() yüzeysel kopya alır; iç listeler paylaşılmaya devam eder. Tam bağımsız kopya için import copy; copy.deepcopy(liste) kullan." }
  ],
  mistakes: [
    { bad: 'sirali = tutarlar.sort()\nprint(sirali)', good: 'sirali = sorted(tutarlar)\nprint(sirali)', why: 'sort() None döndürür; sıralı yeni liste için sorted() kullan.' },
    { bad: 'a = [1, 2]\na.append([3, 4])', good: 'a = [1, 2]\na.extend([3, 4])', why: 'append listeyi tek eleman olarak iç içe ekler; elemanları eklemek için extend.' },
    { bad: 'yedek = liste\nyedek.append(x)', good: 'yedek = liste.copy()\nyedek.append(x)', why: 'Atama kopya oluşturmaz; iki ad aynı listeyi paylaşır.' },
    { bad: 'liste = [1, 2, 3]\nprint(liste[3])', good: 'liste = [1, 2, 3]\nprint(liste[-1])', why: 'Üç elemanlı listenin son indeksi 2\'dir; 3 IndexError verir. Son eleman için -1 kullan.' }
  ]
},

/* ───────────────────────── 8. demet-kume ───────────────────────── */
{
  id: 'demet-kume',
  lv: 'temel',
  mod: 'Veri Türleri',
  min: 22,
  title: 'Demet (tuple) ve küme (set)',
  sum: 'Değişmez kayıtlar için demeti, benzersiz değerler ve küme işlemleri için kümeyi öğrenir; liste, demet ve küme arasında ne zaman hangisini seçeceğini kavrarsın.',
  goals: [
    'Demet oluşturup açma (unpacking) ile elemanlarını değişkenlere dağıtabilirim.',
    'Demetin değişmezliğinin ne sağladığını ve ne zaman tercih edileceğini açıklayabilirim.',
    'Kümeyle tekrarları kaldırıp hızlı üyelik testi yapabilirim.',
    'Birleşim, kesişim ve fark işlemleriyle iki müşteri grubunu karşılaştırabilirim.',
    'Liste, demet ve küme arasından göreve uygun yapıyı seçebilirim.'
  ],
  body: `
<h2>İki yeni kap</h2>
<p>Liste çoğu işi görür ama iki durumda eksik kalır. Birincisi: bazı veriler asla değişmemeli; bir şubenin koordinatı, bir siparişin (kod, tarih) kimliği. İkincisi: bazen sırayla değil "hangileri var" ile ilgilenirsin; Anadolu Market'ten alışveriş yapmış benzersiz şehirler, hem kredi kartı hem mevduat müşterisi olanlar. İlk iş için <b>demet</b> (tuple), ikincisi için <b>küme</b> (set) var.</p>

<h2>Demet: değişmez liste</h2>
<p>Demet, parantezle yazılan ve oluşturulduktan sonra <b>değiştirilemeyen</b> sıralı bir koleksiyondur. İndeks, dilim, <code>len</code>, <code>in</code> hepsi listeyle aynı çalışır; sadece ekleme, silme ve atama yoktur.</p>
<pre class="py">sube = ("Ilgaz Bank Konak", 38.4189, 27.1287)
print(sube[0])
print(sube[1:])
print(len(sube), "Konak" in sube[0])
tek = (42,)             # tek elemanlı demet: virgül şart
degil = (42)            # bu sadece 42 sayısı
print(type(tek), type(degil))
parantezsiz = 1, 2, 3   # parantez bile gerekmez
print(parantezsiz)</pre>
<p>Tek elemanlı demette virgül şarttır; <code>(42)</code> yalnızca bir sayıdır. Aslında demeti yapan şey parantez değil virgüldür: <code>1, 2, 3</code> tek başına bir demettir. Sayılar dersinde <code>1499,90</code> yazınca demet oluşmasının sebebi buydu.</p>
<pre class="py">sube = ("Konak", 38.4189, 27.1287)
try:
    sube[0] = "Alsancak"
except TypeError as hata:
    print("Değiştirilemez:", hata)
yeni_sube = ("Alsancak",) + sube[1:]
print(yeni_sube)</pre>
<p>Değiştirmek istersen metinlerde olduğu gibi yeni bir demet kurarsın. Buradaki <code>try/except</code> yapısını Hatalar dersinde öğreneceksin; şimdilik "hata verir ama program durmasın" diye oku.</p>

<h2>Açma (unpacking)</h2>
<p>Demetin en güçlü yanı: elemanlarını tek satırda ayrı değişkenlere dağıtabilirsin. Buna açma (unpacking) denir ve fonksiyonlar birden fazla değer döndürürken sürekli karşına çıkar.</p>
<pre class="py">sube = ("Konak", 38.4189, 27.1287)
ad, enlem, boylam = sube
print(ad, enlem, boylam)
a, b = 10, 20
a, b = b, a                    # takas, geçici değişkensiz
print(a, b)
bolum, kalan = divmod(10000, 3)
print(bolum, kalan)
ilk, *orta, son = [1, 2, 3, 4, 5]
print(ilk, orta, son)</pre>
<p>Sol taraftaki değişken sayısı eleman sayısıyla eşleşmeli, yoksa ValueError alırsın. Yıldızlı ad (<code>*orta</code>) "geri kalan hepsi" demektir ve liste olarak gelir. Açma yalnızca demet için değil liste ve her yinelenebilir için çalışır.</p>
<div class="tip"><b>Demet ne zaman?</b>Elemanların sayısı ve anlamı sabitse demet kullan: (enlem, boylam), (ad, soyad), (yıl, ay, gün). Elemanlar aynı türden ve sayısı değişkense liste: sipariş tutarları, şehir adları. Demet ayrıca sözlük anahtarı olabilir; liste olamaz.</div>

<h2>Küme: benzersiz elemanlar</h2>
<p>Küme süslü parantezle yazılır, sırasızdır ve her elemanı yalnızca bir kez tutar. Bir listeyi <code>set()</code>'e vermek tekrarları anında kaldırır.</p>
<pre class="py">sehirler = ["İzmir", "Ankara", "İzmir", "Bursa", "İzmir", "Ankara"]
benzersiz = set(sehirler)
print(benzersiz)
print(len(benzersiz), "farklı şehir")
benzersiz.add("İstanbul")
benzersiz.add("Ankara")            # zaten var, bir şey olmaz
benzersiz.discard("Bursa")         # yoksa da hata vermez
print(sorted(benzersiz))           # sıralı görmek için listeye çevir
print("İzmir" in benzersiz)
bos = set()                        # {} boş sözlük olur, dikkat</pre>
<p>Küme sırasız olduğundan indeksle erişemezsin (<code>benzersiz[0]</code> hata verir) ve yazdırınca sıra her çalıştırmada farklı olabilir. Sıralı görmek için <code>sorted</code> kullan. Kümenin asıl gücü hızdır: <code>in</code> sorgusu listede baştan sona tarama yaparken kümede eleman sayısından bağımsız, neredeyse anında yanıtlanır. Yüz binlerce müşteri numarası içinde arama yapacaksan küme kullan.</p>
<div class="warn"><b>Küme elemanları değişmez olmalı</b>Kümeye sayı, metin ve demet koyabilirsin ama liste ya da sözlük koyamazsın; <code>{[1, 2]}</code> TypeError verir. Sebep: küme elemanları için karma (hash) hesaplar ve değişebilen nesnelerin karması tutarlı olmaz.</div>

<h2>Demeti listeye, listeyi demete</h2>
<p>İki yapı arasında geçiş ucuzdur: <code>list()</code> ve <code>tuple()</code> dönüşüm yapar. Bir kaydı değiştirmen gerektiğinde listeye çevirir, düzeltir, sonra tekrar demete dönersin.</p>
<pre class="py">kayit = ("AM-101", "İzmir", 1499.9)
gecici = list(kayit)
gecici[2] = 1399.9
kayit = tuple(gecici)
print(kayit, type(kayit))
print(kayit.count("İzmir"), kayit.index(1399.9))
print(tuple("abc"))</pre>
<p>Demetin yalnızca iki metodu vardır: <code>count</code> ve <code>index</code>. Daha fazlasına ihtiyaç duyuyorsan muhtemelen liste istiyorsundur; bu da demetin sana verdiği bir sinyal.</p>

<h2>Küme işlemleri</h2>
<p>Ilgaz Bank'ta iki müşteri grubu var: kredi kartı olanlar ve mevduat hesabı olanlar. Pazarlama ekibi şunu soruyor: hangileri ikisine de sahip, hangileri yalnızca kredi kartına sahip, toplam kaç farklı müşteri var?</p>
<pre class="py">kredi_karti = {"M-101", "M-102", "M-103", "M-104"}
mevduat = {"M-103", "M-104", "M-105"}
print("Her ikisi:", kredi_karti &amp; mevduat)       # kesişim
print("Toplam farklı:", kredi_karti | mevduat)    # birleşim
print("Sadece kart:", kredi_karti - mevduat)      # fark
print("Yalnız birinde:", kredi_karti ^ mevduat)   # simetrik fark
print(kredi_karti.intersection(mevduat))         # aynı şey, metot hâli
print({"M-103"} &lt;= mevduat)                       # alt küme mi?</pre>
<div class="tbl-wrap"><table>
<tr><th>İşlem</th><th>Operatör</th><th>Metot</th><th>Anlamı</th></tr>
<tr><td>Birleşim</td><td><code>a | b</code></td><td><code>a.union(b)</code></td><td>Herhangi birinde olanlar</td></tr>
<tr><td>Kesişim</td><td><code>a &amp; b</code></td><td><code>a.intersection(b)</code></td><td>İkisinde de olanlar</td></tr>
<tr><td>Fark</td><td><code>a - b</code></td><td><code>a.difference(b)</code></td><td>a'da olup b'de olmayanlar</td></tr>
<tr><td>Simetrik fark</td><td><code>a ^ b</code></td><td><code>a.symmetric_difference(b)</code></td><td>Yalnızca birinde olanlar</td></tr>
<tr><td>Alt küme</td><td><code>a &lt;= b</code></td><td><code>a.issubset(b)</code></td><td>a'nın tamamı b'de mi</td></tr>
</table></div>
<p>Bu dört işlem, SQL'deki JOIN ve EXCEPT sorgularının Python karşılığıdır. "Geçen ay alışveriş yapıp bu ay yapmayan müşteriler" sorusu tek bir fark işlemidir: <code>gecen_ay - bu_ay</code>.</p>

<h2>Hangisini ne zaman?</h2>
<div class="tbl-wrap"><table>
<tr><th>Özellik</th><th>Liste</th><th>Demet</th><th>Küme</th></tr>
<tr><td>Yazım</td><td><code>[1, 2]</code></td><td><code>(1, 2)</code></td><td><code>{1, 2}</code></td></tr>
<tr><td>Sıralı</td><td>Evet</td><td>Evet</td><td>Hayır</td></tr>
<tr><td>Değiştirilebilir</td><td>Evet</td><td>Hayır</td><td>Evet (elemanlar değişmez)</td></tr>
<tr><td>Tekrar</td><td>Olabilir</td><td>Olabilir</td><td>Olamaz</td></tr>
<tr><td>İndeks</td><td>Var</td><td>Var</td><td>Yok</td></tr>
<tr><td>Tipik iş</td><td>Sıralı kayıtlar</td><td>Sabit yapılı kayıt, çoklu dönüş</td><td>Benzersizlik, üyelik, karşılaştırma</td></tr>
</table></div>
<div class="note"><b>frozenset</b>Değişmez küme istersen <code>frozenset</code> var; kümelerin kümesini yaparken ya da sözlük anahtarı olarak küme kullanırken gerekir. Nadir ama var olduğunu bil.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Demet neden sözlük anahtarı olabilir?</h3>
<p>Sözlükler ve kümeler elemanı bulmak için karma (hash) değeri kullanır. Karma, nesnenin içeriğinden hesaplanır; içerik değişirse karma da değişir ve nesne kaybolur. Demet değişmez olduğundan karması sabittir, bu yüzden <code>{("İzmir", 2025): 1500}</code> gibi bileşik anahtarlar kurabilirsin. Şehir-yıl bazlı özetlerde çok işe yarar.</p>
<h3>namedtuple ve dataclass'a doğru</h3>
<p><code>sube[1]</code> okunur değildir; enlem mi boylam mı? <code>collections.namedtuple</code> demete alan adı verir: <code>sube.enlem</code>. Python 3.7'den beri <code>dataclass</code> aynı işi daha güçlü yapar. Orta seviyede ikisini de göreceksin; şimdilik demet, "küçük ve sabit kayıt" için yeterli.</p>
<h3>Büyük veri setlerinde küme</h3>
<p>İki büyük listeyi "hangi elemanlar ortak" diye iç içe döngüyle karşılaştırmak eleman sayısının karesiyle büyür: on bin eleman için yüz milyon karşılaştırma. Kümeye çevirip kesişim almak doğrusal zamanda biter. Analist olarak öğreneceğin ilk performans kuralı budur: üyelik ve karşılaştırma işlerinde listeyi kümeye çevir.</p>
</section>
`,
  ex: [
    { t: 'code', id: 'demet-kume-1',
      q: '<p>Şube bilgisi demet olarak verildi: <code>sube = ("Konak", 38.4189, 27.1287)</code>. Açma (unpacking) ile üç elemanı <code>ad</code>, <code>enlem</code> ve <code>boylam</code> değişkenlerine dağıt. Tek satırda yap.</p>',
      start: 'sube = ("Konak", 38.4189, 27.1287)\n# açma ile üç değişkene dağıt\n',
      sol: 'sube = ("Konak", 38.4189, 27.1287)\nad, enlem, boylam = sube\nprint(ad, enlem, boylam)\n',
      tests: 'assert ad == "Konak", "ad Konak olmalı"\nassert abs(enlem - 38.4189) < 1e-9, "enlem 38.4189 olmalı"\nassert abs(boylam - 27.1287) < 1e-9, "boylam 27.1287 olmalı"\n',
      hints: ['Sol tarafa üç değişken, sağa demeti yaz.', 'ad, enlem, boylam = sube'],
      why: 'Açma, demetin elemanlarını sırayla sol taraftaki adlara dağıtır.' },
    { t: 'mc', q: '<code>t = (5)</code> ve <code>u = (5,)</code> ifadelerinin türleri sırasıyla nedir?',
      o: ['tuple ve tuple', 'int ve tuple', 'tuple ve int', 'int ve list'], a: 1,
      why: 'Demeti oluşturan şey virgüldür. (5) sadece parantezli bir sayıdır (int); (5,) ise tek elemanlı demettir.' },
    { t: 'code', id: 'demet-kume-2',
      q: '<p><code>benzersiz_sehirler(sehirler)</code> fonksiyonu yaz: tekrarlı şehir listesini alıp tekrarları kaldırılmış ve <b>alfabetik sıralı bir liste</b> döndürsün. Örnek: <code>["İzmir", "Ankara", "İzmir", "Bursa"]</code> → <code>["Ankara", "Bursa", "İzmir"]</code>.</p>',
      start: 'def benzersiz_sehirler(sehirler):\n    pass\n',
      sol: 'def benzersiz_sehirler(sehirler):\n    return sorted(set(sehirler))\n',
      tests: 'assert benzersiz_sehirler(["İzmir", "Ankara", "İzmir", "Bursa"]) == ["Ankara", "Bursa", "İzmir"], "tekrarsız ve sıralı olmalı"\nassert benzersiz_sehirler([]) == [], "boş liste için boş liste"\nassert benzersiz_sehirler(["A", "A", "A"]) == ["A"], "tek şehir"\n',
      hints: ['set() tekrarları kaldırır.', 'sorted(set(...)) sıralı liste verir.'],
      why: 'set benzersizleştirir, sorted hem sıralar hem de kümeyi listeye çevirir.' },
    { t: 'code', id: 'demet-kume-3',
      q: '<p>Ilgaz Bank müşteri grupları: <code>kredi_karti = {"M-101", "M-102", "M-103", "M-104"}</code> ve <code>mevduat = {"M-103", "M-104", "M-105"}</code>. Üç küme hesapla: <code>her_ikisi</code> (kesişim), <code>sadece_kart</code> (kartı olup mevduatı olmayanlar) ve <code>tum_musteriler</code> (birleşim).</p>',
      start: 'kredi_karti = {"M-101", "M-102", "M-103", "M-104"}\nmevduat = {"M-103", "M-104", "M-105"}\n# her_ikisi, sadece_kart, tum_musteriler\n',
      sol: 'kredi_karti = {"M-101", "M-102", "M-103", "M-104"}\nmevduat = {"M-103", "M-104", "M-105"}\nher_ikisi = kredi_karti & mevduat\nsadece_kart = kredi_karti - mevduat\ntum_musteriler = kredi_karti | mevduat\nprint(sorted(her_ikisi), sorted(sadece_kart), len(tum_musteriler))\n',
      tests: 'assert her_ikisi == {"M-103", "M-104"}, "her_ikisi kesişim olmalı"\nassert sadece_kart == {"M-101", "M-102"}, "sadece_kart fark olmalı"\nassert tum_musteriler == {"M-101", "M-102", "M-103", "M-104", "M-105"}, "tum_musteriler birleşim olmalı"\n',
      hints: ['& kesişim, - fark, | birleşim.', 'her_ikisi = kredi_karti & mevduat'],
      why: 'Küme operatörleri SQL JOIN ve EXCEPT mantığını tek karakterle verir.' },
    { t: 'mc', q: 'Aşağıdakilerden hangisi bir kümeye eleman olarak <b>eklenemez</b>?',
      o: ['"İzmir"', '(38.4, 27.1)', '[1, 2]', '42'], a: 2,
      why: 'Küme elemanları karma (hash) alabilen, yani değişmez nesneler olmalı. Liste değiştirilebilir olduğu için eklenemez; metin, demet ve sayı eklenebilir.' },
    { t: 'code', id: 'demet-kume-4',
      q: '<p><code>kaybedilen_musteriler(gecen_ay, bu_ay)</code> fonksiyonu yaz. İki parametre de müşteri numarası listesidir (tekrar içerebilir). Geçen ay alışveriş yapıp bu ay yapmayan müşterilerin <b>sıralı listesini</b> döndürsün.</p>',
      start: 'def kaybedilen_musteriler(gecen_ay, bu_ay):\n    pass\n',
      sol: 'def kaybedilen_musteriler(gecen_ay, bu_ay):\n    return sorted(set(gecen_ay) - set(bu_ay))\n',
      tests: 'assert kaybedilen_musteriler(["M-1", "M-2", "M-3", "M-2"], ["M-2", "M-4"]) == ["M-1", "M-3"], "M-1 ve M-3 kaybedildi"\nassert kaybedilen_musteriler(["M-1"], ["M-1"]) == [], "herkes kaldıysa boş liste"\nassert kaybedilen_musteriler([], ["M-9"]) == [], "geçen ay kimse yoksa boş"\n',
      hints: ['Listeleri set() ile kümeye çevir.', 'Fark işlemi: set(gecen_ay) - set(bu_ay)'],
      why: 'Fark işlemi, ilk kümede olup ikincide olmayanları verir; sorted sonucu sıralı listeye çevirir.' },
    { t: 'mc', q: 'Bir siparişin (kod, tarih, tutar) üçlüsünü saklamak için hangi yapı en uygundur?',
      o: ['Küme, çünkü hızlıdır', 'Liste, çünkü sonradan alan ekleyip çıkarmak gerekebilir', 'Demet, çünkü yapı sabittir ve sözlük anahtarı olabilir', 'Metin'], a: 2,
      why: 'Eleman sayısı ve anlamı sabit olan kayıtlar için demet idealdir; yanlışlıkla değiştirilemez ve gerekirse sözlük anahtarı olur. Küme sırayı korumaz.' }
  ],
  faq: [
    { q: "Demet listeye göre ne avantaj sağlıyor, sadece değişmezlik mi?", a: "Değişmezlik en önemlisi: yanlışlıkla bozulmaz, sözlük anahtarı ve küme elemanı olabilir. Ayrıca biraz daha az bellek kullanır ve niyeti belli eder: bunu değiştirmeyeceğim." },
    { q: "Küme neden sırasız, listedeki sırayı koruyamaz mı?", a: "Küme elemanları karma değerine göre yerleştirilir; bu hız sağlar ama sırayı kaybeder. Sırayı koruyarak tekrarları kaldırmak için list(dict.fromkeys(liste)) hilesi kullanılır; sözlükler ekleme sırasını korur." },
    { q: "Boş küme nasıl oluşturulur?", a: "set() ile. {} yazarsan boş sözlük oluşur; bu, Python'da süslü parantezin önce sözlüğe ait olmasından kaynaklanır." }
  ],
  mistakes: [
    { bad: 'tek = (42)', good: 'tek = (42,)', why: 'Virgül olmadan parantez yalnızca gruplama yapar; tek elemanlı demet için virgül şart.' },
    { bad: 'bos = {}\nbos.add(1)', good: 'bos = set()\nbos.add(1)', why: '{} boş sözlüktür ve add metodu yoktur; boş küme set() ile oluşturulur.' },
    { bad: 'k = {1, 2, 3}\nprint(k[0])', good: 'k = {1, 2, 3}\nprint(sorted(k)[0])', why: 'Küme sırasızdır ve indekslenemez; sıralı erişim için önce listeye çevir.' },
    { bad: 'ad, enlem = ("Konak", 38.4, 27.1)', good: 'ad, enlem, boylam = ("Konak", 38.4, 27.1)', why: 'Açmada değişken sayısı eleman sayısına eşit olmalı; yoksa ValueError.' }
  ]
},

/* ───────────────────────── 9. sozlukler ───────────────────────── */
{
  id: 'sozlukler',
  lv: 'temel',
  mod: 'Veri Türleri',
  min: 26,
  title: 'Sözlükler (dict)',
  sum: 'Müşteri ve sipariş kayıtlarını anahtar-değer çiftleriyle tutar; get, items ve update ile güvenle okur-günceller; iç içe sözlükle JSON benzeri yapı kurar ve sayım kalıbını öğrenirsin.',
  goals: [
    'Sözlük oluşturup anahtarla değer okuyabilir, ekleyebilir ve silebilirim.',
    'get ile eksik anahtarı hatasız yönetebilir, keys/values/items ile içeriği gezebilirim.',
    'update ve yerinde atama ile kayıtları güncelleyebilirim.',
    'İç içe sözlükle müşteri-sipariş gibi hiyerarşik veriyi modelleyebilir, JSON ile ilişkisini açıklayabilirim.',
    'Sayım kalıbıyla bir listedeki değerlerin kaç kez geçtiğini bulabilirim.'
  ],
  body: `
<h2>İsimle erişmek</h2>
<p>Listeler dersinde bir siparişi <code>["AM-101", "İzmir", 1499.9]</code> diye tutmuştun. Üç ay sonra <code>siparis[2]</code> gördüğünde bunun tutar olduğunu hatırlayacak mısın? <b>Sözlük</b> (dictionary, dict) her değere bir <b>anahtar</b> (key) verir: <code>siparis["tutar"]</code>. Anadolu Market'in müşteri kaydı, Ilgaz Bank'ın hesap bilgisi, bir API'den dönen yanıt: iş dünyasındaki verinin büyük kısmı bu biçimdedir.</p>
<pre class="py">musteri = {
    "no": "M-101",
    "ad": "Ayşe Yılmaz",
    "sehir": "İzmir",
    "bakiye": 12500.0,
    "aktif": True,
}
print(musteri["ad"])
print(musteri["bakiye"] + 500)
print(len(musteri), "alan")
print(type(musteri))</pre>
<p>Süslü parantez içinde <code>anahtar: değer</code> çiftleri. Anahtar genelde metindir ama sayı ve demet de olabilir; değişmez olması yeter. Değer ise her şey olabilir: sayı, metin, liste, hatta başka bir sözlük. Python 3.7'den beri sözlük, anahtarların ekleme sırasını korur.</p>

<h2>Okuma: köşeli parantez mi get mi?</h2>
<p>Var olmayan anahtarı köşeli parantezle istersen KeyError alırsın. <code>get</code> ise bulamazsa <code>None</code> ya da senin verdiğin varsayılanı döndürür ve programı durdurmaz.</p>
<pre class="py">musteri = {"no": "M-101", "ad": "Ayşe Yılmaz", "sehir": "İzmir"}
print(musteri.get("sehir"))
print(musteri.get("telefon"))              # None
print(musteri.get("telefon", "kayıtlı değil"))
print("telefon" in musteri)                # anahtar var mı?
print("ad" in musteri)
try:
    print(musteri["telefon"])
except KeyError as hata:
    print("KeyError:", hata)</pre>
<p>Kural: anahtarın kesin var olduğunu biliyorsan köşeli parantez (hata alırsan bu gerçek bir sorundur ve görmek istersin). Eksik olabilecek alanlarda <code>get</code>. <code>in</code> operatörü sözlükte <b>anahtarları</b> arar, değerleri değil.</p>

<h2>Ekleme, güncelleme, silme</h2>
<pre class="py">hesap = {"no": "TR-5501", "bakiye": 10000}
hesap["sahip"] = "Mehmet Kaya"        # yeni anahtar ekle
hesap["bakiye"] = hesap["bakiye"] - 750   # değeri değiştir
hesap["bakiye"] += 2000               # kısayol
print(hesap)
hesap.update({"sube": "Konak", "bakiye": 11250})   # toplu güncelle
print(hesap)
silinen = hesap.pop("sube")           # anahtarı çıkar, değeri döndür
print(silinen, hesap)
del hesap["sahip"]
print(hesap)
print(hesap.pop("yok", "bulunamadı")) # varsayılanlı pop</pre>
<p>Aynı anahtara ikinci kez atama yapmak üzerine yazar; sözlükte anahtar tekrarı yoktur. <code>update</code> başka bir sözlükten alanları alır: var olanları günceller, olmayanları ekler. <code>pop</code> ve <code>del</code> siler; <code>pop</code> değeri geri verdiği için daha sık kullanılır.</p>
<div class="tbl-wrap"><table>
<tr><th>İşlem</th><th>Yazım</th><th>Eksik anahtarda</th></tr>
<tr><td>Oku</td><td><code>d["k"]</code></td><td>KeyError</td></tr>
<tr><td>Güvenli oku</td><td><code>d.get("k", varsayilan)</code></td><td>varsayılan döner</td></tr>
<tr><td>Ekle / güncelle</td><td><code>d["k"] = v</code></td><td>eklenir</td></tr>
<tr><td>Toplu güncelle</td><td><code>d.update(baska)</code></td><td>eklenir</td></tr>
<tr><td>Sil ve al</td><td><code>d.pop("k")</code></td><td>KeyError (varsayılan verilmezse)</td></tr>
<tr><td>Sil</td><td><code>del d["k"]</code></td><td>KeyError</td></tr>
<tr><td>Var mı?</td><td><code>"k" in d</code></td><td>False</td></tr>
</table></div>

<h2>keys, values, items</h2>
<p>Sözlüğün üç görünümü vardır: anahtarlar, değerler ve çiftler. Bunlar liste gibi gezilebilir; döngüler dersinde her gün kullanacaksın. Şimdilik listeye çevirip bakalım:</p>
<pre class="py">fiyatlar = {"kahve makinesi": 1499.9, "kalem": 2.5, "defter": 45}
print(list(fiyatlar.keys()))
print(list(fiyatlar.values()))
print(list(fiyatlar.items()))
print("Toplam:", sum(fiyatlar.values()))
print("En pahalı:", max(fiyatlar, key=fiyatlar.get))
urun, fiyat = list(fiyatlar.items())[0]     # demet açma!
print(urun, fiyat)</pre>
<p><code>items</code> her çifti bir demet olarak verir; demet açmayı öğrendiğin için <code>urun, fiyat = ...</code> yazabildin. <code>max(fiyatlar, key=fiyatlar.get)</code> kalıbı "değeri en büyük olan anahtarı bul" demektir ve raporlarda çok geçer.</p>

<h2>İç içe sözlük ve JSON'a hazırlık</h2>
<p>Bir müşterinin birden fazla siparişi, bir siparişin birden fazla ürünü var. Değer olarak liste ve sözlük kullanarak hiyerarşi kurarsın:</p>
<pre class="py">musteri = {
    "no": "M-101",
    "ad": "Ayşe Yılmaz",
    "adres": {"sehir": "İzmir", "ilce": "Konak", "posta": "35220"},
    "siparisler": [
        {"kod": "AM-101", "tutar": 1499.9, "teslim": True},
        {"kod": "AM-103", "tutar": 89.5, "teslim": False},
    ],
}
print(musteri["adres"]["sehir"])
print(musteri["siparisler"][0]["kod"])
print(musteri["siparisler"][-1]["teslim"])
musteri["adres"]["ilce"] = "Bornova"
musteri["siparisler"].append({"kod": "AM-110", "tutar": 250, "teslim": False})
print(len(musteri["siparisler"]), "sipariş")
import json
print(json.dumps(musteri, ensure_ascii=False, indent=2)[:80])</pre>
<p>Zincirleme köşeli parantez derinlere iner: önce adres sözlüğü, sonra içindeki şehir. Son satırlardaki <code>json</code> modülü bu yapıyı metne çevirir. <b>JSON</b>, web servislerinin ve yapılandırma dosyalarının ortak dilidir ve Python sözlüğüyle neredeyse birebir aynı görünür: süslü parantez, anahtar-değer, listeler. Sözlüğü iyi kavradıysan JSON'ı zaten biliyorsun; JSON ve CSV dersinde dosyadan okuyup yazacağız.</p>
<div class="warn"><b>Kopyalama tuzağı burada da var</b><code>yedek = musteri</code> kopya değildir; <code>musteri.copy()</code> ise yalnızca dış sözlüğü kopyalar, içindeki adres sözlüğü ve sipariş listesi paylaşılır. İç içe yapıyı tamamen kopyalamak için <code>copy.deepcopy</code> kullan.</div>

<h2>Sayım kalıbı</h2>
<p>Analistin en sık yazdığı kod parçalarından biri: bir listedeki her değerin kaç kez geçtiğini bulmak. Şehir bazlı sipariş adedi, ürün bazlı satış, hata türü bazlı log sayısı. Sözlük bunun için biçilmiş kaftan; anahtar değer, değer ise sayaç olur. Döngüyü henüz görmediğin için önce adım adım, sonra döngülü hâlini gösteriyorum:</p>
<pre class="py">sehirler = ["İzmir", "Ankara", "İzmir", "Bursa", "İzmir", "Ankara"]
sayim = {}
sayim["İzmir"] = sayim.get("İzmir", 0) + 1     # ilk kez: 0 + 1
sayim["Ankara"] = sayim.get("Ankara", 0) + 1
sayim["İzmir"] = sayim.get("İzmir", 0) + 1     # ikinci kez: 1 + 1
print(sayim)

sayim = {}
for sehir in sehirler:          # döngü: her şehir için aynı satır
    sayim[sehir] = sayim.get(sehir, 0) + 1
print(sayim)
print("En çok:", max(sayim, key=sayim.get))</pre>
<p>Kalıbın kalbi tek satır: <code>sayim[x] = sayim.get(x, 0) + 1</code>. <code>get</code>'in varsayılanı 0 olduğu için ilk karşılaşmada hata çıkmaz. Döngüler dersinde <code>for</code> satırını tam olarak anlayacaksın; şimdilik "listenin her elemanı için bu satırı çalıştır" diye oku. Aynı işi hazır yapan <code>collections.Counter</code> da var; Orta seviyede göreceksin.</p>
<div class="tip"><b>Gruplama kalıbı</b>Saymak yerine toplamak istersen aynı yapı çalışır: <code>toplam[sehir] = toplam.get(sehir, 0) + tutar</code>. Şehir bazlı ciro bu tek satırdır.</div>
<div class="note"><b>Anahtar olarak ne kullanmalı?</b>Metin, sayı ve demet anahtar olabilir; liste olamaz (değişebilir). "Şehir ve yıl" gibi bileşik anahtar için demet kullan: <code>ciro[("İzmir", 2025)]</code>.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Sözlük neden hızlı?</h3>
<p>Sözlük, kümeyle aynı karma tablo (hash table) yapısını kullanır. Anahtarın karması hesaplanır ve değer doğrudan o adreste aranır; sözlük bir milyon kayıt da tutsa okuma süresi değişmez. Listede "no'su M-101 olan müşteri" aramak baştan sona taramadır. Bu yüzden kayıtları numarayla erişilecekse liste değil sözlükte tut: <code>musteriler["M-101"]</code>.</p>
<h3>setdefault ve defaultdict</h3>
<p>Sayım kalıbındaki <code>get(x, 0)</code> yerine <code>sayim.setdefault(x, 0)</code> da yazılır; anahtar yoksa ekler ve değeri döndürür. Gruplama için <code>collections.defaultdict(list)</code> daha temizdir: <code>gruplar[sehir].append(siparis)</code> tek satırda, var mı diye bakmadan. Standart kütüphane dersinde bu araçları ayrıntılı ele alacağız.</p>
<h3>Veri modeli olarak sözlük: sınırlar</h3>
<p>Sözlük esnektir ama "ad" yerine yanlışlıkla "adi" yazarsan Python şikâyet etmez; sessizce yeni alan ekler. Büyük projelerde bu tür yazım hatalarını yakalamak için kayıtları <code>dataclass</code> ya da <code>TypedDict</code> ile tanımlarsın. Sözlük veri taşımak için, dataclass veri tanımlamak için. Orta seviyede bu ayrımı yaşayarak öğreneceksin.</p>
</section>
`,
  ex: [
    { t: 'code', id: 'sozlukler-1',
      q: '<p>Bir müşteri kaydı oluştur: <code>musteri</code> adlı sözlük şu anahtarları taşısın: <code>"no"</code> → <code>"M-101"</code>, <code>"ad"</code> → <code>"Ayşe Yılmaz"</code>, <code>"sehir"</code> → <code>"İzmir"</code>, <code>"bakiye"</code> → <code>12500.0</code>. Sonra <code>"telefon"</code> anahtarıyla <code>"0532 000 00 00"</code> ekle ve bakiyeyi 500 artır.</p>',
      start: 'musteri = {\n    # alanları yaz\n}\n# telefon ekle, bakiyeyi 500 artır\n',
      sol: 'musteri = {\n    "no": "M-101",\n    "ad": "Ayşe Yılmaz",\n    "sehir": "İzmir",\n    "bakiye": 12500.0,\n}\nmusteri["telefon"] = "0532 000 00 00"\nmusteri["bakiye"] += 500\nprint(musteri)\n',
      tests: 'assert musteri["no"] == "M-101" and musteri["ad"] == "Ayşe Yılmaz", "no ve ad alanları doğru olmalı"\nassert musteri["sehir"] == "İzmir", "sehir İzmir olmalı"\nassert musteri["telefon"] == "0532 000 00 00", "telefon anahtarı eklenmeli"\nassert abs(musteri["bakiye"] - 13000.0) < 1e-6, "bakiye 13000.0 olmalı"\nassert len(musteri) == 5, "sözlükte 5 anahtar olmalı"\n',
      hints: ['Yeni anahtar: musteri["telefon"] = "..."', 'Artırma: musteri["bakiye"] += 500'],
      why: 'Köşeli parantezle atama hem yeni anahtar ekler hem var olanı günceller.' },
    { t: 'mc', q: '<code>d = {"a": 1}</code> için <code>d.get("b", 0)</code> ve <code>d["b"]</code> sırasıyla ne verir?',
      o: ['0 ve None', '0 ve KeyError', 'None ve 0', 'KeyError ve KeyError'], a: 1,
      why: 'get varsayılan değeri (0) döndürür ve hata vermez; köşeli parantez eksik anahtarda KeyError fırlatır.' },
    { t: 'code', id: 'sozlukler-2',
      q: '<p><code>alan_getir(kayit, anahtar)</code> fonksiyonu yaz: sözlükte anahtar varsa değerini, yoksa <code>"bilinmiyor"</code> metnini döndürsün. <code>get</code> kullan; KeyError çıkmamalı.</p>',
      start: 'def alan_getir(kayit, anahtar):\n    pass\n',
      sol: 'def alan_getir(kayit, anahtar):\n    return kayit.get(anahtar, "bilinmiyor")\n',
      tests: 'm = {"ad": "Ayşe", "sehir": "İzmir"}\nassert alan_getir(m, "sehir") == "İzmir", "var olan anahtarın değeri dönmeli"\nassert alan_getir(m, "telefon") == "bilinmiyor", "eksik anahtar için bilinmiyor dönmeli"\nassert alan_getir({}, "x") == "bilinmiyor", "boş sözlükte de çalışmalı"\n',
      hints: ['kayit.get(anahtar, varsayilan)'],
      why: 'get, eksik anahtarda hata yerine varsayılanı döndürür; raporlarda eksik alanlar böyle yönetilir.' },
    { t: 'code', id: 'sozlukler-3',
      q: '<p>Fiyat listesi <code>fiyatlar = {"kahve makinesi": 1499.9, "kalem": 2.5, "defter": 45}</code>. <code>update</code> ile iki değişiklik uygula: <code>"kalem"</code> fiyatını <code>3.0</code> yap ve <code>"silgi"</code> ürününü <code>1.5</code> ile ekle. Sonra <code>toplam</code> değişkeninde tüm fiyatların toplamını, <code>en_pahali</code> değişkeninde en pahalı ürünün <b>adını</b> hesapla.</p>',
      start: 'fiyatlar = {"kahve makinesi": 1499.9, "kalem": 2.5, "defter": 45}\n# update, toplam, en_pahali\n',
      sol: 'fiyatlar = {"kahve makinesi": 1499.9, "kalem": 2.5, "defter": 45}\nfiyatlar.update({"kalem": 3.0, "silgi": 1.5})\ntoplam = sum(fiyatlar.values())\nen_pahali = max(fiyatlar, key=fiyatlar.get)\nprint(toplam, en_pahali)\n',
      tests: 'assert fiyatlar["kalem"] == 3.0 and fiyatlar["silgi"] == 1.5, "update ile kalem 3.0, silgi 1.5 olmalı"\nassert abs(toplam - 1549.4) < 1e-6, "toplam 1549.4 olmalı"\nassert en_pahali == "kahve makinesi", "en pahalı ürün adı kahve makinesi"\n',
      hints: ['fiyatlar.update({"kalem": 3.0, "silgi": 1.5})', 'max(fiyatlar, key=fiyatlar.get) değeri en büyük anahtarı verir.'],
      why: 'update toplu günceller; values toplamı ve key=fiyatlar.get kalıbı özet için standarttır.' },
    { t: 'mc', q: '<code>"İzmir" in musteri</code> ifadesi sözlükte neyi kontrol eder?',
      o: ['Değerler arasında "İzmir" var mı', 'Anahtarlar arasında "İzmir" var mı', 'Hem anahtar hem değerlerde', 'Sözlüğün adı "İzmir" mi'], a: 1,
      why: 'in operatörü sözlükte anahtarları arar. Değerlerde aramak için "İzmir" in musteri.values() yazılır.' },
    { t: 'code', id: 'sozlukler-4',
      q: '<p>İç içe müşteri kaydı verildi. Şu üç işi yap: <code>sehir</code> değişkenine adres içindeki şehri al; <code>ilk_kod</code> değişkenine ilk siparişin kodunu al; sipariş listesine <code>{"kod": "AM-110", "tutar": 250, "teslim": False}</code> sözlüğünü ekle.</p>',
      start: 'musteri = {\n    "no": "M-101",\n    "adres": {"sehir": "İzmir", "ilce": "Konak"},\n    "siparisler": [\n        {"kod": "AM-101", "tutar": 1499.9, "teslim": True},\n        {"kod": "AM-103", "tutar": 89.5, "teslim": False},\n    ],\n}\n# sehir, ilk_kod, yeni sipariş\n',
      sol: 'musteri = {\n    "no": "M-101",\n    "adres": {"sehir": "İzmir", "ilce": "Konak"},\n    "siparisler": [\n        {"kod": "AM-101", "tutar": 1499.9, "teslim": True},\n        {"kod": "AM-103", "tutar": 89.5, "teslim": False},\n    ],\n}\nsehir = musteri["adres"]["sehir"]\nilk_kod = musteri["siparisler"][0]["kod"]\nmusteri["siparisler"].append({"kod": "AM-110", "tutar": 250, "teslim": False})\nprint(sehir, ilk_kod, len(musteri["siparisler"]))\n',
      tests: 'assert sehir == "İzmir", "sehir İzmir olmalı"\nassert ilk_kod == "AM-101", "ilk_kod AM-101 olmalı"\nassert len(musteri["siparisler"]) == 3, "sipariş listesi 3 elemanlı olmalı"\nassert musteri["siparisler"][2]["kod"] == "AM-110", "yeni siparişin kodu AM-110 olmalı"\n',
      hints: ['musteri["adres"]["sehir"] zincirleme erişim.', 'Liste değerine append yapabilirsin.'],
      why: 'Zincirleme köşeli parantez iç yapıya iner; iç liste değiştirilebilir olduğundan append doğrudan çalışır.' },
    { t: 'code', id: 'sozlukler-5',
      q: '<p><code>sayim(degerler)</code> fonksiyonu yaz: bir liste alıp her değerin kaç kez geçtiğini sözlük olarak döndürsün. Sayım kalıbını kullan: <code>sonuc[x] = sonuc.get(x, 0) + 1</code>. Örnek: <code>["İzmir", "Ankara", "İzmir"]</code> → <code>{"İzmir": 2, "Ankara": 1}</code>.</p>',
      start: 'def sayim(degerler):\n    sonuc = {}\n    for deger in degerler:\n        # kalıbı uygula\n        pass\n    return sonuc\n',
      sol: 'def sayim(degerler):\n    sonuc = {}\n    for deger in degerler:\n        sonuc[deger] = sonuc.get(deger, 0) + 1\n    return sonuc\n',
      tests: 'assert sayim(["İzmir", "Ankara", "İzmir"]) == {"İzmir": 2, "Ankara": 1}, "İzmir 2, Ankara 1 olmalı"\nassert sayim([]) == {}, "boş liste için boş sözlük"\nassert sayim(["a", "a", "a", "b"]) == {"a": 3, "b": 1}, "a 3, b 1 olmalı"\n',
      hints: ['get(deger, 0) ilk karşılaşmada 0 verir.', 'sonuc[deger] = sonuc.get(deger, 0) + 1'],
      why: 'get ile varsayılan 0, eksik anahtar hatasını önler; her tekrar sayacı bir artırır.' },
    { t: 'mc', q: 'Aşağıdakilerden hangisi sözlük anahtarı olarak <b>kullanılamaz</b>?',
      o: ['("İzmir", 2025)', '"M-101"', '["İzmir", 2025]', '2025'], a: 2,
      why: 'Anahtar değişmez (hashable) olmalıdır. Liste değiştirilebilir olduğu için anahtar olamaz; demet, metin ve sayı olabilir.' }
  ],
  faq: [
    { q: "Sözlükte sıra var mı?", a: "Python 3.7 ve sonrasında sözlük, anahtarların eklenme sırasını korur. Yine de sözlüğü sıraya göre değil anahtara göre kullanmak için tasarla; sıralama gerekiyorsa sorted(d.items()) kullan." },
    { q: "Sözlük ile JSON aynı şey mi?", a: "Görünüşte çok benzer ama JSON bir metin biçimidir, sözlük bir Python nesnesidir. json.dumps sözlüğü JSON metnine, json.loads JSON metnini sözlüğe çevirir. JSON'da anahtarlar yalnızca metin olabilir ve True yerine true yazılır." },
    { q: "Anahtar yoksa hata almak mı yoksa get kullanmak mı daha iyi?", a: "Anahtarın kesinlikle olması gerekiyorsa köşeli parantez kullan; hata, bir veri sorununu erken gösterir. Alan isteğe bağlıysa (telefon, ikinci adres) get ile varsayılan ver." }
  ],
  mistakes: [
    { bad: 'telefon = musteri["telefon"]', good: 'telefon = musteri.get("telefon", "yok")', why: 'İsteğe bağlı alanlarda köşeli parantez KeyError verir; get varsayılanla devam eder.' },
    { bad: 'sayim[sehir] = sayim[sehir] + 1', good: 'sayim[sehir] = sayim.get(sehir, 0) + 1', why: 'İlk karşılaşmada anahtar yoktur ve KeyError çıkar; get(…, 0) bunu önler.' },
    { bad: 'ciro[["İzmir", 2025]] = 1500', good: 'ciro[("İzmir", 2025)] = 1500', why: 'Liste anahtar olamaz (değişebilir); bileşik anahtar için demet kullan.' },
    { bad: 'yedek = musteri\nyedek["ad"] = "X"', good: 'import copy\nyedek = copy.deepcopy(musteri)\nyedek["ad"] = "X"', why: 'Atama kopya değildir; iç içe sözlükte tam bağımsız kopya için deepcopy gerekir.' }
  ]
}
);
})(window);
