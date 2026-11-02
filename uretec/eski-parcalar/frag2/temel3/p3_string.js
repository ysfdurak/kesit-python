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
