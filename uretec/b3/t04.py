T = [
dict(id='b-341', topic='NLP', diff=2, kind='predict',
  title='Türkçe büyük İ tuzağı',
  q='<p>Müşteri yorumlarındaki şehir adlarını küçük harfe çevirip eşleştiren bu kod ne yazdırır?</p>',
  code=r'''
s = "İSTANBUL"
k = s.lower()
print(len(s), len(k))
print(k == "istanbul")
''',
  o=['8 9\nFalse', '8 8\nTrue', '8 8\nFalse', '8 9\nTrue'], a=0,
  hints=['str.lower() Unicode kurallarını uygular, Türkçe yerel ayarını bilmez.', 'Noktalı büyük İ (U+0130) küçültülünce "i" + birleşik nokta (U+0307) olur.'],
  why='Unicode’a göre "İ".lower() iki kod noktasıdır: "i" + U+0307 (combining dot above). Bu yüzden uzunluk 9 olur ve "istanbul" ile eşleşmez; ekranda aynı görünse de karşılaştırma başarısızdır. Ayrıca "I".lower() Türkçede "ı" olması gerekirken "i" verir. Çözüm: önce metin.replace("I", "ı").replace("İ", "i") sonra lower(); ya da PyICU gibi yerel ayar destekli kütüphane. casefold() bu sorunu çözmez.',
  tags=['Unicode', 'lower', 'Türkçe'], min=3),

dict(id='b-342', topic='NLP', diff=2, kind='rehberli',
  title='Türkçe uyumlu küçük harf ve tokenleştirme',
  q='<p>Yorum analizi için iki fonksiyon yaz. <code>tr_kucuk(metin)</code>: Türkçe kurallarına göre küçük harfe çevirsin (<b>I → ı</b>, <b>İ → i</b>). <code>tokenlar(metin, durak)</code>: metni <code>tr_kucuk</code> ile küçültüp <code>re.findall(r"\\w+", ...)</code> ile kelimelere ayırsın ve <code>durak</code> kümesindeki etkisiz kelimeleri (stop words) çıkarıp listeyi döndürsün.</p>',
  guide=['<code>tr_kucuk</code>: önce <code>replace("I", "ı")</code> ve <code>replace("İ", "i")</code>, sonra <code>lower()</code>.', '<code>tokenlar</code>: <code>tr_kucuk</code> çıktısında <code>re.findall(r"\\w+", ...)</code> çalıştır; noktalama ayıklanır.', 'Liste kurgusuyla (comprehension) <code>durak</code> içinde olmayanları tut.', 'Sırayı koru ve listeyi döndür.'],
  example=r'''
import re
metin = "Fiyat: 120 TL, kargo ücretsiz!"
print(re.findall(r"\w+", metin.lower()))   # noktalama gider
etkisiz = {"tl"}
print([k for k in re.findall(r"\w+", metin.lower()) if k not in etkisiz])
''',
  start=r'''
import re

def tr_kucuk(metin):
    # TODO 1: I → ı ve İ → i dönüşümünü lower()'dan ÖNCE yap
    return metin.lower()

def tokenlar(metin, durak):
    # TODO 2: tr_kucuk + re.findall(r"\w+", ...)
    # TODO 3: durak kümesindekileri çıkar
    return []
''',
  sol=r'''
import re

def tr_kucuk(metin):
    return metin.replace("I", "ı").replace("İ", "i").lower()

def tokenlar(metin, durak):
    kelimeler = re.findall(r"\w+", tr_kucuk(metin))
    return [k for k in kelimeler if k not in durak]
''',
  tests=r'''
assert tr_kucuk("IŞIK İZMİR") == "ışık izmir", f"'IŞIK İZMİR' → 'ışık izmir' olmalı; gelen {tr_kucuk('IŞIK İZMİR')!r}"
assert len(tr_kucuk("İ")) == 1, "İ tek karakterlik 'i' olmalı (lower() iki karakter üretir)"
r = tokenlar("Kargo ÇOK geç geldi ve ürün KIRIK!", {"ve", "çok"})
assert r == ["kargo", "geç", "geldi", "ürün", "kırık"], f"Beklenen ['kargo', 'geç', 'geldi', 'ürün', 'kırık']; gelen {r}"
assert tokenlar("...", set()) == [], "Yalnız noktalama varsa boş liste"
''',
  hints=['Dönüşüm sırası önemli: lower() önce çalışırsa I zaten i olmuştur.', '<code>re.findall(r"\\w+", s)</code> Unicode harfleri (ç, ğ, ş) de kelime karakteri sayar.', '<code>[k for k in kelimeler if k not in durak]</code>'],
  why='Python’un lower() fonksiyonu dil bağımsızdır; Türkçede I/ı ve İ/i çiftleri farklı eşleşir. Özel durumları önce elle çevirmek en basit ve hızlı çözümdür (O(n)). Durak kelimeleri küme (set) olarak tutmak her kontrolü O(1) yapar. Gerçek projelerde kök bulma (stemming) için zeyrek/TurkishStemmer gibi kütüphaneler, alt kelime tokenleştirme için BPE/WordPiece kullanılır.',
  tags=['tokenleştirme', 'regex', 'Türkçe', 'stop words'], min=6),

dict(id='b-343', topic='NLP', diff=3, kind='yaz', needs=['scikit-learn'],
  title='Destek talebi için en benzer kayıt (TF-IDF)',
  q='<p>Çağrı merkezi yeni gelen talebe en çok benzeyen eski talebi bulup çözüm önerisi göstermek istiyor. <code>benzer_talep(talepler, yeni)</code> fonksiyonunu yaz: <code>TfidfVectorizer</code>\'ı eski taleplere <b>fit</b> et, yeni talebi aynı sözlükle <b>transform</b> et, kosinüs benzerliğiyle en benzer kaydın <code>(indeks, skor)</code> demetini döndür (skor 3 ondalık). Hiç ortak kelime yoksa (skor 0) <code>(-1, 0.0)</code> döndür.</p>',
  start=r'''
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def benzer_talep(talepler, yeni):
    pass
''',
  sol=r'''
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def benzer_talep(talepler, yeni):
    vek = TfidfVectorizer()
    M = vek.fit_transform(talepler)
    q = vek.transform([yeni])
    skorlar = cosine_similarity(q, M)[0]
    i = int(skorlar.argmax())
    if skorlar[i] == 0:
        return -1, 0.0
    return i, round(float(skorlar[i]), 3)
''',
  tests=r'''
talepler = [
    "kartım kayboldu yeni kart istiyorum",
    "şifremi unuttum mobil uygulamaya giremiyorum",
    "hesabıma yanlış havale geldi iade etmek istiyorum",
    "kredi kartı ekstre tarihini değiştirmek istiyorum",
]
i, s = benzer_talep(talepler, "mobil uygulama şifremi kabul etmiyor")
assert i == 1, f"Şifre/mobil talebi (1) en benzer olmalı; gelen {i}"
assert 0 < s <= 1, "Kosinüs skoru 0-1 arasında olmalı"
i2, _ = benzer_talep(talepler, "kart kayboldu")
assert i2 == 0, "Kart kaybı talebi (0) bulunmalı"
assert benzer_talep(talepler, "teşekkürler") == (-1, 0.0), "Ortak kelime yoksa (-1, 0.0)"
''',
  hints=['Sözlük (vocabulary) yalnız eski taleplerden öğrenilmeli: <code>fit_transform(talepler)</code>, sonra <code>transform([yeni])</code>.', '<code>cosine_similarity(q, M)[0]</code> yeni talebin her eski talebe benzerliğini verir.', 'En büyük skorun yeri <code>argmax()</code>; skor 0 ise (-1, 0.0).'],
  why='TF-IDF sık geçen ama ayırt edici olmayan kelimelerin ("istiyorum") ağırlığını düşürür, nadir ve bilgilendirici kelimeleri ("şifremi", "mobil") öne çıkarır. Kosinüs benzerliği metin uzunluğundan bağımsızdır. Seyrek matrislerle sorgu O(nnz). Yeni kelimeler sözlükte olmadığı için yok sayılır (bu yüzden "teşekkürler" 0 skor alır). Alternatifler: kök bulma ile "şifremi/şifre" eşleştirme, karakter n-gram (analyzer="char_wb"), ya da anlamsal benzerlik için cümle gömmeleri (sentence embeddings).',
  tags=['TF-IDF', 'kosinüs benzerliği', 'arama'], min=10),

dict(id='b-344', topic='NLP', diff=2, kind='bug',
  title='Son ikili hiç sayılmıyor (n-gram)',
  q='<p>Kodda bir hata var, bul ve düzelt. Yorumlarda en sık geçen kelime ikilisini (bigram) bulan kod "kargo hızlı" ikilisini 3 yerine 1 kez sayıyor. Hata <code>ngramlar(tokenlar, n)</code> fonksiyonunda.</p>',
  start=r'''
from collections import Counter

def ngramlar(tokenlar, n):
    return [tuple(tokenlar[i:i + n]) for i in range(len(tokenlar) - n)]

def en_sik_ikili(yorumlar):
    say = Counter()
    for y in yorumlar:
        say.update(ngramlar(y.split(), 2))
    return say.most_common(1)[0]
''',
  sol=r'''
from collections import Counter

def ngramlar(tokenlar, n):
    return [tuple(tokenlar[i:i + n]) for i in range(len(tokenlar) - n + 1)]

def en_sik_ikili(yorumlar):
    say = Counter()
    for y in yorumlar:
        say.update(ngramlar(y.split(), 2))
    return say.most_common(1)[0]
''',
  tests=r'''
assert ngramlar(["a", "b", "c"], 2) == [("a", "b"), ("b", "c")], "3 kelimeden 2 bigram çıkar: n kelimeden len-n+1 tane"
assert ngramlar(["a", "b"], 3) == [], "n uzunluktan büyükse boş liste"
assert ngramlar(["x"], 1) == [("x",)], "Tek kelime, n=1 → bir unigram"
r = en_sik_ikili(["kargo hızlı geldi", "ürün güzel kargo hızlı", "kargo hızlı"])
assert r == (("kargo", "hızlı"), 3), f"('kargo','hızlı') 3 kez geçer; gelen {r}"
''',
  hints=['n kelimelik pencere kaç farklı başlangıç noktasına sahip olabilir?', '5 kelime, n=2: başlangıçlar 0,1,2,3 → 4 = 5 − 2 + 1.', '<code>range(len(tokenlar) - n + 1)</code>'],
  why='Klasik "bir eksik" (off-by-one) hatası: L uzunluklu dizide n’lik pencere sayısı L − n + 1’dir. Son pencere atlanınca tümcenin sonundaki ikililer, kısa yorumlarda ise tüm ikililer kaybolur. Karmaşıklık O(L·n). Alternatif ve şık yol: list(zip(*(tokenlar[i:] for i in range(n)))) — zip en kısa dilimde durduğu için sınırı kendiliğinden doğru alır. Python 3.12’de itertools.pairwise yalnız bigram için hazırdır.',
  tags=['n-gram', 'off-by-one', 'Counter'], min=4),

dict(id='b-345', topic='NLP', diff=2, kind='yaz',
  title='Olumsuzluğa duyarlı duygu skoru',
  q='<p>Basit sözlük tabanlı duygu analizi yaz. <code>duygu_skoru(yorum)</code>: yorumu küçük harfe çevirip boşluklardan böl (noktalama yok sayılabilir: <code>re.findall(r"\\w+", ...)</code>); <code>POZITIF</code> kelime +1, <code>NEGATIF</code> kelime −1 puan. Bir duygu kelimesinden <b>hemen sonra</b> "değil" geliyorsa o kelimenin puanını tersine çevir. Toplam puanı (int) döndür.</p>',
  start=r'''
import re

POZITIF = {"güzel", "hızlı", "harika", "sağlam"}
NEGATIF = {"kötü", "geç", "kırık", "yavaş"}

def duygu_skoru(yorum):
    pass
''',
  sol=r'''
import re

POZITIF = {"güzel", "hızlı", "harika", "sağlam"}
NEGATIF = {"kötü", "geç", "kırık", "yavaş"}

def duygu_skoru(yorum):
    k = re.findall(r"\w+", yorum.lower())
    skor = 0
    for i, w in enumerate(k):
        puan = 1 if w in POZITIF else -1 if w in NEGATIF else 0
        if puan and i + 1 < len(k) and k[i + 1] == "değil":
            puan = -puan
        skor += puan
    return skor
''',
  tests=r'''
assert duygu_skoru("Hızlı ve sağlam paketlenmiş") == 2, "İki pozitif kelime → 2"
assert duygu_skoru("Ürün güzel değil, kargo da geç geldi.") == -2, "'güzel değil' → -1, 'geç' → -1 = -2"
assert duygu_skoru("Fiyatı kötü değil") == 1, "'kötü değil' olumluya döner → +1"
assert duygu_skoru("değil") == 0, "Tek başına 'değil' puan almaz"
assert duygu_skoru("Harika") == 1, "Son kelimede sınır taşması olmamalı (i + 1 kontrolü)"
''',
  hints=['Kelimeleri indeksleriyle dolaş (<code>enumerate</code>) ki bir sonrakine bakabilesin.', 'Sonraki kelimeye bakmadan önce <code>i + 1 &lt; len(k)</code> kontrolü yap.', 'Önce puanı belirle, "değil" varsa işaretini çevir, sonra topla.'],
  why='Sözlük tabanlı yaklaşım açıklanabilir ve veri gerektirmez; ileriye bakan tek adımlık olumsuzluk kuralı Türkçedeki "X değil" kalıbını yakalar. O(n) zaman, kümelerle O(1) üyelik. Sınırları: ironi, "pek iyi sayılmaz" gibi uzak olumsuzluk, ek alan kelimeler ("güzeldi"). Ölçeklenen alternatif: etiketli yorumlarla eğitilen TF-IDF + LogisticRegression ya da Türkçe BERT modelleri.',
  tags=['duygu analizi', 'sözlük', 'olumsuzluk'], min=6),

dict(id='b-346', topic='NLP', diff=2, kind='tamamla',
  title='Levenshtein ile şehir adı düzeltme',
  q='<p>Adres formunda yazım hatalı şehir adlarını en yakın geçerli şehre düzeltmek istiyoruz. <code>levenshtein(a, b)</code> iki metin arasındaki düzenleme uzaklığını (ekleme, silme, değiştirme) dinamik programlamayla iki satır kullanarak hesaplıyor. <code>___</code> boşluğunu doldur: değiştirme (ya da eşleşme) maliyetini ekle.</p>',
  start=r'''
def levenshtein(a, b):
    onceki = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        simdiki = [i]
        for j, cb in enumerate(b, 1):
            maliyet = 0 if ca == cb else 1
            simdiki.append(min(onceki[j] + 1,        # silme
                               simdiki[j - 1] + 1,   # ekleme
                               ___))                 # değiştirme
        onceki = simdiki
    return onceki[-1]

def duzelt(kelime, sehirler):
    return min(sehirler, key=lambda s: (levenshtein(kelime, s), s))
''',
  sol=r'''
def levenshtein(a, b):
    onceki = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        simdiki = [i]
        for j, cb in enumerate(b, 1):
            maliyet = 0 if ca == cb else 1
            simdiki.append(min(onceki[j] + 1,        # silme
                               simdiki[j - 1] + 1,   # ekleme
                               onceki[j - 1] + maliyet))  # değiştirme
        onceki = simdiki
    return onceki[-1]

def duzelt(kelime, sehirler):
    return min(sehirler, key=lambda s: (levenshtein(kelime, s), s))
''',
  tests=r'''
assert levenshtein("kitten", "sitting") == 3, "kitten → sitting: 2 değiştirme + 1 ekleme = 3"
assert levenshtein("", "abc") == 3 and levenshtein("abc", "") == 3, "Boş metne uzaklık uzunluk kadardır"
assert levenshtein("Bursa", "Bursa") == 0, "Aynı metin → 0"
sehirler = ["Ankara", "İzmir", "Bursa", "Antalya"]
assert duzelt("Ankra", sehirler) == "Ankara", "Ankra → Ankara (1 ekleme)"
assert duzelt("Brusa", sehirler) == "Bursa", "Brusa → Bursa (2 değiştirme)"
''',
  hints=['Değiştirme hücresi çaprazdaki (sol üst) değerden gelir.', 'Sol üst hücre önceki satırın j − 1 sütunudur.', '<code>onceki[j - 1] + maliyet</code>'],
  why='Levenshtein DP’sinde her hücre üç komşudan gelir: üst (silme), sol (ekleme), sol üst (değiştirme/eşleşme). Yalnız iki satır tutmak belleği O(n·m)’den O(m)’e indirir; zaman O(n·m). Binlerce adayda her biriyle tam DP pahalıdır; alternatifler: difflib.get_close_matches (standart kütüphane), rapidfuzz (C hızında), uzunluk farkı > eşik olanları önceden elemek ya da BK-ağacı.',
  tags=['Levenshtein', 'dinamik programlama', 'bulanık eşleme'], min=5),

dict(id='b-347', topic='polars/duckdb', diff=2, kind='predict', needs=['duckdb'],
  title='COUNT(*) ve COUNT(sütun) farkı',
  q='<p>DuckDB ile bellek içi bir tabloda yapılan bu sorgu ne yazdırır?</p>',
  code=r'''
import duckdb

con = duckdb.connect()
con.execute("CREATE TABLE s (sehir VARCHAR, tutar INTEGER)")
con.execute("INSERT INTO s VALUES ('Ankara', 100), ('İzmir', 50), ('Ankara', 70), ('Bursa', NULL)")
print(con.execute("SELECT COUNT(*), COUNT(tutar), SUM(tutar) FROM s").fetchall())
''',
  o=['[(4, 3, 220)]', '[(4, 4, 220)]', '[(3, 3, 220)]', '[(4, 3, None)]'], a=0,
  hints=['COUNT(*) satır sayar, COUNT(sütun) NULL olmayan değerleri sayar.', 'SUM NULL değerleri atlar; tümü NULL olmadıkça sonuç NULL olmaz.'],
  why='SQL standardında COUNT(*) tüm satırları (4), COUNT(tutar) yalnız NULL olmayanları (3) sayar; SUM ve AVG NULL’ları yok sayar (AVG = 220/3, 220/4 değil!). fetchall() satırları demet listesi olarak döndürür. Pandas’ta karşılıkları len(df), df.tutar.count(), df.tutar.sum(). Eksik veriyi 0 saymak istiyorsan SUM(COALESCE(tutar, 0)) ya da AVG’de bunu bilinçli seç.',
  tags=['duckdb', 'NULL', 'COUNT'], min=3),

dict(id='b-348', topic='polars/duckdb', diff=2, kind='rehberli', needs=['polars'],
  title='Polars ile şehir özeti',
  q='<p><code>sehir_ozet(veri)</code> fonksiyonunu polars ile yaz: <code>veri</code> sözlüğünden (<code>sehir</code>, <code>tutar</code> anahtarları) bir <code>pl.DataFrame</code> kur, şehre göre grupla, <code>ciro</code> (tutar toplamı) ve <code>adet</code> (satır sayısı) sütunlarını hesapla, ciroya göre <b>azalan</b> sırala ve satırları <code>[(sehir, ciro, adet), ...]</code> listesi olarak döndür.</p>',
  guide=['<code>df = pl.DataFrame(veri)</code>', '<code>df.group_by("sehir").agg(...)</code> içinde iki ifade ver: <code>pl.col("tutar").sum().alias("ciro")</code> ve <code>pl.len().alias("adet")</code>.', '<code>.sort("ciro", descending=True)</code> ile sırala; polars group_by sırası garanti değildir.', '<code>.rows()</code> satırları demet listesi olarak verir.'],
  example=r'''
import polars as pl
df = pl.DataFrame({"birim": ["İK", "BT", "BT"], "maas": [40, 55, 60]})
ozet = df.group_by("birim").agg(pl.col("maas").mean().alias("ort")).sort("birim")
print(ozet.rows())
''',
  start=r'''
import polars as pl

def sehir_ozet(veri):
    df = pl.DataFrame(veri)
    # TODO 1: group_by + agg ile ciro (toplam) ve adet (satır sayısı) hesapla
    # TODO 2: ciroya göre azalan sırala
    # TODO 3: .rows() ile demet listesi döndür
    return []
''',
  sol=r'''
import polars as pl

def sehir_ozet(veri):
    df = pl.DataFrame(veri)
    return (
        df.group_by("sehir")
        .agg(pl.col("tutar").sum().alias("ciro"), pl.len().alias("adet"))
        .sort("ciro", descending=True)
        .rows()
    )
''',
  tests=r'''
veri = {"sehir": ["Ankara", "İzmir", "Ankara", "Bursa", "İzmir", "Ankara"],
        "tutar": [100, 400, 150, 90, 20, 30]}
r = sehir_ozet(veri)
assert r == [("İzmir", 420, 2), ("Ankara", 280, 3), ("Bursa", 90, 1)], f"Beklenen [('İzmir', 420, 2), ('Ankara', 280, 3), ('Bursa', 90, 1)]; gelen {r}"
''',
  hints=['Polars\'ta toplama ifadeleri <code>agg</code> içine virgülle yazılır.', 'Satır sayısı için <code>pl.len()</code>; <code>.alias("adet")</code> ile adlandır.', 'Polars group_by çıktısının sırası rastgeledir; mutlaka <code>sort</code> et.'],
  why='Polars ifade (expression) tabanlıdır: agg içindeki ifadeler paralel ve tek geçişte hesaplanır, pandas’tan genelde hızlıdır. group_by varsayılan olarak sırayı korumaz (performans için); deterministik çıktı için sort ya da group_by(..., maintain_order=True) gerekir. Büyük verilerde pl.scan_csv(...).group_by(...).collect() ile tembel (lazy) çalıştırılırsa sorgu planı optimize edilir. Pandas karşılığı: df.groupby("sehir").agg(ciro=("tutar","sum"), adet=("tutar","size")).',
  tags=['polars', 'group_by', 'agg', 'pl.len'], min=6),

dict(id='b-349', topic='polars/duckdb', diff=2, kind='yaz', needs=['polars'],
  title='when/then ile sipariş segmenti',
  q='<p><code>segment_ekle(df)</code> fonksiyonunu polars ile yaz: <code>tutar</code> sütununa göre yeni bir <code>segment</code> sütunu eklesin: 1000 ve üstü <b>"yüksek"</b>, 300 ve üstü <b>"orta"</b>, kalanı <b>"düşük"</b>. <code>pl.when(...).then(...).when(...).then(...).otherwise(...)</code> zincirini ve <code>with_columns</code> kullan; yeni DataFrame döndür.</p>',
  start=r'''
import polars as pl

def segment_ekle(df):
    pass
''',
  sol=r'''
import polars as pl

def segment_ekle(df):
    return df.with_columns(
        pl.when(pl.col("tutar") >= 1000).then(pl.lit("yüksek"))
        .when(pl.col("tutar") >= 300).then(pl.lit("orta"))
        .otherwise(pl.lit("düşük"))
        .alias("segment")
    )
''',
  tests=r'''
df = pl.DataFrame({"no": [1, 2, 3, 4, 5], "tutar": [1500, 1000, 999, 300, 120]})
r = segment_ekle(df)
assert isinstance(r, pl.DataFrame), "polars DataFrame döndür"
assert r["segment"].to_list() == ["yüksek", "yüksek", "orta", "orta", "düşük"], f"Sınırlar dahil; gelen {r['segment'].to_list()}"
assert "segment" not in df.columns, "Orijinal df değişmemeli (polars nesneleri değişmezdir, with_columns yenisini döndürür)"
''',
  hints=['Koşullu sütun: <code>pl.when(kosul).then(deger)</code>, ek koşullar zincirlenir.', 'Metin sabitleri için <code>pl.lit("yüksek")</code> kullan; düz metin sütun adı sanılabilir.', 'Sonda <code>.otherwise(pl.lit("düşük")).alias("segment")</code> ve <code>df.with_columns(...)</code>.'],
  why='when/then/otherwise SQL’deki CASE WHEN’in polars karşılığıdır ve vektörel çalışır (O(n)). Polars’ta then("orta") yazmak bazı sürümlerde "orta" adlı SÜTUNU arar; pl.lit ile değerin sabit olduğu açıkça belirtilir. with_columns yeni DataFrame döndürür, orijinal değişmez. Alternatifler: pl.col("tutar").cut([300, 1000], labels=[...], left_closed=True) ya da pandas’ta np.select/pd.cut.',
  tags=['polars', 'when/then', 'with_columns'], min=5),

dict(id='b-350', topic='polars/duckdb', diff=2, kind='bug', needs=['polars'],
  title='Polars filtresinde and kullanımı',
  q='<p>Kodda bir hata var, bul ve düzelt. <code>ankara_buyuk(df)</code> Ankara\'daki 100 TL üstü siparişleri döndürmeli ama <code>TypeError</code> veriyor.</p>',
  start=r'''
import polars as pl

def ankara_buyuk(df):
    return df.filter((pl.col("sehir") == "Ankara") and (pl.col("tutar") > 100))
''',
  sol=r'''
import polars as pl

def ankara_buyuk(df):
    return df.filter((pl.col("sehir") == "Ankara") & (pl.col("tutar") > 100))
''',
  tests=r'''
df = pl.DataFrame({"sehir": ["Ankara", "Ankara", "İzmir", "Ankara"], "tutar": [150, 80, 500, 101]})
r = ankara_buyuk(df)
assert r["tutar"].to_list() == [150, 101], f"Ankara ve tutar > 100 → [150, 101]; gelen {r['tutar'].to_list()}"
''',
  hints=['Python\'un <code>and</code> operatörü nesnenin tek bir doğru/yanlış değerini (bool) ister; ifade nesnesi bunu veremez.', 'Eleman bazında mantıksal VE için <code>&amp;</code>, VEYA için <code>|</code>, DEĞİL için <code>~</code>.', 'Her koşulu paranteze al: <code>(a == 1) &amp; (b &gt; 2)</code>.'],
  why='and/or Python’da kısa devre yapar ve sol tarafın bool() değerini ister; polars ifadesi (ya da pandas Series, numpy dizisi) için bu belirsizdir, TypeError/ValueError fırlatılır. & ve | operatörleri eleman bazında çalışır. Operatör önceliği yüzünden parantezler şarttır: & karşılaştırmadan önce bağlanır. Polars’ta alternatif: df.filter(pl.col("sehir") == "Ankara", pl.col("tutar") > 100) — birden çok argüman otomatik VE ile birleşir.',
  tags=['polars', 'filter', 'mantıksal operatör'], min=3),
]
