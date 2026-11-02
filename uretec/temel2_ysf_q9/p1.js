/* PythonPatika — Temel seviye 2. bölüm: Akış Kontrolü, Fonksiyonlar ve Modüller, Dosya ve Hata, Bitirme */
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
    'Anadolu Bank kredi uygunluk kuralı gibi bir iş kuralını koda dökebilirim.'
  ],
  body: `
<h2>Neden önemli?</h2>
<p>Şimdiye kadar yazdığın programlar yukarıdan aşağıya, hiç sapmadan çalıştı. Oysa gerçek iş kuralları hep "eğer ... ise" diye başlar: <i>Eğer sepet tutarı 500 TL'yi geçerse kargo bedava. Eğer başvuranın yaşı 18'in altındaysa krediyi reddet. Eğer stok sıfırsa "tükendi" yaz.</i> Anadolu Bank'ta bir kredi uzmanının her gün uyguladığı kuralı Python'a öğretmek için koşul (condition) yapısına ihtiyacın var.</p>

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
    """Anadolu Bank bireysel kredi ön değerlendirme kuralı."""
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
      q: '<p>Anadolu Bank ön değerlendirme kuralı: <code>kredi_uygun(yas, gelir, kredi_notu)</code> fonksiyonunu yaz. Başvuran <b>18 yaş ve üzeri</b>, aylık geliri <b>en az 25000</b> ve kredi notu <b>en az 600</b> ise <code>True</code>, aksi halde <code>False</code> döndürsün.</p>',
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
      q: '<p>Anadolu Bank ATM kuralı: <code>para_cekme(bakiye, tutar, kart_aktif)</code> fonksiyonu <b>erken dönüş</b> kalıbıyla şu metinlerden birini döndürsün: kart aktif değilse <code>"RED: kart pasif"</code>; tutar 0 veya negatifse <code>"RED: geçersiz tutar"</code>; tutar bakiyeden büyükse <code>"RED: yetersiz bakiye"</code>; aksi halde <code>"ONAY"</code>.</p>',
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
    { t: 'code', id: 'donguler-3',
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
},
