from common import write

DS = 'anadolu_bank'
TOPIC = 'Veri seti: Anadolu Bank'
T = []


def add(**k):
    k.setdefault('topic', TOPIC)
    k.setdefault('ds', DS)
    T.append(k)


# ---------------------------------------------------------------- TEMEL
add(id='b-431', lv='temel', diff=1, kind='rehberli', title='Aktif hesapların türlere dağılımı',
    q='<p><b>Ürün yönetimi ekibi soruyor:</b> "Şu an açık olan hesapların kaçı vadesiz, kaçı vadeli, kaçı kredi kartı?"</p>'
      '<p><code>aktif_hesap_turleri(hesaplar)</code> fonksiyonunu yaz. <code>hesaplar</code> = <code>veri.kayitlar("anadolu_bank", "bank_accounts")</code>. '
      'Yalnız <code>status == "aktif"</code> olan hesapları say; <code>{account_type: sayı}</code> sözlüğü döndür.</p>',
    guide=['Boş bir sayaç sözlüğü oluştur.', 'Her hesapta önce durumu kontrol et; aktif değilse <code>continue</code> ile geç.',
           'Aktifse <code>account_type</code> anahtarını 1 artır.', 'Sözlüğü döndür.'],
    example='''
# Benzer teknik: koşullu sayım (yalnız onaylı başvurular)
basvurular = [{"tur": "konut", "onay": True}, {"tur": "taşıt", "onay": False}, {"tur": "konut", "onay": True}]
sayac = {}
for b in basvurular:
    if not b["onay"]:
        continue
    sayac[b["tur"]] = sayac.get(b["tur"], 0) + 1
print(sayac)
''',
    start='''
import veri

hesaplar = veri.kayitlar("anadolu_bank", "bank_accounts")


def aktif_hesap_turleri(hesaplar):
    sayac = {}
    for h in hesaplar:
        # TODO 1: aktif olmayan hesabı atla
        # TODO 2: h["account_type"] anahtarını 1 artır
        pass
    return sayac
''',
    sol='''
import veri

hesaplar = veri.kayitlar("anadolu_bank", "bank_accounts")


def aktif_hesap_turleri(hesaplar):
    sayac = {}
    for h in hesaplar:
        if h["status"] != "aktif":
            continue
        sayac[h["account_type"]] = sayac.get(h["account_type"], 0) + 1
    return sayac


print(aktif_hesap_turleri(hesaplar))
''',
    calc={'R': 'aktif_hesap_turleri(hesaplar)'},
    tests='''
r = aktif_hesap_turleri(hesaplar)
assert r == @R@, "Aktif hesap sayıları tutmuyor; kapalı hesapları atladın mı?"
assert sum(r.values()) == 806, "806 aktif hesap olmalı (849 hesabın 43\\'ü kapalı)"
assert aktif_hesap_turleri([{"status": "kapali", "account_type": "vadeli"}]) == {}, "Yalnız kapalı hesap varsa boş sözlük dönmeli"
''',
    hints=['Önce süz, sonra say.', '<code>if h["status"] != "aktif": continue</code>', '<code>sayac[t] = sayac.get(t, 0) + 1</code>'],
    why='<code>continue</code> ile erken atlama, iç içe if bloklarını azaltır ("guard clause"). SQL karşılığı: <code>WHERE status = \'aktif\' GROUP BY account_type</code>. '
        'Bankacılık raporlarında kapalı hesapları yanlışlıkla saymak, müşteri ve ürün sayılarını şişiren en yaygın hatadır.',
    tags=['sözlük', 'continue', 'koşullu sayım'], min=5)

add(id='b-432', lv='temel', diff=1, kind='yaz', title='Segment başına pazarlama izni oranı',
    q='<p><b>KVKK uyum ekibi ve pazarlama soruyor:</b> "Hangi segmentte müşterilerin yüzde kaçı pazarlama iletisi almaya izin verdi?"</p>'
      '<p><code>izin_orani(musteriler)</code> fonksiyonunu yaz (<code>veri.kayitlar("anadolu_bank", "bank_customers")</code>). '
      '<code>kvkk_consent</code> 1 ise izin var. Dönüş: <code>{segment: yüzde}</code>, 1 ondalık.</p>',
    start='''
import veri

musteriler = veri.kayitlar("anadolu_bank", "bank_customers")


def izin_orani(musteriler):
    pass
''',
    sol='''
import veri

musteriler = veri.kayitlar("anadolu_bank", "bank_customers")


def izin_orani(musteriler):
    toplam, izinli = {}, {}
    for m in musteriler:
        s = m["segment"]
        toplam[s] = toplam.get(s, 0) + 1
        izinli[s] = izinli.get(s, 0) + m["kvkk_consent"]
    return {s: round(izinli[s] / toplam[s] * 100, 1) for s in toplam}


print(izin_orani(musteriler))
''',
    calc={'R': 'izin_orani(musteriler)'},
    tests='''
r = izin_orani(musteriler)
assert set(r) == {"Bireysel", "KOBİ", "Özel Bankacılık"}, "Üç segment olmalı"
assert r == @R@, "Oranlar tutmuyor: payda segmentin kendi müşteri sayısı olmalı"
ornek = [{"segment": "X", "kvkk_consent": 1}, {"segment": "X", "kvkk_consent": 0}, {"segment": "Y", "kvkk_consent": 0}]
assert izin_orani(ornek) == {"X": 50.0, "Y": 0.0}, "Hiç izni olmayan segment 0.0 görünmeli"
''',
    hints=['İki sözlük biriktir: segment başına toplam ve izinli sayısı.', '1/0 alanını doğrudan toplamak izinli sayısını verir.',
           'Sonda sözlük üreteci: <code>{s: round(izinli[s] / toplam[s] * 100, 1) for s in toplam}</code>'],
    why='0/1 bayraklarını toplamak koşullu saymanın kısa yoludur. İzinli sayacını da her müşteride (0 eklesen bile) güncellemek, hiç izni olmayan segmentin sonuçta '
        '0.0 olarak görünmesini sağlar; yalnız izinlileri sayarsan o segment KeyError verir. pandas\'ta: <code>df.groupby("segment")["kvkk_consent"].mean() * 100</code>.',
    tags=['oran', 'sözlük üreteci', 'gruplama'], min=6)

add(id='b-433', lv='temel', diff=1, kind='rehberli', title='Şube başına müşteri sayısı',
    q='<p><b>Şubeler koordinatörü soruyor:</b> "Hangi şubemiz kaç müşteriye bakıyor? Kadro planlaması yapacağız."</p>'
      '<p><code>sube_yuku(musteriler, subeler)</code> fonksiyonunu yaz. Müşteri tablosunda yalnız <code>branch_id</code> var; şube <b>adını</b> <code>bank_branches</code> tablosundan bul. '
      'Dönüş: <code>(sube_adi, musteri_sayisi)</code> listesi; sayıya göre azalan, eşitlikte ada göre artan.</p>',
    guide=['Şube tablosundan <code>{branch_id: name}</code> arama sözlüğü kur (sözlük üreteciyle).', 'Müşterileri gezip şube adına göre say.',
           '<code>sorted(sayac.items(), key=...)</code> ile sırala: önce sayı azalan, sonra ad.', 'Listeyi döndür.'],
    example='''
# Benzer teknik: kimlikten ada çeviren arama sözlüğü (lookup)
kategoriler = [{"id": 1, "ad": "Gıda"}, {"id": 2, "ad": "Temizlik"}]
satislar = [{"kat": 1}, {"kat": 2}, {"kat": 1}]
ad = {k["id"]: k["ad"] for k in kategoriler}
print([ad[s["kat"]] for s in satislar])
''',
    start='''
import veri

musteriler = veri.kayitlar("anadolu_bank", "bank_customers")
subeler = veri.kayitlar("anadolu_bank", "bank_branches")


def sube_yuku(musteriler, subeler):
    # TODO 1: {branch_id: name} sözlüğü
    ad = {}
    sayac = {}
    # TODO 2: her müşterinin şube adına göre say
    # TODO 3: sayı azalan, ad artan sırala
    return list(sayac.items())
''',
    sol='''
import veri

musteriler = veri.kayitlar("anadolu_bank", "bank_customers")
subeler = veri.kayitlar("anadolu_bank", "bank_branches")


def sube_yuku(musteriler, subeler):
    ad = {s["branch_id"]: s["name"] for s in subeler}
    sayac = {}
    for m in musteriler:
        sube = ad[m["branch_id"]]
        sayac[sube] = sayac.get(sube, 0) + 1
    return sorted(sayac.items(), key=lambda x: (-x[1], x[0]))


for sube, n in sube_yuku(musteriler, subeler):
    print(f"{sube:<22}{n:>4}")
''',
    calc={'R': 'sube_yuku(musteriler, subeler)'},
    tests='''
r = sube_yuku(musteriler, subeler)
assert r == @R@, "Şube yükleri ya da sıralama tutmuyor"
assert sum(n for _, n in r) == 500, "Toplam 500 müşteri olmalı"
assert all(isinstance(a, str) for a, _ in r), "Sonuçta şube numarası değil şube ADI olmalı"
''',
    hints=['Numarayı ada çevirmek için arama (lookup) sözlüğü kur.', '<code>ad = {s["branch_id"]: s["name"] for s in subeler}</code>',
           'Sıralama: <code>sorted(sayac.items(), key=lambda x: (-x[1], x[0]))</code>'],
    why='Arama sözlüğü, iki tabloyu birleştirmenin (JOIN) saf Python yoludur: her arama O(1) olduğu için toplam iş O(n + m). '
        'İç içe döngüyle (her müşteri için şube listesini gezmek) O(n × m) olurdu. Power Query\'deki "Sorguları birleştir", Excel\'deki DÜŞEYARA ile aynı fikir.',
    tags=['lookup', 'sözlük üreteci', 'sıralama'], min=6)

add(id='b-434', lv='temel', diff=1, kind='bug', title='Kart limiti ortalaması çok düşük',
    q='<p><b>Kredi kartları birimi itiraz ediyor:</b> "Raporda ortalama kart limiti 7 bin TL civarı görünüyor, bu imkânsız!"</p>'
      '<p><code>ortalama_limit(hesaplar)</code> yalnız <b>kredi kartı</b> hesaplarının ortalama <code>credit_limit</code> değerini (2 ondalık) döndürmeli. '
      'Diğer hesaplarda bu alan boş (<code>None</code>). <b>Hatayı bul ve düzelt.</b></p>',
    start='''
import veri

hesaplar = veri.kayitlar("anadolu_bank", "bank_accounts")


def ortalama_limit(hesaplar):
    toplam = 0
    for h in hesaplar:
        toplam += h["credit_limit"] or 0
    return round(toplam / len(hesaplar), 2)
''',
    sol='''
import veri

hesaplar = veri.kayitlar("anadolu_bank", "bank_accounts")


def ortalama_limit(hesaplar):
    limitler = [h["credit_limit"] for h in hesaplar
                if h["account_type"] == "kredi_karti" and h["credit_limit"] is not None]
    if not limitler:
        return 0.0
    return round(sum(limitler) / len(limitler), 2)


print(ortalama_limit(hesaplar))
''',
    calc={'R': 'ortalama_limit(hesaplar)'},
    tests='''
r = ortalama_limit(hesaplar)
assert r == @R@, "Ortalama yalnız kredi kartı hesapları üzerinden alınmalı (payda 212 olmalı, 849 değil)"
ornek = [{"account_type": "kredi_karti", "credit_limit": 10000.0}, {"account_type": "vadesiz", "credit_limit": None},
         {"account_type": "kredi_karti", "credit_limit": 20000.0}]
assert ortalama_limit(ornek) == 15000.0, "İki kartın ortalaması 15000; vadesiz hesap paydaya girmemeli"
assert ortalama_limit([{"account_type": "vadesiz", "credit_limit": None}]) == 0.0, "Hiç kart yoksa 0.0 dönmeli"
''',
    hints=['Pay doğru görünüyor; payda hangi hesapları sayıyor?', 'Boşları 0 yapıp ortalamaya katmak, ortalamayı aşağı çeker.',
           'Önce kredi kartı limitlerini bir listeye süz, sonra <code>sum(l) / len(l)</code>.'],
    why='Eksik değeri 0 ile doldurmak ortalamayı bozar: 637 kart olmayan hesap paydaya girince ortalama yaklaşık dörtte birine iner. '
        'Doğru yaklaşım eksikleri hesaptan çıkarmaktır (SQL\'de AVG zaten NULL\'ları atlar; pandas\'ta <code>mean()</code> NaN\'ları atlar). '
        '"Boş" ile "sıfır" farklı anlamlar taşır: limiti 0 olan bir kart ile limiti olmayan bir vadesiz hesap aynı şey değildir.',
    tags=['None', 'ortalama', 'eksik veri'], min=5)

add(id='b-435', lv='temel', diff=1, kind='yaz', title='ATM\'lerin en yoğun saatleri',
    q='<p><b>Nakit yönetimi ekibi soruyor:</b> "ATM\'lere para yüklemesini hangi saatlerden önce yapmalıyız? En yoğun saatleri bilmek istiyoruz."</p>'
      '<p><code>yogun_saatler(islemler, n=3)</code> fonksiyonunu yaz. <code>islemler</code> = <code>veri.kayitlar("anadolu_bank", "bank_txns")</code> (42 bin satır). '
      'Yalnız <code>txn_type == "atm"</code> işlemleri al; <code>txn_time</code> metni <code>"2024-01-01 07:05:28"</code> biçiminde, saati (0–23, tam sayı) çıkar. '
      'Dönüş: işlem sayısına göre azalan (eşitlikte saate göre artan) ilk <code>n</code> <code>(saat, adet)</code> demeti.</p>',
    start='''
import veri

islemler = veri.kayitlar("anadolu_bank", "bank_txns")


def yogun_saatler(islemler, n=3):
    pass
''',
    sol='''
import veri

islemler = veri.kayitlar("anadolu_bank", "bank_txns")


def yogun_saatler(islemler, n=3):
    sayac = {}
    for t in islemler:
        if t["txn_type"] != "atm":
            continue
        saat = int(t["txn_time"][11:13])
        sayac[saat] = sayac.get(saat, 0) + 1
    return sorted(sayac.items(), key=lambda x: (-x[1], x[0]))[:n]


print(yogun_saatler(islemler, 5))
''',
    calc={'R': 'yogun_saatler(islemler)', 'R5': 'yogun_saatler(islemler, 5)'},
    tests='''
r = yogun_saatler(islemler)
assert r == @R@, "İlk 3 saat tutmuyor"
assert all(isinstance(s, int) for s, _ in r), "Saat tam sayı olmalı (\\"07\\" değil 7)"
assert yogun_saatler(islemler, 5) == @R5@, "n=5 için ilk 5 saat tutmuyor"
ornek = [{"txn_type": "atm", "txn_time": "2024-03-01 09:15:00"}, {"txn_type": "atm", "txn_time": "2024-03-02 09:59:59"},
         {"txn_type": "fatura", "txn_time": "2024-03-02 10:00:00"}, {"txn_type": "atm", "txn_time": "2024-03-03 18:01:00"}]
assert yogun_saatler(ornek, 2) == [(9, 2), (18, 1)], "Yalnız ATM işlemleri sayılmalı"
''',
    hints=['Metnin 11. ve 12. karakterleri saati verir: <code>t["txn_time"][11:13]</code>.', 'Saat metnini <code>int()</code> ile sayıya çevir; sonra sözlükle say.',
           'Sıralama anahtarı <code>(-adet, saat)</code>, sonra <code>[:n]</code>.'],
    why='Sabit biçimli tarih metninden parça almak için dilimleme, <code>datetime.strptime</code>\'tan çok daha hızlıdır; 42 bin satırda fark hissedilir. '
        'Biçimden emin değilsen strptime daha güvenlidir (hatalı satırda hata verir). Alternatif: <code>Counter(...).most_common(n)</code>; ama eşitlikte sırayı garanti etmek için '
        'kendi sıralama anahtarını yazmak daha iyidir.',
    tags=['dilimleme', 'sayım', 'tarih metni'], min=6)

add(id='b-436', lv='temel', diff=1, kind='tamamla', title='Yüksek riskli müşterilerin şehirleri',
    q='<p><b>Risk yönetimi soruyor:</b> "Risk puanı yüksek (8 ve üstü) müşteriler en çok hangi şehirlerde?"</p>'
      '<p><code>riskli_sehirler(musteriler, esik=8)</code> fonksiyonundaki <code>___</code> boşluklarını doldur. <code>Counter</code> ile say, '
      '<code>most_common()</code> ile en çoktan aza sırala; dönüş <code>(şehir, sayı)</code> listesi.</p>',
    start='''
import veri
from collections import Counter

musteriler = veri.kayitlar("anadolu_bank", "bank_customers")


def riskli_sehirler(musteriler, esik=8):
    sayac = Counter(m["city"] for m in musteriler if m["risk_score"] ___ esik)
    return sayac.___()
''',
    sol='''
import veri
from collections import Counter

musteriler = veri.kayitlar("anadolu_bank", "bank_customers")


def riskli_sehirler(musteriler, esik=8):
    sayac = Counter(m["city"] for m in musteriler if m["risk_score"] >= esik)
    return sayac.most_common()


print(riskli_sehirler(musteriler)[:3])
''',
    calc={'R3': 'riskli_sehirler(musteriler)[:3]', 'N': 'sum(n for _, n in riskli_sehirler(musteriler))', 'N10': 'sum(n for _, n in riskli_sehirler(musteriler, 10))'},
    tests='''
r = riskli_sehirler(musteriler)
assert r[:3] == @R3@, "İlk üç şehir tutmuyor"
assert sum(n for _, n in r) == @N@, "Puanı 8 ve üstü (8 dahil) müşteri sayısı tutmuyor: >= kullan"
assert sum(n for _, n in riskli_sehirler(musteriler, 10)) == @N10@, "esik=10 iken yalnız 10 puanlılar sayılmalı"
''',
    hints=['"8 ve üstü" hangi karşılaştırma işleci?', 'Counter\'ın sıralı liste veren yöntemi.', '<code>&gt;=</code> ve <code>most_common()</code>'],
    why='<code>Counter</code>, sayım sözlüğünün hazır hâlidir; bir üreteç ifadesiyle beslenince süzme ve sayma tek satırda biter. <code>most_common()</code> argümansız çağrılınca '
        'tüm elemanları azalan sırada verir; eşitlikte ilk görülen önce gelir. Sınır değer sorularında ("ve üstü") <code>&gt;</code> ile <code>&gt;=</code> farkı en sık hatadır; '
        'testlerde sınırın kendisini mutlaka dene.',
    tags=['Counter', 'most_common', 'süzme'], min=4)

# ---------------------------------------------------------------- ORTA
add(id='b-437', lv='orta', diff=2, kind='rehberli', needs=['pandas'], title='Kart harcamalarının kategori payları',
    q='<p><b>Kart pazarlama ekibi soruyor:</b> "Müşterilerimiz kartla en çok nereye harcıyor? Kampanya ortaklarını buna göre seçeceğiz."</p>'
      '<p><code>harcama_paylari(txns)</code> fonksiyonunu yaz (<code>veri.oku("anadolu_bank", "bank_txns")</code>). Yalnız <code>kart_harcama</code> işlemleri; '
      'tutarlar eksi işaretli, <b>mutlak değer</b> al. <code>merchant_category</code> başına toplamın genel toplama oranı (%), 1 ondalık, azalan bir <b>Series</b> döndür.</p>',
    guide=['<code>txn_type == "kart_harcama"</code> satırlarını süz.', '<code>amount</code> sütununun mutlak değerini al (<code>.abs()</code>).',
           'Kategoriye göre topla; toplamı genel toplama böl, 100 ile çarp.', 'Yuvarla ve azalan sırala.'],
    example='''
import pandas as pd
# Benzer teknik: grup toplamının genel toplama oranı
df = pd.DataFrame({"bolge": ["K", "G", "K"], "tutar": [-30, -50, -20]})
g = df.assign(tutar=df["tutar"].abs()).groupby("bolge")["tutar"].sum()
print((g / g.sum() * 100).round(1))
''',
    start='''
import veri
import pandas as pd

txns = veri.oku("anadolu_bank", "bank_txns")


def harcama_paylari(txns):
    kart = txns[txns["txn_type"] == "kart_harcama"]
    # TODO 1: mutlak tutarları kategoriye göre topla
    # TODO 2: genel toplama bölüp yüzdeye çevir
    # TODO 3: 1 ondalık, azalan sırala
    return None
''',
    sol='''
import veri
import pandas as pd

txns = veri.oku("anadolu_bank", "bank_txns")


def harcama_paylari(txns):
    kart = txns[txns["txn_type"] == "kart_harcama"]
    toplam = kart["amount"].abs().groupby(kart["merchant_category"]).sum()
    return (toplam / toplam.sum() * 100).round(1).sort_values(ascending=False)


print(harcama_paylari(txns))
''',
    calc={'R': 'harcama_paylari(txns).to_dict()', 'ILK': 'harcama_paylari(txns).index[0]'},
    tests='''
r = harcama_paylari(txns)
assert isinstance(r, pd.Series), "Series döndürmeli"
assert len(r) == 9, "9 harcama kategorisi olmalı"
assert r.index[0] == @ILK@, "En büyük pay en üstte olmalı"
assert abs(r.sum() - 100) < 0.5, "Paylar toplamı yaklaşık 100 olmalı"
for k, v in @R@.items():
    assert abs(r[k] - v) < 0.051, f"{k} payı {v} olmalı; mutlak değer aldın mı?"
''',
    hints=['Harcamalar eksi; toplamadan önce <code>.abs()</code>.', 'Pay = grup toplamı / genel toplam.',
           '<code>toplam = kart["amount"].abs().groupby(kart["merchant_category"]).sum()</code>'],
    why='Bankacılık verisinde çıkışlar eksi işaretlidir; mutlak değer almadan pay hesabı negatif/negatif bölmeyle doğru gibi görünse de karışık işaretli verilerde bozulur. '
        'Pay hesabında payda tüm kategorilerin toplamıdır (Power BI\'da DIVIDE(SUM, CALCULATE(SUM, ALL(kategori)))). Alternatif: <code>value_counts(normalize=True)</code> adet payı verir, '
        'tutar payı değil; soruyu doğru okumak önemli.',
    tags=['groupby', 'abs', 'pay'], min=7)

add(id='b-438', lv='orta', diff=2, kind='yaz', needs=['sqlite3'], title='Kanal başına işlem özeti (SQL)',
    q='<p><b>Dijital bankacılık müdürü soruyor:</b> "İşlemlerin ne kadarı mobilden, ne kadarı şubeden geliyor ve ortalama işlem tutarları nasıl?"</p>'
      '<p><code>con = veri.baglan("anadolu_bank", tablolar=["bank_txns"])</code> ile yalnız işlem tablosunu yükle. <code>kanal_ozeti(con)</code> fonksiyonu '
      '<code>(channel, islem_sayisi, ortalama_mutlak_tutar)</code> demetlerini döndürsün; ortalama SQL içinde <code>ROUND(..., 2)</code>; işlem sayısına göre azalan.</p>',
    start='''
import veri

con = veri.baglan("anadolu_bank", tablolar=["bank_txns"])


def kanal_ozeti(con):
    pass
''',
    sol='''
import veri

con = veri.baglan("anadolu_bank", tablolar=["bank_txns"])


def kanal_ozeti(con):
    sql = """
        SELECT channel, COUNT(*) AS n, ROUND(AVG(ABS(amount)), 2) AS ort
        FROM bank_txns
        GROUP BY channel
        ORDER BY n DESC
    """
    return con.execute(sql).fetchall()


for satir in kanal_ozeti(con):
    print(satir)
''',
    calc={'R': 'kanal_ozeti(con)'},
    tests='''
r = kanal_ozeti(con)
assert len(r) == 6, "6 kanal olmalı"
assert r == @R@, "Kanal özeti tutmuyor: AVG(ABS(amount)) ve sayıya göre azalan sıra"
assert sum(x[1] for x in r) == 42284, "Toplam işlem sayısı 42284"
''',
    hints=['<code>GROUP BY channel</code> ile <code>COUNT(*)</code>.', 'Ortalama mutlak tutar: <code>AVG(ABS(amount))</code>.',
           '<code>ORDER BY n DESC</code>'],
    why='<code>veri.baglan(..., tablolar=[...])</code> yalnız gerekli tabloyu yükler; büyük veri setlerinde açılışı hızlandırır. '
        'AVG(amount) giriş ve çıkışları birbirine mahsup eder ve anlamsız (sıfıra yakın) bir sayı verir; işlem büyüklüğü için ABS gerekir. '
        'Not: kanal ile işlem türü iç içedir (ör. atm kanalı yalnız atm işlemi); yorum yaparken bunu hesaba kat.',
    tags=['sqlite3', 'GROUP BY', 'ABS'], min=5)

add(id='b-439', lv='orta', diff=2, kind='rehberli', needs=['sqlite3'], title='Her ay maaş alan hesap sayısı',
    q='<p><b>Maaş müşterisi ekibi soruyor:</b> "Maaşını bankamıza yatıran hesap sayısı ay ay artıyor mu?"</p>'
      '<p><code>maas_hesaplari(con)</code> fonksiyonunu yaz (<code>veri.baglan("anadolu_bank", tablolar=["bank_txns"])</code>). '
      '<code>txn_type = \'maas\'</code> olan işlemlerde her ay için <b>benzersiz</b> hesap sayısını bul. Dönüş: <code>("YYYY-MM", hesap_sayisi)</code> listesi, aya göre artan.</p>',
    guide=['Önce maaş işlemlerini süz (<code>WHERE</code>).', 'Ay için <code>substr(txn_time, 1, 7)</code> ya da <code>strftime(\'%Y-%m\', txn_time)</code>.',
           'Aynı hesaba ayda iki maaş yatabilir; <code>COUNT(DISTINCT account_id)</code> kullan.', 'Aya göre grupla ve sırala.'],
    example='''
import sqlite3
# Benzer teknik: COUNT(DISTINCT ...) ile tekil sayım
con = sqlite3.connect(":memory:")
con.execute("CREATE TABLE giris(kart, gun)")
con.executemany("INSERT INTO giris VALUES (?, ?)", [(1, "Pzt"), (1, "Pzt"), (2, "Pzt"), (1, "Sal")])
print(con.execute("SELECT gun, COUNT(*), COUNT(DISTINCT kart) FROM giris GROUP BY gun").fetchall())
''',
    start='''
import veri

con = veri.baglan("anadolu_bank", tablolar=["bank_txns"])


def maas_hesaplari(con):
    sql = """
        SELECT substr(txn_time, 1, 7) AS ay, COUNT(*) AS n
        FROM bank_txns
        -- TODO 1: yalnız maaş işlemleri
        -- TODO 2: aya göre grupla, sırala
    """
    # TODO 3: COUNT(*) yerine benzersiz hesap say
    return con.execute(sql).fetchall()
''',
    sol='''
import veri

con = veri.baglan("anadolu_bank", tablolar=["bank_txns"])


def maas_hesaplari(con):
    sql = """
        SELECT substr(txn_time, 1, 7) AS ay, COUNT(DISTINCT account_id) AS n
        FROM bank_txns
        WHERE txn_type = 'maas'
        GROUP BY ay
        ORDER BY ay
    """
    return con.execute(sql).fetchall()


for ay, n in maas_hesaplari(con):
    print(ay, n)
''',
    calc={'R': 'maas_hesaplari(con)', 'TOPLAM': 'con.execute("SELECT COUNT(*) FROM bank_txns WHERE txn_type = \'maas\'").fetchone()[0]'},
    tests='''
r = maas_hesaplari(con)
assert len(r) == 12, "2024\\'ün 12 ayı olmalı"
assert r == @R@, "Aylık benzersiz hesap sayıları tutmuyor (COUNT(DISTINCT account_id))"
assert sum(n for _, n in r) <= @TOPLAM@, "Benzersiz sayım, işlem sayısını aşamaz"
''',
    hints=['Satır değil hesap saymalısın.', '<code>COUNT(DISTINCT account_id)</code>', 'Süzme: <code>WHERE txn_type = \'maas\'</code>, sonra <code>GROUP BY ay ORDER BY ay</code>.'],
    why='COUNT(*) satır sayar; aynı hesaba ayda iki maaş (ör. ikramiye) yatarsa iki kez sayılır. COUNT(DISTINCT ...) tekil değerleri sayar. '
        'ISO tarih metninde <code>substr(txn_time, 1, 7)</code> ay bilgisini verir ve strftime\'dan biraz hızlıdır. pandas karşılığı: '
        '<code>df[df.txn_type == "maas"].groupby(df.txn_time.str[:7])["account_id"].nunique()</code>.',
    tags=['COUNT DISTINCT', 'substr', 'GROUP BY'], min=6)

add(id='b-440', lv='orta', diff=2, kind='bug', needs=['pandas'], title='Net akış yerine işlem hacmi',
    q='<p><b>Hazine ekibi soruyor:</b> "2024\'te hesabına en çok net para girişi olan 3 hesap hangisi?" Analistin kodu hep aynı yoğun hesapları getiriyor, '
      'oysa bazıları aslında para çıkışı yapmış. <b>Hatayı bul ve düzelt.</b></p>'
      '<p><code>en_cok_net_giris(txns, n=3)</code>: hesap başına <code>amount</code> toplamı (giriş +, çıkış −), en büyük <code>n</code> değer; '
      '<code>account_id</code> indeksli, 2 ondalıklı Series.</p>',
    start='''
import veri
import pandas as pd

txns = veri.oku("anadolu_bank", "bank_txns")


def en_cok_net_giris(txns, n=3):
    net = txns["amount"].abs().groupby(txns["account_id"]).sum()
    return net.nlargest(n).round(2)
''',
    sol='''
import veri
import pandas as pd

txns = veri.oku("anadolu_bank", "bank_txns")


def en_cok_net_giris(txns, n=3):
    net = txns.groupby("account_id")["amount"].sum()
    return net.nlargest(n).round(2)


print(en_cok_net_giris(txns))
''',
    calc={'R': 'en_cok_net_giris(txns).to_dict()', 'IDX': 'en_cok_net_giris(txns, 5).index.tolist()'},
    tests='''
r = en_cok_net_giris(txns)
assert r.to_dict() == @R@, "Net akış = işaretli tutarların toplamı; abs() hacmi verir, neti değil"
assert en_cok_net_giris(txns, 5).index.tolist() == @IDX@, "İlk 5 hesap tutmuyor"
k = pd.DataFrame({"account_id": [1, 1, 2], "amount": [100.0, -90.0, 50.0]})
assert en_cok_net_giris(k, 1).to_dict() == {2: 50.0}, "Hesap 1\\'in neti 10, hesap 2\\'nin 50: lider hesap 2"
''',
    hints=['<code>abs()</code> neyi ölçer: hacmi mi, neti mi?', 'Çıkışların eksi işaretini korumalısın.', '<code>txns.groupby("account_id")["amount"].sum()</code>'],
    why='Mutlak değer toplamı işlem <b>hacmini</b> (ciro) ölçer; net akış için işaretin korunması gerekir. 100 TL giriş + 90 TL çıkış: hacim 190, net 10. '
        'İş sorusundaki kelime ("net") formülü belirler; kodu yazmadan önce ölçünün tanımını netleştirmek, en pahalı analiz hatalarını önler.',
    tags=['groupby', 'net akış', 'abs'], min=4)

add(id='b-441', lv='orta', diff=2, kind='yaz', needs=['pandas'], title='Yaş grubuna göre ortalama risk puanı',
    q='<p><b>Kredi politikası ekibi soruyor:</b> "Risk puanı yaşa göre değişiyor mu?"</p>'
      '<p><code>yas_risk(musteriler)</code> fonksiyonunu yaz (<code>bank_customers</code> DataFrame). Yaş = <code>2024 − doğum yılı</code> (basit tanım). '
      '<code>pd.cut</code> ile gruplar: <code>[18, 30)</code> → <code>"18-29"</code>, <code>[30, 45)</code> → <code>"30-44"</code>, <code>[45, 60)</code> → <code>"45-59"</code>, '
      '<code>[60, 120)</code> → <code>"60+"</code> (<code>right=False</code>). Her grubun ortalama <code>risk_score</code> değerini 2 ondalıkla, grup sırasıyla bir Series olarak döndür.</p>',
    start='''
import veri
import pandas as pd

musteriler = veri.oku("anadolu_bank", "bank_customers")


def yas_risk(musteriler):
    pass
''',
    sol='''
import veri
import pandas as pd

musteriler = veri.oku("anadolu_bank", "bank_customers")


def yas_risk(musteriler):
    yas = 2024 - pd.to_datetime(musteriler["birth_date"]).dt.year
    grup = pd.cut(yas, bins=[18, 30, 45, 60, 120], right=False, labels=["18-29", "30-44", "45-59", "60+"])
    return musteriler["risk_score"].groupby(grup, observed=False).mean().round(2)


print(yas_risk(musteriler))
''',
    calc={'R': '{str(k): float(v) for k, v in yas_risk(musteriler).items()}'},
    tests='''
r = yas_risk(musteriler)
assert [str(x) for x in r.index] == ["18-29", "30-44", "45-59", "60+"], "Gruplar etiketleriyle ve bu sırayla gelmeli"
for k, v in @R@.items():
    assert abs(r[k] - v) < 0.006, f"{k} grubunun ortalaması {v} olmalı; right=False ile [alt, üst) aralığı kullan"
''',
    hints=['Doğum yılı: <code>pd.to_datetime(df["birth_date"]).dt.year</code>.', '<code>pd.cut(yas, bins=[18, 30, 45, 60, 120], right=False, labels=[...])</code>',
           'Kategorik gruplamada <code>groupby(grup, observed=False).mean()</code>'],
    why='<code>pd.cut</code> sürekli bir değişkeni aralıklara böler (Power BI\'daki "gruplar/bins", SQL\'de CASE WHEN). <code>right=False</code> aralıkları [alt, üst) yapar; '
        '30 yaşındaki biri "30-44"e girer. Varsayılan right=True olsaydı 30, "18-29"a düşerdi; sınır değerler en sık hata kaynağıdır. '
        'Kategorik anahtarla gruplarken <code>observed=False</code> boş grupları da gösterir; pandas sürümleri arasında varsayılan değiştiği için açıkça yazmak iyidir.',
    tags=['pd.cut', 'yaş grubu', 'groupby'], min=7)

add(id='b-442', lv='orta', diff=2, kind='tamamla', needs=['pandas'], title='Kapanan hesapların ömrü',
    q='<p><b>Müşteri deneyimi ekibi soruyor:</b> "Kapanan hesaplar ortalama kaç gün açık kalmış? Erken kapanışları anlamak istiyoruz."</p>'
      '<p><code>hesap_omru(hesaplar)</code> fonksiyonundaki <code>___</code> boşluklarını doldur: kapalı hesaplarda <code>closed_date − opened_date</code> farkını gün olarak bul; '
      '<code>(ortalama, medyan)</code> demetini 1 ondalıkla döndür.</p>',
    start='''
import veri
import pandas as pd

hesaplar = veri.oku("anadolu_bank", "bank_accounts")


def hesap_omru(hesaplar):
    kapali = hesaplar[hesaplar["status"] == "kapali"]
    acilis = pd.___(kapali["opened_date"])
    kapanis = pd.___(kapali["closed_date"])
    gun = (kapanis - acilis).dt.___
    return round(gun.mean(), 1), round(gun.___(), 1)
''',
    sol='''
import veri
import pandas as pd

hesaplar = veri.oku("anadolu_bank", "bank_accounts")


def hesap_omru(hesaplar):
    kapali = hesaplar[hesaplar["status"] == "kapali"]
    acilis = pd.to_datetime(kapali["opened_date"])
    kapanis = pd.to_datetime(kapali["closed_date"])
    gun = (kapanis - acilis).dt.days
    return round(gun.mean(), 1), round(gun.median(), 1)


print(hesap_omru(hesaplar))
''',
    calc={'R': 'tuple(float(x) for x in hesap_omru(hesaplar))'},
    tests='''
ort, med = hesap_omru(hesaplar)
assert (float(ort), float(med)) == @R@, "Ortalama ya da medyan gün tutmuyor"
k = pd.DataFrame({"status": ["kapali", "kapali", "aktif"], "opened_date": ["2024-01-01", "2024-01-01", "2020-01-01"],
                  "closed_date": ["2024-01-11", "2024-01-31", None]})
assert hesap_omru(k) == (20.0, 20.0), "10 ve 30 gün → ortalama 20, medyan 20; aktif hesap hesaba katılmamalı"
''',
    hints=['Metni tarihe çeviren pandas fonksiyonu.', 'İki tarihin farkı Timedelta\'dır; gün sayısı için <code>.dt.days</code>.',
           '<code>pd.to_datetime</code>, <code>.dt.days</code>, <code>.median()</code>'],
    why='Tarih farkı Timedelta döndürür; <code>.dt.days</code> tam gün sayısını verir. Medyanı ortalamanın yanında vermek, birkaç çok uzun ömürlü hesabın ortalamayı nasıl '
        'çektiğini gösterir; çarpık dağılımlarda medyan daha temsilîdir. Aynı hesap SQL\'de <code>julianday(closed_date) - julianday(opened_date)</code> olur.',
    tags=['to_datetime', 'Timedelta', 'medyan'], min=4)

add(id='b-443', lv='orta', diff=2, kind='yaz', needs=['sqlite3'], title='Şube başına kart limiti (üç tablo JOIN)',
    q='<p><b>Bölge müdürlüğü soruyor:</b> "Her şubenin müşterilerine toplam ne kadar kart limiti tanımlamışız?"</p>'
      '<p><code>sube_limitleri(con)</code> fonksiyonunu yaz (<code>veri.baglan("anadolu_bank", tablolar=["bank_accounts", "bank_customers", "bank_branches"])</code>). '
      'Yalnız <b>aktif kredi kartı</b> hesapları. Dönüş: <code>(sube_adi, kart_sayisi, toplam_limit)</code> demetleri; toplam limite göre azalan, eşitlikte şube adına göre.</p>',
    start='''
import veri

con = veri.baglan("anadolu_bank", tablolar=["bank_accounts", "bank_customers", "bank_branches"])


def sube_limitleri(con):
    pass
''',
    sol='''
import veri

con = veri.baglan("anadolu_bank", tablolar=["bank_accounts", "bank_customers", "bank_branches"])


def sube_limitleri(con):
    sql = """
        SELECT b.name, COUNT(*) AS kart, SUM(a.credit_limit) AS limit_toplam
        FROM bank_accounts AS a
        JOIN bank_customers AS c ON c.customer_id = a.customer_id
        JOIN bank_branches AS b ON b.branch_id = c.branch_id
        WHERE a.account_type = 'kredi_karti' AND a.status = 'aktif'
        GROUP BY b.name
        ORDER BY limit_toplam DESC, b.name
    """
    return con.execute(sql).fetchall()


for satir in sube_limitleri(con):
    print(satir)
''',
    calc={'R': 'sube_limitleri(con)'},
    tests='''
r = sube_limitleri(con)
assert r == @R@, "Şube limitleri tutmuyor: üç tabloyu bağlayıp aktif kredi kartlarını süzdün mü?"
assert sum(x[1] for x in r) == @N@, "Aktif kredi kartı sayısı tutmuyor"
''',
    calc_extra=None,
    hints=['Hesap → müşteri → şube zinciri: iki JOIN.', '<code>WHERE a.account_type = \'kredi_karti\' AND a.status = \'aktif\'</code>',
           '<code>GROUP BY b.name ORDER BY limit_toplam DESC, b.name</code>'],
    why='Hesap tablosunda şube bilgisi yok; müşteri tablosu "köprü" görevi görür. JOIN zincirlerinde her adımda satır sayısının beklenmedik biçimde artmadığını '
        '(çoğa-çok patlaması) kontrol et. İkinci sıralama anahtarı (şube adı), eşit toplamlarda sonucun her çalıştırmada aynı çıkmasını garanti eder.',
    tags=['JOIN', 'çoklu tablo', 'SUM'], min=7)

# ---------------------------------------------------------------- İLERİ
add(id='b-444', lv='ileri', diff=3, kind='rehberli', needs=['pandas'], title='TL hesaplarında aylık nakit akışı',
    q='<p><b>Hazine ekibi soruyor:</b> "TL hesaplarda her ay ne kadar para girdi, ne kadar çıktı, net ve yıl içi kümülatif durum ne?"</p>'
      '<p><code>nakit_akisi(txns, hesaplar)</code> fonksiyonunu yaz. Yalnız <code>currency == "TRY"</code> hesapların işlemleri. Dönüş: index <code>"YYYY-MM"</code>, sütunlar '
      '<code>giris</code> (pozitiflerin toplamı), <code>cikis</code> (negatiflerin mutlak toplamı), <code>net</code> (giris − cikis), <code>kumulatif</code> (net\'in yıl içi birikimli toplamı); '
      'hepsi 2 ondalık.</p>',
    guide=['TRY hesap numaralarını bul ve işlemleri <code>isin</code> ile süz.', '<code>ay</code> sütunu: <code>txn_time.str[:7]</code>.',
           '<code>giris</code> için <code>amount.clip(lower=0)</code>, <code>cikis</code> için <code>(-amount).clip(lower=0)</code> sütunları ekle.',
           'Aya göre topla; <code>net</code> ve <code>cumsum()</code> ile <code>kumulatif</code> ekle; yuvarla.'],
    example='''
import pandas as pd
# Benzer teknik: işaretli değerleri iki sütuna ayırmak (clip) ve birikimli toplam (cumsum)
df = pd.DataFrame({"gun": [1, 1, 2, 3], "tutar": [100, -40, -30, 50]})
df["giren"] = df["tutar"].clip(lower=0)
df["cikan"] = (-df["tutar"]).clip(lower=0)
g = df.groupby("gun")[["giren", "cikan"]].sum()
g["net"] = g["giren"] - g["cikan"]
g["birikimli"] = g["net"].cumsum()
print(g)
''',
    start='''
import veri
import pandas as pd

txns = veri.oku("anadolu_bank", "bank_txns")
hesaplar = veri.oku("anadolu_bank", "bank_accounts")


def nakit_akisi(txns, hesaplar):
    try_hesap = hesaplar.loc[hesaplar["currency"] == "TRY", "account_id"]
    df = txns[txns["account_id"].isin(try_hesap)].copy()
    df["ay"] = df["txn_time"].str[:7]
    # TODO 1: giris ve cikis sütunları (clip)
    # TODO 2: aya göre topla
    # TODO 3: net ve kumulatif sütunları, 2 ondalık
    return None
''',
    sol='''
import veri
import pandas as pd

txns = veri.oku("anadolu_bank", "bank_txns")
hesaplar = veri.oku("anadolu_bank", "bank_accounts")


def nakit_akisi(txns, hesaplar):
    try_hesap = hesaplar.loc[hesaplar["currency"] == "TRY", "account_id"]
    df = txns[txns["account_id"].isin(try_hesap)].copy()
    df["ay"] = df["txn_time"].str[:7]
    df["giris"] = df["amount"].clip(lower=0)
    df["cikis"] = (-df["amount"]).clip(lower=0)
    g = df.groupby("ay")[["giris", "cikis"]].sum()
    g["net"] = g["giris"] - g["cikis"]
    g["kumulatif"] = g["net"].cumsum()
    return g.round(2)


print(nakit_akisi(txns, hesaplar))
''',
    calc={'OCA': 'nakit_akisi(txns, hesaplar).loc["2024-01"].to_dict()',
          'KUM': 'float(nakit_akisi(txns, hesaplar)["kumulatif"].iloc[-1])',
          'NEGAY': '[a for a, v in nakit_akisi(txns, hesaplar)["net"].items() if v < 0]'},
    tests='''
r = nakit_akisi(txns, hesaplar)
assert r is not None and list(r.columns) == ["giris", "cikis", "net", "kumulatif"], "Sütunlar: giris, cikis, net, kumulatif"
assert len(r) == 12, "12 ay olmalı"
oca = r.loc["2024-01"].to_dict()
for k, v in @OCA@.items():
    assert abs(oca[k] - v) < 0.01, f"Ocak {k} değeri {v} olmalı"
assert abs(r["kumulatif"].iloc[-1] - @KUM@) < 0.05, "Aralık kümülatif değeri, 12 ayın net toplamı olmalı"
assert abs(r["kumulatif"].iloc[-1] - r["net"].sum()) < 0.05, "kumulatif = net.cumsum()"
assert [a for a, v in r["net"].items() if v < 0] == @NEGAY@, "Net akışı eksi olan aylar tutmuyor"
assert (r["cikis"] >= 0).all(), "cikis pozitif (mutlak) olmalı"
''',
    hints=['Giriş ve çıkışı ayırmak için <code>clip(lower=0)</code>: negatifleri 0 yapar.', 'Çıkış için önce işareti çevir: <code>(-df["amount"]).clip(lower=0)</code>.',
           '<code>g["kumulatif"] = g["net"].cumsum()</code>'],
    why='<code>clip</code> koşullu sütunu döngüsüz ve vektörel üretir (alternatif: <code>np.where(amount &gt; 0, amount, 0)</code>). '
        '<code>cumsum</code>, Power BI\'daki "yıl başından bugüne" (TOTALYTD) birikimin pandas karşılığıdır. Döviz hesaplarını süzmek şarttır: '
        'farklı para birimlerini kur çevrimi yapmadan toplamak, nakit akış raporunun en tehlikeli hatasıdır.',
    tags=['clip', 'cumsum', 'nakit akışı'], min=10)

add(id='b-445', lv='ileri', diff=3, kind='yaz', needs=['pandas'], title='Döviz faizinin TL karşılığı (merge_asof)',
    q='<p><b>Muhasebe ekibi soruyor:</b> "2024\'te USD ve EUR vadeli hesaplara ödediğimiz faizin TL karşılığı ne kadar?"</p>'
      '<p><code>faiz_tl(txns, hesaplar, kur)</code> fonksiyonunu yaz. <code>kur</code> = <code>veri.oku("anadolu_bank", "bank_fx")</code>; yalnız <b>iş günleri</b> için kur var. '
      'Her <code>faiz</code> işlemini, işlem tarihindeki ya da <b>ondan önceki son</b> iş gününün kuruyla çevir (hafta sonu işlemi cuma kuru alır). '
      'Dönüş: <code>{"EUR": tl_toplam, "USD": tl_toplam}</code>, 2 ondalık. İpucu: <code>pd.merge_asof(..., by="currency", direction="backward")</code>.</p>',
    start='''
import veri
import pandas as pd

txns = veri.oku("anadolu_bank", "bank_txns")
hesaplar = veri.oku("anadolu_bank", "bank_accounts")
kur = veri.oku("anadolu_bank", "bank_fx")


def faiz_tl(txns, hesaplar, kur):
    pass
''',
    sol='''
import veri
import pandas as pd

txns = veri.oku("anadolu_bank", "bank_txns")
hesaplar = veri.oku("anadolu_bank", "bank_accounts")
kur = veri.oku("anadolu_bank", "bank_fx")


def faiz_tl(txns, hesaplar, kur):
    df = txns[txns["txn_type"] == "faiz"].merge(hesaplar[["account_id", "currency"]], on="account_id")
    df = df[df["currency"] != "TRY"].copy()
    df["tarih"] = pd.to_datetime(df["txn_time"].str[:10])
    k = kur.assign(tarih=pd.to_datetime(kur["rate_date"]))
    df = pd.merge_asof(df.sort_values("tarih"), k.sort_values("tarih")[["tarih", "currency", "try_rate"]],
                       on="tarih", by="currency", direction="backward")
    df["tl"] = df["amount"] * df["try_rate"]
    return {c: round(float(v), 2) for c, v in df.groupby("currency")["tl"].sum().items()}


print(faiz_tl(txns, hesaplar, kur))
''',
    calc={'R': 'faiz_tl(txns, hesaplar, kur)'},
    tests='''
r = faiz_tl(txns, hesaplar, kur)
assert set(r) == {"EUR", "USD"}, "Yalnız EUR ve USD anahtarları olmalı (TRY faizleri çevrilmez)"
for c, v in @R@.items():
    assert abs(r[c] - v) < 0.05, f"{c} faizinin TL toplamı {v} olmalı; hafta sonu işlemleri önceki iş gününün kurunu almalı"
fx = pd.DataFrame({"rate_date": ["2024-03-01", "2024-03-04"], "currency": ["USD", "USD"], "try_rate": [32.0, 33.0]})
tx = pd.DataFrame({"account_id": [1, 1], "txn_time": ["2024-03-02 10:00:00", "2024-03-04 09:00:00"], "amount": [10.0, 10.0], "txn_type": ["faiz", "faiz"]})
hs = pd.DataFrame({"account_id": [1], "currency": ["USD"]})
assert faiz_tl(tx, hs, fx) == {"USD": 650.0}, "Cumartesi işlemi cuma kuru (32), pazartesi işlemi pazartesi kuru (33): 320 + 330"
''',
    hints=['Önce faiz işlemlerine hesabın para birimini ekle (merge), TRY olanları at.',
           '<code>merge_asof</code> iki tarafın da <code>on</code> sütununa göre sıralı olmasını ister; tarihleri <code>pd.to_datetime</code> ile çevir.',
           '<code>pd.merge_asof(df.sort_values("tarih"), kur_df.sort_values("tarih"), on="tarih", by="currency", direction="backward")</code>'],
    why='Kurlar yalnız iş günlerinde yayımlanır; normal <code>merge</code> hafta sonu işlemlerini eşleştiremez (NaN). <code>merge_asof</code> "en yakın önceki" eşleştirmeyi yapar; '
        '<code>by="currency"</code> USD işlemine EUR kuru gelmesini önler. Bu, zaman serilerinde fiyat/kur eşlemenin standart yoludur. '
        'SQL\'de aynı iş, ilişkili alt sorguyla (<code>... WHERE rate_date &lt;= t.tarih ORDER BY rate_date DESC LIMIT 1</code>) yapılır ve büyük veride çok daha yavaştır.',
    tags=['merge_asof', 'kur çevrimi', 'zaman serisi'], min=12)

add(id='b-446', lv='ileri', diff=3, kind='yaz', needs=['sqlite3'], title='Peş peşe hızlı işlemler (LAG)',
    q='<p><b>Dolandırıcılık önleme ekibi soruyor:</b> "Aynı hesapta bir önceki işlemden çok kısa süre sonra yapılan işlemler kaç tane? Kural motoruna eşik koyacağız."</p>'
      '<p><code>hizli_islemler(con, saniye)</code> fonksiyonunu yaz (<code>veri.baglan("anadolu_bank", tablolar=["bank_txns"])</code>). '
      'Her işlem için aynı hesaptaki <b>bir önceki</b> işlemle arasındaki süreyi saniye cinsinden bul (<code>LAG</code> pencere fonksiyonu; saniye için '
      '<code>CAST(strftime(\'%s\', txn_time) AS INTEGER)</code>). Süresi <code>saniye</code> değerinden <b>kısa</b> olan işlemlerin '
      '<code>(islem_sayisi, farkli_hesap_sayisi)</code> demetini döndür.</p>',
    start='''
import veri

con = veri.baglan("anadolu_bank", tablolar=["bank_txns"])


def hizli_islemler(con, saniye):
    pass
''',
    sol='''
import veri

con = veri.baglan("anadolu_bank", tablolar=["bank_txns"])


def hizli_islemler(con, saniye):
    sql = """
        WITH t AS (
            SELECT account_id, CAST(strftime('%s', txn_time) AS INTEGER) AS sn
            FROM bank_txns
        ), f AS (
            SELECT account_id, sn - LAG(sn) OVER (PARTITION BY account_id ORDER BY sn) AS ara
            FROM t
        )
        SELECT COUNT(*), COUNT(DISTINCT account_id) FROM f WHERE ara < ?
    """
    return con.execute(sql, (saniye,)).fetchone()


for esik in (60, 600, 3600):
    print(esik, "sn:", hizli_islemler(con, esik))
''',
    calc={'R60': 'hizli_islemler(con, 60)', 'R600': 'hizli_islemler(con, 600)', 'R3600': 'hizli_islemler(con, 3600)'},
    tests='''
assert hizli_islemler(con, 60) == @R60@, "60 saniye eşiğinde sonuç tutmuyor"
assert hizli_islemler(con, 600) == @R600@, "10 dakika eşiğinde sonuç tutmuyor: PARTITION BY account_id ve zamana göre sıralama var mı?"
assert hizli_islemler(con, 3600) == @R3600@, "1 saat eşiğinde sonuç tutmuyor"
assert hizli_islemler(con, 0) == (0, 0), "Eşik 0 iken hiç işlem dönmemeli (kesin küçük)"
assert "LAG" in __source__.upper(), "LAG pencere fonksiyonunu kullan"
''',
    hints=['Bir önceki satırın değeri için <code>LAG(sn) OVER (PARTITION BY account_id ORDER BY sn)</code>.',
           'Her hesabın ilk işleminde LAG NULL döner; <code>NULL &lt; ?</code> doğru olmadığı için kendiliğinden elenir.',
           'Pencere sonucunu süzmek için CTE kullan; dışta <code>COUNT(*), COUNT(DISTINCT account_id)</code>.'],
    why='LAG, satırı bir önceki satırla karşılaştırmayı kendi kendine birleştirme (self-join) yapmadan sağlar; O(n log n) sıralama maliyetiyle çalışır. '
        'PARTITION BY unutulursa farklı hesapların işlemleri birbirine karışır ve sahte "hızlı işlem"ler çıkar. '
        'Eşik seçimi bir iş kararıdır: eşiği farklı değerlerde deneyip yakalanan işlem sayısını görmek (duyarlılık analizi), kural motoru tasarımının ilk adımıdır. '
        'pandas karşılığı: <code>df.sort_values("txn_time").groupby("account_id")["zaman"].diff()</code>.',
    tags=['LAG', 'pencere fonksiyonu', 'dolandırıcılık'], min=10)

add(id='b-447', lv='ileri', diff=3, kind='bug', needs=['pandas'], title='Pasif hesap listesi hatalı',
    q='<p><b>Müşteri kazanımı ekibi soruyor:</b> "Aktif görünen ama son 90 gündür hiç işlem görmeyen hesaplar hangileri? Onları geri kazanma kampanyasına alacağız."</p>'
      '<p><code>pasif_hesaplar(txns, hesaplar, ref="2024-12-31", gun=90)</code> aktif hesaplardan, son işlem tarihi <code>ref − gun</code> tarihinden önce olanları ve '
      '<b>hiç işlemi olmayanları</b> sıralı <code>account_id</code> listesi olarak döndürmeli. Kod neredeyse tüm hesapları pasif sayıyor. <b>Hataları bul ve düzelt</b> (iki tane).</p>',
    start='''
import veri
import pandas as pd

txns = veri.oku("anadolu_bank", "bank_txns")
hesaplar = veri.oku("anadolu_bank", "bank_accounts")


def pasif_hesaplar(txns, hesaplar, ref="2024-12-31", gun=90):
    sinir = pd.Timestamp(ref) - pd.Timedelta(days=gun)
    son = pd.to_datetime(txns["txn_time"]).groupby(txns["account_id"]).min()
    aktif = hesaplar[hesaplar["status"] == "aktif"]
    df = aktif.merge(son.rename("son").reset_index(), on="account_id")
    pasif = df[df["son"] < sinir]
    return sorted(pasif["account_id"].tolist())
''',
    sol='''
import veri
import pandas as pd

txns = veri.oku("anadolu_bank", "bank_txns")
hesaplar = veri.oku("anadolu_bank", "bank_accounts")


def pasif_hesaplar(txns, hesaplar, ref="2024-12-31", gun=90):
    sinir = pd.Timestamp(ref) - pd.Timedelta(days=gun)
    son = pd.to_datetime(txns["txn_time"]).groupby(txns["account_id"]).max()
    aktif = hesaplar[hesaplar["status"] == "aktif"]
    df = aktif.merge(son.rename("son").reset_index(), on="account_id", how="left")
    pasif = df[df["son"].isna() | (df["son"] < sinir)]
    return sorted(pasif["account_id"].tolist())


r = pasif_hesaplar(txns, hesaplar)
print(len(r), r[:10])
''',
    calc={'N': 'len(pasif_hesaplar(txns, hesaplar))', 'ILK': 'pasif_hesaplar(txns, hesaplar)[:5]',
          'ISLEMSIZ': 'sorted(set(hesaplar.loc[hesaplar.status == "aktif", "account_id"]) - set(txns["account_id"]))[:3]'},
    tests='''
r = pasif_hesaplar(txns, hesaplar)
assert len(r) == @N@, "Pasif hesap sayısı tutmuyor: SON işlem (max) tarihine bakmalısın"
assert r[:5] == @ILK@, "İlk 5 pasif hesap tutmuyor"
for h in @ISLEMSIZ@:
    assert h in r, f"Hiç işlemi olmayan aktif hesap {h} listede olmalı: merge(how=\\"left\\") ve isna()"
tx = pd.DataFrame({"account_id": [1, 1, 2], "txn_time": ["2024-01-05 10:00:00", "2024-12-20 10:00:00", "2024-03-01 09:00:00"]})
hs = pd.DataFrame({"account_id": [1, 2, 3, 4], "status": ["aktif", "aktif", "aktif", "kapali"]})
assert pasif_hesaplar(tx, hs) == [2, 3], "1: son işlemi 20 Aralık (aktif kullanıyor); 2: son işlemi Mart (pasif); 3: hiç işlemi yok (pasif); 4: kapalı (listeye girmez)"
assert pasif_hesaplar(tx, hs, ref="2024-03-15", gun=30) == [3], "Referans tarihi ve gün parametresi kullanılmalı"
''',
    hints=['"Son işlem" için grup içinde hangi toplama fonksiyonu gerekir?', 'Varsayılan merge iç birleştirmedir; işlemi olmayan hesaplar düşer.',
           '<code>.max()</code>, <code>how="left"</code> ve <code>df["son"].isna() | (df["son"] &lt; sinir)</code>'],
    why='İki klasik hata: (1) son işlem için <code>min</code> almak (ilk işlemi verir, yılbaşına yakın olduğu için neredeyse herkes "pasif" görünür), '
        '(2) iç birleştirme ile hiç işlemi olmayan hesapları kaybetmek; tam da aradığın en pasif müşteriler bunlardır. '
        'Sol birleştirme + <code>isna()</code> bu "hiç yok" durumunu yakalar. RFM analizindeki Recency (yakınlık) ölçüsü de aynı max mantığıyla hesaplanır.',
    tags=['groupby max', 'left merge', 'churn'], min=8)

add(id='b-448', lv='ileri', diff=3, kind='rehberli', needs=['pandas'], title='İşlem türü × kanal çapraz tablosu',
    q='<p><b>Dijital dönüşüm ofisi soruyor:</b> "Her işlem türü hangi kanallardan yapılıyor? Örneğin faturaların yüzde kaçı mobilden ödeniyor?"</p>'
      '<p><code>tur_kanal_payi(txns)</code> fonksiyonunu yaz: satırlar <code>txn_type</code>, sütunlar <code>channel</code>; her hücre o işlem türündeki işlemlerin '
      'yüzde kaçının o kanaldan yapıldığını göstersin (satır toplamı 100). 1 ondalık. <code>pd.crosstab(..., normalize="index")</code> kullan.</p>',
    guide=['<code>pd.crosstab(index, columns)</code> iki sütunun sıklık tablosunu çıkarır.', '<code>normalize="index"</code> her satırı kendi toplamına böler (0–1 arası).',
           '100 ile çarp ve <code>round(1)</code>.', 'Satır toplamlarının 100 olduğunu kendin kontrol et.'],
    example='''
import pandas as pd
# Benzer teknik: satır yüzdeli çapraz tablo
df = pd.DataFrame({"sinif": ["A", "A", "B", "B", "B"], "sonuc": ["geçti", "kaldı", "geçti", "geçti", "kaldı"]})
print((pd.crosstab(df["sinif"], df["sonuc"], normalize="index") * 100).round(1))
''',
    start='''
import veri
import pandas as pd

txns = veri.oku("anadolu_bank", "bank_txns")


def tur_kanal_payi(txns):
    # TODO 1: txn_type × channel çapraz tablosu, satıra göre normalize
    # TODO 2: yüzdeye çevir ve 1 ondalığa yuvarla
    return None
''',
    sol='''
import veri
import pandas as pd

txns = veri.oku("anadolu_bank", "bank_txns")


def tur_kanal_payi(txns):
    t = pd.crosstab(txns["txn_type"], txns["channel"], normalize="index")
    return (t * 100).round(1)


print(tur_kanal_payi(txns))
''',
    calc={'FM': 'float(tur_kanal_payi(txns).loc["fatura", "mobil"])', 'KP': 'float(tur_kanal_payi(txns).loc["kart_harcama", "pos"])',
          'HS': 'float(tur_kanal_payi(txns).loc["havale_cikis", "sube"])', 'SHAPE': 'tur_kanal_payi(txns).shape'},
    tests='''
t = tur_kanal_payi(txns)
assert t is not None, "DataFrame döndürmeli"
assert t.shape == @SHAPE@, "Tablo boyutu: 8 işlem türü × 6 kanal"
assert t.loc["fatura", "mobil"] == @FM@, "Faturaların mobil payı tutmuyor (satıra göre normalize)"
assert t.loc["kart_harcama", "pos"] == @KP@, "Kart harcamalarının POS payı tutmuyor"
assert t.loc["havale_cikis", "sube"] == @HS@, "Giden havalelerin şube payı tutmuyor"
assert t.loc["atm", "atm"] == 100.0, "ATM işlemlerinin tamamı atm kanalından"
assert ((t.sum(axis=1) - 100).abs() < 0.5).all(), "Her satırın toplamı ~100 olmalı"
''',
    hints=['Sıklık tablosu için <code>pd.crosstab</code>.', '<code>normalize="index"</code> satır yüzdesi, <code>"columns"</code> sütun yüzdesi, <code>"all"</code> genel yüzde verir.',
           '<code>(pd.crosstab(txns["txn_type"], txns["channel"], normalize="index") * 100).round(1)</code>'],
    why='<code>crosstab</code>, iki kategorik değişkenin birlikte görülme sıklığını verir; <code>normalize</code> hangi yönde yüzde alınacağını belirler ve iş sorusunu doğru okumak '
        'burada kritiktir: "faturaların yüzde kaçı mobilden" → satır yüzdesi; "mobil işlemlerin yüzde kaçı fatura" → sütun yüzdesi. '
        'Aynı tablo <code>pivot_table(aggfunc="size")</code> ya da <code>groupby([...]).size().unstack()</code> ile de kurulur.',
    tags=['crosstab', 'normalize', 'yüzde'], min=7)

if __name__ == '__main__':
    for t in T:
        t.pop('calc_extra', None)
        if t['id'] == 'b-443':
            t['calc']['N'] = 'sum(x[1] for x in sube_limitleri(con))'
    write('/home/claude/py/v3/d1/ds_bank.js', 'PythonPatika — veri seti görevleri: Anadolu Bank (b-431 … b-448)', T)
