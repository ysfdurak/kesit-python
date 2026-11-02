(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push(
{
    id: 'regex', lv: 'orta', mod: 'Standart Kütüphane', min: 35,
    title: 'Düzenli ifadeler (regex): metinde kalıp arama ve çıkarma',
    sum: 're.search/match/findall/sub ile kalıp arar, gruplarla veri çıkarır, telefon/e-posta/IBAN benzeri doğrulamalar yazar ve regex tuzaklarından kaçınırsın.',
    goals: [
      'search, match, fullmatch, findall ve sub arasındaki farkı bilip doğru olanı seçebilirim.',
      'Karakter sınıfları, niceleyiciler ve çapalarla kalıp kurabilirim.',
      'Gruplar ve adlandırılmış gruplarla metinden yapılandırılmış veri çıkarabilirim.',
      'Telefon, e-posta ve IBAN benzeri iş kalıplarını doğrulayabilirim.',
      're.compile, bayraklar ve açgözlülük gibi tuzakları yönetebilirim.'
    ],
    body: `
<h2>Neden önemli?</h2>
<p>Anadolu Bank'a gelen EFT açıklamalarından fatura numarasını çıkarmak, Anadolu Market müşteri formundaki telefonun doğru biçimde olduğunu kontrol etmek, log dosyasından hata kodlarını toplamak... Bunların ortak noktası: metin içinde <b>kalıp</b> (pattern) aramak. <code>str.find</code> ve <code>in</code> sabit metin arar; "5 ile başlayan 10 haneli sayı" gibi kalıpları ise düzenli ifadeler (regular expression, regex) bulur. Regex küçük bir dildir; doğru kullanınca 20 satırlık ayrıştırma kodu bir satıra iner, yanlış kullanınca kimsenin okuyamadığı bir satır çıkar. Bu ders ikisi arasındaki çizgiyi öğretir.</p>

<h2>Temel sözlük</h2>
<div class="tbl-wrap"><table>
<tr><th>Yapı</th><th>Anlam</th><th>Örnek</th></tr>
<tr><td>\\d  \\w  \\s</td><td>Rakam / harf-rakam-alt çizgi / boşluk</td><td>\\d{3} → 3 rakam</td></tr>
<tr><td>\\D  \\W  \\S</td><td>Yukarıdakilerin tersi</td><td>\\D+ → rakam olmayanlar</td></tr>
<tr><td>.</td><td>Satır sonu dışında herhangi bir karakter</td><td>a.c → abc, a-c</td></tr>
<tr><td>[abc]  [^abc]  [a-z]</td><td>Küme / küme dışı / aralık</td><td>[A-Z]{2} → iki büyük harf</td></tr>
<tr><td>*  +  ?  {n,m}</td><td>0+ / 1+ / 0-1 / n ile m arası</td><td>\\d{2,4}</td></tr>
<tr><td>^  $  \\b</td><td>Satır başı / sonu / kelime sınırı</td><td>^TR → TR ile başlar</td></tr>
<tr><td>( )  (?P&lt;ad&gt; )  (?: )</td><td>Grup / adlandırılmış grup / yakalamayan grup</td><td>(?P&lt;yil&gt;\\d{4})</td></tr>
<tr><td>a|b</td><td>Veya</td><td>TL|USD|EUR</td></tr>
</table></div>
<div class="tip"><b>Her zaman ham dize kullan</b>Kalıpları <code>r"..."</code> ile yaz. Aksi halde Python <code>"\\b"</code>yi geri silme (backspace) karakteri sanır, <code>"\\d"</code> için uyarı verir. <code>r</code> öneki ters eğik çizgiyi olduğu gibi bırakır.</div>

<h2>Dört ana fonksiyon</h2>
<p><code>re.search</code> metnin herhangi bir yerinde ilk eşleşmeyi bulur; <code>re.match</code> yalnızca <b>baştan</b> eşleşir; <code>re.fullmatch</code> tüm metnin kalıba uymasını ister (doğrulama için en doğrusu); <code>re.findall</code> tüm eşleşmeleri liste olarak verir. <code>search/match/fullmatch</code> eşleşme yoksa <code>None</code> döndürür; bu yüzden sonucu önce <code>if</code> ile kontrol edersin.</p>
<pre class="py">import re

aciklama = "EFT - Fatura No: FT-2026-00431, tutar 1.250,00 TL"
m = re.search(r"FT-\\d{4}-\\d{5}", aciklama)
print("search :", m.group() if m else None, "| konum:", m.span())
print("match  :", re.match(r"FT-", aciklama))          # baş 'EFT' olduğu için None
print("match2 :", re.match(r"EFT", aciklama).group())
print("full   :", re.fullmatch(r"\\d{10}", "5321234567") is not None)
print("full2  :", re.fullmatch(r"\\d{10}", "532123456X") is not None)
print("findall:", re.findall(r"\\d+", aciklama))
print("bos    :", re.search(r"\\d+", "rakam yok"))      # None</pre>

<h2>Gruplar: eşleşmenin parçalarını almak</h2>
<p>Parantez, eşleşmenin bir bölümünü yakalar (capture). <code>group(1)</code> ilk grubu, <code>groups()</code> hepsini verir. Adlandırılmış gruplar <code>(?P&lt;ad&gt;...)</code> ile kodu okunur yapar; <code>groupdict()</code> doğrudan sözlük döndürür. Yakalamak istemediğin ama gruplaman gereken yerde <code>(?:...)</code> kullan.</p>
<pre class="py">import re

satir = "2026-03-15 14:30:07 ERROR odeme-servisi: zaman asimi (kod=504)"
kalip = r"(?P&lt;tarih&gt;\\d{4}-\\d{2}-\\d{2}) (?P&lt;saat&gt;[\\d:]+) (?P&lt;seviye&gt;[A-Z]+) (?P&lt;servis&gt;[\\w-]+): (?P&lt;mesaj&gt;.*)"
m = re.search(kalip, satir)
print(m.group("seviye"), "-", m.group("servis"))
print(m.groupdict())
print(m.group(1), m.group(3))      # sıra numarasıyla da erişilir

# findall: grup varsa yalnızca grupları döndürür
fiyatlar = "laptop 25.999 TL, mouse 349 TL, çanta 1.200 TL"
print(re.findall(r"(\\w+) ([\\d.]+) TL", fiyatlar))
# finditer: eşleşme nesneleriyle gez
for e in re.finditer(r"(?P&lt;urun&gt;\\w+) (?P&lt;fiyat&gt;[\\d.]+) TL", fiyatlar):
    print(e["urun"], "→", e["fiyat"].replace(".", ""))</pre>

<h2>re.sub: bul ve değiştir</h2>
<p><code>re.sub(kalip, yeni, metin)</code> tüm eşleşmeleri değiştirir. <code>yeni</code> içinde <code>\\1</code> ya da <code>\\g&lt;ad&gt;</code> ile grup kullanabilirsin; karmaşık dönüşümlerde <code>yeni</code> yerine fonksiyon verirsin. KVKK gereği kart numarası maskeleme tipik bir örnektir.</p>
<pre class="py">import re

mesaj = "Kart 5401 2345 6789 1234 ile 350 TL ödeme; TC 12345678901 doğrulandı."
# Kartın ilk 4 ve son 4'ünü bırak, ortayı maskele
maskeli = re.sub(r"(\\d{4}) \\d{4} \\d{4} (\\d{4})", r"\\1 **** **** \\2", mesaj)
print(maskeli)
# 11 haneli sayıyı tamamen gizle
print(re.sub(r"\\b\\d{11}\\b", "***********", maskeli))
# Tarih biçimi değiştir: 2026-03-15 -&gt; 15.03.2026
print(re.sub(r"(\\d{4})-(\\d{2})-(\\d{2})", r"\\3.\\2.\\1", "Rapor tarihi 2026-03-15"))
# Fonksiyonla değiştirme: fiyatları yüzde 10 artır
print(re.sub(r"\\d+", lambda m: str(int(m.group()) * 11 // 10), "mouse 350 TL, çanta 1200 TL"))
# Fazla boşlukları teke indir, kaç tane değişti?
yeni, adet = re.subn(r"\\s+", " ", "çok    fazla   boşluk")
print(yeni, "|", adet)</pre>

<h2>İş kalıpları: telefon, e-posta, IBAN</h2>
<p>Kurumsal formlarda en çok karşılaşılan üç doğrulama. Amaç "biçimsel olarak makul mü?" sorusuna cevap vermektir; gerçek doğrulama (IBAN kontrol basamağı, e-posta adresinin var olması) regex'in işi değildir.</p>
<pre class="py">import re

TELEFON = re.compile(r"^(?:\\+90|0)?\\s?5\\d{2}\\s?\\d{3}\\s?\\d{2}\\s?\\d{2}$")
EPOSTA = re.compile(r"^[\\w.+-]+@[\\w-]+(?:\\.[\\w-]+)+$")
IBAN_TR = re.compile(r"^TR\\d{2}\\s?(?:\\d{4}\\s?){5}\\d{2}$")   # TR + 24 hane = 26 karakter

for t in ["0532 123 45 67", "+90 532 123 45 67", "5321234567", "0212 123 45 67", "532 12 34"]:
    print(f"{t:&gt;18} →", bool(TELEFON.match(t)))
for e in ["ayse.yilmaz@anadolumarket.com.tr", "ali@firma", "kötü@@adres.com"]:
    print(f"{e:&gt;34} →", bool(EPOSTA.match(e)))
for i in ["TR33 0006 1005 1978 6457 8413 26", "TR330006100519786457841326", "TR12 3456"]:
    print(f"{i:&gt;34} →", bool(IBAN_TR.match(i)))</pre>
<div class="note"><b>Neden compile?</b><code>re.compile</code> kalıbı bir kez derler ve bir nesne verir; döngüde binlerce kez kullanacaksan okunurluk ve hız kazandırır. Python zaten son kalıpları önbelleğe alır, bu yüzden tek seferlik kullanımda fark yoktur; compile'ın asıl faydası kalıba <b>ad vermek</b>tir.</div>

<h2>Tuzaklar</h2>
<h3>1. Açgözlülük (greedy)</h3>
<p><code>.*</code> olabildiğince çok karakter yutar. <code>&lt;b&gt;x&lt;/b&gt; ve &lt;b&gt;y&lt;/b&gt;</code> metninde <code>&lt;b&gt;.*&lt;/b&gt;</code> tüm satırı alır. Tembel (lazy) sürüm <code>.*?</code> en kısa eşleşmede durur.</p>
<h3>2. Nokta ve özel karakterler</h3>
<p><code>.</code> "her karakter" demektir; gerçek nokta için <code>\\.</code> yaz. Kullanıcıdan gelen metni kalıba gömeceksen <code>re.escape()</code> ile kaçır.</p>
<h3>3. match ile doğrulama</h3>
<p><code>re.match(r"\\d{10}", "5321234567abc")</code> eşleşir çünkü yalnızca baştan bakar. Doğrulama için <code>fullmatch</code> ya da <code>^...$</code> kullan.</p>
<h3>4. Çok satırlı metin ve bayraklar</h3>
<pre class="py">import re

html = "&lt;b&gt;laptop&lt;/b&gt; ve &lt;b&gt;mouse&lt;/b&gt;"
print("açgözlü:", re.findall(r"&lt;b&gt;.*&lt;/b&gt;", html))
print("tembel :", re.findall(r"&lt;b&gt;.*?&lt;/b&gt;", html))

print("nokta  :", re.findall(r"1.5", "1.5 ve 1x5 ve 125"))
print("kaçmış :", re.findall(r"1\\.5", "1.5 ve 1x5 ve 125"))
print("escape :", re.escape("fiyat (TL)?"))

log = "INFO baslat\\nERROR disk dolu\\nerror: yetki yok\\nINFO bitti"
print("IGNORECASE:", re.findall(r"^error.*", log, flags=re.IGNORECASE | re.MULTILINE))
print("MULTILINE yok:", re.findall(r"^ERROR.*", log))

# VERBOSE: uzun kalıbı açıklamalı yaz
TUTAR = re.compile(r"""
    (?P&lt;miktar&gt;\\d{1,3}(?:\\.\\d{3})*(?:,\\d{2})?)   # 1.250,00 gibi
    \\s*(?P&lt;birim&gt;TL|USD|EUR)                      # para birimi
""", re.VERBOSE)
print(TUTAR.search("Toplam: 1.250,00 TL ödendi").groupdict())</pre>

<div class="warn"><b>Regex her şeyin cevabı değil</b>HTML/JSON/CSV gibi yapılı biçimleri regex ile ayrıştırma; her birinin kendi ayrıştırıcısı var (<code>json</code>, <code>csv</code>, <code>html.parser</code>). Basit "ile başlıyor mu", "içeriyor mu" sorularında <code>str.startswith</code> ve <code>in</code> hem hızlı hem okunurdur. Regex'i düzensiz metinden kalıp çıkarmak için sakla.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Üretim kodunda regex disiplini</h3>
<p>Kurumsal projelerde kalıplar modülün başında büyük harfli sabit olarak <code>re.compile</code> ile tanımlanır ve yanına bir yorumla "ne eşleşir, ne eşleşmez" örnekleri yazılır. Her kalıbın en az bir pozitif ve bir negatif test örneği olur; çünkü regex'ler değiştirilirken en çok "önceden eşleşen artık eşleşmiyor" hatası çıkar. <code>re.VERBOSE</code> ile parçalara açıklama eklemek üç ay sonra kendine iyilik yapmaktır.</p>
<p>Güvenlik: bazı kalıplar belirli girdilerde üstel zaman alır (ReDoS, örn. <code>(a+)+$</code> kalıbına uzun "aaaa...b" vermek). Kullanıcıdan gelen metne iç içe niceleyici içeren kalıp uygulayacaksan girdinin uzunluğunu sınırla. Python 3.11 ile gelen <code>(?&gt;...)</code> atomik gruplar ve sahiplenici niceleyiciler (<code>a++</code>) geri izlemeyi keserek bu sorunu azaltır.</p>
<p>Unicode: Python 3'te <code>\\w</code> varsayılan olarak Türkçe harfleri de kapsar (<code>re.ASCII</code> bayrağı vermediğin sürece). Büyük/küçük harf duyarsız eşleşmede "İ/i" ve "I/ı" ayrımı yanıltabilir; kritik karşılaştırmalarda metni önce normalize et. Son olarak, bir kalıbı yazdıktan sonra dört beş örnek metinle etkileşimli olarak denemek (regex101 gibi araçlar ya da küçük bir Python döngüsü) hatayı üretime gitmeden yakalar.</p>
</section>
`,
    ex: [
      { t: 'mc', q: 'Bir metnin TAMAMEN kalıba uyup uymadığını kontrol etmek için en doğru fonksiyon hangisidir?',
        o: ['re.search', 're.match', 're.fullmatch', 're.findall'], a: 2,
        why: 'fullmatch tüm metnin kalıba uymasını ister. match yalnızca baştan eşleşir ve sonda fazlalığı kaçırır; search herhangi bir yerde arar; findall liste döndürür.' },
      { t: 'mc', q: '<code>re.findall(r"&lt;b&gt;.*&lt;/b&gt;", "&lt;b&gt;a&lt;/b&gt; &lt;b&gt;b&lt;/b&gt;")</code> kaç eleman döndürür?',
        o: ['2', '1', '0', '4'], a: 1,
        why: '.* açgözlüdür: ilk <b> ile son </b> arasındaki her şeyi tek eşleşme olarak alır. İki ayrı eleman için .*? (tembel) gerekir.' },
      { t: 'code', id: 'regex-1',
        q: '<p>Anadolu Market müşteri formu için <code>gecerli_telefon(metin: str) -> bool</code> fonksiyonunu yaz. Geçerli biçimler: isteğe bağlı <code>+90</code> ya da <code>0</code> öneki, ardından <code>5</code> ile başlayan 10 hane; haneler arasında isteğe bağlı tek boşluklar olabilir (örn. "0532 123 45 67", "+90 532 123 45 67", "5321234567"). Sabit hat (0212...) ve eksik haneler geçersiz olmalı. <code>re.fullmatch</code> kullan.</p>',
        start: 'import re\n\ndef gecerli_telefon(metin):\n    # buraya yaz\n    pass\n',
        sol: 'import re\n\nTELEFON = re.compile(r"(?:\\+90|0)?\\s?5\\d{2}\\s?\\d{3}\\s?\\d{2}\\s?\\d{2}")\n\ndef gecerli_telefon(metin):\n    return TELEFON.fullmatch(metin) is not None\n',
        tests: 'assert gecerli_telefon("0532 123 45 67") is True, "0532 123 45 67 geçerli olmalı"\nassert gecerli_telefon("+90 532 123 45 67") is True, "+90 ile geçerli olmalı"\nassert gecerli_telefon("5321234567") is True, "Boşluksuz 10 hane geçerli olmalı"\nassert gecerli_telefon("0212 123 45 67") is False, "Sabit hat geçersiz olmalı"\nassert gecerli_telefon("532 12 34") is False, "Eksik hane geçersiz olmalı"\nassert gecerli_telefon("05321234567x") is False, "Sonda harf geçersiz olmalı"\nassert gecerli_telefon("") is False, "Boş metin geçersiz"\n',
        hints: ['Önek için (?:\\+90|0)? yakalamayan isteğe bağlı grup kullan.', 'Boşluklar için \\s? (0 ya da 1 boşluk) koy; fullmatch ile sonda fazlalığı engelle.', 'Sonucu bool yapmak için "is not None" ya da bool() kullan.'],
        why: 'fullmatch tüm metni kontrol eder; isteğe bağlı önek ve boşluklar ? niceleyicisiyle çözülür; 5 ile başlama şartı kalıba gömülüdür.' },
      { t: 'code', id: 'regex-2',
        q: '<p>Anadolu Bank EFT açıklamalarından fatura numarası çıkaran <code>fatura_no(aciklama: str) -> str | None</code> fonksiyonunu yaz. Fatura numarası biçimi: <code>FT-</code> + 4 haneli yıl + <code>-</code> + 5 hane (örn. <code>FT-2026-00431</code>). Metnin herhangi bir yerinde olabilir; bulunamazsa <code>None</code> döndür.</p>',
        start: 'import re\n\ndef fatura_no(aciklama):\n    # buraya yaz\n    pass\n',
        sol: 'import re\n\ndef fatura_no(aciklama):\n    m = re.search(r"FT-\\d{4}-\\d{5}", aciklama)\n    return m.group() if m else None\n',
        tests: 'assert fatura_no("EFT - Fatura No: FT-2026-00431, tutar 1.250 TL") == "FT-2026-00431", "Fatura numarası bulunmalı"\nassert fatura_no("Havale FT-2025-99999") == "FT-2025-99999", "Sonda olan numara bulunmalı"\nassert fatura_no("Kira ödemesi") is None, "Numara yoksa None dönmeli"\nassert fatura_no("FT-26-00431 hatalı") is None, "Kısa yıl eşleşmemeli"\n',
        hints: ['re.search eşleşme nesnesi ya da None döndürür.', 'Kalıp: FT-\\d{4}-\\d{5}; sonucu m.group() ile al.'],
        why: 'search ilk eşleşmeyi bulur; koşullu ifade None durumunu güvenli şekilde ele alır.' },
      { t: 'code', id: 'regex-3',
        q: '<p>Sunucu log satırlarını ayrıştıran <code>log_ayristir(satir: str) -> dict | None</code> fonksiyonunu yaz. Satır biçimi: <code>"YYYY-AA-GG SS:DD:SS SEVIYE servis-adi: mesaj"</code>. Adlandırılmış gruplarla <code>{"tarih", "saat", "seviye", "servis", "mesaj"}</code> anahtarlı sözlük döndür; biçime uymayan satır için <code>None</code>. Servis adı harf, rakam, alt çizgi ve tire içerebilir.</p>',
        start: 'import re\n\ndef log_ayristir(satir):\n    # buraya yaz\n    pass\n',
        sol: 'import re\n\nKALIP = re.compile(r"(?P<tarih>\\d{4}-\\d{2}-\\d{2}) (?P<saat>\\d{2}:\\d{2}:\\d{2}) (?P<seviye>[A-Z]+) (?P<servis>[\\w-]+): (?P<mesaj>.*)")\n\ndef log_ayristir(satir):\n    m = KALIP.fullmatch(satir)\n    return m.groupdict() if m else None\n',
        tests: 'r = log_ayristir("2026-03-15 14:30:07 ERROR odeme-servisi: zaman asimi (kod=504)")\nassert r == {"tarih": "2026-03-15", "saat": "14:30:07", "seviye": "ERROR", "servis": "odeme-servisi", "mesaj": "zaman asimi (kod=504)"}, "Ayrıştırma yanlış: " + str(r)\nr2 = log_ayristir("2026-03-15 09:00:00 INFO api_v2: basladi")\nassert r2["servis"] == "api_v2" and r2["seviye"] == "INFO", "Alt çizgili servis adı desteklenmeli"\nassert log_ayristir("bozuk satır") is None, "Uymayan satır için None dönmeli"\n',
        hints: ['(?P<ad>...) ile adlandırılmış grup; m.groupdict() sözlük verir.', 'Servis için [\\w-]+ kullan; mesaj için .* (satır sonuna kadar).'],
        why: 'Adlandırılmış gruplar sayesinde groupdict doğrudan istenen sözlüğü üretir; uymayan satırda search/fullmatch None döndürür.' },
      { t: 'code', id: 'regex-4',
        q: '<p>KVKK maskeleme: <code>kart_maskele(metin: str) -> str</code> fonksiyonu metindeki <code>"DDDD DDDD DDDD DDDD"</code> biçimindeki (boşlukla ayrılmış 4x4 hane) tüm kart numaralarının ortadaki 8 hanesini yıldızlasın: <code>"5401 **** **** 1234"</code>. Diğer metin değişmesin. <code>re.sub</code> ve gruplar kullan.</p>',
        start: 'import re\n\ndef kart_maskele(metin):\n    # buraya yaz\n    pass\n',
        sol: 'import re\n\ndef kart_maskele(metin):\n    return re.sub(r"\\b(\\d{4}) \\d{4} \\d{4} (\\d{4})\\b", r"\\1 **** **** \\2", metin)\n',
        tests: 'assert kart_maskele("Kart 5401 2345 6789 1234 ile ödeme") == "Kart 5401 **** **** 1234 ile ödeme", "Orta 8 hane maskelenmeli"\nassert kart_maskele("A: 1111 2222 3333 4444, B: 5555 6666 7777 8888") == "A: 1111 **** **** 4444, B: 5555 **** **** 8888", "Tüm kartlar maskelenmeli"\nassert kart_maskele("Telefon 0532 123 45 67") == "Telefon 0532 123 45 67", "Kart olmayan metin değişmemeli"\n',
        hints: ['İlk ve son 4 haneyi parantezle yakala, ortadakileri yakalama.', 'Değiştirme metninde \\1 ve \\2 ile grupları geri koy (ham dize kullan).'],
        why: 're.sub tüm eşleşmeleri değiştirir; gruplar korunacak kısımları taşır, orta bloklar sabit yıldızla değiştirilir.' },
      { t: 'code', id: 'regex-5',
        q: '<p>Fiyat çıkarma: <code>fiyatlari_bul(metin: str) -> list[float]</code> fonksiyonu, metindeki <code>"1.250,00 TL"</code> ya da <code>"349 TL"</code> biçimindeki Türk formatlı tutarları bulup float listesine çevirsin (binlik ayırıcı nokta kaldırılır, ondalık virgül noktaya çevrilir). Para birimi mutlaka "TL" olmalı; "USD" tutarları alınmasın.</p>',
        start: 'import re\n\ndef fiyatlari_bul(metin):\n    # buraya yaz\n    pass\n',
        sol: 'import re\n\nKALIP = re.compile(r"(\\d{1,3}(?:\\.\\d{3})*(?:,\\d{2})?|\\d+(?:,\\d{2})?)\\s*TL\\b")\n\ndef fiyatlari_bul(metin):\n    sonuc = []\n    for ham in KALIP.findall(metin):\n        sonuc.append(float(ham.replace(".", "").replace(",", ".")))\n    return sonuc\n',
        tests: 'r = fiyatlari_bul("laptop 25.999,90 TL, mouse 349 TL, kulaklık 120 USD, çanta 1.200 TL")\nassert r == [25999.9, 349.0, 1200.0], "Tutarlar [25999.9, 349.0, 1200.0] olmalı, gelen: " + str(r)\nassert fiyatlari_bul("fiyat yok") == [], "Tutar yoksa boş liste"\nassert fiyatlari_bul("Toplam: 1.250,00 TL") == [1250.0], "Tek tutar doğru çevrilmeli"\n',
        hints: ['Binlik grupları için \\d{1,3}(?:\\.\\d{3})* ve isteğe bağlı (?:,\\d{2})? kullan; ardından \\s*TL.', 'Yakalanan metinde önce noktayı sil, sonra virgülü noktaya çevir, float() uygula.'],
        why: 'Kalıp Türk biçimini tanır ve yalnızca TL ile biteni yakalar; metin temizliği float dönüşümünü mümkün kılar.' },
      { t: 'mc', q: 'Kullanıcının girdiği bir metni kalıbın içine gömmeden önce ne yapmalısın?',
        o: ['re.compile ile derlemek', 'str.strip uygulamak', 're.escape ile kaçırmak', 'lower() ile küçültmek'], a: 2,
        why: 're.escape, metindeki nokta, parantez gibi özel regex karakterlerini kaçırır; aksi halde "1.5" gibi bir girdi "1x5" ile de eşleşir ya da kalıp bozulur.' }
    ],
    faq: [
      { q: 'match ve search arasında ne fark var?', a: 'match yalnızca metnin başından eşleşmeye çalışır; search metnin herhangi bir yerinde ilk eşleşmeyi bulur. Doğrulama için ikisi de yetersiz olabilir; fullmatch kullan.' },
      { q: 'findall neden bazen demet listesi döndürüyor?', a: 'Kalıpta birden çok yakalama grubu varsa findall her eşleşme için grupların demetini döndürür. Tek grup varsa yalnızca o grubun metnini, grup yoksa tüm eşleşmeyi verir. Gruplamayı yakalamadan yapmak için (?:...) kullan.' },
      { q: 'E-posta doğrulamak için "doğru" regex nedir?', a: 'RFC\'ye tam uyan regex sayfalarca uzundur ve pratik değildir. İş kodunda "bir @ var, öncesi ve sonrası makul karakterler, en az bir nokta" düzeyinde kalıp yeterlidir; gerçek doğrulama onay e-postasıyla yapılır.' },
      { q: 'Ham dize (r"...") kullanmazsam ne olur?', a: '\\b backspace, \\n satır sonu gibi Python kaçışları devreye girer; \\d gibi geçersiz kaçışlar için uyarı alırsın. Kalıpları her zaman r ile yaz.' }
    ],
    mistakes: [
      { bad: 're.match(r"\\d{10}", "5321234567abc")  # eşleşir', good: 're.fullmatch(r"\\d{10}", "5321234567abc")  # None', why: 'match yalnızca baştan bakar, sondaki fazlalığı görmez; doğrulamada fullmatch kullan.' },
      { bad: 're.findall("<b>.*</b>", html)', good: 're.findall("<b>.*?</b>", html)', why: 'Açgözlü .* ilk açılış ile son kapanış arasındaki her şeyi tek parça alır; tembel .*? en kısa eşleşmede durur.' },
      { bad: 'm = re.search(kalip, metin)\nprint(m.group())', good: 'm = re.search(kalip, metin)\nif m:\n    print(m.group())', why: 'Eşleşme yoksa m None olur ve .group() AttributeError fırlatır.' },
      { bad: 're.search("1.5", fiyat)', good: 're.search(r"1\\.5", fiyat)', why: 'Nokta her karakterle eşleşir; gerçek nokta için kaçırılmalı.' }
    ]
  }
);
})(window);
