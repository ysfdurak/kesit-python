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
      o: ['Veri analizi ve raporlama', 'Her gün tekrarlanan dosya işlerinin otomasyonu', 'Oyun motoru çekirdeği gibi çok yüksek performans isteyen kod', 'Web servisleri yazmak'], a: 2,
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
      o: ['REPL yalnızca Windows\'ta çalışır', 'Betik dosyasında print kullanılamaz', 'REPL her ifadenin değerini hemen gösterir, betikte sadece print edilenler görünür', 'Betik daha yavaş çalışır'], a: 2,
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
      o: ['Python kurulumu bozuk', 'Değişken adı yanlış yazılmış ya da hiç tanımlanmamış', 'Parantez eksik', 'Metinle sayı toplanmaya çalışılmış'], a: 1,
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
