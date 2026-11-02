/* Kesit Python — 'nlp-metin' dersi uzantısı: Lezzet Kurye yorumlarıyla metin analizi (gerçek veri setleri) */
// needs: pandas, scikit-learn
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
  {
    id: 'nlp-metin',
    min: 25,
    needs: ['pandas', 'scikit-learn'],
    html: `<h2>Derinleş: gerçek müşteri yorumlarıyla metin analizi</h2><p>Dersteki metin teknikleri birkaç örnek cümleyle çalışıyordu. Şimdi bir yemek teslimat platformunun gerçek değerlendirme tablosuna geçelim: <code>lezzet_kurye</code> setindeki <code>lk_ratings</code>. Her satır bir siparişin değerlendirmesidir: <code>food_score</code> ve <code>courier_score</code> (1–5) ile isteğe bağlı <code>comment</code>. 3.979 değerlendirmenin 2.366'sında yorum var. Bu tablo, metin analizinde sık karşılaşılan iki gerçeği öğretir: <b>metin alanlarının önemli bir kısmı boştur</b> ve <b>kısa yorumlar sık tekrar eder</b> ("Güzeldi", "Süper" gibi).</p><pre class="py">import veri

r = veri.oku("lezzet_kurye", "lk_ratings")
print(len(r), "değerlendirme,", int(r["comment"].notna().sum()), "yorum")
print("farklı yorum metni:", r["comment"].nunique())
print(r["comment"].value_counts().head(5))
</pre><p>2.366 yorumda 275 farklı metin var: bir metin ortalama 8-9 kez geçiyor. (Bu veri hayali: yorumlar yaklaşık 300 metinlik bir havuzdan seçildi, gerçek platformda çeşitlilik daha fazladır.) Böyle bir veride önce <b>metin başına özet</b> çıkarmak en verimli adımdır: her kalıp kaç kez geçiyor, ortalama yemek ve kurye puanı ne?</p><pre class="py">import veri

r = veri.oku("lezzet_kurye", "lk_ratings").dropna(subset=["comment"])
ozet = r.groupby("comment").agg(adet=("order_id", "size"), yemek=("food_score", "mean"),
                                kurye=("courier_score", "mean"))
print(ozet.round(2).sort_values("yemek").head(6))
</pre><h3>Kural tabanlı konu etiketleme</h3><p>Model eğitmeden önce, iş birimiyle birlikte bir <b>anahtar kelime sözlüğü</b> kurmak çoğu zaman en hızlı ve açıklanabilir başlangıçtır. Türkçede kelimeler ek aldığı için tam kelime yerine <b>kök parçası</b> ara: "lezzet" hem "lezzetli" hem "lezzetliydi" ile eşleşir, "dökül" ise "dökülmüştü" ile. Küçük harfe çevirirken Türkçe I/İ kuralını unutma. Bir yorum birden çok konuya girebilir: "Biraz geç geldi ama lezzetli" hem gecikme hem lezzet konusudur.</p><pre class="py">def tr_kucuk(metin):
    return metin.replace("I", "ı").replace("İ", "i").lower()
KONULAR = {
    "gecikme": ["geç"],
    "sıcaklık": ["soğuk"],
    "hatalı sipariş": ["eksik", "yanlış", "dökül"],
    "porsiyon": ["porsiyon"],
    "lezzet": ["lezzet"],
}

import veri
from collections import Counter

def konular(metin):
    k = tr_kucuk(metin)
    return [ad for ad, kokler in KONULAR.items() if any(x in k for x in kokler)]

yorumlar = veri.oku("lezzet_kurye", "lk_ratings")["comment"].dropna()
sayim = Counter(k for y in yorumlar for k in konular(y))
print(dict(sayim.most_common()))
print(konular("Biraz geç geldi ama lezzetli"))
</pre><div class="warn"><b>Boş metin ve .str</b><code>r["comment"].str.contains("geç")</code> boş yorumlarda NaN döndürür ve bu maskeyle satır seçmek hata verir. <code>na=False</code> ver ya da önce <code>dropna</code> uygula. Boş yorumu "olumsuz" ya da "olumlu" saymak da hatadır: o müşteri yalnızca yazmamıştır.</div><h3>Puanı etiket yapmak ve sızıntı tuzağı</h3><p>Elinde elle etiketlenmiş duygu verisi yoksa, yıldız puanı <b>zayıf etiket</b> (weak label) olarak kullanılabilir: <code>food_score &gt;= 4</code> olumlu, <code>&lt;= 2</code> olumsuz, 3 belirsiz (dışarıda bırakılır). Ama burada büyük bir tuzak var: aynı metin tekrar ettiği için rastgele eğitim/test bölmesinde test cümlelerinin <b>çoğu</b> eğitimde de bulunur. Model ezberinden yararlanır, başarıyı olduğundan yüksek raporlarsın. Gerçek başarıyı görmek için bölmeyi <b>metne göre gruplu</b> yap (<code>GroupShuffleSplit</code>): böylece test setindeki kalıpları model hiç görmemiş olur.</p><pre class="py">def tr_kucuk(metin):
    return metin.replace("I", "ı").replace("İ", "i").lower()

import veri
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.model_selection import train_test_split, GroupShuffleSplit
from sklearn.metrics import balanced_accuracy_score

r = veri.oku("lezzet_kurye", "lk_ratings").dropna(subset=["comment"])
r = r[r["food_score"] != 3]
X = r["comment"]
y = np.where(r["food_score"] &gt;= 4, "olumlu", "olumsuz")
model = make_pipeline(TfidfVectorizer(preprocessor=tr_kucuk),
                      LogisticRegression(max_iter=1000, class_weight="balanced"))

a, b, ya, yb = train_test_split(X, y, test_size=0.3, random_state=0, stratify=y)
print("rastgele bölme:", round(balanced_accuracy_score(yb, model.fit(a, ya).predict(b)), 3))
tr, te = next(GroupShuffleSplit(n_splits=1, test_size=0.3, random_state=0).split(X, y, groups=X))
model.fit(X.iloc[tr], y[tr])
print("gruplu bölme:", round(balanced_accuracy_score(y[te], model.predict(X.iloc[te])), 3))
</pre><p>Dengeli doğruluk rastgele bölmede 0,693 iken gruplu bölmede 0,588'e düşüyor: görülmemiş metinlerde model yazı turanın az üstünde. Puan gürültülü bir etiket, metinler de kısa. Ders: bu veriyle güçlü bir duygu modeli bekleme; konu sayımı ve metin başına puan özeti çok daha dürüst bir analizdir. Gerçek serbest metin biriktiğinde model sorusu yeniden açılır.</p><div class="note"><b>Gerçek işte</b>Müşteri deneyimi ekipleri haftalık "şikâyet konusu" raporunu tam olarak böyle kurar: kural tabanlı etiketleme, konu başına sayı ve ortalama puan, haftadan haftaya değişim. Model ancak elle etiketlenmiş birkaç bin serbest metin toplandıktan sonra devreye girer ve kural tabanlı sistemle yan yana karşılaştırılır.</div>`,
    ex: [
      {
        t: 'predict',
        stage: 'Kodu oku',
        q: 'Değerlendirme tablosunda yorumlar sayılıyor. Bu kod ne yazdırır?',
        needs: ['pandas'],
        code: 'import veri\nr = veri.oku("lezzet_kurye", "lk_ratings")\nprint(len(r), int(r["comment"].notna().sum()), r["comment"].nunique())\n',
        o: ['3979 2366 275', '3979 3979 275', '3979 2366 2366', '2366 2366 275'],
        a: 0,
        why: '3.979 değerlendirmenin 2.366\'sında yorum var; nunique boşları saymaz ve 275 farklı metin bulur.'
      },
      {
        t: 'predict',
        stage: 'Kodu oku',
        q: '"geç" geçen yorumlar seçiliyor. Bu kod ne yazdırır?',
        needs: ['pandas'],
        code: 'import veri\nr = veri.oku("lezzet_kurye", "lk_ratings")\nmaske = r["comment"].str.contains("geç", na=False)\nprint(int(maske.sum()), round(r.loc[maske, "courier_score"].mean(), 2))\n',
        o: ['34 2.85', '57 2.85', '34 4.12', 'ValueError hatası verir'],
        a: 0,
        why: '"geç" 34 yorumda geçer; "gec" diye yazan 23 yorum kaçar, gerçek metinde yazım farkına dikkat. na=False sayesinde boş yorumlar False olur ve hata çıkmaz. Kurye puanı ortalaması 2,85, gecikme yorumu olmayanlardan (4,12) belirgin düşük.'
      },
      {
        t: 'order',
        stage: 'Kodu oku',
        q: '<p>Yorumları Türkçe küçük harfe çevirip kelimelere ayıran ve durak kelimeler dışındaki en sık 3 kelimeyi yazdıran programın satırlarını sırala.</p>',
        needs: ['pandas'],
        lines: ['import re', 'import veri', 'from collections import Counter', 'DURAK = {"ve", "ama", "çok", "biraz", "hiç", "vardı"}', 'yorumlar = veri.oku("lezzet_kurye", "lk_ratings")["comment"].dropna()', 'kelimeler = [k for y in yorumlar for k in re.findall(r"[a-zçğıöşü]+", y.replace("I", "ı").replace("İ", "i").lower())]', 'sayim = Counter(k for k in kelimeler if k not in DURAK)', 'print(sayim.most_common(3))'],
        expect: '[(\'kurye\', 220), (\'geldi\', 215), (\'iyi\', 154)]\n',
        hint: 'Durak kümesi ve yorumlar, kelime listesinden önce hazır olmalı.',
        why: '"kurye" ve "geldi" en sık kelimeler; "geldi" bilgi taşımadığı için gerçek analizde durak listesine eklenir.'
      },
      {
        t: 'code',
        id: 'nlp-metin-v1',
        stage: 'Rehberli',
        diff: 2,
        needs: ['pandas'],
        q: '<p><code>kalip_ozeti()</code>: <code>lk_ratings</code> tablosunda yorumu olan satırlar için yorum metni başına <code>adet</code>, ortalama <code>yemek</code> (food_score) ve <code>kurye</code> (courier_score) puanını (2 basamak) hesapla; yemek puanına göre <b>artan</b>, eşitlikte adede göre azalan sıralı DataFrame döndür (index: yorum metni).</p>',
        guide: ['dropna(subset=["comment"]) ile boş yorumları at.', 'groupby("comment").agg(adet=..., yemek=..., kurye=...)', 'round(2)', 'sort_values(["yemek", "adet"], ascending=[True, False])'],
        example: 'import pandas as pd\nd = pd.DataFrame({"y": ["iyi", "kötü", "iyi"], "p": [5, 1, 4]})\nprint(d.groupby("y").agg(adet=("p", "size"), ort=("p", "mean")).sort_values("ort"))\n',
        start: 'import veri\n\ndef kalip_ozeti():\n    r = veri.oku("lezzet_kurye", "lk_ratings")\n    # TODO: boşları at, metne göre özetle, sırala\n    return r\n',
        sol: 'import veri\n\ndef kalip_ozeti():\n    r = veri.oku("lezzet_kurye", "lk_ratings").dropna(subset=["comment"])\n    t = r.groupby("comment").agg(adet=("order_id", "size"), yemek=("food_score", "mean"),\n                                 kurye=("courier_score", "mean")).round(2)\n    return t.sort_values(["yemek", "adet"], ascending=[True, False])\n',
        tests: 't = kalip_ozeti()\nassert len(t) == 275, f"275 farklı metin olmalı, {len(t)} geldi"\nassert list(t.columns) == ["adet", "yemek", "kurye"], "Sütunlar adet, yemek, kurye"\nassert t.index[0] == "Kutu ıslanmış, her yer yağ" and t.iloc[0].tolist() == [3, 1.0, 2.33], f"İlk satır: {t.index[0]} {t.iloc[0].tolist()}"\nassert t.loc["Porsiyon küçüktü", "kurye"] == 3.33, "Porsiyon şikâyetinde kurye puanı 3.33"\nassert int(t["adet"].sum()) == 2366, "Tüm yorumlar sayılmalı"\nassert t[t["yemek"] == 5.0]["adet"].is_monotonic_decreasing, "Yemek puanı eşitse adede göre azalan"\n',
        hints: ['Adlandırılmış toplama: agg(yeni=("sütun", "fonksiyon")).', 'İki anahtarla sıralarken ascending de liste olur.'],
        why: 'En düşük puanlı metinler ağır şikâyetler, ama çoğu yalnız birkaç kez geçiyor: az sayıda kayda dayanan ortalamayı tek başına yorumlama. Adet sütunu bu yüzden tablodadır.'
      },
      {
        t: 'code',
        id: 'nlp-metin-v2',
        stage: 'Rehberli',
        diff: 2,
        needs: ['pandas'],
        q: '<p><code>konu_sayimi()</code>: <code>KONULAR</code> sözlüğünü (verildi) kullanarak her yorumu (Türkçe küçük harfe çevrilmiş) konulara etiketle: bir kök parçası metinde geçiyorsa yorum o konudadır; bir yorum birden çok konuda olabilir. <code>{konu: yorum_sayısı}</code> sözlüğünü çoktan aza sıralı döndür ve hiçbir konuya girmeyen yorum sayısını da <code>"diğer"</code> anahtarıyla en sona ekle.</p>',
        guide: ['Boş yorumları dropna ile at.', 'Her yorum için tr_kucuk uygula ve KONULAR\'ı gez.', 'any(kok in metin for kok in kokler) ile eşleşmeyi bul.', 'Counter ile say; most_common sırasıyla sözlüğe çevir, sonra "diğer" ekle.'],
        example: 'from collections import Counter\nKURAL = {"kargo": ["kargo"], "fiyat": ["pahalı", "ucuz"]}\nmetinler = ["kargo geç", "çok pahalı", "kargo ucuz"]\nc = Counter(k for m in metinler for k, ks in KURAL.items() if any(x in m for x in ks))\nprint(dict(c.most_common()))\n',
        start: 'import veri\nfrom collections import Counter\n\ndef tr_kucuk(metin):\n    return metin.replace("I", "ı").replace("İ", "i").lower()\n\nKONULAR = {\n    "gecikme": ["geç"],\n    "sıcaklık": ["soğuk"],\n    "hatalı sipariş": ["eksik", "yanlış", "dökül"],\n    "porsiyon": ["porsiyon"],\n    "lezzet": ["lezzet"],\n}\n\ndef konu_sayimi():\n    yorumlar = veri.oku("lezzet_kurye", "lk_ratings")["comment"].dropna()\n    sayim = Counter()\n    diger = 0\n    # TODO: her yorumu konulara etiketle\n    return dict(sayim)\n',
        sol: 'import veri\nfrom collections import Counter\n\ndef tr_kucuk(metin):\n    return metin.replace("I", "ı").replace("İ", "i").lower()\n\nKONULAR = {\n    "gecikme": ["geç"],\n    "sıcaklık": ["soğuk"],\n    "hatalı sipariş": ["eksik", "yanlış", "dökül"],\n    "porsiyon": ["porsiyon"],\n    "lezzet": ["lezzet"],\n}\n\ndef konu_sayimi():\n    yorumlar = veri.oku("lezzet_kurye", "lk_ratings")["comment"].dropna()\n    sayim = Counter()\n    diger = 0\n    for y in yorumlar:\n        k = tr_kucuk(y)\n        bulunan = [ad for ad, kokler in KONULAR.items() if any(x in k for x in kokler)]\n        sayim.update(bulunan)\n        if not bulunan:\n            diger += 1\n    sonuc = dict(sayim.most_common())\n    sonuc["diğer"] = diger\n    return sonuc\n',
        tests: 's = konu_sayimi()\nassert s == {"lezzet": 169, "porsiyon": 113, "hatalı sipariş": 87, "gecikme": 34, "sıcaklık": 6, "diğer": 1982}, f"Sayım: {s}"\nassert list(s)[-1] == "diğer", "diğer en sonda olmalı"\n',
        hints: ['Counter.update(liste) listedeki her elemanı bir artırır.', 'Bir yorum hiçbir konuya girmediyse bulunan listesi boştur.'],
        why: 'Yorumların çoğu "diğer"de kaldı: sözlük küçük ve "gec", "soguk" gibi yazımları kaçırıyor. Sözlüğü gerçek metne bakarak büyütmek gerekir. Çok etiketli sayımda bir yorum iki konuya girebilir ("Biraz geç geldi ama lezzetli"), toplam yorum sayısından büyük olabilir.'
      },
      {
        t: 'code',
        id: 'nlp-metin-v3',
        stage: 'Kendin yaz',
        diff: 2,
        needs: ['pandas'],
        q: '<p><code>konu_puanlari()</code>: her konu (KONULAR, verildi) için o konudaki yorumların ortalama <code>food_score</code> ve <code>courier_score</code> değerini 2 basamakla hesapla. <code>{konu: (yemek, kurye)}</code> döndür; konular yemek puanına göre artan sırada olsun. pandas\'ın <code>str.contains</code> metodunu kullanabilirsin (<code>na=False</code> unutma; birden çok kök için <code>"|".join(kokler)</code> regex\'i).</p>',
        start: 'import veri\n\ndef tr_kucuk(metin):\n    return metin.replace("I", "ı").replace("İ", "i").lower()\n\nKONULAR = {\n    "gecikme": ["geç"],\n    "sıcaklık": ["soğuk"],\n    "hatalı sipariş": ["eksik", "yanlış", "dökül"],\n    "porsiyon": ["porsiyon"],\n    "lezzet": ["lezzet"],\n}\n\ndef konu_puanlari():\n    pass\n',
        sol: 'import veri\n\ndef tr_kucuk(metin):\n    return metin.replace("I", "ı").replace("İ", "i").lower()\n\nKONULAR = {\n    "gecikme": ["geç"],\n    "sıcaklık": ["soğuk"],\n    "hatalı sipariş": ["eksik", "yanlış", "dökül"],\n    "porsiyon": ["porsiyon"],\n    "lezzet": ["lezzet"],\n}\n\ndef konu_puanlari():\n    r = veri.oku("lezzet_kurye", "lk_ratings")\n    metin = r["comment"].fillna("").map(tr_kucuk)\n    sonuc = {}\n    for ad, kokler in KONULAR.items():\n        m = metin.str.contains("|".join(kokler), na=False)\n        sonuc[ad] = (round(float(r.loc[m, "food_score"].mean()), 2), round(float(r.loc[m, "courier_score"].mean()), 2))\n    return dict(sorted(sonuc.items(), key=lambda kv: kv[1][0]))\n',
        tests: 's = konu_puanlari()\nassert list(s)[0] == "sıcaklık", f"En düşük puanlı konu sıcaklık olmalı: {list(s)}"\nassert s["hatalı sipariş"] == (3.24, 3.57), f"hatalı sipariş: {s[\'hatalı sipariş\']}"\nassert s["sıcaklık"] == (2.83, 2.5), f"sıcaklık: {s[\'sıcaklık\']}"\nassert s["gecikme"] == (3.18, 2.85), "gecikme"\nassert s["porsiyon"] == (4.01, 4.1), "porsiyon"\nassert list(s)[-1] == "porsiyon", "En yüksek yemek puanı porsiyon konusunda"\n',
        hints: ['fillna("") boş yorumları boş metne çevirir; böylece tr_kucuk hata vermez.', '"eksik|yanlış|dökül" regex\'i üç kökten herhangi birini arar.'],
        why: 'Sıcaklık ve gecikme yorumları en düşük puanları alıyor, kurye puanı da onlarda yemek puanından düşük: müşteri teslimat sorununu kuryeye yansıtıyor. Sıcaklık yalnız 6 yorumdan geliyor, küçük grubu abartma. Bu, şikâyeti doğru ekibe yönlendirmenin önemini gösterir.'
      },
      {
        t: 'code',
        id: 'nlp-metin-v4',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 2,
        needs: ['pandas'],
        q: '<p>Hatayı bul ve düzelt. <code>sikayet_orani()</code> yorumu olan değerlendirmeler içinde "geç", "soğuk" ya da "eksik" kökü geçenlerin yüzdesini (1 basamak) döndürmeli. Ama <code>ValueError: Cannot mask with non-boolean array containing NA / NaN values</code> veriyor; hata giderilince de yüzde yanlış çıkıyor.</p>',
        start: 'import veri\n\ndef sikayet_orani():\n    r = veri.oku("lezzet_kurye", "lk_ratings")\n    m = r["comment"].str.lower().str.contains("geç|soğuk|eksik")\n    sikayet = r[m]\n    return round(len(sikayet) / len(r) * 100, 1)\n',
        sol: 'import veri\n\ndef sikayet_orani():\n    r = veri.oku("lezzet_kurye", "lk_ratings").dropna(subset=["comment"])\n    m = r["comment"].str.lower().str.contains("geç|soğuk|eksik")\n    sikayet = r[m]\n    return round(len(sikayet) / len(r) * 100, 1)\n',
        tests: 'assert sikayet_orani() == 3.9, f"Oran: {sikayet_orani()}"\n',
        hints: ['Boş yorumlarda str.contains NaN döndürür.', 'Payda "yorumu olan değerlendirmeler" olmalı; boşları önce at.'],
        why: 'Boş yorumları atmak iki hatayı birden çözer: maske artık yalnızca True/False içerir ve payda yorum yazan müşteri sayısı olur. Yorum yazmayan müşteriyi paydaya katmak oranı yapay olarak düşürür.'
      },
      {
        t: 'code',
        id: 'nlp-metin-v5',
        stage: 'Meydan okuma',
        diff: 3,
        needs: ['pandas', 'scikit-learn'],
        q: '<p>Sızıntıyı ölç. <code>iki_bolme()</code>: yorumu olan ve <code>food_score != 3</code> satırları al; etiket <code>food_score &gt;= 4</code> → <code>"olumlu"</code>, değilse <code>"olumsuz"</code>. Model: <code>make_pipeline(TfidfVectorizer(preprocessor=tr_kucuk), LogisticRegression(max_iter=1000, class_weight="balanced"))</code>. (1) <code>train_test_split(test_size=0.3, random_state=0, stratify=y)</code> ile, (2) <code>GroupShuffleSplit(n_splits=1, test_size=0.3, random_state=0)</code> ile <b>yorum metnine göre gruplu</b> böl. Her biri için test setinde <code>balanced_accuracy_score</code> (3 basamak) hesapla. <code>{"rastgele": .., "gruplu": .., "ortak_metin": ..}</code> döndür; <code>ortak_metin</code>: rastgele bölmede test setindeki farklı metinlerden kaçının eğitimde de bulunduğu.</p>',
        start: 'import veri\nimport numpy as np\nfrom sklearn.feature_extraction.text import TfidfVectorizer\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.pipeline import make_pipeline\nfrom sklearn.model_selection import train_test_split, GroupShuffleSplit\nfrom sklearn.metrics import balanced_accuracy_score\n\ndef tr_kucuk(metin):\n    return metin.replace("I", "ı").replace("İ", "i").lower()\n\ndef iki_bolme():\n    pass\n',
        sol: 'import veri\nimport numpy as np\nfrom sklearn.feature_extraction.text import TfidfVectorizer\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.pipeline import make_pipeline\nfrom sklearn.model_selection import train_test_split, GroupShuffleSplit\nfrom sklearn.metrics import balanced_accuracy_score\n\ndef tr_kucuk(metin):\n    return metin.replace("I", "ı").replace("İ", "i").lower()\n\ndef _model():\n    return make_pipeline(TfidfVectorizer(preprocessor=tr_kucuk), LogisticRegression(max_iter=1000, class_weight="balanced"))\n\ndef iki_bolme():\n    r = veri.oku("lezzet_kurye", "lk_ratings").dropna(subset=["comment"])\n    r = r[r["food_score"] != 3]\n    X = r["comment"].reset_index(drop=True)\n    y = np.where(r["food_score"] >= 4, "olumlu", "olumsuz")\n    a, b, ya, yb = train_test_split(X, y, test_size=0.3, random_state=0, stratify=y)\n    rastgele = balanced_accuracy_score(yb, _model().fit(a, ya).predict(b))\n    ortak = len(set(b) & set(a))\n    tr, te = next(GroupShuffleSplit(n_splits=1, test_size=0.3, random_state=0).split(X, y, groups=X))\n    gruplu = balanced_accuracy_score(y[te], _model().fit(X.iloc[tr], y[tr]).predict(X.iloc[te]))\n    return {"rastgele": round(float(rastgele), 3), "gruplu": round(float(gruplu), 3), "ortak_metin": ortak}\n',
        tests: 's = iki_bolme()\nassert s["rastgele"] == 0.693, f"Rastgele bölme: {s}"\nassert s["gruplu"] == 0.588, f"Gruplu bölme: {s}"\nassert s["ortak_metin"] == 184, f"Rastgele bölmede test metinlerinin çoğu eğitimde de var: {s}"\n',
        hints: ['groups=X: aynı metin hep aynı tarafta kalır.', 'Ortak metin: set(test_metinleri) & set(egitim_metinleri).', 'Gruplu bölmede ilk dönen (tr, te) indeksleriyle X.iloc ve y[...] kullan.'],
        why: 'Rastgele bölmede test setindeki 199 metnin 184\'ü eğitimde de var: model bu sayede 0,693 alıyor. Gruplu bölmede görülmemiş metinlerde 0,588 kalıyor. Tekrarlı metinlerde değerlendirme her zaman metne göre gruplu yapılmalıdır.'
      }
    ],
    faq: [
      {
        q: 'Yıldız puanını duygu etiketi olarak kullanmak doğru mu?',
        a: 'Hızlı bir başlangıç için kabul edilebilir ama gürültülüdür: "Porsiyon küçüktü" yazıp 5 veren de, "Soğuk geldi" yazıp 4 veren de var. Puan ve metin farklı şeyleri ölçebilir. Ciddi bir model için birkaç yüz yorumu elle etiketleyip puan tabanlı etiketle uyumunu ölç.'
      }
    ],
    mistakes: [
      {
        bad: 'm = r["comment"].str.contains("geç")\nr[m]',
        good: 'm = r["comment"].str.contains("geç", na=False)\nr[m]',
        why: 'Boş metinlerde str.contains NaN döndürür; NaN içeren maskeyle satır seçmek ValueError verir.'
      }
    ]
  }
);
})(window);
