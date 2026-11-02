/* PythonPatika v2 — uzantı: kapsam-moduller */
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
{ id: 'kapsam-moduller',
  min: 40,
  html: `
<h2>UnboundLocalError'u gerçekten anlamak</h2>
<p>Python bir fonksiyonu <b>çalıştırmadan önce</b> derler ve gövdede atama yapılan her adı o fonksiyonun yerel adı olarak işaretler. Bu karar satır sırasına bakmaz: atama gövdenin sonunda bile olsa, ad baştan itibaren yereldir. <code>sayac += 1</code> hem okuma hem atama yaptığı için <code>sayac</code> yerel sayılır; okunmak istendiğinde yerel <code>sayac</code> henüz bir değere bağlanmamıştır.</p>
<pre class="py">sayac = 0

def oku():
    print("okuma serbest:", sayac)    # atama yok: global okunur

def artir():
    try:
        sayac += 1                     # atama var: sayac yerel!
    except UnboundLocalError as h:
        print("Hata:", h)

def artir_dogru(deger):
    return deger + 1                   # en temizi: parametre al, sonuç döndür

oku()
artir()
sayac = artir_dogru(sayac)
print(sayac)</pre>
<p>İç içe fonksiyonlarda dıştaki fonksiyonun değişkenini değiştirmek için <code>global</code>'in kardeşi <code>nonlocal</code> var. Onu ve fonksiyon döndüren fonksiyonları Kapanışlar ve kapsam dersinde ayrıntılı göreceksin.</p>

<h2>Döngü ve comprehension değişkenlerinin kapsamı</h2>
<p>Python'da <code>if</code> ve <code>for</code> blokları yeni bir kapsam açmaz: döngü değişkeni döngü bittikten sonra da yaşar ve son değerini korur. Comprehension'lar (<code>[x * 2 for x in ...]</code>) ise kendi küçük kapsamlarına sahiptir; içlerindeki değişken dışarı sızmaz.</p>
<pre class="py">for i in range(3):
    pass
print("döngüden sonra i =", i)

kareler = [j * j for j in range(4)]
print(kareler, "j" in globals())       # j dışarı sızmadı

if True:
    blok_ici = "if bloğu kapsam açmaz"
print(blok_ici)</pre>

<h2>Yerleşik adları gölgelemek</h2>
<p>LEGB'nin son halkası B (built-in): <code>print</code>, <code>len</code>, <code>sum</code>, <code>list</code>, <code>id</code>, <code>input</code>, <code>max</code> gibi adlar yerleşik (builtins) modülündedir. Aynı adla bir değişken oluşturursan, o kapsamda yerleşik fonksiyon <b>gölgelenir</b> (shadowing) ve çağırmaya çalıştığında anlamsız hatalar alırsın. Hangi adların yerleşik olduğunu <code>builtins</code> modülüne, Python'un ayrılmış sözcüklerini (<code>if</code>, <code>for</code>, <code>class</code>...) <code>keyword</code> modülüne sorabilirsin.</p>
<pre class="py">import builtins, keyword

fiyatlar = [10, 20, 30]
sum = 0                                 # gölgeleme!
for f in fiyatlar:
    sum += f
try:
    print(sum(fiyatlar))
except TypeError as h:
    print("Hata:", h)
del sum                                 # yerel adı sil, yerleşik geri gelir
print(sum(fiyatlar))

for ad in ["list", "toplam", "class", "id", "2sehir"]:
    print(ad, hasattr(builtins, ad), keyword.iskeyword(ad), ad.isidentifier())</pre>
<div class="tip"><b>Güvenli ad seçimi</b>Sık gölgelenen yerleşikler için Türkçe ya da daha açıklayıcı adlar kullan: <code>list</code> yerine <code>urunler</code>, <code>sum</code> yerine <code>toplam</code>, <code>id</code> yerine <code>musteri_id</code>, <code>type</code> yerine <code>tur</code>. Bir yerleşik adını gerçekten kullanman gerekiyorsa PEP 8 sona alt çizgi önerir: <code>type_</code>, <code>id_</code>.</div>

<h2>import'un incelikleri ve modül adı çakışması</h2>
<div class="tbl-wrap"><table>
<tr><th>Yazım</th><th>Ne getirir?</th><th>Ne zaman?</th></tr>
<tr><td><code>import math</code></td><td><code>math</code> adını</td><td>Varsayılan; kaynağı her kullanımda belli</td></tr>
<tr><td><code>import statistics as st</code></td><td>Kısa takma adı</td><td>Uzun adlı ya da gelenekli modüller (<code>np</code>, <code>pd</code>)</td></tr>
<tr><td><code>from math import ceil, floor</code></td><td>Yalnız seçilen adları</td><td>Birkaç adı sık kullanıyorsan</td></tr>
<tr><td><code>from math import sqrt as kok</code></td><td>Seçilen adı yeni adla</td><td>Ad çakışmasını önlemek için</td></tr>
<tr><td><code>from math import *</code></td><td>Her şeyi</td><td>Etkileşimli denemeler dışında kullanma</td></tr>
</table></div>
<p>Python bir modülü ararken önce <b>çalıştırdığın dosyanın klasörüne</b>, sonra standart kütüphaneye ve yüklü paketlere bakar (bu liste <code>sys.path</code>'te). Bu yüzden kendi dosyana <code>random.py</code>, <code>statistics.py</code> ya da <code>math.py</code> adını verirsen, <code>import random</code> standart kütüphaneyi değil seninkini yükler ve <code>AttributeError: module 'random' has no attribute 'randint'</code> gibi şaşırtıcı hatalar alırsın. Dosyalarına standart modüllerin adlarını verme.</p>
<p>Bir modül ilk <code>import</code>'ta bir kez çalıştırılır ve <code>sys.modules</code> önbelleğine konur; sonraki import'lar aynı nesneyi döndürür. Aşağıdaki örnek bunu dosya bile oluşturmadan, modülü elle kurarak gösteriyor:</p>
<pre class="py">import sys, types

kaynak = 'print("ayarlar yükleniyor...")\\nKDV = 0.20\\ndef kdv_dahil(x):\\n    return round(x * (1 + KDV), 2)\\n'
modul = types.ModuleType("ayarlar")
exec(kaynak, modul.__dict__)            # modül kodunu kendi ad alanında çalıştır
sys.modules["ayarlar"] = modul          # önbelleğe koy

import ayarlar                          # önbellekten gelir, kod tekrar çalışmaz
print(ayarlar.kdv_dahil(100), ayarlar is modul, ayarlar.__name__)</pre>

<h2>random ve statistics: ders dışında kalanlar</h2>
<pre class="py">import random, statistics

rng = random.Random(42)                  # kendi tohumlu üreteci: global random'u etkilemez
urunler = ["çay", "kahve", "su", "kek"]
print(rng.choice(urunler))
print(rng.sample(urunler, 2))            # tekrarsız 2 seçim
print(rng.choices(urunler, weights=[5, 3, 1, 1], k=4))   # ağırlıklı, tekrarlı
kopya = urunler[:]
rng.shuffle(kopya)                       # yerinde karıştırır, None döner
print(kopya)

sureler = [12, 7, 9, 8, 10, 11, 95, 9, 10, 1]
print(statistics.median(sureler), statistics.mode(sureler))
print(statistics.quantiles(sureler, n=4))   # çeyrekler: Q1, Q2, Q3
print(round(statistics.stdev(sureler), 2))</pre>
<p><code>random.Random(tohum)</code> nesnesi, testlerde ve simülasyonlarda tekrarlanabilir sonuç verirken programın geri kalanındaki <code>random</code> çağrılarını etkilemez; global <code>random.seed</code> ise herkesin sırasını değiştirir. Çeyrekler (quantiles) ise aykırı değer (outlier) bulmanın en yaygın yolu olan IQR kuralının temelidir.</p>
<div class="note"><b>Gerçek işte</b>Projelerde modül düzeni genellikle şöyledir: sabitler ve ayarlar bir modülde (<code>ayarlar.py</code>, BÜYÜK_HARF adlarla), iş kuralları saf fonksiyonlar olarak başka modüllerde, giriş noktası ise <code>if __name__ == "__main__":</code> ile korunan küçük bir <code>main()</code>. Global değişkenle durum taşımak yerine fonksiyonlar parametre alıp sonuç döndürür. Paket yapısı, <code>__init__.py</code> ve göreli import'ları Modüller ve paketler dersinde, üçüncü parti paket kurmayı Sanal ortam ve pip dersinde göreceksin.</div>
`,
  ex: [
    { t: 'mc',
      stage: 'Isınma',
      q: 'Projende <code>random.py</code> adlı bir dosya oluşturdun. Aynı klasördeki başka bir dosyada <code>import random</code> ve <code>random.randint(1, 6)</code> yazınca <code>AttributeError</code> alıyorsun. Sebep nedir?',
      o: ['randint Python 3.12 sürümünde kaldırıldı, yerine choice gelmeli', 'Python önce kendi klasörüne bakar; senin random.py yüklendi', 'import random yalnızca bir fonksiyonun içinde yazılınca çalışır', 'randint için mutlaka from random import * yazmak gerekir'],
      a: 1,
      why: 'Modül arama yolunun (sys.path) başında çalıştırılan dosyanın klasörü vardır. Aynı adlı dosyan standart kütüphaneyi gölgeler. Dosyanı yeniden adlandır (ve oluşmuşsa __pycache__ klasörünü sil).' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Bu kod çalıştırılınca ne olur?',
      code: 'sayac = 0\n\ndef artir():\n    sayac += 1\n\nartir()\nprint(sayac)\n',
      o: ['1 yazar', '0 yazar', 'UnboundLocalError verir', 'NameError verir'],
      a: 2,
      raises: true,
      why: 'Fonksiyonda sayac\'a atama yapıldığı için sayac yerel sayılır. += önce okumaya çalışır; yerel sayac henüz değer almamıştır: UnboundLocalError.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Döngü ve comprehension kapsamı: bu kod ne yazdırır?',
      code: 'for i in range(3):\n    pass\nkareler = [j * j for j in range(3)]\nprint(i, "j" in globals())\n',
      o: ['2 False', '3 False', '2 True', 'NameError verir'],
      a: 0,
      why: 'for döngüsü kapsam açmaz; i son değeri olan 2\'yi korur. Comprehension kendi kapsamına sahiptir; j dışarı sızmaz.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Gölgeleme: bu kod çalıştırılınca ne olur?',
      code: 'fiyatlar = [10, 20]\nsum = 0\nfor f in fiyatlar:\n    sum += f\nprint(sum)\nprint(sum(fiyatlar))\n',
      o: ['30 ve 30 yazar', '30 yazar, sonra TypeError verir', 'İlk satırda SyntaxError verir', '0 yazar, sonra 30'],
      a: 1,
      raises: true,
      why: 'sum = 0 yerleşik sum fonksiyonunu gölgeler. İlk print 30 yazar; ikinci satırda sum bir int olduğundan çağrılamaz: TypeError: \'int\' object is not callable.' },
    { t: 'order',
      stage: 'Kodu oku',
      q: '<p>Modül düzeyinde bir sabit hesaplayıp varsayılan parametre olarak kullanan programın satırlarını sırala. (İpucu: varsayılan değerler fonksiyon <b>tanımlanırken</b> hesaplanır.)</p>',
      lines: ['import statistics as st', 'ORTANCA = st.median([12, 7, 7, 30, 9])', 'def rapor(etiket, deger=ORTANCA):', '    return f"{etiket}: {deger} dk"', 'if __name__ == "__main__":', '    print(rapor("Ortanca bekleme"))'],
      expect: 'Ortanca bekleme: 9 dk\n',
      hint: 'def satırı ORTANCA\'yı tanım anında okur; bu yüzden ORTANCA önce tanımlanmalı. Takma ad (st) da kullanılmadan önce import edilmeli.',
      why: 'Varsayılan değer def çalıştığı anda hesaplanır; ORTANCA o anda tanımlı olmalıdır. Giriş noktası __name__ kontrolüyle dosyanın sonunda durur.' },
    { id: 'kapsam-moduller-x1',
      t: 'code',
      stage: 'Rehberli',
      diff: 2,
      q: '<p>Anadolu Market kampanya kuponu üretici: <code>kupon_uret(n, tohum)</code> fonksiyonunu yaz. <code>n</code> adet, her biri 8 karakterlik ve yalnız büyük harf (A-Z) ve rakamlardan oluşan kupon kodu listesi döndürsün. Aynı tohumla hep aynı liste üretilsin ama programın <b>global random durumu etkilenmesin</b>: <code>random.seed</code> değil, <code>random.Random(tohum)</code> nesnesi kullan.</p>',
      guide: ['random ve string modüllerini içe aktar.', 'Karakter havuzu: string.ascii_uppercase + string.digits', 'rng = random.Random(tohum) ile kendi üretecini kur.', 'n kez: "".join(rng.choices(havuz, k=8)) ile bir kod üret ve listeye ekle.'],
      example: 'import random, string\nrng = random.Random(7)\nprint("".join(rng.choices(string.ascii_lowercase, k=5)))\nrng2 = random.Random(7)\nprint("".join(rng2.choices(string.ascii_lowercase, k=5)))  # aynı\n',
      start: 'import random\nimport string\n\ndef kupon_uret(n, tohum):\n    havuz = string.ascii_uppercase + string.digits\n    # TODO: kendi Random nesneni kur ve n kod üret\n    random.seed(tohum)\n    return []\n',
      sol: 'import random\nimport string\n\ndef kupon_uret(n, tohum):\n    havuz = string.ascii_uppercase + string.digits\n    rng = random.Random(tohum)\n    kodlar = []\n    for _ in range(n):\n        kodlar.append("".join(rng.choices(havuz, k=8)))\n    return kodlar\n',
      tests: 'import random, string\nk = kupon_uret(5, 2025)\nassert len(k) == 5 and all(len(x) == 8 for x in k), "5 adet 8 karakterlik kod"\nizinli = set(string.ascii_uppercase + string.digits)\nassert all(set(x) <= izinli for x in k), "yalnız büyük harf ve rakam"\nassert kupon_uret(5, 2025) == k, "aynı tohum aynı kodları üretmeli"\nassert kupon_uret(5, 1) != k, "farklı tohum farklı kodlar"\nrandom.seed(99); a = random.random()\nrandom.seed(99); kupon_uret(3, 5); b = random.random()\nassert a == b, "global random durumu değişmemeli: random.seed ya da random.choices değil, kendi Random nesneni kullan"\n',
      hints: ['random.Random(tohum) bağımsız, tohumlu bir üreteç verir.', 'rng.choices(havuz, k=8) 8 karakterlik liste döndürür; "".join ile birleştir.'],
      why: 'Kendi Random nesnen tekrarlanabilir sonuç verir ve programın başka yerlerindeki rastgele sayıları (ör. test sırası, simülasyon) bozmaz. Global random.seed ise paylaşılan durumu değiştirir.' },
    { id: 'kapsam-moduller-x2',
      t: 'code',
      stage: 'Rehberli',
      diff: 2,
      q: '<p>Anadolu Bank şube bekleme süreleri: <code>aykiri_degerler(sureler)</code> fonksiyonunu yaz. IQR kuralı: <code>statistics.quantiles(sureler, n=4)</code> ile Q1, Q2, Q3\'ü bul; <code>iqr = q3 - q1</code>; <code>q1 - 1.5 * iqr</code>\'den küçük ya da <code>q3 + 1.5 * iqr</code>\'den büyük değerleri <b>sıralı</b> liste olarak döndür.</p>',
      guide: ['statistics modülünü içe aktar.', 'q1, q2, q3 = statistics.quantiles(sureler, n=4) ile açma yap.', 'Alt ve üst sınırları hesapla.', 'Sınır dışındaki değerleri topla ve sorted ile döndür.'],
      example: 'import statistics\nnotlar = [55, 60, 62, 70, 75, 80, 98]\nq1, q2, q3 = statistics.quantiles(notlar, n=4)\nprint(q1, q2, q3, "IQR:", q3 - q1)\n',
      start: 'import statistics\n\ndef aykiri_degerler(sureler):\n    # TODO: çeyrekleri bul, sınırları hesapla\n    sonuc = []\n    return sorted(sonuc)\n',
      sol: 'import statistics\n\ndef aykiri_degerler(sureler):\n    q1, q2, q3 = statistics.quantiles(sureler, n=4)\n    iqr = q3 - q1\n    alt = q1 - 1.5 * iqr\n    ust = q3 + 1.5 * iqr\n    sonuc = []\n    for s in sureler:\n        if s < alt or s > ust:\n            sonuc.append(s)\n    return sorted(sonuc)\n',
      tests: 'assert aykiri_degerler([12, 7, 9, 8, 10, 11, 95, 9, 10, 1]) == [1, 95], "Q1=7.75, Q3=11.25, IQR=3.5: sınırlar 2.5 ve 16.5"\nassert aykiri_degerler([12, 14, 13, 15, 14, 13, 60, 12, 13, -20]) == [-20, 60], "negatif aykırı da yakalanmalı"\nassert aykiri_degerler([5, 6, 7, 8, 9]) == [], "aykırı değer yok"\n',
      hints: ['statistics.quantiles(veri, n=4) üç kesim noktası döndürür.', 'alt = q1 - 1.5 * iqr, ust = q3 + 1.5 * iqr'],
      why: 'IQR kuralı ortalama ve standart sapmaya göre aykırı değerlerden daha az etkilenir; kuyrukta 95 dakika gibi tek bir uç değer sınırları kaydırmaz.' },
    { id: 'kapsam-moduller-x3',
      t: 'code',
      stage: 'Rehberli',
      diff: 1,
      q: '<p>Kod incelemesi aracı: <code>ad_kontrol(ad)</code> fonksiyonunu yaz. Bir değişken adını değerlendirip şu metinlerden birini döndürsün (kontrol sırası bu):</p><ul><li><code>"geçersiz"</code>: geçerli bir Python tanımlayıcısı değilse (<code>str.isidentifier</code>)</li><li><code>"anahtar sözcük"</code>: <code>keyword.iskeyword</code> True ise</li><li><code>"yerleşiği gölgeler"</code>: <code>builtins</code> modülünde bu adda bir şey varsa (<code>hasattr</code>)</li><li><code>"uygun"</code>: diğer durumlarda</li></ul>',
      guide: ['builtins ve keyword modüllerini içe aktar.', 'İlk kontrol: if not ad.isidentifier(): return "geçersiz"', 'Sonra keyword.iskeyword(ad), sonra hasattr(builtins, ad).', 'Hiçbiri değilse "uygun".'],
      example: 'import builtins, keyword\nprint(hasattr(builtins, "len"), hasattr(builtins, "toplam"))\nprint(keyword.iskeyword("while"), "3x".isidentifier())\n',
      start: 'import builtins\nimport keyword\n\ndef ad_kontrol(ad):\n    # TODO: dört durumu sırayla kontrol et\n    return "uygun"\n',
      sol: 'import builtins\nimport keyword\n\ndef ad_kontrol(ad):\n    if not ad.isidentifier():\n        return "geçersiz"\n    if keyword.iskeyword(ad):\n        return "anahtar sözcük"\n    if hasattr(builtins, ad):\n        return "yerleşiği gölgeler"\n    return "uygun"\n',
      tests: 'assert ad_kontrol("2sehir") == "geçersiz", "rakamla başlayan ad geçersiz"\nassert ad_kontrol("musteri-no") == "geçersiz", "tire içeren ad geçersiz"\nassert ad_kontrol("class") == "anahtar sözcük", "class anahtar sözcük"\nassert ad_kontrol("list") == "yerleşiği gölgeler", "list yerleşik"\nassert ad_kontrol("sum") == "yerleşiği gölgeler", "sum yerleşik"\nassert ad_kontrol("toplam_tutar") == "uygun", "toplam_tutar uygun"\nassert ad_kontrol("şehir") == "uygun", "Türkçe harfli adlar geçerli tanımlayıcıdır"\n',
      hints: ['Yerleşik adlar builtins modülünün nitelikleridir.', 'hasattr(builtins, ad)'],
      why: 'Python yerleşik adları builtins modülünde, ayrılmış sözcükleri keyword modülünde tutar. Kontrol sırası önemlidir: geçersiz bir ad için diğer sorular anlamsızdır.' },
    { id: 'kapsam-moduller-x4',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p>Lojistik: iki şube arasındaki kuş uçuşu mesafeyi bulan <code>mesafe_km(nokta1, nokta2)</code> fonksiyonunu <code>math</code> modülüyle yaz. Noktalar <code>(enlem, boylam)</code> demetidir (derece). Haversine formülü (R = 6371 km):</p><pre class="out">a = sin²(Δenlem/2) + cos(enlem1) · cos(enlem2) · sin²(Δboylam/2)\nmesafe = 2 · R · asin(√a)</pre><p>Açıları önce radyana çevir (<code>math.radians</code>). Sonucu 1 ondalığa yuvarla.</p>',
      start: 'import math\n\ndef mesafe_km(nokta1, nokta2):\n    pass\n',
      sol: 'import math\n\ndef mesafe_km(nokta1, nokta2):\n    en1, boy1 = map(math.radians, nokta1)\n    en2, boy2 = map(math.radians, nokta2)\n    a = math.sin((en2 - en1) / 2) ** 2 + math.cos(en1) * math.cos(en2) * math.sin((boy2 - boy1) / 2) ** 2\n    return round(2 * 6371 * math.asin(math.sqrt(a)), 1)\n',
      tests: 'izmir = (38.4237, 27.1428)\nankara = (39.9334, 32.8597)\nistanbul = (41.0082, 28.9784)\nassert mesafe_km(izmir, ankara) == 520.5, f"İzmir-Ankara 520.5 km olmalı; gelen {mesafe_km(izmir, ankara)}"\nassert mesafe_km(istanbul, ankara) == 349.4, f"İstanbul-Ankara 349.4 km; gelen {mesafe_km(istanbul, ankara)}"\nassert mesafe_km(istanbul, istanbul) == 0.0, "aynı nokta 0 km"\nassert mesafe_km(ankara, izmir) == mesafe_km(izmir, ankara), "mesafe yönden bağımsız"\n',
      hints: ['Trigonometrik fonksiyonlar radyan ister: math.radians(derece).', 'sin² için math.sin(x) ** 2; kök için math.sqrt, ters sinüs için math.asin.'],
      why: 'math modülü trigonometrik fonksiyonları radyan cinsinden çalıştırır; dereceyi çevirmeyi unutmak en sık hatadır. Haversine, dünyanın eğriliğini hesaba katan standart kuş uçuşu formülüdür.' },
    { id: 'kapsam-moduller-x5',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p>A/B testi için ağırlıklı örneklem: <code>agirlikli_sec(secenekler, agirliklar, n, tohum)</code> fonksiyonunu yaz. <code>random.Random(tohum)</code> ile kendi üretecini kurup <code>choices</code> ile <code>n</code> adet (tekrarlı) seçim yap ve liste döndür. Ağırlığı 0 olan seçenek hiç seçilmemeli. <code>secenekler</code> ile <code>agirliklar</code>\'ın uzunluğu farklıysa <code>ValueError</code> fırlat.</p>',
      start: 'import random\n\ndef agirlikli_sec(secenekler, agirliklar, n, tohum):\n    pass\n',
      sol: 'import random\n\ndef agirlikli_sec(secenekler, agirliklar, n, tohum):\n    if len(secenekler) != len(agirliklar):\n        raise ValueError("uzunluklar farklı")\n    rng = random.Random(tohum)\n    return rng.choices(secenekler, weights=agirliklar, k=n)\n',
      tests: 's = agirlikli_sec(["A", "B", "C"], [7, 3, 0], 200, 11)\nassert len(s) == 200, "200 seçim"\nassert "C" not in s, "ağırlığı 0 olan C seçilmemeli"\nassert s.count("A") > s.count("B"), "A daha ağır: daha sık seçilmeli"\nassert agirlikli_sec(["A", "B", "C"], [7, 3, 0], 200, 11) == s, "aynı tohum aynı sonuç"\ntry:\n    agirlikli_sec(["A", "B"], [1], 5, 1)\n    assert False, "uzunluklar farklıyken ValueError bekleniyordu"\nexcept ValueError:\n    pass\n',
      hints: ['rng = random.Random(tohum)', 'rng.choices(secenekler, weights=agirliklar, k=n)'],
      why: 'choices ağırlıklara orantılı, tekrarlı seçim yapar; tohumlu kendi üreteci deneyi tekrarlanabilir kılar. Uzunluk kontrolü sessiz yanlış eşleşmeyi önler.' },
    { id: 'kapsam-moduller-x6',
      t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      diff: 1,
      q: '<p>Hatayı bul ve düzelt. <code>gun_raporu(tutarlar)</code> toplam ve ortalama cironun bulunduğu demeti <code>(toplam, ortalama)</code> döndürmeli. Kod <code>TypeError: \'int\' object is not callable</code> veriyor.</p>',
      start: 'def gun_raporu(tutarlar):\n    sum = 0\n    for t in tutarlar:\n        sum += t\n    ortalama = sum(tutarlar) / len(tutarlar)\n    return (sum, ortalama)\n',
      sol: 'def gun_raporu(tutarlar):\n    toplam = 0\n    for t in tutarlar:\n        toplam += t\n    ortalama = toplam / len(tutarlar)\n    return (toplam, ortalama)\n',
      tests: 'assert gun_raporu([100, 200, 300]) == (600, 200.0), f"gelen {gun_raporu([100, 200, 300])}"\nassert gun_raporu([50]) == (50, 50.0), "tek değer"\nassert "sum =" not in __source__ and "sum +=" not in __source__, "yerleşik sum adını değişken olarak kullanma"\n',
      hints: ['sum = 0 satırı fonksiyonun içinde yerleşik sum\'ı gölgeliyor.', 'Değişkeni toplam olarak yeniden adlandır; ortalama için toplam / len(...) yeterli.'],
      why: 'Yerel sum değişkeni, fonksiyon kapsamında yerleşik sum fonksiyonunu gizler. Yerleşik adları değişkene vermemek bu tür hataları kökten önler.' },
    { id: 'kapsam-moduller-x7',
      t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      diff: 2,
      q: '<p>Hatayı bul ve düzelt. <code>kontrol_kodu(hesap_no)</code> hesap numarasının küpünün 97\'ye göre modunu (yerleşik <code>pow(taban, us, mod)</code>) döndürmeli; <code>kare_kok(x)</code> ise karekökü 2 ondalığa yuvarlamalı. <code>from math import *</code> yüzünden yerleşik <code>pow</code> gölgelendi ve <code>TypeError</code> alınıyor. <code>import *</code>\'ı kaldırıp düzgün import kullan.</p>',
      start: 'from math import *\n\ndef kontrol_kodu(hesap_no):\n    return pow(hesap_no, 3, 97)\n\ndef kare_kok(x):\n    return round(sqrt(x), 2)\n',
      sol: 'import math\n\ndef kontrol_kodu(hesap_no):\n    return pow(hesap_no, 3, 97)\n\ndef kare_kok(x):\n    return round(math.sqrt(x), 2)\n',
      tests: 'assert kontrol_kodu(123456) == pow(123456, 3, 97), "yerleşik üç argümanlı pow kullanılmalı"\nassert kontrol_kodu(10) == 30, "10³ = 1000, 1000 mod 97 = 30"\nassert kare_kok(2) == 1.41, "√2 ≈ 1.41"\nassert "import *" not in __source__, "import * kullanma"\n',
      hints: ['math modülünün de pow adında (2 argümanlı) bir fonksiyonu var; import * onu yerleşik pow\'un üstüne yazar.', 'import math yaz ve sqrt\'yi math.sqrt olarak çağır.'],
      why: 'import * modüldeki tüm adları dosyana döker ve aynı adlı yerleşikleri sessizce ezer. import math ile her adın kaynağı belli olur, yerleşik pow da korunur.' },
    { id: 'kapsam-moduller-x8',
      t: 'code',
      stage: 'Meydan okuma',
      diff: 3,
      q: '<p>Python\'un modül yükleme mekanizmasını taklit et: <code>modul_yukle(ad, kaynak)</code> fonksiyonunu yaz.</p><ul><li><code>ad</code> zaten <code>sys.modules</code>\'ta varsa kaynağı <b>çalıştırmadan</b> var olan modülü döndür (önbellek).</li><li>Yoksa <code>types.ModuleType(ad)</code> ile boş modül oluştur, <code>kaynak</code> kodunu <code>exec(kaynak, modul.__dict__)</code> ile modülün ad alanında çalıştır, modülü <code>sys.modules[ad]</code>\'a kaydet ve döndür.</li></ul><p>Böylece <code>modul_yukle</code>\'den sonra normal <code>import ad</code> da çalışmalı.</p>',
      start: 'import sys\nimport types\n\ndef modul_yukle(ad, kaynak):\n    pass\n',
      sol: 'import sys\nimport types\n\ndef modul_yukle(ad, kaynak):\n    if ad in sys.modules:\n        return sys.modules[ad]\n    modul = types.ModuleType(ad)\n    exec(kaynak, modul.__dict__)\n    sys.modules[ad] = modul\n    return modul\n',
      tests: 'import sys\nsys.modules.pop("pp_ayarlar", None)\nkod = "YUKLEME = []\\nYUKLEME.append(1)\\nKDV = 0.2\\ndef kdv(x):\\n    return round(x * KDV, 2)\\n"\nm = modul_yukle("pp_ayarlar", kod)\nassert m.kdv(100) == 20.0, "modül fonksiyonu çalışmalı"\nassert m.__name__ == "pp_ayarlar", "modül adı doğru olmalı"\nimport pp_ayarlar\nassert pp_ayarlar is m, "sonraki import aynı nesneyi döndürmeli (sys.modules önbelleği)"\nm2 = modul_yukle("pp_ayarlar", "raise RuntimeError(\'tekrar çalıştı\')")\nassert m2 is m and m.YUKLEME == [1], "önbellekteki modül için kaynak tekrar çalıştırılmamalı"\nassert "KDV" not in globals() or globals()["KDV"] != 0.2, "modül kodu senin ad alanına değil modülün ad alanına çalışmalı"\nsys.modules.pop("pp_ayarlar", None)\n',
      hints: ['Önce önbellek kontrolü: if ad in sys.modules: return sys.modules[ad]', 'exec\'e ikinci argüman olarak modul.__dict__ vermek kodu modülün ad alanında çalıştırır.', 'Kaydetmeyi unutma: sys.modules[ad] = modul'],
      why: 'import özünde budur: önbelleğe bak, yoksa modül nesnesi oluştur, kodunu o nesnenin ad alanında bir kez çalıştır, önbelleğe koy. "Modül bir kez yüklenir" davranışı ve modül düzeyindeki kodun yalnız ilk import\'ta çalışması buradan gelir.' }
  ],
  faq: [
    { q: 'Dosyamı yeniden adlandırdım ama hâlâ yanlış modül yükleniyor, neden?', a: 'Eski adla derlenmiş <code>__pycache__/random.cpython-312.pyc</code> gibi bir dosya kalmış olabilir; <code>__pycache__</code> klasörünü silip yeniden dene. Hangi dosyanın yüklendiğini <code>print(random.__file__)</code> ile görebilirsin.' },
    { q: 'random.seed ile random.Random(tohum) arasında ne fark var?', a: '<code>random.seed</code> tüm programın paylaştığı gizli üreteci tohumlar; başka bir yerdeki <code>random</code> çağrıları sıranı değiştirir ve sen de onlarınkini. <code>random.Random(tohum)</code> yalnız sana ait bağımsız bir üreteç verir; testler ve simülasyonlar için daha güvenlidir.' }
  ],
  mistakes: [
    { bad: 'from math import *\nprint(pow(2, 10, 1000))', good: 'import math\nprint(pow(2, 10, 1000), math.sqrt(2))', why: 'import * math.pow ile yerleşik pow\'u ezer; üç argümanlı çağrı TypeError verir. Modülü adıyla içe aktar.' },
    { bad: '# dosya adı: random.py\nimport random\nprint(random.randint(1, 6))', good: '# dosya adı: zar_simulasyonu.py\nimport random\nprint(random.randint(1, 6))', why: 'Standart modülle aynı adı taşıyan dosya, import sırasında standart modülün yerine yüklenir.' }
  ]
}
);
})(window);
