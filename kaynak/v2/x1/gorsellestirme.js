/* Kesit Python — 'gorsellestirme' dersi uzantısı: Kanat Havayolları dakiklik panosu (gerçek veri setleri) */
// needs: matplotlib, pandas
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
  {
    id: 'gorsellestirme',
    min: 25,
    needs: ['matplotlib', 'pandas'],
    html: `<h2>Derinleş: gerçek veriyle dakiklik panosu</h2><p>Grafik kurallarını küçük listelerle öğrendin; şimdi bunları gerçek bir operasyon sorusuna uygulayalım. Kanat Havayolları'nın Eylül–Aralık 2024 arasındaki <b>3.173 uçuşu</b> (<code>kanat_havayollari/hv_flights</code>) ve <b>1.350 rötar nedeni kaydı</b> (<code>hv_delays</code>) elimizde. Operasyon direktörü üç soru soruyor: Gecikmeler nasıl dağılıyor? En çok dakikayı hangi neden yiyor? Dakiklik (on-time performance) zamanla kötüleşiyor mu? Her soru için doğru grafik türünü seçip okunur hale getireceğiz.</p><div class="tbl-wrap"><table><tr><th>Soru</th><th>Grafik</th><th>Neden bu tür?</th></tr><tr><td>Gecikmeler nasıl dağılıyor?</td><td>Histogram + eşik çizgisi</td><td>Tek sayısal değişkenin şekli; çarpıklık ve kuyruk görünür</td></tr><tr><td>Hangi neden en çok dakika yiyor?</td><td>Sıralı yatay çubuk</td><td>Kategorik karşılaştırma; uzun etiketler okunur</td></tr><tr><td>Dakiklik zamanla nasıl değişiyor?</td><td>İşaretli çizgi + hedef çizgisi</td><td>Zaman ekseni; hedefe uzaklık tek bakışta</td></tr><tr><td>Hangi rota sorunlu?</td><td>Küçük çoklu grafik (aynı y ölçeği)</td><td>Birden çok seriyi karmaşaya boğmadan kıyaslar</td></tr></table></div><h3>Önce sayıyı üret</h3><p>Kalkış gecikmesi = gerçek kalkış − planlanan kalkış (dakika). İptal edilen uçuşlarda gerçek kalkış yoktur; onları dağılımdan çıkar ama ayrı bir sayı olarak raporla. Havacılıkta yaygın tanım: 15 dakikadan az gecikme "zamanında" sayılır.</p><pre class="py">import veri

f = veri.oku("kanat_havayollari", "hv_flights", parse_dates=["sched_dep", "actual_dep"])
print(f["status"].value_counts().to_dict())
u = f[f["status"] != "cancelled"].copy()
u["gecikme"] = (u["actual_dep"] - u["sched_dep"]).dt.total_seconds() / 60
print(u["gecikme"].describe().round(1).to_dict())
print("zamanında (%):", round((u["gecikme"] &lt; 15).mean() * 100, 1))
</pre><p>Ortalama gecikme 25 dakika ama medyan 7 dakika: dağılım sağa çarpık, birkaç uzun rötar ortalamayı yukarı çekiyor. Bu, histogramı tek başına gösterilmesi gereken bir dağılım yapar.</p><h3>Çarpık dağılım: kuyruğu kırp, eşiği çiz</h3><p>Uzun kuyruk (289 dakikaya kadar) eksenini genişletir ve asıl kitleyi sola sıkıştırır. Değerleri 180'de <code>clip</code> ile kırpıp son kutuyu "180+" diye açıkla; 15 dakika eşiğini dikey çizgiyle göster. Kutu sınırlarını 15'in katı seçmek, eşiğin bir kutu sınırına denk gelmesini sağlar.</p><pre class="py">import veri
import matplotlib.pyplot as plt

f = veri.oku("kanat_havayollari", "hv_flights", parse_dates=["sched_dep", "actual_dep"])
u = f[f["status"] != "cancelled"]
gecikme = (u["actual_dep"] - u["sched_dep"]).dt.total_seconds() / 60

fig, ax = plt.subplots(figsize=(8, 4))
sayilar, kenarlar, _ = ax.hist(gecikme.clip(upper=180), bins=range(-15, 181, 15), color="#6b7c93")
ax.axvline(15, color="#c0392b", linestyle="--", label="15 dk eşiği")
ax.set_title("Kalkış gecikmesi dağılımı (180+ son kutuda)")
ax.set_xlabel("Dakika")
ax.set_ylabel("Uçuş sayısı")
ax.legend()
print(sayilar[:4].astype(int).tolist(), "...", int(sayilar[-1]))
plt.close(fig)
</pre><h3>Nedenler: sıralı yatay çubuk</h3><p>Kategorik ve uzun adlı nedenleri karşılaştırmak için yatay çubuk en okunur türdür. Çubukları değere göre sırala; matplotlib yatay çubukta ilk değeri en alta koyduğu için <b>artan</b> sıralarsan en büyük neden en üstte görünür. Pasta grafik beş kategoride bile farkları okutmaz.</p><pre class="py">import veri
import matplotlib.pyplot as plt

d = veri.oku("kanat_havayollari", "hv_delays")
toplam = d.groupby("reason")["minutes"].sum().sort_values()
pay = (toplam / toplam.sum() * 100).round(1)

fig, ax = plt.subplots(figsize=(7, 3.5))
ax.barh(toplam.index, toplam.values, color="#6b7c93")
for y, (deger, yuzde) in enumerate(zip(toplam.values, pay.values)):
    ax.text(deger, y, f" %{yuzde}", va="center")
ax.set_title("Rötar dakikası nedene göre")
ax.set_xlabel("Toplam dakika")
print(pay.to_dict())
plt.close(fig)
</pre><div class="tip"><b>Grafiği test etmek</b>Grafik üreten fonksiyonları da test edebilirsin: <code>ax.patches</code> çubukları, <code>ax.lines</code> çizgileri, <code>ax.get_title()</code> başlığı verir. <code>[p.get_height() for p in ax.patches]</code> ile çizilen değerlerin veriyle tuttuğunu denetlersin. Bu dersin alıştırmaları tam olarak böyle denetleniyor; gece çalışan rapor işlerinde de aynı yöntem kullanılır.</div><div class="note"><b>Gerçek işte</b>Operasyon panolarında "aylık dakiklik + hedef çizgisi" en çok bakılan grafiktir. Ortalama gecikmeyi değil, eşiğin altındaki uçuş yüzdesini çiz: yönetim hedefi (ör. %80) bu birimle koyar. Kötüleşen bir trendi gördüğünde bir sonraki grafik her zaman kırılımdır: hangi rota, hangi saat, hangi neden?</div>`,
    ex: [
      {
        t: 'predict',
        stage: 'Kodu oku',
        q: 'Uçuş durumları ve gecikmeler sayılıyor. Bu kod ne yazdırır?',
        needs: ['pandas'],
        code: 'import veri\nf = veri.oku("kanat_havayollari", "hv_flights", parse_dates=["sched_dep", "actual_dep"])\ng = (f["actual_dep"] - f["sched_dep"]).dt.total_seconds() / 60\nprint(f["status"].value_counts().to_dict())\nprint(int(g.isna().sum()), g.median())\n',
        o: ['{\'landed\': 3102, \'cancelled\': 62, \'diverted\': 9}\n62 7.0', '{\'landed\': 3102, \'cancelled\': 62, \'diverted\': 9}\n0 7.0', '{\'landed\': 3102, \'cancelled\': 62, \'diverted\': 9}\n62 24.97', '{\'landed\': 3111, \'cancelled\': 62}\n62 7.0'],
        a: 0,
        why: 'İptal edilen 62 uçuşun gerçek kalkışı yok; farkları NaN olur. Yön değiştiren (diverted) uçuşlar kalkmıştır, gecikmeleri hesaplanır. Medyan 7 dakika; 24.97 ortalamadır.'
      },
      {
        t: 'predict',
        stage: 'Kodu oku',
        q: 'Rötar nedenleri yatay çubukla çiziliyor. Bu kod ne yazdırır?',
        needs: ['pandas', 'matplotlib'],
        code: 'import veri\nimport matplotlib.pyplot as plt\nd = veri.oku("kanat_havayollari", "hv_delays")\ntoplam = d.groupby("reason")["minutes"].sum().sort_values()\nfig, ax = plt.subplots()\nax.barh(toplam.index, toplam.values)\nprint(len(ax.patches), toplam.index[-1])\nplt.close(fig)\n',
        o: ['5 hava', '5 yer_hizmetleri', '1350 hava', '1 hava'],
        a: 0,
        why: 'Beş neden var, her biri bir çubuk (patch). Artan sıralamada en büyük değer (hava, 23.534 dk) sonda; barh onu en üste çizer.'
      },
      {
        t: 'order',
        stage: 'Kodu oku',
        q: '<p>İptal olmayan uçuşların gecikme histogramını çizip kutu sayısını yazdıran programın satırlarını sırala.</p>',
        needs: ['pandas', 'matplotlib'],
        lines: ['import veri', 'import matplotlib.pyplot as plt', 'f = veri.oku("kanat_havayollari", "hv_flights", parse_dates=["sched_dep", "actual_dep"])', 'u = f[f["status"] != "cancelled"]', 'gecikme = (u["actual_dep"] - u["sched_dep"]).dt.total_seconds() / 60', 'fig, ax = plt.subplots()', 'sayilar, _, _ = ax.hist(gecikme.clip(upper=180), bins=range(-15, 181, 15))', 'print(len(ax.patches), int(sayilar.sum()))'],
        expect: '13 3111\n',
        hint: 'Filtre gecikmeden, gecikme histogramdan önce gelir.',
        why: 'range(-15, 181, 15) 14 kenar, yani 13 kutu üretir. clip uzun rötarları 180\'e çektiği için hiçbir uçuş dışarıda kalmaz: 3.111 uçuşun hepsi sayılır.'
      },
      {
        t: 'code',
        id: 'gorsellestirme-v1',
        stage: 'Rehberli',
        diff: 2,
        needs: ['pandas', 'matplotlib'],
        q: '<p><code>rotar_histogram()</code> fonksiyonunu tamamla: <code>ucuslar()</code> (verildi) iptal olmayan uçuşları <code>gecikme</code> sütunuyla döndürür. Gecikmeyi 180\'de kırparak <code>bins=range(-15, 181, 15)</code> ile histogram çiz; 15\'te kesikli dikey çizgi (<code>axvline</code>, label <code>"15 dk eşiği"</code>) ekle; başlık <code>"Kalkış gecikmesi dağılımı"</code>, x etiketi <code>"Dakika"</code>, y etiketi <code>"Uçuş sayısı"</code>; lejant göster. <code>(fig, ax)</code> döndür.</p>',
        guide: ['f = ucuslar() ile veriyi al.', 'fig, ax = plt.subplots() ile figür kur.', 'ax.hist(f["gecikme"].clip(upper=180), bins=range(-15, 181, 15))', 'ax.axvline(15, linestyle="--", label="15 dk eşiği")', 'Başlık, eksen etiketleri ve ax.legend(); sonra return fig, ax.'],
        example: 'import matplotlib.pyplot as plt\nfig, ax = plt.subplots()\nax.hist([1, 2, 2, 3, 9], bins=range(0, 11, 2))\nax.axvline(5, linestyle="--", label="sınır")\nax.legend()\nprint(len(ax.patches), len(ax.lines))\nplt.close(fig)\n',
        start: 'import veri\nimport matplotlib.pyplot as plt\n\ndef ucuslar():\n    f = veri.oku("kanat_havayollari", "hv_flights", parse_dates=["sched_dep", "actual_dep"])\n    f = f[f["status"] != "cancelled"].copy()\n    f["gecikme"] = (f["actual_dep"] - f["sched_dep"]).dt.total_seconds() / 60\n    return f\n\ndef rotar_histogram():\n    f = ucuslar()\n    fig, ax = plt.subplots()\n    # TODO: histogram, eşik çizgisi, başlık ve etiketler, lejant\n    return fig, ax\n',
        sol: 'import veri\nimport matplotlib.pyplot as plt\n\ndef ucuslar():\n    f = veri.oku("kanat_havayollari", "hv_flights", parse_dates=["sched_dep", "actual_dep"])\n    f = f[f["status"] != "cancelled"].copy()\n    f["gecikme"] = (f["actual_dep"] - f["sched_dep"]).dt.total_seconds() / 60\n    return f\n\ndef rotar_histogram():\n    f = ucuslar()\n    fig, ax = plt.subplots()\n    ax.hist(f["gecikme"].clip(upper=180), bins=range(-15, 181, 15))\n    ax.axvline(15, linestyle="--", color="red", label="15 dk eşiği")\n    ax.set_title("Kalkış gecikmesi dağılımı")\n    ax.set_xlabel("Dakika")\n    ax.set_ylabel("Uçuş sayısı")\n    ax.legend()\n    return fig, ax\n',
        tests: 'fig, ax = rotar_histogram()\nh = [p.get_height() for p in ax.patches]\nassert len(h) == 13, f"13 kutu olmalı, {len(h)} geldi"\nassert int(sum(h)) == 3111, "İptal olmayan 3.111 uçuşun hepsi histogramda olmalı (clip kullan)"\nassert h[:3] == [510.0, 1373.0, 671.0], f"İlk kutular farklı: {h[:3]}"\nassert len(ax.lines) == 1 and list(ax.lines[0].get_xdata()) == [15, 15], "15\'te bir dikey çizgi olmalı"\nassert ax.get_title() == "Kalkış gecikmesi dağılımı", "Başlık eksik/yanlış"\nassert ax.get_xlabel() == "Dakika" and ax.get_ylabel() == "Uçuş sayısı", "Eksen etiketleri eksik"\nassert ax.get_legend() is not None, "Lejant gösterilmeli"\nplt.close("all")\n',
        hints: ['clip(upper=180) kuyruğu son kutuya toplar.', 'axvline bir Line2D ekler; ax.lines içinde görünür.', 'Lejant için çizgiye label ver ve ax.legend() çağır.'],
        why: 'Uçuşların çoğu -15 ile 15 dakika arasında; uzun kuyruk son kutuda toplanıyor. Eşik çizgisi okuyucunun "zamanında" sınırını görmesini sağlar.'
      },
      {
        t: 'code',
        id: 'gorsellestirme-v2',
        stage: 'Rehberli',
        diff: 2,
        needs: ['pandas', 'matplotlib'],
        q: '<p><code>neden_cubuk()</code>: <code>hv_delays</code> tablosunda <code>reason</code> başına toplam <code>minutes</code> hesapla, <b>artan</b> sırala ve yatay çubuk (<code>barh</code>) çiz; böylece en büyük neden en üstte olsun. Başlık <code>"Rötar dakikası nedene göre"</code>, x etiketi <code>"Toplam dakika"</code>. <code>(fig, ax)</code> döndür.</p>',
        guide: ['veri.oku("kanat_havayollari", "hv_delays")', 'groupby("reason")["minutes"].sum().sort_values()', 'ax.barh(toplam.index, toplam.values)', 'Başlık ve x etiketi; return fig, ax.'],
        example: 'import matplotlib.pyplot as plt\nimport pandas as pd\ns = pd.Series({"a": 5, "b": 2, "c": 9}).sort_values()\nfig, ax = plt.subplots()\nax.barh(s.index, s.values)\nprint([p.get_width() for p in ax.patches])\nplt.close(fig)\n',
        start: 'import veri\nimport matplotlib.pyplot as plt\n\ndef neden_cubuk():\n    d = veri.oku("kanat_havayollari", "hv_delays")\n    fig, ax = plt.subplots()\n    # TODO: nedene göre topla, sırala, barh çiz, başlık ve etiket\n    return fig, ax\n',
        sol: 'import veri\nimport matplotlib.pyplot as plt\n\ndef neden_cubuk():\n    d = veri.oku("kanat_havayollari", "hv_delays")\n    toplam = d.groupby("reason")["minutes"].sum().sort_values()\n    fig, ax = plt.subplots()\n    ax.barh(toplam.index, toplam.values)\n    ax.set_title("Rötar dakikası nedene göre")\n    ax.set_xlabel("Toplam dakika")\n    return fig, ax\n',
        tests: 'fig, ax = neden_cubuk()\nw = [float(p.get_width()) for p in ax.patches]\nassert w == [10154.0, 10239.0, 10321.0, 17995.0, 23534.0], f"Çubuk genişlikleri artan sırada toplam dakikalar olmalı: {w}"\nassert ax.get_title() == "Rötar dakikası nedene göre", "Başlık eksik"\nassert ax.get_xlabel() == "Toplam dakika", "x etiketi eksik"\nplt.close("all")\n',
        hints: ['barh\'te ilk eleman en altta çizilir.', 'sort_values() varsayılan olarak artandır.'],
        why: 'Hava ve geç gelen uçak (zincirleme rötar), toplam rötar dakikasının yarısından fazlası. Sıralı yatay çubuk bunu ilk bakışta gösterir.'
      },
      {
        t: 'code',
        id: 'gorsellestirme-v3',
        stage: 'Kendin yaz',
        diff: 2,
        needs: ['pandas', 'matplotlib'],
        q: '<p><code>dakiklik_trendi()</code>: iptal olmayan uçuşlarda, planlanan kalkış ayına göre (<code>resample("MS")</code>) gecikmesi 15 dakikadan az olan uçuşların yüzdesini (1 basamak) hesapla. Bunu işaretli (<code>marker="o"</code>) çizgiyle çiz, 80\'de yatay hedef çizgisi (<code>axhline</code>) ekle, y eksenini 0–100 yap, başlık <code>"Aylık dakiklik (%)"</code>. <code>(fig, ax)</code> döndür. <code>ucuslar()</code> hazır.</p>',
        start: 'import veri\nimport matplotlib.pyplot as plt\n\ndef ucuslar():\n    f = veri.oku("kanat_havayollari", "hv_flights", parse_dates=["sched_dep", "actual_dep"])\n    f = f[f["status"] != "cancelled"].copy()\n    f["gecikme"] = (f["actual_dep"] - f["sched_dep"]).dt.total_seconds() / 60\n    return f\n\ndef dakiklik_trendi():\n    pass\n',
        sol: 'import veri\nimport matplotlib.pyplot as plt\n\ndef ucuslar():\n    f = veri.oku("kanat_havayollari", "hv_flights", parse_dates=["sched_dep", "actual_dep"])\n    f = f[f["status"] != "cancelled"].copy()\n    f["gecikme"] = (f["actual_dep"] - f["sched_dep"]).dt.total_seconds() / 60\n    return f\n\ndef dakiklik_trendi():\n    f = ucuslar()\n    oran = f.set_index("sched_dep")["gecikme"].lt(15).resample("MS").mean().mul(100).round(1)\n    fig, ax = plt.subplots()\n    ax.plot(oran.index, oran.values, marker="o")\n    ax.axhline(80, linestyle="--", color="gray")\n    ax.set_ylim(0, 100)\n    ax.set_title("Aylık dakiklik (%)")\n    return fig, ax\n',
        tests: 'fig, ax = dakiklik_trendi()\nassert len(ax.lines) == 2, "Bir veri çizgisi ve bir hedef çizgisi olmalı"\ny = [float(v) for v in ax.lines[0].get_ydata()]\nassert y == [68.3, 67.8, 59.1, 47.0], f"Aylık dakiklik farklı: {y}"\nassert list(ax.lines[1].get_ydata()) == [80, 80], "Hedef çizgisi 80\'de olmalı"\nassert ax.get_ylim() == (0.0, 100.0), "y ekseni 0-100 olmalı"\nassert ax.lines[0].get_marker() == "o", "Noktalar işaretli olmalı"\nassert ax.get_title() == "Aylık dakiklik (%)", "Başlık eksik"\nplt.close("all")\n',
        hints: ['Boolean serinin ortalaması oranı verir: lt(15).resample("MS").mean().', 'axhline(80) yatay çizgi ekler.'],
        why: 'Dakiklik Eylül\'de %68\'den Aralık\'ta %47\'ye düşüyor: kış hava koşulları ve yoğunluk. Y eksenini 0\'dan başlatmak düşüşü abartmadan gösterir.'
      },
      {
        t: 'code',
        id: 'gorsellestirme-v4',
        stage: 'Kendin yaz',
        diff: 2,
        needs: ['pandas', 'matplotlib'],
        q: '<p><code>saat_cubuk(esik=25)</code>: iptal olmayan uçuşlarda planlanan kalkış saatine göre ortalama gecikmeyi hesapla ve çubuk grafik çiz. x değerleri <code>"06"</code>, <code>"07"</code> gibi iki haneli saat metinleri olsun (aradaki boş saatler boşluk bırakmasın). Ortalaması <code>esik</code>\'ten büyük olan çubuklar <code>"tab:red"</code>, diğerleri <code>"tab:gray"</code> renkli olsun. <code>(fig, ax)</code> döndür. <code>ucuslar()</code> hazır.</p>',
        start: 'import veri\nimport matplotlib.pyplot as plt\n\ndef ucuslar():\n    f = veri.oku("kanat_havayollari", "hv_flights", parse_dates=["sched_dep", "actual_dep"])\n    f = f[f["status"] != "cancelled"].copy()\n    f["gecikme"] = (f["actual_dep"] - f["sched_dep"]).dt.total_seconds() / 60\n    return f\n\ndef saat_cubuk(esik=25):\n    pass\n',
        sol: 'import veri\nimport matplotlib.pyplot as plt\n\ndef ucuslar():\n    f = veri.oku("kanat_havayollari", "hv_flights", parse_dates=["sched_dep", "actual_dep"])\n    f = f[f["status"] != "cancelled"].copy()\n    f["gecikme"] = (f["actual_dep"] - f["sched_dep"]).dt.total_seconds() / 60\n    return f\n\ndef saat_cubuk(esik=25):\n    f = ucuslar()\n    ort = f.groupby(f["sched_dep"].dt.hour)["gecikme"].mean()\n    etiket = [f"{h:02d}" for h in ort.index]\n    renk = ["tab:red" if v > esik else "tab:gray" for v in ort.values]\n    fig, ax = plt.subplots()\n    ax.bar(etiket, ort.values, color=renk)\n    ax.set_title("Kalkış saatine göre ortalama gecikme")\n    return fig, ax\n',
        tests: 'from matplotlib.colors import to_rgba\nfig, ax = saat_cubuk()\np = ax.patches\nassert len(p) == 12, f"Uçuş olan 12 saat dilimi olmalı, {len(p)} geldi"\nkirmizi = [i for i, b in enumerate(p) if b.get_facecolor() == to_rgba("tab:red")]\nassert kirmizi == [3, 6, 8, 9, 10, 11], f"Kırmızı çubuklar 09, 14, 18, 19, 20, 21 saatleri olmalı: {kirmizi}"\nassert abs(p[0].get_height() - 19.7) < 0.06, "06:00 ortalaması yaklaşık 19.7 dk"\nfig2, ax2 = saat_cubuk(esik=30)\nassert sum(b.get_facecolor() == to_rgba("tab:red") for b in ax2.patches) == 3, "esik=30 ile 3 kırmızı çubuk olmalı"\nplt.close("all")\n',
        hints: ['Sayısal saatleri x\'e verirsen boş saatler boşluk olur; metin etiket kullan.', 'color parametresi her çubuk için bir renk listesi alabilir.'],
        why: 'Akşam dalgası (18–21) en çok geciken dilim; gerçek filolarda bunun bir nedeni gün boyu biriken zincirleme rötardır, ama Kanat\'ta uçak ataması rastgele olduğu için bu nedeni bu veriden kanıtlayamazsın. Vurgu rengi okuyucunun gözünü doğrudan soruna götürür.'
      },
      {
        t: 'code',
        id: 'gorsellestirme-v5',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 2,
        needs: ['pandas', 'matplotlib'],
        q: '<p>Hatayı bul ve düzelt. <code>iki_panel()</code> solda aylık uçuş sayısını (çubuk, başlık <code>"Aylık uçuş"</code>), sağda iptal sayısını (çubuk, başlık <code>"Aylık iptal"</code>) çizmeli. Ama sol panelin başlığı boş, sağdaki ise yanlış ("Aylık uçuş") çıkıyor.</p>',
        start: 'import veri\nimport matplotlib.pyplot as plt\n\ndef iki_panel():\n    f = veri.oku("kanat_havayollari", "hv_flights", parse_dates=["sched_dep"])\n    ay = f["sched_dep"].dt.strftime("%Y-%m")\n    ucus = f.groupby(ay).size()\n    iptal = f[f["status"] == "cancelled"].groupby(ay).size()\n    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 4))\n    ax1.bar(ucus.index, ucus.values)\n    ax2.bar(iptal.index, iptal.values)\n    plt.title("Aylık iptal")\n    plt.title("Aylık uçuş")\n    return fig, ax1, ax2\n',
        sol: 'import veri\nimport matplotlib.pyplot as plt\n\ndef iki_panel():\n    f = veri.oku("kanat_havayollari", "hv_flights", parse_dates=["sched_dep"])\n    ay = f["sched_dep"].dt.strftime("%Y-%m")\n    ucus = f.groupby(ay).size()\n    iptal = f[f["status"] == "cancelled"].groupby(ay).size()\n    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 4))\n    ax1.bar(ucus.index, ucus.values)\n    ax2.bar(iptal.index, iptal.values)\n    ax1.set_title("Aylık uçuş")\n    ax2.set_title("Aylık iptal")\n    return fig, ax1, ax2\n',
        tests: 'fig, ax1, ax2 = iki_panel()\nassert ax1.get_title() == "Aylık uçuş", f"Sol başlık: {ax1.get_title()!r}"\nassert ax2.get_title() == "Aylık iptal", f"Sağ başlık: {ax2.get_title()!r}"\nassert [int(p.get_height()) for p in ax1.patches] == [780, 805, 781, 807], "Aylık uçuş sayıları"\nassert int(sum(p.get_height() for p in ax2.patches)) == 62, "Toplam 62 iptal"\nplt.close("all")\n',
        hints: ['plt.title hangi Axes\'e yazar?', 'pyplot fonksiyonları "geçerli" (en son oluşturulan) Axes\'e gider; birden çok panelde ax.set_title kullan.'],
        why: 'plt.title her zaman geçerli Axes\'e, yani son oluşturulan sağ panele yazar; ikinci çağrı birinciyi ezer. Çok panelli grafiklerde her zaman nesne arayüzünü (ax.set_title) kullan.'
      },
      {
        t: 'code',
        id: 'gorsellestirme-v6',
        stage: 'Meydan okuma',
        diff: 3,
        needs: ['pandas', 'matplotlib'],
        q: '<p><code>rota_paneli()</code>: en çok uçuşu olan 4 rotayı (iptal olmayan uçuşlarda, <code>hv_routes</code> ile birleştirip <code>"ESB-IST"</code> gibi <code>origin-dest</code> adıyla; eşit sayıda ilk görülen değil, <code>value_counts</code> sırası) bul. 2×2 küçük çoklu grafik kur (<code>sharey=True</code>); her panelde o rotanın aylık dakiklik yüzdesini (1 basamak) çizgiyle çiz, panel başlığı rota adı olsun. <code>fig</code> döndür. <code>ucuslar()</code> hazır.</p>',
        start: 'import veri\nimport matplotlib.pyplot as plt\n\ndef ucuslar():\n    f = veri.oku("kanat_havayollari", "hv_flights", parse_dates=["sched_dep", "actual_dep"])\n    f = f[f["status"] != "cancelled"].copy()\n    f["gecikme"] = (f["actual_dep"] - f["sched_dep"]).dt.total_seconds() / 60\n    return f\n\ndef rota_paneli():\n    pass\n',
        sol: 'import veri\nimport matplotlib.pyplot as plt\n\ndef ucuslar():\n    f = veri.oku("kanat_havayollari", "hv_flights", parse_dates=["sched_dep", "actual_dep"])\n    f = f[f["status"] != "cancelled"].copy()\n    f["gecikme"] = (f["actual_dep"] - f["sched_dep"]).dt.total_seconds() / 60\n    return f\n\ndef rota_paneli():\n    f = ucuslar()\n    r = veri.oku("kanat_havayollari", "hv_routes")\n    f = f.merge(r, on="route_id")\n    f["rota"] = f["origin"] + "-" + f["dest"]\n    ilk4 = f["rota"].value_counts().head(4).index\n    fig, axes = plt.subplots(2, 2, figsize=(9, 6), sharey=True)\n    for ax, rota in zip(axes.flat, ilk4):\n        s = f[f["rota"] == rota].set_index("sched_dep")["gecikme"].lt(15).resample("MS").mean().mul(100).round(1)\n        ax.plot(s.index, s.values, marker="o")\n        ax.set_title(rota)\n    fig.tight_layout()\n    return fig\n',
        tests: 'fig = rota_paneli()\nax = fig.axes\nassert len(ax) == 4, "4 panel olmalı"\n_t = [a.get_title() for a in ax]\n# IST-ESB ile IST-AYT aynı sayıda uçuşa sahip; eşitlikte sıra pandas sürümüne göre değişebilir\nassert _t[0] == "ESB-IST" and set(_t[1:3]) == {"IST-ESB", "IST-AYT"} and _t[3] == "ADB-IST", f"Panel başlıkları (en çok uçuştan aza): {_t}"\nassert [float(v) for v in ax[_t.index("IST-AYT")].lines[0].get_ydata()] == [63.3, 45.2, 51.7, 38.7], "IST-AYT aylık dakiklik farklı"\nassert [float(v) for v in ax[0].lines[0].get_ydata()] == [76.7, 71.0, 80.0, 54.8], "ESB-IST aylık dakiklik farklı"\nassert ax[0].get_shared_y_axes().joined(ax[0], ax[3]), "Paneller y eksenini paylaşmalı (sharey=True)"\nplt.close("all")\n',
        hints: ['axes.flat 2×2 diziyi düz gezer.', 'Her rota için filtrele, sonra lt(15).resample("MS").mean().', 'sharey=True ile paneller aynı ölçekte kıyaslanır.'],
        why: 'Aynı ölçekli küçük çoklu grafik, rotalar arası farkı dürüstçe gösterir: Aralık\'ta İstanbul-Antalya ve İzmir-İstanbul dakikliği %39\'a iniyor.'
      }
    ],
    faq: [
      {
        q: 'Gecikmeleri neden 180 dakikada kırptık; veri kaybı olmuyor mu?',
        a: 'Kırpma yalnızca görselleştirme içindir: uzun rötarlar son kutuda sayılmaya devam eder, yalnızca eksende ayrı ayrı yer kaplamaz. Başlıkta ya da notta "180+ son kutuda" yazarak okuyucuyu bilgilendir; özet istatistikleri (ortalama, medyan) kırpılmamış veriden hesapla.'
      }
    ],
    mistakes: [
      {
        bad: 'fig, (ax1, ax2) = plt.subplots(1, 2)\nplt.title("Sol panel")',
        good: 'fig, (ax1, ax2) = plt.subplots(1, 2)\nax1.set_title("Sol panel")',
        why: 'plt.title son oluşturulan (geçerli) Axes\'e yazar; çok panelde başlık yanlış panele gider.'
      }
    ]
  }
);
})(window);
