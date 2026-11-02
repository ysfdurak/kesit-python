/* PythonPatika — 'proje-ileri' dersi uzantısı: Gerçek veriyle RFM, kohort ve Power BI mutabakatı (gerçek veri setleri) */
// needs: pandas
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
  {
    id: 'proje-ileri',
    min: 40,
    needs: ['pandas'],
    html: `<h2>Derinleş: projeyi gerçek veriye bağlamak</h2><p>Projenin ilk hâlinde RFM ve kohort fonksiyonlarını satır içi küçük verilerle kurdun. Bir portföy projesini gerçek kılan şey, aynı fonksiyonların <b>gerçek tablolarla</b> çalışması ve sonuçların başka bir sistemle <b>mutabakatının</b> (reconciliation) yapılmasıdır. Bu bölümde paketi <code>anadolu_market</code> setinin 910 sipariş ve 1.620 kalemine bağlayacak, sonuçları PBIPatika'daki Power BI modeliyle (<code>kesit_bi</code>) karşılaştıracaksın. Aynı şirketin iki sistemi aynı soruya farklı cevap veriyorsa bunun nedenini bulmak, kıdemli analistin en değerli işidir.</p><div class="tbl-wrap"><table><tr><th>Kavram</th><th>Python paketi (anadolu_market)</th><th>Power BI modeli (kesit_bi)</th></tr><tr><td>Sipariş satırı</td><td><code>order_items</code> + <code>orders</code></td><td><code>Satislar</code> olgu tablosu (tanecik: kalem)</td></tr><tr><td>Durum</td><td>delivered / shipped / returned / cancelled</td><td>Teslim Edildi / Kargoda / İade / İptal</td></tr><tr><td>Kohort</td><td>senin tanımın</td><td><code>Musteriler.KohortAy</code>, <code>Satislar.KohortAyFarki</code></td></tr><tr><td>RFM segmentleri</td><td>senin kuralların</td><td><code>RFMSegmentleri</code> (7 segment, açıklama ve eylem)</td></tr></table></div><h3>1. Veri katmanı: tek giriş noktası</h3><p>Bütün analizler sipariş düzeyinde bir tabloyla başlar. Bunu tek bir fonksiyona koyarsan veri kaynağı değiştiğinde (CSV yerine veri ambarı) yalnızca bu fonksiyonu değiştirirsin.</p><pre class="py">import veri
import pandas as pd

def siparis_tablosu():
    o = veri.oku("anadolu_market", "orders", parse_dates=["order_date"])
    oi = veri.oku("anadolu_market", "order_items")
    oi["tutar"] = oi["quantity"] * oi["unit_price"] * (1 - oi["discount"])
    return o.join(oi.groupby("order_id")["tutar"].sum(), on="order_id")

s = siparis_tablosu()
print(len(s), "sipariş, toplam", round(s["tutar"].sum(), 2), "TL")
print(s.groupby("status")["tutar"].sum().round(0).to_dict())
</pre><h3>2. RFM: puanlar ve PBIPatika segmentleri</h3><p>Her boyutu 1–5 arası puanla (beşte birlik dilimler, <code>pd.qcut</code>). Eşit değerler dilim sınırlarını çakıştırmasın diye önce <code>rank(method="first")</code> uygulanır. Recency'de küçük değer iyidir, bu yüzden puan ters çevrilir. Segment adlarını kendin uydurmak yerine şirketin Power BI modelinde zaten tanımlı olan listeyi kullan: <code>kesit_bi.RFMSegmentleri</code> yedi segmenti, sırası, açıklaması ve önerilen eylemiyle birlikte tutar. Böylece Python raporu ile pano aynı dili konuşur.</p><pre class="py">import veri

print(veri.oku("kesit_bi", "RFMSegmentleri")[["Sira", "Segment", "Eylem"]].to_string(index=False))
</pre><p>Segment kuralları R ve F puanlarından oluşan klasik ızgaraya dayanır (M, segment içinde değer sıralaması için kullanılır):</p><div class="tbl-wrap"><table><tr><th></th><th>F 1</th><th>F 2–3</th><th>F 4–5</th></tr><tr><td><b>R 4–5</b></td><td>Yeni</td><td>Potansiyel sadık</td><td>Şampiyon</td></tr><tr><td><b>R 3</b></td><td colspan="2">Dikkat gerektiren</td><td>Sadık</td></tr><tr><td><b>R 1–2</b></td><td>Kaybedilmiş (F ≤ 2)</td><td>F = 2: Kaybedilmiş, F = 3: Risk altında</td><td>Risk altında</td></tr></table></div><pre class="py">import veri
import pandas as pd

def siparis_tablosu():
    o = veri.oku("anadolu_market", "orders", parse_dates=["order_date"])
    oi = veri.oku("anadolu_market", "order_items")
    oi["tutar"] = oi["quantity"] * oi["unit_price"] * (1 - oi["discount"])
    return o.join(oi.groupby("order_id")["tutar"].sum(), on="order_id")

def rfm_hesapla(s, bugun="2025-01-01"):
    d = s[s["status"] == "delivered"]
    r = d.groupby("customer_id").agg(son=("order_date", "max"), F=("order_id", "size"), M=("tutar", "sum"))
    r["R"] = (pd.Timestamp(bugun) - r["son"]).dt.days
    return r[["R", "F", "M"]]

def _puan(seri, q=5, ters=False):
    p = pd.qcut(seri.rank(method="first"), q, labels=False) + 1
    return (q + 1 - p) if ters else p

def rfm_skorla(r, q=5):
    r = r.copy()
    r["r"] = _puan(r["R"], q, ters=True)
    r["f"] = _puan(r["F"], q)
    r["m"] = _puan(r["M"], q)
    return r

def segment_ata(r, f):
    if r &gt;= 4 and f &gt;= 4:
        return "Şampiyon"
    if r == 3 and f &gt;= 4:
        return "Sadık"
    if r &gt;= 4 and f &gt;= 2:
        return "Potansiyel sadık"
    if r &gt;= 4:
        return "Yeni"
    if r == 3:
        return "Dikkat gerektiren"
    if f &gt;= 3:
        return "Risk altında"
    return "Kaybedilmiş"

r = rfm_skorla(rfm_hesapla(siparis_tablosu()))
r["Segment"] = [segment_ata(a, b) for a, b in zip(r["r"], r["f"])]
ozet = r.groupby("Segment").agg(musteri=("M", "size"), ciro=("M", "sum")).reset_index()
tablo = veri.oku("kesit_bi", "RFMSegmentleri").merge(ozet, on="Segment", how="left").sort_values("Sira")
tablo["pay"] = (tablo["ciro"] / tablo["ciro"].sum() * 100).round(1)
print(tablo[["Segment", "musteri", "pay"]].to_string(index=False))
</pre><p>30 Şampiyon müşteri cironun %45'ini getiriyor; 26 "Risk altında" müşteri ise geçmişte cironun %21'ini getirmiş ama uzun süredir alışveriş yapmıyor. Geri kazanım kampanyasının hedef listesi budur.</p><h3>3. Kohort tanımında mutabakat</h3><p>Kohort "müşterinin ilk sipariş ayı"dır. Ama hangi sipariş? Power BI modelindeki <code>Musteriler.IlkSiparis</code> ile kendi hesabını karşılaştırınca 136 müşterinin 13'ünde fark çıkar. Nedeni tanımdır: Power BI modeli <b>iptal edilen siparişleri saymaz</b>. 2 numaralı müşteri ilk siparişini 14 Ocak'ta vermiş ama iptal etmiş; Power BI ona göre müşteri 24 Şubat'ta kazanılmıştır. İki tanım da savunulabilir; önemli olan aynı şirkette tek tanımın kullanılması ve bunun yazılı olmasıdır.</p><pre class="py">import veri

o = veri.oku("anadolu_market", "orders", parse_dates=["order_date"])
bi = veri.oku("kesit_bi", "Musteriler").set_index("MusteriNo")["IlkSiparis"].dropna()
for ad, kume in [("tüm siparişler", o), ("iptal hariç", o[o["status"] != "cancelled"])]:
    ilk = kume.groupby("customer_id")["order_date"].min().dt.strftime("%Y-%m-%d")
    print(ad, "eşleşen:", int((bi == ilk.reindex(bi.index)).sum()), "/", len(bi))
</pre><div class="warn"><b>Anlık görüntü (snapshot) farkı</b>Ciroyu durumlara göre karşılaştırınca toplam tutar kuruşu kuruşuna aynıdır, ama "teslim edildi" cirosu iki sistemde yaklaşık 10.600 TL farklıdır. Fark, Aralık'ın son dört gününe ait 5 siparişten gelir: Power BI modeli onları "Kargoda" görür, operasyon veritabanı "delivered". Model bu siparişler teslim edilmeden önce yenilenmiş. Raporlarına her zaman verinin hangi tarihte çekildiğini yaz.</div><div class="note"><b>Gerçek işte</b>Yeni bir analiz yayına girmeden önce sonuçları şirketin mevcut panosuyla karşılaştırırsın. "Sizin rakamınız panodan farklı" itirazı ilk toplantıda gelir; farkın nedenini (tanım, zaman, filtre) önceden bilmek güven kazandırır. Bu projenin README dosyasına "Power BI modeliyle mutabakat" başlıklı kısa bir bölüm eklemek, portföyünde seni diğer adaylardan ayırır.</div>`,
    ex: [
      {
        t: 'predict',
        stage: 'Kodu oku',
        q: 'Veri katmanı gerçek tablolarla kuruluyor (<code>siparis_tablosu</code> derstekiyle aynı). Bu kod ne yazdırır?',
        needs: ['pandas'],
        code: 'import veri\nimport pandas as pd\n\ndef siparis_tablosu():\n    o = veri.oku("anadolu_market", "orders", parse_dates=["order_date"])\n    oi = veri.oku("anadolu_market", "order_items")\n    oi["tutar"] = oi["quantity"] * oi["unit_price"] * (1 - oi["discount"])\n    return o.join(oi.groupby("order_id")["tutar"].sum(), on="order_id")\n\ns = siparis_tablosu()\nd = s[s["status"] == "delivered"]\nprint(len(s), len(d), d["customer_id"].nunique())\n',
        o: ['910 712 135', '1620 712 135', '910 712 150', '910 910 136'],
        a: 0,
        why: 'siparis_tablosu sipariş düzeyindedir (910 satır). 712 teslim edilmiş sipariş 135 farklı müşteriye ait; 150 müşterinin 15\'inin teslim edilmiş siparişi yok.'
      },
      {
        t: 'predict',
        stage: 'Kodu oku',
        q: 'Power BI modelindeki ilk sipariş tarihi Python hesabıyla karşılaştırılıyor. Bu kod ne yazdırır?',
        needs: ['pandas'],
        code: 'import veri\no = veri.oku("anadolu_market", "orders", parse_dates=["order_date"])\nbi = veri.oku("kesit_bi", "Musteriler").set_index("MusteriNo")["IlkSiparis"]\nprint(int(bi.isna().sum()), o["customer_id"].nunique())\nilk = o.groupby("customer_id")["order_date"].min().dt.strftime("%Y-%m-%d")\nbi = bi.dropna()\nprint(int((bi == ilk.reindex(bi.index)).sum()))\n',
        o: ['14 136\n123', '0 150\n136', '14 136\n136', '14 136\n0'],
        a: 0,
        why: 'Hiç siparişi olmayan 14 müşterinin IlkSiparis\'i boş; 136 müşteri sipariş vermiş. Tüm siparişlerden hesaplanan ilk tarih 123 müşteride tutar; 13 farkın nedeni iptal edilen siparişlerdir.'
      },
      {
        t: 'order',
        stage: 'Kodu oku',
        q: '<p>RFM segmentlerini Power BI\'daki segment tablosuyla birleştirip segmentleri tablodaki sıraya göre yazdıran programın son adımlarını sırala (<code>r</code> içinde <code>Segment</code> sütunu hazır).</p>',
        needs: ['pandas'],
        lines: ['import veri', 'import pandas as pd', 'r = pd.DataFrame({"Segment": ["Yeni", "Şampiyon", "Şampiyon", "Kaybedilmiş"]})', 'sayim = r["Segment"].value_counts().rename("musteri").reset_index()', 'seg = veri.oku("kesit_bi", "RFMSegmentleri")', 'tablo = seg.merge(sayim, on="Segment", how="left").fillna({"musteri": 0}).sort_values("Sira")', 'print(tablo[["Segment", "musteri"]].astype({"musteri": int}).values.tolist())'],
        expect: '[[\'Şampiyon\', 2], [\'Sadık\', 0], [\'Potansiyel sadık\', 0], [\'Yeni\', 1], [\'Dikkat gerektiren\', 0], [\'Risk altında\', 0], [\'Kaybedilmiş\', 1]]\n',
        hint: 'Segment tablosu solda olmalı ki boş segmentler de raporda görünsün.',
        why: 'Boyut tablosunu sola koyup left merge yapmak, o ay hiç müşterisi olmayan segmentleri de 0 ile gösterir; Power BI\'daki "veri olmayan öğeleri göster" ayarının karşılığıdır.'
      },
      {
        t: 'code',
        id: 'proje-ileri-v1',
        stage: 'Rehberli',
        diff: 2,
        needs: ['pandas'],
        q: '<p><code>siparis_tablosu()</code>: <code>orders</code> tablosunu (tarih sütunu datetime) okuyup her siparişe kalemlerinden hesaplanan <code>tutar</code> sütununu (<code>quantity * unit_price * (1 - discount)</code> toplamı) ekle. Sonuç 910 satır, sütunlar: order_id, customer_id, order_date, status, channel, tutar.</p>',
        guide: ['orders\'ı parse_dates=["order_date"] ile oku.', 'order_items\'ta satır tutarını hesapla.', 'order_id\'ye göre topla.', 'o.join(toplam, on="order_id") ile ekle.'],
        example: 'import pandas as pd\no = pd.DataFrame({"oid": [1, 2]})\nk = pd.DataFrame({"oid": [1, 1, 2], "t": [5.0, 2.0, 4.0]})\nprint(o.join(k.groupby("oid")["t"].sum(), on="oid"))\n',
        start: 'import veri\nimport pandas as pd\n\ndef siparis_tablosu():\n    o = veri.oku("anadolu_market", "orders", parse_dates=["order_date"])\n    oi = veri.oku("anadolu_market", "order_items")\n    # TODO: kalem tutarı, sipariş toplamı, birleştirme\n    return o\n',
        sol: 'import veri\nimport pandas as pd\n\ndef siparis_tablosu():\n    o = veri.oku("anadolu_market", "orders", parse_dates=["order_date"])\n    oi = veri.oku("anadolu_market", "order_items")\n    oi["tutar"] = oi["quantity"] * oi["unit_price"] * (1 - oi["discount"])\n    return o.join(oi.groupby("order_id")["tutar"].sum(), on="order_id")\n',
        tests: 's = siparis_tablosu()\nassert len(s) == 910, f"910 sipariş olmalı, {len(s)} geldi"\nassert list(s.columns) == ["order_id", "customer_id", "order_date", "status", "channel", "tutar"], f"Sütunlar: {list(s.columns)}"\nassert round(s["tutar"].sum(), 2) == 1346189.85, f"Toplam tutar 1.346.189,85 olmalı: {s[\'tutar\'].sum()}"\nassert round(s.loc[s["status"] == "delivered", "tutar"].sum(), 2) == 1060216.0, "Teslim edilmiş ciro"\nassert str(s["order_date"].dtype).startswith("datetime64"), "order_date datetime olmalı"\n',
        hints: ['Önce kalem düzeyinde tutar, sonra sipariş düzeyinde toplam.', 'join, Series\'in adını sütun adı olarak kullanır.'],
        why: 'Tüm durumların toplamı Power BI\'daki Satislar[Tutar] toplamıyla (1.346.189,85 TL) kuruşu kuruşuna aynı: iki sistem aynı ham veriden besleniyor.'
      },
      {
        t: 'code',
        id: 'proje-ileri-v2',
        stage: 'Rehberli',
        diff: 2,
        needs: ['pandas'],
        q: '<p><code>rfm_skorla(r, q=5)</code>: <code>rfm_hesapla</code> (verildi) çıktısındaki R, F, M sütunlarına 1..q puanları ekle: <code>r</code> (recency, TERS: en yakın tarih en yüksek puan), <code>f</code>, <code>m</code>. Puanlama: <code>pd.qcut(seri.rank(method="first"), q, labels=False) + 1</code>. Girdiyi değiştirme, kopya döndür.</p>',
        guide: ['r = r.copy() ile başla.', 'Bir yardımcı _puan(seri, q, ters) yaz: qcut(rank(method="first"), q, labels=False) + 1.', 'ters=True ise q + 1 - puan döndür.', 'R için ters puan; F ve M için düz puan.'],
        example: 'import pandas as pd\ns = pd.Series([10, 3, 3, 50, 7])\np = pd.qcut(s.rank(method="first"), 5, labels=False) + 1\nprint(p.tolist(), (6 - p).tolist())\n',
        start: 'import veri\nimport pandas as pd\n\ndef siparis_tablosu():\n    o = veri.oku("anadolu_market", "orders", parse_dates=["order_date"])\n    oi = veri.oku("anadolu_market", "order_items")\n    oi["tutar"] = oi["quantity"] * oi["unit_price"] * (1 - oi["discount"])\n    return o.join(oi.groupby("order_id")["tutar"].sum(), on="order_id")\n\ndef rfm_hesapla(s, bugun="2025-01-01"):\n    d = s[s["status"] == "delivered"]\n    r = d.groupby("customer_id").agg(son=("order_date", "max"), F=("order_id", "size"), M=("tutar", "sum"))\n    r["R"] = (pd.Timestamp(bugun) - r["son"]).dt.days\n    return r[["R", "F", "M"]]\n\n\ndef rfm_skorla(r, q=5):\n    r = r.copy()\n    # TODO: r, f, m puanları\n    return r\n',
        sol: 'import veri\nimport pandas as pd\n\ndef siparis_tablosu():\n    o = veri.oku("anadolu_market", "orders", parse_dates=["order_date"])\n    oi = veri.oku("anadolu_market", "order_items")\n    oi["tutar"] = oi["quantity"] * oi["unit_price"] * (1 - oi["discount"])\n    return o.join(oi.groupby("order_id")["tutar"].sum(), on="order_id")\n\ndef rfm_hesapla(s, bugun="2025-01-01"):\n    d = s[s["status"] == "delivered"]\n    r = d.groupby("customer_id").agg(son=("order_date", "max"), F=("order_id", "size"), M=("tutar", "sum"))\n    r["R"] = (pd.Timestamp(bugun) - r["son"]).dt.days\n    return r[["R", "F", "M"]]\n\ndef _puan(seri, q=5, ters=False):\n    p = pd.qcut(seri.rank(method="first"), q, labels=False) + 1\n    return (q + 1 - p) if ters else p\n\ndef rfm_skorla(r, q=5):\n    r = r.copy()\n    r["r"] = _puan(r["R"], q, ters=True)\n    r["f"] = _puan(r["F"], q)\n    r["m"] = _puan(r["M"], q)\n    return r\n',
        tests: 'r = rfm_hesapla(siparis_tablosu())\nk = rfm_skorla(r)\nassert list(r.columns) == ["R", "F", "M"], "Girdi değiştirilmemeli"\nassert k.loc[1, ["r", "f", "m"]].tolist() == [1, 3, 2], f"1 numaralı müşteri: {k.loc[1, [\'r\', \'f\', \'m\']].tolist()}"\nassert k.loc[4, ["r", "f", "m"]].tolist() == [5, 5, 5], "4 numaralı müşteri her boyutta en üst dilimde"\nassert sorted(k["r"].value_counts().tolist()) == [27, 27, 27, 27, 27], "Her dilimde 27 müşteri (135 / 5)"\n',
        hints: ['rank(method="first") eşit değerlere sırayla farklı sıra verir; qcut artık sınır çakışmasıyla hata vermez.', 'labels=False dilim numarasını 0\'dan verir; +1 ekle.'],
        why: 'rank(method="first") sayesinde 135 müşteri tam 27\'şerlik beş dilime bölünür. 1 numaralı müşteri bir yılı aşkın süredir alışveriş yapmadığı için recency puanı 1.'
      },
      {
        t: 'code',
        id: 'proje-ileri-v3',
        stage: 'Rehberli',
        diff: 2,
        needs: ['pandas'],
        q: '<p><code>segment_ata(r, f)</code>: R ve F puanından (1–5) <code>kesit_bi.RFMSegmentleri</code> tablosundaki segment adlarından birini döndür. Kurallar sırayla: r ≥ 4 ve f ≥ 4 → "Şampiyon"; r = 3 ve f ≥ 4 → "Sadık"; r ≥ 4 ve f ≥ 2 → "Potansiyel sadık"; r ≥ 4 → "Yeni"; r = 3 → "Dikkat gerektiren"; f ≥ 3 → "Risk altında"; diğerleri → "Kaybedilmiş".</p>',
        guide: ['Kuralları yazıldığı sırayla if ... return olarak yaz.', 'Önceki kurallar zaten eledikleri için sonraki koşullar kısa kalır.', 'Son satır varsayılan: "Kaybedilmiş".'],
        example: 'def kademe(puan):\n    if puan >= 90:\n        return "A"\n    if puan >= 70:\n        return "B"\n    return "C"\nprint([kademe(p) for p in (95, 80, 10)])\n',
        start: 'def segment_ata(r, f):\n    # TODO: 7 kural\n    return "Kaybedilmiş"\n',
        sol: 'def segment_ata(r, f):\n    if r >= 4 and f >= 4:\n        return "Şampiyon"\n    if r == 3 and f >= 4:\n        return "Sadık"\n    if r >= 4 and f >= 2:\n        return "Potansiyel sadık"\n    if r >= 4:\n        return "Yeni"\n    if r == 3:\n        return "Dikkat gerektiren"\n    if f >= 3:\n        return "Risk altında"\n    return "Kaybedilmiş"\n',
        tests: 'import veri\nadlar = set(veri.oku("kesit_bi", "RFMSegmentleri")["Segment"])\nsonuc = {segment_ata(r, f) for r in range(1, 6) for f in range(1, 6)}\nassert sonuc == adlar, f"25 kombinasyon 7 segmentin hepsini üretmeli ve yalnızca onları: {sonuc ^ adlar}"\nassert segment_ata(5, 5) == "Şampiyon" and segment_ata(3, 5) == "Sadık"\nassert segment_ata(5, 1) == "Yeni" and segment_ata(4, 3) == "Potansiyel sadık"\nassert segment_ata(2, 4) == "Risk altında" and segment_ata(1, 2) == "Kaybedilmiş" and segment_ata(3, 2) == "Dikkat gerektiren"\n',
        hints: ['Adların yazımı Power BI tablosuyla birebir aynı olmalı (büyük-küçük harf dahil).', 'if r >= 4 and f >= 4: return "Şampiyon"'],
        why: 'Segment adlarını şirketin mevcut modelinden almak, Python raporunun Power BI panosuyla birleştirilebilmesini sağlar: aynı ad, aynı sıra, aynı eylem.'
      },
      {
        t: 'code',
        id: 'proje-ileri-v4',
        stage: 'Kendin yaz',
        diff: 2,
        needs: ['pandas'],
        q: '<p><code>segment_raporu()</code>: siparis_tablosu → rfm_hesapla → rfm_skorla → segment_ata (hepsi verildi) zincirini çalıştır. <code>kesit_bi.RFMSegmentleri</code> tablosunu SOLA koyarak segment başına <code>musteri</code> (int) ve cirodaki yüzde <code>pay</code> (M toplamının yüzdesi, 1 basamak) ekle; <code>Sira</code>\'ya göre sırala. Sütunlar: Segment, musteri, pay, Eylem. Index 0\'dan başlasın.</p>',
        start: 'import veri\nimport pandas as pd\n\ndef siparis_tablosu():\n    o = veri.oku("anadolu_market", "orders", parse_dates=["order_date"])\n    oi = veri.oku("anadolu_market", "order_items")\n    oi["tutar"] = oi["quantity"] * oi["unit_price"] * (1 - oi["discount"])\n    return o.join(oi.groupby("order_id")["tutar"].sum(), on="order_id")\n\ndef rfm_hesapla(s, bugun="2025-01-01"):\n    d = s[s["status"] == "delivered"]\n    r = d.groupby("customer_id").agg(son=("order_date", "max"), F=("order_id", "size"), M=("tutar", "sum"))\n    r["R"] = (pd.Timestamp(bugun) - r["son"]).dt.days\n    return r[["R", "F", "M"]]\n\ndef _puan(seri, q=5, ters=False):\n    p = pd.qcut(seri.rank(method="first"), q, labels=False) + 1\n    return (q + 1 - p) if ters else p\n\ndef rfm_skorla(r, q=5):\n    r = r.copy()\n    r["r"] = _puan(r["R"], q, ters=True)\n    r["f"] = _puan(r["F"], q)\n    r["m"] = _puan(r["M"], q)\n    return r\n\ndef segment_ata(r, f):\n    if r >= 4 and f >= 4:\n        return "Şampiyon"\n    if r == 3 and f >= 4:\n        return "Sadık"\n    if r >= 4 and f >= 2:\n        return "Potansiyel sadık"\n    if r >= 4:\n        return "Yeni"\n    if r == 3:\n        return "Dikkat gerektiren"\n    if f >= 3:\n        return "Risk altında"\n    return "Kaybedilmiş"\n\ndef segment_raporu():\n    pass\n',
        sol: 'import veri\nimport pandas as pd\n\ndef siparis_tablosu():\n    o = veri.oku("anadolu_market", "orders", parse_dates=["order_date"])\n    oi = veri.oku("anadolu_market", "order_items")\n    oi["tutar"] = oi["quantity"] * oi["unit_price"] * (1 - oi["discount"])\n    return o.join(oi.groupby("order_id")["tutar"].sum(), on="order_id")\n\ndef rfm_hesapla(s, bugun="2025-01-01"):\n    d = s[s["status"] == "delivered"]\n    r = d.groupby("customer_id").agg(son=("order_date", "max"), F=("order_id", "size"), M=("tutar", "sum"))\n    r["R"] = (pd.Timestamp(bugun) - r["son"]).dt.days\n    return r[["R", "F", "M"]]\n\ndef _puan(seri, q=5, ters=False):\n    p = pd.qcut(seri.rank(method="first"), q, labels=False) + 1\n    return (q + 1 - p) if ters else p\n\ndef rfm_skorla(r, q=5):\n    r = r.copy()\n    r["r"] = _puan(r["R"], q, ters=True)\n    r["f"] = _puan(r["F"], q)\n    r["m"] = _puan(r["M"], q)\n    return r\n\ndef segment_ata(r, f):\n    if r >= 4 and f >= 4:\n        return "Şampiyon"\n    if r == 3 and f >= 4:\n        return "Sadık"\n    if r >= 4 and f >= 2:\n        return "Potansiyel sadık"\n    if r >= 4:\n        return "Yeni"\n    if r == 3:\n        return "Dikkat gerektiren"\n    if f >= 3:\n        return "Risk altında"\n    return "Kaybedilmiş"\n\ndef segment_raporu():\n    r = rfm_skorla(rfm_hesapla(siparis_tablosu()))\n    r["Segment"] = [segment_ata(a, b) for a, b in zip(r["r"], r["f"])]\n    ozet = r.groupby("Segment").agg(musteri=("M", "size"), ciro=("M", "sum")).reset_index()\n    t = veri.oku("kesit_bi", "RFMSegmentleri").merge(ozet, on="Segment", how="left")\n    t = t.fillna({"musteri": 0, "ciro": 0}).sort_values("Sira")\n    t["musteri"] = t["musteri"].astype(int)\n    t["pay"] = (t["ciro"] / t["ciro"].sum() * 100).round(1)\n    return t[["Segment", "musteri", "pay", "Eylem"]].reset_index(drop=True)\n',
        tests: 't = segment_raporu()\nassert list(t.columns) == ["Segment", "musteri", "pay", "Eylem"], f"Sütunlar: {list(t.columns)}"\nassert t["Segment"].tolist() == ["Şampiyon", "Sadık", "Potansiyel sadık", "Yeni", "Dikkat gerektiren", "Risk altında", "Kaybedilmiş"], "Sira\'ya göre sıralı olmalı"\nassert t["musteri"].tolist() == [30, 11, 20, 4, 16, 26, 28], f"Müşteri sayıları: {t[\'musteri\'].tolist()}"\nassert t["pay"].tolist() == [45.4, 11.9, 8.9, 0.8, 4.1, 20.6, 8.4], f"Ciro payları: {t[\'pay\'].tolist()}"\nassert t.loc[5, "Eylem"].startswith("Kişisel geri kazanma"), "Eylem Power BI tablosundan gelmeli"\n',
        hints: ['Segment tablosu sol tarafta: veri.oku("kesit_bi", "RFMSegmentleri").merge(ozet, on="Segment", how="left").', 'Pay için M toplamını segment düzeyinde topla.'],
        why: 'Rapor doğrudan iş diline çevrilmiş: hangi segmentte kaç müşteri var, ciroya katkısı ne, ne yapılmalı. Eylem metni Power BI modelinden geldiği için iki rapor birbiriyle çelişmez.'
      },
      {
        t: 'code',
        id: 'proje-ileri-v5',
        stage: 'Kendin yaz',
        diff: 3,
        needs: ['pandas'],
        q: '<p><code>kohort_tutma(s)</code>: Power BI modeliyle aynı tanımı kullan: müşterinin kohortu <b>iptal edilmemiş</b> ilk siparişinin ayı (<code>"YYYY-MM"</code>). İptal edilmemiş siparişlerde her siparişin <code>ay_no</code>\'su = kohort ayından bu yana geçen ay sayısı. Kohort × ay_no tablosunda farklı müşteri sayısını hesapla (boşlar 0) ve her satırı 0. sütuna bölerek tutma oranı tablosunu (0–1 arası) döndür. <code>s</code>: <code>siparis_tablosu()</code> çıktısı.</p>',
        start: 'import veri\nimport pandas as pd\n\ndef siparis_tablosu():\n    o = veri.oku("anadolu_market", "orders", parse_dates=["order_date"])\n    oi = veri.oku("anadolu_market", "order_items")\n    oi["tutar"] = oi["quantity"] * oi["unit_price"] * (1 - oi["discount"])\n    return o.join(oi.groupby("order_id")["tutar"].sum(), on="order_id")\n\ndef kohort_tutma(s):\n    pass\n',
        sol: 'import veri\nimport pandas as pd\n\ndef siparis_tablosu():\n    o = veri.oku("anadolu_market", "orders", parse_dates=["order_date"])\n    oi = veri.oku("anadolu_market", "order_items")\n    oi["tutar"] = oi["quantity"] * oi["unit_price"] * (1 - oi["discount"])\n    return o.join(oi.groupby("order_id")["tutar"].sum(), on="order_id")\n\ndef kohort_tutma(s):\n    d = s[s["status"] != "cancelled"].copy()\n    ilk = d.groupby("customer_id")["order_date"].transform("min")\n    d["kohort"] = ilk.dt.strftime("%Y-%m")\n    d["ay_no"] = (d["order_date"].dt.year - ilk.dt.year) * 12 + (d["order_date"].dt.month - ilk.dt.month)\n    t = d.groupby(["kohort", "ay_no"])["customer_id"].nunique().unstack(fill_value=0)\n    return t.div(t[0], axis=0)\n',
        tests: 'import veri\nt = kohort_tutma(siparis_tablosu())\nassert t.shape == (30, 31), f"30 kohort x 31 ay olmalı, {t.shape} geldi"\nassert (t[0] == 1).all(), "0. ay her kohortta 1 (yüzde 100)"\nassert round(float(t[1].mean()) * 100, 1) == 19.0, f"1. ay ortalama tutma %19.0 olmalı: {t[1].mean()}"\nbi = veri.oku("kesit_bi", "Musteriler")["KohortAy"].dropna()\nassert sorted(bi.unique()) == sorted(t.index), "Kohort ayları Power BI modelindeki KohortAy değerleriyle aynı olmalı"\n',
        hints: ['Kohortu iptal edilmemiş siparişlerden hesapla: s[s["status"] != "cancelled"].', 'transform("min") her satıra müşterinin ilk tarihini yazar.', 'Ay farkı: yıl farkı * 12 + ay farkı.'],
        why: 'Tanımı Power BI modeliyle aynı yapınca kohort ayları birebir örtüşür. Ortalama olarak her kohortun yalnızca %19\'u bir sonraki ay tekrar alışveriş yapıyor; ikinci alışverişi teşvik etmek (hoş geldin akışı) en büyük kaldıraç.'
      },
      {
        t: 'code',
        id: 'proje-ileri-v6',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 2,
        needs: ['pandas'],
        q: '<p>Hatayı bul ve düzelt. <code>kohort_farki(s)</code> her siparişin kohort ay farkını hesaplayıp Power BI\'daki <code>Satislar.KohortAyFarki</code> ile karşılaştırmalı ve <b>eşleşmeyen sipariş sayısını</b> döndürmeli. Tanımlar aynıysa sonuç 0 olmalı; şu an 0 değil.</p>',
        start: 'import veri\nimport pandas as pd\n\ndef siparis_tablosu():\n    o = veri.oku("anadolu_market", "orders", parse_dates=["order_date"])\n    oi = veri.oku("anadolu_market", "order_items")\n    oi["tutar"] = oi["quantity"] * oi["unit_price"] * (1 - oi["discount"])\n    return o.join(oi.groupby("order_id")["tutar"].sum(), on="order_id")\n\ndef kohort_farki(s):\n    ilk = s.groupby("customer_id")["order_date"].transform("min")\n    ay_no = (s["order_date"].dt.year - ilk.dt.year) * 12 + (s["order_date"].dt.month - ilk.dt.month)\n    py = pd.Series(ay_no.values, index=s["order_id"])\n    bi = veri.oku("kesit_bi", "Satislar").drop_duplicates("SiparisNo").set_index("SiparisNo")["KohortAyFarki"]\n    return int((py.reindex(bi.index) != bi).sum())\n',
        sol: 'import veri\nimport pandas as pd\n\ndef siparis_tablosu():\n    o = veri.oku("anadolu_market", "orders", parse_dates=["order_date"])\n    oi = veri.oku("anadolu_market", "order_items")\n    oi["tutar"] = oi["quantity"] * oi["unit_price"] * (1 - oi["discount"])\n    return o.join(oi.groupby("order_id")["tutar"].sum(), on="order_id")\n\ndef kohort_farki(s):\n    ilk = s[s["status"] != "cancelled"].groupby("customer_id")["order_date"].min()\n    ilk = s["customer_id"].map(ilk)\n    ay_no = (s["order_date"].dt.year - ilk.dt.year) * 12 + (s["order_date"].dt.month - ilk.dt.month)\n    py = pd.Series(ay_no.values, index=s["order_id"])\n    bi = veri.oku("kesit_bi", "Satislar").drop_duplicates("SiparisNo").set_index("SiparisNo")["KohortAyFarki"]\n    return int((py.reindex(bi.index) != bi).sum())\n',
        tests: 'assert kohort_farki(siparis_tablosu()) == 0, f"Tanım Power BI ile aynı olunca fark 0 olmalı: {kohort_farki(siparis_tablosu())}"\n',
        hints: ['Power BI modelinde kohort hangi siparişlerden hesaplanıyor? IlkSiparis karşılaştırmasını hatırla.', 'İlk tarihi yalnızca iptal edilmemiş siparişlerden bul, ama ay farkını TÜM siparişler (iptaller dahil) için hesapla.'],
        why: 'İptal edilen ilk sipariş kohortu bir ay ya da daha erkene çekiyordu ve o müşterinin bütün siparişlerinin ay farkı kayıyordu. Mutabakatta tek bir tanım farkı çok sayıda satıra yayılır.'
      },
      {
        t: 'code',
        id: 'proje-ileri-v7',
        stage: 'Meydan okuma',
        diff: 3,
        needs: ['pandas'],
        q: '<p>Ciro mutabakatı. <code>mutabakat(s)</code>: Python tarafında durum başına tutarı (<code>siparis_tablosu</code>), Power BI tarafında <code>Satislar</code>\'ta <code>Durum</code> başına <code>Tutar</code> toplamını hesapla. Durum adlarını <code>{"delivered": "Teslim Edildi", "shipped": "Kargoda", "returned": "İade", "cancelled": "İptal"}</code> ile eşle. Şunu döndür: <code>{"toplam_fark": .., "durum_farki": {durum: fark}, "farkli_siparisler": [order_id, ...]}</code>. Farklar Python − Power BI, 2 basamak; <code>durum_farki</code> yalnızca farkı sıfır olmayan durumları (Python adlarıyla) içersin; <code>farkli_siparisler</code> iki sistemde durumu farklı olan siparişlerin sıralı listesi.</p>',
        start: 'import veri\nimport pandas as pd\n\ndef siparis_tablosu():\n    o = veri.oku("anadolu_market", "orders", parse_dates=["order_date"])\n    oi = veri.oku("anadolu_market", "order_items")\n    oi["tutar"] = oi["quantity"] * oi["unit_price"] * (1 - oi["discount"])\n    return o.join(oi.groupby("order_id")["tutar"].sum(), on="order_id")\n\nESLE = {"delivered": "Teslim Edildi", "shipped": "Kargoda", "returned": "İade", "cancelled": "İptal"}\n\ndef mutabakat(s):\n    pass\n',
        sol: 'import veri\nimport pandas as pd\n\ndef siparis_tablosu():\n    o = veri.oku("anadolu_market", "orders", parse_dates=["order_date"])\n    oi = veri.oku("anadolu_market", "order_items")\n    oi["tutar"] = oi["quantity"] * oi["unit_price"] * (1 - oi["discount"])\n    return o.join(oi.groupby("order_id")["tutar"].sum(), on="order_id")\n\nESLE = {"delivered": "Teslim Edildi", "shipped": "Kargoda", "returned": "İade", "cancelled": "İptal"}\n\ndef mutabakat(s):\n    bi = veri.oku("kesit_bi", "Satislar")\n    py_d = s.groupby("status")["tutar"].sum()\n    bi_d = bi.groupby("Durum")["Tutar"].sum()\n    fark = {d: round(float(py_d.get(d, 0) - bi_d.get(ESLE[d], 0)), 2) for d in ESLE}\n    durum = bi.drop_duplicates("SiparisNo").set_index("SiparisNo")["Durum"]\n    py_durum = s.set_index("order_id")["status"].map(ESLE).reindex(durum.index)\n    return {"toplam_fark": round(float(s["tutar"].sum() - bi["Tutar"].sum()), 2),\n            "durum_farki": {d: v for d, v in fark.items() if v != 0},\n            "farkli_siparisler": sorted(int(i) for i in durum.index[py_durum != durum])}\n',
        tests: 'm = mutabakat(siparis_tablosu())\nassert m["toplam_fark"] == 0.0, f"Toplam tutar iki sistemde aynı olmalı: {m[\'toplam_fark\']}"\nassert m["durum_farki"] == {"delivered": 10589.0, "shipped": -10589.0}, f"Durum farkı: {m[\'durum_farki\']}"\nassert m["farkli_siparisler"] == [117, 210, 454, 655, 882], f"Farklı siparişler: {m[\'farkli_siparisler\']}"\n',
        hints: ['Önce toplamlar: toplam tutar aynıysa sorun tutarda değil, sınıflandırmadadır.', 'Durum farkını sipariş düzeyinde bul: Satislar\'ı SiparisNo\'ya göre tekilleştir.', 'Farklı çıkan siparişlerin tarihlerine bak: hepsi Aralık sonu mu?'],
        why: 'Toplam aynı, dağılım farklı: beş sipariş (28–31 Aralık) Power BI\'da hâlâ "Kargoda", operasyon veritabanında "delivered". Neden veri hatası değil, modelin teslimattan önce yenilenmiş olmasıdır. Mutabakat notu: "Power BI anlık görüntüsü 28 Aralık öncesine ait; 5 sipariş, 10.589 TL".'
      }
    ],
    faq: [
      {
        q: 'Python ve Power BI sonuçları farklıysa hangisi doğrudur?',
        a: 'Önce "doğru" yerine "hangi tanım" diye sor. Bu projede iki fark çıktı: kohort tanımı (iptaller sayılıyor mu) ve verinin çekildiği an. İkisi de hata değil; ama raporlar arasında tutarlılık için şirket tek bir tanım seçmeli ve bu tanım hem Python kodunda hem Power BI modelinde aynı olmalı. Farkı ve nedenini README\'ye yaz.'
      },
      {
        q: 'Segment kurallarını neden puan ızgarasıyla yaptık da k-means kullanmadık?',
        a: 'Kural tabanlı RFM açıklanabilir, sabittir ve Power BI\'da DAX ile birebir yeniden yazılabilir; pazarlama ekibi "Şampiyon" tanımını tek cümleyle anlatabilir. k-means (ml-kumeleme dersi) veriye göre şekil değiştirir ve her ay yeniden yorumlanması gerekir. Pratikte ikisi birlikte kullanılır: kurallar rapor için, kümeleme keşif için.'
      }
    ],
    mistakes: [
      {
        bad: 'seg_ozet.merge(segmentler, on="Segment")',
        good: 'segmentler.merge(seg_ozet, on="Segment", how="left").fillna({"musteri": 0})',
        why: 'Sonuç tablosunu sola koyarsan o dönemde müşterisi olmayan segmentler rapordan kaybolur; boyut tablosu solda olmalı.'
      }
    ]
  }
);
})(window);
