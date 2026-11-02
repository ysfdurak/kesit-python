/* PythonPatika — 'pandas-zaman-serisi' dersi uzantısı: Bisiklet yolculuklarıyla zaman serisi (gerçek veri setleri) */
// needs: pandas
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
  {
    id: 'pandas-zaman-serisi',
    min: 25,
    needs: ['pandas'],
    html: `<h2>Derinleş: 117 bin bisiklet yolculuğuyla zaman serisi</h2><p>Zaman serisi tekniklerinin gücü, veri büyüyünce ortaya çıkar. Pedal İzmir, İzmir'de bir bisiklet paylaşım sistemi: <code>pedal_izmir</code> setinde Haziran–Ağustos 2024 arasındaki <b>116.517 yolculuk</b> (<code>bk_trips</code>) ve aynı dönemin <b>saatlik hava durumu</b> (<code>bk_weather</code>) var. Bu bölümde olay düzeyindeki (her satır bir yolculuk) veriyi günlük ve saatlik serilere çevirecek, mevsimsellik ve dış etken (yağmur) analizi yapacaksın.</p><h3>Büyük tabloyu akıllı okumak</h3><p>Tablonun tüm sütunlarına ihtiyacın yoksa <code>usecols</code> ile yalnız gerekenleri oku ve tarih sütunlarını <code>parse_dates</code> ile doğrudan datetime yap. Tarayıcıda bu, okuma süresini ve belleği belirgin biçimde azaltır. Kapanmamış yolculuklarda <code>ended_at</code> boştur; süre hesabında bunlar NaN olur ve <code>median</code>, <code>mean</code> onları kendiliğinden atlar.</p><pre class="py">import veri

t = veri.oku("pedal_izmir", "bk_trips", usecols=["started_at", "ended_at", "fare"],
             parse_dates=["started_at", "ended_at"])
print(len(t), t["started_at"].min(), t["started_at"].max())
sure = (t["ended_at"] - t["started_at"]).dt.total_seconds() / 60
print("açık yolculuk:", int(sure.isna().sum()), "| medyan süre (dk):", sure.median())
</pre><h3>Olaydan seriye: resample ile sayım</h3><p>Her satır bir olay olduğunda, <code>set_index("started_at").resample("D").size()</code> günlük yolculuk sayısını verir. <code>size</code> hiç yolculuk olmayan günü de 0 olarak gösterir; <code>groupby(dt.date)</code> ise boş günleri atlar. Bu yüzden takvim tamlığı gereken her hesapta resample tercih edilir.</p><pre class="py">import veri

t = veri.oku("pedal_izmir", "bk_trips", usecols=["started_at"], parse_dates=["started_at"])
gunluk = t.set_index("started_at").resample("D").size()
print(len(gunluk), "gün, toplam", int(gunluk.sum()))
print("en yoğun:", gunluk.idxmax().date(), int(gunluk.max()))
print("7 günlük hareketli ortalama (son gün):", round(gunluk.rolling("7D").mean().iloc[-1], 1))

GUNLER = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"]
hafta = gunluk.groupby(gunluk.index.dayofweek).mean().round(0)
print(dict(zip(GUNLER, hafta.astype(int).tolist())))
</pre><div class="tip"><b>Gün adlarını sen ver</b><code>dt.day_name()</code> İngilizce ad döndürür; <code>locale</code> parametresi işletim sistemine bağlıdır ve tarayıcıda çalışmayabilir. <code>dayofweek</code> (0 = Pazartesi) ile bir Türkçe ad listesi kullanmak her ortamda aynı sonucu verir.</div><h3>Saatlik profil ve iki seriyi zamanda eşlemek</h3><p>Hava durumu saatlik ölçülür (<code>obs_hour</code> tam saat). Yolculukları saatlik seriye çevirirsen iki tabloyu aynı zaman anahtarıyla birleştirebilirsin. Sayım serisinde yolculuk olmayan saat 0 olmalıdır; bunu <code>how="left"</code> ve <code>fillna(0)</code> sağlar.</p><pre class="py">import veri

t = veri.oku("pedal_izmir", "bk_trips", usecols=["started_at"], parse_dates=["started_at"])
w = veri.oku("pedal_izmir", "bk_weather", parse_dates=["obs_hour"])

saatlik = t.set_index("started_at").resample("h").size().rename("yolculuk")
m = w.set_index("obs_hour").join(saatlik, how="left").fillna({"yolculuk": 0})
print(len(m), "saat")
print(m.groupby(m["rain_mm"] &gt; 0)["yolculuk"].mean().round(1).to_dict())
print("yağmurlu saatler:", sorted(m.index[m["rain_mm"] &gt; 0].hour.unique().tolist()))
</pre><h3>Gün × saat matrisi: talebin parmak izi</h3><p>Operasyon ekipleri talebi çoğu zaman bir matris olarak görmek ister: satırlarda haftanın günü, sütunlarda saat, hücrede o gün-saat ikilisinin <b>ortalama</b> yolculuk sayısı. Toplam değil ortalama alınır, çünkü her gün adı dönemde farklı sayıda geçer. Bu matris ısı haritasına (heatmap) dönüştürüldüğünde hafta içi sabah ve akşam iki tepeyi, hafta sonu ise öğleden sonraya yayılan tek bir tepeyi açıkça gösterir.</p><pre class="py">import veri

t = veri.oku("pedal_izmir", "bk_trips", usecols=["started_at"], parse_dates=["started_at"])
saatlik = t.set_index("started_at").resample("h").size().rename("n").to_frame()
saatlik["gun"] = saatlik.index.dayofweek
saatlik["saat"] = saatlik.index.hour
matris = saatlik.pivot_table(index="gun", columns="saat", values="n", aggfunc="mean").round(0)
print(matris.loc[:, [8, 12, 18, 23]])
</pre><div class="warn"><b>Karıştırıcı değişken: saat</b>Yukarıdaki ham karşılaştırma "yağmurda yolculuk %60 düşüyor" der. Ama bu veride yağmur yalnızca gündüz saatlerinde yağmış; gündüz zaten yoğun saatlerdir. Adil karşılaştırma için <b>aynı saat dilimindeki</b> yağmurlu ve kuru saatleri kıyaslamalısın. Saat kontrolü yapınca etki çok daha büyük çıkar. Zaman serisinde "neyle kıyaslıyorum?" sorusu, hesaplama tekniğinden daha önemlidir.</div><div class="note"><b>Gerçek işte</b>Paylaşımlı ulaşım, yemek teslimatı ve çağrı merkezi gibi işlerde kapasite planı saatlik talep profiline dayanır: kaç bisiklet hangi istasyona, kaç kurye hangi saate, kaç temsilci hangi vardiyaya. Bu profil hafta içi ve hafta sonu ayrı çıkarılır, hava durumu ve tatil gibi dış etkenler ayrı sütun olarak eklenir. Tahmin modelleri (bkz. zaman serisi tahmini dersi) tam olarak bu özellikler üzerine kurulur.</div>`,
    ex: [
      {
        t: 'predict',
        stage: 'Kodu oku',
        q: 'Yolculuklar günlük seriye çevriliyor. Bu kod ne yazdırır?',
        needs: ['pandas'],
        code: 'import veri\nt = veri.oku("pedal_izmir", "bk_trips", usecols=["started_at"], parse_dates=["started_at"])\ngunluk = t.set_index("started_at").resample("D").size()\nprint(len(gunluk), gunluk.idxmax().strftime("%d.%m"), gunluk.max())\n',
        o: ['92 03.06 1436', '91 03.06 1436', '92 11.08 557', '116517 03.06 1436'],
        a: 0,
        why: 'Haziran (30) + Temmuz (31) + Ağustos (31) = 92 gün. idxmax en yoğun günün tarihini (3 Haziran), max ise o günün sayısını verir. 11 Ağustos en sakin gündür.'
      },
      {
        t: 'predict',
        stage: 'Kodu oku',
        q: 'Yolculuk süreleri hesaplanıyor; bazı yolculuklar kapanmamış. Bu kod ne yazdırır?',
        needs: ['pandas'],
        code: 'import veri\nt = veri.oku("pedal_izmir", "bk_trips", usecols=["started_at", "ended_at"], parse_dates=["started_at", "ended_at"])\nsure = (t["ended_at"] - t["started_at"]).dt.total_seconds() / 60\nprint(int(sure.isna().sum()), sure.median())\n',
        o: ['316 20.0', '0 20.0', '316 29.27', '316 nan'],
        a: 0,
        why: 'ended_at boş olan 316 yolculukta fark NaT, dakikası NaN olur. median NaN\'ları atlar ve 20 dakika verir. 29.27 ortalamadır: uzun yolculuklar ortalamayı yukarı çeker.'
      },
      {
        t: 'order',
        stage: 'Kodu oku',
        q: '<p>Haftanın her günü için ortalama günlük yolculuk sayısını Türkçe gün adlarıyla yazdıran programın satırlarını sırala.</p>',
        needs: ['pandas'],
        lines: ['import veri', 'GUNLER = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"]', 't = veri.oku("pedal_izmir", "bk_trips", usecols=["started_at"], parse_dates=["started_at"])', 'gunluk = t.set_index("started_at").resample("D").size()', 'ort = gunluk.groupby(gunluk.index.dayofweek).mean()', 'print({GUNLER[i]: round(float(v)) for i, v in ort.items()})'],
        expect: '{\'Pzt\': 1305, \'Sal\': 1252, \'Çar\': 1300, \'Per\': 1336, \'Cum\': 1334, \'Cmt\': 1222, \'Paz\': 1120}\n',
        hint: 'Önce günlük seri, sonra gün numarasına göre ortalama.',
        why: 'Önce günlük seriye inmek şarttır: yolculukları doğrudan gün adına göre saymak, her gün adının kaç kez geçtiğini (12 ya da 14 hafta) hesaba katmaz.'
      },
      {
        t: 'code',
        id: 'pandas-zaman-serisi-v1',
        stage: 'Rehberli',
        diff: 2,
        needs: ['pandas'],
        q: '<p><code>gunluk_seri()</code>: <code>pedal_izmir/bk_trips</code> tablosundan yalnızca <code>started_at</code> sütununu datetime olarak oku ve günlük yolculuk sayısı serisini (<code>resample("D").size()</code>) döndür. Serinin adı <code>"yolculuk"</code> olsun.</p>',
        guide: ['usecols=["started_at"] ve parse_dates=["started_at"] ile oku.', 'started_at\'ı index yap (set_index).', 'resample("D").size() ile günlük say.', 'rename("yolculuk") ile seriyi adlandır.'],
        example: 'import pandas as pd\nz = pd.to_datetime(["2024-06-01 08:00", "2024-06-01 09:30", "2024-06-03 10:00"])\ns = pd.DataFrame({"z": z}).set_index("z").resample("D").size().rename("adet")\nprint(s)\n',
        start: 'import veri\n\ndef gunluk_seri():\n    t = veri.oku("pedal_izmir", "bk_trips", usecols=["started_at"])\n    # TODO: tarih türü, index, resample, ad\n    return t\n',
        sol: 'import veri\n\ndef gunluk_seri():\n    t = veri.oku("pedal_izmir", "bk_trips", usecols=["started_at"], parse_dates=["started_at"])\n    return t.set_index("started_at").resample("D").size().rename("yolculuk")\n',
        tests: 'import pandas as pd\ns = gunluk_seri()\nassert isinstance(s, pd.Series), "Series döndürmelisin"\nassert s.name == "yolculuk", "Serinin adı yolculuk olmalı"\nassert len(s) == 92, f"92 gün olmalı, {len(s)} geldi"\nassert int(s.sum()) == 116517, "Tüm yolculuklar sayılmalı"\nassert s.iloc[:3].tolist() == [1393, 1345, 1436], f"İlk üç gün farklı: {s.iloc[:3].tolist()}"\nassert s.index[0] == pd.Timestamp("2024-06-01"), "Seri 1 Haziran\'da başlamalı"\n',
        hints: ['resample DatetimeIndex ister.', 't.set_index("started_at").resample("D").size()'],
        why: 'Olay tablosundan günlük seri tek satırda çıkar. Bu seri hareketli ortalama, hafta günü etkisi ve tahmin için temel girdidir.'
      },
      {
        t: 'code',
        id: 'pandas-zaman-serisi-v2',
        stage: 'Rehberli',
        diff: 2,
        needs: ['pandas'],
        q: '<p><code>zirve_saatler()</code>: yolculukların başlangıç saatine bakarak <b>hafta içi</b> ve <b>hafta sonu</b> için en yoğun saati bul; <code>{"hafta_ici": saat, "hafta_sonu": saat}</code> döndür (saatler <code>int</code>).</p>',
        guide: ['started_at\'ı datetime oku.', 'Hafta sonu maskesi: dt.dayofweek >= 5.', 'Her parçada dt.hour.value_counts().idxmax().', 'int() ile Python tamsayısına çevir.'],
        example: 'import pandas as pd\nz = pd.Series(pd.to_datetime(["2024-06-01 09:10", "2024-06-01 09:40", "2024-06-03 18:00"]))\nhs = z.dt.dayofweek >= 5\nprint(int(z[hs].dt.hour.value_counts().idxmax()))\n',
        start: 'import veri\n\ndef zirve_saatler():\n    t = veri.oku("pedal_izmir", "bk_trips", usecols=["started_at"], parse_dates=["started_at"])\n    z = t["started_at"]\n    # TODO: hafta sonu maskesi ve iki zirve saati\n    return {}\n',
        sol: 'import veri\n\ndef zirve_saatler():\n    t = veri.oku("pedal_izmir", "bk_trips", usecols=["started_at"], parse_dates=["started_at"])\n    z = t["started_at"]\n    hs = z.dt.dayofweek >= 5\n    return {"hafta_ici": int(z[~hs].dt.hour.value_counts().idxmax()),\n            "hafta_sonu": int(z[hs].dt.hour.value_counts().idxmax())}\n',
        tests: 'r = zirve_saatler()\nassert r == {"hafta_ici": 18, "hafta_sonu": 17}, f"Zirve saatler farklı: {r}"\nassert all(type(v) is int for v in r.values()), "Saatler int olmalı"\n',
        hints: ['dayofweek: 0 Pazartesi, 5 Cumartesi, 6 Pazar.', '~maske tersini alır.'],
        why: 'Hafta içi zirve 18:00 (işten dönüş), hafta sonu bir saat önce. Kapasite planı iki profil için ayrı yapılır.'
      },
      {
        t: 'code',
        id: 'pandas-zaman-serisi-v3',
        stage: 'Kendin yaz',
        diff: 2,
        needs: ['pandas'],
        q: '<p><code>aylik_gelir()</code>: <code>bk_trips</code> tablosundaki <code>fare</code> (ücret) sütununu <code>started_at</code>\'a göre aylık (ay başı etiketli, <code>"MS"</code>) topla. <code>{"2024-06": gelir, ...}</code> sözlüğü ve aylık yüzde değişim listesini (ilk ay hariç, 1 basamak) <code>(sozluk, degisim)</code> demeti olarak döndür. Gelir 2 basamaklı <code>float</code>.</p>',
        start: 'import veri\n\ndef aylik_gelir():\n    pass\n',
        sol: 'import veri\n\ndef aylik_gelir():\n    t = veri.oku("pedal_izmir", "bk_trips", usecols=["started_at", "fare"], parse_dates=["started_at"])\n    ay = t.set_index("started_at")["fare"].resample("MS").sum()\n    sozluk = {k.strftime("%Y-%m"): round(float(v), 2) for k, v in ay.items()}\n    degisim = [round(float(x), 1) for x in (ay.pct_change() * 100).iloc[1:]]\n    return sozluk, degisim\n',
        tests: 's, d = aylik_gelir()\nassert s == {"2024-06": 1322412.07, "2024-07": 1359780.6, "2024-08": 1366494.58}, f"Aylık gelir farklı: {s}"\nassert d == [2.8, 0.5], f"Değişim farklı: {d}"\n',
        hints: ['"M" yerine "MS" (ay başı) kullan; "M" yeni sürümlerde kaldırıldı.', 'pct_change() ilk eleman için NaN verir; iloc[1:] ile at.'],
        why: 'Kapanmamış yolculukların ücreti boştur; sum NaN\'ları atlar. Gelir aylar arasında küçük ama düzenli artıyor.'
      },
      {
        t: 'code',
        id: 'pandas-zaman-serisi-v4',
        stage: 'Kendin yaz',
        diff: 2,
        needs: ['pandas'],
        q: '<p><code>hareketli_ozet()</code>: günlük yolculuk serisinin <b>7 takvim günlük</b> hareketli ortalamasını hesapla ve <code>{"7_haziran": .., "son_gun": .., "en_dusuk_gun": "YYYY-MM-DD"}</code> döndür. İlk iki değer 1 basamaklı <code>float</code>; üçüncüsü hareketli ortalamanın en düşük olduğu günün tarihi (ilk 6 gün dahil, pencere eksik olsa da).</p>',
        start: 'import veri\n\ndef hareketli_ozet():\n    pass\n',
        sol: 'import veri\n\ndef hareketli_ozet():\n    t = veri.oku("pedal_izmir", "bk_trips", usecols=["started_at"], parse_dates=["started_at"])\n    g = t.set_index("started_at").resample("D").size()\n    r = g.rolling("7D").mean()\n    return {"7_haziran": round(float(r.loc["2024-06-07"]), 1), "son_gun": round(float(r.iloc[-1]), 1),\n            "en_dusuk_gun": r.idxmin().strftime("%Y-%m-%d")}\n',
        tests: 'r = hareketli_ozet()\nassert r["7_haziran"] == 1268.1, f"7 Haziran değeri farklı: {r}"\nassert r["son_gun"] == 1319.4, f"Son gün değeri farklı: {r}"\nassert isinstance(r["en_dusuk_gun"], str) and len(r["en_dusuk_gun"]) == 10, "Tarih YYYY-MM-DD metni olmalı"\n',
        hints: ['rolling("7D") zaman tabanlı penceredir; rolling(7) satır tabanlıdır.', 'loc["2024-06-07"] tarihle seçer.'],
        why: 'Zaman tabanlı pencere eksik gün olsa bile her zaman 7 takvim gününe bakar. İlk günlerde pencere kısadır, değer yine üretilir.'
      },
      {
        t: 'code',
        id: 'pandas-zaman-serisi-v5',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 2,
        needs: ['pandas'],
        q: '<p>Hatayı bul ve düzelt. <code>gece_ozeti()</code> 22:00 ile 05:00 arasında (22, 23, 0, 1, 2, 3, 4 saatleri) başlayan yolculukların sayısını ve medyan süresini (dakika, 1 basamak) <code>(adet, medyan)</code> olarak döndürmeli. Ama hep <code>(0, nan)</code> dönüyor.</p>',
        start: 'import veri\n\ndef gece_ozeti():\n    t = veri.oku("pedal_izmir", "bk_trips", usecols=["started_at", "ended_at"], parse_dates=["started_at", "ended_at"])\n    saat = t["started_at"].dt.hour\n    gece = t[saat.between(22, 5)]\n    sure = (gece["ended_at"] - gece["started_at"]).dt.total_seconds() / 60\n    return int(len(gece)), round(float(sure.median()), 1)\n',
        sol: 'import veri\n\ndef gece_ozeti():\n    t = veri.oku("pedal_izmir", "bk_trips", usecols=["started_at", "ended_at"], parse_dates=["started_at", "ended_at"])\n    saat = t["started_at"].dt.hour\n    gece = t[(saat >= 22) | (saat < 5)]\n    sure = (gece["ended_at"] - gece["started_at"]).dt.total_seconds() / 60\n    return int(len(gece)), round(float(sure.median()), 1)\n',
        tests: 'r = gece_ozeti()\nassert r == (6717, 19.7), f"Gece özeti farklı: {r}"\n',
        hints: ['between(22, 5) "22 ≤ x ≤ 5" demektir; böyle bir sayı var mı?', 'Gece aralığı gece yarısını aşar: iki koşulu | ile birleştir.'],
        why: 'Gece yarısını aşan aralıklar tek bir between ile yazılamaz. (saat >= 22) | (saat < 5) doğru maskedir; 6.717 gece yolculuğu var.'
      },
      {
        t: 'code',
        id: 'pandas-zaman-serisi-v6',
        stage: 'Meydan okuma',
        diff: 3,
        needs: ['pandas'],
        q: '<p><code>yagmur_etkisi()</code>: yolculukları saatlik sayıma çevir, <code>bk_weather</code> ile <code>obs_hour</code> üzerinden birleştir (yolculuk olmayan saat 0). Şunları döndür:</p><ul><li><code>"ham"</code>: yağmurlu saatlerin (<code>rain_mm &gt; 0</code>) ortalama yolculuğunun kuru saatlerin ortalamasına oranı</li><li><code>"saat_kontrollu"</code>: her günün saati (0–23) için yağmurlu ortalama / kuru ortalama oranını hesapla; iki grubu da olan saatlerin oranlarının ortalaması</li></ul><p>İkisi de 3 basamaklı <code>float</code>.</p>',
        start: 'import veri\n\ndef yagmur_etkisi():\n    pass\n',
        sol: 'import veri\n\ndef yagmur_etkisi():\n    t = veri.oku("pedal_izmir", "bk_trips", usecols=["started_at"], parse_dates=["started_at"])\n    w = veri.oku("pedal_izmir", "bk_weather", parse_dates=["obs_hour"])\n    n = t.set_index("started_at").resample("h").size().rename("n")\n    m = w.set_index("obs_hour").join(n, how="left").fillna({"n": 0})\n    m["yag"] = m["rain_mm"] > 0\n    ort = m.groupby("yag")["n"].mean()\n    ham = ort[True] / ort[False]\n    pv = m.pivot_table(index=m.index.hour, columns="yag", values="n", aggfunc="mean").dropna()\n    kontrol = (pv[True] / pv[False]).mean()\n    return {"ham": round(float(ham), 3), "saat_kontrollu": round(float(kontrol), 3)}\n',
        tests: 'r = yagmur_etkisi()\nassert r["ham"] == 0.393, f"Ham oran farklı: {r}"\nassert r["saat_kontrollu"] == 0.239, f"Saat kontrollü oran farklı: {r}"\nassert r["saat_kontrollu"] < r["ham"], "Saat kontrolü etkiyi büyütmeli: yağmur yoğun gündüz saatlerinde yağdı"\n',
        hints: ['Saatlik sayım: resample("h").size().', 'Hava tablosunu sola koy ki yolculuksuz saatler de kalsın; fillna(0).', 'pivot_table(index=saat, columns=yağmur, values=n, aggfunc="mean").dropna() sonra sütun oranı.'],
        why: 'Ham karşılaştırma yağmurun etkisini küçük gösteriyor (%61 düşüş), çünkü yağmur yalnızca yoğun gündüz saatlerinde yağdı. Aynı saatleri kıyaslayınca yağmurlu saatte yolculuk kuru saatin yalnızca %24\'ü kadar.'
      }
    ],
    faq: [
      {
        q: '117 bin satırı tarayıcıda okumak yavaş mı?',
        a: 'Yalnızca gereken sütunları <code>usecols</code> ile okursan birkaç saniye sürer. Aynı fonksiyonu tekrar tekrar çağırıyorsan tabloyu bir kez okuyup değişkende tut. Gerçek işte milyonlarca satır için DuckDB ya da polars (bkz. polars-duckdb dersi) tercih edilir.'
      }
    ],
    mistakes: [
      {
        bad: 'gece = t[t["started_at"].dt.hour.between(22, 5)]',
        good: 'h = t["started_at"].dt.hour\ngece = t[(h >= 22) | (h < 5)]',
        why: 'Gece yarısını aşan aralık tek between ile yazılamaz; between(22, 5) her zaman boş döner.'
      }
    ]
  }
);
})(window);
