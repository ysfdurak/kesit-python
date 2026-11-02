import sys; sys.path.insert(0, sys.path[0])
from lib import *

html = (
'<h2>print\'in tam imzası</h2>'
'<p>Şimdiye kadar <code>sep</code> ve <code>end</code> ayarlarını gördün. print\'in resmî tanımı şöyledir:</p>'
+ C('print(*degerler, sep=" ", end="\\n", file=sys.stdout, flush=False)') +
'<ul>'
'<li><b><code>*degerler</code></b>: istediğin kadar değer; her biri <code>str()</code> ile metne çevrilir. Bu yüzden <code>print("Adet:", 3)</code> hata vermez ama <code>"Adet: " + 3</code> verir.</li>'
'<li><b><code>sep</code> ve <code>end</code></b>: aradaki ve sondaki metin.</li>'
'<li><b><code>file</code></b>: çıktının nereye gideceği. Varsayılan ekran (standart çıktı, stdout); <code>sys.stderr</code> verirsen hata kanalına yazar.</li>'
'<li><b><code>flush</code></b>: çıktıyı beklemeden hemen gönderir. Uzun süren bir işte ilerleme mesajlarının gecikmeden görünmesi için kullanılır.</li>'
'</ul>'
'<p>Bir de az bilinen bir ayrıntı: print ekrana yazar ama <b>hiçbir şey döndürmez</b>; dönüş değeri <code>None</code>\'dır. "Ekrana yazmak" ile "değer üretmek" farklı şeylerdir ve fonksiyonlar dersinde bu ayrım çok önemli olacak.</p>'
+ P('''
import sys
sonuc = print("Rapor hazırlanıyor...")
print("print'in döndürdüğü:", sonuc)
print("Uyarı: 3 üründe stok kritik", file=sys.stderr)
print("Adım 1/3", end=" | ", flush=True)
print("Adım 2/3", end=" | ")
print("Adım 3/3")
''') +
'<p>Hata kanalına yazılan satır bu uygulamada farklı renkte görünebilir. Terminalde ise <code>python rapor.py &gt; rapor.txt</code> yazdığında stdout dosyaya gider, stderr ekranda kalır; böylece uyarılar rapor dosyasını kirletmez. Standart akışları Terminal temelleri dersinde ayrıntılı gördün ya da göreceksin.</p>'

'<h2>Kaçış dizileri ve çok satırlı metin</h2>'
'<p>Bir metnin içine Enter tuşuna basamazsın; bunun yerine ters eğik çizgiyle başlayan kaçış dizileri (escape sequence) kullanırsın:</p>'
+ table(['Yazım', 'Anlamı', 'Örnek çıktı'], [
    ['<code>\\n</code>', 'Yeni satır', 'Metni iki satıra böler'],
    ['<code>\\t</code>', 'Sekme (tab)', 'Sütunları hizalar'],
    ['<code>\\\\</code>', 'Tek ters eğik çizgi', '<code>C:\\raporlar</code>'],
    ['<code>\\"</code> ve <code>\\\'</code>', 'Metnin içinde tırnak', '<code>"Kahve" dedi</code>'],
    ['<code>r"..."</code>', 'Ham metin: kaçışlar işlenmez', '<code>r"C:\\yeni"</code> olduğu gibi kalır'],
    ['<code>"""..."""</code>', 'Çok satırlı metin', 'Satır sonları korunur'],
]) +
P('''
print("Ürün\\tAdet\\tTutar")
print("Kahve\\t2\\t900")
print("Çay\\t5\\t250")
print("Satır 1\\nSatır 2")
print("Klasör: C:\\\\raporlar\\\\mart")
print(r"Ham: C:\\raporlar\\nisan")
print("Müşteri \\"Kahve Makinesi\\" ürününü iade etti.")
''') +
'<div class="warn"><b>Windows yolunda gizli kaçış</b><code>"C:\\raporlar\\nisan"</code> yazarsan <code>\\n</code> bir satır sonuna, <code>\\r</code> da satır başı karakterine dönüşür ve yol bozulur. Windows yollarını ya <code>r"..."</code> ham metinle ya da düz eğik çizgiyle (<code>"C:/raporlar/nisan"</code>) yaz; Python ikisini de anlar.</div>'
'<p>Üç tırnaklı metin, makbuz ya da e-posta şablonu gibi uzun metinler için rahattır:</p>'
+ P('''
fis = """ANADOLU BANK
Şube: Konak
İşlem: Para yatırma
Tutar: 2750 TL"""
print(fis)
print("Satır sayısı:", fis.count("\\n") + 1)
''') +

'<h2>Bir programın iskeleti</h2>'
'<p>Gerçek bir betik rastgele satırlardan değil, belli bir düzenden oluşur. Bu düzeni şimdiden alışkanlık edinirsen kodun büyüdüğünde kaybolmazsın:</p>'
'<div class="steps-list"><ol>'
'<li><b>Belge dizgisi (docstring):</b> Dosyanın en üstünde, betiğin ne yaptığını anlatan üç tırnaklı metin.</li>'
'<li><b>İçe aktarmalar:</b> <code>import sys</code> gibi satırlar, hepsi en üstte.</li>'
'<li><b>Sabitler:</b> <code>KDV_ORANI = 0.20</code> gibi değişmeyecek değerler.</li>'
'<li><b>Ana akış:</b> Girdi al → hesapla → çıktı ver.</li>'
'</ol></div>'
+ P('''
"""Anadolu Bank şube makbuzu: tutar ve komisyondan net tutarı yazar."""
import sys

KOMISYON = 5          # TL, şube yönetmeliği gereği sabit
SUBE = "Konak"


def main():
    tutar = 2750
    net = tutar - KOMISYON
    print(f"Şube: {SUBE}")
    print(f"Tutar: {tutar} TL, Net: {net} TL")


if __name__ == "__main__":
    main()
''') +
'<p>Son iki satır şimdilik bir kalıp olarak kalsın: "bu dosya doğrudan çalıştırıldıysa <code>main()</code>\'i çağır" demektir. Fonksiyonları ve modülleri öğrendiğinde neden bu kadar yaygın olduğunu tam anlayacaksın.</p>'

'<h2>Hata türleri: belirti → neden → çözüm</h2>'
+ table(['Hata', 'Tipik neden', 'Çözüm'], [
    ['<code>SyntaxError</code>', 'Kapanmamış parantez/tırnak, eksik virgül', 'Python 3.10+ mesajı yeri gösterir: <code>\'(\' was never closed</code>'],
    ['<code>IndentationError</code>', 'Gereksiz ya da tutarsız girinti, sekme/boşluk karışımı', 'Hep 4 boşluk kullan; editörün girintiyi göstermesini aç'],
    ['<code>NameError</code>', 'Yazım hatası, tanımlamadan kullanma', 'Mesajdaki <code>Did you mean</code> önerisine bak'],
    ['<code>TypeError</code>', 'Uyumsuz türler: metin + sayı', '<code>int()</code>, <code>str()</code> ile çevir ya da virgüllü print'],
    ['<code>ValueError</code>', 'Tür doğru, değer uygun değil: <code>int("abc")</code>', 'Girdiyi doğrula (Girdi ve dönüşüm dersi)'],
    ['<code>ZeroDivisionError</code>', 'Sıfıra bölme', 'Böleni önce kontrol et'],
]) +
'<p>Python hata verdiğinde basılan traceback, çağrı zincirini yukarıdan aşağı listeler. Aşağıdaki örnekte hata bir fonksiyonun içinde çıkıyor:</p>'
+ O('''
Traceback (most recent call last):
  File "makbuz.py", line 9, in <module>
    main()
  File "makbuz.py", line 6, in main
    print("Net:", tutar - komisyn)
                          ^^^^^^^
NameError: name 'komisyn' is not defined. Did you mean: 'komisyon'?
''') +
'<p>Okuma sırası: <b>en alttan başla</b> (hatanın türü ve önerisi), sonra hemen üstündeki dosya-satır bilgisine bak (hata 6. satırda, <code>main</code> içinde), en üstteki satırlar ise oraya nasıl gelindiğini gösterir. <code>^^^^</code> işaretleri sorunlu ifadenin altını çizer.</p>'
'<div class="tip"><b>Hata mesajını aramadan önce</b>Son satırı olduğu gibi kopyalayıp aramak işe yarar, ama önce kendin oku. Değişken adlarını ve dosya yollarını içeren kısmı çıkarıp yalnız hata kalıbını aramak (<code>"was never closed"</code> gibi) daha isabetli sonuç verir; şirket kodunu ya da müşteri verisini asla dış bir siteye yapıştırma.</div>'

'<div class="note"><b>Gerçek işte</b>Kurumsal betiklerde print yerini yavaş yavaş <code>logging</code> modülüne bırakır: her mesajın zamanı, seviyesi (INFO, WARNING, ERROR) olur ve dosyaya yazılır. Ama ilk taslakta, hızlı hata ayıklamada ve küçük araçlarda print hâlâ herkesin ilk aracıdır. İyi bir alışkanlık: kullanıcıya gösterilecek sonucu stdout\'a, uyarı ve hataları <code>file=sys.stderr</code> ile hata kanalına yaz; gece çalışan işlerde ilerleme mesajlarına <code>flush=True</code> ekle ki log dosyası anında güncellensin.</div>'
)

ex = [
    dict(t='mc', stage='Isınma',
         q='Şu satır çalıştırılınca hangi hata oluşur?<br><code>&nbsp;&nbsp;&nbsp;&nbsp;print("Makbuz")</code> (satırın başında 4 boşluk var, üstünde başka satır yok)',
         o=['<code>NameError</code>, çünkü boşluklar bir değişken adı sayılır', '<code>IndentationError</code>, çünkü beklenmeyen bir girinti var', '<code>TypeError</code>, çünkü boşluk metinle toplanmaz', 'Hata olmaz; Python baştaki boşlukları her zaman yok sayar'],
         a=1,
         why='Python\'da girinti söz diziminin parçasıdır; bir bloğun içinde olmayan satır sütun 0\'dan başlamalıdır. Gereksiz girinti "IndentationError: unexpected indent" verir ve program hiç çalışmaz.'),
    dict(t='predict', stage='Kodu oku', q='Bu kod ne yazdırır?',
         code='print("A", "B", sep="")\nprint("C", end="")\nprint("D")\n',
         o=['AB\nCD', 'A B\nC\nD', 'AB\nC\nD', 'AB CD'], a=0,
         why='sep="" A ile B\'yi bitişik yazar. end="" satır sonunu kaldırdığı için D, C\'nin hemen yanına yazılır.'),
    dict(t='predict', stage='Kodu oku', q='Bu kod ne yazdırır?',
         code='x = print("Merhaba")\nprint(x)\n',
         o=['Merhaba\nMerhaba', 'Merhaba\nNone', 'None', 'Merhaba'], a=1,
         why='İlk satırdaki print ekrana Merhaba yazar ama geriye değer döndürmez; dönüş değeri None\'dır ve x\'e o atanır. İkinci print None\'ı yazar.'),
    dict(t='predict', stage='Kodu oku', q='Bu kod ne yazdırır?',
         code='print("Satır 1\\nSatır 2")\nprint(r"Satır 1\\nSatır 2")\n',
         o=['Satır 1\nSatır 2\nSatır 1\\nSatır 2', 'Satır 1\nSatır 2\nSatır 1\nSatır 2', 'Satır 1\\nSatır 2\nSatır 1\\nSatır 2', 'Satır 1\\nSatır 2\nSatır 1\nSatır 2'], a=0,
         why='Normal metinde \\n yeni satıra dönüşür. Önüne r konmuş ham metinde kaçış dizileri işlenmez; ters eğik çizgi ve n olduğu gibi yazılır.'),
    dict(t='order', stage='Kodu oku',
         q='<p>Kasiyer adet ve birim fiyatı giriyor (girdi sırası: önce adet <code>3</code>, sonra fiyat <code>250</code>). Program KDV dahil toplamı yazmalı. Satırları doğru sıraya koy.</p>',
         lines=['adet = int(input("Adet: "))', 'fiyat = float(input("Fiyat: "))', 'ara_toplam = adet * fiyat', 'kdv = ara_toplam * 0.20', 'print(adet, "adet, KDV dahil:", ara_toplam + kdv)'],
         stdin=['3', '250'],
         tests='assert adet == 3 and isinstance(adet, int), "İlk girdi (3) adet olmalı ve int\'e çevrilmeli"\nassert fiyat == 250.0, "İkinci girdi (250) fiyat olmalı"\nassert kdv == 150.0, "KDV ara toplamın %20\'si olmalı"\n',
         hint='input çağrıları girdileri sırayla alır: ilk input adeti, ikincisi fiyatı okumalı.',
         why='Girdi sırası programdaki input sırasını belirler. Ara toplam iki girdiye, KDV ara toplama bağlıdır; print hepsini kullandığı için en sonda gelir.'),
    dict(t='code', stage='Rehberli', diff=1,
         q='<p>Anadolu Bank makbuzunu yazdır. Çıktı tam olarak şöyle olmalı (ilk satırdaki tarih tek print ile, <code>sep</code> kullanılarak; ikinci satır <code>end</code> ile iki ayrı print\'ten oluşmalı):</p><pre class="out">14.03.2025\nTutar: 2750 TL\n==========</pre>',
         guide=['İlk print\'e "14", "03", "2025" değerlerini ver ve sep="." ekle.', 'İkinci satırın ilk parçası: print("Tutar:", end=" ") — satır sonu yerine boşluk koyar.', 'Ardından print(2750, "TL") aynı satıra devam eder.', 'Son satırda "=" * 10 ile çizgi çek.'],
         example='print("09", "30", sep=":")\nprint("Durum:", end=" ")\nprint("açık")\n',
         start='# TODO: tarihi sep ile yazdır\nprint("14", "03", "2025")\n# TODO: tutarı end kullanarak iki print ile yazdır\n# TODO: çizgiyi çek\n',
         sol='print("14", "03", "2025", sep=".")\nprint("Tutar:", end=" ")\nprint(2750, "TL")\nprint("=" * 10)\n',
         expect='14.03.2025\nTutar: 2750 TL\n==========\n',
         tests='assert "sep" in __source__ and "end" in __source__, "Görevde sep ve end kullanılmalı"\n',
         hints=['sep değerlerin arasına, end satırın sonuna eklenir.', 'end=" " ile bir sonraki print aynı satırdan devam eder.', 'Çizgi için "=" * 10.'],
         why='sep ve end print\'in iki temel ayarıdır. end=" " satır sonunu boşlukla değiştirdiği için sonraki print aynı satıra yazar; bu, bir satırı parça parça oluşturmanın yoludur.'),
    dict(t='code', stage='Rehberli', diff=1,
         q='<p>Gece çalışan rapor betiği sonucu ekrana (stdout), uyarıyı ise hata kanalına (stderr) yazmalı ki rapor dosyası temiz kalsın. Şu üç satırı üret:</p><ul><li>stdout: <code>Rapor hazır</code></li><li>stderr: <code>Uyarı: 3 üründe stok kritik</code></li><li>stdout: <code>Toplam: 1250</code> (1250\'yi <code>500 + 750</code> ile hesaplat)</li></ul>',
         guide=['sys modülünü içe aktar.', 'Normal print ile "Rapor hazır" yaz.', 'Uyarı satırında print\'e file=sys.stderr ekle.', 'Son satırda toplamı hesaplatarak yazdır.'],
         example='import sys\nprint("İşlem tamam")\nprint("Not: 2 kayıt atlandı", file=sys.stderr)\n',
         start='# TODO: sys modülünü içe aktar\nprint("Rapor hazır")\n# TODO: uyarıyı hata kanalına yönlendir\nprint("Uyarı: 3 üründe stok kritik")\nprint("Toplam:", 500 + 750)\n',
         sol='import sys\nprint("Rapor hazır")\nprint("Uyarı: 3 üründe stok kritik", file=sys.stderr)\nprint("Toplam:", 500 + 750)\n',
         expect='Rapor hazır\nToplam: 1250\n',
         tests='assert "sys.stderr" in __source__, "Uyarı file=sys.stderr ile yazılmalı"\n',
         hints=['print\'in file parametresi çıktının gideceği yeri belirler.', 'Önce import sys yazmalısın.', 'print("Uyarı: ...", file=sys.stderr)'],
         why='stderr\'e yazılan satır standart çıktıda görünmez; bu yüzden beklenen çıktıda yalnızca iki satır var. Terminalde > ile yönlendirme yapınca uyarı ekranda kalır, rapor dosyası temiz olur.'),
    dict(t='code', stage='Rehberli', diff=2,
         q='<p>Hata kayıtlarını özetleyen bir araç yazıyorsun. <code>hata_turu(satir)</code> fonksiyonu traceback\'in son satırını alıp yalnızca hata türünü döndürsün:</p><ul><li><code>"NameError: name \'tutr\' is not defined"</code> → <code>"NameError"</code></li><li><code>"  ZeroDivisionError: division by zero\\n"</code> → <code>"ZeroDivisionError"</code></li><li>İki nokta yoksa (<code>"KeyboardInterrupt"</code>) metnin kendisini temizleyip döndür.</li></ul>',
         guide=['Önce strip() ile iki uçtaki boşluk ve satır sonlarını sil.', 'split(":") metni iki noktadan böler ve bir liste döndürür.', 'Listenin ilk elemanı ([0]) hata türüdür; iki nokta yoksa liste tek elemanlıdır ve yine [0] doğru sonucu verir.'],
         example='kayit = "  2025-03-14: ödeme alındı "\nprint(kayit.strip().split(":")[0])\n',
         start='def hata_turu(satir):\n    # TODO: uçları temizle\n    # TODO: iki noktadan böl ve ilk parçayı döndür\n    return satir\n',
         sol='def hata_turu(satir):\n    return satir.strip().split(":")[0]\n',
         tests='assert hata_turu("NameError: name \'tutr\' is not defined") == "NameError", "İki noktadan önceki kısım hata türüdür"\nassert hata_turu("  ZeroDivisionError: division by zero\\n") == "ZeroDivisionError", "Baştaki boşluk ve sondaki satır sonu temizlenmeli"\nassert hata_turu("KeyboardInterrupt") == "KeyboardInterrupt", "İki nokta yoksa metnin kendisi döner"\n',
         hints=['Metin metotları zincirlenebilir: satir.strip().split(":")', 'split bir liste döndürür; ilk eleman için [0].', 'return satir.strip().split(":")[0]'],
         why='strip ile temizleyip split ile bölmek, kayıt satırlarını ayrıştırmanın en temel kalıbıdır. split ayıracı bulamazsa tüm metni tek elemanlı liste olarak döndürdüğü için ayrı bir kontrol gerekmez.'),
    dict(t='code', stage='Kendin yaz', diff=1,
         q='<p>Müşterinin adını ve şehrini <code>input</code> ile al (sorular tam olarak <code>"Ad: "</code> ve <code>"Şehir: "</code> olsun), sonra <code>Hoş geldin Ayşe (İzmir)</code> biçiminde selamla. Girdiler: <code>Ayşe</code>, <code>İzmir</code>.</p>',
         stdin=['Ayşe', 'İzmir'],
         sol='ad = input("Ad: ")\nsehir = input("Şehir: ")\nprint("Hoş geldin " + ad + " (" + sehir + ")")\n',
         expect='Ad: Ayşe\nŞehir: İzmir\nHoş geldin Ayşe (İzmir)\n',
         hints=['İki input çağrısı, girilen değerleri sırayla alır.', 'Parantezleri boşluksuz yerleştirmek için metinleri + ile birleştir ya da f-string kullan.'],
         why='print virgülle verilen değerlerin arasına boşluk koyar; "(İzmir)" gibi bitişik yazım için metinleri + ile birleştirmek ya da f"Hoş geldin {ad} ({sehir})" yazmak gerekir.'),
    dict(t='code', stage='Hata avı', kind='bug', diff=1,
         q='<p>Bu küçük program hiç çalışmıyor. <b>Hataları bul ve düzelt</b>; çıktı şu olmalı:</p><pre class="out">Fiş\nTutar: 250\nBitti</pre>',
         start='print("Fiş")\n  print("Tutar: 250")\nprint("Bitti"\n',
         sol='print("Fiş")\nprint("Tutar: 250")\nprint("Bitti")\n',
         expect='Fiş\nTutar: 250\nBitti\n',
         hints=['İki ayrı sorun var; Python ilkini gösterir, düzeltince ikincisini.', 'İkinci satırın başındaki boşluklar bir bloğa ait değil.', 'Son satırda kapanmamış bir parantez var.'],
         why='Beklenmeyen girinti IndentationError, kapanmayan parantez SyntaxError verir. İkisi de söz dizimi hatasıdır, yani program tek satır bile çalışmadan durur; "Fiş" bile yazılmaz.'),
    dict(t='code', stage='Hata avı', kind='bug', diff=2,
         q='<p>Kasiyer adet giriyor, program toplamı hesaplıyor. Kod hata vermiyor ama çıktı saçma: 3 girince ekrana upuzun bir sayı basıyor. <b>Hatayı bul ve düzelt.</b> Girdi <code>3</code> için çıktı:</p><pre class="out">Adet: 3\nToplam: 750</pre>',
         stdin=['3'],
         start='adet = input("Adet: ")\nprint("Toplam:", adet * 250)\n',
         sol='adet = int(input("Adet: "))\nprint("Toplam:", adet * 250)\n',
         expect='Adet: 3\nToplam: 750\n',
         hints=['input ne döndürür: sayı mı, metin mi?', '"3" * 250 metni 250 kez tekrar eder.', 'Girdiyi int() ile çevir.'],
         why='input her zaman metin döndürür. Metin * sayı hata vermez, metni tekrar eder; bu yüzden "333...3" gibi bir çıktı oluşur. Sessiz hatalar en tehlikelileridir; girdiyi kullanmadan önce int() ile çevir.'),
    dict(t='code', stage='Meydan okuma', diff=3,
         q='<p>Bir programı iskeletine uygun yaz: üstte bir docstring, <code>KOMISYON = 5</code> sabiti ve bir <code>main()</code> fonksiyonu olsun; dosyanın sonunda <code>if __name__ == "__main__":</code> ile <code>main()</code> çağrılsın. <code>main()</code> müşteri adını ve tutarı input ile alsın (sorular <code>"Müşteri: "</code> ve <code>"Tutar: "</code>), tutarı tam sayıya çevirsin ve şu satırı yazdırsın:</p><pre class="out">Mehmet Kaya | Net: 2745 TL</pre><p>Girdiler: <code>Mehmet Kaya</code>, <code>2750</code>.</p>',
         stdin=['Mehmet Kaya', '2750'],
         sol='"""Şube makbuzu: tutardan komisyonu düşer."""\nKOMISYON = 5\n\n\ndef main():\n    musteri = input("Müşteri: ")\n    tutar = int(input("Tutar: "))\n    print(musteri, "| Net:", tutar - KOMISYON, "TL")\n\n\nif __name__ == "__main__":\n    main()\n',
         expect='Müşteri: Mehmet Kaya\nTutar: 2750\nMehmet Kaya | Net: 2745 TL\n',
         tests='assert KOMISYON == 5, "KOMISYON sabiti 5 olmalı"\nassert callable(main), "main adında bir fonksiyon olmalı"\nassert \'__name__ == "__main__"\' in __source__ or "__name__ == \'__main__\'" in __source__, "main() if __name__ == \\"__main__\\": koruması altında çağrılmalı"\nassert __source__.lstrip().startswith(\'"""\'), "Dosya bir docstring ile başlamalı"\n',
         hints=['İskelet: docstring, sabit, def main(): ..., en sonda if __name__ == "__main__": main()', 'Net tutar için KOMISYON\'u çıkar; tutarı önce int() ile çevir.', 'print(musteri, "| Net:", tutar - KOMISYON, "TL")'],
         why='Docstring, sabitler, main fonksiyonu ve __name__ koruması profesyonel betiklerin standart iskeletidir. Koruma sayesinde dosya başka bir yerden içe aktarıldığında main kendiliğinden çalışmaz.'),
]

faq = [
    dict(q='print ile return arasındaki fark ne?',
         a='print değeri ekrana yazar ve programın geri kalanı o değeri kullanamaz; dönüş değeri None\'dır. return ise bir fonksiyonun ürettiği değeri çağırana geri verir; o değeri bir değişkene atayabilir, hesapta kullanabilirsin. Fonksiyonlar dersinde return\'ü ayrıntılı göreceksin; şimdilik "print göstermek, return vermek içindir" diye hatırla.'),
    dict(q='Hata mesajları neden bazen hatanın gerçek yerini değil bir sonraki satırı gösteriyor?',
         a='Özellikle kapanmamış parantez ve tırnaklarda Python ifadenin bittiğini ancak sonraki satırda anlar. Python 3.10 ve sonrası bunu büyük ölçüde düzeltti ve "\'(\' was never closed" gibi açılış yerini gösteren mesajlar verir. Yine de gösterilen satırda sorun yoksa bir üst satıra bak.'),
]
mistakes = [
    dict(bad='yol = "C:\\raporlar\\nisan.csv"', good='yol = r"C:\\raporlar\\nisan.csv"\n# ya da\nyol = "C:/raporlar/nisan.csv"',
         why='Normal metinde \\r ve \\n kaçış dizisi olarak yorumlanır ve yol bozulur. Windows yollarında ham metin (r"...") ya da düz eğik çizgi kullan.'),
    dict(bad='print("Uyarı: stok az")  # rapor dosyasına karışır', good='import sys\nprint("Uyarı: stok az", file=sys.stderr)',
         why='Çıktı bir dosyaya yönlendirildiğinde uyarılar da rapora karışır. Uyarı ve hataları stderr\'e yazarsan rapor temiz kalır, uyarılar yine ekranda görünür.'),
]

write('ilk-program', 22, html, ex, faq, mistakes)
