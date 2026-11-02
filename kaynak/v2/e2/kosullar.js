/* Kesit Python v2 — uzantı: kosullar */
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
{ id: 'kosullar',
  min: 35,
  html: `
<h2>and ve or aslında ne döndürür?</h2>
<p>Ders boyunca <code>and</code> ve <code>or</code>'u True/False üreten operatörler gibi kullandın. Gerçekte ikisi de <b>işlenenlerden birini</b> döndürür: <code>a or b</code>, a doğru (truthy) ise a'yı, değilse b'yi; <code>a and b</code>, a yanlış (falsy) ise a'yı, değilse b'yi verir. Kısa devre de buradan gelir: sonucu belli olan ifadede ikinci tarafa hiç bakılmaz.</p>
<pre class="py">print("" or "Misafir")        # boş metin falsy → "Misafir"
print("Ayşe" or "Misafir")    # "Ayşe"
print(5 and 0)                # 5 truthy → ikinci taraf: 0
print(None and 1 / 0)         # None falsy → bölmeye hiç bakılmaz

ad = ""
gorunen = ad or "Misafir"     # varsayılan değer kalıbı
print(gorunen)

kupon = 0                     # "indirim yok" anlamında bilinçli 0
indirim = kupon or 10         # TUZAK: 0 falsy, 10 seçilir
print(indirim)
indirim = 10 if kupon is None else kupon
print(indirim)</pre>
<div class="warn"><b>"or ile varsayılan" tuzağı</b><code>x or varsayilan</code> yalnızca x'in hiçbir falsy değerinin anlamlı olmadığı durumlarda güvenlidir (ör. boş ad). 0, 0.0, boş liste gibi değerler geçerli bir girdi olabiliyorsa "verilmedi" bilgisini <code>None</code> ile taşı ve <code>is None</code> ile kontrol et.</div>

<h2>Öncelik sırası ve De Morgan</h2>
<p>Karmaşık koşullarda hangi işlemin önce yapıldığını bilmek zorundasın. Karşılaştırmalar mantık operatörlerinden önce, <code>not</code> <code>and</code>'den önce, <code>and</code> de <code>or</code>'dan önce değerlendirilir.</p>
<div class="tbl-wrap"><table>
<tr><th>Öncelik (yüksekten düşüğe)</th><th>Operatör</th><th>Örnek</th><th>Nasıl okunur</th></tr>
<tr><td>1</td><td>Aritmetik</td><td><code>a + b &gt; 100</code></td><td><code>(a + b) &gt; 100</code></td></tr>
<tr><td>2</td><td>Karşılaştırma, <code>in</code>, <code>is</code></td><td><code>x in s and y</code></td><td><code>(x in s) and y</code></td></tr>
<tr><td>3</td><td><code>not</code></td><td><code>not a and b</code></td><td><code>(not a) and b</code></td></tr>
<tr><td>4</td><td><code>and</code></td><td><code>a or b and c</code></td><td><code>a or (b and c)</code></td></tr>
<tr><td>5</td><td><code>or</code></td><td><code>a and b or c</code></td><td><code>(a and b) or c</code></td></tr>
</table></div>
<p>Şüphedeysen parantez kullan; okuyan kişiye de yardım eder. Bir koşulun tersini yazarken <b>De Morgan kuralı</b> işini görür: <code>not (a and b)</code> ile <code>not a or not b</code> aynıdır; <code>not (a or b)</code> ile <code>not a and not b</code> aynıdır. "Kart aktif VE bakiye yeterli değilse" demek, "kart pasif YA DA bakiye yetersiz" demektir.</p>
<pre class="py">kart_aktif, bakiye, tutar = True, 300, 500
print(not (kart_aktif and bakiye &gt;= tutar))
print(not kart_aktif or bakiye &lt; tutar)       # aynı sonuç

premium, kampanya, tutar = False, True, 150
print(premium or kampanya and tutar &gt; 200)    # and önce: False or (True and False)
print((premium or kampanya) and tutar &gt; 200)  # farklı anlam, aynı sonuç burada
print((premium or kampanya) and tutar &gt; 100)  # True</pre>

<h2>Çoklu <code>or</code> yerine <code>in</code>; <code>any</code> ve <code>all</code></h2>
<p><code>sehir == "İzmir" or sehir == "Manisa" or sehir == "Aydın"</code> yerine <code>sehir in {"İzmir", "Manisa", "Aydın"}</code> yaz: daha kısa, daha hızlı ve kural kümesi bir değişkene taşınabilir. Bir listedeki elemanlardan <b>en az biri</b> koşulu sağlıyor mu sorusu için <code>any</code>, <b>hepsi</b> sağlıyor mu için <code>all</code> var.</p>
<pre class="py">ege = {"İzmir", "Manisa", "Aydın"}
print("Manisa" in ege, "Bursa" in ege)

tutarlar = [120, 4800, 75, 9200]
print(any(t &gt; 5000 for t in tutarlar))     # en az biri 5000'i geçiyor mu?
print(all(t &gt; 0 for t in tutarlar))        # hepsi pozitif mi?
print(all([]), any([]))                     # boş listede: True False</pre>
<p>Parantez içindeki <code>t &gt; 5000 for t in tutarlar</code> yapısı bir üreteç ifadesidir (generator expression); her eleman için koşulu sırayla üretir. Comprehension dersinde ayrıntısını göreceksin; şimdilik "her t için şu koşul" diye oku. <code>any</code> ilk True'da, <code>all</code> ilk False'ta durur.</p>
<div class="warn"><b>Boş listede all True'dur</b><code>all([])</code> True döner ("hepsi sağlıyor" iddiasını çürüten eleman yok). "Tüm taksitler ödendi mi?" sorusunda taksit listesi boşsa bunu ayrıca kontrol etmezsen, hiç taksidi olmayan hesap "kapandı" görünür.</div>

<h2>Kayan nokta ve metin karşılaştırma</h2>
<p>Ondalıklı sayılar ikili tabanda tam temsil edilemez; <code>0.1 + 0.2 == 0.3</code> False'tur. Para ya da ölçüm karşılaştırırken <code>math.isclose</code> ya da bir tolerans kullan. Metinlerde ise karşılaştırma harf kodlarına göredir: büyük harfler küçüklerden, rakam içeren metinler de sayısal değil harf harf karşılaştırılır.</p>
<pre class="py">import math
print(0.1 + 0.2 == 0.3)
print(math.isclose(0.1 + 0.2, 0.3))
print(abs(1000.10 - 1000.1000001) &lt; 0.005)  # kuruş toleransı

print("10" &lt; "9")             # metin: "1" &lt; "9" → True
print(int("10") &lt; int("9"))   # sayı: False
print("Zeytin" &lt; "ayva")       # büyük harf önce gelir: True
print("EVET".lower() == "evet")</pre>
<p>Kullanıcı girdisini karşılaştırmadan önce <code>strip()</code> ile boşlukları, <code>lower()</code> ya da <code>casefold()</code> ile büyük/küçük harf farkını temizle. Türkçe "İ/ı" harflerinin küçültmede sürprizleri var; Unicode ve metin dersinde ayrıntılı gördün.</p>

<h2>Uzun elif zinciri yerine tablo</h2>
<p>Eşik tabanlı kurallar (kargo, indirim, vergi dilimi) değiştikçe elif zincirini düzenlemek hataya açıktır. Kuralları bir veri yapısına, karar mantığını tek bir döngüye koyarsan kural değişikliği yalnız veriyi değiştirir. Walrus operatörü (<code>:=</code>) ise bir değeri hem hesaplayıp hem koşulda kullanmanı sağlar.</p>
<pre class="py">KARGO = [(500, 0.0), (200, 29.9), (0, 49.9)]   # büyükten küçüğe

def kargo(tutar):
    for esik, ucret in KARGO:
        if tutar &gt;= esik:
            return ucret
    return None                                  # negatif tutar

print(kargo(750), kargo(250), kargo(50), kargo(-5))

sepet = ["çay", "kahve", "şeker", "su"]
if (n := len(sepet)) &gt; 3:
    print(f"{n} ürün: toplu indirim uygulanır")</pre>
<div class="note"><b>Gerçek işte</b>Bankalarda ve e-ticarette iş kuralları sık değişir: kampanya eşikleri, kredi skor sınırları, kargo bölgeleri. Ekipler bu kuralları çoğunlukla koddan ayırıp yapılandırma dosyasına ya da veritabanı tablosuna koyar; kod yalnızca "kuralları sırayla dene, ilk uyanı uygula" der. Böylece iş birimi bir eşiği değiştirmek için yazılımcı beklemez, test edilen kod da değişmez. Kod incelemesinde (code review) en çok yakalanan koşul hataları ise sınır değerlerdir: <code>&gt;</code> mi <code>&gt;=</code> mi, 500 TL tam sınırda kargo ücretli mi?</div>
`,
  ex: [
    { t: 'mc',
      stage: 'Isınma',
      q: '<code>kupon = 0</code> iken <code>indirim = kupon or 10</code> satırından sonra <code>indirim</code> kaçtır?',
      o: ['0, çünkü kupon tanımlı', '10, çünkü 0 falsy sayılır', 'True, çünkü or bool döndürür', 'TypeError verir'],
      a: 1,
      why: 'or, soldaki değer falsy ise sağdakini döndürür; 0 falsy olduğu için 10 seçilir. "Bilinçli 0" geçerli bir değerse None ile "verilmedi" ayrımı yap: 10 if kupon is None else kupon.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'and/or ne döndürür? Bu kod ne yazdırır?',
      code: 'print("" or "Misafir", 5 and 0, None and 1 / 0)\n',
      o: ['Misafir 0 None', 'True False False', 'Misafir 0 ZeroDivisionError', 'Misafir False None'],
      a: 0,
      why: 'or ilk truthy değeri ("Misafir"), and ilk falsy değeri ya da sonuncuyu (0) döndürür. None and ... ifadesinde soldaki falsy olduğu için 1 / 0 hiç çalışmaz (kısa devre).' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Kayan nokta: bu kod ne yazdırır?',
      code: 'import math\na = 0.1 + 0.2\nprint(a == 0.3, math.isclose(a, 0.3), round(a, 2) == 0.3)\n',
      o: ['True True True', 'False True True', 'False False True', 'False True False'],
      a: 1,
      why: '0.1 + 0.2 aslında 0.30000000000000004\'tür; == False verir. isclose küçük göreli farkı tolere eder; 2 ondalığa yuvarlanmış değer de 0.3\'e eşittir.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Metin karşılaştırma: bu kod ne yazdırır?',
      code: 'print("10" < "9", 10 < 9, "Zeytin" < "ayva")\n',
      o: ['False False False', 'True False False', 'True False True', 'False False True'],
      a: 2,
      why: 'Metinler harf harf karşılaştırılır: "1" &lt; "9" olduğu için "10" &lt; "9" True. Büyük harflerin kodu küçüklerden küçüktür: "Z" (90) &lt; "a" (97).' },
    { t: 'order',
      stage: 'Kodu oku',
      q: '<p>Eşik tablosuyla indirim oranını bulan fonksiyonun satırlarını sırala. Eşikler büyükten küçüğe denenir; hiçbiri tutmazsa 0.0 döner.</p>',
      lines: ['def indirim_orani(tutar):', '    esikler = [(1000, 0.15), (500, 0.10), (200, 0.05)]', '    for esik, oran in esikler:', '        if tutar >= esik:', '            return oran', '    return 0.0', 'print(indirim_orani(750), indirim_orani(120))'],
      expect: '0.1 0.0\n',
      hint: 'return 0.0 döngünün dışında (fonksiyon seviyesinde) olmalı; yoksa ilk eşik tutmazsa hemen 0.0 döner.',
      why: 'İlk uyan eşikte return ile çıkılır. Döngü hiç return etmeden biterse hiçbir eşik tutmamıştır; o zaman 0.0 döner.' },
    { erken: true, id: 'kosullar-x1',
      t: 'code',
      stage: 'Rehberli',
      diff: 1,
      q: '<p>Anadolu Market teslimat süresi: <code>teslimat_suresi(sehir)</code> fonksiyonunu yaz. Şehir adının başındaki/sonundaki boşlukları temizle. Şehir <code>{"İstanbul", "Ankara", "İzmir"}</code> içindeyse <code>"aynı gün"</code>, <code>{"Bursa", "Kocaeli", "Manisa", "Eskişehir"}</code> içindeyse <code>"ertesi gün"</code>, aksi halde <code>"2-3 gün"</code> döndür. Zincirleme <code>==</code>/<code>or</code> kullanma; <code>in</code> kullan.</p>',
      guide: ['İki şehir kümesini fonksiyonun içinde (ya da üstünde) tanımla.', 'sehir = sehir.strip() ile boşlukları temizle.', 'if sehir in ...: / elif sehir in ...: / else: yapısını kur.'],
      example: 'hafta_sonu = {"Cumartesi", "Pazar"}\ngun = " Pazar "\nif gun.strip() in hafta_sonu:\n    print("tatil")\nelse:\n    print("mesai")\n',
      start: 'def teslimat_suresi(sehir):\n    ayni_gun = {"İstanbul", "Ankara", "İzmir"}\n    ertesi_gun = {"Bursa", "Kocaeli", "Manisa", "Eskişehir"}\n    # TODO: boşlukları temizle ve kümelerle karar ver\n    return "2-3 gün"\n',
      sol: 'def teslimat_suresi(sehir):\n    ayni_gun = {"İstanbul", "Ankara", "İzmir"}\n    ertesi_gun = {"Bursa", "Kocaeli", "Manisa", "Eskişehir"}\n    sehir = sehir.strip()\n    if sehir in ayni_gun:\n        return "aynı gün"\n    elif sehir in ertesi_gun:\n        return "ertesi gün"\n    else:\n        return "2-3 gün"\n',
      tests: 'assert teslimat_suresi("İzmir") == "aynı gün", "İzmir aynı gün"\nassert teslimat_suresi("  Manisa ") == "ertesi gün", "boşluklar temizlenmeli: Manisa ertesi gün"\nassert teslimat_suresi("Van") == "2-3 gün", "listede olmayan şehir 2-3 gün"\nassert " or " not in __kod__, "zincirleme or yerine in kullan"\n',
      hints: ['Küme üyeliği: sehir in ayni_gun', 'Önce strip, sonra karşılaştır.', 'elif sehir in ertesi_gun: return "ertesi gün"'],
      why: 'Kümeye üyelik testi hem okunaklı hem hızlıdır; kural listesini değişkende tutmak, şehir eklemeyi koşul satırlarına dokunmadan yapmanı sağlar.' },
    { id: 'kosullar-x2',
      t: 'code',
      stage: 'Rehberli',
      diff: 2,
      q: '<p>Ilgaz Bank taksit takibi: <code>taksit_durumu(odendi)</code> fonksiyonunu yaz. <code>odendi</code>, her taksit için True/False içeren listedir. Liste boşsa <code>"taksit yok"</code>, hepsi ödendiyse <code>"kapandı"</code>, en az biri ödendiyse <code>"devam ediyor"</code>, hiçbiri ödenmediyse <code>"başlamadı"</code> döndür. <code>all</code> ve <code>any</code> kullan.</p>',
      guide: ['Önce boş listeyi kontrol et (all([]) True döner!).', 'all(odendi) True ise "kapandı".', 'Değilse any(odendi) True ise "devam ediyor".', 'Kalan durum: "başlamadı".'],
      example: 'kontroller = [True, True, False]\nif all(kontroller):\n    print("hepsi tamam")\nelif any(kontroller):\n    print("bazıları tamam")\nelse:\n    print("hiçbiri")\n',
      start: 'def taksit_durumu(odendi):\n    # TODO: boş liste kontrolü\n    # TODO: all / any ile karar ver\n    return "başlamadı"\n',
      sol: 'def taksit_durumu(odendi):\n    if not odendi:\n        return "taksit yok"\n    if all(odendi):\n        return "kapandı"\n    if any(odendi):\n        return "devam ediyor"\n    return "başlamadı"\n',
      tests: 'assert taksit_durumu([True, True, True]) == "kapandı", "hepsi ödendi"\nassert taksit_durumu([True, False, False]) == "devam ediyor", "bir kısmı ödendi"\nassert taksit_durumu([False, False]) == "başlamadı", "hiçbiri ödenmedi"\nassert taksit_durumu([]) == "taksit yok", "boş liste: all([]) True olduğu için önce kontrol edilmeli"\n',
      hints: ['Boş liste falsy\'dir: if not odendi:', 'all tümü True mu, any en az biri True mu diye bakar.', 'Sıra önemli: boş → all → any → başlamadı.'],
      why: 'all boş listede True döndürdüğünden boş kontrolü en başta olmalı. all ve any kısa devre yapar; büyük listelerde ilk karar verici elemanda durur.' },
    { id: 'kosullar-x3',
      t: 'code',
      stage: 'Rehberli',
      diff: 2,
      q: '<p>Mutabakat: banka ekstresindeki tutar ile muhasebedeki tutarı karşılaştıran <code>mutabakat(beklenen, gelen)</code> fonksiyonunu yaz. Fark kuruş toleransı içindeyse (<code>abs(fark) &lt; 0.005</code>) <code>"tamam"</code>, gelen daha azsa <code>"eksik"</code>, daha fazlaysa <code>"fazla"</code> döndür. <code>==</code> ile ondalıklı sayı karşılaştırma.</p>',
      guide: ['fark = gelen - beklenen hesapla.', 'Önce toleransı kontrol et: abs(fark) &lt; 0.005 ise "tamam".', 'Sonra işarete bak: fark &lt; 0 ise "eksik", aksi halde "fazla".'],
      example: 'olcum, hedef = 9.9999999, 10.0\nif abs(olcum - hedef) < 0.001:\n    print("hedefte")\nelif olcum < hedef:\n    print("altında")\nelse:\n    print("üstünde")\n',
      start: 'def mutabakat(beklenen, gelen):\n    fark = gelen - beklenen\n    # TODO: önce tolerans, sonra yön\n    if gelen == beklenen:\n        return "tamam"\n',
      sol: 'def mutabakat(beklenen, gelen):\n    fark = gelen - beklenen\n    if abs(fark) < 0.005:\n        return "tamam"\n    if fark < 0:\n        return "eksik"\n    return "fazla"\n',
      tests: 'assert mutabakat(0.3, 0.1 + 0.2) == "tamam", "0.1 + 0.2 ile 0.3 kuruş toleransında eşittir"\nassert mutabakat(1500.0, 1499.0) == "eksik", "1 TL eksik"\nassert mutabakat(1500.0, 1500.01) == "fazla", "1 kuruş fazla tolerans dışıdır"\nassert mutabakat(100, 100) == "tamam", "tam eşit"\nassert "==" not in __kod__, "ondalıklı sayılarda == yerine tolerans kullan"\n',
      hints: ['Toleranslı eşitlik: abs(fark) &lt; 0.005', 'Eşit değilse fark\'ın işaretine bak.'],
      why: 'Kayan nokta hataları 0.30000000000000004 gibi küçük farklar üretir; kuruş toleransı bunları yok sayarken gerçek farkları (1 kuruş ve üstü) yakalar.' },
    { erken: true, id: 'kosullar-x4',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p>İK bordro kuralı: <code>gunluk_ucret(saat, saat_ucreti, gun_turu="normal")</code> fonksiyonunu yaz. <code>gun_turu</code> <code>"normal"</code>, <code>"hafta_sonu"</code> ya da <code>"resmi_tatil"</code> olabilir.</p><ul><li>Normal gün: ilk 8 saat 1 kat, 8\'i aşan saatler 1.5 kat.</li><li>Hafta sonu: tüm saatler 1.5 kat.</li><li>Resmi tatil: tüm saatler 2 kat.</li><li>Geçersiz gün türü ya da negatif saat için <code>ValueError</code> fırlat (<code>raise ValueError("...")</code>).</li></ul><p>Sonucu 2 ondalığa yuvarla.</p>',
      start: 'def gunluk_ucret(saat, saat_ucreti, gun_turu="normal"):\n    pass\n',
      sol: 'def gunluk_ucret(saat, saat_ucreti, gun_turu="normal"):\n    if saat < 0 or gun_turu not in {"normal", "hafta_sonu", "resmi_tatil"}:\n        raise ValueError("geçersiz girdi")\n    if gun_turu == "resmi_tatil":\n        ucret = saat * saat_ucreti * 2\n    elif gun_turu == "hafta_sonu":\n        ucret = saat * saat_ucreti * 1.5\n    elif saat <= 8:\n        ucret = saat * saat_ucreti\n    else:\n        ucret = 8 * saat_ucreti + (saat - 8) * saat_ucreti * 1.5\n    return round(ucret, 2)\n',
      tests: 'assert gunluk_ucret(8, 100) == 800, "8 saat normal"\nassert gunluk_ucret(10, 100) == 1100, "8 normal + 2 × 150 = 1100"\nassert gunluk_ucret(10, 100, "hafta_sonu") == 1500, "hafta sonu tüm saatler 1.5 kat"\nassert gunluk_ucret(5, 120, "resmi_tatil") == 1200, "resmi tatil 2 kat"\nassert gunluk_ucret(0, 100) == 0, "0 saat 0 TL"\nfor kotu in [(-1, 100, "normal"), (5, 100, "bayram")]:\n    try:\n        gunluk_ucret(*kotu)\n        assert False, f"{kotu} için ValueError bekleniyordu"\n    except ValueError:\n        pass\n',
      hints: ['Önce geçersiz girdileri ele (koruma koşulu): saat &lt; 0 or gun_turu not in {...}', 'Mesai fazlası yalnız normal günde: 8 * u + (saat - 8) * u * 1.5'],
      why: 'Geçersiz girdiyi en başta reddetmek (guard clause) geri kalan dalları sadeleştirir. Özel günler önce kontrol edilir; mesai fazlası hesabı yalnız normal güne kalır.' },
    { erken: true, id: 'kosullar-x5',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p><code>sifre_kontrol(sifre)</code> fonksiyonunu yaz. Eksik kuralların listesini döndürsün (sıra aşağıdaki gibi; hepsi sağlanıyorsa boş liste):</p><ul><li><code>"uzunluk"</code>: en az 8 karakter değilse</li><li><code>"rakam"</code>: hiç rakam yoksa</li><li><code>"buyuk"</code>: hiç büyük harf yoksa</li><li><code>"kucuk"</code>: hiç küçük harf yoksa</li><li><code>"bosluk"</code>: boşluk karakteri içeriyorsa</li></ul><p>Karakter kontrolleri için <code>any(...)</code> ve <code>str.isdigit</code>, <code>isupper</code>, <code>islower</code> kullan.</p>',
      start: 'def sifre_kontrol(sifre):\n    pass\n',
      sol: 'def sifre_kontrol(sifre):\n    eksik = []\n    if len(sifre) < 8:\n        eksik.append("uzunluk")\n    if not any(c.isdigit() for c in sifre):\n        eksik.append("rakam")\n    if not any(c.isupper() for c in sifre):\n        eksik.append("buyuk")\n    if not any(c.islower() for c in sifre):\n        eksik.append("kucuk")\n    if " " in sifre:\n        eksik.append("bosluk")\n    return eksik\n',
      tests: 'assert sifre_kontrol("Anadolu2025") == [], "tüm kurallar sağlanıyor"\nassert sifre_kontrol("abc") == ["uzunluk", "rakam", "buyuk"], f"gelen {sifre_kontrol(\'abc\')}"\nassert sifre_kontrol("ŞİFRE 1234") == ["kucuk", "bosluk"], "Türkçe büyük harfler de büyük sayılır; boşluk var"\nassert sifre_kontrol("") == ["uzunluk", "rakam", "buyuk", "kucuk"], "boş şifre"\n',
      hints: ['Kurallar birbirinden bağımsız: elif değil, ayrı if\'ler kullan.', 'any(c.isdigit() for c in sifre) en az bir rakam var mı diye bakar.'],
      why: 'Her kural bağımsız olduğu için ayrı if\'ler hepsini raporlar; elif ilk eksikte dururdu. any, karakterlerden biri koşulu sağlayınca hemen True döner.' },
    { id: 'kosullar-x6',
      t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      diff: 2,
      q: '<p>Hatayı bul ve düzelt. <code>indirim_yuzdesi(kupon_yuzde=None)</code>: kupon verilmezse (None) varsayılan %10 uygulanmalı; kupon <b>0</b> olarak verilirse "indirim yok" demektir ve 0 dönmeli. Kod 0 kuponunda da 10 döndürüyor.</p>',
      start: 'def indirim_yuzdesi(kupon_yuzde=None):\n    return kupon_yuzde or 10\n',
      sol: 'def indirim_yuzdesi(kupon_yuzde=None):\n    if kupon_yuzde is None:\n        return 10\n    return kupon_yuzde\n',
      tests: 'assert indirim_yuzdesi() == 10, "kupon verilmediyse 10"\nassert indirim_yuzdesi(25) == 25, "kupon 25 ise 25"\nassert indirim_yuzdesi(0) == 0, "0 bilinçli bir değerdir: indirim yok, 0 dönmeli"\n',
      hints: ['0 falsy olduğu için or onu "yok" sayıyor.', '"Verilmedi" kontrolünü is None ile yap.'],
      why: 'or tüm falsy değerleri eler; 0 geçerli bir girdi olduğunda yalnızca None\'ı "verilmedi" saymak gerekir.' },
    { id: 'kosullar-x7',
      t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      diff: 2,
      q: '<p>Hatayı bul ve düzelt. <code>hesap_kapanabilir(hareketler)</code>, hesap hareketlerinin toplamı sıfırsa (kuruş toleransıyla) <code>True</code> döndürmeli. <code>[0.1, 0.2, -0.3]</code> gibi hareketlerde hesap kapanması gerekirken False dönüyor.</p>',
      start: 'def hesap_kapanabilir(hareketler):\n    return sum(hareketler) == 0\n',
      sol: 'def hesap_kapanabilir(hareketler):\n    return abs(sum(hareketler)) < 0.005\n',
      tests: 'assert hesap_kapanabilir([0.1, 0.2, -0.3]) is True, "0.1 + 0.2 - 0.3 kayan nokta hatasıyla 5.5e-17 çıkar; tolerans içinde sıfırdır"\nassert hesap_kapanabilir([100, -99.99]) is False, "1 kuruş bakiye varken kapanamaz"\nassert hesap_kapanabilir([]) is True, "hareket yoksa bakiye 0"\nassert hesap_kapanabilir([-0.004]) is True, "yarım kuruşun altı yuvarlama farkıdır"\n',
      hints: ['sum([0.1, 0.2, -0.3]) tam 0 değil, çok küçük bir sayıdır.', 'abs(toplam) &lt; 0.005 ile kuruş toleransı kullan.'],
      why: 'Ondalıklı toplamlar küçük temsil hataları biriktirir; para hesaplarında tam eşitlik yerine tolerans (ya da Decimal) kullanılır.' },
    { erken: true, id: 'kosullar-x8',
      t: 'code',
      stage: 'Meydan okuma',
      diff: 3,
      q: '<p>Dilimli (artan oranlı) vergi: <code>dilimli_vergi(matrah)</code> fonksiyonunu yaz. Kurgusal dilimler:</p><ul><li>İlk 100.000 TL: %15</li><li>100.000 – 250.000 arası: %20</li><li>250.000 – 800.000 arası: %27</li><li>800.000 üstü: %35</li></ul><p>Her oran yalnızca kendi dilimine düşen kısma uygulanır. Örnek: 150.000 TL için 100.000 × 0.15 + 50.000 × 0.20 = 25.000. Sonucu 2 ondalığa yuvarla. Matrah 0 ya da negatifse 0 döndür. Dilimleri bir listede tut; elif zinciriyle her durumu ayrı ayrı yazma.</p>',
      start: 'def dilimli_vergi(matrah):\n    pass\n',
      sol: 'def dilimli_vergi(matrah):\n    dilimler = [(100000, 0.15), (250000, 0.20), (800000, 0.27), (float("inf"), 0.35)]\n    vergi = 0.0\n    alt = 0\n    for ust, oran in dilimler:\n        if matrah <= alt:\n            break\n        dilim_tutari = min(matrah, ust) - alt\n        vergi += dilim_tutari * oran\n        alt = ust\n    return round(vergi, 2)\n',
      tests: 'assert dilimli_vergi(150000) == 25000.0, "100000 × %15 + 50000 × %20 = 25000"\nassert dilimli_vergi(100000) == 15000.0, "tam sınırda yalnız ilk dilim"\nassert dilimli_vergi(50000) == 7500.0, "ilk dilimin içinde"\nassert dilimli_vergi(1000000) == 15000 + 30000 + 148500 + 70000, "dört dilimin hepsi: 263500"\nassert dilimli_vergi(0) == 0 and dilimli_vergi(-500) == 0, "0 ve negatif matrah 0"\nassert dilimli_vergi(250000.5) == 45000.14, "kesirli matrah: son 0.5 TL %27 dilimine düşer"\n',
      hints: ['Dilimleri (üst sınır, oran) listesi olarak tut; son dilimin üst sınırı float("inf").', 'Bir önceki dilimin üst sınırını (alt) takip et; her dilimde vergilenecek kısım min(matrah, ust) - alt.', 'matrah &lt;= alt olduğunda daha üst dilimlere geçme (break).'],
      why: 'Tablo güdümlü yaklaşım her dilime aynı kuralı uygular: dilimin içine düşen tutar × oran. Sınırlar değişince yalnız liste değişir; kenar durumlar (tam sınır, negatif) aynı döngüyle doğru çıkar.' }
  ],
  faq: [
    { q: '<code>x if kosul else y</code> içinde elif yazabilir miyim?', a: 'Doğrudan yazamazsın ama iç içe koyabilirsin: <code>"A" if p &gt; 80 else "B" if p &gt; 50 else "C"</code>. İkiden fazla dal okunurluğu hızla düşürür; o durumda normal if/elif ya da eşik tablosu kullan.' },
    { q: 'any ve all içinde liste mi vermeliyim, üreteç mi?', a: 'İkisi de çalışır. <code>any(t &gt; 5000 for t in tutarlar)</code> (üreteç) ilk True\'da durur ve ara liste oluşturmaz; <code>any([...])</code> önce tüm listeyi kurar. Büyük verilerde üreteç tercih edilir.' }
  ],
  mistakes: [
    { bad: 'indirim = kupon or 10', good: 'indirim = 10 if kupon is None else kupon', why: '0 geçerli bir değerse or onu yok sayar; "verilmedi" bilgisini None ile taşı.' },
    { bad: 'if toplam == 0.3:', good: 'import math\nif math.isclose(toplam, 0.3):', why: 'Kayan nokta toplamları küçük temsil hataları içerir; ondalıklı sayılarda tam eşitlik yerine isclose ya da tolerans kullan.' }
  ]
}
);
})(window);
