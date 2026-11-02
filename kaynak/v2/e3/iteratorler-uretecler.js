/* PythonPatika — uzantı: iteratorler-uretecler (Derinleş) */
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
  { id: 'iteratorler-uretecler',
    min: 45,
    html: `<h2>Derinleş: akışlarla çalışmanın inceliği</h2>
<p>iter/next, kendi yineleyici sınıfın, yield, yield from ve sonsuz üreteçleri gördün. Bu bölümde gerçek veri işlerinde en çok işine yarayacak kalıpları ekliyoruz: hangi nesnelerin "tek kullanımlık" olduğu, <code>next</code>'in varsayılan değeri ve <code>iter</code>'in az bilinen iki argümanlı biçimi, üreteçlerden boru hattı (pipeline) kurmak, veriyi parçalar (batch) hâlinde işlemek, tekrar tekrar gezilebilen sınıflar ve üretecin yaşam döngüsü. itertools araçlarının çoğu <b>collections ve itertools</b> dersinde ayrıca ele alınıyor.</p>

<h3>Yinelenebilir mi, yineleyici mi? Kim tek kullanımlık?</h3>
<p>Yinelenebilir (iterable), <code>iter()</code> verildiğinde her seferinde <b>yeni</b> bir yineleyici üreten nesnedir: liste, demet, sözlük, <code>range</code>. Yineleyici (iterator) ise kendi konumunu tutar ve bir kez tükenir. Python'un birçok yerleşik fonksiyonu yineleyici döndürür; bu yüzden ikinci kullanımda boş gelirler.</p>
<div class="tbl-wrap"><table>
<tr><th>Nesne</th><th>Tür</th><th>İkinci for döngüsünde</th></tr>
<tr><td><code>list</code>, <code>tuple</code>, <code>dict</code>, <code>str</code></td><td>yinelenebilir</td><td>Baştan gezer</td></tr>
<tr><td><code>range(10)</code></td><td>yinelenebilir (tembel)</td><td>Baştan gezer</td></tr>
<tr><td><code>zip</code>, <code>map</code>, <code>filter</code>, <code>enumerate</code>, <code>reversed</code></td><td>yineleyici</td><td>Boş</td></tr>
<tr><td>Üreteç fonksiyonu/ifadesi</td><td>yineleyici</td><td>Boş</td></tr>
<tr><td>Açık dosya nesnesi</td><td>yineleyici</td><td>Boş (imleç sonda)</td></tr>
</table></div>
<pre class="py">r = range(3)
print(list(r), list(r))              # range tekrar gezilir

eslesme = zip(["Ayşe", "Can"], [92, 61])
print(list(eslesme), list(eslesme))  # zip ikinci kez boş

it = iter([10, 20])
print(iter(it) is it)                # yineleyicinin iter'i kendisidir
print(next(it), next(it), next(it, "bitti"))   # varsayılan: StopIteration yok
</pre>
<div class="tip"><b>Basit kural</b><code>iter(x) is x</code> True ise x tek kullanımlık bir yineleyicidir. Bir fonksiyona veri verip içeride iki kez gezecek misin? Ya liste ver ya da fonksiyonun başında <code>veri = list(veri)</code> yaz.</div>

<h3>iter(fonksiyon, bitiş_değeri)</h3>
<p><code>iter</code>'e iki argüman verirsen anlamı değişir: birinci argüman argümansız bir fonksiyondur, Python onu tekrar tekrar çağırır ve dönen değer <b>bitiş değerine</b> (sentinel) eşit olunca durur. Dosyayı sabit boyutlu parçalarla okumanın klasik yoludur.</p>
<pre class="py">import io
from functools import partial

akis = io.StringIO("TRX1TRX2TRX3TR")         # dosya gibi davranan metin
for parca in iter(partial(akis.read, 4), ""):  # read(4) "" dönünce dur
    print(repr(parca))

kuyruk = [7, 3, 0, 9]                          # 0 gelince dur
print(list(iter(kuyruk.pop, 9)))               # sondan: 9 hemen bitiş!
print(list(iter(lambda: kuyruk.pop(0), 0)))    # baştan: 7, 3, sonra 0
</pre>

<h3>Üreteç boru hattı: her aşama bir fonksiyon</h3>
<p>Büyük bir log dosyasını işlerken "oku → ayrıştır → süz → topla" aşamalarını ayrı üreteçler olarak yazıp birbirine bağlarsın. Hiçbir aşama listenin tamamını tutmaz; her satır boru hattından tek tek akar. Aşağıdaki çıktıda aşamaların iç içe (sırayla değil) çalıştığına dikkat et.</p>
<pre class="py">LOG = """2026-10-27 09:01 TR01 havale 1500
bozuk satır
2026-10-27 09:05 TR02 eft 25000
2026-10-27 09:07 TR01 havale 300"""

def satirlar(metin):
    for s in metin.splitlines():
        print("  okundu:", s[:16])
        yield s

def ayristir(satir_akisi):
    for s in satir_akisi:
        parca = s.split()
        if len(parca) == 5:
            yield {"hesap": parca[2], "tur": parca[3], "tutar": float(parca[4])}

def buyukler(kayitlar, esik):
    return (k for k in kayitlar if k["tutar"] &gt;= esik)

hat = buyukler(ayristir(satirlar(LOG)), 1000)
print("Boru hattı kuruldu, henüz hiçbir şey okunmadı")
for k in hat:
    print("SONUÇ:", k)
</pre>

<h3>Parça parça (batch) işlemek</h3>
<p>Veritabanına 100'erli gruplar hâlinde yazmak, API'ye 50'şer kayıt göndermek gibi işler için akışı sabit boyutlu parçalara bölersin. Python 3.12 bunun için <code>itertools.batched</code> getirdi; eski sürümlerde <code>islice</code> ile aynısını yazarsın.</p>
<pre class="py">from itertools import islice, batched      # batched: Python 3.12+

def parcalar(yinelenebilir, n):
    it = iter(yinelenebilir)               # tek bir yineleyici şart
    while parca := list(islice(it, n)):
        yield parca

print(list(parcalar(range(1, 8), 3)))
print(list(batched(range(1, 8), 3)))      # demetler döndürür
</pre>
<div class="warn"><b>iter(...) satırını unutma</b><code>islice(liste, n)</code> her çağrıda listenin <b>başından</b> başlar; sonsuz döngüye girersin. Konumu tutan tek bir yineleyici oluşturup islice'a hep onu vermelisin.</div>

<h3>Tekrar gezilebilen sınıf: __iter__ içinde yield</h3>
<p>Kendi yineleyici sınıfında <code>__iter__</code> <code>self</code> döndürüyorsa nesne tek kullanımlıktır. Çoğu zaman istediğin ise "liste gibi davranan" bir koleksiyondur: her for döngüsünde baştan başlamalı. Çözüm: <code>__next__</code> yazma, <code>__iter__</code>'i üreteç fonksiyonu yap. Her çağrı yeni bir üreteç döndürür.</p>
<pre class="py">class SiparisDefteri:
    def __init__(self, siparisler):
        self._siparisler = list(siparisler)

    def __iter__(self):                    # her çağrıda yeni üreteç
        for s in self._siparisler:
            if s["durum"] != "iptal":
                yield s

defter = SiparisDefteri([{"no": 1, "durum": "ok"}, {"no": 2, "durum": "iptal"}, {"no": 3, "durum": "ok"}])
print([s["no"] for s in defter])
print([s["no"] for s in defter])          # yine baştan
print(sum(1 for _ in defter), "geçerli sipariş")
</pre>

<h3>Üretecin yaşam döngüsü: return, close ve temizlik</h3>
<p>Üreteç fonksiyonunda <code>return deger</code> yazabilirsin: akış biter ve değer <code>StopIteration.value</code> içinde taşınır; <code>yield from</code> bu değeri sonuç olarak verir. Tüketici akışı yarıda bırakırsa (break) üreteç çöp toplanırken ya da <code>close()</code> çağrılınca içerideki <code>finally</code> bloğu çalışır; dosya, bağlantı gibi kaynakları orada kapatırsın.</p>
<pre class="py">def kayit_oku():
    print("bağlantı açıldı")
    try:
        for i in range(1, 100):
            yield i
    finally:
        print("bağlantı kapandı")

g = kayit_oku()
for x in g:
    if x == 3:
        break
g.close()                                  # finally hemen çalışır

def alt():
    yield "a"
    return 42

def ust():
    sonuc = yield from alt()
    yield f"alt üreteç {sonuc} döndürdü"

print(list(ust()))
</pre>

<div class="note"><b>Gerçek işte</b>Veri mühendisliğinde "akış" (streaming) düşüncesi her yerdedir: gigabaytlık CSV'yi satır satır okuyup 1000'erlik paketlerle veritabanına yazan bir ETL betiği, birkaç megabayt bellekle çalışır. Aynı işi önce <code>readlines()</code> ile listeye alıp yapan betik ise sunucuda bellek yetmeyince çöker. pandas'ın <code>read_csv(chunksize=...)</code>, veritabanı imleçlerinin <code>fetchmany</code>'si ve bulut SDK'larının sayfalama (pagination) yardımcıları bu bölümdeki kalıpların kütüphane hâlidir.</div>
`,
    ex: [
      { t: 'mc',
        stage: 'Isınma',
        q: 'Aşağıdakilerden hangisi <b>tekrar gezilebilir</b>; yani iki ayrı for döngüsünde de tüm elemanlarını verir?',
        o: ['zip(a, b) sonucu', 'map(str, sayilar) sonucu', 'range(100) nesnesi', '(x * 2 for x in liste) ifadesi'],
        a: 2,
        why: 'range bir yinelenebilirdir; her iter() çağrısında yeni bir yineleyici üretir. zip, map ve üreteç ifadesi ise yineleyicidir ve ilk gezintide tükenir.' },
      { t: 'mc',
        stage: 'Isınma',
        q: '<code>for parca in iter(partial(f.read, 1024), ""):</code> satırı ne yapar?',
        o: [
          'Dosyayı 1024 satırlık parçalarla, boş satıra kadar okur',
          'Dosyayı 1024 karakterlik parçalarla, read boş metin döndürene dek okur',
          'Dosyanın yalnızca ilk 1024 karakterini tek seferde okuyup durur',
          'Dosyayı her turda baştan alarak tam 1024 kez okur'
        ],
        a: 1,
        why: 'İki argümanlı iter, fonksiyonu tekrar tekrar çağırır ve dönen değer bitiş değerine ("") eşit olunca durur. read(1024) dosya sonunda "" döndürür.' },
      { t: 'predict',
        stage: 'Kodu oku',
        q: 'Bu kod ne yazdırır?',
        code: 'eslesme = zip(["Ayşe", "Can"], [92, 61])\nprint(len(list(eslesme)), len(list(eslesme)))\n',
        o: ['2 2', '2 0', '0 0', 'TypeError'],
        a: 1,
        why: 'zip bir yineleyicidir; ilk list() tüm çiftleri tüketir. İkinci list() boş yineleyiciyle karşılaşır ve [] üretir.' },
      { t: 'predict',
        stage: 'Kodu oku',
        q: 'Üreteç ifadesi ne zaman hesap yapar? Bu kod ne yazdırır?',
        code: 'g = (100 / x for x in [4, 0, 5])\nprint("hazır")\nprint(next(g))\n',
        o: ['ZeroDivisionError', 'hazır\n25.0', 'hazır\n25.0\nZeroDivisionError', '25.0\nhazır'],
        a: 1,
        why: 'Üreteç ifadesi tembeldir: oluşturulurken hiçbir bölme yapılmaz. next yalnız ilk elemanı (100/4) hesaplar; 0\'a bölme ikinci next\'te ortaya çıkardı.' },
      { t: 'predict',
        stage: 'Kodu oku',
        q: 'Bu kod ne yazdırır?',
        code: 'def alt():\n    yield 1\n    yield 2\n    return "bitti"\n\ndef ust():\n    sonuc = yield from alt()\n    yield sonuc\n\nprint(list(ust()))\n',
        o: ['[1, 2]', '[1, 2, \'bitti\']', '[\'bitti\']', '[1, 2, None]'],
        a: 1,
        why: 'yield from alt üretecin tüm değerlerini dışarı aktarır; alt üreteç return ile bitince dönen değer yield from ifadesinin sonucu olur ve ust onu ayrıca yield eder.' },
      { t: 'predict',
        stage: 'Kodu oku',
        q: 'Bu kod ne yazdırır?',
        code: 'it = iter(["TR01", "TR02"])\nprint(next(it), next(it), next(it, "YOK"), next(it, None))\n',
        o: ['TR01 TR02 YOK None', 'TR01 TR02 YOK YOK', 'StopIteration', 'TR01 TR02 None None'],
        a: 0,
        why: 'next(it, varsayilan) yineleyici tükenince StopIteration yerine varsayılanı döndürür. Her çağrı kendi varsayılanını kullanır: önce "YOK", sonra None.' },
      { t: 'order',
        stage: 'Kodu oku',
        q: '<p>Log satırlarından geçerli tutarları süzüp toplayan üreteç boru hattının satırlarını sırala.</p>',
        lines: [
          'LOG = ["havale 1500", "bozuk", "eft 300", "havale x"]',
          'def tutarlar(satirlar):',
          '    for s in satirlar:',
          '        parca = s.split()',
          '        if len(parca) == 2 and parca[1].isdigit():',
          '            yield int(parca[1])',
          'print(sum(tutarlar(LOG)))'
        ],
        expect: '1800\n',
        hint: 'Veri, sonra üreteç fonksiyonu (döngü → böl → denetle → yield), en sonda tüketici.',
        why: 'Üreteç fonksiyonu yalnız geçerli tutarları akıtır; sum onları tek tek tüketir. Hiçbir ara liste oluşmaz.' },
      { t: 'code',
        id: 'iteratorler-uretecler-x1',
        stage: 'Rehberli',
        diff: 2,
        q: '<p><code>parcalar(yinelenebilir, n)</code> üreteç fonksiyonunu yaz: veriyi <code>n</code>\'er elemanlık <b>listeler</b> hâlinde yield etsin; son parça kısa olabilir. Her türlü yinelenebilirle (liste, range, üreteç, hatta sonsuz üreteç) çalışmalı ve <b>tembel</b> olmalı. <code>n &lt; 1</code> ise <code>ValueError</code> fırlat. (itertools.batched kullanma; islice serbest.)</p>',
        guide: [
          'n < 1 kontrolünü yap ve ValueError fırlat.',
          'Konumu tutacak tek bir yineleyici oluştur: it = iter(yinelenebilir).',
          'Döngüde list(islice(it, n)) ile sıradaki parçayı al.',
          'Parça boşsa dur; değilse yield et (walrus ile while koşulunda yazabilirsin).'
        ],
        example: 'from itertools import islice\nit = iter("ABCDEFG")\nprint(list(islice(it, 3)))   # ABC\nprint(list(islice(it, 3)))   # DEF: aynı yineleyici kaldığı yerden devam eder\nprint(list(islice(it, 3)))   # G\nprint(list(islice(it, 3)))   # [] → bitti\n',
        start: 'from itertools import islice\n\ndef parcalar(yinelenebilir, n):\n    # TODO: n < 1 ise ValueError\n    # TODO: it = iter(yinelenebilir)\n    # TODO: while parca := list(islice(it, n)): yield parca\n    return []\n',
        sol: 'from itertools import islice\n\ndef parcalar(yinelenebilir, n):\n    if n < 1:\n        raise ValueError("n en az 1 olmalı")\n    it = iter(yinelenebilir)\n    while parca := list(islice(it, n)):\n        yield parca\n',
        tests: 'import itertools, types\nassert list(parcalar([1, 2, 3, 4, 5, 6, 7], 3)) == [[1, 2, 3], [4, 5, 6], [7]], "Son parça kısa olabilir"\nassert list(parcalar(range(4), 2)) == [[0, 1], [2, 3]]\nassert list(parcalar([], 5)) == [], "Boş veri → hiç parça yok"\ng = parcalar(itertools.count(1), 2)\nassert isinstance(g, types.GeneratorType), "parcalar bir üreteç fonksiyonu olmalı (yield)"\nassert next(g) == [1, 2] and next(g) == [3, 4], "Sonsuz akışta da tembel çalışmalı"\nassert list(parcalar((x for x in "abc"), 2)) == [["a", "b"], ["c"]], "Üreteç girdiyle de çalışmalı"\ntry:\n    list(parcalar([1], 0))\n    assert False, "n=0 için ValueError bekleniyordu"\nexcept ValueError:\n    pass\n',
        hints: [
          'islice(liste, n) her seferinde baştan başlar; konumu tutan tek bir yineleyici gerekir.',
          'while parca := list(islice(it, n)): boş liste False sayılır ve döngü biter.',
          'Not: ValueError ancak üreteç gezilmeye başlanınca fırlar (gövde ilk next\'te çalışır).'
        ],
        why: 'Tek bir yineleyici üzerinde art arda islice, akışı kaldığı yerden böler. Üreteç fonksiyonu olduğu için sonsuz akışta bile yalnız istenen parça hesaplanır.' },
      { t: 'code',
        id: 'iteratorler-uretecler-x2',
        stage: 'Rehberli',
        diff: 2,
        q: '<p><code>HesapDefteri</code> sınıfını yaz: <code>HesapDefteri(hareketler)</code> ile kurulsun (<code>hareketler</code>: <code>(hesap, tutar)</code> demetleri, herhangi bir yinelenebilir; üreteç de olabilir). Nesne for ile gezildiğinde yalnız <b>tutarı 0\'dan farklı</b> hareketleri versin ve <b>her gezintide baştan başlasın</b>. <code>len(defter)</code> geçerli hareket sayısını döndürsün.</p>',
        guide: [
          '__init__ içinde gelen veriyi list() ile sakla: üreteç gelirse bir kez tükenir.',
          '__iter__ metodunu üreteç fonksiyonu olarak yaz: döngü + if + yield.',
          '__next__ yazma; her __iter__ çağrısı yeni bir üreteç döndürür.',
          '__len__ içinde sum(1 for _ in self) kullanabilirsin.'
        ],
        example: 'class Raf:\n    def __init__(self, urunler):\n        self._urunler = list(urunler)\n    def __iter__(self):\n        for u in self._urunler:\n            if u:\n                yield u.upper()\n\nr = Raf(u for u in ["kablo", "", "mouse"])\nprint(list(r), list(r))\n',
        start: 'class HesapDefteri:\n    def __init__(self, hareketler):\n        self._hareketler = hareketler      # TODO: üreteç gelirse tükenir!\n\n    def __iter__(self):\n        # TODO: tutarı 0 olmayanları yield et\n        return iter(self._hareketler)\n\n    def __len__(self):\n        # TODO: geçerli hareket sayısı\n        return 0\n',
        sol: 'class HesapDefteri:\n    def __init__(self, hareketler):\n        self._hareketler = list(hareketler)\n\n    def __iter__(self):\n        for hesap, tutar in self._hareketler:\n            if tutar != 0:\n                yield hesap, tutar\n\n    def __len__(self):\n        return sum(1 for _ in self)\n',
        tests: 'd = HesapDefteri((h for h in [("TR01", 500), ("TR02", 0), ("TR01", -120), ("TR03", 0.0)]))\nassert list(d) == [("TR01", 500), ("TR01", -120)], "Yalnız tutarı 0 olmayanlar: " + str(list(d))\nassert list(d) == [("TR01", 500), ("TR01", -120)], "İkinci gezintide de aynı sonuç gelmeli (üreteç girdiyi list ile sakla)"\nassert len(d) == 2, "len geçerli hareket sayısı olmalı"\nassert sum(t for _, t in d) == 380\ni1, i2 = iter(d), iter(d)\nnext(i1)\nassert next(i2) == ("TR01", 500), "Her iter çağrısı bağımsız, baştan başlayan bir yineleyici vermeli"\n',
        hints: [
          'Girdiyi list() ile kopyala ki üreteç de verilse tekrar gezilebilsin.',
          '__iter__ içinde yield kullanırsan Python her çağrıda yeni bir üreteç nesnesi üretir.',
          'for hesap, tutar in self._hareketler: if tutar != 0: yield hesap, tutar'
        ],
        why: '__iter__\'i üreteç fonksiyonu yapmak, "tekrar gezilebilir koleksiyon" yazmanın en kısa ve doğru yoludur: konum bilgisi nesnede değil, her döngünün kendi üretecinde tutulur.' },
      { t: 'code',
        id: 'iteratorler-uretecler-x3',
        stage: 'Rehberli',
        diff: 2,
        q: '<p>Üç aşamalı bir boru hattı kur. Her aşama <b>üreteç fonksiyonu</b> olsun:</p><ul><li><code>temiz_satirlar(satirlar)</code>: boşlukları kırp, boş satırları ve <code>#</code> ile başlayanları atla.</li><li><code>kayitlar(satirlar)</code>: <code>"hesap;tutar"</code> satırlarını <code>(hesap, float(tutar))</code> yap; ayrıştırılamayanları (alan sayısı 2 değil ya da tutar sayı değil) sessizce atla.</li><li><code>esik_ustu(kayitlar, esik)</code>: tutarı esik\'ten büyük veya eşit olanları geçir.</li></ul>',
        guide: [
          'Her fonksiyon bir yinelenebilir alır ve for + yield ile bir sonraki aşamaya akıtır.',
          'temiz_satirlar: s = s.strip(); boşsa ya da "#" ile başlıyorsa continue.',
          'kayitlar: try içinde split(";") ile ikiye aç ve float\'a çevir; ValueError\'da continue.',
          'esik_ustu: koşulu sağlayanı yield et.'
        ],
        example: 'def buyuk_harf(akis):\n    for s in akis:\n        yield s.upper()\n\ndef uzunlar(akis, n):\n    for s in akis:\n        if len(s) >= n:\n            yield s\n\nprint(list(uzunlar(buyuk_harf(["ab", "abcd", "xyz"]), 3)))\n',
        start: 'def temiz_satirlar(satirlar):\n    for s in satirlar:\n        # TODO: kırp, boş/yorum satırını atla, yield\n        pass\n\ndef kayitlar(satirlar):\n    for s in satirlar:\n        # TODO: "hesap;tutar" → (hesap, float); hatalıyı atla\n        pass\n\ndef esik_ustu(kayitlar, esik):\n    for k in kayitlar:\n        # TODO: tutar >= esik ise yield\n        pass\n',
        sol: 'def temiz_satirlar(satirlar):\n    for s in satirlar:\n        s = s.strip()\n        if not s or s.startswith("#"):\n            continue\n        yield s\n\ndef kayitlar(satirlar):\n    for s in satirlar:\n        try:\n            hesap, tutar = s.split(";")\n            yield hesap, float(tutar)\n        except ValueError:\n            continue\n\ndef esik_ustu(kayitlar, esik):\n    for k in kayitlar:\n        if k[1] >= esik:\n            yield k\n',
        tests: 'import types\nHAM = ["# gün sonu", "TR01;1500", "", "  TR02;250.5 ", "bozuk", "TR03;abc", "TR04;9000", "TR05;1000;x"]\nhat = esik_ustu(kayitlar(temiz_satirlar(HAM)), 1000)\nassert isinstance(hat, types.GeneratorType), "esik_ustu üreteç olmalı"\nassert isinstance(temiz_satirlar([]), types.GeneratorType) and isinstance(kayitlar([]), types.GeneratorType), "Tüm aşamalar üreteç olmalı"\nassert list(hat) == [("TR01", 1500.0), ("TR04", 9000.0)], "Boru hattı sonucu yanlış"\nassert list(kayitlar(temiz_satirlar(HAM))) == [("TR01", 1500.0), ("TR02", 250.5), ("TR04", 9000.0)], "Ayrıştırma aşaması: bozuk satırlar atlanmalı"\n_okunan = []\ndef _izle(liste):\n    for x in liste:\n        _okunan.append(x)\n        yield x\ng = esik_ustu(kayitlar(temiz_satirlar(_izle(HAM))), 1000)\nnext(g)\nassert len(_okunan) == 2, "Tembel olmalı: ilk sonuç için yalnız ilk 2 satır okunmalı, okunan: " + str(len(_okunan))\n',
        hints: [
          'Her aşamada return ya da liste yok; yalnız yield.',
          'Alan sayısı yanlışsa çoklu atama, tutar sayı değilse float aynı türde hata verir: ValueError.',
          'kayitlar: try: hesap, tutar = s.split(";"); yield hesap, float(tutar) / except ValueError: continue'
        ],
        why: 'Her aşama tek iş yapar ve bir sonrakine tek tek akıtır. Sonuç ilk istendiğinde yalnız gereken kadar satır okunur; bu, gigabaytlık dosyalarda sabit bellek kullanımı demektir.' },
      { t: 'code',
        id: 'iteratorler-uretecler-x4',
        stage: 'Kendin yaz',
        diff: 2,
        q: '<p><code>kayan_ortalama(sayilar, n)</code> üreteç fonksiyonu: her yeni sayı geldiğinde <b>son n</b> sayının ortalamasını (2 ondalık) yield etsin; ilk n-1 sayıda henüz pencere dolmadığı için bir şey üretmesin. Herhangi bir yinelenebilirle çalışsın ve tüm veriyi belleğe almasın (<code>collections.deque(maxlen=n)</code> kullanabilirsin).</p>',
        sol: 'from collections import deque\n\ndef kayan_ortalama(sayilar, n):\n    pencere = deque(maxlen=n)\n    for x in sayilar:\n        pencere.append(x)\n        if len(pencere) == n:\n            yield round(sum(pencere) / n, 2)\n',
        tests: 'import itertools\nassert list(kayan_ortalama([10, 20, 30, 40, 50], 3)) == [20.0, 30.0, 40.0], "3\'lü pencere ortalamaları"\nassert list(kayan_ortalama([5, 7], 3)) == [], "Pencere hiç dolmazsa boş"\nassert list(kayan_ortalama([1, 2, 4], 1)) == [1.0, 2.0, 4.0]\nassert list(kayan_ortalama([1, 2, 2], 2)) == [1.5, 2.0]\ng = kayan_ortalama(itertools.count(1), 2)\nassert [next(g) for _ in range(3)] == [1.5, 2.5, 3.5], "Sonsuz akışta da çalışmalı (tembel)"\n',
        hints: ['deque(maxlen=n) dolunca en eskiyi kendisi atar.', 'Pencere dolunca (len == n) ortalamayı yield et.'],
        why: 'Sabit boyutlu pencere, akış ne kadar uzun olursa olsun yalnız n sayı tutar. Günlük ciro grafiğindeki 7 günlük ortalama çizgisi tam olarak budur.' },
      { t: 'code',
        id: 'iteratorler-uretecler-x5',
        stage: 'Kendin yaz',
        diff: 2,
        q: '<p><code>tekil(yinelenebilir, anahtar=None)</code> üreteç fonksiyonu: elemanları sırayı koruyarak, <b>ilk görüldükleri hâliyle</b> ve yalnız bir kez yield etsin. <code>anahtar</code> verilirse tekrar kontrolü <code>anahtar(eleman)</code> sonucuna göre yapılsın (ör. büyük/küçük harf duyarsız e-posta). Sonsuz akışta da çalışmalı.</p>',
        sol: 'def tekil(yinelenebilir, anahtar=None):\n    gorulen = set()\n    for x in yinelenebilir:\n        k = anahtar(x) if anahtar else x\n        if k not in gorulen:\n            gorulen.add(k)\n            yield x\n',
        tests: 'import itertools\nassert list(tekil([3, 1, 3, 2, 1])) == [3, 1, 2], "Sıra korunmalı, ilk görülen kalmalı"\nep = ["Ayse@x.com", "can@x.com", "ayse@X.com", "CAN@x.com", "elif@x.com"]\nassert list(tekil(ep, anahtar=str.lower)) == ["Ayse@x.com", "can@x.com", "elif@x.com"], "anahtar ile karşılaştırma, ilk hâli korunur"\ng = tekil(x % 5 for x in itertools.count())\nassert list(itertools.islice(g, 5)) == [0, 1, 2, 3, 4], "Sonsuz akışta tembel çalışmalı"\nassert list(tekil([])) == []\n',
        hints: ['Görülenleri bir kümede tut; kontrolü anahtar değeri üzerinden yap ama yield ederken orijinal elemanı ver.', 'k = anahtar(x) if anahtar else x'],
        why: 'set(liste) sırayı bozar ve sonsuz akışta çalışmaz. Görülen anahtarlar kümesiyle tek geçişli üreteç, hem sırayı korur hem de tembeldir.' },
      { t: 'code',
        id: 'iteratorler-uretecler-x6',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 1,
        q: '<p><b>Hatayı bul ve düzelt.</b> <code>supheli_hesaplar(hareketler, esik)</code> üreteci, tutarı esiği aşan <b>tüm</b> hareketlerin hesap kodunu sırayla vermeli. Ama yalnızca ilkini veriyor, üstelik üreteç değil.</p>',
        start: 'def supheli_hesaplar(hareketler, esik):\n    for hesap, tutar in hareketler:\n        if tutar > esik:\n            return hesap\n',
        sol: 'def supheli_hesaplar(hareketler, esik):\n    for hesap, tutar in hareketler:\n        if tutar > esik:\n            yield hesap\n',
        tests: 'import types\nH = [("TR01", 500), ("TR02", 15000), ("TR03", 200), ("TR04", 22000)]\ng = supheli_hesaplar(H, 10000)\nassert isinstance(g, types.GeneratorType), "Fonksiyon üreteç olmalı"\nassert list(g) == ["TR02", "TR04"], "Esiği aşan tüm hesaplar gelmeli"\nassert list(supheli_hesaplar([], 1)) == []\n',
        hints: ['return fonksiyonu ilk eşleşmede bitirir.', 'Değer üretip devam etmek için yield kullan.'],
        why: 'return tek bir değer döndürür ve fonksiyonu bitirir; yield değeri verir ve kaldığı yerden devam eder. Gövdede yield olması fonksiyonu üreteç fonksiyonu yapar.' },
      { t: 'code',
        id: 'iteratorler-uretecler-x7',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 2,
        q: '<p><b>Hatayı bul ve düzelt.</b> <code>akis_ozeti(tutarlar)</code> herhangi bir yinelenebilir (üreteç dahil) alıp pozitif tutarların <code>(adet, toplam)</code> demetini döndürmeli. Veri çok büyük olabilir: <b>liste oluşturmadan tek geçişte</b> çöz. Şu an TypeError veriyor; len düzeltilse bile toplam yanlış çıkıyor.</p>',
        start: 'def akis_ozeti(tutarlar):\n    pozitif = (t for t in tutarlar if t > 0)\n    return len(pozitif), sum(pozitif)\n',
        sol: 'def akis_ozeti(tutarlar):\n    adet, toplam = 0, 0\n    for t in tutarlar:\n        if t > 0:\n            adet += 1\n            toplam += t\n    return adet, toplam\n',
        tests: 'assert akis_ozeti([100, -5, 250, 0, 50]) == (3, 400), "3 pozitif, toplam 400"\nassert akis_ozeti(x for x in [10, 20, -1]) == (2, 30), "Üreteç girdiyle de doğru çalışmalı (tek geçiş)"\nassert akis_ozeti([]) == (0, 0)\nimport ast as _ast\n_agac = _ast.parse(__source__)\nassert not any(isinstance(n, (_ast.ListComp, _ast.List)) for n in _ast.walk(_agac)) and "list(" not in __source__, "Liste oluşturmadan tek geçişte çöz"\n',
        hints: ['Üretecin uzunluğu yoktur (len TypeError) ve bir kez tüketilir: sum ile len aynı akışı paylaşamaz.', 'İki sayacı tek bir for döngüsünde birlikte güncelle.'],
        why: 'Tek geçiş zorunluluğu varsa (akış, büyük dosya) tüm istatistikleri aynı döngüde biriktirirsin. list() ile çözmek çalışır ama tüm veriyi belleğe alır.' },
      { t: 'code',
        id: 'iteratorler-uretecler-x8',
        stage: 'Meydan okuma',
        diff: 3,
        q: '<p><b>Sıralı akışları birleştir.</b> Her şube, işlem saatine göre <b>sıralı</b> bir akış gönderiyor. <code>sirali_birlestir(*akislar)</code> üreteç fonksiyonu, tüm akışları tek bir sıralı akış olarak versin. Kurallar:</p><ul><li>Akışlar sonsuz olabilir: hiçbirini listeye çevirme, <code>sorted</code> ya da <code>heapq</code> kullanma.</li><li>Her adımda her akıştan yalnız bir "sıradaki" eleman bekletebilirsin.</li><li>Eşit değerlerde önce verilen akışın elemanı önce gelsin.</li></ul>',
        sol: 'def sirali_birlestir(*akislar):\n    BOS = object()\n    its = [iter(a) for a in akislar]\n    basta = [next(it, BOS) for it in its]\n    while True:\n        secim = None\n        for i, deger in enumerate(basta):\n            if deger is not BOS and (secim is None or deger < basta[secim]):\n                secim = i\n        if secim is None:\n            return\n        yield basta[secim]\n        basta[secim] = next(its[secim], BOS)\n',
        tests: 'import itertools, types\nassert list(sirali_birlestir([1, 4, 9], [2, 3, 10], [5])) == [1, 2, 3, 4, 5, 9, 10]\nassert list(sirali_birlestir()) == [] and list(sirali_birlestir([], [])) == []\ng = sirali_birlestir(itertools.count(0, 3), itertools.count(1, 3), [2, 5])\nassert isinstance(g, types.GeneratorType), "Üreteç fonksiyonu olmalı"\nassert list(itertools.islice(g, 8)) == [0, 1, 2, 3, 4, 5, 6, 7], "Sonsuz akışlarla tembel çalışmalı"\nr = list(sirali_birlestir(iter([("09:00", "A"), ("09:05", "A")]), iter([("09:00", "B"), ("09:01", "B")])))\nassert r == [("09:00", "A"), ("09:00", "B"), ("09:01", "B"), ("09:05", "A")], "Eşitlikte ilk akış önce: " + str(r)\nassert "sorted" not in __source__ and "heapq" not in __source__, "sorted/heapq kullanma"\n',
        hints: [
          'Her akışın "baştaki" elemanını bir listede tut; next(it, BOS) ile tükenmeyi işaretle (BOS = object()).',
          'Her turda baştakiler arasından en küçüğünü bul (eşitlikte küçük indeks kazanır: yalnız kesin küçükse değiştir), yield et ve o akıştan bir sonrakini çek.',
          'Hiç dolu baş kalmadığında return ile bitir.'
        ],
        why: 'Bu, heapq.merge\'in ve dış sıralamanın (external sort) çekirdeğidir: her akıştan yalnız bir eleman bekletilir, bellek akış sayısıyla sınırlıdır. Ayrı bir BOS nesnesi, None gibi meşru değerlerle karışmayı önler.' }
    ],
    faq: [
      { q: 'Bir üretecin içindeki elemanları "önceden bakmak" (peek) için tüketmeden görebilir miyim?',
        a: 'Doğrudan hayır. Bir eleman next ile alıp sonra itertools.chain([eleman], it) ile geri "yapıştırabilirsin". Bir akışı iki ayrı tüketiciye vermek için itertools.tee var; ama tüketiciler çok farklı hızda ilerlerse tee aradaki her şeyi bellekte tutar.' },
      { q: 'itertools.batched yoksa (Python 3.11 ve öncesi) ne yaparım?',
        a: 'islice ile kendi parcalar fonksiyonunu yaz: tek bir it = iter(veri) oluştur ve while parca := list(islice(it, n)): yield parca. Bu derste Rehberli görevde tam olarak bunu yazdın.' }
    ],
    mistakes: [
      { bad: 'it = iter(kayitlar)\nwhile parca := list(islice(kayitlar, 100)):\n    yaz(parca)',
        good: 'it = iter(kayitlar)\nwhile parca := list(islice(it, 100)):\n    yaz(parca)',
        why: 'islice\'a liste verirsen her çağrı listenin başından başlar ve döngü hiç bitmez. Konumu tutan yineleyiciyi (it) vermelisin.' },
      { bad: 'class Defter:\n    def __init__(self, veri):\n        self.veri = veri   # üreteç gelebilir',
        good: 'class Defter:\n    def __init__(self, veri):\n        self.veri = list(veri)',
        why: 'Dışarıdan üreteç gelirse ilk gezintide tükenir; ikinci for döngüsü boş döner. Tekrar gezilecek veriyi kurucuda list() ile sakla.' }
    ]
  }
);
})(window);
