/* Kesit Python v2 — uzantı: donguler */
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
{ id: 'donguler',
  min: 35,
  html: `
<h2>range'i tam tanı</h2>
<p><code>range</code> bir liste değil, sayıları <b>istendikçe</b> üreten hafif bir nesnedir: <code>range(1_000_000)</code> bellekte bir milyon sayı tutmaz. Üç parametresi vardır: başlangıç (dahil), bitiş (hariç) ve adım. Adım negatif olursa geriye sayar; bu durumda başlangıç bitişten büyük olmalıdır, yoksa hiç tur dönmez.</p>
<pre class="py">print(list(range(5)))            # 0..4
print(list(range(2, 11, 4)))     # 2, 6, 10
print(list(range(10, 0, -3)))    # geri sayım: 10, 7, 4, 1
print(list(range(0, 10, -1)))    # boş: yön yanlış
r = range(0, 100, 5)
print(len(r), 35 in r, r[-1])    # len, in ve indeks de çalışır

aylar = ["Oca", "Şub", "Mar", "Nis"]
for ay in reversed(aylar):       # listeyi kopyalamadan tersten gez
    print(ay, end=" ")
print()</pre>
<div class="tip"><b>Sayılarda alt çizgi</b><code>1_000_000</code> yazımı Python 3.6'dan beri geçerlidir ve <code>1000000</code> ile aynıdır; büyük sayıları okunur kılar. Tutar sabitlerinde (<code>LIMIT = 50_000</code>) kullanman tavsiye edilir.</div>

<h2>enumerate ve zip'in ayrıntıları</h2>
<p><code>enumerate(liste, start=1)</code> sıra numarasını 1'den başlatır; raporlarda "1. satır" demek için idealdir. <code>zip</code> ise listelerden <b>en kısası</b> bitince durur ve uzun listedeki fazla elemanları <b>sessizce</b> atar. Veri hatasını gizleyen bu davranış yerine, Python 3.10'dan beri <code>strict=True</code> ile uzunluklar farklıysa hata alabilirsin.</p>
<pre class="py">urunler = ["çay", "kahve", "şeker"]
fiyatlar = [120, 340]                    # bir fiyat eksik!
print(list(zip(urunler, fiyatlar)))      # şeker sessizce kayboldu
try:
    for u, f in zip(urunler, fiyatlar, strict=True):
        print(u, f)
except ValueError as h:
    print("Veri hatası:", h)

for no, (u, f) in enumerate(zip(urunler, [120, 340, 45]), start=1):
    print(f"{no}. {u:&lt;6} {f:&gt;4} TL")</pre>
<p>Çıktıya dikkat et: <code>strict=True</code> farkı ancak kısa liste bittiği anda anlar; o ana kadarki turlar (çay ve kahve) zaten çalışmıştır. Veritabanına yazma gibi geri alınması zor işlemlerden önce uzunlukları baştan karşılaştırmak (<code>if len(a) != len(b): ...</code>) daha güvenlidir.</p>
<p>Dikkat: <code>zip</code> ve <code>enumerate</code> de <code>range</code> gibi tembeldir ama bir farkla: <b>bir kez</b> tüketilirler. <code>z = zip(a, b)</code> nesnesini bir kez gezdikten sonra ikinci gezişte boş gelir. Nedenini Yineleyiciler ve üreteçler dersinde göreceksin; şimdilik zip'i ya doğrudan döngü başlığında kullan ya da <code>list(zip(...))</code> ile listeye çevir.</p>

<h2>İç içe döngüden çıkmak</h2>
<p><code>break</code> yalnızca <b>içinde bulunduğu</b> döngüyü kırar. İç döngüde aradığını bulduğunda dıştaki döngüyü de durdurmak istiyorsan üç yolun var. En temizi aramayı bir fonksiyona koyup <code>return</code> etmektir; return tüm döngülerden birden çıkar.</p>
<div class="tbl-wrap"><table>
<tr><th>Yöntem</th><th>Nasıl?</th><th>Ne zaman?</th></tr>
<tr><td>Fonksiyon + return</td><td>Bulunca <code>return sonuc</code></td><td>Hemen her zaman en okunaklısı</td></tr>
<tr><td>Bayrak değişkeni</td><td><code>bulundu = True</code>, iç break, dışta <code>if bulundu: break</code></td><td>Fonksiyona ayıramıyorsan</td></tr>
<tr><td>for-else</td><td>İç döngü break etmezse <code>else: continue</code>, sonra dışta <code>break</code></td><td>Kısa kodlarda; okuması zordur</td></tr>
</table></div>
<pre class="py">raflar = [["çay", "kahve"], ["şeker", "tuz", "un"], ["su"]]

def raf_bul(raflar, aranan):
    for i, raf in enumerate(raflar):
        for j, urun in enumerate(raf):
            if urun == aranan:
                return (i, j)          # iki döngüden birden çıkar
    return None

print(raf_bul(raflar, "tuz"), raf_bul(raflar, "pirinç"))

bulundu = None
for i, raf in enumerate(raflar):
    for j, urun in enumerate(raf):
        if urun == "tuz":
            bulundu = (i, j)
            break                       # yalnız iç döngü
    if bulundu:
        break                           # dış döngü
print(bulundu)</pre>

<h2>while True ve sınırlı deneme</h2>
<p>Kaç tur süreceği bilinmeyen ama "şu olunca dur" dediğin döngülerde <code>while True</code> + <code>break</code> kalıbı okunaklıdır: menü döngüleri, kuyruktan iş çekme, kullanıcı doğru girene kadar sorma. Gerçek sistemlerde her zaman bir <b>üst sınır</b> koyarsın: ATM üç yanlış PIN'de kartı bloke eder, bir API isteği beş denemeden sonra vazgeçer.</p>
<pre class="py">denemeler = ["1111", "2580", "1234"]     # kullanıcının sırayla girdikleri
dogru_pin = "1234"
hak = 3
deneme = 0
while True:
    if deneme == hak or deneme == len(denemeler):
        print("Kart bloke / deneme bitti")
        break
    girilen = denemeler[deneme]
    deneme += 1
    if girilen == dogru_pin:
        print(f"Giriş başarılı ({deneme}. deneme)")
        break
    print("Hatalı PIN, kalan hak:", hak - deneme)</pre>

<h2>Döngüde metin biriktirme: join</h2>
<p>Döngüde <code>metin += parca</code> yazmak küçük verilerde sorun değildir ama her adımda yeni bir metin oluşturur. Parçaları listede toplayıp sonunda <code>"ayraç".join(liste)</code> demek hem daha hızlı hem de "son elemandan sonra ayraç olmasın" derdini ortadan kaldırır. Kullanmadığın döngü değişkenine <code>_</code> adını vermek de yaygın bir alışkanlıktır.</p>
<pre class="py">sehirler = ["İzmir", "Ankara", "Bursa"]
parcalar = []
for s in sehirler:
    parcalar.append(s.upper())
print(", ".join(parcalar))

for _ in range(3):
    print("-" * 10)

satirlar = []
for no, s in enumerate(sehirler, start=1):
    satirlar.append(f"{no};{s}")
print("\\n".join(["no;sehir"] + satirlar))</pre>
<p>Son satırdaki <code>\\n</code> satır sonu karakteridir; <code>join</code> ile CSV benzeri bir metni tek seferde oluşturduk. Döngülerin yaygın kalıplarını (sayaç, en iyi değer, komşu karşılaştırma, frekans) bir sonraki derste, Döngü kalıpları dersinde sistematik olarak çalışacaksın.</p>
<div class="note"><b>Gerçek işte</b>Üretimdeki döngülerin en sık iki hatası: "bir eksik/bir fazla" (off-by-one) ve sessiz veri kaybı. Birincisi <code>range(1, n)</code> yazıp n'inci elemanı atlamaktır; ikincisi farklı uzunluktaki iki listeyi <code>zip</code>'leyip fazlalığı fark etmemektir. Ekipler bu yüzden indeksle gezmek yerine doğrudan elemanı gezer (<code>for x in liste</code>), paralel listeleri <code>strict=True</code> ile birleştirir ve her yeniden deneme döngüsüne bir üst sınır koyar.</div>
`,
  ex: [
    { t: 'mc',
      stage: 'Isınma',
      q: '<code>list(zip([1, 2, 3], ["a", "b"]))</code> ifadesinin sonucu nedir?',
      o: ['ValueError: uzunluklar farklı', "[(1, 'a'), (2, 'b')]", "[(1, 'a'), (2, 'b'), (3, None)]", "[(1, 'a'), (2, 'b'), 3]"],
      a: 1,
      why: 'zip en kısa liste bitince durur ve fazla elemanları sessizce atar. Hata almak istersen zip(..., strict=True) kullanırsın (Python 3.10+).' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Negatif adım: bu kod ne yazdırır?',
      code: 'for i in range(10, 0, -3):\n    print(i, end=" ")\n',
      o: ['10 7 4 1', '10 7 4 1 0', '10 7 4', '1 4 7 10'],
      a: 0,
      why: '10\'dan başlar, 3\'er azalır: 10, 7, 4, 1. Bir sonraki değer -2 olurdu ama bitiş (0) hariç ve geçildiği için durur.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'İç içe döngüde break: bu kod ne yazdırır?',
      code: 'for i in range(3):\n    for j in range(3):\n        if j == 1:\n            break\n        print(i, j)\n',
      o: ['0 0', '0 0\n1 0\n2 0', '0 0\n0 1\n1 0\n1 1\n2 0\n2 1', '0 0\n1 0'],
      a: 1,
      why: 'break yalnız iç döngüyü kırar. Her i için iç döngü j = 0\'ı yazdırır, j = 1\'de kırılır; dış döngü kaldığı yerden devam eder.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'zip bir kez tüketilir: bu kod ne yazdırır?',
      code: 'z = zip([1, 2], ["a", "b"])\nprint(list(z))\nprint(list(z))\n',
      o: ["[(1, 'a'), (2, 'b')]\n[(1, 'a'), (2, 'b')]", "[(1, 'a'), (2, 'b')]\n[]", "[(1, 'a'), (2, 'b')]\nNone", 'İkinci satırda StopIteration hatası'],
      a: 1,
      why: 'zip nesnesi elemanları bir kez üretir; ilk list() hepsini tüketir, ikinci gezişte üretilecek eleman kalmamıştır ve boş liste döner.' },
    { t: 'order',
      stage: 'Kodu oku',
      q: '<p>Komut listesini işleyen fonksiyonun satırlarını sırala: "ekle" sepeti 1 artırır, "sil" 1 azaltır, "çık" görülünce işlem durur (çık sayılmaz).</p>',
      lines: ['def calistir(komutlar):', '    sepet = 0', '    for k in komutlar:', '        if k == "çık":', '            break', '        sepet += 1 if k == "ekle" else -1', '    return sepet', 'print(calistir(["ekle", "ekle", "sil", "ekle", "çık", "ekle"]))'],
      expect: '2\n',
      hint: '"çık" kontrolü sepeti güncellemeden ÖNCE yapılmalı; yoksa "çık" da -1 sayılır.',
      why: 'Durma koşulunu güncellemeden önce kontrol etmek, durma komutunun kendisinin işlenmesini engeller. return döngünün dışında olmalı ki tüm komutlar işlensin.' },
    { id: 'donguler-x1',
      t: 'code',
      stage: 'Rehberli',
      diff: 1,
      q: '<p><code>geri_sayim(n)</code> fonksiyonunu yaz: kampanya başlangıcına kalan günler için metin listesi döndürsün. <code>n</code>\'den 1\'e kadar her gün için <code>"N gün kaldı"</code>, en sonda <code>"Kampanya başladı!"</code>. Örnek: <code>geri_sayim(3)</code> → <code>["3 gün kaldı", "2 gün kaldı", "1 gün kaldı", "Kampanya başladı!"]</code>. Negatif adımlı <code>range</code> kullan.</p>',
      guide: ['Boş bir sonuç listesi oluştur.', 'range(n, 0, -1) ile n\'den 1\'e kadar gez (bitiş hariç olduğu için 0 yazılır).', 'Her gün için f"{g} gün kaldı" ekle.', 'Döngüden sonra "Kampanya başladı!" ekle ve listeyi döndür.'],
      example: 'for kat in range(5, 0, -2):\n    print(f"{kat}. kat")\nprint("Zemin")\n',
      start: 'def geri_sayim(n):\n    sonuc = []\n    # TODO: n\'den 1\'e kadar geri say\n    sonuc.append("Kampanya başladı!")\n    return sonuc\n',
      sol: 'def geri_sayim(n):\n    sonuc = []\n    for g in range(n, 0, -1):\n        sonuc.append(f"{g} gün kaldı")\n    sonuc.append("Kampanya başladı!")\n    return sonuc\n',
      tests: 'assert geri_sayim(3) == ["3 gün kaldı", "2 gün kaldı", "1 gün kaldı", "Kampanya başladı!"], f"gelen {geri_sayim(3)}"\nassert geri_sayim(0) == ["Kampanya başladı!"], "0 gün kaldıysa yalnız başladı mesajı"\nassert len(geri_sayim(30)) == 31, "30 gün + başlangıç mesajı"\n',
      hints: ['range(başlangıç, bitiş, adım): bitiş hariç.', 'range(n, 0, -1) n, n-1, ..., 1 üretir.'],
      why: 'Negatif adımda bitiş yine hariçtir; 1\'i dahil etmek için bitişe 0 yazılır. n = 0 iken range boştur ve yalnız son mesaj kalır.' },
    { id: 'donguler-x2',
      t: 'code',
      stage: 'Rehberli',
      diff: 2,
      q: '<p><code>fiyat_listesi(urunler, fiyatlar)</code> fonksiyonunu yaz. Her ürün için <code>"1. çay: 120 TL"</code> biçiminde numaralı satırlardan oluşan liste döndürsün (numara 1\'den başlar). İki listenin uzunluğu farklıysa sessizce kırpmasın, <code>ValueError</code> versin: <code>zip(..., strict=True)</code> kullan.</p>',
      guide: ['Boş sonuç listesi oluştur.', 'zip(urunler, fiyatlar, strict=True) çiftlerini enumerate(..., start=1) ile numaralandır.', 'Döngü başlığında açma: for no, (urun, fiyat) in ...', 'Her satırı f-string ile ekle ve listeyi döndür.'],
      example: 'adlar = ["Ayşe", "Can"]\nbirimler = ["İK", "IT"]\nfor no, (ad, b) in enumerate(zip(adlar, birimler, strict=True), start=1):\n    print(f"{no}) {ad} - {b}")\n',
      start: 'def fiyat_listesi(urunler, fiyatlar):\n    satirlar = []\n    for urun, fiyat in zip(urunler, fiyatlar):\n        # TODO: numara ekle (enumerate, start=1) ve strict=True kullan\n        satirlar.append(f"{urun}: {fiyat} TL")\n    return satirlar\n',
      sol: 'def fiyat_listesi(urunler, fiyatlar):\n    satirlar = []\n    for no, (urun, fiyat) in enumerate(zip(urunler, fiyatlar, strict=True), start=1):\n        satirlar.append(f"{no}. {urun}: {fiyat} TL")\n    return satirlar\n',
      tests: 'assert fiyat_listesi(["çay", "kahve"], [120, 340]) == ["1. çay: 120 TL", "2. kahve: 340 TL"], f"gelen {fiyat_listesi([\'çay\', \'kahve\'], [120, 340])}"\nassert fiyat_listesi([], []) == [], "boş listeler"\ntry:\n    fiyat_listesi(["çay", "kahve", "şeker"], [120, 340])\n    assert False, "uzunluklar farklıyken ValueError bekleniyordu (strict=True)"\nexcept ValueError:\n    pass\n',
      hints: ['enumerate(zip(...), start=1) her elemana (no, (urun, fiyat)) verir.', 'zip(urunler, fiyatlar, strict=True)'],
      why: 'strict=True eksik ya da fazla veriyi sessizce atmak yerine hatayı görünür kılar; enumerate(start=1) numarayı insan dostu yapar.' },
    { id: 'donguler-x3',
      t: 'code',
      stage: 'Rehberli',
      diff: 2,
      q: '<p>Sinema/etkinlik salonu: <code>yan_yana_bos(salon, kisi)</code> fonksiyonunu yaz. <code>salon</code> satırlardan oluşan bir listedir; her satır koltukların listesidir (<code>0</code> boş, <code>1</code> dolu). Arka arkaya en az <code>kisi</code> boş koltuk bulunan <b>ilk</b> yeri <code>(satir, ilk_koltuk)</code> olarak döndür (indeksler 0\'dan). Yoksa <code>None</code>. Bulduğun anda iki döngüden birden çık.</p>',
      guide: ['Aramayı fonksiyon içinde yap; bulunca return iki döngüden birden çıkar.', 'Her satır için ardışık boş sayacı tut; satır başında sıfırla.', 'Koltuk boşsa sayacı artır, doluysa sıfırla.', 'Sayaç kisi\'ye ulaştığında başlangıç koltuğu j - kisi + 1\'dir; (i, başlangıç) döndür.', 'Döngüler bitince None döndür.'],
      example: 'gunler = [5, 0, 0, 0, 3]\nseri = 0\nfor i, satis in enumerate(gunler):\n    seri = seri + 1 if satis == 0 else 0\n    if seri == 2:\n        print("2 gün satışsız, başlangıç:", i - 1)\n        break\n',
      start: 'def yan_yana_bos(salon, kisi):\n    for i, satir in enumerate(salon):\n        seri = 0\n        for j, koltuk in enumerate(satir):\n            # TODO: seri sayacını güncelle, yeterliyse konumu döndür\n            pass\n    return None\n',
      sol: 'def yan_yana_bos(salon, kisi):\n    for i, satir in enumerate(salon):\n        seri = 0\n        for j, koltuk in enumerate(satir):\n            if koltuk == 0:\n                seri += 1\n            else:\n                seri = 0\n            if seri == kisi:\n                return (i, j - kisi + 1)\n    return None\n',
      tests: 's = [[1, 0, 1, 0, 0], [0, 0, 0, 1, 0], [0, 0, 0, 0, 0]]\nassert yan_yana_bos(s, 2) == (0, 3), "ilk satırda 3-4 numaralı koltuklar boş"\nassert yan_yana_bos(s, 3) == (1, 0), "3 kişi için ilk yer 1. satırın başı"\nassert yan_yana_bos(s, 4) == (2, 0), "4 kişi için yalnız son satır"\nassert yan_yana_bos(s, 6) is None, "6 boş koltuk yan yana yok"\nassert yan_yana_bos([[0, 0], [0, 0]], 3) is None, "satır sonu bir sonraki satıra bağlanmaz"\n',
      hints: ['Seri sayacı her satırın başında sıfırlanmalı; satırlar arası devam etmez.', 'seri == kisi olduğunda son koltuk j, ilk koltuk j - kisi + 1.', 'Fonksiyon içinde return iki döngüyü birden bitirir.'],
      why: 'Seri sayacı ardışık boşları sayar ve dolu koltukta sıfırlanır. Satır başında sıfırlamak, bir satırın sonu ile sonrakinin başını yanlışlıkla birleştirmeyi önler; return iç içe döngüden en temiz çıkıştır.' },
    { id: 'donguler-x4',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p>Ilgaz Bank taksit planı: <code>taksit_plani(tutar, ay)</code> fonksiyonunu yaz. Her taksit <code>round(tutar / ay, 2)</code> olsun; ama yuvarlama farkı kaybolmasın diye <b>son taksit</b> kalan tutarı alsın (<code>tutar - ilk taksitlerin toplamı</code>, 2 ondalığa yuvarlanmış). <code>ay</code> taksitlik liste döndür. Taksitlerin toplamı (yuvarlanmış) tutara eşit olmalı.</p>',
      start: 'def taksit_plani(tutar, ay):\n    pass\n',
      sol: 'def taksit_plani(tutar, ay):\n    taksit = round(tutar / ay, 2)\n    plan = []\n    for _ in range(ay - 1):\n        plan.append(taksit)\n    plan.append(round(tutar - taksit * (ay - 1), 2))\n    return plan\n',
      tests: 'p = taksit_plani(1000, 3)\nassert p == [333.33, 333.33, 333.34], f"son taksit 1 kuruş farkı almalı; gelen {p}"\nassert round(sum(p), 2) == 1000, "taksitlerin toplamı tutara eşit olmalı"\nassert taksit_plani(1200, 12) == [100.0] * 12, "tam bölünen tutar"\nassert taksit_plani(99.99, 1) == [99.99], "tek taksit"\nq = taksit_plani(100, 6)\nassert len(q) == 6 and round(sum(q), 2) == 100, f"6 taksit, toplam 100; gelen {q}"\n',
      hints: ['İlk ay - 1 taksit aynı; kullanılmayan döngü değişkeni için _ kullan.', 'Son taksit: round(tutar - taksit * (ay - 1), 2)'],
      why: 'Eşit taksitleri yuvarlamak kuruş farkları doğurur; farkı son taksite yüklemek toplamın tutara birebir eşit olmasını sağlar. Bankacılıkta bu kural standarttır.' },
    { id: 'donguler-x5',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p>ATM PIN kontrolü: <code>pin_dene(dogru_pin, denemeler, hak=3)</code> fonksiyonunu <code>while</code> ile yaz. <code>denemeler</code>, kullanıcının sırayla girdiği PIN\'lerin listesidir. Sonuç olarak bir demet döndür:</p><ul><li>Doğru PIN girildiyse <code>("başarılı", kacinci_deneme)</code> (1\'den başlar)</li><li><code>hak</code> kadar yanlış girildiyse <code>("bloke", hak)</code></li><li>Hak bitmeden deneme listesi bittiyse <code>("yarıda kaldı", yapilan_deneme)</code></li></ul>',
      start: 'def pin_dene(dogru_pin, denemeler, hak=3):\n    pass\n',
      sol: 'def pin_dene(dogru_pin, denemeler, hak=3):\n    deneme = 0\n    while deneme < hak:\n        if deneme == len(denemeler):\n            return ("yarıda kaldı", deneme)\n        girilen = denemeler[deneme]\n        deneme += 1\n        if girilen == dogru_pin:\n            return ("başarılı", deneme)\n    return ("bloke", hak)\n',
      tests: 'assert pin_dene("1234", ["1111", "1234"]) == ("başarılı", 2), "ikinci denemede doğru"\nassert pin_dene("1234", ["0", "1", "2", "1234"]) == ("bloke", 3), "3 yanlıştan sonra 4. deneme hiç yapılmaz"\nassert pin_dene("1234", ["0"]) == ("yarıda kaldı", 1), "tek yanlış deneme, sonra kullanıcı vazgeçti"\nassert pin_dene("1234", []) == ("yarıda kaldı", 0), "hiç deneme yok"\nassert pin_dene("9", ["1", "9"], hak=1) == ("bloke", 1), "hak=1 iken ilk yanlışta bloke"\nassert "while" in __source__, "while kullan"\n',
      hints: ['Döngü koşulu: deneme < hak. Her turda önce listenin bitip bitmediğine bak.', 'Doğru PIN\'de hemen return; döngü hak bitince biterse bloke.'],
      why: 'Üst sınırlı while kalıbı: koşul hak sayısını, içerideki return ise başarıyı ve veri bitişini yönetir. Hak dolunca döngü kendiliğinden biter.' },
    { id: 'donguler-x6',
      t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      diff: 1,
      q: '<p>Hatayı bul ve düzelt. <code>ilk_n_gun(cirolar, n)</code> listedeki <b>ilk n günün</b> cirolarının toplamını döndürmeli. Sonuç hep eksik çıkıyor.</p>',
      start: 'def ilk_n_gun(cirolar, n):\n    toplam = 0\n    for i in range(1, n):\n        toplam += cirolar[i]\n    return toplam\n',
      sol: 'def ilk_n_gun(cirolar, n):\n    toplam = 0\n    for i in range(n):\n        toplam += cirolar[i]\n    return toplam\n',
      tests: 'c = [100, 200, 300, 400]\nassert ilk_n_gun(c, 2) == 300, f"ilk iki gün 100 + 200 = 300; gelen {ilk_n_gun(c, 2)}"\nassert ilk_n_gun(c, 4) == 1000, "dört günün toplamı 1000"\nassert ilk_n_gun(c, 0) == 0, "0 gün 0"\n',
      hints: ['Liste indeksleri 0\'dan başlar; range(1, n) ilk günü atlar ve n-1 gün sayar.', 'İlk n indeks: range(n) → 0, 1, ..., n-1'],
      why: 'Off-by-one hatası: range(1, n) hem 0. indeksi atlar hem de yalnız n-1 eleman üretir. range(n) tam olarak ilk n indeksi verir (daha da iyisi: sum(cirolar[:n])).' },
    { id: 'donguler-x7',
      t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      diff: 2,
      q: '<p>Hatayı bul ve düzelt. <code>hepsi_onayli(siparisler)</code>, tüm siparişlerin <code>"onay"</code> alanı True ise True, en az biri False ise False döndürmeli; boş listede True. Kod yalnızca ilk siparişe bakıp karar veriyor.</p>',
      start: 'def hepsi_onayli(siparisler):\n    for s in siparisler:\n        if s["onay"]:\n            return True\n        else:\n            return False\n    return True\n',
      sol: 'def hepsi_onayli(siparisler):\n    for s in siparisler:\n        if not s["onay"]:\n            return False\n    return True\n',
      tests: 'assert hepsi_onayli([{"onay": True}, {"onay": False}]) is False, "ikinci sipariş onaysız: False olmalı"\nassert hepsi_onayli([{"onay": True}, {"onay": True}]) is True, "hepsi onaylı"\nassert hepsi_onayli([{"onay": False}, {"onay": True}]) is False, "ilk sipariş onaysız"\nassert hepsi_onayli([]) is True, "boş liste True"\n',
      hints: ['"Hepsi" sorusunda True kararı ancak tüm elemanlar görüldükten sonra verilebilir.', 'Döngü içinde yalnız olumsuz durumda erken çık; True\'yu döngüden sonra döndür.'],
      why: 'Doğrulama kalıbı: tek bir aykırı eleman sonucu belirler (erken False), ama olumlu sonuç ancak döngü bitince kesinleşir. Kısaca: all(s["onay"] for s in siparisler).' },
    { id: 'donguler-x8',
      t: 'code',
      stage: 'Meydan okuma',
      diff: 3,
      q: '<p>Mağaza vardiya rotasyonu: <code>vardiya_plani(personel, gun_sayisi, gunluk_kisi, izinler)</code> fonksiyonunu yaz. Personel listesi sırayla ve <b>döngüsel</b> olarak (sona gelince başa dönerek) günlere atanır; sıra göstergesi günler arasında kaldığı yerden devam eder. <code>izinler</code>, gün indeksi → o gün izinli kişiler kümesi sözlüğüdür; izinli kişi o gün atlanır (sırası yanar, gösterge ilerler). Her gün için atanan kişilerin listesini içeren bir liste döndür. Bir günde aynı kişi iki kez atanmamalı: bir gün için personel listesini bir tam turdan fazla dolaşma; yeterli kişi bulunamazsa <code>ValueError</code> fırlat.</p><p>Örnek: personel <code>["A", "B", "C", "D", "E"]</code>, 3 gün, günde 2 kişi, izinler <code>{1: {"C"}}</code> → <code>[["A", "B"], ["D", "E"], ["A", "B"]]</code>.</p>',
      start: 'def vardiya_plani(personel, gun_sayisi, gunluk_kisi, izinler):\n    pass\n',
      sol: 'def vardiya_plani(personel, gun_sayisi, gunluk_kisi, izinler):\n    n = len(personel)\n    gosterge = 0\n    plan = []\n    for gun in range(gun_sayisi):\n        izinli = izinler.get(gun, set())\n        secilen = []\n        bakilan = 0\n        while len(secilen) < gunluk_kisi and bakilan < n:\n            kisi = personel[gosterge % n]\n            gosterge += 1\n            bakilan += 1\n            if kisi not in izinli:\n                secilen.append(kisi)\n        if len(secilen) < gunluk_kisi:\n            raise ValueError(f"{gun}. gün için yeterli personel yok")\n        plan.append(secilen)\n    return plan\n',
      tests: 'p = ["A", "B", "C", "D", "E"]\nr = vardiya_plani(p, 3, 2, {1: {"C"}})\nassert r == [["A", "B"], ["D", "E"], ["A", "B"]], f"gelen {r}"\nassert vardiya_plani(p, 3, 2, {}) == [["A", "B"], ["C", "D"], ["E", "A"]], "izin yoksa döngüsel sıra: E\'den sonra A"\nassert vardiya_plani(p, 1, 5, {}) == [["A", "B", "C", "D", "E"]], "herkes aynı gün"\nassert vardiya_plani(p, 0, 2, {}) == [], "0 gün"\nfor izin, k in [({0: {"A", "B", "C", "D"}}, 2), ({}, 6)]:\n    try:\n        vardiya_plani(p, 1, k, izin)\n        assert False, "yeterli kişi yokken ValueError bekleniyordu (aynı kişi iki kez atanmamalı)"\n    except ValueError:\n        pass\n',
      hints: ['Döngüsel indeks: personel[gosterge % n]; gösterge günler arasında sıfırlanmaz.', 'Bir gün için en fazla n kişiye bak (bakilan < n); böylece aynı kişiye iki kez gelmezsin.', 'while koşulu: yeterli kişi seçilmedi VE henüz bir tur dönülmedi.'],
      why: 'Modülo (%) listeyi halka gibi dolaşmayı sağlar. Gün başına bakılan kişi sayısını n ile sınırlamak hem sonsuz döngüyü hem aynı kişinin iki kez atanmasını önler; sınır aşılırsa net bir hata vermek sessiz eksik plandan iyidir.' }
  ],
  faq: [
    { q: 'range(len(liste)) mi, enumerate mi?', a: 'Hem indeks hem eleman gerekiyorsa <code>enumerate</code>; yalnız eleman gerekiyorsa doğrudan <code>for x in liste</code>. <code>range(len(...))</code> ancak komşu elemanlara (<code>liste[i + 1]</code>) erişirken ya da listeyi indeksle değiştirirken gerekir.' },
    { q: 'zip\'te uzun listedeki fazlalığı atmak yerine doldurmak istersem?', a: '<code>itertools.zip_longest(a, b, fillvalue=0)</code> kısa listeyi verdiğin değerle doldurur. itertools modülünü Collections ve itertools dersinde ayrıntılı göreceksin.' }
  ],
  mistakes: [
    { bad: 'for i in range(1, n):\n    toplam += liste[i]', good: 'for i in range(n):\n    toplam += liste[i]', why: 'range(1, n) ilk elemanı atlar ve n-1 tur döner; ilk n eleman için range(n) (ya da liste[:n]) kullan.' },
    { bad: 'for s in siparisler:\n    if s["onay"]:\n        return True\n    else:\n        return False', good: 'for s in siparisler:\n    if not s["onay"]:\n        return False\nreturn True', why: 'Döngünün ilk turunda iki yönde de return etmek döngüyü tek tura indirir; "hepsi" kararı ancak döngü bitince verilir.' }
  ]
}
);
})(window);
