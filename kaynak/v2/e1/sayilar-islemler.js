/* PythonPatika — 'sayilar-islemler' dersi uzantısı (Derinleş + ek alıştırmalar) */
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
  {
    id: 'sayilar-islemler',
    min: 25,
    html: `<p>Operatörlerin tamamını (karşılaştırma, mantıksal, bit, öncelik) <b>Operatörler</b> dersinde ayrıca göreceksin. Bu bölüm sayıların kendisine odaklanıyor: yazım biçimleri, özel değerler, güvenilir yuvarlama ve finans hesaplarında gerçekten kullanılan araçlar.</p><h2>Sayı yazım biçimleri (literal)</h2><p>Python bir sayıyı birçok biçimde yazmana izin verir; hepsi aynı <code>int</code> ya da <code>float</code> türüne dönüşür:</p><div class="tbl-wrap"><table><tr><th>Yazım</th><th>Değer</th><th>Nerede görürsün?</th></tr><tr><td><code>1_250_000</code></td><td>1250000</td><td>Büyük tutarlar; alt çizgi yalnız okunurluk için</td></tr><tr><td><code>1.5e6</code>, <code>2e-3</code></td><td>1500000.0, 0.002</td><td>Bilimsel gösterim; sonuç hep float</td></tr><tr><td><code>0b1011</code></td><td>11</td><td>İkilik taban: izin bayrakları</td></tr><tr><td><code>0o755</code></td><td>493</td><td>Sekizlik: Linux dosya izinleri</td></tr><tr><td><code>0xFF</code></td><td>255</td><td>Onaltılık: renk kodları, bellek adresleri</td></tr><tr><td><code>3 + 4j</code></td><td>complex</td><td>Karmaşık sayı: mühendislik hesapları</td></tr></table></div><pre class="py">print(1_250_000 + 1, 1.5e6, 2e-3)
print(0b1011, 0o755, 0xFF)
print(bin(11), hex(255), oct(493))      # tersine: sayıdan metne
print(int("ff", 16), int("1011", 2))    # metinden, tabanı vererek
z = 3 + 4j
print(z.real, z.imag, abs(z))           # karmaşık sayının büyüklüğü 5.0</pre><p><code>int(metin, taban)</code> özellikle veri temizlemede işe yarar: renk kodları, donanım kimlikleri ya da bazı banka sistemlerinin onaltılık işlem numaraları bu yolla sayıya çevrilir. Karmaşık sayılar (complex) PCEP sınavında sorulur ama iş hayatında nadirdir; varlığını bilmen yeterli.</p><h2>Özel float değerleri ve güvenli karşılaştırma</h2><p>float türünde üç özel değer vardır: artı sonsuz, eksi sonsuz ve "sayı değil" (NaN, not a number). Veri setlerinde eksik değer çoğunlukla NaN olarak gelir; pandas derslerinde onunla sürekli karşılaşacaksın. NaN'ın en garip özelliği kendine bile eşit olmamasıdır.</p><pre class="py">import math
sonsuz = float("inf")
eksik = float("nan")
print(sonsuz &gt; 10**100, -sonsuz &lt; -10**100)
print(eksik == eksik, math.isnan(eksik))      # NaN kendine eşit değil!
print(math.isinf(sonsuz), math.isfinite(1.5))

print(0.1 + 0.2 == 0.3)
print(math.isclose(0.1 + 0.2, 0.3))           # göreli tolerans
print(math.isclose(1000.004, 1000.0, abs_tol=0.01))
elle = 0.1 + 0.1 + 0.1 + 0.1 + 0.1 + 0.1 + 0.1 + 0.1 + 0.1 + 0.1
print(elle, math.fsum([0.1] * 10))   # fsum hata birikimini önler</pre><p><code>math.isclose(a, b)</code> kendi tolerans hesabını yapan güvenli karşılaştırmadır; varsayılan göreli tolerans çok küçüktür, tutar karşılaştırmasında <code>abs_tol=0.005</code> (yarım kuruş) gibi mutlak bir tolerans vermek daha anlamlıdır. <code>math.fsum</code> ise çok sayıda float topladığında biriken küçük hataları telafi eder. (Python 3.12 ile hazır <code>sum</code> da float toplarken benzer bir telafi yapmaya başladı; ama elle <code>+</code> ile biriktirdiğin toplamlarda hata hâlâ birikir.)</p><h2>Yuvarlama: round, Decimal ve muhasebe kuralı</h2><p><code>round</code> fonksiyonu bankacı yuvarlaması (yarımda çifte) yapar ve ikinci parametresi negatif de olabilir: <code>round(1234.5, -2)</code> yüzlere yuvarlar. Ama faturada Türkiye'deki alışılmış kural "yarım ve üstü yukarı"dır (ROUND_HALF_UP). Bunu float ile güvenilir yapamazsın; <code>decimal</code> modülünün <code>quantize</code> metodu tam bu iş içindir.</p><pre class="py">from decimal import Decimal, ROUND_HALF_UP, ROUND_HALF_EVEN

print(round(1234.567, -2), round(1250, -2), round(1350, -2))

fiyat = Decimal("2.675")
kurus = Decimal("0.01")
print(fiyat.quantize(kurus, rounding=ROUND_HALF_UP))    # 2.68: muhasebe
print(fiyat.quantize(kurus, rounding=ROUND_HALF_EVEN))  # 2.68: tam yarım, 8 çift
print(Decimal("2.665").quantize(kurus, rounding=ROUND_HALF_EVEN))  # 2.66
print(round(2.675, 2))                                    # float: 2.67!

tutar = Decimal("19.99") * 3
kdv = (tutar * Decimal("0.20")).quantize(kurus, rounding=ROUND_HALF_UP)
print(tutar, kdv, tutar + kdv)</pre><div class="tbl-wrap"><table><tr><th>Yöntem</th><th>2.665 →</th><th>2.675 →</th><th>Ne zaman?</th></tr><tr><td><code>round(x, 2)</code> (float)</td><td>2.67*</td><td>2.67*</td><td>Analiz, grafik, yaklaşık rapor</td></tr><tr><td><code>ROUND_HALF_UP</code></td><td>2.67</td><td>2.68</td><td>Fatura, makbuz, muhasebe</td></tr><tr><td><code>ROUND_HALF_EVEN</code></td><td>2.66</td><td>2.68</td><td>İstatistik; birikimli yuvarlama hatasını azaltır</td></tr><tr><td><code>ROUND_DOWN</code></td><td>2.66</td><td>2.67</td><td>Kuruş küsuratını kesme (faiz tahakkuku politikasına göre)</td></tr></table></div><p>* İkisi de 2.67 çıkar: 2.665 bellekte biraz üstünde, 2.675 biraz altında saklanır. float sonuçları sayının bellekteki ikilik karşılığına bağlıdır; tam yarım gibi görünen değerler aslında biraz altında ya da üstünde olabilir. Decimal ise yazdığın ondalığı tam olarak saklar. <b>Decimal'ı hep metinden oluştur:</b> <code>Decimal(2.675)</code> bozuk float'ı kopyalar.</p><div class="warn"><b>Decimal ile float karıştırma</b><code>Decimal("1.5") + 0.1</code> TypeError verir; Python iki farklı kesinlikteki sayıyı sessizce birleştirmez. Hesaba giren her sabiti <code>Decimal("0.20")</code> gibi metinden oluştur; tam sayılarla (<code>Decimal("19.99") * 3</code>) karıştırmak serbesttir.</div><h2>math ve statistics: sık kullanılan araçlar</h2><div class="tbl-wrap"><table><tr><th>Fonksiyon</th><th>Ne yapar?</th><th>İş örneği</th></tr><tr><td><code>math.prod(liste)</code></td><td>Çarpım</td><td>Ardışık büyüme oranlarını birleştirmek</td></tr><tr><td><code>math.gcd(a, b)</code>, <code>math.lcm(a, b)</code></td><td>EBOB, EKOK</td><td>Paket boyutu, ortak sevkiyat günü</td></tr><tr><td><code>math.log10(x)</code>, <code>math.log(x)</code></td><td>Logaritma</td><td>Büyüklük mertebesi, sürekli faiz</td></tr><tr><td><code>math.exp(x)</code></td><td>e üzeri x</td><td>Sürekli bileşik faiz</td></tr><tr><td><code>math.comb(n, k)</code></td><td>Kombinasyon</td><td>Kaç farklı kampanya paketi kurulabilir?</td></tr><tr><td><code>statistics.mean / median</code></td><td>Ortalama, ortanca</td><td>Sepet tutarı özeti (aykırı değere dayanıklı ortanca)</td></tr></table></div><pre class="py">import math, statistics
print(math.lcm(6, 8), math.gcd(48, 36))     # 24. günde iki tır aynı gün; 12'li paket
print(round(math.prod([1.10, 1.05, 0.97]), 4))   # üç dönemin toplam büyüme çarpanı
print(math.comb(10, 3))                     # 10 üründen 3'lü paket sayısı
sepetler = [120, 135, 98, 110, 4200]        # bir kurumsal sipariş aykırı
print(statistics.mean(sepetler), statistics.median(sepetler))
eski, yeni = 84_000, 96_600
print(f"Değişim: %{(yeni - eski) / eski * 100:.1f}")</pre><p>Son iki satır, iş hayatının en sık formülünü gösteriyor: yüzde değişim = (yeni − eski) / eski × 100. Eski değer sıfırsa formül tanımsızdır; raporda "yeni" ya da "—" yazmak gerekir. Ortalama ile ortanca arasındaki büyük fark ise verinde aykırı değer olduğunun işaretidir: tek bir kurumsal sipariş "ortalama sepeti" bir anda on katına çıkarabilir.</p><div class="note"><b>Gerçek işte</b>Finans ekiplerinde kabul görmüş düzen şudur: tutarlar veritabanında ya kuruş cinsinden tam sayı ya da sabit ondalıklı (DECIMAL(18,2)) sütunlarda tutulur; Python tarafında Decimal ile hesaplanır; yuvarlama yalnızca belirlenmiş noktalarda (satır toplamı, KDV, genel toplam) ve yazılı bir kurala göre (ROUND_HALF_UP) yapılır. Taksitlendirmede bölünemeyen kuruş farkı genelde ilk ya da son taksite eklenir. Bu kuralları kodun en üstüne sabit olarak yazmak, denetimde "bu kuruş nereden geldi" sorusuna cevap verir.</div>`,
    ex: [
      {
        t: 'mc',
        id: 'sayilar-islemler-x1',
        stage: 'Isınma',
        q: 'Faturada <code>2.675</code> TL\'yi muhasebe kuralına göre (yarım ve üstü yukarı) kuruşa yuvarlamak için en güvenilir yol hangisi?',
        o: [
          '<code>round(2.675, 2)</code>, çünkü round her zaman en yakına yuvarlar',
          '<code>Decimal("2.675").quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)</code>',
          '<code>int(2.675 * 100) / 100</code>, yani kuruşa çevirip kesmek',
          '<code>math.ceil(2.675 * 100) / 100</code>, yani her zaman yukarı yuvarlamak'
        ],
        a: 1,
        why: 'round float üzerinde çalışır ve 2.675 bellekte 2.67499... olduğundan 2.67 verir. int ile kesmek de aşağı yuvarlar. ceil her zaman yukarı yuvarlar (2.671 → 2.68 olur ki yanlış). Decimal metinden oluşturulduğunda tam 2.675\'i tutar ve ROUND_HALF_UP ile 2.68 verir.'
      },
      {
        t: 'predict',
        id: 'sayilar-islemler-x2',
        stage: 'Kodu oku',
        q: 'Bu kod ne yazdırır?',
        code: 'print(round(1234.567, -2), round(1250, -2), round(1350, -2))\n',
        o: ['1200.0 1200 1400', '1200.0 1300 1400', '1234.57 1250 1350', '1200 1300 1300'],
        a: 0,
        why: 'Negatif basamak sayısı virgülün soluna yuvarlar: yüzlere. float girdi float, int girdi int döndürür. Tam yarımda bankacı yuvarlaması çift olana gider: 1250 → 1200 (12 çift), 1350 → 1400 (14 çift).'
      },
      {
        t: 'predict',
        id: 'sayilar-islemler-x3',
        stage: 'Kodu oku',
        q: 'Bu kod ne yazdırır?',
        code: 'print(0x1F, 0b101, 1e3, 1_000)\n',
        o: ['31 5 1000.0 1000', '0x1F 0b101 1e3 1_000', '31 5 1000 1000', '1F 101 1000.0 1000'],
        a: 0,
        why: 'Onaltılık 1F = 31, ikilik 101 = 5. Bilimsel gösterim her zaman float üretir (1000.0). Alt çizgi yalnızca okunurluk içindir, değer 1000\'dir.'
      },
      {
        t: 'predict',
        id: 'sayilar-islemler-x4',
        stage: 'Kodu oku',
        q: 'Bu kod ne yazdırır?',
        code: 'import math\nprint(math.isclose(0.1 + 0.2, 0.3), 0.1 + 0.2 == 0.3, math.fsum([0.1] * 10) == 1.0)\n',
        o: ['True False True', 'False False True', 'True True True', 'False False False'],
        a: 0,
        why: 'isclose küçük kayan nokta farklarını tolere eder. Düz == ise 0.30000000000000004 ile 0.3\'ü farklı görür. fsum on tane 0.1\'i toplarken ara hataları telafi eder ve tam 1.0 verir.'
      },
      {
        t: 'order',
        id: 'sayilar-islemler-x5',
        stage: 'Kodu oku',
        q: '<p>Faturadaki KDV dahil toplamı Decimal ile kuruşa yuvarlayarak hesaplayan satırları sırala. Çıktı <code>71.96</code> olmalı.</p>',
        lines: ['from decimal import Decimal, ROUND_HALF_UP', 'tutar = Decimal("19.99") * 3', 'kdv = tutar * Decimal("0.20")', 'toplam = (tutar + kdv).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)', 'print(toplam)'],
        expect: '71.96\n',
        hint: 'İçe aktarma her şeyden önce gelir; kdv tutara, toplam ikisine bağlıdır.',
        why: '59.97 + 11.994 = 71.964; ROUND_HALF_UP ile kuruşa yuvarlanınca 71.96. Yuvarlama yalnızca en sonda, genel toplamda yapılır.'
      },
      {
        t: 'code',
        id: 'sayilar-islemler-x6',
        stage: 'Rehberli',
        diff: 1,
        q: '<p>Satış raporu için <code>yuzde_degisim(eski, yeni)</code> fonksiyonunu yaz. Yüzde değişimi bir ondalık basamağa yuvarlanmış olarak döndürsün. Eski değer 0 ise (bölme tanımsız) <code>None</code> döndürsün.</p><ul><li><code>yuzde_degisim(84000, 96600)</code> → <code>15.0</code></li><li><code>yuzde_degisim(200, 150)</code> → <code>-25.0</code></li></ul>',
        guide: ['Önce eski == 0 durumunu kontrol et ve None döndür.', 'Formül: (yeni - eski) / eski * 100', 'Sonucu round(..., 1) ile bir basamağa yuvarla ve döndür.'],
        example: 'def kar_marji(gelir, maliyet):\n    if gelir == 0:\n        return None\n    return round((gelir - maliyet) / gelir * 100, 1)\n\nprint(kar_marji(500, 320), kar_marji(0, 10))\n',
        start: 'def yuzde_degisim(eski, yeni):\n    # TODO: eski sıfırsa None döndür\n    # TODO: yüzde değişimi hesapla ve yuvarla\n    return 0\n',
        sol: 'def yuzde_degisim(eski, yeni):\n    if eski == 0:\n        return None\n    return round((yeni - eski) / eski * 100, 1)\n',
        tests: 'assert yuzde_degisim(84000, 96600) == 15.0, "84000 → 96600 %15 artıştır"\nassert yuzde_degisim(200, 150) == -25.0, "Düşüş negatif yüzde olmalı"\nassert yuzde_degisim(0, 500) is None, "Eski değer 0 ise None dönmeli; sıfıra bölme olmamalı"\nassert yuzde_degisim(3, 4) == 33.3, "Bir ondalık basamağa yuvarlanmalı"\n',
        hints: ['Bölmeden önce sıfır kontrolü yap.', 'Payda eski değerdir: (yeni - eski) / eski', 'return round((yeni - eski) / eski * 100, 1)'],
        why: 'Yüzde değişimin paydası eski değerdir. Sıfıra bölmeyi hesaptan önce kontrol etmek ZeroDivisionError\'ı önler ve raporda anlamlı bir "yok" değeri bırakır.'
      },
      {
        t: 'code',
        id: 'sayilar-islemler-x7',
        stage: 'Rehberli',
        diff: 2,
        q: '<p><code>fatura_yuvarla(tutar_metin)</code> fonksiyonunu yaz: metin olarak verilen tutarı <code>Decimal</code>\'a çevirip muhasebe kuralına göre (<code>ROUND_HALF_UP</code>) kuruşa yuvarlasın ve <code>Decimal</code> olarak döndürsün.</p><ul><li><code>"2.675"</code> → <code>Decimal("2.68")</code></li><li><code>"2.665"</code> → <code>Decimal("2.67")</code></li><li><code>"10"</code> → <code>Decimal("10.00")</code></li></ul>',
        guide: ['decimal modülünden Decimal ve ROUND_HALF_UP\'ı içe aktar.', 'Metni doğrudan Decimal(tutar_metin) ile çevir; float\'a çevirme.', 'quantize(Decimal("0.01"), rounding=ROUND_HALF_UP) ile kuruşa yuvarla.'],
        example: 'from decimal import Decimal, ROUND_HALF_UP\noran = Decimal("0.12345")\nprint(oran.quantize(Decimal("0.001"), rounding=ROUND_HALF_UP))\n',
        start: 'from decimal import Decimal, ROUND_HALF_UP\n\n\ndef fatura_yuvarla(tutar_metin):\n    # TODO: metni Decimal\'a çevir\n    tutar = float(tutar_metin)\n    # TODO: kuruşa ROUND_HALF_UP ile yuvarla\n    return round(tutar, 2)\n',
        sol: 'from decimal import Decimal, ROUND_HALF_UP\n\n\ndef fatura_yuvarla(tutar_metin):\n    tutar = Decimal(tutar_metin)\n    return tutar.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)\n',
        tests: 'from decimal import Decimal\nassert fatura_yuvarla("2.675") == Decimal("2.68"), "2.675 yukarı yuvarlanıp 2.68 olmalı (float round 2.67 verir)"\nassert fatura_yuvarla("2.665") == Decimal("2.67"), "2.665 → 2.67 (ROUND_HALF_UP)"\nassert str(fatura_yuvarla("10")) == "10.00", "Tam sayı tutar 10.00 biçiminde iki basamaklı olmalı"\nassert isinstance(fatura_yuvarla("1.005"), Decimal), "Sonuç Decimal olmalı"\nassert fatura_yuvarla("1.005") == Decimal("1.01"), "1.005 → 1.01"\n',
        hints: [
          'Decimal("2.675") yazdığın ondalığı tam saklar; Decimal(2.675) saklamaz.',
          'quantize\'a hedef basamağı bir Decimal olarak verirsin: Decimal("0.01")',
          'return Decimal(tutar_metin).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)'
        ],
        why: 'Decimal metinden oluşturulduğunda ondalık değer tam temsil edilir ve quantize yuvarlama kuralını açıkça belirlemene izin verir. Sonucun her zaman iki basamaklı olması (10.00) fatura çıktısında da tutarlılık sağlar.'
      },
      {
        t: 'code',
        id: 'sayilar-islemler-x8',
        stage: 'Rehberli',
        diff: 2,
        q: '<p>Anadolu Bank için eşit taksitli kredi ödemesini hesaplayan <code>aylik_taksit(anapara, yillik_oran, ay)</code> fonksiyonunu yaz. Formül (r = aylık oran = yıllık oran / 12):</p><pre class="out">taksit = anapara × r / (1 − (1 + r) ** −ay)</pre><p>Sonucu 2 basamağa yuvarla. Oran 0 ise taksit <code>anapara / ay</code> olsun (formül sıfıra bölerdi). Örnek: <code>aylik_taksit(100000, 0.36, 12)</code> → <code>10046.21</code>.</p>',
        guide: ['Aylık oranı hesapla: r = yillik_oran / 12.', 'r == 0 ise round(anapara / ay, 2) döndür.', 'Formülü yaz; üs için ** ve negatif üs (-ay) kullan.', 'Sonucu round(..., 2) ile yuvarla.'],
        example: 'anapara, r, n = 50000, 0.02, 6\nbuyume = (1 + r) ** n\nprint(round(anapara * buyume, 2))\nprint(round((1 + r) ** -n, 6))\n',
        start: 'def aylik_taksit(anapara, yillik_oran, ay):\n    r = yillik_oran / 12\n    # TODO: faizsiz durum\n    # TODO: eşit taksit formülü\n    return round(anapara / ay, 2)\n',
        sol: 'def aylik_taksit(anapara, yillik_oran, ay):\n    r = yillik_oran / 12\n    if r == 0:\n        return round(anapara / ay, 2)\n    return round(anapara * r / (1 - (1 + r) ** -ay), 2)\n',
        tests: 'assert aylik_taksit(100000, 0.36, 12) == 10046.21, "100.000 TL, %36, 12 ay → 10046.21"\nassert aylik_taksit(12000, 0, 12) == 1000.0, "Faizsiz kredide taksit anapara / ay"\nassert aylik_taksit(50000, 0.24, 24) == 2643.55, "50.000 TL, %24, 24 ay → 2643.55"\nassert aylik_taksit(1000, 0.12, 1) == 1010.0, "Tek taksitte bir aylık faiz eklenir"\n',
        hints: ['Yıllık oran 0.36 ise aylık oran 0.03\'tür.', '(1 + r) ** -ay, 1 / (1 + r) ** ay ile aynıdır.', 'return round(anapara * r / (1 - (1 + r) ** -ay), 2)'],
        why: 'Eşit taksit (annüite) formülü, her taksitte faiz ve anapara payının değiştiği ama toplamın sabit kaldığı ödeme planını verir. Oran sıfırken pay ve payda sıfıra gittiği için özel durum olarak ele alınmalıdır.'
      },
      {
        t: 'code',
        id: 'sayilar-islemler-x9',
        stage: 'Kendin yaz',
        diff: 1,
        q: '<p>Anadolu Market\'in iki tedarikçisi depoya düzenli aralıklarla teslimat yapıyor: biri her <code>a</code> günde, diğeri her <code>b</code> günde bir. İkisi bugün birlikte geldi. <code>ortak_gun(a, b)</code> fonksiyonu, ikisinin bir sonraki birlikte geleceği günü (kaç gün sonra) döndürsün. Örnek: <code>ortak_gun(6, 8)</code> → <code>24</code>.</p>',
        sol: 'import math\n\n\ndef ortak_gun(a, b):\n    return math.lcm(a, b)\n',
        tests: 'assert ortak_gun(6, 8) == 24, "6 ve 8 günlük döngüler 24. günde çakışır"\nassert ortak_gun(7, 7) == 7, "Aynı döngü kendi aralığında çakışır"\nassert ortak_gun(5, 3) == 15, "Aralarında asal sayılarda çarpım"\nassert ortak_gun(4, 12) == 12, "Biri diğerinin katıysa büyük olan"\n',
        hints: ['Bu bir EKOK (en küçük ortak kat) problemi.', 'math.lcm(a, b) Python 3.9+\'da hazırdır; ya da a * b // math.gcd(a, b).'],
        why: 'İki periyodik olayın ilk ortak anı, periyotların EKOK\'udur. math.lcm doğrudan verir; eski sürümlerde a * b // gcd(a, b) formülü kullanılır.'
      },
      {
        t: 'code',
        id: 'sayilar-islemler-x10',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 2,
        q: '<p>Ödeme sistemine tutarlar kuruş cinsinden tam sayı olarak gönderilmeli. Ama <code>kurusa_cevir(0.29)</code> 29 yerine 28 döndürüyor ve müşteriden eksik çekim yapılıyor. <b>Hatayı bul ve düzelt.</b></p>',
        start: 'def kurusa_cevir(tutar):\n    return int(tutar * 100)\n',
        sol: 'def kurusa_cevir(tutar):\n    return round(tutar * 100)\n',
        tests: 'assert kurusa_cevir(0.29) == 29, "0.29 TL 29 kuruştur (0.29 * 100 = 28.999999999999996)"\nassert kurusa_cevir(1499.9) == 149990, "1499.9 TL 149990 kuruş"\nassert kurusa_cevir(19.99) == 1999, "19.99 TL 1999 kuruş"\nassert isinstance(kurusa_cevir(5.0), int), "Sonuç int olmalı"\n',
        hints: ['print(0.29 * 100) yazıp gerçekte ne çıktığına bak.', 'int() ondalığı keser, yuvarlamaz.', 'round(x) tek parametreyle çağrılınca int döndürür.'],
        why: '0.29 ikilik tabanda tam temsil edilemez; 0.29 * 100 = 28.999999999999996 olur ve int() bunu 28\'e keser. round() en yakın tam sayıya gider ve int döndürür. Daha da güvenlisi tutarı baştan Decimal ya da kuruş olarak tutmaktır.'
      },
      {
        t: 'code',
        id: 'sayilar-islemler-x11',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 2,
        q: '<p>KDV dahil fiyattan KDV hariç fiyatı bulan fonksiyon yanlış sonuç veriyor: 120 TL\'lik ürün için 100 yerine 96 döndürüyor. <b>Hatayı bul ve düzelt.</b> Oran yüzde olarak verilir (20 → %20); sonuç 2 basamağa yuvarlanmalı.</p>',
        start: 'def kdv_haric(kdv_dahil, oran=20):\n    return round(kdv_dahil - kdv_dahil * oran / 100, 2)\n',
        sol: 'def kdv_haric(kdv_dahil, oran=20):\n    return round(kdv_dahil / (1 + oran / 100), 2)\n',
        tests: 'assert kdv_haric(120) == 100.0, "120 TL (%20 KDV dahil) → 100 TL"\nassert kdv_haric(110, 10) == 100.0, "%10 KDV ile 110 → 100"\nassert kdv_haric(1499.9) == 1249.92, "1499.9 / 1.2 = 1249.92"\nassert kdv_haric(100, 0) == 100.0, "KDV 0 ise fiyat değişmez"\n',
        hints: ['KDV, KDV hariç fiyat üzerinden hesaplanır, KDV dahil fiyat üzerinden değil.', 'kdv_dahil = haric × (1 + oran/100) ise haric = ?', 'Çarpmanın tersi bölmedir: kdv_dahil / (1 + oran / 100)'],
        why: '%20 KDV, KDV hariç fiyatın %20\'sidir. KDV dahil fiyattan %20 düşmek fazla indirim yapar (120 × 0.8 = 96). Doğrusu ters işlemdir: 120 / 1.2 = 100. Bu, faturalarda gerçekten sık yapılan bir hatadır.'
      },
      {
        t: 'code',
        id: 'sayilar-islemler-x12',
        stage: 'Meydan okuma',
        diff: 3,
        q: '<p>Bir tutarı <code>n</code> eşit taksite bölen <code>taksitlere_bol(tutar, n)</code> fonksiyonunu yaz. Taksitler TL cinsinden, kuruş hassasiyetinde bir liste olarak dönsün; bölünemeyen kuruş farkı <b>ilk taksite</b> eklensin ve taksitlerin toplamı kuruşu kuruşuna tutara eşit olsun.</p><ul><li><code>taksitlere_bol(100, 3)</code> → <code>[33.34, 33.33, 33.33]</code></li><li><code>taksitlere_bol(1000, 4)</code> → <code>[250.0, 250.0, 250.0, 250.0]</code></li></ul><p>İpucu: hesabı kuruş (tam sayı) üzerinden yap.</p>',
        sol: 'def taksitlere_bol(tutar, n):\n    kurus = round(tutar * 100)\n    taban, artan = divmod(kurus, n)\n    plan = [taban / 100] * n\n    plan[0] = (taban + artan) / 100\n    return plan\n',
        tests: 'assert taksitlere_bol(100, 3) == [33.34, 33.33, 33.33], "100 / 3: fark ilk taksitte"\nassert taksitlere_bol(1000, 4) == [250.0] * 4, "Tam bölünüyorsa eşit taksitler"\nplan = taksitlere_bol(1499.9, 7)\nassert len(plan) == 7, "7 taksit olmalı"\nassert round(sum(round(t * 100) for t in plan)) == 149990, "Taksitlerin kuruş toplamı tutara eşit olmalı"\nassert plan[1] == plan[-1] and plan[0] >= plan[1], "Fark yalnızca ilk taksitte olmalı"\nassert taksitlere_bol(0.05, 3) == [0.03, 0.01, 0.01], "Küçük tutarlarda da kuruş korunmalı"\n',
        hints: ['Önce tutarı kuruşa çevir: round(tutar * 100).', 'divmod(kurus, n) taban taksit ve artan kuruşu birlikte verir.', '[taban / 100] * n ile listeyi kur, sonra plan[0]\'ı (taban + artan) / 100 yap.'],
        why: 'Kuruş tam sayıdır; tam sayı bölmesinde hata birikmez. divmod tabanı ve artanı tek adımda verir, artan kuruşun tek bir taksite eklenmesi toplamın birebir korunmasını sağlar. Bankalar ve e-ticaret sitelerinin taksit planları bu mantıkla çalışır.'
      }
    ],
    faq: [
      {
        q: 'Her para hesabında Decimal mı kullanmalıyım? Yavaş değil mi?',
        a: 'Kayda geçen, faturalanan, müşteriye yansıyan her tutarda evet: Decimal ya da kuruş cinsinden int. Decimal float\'tan yavaştır ama bir uygulamanın darboğazı nadiren budur. Milyonlarca satırlık analiz ve raporlamada (pandas) float yeterlidir; yalnızca sonuçları gösterirken yuvarlarsın.'
      },
      {
        q: 'math.isclose mu, round ile karşılaştırma mı?',
        a: 'İkisi de olur ama isclose niyeti daha açık anlatır. Tutarlarda isclose(a, b, abs_tol=0.005) "yarım kuruştan az fark eşit sayılır" demektir. round(a, 2) == round(b, 2) ise sınır durumlarında (biri 1.005, öbürü 1.0049) farklı sonuç verebilir.'
      }
    ],
    mistakes: [
      {
        bad: 'from decimal import Decimal\nfiyat = Decimal(19.99)',
        good: 'from decimal import Decimal\nfiyat = Decimal("19.99")',
        why: 'Decimal\'a float verirsen float\'ın bozuk ikilik karşılığı (19.989999999999998436805981327779591083526611328125) aynen kopyalanır. Decimal\'ı hep metinden oluştur.'
      },
      {
        bad: 'if deger == float("nan"):\n    print("eksik")',
        good: 'import math\nif math.isnan(deger):\n    print("eksik")',
        why: 'NaN hiçbir şeye, kendisine bile eşit değildir; == ile karşılaştırma her zaman False verir. Eksik değeri math.isnan ile (pandas\'ta isna ile) kontrol et.'
      }
    ]
  }
);
})(window);
