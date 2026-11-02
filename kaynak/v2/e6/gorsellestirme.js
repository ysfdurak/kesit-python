/* Kesit Python — 'gorsellestirme' dersi uzantısı (Derinleş) */
// needs: matplotlib, numpy
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
  {
    id: 'gorsellestirme',
    min: 30,
    needs: ['matplotlib', 'numpy'],
    html: `<h2>Derinleş: kurulum, çoklu grafik, vurgu ve rapora gömme</h2><p>Tek bir çizgi, çubuk ya da histogram çizebiliyorsun. Gerçek bir yönetim raporunda ise daha fazlası istenir: aynı figürde birden çok grafik, iki farklı birimi (TL ve adet) aynı grafikte göstermek, hedef çizgisi ve not eklemek, eksende "1.250.000 TL" gibi Türkçe sayı biçimi, yığılmış çubuk ve grafiği bir HTML rapora gömmek. Bu bölüm bunları tamamlıyor. İstatistiksel grafikler (seaborn) ve etkileşimli grafikler (plotly) "İleri görselleştirme" dersinde.</p><h3>Kurulum ve arka uç (backend)</h3><pre class="code">python -m pip install matplotlib
python -c "import matplotlib; print(matplotlib.__version__, matplotlib.get_backend())"

# Jupyter'de grafik hücre altında görünsün:
%matplotlib inline
</pre><div class="tbl-wrap"><table><tr><th>Belirti</th><th>Neden</th><th>Çözüm</th></tr><tr><td><code>plt.show()</code> hiçbir şey göstermiyor</td><td>Görüntüsüz arka uç (Agg) seçili ya da sunucuda çalışıyorsun</td><td>Dosyaya kaydet (<code>fig.savefig</code>); masaüstünde <code>matplotlib.use("TkAgg")</code></td></tr><tr><td>Kaydedilen PNG boş</td><td><code>savefig</code>, <code>plt.show()</code>'dan sonra çağrılmış; show figürü kapatır</td><td>Önce <code>savefig</code>, sonra <code>show</code></td></tr><tr><td><code>More than 20 figures have been opened</code> uyarısı</td><td>Döngüde figürler kapatılmıyor</td><td>Her turda <code>plt.close(fig)</code></td></tr><tr><td>Eksen etiketleri kesik</td><td>Uzun şehir adları tuvale sığmıyor</td><td><code>fig.tight_layout()</code> ya da <code>bbox_inches="tight"</code></td></tr><tr><td>Sunucuda (Linux, ekransız) <code>TclError: no display</code></td><td>Pencereli arka uç seçilmiş</td><td>pyplot'u içe aktarmadan önce <code>matplotlib.use("Agg")</code></td></tr></table></div><h3>Izgara düzeni: subplots(satır, sütun)</h3><p><code>plt.subplots(2, 2)</code> bir figür ve <b>2×2 numpy dizisi</b> halinde Axes döndürür; <code>axes[0, 1]</code> sağ üst grafiktir. Hepsini dolaşmak için <code>axes.flat</code> kullanılır. <code>sharey=True</code> tüm grafiklerin y eksenini ortak yapar; şehirleri karşılaştırırken bu şarttır, yoksa her grafik kendi ölçeğini seçer ve küçük şehir büyük görünür. Kullanılmayan alanı <code>ax.remove()</code> kaldırır.</p><pre class="py">import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

satis = {"İstanbul": [420, 450, 480], "Ankara": [300, 280, 310], "İzmir": [250, 260, 300]}
fig, axes = plt.subplots(2, 2, figsize=(8, 6), sharey=True)
print(type(axes).__name__, axes.shape)
for ax, (sehir, degerler) in zip(axes.flat, satis.items()):
    ax.plot(["Oca", "Şub", "Mar"], degerler, marker="o")
    ax.set_title(sehir)
axes[1, 1].remove()                      # 4. alan boş kalmasın
fig.suptitle("Şehir bazında aylık satış")
fig.tight_layout()
print("Axes sayısı:", len(fig.axes))
print("ortak y sınırı:", axes[0, 0].get_ylim() == axes[1, 0].get_ylim())
plt.close(fig)
</pre><h3>İki birim tek grafikte: twinx</h3><p>Ciro (TL) ve sipariş adedi aynı eksende çizilirse adet çizgisi sıfıra yapışır. <code>ax.twinx()</code> aynı x eksenini paylaşan, sağda kendi y ekseni olan ikinci bir Axes verir. Okuyucunun hangi serinin hangi eksene ait olduğunu anlaması için eksen etiketlerini serinin rengiyle boyamak iyi bir alışkanlıktır.</p><pre class="py">import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

aylar = ["Oca", "Şub", "Mar", "Nis"]
ciro = [125000, 98000, 143000, 151000]
siparis = [410, 350, 470, 455]

fig, ax = plt.subplots(figsize=(7, 4))
ax.bar(aylar, ciro, color="lightsteelblue")
ax.set_ylabel("Ciro (TL)")
ax2 = ax.twinx()
ax2.plot(aylar, siparis, color="darkred", marker="o")
ax2.set_ylabel("Sipariş (adet)", color="darkred")
print("sol çubuk:", len(ax.patches), "| sağ çizgi:", len(ax2.lines))
print(ax.get_ylabel(), "/", ax2.get_ylabel())
plt.close(fig)
</pre><h3>Vurgu: hedef çizgisi, bölge ve not</h3><p>Grafiğin mesajını okuyucuya söyletmek için üç araç yeter: <code>ax.axhline(y)</code> yatay referans çizgisi (hedef, ortalama), <code>ax.axvspan(x1, x2)</code> bir aralığı gölgeler (kampanya haftaları), <code>ax.annotate(metin, xy=..., xytext=..., arrowprops=...)</code> bir noktaya oklu not koyar. Vurgulanacak çubuğu farklı renkle boyamak için renk listesini koşulla kur.</p><pre class="py">import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

haftalar = ["H1", "H2", "H3", "H4", "H5"]
ciro = [1210, 1480, 990, 1725, 1610]
hedef = 1300

fig, ax = plt.subplots()
renk = ["firebrick" if c &lt; hedef else "lightgray" for c in ciro]
ax.bar(haftalar, ciro, color=renk)
ax.axhline(hedef, linestyle="--", color="black", label="Hedef")
ax.axvspan(2.5, 4.5, alpha=0.15, color="green")      # kampanya haftaları
ax.annotate("Stok sorunu", xy=(2, 990), xytext=(2.2, 1550),
            arrowprops={"arrowstyle": "-&gt;"})
ax.set_title("İki hafta hedefin altında kaldı")
print("hedef altı hafta:", sum(c &lt; hedef for c in ciro))
print("çizgi:", len(ax.lines), "| not:", len(ax.texts))
plt.close(fig)
</pre><h3>Türkçe sayı biçimi ve yığılmış çubuk</h3><p>matplotlib eksende 1e6 gibi bilimsel gösterim ya da 1,250,000 gibi İngilizce ayraç kullanır. <code>matplotlib.ticker.FuncFormatter</code> her eksen değerini senin fonksiyonundan geçirir; fonksiyon <code>(değer, konum)</code> alır ve metin döndürür. Yığılmış (stacked) çubukta her kategori, bir önceki katmanların toplamı üzerine <code>bottom=</code> parametresiyle oturtulur; pandas'ta aynı iş <code>pivot.plot.bar(stacked=True)</code> ile yapılır.</p><pre class="py">import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.ticker import FuncFormatter
import numpy as np

def tl(x, pos):
    return f"{x:,.0f} TL".replace(",", ".")

sehirler = ["İstanbul", "Ankara", "İzmir"]
katmanlar = {"Gıda": [500000, 320000, 210000], "Elektronik": [900000, 410000, 380000]}

fig, ax = plt.subplots()
alt = np.zeros(len(sehirler))
for kategori, degerler in katmanlar.items():
    ax.bar(sehirler, degerler, bottom=alt, label=kategori)
    alt += degerler
ax.yaxis.set_major_formatter(FuncFormatter(tl))
ax.legend()
print(tl(1250000, 0))
print("çubuk parçası:", len(ax.patches), "| İstanbul toplam:", int(alt[0]))
plt.close(fig)
</pre><h3>Dışa aktarma ve HTML rapora gömme</h3><p><code>savefig</code> uzantıya göre biçim seçer: PNG (ekran, e-posta; <code>dpi=150</code> baskıda net), SVG ve PDF (vektör, büyütünce bozulmaz). Grafiği dosya yerine belleğe yazmak için <code>io.BytesIO</code> kullanılır; base64 ile metne çevrilen PNG, tek dosyalık bir HTML rapora <code>&lt;img src="data:image/png;base64,..."&gt;</code> olarak gömülür. E-posta ile giden otomatik raporlar genellikle böyle üretilir.</p><pre class="py">import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import io, base64

fig, ax = plt.subplots(figsize=(4, 3))
ax.bar(["A", "B"], [3, 5])
tampon = io.BytesIO()
fig.savefig(tampon, format="png", dpi=100, bbox_inches="tight")
plt.close(fig)
ham = tampon.getvalue()
print("PNG imzası:", ham[:4] == b"\\x89PNG")
kod = base64.b64encode(ham).decode("ascii")
html = f'&lt;img alt="Ciro" src="data:image/png;base64,{kod[:20]}..."&gt;'
print(html)
</pre><div class="tip"><b>Stil bir kere tanımlanır</b>Kurumsal renkleri ve yazı boyutlarını <code>plt.rcParams.update({"axes.spines.top": False, "axes.spines.right": False, "font.size": 10})</code> ile betiğin başında bir kez ayarla. Üst ve sağ çerçeveyi kaldırmak grafiği hemen sadeleştirir.</div><div class="warn"><b>pyplot ile Axes'i karıştırma</b><code>plt.title()</code>, <code>plt.xlabel()</code> "geçerli" Axes'e, yani en son oluşturulana yazar. <code>subplots(1, 2)</code> sonrası <code>plt.title</code> sağdaki grafiğe gider. Birden çok grafikte daima <code>ax.set_title</code> kullan.</div><div class="note"><b>Gerçek işte</b>Analist ekiplerinde haftalık raporlar çoğunlukla bir betikle üretilir: veri çekilir, her grafik için ayrı bir fonksiyon PNG ya da base64 üretir, bir HTML şablonu bunları birleştirir ve rapor e-postayla gider. Bu düzende en sık iki sorun çıkar: kapatılmayan figürlerin sunucuda belleği doldurması ve şehirler arası grafiklerin ortak eksen kullanmaması yüzünden yanlış karşılaştırma. İkisini de bu bölümdeki alışkanlıklar çözer.</div>`,
    ex: [
      { t: 'mc',
        stage: 'Isınma',
        needs: ['matplotlib', 'numpy'],
        q: 'Aylık ciro (yüz binler TL) ve sipariş adedini (yüzler) aynı grafikte göstermek istiyorsun. En doğru yol hangisi?',
        o: ['İki seriyi aynı <code>ax.plot</code> çağrısıyla tek eksende çizmek', 'Ciroyu çubuk, adedi <code>ax.twinx()</code> ile sağ eksende çizgi yapmak', 'Adedi 1000 ile çarpıp ciro ile aynı eksene koymak', 'Her ay için iki ayrı pasta grafiği yan yana çizmek'],
        a: 1,
        why: 'Ölçekleri çok farklı iki seri aynı eksende çizilirse küçük olan düz bir çizgiye dönüşür. twinx aynı x ekseni üzerinde ikinci bir y ekseni açar; veriyi çarpmak ise okuyucuyu yanıltır.' },
      { t: 'predict',
        stage: 'Kodu oku',
        needs: ['matplotlib', 'numpy'],
        q: 'Bu kod ne yazdırır?',
        code: 'import matplotlib\nmatplotlib.use("Agg")\nimport matplotlib.pyplot as plt\nfig, axes = plt.subplots(2, 3)\nprint(axes.shape, len(fig.axes))\nplt.close(fig)\n',
        o: ['(2, 3) 6', '(6,) 6', '(2, 3) 1', '(3, 2) 6'],
        a: 0,
        why: 'subplots(2, 3) satır×sütun düzeninde 2×3 numpy dizisi döndürür; figürde toplam 6 Axes vardır.' },
      { t: 'predict',
        stage: 'Kodu oku',
        needs: ['matplotlib', 'numpy'],
        q: 'Hedef çizgisi de eklenen grafikte <code>ax.lines</code> kaç eleman içerir?',
        code: 'import matplotlib\nmatplotlib.use("Agg")\nimport matplotlib.pyplot as plt\nfig, ax = plt.subplots()\nax.plot([1, 2, 3], [10, 20, 15])\nax.axhline(12)\nax.bar([1, 2], [5, 6])\nprint(len(ax.lines), len(ax.patches))\nplt.close(fig)\n',
        o: ['1 2', '2 2', '2 3', '3 2'],
        a: 1,
        why: 'axhline da bir Line2D nesnesidir ve ax.lines\'a eklenir: plot + axhline = 2 çizgi. Çubuklar dikdörtgen olarak ax.patches\'te durur: 2.' },
      { t: 'predict',
        stage: 'Kodu oku',
        needs: ['matplotlib', 'numpy'],
        q: 'pyplot ile Axes karıştırılıyor. Ne yazdırır?',
        code: 'import matplotlib\nmatplotlib.use("Agg")\nimport matplotlib.pyplot as plt\nfig, (a1, a2) = plt.subplots(1, 2)\na1.bar(["A"], [1])\nplt.title("Şehir")\nprint(repr(a1.get_title()), repr(a2.get_title()))\nplt.close(fig)\n',
        o: ['\'Şehir\' \'\'', '\'\' \'Şehir\'', '\'Şehir\' \'Şehir\'', '\'\' \'\''],
        a: 1,
        why: 'plt.title geçerli Axes\'e yazar; subplots sonrası geçerli Axes en son oluşturulan, yani sağdaki a2\'dir. a1\'e çizim yapılmış olması onu geçerli yapmaz.' },
      { t: 'order',
        stage: 'Kodu oku',
        needs: ['matplotlib', 'numpy'],
        q: '<p>Grafiği diske değil belleğe PNG olarak yazıp boyutunun sıfırdan büyük olduğunu kontrol eden programın satırlarını sırala.</p>',
        lines: ['import io, matplotlib', 'matplotlib.use("Agg")', 'import matplotlib.pyplot as plt', 'fig, ax = plt.subplots()', 'ax.bar(["Ankara", "İzmir"], [300, 250])', 'tampon = io.BytesIO()', 'fig.savefig(tampon, format="png")', 'plt.close(fig)', 'print(len(tampon.getvalue()) > 0)'],
        expect: 'True\n',
        hint: 'Arka uç pyplot içe aktarılmadan önce seçilir; tampon savefig\'den önce oluşturulur.',
        why: 'use("Agg") pyplot\'tan önce gelmelidir. BytesIO dosya gibi davranır; savefig ona yazar, getvalue baytları verir.' },
      { t: 'code',
        id: 'gorsellestirme-x1',
        stage: 'Rehberli',
        diff: 2,
        needs: ['matplotlib', 'numpy'],
        q: '<p><code>yigin_cubuk(sehirler, katmanlar)</code> fonksiyonu yığılmış çubuk grafik çizsin. <code>katmanlar</code> bir sözlük: <code>{kategori: [şehir başına değer, ...]}</code>. Her kategori önceki katmanların toplamının üstüne (<code>bottom=</code>) oturmalı ve <code>label=kategori</code> almalı; <code>ax.legend()</code> çağrılsın, başlık <code>"Kategori kırılımı"</code> olsun. Figürü kapatıp <code>ax</code> döndür.</p>',
        guide: ['fig, ax = plt.subplots() ile başla.', 'Şehir sayısı kadar sıfırdan oluşan bir "alt" dizisi kur (np.zeros).', 'Her kategori için ax.bar(sehirler, degerler, bottom=alt, label=kategori) çiz ve alt\'a değerleri ekle.', 'Legend, başlık, plt.close(fig), return ax.'],
        example: 'import matplotlib\nmatplotlib.use("Agg")\nimport matplotlib.pyplot as plt\nimport numpy as np\nfig, ax = plt.subplots()\nalt = np.zeros(2)\nfor ad, d in {"Kadın": [3, 4], "Erkek": [5, 1]}.items():\n    ax.barh(["İK", "BT"], d, left=alt, label=ad)   # yatayda left=\n    alt += d\nprint(alt)\nplt.close(fig)\n',
        start: 'import matplotlib\nmatplotlib.use("Agg")\nimport matplotlib.pyplot as plt\nimport numpy as np\n\ndef yigin_cubuk(sehirler, katmanlar):\n    fig, ax = plt.subplots()\n    alt = np.zeros(len(sehirler))\n    for kategori, degerler in katmanlar.items():\n        # TODO: bottom ve label ile çubuk çiz\n        # TODO: alt dizisini güncelle\n        pass\n    # TODO: legend ve başlık\n    plt.close(fig)\n    return ax\n',
        sol: 'import matplotlib\nmatplotlib.use("Agg")\nimport matplotlib.pyplot as plt\nimport numpy as np\n\ndef yigin_cubuk(sehirler, katmanlar):\n    fig, ax = plt.subplots()\n    alt = np.zeros(len(sehirler))\n    for kategori, degerler in katmanlar.items():\n        ax.bar(sehirler, degerler, bottom=alt, label=kategori)\n        alt += np.asarray(degerler, dtype=float)\n    ax.legend()\n    ax.set_title("Kategori kırılımı")\n    plt.close(fig)\n    return ax\n',
        tests: 'ax = yigin_cubuk(["İstanbul", "Ankara"], {"Gıda": [500, 300], "Elektronik": [900, 400]})\nassert len(ax.patches) == 4, f"2 şehir x 2 kategori = 4 çubuk parçası; gelen {len(ax.patches)}"\nust = ax.patches[2]\nassert ust.get_y() == 500 and ust.get_height() == 900, "Elektronik çubuğu Gıda\'nın üstünden (500) başlamalı: bottom="\nassert ax.get_title() == "Kategori kırılımı", "Başlık"\nassert ax.get_legend() is not None, "legend çağrılmalı"\nassert [t.get_text() for t in ax.get_legend().get_texts()] == ["Gıda", "Elektronik"], "Legend kategori adlarını göstermeli"\n',
        hints: ['bottom parametresi çubuğun başlangıç yüksekliğidir.', 'alt += np.asarray(degerler) ile bir sonraki katmanın tabanını yükselt.', 'ax.bar(sehirler, degerler, bottom=alt, label=kategori)'],
        why: 'Yığılmış çubukta her katman bir öncekilerin toplamından başlar. Çubuk dikdörtgenlerinin get_y ve get_height değerleri bunu test etmeyi sağlar.' },
      { t: 'code',
        id: 'gorsellestirme-x2',
        stage: 'Rehberli',
        diff: 2,
        needs: ['matplotlib', 'numpy'],
        q: '<p><code>cift_eksen(aylar, ciro, siparis)</code> fonksiyonu ciroyu sol eksende çubuk, sipariş adedini <code>twinx</code> ile sağ eksende çizgi olarak çizsin. Sol y etiketi <code>"Ciro (TL)"</code>, sağ y etiketi <code>"Sipariş"</code>. Figürü kapatıp <code>(ax, ax2)</code> döndür.</p>',
        guide: ['fig, ax = plt.subplots(); ax.bar ile ciro.', 'ax.set_ylabel("Ciro (TL)").', 'ax2 = ax.twinx(); ax2.plot ile siparis.', 'ax2.set_ylabel("Sipariş"), plt.close(fig), return ax, ax2.'],
        example: 'import matplotlib\nmatplotlib.use("Agg")\nimport matplotlib.pyplot as plt\nfig, ax = plt.subplots()\nax.plot([1, 2], [20, 22])\nsag = ax.twinx()\nsag.plot([1, 2], [0.4, 0.9], color="red")\nprint(len(ax.lines), len(sag.lines))\nplt.close(fig)\n',
        start: 'import matplotlib\nmatplotlib.use("Agg")\nimport matplotlib.pyplot as plt\n\ndef cift_eksen(aylar, ciro, siparis):\n    fig, ax = plt.subplots()\n    ax.bar(aylar, ciro)\n    # TODO: sol etiket\n    # TODO: ax2 = ax.twinx() ve çizgi\n    ax2 = ax\n    plt.close(fig)\n    return ax, ax2\n',
        sol: 'import matplotlib\nmatplotlib.use("Agg")\nimport matplotlib.pyplot as plt\n\ndef cift_eksen(aylar, ciro, siparis):\n    fig, ax = plt.subplots()\n    ax.bar(aylar, ciro)\n    ax.set_ylabel("Ciro (TL)")\n    ax2 = ax.twinx()\n    ax2.plot(aylar, siparis, color="darkred", marker="o")\n    ax2.set_ylabel("Sipariş")\n    plt.close(fig)\n    return ax, ax2\n',
        tests: 'ax, ax2 = cift_eksen(["Oca", "Şub", "Mar"], [125000, 98000, 143000], [410, 350, 470])\nassert ax is not ax2, "ax2 ayrı bir Axes olmalı (twinx)"\nassert len(ax.patches) == 3 and len(ax.lines) == 0, "Sol eksende yalnız 3 çubuk olmalı"\nassert len(ax2.lines) == 1 and list(ax2.lines[0].get_ydata()) == [410, 350, 470], "Sağ eksende sipariş çizgisi olmalı"\nassert ax.get_ylabel() == "Ciro (TL)" and ax2.get_ylabel() == "Sipariş", "Eksen etiketleri"\nassert ax2.get_shared_x_axes().joined(ax, ax2), "ax2 aynı x eksenini paylaşmalı"\n',
        hints: ['twinx aynı x eksenine sahip yeni bir Axes döndürür.', 'ax2 = ax.twinx(); ax2.plot(aylar, siparis); ax2.set_ylabel("Sipariş")'],
        why: 'twinx ile iki ölçek ayrı eksende kalır, x ekseni ortaktır. Her serinin kendi Axes nesnesi olduğu için test de ayrı ayrı yapılabilir.' },
      { t: 'code',
        id: 'gorsellestirme-x3',
        stage: 'Rehberli',
        diff: 2,
        needs: ['matplotlib', 'numpy'],
        q: '<p>Önce <code>tl(x, pos)</code> biçimleyicisini yaz: sayıyı küsuratsız, binlik ayraç <b>nokta</b> olacak şekilde <code>"1.250.000 TL"</code> biçiminde döndürsün. Ardından <code>tl_grafik(sehirler, ciro)</code> çubuk grafik çizip y eksenine <code>FuncFormatter(tl)</code> uygulasın, figürü kapatıp <code>ax</code> döndürsün.</p>',
        guide: ['f"{x:,.0f}" binlik ayracı virgül olan metin verir.', 'Virgülleri noktaya çevir ve " TL" ekle.', 'ax.yaxis.set_major_formatter(FuncFormatter(tl)) ile eksene bağla.'],
        example: 'from matplotlib.ticker import FuncFormatter\nyuzde = FuncFormatter(lambda x, pos: f"%{x:.0f}")\nprint(yuzde(45.2, 0))\n',
        start: 'import matplotlib\nmatplotlib.use("Agg")\nimport matplotlib.pyplot as plt\nfrom matplotlib.ticker import FuncFormatter\n\ndef tl(x, pos):\n    # TODO: "1.250.000 TL" biçimi\n    return str(x)\n\ndef tl_grafik(sehirler, ciro):\n    fig, ax = plt.subplots()\n    ax.bar(sehirler, ciro)\n    # TODO: y eksenine biçimleyiciyi uygula\n    plt.close(fig)\n    return ax\n',
        sol: 'import matplotlib\nmatplotlib.use("Agg")\nimport matplotlib.pyplot as plt\nfrom matplotlib.ticker import FuncFormatter\n\ndef tl(x, pos):\n    return f"{x:,.0f} TL".replace(",", ".")\n\ndef tl_grafik(sehirler, ciro):\n    fig, ax = plt.subplots()\n    ax.bar(sehirler, ciro)\n    ax.yaxis.set_major_formatter(FuncFormatter(tl))\n    plt.close(fig)\n    return ax\n',
        tests: 'assert tl(1250000, 0) == "1.250.000 TL", f"1250000 → \'1.250.000 TL\'; gelen {tl(1250000, 0)!r}"\nassert tl(999.6, 0) == "1.000 TL", "Küsurat yuvarlanmalı"\nassert tl(0, 0) == "0 TL"\nax = tl_grafik(["Ankara", "İzmir"], [1500000, 900000])\nf = ax.yaxis.get_major_formatter()\nassert f(2000000, 0) == "2.000.000 TL", "y ekseni biçimleyicisi tl olmalı"\n',
        hints: ['Biçim belirteci :,.0f binlik ayraç ekler ve küsuratı yuvarlar.', '.replace(",", ".") ile Türkçe ayraç; eksen için ax.yaxis.set_major_formatter(FuncFormatter(tl)).'],
        why: 'FuncFormatter eksen etiketlerini senin fonksiyonundan geçirir; yerel biçim (nokta binlik ayraç, TL eki) grafiği yönetici için doğrudan okunur kılar.' },
      { t: 'code',
        id: 'gorsellestirme-x4',
        stage: 'Kendin yaz',
        diff: 2,
        needs: ['matplotlib', 'numpy'],
        q: '<p><code>png_data_uri(fig)</code> fonksiyonu verilen figürü diske yazmadan <code>io.BytesIO</code>\'ya PNG olarak kaydetsin, figürü kapatsın ve <code>"data:image/png;base64,..."</code> biçiminde metin döndürsün (HTML <code>img</code> etiketine gömülebilecek biçim).</p>',
        start: 'import matplotlib\nmatplotlib.use("Agg")\nimport matplotlib.pyplot as plt\nimport io, base64\n\ndef png_data_uri(fig):\n    pass\n',
        sol: 'import matplotlib\nmatplotlib.use("Agg")\nimport matplotlib.pyplot as plt\nimport io, base64\n\ndef png_data_uri(fig):\n    tampon = io.BytesIO()\n    fig.savefig(tampon, format="png", bbox_inches="tight")\n    plt.close(fig)\n    kod = base64.b64encode(tampon.getvalue()).decode("ascii")\n    return "data:image/png;base64," + kod\n',
        tests: 'import base64, os\nonce = set(os.listdir("."))\nfig, ax = plt.subplots()\nax.bar(["A", "B"], [1, 2])\nuri = png_data_uri(fig)\nassert isinstance(uri, str) and uri.startswith("data:image/png;base64,"), "Metin data:image/png;base64, ile başlamalı"\nham = base64.b64decode(uri.split(",", 1)[1])\nassert ham[:4] == b"\\x89PNG", "Çözülen veri PNG olmalı"\nassert not plt.fignum_exists(fig.number), "Figür kapatılmalı"\nassert set(os.listdir(".")) == once, "Diske dosya yazılmamalı"\n',
        hints: ['fig.savefig(tampon, format="png") dosya yerine BytesIO\'ya yazar.', 'base64.b64encode(...).decode("ascii") metne çevirir; başına "data:image/png;base64," ekle.'],
        why: 'Bellek içi PNG + base64, tek dosyalık HTML raporlarının ve e-posta gövdesine gömülü grafiklerin temelidir; geçici dosya yönetimi gerektirmez.' },
      { t: 'code',
        id: 'gorsellestirme-x5',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 2,
        needs: ['matplotlib', 'numpy'],
        q: '<p><b>Hatayı bul ve düzelt.</b> <code>sehir_raporlari(veri)</code> her şehir için ayrı bir PNG üretip dosya adlarını döndürüyor. Sunucuda her gece yüzlerce şehirle çalışınca bellek doluyor. Fonksiyon bittiğinde hiçbir figür açık kalmamalı.</p>',
        start: 'import matplotlib\nmatplotlib.use("Agg")\nimport matplotlib.pyplot as plt\n\ndef sehir_raporlari(veri):\n    dosyalar = []\n    for sehir, degerler in veri.items():\n        fig, ax = plt.subplots()\n        ax.plot(degerler)\n        ax.set_title(sehir)\n        yol = f"rapor_{len(dosyalar)}.png"\n        fig.savefig(yol)\n        dosyalar.append(yol)\n    return dosyalar\n',
        sol: 'import matplotlib\nmatplotlib.use("Agg")\nimport matplotlib.pyplot as plt\n\ndef sehir_raporlari(veri):\n    dosyalar = []\n    for sehir, degerler in veri.items():\n        fig, ax = plt.subplots()\n        ax.plot(degerler)\n        ax.set_title(sehir)\n        yol = f"rapor_{len(dosyalar)}.png"\n        fig.savefig(yol)\n        plt.close(fig)\n        dosyalar.append(yol)\n    return dosyalar\n',
        tests: 'import os\nplt.close("all")\nr = sehir_raporlari({"Ankara": [1, 2, 3], "İzmir": [3, 2, 1], "Bursa": [2, 2, 2]})\nassert r == ["rapor_0.png", "rapor_1.png", "rapor_2.png"], "Üç dosya adı dönmeli"\nassert all(os.path.exists(y) for y in r), "Dosyalar kaydedilmeli"\nassert plt.get_fignums() == [], f"Açık figür kalmamalı; açık: {plt.get_fignums()}. Her turda plt.close(fig)"\n',
        hints: ['pyplot oluşturduğu her figürü kapatılana kadar bellekte tutar.', 'savefig\'den hemen sonra plt.close(fig).'],
        why: 'plt.subplots ile açılan figürler pyplot\'un kaydında kalır ve çöp toplayıcı onları silemez. Döngüde kapatmamak uzun çalışan işlerde bellek sızıntısıdır.' },
      { t: 'code',
        id: 'gorsellestirme-x6',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 2,
        needs: ['matplotlib', 'numpy'],
        q: '<p><b>Hatayı bul ve düzelt.</b> <code>iki_grafik(sehirler, ciro, tutarlar)</code> solda şehir çubuklarını (başlık <code>"Şehir cirosu"</code>), sağda tutar histogramını (başlık <code>"Tutar dağılımı"</code>) çizmeli. Ama başlıklar yanlış grafiklere gidiyor. <code>(a1, a2)</code> döndürür.</p>',
        start: 'import matplotlib\nmatplotlib.use("Agg")\nimport matplotlib.pyplot as plt\n\ndef iki_grafik(sehirler, ciro, tutarlar):\n    fig, (a1, a2) = plt.subplots(1, 2)\n    a1.bar(sehirler, ciro)\n    plt.title("Şehir cirosu")\n    a2.hist(tutarlar, bins=5)\n    plt.title("Tutar dağılımı")\n    plt.close(fig)\n    return a1, a2\n',
        sol: 'import matplotlib\nmatplotlib.use("Agg")\nimport matplotlib.pyplot as plt\n\ndef iki_grafik(sehirler, ciro, tutarlar):\n    fig, (a1, a2) = plt.subplots(1, 2)\n    a1.bar(sehirler, ciro)\n    a1.set_title("Şehir cirosu")\n    a2.hist(tutarlar, bins=5)\n    a2.set_title("Tutar dağılımı")\n    plt.close(fig)\n    return a1, a2\n',
        tests: 'a1, a2 = iki_grafik(["A", "B"], [3, 5], [1, 2, 2, 3, 9, 4])\nassert a1.get_title() == "Şehir cirosu", f"Sol grafiğin başlığı \'Şehir cirosu\' olmalı; gelen {a1.get_title()!r}"\nassert a2.get_title() == "Tutar dağılımı", "Sağ grafiğin başlığı \'Tutar dağılımı\' olmalı"\nassert len(a1.patches) == 2 and len(a2.patches) == 5\n',
        hints: ['plt.title "geçerli" Axes\'e yazar; subplots sonrası bu, en son oluşturulan a2\'dir.', 'Her Axes\'in kendi metodunu kullan: a1.set_title(...).'],
        why: 'Durum makinesi (pyplot) arayüzü tek grafikte rahattır ama çoklu grafikte hangi Axes\'in geçerli olduğu belirsizleşir. Nesne yönelimli arayüz (ax.set_*) her zaman açık ve güvenlidir.' },
      { t: 'code',
        id: 'gorsellestirme-x7',
        stage: 'Meydan okuma',
        diff: 3,
        needs: ['matplotlib', 'numpy'],
        q: '<p>"Küçük çoklu grafik" (small multiples) üreten <code>kucuk_coklu(veri, sutun=2)</code> yaz. <code>veri</code>: <code>{şehir: [aylık değerler]}</code>. Her şehir için bir grafik, <code>sutun</code> sütunlu ızgarada (satır sayısı yukarı yuvarlanır), <b>ortak y ekseni</b> (<code>sharey=True</code>), her grafiğin başlığı şehir adı, her birinde ortalama değerde <code>axhline</code>. Kullanılmayan Axes\'ler <code>remove()</code> ile silinsin. Figürü kapatıp <code>fig</code> döndür. Tek şehirde de çalışmalı.</p>',
        start: 'import matplotlib\nmatplotlib.use("Agg")\nimport matplotlib.pyplot as plt\nimport math\n\ndef kucuk_coklu(veri, sutun=2):\n    pass\n',
        sol: 'import matplotlib\nmatplotlib.use("Agg")\nimport matplotlib.pyplot as plt\nimport math\nimport numpy as np\n\ndef kucuk_coklu(veri, sutun=2):\n    n = len(veri)\n    satir = math.ceil(n / sutun)\n    fig, axes = plt.subplots(satir, sutun, sharey=True, squeeze=False)\n    duz = axes.flat\n    for ax, (sehir, degerler) in zip(duz, veri.items()):\n        ax.plot(degerler, marker="o")\n        ax.axhline(float(np.mean(degerler)), linestyle="--", color="gray")\n        ax.set_title(sehir)\n    for ax in list(axes.flat)[n:]:\n        ax.remove()\n    plt.close(fig)\n    return fig\n',
        tests: 'v = {"İstanbul": [420, 450, 480], "Ankara": [300, 280, 310], "İzmir": [250, 260, 300]}\nfig = kucuk_coklu(v)\nassert len(fig.axes) == 3, f"3 şehir için 3 Axes kalmalı (4. silinmeli); gelen {len(fig.axes)}"\nassert [a.get_title() for a in fig.axes] == ["İstanbul", "Ankara", "İzmir"], "Başlıklar şehir adları"\nassert len({a.get_ylim() for a in fig.axes}) == 1, "Tüm grafikler aynı y sınırlarını paylaşmalı (sharey=True)"\nassert all(len(a.lines) == 2 for a in fig.axes), "Her grafikte veri çizgisi + ortalama çizgisi"\nassert abs(fig.axes[1].lines[1].get_ydata()[0] - 296.6666) < 0.01, "Ankara ortalama çizgisi ~296.67"\nf1 = kucuk_coklu({"Bursa": [1, 2]}, sutun=3)\nassert len(f1.axes) == 1 and f1.axes[0].get_title() == "Bursa", "Tek şehirde tek Axes"\n',
        hints: ['Satır sayısı: math.ceil(n / sutun).', 'squeeze=False her durumda 2 boyutlu Axes dizisi döndürür; tek grafikte bile .flat ile dolaşabilirsin.', 'Fazla Axes\'leri list(axes.flat)[n:] ile bul ve ax.remove() çağır.'],
        why: 'Ortak eksenli küçük çoklu grafikler, tek grafiğe sıkıştırılmış spagetti çizgilerden çok daha okunurdur. squeeze=False ve kalan Axes\'leri silmek kenar durumları (tek şehir, tek sayı) güvenle karşılar.' }
    ],
    faq: [
      { q: 'Grafiği PNG mi, SVG mi, PDF mi kaydetmeliyim?',
        a: 'E-posta, Slack ve web için PNG (dpi=150 yeterli). Baskı, sunum ve büyütülecek grafikler için vektör biçimler: SVG (web), PDF (rapor). Çok noktalı dağılım grafiklerinde vektör dosya şişebilir; o zaman yüksek dpi\'li PNG daha pratiktir.' },
      { q: 'matplotlib yerine seaborn ya da plotly mi öğrenmeliyim?',
        a: 'İkisi de matplotlib\'in yerine değil, üstüne gelir. seaborn tidy veriden istatistiksel grafikleri tek satırda çizer ama ince ayar yine matplotlib Axes\'i üzerindendir; plotly etkileşimli HTML üretir. Önce Figure/Axes mantığını oturt, sonra "İleri görselleştirme" dersine geç.' }
    ],
    mistakes: [
      { bad: 'fig, (a1, a2) = plt.subplots(1, 2)\nplt.title("Sol grafik")',
        good: 'fig, (a1, a2) = plt.subplots(1, 2)\na1.set_title("Sol grafik")',
        why: 'plt.title en son oluşturulan (sağdaki) Axes\'e yazar; çoklu grafikte her zaman ax.set_title kullan.' },
      { bad: 'plt.show()\nfig.savefig("rapor.png")',
        good: 'fig.savefig("rapor.png")\nplt.show()',
        why: 'show pencereyi kapatınca figür de kapanabilir ve kaydedilen dosya boş olur; önce kaydet, sonra göster.' }
    ]
  }
);
})(window);
