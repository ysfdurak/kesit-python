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
<p>Python, 1991'de Guido van Rossum'un yayımladığı, okunabilirliği her şeyin önüne koyan genel amaçlı bir programlama dili (programming language). Adını yılandan değil, Monty Python komedi grubundan alır. Bugün kullanılan sürüm ailesi Python 3; bu uygulamada Python 3.12 ile çalışacaksın. Yazdığın kod, tarayıcının içinde gerçek bir Python yorumlayıcısında (interpreter) koşar. Temel dil birebir aynıdır: burada öğrendiğin dil kuralları bilgisayarına kuracağın Python'da da aynı çalışır.</p>
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
print("Ilgaz", "Bank", sep=" - ")</pre>
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
<p>Python yorumlanan (interpreted) bir dildir: kodunu önce makine diline çeviren ayrı bir program çalıştırmazsın; yorumlayıcı satırları sırayla okur ve uygular. Bunun iki sonucu var. Birincisi, deneme yapmak hızlıdır: bir satır yazar, hemen sonucu görürsün. İkincisi, çoğu hata (yazım hatası hariç) ancak o satıra sıra geldiğinde ortaya çıkar; Python önce dosyanın tamamını okur, sözdizimi hatası varsa hiçbir satırı çalıştırmaz. Dolayısıyla kodu küçük parçalar hâlinde sık sık çalıştırmak iyi bir alışkanlıktır. Bir sonraki derste Python'ı kendi bilgisayarına kuracak ve bu yorumlayıcıyı terminalden çalıştıracaksın.</p>

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
      q: "<p>Tek bir <code>print</code> çağrısı ile <code>Ilgaz-Bank</code> yazdır. <code>\"Ilgaz\"</code> ve <code>\"Bank\"</code> ayrı iki değer olarak verilsin; aralarına tire koymak için <code>sep</code> kullan. İkinci satırda ise <code>Toplam: 750</code> yazdır; 750 sayısını <code>3 * 250</code> çarpımıyla üret.</p>",
      start: 'print("Ilgaz", "Bank")\nprint("Toplam:", 3 * 250)\n',
      sol: 'print("Ilgaz", "Bank", sep="-")\nprint("Toplam:", 3 * 250)\n',
      expect: 'Ilgaz-Bank\nToplam: 750\n',
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
    "python.org'dan güncel bir Python 3 sürümünü kurup terminalde sürümü doğrulayabilirim.",
    'VS Code ile bir .py dosyası oluşturup terminalden çalıştırabilirim.',
    'REPL ile betik çalıştırmanın farkını ve hangisini ne zaman kullanacağımı açıklayabilirim.',
    "Jupyter'ın ne işe yaradığını ve sanal ortamın neden gerektiğini özetleyebilirim."
  ],
  body: `
<h2>Neden kurulumu önemsiyoruz?</h2>
<p>Bu uygulamada kodu tarayıcıda çalıştırıyorsun ve bu, öğrenmek için yeterli. Ama iş hayatında Python, senin bilgisayarında ya da bir sunucuda bir betik (script) olarak çalışır: Ilgaz Bank'ın gece raporu bir sunucuda, Anadolu Market analistinin günlük özeti onun dizüstünde koşar. Bu derste o ortamı kuruyoruz. Kurulumu bir kez düzgün yaparsan sonraki aylarda saatlerce "neden çalışmıyor" sorusuyla uğraşmazsın.</p>

<h2>1. Python'ı kurmak</h2>
<p>Resmî kaynak <b>python.org</b>. Kasım 2026'da kararlı sürümler 3.15 (Ekim 2026'da çıktı) ve 3.14; yeni başlayan için öneri <b>3.14</b>, çünkü paketlerin hazır derlemeleri yeni sürümlere biraz geç gelir. Bu uygulamadaki tarayıcı motoru Python 3.12'dir; temel dil aynıdır, bilgisayarına 3.14 kurman sorun çıkarmaz. Windows'ta python.org artık "Python install manager" adlı yükleme yöneticisini öne çıkarıyor, klasik yükleyici de hâlâ sunuluyor.</p>
<div class="steps-list"><ol>
<li><b>Windows:</b> Kurulum sihirbazının ilk ekranında "Add python.exe to PATH" kutusunu mutlaka işaretle. Bu kutu, terminalde <code>python</code> yazınca bilgisayarın Python'ı bulmasını sağlar.</li>
<li><b>macOS:</b> python.org paketini kur. Sistemle gelen eski Python'a dokunma; sen hep <code>python3</code> komutunu kullan.</li>
<li><b>Linux:</b> Çoğu dağıtımda Python zaten vardır. Yoksa paket yöneticisinden (apt, dnf) <code>python3</code> kur.</li>
</ol></div>
<p>Kurulum bittikten sonra bir terminal (Windows'ta PowerShell ya da Komut İstemi, macOS ve Linux'ta Terminal) aç ve şunu yaz:</p>
<pre class="out">python --version
Python 3.14.x</pre>
<p>Windows'ta <code>python</code>, macOS ve Linux'ta genelde <code>python3</code> çalışır. "Python 3." ile başlayan bir satır görüyorsan kurulum tamam. "command not found" ya da "tanınmıyor" diyorsa büyük ihtimalle PATH adımı atlanmıştır; kurulumu "Modify" ile tekrar aç ve kutuyu işaretle.</p>

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
  ex: [{ t: 'mc', q: "Windows'ta Python kurarken \"Add python.exe to PATH\" kutusunu işaretlemezsen ne olur?",
      o: ['Python hiç kurulmaz', 'Terminalde python komutu bulunamaz', 'Sadece REPL çalışır, betik çalışmaz', 'pip kurulmaz'], a: 1,
      why: 'Python kurulur ama terminal onun yerini bilmez; python yazınca "tanınmıyor" hatası alırsın. PATH, komutların nerede arandığını söyleyen listedir.' },
    { t: 'mc', q: 'REPL ile betik (.py dosyası) arasındaki temel fark nedir?',
      o: ['REPL yalnızca Windows\'ta çalışır', 'Betik dosyasında print kullanılamaz, yalnızca REPL\'de kullanılır', 'REPL her ifadenin değerini kendiliğinden gösterir', 'Betik daha yavaş çalışır'], a: 2,
      why: 'REPL etkileşimlidir ve her ifadenin sonucunu otomatik basar. Betikte yalnızca print çıktıları görünür; 3 * 250 yazıp bırakırsan hiçbir şey çıkmaz.' },
    { t: 'mc', q: 'Sanal ortam (virtual environment) neden kullanılır?',
      o: ['Python\'ı daha hızlı çalıştırmak için', 'Her projenin paketlerini birbirinden izole tutmak için', 'Kodun internete çıkmasını engellemek için', 'VS Code\'un çalışması için zorunlu olduğundan'], a: 1,
      why: 'Sanal ortam projeye özel bir paket deposudur; farklı projelerin farklı sürüm ihtiyaçları birbirini bozmaz. Hız ya da güvenlikle ilgisi yoktur.' },
    { t: 'mc', q: 'Aşağıdaki dosya adlarından hangisi bir Python betiği için en uygundur?',
      o: ['Haftalık Rapor.py', 'rapor.txt', 'haftalik_rapor.py', 'rapor'], a: 2,
      why: 'Python betiği .py uzantısı taşımalı; küçük harf, boşluksuz ve ASCII ad terminalde yazmayı ve paylaşmayı kolaylaştırır.' }],
  faq: [
    { q: "Terminalde python yazınca Microsoft Store açılıyor, ne yapmalıyım?", a: "Windows'un kısayol davranışı. Ya python.org kurulumunu PATH seçeneğiyle yeniden yap ya da Ayarlar > Uygulamalar > Uygulama yürütme diğer adları bölümünden python kısayollarını kapat." },
    { q: "Anaconda kurmalı mıyım?", a: "Veri bilimi için pandas, numpy ve Jupyter'ı tek pakette getirir, ama büyüktür ve kendi ortam sistemi vardır. Başlangıçta python.org kurulumu ve pip yeterli; Anaconda'ya ihtiyacın olursa ileride geçersin." },
    { q: "VS Code'da Run düğmesine basınca yanlış Python çalışıyor.", a: "Sağ alttaki yorumlayıcı seçiciye tıkla (ya da Ctrl+Shift+P > Python: Select Interpreter) ve kurduğun sürümü seç. Sanal ortam kullanıyorsan .venv içindekini seçmelisin." }
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
/* Kesit Python — Temel seviye 2. bölüm: Akış Kontrolü, Fonksiyonlar ve Modüller, Dosya ve Hata, Bitirme */
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push(
/* ───────────────────────── 1. KOŞULLAR ───────────────────────── */
{
  id: 'kosullar',
  lv: 'temel',
  mod: 'Akış Kontrolü',
  min: 25,
  title: 'Koşullar: if / elif / else',
  sum: 'Programın hangi yoldan gideceğine karar ver: karşılaştırma ve mantık operatörleri, truthiness, iç içe koşullar ve erken dönüş.',
  goals: [
    'if / elif / else ile çok dallı karar yapısı kurabilirim.',
    'Karşılaştırma (==, !=, <, >=) ve mantık (and, or, not) operatörlerini doğru öncelikle birleştirebilirim.',
    'Hangi değerlerin "doğru", hangilerinin "yanlış" sayıldığını (truthiness) açıklayabilirim.',
    'İç içe koşulları erken dönüş (early return) ile düzleştirip okunur kod yazabilirim.',
    'Ilgaz Bank kredi uygunluk kuralı gibi bir iş kuralını koda dökebilirim.'
  ],
  body: `
<h2>Neden önemli?</h2>
<p>Şimdiye kadar yazdığın programlar yukarıdan aşağıya, hiç sapmadan çalıştı. Oysa gerçek iş kuralları hep "eğer ... ise" diye başlar: <i>Eğer sepet tutarı 500 TL'yi geçerse kargo bedava. Eğer başvuranın yaşı 18'in altındaysa krediyi reddet. Eğer stok sıfırsa "tükendi" yaz.</i> Ilgaz Bank'ta bir kredi uzmanının her gün uyguladığı kuralı Python'a öğretmek için koşul (condition) yapısına ihtiyacın var.</p>

<h2>if, elif, else</h2>
<p>Python'da bir blok yalnızca koşul <code>True</code> olduğunda çalışır. Blok girintiyle (4 boşluk) belirlenir; süslü parantez yok.</p>
<pre class="py">sepet_tutari = 640

if sepet_tutari &gt;= 500:
    kargo = 0
elif sepet_tutari &gt;= 200:
    kargo = 29.90
else:
    kargo = 49.90

print("Kargo ücreti:", kargo)</pre>
<p>Üç kuralı aklında tut:</p>
<ul>
  <li><b>if</b> zorunlu, <b>elif</b> (else if) istediğin kadar, <b>else</b> en fazla bir tane ve en sonda.</li>
  <li>Dallar yukarıdan aşağıya denenir; <b>ilk doğru olan</b> çalışır, gerisi atlanır. Bu yüzden sıralama önemlidir: önce <code>&gt;= 200</code> yazsaydın 640 de o dala girerdi.</li>
  <li>Her koşul satırı iki nokta <code>:</code> ile biter.</li>
</ul>

<h2>Karşılaştırma operatörleri</h2>
<div class="tbl-wrap"><table>
<tr><th>Operatör</th><th>Anlamı</th><th>Örnek</th><th>Sonuç</th></tr>
<tr><td><code>==</code></td><td>eşit mi</td><td><code>5 == 5.0</code></td><td>True</td></tr>
<tr><td><code>!=</code></td><td>eşit değil mi</td><td><code>"a" != "A"</code></td><td>True</td></tr>
<tr><td><code>&lt;</code> <code>&lt;=</code></td><td>küçük / küçük eşit</td><td><code>3 &lt;= 3</code></td><td>True</td></tr>
<tr><td><code>&gt;</code> <code>&gt;=</code></td><td>büyük / büyük eşit</td><td><code>"b" &gt; "a"</code></td><td>True (alfabetik)</td></tr>
<tr><td><code>in</code></td><td>içinde mi</td><td><code>"İzmir" in ["Ankara", "İzmir"]</code></td><td>True</td></tr>
<tr><td><code>is</code></td><td>aynı nesne mi</td><td><code>x is None</code></td><td>None kontrolü için</td></tr>
</table></div>
<div class="warn"><b>== ile = karıştırma</b>Tek eşittir atama, çift eşittir karşılaştırmadır. <code>if yas = 18:</code> yazarsan Python sözdizimi hatası verir; bu iyi bir şey, çünkü hatayı anında görürsün.</div>
<p>Python'da karşılaştırmaları zincirleyebilirsin; bu matematikteki gibi okunur:</p>
<pre class="py">kredi_notu = 720
if 650 &lt;= kredi_notu &lt; 750:
    print("Orta risk grubu")
print(18 &lt;= 25 &lt; 65)   # True</pre>

<h2>Mantık operatörleri: and, or, not</h2>
<p>Birden fazla koşulu birleştirmek için <code>and</code> (ve), <code>or</code> (veya), <code>not</code> (değil) kullanılır. Öncelik sırası: <code>not</code> &gt; <code>and</code> &gt; <code>or</code>. Emin değilsen parantez koy; parantez hem güvenli hem okunaklıdır.</p>
<pre class="py">yas = 34
aylik_gelir = 42000
kara_listede = False
mevcut_kredi = 1

uygun = yas &gt;= 18 and aylik_gelir &gt;= 25000 and not kara_listede
print("Temel şartlar:", uygun)

# Parantezin farkı
print(True or False and False)     # and önce: True or False -> True
print((True or False) and False)   # parantez önce: True and False -> False</pre>
<div class="tip"><b>Kısa devre (short-circuit)</b><code>a and b</code> ifadesinde <code>a</code> yanlışsa Python <code>b</code>'ye hiç bakmaz. Bu, <code>liste and liste[0] == 5</code> gibi "önce boş mu diye bak, sonra elemana eriş" kalıplarını güvenli kılar.</div>

<h2>Truthiness: her şey bir koşul olabilir</h2>
<p><code>if</code> yalnızca <code>True</code>/<code>False</code> beklemez; herhangi bir değer koyabilirsin. Python değeri "doğru gibi" ya da "yanlış gibi" sayar:</p>
<ul>
  <li><b>Yanlış sayılanlar (falsy):</b> <code>False</code>, <code>None</code>, <code>0</code>, <code>0.0</code>, boş metin <code>""</code>, boş liste <code>[]</code>, boş sözlük <code>{}</code>, boş demet <code>()</code>.</li>
  <li><b>Doğru sayılanlar (truthy):</b> geri kalan her şey; <code>-1</code>, <code>" "</code> (boşluk karakteri), <code>[0]</code> bile.</li>
</ul>
<pre class="py">sepet = []
if sepet:
    print("Sepette ürün var")
else:
    print("Sepet boş")

ad = ""
print("Ad girildi" if ad else "Ad boş")
print(bool(0), bool("0"), bool([]), bool([0]))</pre>
<p>Son satırdaki <code>x if kosul else y</code> yapısına <b>koşullu ifade</b> (conditional expression, "ternary") denir; tek satırda iki değerden birini seçer.</p>

<h2>İç içe koşul ve erken dönüş</h2>
<p>Koşul içine koşul yazabilirsin ama girinti derinleştikçe kod zorlaşır. Fonksiyon içindeysen (bir sonraki modülde ayrıntısıyla göreceksin) olumsuz durumları başta eleyip <code>return</code> ile çıkmak, kodu düz ve okunur tutar. Buna <b>erken dönüş</b> (early return) ya da "guard clause" denir.</p>
<pre class="py">def kredi_karari(yas, gelir, kredi_notu, kara_listede):
    """Ilgaz Bank bireysel kredi ön değerlendirme kuralı."""
    if kara_listede:
        return "RED: kara liste"
    if yas &lt; 18:
        return "RED: yaş"
    if gelir &lt; 25000:
        return "RED: gelir yetersiz"
    if kredi_notu &gt;= 700:
        return "ONAY: standart faiz"
    if kredi_notu &gt;= 600:
        return "ONAY: yüksek faiz"
    return "RED: kredi notu düşük"

print(kredi_karari(34, 42000, 720, False))
print(kredi_karari(34, 42000, 640, False))
print(kredi_karari(17, 42000, 720, False))
print(kredi_karari(40, 90000, 800, True))</pre>
<p>Aynı kuralı iç içe <code>if</code> ile yazsaydın dört seviye girinti olurdu. Erken dönüşte her satır tek bir kuralı anlatır; kredi uzmanı bile okuyup "evet, kuralımız bu" diyebilir.</p>
<div class="note"><b>pass ve boş blok</b>Python'da boş blok olamaz. Henüz ne yazacağını bilmiyorsan <code>pass</code> yaz; hiçbir şey yapmaz ama sözdizimini tamamlar.</div>

<h2>match ile çoklu dallanma (Python 3.10+)</h2>
<p>Bir değeri birçok sabitle karşılaştırıyorsan <code>match</code> daha temiz olabilir:</p>
<pre class="py">durum = "kargoda"
match durum:
    case "hazirlaniyor":
        print("Depoda paketleniyor")
    case "kargoda" | "dagitimda":
        print("Yolda")
    case "teslim":
        print("Teslim edildi")
    case _:
        print("Bilinmeyen durum")</pre>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>İş kuralını koddan ayır</h3>
<p>Gerçek sistemlerde "kredi için en az 25.000 TL gelir" gibi eşikler kodun içine gömülmez; sabit (constant) olarak en üste ya da bir ayar dosyasına yazılır: <code>MIN_GELIR = 25000</code>. Kural değiştiğinde tek satırı değiştirirsin ve kodun geri kalanını test etmen gerekmez.</p>
<h3>Karmaşık koşulu adlandır</h3>
<p><code>if yas &gt;= 18 and gelir &gt;= MIN_GELIR and not kara_listede and kredi_notu &gt;= 600:</code> satırı doğrudur ama okunmaz. Önce <code>temel_sartlar = yas &gt;= 18 and gelir &gt;= MIN_GELIR</code> gibi anlamlı ara değişkenler üret, sonra <code>if temel_sartlar and risk_uygun:</code> yaz. Bir koşulu okurken üç kere nefes almak gerekiyorsa bölünmelidir.</p>
<h3>None ile is kullan</h3>
<p>"Değer gelmedi" durumunu <code>None</code> ile temsil ederiz ve <code>if x is None</code> yazarız, <code>== None</code> değil. <code>is</code> aynı nesne olup olmadığına bakar; <code>None</code> tek bir nesne olduğu için en güvenli yoldur. Aynı mantıkla <code>if not x</code> ile <code>if x is None</code> farklıdır: ilki 0 ve boş listeyi de yakalar, ikincisi yalnızca None'ı.</p>
</section>
`,
  ex: [
    { t: 'mc', q: 'Aşağıdaki değerlerden hangisi <code>if</code> içinde <b>yanlış</b> (falsy) sayılır?',
      o: ['<code>"0"</code>', '<code>[]</code>', '<code>-1</code>', '<code>[None]</code>'], a: 1,
      why: 'Boş liste falsy sayılır. "0" boş olmayan bir metindir, -1 sıfır olmayan bir sayıdır, [None] bir elemanlı (dolu) bir listedir; üçü de truthy.' },
    { t: 'code', id: 'kosullar-1',
      q: '<p>Ilgaz Bank ön değerlendirme kuralı: <code>kredi_uygun(yas, gelir, kredi_notu)</code> fonksiyonunu yaz. Başvuran <b>18 yaş ve üzeri</b>, aylık geliri <b>en az 25000</b> ve kredi notu <b>en az 600</b> ise <code>True</code>, aksi halde <code>False</code> döndürsün.</p>',
      start: 'def kredi_uygun(yas, gelir, kredi_notu):\n    # üç şartı and ile birleştir\n    pass\n',
      sol: 'def kredi_uygun(yas, gelir, kredi_notu):\n    return yas >= 18 and gelir >= 25000 and kredi_notu >= 600\n',
      tests: 'assert kredi_uygun(30, 40000, 700) is True, "30 yaş, 40000 gelir, 700 not uygun olmalı"\nassert kredi_uygun(17, 40000, 700) is False, "17 yaş uygun olmamalı"\nassert kredi_uygun(30, 24999, 700) is False, "24999 gelir uygun olmamalı"\nassert kredi_uygun(30, 40000, 599) is False, "599 kredi notu uygun olmamalı"\nassert kredi_uygun(18, 25000, 600) is True, "sınır değerler (18, 25000, 600) uygun olmalı"\n',
      hints: ['Üç karşılaştırmayı and ile bağla.', 'Sınır değerler dahil: >= kullan.', 'Karşılaştırma ifadesinin kendisi zaten True/False döner; if yazmana gerek yok.'],
      why: 'and ile bağlanan üç karşılaştırma tek bir bool üretir; doğrudan return edilir. if/else ile True/False döndürmek gereksiz uzunluktur.' },
    { t: 'code', id: 'kosullar-2',
      q: '<p>Anadolu Market kargo kuralı: <code>kargo_ucreti(tutar)</code> fonksiyonu sepet tutarı <b>500 ve üzeri</b> ise <code>0</code>, <b>200 ve üzeri</b> ise <code>29.9</code>, aksi halde <code>49.9</code> döndürsün.</p>',
      start: 'def kargo_ucreti(tutar):\n    pass\n',
      sol: 'def kargo_ucreti(tutar):\n    if tutar >= 500:\n        return 0\n    elif tutar >= 200:\n        return 29.9\n    else:\n        return 49.9\n',
      tests: 'assert kargo_ucreti(640) == 0, "640 TL için kargo 0 olmalı"\nassert kargo_ucreti(500) == 0, "500 TL sınırı dahil, kargo 0 olmalı"\nassert abs(kargo_ucreti(350) - 29.9) < 1e-9, "350 TL için 29.9 olmalı"\nassert abs(kargo_ucreti(200) - 29.9) < 1e-9, "200 TL sınırı dahil, 29.9 olmalı"\nassert abs(kargo_ucreti(199.99) - 49.9) < 1e-9, "199.99 TL için 49.9 olmalı"\n',
      hints: ['Önce en büyük eşiği (500) kontrol et, sonra 200.', 'elif zinciri: ilk doğru dal çalışır.'],
      why: 'Eşikler büyükten küçüğe sıralanır; 640 önce ilk dala takılır. Sıra ters olsaydı 640 de 200 dalına girerdi.' },
    { t: 'code', id: 'kosullar-3',
      q: '<p><code>musteri_segmenti(toplam_harcama, siparis_sayisi)</code> fonksiyonunu yaz. Kural: toplam harcama <b>10000 ve üzeri</b> ve sipariş sayısı <b>en az 10</b> ise <code>"Altın"</code>; toplam harcama <b>3000 ve üzeri</b> <i>veya</i> sipariş sayısı <b>en az 5</b> ise <code>"Gümüş"</code>; diğer hallerde <code>"Bronz"</code>.</p>',
      start: 'def musteri_segmenti(toplam_harcama, siparis_sayisi):\n    pass\n',
      sol: 'def musteri_segmenti(toplam_harcama, siparis_sayisi):\n    if toplam_harcama >= 10000 and siparis_sayisi >= 10:\n        return "Altın"\n    if toplam_harcama >= 3000 or siparis_sayisi >= 5:\n        return "Gümüş"\n    return "Bronz"\n',
      tests: 'assert musteri_segmenti(12000, 12) == "Altın", "12000 TL ve 12 sipariş Altın olmalı"\nassert musteri_segmenti(12000, 3) == "Gümüş", "12000 TL ama 3 sipariş: Gümüş olmalı"\nassert musteri_segmenti(500, 6) == "Gümüş", "500 TL ama 6 sipariş: Gümüş olmalı"\nassert musteri_segmenti(500, 2) == "Bronz", "500 TL ve 2 sipariş Bronz olmalı"\nassert musteri_segmenti(3000, 1) == "Gümüş", "3000 sınırı dahil Gümüş olmalı"\n',
      hints: ['Altın için and, Gümüş için or kullan.', 'Önce en zor şartı (Altın) kontrol et; Altın olmayan ama Gümüş şartını sağlayanlar ikinci if\'e düşer.'],
      why: 'Erken dönüş kalıbı: en seçici kural üstte, en genel kural (Bronz) sonda tek bir return olarak kalır.' },
    { t: 'mc', q: '<code>print(not True or True)</code> ifadesi ne yazdırır?',
      o: ['False', 'True', 'SyntaxError', 'None'], a: 1,
      why: 'not, or\'dan önce işlenir: (not True) or True = False or True = True. Öncelik sırası: not > and > or.' },
    { t: 'code', id: 'kosullar-4',
      q: '<p>Ilgaz Bank ATM kuralı: <code>para_cekme(bakiye, tutar, kart_aktif)</code> fonksiyonu <b>erken dönüş</b> kalıbıyla şu metinlerden birini döndürsün: kart aktif değilse <code>"RED: kart pasif"</code>; tutar 0 veya negatifse <code>"RED: geçersiz tutar"</code>; tutar bakiyeden büyükse <code>"RED: yetersiz bakiye"</code>; aksi halde <code>"ONAY"</code>.</p>',
      start: 'def para_cekme(bakiye, tutar, kart_aktif):\n    # olumsuz durumları sırayla ele, en sonda "ONAY" döndür\n    pass\n',
      sol: 'def para_cekme(bakiye, tutar, kart_aktif):\n    if not kart_aktif:\n        return "RED: kart pasif"\n    if tutar <= 0:\n        return "RED: geçersiz tutar"\n    if tutar > bakiye:\n        return "RED: yetersiz bakiye"\n    return "ONAY"\n',
      tests: 'assert para_cekme(1000, 200, True) == "ONAY", "1000 bakiye, 200 tutar, aktif kart ONAY olmalı"\nassert para_cekme(1000, 200, False) == "RED: kart pasif", "pasif kart reddedilmeli"\nassert para_cekme(1000, 0, True) == "RED: geçersiz tutar", "0 tutar geçersiz olmalı"\nassert para_cekme(1000, -50, True) == "RED: geçersiz tutar", "negatif tutar geçersiz olmalı"\nassert para_cekme(100, 200, True) == "RED: yetersiz bakiye", "bakiyeden büyük tutar reddedilmeli"\nassert para_cekme(200, 200, True) == "ONAY", "bakiyeye eşit tutar çekilebilmeli"\n',
      hints: ['Kart kontrolü için not kart_aktif.', 'Her red koşulu kendi if bloğunda return etsin; else gerekmez.'],
      why: 'Kontroller iş kuralının sırasıyla dizilir; hepsinden geçen tek yol en alttaki "ONAY" satırıdır. Girinti hiç derinleşmez.' },
    { t: 'mc', q: 'Aşağıdaki kodda <code>x = 75</code> için ne yazdırılır?<br><code>if x &gt; 50: print("A")</code><br><code>elif x &gt; 70: print("B")</code><br><code>else: print("C")</code>',
      o: ['A', 'B', 'A ve B', 'C'], a: 0,
      why: 'Dallar sırayla denenir ve ilk doğru olan çalışır. 75 > 50 doğru olduğundan "A" yazdırılır; elif hiç değerlendirilmez. Daha dar koşul (> 70) üstte olmalıydı.' }
  ],
  faq: [
    { q: 'elif yerine arka arkaya if yazsam olmaz mı?', a: 'Çalışır ama anlam değişir: bağımsız if\'lerin hepsi ayrı ayrı denenir ve birden fazlası çalışabilir. elif zincirinde yalnızca ilk doğru dal çalışır. "Biri ya da diğeri" istiyorsan elif kullan.' },
    { q: '<code>if x == True</code> yazmak yanlış mı?', a: 'Hatalı değil ama gereksiz. <code>if x:</code> aynı işi yapar ve Pythonic olan budur. Benzer şekilde <code>if x == False</code> yerine <code>if not x:</code> yaz.' },
    { q: 'Metinleri büyük/küçük harf fark etmeden karşılaştırmak için ne yapmalıyım?', a: 'Her iki tarafı da aynı forma getir: <code>if sehir.lower() == "ankara":</code>. Türkçe İ/ı için <code>casefold()</code> da işe yarar ama tam Türkçe desteği sınırlıdır; veriyi baştan temiz tutmak en sağlıklısıdır.' }
  ],
  mistakes: [
    { bad: 'if yas = 18:\n    print("tam sınır")', good: 'if yas == 18:\n    print("tam sınır")', why: 'Tek eşittir atama, çift eşittir karşılaştırmadır. Python bunu SyntaxError ile yakalar.' },
    { bad: 'if sehir == "Ankara" or "İzmir":\n    print("kapsama alanı")', good: 'if sehir in ("Ankara", "İzmir"):\n    print("kapsama alanı")', why: 'or "İzmir" ayrı bir ifadedir ve boş olmayan metin her zaman True sayılır; koşul hep doğru çıkar.' },
    { bad: 'if tutar >= 200:\n    kargo = 29.9\nelif tutar >= 500:\n    kargo = 0', good: 'if tutar >= 500:\n    kargo = 0\nelif tutar >= 200:\n    kargo = 29.9', why: 'Eşikler büyükten küçüğe sıralanmalı; aksi halde 500 üstü tutarlar hiç ikinci dala ulaşamaz.' },
    { bad: 'if deger == None:\n    ...', good: 'if deger is None:\n    ...', why: 'None tek bir nesnedir; kimlik karşılaştırması (is) hem daha hızlı hem de PEP 8 önerisidir.' }
  ]
},
/* ───────────────────────── 2. DÖNGÜLER ───────────────────────── */
{
  id: 'donguler',
  lv: 'temel',
  mod: 'Akış Kontrolü',
  min: 30,
  title: 'Döngüler: for ve while',
  sum: 'Yüzlerce siparişi tek tek elden geçir: for ile range, enumerate ve zip; while; break/continue/else; sayaç ve birikim kalıpları; sonsuz döngü tuzağı.',
  goals: [
    'for döngüsüyle liste, sözlük ve range üzerinde dolaşabilirim.',
    'enumerate ve zip ile sıra numarası ve paralel listeleri birlikte işleyebilirim.',
    'while döngüsünü koşul sağlandığı sürece çalıştırır, sonsuz döngüden kaçınırım.',
    'break, continue ve döngü else bloğunun ne zaman çalıştığını açıklayabilirim.',
    'Sayaç, toplam biriktirme ve "en büyüğü bul" kalıplarını ezbere yazabilirim.'
  ],
  body: `
<div class="note"><b>Önce küçük bir not</b>Döngülerde sık göreceğin <code>[10, 20, 30]</code> yazımı bir <b>liste</b>dir: birkaç değeri sırayla tutar. Şimdilik bu kadarını bilmen yeter; ayrıntısı bir sonraki modülde, Listeler dersinde.</div>
<h2>Neden önemli?</h2>
<p>Anadolu Market'te bir günde yüzlerce sipariş oluşur. "Her siparişin tutarını topla", "İstanbul'a gidenleri say", "stoğu 5'in altına düşen ilk ürünü bul" gibi işler aynı adımı tekrar tekrar uygulamaktır. Bilgisayarın asıl gücü de budur: tekrar. Döngü (loop) bu tekrarı sen yorulmadan yapar.</p>

<h2>for: bir koleksiyonu baştan sona gez</h2>
<p><code>for</code> döngüsü bir koleksiyonun (liste, metin, sözlük, demet, range) her elemanını sırayla bir değişkene koyar ve bloğu çalıştırır.</p>
<pre class="py">siparisler = [
    {"id": 1001, "sehir": "Ankara", "tutar": 900.0},
    {"id": 1002, "sehir": "İzmir", "tutar": 820.0},
    {"id": 1003, "sehir": "Ankara", "tutar": 930.0},
    {"id": 1004, "sehir": "İstanbul", "tutar": 450.0},
]

toplam = 0            # birikim (accumulator) değişkeni
for siparis in siparisler:
    toplam += siparis["tutar"]
print("Toplam ciro:", toplam)

ankara_sayisi = 0     # sayaç (counter)
for siparis in siparisler:
    if siparis["sehir"] == "Ankara":
        ankara_sayisi += 1
print("Ankara siparişi:", ankara_sayisi)</pre>
<p>Bu iki kalıp, yazacağın döngülerin büyük kısmını kapsar: döngüden önce bir değişkeni başlat (0, boş liste, boş sözlük), döngü içinde güncelle, döngüden sonra kullan.</p>

<h3>range: sayı dizisi üret</h3>
<pre class="py">for i in range(5):          # 0, 1, 2, 3, 4
    print(i, end=" ")
print()
for i in range(1, 6):       # 1..5
    print(i, end=" ")
print()
for i in range(10, 0, -3):  # 10, 7, 4, 1 (adım -3)
    print(i, end=" ")
print()
print(list(range(0, 20, 5)))</pre>
<div class="note"><b>Bitiş dahil değil</b><code>range(1, 6)</code> 6'yı üretmez. Python'daki tüm aralıklar (dilimleme dahil) "başlangıç dahil, bitiş hariç" çalışır; böylece <code>range(len(liste))</code> tam olarak indeksleri verir.</div>

<h3>enumerate: elemanla birlikte sıra numarası</h3>
<p>"Kaçıncı eleman?" sorusuna <code>range(len(liste))</code> yerine <code>enumerate</code> ile cevap ver; hem eleman hem indeks gelir.</p>
<pre class="py">sehirler = ["Ankara", "İzmir", "İstanbul"]
for sira, sehir in enumerate(sehirler, start=1):
    print(f"{sira}. {sehir}")</pre>

<h3>zip: paralel listeleri yan yana gez</h3>
<pre class="py">urunler = ["Kulaklık", "Klavye", "Mouse"]
adetler = [12, 3, 25]
for urun, adet in zip(urunler, adetler):
    durum = "AZ" if adet &lt; 5 else "ok"
    print(f"{urun}: {adet} ({durum})")</pre>
<p><code>zip</code> en kısa liste bitince durur. Sözlük gezerken de aynı "çift" mantığı var: <code>for anahtar, deger in sozluk.items():</code>.</p>

<h2>while: koşul doğru olduğu sürece</h2>
<p>Kaç kez döneceğini baştan bilmiyorsan <code>while</code> kullan. Her turdan önce koşul yeniden kontrol edilir.</p>
<pre class="py">bakiye = 1000
ay = 0
while bakiye &gt; 0:
    bakiye -= 350
    ay += 1
    print(f"{ay}. ay sonunda bakiye: {bakiye}")
print("Bakiye", ay, "ayda tükendi")</pre>
<div class="warn"><b>Sonsuz döngü tuzağı</b>Koşulu değiştiren bir şey yoksa döngü asla bitmez. Yukarıdaki kodda <code>bakiye -= 350</code> satırını unutursan program donar. Her <code>while</code> yazdığında kendine sor: "Koşulu False yapacak satır hangisi ve kesin çalışıyor mu?"</div>

<h2>break, continue ve döngü else</h2>
<div class="tbl-wrap"><table>
<tr><th>İfade</th><th>Ne yapar</th><th>Tipik kullanım</th></tr>
<tr><td><code>break</code></td><td>Döngüyü hemen bitirir</td><td>Aranan bulundu, devam etmeye gerek yok</td></tr>
<tr><td><code>continue</code></td><td>Bu turu atlar, sonraki tura geçer</td><td>İstenmeyen kaydı pas geç</td></tr>
<tr><td><code>else</code></td><td>Döngü <b>break ile kesilmeden</b> biterse çalışır</td><td>"Hiçbiri eşleşmedi" mesajı</td></tr>
</table></div>
<pre class="py">stok = {"Kulaklık": 12, "Klavye": 3, "Mouse": 25, "Monitör": 0}

# break: ilk kritik ürünü bul
for urun, adet in stok.items():
    if adet &lt; 5:
        print("İlk kritik ürün:", urun)
        break

# continue: stoğu sıfır olanları atla
for urun, adet in stok.items():
    if adet == 0:
        continue
    print(f"{urun} satışa açık ({adet})")

# else: arama sonuçsuz kaldıysa
aranan = "Webcam"
for urun in stok:
    if urun == aranan:
        print("Bulundu")
        break
else:
    print(aranan, "stok listesinde yok")</pre>

<h2>İç içe döngü</h2>
<p>Döngü içine döngü yazabilirsin; iç döngü dış döngünün her turunda baştan sona döner. Toplam tur sayısı çarpılır (3 şehir × 4 ürün = 12 tur), bu yüzden büyük verilerde dikkatli ol.</p>
<pre class="py">sehirler = ["Ankara", "İzmir"]
urunler = ["Kulaklık", "Mouse"]
for sehir in sehirler:
    for urun in urunler:
        print(f"{sehir} - {urun}")</pre>

<h2>"En büyüğü bul" kalıbı</h2>
<pre class="py">siparisler = [("Ayşe", 900.0), ("Mehmet", 820.0), ("Elif", 1250.0), ("Can", 450.0)]
en_yuksek_ad = None
en_yuksek_tutar = 0
for ad, tutar in siparisler:
    if tutar &gt; en_yuksek_tutar:
        en_yuksek_ad, en_yuksek_tutar = ad, tutar
print(f"En yüksek sipariş: {en_yuksek_ad} ({en_yuksek_tutar} TL)")

# Aynı iş tek satırda (ileride sık kullanacaksın)
print(max(siparisler, key=lambda s: s[1]))</pre>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Döngü yerine yerleşik fonksiyon</h3>
<p>Toplam için <code>sum()</code>, en büyük/küçük için <code>max()/min()</code>, "hiç var mı / hepsi mi" için <code>any()/all()</code> yazmak hem daha kısa hem de daha hızlıdır; bu fonksiyonlar C ile yazılmıştır. Döngüyü kalıbı anlamak için öğren; işte ise önce yerleşik fonksiyon var mı diye bak. Orta seviyede liste comprehension ile bu kalıplar tek satıra inecek.</p>
<h3>Döngü içinde listeyi değiştirme</h3>
<p>Üzerinde dolaştığın listeden eleman silmek elemanların atlanmasına yol açar. Ya yeni bir liste kur (<code>kalanlar = []</code> ve koşula uyanları ekle) ya da kopyası üzerinde dön: <code>for x in liste[:]:</code>.</p>
<h3>Sonsuz döngü bazen kasıtlıdır</h3>
<p>Sunucular ve menü ekranları <code>while True:</code> ile yazılır ve içeride <code>break</code> ile çıkılır. Tuzak olan "sonsuz" değil, "çıkış yolu olmayan" döngüdür. Kasıtlı yazıyorsan çıkış koşulunu ilk satırlarda açıkça göster.</p>
</section>
`,
  ex: [
    { t: 'code', id: 'donguler-1',
      q: '<p><code>toplam_ciro(siparisler)</code> fonksiyonunu yaz. Parametre, her biri <code>"tutar"</code> anahtarı taşıyan sözlüklerden oluşan bir listedir. Tüm tutarların toplamını döndür (for döngüsü ve birikim değişkeni kullan). Boş liste için 0 dönsün.</p>',
      start: 'def toplam_ciro(siparisler):\n    toplam = 0\n    # döngüyle topla\n    return toplam\n',
      sol: 'def toplam_ciro(siparisler):\n    toplam = 0\n    for s in siparisler:\n        toplam += s["tutar"]\n    return toplam\n',
      tests: 'veri = [{"id": 1, "tutar": 900.0}, {"id": 2, "tutar": 820.0}, {"id": 3, "tutar": 930.0}]\nassert abs(toplam_ciro(veri) - 2650.0) < 1e-6, "üç siparişin toplamı 2650.0 olmalı"\nassert toplam_ciro([]) == 0, "boş liste için 0 dönmeli"\nassert abs(toplam_ciro([{"tutar": 49.9}]) - 49.9) < 1e-6, "tek sipariş için tutarın kendisi dönmeli"\n',
      hints: ['toplam = 0 ile başla.', 'Her sözlükten s["tutar"] değerini al ve toplam += ile ekle.'],
      why: 'Klasik birikim kalıbı: döngüden önce sıfırla, içeride ekle, sonra döndür. sum(s["tutar"] for s in siparisler) da aynı işi yapar.' },
    { t: 'code', id: 'donguler-2',
      q: '<p><code>ilk_buyuk_siparis(siparisler, esik)</code> fonksiyonunu yaz. Tutarı <code>esik</code> değerinden <b>büyük</b> olan ilk siparişin <code>"id"</code> değerini döndür ve döngüyü <code>break</code> ya da <code>return</code> ile hemen bitir. Hiç yoksa <code>None</code> döndür.</p>',
      start: 'def ilk_buyuk_siparis(siparisler, esik):\n    pass\n',
      sol: 'def ilk_buyuk_siparis(siparisler, esik):\n    for s in siparisler:\n        if s["tutar"] > esik:\n            return s["id"]\n    return None\n',
      tests: 'veri = [{"id": 1001, "tutar": 900.0}, {"id": 1002, "tutar": 820.0}, {"id": 1003, "tutar": 930.0}, {"id": 1004, "tutar": 3200.0}]\nassert ilk_buyuk_siparis(veri, 850) == 1001, "850 eşiği için ilk büyük sipariş 1001 olmalı"\nassert ilk_buyuk_siparis(veri, 920) == 1003, "920 eşiği için 1003 olmalı"\nassert ilk_buyuk_siparis(veri, 900) == 1003, "900 eşiğinde eşit olan sayılmaz, 1003 dönmeli"\nassert ilk_buyuk_siparis(veri, 5000) is None, "hiç büyük sipariş yoksa None dönmeli"\nassert ilk_buyuk_siparis([], 0) is None, "boş liste için None dönmeli"\n',
      hints: ['Döngü içinde koşul sağlanınca return s["id"] yaz; return döngüyü de bitirir.', 'Döngü bittiğinde hâlâ fonksiyondaysan hiç bulunamamıştır: return None.'],
      why: 'Fonksiyon içindeki return, break gibi döngüyü keser ve değeri döndürür. Döngüden sonra gelen return None "bulunamadı" durumudur; for-else ile de yazılabilir.' },
    { erken: true, t: 'code', id: 'donguler-3',
      q: '<p><code>sehir_sayaci(siparisler)</code> fonksiyonu her şehre kaç sipariş düştüğünü sözlük olarak döndürsün. Örnek: <code>{"Ankara": 2, "İzmir": 1}</code>. Siparişler <code>"sehir"</code> anahtarlı sözlüklerdir. Sayaç kalıbını sözlükle kur (<code>dict.get</code> işine yarar).</p>',
      start: 'def sehir_sayaci(siparisler):\n    sayac = {}\n    for s in siparisler:\n        pass\n    return sayac\n',
      sol: 'def sehir_sayaci(siparisler):\n    sayac = {}\n    for s in siparisler:\n        sehir = s["sehir"]\n        sayac[sehir] = sayac.get(sehir, 0) + 1\n    return sayac\n',
      tests: 'veri = [{"sehir": "Ankara"}, {"sehir": "İzmir"}, {"sehir": "Ankara"}, {"sehir": "İstanbul"}, {"sehir": "Ankara"}]\nassert sehir_sayaci(veri) == {"Ankara": 3, "İzmir": 1, "İstanbul": 1}, "Ankara 3, İzmir 1, İstanbul 1 olmalı"\nassert sehir_sayaci([]) == {}, "boş liste için boş sözlük dönmeli"\n',
      hints: ['sayac.get(sehir, 0) şehir yoksa 0 verir.', 'Bulunan değere 1 ekleyip aynı anahtara geri yaz.'],
      why: 'Sözlükle sayma, veri işlemede en sık kalıplardan biridir. collections.Counter aynı işi tek satırda yapar; orta seviyede göreceksin.' },
    { t: 'mc', q: '<code>list(range(1, 10, 3))</code> ifadesinin sonucu nedir?',
      o: ['[1, 4, 7, 10]', '[1, 4, 7]', '[3, 6, 9]', '[1, 3, 5, 7, 9]'], a: 1,
      why: 'range(1, 10, 3): 1\'den başlar, 3\'er artar, 10\'a ulaşmadan durur (bitiş hariç). 1, 4, 7 üretilir; 10 dahil değildir.' },
    { t: 'code', id: 'donguler-4',
      q: '<p>Aşağıdaki iki listeyi <code>zip</code> ve <code>enumerate</code> ile birlikte gezerek <b>tam olarak</b> şu çıktıyı üret (sıra numarası 1\'den başlasın, ayraç olarak <code> - </code> kullan):</p><pre class="out">1. Kulaklık - 12\n2. Klavye - 3\n3. Mouse - 25</pre>',
      start: 'urunler = ["Kulaklık", "Klavye", "Mouse"]\nadetler = [12, 3, 25]\n\n# for ... in enumerate(zip(...), start=1):\n',
      sol: 'urunler = ["Kulaklık", "Klavye", "Mouse"]\nadetler = [12, 3, 25]\n\nfor sira, (urun, adet) in enumerate(zip(urunler, adetler), start=1):\n    print(f"{sira}. {urun} - {adet}")\n',
      expect: '1. Kulaklık - 12\n2. Klavye - 3\n3. Mouse - 25\n',
      hints: ['zip(urunler, adetler) her turda bir (urun, adet) çifti verir.', 'enumerate(..., start=1) bu çiftlerin önüne sıra numarası ekler: sira, (urun, adet).'],
      why: 'enumerate(zip(...)) iç içe demet üretir; for satırında parantezle açılır. start=1 sayesinde 0 yerine 1\'den başlar.' },
    { t: 'mc', q: 'Bir <code>for</code> döngüsünün <code>else</code> bloğu ne zaman çalışır?',
      o: ['Döngü hiç dönmediğinde', 'Döngü break ile kesilmeden tamamlandığında', 'Döngü break ile kesildiğinde', 'Her turun sonunda'], a: 1,
      why: 'Döngü else bloğu, döngü normal yoldan (break olmadan) biterse çalışır. Liste boş olsa bile break olmadığı için yine çalışır; "arama sonuçsuz" kalıbında kullanılır.' },
    { t: 'code', id: 'donguler-5',
      q: '<p><code>stok_uyari(urunler, adetler, esik)</code> fonksiyonu <code>zip</code> ile iki listeyi birlikte gezsin ve adedi <code>esik</code> değerinden <b>küçük</b> olan ürünlerin adlarını, sırasını koruyarak liste halinde döndürsün.</p>',
      start: 'def stok_uyari(urunler, adetler, esik):\n    kritik = []\n    pass\n    return kritik\n',
      sol: 'def stok_uyari(urunler, adetler, esik):\n    kritik = []\n    for urun, adet in zip(urunler, adetler):\n        if adet < esik:\n            kritik.append(urun)\n    return kritik\n',
      tests: 'u = ["Kulaklık", "Klavye", "Mouse", "Monitör"]\na = [12, 3, 25, 0]\nassert stok_uyari(u, a, 5) == ["Klavye", "Monitör"], "5 eşiği için Klavye ve Monitör dönmeli"\nassert stok_uyari(u, a, 13) == ["Kulaklık", "Klavye", "Monitör"], "13 eşiği için Kulaklık, Klavye, Monitör dönmeli"\nassert stok_uyari(u, a, 0) == [], "0 eşiği için hiçbiri dönmemeli"\nassert stok_uyari(u, a, 12) == ["Klavye", "Monitör"], "eşiğe eşit (12) olan dahil edilmemeli"\n',
      hints: ['for urun, adet in zip(urunler, adetler):', 'Koşul sağlanınca kritik.append(urun).'],
      why: 'zip paralel listeleri çiftler; filtreleme için boş listeye koşula uyanları ekleme kalıbı kullanılır.' },
    { t: 'mc', q: 'Aşağıdaki döngülerden hangisi <b>sonsuz döngüdür</b>?',
      o: ['<code>i = 0</code><br><code>while i &lt; 3: i += 1</code>', '<code>for i in range(10**6): pass</code>', '<code>n = 5</code><br><code>while n &gt; 0: print(n)</code>', '<code>while False: print("x")</code>'], a: 2,
      why: 'Üçüncü seçenekte n hiç değişmediği için koşul hep True kalır. İlkinde i artıp 3\'e ulaşır, ikincisi uzun ama sonludur, dördüncüsü hiç çalışmaz.' }
  ],
  faq: [
    { q: 'for i in range(len(liste)) yazmak yanlış mı?', a: 'Çalışır ama Pythonic değildir. Yalnızca elemana ihtiyacın varsa doğrudan for eleman in liste, indekse de ihtiyacın varsa for i, eleman in enumerate(liste) yaz.' },
    { q: 'Döngü değişkeni döngüden sonra da yaşar mı?', a: 'Evet. for i in range(3) bittikten sonra i değeri 2 olarak kalır. Bu bazen kullanışlı, bazen kafa karıştırıcıdır; döngü dışında güvenmemek daha temizdir.' },
    { q: 'while ile for arasında hangisini seçmeliyim?', a: 'Bir koleksiyonu gezeceksen ya da kaç tur döneceğini biliyorsan for. "Bir şey olana kadar" (bakiye bitene, doğru cevap gelene kadar) dönecekse while.' }
  ],
  mistakes: [
    { bad: 'toplam = 0\nfor s in siparisler:\n    toplam = s["tutar"]', good: 'toplam = 0\nfor s in siparisler:\n    toplam += s["tutar"]', why: '= yazınca her turda önceki değer silinir; birikim için += gerekir.' },
    { bad: 'n = 10\nwhile n > 0:\n    print(n)', good: 'n = 10\nwhile n > 0:\n    print(n)\n    n -= 1', why: 'Koşulu değiştiren satır yoksa döngü sonsuza dek döner.' },
    { bad: 'for i in range(len(urunler)):\n    print(i + 1, urunler[i])', good: 'for i, urun in enumerate(urunler, start=1):\n    print(i, urun)', why: 'enumerate hem indeksi hem elemanı verir; indeksle erişmek gereksiz ve hataya açıktır.' },
    { bad: 'for x in liste:\n    if x < 0:\n        liste.remove(x)', good: 'kalanlar = []\nfor x in liste:\n    if x >= 0:\n        kalanlar.append(x)', why: 'Gezdiğin listeden eleman silmek sıradaki elemanın atlanmasına yol açar; yeni liste kur.' }
  ]
}
);
})(window);
/* Kesit Python — Temel 3: Fonksiyonlar ve Modüller (fonksiyonlar, kapsam-moduller, string-bicimleme) */
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push(
/* ───────────────────────── 1. fonksiyonlar ───────────────────────── */
{
  id: 'fonksiyonlar',
  lv: 'temel',
  mod: 'Fonksiyonlar ve Modüller',
  min: 30,
  title: 'Fonksiyonlar',
  sum: 'def ile kendi fonksiyonunu yazar; parametre, varsayılan değer, anahtar sözcüklü argüman, *args/**kwargs ve çoklu return ile Anadolu Market KDV ve indirim hesaplarını tek yerden yönetirsin.',
  goals: [
    'def ile parametreli fonksiyon tanımlayıp return ile değer döndürebilirim.',
    'Varsayılan değerli ve anahtar sözcüklü argümanları doğru sırayla kullanabilirim.',
    '*args ve **kwargs ile değişken sayıda argüman alan fonksiyon yazabilirim.',
    'Bir fonksiyondan birden fazla değeri demet olarak döndürüp açabilirim.',
    'Docstring yazar, saf fonksiyonu tanır ve değişebilir varsayılan tuzağından kaçınırım.'
  ],
  body: `
<h2>Neden fonksiyon?</h2>
<p>Anadolu Market'in fiyat ekibinde çalıştığını düşün. Ürün listesi, sepet özeti, fatura, iade ekranı: hepsinde KDV hesaplanıyor. Bu hesabı her ekranda ayrı ayrı yazarsan bir gün KDV oranı değiştiğinde dört yeri de bulup düzeltmen gerekir; birini unutursan fatura yanlış kesilir. Fonksiyon (function), "bu hesabı bir kere yaz, her yerden çağır" demenin yoludur. Şimdiye kadar <code>print</code>, <code>len</code>, <code>round</code> gibi hazır fonksiyonları kullandın; bu derste kendi fonksiyonlarını yazacaksın.</p>
<p>Fonksiyonun üç kazancı var: <b>tekrarı önler</b> (aynı kodu bir kere yazarsın), <b>ad verir</b> (<code>kdv_hesapla(fiyat)</code> yazısı, formülün kendisinden daha anlaşılırdır) ve <b>test edilebilir</b> küçük parçalar üretir.</p>

<h2>def, parametre ve return</h2>
<p>Bir fonksiyon <code>def</code> anahtar sözcüğü, bir ad, parantez içinde parametreler (parameter) ve iki nokta ile tanımlanır. Gövde girintilidir. <code>return</code>, fonksiyonun ürettiği değeri çağıran yere geri gönderir.</p>
<pre class="py">def kdv_hesapla(fiyat, oran=0.20):
    """Fiyata KDV ekler ve KDV dahil tutarı döndürür."""
    return round(fiyat * (1 + oran), 2)

print(kdv_hesapla(100))        # varsayılan oran %20
print(kdv_hesapla(100, 0.10))  # gıda ürünü, %10
print(kdv_hesapla(fiyat=250, oran=0.01))</pre>
<p>Burada <code>fiyat</code> ve <code>oran</code> <b>parametre</b>, çağrıda verdiğin <code>100</code> ve <code>0.10</code> ise <b>argüman</b> (argument). Parametre tanımdaki isimdir, argüman o isme gerçekten gönderilen değer. Üçlü tırnak içindeki ilk metin <b>docstring</b>: fonksiyonun ne yaptığını anlatır, <code>help(kdv_hesapla)</code> yazınca görünür. İşyerinde her fonksiyona bir satırlık docstring yazma alışkanlığı, kodunu okuyan ekip arkadaşlarına bırakacağın en kıymetli nottur.</p>
<div class="note"><b>return olmayan fonksiyon</b>Bir fonksiyonda <code>return</code> yoksa ya da yalnızca <code>return</code> yazılmışsa fonksiyon <code>None</code> döndürür. <code>sonuc = print("x")</code> yazarsan <code>sonuc</code> None olur; print ekrana yazar ama değer döndürmez.</div>

<h2>Varsayılan değer ve anahtar sözcüklü argüman</h2>
<p><code>oran=0.20</code> yazımı <b>varsayılan değer</b> (default value) verir: çağıran oran belirtmezse 0.20 kullanılır. Varsayılan değerli parametreler, değersiz olanlardan <b>sonra</b> gelmek zorundadır; <code>def f(oran=0.2, fiyat)</code> SyntaxError verir.</p>
<p>Çağrıda <code>fiyat=250</code> gibi ad belirtmeye <b>anahtar sözcüklü argüman</b> (keyword argument) denir. Konumsal (positional) argümanlar sırayla eşleşir; anahtar sözcüklüler ise adla eşleşir, bu yüzden sırası önemsizdir. İkisini karıştırabilirsin ama konumsallar her zaman önce gelir.</p>
<pre class="py">def indirim_uygula(fiyat, yuzde=0, kupon=0, uye=False):
    tutar = fiyat * (1 - yuzde / 100)
    tutar -= kupon
    if uye:
        tutar *= 0.95          # üyelere ek %5
    return round(max(tutar, 0), 2)

print(indirim_uygula(1000))
print(indirim_uygula(1000, 10))
print(indirim_uygula(1000, kupon=50))
print(indirim_uygula(1000, 10, uye=True))
print(indirim_uygula(fiyat=40, kupon=100))   # eksiye düşmez</pre>
<p>Dört parametreli bir fonksiyonda <code>indirim_uygula(1000, 0, 0, True)</code> yazmak okunmaz; <code>indirim_uygula(1000, uye=True)</code> ise kendini anlatır. Çok parametreli fonksiyonlarda anahtar sözcük kullanmak, PEP 8 kadar önemli bir ekip kuralıdır.</p>

<h2>Çoklu dönüş: demet açma</h2>
<p>Python'da bir fonksiyon birden fazla değer "döndürüyor" gibi görünür; aslında tek bir demet (tuple) döndürür ve sen onu açarsın (unpacking). Fatura hesabında ara toplam, KDV ve genel toplamı birlikte döndürmek doğal bir örnektir:</p>
<pre class="py">def fatura_hesapla(sepet, kdv_orani=0.20):
    """sepet: (urun, adet, birim_fiyat) demetlerinin listesi"""
    ara_toplam = 0
    for urun, adet, fiyat in sepet:
        ara_toplam += adet * fiyat
    kdv = round(ara_toplam * kdv_orani, 2)
    return ara_toplam, kdv, round(ara_toplam + kdv, 2)

sepet = [("Kahve Makinesi", 1, 1500), ("Filtre", 3, 45.5), ("Fincan", 6, 30)]
ara, kdv, toplam = fatura_hesapla(sepet)
print("Ara toplam:", ara)
print("KDV:", kdv)
print("Genel toplam:", toplam)
print(type(fatura_hesapla(sepet)))</pre>
<p>Son satır <code>&lt;class 'tuple'&gt;</code> basar: döndürülen şey gerçekten bir demettir. Üç değişkene açmak için sol tarafa üç ad yazarsın; sayı tutmazsa <code>ValueError</code> alırsın.</p>

<h2>*args ve **kwargs</h2>
<p>Kaç argüman geleceğini önceden bilmediğin durumlar olur. Sepete 2 ürün de eklenebilir 20 ürün de. <code>*args</code> fazladan gelen <b>konumsal</b> argümanları bir demette, <code>**kwargs</code> fazladan gelen <b>anahtar sözcüklü</b> argümanları bir sözlükte toplar. <code>args</code> ve <code>kwargs</code> adları gelenektir; yıldızlar asıl işi yapar.</p>
<pre class="py">def sepet_toplami(*fiyatlar, **secenekler):
    toplam = sum(fiyatlar)
    print("gelen fiyatlar:", fiyatlar)
    print("gelen seçenekler:", secenekler)
    if secenekler.get("kargo_bedava", False) is False and toplam &lt; 500:
        toplam += secenekler.get("kargo", 49.9)
    return round(toplam, 2)

print(sepet_toplami(120, 85.5, 60))
print(sepet_toplami(120, 85.5, 60, kargo=29.9))
print(sepet_toplami(900, 250, kargo_bedava=True))</pre>
<p>Yıldızın tersi de çalışır: elindeki listeyi <code>sepet_toplami(*liste)</code>, sözlüğü <code>f(**sozluk)</code> diyerek açıp argüman olarak gönderebilirsin.</p>
<div class="tbl-wrap"><table>
<tr><th>Yazım</th><th>Ne alır</th><th>Fonksiyon içinde türü</th><th>Örnek çağrı</th></tr>
<tr><td><code>def f(a, b)</code></td><td>Tam iki konumsal argüman</td><td>tekil değerler</td><td><code>f(1, 2)</code></td></tr>
<tr><td><code>def f(a, b=5)</code></td><td>Bir zorunlu, bir isteğe bağlı</td><td>tekil değerler</td><td><code>f(1)</code>, <code>f(1, b=9)</code></td></tr>
<tr><td><code>def f(*args)</code></td><td>Sıfır veya daha çok konumsal</td><td>tuple</td><td><code>f()</code>, <code>f(1, 2, 3)</code></td></tr>
<tr><td><code>def f(**kwargs)</code></td><td>Sıfır veya daha çok anahtar sözcüklü</td><td>dict</td><td><code>f(x=1, y=2)</code></td></tr>
<tr><td><code>def f(a, *args, k=0, **kwargs)</code></td><td>Hepsi birden, bu sırayla</td><td>karışık</td><td><code>f(1, 2, 3, k=4, z=5)</code></td></tr>
</table></div>

<h2>Saf fonksiyon</h2>
<p>Aynı girdiye her zaman aynı çıktıyı veren ve dış dünyayı değiştirmeyen fonksiyona <b>saf fonksiyon</b> (pure function) denir. <code>kdv_hesapla(100)</code> her çağrıda 120.0 verir; ekrana yazmaz, dosyaya dokunmaz, global değişken bozmaz. Saf fonksiyonlar test etmesi en kolay, hata ayıklaması en rahat parçalardır. Hesabı yapan fonksiyonla sonucu yazdıran kodu ayır: hesap saf kalsın, print dışarıda olsun. Ders boyunca bu kalıbı göreceksin: <code>fatura_hesapla</code> hesaplar, çağıran yer yazdırır.</p>

<h2>Değişebilir varsayılan tuzağı</h2>
<p>Python'da en meşhur tuzaklardan biri: varsayılan değer, fonksiyon <b>tanımlandığında bir kez</b> oluşturulur, her çağrıda yeniden değil. Varsayılan bir liste ya da sözlükse, tüm çağrılar aynı nesneyi paylaşır.</p>
<pre class="py">def sepete_ekle(urun, sepet=[]):      # TUZAK
    sepet.append(urun)
    return sepet

print(sepete_ekle("Kahve"))
print(sepete_ekle("Çay"))              # Kahve hâlâ içeride!

def sepete_ekle_dogru(urun, sepet=None):
    if sepet is None:
        sepet = []
    sepet.append(urun)
    return sepet

print(sepete_ekle_dogru("Kahve"))
print(sepete_ekle_dogru("Çay"))</pre>
<div class="warn"><b>Kural</b>Varsayılan değer olarak asla <code>[]</code>, <code>{}</code> ya da <code>set()</code> yazma. <code>None</code> ver, gövdede <code>if sepet is None: sepet = []</code> ile oluştur. Sayı, metin, demet ve <code>None</code> gibi değişmez (immutable) varsayılanlar güvenlidir.</div>
<div class="tip"><b>İyi fonksiyon nasıl olur?</b>Tek bir iş yapar, adı fiille başlar (<code>hesapla</code>, <code>bul</code>, <code>filtrele</code>), 3-5 parametreyi geçmez, docstring taşır ve mümkünse saftır. 40 satırı geçen bir fonksiyon genelde ikiye bölünmek ister.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Yalnızca anahtar sözcüklü ve yalnızca konumsal parametreler</h3>
<p>Python 3'te parametre listesine tek başına <code>*</code> koyarsan sonrasındaki parametreler yalnızca adla verilebilir: <code>def indirim(fiyat, *, yuzde=0, kupon=0)</code>. Artık <code>indirim(1000, 10)</code> hata verir; <code>indirim(1000, yuzde=10)</code> yazmak zorunludur. Bu, yanlışlıkla yüzde yerine kupon göndermeyi imkânsız kılar. Tersi için <code>/</code> kullanılır: <code>def f(a, b, /)</code> yazımında a ve b yalnızca konumsaldır; <code>len</code> gibi yerleşik fonksiyonlar böyledir.</p>
<h3>Tip ipuçları</h3>
<p>Kurumsal kodda fonksiyon imzasına tip ipucu (type hint) eklenir: <code>def kdv_hesapla(fiyat: float, oran: float = 0.20) -&gt; float:</code>. Python bunları zorlamaz ama editör ve <code>mypy</code> gibi araçlar hataları daha yazarken yakalar. Dataclass ve typing dersinde ayrıntıya gireceğiz; şimdilik imzaya tip yazmayı deneyebilirsin, zararı yoktur.</p>
<h3>Fonksiyon bir değerdir</h3>
<p>Python'da fonksiyon da bir nesnedir: değişkene atanır, listeye konur, başka fonksiyona argüman olarak verilir. <code>hesaplar = {"kdv": kdv_hesapla, "indirim": indirim_uygula}</code> gibi bir sözlükle "işlem adı → fonksiyon" tablosu kurabilirsin. Orta seviyedeki fonksiyonel programlama ve dekoratör dersleri tamamen bu fikrin üstüne kurulur.</p>
</section>
`,
  ex: [
    { t: 'mc', q: 'Aşağıdaki tanımlardan hangisi <b>SyntaxError</b> verir?',
      o: ['def f(a, b=2):', 'def f(a=1, b):', 'def f(*args, k=0):', 'def f(a, *args, **kwargs):'], a: 1,
      why: 'Varsayılan değerli parametre, değersiz parametreden önce gelemez; Python "non-default argument follows default argument" hatası verir. Diğer üçü geçerli imzalardır.' },
    { t: 'code', id: 'fonksiyonlar-1',
      q: '<p><code>kdv_dahil(fiyat, oran=0.20)</code> fonksiyonunu yaz. Fiyata verilen orandaki KDV\'yi ekleyip sonucu 2 ondalığa yuvarlayarak döndürsün. Oran verilmezse %20 kullanılsın.</p>',
      start: 'def kdv_dahil(fiyat, oran=0.20):\n    # buraya yaz\n    pass\n',
      sol: 'def kdv_dahil(fiyat, oran=0.20):\n    return round(fiyat * (1 + oran), 2)\n',
      tests: 'assert kdv_dahil(100) == 120.0, "kdv_dahil(100) 120.0 olmalı"\nassert kdv_dahil(100, 0.10) == 110.0, "kdv_dahil(100, 0.10) 110.0 olmalı"\nassert kdv_dahil(oran=0.01, fiyat=250) == 252.5, "anahtar sözcüklü çağrı 252.5 vermeli"\nassert abs(kdv_dahil(33.33) - 40.0) < 1e-6, "kdv_dahil(33.33) 40.0 olmalı"\n',
      hints: ['KDV dahil tutar = fiyat * (1 + oran).', 'round(x, 2) ile iki ondalığa yuvarla ve return et.'],
      why: 'Varsayılan oran tanımda verilir; çağıran belirtmezse 0.20 kullanılır. round ile kuruş hassasiyeti korunur.' },
    { t: 'code', id: 'fonksiyonlar-2',
      q: '<p><code>indirimli_fiyat(fiyat, yuzde=0, kupon=0)</code> fonksiyonunu yaz. Önce yüzde indirimi uygulasın, sonra kupon tutarını düşsün. Sonuç sıfırın altına inemez (en az 0 döndür). Sonucu 2 ondalığa yuvarla.</p>',
      start: 'def indirimli_fiyat(fiyat, yuzde=0, kupon=0):\n    # buraya yaz\n    pass\n',
      sol: 'def indirimli_fiyat(fiyat, yuzde=0, kupon=0):\n    tutar = fiyat * (1 - yuzde / 100) - kupon\n    return round(max(tutar, 0), 2)\n',
      tests: 'assert indirimli_fiyat(1000) == 1000.0, "indirimsiz çağrı 1000.0 vermeli"\nassert indirimli_fiyat(1000, 10) == 900.0, "%10 indirim 900.0 vermeli"\nassert indirimli_fiyat(1000, kupon=50) == 950.0, "50 kupon 950.0 vermeli"\nassert indirimli_fiyat(1000, 10, 50) == 850.0, "önce yüzde sonra kupon: 850.0"\nassert indirimli_fiyat(40, kupon=100) == 0, "sonuç eksiye düşmemeli"\n',
      hints: ['Önce fiyat * (1 - yuzde / 100), sonra - kupon.', 'max(tutar, 0) ile eksiyi engelle.'],
      why: 'İşlem sırası görevde belirtildiği gibi: önce yüzde, sonra kupon. max ile alt sınır konur, round ile kuruş yuvarlanır.' },
    { t: 'mc', q: '<code>def f(a, b=5): return a * b</code> tanımı varken <code>f(2, b=3)</code> çağrısı ne döndürür?',
      o: ['10', '6', 'Hata verir', 'None'], a: 1,
      why: 'Konumsal 2 a\'ya, anahtar sözcüklü b=3 varsayılanı ezer; 2 * 3 = 6. Konumsal ve anahtar sözcüklü argümanlar birlikte kullanılabilir.' },
    { t: 'code', id: 'fonksiyonlar-3',
      q: '<p><code>siparis_ozeti(sepet)</code> fonksiyonunu yaz. <code>sepet</code>, <code>(urun, adet, birim_fiyat)</code> demetlerinden oluşan bir listedir. Fonksiyon üç değer döndürsün: toplam adet, ara toplam ve KDV dahil (%20) genel toplam. Para değerlerini 2 ondalığa yuvarla.</p>',
      start: 'def siparis_ozeti(sepet):\n    # toplam_adet, ara_toplam, genel_toplam döndür\n    pass\n',
      sol: 'def siparis_ozeti(sepet):\n    toplam_adet = 0\n    ara_toplam = 0\n    for urun, adet, fiyat in sepet:\n        toplam_adet += adet\n        ara_toplam += adet * fiyat\n    ara_toplam = round(ara_toplam, 2)\n    genel = round(ara_toplam * 1.20, 2)\n    return toplam_adet, ara_toplam, genel\n',
      tests: 'sepet = [("Kahve Makinesi", 1, 1500), ("Filtre", 3, 45.5), ("Fincan", 6, 30)]\nr = siparis_ozeti(sepet)\nassert isinstance(r, tuple) and len(r) == 3, "üç değerli bir demet döndürmeli"\nadet, ara, genel = r\nassert adet == 10, "toplam adet 10 olmalı"\nassert abs(ara - 1816.5) < 1e-6, "ara toplam 1816.5 olmalı"\nassert abs(genel - 2179.8) < 1e-6, "genel toplam 2179.8 olmalı"\nassert siparis_ozeti([]) == (0, 0, 0), "boş sepet (0, 0, 0) vermeli"\n',
      hints: ['for urun, adet, fiyat in sepet: ile demetleri aç.', 'return a, b, c yazımı bir demet döndürür.', 'Genel toplam = ara_toplam * 1.20.'],
      why: 'Döngüde adet ve tutar birikir; return virgülle üç değeri tek demet olarak gönderir, çağıran yer bunu üç değişkene açar.' },
    { t: 'code', id: 'fonksiyonlar-4',
      q: '<p><code>kampanya_toplami(*fiyatlar, **ayarlar)</code> fonksiyonunu yaz. Verilen tüm fiyatları toplasın. <code>ayarlar</code> içinde <code>indirim</code> anahtarı varsa toplamdan o yüzde kadar düşsün; <code>kargo</code> anahtarı varsa o tutarı eklesin. Sonucu 2 ondalığa yuvarlayıp döndürsün.</p>',
      start: 'def kampanya_toplami(*fiyatlar, **ayarlar):\n    # buraya yaz\n    pass\n',
      sol: 'def kampanya_toplami(*fiyatlar, **ayarlar):\n    toplam = sum(fiyatlar)\n    if "indirim" in ayarlar:\n        toplam *= 1 - ayarlar["indirim"] / 100\n    if "kargo" in ayarlar:\n        toplam += ayarlar["kargo"]\n    return round(toplam, 2)\n',
      tests: 'assert kampanya_toplami() == 0, "argümansız çağrı 0 vermeli"\nassert kampanya_toplami(100, 200, 50) == 350.0, "üç fiyat 350.0 vermeli"\nassert kampanya_toplami(100, 200, indirim=10) == 270.0, "%10 indirimle 270.0"\nassert kampanya_toplami(100, kargo=29.9) == 129.9, "kargo eklenince 129.9"\nassert kampanya_toplami(200, 200, indirim=25, kargo=20) == 320.0, "indirim ve kargo birlikte 320.0"\n',
      hints: ['sum(fiyatlar) demetin toplamını verir.', '"indirim" in ayarlar ile anahtarın varlığını kontrol et.'],
      why: '*fiyatlar tüm konumsal argümanları demette, **ayarlar anahtar sözcüklüleri sözlükte toplar; sözlükte anahtar var mı diye bakıp hesaba katılır.' },
    { t: 'mc', q: '<code>def ekle(x, liste=[]): liste.append(x); return liste</code> tanımından sonra <code>ekle(1)</code> ve ardından <code>ekle(2)</code> çağrılırsa ikinci çağrı ne döndürür?',
      o: ['[2]', '[1, 2]', '[1]', 'Hata verir'], a: 1,
      why: 'Varsayılan liste fonksiyon tanımlanırken bir kez oluşturulur ve tüm çağrılar onu paylaşır. İlk çağrı 1 ekler, ikinci çağrı aynı listeye 2 ekler. Çözüm: liste=None yazıp gövdede oluşturmak.' },
    { t: 'code', id: 'fonksiyonlar-5',
      q: '<p>Aşağıdaki <code>musteri_ekle(ad, liste=[])</code> fonksiyonu değişebilir varsayılan tuzağına düşüyor: her çağrı aynı listeyi paylaşıyor. Fonksiyonu düzelt: liste verilmezse her çağrıda <b>yeni</b> bir liste oluşturulsun, ad eklenip liste döndürülsün. Fonksiyon adı ve davranışı aynı kalsın.</p>',
      start: 'def musteri_ekle(ad, liste=[]):\n    liste.append(ad)\n    return liste\n',
      sol: 'def musteri_ekle(ad, liste=None):\n    if liste is None:\n        liste = []\n    liste.append(ad)\n    return liste\n',
      tests: 'a = musteri_ekle("Ayşe")\nb = musteri_ekle("Mehmet")\nassert a == ["Ayşe"], "ilk çağrı [\'Ayşe\'] vermeli"\nassert b == ["Mehmet"], "ikinci çağrı yeni liste [\'Mehmet\'] vermeli, paylaşılan liste olmamalı"\nassert a is not b, "her çağrı ayrı liste döndürmeli"\nmevcut = ["Zeynep"]\nassert musteri_ekle("Can", mevcut) == ["Zeynep", "Can"], "verilen listeye eklemeli"\nassert mevcut == ["Zeynep", "Can"], "verilen liste yerinde güncellenmeli"\n',
      hints: ['Varsayılanı None yap.', 'Gövdede if liste is None: liste = [] yaz.'],
      why: 'None değişmezdir ve paylaşım sorunu yaratmaz; gövdede her çağrı için taze liste oluşturulur. Dışarıdan liste verilirse o liste kullanılır.' }
  ],
  faq: [
    { q: 'Parametre ile argüman arasındaki fark tam olarak ne?', a: 'Parametre, fonksiyon tanımındaki isimdir (def f(fiyat)). Argüman, çağrıda o isme gönderilen değerdir (f(100)). Günlük konuşmada ikisi karışır ama hata mesajlarında ayrımı bilmek işe yarar.' },
    { q: 'Bir fonksiyon hem değer döndürüp hem ekrana yazabilir mi?', a: 'Evet ama genelde kötü fikirdir. Hesaplayan fonksiyon saf kalsın (yalnızca return), yazdırma işini çağıran kod yapsın. Böylece aynı fonksiyonu raporda, testte ve başka hesaplarda kullanabilirsin.' },
    { q: 'args ve kwargs adlarını değiştirebilir miyim?', a: 'Evet; önemli olan yıldızlar. def f(*fiyatlar, **secenekler) tamamen geçerlidir ve çoğu zaman daha okunurdur. args/kwargs yalnızca yaygın bir gelenektir.' },
    { q: 'return a, b yazınca gerçekten iki değer mi dönüyor?', a: 'Hayır, tek bir demet (tuple) döner. x, y = f() yazımı o demeti iki değişkene açar. Bu yüzden sonucu tek değişkene de alabilirsin: r = f(); r[0].' }
  ],
  mistakes: [
    { bad: 'def kdv(fiyat):\n    sonuc = fiyat * 1.2\nprint(kdv(100))', good: 'def kdv(fiyat):\n    return fiyat * 1.2\nprint(kdv(100))', why: 'return yazılmayan fonksiyon None döndürür; hesap yapılır ama dışarı çıkmaz.' },
    { bad: 'def f(oran=0.2, fiyat):\n    return fiyat * oran', good: 'def f(fiyat, oran=0.2):\n    return fiyat * oran', why: 'Varsayılan değerli parametreler sona konur; aksi hâlde SyntaxError.' },
    { bad: 'def ekle(x, liste=[]):\n    liste.append(x)\n    return liste', good: 'def ekle(x, liste=None):\n    if liste is None:\n        liste = []\n    liste.append(x)\n    return liste', why: 'Değişebilir varsayılan tüm çağrılar arasında paylaşılır; None ile her çağrıda yeni liste oluşur.' },
    { bad: 'indirim_uygula(uye=True, 1000)', good: 'indirim_uygula(1000, uye=True)', why: 'Anahtar sözcüklü argümandan sonra konumsal argüman gelemez.' }
  ]
},
/* ───────────────────────── 2. kapsam-moduller ───────────────────────── */
{
  id: 'kapsam-moduller',
  lv: 'temel',
  mod: 'Fonksiyonlar ve Modüller',
  min: 28,
  title: 'Kapsam ve modüller',
  sum: 'Bir adın nerede geçerli olduğunu (LEGB) öğrenir, global tuzağından kaçınır, import biçimlerini ve __name__ kalıbını kavrar, math/random/statistics ile standart kütüphaneye ilk adımı atarsın.',
  goals: [
    'Yerel ve global kapsamı ayırt edip LEGB arama sırasını açıklayabilirim.',
    'global anahtar sözcüğünün ne zaman gerekip ne zaman tuzak olduğunu söyleyebilirim.',
    'import, from ... import ve as biçimlerini yerinde kullanabilirim.',
    'if __name__ == "__main__" kalıbının ne işe yaradığını anlatabilirim.',
    'math, random ve statistics modülleriyle hesap yapabilir, random için seed kullanabilirim.'
  ],
  body: `
<h2>Bir isim nerede görünür?</h2>
<p>Ilgaz Bank'ta günlük işlem raporu üreten bir betik yazdın. Fonksiyonun içinde <code>toplam</code> adında bir değişken var, dışarıda da başka bir <code>toplam</code>. Hangisi hangisi? Python bunu <b>kapsam</b> (scope) kurallarıyla çözer: her ad belirli bir bölgede geçerlidir. Fonksiyon içinde atanan ad o fonksiyona aittir, dışarıdan görünmez; fonksiyon bittiğinde silinir.</p>
<pre class="py">komisyon_orani = 0.002          # global (modül düzeyi)

def komisyon(tutar):
    kesinti = tutar * komisyon_orani   # global okunur
    return round(kesinti, 2)

print(komisyon(15000))
print(komisyon_orani)
try:
    print(kesinti)               # yerel ad dışarıdan görünmez
except NameError as e:
    print("Hata:", e)</pre>
<p><code>kesinti</code> fonksiyonun <b>yerel</b> (local) değişkenidir; dışarıda yoktur. <code>komisyon_orani</code> ise <b>global</b>: modülün en üst düzeyinde tanımlandı, her fonksiyon onu okuyabilir.</p>

<h2>LEGB sırası</h2>
<p>Python bir adı gördüğünde dört katmanı sırayla arar: <b>L</b>ocal (içinde bulunulan fonksiyon), <b>E</b>nclosing (iç içe fonksiyonlarda dıştaki fonksiyon), <b>G</b>lobal (modül), <b>B</b>uilt-in (print, len gibi yerleşikler). İlk bulduğunda durur.</p>
<div class="tbl-wrap"><table>
<tr><th>Katman</th><th>Nerede tanımlanır</th><th>Örnek</th></tr>
<tr><td>Local</td><td>Fonksiyon gövdesinde atanan adlar ve parametreler</td><td><code>kesinti</code>, <code>tutar</code></td></tr>
<tr><td>Enclosing</td><td>İç fonksiyonu saran dış fonksiyonun yerelleri</td><td>iç fonksiyonun gördüğü <code>oran</code></td></tr>
<tr><td>Global</td><td>Dosyanın en üst düzeyi</td><td><code>komisyon_orani</code></td></tr>
<tr><td>Built-in</td><td>Python'ın kendisi</td><td><code>print</code>, <code>len</code>, <code>sum</code></td></tr>
</table></div>
<pre class="py">def rapor_hazirla(hesaplar):
    baslik = "Ilgaz Bank Günlük Özet"     # enclosing

    def satir(ad, bakiye):
        return baslik[:12] + " | " + ad + ": " + str(bakiye)   # baslik dıştan okunur

    for ad, bakiye in hesaplar:
        print(satir(ad, bakiye))

rapor_hazirla([("Ayşe", 12500), ("Mehmet", 830)])
print(len("deneme"))      # built-in katmanı</pre>
<div class="warn"><b>Yerleşik adı ezme</b><code>sum = 0</code> ya da <code>list = [1, 2]</code> yazarsan built-in <code>sum</code>/<code>list</code> gölgelenir ve sonraki satırlarda <code>sum(fiyatlar)</code> "int object is not callable" hatası verir. Değişken adlarını yerleşiklerden seçme: <code>toplam</code>, <code>liste</code> de.</div>

<h2>global tuzağı</h2>
<p>Globali okumak serbesttir. Ama fonksiyon içinde ona <b>atama</b> yaparsan Python yeni bir yerel oluşturur; global değişmez. Hem okuyup hem değiştirmeye kalkarsan <code>UnboundLocalError</code> alırsın.</p>
<pre class="py">sayac = 0

def islem_kaydet_yanlis():
    sayac_yerel = sayac + 1      # okumak sorun değil
    return sayac_yerel

def islem_kaydet_global():
    global sayac
    sayac += 1

islem_kaydet_global()
islem_kaydet_global()
print("global sayaç:", sayac)

def islem_kaydet_temiz(sayac):
    return sayac + 1             # saf: değer al, yeni değer döndür

yeni = islem_kaydet_temiz(sayac)
print("temiz yol:", yeni)</pre>
<p><code>global sayac</code> satırı "bu fonksiyonda sayac derken modüldekini kastediyorum" der. Çalışır, ama bir programda on tane fonksiyon aynı globali değiştiriyorsa hangi değeri kimin bozduğunu bulmak kabusa döner. Kural: <b>değeri parametre olarak al, yenisini return et</b>. <code>global</code> yalnızca küçük betiklerde ve bilinçli kullanılan bir istisnadır.</p>
<div class="note"><b>nonlocal</b>İç içe fonksiyonlarda dıştaki fonksiyonun değişkenini değiştirmek için <code>nonlocal</code> kullanılır. Nadir gerekir; dekoratör ve kapanış (closure) konularında karşına çıkacak.</div>

<h2>Modül nedir, nasıl içe aktarılır?</h2>
<p>Bir <code>.py</code> dosyası aynı zamanda bir <b>modüldür</b> (module). <code>fiyat.py</code> içine <code>kdv_hesapla</code> yazdıysan başka dosyadan <code>import fiyat</code> deyip <code>fiyat.kdv_hesapla(100)</code> diye çağırırsın. Python'la gelen yüzlerce modüle <b>standart kütüphane</b> (standard library) denir; hiçbir şey kurmadan kullanılır. Dört import biçimi var:</p>
<pre class="py">import math                      # 1) modülü tümüyle al, math. öneki ile kullan
print(math.ceil(1234.1))

from math import sqrt, floor     # 2) yalnızca istenen adları al
print(sqrt(144), floor(7.9))

import statistics as st          # 3) kısa takma ad (alias)
print(st.mean([120, 85, 230]))

from random import randint as rastgele_tam   # 4) ada takma ad
print(type(rastgele_tam(1, 6)))</pre>
<p>Kurumsal kodda en yaygın olanlar 1 ve 3: <code>math.sqrt</code> yazımı, <code>sqrt</code>'nin nereden geldiğini okuyana söyler. <code>from x import *</code> ise bütün adları dosyaya boca eder; hangi ad nereden geldi belli olmaz, kaçın.</p>

<h2>if __name__ == "__main__"</h2>
<p>Her modülün <code>__name__</code> adlı bir değişkeni vardır. Dosya doğrudan çalıştırılıyorsa değeri <code>"__main__"</code>, başka bir dosya tarafından <code>import</code> edildiyse dosyanın adıdır. Bu sayede aynı dosya hem kütüphane hem de çalıştırılabilir betik olabilir: fonksiyonlar her zaman tanımlanır, ama "demo" ya da "ana akış" kodu yalnızca doğrudan çalıştırıldığında koşar.</p>
<pre class="py">def faiz_hesapla(anapara, yillik_oran, ay):
    """Basit faiz: anapara * oran * (ay / 12)"""
    return round(anapara * yillik_oran * ay / 12, 2)

def main():
    print("Ilgaz Bank mevduat hesabı")
    print("6 ay, 50.000 TL, %40:", faiz_hesapla(50000, 0.40, 6))

print("__name__ değeri:", __name__)
if __name__ == "__main__":
    main()</pre>
<p>Bu dosyayı başka bir yerden <code>import faiz</code> dersen yalnızca <code>faiz_hesapla</code> ve <code>main</code> tanımlanır; demo satırları basılmaz. Yazdığın her betiğe bu kalıbı koymak, ileride test yazarken ve kodu başkasıyla paylaşırken hayat kurtarır.</p>

<h2>Standart kütüphaneye giriş: math, random, statistics</h2>
<pre class="py">import math, random, statistics

# math: matematik
print(math.ceil(2.1), math.floor(2.9), round(2.5), round(3.5))
print(math.sqrt(2), math.pi)

# statistics: temel istatistik
bakiyeler = [1200, 4500, 980, 4500, 13000]
print("ortalama:", statistics.mean(bakiyeler))
print("medyan:", statistics.median(bakiyeler))
print("mod:", statistics.mode(bakiyeler))

# random: rastgelelik, seed ile tekrarlanabilir
random.seed(42)
print(random.randint(1, 100))
print(random.choice(["İstanbul", "Ankara", "İzmir"]))
print(random.sample(range(1000, 2000), 3))</pre>
<p><code>random.seed(42)</code> rastgele sayı üretecini sabit bir başlangıca getirir; aynı seed, aynı dizi. Test yazarken ve sahte veri üretirken bu şart: aksi hâlde testin her koşuda farklı veri görür. <code>round</code>'un 2.5'i 2'ye, 3.5'i 4'e yuvarladığına dikkat et; bu "bankacı yuvarlaması"dır (round half to even), <code>math.floor</code> ve <code>math.ceil</code> ise her zaman aşağı/yukarı gider.</p>
<div class="tip"><b>os ve sys kısaca</b><code>os.getcwd()</code> çalışma klasörünü, <code>os.listdir()</code> dosyaları, <code>sys.argv</code> komut satırı argümanlarını, <code>sys.version</code> Python sürümünü verir. Dosya işlemleri dersinde <code>os</code> ve <code>pathlib</code>'e döneceğiz. Tarayıcı ortamında dosya sistemi bellek içidir, o yüzden burada <code>os.listdir</code> çıktısı bilgisayarındakinden farklı görünür.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Modül bir kez yüklenir</h3>
<p>Aynı modülü on dosyada import etsen de Python onu bir kez çalıştırır ve <code>sys.modules</code> sözlüğünde saklar; sonraki importlar oradan döner. Bu yüzden modülün en üst düzeyine yazdığın kod (örneğin bir veritabanı bağlantısı) yalnızca ilk importta koşar. Modülün üst düzeyinde "iş" yapma; fonksiyon tanımla, işi <code>main()</code> içinde yap.</p>
<h3>Paketler ve kendi modüllerin</h3>
<p>Klasörün içine <code>__init__.py</code> koyarsan o klasör bir <b>paket</b> (package) olur: <code>from anadolu.fiyat import kdv_hesapla</code>. Python modülü bulmak için <code>sys.path</code> listesindeki klasörlere sırayla bakar; ilk sırada çalıştırılan dosyanın klasörü vardır. "ModuleNotFoundError" aldığında ilk kontrol edeceğin şey bu listedir. Git ve proje yapısı dersinde paket düzenine ayrıntılı gireceğiz.</p>
<h3>Kapsam neden önemli?</h3>
<p>Globale bağımlı fonksiyon, dışarıdaki durumu bilmeden test edilemez. Bir üretim sisteminde "fonksiyon dün çalışıyordu, bugün bozuldu" hatalarının büyük kısmı bir yerde değiştirilen global bir değerden çıkar. Fonksiyona ihtiyacı olan her şeyi parametre olarak vermek (dependency injection fikrinin en sade hâli) kodu hem test edilebilir hem taşınabilir yapar.</p>
</section>
`,
  ex: [
    { t: 'mc', q: 'Aşağıdaki kod ne yazdırır?<br><code>x = 10</code><br><code>def f():</code><br><code>&nbsp;&nbsp;&nbsp;&nbsp;x = 5</code><br><code>f()</code><br><code>print(x)</code>',
      o: ['5', '10', 'UnboundLocalError', 'None'], a: 1,
      why: 'Fonksiyon içindeki x = 5 yeni bir yerel değişken oluşturur; global x\'e dokunmaz. Globali değiştirmek için global x gerekirdi.' },
    { t: 'code', id: 'kapsam-moduller-1',
      q: '<p>Aşağıdaki kod <code>global</code> kullanarak <code>toplam_islem</code> sayacını artırıyor. Kodu globalsiz, saf bir fonksiyona çevir: <code>islem_ekle(sayac, tutar)</code> fonksiyonu mevcut sayaç değerini ve tutarı alsın, tutar 0\'dan büyükse sayacı 1 artırılmış olarak, değilse aynı değerle döndürsün. Global değişken kullanma.</p>',
      start: 'toplam_islem = 0\n\ndef islem_ekle(tutar):\n    global toplam_islem\n    if tutar > 0:\n        toplam_islem += 1\n\n# islem_ekle(sayac, tutar) olarak yeniden yaz\n',
      sol: 'def islem_ekle(sayac, tutar):\n    if tutar > 0:\n        return sayac + 1\n    return sayac\n',
      tests: 'assert "global " not in __kod__, "global anahtar sözcüğü kullanılmamalı"\nassert islem_ekle(0, 250) == 1, "pozitif tutar sayacı 1 artırmalı"\nassert islem_ekle(5, 0) == 5, "sıfır tutar sayacı değiştirmemeli"\nassert islem_ekle(5, -40) == 5, "negatif tutar sayacı değiştirmemeli"\ns = 0\nfor t in [100, -5, 30, 0, 70]:\n    s = islem_ekle(s, t)\nassert s == 3, "beş işlemden üçü pozitif: sayaç 3 olmalı"\n',
      hints: ['Fonksiyon iki parametre alsın: sayac ve tutar.', 'Değiştirmek yerine yeni değeri return et.'],
      why: 'Saf fonksiyon dış durumu değiştirmez: mevcut değeri parametre olarak alır, yeni değeri döndürür. Çağıran yer sonucu değişkene atar.' },
    { t: 'mc', q: 'Hangi import biçimi, bir modüldeki tüm adları dosyaya kontrolsüzce döktüğü için ekip kodunda kaçınılması gereken biçimdir?',
      o: ['import math', 'from math import sqrt', 'from math import *', 'import statistics as st'], a: 2,
      why: 'Yıldızlı import modüldeki her adı mevcut ad alanına ekler; hangi adın nereden geldiği belirsizleşir ve var olan adlar sessizce ezilebilir. Diğer üç biçim açık ve okunurdur.' },
    { t: 'code', id: 'kapsam-moduller-2',
      q: '<p><code>math</code> modülünü kullanarak <code>kargo_kutusu(adet, kutu_kapasitesi)</code> fonksiyonunu yaz: verilen adet ürünü taşımak için gereken kutu sayısını döndürsün (yukarı yuvarlanmış tam sayı). Ayrıca <code>taksit_tutari(toplam, ay)</code> fonksiyonu toplam tutarı aya bölüp sonucu 2 ondalığa yuvarlasın ve döndürsün.</p>',
      start: 'import math\n\ndef kargo_kutusu(adet, kutu_kapasitesi):\n    pass\n\ndef taksit_tutari(toplam, ay):\n    pass\n',
      sol: 'import math\n\ndef kargo_kutusu(adet, kutu_kapasitesi):\n    return math.ceil(adet / kutu_kapasitesi)\n\ndef taksit_tutari(toplam, ay):\n    return round(toplam / ay, 2)\n',
      tests: 'assert kargo_kutusu(10, 4) == 3, "10 ürün, 4\'lük kutu: 3 kutu"\nassert kargo_kutusu(8, 4) == 2, "8 ürün, 4\'lük kutu: 2 kutu"\nassert kargo_kutusu(1, 12) == 1, "1 ürün: 1 kutu"\nassert isinstance(kargo_kutusu(10, 4), int), "kutu sayısı tam sayı olmalı"\nassert taksit_tutari(1000, 3) == 333.33, "1000 / 3 iki ondalıkla 333.33"\nassert taksit_tutari(2400, 12) == 200.0, "2400 / 12 = 200.0"\n',
      hints: ['math.ceil(x) sayıyı yukarı yuvarlar ve int döndürür.', 'round(toplam / ay, 2) kuruş hassasiyeti verir.'],
      why: 'Kutu sayısında yarım kutu olmaz; math.ceil yukarı yuvarlar. Taksitte ise kuruş için round(…, 2) yeter.' },
    { t: 'code', id: 'kapsam-moduller-3',
      q: '<p><code>statistics</code> modülüyle <code>bakiye_ozeti(bakiyeler)</code> fonksiyonunu yaz. Sayı listesinden üç değerli bir demet döndürsün: ortalama (2 ondalığa yuvarlanmış), medyan ve en yüksek değer.</p>',
      start: 'import statistics\n\ndef bakiye_ozeti(bakiyeler):\n    # (ortalama, medyan, en_yuksek) döndür\n    pass\n',
      sol: 'import statistics\n\ndef bakiye_ozeti(bakiyeler):\n    ort = round(statistics.mean(bakiyeler), 2)\n    med = statistics.median(bakiyeler)\n    return ort, med, max(bakiyeler)\n',
      tests: 'r = bakiye_ozeti([1200, 4500, 980, 4500, 13000])\nassert r == (4836.0, 4500, 13000), "beklenen (4836.0, 4500, 13000), gelen %r" % (r,)\nr2 = bakiye_ozeti([10, 20, 30, 40])\nassert r2[0] == 25.0 and r2[1] == 25.0 and r2[2] == 40, "çift sayıda eleman: medyan ortadaki ikinin ortalaması"\nassert bakiye_ozeti([7]) == (7, 7, 7), "tek elemanlı liste"\n',
      hints: ['statistics.mean ve statistics.median kullan.', 'En yüksek için yerleşik max yeter.'],
      why: 'statistics modülü ortalama ve medyanı hazır verir; demet döndürerek üç değeri tek seferde yollarsın.' },
    { t: 'code', id: 'kapsam-moduller-4',
      q: '<p><code>random</code> modülüyle <code>sahte_siparisler(n, seed)</code> fonksiyonunu yaz. Önce <code>random.seed(seed)</code> çağırsın, sonra n adet sipariş üretip liste olarak döndürsün. Her sipariş bir sözlük: <code>{"sehir": ..., "tutar": ...}</code>. Şehir <code>["İstanbul", "Ankara", "İzmir"]</code> listesinden <code>random.choice</code> ile, tutar <code>random.randint(50, 500)</code> ile seçilsin.</p>',
      start: 'import random\n\nSEHIRLER = ["İstanbul", "Ankara", "İzmir"]\n\ndef sahte_siparisler(n, seed):\n    pass\n',
      sol: 'import random\n\nSEHIRLER = ["İstanbul", "Ankara", "İzmir"]\n\ndef sahte_siparisler(n, seed):\n    random.seed(seed)\n    liste = []\n    for _ in range(n):\n        liste.append({"sehir": random.choice(SEHIRLER), "tutar": random.randint(50, 500)})\n    return liste\n',
      tests: 'a = sahte_siparisler(5, 1)\nassert len(a) == 5, "5 sipariş üretilmeli"\nassert all(set(s.keys()) == {"sehir", "tutar"} for s in a), "her sipariş sehir ve tutar anahtarlarını taşımalı"\nassert all(s["sehir"] in ["İstanbul", "Ankara", "İzmir"] for s in a), "şehir listeden seçilmeli"\nassert all(50 <= s["tutar"] <= 500 for s in a), "tutar 50-500 aralığında olmalı"\nb = sahte_siparisler(5, 1)\nassert a == b, "aynı seed aynı siparişleri üretmeli"\nassert sahte_siparisler(0, 3) == [], "n=0 boş liste vermeli"\n',
      hints: ['Fonksiyonun ilk satırı random.seed(seed) olsun.', 'for _ in range(n): ile n kez sözlük oluşturup listeye ekle.'],
      why: 'seed sabitlenince choice ve randint aynı sırayı üretir; test bu sayede iki çağrının birebir eşit olduğunu doğrulayabilir.' },
    { t: 'mc', q: 'Bir dosyada <code>if __name__ == "__main__":</code> bloğu ne zaman çalışır?',
      o: ['Dosya başka bir modülden import edildiğinde', 'Dosya doğrudan çalıştırıldığında', 'Her zaman', 'Yalnızca main() fonksiyonu tanımlıysa'], a: 1,
      why: 'Doğrudan çalıştırılan dosyanın __name__ değeri "__main__" olur; import edilen dosyada ise modülün adıdır ve blok atlanır. Böylece aynı dosya hem kütüphane hem betik olur.' },
    { t: 'code', id: 'kapsam-moduller-5',
      q: '<p><code>net_maas(brut, kesinti_orani=0.15)</code> fonksiyonu brütten kesinti düşüp sonucu 2 ondalığa yuvarlayarak döndürsün. Ardından <code>main()</code> fonksiyonu tanımla; bu fonksiyon <code>print(net_maas(30000))</code> çalıştırsın. <code>main()</code> çağrısı yalnızca <code>if __name__ == "__main__":</code> bloğunun içinde olsun.</p>',
      start: 'def net_maas(brut, kesinti_orani=0.15):\n    pass\n\ndef main():\n    pass\n\n# __name__ kontrolü ile main() çağır\n',
      sol: 'def net_maas(brut, kesinti_orani=0.15):\n    return round(brut * (1 - kesinti_orani), 2)\n\ndef main():\n    print(net_maas(30000))\n\nif __name__ == "__main__":\n    main()\n',
      tests: 'assert net_maas(30000) == 25500.0, "30000 brüt, %15 kesinti: 25500.0"\nassert net_maas(10000, 0.2) == 8000.0, "10000 brüt, %20 kesinti: 8000.0"\nassert "__name__" in __source__ and "__main__" in __source__, "if __name__ == \\"__main__\\": kalıbı kullanılmalı"\n',
      expect: '25500.0\n',
      hints: ['net = brut * (1 - kesinti_orani).', 'Dosyanın sonuna if __name__ == "__main__": main() yaz.'],
      why: 'Bu ortamda kod doğrudan çalıştığı için __name__ "__main__" olur ve main() koşar; aynı dosya import edilseydi yalnızca fonksiyonlar tanımlanırdı.' }
  ],
  faq: [
    { q: 'Fonksiyon içinden global değişkeni okumak için de global yazmam gerekir mi?', a: 'Hayır. Okumak serbesttir; LEGB sırası globali bulur. global yalnızca fonksiyon içinde o ada yeni bir değer atamak istediğinde gerekir ve o da genelde kötü tasarım işaretidir.' },
    { q: 'import math ile from math import sqrt arasında performans farkı var mı?', a: 'Pratikte yok; modül her iki durumda da bir kez yüklenir. Fark okunurluktur: math.sqrt yazımı adın nereden geldiğini gösterir, bu yüzden ekip kodunda tercih edilir.' },
    { q: 'random.seed olmadan testler neden bozulur?', a: 'Seed verilmezse üreteç sistem saatinden başlar ve her koşuda farklı sayı üretir. Test "beklenen değer" ile karşılaştıramaz. Seed sabitlenince dizi tekrarlanabilir olur.' },
    { q: 'Kendi yazdığım .py dosyasını nasıl import ederim?', a: 'Aynı klasöre koy ve dosya adını .py olmadan yaz: fiyat.py için import fiyat. Dosya adı Python kurallarına uymalı (boşluk ve tire yok) ve standart kütüphane modülleriyle çakışmamalı; random.py adlı bir dosya gerçek random modülünü gölgeler.' }
  ],
  mistakes: [
    { bad: 'sayac = 0\ndef art():\n    sayac += 1', good: 'def art(sayac):\n    return sayac + 1', why: 'Fonksiyon içinde atama yapılan ad yerel sayılır; okunmadan artırılamaz ve UnboundLocalError verir. Parametre al, değer döndür.' },
    { bad: 'sum = 0\nfor f in fiyatlar:\n    sum += f\nprint(sum(fiyatlar))', good: 'toplam = 0\nfor f in fiyatlar:\n    toplam += f\nprint(sum(fiyatlar))', why: 'sum adını değişkene verince yerleşik sum fonksiyonu gölgelenir ve çağrı "int object is not callable" hatası verir.' },
    { bad: 'import math\nprint(sqrt(16))', good: 'import math\nprint(math.sqrt(16))', why: 'import math yalnızca math adını getirir; sqrt\'ye math. öneki ile ulaşılır ya da from math import sqrt yazılır.' },
    { bad: 'main()', good: 'if __name__ == "__main__":\n    main()', why: 'Koşulsuz çağrı, dosya import edildiğinde de main()\'i çalıştırır; kalıp bunu yalnızca doğrudan çalıştırmaya sınırlar.' }
  ]
},
/* ───────────────────────── 3. string-bicimleme ───────────────────────── */
{
  id: 'string-bicimleme',
  lv: 'temel',
  mod: 'Fonksiyonlar ve Modüller',
  min: 28,
  title: 'Metin biçimlendirme ve rapor üretme',
  sum: 'f-string ile hizalama, genişlik, binlik ayırıcı, yüzde ve ondalık biçimlerini öğrenir; format(), çok satırlı metin ve ljust/rjust ile Ilgaz Bank hesap özeti gibi düzgün tablolu raporlar üretirsin.',
  goals: [
    'f-string içinde hizalama (<, >, ^), genişlik ve dolgu karakteri kullanabilirim.',
    'Sayıları binlik ayırıcı, sabit ondalık ve yüzde olarak biçimlendirebilirim.',
    'format() fonksiyonu ve str.format yöntemini f-string ile karşılaştırabilirim.',
    'Çok satırlı metin ve döngüyle sütunları hizalı bir tablo yazdırabilirim.',
    'Türkçe karakter içeren metinlerde ljust/rjust ve len davranışını açıklayabilirim.'
  ],
  body: `
<h2>Neden biçimlendirme?</h2>
<p>Ilgaz Bank'ın müşteri hizmetleri ekibi her sabah bir hesap özeti görmek istiyor: hesap adı, bakiye, son işlem. <code>print(ad, bakiye)</code> ile çıkan "Ayşe 12500.5" satırı doğru ama okunmaz; bakiyeler alt alta hizalanmıyor, binlikler ayrılmıyor, kuruşlar bazen bir bazen iki hane. Raporun işe yaraması için metni <b>biçimlendirmen</b> (formatting) gerekir. Python'da bunun ana aracı f-string; bu derste süslü parantezin içindeki iki noktadan sonrasını, yani <b>biçim belirtecini</b> (format spec) öğreneceksin.</p>

<h2>f-string hatırlatma ve biçim belirteci</h2>
<p><code>f"..."</code> içinde <code>{ifade}</code> yazarsın; Python ifadeyi hesaplayıp metne gömer. İki nokta ile belirteç eklersin: <code>{deger:belirtec}</code>. Belirtecin genel sırası şöyledir: <b>dolgu</b> + <b>hizalama</b> + <b>genişlik</b> + <b>binlik</b> + <b>.ondalık</b> + <b>tür</b>. Her parça isteğe bağlıdır.</p>
<pre class="py">bakiye = 12500.5
print(f"[{bakiye}]")           # ham
print(f"[{bakiye:.2f}]")       # 2 ondalık
print(f"[{bakiye:,.2f}]")      # binlik ayırıcı + 2 ondalık
print(f"[{bakiye:12,.2f}]")    # 12 karakter genişlik, sağa hizalı (sayı varsayılanı)
print(f"[{bakiye:&lt;12,.2f}]")   # sola hizalı
print(f"[{bakiye:^12,.2f}]")   # ortalı
print(f"[{bakiye:*&gt;12,.2f}]")  # yıldızla doldur, sağa hizala</pre>
<p>Sayılar varsayılan olarak <b>sağa</b>, metinler <b>sola</b> hizalanır. Bu raporlarda tam istediğin şeydir: sütun başlığı solda, tutarlar sağda alt alta.</p>
<div class="tbl-wrap"><table>
<tr><th>Belirteç</th><th>Anlamı</th><th>Örnek</th><th>Sonuç</th></tr>
<tr><td><code>:.2f</code></td><td>Sabit 2 ondalık</td><td><code>f"{3.14159:.2f}"</code></td><td>3.14</td></tr>
<tr><td><code>:,</code></td><td>Binlik ayırıcı (virgül)</td><td><code>f"{1234567:,}"</code></td><td>1,234,567</td></tr>
<tr><td><code>:_</code></td><td>Binlik ayırıcı (alt çizgi)</td><td><code>f"{1234567:_}"</code></td><td>1_234_567</td></tr>
<tr><td><code>:.1%</code></td><td>Yüzde, 1 ondalık (100 ile çarpar)</td><td><code>f"{0.1575:.1%}"</code></td><td>15.8%</td></tr>
<tr><td><code>:10</code></td><td>En az 10 karakter genişlik</td><td><code>f"{'ad':10}"</code></td><td>ad ve 8 boşluk</td></tr>
<tr><td><code>:&gt;10</code> / <code>:&lt;10</code> / <code>:^10</code></td><td>Sağa / sola / ortaya hizala</td><td><code>f"{'ad':^6}"</code></td><td>"  ad  "</td></tr>
<tr><td><code>:05d</code></td><td>Tam sayı, sıfırla 5 haneye doldur</td><td><code>f"{42:05d}"</code></td><td>00042</td></tr>
<tr><td><code>:+.1f</code></td><td>İşareti her zaman göster</td><td><code>f"{250.0:+.1f}"</code></td><td>+250.0</td></tr>
<tr><td><code>:e</code></td><td>Bilimsel gösterim</td><td><code>f"{1500000:.2e}"</code></td><td>1.50e+06</td></tr>
</table></div>
<pre class="py">oran = 0.1575
siparis_no = 42
fark = -1250.75
print(f"Faiz oranı: {oran:.2%}")
print(f"Sipariş no: {siparis_no:06d}")
print(f"Değişim: {fark:+,.2f} TL")
print(f"Başlık: {'Özet':-^30}")
print(f"{'Hesap':&lt;12}{'Bakiye':&gt;14}")
print(f"{'Ayşe':&lt;12}{12500.5:&gt;14,.2f}")
print(f"{'Mehmet Can':&lt;12}{830:&gt;14,.2f}")</pre>
<div class="tip"><b>Hata ayıklama kısayolu</b><code>f"{bakiye=}"</code> yazımı hem adı hem değeri basar: <code>bakiye=12500.5</code>. Değişken takibi için print'e en hızlı yol.</div>
<div class="note"><b>Türkçe binlik ve ondalık</b>Python'ın <code>,</code> ayırıcısı İngiliz biçimidir (1,234.50). Türkçe "1.234,50" için en pratik yol biçimlendirip karakterleri takas etmektir: <code>f"{x:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")</code>. <code>locale</code> modülü de var ama sistem ayarına bağlıdır, tarayıcıda ve sunucuda farklı davranabilir.</div>

<h2>format() ve str.format</h2>
<p>f-string Python 3.6'da geldi; eski kodda ve bazı özel durumlarda iki akraba görürsün. <code>format(deger, belirtec)</code> fonksiyonu tek bir değeri biçimlendirir; belirteci bir değişkende tutabildiğin için "kullanıcı hangi ondalık sayısını istediyse" gibi dinamik senaryolarda işe yarar. <code>"...{}...".format(x)</code> yöntemi ise şablonu önceden hazırlayıp sonra doldurmak için kullanılır, örneğin bir ayar dosyasından okunan mesaj kalıbında.</p>
<pre class="py">x = 1234.5678
print(format(x, ",.2f"))
print(format(x, "&gt;15.1f"))

ondalik = 3
print(f"{x:.{ondalik}f}")          # f-string içinde iç içe belirteç

sablon = "Sayın {ad}, {tarih} itibarıyla bakiyeniz {bakiye:,.2f} TL'dir."
print(sablon.format(ad="Ayşe Yılmaz", tarih="28.10.2026", bakiye=12500.5))
print("{0} - {1} - {0}".format("A", "B"))</pre>
<p>Günlük kodda tercih sırası: önce f-string, şablon dışarıdan geliyorsa <code>str.format</code>, tek değer ve dinamik belirteç için <code>format()</code>. <code>%</code> işaretli eski biçimlendirmeyi (<code>"%s" % ad</code>) yalnızca eski kodda görürsün; yeni kodda kullanma.</p>

<h2>Çok satırlı metin</h2>
<p>Üç tırnak, satır sonlarını koruyan metin oluşturur ve f-string ile birleşebilir. Bir hesap özetinin başlığı için biçilmiş kaftan:</p>
<pre class="py">musteri = "Ayşe Yılmaz"
hesap_no = "TR33 0006 1005 1978 6457 8413 26"
bakiye = 12500.5
baslik = f"""{'ILGAZ BANK':^40}
{'Hesap Özeti':^40}
{'=' * 40}
Müşteri : {musteri}
IBAN    : {hesap_no}
Bakiye  : {bakiye:,.2f} TL
{'=' * 40}"""
print(baslik)</pre>
<p>Girintili bir fonksiyon içinde üç tırnaklı metin yazdığında satır başlarındaki boşluklar da metne girer; o durumda <code>textwrap.dedent</code> yardımcı olur. Tek satırlık uzun metinleri bölmek içinse yan yana yazılan tırnaklı parçalar otomatik birleşir: <code>("a" "b")</code> → <code>"ab"</code>.</p>

<h2>Basit tablo yazdırma</h2>
<p>Gerçek iş: hesap listesinden hizalı bir tablo üret. Kalıp hep aynıdır: başlık satırı, ayraç çizgisi, döngüde her satır aynı genişliklerle, en altta toplam. Genişlikleri bir yerde sabit tutarsan başlık ve satırlar asla kaymaz.</p>
<pre class="py">hesaplar = [
    ("Ayşe Yılmaz", "Vadesiz", 12500.5, 3),
    ("Mehmet Can", "Vadeli", 830, 0),
    ("Şirin Öztürk", "Vadesiz", 148200.75, 12),
    ("İlker Ağaoğlu", "Kredi", -5400, 1),
]
G_AD, G_TUR, G_BAK, G_ISL = 16, 9, 14, 6
print(f"{'Müşteri':&lt;{G_AD}}{'Tür':&lt;{G_TUR}}{'Bakiye (TL)':&gt;{G_BAK}}{'İşlem':&gt;{G_ISL}}")
print("-" * (G_AD + G_TUR + G_BAK + G_ISL))
toplam = 0
for ad, tur, bakiye, islem in hesaplar:
    print(f"{ad:&lt;{G_AD}}{tur:&lt;{G_TUR}}{bakiye:&gt;{G_BAK},.2f}{islem:&gt;{G_ISL}}")
    toplam += bakiye
print("-" * (G_AD + G_TUR + G_BAK + G_ISL))
print(f"{'TOPLAM':&lt;{G_AD + G_TUR}}{toplam:&gt;{G_BAK},.2f}")</pre>
<p>Genişlikleri de süslü parantezle gömebildiğine dikkat et: <code>{ad:&lt;{G_AD}}</code>. Sütun genişliğini verinin en uzun elemanından hesaplamak istersen <code>max(len(h[0]) for h in hesaplar) + 2</code> yeter.</p>

<h2>Türkçe karakter ve ljust/rjust</h2>
<p><code>str.ljust(n)</code>, <code>str.rjust(n)</code> ve <code>str.center(n)</code> f-string hizalamasının yöntem hâlidir; ikinci argümanla dolgu karakteri alırlar. Bir listeyi sütun sütun yazdırırken f-string kadar sık kullanılır.</p>
<pre class="py">print("Şube".ljust(10, ".") + "|")
print("İzmir".rjust(10) + "|")
print("Çağrı".center(11, "*") + "|")
print(len("İzmir"), len("Izmir"))
print(len("Şirin Öztürk"), len("Sirin Ozturk"))
for sehir in ["İstanbul", "Çorum", "Iğdır", "Muş"]:
    print(sehir.ljust(10) + "|" + str(len(sehir)).rjust(3))</pre>
<p>Python 3 metinleri Unicode olarak tutar; <code>len("İzmir")</code> 5'tir, hizalama Türkçe harflerle de doğru çalışır. İki yerde dikkat: <b>büyük-küçük dönüşümünde</b> <code>"ı".upper()</code> "I", ama <code>"I".lower()</code> "i" verir (Türkçe noktasız ı Unicode'un genel kuralında yoktur), bu yüzden şehir adlarını karşılaştırırken <code>casefold</code> yerine sabit bir sözlükten yararlanmak daha güvenlidir. Ve <b>terminal fontu</b> bazı karakterleri farklı genişlikte çizebilir; hizalama karakter sayısına göredir, piksele göre değil.</p>
<div class="warn"><b>Para ile float</b>Raporda <code>:.2f</code> kuruşu düzgün gösterir ama arka planda 0.1 + 0.2 hâlâ 0.30000000000000004'tür. Gösterim için f-string, hesap için (özellikle bankacılıkta) <code>decimal.Decimal</code> kullanılır. Orta seviyede ayrıntısına gireceğiz; şimdilik biçimlendirmenin hesabı değil görünümü düzelttiğini unutma.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>__format__ ve özel biçimler</h3>
<p>Belirteçler yalnızca sayı ve metin için değildir. <code>datetime</code> nesneleri kendi belirteçlerini tanır: <code>f"{tarih:%d.%m.%Y}"</code>. Kendi sınıfını yazdığında <code>__format__</code> yöntemini tanımlayarak <code>f"{hesap:kisa}"</code> gibi özel biçimler kurabilirsin. Bu, raporlama kütüphanelerinin arkasındaki mekanizmadır.</p>
<h3>Gerçek raporlarda ne kullanılır?</h3>
<p>Düz metin tablo, log dosyaları ve terminal araçları için hâlâ standarttır. E-posta ve web raporlarında aynı veriyi HTML tablosuna, Excel'e ya da PDF'e dökersin; pandas'ın <code>to_string</code>, <code>to_markdown</code> ve <code>to_excel</code> yöntemleri bu dersteki kalıbın endüstriyel sürümüdür. <code>tabulate</code> ve <code>rich</code> gibi üçüncü parti paketler de renkli, çerçeveli terminal tabloları üretir. Temel mantık değişmez: genişlik, hizalama, ondalık.</p>
<h3>Biçimlendirme ve güvenlik</h3>
<p>Kullanıcıdan gelen metni doğrudan <code>str.format</code> şablonu olarak kullanma: <code>kullanici_metni.format(...)</code> yazımı, kötü niyetli bir şablonun nesne özelliklerine erişmesine kapı açar. Şablon senin, veri kullanıcının olsun; f-string bu açıdan daha güvenlidir çünkü şablon kodun içindedir.</p>
</section>
`,
  ex: [
    { t: 'mc', q: '<code>f"{1234567.891:,.1f}"</code> ifadesi ne üretir?',
      o: ['1,234,567.9', '1234567.9', '1.234.567,9', '1,234,567.891'], a: 0,
      why: 'Virgül binlik ayırıcı ekler, .1f ise bir ondalığa yuvarlar. Python\'ın , ayırıcısı İngiliz biçimidir; Türkçe biçim için ayrıca replace gerekir.' },
    { t: 'code', id: 'string-bicimleme-1',
      q: '<p><code>tutar_yazisi(tutar)</code> fonksiyonunu yaz: sayıyı binlik ayırıcılı, iki ondalıklı ve sonunda <code> TL</code> ekiyle metin olarak döndürsün. Örnek: <code>tutar_yazisi(12500.5)</code> → <code>"12,500.50 TL"</code>.</p>',
      start: 'def tutar_yazisi(tutar):\n    pass\n',
      sol: 'def tutar_yazisi(tutar):\n    return f"{tutar:,.2f} TL"\n',
      tests: 'assert tutar_yazisi(12500.5) == "12,500.50 TL", "12500.5 -> 12,500.50 TL"\nassert tutar_yazisi(830) == "830.00 TL", "830 -> 830.00 TL"\nassert tutar_yazisi(1234567.891) == "1,234,567.89 TL", "1234567.891 -> 1,234,567.89 TL"\nassert tutar_yazisi(-5400) == "-5,400.00 TL", "negatif tutar"\n',
      hints: ['Belirteç: virgül ve .2f birlikte, yani :,.2f', 'f"{tutar:,.2f} TL" döndür.'],
      why: 'Virgül binlik ayırıcı, .2f sabit iki ondalık verir; metnin sonuna boşluk ve TL eklenir.' },
    { t: 'code', id: 'string-bicimleme-2',
      q: '<p><code>yuzde_degisim(eski, yeni)</code> fonksiyonunu yaz: iki değer arasındaki yüzde değişimi ((yeni - eski) / eski) <b>işaretli</b> ve bir ondalıklı yüzde metni olarak döndürsün. Örnek: <code>yuzde_degisim(200, 250)</code> → <code>"+25.0%"</code>, <code>yuzde_degisim(200, 150)</code> → <code>"-25.0%"</code>.</p>',
      start: 'def yuzde_degisim(eski, yeni):\n    pass\n',
      sol: 'def yuzde_degisim(eski, yeni):\n    oran = (yeni - eski) / eski\n    return f"{oran:+.1%}"\n',
      tests: 'assert yuzde_degisim(200, 250) == "+25.0%", "200 -> 250: +25.0%"\nassert yuzde_degisim(200, 150) == "-25.0%", "200 -> 150: -25.0%"\nassert yuzde_degisim(1000, 1000) == "+0.0%", "değişim yoksa +0.0%"\nassert yuzde_degisim(80, 100.4) == "+25.5%", "80 -> 100.4: +25.5%"\n',
      hints: ['Önce oranı hesapla: (yeni - eski) / eski.', 'Belirteç :+.1% hem işareti gösterir hem 100 ile çarpıp % ekler.'],
      why: '% türü oranı 100 ile çarpıp yüzde işareti ekler; + ise pozitif değerlerde de işaret basar.' },
    { t: 'mc', q: '<code>f"{\'Ad\':*^8}"</code> ifadesinin sonucu hangisidir?',
      o: ['Ad******', '******Ad', '***Ad***', 'Hata verir'], a: 2,
      why: 'Belirteçte * dolgu karakteri, ^ ortalama, 8 genişliktir. İki harflik Ad, 8 karakter içinde ortalanır: her iki yana üçer yıldız.' },
    { t: 'code', id: 'string-bicimleme-3',
      q: '<p><code>hesap_satiri(ad, tur, bakiye)</code> fonksiyonunu yaz. Tek satırlık metin döndürsün: ad 16 karakter sola hizalı, tür 9 karakter sola hizalı, bakiye 14 karakter sağa hizalı, binlik ayırıcılı ve iki ondalıklı. Toplam uzunluk 39 karakter olmalı.</p>',
      start: 'def hesap_satiri(ad, tur, bakiye):\n    pass\n',
      sol: 'def hesap_satiri(ad, tur, bakiye):\n    return f"{ad:<16}{tur:<9}{bakiye:>14,.2f}"\n',
      tests: 's = hesap_satiri("Ayşe Yılmaz", "Vadesiz", 12500.5)\nassert len(s) == 39, "satır 39 karakter olmalı, gelen %d" % len(s)\nassert s.startswith("Ayşe Yılmaz     "), "ad 16 karakter sola hizalı olmalı"\nassert s[16:25] == "Vadesiz  ", "tür 9 karakter sola hizalı olmalı"\nassert s[25:] == "     12,500.50", "bakiye 14 karakter sağa hizalı, binlik ve 2 ondalık olmalı"\ns2 = hesap_satiri("Mehmet Can", "Vadeli", 830)\nassert s2 == "Mehmet Can      Vadeli           830.00", "ikinci satır: %r" % s2\n',
      hints: ['Üç süslü parantezi yan yana yaz; aralarına boşluk koyma.', 'Metin için :<16, sayı için :>14,.2f'],
      why: 'Sabit genişlikler sayesinde her satır aynı sütunlarda başlar; başlık satırıyla aynı genişlikler kullanılırsa tablo hizalı çıkar.' },
    { t: 'code', id: 'string-bicimleme-4',
      q: '<p>Aşağıdaki <code>hesaplar</code> listesinden bir tablo yazdır. Önce başlık satırı: <code>Müşteri</code> 14 karakter sola, <code>Bakiye</code> 12 karakter sağa hizalı. Sonra 26 tireden oluşan bir çizgi. Sonra her hesap için ad 14 sola, bakiye 12 sağa (binlik, 2 ondalık). En sonda yine 26 tire ve <code>TOPLAM</code> 14 sola, toplam bakiye 12 sağa.</p>',
      start: 'hesaplar = [("Ayşe", 12500.5), ("Mehmet", 830), ("Şirin", 148200.75)]\n# tabloyu yazdır\n',
      sol: 'hesaplar = [("Ayşe", 12500.5), ("Mehmet", 830), ("Şirin", 148200.75)]\nprint(f"{\'Müşteri\':<14}{\'Bakiye\':>12}")\nprint("-" * 26)\ntoplam = 0\nfor ad, bakiye in hesaplar:\n    print(f"{ad:<14}{bakiye:>12,.2f}")\n    toplam += bakiye\nprint("-" * 26)\nprint(f"{\'TOPLAM\':<14}{toplam:>12,.2f}")\n',
      expect: 'Müşteri             Bakiye\n--------------------------\nAyşe             12,500.50\nMehmet              830.00\nŞirin           148,200.75\n--------------------------\nTOPLAM          161,531.25\n',
      hints: ['Başlık ve satırlar aynı genişlikleri kullanmalı: 14 ve 12.', 'Döngüde toplamı biriktir, çizgiden sonra yazdır.', '"-" * 26 yirmi altı tire üretir.'],
      why: 'Başlık, satırlar ve toplam aynı genişlik belirteçlerini paylaştığı için sütunlar kaymaz; sayılar sağa hizalanınca ondalıklar alt alta gelir.' },
    { t: 'code', id: 'string-bicimleme-5',
      q: '<p><code>ozet_metni(musteri, bakiye, islem_sayisi)</code> fonksiyonunu yaz. Üç satırlık bir metin döndürsün (satırlar <code>\\n</code> ile ayrılsın, sonda satır sonu olmasın):</p><pre class="out">Müşteri : &lt;ad&gt;\nBakiye  : &lt;binlik, 2 ondalık&gt; TL\nİşlem   : &lt;sayı&gt; adet</pre><p>Örnek: <code>ozet_metni("Ayşe", 12500.5, 3)</code> ikinci satırda <code>Bakiye  : 12,500.50 TL</code> içermeli.</p>',
      start: 'def ozet_metni(musteri, bakiye, islem_sayisi):\n    pass\n',
      sol: 'def ozet_metni(musteri, bakiye, islem_sayisi):\n    return f"""Müşteri : {musteri}\nBakiye  : {bakiye:,.2f} TL\nİşlem   : {islem_sayisi} adet"""\n',
      tests: 'm = ozet_metni("Ayşe", 12500.5, 3)\nsatirlar = m.split("\\n")\nassert len(satirlar) == 3, "üç satır olmalı, gelen %d" % len(satirlar)\nassert satirlar[0] == "Müşteri : Ayşe", "ilk satır: %r" % satirlar[0]\nassert satirlar[1] == "Bakiye  : 12,500.50 TL", "ikinci satır: %r" % satirlar[1]\nassert satirlar[2] == "İşlem   : 3 adet", "üçüncü satır: %r" % satirlar[2]\nassert ozet_metni("Mehmet", 830, 0).split("\\n")[1] == "Bakiye  : 830.00 TL", "830 -> 830.00 TL"\n',
      hints: ['Üç tırnaklı f-string ya da "\\n" ile birleştirilmiş tek satırlık f-string kullanabilirsin.', 'Etiketlerdeki boşluklara dikkat: "Müşteri : ", "Bakiye  : ", "İşlem   : "'],
      why: 'Çok satırlı f-string satır sonlarını korur; bakiye için :,.2f belirteci rapor biçimini verir.' },
    { t: 'mc', q: '<code>"İzmir".ljust(8, ".")</code> ifadesinin sonucu nedir?',
      o: ['"...İzmir"', '"İzmir..."', '"İzmir...."', '"Izmir..."'], a: 1,
      why: 'ljust metni sola yaslar ve sağı dolgu karakteriyle 8 karaktere tamamlar; İzmir 5 karakter olduğundan üç nokta eklenir. Python 3 Unicode kullandığı için İ tek karakterdir ve değişmez.' }
  ],
  faq: [
    { q: 'f-string içinde süslü parantezin kendisini nasıl yazarım?', a: 'İki kere yaz: f"{{ve}}" çıktısı {ve} olur. Tek süslü parantez her zaman ifade başlangıcı sayılır.' },
    { q: 'Türkçe biçim (1.234,50) için locale kullanmalı mıyım?', a: 'locale sistem ayarına bağlıdır; tarayıcıda, Windows\'ta ve Linux sunucuda farklı sonuç verebilir. Küçük raporlarda replace ile takas güvenlidir; büyük projelerde Babel gibi paketler kullanılır.' },
    { q: 'Yuvarlama için round mu :.2f mi?', a: ':.2f yalnızca görünümü değiştirir, değer aynı kalır; round değeri değiştirir. Raporda :.2f, sonraki hesapta kullanılacak değerde round tercih edilir. Para hesabında ise decimal.Decimal.' },
    { q: 'Tablo sütun genişliğini nasıl otomatik bulurum?', a: 'Her sütun için en uzun değerin uzunluğunu al: g = max(len(str(x)) for x in sutun) + 2. Sonra f"{deger:<{g}}" ile genişliği gömebilirsin.' }
  ],
  mistakes: [
    { bad: 'print(f"{bakiye:2f}")', good: 'print(f"{bakiye:.2f}")', why: 'Nokta olmadan 2, genişlik sayılır; ondalık sayısı için .2 gerekir.' },
    { bad: 'print(f"Toplam: {toplam}")  # 12500.5', good: 'print(f"Toplam: {toplam:,.2f}")  # 12,500.50', why: 'Ham float kuruşu düzensiz gösterir; raporda sabit ondalık ve binlik ayırıcı kullan.' },
    { bad: 'print(f"{oran}%")  # 0.1575%', good: 'print(f"{oran:.1%}")  # 15.8%', why: 'Oran 0-1 aralığındaysa % belirteci 100 ile çarpıp işareti ekler; elle % eklemek yanlış sayı gösterir.' },
    { bad: 'print("Ad".ljust(10) + "Bakiye".ljust(10))\nprint("Ayşe".ljust(10) + f"{bakiye:.2f}")', good: 'print(f"{\'Ad\':<10}{\'Bakiye\':>12}")\nprint(f"{\'Ayşe\':<10}{bakiye:>12,.2f}")', why: 'Sayı sütunu sağa hizalanmalı ve başlıkla aynı genişliği kullanmalı; aksi hâlde ondalıklar alt alta gelmez.' }
  ]
}
);
})(window);
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push(
/* ───────────────────────── 6. DOSYA İŞLEMLERİ ───────────────────────── */
{
  id: 'dosya-islemleri',
  lv: 'temel',
  mod: 'Dosya ve Hata',
  min: 30,
  title: 'Dosya işlemleri',
  sum: 'Veri programdan uzun yaşar: open ve with, okuma-yazma modları, satır satır okuma, CSV metnini elle ayrıştırma ve pathlib ile modern dosya yolu.',
  goals: [
    'with open(...) kalıbıyla dosyayı güvenle açıp kapatabilirim.',
    'r, w, a modlarının farkını bilir ve doğru modu seçebilirim.',
    'Büyük dosyayı satır satır okuyup her satırı işleyebilirim.',
    'Basit bir CSV metnini split ile ayrıştırıp sayısal alanları dönüştürebilirim.',
    'pathlib.Path ile dosya yolu kurup read_text / write_text kullanabilirim.'
  ],
  body: `
<h2>Neden önemli?</h2>
<p>Program kapanınca değişkenler silinir. Anadolu Market'in sipariş listesi, Ilgaz Bank'ın günlük işlem dökümü ise kalıcı olmalı: diske yazılır, yarın yeniden okunur, başka programlara verilir. İş hayatında verinin büyük bölümü hâlâ düz metin ve CSV dosyalarında dolaşır. Bu derste önce bellekte küçük dosyalar oluşturup okuyacağız; aynı kod bilgisayarındaki gerçek dosyalarda da çalışır.</p>
<div class="note"><b>Tarayıcıdaki dosyalar</b>Bu uygulama tarayıcıda çalıştığı için yazdığın dosyalar bellek içi bir dosya sisteminde oluşur; sayfayı yenileyince silinir. Kendi bilgisayarında aynı kod gerçek dosyalar üretir. Alıştırmalarda önce dosyayı kodla yazıp sonra okuyacağız.</div>

<h2>open ve with: aç, kullan, kesin kapat</h2>
<p><code>open(yol, mod, encoding="utf-8")</code> bir dosya nesnesi döndürür. <code>with</code> bloğu bittiğinde dosya, hata olsa bile <b>otomatik kapanır</b>. Kapanmayan dosya veri kaybına ve "dosya kullanımda" hatalarına yol açar; bu yüzden hep <code>with</code> kullan.</p>
<pre class="py">with open("notlar.txt", "w", encoding="utf-8") as f:
    f.write("Anadolu Market günlük notlar\\n")
    f.write("Kulaklık stoğu kritik\\n")

with open("notlar.txt", "r", encoding="utf-8") as f:
    icerik = f.read()

print(icerik)
print("Karakter sayısı:", len(icerik))</pre>
<div class="tip"><b>encoding="utf-8" yazmayı unutma</b>Türkçe karakterler (ş, ğ, İ) için şart. Windows'ta varsayılan kodlama farklı olabilir ve "ş" yerine bozuk karakterler görürsün. Her open çağrısına ekle.</div>

<h2>Dosya modları</h2>
<div class="tbl-wrap"><table>
<tr><th>Mod</th><th>Adı</th><th>Dosya varsa</th><th>Dosya yoksa</th></tr>
<tr><td><code>"r"</code></td><td>okuma (read)</td><td>baştan okur</td><td>FileNotFoundError</td></tr>
<tr><td><code>"w"</code></td><td>yazma (write)</td><td><b>içeriği siler</b>, baştan yazar</td><td>oluşturur</td></tr>
<tr><td><code>"a"</code></td><td>ekleme (append)</td><td>sonuna ekler</td><td>oluşturur</td></tr>
<tr><td><code>"x"</code></td><td>yeni oluştur</td><td>FileExistsError</td><td>oluşturur</td></tr>
<tr><td><code>"rb"</code> / <code>"wb"</code></td><td>ikili (binary)</td><td colspan="2">resim, PDF gibi metin olmayan dosyalar; encoding verilmez</td></tr>
</table></div>
<div class="warn"><b>"w" acımasızdır</b>Var olan dosyayı "w" ile açtığın anda içeriği silinir, henüz hiçbir şey yazmamış olsan bile. Günlük (log) tutuyorsan "a" kullan.</div>
<pre class="py">with open("islem.log", "w", encoding="utf-8") as f:
    f.write("09:00 sistem açıldı\\n")

with open("islem.log", "a", encoding="utf-8") as f:
    f.write("09:15 sipariş 1001 alındı\\n")
    f.write("09:20 sipariş 1002 alındı\\n")

with open("islem.log", encoding="utf-8") as f:   # mod verilmezse "r"
    print(f.read())</pre>

<h2>Satır satır okuma</h2>
<p><code>read()</code> tüm dosyayı tek metin olarak belleğe alır; milyonlarca satırlık bir log için uygun değildir. Dosya nesnesi üzerinde doğrudan <code>for</code> ile dönersen Python satırları teker teker okur. Her satırın sonunda <code>\\n</code> gelir; <code>strip()</code> ile temizle.</p>
<pre class="py">with open("islem.log", encoding="utf-8") as f:
    for numara, satir in enumerate(f, start=1):
        satir = satir.strip()
        if "sipariş" in satir:
            print(f"{numara}: {satir}")

# Tüm satırları liste olarak almak
with open("islem.log", encoding="utf-8") as f:
    satirlar = f.readlines()
print(len(satirlar), "satır")
print(satirlar[0].rstrip())</pre>

<h2>CSV'yi elle ayrıştırma</h2>
<p>CSV (comma-separated values), her satırın bir kayıt, virgülle ayrılmış her parçanın bir alan olduğu düz metin dosyasıdır; Excel açar, her sistem üretir. İlk satır genelde başlık. Dosyadan okunan her şey metindir; sayısal alanları <code>int</code>/<code>float</code> ile dönüştürmeyi unutma.</p>
<pre class="py">csv_metni = """id,musteri,sehir,tutar
1001,Ayşe,Ankara,900.0
1002,Mehmet,İzmir,820.0
1003,Elif,Ankara,930.0
1004,Can,İstanbul,450.0
"""
with open("siparisler.csv", "w", encoding="utf-8") as f:
    f.write(csv_metni)

siparisler = []
with open("siparisler.csv", encoding="utf-8") as f:
    basliklar = f.readline().strip().split(",")
    for satir in f:
        satir = satir.strip()
        if not satir:            # boş satırı atla
            continue
        alanlar = satir.split(",")
        kayit = dict(zip(basliklar, alanlar))
        kayit["id"] = int(kayit["id"])
        kayit["tutar"] = float(kayit["tutar"])
        siparisler.append(kayit)

print(basliklar)
print(siparisler[0])
print("Toplam:", sum(s["tutar"] for s in siparisler))</pre>
<p><code>dict(zip(basliklar, alanlar))</code> hilesi başlıkla değeri eşleştirip sözlük üretir; sütun sırası değişse bile kod bozulmaz. Alan içinde virgül ya da tırnak varsa (adres gibi) elle split yetmez; o zaman standart <code>csv</code> modülünü kullanırsın, orta seviyede göreceğiz.</p>

<h2>Dosyaya rapor yazma</h2>
<p>Önceki derste ürettiğin rapor metnini dosyaya yazmak tek satır: <code>f.write(rapor)</code>. Birden çok satırı tek seferde yazmak için <code>writelines</code> var ama satır sonlarını kendin eklemelisin; en temizi <code>"\\n".join(...)</code> ile metni hazırlayıp yazmaktır.</p>
<pre class="py">satirlar = [f"{'Şehir':&lt;10}{'Ciro':&gt;10}", "-" * 20]
for sehir, ciro in [("Ankara", 1830.0), ("İzmir", 820.0), ("İstanbul", 450.0)]:
    satirlar.append(f"{sehir:&lt;10}{ciro:&gt;10,.2f}")

with open("rapor.txt", "w", encoding="utf-8") as f:
    f.write("\\n".join(satirlar) + "\\n")

with open("rapor.txt", encoding="utf-8") as f:
    print(f.read())</pre>

<h2>pathlib: dosya yolu bir nesnedir</h2>
<p><code>os.path</code> ile metin birleştirmek yerine <code>pathlib.Path</code> yolu bir nesne olarak taşır; <code>/</code> operatörüyle parçalar birleşir, işletim sistemi farkı (Windows'ta ters bölü) kendiliğinden çözülür. Küçük dosyalar için <code>read_text</code> ve <code>write_text</code> kısayolları <code>with open</code> yazmaktan da kısadır.</p>
<pre class="py">from pathlib import Path

klasor = Path("raporlar")
klasor.mkdir(exist_ok=True)          # varsa hata verme
dosya = klasor / "ciro_2024_03.txt"  # yol birleştirme

dosya.write_text("Ankara;1830.00\\nİzmir;820.00\\n", encoding="utf-8")
print(dosya.exists(), dosya.name, dosya.suffix, dosya.parent)
print(dosya.read_text(encoding="utf-8"))

for p in klasor.glob("*.txt"):       # klasördeki txt dosyaları
    print("bulundu:", p)</pre>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Büyük dosyada bellek</h3>
<p>Satır satır okuma, dosya ne kadar büyük olursa olsun bellekte yalnız bir satır tutar. Bir gigabaytlık log'u <code>read()</code> ile açmak programı çökertebilir; <code>for satir in f</code> ile dakikalar sürse de biter. Orta seviyedeki üreteçler (generator) bu fikri genelleştirir.</p>
<h3>Yolu sabit yazma</h3>
<p><code>"C:/Users/ayse/rapor.txt"</code> gibi mutlak yollar başka bilgisayarda çalışmaz. Betiğin bulunduğu klasöre göreli yol kur: <code>Path(__file__).parent / "veri" / "siparisler.csv"</code>. Ayarları ortam değişkeninden okumak da yaygındır.</p>
<h3>Atomik yazma</h3>
<p>Rapor yazılırken elektrik kesilirse yarım dosya kalır. Kurumsal betikler önce geçici dosyaya yazar, sonra <code>Path.replace</code> ile asıl adına taşır; taşıma işlemi ya tamamen olur ya hiç olmaz. Veri kaybının ucuz çözümü budur.</p>
</section>
`,
  ex: [
    { t: 'code', id: 'dosya-islemleri-1',
      q: '<p><code>notlari_yaz(yol, notlar)</code> fonksiyonu bir metin listesini, <b>her not ayrı satırda</b> olacak şekilde verilen dosyaya yazsın (mod <code>"w"</code>, encoding utf-8). Son satırdan sonra da <code>\\n</code> olsun. Fonksiyon bir şey döndürmesin.</p>',
      start: 'def notlari_yaz(yol, notlar):\n    pass\n',
      sol: 'def notlari_yaz(yol, notlar):\n    with open(yol, "w", encoding="utf-8") as f:\n        for n in notlar:\n            f.write(n + "\\n")\n',
      tests: 'notlari_yaz("n1.txt", ["Kulaklık stoğu kritik", "Kargo firması değişti"])\nwith open("n1.txt", encoding="utf-8") as f:\n    icerik = f.read()\nassert icerik == "Kulaklık stoğu kritik\\nKargo firması değişti\\n", "her not ayrı satırda ve sonunda satır sonu olmalı"\nnotlari_yaz("n1.txt", ["tek"])\nwith open("n1.txt", encoding="utf-8") as f:\n    assert f.read() == "tek\\n", "w modu eski içeriği silmeli"\nnotlari_yaz("n2.txt", [])\nwith open("n2.txt", encoding="utf-8") as f:\n    assert f.read() == "", "boş liste boş dosya üretmeli"\n',
      hints: ['with open(yol, "w", encoding="utf-8") as f:', 'Her nota "\\n" ekleyerek f.write et.'],
      why: 'write satır sonu eklemez; her nota kendin eklersin. "w" modu dosyayı her çağrıda sıfırdan yazar.' },
    { t: 'code', id: 'dosya-islemleri-2',
      q: '<p><code>log_ekle(yol, mesaj)</code> fonksiyonu mesajı dosyanın <b>sonuna</b> yeni satır olarak eklesin; eski içerik silinmesin. Dosya yoksa oluşturulsun.</p>',
      start: 'def log_ekle(yol, mesaj):\n    pass\n',
      sol: 'def log_ekle(yol, mesaj):\n    with open(yol, "a", encoding="utf-8") as f:\n        f.write(mesaj + "\\n")\n',
      tests: 'import os\nif os.path.exists("islem_test.log"):\n    os.remove("islem_test.log")\nlog_ekle("islem_test.log", "09:00 sistem açıldı")\nlog_ekle("islem_test.log", "09:15 sipariş 1001 alındı")\nwith open("islem_test.log", encoding="utf-8") as f:\n    satirlar = f.read().splitlines()\nassert satirlar == ["09:00 sistem açıldı", "09:15 sipariş 1001 alındı"], "iki çağrıdan sonra iki satır olmalı; eski satır korunmalı"\n',
      hints: ['Ekleme modu "a".', 'Mesajın sonuna "\\n" ekle.'],
      why: '"a" modu dosya sonuna yazar ve dosya yoksa oluşturur. "w" kullansaydın ikinci çağrı ilkini silerdi.' },
    { t: 'mc', q: 'Var olan bir dosyayı <code>open("rapor.txt", "w")</code> ile açıp hiçbir şey yazmadan kapatırsan ne olur?',
      o: ['Dosya değişmez', 'FileExistsError oluşur', 'Dosyanın içeriği silinir', 'Dosya salt okunur olur'], a: 2,
      why: '"w" modu dosyayı açar açmaz içeriğini sıfırlar; yazıp yazmaman fark etmez. Var olan içeriği korumak için "a" ya da "r+" kullanılır.' },
    { t: 'code', id: 'dosya-islemleri-3',
      q: '<p><code>kritik_satirlar(yol, anahtar)</code> fonksiyonu dosyayı <b>satır satır</b> okusun ve içinde <code>anahtar</code> metni geçen satırları (baştaki ve sondaki boşluklar temizlenmiş halde) liste olarak döndürsün. <code>read()</code> kullanma; dosya nesnesi üzerinde for ile dön.</p>',
      start: 'def kritik_satirlar(yol, anahtar):\n    bulunanlar = []\n    pass\n    return bulunanlar\n',
      sol: 'def kritik_satirlar(yol, anahtar):\n    bulunanlar = []\n    with open(yol, encoding="utf-8") as f:\n        for satir in f:\n            satir = satir.strip()\n            if anahtar in satir:\n                bulunanlar.append(satir)\n    return bulunanlar\n',
      tests: 'with open("stok.log", "w", encoding="utf-8") as f:\n    f.write("Kulaklık stok: 12\\nKlavye stok: 3 KRITIK\\nMouse stok: 25\\nMonitör stok: 0 KRITIK\\n")\nassert kritik_satirlar("stok.log", "KRITIK") == ["Klavye stok: 3 KRITIK", "Monitör stok: 0 KRITIK"], "KRITIK geçen iki satır dönmeli"\nassert kritik_satirlar("stok.log", "Mouse") == ["Mouse stok: 25"], "Mouse satırı dönmeli, satır sonu temizlenmiş olmalı"\nassert kritik_satirlar("stok.log", "Webcam") == [], "eşleşme yoksa boş liste"\nassert ".read()" not in __kod__, "read() yerine satır satır oku"\n',
      hints: ['for satir in f: her turda bir satır verir.', 'strip() ile satır sonunu temizle, sonra in ile kontrol et.'],
      why: 'Dosya nesnesi yinelenebilirdir; satır satır okumak belleği korur. strip olmadan satır sonundaki \\n listeye girer.' },
    { t: 'code', id: 'dosya-islemleri-4',
      q: '<p><code>csv_oku(yol)</code> fonksiyonu başlık satırı <code>id,musteri,sehir,tutar</code> olan bir CSV dosyasını okuyup her satırı sözlük olarak döndürsün (liste içinde). <code>id</code> alanı <b>int</b>, <code>tutar</code> alanı <b>float</b> olsun; diğerleri metin kalsın. Boş satırları atla.</p>',
      start: 'def csv_oku(yol):\n    kayitlar = []\n    with open(yol, encoding="utf-8") as f:\n        basliklar = f.readline().strip().split(",")\n        for satir in f:\n            pass\n    return kayitlar\n',
      sol: 'def csv_oku(yol):\n    kayitlar = []\n    with open(yol, encoding="utf-8") as f:\n        basliklar = f.readline().strip().split(",")\n        for satir in f:\n            satir = satir.strip()\n            if not satir:\n                continue\n            kayit = dict(zip(basliklar, satir.split(",")))\n            kayit["id"] = int(kayit["id"])\n            kayit["tutar"] = float(kayit["tutar"])\n            kayitlar.append(kayit)\n    return kayitlar\n',
      tests: 'with open("sip.csv", "w", encoding="utf-8") as f:\n    f.write("id,musteri,sehir,tutar\\n1001,Ayşe,Ankara,900.0\\n1002,Mehmet,İzmir,820.5\\n\\n1003,Elif,Ankara,930\\n")\nk = csv_oku("sip.csv")\nassert len(k) == 3, "boş satır atlanınca 3 kayıt olmalı"\nassert k[0] == {"id": 1001, "musteri": "Ayşe", "sehir": "Ankara", "tutar": 900.0}, "ilk kayıt sözlük olarak doğru olmalı"\nassert isinstance(k[1]["id"], int) and isinstance(k[1]["tutar"], float), "id int, tutar float olmalı"\nassert k[2]["tutar"] == 930.0, "tam sayı yazılmış tutar da float olmalı"\n',
      hints: ['Her satırı strip edip boşsa continue.', 'dict(zip(basliklar, satir.split(","))) sözlük üretir.', 'int() ve float() ile iki alanı dönüştür.'],
      why: 'Dosyadan gelen her şey metindir; sayısal alanları açıkça dönüştürmek gerekir. zip ile başlık-değer eşlemesi sütun sırasına bağımlılığı kaldırır.' },
    { t: 'mc', q: '<code>with open(...) as f:</code> kalıbının asıl faydası nedir?',
      o: ['Dosyayı daha hızlı okur', 'Blok bitince dosyayı hata olsa bile kapatır', 'Dosyayı otomatik UTF-8 yapar', 'Dosya yoksa oluşturur'], a: 1,
      why: 'with, bağlam yöneticisi (context manager) olarak blok sonunda close() çağrısını garanti eder; istisna fırlasa bile. Hız, kodlama ve dosya oluşturma ile ilgisi yoktur.' },
    { t: 'code', id: 'dosya-islemleri-5',
      q: '<p><code>pathlib</code> kullanarak <code>rapor_kaydet(klasor_adi, dosya_adi, metin)</code> fonksiyonunu yaz: klasörü yoksa oluştursun (<code>mkdir(exist_ok=True)</code>), <code>klasor / dosya_adi</code> yoluna metni <code>write_text</code> ile (utf-8) yazsın ve oluşan <code>Path</code> nesnesini döndürsün.</p>',
      start: 'from pathlib import Path\n\ndef rapor_kaydet(klasor_adi, dosya_adi, metin):\n    pass\n',
      sol: 'from pathlib import Path\n\ndef rapor_kaydet(klasor_adi, dosya_adi, metin):\n    klasor = Path(klasor_adi)\n    klasor.mkdir(exist_ok=True)\n    yol = klasor / dosya_adi\n    yol.write_text(metin, encoding="utf-8")\n    return yol\n',
      tests: 'from pathlib import Path\np = rapor_kaydet("raporlar_test", "ciro.txt", "Ankara;1830.00\\n")\nassert isinstance(p, Path), "Path nesnesi dönmeli"\nassert p.exists(), "dosya oluşmalı"\nassert p.name == "ciro.txt" and p.parent.name == "raporlar_test", "yol klasor/dosya biçiminde olmalı"\nassert p.read_text(encoding="utf-8") == "Ankara;1830.00\\n", "içerik doğru yazılmalı"\np2 = rapor_kaydet("raporlar_test", "ciro.txt", "yeni")\nassert p2.read_text(encoding="utf-8") == "yeni", "ikinci çağrı (klasör varken) hata vermemeli ve üzerine yazmalı"\n',
      hints: ['Path(klasor_adi).mkdir(exist_ok=True)', 'Yolu / ile birleştir; write_text ile yaz; Path nesnesini döndür.'],
      why: 'pathlib ile klasör oluşturma, yol birleştirme ve yazma üç kısa satırdır; exist_ok=True tekrar çağrılarda hata vermesini engeller.' }
  ],
  faq: [
    { q: 'Dosyayı with olmadan açarsam ne olur?', a: 'Çalışır ama close() çağırmayı sen hatırlamalısın; hata fırlarsa kapanmayabilir ve son yazılanlar diske ulaşmayabilir. with bunu senin yerine garantiler; alışkanlık edin.' },
    { q: 'readline, readlines ve for farkı nedir?', a: 'readline bir satır okur, readlines tüm satırları liste yapar (belleğe alır), for satir in f ise satırları tek tek, bellek dostu şekilde verir. Büyük dosyada for kullan.' },
    { q: 'Dosya yoksa hata almak istemiyorum.', a: 'Önce Path(yol).exists() ile kontrol et ya da bir sonraki derste göreceğin try/except FileNotFoundError ile yakala. Yazma modları (w, a) dosyayı zaten oluşturur.' }
  ],
  mistakes: [
    { bad: 'f = open("rapor.txt", "w")\nf.write("...")', good: 'with open("rapor.txt", "w", encoding="utf-8") as f:\n    f.write("...")', why: 'Kapatılmayan dosyada veri diske yazılmayabilir; with blok sonunda kapatır.' },
    { bad: 'with open("gunluk.log", "w") as f:\n    f.write("yeni olay\\n")', good: 'with open("gunluk.log", "a", encoding="utf-8") as f:\n    f.write("yeni olay\\n")', why: '"w" eski kayıtları siler; günlük için ekleme modu "a" gerekir.' },
    { bad: 'for satir in f:\n    if satir == "Ankara":\n        ...', good: 'for satir in f:\n    if satir.strip() == "Ankara":\n        ...', why: 'Okunan satırın sonunda \\n vardır; strip etmeden karşılaştırma hiç eşleşmez.' },
    { bad: 'toplam += kayit["tutar"]', good: 'toplam += float(kayit["tutar"])', why: 'Dosyadan okunan alan metindir; sayıya çevirmeden toplanamaz (TypeError).' }
  ]
},
/* ───────────────────────── 7. HATALAR ───────────────────────── */
{
  id: 'hatalar',
  lv: 'temel',
  mod: 'Dosya ve Hata',
  min: 28,
  title: 'Hatalar ve istisnalar',
  sum: 'Program çökmesin, anlamlı mesaj versin: hata türleri, traceback okuma, try/except/else/finally, raise ile kendi hatanı fırlatma ve savunmacı kod.',
  goals: [
    'Bir traceback mesajını okuyup hatanın türünü ve satırını bulabilirim.',
    'try/except ile belirli hata türlerini yakalayıp programın devam etmesini sağlayabilirim.',
    'else ve finally bloklarının ne zaman çalıştığını açıklayabilirim.',
    'raise ile geçersiz girdide anlamlı bir hata fırlatabilirim.',
    'Hangi hatayı yakalayıp hangisini yukarı bırakacağıma karar verebilirim.'
  ],
  body: `
<h2>Neden önemli?</h2>
<p>Ilgaz Bank'ın gece çalışan rapor betiği, bir satırda tutar yerine "yok" yazdığı için saat 03:00'te çöktü ve sabah hiç rapor yoktu. Oysa o satırı atlayıp loga yazsa, kalan binlerce satır işlenirdi. Hata (error) kaçınılmazdır; mesele programın hatayı <b>nasıl karşıladığı</b>dır. Python'da hatalar <b>istisna</b> (exception) adlı nesnelerle temsil edilir ve yakalanabilir.</p>

<h2>Hata mesajı (traceback) okuma</h2>
<pre class="py">def ortalama(liste):
    return sum(liste) / len(liste)

try:
    ortalama([])
except Exception as e:
    print(type(e).__name__, "->", e)</pre>
<p>Bu kodu yakalamasaydık Python şöyle bir <b>traceback</b> basardı:</p>
<pre class="out">Traceback (most recent call last):
  File "rapor.py", line 5, in &lt;module&gt;
    ortalama([])
  File "rapor.py", line 2, in ortalama
    return sum(liste) / len(liste)
ZeroDivisionError: division by zero</pre>
<p>Okuma sırası: <b>en alt satır</b> hatanın türü ve mesajıdır; hemen üstü hatanın oluştuğu satır; yukarı doğru çıktıkça oraya hangi çağrılarla gelindiğini görürsün. Önce en alta bak, sonra kendi dosyandaki ilk satırı bul.</p>

<h2>Sık karşılaşılan hata türleri</h2>
<div class="tbl-wrap"><table>
<tr><th>Hata</th><th>Ne zaman</th><th>Örnek</th></tr>
<tr><td><code>SyntaxError</code></td><td>Kod daha çalışmadan: yazım hatası</td><td>eksik iki nokta, kapanmayan parantez</td></tr>
<tr><td><code>NameError</code></td><td>Tanımsız ad</td><td><code>print(toplm)</code></td></tr>
<tr><td><code>TypeError</code></td><td>Yanlış tür</td><td><code>"5" + 3</code></td></tr>
<tr><td><code>ValueError</code></td><td>Tür doğru, değer uygunsuz</td><td><code>int("abc")</code></td></tr>
<tr><td><code>KeyError</code></td><td>Sözlükte olmayan anahtar</td><td><code>musteri["telefon"]</code></td></tr>
<tr><td><code>IndexError</code></td><td>Listede olmayan indeks</td><td><code>liste[10]</code></td></tr>
<tr><td><code>ZeroDivisionError</code></td><td>Sıfıra bölme</td><td><code>toplam / 0</code></td></tr>
<tr><td><code>FileNotFoundError</code></td><td>Dosya yok</td><td><code>open("yok.txt")</code></td></tr>
<tr><td><code>AttributeError</code></td><td>Nesnede olmayan öznitelik</td><td><code>"abc".push("d")</code></td></tr>
</table></div>

<h2>try / except: hatayı yakala</h2>
<p>Hata çıkabilecek kodu <code>try</code> bloğuna, hata olursa yapılacak işi <code>except</code> bloğuna yaz. Yakalayacağın hata türünü <b>açıkça</b> belirt; birden fazla tür için demet ya da ayrı except blokları kullan.</p>
<pre class="py">ham_tutarlar = ["900.0", "820.5", "yok", "930", "", "45,50"]
toplam = 0.0
hatali = []

for ham in ham_tutarlar:
    try:
        toplam += float(ham)
    except ValueError:
        hatali.append(ham)

print("Toplam:", toplam)
print("Atlanan değerler:", hatali)</pre>
<pre class="py">musteri = {"ad": "Ayşe", "sehir": "Ankara"}
alanlar = ["ad", "telefon", "sehir"]

for alan in alanlar:
    try:
        print(alan, "=", musteri[alan])
    except KeyError as e:
        print("eksik alan:", e)

try:
    sonuc = 100 / int("0")
except (ZeroDivisionError, ValueError) as e:
    print("hesap yapılamadı:", type(e).__name__)</pre>
<div class="warn"><b>Çıplak except yazma</b><code>except:</code> ya da <code>except Exception:</code> her şeyi yutar: yazım hatasını, yanlış değişken adını, kullanıcının Ctrl+C'sini bile. Hata gizlenir, program yanlış sonuçla sessizce devam eder. Hangi hatayı beklediğini biliyorsan onu yaz; bilmiyorsan muhtemelen yakalamamalısın.</div>

<h2>else ve finally</h2>
<ul>
  <li><b>else</b>: try bloğu <b>hatasız</b> biterse çalışır. "Hata çıkabilecek kısım" ile "başarılıysa yapılacak kısım" ayrılır.</li>
  <li><b>finally</b>: hata olsa da olmasa da, hatta except içinde return olsa bile <b>her zaman</b> çalışır. Kaynak kapatma, geçici dosya silme, "işlem bitti" logu için.</li>
</ul>
<pre class="py">def dosya_toplami(yol):
    try:
        f = open(yol, encoding="utf-8")
    except FileNotFoundError:
        print("dosya yok:", yol)
        return 0
    else:
        toplam = sum(float(s) for s in f if s.strip())
        print("okundu:", yol)
        return toplam
    finally:
        print("işlem tamamlandı:", yol)

with open("tutarlar.txt", "w", encoding="utf-8") as f:
    f.write("100\\n250.5\\n\\n49.5\\n")

print(dosya_toplami("tutarlar.txt"))
print(dosya_toplami("olmayan.txt"))</pre>
<p>Sıra sabittir: <code>try</code> → <code>except</code> (bir ya da daha çok) → <code>else</code> → <code>finally</code>. Gerçek kodda dosya için <code>with</code> kullanırsın; finally'nin yaptığı kapatma işini with zaten yapar.</p>

<h2>raise: kendi hatanı fırlat</h2>
<p>Fonksiyonun geçersiz girdi aldığında sessizce yanlış sonuç üretmesi, hata vermesinden kötüdür. <code>raise</code> ile uygun bir istisna fırlat; mesajı açıklayıcı yaz. Girdiyi fonksiyonun başında kontrol etmeye <b>savunmacı kod</b> (defensive programming) denir.</p>
<pre class="py">def para_cek(bakiye, tutar):
    if tutar &lt;= 0:
        raise ValueError(f"tutar pozitif olmalı, gelen: {tutar}")
    if tutar &gt; bakiye:
        raise ValueError(f"yetersiz bakiye: {bakiye} &lt; {tutar}")
    return bakiye - tutar

print(para_cek(1000, 300))
for deneme in (-5, 5000):
    try:
        para_cek(1000, deneme)
    except ValueError as e:
        print("RED:", e)</pre>
<p>Hangi tür? Değer uygunsuzsa <code>ValueError</code>, tür yanlışsa <code>TypeError</code>, bir şey bulunamadıysa <code>KeyError</code>/<code>LookupError</code>. Orta seviyede kendi hata sınıflarını (<code>class YetersizBakiye(Exception)</code>) tanımlayacaksın.</p>
<div class="tip"><b>Yakala ya da bırak</b>Bir hatayı yalnızca onunla ilgili <b>anlamlı bir şey yapabiliyorsan</b> yakala: atla, varsayılan kullan, kullanıcıya düzgün mesaj ver. Yapamıyorsan bırak yukarı çıksın; çağıran fonksiyon ya da ana program karar versin. except bloğunda yalnızca <code>raise</code> yazarak hatayı loglayıp yeniden fırlatabilirsin.</div>

<h2>Savunmacı kod: EAFP ve LBYL</h2>
<p>İki yaklaşım var. <b>LBYL</b> (look before you leap): önce kontrol et, sonra yap: <code>if "tutar" in kayit:</code>. <b>EAFP</b> (easier to ask forgiveness than permission): yap, hata çıkarsa yakala: <code>try: kayit["tutar"] except KeyError:</code>. Python topluluğu çoğunlukla EAFP'yi tercih eder; özellikle kontrol ile kullanım arasında durum değişebiliyorsa (dosya, ağ). Ama girdinin geçerliliğini fonksiyon başında <code>raise</code> ile doğrulamak her zaman iyidir.</p>
<pre class="py">kayit = {"id": 1001, "tutar": "900.0"}

# LBYL
if "tutar" in kayit and kayit["tutar"].replace(".", "").isdigit():
    print("LBYL:", float(kayit["tutar"]))

# EAFP
try:
    print("EAFP:", float(kayit["tutar"]))
except (KeyError, ValueError) as e:
    print("geçersiz kayıt:", e)

# dict.get ile varsayılan: en kısa yol
print(kayit.get("sehir", "bilinmiyor"))</pre>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Hata bir mesajdır, gürültü değil</h3>
<p>İyi bir hata mesajı ne beklendiğini, ne geldiğini ve mümkünse hangi kaydı söyler: <code>ValueError("satır 42: tutar sayı olmalı, gelen 'yok'")</code>. Gece çalışan betiğin loguna bakan kişi sorunu dakikalar içinde bulur.</p>
<h3>Hata zinciri</h3>
<p>Düşük seviye hatayı yakalayıp daha anlamlı bir hata fırlatırken <code>raise YeniHata(...) from e</code> yaz; traceback her iki hatayı da gösterir, asıl neden kaybolmaz.</p>
<h3>Hataları say, sonra karar ver</h3>
<p>Toplu veri işlerken ilk hatada durmak yerine hataları bir listede topla; iş bitince "1000 satırdan 3'ü atlandı" diye raporla. Kabul edilebilir hata oranı iş birimine göre değişir: kampanya e-postası için yüzde 1 sorun değil, banka mutabakatı için tek satır bile kabul edilmez. Bu kararı kodun değil, iş kuralının vermesi gerekir; sen sayıyı ölçülebilir hale getir.</p>
</section>
`,
  ex: [
    { t: 'code', id: 'hatalar-1',
      q: '<p><code>guvenli_float(metin)</code> fonksiyonu metni <code>float</code>\'a çevirsin; çevrilemezse (<code>ValueError</code>) <code>None</code> döndürsün. Yalnızca ValueError yakala.</p>',
      start: 'def guvenli_float(metin):\n    pass\n',
      sol: 'def guvenli_float(metin):\n    try:\n        return float(metin)\n    except ValueError:\n        return None\n',
      tests: 'assert guvenli_float("900.5") == 900.5, "900.5 metni sayıya çevrilmeli"\nassert guvenli_float("yok") is None, "çevrilemeyen metin için None"\nassert guvenli_float("") is None, "boş metin için None"\nassert guvenli_float("  42 ") == 42.0, "boşluklu sayı float tarafından kabul edilir"\nsrc = __source__\nassert "ValueError" in src, "ValueError açıkça yakalanmalı"\nassert "except:" not in src and "except Exception" not in src, "çıplak except kullanma"\n',
      hints: ['try içinde return float(metin).', 'except ValueError: return None'],
      why: 'Yalnızca beklenen hata yakalanır; başka bir sorun (örneğin None gelirse TypeError) gizlenmez, yukarı çıkar.' },
    { t: 'code', id: 'hatalar-2',
      q: '<p><code>toplam_ve_hatalar(ham_liste)</code> fonksiyonu metin listesini gezsin; sayıya çevrilebilenleri toplasın, çevrilemeyenleri ayrı listede biriktirsin ve <code>(toplam, hatalilar)</code> demeti döndürsün. Örnek: <code>["900.0", "yok", "100"]</code> → <code>(1000.0, ["yok"])</code></p>',
      start: 'def toplam_ve_hatalar(ham_liste):\n    toplam = 0.0\n    hatalilar = []\n    for ham in ham_liste:\n        pass\n    return toplam, hatalilar\n',
      sol: 'def toplam_ve_hatalar(ham_liste):\n    toplam = 0.0\n    hatalilar = []\n    for ham in ham_liste:\n        try:\n            toplam += float(ham)\n        except ValueError:\n            hatalilar.append(ham)\n    return toplam, hatalilar\n',
      tests: 'assert toplam_ve_hatalar(["900.0", "yok", "100"]) == (1000.0, ["yok"]), "toplam 1000.0, hatalı [yok] olmalı"\nassert toplam_ve_hatalar(["1", "2", "3"]) == (6.0, []), "hepsi geçerliyse hatalı liste boş"\nassert toplam_ve_hatalar(["a", "", "45,5"]) == (0.0, ["a", "", "45,5"]), "virgüllü sayı da geçersizdir"\nassert toplam_ve_hatalar([]) == (0.0, []), "boş liste için (0.0, [])"\n',
      hints: ['try/except döngünün içinde olmalı ki bir hata diğer elemanları engellemesin.', 'except ValueError: hatalilar.append(ham)'],
      why: 'Hata döngü içinde yakalandığı için tek bozuk kayıt tüm işi durdurmaz; bozuklar raporlanır. "45,5" Python için geçersizdir çünkü ondalık ayırıcı noktadır.' },
    { t: 'mc', q: '<code>int("12.5")</code> hangi hatayı fırlatır?',
      o: ['TypeError', 'ValueError', 'SyntaxError', 'Hata vermez, 12 döner'], a: 1,
      why: 'Argümanın türü doğrudur (metin) ama değeri tam sayı biçiminde değildir; bu ValueError\'dır. TypeError tür yanlış olduğunda (int([1])) çıkar.' },
    { t: 'code', id: 'hatalar-3',
      q: '<p>Ilgaz Bank havale kuralı: <code>havale(bakiye, tutar)</code> fonksiyonu tutar <b>0 veya negatifse</b> <code>ValueError("tutar pozitif olmalı")</code>, tutar <b>bakiyeden büyükse</b> <code>ValueError("yetersiz bakiye")</code> fırlatsın; aksi halde yeni bakiyeyi döndürsün. Mesajlar tam olarak böyle olsun.</p>',
      start: 'def havale(bakiye, tutar):\n    pass\n',
      sol: 'def havale(bakiye, tutar):\n    if tutar <= 0:\n        raise ValueError("tutar pozitif olmalı")\n    if tutar > bakiye:\n        raise ValueError("yetersiz bakiye")\n    return bakiye - tutar\n',
      tests: 'assert havale(1000, 300) == 700, "1000 - 300 = 700 dönmeli"\nassert havale(500, 500) == 0, "bakiyenin tamamı gönderilebilmeli"\nfor kotu, mesaj in [(0, "tutar pozitif olmalı"), (-5, "tutar pozitif olmalı"), (5000, "yetersiz bakiye")]:\n    try:\n        havale(1000, kotu)\n    except ValueError as e:\n        assert str(e) == mesaj, f"tutar={kotu} için mesaj \'{mesaj}\' olmalı, gelen: {e}"\n    else:\n        raise AssertionError(f"tutar={kotu} için ValueError fırlatılmalı")\n',
      hints: ['raise ValueError("...") ile fırlat.', 'Önce pozitiflik, sonra bakiye kontrolü.'],
      why: 'Geçersiz girdide sessizce yanlış sonuç dönmek yerine açık hata fırlatılır; çağıran taraf except ile yakalayıp kullanıcıya gösterir.' },
    { t: 'mc', q: 'Aşağıdaki bloklardan hangisi <b>hata olsa da olmasa da</b> her zaman çalışır?',
      o: ['else', 'except', 'finally', 'try'], a: 2,
      why: 'finally her durumda, hatta except içinde return olsa bile çalışır; kaynak temizliği için kullanılır. else yalnızca try hatasız bittiğinde, except yalnızca hata olduğunda çalışır.' },
    { t: 'code', id: 'hatalar-4',
      q: '<p><code>dosya_satir_sayisi(yol)</code> fonksiyonu dosyadaki satır sayısını döndürsün; dosya yoksa (<code>FileNotFoundError</code>) <code>-1</code> döndürsün. Her iki durumda da fonksiyon sonunda <code>"kontrol edildi: &lt;yol&gt;"</code> yazdırılsın (finally kullan).</p>',
      start: 'def dosya_satir_sayisi(yol):\n    try:\n        pass\n    except FileNotFoundError:\n        pass\n    finally:\n        pass\n',
      sol: 'def dosya_satir_sayisi(yol):\n    try:\n        with open(yol, encoding="utf-8") as f:\n            return sum(1 for _ in f)\n    except FileNotFoundError:\n        return -1\n    finally:\n        print(f"kontrol edildi: {yol}")\n',
      tests: 'import io, contextlib\nwith open("satirlar.txt", "w", encoding="utf-8") as f:\n    f.write("a\\nb\\nc\\n")\nbuf = io.StringIO()\nwith contextlib.redirect_stdout(buf):\n    r1 = dosya_satir_sayisi("satirlar.txt")\n    r2 = dosya_satir_sayisi("olmayan_dosya.txt")\nassert r1 == 3, "3 satırlık dosya için 3 dönmeli"\nassert r2 == -1, "olmayan dosya için -1 dönmeli"\ncikti = buf.getvalue()\nassert "kontrol edildi: satirlar.txt" in cikti, "var olan dosya için finally mesajı yazılmalı"\nassert "kontrol edildi: olmayan_dosya.txt" in cikti, "olmayan dosya için de finally mesajı yazılmalı"\n',
      hints: ['try içinde dosyayı with ile aç ve satırları say.', 'except FileNotFoundError: return -1', 'finally içindeki print, return olsa bile çalışır.'],
      why: 'finally bloğu her iki yoldan çıkışta da çalışır; return bile onu atlatamaz. Bu yüzden "iş bitti" logu için ideal yerdir.' },
    { t: 'mc', q: '<code>except:</code> (çıplak except) yazmak neden önerilmez?',
      o: ['Python 3\'te geçersizdir', 'Yalnızca bir hata türü yakalar', 'Yazım hataları ve Ctrl+C dahil her şeyi yutar, sorunu gizler', 'try bloğunu yavaşlatır'], a: 2,
      why: 'Çıplak except tüm istisnaları (KeyboardInterrupt ve SystemExit dahil) yakalar; gerçek hata görünmez ve program yanlış veriyle devam eder. Sözdizimi olarak geçerlidir ve hız etkisi yoktur.' }
  ],
  faq: [
    { q: 'Hata yakalayınca program yavaşlar mı?', a: 'try bloğuna girmenin maliyeti neredeyse sıfırdır; maliyet hata fırlatıldığında oluşur. Hata nadir olduğu sürece EAFP tarzı (önce dene, sonra yakala) genellikle önceden kontrol etmekten hızlıdır.' },
    { q: 'except Exception as e yazmak çıplak except ile aynı mı?', a: 'Neredeyse. Exception, KeyboardInterrupt ve SystemExit\'i kapsamaz, o kadar. Yine de çok geniştir; yalnızca en dış katmanda (ana program) loglamak için kullan ve mutlaka e\'yi kaydet.' },
    { q: 'assert ile raise farkı nedir?', a: 'assert geliştirme sırasında "bu asla olmamalı" kontrolüdür ve -O bayrağıyla kapatılabilir; kullanıcı girdisi doğrulaması için uygun değildir. Girdi kontrolü için raise ValueError kullan.' }
  ],
  mistakes: [
    { bad: 'try:\n    tutar = float(ham)\nexcept:\n    tutar = 0', good: 'try:\n    tutar = float(ham)\nexcept ValueError:\n    tutar = 0', why: 'Çıplak except her hatayı yutar; yalnızca beklediğin türü yakala.' },
    { bad: 'def bol(a, b):\n    if b == 0:\n        return "hata"\n    return a / b', good: 'def bol(a, b):\n    if b == 0:\n        raise ZeroDivisionError("bölen sıfır olamaz")\n    return a / b', why: 'Hata yerine metin döndürmek çağıran tarafta tür karmaşasına yol açar; istisna fırlat.' },
    { bad: 'for ham in liste:\n    toplam += float(ham)   # ilk hatada tüm döngü durur', good: 'for ham in liste:\n    try:\n        toplam += float(ham)\n    except ValueError:\n        hatali.append(ham)', why: 'Toplu işte hata döngü içinde yakalanmalı ki tek bozuk kayıt işi durdurmasın.' },
    { bad: 'try:\n    f = open(yol)\n    veri = f.read()\n    islem(veri)\nexcept FileNotFoundError:\n    ...', good: 'try:\n    f = open(yol)\nexcept FileNotFoundError:\n    ...\nelse:\n    with f:\n        islem(f.read())', why: 'try bloğu küçük tutulmalı; yalnızca hata beklenen satır içinde olsun, gerisi else\'e.' }
  ]
},
/* ───────────────────────── 8. PROJE: ANADOLU MARKET SİPARİŞ RAPORU ───────────────────────── */
{
  id: 'proje-temel',
  lv: 'temel',
  mod: 'Bitirme',
  min: 45,
  title: 'Bitirme projesi: Anadolu Market sipariş raporu',
  sum: 'Temel seviyede öğrendiğin her şeyi birleştir: sipariş listesinden toplam ciro, şehre göre toplam, en çok satan ürün ve biçimli rapor metni üreten, dosyaya yazan küçük bir program.',
  goals: [
    'Bir iş isteğini küçük, test edilebilir fonksiyonlara bölebilirim.',
    'Liste ve sözlüklerle toplam, gruplama ve en büyük bulma hesaplarını yapabilirim.',
    'Hesap fonksiyonlarını sunum (rapor metni) fonksiyonundan ayırabilirim.',
    'Bozuk kayıtları hata yakalayarak atlayıp raporda sayısını gösterebilirim.',
    'Raporu dosyaya yazıp geri okuyarak doğrulayabilirim.'
  ],
  body: `
<h2>İş isteği</h2>
<p>Anadolu Market operasyon müdürü senden şunu istiyor: "Her sabah dünkü siparişlerin özetini istiyorum: toplam ciro, hangi şehre ne kadar sattık, en çok satan ürün hangisi. Düz metin olsun, e-postaya yapıştırayım." Elinde sipariş kayıtları var; bu derste isteği adım adım çalışan bir programa çevireceksin. Alıştırmalar projenin parçalarıdır: her biri bir fonksiyon, sonuncusu hepsini birleştirir.</p>

<h2>Veri</h2>
<p>Her sipariş bir sözlük: <code>id</code>, <code>musteri</code>, <code>sehir</code>, <code>urun</code>, <code>adet</code>, <code>birim_fiyat</code>. Sipariş tutarı <code>adet × birim_fiyat</code>. Veriyi kodun içinde küçük bir liste olarak tutuyoruz; gerçekte CSV'den gelir, onu da 6. derste öğrendin.</p>
<pre class="py">SIPARISLER = [
    {"id": 1001, "musteri": "Ayşe", "sehir": "Ankara", "urun": "Kulaklık", "adet": 2, "birim_fiyat": 899.90},
    {"id": 1002, "musteri": "Mehmet", "sehir": "İzmir", "urun": "Klavye", "adet": 1, "birim_fiyat": 1249.00},
    {"id": 1003, "musteri": "Elif", "sehir": "Ankara", "urun": "Mouse", "adet": 3, "birim_fiyat": 349.50},
    {"id": 1004, "musteri": "Can", "sehir": "İstanbul", "urun": "Kulaklık", "adet": 1, "birim_fiyat": 899.90},
    {"id": 1005, "musteri": "Zeynep", "sehir": "İzmir", "urun": "Mouse", "adet": 2, "birim_fiyat": 349.50},
    {"id": 1006, "musteri": "Burak", "sehir": "Ankara", "urun": "Monitör", "adet": 1, "birim_fiyat": 4599.00},
]
print(len(SIPARISLER), "sipariş")
print(SIPARISLER[0])</pre>

<h2>Adım 1: Planı fonksiyonlara böl</h2>
<p>Büyük işi tek seferde yazmaya kalkma. Önce isteği parçala; her parça tek iş yapan, girdi alıp çıktı döndüren bir fonksiyon olsun:</p>
<div class="steps-list"><ol>
<li><code>siparis_tutari(siparis)</code>: tek siparişin tutarı.</li>
<li><code>toplam_ciro(siparisler)</code>: tüm tutarların toplamı.</li>
<li><code>sehre_gore_ciro(siparisler)</code>: şehir → toplam tutar sözlüğü.</li>
<li><code>en_cok_satan(siparisler)</code>: adet toplamı en yüksek ürün ve adedi.</li>
<li><code>rapor_metni(siparisler)</code>: yukarıdakileri çağırıp biçimli metin üretir.</li>
<li><code>raporu_kaydet(metin, yol)</code>: metni dosyaya yazar.</li>
</ol></div>
<p>Hesap fonksiyonları (1-4) <b>saf</b>: yalnızca veri alır, sonuç döndürür, hiçbir şey yazdırmaz. Sunum (5) ve dosya (6) ayrıdır. Böylece her hesabı tek başına test edebilir, raporun biçimini değiştirirken hesaba dokunmazsın.</p>

<h2>Adım 2: Tek siparişin tutarı ve toplam ciro</h2>
<pre class="py">SIPARISLER = [
    {"id": 1001, "sehir": "Ankara", "urun": "Kulaklık", "adet": 2, "birim_fiyat": 899.90},
    {"id": 1002, "sehir": "İzmir", "urun": "Klavye", "adet": 1, "birim_fiyat": 1249.00},
    {"id": 1003, "sehir": "Ankara", "urun": "Mouse", "adet": 3, "birim_fiyat": 349.50},
]

def siparis_tutari(siparis):
    """adet × birim fiyat, 2 ondalığa yuvarlanmış."""
    return round(siparis["adet"] * siparis["birim_fiyat"], 2)

def toplam_ciro(siparisler):
    toplam = 0.0
    for s in siparisler:
        toplam += siparis_tutari(s)
    return round(toplam, 2)

print(siparis_tutari(SIPARISLER[0]))
print(toplam_ciro(SIPARISLER))</pre>
<p>Küçük fonksiyon büyüğünün içinde kullanılır; tutar hesabı değişirse (örneğin indirim eklenirse) yalnız <code>siparis_tutari</code> değişir.</p>

<h2>Adım 3: Şehre göre gruplama</h2>
<p>Döngüler dersindeki sayaç kalıbının toplama versiyonu: anahtar şehir, değer biriken tutar.</p>
<pre class="py">def sehre_gore_ciro(siparisler):
    ciro = {}
    for s in siparisler:
        sehir = s["sehir"]
        ciro[sehir] = round(ciro.get(sehir, 0.0) + siparis_tutari(s), 2)
    return ciro

print(sehre_gore_ciro(SIPARISLER))</pre>

<h2>Adım 4: En çok satan ürün</h2>
<p>Önce ürün → toplam adet sözlüğü kur, sonra en büyüğü bul. <code>max</code> fonksiyonuna <code>key</code> vererek sözlüğü değerine göre tarayabilirsin.</p>
<pre class="py">def en_cok_satan(siparisler):
    adetler = {}
    for s in siparisler:
        adetler[s["urun"]] = adetler.get(s["urun"], 0) + s["adet"]
    if not adetler:
        return None, 0
    urun = max(adetler, key=adetler.get)
    return urun, adetler[urun]

print(en_cok_satan(SIPARISLER))</pre>
<div class="note"><b>Boş veri</b>Hiç sipariş yoksa <code>max</code> boş sözlükte hata verir. Erken dönüşle <code>(None, 0)</code> döndürmek, raporun "Dün sipariş olmadı" diyebilmesini sağlar. Her hesap fonksiyonunda "boş gelirse ne olur?" diye sor.</div>

<h2>Adım 5: Bozuk kayıtlara dayanıklılık</h2>
<p>Gerçek veride <code>adet</code> metin olarak gelebilir, <code>birim_fiyat</code> eksik olabilir. Hesabı çökertmek yerine bozuk kayıtları ayır ve raporda sayısını göster. Temizleme işini de ayrı bir fonksiyona ver:</p>
<pre class="py">def temizle(ham_siparisler):
    """Geçerli siparişleri ve atlanan kayıt sayısını döndürür."""
    temiz, atlanan = [], 0
    for s in ham_siparisler:
        try:
            kayit = dict(s)
            kayit["adet"] = int(s["adet"])
            kayit["birim_fiyat"] = float(s["birim_fiyat"])
            if kayit["adet"] &lt;= 0:
                raise ValueError("adet pozitif olmalı")
            temiz.append(kayit)
        except (KeyError, ValueError, TypeError):
            atlanan += 1
    return temiz, atlanan

ham = [
    {"id": 1, "sehir": "Ankara", "urun": "Mouse", "adet": "3", "birim_fiyat": "349.5"},
    {"id": 2, "sehir": "İzmir", "urun": "Klavye", "adet": "yok", "birim_fiyat": 1249},
    {"id": 3, "sehir": "Bursa", "urun": "Kulaklık", "adet": 1},
]
temiz, atlanan = temizle(ham)
print(len(temiz), "geçerli,", atlanan, "atlandı")
print(temiz[0])</pre>

<h2>Adım 6: Rapor metni ve dosya</h2>
<p>Metin biçimlendirme dersindeki hizalama ve join kalıbı. Rapor fonksiyonu hesap yapmaz; hesap fonksiyonlarını çağırır ve satırları dizer.</p>
<pre class="py">from datetime import date

def rapor_metni(siparisler, tarih, atlanan=0):
    toplam = toplam_ciro(siparisler)
    sehirler = sehre_gore_ciro(siparisler)
    urun, adet = en_cok_satan(siparisler)
    satirlar = [
        f"ANADOLU MARKET GÜNLÜK RAPOR - {tarih:%d.%m.%Y}",
        "=" * 40,
        f"Sipariş sayısı : {len(siparisler)}",
        f"Toplam ciro    : {toplam:,.2f} TL",
        "",
        "Şehre göre ciro",
    ]
    for sehir, ciro in sorted(sehirler.items(), key=lambda x: x[1], reverse=True):
        satirlar.append(f"  {sehir:&lt;12}{ciro:&gt;14,.2f} TL")
    satirlar.append("")
    satirlar.append(f"En çok satan   : {urun} ({adet} adet)")
    if atlanan:
        satirlar.append(f"Atlanan kayıt  : {atlanan}")
    return "\\n".join(satirlar)

rapor = rapor_metni(SIPARISLER, date(2024, 3, 5), atlanan=1)
print(rapor)

with open("gunluk_rapor.txt", "w", encoding="utf-8") as f:
    f.write(rapor + "\\n")
print("\\nDosyadan geri okundu, satır sayısı:", len(open("gunluk_rapor.txt", encoding="utf-8").read().splitlines()))</pre>

<h2>Kontrol listesi</h2>
<div class="tbl-wrap"><table>
<tr><th>Soru</th><th>Neden</th></tr>
<tr><td>Her fonksiyon tek iş mi yapıyor?</td><td>Test ve değişiklik kolaylığı</td></tr>
<tr><td>Hesap fonksiyonları print ediyor mu?</td><td>Etmemeli; sunumdan ayrı kalmalı</td></tr>
<tr><td>Boş liste verince çöküyor mu?</td><td>Sipariş olmayan gün de rapor ister</td></tr>
<tr><td>Bozuk kayıt tüm raporu durduruyor mu?</td><td>Durdurmamalı; sayılıp raporlanmalı</td></tr>
<tr><td>Para 2 ondalıkla ve binlik ayırıcıyla mı?</td><td>Müdür Excel'den alışkın</td></tr>
</table></div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Bu program gerçekte nasıl çalışır?</h3>
<p>Orta seviyede aynı projeyi CSV modülüyle dosyadan okuyacak, <code>dataclass</code> ile siparişi tip güvenli bir nesneye çevirecek, <code>collections.Counter</code> ve <code>defaultdict</code> ile gruplama kodunu yarıya indirecek, <code>unittest</code> ile her fonksiyona test yazacaksın. İleri seviyede ise <code>pandas</code> ile <code>groupby("sehir")["tutar"].sum()</code> tek satır olacak. Temel bu: parçala, saf tut, biçimi ayır.</p>
<h3>Zamanlama</h3>
<p>"Her sabah" isteği kodun içine girmez; işletim sisteminin zamanlayıcısı (cron, Görev Zamanlayıcı) betiği 07:00'de çalıştırır. Betik <code>if __name__ == "__main__":</code> bloğunda veriyi okur, raporu üretir, dosyaya yazar ve çıkar. Betiğin kendisi "ne zaman" sorusunu bilmez; bu, sorumlulukları ayırmanın bir başka örneğidir.</p>
</section>
`,
  ex: [
    { t: 'code', id: 'proje-temel-1',
      q: '<p><b>Adım 1.</b> <code>siparis_tutari(siparis)</code> fonksiyonu sözlükteki <code>adet</code> × <code>birim_fiyat</code> çarpımını <b>2 ondalığa yuvarlayıp</b> döndürsün. Ardından <code>toplam_ciro(siparisler)</code> tüm siparişlerin tutar toplamını (yine 2 ondalık) döndürsün; boş listede <code>0.0</code>.</p>',
      start: 'def siparis_tutari(siparis):\n    pass\n\ndef toplam_ciro(siparisler):\n    pass\n',
      sol: 'def siparis_tutari(siparis):\n    return round(siparis["adet"] * siparis["birim_fiyat"], 2)\n\ndef toplam_ciro(siparisler):\n    toplam = 0.0\n    for s in siparisler:\n        toplam += siparis_tutari(s)\n    return round(toplam, 2)\n',
      tests: 'S = [\n    {"id": 1001, "sehir": "Ankara", "urun": "Kulaklık", "adet": 2, "birim_fiyat": 899.90},\n    {"id": 1002, "sehir": "İzmir", "urun": "Klavye", "adet": 1, "birim_fiyat": 1249.00},\n    {"id": 1003, "sehir": "Ankara", "urun": "Mouse", "adet": 3, "birim_fiyat": 349.50},\n]\nassert siparis_tutari(S[0]) == 1799.8, "2 x 899.90 = 1799.8 olmalı"\nassert siparis_tutari(S[2]) == 1048.5, "3 x 349.50 = 1048.5 olmalı"\nassert toplam_ciro(S) == 4097.3, "toplam 4097.3 olmalı"\nassert toplam_ciro([]) == 0.0, "boş liste için 0.0"\n',
      hints: ['round(adet * fiyat, 2)', 'toplam_ciro içinde siparis_tutari fonksiyonunu çağır; hesabı tekrar yazma.'],
      why: 'Küçük fonksiyon büyüğün içinde kullanılır; tutar formülü tek yerde yaşar.' },
    { t: 'code', id: 'proje-temel-2',
      q: '<p><b>Adım 2.</b> <code>sehre_gore_ciro(siparisler)</code> fonksiyonu her şehrin toplam sipariş tutarını (adet × birim_fiyat, 2 ondalık) sözlük olarak döndürsün. Örnek: <code>{"Ankara": 2848.3, "İzmir": 1249.0}</code>. Boş liste için boş sözlük.</p>',
      start: 'def siparis_tutari(siparis):\n    return round(siparis["adet"] * siparis["birim_fiyat"], 2)\n\ndef sehre_gore_ciro(siparisler):\n    ciro = {}\n    pass\n    return ciro\n',
      sol: 'def siparis_tutari(siparis):\n    return round(siparis["adet"] * siparis["birim_fiyat"], 2)\n\ndef sehre_gore_ciro(siparisler):\n    ciro = {}\n    for s in siparisler:\n        sehir = s["sehir"]\n        ciro[sehir] = round(ciro.get(sehir, 0.0) + siparis_tutari(s), 2)\n    return ciro\n',
      tests: 'S = [\n    {"id": 1001, "sehir": "Ankara", "urun": "Kulaklık", "adet": 2, "birim_fiyat": 899.90},\n    {"id": 1002, "sehir": "İzmir", "urun": "Klavye", "adet": 1, "birim_fiyat": 1249.00},\n    {"id": 1003, "sehir": "Ankara", "urun": "Mouse", "adet": 3, "birim_fiyat": 349.50},\n    {"id": 1004, "sehir": "İstanbul", "urun": "Kulaklık", "adet": 1, "birim_fiyat": 899.90},\n]\nr = sehre_gore_ciro(S)\nassert set(r) == {"Ankara", "İzmir", "İstanbul"}, "üç şehir olmalı"\nassert abs(r["Ankara"] - 2848.3) < 1e-6, "Ankara 1799.8 + 1048.5 = 2848.3 olmalı"\nassert abs(r["İzmir"] - 1249.0) < 1e-6, "İzmir 1249.0 olmalı"\nassert abs(r["İstanbul"] - 899.9) < 1e-6, "İstanbul 899.9 olmalı"\nassert sehre_gore_ciro([]) == {}, "boş liste için boş sözlük"\n',
      hints: ['ciro.get(sehir, 0.0) ile mevcut toplamı al, tutarı ekle, geri yaz.', 'Her adımda round(..., 2) kayan nokta kalıntılarını temizler.'],
      why: 'Sözlükle gruplama kalıbı: anahtar şehir, değer biriken tutar. collections.defaultdict ile daha da kısalır, orta seviyede göreceksin.' },
    { t: 'code', id: 'proje-temel-3',
      q: '<p><b>Adım 3.</b> <code>en_cok_satan(siparisler)</code> fonksiyonu toplam <b>adedi</b> en yüksek ürünün adını ve toplam adedini <code>(urun, adet)</code> demeti olarak döndürsün. Boş listede <code>(None, 0)</code>.</p>',
      start: 'def en_cok_satan(siparisler):\n    adetler = {}\n    pass\n',
      sol: 'def en_cok_satan(siparisler):\n    adetler = {}\n    for s in siparisler:\n        adetler[s["urun"]] = adetler.get(s["urun"], 0) + s["adet"]\n    if not adetler:\n        return None, 0\n    urun = max(adetler, key=adetler.get)\n    return urun, adetler[urun]\n',
      tests: 'S = [\n    {"id": 1001, "sehir": "Ankara", "urun": "Kulaklık", "adet": 2, "birim_fiyat": 899.90},\n    {"id": 1002, "sehir": "İzmir", "urun": "Klavye", "adet": 1, "birim_fiyat": 1249.00},\n    {"id": 1003, "sehir": "Ankara", "urun": "Mouse", "adet": 3, "birim_fiyat": 349.50},\n    {"id": 1004, "sehir": "İstanbul", "urun": "Kulaklık", "adet": 1, "birim_fiyat": 899.90},\n    {"id": 1005, "sehir": "İzmir", "urun": "Mouse", "adet": 2, "birim_fiyat": 349.50},\n]\nassert en_cok_satan(S) == ("Mouse", 5), "Mouse 3 + 2 = 5 adetle ilk olmalı"\nassert en_cok_satan(S[:2]) == ("Kulaklık", 2), "ilk iki siparişte Kulaklık 2 adet"\nassert en_cok_satan([]) == (None, 0), "boş liste için (None, 0)"\n',
      hints: ['Önce ürün -> toplam adet sözlüğü kur.', 'max(adetler, key=adetler.get) en yüksek değerli anahtarı verir.', 'Boş kontrolünü max çağrısından önce yap.'],
      why: 'Gruplama + en büyüğü bulma. max\'a key vermek, anahtarları değerlerine göre karşılaştırmasını sağlar.' },
    { t: 'code', id: 'proje-temel-4',
      q: '<p><b>Adım 4.</b> <code>temizle(ham)</code> fonksiyonu ham kayıt listesini gezsin; her kaydın kopyasında <code>adet</code>\'i <code>int</code>, <code>birim_fiyat</code>\'ı <code>float</code> yapsın. Alan eksikse (<code>KeyError</code>), çevrilemezse (<code>ValueError</code>, <code>TypeError</code>) ya da adet 0 veya negatifse kaydı atlasın. <code>(temiz_liste, atlanan_sayisi)</code> döndürsün.</p>',
      start: 'def temizle(ham):\n    temiz = []\n    atlanan = 0\n    for s in ham:\n        try:\n            pass\n        except (KeyError, ValueError, TypeError):\n            atlanan += 1\n    return temiz, atlanan\n',
      sol: 'def temizle(ham):\n    temiz = []\n    atlanan = 0\n    for s in ham:\n        try:\n            kayit = dict(s)\n            kayit["adet"] = int(s["adet"])\n            kayit["birim_fiyat"] = float(s["birim_fiyat"])\n            if kayit["adet"] <= 0:\n                raise ValueError("adet pozitif olmalı")\n            temiz.append(kayit)\n        except (KeyError, ValueError, TypeError):\n            atlanan += 1\n    return temiz, atlanan\n',
      tests: 'ham = [\n    {"id": 1, "sehir": "Ankara", "urun": "Mouse", "adet": "3", "birim_fiyat": "349.5"},\n    {"id": 2, "sehir": "İzmir", "urun": "Klavye", "adet": "yok", "birim_fiyat": 1249},\n    {"id": 3, "sehir": "Bursa", "urun": "Kulaklık", "adet": 1},\n    {"id": 4, "sehir": "Ankara", "urun": "Monitör", "adet": 0, "birim_fiyat": 4599.0},\n    {"id": 5, "sehir": "İzmir", "urun": "Mouse", "adet": 2, "birim_fiyat": None},\n]\ntemiz, atlanan = temizle(ham)\nassert atlanan == 4, "4 kayıt atlanmalı (metin adet, eksik fiyat, sıfır adet, None fiyat)"\nassert len(temiz) == 1 and temiz[0]["id"] == 1, "yalnız 1 numaralı kayıt kalmalı"\nassert temiz[0]["adet"] == 3 and isinstance(temiz[0]["adet"], int), "adet int 3 olmalı"\nassert temiz[0]["birim_fiyat"] == 349.5 and isinstance(temiz[0]["birim_fiyat"], float), "birim_fiyat float 349.5 olmalı"\nassert ham[0]["adet"] == "3", "orijinal kayıt değiştirilmemeli (kopya üzerinde çalış)"\nassert temizle([]) == ([], 0), "boş liste için ([], 0)"\n',
      hints: ['dict(s) ile kopya al; orijinali değiştirme.', 'int ve float dönüşümleri try içinde; adet <= 0 için raise ValueError.', 'float(None) TypeError fırlatır; demet içindeki üç tür bunu da yakalar.'],
      why: 'Hata döngü içinde yakalanır, bozuk kayıt sayılır ve iş devam eder. Kopya üzerinde çalışmak çağıranın verisini bozmaz.' },
    { t: 'code', id: 'proje-temel-5',
      q: '<p><b>Adım 5.</b> Verilen yardımcı fonksiyonları kullanarak <code>rapor_metni(siparisler)</code> fonksiyonunu yaz. Tam olarak şu satırları <code>"\\n"</code> ile birleştirip döndürsün:</p><ol><li><code>ANADOLU MARKET GÜNLÜK RAPOR</code></li><li><code>Sipariş sayısı: N</code></li><li><code>Toplam ciro: X TL</code> (X binlik ayırıcılı, 2 ondalık)</li><li>Ciroya göre <b>büyükten küçüğe</b> sıralı her şehir için: şehir adı 10 karakter sola yaslı, ardından ciro 12 karakter sağa yaslı binlik ayırıcılı 2 ondalık, ardından <code> TL</code></li><li><code>En çok satan: URUN (ADET adet)</code></li></ol>',
      start: 'def siparis_tutari(s):\n    return round(s["adet"] * s["birim_fiyat"], 2)\n\ndef toplam_ciro(siparisler):\n    return round(sum(siparis_tutari(s) for s in siparisler), 2)\n\ndef sehre_gore_ciro(siparisler):\n    ciro = {}\n    for s in siparisler:\n        ciro[s["sehir"]] = round(ciro.get(s["sehir"], 0.0) + siparis_tutari(s), 2)\n    return ciro\n\ndef en_cok_satan(siparisler):\n    adetler = {}\n    for s in siparisler:\n        adetler[s["urun"]] = adetler.get(s["urun"], 0) + s["adet"]\n    if not adetler:\n        return None, 0\n    urun = max(adetler, key=adetler.get)\n    return urun, adetler[urun]\n\ndef rapor_metni(siparisler):\n    satirlar = ["ANADOLU MARKET GÜNLÜK RAPOR"]\n    # satırları ekle\n    return "\\n".join(satirlar)\n',
      sol: 'def siparis_tutari(s):\n    return round(s["adet"] * s["birim_fiyat"], 2)\n\ndef toplam_ciro(siparisler):\n    return round(sum(siparis_tutari(s) for s in siparisler), 2)\n\ndef sehre_gore_ciro(siparisler):\n    ciro = {}\n    for s in siparisler:\n        ciro[s["sehir"]] = round(ciro.get(s["sehir"], 0.0) + siparis_tutari(s), 2)\n    return ciro\n\ndef en_cok_satan(siparisler):\n    adetler = {}\n    for s in siparisler:\n        adetler[s["urun"]] = adetler.get(s["urun"], 0) + s["adet"]\n    if not adetler:\n        return None, 0\n    urun = max(adetler, key=adetler.get)\n    return urun, adetler[urun]\n\ndef rapor_metni(siparisler):\n    satirlar = ["ANADOLU MARKET GÜNLÜK RAPOR"]\n    satirlar.append(f"Sipariş sayısı: {len(siparisler)}")\n    satirlar.append(f"Toplam ciro: {toplam_ciro(siparisler):,.2f} TL")\n    sehirler = sehre_gore_ciro(siparisler)\n    for sehir, ciro in sorted(sehirler.items(), key=lambda x: x[1], reverse=True):\n        satirlar.append(f"{sehir:<10}{ciro:>12,.2f} TL")\n    urun, adet = en_cok_satan(siparisler)\n    satirlar.append(f"En çok satan: {urun} ({adet} adet)")\n    return "\\n".join(satirlar)\n',
      tests: 'S = [\n    {"id": 1001, "sehir": "Ankara", "urun": "Kulaklık", "adet": 2, "birim_fiyat": 899.90},\n    {"id": 1002, "sehir": "İzmir", "urun": "Klavye", "adet": 1, "birim_fiyat": 1249.00},\n    {"id": 1003, "sehir": "Ankara", "urun": "Mouse", "adet": 3, "birim_fiyat": 349.50},\n    {"id": 1004, "sehir": "İstanbul", "urun": "Kulaklık", "adet": 1, "birim_fiyat": 899.90},\n    {"id": 1005, "sehir": "İzmir", "urun": "Mouse", "adet": 2, "birim_fiyat": 349.50},\n    {"id": 1006, "sehir": "Ankara", "urun": "Monitör", "adet": 1, "birim_fiyat": 4599.00},\n]\nbeklenen = "\\n".join([\n    "ANADOLU MARKET GÜNLÜK RAPOR",\n    "Sipariş sayısı: 6",\n    "Toplam ciro: 10,295.20 TL",\n    "Ankara        7,447.30 TL",\n    "İzmir         1,948.00 TL",\n    "İstanbul        899.90 TL",\n    "En çok satan: Mouse (5 adet)",\n])\ngelen = rapor_metni(S)\nassert gelen == beklenen, "rapor metni beklenenle aynı olmalı:\\n" + beklenen + "\\n--- gelen ---\\n" + gelen\nbos = rapor_metni([])\nassert "Sipariş sayısı: 0" in bos and "Toplam ciro: 0.00 TL" in bos, "boş liste için 0 sipariş ve 0.00 TL"\n',
      hints: ['Her satırı f-string ile satirlar listesine ekle.', 'sorted(sehirler.items(), key=lambda x: x[1], reverse=True) ciroya göre büyükten küçüğe sıralar.', 'Şehir satırı: f"{sehir:<10}{ciro:>12,.2f} TL"'],
      why: 'Rapor fonksiyonu hesap yapmaz; hazır fonksiyonları çağırıp satırları dizer. Sıralama için sorted ve key kullanılır; biçimleme f-string belirteçleriyle yapılır.' },
    { t: 'code', id: 'proje-temel-6',
      q: '<p><b>Adım 6.</b> <code>raporu_kaydet(metin, yol)</code> fonksiyonu metni dosyaya (utf-8, <code>"w"</code>) yazsın, sonuna bir satır sonu eklesin ve <b>yazılan satır sayısını</b> döndürsün. Satır sayısını dosyayı <b>geri okuyarak</b> hesapla.</p>',
      start: 'def raporu_kaydet(metin, yol):\n    pass\n',
      sol: 'def raporu_kaydet(metin, yol):\n    with open(yol, "w", encoding="utf-8") as f:\n        f.write(metin + "\\n")\n    with open(yol, encoding="utf-8") as f:\n        return sum(1 for _ in f)\n',
      tests: 'rapor = "ANADOLU MARKET GÜNLÜK RAPOR\\nSipariş sayısı: 6\\nToplam ciro: 9,595.20 TL"\nn = raporu_kaydet(rapor, "proje_rapor.txt")\nassert n == 3, "3 satırlık rapor için 3 dönmeli"\nwith open("proje_rapor.txt", encoding="utf-8") as f:\n    icerik = f.read()\nassert icerik == rapor + "\\n", "dosya içeriği metin + satır sonu olmalı"\nassert raporu_kaydet("tek satır", "proje_rapor.txt") == 1, "ikinci çağrı üzerine yazmalı ve 1 dönmeli"\n',
      hints: ['İlk with ile yaz, ikinci with ile oku.', 'Satır saymak için for satir in f döngüsü ya da sum(1 for _ in f).'],
      why: 'Yazdığını geri okuyup doğrulamak, dosya işlemlerinde en basit sağlamadır. Yazma ve okuma ayrı with bloklarında yapılır.' }
  ],
  faq: [
    { q: 'Neden tek bir büyük fonksiyon yazmadık?', a: 'Tek fonksiyon çalışır ama bir hata çıktığında nerede olduğunu bulmak, yalnızca şehir hesabını test etmek ya da rapor biçimini değiştirmek zorlaşır. Küçük fonksiyonlar lego parçası gibidir; orta seviyedeki testler de bu parçalara yazılır.' },
    { q: 'Veri gerçekte nereden gelir?', a: 'Genellikle CSV dosyası, veritabanı ya da bir API. Temel seviyede CSV okumayı öğrendin; orta seviyede csv modülü, SQLite ve JSON ile aynı projeyi gerçek kaynaklara bağlayacaksın.' },
    { q: 'Kayan nokta toplamları neden round ile temizliyoruz?', a: '0.1 + 0.2 gibi toplamlar ikili sistemde tam temsil edilemez ve 0.30000000000000004 çıkabilir. Her adımda round(..., 2) kuruş hassasiyetini korur. Bankacılık ölçeğinde Decimal kullanılır.' }
  ],
  mistakes: [
    { bad: 'def toplam_ciro(siparisler):\n    for s in siparisler:\n        print(s["adet"] * s["birim_fiyat"])', good: 'def toplam_ciro(siparisler):\n    return round(sum(siparis_tutari(s) for s in siparisler), 2)', why: 'Hesap fonksiyonu print etmemeli, değer döndürmeli; raporu başka fonksiyon yazar.' },
    { bad: 'urun = max(adetler)', good: 'urun = max(adetler, key=adetler.get)', why: 'key olmadan max anahtarları (ürün adlarını) alfabetik karşılaştırır, değerleri değil.' },
    { bad: 'for s in ham:\n    s["adet"] = int(s["adet"])', good: 'for s in ham:\n    kayit = dict(s)\n    kayit["adet"] = int(s["adet"])', why: 'Gelen sözlüğü yerinde değiştirmek çağıranın verisini bozar; kopya üzerinde çalış.' },
    { bad: 'sorted(sehirler.items(), reverse=True)', good: 'sorted(sehirler.items(), key=lambda x: x[1], reverse=True)', why: 'key verilmezse demetler ilk elemana (şehir adı) göre sıralanır, ciroya göre değil.' }
  ]
}
);
})(window);
