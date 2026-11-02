/* PythonPatika — v2 e7 uzantı (Derinleş): veri-boru-hatti */
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
{
  id: 'veri-boru-hatti',
  min: 35,
  html: `
<h2>Tam yükleme mi, artımlı yükleme mi?</h2>
<p>Derste her gün gelen dosyayı yükledin. Kaynak bir veritabanı ya da API olduğunda iki yol var: her gece tüm tabloyu çekmek (<b>tam yükleme</b>, full load) ya da yalnız son çalıştırmadan beri değişenleri çekmek (<b>artımlı yükleme</b>, incremental load). Küçük tablolarda tam yükleme basit ve güvenlidir. Milyonlarca satırda artımlı yükleme şarttır; bunun için bir <b>su seviyesi işareti</b> (watermark, high-water mark) tutulur: "en son hangi <code>guncellenme</code> zamanına kadar aldım?"</p>
<div class="tbl-wrap"><table>
<tr><th>Yöntem</th><th>Nasıl?</th><th>Artısı</th><th>Dikkat</th></tr>
<tr><td>Tam yükleme</td><td>Hedefi boşalt, hepsini yükle</td><td>Basit, silinen kayıtlar da yansır</td><td>Yavaş; yüklerken tablo boş kalmasın (geçici tablo + yer değiştir)</td></tr>
<tr><td>Artımlı (watermark)</td><td><code>WHERE guncellenme &gt; :son</code></td><td>Hızlı, kaynağa az yük</td><td>Kaynakta silinen satırları görmez; aynı zaman damgasındaki satırlar kaçabilir</td></tr>
<tr><td>Değişiklik yakalama (CDC)</td><td>Veritabanı günlüğünden ekle/güncelle/sil olaylarını oku</td><td>Silmeler dahil her değişiklik</td><td>Ek altyapı (Debezium vb.)</td></tr>
<tr><td>Yavaş değişen boyut (SCD 2)</td><td>Değişen kaydı kapat, yeni sürüm aç</td><td>Geçmiş korunur ("Mart'ta müşteri hangi şehirdeydi?")</td><td>Sorgular geçerlilik tarihini hesaba katmalı</td></tr>
</table></div>
<p>Watermark'ı yalnızca yükleme <b>başarıyla bittikten sonra</b> ilerlet; aksi hâlde yarım kalan çalıştırmanın kayıtları sonsuza kadar kaçar. Aynı zaman damgasına sahip satırlar için <code>(guncellenme, id)</code> çiftini watermark olarak tutmak ya da <code>&gt;=</code> ile çekip upsert ile tekrarları zararsız yapmak iki yaygın çözümdür.</p>
<pre class="py">import sqlite3, json

kaynak = sqlite3.connect(":memory:")
kaynak.execute("CREATE TABLE musteri(id INTEGER PRIMARY KEY, sehir TEXT, guncellenme TEXT)")
kaynak.executemany("INSERT INTO musteri VALUES (?,?,?)", [
    (1, "İzmir", "2024-05-01T10:00"), (2, "Bursa", "2024-05-01T12:00"),
    (3, "Ankara", "2024-05-02T09:00")])

durum = {"watermark": "2024-05-01T11:00"}          # gerçekte dosya/tabloda saklanır

def artimli_cek(con, son):
    return con.execute("SELECT id, sehir, guncellenme FROM musteri "
                       "WHERE guncellenme &gt; ? ORDER BY guncellenme", (son,)).fetchall()

yeni = artimli_cek(kaynak, durum["watermark"])
print("çekilen:", [r[0] for r in yeni])
# ... yükleme başarılı olduktan SONRA:
if yeni:
    durum["watermark"] = yeni[-1][2]
print(json.dumps(durum))
</pre>

<h2>Büyük dosyalar: akış ve parti</h2>
<p>10 GB'lık bir CSV'yi <code>list(csv.DictReader(f))</code> ile belleğe almak sunucuyu düşürür. Üreteçlerle (iteratorler-uretecler dersi) her adım bir sonrakine satır satır akar; bellekte aynı anda yalnız bir parti durur. Veritabanına da satır satır değil <b>parti parti</b> (batch) yazılır: <code>executemany</code> ile 500-5000 satırlık partiler, her parti bir işlem (transaction) içinde. Python 3.12'deki <code>itertools.batched</code> bu işi tek satıra indirir.</p>
<pre class="py">import csv, io, sqlite3
from itertools import batched

ham = "no,tutar\\n" + "\\n".join(f"{i},{i * 1.5}" for i in range(1, 2501))

def oku(metin):                       # gerçekte: open(yol, newline="", encoding="utf-8")
    yield from csv.DictReader(io.StringIO(metin))

def donustur(satirlar):
    for s in satirlar:
        yield int(s["no"]), round(float(s["tutar"]) * 100)     # kuruş

con = sqlite3.connect(":memory:")
con.execute("CREATE TABLE satis(no INTEGER PRIMARY KEY, tutar_kurus INTEGER)")
parti_sayisi = 0
for parti in batched(donustur(oku(ham)), 1000):
    with con:                          # her parti ayrı işlem: ya hep ya hiç
        con.executemany("INSERT OR REPLACE INTO satis VALUES (?, ?)", parti)
    parti_sayisi += 1
print(parti_sayisi, "parti,", con.execute("SELECT COUNT(*), SUM(tutar_kurus) FROM satis").fetchone())
</pre>
<div class="tip"><b>pandas ile parça parça</b>pandas kullanıyorsan aynı fikir <code>pd.read_csv(yol, chunksize=100_000)</code> ile gelir: her döngüde bir DataFrame parçası alırsın. Sütunlu ve sıkıştırılmış biçim için ara katmanda CSV yerine Parquet kullan (<code>pip install pyarrow</code>, <code>df.to_parquet("satis.parquet")</code>); hem 5-10 kat küçük hem tipleri korur. Kurulumda <code>pyarrow</code> tekerleği bulunamazsa Python sürümünün desteklendiğini kontrol et ve pip'i güncelle: <code>python -m pip install -U pip</code>.</div>

<h2>Veri kalitesi kapıları</h2>
<p>Boru hattı hata vermeden bitti diye veri doğru değildir. Kaynak sistem bir gece sütun sırasını değiştirir, tutarlar kuruş yerine lira gelir ya da dosya yarım kesilir. Yükleme sonrası (ya da yayına almadan önce) küçük kontroller çalıştır ve eşik aşılırsa işi <b>başarısız</b> say:</p>
<ul>
<li><b>Satır sayısı mutabakatı:</b> kaynaktaki satır = yüklenen + reddedilen. Fark varsa satır kaybolmuştur.</li>
<li><b>Boşluk oranı:</b> zorunlu sütunda <code>None</code> oranı eşiğin (ör. %1) üstündeyse dur.</li>
<li><b>Tekillik:</b> anahtar sütunda tekrar olmamalı.</li>
<li><b>Aralık ve küme:</b> tutar 0 ile makul bir üst sınır arasında, şehir bilinen listede.</li>
<li><b>Tazelik:</b> en yeni kaydın tarihi beklenen iş gününden eski olmamalı.</li>
<li><b>Hacim:</b> bugünkü satır sayısı son 7 günün ortalamasının yarısından azsa kaynakta sorun olabilir.</li>
</ul>
<p>Bu kontroller büyüyünce Great Expectations, Soda ya da dbt testleri gibi araçlara taşınır (<i>orkestrasyon</i> dersindeki kalite kapıları); fikir aynıdır.</p>

<h2>Atomik yazma ve dosya parmak izi</h2>
<p>Çıktı dosyasını doğrudan hedef ada yazarken iş yarıda kesilirse, sonraki adım <b>yarım bir dosya</b> okur. Doğru yol: önce aynı klasörde geçici bir dosyaya yaz, tamamlanınca <code>os.replace(gecici, hedef)</code> ile adını değiştir. Aynı dosya sistemi içinde ad değiştirme atomiktir: okuyan ya eski dosyayı ya yeni dosyayı görür, yarısını asla. Gelen dosyalar için de <b>parmak izi</b> (SHA-256 özeti) tut: aynı içerik farklı adla ikinci kez gelirse tanırsın.</p>
<pre class="py">import hashlib, os, tempfile
from pathlib import Path

def atomik_yaz(yol: Path, metin: str) -&gt; None:
    fd, gecici = tempfile.mkstemp(dir=yol.parent, suffix=".tmp")
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            f.write(metin)
            f.flush()
            os.fsync(f.fileno())       # diske gerçekten yazıldığından emin ol
        os.replace(gecici, yol)        # atomik ad değiştirme
    except BaseException:
        os.unlink(gecici)
        raise

def parmak_izi(yol: Path) -&gt; str:
    h = hashlib.sha256()
    with open(yol, "rb") as f:
        for parca in iter(lambda: f.read(65536), b""):
            h.update(parca)
    return h.hexdigest()

klasor = Path("etl_cikti"); klasor.mkdir(exist_ok=True)
atomik_yaz(klasor / "rapor.csv", "sehir,ciro\\nİzmir,1250\\n")
atomik_yaz(klasor / "rapor_kopya.csv", "sehir,ciro\\nİzmir,1250\\n")
print(parmak_izi(klasor / "rapor.csv") == parmak_izi(klasor / "rapor_kopya.csv"))
print(sorted(p.name for p in klasor.iterdir()))
</pre>
<div class="warn"><b>Windows ve ağ sürücüleri</b><code>os.replace</code> aynı dosya sistemi içinde atomiktir; geçici dosyayı hedefle <b>aynı klasörde</b> oluşturmanın nedeni budur (<code>/tmp</code> başka bir diskte olabilir). Windows'ta hedef dosya başka bir programda (ör. Excel'de) açıksa <code>PermissionError</code> alırsın; raporu açık tutan kullanıcılar için yeniden deneme ya da tarihli dosya adı kullan.</div>
<div class="note"><b>Gerçek işte</b>Veri ekiplerinde en pahalı hatalar sessiz olanlardır: iş "başarılı" biter ama yarım dosya, kaçan artımlı kayıtlar ya da iki kez yüklenen bir gün raporlara girer ve haftalar sonra fark edilir. Her çalıştırmanın sonunda bir özet satırı logla (kaynak satır, yüklenen, reddedilen, watermark, süre) ve kalite kapılarından biri kırmızıysa işi başarısız say. "Sessiz başarı" yerine "gürültülü başarısızlık" tercih edilir.</div>
`,
  ex: [
    { t: 'mc', stage: 'Isınma', q: 'Artımlı yüklemede watermark değerini ne zaman ilerletmelisin?', o: [
        'Kaynaktan veriyi çekmeden hemen önce, şimdiki saate',
        'Yükleme başarıyla bitince, yüklenen en büyük değere',
        'Veri çekilir çekilmez, yükleme daha başlamadan önce',
        'Her gece sabit saatte, yüklemenin sonucundan bağımsız'
      ], a: 1, why: 'Watermark "buraya kadar güvenle aldım" demektir. Yükleme yarıda kalırsa ve watermark önceden ilerletildiyse o kayıtlar bir daha çekilmez. Ayrıca şimdiki saat yerine yüklenen verideki en büyük değer kullanılır; saat farkları kayıp yaratmaz.' },
    { t: 'mc', stage: 'Isınma', q: 'Rapor dosyasını önce aynı klasörde geçici bir dosyaya yazıp sonra <code>os.replace</code> ile hedef ada taşımanın amacı nedir?', o: [
        'Dosyayı sıkıştırarak disk alanından tasarruf etmek',
        'Okuyanın hiçbir zaman yarım yazılmış bir dosya görmemesini sağlamak',
        'Dosyanın içeriğini şifreleyip yetkisiz erişimi engellemek',
        'Yazma hızını artırmak için işletim sistemi önbelleğini atlamak'
      ], a: 1, why: 'Aynı dosya sistemi içinde ad değiştirme atomiktir: hedef ya eski içeriği ya da tamamlanmış yeni içeriği gösterir. Yazma yarıda kesilirse yalnız geçici dosya bozuk kalır.' },
    { t: 'predict', stage: 'Kodu oku', q: 'Bu kod ne yazdırır?', code: 'def oku():\n    for s in ["10", "x", "30"]:\n        print("oku", s)\n        yield s\n\ndef temizle(satirlar):\n    for s in satirlar:\n        if s.isdigit():\n            yield int(s)\n\nhat = temizle(oku())\nprint("hazır")\nprint(next(hat))\n', o: ['hazır\noku 10\n10', 'oku 10\noku x\noku 30\nhazır\n10', 'hazır\noku 10\noku x\noku 30\n10', 'oku 10\nhazır\n10'], a: 0, why: 'Üreteç hattı tembeldir: temizle(oku()) hiçbir satırı okumaz, yalnızca hattı kurar. next() ilk değeri isteyince oku yalnız bir satır üretir; 10 geçerli olduğundan hemen döner.' },
    { t: 'predict', stage: 'Kodu oku', q: 'Bu kod ne yazdırır?', code: 'from itertools import batched\n\nsatirlar = range(1, 8)\nprint([len(p) for p in batched(satirlar, 3)], list(batched("ab", 3)))\n', o: ['[3, 3, 1] [(\'a\', \'b\')]', '[3, 3, 3] [(\'a\', \'b\', None)]', '[3, 3] []', '[3, 3, 1] [[\'a\', \'b\']]'], a: 0, why: 'batched son partiyi eksik de olsa verir ve doldurmaz; partiler demettir. 7 eleman 3\'erli: 3, 3, 1.' },
    { t: 'predict', stage: 'Kodu oku', q: 'Bu kod ne yazdırır?', code: 'kayitlar = [\n    {"id": 1, "zaman": "09:00"}, {"id": 2, "zaman": "10:00"},\n    {"id": 3, "zaman": "10:00"}, {"id": 4, "zaman": "11:00"},\n]\nilk_cekilen = [k for k in kayitlar[:2] if k["zaman"] > "08:00"]\nwatermark = ilk_cekilen[-1]["zaman"]\nikinci = [k["id"] for k in kayitlar if k["zaman"] > watermark]\nprint(watermark, ikinci)\n', o: ['10:00 [4]', '10:00 [3, 4]', '09:00 [2, 3, 4]', '11:00 []'], a: 0, why: 'İlk çalıştırmada id 3 henüz kaynağa gelmemişti; watermark 10:00 oldu. İkinci çalıştırmada > 10:00 koşulu aynı zaman damgalı id 3\'ü atlar: klasik artımlı yükleme kaybı. (zaman, id) çifti ya da >= + upsert bunu çözer.' },
    { t: 'order', stage: 'Kodu oku', q: '<p>Rapor dosyasını atomik olarak yazan programın satırlarını sırala.</p>', lines: [
        'import os',
        'from pathlib import Path',
        'hedef = Path("ciro.csv")',
        'gecici = hedef.with_suffix(".tmp")',
        'gecici.write_text("sehir,ciro\\nİzmir,1250\\n", encoding="utf-8")',
        'os.replace(gecici, hedef)',
        'print(hedef.read_text(encoding="utf-8").splitlines()[1], gecici.exists())'
      ], expect: 'İzmir,1250 False\n', hint: 'Önce geçici dosyaya yaz, sonra adını değiştir, en son kontrol et.', why: 'İçerik tamamen geçici dosyaya yazıldıktan sonra tek bir os.replace çağrısıyla yerine konur; geçici dosya artık yoktur.' },
    { t: 'code', stage: 'Rehberli', id: 'veri-boru-hatti-x1', diff: 2, q: '<p>Kayıpsız artımlı çekme. <code>artimli_cek(kayitlar, watermark)</code> yaz: <code>kayitlar</code> <code>{"id": int, "guncellenme": str}</code> sözlüklerinden oluşur (ISO metin, sıralanabilir); <code>watermark</code> <code>None</code> ya da <code>(guncellenme, id)</code> demeti. <code>(guncellenme, id)</code> çifti watermark\'tan <b>büyük</b> olan kayıtları bu çifte göre sıralı döndür ve yeni watermark\'ı (son kaydın çifti; yeni kayıt yoksa eskisi) ver: dönüş <code>(yeni_kayitlar, yeni_watermark)</code>. Aynı zaman damgasındaki geç gelen kayıtlar kaçmamalı, hiçbir kayıt iki kez gelmemeli.</p>', guide: [
        'Her kayıt için anahtar = (k["guncellenme"], k["id"]) demetini kullan.',
        'watermark None ise tüm kayıtlar yeni sayılır.',
        'Demet karşılaştırması önce zamanı, eşitse id\'yi karşılaştırır: anahtar > watermark.',
        'Süzülen kayıtları anahtara göre sırala.',
        'Yeni watermark son kaydın anahtarı; liste boşsa eski watermark.'
      ], example: 'olaylar = [("10:00", 3), ("09:00", 7), ("10:00", 1)]\nprint(sorted(olaylar))\nprint([o for o in olaylar if o > ("10:00", 1)])\n', start: 'def artimli_cek(kayitlar, watermark):\n    # TODO: (guncellenme, id) anahtarıyla süz ve sırala\n    yeni = [k for k in kayitlar]\n    return yeni, watermark\n', sol: 'def artimli_cek(kayitlar, watermark):\n    anahtar = lambda k: (k["guncellenme"], k["id"])\n    yeni = sorted((k for k in kayitlar if watermark is None or anahtar(k) > tuple(watermark)), key=anahtar)\n    return yeni, (anahtar(yeni[-1]) if yeni else watermark)\n', tests: 'kaynak = [{"id": 1, "guncellenme": "2024-05-01T09:00"}, {"id": 2, "guncellenme": "2024-05-01T10:00"}]\nilk, wm = artimli_cek(kaynak, None)\nassert [k["id"] for k in ilk] == [1, 2] and wm == ("2024-05-01T10:00", 2), "İlk çalıştırma her şeyi almalı"\nkaynak += [{"id": 3, "guncellenme": "2024-05-01T10:00"}, {"id": 4, "guncellenme": "2024-05-01T11:00"}, {"id": 0, "guncellenme": "2024-05-01T10:00"}]\nikinci, wm2 = artimli_cek(kaynak, wm)\nassert [k["id"] for k in ikinci] == [3, 4], f"Aynı zaman damgalı geç gelen id 3 kaçmamalı, id 0 (daha küçük id) ve 1-2 tekrar gelmemeli; gelen {[k[\'id\'] for k in ikinci]}"\nassert wm2 == ("2024-05-01T11:00", 4)\nassert artimli_cek(kaynak, wm2) == ([], wm2), "Yeni kayıt yoksa watermark değişmemeli"\nassert artimli_cek(kaynak, ["2024-05-01T10:00", 2])[1] == ("2024-05-01T11:00", 4), "JSON\'dan liste olarak okunan watermark da çalışmalı"\n', hints: [
        'Python demetleri sözlük sırasıyla karşılaştırır: ("10:00", 3) > ("10:00", 2) True.',
        'Watermark JSON\'dan okununca liste olabilir; tuple(watermark) ile demete çevir.',
        'yeni = sorted((k for k in kayitlar if watermark is None or anahtar(k) > tuple(watermark)), key=anahtar)'
      ], why: 'Bileşik watermark aynı zaman damgasını paylaşan kayıtları id ile ayırır. Not: id\'si daha küçük olup sonradan gelen kayıt (testteki id 0) yine kaçar; kaynağın id\'leri artan veriyorsa sorun olmaz, vermiyorsa >= + upsert ya da CDC gerekir.' },
    { t: 'code', stage: 'Rehberli', id: 'veri-boru-hatti-x2', diff: 2, q: '<p>Kalite kapısı. <code>kalite_kontrol(satirlar, kaynak_sayisi, reddedilen) -&gt; list[str]</code> yaz; <code>satirlar</code> yüklenen <code>{"no", "sehir", "tutar"}</code> sözlükleri. Başarısız her kontrol için listeye bir mesaj ekle (bu sırayla):</p><ol><li><code>len(satirlar) + reddedilen != kaynak_sayisi</code> → <code>"mutabakat: kaynak=K yüklenen=Y reddedilen=R"</code></li><li>Tekrarlanan <code>no</code> varsa → <code>"tekillik: no tekrarı [..]"</code> (tekrar eden no\'lar sıralı liste)</li><li><code>sehir</code> None ya da boş olanların oranı %1\'den büyükse → <code>"boşluk: sehir %X"</code> (X tek ondalıklı yüzde, ör. %2.5)</li><li><code>tutar</code> 0\'dan küçük ya da 1_000_000\'dan büyükse → <code>"aralık: tutar N satır"</code></li></ol><p>Boş liste her şeyin yolunda olduğu anlamına gelir.</p>', guide: [
        'Önce mutabakat: üç sayıyı karşılaştır.',
        'collections.Counter ile no sayılarını çıkar, sayısı 1\'den büyük olanları sırala.',
        'Boş şehir sayısını say, oranı len(satirlar)\'a böl (boş listede bölme yapma).',
        'Aralık dışı tutarları say.',
        'Mesajları sırasıyla listeye ekle.'
      ], example: 'from collections import Counter\n\nkodlar = ["A", "B", "A", "C", "B", "A"]\nprint(sorted(k for k, n in Counter(kodlar).items() if n > 1))\nprint(f"%{2 / 80 * 100:.1f}")\n', start: 'from collections import Counter\n\ndef kalite_kontrol(satirlar, kaynak_sayisi, reddedilen):\n    hatalar = []\n    # TODO: mutabakat\n    # TODO: tekillik\n    # TODO: boşluk oranı\n    # TODO: aralık\n    return hatalar\n', sol: 'from collections import Counter\n\ndef kalite_kontrol(satirlar, kaynak_sayisi, reddedilen):\n    hatalar = []\n    y = len(satirlar)\n    if y + reddedilen != kaynak_sayisi:\n        hatalar.append(f"mutabakat: kaynak={kaynak_sayisi} yüklenen={y} reddedilen={reddedilen}")\n    tekrar = sorted(no for no, n in Counter(s["no"] for s in satirlar).items() if n > 1)\n    if tekrar:\n        hatalar.append(f"tekillik: no tekrarı {tekrar}")\n    if y:\n        bos = sum(1 for s in satirlar if not s.get("sehir"))\n        if bos / y > 0.01:\n            hatalar.append(f"boşluk: sehir %{bos / y * 100:.1f}")\n    disarida = sum(1 for s in satirlar if not (0 <= s["tutar"] <= 1_000_000))\n    if disarida:\n        hatalar.append(f"aralık: tutar {disarida} satır")\n    return hatalar\n', tests: 'iyi = [{"no": i, "sehir": "İzmir", "tutar": 100} for i in range(200)]\nassert kalite_kontrol(iyi, 203, 3) == [], "Temiz veri için boş liste"\nassert kalite_kontrol(iyi, 210, 3) == ["mutabakat: kaynak=210 yüklenen=200 reddedilen=3"]\nkotu = iyi + [{"no": 5, "sehir": "", "tutar": -1}, {"no": 7, "sehir": None, "tutar": 2_000_000}, {"no": 5, "sehir": None, "tutar": 10}]\nassert kalite_kontrol(kotu, 203, 0) == ["tekillik: no tekrarı [5, 7]", "boşluk: sehir %1.5", "aralık: tutar 2 satır"], f"Gelen: {kalite_kontrol(kotu, 203, 0)}"\nazbos = iyi + [{"no": 999, "sehir": None, "tutar": 1}]\nassert kalite_kontrol(azbos, 201, 0) == [], "%0.5 boşluk eşiğin altında"\nassert kalite_kontrol([], 0, 0) == [], "Boş yüklemede bölme hatası olmamalı"\n', hints: [
        'Counter(s["no"] for s in satirlar) her numaranın kaç kez geçtiğini verir.',
        'not s.get("sehir") hem None hem boş metni yakalar.',
        'Oran için önce len(satirlar) sıfır değil mi diye bak.'
      ], why: 'Bu kontroller sessiz veri hatalarını sabah raporlarına girmeden yakalar; orkestrasyon aracında başarısız bir kalite görevi sonraki adımların çalışmasını durdurur.' },
    { t: 'code', stage: 'Rehberli', id: 'veri-boru-hatti-x3', diff: 2, q: '<p>Parti parti yükleme. <code>toplu_yukle(con, satirlar, parti=500) -&gt; int</code> yaz: <code>satirlar</code> <code>(no, sehir, tutar_kurus)</code> demetleri üreten bir yineleyici (liste olmayabilir, belleğe toplama). <code>satis(no INTEGER PRIMARY KEY, sehir TEXT, tutar_kurus INTEGER)</code> tablosuna <code>INSERT OR REPLACE</code> ile <code>parti</code> büyüklüğünde gruplar hâlinde <code>executemany</code> ile yazsın; her parti <code>with con:</code> ile ayrı işlem olsun. Yazılan toplam satır sayısını döndürsün.</p>', guide: [
        'itertools.batched(satirlar, parti) yineleyiciyi demet partilerine böler.',
        'Her parti için with con: bloğu aç.',
        'Blokta con.executemany("INSERT OR REPLACE INTO satis VALUES (?, ?, ?)", p) çağır.',
        'Sayacı len(p) kadar artır ve sonunda döndür.'
      ], example: 'from itertools import batched\n\ndef sayilar():\n    yield from range(1, 8)\n\nfor p in batched(sayilar(), 3):\n    print(p, sum(p))\n', start: 'from itertools import batched\n\ndef toplu_yukle(con, satirlar, parti=500):\n    toplam = 0\n    # TODO: batched ile partilere böl, her partiyi with con: içinde executemany ile yaz\n    return toplam\n', sol: 'from itertools import batched\n\ndef toplu_yukle(con, satirlar, parti=500):\n    toplam = 0\n    for p in batched(satirlar, parti):\n        with con:\n            con.executemany("INSERT OR REPLACE INTO satis VALUES (?, ?, ?)", p)\n        toplam += len(p)\n    return toplam\n', tests: 'import sqlite3\nclass Izci:\n    def __init__(self, con):\n        self.con, self.cagri = con, []\n    def executemany(self, sql, veri):\n        veri = list(veri); self.cagri.append(len(veri))\n        return self.con.executemany(sql, veri)\n    def __enter__(self):\n        return self.con.__enter__()\n    def __exit__(self, *a):\n        return self.con.__exit__(*a)\ncon = sqlite3.connect(":memory:")\ncon.execute("CREATE TABLE satis(no INTEGER PRIMARY KEY, sehir TEXT, tutar_kurus INTEGER)")\niz = Izci(con)\nuretec = ((i, "İzmir", i * 100) for i in range(1, 1201))\nassert toplu_yukle(iz, uretec, parti=500) == 1200, "1200 satır yazılmalı"\nassert iz.cagri == [500, 500, 200], f"Partiler 500, 500, 200 olmalı; gelen {iz.cagri}"\nassert con.execute("SELECT COUNT(*), SUM(tutar_kurus) FROM satis").fetchone() == (1200, 72060000)\nassert toplu_yukle(iz, iter([(1, "Bursa", 5)]), parti=500) == 1 and con.execute("SELECT sehir FROM satis WHERE no=1").fetchone() == ("Bursa",), "Yeniden yükleme upsert yapmalı"\nassert toplu_yukle(iz, iter([])) == 0\n', hints: [
        'Python 3.12+ itertools.batched kullan; liste oluşturmadan yineleyiciyi tüketir.',
        'with con: bloğu başarıyla biterse commit, hata olursa rollback yapar.',
        'for p in batched(satirlar, parti): with con: con.executemany(...)'
      ], why: 'Satır satır INSERT + her satırda commit, binlerce kat yavaştır. Parti başına bir işlem hem hızlıdır hem de hata olduğunda yalnız o parti geri alınır.' },
    { t: 'code', stage: 'Kendin yaz', id: 'veri-boru-hatti-x4', diff: 2, q: '<p><code>atomik_yaz(yol: Path, metin: str) -&gt; None</code> yaz: metni önce <b>hedefle aynı klasörde</b> geçici bir dosyaya (UTF-8) yazsın, sonra <code>os.replace</code> ile hedef ada taşısın. Yazma sırasında hata olursa geçici dosya silinsin, hedef dosya (varsa) eski içeriğiyle kalsın ve hata yükselsin. İşlem bitince klasörde geçici dosya kalmamalı.</p>', start: 'import os, tempfile\nfrom pathlib import Path\n\ndef atomik_yaz(yol, metin):\n    yol.write_text(metin, encoding="utf-8")\n', sol: 'import os, tempfile\nfrom pathlib import Path\n\ndef atomik_yaz(yol, metin):\n    yol = Path(yol)\n    fd, gecici = tempfile.mkstemp(dir=yol.parent, suffix=".tmp")\n    try:\n        with os.fdopen(fd, "w", encoding="utf-8") as f:\n            f.write(metin)\n        os.replace(gecici, yol)\n    except BaseException:\n        if os.path.exists(gecici):\n            os.unlink(gecici)\n        raise\n', tests: 'from pathlib import Path\nimport os\nk = Path("atomik_test"); k.mkdir(exist_ok=True)\nfor p in k.iterdir(): p.unlink()\nhedef = k / "rapor.csv"\natomik_yaz(hedef, "sehir,ciro\\nİzmir,1250\\n")\nassert hedef.read_text(encoding="utf-8") == "sehir,ciro\\nİzmir,1250\\n"\nclass Bozuk(str):\n    def __str__(self): raise RuntimeError("x")\ncagrilar = []\ngercek_replace = os.replace\ndef izle(a, b):\n    cagrilar.append((os.path.dirname(os.path.abspath(a)), os.path.abspath(b)))\n    return gercek_replace(a, b)\nos.replace = izle\ntry:\n    atomik_yaz(hedef, "sehir,ciro\\nBursa,90\\n")\nfinally:\n    os.replace = gercek_replace\nassert cagrilar and cagrilar[0][0] == os.path.abspath(k), "Geçici dosya hedefle aynı klasörde olmalı ve os.replace kullanılmalı"\nassert hedef.read_text(encoding="utf-8").endswith("Bursa,90\\n")\ntry:\n    atomik_yaz(hedef, 12345)\n    raise AssertionError("str olmayan içerik hata vermeli")\nexcept TypeError:\n    pass\nassert hedef.read_text(encoding="utf-8").endswith("Bursa,90\\n"), "Hata olunca hedef eski içeriğini korumalı"\nassert sorted(p.name for p in k.iterdir()) == ["rapor.csv"], f"Geçici dosya kalmamalı: {sorted(p.name for p in k.iterdir())}"\n', hints: [
        'tempfile.mkstemp(dir=yol.parent) aynı klasörde benzersiz bir geçici dosya oluşturur; (fd, yol) döndürür.',
        'Hata durumunda except bloğunda os.unlink(gecici) çağırıp raise ile yeniden fırlat.'
      ], why: 'Raporu okuyan başka bir süreç (ya da kullanıcı) hiçbir zaman yarım dosya görmez; çökme sonrası en kötü ihtimalle eski rapor durur.' },
    { t: 'code', stage: 'Kendin yaz', id: 'veri-boru-hatti-x5', diff: 2, q: '<p>Aynı içeriğin iki kez yüklenmesini engelle. <code>yeni_dosyalar(klasor: Path, manifest: dict) -&gt; list[Path]</code> yaz: klasördeki <code>*.csv</code> dosyalarının SHA-256 özetini (64 KB\'lık parçalarla okuyarak) hesaplasın; özeti <code>manifest</code> sözlüğünde (özet → dosya adı) olmayanları ada göre sıralı döndürsün ve manifest\'e eklesin. Aynı çalıştırmada aynı içerikli iki dosya varsa yalnız adı alfabetik olarak önce geleni döndür.</p>', start: 'import hashlib\nfrom pathlib import Path\n\ndef yeni_dosyalar(klasor, manifest):\n    pass\n', sol: 'import hashlib\nfrom pathlib import Path\n\ndef _ozet(yol):\n    h = hashlib.sha256()\n    with open(yol, "rb") as f:\n        for parca in iter(lambda: f.read(65536), b""):\n            h.update(parca)\n    return h.hexdigest()\n\ndef yeni_dosyalar(klasor, manifest):\n    sonuc = []\n    for yol in sorted(Path(klasor).glob("*.csv")):\n        oz = _ozet(yol)\n        if oz not in manifest:\n            manifest[oz] = yol.name\n            sonuc.append(yol)\n    return sonuc\n', tests: 'from pathlib import Path\nimport hashlib\nk = Path("manifest_test"); k.mkdir(exist_ok=True)\nfor p in k.iterdir(): p.unlink()\n(k / "satis_01.csv").write_text("no,tutar\\n1,10\\n", encoding="utf-8")\n(k / "satis_02.csv").write_text("no,tutar\\n2,20\\n", encoding="utf-8")\n(k / "satis_01_kopya.csv").write_text("no,tutar\\n1,10\\n", encoding="utf-8")\n(k / "not.txt").write_text("x")\nm = {}\nassert [p.name for p in yeni_dosyalar(k, m)] == ["satis_01.csv", "satis_02.csv"], "Kopya içerik ve csv olmayan dosya atlanmalı"\nassert m[hashlib.sha256(b"no,tutar\\n2,20\\n").hexdigest()] == "satis_02.csv", "Manifest özet → ad tutmalı"\nassert yeni_dosyalar(k, m) == [], "İkinci çalıştırmada yeni dosya yok"\n(k / "satis_03.csv").write_text("no,tutar\\n3,30\\n", encoding="utf-8")\nassert [p.name for p in yeni_dosyalar(k, m)] == ["satis_03.csv"]\n', hints: [
        'sorted(Path(klasor).glob("*.csv")) ada göre sıralı yol listesi verir.',
        'iter(lambda: f.read(65536), b"") dosyayı parçalar hâlinde okur; her parçayla h.update çağır.'
      ], why: 'Kaynak sistem aynı dosyayı farklı adla tekrar gönderebilir. Ada değil içeriğe bakmak mükerrer yüklemeyi kökten engeller; manifest gerçekte bir tabloda saklanır.' },
    { t: 'code', stage: 'Hata avı', id: 'veri-boru-hatti-x6', kind: 'bug', diff: 1, q: '<p>Hatayı bul ve düzelt. <code>calistir(metin, con)</code> CSV metnini okuyup satır sayısını loglamak için sayıyor, sonra yüklüyor. Log doğru sayıyı gösteriyor ama tabloya <b>hiç</b> satır yazılmıyor. Fonksiyon <code>(okunan, yuklenen)</code> döndürmeli ve iki sayı eşit olmalı; veriyi belleğe tümüyle toplamadan (tek geçişte) çöz.</p>', start: 'import csv, io\n\ndef calistir(metin, con):\n    satirlar = (r for r in csv.DictReader(io.StringIO(metin)))\n    okunan = sum(1 for _ in satirlar)\n    print("okunan satır:", okunan)\n    yuklenen = 0\n    for r in satirlar:\n        con.execute("INSERT INTO satis VALUES (?, ?)", (int(r["no"]), r["sehir"]))\n        yuklenen += 1\n    con.commit()\n    return okunan, yuklenen\n', sol: 'import csv, io\n\ndef calistir(metin, con):\n    satirlar = (r for r in csv.DictReader(io.StringIO(metin)))\n    okunan = yuklenen = 0\n    for r in satirlar:\n        okunan += 1\n        con.execute("INSERT INTO satis VALUES (?, ?)", (int(r["no"]), r["sehir"]))\n        yuklenen += 1\n    con.commit()\n    print("okunan satır:", okunan)\n    return okunan, yuklenen\n', tests: 'import sqlite3\ncon = sqlite3.connect(":memory:")\ncon.execute("CREATE TABLE satis(no INTEGER, sehir TEXT)")\nassert calistir("no,sehir\\n1,İzmir\\n2,Bursa\\n3,Ankara\\n", con) == (3, 3), "Okunan ve yüklenen 3 olmalı"\nassert con.execute("SELECT COUNT(*) FROM satis").fetchone()[0] == 3, "Tabloda 3 satır olmalı"\nassert "list(" not in __source__, "Belleğe toplamadan, tek geçişte say ve yükle"\n', hints: [
        'Üreteç bir kez tüketilince boşalır; sum(1 for _ in satirlar) onu bitirdi.',
        'Saymayı yükleme döngüsünün içine taşı.'
      ], why: 'Akış tabanlı boru hatlarında her ölçüm aynı geçişte yapılmalıdır. İkinci kez okumak gerekiyorsa kaynağı yeniden açmak gerekir; üreteci "geri sarmak" mümkün değildir.' },
    { t: 'code', stage: 'Hata avı', id: 'veri-boru-hatti-x7', kind: 'bug', diff: 2, q: '<p>Hatayı bul ve düzelt. Kaynak sistem aynı müşteri için birden çok güncelleme gönderiyor. <code>tekillestir(kayitlar)</code> her <code>musteri_id</code> için <b>en son güncellenen</b> (<code>guncellenme</code> en büyük) kaydı tutmalı ve sonucu <code>musteri_id</code>\'ye göre sıralı döndürmeli. Mevcut kod bazı müşterilerde eski adresi bırakıyor.</p>', start: 'def tekillestir(kayitlar):\n    son = {}\n    for k in sorted(kayitlar, key=lambda k: k["guncellenme"], reverse=True):\n        son[k["musteri_id"]] = k\n    return [son[m] for m in sorted(son)]\n', sol: 'def tekillestir(kayitlar):\n    son = {}\n    for k in kayitlar:\n        m = k["musteri_id"]\n        if m not in son or k["guncellenme"] > son[m]["guncellenme"]:\n            son[m] = k\n    return [son[m] for m in sorted(son)]\n', tests: 'veri = [\n    {"musteri_id": 2, "sehir": "Bursa", "guncellenme": "2024-05-01"},\n    {"musteri_id": 1, "sehir": "İzmir", "guncellenme": "2024-05-03"},\n    {"musteri_id": 1, "sehir": "Ankara", "guncellenme": "2024-05-01"},\n    {"musteri_id": 2, "sehir": "Antalya", "guncellenme": "2024-05-04"},\n]\nassert [(k["musteri_id"], k["sehir"]) for k in tekillestir(veri)] == [(1, "İzmir"), (2, "Antalya")], "Her müşteri için en son güncelleme kalmalı"\nassert tekillestir([]) == []\n', hints: [
        'Sözlükte son yazan kazanır; azalan sıralamada en son yazılan en ESKİ kayıttır.',
        'Ya artan sırala ya da her kayıtta zamanları karşılaştırarak yalnız daha yeniyse üzerine yaz.'
      ], why: '"Son yazan kazanır" sözlük davranışını sıralamayla birleştirirken yön kritik. Açık karşılaştırma niyeti belgeler ve sıralama maliyetini de kaldırır.' },
    { t: 'code', stage: 'Meydan okuma', id: 'veri-boru-hatti-x8', diff: 3, q: '<p>Yavaş değişen boyut, tip 2 (SCD2). <code>musteri_boyut(musteri_id INTEGER, sehir TEXT, segment TEXT, gecerli_baslangic TEXT, gecerli_bitis TEXT, guncel INTEGER)</code> tablosu sqlite\'ta hazır. <code>scd2_uygula(con, kayitlar, tarih) -&gt; dict</code> yaz; <code>kayitlar</code> <code>{"musteri_id", "sehir", "segment"}</code> sözlükleri, <code>tarih</code> ISO metin. Her kayıt için:</p><ul><li>Müşterinin güncel satırı yoksa: yeni satır ekle (<code>gecerli_baslangic=tarih</code>, <code>gecerli_bitis=NULL</code>, <code>guncel=1</code>) → <code>eklenen</code></li><li>Güncel satır var ve sehir ya da segment farklıysa: eskiyi kapat (<code>gecerli_bitis=tarih</code>, <code>guncel=0</code>), yeni sürümü ekle → <code>degisen</code></li><li>Aynıysa hiçbir şey yapma → <code>ayni</code></li></ul><p>Tüm işlem tek bir işlemde (transaction) olsun; herhangi bir kayıtta hata olursa (ör. <code>musteri_id</code> anahtarı eksik) hiçbir değişiklik kalmasın ve hata yükselsin. <code>{"eklenen": .., "degisen": .., "ayni": ..}</code> döndür. Aynı kayıtlarla ikinci çalıştırma hiçbir şey değiştirmemeli (idempotent).</p>', start: 'def scd2_uygula(con, kayitlar, tarih):\n    pass\n', sol: 'def scd2_uygula(con, kayitlar, tarih):\n    sayac = {"eklenen": 0, "degisen": 0, "ayni": 0}\n    with con:\n        for k in kayitlar:\n            mid = k["musteri_id"]\n            mevcut = con.execute(\n                "SELECT sehir, segment FROM musteri_boyut WHERE musteri_id = ? AND guncel = 1", (mid,)\n            ).fetchone()\n            if mevcut == (k["sehir"], k["segment"]):\n                sayac["ayni"] += 1\n                continue\n            if mevcut is not None:\n                con.execute(\n                    "UPDATE musteri_boyut SET gecerli_bitis = ?, guncel = 0 WHERE musteri_id = ? AND guncel = 1",\n                    (tarih, mid),\n                )\n                sayac["degisen"] += 1\n            else:\n                sayac["eklenen"] += 1\n            con.execute(\n                "INSERT INTO musteri_boyut VALUES (?, ?, ?, ?, NULL, 1)",\n                (mid, k["sehir"], k["segment"], tarih),\n            )\n    return sayac\n', tests: 'import sqlite3\ncon = sqlite3.connect(":memory:")\ncon.execute("CREATE TABLE musteri_boyut(musteri_id INTEGER, sehir TEXT, segment TEXT, gecerli_baslangic TEXT, gecerli_bitis TEXT, guncel INTEGER)")\nilk = [{"musteri_id": 1, "sehir": "İzmir", "segment": "bireysel"}, {"musteri_id": 2, "sehir": "Bursa", "segment": "kobi"}]\nassert scd2_uygula(con, ilk, "2024-01-01") == {"eklenen": 2, "degisen": 0, "ayni": 0}\nikinci = [{"musteri_id": 1, "sehir": "Ankara", "segment": "bireysel"}, {"musteri_id": 2, "sehir": "Bursa", "segment": "kobi"}, {"musteri_id": 3, "sehir": "İzmir", "segment": "kurumsal"}]\nassert scd2_uygula(con, ikinci, "2024-03-15") == {"eklenen": 1, "degisen": 1, "ayni": 1}\nsatirlar = con.execute("SELECT musteri_id, sehir, gecerli_baslangic, gecerli_bitis, guncel FROM musteri_boyut ORDER BY musteri_id, gecerli_baslangic").fetchall()\nassert satirlar == [(1, "İzmir", "2024-01-01", "2024-03-15", 0), (1, "Ankara", "2024-03-15", None, 1), (2, "Bursa", "2024-01-01", None, 1), (3, "İzmir", "2024-03-15", None, 1)], f"SCD2 tablosu yanlış: {satirlar}"\nassert scd2_uygula(con, ikinci, "2024-03-16") == {"eklenen": 0, "degisen": 0, "ayni": 3}, "Aynı veriyle tekrar çalıştırma değişiklik yapmamalı"\nonce = con.execute("SELECT COUNT(*) FROM musteri_boyut").fetchone()[0]\ntry:\n    scd2_uygula(con, [{"musteri_id": 1, "sehir": "Muğla", "segment": "bireysel"}, {"sehir": "x", "segment": "y"}], "2024-04-01")\n    raise AssertionError("Eksik musteri_id KeyError vermeli")\nexcept KeyError:\n    pass\nassert con.execute("SELECT COUNT(*) FROM musteri_boyut").fetchone()[0] == once, "Hata olunca tüm işlem geri alınmalı"\nassert con.execute("SELECT sehir FROM musteri_boyut WHERE musteri_id = 1 AND guncel = 1").fetchone() == ("Ankara",)\nassert con.execute("SELECT sehir FROM musteri_boyut WHERE musteri_id = 1 AND \'2024-02-01\' >= gecerli_baslangic AND (gecerli_bitis IS NULL OR \'2024-02-01\' < gecerli_bitis)").fetchone() == ("İzmir",), "Şubat 2024\'te müşteri 1 İzmir\'deydi"\n', hints: [
        'Her kayıt için guncel = 1 satırını (sehir, segment) olarak çek ve yeni değerlerle demet olarak karşılaştır.',
        'Değişiklik varsa önce UPDATE ile kapat, sonra INSERT ile yeni sürümü aç.',
        'Tüm döngüyü tek bir with con: bloğuna koy; içeride bir istisna olursa sqlite3 rollback yapar.'
      ], why: 'SCD2 veri ambarlarının temel tekniğidir: "o tarihte doğru olan değer" sorusunu yanıtlar. Tek işlem, yarım kalan çalıştırmanın boyut tablosunu tutarsız bırakmasını engeller.' }
  ],
  faq: [
    { q: 'ETL mi ELT mi?', a: 'ETL veriyi yüklemeden önce Python\'da dönüştürür. ELT ham veriyi önce ambara (BigQuery, Snowflake, DuckDB) yükler, dönüşümü orada SQL ile yapar; dbt bu yaklaşımın yaygın aracıdır. Ambar güçlüyse ELT daha ölçeklenir ve ham veriyi saklar; hassas veriyi ambara girmeden maskelemen gerekiyorsa dönüşümün bir kısmı yine ETL\'de kalır.' },
    { q: 'Watermark değerini nerede saklamalıyım?', a: 'Hedef veritabanında küçük bir durum tablosunda (iş adı, watermark, güncellenme zamanı) saklamak en güvenlisidir; yükleme ile watermark güncellemesini aynı işlemde (transaction) yapabilirsin. Yerel bir JSON dosyası tek makinede çalışır ama konteyner yeniden başlayınca kaybolabilir.' }
  ],
  mistakes: [
    { bad: 'satirlar = list(csv.DictReader(open("10GB.csv")))\nfor s in satirlar:\n    con.execute("INSERT ...", s)\n    con.commit()', good: 'with open("10GB.csv", newline="", encoding="utf-8") as f:\n    for parti in batched(csv.DictReader(f), 1000):\n        with con:\n            con.executemany("INSERT ...", parti)', why: 'Tüm dosyayı belleğe almak ve her satırda commit etmek hem belleği tüketir hem binlerce kat yavaştır. Akış + parti başına işlem standarttır.' },
    { bad: 'durum["watermark"] = simdi()\nyukle(cek(son=eski_watermark))', good: 'kayitlar = cek(son=durum["watermark"])\nyukle(kayitlar)\ndurum["watermark"] = max(k["guncellenme"] for k in kayitlar)', why: 'Watermark yükleme bitmeden ya da duvar saatiyle ilerletilirse hata ve saat farkları kayıt kaybına yol açar. Başarıdan sonra, veriden alınan değerle ilerlet.' }
  ]
}
);
})(window);
