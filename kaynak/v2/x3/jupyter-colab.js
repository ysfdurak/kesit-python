/* Kesit Python — 'jupyter-colab' uzantısı (AUDIT 12, Derinleş + ek alıştırmalar) */
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
  {
    id: 'jupyter-colab',
    min: 25,
    needs: ['sqlite3'],
    html: `<p>Derste notebook'u <code>.py</code>'ye ve tek bir HTML'e çevirmeyi, papermill'in ne yaptığını gördün. Bu bölüm o adımları bir <b>rapor hattına</b> dönüştürüyor: kodu gizlenmiş, okunur bir HTML rapor; Quarto ile yayın kalitesinde belge; papermill ile her şehir için ayrı rapor üreten tek bir şablon notebook. Örnek, Anadolu Market'in gerçek sipariş verisinden şehir raporu.</p>
<h2>nbconvert ile yöneticiye uygun HTML</h2>
<p>Yönetici kodu değil sonuçları görmek ister. nbconvert, hücreleri <b>etiketlere</b> (tags) göre süzebilir: JupyterLab'de sağ paneldeki "Property Inspector"dan hücreye <code>remove_input</code> (kodu gizle, çıktıyı göster) ya da <code>remove_cell</code> (tümünü gizle) etiketi verirsin.</p>
<pre class="code">jupyter nbconvert rapor.ipynb --to html --no-input                     # tüm kodları gizle
jupyter nbconvert rapor.ipynb --to html --execute \\
    --TagRemovePreprocessor.remove_input_tags remove_input \\
    --TagRemovePreprocessor.remove_cell_tags remove_cell               # etikete göre
jupyter nbconvert rapor.ipynb --to webpdf --no-input                    # PDF (pip install "nbconvert[webpdf]")</pre>
<p><code>--execute</code> raporu çevirmeden önce notebook'u baştan çalıştırır; böylece HTML'deki sayıların gerçekten o koddan çıktığı garanti olur. Grafikler HTML'in içine gömülür, dosyayı e-postayla göndermek yeter.</p>
<h2>Quarto: notebook'tan belgeye</h2>
<p>Quarto, notebook'ları ve <code>.qmd</code> (Markdown + kod) dosyalarını HTML, PDF, Word ve sunuma çeviren açık kaynaklı bir yayın aracıdır. Ayarlar en baştaki YAML başlığında durur; hücre seçenekleri <code>#|</code> ile başlayan yorumlardır.</p>
<pre class="code">---
title: "İzmir satış raporu"
author: "Analiz ekibi"
format:
  html:
    code-fold: true          # kodu katlanabilir yap
    toc: true
    embed-resources: true    # tek dosya
execute:
  echo: false                # varsayılan: kodu gösterme
---

&#96;&#96;&#96;{python}
#| tags: [parameters]
sehir = "İzmir"
&#96;&#96;&#96;

&#96;&#96;&#96;{python}
#| label: fig-ciro
#| fig-cap: "Yıllara göre teslim edilen ciro"
grafik_ciz(sehir)
&#96;&#96;&#96;</pre>
<pre class="code">quarto render rapor.qmd                              # HTML
quarto render rapor.ipynb --to pdf                   # notebook da doğrudan çevrilir
quarto render rapor.qmd -P sehir:Ankara --output ankara.html   # parametreyle</pre>
<h2>papermill: tek şablon, çok rapor</h2>
<p>papermill, <code>parameters</code> etiketli hücrenin <b>hemen altına</b> "injected-parameters" adlı yeni bir hücre ekleyerek değerleri ezer; şablon notebook'taki varsayılanlar bozulmaz. Çalışan her kopya çıktılarıyla birlikte kaydedilir, böylece hangi raporun hangi parametreyle üretildiği iz bırakır.</p>
<pre class="code">import papermill as pm
for sehir in ["İstanbul", "İzmir", "Ankara"]:
    cikti = f"raporlar/{sehir}.ipynb"
    pm.execute_notebook("sablon.ipynb", cikti, parameters={"sehir": sehir, "yil": 2024})
    # ardından: jupyter nbconvert cikti --to html --no-input</pre>
<p>Şablonun kalbi, parametreye göre çalışan sıradan bir fonksiyondur. Aynı mantığı tarayıcıda çalıştırabilirsin:</p>
<pre class="py">import veri
conn = veri.baglan("anadolu_market", tablolar=["orders", "order_items", "customers"])

def sehir_raporu(sehir):
    sorgu = """
        SELECT substr(o.order_date, 1, 4) AS yil, COUNT(DISTINCT o.order_id),
               ROUND(SUM(oi.quantity * oi.unit_price * (1 - oi.discount)), 2)
        FROM orders o JOIN customers c USING (customer_id) JOIN order_items oi USING (order_id)
        WHERE o.status = 'delivered' AND c.city = ?
        GROUP BY yil ORDER BY yil"""
    return conn.execute(sorgu, (sehir,)).fetchall()

for sehir in ["İzmir", "Ankara"]:          # papermill döngüsünün karşılığı
    print(sehir, sehir_raporu(sehir))</pre>
<div class="tbl-wrap"><table><tr><th>Araç</th><th>Güçlü yanı</th><th>Ne zaman?</th></tr>
<tr><td>nbconvert</td><td>Jupyter ile gelir, hızlı, etiketle süzme</td><td>Ekibe hızlı HTML/PDF</td></tr>
<tr><td>Quarto</td><td>Yayın kalitesi, çapraz referans, web sitesi ve sunum</td><td>Müşteriye rapor, blog, portföy sitesi</td></tr>
<tr><td>papermill</td><td>Parametreli toplu çalıştırma, iz bırakır</td><td>Her şehir/ay için aynı rapor; zamanlanmış raporlar</td></tr></table></div>
<div class="note"><b>Kendi bilgisayarında dene</b><code>pip install nbconvert papermill</code>; Quarto'yu quarto.org'dan kur (Python paketi değil, ayrı bir programdır), sonra <code>quarto check</code>. Tarayıcıda bu araçlar yok; aşağıdaki alıştırmalar notebook JSON'u üzerinde aynı işleri yapıyor.</div>
<div class="note"><b>Gerçek işte</b>Analiz ekiplerinde "her ay başı 12 bölge müdürüne kendi raporu" işi tam olarak papermill + nbconvert (ya da Quarto) ile otomatikleştirilir ve orkestrasyon dersindeki zamanlayıcıya bağlanır. Portföyünde böyle bir hat göstermek, analiz yapabilmenin ötesinde analizi ürünleştirebildiğini kanıtlar.</div>`,
    ex: [
      {
        t: 'mc',
        id: 'jupyter-colab-y1',
        stage: 'Isınma',
        q: 'Yöneticiye gönderilecek HTML raporda kod hücreleri görünmesin ama grafikler ve tablolar kalsın. Hangisi?',
        o: ['<code>jupyter nbconvert --to script</code>', '<code>jupyter nbconvert --to html --no-input</code>', '<code>jupyter nbconvert --clear-output</code>', '<code>jupyter nbconvert --to markdown</code>'],
        a: 1,
        why: '--no-input kod girdilerini gizler, çıktıları bırakır. --to script yalnız kodu .py\'ye çıkarır; --clear-output tam tersine çıktıları siler; markdown çıktısı kodu da içerir.'
      },
      {
        t: 'mc',
        id: 'jupyter-colab-y2',
        stage: 'Isınma',
        q: 'papermill şablon notebook\'a <code>parameters={"sehir": "Ankara"}</code> verdiğinde ne olur?',
        o: [
          'parameters hücresinin metni değiştirilir ve şablonun üzerine kaydedilir',
          'Altına yeni hücre eklenir, değerler orada ezilir; çıktı ayrı kaydedilir',
          'Tüm hücrelerdeki "sehir" kelimeleri metin olarak Ankara ile değiştirilir',
          'Çekirdekte SEHIR=Ankara ortam değişkeni ayarlanır ve kod onu okur'
        ],
        a: 1,
        why: 'papermill "injected-parameters" hücresini parameters hücresinin hemen ardına ekler; Python sırayla çalıştığı için yeni değer varsayılanı ezer. Şablon değişmez, her çalıştırma ayrı bir çıktı notebook\'u olur.'
      },
      {
        t: 'predict',
        id: 'jupyter-colab-y3',
        stage: 'Kodu oku',
        needs: ['sqlite3'],
        q: 'Gerçek Anadolu Market verisi: bu kod ne yazdırır?',
        o: ['[(\'İzmir\', 84), (\'Ankara\', 61)]', '[(\'Ankara\', 61), (\'İzmir\', 84)]', '[(\'İzmir\', 162), (\'Ankara\', 61)]', '[(\'İzmir\', 84)]'],
        a: 0,
        code: 'import veri\nc = veri.baglan("anadolu_market", tablolar=["orders", "order_items", "customers"])\nr = c.execute("""SELECT c.city, COUNT(DISTINCT o.order_id) FROM orders o\n  JOIN customers c USING (customer_id) JOIN order_items oi USING (order_id)\n  WHERE o.status = \'delivered\' AND c.city IN (\'İzmir\', \'Ankara\') GROUP BY c.city ORDER BY 2 DESC""").fetchall()\nprint(r)\n',
        why: 'Teslim edilmiş (delivered) siparişler müşteri şehrine göre sayılır; JOIN order_items her kalem için satır ürettiği için DISTINCT olmadan sayı şişerdi. ORDER BY 2 DESC sayıya göre azalan sıralar: İzmir 84, Ankara 61.'
      },
      {
        t: 'order',
        id: 'jupyter-colab-y4',
        stage: 'Kodu oku',
        q: '<p>remove_input etiketli hücrelerin kodunu gizleyen (nbconvert TagRemovePreprocessor benzeri) programın satırlarını sırala. Beklenen çıktı:</p><pre class="out">[\'\', \'print(2)\']</pre>',
        lines: [
          'nb = {"cells": [{"cell_type": "code", "metadata": {"tags": ["remove_input"]}, "source": "print(1)"},',
          '                {"cell_type": "code", "metadata": {}, "source": "print(2)"}]}',
          'for h in nb["cells"]:',
          '    if "remove_input" in h["metadata"].get("tags", []):',
          '        h["source"] = ""',
          'print([h["source"] for h in nb["cells"]])'
        ],
        expect: '[\'\', \'print(2)\']\n',
        hint: 'Sözlük iki satıra bölünmüş; önce tamamlanmalı.',
        why: 'Etiketler hücre metadata\'sının tags listesindedir; metadata\'sı boş hücrede tags yoktur, bu yüzden get(..., []) gerekir. Gerçek nbconvert girdi alanını gizler ama çıktıları korur.'
      },
      {
        t: 'code',
        id: 'jupyter-colab-y5',
        stage: 'Rehberli',
        diff: 2,
        q: '<p>papermill\'in parametre enjeksiyonunu yaz: <code>parametre_enjekte(nb, parametreler)</code>, notebook sözlüğünün <b>kopyasını</b> döndürsün. <code>parameters</code> etiketli ilk kod hücresinin hemen ardına <code>{"cell_type": "code", "metadata": {"tags": ["injected-parameters"]}, "source": ..., "outputs": [], "execution_count": None}</code> hücresi ekle. Kaynak, her parametre için bir satır: <code>ad = repr(deger)</code>, satırlar <code>\n</code> ile birleşik. Etiketli hücre yoksa yeni hücreyi en başa koy. Önceki bir çalıştırmadan kalmış <code>injected-parameters</code> hücresi varsa önce onu sil.</p>',
        guide: [
          'copy.deepcopy ile kopya al; orijinal değişmesin.',
          'Önce eski injected-parameters hücrelerini listeden çıkar.',
          'parameters etiketli ilk kod hücresinin indeksini bul (yoksa -1).',
          'Yeni hücreyi indeks + 1 konumuna insert et.'
        ],
        example: 'hucreler = ["a", "b", "c"]\ni = hucreler.index("b")\nhucreler.insert(i + 1, "yeni")\nprint(hucreler, repr("İzmir"), repr(2024))\n',
        start: 'import copy\n\ndef parametre_enjekte(nb, parametreler):\n    nb = copy.deepcopy(nb)\n    hucreler = nb["cells"]\n    # TODO: eski injected-parameters hücrelerini at\n    # TODO: parameters etiketli hücrenin indeksini bul\n    # TODO: yeni hücreyi ekle\n    return nb\n',
        sol: 'import copy\n\ndef parametre_enjekte(nb, parametreler):\n    nb = copy.deepcopy(nb)\n    etiket = lambda h: h.get("metadata", {}).get("tags", [])\n    hucreler = [h for h in nb["cells"] if "injected-parameters" not in etiket(h)]\n    konum = -1\n    for i, h in enumerate(hucreler):\n        if h["cell_type"] == "code" and "parameters" in etiket(h):\n            konum = i\n            break\n    kaynak = "\\n".join(f"{ad} = {deger!r}" for ad, deger in parametreler.items())\n    hucreler.insert(konum + 1, {"cell_type": "code", "metadata": {"tags": ["injected-parameters"]},\n                                "source": kaynak, "outputs": [], "execution_count": None})\n    nb["cells"] = hucreler\n    return nb\n',
        tests: 'NB = {"cells": [{"cell_type": "markdown", "metadata": {}, "source": "# Rapor"},\n                {"cell_type": "code", "metadata": {"tags": ["parameters"]}, "source": "sehir = \'İstanbul\'\\nyil = 2023"},\n                {"cell_type": "code", "metadata": {}, "source": "print(sehir, yil)"}]}\nyeni = parametre_enjekte(NB, {"sehir": "İzmir", "yil": 2024})\nassert len(NB["cells"]) == 3, "Orijinal notebook değişmemeli"\nassert yeni["cells"][2]["source"] == "sehir = \'İzmir\'\\nyil = 2024", f"Enjekte kaynağı: {yeni[\'cells\'][2][\'source\']!r}"\nassert yeni["cells"][2]["metadata"]["tags"] == ["injected-parameters"], "Etiket"\nns = {}\nfor h in yeni["cells"]:\n    if h["cell_type"] == "code" and "print" not in h["source"]:\n        exec(h["source"], ns)\nassert ns["sehir"] == "İzmir" and ns["yil"] == 2024, "Sırayla çalışınca yeni değerler varsayılanı ezmeli"\niki = parametre_enjekte(yeni, {"sehir": "Ankara"})\nassert sum("injected-parameters" in h["metadata"].get("tags", []) for h in iki["cells"]) == 1, "Eski enjekte hücre silinmeli"\nbas = parametre_enjekte({"cells": [{"cell_type": "code", "metadata": {}, "source": "x"}]}, {"a": 1})\nassert bas["cells"][0]["source"] == "a = 1", "parameters hücresi yoksa en başa"\n',
        hints: ['repr("İzmir") tırnaklı metin üretir; kod olarak geçerlidir.', 'Konum yoksa -1 kullan: -1 + 1 = 0, en baş.', 'Etiketi okurken h.get("metadata", {}).get("tags", []) güvenli yazımdır.'],
        why: 'papermill tam olarak böyle çalışır: şablonun varsayılanları korunur, yeni hücre onları ezer ve çıktı notebook\'unda hangi parametreyle çalışıldığı görünür kalır. Bu iz, "bu rapor hangi verilerle üretildi?" sorusunun cevabıdır.'
      },
      {
        t: 'code',
        id: 'jupyter-colab-y6',
        stage: 'Kendin yaz',
        diff: 2,
        q: '<p>Quarto başlığını oku: <code>quarto_basligi(qmd_metni)</code> yaz. Metin <code>---</code> satırıyla başlıyorsa, ikinci <code>---</code> satırına kadar olan YAML\'ı <code>yaml.safe_load</code> ile oku. Döndür: <code>{"baslik": title, "bicimler": format anahtarlarının sıralı listesi, "kod_goster": ...}</code>. <code>format</code> metin (<code>format: pdf</code>) ya da sözlük olabilir. <code>kod_goster</code>: <code>execute.echo</code> varsa onun değeri, yoksa <code>True</code>. Başlık yoksa <code>None</code> döndür.</p>',
        start: 'import yaml\n\ndef quarto_basligi(qmd_metni):\n    pass\n',
        sol: 'import yaml\n\ndef quarto_basligi(qmd_metni):\n    satirlar = qmd_metni.splitlines()\n    if not satirlar or satirlar[0].strip() != "---":\n        return None\n    try:\n        son = next(i for i in range(1, len(satirlar)) if satirlar[i].strip() == "---")\n    except StopIteration:\n        return None\n    y = yaml.safe_load("\\n".join(satirlar[1:son])) or {}\n    fmt = y.get("format", [])\n    bicimler = sorted(fmt) if isinstance(fmt, dict) else ([fmt] if fmt else [])\n    return {"baslik": y.get("title"), "bicimler": bicimler,\n            "kod_goster": y.get("execute", {}).get("echo", True)}\n',
        tests: 'Q = """---\ntitle: "İzmir satış raporu"\nformat:\n  html:\n    code-fold: true\n  pdf: default\nexecute:\n  echo: false\n---\n\n## Özet\n"""\nassert quarto_basligi(Q) == {"baslik": "İzmir satış raporu", "bicimler": ["html", "pdf"], "kod_goster": False}, f"Gelen: {quarto_basligi(Q)}"\nassert quarto_basligi("---\\ntitle: Kısa\\nformat: docx\\n---\\nmetin") == {"baslik": "Kısa", "bicimler": ["docx"], "kod_goster": True}, "Metin format ve varsayılan echo"\nassert quarto_basligi("# Başlıksız") is None, "YAML başlığı yoksa None"\nassert quarto_basligi("---\\ntitle: kapanmamış\\n") is None, "Kapanmayan başlık None"\n',
        hints: [
          'İkinci --- satırının indeksini next(...) ile bul; yoksa StopIteration.',
          'format bir dict ise anahtarlarını, metinse tek elemanlı liste kullan.',
          'İç içe isteğe bağlı alan: y.get("execute", {}).get("echo", True).'
        ],
        why: 'Rapor hattında belgeyi çevirmeden önce başlığı denetlemek (doğru format, kodlar gizli mi, başlık var mı) yöneticiye kodlu rapor gitmesi gibi utandırıcı hataları önler. Quarto da ayarları bu YAML\'dan okur.'
      },
      {
        t: 'code',
        id: 'jupyter-colab-y7',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 2,
        needs: ['sqlite3'],
        q: '<p>Hatayı bul ve düzelt. Şablon notebook\'taki <code>sehir_ozeti(conn, sehir)</code> bir şehrin teslim edilen (<code>delivered</code>) sipariş sayısını ve cirosunu (<code>quantity * unit_price * (1 - discount)</code>, 2 ondalık) döndürmeli. Rapor İzmir için sipariş sayısını 84 yerine yüzlerce gösteriyor; ayrıca şehir adı SQL\'e f-string ile gömüldüğü için papermill parametresine tırnaklı bir şehir adı verilince sorgu bozuluyor.</p>',
        start: 'def sehir_ozeti(conn, sehir):\n    sorgu = f"""SELECT COUNT(o.order_id), ROUND(SUM(oi.quantity * oi.unit_price * (1 - oi.discount)), 2)\n        FROM orders o JOIN customers c USING (customer_id) JOIN order_items oi USING (order_id)\n        WHERE o.status = \'delivered\' AND c.city = \'{sehir}\'"""\n    return conn.execute(sorgu).fetchone()\n',
        sol: 'def sehir_ozeti(conn, sehir):\n    sorgu = """SELECT COUNT(DISTINCT o.order_id), ROUND(SUM(oi.quantity * oi.unit_price * (1 - oi.discount)), 2)\n        FROM orders o JOIN customers c USING (customer_id) JOIN order_items oi USING (order_id)\n        WHERE o.status = \'delivered\' AND c.city = ?"""\n    return conn.execute(sorgu, (sehir,)).fetchone()\n',
        tests: 'import veri\nc = veri.baglan("anadolu_market", tablolar=["orders", "order_items", "customers"])\nassert sehir_ozeti(c, "İzmir") == (84, 130451.15), f"İzmir: 84 sipariş, 130451.15 TL; gelen {sehir_ozeti(c, \'İzmir\')}"\nassert sehir_ozeti(c, "Ankara") == (61, 96956.15), "Ankara: 61 sipariş"\nassert sehir_ozeti(c, "Kırşehir\' OR \'1\'=\'1")[0] == 0, "Tırnaklı parametre sorguyu bozmamalı ve hiçbir satır dönmemeli"\n',
        hints: ['Kalem tablosuyla JOIN sipariş başına birden çok satır üretir.', 'COUNT(DISTINCT o.order_id) sipariş sayısını düzeltir; ciro toplamı kalem bazında doğrudur.', 'Şehri ? parametresiyle ver.'],
        why: 'JOIN sonrası sayım şişmesi raporlarda en sık hatadır: kalem tablosuna bağlanınca her sipariş kalem sayısı kadar tekrar eder. Parametreli şablonlarda değerleri SQL\'e gömmek de hem enjeksiyona hem tırnak hatalarına kapı açar.'
      },
      {
        t: 'code',
        id: 'jupyter-colab-y8',
        stage: 'Meydan okuma',
        diff: 3,
        needs: ['sqlite3'],
        q: '<p>papermill + nbconvert hattının sonucunu tek bir HTML özet sayfası olarak üret: <code>ozet_sayfasi(conn, sehirler)</code>. Her şehir için teslim edilen sipariş sayısı ve ciroyu (önceki görevdeki tanımla) hesapla; ciroya göre azalan sırala. Çıktı HTML metni: <code>&lt;h1&gt;Şehir raporları&lt;/h1&gt;</code> ve ardından bir <code>&lt;table&gt;</code>; başlık satırı <code>&lt;tr&gt;&lt;th&gt;Şehir&lt;/th&gt;&lt;th&gt;Sipariş&lt;/th&gt;&lt;th&gt;Ciro&lt;/th&gt;&lt;/tr&gt;</code>, her şehir için <code>&lt;tr&gt;&lt;td&gt;&lt;a href="raporlar/&lt;dosya&gt;.html"&gt;&lt;Şehir&gt;&lt;/a&gt;&lt;/td&gt;&lt;td&gt;n&lt;/td&gt;&lt;td&gt;ciro&lt;/td&gt;&lt;/tr&gt;</code>. Dosya adı: şehir adının küçük harfli ASCII hâli (<code>İ→i, ı→i, ş→s, ğ→g, ü→u, ö→o, ç→c</code>, boşluk → <code>-</code>, <code>a-z</code>, rakam ve <code>-</code> dışındaki karakterler atılır). Ciroyu Türkçe biçimde yaz: <code>130.451,15</code>. Şehir adını HTML\'e kaçışlı yaz (<code>html.escape</code>). Satırlar arasında ayırıcı yok.</p>',
        start: 'import html\n\ndef ozet_sayfasi(conn, sehirler):\n    return ""\n',
        sol: 'import html, re\n\nCEVIR = str.maketrans({"İ": "i", "I": "i", "ı": "i", "ş": "s", "Ş": "s", "ğ": "g", "Ğ": "g", "ü": "u", "Ü": "u", "ö": "o", "Ö": "o", "ç": "c", "Ç": "c", " ": "-"})\n\ndef _dosya(sehir):\n    return re.sub(r"[^a-z0-9-]", "", sehir.translate(CEVIR).lower())\n\ndef _tl(x):\n    return f"{x:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")\n\ndef ozet_sayfasi(conn, sehirler):\n    sorgu = """SELECT COUNT(DISTINCT o.order_id), COALESCE(ROUND(SUM(oi.quantity * oi.unit_price * (1 - oi.discount)), 2), 0)\n        FROM orders o JOIN customers c USING (customer_id) JOIN order_items oi USING (order_id)\n        WHERE o.status = \'delivered\' AND c.city = ?"""\n    satirlar = [(s, *conn.execute(sorgu, (s,)).fetchone()) for s in sehirler]\n    satirlar.sort(key=lambda r: -r[2])\n    govde = "".join(f\'<tr><td><a href="raporlar/{_dosya(s)}.html">{html.escape(s)}</a></td><td>{n}</td><td>{_tl(c)}</td></tr>\' for s, n, c in satirlar)\n    return "<h1>Şehir raporları</h1><table><tr><th>Şehir</th><th>Sipariş</th><th>Ciro</th></tr>" + govde + "</table>"\n',
        tests: 'import veri\nc = veri.baglan("anadolu_market", tablolar=["orders", "order_items", "customers"])\nh = ozet_sayfasi(c, ["Ankara", "İzmir", "İstanbul"])\nassert h.startswith("<h1>Şehir raporları</h1><table><tr><th>Şehir</th>"), "Başlık ve tablo başı"\nassert \'<tr><td><a href="raporlar/istanbul.html">İstanbul</a></td><td>162</td><td>199.387,25</td></tr>\' in h, "İstanbul satırı (ciro Türkçe biçim)"\nassert h.index("istanbul.html") < h.index("izmir.html") < h.index("ankara.html"), "Ciroya göre azalan sıra"\nassert h.endswith("</table>"), "Tablo kapanmalı"\nx = ozet_sayfasi(c, ["Şanlı <Urfa>"])\nassert \'href="raporlar/sanli-urfa.html"\' in x and "&lt;Urfa&gt;" in x and "<td>0</td><td>0,00</td>" in x, "Şehir adı kaçışlanmalı; verisi olmayan şehir 0 göstermeli"\n',
        hints: [
          'str.maketrans ile Türkçe karakter tablosu kur; translate sonra lower.',
          'Türkçe sayı: f"{x:,.2f}" sonra virgül ve noktayı geçici bir karakterle yer değiştir.',
          'Verisi olmayan şehirde SUM NULL döner: COALESCE(..., 0).'
        ],
        why: 'Rapor hattının son halkası, üretilen raporlara giden bir dizin sayfasıdır. Dosya adlarını ASCII\'ye çevirmek (web sunucuları ve e-posta ekleri için güvenli), metni kaçışlamak ve sayıyı okuyucunun yerel biçiminde yazmak küçük ama profesyonel dokunuşlardır.'
      }
    ],
    faq: [
      {
        q: 'Quarto mu, Jupyter Book mu, Streamlit mi?',
        a: 'Statik rapor ve belge için Quarto (tek dosya ya da web sitesi). Çok sayfalı dokümantasyon ya da kitap için Jupyter Book ya da Quarto Book. Kullanıcının filtre seçip etkileşimli inceleyeceği canlı pano için Streamlit/Dash (seaborn-plotly dersindeki panoya geçiş bölümü). Rapor "dondurulmuş" bir sonuçsa statik araç daha basit ve güvenlidir.'
      }
    ]
  }
);
})(window);
