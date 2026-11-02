from common import write

DS = 'anadolu_market'
TOPIC = 'Veri seti: Anadolu Market'
T = []


def add(**k):
    k.setdefault('topic', TOPIC)
    k.setdefault('ds', DS)
    T.append(k)


# ---------------------------------------------------------------- TEMEL (saf Python, veri.kayitlar)
add(id='b-411', lv='temel', diff=1, kind='rehberli', title='Kanal başına sipariş sayısı',
    q='<p><b>Pazarlama ekibi soruyor:</b> "Siparişlerimiz en çok hangi kanaldan geliyor: web, mobil uygulama mı, mağaza mı?"</p>'
      '<p><code>kanal_sayilari(siparisler)</code> fonksiyonunu yaz. Parametre, <code>veri.kayitlar("anadolu_market", "orders")</code> ile gelen sözlük listesidir; '
      'her sözlükte <code>channel</code> alanı var. Fonksiyon <code>{kanal: sipariş_sayısı}</code> sözlüğü döndürsün. pandas kullanma; döngü ve sözlük yeterli.</p>',
    guide=['Boş bir sözlük oluştur.', 'Her siparişin <code>channel</code> değerini al.',
           'Sözlükte o kanal yoksa 0\'dan başlat, sonra 1 artır (<code>dict.get</code> işini görür).',
           'Döngü bitince sözlüğü döndür.'],
    example='''
# Benzer teknik: segment başına müşteri sayısı (küçük örnek veri)
musteriler = [{"segment": "Bireysel"}, {"segment": "Premium"}, {"segment": "Bireysel"}]
sayac = {}
for m in musteriler:
    sayac[m["segment"]] = sayac.get(m["segment"], 0) + 1
print(sayac)
''',
    start='''
import veri

siparisler = veri.kayitlar("anadolu_market", "orders")
print(siparisler[0])   # bir kaydın neye benzediğine bak


def kanal_sayilari(siparisler):
    sayac = {}
    for s in siparisler:
        kanal = s["channel"]
        # TODO: sayac[kanal] değerini 1 artır (ilk görüşte 0'dan başlat)
    return sayac
''',
    sol='''
import veri

siparisler = veri.kayitlar("anadolu_market", "orders")


def kanal_sayilari(siparisler):
    sayac = {}
    for s in siparisler:
        kanal = s["channel"]
        sayac[kanal] = sayac.get(kanal, 0) + 1
    return sayac


print(kanal_sayilari(siparisler))
''',
    calc={'R': 'kanal_sayilari(siparisler)'},
    tests='''
r = kanal_sayilari(siparisler)
assert isinstance(r, dict), "Fonksiyon bir sözlük döndürmeli"
assert r == @R@, "Gerçek veride kanal sayıları farklı; her siparişi tam bir kez saydığından emin ol"
assert sum(r.values()) == len(siparisler), "Sayıların toplamı sipariş sayısına (910) eşit olmalı"
assert kanal_sayilari([{"channel": "web"}, {"channel": "web"}, {"channel": "store"}]) == {"web": 2, "store": 1}, "Küçük örnekte web 2, store 1 olmalı"
assert kanal_sayilari([]) == {}, "Boş listede boş sözlük dönmeli"
''',
    hints=['Sayım için sözlük kullan: anahtar kanal, değer sayı.', '<code>sayac.get(kanal, 0)</code> anahtar yoksa 0 verir.',
           '<code>sayac[kanal] = sayac.get(kanal, 0) + 1</code>'],
    why='Sözlükle gruplama, SQL\'deki <code>GROUP BY channel</code> + <code>COUNT(*)</code> işleminin saf Python karşılığıdır; tek geçiş, O(n). '
        'Mobil kanalın önde olduğunu görürsün. Alternatif: <code>collections.Counter(s["channel"] for s in siparisler)</code> tek satırda aynı sonucu verir; '
        'pandas\'ta <code>df["channel"].value_counts()</code>. Sık hata: <code>sayac[kanal] += 1</code> satırını ilk görüşte çalıştırmak KeyError verir.',
    tags=['sözlük', 'sayım', 'gruplama'], min=5)

add(id='b-412', lv='temel', diff=1, kind='yaz', title='İptal ve iade oranı',
    q='<p><b>Operasyon müdürü soruyor:</b> "Siparişlerin yüzde kaçı iptal ya da iade ile kapanıyor?"</p>'
      '<p><code>kayip_orani(siparisler)</code> fonksiyonunu yaz: <code>status</code> değeri <code>"cancelled"</code> ya da <code>"returned"</code> olan siparişlerin '
      'tüm siparişlere oranını <b>yüzde</b> olarak, 1 ondalığa yuvarlanmış döndürsün. Liste boşsa <code>0.0</code> döndür (sıfıra bölme olmasın). '
      'Veri: <code>veri.kayitlar("anadolu_market", "orders")</code>.</p>',
    start='''
import veri

siparisler = veri.kayitlar("anadolu_market", "orders")


def kayip_orani(siparisler):
    pass
''',
    sol='''
import veri

siparisler = veri.kayitlar("anadolu_market", "orders")


def kayip_orani(siparisler):
    if not siparisler:
        return 0.0
    kayip = sum(1 for s in siparisler if s["status"] in ("cancelled", "returned"))
    return round(kayip / len(siparisler) * 100, 1)


print(kayip_orani(siparisler))
''',
    calc={'R': 'kayip_orani(siparisler)'},
    tests='''
assert kayip_orani(siparisler) == @R@, "Gerçek veride (72 iptal + 56 iade) / 910 → %14.1 olmalı"
assert kayip_orani([]) == 0.0, "Boş listede 0.0 dönmeli (sıfıra bölme hatası olmamalı)"
ornek = [{"status": "delivered"}, {"status": "cancelled"}, {"status": "returned"}, {"status": "shipped"}]
assert kayip_orani(ornek) == 50.0, "4 siparişten 2\\'si kayıp → 50.0"
assert isinstance(kayip_orani(ornek), float), "Sonuç float olmalı"
''',
    hints=['Koşula uyanları say, toplam sayıya böl, 100 ile çarp.', '<code>s["status"] in ("cancelled", "returned")</code> iki değeri tek koşulda denetler.',
           'Boş liste kontrolünü en başta yap: <code>if not siparisler: return 0.0</code>'],
    why='Oranı hesaplamadan önce paydanın 0 olup olmadığını denetlemek, raporlama kodunda en sık unutulan adımdır (Power BI\'daki DIVIDE fonksiyonu bu yüzden vardır). '
        '<code>sum(1 for ...)</code> koşullu sayımın bellek dostu yoludur. Yuvarlamayı en sonda yap; ara adımda yuvarlamak hatayı büyütür.',
    tags=['oran', 'koşullu sayım', 'sıfıra bölme'], min=5)

add(id='b-413', lv='temel', diff=1, kind='rehberli', title='Kategori özet kartı',
    q='<p><b>Kategori yöneticisi soruyor:</b> "Her kategoride kaç ürünümüz var ve ortalama fiyatımız ne?"</p>'
      '<p><code>kategori_ozeti(urunler)</code> fonksiyonunu yaz. <code>urunler</code>, <code>veri.kayitlar("anadolu_market", "products")</code> listesidir. '
      'Dönüş: <code>{kategori: (urun_sayisi, ortalama_fiyat)}</code>; ortalama 2 ondalığa yuvarlansın.</p>',
    guide=['Kategori başına iki bilgi biriktireceksin: adet ve fiyat toplamı. İkisini ayrı sözlükte ya da bir listede tutabilirsin.',
           'Döngüde her ürün için adedi 1, toplamı <code>price</code> kadar artır.',
           'İkinci bir döngüde her kategori için <code>(adet, round(toplam / adet, 2))</code> demetini kur.',
           'Sonuç sözlüğünü döndür.'],
    example='''
# Benzer teknik: şehir başına çalışan sayısı ve ortalama yaş
kisiler = [("Ankara", 30), ("İzmir", 40), ("Ankara", 36)]
toplam, adet = {}, {}
for sehir, yas in kisiler:
    toplam[sehir] = toplam.get(sehir, 0) + yas
    adet[sehir] = adet.get(sehir, 0) + 1
print({s: (adet[s], round(toplam[s] / adet[s], 1)) for s in toplam})
''',
    start='''
import veri

urunler = veri.kayitlar("anadolu_market", "products")


def kategori_ozeti(urunler):
    adet, toplam = {}, {}
    for u in urunler:
        k = u["category"]
        # TODO 1: adet[k] değerini 1 artır
        # TODO 2: toplam[k] değerine fiyatı (u["price"]) ekle
    sonuc = {}
    # TODO 3: her kategori için (adet, ortalama fiyat) demetini sonuc'a yaz
    return sonuc
''',
    sol='''
import veri

urunler = veri.kayitlar("anadolu_market", "products")


def kategori_ozeti(urunler):
    adet, toplam = {}, {}
    for u in urunler:
        k = u["category"]
        adet[k] = adet.get(k, 0) + 1
        toplam[k] = toplam.get(k, 0) + u["price"]
    sonuc = {}
    for k in adet:
        sonuc[k] = (adet[k], round(toplam[k] / adet[k], 2))
    return sonuc


for k, (n, ort) in kategori_ozeti(urunler).items():
    print(f"{k:<12} {n:>2} ürün  ort. {ort:>8.2f} TL")
''',
    calc={'R': 'kategori_ozeti(urunler)'},
    tests='''
r = kategori_ozeti(urunler)
assert len(r) == 7, "Veride 7 kategori var"
assert r == @R@, "Adet ya da ortalama fiyat gerçek veriyle tutmuyor"
assert kategori_ozeti([{"category": "A", "price": 10}, {"category": "A", "price": 15}]) == {"A": (2, 12.5)}, "İki üründe ortalama (10+15)/2 = 12.5"
''',
    hints=['Ortalama = toplam / adet; ikisini kategori başına biriktir.', 'İki sözlük: <code>adet</code> ve <code>toplam</code>, ikisi de <code>.get(k, 0)</code> ile.',
           'Son döngü: <code>sonuc[k] = (adet[k], round(toplam[k] / adet[k], 2))</code>'],
    why='Ortalama birleştirilebilir (toplanabilir) bir ölçü değildir; bu yüzden toplam ve adet ayrı biriktirilir, bölme en sonda yapılır. '
        'Aynı kalıp SQL\'de <code>COUNT(*)</code> ve <code>AVG(price)</code>, pandas\'ta <code>groupby("category")["price"].agg(["count", "mean"])</code> olur. '
        'Alternatif: <code>collections.defaultdict(list)</code> ile fiyatları listeye toplayıp <code>statistics.mean</code> kullanmak; daha okunur ama daha çok bellek harcar.',
    tags=['sözlük', 'ortalama', 'gruplama'], min=7)

add(id='b-414', lv='temel', diff=1, kind='bug', title='Kritik stok listesi yanlış sırada',
    q='<p><b>Depo sorumlusu şikâyet ediyor:</b> "Kritik stok raporunda en acil ürün en üstte olmalı ama liste alfabetik geliyor."</p>'
      '<p><code>kritik_stok(urunler, esik=30)</code> stoğu <code>esik</code> değerinin <b>altında</b> olan ürünlerin adlarını, stoğu <b>en az olan başta</b> olacak şekilde döndürmeli '
      '(eşit stokta ada göre). Kodda bir hata var: <b>hatayı bul ve düzelt</b>.</p>',
    start='''
import veri

urunler = veri.kayitlar("anadolu_market", "products")


def kritik_stok(urunler, esik=30):
    kritik = []
    for u in urunler:
        if u["stock"] < esik:
            kritik.append(u["name"])
    return sorted(kritik)
''',
    sol='''
import veri

urunler = veri.kayitlar("anadolu_market", "products")


def kritik_stok(urunler, esik=30):
    kritik = []
    for u in urunler:
        if u["stock"] < esik:
            kritik.append((u["stock"], u["name"]))
    kritik.sort()
    return [ad for _, ad in kritik]


print(kritik_stok(urunler))
''',
    calc={'R': 'kritik_stok(urunler)', 'R50': 'kritik_stok(urunler, 50)'},
    tests='''
assert kritik_stok(urunler) == @R@, "Stoğu 30\\'un altındaki ürünler, stok artan sırada olmalı"
assert kritik_stok(urunler, 50) == @R50@, "Eşik 50 iken de stok sırası korunmalı"
ornek = [{"name": "Zeytin", "stock": 2}, {"name": "Bal", "stock": 9}, {"name": "Ayran", "stock": 9}, {"name": "Su", "stock": 40}]
assert kritik_stok(ornek) == ["Zeytin", "Ayran", "Bal"], "Önce stok (2), eşit stokta (9) ada göre: Ayran, Bal"
''',
    hints=['Liste neye göre sıralanıyor? Yalnız adları biriktirince stok bilgisi kayboluyor.',
           'Ad yerine <code>(stok, ad)</code> demeti biriktir; demetler önce ilk, sonra ikinci elemana göre sıralanır.',
           'Ya da: <code>sorted(secilenler, key=lambda u: (u["stock"], u["name"]))</code>'],
    why='Hata, sıralama anahtarının kaybolmasıydı: yalnız adlar listeye girince <code>sorted</code> alfabetik sıralar. '
        'Demetlerle sıralama (önce stok, sonra ad) eşitlikte de belirli bir sıra verir; raporun her çalıştırmada aynı çıkması için bu önemlidir. '
        'Alternatif: ürün sözlüklerini süzüp <code>key=lambda u: (u["stock"], u["name"])</code> ile sıralamak. Karmaşıklık O(n log n).',
    tags=['sıralama', 'demet', 'key'], min=5)

add(id='b-415', lv='temel', diff=1, kind='tamamla', title='Şehir dağılımı ve boş şehirler',
    q='<p><b>Bölge satış ekibi soruyor:</b> "Müşterilerimiz hangi şehirlerde? Şehri boş bırakanları da ayrı görmek istiyoruz."</p>'
      '<p><code>sehir_dagilimi(musteriler)</code> fonksiyonundaki <code>___</code> boşluklarını doldur. <code>veri.kayitlar</code> boş hücreleri <code>None</code> getirir; '
      'boş şehirler <code>"Bilinmiyor"</code> anahtarında toplanmalı. Sonuç, sayıya göre azalan sıralı <code>(şehir, sayı)</code> listesi olsun (eşitlikte şehir adına göre).</p>',
    start='''
import veri

musteriler = veri.kayitlar("anadolu_market", "customers")


def sehir_dagilimi(musteriler):
    sayac = {}
    for m in musteriler:
        sehir = m["city"] ___ "Bilinmiyor"
        sayac[sehir] = sayac.___(sehir, 0) + 1
    return sorted(sayac.items(), key=lambda x: (___, x[0]))
''',
    sol='''
import veri

musteriler = veri.kayitlar("anadolu_market", "customers")


def sehir_dagilimi(musteriler):
    sayac = {}
    for m in musteriler:
        sehir = m["city"] or "Bilinmiyor"
        sayac[sehir] = sayac.get(sehir, 0) + 1
    return sorted(sayac.items(), key=lambda x: (-x[1], x[0]))


print(sehir_dagilimi(musteriler)[:5])
''',
    calc={'R': 'sehir_dagilimi(musteriler)'},
    tests='''
r = sehir_dagilimi(musteriler)
assert r[0] == ("İstanbul", 28), "En çok müşteri İstanbul\\'da (28)"
assert dict(r).get("Bilinmiyor") == 7, "Şehri boş 7 müşteri \\"Bilinmiyor\\" altında toplanmalı"
assert None not in dict(r), "None anahtar olarak kalmamalı"
assert r == @R@, "Sıra: önce sayı azalan, eşitlikte şehir adı"
''',
    hints=['<code>None or "Bilinmiyor"</code> ifadesi ne döndürür?', 'Sayaçta anahtar yoksa varsayılan veren sözlük yöntemi <code>get</code>.',
           'Azalan sayı için anahtarın ilk elemanı <code>-x[1]</code> olur.'],
    why='<code>a or b</code>, a "boş" (None, "", 0) ise b\'yi döndürür; eksik değeri doldurmanın en kısa yoludur (Power Query\'deki "Değiştir: null → Bilinmiyor"). '
        'Dikkat: değer 0 olabilecek sayısal alanlarda <code>or</code> 0\'ı da ezer; orada <code>x if x is not None else ...</code> kullan. '
        'Sıralamada <code>-x[1]</code> sayıyı azalan, <code>x[0]</code> eşitlikte adı artan yapar.',
    tags=['None', 'or', 'sıralama'], min=4)

add(id='b-416', lv='temel', diff=1, kind='yaz', title='Brüt, indirim ve net ciro',
    q='<p><b>Finans ekibi soruyor:</b> "Kampanyalarla toplam ne kadar indirim verdik? Brüt ve net ciroyu yan yana görelim."</p>'
      '<p><code>ciro_ozeti(kalemler)</code> fonksiyonunu yaz. <code>kalemler</code> = <code>veri.kayitlar("anadolu_market", "order_items")</code>. Her satır için:</p>'
      '<ul><li>brüt = <code>quantity * unit_price</code></li><li>indirim = brüt × <code>discount</code></li><li>net = brüt − indirim</li></ul>'
      '<p>Fonksiyon <code>(brut, indirim, net)</code> demetini döndürsün; her biri 2 ondalığa yuvarlanmış toplam.</p>',
    start='''
import veri

kalemler = veri.kayitlar("anadolu_market", "order_items")


def ciro_ozeti(kalemler):
    pass
''',
    sol='''
import veri

kalemler = veri.kayitlar("anadolu_market", "order_items")


def ciro_ozeti(kalemler):
    brut = indirim = 0.0
    for k in kalemler:
        b = k["quantity"] * k["unit_price"]
        brut += b
        indirim += b * k["discount"]
    return round(brut, 2), round(indirim, 2), round(brut - indirim, 2)


b, i, n = ciro_ozeti(kalemler)
print(f"Brüt {b:,.2f} TL | İndirim {i:,.2f} TL | Net {n:,.2f} TL")
''',
    calc={'R': 'ciro_ozeti(kalemler)'},
    tests='''
r = ciro_ozeti(kalemler)
assert isinstance(r, tuple) and len(r) == 3, "Üç elemanlı demet döndürmeli: (brut, indirim, net)"
assert r == @R@, "Toplamlar gerçek veriyle tutmuyor"
assert abs(r[0] - r[1] - r[2]) < 0.02, "net = brüt - indirim olmalı"
assert ciro_ozeti([{"quantity": 2, "unit_price": 100.0, "discount": 0.1}]) == (200.0, 20.0, 180.0), "2 × 100 TL, %10 indirim → (200, 20, 180)"
''',
    hints=['Üç toplamı aynı döngüde biriktir.', '<code>discount</code> 0.10 gibi orandır; tutara çevirmek için brütle çarp.',
           'Yuvarlamayı en sonda, <code>return</code> satırında yap.'],
    why='Tek döngüde birden çok toplam biriktirmek veriyi bir kez gezer: O(n). Yuvarlamayı satır satır yapmak kuruş farkları üretir; raporlamada önce topla, sonra yuvarla. '
        'Para hesabında kuruşa kadar kesinlik gerekiyorsa <code>decimal.Decimal</code> kullanılır. pandas karşılığı: <code>(df.quantity * df.unit_price * df.discount).sum()</code>.',
    tags=['toplama', 'demet', 'float'], min=5)

# ---------------------------------------------------------------- ORTA (pandas / sqlite)
add(id='b-417', lv='orta', diff=2, kind='rehberli', needs=['pandas'], title='En çok ciro yapan 5 şehir',
    q='<p><b>Bölge müdürü soruyor:</b> "Yeni depo yatırımı için en çok ciro getiren 5 şehri öğrenmek istiyorum."</p>'
      '<p><code>ilk5_sehir(orders, items, customers)</code> fonksiyonunu yaz; üç parametre <code>veri.oku</code> ile okunmuş DataFrame\'lerdir. Kurallar:</p>'
      '<ul><li>Satır cirosu = <code>quantity * unit_price * (1 - discount)</code></li><li>İptal (<code>cancelled</code>) ve iade (<code>returned</code>) siparişler sayılmaz</li>'
      '<li>Şehri boş müşteriler dışarıda kalır</li></ul><p>Dönüş: ciroya göre azalan 5 şehir adının <b>listesi</b>.</p>',
    guide=['<code>items</code> tablosuna <code>ciro</code> sütunu ekle.', 'Geçerli siparişleri süz: <code>~orders["status"].isin([...])</code>.',
           'Kalemleri siparişlerle (<code>order_id</code>), sonra müşterilerle (<code>customer_id</code>) birleştir (<code>merge</code>).',
           '<code>groupby("city")["ciro"].sum()</code>, sonra <code>nlargest(5)</code> ve <code>index.tolist()</code>.'],
    example='''
import pandas as pd
# Benzer teknik: iki tabloyu birleştirip gruplamak (küçük örnek)
sat = pd.DataFrame({"magaza": [1, 1, 2], "tutar": [100, 50, 70]})
mag = pd.DataFrame({"magaza": [1, 2], "ilce": ["Kadıköy", "Bornova"]})
print(sat.merge(mag, on="magaza").groupby("ilce")["tutar"].sum().nlargest(1))
''',
    start='''
import veri
import pandas as pd

orders = veri.oku("anadolu_market", "orders")
items = veri.oku("anadolu_market", "order_items")
customers = veri.oku("anadolu_market", "customers")


def ilk5_sehir(orders, items, customers):
    items = items.assign(ciro=items["quantity"] * items["unit_price"] * (1 - items["discount"]))
    gecerli = orders[~orders["status"].isin(["cancelled", "returned"])]
    # TODO 1: items ile gecerli'yi order_id üzerinden birleştir
    # TODO 2: sonucu customers ile customer_id üzerinden birleştir
    # TODO 3: şehre göre ciroyu topla, en büyük 5 şehrin adını liste olarak döndür
    return []
''',
    sol='''
import veri
import pandas as pd

orders = veri.oku("anadolu_market", "orders")
items = veri.oku("anadolu_market", "order_items")
customers = veri.oku("anadolu_market", "customers")


def ilk5_sehir(orders, items, customers):
    items = items.assign(ciro=items["quantity"] * items["unit_price"] * (1 - items["discount"]))
    gecerli = orders[~orders["status"].isin(["cancelled", "returned"])]
    df = items.merge(gecerli, on="order_id").merge(customers, on="customer_id")
    return df.groupby("city")["ciro"].sum().nlargest(5).index.tolist()


print(ilk5_sehir(orders, items, customers))
''',
    calc={'R': 'ilk5_sehir(orders, items, customers)'},
    tests='''
r = ilk5_sehir(orders, items, customers)
assert isinstance(r, list), "Şehir adlarını liste olarak döndür (index.tolist())"
assert len(r) == 5, "Tam 5 şehir dönmeli"
assert r == @R@, "Sıra ya da şehirler farklı: iptal/iade siparişleri çıkardın mı, ciroyu indirimli hesapladın mı?"
''',
    hints=['Üç tabloyu iki <code>merge</code> ile zincirle: kalem → sipariş → müşteri.',
           '<code>merge</code> varsayılan olarak iç birleştirmedir; geçersiz siparişlerin kalemleri kendiliğinden düşer. Boş şehirleri <code>groupby</code> zaten atlar.',
           '<code>df.groupby("city")["ciro"].sum().nlargest(5).index.tolist()</code>'],
    why='Önce süzüp sonra birleştirmek hem doğru hem hızlıdır: iç birleştirme (inner join) geçersiz siparişlerin kalemlerini kendiliğinden atar. '
        '<code>groupby</code> NaN anahtarları varsayılan olarak dışarıda bırakır (<code>dropna=True</code>); boş şehirleri görmek isteseydin <code>dropna=False</code> verirdin. '
        '<code>nlargest(5)</code>, <code>sort_values(ascending=False).head(5)</code> ile aynıdır ama niyeti daha açık anlatır. SQL karşılığı: JOIN + GROUP BY + ORDER BY + LIMIT 5.',
    tags=['merge', 'groupby', 'nlargest'], min=8)

add(id='b-418', lv='orta', diff=2, kind='yaz', needs=['sqlite3'], title='Aylık sipariş sayısı (SQL)',
    q='<p><b>Satış planlama ekibi soruyor:</b> "Bir yıl içinde siparişler aylara nasıl dağılıyor? Sezonsallığı görmek istiyoruz."</p>'
      '<p><code>con = veri.baglan("anadolu_market")</code> ile bellek içi SQLite bağlantısı kur. <code>aylik_siparis(con, yil)</code> fonksiyonunu yaz: '
      'verilen yılın her ayı için <code>("YYYY-MM", siparis_sayisi)</code> demetlerinden oluşan, aya göre sıralı listeyi döndürsün. '
      'Yıl parametresini SQL\'e <b>yer tutucu</b> (<code>?</code>) ile ver; metin birleştirme kullanma.</p>',
    start='''
import veri

con = veri.baglan("anadolu_market")


def aylik_siparis(con, yil):
    pass
''',
    sol='''
import veri

con = veri.baglan("anadolu_market")


def aylik_siparis(con, yil):
    sql = """
        SELECT strftime('%Y-%m', order_date) AS ay, COUNT(*) AS adet
        FROM orders
        WHERE strftime('%Y', order_date) = ?
        GROUP BY ay
        ORDER BY ay
    """
    return con.execute(sql, (str(yil),)).fetchall()


for ay, adet in aylik_siparis(con, 2024):
    print(ay, "#" * (adet // 5), adet)
''',
    calc={'R24': 'aylik_siparis(con, 2024)', 'R23': 'aylik_siparis(con, 2023)[:3]'},
    tests='''
r = aylik_siparis(con, 2024)
assert isinstance(r, list) and len(r) == 12, "2024 için 12 ay dönmeli"
assert r == @R24@, "2024 aylık sayıları tutmuyor"
assert aylik_siparis(con, 2023)[:3] == @R23@, "2023\\'ün ilk üç ayı tutmuyor: yıl parametresi doğru kullanılıyor mu?"
assert aylik_siparis(con, 1999) == [], "Siparişi olmayan yılda boş liste dönmeli"
assert "?" in __source__, "Yılı SQL\\'e ? yer tutucusuyla ver (SQL enjeksiyonuna karşı)"
''',
    hints=['SQLite\'ta tarih parçası almak için <code>strftime(\'%Y-%m\', order_date)</code>.',
           'Yıl filtresi: <code>WHERE strftime(\'%Y\', order_date) = ?</code>, parametre metin olmalı: <code>(str(yil),)</code>.',
           '<code>GROUP BY ay ORDER BY ay</code>, sonra <code>con.execute(sql, (str(yil),)).fetchall()</code>'],
    why='SQLite\'ta tarih türü yoktur, tarihler ISO metin olarak durur; <code>strftime</code> parçalamayı yapar. ISO biçimi (YYYY-MM) alfabetik sıralandığında kronolojik de sıralanır. '
        'Parametreyi <code>?</code> ile vermek SQL enjeksiyonunu önler ve tür dönüşümünü sürücüye bırakır. <code>strftime</code> metin döndürdüğü için 2024 sayısını '
        '<code>str()</code> ile metne çevirmezsen eşleşme olmaz ve boş liste alırsın; bu en sık yapılan hatadır.',
    tags=['sqlite3', 'strftime', 'GROUP BY', 'parametre'], min=7)

add(id='b-419', lv='orta', diff=2, kind='rehberli', needs=['pandas'], title='Kategori bazında brüt kâr marjı',
    q='<p><b>Ticaret direktörü soruyor:</b> "Hangi kategori bize en çok kazandırıyor? Ciroyu değil, <b>marjı</b> görmek istiyorum."</p>'
      '<p><code>kategori_marji(items, products)</code> fonksiyonunu yaz (iki DataFrame, <code>veri.oku</code> ile). Her satır için '
      'net = <code>quantity * unit_price * (1 - discount)</code>, maliyet = <code>quantity * cost</code> (cost ürün tablosunda). '
      'Kategori marjı = (net toplamı − maliyet toplamı) / net toplamı × 100. Sonuç: kategori indeksli, marja göre <b>azalan</b>, 1 ondalığa yuvarlanmış bir <b>Series</b>.</p>',
    guide=['Kalemleri ürünlerle <code>product_id</code> üzerinden birleştir.', '<code>net</code> ve <code>maliyet</code> sütunlarını ekle.',
           'Kategori başına iki sütunu da topla (<code>groupby(...)[["net", "maliyet"]].sum()</code>).',
           'Marjı toplamlardan hesapla (satır marjlarının ortalamasını alma!), yuvarla, azalan sırala.'],
    example='''
import pandas as pd
# Benzer teknik: toplamlardan oran hesaplamak (satır oranlarının ortalaması değil)
df = pd.DataFrame({"bolge": ["A", "A", "B"], "gelir": [100, 900, 50], "gider": [90, 600, 10]})
g = df.groupby("bolge")[["gelir", "gider"]].sum()
print(((g["gelir"] - g["gider"]) / g["gelir"] * 100).round(1))
''',
    start='''
import veri
import pandas as pd

items = veri.oku("anadolu_market", "order_items")
products = veri.oku("anadolu_market", "products")


def kategori_marji(items, products):
    df = items.merge(products[["product_id", "category", "cost"]], on="product_id")
    # TODO 1: net ve maliyet sütunlarını ekle
    # TODO 2: kategoriye göre net ve maliyet toplamlarını al
    # TODO 3: marj yüzdesini hesapla, 1 ondalığa yuvarla, azalan sırala
    return None
''',
    sol='''
import veri
import pandas as pd

items = veri.oku("anadolu_market", "order_items")
products = veri.oku("anadolu_market", "products")


def kategori_marji(items, products):
    df = items.merge(products[["product_id", "category", "cost"]], on="product_id")
    df["net"] = df["quantity"] * df["unit_price"] * (1 - df["discount"])
    df["maliyet"] = df["quantity"] * df["cost"]
    g = df.groupby("category")[["net", "maliyet"]].sum()
    marj = (g["net"] - g["maliyet"]) / g["net"] * 100
    return marj.round(1).sort_values(ascending=False)


print(kategori_marji(items, products))
''',
    calc={'R': 'kategori_marji(items, products).to_dict()', 'ILK': 'kategori_marji(items, products).index[0]'},
    tests='''
r = kategori_marji(items, products)
assert isinstance(r, pd.Series), "Sonuç bir pandas Series olmalı"
assert len(r) == 7, "7 kategori olmalı"
assert r.index[0] == @ILK@, "Marjı en yüksek kategori en başta olmalı (azalan sıra)"
beklenen = @R@
for k, v in beklenen.items():
    assert abs(r[k] - v) < 0.051, f"{k} marjı {v} olmalı; toplamlardan hesapladığından emin ol"
assert r.is_monotonic_decreasing, "Seri azalan sırada olmalı"
''',
    hints=['Marj oranı, toplam net ve toplam maliyetten hesaplanır; satır satır oranların ortalaması farklı (yanlış) sonuç verir.',
           '<code>g = df.groupby("category")[["net", "maliyet"]].sum()</code>',
           '<code>((g["net"] - g["maliyet"]) / g["net"] * 100).round(1).sort_values(ascending=False)</code>'],
    why='Oranların ortalaması, oranın kendisi değildir: 10 TL\'lik bir satırdaki %50 marj ile 10.000 TL\'lik satırdaki %5 marj eşit ağırlıkta olmamalı. '
        'Bu yüzden önce pay ve payda toplanır, sonra bölünür (Power BI\'da DIVIDE(SUM, SUM) kalıbı). Not: kalemlerde satış anındaki fiyat (<code>unit_price</code>) '
        'kullanılır; ürün tablosundaki güncel fiyat (<code>price</code>) geçmiş satışları yansıtmaz.',
    tags=['merge', 'groupby', 'marj', 'oran'], min=8)

add(id='b-420', lv='orta', diff=2, kind='bug', needs=['pandas'], title='A/B testi: yanlış dönüşüm oranı',
    q='<p><b>Ürün ekibi soruyor:</b> "Yeni ödeme sayfası tasarımı (B) dönüşümü artırdı mı?" Analist aşağıdaki kodu yazdı ama iki grubun oranları da '
      'gerçekte olduğundan yarı yarıya düşük çıkıyor. <b>Hatayı bul ve düzelt.</b></p>'
      '<p><code>donusum(ab)</code>, <code>variant</code> başına dönüşüm oranını yüzde olarak (2 ondalık) döndüren bir Series vermeli. '
      'Veri: <code>veri.oku("anadolu_market", "ab_test")</code>, <code>converted</code> 1/0.</p>',
    start='''
import veri
import pandas as pd

ab = veri.oku("anadolu_market", "ab_test")


def donusum(ab):
    donusen = ab.groupby("variant")["converted"].sum()
    return (donusen / len(ab) * 100).round(2)
''',
    sol='''
import veri
import pandas as pd

ab = veri.oku("anadolu_market", "ab_test")


def donusum(ab):
    return (ab.groupby("variant")["converted"].mean() * 100).round(2)


r = donusum(ab)
print(r)
print("Fark (yüzde puan):", round(r["B"] - r["A"], 2))
''',
    calc={'A': 'float(donusum(ab)["A"])', 'B': 'float(donusum(ab)["B"])'},
    tests='''
r = donusum(ab)
assert abs(r["A"] - @A@) < 0.01, "A grubu oranı yanlış: payda grubun kendi kullanıcı sayısı olmalı, tüm deneme değil"
assert abs(r["B"] - @B@) < 0.01, "B grubu oranı yanlış"
kucuk = pd.DataFrame({"variant": ["A", "A", "A", "B"], "converted": [1, 0, 0, 1]})
r2 = donusum(kucuk)
assert abs(r2["A"] - 33.33) < 0.01 and r2["B"] == 100.0, "Dengesiz gruplarda da doğru olmalı: A 1/3, B 1/1"
''',
    hints=['Pay grup içi dönüşen sayısı; peki payda ne olmalı?', '<code>len(ab)</code> iki grubun toplamıdır. Her grubun kendi boyutu gerekir.',
           '1/0 sütununun ortalaması zaten orandır: <code>groupby("variant")["converted"].mean()</code>'],
    why='Payda tüm deney (2000 kişi) alınınca her grubun oranı yaklaşık yarıya iner ve gruplar dengesizse karşılaştırma da bozulur. '
        '0/1 sütununun ortalaması, 1\'lerin oranıdır; bu yüzden <code>mean()</code> en temiz çözümdür. Gerçek bir A/B kararı için farkın istatistiksel '
        'olarak anlamlı olup olmadığına da bakılır (iki oran z-testi ya da ki-kare; <code>scipy.stats.chi2_contingency</code>).',
    tags=['groupby', 'mean', 'A/B testi'], min=5)

add(id='b-421', lv='orta', diff=2, kind='yaz', needs=['pandas'], title='Satın alma hunisi',
    q='<p><b>Dijital pazarlama ekibi soruyor:</b> "Ziyaretçilerimizi hangi adımda kaybediyoruz?"</p>'
      '<p><code>huni(events)</code> fonksiyonunu yaz (<code>veri.oku("anadolu_market", "web_events")</code>). Adım sırası: '
      '<code>visit → product_view → add_to_cart → checkout → purchase</code>. Her adım için o olayı yaşayan <b>benzersiz</b> kullanıcı sayısını bul. '
      'Dönüş: <code>[(adim, kullanici_sayisi, onceki_adima_gore_yuzde), ...]</code>; ilk adımın yüzdesi <code>100.0</code>, diğerleri 1 ondalık.</p>',
    start='''
import veri
import pandas as pd

events = veri.oku("anadolu_market", "web_events")
ADIMLAR = ["visit", "product_view", "add_to_cart", "checkout", "purchase"]


def huni(events):
    pass
''',
    sol='''
import veri
import pandas as pd

events = veri.oku("anadolu_market", "web_events")
ADIMLAR = ["visit", "product_view", "add_to_cart", "checkout", "purchase"]


def huni(events):
    tekil = events.groupby("event_type")["user_id"].nunique()
    sonuc, onceki = [], None
    for adim in ADIMLAR:
        n = int(tekil.get(adim, 0))
        oran = 100.0 if onceki is None else (round(n / onceki * 100, 1) if onceki else 0.0)
        sonuc.append((adim, n, oran))
        onceki = n
    return sonuc


for adim, n, oran in huni(events):
    print(f"{adim:<13}{n:>5}  %{oran}")
''',
    calc={'R': 'huni(events)'},
    tests='''
r = huni(events)
assert [x[0] for x in r] == ADIMLAR, "Adımlar huni sırasında olmalı"
assert r[0][2] == 100.0, "İlk adımın oranı 100.0"
assert r == @R@, "Benzersiz kullanıcı sayıları ya da oranlar tutmuyor (nunique kullandın mı?)"
kucuk = pd.DataFrame({"user_id": [1, 1, 1, 2], "event_type": ["visit", "product_view", "product_view", "visit"]})
assert huni(kucuk)[1] == ("product_view", 1, 50.0), "Olay değil kullanıcı sayılmalı: 1 numaralı kullanıcı iki ürüne baktı ama 1 kişidir"
assert huni(kucuk)[2] == ("add_to_cart", 0, 0.0), "Hiç kimsenin yaşamadığı adım 0 kişi ve %0.0 olmalı"
''',
    hints=['Satır sayısı değil kişi sayısı istendiği için <code>nunique()</code> gerekiyor.',
           '<code>events.groupby("event_type")["user_id"].nunique()</code> her adımın tekil kullanıcısını verir; sonra ADIMLAR sırasıyla gez.',
           'Önceki adımın sayısını bir değişkende tut; oran = n / onceki * 100.'],
    why='Huni analizinde olay sayısı yanıltır: bir kişi 5 ürüne bakarsa 5 olay ama 1 kullanıcıdır. <code>nunique</code> tekil sayar (SQL\'de COUNT(DISTINCT user_id)). '
        'Sıra sözlükten değil, iş tanımından (ADIMLAR listesi) gelmeli; alfabetik sıra huniyi bozar. Daha katı bir huni, kişinin adımları <b>sırayla</b> yaşamasını da şart koşar '
        '(ör. önce visit sonra purchase); bunun için kullanıcı bazında olay zamanlarını karşılaştırmak gerekir.',
    tags=['nunique', 'huni', 'oran'], min=8)

add(id='b-422', lv='orta', diff=2, kind='tamamla', needs=['sqlite3'], title='Hiç sipariş vermemiş müşteriler',
    q='<p><b>CRM ekibi soruyor:</b> "Kayıt olup hiç alışveriş yapmayan müşterilere hoş geldin kuponu göndereceğiz. Kimler?"</p>'
      '<p><code>siparissiz(con)</code> fonksiyonundaki <code>___</code> boşluklarını doldur: hiç siparişi olmayan müşterilerin <code>customer_id</code> listesini, artan sırada döndürsün. '
      'Bağlantı: <code>veri.baglan("anadolu_market")</code>.</p>',
    start='''
import veri

con = veri.baglan("anadolu_market")


def siparissiz(con):
    sql = """
        SELECT c.customer_id
        FROM customers AS c
        ___ JOIN orders AS o ON o.customer_id = c.customer_id
        WHERE o.order_id ___
        ORDER BY c.customer_id
    """
    return [satir[0] for satir in con.execute(sql)]
''',
    sol='''
import veri

con = veri.baglan("anadolu_market")


def siparissiz(con):
    sql = """
        SELECT c.customer_id
        FROM customers AS c
        LEFT JOIN orders AS o ON o.customer_id = c.customer_id
        WHERE o.order_id IS NULL
        ORDER BY c.customer_id
    """
    return [satir[0] for satir in con.execute(sql)]


print(siparissiz(con))
''',
    calc={'R': 'siparissiz(con)'},
    tests='''
r = siparissiz(con)
assert r == @R@, "Sonuç farklı: LEFT JOIN + IS NULL ile eşleşmeyen müşterileri bul"
assert r == sorted(r), "Liste artan sırada olmalı"
assert all(isinstance(x, int) for x in r), "customer_id değerleri tam sayı olmalı"
''',
    hints=['Sağ tabloda eşi olmayan satırları da korumak için hangi JOIN türü gerekir?',
           'Eşleşmeyen satırlarda <code>o</code> tablosunun sütunları NULL gelir.', '<code>LEFT JOIN</code> ve <code>IS NULL</code> (<code>= NULL</code> değil!).'],
    why='"Karşılığı olmayanları bul" sorusu anti-join kalıbıdır: LEFT JOIN tüm müşterileri tutar, siparişi olmayanların sipariş sütunları NULL olur, '
        'WHERE ... IS NULL yalnız onları bırakır. SQL\'de <code>= NULL</code> hiçbir zaman doğru olmaz (NULL bilinmeyen demektir), mutlaka <code>IS NULL</code>. '
        'Alternatif: <code>WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.customer_id)</code>; pandas\'ta <code>merge(how="left", indicator=True)</code> ve <code>_merge == "left_only"</code>.',
    tags=['LEFT JOIN', 'IS NULL', 'anti-join'], min=4)

add(id='b-423', lv='orta', diff=2, kind='rehberli', needs=['sqlite3'], title='Departman maaş tablosu (SQL)',
    q='<p><b>İK direktörü soruyor:</b> "Bütçe görüşmesi için her departmanın çalışan sayısını ve ortalama maaşını görmem lazım."</p>'
      '<p><code>departman_maaslari(con)</code> fonksiyonunu yaz (<code>veri.baglan("anadolu_market")</code>). Dönüş: <code>(departman_adi, calisan_sayisi, ortalama_maas)</code> demetleri; '
      'ortalama tam sayıya yuvarlanmış (<code>ROUND(..., 0)</code> yerine Python\'da <code>int(round(x))</code> da olur), ortalamaya göre <b>azalan</b>. '
      'Departmanı olmayan (genel müdür) çalışan dışarıda kalsın.</p>',
    guide=['<code>employees</code> ile <code>departments</code> tablosunu <code>dept_id</code> üzerinden INNER JOIN yap (departmanı NULL olan kendiliğinden düşer).',
           '<code>GROUP BY d.name</code> ile <code>COUNT(*)</code> ve <code>AVG(e.salary)</code> hesapla.', '<code>ORDER BY</code> ile ortalamaya göre azalan sırala.',
           'Sonuç satırlarında ortalamayı <code>int(round(...))</code> ile tam sayıya çevir.'],
    example='''
import sqlite3
# Benzer teknik: JOIN + GROUP BY + AVG (küçük örnek)
con = sqlite3.connect(":memory:")
con.executescript("""
CREATE TABLE ekip(id, ad); CREATE TABLE kisi(ekip_id, prim);
INSERT INTO ekip VALUES (1, 'Kuzey'), (2, 'Güney');
INSERT INTO kisi VALUES (1, 100), (1, 300), (2, 50);
""")
print(con.execute("SELECT e.ad, COUNT(*), AVG(k.prim) FROM kisi k JOIN ekip e ON e.id = k.ekip_id GROUP BY e.ad ORDER BY 3 DESC").fetchall())
''',
    start='''
import veri

con = veri.baglan("anadolu_market")


def departman_maaslari(con):
    sql = """
        SELECT d.name, COUNT(*) AS n, AVG(e.salary) AS ort
        FROM employees AS e
        -- TODO 1: departments tablosunu dept_id üzerinden bağla
        -- TODO 2: departman adına göre grupla
        -- TODO 3: ortalamaya göre azalan sırala
    """
    satirlar = con.execute(sql).fetchall()
    # TODO 4: ortalamayı tam sayıya yuvarlayıp demet listesi döndür
    return satirlar
''',
    sol='''
import veri

con = veri.baglan("anadolu_market")


def departman_maaslari(con):
    sql = """
        SELECT d.name, COUNT(*) AS n, AVG(e.salary) AS ort
        FROM employees AS e
        JOIN departments AS d ON d.dept_id = e.dept_id
        GROUP BY d.name
        ORDER BY ort DESC
    """
    satirlar = con.execute(sql).fetchall()
    return [(ad, n, int(round(ort))) for ad, n, ort in satirlar]


for ad, n, ort in departman_maaslari(con):
    print(f"{ad:<18}{n:>3} kişi  {ort:>8,} TL")
''',
    calc={'R': 'departman_maaslari(con)'},
    tests='''
r = departman_maaslari(con)
assert r == @R@, "Departman tablosu tutmuyor: JOIN, GROUP BY ve azalan sırayı kontrol et"
assert sum(x[1] for x in r) == 26, "27 çalışandan departmanı olmayan 1 kişi (genel müdür) dışarıda kalmalı → 26"
assert all(isinstance(x[2], int) for x in r), "Ortalama maaş tam sayı olmalı"
''',
    hints=['Departman adını almak için iki tabloyu bağlamalısın.', 'INNER JOIN, eşi olmayan satırları (dept_id NULL) atar.',
           '<code>JOIN departments AS d ON d.dept_id = e.dept_id GROUP BY d.name ORDER BY ort DESC</code>'],
    why='INNER JOIN yalnız iki tarafta da eşi olan satırları döndürür; bu yüzden departmanı NULL olan genel müdür kendiliğinden düşer. '
        'Onu da "Departmansız" diye görmek isteseydin LEFT JOIN + <code>COALESCE(d.name, \'Departmansız\')</code> kullanırdın. '
        'SQL\'de seçimdeki takma ada (<code>ort</code>) ORDER BY içinde başvurabilirsin ama WHERE içinde başvuramazsın; çünkü WHERE, SELECT\'ten önce değerlendirilir.',
    tags=['JOIN', 'GROUP BY', 'AVG'], min=7)

add(id='b-424', lv='orta', diff=2, kind='yaz', needs=['pandas'], title='Son fiyat güncellemesi ve artış yüzdesi',
    q='<p><b>Fiyatlama ekibi soruyor:</b> "Ekim-kasım fiyat güncellemelerinden sonra hangi ürünün fiyatı en çok arttı?"</p>'
      '<p><code>fiyat_degisimi(products, updates)</code> fonksiyonunu yaz (<code>products</code> ve <code>price_updates</code> tabloları). '
      'Bir ürünün birden çok güncellemesi olabilir; yalnız <b>en son</b> (<code>updated_at</code> en büyük) olanı geçerlidir. '
      'Dönüş: <code>name, price, new_price, degisim</code> sütunlu DataFrame; <code>degisim</code> = (new_price − price) / price × 100, 1 ondalık; '
      '<code>degisim</code>\'e göre azalan, index 0\'dan başlayan.</p>',
    start='''
import veri
import pandas as pd

products = veri.oku("anadolu_market", "products")
updates = veri.oku("anadolu_market", "price_updates")


def fiyat_degisimi(products, updates):
    pass
''',
    sol='''
import veri
import pandas as pd

products = veri.oku("anadolu_market", "products")
updates = veri.oku("anadolu_market", "price_updates")


def fiyat_degisimi(products, updates):
    son = updates.sort_values("updated_at").drop_duplicates("product_id", keep="last")
    df = son.merge(products, on="product_id")
    df["degisim"] = ((df["new_price"] - df["price"]) / df["price"] * 100).round(1)
    df = df.sort_values("degisim", ascending=False)
    return df[["name", "price", "new_price", "degisim"]].reset_index(drop=True)


print(fiyat_degisimi(products, updates).head())
''',
    calc={'N': 'len(fiyat_degisimi(products, updates))', 'ILK': 'fiyat_degisimi(products, updates).iloc[0].to_dict()',
          'SON': 'fiyat_degisimi(products, updates).iloc[-1]["name"]',
          'P31': 'float(fiyat_degisimi(products, updates).set_index("name").loc[products.set_index("product_id").loc[31, "name"], "new_price"])',
          'AD31': 'products.set_index("product_id").loc[31, "name"]'},
    tests='''
r = fiyat_degisimi(products, updates)
assert list(r.columns) == ["name", "price", "new_price", "degisim"], "Sütunlar: name, price, new_price, degisim"
assert len(r) == @N@, "Her ürün bir kez görünmeli (birden çok güncellemesi olanlarda yalnız sonuncusu)"
ilk = r.iloc[0].to_dict()
assert ilk["name"] == @ILK@["name"] and abs(ilk["degisim"] - @ILK@["degisim"]) < 0.05, "En çok artan ürün en üstte olmalı"
assert r.iloc[-1]["name"] == @SON@, "En az artan (ya da en çok düşen) ürün en altta olmalı"
assert r.set_index("name").loc[@AD31@, "new_price"] == @P31@, "İki kez güncellenen ürünün EN SON fiyatı alınmalı"
assert list(r.index) == list(range(len(r))), "index 0\\'dan başlamalı (reset_index(drop=True))"
''',
    hints=['Önce her ürünün son güncellemesini bul: tarihe göre sırala, ürün başına sonuncuyu tut.',
           '<code>updates.sort_values("updated_at").drop_duplicates("product_id", keep="last")</code>',
           'Sonra <code>merge(products, on="product_id")</code>, yüzde sütunu, sıralama ve <code>reset_index(drop=True)</code>.'],
    why='"Grup başına son kayıt" çok sık bir iştir. sort + drop_duplicates(keep="last") en okunur yoldur; alternatifler: '
        '<code>updates.loc[updates.groupby("product_id")["updated_at"].idxmax()]</code> ya da SQL\'de ROW_NUMBER() OVER (PARTITION BY product_id ORDER BY updated_at DESC) = 1. '
        'ISO biçimli tarih metinleri sözlük sırasıyla da doğru sıralanır, yine de gerçek işte <code>pd.to_datetime</code> ile çevirmek daha güvenlidir. '
        'Sık hata: son kaydı seçmeden birleştirmek, aynı ürünü iki satırda göstermek.',
    tags=['drop_duplicates', 'merge', 'son kayıt'], min=8)

# ---------------------------------------------------------------- İLERİ
add(id='b-425', lv='ileri', diff=3, kind='rehberli', needs=['pandas'], title='Kohort tutma tablosu',
    q='<p><b>Büyüme ekibi soruyor:</b> "İlk alışverişini aynı ay yapan müşterilerin kaçı sonraki aylarda geri dönüyor?"</p>'
      '<p><code>kohort_tablosu(orders)</code> fonksiyonunu yaz (<code>orders</code> DataFrame). İptal edilen siparişler sayılmasın. Adımlar:</p>'
      '<ul><li>Kohort: müşterinin <b>ilk</b> sipariş ayı (Period, aylık)</li><li>Ay farkı: sipariş ayı − kohort ayı (tam sayı)</li>'
      '<li>Her (kohort, ay farkı) hücresinde benzersiz müşteri sayısı</li><li>Her satırı 0. ay sütununa bölüp yüzdeye çevir, 1 ondalık</li></ul>'
      '<p>Dönüş: index kohort (Period), sütunlar ay farkı (0, 1, 2, ...) olan DataFrame. Boş hücreler NaN kalabilir.</p>',
    guide=['İptal olmayan siparişleri süz, <code>order_date</code>\'i tarihe çevirip <code>.dt.to_period("M")</code> ile ay sütunu ekle.',
           'Müşteri başına en küçük ayı <code>groupby("customer_id")["ay"].transform("min")</code> ile kohort sütununa yaz.',
           'Ay farkı: iki Period\'un yıl ve ay parçalarından <code>(yil1 - yil2) * 12 + (ay1 - ay2)</code>.',
           '<code>groupby(["kohort", "fark"])["customer_id"].nunique().unstack()</code> ile tabloyu kur.',
           'Tabloyu <code>div(tablo[0], axis=0)</code> ile 0. aya böl, 100 ile çarp, yuvarla.'],
    example='''
import pandas as pd
# Benzer teknik: grup içi en küçük değeri satırlara yaymak (transform) ve tabloya çevirmek (unstack)
df = pd.DataFrame({"kisi": [1, 1, 2, 2], "hafta": [1, 3, 2, 3]})
df["ilk"] = df.groupby("kisi")["hafta"].transform("min")
df["fark"] = df["hafta"] - df["ilk"]
print(df.groupby(["ilk", "fark"])["kisi"].nunique().unstack())
''',
    start='''
import veri
import pandas as pd

orders = veri.oku("anadolu_market", "orders")


def kohort_tablosu(orders):
    df = orders[orders["status"] != "cancelled"].copy()
    df["ay"] = pd.to_datetime(df["order_date"]).dt.to_period("M")
    # TODO 1: müşteri başına ilk ayı "kohort" sütununa yaz (transform)
    # TODO 2: "fark" sütunu: ay ile kohort arasındaki ay sayısı
    # TODO 3: (kohort, fark) başına benzersiz müşteri; unstack
    # TODO 4: 0. aya böl, yüzde, 1 ondalık
    return None
''',
    sol='''
import veri
import pandas as pd

orders = veri.oku("anadolu_market", "orders")


def kohort_tablosu(orders):
    df = orders[orders["status"] != "cancelled"].copy()
    df["ay"] = pd.to_datetime(df["order_date"]).dt.to_period("M")
    df["kohort"] = df.groupby("customer_id")["ay"].transform("min")
    df["fark"] = (df["ay"].dt.year - df["kohort"].dt.year) * 12 + (df["ay"].dt.month - df["kohort"].dt.month)
    tablo = df.groupby(["kohort", "fark"])["customer_id"].nunique().unstack()
    return (tablo.div(tablo[0], axis=0) * 100).round(1)


t = kohort_tablosu(orders)
print(t.iloc[:6, :6])
''',
    calc={'NK': 'len(kohort_tablosu(orders))',
          'C1': 'float(kohort_tablosu(orders).loc[pd.Period("2022-12", "M"), 1])',
          'C3': 'float(kohort_tablosu(orders).loc[pd.Period("2022-10", "M"), 2])',
          'ORT1': 'round(float(kohort_tablosu(orders)[1].mean()), 1)'},
    tests='''
t = kohort_tablosu(orders)
assert t is not None, "DataFrame döndürmeli"
assert len(t) == @NK@, "Kohort (satır) sayısı tutmuyor"
assert (t[0] == 100).all(), "0. ay sütunu her kohortta 100 olmalı (kendine bölünür)"
assert t.loc[pd.Period("2022-12", "M"), 1] == @C1@, "2022-12 kohortunun 1. ay tutma oranı tutmuyor"
assert t.loc[pd.Period("2022-10", "M"), 2] == @C3@, "2022-10 kohortunun 2. ay oranı tutmuyor"
assert abs(t[1].mean() - @ORT1@) < 0.06, "1. ay ortalama tutma oranı tutmuyor"
''',
    hints=['Kohort = müşterinin ilk sipariş ayı; <code>transform("min")</code> bu değeri müşterinin tüm satırlarına yayar.',
           'Ay farkı için Period\'ların <code>.dt.year</code> ve <code>.dt.month</code> parçalarını kullan.',
           '<code>tablo = df.groupby(["kohort", "fark"])["customer_id"].nunique().unstack()</code> ve <code>tablo.div(tablo[0], axis=0)</code>'],
    why='Kohort analizi müşterileri "doğum ayına" göre gruplar ve her grubun zamanla nasıl eridiğini gösterir. <code>transform</code>, grup sonucunu satır sayısını değiştirmeden '
        'geri yazar (SQL\'de MIN(...) OVER (PARTITION BY customer_id)). <code>div(..., axis=0)</code> her satırı kendi 0. ay değerine böler. '
        'Benzersiz müşteri sayılmalı: aynı ay iki sipariş veren müşteri iki kez sayılırsa oran 100\'ü geçebilir. Power BI\'daki kohort matrisinin Python karşılığıdır.',
    tags=['kohort', 'transform', 'unstack', 'Period'], min=12)

add(id='b-426', lv='ileri', diff=3, kind='yaz', needs=['pandas'], title='Siparişler arası ortalama süre',
    q='<p><b>CRM ekibi soruyor:</b> "Bir müşteri ortalama kaç günde bir tekrar sipariş veriyor? Hatırlatma e-postasının zamanlamasını buna göre ayarlayacağız."</p>'
      '<p><code>siparis_araligi(orders)</code> fonksiyonunu yaz. İptal edilenleri çıkar. Her müşterinin siparişlerini tarihe göre sırala, ardışık iki sipariş arasındaki '
      'gün farkını bul, müşteri başına ortalamasını al. Yalnız <b>en az 2 siparişi</b> olan müşteriler sonuçta yer alsın. '
      'Dönüş: <code>customer_id</code> indeksli, 1 ondalığa yuvarlanmış float <b>Series</b>.</p>',
    start='''
import veri
import pandas as pd

orders = veri.oku("anadolu_market", "orders")


def siparis_araligi(orders):
    pass
''',
    sol='''
import veri
import pandas as pd

orders = veri.oku("anadolu_market", "orders")


def siparis_araligi(orders):
    df = orders[orders["status"] != "cancelled"].copy()
    df["tarih"] = pd.to_datetime(df["order_date"])
    df = df.sort_values(["customer_id", "tarih"])
    df["ara"] = df.groupby("customer_id")["tarih"].diff().dt.days
    return df.dropna(subset=["ara"]).groupby("customer_id")["ara"].mean().round(1)


s = siparis_araligi(orders)
print(s.describe().round(1))
''',
    calc={'N': 'len(siparis_araligi(orders))', 'MED': 'float(siparis_araligi(orders).median())',
          'C1': 'float(siparis_araligi(orders).loc[1])', 'MIN': 'float(siparis_araligi(orders).min())'},
    tests='''
s = siparis_araligi(orders)
assert isinstance(s, pd.Series), "Series döndürmeli"
assert len(s) == @N@, "Yalnız en az 2 (iptal olmayan) siparişi olan müşteriler yer almalı"
assert s.loc[1] == @C1@, "1 numaralı müşterinin ortalama aralığı tutmuyor"
assert s.median() == @MED@, "Medyan aralık tutmuyor: tarihleri müşteri içinde sıraladın mı?"
assert s.min() >= 0, "Negatif aralık olmamalı (sıralama unutulmuş olabilir)"
assert not s.isna().any(), "Sonuçta NaN olmamalı"
''',
    hints=['Grup içi ardışık fark için <code>groupby(...)["tarih"].diff()</code>.',
           'Önce müşteri ve tarihe göre sırala; diff sıraya bağlıdır. Fark Timedelta döner: <code>.dt.days</code>.',
           'Her müşterinin ilk satırında fark NaN olur; <code>dropna</code> ile at, sonra <code>groupby("customer_id").mean()</code>.'],
    why='<code>groupby().diff()</code> SQL\'deki <code>julianday(tarih) - julianday(LAG(tarih) OVER (PARTITION BY musteri ORDER BY tarih))</code> ile aynıdır. '
        'Sıralama şarttır; sırasız veride negatif aralıklar çıkar. Tek siparişlik müşterinin aralığı tanımsızdır (NaN); onları 0 saymak ortalamayı yanıltır. '
        'Alternatif: (son tarih − ilk tarih) / (sipariş sayısı − 1) aynı ortalamayı tek groupby ile verir; matematiksel olarak eşdeğerdir.',
    tags=['diff', 'groupby', 'Timedelta'], min=9)

add(id='b-427', lv='ileri', diff=3, kind='yaz', needs=['sqlite3'], title='Her kategorinin lider 2 ürünü (pencere fonksiyonu)',
    q='<p><b>Kategori yöneticileri soruyor:</b> "Her kategoride en çok ciro yapan iki ürün hangisi? Ana sayfa vitrinine onları koyacağız."</p>'
      '<p><code>kategori_liderleri(con, n=2)</code> fonksiyonunu yaz (<code>veri.baglan("anadolu_market")</code>). Ciro = <code>quantity * unit_price * (1 - discount)</code>; '
      'iptal ve iade siparişler hariç. <code>ROW_NUMBER() OVER (PARTITION BY ... ORDER BY ... DESC)</code> kullan. '
      'Dönüş: <code>(kategori, urun_adi, ciro)</code> demetleri; ciro 2 ondalık; kategoriye göre artan, kategori içinde ciroya göre azalan.</p>',
    start='''
import veri

con = veri.baglan("anadolu_market")


def kategori_liderleri(con, n=2):
    pass
''',
    sol='''
import veri

con = veri.baglan("anadolu_market")


def kategori_liderleri(con, n=2):
    sql = """
        WITH ciro AS (
            SELECT p.category, p.name,
                   SUM(i.quantity * i.unit_price * (1 - i.discount)) AS ciro
            FROM order_items AS i
            JOIN orders AS o ON o.order_id = i.order_id
            JOIN products AS p ON p.product_id = i.product_id
            WHERE o.status NOT IN ('cancelled', 'returned')
            GROUP BY p.category, p.name
        ), sirali AS (
            SELECT *, ROW_NUMBER() OVER (PARTITION BY category ORDER BY ciro DESC) AS sira
            FROM ciro
        )
        SELECT category, name, ROUND(ciro, 2) FROM sirali
        WHERE sira <= ?
        ORDER BY category, sira
    """
    return con.execute(sql, (n,)).fetchall()


for satir in kategori_liderleri(con):
    print(satir)
''',
    calc={'R': 'kategori_liderleri(con)', 'R1': 'kategori_liderleri(con, 1)'},
    tests='''
r = kategori_liderleri(con)
assert len(r) == 13, "7 kategori × 2 ürün, ama Hediye kategorisinde yalnız 1 ürün satılmış → 13 satır"
assert r == @R@, "Lider ürünler ya da cirolar tutmuyor"
assert kategori_liderleri(con, 1) == @R1@, "n=1 iken her kategoriden yalnız lider gelmeli"
assert "OVER" in __source__.upper(), "Pencere fonksiyonu (OVER) kullanmalısın"
''',
    hints=['Önce ürün bazında ciroyu bir CTE\'de (WITH) hesapla.',
           'İkinci CTE\'de <code>ROW_NUMBER() OVER (PARTITION BY category ORDER BY ciro DESC)</code> ile sıra numarası ver.',
           'Pencere sonucunu WHERE içinde doğrudan kullanamazsın; dış sorguda <code>WHERE sira &lt;= ?</code> yaz.'],
    why='"Grup başına ilk N" sorusu pencere fonksiyonlarının klasik kullanımıdır. Pencere fonksiyonları SELECT aşamasında hesaplandığı için aynı sorgunun WHERE\'inde '
        'kullanılamaz; bu yüzden CTE ya da alt sorgu gerekir. ROW_NUMBER eşit cirolarda bile tek sıra verir; eşitleri birlikte göstermek için RANK ya da DENSE_RANK seçilir. '
        'pandas karşılığı: <code>df.sort_values("ciro", ascending=False).groupby("category").head(2)</code>.',
    tags=['ROW_NUMBER', 'CTE', 'PARTITION BY', 'ilk N'], min=10)

add(id='b-428', lv='ileri', diff=3, kind='bug', needs=['pandas'], title='Aylık büyüme ters yönde',
    q='<p><b>Yönetim kurulu sunumu için:</b> analist aylık net ciroyu ve bir önceki aya göre büyüme yüzdesini hesaplayan kodu yazdı. '
      'Ama grafik tuhaf: ilk ayın büyümesi dolu, son ayınki boş çıkıyor ve oranlar mantıksız. <b>Hatayı bul ve düzelt.</b></p>'
      '<p><code>aylik_buyume(orders, items)</code>: iptal ve iade hariç aylık net ciro (<code>ciro</code>, 2 ondalık) ve önceki aya göre <code>buyume</code> (%, 1 ondalık) sütunları; '
      'index <code>"YYYY-MM"</code> metni, kronolojik sıralı. İlk ayın büyümesi NaN olmalı.</p>',
    start='''
import veri
import pandas as pd

orders = veri.oku("anadolu_market", "orders")
items = veri.oku("anadolu_market", "order_items")


def aylik_buyume(orders, items):
    gecerli = orders[~orders["status"].isin(["cancelled", "returned"])]
    df = items.merge(gecerli, on="order_id")
    df["net"] = df["quantity"] * df["unit_price"] * (1 - df["discount"])
    df["ay"] = df["order_date"].str[:7]
    sonuc = df.groupby("ay")["net"].sum().round(2).to_frame("ciro")
    onceki = sonuc["ciro"].shift(-1)
    sonuc["buyume"] = ((sonuc["ciro"] - onceki) / onceki * 100).round(1)
    return sonuc
''',
    sol='''
import veri
import pandas as pd

orders = veri.oku("anadolu_market", "orders")
items = veri.oku("anadolu_market", "order_items")


def aylik_buyume(orders, items):
    gecerli = orders[~orders["status"].isin(["cancelled", "returned"])]
    df = items.merge(gecerli, on="order_id")
    df["net"] = df["quantity"] * df["unit_price"] * (1 - df["discount"])
    df["ay"] = df["order_date"].str[:7]
    sonuc = df.groupby("ay")["net"].sum().round(2).to_frame("ciro")
    onceki = sonuc["ciro"].shift(1)
    sonuc["buyume"] = ((sonuc["ciro"] - onceki) / onceki * 100).round(1)
    return sonuc


print(aylik_buyume(orders, items).tail(6))
''',
    calc={'B': 'float(aylik_buyume(orders, items).loc["2024-06", "buyume"])',
          'BS': 'float(aylik_buyume(orders, items)["buyume"].iloc[-1])',
          'CS': 'float(aylik_buyume(orders, items).loc["2024-12", "ciro"])'},
    tests='''
r = aylik_buyume(orders, items)
assert pd.isna(r["buyume"].iloc[0]), "İlk ayın önceki ayı yok, büyümesi NaN olmalı"
assert not pd.isna(r["buyume"].iloc[-1]), "Son ayın büyümesi hesaplanmalı"
assert r.loc["2024-12", "ciro"] == @CS@, "Aralık 2024 cirosu tutmuyor"
assert r.loc["2024-06", "buyume"] == @B@, "Haziran 2024 büyümesi (Mayıs\\'a göre) tutmuyor"
assert r["buyume"].iloc[-1] == @BS@, "Son ayın büyümesi tutmuyor"
''',
    hints=['<code>shift(-1)</code> değeri hangi yöne kaydırır: önceki aya mı, sonraki aya mı?',
           'Önceki ayın değeri bir satır <b>aşağı</b> kaydırılarak gelir.', '<code>onceki = sonuc["ciro"].shift(1)</code> (ya da kısaca <code>pct_change()</code>)'],
    why='<code>shift(1)</code> değerleri bir satır aşağı kaydırır; böylece her satır bir önceki ayın değerini görür (SQL\'de LAG). <code>shift(-1)</code> ise sonraki ayı getirir (LEAD) '
        've "geleceğe göre büyüme" gibi anlamsız bir ölçü üretir. Kısa yol: <code>sonuc["ciro"].pct_change() * 100</code>. '
        'Dikkat: arada hiç satış olmayan ay varsa shift bir önceki <b>satırı</b> alır, bir önceki <b>ayı</b> değil; o durumda önce tüm ayları içeren bir indekse <code>reindex</code> etmek gerekir.',
    tags=['shift', 'pct_change', 'büyüme'], min=7)

add(id='b-429', lv='ileri', diff=3, kind='rehberli', needs=['pandas'], title='Kanal × ay ciro matrisi',
    q='<p><b>Pazarlama direktörü soruyor:</b> "2024\'te her ay hangi kanal ne kadar ciro getirdi? Satırlar ay, sütunlar kanal olsun; en altta toplam satırı da görelim."</p>'
      '<p><code>kanal_ay_matrisi(orders, items, yil)</code> fonksiyonunu yaz. İptal/iade hariç net ciro; <code>pivot_table</code> ile index = ay numarası (1–12), '
      'columns = <code>channel</code>, değer = ciro toplamı, boşlar 0, kenar toplamları (<code>margins=True</code>, ad <code>"Toplam"</code>), tam sayıya yuvarlanmış (<code>round(0)</code>).</p>',
    guide=['Geçerli siparişleri süz ve kalemlerle birleştir; <code>net</code> sütununu ekle.', 'Tarihi çevir; yılı süz; <code>ay</code> sütunu = <code>dt.month</code>.',
           '<code>pd.pivot_table(df, index="ay", columns="channel", values="net", aggfunc="sum", fill_value=0, margins=True, margins_name="Toplam")</code>',
           'Sonucu <code>round(0)</code> ile yuvarla ve döndür.'],
    example='''
import pandas as pd
# Benzer teknik: pivot_table + kenar toplamları
df = pd.DataFrame({"gun": ["Pzt", "Pzt", "Sal"], "vardiya": ["Sabah", "Akşam", "Sabah"], "adet": [5, 3, 4]})
print(pd.pivot_table(df, index="gun", columns="vardiya", values="adet", aggfunc="sum", fill_value=0, margins=True, margins_name="Toplam"))
''',
    start='''
import veri
import pandas as pd

orders = veri.oku("anadolu_market", "orders")
items = veri.oku("anadolu_market", "order_items")


def kanal_ay_matrisi(orders, items, yil):
    gecerli = orders[~orders["status"].isin(["cancelled", "returned"])]
    df = items.merge(gecerli, on="order_id")
    df["net"] = df["quantity"] * df["unit_price"] * (1 - df["discount"])
    df["tarih"] = pd.to_datetime(df["order_date"])
    # TODO 1: yalnız istenen yılın satırlarını tut
    # TODO 2: "ay" sütunu ekle (1–12)
    # TODO 3: pivot_table ile matrisi kur (fill_value=0, margins=True, margins_name="Toplam")
    # TODO 4: round(0) ile yuvarla ve döndür
    return None
''',
    sol='''
import veri
import pandas as pd

orders = veri.oku("anadolu_market", "orders")
items = veri.oku("anadolu_market", "order_items")


def kanal_ay_matrisi(orders, items, yil):
    gecerli = orders[~orders["status"].isin(["cancelled", "returned"])]
    df = items.merge(gecerli, on="order_id")
    df["net"] = df["quantity"] * df["unit_price"] * (1 - df["discount"])
    df["tarih"] = pd.to_datetime(df["order_date"])
    df = df[df["tarih"].dt.year == yil].copy()
    df["ay"] = df["tarih"].dt.month
    m = pd.pivot_table(df, index="ay", columns="channel", values="net", aggfunc="sum",
                       fill_value=0, margins=True, margins_name="Toplam")
    return m.round(0)


print(kanal_ay_matrisi(orders, items, 2024))
''',
    calc={'TOP': 'float(kanal_ay_matrisi(orders, items, 2024).loc["Toplam", "Toplam"])',
          'M3': 'float(kanal_ay_matrisi(orders, items, 2024).loc[3, "mobile"])',
          'S12': 'float(kanal_ay_matrisi(orders, items, 2024).loc[12, "store"])',
          'W': 'float(kanal_ay_matrisi(orders, items, 2024).loc["Toplam", "web"])',
          'T23': 'float(kanal_ay_matrisi(orders, items, 2023).loc["Toplam", "Toplam"])'},
    tests='''
m = kanal_ay_matrisi(orders, items, 2024)
assert m is not None, "DataFrame döndürmeli"
assert m.shape == (13, 4), "12 ay + Toplam satırı, 3 kanal + Toplam sütunu → (13, 4)"
assert m.loc["Toplam", "Toplam"] == @TOP@, "2024 genel toplamı tutmuyor"
assert m.loc[3, "mobile"] == @M3@, "Mart / mobile hücresi tutmuyor"
assert m.loc[12, "store"] == @S12@, "Aralık / store hücresi tutmuyor"
assert m.loc["Toplam", "web"] == @W@, "web sütun toplamı tutmuyor"
assert kanal_ay_matrisi(orders, items, 2023).loc["Toplam", "Toplam"] == @T23@, "yil parametresi kullanılmalı (2023 toplamı)"
''',
    hints=['Matris = pivot_table: satırda ay, sütunda kanal.', 'Yıl süzmesini pivot\'tan ÖNCE yap; <code>df["tarih"].dt.year == yil</code>.',
           '<code>pd.pivot_table(df, index="ay", columns="channel", values="net", aggfunc="sum", fill_value=0, margins=True, margins_name="Toplam").round(0)</code>'],
    why='<code>pivot_table</code>, Excel/Power BI matris görselinin pandas karşılığıdır: groupby + unstack + kenar toplamlarını tek çağrıda yapar. '
        '<code>fill_value=0</code> hiç satış olmayan hücreleri NaN yerine 0 yapar. <code>margins=True</code> toplamları ham veriden yeniden hesaplar (yuvarlanmış hücreleri toplamaz), '
        'bu yüzden yuvarlamayı en sona bırakmak doğrudur. Alternatif: <code>df.groupby(["ay", "channel"])["net"].sum().unstack(fill_value=0)</code> + elle toplam.',
    tags=['pivot_table', 'margins', 'matris'], min=9)

add(id='b-430', lv='ileri', diff=3, kind='yaz', title='Birlikte en çok alınan ürün çiftleri',
    q='<p><b>E-ticaret ekibi soruyor:</b> "Ürün sayfasına <i>Bunu alanlar şunu da aldı</i> kutusu koyacağız. Aynı siparişte en sık birlikte görülen ürün çiftleri hangileri?"</p>'
      '<p><code>birlikte_alinanlar(kalemler, urunler, n=3)</code> fonksiyonunu yaz (ikisi de <code>veri.kayitlar</code> listeleri; pandas gerekmez). '
      'Her siparişteki <b>farklı</b> ürünlerin tüm ikili kombinasyonlarını say. Çifti ürün <b>adlarıyla</b>, alfabetik sıralı bir demet olarak tut. '
      'Dönüş: <code>[((ad1, ad2), siparis_sayisi), ...]</code>; sayıya göre azalan, eşitlikte çifte göre artan, ilk <code>n</code> eleman.</p>',
    start='''
import veri

kalemler = veri.kayitlar("anadolu_market", "order_items")
urunler = veri.kayitlar("anadolu_market", "products")


def birlikte_alinanlar(kalemler, urunler, n=3):
    pass
''',
    sol='''
import veri
from collections import Counter, defaultdict
from itertools import combinations

kalemler = veri.kayitlar("anadolu_market", "order_items")
urunler = veri.kayitlar("anadolu_market", "products")


def birlikte_alinanlar(kalemler, urunler, n=3):
    ad = {u["product_id"]: u["name"] for u in urunler}
    sepet = defaultdict(set)
    for k in kalemler:
        sepet[k["order_id"]].add(ad[k["product_id"]])
    sayac = Counter()
    for adlar in sepet.values():
        for cift in combinations(sorted(adlar), 2):
            sayac[cift] += 1
    return sorted(sayac.items(), key=lambda x: (-x[1], x[0]))[:n]


for cift, adet in birlikte_alinanlar(kalemler, urunler, 5):
    print(adet, "sipariş:", " + ".join(cift))
''',
    calc={'R': 'birlikte_alinanlar(kalemler, urunler)', 'R5': 'birlikte_alinanlar(kalemler, urunler, 5)'},
    tests='''
r = birlikte_alinanlar(kalemler, urunler)
assert len(r) == 3, "Varsayılan n=3"
assert r == @R@, "İlk 3 çift tutmuyor: her siparişte ürünleri set ile tekilleştirip sorted ile sıraladın mı?"
assert birlikte_alinanlar(kalemler, urunler, 5) == @R5@, "n=5 iken ilk 5 çift tutmuyor"
k2 = [{"order_id": 1, "product_id": 1}, {"order_id": 1, "product_id": 2}, {"order_id": 1, "product_id": 2},
      {"order_id": 2, "product_id": 2}, {"order_id": 2, "product_id": 1}, {"order_id": 3, "product_id": 3}]
u2 = [{"product_id": 1, "name": "Çay"}, {"product_id": 2, "name": "Bardak"}, {"product_id": 3, "name": "Kaşık"}]
assert birlikte_alinanlar(k2, u2) == [(("Bardak", "Çay"), 2)], "Aynı üründen iki satır çifti iki kez saydırmamalı; tek ürünlü sipariş çift üretmez"
''',
    hints=['Önce sipariş başına ürün kümesi kur (<code>defaultdict(set)</code>).',
           '<code>itertools.combinations(sorted(adlar), 2)</code> her çifti bir kez ve hep aynı sırada üretir; <code>Counter</code> ile say.',
           'Sıralama anahtarı: <code>lambda x: (-x[1], x[0])</code>'],
    why='Pazar sepeti (market basket) analizinin ilk adımı birlikte görülme sayımıdır. Küme kullanmak aynı ürünün iki satırını tekilleştirir; '
        '<code>sorted</code> çiftin (A, B) ile (B, A) diye iki kez sayılmasını önler. Karmaşıklık sipariş başına O(k²) (k sepetteki ürün sayısı); sepetler küçük olduğu için hızlıdır. '
        'Bir sonraki adım destek (support), güven (confidence) ve kaldıraç (lift) hesaplamaktır: lift &gt; 1 ise çift tesadüften daha sık birlikte alınıyordur.',
    tags=['combinations', 'Counter', 'sepet analizi'], min=10)

if __name__ == '__main__':
    write('/home/claude/py/v3/d1/ds_market.js', 'PythonPatika — veri seti görevleri: Anadolu Market (b-411 … b-430)', T)
