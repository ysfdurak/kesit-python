/* Kesit Python v2 — uzantı: string-bicimleme */
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
{ id: 'string-bicimleme',
  min: 40,
  html: `
<h2>Belirteç dilinin tamamı</h2>
<p>Derste belirtecin en sık kullanılan parçalarını gördün. Resmi adıyla biçim belirteci mini dili (format specification mini-language) şu sırayla okunur ve her parça isteğe bağlıdır:</p>
<pre class="out">[[dolgu]hizalama][işaret][#][0][genişlik][gruplama][.duyarlık][tür]</pre>
<div class="tbl-wrap"><table>
<tr><th>Parça</th><th>Seçenekler</th><th>Örnek</th><th>Sonuç</th></tr>
<tr><td>Hizalama</td><td><code>&lt;</code> <code>&gt;</code> <code>^</code> <code>=</code> (işaretten sonra doldur)</td><td><code>f"{-3.14:=+9.2f}"</code></td><td><code>-    3.14</code></td></tr>
<tr><td>İşaret</td><td><code>+</code> (her zaman), <code>-</code> (varsayılan), boşluk</td><td><code>f"{12.5:+.1f}"</code></td><td><code>+12.5</code></td></tr>
<tr><td><code>#</code></td><td>Alternatif biçim: önek ekler</td><td><code>f"{255:#x}"</code></td><td><code>0xff</code></td></tr>
<tr><td><code>0</code></td><td>Sayıyı sıfırla doldur</td><td><code>f"{42:06d}"</code></td><td><code>000042</code></td></tr>
<tr><td>Gruplama</td><td><code>,</code> ya da <code>_</code></td><td><code>f"{1234567:_}"</code></td><td><code>1_234_567</code></td></tr>
<tr><td>Tür</td><td><code>d</code> <code>f</code> <code>e</code> <code>g</code> <code>%</code> <code>b</code> <code>o</code> <code>x</code> <code>s</code></td><td><code>f"{10:08b}"</code></td><td><code>00001010</code></td></tr>
</table></div>
<pre class="py">degisim = [12.5, -3.25, 0.0]
for d in degisim:
    print(f"{d:+7.2f}%")                # işaret her zaman görünür

siparis_no = 42
print(f"AM-{siparis_no:06d}")           # sıfır dolgulu numara
print(str(siparis_no).zfill(6))          # metin yöntemiyle aynı iş
print(f"{255:#x} {255:#o} {10:08b}")     # onaltılık, sekizlik, ikilik
print(f"{0.256:.1%}", f"{1234.5:g}", f"{0.00001234:g}")</pre>
<p><code>g</code> türü "akıllı" gösterimdir: sayının büyüklüğüne göre sabit ya da bilimsel gösterimi seçer ve gereksiz sıfırları atar. Fatura, sipariş ve müşteri numaralarında ise sıfır dolgusu (<code>06d</code>) standarttır; sıralamada "AM-000042"nin "AM-000100"den önce gelmesini sağlar.</p>

<h2>İç içe alanlar: dinamik genişlik</h2>
<p>Genişlik ve ondalık sayısı da birer ifade olabilir: belirtecin içine yeni bir <code>{}</code> yazarsın. Sütun genişliğini veriden hesaplayan tablolar böyle kurulur.</p>
<pre class="py">urunler = [("çay", 5.5), ("filtre kahve", 120), ("su", 7.25)]
genislik = max(len(ad) for ad, _ in urunler) + 2
ondalik = 2
print(f"{'Ürün':&lt;{genislik}}{'Fiyat':&gt;10}")
print("-" * (genislik + 10))
for ad, fiyat in urunler:
    print(f"{ad:.&lt;{genislik}}{fiyat:&gt;10.{ondalik}f}")</pre>

<h2>!r, !s ve = ile hata ayıklama</h2>
<p>Alanın sonuna <code>!r</code> eklersen değer <code>repr()</code> ile, yani "programcı gözüyle" gösterilir: metinler tırnaklı, görünmeyen boşluklar ve özel karakterler görünür hale gelir. Kullanıcıdan ya da dosyadan gelen bir değerin neden eşleşmediğini anlamanın en hızlı yolu budur. <code>=</code> eki ise ifadenin kendisini de yazar.</p>
<pre class="py">sehir = "İzmir "                         # sonda gizli boşluk
print(f"[{sehir}]  [{sehir!r}]")
print(f"{sehir == 'İzmir'=}")
print(f"{len(sehir)=}, {sehir.strip()!r}")
satir = "Ayşe\\tİzmir\\n"
print(f"{satir!r}")                       # sekme ve satır sonu görünür</pre>

<h2>Eski % biçimlendirme ve logging</h2>
<p>Yeni kodda f-string yazarsın ama <code>%</code> biçimini tanıman gerekir: eski projelerde ve özellikle <code>logging</code> modülünde hâlâ kullanılır. <code>%s</code> metin, <code>%d</code> tam sayı, <code>%.2f</code> ondalık demektir; değerler <code>%</code> işaretinden sonra demet olarak verilir. Tür uyuşmazsa (<code>%d</code>'ye metin vermek) <code>TypeError</code> alırsın.</p>
<pre class="py">ad, tutar, adet = "Ayşe", 1250.5, 3
print("%s: %d ürün, %.2f TL" % (ad, adet, tutar))
print("%-8s|%8.1f|" % (ad, tutar))       # - sola hizalar
# logging.info("Sipariş %s alındı", no)  → değer, mesaj gerçekten yazılacaksa birleştirilir</pre>
<p>Logging'de <code>logging.info(f"... {no}")</code> yerine <code>logging.info("... %s", no)</code> yazılmasının sebebi budur: mesaj seviyesi kapalıysa birleştirme hiç yapılmaz. Ayrıntısını Loglama dersinde göreceksin.</p>

<h2>Dışarıdan gelen şablonlar: string.Template</h2>
<p>SMS ya da e-posta metnini pazarlama ekibi yazıyorsa şablon kullanıcıdan gelir. Böyle şablonlarda f-string ve <code>str.format</code> risklidir: <code>format</code> şablonu nesnelerin niteliklerine erişebilir (<code>{musteri.__class__}</code>). <code>string.Template</code> yalnızca <code>$ad</code> biçimindeki basit yer tutucuları doldurur; <code>safe_substitute</code> eksik alanları hata vermeden olduğu gibi bırakır.</p>
<pre class="py">from string import Template

sablon = Template("Sayın $ad, $tutar TL tutarlı siparişiniz $kargo ile yola çıktı.")
print(sablon.substitute(ad="Ayşe Kaya", tutar="1.250,00", kargo="Anadolu Kargo"))
print(sablon.safe_substitute(ad="Can"))   # eksikler aynen kalır
try:
    sablon.substitute(ad="Can")
except KeyError as h:
    print("Eksik alan:", h)</pre>

<h2>Uzun metinler: textwrap</h2>
<p>Ürün açıklaması ya da adres gibi uzun metinleri sabit genişlikte satırlara bölmek için <code>textwrap.fill</code>, tek satıra sığdırıp sonunu kısaltmak için <code>textwrap.shorten</code> kullanılır. İkisi de kelimeleri bölmez.</p>
<pre class="py">import textwrap
aciklama = "Paslanmaz çelik gövdeli, 1.7 litre kapasiteli, otomatik kapanma özellikli su ısıtıcısı."
print(textwrap.fill(aciklama, width=30))
print(textwrap.shorten(aciklama, width=40, placeholder="..."))</pre>
<div class="note"><b>Gerçek işte</b>Raporlama işinin büyük kısmı biçimlendirmedir: muhasebe Türkçe para biçimi ister, banka ekstresi sağa yaslı ve işaretli tutar ister, fatura numaraları sıfır dolguludur, SMS 160 karakteri geçmemelidir. Ekipler bu kuralları bir kez <code>bicim.py</code> gibi küçük bir modülde fonksiyon olarak yazar (<code>tl()</code>, <code>yuzde()</code>, <code>fatura_no()</code>) ve tüm raporlar onları kullanır. Daha büyük HTML/e-posta şablonları için Jinja2'yi Şablonla rapor üretme dersinde göreceksin.</div>
`,
  ex: [
    { t: 'mc',
      stage: 'Isınma',
      q: '<code>f"{42:+06.1f}"</code> ifadesinin sonucu hangisidir?',
      o: ['+42.0', '+042.0', '0+42.0', '00042.0'],
      a: 1,
      why: 'Toplam genişlik 6, sıfır dolgu ve her zaman işaret: işaret en başa, sıfırlar işaretten sonra gelir: "+042.0" (6 karakter).' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Sayı tabanları ve sıfır dolgusu: bu kod ne yazdırır?',
      code: 'print(f"{255:#x} {255:08b} {5:03d}")\n',
      o: ['ff 11111111 005', '0xff 11111111 005', '0xff 011111111 5', '0xff 255 005'],
      a: 1,
      why: '#x onaltılık gösterime 0x öneki ekler. 08b ikilik gösterimi 8 haneye tamamlar (255 zaten 8 bit). 03d 5\'i 3 haneye sıfırla doldurur.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: '!r ve = ile hata ayıklama: bu kod ne yazdırır?',
      code: 'ad = "Ayşe "\nprint(f"[{ad}] [{ad!r}] {len(ad)=}")\n',
      o: ["[Ayşe] ['Ayşe'] len(ad)=4", "[Ayşe ] ['Ayşe '] len(ad)=5", "[Ayşe ] [Ayşe ] 5", "[Ayşe ] ['Ayşe '] 5"],
      a: 1,
      why: '!r değeri repr ile tırnaklı gösterir ve sondaki boşluk görünür olur. = eki ifadenin metnini ve değerini birlikte yazar: len(ad)=5.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'İç içe alanlar: bu kod ne yazdırır?',
      code: 'w = 8\nfor ad, t in [("çay", 5.5), ("kahve", 120)]:\n    print(f"{ad:.<{w}}{t:>{w}.1f}")\n',
      o: ['çay.....     5.5\nkahve...   120.0', 'çay..... 5.5\nkahve... 120.0', '.....çay     5.5\n...kahve   120.0', 'çay     .....5.5\nkahve   ...120.0'],
      a: 0,
      why: '{w} yerine 8 konur: ad 8 karakterde sola yaslanır ve noktayla doldurulur; tutar 8 karakterde sağa yaslanır, 1 ondalıkla.' },
    { t: 'order',
      stage: 'Kodu oku',
      q: '<p>Tutarı Türkçe biçime (1.234.567,89 TL) çeviren fonksiyonun satırlarını sırala. Karakter takasının sırası önemli!</p>',
      lines: ['def tl(tutar):', '    metin = f"{tutar:,.2f}"', '    metin = metin.replace(",", "_")', '    metin = metin.replace(".", ",")', '    metin = metin.replace("_", ".")', '    return metin + " TL"', 'print(tl(1234567.891), tl(-50))'],
      expect: '1.234.567,89 TL -50,00 TL\n',
      hint: 'Önce binlik virgülleri geçici bir karaktere taşı; yoksa ondalık noktayı virgüle çevirdiğinde hangi virgülün hangisi olduğu karışır.',
      why: 'Üç adımlı takas: binlik "," → "_", ondalık "." → ",", geçici "_" → ".". Geçici karakter olmadan iki dönüşüm birbirini ezerdi.' },
    { id: 'string-bicimleme-x1',
      t: 'code',
      stage: 'Rehberli',
      diff: 1,
      q: '<p><code>fatura_no(seri, yil, sira)</code> fonksiyonunu yaz: <code>"AM-2025-000042"</code> biçiminde fatura numarası döndürsün. Seri büyük harfe çevrilsin, sıra numarası 6 haneye sıfırla doldurulsun. Sıra 1 ile 999999 arasında değilse <code>ValueError</code> fırlat.</p>',
      guide: ['Önce sırayı doğrula: if not 1 <= sira <= 999999: raise ValueError(...)', 'Seriyi .upper() ile büyük harfe çevir.', 'f-string içinde sıra için 06d belirtecini kullan.'],
      example: 'musteri = 7\nprint(f"M-{musteri:05d}")\nprint(f"{"tr":>4}".upper())\n',
      start: 'def fatura_no(seri, yil, sira):\n    # TODO: doğrulama ve sıfır dolgusu\n    return f"{seri}-{yil}-{sira}"\n',
      sol: 'def fatura_no(seri, yil, sira):\n    if not 1 <= sira <= 999999:\n        raise ValueError("sıra 1-999999 arasında olmalı")\n    return f"{seri.upper()}-{yil}-{sira:06d}"\n',
      tests: 'assert fatura_no("am", 2025, 42) == "AM-2025-000042", f"gelen {fatura_no(\'am\', 2025, 42)}"\nassert fatura_no("AB", 2024, 999999) == "AB-2024-999999", "en büyük sıra"\nassert fatura_no("x", 2025, 1) == "X-2025-000001", "en küçük sıra"\nfor kotu in [0, 1000000, -5]:\n    try:\n        fatura_no("AM", 2025, kotu)\n        assert False, f"sira={kotu} için ValueError bekleniyordu"\n    except ValueError:\n        pass\n',
      hints: ['Sıfır dolgu: f"{sayi:06d}"', 'Zincirleme karşılaştırma: 1 <= sira <= 999999'],
      why: 'Sabit genişlikli, sıfır dolgulu numaralar metin olarak sıralandığında da doğru sırada durur; doğrulama, 7 haneli bir sıranın biçimi bozmasını engeller.' },
    { id: 'string-bicimleme-x2',
      t: 'code',
      stage: 'Rehberli',
      diff: 2,
      q: '<p><code>otomatik_tablo(basliklar, satirlar)</code> fonksiyonunu yaz. Her sütunun genişliği, o sütundaki en uzun değerin (başlık dahil, <code>str()</code> hâlinin) uzunluğu olsun. Sayı (<code>int</code>/<code>float</code>) sütunlarını sağa, metinleri sola yasla; başlıkları da kendi sütununun yönünde yasla. Sütunlar <code>" | "</code> ile ayrılsın. Satırlar: başlık, ardından tablo genişliği kadar <code>"-"</code>, ardından veri satırları. Tüm satırları <code>"\\n"</code> ile birleştirip döndür. Bir sütunun sayı olup olmadığına <b>ilk veri satırına</b> bakarak karar ver.</p>',
      guide: ['Her sütun i için genişlik: başlığın ve tüm satırlardaki str(satir[i]) değerlerinin en uzunu.', 'Her sütun için hizalama: ilk satırdaki değer int ya da float ise ">", değilse "<".', 'Bir satırı biçimlendiren iç fonksiyon yaz: f"{str(deger):{hiza}{genislik}}" parçalarını " | ".join ile birleştir.', 'Başlık satırı, tire satırı (len(baslik_satiri) kadar) ve veri satırlarını listeye koy, "\\n".join ile döndür.'],
      example: 'veri = ["çay", "filtre kahve"]\nw = max(len(x) for x in veri)\nfor x in veri:\n    print(f"{x:<{w}}|{len(x):>{3}}|")\n',
      start: 'def otomatik_tablo(basliklar, satirlar):\n    genislikler = []\n    hizalar = []\n    for i, b in enumerate(basliklar):\n        # TODO: sütun genişliği ve hizası\n        genislikler.append(len(b))\n        hizalar.append("<")\n\n    def satir_yaz(degerler):\n        # TODO: her değeri kendi genişlik ve hizasıyla biçimle\n        return " | ".join(str(d) for d in degerler)\n\n    ust = satir_yaz(basliklar)\n    sonuc = [ust, "-" * len(ust)]\n    for s in satirlar:\n        sonuc.append(satir_yaz(s))\n    return "\\n".join(sonuc)\n',
      sol: 'def otomatik_tablo(basliklar, satirlar):\n    genislikler = []\n    hizalar = []\n    for i, b in enumerate(basliklar):\n        en = len(b)\n        for s in satirlar:\n            en = max(en, len(str(s[i])))\n        genislikler.append(en)\n        sayi = bool(satirlar) and isinstance(satirlar[0][i], (int, float))\n        hizalar.append(">" if sayi else "<")\n\n    def satir_yaz(degerler):\n        parcalar = []\n        for d, w, h in zip(degerler, genislikler, hizalar):\n            parcalar.append(f"{str(d):{h}{w}}")\n        return " | ".join(parcalar)\n\n    ust = satir_yaz(basliklar)\n    sonuc = [ust, "-" * len(ust)]\n    for s in satirlar:\n        sonuc.append(satir_yaz(s))\n    return "\\n".join(sonuc)\n',
      tests: 't = otomatik_tablo(["Şehir", "Sipariş", "Ciro"], [["İzmir", 12, 4500.5], ["Eskişehir", 3, 980.0]])\nbeklenen = "Şehir     | Sipariş |   Ciro\\n----------------------------\\nİzmir     |      12 | 4500.5\\nEskişehir |       3 |  980.0"\nassert t == beklenen, "tablo farklı. Beklenen:\\n" + beklenen + "\\nGelen:\\n" + t\nassert otomatik_tablo(["A"], []) == "A\\n-", "veri yoksa yalnız başlık ve tire"\n',
      hints: ['Genişlik: max(len(baslik), len(str(her değer))).', 'İç içe alan: f"{metin:{hiza}{genislik}}" (hiza "<" ya da ">").', 'Tire satırı başlık satırının uzunluğunda olmalı: "-" * len(ust)'],
      why: 'Sütun genişliğini veriden hesaplayıp iç içe alanlarla biçimlemek, hiçbir sabit sayı yazmadan her veri kümesine uyan bir tablo üretir. Sayıların sağa yaslanması basamakların alt alta gelmesini sağlar.' },
    { id: 'string-bicimleme-x3',
      t: 'code',
      stage: 'Rehberli',
      diff: 2,
      q: '<p><code>urun_karti(ad, aciklama, fiyat, genislik=30)</code> fonksiyonunu yaz. Şu satırlardan oluşan metni döndürsün (satırlar <code>"\\n"</code> ile ayrılır):</p><ol><li><code>"=" * genislik</code></li><li>Ürün adı büyük harfle, genişlik içinde ortalanmış</li><li>Açıklama <code>textwrap.fill(aciklama, width=genislik)</code> ile bölünmüş (birden fazla satır olabilir)</li><li>Fiyat: <code>"Fiyat:"</code> sola, <code>"1,299.90 TL"</code> biçimindeki tutar sağa yaslı ve toplam satır uzunluğu <code>genislik</code></li><li><code>"=" * genislik</code></li></ol>',
      guide: ['textwrap modülünü içe aktar.', 'Başlık: ad.upper().center(genislik) ya da f"{ad.upper():^{genislik}}"', 'Fiyat metnini önce oluştur: f"{fiyat:,.2f} TL"; sonra "Fiyat:" + tutar metnini genislik - 6 karakterde sağa yasla.', 'Parçaları bir listeye koyup "\\n".join ile birleştir.'],
      example: 'import textwrap\nprint(textwrap.fill("Bir iki üç dört beş altı yedi sekiz", width=12))\nw = 20\nprint("Toplam:" + f"{"45.00 TL":>{w - 7}}")\n',
      start: 'import textwrap\n\ndef urun_karti(ad, aciklama, fiyat, genislik=30):\n    satirlar = ["=" * genislik]\n    # TODO: başlık, açıklama, fiyat satırları\n    satirlar.append("=" * genislik)\n    return "\\n".join(satirlar)\n',
      sol: 'import textwrap\n\ndef urun_karti(ad, aciklama, fiyat, genislik=30):\n    satirlar = ["=" * genislik]\n    satirlar.append(f"{ad.upper():^{genislik}}")\n    satirlar.append(textwrap.fill(aciklama, width=genislik))\n    tutar = f"{fiyat:,.2f} TL"\n    satirlar.append("Fiyat:" + f"{tutar:>{genislik - 6}}")\n    satirlar.append("=" * genislik)\n    return "\\n".join(satirlar)\n',
      tests: 'k = urun_karti("su ısıtıcı", "Paslanmaz çelik gövdeli, 1.7 litre kapasiteli, otomatik kapanma özellikli.", 1299.9)\nbeklenen = "==============================\\n          SU ISITICI          \\nPaslanmaz çelik gövdeli, 1.7\\nlitre kapasiteli, otomatik\\nkapanma özellikli.\\nFiyat:                1,299.90 TL\\n=============================="\nbeklenen = beklenen.replace("Fiyat:                1,299.90 TL", "Fiyat:" + " " * 13 + "1,299.90 TL")\nassert k == beklenen, "kart farklı. Beklenen:\\n" + beklenen + "\\nGelen:\\n" + k\nassert all(len(s) <= 30 for s in k.split("\\n")), "hiçbir satır 30 karakteri geçmemeli"\nassert urun_karti("a", "b", 5, 12).split("\\n")[-2] == "Fiyat:" + "5.00 TL".rjust(6), "genişlik parametresi kullanılmalı"\n',
      hints: ['Ortalamak için ^ hizası: f"{metin:^{genislik}}"', 'Fiyat satırı: "Fiyat:" 6 karakter; tutarı genislik - 6 karakterde sağa yasla.', 'textwrap.fill zaten satır sonlarıyla bölünmüş tek bir metin döndürür.'],
      why: 'Sabit genişlikli kartlar fiş yazıcılarında ve terminal raporlarında kullanılır. Genişliği parametre yapıp tüm satırları ondan türetmek, kartın her boyutta düzgün hizalanmasını sağlar.' },
    { id: 'string-bicimleme-x4',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p>Pazarlama ekibinin yazdığı SMS şablonlarını dolduran <code>sms_hazirla(sablon_metni, veri, limit=160)</code> fonksiyonunu yaz. <code>string.Template</code> ve <code>safe_substitute</code> kullan (eksik alanlar hata vermesin, olduğu gibi kalsın). Sonuç <code>limit</code> karakteri aşıyorsa ilk <code>limit - 3</code> karakteri alıp sonuna <code>"..."</code> ekle. <code>str.format</code> ya da f-string ile şablon doldurma.</p>',
      start: 'def sms_hazirla(sablon_metni, veri, limit=160):\n    pass\n',
      sol: 'from string import Template\n\ndef sms_hazirla(sablon_metni, veri, limit=160):\n    metin = Template(sablon_metni).safe_substitute(veri)\n    if len(metin) > limit:\n        metin = metin[:limit - 3] + "..."\n    return metin\n',
      tests: 's = "Sayın $ad, $kod kodlu siparişiniz yola çıktı."\nassert sms_hazirla(s, {"ad": "Ayşe", "kod": "AM-42"}) == "Sayın Ayşe, AM-42 kodlu siparişiniz yola çıktı.", "alanlar doldurulmalı"\nassert sms_hazirla(s, {"ad": "Can"}) == "Sayın Can, $kod kodlu siparişiniz yola çıktı.", "eksik alan olduğu gibi kalmalı"\nr = sms_hazirla("$x " * 100, {"x": "kampanya"})\nassert len(r) == 160 and r.endswith("..."), "160 karakteri aşan metin kısaltılmalı"\nassert sms_hazirla("{musteri.__class__} $ad", {"ad": "A"}) == "{musteri.__class__} A", "süslü parantezler şablon olarak işlenmemeli"\nassert ".format(" not in __source__, "str.format kullanma"\n',
      hints: ['from string import Template', 'Template(sablon_metni).safe_substitute(veri)', 'Kısaltma: metin[:limit - 3] + "..."'],
      why: 'Template yalnız $ad yer tutucularını tanır; kullanıcı yazımı şablonlarda nesne niteliklerine erişemez. safe_substitute eksik alanda programı düşürmez; uzunluk sınırı SMS maliyetini sabit tutar.' },
    { id: 'string-bicimleme-x5',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p>Locale ayarına bağlı kalmadan Türkçe tarih yazan <code>tr_tarih(yil, ay, gun)</code> fonksiyonunu yaz: <code>"7 Mart 2025 Cuma"</code> biçiminde. <code>datetime.date(yil, ay, gun)</code> ile tarih nesnesi kur; ay ve gün adlarını kendi listelerinden al (<code>weekday()</code> pazartesi için 0 döndürür). Gün sıfır dolgusuz olsun.</p>',
      start: 'import datetime\n\ndef tr_tarih(yil, ay, gun):\n    pass\n',
      sol: 'import datetime\n\nAYLAR = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"]\nGUNLER = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"]\n\ndef tr_tarih(yil, ay, gun):\n    t = datetime.date(yil, ay, gun)\n    return f"{t.day} {AYLAR[t.month - 1]} {t.year} {GUNLER[t.weekday()]}"\n',
      tests: 'assert tr_tarih(2025, 3, 7) == "7 Mart 2025 Cuma", f"gelen {tr_tarih(2025, 3, 7)}"\nassert tr_tarih(2024, 2, 29) == "29 Şubat 2024 Perşembe", "artık yıl"\nassert tr_tarih(2026, 1, 1) == "1 Ocak 2026 Perşembe", "yılbaşı"\nassert tr_tarih(2025, 12, 28) == "28 Aralık 2025 Pazar", "pazar = 6"\ntry:\n    tr_tarih(2025, 2, 30)\n    assert False, "geçersiz tarih ValueError vermeli (datetime.date bunu kendisi yapar)"\nexcept ValueError:\n    pass\n',
      hints: ['Ay listesinde indeks 0 Ocak\'tır: AYLAR[t.month - 1]', 'GUNLER[t.weekday()] (0 = Pazartesi).'],
      why: '%B ve %A belirteçleri sistem locale\'ine göre değişir; sunucuda İngilizce çıkabilir. Kendi ad listelerin her ortamda aynı sonucu verir; datetime.date ise geçersiz tarihleri kendisi reddeder.' },
    { id: 'string-bicimleme-x6',
      t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      diff: 1,
      q: '<p>Hatayı bul ve düzelt. <code>log_satiri(seviye, mesaj, sure)</code> eski stil <code>%</code> biçimlendirmeyle <code>"[UYARI] Stok az (12.35 ms)"</code> gibi bir satır döndürmeli. Kod <code>TypeError: %d format: a real number is required</code> veriyor ve süre de 2 ondalıklı çıkmıyor.</p>',
      start: 'def log_satiri(seviye, mesaj, sure):\n    return "[%s] %d (%d ms)" % (seviye, mesaj, sure)\n',
      sol: 'def log_satiri(seviye, mesaj, sure):\n    return "[%s] %s (%.2f ms)" % (seviye, mesaj, sure)\n',
      tests: 'assert log_satiri("UYARI", "Stok az", 12.345) == "[UYARI] Stok az (12.35 ms)" or log_satiri("UYARI", "Stok az", 12.345) == "[UYARI] Stok az (12.34 ms)", f"gelen {log_satiri(\'UYARI\', \'Stok az\', 12.345)}"\nassert log_satiri("BILGI", "Tamam", 3) == "[BILGI] Tamam (3.00 ms)", "süre 2 ondalıklı"\n',
      hints: ['%d tam sayı ister; metin için %s kullanılır.', 'Ondalık için %.2f.'],
      why: '% biçiminde her yer tutucu bir tür bekler: %s metin, %d tam sayı, %.2f iki ondalıklı sayı. Tür uyuşmazlığı TypeError verir; %d ondalık kısmı da atar.' },
    { id: 'string-bicimleme-x7',
      t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      diff: 2,
      q: '<p>Hatayı bul ve düzelt. <code>json_satiri(no, ad)</code> <code>{"no": 7, "ad": "Ayşe"}</code> biçiminde bir metin döndürmeli. <code>str.format</code> ile yazılmış kod <code>KeyError</code> veriyor, çünkü şablondaki süslü parantezler yer tutucu sanılıyor.</p>',
      start: 'def json_satiri(no, ad):\n    return \'{"no": {}, "ad": "{}"}\'.format(no, ad)\n',
      sol: 'def json_satiri(no, ad):\n    return \'{{"no": {}, "ad": "{}"}}\'.format(no, ad)\n',
      tests: 'assert json_satiri(7, "Ayşe") == \'{"no": 7, "ad": "Ayşe"}\', f"gelen {json_satiri(7, \'Ayşe\')}"\nassert json_satiri(12, "Can") == \'{"no": 12, "ad": "Can"}\', "ikinci kayıt"\n',
      hints: ['format ve f-string içinde gerçek süslü parantez yazmak için ikiler: {{ ve }}', 'Yalnız dıştaki (JSON\'a ait) parantezleri ikile; {} yer tutucuları kalsın.'],
      why: '{{ ve }} kaçış dizileridir ve tek süslü parantez olarak yazılır. Gerçek projelerde JSON üretirken elle biçimlendirme yerine json.dumps kullanılır; JSON ve CSV dersinde göreceksin.' },
    { id: 'string-bicimleme-x8',
      t: 'code',
      stage: 'Meydan okuma',
      diff: 3,
      q: '<p>Çek ve dekontlarda tutar yazıyla da yazılır. <code>yaziyla(n)</code> fonksiyonunu yaz: 0 ile 999.999.999 arasındaki tam sayıyı Türkçe sözcüklerle, aralarında birer boşlukla döndürsün. Kurallar:</p><ul><li><code>0</code> → <code>"sıfır"</code></li><li>Yüzler basamağı 1 ise yalnız <code>"yüz"</code> (bir yüz değil): 101 → <code>"yüz bir"</code></li><li>Binler grubu 1 ise yalnız <code>"bin"</code>: 1001 → <code>"bin bir"</code>; ama 101.000 → <code>"yüz bir bin"</code></li><li>Milyonda <code>"bir"</code> yazılır: 1.000.000 → <code>"bir milyon"</code></li></ul><p>Örnek: 2025 → <code>"iki bin yirmi beş"</code>, 110001 → <code>"yüz on bin bir"</code>. Aralık dışı için <code>ValueError</code>.</p>',
      start: 'def yaziyla(n):\n    pass\n',
      sol: 'BIRLER = ["", "bir", "iki", "üç", "dört", "beş", "altı", "yedi", "sekiz", "dokuz"]\nONLAR = ["", "on", "yirmi", "otuz", "kırk", "elli", "altmış", "yetmiş", "seksen", "doksan"]\n\ndef _uc_basamak(n):\n    yuz, kalan = divmod(n, 100)\n    on, bir = divmod(kalan, 10)\n    parca = []\n    if yuz == 1:\n        parca.append("yüz")\n    elif yuz > 1:\n        parca.extend([BIRLER[yuz], "yüz"])\n    if on:\n        parca.append(ONLAR[on])\n    if bir:\n        parca.append(BIRLER[bir])\n    return parca\n\ndef yaziyla(n):\n    if not 0 <= n <= 999_999_999:\n        raise ValueError("aralık dışı")\n    if n == 0:\n        return "sıfır"\n    milyon, kalan = divmod(n, 1_000_000)\n    bin_, birler = divmod(kalan, 1000)\n    sozcukler = []\n    if milyon:\n        sozcukler += _uc_basamak(milyon) + ["milyon"]\n    if bin_ == 1:\n        sozcukler.append("bin")\n    elif bin_:\n        sozcukler += _uc_basamak(bin_) + ["bin"]\n    sozcukler += _uc_basamak(birler)\n    return " ".join(sozcukler)\n',
      tests: 'durumlar = {0: "sıfır", 7: "yedi", 10: "on", 19: "on dokuz", 100: "yüz", 101: "yüz bir", 999: "dokuz yüz doksan dokuz", 1000: "bin", 1001: "bin bir", 2025: "iki bin yirmi beş", 101000: "yüz bir bin", 110001: "yüz on bin bir", 1000000: "bir milyon", 1001000: "bir milyon bin", 2500300: "iki milyon beş yüz bin üç yüz", 999999999: "dokuz yüz doksan dokuz milyon dokuz yüz doksan dokuz bin dokuz yüz doksan dokuz"}\nfor sayi, beklenen in durumlar.items():\n    gelen = yaziyla(sayi)\n    assert gelen == beklenen, f"{sayi}: beklenen \'{beklenen}\', gelen \'{gelen}\'"\nfor kotu in [-1, 1000000000]:\n    try:\n        yaziyla(kotu)\n        assert False, f"{kotu} için ValueError bekleniyordu"\n    except ValueError:\n        pass\n',
      hints: ['Sayıyı üçlü gruplara böl: divmod(n, 1_000_000) ve divmod(kalan, 1000).', 'Her üçlü grup için yardımcı fonksiyon: yüzler (1 ise yalnız "yüz"), onlar ve birler için iki ayrı liste.', 'Binler grubu tam olarak 1 ise yalnız "bin" yaz; milyonda bu istisna yok.'],
      why: 'Problemi üç basamaklı gruplara bölüp aynı yardımcıyı her gruba uygulamak, kuralları tek yerde toplar. Türkçenin iki istisnası (yüz ve bin önünde "bir" yazılmaması) yalnız ilgili yerde ele alınır; milyon için geçerli değildir.' }
  ],
  faq: [
    { q: 'zfill ile f"{n:06d}" arasında fark var mı?', a: 'Sonuç çoğu zaman aynıdır. <code>zfill</code> bir metin yöntemidir ve metin üzerinde çalışır (<code>"42".zfill(6)</code>), işaretli sayılarda işareti başta tutar. f-string belirteci sayı üzerinde çalışır ve diğer belirteçlerle (işaret, gruplama) birleştirilebilir.' },
    { q: 'Kullanıcı şablonu için neden f-string kullanamıyorum?', a: 'f-string kod yazarken sabittir; çalışma anında gelen bir metni f-string\'e çeviremezsin (eval gerekir ve çok tehlikelidir). <code>str.format</code> ise şablonun nesne niteliklerine erişmesine izin verir. Dışarıdan gelen şablonlar için <code>string.Template</code> ya da sınırlı bir şablon motoru (Jinja2 sandbox) kullanılır.' }
  ],
  mistakes: [
    { bad: '"%s: %d" % ("Stok", "az")', good: '"%s: %s" % ("Stok", "az")', why: '% biçiminde %d tam sayı bekler; metin verilirse TypeError olur. Türden emin değilsen %s kullan ya da f-string\'e geç.' },
    { bad: '"{"no": {}}".format(7)', good: '"{{\\"no\\": {}}}".format(7)', why: 'format şablonunda gerçek süslü parantez {{ ve }} ile yazılır; tek parantez yer tutucu sanılır ve KeyError/ValueError verir.' }
  ]
}
);
})(window);
