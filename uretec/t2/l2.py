from gen import emit

body = r'''
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
'''

ex = []
ex += [
  dict(t='mc', stage='Isınma',
    q='<code>x = 5</code> ardından <code>x += 3 * 2</code> çalışınca <code>x</code> kaç olur?',
    o=['16', '11', '13', 'SyntaxError'], a=1,
    why='Artırılmış atama önce sağ tarafı tamamen hesaplar (3 * 2 = 6), sonra x = x + 6 yapar: 11. (x + 3) * 2 = 16 değildir.'),
  dict(t='mc', stage='Isınma',
    q='<code>a = [1, 2]</code> ve <code>b = [1, 2]</code> için hangisi doğrudur?',
    o=['a == b True, a is b True', 'a == b False, a is b False', 'a == b True, a is b False', 'a == b False, a is b True'], a=2,
    why='İki liste aynı değerleri taşır (== True) ama ayrı ayrı oluşturulmuş iki nesnedir (is False). is kimliği, == değeri karşılaştırır.'),
  dict(t='mc', stage='Isınma',
    q='<code>print(not 1 == 2)</code> ne yazdırır?',
    o=['False', 'True', 'TypeError', '0'], a=1,
    why='== operatörü not\'tan daha önceliklidir: not (1 == 2) = not False = True. (not 1) == 2 olarak okunmaz.'),
]
ex += [
  dict(t='predict', stage='Kodu oku', q='Bu kod ne yazdırır?',
    code='print(2 ** 3 ** 2, -2 ** 2)\n',
    o=['64 4', '512 -4', '64 -4', '512 4'], a=1,
    why='** sağdan sola birleşir: 3 ** 2 = 9, sonra 2 ** 9 = 512. Ayrıca ** tekli eksiden önceliklidir: -(2 ** 2) = -4.'),
  dict(t='predict', stage='Kodu oku', q='Bu kod ne yazdırır?',
    code='ad = ""\nindirim = 0\nprint(ad or "misafir", indirim and 100 / indirim, [] or None)\n',
    o=['misafir 0 None', 'misafir False None', 'True 0 []', 'ZeroDivisionError'], a=0,
    why='or ilk truthy değeri döndürür ("misafir"); and ilk falsy değerde durur ve onu döndürür (0), 100 / 0 hiç çalışmaz. [] or None ikisi de falsy olduğundan sonuncuyu verir: None.'),
  dict(t='predict', stage='Kodu oku', q='Bu kod ne yazdırır?',
    code='print(-7 // 2, -7 % 2, 7 % -3)\n',
    o=['-3 -1 1', '-4 1 1', '-3 1 -2', '-4 1 -2'], a=3,
    why='// aşağıya (eksi sonsuza) yuvarlar: -3.5 → -4. % bölenin işaretini alır: -7 % 2 = 1 (çünkü -4*2 + 1 = -7), 7 % -3 = -2 (çünkü -3*-3 + -2 = 7).'),
  dict(t='order', stage='Kodu oku',
    q='<p>Bir kullanıcıya önce okuma ve yazma izni verip sonra yazma iznini kaldıran, son durumda silme izni olmadığını gösteren programı sırala. Çıktı <code>1</code> ve <code>False</code> olmalı.</p>',
    lines=['OKU, YAZ, SIL = 1, 2, 4', 'izin = OKU | YAZ', 'izin &= ~YAZ', 'print(izin)', 'print(izin & SIL == SIL)'],
    expect='1\nFalse\n',
    hint='Sabitler önce tanımlanmalı; izin kaldırmak için önce izin verilmiş olmalı.',
    why='| bit ekler (1 | 2 = 3), &= ~YAZ ilgili biti sıfırlar (3 & ~2 = 1). & işlemi == den önce yapılır: (1 & 4) == 4 → False.'),
]
ex += [
  dict(t='code', id='operatorler-1', stage='Rehberli', diff=1,
    q='<p>Anadolu Market kargo kuralı: Sepet tutarı <b>500 TL\'den fazla</b> ise <b>ve</b> müşteri premium <b>ya da</b> kampanya kodu girmişse kargo bedava. <code>kargo_bedava_mi(tutar, premium, kampanya_kodu)</code> fonksiyonu <b>bool</b> döndürsün. <code>kampanya_kodu</code> bir metindir; boş metin "kod girilmedi" demektir.</p>',
    guide=['Tutar koşulunu yaz: tutar > 500.', 'Kod girilmiş mi: kampanya_kodu != "" (ya da bool(kampanya_kodu)).', 'premium or kod koşulunu PARANTEZ içine al.', 'İki parçayı and ile bağla ve sonucu bool olarak döndür.'],
    example='def yemek_karti_gecerli(gun, tatil, izinli):\n    # hafta içi VE (tatil değil YA DA izinli değil) gibi karışık kural\n    return gun < 5 and (not tatil or not izinli)\n\nprint(yemek_karti_gecerli(2, False, True))\nprint(yemek_karti_gecerli(6, False, False))\n',
    start='def kargo_bedava_mi(tutar, premium, kampanya_kodu):\n    # TODO: and ile or\'u karıştırma; parantezi unutma\n    return tutar > 500 and premium or kampanya_kodu\n',
    sol='def kargo_bedava_mi(tutar, premium, kampanya_kodu):\n    return tutar > 500 and (premium or kampanya_kodu != "")\n',
    tests='assert kargo_bedava_mi(750, True, "") is True, "750 TL premium: bedava"\nassert kargo_bedava_mi(750, False, "KARGO50") is True, "750 TL kampanya kodlu: bedava"\nassert kargo_bedava_mi(300, False, "KARGO50") is False, "300 TL kodlu olsa bile bedava DEĞİL: and, or\'dan önce bağlar; parantez gerekli"\nassert kargo_bedava_mi(750, False, "") is False, "Ne premium ne kod: bedava değil"\nassert kargo_bedava_mi(500, True, "") is False, "Tam 500 \'fazla\' değildir"\n',
    hints=['and, or\'dan daha önceliklidir: a and b or c → (a and b) or c.', 'Sonucun bool olması için metni doğrudan döndürme; kampanya_kodu != "" karşılaştırması bool üretir.', 'return tutar > 500 and (premium or kampanya_kodu != "")'],
    why='and/or önceliği iş kurallarında en sık hata kaynağıdır. Parantez kuralın anlamını açıkça yazar. Karşılaştırma kullanmak da sonucun her zaman True/False olmasını sağlar; or\'un metin döndürmesini engeller.'),
  dict(t='code', id='operatorler-2', stage='Rehberli', diff=2,
    q='<p>Anadolu Bank yetki sistemi: <code>GORUNTULE=1</code>, <code>HAVALE=2</code>, <code>ONAY=4</code>, <code>LIMIT=8</code>. Üç fonksiyon yaz:</p><ul><li><code>izin_ekle(mevcut, izin)</code> → izni eklenmiş sayı</li><li><code>izin_kaldir(mevcut, izin)</code> → izni kaldırılmış sayı (izin yoksa sayı değişmez)</li><li><code>izin_var_mi(mevcut, izin)</code> → <b>bool</b>; birden fazla bit verilirse <b>hepsi</b> olmalı</li></ul>',
    guide=['Eklemek için bit VEYA (|) kullan.', 'Kaldırmak için iznin tümleyeniyle (~izin) bit VE (&) yap.', 'Kontrol için (mevcut & izin) == izin karşılaştırmasını döndür.', 'Sabitleri dosyanın başında tanımla.'],
    example='KALIN, ITALIK, ALTI_CIZILI = 1, 2, 4\nstil = KALIN | ALTI_CIZILI\nprint(stil, (stil & ITALIK) == ITALIK)\nstil = stil & ~KALIN\nprint(stil)\n',
    start='GORUNTULE, HAVALE, ONAY, LIMIT = 1, 2, 4, 8\n\ndef izin_ekle(mevcut, izin):\n    # TODO: bit VEYA\n    return mevcut + izin\n\ndef izin_kaldir(mevcut, izin):\n    # TODO: bit VE ve tümleyen\n    return mevcut - izin\n\ndef izin_var_mi(mevcut, izin):\n    # TODO: tüm bitler var mı?\n    return bool(mevcut & izin)\n',
    sol='GORUNTULE, HAVALE, ONAY, LIMIT = 1, 2, 4, 8\n\ndef izin_ekle(mevcut, izin):\n    return mevcut | izin\n\ndef izin_kaldir(mevcut, izin):\n    return mevcut & ~izin\n\ndef izin_var_mi(mevcut, izin):\n    return (mevcut & izin) == izin\n',
    tests='assert izin_ekle(GORUNTULE, HAVALE) == 3, "1 | 2 = 3"\nassert izin_ekle(3, HAVALE) == 3, "Var olan izni tekrar eklemek sayıyı değiştirmemeli (+ kullanırsan 5 olur)"\nassert izin_kaldir(3, HAVALE) == 1, "3 içinden HAVALE çıkınca 1"\nassert izin_kaldir(1, ONAY) == 1, "Olmayan izni kaldırmak sayıyı değiştirmemeli (- kullanırsan -3 olur)"\nassert izin_var_mi(7, HAVALE | ONAY) is True, "7 hem HAVALE hem ONAY içerir"\nassert izin_var_mi(3, HAVALE | ONAY) is False, "3 ONAY içermez: birden fazla bitte HEPSİ olmalı"\nassert izin_var_mi(0, GORUNTULE) is False, "0 hiçbir izin içermez"\n',
    hints=['Aritmetik + ve - bit işlemleri gibi davranmaz: aynı izni iki kez eklemek sayıyı bozar.', 'Tümleyen ~izin, o bit hariç tüm bitleri 1 yapar; & ile maske gibi kullanılır.', 'Kontrol: return (mevcut & izin) == izin'],
    why='Bit operatörleri izinleri birbirinden bağımsız açıp kapatır: | tekrar eklemede idempotenttir, & ~ olmayan izni kaldırmada sorun çıkarmaz. (m & i) == i birden fazla bitin hepsini birden doğrular.'),
  dict(t='code', id='operatorler-3', stage='Rehberli', diff=1,
    q='<p>Raporlarda müşterinin görünen adı şöyle seçilir: takma ad varsa o; yoksa gerçek ad; o da yoksa e-postanın <code>@</code> öncesi; hiçbiri yoksa <code>"anonim"</code>. <code>gorunen_ad(takma_ad, ad, eposta)</code> fonksiyonunu <code>or</code> zinciriyle yaz. Boş metin "yok" demektir; adlar baş/son boşluklardan kırpılmalı.</p>',
    guide=['Her metni .strip() ile kırp.', 'E-postanın @ öncesi için eposta.split("@")[0] kullan (eposta boşsa da "" döner).', 'Değerleri öncelik sırasıyla or ile bağla.', 'Zincirin sonuna "anonim" koy.'],
    example='def iletisim(cep, ev, is_tel):\n    return cep.strip() or ev.strip() or is_tel.strip() or "telefon yok"\n\nprint(iletisim("", " 0232 111 ", ""))\nprint(iletisim("", "", ""))\n',
    start='def gorunen_ad(takma_ad, ad, eposta):\n    # TODO: or zinciri ile ilk dolu değeri seç\n    kullanici = eposta.split("@")[0]\n    return takma_ad\n',
    sol='def gorunen_ad(takma_ad, ad, eposta):\n    kullanici = eposta.strip().split("@")[0]\n    return takma_ad.strip() or ad.strip() or kullanici or "anonim"\n',
    tests='assert gorunen_ad("aysem", "Ayşe Kaya", "ayse@ornek.com") == "aysem", "Takma ad öncelikli"\nassert gorunen_ad("", "Ayşe Kaya", "ayse@ornek.com") == "Ayşe Kaya", "Takma ad boşsa gerçek ad"\nassert gorunen_ad("   ", "", "mehmet.y@ornek.com") == "mehmet.y", "Yalnız boşluk da boş sayılır; e-posta öneki dönmeli"\nassert gorunen_ad("", "", "") == "anonim", "Hiçbiri yoksa anonim"\n',
    hints=['or ilk truthy değeri döndürür; boş metin falsy\'dir.', '"   ".strip() boş metin verir.', 'return takma_ad.strip() or ad.strip() or kullanici or "anonim"'],
    why='or zinciri "ilk dolu değeri seç" kalıbının en kısa yazımıdır. Değerler metin olduğu ve 0 gibi geçerli-ama-falsy bir değer olmadığı için burada güvenlidir.'),
  dict(t='code', id='operatorler-4', stage='Rehberli', diff=2,
    q='<p>Depodan gelen ürün kodları düzensiz boşluklar içeriyor. <code>uzun_kodlar(kodlar, esik)</code> fonksiyonu, kırpılmış uzunluğu <code>esik</code> veya daha fazla olan kodları <code>(kirpilmis_kod, uzunluk)</code> demetleri listesi olarak döndürsün. Uzunluğu yalnız <b>bir kez</b> hesaplamak için list comprehension içinde <b>mors operatörü</b> <code>:=</code> kullan (test kodunda <code>:=</code> arıyor).</p>',
    guide=['Comprehension iskeleti: [(...) for k in kodlar if ...].', 'Koşulda kırpılmış metni ve uzunluğu mors ile yakala: (t := k.strip()).', 'Uzunluğu da yakala: (n := len(t)) >= esik — parantezi unutma.', 'Sonuç kısmında t ve n\'yi kullan.'],
    example='fiyatlar = ["12.5", "abc", "7", ""]\n# Değeri bir kez dönüştür, hem filtrele hem kullan\ntemiz = [f for s in fiyatlar if (f := s.strip()) and f.replace(".", "").isdigit()]\nprint(temiz)\n',
    start='def uzun_kodlar(kodlar, esik):\n    sonuc = []\n    for k in kodlar:\n        # TODO: bunu mors (:=) kullanan tek bir comprehension\'a çevir\n        if len(k.strip()) > esik:\n            sonuc.append((k.strip(), len(k.strip())))\n    return sonuc\n',
    sol='def uzun_kodlar(kodlar, esik):\n    return [(t, n) for k in kodlar if (n := len(t := k.strip())) >= esik]\n',
    tests='assert ":=" in __source__, "Mors operatörü := kullanılmalı"\nkodlar = ["  AM-417 ", "AM-9", " AM-10022  ", ""]\nassert uzun_kodlar(kodlar, 6) == [("AM-417", 6), ("AM-10022", 8)], "Eşik dahil (>=) olmalı ve kodlar kırpılmalı"\nassert uzun_kodlar(kodlar, 9) == [], "9 karakterlik kod yok"\nassert uzun_kodlar([], 1) == [], "Boş liste boş döner"\n',
    hints=['Mors ifadesi bir değer döndürür; o değeri başka bir ifadenin içinde kullanabilirsin.', 'İç içe mors: len(t := k.strip()) önce t\'yi atar sonra uzunluğu hesaplar.', 'Koşul: if (n := len(t := k.strip())) >= esik'],
    why='Mors operatörü, comprehension içinde aynı hesabı iki kez yapmaktan kurtarır. Önceliği en düşük olduğu için (n := ...) >= esik parantezi zorunludur; yoksa n\'ye karşılaştırmanın bool sonucu atanır.'),
]
ex += [
  dict(t='code', id='operatorler-5', stage='Kendin yaz', diff=1,
    q='<p>Vardiya planlamada gün numaraları <code>0=Pzt ... 6=Paz</code>. <code>gun_kaydir(gun, kaydirma)</code> fonksiyonu, verilen günden <code>kaydirma</code> kadar ileri (negatifse geri) gidince hangi günün adı geldiğini döndürsün. Gün adları: <code>["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"]</code>. Kaydırma çok büyük ya da negatif olabilir; if kullanmadan <code>%</code> ile çöz.</p>',
    start='GUNLER = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"]\n\ndef gun_kaydir(gun, kaydirma):\n    pass\n',
    sol='GUNLER = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"]\n\ndef gun_kaydir(gun, kaydirma):\n    return GUNLER[(gun + kaydirma) % 7]\n',
    tests='assert gun_kaydir(0, 2) == "Çar", "Pzt + 2 = Çar"\nassert gun_kaydir(5, 2) == "Pzt", "Cmt + 2 haftayı sarar: Pzt"\nassert gun_kaydir(1, -3) == "Cmt", "Sal - 3 = Cmt: Python\'da % negatifte de 0..6 verir"\nassert gun_kaydir(2, 700) == "Çar", "700 gün = 100 hafta: aynı gün"\nassert gun_kaydir(0, -15) == "Paz", "Pzt - 15 = Paz"\n',
    hints=['(gun + kaydirma) % 7 her zaman 0 ile 6 arasındadır (bölen pozitifken).', 'Python\'da -2 % 7 == 5; C/Java\'daki gibi negatif çıkmaz.', 'return GUNLER[(gun + kaydirma) % 7]'],
    why='Python\'un % operatörü bölenin işaretini aldığı için döngüsel indekslemede (gün, saat, dairesel tampon) negatif kaydırmalar bile ek kontrol gerektirmez.'),
  dict(t='code', id='operatorler-6', stage='Kendin yaz', diff=2,
    q='<p>Web sitesinin tema rengi <code>0xRRGGBB</code> biçiminde tek bir tam sayı olarak saklanıyor (ör. <code>0x1E90FF</code>). İki fonksiyon yaz:</p><ul><li><code>rgb_ayir(renk)</code> → <code>(r, g, b)</code> demeti (her biri 0-255)</li><li><code>rgb_birlestir(r, g, b)</code> → tek tam sayı</li></ul><p>Yalnızca bit operatörleri (<code>&gt;&gt;</code>, <code>&lt;&lt;</code>, <code>&amp;</code>, <code>|</code>) kullan; metne çevirme.</p>',
    start='def rgb_ayir(renk):\n    pass\n\ndef rgb_birlestir(r, g, b):\n    pass\n',
    sol='def rgb_ayir(renk):\n    r = (renk >> 16) & 0xFF\n    g = (renk >> 8) & 0xFF\n    b = renk & 0xFF\n    return (r, g, b)\n\ndef rgb_birlestir(r, g, b):\n    return (r << 16) | (g << 8) | b\n',
    tests='assert rgb_ayir(0x1E90FF) == (30, 144, 255), "0x1E90FF -> (30, 144, 255)"\nassert rgb_ayir(0x000000) == (0, 0, 0), "Siyah"\nassert rgb_ayir(0xFF0000) == (255, 0, 0), "Kırmızı"\nassert rgb_birlestir(30, 144, 255) == 0x1E90FF, "Birleştirme ayırmanın tersi olmalı"\nassert rgb_birlestir(*rgb_ayir(0xABCDEF)) == 0xABCDEF, "Gidiş-dönüş aynı rengi vermeli"\nassert "str(" not in __source__ and "hex(" not in __source__, "Metne çevirmeden, bit operatörleriyle çöz"\n',
    hints=['Her renk kanalı 8 bittir; kırmızı en üstteki 8 bit.', 'Sağa 16 kaydırınca kırmızı en alta iner; & 0xFF ile yalnız alttaki 8 bit kalır.', 'Birleştirme: (r << 16) | (g << 8) | b'],
    why='Kaydırma bitleri yerine taşır, & 0xFF maskesi istenmeyen bitleri siler, | parçaları birleştirir. Bu kalıp renklerde, ağ adreslerinde ve ikili dosya biçimlerinde aynen kullanılır.'),
  dict(t='code', id='operatorler-7', stage='Kendin yaz', diff=2,
    q='<p>Denetim için iki tarih arasındaki yetki değişikliklerini raporla. Yetkiler <code>IZINLER = {"GORUNTULE": 1, "HAVALE": 2, "ONAY": 4, "LIMIT": 8}</code>. <code>degisen_izinler(eski, yeni)</code> fonksiyonu <code>{"eklenen": [...], "kaldirilan": [...]}</code> döndürsün; listeler <code>IZINLER</code> sözlüğündeki sırayla izin adlarını içersin. Değişen bitleri bulmak için <code>^</code> (XOR) kullan.</p>',
    start='IZINLER = {"GORUNTULE": 1, "HAVALE": 2, "ONAY": 4, "LIMIT": 8}\n\ndef degisen_izinler(eski, yeni):\n    pass\n',
    sol='IZINLER = {"GORUNTULE": 1, "HAVALE": 2, "ONAY": 4, "LIMIT": 8}\n\ndef degisen_izinler(eski, yeni):\n    fark = eski ^ yeni\n    sonuc = {"eklenen": [], "kaldirilan": []}\n    for ad, bit in IZINLER.items():\n        if fark & bit:\n            if yeni & bit:\n                sonuc["eklenen"].append(ad)\n            else:\n                sonuc["kaldirilan"].append(ad)\n    return sonuc\n',
    tests='assert degisen_izinler(0b0011, 0b0110) == {"eklenen": ["ONAY"], "kaldirilan": ["GORUNTULE"]}, "3 -> 6: ONAY eklendi, GORUNTULE kaldırıldı"\nassert degisen_izinler(5, 5) == {"eklenen": [], "kaldirilan": []}, "Değişiklik yoksa iki liste de boş"\nassert degisen_izinler(0, 15) == {"eklenen": ["GORUNTULE", "HAVALE", "ONAY", "LIMIT"], "kaldirilan": []}, "Hepsi eklendi"\nassert "^" in __source__, "XOR (^) kullanılmalı"\n',
    hints=['eski ^ yeni, yalnız değişen bitlerde 1 olan bir sayı verir.', 'Değişen bir bit yeni\'de 1 ise eklenmiş, 0 ise kaldırılmıştır.', 'for ad, bit in IZINLER.items(): if fark & bit: ...'],
    why='XOR "farklı olan bitleri" bulmanın en doğrudan yoludur. Ardından yeni değere bakarak değişimin yönü (ekleme/kaldırma) anlaşılır. Sözlük sırası Python 3.7+\'ta korunur.'),
  dict(t='code', id='operatorler-8', stage='Kendin yaz', diff=1,
    q='<p>İK performans notlandırması: <code>kademe(puan)</code> fonksiyonu 0-100 arası puan için harf döndürsün: <code>90 ≤ p ≤ 100 → "A"</code>, <code>75 ≤ p &lt; 90 → "B"</code>, <code>60 ≤ p &lt; 75 → "C"</code>, <code>0 ≤ p &lt; 60 → "D"</code>. Aralık dışındaki puanda <code>ValueError</code> fırlat. Her koşulu <b>zincirleme karşılaştırma</b> ile yaz.</p>',
    start='def kademe(puan):\n    pass\n',
    sol='def kademe(puan):\n    if 90 <= puan <= 100:\n        return "A"\n    if 75 <= puan < 90:\n        return "B"\n    if 60 <= puan < 75:\n        return "C"\n    if 0 <= puan < 60:\n        return "D"\n    raise ValueError(f"Geçersiz puan: {puan}")\n',
    tests='assert [kademe(p) for p in (100, 90, 89.5, 75, 74, 60, 59, 0)] == ["A", "A", "B", "B", "C", "C", "D", "D"], "Sınırlar: 90 A, 75 B, 60 C dahil"\ntry:\n    kademe(101)\n    assert False, "101 için ValueError beklenirdi"\nexcept ValueError:\n    pass\ntry:\n    kademe(-1)\n    assert False, "-1 için ValueError beklenirdi"\nexcept ValueError:\n    pass\n',
    hints=['Zincirleme: 75 <= puan < 90 tek ifadede iki sınırı birden denetler.', 'Hiçbir aralığa uymayan puan en sona düşer; orada raise ValueError(...) yaz.', 'Sınırlarda dahil/hariç ayrımına dikkat: 90 A\'dır, B değil.'],
    why='Zincirleme karşılaştırma aralık kontrolünü matematikteki gibi okunur yazar ve her sınırı açıkça gösterir. Aralık dışını sessizce "D" yapmak yerine hata fırlatmak, bozuk veriyi erken yakalar.'),
]
ex += [
  dict(t='code', id='operatorler-9', stage='Hata avı', kind='bug', diff=1,
    q='<p><b>Hatayı bul ve düzelt.</b> <code>bolge_indirimi(sehir)</code> yalnızca İzmir ve Ankara için 0.10, diğer şehirler için 0 döndürmeli. Mevcut kod her şehre indirim veriyor.</p>',
    start='def bolge_indirimi(sehir):\n    if sehir == "İzmir" or "Ankara":\n        return 0.10\n    return 0\n',
    sol='def bolge_indirimi(sehir):\n    if sehir in ("İzmir", "Ankara"):\n        return 0.10\n    return 0\n',
    tests='assert bolge_indirimi("İzmir") == 0.10, "İzmir indirimli"\nassert bolge_indirimi("Ankara") == 0.10, "Ankara indirimli"\nassert bolge_indirimi("Bursa") == 0, "Bursa indirimsiz olmalı; or \'Ankara\' her zaman truthy\'dir"\nassert bolge_indirimi("") == 0, "Boş şehir indirimsiz"\n',
    hints=['Koşulu öncelik tablosuyla oku: (sehir == "İzmir") or ("Ankara").', 'Boş olmayan metin her zaman truthy\'dir; or ifadesi bu yüzden hep doğru çıkar.', 'Üyelik operatörü: sehir in ("İzmir", "Ankara")'],
    why='or iki tarafı ayrı ayrı değerlendirir; "Ankara" kendi başına truthy olduğu için koşul hep True olur. Doğrusu her tarafı tam yazmak (sehir == "İzmir" or sehir == "Ankara") ya da in ile tek seferde sormaktır.'),
  dict(t='code', id='operatorler-10', stage='Hata avı', kind='bug', diff=2,
    q='<p><b>Hatayı bul ve düzelt.</b> <code>limit_asildi(tutar, limit)</code>, tutar limite <b>eşit ya da büyükse</b> True döndürmeli. Testlerde küçük sayılarla doğru çalışıyor gibiydi, ama canlıda 5000 TL\'lik işlemler limiti (5000) aşmadı sanıldı. İki hata var.</p>',
    start='def limit_asildi(tutar, limit):\n    return tutar is limit or tutar > limit is True\n',
    sol='def limit_asildi(tutar, limit):\n    return tutar >= limit\n',
    tests='assert limit_asildi(int("5000"), int("5000")) is True, "5000 >= 5000 True olmalı; is kimlik karşılaştırır, değer değil"\nassert limit_asildi(int("7500"), 5000) is True, "7500 limiti aşar"\nassert limit_asildi(10, 10) is True, "Küçük sayılarda da eşitlik True"\nassert limit_asildi(4999, 5000) is False, "4999 aşmaz"\n',
    hints=['is iki adın aynı nesne olup olmadığını sorar. Küçük tam sayılar (-5..256) önbellekte olduğu için tesadüfen çalışır.', 'tutar > limit is True bir zincirdir: (tutar > limit) and (limit is True). limit hiçbir zaman True nesnesi değildir.', 'Tek karşılaştırma yeter: return tutar >= limit'],
    why='is değer eşitliği için kullanılmaz; Python yalnız küçük tam sayıları önbelleğe aldığından hata sadece büyük tutarlarda ortaya çıkar. "x > y is True" ise karşılaştırma zinciridir ve beklenmedik biçimde limit is True\'ya dönüşür.'),
]
ex += [
  dict(t='code', id='operatorler-11', stage='Meydan okuma', diff=3,
    q='<p>Eski bir lojistik cihazı tarihleri 16 bitlik tek bir sayıya sıkıştırıyor (FAT dosya sistemi biçimi): en üst 7 bit <code>yil - 1980</code>, sonraki 4 bit ay (1-12), en alttaki 5 bit gün (1-31).</p><ul><li><code>tarih_paketle(yil, ay, gun)</code> → tam sayı. Yıl 1980-2107, ay 1-12, gün 1-31 dışındaysa <code>ValueError</code>.</li><li><code>tarih_coz(paket)</code> → <code>(yil, ay, gun)</code>. Paket 0-65535 dışındaysa <code>ValueError</code>.</li></ul><p>Yalnız bit operatörleri ve zincirleme karşılaştırmalar kullan.</p>',
    start='def tarih_paketle(yil, ay, gun):\n    pass\n\ndef tarih_coz(paket):\n    pass\n',
    sol='def tarih_paketle(yil, ay, gun):\n    if not (1980 <= yil <= 2107 and 1 <= ay <= 12 and 1 <= gun <= 31):\n        raise ValueError("Geçersiz tarih")\n    return ((yil - 1980) << 9) | (ay << 5) | gun\n\ndef tarih_coz(paket):\n    if not 0 <= paket <= 0xFFFF:\n        raise ValueError("16 bit dışında")\n    yil = (paket >> 9) + 1980\n    ay = (paket >> 5) & 0b1111\n    gun = paket & 0b11111\n    return (yil, ay, gun)\n',
    tests='p = tarih_paketle(2026, 10, 28)\nassert p == (46 << 9) | (10 << 5) | 28, "Bit yerleşimi: yıl<<9 | ay<<5 | gün"\nassert tarih_coz(p) == (2026, 10, 28), "Çözme paketlemenin tersi olmalı"\nassert tarih_coz(tarih_paketle(1980, 1, 1)) == (1980, 1, 1), "Alt sınır"\nassert tarih_coz(tarih_paketle(2107, 12, 31)) == (2107, 12, 31), "Üst sınır: 7 bit yıl 127\'ye kadar"\nassert tarih_paketle(2107, 12, 31) <= 0xFFFF, "Sonuç 16 bite sığmalı"\nfor kotu in [(1979, 1, 1), (2108, 1, 1), (2000, 0, 1), (2000, 13, 1), (2000, 1, 0), (2000, 1, 32)]:\n    try:\n        tarih_paketle(*kotu)\n        assert False, f"{kotu} için ValueError beklenirdi"\n    except ValueError:\n        pass\nfor kotu in [-1, 65536]:\n    try:\n        tarih_coz(kotu)\n        assert False, f"{kotu} için ValueError beklenirdi"\n    except ValueError:\n        pass\n',
    hints=['Gün 5 bit (0-31), ay 4 bit (0-15): ay 5 bit, yıl 9 bit sola kaydırılır.', 'Çözerken önce kaydır sonra maskele: ay = (paket >> 5) & 0b1111.', 'Doğrulama: if not (1980 <= yil <= 2107 and 1 <= ay <= 12 and 1 <= gun <= 31): raise ValueError(...)'],
    why='Bit paketleme, alanların genişliklerini bilerek her alanı kendi yerine kaydırmak ve | ile birleştirmektir; çözme ise kaydırıp & maskesiyle o alanı yalıtmaktır. Zincirleme karşılaştırmalar doğrulamayı tek satırda okunur kılar. Not: "and" önce bağlar, "not" tüm parantezi tersine çevirir.'),
]

faq = [
  dict(q='and/or neden True/False yerine başka değerler döndürüyor?', a='Python bu operatörleri "kısa devre seçici" olarak tasarlamıştır: sonucu belirleyen işleneni döndürür. if içinde kullandığında fark etmez (değer zaten truthy/falsy olarak yorumlanır), ama atamada <code>ad = girdi or "Misafir"</code> gibi kısa varsayılan kalıpları mümkün kılar. Kesin bool istiyorsan <code>bool(...)</code> ile sar.'),
  dict(q='Öncelik tablosunu ezberlemem gerekiyor mu?', a='Sınav (PCEP/PCAP) için ana hatlarını bilmelisin: ** en yüksek ve sağdan, sonra tekli eksi, çarpma ailesi, toplama, karşılaştırmalar, not, and, or. Gerçek kodda ise ezberine güvenme; okuyanın da bilmesi gerekmesin diye parantez kullan.'),
  dict(q='Bit operatörlerini veri analizinde kullanacak mıyım?', a='Doğrudan sayılarda az; ama pandas ve numpy\'da <code>&amp;</code>, <code>|</code>, <code>~</code> filtrelerde çok kullanılır: <code>df[(df.tutar &gt; 500) &amp; (df.sehir == "İzmir")]</code>. Orada and/or çalışmaz ve parantezler zorunludur, çünkü &amp; karşılaştırmalardan önceliklidir.'),
  dict(q='Mors operatörünü ne zaman kullanmalıyım?', a='Bir değeri hesaplayıp hemen test ettiğin ve sonra da kullandığın yerlerde: while döngüsünde okuma (<code>while (satir := f.readline())</code>), regex eşleşmesi (<code>if (m := re.match(...))</code>), comprehension içinde pahalı hesap. Sıradan atamalarda <code>=</code> daha okunurdur.'),
]

mistakes = [
  dict(bad='if sehir == "İzmir" or "Ankara":', good='if sehir in ("İzmir", "Ankara"):', why='or her tarafı ayrı değerlendirir; boş olmayan metin her zaman truthy olduğundan koşul hep doğru çıkar.'),
  dict(bad='if tutar is 5000:', good='if tutar == 5000:', why='is kimlik karşılaştırır; değer eşitliği için == kullan. is yalnız None/True/False içindir.'),
  dict(bad='sayac++', good='sayac += 1', why='Python\'da ++ operatörü yoktur; artırılmış atama kullan.'),
  dict(bad='sonuc = -2 ** 2      # 4 beklenmiş', good='sonuc = (-2) ** 2    # 4', why='** tekli eksiden daha önceliklidir: -2 ** 2 = -(2 ** 2) = -4.'),
  dict(bad='if n := len(kodlar) > 10:\n    print(n, "kod")', good='if (n := len(kodlar)) > 10:\n    print(n, "kod")', why='Mors en düşük öncelikli operatördür; parantezsiz yazınca n\'ye karşılaştırmanın sonucu (True/False) atanır.'),
]

L = dict(id='operatorler', lv='temel', mod='Veri Türleri', min=35,
  title='Operatörler derinlemesine',
  sum='Aritmetik ve atama, zincirleme karşılaştırma, değer döndüren and/or ve kısa devre, in ve is, izin bayraklarıyla bit operatörleri, PCEP öncelik tablosu ve mors operatörü := ile ifadeleri doğru ve okunur yazarsın.',
  goals=['Artırılmış atamayı ve // ile % operatörlerini negatif sayılarda doğru kullanabilirim.',
         'Zincirleme karşılaştırma yazar, and/or\'un kısa devresini ve döndürdüğü değeri açıklayabilirim.',
         'in ile is\'i doğru yerde kullanır, == ile is farkını bilirim.',
         'Bit operatörleriyle izin bayraklarını ekler, kaldırır ve denetlerim.',
         'Öncelik tablosuna göre bir ifadenin sonucunu çalıştırmadan tahmin eder, gerekirse mors operatörünü kullanırım.'],
  body=body, ex=ex, faq=faq, mistakes=mistakes)
emit(L)
