/* PythonPatika — uzantı: fonksiyonel (Derinleş) */
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
  { id: 'fonksiyonel',
    min: 45,
    html: `<h2>Derinleş: fonksiyonlarla çalışan araç kutusu</h2>
<p>lambda, sorted/key, map/filter/reduce, any/all, closure ve partial'ı gördün. Bu bölüm, iş kodunda bunları daha temiz ve doğru kullanmanı sağlayan araçları ekliyor: <code>operator</code> modülü, kararlı sıralamayla karışık yönlü sıralama, Türkçe alfabetik sıralama, <code>min</code>/<code>max</code>'ın <code>default</code> parametresi, fonksiyon tabloları (dispatch) ve fonksiyon birleştirme (composition). Closure'ların kapsam ayrıntıları için <b>Kapsam ve kapanışlar</b> dersine bakabilirsin.</p>

<h3>operator modülü: lambda yazmadan anahtar</h3>
<p><code>key=lambda k: k["tutar"]</code> o kadar sık yazılır ki standart kütüphane bunun hazırını sunar. <code>itemgetter</code> sözlük anahtarı ya da indeksle, <code>attrgetter</code> nesne özniteliğiyle, <code>methodcaller</code> metot çağrısıyla değer çeken fonksiyonlar üretir. Birden çok alan verirsen demet döndürür; çoklu sıralama anahtarı hazır olur. Ayrıca biraz daha hızlıdır ve adı ne yaptığını söyler.</p>
<div class="tbl-wrap"><table>
<tr><th>lambda ile</th><th>operator ile</th></tr>
<tr><td><code>lambda k: k["tutar"]</code></td><td><code>itemgetter("tutar")</code></td></tr>
<tr><td><code>lambda k: (k["sehir"], k["tutar"])</code></td><td><code>itemgetter("sehir", "tutar")</code></td></tr>
<tr><td><code>lambda d: d[1]</code></td><td><code>itemgetter(1)</code></td></tr>
<tr><td><code>lambda m: m.bakiye</code></td><td><code>attrgetter("bakiye")</code></td></tr>
<tr><td><code>lambda s: s.strip()</code></td><td><code>methodcaller("strip")</code></td></tr>
<tr><td><code>lambda a, b: a * b</code></td><td><code>operator.mul</code></td></tr>
</table></div>
<pre class="py">from operator import itemgetter, mul
from functools import reduce

siparisler = [
    {"id": 3, "sehir": "İzmir", "tutar": 820.0},
    {"id": 1, "sehir": "Ankara", "tutar": 1830.0},
    {"id": 2, "sehir": "Ankara", "tutar": 450.0},
]
for s in sorted(siparisler, key=itemgetter("sehir", "tutar")):
    print(s["id"], s["sehir"], s["tutar"])

kac = itemgetter("id", "tutar")
print([kac(s) for s in siparisler])
print("Faktöriyel 5:", reduce(mul, range(1, 6), 1))
</pre>

<h3>Kararlı sıralama: karışık yönler, metinlerde bile</h3>
<p>Sayısal alanda azalan sıralama için eksi işareti hilesini (<code>-k["tutar"]</code>) gördün. Ama metni "eksi" yapamazsın: "şehre göre artan, aynı şehirde <b>ada göre azalan</b>" isteğinde ne yaparsın? Python'un sıralaması <b>kararlıdır</b> (stable): eşit anahtarlı elemanların önceki sırası korunur. Bu yüzden önce <b>ikincil</b> ölçüte göre, sonra <b>birincil</b> ölçüte göre sıralarsın; her geçiş kendi yönünü alır.</p>
<pre class="py">from operator import itemgetter

calisanlar = [("Satış", "Ayşe"), ("BT", "Can"), ("Satış", "Mehmet"), ("BT", "Ali"), ("Satış", "Zeynep")]

adim1 = sorted(calisanlar, key=itemgetter(1), reverse=True)   # ikincil: ad, azalan
adim2 = sorted(adim1, key=itemgetter(0))                      # birincil: departman, artan
for dep, ad in adim2:
    print(dep, ad)
</pre>
<div class="tip"><b>Sıra ters!</b>Çok geçişli sıralamada en önemsiz ölçütten başlarsın, en önemli ölçütü <b>en son</b> uygularsın. Son geçiş "kazanır"; önceki geçişler yalnızca eşitlikleri çözer.</div>

<h3>Türkçe alfabetik sıralama</h3>
<p><code>sorted(["Çorum", "Bursa", "Ağrı", "Iğdır", "İzmir"])</code> Unicode kod sırasına göre sıralar: Ç, I, İ, Ş, Ğ gibi harfler Latin harflerinin <b>sonuna</b> düşer. Türkçe sıralama için kendi anahtarını yazarsın: her harfi Türk alfabesindeki sıra numarasına çeviren bir fonksiyon. (Kendi bilgisayarında <code>locale.strxfrm</code> ile işletim sisteminin Türkçe ayarı da kullanılabilir ama sunucuda o ayar kurulu olmayabilir.)</p>
<pre class="py">ALFABE = "abcçdefgğhıijklmnoöprsştuüvyz"
SIRA = {h: i for i, h in enumerate(ALFABE)}

def tr_kucuk(metin):
    return metin.replace("I", "ı").replace("İ", "i").lower()

def tr_anahtar(metin):
    return [SIRA.get(h, 100 + ord(h)) for h in tr_kucuk(metin)]

iller = ["Çorum", "Bursa", "Şanlıurfa", "Iğdır", "İzmir", "Ağrı", "Uşak", "Ordu", "Ödemiş"]
print("Varsayılan:", sorted(iller))
print("Türkçe    :", sorted(iller, key=tr_anahtar))
</pre>

<h3>min, max: key ve default</h3>
<p><code>max(siparisler, key=itemgetter("tutar"))</code> en büyük tutarlı <b>siparişi</b> (sözlüğü) döndürür, tutarın kendisini değil. Boş veride ValueError fırlatır; <code>default=</code> parametresi bunu önler. Eşitlikte ilk karşılaşılan eleman döner.</p>
<pre class="py">from operator import itemgetter

depolar = [{"ad": "Gebze", "km": 42, "stok": 0}, {"ad": "Tuzla", "km": 18, "stok": 5}, {"ad": "Esenyurt", "km": 18, "stok": 9}]
uygun = [d for d in depolar if d["stok"] &gt; 0]
print(min(uygun, key=itemgetter("km"))["ad"])                     # eşitlikte ilki
print(min((d for d in depolar if d["stok"] &gt; 100), key=itemgetter("km"), default=None))
</pre>

<h3>Fonksiyon tablosu ve fonksiyon birleştirme</h3>
<p>Fonksiyonlar değer olduğu için sözlüğe konabilir. Uzun bir <code>if/elif</code> zinciri yerine "işlem adı → fonksiyon" tablosu (dispatch table) kurarsın; yeni işlem eklemek tek satırdır. Fonksiyonları sıralı bir boru hattına bağlamak (composition) ise <code>reduce</code> ile birkaç satırdır.</p>
<pre class="py">from functools import reduce

KOMISYON = {
    "havale": lambda t: 0.0,
    "eft": lambda t: 4.5,
    "swift": lambda t: max(25.0, round(t * 0.002, 2)),
}

def komisyon(tur, tutar):
    try:
        return KOMISYON[tur](tutar)
    except KeyError:
        raise ValueError(f"bilinmeyen işlem türü: {tur}") from None

print(komisyon("eft", 1000), komisyon("swift", 50000))

def boru(*fonksiyonlar):
    return lambda x: reduce(lambda deger, f: f(deger), fonksiyonlar, x)

temizle = boru(str.strip, str.lower, lambda s: s.replace(" ", "_"))
print(temizle("  Anadolu Market Rapor "))
</pre>
<div class="warn"><b>reduce'un başlangıç değeri</b><code>reduce(f, liste)</code> boş listede TypeError verir. Üçüncü argüman (initializer) hem boş durumu çözer hem de türü belirler: <code>reduce(mul, sayilar, 1)</code>. Toplama için ise reduce yerine <code>sum</code> kullan.</div>

<h3>map ve filter'ın iki küçük sırrı</h3>
<ul>
<li><code>map(f, a, b)</code> birden çok yinelenebilir alır ve <code>f(a[i], b[i])</code> çağırır; en kısa olan bitince durur: <code>list(map(mul, fiyatlar, adetler))</code>.</li>
<li><code>filter(None, veri)</code> yalnız doğru (truthy) değerleri bırakır: boş metinleri, 0'ları ve None'ları atmanın kısa yolu. Dikkat: 0 da gider; 0 geçerli bir değerse kullanma.</li>
</ul>

<div class="note"><b>Gerçek işte</b>Kurumsal kodda fonksiyonel araçlar en çok üç yerde görülür: (1) raporlarda çok ölçütlü sıralama (<code>itemgetter</code> ve iki geçişli sıralama), (2) iş kurallarının tablo hâlinde tutulması (komisyon türleri, KDV oranları, durum geçişleri: if/elif yerine sözlük), (3) veri temizleme adımlarının sıralı bir fonksiyon listesi olarak yazılması. Üçünde de amaç aynı: kural değişince kodun yapısı değil, yalnızca tablo ya da liste değişsin. Türkçe sıralama ise müşteri listesi, il listesi gibi kullanıcıya gösterilen her ekranda istenir; "Çorum neden en sonda?" sorusu mutlaka gelir.</div>
`,
    ex: [
      { t: 'mc',
        stage: 'Isınma',
        q: '<code>key=itemgetter("sehir", "tutar")</code> her eleman için ne döndürür?',
        o: [
          'Yalnızca "sehir" değerini döndürür; ikinci argüman tamamen yok sayılır',
          '("sehir", "tutar") metinlerinden oluşan sabit bir demet',
          '(k["sehir"], k["tutar"]) demeti döndürür',
          'İki alanı içeren yeni bir sözlük: {"sehir": ..., "tutar": ...}'
        ],
        a: 2,
        why: 'itemgetter birden çok anahtarla çağrılınca değerlerin demetini döndürür; demetler soldan sağa karşılaştırıldığı için çoklu sıralama anahtarı olur. lambda k: (k["sehir"], k["tutar"]) ile aynıdır.' },
      { t: 'mc',
        stage: 'Isınma',
        q: 'Python\'un <code>sorted</code> fonksiyonunun <b>kararlı</b> (stable) olması ne demektir?',
        o: [
          'Aynı girdiyle her çalıştırmada aynı sürede biter',
          'Eşit anahtarlıların girdideki sırası korunur',
          'Sıralama sırasında girdi listesi değiştirilmez',
          'Karşılaştırılamayan türlerde bile hiçbir koşulda hata fırlatmaz'
        ],
        a: 1,
        why: 'Kararlılık, eşit anahtarlı elemanların önceki sırasının bozulmaması demektir. Bu sayede önce ikincil, sonra birincil ölçüte göre sıralayarak karışık yönlü çok ölçütlü sıralama yapılabilir.' },
      { t: 'predict',
        stage: 'Kodu oku',
        q: 'Bu kod ne yazdırır?',
        code: 'fiyat = [10, 20, 30]\nadet = [3, 2]\nprint(list(map(lambda f, a: f * a, fiyat, adet)))\n',
        o: ['[30, 40]', '[30, 40, 30]', '[30, 40, 0]', 'TypeError'],
        a: 0,
        why: 'map birden çok yinelenebilirle elemanları sırayla eşleştirir ve en kısa olan bittiğinde durur (zip gibi). Üçüncü fiyatın eşi olmadığı için atlanır.' },
      { t: 'predict',
        stage: 'Kodu oku',
        q: 'Bu kod ne yazdırır?',
        code: 'alanlar = [0, "", "Ankara", None, 5, [], "0"]\nprint(list(filter(None, alanlar)))\n',
        o: ['[\'Ankara\', 5, \'0\']', '[\'Ankara\', 5]', '[0, \'Ankara\', 5, \'0\']', '[\'Ankara\', 5, [], \'0\']'],
        a: 0,
        why: 'filter(None, ...) yalnız doğru (truthy) değerleri bırakır. 0, "", None ve boş liste yanlış sayılır; "0" ise boş olmayan bir metindir, doğrudur.' },
      { t: 'predict',
        stage: 'Kodu oku',
        q: 'Bu kod ne yazdırır?',
        code: 'from functools import reduce\nprint(reduce(lambda a, b: a + b, [], 0), max([], default="yok"), min([4, 2, 2], key=lambda x: -x))\n',
        o: ['0 yok 2', '0 yok 4', 'None yok 4', 'TypeError'],
        a: 1,
        why: 'reduce başlangıç değeri verildiği için boş listede onu döndürür (0). max boş girdide default\'u döndürür. min, key = -x en küçük olanı yani x\'i en büyük olanı (4) seçer.' },
      { t: 'predict',
        stage: 'Kodu oku',
        q: 'Varsayılan sıralama Türkçe harfleri nereye koyar? Bu kod ne yazdırır?',
        code: 'print(sorted(["ı", "i", "a", "ç", "c"]))\n',
        o: ['[\'a\', \'c\', \'ç\', \'ı\', \'i\']', '[\'a\', \'c\', \'i\', \'ç\', \'ı\']', '[\'a\', \'ç\', \'c\', \'i\', \'ı\']', '[\'a\', \'c\', \'ç\', \'i\', \'ı\']'],
        a: 1,
        why: 'Metinler Unicode kod numarasına göre sıralanır: a(97), c(99), i(105), ç(231), ı(305). Türkçe harfler Latin harflerinin sonuna düşer; Türkçe sıra için özel anahtar gerekir.' },
      { t: 'order',
        stage: 'Kodu oku',
        q: '<p>İşlem türüne göre komisyonu bir fonksiyon tablosundan hesaplayan programın satırlarını sırala. Çıktı: <code>[0, 4.5, 30.0]</code></p>',
        lines: [
          'TABLO = {"havale": lambda t: 0, "eft": lambda t: 4.5, "swift": lambda t: max(25.0, t * 0.002)}',
          'def komisyon(islem):',
          '    tur, tutar = islem',
          '    return TABLO[tur](tutar)',
          'islemler = [("havale", 500), ("eft", 1000), ("swift", 15000)]',
          'print(list(map(komisyon, islemler)))'
        ],
        expect: '[0, 4.5, 30.0]\n',
        hint: 'Tablo ve fonksiyon önce; komisyon önce demeti açar, sonra tablodan fonksiyonu seçip çağırır.',
        why: 'Dispatch tablosu: tür adı fonksiyonu seçer, tutar onu çağırır. map her işlemi komisyon fonksiyonundan geçirir.' },
      { t: 'code',
        id: 'fonksiyonel-x1',
        stage: 'Rehberli',
        diff: 2,
        q: '<p><code>turkce_sirala(metinler)</code>: metinleri <b>Türk alfabesine göre</b> ve büyük/küçük harf duyarsız sıralanmış yeni liste olarak döndürsün. Alfabe: <code>"abcçdefgğhıijklmnoöprsştuüvyz"</code>. Alfabede olmayan karakterler (boşluk, rakam, q, w, x) alfabedeki tüm harflerden sonra, kendi aralarında Unicode sırasına göre gelsin. Büyük harfe dikkat: <code>"I"</code> küçüğü <code>"ı"</code>, <code>"İ"</code> küçüğü <code>"i"</code>.</p>',
        guide: [
          'Harf → sıra numarası sözlüğünü dict comprehension ve enumerate ile kur.',
          'Türkçe küçültme fonksiyonu yaz: önce I→ı, İ→i değiştir, sonra lower().',
          'Anahtar fonksiyonu: küçültülmüş metnin her harfi için sıra numarası listesi; alfabede yoksa 100 + ord(h).',
          'sorted(metinler, key=anahtar) döndür.'
        ],
        example: '# Farklı iş: tişört bedenlerini özel sıraya göre dizmek\nBEDEN = {b: i for i, b in enumerate(["XS", "S", "M", "L", "XL"])}\nsiparis = ["L", "XS", "XL", "M", "S", "M"]\nprint(sorted(siparis, key=lambda b: BEDEN.get(b, 99)))\n',
        start: 'ALFABE = "abcçdefgğhıijklmnoöprsştuüvyz"\n\ndef turkce_sirala(metinler):\n    sira = {}                     # TODO: harf → indeks\n    def anahtar(metin):\n        # TODO: I→ı, İ→i, lower; her harf için sıra ya da 100 + ord\n        return metin\n    return sorted(metinler, key=anahtar)\n',
        sol: 'ALFABE = "abcçdefgğhıijklmnoöprsştuüvyz"\n\ndef turkce_sirala(metinler):\n    sira = {h: i for i, h in enumerate(ALFABE)}\n    def anahtar(metin):\n        kucuk = metin.replace("I", "ı").replace("İ", "i").lower()\n        return [sira.get(h, 100 + ord(h)) for h in kucuk]\n    return sorted(metinler, key=anahtar)\n',
        tests: 'iller = ["Çorum", "Bursa", "Şanlıurfa", "Iğdır", "İzmir", "Ağrı", "Uşak", "Ordu", "Ödemiş", "ceyhan"]\nr = turkce_sirala(iller)\nassert r == ["Ağrı", "Bursa", "ceyhan", "Çorum", "Iğdır", "İzmir", "Ordu", "Ödemiş", "Şanlıurfa", "Uşak"], "Gelen: " + str(r)\nassert turkce_sirala(["ıl", "il", "Il", "İl"]) in (["ıl", "Il", "il", "İl"],), "I→ı ve İ→i dönüşümü: " + str(turkce_sirala(["ıl", "il", "Il", "İl"]))\nassert turkce_sirala(["ab", "a b", "a1"]) == ["ab", "a b", "a1"], "Alfabe dışı karakterler harflerden sonra gelir (boşluk 32, \'1\' 49)"\nassert turkce_sirala([]) == []\nliste = ["b", "a"]\nturkce_sirala(liste)\nassert liste == ["b", "a"], "Girdi değişmemeli (sorted kullan)"\n',
        hints: [
          'Anahtar bir liste olabilir: listeler de demetler gibi soldan sağa karşılaştırılır.',
          '"İ".lower() Python\'da "i̇" (iki karakter) üretir; bu yüzden önce kendin değiştir.',
          'return [sira.get(h, 100 + ord(h)) for h in kucuk]'
        ],
        why: 'Sıralama anahtarı, her harfi Türk alfabesindeki konumuna çeviren bir listedir. Alfabe dışı karakterleri 100 + ord ile sona ve kendi aralarında Unicode sırasına koymak, anahtarların her zaman karşılaştırılabilir olmasını sağlar.' },
      { t: 'code',
        id: 'fonksiyonel-x2',
        stage: 'Rehberli',
        diff: 2,
        q: '<p>Anadolu Market kampanya motoru. <code>KURALLAR</code> adında bir sözlük tanımla: anahtar kampanya kodu, değer <code>tutar</code> alıp indirimli tutarı döndüren fonksiyon:</p><ul><li><code>"YUZDE10"</code>: %10 indirim</li><li><code>"50TL"</code>: 50 TL indirim ama sonuç 0\'ın altına inmesin</li><li><code>"KARGO"</code>: tutar 500\'ün altındaysa 39.90 ekle, değilse aynen bırak</li></ul><p>Sonra <code>uygula(kod, tutar)</code>: sonucu 2 ondalığa yuvarlayıp döndürsün; kod <code>None</code> ise tutarı aynen (yuvarlanmış) döndürsün; bilinmeyen kodda <code>ValueError(f"geçersiz kampanya: {kod}")</code>.</p>',
        guide: [
          'KURALLAR sözlüğünün her değerini bir lambda olarak yaz.',
          '50TL kuralı için max(0, t - 50) kullan.',
          'uygula içinde önce kod None mu diye bak.',
          'KURALLAR[kod] KeyError verirse ValueError\'a çevir (try/except ya da in kontrolü).',
          'Fonksiyonu çağır ve round(..., 2) döndür.'
        ],
        example: 'DONUSUM = {"km": lambda x: x * 1000, "cm": lambda x: x / 100, "m": lambda x: x}\n\ndef metreye(birim, deger):\n    if birim not in DONUSUM:\n        raise ValueError(f"bilinmeyen birim: {birim}")\n    return DONUSUM[birim](deger)\n\nprint(metreye("km", 2.5), metreye("cm", 30))\n',
        start: 'KURALLAR = {\n    # TODO: "YUZDE10", "50TL", "KARGO"\n}\n\ndef uygula(kod, tutar):\n    # TODO: None → aynen; bilinmeyen → ValueError; bilinen → KURALLAR[kod](tutar)\n    return tutar\n',
        sol: 'KURALLAR = {\n    "YUZDE10": lambda t: t * 0.9,\n    "50TL": lambda t: max(0, t - 50),\n    "KARGO": lambda t: t + 39.90 if t < 500 else t,\n}\n\ndef uygula(kod, tutar):\n    if kod is None:\n        return round(tutar, 2)\n    if kod not in KURALLAR:\n        raise ValueError(f"geçersiz kampanya: {kod}")\n    return round(KURALLAR[kod](tutar), 2)\n',
        tests: 'assert callable(KURALLAR.get("YUZDE10")), "KURALLAR sözlüğünde YUZDE10 fonksiyonu olmalı"\nassert uygula("YUZDE10", 899.90) == 809.91, "%10 indirim"\nassert uygula("50TL", 120) == 70 and uygula("50TL", 30) == 0, "50TL indirim, sıfırın altına inmez"\nassert uygula("KARGO", 300) == 339.9 and uygula("KARGO", 500) == 500, "500 altına kargo eklenir, 500 ve üstü aynen"\nassert uygula(None, 99.999) == 100.0, "Kod yoksa yuvarlanmış tutar"\ntry:\n    uygula("BEDAVA", 100)\n    assert False, "Bilinmeyen kod ValueError vermeli"\nexcept ValueError as e:\n    assert str(e) == "geçersiz kampanya: BEDAVA"\nKURALLAR["YUZDE20"] = lambda t: t * 0.8\nassert uygula("YUZDE20", 100) == 80.0, "Yeni kural yalnız tabloya eklenerek çalışmalı"\n',
        hints: [
          'Lambda içinde koşullu ifade kullanabilirsin: lambda t: t + 39.90 if t < 500 else t',
          'uygula: if kod not in KURALLAR: raise ValueError(...)',
          'Son satır: return round(KURALLAR[kod](tutar), 2)'
        ],
        why: 'Kampanya kuralları bir tablo olunca yeni kampanya eklemek kodun yapısını değiştirmez; uygula fonksiyonu hiç değişmeden yeni kuralı da çalıştırır.' },
      { t: 'code',
        id: 'fonksiyonel-x3',
        stage: 'Rehberli',
        diff: 2,
        q: '<p><code>boru(*fonksiyonlar)</code> fonksiyonunu yaz: verilen fonksiyonları <b>soldan sağa</b> sırayla uygulayan yeni bir fonksiyon döndürsün: <code>boru(f, g, h)(x) == h(g(f(x)))</code>. Hiç fonksiyon verilmezse dönen fonksiyon girdiyi aynen döndürsün. <code>functools.reduce</code> kullan.</p>',
        guide: [
          'boru içinde tek argüman alan bir iç fonksiyon tanımla (ya da lambda döndür).',
          'İç fonksiyonda reduce(lambda deger, f: f(deger), fonksiyonlar, x) hesapla.',
          'Başlangıç değeri x olduğu için boş fonksiyon listesinde x aynen döner.',
          'İç fonksiyonu döndür.'
        ],
        example: 'from functools import reduce\n# Farklı iş: bir sayıya sırayla işlemler uygulamak\nislemler = [lambda x: x + 10, lambda x: x * 2, lambda x: x - 1]\nprint(reduce(lambda deger, f: f(deger), islemler, 5))   # ((5+10)*2)-1\n',
        start: 'from functools import reduce\n\ndef boru(*fonksiyonlar):\n    def calistir(x):\n        # TODO: reduce ile fonksiyonları sırayla uygula, başlangıç x\n        return x\n    return None   # TODO: iç fonksiyonu döndür\n',
        sol: 'from functools import reduce\n\ndef boru(*fonksiyonlar):\n    def calistir(x):\n        return reduce(lambda deger, f: f(deger), fonksiyonlar, x)\n    return calistir\n',
        tests: 'temizle = boru(str.strip, str.lower, lambda s: s.replace(" ", "_"))\nassert temizle("  Anadolu Market ") == "anadolu_market", "strip → lower → boşlukları _ yap"\nassert boru(lambda x: x + 1, lambda x: x * 10)(2) == 30, "Soldan sağa: (2+1)*10 = 30, (2*10)+1 değil"\nassert boru()(42) == 42, "Fonksiyon yoksa girdi aynen dönmeli"\nkdvli_yuvarla = boru(lambda t: t * 1.2, lambda t: round(t, 2))\nassert kdvli_yuvarla(899.9) == 1079.88\nassert "reduce" in __source__, "functools.reduce kullan"\n',
        hints: [
          'Fonksiyon döndüren fonksiyon: iç fonksiyonu tanımla ve parantezsiz adını döndür.',
          'reduce(f, liste, baslangic): her adımda deger = f(deger, eleman). Burada eleman bir fonksiyon.',
          'return reduce(lambda deger, f: f(deger), fonksiyonlar, x)'
        ],
        why: 'reduce, birikimli değeri her fonksiyondan sırayla geçirir; başlangıç değeri x olduğundan boş listede x döner. Veri temizleme adımları bir fonksiyon listesi olunca adım eklemek/çıkarmak kodu değiştirmez.' },
      { t: 'code',
        id: 'fonksiyonel-x4',
        stage: 'Kendin yaz',
        diff: 2,
        q: '<p><code>departman_listesi(calisanlar)</code>: <code>calisanlar</code> <code>{"ad", "departman", "maas"}</code> sözlükleri. Departmana göre <b>artan</b> (alfabetik), aynı departmanda maaşa göre <b>azalan</b>, maaş da eşitse ada göre <b>azalan</b> sıralanmış yeni liste döndür. İpucu: metinler için eksi hilesi çalışmaz; kararlı sıralamayla birkaç geçiş yap.</p>',
        sol: 'from operator import itemgetter\n\ndef departman_listesi(calisanlar):\n    sonuc = sorted(calisanlar, key=itemgetter("ad"), reverse=True)\n    sonuc = sorted(sonuc, key=itemgetter("maas"), reverse=True)\n    return sorted(sonuc, key=itemgetter("departman"))\n',
        tests: 'C = [{"ad": "Ayşe", "departman": "Satış", "maas": 50000},\n     {"ad": "Can", "departman": "BT", "maas": 65000},\n     {"ad": "Mehmet", "departman": "Satış", "maas": 50000},\n     {"ad": "Ali", "departman": "BT", "maas": 80000},\n     {"ad": "Zeynep", "departman": "Satış", "maas": 72000},\n     {"ad": "Deniz", "departman": "BT", "maas": 65000}]\nr = [(k["departman"], k["ad"]) for k in departman_listesi(C)]\nassert r == [("BT", "Ali"), ("BT", "Deniz"), ("BT", "Can"), ("Satış", "Zeynep"), ("Satış", "Mehmet"), ("Satış", "Ayşe")], "Gelen: " + str(r)\nassert C[0]["ad"] == "Ayşe", "Girdi listesi değişmemeli"\nassert departman_listesi([]) == []\n',
        hints: ['Önce en önemsiz ölçüt (ad, azalan), sonra maaş (azalan), en son departman (artan).', 'Kararlı sıralama önceki geçişin sırasını eşitliklerde korur.'],
        why: 'Karışık yönlü ve metin içeren çok ölçütlü sıralamada geçişleri önemsizden önemliye uygularsın; her geçiş kendi reverse değerini alır. Son geçiş birincil ölçüttür.' },
      { t: 'code',
        id: 'fonksiyonel-x5',
        stage: 'Kendin yaz',
        diff: 2,
        q: '<p><code>en_yakin_depo(depolar, adet)</code>: <code>depolar</code> <code>{"ad", "km", "stok"}</code> sözlükleri. Stoku <code>adet</code>\'e yeten depolar arasından <code>km</code>\'si en küçük deponun <b>adını</b> döndür; eşitlikte listede önce geleni seç. Uygun depo yoksa <code>None</code>. <code>min</code> fonksiyonunu <code>key</code> ve <code>default</code> ile kullan.</p>',
        sol: 'def en_yakin_depo(depolar, adet):\n    uygun = (d for d in depolar if d["stok"] >= adet)\n    secilen = min(uygun, key=lambda d: d["km"], default=None)\n    return secilen["ad"] if secilen else None\n',
        tests: 'D = [{"ad": "Gebze", "km": 42, "stok": 50}, {"ad": "Tuzla", "km": 18, "stok": 5}, {"ad": "Esenyurt", "km": 18, "stok": 9}, {"ad": "Kartal", "km": 25, "stok": 3}]\nassert en_yakin_depo(D, 4) == "Tuzla", "18 km\'de iki depo var; eşitlikte listede önce gelen (Tuzla)"\nassert en_yakin_depo(D, 6) == "Esenyurt", "Stok 6\'ya yetenler: Gebze, Esenyurt"\nassert en_yakin_depo(D, 10) == "Gebze"\nassert en_yakin_depo(D, 100) is None, "Uygun depo yoksa None"\nassert en_yakin_depo([], 1) is None\nassert "default" in __source__, "min\'in default parametresini kullan"\n',
        hints: ['Önce süz (üreteç ifadesi), sonra min(..., key=..., default=None).', 'min sözlüğün kendisini döndürür; adını almadan önce None olup olmadığına bak.'],
        why: 'min/max key ile "en iyi elemanı" döndürür, değerini değil; default boş girdide ValueError yerine anlamlı bir değer verir. Eşitlikte ilk eleman seçildiği için sonuç deterministiktir.' },
      { t: 'code',
        id: 'fonksiyonel-x6',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 2,
        q: '<p><b>Hatayı bul ve düzelt.</b> <code>oran_fonksiyonlari(oranlar)</code> her oran için <code>tutar * oran</code> hesaplayan bir fonksiyon listesi döndürmeli. Ama listedeki tüm fonksiyonlar <b>son oranı</b> kullanıyor.</p>',
        start: 'def oran_fonksiyonlari(oranlar):\n    return [lambda tutar: round(tutar * oran, 2) for oran in oranlar]\n',
        sol: 'def oran_fonksiyonlari(oranlar):\n    return [lambda tutar, oran=oran: round(tutar * oran, 2) for oran in oranlar]\n',
        tests: 'f = oran_fonksiyonlari([0.01, 0.18, 0.20])\nassert [g(100) for g in f] == [1.0, 18.0, 20.0], "Her fonksiyon kendi oranını kullanmalı, gelen: " + str([g(100) for g in f])\nassert oran_fonksiyonlari([]) == []\n',
        hints: [
          'Lambda, oran değişkenini oluşturulduğu anda değil ÇAĞRILDIĞI anda okur (geç bağlama); o zaman oran son değerdedir.',
          'Değeri o anda yakalamak için varsayılan argüman: lambda tutar, oran=oran: ... (ya da functools.partial).'
        ],
        why: 'Closure değişkeni çağrı anında okur; comprehension bitince oran son değerde kalır. Varsayılan argüman değeri tanım anında hesaplanır ve her lambda kendi oranını saklar.' },
      { t: 'code',
        id: 'fonksiyonel-x7',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 1,
        q: '<p><b>Hatayı bul ve düzelt.</b> <code>en_pahali_uc(urunler)</code> <code>(ad, fiyat)</code> listesinden en pahalı üç ürünün <b>adlarını</b> pahalıdan ucuza döndürmeli ve <b>girdi listesini değiştirmemeli</b>. Kod TypeError veriyor; ilk hatayı düzeltince başka bir hata çıkıyor.</p>',
        start: 'def fiyat(urun):\n    return urun[1]\n\ndef en_pahali_uc(urunler):\n    sirali = urunler.sort(key=fiyat(), reverse=True)\n    return [ad for ad, _ in sirali[:3]]\n',
        sol: 'def fiyat(urun):\n    return urun[1]\n\ndef en_pahali_uc(urunler):\n    sirali = sorted(urunler, key=fiyat, reverse=True)\n    return [ad for ad, _ in sirali[:3]]\n',
        tests: 'U = [("Kablo", 79.9), ("Monitör", 4599.0), ("Mouse", 349.5), ("Klavye", 1249.0), ("Kulaklık", 899.9)]\nassert en_pahali_uc(U) == ["Monitör", "Klavye", "Kulaklık"], "Gelen: " + str(en_pahali_uc(U))\nassert U[0] == ("Kablo", 79.9), "Girdi listesi değişmemeli: list.sort yerinde sıralar"\nassert en_pahali_uc([("A", 1)]) == ["A"]\n',
        hints: [
          'key\'e fonksiyonun kendisi verilir (fiyat), çağrısının sonucu (fiyat()) değil.',
          'list.sort() yerinde sıralar ve None döndürür; yeni sıralı liste için sorted() kullan.'
        ],
        why: 'İki klasik hata: key=fiyat() fonksiyonu argümansız çağırır (TypeError). list.sort() None döndürür ve girdiyi değiştirir; sorted() yeni liste verir.' },
      { t: 'code',
        id: 'fonksiyonel-x8',
        stage: 'Meydan okuma',
        diff: 3,
        q: '<p><b>Genel çok ölçütlü sıralayıcı.</b> <code>coklu_sirala(kayitlar, kurallar)</code>: <code>kurallar</code> <code>(alan, yon)</code> demetlerinin listesidir; ilk kural en önemlisidir, <code>yon</code> <code>"artan"</code> ya da <code>"azalan"</code>. Alanlar sayı ya da metin olabilir. Yeni sıralı liste döndür. Geçersiz yön için <code>ValueError</code> fırlat (sıralamaya başlamadan). Kural listesi boşsa girdinin kopyasını aynı sırayla döndür.</p>',
        sol: 'from operator import itemgetter\n\ndef coklu_sirala(kayitlar, kurallar):\n    for _, yon in kurallar:\n        if yon not in ("artan", "azalan"):\n            raise ValueError(f"geçersiz yön: {yon}")\n    sonuc = list(kayitlar)\n    for alan, yon in reversed(kurallar):\n        sonuc.sort(key=itemgetter(alan), reverse=(yon == "azalan"))\n    return sonuc\n',
        tests: 'K = [{"sehir": "İzmir", "musteri": "Can", "tutar": 300},\n     {"sehir": "Ankara", "musteri": "Ayşe", "tutar": 300},\n     {"sehir": "Ankara", "musteri": "Burak", "tutar": 900},\n     {"sehir": "İzmir", "musteri": "Ali", "tutar": 300},\n     {"sehir": "Ankara", "musteri": "Elif", "tutar": 300}]\nr = coklu_sirala(K, [("sehir", "artan"), ("tutar", "azalan"), ("musteri", "azalan")])\nassert [k["musteri"] for k in r] == ["Burak", "Elif", "Ayşe", "Can", "Ali"], "Gelen: " + str([k["musteri"] for k in r])\nr2 = coklu_sirala(K, [("tutar", "artan"), ("sehir", "azalan")])\nassert [k["musteri"] for k in r2] == ["Can", "Ali", "Ayşe", "Elif", "Burak"], "Eşitlikte girdi sırası korunmalı (kararlı): " + str([k["musteri"] for k in r2])\nassert coklu_sirala(K, []) == K and coklu_sirala(K, []) is not K, "Kural yoksa aynı sırada bir KOPYA"\nassert K[0]["musteri"] == "Can", "Girdi değişmemeli"\ntry:\n    coklu_sirala(K, [("sehir", "artan"), ("tutar", "büyükten")])\n    assert False, "Geçersiz yön ValueError vermeli"\nexcept ValueError:\n    pass\n',
        hints: [
          'Kurallar önemliden önemsize verilmiş; kararlı sıralamada geçişleri ters sırayla uygula: reversed(kurallar).',
          'Her geçişte reverse=(yon == "azalan"); list(kayitlar) ile kopya al ve yerinde sırala.',
          'Yön doğrulamasını sıralamadan önce ayrı bir döngüde yap.'
        ],
        why: 'Kararlı sıralamada en önemsiz kuraldan başlayıp en önemliye doğru geçiş yapmak, hem sayı hem metin alanlarında karışık yönleri destekler; eksi hilesine gerek kalmaz. Doğrulamayı başta yapmak yarım iş bırakmayı önler.' }
    ],
    faq: [
      { q: 'itemgetter mı lambda mı kullanmalıyım?',
        a: 'İkisi de doğru. itemgetter/attrgetter biraz daha hızlıdır, çoklu alanı tek çağrıda verir ve niyeti açık söyler. Hesap gerekiyorsa (ör. -k["tutar"], k["ad"].lower()) lambda zorunludur. Takımın stil rehberine uy; karışık kullanmak da yaygındır.' },
      { q: 'Türkçe sıralama için hazır bir çözüm yok mu?',
        a: 'locale.setlocale(locale.LC_COLLATE, "tr_TR.UTF-8") ve key=locale.strxfrm işletim sisteminin Türkçe kurallarını kullanır ama sunucuda tr_TR yerel ayarı kurulu olmayabilir (locale.Error). Kurumsal projelerde PyICU kütüphanesi kullanılır: pip install PyICU (Windows\'ta kurulumu zahmetlidir). Basit ihtiyaçta bu dersteki alfabe anahtarı yeterlidir ve her yerde çalışır.' }
    ],
    mistakes: [
      { bad: 'sorted(calisanlar, key=lambda k: (k["departman"], -k["ad"]))',
        good: 'sirali = sorted(calisanlar, key=itemgetter("ad"), reverse=True)\nsirali = sorted(sirali, key=itemgetter("departman"))',
        why: 'Metin eksi ile çarpılamaz (TypeError). Metinde karışık yönlü sıralama için kararlı sıralamayla iki geçiş yap: önce ikincil, sonra birincil ölçüt.' },
      { bad: 'en_buyuk = max(siparisler, key=itemgetter("tutar"))  # boş listede ValueError',
        good: 'en_buyuk = max(siparisler, key=itemgetter("tutar"), default=None)',
        why: 'min/max boş girdide ValueError fırlatır. Sipariş olmayan gün gibi durumlarda default ile anlamlı bir değer döndür.' }
    ]
  }
);
})(window);
