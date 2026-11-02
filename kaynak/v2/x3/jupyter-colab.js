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
    ex: [{
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
      }],
    faq: [
      {
        q: 'Quarto mu, Jupyter Book mu, Streamlit mi?',
        a: 'Statik rapor ve belge için Quarto (tek dosya ya da web sitesi). Çok sayfalı dokümantasyon ya da kitap için Jupyter Book ya da Quarto Book. Kullanıcının filtre seçip etkileşimli inceleyeceği canlı pano için Streamlit/Dash (seaborn-plotly dersindeki panoya geçiş bölümü). Rapor "dondurulmuş" bir sonuçsa statik araç daha basit ve güvenlidir.'
      }
    ]
  }
);
})(window);
