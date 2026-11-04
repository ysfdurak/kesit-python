/* Kesit Python: select_dtypes, explode, query, pipe, groupby.apply, Grouper. uretec/p2/gercek.py üretir, elle düzenleme. */
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
{
 "id": "pandas-temizlik",
 "min": 12,
 "html": "<h2>Dört küçük araç: select_dtypes, explode, query, pipe</h2>\n<pre class=\"py\">import pandas as pd\n\nd = pd.DataFrame({\"no\": [1, 2], \"sehir\": [\"Van\", \"Kars\"], \"urunler\": [[\"çay\", \"kek\"], [\"kahve\"]], \"tutar\": [40.0, 25.0]})\nprint(d.select_dtypes(include=\"number\").columns.tolist())\nprint(d.explode(\"urunler\"))\nprint(d.query(\"tutar &gt; 30\")[\"sehir\"].tolist())\nprint(d.pipe(lambda x: x.assign(kdvli=x[\"tutar\"] * 1.2))[\"kdvli\"].round(1).tolist())</pre>\n<p><code>select_dtypes</code> keşfin ilk adımıdır: hangi sütunlar sayı, hangileri metin? Sayı olması gereken sütun metin çıkıyorsa temizlik başlar. <code>explode</code> API'den gelen liste sütununu satırlara açar; diğer sütunlar tekrar eder, toplam alırken dikkat et. <code>query</code> uzun filtreleri okunur yapar, dış değişkeni <code>@</code> ile alır. <code>pipe</code> kendi fonksiyonunu zincire sokar.</p>",
 "ex": [
  {
   "t": "code",
   "id": "pandas-temizlik-g1",
   "stage": "Rehberli",
   "diff": 2,
   "q": "<p><b>select_dtypes.</b> <code>tur_ayir(df)</code>: <code>(sayısal_sütunlar, diğerleri)</code> iki liste döndürsün. <code>sayisal_ozet(df)</code>: yalnız sayısal sütunların <code>min</code> ve <code>max</code> satırlarını versin. Sütun adlarını elle yazma.</p>",
   "start": "import pandas as pd\n\ndef tur_ayir(df):\n    pass\n\ndef sayisal_ozet(df):\n    pass\n",
   "sol": "import pandas as pd\n\ndef tur_ayir(df):\n    return list(df.select_dtypes(include=\"number\").columns), list(df.select_dtypes(exclude=\"number\").columns)\n\ndef sayisal_ozet(df):\n    return df.select_dtypes(include=\"number\").agg([\"min\", \"max\"])\n",
   "tests": "_d = pd.DataFrame({\"a\": [1, 5], \"b\": [\"x\", \"y\"], \"c\": [0.5, 2.5], \"d\": [True, False]})\n_n, _o = tur_ayir(_d)\nassert _n == [\"a\", \"c\"], \"Sayısal: \" + repr(_n)\nassert _o == [\"b\", \"d\"], \"Diğerleri: \" + repr(_o)\n_s = sayisal_ozet(_d)\nassert list(_s.columns) == [\"a\", \"c\"] and _s.loc[\"max\", \"c\"] == 2.5 and _s.loc[\"min\", \"a\"] == 1, repr(_s)\nassert tur_ayir(pd.DataFrame({\"t\": [1], \"u\": [\"k\"]})) == ([\"t\"], [\"u\"]), \"Sütun adlarına bağlı olmamalı\"\n",
   "hints": [
    "df.select_dtypes(include=\"number\")",
    "agg([\"min\", \"max\"])"
   ],
   "why": "Sütun adı yazmadan çalışan kod, yeni sütun gelince de doğru kalır. bool sayı sayılmaz.",
   "needs": [
    "pandas"
   ]
  },
  {
   "t": "code",
   "id": "pandas-temizlik-g2",
   "stage": "Kendin yaz",
   "diff": 2,
   "q": "<p><b>explode.</b> <code>kalem_tablosu(kayitlar)</code>: API'den gelen <code>{\"no\", \"urunler\": [...]}</code> kayıtlarını her ürün bir satır olacak biçimde aç. Sütun adı <code>urun</code> olsun. Boş listeli kayıt satır üretmesin. İndeks 0'dan başlasın.</p>",
   "start": "import pandas as pd\n\ndef kalem_tablosu(kayitlar):\n    pass\n",
   "sol": "import pandas as pd\n\ndef kalem_tablosu(kayitlar):\n    d = pd.DataFrame(kayitlar).explode(\"urunler\", ignore_index=True)\n    return d.dropna(subset=[\"urunler\"]).rename(columns={\"urunler\": \"urun\"}).reset_index(drop=True)\n",
   "tests": "_r = kalem_tablosu([{\"no\": 1, \"urunler\": [\"çay\", \"kek\"]}, {\"no\": 2, \"urunler\": []}, {\"no\": 3, \"urunler\": [\"kahve\"]}])\nassert list(_r.columns) == [\"no\", \"urun\"], \"Sütunlar: \" + repr(list(_r.columns))\nassert _r[\"no\"].tolist() == [1, 1, 3] and _r[\"urun\"].tolist() == [\"çay\", \"kek\", \"kahve\"], repr(_r.to_dict(\"list\"))\nassert list(_r.index) == [0, 1, 2], \"İndeks sıfırlanmalı\"\n",
   "hints": [
    "Boş liste explode sonrası NaN olur; dropna ile at.",
    "rename(columns={\"urunler\": \"urun\"})"
   ],
   "why": "explode satırları çoğaltır: sipariş düzeyinde bir tutar varsa artık birkaç kez sayılır. Bire çok birleştirmeyle aynı tuzak.",
   "needs": [
    "pandas"
   ]
  },
  {
   "t": "code",
   "id": "pandas-temizlik-g3",
   "stage": "Kendin yaz",
   "diff": 2,
   "q": "<p><b>pipe ve query, gerçek veri.</b> <code>tutar_ekle(d)</code>: kopya üzerinde <code>tutar = quantity × unit_price × (1 − discount)</code> eklesin. <code>buyuk_kalemler(esik)</code>: <code>anadolu_market</code> <code>order_items</code> tablosunu oku, <code>pipe</code> ile <code>tutar_ekle</code>'den geçir, <code>query</code> ile tutarı <code>esik</code>'ten büyük ve indirimli satırları al, <code>item_id</code> sıralı döndür.</p>",
   "start": "import pandas as pd\nimport veri\n\ndef tutar_ekle(d):\n    pass\n\ndef buyuk_kalemler(esik):\n    pass\n",
   "sol": "import pandas as pd\nimport veri\n\ndef tutar_ekle(d):\n    return d.assign(tutar=d[\"quantity\"] * d[\"unit_price\"] * (1 - d[\"discount\"]))\n\ndef buyuk_kalemler(esik):\n    d = veri.oku(\"anadolu_market\", \"order_items\")\n    return d.pipe(tutar_ekle).query(\"tutar > @esik and discount > 0\").sort_values(\"item_id\")\n",
   "tests": "_b = veri.oku(\"anadolu_market\", \"order_items\")\n_e = _b[\"quantity\"] * _b[\"unit_price\"] * (1 - _b[\"discount\"])\n_w = _b[(_e > 5000) & (_b[\"discount\"] > 0)][\"item_id\"].tolist()\n_r = buyuk_kalemler(5000)\nassert _r[\"item_id\"].tolist() == _w, f\"{len(_w)} satır beklenir: {len(_r)}\"\nassert \".pipe(\" in __kod__ and \".query(\" in __kod__, \"pipe ve query kullan\"\n_k = _b.head(); tutar_ekle(_k); assert \"tutar\" not in _k.columns, \"Girdiyi değiştirme\"\nassert buyuk_kalemler(10 ** 9).empty, \"Eşik dış değişkenden gelmeli\"\n",
   "hints": [
    "d.assign(tutar=...) kopya döndürür.",
    "query içinde dış değişken: \"tutar > @esik\""
   ],
   "why": "Temizlik adımlarını küçük fonksiyonlara bölüp pipe ile dizersen her biri ayrı test edilir.",
   "needs": [
    "pandas"
   ]
  }
 ]
},
{
 "id": "pandas-groupby",
 "min": 8,
 "html": "<h2>groupby.apply ve pd.Grouper</h2><p><code>agg</code> her gruptan tek değer üretir. Grup başına birkaç satır gerekiyorsa, örneğin her şehrin en büyük üç siparişi, <code>apply</code> kullanırsın; daha yavaştır, önce agg ya da transform dene. <code>include_groups=False</code> grup sütununu fonksiyona vermez; pandas 2.2 ve 3 için aynı sonucu verir. Zamanı dönemlere bölüp başka sütunla birlikte gruplamak için <code>pd.Grouper(key=\"tarih\", freq=\"MS\")</code> kullanılır; <code>MS</code> ay başı demektir.</p>",
 "ex": [
  {
   "t": "code",
   "id": "pandas-groupby-g1",
   "stage": "Kendin yaz",
   "diff": 2,
   "q": "<p><b>groupby.apply.</b> <code>en_buyuk_n(df, n)</code>: her <code>sehir</code> için <code>tutar</code>'ı en büyük <code>n</code> satırı döndürsün. Sonuçta <code>sehir</code> sütun olsun, indeks 0'dan başlasın. Şehirler artan, şehir içinde tutar azalan sırada.</p>",
   "start": "import pandas as pd\n\ndef en_buyuk_n(df, n):\n    pass\n",
   "sol": "import pandas as pd\n\ndef en_buyuk_n(df, n):\n    return df.groupby(\"sehir\").apply(lambda g: g.nlargest(n, \"tutar\"), include_groups=False).reset_index(level=0).reset_index(drop=True)\n",
   "tests": "_d = pd.DataFrame({\"sehir\": [\"Van\", \"İzmir\", \"Van\", \"İzmir\", \"Van\"], \"no\": [1, 2, 3, 4, 5], \"tutar\": [10, 40, 30, 20, 20]})\n_r = en_buyuk_n(_d, 2)\nassert \"sehir\" in _r.columns and list(_r.index) == list(range(4)), \"sehir sütun, indeks düz: \" + repr(_r)\nassert _r[[\"sehir\", \"no\"]].values.tolist() == [[\"Van\", 3], [\"Van\", 5], [\"İzmir\", 2], [\"İzmir\", 4]] or _r[[\"sehir\", \"no\"]].values.tolist() == [[\"İzmir\", 2], [\"İzmir\", 4], [\"Van\", 3], [\"Van\", 5]], repr(_r)\nassert len(en_buyuk_n(_d, 1)) == 2, \"n parametresi kullanılmalı\"\n",
   "hints": [
    "groupby(\"sehir\").apply(lambda g: g.nlargest(n, \"tutar\"), include_groups=False)",
    "Sonuç çok düzeyli indeks taşır: reset_index(level=0) sehir'i sütuna alır."
   ],
   "why": "apply her grubu ayrı DataFrame olarak verir, esnektir ama yavaştır. Büyük veride sort_values ve groupby.head(n) daha hızlıdır.",
   "needs": [
    "pandas"
   ]
  },
  {
   "t": "code",
   "id": "pandas-groupby-g2",
   "stage": "Kendin yaz",
   "diff": 2,
   "q": "<p><b>pd.Grouper.</b> <code>aylik_kanal()</code>: <code>anadolu_market</code> <code>orders</code> tablosunda her ay ve <code>channel</code> için sipariş sayısını versin. Sütunlar <code>order_date</code> (ay başı), <code>channel</code>, <code>adet</code>.</p>",
   "start": "import pandas as pd\nimport veri\n\ndef aylik_kanal():\n    pass\n",
   "sol": "import pandas as pd\nimport veri\n\ndef aylik_kanal():\n    d = veri.oku(\"anadolu_market\", \"orders\", parse_dates=[\"order_date\"])\n    return d.groupby([pd.Grouper(key=\"order_date\", freq=\"MS\"), \"channel\"]).size().rename(\"adet\").reset_index()\n",
   "tests": "_b = veri.oku(\"anadolu_market\", \"orders\", parse_dates=[\"order_date\"])\n_r = aylik_kanal()\nassert list(_r.columns) == [\"order_date\", \"channel\", \"adet\"], \"Sütunlar: \" + repr(list(_r.columns))\nassert _r[\"adet\"].sum() == len(_b), \"Toplam sipariş sayısı tutmalı\"\n_m = _b.assign(ay=_b[\"order_date\"].dt.strftime(\"%Y-%m-01\")).groupby([\"ay\", \"channel\"]).size().to_dict()\n_g = {(a.strftime(\"%Y-%m-%d\"), c): n for a, c, n in _r.values.tolist()}\nassert _g == _m, \"Ay ve kanal sayıları farklı\"\nassert \"Grouper\" in __kod__, \"pd.Grouper kullan\"\n",
   "hints": [
    "groupby([pd.Grouper(key=\"order_date\", freq=\"MS\"), \"channel\"])",
    ".size().rename(\"adet\").reset_index()"
   ],
   "why": "resample tek başına diğer sütunla gruplamaz; Grouper ikisini tek groupby içinde birleştirir.",
   "needs": [
    "pandas"
   ]
  }
 ]
}
);
})(window);
