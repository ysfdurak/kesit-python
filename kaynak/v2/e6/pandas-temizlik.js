/* Kesit Python — 'pandas-temizlik' dersi uzantısı (Derinleş) */
// needs: pandas
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
  {
    id: 'pandas-temizlik',
    min: 30,
    needs: ['pandas'],
    html: `<h2>Derinleş: Türkçe metin, grup bazlı doldurma, regex ve doğrulama</h2><p>Temel temizlik akışını (eksik → tür → metin → tekrar → aykırı) gördün. Gerçek projelerde bu akışı bozan birkaç tuzak daha vardır: Türkçe İ/ı harfleri, tutarsız sütun adları, tek bir medyanla doldurmanın yanlış olduğu gruplu veriler, telefon ve adet gibi metne gömülmüş değerler ve temizlikten sonra "gerçekten temiz mi?" sorusu. Bu bölüm bunları kapatıyor.</p><h3>Türkçe büyük-küçük harf tuzağı</h3><p>Python'un <code>lower()</code> metodu Unicode kurallarını uygular, Türkçe kurallarını değil: <code>"İ".lower()</code> iki karakterlik <code>"i̇"</code> (i + birleşen nokta) verir, <code>"I".lower()</code> ise <code>"i"</code> verir (Türkçede <code>"ı"</code> olmalıydı). Bu yüzden "İZMİR" küçültülünce "izmir" ile eşleşmez ve şehir sayımları bölünür. Çözüm: küçültmeden önce bu iki harfi elle çevirmek.</p><pre class="py">import pandas as pd

print("İZMİR".lower() == "izmir", len("İ".lower()))

TR_KUCUK = str.maketrans({"İ": "i", "I": "ı"})

def tr_lower(s: pd.Series) -&gt; pd.Series:
    return s.str.strip().str.translate(TR_KUCUK).str.lower()

sehir = pd.Series(["İZMİR", " izmir", "ISPARTA", "Isparta ", "ıspartа"])
print(tr_lower(sehir).tolist())
print(tr_lower(sehir).value_counts().to_dict())
</pre><p>Son elemanı dikkatle incele: "ıspartа" içinde Kiril "а" harfi var ve gözle fark edilmez. Kopyala-yapıştır verilerde böyle hayalet karakterler, sıfır genişlikli boşluk (<code>\\u200b</code>) ve bölünmez boşluk (<code>\\xa0</code>) sık görülür; <code>s.str.normalize("NFKC")</code> ve <code>s.str.replace("\\xa0", " ")</code> ilk savunma hattıdır. Sınırlı değer kümelerinde (şehir, kategori) en güvenlisi bir eşleme sözlüğüyle <code>map</code> edip eşleşmeyenleri raporlamaktır.</p><h3>Sütun adlarını standartlaştırma</h3><p>Excel'den gelen başlıklar "Müşteri Adı ", "TUTAR (TL)" gibi olur. Kodda <code>df["müşteri_adı"]</code> yazmak hem yazım hatasına açık hem de klavyeye bağımlıdır. Tüm sütun adlarını bir kerede küçük harf, ASCII ve alt çizgili yapmak kodu sadeleştirir:</p><pre class="py">import pandas as pd

df = pd.DataFrame(columns=["Müşteri Adı ", "TUTAR (TL)", "Şehir", "Sipariş Tarihi"])
ceviri = str.maketrans("çğıöşüÇĞİÖŞÜ", "cgiosuCGIOSU")
yeni = (df.columns.str.strip()
          .str.translate(ceviri)
          .str.lower()
          .str.replace(r"[^a-z0-9]+", "_", regex=True)
          .str.strip("_"))
df.columns = yeni
print(df.columns.tolist())
</pre><h3>Grup bazlı ve sıralı doldurma</h3><p>Tüm sütunun medyanıyla doldurmak, İstanbul'daki eksik geliri Bursa'nın geliriyle karıştırır. Daha dürüst olan, eksiği <b>kendi grubunun</b> medyanıyla doldurmaktır: <code>groupby(...).transform("median")</code> her satıra grubunun değerini taşır, <code>fillna</code> bu Series'i satır satır kullanır. Zaman sıralı verilerde (günlük stok, kur) ise son bilinen değeri ileri taşımak (<code>ffill</code>) ya da iki değer arasını doğrusal tamamlamak (<code>interpolate</code>) daha anlamlıdır.</p><pre class="py">import pandas as pd
import numpy as np

df = pd.DataFrame({
    "sehir": ["Ankara", "Ankara", "Ankara", "Bursa", "Bursa"],
    "gelir": [20000, np.nan, 30000, 50000, np.nan],
})
grup_medyani = df.groupby("sehir")["gelir"].transform("median")
df["gelir_dolu"] = df["gelir"].fillna(grup_medyani)
print(df)

stok = pd.Series([100, np.nan, np.nan, 70], index=pd.date_range("2024-03-01", periods=4))
print(stok.ffill().tolist())        # son bilinen değer
print(stok.interpolate().tolist())  # doğrusal: 90, 80
</pre><h3>Regex ile değer ayıklama: str.extract</h3><p><code>str.extract(desen)</code> her satırda düzenli ifadenin (regular expression) yakalama gruplarını sütun olarak döndürür; eşleşmeyen satır NaN olur. Telefon, plaka, "3 adet x 45,50 TL" gibi metinlerden sayı çekmek için idealdir. Bir telefon numarasını standart biçime getirmek tipik bir örnektir:</p><pre class="py">import pandas as pd

tel = pd.Series(["0532 111 22 33", "+90 (505) 444-5566", "5321112233", "212 555 00 00", "abc"])
rakam = tel.str.replace(r"\\D", "", regex=True)            # rakam dışı her şeyi sil
gsm = rakam.str.extract(r"^(?:90|0)?(5\\d{9})$")[0]        # ülke kodu / 0 isteğe bağlı
print(gsm.tolist())

aciklama = pd.Series(["3 adet x 45,50 TL", "12 adet x 9,90 TL"])
parca = aciklama.str.extract(r"(?P&lt;adet&gt;\\d+) adet x (?P&lt;fiyat&gt;[\\d,]+)")
parca["fiyat"] = pd.to_numeric(parca["fiyat"].str.replace(",", ".", regex=False))
parca["adet"] = parca["adet"].astype(int)
print(parca.assign(tutar=parca["adet"] * parca["fiyat"]))
</pre><h3>Sayıyı aralığa çevirmek: pd.cut ve pd.qcut</h3><p>Yaş, tutar, skor gibi sürekli değerleri raporlamak için aralıklara (bin) bölersin. <code>pd.cut</code> senin verdiğin sınırları kullanır, aralıklar varsayılan olarak <b>sağdan kapalıdır</b>: <code>(18, 30]</code> 18'i içermez, 30'u içerir. <code>pd.qcut</code> ise veriyi eşit sayıda gözleme bölen çeyrek/dilim sınırlarını kendisi bulur.</p><div class="tbl-wrap"><table><tr><th>Araç</th><th>Ne zaman</th><th>Dikkat</th></tr><tr><td><code>replace({"E": "Evet"})</code></td><td>Birkaç değeri değiştir, kalanı aynen kalsın</td><td>Sözlükte olmayan değer korunur</td></tr><tr><td><code>map(sozluk)</code></td><td>Tüm değerleri bir sözlükle çevir</td><td>Sözlükte olmayan NaN olur (eşleşmeyeni yakalamak için iyi)</td></tr><tr><td><code>where / mask</code></td><td>Koşula uymayanı (where) ya da uyanı (mask) değiştir</td><td><code>s.mask(s &lt; 0, 0)</code> negatifleri 0 yapar</td></tr><tr><td><code>pd.cut</code></td><td>Sabit sınırlarla aralık</td><td>Sağdan kapalı; <code>right=False</code> ile değiştir</td></tr><tr><td><code>pd.qcut</code></td><td>Eşit büyüklükte dilimler</td><td>Çok tekrar eden değerde <code>duplicates="drop"</code></td></tr></table></div><pre class="py">import pandas as pd

yas = pd.Series([17, 18, 25, 30, 31, 64])
grup = pd.cut(yas, bins=[0, 18, 30, 120], labels=["genç", "yetişkin", "olgun"])
print(grup.tolist())
print(grup.value_counts(sort=False).to_dict())

tutar = pd.Series([50, 120, 80, 900, 300, 60, 2000, 75])
print(pd.qcut(tutar, q=4, labels=["Ç1", "Ç2", "Ç3", "Ç4"]).tolist())
print(tutar.mask(tutar &gt; 1000, 1000).tolist())     # üst sınır
</pre><h3>Temizlik sonrası doğrulama</h3><p>Temizleme fonksiyonunun sonunda veriye kısa "sözleşme" kontrolleri koymak, kaynak sistem değiştiğinde hatanın rapora sızmasını engeller: zorunlu sütunlar var mı, kimlik sütunu tekil mi, tutar negatif mi, tarih beklenen aralıkta mı? <code>assert</code> ile ya da hatalı satırları ayrı bir "karantina" tablosuna ayırarak yapılır.</p><div class="warn"><b>Temizliği belgele</b>Her doldurma, silme ve kırpma bir iş kararıdır. Kaç satırın atıldığını, kaç değerin doldurulduğunu raporun altına yaz; aksi halde iki ekip aynı veriden farklı rakam bulur ve hangisinin doğru olduğu tartışılır.</div><div class="note"><b>Gerçek işte</b>Bankacılık ve e-ticaret ekiplerinde temizlik kodu bir kere yazılıp her gün çalışır. Bu yüzden şehir eşleme sözlüğü, sütun adı standardı ve doğrulama kuralları çoğunlukla ayrı bir modülde ya da yapılandırma dosyasında tutulur; yeni bir şehir yazımı geldiğinde kod değil sözlük güncellenir. Eşleşmeyen değerleri sessizce "Bilinmiyor" yapmak yerine günlük bir "eşleşmeyenler" listesiyle veri sahibine bildirmek kaliteyi kalıcı olarak artırır.</div>`,
    ex: [
      { t: 'mc',
        stage: 'Isınma',
        needs: ['pandas'],
        q: 'Her şehrin eksik gelirini <b>kendi şehrinin</b> medyanıyla doldurmak için hangisi doğru?',
        o: ['<code>df["gelir"].fillna(df["gelir"].median())</code>', '<code>df["gelir"].fillna(df.groupby("sehir")["gelir"].transform("median"))</code>', '<code>df.groupby("sehir")["gelir"].median().fillna(df["gelir"].mean())</code>', '<code>df["gelir"].fillna(method="median", by="sehir", axis=0)</code>'],
        a: 1,
        why: 'transform("median") her satıra kendi grubunun medyanını taşıyan, orijinal tabloyla aynı uzunlukta bir Series döndürür; fillna bunu satır satır kullanır. İlk şık tüm tablonun medyanını kullanır, üçüncüsü özet tablo üretir, dördüncüsü geçerli bir parametre değildir.' },
      { t: 'predict',
        stage: 'Kodu oku',
        needs: ['pandas'],
        q: 'Bu kod ne yazdırır?',
        code: 'print("İZMİR".lower() == "izmir", len("İ".lower()))\n',
        o: ['True 1', 'False 2', 'False 1', 'True 2'],
        a: 1,
        why: 'Unicode kuralına göre İ küçültülünce i + birleşen nokta (U+0307) olur: iki karakter. Bu yüzden "izmir" ile eşleşmez. Türkçe veride küçültmeden önce İ → i ve I → ı çevirisi yap.' },
      { t: 'predict',
        stage: 'Kodu oku',
        needs: ['pandas'],
        q: 'pd.cut aralıkları varsayılan olarak nasıl kapatır? Ne yazdırır?',
        code: 'import pandas as pd\ng = pd.cut([18, 19, 30], bins=[0, 18, 30], labels=["genç", "yetişkin"])\nprint(list(g))\n',
        o: ['[\'yetişkin\', \'yetişkin\', \'yetişkin\']', '[\'genç\', \'yetişkin\', \'yetişkin\']', '[\'genç\', \'genç\', \'yetişkin\']', '[\'genç\', \'yetişkin\', nan]'],
        a: 1,
        why: 'Aralıklar (0, 18] ve (18, 30]: sağ uç dahil, sol uç hariç. 18 ilk aralığa, 19 ve 30 ikinci aralığa düşer. right=False verseydin [0, 18) ve [18, 30) olur, 30 dışarıda kalıp NaN olurdu.' },
      { t: 'predict',
        stage: 'Kodu oku',
        needs: ['pandas'],
        q: 'Günlük stok serisinde eksikler dolduruluyor. Ne yazdırır?',
        code: 'import pandas as pd\nimport numpy as np\ns = pd.Series([100, np.nan, np.nan, 40])\nprint(s.ffill().tolist(), s.interpolate().tolist())\n',
        o: ['[100.0, 100.0, 100.0, 40.0] [100.0, 80.0, 60.0, 40.0]', '[100.0, 40.0, 40.0, 40.0] [100.0, 70.0, 70.0, 40.0]', '[100.0, 100.0, 100.0, 40.0] [100.0, 70.0, 70.0, 40.0]', '[100.0, 0.0, 0.0, 40.0] [100.0, 80.0, 60.0, 40.0]'],
        a: 0,
        why: 'ffill son bilinen değeri ileri taşır (100, 100). interpolate iki bilinen değer arasını eşit adımlarla doldurur: 100 → 40 arası üç adım, her adım -20.' },
      { t: 'order',
        stage: 'Kodu oku',
        needs: ['pandas'],
        q: '<p>Excel\'den gelen sütun adlarını küçük harfli ve alt çizgili yapan programın satırlarını sırala.</p>',
        lines: ['import pandas as pd', 'df = pd.DataFrame(columns=[" Sipariş No", "TUTAR TL "])', 'ceviri = str.maketrans("ş", "s")', 'adlar = df.columns.str.strip().str.lower()', 'df.columns = adlar.str.translate(ceviri).str.replace(" ", "_")', 'print(df.columns.tolist())'],
        expect: '[\'siparis_no\', \'tutar_tl\']\n',
        hint: 'Önce boşlukları kırp ve küçült, sonra harf çevir ve boşlukları alt çizgi yap.',
        why: 'adlar değişkeni strip+lower sonucunu tutar; ikinci adım çeviri tablosunu ve alt çizgiyi uygular. ceviri tablosu kullanılmadan önce tanımlı olmalı.' },
      { t: 'code',
        id: 'pandas-temizlik-x1',
        stage: 'Rehberli',
        diff: 2,
        needs: ['pandas'],
        q: '<p><code>sutun_adlari(df)</code> fonksiyonu sütun adları standartlaştırılmış <b>yeni</b> bir DataFrame döndürsün: baş/son boşluk kırpılsın, Türkçe harfler ASCII\'ye çevrilsin (ç→c, ğ→g, ı→i, İ→i, ö→o, ş→s, ü→u), küçük harf olsun, harf/rakam dışı her karakter dizisi tek <code>_</code> olsun ve baştaki/sondaki <code>_</code> silinsin. Girdi değişmesin.</p>',
        guide: ['str.maketrans ile Türkçe → ASCII çeviri tablosu kur (büyük harfleri de ekle: Ç, Ğ, I, İ, Ö, Ş, Ü).', 'df.columns.str.strip().str.translate(tablo).str.lower() zincirini kur.', 'str.replace(r"[^a-z0-9]+", "_", regex=True) ile kalan karakterleri alt çizgi yap, str.strip("_") ile uçları temizle.', 'df.copy() üzerinde columns ata ve onu döndür.'],
        example: 'import pandas as pd\nkod = pd.Index(["A-1 ", " b 2"])\nprint(kod.str.strip().str.lower().str.replace(r"[^a-z0-9]+", "_", regex=True).tolist())\n',
        start: 'import pandas as pd\n\nTABLO = str.maketrans("çğıöşüÇĞIİÖŞÜ", "cgiosuCGIIOSU")\n\ndef sutun_adlari(df):\n    yeni = df.copy()\n    adlar = yeni.columns.str.strip()\n    # TODO: translate, lower\n    # TODO: harf/rakam dışını _ yap, uçlardaki _ sil\n    return yeni\n',
        sol: 'import pandas as pd\n\nTABLO = str.maketrans("çğıöşüÇĞIİÖŞÜ", "cgiosuCGIIOSU")\n\ndef sutun_adlari(df):\n    yeni = df.copy()\n    adlar = yeni.columns.str.strip().str.translate(TABLO).str.lower()\n    adlar = adlar.str.replace(r"[^a-z0-9]+", "_", regex=True).str.strip("_")\n    yeni.columns = adlar\n    return yeni\n',
        tests: 'import pandas as pd\ndf = pd.DataFrame([[1, 2, 3, 4]], columns=["Müşteri Adı ", "TUTAR (TL)", "İL", "Sipariş-Tarihi"])\nr = sutun_adlari(df)\nassert r.columns.tolist() == ["musteri_adi", "tutar_tl", "il", "siparis_tarihi"], f"Gelen: {r.columns.tolist()}"\nassert df.columns.tolist()[0] == "Müşteri Adı ", "Girdi DataFrame değişmemeli"\nassert r.iloc[0].tolist() == [1, 2, 3, 4], "Veri aynı kalmalı"\n',
        hints: ['Index nesnesinin de .str erişimcisi vardır: df.columns.str.lower().', 'İ\'yi lower\'dan ÖNCE çevir; yoksa i + nokta olur.', 'adlar.str.replace(r"[^a-z0-9]+", "_", regex=True).str.strip("_")'],
        why: 'Standart sütun adları kodu klavye ve yazım hatasından korur. Çeviri lower\'dan önce yapılmalıdır, aksi halde İ iki karaktere dönüşür ve regex onu alt çizgiye çevirir.' },
      { t: 'code',
        id: 'pandas-temizlik-x2',
        stage: 'Rehberli',
        diff: 2,
        needs: ['pandas'],
        q: '<p><code>grup_doldur(df)</code> fonksiyonu <code>gelir</code> sütunundaki eksikleri önce aynı <code>sehir</code> grubunun medyanıyla doldursun; grubun tamamı eksikse (medyan da NaN) tüm tablonun gelir medyanını kullansın. Ayrıca doldurulan satırlar için <code>gelir_dolduruldu</code> adlı bool sütun eklesin. Yeni DataFrame döndür.</p>',
        guide: ['Eksik maskesini (isna) doldurmadan ÖNCE kaydet.', 'groupby("sehir")["gelir"].transform("median") ile grup medyanını al.', 'Önce grup medyanıyla, sonra genel medyanla fillna yap.', 'Maskeyi gelir_dolduruldu sütunu olarak ekle.'],
        example: 'import pandas as pd\nd = pd.DataFrame({"depo": ["A", "A", "B"], "stok": [10, None, None]})\nort = d.groupby("depo")["stok"].transform("mean")\nprint(d["stok"].fillna(ort).tolist())\n',
        start: 'import pandas as pd\n\ndef grup_doldur(df):\n    yeni = df.copy()\n    eksik = yeni["gelir"].isna()\n    # TODO: grup medyanı (transform)\n    # TODO: önce grup, sonra genel medyanla doldur\n    # TODO: gelir_dolduruldu sütunu\n    return yeni\n',
        sol: 'import pandas as pd\n\ndef grup_doldur(df):\n    yeni = df.copy()\n    eksik = yeni["gelir"].isna()\n    grup = yeni.groupby("sehir")["gelir"].transform("median")\n    yeni["gelir"] = yeni["gelir"].fillna(grup).fillna(yeni["gelir"].median())\n    yeni["gelir_dolduruldu"] = eksik\n    return yeni\n',
        tests: 'import pandas as pd\nimport numpy as np\ndf = pd.DataFrame({"sehir": ["Ankara", "Ankara", "Ankara", "Bursa", "Van"], "gelir": [20000, np.nan, 30000, 50000, np.nan]})\nr = grup_doldur(df)\nassert r["gelir"].tolist() == [20000.0, 25000.0, 30000.0, 50000.0, 30000.0], f"Ankara eksiği 25000 (grup), Van eksiği 30000 (genel medyan) olmalı; gelen {r[\'gelir\'].tolist()}"\nassert r["gelir_dolduruldu"].tolist() == [False, True, False, False, True], "Doldurulan satırlar işaretlenmeli"\nassert df["gelir"].isna().sum() == 2, "Girdi değişmemeli"\n',
        hints: ['transform("median") orijinal satır sayısında Series döndürür.', 'fillna zincirlenebilir: s.fillna(grup).fillna(genel).', 'Genel medyan doldurmadan önceki sütundan hesaplanmalı: yeni["gelir"].median() fillna\'dan önce değerlendirilir.'],
        why: 'Grup bazlı doldurma şehirler arası farkı korur; tamamen boş grup için genel değere düşmek bir geri dönüş (fallback) kuralıdır. Bayrak sütunu, doldurulmuş değerlerin raporda ayırt edilmesini sağlar.' },
      { t: 'code',
        id: 'pandas-temizlik-x3',
        stage: 'Rehberli',
        diff: 2,
        needs: ['pandas'],
        q: '<p><code>gsm_duzelt(s)</code> fonksiyonu telefon metinlerinden oluşan Series\'i alsın; rakam dışı karakterleri silsin, başta <code>90</code> ya da <code>0</code> varsa atsın ve <code>5</code> ile başlayan 10 haneli cep numarasını döndürsün. Geçersiz olanlar NaN olsun.</p>',
        guide: ['str.replace(r"\\D", "", regex=True) ile rakam dışını sil.', 'str.extract ile ^(?:90|0)?(5\\d{9})$ desenini uygula.', 'extract DataFrame döndürür; [0] ile ilk grubun sütununu al.'],
        example: 'import pandas as pd\nplaka = pd.Series(["34 ABC 123", "06-xy-9"])\nprint(plaka.str.extract(r"^(\\d{2})")[0].tolist())\n',
        start: 'import pandas as pd\n\ndef gsm_duzelt(s):\n    rakam = s.str.replace(r"\\D", "", regex=True)\n    # TODO: extract ile 5XXXXXXXXX yakala\n    return rakam\n',
        sol: 'import pandas as pd\n\ndef gsm_duzelt(s):\n    rakam = s.str.replace(r"\\D", "", regex=True)\n    return rakam.str.extract(r"^(?:90|0)?(5\\d{9})$")[0]\n',
        tests: 'import pandas as pd\ns = pd.Series(["0532 111 22 33", "+90 (505) 444-5566", "5321112233", "212 555 00 00", "abc"])\nr = gsm_duzelt(s)\nassert r.iloc[:3].tolist() == ["5321112233", "5054445566", "5321112233"], f"İlk üç numara 10 haneye inmeli; gelen {r.iloc[:3].tolist()}"\nassert r.iloc[3:].isna().all(), "Sabit hat ve geçersiz metin NaN olmalı"\nassert len(r) == 5, "Uzunluk korunmalı"\n',
        hints: ['\\D rakam olmayan her karakterdir.', '(?:90|0)? yakalamayan, isteğe bağlı önek; (5\\d{9}) yakalanan kısım.', 'rakam.str.extract(r"^(?:90|0)?(5\\d{9})$")[0]'],
        why: 'Önce gürültüyü (boşluk, parantez, tire, +) silip sonra katı bir desenle doğrulamak, onlarca farklı yazımı tek biçime indirir. Uymayanlar NaN olur ve isna ile raporlanabilir.' },
      { t: 'code',
        id: 'pandas-temizlik-x4',
        stage: 'Kendin yaz',
        diff: 2,
        needs: ['pandas'],
        q: '<p><code>yas_dagilimi(yaslar)</code> bir yaş listesini <code>pd.cut</code> ile şu gruplara ayırsın: 0–17 <code>"çocuk"</code>, 18–34 <code>"genç"</code>, 35–64 <code>"orta"</code>, 65+ <code>"yaşlı"</code> (sınırlar dahil, 120\'ye kadar). Grup sırasını koruyan <code>{grup: adet}</code> sözlüğü döndürsün (adet olmayan grup 0).</p>',
        start: 'import pandas as pd\n\ndef yas_dagilimi(yaslar):\n    pass\n',
        sol: 'import pandas as pd\n\ndef yas_dagilimi(yaslar):\n    g = pd.cut(pd.Series(yaslar), bins=[-1, 17, 34, 64, 120], labels=["çocuk", "genç", "orta", "yaşlı"])\n    return {k: int(v) for k, v in g.value_counts(sort=False).items()}\n',
        tests: 'r = yas_dagilimi([5, 17, 18, 34, 35, 64, 65, 90])\nassert r == {"çocuk": 2, "genç": 2, "orta": 2, "yaşlı": 2}, f"Sınır yaşlar doğru gruba düşmeli; gelen {r}"\nassert list(r) == ["çocuk", "genç", "orta", "yaşlı"], "Grup sırası korunmalı"\nassert yas_dagilimi([40])["çocuk"] == 0, "Boş grup 0 görünmeli"\n',
        hints: ['Sağdan kapalı aralıklarda 0–17 için (-1, 17], 18–34 için (17, 34] kullan.', 'value_counts(sort=False) kategori sırasını korur ve boş kategorileri 0 ile gösterir.'],
        why: 'pd.cut sınırlarını sağdan kapalı düşünmek gerekir; "18 dahil" demek önceki sınırın 17 olması demektir. Kategorik sonuçta value_counts(sort=False) rapor sırasını korur.' },
      { t: 'code',
        id: 'pandas-temizlik-x5',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 2,
        needs: ['pandas'],
        q: '<p><b>Hatayı bul ve düzelt.</b> <code>adet_temizle(df)</code> metin olan <code>adet</code> sütununu sayıya çevirmeli; çevrilemeyenler eksik kalmalı ama sütun <b>tam sayı</b> kalmalı (eksik destekleyen <code>Int64</code>). Şu an <code>IntCastingNaNError</code> veriyor.</p>',
        start: 'import pandas as pd\n\ndef adet_temizle(df):\n    yeni = df.copy()\n    yeni["adet"] = pd.to_numeric(yeni["adet"], errors="coerce").astype(int)\n    return yeni\n',
        sol: 'import pandas as pd\n\ndef adet_temizle(df):\n    yeni = df.copy()\n    yeni["adet"] = pd.to_numeric(yeni["adet"], errors="coerce").astype("Int64")\n    return yeni\n',
        tests: 'import pandas as pd\ndf = pd.DataFrame({"adet": ["3", "yok", "5"]})\nr = adet_temizle(df)\nassert str(r["adet"].dtype) == "Int64", f"Tür Int64 olmalı; gelen {r[\'adet\'].dtype}"\nassert r["adet"].isna().tolist() == [False, True, False], "yok eksik kalmalı"\nassert int(r["adet"].sum()) == 8, "Toplam 8"\n',
        hints: ['NumPy int64 türü NaN tutamaz.', 'astype("Int64") (büyük I) pandas\'ın eksik destekleyen tam sayı türüdür.'],
        why: 'NaN bir float değeridir; numpy int sütununa giremez. Int64 (nullable) türü eksikleri pd.NA ile tutarken değerleri tam sayı bırakır.' },
      { t: 'code',
        id: 'pandas-temizlik-x6',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 2,
        needs: ['pandas'],
        q: '<p><b>Hatayı bul ve düzelt.</b> <code>tekil_musteri(df)</code> aynı e-postaya sahip müşterilerden ilkini tutmalı. Ama <code>"Ayse@Anadolu.com "</code> ile <code>"ayse@anadolu.com"</code> farklı sayılıyor. E-postayı (kırpılmış ve küçük harfli) normalize edip <code>email</code> sütununu bu haliyle döndür, index 0\'dan başlasın.</p>',
        start: 'import pandas as pd\n\ndef tekil_musteri(df):\n    return df.drop_duplicates(subset=["email"]).reset_index(drop=True)\n',
        sol: 'import pandas as pd\n\ndef tekil_musteri(df):\n    yeni = df.copy()\n    yeni["email"] = yeni["email"].str.strip().str.lower()\n    return yeni.drop_duplicates(subset=["email"], keep="first").reset_index(drop=True)\n',
        tests: 'import pandas as pd\ndf = pd.DataFrame({"ad": ["Ayşe", "Ayşe Y.", "Ali", "ALİ"], "email": ["Ayse@Anadolu.com ", "ayse@anadolu.com", "ali@x.com", " ALI@X.COM"]})\nr = tekil_musteri(df)\nassert r["ad"].tolist() == ["Ayşe", "Ali"], f"İki tekil müşteri kalmalı (ilkler); gelen {r[\'ad\'].tolist()}"\nassert r["email"].tolist() == ["ayse@anadolu.com", "ali@x.com"], "E-postalar normalize edilmiş olmalı"\nassert r.index.tolist() == [0, 1], "Index 0\'dan başlamalı"\nassert df["email"].iloc[0] == "Ayse@Anadolu.com ", "Girdi değişmemeli"\n',
        hints: ['drop_duplicates birebir eşitlik arar; önce anahtarı normalize et.', 'str.strip().str.lower() sonra drop_duplicates(subset=["email"]).'],
        why: 'Tekilleştirme anahtarı normalize edilmeden yapılırsa büyük-küçük harf ve boşluk farkları kopyaları gizler. Önce anahtarı standartlaştır, sonra tekilleştir.' },
      { t: 'code',
        id: 'pandas-temizlik-x7',
        stage: 'Meydan okuma',
        diff: 3,
        needs: ['pandas'],
        q: '<p>Anadolu Market sipariş dökümü için <code>temizle(df)</code> yaz. Girdi sütunları: <code>siparis_id</code>, <code>sehir</code>, <code>tutar</code> (metin, ör. <code>"1.250,50 TL"</code>). Kurallar: (1) şehir kırpılıp Türkçe-güvenli küçültülsün ve <code>SEHIR</code> sözlüğüyle standart ada çevrilsin, eşleşmeyen <code>"Diğer"</code> olsun; (2) tutar float\'a çevrilsin, çevrilemeyen satırlar atılsın; (3) aynı <code>siparis_id</code>\'den <b>sonuncusu</b> kalsın; (4) <code>siparis_id</code>\'ye göre sıralanıp index sıfırlansın. Girdi değişmesin.</p>',
        start: 'import pandas as pd\n\nSEHIR = {"istanbul": "İstanbul", "ankara": "Ankara", "izmir": "İzmir", "ısparta": "Isparta"}\n\ndef temizle(df):\n    pass\n',
        sol: 'import pandas as pd\n\nSEHIR = {"istanbul": "İstanbul", "ankara": "Ankara", "izmir": "İzmir", "ısparta": "Isparta"}\nTR = str.maketrans({"İ": "i", "I": "ı"})\n\ndef temizle(df):\n    d = df.copy()\n    anahtar = d["sehir"].str.strip().str.translate(TR).str.lower()\n    d["sehir"] = anahtar.map(SEHIR).fillna("Diğer")\n    metin = (d["tutar"].str.replace("TL", "", regex=False).str.strip()\n             .str.replace(".", "", regex=False).str.replace(",", ".", regex=False))\n    d["tutar"] = pd.to_numeric(metin, errors="coerce")\n    d = d.dropna(subset=["tutar"])\n    d = d.drop_duplicates(subset=["siparis_id"], keep="last")\n    return d.sort_values("siparis_id").reset_index(drop=True)\n',
        tests: 'import pandas as pd\ndf = pd.DataFrame({\n    "siparis_id": [3, 1, 2, 1, 4, 5],\n    "sehir": [" İZMİR", "ankara", "ISPARTA ", "Ankara", "Mars", "istanbul"],\n    "tutar": ["1.250,50 TL", "100,00 TL", "80 TL", "120,00 TL", "50,00 TL", "bilinmiyor"],\n})\nr = temizle(df)\nassert r["siparis_id"].tolist() == [1, 2, 3, 4], f"5 (tutarsız) atılmalı, 1\'in sonuncusu kalmalı; gelen {r[\'siparis_id\'].tolist()}"\nassert r["sehir"].tolist() == ["Ankara", "Isparta", "İzmir", "Diğer"], f"Şehirler: {r[\'sehir\'].tolist()}"\nassert r["tutar"].tolist() == [120.0, 80.0, 1250.5, 50.0], f"Tutarlar: {r[\'tutar\'].tolist()}"\nassert r.index.tolist() == [0, 1, 2, 3], "Index sıfırlanmalı"\nassert df["tutar"].iloc[0] == "1.250,50 TL", "Girdi değişmemeli"\n',
        hints: ['Şehir: strip → translate({"İ": "i", "I": "ı"}) → lower → map(SEHIR) → fillna("Diğer").', 'Tutar: "TL" sil, binlik noktayı sil, virgülü noktaya çevir, to_numeric(errors="coerce"), sonra dropna(subset=["tutar"]).', 'Sıra önemli: geçersiz tutarlı satırları atmadan tekilleştirirsen geçerli bir kayıt kaybolabilir mi, düşün.'],
        why: 'Gerçek temizlik fonksiyonu birkaç küçük adımın doğru sırayla birleşimidir. Türkçe-güvenli küçültme, eşleme sözlüğü, güvenli sayı dönüşümü ve iş anahtarına göre tekilleştirme; hepsi girdiyi değiştirmeden yeni tablo üretir.' }
    ],
    faq: [
      { q: 'replace ile map arasında ne fark var?',
        a: 'replace yalnızca sözlükte geçen değerleri değiştirir, kalanlara dokunmaz. map tüm değerleri sözlükten çevirir; sözlükte olmayan NaN olur. Eşleşmeyenleri yakalamak istiyorsan map + isna, birkaç düzeltme yapacaksan replace kullan.' },
      { q: 'Eksikleri ffill ile mi, interpolate ile mi, ortalamayla mı doldurmalıyım?',
        a: 'Verinin doğasına bak: stok, fiyat, kur gibi "son değer geçerlidir" verilerde ffill; sıcaklık, sensör gibi düzgün değişen ölçümlerde interpolate; zaman sırası olmayan özelliklerde (gelir, yaş) grup medyanı. Hangisini seçersen seç, kaç değer doldurduğunu raporla.' }
    ],
    mistakes: [
      { bad: 's.str.lower().map({"izmir": "İzmir"})',
        good: 's.str.translate(str.maketrans({"İ": "i", "I": "ı"})).str.lower().map({"izmir": "İzmir"})',
        why: '"İZMİR".lower() i + birleşen nokta üretir ve sözlükle eşleşmez; Türkçe harfleri küçültmeden önce çevir.' },
      { bad: 'df["adet"] = pd.to_numeric(df["adet"], errors="coerce").astype(int)',
        good: 'df["adet"] = pd.to_numeric(df["adet"], errors="coerce").astype("Int64")',
        why: 'coerce ile oluşan NaN numpy int\'e çevrilemez; eksik destekleyen Int64 türünü kullan.' }
    ]
  }
);
})(window);
