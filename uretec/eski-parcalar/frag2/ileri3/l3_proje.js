/* ───────────────────────── 3. proje-ileri ───────────────────────── */
// needs: pandas
{
  id: 'proje-ileri',
  lv: 'ileri',
  mod: 'Bitirme',
  min: 90,
  needs: ['pandas'],
  title: 'Bitirme projesi: Anadolu Market müşteri analitiği paketi',
  sum: 'pandas ile RFM segmentasyonu ve kohort analizi, async ile sayfalı veri çekme, argparse CLI ve unittest içeren uçtan uca bir analitik paket kurarsın.',
  goals: [
    'Sipariş verisinden müşteri başına recency/frequency/monetary ölçütlerini hesaplayıp quantile skorlarıyla segment üretebilirim.',
    'İlk sipariş ayına göre kohort tablosu kurup müşteri tutundurmayı (retention) okuyabilirim.',
    'groupby ile en çok satan ürün ve kategoriyi ciro ve adetle raporlayabilirim.',
    'asyncio ile sayfalı bir API\'den tüm kayıtları sırayla ve güvenli biçimde çekebilirim.',
    'argparse ile alt komutlu bir CLI tasarlayıp iş mantığını unittest ile test edebilirim.'
  ],
  body: `
<h2>Proje: müşteri analitiği paketi</h2>
<p>Anadolu Market\'in pazarlama ekibi üç soru soruyor: "Hangi müşterilere kampanya gönderelim?", "Yeni gelen müşteriler ikinci ay geri dönüyor mu?", "Hangi ürün ve kategori ciroyu taşıyor?" Bu projede üç soruyu cevaplayan, komut satırından çalışan ve testli bir paket kuracaksın. Paket, önceki derslerin hepsini birleştirir: pandas (groupby, qcut, pivot), asyncio (sayfalı veri çekme), argparse (CLI), unittest (doğrulama).</p>
<div class="tbl-wrap"><table>
<tr><th>Modül</th><th>Sorumluluk</th><th>Ana fonksiyonlar</th></tr>
<tr><td>veri.py</td><td>Ham kayıtları DataFrame\'e çevirmek</td><td>siparis_df</td></tr>
<tr><td>rfm.py</td><td>RFM ölçütleri, skor, segment</td><td>rfm_hesapla, rfm_skor, segment</td></tr>
<tr><td>kohort.py</td><td>İlk sipariş ayına göre tutundurma tablosu</td><td>kohort_tablosu</td></tr>
<tr><td>urun.py</td><td>En çok satan ürün/kategori</td><td>en_cok_satan</td></tr>
<tr><td>api.py</td><td>Sayfalı veri çekme (async)</td><td>api_sayfa, hepsini_cek</td></tr>
<tr><td>cli.py</td><td>argparse ile komutlar</td><td>parse_args, main</td></tr>
<tr><td>tests/</td><td>unittest</td><td>TestRfm, TestKohort</td></tr>
</table></div>
<div class="note"><b>Her kutu bağımsız</b>Bu sayfadaki her kod kutusu kendi başına çalışır; bu yüzden örnek veri ve gerekli fonksiyonlar her kutuda yeniden kurulur. Gerçek pakette hepsi ayrı modüllerde bir kez yazılır.</div>
<div class="note"><b>Sürüm uyumu</b>Bu uygulama tarayıcıda pandas 2.2, bilgisayarında büyük olasılıkla pandas 3.x çalıştırır. İkisinde de aynı sonucu veren sade bir API kullanacağız: <code>groupby(..., observed=True)</code> belirt, <code>inplace=True</code> kullanma (kopya döndür), <code>pd.qcut</code>\'tan önce <code>rank(method="first")</code> uygula, kategorik/str tür ayrıntılarına yaslanma.</div>

<h2>1. Veri katmanı</h2>
<p>Veri ders içinde küçük bir sözlük listesi; gerçek hayatta aynı yapı CSV ya da API\'den gelir. İlk iş tarihi gerçek tarih türüne çevirmek ve ay sütununu çıkarmak:</p>
<pre class="py">import pandas as pd

KAYITLAR = [
    {"musteri": "Ayşe", "tarih": "2024-01-05", "urun": "Kalem", "kategori": "Kırtasiye", "tutar": 120.0},
    {"musteri": "Mehmet", "tarih": "2024-01-12", "urun": "Kulaklık", "kategori": "Elektronik", "tutar": 850.0},
    {"musteri": "Ayşe", "tarih": "2024-02-03", "urun": "Defter", "kategori": "Kırtasiye", "tutar": 60.0},
    {"musteri": "Zeynep", "tarih": "2024-02-10", "urun": "Kulaklık", "kategori": "Elektronik", "tutar": 850.0},
    {"musteri": "Ayşe", "tarih": "2024-03-15", "urun": "Kulaklık", "kategori": "Elektronik", "tutar": 850.0},
    {"musteri": "Mehmet", "tarih": "2024-03-20", "urun": "Kalem", "kategori": "Kırtasiye", "tutar": 120.0},
    {"musteri": "Ali", "tarih": "2024-03-22", "urun": "Çanta", "kategori": "Aksesuar", "tutar": 400.0},
    {"musteri": "Zeynep", "tarih": "2024-04-01", "urun": "Defter", "kategori": "Kırtasiye", "tutar": 60.0},
    {"musteri": "Ali", "tarih": "2024-04-18", "urun": "Kalem", "kategori": "Kırtasiye", "tutar": 120.0},
    {"musteri": "Elif", "tarih": "2024-04-25", "urun": "Çanta", "kategori": "Aksesuar", "tutar": 400.0},
]

def siparis_df(kayitlar):
    df = pd.DataFrame(kayitlar)
    df["tarih"] = pd.to_datetime(df["tarih"])
    df["ay"] = df["tarih"].dt.to_period("M").astype(str)
    return df

df = siparis_df(KAYITLAR)
print(df[["musteri", "ay", "tutar"]].head())
print("satır:", len(df), "| müşteri:", df["musteri"].nunique())</pre>
<p><code>to_period("M")</code> tarihi aya yuvarlar; <code>astype(str)</code> ile "2024-01" gibi karşılaştırması kolay bir metne çevirmek iki pandas sürümünde de aynı davranır.</p>

<h2>2. RFM segmentasyonu</h2>
<p>RFM üç ölçüt: <b>Recency</b> (son siparişten bu yana geçen gün; az olması iyi), <b>Frequency</b> (sipariş sayısı), <b>Monetary</b> (toplam harcama). Her müşteri için üçünü hesaplayıp her birini 1-4 arası skora çeviririz; skorların toplamı segment belirler.</p>
<pre class="py">import pandas as pd

df = pd.DataFrame({
    "musteri": ["Ayşe", "Mehmet", "Ayşe", "Zeynep", "Ayşe", "Mehmet", "Ali", "Zeynep", "Ali", "Elif"],
    "tarih": pd.to_datetime(["2024-01-05", "2024-01-12", "2024-02-03", "2024-02-10", "2024-03-15",
                             "2024-03-20", "2024-03-22", "2024-04-01", "2024-04-18", "2024-04-25"]),
    "urun": ["Kalem", "Kulaklık", "Defter", "Kulaklık", "Kulaklık", "Kalem", "Çanta", "Defter", "Kalem", "Çanta"],
    "kategori": ["Kırtasiye", "Elektronik", "Kırtasiye", "Elektronik", "Elektronik", "Kırtasiye", "Aksesuar", "Kırtasiye", "Kırtasiye", "Aksesuar"],
    "tutar": [120.0, 850.0, 60.0, 850.0, 850.0, 120.0, 400.0, 60.0, 120.0, 400.0],
})

def rfm_hesapla(df, bugun):
    bugun = pd.Timestamp(bugun)
    g = df.groupby("musteri", observed=True)
    rfm = pd.DataFrame({
        "recency": (bugun - g["tarih"].max()).dt.days,
        "frequency": g["tarih"].count(),
        "monetary": g["tutar"].sum(),
    })
    return rfm.reset_index()

rfm = rfm_hesapla(df, "2024-05-01")
print(rfm)</pre>
<p>Skorlama için quantile (çeyreklik) kullanırız: müşterileri ölçüte göre dört eşit gruba böl, en iyi gruba 4 ver. <code>pd.qcut</code> bunu yapar; ancak aynı değere sahip çok müşteri varsa "kenarlar tekrarlı" hatası verir. Çare, önce <code>rank(method="first")</code> ile her müşteriye benzersiz bir sıra vermek. Recency\'de küçük değer iyi olduğu için etiketleri ters çeviririz.</p>
<pre class="py">import pandas as pd

df = pd.DataFrame({
    "musteri": ["Ayşe", "Mehmet", "Ayşe", "Zeynep", "Ayşe", "Mehmet", "Ali", "Zeynep", "Ali", "Elif"],
    "tarih": pd.to_datetime(["2024-01-05", "2024-01-12", "2024-02-03", "2024-02-10", "2024-03-15",
                             "2024-03-20", "2024-03-22", "2024-04-01", "2024-04-18", "2024-04-25"]),
    "urun": ["Kalem", "Kulaklık", "Defter", "Kulaklık", "Kulaklık", "Kalem", "Çanta", "Defter", "Kalem", "Çanta"],
    "kategori": ["Kırtasiye", "Elektronik", "Kırtasiye", "Elektronik", "Elektronik", "Kırtasiye", "Aksesuar", "Kırtasiye", "Kırtasiye", "Aksesuar"],
    "tutar": [120.0, 850.0, 60.0, 850.0, 850.0, 120.0, 400.0, 60.0, 120.0, 400.0],
})

def rfm_hesapla(df, bugun):
    bugun = pd.Timestamp(bugun)
    g = df.groupby("musteri", observed=True)
    rfm = pd.DataFrame({
        "recency": (bugun - g["tarih"].max()).dt.days,
        "frequency": g["tarih"].count(),
        "monetary": g["tutar"].sum(),
    })
    return rfm.reset_index()

def rfm_skor(rfm, q=4):
    rfm = rfm.copy()
    etiket = list(range(1, q + 1))
    rfm["R"] = pd.qcut(rfm["recency"].rank(method="first"), q, labels=etiket[::-1]).astype(int)
    rfm["F"] = pd.qcut(rfm["frequency"].rank(method="first"), q, labels=etiket).astype(int)
    rfm["M"] = pd.qcut(rfm["monetary"].rank(method="first"), q, labels=etiket).astype(int)
    rfm["skor"] = rfm["R"] + rfm["F"] + rfm["M"]
    return rfm

def segment(skor, q=4):
    ust = 3 * q
    if skor &gt;= ust - 2:
        return "Şampiyon"
    if skor &gt;= ust - 5:
        return "Sadık"
    if skor &gt;= 6:
        return "Potansiyel"
    return "Riskli"

rfm = rfm_hesapla(df, "2024-05-01")
skorlu = rfm_skor(rfm)
skorlu["segment"] = skorlu["skor"].apply(segment)
print(skorlu[["musteri", "R", "F", "M", "skor", "segment"]])</pre>
<div class="tip"><b>Neden rank(method="first")?</b>Beş müşteriden üçünün frequency\'si 2 ise qcut dört kutuya bölemez ve ValueError verir. rank(method="first") eşitleri görülme sırasına göre ayırır; kutu sınırları benzersiz olur. Üretimde eşitlik bozma kuralını (ör. son sipariş tarihi) belgele; farklı sürümlerde sıra değişmesin diye önce sırala.</div>

<h2>3. Kohort analizi</h2>
<p>Kohort (cohort), ilk siparişini aynı ayda veren müşteri grubudur. Soru: Ocak kohortundan kaç müşteri şubatta (1. ay), martta (2. ay) yine alışveriş yaptı? Hesap üç adım: her müşterinin ilk ayı, her siparişin ilk aya göre kaçıncı ayda olduğu, kohort × ay_no tablosunda benzersiz müşteri sayısı. Ay farkını sürümden bağımsız hesaplamak için yıl*12+ay tamsayısını kullanıyoruz.</p>
<pre class="py">import pandas as pd

df = pd.DataFrame({
    "musteri": ["Ayşe", "Mehmet", "Ayşe", "Zeynep", "Ayşe", "Mehmet", "Ali", "Zeynep", "Ali", "Elif"],
    "tarih": pd.to_datetime(["2024-01-05", "2024-01-12", "2024-02-03", "2024-02-10", "2024-03-15",
                             "2024-03-20", "2024-03-22", "2024-04-01", "2024-04-18", "2024-04-25"]),
    "urun": ["Kalem", "Kulaklık", "Defter", "Kulaklık", "Kulaklık", "Kalem", "Çanta", "Defter", "Kalem", "Çanta"],
    "kategori": ["Kırtasiye", "Elektronik", "Kırtasiye", "Elektronik", "Elektronik", "Kırtasiye", "Aksesuar", "Kırtasiye", "Kırtasiye", "Aksesuar"],
    "tutar": [120.0, 850.0, 60.0, 850.0, 850.0, 120.0, 400.0, 60.0, 120.0, 400.0],
})

def ay_index(seri):
    return seri.dt.year * 12 + seri.dt.month

def kohort_tablosu(df):
    df = df.copy()
    ilk = df.groupby("musteri", observed=True)["tarih"].min()
    df["ilk"] = df["musteri"].map(ilk)
    df["kohort"] = df["ilk"].dt.to_period("M").astype(str)
    df["ay_no"] = ay_index(df["tarih"]) - ay_index(df["ilk"])
    tablo = (df.groupby(["kohort", "ay_no"], observed=True)["musteri"]
               .nunique().unstack(fill_value=0))
    return tablo

tablo = kohort_tablosu(df)
print(tablo)
print("Ocak kohortu 2. ayda:", int(tablo.loc["2024-01", 2]))</pre>
<p>Tabloyu okuma: satır kohort, sütun ilk aydan itibaren geçen ay. 0. sütun kohort büyüklüğüdür; sonraki sütunları ona bölersen tutundurma oranını (retention rate) elde edersin. Üretimde bu tablo ısı haritasına dönüşür.</p>

<h2>4. En çok satan ürün ve kategori</h2>
<pre class="py">import pandas as pd

df = pd.DataFrame({
    "musteri": ["Ayşe", "Mehmet", "Ayşe", "Zeynep", "Ayşe", "Mehmet", "Ali", "Zeynep", "Ali", "Elif"],
    "tarih": pd.to_datetime(["2024-01-05", "2024-01-12", "2024-02-03", "2024-02-10", "2024-03-15",
                             "2024-03-20", "2024-03-22", "2024-04-01", "2024-04-18", "2024-04-25"]),
    "urun": ["Kalem", "Kulaklık", "Defter", "Kulaklık", "Kulaklık", "Kalem", "Çanta", "Defter", "Kalem", "Çanta"],
    "kategori": ["Kırtasiye", "Elektronik", "Kırtasiye", "Elektronik", "Elektronik", "Kırtasiye", "Aksesuar", "Kırtasiye", "Kırtasiye", "Aksesuar"],
    "tutar": [120.0, 850.0, 60.0, 850.0, 850.0, 120.0, 400.0, 60.0, 120.0, 400.0],
})

def en_cok_satan(df, sutun="urun", n=3):
    g = df.groupby(sutun, observed=True)["tutar"].agg(["count", "sum"]).reset_index()
    g.columns = [sutun, "adet", "ciro"]
    return (g.sort_values(["ciro", sutun], ascending=[False, True])
             .head(n).reset_index(drop=True))

print(en_cok_satan(df))
print(en_cok_satan(df, "kategori", 2))</pre>
<p>Sıralamada ikinci anahtar olarak ürün adını eklemek, eşit ciroda sonucu deterministik yapar; testler bunu sever.</p>

<h2>5. Sahte API\'den sayfalı veri çekme</h2>
<p>Gerçek sistemde siparişler bir API\'den sayfa sayfa gelir: <code>?sayfa=0&amp;boyut=100</code>. Ağ erişimimiz yok, bu yüzden API\'yi <code>asyncio.sleep</code> ile bekleyen bir coroutine olarak simüle ediyoruz. Yanıt, veriyi ve "son sayfa mı" bilgisini taşır; istemci son sayfaya kadar döner.</p>
<pre class="py">import asyncio

KAYITLAR = [{"id": i, "tutar": 100 + i * 10} for i in range(10)]

async def api_sayfa(kayitlar, sayfa, boyut):
    await asyncio.sleep(0.01)            # ağ gecikmesi simülasyonu
    bas = sayfa * boyut
    return {"veri": kayitlar[bas:bas + boyut], "son": bas + boyut &gt;= len(kayitlar)}

async def hepsini_cek(kayitlar, boyut):
    hepsi, sayfa = [], 0
    while True:
        yanit = await api_sayfa(kayitlar, sayfa, boyut)
        hepsi.extend(yanit["veri"])
        if yanit["son"]:
            break
        sayfa += 1
    return hepsi, sayfa + 1

loop = asyncio.new_event_loop()
veri, sayfa_sayisi = loop.run_until_complete(hepsini_cek(KAYITLAR, 4))
loop.close()
print(len(veri), "kayıt,", sayfa_sayisi, "sayfa")</pre>
<p>Sayfalar birbirine bağlı (bir sonrakini çekmek için öncekinin "son" bilgisi gerekir), bu yüzden sıralı await doğru. Toplam sayfa sayısı önceden biliniyorsa <code>gather</code> ile paralel çekmek mümkündür; alıştırmada iki yaklaşımı da göreceksin.</p>
<div class="warn"><b>Olay döngüsü</b>Tarayıcıda ve Jupyter\'da zaten bir döngü çalıştığı için <code>asyncio.run</code> hata verebilir; <code>new_event_loop().run_until_complete</code> kalıbı her ortamda çalışır.</div>

<h2>6. CLI: argparse ile alt komutlar</h2>
<p>Pazarlama ekibi kod yazmadan <code>python -m analitik rfm --bugun 2024-05-01</code> diyebilmeli. <code>parse_args</code> fonksiyonuna liste verebilmek test için kritik: <code>sys.argv</code> yerine <code>parse_args(["rfm", "--q", "3"])</code> ile her komutu testte deneyebilirsin.</p>
<pre class="py">import argparse

def parse_args(argv=None):
    p = argparse.ArgumentParser(prog="analitik", description="Anadolu Market müşteri analitiği")
    p.add_argument("komut", choices=["rfm", "kohort", "top"])
    p.add_argument("--bugun", default="2024-05-01")
    p.add_argument("--q", type=int, default=4)
    p.add_argument("--n", type=int, default=3)
    p.add_argument("--sutun", choices=["urun", "kategori"], default="urun")
    return p.parse_args(argv)

a = parse_args(["top", "--sutun", "kategori", "--n", "2"])
print(a.komut, a.sutun, a.n)
try:
    parse_args(["sil"])
except SystemExit as e:
    print("geçersiz komut, çıkış kodu:", e.code)</pre>
<p><code>main(argv)</code> fonksiyonu argümana göre ilgili fonksiyonu çağırıp sonucu yazdırır; iş mantığı CLI\'dan ayrı kaldığı için testler <code>main</code>\'e dokunmadan hesap fonksiyonlarını doğrular.</p>

<h2>7. unittest ile doğrulama</h2>
<pre class="code">import unittest

class TestRfm(unittest.TestCase):
    def setUp(self):
        self.df = siparis_df(KAYITLAR)

    def test_recency_ayse(self):
        rfm = rfm_hesapla(self.df, "2024-05-01").set_index("musteri")
        self.assertEqual(int(rfm.loc["Ayşe", "recency"]), 47)

    def test_skor_araligi(self):
        sk = rfm_skor(rfm_hesapla(self.df, "2024-05-01"))
        self.assertTrue(sk["skor"].between(3, 12).all())

if __name__ == "__main__":
    unittest.main(argv=["x"], exit=False)</pre>
<p><code>setUp</code> her testten önce taze veri kurar. Tarayıcıda <code>unittest.main(argv=["x"], exit=False)</code> kalıbı gerekir; aksi halde unittest tarayıcının argümanlarını okumaya çalışır ve çıkış yapar.</p>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Üretime taşırken</h3>
<p>Gerçek paket şu farklarla büyür: veri CSV/parquet ya da veritabanından okunur (<code>pd.read_sql</code>), API çağrıları httpx ile yapılır ve yeniden deneme (retry) + zaman aşımı eklenir, çıktı parquet ya da bir BI aracına yazılır, iş akışı zamanlayıcıyla (cron, Airflow) her gece koşar. RFM eşikleri sabit kodlanmaz, yapılandırma dosyasından okunur.</p>
<h3>Sürüm uyumunu test etmek</h3>
<p>pandas 2.2 ve 3.x farkları (varsayılan str türü, Copy-on-Write, groupby observed varsayılanı) için CI matrisinde iki sürümü de koştur. <code>inplace</code>\'ten kaçınmak, <code>observed=True</code> yazmak ve zincirleme atama yapmamak uyumun yüzde doksanıdır.</p>
<h3>RFM\'in ötesi</h3>
<p>RFM basit ve açıklanabilir olduğu için hâlâ yaygın; ama müşteri yaşam boyu değeri (CLV) tahmini, kayıp (churn) olasılığı ve ürün öneri sistemleri bir sonraki adımdır. Hepsi aynı veri katmanının üstüne kurulur; bu projedeki <code>siparis_df</code> temel kalır.</p>
<h3>Performans</h3>
<p>Milyonlarca satırda <code>apply(segment)</code> yavaşlar; <code>pd.cut</code> ile vektörel segmentleme ya da <code>np.select</code> kullan. Kohort tablosu için <code>pivot_table</code> ve kategorik türler belleği düşürür.</p>
</section>`,
  ex: [
    { t: 'code', id: 'proje-ileri-1',
      q: '<p>Parça 1: <code>siparis_df(kayitlar)</code> ve <code>rfm_hesapla(df, bugun)</code> fonksiyonlarını yaz. <code>siparis_df</code> sözlük listesini DataFrame\'e çevirsin, <code>tarih</code> sütununu datetime yapsın, <code>ay</code> sütununu <code>"YYYY-MM"</code> metni olarak eklesin. <code>rfm_hesapla</code> müşteri başına <code>recency</code> (bugün - son sipariş, gün), <code>frequency</code> (sipariş adedi) ve <code>monetary</code> (toplam tutar) sütunlarıyla, <code>musteri</code> sütunu olan (indeks değil) bir DataFrame döndürsün.</p>',
      start: 'import pandas as pd\n\nKAYITLAR = [\n    {"musteri": "Ayşe", "tarih": "2024-01-05", "urun": "Kalem", "kategori": "Kırtasiye", "tutar": 120.0},\n    {"musteri": "Mehmet", "tarih": "2024-01-12", "urun": "Kulaklık", "kategori": "Elektronik", "tutar": 850.0},\n    {"musteri": "Ayşe", "tarih": "2024-02-03", "urun": "Defter", "kategori": "Kırtasiye", "tutar": 60.0},\n    {"musteri": "Zeynep", "tarih": "2024-02-10", "urun": "Kulaklık", "kategori": "Elektronik", "tutar": 850.0},\n    {"musteri": "Ayşe", "tarih": "2024-03-15", "urun": "Kulaklık", "kategori": "Elektronik", "tutar": 850.0},\n    {"musteri": "Mehmet", "tarih": "2024-03-20", "urun": "Kalem", "kategori": "Kırtasiye", "tutar": 120.0},\n    {"musteri": "Ali", "tarih": "2024-03-22", "urun": "Çanta", "kategori": "Aksesuar", "tutar": 400.0},\n    {"musteri": "Zeynep", "tarih": "2024-04-01", "urun": "Defter", "kategori": "Kırtasiye", "tutar": 60.0},\n    {"musteri": "Ali", "tarih": "2024-04-18", "urun": "Kalem", "kategori": "Kırtasiye", "tutar": 120.0},\n    {"musteri": "Elif", "tarih": "2024-04-25", "urun": "Çanta", "kategori": "Aksesuar", "tutar": 400.0},\n]\n\ndef siparis_df(kayitlar):\n    pass\n\ndef rfm_hesapla(df, bugun):\n    pass\n',
      sol: 'import pandas as pd\n\nKAYITLAR = [\n    {"musteri": "Ayşe", "tarih": "2024-01-05", "urun": "Kalem", "kategori": "Kırtasiye", "tutar": 120.0},\n    {"musteri": "Mehmet", "tarih": "2024-01-12", "urun": "Kulaklık", "kategori": "Elektronik", "tutar": 850.0},\n    {"musteri": "Ayşe", "tarih": "2024-02-03", "urun": "Defter", "kategori": "Kırtasiye", "tutar": 60.0},\n    {"musteri": "Zeynep", "tarih": "2024-02-10", "urun": "Kulaklık", "kategori": "Elektronik", "tutar": 850.0},\n    {"musteri": "Ayşe", "tarih": "2024-03-15", "urun": "Kulaklık", "kategori": "Elektronik", "tutar": 850.0},\n    {"musteri": "Mehmet", "tarih": "2024-03-20", "urun": "Kalem", "kategori": "Kırtasiye", "tutar": 120.0},\n    {"musteri": "Ali", "tarih": "2024-03-22", "urun": "Çanta", "kategori": "Aksesuar", "tutar": 400.0},\n    {"musteri": "Zeynep", "tarih": "2024-04-01", "urun": "Defter", "kategori": "Kırtasiye", "tutar": 60.0},\n    {"musteri": "Ali", "tarih": "2024-04-18", "urun": "Kalem", "kategori": "Kırtasiye", "tutar": 120.0},\n    {"musteri": "Elif", "tarih": "2024-04-25", "urun": "Çanta", "kategori": "Aksesuar", "tutar": 400.0},\n]\n\ndef siparis_df(kayitlar):\n    df = pd.DataFrame(kayitlar)\n    df["tarih"] = pd.to_datetime(df["tarih"])\n    df["ay"] = df["tarih"].dt.to_period("M").astype(str)\n    return df\n\ndef rfm_hesapla(df, bugun):\n    bugun = pd.Timestamp(bugun)\n    g = df.groupby("musteri", observed=True)\n    rfm = pd.DataFrame({\n        "recency": (bugun - g["tarih"].max()).dt.days,\n        "frequency": g["tarih"].count(),\n        "monetary": g["tutar"].sum(),\n    })\n    return rfm.reset_index()\n',
      tests: 'import pandas as pd\ndf = siparis_df(KAYITLAR)\nassert len(df) == 10, "10 satır"\nassert pd.api.types.is_datetime64_any_dtype(df["tarih"]), "tarih datetime olmalı"\nassert list(df["ay"].head(3)) == ["2024-01", "2024-01", "2024-02"], "ay sütunu YYYY-MM metni"\nrfm = rfm_hesapla(df, "2024-05-01")\nassert "musteri" in rfm.columns, "musteri bir sütun olmalı (reset_index)"\nr = rfm.set_index("musteri")\nassert int(r.loc["Ayşe", "recency"]) == 47, "Ayşe recency 47 gün"\nassert int(r.loc["Ayşe", "frequency"]) == 3, "Ayşe 3 sipariş"\nassert abs(float(r.loc["Ayşe", "monetary"]) - 1030.0) < 1e-6, "Ayşe toplam 1030"\nassert int(r.loc["Elif", "recency"]) == 6 and int(r.loc["Elif", "frequency"]) == 1, "Elif 6 gün, 1 sipariş"\nassert len(rfm) == 5, "5 müşteri"\n',
      hints: ['pd.to_datetime ve .dt.to_period("M").astype(str).', 'groupby("musteri", observed=True) üzerinde tarih max/count ve tutar sum; (bugun - max).dt.days.', 'Sonunda reset_index() ile musteri sütun olsun.'],
      why: 'Üç ölçüt tek groupby nesnesinden üç ayrı toplamla gelir. Timestamp farkı Timedelta verir; .dt.days ile gün sayısına çevrilir.' },
    { t: 'code', id: 'proje-ileri-2',
      q: '<p>Parça 2: <code>rfm_skor(rfm, q=4)</code> ve <code>segment(skor, q=4)</code> yaz. <code>rfm_skor</code> girdiyi değiştirmeden kopya döndürsün; <code>R</code>, <code>F</code>, <code>M</code> sütunlarını <code>pd.qcut</code> ile 1..q arası tamsayı skor olarak eklesin (recency\'de küçük değer yüksek skor; eşitlikler için <code>rank(method="first")</code>), <code>skor</code> = R+F+M. <code>segment</code>: skor ≥ 3q-2 ise <code>"Şampiyon"</code>, ≥ 3q-5 ise <code>"Sadık"</code>, ≥ 6 ise <code>"Potansiyel"</code>, aksi halde <code>"Riskli"</code>.</p>',
      start: 'import pandas as pd\n\nRFM = pd.DataFrame({\n    "musteri": ["Ali", "Ayşe", "Elif", "Mehmet", "Zeynep"],\n    "recency": [13, 47, 6, 42, 30],\n    "frequency": [2, 3, 1, 2, 2],\n    "monetary": [520.0, 1030.0, 400.0, 970.0, 910.0],\n})\n\ndef rfm_skor(rfm, q=4):\n    pass\n\ndef segment(skor, q=4):\n    pass\n',
      sol: 'import pandas as pd\n\nRFM = pd.DataFrame({\n    "musteri": ["Ali", "Ayşe", "Elif", "Mehmet", "Zeynep"],\n    "recency": [13, 47, 6, 42, 30],\n    "frequency": [2, 3, 1, 2, 2],\n    "monetary": [520.0, 1030.0, 400.0, 970.0, 910.0],\n})\n\ndef rfm_skor(rfm, q=4):\n    rfm = rfm.copy()\n    etiket = list(range(1, q + 1))\n    rfm["R"] = pd.qcut(rfm["recency"].rank(method="first"), q, labels=etiket[::-1]).astype(int)\n    rfm["F"] = pd.qcut(rfm["frequency"].rank(method="first"), q, labels=etiket).astype(int)\n    rfm["M"] = pd.qcut(rfm["monetary"].rank(method="first"), q, labels=etiket).astype(int)\n    rfm["skor"] = rfm["R"] + rfm["F"] + rfm["M"]\n    return rfm\n\ndef segment(skor, q=4):\n    ust = 3 * q\n    if skor >= ust - 2:\n        return "Şampiyon"\n    if skor >= ust - 5:\n        return "Sadık"\n    if skor >= 6:\n        return "Potansiyel"\n    return "Riskli"\n',
      tests: 'sk = rfm_skor(RFM).set_index("musteri")\nassert "R" not in RFM.columns, "girdi değiştirilmemeli (kopya döndür)"\nassert int(sk.loc["Ayşe", "R"]) == 1 and int(sk.loc["Ayşe", "F"]) == 4 and int(sk.loc["Ayşe", "M"]) == 4, "Ayşe R=1 F=4 M=4"\nassert int(sk.loc["Elif", "R"]) == 4, "en yeni müşteri R=4"\nassert int(sk.loc["Ayşe", "skor"]) == 9, "Ayşe skor 9"\nassert sk["skor"].between(3, 12).all(), "skor 3..12 arası"\nassert set(sk["R"]) == {1, 2, 3, 4}, "R 1..4 değer almalı"\nsk3 = rfm_skor(RFM, q=3)\nassert sk3["skor"].between(3, 9).all() and set(sk3["F"]) == {1, 2, 3}, "q=3 ile skor 3..9"\nassert segment(12) == "Şampiyon" and segment(10) == "Şampiyon", "12 ve 10 Şampiyon"\nassert segment(9) == "Sadık" and segment(7) == "Sadık", "9 ve 7 Sadık"\nassert segment(6) == "Potansiyel" and segment(5) == "Riskli", "6 Potansiyel, 5 Riskli"\nassert segment(7, q=3) == "Şampiyon", "q=3: 7 Şampiyon"\n',
      hints: ['rfm.copy() ile başla.', 'pd.qcut(seri.rank(method="first"), q, labels=[...]).astype(int); recency için labels tersten.', 'segment eşikleri 3q-2, 3q-5, 6.'],
      why: 'qcut eşit sayıda müşteri içeren kutular üretir; rank(method="first") eşit değerlerde kutu sınırlarının çakışmasını önler. Etiketleri tersten vermek recency için "az gün = yüksek skor" kuralını uygular.' },
    { t: 'code', id: 'proje-ileri-3',
      q: '<p>Parça 3: <code>kohort_tablosu(df)</code> yaz. Her müşterinin kohortu ilk sipariş ayı (<code>"YYYY-MM"</code> metni), her siparişin <code>ay_no</code>\'su ilk aya göre geçen tam ay sayısı (yıl*12+ay farkı). Dönüş: satırlar kohort, sütunlar ay_no, hücreler o kohorttan o ayda sipariş veren <b>benzersiz</b> müşteri sayısı; olmayan hücre 0. (<code>groupby(...).nunique().unstack(fill_value=0)</code>)</p>',
      start: 'import pandas as pd\n\nKAYITLAR = [\n    {"musteri": "Ayşe", "tarih": "2024-01-05", "tutar": 120.0},\n    {"musteri": "Mehmet", "tarih": "2024-01-12", "tutar": 850.0},\n    {"musteri": "Ayşe", "tarih": "2024-02-03", "tutar": 60.0},\n    {"musteri": "Zeynep", "tarih": "2024-02-10", "tutar": 850.0},\n    {"musteri": "Ayşe", "tarih": "2024-03-15", "tutar": 850.0},\n    {"musteri": "Mehmet", "tarih": "2024-03-20", "tutar": 120.0},\n    {"musteri": "Ali", "tarih": "2024-03-22", "tutar": 400.0},\n    {"musteri": "Zeynep", "tarih": "2024-04-01", "tutar": 60.0},\n    {"musteri": "Ali", "tarih": "2024-04-18", "tutar": 120.0},\n    {"musteri": "Elif", "tarih": "2024-04-25", "tutar": 400.0},\n]\ndf = pd.DataFrame(KAYITLAR)\ndf["tarih"] = pd.to_datetime(df["tarih"])\n\ndef kohort_tablosu(df):\n    pass\n',
      sol: 'import pandas as pd\n\nKAYITLAR = [\n    {"musteri": "Ayşe", "tarih": "2024-01-05", "tutar": 120.0},\n    {"musteri": "Mehmet", "tarih": "2024-01-12", "tutar": 850.0},\n    {"musteri": "Ayşe", "tarih": "2024-02-03", "tutar": 60.0},\n    {"musteri": "Zeynep", "tarih": "2024-02-10", "tutar": 850.0},\n    {"musteri": "Ayşe", "tarih": "2024-03-15", "tutar": 850.0},\n    {"musteri": "Mehmet", "tarih": "2024-03-20", "tutar": 120.0},\n    {"musteri": "Ali", "tarih": "2024-03-22", "tutar": 400.0},\n    {"musteri": "Zeynep", "tarih": "2024-04-01", "tutar": 60.0},\n    {"musteri": "Ali", "tarih": "2024-04-18", "tutar": 120.0},\n    {"musteri": "Elif", "tarih": "2024-04-25", "tutar": 400.0},\n]\ndf = pd.DataFrame(KAYITLAR)\ndf["tarih"] = pd.to_datetime(df["tarih"])\n\ndef ay_index(seri):\n    return seri.dt.year * 12 + seri.dt.month\n\ndef kohort_tablosu(df):\n    df = df.copy()\n    ilk = df.groupby("musteri", observed=True)["tarih"].min()\n    df["ilk"] = df["musteri"].map(ilk)\n    df["kohort"] = df["ilk"].dt.to_period("M").astype(str)\n    df["ay_no"] = ay_index(df["tarih"]) - ay_index(df["ilk"])\n    tablo = (df.groupby(["kohort", "ay_no"], observed=True)["musteri"]\n               .nunique().unstack(fill_value=0))\n    return tablo\n',
      tests: 't = kohort_tablosu(df)\nassert list(t.index) == ["2024-01", "2024-02", "2024-03", "2024-04"], f"kohort satırları, gelen {list(t.index)}"\nassert [int(c) for c in t.columns] == [0, 1, 2], f"ay_no sütunları 0,1,2; gelen {list(t.columns)}"\nassert int(t.loc["2024-01", 0]) == 2 and int(t.loc["2024-01", 1]) == 1 and int(t.loc["2024-01", 2]) == 2, "Ocak kohortu: 2, 1, 2"\nassert int(t.loc["2024-02", 1]) == 0 and int(t.loc["2024-02", 2]) == 1, "Şubat kohortu: 1. ay 0, 2. ay 1"\nassert int(t.loc["2024-04", 0]) == 1 and int(t.loc["2024-04", 1]) == 0, "Nisan kohortu 1, sonra 0"\nassert "ilk" not in df.columns and "kohort" not in df.columns, "girdi değiştirilmemeli"\n',
      hints: ['İlk sipariş: groupby("musteri")["tarih"].min(); map ile her satıra yay.', 'Ay indeksi: dt.year*12 + dt.month; fark ay_no.', 'groupby(["kohort", "ay_no"])["musteri"].nunique().unstack(fill_value=0).'],
      why: 'Kohort analizi üç adım: ilk ay, görece ay, pivot. nunique aynı müşterinin aynı ayda iki siparişini bir kez sayar; fill_value=0 boş hücreleri doldurur. Yıl*12+ay tamsayısı Period aritmetiğine göre sürümden bağımsızdır.' },
    { t: 'code', id: 'proje-ileri-4',
      q: '<p>Parça 4: <code>en_cok_satan(df, sutun="urun", n=3)</code> yaz. <code>sutun</code>\'a göre gruplayıp <code>adet</code> (satır sayısı) ve <code>ciro</code> (tutar toplamı) sütunlarıyla, ciroya göre azalan (eşitlikte <code>sutun</code> değerine göre artan) sıralı ilk <code>n</code> satırı döndür; indeks 0\'dan başlasın ve sütunlar tam olarak <code>[sutun, "adet", "ciro"]</code> olsun.</p>',
      start: 'import pandas as pd\n\ndf = pd.DataFrame({\n    "urun": ["Kalem", "Kulaklık", "Defter", "Kulaklık", "Kulaklık", "Kalem", "Çanta", "Defter", "Kalem", "Çanta"],\n    "kategori": ["Kırtasiye", "Elektronik", "Kırtasiye", "Elektronik", "Elektronik", "Kırtasiye", "Aksesuar", "Kırtasiye", "Kırtasiye", "Aksesuar"],\n    "tutar": [120.0, 850.0, 60.0, 850.0, 850.0, 120.0, 400.0, 60.0, 120.0, 400.0],\n})\n\ndef en_cok_satan(df, sutun="urun", n=3):\n    pass\n',
      sol: 'import pandas as pd\n\ndf = pd.DataFrame({\n    "urun": ["Kalem", "Kulaklık", "Defter", "Kulaklık", "Kulaklık", "Kalem", "Çanta", "Defter", "Kalem", "Çanta"],\n    "kategori": ["Kırtasiye", "Elektronik", "Kırtasiye", "Elektronik", "Elektronik", "Kırtasiye", "Aksesuar", "Kırtasiye", "Kırtasiye", "Aksesuar"],\n    "tutar": [120.0, 850.0, 60.0, 850.0, 850.0, 120.0, 400.0, 60.0, 120.0, 400.0],\n})\n\ndef en_cok_satan(df, sutun="urun", n=3):\n    g = df.groupby(sutun, observed=True)["tutar"].agg(["count", "sum"]).reset_index()\n    g.columns = [sutun, "adet", "ciro"]\n    return (g.sort_values(["ciro", sutun], ascending=[False, True])\n             .head(n).reset_index(drop=True))\n',
      tests: 'r = en_cok_satan(df)\nassert list(r.columns) == ["urun", "adet", "ciro"], f"sütunlar, gelen {list(r.columns)}"\nassert list(r["urun"]) == ["Kulaklık", "Çanta", "Kalem"], f"sıra, gelen {list(r[\'urun\'])}"\nassert list(r["adet"]) == [3, 2, 3], "adetler"\nassert [float(x) for x in r["ciro"]] == [2550.0, 800.0, 360.0], "cirolar"\nassert list(r.index) == [0, 1, 2], "indeks 0..2"\nk = en_cok_satan(df, "kategori", 2)\nassert list(k["kategori"]) == ["Elektronik", "Aksesuar"], "kategori ilk 2"\nassert len(en_cok_satan(df, n=10)) == 4, "n büyükse tüm ürünler"\n',
      hints: ['groupby(sutun)["tutar"].agg(["count", "sum"]).reset_index() ve sütunları yeniden adlandır.', 'sort_values([ciro, sutun], ascending=[False, True]).head(n).reset_index(drop=True).'],
      why: 'agg ile iki özet tek seferde gelir. İkincil sıralama anahtarı eşit ciroda deterministik sıra sağlar; reset_index(drop=True) temiz 0..n-1 indeks verir.' },
    { t: 'code', id: 'proje-ileri-5',
      q: '<p>Parça 5: sahte API ve istemci. <code>api_sayfa(kayitlar, sayfa, boyut)</code> coroutine\'i <code>asyncio.sleep(0.01)</code> bekleyip <code>{"veri": [...], "son": bool}</code> döndürsün (<code>son</code>: bu sayfadan sonra kayıt kalmadı mı). <code>hepsini_cek(kayitlar, boyut)</code> sayfaları 0\'dan başlayarak <code>son</code> gelene kadar sırayla çekip <code>(tum_kayitlar, sayfa_sayisi)</code> döndürsün. Boş liste için 1 sayfa (boş) çekilmiş sayılır.</p>',
      start: 'import asyncio\n\nasync def api_sayfa(kayitlar, sayfa, boyut):\n    pass\n\nasync def hepsini_cek(kayitlar, boyut):\n    pass\n',
      sol: 'import asyncio\n\nasync def api_sayfa(kayitlar, sayfa, boyut):\n    await asyncio.sleep(0.01)\n    bas = sayfa * boyut\n    return {"veri": kayitlar[bas:bas + boyut], "son": bas + boyut >= len(kayitlar)}\n\nasync def hepsini_cek(kayitlar, boyut):\n    hepsi, sayfa = [], 0\n    while True:\n        yanit = await api_sayfa(kayitlar, sayfa, boyut)\n        hepsi.extend(yanit["veri"])\n        if yanit["son"]:\n            break\n        sayfa += 1\n    return hepsi, sayfa + 1\n',
      tests: 'import asyncio, inspect\nassert inspect.iscoroutinefunction(api_sayfa) and inspect.iscoroutinefunction(hepsini_cek), "ikisi de async def olmalı"\nloop = asyncio.new_event_loop()\nkayit = [{"id": i} for i in range(10)]\ny = loop.run_until_complete(api_sayfa(kayit, 2, 4))\nassert y["veri"] == [{"id": 8}, {"id": 9}] and y["son"] is True, "2. sayfa (boyut 4) son 2 kayıt ve son=True"\ny0 = loop.run_until_complete(api_sayfa(kayit, 0, 4))\nassert len(y0["veri"]) == 4 and y0["son"] is False, "0. sayfa 4 kayıt, son değil"\nhepsi, n = loop.run_until_complete(hepsini_cek(kayit, 4))\nassert hepsi == kayit and n == 3, "10 kayıt, boyut 4 -> 3 sayfa"\nhepsi2, n2 = loop.run_until_complete(hepsini_cek(kayit, 5))\nassert hepsi2 == kayit and n2 == 2, "boyut 5 -> tam 2 sayfa"\nbos, nb = loop.run_until_complete(hepsini_cek([], 4))\nassert bos == [] and nb == 1, "boş veri: 1 boş sayfa"\nloop.close()\n',
      hints: ['Dilim: kayitlar[sayfa*boyut : sayfa*boyut + boyut]; son = bas + boyut >= len.', 'İstemcide while True: await, extend, son ise break, sayfa += 1.'],
      why: 'Sayfalı API kalıbı: sunucu "daha var mı" bilgisini döndürür, istemci ona göre durur. Sıralı await burada doğru çünkü bir sonraki istek öncekinin cevabına bağlı; tam boyutta biten veri için son bayrağı >= ile doğru hesaplanır.' },
    { t: 'code', id: 'proje-ileri-6',
      q: '<p>Parça 6: CLI. <code>parse_args(argv)</code> fonksiyonu argparse ile şu arayüzü kursun: zorunlu konumsal <code>komut</code> (<code>rfm</code>, <code>kohort</code>, <code>top</code> seçenekleri), <code>--bugun</code> (varsayılan <code>"2024-05-01"</code>), <code>--q</code> (int, 4), <code>--n</code> (int, 3), <code>--sutun</code> (<code>urun</code>/<code>kategori</code>, varsayılan <code>urun</code>). Ardından <code>main(argv)</code>: komuta göre <code>"rfm q=4 bugun=2024-05-01"</code>, <code>"kohort"</code> ya da <code>"top sutun=urun n=3"</code> biçiminde metin döndürsün (gerçek hesap yerine özet metin; iş mantığı diğer parçalarda).</p>',
      start: 'import argparse\n\ndef parse_args(argv):\n    pass\n\ndef main(argv):\n    pass\n',
      sol: 'import argparse\n\ndef parse_args(argv):\n    p = argparse.ArgumentParser(prog="analitik")\n    p.add_argument("komut", choices=["rfm", "kohort", "top"])\n    p.add_argument("--bugun", default="2024-05-01")\n    p.add_argument("--q", type=int, default=4)\n    p.add_argument("--n", type=int, default=3)\n    p.add_argument("--sutun", choices=["urun", "kategori"], default="urun")\n    return p.parse_args(argv)\n\ndef main(argv):\n    a = parse_args(argv)\n    if a.komut == "rfm":\n        return f"rfm q={a.q} bugun={a.bugun}"\n    if a.komut == "kohort":\n        return "kohort"\n    return f"top sutun={a.sutun} n={a.n}"\n',
      tests: 'a = parse_args(["rfm"])\nassert a.komut == "rfm" and a.q == 4 and a.bugun == "2024-05-01" and a.n == 3 and a.sutun == "urun", "varsayılanlar"\nb = parse_args(["top", "--sutun", "kategori", "--n", "2"])\nassert b.sutun == "kategori" and b.n == 2 and isinstance(b.n, int), "--n int olmalı"\nassert main(["rfm", "--q", "3", "--bugun", "2024-06-01"]) == "rfm q=3 bugun=2024-06-01", "rfm çıktısı"\nassert main(["kohort"]) == "kohort", "kohort çıktısı"\nassert main(["top"]) == "top sutun=urun n=3", "top çıktısı"\nimport contextlib, io\nfor kotu in (["sil"], ["top", "--sutun", "fiyat"], ["rfm", "--q", "abc"]):\n    try:\n        with contextlib.redirect_stderr(io.StringIO()):\n            parse_args(kotu)\n        raise AssertionError(f"{kotu} geçersiz olmalı (SystemExit)")\n    except SystemExit:\n        pass\n',
      hints: ['add_argument("komut", choices=[...]) konumsal; --q için type=int, default=4.', 'parse_args(argv) listeyi doğrudan alır; sys.argv kullanma.', 'main içinde a.komut\'a göre f-string döndür.'],
      why: 'argparse choices ve type doğrulamayı sana bırakmaz; geçersiz değerde hata mesajı basıp SystemExit fırlatır. parse_args(liste) tasarımı CLI\'yı test edilebilir kılar; main sonucu print etmek yerine döndürünce testler çıktıyı yakalamakla uğraşmaz.' },
    { t: 'mc', q: '<code>pd.qcut</code> çağrısından önce <code>rank(method="first")</code> uygulamanın amacı nedir?',
      o: ['Değerleri büyükten küçüğe sıralayıp en büyüğe 1 vermek', 'Eşit değerleri ayırıp kutu sınırı çakışmasını önlemek', 'NaN değerleri sütun ortalamasıyla doldurmak', 'Skorları 0-1 aralığına ölçeklemek'], a: 1,
      why: 'qcut quantile sınırlarını değerlerden hesaplar; çok sayıda eşit değer olunca sınırlar çakışır ve ValueError verir. rank(method="first") her satıra benzersiz sıra vererek sınırları ayırır.' },
    { t: 'mc', q: 'Kohort tablosunda 0. sütun (ay_no = 0) neyi gösterir?',
      o: ['Kohortun ilk ayındaki toplam cirosu', 'Kohort büyüklüğü (ilk aydaki müşteri sayısı)', 'İlk aydan sonra kaybedilen müşteri sayısı', 'Kohortun ortalama sipariş tutarı'], a: 1,
      why: 'ay_no = 0, her müşterinin ilk sipariş ayıdır; o hücre kohorttaki herkesi içerir. Sonraki sütunlar bu sayıya bölünerek tutundurma oranı elde edilir.' }
  ],
  faq: [
    { q: 'RFM için kaç kutu (q) kullanmalıyım?', a: 'Yaygın tercih 4 ya da 5. Müşteri sayısı az ise (yüzlerin altında) 3 yeterli; fazla kutu küçük gruplarda anlamsız ayrımlar üretir. Kutu sayısını yapılandırmadan okunur yap, sabit kodlama.' },
    { q: 'pandas 2.2 ile 3.x arasında bu projeyi etkileyen fark var mı?', a: 'Kullandığımız API\'de yok: groupby(observed=True), qcut, unstack, sort_values iki sürümde de aynı. 3.x\'te metin sütunları varsayılan olarak str türünde gelir ve Copy-on-Write açıktır; bu yüzden inplace ve zincirleme atama kullanmıyoruz.' },
    { q: 'Sayfaları paralel çekmek daha hızlı olmaz mıydı?', a: 'Toplam sayfa sayısı önceden biliniyorsa (API toplam kayıt sayısını döndürüyorsa) gather ile paralel çekmek çok daha hızlıdır; aynı anda istek sayısını Semaphore ile sınırla. "Son sayfa" bayrağına bağlı API\'de sıralı çekmek zorunludur ya da iki aşamalı strateji (önce ilk sayfa, sonra kalanlar paralel) kurulur.' },
    { q: 'Testleri nasıl çalıştırırım, hangi dosya yapısı?', a: 'Paket kökünde tests/ klasörü, her modül için test_*.py; python -m unittest discover ya da pytest. CI\'da (önceki ders) pandas 2.2 ve 3.x için iki matris girişi tanımla.' }
  ],
  mistakes: [
    { bad: 'df["ay"] = df["tarih"].dt.to_period("M")\ndf[df["ay"] == "2024-01"]', good: 'df["ay"] = df["tarih"].dt.to_period("M").astype(str)\ndf[df["ay"] == "2024-01"]', why: 'Period ile metin karşılaştırması sürüme göre farklı davranır; astype(str) ile karşılaştırma ve test her yerde aynı sonucu verir.' },
    { bad: 'pd.qcut(rfm["frequency"], 4, labels=[1, 2, 3, 4])', good: 'pd.qcut(rfm["frequency"].rank(method="first"), 4, labels=[1, 2, 3, 4])', why: 'Çok sayıda eşit frequency değeri kutu sınırlarını çakıştırır ve ValueError üretir; rank ile benzersiz sıra verilir.' },
    { bad: 'rfm.sort_values("skor", inplace=True)\nreturn rfm', good: 'return rfm.sort_values("skor")', why: 'inplace girdiyi değiştirir, test ve çağıran kodu şaşırtır; pandas 3.x Copy-on-Write ile de kafa karıştırıcıdır. Yeni DataFrame döndür.' },
    { bad: 'def main():\n    args = parser.parse_args()\n    ...', good: 'def main(argv=None):\n    args = parser.parse_args(argv)\n    ...', why: 'sys.argv\'ye bağlı main test edilemez; argv parametresi testte liste vermeye, üretimde None ile gerçek argümanları okumaya izin verir.' }
  ]
}
