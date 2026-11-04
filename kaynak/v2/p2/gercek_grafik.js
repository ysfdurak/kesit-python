/* Kesit Python: seaborn ve plotly. uretec/p2/gercek.py üretir, elle düzenleme. */
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
{
 "id": "seaborn-plotly",
 "min": 20,
 "html": "<h2>seaborn ve plotly'yi çalıştır</h2><p>İki kütüphane de tarayıcıda çalışır. İlk kullanımda inerler: seaborn yaklaşık 295 KB, plotly yaklaşık 9,7 MB. plotly büyüktür; mobil veride uzun sürebilir. <code>fig.show()</code> grafiği çıktının içinde etkileşimli gösterir, ayrıca 4,5 MB'lık bir çizim kitaplığını taşır.</p>\n<pre class=\"py\">import pandas as pd\nimport seaborn as sns\nimport matplotlib.pyplot as plt\n\nd = pd.DataFrame({\"sehir\": [\"Van\", \"İzmir\", \"Van\", \"İzmir\"], \"tutar\": [10, 40, 30, 20]})\nsns.barplot(data=d, x=\"sehir\", y=\"tutar\", estimator=\"sum\", errorbar=None)\nplt.show()</pre>\n<div class=\"tbl-wrap\"><table><tr><th>Soru</th><th>Grafik</th></tr><tr><td>Dağılım nasıl?</td><td><code>histplot</code>, <code>boxplot</code></td></tr><tr><td>Grup karşılaştırması</td><td><code>barplot</code>, <code>countplot</code></td></tr><tr><td>Zaman içinde</td><td><code>lineplot</code></td></tr><tr><td>İki sayı ilişkisi</td><td><code>scatterplot</code>, <code>regplot</code></td></tr><tr><td>Gruba göre küçük panolar</td><td><code>FacetGrid</code>, <code>catplot</code></td></tr><tr><td>Etkileşim gerekiyor</td><td>plotly</td></tr></table></div><div class=\"note\"><b>Çalışmayan</b>Streamlit ve Dash sunucu ister, burada çalışmaz. plotly'nin PNG kaydı (kaleido) da burada yoktur; HTML olarak kaydedersin.</div>",
 "ex": [
  {
   "t": "code",
   "id": "seaborn-plotly-g1",
   "stage": "Rehberli",
   "diff": 2,
   "q": "<p><b>Dağılım.</b> <code>dagilim(df)</code>: yan yana iki eksenli figür döndür. Soldaki <code>histplot</code> (<code>tutar</code>, 5 kutu, başlık <code>Tutar dağılımı</code>), sağdaki <code>boxplot</code> (<code>sehir</code>e göre <code>tutar</code>, başlık <code>Şehre göre tutar</code>).</p>",
   "start": "import matplotlib.pyplot as plt\nimport seaborn as sns\n\ndef dagilim(df):\n    pass\n",
   "sol": "import matplotlib.pyplot as plt\nimport seaborn as sns\n\ndef dagilim(df):\n    fig, (a, b) = plt.subplots(1, 2, figsize=(9, 3))\n    sns.histplot(data=df, x=\"tutar\", bins=5, ax=a)\n    sns.boxplot(data=df, x=\"sehir\", y=\"tutar\", ax=b)\n    a.set_title(\"Tutar dağılımı\")\n    b.set_title(\"Şehre göre tutar\")\n    return fig\n",
   "tests": "import pandas as _pd\n_df = _pd.DataFrame({\"gun\": [1, 2, 3, 4, 5, 6], \"sehir\": [\"Van\", \"İzmir\", \"Van\", \"İzmir\", \"Van\", \"İzmir\"], \"tutar\": [10, 40, 30, 20, 25, 35]})\n_f = dagilim(_df)\n_a, _b = _f.axes\nassert len(_a.patches) == 5, \"5 kutu: \" + str(len(_a.patches))\nassert _a.get_title() == \"Tutar dağılımı\" and _b.get_title() == \"Şehre göre tutar\", \"Başlıklar\"\nassert [t.get_text() for t in _b.get_xticklabels()] == [\"Van\", \"İzmir\"], \"x ekseninde şehirler\"\nassert _a.get_xlabel() == \"tutar\" and _b.get_ylabel() == \"tutar\", \"Sütunlar seaborn ile verilmeli\"\nassert \"seaborn\" in __source__ and \"sns.histplot\" in __kod__ and \"sns.boxplot\" in __kod__, \"seaborn kullan\"\nplt.close(\"all\")\n",
   "hints": [
    "ax=a ile hangi eksene çizeceğini söyle.",
    "sns.histplot(data=df, x=\"tutar\", bins=5, ax=a)"
   ],
   "why": "Kutu grafiği dağılımı ve aykırı değeri tek bakışta gösterir, ortalama bunu saklar.",
   "needs": [
    "pandas",
    "matplotlib"
   ]
  },
  {
   "t": "code",
   "id": "seaborn-plotly-g2",
   "stage": "Kendin yaz",
   "diff": 2,
   "q": "<p><b>Dört temel grafik.</b> <code>panel(df)</code>: 2×2 figür. Sol üst <code>countplot</code> (<code>sehir</code>). Sağ üst <code>barplot</code> (şehre göre <code>tutar</code> toplamı, hata çubuğu yok). Sol alt <code>lineplot</code> (<code>gun</code>, <code>tutar</code>). Sağ alt <code>scatterplot</code> (<code>gun</code>, <code>tutar</code>, renk <code>sehir</code>).</p>",
   "start": "import matplotlib.pyplot as plt\nimport seaborn as sns\n\ndef panel(df):\n    pass\n",
   "sol": "import matplotlib.pyplot as plt\nimport seaborn as sns\n\ndef panel(df):\n    fig, ax = plt.subplots(2, 2, figsize=(9, 6))\n    sns.countplot(data=df, x=\"sehir\", ax=ax[0, 0])\n    sns.barplot(data=df, x=\"sehir\", y=\"tutar\", estimator=\"sum\", errorbar=None, ax=ax[0, 1])\n    sns.lineplot(data=df, x=\"gun\", y=\"tutar\", errorbar=None, ax=ax[1, 0])\n    sns.scatterplot(data=df, x=\"gun\", y=\"tutar\", hue=\"sehir\", ax=ax[1, 1])\n    return fig\n",
   "tests": "import pandas as _pd\n_df = _pd.DataFrame({\"gun\": [1, 2, 3, 4, 5, 6], \"sehir\": [\"Van\", \"İzmir\", \"Van\", \"İzmir\", \"Van\", \"İzmir\"], \"tutar\": [10, 40, 30, 20, 25, 35]})\n_x = panel(_df).axes\nassert len(_x) == 4, \"Dört eksen\"\nassert sorted(round(p.get_height()) for p in _x[0].patches if p.get_height()) == [3, 3], \"countplot her şehir 3\"\nassert sorted(round(p.get_height()) for p in _x[1].patches if p.get_height()) == [65, 95], \"barplot toplam olmalı: estimator='sum'\"\nassert len(_x[1].lines) == 0, \"Hata çubuğu olmamalı: errorbar=None\"\nassert list(_x[2].lines[0].get_xdata()) == [1, 2, 3, 4, 5, 6], \"lineplot gun ekseninde\"\nassert len(_x[3].collections[0].get_offsets()) == 6 and _x[3].get_legend() is not None, \"scatterplot 6 nokta ve renk açıklaması\"\nplt.close(\"all\")\n",
   "hints": [
    "fig, ax = plt.subplots(2, 2); ax[0, 0] sol üst.",
    "estimator=\"sum\", errorbar=None"
   ],
   "why": "barplot varsayılan olarak ortalama çizer; \"toplam\" sanılıp yanlış okunur.",
   "needs": [
    "pandas",
    "matplotlib"
   ]
  },
  {
   "t": "code",
   "id": "seaborn-plotly-g3",
   "stage": "Meydan okuma",
   "diff": 3,
   "q": "<p><b>Çok panelli ve eğilim.</b> <code>yuzey(df)</code>: <code>sehir</code> başına panel açan <code>FacetGrid</code> döndürsün, her panele <code>scatterplot</code> (<code>gun</code>, <code>tutar</code>). <code>egilim(df)</code>: <code>regplot</code> ekseni döndürsün, güven bandı olmasın. <code>ciftler(df)</code>: <code>gun</code> ve <code>tutar</code> için <code>pairplot</code> döndürsün.</p>",
   "start": "import seaborn as sns\n\ndef yuzey(df):\n    pass\n\ndef egilim(df):\n    pass\n\ndef ciftler(df):\n    pass\n",
   "sol": "import seaborn as sns\n\ndef yuzey(df):\n    g = sns.FacetGrid(df, col=\"sehir\")\n    g.map_dataframe(sns.scatterplot, x=\"gun\", y=\"tutar\")\n    return g\n\ndef egilim(df):\n    return sns.regplot(data=df, x=\"gun\", y=\"tutar\", ci=None)\n\ndef ciftler(df):\n    return sns.pairplot(df[[\"gun\", \"tutar\"]])\n",
   "tests": "import pandas as _pd\n_df = _pd.DataFrame({\"gun\": [1, 2, 3, 4, 5, 6], \"sehir\": [\"Van\", \"İzmir\", \"Van\", \"İzmir\", \"Van\", \"İzmir\"], \"tutar\": [10, 40, 30, 20, 25, 35]})\nimport matplotlib.pyplot as _plt\n_g = yuzey(_df)\nassert len(_g.axes.flat) == 2, \"İki panel\"\nassert all(len(a.collections[0].get_offsets()) == 3 for a in _g.axes.flat), \"Her panelde 3 nokta\"\n_plt.close(\"all\")\n_e = egilim(_df)\nassert len(_e.lines) == 1 and len(_e.collections) == 1, \"Tek eğilim çizgisi, güven bandı yok: ci=None\"\n_plt.close(\"all\")\n_c = ciftler(_df)\nassert _c.axes.shape == (2, 2), \"2x2 ızgara\"\n_plt.close(\"all\")\n",
   "hints": [
    "g.map_dataframe(sns.scatterplot, x=\"gun\", y=\"tutar\")",
    "sns.regplot(..., ci=None)",
    "df[[\"gun\", \"tutar\"]]"
   ],
   "why": "Küçük panolar aynı ölçekle grupları karşılaştırır. pairplot büyük veride yavaştır, önce örnekle.",
   "needs": [
    "pandas",
    "matplotlib"
   ]
  },
  {
   "t": "code",
   "id": "seaborn-plotly-g4",
   "stage": "Kendin yaz",
   "diff": 2,
   "q": "<p><b>plotly express.</b> <code>grafikler(df)</code>: üç figürlü sözlük döndür. <code>cizgi</code>: <code>px.line</code> (<code>gun</code>, <code>tutar</code>, renk <code>sehir</code>). <code>cubuk</code>: <code>px.bar</code> (<code>sehir</code>, <code>tutar</code>). <code>nokta</code>: <code>px.scatter</code> (<code>gun</code>, <code>tutar</code>, üzerine gelince <code>sehir</code>). Hepsinde başlık olsun. İlk kullanımda plotly iner (yaklaşık 9,7 MB).</p>",
   "start": "import plotly.express as px\n\ndef grafikler(df):\n    pass\n",
   "sol": "import plotly.express as px\n\ndef grafikler(df):\n    return {\"cizgi\": px.line(df, x=\"gun\", y=\"tutar\", color=\"sehir\", title=\"Günlük tutar\"),\n            \"cubuk\": px.bar(df, x=\"sehir\", y=\"tutar\", title=\"Şehre göre tutar\"),\n            \"nokta\": px.scatter(df, x=\"gun\", y=\"tutar\", hover_data=[\"sehir\"], title=\"Tutar\")}\n",
   "tests": "import pandas as _pd\n_df = _pd.DataFrame({\"gun\": [1, 2, 3, 4, 5, 6], \"sehir\": [\"Van\", \"İzmir\", \"Van\", \"İzmir\", \"Van\", \"İzmir\"], \"tutar\": [10, 40, 30, 20, 25, 35]})\n_g = grafikler(_df)\nassert set(_g) == {\"cizgi\", \"cubuk\", \"nokta\"}, \"Anahtarlar: \" + repr(sorted(_g))\nassert len(_g[\"cizgi\"].data) == 2 and _g[\"cizgi\"].data[0].type == \"scatter\" and _g[\"cizgi\"].data[0].mode == \"lines\", \"Şehir başına birer çizgi\"\nassert _g[\"cubuk\"].data[0].type == \"bar\" and list(_g[\"cubuk\"].data[0].x) == list(_df[\"sehir\"]), \"Çubuk şehir ekseninde\"\nassert _g[\"nokta\"].data[0].mode == \"markers\" and \"sehir\" in _g[\"nokta\"].data[0].hovertemplate, \"Üzerine gelince sehir görünmeli\"\nassert all(f.layout.title.text for f in _g.values()), \"Başlıklar eksik\"\n",
   "hints": [
    "px.line(df, x=\"gun\", y=\"tutar\", color=\"sehir\", title=\"...\")",
    "hover_data=[\"sehir\"]"
   ],
   "why": "plotly figürü aslında veri ve ayar taşıyan bir sözlüktür; test de onu okuyor. Kendi kodunda fig.show() yazarsan grafiği görürsün.",
   "needs": [
    "pandas"
   ]
  },
  {
   "t": "code",
   "id": "seaborn-plotly-g5",
   "stage": "Kendin yaz",
   "diff": 2,
   "q": "<p><b>go.Figure ve HTML.</b> <code>elle_figur(df, yol)</code>: <code>go.Figure</code> kur, <code>go.Bar</code> ekle (<code>sehir</code>, <code>tutar</code>, ad <code>Tutar</code>, üzerine gelince <code>Van: 10 TL</code> gibi: <code>hovertemplate</code>). Başlık <code>Tutar</code>, y ekseni <code>TL</code>. <code>write_html</code> ile dosyaya yaz (<code>include_plotlyjs=True</code>), figürü döndür. Dosya internetsiz açılır.</p>",
   "start": "import plotly.graph_objects as go\n\ndef elle_figur(df, yol):\n    pass\n",
   "sol": "import plotly.graph_objects as go\n\ndef elle_figur(df, yol):\n    f = go.Figure()\n    f.add_trace(go.Bar(x=df[\"sehir\"], y=df[\"tutar\"], name=\"Tutar\", hovertemplate=\"%{x}: %{y} TL<extra></extra>\"))\n    f.update_layout(title=\"Tutar\", yaxis_title=\"TL\")\n    f.write_html(yol, include_plotlyjs=True)\n    return f\n",
   "tests": "import pandas as _pd\n_df = _pd.DataFrame({\"gun\": [1, 2, 3, 4, 5, 6], \"sehir\": [\"Van\", \"İzmir\", \"Van\", \"İzmir\", \"Van\", \"İzmir\"], \"tutar\": [10, 40, 30, 20, 25, 35]})\nimport tempfile, os\n_y = os.path.join(tempfile.mkdtemp(), \"g.html\")\n_f = elle_figur(_df, _y)\nassert isinstance(_f, go.Figure), \"go.Figure döndür\"\nassert _f.data[0].type == \"bar\" and _f.data[0].name == \"Tutar\", \"Bar izi\"\nassert \"%{x}\" in _f.data[0].hovertemplate and \"TL\" in _f.data[0].hovertemplate, \"hovertemplate\"\nassert _f.layout.title.text == \"Tutar\" and _f.layout.yaxis.title.text == \"TL\", \"Başlıklar\"\nassert os.path.getsize(_y) > 1000000, \"Tek dosya olmalı: include_plotlyjs=True\"\nassert \"Plotly.newPlot\" in open(_y, encoding=\"utf-8\").read(), \"Geçerli plotly HTML'i değil\"\n",
   "hints": [
    "f.add_trace(go.Bar(...))",
    "f.update_layout(title=\"Tutar\", yaxis_title=\"TL\")"
   ],
   "why": "Tek dosyalık HTML e-postayla gönderilir, Excel eki gibi açılır; sunucu gerekmez.",
   "needs": [
    "pandas"
   ]
  }
 ]
}
);
})(window);
