/* Kesit Python — 'ml-kumeleme' dersi uzantısı: market sepeti analizi ve öğe benzerliği önerisi (AUDIT Ekle-7) */
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
  { id: 'ml-kumeleme',
    min: 22,
    html: `<h2>Derinleş: market sepeti analizi ve basit öneri</h2><p>Kümeleme müşterileri gruplar; sepet analizi (market basket analysis) ise <b>ürünleri</b> birlikte satın alınma davranışına göre ilişkilendirir. "Kitap alan kupa da alıyor mu?", "Güneş kremi sepetine şampuan önerelim mi?" gibi soruların cevabı buradadır. Bu da etiketsiz (denetimsiz) bir öğrenme problemidir: hedef sütun yok, yalnızca birlikte görülme sayıları var. Bu bölümde Anadolu Market'in gerçek <code>order_items</code> tablosunu (910 sipariş, 1620 satır) kullanacaksın.</p><h3>Üç ölçü: destek, güven, lift</h3><p>N sipariş içinde A ürününü içeren sepet sayısı n(A), hem A hem B içeren sepet sayısı n(A, B) olsun. "A alan B de alır" kuralı (A → B) için:</p><div class="tbl-wrap"><table><tr><th>Ölçü</th><th>Formül</th><th>Ne söyler?</th></tr><tr><td>Destek (support)</td><td>n(A, B) / N</td><td>Bu ikili ne kadar yaygın? Küçükse kural az müşteriyi etkiler.</td></tr><tr><td>Güven (confidence)</td><td>n(A, B) / n(A)</td><td>A alanların yüzde kaçı B de alıyor? Yöne bağlıdır: A → B ile B → A farklıdır.</td></tr><tr><td>Lift</td><td>güven(A → B) / destek(B)</td><td>Birliktelik tesadüften kaç kat fazla? 1 bağımsızlık, 1'in üstü çekim, altı itme demektir. Simetriktir.</td></tr></table></div><p>Güven tek başına yanıltır: B zaten çok popülerse (her sepette su varsa) "A alan su da alır" kuralının güveni yüksek çıkar ama hiçbir şey öğretmez. Lift, B'nin kendi yaygınlığına bölerek bu etkiyi ayıklar.</p><pre class="py">import veri
import pandas as pd

kalemler = veri.oku("anadolu_market", "order_items")
urunler = veri.oku("anadolu_market", "products").set_index("product_id")

# sipariş × ürün ikili matris: hücre "bu sepette bu ürün var mı?"
sepet = pd.crosstab(kalemler["order_id"], kalemler["product_id"]) &gt; 0
print(sepet.shape)                       # (sipariş sayısı, ürün sayısı)

def kural(m, a, b):
    destek = (m[a] &amp; m[b]).mean()        # bool ortalaması = oran
    guven = destek / m[a].mean()
    lift = guven / m[b].mean()
    return round(destek, 4), round(guven, 4), round(lift, 2)

a, b = 10, 13
print(urunler.loc[a, "name"], "-&gt;", urunler.loc[b, "name"])
print(kural(sepet, a, b))</pre><p>Kürk Mantolu Madonna alanların yaklaşık %10'u Saatleri Ayarlama Enstitüsü'nü de almış; bu, ikinci kitabın genel yaygınlığının neredeyse iki katı (lift ≈ 1.87). Ama destek yalnızca 7 sepet! Küçük sayılarla kurulan kurallar gürültüye çok açıktır; bu yüzden her kural listesine önce bir <b>en az destek</b> (min support) eşiği uygulanır.</p><h3>Sık ikilileri saymak: Apriori fikri</h3><p>40 ürünle 780 olası ikili, 9880 olası üçlü var; binlerce ürünle bu sayı patlar. Apriori algoritmasının gözlemi basittir: <b>bir küme sık değilse, onu içeren hiçbir büyük küme sık olamaz</b> (anti-monotonluk). O hâlde önce sık tekil ürünleri bul, yalnız onlardan ikili aday üret, sık ikililerden üçlü aday üret ve her adımda budayarak ilerle. Küçük veride <code>itertools.combinations</code> ile doğrudan saymak yeterlidir:</p><pre class="py">from collections import Counter
from itertools import combinations

ciftler = Counter()
for _, g in kalemler.groupby("order_id"):
    for x, y in combinations(sorted(set(g["product_id"])), 2):
        ciftler[(x, y)] += 1

print("farklı ikili:", len(ciftler))
print("en az 5 sepette görülen:", sum(1 for v in ciftler.values() if v &gt;= 5))
for (x, y), n in ciftler.most_common(3):
    print(n, urunler.loc[x, "name"], "+", urunler.loc[y, "name"])</pre><div class="note"><b>Gerçek işte</b>Perakende ekipleri kuralları genellikle kategori ya da marka düzeyinde de hesaplar, çünkü ürün düzeyinde sayılar seyrektir. Anadolu Market verisinde kategori düzeyinde lift değerlerinin hepsi 1'in altında çıkar: müşteriler bir siparişte çoğunlukla aynı kategoriden (iki kitap gibi) alıyor, farklı kategorileri birlikte almıyor. Bu da kendi başına bir içgörüdür: çapraz kategori önerisi için kampanya gerekir, kendiliğinden olmuyor. Üretimde <code>mlxtend</code> (<code>apriori</code>, <code>association_rules</code>) ya da FP-Growth kullanılır; mantık aynıdır.</div><h3>Öğe-öğe benzerliğiyle öneri</h3><p>Sepet matrisinin her sütunu bir ürünün "hangi sepetlerde göründüğü" vektörüdür. İki sütun arasındaki kosinüs benzerliği (cosine similarity), ikili vektörlerde n(A, B) / √(n(A)·n(B)) olur. "Bu ürünü alanlar şunları da aldı" kutusu tam olarak budur: ürünün sütununa en benzer k sütun.</p><pre class="py">import numpy as np

A = sepet.to_numpy().astype(float)
ortak = A.T @ A                          # ürün × ürün birlikte görülme sayıları
norm = np.sqrt(np.diag(ortak))
benzerlik = pd.DataFrame(ortak / np.outer(norm, norm),
                         index=sepet.columns, columns=sepet.columns)

hedef = 15                               # İstatistiğe Giriş
enler = benzerlik[hedef].drop(hedef).sort_values(ascending=False).head(3)
for pid, s in enler.items():
    print(f"{urunler.loc[pid, 'name']:&lt;24} {s:.3f}")</pre><p>Matris çarpımı <code>A.T @ A</code> köşegeninde her ürünün kaç sepette geçtiğini, köşegen dışında ise ikililerin ortak sayısını verir; tek satırda tüm ikili sayımı yapmış olursun. Lift de bu matristen hesaplanabilir: <code>ortak * N / np.outer(n, n)</code>.</p><div class="warn"><b>Popülerlik yanlılığı ve soğuk başlangıç</b>Benzerlik ve güven, çok satan ürünleri her listeye taşır; az satan ürün hiç önerilmez. Ölçüyü lift ya da kosinüsle normalleştir, en az ortak sepet eşiği koy ve önerileri A/B testiyle ölç (istatistik dersi). Hiç satışı olmayan yeni ürün için sepet verisi yoktur; ilk aşamada kategori ve içerik benzerliğine dayanmak gerekir.</div><p>Özetle iş akışı şudur: sepet matrisini kur → en az destek eşiğiyle sık öğe kümelerini bul → güven ve lift ile kuralları sırala → kuralları iş diline çevir ("Kitap alanlara kupa seti kampanyası") → etkisini deneyle ölç.</p>`,
    ex: [
      { t: 'mc',
        stage: 'Isınma',
        q: 'Anadolu Market verisinde "Kürk Mantolu Madonna → Saatleri Ayarlama Enstitüsü" kuralının lift değeri 1.87 çıktı. Bu ne anlama gelir?',
        o: ['İlk kitabı alan müşterilerin %87\'si ikinci kitabı da sepetine ekliyor demektir', 'İlkini alanlarda ikinci kitap, genel oranının 1.87 katı sıklıkta görülüyor', 'Bu iki kitap tüm siparişlerin %1.87\'sinde aynı sepette birlikte görülüyor demektir', 'İkinci kitabı alanların ilkini alma olasılığı 1.87'],
        a: 1,
        why: 'Lift = güven / destek(B): birlikteliğin bağımsızlık durumuna göre kaç kat fazla olduğunu gösterir. %87 güven, %1.87 destek olurdu; olasılık 1\'i aşamaz.' },
      { t: 'mc',
        stage: 'Isınma',
        q: 'Kural listesine neden "en az destek" (min support) eşiği uygulanır?',
        o: ['Lift değerlerini yapay olarak 1\'in üstüne çıkarıp kuralları daha güçlü göstermek için', 'Güven ölçüsünü yönden bağımsız, yani simetrik hâle getirip iki kuralı birleştirmek için', 'Tek sepette görülen nadir ikililer %100 güven ve dev lift alır; eşik bu gürültüyü ayıklar', 'crosstab bool matris döndürsün diye'],
        a: 2,
        why: 'Yalnız bir sepette görülen iki nadir ürün için güven 1.0 ve lift çok büyük çıkar ama bu tesadüftür. En az destek, kuralın yeterince çok sepete dayanmasını şart koşar ve Apriori budamasının da temelidir.' },
      { t: 'predict',
        stage: 'Kodu oku',
        q: 'Beş sepet için kural ölçüleri. Bu kod ne yazdırır?',
        code: 'sepetler = [{"çay", "şeker"}, {"çay", "kupa"}, {"çay", "şeker", "kupa"}, {"kahve"}, {"şeker"}]\nn = len(sepetler)\na, b = "çay", "şeker"\nn_a = sum(a in s for s in sepetler)\nn_b = sum(b in s for s in sepetler)\nn_ab = sum(a in s and b in s for s in sepetler)\nprint(n_ab / n, round(n_ab / n_a, 2), round((n_ab / n_a) / (n_b / n), 2))\n',
        o: ['0.4 0.67 1.11', '0.4 0.67 0.67', '2 0.67 1.11', '0.4 0.5 0.83'],
        a: 0,
        why: 'n_ab = 2 (1. ve 3. sepet), n_a = 3, n_b = 3. Destek 2/5 = 0.4, güven 2/3 ≈ 0.67, lift 0.667 / 0.6 ≈ 1.11.' },
      { t: 'order',
        stage: 'Kodu oku',
        q: '<p>Küçük bir kalem tablosundan sipariş × ürün ikili matrisi kuran ve her ürünün desteğini yazdıran programın satırlarını sırala.</p>',
        lines: ['import pandas as pd', 'k = pd.DataFrame({"order_id": [1, 1, 2, 3, 3], "urun": ["A", "B", "A", "B", "C"]})', 'tablo = pd.crosstab(k["order_id"], k["urun"])', 'sepet = tablo > 0', 'destek = sepet.mean().round(2)', 'print(destek.to_dict())'],
        expect: '{\'A\': 0.67, \'B\': 0.67, \'C\': 0.33}\n',
        needs: ['pandas'],
        hint: 'Önce veri, sonra sayım tablosu, sonra bool matris, en son ortalama.',
        why: 'crosstab sayım verir; > 0 ile var/yok matrisine çevrilir. Bool sütunun ortalaması, o ürünü içeren sepet oranıdır (destek).' },
      { t: 'code',
        id: 'ml-kumeleme-w1',
        stage: 'Rehberli',
        diff: 1,
        needs: ['pandas'],
        q: '<p>Anadolu Market\'in gerçek <code>order_items</code> tablosundan sepet matrisi kur. <code>sepet_matrisi(kalemler)</code> fonksiyonu satırları <code>order_id</code>, sütunları <code>product_id</code> olan, hücreleri <code>True/False</code> (bu sepette bu ürün var mı) olan bir DataFrame döndürsün. Kalemler hazır yüklü.</p>',
        guide: ['pd.crosstab ile order_id × product_id sayım tablosu kur.', 'Sayımı "0\'dan büyük mü" karşılaştırmasıyla bool yap.', 'Sonucu döndür.'],
        example: 'import pandas as pd\nk = pd.DataFrame({"fis": [1, 1, 2], "urun": ["çay", "çay", "kahve"]})\nprint(pd.crosstab(k["fis"], k["urun"]) > 0)\n',
        start: 'import veri\nimport pandas as pd\nkalemler = veri.oku("anadolu_market", "order_items")\n\ndef sepet_matrisi(kalemler):\n    # TODO: crosstab ile sipariş × ürün tablosu\n    # TODO: bool matrise çevir\n    pass\n',
        sol: 'import veri\nimport pandas as pd\nkalemler = veri.oku("anadolu_market", "order_items")\n\ndef sepet_matrisi(kalemler):\n    tablo = pd.crosstab(kalemler["order_id"], kalemler["product_id"])\n    return tablo > 0\n',
        tests: 'm = sepet_matrisi(kalemler)\nassert m.shape == (910, 38), f"910 sipariş × 38 satılmış ürün bekleniyordu, gelen {m.shape}"\nassert m.to_numpy().dtype == bool, "Hücreler True/False olmalı: crosstab sonucunu > 0 ile karşılaştır"\nassert int(m.to_numpy().sum()) == 1620, "Her kalem satırı ayrı bir (sipariş, ürün) çifti; toplam 1620 True olmalı"\nassert bool(m.loc[1, 27]) and bool(m.loc[1, 9]), "1 numaralı siparişte 27 ve 9 numaralı ürünler var"\n',
        hints: ['Çapraz sayım için pandas\'ta hazır bir fonksiyon var.', 'pd.crosstab(satir_serisi, sutun_serisi) sayım verir.', 'return pd.crosstab(kalemler["order_id"], kalemler["product_id"]) > 0'],
        why: 'crosstab her (sipariş, ürün) çiftini sayar; > 0 karşılaştırması onu varlık matrisine çevirir. Aynı ürün bir siparişte iki satırda geçse bile sepet analizinde tek varlık sayılır.' },
      { t: 'code',
        id: 'ml-kumeleme-w2',
        stage: 'Rehberli',
        diff: 2,
        needs: ['pandas'],
        q: '<p><code>kural(m, a, b)</code> fonksiyonunu yaz: bool sepet matrisi <code>m</code> ve iki ürün numarası alıp <code>{"destek": .., "guven": .., "lift": ..}</code> sözlüğü döndürsün (A → B kuralı). Değerleri 4 basamağa yuvarla. Matris gerçek veriden hazır kuruluyor.</p>',
        guide: ['Birlikte görülme: m[a] & m[b] serisinin ortalaması destektir.', 'Güven: destek / m[a].mean().', 'Lift: güven / m[b].mean().', 'Üçünü round(..., 4) ile sözlüğe koy.'],
        example: 'import pandas as pd\nm = pd.DataFrame({"x": [True, True, False], "y": [True, False, False]})\nprint((m["x"] & m["y"]).mean(), m["x"].mean())\n',
        start: 'import veri\nimport pandas as pd\nkalemler = veri.oku("anadolu_market", "order_items")\nm = pd.crosstab(kalemler["order_id"], kalemler["product_id"]) > 0\n\ndef kural(m, a, b):\n    # TODO: destek, güven, lift\n    return {}\n',
        sol: 'import veri\nimport pandas as pd\nkalemler = veri.oku("anadolu_market", "order_items")\nm = pd.crosstab(kalemler["order_id"], kalemler["product_id"]) > 0\n\ndef kural(m, a, b):\n    destek = (m[a] & m[b]).mean()\n    guven = destek / m[a].mean()\n    lift = guven / m[b].mean()\n    return {"destek": round(float(destek), 4), "guven": round(float(guven), 4), "lift": round(float(lift), 4)}\n',
        tests: 'r = kural(m, 10, 13)\nassert r["destek"] == 0.0077, f"10 ve 13 birlikte 7 sepette: 7/910 = 0.0077 olmalı, gelen {r[\'destek\']}"\nassert r["guven"] == 0.1029, f"10 numaralı ürün 68 sepette; güven 7/68 = 0.1029 olmalı, gelen {r[\'guven\']}"\nassert r["lift"] == 1.8735, f"lift = güven / destek(13) = 1.8735 olmalı, gelen {r[\'lift\']}"\nr2 = kural(m, 13, 10)\nassert r2["lift"] == r["lift"], "Lift simetriktir: A→B ve B→A aynı çıkmalı"\nassert r2["guven"] != r["guven"], "Güven yöne bağlıdır: payda n(A) değişir"\n',
        hints: ['Bool serinin ortalaması True oranıdır.', 'İki sütunu & ile birleştir: (m[a] & m[b]).mean()', 'lift = guven / m[b].mean()'],
        why: 'Destek ortak oran, güven A\'ya koşullu oran, lift ise güvenin B\'nin kendi yaygınlığına oranıdır. Lift simetrik, güven yönlüdür.' },
      { t: 'code',
        id: 'ml-kumeleme-w3',
        stage: 'Kendin yaz',
        diff: 2,
        needs: ['pandas'],
        q: '<p><code>sik_ciftler(kalemler, min_adet=5)</code> fonksiyonunu yaz: her siparişteki <b>farklı</b> ürünlerin tüm ikililerini say (ikili küçük numara önce: <code>(10, 13)</code>), en az <code>min_adet</code> sepette görülenleri <code>[((a, b), adet), ...]</code> listesi olarak döndür. Sıralama: adet büyükten küçüğe, eşitlikte ikili küçükten büyüğe. Ürün numaraları düz <code>int</code> olsun.</p>',
        start: 'import veri\nimport pandas as pd\nkalemler = veri.oku("anadolu_market", "order_items")\n\ndef sik_ciftler(kalemler, min_adet=5):\n    pass\n',
        sol: 'import veri\nimport pandas as pd\nkalemler = veri.oku("anadolu_market", "order_items")\nfrom collections import Counter\nfrom itertools import combinations\n\ndef sik_ciftler(kalemler, min_adet=5):\n    sayac = Counter()\n    for _, g in kalemler.groupby("order_id"):\n        urunler = sorted({int(u) for u in g["product_id"]})\n        for ikili in combinations(urunler, 2):\n            sayac[ikili] += 1\n    sonuc = [(p, n) for p, n in sayac.items() if n >= min_adet]\n    return sorted(sonuc, key=lambda t: (-t[1], t[0]))\n',
        tests: 'r = sik_ciftler(kalemler)\nassert r[0] == ((10, 13), 7), f"En sık ikili (10, 13) ve 7 sepet olmalı, gelen {r[0]}"\nassert len(r) == 22, f"En az 5 sepette görülen 22 ikili var, gelen {len(r)}"\nassert r == [((10, 13), 7), ((11, 13), 6), ((15, 18), 6), ((15, 19), 6), ((15, 27), 6), ((35, 37), 6), ((3, 19), 5), ((4, 26), 5), ((4, 35), 5), ((9, 32), 5), ((9, 35), 5), ((10, 20), 5), ((10, 28), 5), ((11, 12), 5), ((11, 31), 5), ((11, 39), 5), ((13, 20), 5), ((13, 27), 5), ((13, 31), 5), ((18, 28), 5), ((34, 37), 5), ((35, 39), 5)], "Sıralama: adet azalan, eşitlikte ikili artan"\nassert len(sik_ciftler(kalemler, 7)) == 1, "min_adet=7 ile yalnız bir ikili kalır"\nassert all(type(a) is int for (a, b), n in r), "Ürün numaraları int olmalı"\n',
        hints: ['groupby("order_id") ile her sepeti gez; ikilileri itertools.combinations üretir.', 'combinations(sorted(set(...)), 2) ikilileri hep küçük-büyük sırasıyla verir; Counter ile say.', 'sorted(..., key=lambda t: (-t[1], t[0]))'],
        why: 'Sıralı küme üzerinde combinations her ikiliyi tek biçimde üretir (aynı ikili iki farklı sırayla sayılmaz). Eksi adet ile azalan, ikili ile artan sıralama tek anahtarda birleşir.' },
      { t: 'code',
        id: 'ml-kumeleme-w4',
        stage: 'Kendin yaz',
        diff: 2,
        needs: ['pandas'],
        q: '<p>"Bunu alanlar şunları da aldı" kutusu için <code>benzer_urunler(m, urun, k=3)</code> yaz. <code>m</code> bool sepet matrisi (hazır). Hedef ürün sütunuyla diğer her sütun arasındaki kosinüs benzerliğini hesapla: <code>n(A, B) / sqrt(n(A) * n(B))</code>. Benzerliği 4 basamağa yuvarla; büyükten küçüğe, eşitlikte ürün numarası küçük olan önce gelecek şekilde ilk <code>k</code> ürün numarasını (<code>int</code>) liste olarak döndür. Ürünün kendisi listede olmasın.</p>',
        start: 'import veri\nimport pandas as pd\nkalemler = veri.oku("anadolu_market", "order_items")\nm = pd.crosstab(kalemler["order_id"], kalemler["product_id"]) > 0\n\ndef benzer_urunler(m, urun, k=3):\n    pass\n',
        sol: 'import veri\nimport pandas as pd\nkalemler = veri.oku("anadolu_market", "order_items")\nimport math\nm = pd.crosstab(kalemler["order_id"], kalemler["product_id"]) > 0\n\ndef benzer_urunler(m, urun, k=3):\n    hedef = m[urun]\n    n_a = hedef.sum()\n    puanlar = []\n    for diger in m.columns:\n        if diger == urun:\n            continue\n        ortak = (hedef & m[diger]).sum()\n        s = round(ortak / math.sqrt(n_a * m[diger].sum()), 4)\n        puanlar.append((-s, int(diger)))\n    puanlar.sort()\n    return [u for _, u in puanlar[:k]]\n',
        tests: 'assert benzer_urunler(m, 13) == [10, 11, 20], "13 (Saatleri Ayarlama Enstitüsü) için en benzer üç ürün [10, 11, 20] olmalı"\nassert benzer_urunler(m, 15, 4) == [18, 27, 19, 2], "15 (İstatistiğe Giriş) için ilk dört: [18, 27, 19, 2]"\nassert 35 not in benzer_urunler(m, 35, 5), "Ürün kendine önerilmemeli"\nassert all(type(u) is int for u in benzer_urunler(m, 35)), "Ürün numaraları int olmalı"\n',
        hints: ['Her sütun bir ürünün sepet vektörüdür; ortak sayı iki sütunun & işleminin toplamıdır.', '(m[a] & m[b]).sum() / math.sqrt(m[a].sum() * m[b].sum())', 'Eksi puan ve ürün numarasından oluşan demetleri sıralarsan iki ölçüt birden uygulanır.'],
        why: 'İkili vektörlerde iç çarpım ortak sepet sayısı, norm ise sepet sayısının kareköküdür. Kosinüs, popüler ürünlerin yalnızca çok satıldığı için öne çıkmasını kısmen dengeler.' },
      { t: 'code',
        id: 'ml-kumeleme-w5',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 2,
        q: '<p>Hatayı bul ve düzelt. <code>kurallar(sepetler, min_adet)</code> en az <code>min_adet</code> sepette birlikte görülen her ikili için iki yönlü kuralları <code>(a, b, guven, lift)</code> olarak (2 basamak) döndürmeli, lift\'e göre azalan sıralı. Ama lift değerleri yanlış çıkıyor ve iki yön aynı lift\'i vermiyor; ayrıca eşik bir eksik sayıyla uygulanıyor.</p>',
        start: 'from collections import Counter\nfrom itertools import combinations\n\ndef kurallar(sepetler, min_adet):\n    n = len(sepetler)\n    tek = Counter(u for s in sepetler for u in set(s))\n    cift = Counter(p for s in sepetler for p in combinations(sorted(set(s)), 2))\n    sonuc = []\n    for (x, y), nxy in cift.items():\n        if nxy > min_adet:\n            for a, b in ((x, y), (y, x)):\n                guven = nxy / tek[a]\n                lift = guven / (tek[a] / n)\n                sonuc.append((a, b, round(guven, 2), round(lift, 2)))\n    return sorted(sonuc, key=lambda r: (-r[3], r[0], r[1]))\n',
        sol: 'from collections import Counter\nfrom itertools import combinations\n\ndef kurallar(sepetler, min_adet):\n    n = len(sepetler)\n    tek = Counter(u for s in sepetler for u in set(s))\n    cift = Counter(p for s in sepetler for p in combinations(sorted(set(s)), 2))\n    sonuc = []\n    for (x, y), nxy in cift.items():\n        if nxy >= min_adet:\n            for a, b in ((x, y), (y, x)):\n                guven = nxy / tek[a]\n                lift = guven / (tek[b] / n)\n                sonuc.append((a, b, round(guven, 2), round(lift, 2)))\n    return sorted(sonuc, key=lambda r: (-r[3], r[0], r[1]))\n',
        tests: 'S = [["çay", "şeker"], ["çay", "kupa"], ["çay", "şeker", "kupa"], ["kahve"], ["şeker"], ["kahve", "kupa"]]\nr = kurallar(S, 2)\nassert ("çay", "şeker", 0.67, 1.33) in r, f"çay→şeker: güven 2/3, lift (2/3)/(3/6)=1.33 olmalı; gelen {r}"\nassert ("şeker", "çay", 0.67, 1.33) in r, "Lift simetrik: şeker→çay da 1.33 olmalı"\nassert len(r) == 4, f"min_adet=2: 2 sepette görülen (çay, şeker) ve (çay, kupa) ikilileri, iki yönle 4 kural; gelen {len(r)}"\nassert kurallar(S, 3) == [], "3 sepette birlikte görülen ikili yok"\n',
        hints: ['Lift\'in paydası sonuç ürününün (b) desteğidir.', 'Eşik "en az" demek: >= kullan.'],
        why: 'lift = güven(A→B) / destek(B). Paydada A\'nın desteği kalırsa ölçü yönlü olur ve anlamını yitirir. "En az" eşikleri >= ile yazılır.' },
      { t: 'code',
        id: 'ml-kumeleme-w6',
        stage: 'Meydan okuma',
        diff: 3,
        needs: ['pandas'],
        q: '<p>Apriori\'yi yaz. <code>apriori(sepetler, min_adet, en_buyuk=3)</code>: <code>sepetler</code> küme listesi. Sık öğe kümelerini <code>{frozenset: adet}</code> sözlüğü olarak döndür (boyut 1\'den <code>en_buyuk</code>\'a kadar). Kural: k boyutlu adaylar yalnız sık (k-1) boyutlu kümelerin birleşiminden üretilsin ve <b>tüm (k-1) alt kümesi sık olmayan aday sayılmadan elensin</b>. Testler küçük örnekte ve gerçek <code>order_items</code> sepetlerinde (min_adet=5) çalışır.</p>',
        start: 'import veri\nimport pandas as pd\nkalemler = veri.oku("anadolu_market", "order_items")\nsepetler = [set(g) for _, g in kalemler.groupby("order_id")["product_id"]]\n\ndef apriori(sepetler, min_adet, en_buyuk=3):\n    pass\n',
        sol: 'import veri\nimport pandas as pd\nkalemler = veri.oku("anadolu_market", "order_items")\nfrom itertools import combinations\nsepetler = [set(g) for _, g in kalemler.groupby("order_id")["product_id"]]\n\ndef apriori(sepetler, min_adet, en_buyuk=3):\n    sayac = {}\n    for s in sepetler:\n        for u in s:\n            k = frozenset([u])\n            sayac[k] = sayac.get(k, 0) + 1\n    sik = {k: v for k, v in sayac.items() if v >= min_adet}\n    sonuc = dict(sik)\n    boyut = 2\n    while sik and boyut <= en_buyuk:\n        onceki = list(sik)\n        adaylar = set()\n        for i in range(len(onceki)):\n            for j in range(i + 1, len(onceki)):\n                b = onceki[i] | onceki[j]\n                if len(b) == boyut and all(frozenset(alt) in sik for alt in combinations(b, boyut - 1)):\n                    adaylar.add(b)\n        sayac = {a: sum(1 for s in sepetler if a <= s) for a in adaylar}\n        sik = {k: v for k, v in sayac.items() if v >= min_adet}\n        sonuc.update(sik)\n        boyut += 1\n    return sonuc\n',
        tests: 'S = [{"a", "b", "c"}, {"a", "b"}, {"a", "c"}, {"b", "c"}, {"a", "b", "c"}, {"d"}]\nr = apriori(S, 2)\nassert r[frozenset("ab")] == 3 and r[frozenset("abc")] == 2, "ab 3 sepette, abc 2 sepette"\nassert frozenset("d") not in r, "d yalnız 1 sepette; min_adet=2 ile elenmeli"\nassert len(r) == 7, f"a, b, c, ab, ac, bc, abc = 7 sık küme; gelen {len(r)}"\ng = apriori(sepetler, 5)\nassert sum(1 for k in g if len(k) == 2) == 22, \'Gerçek veride en az 5 sepette görülen 22 ikili var\'\nassert max(len(k) for k in g) == 2, \'Gerçek veride 5 sepete ulaşan üçlü yok\'\nassert g[frozenset([10, 13])] == 7, \'(10, 13) ikilisi 7 sepette\'\n',
        hints: ['Önce tekil sayım, sonra döngüde boyutu bir artırarak ilerle.', 'Aday = iki sık kümenin birleşimi ve boyutu tam k; combinations(aday, k-1) ile alt kümeleri kontrol et.', 'Adayı saymak için alt küme testi: aday <= sepet.'],
        why: 'Anti-monotonluk sayesinde sık olmayan kümenin üst kümeleri hiç sayılmaz; adayların küçük tutulması algoritmanın büyük veride çalışmasını sağlar.' }
    ],
    faq: [
      { q: 'Apriori\'yi her seferinde kendim mi yazmalıyım?',
        a: 'Hayır. Üretimde <code>mlxtend.frequent_patterns</code> (<code>apriori</code>, <code>fpgrowth</code>, <code>association_rules</code>) ya da Spark MLlib\'in <code>FPGrowth</code> sınıfı kullanılır (<code>pip install mlxtend</code>). Kendin yazmak ölçülerin ve budamanın mantığını anlamak içindir; kütüphanenin sonuçlarını da böylece denetleyebilirsin.' },
      { q: 'Sepet analizi ile öneri sistemi aynı şey mi?',
        a: 'Akrabadırlar. Sepet kuralları "aynı siparişte birlikte" ilişkisini, öğe-öğe benzerliği ise aynı mantığı vektörlerle kullanır. Tam öneri sistemleri müşteri geçmişini, zamanı ve içerik bilgisini de kullanır (matris ayrıştırma, iki kuleli modeller). Küçük bir e-ticarette bu bölümdeki yöntem iyi bir başlangıçtır ve A/B testiyle ölçülmelidir.' }
    ],
    mistakes: [
      { bad: 'lift = guven / destek_a',
        good: 'lift = guven / destek_b',
        why: 'Lift\'in paydası sonuç ürününün (B) desteğidir; A\'ya bölersen ölçü simetrisini ve anlamını kaybeder.' }
    ] }
);
})(window);
