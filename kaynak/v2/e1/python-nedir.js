/* Kesit Python — 'python-nedir' dersi uzantısı (Derinleş + ek alıştırmalar) */
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
  {
    id: 'python-nedir',
    min: 20,
    html: `<h2>Python bir programı nasıl çalıştırır?</h2><p>"Yorumlanan dil" ifadesi doğru ama eksik. Sen <code>python rapor.py</code> yazdığında perde arkasında üç adım olur:</p><div class="steps-list"><ol><li><b>Ayrıştırma (parsing):</b> Yorumlayıcı dosyanın tamamını okur ve sözdizimini denetler. Kapanmamış bir parantez varsa program <i>hiç başlamaz</i>; SyntaxError bu yüzden ilk satır bile çalışmadan gelir.</li><li><b>Bayt koduna derleme (bytecode):</b> Kod, Python sanal makinesinin anlayacağı ara bir dile çevrilir. Bir modülü içe aktardığında oluşan <code>__pycache__</code> klasöründeki <code>.pyc</code> dosyaları bu bayt kodudur; bir dahaki sefere derleme adımı atlanır.</li><li><b>Yürütme:</b> Python sanal makinesi (PVM) bayt kodunu satır satır çalıştırır. NameError, TypeError gibi hatalar bu aşamada, o satıra sıra geldiğinde çıkar.</li></ol></div><p>Bayt kodunu merak ediyorsan standart kütüphanedeki <code>dis</code> modülü onu gösterir. Çıktının ayrıntısı sürümden sürüme değişir; amaç ezberlemek değil, "kod önce çevriliyor, sonra çalışıyor" fikrini görmek:</p><pre class="py">import dis
dis.dis("toplam = 3 * 250")
print("Bayt kodu yukarıda; sonuç hesaplanınca:", 3 * 250)</pre><p>İlk satırda bir şey dikkatini çekebilir: Python <code>3 * 250</code> çarpımını derleme sırasında önceden yapıp 750 sabitini koyabilir. Buna sabit katlama (constant folding) denir ve yorumlayıcının küçük bir hız optimizasyonudur.</p><h2>Python'ın kimlik kartı</h2><p>İş görüşmelerinde ve PCEP gibi sertifika sınavlarında Python'ı birkaç teknik sıfatla tarif etmen beklenir. Hepsinin ne anlama geldiğini bir tabloda topladık:</p><div class="tbl-wrap"><table><tr><th>Özellik</th><th>Anlamı</th><th>Python'da örnek</th></tr><tr><td>Yorumlanan (interpreted)</td><td>Ayrı bir derleme adımı yok, yorumlayıcı çalıştırır</td><td><code>python rapor.py</code></td></tr><tr><td>Dinamik tipli (dynamically typed)</td><td>Tür değişkene değil değere aittir, çalışırken belirlenir</td><td><code>x = 5</code> sonra <code>x = "beş"</code></td></tr><tr><td>Güçlü tipli (strongly typed)</td><td>Uyumsuz türleri sessizce birbirine çevirmez</td><td><code>"5" + 3</code> TypeError verir</td></tr><tr><td>Çok paradigmalı</td><td>Yordamsal, nesne yönelimli ve fonksiyonel stil bir arada</td><td>fonksiyon, sınıf, <code>map</code></td></tr><tr><td>Çöp toplayıcılı (garbage collected)</td><td>Belleği sen boşaltmazsın, Python boşaltır</td><td>Kullanılmayan liste kendiliğinden silinir</td></tr><tr><td>Girintiyle bloklanan</td><td>Bloklar süslü parantezle değil girintiyle belirlenir</td><td><code>if</code> altındaki 4 boşluk</td></tr></table></div><p>En çok karıştırılan ikili "dinamik" ve "güçlü" tiplemedir. Dinamik, bir değişkenin türünü önceden söylemediğin anlamına gelir. Güçlü ise Python'ın türleri tahmin edip senin yerine dönüştürmediği anlamına gelir. JavaScript'te <code>"5" + 3</code> sonucu <code>"53"</code> olur; Python ise hata verir ve seni açık olmaya zorlar:</p><pre class="py">print("5" + "3")        # metin + metin: birleştirme
print(5 + 3)            # sayı + sayı: toplama
print(int("5") + 3)     # açıkça çevirirsen çalışır
print("5" * 3)          # metni tekrar etmek serbest</pre><div class="warn"><b>Güçlü tipli ama her şeye izin vermez değil</b><code>"5" * 3</code> hata vermez, <code>"555"</code> üretir; çünkü metni tekrar etmek tanımlı bir işlemdir. Python'ın reddettiği şey, anlamı belirsiz işlemlerdir: metne sayı eklemek gibi.</div><h2>Python'ın felsefesi: The Zen of Python</h2><p>Python'ın tasarım ilkeleri, Tim Peters'ın yazdığı 19 maddelik bir metinde toplanır ve dilin içine gömülüdür. Aşağıdaki kutuyu çalıştır:</p><pre class="py">import this</pre><p>Bu maddeler kod incelemelerinde (code review) gerçekten alıntılanır. Özellikle şu üçünü aklında tut:</p><ul><li><b>Beautiful is better than ugly / Readability counts:</b> Kod bir kere yazılır, yüzlerce kez okunur. Okunurluk hızdan önce gelir.</li><li><b>Explicit is better than implicit:</b> Ne yaptığını açıkça yaz. <code>int("5") + 3</code> tam olarak bu ilkenin sonucudur.</li><li><b>Errors should never pass silently:</b> Hata görmezden gelinmez; Python bu yüzden şüpheli bir işlemde durup sana söyler.</li></ul><p>Bu ilkelerin somut kurallara dönüşmüş hâli PEP 8 stil rehberidir. PEP (Python Enhancement Proposal), dile yapılacak her değişikliğin yazılı önerisidir; f-string'ler PEP 498, <code>match</code> ifadesi PEP 634 ile geldi. Bir özelliğin neden öyle tasarlandığını merak ettiğinde ilgili PEP'i okumak en güvenilir kaynaktır.</p><h2>Anahtar sözcükler ve hazır fonksiyonlar</h2><p>Python'ın kendine ayırdığı birkaç düzine sözcük vardır: <code>if</code>, <code>for</code>, <code>def</code>, <code>class</code>, <code>True</code>, <code>None</code> gibi. Bunlara anahtar sözcük (keyword) denir ve değişken adı olarak kullanılamaz. <code>print</code>, <code>len</code>, <code>sum</code> ise anahtar sözcük değil hazır fonksiyondur (built-in function); teknik olarak üzerine yazabilirsin ama yazmamalısın.</p><pre class="py">import keyword
print(keyword.iskeyword("for"))      # True: ayrılmış sözcük
print(keyword.iskeyword("print"))    # False: hazır fonksiyon
print(keyword.iskeyword("siparis"))  # False: serbest ad
print(keyword.kwlist[:6])            # listenin ilk birkaç elemanı</pre><div class="tip"><b>Her şey bir nesnedir</b>Python'da sayılar, metinler, hatta <code>print</code> fonksiyonunun kendisi bile nesnedir (object). <code>print(type(print))</code> yazarsan <code>&lt;class 'builtin_function_or_method'&gt;</code> görürsün. Bu fikir, ileride fonksiyonları başka fonksiyonlara parametre olarak verirken çok işine yarayacak.</div><h2>Ekosistem: PyPI ve "piller dahil"</h2><p>Python'ın sloganlarından biri "batteries included": standart kütüphane (standard library) kurulumla birlikte gelir ve tarih hesabından JSON okumaya, e-posta göndermekten SQLite veritabanına kadar yüzlerce modül içerir. Standart kütüphanede olmayan her şey için PyPI (Python Package Index) adlı resmî paket deposu vardır; pandas, requests, Django gibi paketler oradan <code>pip</code> ile kurulur. Kurulum dersinde pip'in ilk adımlarını göreceksin.</p><p>Python'ın birden fazla uygulaması (implementation) da vardır. python.org'dan indirdiğin ve bu uygulamada tarayıcıda çalışan sürüm C ile yazılmış CPython'dır; "Python" denince neredeyse her zaman o kastedilir. PyPy gibi alternatifler belirli işlerde daha hızlıdır. Ayrıntısını Kurulum ve araçlar dersinde göreceksin.</p><div class="note"><b>Gerçek işte</b>Yeni bir ekibe katıldığında ilk hafta şu soruları sor: Hangi Python sürümünü kullanıyoruz? Paketler hangi dosyada listeleniyor (requirements.txt, pyproject.toml)? Kod stili otomatik denetleniyor mu (Ruff, Black)? Bu üç cevap, "benim makinemde çalışıyordu" türü sorunların çoğunu daha başlamadan önler. Kod incelemesinde "bu satır okunmuyor" eleştirisi aldığında kişisel algılama; Zen'in "Readability counts" maddesi ekibin ortak dilidir.</div>`,
    ex: [
      {
        t: 'mc',
        id: 'python-nedir-x1',
        stage: 'Isınma',
        q: 'Python için "dinamik tipli ama güçlü tipli" denir. Bunu en iyi hangi örnek gösterir?',
        o: [
          '<code>x = 5</code> sonra <code>x = "beş"</code> çalışır, ama <code>"5" + 3</code> TypeError verir',
          'Değişkenin türünü baştan yazmak zorunludur ve tür program boyunca bir daha değişmez',
          '<code>"5" + 3</code> sonucu <code>"53"</code> olur, çünkü Python sayıyı metne kendisi çevirir',
          'Program çalışmaya başlamadan önce tüm tür hataları derleyici tarafından yakalanır'
        ],
        a: 0,
        why: 'Dinamik: aynı ad farklı türde değerlere bağlanabilir, türü önceden yazmazsın. Güçlü: Python uyumsuz türleri senin yerine dönüştürmez, metne sayı eklemeyi reddeder. "53" sonucu JavaScript gibi zayıf tipli dillere aittir; tür hatalarının çalışmadan önce yakalanması ise statik tipli dillerin özelliğidir.'
      },
      {
        t: 'predict',
        id: 'python-nedir-x2',
        stage: 'Kodu oku',
        q: 'Bu kod ne yazdırır?',
        code: 'print("10" + "5")\nprint(10 + 5)\nprint("10" * 2)\n',
        o: ['105\n15\n1010', '15\n15\n20', '105\n15\n20', '15\n105\n1010'],
        a: 0,
        why: 'Tırnak içindeki değerler metindir: + onları uç uca ekler ("105"), * ise tekrar eder ("1010"). Tırnaksız 10 + 5 gerçek toplamadır.'
      },
      {
        t: 'predict',
        id: 'python-nedir-x3',
        stage: 'Kodu oku',
        q: 'Bu kod ne yazdırır?',
        code: 'print("A", end="-")\nprint("B")\nprint("C", "D", sep="")\n',
        o: ['A-B\nCD', 'A\n-B\nC D', 'A-B\nC D', 'A- B\nCD'],
        a: 0,
        why: 'end="-" satır sonu yerine tire koyar, bu yüzden B aynı satıra yazılır. sep="" ise C ile D arasına hiçbir şey koymaz.'
      },
      {
        t: 'predict',
        id: 'python-nedir-x4',
        stage: 'Kodu oku',
        q: 'Bu kod ne yapar?',
        code: 'print("Sipariş adedi: " + 5)\n',
        o: ['Sipariş adedi: 5 yazdırır', 'TypeError hatası verir', 'SyntaxError hatası verir', 'Sipariş adedi: yazdırır, 5 yok sayılır'],
        a: 1,
        raises: true,
        why: 'Python güçlü tiplidir: metin ile sayıyı + ile birleştirmez. Çözüm virgülle ayırmak (print("Sipariş adedi:", 5)) ya da str(5) ile çevirmektir. Sözdizimi doğru olduğu için SyntaxError değil, çalışma anında TypeError oluşur.'
      },
      {
        t: 'order',
        id: 'python-nedir-x5',
        stage: 'Kodu oku',
        q: '<p>Anadolu Market kasasının fiş çıktısını üreten satırları, aşağıdaki çıktıyı verecek sırada diz:</p><pre class="out">ANADOLU MARKET\n--------------\nÜrün: Kahve\nTutar: 900\nTeşekkürler!</pre>',
        lines: ['print("ANADOLU MARKET")', 'print("-" * 14)', 'print("Ürün: Kahve")', 'print("Tutar:", 2 * 450)', 'print("Teşekkürler!")'],
        expect: 'ANADOLU MARKET\n--------------\nÜrün: Kahve\nTutar: 900\nTeşekkürler!\n',
        hint: 'Program yukarıdan aşağı çalışır; çıktının sırası satırların sırasıdır.',
        why: 'Yorumlayıcı satırları yazıldığı sırayla yürütür. Çizgi "-" * 14 ile üretilir ve tutar 2 * 450 çarpımıyla hesaplanır.'
      },
      {
        t: 'code',
        id: 'python-nedir-x6',
        stage: 'Rehberli',
        diff: 1,
        q: '<p>Tek bir <code>print</code> çağrısıyla şu satırı yazdır:</p><pre class="out">Ürün: Kahve | Adet: 3 | Tutar: 1350</pre><p>Üç ayrı değer ver (<code>"Ürün: Kahve"</code>, <code>"Adet: 3"</code> ve tutar kısmı) ve aralarına <code>sep</code> ile <code>" | "</code> koy. Tutarı elle yazma, <code>3 * 450</code> ile hesaplat.</p>',
        guide: [
          'print içine ilk değer olarak "Ürün: Kahve" metnini yaz.',
          'İkinci değer "Adet: 3" olsun.',
          'Üçüncü değer için "Tutar:" etiketini ve 3 * 450 hesabını düşün: "Tutar: " + str(3 * 450) gibi tek bir metin üretebilirsin.',
          'En sona sep=" | " ekle.'
        ],
        example: 'print("Şube: Konak", "Kasa: 2", "Saat: 09", sep=" / ")\n',
        start: '# TODO: üç değeri tek print ile, aralarına " | " koyarak yazdır\nprint("Ürün: Kahve", "Adet: 3")\n',
        sol: 'print("Ürün: Kahve", "Adet: 3", "Tutar: " + str(3 * 450), sep=" | ")\n',
        tests: 'assert "sep" in __source__, "Ayraç için sep parametresini kullanmalısın"\nassert "3 * 450" in __source__ or "3*450" in __source__, "Tutarı 3 * 450 ile hesaplatmalısın"\n',
        expect: 'Ürün: Kahve | Adet: 3 | Tutar: 1350\n',
        hints: [
          'print\'in sep parametresi değerlerin arasına ne konacağını belirler.',
          'Etiket ile sayıyı birleştirmek için "Tutar: " + str(3 * 450) kullanabilirsin.',
          'print("Ürün: Kahve", "Adet: 3", "Tutar: " + str(3 * 450), sep=...)'
        ],
        why: 'sep, değerlerin arasına varsayılan boşluk yerine istediğin metni koyar. Sayıyı metinle + ile birleştirmek için str() ile çevirmen gerekir; Python bunu senin yerine yapmaz.'
      },
      {
        erken: true, t: 'code',
        id: 'python-nedir-x7',
        stage: 'Rehberli',
        diff: 1,
        q: '<p>Bir ekip arkadaşın değişkenlerine <code>for</code>, <code>print</code> ve <code>siparis</code> adlarını vermek istiyor. <code>keyword</code> modülünün <code>iskeyword</code> fonksiyonuyla bu üç sözcüğün anahtar sözcük olup olmadığını <b>tek satırda</b>, aralarında boşlukla yazdır. Beklenen çıktı:</p><pre class="out">True False False</pre>',
        guide: ['Önce import keyword ile modülü içe aktar.', 'keyword.iskeyword("for") bir True/False döndürür.', 'Üç çağrıyı tek print içinde virgülle ayırarak ver.'],
        example: 'import keyword\nprint(keyword.iskeyword("class"), keyword.iskeyword("tutar"))\n',
        start: '# TODO: keyword modülünü içe aktar\n# TODO: üç sözcüğü tek print ile denetle\nprint("for", "print", "siparis")\n',
        sol: 'import keyword\nprint(keyword.iskeyword("for"), keyword.iskeyword("print"), keyword.iskeyword("siparis"))\n',
        tests: 'assert "iskeyword" in __source__, "Sonucu elle yazma; keyword.iskeyword ile sor"\n',
        expect: 'True False False\n',
        hints: ['Modülü kullanmadan önce import keyword yazmalısın.', 'keyword.iskeyword("for") True verir.', 'print(keyword.iskeyword("for"), keyword.iskeyword("print"), ...)'],
        why: 'for ayrılmış bir sözcüktür, değişken adı olamaz. print ise hazır bir fonksiyondur; anahtar sözcük değildir ama üzerine yazmak o fonksiyonu kaybettirir. siparis serbest bir addır.'
      },
      {
        t: 'code',
        id: 'python-nedir-x8',
        stage: 'Rehberli',
        diff: 1,
        q: '<p>Anadolu Market\'te Excel\'de yapılan bir hesabı Python\'a taşı. Sepette 2 adet 120 TL\'lik, 4 adet 75 TL\'lik ve 10 adet 40 TL\'lik ürün var. Şu iki satırı yazdır (sayıları Python hesaplasın):</p><pre class="out">Ara toplam: 940\nKDV dahil: 1128.0</pre><p>KDV oranı %20\'dir.</p>',
        guide: [
          'Her ürün için adet × fiyat çarpımını yaz: 2 * 120 gibi.',
          'Üç çarpımı + ile topla ve "Ara toplam:" etiketiyle yazdır.',
          'KDV dahil tutar için aynı toplamı 1.2 ile çarp; toplamın tamamını paranteze almayı unutma.'
        ],
        example: 'print("Günlük ciro:", 3 * 50 + 2 * 25)\nprint("İndirimli:", (3 * 50 + 2 * 25) * 0.9)\n',
        start: '# TODO: ara toplamı hesaplayıp yazdır\nprint("Ara toplam:", 2 * 120)\n# TODO: KDV dahil tutarı yazdır\n',
        sol: 'print("Ara toplam:", 2 * 120 + 4 * 75 + 10 * 40)\nprint("KDV dahil:", (2 * 120 + 4 * 75 + 10 * 40) * 1.2)\n',
        expect: 'Ara toplam: 940\nKDV dahil: 1128.0\n',
        hints: ['Çarpma toplamadan önce yapılır; 2 * 120 + 4 * 75 doğru sırada hesaplanır.', 'KDV için toplamı paranteze al: (…) * 1.2', 'Parantez olmazsa yalnızca son çarpım 1.2 ile çarpılır.'],
        why: 'İşlem önceliği sayesinde çarpımlar toplamadan önce hesaplanır. KDV satırında parantez şarttır; aksi hâlde 1.2 yalnızca son terime uygulanır. Ondalıklı bir sayıyla çarpınca sonuç float olur, bu yüzden 1128.0 görürsün.'
      },
      {
        t: 'code',
        id: 'python-nedir-x9',
        stage: 'Kendin yaz',
        diff: 1,
        q: '<p>Anadolu Market\'e pazartesi 12, salı 19, çarşamba 7 sipariş geldi. Şu iki satırı yazdır; toplamı ve ortalamayı Python hesaplasın, ortalamayı <code>round</code> ile 2 basamağa yuvarla:</p><pre class="out">Toplam: 38 sipariş\nGünlük ortalama: 12.67</pre>',
        sol: 'print("Toplam:", 12 + 19 + 7, "sipariş")\nprint("Günlük ortalama:", round((12 + 19 + 7) / 3, 2))\n',
        expect: 'Toplam: 38 sipariş\nGünlük ortalama: 12.67\n',
        hints: ['print\'e üç değer ver: etiket, toplam, "sipariş".', 'Ortalama = toplam / gün sayısı; round(sayı, 2) iki basamağa yuvarlar.'],
        why: 'print virgülle verilen değerlerin arasına boşluk koyar. round(x, 2) iki ondalık basamak bırakır; bölmenin tamamını round\'un içine yazman gerekir.'
      },
      {
        t: 'code',
        id: 'python-nedir-x10',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 1,
        q: '<p>Stajyer arkadaşının yazdığı kod çalışmıyor. <b>Hatayı bul ve düzelt</b>; çıktı şu olmalı:</p><pre class="out">Merhaba, Anadolu Market\'te bugün indirim var!\nİndirim oranı: 15</pre>',
        start: 'Print("Merhaba, Anadolu Market\'te bugün indirim var!")\nprint(\'İndirim oranı:\' 15)\n',
        sol: 'print("Merhaba, Anadolu Market\'te bugün indirim var!")\nprint(\'İndirim oranı:\', 15)\n',
        expect: 'Merhaba, Anadolu Market\'te bugün indirim var!\nİndirim oranı: 15\n',
        hints: [
          'Önce hata mesajının son satırını oku: Python hangi ada ya da hangi satıra itiraz ediyor?',
          'Python büyük-küçük harfe duyarlıdır. İkinci satırda değerlerin arasında ne eksik?',
          'print küçük harfle yazılır; iki değer virgülle ayrılır.'
        ],
        why: 'Print diye bir ad yoktur (NameError); fonksiyon küçük harfli print\'tir. İkinci satırda iki değerin arasında virgül eksik olduğu için Python bunu SyntaxError sayar. İlk satırdaki kesme işareti sorun değildir, çünkü metin çift tırnakla açılmıştır.'
      },
      {
        t: 'code',
        id: 'python-nedir-x11',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 1,
        q: '<p>İnternetten kopyalanan bu kod Python 3\'te çalışmıyor. <b>Hatayı bul ve düzelt</b>; çıktı şu olmalı:</p><pre class="out">Toplam: 750\nFiyat: 250 TL</pre>',
        start: 'print "Toplam:", 3 * 250\nprint("Fiyat: " + 250 + " TL")\n',
        sol: 'print("Toplam:", 3 * 250)\nprint("Fiyat:", 250, "TL")\n',
        expect: 'Toplam: 750\nFiyat: 250 TL\n',
        hints: ['İlk satır eski Python 2 yazımıdır; Python 3\'te print bir fonksiyondur.', 'İkinci satırda metinle sayıyı + ile birleştiremezsin.', 'Değerleri virgülle ayır: print("Fiyat:", 250, "TL").'],
        why: 'Python 3\'te print bir fonksiyondur ve parantez ister; parantezsiz yazım SyntaxError verir. İkinci satırdaki "Fiyat: " + 250 güçlü tipleme yüzünden TypeError üretir; virgüllü print hem daha okunur hem de türleri kendisi metne çevirir.'
      },
      {
        t: 'code',
        id: 'python-nedir-x12',
        stage: 'Meydan okuma',
        diff: 3,
        q: '<p>Ilgaz Bank\'ın şube ekranına üç satırlık bir bilgi kartı basılacak. Kural: kodda <b>yalnızca bir tane</b> <code>print</code> çağrısı olabilir. Çıktı tam olarak şöyle olmalı:</p><pre class="out">Şube: Konak\nSıradaki: 42\nTahmini bekleme: 18 dk</pre><p>Bekleme süresini Python hesaplasın: önünde 6 kişi var ve kişi başı işlem 3 dakika.</p>',
        sol: 'print("Şube: Konak", "Sıradaki: 42", "Tahmini bekleme: " + str(6 * 3) + " dk", sep="\\n")\n',
        tests: 'assert __source__.count("print(") == 1, "Kodda yalnızca bir print çağrısı olmalı"\nassert "6 * 3" in __source__ or "6*3" in __source__, "Bekleme süresini 6 * 3 ile hesaplat"\n',
        expect: 'Şube: Konak\nSıradaki: 42\nTahmini bekleme: 18 dk\n',
        hints: ['Satır sonu da bir karakterdir: "\\n".', 'sep parametresine "\\n" verirsen her değer ayrı satıra yazılır.', 'Son satır için "Tahmini bekleme: " + str(6 * 3) + " dk" gibi tek bir metin oluştur.'],
        why: 'sep="\\n" değerlerin arasına satır sonu koyar; böylece tek print birden çok satır üretir. Hesaplanan sayıyı metnin ortasına yerleştirmek için str() ile çevirip + ile birleştirmen gerekir. İleride aynı işi f-string ile çok daha temiz yapacaksın.'
      }
    ],
    faq: [
      {
        q: 'Python yavaş bir dil mi? İşte kullanmak sorun olur mu?',
        a: 'Saf Python döngüleri C ya da Java\'ya göre yavaştır. Ama iş hayatındaki darboğaz çoğunlukla ağ, disk ve veritabanıdır; ayrıca pandas, numpy gibi kütüphanelerin ağır işi C ile yazılmıştır. Geliştirme hızı çoğu projede çalışma hızından daha değerlidir. Gerçekten hız gereken küçük bir bölüm varsa o kısım optimize edilir ya da başka bir dilde yazılır.'
      },
      {
        q: 'Bugün öğrendiğim Python birkaç yıl sonra eskir mi?',
        a: 'Hayır. Python 3 ailesi 2008\'den beri geriye dönük uyumluluğa çok önem verir; her yıl çıkan yeni sürüm yeni özellikler ekler ama mevcut kodu nadiren bozar. Bu kursta öğrendiğin temel söz dizimi ve standart kütüphane yıllarca geçerli kalır; yalnızca yeni kolaylıklar eklenir.'
      }
    ],
    mistakes: [
      {
        bad: '  print("Merhaba")',
        good: 'print("Merhaba")',
        why: 'Python\'da girinti söz diziminin parçasıdır. Satır başındaki gereksiz boşluk IndentationError: unexpected indent verir; en dıştaki satırlar sütun 0\'dan başlamalıdır.'
      },
      {
        bad: 'print(\'Anadolu Market\'te indirim\')',
        good: 'print("Anadolu Market\'te indirim")',
        why: 'Tek tırnakla açılan metin, içindeki ilk kesme işaretinde kapanır ve geri kalanı SyntaxError olur. Metinde kesme işareti varsa dışta çift tırnak kullan.'
      }
    ]
  }
);
})(window);
