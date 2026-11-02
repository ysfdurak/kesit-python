/* PythonPatika — 'pandas-groupby' dersi uzantısı: Gerçek sipariş satırlarıyla groupby (gerçek veri setleri) */
// needs: pandas
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
  {
    id: 'pandas-groupby',
    min: 25,
    needs: ['pandas'],
    html: `<h2>Derinleş: gerçek sipariş satırlarıyla groupby</h2><p>Derste groupby, merge ve pivot'u küçük tablolarla öğrendin. Gerçek e-ticaret verisinde işi zorlaştıran şey fonksiyonlar değil, <b>tablonun tanecik düzeyi</b> (grain): her satır neyi temsil ediyor? Anadolu Market'te <code>orders</code> tablosunda her satır bir sipariştir (910 satır), <code>order_items</code> tablosunda ise her satır bir sipariş <i>kalemidir</i> (1.620 satır). Bir siparişte 1 ile 4 arasında kalem olabilir. Tanecik düzeyini karıştırmak, analistlerin en sık yaptığı ve en zor fark edilen hatadır.</p><div class="tbl-wrap"><table><tr><th>Tablo</th><th>Bir satır =</th><th>Anahtar</th><th>Ciro hesabı</th></tr><tr><td><code>orders</code></td><td>bir sipariş</td><td><code>order_id</code></td><td>yok (tutar sütunu yok)</td></tr><tr><td><code>order_items</code></td><td>bir sipariş kalemi</td><td><code>item_id</code></td><td><code>quantity * unit_price * (1 - discount)</code></td></tr><tr><td><code>products</code></td><td>bir ürün</td><td><code>product_id</code></td><td>güncel <code>price</code> (satış anındaki fiyat değil!)</td></tr><tr><td><code>customers</code></td><td>bir müşteri</td><td><code>customer_id</code></td><td>yok</td></tr></table></div><h3>Güvenli birleştirme: validate ile tanecik kontrolü</h3><p>Kalemleri siparişlerle birleştirince satır sayısı 1.620 kalmalı: her kalemin tam bir siparişi vardır. Bunu umut etmek yerine <code>validate="many_to_one"</code> ile garanti altına al: sağ tabloda anahtar tekrar ederse pandas hata verir. <code>indicator=True</code> ise hangi satırın iki tarafta da bulunduğunu gösterir.</p><pre class="py">import veri

o = veri.oku("anadolu_market", "orders")
oi = veri.oku("anadolu_market", "order_items")
oi["ciro"] = oi["quantity"] * oi["unit_price"] * (1 - oi["discount"])

d = oi.merge(o, on="order_id", how="left", validate="many_to_one", indicator=True)
print(len(oi), len(d))                       # 1620 1620
print(d["_merge"].value_counts().to_dict())  # hepsi both
</pre><h3>İki adımlı toplama: önce siparişe, sonra segmente</h3><p>"Ortalama sepet tutarı" (AOV, average order value) sipariş başına cirodur. Kalem tablosunda doğrudan <code>ciro.mean()</code> alırsan <b>kalem başına</b> ortalamayı bulursun; bu rakam AOV'nin yaklaşık yarısıdır. Doğru yol iki adımlıdır: önce <code>order_id</code> düzeyine topla, sonra ortala.</p><pre class="py">import veri

o = veri.oku("anadolu_market", "orders")
oi = veri.oku("anadolu_market", "order_items")
oi["ciro"] = oi["quantity"] * oi["unit_price"] * (1 - oi["discount"])
d = oi.merge(o, on="order_id")
d = d[d["status"] == "delivered"]

yanlis = d["ciro"].mean()                              # kalem ortalaması
sepet = d.groupby("order_id")["ciro"].sum()            # 1. adım: sipariş düzeyi
print("kalem başına:", round(yanlis, 2))
print("sipariş başına (AOV):", round(sepet.mean(), 2))
print("sipariş sayısı:", d["order_id"].nunique(), "| kalem sayısı:", len(d))
</pre><div class="warn"><b>size() mi nunique() mi?</b>Birleştirilmiş kalem tablosunda <code>groupby("segment").size()</code> sipariş değil <b>kalem</b> sayar. Sipariş sayısı için <code>groupby("segment")["order_id"].nunique()</code> kullan. Raporda "sipariş" yazan her sütunun hangi tanecikte sayıldığını kontrol et.</div><h3>Gerçek pivot ve grup içi pay</h3><p>Kategori × kanal çapraz tablosu, yönetimin en sık istediği görünümdür. <code>transform("sum")</code> ise her satıra kendi grubunun toplamını yazar; böylece "ürünün kategori içindeki payı" tek satırda hesaplanır.</p><pre class="py">import veri

o = veri.oku("anadolu_market", "orders")
oi = veri.oku("anadolu_market", "order_items")
p = veri.oku("anadolu_market", "products")
oi["ciro"] = oi["quantity"] * oi["unit_price"] * (1 - oi["discount"])
d = oi.merge(o, on="order_id").merge(p, on="product_id")
d = d[d["status"] == "delivered"]

pv = d.pivot_table(index="category", columns="channel", values="ciro",
                   aggfunc="sum", fill_value=0, margins=True, margins_name="Toplam")
print(pv.round(0))

urun = d.groupby(["category", "name"], as_index=False)["ciro"].sum()
urun["pay"] = urun["ciro"] / urun.groupby("category")["ciro"].transform("sum")
print(urun.sort_values("pay", ascending=False).head(3))
</pre><h3>Hiç sipariş vermeyen müşteriler: left merge ve indicator</h3><p>"Kaç müşterimiz hiç sipariş vermedi?" sorusu, birleştirmenin yönüyle ilgilidir. Müşteri tablosunu sola koyup <code>how="left"</code> ve <code>indicator=True</code> ile birleştirirsen, sağda karşılığı olmayan satırlar <code>left_only</code> olarak işaretlenir. Sayımı önce müşteri düzeyine indirmeyi unutma: bir müşteri birden çok siparişle eşleşir.</p><pre class="py">import veri

c = veri.oku("anadolu_market", "customers")
o = veri.oku("anadolu_market", "orders")
d = c.merge(o[["order_id", "customer_id"]], on="customer_id", how="left", indicator=True)
print(len(c), len(d))
siparissiz = d.loc[d["_merge"] == "left_only", "customer_id"].nunique()
print("hiç sipariş vermeyen:", siparissiz)
print("müşteri başına sipariş:", round(len(o) / c["customer_id"].nunique(), 2))
</pre><div class="note"><b>Gerçek işte</b>Bir panoda "Ortalama sepet 841 TL" ile "Ortalama sepet 1.489 TL" yan yana durabilir; ikisi de aynı veriden, farklı taneciklerden hesaplanmıştır. Kıdemli analistler her metriğin yanına tanımını yazar: "AOV = teslim edilmiş siparişlerde, sipariş başına indirimli ciro". SQLPatika'da aynı soruyu <code>GROUP BY order_id</code> alt sorgusuyla çözmüştün; PBIPatika'da ise <code>AVERAGEX(VALUES(Satislar[SiparisNo]), ...)</code> aynı iki adımlı mantıktır.</div>`,
    ex: [
      {
        t: 'predict',
        stage: 'Kodu oku',
        q: 'Siparişler kalemlerle birleştiriliyor. Bu kod ne yazdırır?',
        needs: ['pandas'],
        code: 'import veri\no = veri.oku("anadolu_market", "orders")\noi = veri.oku("anadolu_market", "order_items")\nd = o.merge(oi, on="order_id")\nprint(len(o), len(d), d["order_id"].nunique())\n',
        o: ['910 1620 910', '910 910 910', '1620 1620 910', '910 1620 1620'],
        a: 0,
        why: 'Bir sipariş birden çok kaleme eşleştiği için birleştirme satırı çoğaltır: 910 sipariş 1.620 satıra açılır. Farklı sipariş sayısı yine 910\'dur.'
      },
      {
        t: 'predict',
        stage: 'Kodu oku',
        q: 'Sipariş başına kalem sayısına bakılıyor. Bu kod ne yazdırır?',
        needs: ['pandas'],
        code: 'import veri\noi = veri.oku("anadolu_market", "order_items")\nkalem = oi.groupby("order_id").size()\nprint(kalem.max(), int((kalem >= 3).sum()))\n',
        o: ['4 127', '4 67', '1620 127', '3 127'],
        a: 0,
        why: 'En kalabalık siparişte 4 kalem var. 3 kalemli 67 ve 4 kalemli 60 sipariş toplam 127 eder.'
      },
      {
        t: 'order',
        stage: 'Kodu oku',
        q: '<p>Kalemlerden ciro hesaplayıp en çok ciro yapan ürün numarasını yazdıran programın satırlarını sırala.</p>',
        needs: ['pandas'],
        lines: ['import veri', 'oi = veri.oku("anadolu_market", "order_items")', 'oi["ciro"] = oi["quantity"] * oi["unit_price"] * (1 - oi["discount"])', 'urun_ciro = oi.groupby("product_id")["ciro"].sum()', 'lider = urun_ciro.idxmax()', 'print(lider, round(float(urun_ciro.max()), 2))'],
        tests: 'assert lider == urun_ciro.sort_values().index[-1], "idxmax en büyük değerin etiketini verir"\n',
        hint: 'Ciro sütunu olmadan gruplanamaz; idxmax gruplanmış seriden sonra gelir.',
        why: 'idxmax değeri değil, en büyük değerin index etiketini (burada product_id) döndürür.'
      },
      {
        t: 'code',
        id: 'pandas-groupby-v1',
        stage: 'Rehberli',
        diff: 2,
        needs: ['pandas'],
        q: '<p><code>sepet_ozeti()</code>: teslim edilmiş (<code>delivered</code>) siparişler için sipariş başına <code>kalem</code> (satır sayısı), <code>adet</code> (quantity toplamı) ve <code>tutar</code> (ciro toplamı) hesapla; sonra bu üçünün ortalamasını 2 basamakla <code>{"ort_kalem": .., "ort_adet": .., "aov": .., "siparis": ..}</code> sözlüğünde döndür (<code>siparis</code> = teslim edilmiş sipariş sayısı, <code>int</code>; diğerleri <code>float</code>).</p>',
        guide: ['order_items\'a ciro sütunu ekle.', 'orders ile order_id üzerinden birleştir ve status == "delivered" filtrele.', 'groupby("order_id").agg(kalem=("item_id", "size"), adet=("quantity", "sum"), tutar=("ciro", "sum"))', 'Ortalamaları round(float(...), 2) ile al; siparis = len(ozet).'],
        example: 'import pandas as pd\nk = pd.DataFrame({"sip": [1, 1, 2], "adet": [2, 1, 4], "ciro": [10.0, 5.0, 8.0]})\ns = k.groupby("sip").agg(kalem=("adet", "size"), ciro=("ciro", "sum"))\nprint(s.mean().round(2).to_dict())\n',
        start: 'import veri\n\ndef sepet_ozeti():\n    o = veri.oku("anadolu_market", "orders")\n    oi = veri.oku("anadolu_market", "order_items")\n    # TODO: ciro, birleştirme, filtre\n    # TODO: sipariş düzeyine topla ve ortala\n    return {}\n',
        sol: 'import veri\n\ndef sepet_ozeti():\n    o = veri.oku("anadolu_market", "orders")\n    oi = veri.oku("anadolu_market", "order_items")\n    oi["ciro"] = oi["quantity"] * oi["unit_price"] * (1 - oi["discount"])\n    d = oi.merge(o, on="order_id")\n    d = d[d["status"] == "delivered"]\n    s = d.groupby("order_id").agg(kalem=("item_id", "size"), adet=("quantity", "sum"), tutar=("ciro", "sum"))\n    return {"ort_kalem": round(float(s["kalem"].mean()), 2), "ort_adet": round(float(s["adet"].mean()), 2),\n            "aov": round(float(s["tutar"].mean()), 2), "siparis": int(len(s))}\n',
        tests: 'r = sepet_ozeti()\nassert r["siparis"] == 712, f"712 teslim edilmiş sipariş olmalı, {r.get(\'siparis\')} geldi"\nassert r["ort_kalem"] == 1.78, f"Ortalama kalem 1.78 olmalı: {r}"\nassert r["ort_adet"] == 2.84, f"Ortalama adet 2.84 olmalı: {r}"\nassert r["aov"] == 1489.07, f"AOV 1489.07 olmalı (kalem ortalaması değil!): {r}"\n',
        hints: ['Önce sipariş düzeyine inmeden ortalama alma.', 'Named aggregation: agg(yeni_ad=("sütun", "fonksiyon")).', 'aov = s["tutar"].mean()'],
        why: 'Teslim edilmiş bir sipariş ortalama 1,78 kalem ve 2,84 adet içerir; AOV 1.489 TL\'dir. Kalem başına ortalama (yaklaşık 841 TL) AOV değildir.'
      },
      {
        t: 'code',
        id: 'pandas-groupby-v2',
        stage: 'Rehberli',
        diff: 2,
        needs: ['pandas'],
        q: '<p><code>kategori_kanal()</code>: teslim edilmiş siparişlerin kalem cirosunu satırlarda <code>category</code>, sütunlarda <code>channel</code> olacak şekilde <code>pivot_table</code> ile topla (boşlar 0), değerleri tam sayıya yuvarla (<code>round(0)</code>) ve DataFrame\'i döndür.</p>',
        guide: ['order_items + orders + products birleştir.', 'status == "delivered" filtrele.', 'pivot_table(index="category", columns="channel", values="ciro", aggfunc="sum", fill_value=0)', '.round(0) ile yuvarla.'],
        example: 'import pandas as pd\nk = pd.DataFrame({"kat": ["A", "A", "B"], "kanal": ["web", "mobil", "web"], "ciro": [10.4, 5.0, 7.6]})\nprint(k.pivot_table(index="kat", columns="kanal", values="ciro", aggfunc="sum", fill_value=0).round(0))\n',
        start: 'import veri\n\ndef kategori_kanal():\n    o = veri.oku("anadolu_market", "orders")\n    oi = veri.oku("anadolu_market", "order_items")\n    p = veri.oku("anadolu_market", "products")\n    # TODO\n    return None\n',
        sol: 'import veri\n\ndef kategori_kanal():\n    o = veri.oku("anadolu_market", "orders")\n    oi = veri.oku("anadolu_market", "order_items")\n    p = veri.oku("anadolu_market", "products")\n    oi["ciro"] = oi["quantity"] * oi["unit_price"] * (1 - oi["discount"])\n    d = oi.merge(o, on="order_id").merge(p, on="product_id")\n    d = d[d["status"] == "delivered"]\n    pv = d.pivot_table(index="category", columns="channel", values="ciro", aggfunc="sum", fill_value=0)\n    return pv.round(0)\n',
        tests: 'pv = kategori_kanal()\nassert list(pv.columns) == ["mobile", "store", "web"], f"Sütunlar kanal olmalı: {list(pv.columns)}"\nassert pv.shape == (7, 3), "7 kategori x 3 kanal"\nassert pv.loc["Elektronik", "mobile"] == 138537.0, f"Elektronik/mobile 138537 olmalı, {pv.loc[\'Elektronik\', \'mobile\']} geldi"\nassert pv.loc["Hediye", "store"] == 1950.0, "Hediye/store 1950 olmalı"\nassert abs(pv.to_numpy().sum() - 1060216) < 5, "Toplam teslim edilmiş ciroya (1.060.216) yakın olmalı"\n',
        hints: ['Önce filtre, sonra pivot.', 'fill_value=0 boş kombinasyonları 0 yapar.'],
        why: 'Mobil kanal her kategoride en büyük paya sahip; mağaza (store) en küçük kanal. Bu tablo SQL\'de GROUP BY category, channel sorgusunun geniş biçimidir.'
      },
      {
        t: 'code',
        id: 'pandas-groupby-v3',
        stage: 'Kendin yaz',
        diff: 2,
        needs: ['pandas'],
        q: '<p><code>iade_orani()</code>: tüm sipariş kalemlerinde (durum fark etmeksizin) her kategori için, siparişi <code>returned</code> durumunda olan kalemlerin oranını hesapla. <code>{kategori: oran}</code> sözlüğünü 3 basamağa yuvarlayıp orana göre <b>azalan</b> sırada döndür (eşitlikte kategori adına göre artan).</p>',
        start: 'import veri\n\ndef iade_orani():\n    pass\n',
        sol: 'import veri\n\ndef iade_orani():\n    o = veri.oku("anadolu_market", "orders")\n    oi = veri.oku("anadolu_market", "order_items")\n    p = veri.oku("anadolu_market", "products")\n    d = oi.merge(o, on="order_id").merge(p, on="product_id")\n    oran = (d["status"] == "returned").groupby(d["category"]).mean().round(3)\n    oran = oran.reset_index(name="oran").sort_values(["oran", "category"], ascending=[False, True])\n    return {r.category: float(r.oran) for r in oran.itertuples()}\n',
        tests: 'r = iade_orani()\nassert r == {"Kitap": 0.08, "Giyim": 0.079, "Ev & Yaşam": 0.078, "Kozmetik": 0.077, "Hediye": 0.051, "Spor": 0.051, "Elektronik": 0.036}, f"Oranlar farklı: {r}"\nassert list(r)[-1] == "Elektronik", "En düşük iade oranı Elektronik\'te"\n',
        hints: ['Boolean bir serinin ortalaması True oranıdır.', '(d["status"] == "returned").groupby(d["category"]).mean()'],
        why: 'Boolean maskenin ortalaması oranı verir. Elektronikte iade oranı en düşük (%3,6); kitap ve giyimde iki katından fazla.'
      },
      {
        t: 'code',
        id: 'pandas-groupby-v4',
        stage: 'Kendin yaz',
        diff: 2,
        needs: ['pandas'],
        q: '<p><code>en_iyi_urunler(n)</code>: teslim edilmiş siparişlerde ürün adına (<code>products.name</code>) göre ciroyu topla; en yüksek <code>n</code> ürünü <code>[(ad, toplam_ciroya_yüzde_pay), ...]</code> olarak döndür. Pay, tüm teslim edilmiş ciroya göre yüzde, 1 basamak <code>float</code>.</p>',
        start: 'import veri\n\ndef en_iyi_urunler(n):\n    pass\n',
        sol: 'import veri\n\ndef en_iyi_urunler(n):\n    o = veri.oku("anadolu_market", "orders")\n    oi = veri.oku("anadolu_market", "order_items")\n    p = veri.oku("anadolu_market", "products")\n    oi["ciro"] = oi["quantity"] * oi["unit_price"] * (1 - oi["discount"])\n    d = oi.merge(o, on="order_id").merge(p, on="product_id")\n    d = d[d["status"] == "delivered"]\n    t = d.groupby("name")["ciro"].sum().sort_values(ascending=False)\n    pay = t / t.sum() * 100\n    return [(ad, round(float(v), 1)) for ad, v in pay.head(n).items()]\n',
        tests: 'r = en_iyi_urunler(3)\nassert r == [(\'27" Monitör\', 8.2), ("Türk Kahvesi Makinesi", 4.7), ("Akıllı Saat", 4.6)], f"İlk üç ürün farklı: {r}"\nassert len(en_iyi_urunler(5)) == 5, "n kadar ürün dönmeli"\n',
        hints: ['Payı head\'den ÖNCE, tüm ürünlerin toplamına göre hesapla.'],
        why: '27 inç monitör tek başına teslim edilmiş cironun %8,2\'sini getiriyor. Payı ilk n ürünün toplamına bölmek yaygın bir hatadır.'
      },
      {
        t: 'code',
        id: 'pandas-groupby-v5',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 2,
        needs: ['pandas'],
        q: '<p>Hatayı bul ve düzelt. <code>segment_ozeti()</code> teslim edilmiş siparişler için müşteri segmenti başına <code>(sipariş_sayısı, aov)</code> döndürmeli: <code>{"Bireysel": (237, 1480.3), ...}</code>. Kod çalışıyor ama sayılar şişik, AOV ise yarı yarıya düşük çıkıyor.</p>',
        start: 'import veri\n\ndef segment_ozeti():\n    o = veri.oku("anadolu_market", "orders")\n    oi = veri.oku("anadolu_market", "order_items")\n    c = veri.oku("anadolu_market", "customers")\n    oi["ciro"] = oi["quantity"] * oi["unit_price"] * (1 - oi["discount"])\n    d = oi.merge(o, on="order_id").merge(c, on="customer_id")\n    d = d[d["status"] == "delivered"]\n    g = d.groupby("segment")\n    adet = g.size()\n    aov = g["ciro"].mean()\n    return {s: (int(adet[s]), round(float(aov[s]), 2)) for s in adet.index}\n',
        sol: 'import veri\n\ndef segment_ozeti():\n    o = veri.oku("anadolu_market", "orders")\n    oi = veri.oku("anadolu_market", "order_items")\n    c = veri.oku("anadolu_market", "customers")\n    oi["ciro"] = oi["quantity"] * oi["unit_price"] * (1 - oi["discount"])\n    d = oi.merge(o, on="order_id").merge(c, on="customer_id")\n    d = d[d["status"] == "delivered"]\n    sip = d.groupby(["segment", "order_id"])["ciro"].sum().reset_index()\n    g = sip.groupby("segment")\n    adet = g.size()\n    aov = g["ciro"].mean()\n    return {s: (int(adet[s]), round(float(aov[s]), 2)) for s in adet.index}\n',
        tests: 'r = segment_ozeti()\nassert r == {"Bireysel": (237, 1480.3), "Kurumsal": (191, 1475.18), "Premium": (284, 1505.72)}, f"Sonuç farklı: {r}"\n',
        hints: ['d tablosunda bir satır neyi temsil ediyor: sipariş mi, kalem mi?', 'Önce (segment, order_id) düzeyine topla, sonra segmentte say ve ortala.'],
        why: 'Birleştirilmiş tablo kalem düzeyindeydi: size() kalem saydı (417 yerine 237 sipariş) ve mean() kalem ortalaması verdi. Sipariş düzeyine inince iki metrik de düzelir.'
      },
      {
        t: 'code',
        id: 'pandas-groupby-v6',
        stage: 'Meydan okuma',
        diff: 3,
        needs: ['pandas'],
        q: '<p><code>kategori_liderleri()</code>: teslim edilmiş siparişlerde her kategorinin <b>lider ürününü</b> ve o ürünün kategori cirosu içindeki yüzde payını bul. <code>{kategori: (ürün_adı, pay)}</code> döndür; pay 1 basamak <code>float</code>. <code>transform</code> ya da iki adımlı groupby kullanabilirsin; döngüyle her kategoriyi ayrı ayrı filtreleme.</p>',
        start: 'import veri\n\ndef kategori_liderleri():\n    pass\n',
        sol: 'import veri\n\ndef kategori_liderleri():\n    o = veri.oku("anadolu_market", "orders")\n    oi = veri.oku("anadolu_market", "order_items")\n    p = veri.oku("anadolu_market", "products")\n    oi["ciro"] = oi["quantity"] * oi["unit_price"] * (1 - oi["discount"])\n    d = oi.merge(o, on="order_id").merge(p, on="product_id")\n    d = d[d["status"] == "delivered"]\n    u = d.groupby(["category", "name"], as_index=False)["ciro"].sum()\n    u["pay"] = u["ciro"] / u.groupby("category")["ciro"].transform("sum") * 100\n    lider = u.loc[u.groupby("category")["pay"].idxmax()]\n    return {r.category: (r.name, round(float(r.pay), 1)) for r in lider.itertuples(index=False)}\n',
        tests: 'r = kategori_liderleri()\nassert len(r) == 7, "7 kategori olmalı"\nassert r["Elektronik"] == (\'27" Monitör\', 30.3), f"Elektronik lideri farklı: {r.get(\'Elektronik\')}"\nassert r["Spor"] == ("Kamp Çadırı", 29.1), f"Spor lideri farklı: {r.get(\'Spor\')}"\nassert r["Hediye"] == ("Hediye Kartı 500 TL", 100.0), "Hediye\'de satılan tek ürün"\nassert r["Kitap"] == ("İstatistiğe Giriş", 26.6), f"Kitap lideri farklı: {r.get(\'Kitap\')}"\n',
        hints: ['Önce (category, name) düzeyine topla.', 'transform("sum") her satıra kategori toplamını yazar.', 'groupby("category")["pay"].idxmax() her kategorinin en büyük satırının index\'ini verir; loc ile seç.'],
        why: 'transform grubun özetini satır düzeyine geri yazar; idxmax ile her grubun lider satırı döngüsüz seçilir. Hediye kategorisinde yalnızca bir ürün satıldığı için pay %100\'dür.'
      }
    ],
    faq: [
      {
        q: 'products.price ile order_items.unit_price farklı, hangisini kullanmalıyım?',
        a: 'Ciro için her zaman satış anındaki <code>unit_price</code>. <code>products.price</code> bugünkü liste fiyatıdır; fiyatlar zamanla değişir (<code>price_updates</code> tablosu). Geçmiş satışı güncel fiyatla çarparsan tarihsel ciroyu yanlış hesaplarsın.'
      },
      {
        q: 'Birleştirmeden sonra satır sayısının değişip değişmediğini her seferinde mi kontrol etmeliyim?',
        a: 'Evet, özellikle üretim raporlarında. <code>validate="many_to_one"</code> ya da <code>"one_to_one"</code> vermek bunu otomatik yapar; beklenen ilişki bozulursa <code>MergeError</code> alırsın ve sessizce şişmiş rakam raporlamazsın.'
      }
    ],
    mistakes: [
      {
        bad: 'd = kalemler.merge(siparisler, on="order_id")\nd.groupby("segment").size()',
        good: 'd.groupby("segment")["order_id"].nunique()',
        why: 'Kalem düzeyindeki tabloda size() sipariş değil kalem sayar.'
      }
    ]
  }
);
})(window);
