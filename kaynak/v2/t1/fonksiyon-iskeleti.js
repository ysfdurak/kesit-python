/* Kesit Python — Fonksiyon iskeleti: def görevleri için kısa ön ders */
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push({
  id: 'fonksiyon-iskeleti', lv: 'temel', mod: 'Başlangıç', min: 10,
  title: 'Fonksiyon iskeleti: boşluğu doldur',
  sum: 'Alıştırmalarda sık göreceğin def ve return kalıbını tanır, hazır iskeletin içini doldurursun. Ayrıntısı Fonksiyonlar dersinde.',
  goals: ['def ile başlayan bir iskeleti okuyabilirim.', 'İskeletin içine bir satır yazıp sonucu return ile geri verebilirim.', 'print ile return arasındaki farkı söyleyebilirim.'],
  body: `<p>Alıştırmaların çoğu senden küçük bir <b>fonksiyon</b> (function) ister, çünkü testler fonksiyonu çağırıp sonucu denetler. Şimdilik tüm kuralları bilmen gerekmez: hazır bir kalıbın boşluğunu doldurmak yeter.</p>
<pre class="py">def kdvli(tutar):
    sonuc = tutar * 1.2
    return sonuc

print(kdvli(100))</pre>
<ul><li><code>def kdvli(tutar):</code> "kdvli adında bir iş tanımlıyorum, ona bir <code>tutar</code> verilecek" demek. Satır iki noktayla biter.</li><li>Alttaki satırlar <b>dört boşluk içeride</b> yazılır. Fonksiyonun gövdesi budur.</li><li><code>return sonuc</code> sonucu çağırana geri verir ve fonksiyonu bitirir.</li><li><code>kdvli(100)</code> fonksiyonu çağırır: <code>tutar</code> o çağrıda 100 olur.</li></ul>
<h2>return ile print aynı şey değil</h2>
<p><code>print</code> ekrana yazar, değer geri vermez. <code>return</code> değeri geri verir, ekrana yazmaz. Testler <code>return</code> ile verdiğin değere bakar.</p>
<pre class="py">def yazdir(x):
    print(x * 2)

def dondur(x):
    return x * 2

a = yazdir(5)     # ekrana 10 yazar, a boş kalır (None)
b = dondur(5)     # ekrana bir şey yazmaz, b 10 olur
print(a, b)</pre>
<h2>Alıştırmalarda ne göreceksin?</h2>
<p>Çoğu görev şöyle hazır gelir. Sen yalnız <code># buraya yaz</code> satırını doldurursun; <code>pass</code> "henüz boş" demektir ve yerine kendi satırın gelir:</p>
<pre class="code">def indirimli(fiyat):
    # buraya yaz
    pass</pre>
<p>Birden çok değer alan fonksiyonda parametreler virgülle ayrılır: <code>def topla(a, b):</code>. Fonksiyonlar dersinde varsayılan değerleri, kapsamı ve daha fazlasını göreceksin.</p>`,
  ex: [
    { t: 'mc', stage: 'Isınma', id: 'fonksiyon-iskeleti-1', q: '<p><code>def alan(en, boy):</code> satırında <code>en</code> ve <code>boy</code> nedir?</p>', o: ['Fonksiyona verilecek değerlerin adları (parametre)', 'Fonksiyonun döndürdüğü sonuçlar', 'Fonksiyondan önce tanımlanmış olması zorunlu global değişkenler', 'Fonksiyonun adı'], a: 0, why: 'Parantez içindekiler parametredir; fonksiyon çağrılırken değer alırlar.' },
    { t: 'mc', stage: 'Isınma', id: 'fonksiyon-iskeleti-2', q: '<p>Testler bir fonksiyonun sonucunu görmek istiyor. Gövdede hangisini kullanmalısın?</p>', o: ['<code>print(sonuc)</code>', '<code>return sonuc</code>', '<code>sonuc</code> yazıp bırakmak', '<code>input(sonuc)</code>'], a: 1, why: 'Sonucu çağırana yalnız return geri verir; print yalnız ekrana yazar ve fonksiyon None döndürür.' },
    { t: 'predict', stage: 'Kodu oku', id: 'fonksiyon-iskeleti-3', q: 'Bu kod ne yazdırır?', code: 'def iki_kat(x):\n    return x * 2\n\nprint(iki_kat(4))\nprint(iki_kat(4) + 1)\n', o: ['8\n9', '4\n5', '8\n8', 'x * 2\n9'], a: 0, why: 'Çağrı, return edilen değere dönüşür: 8, sonra 8 + 1.' },
    { t: 'predict', stage: 'Kodu oku', id: 'fonksiyon-iskeleti-4', q: 'Bu kod ne yazdırır?', code: 'def selam(ad):\n    print("Merhaba", ad)\n\nsonuc = selam("Ece")\nprint(sonuc)\n', o: ['Merhaba Ece\nNone', 'Merhaba Ece\nMerhaba Ece', 'None\nMerhaba Ece', 'Merhaba Ece'], a: 0, why: 'selam ekrana yazar ama return etmez; bu yüzden sonuc None olur.' },
    { t: 'order', stage: 'Kodu oku', id: 'fonksiyon-iskeleti-5', q: '<p>Satırları sırala: fonksiyon iki sayıyı toplayıp geri versin, sonra sonuç yazdırılsın.</p>', lines: ['def topla(a, b):', '    sonuc = a + b', '    return sonuc', 'print(topla(2, 3))'], expect: '5\n', why: 'Önce tanım, gövde içeride, sonra çağrı.' },
    { t: 'code', stage: 'Rehberli', kind: 'tamamla', id: 'fonksiyon-iskeleti-6', diff: 1, q: '<p><code>indirimli(fiyat)</code> fiyatın yüzde 10 indirimli hâlini döndürsün. Örnek: <code>indirimli(200)</code> → <code>180.0</code>.</p>', guide: ['pass satırını sil.', 'sonuc = fiyat * 0.9 yaz.', 'return sonuc yaz.'], start: 'def indirimli(fiyat):\n    # buraya yaz\n    pass\n', sol: 'def indirimli(fiyat):\n    sonuc = fiyat * 0.9\n    return sonuc\n', tests: 'assert indirimli(200) == 180.0, "200 için 180.0 bekleniyor"\nassert indirimli(50) == 45.0, "50 için 45.0 bekleniyor"\nassert indirimli(0) == 0, "0 için 0 bekleniyor"\n', hints: ['Yüzde 10 indirimli: fiyatın 0.9 katı.', 'sonuc = fiyat * 0.9, sonra return sonuc.'], why: 'İskelet aynı kalır, yalnız gövde değişir.' },
    { t: 'code', stage: 'Rehberli', kind: 'tamamla', id: 'fonksiyon-iskeleti-7', diff: 1, q: '<p><code>toplam_tutar(adet, fiyat)</code> adet ile fiyatın çarpımını döndürsün. Örnek: <code>toplam_tutar(3, 250)</code> → <code>750</code>.</p>', guide: ['İki parametren var: adet ve fiyat.', 'Çarpımı return et.'], start: 'def toplam_tutar(adet, fiyat):\n    # buraya yaz\n    pass\n', sol: 'def toplam_tutar(adet, fiyat):\n    return adet * fiyat\n', tests: 'assert toplam_tutar(3, 250) == 750, "3 ve 250 için 750 bekleniyor"\nassert toplam_tutar(1, 99) == 99, "1 ve 99 için 99 bekleniyor"\n', hints: ['return adet * fiyat yeter; ara değişken şart değil.'], why: 'return bir ifadeyi doğrudan geri verebilir.' },
    { t: 'code', stage: 'Kendin yaz', kind: 'tamamla', id: 'fonksiyon-iskeleti-8', diff: 1, q: '<p><code>tam_ad(ad, soyad)</code> ad ile soyadı aralarında bir boşlukla birleştirip döndürsün. Örnek: <code>tam_ad("Ece", "Kaya")</code> → <code>"Ece Kaya"</code>.</p>', start: 'def tam_ad(ad, soyad):\n    # buraya yaz\n    pass\n', sol: 'def tam_ad(ad, soyad):\n    return ad + " " + soyad\n', tests: 'assert tam_ad("Ece", "Kaya") == "Ece Kaya", "Araya tek boşluk koy"\nassert tam_ad("Can", "Er") == "Can Er"\n', hints: ['Metinler + ile birleşir.', 'ad + " " + soyad'], why: '+ metinleri yan yana ekler; aradaki boşluğu sen koyarsın.' },
    { t: 'code', stage: 'Kendin yaz', id: 'fonksiyon-iskeleti-9', diff: 1, q: '<p>İskeleti kendin yaz: <code>kare(n)</code> adında bir fonksiyon <code>n * n</code> değerini döndürsün. Sonra <code>print(kare(7))</code> ile sonucu yazdır.</p>', start: '# def ile başla\n', sol: 'def kare(n):\n    return n * n\n\nprint(kare(7))\n', tests: 'assert kare(3) == 9, "kare(3) 9 olmalı"\nassert kare(0) == 0\n', expect: '49\n', hints: ['İlk satır: def kare(n):', 'Gövde dört boşluk içeride: return n * n'], why: 'Tanım + girinti + return: bütün iskelet bu kadar.' },
    { t: 'code', stage: 'Hata avı', kind: 'bug', id: 'fonksiyon-iskeleti-10', diff: 1, q: '<p>Bu fonksiyon sonucu ekrana yazıyor ama geri vermiyor; bu yüzden test geçmiyor. Düzelt.</p>', start: 'def yarisi(x):\n    print(x / 2)\n', sol: 'def yarisi(x):\n    return x / 2\n', tests: 'assert yarisi(10) == 5.0, "yarisi(10) 5.0 döndürmeli"\nassert yarisi(3) == 1.5\n', hints: ['print yerine return kullan.'], why: 'Test return edilen değere bakar.' }
  ],
  mistakes: [
    { bad: 'def f(x):\nreturn x + 1\n', good: 'def f(x):\n    return x + 1\n', why: 'Gövde girintili olmalı: girintisiz satır fonksiyonun içinde sayılmaz, IndentationError verir.' },
    { bad: 'def f(x):\n    print(x + 1)\n\nsonuc = f(2)\nprint(sonuc + 1)\n', good: 'def f(x):\n    return x + 1\n\nsonuc = f(2)\nprint(sonuc + 1)\n', why: 'print değer döndürmez; sonuc None olur ve toplama TypeError verir.' }
  ],
  faq: [
    { q: 'Fonksiyonu henüz görmedim, neden burada?', a: 'Alıştırmaları otomatik denetlemek için. Şimdilik kalıp olarak kullan; Fonksiyonlar dersinde her parçasını öğreneceksin.' },
    { q: 'pass ne işe yarar?', a: 'Hiçbir şey yapmaz. Python boş gövdeye izin vermediği için yer tutar. Kendi satırını yazınca silebilirsin.' }
  ]
});
})(window);
