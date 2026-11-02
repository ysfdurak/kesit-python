/* Kesit Python v2 — uzantı: demet-kume */
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
{ id: 'demet-kume',
  min: 35,
  html: `
<h2>Demetleri karşılaştırmak ve sıralamak</h2>
<p>İki demet karşılaştırılırken Python <b>soldan sağa</b> eleman eleman bakar: ilk elemanlar farklıysa sonuç oradan belli olur, eşitse ikinci elemana geçer. Buna sözlük sırası (lexicographic order) denir. Bu kural sayesinde demet listesini <code>sorted</code> ile sıraladığında önce ilk alana, eşitlikte ikinci alana göre sıralama kendiliğinden olur.</p>
<pre class="py">print((2025, 3) &lt; (2025, 11))      # ilk eşit, 3 &lt; 11
print(("Bursa", 900) &lt; ("Ankara", 50))   # "B" &gt; "A", gerisine bakılmaz

siparisler = [("AM-104", "İzmir", 450.0), ("AM-101", "Ankara", 1200.0),
              ("AM-103", "İzmir", 1890.5), ("AM-102", "Ankara", 75.0)]

def sehir_sonra_tutar(s):
    # şehir artan, eşit şehirde tutar AZALAN: sayıyı eksiyle çevir
    return (s[1], -s[2])

for kod, sehir, tutar in sorted(siparisler, key=sehir_sonra_tutar):
    print(kod, sehir, tutar)</pre>
<p><code>key</code> parametresine verdiğin fonksiyon her eleman için bir "sıralama anahtarı" üretir; anahtar demet olunca çok kriterli sıralama tek satıra iner. Azalan sıra gereken sayısal alanı eksiyle çevirmek yaygın bir hiledir. Fonksiyonu tek satırda <code>lambda</code> ile yazmayı Fonksiyonel programlama dersinde göreceksin.</p>
<div class="note"><b>Türkçe harfler</b>Metin karşılaştırması harflerin Unicode numarasına göre yapılır; "İ", "Ç", "Ş" gibi harfler Z'den sonra gelir. Bu yüzden <code>"İzmir"</code>, <code>"Zonguldak"</code>'tan büyük sayılır. Doğru Türkçe alfabetik sıra için Unicode ve metin dersindeki teknikleri kullanırsın.</div>

<h2>İç içe açma ve yıldızlı açma</h2>
<p>Açma (unpacking) yalnızca düz demetlerde değil, iç içe yapılarda da çalışır. Sol tarafı verinin <b>şekline</b> benzetmen yeterli. Döngü başlığında yapıldığında kayıtları okumak çok kolaylaşır.</p>
<pre class="py">kayitlar = [("AM-1", ("İzmir", 120)), ("AM-2", ("Bursa", 80))]
for kod, (sehir, tutar) in kayitlar:
    print(f"{kod}: {sehir} / {tutar} TL")

ilk, *_, son = (5, 8, 13, 21, 34)   # _ : "umursamıyorum" adı
print(ilk, son)

basla, bitir = ("09:00", "18:00")
mesai = (basla, "12:30", bitir)
print(*mesai)                      # yıldız, demeti argümanlara dağıtır
print(*mesai, sep=" | ")</pre>
<p>Alt çizgi (<code>_</code>) Python için sıradan bir değişken adıdır ama ekip içinde "bu değeri kullanmayacağım" anlamına gelen ortak bir işarettir. Çağrıdaki <code>*mesai</code> ise demeti açıp her elemanı ayrı argüman olarak verir; Fonksiyonlar dersinde <code>*args</code> ile bunun tersini göreceksin.</p>

<h2>Değişmezlik yüzeyseldir</h2>
<p>Demet, içinde tuttuğu <b>referansları</b> değiştirmene izin vermez; ama referansın gösterdiği nesne değişebilir türdeyse (liste, sözlük) o nesne değişebilir. Bu yüzden içinde liste olan bir demet "değişmez" görünse de içeriği değişir ve karması (hash) hesaplanamaz.</p>
<pre class="py">kayit = ("AM-7", ["kalem"])
kayit[1].append("defter")       # demeti değil, içindeki listeyi değiştiriyoruz
print(kayit)
try:
    hash(kayit)
except TypeError as h:
    print("Anahtar/küme elemanı olamaz:", h)
sabit = ("AM-7", ("kalem", "defter"))  # iç kısım da demet: tamamen değişmez
print(hash(sabit) == hash(("AM-7", ("kalem", "defter"))))</pre>
<div class="warn"><b>Tek elemanlı demet ekleme tuzağı</b><code>kayit[:2] + (yeni,)</code> doğru, <code>kayit[:2] + (yeni)</code> yanlış: virgülsüz parantez yalnızca gruplar ve "demete sayı eklenemez" anlamında <code>TypeError</code> alırsın.</div>

<h2>Kümeyi yerinde güncellemek</h2>
<p>İlk bölümde <code>|</code>, <code>&amp;</code>, <code>-</code>, <code>^</code> ile <b>yeni</b> küme üretmeyi gördün. Büyük bir kümeyi adım adım daraltırken her seferinde yenisini kurmak yerine kümeyi <b>yerinde</b> (in-place) güncelleyebilirsin.</p>
<div class="tbl-wrap"><table>
<tr><th>Yöntem</th><th>Ne yapar?</th><th>Dönen değer</th><th>Eleman yoksa</th></tr>
<tr><td><code>k.add(x)</code></td><td>Tek eleman ekler</td><td>None</td><td>-</td></tr>
<tr><td><code>k.update(liste)</code> / <code>k |= b</code></td><td>Birçok eleman ekler</td><td>None</td><td>-</td></tr>
<tr><td><code>k.remove(x)</code></td><td>Siler</td><td>None</td><td><code>KeyError</code></td></tr>
<tr><td><code>k.discard(x)</code></td><td>Siler</td><td>None</td><td>Sessiz geçer</td></tr>
<tr><td><code>k.pop()</code></td><td>Rastgele bir eleman çıkarır</td><td>Çıkan eleman</td><td>Boşsa <code>KeyError</code></td></tr>
<tr><td><code>k -= b</code> / <code>k.difference_update(b)</code></td><td>b'dekileri çıkarır</td><td>None</td><td>-</td></tr>
<tr><td><code>k &amp;= b</code> / <code>k.intersection_update(b)</code></td><td>Yalnız ortakları tutar</td><td>None</td><td>-</td></tr>
<tr><td><code>a.isdisjoint(b)</code></td><td>Ortak eleman yok mu?</td><td>bool</td><td>-</td></tr>
<tr><td><code>a.issuperset(b)</code> / <code>a &gt;= b</code></td><td>b'nin tamamı a'da mı?</td><td>bool</td><td>-</td></tr>
</table></div>
<pre class="py">hedef = set(range(1001, 1011))          # 10 müşteri
kara_liste = [1003, 1007, 1099]
izin_yok = {1001, 1007}
hedef -= set(kara_liste)                 # 1099 hiç yoktu, sorun değil
hedef.difference_update(izin_yok)
print(len(hedef), sorted(hedef))
print(hedef.isdisjoint(izin_yok))        # artık ortak yok: True
sonuc = hedef.update({2001})             # update None döndürür!
print(sonuc)</pre>
<p>Metot adının sonunda <code>_update</code> görüyorsan ya da <code>add</code>, <code>remove</code>, <code>discard</code> gibi bir fiilse işlem yerinde yapılır ve <code>None</code> döner. <code>hedef = hedef.update(...)</code> yazmak kümeni kaybettirir.</p>

<h2>Sırayı koruyarak tekrar kaldırmak</h2>
<p><code>set(liste)</code> tekrarları siler ama sırayı bozar. Raporda ilk görülme sırası önemliyse "görülenler kümesi" kalıbını kullan: kümeyi hızlı üyelik testi için, listeyi sıra için tutarsın.</p>
<pre class="py">sehirler = ["İzmir", "Ankara", "İzmir", "Bursa", "Ankara", "Adana"]
gorulen = set()
sirali = []
for s in sehirler:
    if s not in gorulen:
        gorulen.add(s)
        sirali.append(s)
print(sirali)
print(list(dict.fromkeys(sehirler)))   # aynı sonuç, tek satır</pre>
<p>İkinci satırdaki <code>dict.fromkeys</code> hilesini Sözlükler dersinden sonra daha iyi anlayacaksın: sözlükler ekleme sırasını korur ve anahtarları benzersizdir. Küme kurmanın tek satırlık yolu olan küme comprehension'ı (<code>{s.strip() for s in sehirler}</code>) ise Comprehension dersinde göreceksin.</p>

<h2>Kayıt tekilleştirme ve frozenset</h2>
<p>Demetler değişmez olduğu için kümeye girebilir; bu, aynı (müşteri, ürün) kaydının iki kez yüklenmesi gibi hataları yakalamanın en kısa yoludur. Sıranın önemsiz olduğu ikililerde (ör. "birlikte alınan iki ürün") ise <code>frozenset</code> kullanırsın: <code>frozenset({"çay", "şeker"})</code> ile <code>frozenset({"şeker", "çay"})</code> eşittir.</p>
<pre class="py">yuklenen = [("M-1", "çay"), ("M-2", "kahve"), ("M-1", "çay"), ("M-3", "çay")]
print(len(yuklenen), "satır,", len(set(yuklenen)), "benzersiz kayıt")

ikili_1 = frozenset({"çay", "şeker"})
ikili_2 = frozenset({"şeker", "çay"})
print(ikili_1 == ikili_2, len({ikili_1, ikili_2}))
print(("çay", "şeker") == ("şeker", "çay"))   # demette sıra önemli</pre>
<div class="note"><b>Gerçek işte</b>Veri ekiplerinin en sık yaptığı işlerden biri <i>mutabakattır</i> (reconciliation): CRM'deki müşteri numaralarıyla muhasebe sistemindekiler tutuyor mu, depodaki SKU listesi ile e-ticaret sitesindeki aynı mı? Bu soruların ilk cevabı neredeyse her zaman iki kümenin farkıdır. Excel'de DÜŞEYARA ile saatler süren karşılaştırma, kümeye çevrilmiş iki listeyle saniyeler sürer; çıkan "eksik" ve "fazla" listeleri ilgili ekibe gönderilir.</div>
`,
  ex: [
    { t: 'mc',
      stage: 'Isınma',
      q: '<code>t = ("AM-7", [1, 2])</code> tanımlandıktan sonra hangisi doğrudur?',
      o: ['t[1] = [3] çalışır, t[1].append(3) hata verir', 't[1].append(3) çalışır, ama hash(t) TypeError verir', 'İkisi de çalışır; demet aslında değişebilir', 'Demet içine liste konamaz, tanım hata verir'],
      a: 1,
      why: 'Demet içindeki referansı değiştiremezsin (t[1] = ... hata verir) ama gösterilen liste değişebilir. İçinde liste olduğu için demetin karması hesaplanamaz; sözlük anahtarı ya da küme elemanı olamaz.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Demet sıralaması: bu kod ne yazdırır?',
      code: 'satirlar = [("İzmir", 3), ("Ankara", 5), ("İzmir", 1)]\nprint(sorted(satirlar))\n',
      o: ["[('Ankara', 5), ('İzmir', 1), ('İzmir', 3)]", "[('Ankara', 5), ('İzmir', 3), ('İzmir', 1)]", "[('İzmir', 1), ('İzmir', 3), ('Ankara', 5)]", "[('İzmir', 1), ('İzmir', 3), ('Ankara', 5)] (sayıya göre)"],
      a: 0,
      why: 'Demetler önce ilk elemana göre karşılaştırılır: "Ankara" < "İzmir". İki İzmir kaydında ilk eleman eşit olduğu için ikinci elemana (1 < 3) bakılır.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Yerinde güncelleme: bu kod ne yazdırır?',
      code: 'a = {3, 1, 2}\nb = a.update({4, 1})\nprint(sorted(a), b)\n',
      o: ['[1, 2, 3, 4] None', '[1, 1, 2, 3, 4] None', '[1, 2, 3] {1, 2, 3, 4}', '[1, 2, 3, 4] {1, 2, 3, 4}'],
      a: 0,
      why: 'update kümeyi yerinde değiştirir ve None döndürür; b None olur. Kümede 1 zaten olduğu için ikinci kez eklenmez.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Bu kod çalıştırılınca ne olur?',
      code: 'kayit = ("AM-7", ["kalem"])\nkayit[1].append("defter")\nprint(kayit)\nizlenen = {kayit}\nprint("eklendi")\n',
      o: ["('AM-7', ['kalem', 'defter']) ve eklendi", 'İkinci satırda hata: demet değiştirilemez', 'Demeti yazar, sonra TypeError verir', "('AM-7', ['kalem']) ve eklendi"],
      a: 2,
      raises: true,
      why: 'append demeti değil içindeki listeyi değiştirir, bu yüzden ilk print çalışır. Kümeye eklerken karma (hash) gerekir; içinde liste olan demetin karması hesaplanamaz: TypeError: unhashable type: \'list\'.' },
    { t: 'order',
      stage: 'Kodu oku',
      q: '<p>Tutarı eşiği geçen siparişlerin şehirlerini benzersiz ve sıralı döndüren fonksiyonun satırlarını sırala. Kayıtlar <code>(kod, (sehir, tutar))</code> biçiminde.</p>',
      lines: ['def buyuk_sehirler(satislar, esik):', '    sonuc = set()', '    for kod, (sehir, tutar) in satislar:', '        if tutar >= esik:', '            sonuc.add(sehir)', '    return sorted(sonuc)', 'print(buyuk_sehirler([("AM-1", ("İzmir", 120)), ("AM-2", ("Bursa", 80)), ("AM-3", ("Ankara", 60)), ("AM-4", ("İzmir", 95))], 75))'],
      expect: "['Bursa', 'İzmir']\n",
      hint: 'Boş küme döngüden önce kurulur; iç içe açma döngü başlığında yapılır; sıralı liste en sonda döner.',
      why: 'İç içe açma (kod, (sehir, tutar)) kaydın şeklini taklit eder. Küme İzmir\'i iki kez eklese de tek tutar; sorted kümeyi sıralı listeye çevirir.' },
    { id: 'demet-kume-x1',
      t: 'code',
      stage: 'Rehberli',
      diff: 1,
      q: '<p><code>sirala_siparisler(siparisler)</code> fonksiyonunu yaz. <code>siparisler</code>, <code>(kod, sehir, tutar)</code> demetlerinden oluşan bir listedir. Yeni bir liste döndür: önce şehre göre <b>artan</b>, aynı şehirde tutara göre <b>azalan</b> sıralı olsun. Orijinal liste değişmesin.</p>',
      guide: ['Bir sıralama anahtarı fonksiyonu tanımla: bir sipariş alıp demet döndürsün.', 'Anahtarın ilk elemanı şehir, ikincisi tutarın eksi işaretlisi olsun (azalan sıra için).', 'sorted(siparisler, key=...) ile yeni liste üret ve döndür.'],
      example: 'ogrenciler = [("Ali", "9-A", 70), ("Can", "9-B", 85), ("Ece", "9-A", 92)]\n\ndef anahtar(o):\n    return (o[1], -o[2])\n\nprint(sorted(ogrenciler, key=anahtar))\n',
      start: 'def sirala_siparisler(siparisler):\n    def anahtar(s):\n        # TODO: (şehir, -tutar) demeti döndür\n        return 0\n    # TODO: sorted ile yeni liste döndür\n    return siparisler\n',
      sol: 'def sirala_siparisler(siparisler):\n    def anahtar(s):\n        return (s[1], -s[2])\n    return sorted(siparisler, key=anahtar)\n',
      tests: 'veri = [("AM-4", "İzmir", 450.0), ("AM-1", "Ankara", 1200.0), ("AM-3", "İzmir", 1890.5), ("AM-2", "Ankara", 75.0)]\nkopya = list(veri)\nr = sirala_siparisler(veri)\nassert [s[0] for s in r] == ["AM-1", "AM-2", "AM-3", "AM-4"], f"Ankara önce (1200, 75), sonra İzmir (1890.5, 450) bekleniyordu; gelen {[s[0] for s in r]}"\nassert veri == kopya, "orijinal liste değişmemeli: sort yerine sorted kullan"\nassert sirala_siparisler([]) == [], "boş liste boş döner"\n',
      hints: ['Demet anahtarlar çok kriterli sıralama yapar.', 'Azalan sayı için anahtarda -s[2] kullan.', 'return sorted(siparisler, key=anahtar)'],
      why: 'Demetler soldan sağa karşılaştırıldığı için (şehir, -tutar) anahtarı önce şehre, eşitlikte büyük tutara öncelik verir. sorted yeni liste döndürür, orijinali korur.' },
    { id: 'demet-kume-x2',
      t: 'code',
      stage: 'Rehberli',
      diff: 1,
      q: '<p><code>sirali_benzersiz(degerler)</code> fonksiyonunu yaz: listedeki tekrarları kaldırsın ama <b>ilk görülme sırasını</b> korusun. Örnek: <code>["İzmir", "Ankara", "İzmir", "Bursa"]</code> → <code>["İzmir", "Ankara", "Bursa"]</code>. Üyelik kontrolü için küme kullan.</p>',
      guide: ['Boş bir "görülenler" kümesi ve boş bir sonuç listesi oluştur.', 'Listeyi sırayla gez.', 'Eleman görülenlerde yoksa hem kümeye hem sonuca ekle.', 'Sonuç listesini döndür.'],
      example: 'kodlar = [3, 1, 3, 2, 1]\ngorulen = set()\nfor k in kodlar:\n    if k in gorulen:\n        print(k, "tekrar")\n    gorulen.add(k)\n',
      start: 'def sirali_benzersiz(degerler):\n    gorulen = set()\n    sonuc = []\n    for d in degerler:\n        # TODO: d daha önce görülmediyse kümeye ve sonuca ekle\n        pass\n    return sonuc\n',
      sol: 'def sirali_benzersiz(degerler):\n    gorulen = set()\n    sonuc = []\n    for d in degerler:\n        if d not in gorulen:\n            gorulen.add(d)\n            sonuc.append(d)\n    return sonuc\n',
      tests: 'assert sirali_benzersiz(["İzmir", "Ankara", "İzmir", "Bursa", "Ankara"]) == ["İzmir", "Ankara", "Bursa"], "ilk görülme sırası korunmalı"\nassert sirali_benzersiz([5, 5, 5]) == [5], "hepsi aynıysa tek eleman"\nassert sirali_benzersiz([]) == [], "boş liste"\nassert sirali_benzersiz([3, 1, 2]) == [3, 1, 2], "tekrarsız listede sıra değişmemeli (sorted kullanma)"\nassert "set(" in __source__, "üyelik kontrolü için küme kullan"\n',
      hints: ['"Görülenler kümesi" kalıbı: küme hız için, liste sıra için.', 'if d not in gorulen:', 'Bloğun içinde gorulen.add(d) ve sonuc.append(d)'],
      why: 'Listede in sorgusu her seferinde baştan tarar; kümede neredeyse anında yanıtlanır. Sonuç listesi ise ekleme sırasını korur.' },
    { id: 'demet-kume-x3',
      t: 'code',
      stage: 'Rehberli',
      diff: 2,
      q: '<p>Ilgaz Bank kampanya ekibi SMS listesi hazırlıyor. <code>hedef_kitle(tum, haric_listeler)</code> fonksiyonunu yaz: <code>tum</code> müşteri numarası listesidir (tekrar içerebilir); <code>haric_listeler</code> ise listelerin listesidir (kara liste, izin vermeyenler, son 7 günde SMS alanlar...). <code>tum</code> içinden hariç listelerin <b>herhangi birinde</b> geçenleri çıkar ve kalanları <b>sıralı liste</b> olarak döndür. Kümeyi yerinde güncelle (<code>-=</code> ya da <code>difference_update</code>).</p>',
      guide: ['tum listesini kümeye çevir.', 'haric_listeler içindeki her liste için kümeden o listedekileri çıkar.', 'Çıkarma işlemini yerinde yap: kume -= set(liste) ya da kume.difference_update(liste).', 'sorted ile sıralı liste döndür.'],
      example: 'stok = {"A1", "A2", "A3", "A4"}\nsatilanlar = [["A1"], ["A3", "A9"]]\nfor parti in satilanlar:\n    stok.difference_update(parti)\nprint(sorted(stok))\n',
      start: 'def hedef_kitle(tum, haric_listeler):\n    kume = set(tum)\n    # TODO: her hariç listeyi kümeden çıkar\n    return sorted(kume)\n',
      sol: 'def hedef_kitle(tum, haric_listeler):\n    kume = set(tum)\n    for liste in haric_listeler:\n        kume -= set(liste)\n    return sorted(kume)\n',
      tests: 'tum = [1001, 1002, 1003, 1004, 1005, 1002]\nassert hedef_kitle(tum, [[1003], [1001, 1099], [1005]]) == [1002, 1004], "1003, 1001 ve 1005 çıkarılmalı; listede olmayan 1099 sorun çıkarmamalı"\nassert hedef_kitle(tum, []) == [1001, 1002, 1003, 1004, 1005], "hariç liste yoksa tekrarsız tüm müşteriler"\nassert hedef_kitle([], [[1]]) == [], "boş müşteri listesi"\nassert hedef_kitle([7, 8], [[7, 8]]) == [], "herkes hariçse boş liste"\n',
      hints: ['Kümede farkı yerinde almak için -= ya da difference_update.', 'for liste in haric_listeler: kume -= set(liste)'],
      why: 'Fark işlemi listede olmayan elemanlarda hata vermez; yerinde güncelleme, büyük kümelerde her adımda yeni küme kurmaktan kaçınır.' },
    { id: 'demet-kume-x4',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p><code>ortak_urunler(sepetler)</code> fonksiyonunu yaz. <code>sepetler</code>, her biri ürün adlarından oluşan listelerin listesidir. <b>Her sepette</b> bulunan ürünleri alfabetik sıralı liste olarak döndür. Sepet listesi boşsa boş liste döndür.</p>',
      start: 'def ortak_urunler(sepetler):\n    pass\n',
      sol: 'def ortak_urunler(sepetler):\n    if not sepetler:\n        return []\n    ortak = set(sepetler[0])\n    for sepet in sepetler[1:]:\n        ortak &= set(sepet)\n    return sorted(ortak)\n',
      tests: 's = [["çay", "şeker", "ekmek"], ["ekmek", "çay", "süt"], ["çay", "ekmek", "çay"]]\nassert ortak_urunler(s) == ["ekmek", "çay"], f"üç sepette de çay ve ekmek var (Unicode sırasıyla ekmek önce); gelen {ortak_urunler(s)}"\nassert ortak_urunler([["su"], ["kola"]]) == [], "ortak ürün yoksa boş liste"\nassert ortak_urunler([]) == [], "sepet yoksa boş liste"\nassert ortak_urunler([["b", "a", "b"]]) == ["a", "b"], "tek sepette o sepetin benzersiz ürünleri"\n',
      hints: ['İlk sepetle başla, sonrakilerle kesişim al.', 'ortak &= set(sepet)'],
      why: 'Kesişim, "hepsinde ortak" sorusunun doğrudan karşılığıdır. İlk sepetle başlayıp her adımda daraltmak, boş küme ile başlama hatasını (her şey boş çıkar) önler.' },
    { id: 'demet-kume-x5',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p>Ilgaz Bank üç ürünün müşteri numaralarını kümeler halinde veriyor. <code>urun_dagilimi(kart, mevduat, kredi)</code> fonksiyonunu yaz ve bir demet döndür: <code>(uc_urunlu, tek_urunlu)</code>. <code>uc_urunlu</code> üç kümede de olan müşteri <b>sayısı</b>; <code>tek_urunlu</code> yalnızca <b>tek bir</b> kümede olan müşterilerin sıralı listesi.</p>',
      start: 'def urun_dagilimi(kart, mevduat, kredi):\n    pass\n',
      sol: 'def urun_dagilimi(kart, mevduat, kredi):\n    uc = kart & mevduat & kredi\n    iki_ve_ustu = (kart & mevduat) | (kart & kredi) | (mevduat & kredi)\n    tek = (kart | mevduat | kredi) - iki_ve_ustu\n    return (len(uc), sorted(tek))\n',
      tests: 'k = {1, 2, 3, 4}\nm = {2, 3, 5}\nc = {3, 4, 6}\nr = urun_dagilimi(k, m, c)\nassert r[0] == 1, f"yalnız 3 numaralı müşteri üç üründe; gelen {r[0]}"\nassert r[1] == [1, 5, 6], f"tek üründe olanlar 1, 5, 6 olmalı; gelen {r[1]} (dikkat: k ^ m ^ c üç üründekileri de verir)"\nassert urun_dagilimi(set(), set(), set()) == (0, []), "boş kümeler"\nassert urun_dagilimi({1}, {1}, {1}) == (1, []), "hepsi üç üründeyse tek ürünlü yok"\n',
      hints: ['Üçünde de: kart & mevduat & kredi.', 'Tek üründe olanlar = birleşim - (en az iki üründe olanlar). En az ikide olanlar ikili kesişimlerin birleşimidir.'],
      why: 'Üç kümenin simetrik farkı (a ^ b ^ c), tek sayıda kümede olanları verir; yani üç kümede de olanları yanlışlıkla dahil eder. Birleşimden "en az iki kümede olanları" çıkarmak doğru tanımdır.' },
    { id: 'demet-kume-x6',
      t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      diff: 1,
      q: '<p>Hatayı bul ve düzelt. <code>iptal_et(aktif, iptaller)</code> fonksiyonu <code>aktif</code> sipariş kodu kümesinden <code>iptaller</code> listesindeki kodları <b>yerinde</b> çıkarmalı ve kalan sipariş sayısını döndürmeli. İptal listesinde zaten kapanmış (kümede olmayan) bir kod olunca program çöküyor.</p>',
      start: 'def iptal_et(aktif, iptaller):\n    for kod in iptaller:\n        aktif.remove(kod)\n    return len(aktif)\n',
      sol: 'def iptal_et(aktif, iptaller):\n    for kod in iptaller:\n        aktif.discard(kod)\n    return len(aktif)\n',
      tests: 'a = {"AM-1", "AM-2", "AM-3"}\nassert iptal_et(a, ["AM-2", "AM-9"]) == 2, "AM-9 kümede yok; hata vermeden geçmeli, 2 sipariş kalmalı"\nassert a == {"AM-1", "AM-3"}, "küme yerinde güncellenmeli"\nb = {"X"}\nassert iptal_et(b, []) == 1, "iptal yoksa sayı aynı kalır"\n',
      hints: ['remove, eleman yoksa KeyError verir.', 'Yoksa sessizce geçen metot: discard.'],
      why: 'discard, "varsa sil" anlamındadır; dış sistemden gelen ve tutarlı olduğu garanti edilmeyen listelerde remove yerine tercih edilir.' },
    { id: 'demet-kume-x7',
      t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      diff: 2,
      q: '<p>Hatayı bul ve düzelt. <code>tutar_guncelle(kayit, yeni_tutar)</code>, <code>(kod, sehir, tutar)</code> demetinin tutarını değiştirilmiş <b>yeni bir demet</b> döndürmeli. Kod <code>TypeError: can only concatenate tuple</code> hatası veriyor.</p>',
      start: 'def tutar_guncelle(kayit, yeni_tutar):\n    return kayit[:2] + (yeni_tutar)\n',
      sol: 'def tutar_guncelle(kayit, yeni_tutar):\n    return kayit[:2] + (yeni_tutar,)\n',
      tests: 'k = ("AM-5", "Bursa", 300.0)\nr = tutar_guncelle(k, 275.5)\nassert r == ("AM-5", "Bursa", 275.5), f"yeni demet bekleniyordu; gelen {r}"\nassert isinstance(r, tuple), "sonuç demet olmalı"\nassert k == ("AM-5", "Bursa", 300.0), "orijinal kayıt değişmemeli"\n',
      hints: ['(yeni_tutar) bir demet değil, yalnızca parantez içindeki sayıdır.', 'Tek elemanlı demet için virgül şart: (yeni_tutar,)'],
      why: 'Demeti yapan virgüldür. Virgül eklenince sağ taraf tek elemanlı demet olur ve iki demet birleştirilebilir.' },
    { id: 'demet-kume-x8',
      t: 'code',
      stage: 'Meydan okuma',
      diff: 3,
      q: '<p>Anadolu Market "birlikte alınan ürünler" analizi: <code>tekrar_eden_ikililer(sepetler)</code> fonksiyonunu yaz. Her sepet ürün adlarından oluşan bir listedir (aynı ürün bir sepette birden fazla geçebilir). Bir sepette birlikte bulunan iki <b>farklı</b> ürün bir ikili oluşturur. <b>En az iki farklı sepette</b> birlikte görülen ikilileri <code>(a, b)</code> demetleri olarak (<code>a &lt; b</code>), sıralı bir listede döndür. Sözlük kullanmadan, iki küme ile çöz.</p>',
      start: 'def tekrar_eden_ikililer(sepetler):\n    pass\n',
      sol: 'def tekrar_eden_ikililer(sepetler):\n    gorulen = set()\n    tekrar = set()\n    for sepet in sepetler:\n        urunler = sorted(set(sepet))\n        ikililer = set()\n        for i in range(len(urunler)):\n            for j in range(i + 1, len(urunler)):\n                ikililer.add((urunler[i], urunler[j]))\n        for ikili in ikililer:\n            if ikili in gorulen:\n                tekrar.add(ikili)\n            else:\n                gorulen.add(ikili)\n    return sorted(tekrar)\n',
      tests: 's = [["çay", "şeker", "ekmek"], ["şeker", "çay"], ["ekmek", "süt", "ekmek"], ["süt", "ekmek", "peynir"]]\nr = tekrar_eden_ikililer(s)\nassert r == [("ekmek", "süt"), ("çay", "şeker")], f"çay-şeker ve ekmek-süt ikişer sepette; gelen {r}"\nassert tekrar_eden_ikililer([["a", "b", "a", "b"]]) == [], "aynı sepetteki tekrarlar ikinci sepet sayılmaz"\nassert tekrar_eden_ikililer([["x"], ["x"]]) == [], "tek ürünlü sepette ikili yok"\nassert tekrar_eden_ikililer([]) == [], "boş liste"\nassert "dict" not in __source__ and "{}" not in __source__ and "Counter" not in __source__, "sözlük kullanmadan iki kümeyle çöz"\n',
      hints: ['Önce sepeti tekilleştir ve sırala: sorted(set(sepet)); böylece her ikili (küçük, büyük) sırasında oluşur.', 'İkili için iç içe döngü: j, i + 1\'den başlar.', 'İki küme: gorulen (en az bir kez) ve tekrar (en az iki kez). İkili gorulen\'deyse tekrar\'a ekle, değilse gorulen\'e.'],
      why: 'Sepeti önce tekilleştirmek aynı sepetteki tekrarların ikinci kez sayılmasını, sıralamak da ikililerin tek biçimde (a < b) yazılmasını sağlar. "Görülen/tekrar" iki küme kalıbı, "en az iki kez" sorusunu sayaç tutmadan çözer.' }
  ],
  faq: [
    { q: 'Demet listeden daha hızlı mı, sırf bu yüzden demet kullanmalı mıyım?', a: 'Demet biraz daha az bellek kullanır ve oluşturulması biraz daha hızlıdır ama fark çoğu programda önemsizdir. Seçimi anlama göre yap: sabit yapılı kayıt (enlem, boylam) demet, büyüyüp küçülen koleksiyon liste.' },
    { q: 'Kümeyi sıralı tutmanın bir yolu var mı?', a: 'Hayır; küme doğası gereği sırasızdır. Sıralı göstermek için <code>sorted(kume)</code>, ilk görülme sırasını korumak için "görülenler kümesi + liste" kalıbını ya da <code>list(dict.fromkeys(liste))</code> kullanırsın.' }
  ],
  mistakes: [
    { bad: 'aktif = aktif.update(yeni_kodlar)\nprint(len(aktif))', good: 'aktif.update(yeni_kodlar)\nprint(len(aktif))', why: 'update kümeyi yerinde değiştirir ve None döndürür; sonucu aynı ada atarsan kümeni kaybedersin ve len(None) TypeError verir.' },
    { bad: 'for kod in iptaller:\n    aktif.remove(kod)', good: 'for kod in iptaller:\n    aktif.discard(kod)', why: 'remove eleman yoksa KeyError verir; dış kaynaktan gelen ve kümede olduğu garanti olmayan elemanlar için discard kullan.' }
  ]
}
);
})(window);
