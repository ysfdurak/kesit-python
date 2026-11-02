/* Kesit Python — 'ml-kumeleme' dersi uzantısı: Gerçek müşterilerle RFM kümeleme (gerçek veri setleri) */
// needs: pandas, scikit-learn
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
  {
    id: 'ml-kumeleme',
    min: 25,
    needs: ['pandas', 'scikit-learn'],
    html: `<h2>Derinleş: gerçek müşterilerle RFM kümeleme</h2><p>Dersteki RFM ve k-means örnekleri birkaç elle yazılmış işlemle çalışıyordu. Şimdi aynı akışı Anadolu Market'in gerçek verisiyle kuracağız: <code>anadolu_market</code> setindeki <code>customers</code> (150 müşteri), <code>orders</code> (910 sipariş) ve tutarı hesaplamak için <code>order_items</code>. Gerçek veride üç yeni sorunla karşılaşacaksın: hiç teslim edilmiş siparişi olmayan müşteriler, çok çarpık harcama dağılımı ve kümeleri iş ekibinin zaten kullandığı segmentlerle (Bireysel, Kurumsal, Premium) karşılaştırma ihtiyacı.</p><h3>1. RFM tablosu: müşteri başına bir satır</h3><p>Yalnızca teslim edilmiş (<code>delivered</code>) siparişleri say; iptal ve iadeler müşterinin değerini şişirmesin. Sipariş tutarı kalemlerden gelir, bu yüzden önce kalemleri sipariş düzeyine toplayıp siparişlere bağlarız. Referans tarihi (bugün) veri bitişinden sonraki gün seçilir: 1 Ocak 2025.</p><pre class="py">import veri
import pandas as pd

def rfm_tablosu(bugun="2025-01-01"):
    o = veri.oku("anadolu_market", "orders", parse_dates=["order_date"])
    oi = veri.oku("anadolu_market", "order_items")
    oi["ciro"] = oi["quantity"] * oi["unit_price"] * (1 - oi["discount"])
    tutar = oi.groupby("order_id")["ciro"].sum()
    o = o[o["status"] == "delivered"].join(tutar, on="order_id")
    r = o.groupby("customer_id").agg(son=("order_date", "max"), frequency=("order_id", "size"),
                                     monetary=("ciro", "sum"))
    r["recency"] = (pd.Timestamp(bugun) - r["son"]).dt.days
    return r[["recency", "frequency", "monetary"]]

r = rfm_tablosu()
print(len(r), "müşteri")
print(r.describe().loc[["mean", "50%", "max"]].round(1))
</pre><p>150 müşteriden 135'inin teslim edilmiş siparişi var. Kalan 15 müşteri kümelemeye girmez; onlar ayrı bir "henüz alışveriş yapmamış" grubudur ve pazarlama ekibine ayrıca raporlanır. Harcamada ortalama (7.854 TL) medyanın (5.620 TL) belirgin üstünde: birkaç çok değerli müşteri dağılımı sağa çekiyor.</p><h3>2. Ölçekleme ve k seçimi</h3><p>monetary binlerle, frequency birlerle ölçülür. Ölçeklemeden k-means'e verirsen uzaklığı neredeyse yalnızca harcama belirler. <code>StandardScaler</code> sonrası farklı k değerleri için inertia ve silhouette skoruna bakalım:</p><pre class="py">import veri
import pandas as pd

def rfm_tablosu(bugun="2025-01-01"):
    o = veri.oku("anadolu_market", "orders", parse_dates=["order_date"])
    oi = veri.oku("anadolu_market", "order_items")
    oi["ciro"] = oi["quantity"] * oi["unit_price"] * (1 - oi["discount"])
    tutar = oi.groupby("order_id")["ciro"].sum()
    o = o[o["status"] == "delivered"].join(tutar, on="order_id")
    r = o.groupby("customer_id").agg(son=("order_date", "max"), frequency=("order_id", "size"),
                                     monetary=("ciro", "sum"))
    r["recency"] = (pd.Timestamp(bugun) - r["son"]).dt.days
    return r[["recency", "frequency", "monetary"]]
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score

r = rfm_tablosu()
X = StandardScaler().fit_transform(r)
for k in range(2, 7):
    km = KMeans(n_clusters=k, n_init=10, random_state=0).fit(X)
    print(k, round(km.inertia_, 1), round(silhouette_score(X, km.labels_), 3))
</pre><p>Silhouette en yüksek değerine k = 3'te ulaşıyor (yaklaşık 0,53) ve inertia eğrisi de k = 3–4 civarında bükülüyor. Matematik k = 3 diyor; son karar yine iş ekibinin kaç farklı kampanyayı yönetebileceğine bağlıdır.</p><h3>3. Kümeleri iş diline çevirmek ve mevcut segmentlerle kıyaslamak</h3><pre class="py">import veri
import pandas as pd

def rfm_tablosu(bugun="2025-01-01"):
    o = veri.oku("anadolu_market", "orders", parse_dates=["order_date"])
    oi = veri.oku("anadolu_market", "order_items")
    oi["ciro"] = oi["quantity"] * oi["unit_price"] * (1 - oi["discount"])
    tutar = oi.groupby("order_id")["ciro"].sum()
    o = o[o["status"] == "delivered"].join(tutar, on="order_id")
    r = o.groupby("customer_id").agg(son=("order_date", "max"), frequency=("order_id", "size"),
                                     monetary=("ciro", "sum"))
    r["recency"] = (pd.Timestamp(bugun) - r["son"]).dt.days
    return r[["recency", "frequency", "monetary"]]
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans

r = rfm_tablosu()
X = StandardScaler().fit_transform(r)
r["kume"] = KMeans(n_clusters=3, n_init=10, random_state=0).fit_predict(X)
profil = r.groupby("kume").agg(musteri=("recency", "size"), recency=("recency", "mean"),
                               frequency=("frequency", "mean"), monetary=("monetary", "mean"))
print(profil.round(0).sort_values("monetary"))

seg = veri.oku("anadolu_market", "customers").set_index("customer_id")["segment"]
print(pd.crosstab(r["kume"], r.join(seg)["segment"]))
</pre><div class="tbl-wrap"><table><tr><th>Küme profili</th><th>Ortalama</th><th>İş adı</th><th>Eylem</th></tr><tr><td>~32 müşteri</td><td>son alışveriş ~53 gün, ~11 sipariş, ~18.000 TL</td><td>Şampiyonlar</td><td>Sadakat programı, erken erişim</td></tr><tr><td>~84 müşteri</td><td>~77 gün, ~3 sipariş, ~4.500 TL</td><td>Potansiyel sadıklar</td><td>Çapraz satış, ikinci kategori önerisi</td></tr><tr><td>~19 müşteri</td><td>~460 gün, ~4 sipariş, ~5.600 TL</td><td>Kayıp riski</td><td>Geri kazanım kampanyası</td></tr></table></div><p>Çapraz tablo ilginç bir şey söylüyor: CRM'deki "Premium" etiketli müşterilerin bir kısmı davranış olarak "Kayıp riski" kümesinde. Etiket kayıt anındaki sözleşmeyi, küme ise <b>bugünkü davranışı</b> anlatır. Bu farkı bulmak, kümelemenin iş değerinin ta kendisidir.</p><div class="warn"><b>Küme numarası bir ad değildir</b>k-means'in verdiği 0, 1, 2 numaraları sürümden sürüme ya da veri değiştikçe yer değiştirebilir. Raporda numaraya değil, profile göre ad ver (ör. "monetary ortalaması en yüksek küme = Şampiyonlar") ve bunu kodla yap.</div><div class="note"><b>Gerçek işte</b>Segmentasyon modeli genellikle ayda bir yeniden çalıştırılır ve her müşterinin kümesi CRM'e bir alan olarak yazılır. Ölçekleyici ve model aynı tarihte birlikte kaydedilir; aksi hâlde yeni ay verisini eski ölçeğe göre dönüştürüp yanlış kümeye atarsın. Kesit Power BI'daki <code>kesit_bi.RFMSegmentleri</code> tablosu, kural tabanlı RFM'in Power BI tarafındaki karşılığıdır; bitirme projesinde (proje-ileri) ikisini karşılaştıracaksın.</div>`,
    ex: [
      {
        t: 'predict',
        stage: 'Kodu oku',
        q: 'Gerçek RFM tablosu kuruluyor (<code>rfm_tablosu</code> dersteki gibi). Bu kod ne yazdırır?',
        needs: ['pandas'],
        code: 'import veri\nimport pandas as pd\n\ndef rfm_tablosu(bugun="2025-01-01"):\n    o = veri.oku("anadolu_market", "orders", parse_dates=["order_date"])\n    oi = veri.oku("anadolu_market", "order_items")\n    oi["ciro"] = oi["quantity"] * oi["unit_price"] * (1 - oi["discount"])\n    tutar = oi.groupby("order_id")["ciro"].sum()\n    o = o[o["status"] == "delivered"].join(tutar, on="order_id")\n    r = o.groupby("customer_id").agg(son=("order_date", "max"), frequency=("order_id", "size"),\n                                     monetary=("ciro", "sum"))\n    r["recency"] = (pd.Timestamp(bugun) - r["son"]).dt.days\n    return r[["recency", "frequency", "monetary"]]\n\nr = rfm_tablosu()\nmusteri = veri.oku("anadolu_market", "customers")\nprint(len(r), len(musteri) - len(r), int(r["frequency"].max()))\n',
        o: ['135 15 23', '150 0 23', '135 15 9', '910 15 23'],
        a: 0,
        why: 'Yalnızca teslim edilmiş siparişi olan 135 müşteri RFM tablosuna girer; 15 müşterinin hiç teslim edilmiş siparişi yok. En sadık müşteri 23 teslim edilmiş sipariş vermiş.'
      },
      {
        t: 'predict',
        stage: 'Kodu oku',
        q: 'Aynı veri ölçekli ve ölçeksiz kümeleniyor. Bu kod küme boyutlarını (sıralı) ne yazdırır?',
        needs: ['pandas', 'scikit-learn'],
        code: 'import veri\nimport pandas as pd\n\ndef rfm_tablosu(bugun="2025-01-01"):\n    o = veri.oku("anadolu_market", "orders", parse_dates=["order_date"])\n    oi = veri.oku("anadolu_market", "order_items")\n    oi["ciro"] = oi["quantity"] * oi["unit_price"] * (1 - oi["discount"])\n    tutar = oi.groupby("order_id")["ciro"].sum()\n    o = o[o["status"] == "delivered"].join(tutar, on="order_id")\n    r = o.groupby("customer_id").agg(son=("order_date", "max"), frequency=("order_id", "size"),\n                                     monetary=("ciro", "sum"))\n    r["recency"] = (pd.Timestamp(bugun) - r["son"]).dt.days\n    return r[["recency", "frequency", "monetary"]]\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.cluster import KMeans\n\nr = rfm_tablosu()\nfor X in (StandardScaler().fit_transform(r), r.to_numpy()):\n    e = KMeans(n_clusters=3, n_init=10, random_state=0).fit_predict(X)\n    print(sorted(pd.Series(e).value_counts().tolist()))\n',
        o: ['[19, 32, 84]\n[4, 31, 100]', '[19, 32, 84]\n[19, 32, 84]', '[4, 31, 100]\n[19, 32, 84]', '[45, 45, 45]\n[4, 31, 100]'],
        a: 0,
        why: 'Ölçeksiz veride uzaklığı monetary belirler: 4 çok yüksek harcamalı müşteri ayrı küme olur, kalan 131 müşteri yalnızca harcamaya göre ikiye bölünür. Ölçekleyince üç boyut da söz sahibi olur.'
      },
      {
        t: 'order',
        stage: 'Kodu oku',
        q: '<p>Teslim edilmiş siparişlerden müşteri başına sipariş sayısı ve kullandığı kanal sayısını çıkarıp ölçekleyen, 2 kümeye ayıran ve kümelerin ortalama sipariş sayısını yazdıran programın satırlarını sırala.</p>',
        needs: ['pandas', 'scikit-learn'],
        lines: ['import veri', 'from sklearn.preprocessing import StandardScaler', 'from sklearn.cluster import KMeans', 'o = veri.oku("anadolu_market", "orders")', 'r = o[o["status"] == "delivered"].groupby("customer_id").agg(siparis=("order_id", "size"), kanal=("channel", "nunique"))', 'X = StandardScaler().fit_transform(r)', 'r["kume"] = KMeans(n_clusters=2, n_init=10, random_state=0).fit_predict(X)', 'print(r.groupby("kume")["siparis"].mean().round(1).sort_values().tolist())'],
        expect: '[3.0, 9.1]\n',
        hint: 'Önce müşteri tablosu, sonra ölçekleme, sonra kümeleme; küme sütunu olmadan grup ortalaması alınamaz.',
        why: 'Kümeleme sonucu sıralı yazdırıldığı için küme numaralarından bağımsızdır: sık ve çok kanallı alışveriş yapanlar (ortalama 9,1 sipariş) ile seyrek alışveriş yapanlar (3,0) ayrışıyor.'
      },
      {
        t: 'code',
        id: 'ml-kumeleme-v1',
        stage: 'Rehberli',
        diff: 2,
        needs: ['pandas'],
        q: '<p><code>rfm_tablosu(bugun="2025-01-01")</code> fonksiyonunu yaz: teslim edilmiş siparişlerden müşteri başına <code>recency</code> (bugun − son sipariş, gün), <code>frequency</code> (sipariş sayısı) ve <code>monetary</code> (indirimli kalem cirosu toplamı) sütunlu, <code>customer_id</code> index\'li DataFrame döndür. Sütun sırası: recency, frequency, monetary.</p>',
        guide: ['orders\'ı parse_dates=["order_date"] ile, order_items\'ı düz oku.', 'Kalemlerde ciro = quantity * unit_price * (1 - discount); order_id\'ye göre topla.', 'Siparişleri status == "delivered" ile filtrele ve tutarı join et.', 'customer_id\'ye göre agg: son tarih (max), sipariş sayısı (size), ciro toplamı (sum).', 'recency = (pd.Timestamp(bugun) - son).dt.days; sütunları sırala.'],
        example: 'import pandas as pd\nk = pd.DataFrame({"m": [1, 1, 2], "t": pd.to_datetime(["2024-12-01", "2024-12-20", "2024-11-01"]), "c": [10.0, 5.0, 8.0]})\nr = k.groupby("m").agg(son=("t", "max"), f=("t", "size"), mon=("c", "sum"))\nr["rec"] = (pd.Timestamp("2025-01-01") - r["son"]).dt.days\nprint(r)\n',
        start: 'import veri\nimport pandas as pd\n\ndef rfm_tablosu(bugun="2025-01-01"):\n    o = veri.oku("anadolu_market", "orders", parse_dates=["order_date"])\n    oi = veri.oku("anadolu_market", "order_items")\n    # TODO: sipariş tutarı, teslim filtresi, müşteri düzeyinde RFM\n    return o\n',
        sol: 'import veri\nimport pandas as pd\n\ndef rfm_tablosu(bugun="2025-01-01"):\n    o = veri.oku("anadolu_market", "orders", parse_dates=["order_date"])\n    oi = veri.oku("anadolu_market", "order_items")\n    oi["ciro"] = oi["quantity"] * oi["unit_price"] * (1 - oi["discount"])\n    tutar = oi.groupby("order_id")["ciro"].sum()\n    o = o[o["status"] == "delivered"].join(tutar, on="order_id")\n    r = o.groupby("customer_id").agg(son=("order_date", "max"), frequency=("order_id", "size"),\n                                     monetary=("ciro", "sum"))\n    r["recency"] = (pd.Timestamp(bugun) - r["son"]).dt.days\n    return r[["recency", "frequency", "monetary"]]\n',
        tests: 'r = rfm_tablosu()\nassert list(r.columns) == ["recency", "frequency", "monetary"], f"Sütunlar: {list(r.columns)}"\nassert len(r) == 135, f"135 müşteri olmalı, {len(r)} geldi"\nassert r.loc[4].tolist() == [10, 20, 30849.5], f"4 numaralı müşteri: {r.loc[4].tolist()}"\nassert r.loc[1, "recency"] == 381, "1 numaralı müşterinin son teslim edilmiş siparişi 381 gün önce"\nassert round(r["monetary"].sum(), 2) == 1060216.0, "Toplam monetary teslim edilmiş ciroya eşit olmalı"\nassert rfm_tablosu("2025-01-11").loc[4, "recency"] == 20, "bugun parametresi kullanılmalı"\n',
        hints: ['Önce kalemleri sipariş düzeyine indir, sonra siparişleri müşteri düzeyine.', 'join(tutar, on="order_id") Series\'i sütun olarak ekler.', 'agg(son=("order_date", "max"), frequency=("order_id", "size"), monetary=("ciro", "sum"))'],
        why: 'Toplam monetary, teslim edilmiş cironun tamamına (1.060.216 TL) eşit: hiçbir sipariş kaybolmadı ya da iki kez sayılmadı. Bu mutabakat RFM tablosunun doğruluk testidir.'
      },
      {
        t: 'code',
        id: 'ml-kumeleme-v2',
        stage: 'Rehberli',
        diff: 2,
        needs: ['pandas', 'scikit-learn'],
        q: '<p><code>k_tablosu(r, k_listesi=range(2, 7))</code>: RFM tablosunu <code>StandardScaler</code> ile ölçekle; her k için <code>KMeans(n_clusters=k, n_init=10, random_state=0)</code> eğit, <code>{k: silhouette (3 basamak)}</code> sözlüğü ve en iyi k\'yi <code>(sozluk, en_iyi_k)</code> olarak döndür. <code>rfm_tablosu</code> hazır.</p>',
        guide: ['X = StandardScaler().fit_transform(r)', 'Her k için fit_predict ile etiket al.', 'silhouette_score(X, etiket) ve round(..., 3).', 'En iyi k: max(sozluk, key=sozluk.get).'],
        example: 'import numpy as np\nfrom sklearn.cluster import KMeans\nfrom sklearn.metrics import silhouette_score\nX = np.array([[0, 0], [0, 1], [5, 5], [5, 6], [9, 0], [9, 1]], dtype=float)\nfor k in (2, 3):\n    e = KMeans(n_clusters=k, n_init=10, random_state=0).fit_predict(X)\n    print(k, round(silhouette_score(X, e), 3))\n',
        start: 'import veri\nimport pandas as pd\n\ndef rfm_tablosu(bugun="2025-01-01"):\n    o = veri.oku("anadolu_market", "orders", parse_dates=["order_date"])\n    oi = veri.oku("anadolu_market", "order_items")\n    oi["ciro"] = oi["quantity"] * oi["unit_price"] * (1 - oi["discount"])\n    tutar = oi.groupby("order_id")["ciro"].sum()\n    o = o[o["status"] == "delivered"].join(tutar, on="order_id")\n    r = o.groupby("customer_id").agg(son=("order_date", "max"), frequency=("order_id", "size"),\n                                     monetary=("ciro", "sum"))\n    r["recency"] = (pd.Timestamp(bugun) - r["son"]).dt.days\n    return r[["recency", "frequency", "monetary"]]\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.cluster import KMeans\nfrom sklearn.metrics import silhouette_score\n\ndef k_tablosu(r, k_listesi=range(2, 7)):\n    X = StandardScaler().fit_transform(r)\n    sozluk = {}\n    # TODO: her k için silhouette\n    return sozluk, None\n',
        sol: 'import veri\nimport pandas as pd\n\ndef rfm_tablosu(bugun="2025-01-01"):\n    o = veri.oku("anadolu_market", "orders", parse_dates=["order_date"])\n    oi = veri.oku("anadolu_market", "order_items")\n    oi["ciro"] = oi["quantity"] * oi["unit_price"] * (1 - oi["discount"])\n    tutar = oi.groupby("order_id")["ciro"].sum()\n    o = o[o["status"] == "delivered"].join(tutar, on="order_id")\n    r = o.groupby("customer_id").agg(son=("order_date", "max"), frequency=("order_id", "size"),\n                                     monetary=("ciro", "sum"))\n    r["recency"] = (pd.Timestamp(bugun) - r["son"]).dt.days\n    return r[["recency", "frequency", "monetary"]]\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.cluster import KMeans\nfrom sklearn.metrics import silhouette_score\n\ndef k_tablosu(r, k_listesi=range(2, 7)):\n    X = StandardScaler().fit_transform(r)\n    sozluk = {}\n    for k in k_listesi:\n        e = KMeans(n_clusters=k, n_init=10, random_state=0).fit_predict(X)\n        sozluk[k] = round(float(silhouette_score(X, e)), 3)\n    return sozluk, max(sozluk, key=sozluk.get)\n',
        tests: 's, en_iyi = k_tablosu(rfm_tablosu())\nassert en_iyi == 3, f"En iyi k 3 olmalı, {en_iyi} geldi ({s})"\nassert s[3] == 0.532 and s[2] == 0.494, f"Silhouette değerleri: {s}"\nassert s[6] < s[3], "k arttıkça silhouette her zaman artmaz"\n',
        hints: ['Silhouette -1 ile 1 arasıdır; büyük olan daha iyi ayrışma demektir.', 'Ölçeklemeyi döngünün dışında bir kez yap.'],
        why: 'Inertia k ile hep düşer, silhouette ise bir tepe yapar. Gerçek veride tepe k = 3: üç anlamlı davranış grubu var.'
      },
      {
        t: 'code',
        id: 'ml-kumeleme-v3',
        stage: 'Kendin yaz',
        diff: 2,
        needs: ['pandas', 'scikit-learn'],
        q: '<p><code>kume_adlari(r, k=3)</code>: RFM\'i ölçekle, k-means (n_init=10, random_state=0) ile kümele. Her kümenin ortalama recency, frequency, monetary değerlerini hesapla. Adlandırma kuralı: <b>recency ortalaması en yüksek</b> küme <code>"Kayıp riski"</code>; kalanlardan <b>monetary ortalaması en yüksek</b> küme <code>"Şampiyonlar"</code>; diğer(ler)i <code>"Potansiyel sadıklar"</code>. <code>{ad: müşteri_sayısı}</code> döndür. <code>rfm_tablosu</code> hazır.</p>',
        start: 'import veri\nimport pandas as pd\n\ndef rfm_tablosu(bugun="2025-01-01"):\n    o = veri.oku("anadolu_market", "orders", parse_dates=["order_date"])\n    oi = veri.oku("anadolu_market", "order_items")\n    oi["ciro"] = oi["quantity"] * oi["unit_price"] * (1 - oi["discount"])\n    tutar = oi.groupby("order_id")["ciro"].sum()\n    o = o[o["status"] == "delivered"].join(tutar, on="order_id")\n    r = o.groupby("customer_id").agg(son=("order_date", "max"), frequency=("order_id", "size"),\n                                     monetary=("ciro", "sum"))\n    r["recency"] = (pd.Timestamp(bugun) - r["son"]).dt.days\n    return r[["recency", "frequency", "monetary"]]\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.cluster import KMeans\n\ndef kume_adlari(r, k=3):\n    pass\n',
        sol: 'import veri\nimport pandas as pd\n\ndef rfm_tablosu(bugun="2025-01-01"):\n    o = veri.oku("anadolu_market", "orders", parse_dates=["order_date"])\n    oi = veri.oku("anadolu_market", "order_items")\n    oi["ciro"] = oi["quantity"] * oi["unit_price"] * (1 - oi["discount"])\n    tutar = oi.groupby("order_id")["ciro"].sum()\n    o = o[o["status"] == "delivered"].join(tutar, on="order_id")\n    r = o.groupby("customer_id").agg(son=("order_date", "max"), frequency=("order_id", "size"),\n                                     monetary=("ciro", "sum"))\n    r["recency"] = (pd.Timestamp(bugun) - r["son"]).dt.days\n    return r[["recency", "frequency", "monetary"]]\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.cluster import KMeans\n\ndef kume_adlari(r, k=3):\n    X = StandardScaler().fit_transform(r)\n    etiket = KMeans(n_clusters=k, n_init=10, random_state=0).fit_predict(X)\n    profil = r.groupby(etiket)[["recency", "frequency", "monetary"]].mean()\n    kayip = profil["recency"].idxmax()\n    sampiyon = profil.drop(index=kayip)["monetary"].idxmax()\n    ad = {kume: "Potansiyel sadıklar" for kume in profil.index}\n    ad[kayip] = "Kayıp riski"\n    ad[sampiyon] = "Şampiyonlar"\n    sayim = {}\n    for e in etiket:\n        sayim[ad[e]] = sayim.get(ad[e], 0) + 1\n    return sayim\n',
        tests: 's = kume_adlari(rfm_tablosu())\nassert s == {"Potansiyel sadıklar": 84, "Kayıp riski": 19, "Şampiyonlar": 32} or dict(sorted(s.items())) == {"Kayıp riski": 19, "Potansiyel sadıklar": 84, "Şampiyonlar": 32}, f"Sayımlar: {s}"\nassert sum(s.values()) == 135, "Tüm müşteriler bir ada atanmalı"\n',
        hints: ['Profil tablosunda idxmax küme numarasını verir.', 'Kayıp riski kümesini çıkardıktan sonra monetary\'e bak: profil.drop(index=kayip).'],
        why: 'Adlar küme numarasından değil profilden geldiği için, k-means numaraları değişse bile aynı müşteriler aynı adı alır.'
      },
      {
        t: 'code',
        id: 'ml-kumeleme-v4',
        stage: 'Kendin yaz',
        diff: 2,
        needs: ['pandas', 'scikit-learn'],
        q: '<p><code>segment_karsilastir(r)</code>: RFM\'i ölçekleyip 3 kümeye ayır (n_init=10, random_state=0). Monetary ortalaması en yüksek kümeyi "en iyi küme" say. <code>customers.segment</code> ile birleştir ve <code>{"premium_payi": .., "en_iyi_kume_premium": .., "premium_kayip": ..}</code> döndür: (1) en iyi kümedeki müşterilerin yüzde kaçı Premium, (2) tüm Premium müşterilerin (RFM tablosundakiler) yüzde kaçı en iyi kümede, (3) recency ortalaması en yüksek kümede kaç Premium müşteri var (<code>int</code>). Yüzdeler 1 basamak.</p>',
        start: 'import veri\nimport pandas as pd\n\ndef rfm_tablosu(bugun="2025-01-01"):\n    o = veri.oku("anadolu_market", "orders", parse_dates=["order_date"])\n    oi = veri.oku("anadolu_market", "order_items")\n    oi["ciro"] = oi["quantity"] * oi["unit_price"] * (1 - oi["discount"])\n    tutar = oi.groupby("order_id")["ciro"].sum()\n    o = o[o["status"] == "delivered"].join(tutar, on="order_id")\n    r = o.groupby("customer_id").agg(son=("order_date", "max"), frequency=("order_id", "size"),\n                                     monetary=("ciro", "sum"))\n    r["recency"] = (pd.Timestamp(bugun) - r["son"]).dt.days\n    return r[["recency", "frequency", "monetary"]]\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.cluster import KMeans\n\ndef segment_karsilastir(r):\n    pass\n',
        sol: 'import veri\nimport pandas as pd\n\ndef rfm_tablosu(bugun="2025-01-01"):\n    o = veri.oku("anadolu_market", "orders", parse_dates=["order_date"])\n    oi = veri.oku("anadolu_market", "order_items")\n    oi["ciro"] = oi["quantity"] * oi["unit_price"] * (1 - oi["discount"])\n    tutar = oi.groupby("order_id")["ciro"].sum()\n    o = o[o["status"] == "delivered"].join(tutar, on="order_id")\n    r = o.groupby("customer_id").agg(son=("order_date", "max"), frequency=("order_id", "size"),\n                                     monetary=("ciro", "sum"))\n    r["recency"] = (pd.Timestamp(bugun) - r["son"]).dt.days\n    return r[["recency", "frequency", "monetary"]]\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.cluster import KMeans\n\ndef segment_karsilastir(r):\n    X = StandardScaler().fit_transform(r)\n    d = r.copy()\n    d["kume"] = KMeans(n_clusters=3, n_init=10, random_state=0).fit_predict(X)\n    seg = veri.oku("anadolu_market", "customers").set_index("customer_id")["segment"]\n    d = d.join(seg)\n    profil = d.groupby("kume")[["recency", "monetary"]].mean()\n    iyi = profil["monetary"].idxmax()\n    kayip = profil["recency"].idxmax()\n    premium = d["segment"] == "Premium"\n    iyi_m = d["kume"] == iyi\n    return {"premium_payi": round(float(premium[iyi_m].mean() * 100), 1),\n            "en_iyi_kume_premium": round(float(iyi_m[premium].mean() * 100), 1),\n            "premium_kayip": int((premium & (d["kume"] == kayip)).sum())}\n',
        tests: 'r = rfm_tablosu()\ns = segment_karsilastir(r)\nassert s == {"premium_payi": 53.1, "en_iyi_kume_premium": 56.7, "premium_kayip": 6}, f"Sonuç: {s}"\nassert list(r.columns) == ["recency", "frequency", "monetary"], "Girdi değiştirilmemeli"\n',
        hints: ['join(seg) customer_id index\'i üzerinden segmenti ekler.', 'Boolean maskenin ortalaması oran verir: premium[iyi_m].mean().'],
        why: 'En iyi kümenin yarısı Premium, ama Premium müşterilerin yalnızca %57\'si en iyi kümede ve 6 Premium müşteri kayıp riski kümesinde. CRM etiketi davranışı tam yansıtmıyor: bu 6 kişi geri kazanım listesinin başına yazılmalı.'
      },
      {
        t: 'code',
        id: 'ml-kumeleme-v5',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 2,
        needs: ['pandas', 'scikit-learn'],
        q: '<p>Hatayı bul ve düzelt. <code>segmentle(r)</code> RFM tablosunu 3 kümeye ayırıp sıralı küme boyutlarını döndürmeli: <code>[19, 32, 84]</code>. Ama <code>[4, 31, 100]</code> dönüyor ve kümeler yalnızca harcamaya göre ayrışıyor.</p>',
        start: 'import veri\nimport pandas as pd\n\ndef rfm_tablosu(bugun="2025-01-01"):\n    o = veri.oku("anadolu_market", "orders", parse_dates=["order_date"])\n    oi = veri.oku("anadolu_market", "order_items")\n    oi["ciro"] = oi["quantity"] * oi["unit_price"] * (1 - oi["discount"])\n    tutar = oi.groupby("order_id")["ciro"].sum()\n    o = o[o["status"] == "delivered"].join(tutar, on="order_id")\n    r = o.groupby("customer_id").agg(son=("order_date", "max"), frequency=("order_id", "size"),\n                                     monetary=("ciro", "sum"))\n    r["recency"] = (pd.Timestamp(bugun) - r["son"]).dt.days\n    return r[["recency", "frequency", "monetary"]]\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.cluster import KMeans\n\ndef segmentle(r):\n    olcek = StandardScaler().fit(r)\n    km = KMeans(n_clusters=3, n_init=10, random_state=0).fit(r.to_numpy())\n    return sorted(pd.Series(km.labels_).value_counts().tolist())\n',
        sol: 'import veri\nimport pandas as pd\n\ndef rfm_tablosu(bugun="2025-01-01"):\n    o = veri.oku("anadolu_market", "orders", parse_dates=["order_date"])\n    oi = veri.oku("anadolu_market", "order_items")\n    oi["ciro"] = oi["quantity"] * oi["unit_price"] * (1 - oi["discount"])\n    tutar = oi.groupby("order_id")["ciro"].sum()\n    o = o[o["status"] == "delivered"].join(tutar, on="order_id")\n    r = o.groupby("customer_id").agg(son=("order_date", "max"), frequency=("order_id", "size"),\n                                     monetary=("ciro", "sum"))\n    r["recency"] = (pd.Timestamp(bugun) - r["son"]).dt.days\n    return r[["recency", "frequency", "monetary"]]\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.cluster import KMeans\n\ndef segmentle(r):\n    olcek = StandardScaler().fit(r)\n    km = KMeans(n_clusters=3, n_init=10, random_state=0).fit(olcek.transform(r))\n    return sorted(pd.Series(km.labels_).value_counts().tolist())\n',
        tests: 'assert segmentle(rfm_tablosu()) == [19, 32, 84], f"Ölçekli kümeleme boyutları farklı: {segmentle(rfm_tablosu())}"\n',
        hints: ['Ölçekleyici eğitiliyor ama dönüştürülmüş veri nerede kullanılıyor?', 'KMeans\'e olcek.transform(r) ver.'],
        why: 'fit yalnızca ortalama ve standart sapmayı öğrenir; veriyi değiştirmez. Ham monetary (binler) recency ve frequency\'yi bastırıyordu.'
      },
      {
        t: 'code',
        id: 'ml-kumeleme-v6',
        stage: 'Meydan okuma',
        diff: 3,
        needs: ['pandas', 'scikit-learn'],
        q: '<p>Aylık yeniden skorlama. <code>model_kur(r)</code> RFM\'e <code>StandardScaler</code> + <code>KMeans(3, n_init=10, random_state=0)</code> içeren bir <code>Pipeline</code> eğitip döndürsün. <code>kume_gecisi(model, r_eski, r_yeni)</code> aynı (yeniden eğitilmemiş) modelle iki dönemi skorlasın ve her iki dönemde de bulunan müşterilerden kümesi DEĞİŞENLERİN sayısını döndürsün. Testler modeli 1 Temmuz 2024 tarihli RFM\'le (o tarihe kadarki siparişler) eğitir ve 1 Ocak 2025 tablosuyla karşılaştırır. <code>rfm_tablosu</code>\'na <code>son_tarih</code> filtresini eklemen gerekir: yalnızca <code>order_date &lt; bugun</code> olan siparişler.</p>',
        start: 'import veri\nimport pandas as pd\n\ndef rfm_tablosu(bugun="2025-01-01"):\n    o = veri.oku("anadolu_market", "orders", parse_dates=["order_date"])\n    oi = veri.oku("anadolu_market", "order_items")\n    oi["ciro"] = oi["quantity"] * oi["unit_price"] * (1 - oi["discount"])\n    tutar = oi.groupby("order_id")["ciro"].sum()\n    o = o[o["status"] == "delivered"].join(tutar, on="order_id")\n    r = o.groupby("customer_id").agg(son=("order_date", "max"), frequency=("order_id", "size"),\n                                     monetary=("ciro", "sum"))\n    r["recency"] = (pd.Timestamp(bugun) - r["son"]).dt.days\n    return r[["recency", "frequency", "monetary"]]\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.cluster import KMeans\nfrom sklearn.pipeline import make_pipeline\n\ndef model_kur(r):\n    pass\n\ndef kume_gecisi(model, r_eski, r_yeni):\n    pass\n',
        sol: 'import veri\nimport pandas as pd\n\ndef rfm_tablosu(bugun="2025-01-01"):\n    o = veri.oku("anadolu_market", "orders", parse_dates=["order_date"])\n    oi = veri.oku("anadolu_market", "order_items")\n    oi["ciro"] = oi["quantity"] * oi["unit_price"] * (1 - oi["discount"])\n    tutar = oi.groupby("order_id")["ciro"].sum()\n    o = o[(o["status"] == "delivered") & (o["order_date"] < pd.Timestamp(bugun))].join(tutar, on="order_id")\n    r = o.groupby("customer_id").agg(son=("order_date", "max"), frequency=("order_id", "size"),\n                                     monetary=("ciro", "sum"))\n    r["recency"] = (pd.Timestamp(bugun) - r["son"]).dt.days\n    return r[["recency", "frequency", "monetary"]]\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.cluster import KMeans\nfrom sklearn.pipeline import make_pipeline\n\ndef model_kur(r):\n    return make_pipeline(StandardScaler(), KMeans(n_clusters=3, n_init=10, random_state=0)).fit(r)\n\ndef kume_gecisi(model, r_eski, r_yeni):\n    ortak = r_eski.index.intersection(r_yeni.index)\n    e = pd.Series(model.predict(r_eski.loc[ortak]), index=ortak)\n    y = pd.Series(model.predict(r_yeni.loc[ortak]), index=ortak)\n    return int((e != y).sum())\n',
        tests: 'eski = rfm_tablosu("2024-07-01")\nyeni = rfm_tablosu("2025-01-01")\nassert len(eski) < len(yeni), "Temmuz tablosunda daha az müşteri olmalı (son_tarih filtresi)"\nassert len(eski) == 110, f"Temmuz 2024 RFM: {len(eski)} müşteri"\nm = model_kur(eski)\nassert hasattr(m, "predict") and len(m.steps) == 2, "Ölçekleyici + KMeans pipeline"\nd = kume_gecisi(m, eski, yeni)\nassert d == 23, f"Kümesi değişen müşteri: {d}"\n',
        hints: ['Filtre: (status == "delivered") & (order_date &lt; bugun).', 'make_pipeline(StandardScaler(), KMeans(...)).fit(r)', 'İki tabloda da olan müşteriler: r_eski.index.intersection(r_yeni.index).'],
        why: 'Modeli bir kez eğitip her ay yalnızca predict ile skorlamak, kümelerin anlamını sabit tutar; her ay yeniden eğitirsen "Şampiyonlar" tanımı ay ay kayar. Küme değiştiren müşteri sayısı, kampanyaların ve doğal yaşam döngüsünün etkisini izlemenin basit bir göstergesidir.'
      }
    ],
    faq: [
      {
        q: 'Monetary çok çarpık; log dönüşümü yapmalı mıyım?',
        a: 'Yapabilirsin: <code>np.log1p(r)</code> sonra ölçekleme, uç değerlerin küme merkezlerini çekmesini azaltır. Bu veride log dönüşümüyle silhouette düşüyor (yaklaşık 0,35) ama kümeler daha dengeli boyutta çıkıyor. Hangisinin daha "iyi" olduğunu metrik değil, kümelerin iş ekibi için anlamlı olup olmadığı belirler; ikisini de profil tablosuyla göster.'
      }
    ],
    mistakes: [
      {
        bad: 'olcek = StandardScaler().fit(X)\nKMeans(3).fit(X)',
        good: 'X_s = StandardScaler().fit_transform(X)\nKMeans(3, n_init=10, random_state=0).fit(X_s)',
        why: 'fit veriyi dönüştürmez; ölçekli veriyi kümelemeye vermek için transform ya da fit_transform gerekir.'
      }
    ]
  }
);
})(window);
