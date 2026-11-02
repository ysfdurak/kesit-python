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
      o: ['True, çünkü matematiksel olarak eşittir', 'False, çünkü ondalık sayılar ikilik tabanda tam saklanamaz', 'Hata verir', 'True, çünkü Python otomatik yuvarlar'], a: 1,
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
      q: '<p><code>indirimli_fiyat(fiyat, yuzde)</code> fonksiyonu yaz: yüzde cinsinden verilen indirimi (örneğin 15 → %15) uygulayıp sonucu 2 basamağa yuvarlayarak döndürsün. Örnek: <code>indirimli_fiyat(1499.90, 15)</code> → <code>1274.92</code>.</p>',
      start: 'def indirimli_fiyat(fiyat, yuzde):\n    pass\n',
      sol: 'def indirimli_fiyat(fiyat, yuzde):\n    return round(fiyat * (1 - yuzde / 100), 2)\n',
      tests: 'assert abs(indirimli_fiyat(1499.90, 15) - 1274.92) < 1e-6, "1499.90, %15 -> 1274.92"\nassert abs(indirimli_fiyat(200, 50) - 100.0) < 1e-6, "200, %50 -> 100.0"\nassert abs(indirimli_fiyat(80, 0) - 80.0) < 1e-6, "indirim 0 ise fiyat aynı"\n',
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
      tests: 'assert bas_harf_buyut("ayşe YILMAZ") == "Ayşe YILMAZ", "ilk harf büyük, gerisi aynı"\nassert bas_harf_buyut("izmir") == "İzmir", "i -> İ olmalı"\nassert bas_harf_buyut("Mehmet") == "Mehmet", "zaten büyükse değişmez"\n',
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
