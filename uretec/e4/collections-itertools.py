html = f'''
<h2>Derinleş: sayaç aritmetiği, katmanlı ayarlar ve itertools'un geri kalanı</h2>
<p>Counter, defaultdict, deque ve temel itertools fonksiyonlarını tanıdın. Bu bölümde iş hayatında sık kullanılıp derslerde az anlatılan parçaları ekliyoruz: Counter ile stok farkı çıkarmak, iç içe defaultdict, <code>ChainMap</code> ile katmanlı ayarlar, namedtuple'ın yardımcı metotları ve <code>pairwise</code>, <code>batched</code>, <code>zip_longest</code>, <code>takewhile</code> gibi araçlar. Öncelik kuyruğu (<code>heapq</code>) "Veri yapıları", <code>reduce</code> ve <code>partial</code> "Fonksiyonel programlama" dersinde.</p>

<h3>1. Counter aritmetiği: stok sayımı farkı</h3>
<p>Counter'lar birer çoklu küme (multiset) gibi davranır. <code>+</code> toplar, <code>-</code> çıkarır ve <b>sıfır ya da negatif sonuçları atar</b>; <code>&amp;</code> ortak en küçük, <code>|</code> en büyük adetleri verir. Negatifleri korumak istersen yerinde çalışan <code>subtract()</code> kullanırsın. <code>total()</code> (3.10+) tüm adetlerin toplamıdır.</p>
{py("""
from collections import Counter

sistem = Counter({"koli": 40, "bant": 12, "etiket": 5})
sayim  = Counter({"koli": 37, "bant": 12, "etiket": 9, "makas": 1})

print("eksik:", sistem - sayim)        # sistemde olup rafta olmayan
print("fazla:", sayim - sistem)        # rafta olup sistemde olmayan
print("ortak:", sistem & sayim)
fark = Counter(sistem)
fark.subtract(sayim)                    # negatifler korunur
print("net  :", dict(fark))
print("toplam adet:", sayim.total(), "| çeşit:", len(sayim))
print(sorted(Counter("abaca").elements()))
""")}

<h3>2. İç içe defaultdict</h3>
<p>"Şehir → kategori → ciro" gibi iki seviyeli toplamalarda iç içe <code>if</code>'ler yerine <code>defaultdict(lambda: defaultdict(float))</code> yazarsın. Fabrika <b>çağrılabilir</b> olmalıdır; <code>defaultdict(defaultdict(float))</code> hatalıdır çünkü dış sözlüğe bir nesne verir, fabrika değil. JSON'a ya da teste vermeden önce düz <code>dict</code>'e çevir.</p>
{py("""
from collections import defaultdict

satislar = [("Ankara", "Elektronik", 1200.0), ("İzmir", "Gıda", 85.5),
            ("Ankara", "Gıda", 40.0), ("Ankara", "Elektronik", 300.0)]

ciro = defaultdict(lambda: defaultdict(float))
for sehir, kategori, tutar in satislar:
    ciro[sehir][kategori] += tutar

duz = {s: dict(k) for s, k in ciro.items()}
print(duz)
print(ciro["Bursa"]["Gıda"], "Bursa" in ciro)   # okumak bile anahtar oluşturur!
""")}

<h3>3. ChainMap: katmanlı ayarlar</h3>
<p>Bir uygulamanın ayarları genellikle üç katmandan gelir: kod içi varsayılanlar, ortam (sunucu) ayarları ve kullanıcının komut satırı seçenekleri. <code>ChainMap(kullanici, ortam, varsayilan)</code> bunları kopyalamadan tek sözlük gibi gösterir: okumada soldan sağa ilk bulunan kazanır, <b>yazma ve silme yalnız ilk sözlüğe</b> yapılır. Katmanlar sonradan değişirse ChainMap bunu anında yansıtır; <code>{{**a, **b}}</code> birleştirmesi ise bir kopyadır.</p>
{py("""
from collections import ChainMap

varsayilan = {"para_birimi": "TRY", "sayfa": 20, "dil": "tr"}
ortam      = {"sayfa": 50}
kullanici  = {"dil": "en"}

ayar = ChainMap(kullanici, ortam, varsayilan)
print(ayar["para_birimi"], ayar["sayfa"], ayar["dil"])
ayar["sayfa"] = 10                    # yalnız kullanici'ya yazılır
print(kullanici, ortam)
ortam["zaman_asimi"] = 30             # sonradan eklenen katman verisi görünür
print(ayar["zaman_asimi"], dict(ayar))
print([k for k in varsayilan if ayar[k] != varsayilan[k]])   # değişen ayarlar
""")}

<h3>4. namedtuple'ın yardımcıları</h3>
<p>namedtuple değiştirilemez; bir alanı "güncellemek" için <code>_replace(alan=...)</code> yeni bir kayıt döndürür. <code>_asdict()</code> sözlüğe, <code>_fields</code> alan adlarına, <code>_make(iterable)</code> tam alan sayısındaki bir diziden kayıt üretir (varsayılanları kullanmaz; eksik sütunlu satırda <code>Urun(*satir)</code> yaz). <code>defaults=</code> ile sondaki alanlara varsayılan verilir. Alt çizgi burada "özel" demek değildir; alan adlarıyla çakışmasın diye konmuştur.</p>
{py("""
from collections import namedtuple
import csv, io

Urun = namedtuple("Urun", ["sku", "ad", "fiyat", "stok"], defaults=[0])
metin = "K-1,Kulaklık,750\\nF-2,Fare,300\\n"
urunler = [Urun(*r) for r in csv.reader(io.StringIO(metin))]   # stok varsayılan 0
print(Urun._make(["M-3", "Monitör", "4200", "2"]))                 # _make: tüm alanlar
print(urunler[0])
zamli = [u._replace(fiyat=round(float(u.fiyat) * 1.1, 2)) for u in urunler]
print(zamli[1]._asdict(), Urun._fields)
""")}

<h3>5. itertools'un geri kalanı</h3>
<div class="tbl-wrap"><table>
<tr><th>Fonksiyon</th><th>Ne yapar</th><th>İş örneği</th></tr>
<tr><td><code>pairwise(x)</code> (3.10+)</td><td>Ardışık çiftler: (a,b), (b,c)...</td><td>Günlük değişim, iki olay arası süre</td></tr>
<tr><td><code>batched(x, n)</code> (3.12+)</td><td>n'lik demet parçaları</td><td>API'ye 100'erli gönderim</td></tr>
<tr><td><code>zip_longest(a, b, fillvalue=)</code></td><td>Kısa olanı doldurarak eşler</td><td>Eksik ayları 0 ile hizalamak</td></tr>
<tr><td><code>takewhile(p, x)</code> / <code>dropwhile(p, x)</code></td><td>Koşul bozulana kadar al / atla</td><td>Dosya başlığını atlamak</td></tr>
<tr><td><code>compress(x, maske)</code></td><td>Maskede doğru olanları seç</td><td>Onaylı kayıtları süzmek</td></tr>
<tr><td><code>starmap(f, demetler)</code></td><td><code>f(*demet)</code> uygular</td><td>(fiyat, adet) çiftlerinden tutar</td></tr>
<tr><td><code>cycle(x)</code></td><td>Sonsuz döngüyle tekrarlar</td><td>Vardiyaya sırayla personel atamak</td></tr>
</table></div>
{py("""
from itertools import pairwise, batched, zip_longest, takewhile, dropwhile, compress, starmap, cycle

kapanis = [100, 104, 101, 110]
print([b - a for a, b in pairwise(kapanis)])
print(list(batched(["S1", "S2", "S3", "S4", "S5"], 2)))
print(list(zip_longest(["Oca", "Şub", "Mar"], [120, 95], fillvalue=0)))
satirlar = ["# rapor", "# v2", "TR01;100", "# not", "TR02;50"]
print(list(dropwhile(lambda s: s.startswith("#"), satirlar)))
print(list(takewhile(lambda s: s.startswith("#"), satirlar)))
print(list(compress(["A", "B", "C"], [True, False, True])))
print(list(starmap(lambda f, a: f * a, [(10.0, 3), (2.5, 4)])))
print(list(zip(["Pzt", "Sal", "Çar", "Per"], cycle(["Ayşe", "Can"]))))
""")}
<div class="warn"><b>Yineleyici tek kullanımlıktır</b><code>map</code>, <code>filter</code>, üreteçler ve itertools sonuçları bir kez tüketilir. Aynı sonucu iki kez dolaşacaksan önce <code>list()</code>'e çevir ya da <code>itertools.tee</code> kullan. İkinci <code>sum(...)</code>'ın sessizce 0 döndürmesi raporlarda en sinsi hatalardandır.</div>
<div class="tip"><b>batched yoksa</b>Python 3.11 ve öncesinde parçalamayı <code>islice</code> ile yaparsın: <code>it = iter(veri)</code>, sonra <code>while parca := list(islice(it, n)): ...</code>. Bu kalıp her sürümde çalışır.</div>

<div class="note"><b>Gerçek işte</b>Depo sayımlarında "sistem stoğu ile raf sayımı farkı" Counter aritmetiğiyle iki satırda çıkar; muhasebe mutabakatında (reconciliation) aynı fikir iki kaynaktaki kayıtları karşılaştırmaya uygulanır. Toplu API çağrılarında servisler genellikle istek başına kayıt sınırı koyar; <code>batched</code> ile parçalayıp her parçayı ayrı gönderirsin. CLI araçlarında ayarlar varsayılan → yapılandırma dosyası → ortam değişkeni → komut satırı katmanlarından gelir; <code>ChainMap</code> bu öncelik sırasını kodda açıkça gösterir.</div>
'''

EXT = {
 'id': 'collections-itertools', 'min': 30, 'html': html,
 'ex': [
  {'t': 'mc', 'stage': 'Isınma', 'q': '<code>Counter(a=3, b=1) - Counter(a=1, b=4)</code> ifadesinin sonucu nedir?',
   'o': ["Counter({'a': 2, 'b': -3})", "Counter({'a': 2})", "Counter({'b': 3})", 'TypeError verir'], 'a': 1,
   'why': '- operatörü sıfır ve negatif sonuçları atar: a için 2 kalır, b için -3 atılır. Negatifleri korumak için subtract() kullanılır.'},
  {'t': 'mc', 'stage': 'Isınma', 'q': '<code>ayar = ChainMap(kullanici, ortam, varsayilan)</code> sonrasında <code>ayar["dil"] = "en"</code> yazılırsa değer hangi sözlüğe yazılır?',
   'o': ['Anahtarın bulunduğu ilk sözlüğe', 'Her üç sözlüğe', 'Yalnız kullanici sözlüğüne', 'Yalnız varsayilan sözlüğüne'], 'a': 2,
   'why': 'ChainMap okumada tüm katmanlara bakar ama yazma ve silme yalnız ilk eşlemeye (maps[0]) yapılır. Alttaki katmanlar değişmez.'},
  {'t': 'predict', 'stage': 'Kodu oku', 'q': '<code>zip</code> ve <code>zip_longest</code> farkı: çıktı ne olur?',
   'code': 'from itertools import zip_longest\n\naylar = ["Oca", "Şub", "Mar"]\nciro = [120, 95]\nprint(list(zip(aylar, ciro)))\nprint(list(zip_longest(aylar, ciro, fillvalue=0)))\n',
   'o': ["[('Oca', 120), ('Şub', 95)]\n[('Oca', 120), ('Şub', 95), ('Mar', 0)]", "[('Oca', 120), ('Şub', 95), ('Mar', None)]\n[('Oca', 120), ('Şub', 95), ('Mar', 0)]", "[('Oca', 120), ('Şub', 95)]\n[('Oca', 120), ('Şub', 95), ('Mar', None)]", 'ValueError hatası verir'], 'a': 0,
   'why': 'zip en kısa dizide durur ve Mar\'ı atar. zip_longest en uzuna kadar gider, eksik değerleri fillvalue (0) ile doldurur.'},
  {'t': 'predict', 'stage': 'Kodu oku', 'q': '<code>takewhile</code> ve <code>dropwhile</code> çıktısı ne olur?',
   'code': 'from itertools import takewhile, dropwhile\n\nsicaklik = [3, 5, 8, 12, 7, 2]\nprint(list(takewhile(lambda t: t < 10, sicaklik)))\nprint(list(dropwhile(lambda t: t < 10, sicaklik)))\n',
   'o': ['[3, 5, 8, 7, 2]\n[12]', '[3, 5, 8]\n[12, 7, 2]', '[3, 5, 8]\n[12]', '[3, 5, 8, 7]\n[12, 2]'], 'a': 1,
   'why': 'takewhile koşul ilk bozulduğunda (12) durur; sonrasındaki 7 ve 2\'ye bakmaz. dropwhile koşul bozulana kadar atlar, sonra kalan HER ŞEYİ verir. filter\'dan farkı budur.'},
  {'t': 'predict', 'stage': 'Kodu oku', 'q': 'Yineleyici iki kez kullanılıyor. Çıktı ne olur?',
   'code': 'tutarlar = [120, -40, 300, -15]\npozitif = filter(lambda t: t > 0, tutarlar)\nprint(sum(pozitif), sum(pozitif))\n',
   'o': ['420 420', '420 0', '365 365', 'TypeError hatası verir'], 'a': 1,
   'why': 'filter tembel ve tek kullanımlık bir yineleyici döndürür. İlk sum onu tüketir (420), ikinci sum boş yineleyiciyle 0 bulur. İki kez kullanacaksan list(filter(...)) yaz.'},
  {'t': 'order', 'stage': 'Kodu oku', 'q': '<p>Müşteri kayıtlarını API\'ye ikişerli partiler hâlinde "gönderen" programın satırlarını sırala.</p>',
   'lines': ['from itertools import batched', 'kayitlar = ["M1", "M2", "M3", "M4", "M5"]', 'gonderilen = 0', 'for no, parti in enumerate(batched(kayitlar, 2), start=1):', '    gonderilen += len(parti)', '    print(no, list(parti))', 'print("toplam", gonderilen)'],
   'expect': "1 ['M1', 'M2']\n2 ['M3', 'M4']\n3 ['M5']\ntoplam 5\n", 'hint': 'İçe aktarma ve veriler önce; sayaç döngüden önce sıfırlanır; toplam döngüden sonra yazılır.',
   'why': 'batched son partiyi eksik bırakabilir (M5). Sayaç her partinin uzunluğu kadar artar.'},
  {'t': 'code', 'stage': 'Rehberli', 'id': 'collections-itertools-x1', 'diff': 2,
   'q': '<p>Depo sayım mutabakatı. <code>stok_farki(sistem, sayim)</code> iki sözlük alır (ürün → adet) ve <code>(eksik, fazla)</code> döndürür: <code>eksik</code> sistemde olup rafta daha az bulunanlar (ne kadar eksik), <code>fazla</code> rafta sistemdekinden çok olanlar. İkisi de düz <code>dict</code> olsun ve yalnız pozitif farkları içersin. <code>Counter</code> aritmetiği kullan.</p>',
   'guide': ['İki sözlüğü Counter\'a çevir.', 'eksik = sistem - sayim (negatifler kendiliğinden atılır).', 'fazla = sayim - sistem.', 'İkisini dict() ile çevirip demet olarak döndür.'],
   'example': 'from collections import Counter\n\ndun = Counter({"çay": 10, "şeker": 4})\nbugun = Counter({"çay": 7, "şeker": 6})\nprint(dict(dun - bugun), dict(bugun - dun))\n',
   'start': 'from collections import Counter\n\n\ndef stok_farki(sistem, sayim):\n    # TODO: Counter aritmetiği\n    eksik = {}\n    fazla = {}\n    return eksik, fazla\n',
   'sol': 'from collections import Counter\n\n\ndef stok_farki(sistem, sayim):\n    s, r = Counter(sistem), Counter(sayim)\n    return dict(s - r), dict(r - s)\n',
   'tests': 'e, f = stok_farki({"koli": 40, "bant": 12, "etiket": 5}, {"koli": 37, "bant": 12, "etiket": 9, "makas": 1})\nassert e == {"koli": 3}, "koli 3 eksik; eşit olan bant görünmemeli"\nassert f == {"etiket": 4, "makas": 1}, "etiket 4 fazla, makas sistemde yok"\nassert type(e) is dict and type(f) is dict, "düz dict döndürmeli"\nassert stok_farki({}, {}) == ({}, {}), "boş girdi"\nassert stok_farki({"a": 2}, {}) == ({"a": 2}, {}), "hiç sayılmayan ürün tamamen eksik"\n',
   'hints': ['Counter - Counter yalnız pozitif farkları bırakır.', 'Counter(sistem) - Counter(sayim) eksikleri verir.', 'return dict(s - r), dict(r - s)'],
   'why': 'Çoklu küme farkı mutabakatı iki satıra indirir; sıfır ve negatif farklar otomatik atılır.'},
  {'t': 'code', 'stage': 'Rehberli', 'id': 'collections-itertools-x2', 'diff': 2,
   'q': '<p>Katmanlı ayar. <code>ayar_yukle(varsayilan, ortam, kullanici)</code> bir <code>ChainMap</code> döndürsün (öncelik: kullanici &gt; ortam &gt; varsayilan). <code>kaynak(ayar, anahtar)</code> ise değerin hangi katmandan geldiğini <code>"kullanici"</code>, <code>"ortam"</code> ya da <code>"varsayilan"</code> olarak versin; hiçbirinde yoksa <code>KeyError</code>.</p>',
   'guide': ['from collections import ChainMap', 'ayar_yukle: return ChainMap(kullanici, ortam, varsayilan)', 'kaynak: ayar.maps listesini katman adlarıyla zip\'le.', 'Anahtarı içeren ilk katmanın adını döndür; döngü biterse raise KeyError(anahtar).'],
   'example': 'from collections import ChainMap\n\nc = ChainMap({"x": 1}, {"x": 2, "y": 3})\nprint(c.maps)\nfor i, m in enumerate(c.maps):\n    print(i, "y" in m)\n',
   'start': 'from collections import ChainMap\n\n\ndef ayar_yukle(varsayilan, ortam, kullanici):\n    # TODO: öncelik sırasına dikkat\n    return ChainMap(varsayilan, ortam, kullanici)\n\n\ndef kaynak(ayar, anahtar):\n    # TODO\n    pass\n',
   'sol': 'from collections import ChainMap\n\n\ndef ayar_yukle(varsayilan, ortam, kullanici):\n    return ChainMap(kullanici, ortam, varsayilan)\n\n\ndef kaynak(ayar, anahtar):\n    for ad, katman in zip(["kullanici", "ortam", "varsayilan"], ayar.maps):\n        if anahtar in katman:\n            return ad\n    raise KeyError(anahtar)\n',
   'tests': 'v = {"dil": "tr", "sayfa": 20, "birim": "TRY"}\no = {"sayfa": 50}\nk = {"dil": "en"}\na = ayar_yukle(v, o, k)\nassert isinstance(a, ChainMap), "ChainMap döndürmeli"\nassert (a["dil"], a["sayfa"], a["birim"]) == ("en", 50, "TRY"), "öncelik kullanici > ortam > varsayilan"\nassert [kaynak(a, x) for x in ("dil", "sayfa", "birim")] == ["kullanici", "ortam", "varsayilan"], "kaynak katman adını vermeli"\no["zaman"] = 30\nassert a["zaman"] == 30 and kaynak(a, "zaman") == "ortam", "katmandaki sonraki değişiklik görünmeli (kopya değil)"\na["sayfa"] = 5\nassert k["sayfa"] == 5 and o["sayfa"] == 50, "yazma yalnız kullanici katmanına gitmeli"\ntry:\n    kaynak(a, "yok")\n    assert False, "olmayan anahtar KeyError vermeli"\nexcept KeyError:\n    pass\n',
   'hints': ['ChainMap\'te soldaki sözlük en yüksek önceliklidir.', 'ayar.maps katmanları sırasıyla verir.', 'for ad, katman in zip([...], ayar.maps): if anahtar in katman: return ad'],
   'why': 'ChainMap kopyalamadan katmanları birleştirir; maps üzerinden hangi katmanın kazandığı izlenebilir.'},
  {'t': 'code', 'stage': 'Rehberli', 'id': 'collections-itertools-x3', 'diff': 2,
   'q': '<p>Ilgaz Bank döviz kuru analizi. <code>gunluk_degisim(kapanislar)</code> ardışık günler arasındaki farkları (<code>round(b - a, 2)</code>) liste olarak döndürsün. <code>en_buyuk_artis(gunler, kapanislar)</code> ise en büyük artışın gerçekleştiği <b>günün adını</b> (artışın vardığı gün) ve artışı <code>(gun, fark)</code> olarak döndürsün; hiç artış yoksa <code>None</code>. <code>itertools.pairwise</code> kullan.</p>',
   'guide': ['from itertools import pairwise', 'gunluk_degisim: [round(b - a, 2) for a, b in pairwise(kapanislar)]', 'en_buyuk_artis: farkları gunler[1:] ile zip\'le.', 'Pozitif olanlar arasından max(..., key=fark); yoksa None.'],
   'example': 'from itertools import pairwise\n\nsaatler = [9, 11, 12, 16]\nprint([b - a for a, b in pairwise(saatler)])\n',
   'start': 'from itertools import pairwise\n\n\ndef gunluk_degisim(kapanislar):\n    # TODO\n    return []\n\n\ndef en_buyuk_artis(gunler, kapanislar):\n    # TODO\n    return None\n',
   'sol': 'from itertools import pairwise\n\n\ndef gunluk_degisim(kapanislar):\n    return [round(b - a, 2) for a, b in pairwise(kapanislar)]\n\n\ndef en_buyuk_artis(gunler, kapanislar):\n    artislar = [(g, f) for g, f in zip(gunler[1:], gunluk_degisim(kapanislar)) if f > 0]\n    if not artislar:\n        return None\n    return max(artislar, key=lambda x: x[1])\n',
   'tests': 'k = [32.10, 32.45, 32.30, 32.95, 33.00]\ng = ["Pzt", "Sal", "Çar", "Per", "Cum"]\nassert gunluk_degisim(k) == [0.35, -0.15, 0.65, 0.05], "ardışık farklar 2 basamak"\nassert en_buyuk_artis(g, k) == ("Per", 0.65), "en büyük artış Perşembe 0.65"\nassert en_buyuk_artis(["a", "b", "c"], [3.0, 2.0, 1.0]) is None, "hiç artış yoksa None"\nassert gunluk_degisim([5.0]) == [], "tek değerde fark yok"\n',
   'hints': ['pairwise(x) (x0,x1), (x1,x2)... çiftlerini verir.', 'Fark i, gunler[i+1]\'e aittir: zip(gunler[1:], farklar).', 'max(artislar, key=lambda x: x[1])'],
   'why': 'pairwise indeks hesabı (i, i+1) yapmadan ardışık karşılaştırmayı okunur kılar.'},
  {'t': 'code', 'stage': 'Kendin yaz', 'id': 'collections-itertools-x4', 'diff': 2,
   'q': '<p><code>sehir_kategori_ciro(satislar)</code> yaz: <code>satislar</code> <code>(sehir, kategori, tutar)</code> demetleri listesi. Sonuç iç içe <b>düz</b> sözlük olsun: <code>{sehir: {kategori: toplam}}</code>, toplamlar <code>round(..., 2)</code>. İç içe <code>defaultdict</code> kullan.</p>',
   'sol': 'from collections import defaultdict\n\n\ndef sehir_kategori_ciro(satislar):\n    ciro = defaultdict(lambda: defaultdict(float))\n    for sehir, kategori, tutar in satislar:\n        ciro[sehir][kategori] += tutar\n    return {s: {k: round(t, 2) for k, t in ic.items()} for s, ic in ciro.items()}\n',
   'tests': 's = [("Ankara", "Elektronik", 1200.0), ("İzmir", "Gıda", 85.5), ("Ankara", "Gıda", 40.1), ("Ankara", "Elektronik", 300.0), ("İzmir", "Gıda", 14.6)]\nr = sehir_kategori_ciro(s)\nassert r == {"Ankara": {"Elektronik": 1500.0, "Gıda": 40.1}, "İzmir": {"Gıda": 100.1}}, "iki seviyeli toplamlar"\nassert type(r) is dict and all(type(v) is dict for v in r.values()), "dış ve iç sözlükler düz dict olmalı"\nassert sehir_kategori_ciro([]) == {}, "boş girdi"\n',
   'hints': ['Dış fabrika çağrılabilir olmalı: lambda: defaultdict(float).', 'ciro[sehir][kategori] += tutar', 'Dönüşte iki seviyeli dict comprehension ile düzleştir ve yuvarla.'],
   'why': 'İç içe defaultdict ara seviyelerin varlık kontrolünü kaldırır; çıkışta düz dict\'e çevirmek beklenmeyen anahtar oluşturmayı engeller.'},
  {'t': 'code', 'stage': 'Kendin yaz', 'id': 'collections-itertools-x5', 'diff': 2,
   'q': '<p>Her Python sürümünde çalışan parçalama. <code>partilere_bol(kayitlar, n)</code> herhangi bir yinelenebilir (liste ya da üreteç) alıp <code>n</code>\'lik <b>listeler</b> listesi döndürsün; son parti eksik kalabilir. <code>n</code> 1\'den küçükse <code>ValueError</code>. <code>itertools.islice</code> kullan (<code>batched</code> değil).</p>',
   'sol': 'from itertools import islice\n\n\ndef partilere_bol(kayitlar, n):\n    if n < 1:\n        raise ValueError("n en az 1 olmalı")\n    it = iter(kayitlar)\n    sonuc = []\n    while parca := list(islice(it, n)):\n        sonuc.append(parca)\n    return sonuc\n',
   'tests': 'assert partilere_bol([1, 2, 3, 4, 5], 2) == [[1, 2], [3, 4], [5]], "ikişerli, son parti eksik"\nassert partilere_bol((x for x in range(6)), 3) == [[0, 1, 2], [3, 4, 5]], "üreteçle de çalışmalı"\nassert partilere_bol([], 4) == [], "boş girdi boş liste"\ntry:\n    partilere_bol([1], 0)\n    assert False, "n=0 ValueError vermeli"\nexcept ValueError:\n    pass\nassert "batched" not in __source__, "bu görevde islice kullan"\n',
   'hints': ['Önce it = iter(kayitlar) ile tek bir yineleyici oluştur; yoksa listede hep baştan alırsın.', 'islice(it, n) her çağrıda kaldığı yerden n eleman alır.', 'while parca := list(islice(it, n)): sonuc.append(parca)'],
   'why': 'Tek yineleyici üzerinde tekrar tekrar islice çağırmak veriyi sırayla tüketir; boş liste döngüyü bitirir.'},
  {'t': 'code', 'stage': 'Hata avı', 'kind': 'bug', 'id': 'collections-itertools-x6', 'diff': 2,
   'q': '<p>Hatayı bul ve düzelt. <code>sehir_sayilari(siparisler)</code> her şehrin sipariş sayısını sözlük olarak vermeli. Ankara 3 sipariş olduğu hâlde sonuç 1 çıkıyor.</p>',
   'start': 'from itertools import groupby\n\n\ndef sehir_sayilari(siparisler):\n    sonuc = {}\n    for sehir, grup in groupby(siparisler, key=lambda s: s["sehir"]):\n        sonuc[sehir] = len(list(grup))\n    return sonuc\n',
   'sol': 'from itertools import groupby\n\n\ndef sehir_sayilari(siparisler):\n    anahtar = lambda s: s["sehir"]\n    sonuc = {}\n    for sehir, grup in groupby(sorted(siparisler, key=anahtar), key=anahtar):\n        sonuc[sehir] = len(list(grup))\n    return sonuc\n',
   'tests': 'sp = [{"sehir": "Ankara"}, {"sehir": "İzmir"}, {"sehir": "Ankara"}, {"sehir": "Bursa"}, {"sehir": "Ankara"}]\nassert sehir_sayilari(sp) == {"Ankara": 3, "İzmir": 1, "Bursa": 1}, "Ankara 3 olmalı: groupby yalnız ardışık eşitleri gruplar"\nassert sehir_sayilari([]) == {}, "boş girdi"\n',
   'hints': ['groupby yalnız ardışık eşit anahtarları birleştirir.', 'Ankara üç ayrı grup olarak geliyor ve sonuncusu öncekilerin üzerine yazıyor.', 'groupby(sorted(siparisler, key=anahtar), key=anahtar)'],
   'why': 'Sıralanmamış veride aynı şehir birden çok grup üretir ve sözlükte son grup kazanır. Önce aynı anahtarla sıralamak gerekir (ya da doğrudan Counter kullanılır).'},
  {'t': 'code', 'stage': 'Hata avı', 'kind': 'bug', 'id': 'collections-itertools-x7', 'diff': 2,
   'q': '<p>Hatayı bul ve düzelt. <code>zam_uygula(urunler, oran)</code> namedtuple ürünlerin fiyatını artırılmış <b>yeni</b> bir liste döndürmeli; orijinal liste değişmemeli. Kod <code>AttributeError: can\'t set attribute</code> veriyor.</p>',
   'start': 'from collections import namedtuple\n\nUrun = namedtuple("Urun", ["sku", "fiyat"])\n\n\ndef zam_uygula(urunler, oran):\n    for u in urunler:\n        u.fiyat = round(u.fiyat * (1 + oran), 2)\n    return urunler\n',
   'sol': 'from collections import namedtuple\n\nUrun = namedtuple("Urun", ["sku", "fiyat"])\n\n\ndef zam_uygula(urunler, oran):\n    return [u._replace(fiyat=round(u.fiyat * (1 + oran), 2)) for u in urunler]\n',
   'tests': 'eski = [Urun("K-1", 100.0), Urun("F-2", 49.9)]\nyeni = zam_uygula(eski, 0.1)\nassert yeni == [Urun("K-1", 110.0), Urun("F-2", 54.89)], "fiyatlar %10 artmalı"\nassert eski == [Urun("K-1", 100.0), Urun("F-2", 49.9)], "orijinal liste değişmemeli"\nassert all(isinstance(u, Urun) for u in yeni), "sonuç yine Urun kayıtları olmalı"\n',
   'hints': ['namedtuple değiştirilemez (immutable).', 'Bir alanı değiştirilmiş yeni kayıt üreten metot hangisi?', 'u._replace(fiyat=...) ile list comprehension'],
   'why': 'namedtuple alanlarına atama yapılamaz; _replace yeni kayıt döndürür ve orijinal veri korunur.'},
  {'t': 'code', 'stage': 'Meydan okuma', 'id': 'collections-itertools-x8', 'diff': 3,
   'q': '<p>Anadolu Market web oturum analizi. <code>oturumlar(olaylar, esik=30)</code>: <code>olaylar</code> <code>(kullanici, dakika)</code> demetleri listesi, <b>sırasız</b> gelebilir. Aynı kullanıcının iki ardışık olayı arasında <code>esik</code> dakikadan <b>fazla</b> boşluk varsa yeni oturum başlar. Sonuç: <code>{kullanici: (oturum_sayisi, en_uzun_oturum_suresi)}</code>; süre bir oturumdaki son ve ilk olay farkıdır (tek olaylı oturum 0). <code>groupby</code> ve <code>pairwise</code> kullan.</p>',
   'sol': 'from itertools import groupby, pairwise\n\n\ndef oturumlar(olaylar, esik=30):\n    sonuc = {}\n    for kul, grup in groupby(sorted(olaylar), key=lambda x: x[0]):\n        dakikalar = [d for _, d in grup]\n        baslar = [dakikalar[0]]\n        sureler = []\n        bas = dakikalar[0]\n        for a, b in pairwise(dakikalar):\n            if b - a > esik:\n                sureler.append(a - bas)\n                bas = b\n        sureler.append(dakikalar[-1] - bas)\n        sonuc[kul] = (len(sureler), max(sureler))\n    return sonuc\n',
   'tests': 'ol = [("ece", 10), ("can", 5), ("ece", 0), ("ece", 30), ("ece", 75), ("can", 36), ("ece", 80), ("can", 66), ("ali", 7)]\nr = oturumlar(ol)\nassert r["ece"] == (2, 30), "ece: [0,10,30] (30 dk) ve [75,80] (5 dk) -> 2 oturum, en uzun 30"\nassert r["can"] == (2, 30), "can: 5 -> 36 boşluk 31 > 30 yeni oturum; [36,66] boşluk tam 30 aynı oturum"\nassert r["ali"] == (1, 0), "tek olay: 1 oturum, süre 0"\nassert set(r) == {"ece", "can", "ali"}, "tüm kullanıcılar"\nassert oturumlar(ol, esik=60) == {"ali": (1, 0), "can": (1, 61), "ece": (1, 80)}, "eşik 60 ile herkes tek oturum"\nassert oturumlar([]) == {}, "boş girdi"\n',
   'hints': ['Önce sorted(olaylar): kullanıcıya, sonra dakikaya göre sıralanır; groupby artık doğru çalışır.', 'Her kullanıcının dakika listesinde pairwise ile boşlukları gez; boşluk > esik ise mevcut oturumu kapat.', 'Oturum süresi = oturumun son dakikası - başlangıç dakikası; döngüden sonra son oturumu da eklemeyi unutma.'],
   'why': 'sorted + groupby kullanıcıları ayırır, pairwise ardışık boşlukları verir. Döngü sonrası son oturumu kapatmak klasik "son grup" kenar durumudur.'},
 ],
 'faq': [
  {'q': 'ChainMap mi, {**a, **b} mi?', 'a': '<code>{**varsayilan, **kullanici}</code> bir kopyadır: o anki değerleri dondurur ve hangi değerin hangi katmandan geldiğini kaybeder. ChainMap kopyalamaz, katmanları canlı tutar ve <code>maps</code> ile izlenebilir. Tek seferlik birleştirme için ** yeterli; ayar sistemi için ChainMap daha şeffaf.'},
  {'q': 'pairwise ve batched eski Python\'da yoksa ne yapmalıyım?', 'a': 'pairwise 3.10, batched 3.12 ile geldi. Eski sürümde pairwise için <code>zip(x, x[1:])</code> (liste ise) ya da <code>tee</code> kullanılır; batched için <code>islice</code> ile while döngüsü yazılır. <code>more-itertools</code> paketi de bu tarifleri hazır sunar.'}
 ],
 'mistakes': [
  {'bad': 'ciro = defaultdict(defaultdict(float))', 'good': 'ciro = defaultdict(lambda: defaultdict(float))', 'why': 'defaultdict fabrika olarak çağrılabilir bir şey ister; içteki defaultdict nesnesi fabrika değildir ve TypeError verir.'},
  {'bad': 'pozitif = filter(lambda t: t > 0, tutarlar)\nprint(sum(pozitif), max(pozitif))', 'good': 'pozitif = [t for t in tutarlar if t > 0]\nprint(sum(pozitif), max(pozitif))', 'why': 'filter/map sonuçları tek kullanımlıktır; ikinci kullanımda boş gelir (max boş dizide ValueError verir).'}
 ]
}
