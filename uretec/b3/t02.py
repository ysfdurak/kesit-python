T = [
dict(id='b-321', topic='pandas', diff=2, kind='bug', needs=['pandas'],
  title='Kargo ücreti yazılmıyor (zincirleme atama)',
  q='<p>Kodda bir hata var, bul ve düzelt. <code>kargo_ucreti_ekle(df)</code> 150 TL altındaki siparişlere 30 TL kargo, diğerlerine 0 yazıp yeni bir DataFrame döndürmeli. Ama tüm satırlarda kargo 0 çıkıyor ve pandas bir uyarı basıyor.</p>',
  start=r'''
import pandas as pd

def kargo_ucreti_ekle(df):
    df = df.copy()
    df["kargo"] = 0
    df[df["tutar"] < 150]["kargo"] = 30
    return df
''',
  sol=r'''
import pandas as pd

def kargo_ucreti_ekle(df):
    df = df.copy()
    df["kargo"] = 0
    df.loc[df["tutar"] < 150, "kargo"] = 30
    return df
''',
  tests=r'''
import warnings
warnings.simplefilter("ignore")
siparis = pd.DataFrame({"no": [1, 2, 3, 4], "tutar": [99.9, 150.0, 40.0, 820.0]})
r = kargo_ucreti_ekle(siparis)
assert r["kargo"].tolist() == [30, 0, 30, 0], f"150 altı 30, diğerleri 0 olmalı; gelen {r['kargo'].tolist()}. df[maske]['kargo'] = ... bir kopyaya yazar; .loc[maske, 'kargo'] kullan"
assert "kargo" not in siparis.columns, "Orijinal DataFrame değişmemeli"
''',
  hints=['<code>df[maske]</code> yeni bir (geçici) DataFrame üretir; ona yapılan atama orijinale ulaşmaz.', 'Satır seçimi ve sütun atamasını tek bir indeksleyicide birleştir.', '<code>df.loc[df["tutar"] &lt; 150, "kargo"] = 30</code>'],
  why='df[maske]["kargo"] = 30 iki ayrı indeksleme adımıdır (chained assignment): ilki kopya döndürür, atama o kopyada kalır. pandas 2.x bunu SettingWithCopyWarning ile, Copy-on-Write varsayılan olan pandas 3 ise ChainedAssignmentError uyarısıyla bildirir ve orijinali hiç değiştirmez. .loc[satır, sütun] tek adımda yerinde yazar, O(n). Alternatif: df["kargo"] = np.where(df["tutar"] < 150, 30, 0).',
  tags=['loc', 'chained assignment', 'Copy-on-Write'], min=4),

dict(id='b-322', topic='pandas', diff=3, kind='yaz', needs=['pandas'],
  title='Her şehrin en çok satan 2 ürünü',
  q='<p><code>sehir_top2(df)</code> fonksiyonunu yaz. <code>df</code> sütunları: <code>sehir</code>, <code>urun</code>, <code>adet</code>; aynı şehir-ürün çifti birden çok satırda olabilir. Önce şehir-ürün bazında adetleri topla, sonra her şehir için en çok satan <b>2 ürünü</b> bul. Eşit adette alfabetik olarak önce geleni seç. Sonucu <code>{sehir: [urun1, urun2]}</code> sözlüğü olarak döndür (tek ürünü olan şehirde liste tek elemanlı).</p>',
  start=r'''
import pandas as pd

def sehir_top2(df):
    pass
''',
  sol=r'''
import pandas as pd

def sehir_top2(df):
    t = df.groupby(["sehir", "urun"], as_index=False)["adet"].sum()
    t = t.sort_values(["sehir", "adet", "urun"], ascending=[True, False, True])
    ilk2 = t.groupby("sehir").head(2)
    return {s: g["urun"].tolist() for s, g in ilk2.groupby("sehir")}
''',
  tests=r'''
df = pd.DataFrame({
    "sehir": ["Ankara", "Ankara", "Ankara", "Ankara", "İzmir", "İzmir", "İzmir", "Bursa"],
    "urun":  ["çay", "kahve", "çay", "şeker", "kahve", "çay", "süt", "un"],
    "adet":  [5, 8, 6, 3, 4, 4, 9, 2],
})
r = sehir_top2(df)
assert r["Ankara"] == ["çay", "kahve"], f"Ankara: çay 5+6=11, kahve 8 → ['çay', 'kahve']; gelen {r.get('Ankara')}. Önce topla!"
assert r["İzmir"] == ["süt", "kahve"], f"İzmir: süt 9; çay ve kahve 4'er → alfabetik önce gelen kahve; gelen {r.get('İzmir')}"
assert r["Bursa"] == ["un"], "Tek ürünü olan şehirde liste tek elemanlı"
assert set(r) == {"Ankara", "İzmir", "Bursa"}, "Her şehir bir anahtar olmalı"
''',
  hints=['Önce <code>groupby(["sehir", "urun"])["adet"].sum()</code> ile tekrarları birleştir.', 'Çok sütunlu sıralama: <code>sort_values(["sehir", "adet", "urun"], ascending=[True, False, True])</code>.', 'Sıralanmış tabloda <code>groupby("sehir").head(2)</code> her grubun ilk 2 satırını verir.'],
  why='Sırala + groupby().head(k) kalıbı "grup içinde ilk k" probleminin pandas karşılığıdır; toplam O(n log n). Eşitlik kuralını sıralama anahtarına ekleyerek sonucu deterministik yaparsın. Alternatifler: groupby("sehir")["adet"].rank(method="first", ascending=False) <= 2 ile filtre; ya da nlargest (ama eşitlikte alfabetik kuralı yönetmek zor). SQL’de ROW_NUMBER() OVER (PARTITION BY sehir ORDER BY adet DESC, urun).',
  tags=['groupby', 'head', 'top-k', 'sort_values'], min=10),

dict(id='b-323', topic='pandas Zaman Serisi', diff=2, kind='predict', needs=['pandas'],
  title='Aylık büyüme oranı',
  q='<p>Aylık ciro serisinde bir önceki aya göre yüzde değişimi hesaplayan bu kod ne yazdırır?</p>',
  code=r'''
import pandas as pd

s = pd.Series([200, 250, 250, 200],
              index=pd.date_range("2026-01-01", periods=4, freq="MS"))
d = s.pct_change() * 100
print(d.round(1).tolist())
print(s.index[-1].strftime("%Y-%m-%d"))
''',
  o=['[nan, 25.0, 0.0, -20.0]\n2026-04-01', '[25.0, 0.0, -20.0]\n2026-04-01', '[nan, 25.0, 0.0, -20.0]\n2026-01-04', '[nan, 25.0, 0.0, -25.0]\n2026-04-01'], a=0,
  hints=['pct_change ilk elemanda karşılaştıracak önceki değer bulamaz.', '"MS" ay başı (month start) frekansıdır; 250→200 değişimi 250 tabanına göre hesaplanır.'],
  why='pct_change (x_t − x_{t−1}) / x_{t−1} hesaplar; ilk değer için önceki yok → nan, uzunluk korunur. 250’den 200’e düşüş −50/250 = −%20’dir (−%25 değil; taban önceki değerdir). freq="MS" her ayın 1’ini üretir, 4. eleman 2026-04-01. Alternatif: s / s.shift(1) − 1; yıllık karşılaştırma için pct_change(periods=12).',
  tags=['pct_change', 'date_range', 'shift'], min=3),

dict(id='b-324', topic='pandas Zaman Serisi', diff=2, kind='rehberli', needs=['pandas'],
  title='Eksik günlere dayanıklı 7 günlük ortalama',
  q='<p>Mağaza günlük satışları bazı günler kaydedilmemiş. <code>haftalik_ortalama(df)</code> fonksiyonunu yaz: <code>df</code> sütunları <code>tarih</code> (metin, YYYY-MM-DD) ve <code>satis</code>. Tarihe göre sıralı, tarih indeksli ve her gün için <b>son 7 takvim gününün</b> (o gün dahil) ortalamasını içeren Series döndür (2 ondalık). Satır sayısına değil takvime göre pencere kullanmalısın.</p>',
  guide=['<code>pd.to_datetime</code> ile tarih sütununu dönüştür.', 'Tarihi indeks yap ve <code>sort_index()</code> ile sırala; zaman tabanlı pencere sıralı indeks ister.', '<code>rolling("7D")</code> ile takvim günü penceresi aç, <code>mean()</code> al.', '<code>round(2)</code> ile yuvarlayıp döndür.'],
  example=r'''
import pandas as pd
s = pd.Series([1, 2, 3], index=pd.to_datetime(["2026-05-01", "2026-05-02", "2026-05-06"]))
print(s.rolling(2).mean())      # satır sayısıyla: son 2 KAYIT
print(s.rolling("2D").mean())   # takvimle: son 2 GÜN
''',
  start=r'''
import pandas as pd

def haftalik_ortalama(df):
    s = df.copy()
    # TODO 1: tarih sütununu datetime'a çevir
    # TODO 2: tarihi indeks yap ve sırala
    # TODO 3: satis sütununda 7 takvim günlük pencereyle ortalama al
    # TODO 4: 2 ondalığa yuvarla ve döndür
    return None
''',
  sol=r'''
import pandas as pd

def haftalik_ortalama(df):
    s = df.copy()
    s["tarih"] = pd.to_datetime(s["tarih"])
    s = s.set_index("tarih").sort_index()
    return s["satis"].rolling("7D").mean().round(2)
''',
  tests=r'''
df = pd.DataFrame({
    "tarih": ["2026-03-09", "2026-03-01", "2026-03-02", "2026-03-03", "2026-03-05", "2026-03-08"],
    "satis": [60, 10, 20, 30, 40, 50],
})
r = haftalik_ortalama(df)
assert isinstance(r, pd.Series), "Series döndürmeli"
assert r.index.is_monotonic_increasing, "İndeks tarihe göre sıralı olmalı"
t = pd.Timestamp
assert r[t("2026-03-01")] == 10, "İlk gün yalnız kendisini içerir"
assert r[t("2026-03-08")] == 35, "8 Mart penceresi 2-8 Mart: (20+30+40+50)/4 = 35; rolling(7) değil rolling('7D') kullan"
assert r[t("2026-03-09")] == 45, "9 Mart penceresi 3-9 Mart: (30+40+50+60)/4 = 45"
''',
  hints=['Zaman tabanlı pencere için indeks DatetimeIndex olmalı.', '<code>rolling("7D")</code> son 7 günü (t-7g, t] aralığında alır; <code>rolling(7)</code> ise son 7 satırı.', 'Son adım: <code>s["satis"].rolling("7D").mean().round(2)</code>'],
  why='Eksik günler varken rolling(7) "son 7 kayıt" alır ve pencere 10+ takvim gününe yayılabilir; rolling("7D") takvime bakar, bu yüzden iş raporlarında doğru olandır. Karmaşıklık O(n) (pandas kayan toplam kullanır). Alternatif: önce resample("D").sum() ile boş günleri 0 doldurup rolling(7) almak; bu, satışsız günü 0 sayar (ortalamayı düşürür) — hangisinin istendiğini iş birimiyle netleştir.',
  tags=['rolling', 'DatetimeIndex', 'zaman penceresi'], min=7),

dict(id='b-325', topic='pandas Zaman Serisi', diff=2, kind='rehberli', needs=['pandas'],
  title='Kesintisiz günlük seri',
  q='<p>Ödeme sistemi günlük işlem kayıtlarını düzensiz tutuyor: bazı günler hiç kayıt yok, bazı günlerde birden çok kayıt var. <code>gunluk_tamamla(s)</code> fonksiyonunu yaz: tarih indeksli tutar Series\'ini alıp ilk ve son gün arasındaki <b>her gün</b> için bir satır içeren, aynı günün kayıtlarını toplayan, kaydı olmayan güne <b>0</b> yazan Series döndürsün.</p>',
  guide=['Önce indeksi sırala (sort_index).', '<code>resample("D")</code> günlük kovalar oluşturur; boş günler de bir kova olur.', '<code>.sum()</code> aynı gündeki kayıtları toplar, boş kovaya 0 yazar.', 'Sonucu döndür.'],
  example=r'''
import pandas as pd
saatlik = pd.Series([5, 7, 1],
                    index=pd.to_datetime(["2026-06-01 09:15", "2026-06-01 09:40", "2026-06-01 12:05"]))
print(saatlik.resample("h").sum())   # 10, 11 ve 12 saatleri de görünür
''',
  start=r'''
import pandas as pd

def gunluk_tamamla(s):
    # TODO 1: indeksi sırala
    # TODO 2: günlük frekansa yeniden örnekle (resample)
    # TODO 3: her günün toplamını al (boş gün 0 olur) ve döndür
    return s
''',
  sol=r'''
import pandas as pd

def gunluk_tamamla(s):
    return s.sort_index().resample("D").sum()
''',
  tests=r'''
idx = pd.to_datetime(["2026-02-03", "2026-02-01", "2026-02-01", "2026-02-05"])
s = pd.Series([70, 100, 50, 30], index=idx)
r = gunluk_tamamla(s)
assert len(r) == 5, f"1-5 Şubat arası 5 gün olmalı, gelen {len(r)}"
assert r.tolist() == [150, 0, 70, 0, 30], f"Beklenen [150, 0, 70, 0, 30]; aynı gün toplanmalı, boş gün 0; gelen {r.tolist()}"
assert str(r.index[1].date()) == "2026-02-02", "Eksik gün (2 Şubat) indekste yer almalı"
''',
  hints=['Eksik günleri üretmek için frekans dönüşümü gerekir.', '<code>resample("D")</code> bir gruplayıcıdır; sonrasında toplama fonksiyonu çağırırsın.', '<code>return s.sort_index().resample("D").sum()</code>'],
  why='resample zaman ekseninde groupby gibidir: her gün bir kova olur, boş kova sum() ile 0 verir. Bu sayede grafikler ve hareketli ortalamalar boşluk yüzünden yanılmaz. O(n). Alternatifler: tekrar yoksa s.asfreq("D", fill_value=0); ya da s.groupby(level=0).sum().reindex(pd.date_range(min, max), fill_value=0). mean() kullanırsan boş gün nan olur; iş kuralına göre seç.',
  tags=['resample', 'eksik gün', 'asfreq'], min=5),

dict(id='b-326', topic='pandas Zaman Serisi', diff=2, kind='bug', needs=['pandas'],
  title='En son sipariş yanlış geliyor',
  q='<p>Kodda bir hata var, bul ve düzelt. <code>son_siparis(df)</code> en yeni tarihli siparişin <code>no</code> değerini döndürmeli. Tarihler <code>GG.AA.YYYY</code> biçiminde metin. Fonksiyon şubattaki bir siparişi martınkinden "daha yeni" sanıyor.</p>',
  start=r'''
import pandas as pd

def son_siparis(df):
    sirali = df.sort_values("tarih")
    return sirali.iloc[-1]["no"]
''',
  sol=r'''
import pandas as pd

def son_siparis(df):
    tarih = pd.to_datetime(df["tarih"], format="%d.%m.%Y")
    return df.loc[tarih.idxmax(), "no"]
''',
  tests=r'''
df = pd.DataFrame({"no": [101, 102, 103, 104],
                   "tarih": ["28.02.2026", "03.03.2026", "15.01.2026", "01.03.2026"]})
assert son_siparis(df) == 102, "En yeni tarih 03.03.2026 (no=102). Metin sıralaması '28.02' > '03.03' der; tarihe çevir"
df2 = pd.DataFrame({"no": [7, 8], "tarih": ["31.12.2025", "01.01.2026"]})
assert son_siparis(df2) == 8, "Yıl değişimi: 01.01.2026 daha yeni"
''',
  hints=['Metinler karakter karakter karşılaştırılır: "28..." &gt; "03..."', '<code>pd.to_datetime(..., format="%d.%m.%Y")</code> ile gerçek tarihe çevir.', '<code>idxmax()</code> en büyük değerin indeks etiketini verir.'],
  why='Metin sıralaması sözlük sırasıdır; GG.AA.YYYY biçiminde gün önde olduğu için kronolojiyle örtüşmez. Tarih tipine çevirince karşılaştırma doğru olur. format vermek hem hızlıdır hem de 03.04’ün 3 Nisan mı 4 Mart mı olduğu belirsizliğini kaldırır. idxmax O(n); sort_values O(n log n) gereksizdir. Alternatif: YYYY-MM-DD (ISO 8601) saklanırsa metin sıralaması da kronolojik olur.',
  tags=['to_datetime', 'format', 'idxmax'], min=4),

dict(id='b-327', topic='pandas Zaman Serisi', diff=3, kind='yaz', needs=['pandas'],
  title='İşlem anındaki geçerli kur (merge_asof)',
  q='<p>Anadolu Bank USD işlemlerini TL\'ye çevirecek. Kurlar düzensiz zamanlarda yayımlanıyor; her işlem için <b>işlem anında veya ondan önce yayımlanmış en son kur</b> kullanılmalı. <code>try_cevir(islemler, kurlar)</code> fonksiyonunu yaz: <code>islemler</code> (zaman, tutar_usd) ve <code>kurlar</code> (zaman, kur) DataFrame\'leri; zamanlar metin. İşlemler <b>sırasız</b> gelebilir; sonucu işlemlerin <b>orijinal sırasında</b>, 2 ondalık TL listesi olarak döndür.</p>',
  start=r'''
import pandas as pd

def try_cevir(islemler, kurlar):
    pass
''',
  sol=r'''
import pandas as pd

def try_cevir(islemler, kurlar):
    i = islemler.assign(zaman=pd.to_datetime(islemler["zaman"]), _sira=range(len(islemler)))
    k = kurlar.assign(zaman=pd.to_datetime(kurlar["zaman"]))
    m = pd.merge_asof(i.sort_values("zaman"), k.sort_values("zaman"), on="zaman", direction="backward")
    m = m.sort_values("_sira")
    return (m["tutar_usd"] * m["kur"]).round(2).tolist()
''',
  tests=r'''
kurlar = pd.DataFrame({"zaman": ["2026-04-01 09:00", "2026-04-01 12:00", "2026-04-01 15:30"],
                       "kur": [38.10, 38.25, 38.40]})
islemler = pd.DataFrame({"zaman": ["2026-04-01 16:00", "2026-04-01 09:30", "2026-04-01 12:00", "2026-04-01 11:59"],
                         "tutar_usd": [100, 10, 20, 1000]})
r = try_cevir(islemler, kurlar)
assert len(r) == 4, "Her işlem için bir sonuç"
assert r == [3840.0, 381.0, 765.0, 38100.0], f"Beklenen [3840.0, 381.0, 765.0, 38100.0] (orijinal sırada); gelen {r}. 12:00 işlemi 12:00 kurunu (dahil) kullanır, 11:59 ise 09:00 kurunu"
''',
  hints=['<code>pd.merge_asof(sol, sag, on="zaman", direction="backward")</code> her satıra önceki en yakın eşleşmeyi bağlar.', 'merge_asof iki tablonun da anahtar sütuna göre <b>sıralı</b> olmasını ister; orijinal sırayı korumak için önce bir sıra numarası sütunu ekle.', 'Birleştirmeden sonra sıra sütununa göre geri sırala, sonra tutar × kur.'],
  why='merge_asof "en yakın önceki" eşleşmesini sıralı iki tablo üzerinde iki işaretçiyle yapar: O((n+m) log) (sıralama baskın). Normal merge tam eşitlik ister ve burada işe yaramaz. direction="backward" ileriye bakmayı (gelecekteki kuru kullanmayı, yani veri sızıntısını) engeller. Alternatif: kurlar.set_index("zaman")["kur"].asof(islem_zamanlari) ya da searchsorted ile indeks bulmak; ayrıca tolerance=pd.Timedelta("1D") ile çok eski kurları dışlayabilirsin.',
  tags=['merge_asof', 'zaman eşleme', 'sıralama'], min=12),

dict(id='b-328', topic='pandas Zaman Serisi', diff=2, kind='tamamla', needs=['pandas'],
  title='Hafta sonu ciro payı',
  q='<p>Pazarlama ekibi cironun yüzde kaçının hafta sonu (Cumartesi-Pazar) geldiğini soruyor. <code>hafta_sonu_payi(df)</code> fonksiyonundaki <code>___</code> boşluklarını doldur. <code>dayofweek</code> pazartesiyi 0, pazarı 6 kabul eder.</p>',
  start=r'''
import pandas as pd

def hafta_sonu_payi(df):
    t = pd.to_datetime(df["tarih"])
    hafta_sonu = t.dt.___ >= 5
    return round(df.loc[___, "ciro"].sum() / df["ciro"].sum() * 100, 1)
''',
  sol=r'''
import pandas as pd

def hafta_sonu_payi(df):
    t = pd.to_datetime(df["tarih"])
    hafta_sonu = t.dt.dayofweek >= 5
    return round(df.loc[hafta_sonu, "ciro"].sum() / df["ciro"].sum() * 100, 1)
''',
  tests=r'''
df = pd.DataFrame({"tarih": ["2026-10-23", "2026-10-24", "2026-10-25", "2026-10-26"],
                   "ciro": [100, 300, 200, 400]})
r = hafta_sonu_payi(df)
assert abs(r - 50.0) < 1e-9, f"24 Ekim Cumartesi + 25 Ekim Pazar = 500 / 1000 → 50.0; gelen {r}"
df2 = pd.DataFrame({"tarih": ["2026-10-26", "2026-10-27"], "ciro": [10, 20]})
assert hafta_sonu_payi(df2) == 0, "Hiç hafta sonu yoksa pay 0"
''',
  hints=['Datetime Series\'in tarih bileşenlerine <code>.dt</code> erişimcisiyle ulaşırsın.', 'Haftanın günü: <code>.dt.dayofweek</code> (0=Pzt … 6=Paz).', 'loc\'a satır seçici olarak boolean maskeyi (<code>hafta_sonu</code>) ver.'],
  why='.dt erişimcisi tüm sütun için tarih bileşenlerini vektörel üretir: O(n). dayofweek sayı döndürdüğü için yerel ayardan (dil) bağımsızdır; day_name() ise İngilizce gün adı verir ve karşılaştırmada dil sorunu çıkarır. Alternatif: df.groupby(t.dt.dayofweek >= 5)["ciro"].sum() ile iki grubu birden görmek; resmî tatilleri de saymak için ayrı bir tatil takvimi tablosu ile isin() kullanılır.',
  tags=['dt', 'dayofweek', 'boolean maske'], min=3),

dict(id='b-329', topic='İstatistik', diff=2, kind='predict', needs=['numpy', 'pandas'],
  title='İki standart sapma, iki sonuç',
  q='<p>Aynı veri için numpy ve pandas standart sapması hesaplanıyor. Bu kod ne yazdırır?</p>',
  code=r'''
import numpy as np
import pandas as pd

x = [2, 4, 4, 4, 5, 5, 7, 9]
print(np.std(x), round(pd.Series(x).std(), 3))
''',
  o=['2.0 2.138', '2.138 2.138', '2.0 2.0', '2.138 2.0'], a=0,
  hints=['İki kütüphanenin varsayılan serbestlik derecesi (ddof) farklıdır.', 'numpy ddof=0 (popülasyon), pandas ddof=1 (örneklem).'],
  why='np.std varsayılan ddof=0 ile n’e böler (popülasyon): √(32/8) = 2.0. pandas Series.std ddof=1 ile n−1’e böler (örneklem, Bessel düzeltmesi): √(32/7) ≈ 2.138. Örneklemden popülasyon tahmini yapıyorsan ddof=1 doğrudur; tutarlılık için np.std(x, ddof=1) ya da statistics.stdev kullan (statistics.pstdev popülasyon sürümüdür).',
  tags=['std', 'ddof', 'örneklem'], min=3),

dict(id='b-330', topic='İstatistik', diff=3, kind='rehberli', needs=['scipy', 'numpy'],
  title='A/B testi: Welch t-testi',
  q='<p>Anadolu Market yeni ödeme sayfasını (B) eskisiyle (A) karşılaştırıyor; metrik sepet tutarı. Grupların varyansları farklı olabilir. <code>ab_testi(a, b, alfa=0.05)</code> fonksiyonunu yaz: <b>B − A</b> yönünde Welch t-testi yapsın ve <code>{"t": t (3 ondalık), "p": p (4 ondalık), "anlamli": p &lt; alfa}</code> sözlüğü döndürsün.</p>',
  guide=['<code>from scipy import stats</code> ile modülü al.', '<code>stats.ttest_ind(b, a, equal_var=False)</code> çağır; ilk argüman B olunca t pozitifse B ortalaması daha yüksektir.', 'Dönen nesneden t ve p değerini al (<code>t, p = ...</code> açılımı her sürümde çalışır).', 'Sözlüğü yuvarlanmış değerlerle kur; <code>anlamli</code> için Python <code>bool</code> kullan.'],
  example=r'''
from scipy import stats
# Tek örneklem: teslim süreleri 48 saat hedefinden farklı mı?
sureler = [50, 47, 53, 49, 55, 51]
t, p = stats.ttest_1samp(sureler, 48)
print(round(t, 3), round(p, 4), p < 0.05)
''',
  start=r'''
from scipy import stats

def ab_testi(a, b, alfa=0.05):
    # TODO 1: Welch t-testi (eşit varyans varsayma), yön B - A
    # TODO 2: t ve p değerlerini al
    # TODO 3: sözlüğü döndür: t (3 ondalık), p (4 ondalık), anlamli (bool)
    return {}
''',
  sol=r'''
from scipy import stats

def ab_testi(a, b, alfa=0.05):
    t, p = stats.ttest_ind(b, a, equal_var=False)
    return {"t": round(float(t), 3), "p": round(float(p), 4), "anlamli": bool(p < alfa)}
''',
  tests=r'''
import math
from scipy import stats as _st
a = [120, 135, 128, 110, 142, 125, 131, 118]
b = [150, 138, 162, 171, 129, 158, 166, 149, 140]
def _welch(a, b):
    ma, mb = sum(a) / len(a), sum(b) / len(b)
    va = sum((x - ma) ** 2 for x in a) / (len(a) - 1)
    vb = sum((x - mb) ** 2 for x in b) / (len(b) - 1)
    se2 = va / len(a) + vb / len(b)
    t = (mb - ma) / math.sqrt(se2)
    df = se2 ** 2 / ((va / len(a)) ** 2 / (len(a) - 1) + (vb / len(b)) ** 2 / (len(b) - 1))
    return t, 2 * _st.t.sf(abs(t), df)
t0, p0 = _welch(a, b)
r = ab_testi(a, b)
assert set(r) == {"t", "p", "anlamli"}, "Anahtarlar: t, p, anlamli"
assert r["t"] > 0, "Yön B - A olmalı: ttest_ind(b, a, ...) — B ortalaması büyük, t pozitif"
assert abs(r["t"] - round(t0, 3)) < 1e-3, f"Welch t değeri {round(t0, 3)} olmalı; equal_var=False unutulmuş olabilir"
assert abs(r["p"] - round(p0, 4)) < 1e-4, f"Welch p değeri {round(p0, 4)} olmalı"
assert r["anlamli"] is True, "p < 0.05 → anlamlı (Python bool True)"
r2 = ab_testi([10, 12, 11, 13], [11, 12, 10, 13])
assert r2["anlamli"] is False, "Ortalamalar neredeyse aynı → anlamlı değil"
''',
  hints=['Varyanslar eşit varsayılmıyorsa t-testinin Welch sürümü kullanılır.', '<code>stats.ttest_ind(b, a, equal_var=False)</code>', 'numpy türlerini <code>float()</code> ve <code>bool()</code> ile Python türüne çevir; testler <code>is True</code> kontrolü yapar.'],
  why='Welch t-testi grup varyanslarını ayrı tahmin eder; varyanslar ya da örneklem büyüklükleri farklıyken Student t-testinden (equal_var=True) daha güvenilirdir ve modern varsayılan önerisidir. Hesap O(n). p < alfa "fark sıfırdır" hipotezini reddetmek demektir, etkinin büyüklüğünü söylemez; raporlarda ortalama farkı ve güven aralığını da ver. Dağılım çok çarpıksa alternatif: stats.mannwhitneyu ya da bootstrap.',
  tags=['ttest_ind', 'Welch', 'A/B testi', 'p-değeri'], min=8),
]
