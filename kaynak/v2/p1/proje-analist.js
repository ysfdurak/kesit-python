/* Kesit Python: Bitirme: proje-analist (Veri Analisti). uretec/p1 üretir, elle düzenleme. */
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push(Object.assign({ id: 'proje-analist', lv: 'orta' }, {
 "mod": "Orta bitirme",
 "min": 75,
 "needs": [
  "pandas",
  "matplotlib"
 ],
 "title": "Bitirme projesi: Kanat Havayolları gecikme analizi",
 "sum": "Gerçek uçuş verisini okur, sorunlarını denetler, temizler, zaman dilimi ve neden bazında analiz eder, grafiğini çizer, tampon senaryosunu hesaplar ve operasyon müdürüne gerekçeli bir iş kararı yazarsın.",
 "goals": [
  "Bir tabloyu okuyup eksiklerinin anlamını açıklayabilirim.",
  "Analiz tanımlarını koda ve rapora açıkça yazabilirim.",
  "Grupla, oranla, küçük grupları ele ve bire çok birleştirme tuzağından kaçınabilirim.",
  "Karar verdiren, yanıltmayan bir grafik çizebilirim.",
  "Sonucu varsayımı ve sınırıyla birlikte bir iş önerisine çevirebilirim."
 ],
 "body": "\n<h2>Proje: kış tarifesinde tampon nereye?</h2>\n<p>Kanat Havayolları operasyon müdürü soruyor: \"Eylülden beri geç kalkışlar artıyor. Kış tarifesinde bazı seferlerin planına 15 dakika tampon koyabilirim ama hepsine koyamam, uçağı boşa bekletmek pahalı. Nereye koyalım?\" Bu proje bir analistin gerçek işini baştan sona yaptırır: veriyi oku, sorunlarını anla, temizle, analiz et, grafiği çiz, kararı yaz.</p>\n<div class=\"tbl-wrap\"><table><tr><th>Adım</th><th>Soru</th><th>Çıktı</th></tr><tr><td>1. Oku ve denetle</td><td>Elimde ne var?</td><td><code>denetle</code></td></tr><tr><td>2. Temizle</td><td>Hangi satırlar ve tanımlar?</td><td><code>temizle</code></td></tr><tr><td>3. Analiz</td><td>Sorun nerede yoğun?</td><td><code>grup_ozeti</code>, <code>neden_ozeti</code></td></tr><tr><td>4. Grafik</td><td>Nasıl gösteririm?</td><td><code>grafik</code></td></tr><tr><td>5. Senaryo</td><td>Tampon ne kazandırır?</td><td><code>tampon_etkisi</code></td></tr><tr><td>6. Karar</td><td>Ne öneririm?</td><td><code>karar</code>, <code>rapor</code></td></tr></table></div>\n<h2>Önce veriyi tanı</h2>\n<p>Her analiz aynı soruyla başlar: bu tablo ne anlatıyor, nerede eksik? Burada boş değerlerin bir anlamı var: iptal seferde gerçek zaman olmaz, yön değiştiren seferde varış zamanı boştur.</p>\n<pre class=\"py\">import pandas as pd\nimport veri\n\nTARIHLER = [\"sched_dep\", \"sched_arr\", \"actual_dep\", \"actual_arr\"]\n\ndef oku():\n    ucus = veri.oku(\"kanat_havayollari\", \"hv_flights\", parse_dates=TARIHLER)\n    rotar = veri.oku(\"kanat_havayollari\", \"hv_delays\")\n    rota = veri.oku(\"kanat_havayollari\", \"hv_routes\")\n    return ucus, rotar, rota\n\nucus, rotar, rota = oku()\nprint(len(ucus), \"sefer\", ucus[\"status\"].value_counts().to_dict())\nprint(ucus[[\"actual_dep\", \"actual_arr\"]].isna().sum().to_dict())\nprint(len(rotar), \"rötar satırı,\", rotar[\"flight_id\"].nunique(), \"sefer\")</pre>\n<p>Son satır bir tuzağı gösteriyor: 1.350 rötar satırı 1.228 seferi anlatıyor, çünkü bir seferin birden çok nedeni olabilir.</p>\n<h2>Tanımları yaz</h2>\n<p>Analizde en çok tartışma tanımlardan çıkar. Bu projenin tanımları: geç kalkış, planlanandan 15 dakikayı aşan kalkıştır; iptaller gecikme hesabına girmez, ayrı sayılır; dilimler sabah (12'den önce), öğle (12-18), akşam (18 ve sonrası). Tanımı değiştirirsen sonuç değişir, bu yüzden raporda da yazılır.</p>\n<h2>Sonuç nereye işaret ediyor?</h2>\n<p>İptaller çıkınca 3.111 sefer kalıyor ve %37,9 geç kalkış var. Dilimlere ayırınca fark görünür:</p>\n<div class=\"tbl-wrap\"><table><tr><th>Dilim</th><th>Sefer</th><th>Geç oranı</th><th>Medyan gecikme</th></tr><tr><td>akşam</td><td>1.096</td><td>%47,4</td><td>14,0 dk</td></tr><tr><td>sabah</td><td>1.260</td><td>%33,0</td><td>5,0 dk</td></tr><tr><td>öğle</td><td>755</td><td>%32,2</td><td>5,0 dk</td></tr></table></div>\n<p>Aylara bakınca oran Eylül'de %29,8 iken Aralık'ta %51,0. Neden tarafında en çok dakikayı <b>hava</b> kaybettiriyor (%32,6). Bu önemli bir uyarıdır: tampon hava koşulunu çözmez, yalnız yolcunun gördüğü gecikmeyi azaltır. Rapora bunu yazmak senin işin.</p>\n<div class=\"note\"><b>Veri notu</b>Bu veri kurgusaldır ve bilinen sınırları Veri setleri sayfasında yazar; örneğin geç gelen uçak nedeninin nedensellik gücü zayıftır. Yöntemi öğren, sonucu gerçek bir havayoluna genelleme.</div>\n<h2>Grafik karar için çizilir</h2>\n<pre class=\"py\">import matplotlib.pyplot as plt\nimport pandas as pd\nozet = pd.DataFrame({'dilim': ['akşam', 'sabah', 'öğle'], 'gec_orani': [47.4, 33.0, 32.2]})\nfig, ax = plt.subplots(figsize=(6, 3.5))\nax.bar(ozet[\"dilim\"], ozet[\"gec_orani\"], color=\"#3b6ea8\")\nax.set_title(\"Zaman dilimine göre geç kalkış oranı\")\nax.set_ylabel(\"Geç kalkış oranı (%)\")\nax.set_ylim(0, None)\nplt.show()</pre>\n<p>Başlık ne gösterdiğini söyler, eksen birimini yazar, sütun ekseni sıfırdan başlar. Tek bir renk yeter; karar sütunların yüksekliğindedir.</p>\n<h2>Kararı yaz</h2>\n<p>Hesabın sonunda elinde bir öneri olmalı. Akşam dilimine 15 dakika tampon, tüm seferlerde geç kalkış oranını %37,9 seviyesinden %27,9 seviyesine indirirdi; 310 sefer geç sayılmaktan çıkardı. Bu varsayımlı bir hesaptır, ölçüm değildir: rötarın kendisi değişmez varsayıldı. İyi bir karar notu bunu saklamaz, küçük bir deneme önerir.</p>\n<section class=\"deep\"><span class=\"eyebrow\">Uzmanlaş</span><h3>Projeyi portföye taşı</h3><p>Aynı akışı kendi bilgisayarında bir defterde yap ve sonucu tek sayfalık nota dök. Rotaları ekle (en az 50 sefer eşiğiyle), <code>hv_bookings</code> ile geciken yolcu sayısını bağla, tamponun maliyetine bir varsayım koy. Görüşmede en çok şunu sorarlar: \"Bu sonuca neden güveniyorsun, ne yanlış olabilir?\" Cevabın burada: tanımlar, çıkarılan satırlar, bire çok tuzağı, senaryo varsayımı.</p></section>\n",
 "ex": [
  {
   "t": "mc",
   "stage": "Isınma",
   "q": "hv_flights tablosunda iptal seferlerin gerçek kalkış zamanı boş. Ortalama gecikmeyi hesaplarken ne yaparsın?",
   "o": [
    "Boşlara 0 yazarım, sefer zamanında kalkmış sayılır",
    "İptalleri ayrı sayar, hesaptan çıkarır, sayısını yazarım",
    "Tablonun ortalamasını olduğu gibi alırım, pandas boşları halleder",
    "İptalleri sessizce silerim, raporda hiç anmam, tablo temiz görünür"
   ],
   "a": 1,
   "why": "İptal bir gecikme değil, ayrı bir sonuçtur. 0 yazmak ortalamayı iyi gösterir, sessizce silmek de okura yalan söyler. Çıkardığın satır sayısını yazmak raporu denetlenebilir kılar."
  },
  {
   "t": "mc",
   "stage": "Isınma",
   "q": "Sefer tablosunu rötar tablosuyla birleştirdin, satır sayısı arttı. İlk şüphen ne olmalı?",
   "o": [
    "pandas hatası, kernel yeniden başlatılmalı",
    "Tarih sütunları yanlış okundu",
    "Bir seferin birden çok rötar nedeni var",
    "Rötar tablosu daha yeni bir sürümden geliyor"
   ],
   "a": 2,
   "why": "Bire çok birleştirme satırları çoğaltır. Yolcu gibi sefer düzeyindeki bir değeri bu tablodan toplarsan aynı yolcuyu birkaç kez sayarsın."
  },
  {
   "t": "mc",
   "stage": "Isınma",
   "q": "Yöneticiye \"akşam tamponu geç kalkışı düşürür\" diyeceksin. En dürüst cümle hangisi?",
   "o": [
    "Varsayımla bu kadar düşerdi; küçük bir deneme öneririm",
    "Tampon koyarsak geç kalkış kesinlikle bu kadar düşer",
    "Veri bunu kanıtladı, ayrıca denemeye hiç gerek yok",
    "Sonuç belirsiz olduğu için hiçbir öneri yapamam"
   ],
   "a": 0,
   "why": "Hesap bir senaryodur, ölçüm değildir. Varsayımı söyleyip küçük denemeyle ölçmeyi önermek hem karar verdirir hem güveni korur."
  },
  {
   "t": "predict",
   "stage": "Kodu oku",
   "q": "Bire çok birleştirme. Bu kod ne yazdırır?",
   "code": "import pandas as pd\nsefer = pd.DataFrame({\"id\": [1, 2], \"pax\": [100, 50]})\nneden = pd.DataFrame({\"id\": [1, 1, 2], \"neden\": [\"hava\", \"teknik\", \"hava\"]})\nm = sefer.merge(neden, on=\"id\")\nprint(len(m), m[\"pax\"].sum(), sefer[\"pax\"].sum())\n",
   "o": [
    "2 150 150",
    "3 250 150",
    "3 150 150",
    "3 200 200"
   ],
   "a": 1,
   "why": "Birinci seferin iki nedeni olduğu için satırı iki kez görünür; 100 yolcu iki kez toplanır: 250. Gerçek toplam 150."
  },
  {
   "t": "predict",
   "stage": "Kodu oku",
   "q": "Aykırı değer ve özet ölçü. Bu kod ne yazdırır?",
   "code": "import pandas as pd\ng = pd.Series([1, 2, 3, 4, 200])\nprint(g.mean(), g.median())\n",
   "o": [
    "3.0 42.0",
    "42.0 42.0",
    "42.0 3.0",
    "3.0 3.0"
   ],
   "a": 2,
   "why": "Tek bir uzun rötar ortalamayı 42 dakikaya çeker, medyan 3 kalır. Bu yüzden özet tabloda ikisini ve oranı birlikte verdik."
  },
  {
   "t": "predict",
   "stage": "Kodu oku",
   "q": "Küçük örneklem. Bu kod ne yazdırır?",
   "code": "import pandas as pd\nt = pd.DataFrame({\"rota\": [\"A\"] * 2 + [\"B\"] * 100, \"gec\": [True, False] + [True] * 40 + [False] * 60})\no = t.groupby(\"rota\")[\"gec\"].agg([\"size\", \"mean\"])\nprint(o[o[\"size\"] >= 50].index.tolist(), o[\"mean\"].idxmax())\n",
   "o": [
    "['A'] B",
    "['B'] B",
    "['B'] A",
    "['A', 'B'] A"
   ],
   "a": 2,
   "why": "A rotasının oranı %50 ile en yüksek görünür ama yalnız 2 sefere dayanır. En az sefer eşiği bu sahte birinciliği eler."
  },
  {
   "t": "code",
   "id": "proje-analist-1",
   "stage": "Rehberli",
   "diff": 1,
   "needs": [
    "pandas"
   ],
   "q": "<p><b>Adım 1: oku ve denetle.</b> <code>oku()</code> hazır. <code>denetle(ucus)</code> yaz ve şu tam sayıları içeren sözlük döndür: <code>satir</code>, <code>tekil_sefer</code> (farklı <code>flight_id</code>), <code>iptal</code> (<code>status == \"cancelled\"</code>), <code>yon_degisen</code> (<code>\"diverted\"</code>), <code>bos_kalkis</code> (<code>actual_dep</code> boş), <code>bos_varis</code> (<code>actual_arr</code> boş).</p>",
   "guide": [
    "len(ucus) satır sayısını verir.",
    "ucus[\"flight_id\"].nunique() farklı değerleri sayar.",
    "(ucus[\"status\"] == \"cancelled\").sum() koşulu sayar.",
    "isna().sum() boşları sayar; int() ile sar."
   ],
   "start": "import pandas as pd\nimport veri\n\nTARIHLER = [\"sched_dep\", \"sched_arr\", \"actual_dep\", \"actual_arr\"]\n\ndef oku():\n    ucus = veri.oku(\"kanat_havayollari\", \"hv_flights\", parse_dates=TARIHLER)\n    rotar = veri.oku(\"kanat_havayollari\", \"hv_delays\")\n    rota = veri.oku(\"kanat_havayollari\", \"hv_routes\")\n    return ucus, rotar, rota\n\ndef denetle(ucus):\n    # sözlük döndür\n    pass\n",
   "sol": "import pandas as pd\nimport veri\n\nTARIHLER = [\"sched_dep\", \"sched_arr\", \"actual_dep\", \"actual_arr\"]\n\ndef oku():\n    ucus = veri.oku(\"kanat_havayollari\", \"hv_flights\", parse_dates=TARIHLER)\n    rotar = veri.oku(\"kanat_havayollari\", \"hv_delays\")\n    rota = veri.oku(\"kanat_havayollari\", \"hv_routes\")\n    return ucus, rotar, rota\n\ndef denetle(ucus):\n    return {\n        \"satir\": len(ucus),\n        \"tekil_sefer\": int(ucus[\"flight_id\"].nunique()),\n        \"iptal\": int((ucus[\"status\"] == \"cancelled\").sum()),\n        \"yon_degisen\": int((ucus[\"status\"] == \"diverted\").sum()),\n        \"bos_kalkis\": int(ucus[\"actual_dep\"].isna().sum()),\n        \"bos_varis\": int(ucus[\"actual_arr\"].isna().sum()),\n    }\n",
   "tests": "_d = denetle(oku()[0])\nassert _d == {'satir': 3173, 'tekil_sefer': 3173, 'iptal': 62, 'yon_degisen': 9, 'bos_kalkis': 62, 'bos_varis': 71}, \"Sayılar farklı: \" + repr(_d)\nassert all(type(v) is int for v in _d.values()), \"Değerler int olmalı\"\n_x = pd.DataFrame({\"flight_id\": [1, 1, 2], \"status\": [\"cancelled\", \"landed\", \"diverted\"], \"actual_dep\": [None, \"a\", \"b\"], \"actual_arr\": [None, None, \"c\"]})\nassert denetle(_x) == {\"satir\": 3, \"tekil_sefer\": 2, \"iptal\": 1, \"yon_degisen\": 1, \"bos_kalkis\": 1, \"bos_varis\": 2}, \"Sabit değer değil, hesap olmalı\"\n",
   "hints": [
    "Önce kod editöründe ucus.head() ve ucus.isna().sum() ile tabloya bak."
   ],
   "why": "62 boş kalkış tam olarak 62 iptale, 71 boş varış da iptal ile yön değiştiren seferlerin toplamına eşit. Boşlar veri hatası değil, sürecin sonucudur; bunu bilmeden \"boşları doldurmak\" yanlış olurdu."
  },
  {
   "t": "code",
   "id": "proje-analist-2",
   "stage": "Rehberli",
   "diff": 2,
   "needs": [
    "pandas"
   ],
   "q": "<p><b>Adım 2: temizle.</b> <code>temizle(ucus, rota)</code> yaz; girdiyi değiştirme. İptalleri çıkar, <code>rota</code> tablosunu <code>route_id</code> ile bağla ve şu sütunları ekle:</p><ul><li><code>rota</code>: <code>\"IST-ESB\"</code> biçiminde</li><li><code>gec_dk</code>: gerçek kalkış eksi planlanan kalkış, dakika (ondalıklı olabilir)</li><li><code>gec</code>: <code>gec_dk</code> 15'ten büyükse <code>True</code></li><li><code>ay</code>: <code>\"2024-09\"</code> biçiminde planlanan ay</li><li><code>dilim</code>: planlanan saat 12'den küçükse <code>\"sabah\"</code>, 18'den küçükse <code>\"öğle\"</code>, değilse <code>\"akşam\"</code></li></ul>",
   "guide": [
    "İptal filtresinden sonra .copy() al.",
    "t[\"actual_dep\"] - t[\"sched_dep\"] süre verir; .dt.total_seconds() / 60 dakikaya çevirir.",
    "t[\"sched_dep\"].dt.hour.map(dilim_bul) ile dilimi bul."
   ],
   "start": "import pandas as pd\nimport veri\n\nTARIHLER = [\"sched_dep\", \"sched_arr\", \"actual_dep\", \"actual_arr\"]\n\ndef oku():\n    ucus = veri.oku(\"kanat_havayollari\", \"hv_flights\", parse_dates=TARIHLER)\n    rotar = veri.oku(\"kanat_havayollari\", \"hv_delays\")\n    rota = veri.oku(\"kanat_havayollari\", \"hv_routes\")\n    return ucus, rotar, rota\n\ndef denetle(ucus):\n    return {\n        \"satir\": len(ucus),\n        \"tekil_sefer\": int(ucus[\"flight_id\"].nunique()),\n        \"iptal\": int((ucus[\"status\"] == \"cancelled\").sum()),\n        \"yon_degisen\": int((ucus[\"status\"] == \"diverted\").sum()),\n        \"bos_kalkis\": int(ucus[\"actual_dep\"].isna().sum()),\n        \"bos_varis\": int(ucus[\"actual_arr\"].isna().sum()),\n    }\n\ndef dilim_bul(saat):\n    pass\n\ndef temizle(ucus, rota):\n    pass\n",
   "sol": "import pandas as pd\nimport veri\n\nTARIHLER = [\"sched_dep\", \"sched_arr\", \"actual_dep\", \"actual_arr\"]\n\ndef oku():\n    ucus = veri.oku(\"kanat_havayollari\", \"hv_flights\", parse_dates=TARIHLER)\n    rotar = veri.oku(\"kanat_havayollari\", \"hv_delays\")\n    rota = veri.oku(\"kanat_havayollari\", \"hv_routes\")\n    return ucus, rotar, rota\n\ndef denetle(ucus):\n    return {\n        \"satir\": len(ucus),\n        \"tekil_sefer\": int(ucus[\"flight_id\"].nunique()),\n        \"iptal\": int((ucus[\"status\"] == \"cancelled\").sum()),\n        \"yon_degisen\": int((ucus[\"status\"] == \"diverted\").sum()),\n        \"bos_kalkis\": int(ucus[\"actual_dep\"].isna().sum()),\n        \"bos_varis\": int(ucus[\"actual_arr\"].isna().sum()),\n    }\n\ndef dilim_bul(saat):\n    if saat < 12:\n        return \"sabah\"\n    if saat < 18:\n        return \"öğle\"\n    return \"akşam\"\n\ndef temizle(ucus, rota):\n    t = ucus[ucus[\"status\"] != \"cancelled\"].copy()\n    t = t.merge(rota[[\"route_id\", \"origin\", \"dest\"]], on=\"route_id\", how=\"left\")\n    t[\"rota\"] = t[\"origin\"] + \"-\" + t[\"dest\"]\n    t[\"gec_dk\"] = (t[\"actual_dep\"] - t[\"sched_dep\"]).dt.total_seconds() / 60\n    t[\"gec\"] = t[\"gec_dk\"] > 15\n    t[\"ay\"] = t[\"sched_dep\"].dt.strftime(\"%Y-%m\")\n    t[\"dilim\"] = t[\"sched_dep\"].dt.hour.map(dilim_bul)\n    return t\n",
   "tests": "_u, _r, _ro = oku()\n_b = len(_u)\n_t = temizle(_u, _ro)\nassert len(_u) == _b and \"gec_dk\" not in _u.columns, \"Girdiyi değiştirme\"\nassert len(_t) == 3111, \"İptaller çıkınca 3111 sefer kalmalı: \" + str(len(_t))\nassert (_t[\"status\"] != \"cancelled\").all()\nassert _t[\"gec_dk\"].isna().sum() == 0, \"Temiz tabloda boş gecikme kalmamalı\"\nassert round(_t[\"gec\"].mean() * 100, 1) == 37.9, \"Geç kalkış oranı %37.9 olmalı: \" + str(round(_t[\"gec\"].mean() * 100, 1))\nassert _t.loc[_t[\"flight_id\"] == 1, \"rota\"].iloc[0] == \"IST-ESB\", \"rota biçimi IST-ESB\"\nassert _t.loc[_t[\"flight_id\"] == 1, \"gec_dk\"].iloc[0] == 3, \"Birinci seferin gecikmesi 3 dakika\"\nassert _t.loc[_t[\"flight_id\"] == 1, \"ay\"].iloc[0] == \"2024-09\"\nassert set(_t[\"dilim\"]) == {\"sabah\", \"öğle\", \"akşam\"}, \"Üç dilim olmalı\"\nassert dilim_bul(11) == \"sabah\" and dilim_bul(12) == \"öğle\" and dilim_bul(17) == \"öğle\" and dilim_bul(18) == \"akşam\", \"Sınır saatleri yanlış\"\nassert _t[\"dilim\"].value_counts().to_dict() == {'sabah': 1260, 'akşam': 1096, 'öğle': 755}, \"Dilim sayıları farklı\"\n",
   "hints": [
    "Yön değiştiren seferlerin kalkış zamanı vardır; onları çıkarma.",
    "15 dakikada tam kalkan sefer geç sayılmaz: &gt; 15."
   ],
   "why": "Tanımları koda yazdın: \"geç\" 15 dakikayı aşan kalkıştır. Havacılıkta yaygın bir eşiktir; farklı bir eşik seçersen sonuçlar değişir, bu yüzden tanımı rapora da yazacaksın."
  },
  {
   "t": "code",
   "id": "proje-analist-3",
   "stage": "Kendin yaz",
   "diff": 2,
   "needs": [
    "pandas"
   ],
   "q": "<p><b>Adım 3: analiz et.</b> İki fonksiyon yaz.</p><p><code>grup_ozeti(t, sutun, en_az=1)</code>: <code>sutun</code>a göre grupla; <code>ucus</code> (satır sayısı), <code>gec_orani</code> (<code>gec</code> ortalaması × 100, 1 ondalık), <code>medyan_gec</code> (<code>gec_dk</code> medyanı). <code>ucus &lt; en_az</code> olan grupları at. Oran azalan, eşitlikte <code>sutun</code> artan sıralı, indeksi sıfırlanmış DataFrame döndür.</p><p><code>neden_ozeti(rotar)</code>: <code>reason</code> başına <code>sefer</code> (farklı sefer), <code>dakika</code> (toplam), <code>pay</code> (dakika payı, %, 1 ondalık). Dakika azalan sıralı döndür.</p>",
   "start": "import pandas as pd\nimport veri\n\nTARIHLER = [\"sched_dep\", \"sched_arr\", \"actual_dep\", \"actual_arr\"]\n\ndef oku():\n    ucus = veri.oku(\"kanat_havayollari\", \"hv_flights\", parse_dates=TARIHLER)\n    rotar = veri.oku(\"kanat_havayollari\", \"hv_delays\")\n    rota = veri.oku(\"kanat_havayollari\", \"hv_routes\")\n    return ucus, rotar, rota\n\ndef denetle(ucus):\n    return {\n        \"satir\": len(ucus),\n        \"tekil_sefer\": int(ucus[\"flight_id\"].nunique()),\n        \"iptal\": int((ucus[\"status\"] == \"cancelled\").sum()),\n        \"yon_degisen\": int((ucus[\"status\"] == \"diverted\").sum()),\n        \"bos_kalkis\": int(ucus[\"actual_dep\"].isna().sum()),\n        \"bos_varis\": int(ucus[\"actual_arr\"].isna().sum()),\n    }\n\ndef dilim_bul(saat):\n    if saat < 12:\n        return \"sabah\"\n    if saat < 18:\n        return \"öğle\"\n    return \"akşam\"\n\ndef temizle(ucus, rota):\n    t = ucus[ucus[\"status\"] != \"cancelled\"].copy()\n    t = t.merge(rota[[\"route_id\", \"origin\", \"dest\"]], on=\"route_id\", how=\"left\")\n    t[\"rota\"] = t[\"origin\"] + \"-\" + t[\"dest\"]\n    t[\"gec_dk\"] = (t[\"actual_dep\"] - t[\"sched_dep\"]).dt.total_seconds() / 60\n    t[\"gec\"] = t[\"gec_dk\"] > 15\n    t[\"ay\"] = t[\"sched_dep\"].dt.strftime(\"%Y-%m\")\n    t[\"dilim\"] = t[\"sched_dep\"].dt.hour.map(dilim_bul)\n    return t\n\ndef grup_ozeti(t, sutun, en_az=1):\n    pass\n\ndef neden_ozeti(rotar):\n    pass\n",
   "sol": "import pandas as pd\nimport veri\n\nTARIHLER = [\"sched_dep\", \"sched_arr\", \"actual_dep\", \"actual_arr\"]\n\ndef oku():\n    ucus = veri.oku(\"kanat_havayollari\", \"hv_flights\", parse_dates=TARIHLER)\n    rotar = veri.oku(\"kanat_havayollari\", \"hv_delays\")\n    rota = veri.oku(\"kanat_havayollari\", \"hv_routes\")\n    return ucus, rotar, rota\n\ndef denetle(ucus):\n    return {\n        \"satir\": len(ucus),\n        \"tekil_sefer\": int(ucus[\"flight_id\"].nunique()),\n        \"iptal\": int((ucus[\"status\"] == \"cancelled\").sum()),\n        \"yon_degisen\": int((ucus[\"status\"] == \"diverted\").sum()),\n        \"bos_kalkis\": int(ucus[\"actual_dep\"].isna().sum()),\n        \"bos_varis\": int(ucus[\"actual_arr\"].isna().sum()),\n    }\n\ndef dilim_bul(saat):\n    if saat < 12:\n        return \"sabah\"\n    if saat < 18:\n        return \"öğle\"\n    return \"akşam\"\n\ndef temizle(ucus, rota):\n    t = ucus[ucus[\"status\"] != \"cancelled\"].copy()\n    t = t.merge(rota[[\"route_id\", \"origin\", \"dest\"]], on=\"route_id\", how=\"left\")\n    t[\"rota\"] = t[\"origin\"] + \"-\" + t[\"dest\"]\n    t[\"gec_dk\"] = (t[\"actual_dep\"] - t[\"sched_dep\"]).dt.total_seconds() / 60\n    t[\"gec\"] = t[\"gec_dk\"] > 15\n    t[\"ay\"] = t[\"sched_dep\"].dt.strftime(\"%Y-%m\")\n    t[\"dilim\"] = t[\"sched_dep\"].dt.hour.map(dilim_bul)\n    return t\n\ndef grup_ozeti(t, sutun, en_az=1):\n    o = t.groupby(sutun).agg(ucus=(\"gec\", \"size\"), gec_orani=(\"gec\", \"mean\"), medyan_gec=(\"gec_dk\", \"median\"))\n    o = o[o[\"ucus\"] >= en_az].copy()\n    o[\"gec_orani\"] = (o[\"gec_orani\"] * 100).round(1)\n    o = o.reset_index().sort_values([\"gec_orani\", sutun], ascending=[False, True]).reset_index(drop=True)\n    return o\n\ndef neden_ozeti(rotar):\n    o = rotar.groupby(\"reason\").agg(sefer=(\"flight_id\", \"nunique\"), dakika=(\"minutes\", \"sum\")).reset_index()\n    o[\"pay\"] = (o[\"dakika\"] / o[\"dakika\"].sum() * 100).round(1)\n    return o.sort_values(\"dakika\", ascending=False).reset_index(drop=True)\n",
   "tests": "_u, _r, _ro = oku()\n_t = temizle(_u, _ro)\n_o = grup_ozeti(_t, \"dilim\")\nassert list(_o.columns) == [\"dilim\", \"ucus\", \"gec_orani\", \"medyan_gec\"], \"Sütunlar: \" + repr(list(_o.columns))\nassert _o.to_dict(\"list\") == {'dilim': ['akşam', 'sabah', 'öğle'], 'ucus': [1096, 1260, 755], 'gec_orani': [47.4, 33.0, 32.2], 'medyan_gec': [14.0, 5.0, 5.0]}, \"Dilim özeti farklı: \" + repr(_o.to_dict(\"list\"))\n_n = neden_ozeti(_r)\nassert _n.to_dict(\"list\") == {'reason': ['hava', 'gec_gelen_ucak', 'teknik', 'yer_hizmetleri', 'hava_trafik'], 'sefer': [381, 342, 219, 204, 204], 'dakika': [23534, 17995, 10321, 10239, 10154], 'pay': [32.6, 24.9, 14.3, 14.2, 14.1]}, \"Neden özeti farklı: \" + repr(_n.to_dict(\"list\"))\n_ro2 = grup_ozeti(_t, \"rota\", en_az=50)\nassert (_ro2[\"ucus\"] >= 50).all() and len(_ro2) == 40, \"En az 50 seferli rota sayısı 40\"\nassert _ro2.iloc[0][\"rota\"] == 'FRA-IST' and _ro2.iloc[0][\"gec_orani\"] == 51.8, \"En geç rota farklı\"\nassert list(_ro2.index) == list(range(len(_ro2))), \"İndeks sıfırlanmalı\"\nassert grup_ozeti(_t, \"ay\").set_index(\"ay\")[\"gec_orani\"].to_dict() == {'2024-12': 51.0, '2024-11': 39.3, '2024-10': 31.5, '2024-09': 29.8}, \"Aylık oranlar farklı\"\n",
   "hints": [
    "groupby(sutun).agg(ucus=(\"gec\", \"size\"), gec_orani=(\"gec\", \"mean\"), medyan_gec=(\"gec_dk\", \"median\"))",
    "sort_values([..., ...], ascending=[False, True]).reset_index(drop=True)"
   ],
   "why": "hv_delays bir seferde birden çok neden taşır, bu yüzden <code>nunique</code> kullandın. Oran tek başına yanıltabilir; sefer sayısını yanında tutmak küçük grupları görünür kılar."
  },
  {
   "t": "code",
   "id": "proje-analist-4",
   "stage": "Kendin yaz",
   "diff": 2,
   "needs": [
    "pandas",
    "matplotlib"
   ],
   "q": "<p><b>Adım 4: grafik.</b> <code>grafik(ozet)</code> yaz. Dilim özetini sütun grafiğiyle çiz ve <code>fig</code> döndür: x ekseni <code>dilim</code>, yükseklik <code>gec_orani</code>; başlık <code>Zaman dilimine göre geç kalkış oranı</code>; y ekseni <code>Geç kalkış oranı (%)</code>; x ekseni <code>Planlanan kalkış dilimi</code>; y ekseni 0'dan başlasın.</p>",
   "start": "import pandas as pd\nimport veri\n\nTARIHLER = [\"sched_dep\", \"sched_arr\", \"actual_dep\", \"actual_arr\"]\n\ndef oku():\n    ucus = veri.oku(\"kanat_havayollari\", \"hv_flights\", parse_dates=TARIHLER)\n    rotar = veri.oku(\"kanat_havayollari\", \"hv_delays\")\n    rota = veri.oku(\"kanat_havayollari\", \"hv_routes\")\n    return ucus, rotar, rota\n\ndef denetle(ucus):\n    return {\n        \"satir\": len(ucus),\n        \"tekil_sefer\": int(ucus[\"flight_id\"].nunique()),\n        \"iptal\": int((ucus[\"status\"] == \"cancelled\").sum()),\n        \"yon_degisen\": int((ucus[\"status\"] == \"diverted\").sum()),\n        \"bos_kalkis\": int(ucus[\"actual_dep\"].isna().sum()),\n        \"bos_varis\": int(ucus[\"actual_arr\"].isna().sum()),\n    }\n\ndef dilim_bul(saat):\n    if saat < 12:\n        return \"sabah\"\n    if saat < 18:\n        return \"öğle\"\n    return \"akşam\"\n\ndef temizle(ucus, rota):\n    t = ucus[ucus[\"status\"] != \"cancelled\"].copy()\n    t = t.merge(rota[[\"route_id\", \"origin\", \"dest\"]], on=\"route_id\", how=\"left\")\n    t[\"rota\"] = t[\"origin\"] + \"-\" + t[\"dest\"]\n    t[\"gec_dk\"] = (t[\"actual_dep\"] - t[\"sched_dep\"]).dt.total_seconds() / 60\n    t[\"gec\"] = t[\"gec_dk\"] > 15\n    t[\"ay\"] = t[\"sched_dep\"].dt.strftime(\"%Y-%m\")\n    t[\"dilim\"] = t[\"sched_dep\"].dt.hour.map(dilim_bul)\n    return t\n\ndef grup_ozeti(t, sutun, en_az=1):\n    o = t.groupby(sutun).agg(ucus=(\"gec\", \"size\"), gec_orani=(\"gec\", \"mean\"), medyan_gec=(\"gec_dk\", \"median\"))\n    o = o[o[\"ucus\"] >= en_az].copy()\n    o[\"gec_orani\"] = (o[\"gec_orani\"] * 100).round(1)\n    o = o.reset_index().sort_values([\"gec_orani\", sutun], ascending=[False, True]).reset_index(drop=True)\n    return o\n\ndef neden_ozeti(rotar):\n    o = rotar.groupby(\"reason\").agg(sefer=(\"flight_id\", \"nunique\"), dakika=(\"minutes\", \"sum\")).reset_index()\n    o[\"pay\"] = (o[\"dakika\"] / o[\"dakika\"].sum() * 100).round(1)\n    return o.sort_values(\"dakika\", ascending=False).reset_index(drop=True)\n\nimport matplotlib.pyplot as plt\n\ndef grafik(ozet):\n    pass\n\nfig = grafik(grup_ozeti(temizle(oku()[0], oku()[2]), \"dilim\"))\n",
   "sol": "import pandas as pd\nimport veri\n\nTARIHLER = [\"sched_dep\", \"sched_arr\", \"actual_dep\", \"actual_arr\"]\n\ndef oku():\n    ucus = veri.oku(\"kanat_havayollari\", \"hv_flights\", parse_dates=TARIHLER)\n    rotar = veri.oku(\"kanat_havayollari\", \"hv_delays\")\n    rota = veri.oku(\"kanat_havayollari\", \"hv_routes\")\n    return ucus, rotar, rota\n\ndef denetle(ucus):\n    return {\n        \"satir\": len(ucus),\n        \"tekil_sefer\": int(ucus[\"flight_id\"].nunique()),\n        \"iptal\": int((ucus[\"status\"] == \"cancelled\").sum()),\n        \"yon_degisen\": int((ucus[\"status\"] == \"diverted\").sum()),\n        \"bos_kalkis\": int(ucus[\"actual_dep\"].isna().sum()),\n        \"bos_varis\": int(ucus[\"actual_arr\"].isna().sum()),\n    }\n\ndef dilim_bul(saat):\n    if saat < 12:\n        return \"sabah\"\n    if saat < 18:\n        return \"öğle\"\n    return \"akşam\"\n\ndef temizle(ucus, rota):\n    t = ucus[ucus[\"status\"] != \"cancelled\"].copy()\n    t = t.merge(rota[[\"route_id\", \"origin\", \"dest\"]], on=\"route_id\", how=\"left\")\n    t[\"rota\"] = t[\"origin\"] + \"-\" + t[\"dest\"]\n    t[\"gec_dk\"] = (t[\"actual_dep\"] - t[\"sched_dep\"]).dt.total_seconds() / 60\n    t[\"gec\"] = t[\"gec_dk\"] > 15\n    t[\"ay\"] = t[\"sched_dep\"].dt.strftime(\"%Y-%m\")\n    t[\"dilim\"] = t[\"sched_dep\"].dt.hour.map(dilim_bul)\n    return t\n\ndef grup_ozeti(t, sutun, en_az=1):\n    o = t.groupby(sutun).agg(ucus=(\"gec\", \"size\"), gec_orani=(\"gec\", \"mean\"), medyan_gec=(\"gec_dk\", \"median\"))\n    o = o[o[\"ucus\"] >= en_az].copy()\n    o[\"gec_orani\"] = (o[\"gec_orani\"] * 100).round(1)\n    o = o.reset_index().sort_values([\"gec_orani\", sutun], ascending=[False, True]).reset_index(drop=True)\n    return o\n\ndef neden_ozeti(rotar):\n    o = rotar.groupby(\"reason\").agg(sefer=(\"flight_id\", \"nunique\"), dakika=(\"minutes\", \"sum\")).reset_index()\n    o[\"pay\"] = (o[\"dakika\"] / o[\"dakika\"].sum() * 100).round(1)\n    return o.sort_values(\"dakika\", ascending=False).reset_index(drop=True)\n\nimport matplotlib.pyplot as plt\n\ndef grafik(ozet):\n    fig, ax = plt.subplots(figsize=(6, 3.5))\n    ax.bar(ozet[\"dilim\"], ozet[\"gec_orani\"], color=\"#3b6ea8\")\n    ax.set_title(\"Zaman dilimine göre geç kalkış oranı\")\n    ax.set_ylabel(\"Geç kalkış oranı (%)\")\n    ax.set_xlabel(\"Planlanan kalkış dilimi\")\n    ax.set_ylim(0, None)\n    return fig\n\nfig = grafik(grup_ozeti(temizle(oku()[0], oku()[2]), \"dilim\"))\n",
   "tests": "_ax = grafik(pd.DataFrame({'dilim': ['akşam', 'sabah', 'öğle'], 'ucus': [1096, 1260, 755], 'gec_orani': [47.4, 33.0, 32.2], 'medyan_gec': [14.0, 5.0, 5.0]})).axes[0]\nassert [round(p.get_height(), 1) for p in _ax.patches] == [47.4, 33.0, 32.2], \"Sütun yükseklikleri oranlar olmalı\"\nassert _ax.get_title() == \"Zaman dilimine göre geç kalkış oranı\", \"Başlık: \" + _ax.get_title()\nassert _ax.get_ylabel() == \"Geç kalkış oranı (%)\" and _ax.get_xlabel() == \"Planlanan kalkış dilimi\", \"Eksen adları eksik\"\nassert _ax.get_ylim()[0] == 0, \"Sütun grafiğinin ekseni 0'dan başlamalı; yoksa fark büyük görünür\"\nassert [_t.get_text() for _t in _ax.get_xticklabels()] == ['akşam', 'sabah', 'öğle'], \"x ekseninde dilim adları olmalı\"\n",
   "hints": [
    "fig, ax = plt.subplots(); ax.bar(x, y)",
    "ax.set_ylim(0, None) alt sınırı sabitler."
   ],
   "why": "Sütun grafiğinde eksen sıfırdan başlamazsa 10 puanlık fark birkaç kat büyük görünür. Grafik karar verdirdiği için okurunu yanıltmamalı."
  },
  {
   "t": "code",
   "id": "proje-analist-5",
   "stage": "Kendin yaz",
   "diff": 2,
   "needs": [
    "pandas"
   ],
   "q": "<p><b>Adım 5: senaryo.</b> <code>tampon_etkisi(t, dilim, dakika)</code> yaz. Seçilen dilimdeki seferlerin planı <code>dakika</code> kadar genişletilirse her birinin gecikmesi o kadar azalır. Tüm seferler üzerinden <code>{\"once_oran\", \"sonra_oran\", \"kurtulan_ucus\"}</code> döndür: oranlar %, 1 ondalık; <code>kurtulan_ucus</code> artık geç sayılmayan sefer sayısı. Girdiyi değiştirme.</p>",
   "start": "import pandas as pd\nimport veri\n\nTARIHLER = [\"sched_dep\", \"sched_arr\", \"actual_dep\", \"actual_arr\"]\n\ndef oku():\n    ucus = veri.oku(\"kanat_havayollari\", \"hv_flights\", parse_dates=TARIHLER)\n    rotar = veri.oku(\"kanat_havayollari\", \"hv_delays\")\n    rota = veri.oku(\"kanat_havayollari\", \"hv_routes\")\n    return ucus, rotar, rota\n\ndef denetle(ucus):\n    return {\n        \"satir\": len(ucus),\n        \"tekil_sefer\": int(ucus[\"flight_id\"].nunique()),\n        \"iptal\": int((ucus[\"status\"] == \"cancelled\").sum()),\n        \"yon_degisen\": int((ucus[\"status\"] == \"diverted\").sum()),\n        \"bos_kalkis\": int(ucus[\"actual_dep\"].isna().sum()),\n        \"bos_varis\": int(ucus[\"actual_arr\"].isna().sum()),\n    }\n\ndef dilim_bul(saat):\n    if saat < 12:\n        return \"sabah\"\n    if saat < 18:\n        return \"öğle\"\n    return \"akşam\"\n\ndef temizle(ucus, rota):\n    t = ucus[ucus[\"status\"] != \"cancelled\"].copy()\n    t = t.merge(rota[[\"route_id\", \"origin\", \"dest\"]], on=\"route_id\", how=\"left\")\n    t[\"rota\"] = t[\"origin\"] + \"-\" + t[\"dest\"]\n    t[\"gec_dk\"] = (t[\"actual_dep\"] - t[\"sched_dep\"]).dt.total_seconds() / 60\n    t[\"gec\"] = t[\"gec_dk\"] > 15\n    t[\"ay\"] = t[\"sched_dep\"].dt.strftime(\"%Y-%m\")\n    t[\"dilim\"] = t[\"sched_dep\"].dt.hour.map(dilim_bul)\n    return t\n\ndef tampon_etkisi(t, dilim, dakika):\n    pass\n",
   "sol": "import pandas as pd\nimport veri\n\nTARIHLER = [\"sched_dep\", \"sched_arr\", \"actual_dep\", \"actual_arr\"]\n\ndef oku():\n    ucus = veri.oku(\"kanat_havayollari\", \"hv_flights\", parse_dates=TARIHLER)\n    rotar = veri.oku(\"kanat_havayollari\", \"hv_delays\")\n    rota = veri.oku(\"kanat_havayollari\", \"hv_routes\")\n    return ucus, rotar, rota\n\ndef denetle(ucus):\n    return {\n        \"satir\": len(ucus),\n        \"tekil_sefer\": int(ucus[\"flight_id\"].nunique()),\n        \"iptal\": int((ucus[\"status\"] == \"cancelled\").sum()),\n        \"yon_degisen\": int((ucus[\"status\"] == \"diverted\").sum()),\n        \"bos_kalkis\": int(ucus[\"actual_dep\"].isna().sum()),\n        \"bos_varis\": int(ucus[\"actual_arr\"].isna().sum()),\n    }\n\ndef dilim_bul(saat):\n    if saat < 12:\n        return \"sabah\"\n    if saat < 18:\n        return \"öğle\"\n    return \"akşam\"\n\ndef temizle(ucus, rota):\n    t = ucus[ucus[\"status\"] != \"cancelled\"].copy()\n    t = t.merge(rota[[\"route_id\", \"origin\", \"dest\"]], on=\"route_id\", how=\"left\")\n    t[\"rota\"] = t[\"origin\"] + \"-\" + t[\"dest\"]\n    t[\"gec_dk\"] = (t[\"actual_dep\"] - t[\"sched_dep\"]).dt.total_seconds() / 60\n    t[\"gec\"] = t[\"gec_dk\"] > 15\n    t[\"ay\"] = t[\"sched_dep\"].dt.strftime(\"%Y-%m\")\n    t[\"dilim\"] = t[\"sched_dep\"].dt.hour.map(dilim_bul)\n    return t\n\ndef tampon_etkisi(t, dilim, dakika):\n    secili = t[\"dilim\"] == dilim\n    yeni = t[\"gec_dk\"].where(~secili, t[\"gec_dk\"] - dakika)\n    once = int(t[\"gec\"].sum())\n    sonra = int((yeni > 15).sum())\n    return {\"once_oran\": round(once / len(t) * 100, 1), \"sonra_oran\": round(sonra / len(t) * 100, 1), \"kurtulan_ucus\": once - sonra}\n",
   "tests": "_t = temizle(oku()[0], oku()[2])\n_kop = _t[\"gec_dk\"].copy()\n_e = tampon_etkisi(_t, \"akşam\", 15)\nassert _e == {'once_oran': 37.9, 'sonra_oran': 27.9, 'kurtulan_ucus': 310}, \"Etki farklı: \" + repr(_e)\nassert _t[\"gec_dk\"].equals(_kop), \"Girdiyi değiştirme\"\n_x = pd.DataFrame({\"dilim\": [\"a\", \"a\", \"b\"], \"gec_dk\": [20.0, 40.0, 20.0], \"gec\": [True, True, True]})\nassert tampon_etkisi(_x, \"a\", 10) == {\"once_oran\": 100.0, \"sonra_oran\": 66.7, \"kurtulan_ucus\": 1}, \"Yalnız seçili dilim etkilenmeli\"\nassert tampon_etkisi(_x, \"z\", 10)[\"kurtulan_ucus\"] == 0\n",
   "hints": [
    "t[\"gec_dk\"].where(~secili, t[\"gec_dk\"] - dakika) yalnız seçili satırları değiştirir.",
    "Yeni geç sayısı: (yeni > 15).sum()."
   ],
   "why": "Bu bir ölçüm değil, varsayımlı hesaptır: gerçekte plan uzayınca uçak zinciri ve yer hizmetleri de değişir. Yine de seçenekleri kıyaslamak için ucuz ve hızlı bir araçtır."
  },
  {
   "t": "code",
   "id": "proje-analist-6",
   "stage": "Hata avı",
   "kind": "bug",
   "diff": 2,
   "needs": [
    "pandas"
   ],
   "q": "<p><b>Hatayı bul ve düzelt.</b> <code>rotarli_yolcu(t, rotar)</code> en az bir rötar kaydı olan seferlerdeki toplam yolcuyu vermeli. Sonuç 215.146 çıkıyor, ama bu sayı olduğundan büyük. Sefer başına yolcu bir kez sayılmalı.</p>",
   "start": "import pandas as pd\nimport veri\n\nTARIHLER = [\"sched_dep\", \"sched_arr\", \"actual_dep\", \"actual_arr\"]\n\ndef oku():\n    ucus = veri.oku(\"kanat_havayollari\", \"hv_flights\", parse_dates=TARIHLER)\n    rotar = veri.oku(\"kanat_havayollari\", \"hv_delays\")\n    rota = veri.oku(\"kanat_havayollari\", \"hv_routes\")\n    return ucus, rotar, rota\n\ndef denetle(ucus):\n    return {\n        \"satir\": len(ucus),\n        \"tekil_sefer\": int(ucus[\"flight_id\"].nunique()),\n        \"iptal\": int((ucus[\"status\"] == \"cancelled\").sum()),\n        \"yon_degisen\": int((ucus[\"status\"] == \"diverted\").sum()),\n        \"bos_kalkis\": int(ucus[\"actual_dep\"].isna().sum()),\n        \"bos_varis\": int(ucus[\"actual_arr\"].isna().sum()),\n    }\n\ndef dilim_bul(saat):\n    if saat < 12:\n        return \"sabah\"\n    if saat < 18:\n        return \"öğle\"\n    return \"akşam\"\n\ndef temizle(ucus, rota):\n    t = ucus[ucus[\"status\"] != \"cancelled\"].copy()\n    t = t.merge(rota[[\"route_id\", \"origin\", \"dest\"]], on=\"route_id\", how=\"left\")\n    t[\"rota\"] = t[\"origin\"] + \"-\" + t[\"dest\"]\n    t[\"gec_dk\"] = (t[\"actual_dep\"] - t[\"sched_dep\"]).dt.total_seconds() / 60\n    t[\"gec\"] = t[\"gec_dk\"] > 15\n    t[\"ay\"] = t[\"sched_dep\"].dt.strftime(\"%Y-%m\")\n    t[\"dilim\"] = t[\"sched_dep\"].dt.hour.map(dilim_bul)\n    return t\n\ndef rotarli_yolcu(t, rotar):\n    # Hatalı: rötarlı seferlerdeki yolcu sayısı olduğundan büyük çıkıyor\n    m = t.merge(rotar, on=\"flight_id\")\n    return int(m[\"pax\"].sum())\n",
   "sol": "import pandas as pd\nimport veri\n\nTARIHLER = [\"sched_dep\", \"sched_arr\", \"actual_dep\", \"actual_arr\"]\n\ndef oku():\n    ucus = veri.oku(\"kanat_havayollari\", \"hv_flights\", parse_dates=TARIHLER)\n    rotar = veri.oku(\"kanat_havayollari\", \"hv_delays\")\n    rota = veri.oku(\"kanat_havayollari\", \"hv_routes\")\n    return ucus, rotar, rota\n\ndef denetle(ucus):\n    return {\n        \"satir\": len(ucus),\n        \"tekil_sefer\": int(ucus[\"flight_id\"].nunique()),\n        \"iptal\": int((ucus[\"status\"] == \"cancelled\").sum()),\n        \"yon_degisen\": int((ucus[\"status\"] == \"diverted\").sum()),\n        \"bos_kalkis\": int(ucus[\"actual_dep\"].isna().sum()),\n        \"bos_varis\": int(ucus[\"actual_arr\"].isna().sum()),\n    }\n\ndef dilim_bul(saat):\n    if saat < 12:\n        return \"sabah\"\n    if saat < 18:\n        return \"öğle\"\n    return \"akşam\"\n\ndef temizle(ucus, rota):\n    t = ucus[ucus[\"status\"] != \"cancelled\"].copy()\n    t = t.merge(rota[[\"route_id\", \"origin\", \"dest\"]], on=\"route_id\", how=\"left\")\n    t[\"rota\"] = t[\"origin\"] + \"-\" + t[\"dest\"]\n    t[\"gec_dk\"] = (t[\"actual_dep\"] - t[\"sched_dep\"]).dt.total_seconds() / 60\n    t[\"gec\"] = t[\"gec_dk\"] > 15\n    t[\"ay\"] = t[\"sched_dep\"].dt.strftime(\"%Y-%m\")\n    t[\"dilim\"] = t[\"sched_dep\"].dt.hour.map(dilim_bul)\n    return t\n\ndef rotarli_yolcu(t, rotar):\n    return int(t[t[\"flight_id\"].isin(rotar[\"flight_id\"])][\"pax\"].sum())\n",
   "tests": "_t = temizle(oku()[0], oku()[2])\n_n = rotarli_yolcu(_t, oku()[1])\nassert _n == 195874, \"Doğru toplam 195874: \" + str(_n)\n_a = pd.DataFrame({\"flight_id\": [1, 2, 3], \"pax\": [100, 50, 70]})\n_b = pd.DataFrame({\"flight_id\": [1, 1, 2], \"reason\": [\"hava\", \"teknik\", \"hava\"], \"minutes\": [5, 6, 7]})\nassert rotarli_yolcu(_a, _b) == 150, \"Rötarsız sefer sayılmaz, çok nedenli sefer bir kez sayılır\"\n",
   "hints": [
    "Birleştirme yerine isin ile süzmek satır çoğaltmaz."
   ],
   "why": "19.272 yolcu fazla sayılıyordu. Hata vermeyen ama raporu şişiren en yaygın analist hatası budur: birleştirmeden önce ve sonra satır sayısına bak."
  },
  {
   "t": "code",
   "id": "proje-analist-7",
   "stage": "Mini proje",
   "diff": 3,
   "needs": [
    "pandas"
   ],
   "q": "<p><b>Son adım: karar.</b> İki fonksiyon yaz.</p><p><code>karar(ozet, etki, en_az_fark=5)</code>: <code>ozet</code> oran azalan sıralıdır. En yüksek ile en düşük oran farkı (1 ondalık) <code>en_az_fark</code> altındaysa <code>{\"oneri\": \"tampon_yok\", \"dilim\": None, \"fark\": fark}</code>, değilse <code>{\"oneri\": \"tampon_ekle\", \"dilim\": ilk_dilim, \"fark\": fark}</code>.</p><p><code>rapor()</code>: tüm adımları çalıştırıp şu altı satırı <code>\"\\n\"</code> ile birleştirip döndür:</p><pre class=\"out\"># Kış tarifesi: tampon önerisi\nVeri: {satir} sefer, {iptal} iptal çıkarıldı, {incelenen} sefer incelendi.\nEn geç dilim: {dilim} (%{oran}), en iyi dilim: {dilim} (%{oran}).\nEn çok dakika kaybettiren neden: {neden} (%{pay}).\nÖneri: {dilim} dilimine 15 dakika tampon. Etki: %{once} -&gt; %{sonra}, {n} sefer geç sayılmaktan çıkar.\nSınır: etki, rötarın değişmediği varsayımıyla hesaplandı; deneme yapılmadan kesin sonuç değildir.</pre>",
   "start": "import pandas as pd\nimport veri\n\nTARIHLER = [\"sched_dep\", \"sched_arr\", \"actual_dep\", \"actual_arr\"]\n\ndef oku():\n    ucus = veri.oku(\"kanat_havayollari\", \"hv_flights\", parse_dates=TARIHLER)\n    rotar = veri.oku(\"kanat_havayollari\", \"hv_delays\")\n    rota = veri.oku(\"kanat_havayollari\", \"hv_routes\")\n    return ucus, rotar, rota\n\ndef denetle(ucus):\n    return {\n        \"satir\": len(ucus),\n        \"tekil_sefer\": int(ucus[\"flight_id\"].nunique()),\n        \"iptal\": int((ucus[\"status\"] == \"cancelled\").sum()),\n        \"yon_degisen\": int((ucus[\"status\"] == \"diverted\").sum()),\n        \"bos_kalkis\": int(ucus[\"actual_dep\"].isna().sum()),\n        \"bos_varis\": int(ucus[\"actual_arr\"].isna().sum()),\n    }\n\ndef dilim_bul(saat):\n    if saat < 12:\n        return \"sabah\"\n    if saat < 18:\n        return \"öğle\"\n    return \"akşam\"\n\ndef temizle(ucus, rota):\n    t = ucus[ucus[\"status\"] != \"cancelled\"].copy()\n    t = t.merge(rota[[\"route_id\", \"origin\", \"dest\"]], on=\"route_id\", how=\"left\")\n    t[\"rota\"] = t[\"origin\"] + \"-\" + t[\"dest\"]\n    t[\"gec_dk\"] = (t[\"actual_dep\"] - t[\"sched_dep\"]).dt.total_seconds() / 60\n    t[\"gec\"] = t[\"gec_dk\"] > 15\n    t[\"ay\"] = t[\"sched_dep\"].dt.strftime(\"%Y-%m\")\n    t[\"dilim\"] = t[\"sched_dep\"].dt.hour.map(dilim_bul)\n    return t\n\ndef grup_ozeti(t, sutun, en_az=1):\n    o = t.groupby(sutun).agg(ucus=(\"gec\", \"size\"), gec_orani=(\"gec\", \"mean\"), medyan_gec=(\"gec_dk\", \"median\"))\n    o = o[o[\"ucus\"] >= en_az].copy()\n    o[\"gec_orani\"] = (o[\"gec_orani\"] * 100).round(1)\n    o = o.reset_index().sort_values([\"gec_orani\", sutun], ascending=[False, True]).reset_index(drop=True)\n    return o\n\ndef neden_ozeti(rotar):\n    o = rotar.groupby(\"reason\").agg(sefer=(\"flight_id\", \"nunique\"), dakika=(\"minutes\", \"sum\")).reset_index()\n    o[\"pay\"] = (o[\"dakika\"] / o[\"dakika\"].sum() * 100).round(1)\n    return o.sort_values(\"dakika\", ascending=False).reset_index(drop=True)\n\ndef tampon_etkisi(t, dilim, dakika):\n    secili = t[\"dilim\"] == dilim\n    yeni = t[\"gec_dk\"].where(~secili, t[\"gec_dk\"] - dakika)\n    once = int(t[\"gec\"].sum())\n    sonra = int((yeni > 15).sum())\n    return {\"once_oran\": round(once / len(t) * 100, 1), \"sonra_oran\": round(sonra / len(t) * 100, 1), \"kurtulan_ucus\": once - sonra}\n\ndef karar(ozet, etki, en_az_fark=5):\n    pass\n\ndef rapor():\n    pass\n\nprint(rapor())\n",
   "sol": "import pandas as pd\nimport veri\n\nTARIHLER = [\"sched_dep\", \"sched_arr\", \"actual_dep\", \"actual_arr\"]\n\ndef oku():\n    ucus = veri.oku(\"kanat_havayollari\", \"hv_flights\", parse_dates=TARIHLER)\n    rotar = veri.oku(\"kanat_havayollari\", \"hv_delays\")\n    rota = veri.oku(\"kanat_havayollari\", \"hv_routes\")\n    return ucus, rotar, rota\n\ndef denetle(ucus):\n    return {\n        \"satir\": len(ucus),\n        \"tekil_sefer\": int(ucus[\"flight_id\"].nunique()),\n        \"iptal\": int((ucus[\"status\"] == \"cancelled\").sum()),\n        \"yon_degisen\": int((ucus[\"status\"] == \"diverted\").sum()),\n        \"bos_kalkis\": int(ucus[\"actual_dep\"].isna().sum()),\n        \"bos_varis\": int(ucus[\"actual_arr\"].isna().sum()),\n    }\n\ndef dilim_bul(saat):\n    if saat < 12:\n        return \"sabah\"\n    if saat < 18:\n        return \"öğle\"\n    return \"akşam\"\n\ndef temizle(ucus, rota):\n    t = ucus[ucus[\"status\"] != \"cancelled\"].copy()\n    t = t.merge(rota[[\"route_id\", \"origin\", \"dest\"]], on=\"route_id\", how=\"left\")\n    t[\"rota\"] = t[\"origin\"] + \"-\" + t[\"dest\"]\n    t[\"gec_dk\"] = (t[\"actual_dep\"] - t[\"sched_dep\"]).dt.total_seconds() / 60\n    t[\"gec\"] = t[\"gec_dk\"] > 15\n    t[\"ay\"] = t[\"sched_dep\"].dt.strftime(\"%Y-%m\")\n    t[\"dilim\"] = t[\"sched_dep\"].dt.hour.map(dilim_bul)\n    return t\n\ndef grup_ozeti(t, sutun, en_az=1):\n    o = t.groupby(sutun).agg(ucus=(\"gec\", \"size\"), gec_orani=(\"gec\", \"mean\"), medyan_gec=(\"gec_dk\", \"median\"))\n    o = o[o[\"ucus\"] >= en_az].copy()\n    o[\"gec_orani\"] = (o[\"gec_orani\"] * 100).round(1)\n    o = o.reset_index().sort_values([\"gec_orani\", sutun], ascending=[False, True]).reset_index(drop=True)\n    return o\n\ndef neden_ozeti(rotar):\n    o = rotar.groupby(\"reason\").agg(sefer=(\"flight_id\", \"nunique\"), dakika=(\"minutes\", \"sum\")).reset_index()\n    o[\"pay\"] = (o[\"dakika\"] / o[\"dakika\"].sum() * 100).round(1)\n    return o.sort_values(\"dakika\", ascending=False).reset_index(drop=True)\n\ndef tampon_etkisi(t, dilim, dakika):\n    secili = t[\"dilim\"] == dilim\n    yeni = t[\"gec_dk\"].where(~secili, t[\"gec_dk\"] - dakika)\n    once = int(t[\"gec\"].sum())\n    sonra = int((yeni > 15).sum())\n    return {\"once_oran\": round(once / len(t) * 100, 1), \"sonra_oran\": round(sonra / len(t) * 100, 1), \"kurtulan_ucus\": once - sonra}\n\ndef karar(ozet, etki, en_az_fark=5):\n    ilk, son = ozet.iloc[0], ozet.iloc[-1]\n    fark = round(float(ilk[\"gec_orani\"] - son[\"gec_orani\"]), 1)\n    if fark < en_az_fark:\n        return {\"oneri\": \"tampon_yok\", \"dilim\": None, \"fark\": fark}\n    return {\"oneri\": \"tampon_ekle\", \"dilim\": ilk[\"dilim\"], \"fark\": fark}\n\ndef rapor():\n    ucus, rotar, rota = oku()\n    d = denetle(ucus)\n    t = temizle(ucus, rota)\n    oz = grup_ozeti(t, \"dilim\")\n    ned = neden_ozeti(rotar).iloc[0]\n    k = karar(oz, None)\n    e = tampon_etkisi(t, k[\"dilim\"], 15)\n    satirlar = [\n        \"# Kış tarifesi: tampon önerisi\",\n        f\"Veri: {d['satir']} sefer, {d['iptal']} iptal çıkarıldı, {len(t)} sefer incelendi.\",\n        f\"En geç dilim: {k['dilim']} (%{oz.iloc[0]['gec_orani']}), en iyi dilim: {oz.iloc[-1]['dilim']} (%{oz.iloc[-1]['gec_orani']}).\",\n        f\"En çok dakika kaybettiren neden: {ned['reason']} (%{ned['pay']}).\",\n        f\"Öneri: {k['dilim']} dilimine 15 dakika tampon. Etki: %{e['once_oran']} -> %{e['sonra_oran']}, {e['kurtulan_ucus']} sefer geç sayılmaktan çıkar.\",\n        \"Sınır: etki, rötarın değişmediği varsayımıyla hesaplandı; deneme yapılmadan kesin sonuç değildir.\",\n    ]\n    return \"\\n\".join(satirlar)\n\nprint(rapor())\n",
   "tests": "_o = rapor()\nassert _o == '# Kış tarifesi: tampon önerisi\\nVeri: 3173 sefer, 62 iptal çıkarıldı, 3111 sefer incelendi.\\nEn geç dilim: akşam (%47.4), en iyi dilim: öğle (%32.2).\\nEn çok dakika kaybettiren neden: hava (%32.6).\\nÖneri: akşam dilimine 15 dakika tampon. Etki: %37.9 -> %27.9, 310 sefer geç sayılmaktan çıkar.\\nSınır: etki, rötarın değişmediği varsayımıyla hesaplandı; deneme yapılmadan kesin sonuç değildir.', \"Rapor farklı:\\n\" + str(_o)\n_z = pd.DataFrame({\"dilim\": [\"x\", \"y\"], \"gec_orani\": [33.0, 30.0]})\nassert karar(_z, None) == {\"oneri\": \"tampon_yok\", \"dilim\": None, \"fark\": 3.0}, \"Fark küçükse karar değişmeli\"\nassert karar(_z, None, en_az_fark=2)[\"oneri\"] == \"tampon_ekle\", \"Eşik parametresi kullanılmalı\"\n",
   "hints": [
    "Sayıları elle yazma; her satır önceki adımların sonucundan gelmeli.",
    "oz.iloc[0] en geç, oz.iloc[-1] en iyi dilim."
   ],
   "why": "Analizin çıktısı tablo değil karardır: öneri, gerekçe, etki ve sınır tek yerde. Yönetici bunu okuyup karar verebilir, sen de her sayının nereden geldiğini gösterebilirsin."
  }
 ],
 "faq": [
  {
   "q": "Neden 15 dakika?",
   "a": "Sektörde zamanında kalkış için yaygın kullanılan bir eşiktir. Asıl önemlisi tanımı açıkça yazmaktır; işin başka bir eşiği varsa <code>gec</code> sütununu değiştirir, sonucu yeniden üretirsin."
  },
  {
   "q": "Yön değiştiren seferleri neden çıkarmadık?",
   "a": "Kalkış gecikmesi hesabına engel değiller: kalkış zamanları var. Varış süresini inceleseydin ayrı karar vermen gerekirdi. Her temizlik kararı soruya bağlıdır."
  },
  {
   "q": "Bu proje istatistik testi içermiyor, eksik mi?",
   "a": "Bu soru için yönlü bir karar yeterli: dilim farkı büyük ve her dilimde yüzlerce sefer var. Farklar küçük olsaydı oran testi yapardın; <b>istatistik</b> dersindeki araçlar bunun için."
  }
 ],
 "mistakes": [
  {
   "bad": "t = ucus.merge(rotar, on=\"flight_id\")\nprint(t[\"pax\"].sum())",
   "good": "ucus[ucus[\"flight_id\"].isin(rotar[\"flight_id\"])][\"pax\"].sum()",
   "why": "Bire çok birleştirmede sefer satırları çoğalır, sefer düzeyindeki değer şişer."
  },
  {
   "bad": "ucus[\"actual_dep\"] = ucus[\"actual_dep\"].fillna(ucus[\"sched_dep\"])",
   "good": "t = ucus[ucus[\"status\"] != \"cancelled\"].copy()",
   "why": "İptal seferi zamanında kalkmış göstermek geç kalkış oranını düşürür. İptali ayrı say."
  },
  {
   "bad": "ax.set_ylim(30, 50)",
   "good": "ax.set_ylim(0, None)",
   "why": "Sütun grafiğinde kesik eksen farkı olduğundan büyük gösterir."
  }
 ]
}));
})(window);
