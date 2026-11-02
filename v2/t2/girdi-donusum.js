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
