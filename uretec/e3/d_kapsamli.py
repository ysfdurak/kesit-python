EXT = dict(id='kapsamli-ifadeler', min=40)

EXT['html'] = r'''
<h2>Derinleş: comprehension'ın ince ayarları</h2>
<p>Liste, sözlük ve küme comprehension'larını, iç içe yapıları ve üreteç ifadelerini gördün. Bu bölüm, iş kodunda ve PCAP sınavında karşına çıkan ince noktaları topluyor: aynı hesabı iki kez yapmamak için walrus işleci (<code>:=</code>), döngü değişkeninin kapsamı, iki boyutlu listelerde paylaşılan satır tuzağı, sözlükleri dönüştürürken anahtar çakışması ve <code>enumerate</code>/<code>zip</code> ile birlikte kullanım.</p>

<h3>Walrus (:=): hesapla, süz ve kullan</h3>
<p>Bir değeri hem süzme koşulunda hem sonuçta kullanacaksan, comprehension'da onu iki kez hesaplamak zorunda kalırsın. Python 3.8 ile gelen atama ifadesi (assignment expression), halk arasındaki adıyla walrus <code>:=</code>, değeri koşulun içinde bir ada bağlar; aynı ad ifadenin başında kullanılabilir.</p>
<pre class="py">
urunler = [("Kulaklık", 899.90), ("Kablo", 79.90), ("Monitör", 4599.0), ("Mouse", 349.50)]

def kdvli(fiyat):
    return round(fiyat * 1.20, 2)

# İki kez hesaplar: kdvli() hem koşulda hem sonuçta
pahali_1 = [(ad, kdvli(f)) for ad, f in urunler if kdvli(f) > 1000]

# Bir kez hesaplar
pahali_2 = [(ad, k) for ad, f in urunler if (k := kdvli(f)) > 1000]

print(pahali_1)
print(pahali_2 == pahali_1)
</pre>
<div class="tip"><b>Parantez şart</b><code>if k := kdvli(f) &gt; 1000</code> yazarsan önce karşılaştırma yapılır ve k'ye <code>True/False</code> atanır. Her zaman <code>(k := ifade) &gt; 1000</code> biçiminde parantezle. Walrus'un bağladığı ad, comprehension bittikten sonra dışarıda da görünür; bu bilinçli bir tasarım kararıdır.</div>

<h3>Kapsam: döngü değişkeni dışarı sızmaz</h3>
<p>Python 3'te her comprehension kendi küçük kapsamında (scope) çalışır. <code>[x for x in ...]</code> içindeki <code>x</code>, dışarıdaki aynı adlı değişkene dokunmaz. Normal <code>for</code> döngüsünde ise döngü değişkeni döngüden sonra son değerini korur. İkisini karıştırmak eski Python 2 kodlarını taşırken sık görülen bir hatadır.</p>
<pre class="py">
i = "dokunulmadı"
kareler = [i * i for i in range(4)]
print(kareler, "| dışarıdaki i:", i)

for j in range(4):
    pass
print("for sonrası j:", j)            # for döngüsü sızdırır

toplam = [(n := n_ + 1) for n_ in range(3)]
print("walrus sızar, n =", n)
</pre>
<div class="tbl-wrap"><table>
<tr><th>Yapı</th><th>Sonuç</th><th>Döngü değişkeni dışarıda?</th><th>Tipik kullanım</th></tr>
<tr><td><code>[ifade for x in it]</code></td><td>list</td><td>Hayır</td><td>Dönüştürülmüş yeni liste</td></tr>
<tr><td><code>{k: v for x in it}</code></td><td>dict</td><td>Hayır</td><td>Arama tablosu, indeks</td></tr>
<tr><td><code>{ifade for x in it}</code></td><td>set</td><td>Hayır</td><td>Tekilleştirme</td></tr>
<tr><td><code>(ifade for x in it)</code></td><td>generator</td><td>Hayır</td><td>sum/max/any'ye akış</td></tr>
<tr><td><code>for x in it:</code></td><td>(yan etki)</td><td>Evet, son değer kalır</td><td>Birden çok iş, try/except, break</td></tr>
</table></div>

<h3>İki boyutlu listeler: paylaşılan satır tuzağı</h3>
<p>Depo raf düzeni, koltuk planı, haftalık vardiya tablosu gibi ızgaraları (grid) liste listesiyle tutarsın. <code>[[0] * 3] * 2</code> yazmak masum görünür ama dış çarpım <b>aynı iç listeyi</b> iki kez koyar; bir hücreyi değiştirince tüm satırlarda değişir. Doğrusu her satırı comprehension ile ayrı oluşturmaktır.</p>
<pre class="py">
yanlis = [[0] * 3] * 2
yanlis[0][0] = 9
print("Yanlış:", yanlis)               # iki satır da değişti!

dogru = [[0] * 3 for _ in range(2)]
dogru[0][0] = 9
print("Doğru :", dogru)

# Devrik (transpose): satırlar sütun olur
satis = [[10, 20, 30],      # Ankara: Oca, Şub, Mar
         [5, 15, 25]]       # İzmir
aylik = [[satir[ay] for satir in satis] for ay in range(3)]
print("Aya göre:", aylik)
print("zip ile  :", [list(s) for s in zip(*satis)])
</pre>
<p>Dikkat: <code>[[satir[ay] for satir in satis] for ay in range(3)]</code> içiçe <b>iki ayrı</b> comprehension'dır ve 2 boyutlu sonuç üretir; <code>[x for satir in m for x in satir]</code> ise <b>tek</b> comprehension'da iki for'dur ve düzleştirir. Köşeli parantezlerin yeri her şeyi değiştirir.</p>

<h3>Sözlükleri dönüştürmek</h3>
<p>Sözlük comprehension'ı <code>.items()</code> ile birlikte en çok üç iş için kullanılır: değerleri dönüştürmek, öğeleri süzmek ve anahtar-değeri ters çevirmek. Ters çevirirken iki anahtarın değeri aynıysa <b>son gelen kazanır</b>; veri sessizce kaybolur. Çakışma olabilecekse grupla.</p>
<pre class="py">
fiyat = {"KLV": 1249.0, "MOU": 349.5, "KUL": 899.9, "KBL": 79.9}

zamli = {k: round(v * 1.1, 2) for k, v in fiyat.items()}
ucuz = {k: v for k, v in fiyat.items() if v &lt; 500}
print(zamli)
print(ucuz)

kategori = {"KLV": "çevre", "MOU": "çevre", "KUL": "ses", "KBL": "kablo"}
ters = {v: k for k, v in kategori.items()}
print("Ters (kayıp var):", ters)

gruplu = {kat: sorted(k for k, v in kategori.items() if v == kat)
          for kat in set(kategori.values())}
print("Gruplu:", dict(sorted(gruplu.items())))
</pre>
<div class="warn"><b>Gruplu sürümün maliyeti</b>Son örnek her kategori için tüm sözlüğü yeniden tarar (n × k işlem). Küçük veride sorun değil; büyük veride tek geçişli <code>for</code> + <code>defaultdict(list)</code> kullan (collections dersi). Comprehension kısa yazmak içindir, her zaman en hızlı yol değildir.</div>

<h3>enumerate, zip ve birden çok koşul</h3>
<p>Sıra numarası lazımsa <code>enumerate</code>, iki listeyi eşleştireceksen <code>zip</code> comprehension'ın içinde de çalışır. Arka arkaya birden çok <code>if</code> yazmak <code>and</code> ile aynıdır; okunabilirlik için uzun koşulu bir yardımcı fonksiyona taşı.</p>
<pre class="py">
musteriler = ["Ayşe", "Mehmet", "Elif", "Can"]
puanlar = [92, 61, 78, 45]

liste = [f"{no}. {ad} ({p})" for no, (ad, p) in enumerate(zip(musteriler, puanlar), 1) if p &gt;= 60 if p &lt; 90]
print(liste)

def vip_mi(ad, puan):
    return puan &gt;= 90 or ad.startswith("A")

print([ad for ad, p in zip(musteriler, puanlar) if vip_mi(ad, p)])
</pre>

<div class="note"><b>Gerçek işte</b>Kod incelemelerinde (code review) comprehension'lar için yaygın kural şudur: tek satıra sığmıyorsa, iki <code>for</code>'dan fazlası varsa ya da içinde yan etki (print, append, dosyaya yazma) varsa normal döngüye dön. Takım arkadaşın onu üç saniyede okuyabilmeli. API'den gelen JSON listesini <code>{k["id"]: k for k in kayitlar}</code> ile id → kayıt arama tablosuna çevirmek ise en çok kullanılan ve herkesin hemen tanıdığı kalıptır; bir listede tekrar tekrar arama yapmaktan çok daha hızlıdır.</div>
'''

EXT['ex'] = [
dict(t='mc', stage='Isınma', q='3 satır, 4 sütunluk, sıfırlarla dolu ve satırları <b>birbirinden bağımsız</b> bir tablo hangisiyle oluşturulur?',
     o=['[[0] * 4] * 3', '[[0] * 4 for _ in range(3)]', '[0] * 4 * 3', '[[0 for _ in range(4)]] * 3'], a=1,
     why='Dış * 3 aynı iç listeyi üç kez koyar (a ve d şıkları); bir hücre değişince tüm satırlar değişir. c şıkkı tek boyutlu 12 elemanlı liste üretir. Comprehension her satır için yeni liste oluşturur.'),
dict(t='mc', stage='Isınma', q='<code>[(ad, k) for ad, f in urunler if (k := kdvli(f)) &gt; 1000]</code> ifadesinde walrus (<code>:=</code>) ne sağlar?',
     o=['kdvli\'yi her ürün için iki yerine bir kez çağırmayı', 'Comprehension\'ı üreteç ifadesine çevirmeyi', 'k değişkenini dışarıdan erişilemez yapmayı', 'Koşulu sağlamayan ürünleri de k ile listeye eklemeyi'], a=0,
     why='Walrus, koşulda hesaplanan değeri k adına bağlar ve sonuç kısmında yeniden kullanır; pahalı fonksiyon iki kez çağrılmaz. Walrus ile bağlanan ad aslında comprehension dışına da sızar.'),
dict(t='predict', stage='Kodu oku', q='Bu kod ne yazdırır?',
     code=r'''
x = "dış"
kareler = [x * 2 for x in range(3)]
print(x, kareler)
''', o=['dış [0, 2, 4]', '2 [0, 2, 4]', 'dışdış [0, 2, 4]', '2 [0, 1, 4]'], a=0,
     why='Python 3\'te comprehension kendi kapsamında çalışır; içteki x dışarıdaki x\'i değiştirmez. x * 2 burada 0, 2, 4 üretir (kare değil, ikiyle çarpım).'),
dict(t='predict', stage='Kodu oku', q='Bu kod ne yazdırır?',
     code=r'''
kelimeler = ["elma", "armut", "kivi", "erik"]
print({len(k): k for k in kelimeler})
''', o=["{4: 'elma', 5: 'armut'}", "{4: 'erik', 5: 'armut'}", "{4: ['elma', 'kivi', 'erik'], 5: ['armut']}", "{4: 'kivi', 5: 'armut'}"], a=1,
     why='Aynı anahtar (4) üç kez gelir; her seferinde değer üzerine yazılır ve son gelen "erik" kalır. Anahtarın ilk eklendiği sıra (4 önce, 5 sonra) korunur. Gruplamak istiyorsan liste biriktirmen gerekir.'),
dict(t='predict', stage='Kodu oku', q='Bu kod ne yazdırır?',
     code=r'''
raf = [[0] * 2] * 3
raf[1][0] = 7
print(raf)
''', o=['[[0, 0], [7, 0], [0, 0]]', '[[7, 0], [7, 0], [7, 0]]', '[[7, 7], [0, 0], [0, 0]]', 'TypeError'], a=1,
     why='* 3 aynı iç listeyi üç kez koyar; üç satır tek bir nesnedir. Birine yazınca hepsinde görünür. Doğrusu: [[0] * 2 for _ in range(3)].'),
dict(t='predict', stage='Kodu oku', q='Bu kod ne yazdırır?',
     code=r'''
m = [[1, 2, 3], [4, 5, 6]]
print([[satir[i] for satir in m] for i in range(3)])
''', o=['[1, 2, 3, 4, 5, 6]', '[[1, 4], [2, 5], [3, 6]]', '[[1, 2, 3], [4, 5, 6]]', '[[1, 2], [3, 4], [5, 6]]'], a=1,
     why='Dıştaki comprehension her sütun indeksi i için yeni bir liste kurar; içteki her satırdan i. elemanı alır. Sonuç devrik (transpose) matristir. Düzleştirme için tek comprehension\'da iki for gerekirdi.'),
dict(t='order', stage='Kodu oku', q='<p>Siparişlerden iptal olmayanları süzüp id → tutar arama tablosu kuran ve 1000 TL üstündekileri yazdıran programın satırlarını sırala.</p>',
     lines=['siparisler = [{"id": 1, "tutar": 1500, "durum": "ok"}, {"id": 2, "tutar": 900, "durum": "iptal"}, {"id": 3, "tutar": 2400, "durum": "ok"}]',
            'gecerli = [s for s in siparisler if s["durum"] != "iptal"]',
            'tablo = {s["id"]: s["tutar"] for s in gecerli}',
            'buyukler = sorted(i for i, t in tablo.items() if t > 1000)',
            'print(buyukler, tablo[3])'],
     expect='[1, 3] 2400\n',
     hint='Her satır bir öncekinin sonucunu kullanıyor: veri → süz → sözlük → seç → yazdır.',
     why='Comprehension boru hattı: her adım bir öncekinin çıktısını alır. Arama tablosu kurulduktan sonra tablo[3] gibi doğrudan erişim mümkün olur.'),
dict(t='code', id='kapsamli-ifadeler-x1', stage='Rehberli', diff=2,
     q='<p><code>sehir_indeksi(musteriler)</code> fonksiyonunu yaz. <code>musteriler</code>: <code>(ad, sehir)</code> demetleri listesi. Sonuç: her şehir için o şehirdeki müşteri adlarının <b>alfabetik</b> listesi. Sözlük anahtarları da alfabetik sırada eklensin. Tek bir sözlük comprehension (içinde başka bir comprehension) kullan.</p>',
     guide=['Tüm şehirleri bir küme comprehension\'ıyla tekilleştir.', 'Şehirleri sorted ile sırala; dış sözlük comprehension bu sıra üzerinde dönsün.', 'Her şehir için değeri iç comprehension\'la üret: o şehre ait adlar.', 'İç listeyi de sorted ile sırala.'],
     example=r'''
calisanlar = [("Ayşe", "İK"), ("Can", "BT"), ("Elif", "İK")]
departmanlar = sorted({d for _, d in calisanlar})
print({d: [ad for ad, dd in calisanlar if dd == d] for d in departmanlar})
''',
     start=r'''
def sehir_indeksi(musteriler):
    sehirler = []          # TODO: tekil ve sıralı şehirler
    return {}              # TODO: {sehir: sıralı adlar for sehir in sehirler}
''',
     sol=r'''
def sehir_indeksi(musteriler):
    sehirler = sorted({s for _, s in musteriler})
    return {s: sorted(ad for ad, sh in musteriler if sh == s) for s in sehirler}
''',
     tests=r'''
M = [("Mehmet", "İzmir"), ("Ayşe", "Ankara"), ("Zeynep", "İzmir"), ("Can", "Ankara"), ("Burak", "Bursa"), ("Ali", "Ankara")]
r = sehir_indeksi(M)
assert r == {"Ankara": ["Ali", "Ayşe", "Can"], "Bursa": ["Burak"], "İzmir": ["Mehmet", "Zeynep"]}, "Gelen: " + str(r)
assert list(r) == ["Ankara", "Bursa", "İzmir"], "Anahtarlar alfabetik sırada olmalı"
assert sehir_indeksi([]) == {}, "Boş liste → boş sözlük"
''',
     hints=['Küme comprehension tekrarları atar: {s for _, s in musteriler}', 'Dış sözlük: {s: ... for s in sorted(kume)}', 'Değer: sorted(ad for ad, sh in musteriler if sh == s)'],
     why='Küme ile tekilleştir, sorted ile sırala, iç comprehension ile grupla. Küçük veride okunaklıdır; büyük veride her şehir için listeyi yeniden taradığı için defaultdict ile tek geçiş tercih edilir.'),
dict(t='code', id='kapsamli-ifadeler-x2', stage='Rehberli', diff=2,
     q='<p><code>devrik(tablo)</code>: satırları şubeler, sütunları aylar olan satış tablosunu (liste listesi) <b>devirip</b> satırları aylar, sütunları şubeler olan yeni liste listesi döndürsün. Girdi değişmesin. Boş tablo için <code>[]</code>.</p>',
     guide=['Sütun sayısını ilk satırın uzunluğundan öğren (tablo boşsa hemen [] döndür).', 'Dış comprehension sütun indeksi i üzerinde dönsün.', 'İç comprehension her satırdan i. elemanı alsın.'],
     example=r'''
# Farklı iş: her sütunun toplamı (sütun indeksi dışta, satırlar içte)
puan = [[3, 5], [4, 1], [2, 2]]
print([sum(satir[i] for satir in puan) for i in range(len(puan[0]))])
''',
     start=r'''
def devrik(tablo):
    if not tablo:
        return []
    sutun = len(tablo[0])
    # TODO: [[... for satir in tablo] for i in range(sutun)]
    return tablo
''',
     sol=r'''
def devrik(tablo):
    if not tablo:
        return []
    sutun = len(tablo[0])
    return [[satir[i] for satir in tablo] for i in range(sutun)]
''',
     tests=r'''
t = [[10, 20, 30], [5, 15, 25]]
assert devrik(t) == [[10, 5], [20, 15], [30, 25]], "3 ay × 2 şube olmalı: " + str(devrik(t))
assert t == [[10, 20, 30], [5, 15, 25]], "Girdi değişmemeli"
assert devrik([[1, 2]]) == [[1], [2]]
assert devrik([]) == []
d = devrik([[1, 2], [3, 4]])
d[0][0] = 99
assert d[1][0] == 2, "Satırlar bağımsız listeler olmalı"
''',
     hints=['İç içe İKİ comprehension: dıştaki yeni satırları, içteki o satırın elemanlarını üretir.', '[[satir[i] for satir in tablo] for i in range(sutun)]'],
     why='Dış comprehension sonucun satırlarını (aylar), iç comprehension her satırın elemanlarını (şubeler) kurar. Alternatif: [list(s) for s in zip(*tablo)].'),
dict(t='code', id='kapsamli-ifadeler-x3', stage='Rehberli', diff=2,
     q='<p><code>indirimli_vitrin(urunler, oran, esik)</code>: <code>urunler</code> <code>(ad, fiyat)</code> listesi. Her ürünün indirimli fiyatını <code>round(fiyat * (1 - oran), 2)</code> ile hesapla; indirimli fiyatı <code>esik</code>\'ten <b>küçük</b> olanları <code>(ad, indirimli_fiyat)</code> olarak döndür. İndirimli fiyat her ürün için <b>yalnız bir kez</b> hesaplanmalı: hesabı <code>indirimli(fiyat, oran)</code> yardımcı fonksiyonuna koy ve comprehension\'da walrus kullan.</p>',
     guide=['indirimli(fiyat, oran) fonksiyonunu yaz: yuvarlanmış indirimli fiyatı döndürsün.', 'Comprehension\'ın if kısmında (f := indirimli(fiyat, oran)) < esik yaz.', 'Sonuç kısmında (ad, f) kullan.', 'Walrus ifadesini parantez içine almayı unutma.'],
     example=r'''
def puan(metin):
    return len(metin.split())

yorumlar = ["harika ürün", "çok hızlı kargo ve güzel paket", "iyi"]
print([(y, p) for y in yorumlar if (p := puan(y)) >= 2])
''',
     start=r'''
def indirimli(fiyat, oran):
    return round(fiyat * (1 - oran), 2)

def indirimli_vitrin(urunler, oran, esik):
    # TODO: walrus ile tek hesaplama: [(ad, f) for ad, fiyat in urunler if (f := ...) < esik]
    return []
''',
     sol=r'''
def indirimli(fiyat, oran):
    return round(fiyat * (1 - oran), 2)

def indirimli_vitrin(urunler, oran, esik):
    return [(ad, f) for ad, fiyat in urunler if (f := indirimli(fiyat, oran)) < esik]
''',
     tests=r'''
U = [("Kulaklık", 899.90), ("Kablo", 79.90), ("Monitör", 4599.0), ("Mouse", 349.50)]
r = indirimli_vitrin(U, 0.2, 750)
assert r == [("Kulaklık", 719.92), ("Kablo", 63.92), ("Mouse", 279.6)], "Gelen: " + str(r)
_say = {"n": 0}
_eski = indirimli
def indirimli(fiyat, oran):
    _say["n"] += 1
    return _eski(fiyat, oran)
indirimli_vitrin(U, 0.2, 750)
assert _say["n"] == 4, f"indirimli 4 ürün için 4 kez çağrılmalı, {_say['n']} kez çağrıldı: walrus ile tek hesaplama yap"
assert ":=" in __source__, "Walrus işlecini (:=) kullan"
''',
     hints=['Walrus koşulda değeri bir ada bağlar: if (f := hesap) < esik', 'Sonuç kısmında aynı adı kullanırsın: [(ad, f) for ad, fiyat in urunler if (f := indirimli(fiyat, oran)) < esik]'],
     why='Walrus, pahalı ya da yan etkili bir hesabı koşul ve sonuç arasında paylaştırır. Parantez zorunludur; yoksa karşılaştırmanın True/False sonucu atanır.'),
dict(t='code', id='kapsamli-ifadeler-x4', stage='Kendin yaz', diff=2,
     q='<p><code>eksik_alanlar(kayitlar, zorunlu)</code>: <code>kayitlar</code> her biri <code>"id"</code> anahtarı içeren sözlüklerin listesi, <code>zorunlu</code> alan adlarının listesi. Eksik alanı olan her kayıt için <code>{id: [eksik alanlar]}</code> döndür (alanlar <code>zorunlu</code>\'daki sırayla). Bir alan yoksa ya da değeri <code>None</code> veya <code>""</code> ise eksik sayılır. Eksiği olmayan kayıtlar sonuçta yer almasın.</p>',
     sol=r'''
def eksik_alanlar(kayitlar, zorunlu):
    return {k["id"]: eksik for k in kayitlar
            if (eksik := [a for a in zorunlu if k.get(a) in (None, "")])}
''',
     tests=r'''
K = [{"id": 1, "ad": "Ayşe", "tel": "555", "sehir": "Ankara"},
     {"id": 2, "ad": "", "sehir": "İzmir"},
     {"id": 3, "ad": "Can", "tel": None, "sehir": None},
     {"id": 4, "ad": "Elif", "tel": "0", "sehir": "Bursa"}]
r = eksik_alanlar(K, ["ad", "tel", "sehir"])
assert r == {2: ["ad", "tel"], 3: ["tel", "sehir"]}, "Gelen: " + str(r)
assert eksik_alanlar(K, []) == {}, "Zorunlu alan yoksa hiçbir kayıt eksik değildir"
assert eksik_alanlar([], ["ad"]) == {}
''',
     hints=['k.get(alan) olmayan alan için None döner; in (None, "") ile iki durumu birden denetle.', 'Eksik listesini koşulda walrus ile hesaplayıp boş değilse sonuçta kullanabilirsin.'],
     why='İç comprehension her kaydın eksiklerini bulur; walrus bu listeyi hem "boş mu" koşulunda hem değer olarak kullanır. "0" gibi değerler eksik sayılmaz; yalnız None ve boş metin.'),
dict(t='code', id='kapsamli-ifadeler-x5', stage='Kendin yaz', diff=1,
     q='<p><code>vardiya_tablosu(calisanlar, gunler)</code>: her çalışan için bir satır, her gün için bir sütun olan ve tüm hücreleri <code>"-"</code> olan bir tablo (liste listesi) döndürsün. Satırlar birbirinden <b>bağımsız</b> olmalı (bir hücreyi değiştirmek diğer satırları etkilememeli).</p>',
     sol=r'''
def vardiya_tablosu(calisanlar, gunler):
    return [["-" for _ in gunler] for _ in calisanlar]
''',
     tests=r'''
t = vardiya_tablosu(["Ayşe", "Can", "Elif"], ["Pzt", "Sal"])
assert t == [["-", "-"], ["-", "-"], ["-", "-"]], "3 satır × 2 sütun: " + str(t)
t[0][1] = "Sabah"
assert t[1][1] == "-" and t[2][1] == "-", "Satırlar bağımsız olmalı: [[...] * n] * m yerine comprehension kullan"
assert vardiya_tablosu([], ["Pzt"]) == []
assert vardiya_tablosu(["X"], []) == [[]]
''',
     hints=['Dış liste çarpımı ([satır] * m) aynı satırı paylaştırır.', 'Her satırı ayrı oluştur: [[...] for _ in calisanlar]'],
     why='Comprehension her turda yeni bir iç liste kurar; satırlar bağımsız olur. _ adı "bu değişkeni kullanmıyorum" demenin geleneksel yoludur.'),
dict(t='code', id='kapsamli-ifadeler-x6', stage='Hata avı', kind='bug', diff=1,
     q='<p><b>Hatayı bul ve düzelt.</b> <code>negatifleri_sifirla(tutarlar)</code> listedeki negatif tutarları <code>0</code> yapmalı, diğerlerini aynen bırakmalı; <b>liste uzunluğu değişmemeli</b> (her tutar bir faturaya karşılık geliyor). Ama sonuç listesi kısalıyor.</p>',
     start=r'''
def negatifleri_sifirla(tutarlar):
    return [t for t in tutarlar if t >= 0]
''',
     sol=r'''
def negatifleri_sifirla(tutarlar):
    return [t if t >= 0 else 0 for t in tutarlar]
''',
     tests=r'''
r = negatifleri_sifirla([120, -15, 0, 300.5, -0.01])
assert len(r) == 5, "Uzunluk korunmalı: sondaki if SÜZER, baştaki if-else DEĞER SEÇER"
assert r == [120, 0, 0, 300.5, 0], "Gelen: " + str(r)
assert negatifleri_sifirla([]) == []
''',
     hints=['Sondaki if eleman atar; burada atmak değil değiştirmek istiyorsun.', 'Koşullu değer ifadenin başında: [t if t >= 0 else 0 for t in tutarlar]'],
     why='Comprehension\'ın sonundaki if bir süzgeçtir; koşulu sağlamayan eleman listeye hiç girmez. Değer seçmek için koşullu ifade (a if koşul else b) for\'dan önce yazılır.'),
dict(t='code', id='kapsamli-ifadeler-x7', stage='Hata avı', kind='bug', diff=2,
     q='<p><b>Hatayı bul ve düzelt.</b> <code>tutar_ozeti(siparisler)</code> iptal olmayan siparişlerin <code>(toplam, ortalama, en_buyuk)</code> demetini döndürmeli; geçerli sipariş yoksa <code>(0, 0, 0)</code>. Kod ZeroDivisionError ya da ValueError veriyor.</p>',
     start=r'''
def tutar_ozeti(siparisler):
    tutarlar = (s["tutar"] for s in siparisler if s["durum"] != "iptal")
    toplam = sum(tutarlar)
    adet = len(list(tutarlar))
    return toplam, round(toplam / adet, 2), max(tutarlar)
''',
     sol=r'''
def tutar_ozeti(siparisler):
    tutarlar = [s["tutar"] for s in siparisler if s["durum"] != "iptal"]
    if not tutarlar:
        return 0, 0, 0
    toplam = sum(tutarlar)
    return toplam, round(toplam / len(tutarlar), 2), max(tutarlar)
''',
     tests=r'''
S = [{"tutar": 100, "durum": "ok"}, {"tutar": 250, "durum": "ok"}, {"tutar": 999, "durum": "iptal"}, {"tutar": 50, "durum": "ok"}]
assert tutar_ozeti(S) == (400, 133.33, 250), "Gelen: " + str(tutar_ozeti(S))
assert tutar_ozeti([{"tutar": 5, "durum": "iptal"}]) == (0, 0, 0), "Geçerli sipariş yoksa (0, 0, 0)"
assert tutar_ozeti([]) == (0, 0, 0)
''',
     hints=['Üreteç ifadesi bir kez gezilebilir; sum onu tüketir, sonraki len ve max boş akış görür.', 'Birden çok kez kullanacaksan köşeli parantezle liste kur ve boş liste kontrolü ekle.'],
     why='Üreteç tek kullanımlıktır: sum tüketince list(tutarlar) boş olur (0\'a bölme) ve max boş akışta ValueError verir. Veriyi birden çok kez kullanacaksan liste comprehension seç.'),
dict(t='code', id='kapsamli-ifadeler-x8', stage='Meydan okuma', diff=3,
     q='<p><b>Pivot tablo.</b> <code>pivot(satislar, aylar)</code>: <code>satislar</code> <code>(sehir, ay, tutar)</code> demetleri, <code>aylar</code> sütun sırasını veren liste. Sonuç: <code>{sehir: {ay: toplam_tutar}}</code>. Kurallar:</p><ul><li>Şehirler alfabetik; her şehrin iç sözlüğü <code>aylar</code> sırasında ve <b>tüm aylar</b> için anahtar içersin (satış yoksa <code>0</code>).</li><li>Toplamlar 2 ondalığa yuvarlansın.</li><li><code>aylar</code>\'da olmayan aydaki satışlar yok sayılsın.</li><li>Yalnız comprehension\'lar ve yerleşik fonksiyonlar (sum, sorted, round) kullan; for döngüsü deyimi (statement) yazma.</li></ul>',
     sol=r'''
def pivot(satislar, aylar):
    return {s: {a: round(sum(t for sh, ay, t in satislar if sh == s and ay == a), 2) for a in aylar}
            for s in sorted({sh for sh, _, _ in satislar})}
''',
     tests=r'''
S = [("İzmir", "Oca", 100.1), ("Ankara", "Şub", 50), ("Ankara", "Oca", 20.2), ("İzmir", "Oca", 0.2), ("Bursa", "Nis", 999), ("Ankara", "Şub", 25)]
r = pivot(S, ["Oca", "Şub", "Mar"])
assert r == {"Ankara": {"Oca": 20.2, "Şub": 75, "Mar": 0}, "Bursa": {"Oca": 0, "Şub": 0, "Mar": 0}, "İzmir": {"Oca": 100.3, "Şub": 0, "Mar": 0}}, "Gelen: " + str(r)
assert list(r) == ["Ankara", "Bursa", "İzmir"], "Şehirler alfabetik"
assert list(r["İzmir"]) == ["Oca", "Şub", "Mar"], "Aylar verilen sırada"
assert pivot([], ["Oca"]) == {}
import ast as _ast
assert not any(isinstance(_d, (_ast.For, _ast.While)) for _d in _ast.walk(_ast.parse(__source__))), "for/while deyimi yazma; yalnız comprehension kullan"
''',
     hints=['Dış sözlük şehirler (küme → sorted), iç sözlük aylar üzerinde döner.', 'Hücre değeri: sum(t for sh, ay, t in satislar if sh == s and ay == a); boşsa sum 0 döner.', 'round(..., 2) ile 100.1 + 0.2 gibi kayan nokta artıklarını temizle.'],
     why='İç içe sözlük comprehension, sabit sütunlu (tüm aylar) bir pivot üretir; sum boş akışta 0 döndürdüğü için eksik hücreler kendiliğinden 0 olur. Her hücre için veriyi yeniden taradığından O(şehir × ay × satış) çalışır; büyük veride pandas pivot_table kullanılır.'),
]

EXT['faq'] = [
 dict(q='Walrus (:=) her yerde kullanılabilir mi?', a='Hayır; bir ifadenin içinde (if koşulu, while koşulu, comprehension) kullanılır. Tek başına bir satırda x := 5 SyntaxError verir; orada normal = kullanılır. Comprehension\'ın yinelenebilir kısmında (for x in (y := ...)) da kullanılamaz.'),
 dict(q='İki boyutlu listeyi kopyalarken neye dikkat etmeliyim?', a='tablo.copy() ya da tablo[:] yalnız dış listeyi kopyalar; satırlar hâlâ paylaşılır (sığ kopya). Bağımsız kopya için [satir[:] for satir in tablo] ya da copy.deepcopy(tablo) kullan.'),
]
EXT['mistakes'] = [
 dict(bad='tablo = [[0] * 7] * 4\ntablo[0][0] = 1   # dört satır da değişir', good='tablo = [[0] * 7 for _ in range(4)]\ntablo[0][0] = 1', why='Liste çarpımı aynı iç listeyi tekrarlar. Her satırı comprehension ile ayrı oluştur.'),
 dict(bad='sonuc = [(ad, k) for ad, f in urunler if k := kdvli(f) > 1000]', good='sonuc = [(ad, k) for ad, f in urunler if (k := kdvli(f)) > 1000]', why='Walrus parantezsiz yazılırsa sözdizimi hatası olur ya da karşılaştırmanın sonucu (True/False) atanır. Atamayı daima parantez içine al.'),
]
