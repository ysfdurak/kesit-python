(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push(
{
    id: 'collections-itertools', lv: 'orta', mod: 'Standart Kütüphane', min: 30,
    title: 'collections ve itertools: hazır veri yapıları ve yineleme araçları',
    sum: 'Counter, defaultdict, deque, namedtuple ile veriyi daha az kodla tutar; chain, groupby, product, combinations, accumulate ve islice ile yinelemeyi tek geçişte kurarsın.',
    goals: [
      'Counter ile sayım ve en çok geçenleri tek satırda bulabilirim.',
      'defaultdict ile gruplama kodundaki "anahtar var mı" kontrolünü kaldırabilirim.',
      'deque ile sabit boyutlu son N kaydı ve iki uçtan hızlı kuyruğu kurabilirim.',
      'namedtuple ile okunur, hafif kayıt tipleri tanımlayabilirim.',
      'itertools fonksiyonlarıyla zincirleme, gruplama, kombinasyon ve kümülatif toplam üretebilirim.'
    ],
    body: `
<h2>Neden önemli?</h2>
<p>Anadolu Market'in raporlama ekibinde çalıştığını düşün. Her gün "hangi şehirden kaç sipariş geldi", "son 5 işlem neydi", "ürün çiftlerinin hangisi birlikte alınıyor" gibi sorular geliyor. Bunların hepsini sözlük ve for döngüsüyle yazabilirsin; ama Python'ın standart kütüphanesindeki <code>collections</code> ve <code>itertools</code> modülleri aynı işi daha kısa, daha hızlı ve daha az hatayla yapar. Bu ders, "elle yazdığın yardımcı kodun" yerine hazır ve test edilmiş araçları koymayı öğretir.</p>

<h2>collections modülü</h2>
<h3>Counter: sayım yapan sözlük</h3>
<p><code>Counter</code> (sayaç), bir yinelenebilirdeki (iterable) elemanları sayar ve <code>eleman: adet</code> sözlüğü üretir. En çok geçenleri <code>most_common(n)</code> ile alırsın; olmayan anahtar için hata değil <code>0</code> döner.</p>
<pre class="py">from collections import Counter

siparis_sehirleri = ["İstanbul", "Ankara", "İstanbul", "İzmir", "Ankara", "İstanbul", "Bursa"]
sayac = Counter(siparis_sehirleri)
print(sayac)
print("En çok 2 şehir:", sayac.most_common(2))
print("Adana siparişi:", sayac["Adana"])      # KeyError yok, 0 döner

# Counter'lar toplanabilir
dun = Counter({"İstanbul": 3, "Ankara": 1})
bugun = Counter({"İstanbul": 2, "İzmir": 4})
print("İki gün toplam:", dun + bugun)
print("Toplam sipariş:", sum(sayac.values()))</pre>

<h3>defaultdict: eksik anahtarı kendisi üreten sözlük</h3>
<p>Klasik gruplama kodunda <code>if sehir not in gruplar: gruplar[sehir] = []</code> satırı hep tekrar eder. <code>defaultdict(list)</code> bu satırı kaldırır: olmayan bir anahtara eriştiğinde fabrika fonksiyonunu (<code>list</code>, <code>int</code>, <code>set</code>...) çağırıp varsayılan değeri yerleştirir.</p>
<pre class="py">from collections import defaultdict

islemler = [
    ("TR01", 250.0), ("TR02", 80.0), ("TR01", 120.5), ("TR03", 999.0), ("TR02", 15.0),
]

hesap_toplam = defaultdict(float)
hesap_hareket = defaultdict(list)
for hesap, tutar in islemler:
    hesap_toplam[hesap] += tutar        # ilk erişimde 0.0 ile başlar
    hesap_hareket[hesap].append(tutar)  # ilk erişimde [] ile başlar

print(dict(hesap_toplam))
print(dict(hesap_hareket))
print("TR09 toplam:", hesap_toplam["TR09"])  # dikkat: erişim anahtarı OLUŞTURUR
print("Anahtarlar:", list(hesap_toplam))</pre>
<div class="warn"><b>Erişim yan etkisi</b>defaultdict'te bir anahtarı okumak bile onu oluşturur. Yalnızca "var mı?" diye bakmak istiyorsan <code>"TR09" in d</code> kullan ya da <code>d.get("TR09")</code> çağır; köşeli parantezle okuma.</div>

<h3>deque: iki uçlu kuyruk</h3>
<p>Listenin başından eleman çıkarmak (<code>pop(0)</code>) tüm elemanları kaydırdığı için yavaştır. <code>deque</code> (double-ended queue) iki uçtan da O(1) ekleme/çıkarma yapar. <code>maxlen</code> verirsen "son N kayıt" penceresi elde edersin: yeni eleman gelince en eski kendiliğinden düşer.</p>
<pre class="py">from collections import deque

son_islemler = deque(maxlen=3)
for tutar in [100, 250, 80, 999, 42]:
    son_islemler.append(tutar)
    print("Pencere:", list(son_islemler))

kuyruk = deque(["müşteri-1", "müşteri-2"])
kuyruk.append("müşteri-3")       # sağa ekle
kuyruk.appendleft("acil")        # sola ekle
print(kuyruk.popleft(), "işleme alındı")
print("Kalan:", list(kuyruk))
kuyruk.rotate(1)                 # döndür
print("Döndürülmüş:", list(kuyruk))</pre>

<h3>namedtuple: adlandırılmış demet</h3>
<p>Bir işlemi <code>("TR01", 250.0, "havale")</code> diye tutarsan üç ay sonra <code>islem[2]</code> ne demekti diye bakarsın. <code>namedtuple</code> demete alan adı verir: <code>islem.tur</code>. Değiştirilemez (immutable) ve hafiftir; sözlükten az yer kaplar. Daha fazla özellik (varsayılan değer, metot) istersen <code>dataclass</code> dersine dön.</p>
<pre class="py">from collections import namedtuple

Islem = namedtuple("Islem", ["hesap", "tutar", "tur"])
i1 = Islem("TR01", 250.0, "havale")
i2 = Islem(hesap="TR02", tutar=80.0, tur="kart")

print(i1.hesap, i1.tutar, i1.tur)
print(i1[0], "=", i1.hesap)              # indeksle de çalışır
hesap, tutar, tur = i2                   # paketten çıkarma
print(tutar)
print(i1._asdict())                      # sözlüğe çevir
print(i1._replace(tutar=300.0))          # yeni kopya (orijinal değişmez)</pre>

<div class="note"><b>OrderedDict notu</b>Python 3.7'den beri normal <code>dict</code> ekleme sırasını korur; bu yüzden <code>OrderedDict</code> çoğu kodda gerekmez. Hâlâ iki farkı var: eşitlik karşılaştırmasında sırayı dikkate alır ve <code>move_to_end()</code> metodu vardır (LRU önbellek gibi yapılarda kullanılır). Eski kodda görürsen şaşırma.</div>

<div class="tbl-wrap"><table>
<tr><th>Araç</th><th>Ne zaman</th><th>Yerine geçtiği elle yazılan kod</th></tr>
<tr><td>Counter</td><td>Sayım, en çok geçen</td><td>d[x] = d.get(x, 0) + 1</td></tr>
<tr><td>defaultdict</td><td>Gruplama, toplama</td><td>if k not in d: d[k] = []</td></tr>
<tr><td>deque</td><td>Kuyruk, son N kayıt</td><td>lst.pop(0), lst = lst[-N:]</td></tr>
<tr><td>namedtuple</td><td>Hafif, değişmez kayıt</td><td>t[0], t[1] ile indeks erişimi</td></tr>
<tr><td>ChainMap</td><td>Katmanlı ayar (varsayılan + kullanıcı)</td><td>{**varsayilan, **kullanici}</td></tr>
</table></div>

<h2>itertools modülü</h2>
<p><code>itertools</code> fonksiyonları tembel (lazy) çalışır: sonuç listesini bellekte kurmaz, istendikçe üretir. Bu yüzden büyük verilerle ve üreteçlerle (generator) iyi anlaşır. Sonucu görmek için <code>list()</code> ile sarman gerekir.</p>

<h3>chain ve islice</h3>
<p><code>chain(a, b)</code> birden çok yinelenebiliri tek akış gibi gezer; <code>chain.from_iterable</code> iç içe listeyi düzleştirir. <code>islice(it, start, stop, step)</code> ise üreteçlerde dilimleme yapar; listeye çevirmeden "ilk 3" almak için kullanılır.</p>
<pre class="py">from itertools import chain, islice, count

subat = ["S-101", "S-102"]
mart = ["S-201", "S-202", "S-203"]
print(list(chain(subat, mart)))
print(list(chain.from_iterable([subat, mart, ["S-301"]])))

# Sonsuz sayaçtan ilk 4 sipariş numarası
numaralar = (f"S-{n}" for n in count(1000))
print(list(islice(numaralar, 4)))
print(list(islice(mart, 1, None)))   # 1. indeksten sona</pre>

<h3>groupby: ardışık grupları ayırma</h3>
<p><code>groupby</code> SQL'deki GROUP BY'a benzer ama bir tuzağı var: yalnızca <b>ardışık</b> eşit anahtarları gruplar. Bu yüzden önce aynı anahtara göre <code>sorted()</code> yapmalısın. Grup nesnesi tembel bir yineleyicidir; bir kez tüketilir.</p>
<pre class="py">from itertools import groupby

siparisler = [
    {"sehir": "Ankara", "tutar": 120}, {"sehir": "İzmir", "tutar": 300},
    {"sehir": "Ankara", "tutar": 80},  {"sehir": "İstanbul", "tutar": 50},
]
anahtar = lambda s: s["sehir"]
for sehir, grup in groupby(sorted(siparisler, key=anahtar), key=anahtar):
    grup = list(grup)                      # tüketmeden önce listeye al
    print(sehir, len(grup), "sipariş, toplam", sum(s["tutar"] for s in grup))

# Sıralamadan: Ankara iki ayrı gruba bölünür!
print([k for k, _ in groupby(siparisler, key=anahtar)])</pre>

<h3>product, combinations, permutations</h3>
<pre class="py">from itertools import product, combinations, permutations

bedenler = ["S", "M"]
renkler = ["kırmızı", "siyah", "beyaz"]
print("Varyant sayısı:", len(list(product(bedenler, renkler))))
print(list(product(bedenler, renkler))[:3])

sepet = ["laptop", "mouse", "çanta", "kulaklık"]
print("İkili kombinasyon:", list(combinations(sepet, 2))[:4])   # sıra önemsiz
print("Sıralı ikili:", list(permutations(sepet[:3], 2)))        # sıra önemli
print("Kendisiyle çarpım:", list(product("01", repeat=2)))</pre>

<h3>accumulate: kümülatif değerler</h3>
<p><code>accumulate</code> birikimli toplam üretir; <code>func</code> ile başka işlem (örneğin <code>max</code>) verebilirsin. Banka bakiyesi, yılbaşından bugüne satış, tepe değer gibi raporlar için birebir.</p>
<pre class="py">from itertools import accumulate
import operator

hareketler = [1000, -250, 400, -1200, 300]
print("Bakiye:", list(accumulate(hareketler)))
print("Bakiye (başlangıç 500):", list(accumulate(hareketler, initial=500)))
print("Şimdiye kadarki tepe:", list(accumulate(hareketler, max)))
print("Çarpımsal:", list(accumulate([1.1, 1.2, 0.9], operator.mul)))</pre>

<div class="tip"><b>zip_longest ve pairwise</b><code>zip</code> en kısa listede durur; eşit olmayan uzunluklarda <code>itertools.zip_longest(a, b, fillvalue=None)</code> kullan. Ardışık çiftler (bugün-dün farkı gibi) için <code>itertools.pairwise(lst)</code> (3.10+) vardır: <code>[(1,2),(2,3),...]</code>.</div>

<h2>Birlikte kullanım: küçük bir rapor</h2>
<pre class="py">from collections import Counter, defaultdict, namedtuple
from itertools import accumulate

Satis = namedtuple("Satis", "gun kategori tutar")
veri = [
    Satis("Pzt", "elektronik", 1500), Satis("Pzt", "giyim", 300),
    Satis("Sal", "elektronik", 700),  Satis("Sal", "kitap", 120),
    Satis("Çar", "giyim", 450),
]
print("Kategori adedi:", Counter(s.kategori for s in veri))
gunluk = defaultdict(int)
for s in veri:
    gunluk[s.gun] += s.tutar
print("Günlük:", dict(gunluk))
print("Kümülatif:", list(accumulate(gunluk.values())))</pre>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>İş hayatında nerede karşına çıkar?</h3>
<p>Günlük (log) analizinde <code>Counter</code> ile en çok hata veren uç noktayı bulmak, <code>deque(maxlen=1000)</code> ile "son 1000 istek" üzerinden hareketli ortalama hesaplamak, <code>defaultdict(set)</code> ile "her müşteri hangi ürünleri aldı" tablosunu kurmak çok yaygın kalıplardır. Pazar sepeti (market basket) analizine giriş düzeyinde <code>combinations(sepet, 2)</code> ile ürün çiftlerini sayıp <code>Counter</code> ile birleştirince "birlikte alınan ürünler" raporu elde edersin.</p>
<p>Performans tarafında: <code>Counter</code> ve <code>defaultdict</code> C düzeyinde yazılmıştır; elle yazdığın <code>get</code> döngüsünden genelde hızlıdır. <code>itertools</code> tembel olduğu için milyonlarca satırı diske yazmadan akış halinde işleyebilirsin; pandas yüklemeden önce denenecek ilk araç budur. Ancak <code>groupby</code> için önce sıralama gerekir; sıralama O(n log n) olduğundan büyük veride tek <code>defaultdict</code> geçişi (O(n)) daha ucuza gelebilir. Aracı seçerken "sıralı sonuç mu, yoksa toplam mı istiyorum?" sorusunu sor.</p>
<p>Son bir not: <code>namedtuple</code> okunurluğu artırır ama değiştirilemez; kaydı güncellemek istiyorsan <code>_replace</code> yeni nesne döndürür. Mutasyon gerekiyorsa <code>@dataclass</code>; bellek kritikse <code>@dataclass(slots=True)</code> tercih et.</p>
</section>
`,
    ex: [
      { t: 'mc', q: 'Aşağıdakilerden hangisi <code>Counter(["a","b","a"])["z"]</code> ifadesinin sonucudur?',
        o: ['KeyError fırlatır', '0', 'None', '[]'], a: 1,
        why: 'Counter olmayan anahtar için 0 döndürür; sözlük gibi KeyError vermez. None ya da boş liste döndürmez.' },
      { t: 'mc', q: '<code>groupby</code> kullanmadan önce veriyi neden sıralamak gerekir?',
        o: ['Daha hızlı çalışması için', 'Yalnızca ardışık eşit anahtarları grupladığından', 'Anahtar fonksiyonu sıralı veri bekler', 'Sıralanmazsa hata fırlatır'], a: 1,
        why: 'groupby ardışık (yan yana) eşit anahtarları tek grup yapar; sırasız veride aynı anahtar birden çok gruba bölünür. Hata fırlatmaz, sessizce yanlış sonuç verir.' },
      { t: 'code', id: 'collections-itertools-1',
        q: '<p>Anadolu Market sipariş listesinden şehir bazlı sayım yapan <code>en_cok_sehirler(siparisler, n)</code> fonksiyonunu yaz. <code>siparisler</code>, her biri <code>{"sehir": ..., "tutar": ...}</code> olan sözlük listesidir. Fonksiyon en çok sipariş gelen <code>n</code> şehri <code>[(sehir, adet), ...]</code> biçiminde, adede göre azalan sırada döndürsün. <code>Counter</code> kullan.</p>',
        start: 'from collections import Counter\n\ndef en_cok_sehirler(siparisler, n):\n    # buraya yaz\n    pass\n',
        sol: 'from collections import Counter\n\ndef en_cok_sehirler(siparisler, n):\n    sayac = Counter(s["sehir"] for s in siparisler)\n    return sayac.most_common(n)\n',
        tests: 'veri = [{"sehir": "Ankara", "tutar": 1}, {"sehir": "İzmir", "tutar": 2}, {"sehir": "Ankara", "tutar": 3}, {"sehir": "Bursa", "tutar": 4}, {"sehir": "Ankara", "tutar": 5}, {"sehir": "İzmir", "tutar": 6}]\nassert en_cok_sehirler(veri, 1) == [("Ankara", 3)], "En çok 1 şehir Ankara (3) olmalı"\nassert en_cok_sehirler(veri, 2) == [("Ankara", 3), ("İzmir", 2)], "İlk iki şehir Ankara ve İzmir olmalı"\nassert en_cok_sehirler([], 3) == [], "Boş listede boş sonuç dönmeli"\n',
        hints: ['Counter bir üreteç ifadesi alabilir: Counter(s["sehir"] for s in siparisler).', 'most_common(n) zaten azalan sırada (sehir, adet) listesi döndürür.'],
        why: 'Counter sayımı yapar, most_common(n) en çok geçen n elemanı azalan sırada demet listesi olarak verir.' },
      { t: 'code', id: 'collections-itertools-2',
        q: '<p>Anadolu Bank işlemlerini hesaba göre gruplayan <code>hesaba_gore(islemler)</code> fonksiyonunu yaz. <code>islemler</code>, <code>(hesap_no, tutar)</code> demetlerinden oluşur. Dönüş değeri normal bir <code>dict</code> olsun: anahtar hesap numarası, değer o hesabın tutarlarının listesi (geliş sırasıyla). <code>defaultdict</code> kullan ve sonucu <code>dict()</code> ile çevir.</p>',
        start: 'from collections import defaultdict\n\ndef hesaba_gore(islemler):\n    # buraya yaz\n    pass\n',
        sol: 'from collections import defaultdict\n\ndef hesaba_gore(islemler):\n    gruplar = defaultdict(list)\n    for hesap, tutar in islemler:\n        gruplar[hesap].append(tutar)\n    return dict(gruplar)\n',
        tests: 'r = hesaba_gore([("TR01", 100), ("TR02", 50), ("TR01", 25)])\nassert r == {"TR01": [100, 25], "TR02": [50]}, "Gruplama yanlış: " + str(r)\nassert type(r) is dict, "Sonuç normal dict olmalı (defaultdict değil)"\nassert hesaba_gore([]) == {}, "Boş girdi için boş sözlük dönmeli"\n',
        hints: ['defaultdict(list) ile gruplar[hesap].append(tutar) doğrudan çalışır.', 'Dönüşte dict(gruplar) yazarak tipi normal sözlüğe çevir.'],
        why: 'defaultdict(list) ilk erişimde boş liste oluşturur; böylece "anahtar var mı" kontrolüne gerek kalmaz. dict() ile sarmak dış dünyaya sade bir sözlük verir.' },
      { t: 'code', id: 'collections-itertools-3',
        q: '<p>Hareketli pencere ortalaması hesaplayan <code>son_n_ortalama(degerler, n)</code> fonksiyonunu yaz. Fonksiyon <code>deque(maxlen=n)</code> kullanarak her adımda son <code>n</code> değerin ortalamasını hesaplasın ve tüm ortalamaları liste olarak döndürsün (ilk adımlarda pencere n\'den kısa olabilir; mevcut elemanların ortalamasını al). Sonuçları 2 basamağa yuvarla.</p>',
        start: 'from collections import deque\n\ndef son_n_ortalama(degerler, n):\n    # buraya yaz\n    pass\n',
        sol: 'from collections import deque\n\ndef son_n_ortalama(degerler, n):\n    pencere = deque(maxlen=n)\n    sonuc = []\n    for d in degerler:\n        pencere.append(d)\n        sonuc.append(round(sum(pencere) / len(pencere), 2))\n    return sonuc\n',
        tests: 'assert son_n_ortalama([10, 20, 30, 40], 2) == [10.0, 15.0, 25.0, 35.0], "Pencere 2 için ortalamalar yanlış"\nassert son_n_ortalama([3, 6, 9], 5) == [3.0, 4.5, 6.0], "Pencere veriden uzunsa tüm elemanların ortalaması alınmalı"\nassert son_n_ortalama([], 3) == [], "Boş girdi boş liste döndürmeli"\n',
        hints: ['deque(maxlen=n) dolunca en eski eleman kendiliğinden düşer.', 'Her append sonrası sum(pencere) / len(pencere) hesapla.'],
        why: 'maxlen verilen deque, pencereyi kendisi yönetir; sen yalnızca ekleyip ortalamayı hesaplarsın.' },
      { t: 'code', id: 'collections-itertools-4',
        q: '<p>Sepet analizi: <code>birlikte_alinan(sepetler)</code> fonksiyonu, her biri ürün adlarından oluşan liste olan <code>sepetler</code> için, birlikte alınan ürün çiftlerini saysın. Her sepet içindeki ürünleri önce <code>sorted()</code> ile sırala, sonra <code>itertools.combinations(..., 2)</code> ile çiftleri üret ve <code>Counter</code> ile say. Sonuç <code>Counter</code> (ya da dict) olsun; anahtarlar <code>(urun1, urun2)</code> demetleri.</p>',
        start: 'from collections import Counter\nfrom itertools import combinations\n\ndef birlikte_alinan(sepetler):\n    # buraya yaz\n    pass\n',
        sol: 'from collections import Counter\nfrom itertools import combinations\n\ndef birlikte_alinan(sepetler):\n    sayac = Counter()\n    for sepet in sepetler:\n        for cift in combinations(sorted(sepet), 2):\n            sayac[cift] += 1\n    return sayac\n',
        tests: 'sepetler = [["mouse", "laptop"], ["laptop", "mouse", "çanta"], ["çanta", "kitap"]]\nr = birlikte_alinan(sepetler)\nassert r[("laptop", "mouse")] == 2, "laptop-mouse çifti 2 kez geçmeli"\nassert r[("laptop", "çanta")] == 1, "laptop-çanta 1 kez geçmeli"\nassert r[("kitap", "çanta")] == 1, "kitap-çanta 1 kez geçmeli"\nassert ("mouse", "laptop") not in r, "Çiftler sıralı olmalı: (laptop, mouse)"\nassert sum(r.values()) == 5, "Toplam çift sayısı 5 olmalı"\n',
        hints: ['combinations(sorted(sepet), 2) her sepet için sıralı ikilileri üretir.', 'Counter() boş başlat; sayac[cift] += 1 ile artır. Ya da Counter(chain.from_iterable(...)).'],
        why: 'Sıralama sayesinde (a, b) ve (b, a) aynı anahtara düşer; combinations sırayı önemsemeyen çiftleri üretir, Counter sayar.' },
      { t: 'code', id: 'collections-itertools-5',
        q: '<p>Anadolu Bank hesap özeti: <code>bakiye_gecmisi(baslangic, hareketler)</code> fonksiyonu başlangıç bakiyesi ve hareket listesinden (pozitif yatırma, negatif çekme) her hareket sonrası bakiyeyi liste olarak döndürsün. <code>itertools.accumulate</code> ve <code>initial</code> parametresini kullan; başlangıç değerinin kendisi listede OLMASIN.</p>',
        start: 'from itertools import accumulate\n\ndef bakiye_gecmisi(baslangic, hareketler):\n    # buraya yaz\n    pass\n',
        sol: 'from itertools import accumulate\n\ndef bakiye_gecmisi(baslangic, hareketler):\n    return list(accumulate(hareketler, initial=baslangic))[1:]\n',
        tests: 'assert bakiye_gecmisi(500, [100, -50, -200]) == [600, 550, 350], "Bakiye geçmişi yanlış"\nassert bakiye_gecmisi(0, []) == [], "Hareket yoksa boş liste dönmeli"\nassert bakiye_gecmisi(1000, [-1000]) == [0], "Tek hareket doğru hesaplanmalı"\n',
        hints: ['accumulate(hareketler, initial=baslangic) ilk eleman olarak başlangıcı da üretir.', 'Listeye çevirip [1:] ile ilk elemanı at.'],
        why: 'initial parametresi birikimin başlangıç noktasını verir; ilk üretilen eleman başlangıcın kendisi olduğu için dilimle atılır.' },
      { t: 'mc', q: 'Bir listeden sürekli olarak baştan eleman çıkarıp sona ekleyeceksen hangi yapı en uygundur?',
        o: ['list', 'tuple', 'deque', 'set'], a: 2,
        why: 'deque iki uçtan O(1) ekleme/çıkarma yapar; list.pop(0) tüm elemanları kaydırır. tuple değişmez, set sıra tutmaz.' }
    ],
    faq: [
      { q: 'Counter ile dict.get(x, 0) + 1 arasında gerçek fark var mı?', a: 'Sonuç aynıdır ama Counter daha kısa, okunur ve most_common, toplama/çıkarma gibi ek yetenekler sunar. Ayrıca olmayan anahtarda 0 döndürmesi raporlama kodunu sadeleştirir.' },
      { q: 'defaultdict JSON\'a çevrilirken sorun çıkarır mı?', a: 'Hayır, json.dumps defaultdict\'i normal sözlük gibi yazar. Yine de fonksiyonlardan dışarı verirken dict() ile çevirmek, çağıranın yanlışlıkla anahtar oluşturmasını engeller.' },
      { q: 'itertools sonuçlarını neden list() ile sarmam gerekiyor?', a: 'itertools fonksiyonları tembel yineleyici döndürür; print ettiğinde nesne adresini görürsün. Elemanları görmek ya da birden çok kez gezmek için list() ile somutlaştır.' },
      { q: 'namedtuple mı dataclass mı?', a: 'Değişmez, çok sayıda ve küçük kayıt için namedtuple hafiftir. Varsayılan değer, metot, değiştirilebilirlik ve tip ipucu istiyorsan dataclass daha uygundur.' }
    ],
    mistakes: [
      { bad: 'for k, g in groupby(veri, key=f):\n    ...', good: 'for k, g in groupby(sorted(veri, key=f), key=f):\n    ...', why: 'groupby yalnızca ardışık eşit anahtarları gruplar; sırasız veride aynı anahtar parçalanır.' },
      { bad: 'd = defaultdict(list)\nif d["x"]:\n    ...', good: 'd = defaultdict(list)\nif "x" in d:\n    ...', why: 'Köşeli parantezle okumak anahtarı oluşturur; "var mı" kontrolü için in kullan.' },
      { bad: 'ciftler = combinations(sepet, 2)\nprint(len(ciftler))', good: 'ciftler = list(combinations(sepet, 2))\nprint(len(ciftler))', why: 'itertools yineleyicilerinin len() yoktur; önce listeye çevir ya da sum(1 for _ in ...) kullan.' },
      { bad: 'son = lst[-3:]\nlst.pop(0)', good: 'son = deque(maxlen=3)\nson.append(x)', why: 'Sabit boyutlu pencere için deque(maxlen) hem daha hızlı hem de kendi kendini yönetir.' }
    ]
  }
);
})(window);
